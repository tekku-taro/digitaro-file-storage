# Digitaroファイルストレージ

## Digitaroファイルストレージについて

Laravel + React Inertiajsを使用したファイルストレージアプリです。フロントエンドのコードは[このリポジトリ](https://github.com/webdevcody/file-drive)に基づいています。

LaravelとInertiajsはnextjsの代わりに採用されています。このアプリはLaravel Breeze認証を使用し、アップロードされたファイルをプロジェクトフォルダ内に保存するため、オリジナルのfile-driveアプリとは異なり、外部サービスを必要とせずにアパッチサーバー上で動作できます。

## 管理パネル

テーブルデータを管理するために、**Laravel Filament** が採用されており、シンプルで使いやすい機能を提供します。

## テーブル

- Groupsはユーザーと多対多の関係を持ちます。
- File_typesはアップロード可能なすべてのファイルタイプを含みます。
- Favoritesにはユーザーのお気に入りファイルが含まれます。
- Download_historiesにはユーザーが行ったダウンロードの記録が含まれます。

## ライセンス

このアプリケーションは[MITライセンス](https://opensource.org/licenses/MIT)のもとでオープンソースソフトウェアとして提供されています。
