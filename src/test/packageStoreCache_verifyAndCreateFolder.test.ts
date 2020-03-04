import * as chai from "chai";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import { Log, LogLevelEnum } from "@webfaas/webfaas-core";

import { PackageStoreCache } from "../lib/PackageStoreCache";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Store Cache - verifyAndCreateFolder", () => {
    it("not exist", async function(){
        var folderNotExist = path.join(os.tmpdir(), "cache_notexist_") + new Date().getTime();
        
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = folderNotExist;

        await packageStoreCache_default.verifyAndCreateFolder();
        
        chai.expect( fs.existsSync(folderNotExist) ).to.eq(true);
    })

    it("not exist + not write", async function(){
        var folderNotWrite = path.join(os.tmpdir(), "cache_notwrite_") + new Date().getTime();
        fs.mkdirSync(folderNotWrite)
        fs.chmodSync(folderNotWrite, "555");

        var folderNotExist = path.join(folderNotWrite, "cache_notexist_") + new Date().getTime();
        
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = folderNotExist;

        try {
            await packageStoreCache_default.verifyAndCreateFolder();
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect( errTry.code ).to.eq("EACCES");
        }
    })

    it("not permit", async function(){
        var folderNotPermit = path.join(os.tmpdir(), "cache_notpermit_") + new Date().getTime();
        fs.mkdirSync(folderNotPermit);
        fs.chmodSync(folderNotPermit, "000");
        
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = path.join(folderNotPermit, "folder1");

        try {
            await packageStoreCache_default.verifyAndCreateFolder();
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect( errTry.code ).to.eq("EACCES");
        }
    })
})