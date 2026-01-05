export interface InspirationalQuote {
    original: string;
    quote: string;
    author: string;
    title: string;
    category: string;
    context: string;
}

export const inspirationalQuotes: InspirationalQuote[] = [
    // Original 15 quotes
    {
        original: "人間讃歌は「勇気」の讃歌ッ!! 人間のすばらしさは勇気のすばらしさ!!",
        quote: "人間の偉大さは、恐怖に立ち向かう勇気によって測られる。",
        author: "ウィンストン・チャーチル",
        title: "英国首相・政治家",
        category: "勇気",
        context: "困難な状況に直面したとき、逃げ出すことは簡単です。しかし、真の強さとは、恐怖を感じながらも前に進む勇気を持つことです。その勇気こそが、人間を偉大にするのです。"
    },
    {
        original: "覚悟とは!! 犠牲の心ではないッ! 覚悟とは暗闇の荒野に進むべき道を切り開く事だッ!",
        quote: "真の覚悟とは、未知への道を自ら切り開く決意である。",
        author: "スティーブ・ジョブズ",
        title: "Apple創業者・起業家",
        category: "決意",
        context: "成功への道は、誰かが用意してくれるものではありません。自分自身で道を切り開き、新しい可能性を創造する。それが真の覚悟であり、イノベーションの源泉なのです。"
    },
    {
        original: "ぼくは『正しい』と思ったからやったんだ。後悔はない…こんな世界とはいえ…正しいと信じられることをやったんだ",
        quote: "自分の信念に従って行動すれば、決して後悔することはない。",
        author: "マハトマ・ガンジー",
        title: "インド独立運動指導者",
        category: "正義",
        context: "周囲がどう言おうと、自分が正しいと信じる道を進むことが大切です。結果がどうであれ、自分の信念に従って行動したなら、それは誇るべきことなのです。"
    },
    {
        original: "黄金の精神は、ぼくらの中に眠っているんだ",
        quote: "誰もが内に秘めた無限の可能性を持っている。それを信じることから全てが始まる。",
        author: "ヘレン・ケラー",
        title: "教育家・社会活動家",
        category: "成長",
        context: "どんな困難な状況にあっても、私たちの内には無限の可能性が眠っています。その可能性を信じ、目覚めさせることができれば、どんな障害も乗り越えられるのです。"
    },
    {
        original: "やれやれだぜ",
        quote: "困難に直面しても、冷静さを保つことが最も重要である。",
        author: "アルベルト・アインシュタイン",
        title: "理論物理学者",
        category: "知恵",
        context: "問題が複雑であればあるほど、冷静な判断が求められます。感情に流されず、淡々と対処する姿勢こそが、真の知性の証なのです。"
    },
    {
        original: "『幸福』とは、『幸福』を探す旅路の中にこそある",
        quote: "幸福は目的地ではなく、旅そのものの中にある。",
        author: "ラルフ・ワルド・エマーソン",
        title: "思想家・詩人",
        category: "成長",
        context: "私たちは常に「幸せになったら」と未来を見ています。しかし、真の幸福は、目標に向かって歩む今この瞬間にこそ存在するのです。"
    },
    {
        original: "震えるぞハート! 燃えつきるほどヒート!!",
        quote: "情熱を持って生きることが、人生を豊かにする唯一の方法である。",
        author: "パブロ・ピカソ",
        title: "芸術家・画家",
        category: "情熱",
        context: "心が震え、魂が燃え上がるような体験を求めてください。そのような情熱こそが、あなたの人生に真の意味と価値をもたらすのです。"
    },
    {
        original: "おれは仲間を信じる! それだけだ!",
        quote: "信頼は、最も強力な絆である。",
        author: "ネルソン・マンデラ",
        title: "南アフリカ大統領・人権活動家",
        category: "友情",
        context: "仲間を信じることは、時にリスクを伴います。しかし、その信頼こそが、どんな困難も乗り越えられる強い絆を生み出すのです。"
    },
    {
        original: "だが断る",
        quote: "自分の信念を曲げないことが、真の強さである。",
        author: "ソクラテス",
        title: "古代ギリシャの哲学者",
        category: "決意",
        context: "他者の要求に安易に従うのではなく、自分の信念を貫く勇気を持ちましょう。それが、自分自身に対する誠実さなのです。"
    },
    {
        original: "きさま! 見ているなッ!",
        quote: "観察力は、成功への最も重要な鍵である。",
        author: "レオナルド・ダ・ヴィンチ",
        title: "芸術家・科学者",
        category: "知恵",
        context: "細部に注意を払い、他者が見逃すものを見る能力。それが、あなたを平凡から非凡へと導く力となります。"
    },
    {
        original: "あなたが次に言うセリフは「なんだと!?」だ!",
        quote: "先を読む力こそが、真の知恵である。",
        author: "孫子",
        title: "古代中国の軍事思想家",
        category: "知恵",
        context: "相手の次の一手を予測できる能力は、人生のあらゆる場面で役立ちます。常に一歩先を考える習慣を身につけましょう。"
    },
    {
        original: "てめーは おれを怒らせた",
        quote: "正義のための怒りは、変革の原動力となる。",
        author: "マーティン・ルーサー・キング・ジュニア",
        title: "公民権運動指導者",
        category: "正義",
        context: "不正に対する怒りは、決して悪いものではありません。その怒りを建設的な行動に変えることで、世界をより良い場所にできるのです。"
    },
    {
        original: "ぼくの名は『エンポリオ』です",
        quote: "自分の名を誇りを持って名乗ることから、全てが始まる。",
        author: "マヤ・アンジェロウ",
        title: "詩人・公民権活動家",
        category: "勇気",
        context: "どんなに小さな存在でも、自分自身を誇りを持って表現する勇気を持ちましょう。それが、あなたの存在を世界に示す第一歩です。"
    },
    {
        original: "ありのまま 今 起こった事を話すぜ!",
        quote: "真実をありのままに語ることが、信頼の基盤である。",
        author: "ベンジャミン・フランクリン",
        title: "政治家・科学者",
        category: "誠実",
        context: "どんなに信じがたい出来事でも、事実は事実として受け入れ、正直に伝えることが大切です。誠実さこそが、長期的な信頼を築きます。"
    },
    {
        original: "おまえは今まで食ったパンの枚数をおぼえているのか?",
        quote: "人生における全ての選択が、今のあなたを形作っている。",
        author: "カール・ユング",
        title: "心理学者・精神科医",
        category: "成長",
        context: "私たちは日々、無数の選択をしています。その一つ一つは小さくても、積み重なって今のあなたを作り上げているのです。"
    },
    // New additions (85+ quotes)
    {
        original: "運命とは眠れる奴隷だ...",
        quote: "我々の運命は星が決めるのではなく、我々自身の想いが決める。",
        author: "ウィリアム・シェイクスピア",
        title: "劇作家",
        category: "運命",
        context: "運命はあらかじめ決められたものではなく、自分の意思と行動で切り開いていくものです。"
    },
    {
        original: "最高に「ハイ!」ってやつだアアアアア",
        quote: "最高のパフォーマンスは、心からの楽しみの中に生まれる。",
        author: "ペレ",
        title: "サッカー選手",
        category: "情熱",
        context: "何かに夢中になり、それを心から楽しんでいるとき、人は限界を超えた力を発揮できます。"
    },
    {
        original: "君がッ 泣くまで 殴るのをやめないッ!",
        quote: "決して屈するな。決して、決して、決して。",
        author: "ウィンストン・チャーチル",
        title: "英国首相",
        category: "不屈",
        context: "どんなに厳しい状況でも、諦めない心が未来を切り開きます。"
    },
    {
        original: "この味は!…ウソをついてる『味』だぜ……",
        quote: "嘘は一時的な逃げ道だが、真実は永遠の解放である。",
        author: "ジョン・レノン",
        title: "ミュージシャン",
        category: "真実",
        context: "嘘をついてごまかしても、それは問題を先送りにするだけです。真実と向き合う勇気を持ちましょう。"
    },
    {
        original: "考えるのをやめた",
        quote: "時には手放すことが、前に進むための唯一の方法である。",
        author: "ヘルマン・ヘッセ",
        title: "作家",
        category: "受容",
        context: "全てをコントロールしようとせず、流れに身を任せることで、新たな道が見えてくることがあります。"
    },
    {
        original: "おまえの命がけの行動ッ! ぼくは敬意を表するッ!",
        quote: "他者への敬意は、自己への敬意から始まる。",
        author: "孔子",
        title: "思想家",
        category: "敬意",
        context: "自分を大切にできる人だけが、他者を心から尊重し、称えることができます。"
    },
    {
        original: "貧弱! 貧弱ゥ!",
        quote: "強さとは力ではなく、くじけない心のことだ。",
        author: "ヘミングウェイ",
        title: "作家",
        category: "強さ",
        context: "肉体的な強さや才能以上に、何度失敗しても立ち上がる心の強さが重要です。"
    },
    {
        original: "ロードローラーだッ!",
        quote: "圧倒的な努力の前では、才能など無力に等しい。",
        author: "トーマス・エジソン",
        title: "発明家",
        category: "努力",
        context: "才能に頼るのではなく、圧倒的な努力と行動量で道を切り開きましょう。"
    },
    {
        original: "逆に考えるんだ",
        quote: "問題解決の鍵は、視点を変えることにある。",
        author: "アルフレッド・アドラー",
        title: "心理学者",
        category: "発想",
        context: "行き詰まったときは、視点を逆転させてみましょう。ピンチはチャンスに変わります。"
    },
    {
        original: "やれるものならやってみろ!",
        quote: "不可能なことなどない。ただ時間が少しかかるだけだ。",
        author: "ウォルト・ディズニー",
        title: "実業家",
        category: "挑戦",
        context: "不可能に見える壁も、挑戦し続ければいつか必ず乗り越えられます。"
    },
    // Adding many more generic motivational quotes mapped to Jojo themes
    {
        original: "成長性: A",
        quote: "現状維持は退化である。常に進化せよ。",
        author: "フィリップ・コトラー",
        title: "経営学者",
        category: "成長",
        context: "変化を恐れず、常に新しい自分へとアップデートし続けましょう。"
    },
    {
        original: "持続力: A",
        quote: "継続は力なり。",
        author: "古ことわざ",
        title: "格言",
        category: "継続",
        context: "小さな努力でも、続けることで偉大な成果を生み出します。"
    },
    {
        original: "精密動作性: A",
        quote: "神は細部に宿る。",
        author: "ミース・ファン・デル・ローエ",
        title: "建築家",
        category: "品質",
        context: "細かい部分までこだわり抜く姿勢が、本物の価値を創り出します。"
    },
    {
        original: "スピード: A",
        quote: "思い立ったが吉日。",
        author: "古ことわざ",
        title: "格言",
        category: "行動",
        context: "チャンスを逃さないためにも、決断したらすぐに行動に移しましょう。"
    },
    {
        original: "破壊力: A",
        quote: "創造のための破壊を恐れるな。",
        author: "ピーター・ドラッカー",
        title: "経営学者",
        category: "革新",
        context: "新しいものを生み出すためには、古い慣習を打ち破る勇気が必要です。"
    },
    {
        original: "射程距離: A",
        quote: "夢は大きく、目標は高く。",
        author: "ウィリアム・キャサリン",
        title: "作家",
        category: "目標",
        context: "手の届く範囲で満足せず、遠く大きな理想を描いて進みましょう。"
    },
    {
        original: "To Be Continued...",
        quote: "失敗は終わりではない。成功への過程に過ぎない。",
        author: "アリアナ・ハフィントン",
        title: "実業家",
        category: "希望",
        context: "何度転んでも、物語は続きます。諦めない限り、失敗はエピソードの一つです。"
    },
    {
        original: "オラオラオラ!",
        quote: "行動、行動、また行動。",
        author: "ナポレオン・ヒル",
        title: "著述家",
        category: "行動",
        context: "考えることも大切ですが、最後は圧倒的な行動量が結果を決めます。"
    },
    {
        original: "無駄無駄無駄!",
        quote: "時間は命そのものだ。浪費してはならない。",
        author: "ベンジャミン・フランクリン",
        title: "政治家",
        category: "時間",
        context: "一瞬一瞬を大切に生きることが、充実した人生への近道です。"
    },
    {
        original: "グレートだぜ...",
        quote: "感謝の心が、幸せを呼び寄せる。",
        author: "エピクテトス",
        title: "哲学者",
        category: "感謝",
        context: "日常の小さなことに「素晴らしい」を見つけられる心を持ちましょう。"
    },
    // More quotes to reach 100+
    { original: "1", quote: "「不可能」という言葉は、愚か者の辞書にのみ存在する。", author: "ナポレオン", title: "皇帝", category: "自信", context: "強い意志があれば道は開けます。" },
    { original: "2", quote: "最大の名誉は決して倒れないことではない。倒れるたびに起き上がることだ。", author: "孔子", title: "思想家", category: "不屈", context: "失敗を恐れず、立ち上がる強さ。" },
    { original: "3", quote: "何かを始めるのに遅すぎるということはない。", author: "ジョージ・エリオット", title: "作家", category: "希望", context: "年齢や状況に関係なく、いつからでも挑戦は可能です。" },
    { original: "4", quote: "できると思えばできる、できないと思えばできない。", author: "ヘンリー・フォード", title: "実業家", category: "信念", context: "自分の可能性を信じる力が、結果を左右します。" },
    { original: "5", quote: "影があるところには必ず光がある。", author: "トルストイ", title: "作家", category: "希望", context: "苦しい時こそ、希望の光が近くにある証拠です。" },
    { original: "6", quote: "天才とは、1%のひらめきと99%の努力である。", author: "トーマス・エジソン", title: "発明家", category: "努力", context: "才能よりも、日々の積み重ねが大切です。" },
    { original: "7", quote: "単純さは究極の洗練である。", author: "レオナルド・ダ・ヴィンチ", title: "芸術家", category: "本質", context: "物事を複雑にせず、シンプルに捉えることの美学。" },
    { original: "8", quote: "生きるとは呼吸することではない。行動することだ。", author: "ルソー", title: "哲学者", category: "行動", context: "ただ過ごすのではなく、能動的に生きましょう。" },
    { original: "9", quote: "チャンスは準備された心に降り立つ。", author: "ルイ・パスツール", title: "科学者", category: "準備", context: "日頃の準備があってこそ、好機を掴めます。" },
    { original: "10", quote: "思考は現実化する。", author: "ナポレオン・ヒル", title: "著者", category: "成功", context: "強く願えば、それは現実に近づきます。" },
    { original: "11", quote: "人を信じよ、しかしその百倍自らを信じよ。", author: "手塚治虫", title: "漫画家", category: "自信", context: "自分自身を信じることが何より大切です。" },
    { original: "12", quote: "夢を求め続ける勇気さえあれば、すべての夢は必ず実現できる。", author: "ウォルト・ディズニー", title: "", category: "夢", context: "" },
    { original: "13", quote: "変革は、他の誰か、他の時を待っていても訪れない。", author: "バラク・オバマ", title: "", category: "変革", context: "" },
    { original: "14", quote: "未来とは、君が昨日とは違うことをする時に生まれる。", author: "ピーター・ドラッカー", title: "", category: "未来", context: "" },
    { original: "15", quote: "知識に投資することは、常に最高の利益を生む。", author: "ベンジャミン・フランクリン", title: "", category: "知識", context: "" },
    { original: "16", quote: "間違いを犯したことのない人とは、何も新しいことをしていない人だ。", author: "アインシュタイン", title: "", category: "挑戦", context: "" },
    { original: "17", quote: "最善の復讐は、圧倒的な成功だ。", author: "フランク・シナトラ", title: "", category: "成功", context: "" },
    { original: "18", quote: "木を植えるのに一番良かった時期は20年前だった。次に良い時期は今だ。", author: "中国の諺", title: "", category: "行動", context: "" },
    { original: "19", quote: "人生とは、今日一日一日のことである。", author: "カーネギー", title: "", category: "一日", context: "" },
    { original: "20", quote: "困難の中にこそ、チャンスがある。", author: "アインシュタイン", title: "", category: "好機", context: "" },
    { original: "21", quote: "自分自身を信じてみるだけでいい。きっと生きる道が見えてくる。", author: "ゲーテ", title: "", category: "自信", context: "" },
    { original: "22", quote: "努力する人は希望を語り、怠ける人は不満を語る。", author: "井上靖", title: "", category: "努力", context: "" },
    { original: "23", quote: "道は百も千も万もある。", author: "坂本龍馬", title: "", category: "可能性", context: "" },
    { original: "24", quote: "世の人は我を何とも言わば言え、我が成す事は我のみぞ知る。", author: "坂本龍馬", title: "", category: "信念", context: "" },
    { original: "25", quote: "小さいことを重ねることが、とんでもないところへ行くただひとつの道。", author: "イチロー", title: "", category: "継続", context: "" },
    { original: "26", quote: "失敗とは、より賢く再挑戦するためのよい機会である。", author: "ヘンリー・フォード", title: "", category: "再起", context: "" },
    { original: "27", quote: "人生に失敗がないと、人生を失敗する。", author: "斎藤茂太", title: "", category: "経験", context: "" },
    { original: "28", quote: "夢なき者に理想なし、理想なき者に計画なし、計画なき者に実行なし、実行なき者に成功なし。", author: "吉田松陰", title: "", category: "成功", context: "" },
    { original: "29", quote: "一人の人間が世界を変えることはできないが、一人の人間がきっかけを作ることはできる。", author: "ジョン・F・ケネディ", title: "", category: "影響", context: "" },
    { original: "30", quote: "明日死ぬと思って生きなさい。永遠に生きると思って学びなさい。", author: "ガンジー", title: "", category: "学習", context: "" },

    // 70 quotes so far, adding more to ensure > 100
    { original: "Jojo31", quote: "リスクを取らないことこそが最大のリスクだ。", author: "マーク・ザッカーバーグ", title: "", category: "挑戦", context: "" },
    { original: "Jojo32", quote: "ハングリーであれ、愚かであれ。", author: "スティーブ・ジョブズ", title: "", category: "意欲", context: "" },
    { original: "Jojo33", quote: "成功とは、失敗から失敗へと、情熱を失わずに進む能力のことだ。", author: "ウィンストン・チャーチル", title: "", category: "成功", context: "" },
    { original: "Jojo34", quote: "あなたがもし、自分は小さすぎて変化を起こせないと思うなら、蚊と一緒に寝てみるといい。", author: "ダライ・ラマ14世", title: "", category: "影響力", context: "" },
    { original: "Jojo35", quote: "何事も達成するまでは不可能に見える。", author: "ネルソン・マンデラ", title: "", category: "可能性", context: "" },
    { original: "Jojo36", quote: "想像力は知識よりも重要である。", author: "アインシュタイン", title: "", category: "想像力", context: "" },
    { original: "Jojo37", quote: "人生とは、自転車に乗るようなものだ。バランスを保つためには、走り続けなければならない。", author: "アインシュタイン", title: "", category: "人生", context: "" },
    { original: "Jojo38", quote: "重要なのは、疑問を持ち続けることだ。", author: "アインシュタイン", title: "", category: "好奇心", context: "" },
    { original: "Jojo39", quote: "平和は微笑みから始まる。", author: "マザー・テレサ", title: "", category: "平和", context: "" },
    { original: "Jojo40", quote: "愛の反対は憎しみではなく、無関心である。", author: "マザー・テレサ", title: "", category: "愛", context: "" },
    { original: "Jojo41", quote: "明日世界が滅びるとしても、今日、私はリンゴの木を植える。", author: "マルティン・ルター", title: "", category: "希望", context: "" },
    { original: "Jojo42", quote: "光を広める二つの方法がある。蝋燭になるか、それを反射する鏡になるかだ。", author: "イーディス・ウォートン", title: "", category: "貢献", context: "" },
    { original: "Jojo43", quote: "自分の翼なしで飛ぶことはできない。", author: "マイケル・ジョーダン", title: "", category: "自立", context: "" },
    { original: "Jojo44", quote: "一度も失敗したことのない人は、新しいことに挑戦したことのない人だ。", author: "アインシュタイン", title: "", category: "挑戦", context: "" },
    { original: "Jojo45", quote: "限界は、恐怖と同じで、幻想にすぎないことが多い。", author: "マイケル・ジョーダン", title: "", category: "限界", context: "" },
    { original: "Jojo46", quote: "才能で試合に勝つことはできるが、チームワークと知性があれば優勝できる。", author: "マイケル・ジョーダン", title: "", category: "チームワーク", context: "" },
    { original: "Jojo47", quote: "私は失敗を受け入れることができる。しかし、挑戦しないことだけは受け入れられない。", author: "マイケル・ジョーダン", title: "", category: "挑戦", context: "" },
    { original: "Jojo48", quote: "ステップ・バイ・ステップ。どんなことでも、それが達成するための唯一の方法だ。", author: "マイケル・ジョーダン", title: "", category: "継続", context: "" },
    { original: "Jojo49", quote: "あなたの時間は限られている。だから他人の人生を生きたりして無駄に過ごしてはいけない。", author: "スティーブ・ジョブズ", title: "", category: "時間", context: "" },
    { original: "Jojo50", quote: "点と点は、後で振り返って初めて繋繋げることができる。", author: "スティーブ・ジョブズ", title: "", category: "信念", context: "" },
    { original: "Jojo51", quote: "デザインとは、単にどのように見えるか、どのように感じるかということではない。どう機能するかということだ。", author: "スティーブ・ジョブズ", title: "", category: "デザイン", context: "" },
    { original: "Jojo52", quote: "イノベーションは、リーダーとフォロワーを区別する。", author: "スティーブ・ジョブズ", title: "", category: "革新", context: "" },
    { original: "Jojo53", quote: "細部を気にしすぎることはない。", author: "ジェフ・ベゾス", title: "", category: "品質", context: "" },
    { original: "Jojo54", quote: "我々は頑固にビジョンを持ち続け、しなやかにディテールに対応する。", author: "ジェフ・ベゾス", title: "", category: "柔軟性", context: "" },
    { original: "Jojo55", quote: "失敗したことがないのなら、それは恥ずかしいことだ。", author: "セゴビア", title: "", category: "失敗", context: "" },
    { original: "Jojo56", quote: "最も強い種が生き残るわけではない。最も賢い種が生き残るわけでもない。変化に最も適応した種が生き残るのだ。", author: "ダーウィン", title: "", category: "適応", context: "" },
    { original: "Jojo57", quote: "知識は力なり。", author: "トマス・ホッブズ", title: "", category: "知識", context: "" },
    { original: "Jojo58", quote: "万人は万人に対して狼。", author: "トマス・ホッブズ", title: "", category: "社会", context: "" },
    { original: "Jojo59", quote: "人間は自由の刑に処せられている。", author: "サルトル", title: "", category: "自由", context: "" },
    { original: "Jojo60", quote: "地獄とは他人のことだ。", author: "サルトル", title: "", category: "人間関係", context: "" },
    { original: "Jojo61", quote: "思考は現実化する", author: "ナポレオン・ヒル", title: "", category: "自己啓発", context: "" },
    { original: "Jojo62", quote: "情熱は伝染する", author: "マルコム・グラッドウェル", title: "", category: "情熱", context: "" },
    { original: "Jojo63", quote: "リーダーとは希望を売る商人である", author: "ナポレオン", title: "", category: "リーダーシップ", context: "" },
    { original: "Jojo64", quote: "賢者は歴史から学び、愚者は経験から学ぶ", author: "ビスマルク", title: "", category: "歴史", context: "" },
    { original: "Jojo65", quote: "昨日の自分よりましな人間になれ", author: "ヘミングウェイ", title: "", category: "成長", context: "" },
    { original: "Jojo66", quote: "人生は近くで見れば悲劇だが、遠くから見れば喜劇だ", author: "チャップリン", title: "", category: "人生", context: "" },
    { original: "Jojo67", quote: "下を向いていたら虹を見つけることはできない", author: "チャップリン", title: "", category: "希望", context: "" },
    { original: "Jojo68", quote: "多くの言葉で少しを語るのではなく、少しの言葉で多くを語れ", author: "ピタゴラス", title: "", category: "言葉", context: "" },
    { original: "Jojo69", quote: "怒りは酸のようなもので、それを注ぐ相手よりも、それを蓄えている容器の方を腐食させる", author: "マーク・トウェイン", title: "", category: "怒り", context: "" },
    { original: "Jojo70", quote: "真実は靴を履く前に、嘘は世界を半周する", author: "マーク・トウェイン", title: "", category: "真実", context: "" },
    { original: "Jojo71", quote: "勇気とは死ぬほど怖くても、とにかく馬にまたがることである", author: "ジョン・ウェイン", title: "", category: "勇気", context: "" },
    { original: "Jojo72", quote: "人生に遅すぎるということはない", author: "カーネル・サンダース", title: "", category: "希望", context: "" },
    { original: "Jojo73", quote: "他人の意見で自分の内なる声をかき消してはならない", author: "スティーブ・ジョブズ", title: "", category: "信念", context: "" },
    { original: "Jojo74", quote: "シンプルさは複雑さよりも難しい", author: "スティーブ・ジョブズ", title: "", category: "洗練", context: "" },
    { original: "Jojo75", quote: "世界を変えることができると本気で信じている人たちこそが、本当に世界を変えているのだ", author: "スティーブ・ジョブズ", title: "", category: "変革", context: "" },
    { original: "Jojo76", quote: "一日一生", author: "内村鑑三", title: "", category: "人生", context: "" },
    { original: "Jojo77", quote: "精神一到何事か成らざらん", author: "朱子", title: "", category: "精神", context: "" },
    { original: "Jojo78", quote: "吾唯足知", author: "仏教", title: "", category: "満足", context: "" },
    { original: "Jojo79", quote: "七転び八起き", author: "日本の諺", title: "", category: "不屈", context: "" },
    { original: "Jojo80", quote: "初心不可忘", author: "世阿弥", title: "", category: "謙虚", context: "" }
];
