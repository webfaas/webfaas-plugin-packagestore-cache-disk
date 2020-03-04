import * as chai from "chai";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import { Log, LogLevelEnum, Core, IPackageRegistryResponse, PackageStore } from "@webfaas/webfaas-core";

import { PackageStoreCache } from "../lib/PackageStoreCache";
import { PackageRegistryMock } from "./mocks/PackageRegistryMock";

var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Store Cache - putPackage", () => {
    it("without buffer", async function(){
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = "/tmp";

        let packageStore = new PackageStore("@registry1/test1", "", "");

        await packageStoreCache_default.putPackageStore(packageStore);
    })

    it("not permit", async function(){
        var folderNotPermit = path.join(os.tmpdir(), "cache_notpermit_") + new Date().getTime();
        fs.mkdirSync(folderNotPermit);
        fs.chmodSync(folderNotPermit, "000");
        
        const packageStoreCache_default = new PackageStoreCache();
        packageStoreCache_default.getConfig().base = path.join(folderNotPermit, "folder1");

        let packageStore = new PackageStore("@registry1/test1", "0.0.1", "", Buffer.from("AA"));

        try {
            await packageStoreCache_default.putPackageStore(packageStore);
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect( errTry.code ).to.eq("EACCES");
        }

        //simulate write error
        packageStoreCache_default.verifyAndCreateFolder = function(){
            return new Promise(async (resolve, reject) => {
                resolve(true);
            });
        }
        try {
            await packageStoreCache_default.putPackageStore(packageStore);
            throw new Error("Sucess");
        }
        catch (errTry) {
            chai.expect( errTry.code ).to.eq("EACCES");
        }
    })
})