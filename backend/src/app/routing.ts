import {Application, Request, Response, Router,RouterOptions} from "express";

import {RoutingError} from "./errors";
import { Logger,Utils } from "./commons";

import * as D from "./datamodel"
import * as P from "./procedure"


/**
 * routingにて使用する定数
 * 
 * @class CONSTS
 */
class CONSTS {
    /**
     * headerキー：p_choikini_token
     * トークンが保存されるキー
     * 
     * @static
     * @type {string}
     * @memberOf CONSTS
     */
    public static P_CHOIKINI_TOKEN: string = "p-choikini-token";

    /**
     * headerキー：p_choikini_user
     * 処理を要求するユーザ
     * 
     * @static
     * @type {string}
     * @memberOf CONSTS
     */
    public static P_CHOIKINI_USER: string = "p-choikini-user";
}


/**
 * ルーティングを制御するためのインターフェース
 * 
 * @export
 * @interface IRoutable
 */
export interface IRoutable {

    /**
     * ルーティングを登録する。
     * 
     * 
     * @memberOf IRoutable
     */
    RegistRoute(): void;
}

/**
 * ルーティング制御の基底クラス。
 * 
 * @export
 * @abstract
 * @class RouterBase
 * @implements {IRoutable}
 */
export abstract class RouterBase implements IRoutable {

    private __app:Application;

    /**
     * ルーティングのルートリソース
     * 
     * @readonly
     * @protected
     * @abstract
     * @type {string}
     * @memberOf RouterBase
     */
    protected abstract get Path(): string;

    /**
     * Creates an instance of RouterBase.
     * @param {Application} app Expressjsのインスタンス
     * 
     * @memberOf RouterBase
     */
    constructor(app: Application) {
        this.__app = app;
    }

    /**
     * Routerオブジェクトの設定を行います。
     * 
     * @protected
     * @abstract
     * @param {Router} router 
     * @returns {Router} 
     * 
     * @memberOf RouterBase
     */
    protected abstract ConfigureRouter(router: Router): Router;
    
    /**
     * ルーティングを登録する。
     * 
     * 
     * @memberOf RouterBase
     */
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
 * リソース「/」のアクションを規定
 * 
 * @export
 * @class IndexAction
 * @extends {RouterBase}
 */
export class IndexAction extends RouterBase {

    /**
     * ルートリソースパス
     * 
     * @readonly
     * @protected
     * @type {string}
     * @memberOf IndexAction
     */
    protected get Path(): string {
        return "/";
    }

    /**
     * ルーティングを設定する
     * 
     * @protected
     * @param {Router} router 
     * @returns {Router} 
     * 
     * @memberOf IndexAction
     */
    protected ConfigureRouter(router: Router): Router {
        
        router.get("/", this.get);

        return router;
    }

    /**
     * GETに対する処理
     * 
     * @private
     * @param {Request} req 
     * @param {Response} res 
     * 
     * @memberOf IndexAction
     */
    private get(req:Request, res: Response): void {
        res.send('Hello choikini World!');
        Logger.LogSystemInfo("index accessed......");
    }

}

/**
 * 
 */
/**
 * リソース「/user」へのアクション
 * 
 * リクエストオブジェクト: JSON
 * {
 *  name: string => ユーザ名,
 *  password: string => パスワード
 * }
 * 
 * 
 * @export
 * @class UserAction
 * @extends {RouterBase}
 */
export class UserAction extends RouterBase {
    
    /**
     * ルートリソース
     * 
     * @readonly
     * @protected
     * @type {string}
     * @memberOf UserAction
     */
    protected get Path() : string {
        return "/user";
    }

    /**
     * ルーティングを設定する。
     * 
     * @protected
     * @param {Router} router 
     * @returns 
     * 
     * @memberOf UserAction
     */
    protected ConfigureRouter(router: Router) {

        router.put("/", this.put);

        return router;
    }

    /**
     * PUTに対する処理
     * 
     * @protected
     * @param {Request} req 
     * @param {Response} res 
     * @returns {Promise<void>} 
     * 
     * @memberOf UserAction
     */
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
 * リソース「/choikini」に対するアクション
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
 * 
 * @export
 * @class ChoikiniAction
 * @extends {RouterBase}
 */
export class ChoikiniAction extends RouterBase {

    /**
     * ルートリソース
     * 
     * @readonly
     * @protected
     * @type {string}
     * @memberOf ChoikiniAction
     */
    protected get Path(): string {
        return "/choikini";
    }

    /**
     * ルーティングを設定する。
     * 
     * @protected
     * @param {Router} router 
     * @returns 
     * 
     * @memberOf ChoikiniAction
     */
    protected ConfigureRouter(router: Router) {

        router.get("/", this.GetAllChoikini);
        router.get("/:user", this.GetChoikini);

        router.post("/:user",this.RegistChoikini);

        return router;
    }

    /**
     * GETの処理：ユーザのちょい気にを取得する。
     * 
     * @protected
     * @param {Request} req リクエスト
     * @param {Response} res レスポンス
     * @returns {Promise<void>} 
     * 
     * @memberOf ChoikiniAction
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
     * GETの処理：全ユーザのちょい気にを取得する。
     * 
     * @protected
     * @param {Request} req リクエスト
     * @param {Response} res レスポンス
     * @returns {Promise<void>} 
     * 
     * @memberOf ChoikiniAction
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
     * POSTの処理：ちょい気にを登録する。
     * 
     * @protected
     * @param {Request} req リクエスト
     * @param {Response} res レスポンス
     * @returns {Promise<void>} 
     * 
     * @memberOf ChoikiniAction
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