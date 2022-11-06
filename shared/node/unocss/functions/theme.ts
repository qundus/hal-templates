import { deepMerge } from "@-/shared.node.abstracts";
import { UserConfig } from "unocss";
import { Config } from "../models/config";

export function Theme(_unocssConfig: Config["unocssConfig"]): UserConfig {
    const theme = {
        breakpoints: {
            // When the width is between 600px and 900px OR above 1100px - change the appearance of <div>
            // @media screen and (max-width: 900px) and (min-width: 600px), (min-width: 1100px)
            sm: { min: "0px", max: "640px" }, // phones
            md: {
                raw: "screen and (min-width: 641px) and (max-width: 768px) and (orientation: portrait)",
            }, // 768px, tablet portrait
            md_land: {
                raw: "screen and (min-width: 641px) and (max-width: 768px) and (orientation: landscape)",
            }, // 768px, tablet landscape
            lg: { min: "769px", max: "1024px" }, // desktops
        }
    };

    if (_unocssConfig.theme)
        _unocssConfig.theme = deepMerge(theme, _unocssConfig.theme);
    else
        _unocssConfig.theme = theme;

    return _unocssConfig;
}