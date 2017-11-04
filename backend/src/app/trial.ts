
/**
 * mochaユニットテスト検証用のお試しクラス
 * 
 * @export
 * @class Trials
 */
export class Trials {

    private name: string;
    private age: number;

    public get Name(): string {
        return this.name;
    }
    public set Name(name: string){
        this.name = name;
    }

    public get Age(): number {
        return this.age;
    }
    public set Age(age: number){
        this.age = age;
    }

    constructor(name: string, age: number) {
        this.Name = name;
        this.Age = age;
    }
}