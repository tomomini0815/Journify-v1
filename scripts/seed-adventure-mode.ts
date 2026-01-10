import prisma from '../lib/prisma'

// Seed data for ADVENTURE MODE

const companions = [
    {
        name: "Cosmic Cat",
        species: "cat",
        rarity: "common",
        description: "A curious feline from the Andromeda galaxy. Loves to chase shooting stars and nap in nebula clouds.",
        imageUrl: "/images/companions/cosmic-cat.png",
        baseStats: { happiness: 60, energy: 70, loyalty: 0 },
        skills: [{ name: "Star Dash", level: 1, effect: "xp+5%" }],
        theme: "space"
    },
    {
        name: "Nebula Fox",
        species: "fox",
        rarity: "rare",
        description: "An ethereal fox that leaves trails of stardust. Known for its wisdom and playful nature.",
        imageUrl: "/images/companions/nebula-fox.png",
        baseStats: { happiness: 55, energy: 65, loyalty: 0 },
        skills: [{ name: "Cosmic Wisdom", level: 1, effect: "xp+10%" }],
        theme: "space"
    },
    {
        name: "Aurora Dragon",
        species: "dragon",
        rarity: "epic",
        description: "A majestic dragon born from the northern lights. Its scales shimmer with all colors of the rainbow.",
        imageUrl: "/images/companions/aurora-dragon.png",
        baseStats: { happiness: 50, energy: 80, loyalty: 0 },
        skills: [{ name: "Aurora Blessing", level: 1, effect: "xp+15%" }],
        theme: "space"
    },
    {
        name: "Starlight Bird",
        species: "bird",
        rarity: "common",
        description: "A small bird that sings melodies of distant galaxies. Its feathers glow softly in the dark.",
        imageUrl: "/images/companions/starlight-bird.png",
        baseStats: { happiness: 65, energy: 60, loyalty: 0 },
        skills: [{ name: "Melody of Stars", level: 1, effect: "happiness+5" }],
        theme: "space"
    },
    {
        name: "Forest Spirit Cat",
        species: "cat",
        rarity: "common",
        description: "A gentle cat that protects the ancient forests. Loves to climb trees and play with butterflies.",
        imageUrl: "/images/companions/forest-cat.png",
        baseStats: { happiness: 60, energy: 70, loyalty: 0 },
        skills: [{ name: "Nature's Blessing", level: 1, effect: "garden+5%" }],
        theme: "nature"
    },
    {
        name: "Moonlight Wolf",
        species: "wolf",
        rarity: "rare",
        description: "A loyal wolf that howls at the full moon. Protects its companions with fierce dedication.",
        imageUrl: "/images/companions/moonlight-wolf.png",
        baseStats: { happiness: 55, energy: 75, loyalty: 0 },
        skills: [{ name: "Pack Leader", level: 1, effect: "loyalty+10" }],
        theme: "nature"
    },
    {
        name: "Sakura Dragon",
        species: "dragon",
        rarity: "legendary",
        description: "A rare dragon that blooms cherry blossoms wherever it flies. Symbol of renewal and hope.",
        imageUrl: "/images/companions/sakura-dragon.png",
        baseStats: { happiness: 50, energy: 85, loyalty: 0 },
        skills: [{ name: "Eternal Spring", level: 1, effect: "xp+20%, garden+10%" }],
        theme: "nature"
    },
    {
        name: "Firefly Sprite",
        species: "sprite",
        rarity: "rare",
        description: "A tiny sprite that lights up the night. Brings joy and wonder to all who see it.",
        imageUrl: "/images/companions/firefly-sprite.png",
        baseStats: { happiness: 70, energy: 50, loyalty: 0 },
        skills: [{ name: "Guiding Light", level: 1, effect: "happiness+10" }],
        theme: "nature"
    }
]

