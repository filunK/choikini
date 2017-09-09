/*
* Dao
*/

import {User,ChoikiniList, ChoikiniEntity} from "./datamodel"
import {DaoError} from "./errors"

import * as Path from "path";
import * as Config from "config";
import * as Mongoose from "mongoose";

/**
 * Daoインターフェース
 */
export interface Dao {

    /**
     * 不完全なUserから完全なUserを取得する。
     * @param {User} user - 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @return {User} 完全なユーザオブジェクト。
     */
    selectUser(user:User): User;

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param {string} name - ユーザ名
     * @param {string} password - パスワード - この時点では平文
     * @return {string} ユーザトークン
     * @throws DaoError
     */
    login(name: string, password: string): string;

    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * @param {string} token - ユーザトークン
     * @return {boolean} ログオフ成否
     */
    logoff(token: string): boolean;

    /**
     * ちょい気にを登録する
     * @param {User} user - 登録対象ユーザ
     * @param {ChoikiniEntity} - 登録するエントリ
     * @throws DaoError
     */
    registChoikini(user: User, choikini: ChoikiniEntity): void;
}

/**
 * MongoDBへのDAO
 */
export class MongoDao implements Dao {

    private static _instance: MongoDao;

    /**
     * MongoDaoのインスタンスを取得
     * @return {MongoDao} - MongoDaoのシングルトンインスタンス
     * @throws DaoError
     */
    public static getInstance():MongoDao {

        if (MongoDao._instance === null) {

            try {
                MongoDao._instance = new MongoDao();
            } catch (error) {
                throw error;
            }
        }
        return MongoDao._instance;
    }

    /**
     * 不完全なUserから完全なUserを取得する。
     * @param {User} user - 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @return {User} 完全なユーザオブジェクト。
     */
    selectUser(user:User): User {

        return user;
    }
    
    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param {string} name - ユーザ名
     * @param {string} password - パスワード - この時点では平文
     * @return {string} ユーザトークン
     * @throws DaoError
     */
    login(name: string, password: string): string {

        return "";
    }

    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * @param {string} token - ユーザトークン
     * @return {boolean} ログオフ成否
     */
    logoff(token: string): boolean {

        return true;
    }

    /**
     * ちょい気にを登録する
     * @param {User} user - 登録対象ユーザ
     * @param {ChoikiniEntity} - 登録するエントリ
     * @throws DaoError
     */
    registChoikini(user: User, choikini: ChoikiniEntity): void {

    }


    /**
     * @constructor
     * @throws DaoError
     */
    private constructor() {

        let connectionInfo = <{server: string, port: string, database: string}>Config.util.loadFileConfigs(Path.join(__dirname,"config")).mongoose;
        
        let connectionString = "mongodb://" + connectionInfo.database + ":" + connectionInfo.port + "/" + connectionInfo.database;

        let mongo = Mongoose.connect(connectionString,{},function(err) {

            let localmessage = "connect fail::" + connectionString;

            throw new DaoError(localmessage +"##" + err.message + "##" + err.stack);
        });

    }

}

