
/**
 * MongoDB関連オブジェクト
 * 
 * @export
 * @interface MongoObject
 */
export interface MongoObject {
    Id: string | undefined;

}

/**
 * ユーザのアクセス権限
 * 
 * @export
 * @enum {number}
 */
export const enum UserAccess {
    USUAL = 0
    ,HIGH = 5
    ,ADMINISTRATOR = 999
}

/**
 * HALの_linksプロパティのキー
 */
const HAL_LINKS_KEY = {
    "SELF": "self",
    "NEXT": "next",
    "CURIES": "curies",
}

/**
 * HALの_linksプロパティのvalueのkey-valueに使用するキー
 */
const HAL_LINKS_VALUES_KEY = {
    "HREF": "href",
    "NAME": "name",
    "TEMPLATED": "templated"
}

/**
 * レスポンスステート
 */
export const HAL_EMBEDDED_STATE = {
    "OK" : "OK",
    "NG" : "NG"
}

/**
 * ユーザ
 * 
 * @export
 * @class User
 * @implements {MongoObject}
 */
export class User implements MongoObject {

    private id: string | undefined;
    private name: string;
    private password: string;
    private token: string;
    private auth: UserAccess;
    private choikinis: ChoikiniList;
    
    /**
     * ドキュメントID
     * 
     * @type {(string | undefined)}
     * @memberOf User
     */
    public get Id(): string | undefined { return this.id; }
    public set Id(id: string | undefined) { this.id = id; }

    /**
     * ユーザ名
     * 
     * @type {string}
     * @memberOf User
     */
    public get Name(): string { return this.name; }
    public set Name(name: string) { this.name = name; }

    /**
     * パスワード
     * 
     * @type {string}
     * @memberOf User
     */
    public get Password(): string { return this.password; }
    public set Password(password: string) { this.password = password; }
    
    /**
     * アクセス権限
     * 
     * @type {UserAccess}
     * @memberOf User
     */
    public get Auth(): UserAccess { return this.auth; }
    public set Auth(auth: UserAccess) { this.auth = auth; }

    /**
     * トークン
     * 
     * @type {string}
     * @memberOf User
     */
    public get Token(): string { return this.token; }
    public set Token(token: string) { this.token = token; }

    /**
     * ちょい気にリスト
     * 
     * @type {ChoikiniList}
     * @memberOf User
     */
    public get Choikinis(): ChoikiniList { return this.choikinis; }
    public set Choikinis(choikinis: ChoikiniList) { this.choikinis = choikinis; }


    /**
     * Creates an instance of User.
     * 
     * @memberOf User
     */
    constructor() {
        this.Id = "";
        this.Name = "";
        this.Password = "";
        this.Auth = UserAccess.USUAL;
        this.Token = "";
        this.Choikinis = new ChoikiniList();
    }
}

/**
 * ちょい気にリスト
 * 
 * @export
 * @class ChoikiniList
 * @implements {MongoObject}
 */
export class ChoikiniList implements MongoObject {

    private id: string;
    private choikinis: ChoikiniEntity[];
    
    /**
     * ドキュメントID
     * 
     * @type {string}
     * @memberOf ChoikiniList
     */
    public get Id(): string { return this.id; }
    public set Id(id: string) { this.id = id; }
    
    /**
     * ちょい気にリスト
     * 
     * @type {ChoikiniEntity[]}
     * @memberOf ChoikiniList
     */
    public get Choikinis():ChoikiniEntity[] { return this.choikinis}
    public set Choikinis(choikinis: ChoikiniEntity[]) {this.choikinis = choikinis}

    /**
     * Creates an instance of ChoikiniList.
     * 
     * @memberOf ChoikiniList
     */
    constructor() {
        this.Id = "";
        this.Choikinis = [];
    }
}

/**
 * ちょい気に１つ分
 * 
 * @export
 * @class ChoikiniEntity
 */
export class ChoikiniEntity {

    private date:Date;
    private choikini: string;

    /**
     * ちょい気にの登録日時
     * 
     * @type {Date}
     * @memberOf ChoikiniEntity
     */
    public get EntryDate(): Date { return this.date}
    public set EntryDate(date: Date) { this.date = date}

    /**
     * ちょい気に本文
     * 
     * @type {string}
     * @memberOf ChoikiniEntity
     */
    public get Entry(): string { return this.choikini}
    public set Entry(choikini: string) { this.choikini = choikini}

    /**
     * Creates an instance of ChoikiniEntity.
     * 
     * @memberOf ChoikiniEntity
     */
    constructor() {
        
    }
}

/**
 * ちょい気にを登録するのに使用する情報をまとめたもの。
 * 
 * @export
 * @class ChikiniRegistInfo
 */
export class ChikiniRegistInfo {

    private user: User;
    private entry: ChoikiniEntity;

    /**
     * ユーザ
     * 
     * @type {User}
     * @memberOf ChikiniRegistInfo
     */
    public get User(): User { return this.user; }
    public set User(user: User) { this.user = user; }

