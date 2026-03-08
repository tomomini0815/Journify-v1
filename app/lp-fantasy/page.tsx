import Image from "next/image";
import Link from "next/link";
import { Noto_Serif_JP } from "next/font/google";
import { CheckCircle2, Circle, Navigation, Shield, Book, Star, ArrowLeft } from "lucide-react";

const notoSerifJP = Noto_Serif_JP({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
});

// Since the images are dynamic, we hardcode the known filenames from generation
const IMAGES = {
    bg: "/images/fantasy-lp/fantasy_desk_bg_1772967966215.png",
    journal: "/images/fantasy-lp/journal_card_bg_1772967979512.png",
    goals: "/images/fantasy-lp/goals_card_bg_1772967995848.png",
    tasks: "/images/fantasy-lp/tasks_card_bg_1772968008206.png",
    projects: "/images/fantasy-lp/projects_card_bg_1772968021064.png",
    dashboard: "/images/fantasy-lp/dashboard_card_bg_1772968037656.png",
    hero: "/images/fantasy-lp/fantasy_hero_bg_1772970004297.png",
    companions: "/images/fantasy-lp/fantasy_companions_bg_1772970021105.png",
    pricing: "/images/fantasy-lp/fantasy_pricing_bg_1772970039475.png",
    footer: "/images/fantasy-lp/fantasy_footer_bg_1772970056611.png",
};

