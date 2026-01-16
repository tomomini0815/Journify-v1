---
name: frontend-design
description: Enhance frontend development with modern UI/UX best practices
---

# Frontend Design Skill

このスキルは、フロントエンド開発においてモダンなUI/UXベストプラクティスを適用するためのガイドラインを提供します。

## デザイン原則

### 1. ビジュアルヒエラルキー
- 重要な要素は視覚的に目立たせる
- 適切なフォントサイズ、ウェイト、色を使用
- 余白（ホワイトスペース）を効果的に活用

### 2. カラーパレット
- 調和のとれた配色を使用
- ダークモード対応を考慮
- アクセシビリティ（WCAG）基準を満たすコントラスト比を確保

### 3. タイポグラフィ
- モダンなフォント（Inter, Roboto, Outfit等）を使用
- 読みやすい行間（1.5-1.75）を設定
- レスポンシブなフォントサイズ（rem, clamp()）を活用

### 4. アニメーション
- 微細なマイクロインタラクションを実装
- 適切なイージング関数を使用（ease-out, cubic-bezier）
- パフォーマンスを考慮（transform, opacity優先）
- reduce-motion メディアクエリを尊重

### 5. レスポンシブデザイン
- モバイルファーストアプローチ
- フレキシブルグリッドレイアウト
- ブレイクポイントの一貫した使用

## モダンCSS技法

### グラスモーフィズム
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
}
```

### スムーズシャドウ
```css
.smooth-shadow {
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 8px rgba(0,0,0,0.04),
    0 16px 32px rgba(0,0,0,0.04);
}
```

### グラデーション
```css
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## コンポーネント設計

### ボタン
- 明確なホバー/フォーカス状態
- 適切なパディング（最小44x44pxのタップターゲット）
- ローディング状態の実装

### フォーム
- インラインバリデーション
- 明確なエラーメッセージ
- プレースホルダーとラベルの適切な使用

### モーダル/ダイアログ
- アクセシブルなフォーカストラップ
- スムーズな開閉アニメーション
- 背景のオーバーレイ

## React/Next.js 固有のガイドライン

### パフォーマンス
- 画像には `next/image` を使用
- 動的インポートでコード分割
- `useMemo`, `useCallback` を適切に使用

### アクセシビリティ
- セマンティックHTMLを使用
- ARIA属性を適切に設定
- キーボードナビゲーションをサポート

### ステート管理
- ローカルステートを優先
- 必要に応じてContext APIを使用
- 副作用は useEffect で管理

## Tailwind CSS / CSS変数

プロジェクトでTailwindを使用する場合：
- カスタムカラーは `tailwind.config` で定義
- 再利用可能なユーティリティクラスを作成
- `@apply` でコンポーネント固有のスタイルを抽出

CSS変数を活用：
```css
:root {
  --color-primary: hsl(262, 80%, 50%);
  --color-primary-hover: hsl(262, 80%, 45%);
  --radius-lg: 16px;
  --shadow-lg: 0 10px 40px rgba(0,0,0,0.12);
}
```

## チェックリスト

コードレビュー時に確認すべき項目：

- [ ] レスポンシブ対応（モバイル/タブレット/デスクトップ）
- [ ] ダークモード対応
- [ ] ホバー/フォーカス状態
- [ ] ローディング/エラー状態
- [ ] アクセシビリティ（色コントラスト、キーボード操作）
- [ ] アニメーションのパフォーマンス
- [ ] 一貫したスペーシング
