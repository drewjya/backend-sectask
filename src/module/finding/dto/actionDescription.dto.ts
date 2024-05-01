import { ApiProperty } from '@nestjs/swagger';
import { BlockType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum Action {
  ADD = 'ADD',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export enum BlockContentType {
  DESCRIPTION = 'DESCRIPTION',
  THREAT = 'THREAT',
  IMPACT = 'IMPACT',
  RECOMMENDATION = 'RECOMMENDATION',
  RETEST = 'RETEST',
}

export const getIncludeAndConditionAdd = (params: {
  contentType: BlockContentType;
  findingId: number;
}) => {
  const { contentType, findingId } = params;
  let condition;
  let include = {
    nextBlock: true,
    findingDescriptions: false,
    findingBusinessImpact: false,
    findingRecomendation: false,
    findingRetestResult: false,
    findingThreatAndRisk: false,
  };
  switch (contentType) {
    case BlockContentType.DESCRIPTION:
      condition = {
        AND: {
          findingDescriptions: {
            some: {
              id: findingId,
            },
          },
        },
      };
      include.findingDescriptions = true;
      break;

    case BlockContentType.THREAT:
      condition = {
        AND: {
          findingThreatAndRisk: {
            some: {
              id: findingId,
            },
          },
        },
      };
      include.findingThreatAndRisk = true;
      break;

    case BlockContentType.IMPACT:
      condition = {
        AND: {
          findingBusinessImpact: {
            some: {
              id: findingId,
            },
          },
        },
      };
      include.findingBusinessImpact = true;
      break;

    case BlockContentType.RECOMMENDATION:
      condition = {
        AND: {
          findingRecomendation: {
            some: {
              id: findingId,
            },
          },
        },
      };
      include.findingRecomendation = true;
      break;

    case BlockContentType.RETEST:
      condition = {
        AND: {
          findingRetestResult: {
            some: {
              id: findingId,
            },
          },
        },
      };
      include.findingRetestResult = true;
      break;
  }

  return { condition, include };
};

export type FetchOldBlock = {
  nextBlock: {
    id: string;
  };
  id: string;
  content: string;
  type: BlockType;
  fileId?: number;
  isChecked: boolean;
  previousBlockId?: string;
};

export const getDataAdd = (params: {
  blockId?: string;
  content: string;
  contentType: BlockContentType;
  findingId: number;
}) => {
  const { blockId, content, contentType, findingId } = params;
  let data: any = {
    content: content,
  };
  if (blockId) {
    data.previousBlock = {
      connect: { id: blockId },
    };
  }

  switch (contentType) {
    case BlockContentType.DESCRIPTION:
      data.findingDescriptions = {
        connect: { id: findingId },
      };
      break;

    case BlockContentType.THREAT:
      data.findingThreatAndRisk = {
        connect: { id: findingId },
      };
      break;

    case BlockContentType.IMPACT:
      data.findingBusinessImpact = {
        connect: { id: findingId },
      };
      break;

    case BlockContentType.RECOMMENDATION:
      data.findingRecomendation = {
        connect: { id: findingId },
      };
      break;

    case BlockContentType.RETEST:
      data.findingRetestResult = {
        connect: { id: findingId },
      };
      break;
  }
  return data;
};

export const conditionDelete = (params: {
  findingId: number;
  contentType: BlockContentType;
}) => {
  const { findingId, contentType } = params;
  let data;

  switch (contentType) {
    case BlockContentType.DESCRIPTION:
      data = {
        findingDescriptions: {
          some: {
            id: findingId,
          },
        },
      };
      break;
    case BlockContentType.IMPACT:
      data = {
        findingBusinessImpact: {
          some: {
            id: findingId,
          },
        },
      };
      break;
    case BlockContentType.RECOMMENDATION:
      data = {
        findingRecomendation: {
          some: {
            id: findingId,
          },
        },
      };
      break;
    case BlockContentType.RETEST:
      data = {
        findingRetestResult: {
          some: {
            id: findingId,
          },
        },
      };
      break;
    case BlockContentType.THREAT:
      data = {
        findingThreatAndRisk: {
          some: {
            id: findingId,
          },
        },
      };
      break;
  }
  return data;
};

export class ActionDescriptionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  content: string;

  @ApiProperty()
  @IsOptional()
  previousBlockId?: string;

  @ApiProperty()
  @IsEnum(Action)
  action: Action;

  @ApiProperty()
  @IsOptional()
  blockId?: string;

  @ApiProperty()
  @IsEnum(BlockType)
  blockType: BlockType;

  @ApiProperty()
  @IsEnum(BlockContentType)
  contentType: BlockContentType;
}
