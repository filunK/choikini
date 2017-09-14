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
     * @return {User} 対応するユーザ
     * @throws DaoError
     */
    Login(user: User): User;

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
    Name: string;
    Password: {Salt: string, Encrypted: string};
    Token: string;
    Auth: number;
}

/**
 * ChoikiniListスキーマのドキュメントインターフェース
 */
export interface IChoikiniList extends Mongoose.Document {
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

    LoginPromise(user: User): Promise<any> {
        return new Promise<any>(resolver => {
            let userModel = this.Connection.model<IUser>("User",this.UserSchema);
            
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
                    throw new DaoError("SELECT失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + parentStack + "::");
                }
    
                // 取得データなし
                if (res == null) {
                    throw new DaoError("該当ユーザなし", user);
                }
    
                // ユーザ認証
                if (Authentication.validatePassword(user.Password,res.Password.Salt,res.Password.Encrypted)) {
                    user.Name = res.Name;
                    user.Password = res.Password.Encrypted;
                    user.Auth = res.Auth;
                    user.Id = res.id;
    
                    // トークン取得
                    user = this.updateToken(user,res.Password.Salt);
    
                } else {
                    throw new DaoError("パスワード相違", user);
                }
            });
    
            return user;
        })
    }

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param {User} user - ユーザ名とパスワードを設定したUserオブジェクト
     * @return {User} 対応するユーザオブジェクト
     * @throws DaoError
     */
    Login(user: User): User {

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
                throw new DaoError("SELECT失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + parentStack + "::");
            }

            // 取得データなし
            if (res == null) {
                throw new DaoError("該当ユーザなし", user);
            }

            // ユーザ認証
            if (Authentication.validatePassword(user.Password,res.Password.Salt,res.Password.Encrypted)) {
                user.Name = res.Name;
                user.Password = res.Password.Encrypted;
                user.Auth = res.Auth;
                user.Id = res._id.toString();

                // トークン取得
                user = this.updateToken(user,res.Password.Salt);

            } else {
                throw new DaoError("パスワード相違", user);
            }

        });

        return user;
    }

        /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param {User} user - ユーザ名とパスワードを設定したUserオブジェクト
     * @return {User} 対応するユーザオブジェクト
     * @throws DaoError
     */
    LoginNative(user: User): User {

        let condition = {
            Name : user.Name
        }
        
        this.Connection.collection("User").findOne<IUser>(condition,(err: Error, result: IUser ) => {
            // 取得エラーが発生していないか
            if (err) {
                let parentStack: string;
                if (err.stack == undefined) {
                    parentStack = "";
                } else {
                    parentStack = err.stack;
                }
                throw new DaoError("SELECT失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + parentStack + "::");
            }

            // 取得データなし
            if (result == null) {
                throw new DaoError("該当ユーザなし", user);
            }

            // ユーザ認証
            if (Authentication.validatePassword(user.Password,result.Password.Salt,result.Password.Encrypted)) {
                user.Name = result.Name;
                user.Password = result.Password.Encrypted;
                user.Auth = result.Auth;
                user.Id = result._id.toString();

                // トークン取得
                user = this.updateTokenNative(user,result.Password.Salt);

            } else {
                throw new DaoError("パスワード相違", user);
            }
            
            return user;
        });

        return user;
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
     * @return Tokenを含むユーザオブジェクト
     */
    protected updateToken(user: User, salt: string): User {


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
                throw new DaoError("Token更新失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + parentStack + "::");
            }

            // 更新成功の確認
            if (raw.nModified == 0) {
                throw new DaoError("Token更新時ドキュメントなし::", user);
            }

        });
        
        return user;
    }

    /**
     * トークンを生成・登録する
     * @param user ユーザ名が入ったUserオブジェクト
     * @param salt 
     * @return Tokenを含むユーザオブジェクト
     */
    protected updateTokenNative(user: User, salt: string): User {
        
        
        user.Token = Authentication.generateToken(user.Name);

        /*
        let condition = {
            "_id": Mongoose.Types.ObjectId(user.Id),
            "Password.Encrypted": user.Password
        };
        */
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

        this.Connection.collection("User").findOneAndUpdate(condition,updateParam,(error: Error, result: any) => {
            // 取得エラーが発生していないか
            if (error) {
                let parentStack: string;
                if (error.stack === undefined) {
                    parentStack = "";
                } else {
                    parentStack = error.stack;
                }
                throw new DaoError("Token更新失敗::" + "::ユーザ名::" + user.Name + "::トレース::" + parentStack + "::");
            }
            
        });

        return user;
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

    }

}

