import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        
        // Fetch project-specific documents
        const projectDocuments = await prisma.projectDocument.findMany({
            where: {
                projectId: id
            }
        })

        // Fetch attachments associated with tasks in this project
        const taskAttachments = await prisma.attachment.findMany({
            where: {
                task: {
                    projectId: id
                }
            }
        })

        // Merge and sort by createdAt desc
        const allDocuments = [...projectDocuments, ...taskAttachments].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        return NextResponse.json(allDocuments)
    } catch (error) {
        console.error('Failed to fetch documents:', error)
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, type, url, size } = body

        if (!name || !type || !url || !size) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const document = await prisma.projectDocument.create({
            data: {
                name,
                type,
                url,
                size,
                projectId: id
            }
        })

        return NextResponse.json(document)
    } catch (error: any) {
        console.error('Failed to create document:', error)
        console.error('Error stack:', error.stack)
        return NextResponse.json(
            { error: 'Failed to create document', details: error.message },
            { status: 500 }
        )
    }
}
