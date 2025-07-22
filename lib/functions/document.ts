import { prisma } from "../prisma";

export async function getDocuments(userId : string,id : string) {
    return await prisma.document.findUnique({
        where : {
            userId,
            id
        }
    })  
}

export async function saveDocument() {
    
}