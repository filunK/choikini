import {Handler} from "express";
import * as Path from "path";

import * as Config from "config";
import * as Log4js from "log4js";

import {User} from "./datamodel"

/**
 * ロガー
 */
export class Logger {

    public static initialize() {
        let configure = Config.util.loadFileConfigs(Path.join(__dirname,"config")).log4js;
        Log4js.configure(<Log4js.IConfig>configure);
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
            level: Log4js.levels.INFO
        });
    }
}

export namespace utils {

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
    public static get SALT_CHARSET(): string { return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/!?-=^~|[{]}@`:*";}
    
    /**
     * generateSalt
     * パスワード情報のシードとなるSALTを生成する。
     */
    public static generateSalt(): string {

        let enctypted: string = "";

        for (var i = 0; i < Authentication.SALT_LENGHT; i++) {

            enctypted += Authentication.SALT_CHARSET.split("")[Math.floor(Math.random() * Authentication.SALT_CHARSET.length)];
            
        }

        return enctypted;
    }

}
