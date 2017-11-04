import {Logger} from "./commons";
import {User,ChoikiniList, ChoikiniEntity} from "./datamodel"

/**
 * アプリケーションエラー
 * 
 * @export
 * @class ApplicationError
 * @implements {Error}
 */
export class ApplicationError implements Error {
    
    private __message: string;

    /**
     * エラー名
     * 
     * @readonly
     * @type {string}
     * @memberOf ApplicationError
     */
    get name(): string {
        return "AppricationError"
    }
    
    /**
     * エラーメッセージ
     * 
     * @readonly
     * @type {string}
     * @memberOf ApplicationError
     */
    get message(): string {
        return this.__message;
    }

    /**
     * Creates an instance of ApplicationError.
     * @param {string} message エラーメッセージ
     * 
     * @memberOf ApplicationError
     */
    constructor(message: string) {
        this.__message = message;
        Logger.LogError(this.toString());
    }

    /**
     * エラーを文字列として生成し直す。
     * 
     * @returns {string} 
     * 
     * @memberOf ApplicationError
     */
    public toString(): string {
        return this.name + "::" + this.message;
    }
}

/**
 * ルーティングエラー
 * 
 * @export
 * @class RoutingError
 * @implements {Error}
 */
export class RoutingError implements Error {

    private __message: string;

    /**
     * エラー名
     * 
     * @readonly
     * @type {string}
     * @memberOf RoutingError
     */
    get name(): string {
        return "RoutingError"
    }
    
    /**
     * エラーメッセージ
     * 
     * @readonly
     * @type {string}
     * @memberOf RoutingError
     */
    get message(): string {
        return this.__message;
    }

    /**
     * Creates an instance of RoutingError.
     * @param {string} message エラーメッセージ
     * 
     * @memberOf RoutingError
     */
    constructor(message: string) {
        this.__message = message;
        Logger.LogError(this.toString());
    }

    /**
     * エラーを文字列として生成し直す。
     * 
     * @returns {string} 
     * 
     * @memberOf RoutingError
     */
    public toString(): string {
        return this.name + "::" + this.message;
    }
}

/**
 * Dao上でのエラー
 * 
 * @export
 * @class DaoError
 * @implements {Error}
 */
export class DaoError implements Error {

private __message: string;

    /**
     * エラー名
     * 
     * @readonly
     * @type {string}
     * @memberOf DaoError
     */
    get name(): string {
        return "DaoError"
    }
    
    /**
     * エラーメッセージ
     * 
     * @readonly
     * @type {string}
     * @memberOf DaoError
     */
    get message(): string {
        return this.__message;
    }
    
    /**
     * Creates an instance of DaoError.
     * @param {string} message エラーメッセージ
     * @param {User} [user] 該当するユーザ
     * @param {ChoikiniEntity} [entry] 該当するメッセージ 
     * 
     * @memberOf DaoError
     */
    constructor(message: string, user?: User,entry?: ChoikiniEntity){
        
        if (user != null) {
            message += "##[USERINFO]::ID::" + user.Id;
        }

        if (entry != null) {
            message += "##[ENTRYINFO]::Date::" + entry.EntryDate.toDateString();
        }

        this.__message = message;
        Logger.LogError(this.toString());
    }
    
    /**
     * エラーを文字列として生成し直す。
     * 
     * @returns {string} 
     * 
     * @memberOf DaoError
     */
    public toString(): string {
        return this.name + "::" + this.message;
    }
}