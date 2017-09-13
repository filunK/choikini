
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
 * @prop {string} Id - ドキュメントID
 * @prop {string} Name - ユーザ名
 * @prop {string} password - パスワード
 * @prop {string} token - ユーザトークン
 * @prop {UserAccess} Auth - アクセス権限
 * @prop {ChoikiniList} Choikinis - ちょい気にリスト
 */
export class User implements MongoObject {

    private id: string;
    private name: string;
    private password: string;
    private token: string;
    private auth: UserAccess;
    private choikinis: ChoikiniList;
    
    /**
     * [getter]ドキュメントID
     */
    public get Id(): string { return this.id; }

    /**
     * [setter]ドキュメントID
     */
    public set Id(id: string) { this.id = id; }

    /**
     * [gettter]ユーザ名
     */
    public get Name(): string { return this.name; }

    /**
     * [setter]ユーザ名
     */
    public set Name(name: string) { this.name = name; }

    /**
     * [gettter]パスワード
     */
    public get Password(): string { return this.password; }
    
    /**
     * [setter]パスワード
     */
    public set Password(password: string) { this.password = password; }
    
    /**
     * [gettter]アクセス権限
     */
    public get Auth(): UserAccess { return this.auth; }
    
    /**
     * [setter]アクセス権限
     */
    public set Auth(auth: UserAccess) { this.auth = auth; }

    /**
     * [gettter]パスワード
     */
    public get Token(): string { return this.token; }
    
    /**
     * [setter]パスワード
     */
    public set Token(token: string) { this.token = token; }

    /**
     * [gettter]パスワード
     */
    public get Choikinis(): ChoikiniList { return this.choikinis; }
    
    /**
     * [setter]パスワード
     */
    public set Choikinis(choikinis: ChoikiniList) { this.choikinis = choikinis; }


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

    private id: string;
    private choikinis: ChoikiniEntity[];
    
    /**
     * [getter]ドキュメントID
     */
    public get Id(): string { return this.id; }
    
    /**
     * [setter]ドキュメントID
     */
    public set Id(id: string) { this.id = id; }
    
    /**
     * [getter]ちょい気にリスト
     */
    public get Choikinis():ChoikiniEntity[] { return this.choikinis}

    /**
     * [setter]ちょい気にリスト
     */
    public set Choikinis(choikinis: ChoikiniEntity[]) {this.choikinis = choikinis}

    constructor() {

    }
}

/**
 * ちょい気に１つ分
 * @prop {Date} EntryDate - 登録日時
 * @prop {string} Entry - ちょい気にエントリー
 */
export class ChoikiniEntity {

    private date:Date;
    private choikini: string;

    /**
     * [getter]ちょい気にの登録日時
     */
    public get EntryDate(): Date { return this.date}

    /**
     * [setter]ちょい気にの登録日時
     */
    public set EntryDate(date: Date) { this.date = date}

    /**
     * [getter]ちょい気に本文
     */
    public get Entry(): string { return this.choikini}

    /**
     * [setter]ちょい気に本文
     */
    public set Entry(choikini: string) { this.choikini = choikini}

    constructor() {
        
    }
}


/**
 * HAL JSONオブジェクト実装
 */
export class Hal<T> {
    
    protected _links: {[key: string]: {[key: string]: any}};
    /**
     * HAL - _linksプロパティ
     */
    public get Links(): {[key: string]: {[key: string]: any}} { return this._links; }
    public set Links(hash: {[key: string]: {[key: string]: any}}) { this._links = hash }

    protected _embedded: HalEmbedded<T>;
    /**
     * HAL - _embeddedプロパティ
     */
    public get Embedded(): HalEmbedded<T> { return this._embedded }
    public set Embedded(embedded: HalEmbedded<T>) { this._embedded = embedded }
    
    /**
     * 初期化。nullでないことを保証
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
 */
export class HalEmbedded<T> {

    private state: string;
    /**
     * レスポンス結果
     */
    public get State(): string { return this.state; }
    public set State(state: string) { this.state = state; }

    private stateDetail: string | {};
    /**
     * レスポンス結果詳細：特にState = NGの場合のメッセージまたはオブジェクト
     */
    public get StateDetail(): string | {} { return this.stateDetail; }
    public set StateDetail(detail: string | {}) { this.stateDetail = detail; }

    private response: T | {};
    /**
     * レスポンス。
     * State = NGの場合は {} となる。
     */
    public get Response(): T | {} { return this.response; }
    public set Response(response: T | {}) { this.response = response; }

    /**
     * 全プロパティを初期化する。nullでないことを保証。
     */
    public constructor() {
        this.State = "";
        this.StateDetail = "";
        this.Response = {};

    }
}
    

/**
 * login処理のレスポンスに使用するJSON
 */
export class LoginJSON {

}