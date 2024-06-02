import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, Project, ProjectLog, ProjectRole, User, File, SubProject, SubProjectLog } from '@prisma/client';
import { ProjectSubprojectEvent } from 'src/subproject/entity/subproject.entity';
import { EventFile } from 'src/types/file';
import { EventLogData, ProjectEventHeader, SubprojectEventHeader } from 'src/types/header';
import { EventMember, EventSubprojectMember } from 'src/types/member';
import { EventSidebarProject, EventSidebarSubproject } from 'src/types/sidebar';
import { PROJECT_ON_MESSAGE, SUBPROJECT_ON_MESSAGE } from 'src/utils/event';

export interface ProjectWithPicture extends Project {
    projectPicture?: File
}

@Injectable()
export class OutputService {
    constructor(private emitter: EventEmitter2) { }

    projectLog(docId: number, data: ProjectLog) {
        const val: EventLogData = {
            docId: docId,
            data: {
                title: data.title,
                description: data.description,
                createdAt: data.createdAt
            }
        };
        this.emitter.emit(PROJECT_ON_MESSAGE.LOG, val);
    }

    projectSidebar(type: 'add' | 'remove' | 'edit', project: Project, userId: number[]) {
        const data: EventSidebarProject = {
            project: {
                projectId: project.id,
                name: project.name,
            },
            type: type,
            userId: userId
        }

        this.emitter.emit(PROJECT_ON_MESSAGE.SIDEBAR, data)
    }

    projectMember(type: 'add' | 'remove' | 'edit', projectId: number, role: ProjectRole, user: User) {
        const projectMember: EventMember = {
            docId: +projectId,
            type: type,
            member: {
                name: user.name,
                id: user.id,
                role: role,
            },
        };
        this.emitter.emit(PROJECT_ON_MESSAGE.MEMBER, projectMember);
    }



    projectHeader(project: ProjectWithPicture) {
        const newHeader: ProjectEventHeader = {
            name: project.name,
            startDate: project.startDate,
            endDate: project.endDate,
            projectId: project.id,
            picture: project.projectPicture
                ? {
                    contentType: project.projectPicture.contentType,
                    createdAt: project.projectPicture.createdAt,
                    id: project.projectPicture.id,
                    name: project.projectPicture.name,
                    originalName: project.projectPicture.originalName,
                }
                : undefined,
        };
        this.emitter.emit(PROJECT_ON_MESSAGE.HEADER, newHeader);
    }

    projectFile(type: 'report' | 'attachment' | 'Attachment' | 'Report', action: 'add' | 'remove', projectId: number, file: File) {
        const val: EventFile = {
            file: {
                contentType: file.contentType,
                createdAt: file.createdAt,
                id: file.id,
                name: file.name,
                originalName: file.originalName
            },
            projectId: projectId,
            type: action
        }
        if (type.toLowerCase() === 'report') {
            this.emitter.emit(PROJECT_ON_MESSAGE.REPORT, val);
        } else {
            this.emitter.emit(PROJECT_ON_MESSAGE.ATTACHMENT, val);
        }
    }

    projectSubproject(type:'add'|'edit',subproject:SubProject) { 
        const newEntity:ProjectSubprojectEvent = {
            type:type,
            projectId: subproject.projectId,
            subproject:{
                name: subproject.name,
                endDate: subproject.endDate,
                startDate: subproject.startDate,
                subprojectId: subproject.id,
            }
        }
        this.emitter.emit(PROJECT_ON_MESSAGE.SUBPROJECT, newEntity);
    }

    subprojectSidebar(type:'add'|'edit'|'remove', subproject:SubProject, userId: number[]) {
        const newVal: EventSidebarSubproject = {
            userId: userId,
            projectId: subproject.projectId,
            subproject: {
              subprojectId: subproject.id,
              name: subproject.name,
            },
            type: type,
          };
          this.emitter.emit(SUBPROJECT_ON_MESSAGE.SIDEBAR, newVal);
     }

    subprojectHeader(subproject:SubProject){
        const newHeader: SubprojectEventHeader = {
            name: subproject.name,
            startDate: subproject.startDate,
            endDate: subproject.endDate,
            subprojectId: subproject.id,
          };
          this.emitter.emit(SUBPROJECT_ON_MESSAGE.HEADER, newHeader);
    }

    subprojectMember(type: 'add' | 'remove' | 'promote'| 'demote', subprojectId: number[], role: ProjectRole, user: User) {
        const subprojectMember: EventSubprojectMember = {
            subprojectId: subprojectId,
            type: type,
            member: {
                id: user.id,
                name: user.name,
                role: role,
            },
        };
        this.emitter.emit(SUBPROJECT_ON_MESSAGE.MEMBER, subprojectMember);
    }

    subprojectFile(type: 'report' | 'attachment' | 'Attachment' | 'Report', action: 'add' | 'remove', subprojectId: number, file: File) {
        const val: EventFile = {
            file: {
                contentType: file.contentType,
                createdAt: file.createdAt,
                id: file.id,
                name: file.name,
                originalName: file.originalName
            },
            projectId: subprojectId,
            type: action
        }
        if (type.toLowerCase() === 'report') {
            this.emitter.emit(SUBPROJECT_ON_MESSAGE.REPORT, val);
        } else {
            this.emitter.emit(SUBPROJECT_ON_MESSAGE.ATTACHMENT, val);
        }
    }

    subprojectLog(docId: number, data: SubProjectLog) {
        const val: EventLogData = {
            docId: docId,
            data: {
                title: data.title,
                description: data.description,
                createdAt: data.createdAt
            }
        };
        
        this.emitter.emit(SUBPROJECT_ON_MESSAGE.LOG, val);
    }

    subprojectFinding(){}

    findingSidebar(){}

    findingHeader(){}

    findingCvss(){}

    findingFProp(){}

    findingCVSS(){}

    

}
