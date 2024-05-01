import {
  PrismaClient,
  ProjectRole,
  SubprojectRole,
  User,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUser() {
  const password = await bcrypt.hash('password', 10);
  const andre = await prisma.user.upsert({
    where: { email: 'andre@email.com' },
    update: {},
    create: {
      email: 'andre@email.com',
      name: 'Andre',
      password: password,
    },
  });
  const william = await prisma.user.upsert({
    where: { email: 'william@email.com' },
    update: {},
    create: {
      email: 'william@email.com',
      name: 'William',
      password: password,
    },
  });
  const aicha = await prisma.user.upsert({
    where: { email: 'aicha@email.com' },
    update: {},
    create: {
      email: 'aicha@email.com',
      name: 'Aicha',
      password: password,
    },
  });
  const rehan = await prisma.user.upsert({
    where: { email: 'rehan@email.com' },
    update: {},
    create: {
      email: 'rehan@email.com',
      name: 'Rehan',
      password: password,
    },
  });
  const faqih = await prisma.user.upsert({
    where: { email: 'faqih@email.com' },
    update: {},
    create: {
      email: 'faqih@email.com',
      name: 'Faqih',
      password: password,
    },
  });
  const jason = await prisma.user.upsert({
    where: { email: 'jason@email.com' },
    update: {},
    create: {
      email: 'jason@email.com',
      name: 'Jason',
      password: password,
    },
  });
  return {
    andre,
    jason,
    william,
    aicha,
    faqih,
    rehan,
  };
}

async function seedProject(
  owner: User,
  member: {
    user: User;
    role: ProjectRole;
    subprojectRole: SubprojectRole;
  }[],
) {
  const projectsRole = member.map((e) => {
    return {
      role: e.role,
      memberId: e.user.id,
    };
  });

  const subprojectRole = member.map((e) => {
    return {
      role: e.subprojectRole,
      userId: e.user.id,
    };
  });
  await prisma.project.create({
    data: {
      startDate: new Date(),
      endDate: new Date(2024, 12, 1),
      name: 'Project 1',
      archived: false,
      members: {
        createMany: {
          data: [{ role: 'OWNER', memberId: owner.id }, ...projectsRole],
        },
      },
      subProjects: {
        create: {
          name: 'Subproject 1',
          endDate: new Date(),
          startDate: new Date(2024, 6, 1),
          chatRoom: {
            create: {},
          },
          members: {
            create: [
              {
                role: 'PM',
                userId: owner.id,
              },
              ...subprojectRole,
            ],
          },
          reports: {},
          recentActivities: {
            create: {
              title: `SubProject [Subproject 1] Created`,
              description: `SubProject [Subproject 1] has been created by [${member[0].user.name}]`,
            },
          },
        },
      },

      reports: {},
      recentActivities: {
        create: {
          title: `Project [Project 1] Created`,
          description: `Project [Project 1] has been created by [${owner.name}]`,
        },
      },
    },
  });
}

async function main() {
  const users = await seedUser();
  seedProject(users.aicha, [
    { user: users.andre, role: 'DEVELOPER', subprojectRole: 'DEVELOPER' },
    { user: users.william, role: 'VIEWER', subprojectRole: 'CONSULTANT' },
    {
      user: users.faqih,
      role: 'TECHNICAL_WRITER',
      subprojectRole: 'TECHNICAL_WRITER',
    },
    { user: users.jason, role: 'VIEWER', subprojectRole: 'GUEST' },
    { user: users.rehan, role: 'VIEWER', subprojectRole: 'CONSULTANT' },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
