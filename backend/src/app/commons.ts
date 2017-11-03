import {Handler} from "express";
import * as Path from "path";
import * as Crypto from "crypto";

import * as Config from "config";
import * as Log4js from "log4js";

import {IAuthConfig} from "./IConfig"
import {User,UserAccess} from "./datamodel"


/**
 * ロガー
 */
export class Logger {

    public static initialize() {
        let configure = Utils.GetConfig<Log4js.Configuration>("log4js");
        Log4js.configure(configure);
    }

    public static LogAccessInfo(message: string): void {

        let logger = Log4js.getLogger("access");
        logger.info(message);
    }

    public static LogAccessWarning(message: string): void {
        
        let logger = Log4js.getLogger("access");
        logger.warn(message);
    }

    public static LogAccessError(message: string): void {
        
        let logger = Log4js.getLogger("access");
        logger.error(message);
    }

        
    public static LogSystemInfo(message: string): void {
        
        let logger = Log4js.getLogger("system");
        logger.info(message);
    }
        
    public static LogSystemWarning(message: string): void {
        
        let logger = Log4js.getLogger("system");
        logger.warn(message);
    }

    public static LogSystemError(message: string): void {
        
        let logger = Log4js.getLogger("system");
        logger.error(message);
    }


    public static LogError(message: string): void {
        
        let logger = Log4js.getLogger("error");
        logger.error(message);
    }

    /**
     * getExpressLogger
     * ExpressjsのロガーにLog4jsを設定する。
     */
    public static getExpressLogger(): Handler{
        return Log4js.connectLogger(Log4js.getLogger("access"),{
            level: "INFO"
        });
    }
}

/**
 * ユーティリティ
 */
export class Utils {

    /**
     * configよりトップレベルオブジェクトを取得する。
     * @param T 取得するオブジェクト構造
     * @param key キーとなる要素
     */
    public static GetConfig<T>(key: string): T {

        let configure = Config.util.loadFileConfigs(Path.join(process.cwd(),"config"));

        let obj: T = <T>configure[key];
        return obj;
    }


    /**
     * IsAvailableValue<T>
     * 指定した値が利用可能であるか→nullまやはundefinedではないかを確認する。
     * @param {T} validateTarget: バリデート対象の変数
     */
    public static  IsAvailableValue<T>(validateTarget: T) : Boolean {

        if (validateTarget == null || validateTarget == undefined) {
            return false;
        }

        return true;
    }

}

/**
 * 認証
 */
export class Authentication {

    /**
     * Saltの文字列長
     */
    public static get SALT_LENGHT(): number { return 10;}

    /**
     * 生成Saltに含める文字列
     */
    public static get SALT_CHARSET(): string { return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-=^~|[{]}@:*";}
    
    /**
     * generateSalt
     * パスワード情報のシードとなるSALTを生成する。
     */
    public static GenerateSalt(): string {

        let enctypted: string = "";

        for (var i = 0; i < Authentication.SALT_LENGHT; i++) {

            enctypted += Authentication.SALT_CHARSET.split("")[Math.floor(Math.random() * Authentication.SALT_CHARSET.length)];
            
        }

        return enctypted;
    }


    /**
     * パスワード認証を行う
     * @param requestPw リクエストユーザのパスワード
     * @param requestSalt リクエストユーザのSALT
     * @param dbPw DBより取得したパスワード
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
     * @param seed 元となる文字列
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
     * @param auth ユーザ権限
     */
    public static IsHigherAuth(auth: UserAccess) : boolean{
        return auth >= UserAccess.HIGH;        
    }

    /**
     * 指定された権限が管理者権限であるかどうか判定する。
     * @param auth ユーザ権限
     */
    public static IsAdmin(auth: UserAccess) : boolean{
        return auth == UserAccess.ADMINISTRATOR;        
    }

    /**
     * ハッシュ化を行う。SALTのハッシュ化など
     * @param hashalgo ハッシュ化アルゴリズム
     * @param seed 入力となる文字列
     */
    private static Hasharize(hashalgo: string, seed: string): string {
        let hash = Crypto.createHash(hashalgo);
        hash.update(seed);
        return hash.digest("hex");
    }

    /**
     * 暗号化を行う。パスワードの暗号化など
     * @param cryptoAlgo 暗号化アルゴリズム
     * @param salt SALT。Authentication::hasharizeでハッシュ化すること。
     * @param seed 入力となる文字列
     */
    private static Cryptize(cryptoAlgo: string, salt: string, seed: string): string {

        let chiper = Crypto.createCipher(cryptoAlgo,salt);
        chiper.update(seed,"utf8","hex");

        return chiper.final("hex");
    }

}
