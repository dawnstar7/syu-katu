# デプロイガイド - Vercelで公開する

このガイドでは、就活管理アプリをVercelで公開する手順を説明します。

## 🚀 Vercelとは？

Vercelは、Next.jsアプリを簡単にデプロイできる無料のホスティングサービスです。
- ✅ 無料枠が充実
- ✅ 自動デプロイ（GitHubと連携）
- ✅ HTTPS対応
- ✅ 高速CDN

## 📋 デプロイ手順

### STEP 1: GitHubにリポジトリをプッシュ

1. **GitHubで新しいリポジトリを作成**
   - https://github.com/new にアクセス
   - リポジトリ名: `job-hunt-app` (または任意の名前)
   - Public または Private を選択
   - 「Create repository」をクリック

2. **ローカルのコードをプッシュ**
   ```bash
   # すべての変更をコミット
   git add .
   git commit -m "Initial commit: 就活管理アプリ with AI機能"

   # GitHubリポジトリをリモートとして追加（URLは自分のものに置き換え）
   git remote add origin https://github.com/あなたのユーザー名/job-hunt-app.git

   # プッシュ
   git branch -M main
   git push -u origin main
   ```

### STEP 2: Vercelでデプロイ

1. **Vercelにアクセス**
   - https://vercel.com にアクセス
   - 「Sign Up」をクリック
   - 「Continue with GitHub」を選択してGitHubアカウントで登録

2. **新しいプロジェクトを作成**
   - ダッシュボードで「Add New...」→「Project」をクリック
   - GitHubリポジトリの一覧から `job-hunt-app` を選択
   - 「Import」をクリック

3. **プロジェクト設定**
   - **Project Name**: そのままでOK（または任意の名前に変更）
   - **Framework Preset**: Next.js（自動検出されます）
   - **Root Directory**: `./` (デフォルトのまま)
   - **Build Command**: `npm run build` (デフォルトのまま)
   - **Output Directory**: `.next` (デフォルトのまま)

4. **環境変数の設定（重要！）**

   「Environment Variables」セクションで以下を設定：

   ```
   Name: GEMINI_API_KEY
   Value: [あなたのGemini APIキー]
   ```

   - 「Add」をクリックして追加
   - 必要に応じてFirebaseの環境変数も追加（後で設定可能）

5. **デプロイ**
   - 「Deploy」ボタンをクリック
   - 数分待つと、デプロイが完了します！

6. **公開URLを確認**
   - デプロイ完了後、`https://あなたのアプリ名.vercel.app` のようなURLが発行されます
   - このURLにアクセスして動作確認

## 🔧 デプロイ後の設定

### カスタムドメインを設定（オプション）

1. Vercelのプロジェクトダッシュボードで「Settings」→「Domains」
2. 「Add」をクリックして独自ドメインを追加
3. DNS設定を行う（Vercelが指示を出してくれます）

### 環境変数の追加・変更

1. Vercelのプロジェクトダッシュボードで「Settings」→「Environment Variables」
2. 新しい変数を追加、または既存の変数を編集
3. 変更後、「Redeploy」で再デプロイが必要

## 🔄 自動デプロイ

GitHubにプッシュすると、**自動的にVercelがデプロイ**してくれます！

```bash
# コードを修正
git add .
git commit -m "新機能を追加"
git push

# 自動的にVercelがデプロイを開始！
```

- **main ブランチ**: 本番環境にデプロイ
- **その他のブランチ**: プレビュー環境にデプロイ（テスト用）

## 📊 デプロイ後のチェックリスト

- [ ] アプリが正常に表示される
- [ ] AI自動収集機能が動作する（Gemini APIキーが設定されている）
- [ ] 企業の追加・編集・削除ができる
- [ ] データがローカルストレージに保存される
- [ ] レスポンシブデザインが正しく表示される（スマホでもチェック）

## ⚠️ 注意事項

### セキュリティ

- **環境変数は絶対にGitにコミットしない**
  - `.env.local` は `.gitignore` に含まれているので大丈夫です
  - Vercelの管理画面から設定してください

- **APIキーの管理**
  - Gemini APIキーは必ずVercelの環境変数として設定
  - GitHubリポジトリがPublicの場合、コード内にAPIキーを含めないよう注意

### パフォーマンス

- **無料枠の制限**
  - Vercel無料プラン: 月100GB帯域幅まで
  - Gemini API無料枠: 月60リクエストまで
  - 超過する場合は有料プランへの移行を検討

### データ管理

- **現在はローカルストレージ**
  - ユーザーごとにブラウザのローカルストレージにデータを保存
  - ブラウザを変えると、データは引き継がれません
  - 将来的にFirebaseを導入すれば、クラウドで同期可能

## 🎯 次のステップ

デプロイが完了したら、以下の機能追加を検討しましょう：

1. **Firebase Authentication**
   - ユーザー登録・ログイン機能
   - データをクラウドで管理

2. **Firestore Database**
   - ローカルストレージからクラウドDBへ移行
   - 複数デバイスでデータ同期

3. **PWA化**
   - オフラインでも使えるアプリに
   - ホーム画面に追加可能

4. **分析機能**
   - Google Analyticsの導入
   - ユーザーの使用状況を分析

## 🆘 トラブルシューティング

### デプロイに失敗する

1. ビルドログを確認
2. ローカルで `npm run build` を実行してエラーがないか確認
3. `package.json` の依存関係を確認

### AIが動かない

1. Vercelの環境変数で `GEMINI_API_KEY` が設定されているか確認
2. APIキーが正しいか確認
3. デプロイ後、再デプロイを試す

### 404エラーが出る

1. ルーティング設定を確認
2. `next.config.ts` の設定を確認
3. Vercelの「Deployments」で最新のデプロイが成功しているか確認

## 📚 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Next.jsデプロイガイド](https://nextjs.org/docs/deployment)
- [Vercel環境変数の設定](https://vercel.com/docs/concepts/projects/environment-variables)

---

何か問題が発生したら、Vercelのサポートドキュメントを確認するか、GitHubのIssueで質問してください！
