/* istanbul ignore file */

import { IPackageStoreItemData, IPackageRegistryResponse, PackageStore } from "@webfaas/webfaas-core";

export namespace PackageRegistryResponseMock{
    function addItemData(name: string, begin: number, fileBuffer: Buffer, dataPackageItemDataMap: Map<string, IPackageStoreItemData>){
        let itemData = {} as IPackageStoreItemData;
        itemData.begin = begin;
        itemData.name = name;
        itemData.size = fileBuffer.length;
        dataPackageItemDataMap.set(itemData.name, itemData);
        return begin + fileBuffer.length;
    }

    export class Manifest implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string, versions: string[] = ["0.0.1"], description: string = "test"){
            this.etag = "001";
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;
            
            var manifestVersionsObj: any = {};
            for (var i = 0; i < versions.length; i++){
                let version = versions[i];
                manifestVersionsObj[version] = {name:name, version:version, main:"index.js", description: description};
            }
            
            var packageObj = {name:name, main:"index.js", versions: manifestVersionsObj, description: description};
            var packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            this.packageStore = new PackageStore(name, "", this.etag, packageBuffer, dataPackageItemDataMap);
        }
    }

    export class AbstractBase implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string, version: string, description: string, moduleText: string){
            this.etag = "etag" + version;
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;

            let packageObj = {name:name, version:version, main:"index.js", description: description};
            let packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            let file1Buffer = Buffer.from(moduleText);
            nextPos = addItemData("index.js", nextPos, file1Buffer, dataPackageItemDataMap);
    
            var bufferTotal: Buffer = Buffer.concat([packageBuffer, file1Buffer]);
    
            this.packageStore = new PackageStore(name, version, this.etag, bufferTotal, dataPackageItemDataMap);
        }
    }

    export class MathSum extends AbstractBase{
        constructor(name: string = "mathsum", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                module.exports = function(x,y){
                    return x + y
                }
            `

            super(name, version, description, moduleText);
        }
    }

    export class HostName extends AbstractBase{
        constructor(name: string = "hostname", version: string = "0.0.1", description: string = "test"){
            let moduleText = `
                const os = require("os");
                module.exports = function(){
                    return os.hostname();
                }
            `

            super(name, version, description, moduleText);
        }
    }

    export class MathSumAsync implements IPackageRegistryResponse{
        etag: string;
        packageStore: PackageStore | null = null;
    
        constructor(name: string = "mathsumasync", version: string = "0.0.1", dependencies: any = {"@registry1/mathsum": "0.0.1"}, description: string = "test"){
            this.etag = "etag" + version;
            
            var itemData: IPackageStoreItemData;
            var dataPackageItemDataMap: Map<string, IPackageStoreItemData> = new Map<string, IPackageStoreItemData>();
            var nextPos: number = 0;

            let packageObj = {name:name, version:version, main:"index.js", description: description, dependencies: dependencies};
            let packageBuffer = Buffer.from(JSON.stringify(packageObj));
            nextPos = addItemData("package.json", nextPos, packageBuffer, dataPackageItemDataMap);

            let moduleText = `
                Object.defineProperty(exports, "__esModule", { value: true });
                const mathSum = require("@registry1/mathsum");
                function internalsum(event) {
                    return mathSum(event.x, event.y);
                }
                async function sum(event) {
                    return { result: internalsum(event) };
                }
                exports.sum = sum;
            `

            let file1Buffer = Buffer.from(moduleText);
            nextPos = addItemData("index.js", nextPos, file1Buffer, dataPackageItemDataMap);
    
            var bufferTotal: Buffer = Buffer.concat([packageBuffer, file1Buffer]);
    
            this.packageStore = new PackageStore(name, version, this.etag, bufferTotal, dataPackageItemDataMap);
        }
    }
}