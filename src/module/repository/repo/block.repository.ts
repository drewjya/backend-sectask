import { Injectable } from '@nestjs/common';
import { Block, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AllBlock } from '../../finding/type/block.type';

@Injectable()
export class BlockRepository {
  constructor(private prisma: PrismaService) {}

  updateBlock(params: {
    blockId: string;
    data: Prisma.BlockUpdateInput;
  }): Promise<Block> {
    const { blockId, data } = params;
    return this.prisma.block.update({
      where: {
        id: blockId,
      },
      data: data,
    });
  }

  deleteBlock(params: { id: string }): Promise<Block> {
    const { id } = params;
    return this.prisma.block.delete({ where: { id } });
  }

  createNewBlock(params: { data: Prisma.BlockCreateInput }): Promise<Block> {
    const { data } = params;
    return this.prisma.block.create({ data });
  }

  async getBlockById(params: {
    where: Prisma.BlockWhereInput;
  }): Promise<AllBlock> {
    const { where } = params;
    return this.prisma.block.findFirst({
      where: where,
      include: {
        nextBlock: true,
        previousBlock: true,
      },
    });
  }
}
