import {Logger} from "./commons";
import {User,ChoikiniList, ChoikiniEntity} from "./datamodel"

/**
 * アプリケーションエラー
 */
export class ApplicationError implements Error {
    
    private __message: string;

    get name(): string {
        return "AppricationError"
    }
    
    get message(): string {
        return this.__message;
    }

    constructor(message: string) {
        this.__message = message;
        Logger.LogError(this.toString());
    }

    public toString(): string {
        return this.name + "::" + this.message;
    }
}

/**
 * ルーティングエラー
 */
export class RoutingError implements Error {

    private __message: string;

    get name(): string {
        return "RoutingError"
    }
    
    get message(): string {
        return this.__message;
    }

    constructor(message: string) {
        this.__message = message;
        Logger.LogError(this.toString());
    }

    public toString(): string {
        return this.name + "::" + this.message;
    }
}


export class DaoError implements Error {

private __message: string;

    get name(): string {
        return "DaoError"
    }
    
    get message(): string {
        return this.__message;
    }
    
    /**
     * 
     * @constructor
     * @param message 
     * @param user 
     * @param entry 
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
    
    public toString(): string {
        return this.name + "::" + this.message;
    }
}