"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Express = require("express");
var Http = require("http");
/**
 * choikini_bkのエントリポイント
 */
var Application = (function () {
    function Application() {
    }
    /**
     * run
     * choikini_bk開始メソッド
     */
    Application.prototype.run = function () {
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
        var app = Express();
        this.configure(app);
        this.route(app);
        Http.createServer(app).listen(app.get('port'), function () {
            console.log('Express server listening on port ' + app.get('port'));
        });
    };
    /**
     * 指定したExpressjsのApplicationインターフェースの設定を行う。
     * @param app Express.Applicationインターフェースの実装
     */
    Application.prototype.configure = function (app) {
        app.set('port', process.env.PORT || 30000);
    };
    /**
     * アプリケーションのルーティングを行う。
     * @param app Express.Applicationインターフェースの実装
     */
    Application.prototype.route = function (app) {
        // GETのルーティング
        // トリアエズナマ
        app.get('/', function (request, response) {
            response.send('Hello choikini World!');
        });
        // POSTのルーティング
        // 別モジュールでのルーティング
    };
    return Application;
}());
// Application エントリ
var choikini = new Application();
choikini.run();
//# sourceMappingURL=application.js.map