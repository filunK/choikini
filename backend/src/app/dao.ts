import {IDbConfig} from "./IConfig"
import { User, UserAccess, ChoikiniList, ChoikiniEntity } from "./datamodel"
import { DaoError } from "./errors"
import {Utils, Authentication,Logger} from "./commons"

import * as Mongoose from "mongoose";

/**
 * Daoインターフェース
 * 
 * @export
 * @interface IDao
 */
export interface IDao {

    /**
     * 不完全なUserから完全なUserを取得する。
     * 
     * @param {User} user 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @returns {Promise<User>} 完全なユーザオブジェクトをやり取りするPromise
     * @throws DaoError ユーザ取得に失敗した場合にスローする。
     * @memberOf IDao
     */
    SelectUser(user: User): Promise<User>;

    /**
     * ログイン処理を行い、ユーザトークンを取得する。
     * 
     * @param {User} user ユーザ名とパスワードが設定されたUserオブジェクト
     * @returns {Promise<User>} ユーザオブジェクトをやり取りするPromise
     * @throws DaoError ログイン失敗時にスローする。
     * 
     * @memberOf IDao
     */
    Login(user: User): Promise<User>;
        
    /**
     * ログオフ処理を行い、ユーザトークンを削除する。
     * 
     * @param {User} user ユーザトークンを設定したUserオブジェクト
     * @returns {Promise<void>} 
     * @throws DaoError ログオフ失敗時にスローする。
     * @memberOf IDao
     */
    Logoff(user: User): Promise<void>;

    /**
     * ちょい気にを登録する
     * 
     * @param {User} user 登録対象ユーザ
     * @param {ChoikiniEntity} choikini 登録するエントリ
     * @returns {Promise<void>} 
     * @throws DaoError 登録に失敗した時にスローする。
     * 
     * @memberOf IDao
     */
    RegistChoikini(user: User, choikini: ChoikiniEntity): Promise<void>;

    /**
     * ユーザにひもづくちょい気にを取得する。
     * 
     * @param {User} user 対象ユーザ
     * @returns {Promise<User>} ちょい気にを含む完全なユーザオブジェクトをやり取りするPromise
     * @throws DaoError 取得に失敗した場合にスローする。
     * 
     * @memberOf IDao
     */
    SelectChoikini(user: User): Promise<User>;

    /**
     * ちょい気にに登録されているユーザ・ちょい気にを全て取得する。
     * 
     * @returns {Promise<User[]>} 全てのユーザとそれの紐づくちょい気にのリストをやり取りするPromise
     * @throws DaoError 取得に失敗した場合にスローする。
     * 
     * @memberOf IDao
     */
    SelectAll():Promise<User[]>
}

/**
 * Userスキーマのドキュメントインターフェース
 * 
 * @export
 * @interface IUser
 * @extends {Mongoose.Document}
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
 * 
 * @export
 * @interface IChoikiniList
 * @extends {Mongoose.Document}
 */
export interface IChoikiniList extends Mongoose.Document {
    _id: string;
    UserId: Mongoose.Types.ObjectId;
    Choikinis: {EntryDate: Date, Entry: string}[]
}

/**
 * Update操作で返却されるオブジェクト
 * 
 * @interface IMongoResponse
 */
interface IMongoResponse {
    n: number;
    nModified: number;
    ok: number
}


/**
 * MongoDBへのDAO
 * 
 * @export
 * @class MongoDao
 * @implements {IDao}
 */
export class MongoDao implements IDao {

    private _connection: Mongoose.Connection;
    /**
     * コネクション
     * 
     * @private
     * @type {Mongoose.Connection}
     * @memberOf MongoDao
     */
    private get Connection(): Mongoose.Connection { return this._connection }
    private set Connection(connection: Mongoose.Connection) { this._connection = connection }

    //private _connection: Mongoose.MongooseThenable;
    //private get Connection(): Mongoose.MongooseThenable { return this._connection }
    //private set Connection(connection: Mongoose.MongooseThenable) { this._connection = connection }


