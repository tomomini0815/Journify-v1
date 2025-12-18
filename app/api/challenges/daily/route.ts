import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - 今日のチャレンジを取得
export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let challenge = await prisma.dailyChallenge.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today
                }
            }
        });

        // チャレンジが存在しない場合は作成
        if (!challenge) {
            challenge = await prisma.dailyChallenge.create({
                data: {
                    userId: user.id,
                    date: today
                }
            });
        }

        // ユーザー統計も取得
        let userStats = await prisma.userStats.findUnique({
            where: { userId: user.id }
        });

        // 統計が存在しない場合は作成
        if (!userStats) {
            userStats = await prisma.userStats.create({
                data: { userId: user.id }
            });
        }

        return NextResponse.json({
            challenge,
            userStats: {
                level: userStats.level,
                totalXP: userStats.totalXP,
                currentStreak: userStats.currentStreak
            }
        });

    } catch (error: any) {
        console.error("Daily challenge fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch daily challenge", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// POST - チャレンジ進捗を更新
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { action } = await req.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let challenge = await prisma.dailyChallenge.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today
                }
            }
        });

        if (!challenge) {
            challenge = await prisma.dailyChallenge.create({
                data: {
                    userId: user.id,
                    date: today
                }
            });
        }

        let xpGained = 0;
        let updateData: any = {};

        // アクションに応じてチャレンジを更新
        switch (action) {
            case "journal_created":
                if (!challenge.journalCreated) {
                    updateData.journalCreated = true;
                    xpGained = 10;
                }
                break;
            case "task_completed":
                updateData.tasksCompleted = challenge.tasksCompleted + 1;
                xpGained = 5;
                // 3つ完了でボーナス
                if (updateData.tasksCompleted >= 3 && challenge.tasksCompleted < 3) {
                    xpGained += 10; // ボーナスXP
                }
                break;
            case "meeting_created":
                if (!challenge.meetingCreated) {
                    updateData.meetingCreated = true;
                    xpGained = 20;
                }
                break;
        }

        // チャレンジを更新
        if (Object.keys(updateData).length > 0) {
            updateData.xpEarned = challenge.xpEarned + xpGained;

            // すべて完了したかチェック
            const allCompleted =
                (updateData.journalCreated ?? challenge.journalCreated) &&
                (updateData.tasksCompleted ?? challenge.tasksCompleted) >= 3 &&
                (updateData.meetingCreated ?? challenge.meetingCreated);

            if (allCompleted && !challenge.completed) {
                updateData.completed = true;
                updateData.badgeEarned = "daily_hero";
                xpGained += 25; // 完了ボーナス
                updateData.xpEarned = challenge.xpEarned + xpGained;
            }

            challenge = await prisma.dailyChallenge.update({
                where: { id: challenge.id },
                data: updateData
            });

            // ユーザー統計を更新
            const userStats = await prisma.userStats.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    totalXP: xpGained,
                    level: 1
                },
                update: {
                    totalXP: { increment: xpGained }
                }
            });

            // レベルアップチェック（100XPごとに1レベル）
            const newLevel = Math.floor(userStats.totalXP / 100) + 1;
            let leveledUp = false;

            if (newLevel > userStats.level) {
                await prisma.userStats.update({
                    where: { userId: user.id },
                    data: { level: newLevel }
                });
                leveledUp = true;
            }

            // バッジを授与
            if (updateData.badgeEarned) {
                await prisma.badge.create({
                    data: {
                        userId: user.id,
                        badgeType: updateData.badgeEarned,
                        title: "デイリーヒーロー",
                        description: "1日のすべてのチャレンジを達成",
                        icon: "🏆"
                    }
                });
            }

            return NextResponse.json({
                challenge,
                xpGained,
                leveledUp,
                newLevel: leveledUp ? newLevel : userStats.level,
                badgeEarned: updateData.badgeEarned
            });
        }

        return NextResponse.json({ challenge, xpGained: 0 });

    } catch (error: any) {
        console.error("Daily challenge update error:", error);
        return NextResponse.json(
            { error: "Failed to update daily challenge", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
