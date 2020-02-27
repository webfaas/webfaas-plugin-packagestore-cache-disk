"use strict";

import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import { ModuleManager, Core } from "@webfaas/webfaas-core";

import { PackageStoreCache } from "../lib/PackageStoreCache";
import { PackageRegistryMock } from "../test/mocks/PackageRegistryMock";


//var folderCache: string = path.join(os.tmpdir(), "webfaastest_") + new Date().getTime();
var folderCache: string = path.join(os.tmpdir(), "webfaastest_example");
try {
    fs.mkdirSync(folderCache);    
} catch (error) {
    
}

const packageRegistry1 = new PackageRegistryMock.PackageRegistry1();

const core = new Core();
const packageStoreCache = new PackageStoreCache();
packageStoreCache.getConfig().base = folderCache;
core.getModuleManager().getModuleManagerImport().getPackageStoreManager().setCache(packageStoreCache);
core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry("registry1", "", packageRegistry1);

core.import("@registry1/mathsum", "0", undefined, "registry1").then((moduleObj: any)=>{
    if (moduleObj){
        console.log("module loaded", moduleObj);
        console.log("2 = 3 => ", moduleObj(2,3));
    }
    else{
        console.log("module not loaded");
    }
});