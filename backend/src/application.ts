import * as Express from "express";
import * as Http from "http";
import * as Cluster from "cluster";
import { cpus } from "os";

import * as Routing from "./routing";


/**
 * choikini_bkのエントリポイント
 */
class Application {

    /**
     * run
     * choikini_bk開始メソッド
     */
    public run(): void {
        
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

        this.configure(app);
        this.route(app);

        Http.createServer(app).listen(
            app.get('port'),
            function() {
                console.log('Express server listening on port ' + app.get('port'));
            }
            );

    }

    /**
     * 指定したExpressjsのApplicationインターフェースの設定を行う。
     * @param app Express.Applicationインターフェースの実装
     */
    private configure(app:Express.Application):void {

        app.set('port', process.env.PORT || 30000);

    }

    /**
     * アプリケーションのルーティングを行う。
     * @param app Express.Applicationインターフェースの実装
     */
    private route(app: Express.Application):void {

        // トリアエズナマ
        new Routing.IndexAction(app).registRoute();
        new Routing.OtameshiAction(app).registRoute();
        
    }
}



// Application エントリ

let choikini = new Application();

choikini.run();

