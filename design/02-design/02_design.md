<!-- TOC -->

- [1. 全体設計](#1-全体設計)
    - [1.1. プログラム構成](#11-プログラム構成)
    - [1.2. REST API 使用のフロー](#12-rest-api-使用のフロー)
- [2. REST API 設計](#2-rest-api-設計)
    - [2.1. REST API 一覧](#21-rest-api-一覧)
    - [2.2. REST API 詳細](#22-rest-api-詳細)
        - [2.2.1. PUT - /user](#221-put---user)
        - [2.2.2. GET - /choikini/:user](#222-get---choikiniuser)
        - [2.2.3. POST - /choikini/:user](#223-post---choikiniuser)
        - [2.2.4. GET - /choikini](#224-get---choikini)

<!-- /TOC -->


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

## 1.2. REST API 使用のフロー

choikiniを利用するにあたってクライアントに求める呼び出しフローを以下の図に示す。

![利用フロー](../out/02-design/02-01_SEQ_protocol/02-01_REST_APIのクライアントからの利用プロトコル.svg)

ログイン処理にてクライアントは次に行う処理に使用することができる *トークン* を取得する。  
取得したトークンは使い捨てのワンタイムトークンであり、特定の処理に使用した後にトークンは破棄=ログオフとなる。  
トークンはログイン以外の全ての処理で必要であり、リクエストのp-choikini-tokenヘッダにその値を含める。

``` リクエストヘッダでのトークン設定例
p-choikini-token : e075c14ab4f37cacdbdd9ab5ca2a5498
```

# 2. REST API 設計

## 2.1. REST API 一覧

| HTTPメソッド  | URI | 処理概要 |
|:----------:|:----|:--------|
| PUT | /user | ログイン処理 |
| GET | /choikini/:user | ちょい気に取得 |
| POST | /choikini/:user | ちょい気にの登録 |
| GET | /choikini | 全ユーザのちょい気に取得 |

## 2.2. REST API 詳細

### 2.2.1. PUT - /user

### 2.2.2. GET - /choikini/:user

### 2.2.3. POST - /choikini/:user

### 2.2.4. GET - /choikini