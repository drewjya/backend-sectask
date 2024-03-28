import { Block } from '@prisma/client';

export interface AllBlock extends Block {
  previousBlock?: Block;
  nextBlock?: Block;
}
