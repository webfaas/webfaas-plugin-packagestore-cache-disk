import { Core, IPlugin, IPackageRegistry } from "@webfaas/webfaas-core";
import { PackageStoreCacheConfig } from "./PackageStoreCacheConfig";
import { IPackageStoreCacheAsync } from "@webfaas/webfaas-core/lib/PackageStoreCache/IPackageStoreCacheAsync";
import { PackageStoreCache } from "./PackageStoreCache";

export default class WebFassPlugin implements IPlugin {
    cache: IPackageStoreCacheAsync
    
    async startPlugin(core: Core) {
    }

    async stopPlugin(core: Core) {
    }

    constructor(core: Core){
        let cacheConfig: any = core.getConfig().get("registry.cache", {});
        let config = new PackageStoreCacheConfig();
        if (cacheConfig.base){
            config.base = cacheConfig.base;
        }
        this.cache = new PackageStoreCache(config);
        core.getModuleManager().getModuleManagerImport().getPackageStoreManager().setCache(this.cache);
    }
}