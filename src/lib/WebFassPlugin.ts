import { Core, IPlugin, IPackageRegistry, EventManager, EventManagerEnum } from "@webfaas/webfaas-core";
import { PackageStoreCacheConfig } from "./PackageStoreCacheConfig";
import { IPackageStoreCacheAsync } from "@webfaas/webfaas-core/lib/PackageStoreCache/IPackageStoreCacheAsync";
import { PackageStoreCache } from "./PackageStoreCache";

export default class WebFassPlugin implements IPlugin {
    cache: IPackageStoreCacheAsync | null;
    core: Core;
    
    async startPlugin(core: Core) {
    }

    async stopPlugin(core: Core) {
    }

    onConfigReload(){
        this.configure();
    }

    private configure(){
        let cacheConfig: any = this.core.getConfig().get("registry.cache.disk", {});
        if (cacheConfig.enabled){
            let config = new PackageStoreCacheConfig();
            if (cacheConfig.base){
                config.base = cacheConfig.base;
            }
            this.cache = new PackageStoreCache(config);
            this.core.getPackageStoreManager().setCache(this.cache);
        }
    }

    constructor(core: Core){
        this.core = core;
        this.cache = null;

        this.onConfigReload = this.onConfigReload.bind(this);
        EventManager.addListener(EventManagerEnum.CONFIG_RELOAD, this.onConfigReload);

        this.configure();
    }
}