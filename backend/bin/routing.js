"use strict";
/**
 * routing.ts
 * URIとロジックをひも付け、制御する。
 */
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
/**
 * RouterBase
 * ルーティング制御の基底クラス。
 */
var RouterBase = (function () {
    /**
     * constructor
     * コンストラクタ
     */
    function RouterBase(app) {
        this.__app = app;
    }
    RouterBase.prototype.registRoute = function () {
        if (null != this.Path) {
            this.__app.get(this.Path, this.get);
            this.__app.post(this.Path, this.post);
            this.__app.put(this.Path, this.put);
            this.__app.delete(this.Path, this.delete);
        }
        else {
            // TODO: エラーログを出す
        }
    };
    return RouterBase;
}());
exports.RouterBase = RouterBase;
/**
 * IndexAction
 */
var IndexAction = (function (_super) {
    __extends(IndexAction, _super);
    function IndexAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(IndexAction.prototype, "Path", {
        get: function () {
            return "/";
        },
        enumerable: true,
        configurable: true
    });
    IndexAction.prototype.get = function (req, res) {
        res.send('Hello choikini World!');
        console.log("index accessed......");
    };
    IndexAction.prototype.post = function (req, res) {
        // DO NOTHING
    };
    IndexAction.prototype.put = function (req, res) {
        // DO NOTHING
    };
    IndexAction.prototype.delete = function (req, res) {
        // DO NOTHING
    };
    return IndexAction;
}(RouterBase));
exports.IndexAction = IndexAction;
/**
 * IndexAction
 */
var OtameshiAction = (function (_super) {
    __extends(OtameshiAction, _super);
    function OtameshiAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(OtameshiAction.prototype, "Path", {
        get: function () {
            return "/otameshi";
        },
        enumerable: true,
        configurable: true
    });
    OtameshiAction.prototype.get = function (req, res) {
        res.send('OTAMESHI---Hello choikini World!---OTAMESHI');
        console.log("otameshi accessed......");
    };
    OtameshiAction.prototype.post = function (req, res) {
        // DO NOTHING
    };
    OtameshiAction.prototype.put = function (req, res) {
        // DO NOTHING
    };
    OtameshiAction.prototype.delete = function (req, res) {
        // DO NOTHING
    };
    return OtameshiAction;
}(RouterBase));
exports.OtameshiAction = OtameshiAction;
//# sourceMappingURL=routing.js.map