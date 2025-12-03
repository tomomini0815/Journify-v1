export type WorkflowTask = {
    title: string
    duration: number // days
    color: string
    description?: string
}

export type WorkflowTemplate = {
    id: string
    name: string
    description: string
    tasks: WorkflowTask[]
}

export const defaultTemplates: WorkflowTemplate[] = [
    {
        id: 'uiux-design',
        name: 'UI/UXデザイン',
        description: 'リサーチからプロトタイプまでの標準フロー',
        tasks: [
            { title: 'ユーザーリサーチ', duration: 3, color: '#3b82f6', description: '<ul><li>競合分析</li><li>ユーザーインタビュー</li><li>ペルソナ作成</li></ul>' },
            { title: 'ワイヤーフレーム', duration: 5, color: '#8b5cf6', description: '<ul><li>情報設計</li><li>低忠実度ワイヤーフレーム</li></ul>' },
            { title: 'デザインモックアップ', duration: 7, color: '#ec4899', description: '<ul><li>高忠実度デザイン</li><li>デザインシステム適用</li></ul>' },
            { title: 'プロトタイピング', duration: 4, color: '#f97316', description: '<ul><li>インタラクション作成</li><li>画面遷移設定</li></ul>' },
            { title: 'ユーザーテスト', duration: 3, color: '#22c55e', description: '<ul><li>ユーザビリティテスト</li><li>フィードバック収集</li></ul>' },
            { title: 'デザイン修正', duration: 3, color: '#eab308', description: '<ul><li>フィードバック反映</li><li>最終調整</li></ul>' }
        ]
    },
    {
        id: 'software-dev',
        name: 'ソフトウェア開発',
        description: '要件定義からリリースまでの開発サイクル',
        tasks: [
            { title: '要件定義', duration: 5, color: '#3b82f6' },
            { title: '基本設計', duration: 5, color: '#8b5cf6' },
            { title: '詳細設計', duration: 5, color: '#6366f1' },
            { title: '実装', duration: 10, color: '#ec4899' },
            { title: '単体テスト', duration: 3, color: '#f43f5e' },
            { title: '結合テスト', duration: 5, color: '#f97316' },
            { title: 'リリース準備', duration: 2, color: '#22c55e' }
        ]
    },
    {
        id: 'marketing',
        name: 'マーケティング',
        description: 'キャンペーン企画から効果測定まで',
        tasks: [
            { title: '企画立案', duration: 3, color: '#3b82f6' },
            { title: 'コンテンツ制作', duration: 7, color: '#ec4899' },
            { title: 'LP制作', duration: 5, color: '#8b5cf6' },
            { title: '広告設定', duration: 2, color: '#f97316' },
            { title: 'キャンペーン実施', duration: 14, color: '#eab308' },
            { title: '効果測定・分析', duration: 3, color: '#22c55e' }
        ]
    }
]
