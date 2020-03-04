import * as fs from "fs";
import * as path from "path";

import { PackageStoreCacheConfig } from "./PackageStoreCacheConfig";
import { IPackageStoreCacheAsync } from "@webfaas/webfaas-core/lib/PackageStoreCache/IPackageStoreCacheAsync";
import { PackageStore, ModuleNameUtil, WebFaasError, PackageStoreUtil, Log } from "@webfaas/webfaas-core";

/**
 * Cache PackageStore in disk
 */
export class PackageStoreCache implements IPackageStoreCacheAsync {
    private config: PackageStoreCacheConfig;
    private log: Log;
    
    constructor(config?: PackageStoreCacheConfig, log?: Log){
        if (config){
            this.config = config;
        }
        else{
            this.config = new PackageStoreCacheConfig();
        }

        this.log = log || new Log();
    }

    /**
     * return config
     */
    getConfig(): PackageStoreCacheConfig{
        return this.config;
    }

    /**
     * return file name
     * @param name module name
     * @param version module version
     */
    getFileName(name: string, version?: string): string{
        var moduleNameData = ModuleNameUtil.parse(name, "");
        
        if (version){
            if (moduleNameData.scopeName !== "default"){
                return path.join(this.config.base, moduleNameData.scopeName + "-" + moduleNameData.moduleNameWhitOutScopeName) + "-" + version + ".tar";
            }
            else{
                return path.join(this.config.base, moduleNameData.moduleName) + "-" + version + ".tar";
            }
        }
        else{
            if (moduleNameData.scopeName !== "default"){
                return path.join(this.config.base, moduleNameData.scopeName + "-" + moduleNameData.moduleNameWhitOutScopeName + ".json");
            }
            else{
                return path.join(this.config.base, moduleNameData.moduleName + ".json");
            }
        }
    }

    verifyAndCreateFolder(){
        return new Promise(async (resolve, reject) => {
            fs.stat(this.config.base, (errStat, stats) => {
                if (errStat){
                    if (errStat.code === "ENOENT") {
                        fs.mkdir(this.config.base, function(errCreateDir){
                            if (errCreateDir){
                                reject(errCreateDir);
                            }
                            else{
                                resolve();
                            }
                        })
                    }
                    else{
                        reject(errStat);
                    }
                }
                else{
                    resolve();
                }
            })
        });
    }

    getPackageStore(name: string, version?: string | undefined): Promise<PackageStore | null> {
        return new Promise(async (resolve, reject) => {
            try {
                var filePath = this.getFileName(name, version);
                
                fs.stat(filePath, function(err, stats){
                    if (err){
                        if (err.code === "ENOENT") {
                            resolve(null);
                        }
                        else{
                            reject(new WebFaasError.FileError(err));
                        }
                    }
                    else{
                        let fileEtag = stats.mtime.toISOString();
                        fs.readFile(filePath, function(err, fileBuffer){
                            if (err){
                                reject(new WebFaasError.FileError(err));
                            }
                            else{
                                if (version){
                                    resolve(PackageStoreUtil.buildPackageStoreFromTarBuffer(name, version, fileEtag, fileBuffer));
                                }
                                else{
                                    resolve(PackageStoreUtil.buildPackageStoreFromListBuffer(name, "", fileEtag, [fileBuffer], ["package.json"]));
                                }
                            }
                        });
                    }
                })
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    putPackageStore(packageStore: PackageStore): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                let bufferFile: Buffer | null = null;
                let filePath = this.getFileName(packageStore.getName(), packageStore.getVersion());

                if (packageStore.getVersion()){
                    bufferFile = PackageStoreUtil.convertPackageStoreToTarBuffer(packageStore);
                }
                else{
                    let manifest = packageStore.getManifest();
                    if (manifest){
                        bufferFile = Buffer.from(JSON.stringify(manifest));
                    }
                }

                if (bufferFile){
                    await this.verifyAndCreateFolder();
                    fs.writeFile(filePath, bufferFile, function(errWrite){
                        if (errWrite){
                            reject(new WebFaasError.FileError(errWrite));
                        }
                        else{
                            resolve();
                        }
                    });
                }
                else{
                    resolve();
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }
}