# 就活管理アプリ

就職活動を効率的に管理するためのWebアプリケーションです。企業情報、選考ステップ、スケジュールを一元管理できます。

## 機能

### 現在実装済み
- ✅ 企業情報の登録・編集・削除
- ✅ **AI自動収集機能**（Gemini API）- 企業名を入力するだけで企業情報を自動取得！
- ✅ 選考ステータスの管理（興味あり〜内定まで）
- ✅ 選考ステップの詳細管理（締切日、実施予定日、完了日、メモ）
- ✅ 企業検索とフィルタリング
- ✅ 統計情報の表示
- ✅ ローカルストレージによるデータ保存

### 今後の予定
- 🔜 Firebase連携（クラウドでデータ保存）
- 🔜 業界・職種マップの視覚化
- 🔜 ES・面接対策トレーニング機能
- 🔜 自己分析管理

## 開発環境のセットアップ

### 必要なもの
- Node.js 18以上
- npm または yarn

### インストール手順

1. リポジトリのクローン（既に完了している場合はスキップ）
```bash
cd job-hunt-app
```

2. パッケージのインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

4. ブラウザで開く
```
http://localhost:3000
```

現在はローカルストレージでデータを保存しているため、Firebaseの設定なしで動作します。

## Gemini APIのセットアップ（AI自動収集機能を使う場合）

AI自動収集機能を使いたい場合は、Google Gemini APIキーが必要です。

### 1. APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Get API key」または「APIキーを作成」をクリック
4. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
5. APIキーをコピー

### 2. 環境変数の設定

1. `.env.local.example` をコピーして `.env.local` を作成
```bash
cp .env.local.example .env.local
```

2. `.env.local` を開いて、Gemini APIキーを入力
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. 開発サーバーの再起動

```bash
npm run dev
```

これでAI自動収集機能が使えるようになります！

### 使い方

1. 「企業を追加」ボタンをクリック
2. 企業名を入力（例：「トヨタ自動車」「楽天」など）
3. 「AI自動入力」ボタンをクリック
4. AIが自動で以下の情報を収集して入力します：
   - 業界
   - 従業員数
   - 本社所在地
   - ホームページURL
   - 企業説明
   - 主な職種
   - 初任給の目安
   - 勤務地
   - 福利厚生

**注意**: Gemini APIには無料枠がありますが、使いすぎると課金される可能性があります。詳しくは[料金ページ](https://ai.google.dev/pricing)を確認してください。

## Firebaseのセットアップ（オプション）

データをクラウドで保存したい場合は、以下の手順でFirebaseを設定してください。

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: job-hunt-app）
4. Google アナリティクスは任意で設定
5. プロジェクトを作成

### 2. Firebaseアプリの設定

1. プロジェクトのホーム画面で「ウェブアプリ」（</>アイコン）をクリック
2. アプリのニックネームを入力（例: job-hunt-web）
3. 「このアプリのFirebase Hostingも設定します」はチェックしなくてOK
4. 「アプリを登録」をクリック

### 3. 設定情報の取得

表示された設定情報（firebaseConfig）をコピーします：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. 環境変数の設定

1. `.env.local.example` をコピーして `.env.local` を作成
```bash
cp .env.local.example .env.local
```

2. `.env.local` を開いて、Firebaseの設定情報を入力
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 5. Firestoreの有効化

1. Firebase Consoleのサイドメニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（例: asia-northeast1（東京））
4. 「本番環境モード」を選択
5. セキュリティルールを以下のように設定：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{companyId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Authentication の有効化（将来の機能用）

1. Firebase Consoleのサイドメニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで「メール/パスワード」を有効化

### 7. 開発サーバーの再起動

```bash
npm run dev
```

これでFirebaseとの連携が完了します！

## デプロイ

### Firebase Hostingへのデプロイ

1. Firebase CLIのインストール
```bash
npm install -g firebase-tools
```

2. Firebaseにログイン
```bash
firebase login
```

3. プロジェクトの初期化
```bash
firebase init hosting
```
- Public directory: `.next` と入力
- Configure as single-page app: Yes
- Set up automatic builds: No

4. ビルド
```bash
npm run build
```

5. デプロイ
```bash
firebase deploy
```

### Vercelへのデプロイ（推奨）

1. [Vercel](https://vercel.com) でGitHubアカウントと連携
2. このリポジトリをインポート
3. 環境変数を設定（.env.localの内容）
4. デプロイ

## 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **データベース**: Firebase Firestore（予定）
- **認証**: Firebase Authentication（予定）
- **ホスティング**: Vercel または Firebase Hosting

## 開発について

### ディレクトリ構成

```
job-hunt-app/
├── app/              # Next.js App Router
│   └── page.tsx      # メインページ
├── components/       # Reactコンポーネント
│   ├── CompanyModal.tsx
│   └── SelectionStepsManager.tsx
├── lib/              # ユーティリティ関数
│   ├── firebase.ts
│   └── localStorage.ts
├── types/            # TypeScript型定義
│   └── index.ts
└── public/           # 静的ファイル
```

### 開発時のヒント

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run lint`: ESLintでコードチェック

## ライセンス

MIT

## 作者

就活生のための、就活生による就活管理アプリ
