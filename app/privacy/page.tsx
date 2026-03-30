"use client"

import Link from "next/link"

export default function PrivacyPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">プライバシーポリシー</h1>
        <p className="text-white/30 text-sm mb-12">最終更新日：2025年4月1日</p>

        <div className="space-y-10 text-white/70 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">1. はじめに</h2>
            <p>
              Journify（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
              本プライバシーポリシーでは、収集する情報の種類、利用方法、保護方法について説明します。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">2. 収集する情報</h2>
            <p className="mb-4">本サービスでは、以下の情報を収集することがあります。</p>

            <h3 className="text-base font-medium text-white/90 mb-2">2.1 ユーザーが提供する情報</h3>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li>アカウント登録情報（メールアドレス、表示名等）</li>
              <li>ジャーナルエントリー、目標設定、習慣記録等のコンテンツ</li>
              <li>音声ジャーナルの録音データおよびその文字起こしデータ</li>
              <li>プロフィール情報および設定</li>
            </ul>

            <h3 className="text-base font-medium text-white/90 mb-2">2.2 自動的に収集される情報</h3>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>アクセスログ（IPアドレス、ブラウザ種類、アクセス日時）</li>
              <li>利用状況に関するデータ（機能利用頻度、ページ閲覧履歴）</li>
              <li>Cookie およびこれに類似する技術による情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">3. 情報の利用目的</h2>
            <p className="mb-3">収集した情報は、以下の目的で利用します。</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>本サービスの提供・運営・改善</li>
              <li>AI分析機能によるインサイト・フィードバックの生成</li>
              <li>ユーザーサポートの提供</li>
              <li>サービスに関する通知・お知らせの送信</li>
              <li>利用統計の作成および分析（匿名化した形で）</li>
              <li>不正利用の検知・防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">4. AI機能とデータの取り扱い</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>本サービスのAI機能は、ユーザーのジャーナルデータを分析して感情分析やインサイトを提供します。</li>
              <li>AI分析に使用されるデータは、ユーザーのアカウントに紐づく形で安全に処理されます。</li>
              <li>AI学習モデルの改善のため、匿名化・集約化されたデータを使用する場合があります。</li>
              <li>ユーザーは設定画面からAI分析の利用を制限することができます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">5. 情報の共有・第三者提供</h2>
            <p className="mb-3">当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>ユーザーの明示的な同意がある場合</li>
              <li>法令に基づき開示が求められた場合</li>
              <li>ユーザーの生命・身体・財産の保護のために必要な場合</li>
              <li>サービス提供に必要な範囲で業務委託先に開示する場合（適切な管理のもと）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">6. データの保管・セキュリティ</h2>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>ユーザーのデータは暗号化された安全なサーバーに保管されます。</li>
              <li>通信はSSL/TLSにより暗号化されています。</li>
              <li>アクセス権限の管理を厳格に行い、不正アクセスの防止に努めます。</li>
              <li>定期的なセキュリティ監査を実施しています。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">7. ユーザーの権利</h2>
            <p className="mb-3">ユーザーは、以下の権利を有します。</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-white/90">アクセス権</strong>：ご自身の個人情報の開示を請求する権利</li>
              <li><strong className="text-white/90">訂正権</strong>：不正確な個人情報の訂正を求める権利</li>
              <li><strong className="text-white/90">削除権</strong>：個人情報の削除を求める権利</li>
              <li><strong className="text-white/90">データポータビリティ</strong>：ご自身のデータのエクスポートを求める権利</li>
              <li><strong className="text-white/90">同意の撤回</strong>：データ処理に関する同意をいつでも撤回する権利</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">8. Cookieの使用</h2>
            <p>
              本サービスでは、ユーザー認証、設定の保存、利用状況の分析のためにCookieを使用します。
              ブラウザの設定によりCookieの受け入れを制御できますが、一部の機能が正常に動作しなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">9. 未成年者の利用</h2>
            <p>
              本サービスは16歳以上を対象としています。16歳未満の方は、保護者の同意を得たうえでご利用ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">10. ポリシーの変更</h2>
            <p>
              本プライバシーポリシーは、法令の変更やサービスの改善に伴い、予告なく変更されることがあります。
              重要な変更がある場合は、本サービス上で通知します。
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">11. お問い合わせ</h2>
            <p>
              プライバシーに関するご質問やご要望は、以下までお問い合わせください。
            </p>
            <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/50">メール：support@journify.app</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; 2025 Journify.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white/60 transition-colors">利用規約</Link>
            <Link href="/" className="hover:text-white/60 transition-colors">トップページ</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
