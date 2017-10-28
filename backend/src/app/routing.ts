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
    public static P_CHOIKINI_USER: string = "p-choikini-user";
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

    protected async put(req:Request, res: Response): Promise<void> {
        let requestData: {name: string, password: string} = req.body;

        // 取得値のバリデート
        if (!Utils.IsAvailableValue<string>(requestData.name)) {
            requestData.name = "";
        }
        if (!Utils.IsAvailableValue<string>(requestData.password)) {
            requestData.password = "";
        }

        // データ整形
        let user = new D.User();
        user.Name = requestData.name;
        user.Password = requestData.password;

        let link = {
            self : {
                href : "/user"
            }
        };

        // 処理本体
        let login = new P.LoginProcedure();
        let hal = await login.Exec(user)

        hal.Links = link;
        res.json(hal);
    }
}

/**
 * Choikiniアクション
 * 
 * URI:/choikini
 * メソッド：GET
 * リクエストオブジェクト：PLAIN
 * リクエストヘッダ：
 * | key             | value                |
 * |----------------:|:---------------------|
 * |p-choikini-token | one-time token       |
 * |p-choikini-user  | Request user name    |
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

    /**
     * ユーザのちょい気にを取得する
     * @param req 
     * @param res 
     */
    protected async GetChoikini(req: Request, res: Response): Promise<void> {

        // パラメータ取得
        let username = req.params.user;
        let token = req.headers[CONSTS.P_CHOIKINI_TOKEN] as string;

        // 取得値のバリデート
        if (!Utils.IsAvailableValue<string>(username)) {
            username = "";
        }
        if (!Utils.IsAvailableValue<string>(token)) {
            token = "";
        }

        let user = new D.User();
        user.Name = username;
        user.Token = token;

        let link = {
            self : {
                href : "/choikini/" + username
            }
        };

        let getChoikini = new P.GetChoikiniProcedure();
        let hal = await getChoikini.Exec(user);

        hal.Links = link;
        res.json(hal);
    }

    /**
     * 全ユーザのチョイ気にを取得する
     * @param req 
     * @param res 
     */
    protected async GetAllChoikini(req: Request, res: Response): Promise<void> {

        // パラメータ取得
        let username = req.headers[CONSTS.P_CHOIKINI_USER] as string;
        let token = req.headers[CONSTS.P_CHOIKINI_TOKEN] as string;

        // 取得値のバリデート
        if (!Utils.IsAvailableValue<string>(username)) {
            username = "";
        }
        if (!Utils.IsAvailableValue<string>(token)) {
            token = "";
        }

        let user = new D.User();
        user.Name = username;
        user.Token = token;

        let link = {
            self : {
                href : "/choikini/"
            }
        };

        let getAll = new P.GetAllChoikiniProcedure();
        let hal = await getAll.Exec(user);

        hal.Links = link;
        res.json(hal);
    }

    /**
     * ちょい気にを登録する
     * @param req 
     * @param res 
     */
    protected async RegistChoikini(req: Request, res: Response): Promise<void> {
        // パラメータ取得
        let username = req.params.user;
        let token = req.headers[CONSTS.P_CHOIKINI_TOKEN] as string;
        let requestData: {choikini: string} = req.body;
        
        
        // 取得値のバリデート
        if (!Utils.IsAvailableValue<string>(username)) {
            username = "";
        }
        if (!Utils.IsAvailableValue<string>(token)) {
            token = "";
        }
        if (!Utils.IsAvailableValue<string>(requestData.choikini)) {
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

        let link = {
            self : {
                href : "/choikini/" + user.Name
            }
        };

        let register = new P.RegistChoikiniProcedure();
        let hal = await register.Exec(info);

        hal.Links = link;
        res.json(hal);
    }
}