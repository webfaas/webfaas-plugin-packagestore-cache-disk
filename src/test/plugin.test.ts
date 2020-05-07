import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";

import { Core, LogLevelEnum } from "@webfaas/webfaas-core";

import WebFassPlugin from "../lib/WebFassPlugin";
import { PackageStoreCache } from "../lib/PackageStoreCache";
import { Config } from "@webfaas/webfaas-core/lib/Config/Config";

describe("Plugin", () => {
    it("start and stop - new", async function(){
        let core = new Core();
        let plugin = new WebFassPlugin(core);
        chai.expect(typeof(plugin)).to.eq("object");
        core.getLog().changeCurrentLevel(LogLevelEnum.OFF);
        await plugin.startPlugin(core);
        await plugin.stopPlugin(core);
        await plugin.stopPlugin(core); //retry stop

        //config
        let configData = {
            "registry":{
                "cache": {
                    "base": "folder2"
                }
            }
        }
        let config = new Config();
        config.read(configData);
        let core2 = new Core( config );

        let plugin2 = new WebFassPlugin(core2);
        core2.getLog().changeCurrentLevel(LogLevelEnum.OFF);
        chai.expect(core2.getPackageStoreManager().getCache()).to.not.null;
        let cache: PackageStoreCache = <PackageStoreCache> core2.getPackageStoreManager().getCache();
        chai.expect(cache.getConfig().base).to.eq("folder2");
    })
})