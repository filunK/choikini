/**
 * routing.ts
 * URIとロジックをひも付け、制御する。
 */

import {Application, Request, Response, Router,RouterOptions} from "express";

import {RoutingError} from "./errors";
import { Logger,Utils } from "./commons";

import * as D from "./datamodel"
import * as P from "./procedure"

/**
 * 定数
 */
class CONSTS {
    public static P_CHOIKINI_TOKEN: string = "p-choikini-token";
}

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
 * Userアクション
 * 
 * リクエストオブジェクト: JSON
 * {
 *  name: string => ユーザ名,
 *  password: string => パスワード
 * }
 * 
 */
export class UserAction extends RouterBase {
    
    protected get Path() : string {
        return "/user";
    }

    protected ConfigureRouter(router: Router) {

        router.put("/", this.put);

        return router;
    }

    protected put(req:Request, res: Response): void {
        let requestData: {name: string, password: string} = req.body;

        // 取得値のバリデート
        if (!Utils.IsAvailableValue(requestData.name)) {
            requestData.name = "";
        }
        if (!Utils.IsAvailableValue(requestData.password)) {
            requestData.password = "";
        }

        // データ整形
        let user = new D.User();
        user.Name = requestData.name;
        user.Password = requestData.password;

        // 処理本体
        let login = new P.LoginProcedure();
        login.Exec(user)
            .then((hal: D.Hal<D.LoginJSON>) => {
                let link = {
                    self : {
                        href : "/user"
                    }
                };
                hal.Links = link;
                res.json(hal);
            }
        );
    }
}

/**
 * Choikiniアクション
 * 
 * URI:/choikini
 * メソッド：GET
 * リクエストオブジェクト：PLAIN
 * リクエストヘッダ：
 * | key             | value          |
 * |----------------:|:---------------|
 * |p-choikini-token | one-time token |
 * 
 * URIパラメータ：
 * | key  | value     |
 * |-----:|:----------|
 * |:user | user name |
 * 
 * URI:/choikini/:user
 * メソッド：GET
 * リクエストオブジェクト：PLAIN
 * リクエストヘッダ：
 * | key             | value          |
 * |----------------:|:---------------|
 * |p-choikini-token | one-time token |
 * 
 * URIパラメータ：
 * | key  | value     |
 * |-----:|:----------|
 * |:user | user name |
 * 
 * メソッド：POST
 * リクエストオブジェクト: JSON
 * リクエストヘッダ：
 * | key             | value          |
 * |----------------:|:---------------|
 * |p-choikini-token | one-time token |
 * 
 * URIパラメータ：
 * | key  | value     |
 * |-----:|:----------|
 * |:user | user name |
 * 
 * JSONデータ：
 * {
 *  choikini: string => ちょい気に本文
 * }
 * 
 */
export class ChoikiniAction extends RouterBase {

    protected get Path(): string {
        return "/choikini";
    }

    protected ConfigureRouter(router: Router) {

        router.get("/", this.GetAllChoikini);
        router.get("/:user", this.GetChoikini);

        router.post("/:user",this.RegistChoikini);

        return router;
    }

    protected GetChoikini(req: Request, res: Response): void {

        // パラメータ取得
        let username = req.params.user;
        let token = req.headers[CONSTS.P_CHOIKINI_TOKEN] as string;

        // 取得値のバリデート
        if (!Utils.IsAvailableValue(username)) {
            username = "";
        }
        if (!Utils.IsAvailableValue(token)) {
            token = "";
        }

        let user = new D.User();
        user.Name = username;
        user.Token = token;

        let getChoikini = new P.GetChoikiniProcedure();
        getChoikini.Exec(user)
        .then((hal: D.Hal<D.ChoikiniJSON>) => {
            let link = {
                self : {
                    href : "/choikini/" + username
                }
            };
            hal.Links = link;
            res.json(hal);
    });
    }

    protected GetAllChoikini(req: Request, res: Response): void {
        // TOD: 実装
        throw new Error("未実装");
    }

    protected RegistChoikini(req: Request, res: Response): void {
        // パラメータ取得
        let username = req.params.user;
        let token = req.headers[CONSTS.P_CHOIKINI_TOKEN] as string;
        let requestData: {choikini: string} = req.body;
        
        
        // 取得値のバリデート
        if (!Utils.IsAvailableValue(username)) {
            username = "";
        }
        if (!Utils.IsAvailableValue(token)) {
            token = "";
        }
        if (!Utils.IsAvailableValue(requestData.choikini)) {
            requestData.choikini = "";
        }

        // データ整形
        let entity = new D.ChoikiniEntity();
        entity.EntryDate = new Date();
        entity.Entry = requestData.choikini;

        let user = new D.User();
        user.Name = username;
        user.Token = token;

        let info = new D.ChikiniRegistInfo();
        info.User = user;
        info.Entry = entity;

        let register = new P.RegistChoikiniProcedure();
        register.Exec(info)
        .then((hal: D.Hal<D.UpsertResultJSON>) => {

            let link = {
                self : {
                    href : "/choikini/" + user.Name
                }
            };
            hal.Links = link;
            res.json(hal);

        });
    }
}