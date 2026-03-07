'use client'

import { motion } from 'framer-motion'

interface PetAvatarProps {
    species: string
    size?: number
    equippedOutfits?: {
        hat?: string
        clothes?: string
        accessory?: string
    }
    className?: string
    onClick?: () => void
    animate?: boolean
}

const SPECIES_COLORS: Record<string, {
    body: string; light: string; belly: string; accent: string;
    ear: string; nose: string; cheek: string; eye: string
}> = {
    usapyon: { body: '#F8BBD0', light: '#FCE4EC', belly: '#FFF', accent: '#F48FB1', ear: '#F48FB1', nose: '#E91E63', cheek: '#FF80AB', eye: '#C2185B' },
    nekorisu: { body: '#FFE0B2', light: '#FFF3E0', belly: '#FFF', accent: '#FFB74D', ear: '#A1887F', nose: '#5D4037', cheek: '#FFAB91', eye: '#2E7D32' },
    mochikuma: { body: '#FFFFFF', light: '#FFF0F5', belly: '#FFFFFF', accent: '#FFCDD2', ear: '#FFFFFF', nose: '#4E342E', cheek: '#FFCDD2', eye: '#4E342E' },
    pentanuki: { body: '#90CAF9', light: '#BBDEFB', belly: '#FFFFFF', accent: '#64B5F6', ear: '#795548', nose: '#212121', cheek: '#FFCDD2', eye: '#212121' },
    hamuri: { body: '#FFB74D', light: '#FFE0B2', belly: '#FFFFFF', accent: '#FFA726', ear: '#FFCC80', nose: '#4E342E', cheek: '#FFCDD2', eye: '#4E342E' },
    inkoala: { body: '#A5D6A7', light: '#C8E6C9', belly: '#E8F5E9', accent: '#66BB6A', ear: '#81C784', nose: '#424242', cheek: '#FFCCBC', eye: '#212121' },
    mikerisu: { body: '#FFCC80', light: '#FFE0B2', belly: '#FFF', accent: '#FFA726', ear: '#8D6E63', nose: '#4E342E', cheek: '#FFAB91', eye: '#33691E' },
    kotorisu: { body: '#BCAAA4', light: '#D7CCC8', belly: '#EFEBE9', accent: '#8D6E63', ear: '#A1887F', nose: '#5D4037', cheek: '#FFAB91', eye: '#212121' },
    hoshinashi: { body: '#CE93D8', light: '#E1BEE7', belly: '#F3E5F5', accent: '#AB47BC', ear: '#9C27B0', nose: '#6A1B9A', cheek: '#F8BBD0', eye: '#FF8F00' },
    inudamashi: { body: '#FFCC80', light: '#FFE0B2', belly: '#FFF8E1', accent: '#FFA726', ear: '#FB8C00', nose: '#3E2723', cheek: '#FFAB91', eye: '#212121' },
    cat: { body: '#FFB74D', light: '#FFD699', belly: '#FFF3E0', accent: '#F09819', ear: '#F09819', nose: '#E91E63', cheek: '#FFAB91', eye: '#424242' },
    dog: { body: '#D4915A', light: '#E8BE95', belly: '#FFF0DB', accent: '#A06B3A', ear: '#A06B3A', nose: '#4E342E', cheek: '#FFAB91', eye: '#424242' },
    fox: { body: '#FF9A3C', light: '#FFC876', belly: '#FFF5EB', accent: '#E67E22', ear: '#E67E22', nose: '#4E342E', cheek: '#FFAB91', eye: '#424242' },
    rabbit: { body: '#F8E8DD', light: '#FFF5EE', belly: '#FFF', accent: '#E8D0C0', ear: '#FFB5C5', nose: '#E91E63', cheek: '#FFCDD2', eye: '#424242' },
    hamster: { body: '#FFCC80', light: '#FFE0AA', belly: '#FFF8E8', accent: '#FFB044', ear: '#FFB044', nose: '#E91E63', cheek: '#FFCDD2', eye: '#424242' },
    bear: { body: '#A67C52', light: '#C9A06A', belly: '#E8D4B8', accent: '#8B6334', ear: '#8B6334', nose: '#4E342E', cheek: '#FFAB91', eye: '#424242' },
    panda: { body: '#F5F5F5', light: '#FFF', belly: '#FAFAFA', accent: '#616161', ear: '#212121', nose: '#212121', cheek: '#FFAB91', eye: '#424242' },
    wolf: { body: '#90A4AE', light: '#B0BEC5', belly: '#ECEFF1', accent: '#607D8B', ear: '#607D8B', nose: '#37474F', cheek: '#FFAB91', eye: '#424242' },
    bird: { body: '#64B5F6', light: '#90CAF9', belly: '#E3F2FD', accent: '#42A5F5', ear: '#42A5F5', nose: '#FFB74D', cheek: '#FFCDD2', eye: '#424242' },
    dragon: { body: '#9575CD', light: '#B39DDB', belly: '#EDE7F6', accent: '#7E57C2', ear: '#7E57C2', nose: '#E91E63', cheek: '#CE93D8', eye: '#424242' },
    sprite: { body: '#FFE082', light: '#FFF3C4', belly: '#FFFDE7', accent: '#FFD54F', ear: '#FFD54F', nose: '#E91E63', cheek: '#FFCDD2', eye: '#424242' },
    white_cat: { body: '#F5F5F5', light: '#FFFFFF', belly: '#FDFDFD', accent: '#E0E0E0', ear: '#FFCDD2', nose: '#FF8A80', cheek: '#FFCDD2', eye: '#424242' },
}

