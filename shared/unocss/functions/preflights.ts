import { _mergeDefaults } from "../helpers/core";
import { Config, ConfigPick } from "../models/config";
import fs from "node:fs";
import path from "node:path";
import { UserConfig } from "unocss";

/**
 * Get a list of all css files loaded at build time.
 * @param dir directory where all .css files exist
 * @param config configs to operate this function.
 * @return extended unocss config that includes preflights loaded.
 * @affects unocssConfig:{layers, configDeps, preflights}
 * @example
 * makePreflights("src/styles", {unocssConfig: config})
 * // or choose your own prefix
 * makePreflights("src/styles", {unocssConfig: config, ignore: {devFilePrefix: "**"}})
 */
export function Preflights(
    dir: string,
    _unocssConfig: Config["unocssConfig"],
    config?: ConfigPick<"ignore">
): UserConfig {
    const { ignore, unocssConfig } = _mergeDefaults({
        ...config,
        unocssConfig: _unocssConfig,
    });
    const layers = Object.values(unocssConfig.layers);
    fs.readdirSync(path.join(process.cwd(), dir))?.forEach((dirent) => {

        const ds = dirent.split(".css");
        // make sure the file we're loading only `.css` files
        if (ds.length !== 2 || ds[1].length >= 1) {
            console.log("the following is not loaded in preflights -> ", dirent);
            return;
        }

        if (
            ds[0].startsWith(ignore.devFilePrefix) &&
            unocssConfig.envMode !== "dev"
        )
            return;
        const filePath = path.join(dir, dirent);
        const file = fs.readFileSync(filePath, "utf-8");
        unocssConfig.layers[ds[0]] = ++layers[layers.length - 1];
        unocssConfig.configDeps.push(filePath);
        unocssConfig.preflights.push({
            layer: ds[0],
            getCSS: () => file,
        });
    });
    return unocssConfig;
}
