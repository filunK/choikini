/**
 * procedure.ts
 * ロジック本体
 */
import * as D from "./datamodel"


 /**
  * 手続きのテンプレート
  * @param T 入力とするクラス
  * @param Y 出力とするクラス
  */
export interface procedure<T,Y> {
    exec(input: T): Y;
}

/**
 * ログイン処理
 */
export class loginProcedure implements procedure<D.User, D.Hal<D.LoginJSON>> {

    /**
     * exec
     */
    public exec(input: D.User): D.Hal<D.LoginJSON> {
        
        return new D.Hal();
    }
}