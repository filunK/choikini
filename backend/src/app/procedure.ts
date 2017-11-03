/**
 * procedure.ts
 * ロジック本体
 */
import * as D from "./datamodel";
import * as E from "./errors";
import {MongoDao} from "./dao";
import {Authentication, Logger} from "./commons";


 /**
  * 手続きのインターフェース
  * @param T 入力とするクラス
  * @param Y 出力とするクラス
  */
export interface IProcedure<T,Y> {
     Exec(input: T): Promise<Y>;
}

/**
 * 手続きの基礎クラス
  * @param T 入力とするクラス
  * @param Y 出力とするクラス
 */
export abstract class ProcedureBase<T,Y> implements IProcedure<T,Y> {
    abstract async Exec(input: T): Promise<Y>;

    /**
     * ログオフ処理を行う
     * @param user ログオフ対象ユーザ
     */
    protected async Logoff(user: D.User): Promise<boolean> {
        let result: boolean = false

        try {
            let db = new MongoDao();

            await db.Logoff(user);

            result = true;
            
        } catch (error) {
            Logger.LogSystemWarning("ログオフ失敗::" + user.Id);
            result = false;
        }

        return result;
    }
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
export class GetChoikiniProcedure extends ProcedureBase<D.User, D.Hal<D.ChoikiniJSON>> {

    public async Exec(input: D.User): Promise<D.Hal<D.ChoikiniJSON>> {
        let hal = new D.Hal<D.ChoikiniJSON>();

            // 入力バリデート
            if (input.Name === "" || input.Name === null || input.Token === "" || input.Token === null) {
                // HAL格納 - 失敗情報
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = "入力値不正:: ユーザ名,トークン";
    
            } else {
                let user : D.User | undefined | null;

                try {
                    let db = new MongoDao();

                    user = await db.SelectUser(input);
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
                } finally {

                    // どちらにせよログオフ処理
                    if (user instanceof D.User) {
                        await this.Logoff(user);
                    }
                }
            }
        
        
        return hal;
    }

}

/**
 * チョイ気にを登録する処理
 */
export class RegistChoikiniProcedure extends ProcedureBase<D.ChikiniRegistInfo, D.Hal<D.UpsertResultJSON>> {

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
            let user : D.User | undefined | null;
            
            try {
                let db = new MongoDao();

                user = await db.SelectUser(input.User);
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
            } finally {
    
                // どちらにせよログオフ処理
                if (user instanceof D.User) {
                    await this.Logoff(user);
                }
            }
        }

        return hal;
    }
}

/**
 * 全ユーザのチョイ気にを取得する処理
 */
export class GetAllChoikiniProcedure extends ProcedureBase<D.User, D.Hal<D.ChoikiniJSON[]>> {
    
    public async Exec(input: D.User): Promise<D.Hal<D.ChoikiniJSON[]>> {
        let hal = new D.Hal<D.ChoikiniJSON[]>();

        let user : D.User | undefined | null;
        
        try {
            let db = new MongoDao();
            
            // ユーザ判定
            user = await db.SelectUser(input);

            // 高権限である場合のみ処理続行
            if (Authentication.IsHigherAuth(user.Auth)) {

                let list = await db.SelectAll();

                // データ整形
                let fullList: D.ChoikiniJSON[] = [];
                list.forEach((value, index, array) => {

                    let entity = new D.ChoikiniJSON();
                    entity.User = value.Name;
                    entity.ChoikiniList = value.Choikinis.Choikinis;

                    fullList.push(entity);
                });

                hal.Embedded.State = D.HAL_EMBEDDED_STATE.OK;
                hal.Embedded.Response = fullList;

            } else {
                hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
                hal.Embedded.StateDetail = "当該ユーザには権限が不足しています。::" + user.Name;
            }
        } catch (error) {
            // 処理失敗時
            hal.Embedded.State = D.HAL_EMBEDDED_STATE.NG;
            hal.Embedded.StateDetail = error.name + "::" + error.message + "::" + error.stack;
        } finally {
            
            // どちらにせよログオフ処理
            if (user instanceof D.User) {
                await this.Logoff(user);
            }
        }
        

        return hal;
    }
}
            
    