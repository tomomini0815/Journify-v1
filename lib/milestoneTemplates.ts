export type MilestoneTemplate = {
    id: string
    name: string
    description: string
    category: 'it-software' | 'manufacturing' | 'event-project' | 'marketing-advertising'
    color: string
}

export const defaultMilestoneTemplates: MilestoneTemplate[] = [
    // IT・ソフトウェア開発
    { id: 'requirements-freeze', name: '要件定義完了', description: '要件仕様書承認・凍結', category: 'it-software', color: '#3b82f6' },
    { id: 'design-approval', name: '設計承認', description: '基本設計・詳細設計レビュー完了', category: 'it-software', color: '#6366f1' },
    { id: 'alpha-release', name: 'α版リリース', description: '内部テスト版リリース', category: 'it-software', color: '#8b5cf6' },
    { id: 'beta-release', name: 'β版リリース', description: '限定公開テスト版リリース', category: 'it-software', color: '#a855f7' },
    { id: 'code-freeze', name: 'コードフリーズ', description: '機能追加停止・バグ修正のみ', category: 'it-software', color: '#c026d3' },
    { id: 'production-release', name: '本番リリース', description: '一般公開・本番環境デプロイ', category: 'it-software', color: '#22c55e' },
    { id: 'wireframe-approval', name: 'ワイヤーフレーム承認', description: '画面設計承認', category: 'it-software', color: '#ec4899' },
    { id: 'design-system-complete', name: 'デザインシステム完成', description: 'UIコンポーネント・スタイルガイド完成', category: 'it-software', color: '#f43f5e' },

    // 製造業
    { id: 'prototype-complete', name: '試作品完成', description: '初期プロトタイプ完成', category: 'manufacturing', color: '#0ea5e9' },
    { id: 'quality-check', name: '品質検査完了', description: '品質基準クリア', category: 'manufacturing', color: '#06b6d4' },
    { id: 'mass-production-start', name: '量産開始', description: '本格生産開始', category: 'manufacturing', color: '#14b8a6' },
    { id: 'shipment-start', name: '出荷開始', description: '製品出荷開始', category: 'manufacturing', color: '#10b981' },

    // イベント・プロジェクト管理
    { id: 'kickoff', name: 'キックオフミーティング', description: 'プロジェクト開始・キックオフ', category: 'event-project', color: '#eab308' },
    { id: 'venue-booking', name: '会場予約完了', description: 'イベント会場確保', category: 'event-project', color: '#facc15' },
    { id: 'speaker-confirmed', name: 'スピーカー確定', description: '登壇者・講演者確定', category: 'event-project', color: '#fde047' },
    { id: 'event-day', name: 'イベント当日', description: 'イベント開催日', category: 'event-project', color: '#fef08a' },
    { id: 'milestone-review', name: '中間レビュー', description: '進捗確認・方向性調整', category: 'event-project', color: '#fcd34d' },
    { id: 'retrospective', name: '振り返り会', description: 'プロジェクト振り返り・改善点抽出', category: 'event-project', color: '#fbbf24' },

    // マーケティング・広告
    { id: 'campaign-launch', name: 'キャンペーン開始', description: 'マーケティングキャンペーン開始', category: 'marketing-advertising', color: '#f97316' },
    { id: 'content-publish', name: 'コンテンツ公開', description: 'LP・記事・動画公開', category: 'marketing-advertising', color: '#fb923c' },
    { id: 'ad-start', name: '広告配信開始', description: 'Web広告・SNS広告配信開始', category: 'marketing-advertising', color: '#fdba74' },
    { id: 'campaign-end', name: 'キャンペーン終了', description: 'キャンペーン期間終了・効果測定開始', category: 'marketing-advertising', color: '#fed7aa' },
    { id: 'stakeholder-demo', name: 'ステークホルダーデモ', description: '関係者向けデモ・プレゼン', category: 'marketing-advertising', color: '#fca5a5' }
]

export const getCategoryName = (category: MilestoneTemplate['category']): string => {
    const names = {
        'it-software': 'IT・ソフトウェア開発',
        'manufacturing': '製造業',
        'event-project': 'イベント・プロジェクト管理',
        'marketing-advertising': 'マーケティング・広告'
    }
    return names[category]
}
