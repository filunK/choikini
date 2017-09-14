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
    exec(input: T): Y;
}

/**
 * ログイン処理
 */
export class LoginProcedure implements IProcedure<D.User, D.Hal<D.LoginJSON>> {

    /**
     * exec
     */
    public exec(input: D.User): D.Hal<D.LoginJSON> {
        let hal = new D.Hal<D.LoginJSON>();

        // 入力バリデート
        if (input.Name === "" || input.Name === null || input.Password === "" || input.Password === null) {
            // HAL格納 - 失敗情報
            hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
            hal.Embedded.StateDetail = "入力値不正:: name=<<" + input.Name + ">> password=<<" + input.Password + ">>";

        } else {

            let db = new MongoDao();
            try {
                
                // ログイン処理
                input = db.Login(input);
                //input = db.LoginNative(input);
    
                // HAL格納 - 成功情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
    
                let res = new D.LoginJSON();
                res.Token = input.Token;
                hal.Embedded.Response = res;
    
            } catch (error) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
    
                if (error instanceof Error) {
                    hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;
                }
                
            } finally {
                //db.Disconnect();
            }
        }

        
        return hal;
    }

        /**
     * exec
     */
    public async execAsync(input: D.User): Promise<Function> {

        let hal = new D.Hal<D.LoginJSON>();
        
        // 入力バリデート
        if (input.Name === "" || input.Name === null || input.Password === "" || input.Password === null) {
            // HAL格納 - 失敗情報
            hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
            hal.Embedded.StateDetail = "入力値不正:: name=<<" + input.Name + ">> password=<<" + input.Password + ">>";

        } else {

            let db = new MongoDao();
            try {
                
                // ログイン処理
                input = await db.LoginPromise(input);
    
                // HAL格納 - 成功情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
    
    
            } catch (error) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
    
                if (error instanceof Error) {
                    hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;
                }
                
            } finally {
                db.Disconnect();
            }
        }

        return new Promise<Function>(resolver => {

            if (hal.Embedded.State == D.HAL_EMBEDDED_STATE.OK) {
                let res = new D.LoginJSON();
                res.Token = input.Token;
                hal.Embedded.Response = res;
            }
        })
    }

}