import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// export const prismaExtendedClient = (prismaCLient: PrismaClient) =>
//   prismaCLient.$extends({
//     query: {
//       user: {
//         async $allOperations({ args, query, operation, model }) {
//           await prismaCLient.project.create({
//             data: {
//               name: 'test',
//               members: {
//                 create: {
//                   role: 'OWNER',
//                   userId: 1,
//                 },
//               },
//               reports: {},
//               recentActivities: {},
//               startDate: new Date(),
//               endDate: new Date(),
//               archived: false,
//             },
//           });

//           if (operation != 'create' && operation != 'update') {
//             return await query(args);
//           }
//           return await query(args);
//         },
//       },
//     },
//   });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // readonly extendedClient = prismaExtendedClient(this);
  constructor() {
    super();

    // new Proxy(this, {
    //   get: (target, property) =>
    //     Reflect.get(
    //       property in this.extendedClient ? this.extendedClient : target,
    //       property,
    //     ),
    // });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
