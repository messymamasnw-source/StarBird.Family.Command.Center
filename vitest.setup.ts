import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config';
import { prisma } from './db';
import { comparePassword, hashPassword, issueToken, requireAuth, requireHouseholdAccess } from './auth';
import { childSchema, eventSchema, responsibilitySchema, schoolSchema, signinSchema, signupSchema, taskSchema } from './validation';
import { seedData } from './seed';

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, env: config.nodeEnv });
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid signup payload' });
      }

      const { email, password, firstName, lastName, householdName } = parsed.data;
      const emailLower = email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: emailLower } });
      if (existing) {
        return res.status(409).json({ message: 'Account already exists' });
      }

      const user = await prisma.user.create({
        data: {
          email: emailLower,
          passwordHash: await hashPassword(password),
          firstName,
          lastName,
        },
      });

      const household = await prisma.household.create({
        data: {
          name: householdName,
          members: {
            create: [{ userId: user.id, role: 'OWNER' }],
          },
        },
        include: { members: { include: { user: true } } },
      });

      const token = issueToken({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      return res.status(201).json({ token, user: { id: user.id, email: user.email, firstName, lastName }, household });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Signup failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid login payload' });
      }

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !(await comparePassword(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const membership = await prisma.householdMembership.findFirst({ where: { userId: user.id }, include: { household: true } });
      const token = issueToken({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      return res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, household: membership?.household ?? null });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const membership = await prisma.householdMembership.findFirst({ where: { userId: user.id }, include: { household: { include: { members: { include: { user: true } } } } });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, household: membership?.household ?? null });
  });

  app.get('/api/households/me', requireAuth, async (req, res) => {
    const user = (req as any).user;
    const membership = await prisma.householdMembership.findFirst({
      where: { userId: user.id },
      include: { household: { include: { members: { include: { user: true } } } } },
    });

    if (!membership) return res.status(404).json({ message: 'No household found' });
    return res.json(membership.household);
  });

  app.get('/api/dashboard', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const householdId = user.householdId;
    const [appointments, tasks, responsibilities, children, schools, members] = await Promise.all([
      prisma.calendarEvent.findMany({ where: { householdId }, orderBy: { dateTime: 'asc' }, include: { responsibleAdult: true } }),
      prisma.task.findMany({ where: { householdId }, orderBy: { dueDate: 'asc' } }),
      prisma.responsibility.findMany({ where: { householdId }, orderBy: { dueDate: 'asc' }, include: { assignee: true, child: true } }),
      prisma.child.findMany({ where: { householdId }, include: { school: true } }),
      prisma.school.findMany({ where: { householdId } }),
      prisma.householdMembership.findMany({ where: { householdId }, include: { user: true } }),
    ]);

    const topPriorities = [
      { id: 'task-1', title: 'Review weekly planner', kind: 'Priority', when: 'Today, 9:00 AM', details: 'Finalize school and household coordination for the week.' },
      { id: 'task-2', title: 'Check pickup flow', kind: 'Responsibility', when: 'Today, 2:30 PM', details: 'Confirm after-school transportation and snack plan.' },
      { id: 'task-3', title: 'Prep for family appointments', kind: 'Schedule', when: 'Today, 6:00 PM', details: 'Collect notes, keys, and reminders before leave time.' },
    ];

    const conflicts = appointments.length > 1 ? ['Pickup overlap detected in the late afternoon.', 'Travel time may be too tight before the evening appointment.'] : [];

    return res.json({
      greeting: user.firstName ?? 'Mom',
      dateLabel: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      topPriorities,
      appointments,
      responsibilities,
      tasks,
      children,
      schools,
      members,
      conflicts,
      waitList: ['Finalize weekend grocery rotation', 'Review summer routine checklist'],
    });
  });

  app.get('/api/events', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const events = await prisma.calendarEvent.findMany({ where: { householdId: user.householdId }, orderBy: { dateTime: 'asc' } });
    return res.json(events);
  });

  app.post('/api/events', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid event payload' });

    const event = await prisma.calendarEvent.create({
      data: {
        householdId: user.householdId,
        title: parsed.data.title,
        dateTime: new Date(parsed.data.dateTime).toISOString(),
        location: parsed.data.location || null,
        participants: parsed.data.participants || null,
        transportation: parsed.data.transportation || null,
        preparation: parsed.data.preparation || null,
        travelTimeMinutes: parsed.data.travelTimeMinutes ?? null,
        reminderMinutes: parsed.data.reminderMinutes ?? null,
        recurrence: parsed.data.recurrence || null,
        notes: parsed.data.notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        householdId: user.householdId,
        userId: user.id,
        action: 'CREATE',
        entityType: 'CalendarEvent',
        entityId: event.id,
        details: `Created event ${event.title}`,
      },
    });

    return res.status(201).json(event);
  });

  app.put('/api/events/:id', requireAuth, requireHouseholdAccess, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid event payload' });

    const existing = await prisma.calendarEvent.findFirst({ where: { id, householdId: user.householdId } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    const event = await prisma.calendarEvent.update({ where: { id }, data: { ...parsed.data, dateTime: new Date(parsed.data.dateTime).toISOString() } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'UPDATE', entityType: 'CalendarEvent', entityId: event.id, details: `Updated event ${event.title}` } });
    return res.json(event);
  });

  app.delete('/api/events/:id', requireAuth, requireHouseholdAccess, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const existing = await prisma.calendarEvent.findFirst({ where: { id, householdId: user.householdId } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    await prisma.calendarEvent.delete({ where: { id } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'DELETE', entityType: 'CalendarEvent', entityId: id, details: `Deleted event ${existing.title}` } });
    return res.status(204).send();
  });

  app.get('/api/tasks', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const tasks = await prisma.task.findMany({ where: { householdId: user.householdId }, orderBy: { dueDate: 'asc' } });
    return res.json(tasks);
  });

  app.post('/api/tasks', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid task payload' });

    const dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate).toISOString() : null;
    const task = await prisma.task.create({ data: { householdId: user.householdId, title: parsed.data.title, dueDate, recurrence: parsed.data.recurrence || null, notes: parsed.data.notes || null, completed: parsed.data.completed ?? false } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'CREATE', entityType: 'Task', entityId: task.id, details: `Created task ${task.title}` } });
    return res.status(201).json(task);
  });

  app.put('/api/tasks/:id', requireAuth, requireHouseholdAccess, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid task payload' });

    const existing = await prisma.task.findFirst({ where: { id, householdId: user.householdId } });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const task = await prisma.task.update({ where: { id }, data: { title: parsed.data.title, dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate).toISOString() : null, recurrence: parsed.data.recurrence || null, notes: parsed.data.notes || null, completed: parsed.data.completed ?? existing.completed } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'UPDATE', entityType: 'Task', entityId: task.id, details: `Updated task ${task.title}` } });
    return res.json(task);
  });

  app.delete('/api/tasks/:id', requireAuth, requireHouseholdAccess, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const existing = await prisma.task.findFirst({ where: { id, householdId: user.householdId } });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    await prisma.task.delete({ where: { id } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'DELETE', entityType: 'Task', entityId: id, details: `Deleted task ${existing.title}` } });
    return res.status(204).send();
  });

  app.get('/api/children', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const children = await prisma.child.findMany({ where: { householdId: user.householdId }, include: { school: true } });
    return res.json(children);
  });

  app.post('/api/children', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const parsed = childSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid child payload' });

    const child = await prisma.child.create({ data: { householdId: user.householdId, firstName: parsed.data.firstName, lastName: parsed.data.lastName || null, gradeLevel: parsed.data.gradeLevel || null, careNotes: parsed.data.careNotes || null } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'CREATE', entityType: 'Child', entityId: child.id, details: `Created child ${child.firstName}` } });
    return res.status(201).json(child);
  });

  app.get('/api/schools', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const schools = await prisma.school.findMany({ where: { householdId: user.householdId } });
    return res.json(schools);
  });

  app.post('/api/schools', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const parsed = schoolSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid school payload' });

    const school = await prisma.school.create({
      data: {
        householdId: user.householdId,
        name: parsed.data.name,
        address: parsed.data.address || null,
        phone: parsed.data.phone || null,
        contactName: parsed.data.contactName || null,
        contactEmail: parsed.data.contactEmail || null,
      },
    });

    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'CREATE', entityType: 'School', entityId: school.id, details: `Created school ${school.name}` } });
    return res.status(201).json(school);
  });

  app.get('/api/responsibilities', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const responsibilities = await prisma.responsibility.findMany({ where: { householdId: user.householdId }, include: { assignee: true, child: true } });
    return res.json(responsibilities);
  });

  app.post('/api/responsibilities', requireAuth, requireHouseholdAccess, async (req, res) => {
    const user = (req as any).user;
    const parsed = responsibilitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid responsibility payload' });

    const responsibility = await prisma.responsibility.create({
      data: {
        householdId: user.householdId,
        title: parsed.data.title,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate).toISOString() : null,
        notes: parsed.data.notes || null,
        status: parsed.data.status || 'open',
      },
    });

    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'CREATE', entityType: 'Responsibility', entityId: responsibility.id, details: `Created responsibility ${responsibility.title}` } });
    return res.status(201).json(responsibility);
  });

  app.put('/api/responsibilities/:id', requireAuth, requireHouseholdAccess, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const parsed = responsibilitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid responsibility payload' });

    const existing = await prisma.responsibility.findFirst({ where: { id, householdId: user.householdId } });
    if (!existing) return res.status(404).json({ message: 'Responsibility not found' });

    const responsibility = await prisma.responsibility.update({ where: { id }, data: { title: parsed.data.title, dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate).toISOString() : null, notes: parsed.data.notes || null, status: parsed.data.status || existing.status } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'UPDATE', entityType: 'Responsibility', entityId: responsibility.id, details: `Updated responsibility ${responsibility.title}` } });
    return res.json(responsibility);
  });

  app.delete('/api/responsibilities/:id', requireAuth, requireHouseholdAccess, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;
    const existing = await prisma.responsibility.findFirst({ where: { id, householdId: user.householdId } });
    if (!existing) return res.status(404).json({ message: 'Responsibility not found' });

    await prisma.responsibility.delete({ where: { id } });
    await prisma.auditLog.create({ data: { householdId: user.householdId, userId: user.id, action: 'DELETE', entityType: 'Responsibility', entityId: id, details: `Deleted responsibility ${existing.title}` } });
    return res.status(204).send();
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    return res.status(500).json({ message: 'Unexpected server error' });
  });

  return app;
}

async function start() {
  await seedData();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`StarBird Family Command Center is listening on http://localhost:${config.port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  void start();
}
