# Odango 開発環境とGitHub運用メモ

## 1. 全体像

Odango開発では、以下のように役割が分かれます。

| 場所       | 役割                |
| -------- | ----------------- |
| GitHub   | コードやREADMEを保存する場所 |
| 自分のPC    | 実際にコードを書く場所       |
| VS Code  | コード編集をする場所        |
| ターミナル    | コマンドを実行する場所       |
| Supabase | 認証・DB・権限管理を設定する場所 |
| Expo Go  | スマホで動作確認する場所      |

つまり、GitHub上で直接アプリを作るわけではありません。
基本は、自分のPCでコードを書いて、それをGitHubに保存していく形です。

---

## 2. 最初にGitHubでやること

## 2.1 GitHubでリポジトリを作る

まず、GitHubのWebサイトで新しいリポジトリを作ります。

### GitHub上でやること

1. GitHubにログイン
2. 右上の `+` を押す
3. `New repository` を選ぶ
4. Repository name に以下を入力する

```text
odango
```

1. Description に以下のように書く

```text
近場のおでかけコースを3スポットで提案・保存できるモバイルアプリ
```

1. `Public` / `Private` を選ぶ

就活ポートフォリオとして出すなら、最終的には **Public** がよいです。
ただし、開発途中で見られたくない場合は、最初は **Private** でも構いません。

1. `Create repository` を押す

ここでGitHub側の箱ができます。

---

## 3. 自分のPCでやること

GitHubに箱を作っただけでは、まだアプリはありません。
次に、自分のPC上でExpoアプリを作ります。

---

## 3.1 ターミナルで作業フォルダへ移動する

現在は以下の構成で進めています。

```text
~/Desktop/dev/odango
```

作業フォルダへ移動するには、以下を実行します。

```bash
cd ~/Desktop/dev
```

---

## 3.2 Expoプロジェクトを作る

ターミナルで以下を実行します。

```bash
npx create-expo-app odango
```

すると、自分のPCに `odango` というフォルダが作られます。

```text
~/Desktop/dev/odango
```

このフォルダが、Odangoアプリ本体です。

---

## 3.3 VS Codeで開く

ターミナルで以下を実行します。

```bash
cd odango
code .
```

これでVS Codeが開きます。

ここから先、コードを書く作業は基本的にVS Codeで行います。

---

## 4. GitHubと自分のPCをつなぐ

次に、自分のPCで作った `odango` フォルダをGitHubと接続します。

---

## 4.1 Gitを初期化する

ターミナルで、`odango` フォルダにいる状態で実行します。

```bash
git init
```

これは、

> このフォルダをGitで管理します

という意味です。

---

## 4.2 最初の保存をする

```bash
git add .
git commit -m "Initial commit"
```

| コマンド                  | 意味               |
| --------------------- | ---------------- |
| `git add .`           | 変更したファイルを保存対象にする |
| `git commit -m "..."` | その時点の変更を記録する     |

---

## 4.3 GitHubのリポジトリと接続する

GitHubで作った `odango` リポジトリのURLを使います。

```bash
git remote add origin https://github.com/ユーザー名/odango.git
git branch -M main
git push -u origin main
```

これで、自分のPCのコードがGitHubにアップロードされます。

---

## 5. VS Codeでやること

VS Codeでは、実際にアプリの中身を作ります。

Odangoでは、最初は以下のようなフォルダ構成にするとよいです。

```text
odango/
  app/
    index.tsx
    login.tsx
    signup.tsx
    home.tsx
    suggest.tsx
    courses/
      index.tsx
      [id].tsx
      [id]/
        edit.tsx
    mypage.tsx

  components/
    CourseCard.tsx
    SpotCard.tsx
    Loading.tsx
    ErrorMessage.tsx

  lib/
    supabase.ts

  types/
    course.ts
    spot.ts

  docs/
    requirements.md
    roadmap.md
    database.md
    screens.md

  README.md
```

---

## 5.1 `app/` でやること

`app/` は画面を置く場所です。

