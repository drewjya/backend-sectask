import { Finding, Prisma, RecentActivities, SubProject } from '@prisma/client';

export type FindingCreateInput = {
  data: Prisma.FindingCreateInput;
  subproject: SubProject;
  userId: number;
};

export type FindingDetail = {
  id: string;
  content: string;
  previousBlockId: string;
  createdAt: Date;
  updatedAt: Date;
  nextBlock: {
    id: string;
  };
};

export interface ExtendedFinding extends Finding {
  description: FindingDetail[];
  businessImpact: FindingDetail[];
  threatAndRisk: FindingDetail[];
  recomendation: FindingDetail[];
  retestResult: FindingDetail[];
  recentActivities: RecentActivities;
  subProject: {
    id: number;
    projectId: number;
  };
}

export type FindingInfoResult<IncludeExtended extends boolean> =
  IncludeExtended extends true ? ExtendedFinding : Finding;

export type FindingGetParam<IncludeExtended extends boolean> = {
  findingId: number;
  whereMemberIs?: Prisma.SubprojectMemberWhereInput;
  include: IncludeExtended;
};

export type UpdateFinding = {
  application?: string;
  environment?: string;
  impact?: string;
  likelihood?: string;
  location?: string;
  method?: string;
  name?: string;
  risk?: string;
};
