import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const roundsOfHashing = 10;
export async function hashPassword(value: string) {
  const hashed = await bcrypt.hash(value, roundsOfHashing);
  return hashed;
}
type DefaultUser = {
  aisyah: User;
  andre: User;
  william: User;
  faqih: User;
  rehan: User;
  dian: User;
  ryan: User;
  vian: User;
  vina: User;
  lia: User;
};

const prisma = new PrismaClient();

const seedUser = async () => {
  const password = await hashPassword('password');
  const name = [
    'aisyah',
    'andre',
    'william',
    'faqih',
    'rehan',
    'dian',
    'ryan',
    'vian',
    'vina',
    'lia',
  ];
  const data = name.map((e) => {
    return {
      email: `${e}@email.com`,
      name: e,
      password,
    };
  });
  let users: any = new Object();
  for (const iterator of data) {
    const user = await prisma.user.create({
      data: iterator,
    });

    users[iterator.name] = user;
  }
  const newUser = users as DefaultUser;
  return newUser;
};

const seedProject = async (userId: number) => { }


const main = async () => {
  const users = await seedUser();
};

main();
