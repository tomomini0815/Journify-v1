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
            { title: 'ユーザーリサーチ', duration: 3, color: '#3b82f6', description: '<ul><li><input type="checkbox" />競合分析</li><li><input type="checkbox" />ユーザーインタビュー</li><li><input type="checkbox" />ペルソナ作成</li></ul>' },
            { title: 'ワイヤーフレーム', duration: 5, color: '#8b5cf6', description: '<ul><li><input type="checkbox" />情報設計</li><li><input type="checkbox" />低忠実度ワイヤーフレーム</li></ul>' },
            { title: 'デザインモックアップ', duration: 7, color: '#ec4899', description: '<ul><li><input type="checkbox" />高忠実度デザイン</li><li><input type="checkbox" />デザインシステム適用</li></ul>' },
            { title: 'プロトタイピング', duration: 4, color: '#f97316', description: '<ul><li><input type="checkbox" />インタラクション作成</li><li><input type="checkbox" />画面遷移設定</li></ul>' },
            { title: 'ユーザーテスト', duration: 3, color: '#22c55e', description: '<ul><li><input type="checkbox" />ユーザビリティテスト</li><li><input type="checkbox" />フィードバック収集</li></ul>' },
            { title: 'デザイン修正', duration: 3, color: '#eab308', description: '<ul><li><input type="checkbox" />フィードバック反映</li><li><input type="checkbox" />最終調整</li></ul>' }
        ]
    },
    {
        id: 'software-dev',
        name: 'ソフトウェア開発',
        description: '要件定義からリリースまでの開発サイクル',
        tasks: [
            { title: '要件定義', duration: 5, color: '#3b82f6', description: '<ul><li><input type="checkbox" />ビジネス要件の整理</li><li><input type="checkbox" />機能要件の定義</li><li><input type="checkbox" />非機能要件の定義</li><li><input type="checkbox" />要件仕様書の作成</li></ul>' },
            { title: '基本設計', duration: 5, color: '#8b5cf6', description: '<ul><li><input type="checkbox" />システム構成図の作成</li><li><input type="checkbox" />データベース設計</li><li><input type="checkbox" />API設計</li><li><input type="checkbox" />画面遷移図の作成</li></ul>' },
            { title: '詳細設計', duration: 5, color: '#6366f1', description: '<ul><li><input type="checkbox" />クラス図の作成</li><li><input type="checkbox" />シーケンス図の作成</li><li><input type="checkbox" />テーブル定義書の作成</li><li><input type="checkbox" />API仕様書の作成</li></ul>' },
            { title: '実装', duration: 10, color: '#ec4899', description: '<ul><li><input type="checkbox" />開発環境のセットアップ</li><li><input type="checkbox" />バックエンド実装</li><li><input type="checkbox" />フロントエンド実装</li><li><input type="checkbox" />コードレビュー</li></ul>' },
            { title: '単体テスト', duration: 3, color: '#f43f5e', description: '<ul><li><input type="checkbox" />テストケースの作成</li><li><input type="checkbox" />単体テストの実施</li><li><input type="checkbox" />バグ修正</li></ul>' },
            { title: '結合テスト', duration: 5, color: '#f97316', description: '<ul><li><input type="checkbox" />テストシナリオの作成</li><li><input type="checkbox" />結合テストの実施</li><li><input type="checkbox" />バグ修正と再テスト</li><li><input type="checkbox" />テスト報告書の作成</li></ul>' },
            { title: 'リリース準備', duration: 2, color: '#22c55e', description: '<ul><li><input type="checkbox" />本番環境の準備</li><li><input type="checkbox" />デプロイ手順書の作成</li><li><input type="checkbox" />リリース判定会議</li><li><input type="checkbox" />デプロイ実施</li></ul>' }
        ]
    },
    {
        id: 'marketing',
        name: 'マーケティング',
        description: 'キャンペーン企画から効果測定まで',
        tasks: [
            { title: '企画立案', duration: 3, color: '#3b82f6', description: '<ul><li><input type="checkbox" />市場調査</li><li><input type="checkbox" />ターゲット設定</li><li><input type="checkbox" />キャンペーン目標の設定</li><li><input type="checkbox" />予算計画</li></ul>' },
            { title: 'コンテンツ制作', duration: 7, color: '#ec4899', description: '<ul><li><input type="checkbox" />コンテンツ企画</li><li><input type="checkbox" />コピーライティング</li><li><input type="checkbox" />画像・動画制作</li><li><input type="checkbox" />校正・レビュー</li></ul>' },
            { title: 'LP制作', duration: 5, color: '#8b5cf6', description: '<ul><li><input type="checkbox" />ワイヤーフレーム作成</li><li><input type="checkbox" />デザイン制作</li><li><input type="checkbox" />コーディング</li><li><input type="checkbox" />A/Bテスト設定</li></ul>' },
            { title: '広告設定', duration: 2, color: '#f97316', description: '<ul><li><input type="checkbox" />広告アカウント設定</li><li><input type="checkbox" />広告クリエイティブ作成</li><li><input type="checkbox" />ターゲティング設定</li><li><input type="checkbox" />予算配分</li></ul>' },
            { title: 'キャンペーン実施', duration: 14, color: '#eab308', description: '<ul><li><input type="checkbox" />キャンペーン開始</li><li><input type="checkbox" />日次モニタリング</li><li><input type="checkbox" />広告最適化</li><li><input type="checkbox" />顧客対応</li></ul>' },
            { title: '効果測定・分析', duration: 3, color: '#22c55e', description: '<ul><li><input type="checkbox" />データ収集</li><li><input type="checkbox" />KPI分析</li><li><input type="checkbox" />レポート作成</li><li><input type="checkbox" />改善提案</li></ul>' }
        ]
    }
]
