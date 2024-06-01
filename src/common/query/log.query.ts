import { PrismaClient } from "@prisma/client";
import  * as dayjs from "dayjs";

export class LogQuery {
    static createProject(param: {
        userName: string,
    }) {
        return {
            create: {
                title: `Created`,
                description: `<p><strong>${param.userName}</strong> created project.</p>`,
            },
        }
    }



    static archived(param:{
        projectId:number,
        projectName: string,
        userName: string
    }){
        return {
            data:{
                title: `Project Archived`,
                description: `<p>Project <strong>${param.projectName}</strong> has been archived by <strong>${param.userName}</strong></p>`,
                project:{
                    connect: {
                        id: param.projectId
                    }
                }
            }
        }
    }
    static addMemberProject(param: {
        memberName: string;
        projectId: number;
    }) {
        return {
            
                data: { 
                    title: `New Member`, 
                    description: `<p><strong>${param.memberName}</strong> is added to this project.</p>`,
                    project: {
                        connect: {
                            id: param.projectId
                        }
                    }
                },

            
        }
    }
    static removeMemberProject(param:{
        projectId: number;
        memberName: string
    }) { 
        return {            
                data: { 
                    title: `Member Removed`, 
                    description: `<p><strong>${param.memberName}</strong> is removed from this project</p>`,
                    project: {
                        connect: {
                            id: param.projectId
                        }
                    }
                },

        }
    }


    static addFileProject(param:{
        type:'File'|'Attachment'|'Report',
        userName: string;
        fileName: string;
        projectId: number
    }) { 
        return {
            data: {
              title: `New ${param.type}`,
              description: `<p><strong>${param.userName}'s</strong> uploaded a new file <em><mark class=\"bg-sky-100 rounded-none px-0.5\">` +
                param.fileName +
                "</mark></em></p>",
              project: {
                connect: {
                  id: param.projectId
                }
              }
            }
          }
    }
    static removeFileProject(param:{
        type:'File'|'Attachment'|'Report',
        userName: string;
        fileName: string;
        projectId: number
    }) { 
        return {
            data: {
              title: `${param.type} Removed`,
              description: `<p><strong>${param.userName}'s</strong> removed a ${param.type.toLocaleLowerCase()} <em><mark class=\"bg-sky-100 rounded-none px-0.5\">` +
                param.fileName +
                "</mark></em></p>",
              project: {
                connect: {
                  id: param.projectId
                }
              }
            }
          }
    }


    static editNameProject(
        param:{
            newName: string,
            oldName: string,
            userName: string,
            projectId: number
        }
    ){
        return {
            data: {
              title: `Update Name`,
              description: `<p><strong>${param.userName}</strong> changed project's name. <br><em>\"</em><strong><em><mark class=\"bg-sky-100 rounded-none px-0.5\">` +
              param.oldName +
              "</mark></em></strong><em>\" </em><strong>→ </strong><em>\"</em><strong><em><mark class=\"bg-sky-100 rounded-none px-0.5\">" +
              param.newName +
              "</mark></em></strong><em>\".</em></p>",
              project: {
                connect: {
                  id: param.projectId
                }
              }
            }
          }
    }

    static editPeriod(param:{
        userName:string;
        projectId: number;
        startDate: Date;
        endDate: Date;
    }){
        
        
        const starDate = dayjs(new Date(param.startDate)).format("DD MMM, YYYY")
        const endDate = dayjs(new Date(param.endDate)).format("DD MMM, YYYY")
        return {
            data:{
                title:"Update Period",
                description:`<p><strong>${param.userName} </strong>updated project's active period to</p><p><em><mark class=\"bg-sky-100 rounded-none px-0.5\">${starDate} → ${endDate}</mark></em></p>`,
                project: {
                    connect: {
                      id: param.projectId
                    }
                  }
            }
        }
    }

    static createSubroject(param: {
        userName: string,
    }) {
        return {
            create: {
                title: `Created`,
                description: `<p><strong>${param.userName}</strong> created subproject.</p>`,
            },
        }
    }

