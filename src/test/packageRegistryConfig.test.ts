import * as chai from "chai";
import * as mocha from "mocha";

import { PackageStoreCacheConfig } from "../lib/PackageStoreCacheConfig";

describe("Package Registry Config", () => {
    it("config1 - should return properties", function(){
        var config_1 = new PackageStoreCacheConfig("folder1");
        chai.expect(config_1.base).to.eq("folder1");
    })

    it("config2 - should return properties", function(){
        var config_2 = new PackageStoreCacheConfig();
        config_2.base = "folder1";
        
        chai.expect(config_2.base).to.eq("folder1");
    })
})