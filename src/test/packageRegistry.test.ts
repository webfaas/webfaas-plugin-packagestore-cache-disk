import * as chai from "chai";
import * as mocha from "mocha";

import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import { Log, LogLevelEnum, ClientHTTPConfig, Core, IPackageRegistryResponse } from "@webfaas/webfaas-core";

import { PackageStoreCacheConfig } from "../lib/PackageStoreCacheConfig";
import { PackageStoreCache } from "../lib/PackageStoreCache";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

/*
var folderNotPermited = path.join(os.tmpdir(), "notpermited_") + new Date().getTime();
fs.mkdirSync(folderNotPermited)
fs.chmodSync(folderNotPermited, "000");
var packageRegistry_foldernotpermited = new PackageRegistry();
packageRegistry_foldernotpermited.getConfig().base = folderNotPermited;
*/

describe("Package Store Cache", () => {
    it("should return properties", function(){
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = path.join("path1");
        const packageStoreCache_full = new PackageStoreCache(new PackageStoreCacheConfig("path2"), log);

        chai.expect(typeof(packageStoreCache_default.getConfig())).to.eq("object");
        chai.expect(packageStoreCache_default.getConfig().base).to.eq("path1");
        chai.expect(typeof(packageStoreCache_full.getConfig())).to.eq("object");
        chai.expect(packageStoreCache_full.getConfig().base).to.eq("path2");
    })
})

describe("Package Store Cache - getPackage", () => {
    it("getPackage - @registry1/mathsum 0.0.1", async function(){
        const folderCache = path.join(os.tmpdir(), "webfaas_cache1_") + new Date().getTime();
        fs.mkdirSync(folderCache)

        const packageStoreCache_default = new PackageStoreCache();
        const packageRegistry1 = new PackageRegistryMock.PackageRegistry1();
        packageStoreCache_default.getConfig().base = path.join(folderCache);

        const core = new Core();
        const packageStoreCache = new PackageStoreCache();
        const moduleManager = core.getModuleManager();
        
        packageStoreCache.getConfig().base = folderCache;
        moduleManager.getPackageStoreManager().setCache(packageStoreCache);
        moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("registry1", "", packageRegistry1);

        let moduleObj: any = await moduleManager.import("@registry1/mathsum", "0.0.1", undefined, "registry1", true);
        chai.expect(moduleObj).to.not.null;
        chai.expect(moduleObj(2,3)).to.eq(5);

        packageRegistry1.getPackage = function(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>{
            return new Promise((resolve, reject)=>{
                let responseNotFoundObj = {} as IPackageRegistryResponse;
                responseNotFoundObj.packageStore = null;
                responseNotFoundObj.etag = "";
                resolve(responseNotFoundObj);
            });
        }

        moduleManager.cleanCacheObjectCompiled();
        let moduleObj2: any = await moduleManager.import("@registry1/mathsum", "0.0.1", undefined, "registry1", true);
        chai.expect(moduleObj2).to.not.null;
        chai.expect(moduleObj2(2,3)).to.eq(5);
        
        fs.unlinkSync(path.join(folderCache, "registry1-mathsum-0.0.1.tar"));
        fs.rmdirSync(folderCache);

        moduleManager.cleanCacheObjectCompiled();
        let moduleObj3: any = await moduleManager.import("@registry1/mathsum", "0.0.1", undefined, "registry1", true);
        chai.expect(moduleObj3).to.null;
    })

   it("getPackage - @registry1/mathsum 0", async function(){
        const folderCache = path.join(os.tmpdir(), "webfaas_cache2_") + new Date().getTime();
        fs.mkdirSync(folderCache)

        const packageStoreCache_default = new PackageStoreCache();
        const packageRegistry1 = new PackageRegistryMock.PackageRegistry1();
        packageStoreCache_default.getConfig().base = path.join(folderCache);

        const core = new Core();
        const packageStoreCache = new PackageStoreCache();
        const moduleManager = core.getModuleManager();
        
        packageStoreCache.getConfig().base = folderCache;
        moduleManager.getPackageStoreManager().setCache(packageStoreCache);
        moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("registry1", "", packageRegistry1);

        let moduleObj: any = await moduleManager.import("@registry1/mathsum", "0", undefined, "registry1", true);
        chai.expect(moduleObj).to.not.null;
        chai.expect(moduleObj(2,3)).to.eq(5);

        packageRegistry1.getPackage = function(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>{
            return new Promise((resolve, reject)=>{
                let responseNotFoundObj = {} as IPackageRegistryResponse;
                responseNotFoundObj.packageStore = null;
                responseNotFoundObj.etag = "";
                resolve(responseNotFoundObj);
            });
        }

        moduleManager.cleanCacheObjectCompiled();
        let moduleObj2: any = await moduleManager.import("@registry1/mathsum", "0", undefined, "registry1", true);
        chai.expect(moduleObj2).to.not.null;
        chai.expect(moduleObj2(2,3)).to.eq(5);
        
        fs.unlinkSync(path.join(folderCache, "registry1-mathsum.json"));
        fs.unlinkSync(path.join(folderCache, "registry1-mathsum-0.0.3.tar"));
        fs.rmdirSync(folderCache);

        moduleManager.cleanCacheObjectCompiled();
        let moduleObj3: any = await moduleManager.import("@registry1/mathsum", "0", undefined, "registry1", true);
        chai.expect(moduleObj3).to.null;
    })
})