const fish = [
    { name: "Starfish", species: "starfish", rarity: "common", imageUrl: "/images/fish/starfish.png", minSize: 10, maxSize: 20, description: "A common starfish found in shallow waters.", habitat: "shallow" },
    { name: "Rainbow Trout", species: "trout", rarity: "uncommon", imageUrl: "/images/fish/rainbow-trout.png", minSize: 20, maxSize: 40, description: "A beautiful trout with rainbow-colored scales.", habitat: "shallow" },
    { name: "Golden Koi", species: "koi", rarity: "rare", imageUrl: "/images/fish/golden-koi.png", minSize: 30, maxSize: 60, description: "A prized koi with golden scales. Brings good fortune.", habitat: "shallow" },
    { name: "Deep Sea Angler", species: "angler", rarity: "epic", imageUrl: "/images/fish/angler.png", minSize: 40, maxSize: 80, description: "A mysterious fish from the deep ocean depths.", habitat: "deep" },
    { name: "Cosmic Jellyfish", species: "jellyfish", rarity: "legendary", imageUrl: "/images/fish/cosmic-jellyfish.png", minSize: 25, maxSize: 50, description: "A rare jellyfish that glows with cosmic energy.", habitat: "deep" },
    { name: "Clownfish", species: "clownfish", rarity: "common", imageUrl: "/images/fish/clownfish.png", minSize: 8, maxSize: 15, description: "A friendly fish that lives in coral reefs.", habitat: "reef" },
    { name: "Blue Tang", species: "tang", rarity: "uncommon", imageUrl: "/images/fish/blue-tang.png", minSize: 15, maxSize: 30, description: "A vibrant blue fish popular in reef ecosystems.", habitat: "reef" },
    { name: "Dragon Fish", species: "dragon", rarity: "epic", imageUrl: "/images/fish/dragon-fish.png", minSize: 50, maxSize: 100, description: "A legendary fish said to bring great fortune.", habitat: "deep" }
]

const plants = [
    { name: "Sunflower", species: "flower", growthTime: 30, imageUrl: "/images/plants/sunflower.png", seedCost: 10, harvestValue: 25, rarity: "common", description: "A cheerful flower that follows the sun." },
    { name: "Rose", species: "flower", growthTime: 60, imageUrl: "/images/plants/rose.png", seedCost: 20, harvestValue: 50, rarity: "uncommon", description: "A classic flower symbolizing love and beauty." },
    { name: "Lavender", species: "herb", growthTime: 45, imageUrl: "/images/plants/lavender.png", seedCost: 15, harvestValue: 35, rarity: "common", description: "A fragrant herb known for its calming properties." },
    { name: "Moonflower", species: "flower", growthTime: 90, imageUrl: "/images/plants/moonflower.png", seedCost: 50, harvestValue: 120, rarity: "rare", description: "A rare flower that blooms only at night." },
    { name: "Star Lily", species: "flower", growthTime: 120, imageUrl: "/images/plants/star-lily.png", seedCost: 100, harvestValue: 250, rarity: "epic", description: "An ethereal lily that glows with starlight." },
    { name: "Tomato", species: "vegetable", growthTime: 40, imageUrl: "/images/plants/tomato.png", seedCost: 12, harvestValue: 30, rarity: "common", description: "A juicy vegetable perfect for salads." },
    { name: "Carrot", species: "vegetable", growthTime: 35, imageUrl: "/images/plants/carrot.png", seedCost: 10, harvestValue: 25, rarity: "common", description: "A crunchy orange vegetable rich in vitamins." }
]

async function seedAdventureMode() {
    console.log('🌟 Seeding ADVENTURE MODE data...')

    try {
        // Seed Companions
        console.log('📦 Creating companions...')
        for (const companion of companions) {
            await prisma.companion.upsert({
                where: { id: companion.name.toLowerCase().replace(/ /g, '-') },
                update: {},
                create: {
                    id: companion.name.toLowerCase().replace(/ /g, '-'),
                    ...companion
                }
            })
        }
        console.log(`✅ Created ${companions.length} companions`)

        // Seed Fish
        console.log('🐟 Creating fish...')
        for (const fishData of fish) {
            await prisma.fish.upsert({
                where: { id: fishData.name.toLowerCase().replace(/ /g, '-') },
                update: {},
                create: {
                    id: fishData.name.toLowerCase().replace(/ /g, '-'),
                    ...fishData
                }
            })
        }
        console.log(`✅ Created ${fish.length} fish`)

        // Seed Plants
        console.log('🌱 Creating plants...')
        for (const plant of plants) {
            await prisma.plant.upsert({
                where: { id: plant.name.toLowerCase().replace(/ /g, '-') },
                update: {},
                create: {
                    id: plant.name.toLowerCase().replace(/ /g, '-'),
                    ...plant
                }
            })
        }
        console.log(`✅ Created ${plants.length} plants`)

        console.log('🎉 ADVENTURE MODE seed data complete!')
    } catch (error) {
        console.error('❌ Error seeding ADVENTURE MODE:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

seedAdventureMode()
