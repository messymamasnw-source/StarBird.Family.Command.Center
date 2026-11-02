import { prisma } from './db';
import { hashPassword } from './auth';

export async function seedData() {
  const householdCount = await prisma.household.count();
  if (householdCount > 0) return;

  const passwordHash = await hashPassword('Password123!');
  const household = await prisma.household.create({
    data: {
      name: 'The Family',
      members: {
        create: [{
          user: {
            create: {
              email: 'admin@starbird.family',
              passwordHash,
              firstName: 'Alex',
              lastName: 'Morgan',
            },
          },
          role: 'OWNER',
        }],
      },
    },
    include: { members: true },
  });

  const user = await prisma.user.findUnique({ where: { email: 'admin@starbird.family' } });

  if (user) {
    await prisma.school.create({
      data: {
        householdId: household.id,
        name: 'Oak Valley Academy',
        address: '18 Walnut Lane',
        phone: '(555) 023-4411',
      },
    });

    await prisma.child.create({
      data: {
        householdId: household.id,
        firstName: 'Emma',
        lastName: 'Morgan',
        gradeLevel: '7th Grade',
        careNotes: 'Needs school pickup on Tuesday and Thursday.',
      },
    });

    await prisma.task.create({
      data: {
        householdId: household.id,
        title: 'Review weekly planner',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        notes: 'Finalize daily schedule and transportation plans.',
      },
    });

    await prisma.calendarEvent.create({
      data: {
        householdId: household.id,
        title: 'School pickup window',
        dateTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
        location: 'Oak Valley Academy',
        participants: 'Emma, Alex',
        transportation: 'SUV',
        preparation: 'Pack snacks and check homework folder.',
        travelTimeMinutes: 20,
        reminderMinutes: 30,
      },
    });
  }
}
