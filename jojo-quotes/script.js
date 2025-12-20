// JoJo quotes styled as famous world quotes
const quotes = [
    {
        text: "あなたが次に言うセリフは「なんだと!?」だ!",
        author: "ジョセフ・ジョースター",
        title: "戦略家・冒険家",
        category: "wisdom",
        context: "真の知恵とは、相手の次の一手を読むことである。人生において先を見通す力こそが、最大の武器となる。",
        gradient: "var(--gradient-1)"
    },
    {
        text: "おまえは今まで食ったパンの枚数をおぼえているのか?",
        author: "ディオ・ブランドー",
        title: "哲学者・思想家",
        category: "wisdom",
        context: "人は自らの行いの全てを記憶することはできない。しかし、その行いの積み重ねが今の自分を作っているのだ。",
        gradient: "var(--gradient-2)"
    },
    {
        text: "人間讃歌は「勇気」の讃歌ッ!! 人間のすばらしさは勇気のすばらしさ!!",
        author: "ウィル・A・ツェペリ",
        title: "武道家・教育者",
        category: "courage",
        context: "人間の本質は勇気にある。恐怖に立ち向かい、正しいと信じる道を進む勇気こそが、人を偉大にする。",
        gradient: "var(--gradient-3)"
    },
    {
        text: "やれやれだぜ",
        author: "空条承太郎",
        title: "海洋学者・平和活動家",
        category: "determination",
        context: "どんな困難に直面しても、冷静さを失わず淡々と対処する。それが真の強さである。",
        gradient: "var(--gradient-4)"
    },
    {
        text: "黄金の精神は、ぼくらの中に眠っているんだ",
        author: "ジョルノ・ジョバァーナ",
        title: "改革者・指導者",
        category: "justice",
        context: "誰もが内に秘めた高潔な精神を持っている。それを目覚めさせ、正義のために行動することが使命である。",
        gradient: "var(--gradient-5)"
    },
    {
        text: "覚悟とは!! 犠牲の心ではないッ! 覚悟とは暗闇の荒野に進むべき道を切り開く事だッ!",
        author: "ジャイロ・ツェペリ",
        title: "革命家・騎手",
        category: "determination",
        context: "真の覚悟とは、未知への恐怖を乗り越え、自ら道を切り開く決意である。それは犠牲ではなく、創造の精神だ。",
        gradient: "var(--gradient-6)"
    },
    {
        text: "ぼくは「正しい」と思ったからやったんだ。後悔はない…こんな世界とはいえ…正しいと信じられることをやったんだ",
        author: "ジョニィ・ジョースター",
        title: "騎手・探求者",
        category: "justice",
        context: "自分の信念に従って行動することが最も重要だ。結果がどうであれ、正しいと信じた道を進んだなら後悔はない。",
        gradient: "var(--gradient-1)"
    },
    {
        text: "きさま! 見ているなッ!",
        author: "ジョセフ・ジョースター",
        title: "戦略家・冒険家",
        category: "wisdom",
        context: "観察力こそが勝利への鍵である。相手の動きを見逃さず、常に注意深くあれ。",
        gradient: "var(--gradient-2)"
    },
    {
        text: "震えるぞハート! 燃えつきるほどヒート!!",
        author: "ジョセフ・ジョースター",
        title: "戦略家・冒険家",
        category: "courage",
        context: "情熱を持って生きることの素晴らしさ。心が震え、魂が燃え上がるような体験こそが人生を豊かにする。",
        gradient: "var(--gradient-3)"
    },
    {
        text: "てめーは おれを怒らせた",
        author: "空条承太郎",
        title: "海洋学者・平和活動家",
        category: "justice",
        context: "正義に反する行為には、毅然とした態度で臨むべきである。怒りは時に、正義を貫く力となる。",
        gradient: "var(--gradient-4)"
    },
    {
        text: "ありのまま 今 起こった事を話すぜ!",
        author: "ジャン=ピエール・ポルナレフ",
        title: "剣士・騎士",
        category: "wisdom",
        context: "真実をありのままに語ることの重要性。どんなに信じがたい出来事でも、事実は事実として受け入れなければならない。",
        gradient: "var(--gradient-5)"
    },
    {
        text: "グレート! だが、もう遅い",
        author: "ディオ・ブランドー",
        title: "哲学者・思想家",
        category: "wisdom",
        context: "タイミングの重要性を説く言葉。どんなに素晴らしい行動も、時機を逸すれば意味をなさない。",
        gradient: "var(--gradient-6)"
    },
    {
        text: "おれは人間をやめるぞ! ジョジョーーッ!!",
        author: "ディオ・ブランドー",
        title: "哲学者・思想家",
        category: "determination",
        context: "限界を超えようとする決意。人間の枠を超えた存在になろうとする野心と覚悟の表明。",
        gradient: "var(--gradient-1)"
    },
    {
        text: "きさまッ! 見ているなッ!",
        author: "ジョセフ・ジョースター",
        title: "戦略家・冒険家",
        category: "courage",
        context: "敵の策略を見抜く洞察力。常に警戒を怠らず、相手の意図を読み取る重要性を説く。",
        gradient: "var(--gradient-2)"
    },
    {
        text: "だが断る",
        author: "岸辺露伴",
        title: "漫画家・芸術家",
        category: "determination",
        context: "自分の信念を貫く強さ。他者の要求に屈せず、自らの意志を明確に示すことの大切さ。",
        gradient: "var(--gradient-3)"
    },
    {
        text: "オラオラオラオラオラオラオラ!!",
        author: "空条承太郎",
        title: "海洋学者・平和活動家",
        category: "courage",
        context: "圧倒的な力で悪を打ち砕く。正義のために全力で立ち向かう姿勢を表現した言葉。",
        gradient: "var(--gradient-4)"
    },
    {
        text: "無駄無駄無駄無駄無駄無駄無駄!!",
        author: "ディオ・ブランドー",
        title: "哲学者・思想家",
        category: "determination",
        context: "絶対的な自信の表れ。相手の抵抗が無意味であることを示す、圧倒的な力の象徴。",
        gradient: "var(--gradient-5)"
    },
    {
        text: "きみが泣くまで殴るのをやめないッ!",
        author: "ジョルノ・ジョバァーナ",
        title: "改革者・指導者",
        category: "justice",
        context: "悪に対する徹底的な制裁。中途半端な対処ではなく、完全に正義を貫く決意の表明。",
        gradient: "var(--gradient-6)"
    },
    {
        text: "『幸福』とは、『幸福』を探す旅路の中にこそある",
        author: "ジャイロ・ツェペリ",
        title: "革命家・騎手",
        category: "wisdom",
        context: "人生の真理を説く言葉。幸福は目的地ではなく、それを求める過程にこそ存在する。",
        gradient: "var(--gradient-1)"
    },
    {
        text: "ぼくは『最高にハイ!』ってやつだアアアアアアハハハハハーッ",
        author: "ディオ・ブランドー",
        title: "哲学者・思想家",
        category: "determination",
        context: "極限の高揚感。人生において最高の瞬間を味わうことの素晴らしさを表現した言葉。",
        gradient: "var(--gradient-2)"
    },
    {
        text: "きさまッ! 見ているなッ!",
        author: "ジョセフ・ジョースター",
        title: "戦略家・冒険家",
        category: "wisdom",
        context: "相手の行動を予測し、先手を打つ戦略的思考の重要性を説く。",
        gradient: "var(--gradient-3)"
    },
    {
        text: "このディオに近づくなああーーーーーッ",
        author: "ディオ・ブランドー",
        title: "哲学者・思想家",
        category: "courage",
        context: "危機的状況における叫び。恐怖と警戒の表現であり、同時に自己防衛の本能を示す。",
        gradient: "var(--gradient-4)"
    },
    {
        text: "メメタァ",
        author: "ディオ・ブランドー",
        title: "哲学者・思想家",
        category: "determination",
        context: "勝利の瞬間における叫び。圧倒的な力で相手を制圧した時の高揚感を表現。",
        gradient: "var(--gradient-5)"
    },
    {
        text: "ニョホホホホ",
        author: "ファニー・ヴァレンタイン",
        title: "大統領・愛国者",
        category: "wisdom",
        context: "余裕と自信の表れ。どんな状況でも冷静さを保ち、計画通りに事を進める知恵。",
        gradient: "var(--gradient-6)"
    },
    {
        text: "レロレロレロレロレロレロレロ",
        author: "花京院典明",
        title: "学生・戦士",
        category: "friendship",
        context: "仲間との絆を深めるユーモア。困難な状況でも笑いを忘れない心の余裕。",
        gradient: "var(--gradient-1)"
    },
    {
        text: "おれは仲間を信じる! それだけだ!",
        author: "ブローノ・ブチャラティ",
        title: "リーダー・守護者",
        category: "friendship",
        context: "仲間への絶対的な信頼。チームワークの基盤となる、揺るぎない信念の表明。",
        gradient: "var(--gradient-2)"
    },
    {
        text: "アリアリアリアリアリアリアリ!! アリーヴェデルチ!",
        author: "ブローノ・ブチャラティ",
        title: "リーダー・守護者",
        category: "courage",
        context: "別れの挨拶と共に敵を倒す。優雅さと強さを兼ね備えた、真のリーダーの姿勢。",
        gradient: "var(--gradient-3)"
    },
    {
        text: "ぼくの名は『エンポリオ』です",
        author: "エンポリオ・アルニーニョ",
        title: "少年・継承者",
        category: "determination",
        context: "自己紹介に込められた決意。どんなに小さな存在でも、自分の名を誇りを持って名乗る勇気。",
        gradient: "var(--gradient-4)"
    }
];

