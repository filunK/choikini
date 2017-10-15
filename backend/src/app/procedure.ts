/**
 * procedure.ts
 * ロジック本体
 */
import * as D from "./datamodel";
import * as E from "./errors";
import {MongoDao} from "./dao";


 /**
  * 手続きのテンプレート
  * @param T 入力とするクラス
  * @param Y 出力とするクラス
  */
export interface IProcedure<T,Y> {
    Exec(input: T): Promise<Y>;
}

/**
 * ログイン処理
 */
export class LoginProcedure implements IProcedure<D.User, D.Hal<D.LoginJSON>> {

    public Exec(input: D.User): Promise<D.Hal<D.LoginJSON>> {
        return new Promise<D.Hal<D.LoginJSON>>((resolve, reject) => {
            let hal = new D.Hal<D.LoginJSON>();
            
            // 入力バリデート
            if (input.Name === "" || input.Name === null || input.Password === "" || input.Password === null) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = "入力値不正:: ユーザ名,パスワード";
    
                resolve(hal);
            } else {
                let db = new MongoDao();

//                input = db.Login(input);
                db.Login(input)
                .then((user: D.User) => {
                    // ログイン成功後の処理

                    // HAL格納 - 成功情報
                    hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
        
                    let res = new D.LoginJSON();
                    res.Token = input.Token;
                    hal.Embedded.Response = res;
                                
                    resolve(hal);

                }).catch((error: Error) => {
                    // ログイン失敗時
                    hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                    hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;
                    
                    resolve(hal);
                    
                });
                
            }
            
        });
    }
}

/**
 * 単一ユーザのチョイ気にを取得する処理
 */
export class GetChoikiniProcedure implements IProcedure<D.User, D.Hal<D.ChoikiniJSON>> {

    public Exec(input: D.User): Promise<D.Hal<D.ChoikiniJSON>> {
        return new Promise<D.Hal<D.ChoikiniJSON>>((resolve,reject) => {
            let hal = new D.Hal<D.ChoikiniJSON>();
            
            // 入力バリデート
            if (input.Name === "" || input.Name === null || input.Token === "" || input.Token === null) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = "入力値不正:: ユーザ名,トークン";
    
                resolve(hal);
            } else {
                let db = new MongoDao();

                db.SelectUser(input)
                .then((user: D.User) => {

                    // ちょい気に取得処理
                    db.SelectChoikini(user)
                    .then((user: D.User) => {

                        // HAL格納 - 成功情報
                        hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
                        
                        let res = new D.ChoikiniJSON();
                        res.User = user.Name;
                        res.ChoikiniList = user.Choikinis.Choikinis;

                        hal.Embedded.Response = res;
                        
                        resolve(hal);

                    }).catch((error: Error) => {

                        // ちょい気に取得失敗時
                        hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                        hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;

                        resolve(hal);
                    });

                }).catch((error: Error) => {
                    // ユーザ取得失敗時
                    hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                    hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;

                    resolve(hal);
                });

            }
            
        });
    }

}

/**
 * チョイ気にを登録する処理
 */
export class RegistChoikiniProcedure implements IProcedure<D.ChikiniRegistInfo, D.Hal<D.UpsertResultJSON>> {

    public Exec(input: D.ChikiniRegistInfo): Promise<D.Hal<D.UpsertResultJSON>> {
        return new Promise<D.Hal<D.UpsertResultJSON>>((resolve,reject) => {
            let hal = new D.Hal<D.UpsertResultJSON>();
            
            // 入力バリデート
            if (input.User.Name === "" || input.User.Name === null || input.User.Token === "" || input.User.Token === null) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = "入力値不正:: ユーザ名,トークン";
    
                resolve(hal);
            } else if (input.Entry.Entry === "" || input.Entry.Entry === null) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = "登録するちょい気にがありません";
    
                resolve(hal);
            } else {
                let db = new MongoDao();

                db.SelectUser(input.User)
                .then((user : D.User) => {
                    
                    db.RegistChoikini(user,input.Entry)
                    .then((usr: D.User) => {

                        // HAL格納 - 成功情報
                        hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;

                        let res = new D.UpsertResultJSON();
                        res.IsProcessed = true;
                        hal.Embedded.Response = res;

                        resolve(hal);
                    }).catch((error: Error) => {

                        // 登録失敗(choikinilist)時
                        hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                        hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;

                        resolve(hal);
                    });

                }).catch((error: Error) => {

                    // 対象ユーザ取得失敗時
                    hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                    hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;

                    resolve(hal);
                });
            }

        });
    }
}