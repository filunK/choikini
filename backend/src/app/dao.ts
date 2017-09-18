/*
* Dao
*/

import { User, UserAccess, ChoikiniList, ChoikiniEntity } from "./datamodel"
import { DaoError } from "./errors"
import {Utils, Authentication,Logger} from "./commons"

import * as Mongoose from "mongoose";

/**
 * Daoインターフェース
 */
export interface IDao {

    /**
     * 不完全なUserから完全なUserを取得する。
     * @param {User} user - 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @return {User} 完全なユーザオブジェクト。
     */
    SelectUser(user: User): User;

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param {User} user - ユーザ名とパスワードが設定されたUserオブジェクト
     * @return {Promise<User>} - Promise
     * @throws DaoError
     */
    Login(user: User): Promise<User>;
        
    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * @param {User} user - ユーザトークンを設定したUserオブジェクト
     * @return {boolean} ログオフ成否
     */
    Logoff(user: User): boolean;

    /**
     * ちょい気にを登録する
     * @param {User} user - 登録対象ユーザ
     * @param {ChoikiniEntity} - 登録するエントリ
     * @throws DaoError
     */
    RegistChoikini(user: User, choikini: ChoikiniEntity): void;
}
/**
 * configモジュール、キー「mongoose」のインターフェース
 */
interface IDbConfig {
    server: string, 
    port: number, 
    database: string, 
    user: string, 
    password: string 
}

/**
 * Userスキーマのドキュメントインターフェース
 */
export interface IUser extends Mongoose.Document {
    _id: string;
    Name: string;
    Password: {Salt: string, Encrypted: string};
    Token: string;
    Auth: number;
}

/**
 * ChoikiniListスキーマのドキュメントインターフェース
 */
export interface IChoikiniList extends Mongoose.Document {
    _id: string;
    UserId: Mongoose.Types.ObjectId;
    choikinis: {EntryDate: Date, Entry: string}[]
}

/**
 * MongoDBへのDAO
 */
export class MongoDao implements IDao {

    private _connection: Mongoose.Connection;
    private get Connection(): Mongoose.Connection { return this._connection }
    private set Connection(connection: Mongoose.Connection) { this._connection = connection }

