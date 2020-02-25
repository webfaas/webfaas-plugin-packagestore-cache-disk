/* istanbul ignore file */

import { IPackageRegistry, IPackageRegistryResponse } from "@webfaas/webfaas-core";
import { PackageRegistryResponseMock } from "./PackageRegistryResponseMock";

export namespace PackageRegistryMock{
    abstract class AbstractPackageRegistry implements IPackageRegistry {
        public listPackageRegistryResponse: Map<string, IPackageRegistryResponse> = new Map<string, IPackageRegistryResponse>();
        
        abstract getTypeName(): string

        getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse> {
            return new Promise((resolve, reject)=>{
                let responseObj = this.listPackageRegistryResponse.get(name);
                if (responseObj){
                    resolve(responseObj);
                }
                else{
                    let responseNotFoundObj = {} as IPackageRegistryResponse;
                    responseNotFoundObj.packageStore = null;
                    responseNotFoundObj.etag = "";
                    resolve(responseNotFoundObj);
                }
            });
        }
        
        getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse>{
            return new Promise((resolve, reject)=>{
                let responseObj = this.listPackageRegistryResponse.get(name + ":" + version) || null;
                if (responseObj){
                    resolve(responseObj);
                }
                else{
                    let responseNotFoundObj = {} as IPackageRegistryResponse;
                    responseNotFoundObj.packageStore = null;
                    responseNotFoundObj.etag = "";
                    resolve(responseNotFoundObj);
                }
            });
        }

        async start() {
        }

        async stop() {
        }
    }
    
    export class PackageRegistry1 extends AbstractPackageRegistry {
        getTypeName(): string{
            return "REGISTRY1";
        }
        
        constructor(){
            super();
            let nameMathSum:string = "@registry1/mathsum";
            let nameMathSumAsync:string = "@registry1/mathsumasync";
            let nameHostName:string = "@registry1/hostname";

            let description: string = "registry1 mock";

            this.listPackageRegistryResponse.set(nameMathSum, new PackageRegistryResponseMock.Manifest(nameMathSum, ["0.0.1", "0.0.2", "0.0.3"], description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.1", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.1", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.2", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.2", description));
            this.listPackageRegistryResponse.set(nameMathSum + ":0.0.3", new PackageRegistryResponseMock.MathSum(nameMathSum, "0.0.3", description));

            this.listPackageRegistryResponse.set(nameMathSumAsync, new PackageRegistryResponseMock.Manifest(nameMathSumAsync, ["1.0.0", "2.0.0"], description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":1.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "1.0.0", {"@registry1/mathsum": "0.0.1"}, description));
            this.listPackageRegistryResponse.set(nameMathSumAsync + ":2.0.0", new PackageRegistryResponseMock.MathSumAsync(nameMathSumAsync, "2.0.0", {"@registry1/mathsum": "0.*"}, description));

            this.listPackageRegistryResponse.set(nameHostName, new PackageRegistryResponseMock.Manifest(nameHostName, ["0.0.1"], description));
            this.listPackageRegistryResponse.set(nameHostName + ":0.0.1", new PackageRegistryResponseMock.HostName(nameHostName, "0.0.1", description));
        }
    }
}