| ファイル                    | 何を作るか       |
| ----------------------- | ----------- |
| `login.tsx`             | ログイン画面      |
| `signup.tsx`            | 新規登録画面      |
| `home.tsx`              | 条件選択画面      |
| `suggest.tsx`           | コース提案画面     |
| `courses/index.tsx`     | 保存済み一覧画面    |
| `courses/[id].tsx`      | コース詳細画面     |
| `courses/[id]/edit.tsx` | コース編集画面     |
| `mypage.tsx`            | マイページ・ログアウト |

Expo Routerを使う場合、ファイル構成がそのまま画面遷移になります。

---

## 5.2 `components/` でやること

`components/` には、使い回すUI部品を置きます。

| ファイル               | 役割              |
| ------------------ | --------------- |
| `CourseCard.tsx`   | 保存済みコース一覧で使うカード |
| `SpotCard.tsx`     | スポット表示カード       |
| `Loading.tsx`      | 読み込み中表示         |
| `ErrorMessage.tsx` | エラー表示           |

これを分ける理由は、画面ファイルが長くなりすぎるのを防ぐためです。

---

## 5.3 `lib/` でやること

`lib/supabase.ts` には、Supabaseと接続する設定を書きます。

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

ここを作ると、他の画面から以下のように使えます。

```ts
import { supabase } from "@/lib/supabase";
```

---

## 5.4 `types/` でやること

`types/` には、データの型を書きます。

### 例：`types/spot.ts`

```ts
export type Spot = {
  id: string;
  name: string;
  area: string;
  category: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  google_maps_url: string | null;
};
```

### 例：`types/course.ts`

```ts
export type Course = {
  id: string;
  user_id: string;
  title: string;
  area: string;
  mood: string | null;
  memo: string | null;
  planned_date: string | null;
  created_at: string;
  updated_at: string | null;
};
```

TypeScriptでは、こうして型を作ることで、あとからミスに気づきやすくなります。

---

## 5.5 `docs/` でやること

`docs/` には、設計資料を置きます。

| ファイル              | 内容        |
| ----------------- | --------- |
| `requirements.md` | 要件定義書     |
| `roadmap.md`      | 開発ロードマップ  |
| `database.md`     | DB設計      |
| `screens.md`      | 画面一覧・画面遷移 |

ポートフォリオとしては、`docs/` があるとかなり印象が良いです。
「なんとなく作った」のではなく、設計して作ったことが伝わります。

---

## 6. Supabaseでやること

Supabaseでは、アプリの裏側を作ります。

---

## 6.1 Supabaseでプロジェクトを作る

SupabaseのWeb画面で行います。

1. Supabaseにログイン
2. `New project`
3. Project name に `odango`
4. Database password を設定
5. Regionを選ぶ
6. プロジェクト作成

ここで、Odango用のバックエンド環境ができます。

---

## 6.2 Supabase Authを設定する

Supabaseの管理画面で以下を開きます。

```text
Authentication
```

ここで確認することは以下です。

* Email認証を使える状態にする
* 必要ならメール確認をオフにする
* ログイン・新規登録ができるようにする

開発中は、メール確認をオフにした方が楽な場合があります。
ただし、本番運用するならメール確認ありの方が自然です。

---

## 6.3 Supabase SQL Editorでテーブルを作る

Supabase管理画面の以下を開きます。

```text
SQL Editor
```

そこで、以下のようなSQLを実行します。

---

### `spots`

```sql
create table spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  category text not null,
  description text,
  budget_min integer,
  budget_max integer,
  latitude double precision,
  longitude double precision,
  google_maps_url text,
  created_at timestamp with time zone default now()
);
```

---

### `courses`

```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  area text not null,
  mood text,
  memo text,
  planned_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

---

### `course_spots`

```sql
create table course_spots (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  spot_id uuid not null references spots(id) on delete cascade,
  position integer not null,
  note text,
  unique(course_id, position)
);
```

---

## 6.4 SupabaseでRLSを設定する

RLSは、他人のデータを見えないようにする設定です。

`courses` テーブルに対して以下を実行します。

```sql
alter table courses enable row level security;

create policy "Users can read their own courses"
on courses
for select
using (auth.uid() = user_id);

create policy "Users can create their own courses"
on courses
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own courses"
on courses
for update
using (auth.uid() = user_id);

