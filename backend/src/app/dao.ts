/*
* Dao
*/

import { User, ChoikiniList, ChoikiniEntity } from "./datamodel"
import { DaoError } from "./errors"

import * as Path from "path";
import * as Config from "config";
import * as Mongoose from "mongoose";

import * as Ctypto from "crypto";

/**
 * Daoインターフェース
 */
export interface Dao {

    /**
     * 不完全なUserから完全なUserを取得する。
     * @param {User} user - 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @return {User} 完全なユーザオブジェクト。
     */
    selectUser(user: User): User;

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param {User} user - ユーザ名とパスワードが設定されたUserオブジェクト
     * @return {User} 対応するユーザ
     * @throws DaoError
     */
    login(user: User): User;

    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * @param {User} user - ユーザトークンを設定したUserオブジェクト
     * @return {boolean} ログオフ成否
     */
    logoff(user: User): boolean;

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
    public static getInstance(): MongoDao {

        if (MongoDao._instance === null) {

            try {
                MongoDao._instance = new MongoDao();
            } catch (error) {
                throw error;
            }
        }
        return MongoDao._instance;
    }

    private _connection: Mongoose.MongooseThenable;
    private get Connection(): Mongoose.MongooseThenable { return this._connection }
    private set Connection(connection: Mongoose.MongooseThenable) { this._connection = connection }

    /**
     * Userコレクションのスキーマ
     */
    private get UserSchema(): Mongoose.Schema {

        return new Mongoose.Schema(
            {
                Name: Mongoose.SchemaTypes.String,
                Password: {
                    Salt: Mongoose.SchemaTypes.String,
                    Encrypted: Mongoose.SchemaTypes.String
                },
                Token: Mongoose.SchemaTypes.String,
                Auth: Mongoose.SchemaTypes.Number,
            }
        );
    }

    /**
     * ChoikiniListコレクションのスキーマ
     */
    private get ChoikiniListSchema(): Mongoose.Schema {
        return new Mongoose.Schema(
            {
                UserId: {Type: Mongoose.SchemaTypes.ObjectId,ref: "User"},
                Choikinis: [ 
                    new Mongoose.Schema(
                        {
                            EntryDate: Mongoose.SchemaTypes.Date,
                            Entry: Mongoose.SchemaTypes.String
                        },
                        {_id: false}
                    )
                ]
            }

        );
    }


    /**
     * 不完全なUserから完全なUserを取得する。
     * @param {User} user - 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @return {User} 完全なユーザオブジェクト。
     */
    selectUser(user: User): User {

        return user;
    }

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param {User} user - ユーザ名とパスワードを設定したUserオブジェクト
     * @return {User} 対応するユーザオブジェクト
     * @throws DaoError
     */
    login(user: User): User {

        // ユーザ名に対応するドキュメントを取得する。
        // passwordをSaltで暗号化し、ドキュメントのパスワードと突合
            // 間違いなら例外
        // OKならトークンの生成

        return user;
    }

    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * @param {User} user - ユーザトークンを保持するUserオブジェクト
     * @return {boolean} ログオフ成否
     */
    logoff(user: User): boolean {

        return false;
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

        let connectionInfo = <{ server: string, port: string, database: string, user: string, password: string }>Config.util.loadFileConfigs(Path.join(__dirname, "config")).mongoose;

        let connectionString = "mongodb://" + connectionInfo.user + ":" + connectionInfo.password + "@" + connectionInfo.database + ":" + connectionInfo.port + "/" + connectionInfo.database;

        this.Connection = Mongoose.connect(connectionString, {}, function (err) {

            let localmessage = "connect fail::" + connectionString;

            throw new DaoError(localmessage + "##" + err.message + "##" + err.stack);
        });

    }

}

