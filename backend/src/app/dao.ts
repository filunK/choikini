/*
* Dao
*/

import {IDbConfig} from "./IConfig"
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
    SelectUser(user: User): Promise<User>;

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
    RegistChoikini(user: User, choikini: ChoikiniEntity): Promise<void>;

    /**
     * ユーザにひもづくちょい気にを取得する。
     * @param {User} user: 対象ユーザ
     * @throws DaoError
     */
    SelectChoikini(user: User): Promise<User>;

    /**
     * ちょい気にに登録されているユーザ・ちょい気にを全て取得する。
     */
    SelectAll():Promise<User[]>
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
    ChoikiniList: IChoikiniList;
}

/**
 * ChoikiniListスキーマのドキュメントインターフェース
 */
export interface IChoikiniList extends Mongoose.Document {
    _id: string;
    UserId: Mongoose.Types.ObjectId;
    Choikinis: {EntryDate: Date, Entry: string}[]
}

/**
 * Update操作で返却されるオブジェクト
 */
interface IMongoResponse {
    n: number;
    nModified: number;
    ok: number
}


/**
 * MongoDBへのDAO
 */
export class MongoDao implements IDao {

    private _connection: Mongoose.Connection;
    /**
     * コネクション
     */
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
                //ChoikiniList: {Type: Mongoose.SchemaTypes.ObjectId,ref: "ChoikiniList"},
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
                //UserId: {Type: Mongoose.SchemaTypes.ObjectId,ref: "User"},
                UserId: Mongoose.SchemaTypes.ObjectId,
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
     * @param {User} user - 不完全なユーザオブジェクト。ユーザ名・ユーザトークンが必須項目。
     * @return {User} 完全なユーザオブジェクト。ちょい気にリストは取得しない
     */
    async SelectUser(user: User): Promise<User> {

        let userModel = this.GenerateUserModel();

        let condition = {
            Name : user.Name,
            Token: user.Token
        }

        try {
            let res = await userModel.findOne(condition).exec();
            
                // 取得データなし
                if (res == null) {
                    throw new DaoError("該当ユーザなし::[username]" + user.Name);

                } else {
                    // 取得データあり
                    user.Id = res.id;
                    user.Name = res.Name;
                    user.Token = res.Token;
                    user.Auth = res.Auth;

                }
        } catch (error) {
            throw new DaoError(error);
        }
    
        return user;
    }
     

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * @param user 
     */
    async Login(user: User): Promise<User>{

        let userModel = this.GenerateUserModel();
        
        let condition = {
            Name : user.Name
        }

        try {
            let res = await userModel.findOne(condition).exec();

            // 取得データなし
            if (res == null) {
                throw new DaoError("該当ユーザなし::[username]" + user.Name);

            } else {
                // ユーザ認証
                if (Authentication.ValidatePassword(user.Password,res.Password.Salt,res.Password.Encrypted)) {
                    user.Name = res.Name;
                    user.Password = res.Password.Encrypted;
                    user.Auth = res.Auth;
                    user.Id = res._id.toString();

                    user = await this.UpdateToken(user, res.Password.Salt);

                } else {
                    throw new DaoError("パスワード相違", user);
                }
            }
        
            
        } catch (error) {
            throw new DaoError(error);
        }

        return user;        
    }

    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * @param {User} user - ユーザトークンを保持するUserオブジェクト
     * @return {boolean} ログオフ成否
     */
    Logoff(user: User): boolean {
        let result = false;
        
        let userModel = this.GenerateUserModel();
        
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
     * @param {User} user - 登録対象ユーザとその情報。ユーザ名・トークン、エントリが必須
     * @param {ChoikiniEntity} choikini - 登録するちょい気にのエントリ
     * @throws DaoError
     */
    async RegistChoikini(user: User, choikini: ChoikiniEntity): Promise<void>{
        let choikiniModel = this.GenerateChoikiniListModel();

        let condition = {
            UserId : Mongoose.Types.ObjectId(user.Id)
        };

        let updateParam = {
            $set: {
                UserId: Mongoose.Types.ObjectId(user.Id),
            },
            $push: {
                Choikinis: {
                    EntryDate: choikini.EntryDate,
                    Entry: choikini.Entry
                }
            }
        };

        let updateOption = {
            safe : true,
            upsert: true,
            multi:false,
            runValidators: true
        } as Mongoose.ModelUpdateOptions;

        try {
            let row = await choikiniModel.update(condition,updateParam,updateOption).exec() as IMongoResponse;
            
            // 更新成功の確認
            if (row.ok != 1) {
                throw new DaoError("ちょい気に登録時ドキュメントなし::", user);
            }

        } catch (error) {
            
            let parentStack: string;
            if (error.stack === undefined) {
                parentStack = "";
            } else {
                parentStack = error.stack;
            }
            throw new DaoError(error);
        }

    }
    
    /**
     * ユーザに紐づくチョイ気にを取得する。
     * @param user SelectUserにて取得されたUser。User._idが必須
     */
    async SelectChoikini(user: User): Promise<User> {
        let choikiniModel = this.GenerateChoikiniListModel();

        let condition = {
            UserId : Mongoose.Types.ObjectId(user.Id)
        };

        try {
            let choikinis = await choikiniModel.findOne(condition).exec();

            // 取得データなし
            if (choikinis == null) {
                throw new DaoError("該当ちょい気になし::[username]" + user.Name);

            } else {
                // データあり
                let container = new ChoikiniList();
                container.Id = choikinis._id;

                container.Choikinis = new Array(0);
                choikinis.Choikinis.forEach((element, index, array) => {

                    let entity = new ChoikiniEntity();
                    entity.EntryDate = element.EntryDate;
                    entity.Entry = element.Entry;

                    container.Choikinis.push(entity);
                });

                user.Choikinis = container;
            }
            
        } catch (error) {
            throw new DaoError(error);
        }

        return user;
    }

    async SelectAll():Promise<User[]> {
        let fullList: User[] = [];

        let userModel = this.GenerateUserModel();
        let choikiniListModel = this.GenerateChoikiniListModel();

        let userCondition = {};

        try {
            let users = await userModel.find(userCondition).exec();

            for (let i = 0; i < users.length; i++) {
                let element = users[i];
                
                let user = new User();
                user.Id = element._id;
                user.Name = element.Name;
                user.Token = element.Token;
                user.Auth = element.Auth;

                user = await this.SelectChoikini(user);

                fullList.push(user);
            }

        } catch (error) {
            throw new DaoError(error);
        }

        return fullList;
    }
    

    /**
     * トークンを生成・登録する
     * @param user ユーザ名が入ったUserオブジェクト
     * @param salt 
     */
    protected async UpdateToken(user: User, salt: string): Promise<User>{

        user.Token = Authentication.GenerateToken(user.Name);

        let userModel = this.GenerateUserModel();;
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
        } as Mongoose.ModelUpdateOptions;

        try {
            let raw = await userModel.update(condition,updateParam,opt).exec() as IMongoResponse;

            // 更新成功の確認
            if (raw.nModified == 0) {
                throw new DaoError("Token更新時ドキュメントなし::", user);
            }
            
        } catch (error) {
            throw new DaoError(error);
        }

        return user;
    }

    /**
     * Mongooseモデル：Userを生成
     */
    private GenerateUserModel(): Mongoose.Model<IUser> {
        return this.Connection.model<IUser>("User",this.UserSchema,"User");
    } 

    /**
     * Mongooseモデル：ChoikiniListを生成
     */
    private GenerateChoikiniListModel(): Mongoose.Model<IChoikiniList> {
        return this.Connection.model<IChoikiniList>("ChoikiniList", this.ChoikiniListSchema,"ChoikiniList");
    }

    /**
     * @constructor
     * @throws DaoError
     */
    public constructor() {

        let connectionInfo = Utils.GetConfig<IDbConfig>("mongoose");

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

