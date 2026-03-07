import prisma from '../lib/prisma'

// 参考画像に基づいた10種類のかわいいファンタジーペット
const companions = [
    {
        name: 'うさぴょん',
        species: 'usapyon',
        rarity: 'common',
        description: '羽のはえた妖精うさぎ。いつもクローバーを持っている。優しい心の持ち主。',
        imageUrl: '/pets/usapyon.svg',
        baseStats: { happiness: 50, energy: 60, loyalty: 40 },
        skills: ['ヒーリング', 'はばたき'],
        theme: 'forest',
    },
    {
        name: 'ネコリス',
        species: 'nekorisu',
        rarity: 'common',
        description: 'ネコとリスのハーフ。ふさふさのしっぽがチャームポイント。おしゃれが好き。',
        imageUrl: '/pets/nekorisu.svg',
        baseStats: { happiness: 55, energy: 50, loyalty: 45 },
        skills: ['かくれんぼ', 'どんぐり集め'],
        theme: 'forest',
    },
    {
        name: 'モチクマ',
        species: 'mochikuma',
        rarity: 'uncommon',
        description: 'もちもちのクマ。丸くてやわらかい。ぎゅっとするとあったかい。',
        imageUrl: '/pets/mochikuma.svg',
        baseStats: { happiness: 70, energy: 40, loyalty: 60 },
        skills: ['もちもちハグ', 'おひるね'],
        theme: 'cozy',
    },
    {
        name: 'ペンタヌキ',
        species: 'pentanuki',
        rarity: 'uncommon',
        description: 'ペンギンとタヌキのハーフ。おとぼけ顔だけど実はとても賢い。',
        imageUrl: '/pets/pentanuki.svg',
        baseStats: { happiness: 50, energy: 55, loyalty: 50 },
        skills: ['ばけばけ', 'スライディング'],
        theme: 'ocean',
    },
    {
        name: 'ハムリー',
        species: 'hamuri',
        rarity: 'rare',
        description: '天使の羽を持つ魔法のハムスター。星のステッキで夢を叶える。',
        imageUrl: '/pets/hamuri.svg',
        baseStats: { happiness: 60, energy: 70, loyalty: 55 },
        skills: ['スターマジック', 'エンジェルフライ'],
        theme: 'magic',
    },
    {
        name: 'インコアラ',
        species: 'inkoala',
        rarity: 'rare',
        description: 'インコとコアラのハーフ。カラフルな羽とまんまるおめめ。歌が上手。',
        imageUrl: '/pets/inkoala.svg',
        baseStats: { happiness: 65, energy: 55, loyalty: 50 },
        skills: ['レインボーソング', 'もふもふ抱っこ'],
        theme: 'tropical',
    },
    {
        name: 'ミケーリス',
        species: 'mikerisu',
        rarity: 'uncommon',
        description: '三毛模様のリス。大きなしっぽで木から木へジャンプ！どんぐりが大好物。',
        imageUrl: '/pets/mikerisu.svg',
        baseStats: { happiness: 55, energy: 65, loyalty: 45 },
        skills: ['どんぐりシュート', 'もふもふテール'],
        theme: 'forest',
    },
    {
        name: 'コトリス',
        species: 'kotorisu',
        rarity: 'common',
        description: '小鳥とリスのハーフ。木の実を運ぶのが得意。ちっちゃくてすばしっこい。',
        imageUrl: '/pets/kotorisu.svg',
        baseStats: { happiness: 50, energy: 70, loyalty: 40 },
        skills: ['クイックダッシュ', '木の実ボンバー'],
        theme: 'forest',
    },
    {
        name: 'ホシナシ',
        species: 'hoshinashi',
        rarity: 'epic',
        description: '星の力で生まれた不思議な果物の精霊。夜になると光る。とっても珍しい。',
        imageUrl: '/pets/hoshinashi.svg',
        baseStats: { happiness: 60, energy: 50, loyalty: 70 },
        skills: ['スターライト', 'いやしの果実'],
        theme: 'cosmic',
    },
    {
        name: 'イヌダマシ',
        species: 'inudamashi',
        rarity: 'common',
        description: 'バンダナがトレードマークの元気な柴犬。いたずら好きだけど忠実。',
        imageUrl: '/pets/inudamashi.svg',
        baseStats: { happiness: 60, energy: 65, loyalty: 55 },
        skills: ['しっぽアタック', 'なかよしタックル'],
        theme: 'park',
    },
]

async function seedCompanions() {
    console.log('🐾 Seeding 10 cute fantasy companions...')

    let created = 0
    let skipped = 0

    for (const comp of companions) {
        const existing = await prisma.companion.findFirst({
            where: { name: comp.name }
        })

        if (existing) {
            // Update existing to match new data
            await prisma.companion.update({
                where: { id: existing.id },
                data: {
                    species: comp.species,
                    description: comp.description,
                    baseStats: comp.baseStats,
                    skills: comp.skills,
                    theme: comp.theme,
                }
            })
            skipped++
            console.log(`  📝 Updated: ${comp.name}`)
            continue
        }

        await prisma.companion.create({ data: comp })
        created++
        console.log(`  ✨ Created: ${comp.name}`)
    }

    console.log(`\n✅ Done! Created: ${created}, Updated: ${skipped}`)
    console.log(`📦 Total companions in DB: ${await prisma.companion.count()}`)
}

seedCompanions()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
