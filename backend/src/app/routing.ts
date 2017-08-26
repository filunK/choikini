/**
 * routing.ts
 * URIとロジックをひも付け、制御する。
 */

import {Application, Request, Response, Router,RouterOptions} from "express";

import {RoutingError} from "./errors";
import { Logger } from "./commons";

/**
 * IRoutable
 * ルーティングを制御するクラスが実装すべきメソッドを規定します。
 */
export interface IRoutable {

    /**
     * registRoute
     * ルーティングをExpress.Applicationに登録します。
     */
    RegistRoute(): void;
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

    /**
     * ConfigureRouter
     * Routerオブジェクトの設定を行います。
     */
    protected abstract ConfigureRouter(router: Router): Router;
    
    public RegistRoute(): void {
        let pathlength = this.Path.length

        // Pathプロパティが設定されていなければエラーとする。
        if (null != this.Path　&& 0 < pathlength) {
            
            let router = Router(
                {
                    caseSensitive:true
                }
            );

            router = this.ConfigureRouter(router);

            this.__app.use(this.Path,router);


        } else {
            throw new RoutingError("The Property Path does not identified")
        }
        
    }
}

/**
 * IndexAction
 */
export class IndexAction extends RouterBase {

    protected get Path(): string {
        return "/";
    }

    protected ConfigureRouter(router: Router): Router {
        
        router.get("/", this.get);

        return router;
    }

    private get(req:Request, res: Response): void {
        res.send('Hello choikini World!');
        Logger.LogSystemInfo("index accessed......");
    }

}

/**
 * OtameshiAction
 */
export class OtameshiAction extends RouterBase {
    
    protected get Path(): string {
        return "/otameshi";
    }

    protected ConfigureRouter(router: Router): Router {

        router.get("/", this.get);
        return router;
    }

    protected get(req:Request, res: Response): void {
        res.send('OTAMESHI---Hello choikini World!---OTAMESHI');
        Logger.LogSystemInfo("otameshi accessed......");
    }
    
}

