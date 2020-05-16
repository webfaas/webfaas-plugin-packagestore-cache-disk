import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";

import { Core, LogLevelEnum, EventManager, EventManagerEnum } from "@webfaas/webfaas-core";

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
            registry:{
                cache: {
                    disk:{
                        enabled: true,
                        base: "folder2"
                    }
                }
            }
        }
        let configData2 = {
            registry:{
                cache: {
                    disk:{
                        enabled: true,
                        base: "folder3"
                    }
                }
            }
        }
        let configData3 = {
            registry:{
                cache: {
                    disk:{
                        enabled: true
                    }
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

        config.read(configData2);
        EventManager.emit(EventManagerEnum.CONFIG_RELOAD);
        let cache2: PackageStoreCache = <PackageStoreCache> core2.getPackageStoreManager().getCache();
        chai.expect(cache2?.getConfig().base).to.eq("folder3");

        config.read(configData3);
        EventManager.emit(EventManagerEnum.CONFIG_RELOAD);
        let cache3: PackageStoreCache = <PackageStoreCache> core2.getPackageStoreManager().getCache();
        chai.expect(cache3?.getConfig().base).to.include(".webfasscache");
    })
})