import * as chai from "chai";
import * as path from "path";
import { Log, LogLevelEnum } from "@webfaas/webfaas-core";
import { PackageStoreCacheConfig } from "../lib/PackageStoreCacheConfig";
import { PackageStoreCache } from "../lib/PackageStoreCache";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Store Cache", () => {
    it("constructor", function(){
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = path.join("path1");
        const packageStoreCache_full = new PackageStoreCache(new PackageStoreCacheConfig("path2"), log);

        chai.expect(typeof(packageStoreCache_default.getConfig())).to.eq("object");
        chai.expect(packageStoreCache_default.getConfig().base).to.eq("path1");
        chai.expect(typeof(packageStoreCache_full.getConfig())).to.eq("object");
        chai.expect(packageStoreCache_full.getConfig().base).to.eq("path2");
    })

    it("getFileName", function(){
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = "/";
        
        chai.expect(packageStoreCache_default.getFileName("module1", "1.0.0")).to.eq("/module1-1.0.0.tar");
        chai.expect(packageStoreCache_default.getFileName("@scope1/module1", "1.0.0")).to.eq("/scope1-module1-1.0.0.tar");
        
        chai.expect(packageStoreCache_default.getFileName("module1", "")).to.eq("/module1.json");
        chai.expect(packageStoreCache_default.getFileName("@scope1/module1", "")).to.eq("/scope1-module1.json");
    })
})