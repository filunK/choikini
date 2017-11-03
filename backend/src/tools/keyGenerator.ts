/**
 * SALT・パスワード生成プログラム
 * コール：
 * node keyGenerator.js <平文password>
 * 
 */
import * as Crypto from "crypto";
import {Authentication,Utils} from "../app/commons"
import {IAuthConfig} from "../app/IConfig"

// 引数解決
let fullarg = process.argv;
let arg: string[] = [];


for (var i = 2; i < fullarg.length; i++) {
    arg.push(fullarg[i]);
}

if (arg.length != 1) {
    console.log("USAGE: node keyGenerator.js <password>");
    process.exit(99);
}

// 設定確認
let config = Utils.GetConfig<IAuthConfig>("auth");

let cryptoAlgorithm = config.crypto;
let hashAlgorithm = config.hash;

// キー生成
let salt = Authentication.GenerateSalt();;
let password = arg[0];


console.log("::::::::::処理前::::::::::");
console.log("パスワード::" + password);
console.log("SALT::" + salt);
console.log("アルゴリズム::" + hashAlgorithm + " + " + cryptoAlgorithm);
console.log(":--------------------------------->:");

let hash = Crypto.createHash(hashAlgorithm);
hash.update(salt);
let hashedSalt = hash.digest("hex");

let chiper = Crypto.createCipher(cryptoAlgorithm,hashedSalt);
chiper.update(password,"utf8","hex");
let chiperedText = chiper.final("hex");

console.log("::::::::::処理後::::::::::");
console.log("暗号化パスワード：；" + chiperedText);
console.log("::::::::::処理後::::::::::");
