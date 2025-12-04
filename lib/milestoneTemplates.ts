export type MilestoneTemplate = {
    id: string
    name: string
    description: string
    category: 'development' | 'design' | 'marketing' | 'general'
    color: string
}

export const defaultMilestoneTemplates: MilestoneTemplate[] = [
    // 開発系
    { id: 'requirements-freeze', name: '要件定義完了', description: '要件仕様書承認・凍結', category: 'development', color: '#3b82f6' },
    { id: 'design-approval', name: '設計承認', description: '基本設計・詳細設計レビュー完了', category: 'development', color: '#6366f1' },
    { id: 'alpha-release', name: 'α版リリース', description: '内部テスト版リリース', category: 'development', color: '#8b5cf6' },
    { id: 'beta-release', name: 'β版リリース', description: '限定公開テスト版リリース', category: 'development', color: '#a855f7' },
    { id: 'code-freeze', name: 'コードフリーズ', description: '機能追加停止・バグ修正のみ', category: 'development', color: '#c026d3' },
    { id: 'production-release', name: '本番リリース', description: '一般公開・本番環境デプロイ', category: 'development', color: '#22c55e' },

    // デザイン系
    { id: 'wireframe-approval', name: 'ワイヤーフレーム承認', description: '画面設計承認', category: 'design', color: '#ec4899' },
    { id: 'design-system-complete', name: 'デザインシステム完成', description: 'UIコンポーネント・スタイルガイド完成', category: 'design', color: '#f43f5e' },
    { id: 'prototype-review', name: 'プロトタイプレビュー', description: 'インタラクティブプロトタイプ確認', category: 'design', color: '#fb7185' },
    { id: 'design-handoff', name: 'デザイン納品', description: '開発チームへデザインデータ引き渡し', category: 'design', color: '#fda4af' },

    // マーケティング系
    { id: 'campaign-launch', name: 'キャンペーン開始', description: 'マーケティングキャンペーン開始', category: 'marketing', color: '#f97316' },
    { id: 'content-publish', name: 'コンテンツ公開', description: 'LP・記事・動画公開', category: 'marketing', color: '#fb923c' },
    { id: 'ad-start', name: '広告配信開始', description: 'Web広告・SNS広告配信開始', category: 'marketing', color: '#fdba74' },
    { id: 'campaign-end', name: 'キャンペーン終了', description: 'キャンペーン期間終了・効果測定開始', category: 'marketing', color: '#fed7aa' },

    // 汎用
    { id: 'kickoff', name: 'キックオフミーティング', description: 'プロジェクト開始・キックオフ', category: 'general', color: '#eab308' },
    { id: 'milestone-review', name: '中間レビュー', description: '進捗確認・方向性調整', category: 'general', color: '#facc15' },
    { id: 'stakeholder-demo', name: 'ステークホルダーデモ', description: '関係者向けデモ・プレゼン', category: 'general', color: '#fde047' },
    { id: 'retrospective', name: '振り返り会', description: 'プロジェクト振り返り・改善点抽出', category: 'general', color: '#fef08a' }
]
