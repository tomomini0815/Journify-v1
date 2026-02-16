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

        // Count tasks completed TODAY
        const completedTasksCount = await prisma.task.count({
            where: {
                userId: user.id,
                status: 'done',
                updatedAt: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        // 達成状況に基づいてXP/クリスタルを再計算
        let recalculatedXP = 0;
        if (challenge?.journalCreated) recalculatedXP += 20;
        recalculatedXP += Math.min(completedTasksCount || 0, 2) * 25; // 最大50
        if (challenge?.meetingCreated) recalculatedXP += 30;

        // Sync challenge if different
        if (challenge && (challenge.tasksCompleted !== completedTasksCount || challenge.xpEarned !== recalculatedXP)) {
            challenge = await prisma.dailyChallenge.update({
                where: { id: challenge.id },
                data: {
                    tasksCompleted: completedTasksCount,
                    xpEarned: recalculatedXP
                }
            });
        }

        return NextResponse.json({
            challenge,
            userStats: {
                level: userStats.level,
                totalXP: userStats.totalXP,
                currentStreak: userStats.currentStreak,
                totalCrystals: userStats.crystals
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
                    xpGained = 20;
                }
                break;
            case "task_completed":
                updateData.tasksCompleted = (challenge.tasksCompleted || 0) + 1;
                xpGained = 25;
                // 2つ完了でボーナス (合計50になるように調整)
                if (updateData.tasksCompleted === 2 && challenge.tasksCompleted < 2) {
                    // すでに1つ目で25得ているので、2つ目も25であれば合計50
                    // もし1つ目が以前のロジック(5)だった場合でも、ここで補正
                }
                break;
            case "meeting_created":
                if (!challenge.meetingCreated) {
                    updateData.meetingCreated = true;
                    xpGained = 30;
                }
                break;
        }

        // チャレンジを更新
        if (Object.keys(updateData).length > 0) {
            updateData.xpEarned = challenge.xpEarned + xpGained;

            // すべて完了したかチェック
            const allCompleted =
                (updateData.journalCreated ?? challenge.journalCreated) &&
                (updateData.tasksCompleted ?? challenge.tasksCompleted) >= 2 &&
                (updateData.meetingCreated ?? challenge.meetingCreated);

            if (allCompleted && !challenge.completed) {
                updateData.completed = true;
                updateData.badgeEarned = "daily_hero";
                xpGained += 25; // 完了ボーナス (25 crystals)
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
                    crystals: xpGained, // Initialize crystals
                    level: 1
                },
                update: {
                    totalXP: { increment: xpGained },
                    crystals: { increment: xpGained } // Increment crystals
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
