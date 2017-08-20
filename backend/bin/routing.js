"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var routing;
(function (routing) {
    var RouterBase = (function () {
        function RouterBase(app) {
            this.__app = app;
        }
        /**
         * registRoute
         */
        RouterBase.prototype.registRoute = function () {
            this.__app.get("/", this.get);
            this.__app.post("/", this.post);
            this.__app.put("/", this.put);
            this.__app.delete("/", this.delete);
        };
        return RouterBase;
    }());
    routing.RouterBase = RouterBase;
    var IndexAction = (function (_super) {
        __extends(IndexAction, _super);
        function IndexAction() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        IndexAction.prototype.get = function (req, res) {
            res.send('Hello choikini World!');
            console.log("index accessed......");
        };
        IndexAction.prototype.post = function (req, res) {
        };
        IndexAction.prototype.put = function (req, res) {
        };
        IndexAction.prototype.delete = function (req, res) {
        };
        return IndexAction;
    }(RouterBase));
    routing.IndexAction = IndexAction;
})(routing = exports.routing || (exports.routing = {}));
//# sourceMappingURL=routing.js.map