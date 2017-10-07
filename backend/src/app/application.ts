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
 * choikini_bkのエントリポイント
 */
class Application {

    /**
     * run
     * choikini_bk開始メソッド
     */
    public Run(): void {
        
        // Clusterモジュールにてクラスタリング
/*
        if (Cluster.isMaster) {

            for (var index = 0; index < cpus.length; index++) {
                Cluster.fork();
            }

        } else {

            let app = Express();

            this.configure(app);
            this.route(app);

            Http.createServer(app).listen(
                app.get('port'),
                function() {
                    console.log('Express server listening on port ' + app.get('port'));
                }

            );
        }
*/
        let app = Express();

        this.Configure(app);
        this.Route(app);
        this.HandleError(app);

        Http.createServer(app).listen(
            app.get('port'),
            function() {
                Logger.LogAccessInfo('Express server listening on port ' + app.get('port'));
            }
            );

    }

    /**
     * 指定したExpressjsのApplicationインターフェースの設定を行う。
     * @param app Express.Applicationインターフェースの実装
     */
    private Configure(app:Express.Application):void {
        let appConfig = Utils.GetConfig<IAppConfig>("application");

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
     * アプリケーションのルーティングを行う。
     * @param app Express.Applicationインターフェースの実装
     */
    private Route(app: Express.Application):void {

        // トリアエズナマ
        new Routing.IndexAction(app).RegistRoute();
        new Routing.OtameshiAction(app).RegistRoute();
        new Routing.UserAction(app).RegistRoute();
        new Routing.ChoikiniAction(app).RegistRoute();
        
    }

    /**
     * HandleError
     * @param app Express.Applicationインターフェースの実装
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
            throw new ApplicationError(err.message);
            
        });
        
    }
}



// Application エントリ

let choikini = new Application();

choikini.Run();

