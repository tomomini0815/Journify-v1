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
            { title: 'ユーザーリサーチ', duration: 3, color: '#3b82f6', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>競合分析</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>ユーザーインタビュー</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>ペルソナ作成</div></li></ul>' },
            { title: 'ワイヤーフレーム', duration: 5, color: '#8b5cf6', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>情報設計</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>低忠実度ワイヤーフレーム</div></li></ul>' },
            { title: 'デザインモックアップ', duration: 7, color: '#ec4899', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>高忠実度デザイン</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>デザインシステム適用</div></li></ul>' },
            { title: 'プロトタイピング', duration: 4, color: '#f97316', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>インタラクション作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>画面遷移設定</div></li></ul>' },
            { title: 'ユーザーテスト', duration: 3, color: '#22c55e', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>ユーザビリティテスト</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>フィードバック収集</div></li></ul>' },
            { title: 'デザイン修正', duration: 3, color: '#eab308', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>フィードバック反映</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>最終調整</div></li></ul>' }
        ]
    },
    {
        id: 'software-dev',
        name: 'ソフトウェア開発',
        description: '要件定義からリリースまでの開発サイクル',
        tasks: [
            { title: '要件定義', duration: 5, color: '#3b82f6', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>ビジネス要件の整理</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>機能要件の定義</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>非機能要件の定義</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>要件仕様書の作成</div></li></ul>' },
            { title: '基本設計', duration: 5, color: '#8b5cf6', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>システム構成図の作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>データベース設計</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>API設計</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>画面遷移図の作成</div></li></ul>' },
            { title: '詳細設計', duration: 5, color: '#6366f1', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>クラス図の作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>シーケンス図の作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>テーブル定義書の作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>API仕様書の作成</div></li></ul>' },
            { title: '実装', duration: 10, color: '#ec4899', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>開発環境のセットアップ</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>バックエンド実装</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>フロントエンド実装</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>コードレビュー</div></li></ul>' },
            { title: '単体テスト', duration: 3, color: '#f43f5e', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>テストケースの作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>単体テストの実施</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>バグ修正</div></li></ul>' },
            { title: '結合テスト', duration: 5, color: '#f97316', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>テストシナリオの作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>結合テストの実施</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>バグ修正と再テスト</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>テスト報告書の作成</div></li></ul>' },
            { title: 'リリース準備', duration: 2, color: '#22c55e', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>本番環境の準備</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>デプロイ手順書の作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>リリース判定会議</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>デプロイ実施</div></li></ul>' }
        ]
    },
    {
        id: 'marketing',
        name: 'マーケティング',
        description: 'キャンペーン企画から効果測定まで',
        tasks: [
            { title: '企画立案', duration: 3, color: '#3b82f6', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>市場調査</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>ターゲット設定</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>キャンペーン目標の設定</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>予算計画</div></li></ul>' },
            { title: 'コンテンツ制作', duration: 7, color: '#ec4899', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>コンテンツ企画</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>コピーライティング</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>画像・動画制作</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>校正・レビュー</div></li></ul>' },
            { title: 'LP制作', duration: 5, color: '#8b5cf6', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>ワイヤーフレーム作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>デザイン制作</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>コーディング</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>A/Bテスト設定</div></li></ul>' },
            { title: '広告設定', duration: 2, color: '#f97316', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>広告アカウント設定</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>広告クリエイティブ作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>ターゲティング設定</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>予算配分</div></li></ul>' },
            { title: 'キャンペーン実施', duration: 14, color: '#eab308', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>キャンペーン開始</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>日次モニタリング</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>広告最適化</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>顧客対応</div></li></ul>' },
            { title: '効果測定・分析', duration: 3, color: '#22c55e', description: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>データ収集</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>KPI分析</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>レポート作成</div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div>改善提案</div></li></ul>' }
        ]
    }
]
