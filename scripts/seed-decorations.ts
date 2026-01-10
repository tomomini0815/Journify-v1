import prisma from '../lib/prisma'

// Seed data for Home Customization (Decorations)
const decorations = [
    // Basic Furniture
    { name: "Wooden Chair", category: "furniture", theme: "basic", imageUrl: "🪑", rarity: "common", price: 100, description: "A simple wooden chair." },
    { name: "Wooden Table", category: "furniture", theme: "basic", imageUrl: "table", rarity: "common", price: 200, description: "A sturdy wooden table." },
    { name: "Cozy Bed", category: "furniture", theme: "basic", imageUrl: "🛏️", rarity: "common", price: 300, description: "A comfortable bed for good dreams." },
    { name: "Bookshelf", category: "furniture", theme: "basic", imageUrl: "📚", rarity: "common", price: 250, description: "Filled with interesting books." },

    // Space Theme
    { name: "Star Lamp", category: "lighting", theme: "space", imageUrl: "🌟", rarity: "uncommon", price: 500, description: "A lamp that glows like a star." },
    { name: "Nebula Rug", category: "floor", theme: "space", imageUrl: "🌌", rarity: "rare", price: 800, description: "Feels like walking on a galaxy." },
    { name: "Rocket Model", category: "decoration", theme: "space", imageUrl: "🚀", rarity: "rare", price: 1000, description: "A detailed model of a spaceship." },
    { name: "Planet Mobile", category: "decoration", theme: "space", imageUrl: "🪐", rarity: "uncommon", price: 600, description: "Spinning planets for your ceiling." },

    // Nature Theme
    { name: "Potted Fern", category: "plant", theme: "nature", imageUrl: "🪴", rarity: "common", price: 150, description: "Adds a touch of green." },
    { name: "Flower Vase", category: "decoration", theme: "nature", imageUrl: "💐", rarity: "common", price: 200, description: "Fresh flowers from the garden." },
    { name: "Log Bench", category: "furniture", theme: "nature", imageUrl: "🪵", rarity: "uncommon", price: 300, description: "Rustic bench made from a log." },

    // Cyberpunk Theme
    { name: "Neon Sign", category: "lighting", theme: "cyberpunk", imageUrl: "🟣", rarity: "rare", price: 700, description: "Buzzing neon light." },
    { name: "Hologram projector", category: "decoration", theme: "cyberpunk", imageUrl: "💿", rarity: "epic", price: 1500, description: "Projects 3D images." }
]

async function seedDecorations() {
    console.log('🏠 Seeding Decoration data...')

    try {
        console.log('📦 Creating decorations...')
        for (const deco of decorations) {
            await prisma.homeDecoration.upsert({
                where: { id: deco.name.toLowerCase().replace(/ /g, '-') },
                update: {},
                create: {
                    id: deco.name.toLowerCase().replace(/ /g, '-'),
                    ...deco,
                    imageUrl: `/images/decorations/${deco.name.toLowerCase().replace(/ /g, '-')}.png` // Placeholder path
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
