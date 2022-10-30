import { SourceCodeTransformer, UserConfig } from "unocss";
import { Config } from "../models/config";
import {
    transformerDirectives,
    transformerVariantGroup
} from "unocss";

export function Transformers(_unocssConfig: Config["unocssConfig"]): UserConfig {
    const transformers: SourceCodeTransformer[] = [
        transformerDirectives({ varStyle: "--" }),
        transformerVariantGroup({ separators: [":", "-"] }),
    ];
    if (_unocssConfig.transformers)
        transformers.push(..._unocssConfig.transformers);
    _unocssConfig.transformers = transformers;
    return _unocssConfig;
}