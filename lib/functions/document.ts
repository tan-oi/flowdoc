import { prisma } from "../prisma";

export async function getDocument(userId: string, id: string | undefined) {
  {
    if (id) {
      return await prisma.document.findUnique({
        where: {
          userId,
          id,
        },
      });
    } else
      return await prisma.document.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  }
}

export async function saveDocument() {}


export async function createTempDocument(userId : string) {
  console.log('even runs?');
    return await prisma.document.create({
        data : {
            type : "temp",
            content : "",
            userId
        },
        select : {
            type : true,
            id : true
        }
    })
}