create policy "Users can delete their own courses"
on courses
for delete
using (auth.uid() = user_id);
```

これにより、

> ログイン中のユーザーIDと、`courses.user_id` が一致する場合だけ操作できる

という状態になります。

---

## 7. ターミナルでやること

ターミナルでは、以下を行います。

---

## 7.1 アプリを起動する

```bash
npx expo start
```

これでExpoが起動します。

表示されたQRコードをスマホのExpo Goで読み取ると、スマホでアプリを確認できます。

---

## 7.2 ライブラリを入れる

Supabaseを使う場合は、以下を実行します。

```bash
npm install @supabase/supabase-js
```

AsyncStorageを使う場合は、以下を実行します。

```bash
npx expo install @react-native-async-storage/async-storage
```

React Native Paperを使う場合は、以下を実行します。

```bash
npm install react-native-paper
```

---

## 7.3 Gitで保存する

コードを書いたら、区切りごとに保存します。

```bash
git status
git add .
git commit -m "Implement login screen"
git push
```

| コマンド                  | 意味              |
| --------------------- | --------------- |
| `git status`          | 変更されたファイルを見る    |
| `git add .`           | 変更を保存対象にする      |
| `git commit -m "..."` | 変更内容を記録する       |
| `git push`            | GitHubにアップロードする |

---

## 8. どのタイミングでcommitするか

コミットは、機能が一区切りついたタイミングでします。

### 良いコミット例

```bash
git commit -m "Set up Expo project"
git commit -m "Add Supabase client"
git commit -m "Implement signup screen"
git commit -m "Implement login screen"
git commit -m "Implement logout feature"
git commit -m "Create database schema docs"
git commit -m "Implement course suggestion screen"
git commit -m "Implement course save feature"
git commit -m "Implement saved course list"
git commit -m "Implement course detail screen"
git commit -m "Implement course edit feature"
git commit -m "Implement course delete feature"
git commit -m "Add loading and error states"
git commit -m "Update README"
```

### 悪いコミット例

```bash
git commit -m "いろいろ"
git commit -m "修正"
git commit -m "完成"
```

これだと、何をしたか分かりません。

就活ポートフォリオでは、コミット履歴も一応見られる可能性があるため、できるだけ機能単位で書いた方がよいです。

---

## 9. GitHubに置くもの・置かないもの

## 9.1 GitHubに置くもの

| 置くもの                   | 理由             |
| ---------------------- | -------------- |
| ソースコード                 | 実装を見せるため       |
| `README.md`            | アプリの説明をするため    |
| `docs/requirements.md` | 要件定義を見せるため     |
| `docs/roadmap.md`      | 開発計画を見せるため     |
| `docs/database.md`     | DB設計を見せるため     |
| スクリーンショット              | 画面の完成度を見せるため   |
| `.env.example`         | 必要な環境変数を説明するため |

---

## 9.2 GitHubに置かないもの

| 置かないもの                    | 理由                |
| ------------------------- | ----------------- |
| `.env`                    | 環境変数が入っているため      |
| Supabaseのservice role key | 非常に危険な秘密鍵のため      |
| 個人情報                      | 不要かつ危険            |
| 本物の店舗データを大量に雑にコピーしたもの     | 著作権・正確性の問題が出やすいため |
| `node_modules`            | 自動生成される巨大フォルダのため  |

`.gitignore` に以下を入れます。

```gitignore
node_modules
.env
.env.local
.expo
dist
```

---

## 10. 毎日の開発の流れ

実際には、毎回この流れで作業します。

---

## 10.1 作業開始時

```bash
cd ~/Desktop/dev/odango
git pull
npx expo start
```

| コマンド                      | 意味              |
| ------------------------- | --------------- |
| `cd ~/Desktop/dev/odango` | Odangoのフォルダに移動  |
| `git pull`                | GitHub上の最新状態を取得 |
| `npx expo start`          | アプリを起動          |

---

## 10.2 開発中

VS Codeでコードを書きます。

例：

* `login.tsx` を編集する
* `supabase.ts` を作る
* `courses/index.tsx` を作る

動作確認は、Expo Goまたはブラウザで行います。

---

## 10.3 作業終了時

```bash
git status
git add .
git commit -m "Implement course list screen"
git push
```

これで、その日の作業がGitHubに残ります。

---

## 11. Odangoでの開発順序

GitHubを使いながら、以下の順番で作るのがよいです。

---

## Step 1：GitHubリポジトリ作成

### 場所

GitHubのWebサイト

### やること

* `odango` リポジトリを作る
* 説明文を書く
* `Public` / `Private` を決める

---

## Step 2：Expoプロジェクト作成

### 場所

自分のPCのターミナル

### やること

```bash
npx create-expo-app odango
cd odango
```

---

## Step 3：VS Codeで開く

### 場所

VS Code

### やること

```bash
code .
```

---

## Step 4：GitHubに初回push

### 場所

ターミナル

### やること

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ユーザー名/odango.git
git branch -M main
git push -u origin main
```

