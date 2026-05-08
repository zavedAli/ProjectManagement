import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'Main workspace for Acme Corporation',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: john.id, role: 'admin' },
          { userId: jane.id, role: 'member' },
        ],
      },
    },
  });

  // Create projects
  const webProject = await prisma.project.upsert({
    where: { workspaceId_key: { workspaceId: workspace.id, key: 'WEB' } },
    update: {},
    create: {
      name: 'Website Redesign',
      key: 'WEB',
      description: 'Complete redesign of company website',
      workspaceId: workspace.id,
      createdById: admin.id,
    },
  });

  const mobileProject = await prisma.project.upsert({
    where: { workspaceId_key: { workspaceId: workspace.id, key: 'MOB' } },
    update: {},
    create: {
      name: 'Mobile App',
      key: 'MOB',
      description: 'iOS and Android mobile application',
      workspaceId: workspace.id,
      createdById: admin.id,
    },
  });

  // Create labels
  const bugLabel = await prisma.label.create({
    data: { name: 'Bug', color: '#ef4444' },
  });

  const featureLabel = await prisma.label.create({
    data: { name: 'Feature', color: '#3b82f6' },
  });

  const urgentLabel = await prisma.label.create({
    data: { name: 'Urgent', color: '#f59e0b' },
  });

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Design homepage mockup',
      description: 'Create high-fidelity mockups for the new homepage',
      status: 'in_progress',
      priority: 'high',
      projectId: webProject.id,
      assigneeId: jane.id,
      createdById: admin.id,
      position: 1,
      labels: { create: { labelId: featureLabel.id } },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Fix navigation menu bug',
      description: 'Menu not closing on mobile devices',
      status: 'todo',
      priority: 'urgent',
      projectId: webProject.id,
      assigneeId: john.id,
      createdById: admin.id,
      position: 2,
      labels: { create: [{ labelId: bugLabel.id }, { labelId: urgentLabel.id }] },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Add JWT-based authentication flow',
      status: 'done',
      priority: 'high',
      projectId: mobileProject.id,
      assigneeId: john.id,
      createdById: admin.id,
      position: 1,
      labels: { create: { labelId: featureLabel.id } },
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'I have started working on the mockups. Will share the first draft by EOD.',
      taskId: task1.id,
      userId: jane.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Great! Looking forward to seeing them.',
      taskId: task1.id,
      userId: admin.id,
    },
  });

  // Create activities
  await prisma.activity.createMany({
    data: [
      {
        type: 'created',
        content: 'created this task',
        taskId: task1.id,
        userId: admin.id,
      },
      {
        type: 'assigned',
        content: 'assigned to Jane Smith',
        taskId: task1.id,
        userId: admin.id,
      },
      {
        type: 'status_changed',
        content: 'changed status from todo to in_progress',
        taskId: task1.id,
        userId: jane.id,
      },
    ],
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        type: 'task_assigned',
        title: 'New task assigned',
        message: 'You have been assigned to "Design homepage mockup"',
        userId: jane.id,
      },
      {
        type: 'task_assigned',
        title: 'New task assigned',
        message: 'You have been assigned to "Fix navigation menu bug"',
        userId: john.id,
      },
      {
        type: 'comment',
        title: 'New comment',
        message: 'Jane Smith commented on "Design homepage mockup"',
        userId: admin.id,
        read: true,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Test credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
