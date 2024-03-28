import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class ProjectRepository{
    constructor(){}

    async createProject(params: { data: Prisma.ProjectCreateInput }) {}
    async getProjectById(params: { where: Prisma.ProjectWhereUniqueInput }) {}
    async updateProject(params: { projectId: number; data: Prisma.ProjectUpdateInput }) {}
    async deleteProject(params: { id: number }) {}
}