---

## Step 5：READMEの骨組みを作る

### 場所

VS Code

### やること

`README.md` に以下を書く。

```md
# Odango

## 概要

Odangoは、休日のおでかけ先を決める負担を減らすために、徒歩圏内の3スポットを1つのコースとして提案・保存できるアプリです。

## 使用技術

- React Native
- Expo
- TypeScript
- Supabase
- Supabase Auth
- Supabase PostgreSQL
- Expo Router

## 主な機能

- 新規登録
- ログイン
- ログアウト
- コース提案
- コース保存
- 保存済み一覧
- コース詳細
- コース編集
- コース削除
```

その後、以下を実行します。

```bash
git add .
git commit -m "Add README outline"
git push
```

---

## Step 6：Supabaseプロジェクト作成

### 場所

Supabase管理画面

### やること

* `odango` プロジェクトを作る
* Project URLを確認する
* anon keyを確認する
* Auth設定を確認する

---

## Step 7：`.env` を作る

### 場所

VS Code

### やること

`.env` を作る。

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`.gitignore` に以下を追加する。

```gitignore
.env
.env.local
```

`.env.example` も作る。

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

GitHubには `.env.example` だけ上げます。

---

## Step 8：Supabase接続ファイルを作る

### 場所

VS Code

### やること

`lib/supabase.ts` を作る。

その後、以下を実行します。

```bash
git add .
git commit -m "Add Supabase client"
git push
```

---

## Step 9：ログイン画面を作る

### 場所

VS Code

### やること

`app/login.tsx` を作る。

実装するもの：

* メールアドレス入力欄
* パスワード入力欄
* ログインボタン
* エラー表示
* 新規登録画面へのリンク

コミット：

```bash
git add .
git commit -m "Implement login screen"
git push
```

---

## Step 10：新規登録画面を作る

### 場所

VS Code

### やること

`app/signup.tsx` を作る。

実装するもの：

* メールアドレス入力欄
* パスワード入力欄
* パスワード確認
* 新規登録ボタン
* エラー表示

コミット：

```bash
git add .
git commit -m "Implement signup screen"
git push
```

---

## Step 11：DBテーブルを作る

### 場所

Supabase SQL Editor

### やること

以下のテーブルを作る。

* `spots`
* `courses`
* `course_spots`

作ったSQLは、GitHubの `docs/database.md` にも貼っておくとよいです。

コミット：

```bash
git add .
git commit -m "Add database schema docs"
git push
```

---

## Step 12：ホーム画面を作る

### 場所

VS Code

### やること

`app/home.tsx` を作る。

実装するもの：

* エリア選択
* 気分選択
* 予算選択
* コース提案ボタン

コミット：

```bash
git add .
git commit -m "Implement home screen"
git push
```

---

## Step 13：コース提案画面を作る

### 場所

VS Code

### やること

`app/suggest.tsx` を作る。

実装するもの：

* Supabaseから `spots` を取得
* 条件に合う3スポットを選ぶ
* 3スポットをカード表示
* 保存ボタン

コミット：

```bash
git add .
git commit -m "Implement course suggestion screen"
git push
```

---

## Step 14：コース保存機能を作る

### 場所

VS Code

### やること

実装する処理：

* ログインユーザー取得
* `courses` に保存
* `course_spots` に3件保存
* 保存成功後に一覧へ遷移

コミット：

```bash
git add .
git commit -m "Implement course save feature"
git push
```

---

