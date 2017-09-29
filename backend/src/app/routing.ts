/**
 * routing.ts
 * URIとロジックをひも付け、制御する。
 */

import {Application, Request, Response, Router,RouterOptions} from "express";

import {RoutingError} from "./errors";
import { Logger } from "./commons";

import * as D from "./datamodel"
import * as P from "./procedure"

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


/**
 * ログインアクション
 * 
 * リクエストオブジェクト: JSON
 * {
 *  name: string => ユーザ名,
 *  password: string => パスワード
 * }
 * 
 */
export class LoginAction extends RouterBase {
    
    protected get Path() : string {
        return "/user";
    }

    protected ConfigureRouter(router: Router) {

        router.put("/", this.put);

        return router;
    }

    protected put(req:Request, res: Response): void {
        let postData: {name: string, password: string} = req.body;

        // データ整形
        let user = new D.User();
        user.Name = postData.name;
        user.Password = postData.password;

        // 処理本体
        /*
        let login = new P.LoginProcedure();
        let hal = login.exec(user);

        // HAL _linkの整形
        let link = {
            "self" : {
                "href" : "/user/"
            }
        }
        hal.Links = link;
        res.json(hal);
        */

        let login = new P.LoginProcedure();
        login.exec(user)
            .then((hal: D.Hal<D.LoginJSON>) => {
                let link = {
                    "self" : {
                        "href" : "/user/"
                    }
                }
                hal.Links = link;
                res.json(hal);
            }
        );
    }
}