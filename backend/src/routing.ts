/**
 * routing.ts
 * URIとロジックをひも付け、制御する。
 */

import {Application, Request, Response} from "express";

/**
 * IRoutable
 * ルーティングを制御するクラスが実装すべきメソッドを規定します。
 */
export interface IRoutable {
    /**
     * registRoute
     * ルーティングをExpress.Applicationに登録します。
     */
    registRoute(): void;
}

/**
 * RouterBase
 * ルーティング制御の基底クラス。
 */
export abstract class RouterBase implements IRoutable {

    private __app:Application;
    protected abstract get Path(): string;

    /**
     * constructor
     * コンストラクタ
     */
        constructor(app: Application) {
        this.__app = app;
    }
    
    registRoute() {

        if (null != this.Path) {
            this.__app.get(this.Path,this.get);
            this.__app.post(this.Path,this.post);
            this.__app.put(this.Path,this.put);
            this.__app.delete(this.Path,this.delete);
    
        } else {
            // TODO: エラーログを出す
        }
        
    }

    protected abstract get(req: Request, res: Response): void;
    protected abstract post(req: Request, res: Response): void;
    protected abstract put(req: Request, res: Response): void;
    protected abstract delete(req: Request, res: Response): void;
}

/**
 * IndexAction
 */
export class IndexAction extends RouterBase {

    protected get Path(): string {
        return "/";
    }

    protected get(req:Request, res: Response): void {
        res.send('Hello choikini World!');
        console.log("index accessed......");
    }
    
    protected post(req: Request, res: Response): void {
        // DO NOTHING
    }

    protected put(req: Request, res: Response): void {
        // DO NOTHING
    }

    protected delete(req: Request, res: Response): void {
        // DO NOTHING
    }

}

/**
 * IndexAction
 */
export class OtameshiAction extends RouterBase {
    
    protected get Path(): string {
        return "/otameshi";
    }

    protected get(req:Request, res: Response): void {
        res.send('OTAMESHI---Hello choikini World!---OTAMESHI');
        console.log("otameshi accessed......");
    }
    
    protected post(req: Request, res: Response): void {
        // DO NOTHING
    }

    protected put(req: Request, res: Response): void {
        // DO NOTHING
    }

    protected delete(req: Request, res: Response): void {
        // DO NOTHING
    }
}
