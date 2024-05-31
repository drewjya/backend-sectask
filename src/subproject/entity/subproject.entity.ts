export type AddSubproject = {
  projectId: number;
  subproject: {
    subprojectId: number;
    name: string;
    starDate: Date;
    endDate: Date;
  };
  type: string;
};
