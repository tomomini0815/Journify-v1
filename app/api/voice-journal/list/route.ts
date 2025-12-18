import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const journals = await prisma.voiceJournal.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return NextResponse.json({ journals });

    } catch (error: any) {
        console.error("Voice journal list error:", error);
        return NextResponse.json(
            { error: "Failed to fetch voice journals", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
