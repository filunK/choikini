
/**
 * MongoDB関連オブジェクト
 */
export interface MongoObject {
    Id: string;

}

/**
 * ユーザのアクセス権限
 */
export const enum UserAccess {
    USUAL = 0
    ,HIGH = 5
    ,ADMINISTRATOR = 999
}

/**
 * ユーザ
 * @prop {string} Id - ドキュメントID
 * @prop {string} Name - ユーザ名
 * @prop {string} password - パスワード
 * @prop {string} token - ユーザトークン
 * @prop {UserAccess} Auth - アクセス権限
 * @prop {ChoikiniList} Choikinis - ちょい気にリスト
 */
export class User implements MongoObject {

    private _id: string;
    private _name: string;
    private _password: string;
    private _token: string;
    private _auth: UserAccess;
    private _choikinis: ChoikiniList;
    
    /**
     * [getter]ドキュメントID
     */
    public get Id(): string { return this._id; }

    /**
     * [setter]ドキュメントID
     */
    public set Id(id: string) { this._id = id; }

    /**
     * [gettter]ユーザ名
     */
    public get Name(): string { return this._name; }

    /**
     * [setter]ユーザ名
     */
    public set Name(name: string) { this._name = name; }

    /**
     * [gettter]パスワード
     */
    public get Password(): string { return this._password; }
    
    /**
     * [setter]パスワード
     */
    public set Password(password: string) { this._password = password; }
    
    /**
     * [gettter]アクセス権限
     */
    public get Auth(): UserAccess { return this._auth; }
    
    /**
     * [setter]アクセス権限
     */
    public set Auth(auth: UserAccess) { this._auth = auth; }

    /**
     * [gettter]パスワード
     */
    public get Token(): string { return this._token; }
    
    /**
     * [setter]パスワード
     */
    public set Token(token: string) { this._token = token; }

    /**
     * [gettter]パスワード
     */
    public get Choikinis(): ChoikiniList { return this._choikinis; }
    
    /**
     * [setter]パスワード
     */
    public set Choikinis(choikinis: ChoikiniList) { this._choikinis = choikinis; }


    /**
     * コンストラクタ
     */
    constructor() {

    }
}

/**
 * ちょい気にリスト
 * @prop {string} Id - ドキュメントID
 * @prop {ChoikiniEntity[]} Choikinis - ちょい気にリスト
 */
export class ChoikiniList implements MongoObject {

    private _id: string;
    private _choikinis: ChoikiniEntity[];
    
    /**
     * [getter]ドキュメントID
     */
    public get Id(): string { return this._id; }
    
    /**
     * [setter]ドキュメントID
     */
    public set Id(id: string) { this._id = id; }
    
    /**
     * [getter]ちょい気にリスト
     */
    public get Choikinis():ChoikiniEntity[] { return this._choikinis}

    /**
     * [setter]ちょい気にリスト
     */
    public set Choikinis(choikinis: ChoikiniEntity[]) {this._choikinis = choikinis}

    constructor() {

    }
}

/**
 * ちょい気に１つ分
 * @prop {Date} EntryDate - 登録日時
 * @prop {string} Entry - ちょい気にエントリー
 */
export class ChoikiniEntity {

    private _date:Date;
    private _choikini: string;

    /**
     * [getter]ちょい気にの登録日時
     */
    public get EntryDate(): Date { return this._date}

    /**
     * [setter]ちょい気にの登録日時
     */
    public set EntryDate(date: Date) { this._date = date}

    /**
     * [getter]ちょい気に本文
     */
    public get Entry(): string { return this._choikini}

    /**
     * [setter]ちょい気に本文
     */
    public set Entry(choikini: string) { this._choikini = choikini}

    constructor() {
        
    }
}