// DOM Elements
const quotesGrid = document.getElementById('quotesGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('quoteModal');
const modalClose = document.getElementById('modalClose');
const modalQuote = document.getElementById('modalQuote');
const modalAuthor = document.getElementById('modalAuthor');
const modalContext = document.getElementById('modalContext');
const shareBtn = document.getElementById('shareBtn');

let currentFilter = 'all';

// Initialize
function init() {
    renderQuotes(quotes);
    setupEventListeners();
}

// Render quotes
function renderQuotes(quotesToRender) {
    quotesGrid.innerHTML = '';

    quotesToRender.forEach((quote, index) => {
        const card = document.createElement('div');
        card.className = 'quote-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="quote-icon">"</div>
            <p class="quote-text">${quote.text}</p>
            <p class="quote-author">${quote.author}</p>
            <p class="quote-title">${quote.title}</p>
            <span class="quote-category">${getCategoryName(quote.category)}</span>
        `;

        card.addEventListener('click', () => openModal(quote));
        quotesGrid.appendChild(card);
    });
}

// Get category name in Japanese
function getCategoryName(category) {
    const categories = {
        courage: '勇気',
        justice: '正義',
        friendship: '友情',
        determination: '決意',
        wisdom: '知恵'
    };
    return categories[category] || category;
}

// Filter quotes
function filterQuotes(category) {
    currentFilter = category;

    if (category === 'all') {
        renderQuotes(quotes);
    } else {
        const filtered = quotes.filter(quote => quote.category === category);
        renderQuotes(filtered);
    }
}

// Open modal
function openModal(quote) {
    modalQuote.textContent = `"${quote.text}"`;
    modalAuthor.textContent = `— ${quote.author}`;
    modalContext.textContent = quote.context;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Share quote
function shareQuote() {
    const quoteText = modalQuote.textContent;
    const author = modalAuthor.textContent;
    const shareText = `${quoteText}\n${author}\n\n世界の名言集より`;

    if (navigator.share) {
        navigator.share({
            title: '世界の名言集',
            text: shareText,
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('名言をクリップボードにコピーしました！');
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterQuotes(btn.dataset.category);
        });
    });

    modalClose.addEventListener('click', closeModal);

    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

    shareBtn.addEventListener('click', shareQuote);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