    //private _connection: Mongoose.MongooseThenable;
    //private get Connection(): Mongoose.MongooseThenable { return this._connection }
    //private set Connection(connection: Mongoose.MongooseThenable) { this._connection = connection }

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
                Auth: {type: Mongoose.SchemaTypes.Number, default: 0 },
            }
            , {
                collection: "User"
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
                            EntryDate: {type: Mongoose.SchemaTypes.Date, default: Date.now },
                            Entry: Mongoose.SchemaTypes.String
                        },
                        {_id: false}
                    )
                ]
            }

            , {
                collection: "ChoikiniList"
            }
        );
    }


    /**
     * 不完全なUserから完全なUserを取得する。
     * @param {User} user - 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @return {User} 完全なユーザオブジェクト。
     */
    SelectUser(user: User): User {


        return user;
    }

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param user 
     */
    async Login(user: User): Promise<User>{
        return new Promise<User>((resolve,reject) => {

            let userModel = this.Connection.model<IUser>("User",this.UserSchema,"User");
            
            let condition = {
                Name : user.Name
            }
            userModel.findOne(condition,(err: Error, res: IUser) => {
                
                // 取得エラーが発生していないか
                if (err) {
                    
                    let parentStack: string;
                    if (err.stack == undefined) {
                        parentStack = "";
                    } else {
                        parentStack = err.stack;
                    }
                    reject(new DaoError("SELECT失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + parentStack + "::"));
                }

                // 取得データなし
                if (res == null) {
                    reject(new DaoError("該当ユーザなし::[username]" + user.Name));
                } else {
                    // ユーザ認証
                    if (Authentication.validatePassword(user.Password,res.Password.Salt,res.Password.Encrypted)) {
                        user.Name = res.Name;
                        user.Password = res.Password.Encrypted;
                        user.Auth = res.Auth;
                        user.Id = res._id.toString();
                        
                        this.UpdateToken(user, res.Password.Salt)
                        .then(user => {
                            
                            resolve(user);

                        }).catch((error: Error) => {
                            reject(error);
                        });
                    } else {
                        reject(new DaoError("パスワード相違", user));
                    }

                    }

            });
                            
        });

        
    }

    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * @param {User} user - ユーザトークンを保持するUserオブジェクト
     * @return {boolean} ログオフ成否
     */
    Logoff(user: User): boolean {
        let result = false;
        
        let userModel = this.Connection.model<IUser>("User",this.UserSchema,"User");
        
        let condition = {
            Name: user.Name,
            Token: user.Token
        };

        let updateParam = {
            $set: {
                Token: ""
            }
        };

        let opt = {
            safe: true,
            upsert: false,
            multi : false,
            runValidators: true
        }

        
        userModel.update(condition,updateParam,opt,(err: Error, raw: any) => {
            // 取得エラーが発生していないか
            if (err) {
                Logger.LogError("Token更新失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + err.stack + "::")
                result = false;
            }

            result = true;

        });

        return result;
    }

    /**
     * ちょい気にを登録する
     * @param {User} user - 登録対象ユーザ
     * @param {ChoikiniEntity} - 登録するエントリ
     * @throws DaoError
     */
    RegistChoikini(user: User, choikini: ChoikiniEntity): void {

    }

    /**
     * トークンを生成・登録する
     * @param user ユーザ名が入ったUserオブジェクト
     * @param salt 
     * @return Promise<User
     */
    protected async UpdateToken(user: User, salt: string): Promise<User>{
        return new Promise<User>((resolve, reject) => {
            
            user.Token = Authentication.generateToken(user.Name);
        
            let userModel = this.Connection.model<IUser>("User",this.UserSchema,"User");
            
            let condition = {
                "_id" : Mongoose.Types.ObjectId(user.Id),
                "Name" : user.Name,
                "Password.Encrypted": user.Password
            };
    
    
            let updateParam = {
                $set: {
                    Token: user.Token
                }
            };
    
            let opt = {
                safe: true,
                upsert: false,
                multi : false,
                runValidators: true
            }
            
            userModel.update(condition,updateParam,opt,(err: Error, raw: {nModified: number}) => {
                // 取得エラーが発生していないか
                if (err) {
                    let parentStack: string;
                    if (err.stack === undefined) {
                        parentStack = "";
                    } else {
                        parentStack = err.stack;
                    }
                    reject(new DaoError("Token更新失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + parentStack + "::"));
                }
    
                // 更新成功の確認
                if (raw.nModified == 0) {
                    reject(new DaoError("Token更新時ドキュメントなし::", user));
                }
                resolve(user);
                
            });
               
        });
    }
        
        /**
     * 接続を外す
     */
    public Disconnect() {
        this.Connection.close((err: Error) => {
            Logger.LogError("fail Disconnect");
            throw new DaoError("接続解除に失敗");
        })
    }

    /**
     * @constructor
     * @throws DaoError
     */
    public constructor() {

        let connectionInfo = Utils.getConfig<IDbConfig>("mongoose");

        let connectionString = "mongodb://" + connectionInfo.server + ":" + connectionInfo.port + "/" + connectionInfo.database;
        this.Connection = Mongoose.createConnection(connectionInfo.server,connectionInfo.database,connectionInfo.port,{
            useMongoClient: true,
            user: connectionInfo.user,
            pass: connectionInfo.password,
            db : {
                native_parser: true
            },
            server : {
                poolSize: 5,
                socketOptions: {
                    autoReconnect: true,
                    noDelay: true
                }
            }
        });

        /*
        this.Connection = Mongoose.connect(connectionString, {
            useMongoClient: true,
            user: connectionInfo.user,
            pass: connectionInfo.password,
            db : {
                native_parser: true
            },
            server : {
                poolSize: 5,
                socketOptions: {
                    autoReconnect: true,
                    noDelay: true
                }
            }
        },(err: Error) => {

        });
        */
    }

}

