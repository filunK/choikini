
/**
 * キー「application」のインターフェース
 * 
 * @export
 * @interface IAppConfig
 */
export interface IAppConfig {
    /**
     * choikini_bkのリスナーポート
     * 
     * @type {string}
     * @memberOf IAppConfig
     */
    serverPort: string
}

/**
 * キー「auth」のインターフェース
 * 
 * @export
 * @interface IAuthConfig
 */
export interface IAuthConfig {

    /**
     * 暗号化アルゴリズム
     * 
     * @type {string}
     * @memberOf IAuthConfig
     */
    crypto: string,

    /**
     * ハッシュ化アルゴリズム
     * 
     * @type {string}
     * @memberOf IAuthConfig
     */
    hash: string
}

/**
 * キー「mongoose」のインターフェース
 * 
 * @export
 * @interface IDbConfig
 */
export interface IDbConfig {

    /**
     * MongoDBサーバーホスト名
     * 
     * @type {string}
     * @memberOf IDbConfig
     */
    server: string, 

    /**
     * MongoDB接続ポート
     * 
     * @type {number}
     * @memberOf IDbConfig
     */
    port: number, 

    /**
     * MongoDB接続先データベース名
     * 
     * @type {string}
     * @memberOf IDbConfig
     */
    database: string, 

    /**
     * MongoDB接続ユーザ名
     * 
     * @type {string}
     * @memberOf IDbConfig
     */
    user: string, 

    /**
     * MongoDB接続パスワード
     * 
     * @type {string}
     * @memberOf IDbConfig
     */
    password: string 
}
