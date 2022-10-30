import {
    presetUno,
    presetAttributify,
    presetIcons,
    UserConfig
} from "unocss";
import { Config } from "../models/config";

export function Presets(_unocssConfig: Config["unocssConfig"]): UserConfig {

    const presets: typeof _unocssConfig.presets = [
        presetUno({
            // prefix: "-",
        }),
        presetAttributify({
            prefix: "_",
            prefixedOnly: true,
            // separator: ":",
            // nonValuedAttribute: false,
        }),
        presetIcons({
            //   scale: 1.2,
            //   cdn: "https://esm.sh/",
        }),
    ];

    if (_unocssConfig.presets) {
        // if preset already setup by user, replace it
        _unocssConfig.presets.forEach((x: any) => {
            const idx = presets.findIndex((z: any) => z.name === x.name);
            if (idx >= 0) {
                presets[idx] = x;
            }
        });
    }

    _unocssConfig.presets = presets;
    return _unocssConfig;
} 