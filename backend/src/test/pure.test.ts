/**
 * pure.test.ts
 * mochaフレームワーク、Chaiアサーションのお試しスクリプト
 */

import * as Chai from "chai";
import * as Mocha from "mocha";
import {Trials} from "../app/trial"


describe("sampleTest",() => {
    it("2 + 3 = 5",() => {
        let testee = 2 + 3;
        
        Chai.assert(testee == 5, "incorrect Answer:" + testee );
        
    });

    it("InstanceOK", () => {
        let instance = new Trials("Yoshiki",22);

        Chai.assert(instance.Name == "Yoshiki", "Name unmatch: " + instance.Name);
        Chai.assert(instance.Age == 22, "Age unmatch:  " + instance.Age);

    })

    it("InstanceInvalidName", () => {
        let instance = new Trials("Yoshiki",22);

        Chai.assert(instance.Name != "TAKAKO", "Name unmatch: expected = TAKAKO: actual = " + instance.Name);
        Chai.assert(instance.Age == 22, "Age unmatch:  " + instance.Age);

    })

    it("InstanceInvalidAge", () => {
        let instance = new Trials("Yoshiki",22);

        Chai.assert(instance.Name == "Yoshiki", "Name unmatch: " + instance.Name);
        Chai.assert(instance.Age != 25, "Age unmatch: expected = 25: actual = " + instance.Age);

    })

});
