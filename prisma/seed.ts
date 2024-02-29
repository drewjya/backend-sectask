import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'andre@email.com' },
    update: {},
    create: {
      email: 'andre@email.com',
      name: 'Andre',
      password: password,
    },
  });
  const user2 = await prisma.user.upsert({
    where: { email: 'william@email.com' },
    update: {},
    create: {
      email: 'william@email.com',
      name: 'William',
      password: password,
    },
  });
  const user3 = await prisma.user.upsert({
    where: { email: 'aicha@email.com' },
    update: {},
    create: {
      email: 'aicha@email.com',
      name: 'Aicha',
      password: password,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