    /**
     * 登録するエントリ
     * 
     * @type {ChoikiniEntity}
     * @memberOf ChikiniRegistInfo
     */
    public get Entry(): ChoikiniEntity { return this.entry; }
    public set Entry(entry: ChoikiniEntity) { this.entry = entry; }

    /**
     * Creates an instance of ChikiniRegistInfo.
     * 
     * @memberOf ChikiniRegistInfo
     */
    public constructor() {
        this.Entry = new ChoikiniEntity();
        this.User = new User();
    }

}

/**
 * HAL JSONオブジェクト実装
 * 
 * @export
 * @class Hal
 * @template T responseに使用するデータ型
 */
export class Hal<T> {
    
    protected _links: {[key: string]: {[key: string]: any}};
    protected _embedded: HalEmbedded<T>;

    /**
     * HAL - _linksプロパティ
     * 
     * @type {{[key: string]: {[key: string]: any}}}
     * @memberOf Hal
     */
    public get Links(): {[key: string]: {[key: string]: any}} { return this._links; }
    public set Links(hash: {[key: string]: {[key: string]: any}}) { this._links = hash }

    /**
     * HAL - _embeddedプロパティ
     * 
     * @type {HalEmbedded<T>}
     * @memberOf Hal
     */
    public get Embedded(): HalEmbedded<T> { return this._embedded }
    public set Embedded(embedded: HalEmbedded<T>) { this._embedded = embedded }
    
    /**
     * Creates an instance of Hal.
     * 
     * @memberOf Hal
     */
    public constructor() {
        this._links = {};
        this._embedded = new HalEmbedded<T>();
    }
}

/**
 * HAL _embeddedプロパティのオブジェクト実装
 * 処理結果を記録するState,StateDetailと、実際のレスポンスを記録するResponseを保持。
 * State = NGの場合、Responseはカラ。
 * 
 * @export
 * @class HalEmbedded
 * @template T 
 */
export class HalEmbedded<T> {

    private state: string;
    private stateDetail: string | {};
    private response: T | {};
    
    /**
     * レスポンス結果
     * 
     * @type {string}
     * @memberOf HalEmbedded
     */
    public get State(): string { return this.state; }
    public set State(state: string) { this.state = state; }

    /**
     * レスポンス結果詳細：特にState = NGの場合のメッセージまたはオブジェクト
     * 
     * @type {(string | {})}
     * @memberOf HalEmbedded
     */
    public get StateDetail(): string | {} { return this.stateDetail; }
    public set StateDetail(detail: string | {}) { this.stateDetail = detail; }

    /**
     * レスポンス。
     * State = NGの場合は {} となる。
     * 
     * @type {(T | {})}
     * @memberOf HalEmbedded
     */
    public get Response(): T | {} { return this.response; }
    public set Response(response: T | {}) { this.response = response; }

    /**
     * Creates an instance of HalEmbedded.
     * 
     * @memberOf HalEmbedded
     */
    public constructor() {
        this.State = "";
        this.StateDetail = "";
        this.Response = {};

    }
}
    

/**
 * login処理のレスポンスに使用するJSON
 * 
 * @export
 * @class LoginJSON
 */
export class LoginJSON {

    private token: string;

    /**
     * トークン
     * 
     * @type {string}
     * @memberOf LoginJSON
     */
    public get Token(): string { return this.token}
    public set Token(token: string) { this.token = token}

    /**
     * Creates an instance of LoginJSON.
     * 
     * @memberOf LoginJSON
     */
    public constructor() {
        this.Token = "";
    }
}

/**
 * choikini取得処理（単一ユーザ）のレスポンスに使用するJSON
 * 
 * @export
 * @class ChoikiniJSON
 */
export class ChoikiniJSON {

    private user: string;
    private choikiniList: ChoikiniEntity[];
    
    /**
     * ユーザ名
     * 
     * @type {string}
     * @memberOf ChoikiniJSON
     */
    public get User(): string { return this.user; }
    public set User(user: string) { this.user = user;}

    /**
     * ちょい気にリスト
     * 
     * @type {ChoikiniEntity[]}
     * @memberOf ChoikiniJSON
     */
    public get ChoikiniList(): ChoikiniEntity[] { return this.choikiniList;}
    public set ChoikiniList(list: ChoikiniEntity[]) {this.choikiniList = list;}

    /**
     * Creates an instance of ChoikiniJSON.
     * 
     * @memberOf ChoikiniJSON
     */
    public constructor() {
        this.User = "";
        this.ChoikiniList = [];
    }

}

/**
 * 更新・挿入の成否に関するレスポンスに使用するJSON
 * 
 * @export
 * @class UpsertResultJSON
 */
export class UpsertResultJSON {

    private isProccessed: boolean;

    /**
     * ユーザ名
     * 
     * @type {boolean}
     * @memberOf UpsertResultJSON
     */
    public get IsProcessed(): boolean { return this.isProccessed; }
    public set IsProcessed(isProccessed: boolean) { this.isProccessed = isProccessed;}

    /**
     * Creates an instance of UpsertResultJSON.
     * 
     * @memberOf UpsertResultJSON
     */
    public constructor() {
        this.IsProcessed = false;
    }
}