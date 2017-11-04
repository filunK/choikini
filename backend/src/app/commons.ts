import {Handler} from "express";
import * as Path from "path";
import * as Crypto from "crypto";

import * as Config from "config";
import * as Log4js from "log4js";

import {IAuthConfig} from "./IConfig"
import {User,UserAccess} from "./datamodel"


/**
 * Log4jsをラップするロガークラス
 * 
 * @export
 * @class Logger
 */
export class Logger {

    /**
     * log4jsを初期化する。
     * アプリケーション実行時の初回に必ず呼び出す。
     * 
     * @static
     * 
     * @memberOf Logger
     */
    public static initialize() {
        let configure = Utils.GetConfig<Log4js.Configuration>("log4js");
        Log4js.configure(configure);
    }

    /**
     * INFOのアクセスログを記録する。
     * 
     * @static
     * @param {string} message 記録するメッセージ 
     * 
     * @memberOf Logger
     */
    public static LogAccessInfo(message: string): void {

        let logger = Log4js.getLogger("access");
        logger.info(message);
    }

    /**
     * WARNINGのアクセスログを記録する。
     * 
     * @static
     * @param {string} message 記録するメッセージ 
     * 
     * @memberOf Logger
     */
    public static LogAccessWarning(message: string): void {
        
        let logger = Log4js.getLogger("access");
        logger.warn(message);
    }

    /**
     * ERRORのアクセスログを記録する。
     * 
     * @static
     * @param {string} message 記録するメッセージ 
     * 
     * @memberOf Logger
     */
    public static LogAccessError(message: string): void {
        
        let logger = Log4js.getLogger("access");
        logger.error(message);
    }

    /**
     * INFOのシステムログを記録する。
     * 
     * @static
     * @param {string} message 記録するメッセージ
     * 
     * @memberOf Logger
     */
    public static LogSystemInfo(message: string): void {
        
        let logger = Log4js.getLogger("system");
        logger.info(message);
    }
    
    /**
     * WARNINGのシステムログを記録する。
     * 
     * @static
     * @param {string} message 記録するメッセージ
     * 
     * @memberOf Logger
     */
    public static LogSystemWarning(message: string): void {
        
        let logger = Log4js.getLogger("system");
        logger.warn(message);
    }

    /**
     * ERRORのシステムログを記録する。
     * 
     * @static
     * @param {string} message 記録するメッセージ
     * 
     * @memberOf Logger
     */
    public static LogSystemError(message: string): void {
        
        let logger = Log4js.getLogger("system");
        logger.error(message);
    }

    /**
     * エラーログを記録する。
     * 
     * @static
     * @param {string} message 記録するメッセージ
     * 
     * @memberOf Logger
     */
    public static LogError(message: string): void {
        
        let logger = Log4js.getLogger("error");
        logger.error(message);
    }

    /**
     * ExpressjsのロガーにLog4jsを設定する。
     * 
     * @static
     * @returns {Handler} Expressjsに設定するハンドラ
     * 
     * @memberOf Logger
     */
    public static getExpressLogger(): Handler{
        return Log4js.connectLogger(Log4js.getLogger("access"),{
            level: "INFO"
        });
    }
}

/**
 * ユーティリティクラス
 * 
 * @export
 * @class Utils
 */
export class Utils {

    /**
     * configよりトップレベルオブジェクトを取得する。
     * 
     * @static
     * @template T 取得するオブジェクト構造
     * @param {string} key キーとなる要素
     * @returns {T} 設定オブジェクト
     * 
     * @memberOf Utils
     */
    public static GetConfig<T>(key: string): T {

        let configure = Config.util.loadFileConfigs(Path.join(process.cwd(),"config"));

        let obj: T = <T>configure[key];
        return obj;
    }


    /**
     * 定した値が利用可能であるか(nullまやはundefinedではないか)を確認する。
     * 
     * @static
     * @template T バリデート対象のデータ型
     * @param {T} validateTarget バリデート対象の変数
     * @returns {Boolean} 利用可否。trueならばTである。falseならばnull | undefinedである。
     * 
     * @memberOf Utils
     */
    public static  IsAvailableValue<T>(validateTarget: T) : Boolean {

        if (validateTarget == null || validateTarget == undefined) {
            return false;
        }

        return true;
    }

}