## Step 15：保存済み一覧を作る

### 場所

VS Code

### やること

`app/courses/index.tsx` を作る。

実装するもの：

* Supabaseから自分のコース一覧取得
* `FlatList` で表示
* コースカードを押すと詳細へ遷移
* 空状態表示

コミット：

```bash
git add .
git commit -m "Implement saved courses list"
git push
```

---

## Step 16：詳細画面を作る

### 場所

VS Code

### やること

`app/courses/[id].tsx` を作る。

実装するもの：

* コース情報取得
* 3スポット取得
* 訪問順に表示
* 編集ボタン
* 削除ボタン

コミット：

```bash
git add .
git commit -m "Implement course detail screen"
git push
```

---

## Step 17：編集画面を作る

### 場所

VS Code

### やること

`app/courses/[id]/edit.tsx` を作る。

実装するもの：

* タイトル編集
* メモ編集
* 訪問予定日編集
* 保存ボタン

コミット：

```bash
git add .
git commit -m "Implement course edit feature"
git push
```

---

## Step 18：削除機能を作る

### 場所

VS Code

### やること

詳細画面に削除機能を追加します。

実装するもの：

* 削除確認
* Supabase delete
* 削除後に一覧へ戻る

コミット：

```bash
git add .
git commit -m "Implement course delete feature"
git push
```

---

## Step 19：RLSを設定する

### 場所

Supabase SQL Editor

### やること

* `courses` のRLS設定
* `course_spots` のRLS設定
* 他ユーザーのデータが見えないことを確認

設定内容は `docs/database.md` に残します。

コミット：

```bash
git add .
git commit -m "Add RLS policy docs"
git push
```

---

## Step 20：READMEを完成させる

### 場所

VS Code

### やること

READMEに以下を追加します。

* サービス概要
* 作成背景
* 使用技術
* 主な機能
* 画面一覧
* DB設計
* 工夫した点
* 苦労した点
* 今後の改善
* デモ動画リンク
* スクリーンショット

コミット：

```bash
git add .
git commit -m "Update README for portfolio"
git push
```

---

## 12. 最初はこれだけ覚えればよいこと

最初から全部きれいに運用しなくてよいです。
まずは以下だけ確実にやれば大丈夫です。

---

## GitHub

* リポジトリを作る
* READMEを書く
* コードをpushする

---

## 自分のPC

* Expoアプリを作る
* VS Codeでコードを書く

---

## ターミナル

```bash
npx expo start
git add .
git commit -m "..."
git push
```

---

## Supabase

* Auth設定
* DBテーブル作成
* RLS設定

---

## 13. 1日の作業例

たとえば、「ログイン画面を作る日」はこうです。

---

## 13.1 まずターミナル

```bash
cd ~/Desktop/dev/odango
git pull
npx expo start
```

---

## 13.2 次にVS Code

`app/login.tsx` を編集します。

作るもの：

* メールアドレス入力
* パスワード入力
* ログインボタン
* エラー表示

---

## 13.3 スマホで確認

Expo Goでログイン画面を確認します。

---

## 13.4 Supabaseで確認

AuthenticationのUsersにユーザーが作られるか確認します。

---

## 13.5 最後にGitHubへ保存

```bash
git status
git add .
git commit -m "Implement login screen"
git push
```

これで、その日の作業がGitHubに残ります。

---

# 結論

Odango開発では、以下の分担で考えるとよいです。

| 場所       | やること                    |
| -------- | ----------------------- |
| GitHub   | コード・README・設計資料を保存する    |
| VS Code  | アプリのコードを書く              |
| ターミナル    | Expo起動、Git操作、ライブラリ導入をする |
| Supabase | 認証、DB、RLSを設定する          |
| Expo Go  | スマホで動作確認する              |

最初にやるべきことは、以下の順です。

1. GitHubで `odango` リポジトリを作る
2. PCでExpoプロジェクトを作る
3. GitHubに初回pushする
4. READMEの骨組みを作る
5. Supabaseプロジェクトを作る
6. `.env` と `lib/supabase.ts` を作る
7. ログイン・新規登録から実装する

この流れで進めれば、GitHubを使いながら、ポートフォリオとして見せやすい形で開発できます。
