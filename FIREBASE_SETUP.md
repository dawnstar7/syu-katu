# Firebase設定ガイド

## 🎯 Firebase Authenticationを有効化する手順

### ステップ1: Firebase設定情報を取得

1. **Firebaseコンソールを開く**
   - https://console.firebase.google.com/
   - 作成したプロジェクトをクリック

2. **Webアプリを追加（まだの場合）**
   - 左上の歯車アイコン → 「プロジェクトの設定」
   - 下にスクロールして「マイアプリ」セクション
   - まだアプリがない場合：`</>` (Webアイコン)をクリック
   - アプリのニックネーム: `job-hunt-app`
   - 「アプリを登録」をクリック

3. **設定情報をコピー**
   - 「プロジェクトの設定」→「全般」→下にスクロール
   - `firebaseConfig`が表示されます：
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

### ステップ2: Google認証を有効化

1. **Firebaseコンソール**で左メニューの「Authentication」をクリック
2. 「始める」をクリック（初回のみ）
3. 「Sign-in method」タブをクリック
4. 「Google」をクリック
5. 「有効にする」をオンに切り替え
6. プロジェクトのサポートメール（自分のメール）を選択
7. 「保存」をクリック

### ステップ3: 環境変数を設定

1. `.env.local`ファイルを開く
2. 以下のコメントアウト（#）を外して、値を入力：

```bash
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=取得したAPIキー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=取得したAuthDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=取得したProjectID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=取得したStorageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=取得したMessagingSenderID
NEXT_PUBLIC_FIREBASE_APP_ID=取得したAppID
```

**例：**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefGHIJKLMNOPQRSTUVW
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=job-hunt-app-12345.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=job-hunt-app-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=job-hunt-app-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### ステップ4: 開発サーバーを再起動

環境変数を変更したら、開発サーバーを再起動してください：

```bash
# 開発サーバーを停止（Ctrl+Cまたはターミナルを閉じる）
# 再起動
npm run dev
```

### ステップ5: 動作確認

1. http://localhost:3000 を開く
2. 右上に「Googleでログイン」ボタンが表示される
3. ボタンをクリックしてGoogleアカウントでログイン
4. ログイン成功後、ユーザーアイコンと名前が表示される

---

## 🚀 Vercel（本番環境）への設定

1. **Vercelダッシュボード**を開く
   - https://vercel.com/
   - プロジェクト（job-hunt-app）を選択

2. **Settings → Environment Variables**

3. **各環境変数を追加：**
   - Variable Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Value: （Firebase Consoleから取得した値）
   - Environment: `Production`, `Preview`, `Development` すべてチェック
   - 「Save」をクリック

4. **すべての環境変数を追加したら、再デプロイ：**
   - Deploymentsタブ → 最新のデプロイ → 「Redeploy」

---

## ✅ 完了！

これで、ユーザーはGoogleアカウントでログインできるようになりました。

次のステップ：
- Firestoreを使ってユーザーごとにデータを保存
- ログインしていないユーザーには機能を制限