/**
 * ユーザ認証関連処理クラス
 * 
 * @export
 * @class Authentication
 */
export class Authentication {

    /**
     * SALTの文字列長
     * 
     * @readonly
     * @static
     * @type {number}
     * @memberOf Authentication
     */
    public static get SALT_LENGHT(): number { return 10;}

    /**
     * SALTに含める文字を並べた文字列
     * 
     * @readonly
     * @static
     * @type {string}
     * @memberOf Authentication
     */
    public static get SALT_CHARSET(): string { return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-=^~|[{]}@:*";}
    
    /**
     * パスワード情報のシードとなるSALTを生成する。
     * 
     * @static
     * @returns {string} SALT値
     * 
     * @memberOf Authentication
     */
    public static GenerateSalt(): string {

        let enctypted: string = "";

        for (var i = 0; i < Authentication.SALT_LENGHT; i++) {

            enctypted += Authentication.SALT_CHARSET.split("")[Math.floor(Math.random() * Authentication.SALT_CHARSET.length)];
            
        }

        return enctypted;
    }

    /**
     * パスワードの認証を行う
     * 
     * @static
     * @param {string} requestPw リクエストユーザのパスワード
     * @param {string} requestSalt リクエストユーザのSALT
     * @param {string} dbPw DBより取得したパスワード
     * @returns {boolean} 認証可否。trueならば成功、falseならば失敗
     * 
     * @memberOf Authentication
     */
    public static ValidatePassword(requestPw: string,requestSalt: string, dbPw: string) : boolean {

        let configure = Utils.GetConfig<IAuthConfig>("auth");

        // SALTのハッシュ化
        let hash = Authentication.Hasharize(configure.hash, requestSalt);
        
        // リクエストパスワードの暗号化
        let chipperdPw = Authentication.Cryptize(configure.crypto,hash,requestPw);
        
        return chipperdPw === dbPw;
    }

    /**
     * トークンを生成する
     * 
     * @static
     * @param {string} seed 元となる文字列
     * @returns {string} トークン
     * 
     * @memberOf Authentication
     */
    public static GenerateToken(seed: string): string {

        let configure = Utils.GetConfig<IAuthConfig>("auth");


        let salt = Authentication.GenerateSalt();
        salt = Authentication.Hasharize(configure.hash,salt);

        let token = Authentication.Cryptize(configure.crypto,salt, Date.now.toString() + seed);

        return token;
    }

    /**
     * 指定された権限が高権限以上であるかどうか判定する。
     * 
     * @static
     * @param {UserAccess} auth ユーザ権限
     * @returns {boolean} trueならば高権限以上、falseならば一般権限
     * 
     * @memberOf Authentication
     */
    public static IsHigherAuth(auth: UserAccess) : boolean{
        return auth >= UserAccess.HIGH;        
    }

    /**
     * 指定された権限が管理者権限であるかどうか判定する。
     * 
     * @static
     * @param {UserAccess} auth ユーザ権限
     * @returns {boolean} trueならば管理者権限、falseならば高権限以下。
     * 
     * @memberOf Authentication
     */
    public static IsAdmin(auth: UserAccess) : boolean{
        return auth == UserAccess.ADMINISTRATOR;        
    }

    /**
     * ハッシュ化を行う。SALTのハッシュ化など
     * 
     * @private
     * @static
     * @param {string} hashalgo ハッシュ化アルゴリズム
     * @param {string} seed 入力となる文字列
     * @returns {string} ハッシュ化された文字列
     * 
     * @memberOf Authentication
     */
    private static Hasharize(hashalgo: string, seed: string): string {
        let hash = Crypto.createHash(hashalgo);
        hash.update(seed);
        return hash.digest("hex");
    }

    /**
     * 暗号化を行う。パスワードの暗号化など
     * 
     * @private
     * @static
     * @param {string} cryptoAlgo 暗号化アルゴリズム
     * @param {string} salt SALT。Authentication::hasharizeでハッシュ化すること。
     * @param {string} seed 入力となる文字列
     * @returns {string} 暗号化された文字列
     * 
     * @memberOf Authentication
     */
    private static Cryptize(cryptoAlgo: string, salt: string, seed: string): string {

        let chiper = Crypto.createCipher(cryptoAlgo,salt);
        chiper.update(seed,"utf8","hex");

        return chiper.final("hex");
    }

}
