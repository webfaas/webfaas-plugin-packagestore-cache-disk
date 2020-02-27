# WebFaas - Plugin - PackageRegistry - Cache - Disk

WebFaaS Plugin for [node](http://nodejs.org).

[![NPM Version][npm-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

### Config - Complete
```json
{
    "registry.cache": [
        {
            "base": "[folder cache]"
        }
    ]
}
```

### Example
```javascript
"use strict";

import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import { ModuleManager, Core } from "@webfaas/webfaas-core";

import { PackageStoreCache } from "../lib/PackageStoreCache";
import { PackageRegistryMock } from "../test/mocks/PackageRegistryMock";


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
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/@webfaas/webfaas-plugin-packagestore-cache-disk.svg
[npm-url]: https://npmjs.org/package/@webfaas/webfaas-plugin-packagestore-cache-disk

[travis-image]: https://img.shields.io/travis/webfaas/webfaas-plugin-packagestore-cache-disk/master.svg?label=linux
[travis-url]: https://travis-ci.org/webfaas/webfaas-plugin-packagestore-cache-disk

[coveralls-image]: https://img.shields.io/coveralls/github/webfaas/webfaas-plugin-packagestore-cache-disk/master.svg
[coveralls-url]: https://coveralls.io/github/webfaas/webfaas-plugin-packagestore-cache-disk?branch=master