    static editNameSubProject(
        param:{
            newName: string,
            oldName: string,
            userName: string,
            subprojectId: number
        }
    ){
        return {
            data: {
              title: `Update Name`,
              description: `<p><strong>${param.userName}</strong> changed project's name. <br><em>\"</em><strong><em><mark class=\"bg-sky-100 rounded-none px-0.5\">` +
              param.oldName +
              "</mark></em></strong><em>\" </em><strong>→ </strong><em>\"</em><strong><em><mark class=\"bg-sky-100 rounded-none px-0.5\">" +
              param.newName +
              "</mark></em></strong><em>\".</em></p>",
              subproject: {
                connect: {
                  id: param.subprojectId
                }
              }
            }
          }
    }

    static editSubprojectPeriod(param:{
        userName:string;
        subprojectId: number;
        startDate: Date;
        endDate: Date;
    }){
        
        
        const starDate = dayjs(new Date(param.startDate)).format("DD MMM, YYYY")
        const endDate = dayjs(new Date(param.endDate)).format("DD MMM, YYYY")
        return {
            data:{
                title:"Update Period",
                description:`<p><strong>${param.userName} </strong>updated project's active period to</p><p><em><mark class=\"bg-sky-100 rounded-none px-0.5\">${starDate} → ${endDate}</mark></em></p>`,
                subproject: {
                    connect: {
                      id: param.subprojectId
                    }
                  }
            }
        }
    }

    static createSubprojectOnProjectLog(param: {
        userName: string,
        subprojectName: string,
        projectId: number
    }) {
        return {
            data:{
                title: `New Subproject`,
                description: `<p><strong>${param.userName}</strong> created ${param.subprojectName}.</p>`,
                project: {
                    connect: {
                      id: param.projectId
                    }
                  }
            }
        }
    }

    static removeMemberSubProject(param:{
        subprojectId: number;
        memberName: string
    }) { 
        return {
            
                data: { 
                    title: `Member Removed`, 
                    description: `<p><strong>${param.memberName}</strong> is removed from this project</p>`,
                    subproject: {
                        connect: {
                          id: param.subprojectId,
                        },
                      },
                },

            
        }
    }
    static promoteMemberSubproject(param:{
        subprojectId: number;
        memberName: string;
    }) { 
        return {
            
                data: { 
                    title: `Member Promoted`, 
                    description: `<p><strong>${param.memberName}</strong> is promoted to <span class="italic">Consultant</span> from this subproject</p>`,
                    subproject: {
                        connect: {
                          id: param.subprojectId,
                        },
                      },
                },

            
        }
    }
    static demoteMemberSubproject(param:{
        subprojectId: number;
        memberName: string
    }) { 
        return {
            
                data: { 
                    title: `Member Demoted`, 
                    description: `<p><strong>${param.memberName}</strong> is demoted to <span class="italic">Subproject</span> from this subproject</p>`,
                    subproject: {
                        connect: {
                          id: param.subprojectId,
                        },
                      },
                },

            
        }
    }
    static addFileSubProject(param:{
        type:'Attachment'|'Report',
        userName: string;
        fileName: string;
        subprojectId: number
    }) { 
        return {
            data: {
              title: `New ${param.type}`,
              description: `<p><strong>${param.userName}'s</strong> uploaded a new file <em><mark class=\"bg-sky-100 rounded-none px-0.5\">` +
                param.fileName +
                "</mark></em></p>",
              subproject: {
                connect: {
                  id: param.subprojectId
                }
              }
            }
          }
    }
    static removeFileSubProject(param:{
        type:'Attachment'|'Report',
        userName: string;
        fileName: string;
        subprojectId: number
    }) { 
        return {
            data: {
              title: `${param.type} Removed`,
              description: `<p><strong>${param.userName}'s</strong> removed a ${param.type.toLocaleLowerCase()} <em><mark class=\"bg-sky-100 rounded-none px-0.5\">` +
                param.fileName +
                "</mark></em></p>",
              subproject: {
                connect: {
                  id: param.subprojectId
                }
              }
            }
          }
    }
}