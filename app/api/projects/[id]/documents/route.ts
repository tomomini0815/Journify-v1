import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const documents = await prisma.projectDocument.findMany({
            where: {
                projectId: params.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(documents)
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
    { params }: { params: { id: string } }
) {
    try {
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
                projectId: params.id
            }
        })

        return NextResponse.json(document)
    } catch (error) {
        console.error('Failed to create document:', error)
        return NextResponse.json(
            { error: 'Failed to create document' },
            { status: 500 }
        )
    }
}
