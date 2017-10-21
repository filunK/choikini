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

    public async Exec(input: D.User): Promise<D.Hal<D.LoginJSON>> {
        let hal = new D.Hal<D.LoginJSON>();

        // 入力バリデート
        if (input.Name === "" || input.Name === null || input.Password === "" || input.Password === null) {
            // HAL格納 - 失敗情報
            hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
            hal.Embedded.StateDetail = "入力値不正:: ユーザ名,パスワード";

        } else {
            try {
                let db = new MongoDao();
                let user = await db.Login(input)

                // HAL格納 - 成功情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
                
                let res = new D.LoginJSON();
                res.Token = user.Token;
                hal.Embedded.Response = res;
            
            } catch (error) {
                // ログイン失敗時
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;
                
            }
        }
        
        return hal;
    }
}

/**
 * 単一ユーザのチョイ気にを取得する処理
 */
export class GetChoikiniProcedure implements IProcedure<D.User, D.Hal<D.ChoikiniJSON>> {

    public async Exec(input: D.User): Promise<D.Hal<D.ChoikiniJSON>> {
        let hal = new D.Hal<D.ChoikiniJSON>();

            // 入力バリデート
            if (input.Name === "" || input.Name === null || input.Token === "" || input.Token === null) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = "入力値不正:: ユーザ名,トークン";
    
            } else {

                try {
                    let db = new MongoDao();

                    let user = await db.SelectUser(input);
                    user = await db.SelectChoikini(user);

                    // HAL格納 - 成功情報
                    hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
                    
                    let res = new D.ChoikiniJSON();
                    res.User = user.Name;
                    res.ChoikiniList = user.Choikinis.Choikinis;

                    hal.Embedded.Response = res;
                    
                } catch (error) {

                    // 処理失敗時
                    hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                    hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;
                }
            }
        
        
        return hal;
    }

}

/**
 * チョイ気にを登録する処理
 */
export class RegistChoikiniProcedure implements IProcedure<D.ChikiniRegistInfo, D.Hal<D.UpsertResultJSON>> {

    public async Exec(input: D.ChikiniRegistInfo): Promise<D.Hal<D.UpsertResultJSON>> {
        let hal = new D.Hal<D.UpsertResultJSON>();

        // 入力バリデート
        if (input.User.Name === "" || input.User.Name === null || input.User.Token === "" || input.User.Token === null) {
            // HAL格納 - 失敗情報
            hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
            hal.Embedded.StateDetail = "入力値不正:: ユーザ名,トークン";

        } else if (input.Entry.Entry === "" || input.Entry.Entry === null) {
            // HAL格納 - 失敗情報
            hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
            hal.Embedded.StateDetail = "登録するちょい気にがありません";

        } else {

            try {
                let db = new MongoDao();

                let user = await db.SelectUser(input.User);
                await db.RegistChoikini(user,input.Entry);

                // HAL格納 - 成功情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
                
                let res = new D.UpsertResultJSON();
                res.IsProcessed = true;
                hal.Embedded.Response = res;
                
            } catch (error) {
                
                // 処理失敗時
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;
            }
        }

        return hal;
    }
}

/**
 * 全ユーザのチョイ気にを取得する処理
 */
export class GetAllChoikiniProcedure implements IProcedure<D.User, D.Hal<D.ChoikiniJSON[]>> {
    
    public Exec(input: D.User): Promise<D.Hal<D.ChoikiniJSON[]>> {
        return new Promise<D.Hal<D.ChoikiniJSON[]>>((resolve,reject) => {

            throw new Error("未実装");
        });
    }
}
            
    