import prisma from '../lib/prisma'

// Seed data for Home Customization (Decorations)
const decorations = [
    // Basic Furniture
    { name: "Wooden Chair", category: "furniture", theme: "basic", imageUrl: "/images/decorations/wooden-chair.png", rarity: "common", price: 100, description: "A simple wooden chair." },
    { name: "Wooden Table", category: "furniture", theme: "basic", imageUrl: "/images/decorations/wooden-table.png", rarity: "common", price: 200, description: "A sturdy wooden table." },
    { name: "Cozy Bed", category: "furniture", theme: "basic", imageUrl: "/images/decorations/cozy-bed.png", rarity: "common", price: 300, description: "A comfortable bed for good dreams." },
    { name: "Bookshelf", category: "furniture", theme: "basic", imageUrl: "/images/decorations/bookshelf.png", rarity: "common", price: 250, description: "Filled with interesting books." },

    // Space Theme
    { name: "Star Lamp", category: "lighting", theme: "space", imageUrl: "/images/decorations/star-lamp.png", rarity: "uncommon", price: 500, description: "A lamp that glows like a star." },
    { name: "Nebula Rug", category: "floor", theme: "space", imageUrl: "/images/decorations/nebula-rug.png", rarity: "rare", price: 800, description: "Feels like walking on a galaxy." },
    { name: "Rocket Model", category: "decoration", theme: "space", imageUrl: "/images/decorations/rocket-model.png", rarity: "rare", price: 1000, description: "A detailed model of a spaceship." },
    { name: "Planet Mobile", category: "decoration", theme: "space", imageUrl: "/images/decorations/planet-mobile.png", rarity: "uncommon", price: 600, description: "Spinning planets for your ceiling." },

    // Nature Theme
    { name: "Potted Fern", category: "plant", theme: "nature", imageUrl: "/images/decorations/potted-fern.png", rarity: "common", price: 150, description: "Adds a touch of green." },
    { name: "Flower Vase", category: "decoration", theme: "nature", imageUrl: "/images/decorations/flower-vase.png", rarity: "common", price: 200, description: "Fresh flowers from the garden." },
    { name: "Log Bench", category: "furniture", theme: "nature", imageUrl: "/images/decorations/log-bench.png", rarity: "uncommon", price: 300, description: "Rustic bench made from a log." },

    // Cyberpunk Theme
    { name: "Neon Sign", category: "lighting", theme: "cyberpunk", imageUrl: "/images/decorations/neon-sign.png", rarity: "rare", price: 700, description: "Buzzing neon light." },
    { name: "Hologram Projector", category: "decoration", theme: "cyberpunk", imageUrl: "/images/decorations/hologram-projector.png", rarity: "epic", price: 1500, description: "Projects 3D images." },

    // Clothes
    { name: 'スペーススーツ', category: 'clothes', theme: 'space', imageUrl: '/images/decorations/space-suit.png', rarity: 'rare', price: 1500, description: '小さな宇宙飛行士のためのスーツ' },
    { name: '魔法使いの帽子', category: 'clothes', theme: 'fantasy', imageUrl: '/images/decorations/wizard-hat.png', rarity: 'rare', price: 1200, description: '星の刺繍が入った不思議な帽子' },
    { name: 'ピクセルサングラス', category: 'clothes', theme: 'cyberpunk', imageUrl: '/images/decorations/sunglasses.png', rarity: 'common', price: 500, description: 'クールなドット絵サングラス' },

    // Snacks
    { name: 'スタークッキー', category: 'snack', theme: 'space', imageUrl: '/images/decorations/star-cookie.png', rarity: 'common', price: 100, description: '星屑をまぶした甘いクッキー' },
    { name: 'ムーンミルク', category: 'snack', theme: 'space', imageUrl: '/images/decorations/moon-milk.png', rarity: 'uncommon', price: 300, description: '飲むとぐっすり眠れる青いミルク' },

    // Toys
    { name: 'トイロケット', category: 'toy', theme: 'space', imageUrl: '/images/decorations/toy-rocket.png', rarity: 'common', price: 800, description: 'ふかふかのロケットのぬいぐるみ' }
]

async function seedDecorations() {
    console.log('🏠 Seeding Decoration data...')

    try {
        console.log('📦 Creating decorations...')
        for (const deco of decorations) {
            await prisma.homeDecoration.upsert({
                where: { id: deco.name.toLowerCase().replace(/ /g, '-') },
                update: {
                    ...deco,
                    // imageUrl: `/images/decorations/${deco.name.toLowerCase().replace(/ /g, '-')}.png` // Placeholder path
                },
                create: {
                    id: deco.name.toLowerCase().replace(/ /g, '-'),
                    ...deco,
                    // imageUrl: `/images/decorations/${deco.name.toLowerCase().replace(/ /g, '-')}.png` // Placeholder path
                }
            })
        }
        console.log(`✅ Created ${decorations.length} decorations`)
        console.log('🎉 Decoration seed data complete!')
    } catch (error) {
        console.error('❌ Error seeding decorations:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

seedDecorations()