export default function FantasyLP() {
    return (
        <div className={`relative min-h-screen w-full bg-[#2a1f18] text-[#e8dccb] overflow-x-hidden ${notoSerifJP.className} selection:bg-amber-900/30`}>
            {/* Background Texture - Dark Wooden Desk */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-multiply">
                <Image
                    src={IMAGES.bg}
                    alt="Antique desk background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="relative z-10 w-full space-y-16 lg:space-y-32 pb-24 drop-shadow-2xl">

                {/* --- 1. Hero Section --- */}
                <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden border-b-4 border-amber-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                    <Image
                        src={IMAGES.hero}
                        alt="Magical library hero background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#2a1f18]"></div>
                    <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-4 mt-10">
                        <div className="inline-block p-1 border-y border-amber-500/30 mb-4">
                            <p className="text-amber-200/80 tracking-[0.3em] uppercase text-sm font-semibold text-shadow-sm">Life Logging RPG</p>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-yellow-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] pb-2">
                            Journify
                        </h1>
                        <p className="text-2xl md:text-3xl text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-relaxed">
                            人生という名の冒険を記録せよ
                        </p>
                        <p className="text-lg text-[#d4c5a9] max-w-2xl mx-auto drop-shadow-md">
                            日々のタスクや習慣の達成が、あなたを成長させる経験値となる。
                            魔法の書に記録を刻み、未だ見ぬ景色への扉を開こう。
                        </p>
                        <div className="pt-8">
                            <Link href="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-b from-amber-600 to-amber-900 border-2 border-amber-400 hover:border-yellow-300 text-white rounded-sm font-bold tracking-widest text-xl uppercase transition-all duration-300 shadow-[0_0_30px_rgba(217,119,6,0.5)] hover:shadow-[0_0_50px_rgba(253,224,71,0.6)] hover:-translate-y-1 group">
                                <Book className="w-6 h-6 group-hover:rotate-12 transition-transform" /> 冒険の書を作る（無料）
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
                    {/* --- 2. Features Section --- */}
                    <section className="space-y-12">
                        {/* Header / Title Section */}
                        <div className="text-center space-y-4 pt-10 pb-8 relative">
                            <div className="absolute inset-0 bg-yellow-900/40 blur-3xl rounded-full max-w-2xl mx-auto -z-10 opacity-50"></div>
                            <h2 className="text-5xl md:text-6xl font-bold tracking-wider text-[#f4ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                主要な機能
                            </h2>
                            <p className="text-xl md:text-2xl text-[#d4c5a9] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-3xl mx-auto">
                                冒険者たちの旅路を支える、強力な魔法のアーティファクト
                            </p>
                        </div>

                        {/* Feature Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                            {/* Card 1: Journal */}
                            <div className="relative rounded-sm overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2 duration-500 min-h-[400px]">
                                <Image src={IMAGES.journal} alt="Journal Background" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#2B1B3D]/90 via-[#2B1B3D]/80 to-transparent p-8 md:p-10 flex flex-col justify-center w-[75%]">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-purple-900/80 rounded-lg shadow-inner border border-purple-500/30">
                                            <Book className="w-6 h-6 text-purple-300" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-purple-100 drop-shadow-md">ジャーナル</h2>
                                    </div>
                                    <ul className="space-y-3 font-medium text-lg text-purple-50/90 drop-shadow-sm">
                                        <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-1" /> リッチテキストエディタで自由な記述</li>
                                        <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-1" /> 気分・感情の評価とタグ付け</li>
                                        <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-1" /> 音声ジャーナルの自動文字起こし</li>
                                        <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-1" /> AIによる思考のマインドマップ</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Card 2: Goals */}
                            <div className="relative rounded-sm overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2 duration-500 min-h-[400px]">
                                <Image src={IMAGES.goals} alt="Goals Background" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#DFD6B6]/95 via-[#DFD6B6]/80 to-transparent p-8 md:p-10 flex flex-col justify-center w-[75%] text-[#4A3C2B]">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-[#8B9869]/20 rounded-full shadow-inner border border-amber-900/20">
                                            <Navigation className="w-6 h-6 text-[#5C6E3F]" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-[#3E4F28] drop-shadow-sm">目標管理</h2>
                                    </div>
                                    <ul className="space-y-3 font-medium text-lg text-[#5a4f3b]">
                                        <li className="flex items-start gap-3"><b className="text-[#6D8B4D] text-xl mt-0.5">✓</b> 進捗を10%刻みで更新可能</li>
                                        <li className="flex items-start gap-3"><b className="text-[#6D8B4D] text-xl mt-0.5">✓</b> 達成率の可視化とリマインダー</li>
                                        <li className="flex items-start gap-3"><b className="text-[#6D8B4D] text-xl mt-0.5">✓</b> 達成時のお祝いメッセージ</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Card 3: Tasks */}
                            <div className="relative rounded-sm overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2 duration-500 min-h-[350px]">
                                <Image src={IMAGES.tasks} alt="Tasks Background" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#20406A]/95 via-[#20406A]/80 to-transparent p-8 md:p-10 flex flex-col justify-center w-[75%]">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-blue-500/20 rounded-full shadow-inner border border-blue-400/30">
                                            <Shield className="w-6 h-6 text-blue-200" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-blue-50 drop-shadow-md">タスク管理</h2>
                                    </div>
                                    <ul className="space-y-4 font-medium text-lg text-blue-100/90">
                                        <li className="flex items-start gap-3"><Circle className="w-4 h-4 text-blue-400 shrink-0 mt-1.5 fill-blue-400" /> タスクとプロジェクトの紐付け</li>
                                        <li className="flex items-start gap-3"><Circle className="w-4 h-4 text-blue-400 shrink-0 mt-1.5 fill-blue-400" /> スケジュールとカラー設定</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Card 4: Projects */}
                            <div className="relative rounded-sm overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2 duration-500 min-h-[350px]">
                                <Image src={IMAGES.projects} alt="Projects Background" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#F2E8D5]/95 via-[#F2E8D5]/80 to-transparent p-8 md:p-10 flex flex-col justify-center w-[75%] text-[#5C4033]">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-amber-900/10 rounded-sm shadow-inner border border-amber-900/20">
                                            <Star className="w-6 h-6 text-[#A0522D]" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-[#8B4513] drop-shadow-sm">プロジェクト管理</h2>
                                    </div>
                                    <ul className="space-y-4 font-medium text-lg text-[#6A4E23]">
                                        <li className="flex items-start gap-3"><b className="text-[#C68E17] text-xl mt-0.5">✓</b> ガントチャート風タイムラインビュー</li>
                                        <li className="flex items-start gap-3"><b className="text-[#C68E17] text-xl mt-0.5">✓</b> マイルストーン設定と祝日表示</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Card 5: Dashboard */}
                            <div className="md:col-span-2 relative rounded-sm overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-2 duration-500 min-h-[350px]">
                                <Image src={IMAGES.dashboard} alt="Dashboard Background" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-[#0F172A]/80 flex flex-col justify-center p-8 md:p-12">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-indigo-900/50 rounded-full shadow-inner border border-indigo-500/20 backdrop-blur-sm">
                                            <Star className="w-6 h-6 text-indigo-300" />
                                        </div>
                                        <h2 className="text-4xl font-bold text-indigo-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">ダッシュボード ＆ 分析</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                        <ul className="space-y-4 font-medium text-xl text-indigo-200/90 drop-shadow-md">
                                            <li className="flex items-start gap-3"><Circle className="w-4 h-4 text-purple-400 shrink-0 mt-2 fill-purple-400" /> 統計情報と気分推移グラフの可視化</li>
                                        </ul>
                                        <ul className="space-y-4 font-medium text-xl text-indigo-200/90 drop-shadow-md">
                                            <li className="flex items-start gap-3"><Circle className="w-4 h-4 text-purple-400 shrink-0 mt-2 fill-purple-400" /> ビジョンボードと未来の自分への手紙</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- 3. Companions / Gamification Section --- */}
                <section className="relative w-full min-h-[600px] flex items-center mt-24 border-y-4 border-[#3A2A1A] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                    <Image
                        src={IMAGES.companions}
                        alt="Adventurer's Tavern Background"
                        fill
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 space-y-6 text-amber-50">
                            <div className="inline-block p-2 bg-[#8B4513]/80 border border-amber-600 rounded-sm shadow-md backdrop-blur-sm">
                                <p className="text-amber-200 tracking-widest text-sm font-bold uppercase flex items-center gap-2"><Star className="w-4 h-4" /> Companions</p>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                頼れる相棒たち
                            </h2>
                            <p className="text-xl text-amber-100/90 drop-shadow-md leading-relaxed">
                                孤独な冒険も、彼らがいれば恐縮（きょうしゅく）なし。<br />
                                タスクをこなして経験値を稼ぎ、相棒を育成しよう。<br />
                                手に入れたゴールドで、魔法の帽子や鎧を着せ替えることも可能だ。
                            </p>
                            <ul className="space-y-3 font-medium text-lg text-amber-50">
                                <li className="flex items-center gap-3"><b className="text-[#C68E17] text-2xl">♦</b> レベルアップで解放される特殊なアニメーション</li>
                                <li className="flex items-center gap-3"><b className="text-[#C68E17] text-2xl">♦</b> 豊富な着せ替えアイテム（帽子・服・アクセサリー）</li>
                                <li className="flex items-center gap-3"><b className="text-[#C68E17] text-2xl">♦</b> なかよし度によるマイルストーン報酬と称号</li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-4">
                            {/* Placeholder dummy pet cards styled to blend in */}
                            <div className="aspect-square bg-gradient-to-br from-[#2a1f18]/90 to-black/90 border-2 border-amber-700/50 rounded-lg p-4 flex flex-col items-center justify-center gap-3 shadow-[0_0_15px_rgba(217,119,6,0.3)] backdrop-blur-md transform transition-transform hover:-translate-y-2">
                                <div className="text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🐱</div>
                                <span className="text-amber-200 font-bold tracking-wider">見習いネコ</span>
                                <span className="text-xs text-amber-500/80 bg-black/50 px-2 py-1 rounded-full border border-amber-900">Lv.15</span>
                            </div>
                            <div className="aspect-square bg-gradient-to-br from-[#2a1f18]/90 to-black/90 border-2 border-amber-700/50 rounded-lg p-4 flex flex-col items-center justify-center gap-3 shadow-[0_0_15px_rgba(217,119,6,0.3)] backdrop-blur-md transform transition-transform hover:-translate-y-2 translate-y-6">
                                <div className="text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🦝</div>
                                <span className="text-amber-200 font-bold tracking-wider">森のペンタヌキ</span>
                                <span className="text-xs text-amber-500/80 bg-black/50 px-2 py-1 rounded-full border border-amber-900">Lv.42</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 mt-24">
                    {/* --- 4. Pricing / Guild Registration Section --- */}
                    <section className="relative w-full rounded-md overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-[#4a3b2c] min-h-[600px] flex items-center justify-center">
                        <Image
                            src={IMAGES.pricing}
                            alt="Adventurer Guild Notice Board"
                            fill
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

                        <div className="relative z-10 w-full py-16 px-4">
                            <div className="text-center space-y-4 pb-12">
                                <h2 className="text-4xl md:text-5xl font-bold tracking-widest text-[#f4ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                                    ギルド登録階級
                                </h2>
                                <p className="text-xl text-[#d4c5a9] drop-shadow-md">
                                    あなたに合った階級を選び、冒険の準備を整えよう
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {/* Free Plan (Novice) */}
                                <div className="bg-[#EAE0C8]/95 p-8 rounded-sm shadow-2xl border-4 border-[#8B7355] text-[#3E2723] transform transition-transform hover:scale-105 duration-300 relative">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#8B7355] rounded-full border-2 border-[#EAE0C8] shadow-md flex items-center justify-center">
                                        <b className="text-white">銅</b>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2">ノービス（無料）</h3>
                                    <p className="text-[#5D4037] mb-6 font-semibold">日々の記録を始める見習い冒険者へ</p>
                                    <div className="text-4xl font-bold mb-8 font-sans">0 G <span className="text-lg text-[#795548] font-normal">/ 永遠に</span></div>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#8D6E63]" /> 基本的なジャーナルとタスク管理</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#8D6E63]" /> 初期ペットの同行</li>
                                        <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#8D6E63]" /> シンプルな目標管理</li>
                                    </ul>
                                    <Link href="/login" className="block w-full text-center py-3 bg-[#8B7355] hover:bg-[#5D4037] text-white font-bold rounded-sm border-2 border-[#3E2723] transition-colors shadow-inner">
                                        ギルドに無料登録
                                    </Link>
                                </div>

                                {/* Pro Plan (Master) */}
                                <div className="bg-gradient-to-b from-[#FFF8E7] to-[#F1E0B3] p-8 rounded-sm shadow-[0_0_30px_rgba(255,215,0,0.4)] border-4 border-[#B8860B] text-[#5C4033] transform transition-transform hover:scale-105 duration-300 relative">
                                    <div className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full border-4 border-[#FFF8E7] shadow-lg flex items-center justify-center">
                                        <b className="text-white text-xl drop-shadow-md">金</b>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                                        推奨
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2 text-[#8B4513]">マスター（Pro）</h3>
                                    <p className="text-[#A0522D] mb-6 font-semibold">限界を越えたい熟練の冒険者へ</p>
                                    <div className="text-4xl font-bold mb-8 font-sans">980 G <span className="text-lg text-[#CD853F] font-normal">/ 月</span></div>
                                    <ul className="space-y-4 mb-8 font-semibold">
                                        <li className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-600 fill-yellow-600" /> AIによる高度な分析・マインドマップ</li>
                                        <li className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-600 fill-yellow-600" /> 全てのペットとレア装備の解放</li>
                                        <li className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-600 fill-yellow-600" /> 無制限のファイルアップロード</li>
                                        <li className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-600 fill-yellow-600" /> プロジェクトのガントチャート表示</li>
                                    </ul>
                                    <Link href="/login" className="block w-full text-center py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-yellow-950 font-bold rounded-sm border-2 border-yellow-700 transition-colors shadow-lg">
                                        マスター契約を結ぶ
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- 5. Footer / Final CTA --- */}
                <section className="relative w-full min-h-[50vh] flex items-center justify-center mt-32 border-t-8 border-black">
                    <Image
                        src={IMAGES.footer}
                        alt="Magical Glowing Door"
                        fill
                        className="object-cover object-bottom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="relative z-10 text-center space-y-8 w-full max-w-3xl px-4 pt-32 pb-16">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-widest text-[#f4ecd8] drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                            さあ、未踏の地へ。
                        </h2>
                        <p className="text-xl text-[#d4c5a9] drop-shadow-lg">
                            物語の主人公はあなた自身。<br />最初の一歩を踏み出す準備はできましたか？
                        </p>
                        <div className="pt-6">
                            <Link href="/login" className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-yellow-700 via-amber-600 to-yellow-700 hover:from-yellow-600 hover:via-amber-500 hover:to-yellow-600 text-white rounded-sm font-bold tracking-widest text-xl uppercase transition-all duration-500 shadow-[0_0_40px_rgba(253,224,71,0.5)] hover:shadow-[0_0_80px_rgba(253,224,71,0.8)] border border-yellow-400">
                                扉を開く
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Back to main site floating button */}
                <div className="fixed bottom-8 right-8 z-50">
                    <Link href="/" className="flex items-center gap-2 px-6 py-3 bg-black/80 hover:bg-black text-amber-500 rounded-full font-bold tracking-widest text-sm uppercase transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-amber-900 hover:border-amber-500 backdrop-blur-md group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> メイン版へ戻る
                    </Link>
                </div>

            </div>
        </div>
    );
}