export function PetAvatar({ species, size = 200, equippedOutfits, className = '', onClick, animate = true }: PetAvatarProps) {
    const c = SPECIES_COLORS[species] || SPECIES_COLORS.cat
    const isSmall = size < 80
    const uid = `p${Math.random().toString(36).slice(2, 5)}`

    // Determine species features
    const hasLongEars = ['usapyon', 'rabbit'].includes(species)
    const hasPointedEars = ['nekorisu', 'mikerisu', 'fox', 'wolf', 'sprite'].includes(species)
    const hasRoundEars = ['mochikuma', 'pentanuki', 'hamuri', 'inkoala', 'bear', 'panda'].includes(species)
    const hasFloppyEars = ['inudamashi', 'dog'].includes(species)
    const hasTuftEars = ['kotorisu', 'bird'].includes(species)
    const hasLeafEars = ['hoshinashi'].includes(species)
    const hasHornEars = ['dragon'].includes(species)

    const hasFairyWings = ['usapyon', 'sprite'].includes(species)
    const hasAngelWings = ['hamuri'].includes(species)
    const hasParrotWings = ['inkoala'].includes(species)
    const hasBirdWings = ['bird'].includes(species)
    const hasDragonWings = ['dragon'].includes(species)

    const hasFluffyTail = ['nekorisu', 'cat', 'fox', 'wolf', 'dragon', 'hamuri', 'white_cat'].includes(species)
    const hasBigTail = ['mikerisu'].includes(species)
    const hasBallTail = ['usapyon', 'rabbit', 'mochikuma'].includes(species)
    const hasCurlyTail = ['inudamashi', 'dog'].includes(species)
    const hasBirdTail = ['kotorisu'].includes(species)

    const hasWhiskers = ['nekorisu', 'mikerisu', 'cat', 'fox', 'hamster', 'hamuri', 'white_cat'].includes(species)
    const isRound = ['mochikuma', 'pentanuki', 'hamuri', 'bear', 'panda', 'hamster', 'hoshinashi'].includes(species)
    const hasBeak = ['kotorisu', 'bird'].includes(species)

    return (
        <motion.div
            className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={{ width: size, height: size * 1.15 }}
            onClick={onClick}
            whileHover={onClick ? { scale: 1.05 } : undefined}
            whileTap={onClick ? { scale: 0.95 } : undefined}
        >
            <svg viewBox="0 0 100 115" width={size} height={size * 1.15} xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id={`${uid}b`} cx="45%" cy="35%" r="60%">
                        <stop offset="0%" stopColor={c.light} />
                        <stop offset="100%" stopColor={c.body} />
                    </radialGradient>
                </defs>

                {/* Shadow */}
                <ellipse cx="50" cy="112" rx="22" ry="3" fill="#000" opacity="0.08" />

                {/* ===== TAIL ===== */}
                {hasFluffyTail && !isSmall && (
                    <motion.path d="M70 85 Q82 76 78 65 Q75 60 72 68 Q70 76 69 82" fill={c.body} stroke={c.accent} strokeWidth="0.5"
                        animate={animate ? { rotate: [0, 6, -3, 0] } : undefined}
                        transition={{ duration: 2.5, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '70px 85px' }} />
                )}
                {hasBigTail && !isSmall && (
                    <motion.ellipse cx="78" cy="72" rx="14" ry="20" fill={c.body} stroke={c.accent} strokeWidth="0.5" transform="rotate(20,78,72)"
                        animate={animate ? { rotate: [20, 26, 16, 20] } : undefined}
                        transition={{ duration: 2.5, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '72px 82px' }} />
                )}
                {hasBallTail && !isSmall && (
                    <circle cx="70" cy="96" r="4" fill={c.belly} stroke={c.accent} strokeWidth="0.3" />
                )}
                {hasCurlyTail && !isSmall && (
                    <motion.path d="M70 86 Q78 82 77 75 Q76 70 73 75 Q71 80 70 84" fill={c.body} stroke={c.accent} strokeWidth="0.5"
                        animate={animate ? { rotate: [0, 8, 0] } : undefined}
                        transition={{ duration: 2, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '70px 86px' }} />
                )}
                {hasBirdTail && !isSmall && (
                    <path d="M68 85 Q78 80 76 72 Q74 68 72 74 Q70 79 69 83" fill={c.accent} stroke={c.accent} strokeWidth="0.3" />
                )}
                {species === 'pentanuki' && !isSmall && (
                    <motion.g animate={animate ? { rotate: [0, 5, -2, 0] } : undefined} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: '70px 85px' }}>
                        <path d="M65 85 Q85 70 85 55 Q95 65 80 88 Z" fill="#A1887F" stroke="#795548" strokeWidth="0.5" />
                        <path d="M73 75 L86 63 L88 66 L75 79 Z" fill="#D7CCC8" opacity="0.8" />
                        <path d="M68 82 L80 71 L82 74 L70 86 Z" fill="#D7CCC8" opacity="0.8" />
                    </motion.g>
                )}

                {/* ===== WINGS ===== */}
                {hasFairyWings && !isSmall && (
                    <>
                        <motion.ellipse cx="22" cy="62" rx="10" ry="15" fill="rgba(248,187,208,0.3)" stroke="rgba(240,150,180,0.4)" strokeWidth="0.5" transform="rotate(-15,22,62)"
                            animate={animate ? { rotate: [-15, -22, -15] } : undefined}
                            transition={{ duration: 1.5, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '28px 68px' }} />
                        <motion.ellipse cx="78" cy="62" rx="10" ry="15" fill="rgba(248,187,208,0.3)" stroke="rgba(240,150,180,0.4)" strokeWidth="0.5" transform="rotate(15,78,62)"
                            animate={animate ? { rotate: [15, 22, 15] } : undefined}
                            transition={{ duration: 1.5, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '72px 68px' }} />
                    </>
                )}
                {hasAngelWings && !isSmall && (
                    <>
                        <motion.path d="M22 62 Q15 50 18 40 Q22 48 28 58 Z" fill="#FFF9C4" stroke="#FFE082" strokeWidth="0.5"
                            animate={animate ? { rotate: [0, -8, 0] } : undefined}
                            transition={{ duration: 1.8, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '28px 60px' }} />
                        <motion.path d="M78 62 Q85 50 82 40 Q78 48 72 58 Z" fill="#FFF9C4" stroke="#FFE082" strokeWidth="0.5"
                            animate={animate ? { rotate: [0, 8, 0] } : undefined}
                            transition={{ duration: 1.8, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '72px 60px' }} />
                    </>
                )}
                {hasParrotWings && !isSmall && (
                    <>
                        <motion.path d="M22 68 Q12 55 16 44 Q20 52 28 64 Z" fill="#66BB6A" stroke="#43A047" strokeWidth="0.5"
                            animate={animate ? { rotate: [0, -6, 0] } : undefined}
                            transition={{ duration: 2, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '27px 66px' }} />
                        <motion.path d="M78 68 Q88 55 84 44 Q80 52 72 64 Z" fill="#66BB6A" stroke="#43A047" strokeWidth="0.5"
                            animate={animate ? { rotate: [0, 6, 0] } : undefined}
                            transition={{ duration: 2, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '73px 66px' }} />
                    </>
                )}
                {(hasBirdWings || hasDragonWings) && !isSmall && (
                    <>
                        <motion.path d="M24 68 Q14 55 18 44 Q22 52 30 64 Z" fill={hasDragonWings ? c.accent : c.light} stroke={c.accent} strokeWidth="0.5"
                            animate={animate ? { rotate: [0, -8, 0] } : undefined}
                            transition={{ duration: 1.8, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '28px 66px' }} />
                        <motion.path d="M76 68 Q86 55 82 44 Q78 52 70 64 Z" fill={hasDragonWings ? c.accent : c.light} stroke={c.accent} strokeWidth="0.5"
                            animate={animate ? { rotate: [0, 8, 0] } : undefined}
                            transition={{ duration: 1.8, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '72px 66px' }} />
                    </>
                )}

                {/* ===== LEGS ===== */}
                <ellipse cx="37" cy="100" rx="7" ry="8" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" />
                <ellipse cx="63" cy="100" rx="7" ry="8" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" />
                {!isSmall && <>
                    <ellipse cx="37" cy="104" rx="4" ry="2" fill={c.belly} opacity="0.5" />
                    <ellipse cx="63" cy="104" rx="4" ry="2" fill={c.belly} opacity="0.5" />
                </>}

                {/* ===== BODY & CLOTHES ===== */}
                <g>
                    {/* Define clip path based on body shape */}
                    <clipPath id={`${uid}_bodyClip`}>
                        <ellipse cx="50" cy={isRound ? "84" : "82"} rx={isRound ? "24" : "21"} ry={isRound ? "24" : "22"} />
                    </clipPath>

                    {/* Actual Body */}
                    <ellipse cx="50" cy={isRound ? "84" : "82"} rx={isRound ? "24" : "21"} ry={isRound ? "24" : "22"} fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.5" />

                    {/* Belly area */}
                    <g clipPath={`url(#${uid}_bodyClip)`}>
                        <ellipse cx="50" cy={isRound ? "88" : "86"} rx={isRound ? "15" : "13"} ry={isRound ? "16" : "14"} fill={c.belly} opacity="0.65" />
                        {/* Pentanuki white belly */}
                        {species === 'pentanuki' && <ellipse cx="50" cy="88" rx="14" ry="15" fill="#CFD8DC" opacity="0.7" />}

                        {/* Clothes clipped to body shape */}
                        {equippedOutfits?.clothes && (
                            <g>
                                {/* Base shirt color - matching the exact outfit emoji */}
                                <path d="M20 60 L80 60 L80 110 L20 110 Z" fill={
                                    equippedOutfits.clothes === '👕' ? '#81C784' : // Striped shirt
                                        equippedOutfits.clothes === '⚓' ? '#FAFAFA' : // Sailor
                                            equippedOutfits.clothes === '🎩' ? '#212121' : // Tuxedo
                                                equippedOutfits.clothes === '🥷' ? '#263238' : // Ninja
                                                    equippedOutfits.clothes === '🌙' ? '#FFF9C4' : // Pajamas
                                                        equippedOutfits.clothes === '⭐' ? '#E53935' : // Superhero
                                                            equippedOutfits.clothes === '🚀' ? '#ECEFF1' : // Spacesuit
                                                                equippedOutfits.clothes === '☔' ? '#FFCA28' : // Raincoat
                                                                    '#64B5F6' // Default
                                } />

                                {/* Patterns based on outfit exact emoji */}

                                {/* 1. Striped T-Shirt (👕) */}
                                {equippedOutfits.clothes === '👕' && (
                                    <>
                                        <rect x="20" y="70" width="60" height="5" fill="#FFF" opacity="0.6" />
                                        <rect x="20" y="80" width="60" height="5" fill="#FFF" opacity="0.6" />
                                        <rect x="20" y="90" width="60" height="5" fill="#FFF" opacity="0.6" />
                                        <rect x="20" y="100" width="60" height="5" fill="#FFF" opacity="0.6" />
                                        {/* Collar */}
                                        <path d="M35 60 Q50 70 65 60" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.8" />
                                    </>
                                )}

                                {/* 2. Sailor Uniform (⚓) */}
                                {equippedOutfits.clothes === '⚓' && (
                                    <>
                                        {/* Sailor collar */}
                                        <path d="M25 60 L50 75 L75 60 Z" fill="#1565C0" />
                                        <path d="M20 60 L25 60 L50 75 L75 60 L80 60 Z" fill="none" stroke="#FFF" strokeWidth="1" />
                                        {/* Red tie */}
                                        <path d="M48 70 L52 70 L50 82 Z" fill="#D32F2F" />
                                        <circle cx="50" cy="72" r="2" fill="#D32F2F" />
                                    </>
                                )}

                                {/* 3. Tuxedo (🎩) */}
                                {equippedOutfits.clothes === '🎩' && (
                                    <>
                                        {/* White shirt inside */}
                                        <path d="M42 60 L50 85 L58 60 Z" fill="#FFF" />
                                        {/* Red Bowtie */}
                                        <path d="M45 65 L55 65 L50 68 Z" fill="#D32F2F" />
                                        <path d="M45 71 L55 71 L50 68 Z" fill="#D32F2F" />
                                        <circle cx="50" cy="68" r="1.5" fill="#B71C1C" />
                                        {/* Jacket lapels */}
                                        <path d="M35 60 L42 60 L50 85 L35 95 Z" fill="#000" />
                                        <path d="M65 60 L58 60 L50 85 L65 95 Z" fill="#000" />
                                    </>
                                )}

                                {/* 4. Ninja (🥷) */}
                                {equippedOutfits.clothes === '🥷' && (
                                    <>
                                        {/* V-neck crossing */}
                                        <path d="M30 60 L50 75 L70 60" fill="none" stroke="#37474F" strokeWidth="2" />
                                        <path d="M70 60 L50 78 L30 60" fill="none" stroke="#455A64" strokeWidth="2" />
                                        {/* Belt */}
                                        <rect x="20" y="80" width="60" height="6" fill="#B71C1C" />
                                        {/* Shuriken symbol */}
                                        <path d="M45 70 L55 70 M50 65 L50 75 M46 66 L54 74 M46 74 L54 66" stroke="#90A4AE" strokeWidth="1" />
                                    </>
                                )}

                                {/* 5. Pajamas (🌙) */}
                                {equippedOutfits.clothes === '🌙' && (
                                    <>
                                        {/* Collar */}
                                        <path d="M40 60 Q50 70 60 60" fill="none" stroke="#64B5F6" strokeWidth="2" />
                                        {/* Buttons */}
                                        <circle cx="50" cy="75" r="2" fill="#90CAF9" />
                                        <circle cx="50" cy="85" r="2" fill="#90CAF9" />
                                        {/* Moon/star pattern */}
                                        <path d="M35 80 A 3 3 0 1 0 38 75 A 4 4 0 1 1 35 80 Z" fill="#FFCA28" />
                                        <path d="M65 90 A 3 3 0 1 0 68 85 A 4 4 0 1 1 65 90 Z" fill="#FFCA28" />
                                    </>
                                )}

                                {/* 6. Superhero (⭐) */}
                                {equippedOutfits.clothes === '⭐' && (
                                    <>
                                        {/* Big Star */}
                                        <path d="M50 65 L52 70 L58 70 L53 74 L55 80 L50 76 L45 80 L47 74 L42 70 L48 70 Z" fill="#FFCA28" />
                                        {/* Belt */}
                                        <rect x="20" y="85" width="60" height="5" fill="#1565C0" />
                                        <circle cx="50" cy="87.5" r="4" fill="#FFCA28" />
                                    </>
                                )}

                                {/* 7. Spacesuit (🚀) */}
                                {equippedOutfits.clothes === '🚀' && (
                                    <>
                                        {/* Neck ring */}
                                        <path d="M30 60 Q50 65 70 60" fill="none" stroke="#90A4AE" strokeWidth="3" />
                                        {/* Panel lines */}
                                        <path d="M40 65 L40 100" fill="none" stroke="#CFD8DC" strokeWidth="1" />
                                        <path d="M60 65 L60 100" fill="none" stroke="#CFD8DC" strokeWidth="1" />
                                        {/* Center console */}
                                        <rect x="45" y="70" width="10" height="15" rx="2" fill="#CFD8DC" />
                                        <circle cx="48" cy="74" r="1.5" fill="#E53935" />
                                        <circle cx="52" cy="74" r="1.5" fill="#1E88E5" />
                                        <circle cx="50" cy="80" r="1.5" fill="#43A047" />
                                    </>
                                )}

                                {/* 8. Raincoat (☔) */}
                                {equippedOutfits.clothes === '☔' && (
                                    <>
                                        {/* Collar/Hood fold */}
                                        <path d="M30 60 Q50 75 70 60" fill="none" stroke="#FFA000" strokeWidth="3" />
                                        {/* Pockets */}
                                        <path d="M35 85 L45 85 L45 95 L35 95 Z" fill="none" stroke="#FFA000" strokeWidth="1" />
                                        <path d="M55 85 L65 85 L65 95 L55 95 Z" fill="none" stroke="#FFA000" strokeWidth="1" />
                                        {/* Buttons */}
                                        <circle cx="50" cy="70" r="2" fill="#FFA000" />
                                        <circle cx="50" cy="80" r="2" fill="#FFA000" />
                                        <circle cx="50" cy="90" r="2" fill="#FFA000" />
                                    </>
                                )}

                                {/* Default / Basic shirt (if no specific pattern matched) */}
                                {!(['👕', '⚓', '🎩', '🥷', '🌙', '⭐', '🚀', '☔'].includes(equippedOutfits.clothes)) && (
                                    <>
                                        {/* Simple collar */}
                                        <path d="M40 60 Q50 68 60 60" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                        {/* Pocket */}
                                        <path d="M60 75 L68 75 L68 83 L64 86 L60 83 Z" fill="rgba(255,255,255,0.3)" />
                                    </>
                                )}
                            </g>
                        )}
                    </g>
                </g>

                {/* Bandana for イヌダマシ */}
                {species === 'inudamashi' && !equippedOutfits?.clothes && !isSmall && (
                    <g>
                        <path d="M36 64 Q50 69 64 64 L62 70 Q50 74 38 70 Z" fill="#4CAF50" stroke="#388E3C" strokeWidth="0.4" />
                        <polygon points="50,70 47,78 53,78" fill="#388E3C" />
                    </g>
                )}

                {/* ===== ARMS ===== */}
                <motion.ellipse cx="32" cy="80" rx="7" ry="9" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(-15,32,80)"
                    animate={animate && !isSmall ? { rotate: [-15, -20, -15] } : undefined}
                    transition={{ duration: 3, repeat: Infinity }} style={isSmall ? undefined : { transformOrigin: '35px 74px' }} />
                <motion.ellipse cx="68" cy="80" rx="7" ry="9" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(15,68,80)"
                    animate={animate && !isSmall ? { rotate: [15, 20, 15] } : undefined}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.3 }} style={isSmall ? undefined : { transformOrigin: '65px 74px' }} />

                {/* Star wand for ハムリー */}
                {species === 'hamuri' && !isSmall && !equippedOutfits?.accessory && (
                    <g>
                        <line x1="28" y1="80" x2="16" y2="55" stroke="#FFCC80" strokeWidth="1.5" />
                        <path d="M16 55 L19 47 L27 49 L21 53 L24 61 L16 57 L8 61 L11 53 L5 49 L13 47 Z" fill="#FFF59D" stroke="#FBC02D" strokeWidth="0.5" />
                        <path d="M16 55 L18 50 L24 51.5 L19 54.5 L21 60 L16 57 L11 60 L13 54.5 L8 51.5 L14 50 Z" fill="#FFF9C4" />
                    </g>
                )}


                {/* ===== HEAD ===== */}
                <g>
                    {/* Ears */}
                    {hasLongEars && (
                        <>
                            <ellipse cx="37" cy="22" rx="7" ry="19" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(-10,37,22)" />
                            <ellipse cx="37" cy="22" rx="4" ry="14" fill={c.ear} opacity="0.3" transform="rotate(-10,37,22)" />
                            <ellipse cx="63" cy="22" rx="7" ry="19" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(10,63,22)" />
                            <ellipse cx="63" cy="22" rx="4" ry="14" fill={c.ear} opacity="0.3" transform="rotate(10,63,22)" />
                        </>
                    )}
                    {hasPointedEars && (
                        <>
                            <ellipse cx="35" cy="32" rx="8" ry="11" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(-16,35,32)" />
                            <ellipse cx="35" cy="32" rx="4.5" ry="7" fill={c.ear} opacity="0.25" transform="rotate(-16,35,32)" />
                            <ellipse cx="65" cy="32" rx="8" ry="11" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(16,65,32)" />
                            <ellipse cx="65" cy="32" rx="4.5" ry="7" fill={c.ear} opacity="0.25" transform="rotate(16,65,32)" />
                        </>
                    )}
                    {(species === 'cat' || species === 'hamster' || species === 'white_cat') && (
                        <>
                            {/* Extra Pointy Ears for Cat and Hamster (flush with head) */}
                            <path d="M34 38 L28 12 L46 32 Z" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.5" />
                            <path d="M36 34 L31 16 L42 30 Z" fill={c.ear} opacity="0.4" />
                            <path d="M66 38 L72 12 L54 32 Z" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.5" />
                            <path d="M64 34 L69 16 L58 30 Z" fill={c.ear} opacity="0.4" />
                        </>
                    )}
                    {hasRoundEars && (
                        <>
                            <ellipse cx="35" cy="34" rx="7" ry="7" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(-15,35,34)" />
                            <ellipse cx="35" cy="34" rx="4" ry="4" fill={c.ear} opacity="0.25" transform="rotate(-15,35,34)" />
                            <ellipse cx="65" cy="34" rx="7" ry="7" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(15,65,34)" />
                            <ellipse cx="65" cy="34" rx="4" ry="4" fill={c.ear} opacity="0.25" transform="rotate(15,65,34)" />
                            {species === 'pentanuki' && <>
                                <ellipse cx="35" cy="34" rx="6.5" ry="6.5" fill="#37474F" transform="rotate(-15,35,34)" />
                                <ellipse cx="65" cy="34" rx="6.5" ry="6.5" fill="#37474F" transform="rotate(15,65,34)" />
                            </>}
                            {species === 'panda' && <>
                                <ellipse cx="35" cy="34" rx="6.5" ry="6.5" fill="#212121" transform="rotate(-15,35,34)" />
                                <ellipse cx="65" cy="34" rx="6.5" ry="6.5" fill="#212121" transform="rotate(15,65,34)" />
                            </>}
                        </>
                    )}
                    {hasFloppyEars && (
                        <>
                            <ellipse cx="33" cy="40" rx="9" ry="6" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(-28,33,40)" />
                            <ellipse cx="33" cy="40" rx="5" ry="3.5" fill={c.ear} opacity="0.25" transform="rotate(-28,33,40)" />
                            <ellipse cx="67" cy="40" rx="9" ry="6" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.4" transform="rotate(28,67,40)" />
                            <ellipse cx="67" cy="40" rx="5" ry="3.5" fill={c.ear} opacity="0.25" transform="rotate(28,67,40)" />
                        </>
                    )}
                    {hasTuftEars && (
                        <>
                            <ellipse cx="50" cy="27" rx="2" ry="7" fill={c.accent} transform="rotate(-8,50,27)" />
                            <ellipse cx="53" cy="28" rx="1.5" ry="6" fill={c.body} transform="rotate(8,53,28)" />
                        </>
                    )}
                    {hasLeafEars && (
                        <>
                            <path d="M47 27 Q42 18 45 13 Q50 16 47 27" fill="#66BB6A" stroke="#43A047" strokeWidth="0.3" />
                            <path d="M53 27 Q58 18 55 13 Q50 16 53 27" fill="#81C784" stroke="#43A047" strokeWidth="0.3" />
                        </>
                    )}
                    {hasHornEars && (
                        <>
                            <path d="M36 32 L32 20 L41 29" fill={c.accent} />
                            <path d="M64 32 L68 20 L59 29" fill={c.accent} />
                        </>
                    )}

                    {/* Head */}
                    <circle cx="50" cy="44" r="20" fill={`url(#${uid}b)`} stroke={c.accent} strokeWidth="0.5" />

                    {/* Pentanuki Leaf & Raccoon mask */}
                    {species === 'pentanuki' && !isSmall && (
                        <>
                            <path d="M45 22 Q50 15 55 20 Q56 25 50 28 Q44 25 45 22 Z" fill="#81C784" stroke="#4CAF50" strokeWidth="0.5" />
                            <path d="M49 28 L50 20" fill="none" stroke="#4CAF50" strokeWidth="0.5" />
                            <path d="M34 40 Q40 38 44 41 L44 46 Q40 48 34 46 Z M66 40 Q60 38 56 41 L56 46 Q60 48 66 46 Z" fill="#5D4037" opacity="0.85" />
                        </>
                    )}

                    {/* Mochikuma Sakura Flower */}
                    {species === 'mochikuma' && !isSmall && !equippedOutfits?.hat && (
                        <g transform="translate(58, 28) scale(0.6)">
                            <path d="M0 -3 C4 -12 12 -2 0 1 C-12 -2 -4 -12 0 -3" fill="#F8BBD0" stroke="#F48FB1" strokeWidth="0.5" transform="rotate(0)" />
                            <path d="M0 -3 C4 -12 12 -2 0 1 C-12 -2 -4 -12 0 -3" fill="#F8BBD0" stroke="#F48FB1" strokeWidth="0.5" transform="rotate(72)" />
                            <path d="M0 -3 C4 -12 12 -2 0 1 C-12 -2 -4 -12 0 -3" fill="#F8BBD0" stroke="#F48FB1" strokeWidth="0.5" transform="rotate(144)" />
                            <path d="M0 -3 C4 -12 12 -2 0 1 C-12 -2 -4 -12 0 -3" fill="#F8BBD0" stroke="#F48FB1" strokeWidth="0.5" transform="rotate(216)" />
                            <path d="M0 -3 C4 -12 12 -2 0 1 C-12 -2 -4 -12 0 -3" fill="#F8BBD0" stroke="#F48FB1" strokeWidth="0.5" transform="rotate(288)" />
                            <circle cx="0" cy="0" r="2.5" fill="#F48FB1" />
                        </g>
                    )}

                    {/* Panda eyes */}
                    {species === 'panda' && (
                        <>
                            <ellipse cx="41" cy="43" rx="7.5" ry="6" fill="#212121" transform="rotate(-4,41,43)" />
                            <ellipse cx="59" cy="43" rx="7.5" ry="6" fill="#212121" transform="rotate(4,59,43)" />
                        </>
                    )}
                    {/* Fox face */}
                    {(species === 'fox' || species === 'wolf') && !isSmall && (
                        <path d="M35 45 Q50 53 65 45 Q50 58 35 45" fill={c.belly} opacity="0.7" />
                    )}

                    {/* ===== EYES ===== */}
                    <motion.g
                        animate={animate && !isSmall ? { scaleY: [1, 1, 0.05, 1, 1] } : undefined}
                        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.42, 0.46, 0.5, 1] }}
                        style={isSmall ? undefined : { transformOrigin: '50px 43px' }}
                    >
                        {species === 'mochikuma' ? (
                            <>
                                <circle cx="41" cy="45" r="2" fill={c.eye} />
                                <circle cx="59" cy="45" r="2" fill={c.eye} />
                            </>
                        ) : species === 'hamuri' ? (
                            <>
                                <circle cx="42" cy="44" r="2.5" fill={c.eye} />
                                <circle cx="58" cy="44" r="2.5" fill={c.eye} />
                                <circle cx="41" cy="43" r="1" fill="#FFF" />
                                <circle cx="57" cy="43" r="1" fill="#FFF" />
                            </>
                        ) : isSmall ? (
                            /* Simplified eyes for small size */
                            <>
                                <circle cx="42" cy="43" r="3" fill="#111" />
                                <circle cx="58" cy="43" r="3" fill="#111" />
                                <circle cx="41" cy="42" r="1.2" fill="white" opacity="0.9" />
                                <circle cx="57" cy="42" r="1.2" fill="white" opacity="0.9" />
                            </>
                        ) : (
                            /* Full detailed eyes */
                            <>
                                <ellipse cx="42" cy="43" rx="5" ry="5.5" fill="white" />
                                <ellipse cx="58" cy="43" rx="5" ry="5.5" fill="white" />
                                <ellipse cx="43" cy="43.5" rx="3.8" ry="4.2" fill={c.eye} />
                                <ellipse cx="57" cy="43.5" rx="3.8" ry="4.2" fill={c.eye} />
                                <circle cx="43.5" cy="43.5" r="2" fill="#0a0a0a" />
                                <circle cx="56.5" cy="43.5" r="2" fill="#0a0a0a" />
                                <circle cx="40.5" cy="41.5" r="1.8" fill="white" opacity="0.95" />
                                <circle cx="55.5" cy="41.5" r="1.8" fill="white" opacity="0.95" />
                                <circle cx="44.5" cy="45" r="0.8" fill="white" opacity="0.6" />
                                <circle cx="59" cy="45" r="0.8" fill="white" opacity="0.6" />
                            </>
                        )}
                    </motion.g>

                    {/* Nose */}
                    {species === 'pentanuki' && (
                        <ellipse cx="50" cy="51" rx="8" ry="6" fill="#FFEE58" />
                    )}
                    {species === 'mochikuma' ? (
                        <>
                            <ellipse cx="50" cy="50" rx="4.5" ry="3.5" fill="#FFF" opacity="0.9" />
                            <path d="M48.5 50.5 Q50 49 51.5 50.5" fill="none" stroke={c.nose} strokeWidth="0.8" strokeLinecap="round" />
                            <circle cx="50" cy="49" r="1.2" fill={c.nose} />
                        </>
                    ) : hasBeak ? (
                        <path d="M48 49 L50 53 L52 49 Z" fill={c.nose} />
                    ) : (
                        <ellipse cx="50" cy={species === 'pentanuki' ? "49.5" : "49"} rx={isSmall ? "1.8" : "2.2"} ry={isSmall ? "1.5" : "1.8"} fill={c.nose} />
                    )}

                    {/* Mouth & tongue */}
                    {!isSmall && species !== 'mochikuma' && (
                        <>
                            {species === 'hamuri' ? (
                                <path d="M48 52 Q50 54 52 52" fill="none" stroke={c.nose} strokeWidth="1" strokeLinecap="round" />
                            ) : (
                                <>
                                    <path d="M47 51 Q48.5 53.5 50 53 Q51.5 53.5 53 51" fill="none" stroke={c.nose} strokeWidth="0.8" strokeLinecap="round" />
                                    <ellipse cx="50" cy="53.5" rx="1.5" ry="1.2" fill="#FF8A9E" opacity="0.6" />
                                </>
                            )}
                        </>
                    )}

                    {/* Cheek blush */}
                    <ellipse cx="34" cy="49" rx={isSmall ? "3" : "4.5"} ry={isSmall ? "2" : "3"} fill={c.cheek} opacity="0.3" />
                    <ellipse cx="66" cy="49" rx={isSmall ? "3" : "4.5"} ry={isSmall ? "2" : "3"} fill={c.cheek} opacity="0.3" />

                    {/* Whiskers */}
                    {hasWhiskers && !isSmall && (
                        <>
                            {species === 'cat' || species === 'hamster' || species === 'white_cat' ? (
                                <>
                                    {/* Extra Long Whiskers */}
                                    <line x1="8" y1="46" x2="32" y2="48" stroke={c.accent} strokeWidth="0.5" opacity="0.7" />
                                    <line x1="5" y1="50" x2="33" y2="50" stroke={c.accent} strokeWidth="0.5" opacity="0.7" />
                                    <line x1="10" y1="54" x2="32" y2="52" stroke={c.accent} strokeWidth="0.5" opacity="0.7" />

                                    <line x1="92" y1="46" x2="68" y2="48" stroke={c.accent} strokeWidth="0.5" opacity="0.7" />
                                    <line x1="95" y1="50" x2="67" y2="50" stroke={c.accent} strokeWidth="0.5" opacity="0.7" />
                                    <line x1="90" y1="54" x2="68" y2="52" stroke={c.accent} strokeWidth="0.5" opacity="0.7" />
                                </>
                            ) : (
                                <>
                                    <line x1="27" y1="46" x2="37" y2="48" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
                                    <line x1="27" y1="49" x2="37" y2="49" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
                                    <line x1="63" y1="48" x2="73" y2="46" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
                                    <line x1="63" y1="49" x2="73" y2="49" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
                                </>
                            )}
                        </>
                    )}

                    {/* Clover for usapyon */}
                    {species === 'usapyon' && !isSmall && !equippedOutfits?.accessory && (
                        <g>
                            <line x1="50" y1="53" x2="50" y2="59" stroke="#66BB6A" strokeWidth="0.8" />
                            <circle cx="48" cy="58" r="1.5" fill="#66BB6A" />
                            <circle cx="52" cy="58" r="1.5" fill="#66BB6A" />
                            <circle cx="50" cy="56" r="1.5" fill="#66BB6A" />
                        </g>
                    )}
                </g>

                {/* ===== ACCESSORY ===== */}
                {equippedOutfits?.accessory && !isSmall && (
                    <motion.g animate={animate ? { y: [0, -1.5, 0] } : undefined} transition={{ duration: 2, repeat: Infinity }}>
                        {/* 1. Heart Sunglasses (💖) */}
                        {equippedOutfits.accessory === '💖' && (
                            <g>
                                {/* Bridge */}
                                <path d="M 47 37 Q 50 35 53 37" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" />
                                {/* Left Frame & Lens */}
                                <path d="M 42 50 C 33 40, 36 32, 42 37 C 48 32, 51 40, 42 50 Z"
                                    fill="rgba(248, 187, 208, 0.4)" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Right Frame & Lens */}
                                <path d="M 58 50 C 49 40, 52 32, 58 37 C 64 32, 67 40, 58 50 Z"
                                    fill="rgba(248, 187, 208, 0.4)" stroke="#E91E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Glossy Light Reflections */}
                                <path d="M 36 36 Q 36 40 38 43" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                                <path d="M 52 36 Q 52 40 54 43" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                            </g>
                        )}
                        {/* 2. Scarf (🧣) */}
                        {equippedOutfits.accessory === '🧣' && (
                            <g>
                                <path d="M 35 60 Q 50 66 65 60 Q 50 56 35 60 Z" fill="#D32F2F" />
                                <path d="M 58 61 L 58 74 L 64 74 L 63 60 Z" fill="#B71C1C" />
                                <path d="M 55 62 L 55 72 L 59 72 L 59 62 Z" fill="#D32F2F" />
                            </g>
                        )}
                        {/* 3. Bowtie (🎀) */}
                        {equippedOutfits.accessory === '🎀' && (
                            <g>
                                <path d="M 45 58 L 55 58 L 50 61 Z" fill="#E91E63" />
                                <path d="M 45 64 L 55 64 L 50 61 Z" fill="#E91E63" />
                                <circle cx="50" cy="61" r="1.5" fill="#C2185B" />
                            </g>
                        )}
                        {/* 4. Magic Wand (🪄) */}
                        {equippedOutfits.accessory === '🪄' && (
                            <g>
                                <line x1="68" y1="80" x2="80" y2="65" stroke="#795548" strokeWidth="2" />
                                <circle cx="80" cy="65" r="3" fill="#FFEE58" />
                                <path d="M 80 60 L 82 65 L 87 65 L 83 68 L 84 73 L 80 70 L 76 73 L 77 68 L 73 65 L 78 65 Z" fill="#FFF176" />
                            </g>
                        )}
                        {/* 5. Flower Crown (🌸) */}
                        {equippedOutfits.accessory === '🌸' && (
                            <g>
                                <path d="M 33 38 Q 50 45 67 38 Q 50 40 33 38 Z" fill="none" stroke="#81C784" strokeWidth="2" />
                                <circle cx="40" cy="39" r="2.5" fill="#F48FB1" />
                                <circle cx="50" cy="41" r="3" fill="#F06292" />
                                <circle cx="60" cy="39" r="2.5" fill="#F48FB1" />
                            </g>
                        )}
                        {/* 6. Guitar (🎸) */}
                        {equippedOutfits.accessory === '🎸' && (
                            <g>
                                <path d="M 35 85 L 65 65" stroke="#D7CCC8" strokeWidth="1" />
                                <rect x="30" y="75" width="20" height="15" rx="5" fill="#e57373" transform="rotate(-33, 40, 80)" />
                                <circle cx="43" cy="80" r="3" fill="#111" />
                                <rect x="52" y="66" width="18" height="3" fill="#8D6E63" transform="rotate(-33, 61, 67)" />
                            </g>
                        )}
                        {/* 7. Rainbow Cape (🌈) */}
                        {equippedOutfits.accessory === '🌈' && (
                            <g>
                                <path d="M 30 60 Q 20 80 25 100 L 75 100 Q 80 80 70 60 Q 50 70 30 60 Z" fill="url(#rainbowGrad)" opacity="0.8" />
                                <defs>
                                    <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f44336" />
                                        <stop offset="20%" stopColor="#ff9800" />
                                        <stop offset="40%" stopColor="#ffeb3b" />
                                        <stop offset="60%" stopColor="#4caf50" />
                                        <stop offset="80%" stopColor="#2196f3" />
                                        <stop offset="100%" stopColor="#9c27b0" />
                                    </linearGradient>
                                </defs>
                                <path d="M 35 60 Q 50 68 65 60" fill="none" stroke="#FFD54F" strokeWidth="2" />
                            </g>
                        )}
                        {/* 8. Shooting Star Pendant (💫) */}
                        {equippedOutfits.accessory === '💫' && (
                            <g>
                                <path d="M 40 60 Q 50 68 60 60" fill="none" stroke="#B0BEC5" strokeWidth="1" />
                                <circle cx="50" cy="65" r="3" fill="#FFCA28" />
                                <path d="M 50 62 L 51 65 L 54 65 L 52 67 L 53 70 L 50 68 L 47 70 L 48 67 L 46 65 L 49 65 Z" fill="#FFE082" />
                            </g>
                        )}

                        {/* Fallback for unknown accessories */}
                        {!(['💖', '🧣', '🎀', '🪄', '🌸', '🎸', '🌈', '💫'].includes(equippedOutfits.accessory)) && (
                            <>
                                <circle cx="82" cy="74" r="7" fill="rgba(255,200,50,0.1)" />
                                <text x="82" y="75" textAnchor="middle" fontSize="11" dominantBaseline="central">{equippedOutfits.accessory}</text>
                            </>
                        )}
                    </motion.g>
                )}

                {/* ===== HAT ===== */}
                {equippedOutfits?.hat && (
                    <motion.g animate={animate && !isSmall ? { y: [0, -1, 0] } : undefined} transition={{ duration: 3, repeat: Infinity }}>
                        {/* 1. Mini Ribbon (🎀) */}
                        {equippedOutfits.hat === '🎀' && (
                            <g>
                                <path d="M 50 24 L 42 20 L 42 28 Z" fill="#E91E63" />
                                <path d="M 50 24 L 58 20 L 58 28 Z" fill="#E91E63" />
                                <circle cx="50" cy="24" r="2.5" fill="#C2185B" />
                            </g>
                        )}
                        {/* 2. Pointy Hat (🔮) */}
                        {equippedOutfits.hat === '🔮' && (
                            <g>
                                <path d="M 33 28 Q 50 33 67 28" fill="none" stroke="#4527A0" strokeWidth="5" />
                                <path d="M 35 28 C 45 15, 45 5, 50 0 C 55 5, 55 15, 65 28 Z" fill="#5E35B1" />
                                <path d="M 38 22 C 45 15, 45 5, 50 0 Q 55 10 65 25 Z" fill="#7E57C2" opacity="0.5" />
                                <circle cx="50" cy="20" r="3" fill="#FFCA28" />
                            </g>
                        )}
                        {/* 3. Straw Hat (👒) */}
                        {equippedOutfits.hat === '👒' && (
                            <g>
                                <ellipse cx="50" cy="26" rx="20" ry="4" fill="#FFCC80" />
                                <path d="M 38 26 C 38 15, 42 12, 50 12 C 58 12, 62 15, 62 26 Z" fill="#FFA726" />
                                <path d="M 38 24 Q 50 26 62 24" fill="none" stroke="#E53935" strokeWidth="2" />
                            </g>
                        )}
                        {/* 4. Crown (👑) */}
                        {equippedOutfits.hat === '👑' && (
                            <g>
                                <path d="M 36 28 L 34 16 L 42 22 L 50 12 L 58 22 L 66 16 L 64 28 Z" fill="#FFCA28" />
                                <rect x="36" y="27" width="28" height="3" fill="#FFB300" />
                                <circle cx="34" cy="16" r="1.5" fill="#EF5350" />
                                <circle cx="50" cy="12" r="1.5" fill="#42A5F5" />
                                <circle cx="66" cy="16" r="1.5" fill="#66BB6A" />
                            </g>
                        )}
                        {/* 5. Party Hat (🎉) */}
                        {equippedOutfits.hat === '🎉' && (
                            <g>
                                <path d="M 40 28 L 50 5 L 60 28 Z" fill="#29B6F6" />
                                <circle cx="50" cy="4" r="2.5" fill="#FFCA28" />
                                <path d="M 40 28 L 60 28" stroke="#EF5350" strokeWidth="2" />
                                <path d="M 42 23 L 58 23" stroke="#4DB6AC" strokeWidth="2" />
                            </g>
                        )}
                        {/* 6. Cowboy Hat (🤠) */}
                        {equippedOutfits.hat === '🤠' && (
                            <g>
                                <path d="M 30 25 C 40 30, 60 30, 70 25 C 75 22, 65 20, 60 22 Q 50 24 40 22 C 35 20, 25 22, 30 25 Z" fill="#8D6E63" />
                                <path d="M 38 23 C 38 12, 43 8, 50 8 C 57 8, 62 12, 62 23 Z" fill="#795548" />
                                <path d="M 38 21 Q 50 23 62 21" fill="none" stroke="#3E2723" strokeWidth="1.5" />
                            </g>
                        )}
                        {/* 7. Knight Helmet (🛡️) */}
                        {equippedOutfits.hat === '🛡️' && (
                            <g>
                                <path d="M 35 25 C 35 5, 65 5, 65 25 L 65 35 Q 50 40 35 35 Z" fill="#B0BEC5" />
                                <path d="M 35 25 Q 50 28 65 25 L 65 35 Q 50 40 35 35 Z" fill="#90A4AE" />
                                <rect x="42" y="27" width="16" height="4" rx="1" fill="#263238" />
                                <rect x="48" y="20" width="4" height="7" fill="#263238" />
                            </g>
                        )}
                        {/* 8. Angel Halo (✨) */}
                        {equippedOutfits.hat === '✨' && (
                            <g>
                                <ellipse cx="50" cy="10" rx="12" ry="4" fill="none" stroke="#FFF59D" strokeWidth="2" />
                                <path d="M 50 4 L 51 1 L 52 4 L 55 5 L 52 6 L 51 9 L 50 6 L 47 5 Z" fill="#FFF" opacity="0.8" />
                            </g>
                        )}

                        {/* Fallback for unknown hats */}
                        {!(['🎀', '🔮', '👒', '👑', '🎉', '🤠', '🛡️', '✨'].includes(equippedOutfits.hat)) && (
                            <text x="50" y={isSmall ? "22" : "25"} textAnchor="middle" fontSize={isSmall ? "12" : "16"} dominantBaseline="central">{equippedOutfits.hat}</text>
                        )}
                    </motion.g>
                )}

                {/* Angel halo for ハムリー */}
                {species === 'hamuri' && !equippedOutfits?.hat && !isSmall && (
                    <motion.ellipse cx="50" cy="24" rx="11" ry="3" fill="none" stroke="#FFD54F" strokeWidth="1.2" opacity="0.6"
                        animate={animate ? { y: [0, -1, 0] } : undefined} transition={{ duration: 2.5, repeat: Infinity }} />
                )}

                {/* Sparkles */}
                {(species === 'hoshinashi' || species === 'sprite' || species === 'hamuri') && animate && !isSmall && (
                    <>
                        <motion.path d="M24 40 L25 37 L26 40 L25 43 Z" fill={species === 'hoshinashi' ? '#CE93D8' : '#FFD54F'} opacity="0.7"
                            animate={{ opacity: [0, 0.8, 0], y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity }} />
                        <motion.path d="M74 45 L75 42 L76 45 L75 48 Z" fill={species === 'hoshinashi' ? '#CE93D8' : '#FFD54F'} opacity="0.7"
                            animate={{ opacity: [0, 0.8, 0], y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }} />
                    </>
                )}
            </svg>
        </motion.div>
    )
}
