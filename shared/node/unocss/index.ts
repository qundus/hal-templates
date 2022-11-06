/**
 * unocss config style and theming by github.com/qundus
 * @author qundus
 */
import { join } from "node:path";
import { defineConfig, UserConfig } from "unocss";
import { Preflights } from "./functions/preflights";
import { Presets } from "./functions/presets";
import { ThemeRule } from "./functions/rules/theme";
import { Shortcuts } from "./functions/shortcuts";
import { Theme } from "./functions/theme";
import { Transformers } from "./functions/transformers";
import { Config, ConfigPick } from "./models/config";


export default function BaseConfig(userConfig: UserConfig) {
  return {
    /**
     * collect and load .css style files from path
     * @param pathToCssFiles path to css folder
     */
    Preflights(config?: ConfigPick<"ignore">, ...pathToCssFiles: string[]) {
      const path = join(...pathToCssFiles);
      userConfig = Preflights(path, userConfig, config);
      return this;
    },
    Presets() {
      userConfig = Presets(userConfig);
      return this;
    },
    Shortcuts() {
      userConfig = Shortcuts(userConfig);
      return this;
    },
    Theme() {
      userConfig = Theme(userConfig);
      return this;
    },
    Transformers() {
      userConfig = Transformers(userConfig);
      return this;
    },
    ThemeRule(_rule: Config["rule"], config?: ConfigPick<"debug" | "splits">) {
      userConfig = ThemeRule(_rule, userConfig, config);
      return this;
    },
    finalize() {
      return defineConfig(userConfig);
    },
  };
}