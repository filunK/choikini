<!-- TOC -->

- [1. 全体設計](#1-全体設計)
    - [1.1. プログラム構成](#11-プログラム構成)
    - [1.2. REST API 使用のフロー](#12-rest-api-使用のフロー)
    - [1.3. レスポンスのデータ構造](#13-レスポンスのデータ構造)
    - [1.4. データストアモデル](#14-データストアモデル)
        - [1.4.1. Userコレクション](#141-userコレクション)
        - [1.4.2. ChoikiniListコレクション](#142-choikinilistコレクション)
- [2. REST API 設計](#2-rest-api-設計)
    - [2.1. REST API 一覧](#21-rest-api-一覧)
    - [2.2. REST API 詳細](#22-rest-api-詳細)
        - [2.2.1. PUT - /user](#221-put---user)
            - [2.2.1.1. リクエスト](#2211-リクエスト)
            - [2.2.1.2. レスポンス](#2212-レスポンス)
            - [2.2.1.3. 処理フロー設計](#2213-処理フロー設計)
        - [2.2.2. GET - /choikini/:user](#222-get---choikiniuser)
            - [2.2.2.1. リクエスト](#2221-リクエスト)
            - [2.2.2.2. レスポンス](#2222-レスポンス)
            - [2.2.2.3. 処理フロー設計](#2223-処理フロー設計)
        - [2.2.3. POST - /choikini/:user](#223-post---choikiniuser)
            - [2.2.3.1. リクエスト](#2231-リクエスト)
            - [2.2.3.2. レスポンス](#2232-レスポンス)
            - [2.2.3.3. 処理フロー設計](#2233-処理フロー設計)
        - [2.2.4. GET - /choikini](#224-get---choikini)
            - [2.2.4.1. リクエスト](#2241-リクエスト)
            - [2.2.4.2. レスポンス](#2242-レスポンス)
            - [2.2.4.3. 処理フロー設計](#2243-処理フロー設計)

<!-- /TOC -->

<div style="page-break-before:always"></div>

# 1. 全体設計

## 1.1. プログラム構成

choikiniのプログラム構成を以下の図に示す。

![クラス図](../out/02-design/02-01_CL_classdiagram/全体クラス図.svg)

エントリポイントであるExpressJS起動コード「エントリポイント」を中心に、以下のモジュール構成からなる。

<dl>
    <dt>routingモジュール</dt>
        <dd>ExpressJSのルーティングと実際の処理を紐付ける</dd>
    <dt>procedureモジュール</dt>
        <dd>実際の処理を司る</dd>
    <dt>commonsモジュール</dt>
        <dd>データベースに依存しない汎用処理を受け持つ</dd>
    <dt>daoモジュール</dt>
        <dd>データアクセスを司る</dd>
    <dt>objectModelsモジュール</dt>
        <dd>procedureモジュールやdaoモジュールで使用するデータクラスをまとめたもの</dd>
</dl>

<div style="page-break-before:always"></div>

## 1.2. REST API 使用のフロー

choikiniを利用するにあたってクライアントに求める呼び出しフローを以下の図に示す。

![利用フロー](../out/02-design/02-01_SEQ_protocol/02-01_REST_APIのクライアントからの利用プロトコル.svg)

ログイン処理にてクライアントは次に行う処理に使用することができる *トークン* を取得する。
取得したトークンは使い捨てのワンタイムトークンであり、特定の処理に使用した後にトークンは破棄=ログオフとなる。
トークンはログイン以外の全ての処理で必要であり、リクエストヘッダにp-choikini-token属性を含める。

``` リクエストヘッダでのトークン設定例
p-choikini-token : e075c14ab4f37cacdbdd9ab5ca2a5498
```

<div style="page-break-before:always"></div>

## 1.3. レスポンスのデータ構造

各リクエストのレスポンスは全てJSON(application/json)で返却する。
JSONフォーマットとしてHAL(Hypertext Application Language)をベースとする。

[HAL Specification(http://stateless.co/hal_specification.html)](http://stateless.co/hal_specification.html)

[RFCインターネットドラフト(https://tools.ietf.org/html/draft-kelly-json-hal-08)](https://tools.ietf.org/html/draft-kelly-json-hal-08)

``` データ構造
{
    "_links" : {
        "self" : {
            "href" : "<<1>>"
        }
    },
    "_embedded" : {
        "state" : "<<2>>",
        "stateDetail" : "<<3>>",
        "response" : {
            <<4>>
        }
    }
}
```

| 参照箇所| 項目 | データ型 | 説明 |
|:-----:|-----:|:----|:--------|
| <<1>> | href| string | 使用されたリクエストのURI |
| <<2>> | state| string | リクエストが成功したかどうか。"OK" または "NG" のみ。 |
| <<3>> | stateDetail| any | _embedded.state = NG である場合の、その原因。<br />_embedded.state = OK ならば空である。 |
| <<4>> | response | any | _embedded.state = OK である場合の処理結果。レスポンス本体。 |

_embedded.responseの内容について、後述の [2.2. REST API 詳細](#22-rest-api-詳細) にて記述する。

<div style="page-break-before:always"></div>

## 1.4. データストアモデル

主データストアとして使用するMongoDBでのドキュメントモデルについて記述する。

choikiniでは２つのコレクションを使用する。

- User
- ChoikiniList

### 1.4.1. Userコレクション

Userコレクションはchoikini上の操作を行うユーザの情報を永続化するコレクションである。
スキーマは以下のとおりである。

``` ユーザコレクション
{
    _id: ObjectId,
    Name: String,
    Password: {
        Salt: String,
        Encrypted: String
    },
    Token: String,
    Auth: Number
}
```

本スキーマの項目定義は以下のとおりである。

| 項目 | データ型 | 制約 | 項目説明 |
|:---:|:----:|:----:|:--------|
| _id | ObjectId | ユニーク | ドキュメントのキー |
| Name | string | ユニーク | ユーザ名 |
| Password | Object| NULL非許容 | ユーザのパスワード情報。Password参照 |
| Token | string | NULL許容 | ワンタイムトークン |
| Auth | number | デフォルト値 = 0 | ユーザのアクセス権限 |

項目Paswordの項目定義は以下のとおりである。

| 項目 | データ型 | 制約 | 項目説明 |
|:---:|:----:|:----:|:--------|
| Salt | string | NULL非許容 | パスワードの解読・難読化に使用するSALT値 |
| Encrypted | string | NULL非許容 | 暗号化済みパスワード。 <br />Saltの値を使用した難読化・暗号化が施されていること。 |

項目Authにおいては、以下の値を許容する。

| 設定値 | 権限 |
|:-----:|:------|
| 0 | 通常 |
| 5 | 高権限 |
| 99 | 管理者権限 |

<div style="page-break-before:always"></div>

### 1.4.2. ChoikiniListコレクション

ChoikiniListコレクションは各ユーザのちょい気にを永続化するコレクションである。  
スキーマは以下のとおりである。

``` ちょい気にリストスキーマ
{
    _id: ObjectId,
    UserId: ObjectId,
    Choikinis: [
        {
            EntryDate: Date,
            Entry: String
        }
    ]
}
```

本スキーマの項目定義は以下のとおりである。

| 項目 | データ型 | 制約 | 項目説明 |
|:---:|:----:|:----:|:--------|
| _id | ObjectId | ユニーク、NULL非許容 | ドキュメントのキー |
| UserId | ObjectId | ユニーク | 対応するユーザのObjectID。Userコレクションでの_idを設定する。 |
| Choikinis | Array| NULL許容 | 登録されたちょい気にのリスト。Choikinis参照 |
| Token | string |  | ワンタイムトークン。NULLである場合は非ログイン状態。 |

項目Choikinisの項目定義は以下のとおりである。

| 項目 | データ型 | 制約 | 項目説明 |
|:---:|:----:|:----:|:--------|
| EntryDate | Date | デフォルト値 = 現在日時 | ちょい気にが登録された日時 |
| Entry | string|  | 登録されたちょい気に本文 |

<div style="page-break-before:always"></div>

# 2. REST API 設計

## 2.1. REST API 一覧

| HTTPメソッド  | URI | 処理概要 |
|:----------:|:----|:--------|
| PUT | /user | ログイン処理 |
| GET | /choikini/:user | ちょい気に取得 |
| POST | /choikini/:user | ちょい気にの登録 |
| GET | /choikini | 全ユーザのちょい気に取得 |

## 2.2. REST API 詳細

それぞれのREST API について記述する。

### 2.2.1. PUT - /user

ログインをする。

#### 2.2.1.1. リクエスト

|   |  |
|:----------:|:----|
| HTTPメソッド | PUT |
| URIパターン | /login |
| 入力データ形式 | application/json |

入力データ形式は以下のとおりとする。

``` 入力データ形式
{
    "name": "admin",
    "password": "password"
}
```

| 項目  | データ型 | 説明 |
|:-----:|:----|:--------|
| name | string | ログインするユーザ名 |
| password | string | ユーザ名に紐づくパスワード |

#### 2.2.1.2. レスポンス

``` レスポンス
{
    "_links": {
        "self": {
            "href": "/user"
        }
    },
    "_embedded": {
        "state": "OK",
        "stateDetail": "",
        "response": {
            "token": "e075c14ab4f37cacdbdd9ab5ca2a5498"
        }
    }
}
```

_embedded.responseの内容は以下のとおりである。

| 項目 | データ型 | 説明 |
|:-----:|:----|:--------|
| token | string | 使用可能なワンタイムトークン |

#### 2.2.1.3. 処理フロー設計

当APIの処理フローについて記述する。

![アクティビティ図](../out/02-design/02-02_ACT_login/02-02_ACT_ログイン処理.svg)

![シーケンス図](../out/02-design/02-02_SEQ_login/02-02_SEQ_ログイン処理.svg)

### 2.2.2. GET - /choikini/:user

単一ユーザの「ちょい気に」を全て取得する。

#### 2.2.2.1. リクエスト

|   |  |
|:----------:|:----|
| HTTPメソッド | GET |
| URIパターン | /choikini/:user |
| 入力データ形式 | URIパターン、リクエストヘッダ |

入力データ形式は以下のとおりとする。

- URIパターン

:userとしている箇所に取得対象ユーザを指定する。

``` URI
/choikini/admin
```

- リクエストヘッダ

リクエストに以下の属性を付与すること。

|属性 | 設定値 |
|:----------:|:----|
| p-choikini-token | /loginで取得したワンタイムトークン |

``` リクエストヘッダ
> GET /choikini/admin HTTP/1.1
> Host: localhost:30000
> User-Agent: insomnia/5.9.6
> Accept: */*
> Accept-Encoding: deflate, gzip
> p-choikini-token: e075c14ab4f37cacdbdd9ab5ca2a5498
```

#### 2.2.2.2. レスポンス

``` レスポンス
{
    "_links": {
        "self": {
            "href": "/choikini/admin"
        }
    },
    "_embedded": {
        "state": "OK",
        "stateDetail": "",
        "response": {
            "user": "admin",
            "choikiniList": [
                {
                    "date": "2017-10-07T05:26:02.662Z",
                    "choikini": "テストちょい気にテキスト"
                },
                {
                    "date": "2017-10-07T05:26:12.764Z",
                    "choikini": "テストちょい気にテキスト"
                }
            ]
        }
    }
}
```

_embedded.responseの内容は以下のとおりである。

| 項目 | データ型 | 説明 |
|:-----:|:----|:--------|
| user | string | 取得対象のユーザ名 |
| choikiniList | object[] | ユーザのちょい気にを格納したリスト |

choikiniListの内容は以下のとおりである。

| 項目 | データ型 | 説明 |
|:-----:|:----|:--------|
| date | string | ちょい気にが登録された日時。ISO 8601 Extended Format に準じた文字列。 |
| choikini | string | ちょい気に本文 |

#### 2.2.2.3. 処理フロー設計

当APIの処理フローについて記述する。

![アクティビティ図](../out/02-design/02-04_ACT_getChoikini/02-04_ACT_ちょい気に取得.svg)

![シーケンス図](../out/02-design/02-04_SEQ_getChoikini/02-04_ACT_ちょい気に取得.svg)

### 2.2.3. POST - /choikini/:user

#### 2.2.3.1. リクエスト

#### 2.2.3.2. レスポンス

#### 2.2.3.3. 処理フロー設計

### 2.2.4. GET - /choikini

#### 2.2.4.1. リクエスト

#### 2.2.4.2. レスポンス

#### 2.2.4.3. 処理フロー設計
