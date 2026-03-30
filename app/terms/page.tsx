"use client"

import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm">
            ← トップページに戻る
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">利用規約</h1>
        <p className="text-white/30 text-sm mb-12">最終更新日：2026年3月30日</p>

        <div className="space-y-10 text-white/70 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第1条（適用）</h2>
            <p>
              本利用規約（以下「本規約」）は、Journify（以下「本サービス」）の利用に関する条件を定めるものです。
              ユーザーの皆さまは、本規約に同意のうえ本サービスをご利用ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第2条（定義）</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>「本サービス」とは、Journifyが提供するジャーナリング、目標管理、音声記録等の機能を含むウェブアプリケーションを指します。</li>
              <li>「ユーザー」とは、本サービスを利用するすべての方を指します。</li>
              <li>「コンテンツ」とは、ユーザーが本サービス上で作成・保存するテキスト、音声データ、画像等のデータを指します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第3条（アカウント）</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>ユーザーは、正確な情報を提供してアカウントを作成するものとします。</li>
              <li>アカウント情報の管理はユーザーの責任とし、第三者への譲渡・貸与は禁止します。</li>
              <li>アカウントの不正利用により生じた損害について、当社は責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第4条（禁止事項）</h2>
            <p className="mb-3">ユーザーは、以下の行為を行ってはならないものとします。</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>本サービスを不正に利用する行為</li>
              <li>リバースエンジニアリング、逆アセンブル等の行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第5条（コンテンツの取り扱い）</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>ユーザーが作成したコンテンツの著作権はユーザーに帰属します。</li>
              <li>当社は、サービス改善・AI分析機能の提供のため、ユーザーのコンテンツを匿名化して利用することがあります。</li>
              <li>ユーザーはいつでも自身のコンテンツを削除することができます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第6条（サービスの変更・停止）</h2>
            <p>
              当社は、事前の通知なく本サービスの内容を変更、または提供を停止・中断することがあります。
              これによりユーザーに生じた損害について、当社は責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第7条（免責事項）</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>本サービスは「現状有姿」で提供され、特定の目的への適合性を保証するものではありません。</li>
              <li>本サービスの利用により生じたいかなる損害についても、当社の故意または重過失がない限り、責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第8条（規約の変更）</h2>
            <p>
              当社は、必要と判断した場合には、ユーザーに通知することなく本規約を変更できるものとします。
              変更後の利用規約は、本サービス上に掲示した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">第9条（準拠法・管轄裁判所）</h2>
            <p>
              本規約は日本法に準拠し、本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; 2025-2026 Journify.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">プライバシーポリシー</Link>
            <Link href="/" className="hover:text-white/60 transition-colors">トップページ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