    /**
     * Userコレクションのスキーマ
     * 
     * @readonly
     * @private
     * @type {Mongoose.Schema}
     * @memberOf MongoDao
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
     * 
     * @readonly
     * @private
     * @type {Mongoose.Schema}
     * @memberOf MongoDao
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
     * 
     * @param {User} user 不完全なユーザオブジェクト。ユーザトークンが必須項目。
     * @returns {Promise<User>} 
     * @throws DaoError ユーザ取得に失敗した場合にスローする。
     * 
     * @memberOf MongoDao
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
     * 
     * @param {User} user ユーザ名とパスワードが設定されたUserオブジェクト
     * @returns {Promise<User>} ユーザオブジェクトをやり取りするPromise
     * @throws DaoError ログイン失敗時にスローする。
     * 
     * @memberOf MongoDao
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
     * 
     * @param {User} user ユーザトークンを設定したUserオブジェクト
     * @returns {Promise<void>} 
     * @throws DaoError ログオフ失敗時にスローする。
     * 
     * @memberOf MongoDao
     */
    async Logoff(user: User): Promise<void> {
        
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
        } as Mongoose.ModelUpdateOptions

        try {
            let row = await userModel.update(condition,updateParam,opt).exec() as IMongoResponse;

            if (row.nModified == 0) {
                throw new DaoError("Token削除に失敗::", user);
            }
            
        } catch (error) {
            throw new DaoError(error);
        }

    }

    /**
     * ちょい気にを登録する
     * 
     * @param {User} user 登録対象ユーザ
     * @param {ChoikiniEntity} choikini 登録するエントリ
     * @returns {Promise<void>} 
     * @throws DaoError 登録に失敗した時にスローする。
     * 
     * @memberOf MongoDao
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
     * ユーザにひもづくちょい気にを取得する。
     * 
     * @param {User} user 対象ユーザ
     * @returns {Promise<User>} ちょい気にを含む完全なユーザオブジェクトをやり取りするPromise
     * @throws DaoError 取得に失敗した場合にスローする。
     * 
     * @memberOf MongoDao
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

    /**
     * ちょい気にに登録されているユーザ・ちょい気にを全て取得する。
     * 
     * @returns {Promise<User[]>} 全てのユーザとそれの紐づくちょい気にのリストをやり取りするPromise
     * @throws DaoError 取得に失敗した場合にスローする。
     * 
     * @memberOf MongoDao
     */
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
     * 
     * @protected
     * @param {User} user ユーザ名が入ったUserオブジェクト
     * @param {string} salt SALT値
     * @returns {Promise<User>} 完全なユーザ情報をやり取りするPromise
     * 
     * @memberOf MongoDao
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
            let row = await userModel.update(condition,updateParam,opt).exec() as IMongoResponse;

            // 更新成功の確認
            if (row.nModified == 0) {
                throw new DaoError("Token更新時ドキュメントなし::", user);
            }
            
        } catch (error) {
            throw new DaoError(error);
        }

        return user;
    }

    /**
     * Mongooseモデル：Userを生成
     * 
     * @private
     * @returns {Mongoose.Model<IUser>} Userコレクションのモデル
     * 
     * @memberOf MongoDao
     */
    private GenerateUserModel(): Mongoose.Model<IUser> {
        return this.Connection.model<IUser>("User",this.UserSchema,"User");
    } 

    /**
     * Mongooseモデル：ChoikiniListを生成
     * 
     * @private
     * @returns {Mongoose.Model<IChoikiniList>} ChoikiniListコレクションのモデル
     * 
     * @memberOf MongoDao
     */
    private GenerateChoikiniListModel(): Mongoose.Model<IChoikiniList> {
        return this.Connection.model<IChoikiniList>("ChoikiniList", this.ChoikiniListSchema,"ChoikiniList");
    }

    /**
     * Creates an instance of MongoDao.
     * 
     * @constructor
     * @throws DaoError
     * 
     * @memberOf MongoDao
     */
    public constructor() {
        (<any>Mongoose).Promise = global.Promise;

        let connectionInfo = Utils.GetConfig<IDbConfig>("mongoose");

        let connectionString = "mongodb://" + connectionInfo.server + ":" + connectionInfo.port + "/" + connectionInfo.database;
        this.Connection = Mongoose.createConnection(connectionInfo.server,connectionInfo.database,connectionInfo.port,{
            useMongoClient: true,
            user: connectionInfo.user,
            pass: connectionInfo.password,
            promiseLibrary: global.Promise,
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

