import { PrismaClient } from '@prisma/client';
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
}

async function seedProject() {}

async function main() {
  seedUser();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
