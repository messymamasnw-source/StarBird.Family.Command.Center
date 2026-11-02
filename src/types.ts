export type HouseholdRole = 'OWNER' | 'PARENT' | 'ADULT_HELPER' | 'CHILD';

export type UserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
};

export type HouseholdRecord = {
  id: string;
  name: string;
  members: Array<{
    id: string;
    userId: string;
    role: HouseholdRole;
    user: UserRecord;
  }>;
};

export type EventRecord = {
  id: string;
  title: string;
  dateTime: string;
  location?: string | null;
  participants?: string | null;
  responsibleAdultId?: string | null;
  responsibleAdult?: UserRecord | null;
  transportation?: string | null;
  preparation?: string | null;
  travelTimeMinutes?: number | null;
  reminderMinutes?: number | null;
  recurrence?: string | null;
  notes?: string | null;
};

export type TaskRecord = {
  id: string;
  title: string;
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: UserRecord | null;
  recurrence?: string | null;
  notes?: string | null;
  completed: boolean;
};

export type ChildRecord = {
  id: string;
  firstName: string;
  lastName?: string | null;
  nickName?: string | null;
  gradeLevel?: string | null;
  schoolId?: string | null;
  school?: { id: string; name: string } | null;
  careNotes?: string | null;
};

export type SchoolRecord = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
};

export type ResponsibilityRecord = {
  id: string;
  title: string;
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: UserRecord | null;
  childId?: string | null;
  child?: ChildRecord | null;
  notes?: string | null;
  status: string;
};

export type DashboardData = {
  greeting: string;
  dateLabel: string;
  topPriorities: Array<{ id: string; title: string; kind: string; when: string; details: string }>;
  appointments: EventRecord[];
  responsibilities: ResponsibilityRecord[];
  tasks: TaskRecord[];
  children: ChildRecord[];
  schools: SchoolRecord[];
  conflicts: string[];
  waitList: string[];
};
