import {Logger} from "./commons";

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