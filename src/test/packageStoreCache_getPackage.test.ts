import * as chai from "chai";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import { Log, LogLevelEnum, Core, IPackageRegistryResponse } from "@webfaas/webfaas-core";

import { PackageStoreCache } from "../lib/PackageStoreCache";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

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
        moduleManager.getModuleManagerImport().getPackageStoreManager().setCache(packageStoreCache);
        moduleManager.getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry("registry1", "", packageRegistry1);

        let moduleObj: any = await moduleManager.getModuleManagerImport().import("@registry1/mathsum", "0.0.1", undefined, "registry1", true);
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

        moduleManager.getModuleManagerCache().cleanCacheModule();
        let moduleObj2: any = await moduleManager.getModuleManagerImport().import("@registry1/mathsum", "0.0.1", undefined, "registry1", true);
        chai.expect(moduleObj2).to.not.null;
        chai.expect(moduleObj2(2,3)).to.eq(5);
        
        fs.unlinkSync(path.join(folderCache, "registry1-mathsum-0.0.1.tar"));
        fs.rmdirSync(folderCache);

        moduleManager.getModuleManagerCache().cleanCacheModule();
        let moduleObj3: any = await moduleManager.getModuleManagerImport().import("@registry1/mathsum", "0.0.1", undefined, "registry1", true);
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
        moduleManager.getModuleManagerImport().getPackageStoreManager().setCache(packageStoreCache);
        moduleManager.getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry("registry1", "", packageRegistry1);

        let moduleObj: any = await moduleManager.getModuleManagerImport().import("@registry1/mathsum", "0", undefined, "registry1", true);
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

        moduleManager.getModuleManagerCache().cleanCacheModule();
        let moduleObj2: any = await moduleManager.getModuleManagerImport().import("@registry1/mathsum", "0", undefined, "registry1", true);
        chai.expect(moduleObj2).to.not.null;
        chai.expect(moduleObj2(2,3)).to.eq(5);
        
        fs.unlinkSync(path.join(folderCache, "registry1-mathsum.json"));
        fs.unlinkSync(path.join(folderCache, "registry1-mathsum-0.0.3.tar"));
        fs.rmdirSync(folderCache);

        moduleManager.getModuleManagerCache().cleanCacheModule();
        let moduleObj3: any = await moduleManager.getModuleManagerImport().import("@registry1/mathsum", "0", undefined, "registry1", true);
        chai.expect(moduleObj3).to.null;
    })

    it("not permit", async function(){
        var folderNotPermit = path.join(os.tmpdir(), "cache_notpermit_") + new Date().getTime();
        fs.mkdirSync(folderNotPermit);
        fs.chmodSync(folderNotPermit, "000");
        
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = path.join(folderNotPermit, "folder1");

        try {
            await packageStoreCache_default.getPackageStore("@registry1/mathsum", "0.0.1")
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect( errTry.code ).to.eq("EACCES");
        }
    })

    it("simulate error", async function(){
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = os.tmpdir();

        packageStoreCache_default.getFileName = function(){
            throw new Error("simulate error")
        }

        try {
            await packageStoreCache_default.getPackageStore("@registry1/mathsum", "0.0.1")
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect( errTry.message ).to.eq("simulate error");
        }
    })
})