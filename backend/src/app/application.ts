import * as Express from "express";
import * as Http from "http";
import * as Cluster from "cluster";
import * as BodyParser from "body-parser";
import { cpus } from "os";

import {IAppConfig} from "./IConfig"
import {Logger,Utils} from "./commons";
import {ApplicationError} from "./errors"
import * as Routing from "./routing";


/**
 * choikini WebAPIのエントリポイント
 * 
 * @class Application
 */
class Application {


    /**
     * choikini WebAPI を開始する
     * 
     * @method Run
     * @memberOf Application
     */
    public Run(): void {
        
        let app = Express();

        this.Configure(app);
        this.Route(app);
        this.HandleError(app);

        app.listen(app.get("port"),() => {
                Logger.LogAccessInfo('Express server listening on port ' + app.get('port'));
            });
    }

    
    /**
     * choikini WebAPI の設定を構成する。
     * 
     * @method Configure
     * @private
     * @param {Express.Application} app Expressjsのインスタンス
     * 
     * @memberOf Application
     */
    private Configure(app:Express.Application):void {
        let appConfig = Utils.GetConfig<IAppConfig>("application");

        // ポートの設定
        app.set('port', appConfig.serverPort);

        // ロガーの変更
        Logger.initialize();
        app.use(Logger.getExpressLogger());

        // body-parserの使用
        app.use(BodyParser.urlencoded({
            extended: true
        }));
        app.use(BodyParser.json());
    }

    /**
     * choikini WebAPI のルーティングを行う。
     * 
     * @private
     * @param {Express.Application} app Expressjsのインスタンス
     * @memberOf Application
     */
    private Route(app: Express.Application):void {

        new Routing.IndexAction(app).RegistRoute();
        new Routing.UserAction(app).RegistRoute();
        new Routing.ChoikiniAction(app).RegistRoute();
        
    }

    /**
     * HandleError
     * @param app Express.Applicationインターフェースの実装
     */

     /**
      * 全体でハンドルされないエラーを処理する。 
      *
      * @method HandleError
      * @param {Express.Application} app Expressjsのインスタンス
      * @memberOf Application
      */
    public HandleError(app: Express.Application) {

        // 404
        app.use(function(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
            let err = new ApplicationError("Not Found:" + req.originalUrl)
            res.status(404);
            next(err);
        });


        // other errors
        app.use(function(err: Error, req: Express.Request, res:Express.Response, next:Express.NextFunction){
                res.status(500);
                next(err)
        });
        
    }
}

// アプリケーションを開始する。

/**
 * アプリケーションインスタンス
 */
let choikini = new Application();

choikini.Run();

