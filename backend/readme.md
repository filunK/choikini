# Choikini_bk - CHoikiniバックエンド

## About choikini_bk

Choikiniにおけるバックエンド=WebAPIを実装します。

## About run choikini

ここではトランスパイルしたファイルを使用し、Herokuなどではなく自前のサーバでサービス実行するまでの手順を説明します。
このセクションでは、以下のサーバ・所有者で実行することを目指します。

| key | value |
|-:|:-|
| サーバ | choikiniServ |
| デプロイ先 | /opt/Choikini |
| 実行ユーザ | choikini:choikini |

なお、実行ユーザは ``sudo`` が実行可能である必要があります。また、windows環境では最後のサービス化ができません。

### リリースファイル作成

* まずは開発機などでリポジトリをクローンします

``` clone repo
# git clone https://github.com/filunK/choikini.git
```

* バックエンドをトランスパイルします。

``` build flow
# cd ./choikini/backend

# npm install --save-dev

# ./node_modules/.bin/tsc -p ./backend/tsconfig.json
```

* config/template.jsonを元にproduction.jsonを作成します。

* リリースファイルを作成

``` release module
# rm -rf ./bin/test/

# tar cvzf ./release.tar.gz ./bin ./src/app ./src/tools ./config package*.json
```

これで作成された ``release.tar.gz`` を実行サーバ choikiniServ に転送します。
ここでは、/opt/CHoikiniに転送した想定で今後の手順を説明します。

### サーバデプロイ

サーバに転送してからの流れを記載します。

* ファイル展開

``` extract
# cd /opt/Choikini

# tar xzf release.tar.gz
```

* npmモジュールをインストールします。

```install npm
# npm install
```

* （実行ユーザがリリースファイルと異なる場合）アプリケーションの権限を変更します。

``` chmod
# chown choikini:choikini -R /opt/Choikini
```

* pm2モジュールをグローバルインストールします。

``` install pm2
# npm install -g pm2
```

* ユーザを実行ユーザに切り替えます。

``` su
# su - choikini
```

* アプリケーションの実行します。

``` run app(via config)
# pm2 start ./config/pm2/service.json --env production
```

* pm2に稼動状態を記憶させ、サービス化します。

``` servisize
# sudo pm2 startup [platform] -u choikini
# pm2 save
```

[platform]は実行サーバのinitシステムによって変化します。

* systemd
* upstart
* launchd
* rcd

「どれを設定すればいいんだけ？」という場合は ``pm2 startup -u choikini`` で、sudo実行しなければ「このコマンドを実行して！」とレスポンスがあるので、そこに記載の物を使いましょう。
