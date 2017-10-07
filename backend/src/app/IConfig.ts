/**
 * configモジュールで使用する設定のインターフェイス
 */


/**
 * キー「application」のインターフェース
 */
export interface IAppConfig {
    serverPort: string
}

/**
 * キー「auth」のインターフェース
 */
export interface IAuthConfig {
    crypto: string,
    hash: string
}

/**
 * キー「mongoose」のインターフェース
 */
export interface IDbConfig {
    server: string, 
    port: number, 
    database: string, 
    user: string, 
    password: string 
}
