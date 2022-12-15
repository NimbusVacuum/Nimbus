const fs = require("fs");
const crypto = require("crypto");
const packageJson = require("../package.json");

const manifest = {
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    sha256sums: {

    }
}

const binaries = {
    "nimbus-armv7": "./build/armv7/nimbus",
    "nimbus-armv7-lowmem": "./build/armv7/nimbus-lowmem",
    "nimbus-aarch64": "./build/aarch64/nimbus",

    "nimbus-armv7.upx": "./build/armv7/nimbus.upx",
    "nimbus-armv7-lowmem.upx": "./build/armv7/nimbus-lowmem.upx",
    "nimbus-aarch64.upx": "./build/aarch64/nimbus.upx",
}

Object.values(binaries).forEach((path, i) => {
    const name = Object.keys(binaries)[i];

    try {
        const bin = fs.readFileSync(path);
        const checksum = crypto.createHash("sha256");
        checksum.update(bin);

        manifest.sha256sums[name] = checksum.digest("hex");
    } catch(e) {
        if(e.code === "ENOENT") {
            console.warn(`Couldn't find ${name} at ${path}`);
        } else {
            console.error(e);
        }
    }
})

if (process.argv.length > 2 && process.argv[2] === "nightly") {
    manifest.version = "nightly";

    try {
        manifest.changelog = fs.readFileSync("./build/changelog_nightly.md").toString();
    } catch(e) {
        //intentional
    }
}

fs.writeFileSync("./build/nimbus_release_manifest.json", JSON.stringify(manifest, null, 2))
