/**
 * unocss helpers by github.com/neod3v
 * @author neod3v
 * useful links:
 * https://regex101.com/r/YAEZTX/24
 * https://devhints.io/jsdoc
 * https://jsdoc.app/index.html#block-tags
 */
import { Theme } from "@unocss/preset-mini";
import fs from "node:fs";
import path from "node:path";
import {
  Preflight,
  Variant,
  Rule,
  UserConfig,
  mergeDeep,
  DeepPartial,
} from "unocss";
import { transformerDirectives } from "unocss";
import type { PartialK } from ".";

// -- types
/**
 * Config data structure used by functions
 */
type Config = {
  /** [default="_"]
   * <pre/> a prefix string to exlude files, useful to omit dev styles.  */
  ignoreFilePrefix: string;
  /** to debug the created classes. */
  debug: Partial<{
    /** [default="*"]
     * <pre/> used to debug individually created classes.
     * place it right before any rule likeso "*rule-tag".
     * this does not get affected by any of the splits.
     */
    id: string;
    /** [default="off"]
     * <pre/> set the debug style you'd like
     */
    style: "all" | "class" | "off";
  }>;
  theme: Partial<{
    mainVar: string;
    ruleExp: RegExp;
    /**
     * <pre/> expression to find the _theme function.
     */
    _ruleExp: RegExp;
    variantExp: RegExp;
  }>;
  /** used to split patterns */
  splits: Partial<{
    /** [default=","]
     * <pre/> splits a pattern into multiple smaller patterns  */
    func: string; // splits function params
    /** [default="_"]
     * <pre/> splits a pattern's input like bg-bg_text-t  */
    param: string; // splits single parameter values
    /** [default="$"]
     * <pre/> splits a single rule and color pattern  */
    rule: string;
    /** [default="-"]
     * <pre/> added after group in class, applied when `group` is set. */
    group: string;
    /** [default=":"]
     * <pre/> splits actions to define per action pattern  */
    action: string;
    /** [default="$"
     * <pre/> splits actions to define per action short  */
    actionShort: string;
  }>;
  /** default necessary unocss user configs */
  unocssConfig: UserConfig;
};

/**
 * Used to define default values across methods
 */
const configDefaults: Config = {
  ignoreFilePrefix: "_",
  debug: {
    style: "off",
    id: "*",
  },
  theme: {
    mainVar: "theme",
  },
  splits: {
    func: ",",
    param: "_",
    rule: "-",
    group: "|",
    action: ":",
    actionShort: "$",
  },
  unocssConfig: {
    layers: {
      components: -1,
      default: 1,
      utilities: 2,
    },
  },
};

// -- core
/**
 * Fill in the necessary defaults if user hasn't set those properties.
 */
export function _setDefaults(d: DeepPartial<Config>): Config {
  if (d.splits) {
    Object.keys(d.splits).forEach((k) => {
      if (d.splits[k] === undefined || d.splits[k].length <= 0) {
        console.warn(`${k} splitter cannot be of zero length, 
        this may lead to memory leaks and/or maximization.`);
        d.splits[k] = configDefaults.splits[k];
      }
    });
  }
  return mergeDeep(configDefaults, d);
}

/**
 * Create a single unocss class.
 * @param p pattern string to formulate unocss class
 * @param s the splitter used to separate rule from tag
 * @param i the current index of the pattern if any.
 * @param g group to add to filler if any.
 * @param a the action shortcut if any.
 * @returns a single unocss class.
 */
const _makeStyle = (
  p: string,
  s: string,
  i?: number,
  g?: string,
  a?: string
) => {
  let [rule, tag] = p.split(s);
  if (!rule || !tag) {
    console.warn(`style pattern can only have 2 tags split 
    by ${s} in the form "rule${s}tag"`);
    return " ";
  }
  if (i && i !== 0) rule = ` ${rule}`;
  return `${rule}${s}${g ? g : ""}${tag}${a ? a : ""}`;
};

/**
 * Make a unocss class string.
 * @param patterns patterns split by config.splits.func
 * @param config main options to manipulate how the underlying functions work;
 * @returns a class string to be scanned by unocss.
 * @example
 * // "bg-bg"
 * makeClass("bg$bg")
 * // "bg-bg text-t"
 * makeClass("bg$bg_text$t")
 * // "bg-bg hover:bg-bg$h"
 * makeClass("bg$bg,hover")
 * // "bg-bg hover:bg-bg_ho"
 * makeClass("bg$bg,hover$_ho")
 * // "bg-bg hover:bg-bg_ho active:bg-bg$a"
 * makeClass("bg$bg,hover$_ho,active")
 * // "bg-bg"
 * makeClass("bg_bg", {splits: {rule: "_"}})
 */
export function _makeClass(
  patterns: string,
  config?: Partial<PartialK<Config, "debug" | "splits">>
) {
  const { splits, debug } = _setDefaults(config);
  let classes = "";
  let actions = "";
  patterns.split(splits.func).forEach((p, i) => {
    // main classes
    if (i === 0) {
      let [pattern, group] = p.split(splits.group);
      group = group ? group : "";
      // check if it starts with the debugging string and clean it off
      if (debug.style === "class" && pattern.startsWith(debug.id)) {
        pattern = pattern.replace(debug.id, "");
        classes += debug.id + " ";
      }
      pattern.split(splits.param).forEach((t, i) => {
        classes += _makeStyle(t, splits.rule, i, group);
      });
    } else {
      // actions
      const [actionAndShort, ownPatterns] = p.split(splits.action);
      let [action, short] = actionAndShort.split(splits.actionShort);
      if (!short) short = splits.actionShort + action.charAt(0);
      if (ownPatterns) {
        let [pattern, group] = ownPatterns.split(splits.group);
        group = group ? group : "";
        pattern.split(splits.param).forEach((t, i) => {
          if (i !== 0) actions += " ";
          actions +=
            action +
            splits.action +
            _makeStyle(t, splits.rule, null, group, short);
        });
      } else {
        classes.split(" ").forEach((t, i) => {
          if (i !== 0) actions += " ";
          actions += action + splits.action + t + short;
        });
      }
    }
  });
  if (classes.length <= 0) {
    console.warn(`cant make style because no tags were provided`);
    return "cant make style because no tags were provided";
  }
  if (
    debug.style === "all" ||
    (debug.style === "class" && classes.startsWith(debug.id))
  ) {
    classes = classes.replace(debug.id + " ", "");
    console.log("==============");
    console.info("pattern :: ", patterns.replace(debug.id, ""));
    console.info("classes :: ", classes);
    console.info("actions :: ", actions);
    console.info("fullstr :: ", classes, actions);
  }
  return `${classes} ${actions}`;
}

// -- api

/**
 * affects: `(layers, configDeps, preflights)`
 * <pre/> Get a list of all css files loaded at build time.
 * @param config unocss configs to append data generated by this function to.
 * @param dir directory where all .css files exist
 * @return extended unocss config that includes preflights loaded.
 * @example
 * makePreflights("src/styles", {unocssConfig: config})
 * // or choose your own prefix
 * makePreflights("src/styles", {unocssConfig: config, ignoreFilePrefix: "__"})
 */
export function makePreflights(
  dir: string,
  config: PartialK<Config, "unocssConfig"> &
    Partial<PartialK<Config, "ignoreFilePrefix">>
) {
  const { ignoreFilePrefix, unocssConfig } = _setDefaults(config);
  const layers = Object.values(unocssConfig.layers);
  fs.readdirSync(path.join(process.cwd(), dir))?.forEach((dirent) => {
    const ds = dirent.split(".css");
    // make sure the file we're loading only `.css` files
    if (ds.length !== 2 || ds[1].length >= 1) {
      console.log("the following is not loaded in preflights -> ", dirent);
      return;
    }
    if (ds[0].startsWith(ignoreFilePrefix) && unocssConfig.envMode === "dev")
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

/**
 * Create a theme function that could be scanned by unocss through variants and rules.
 * - PS: don't forget to `\<html theme="li">` to dynamically change theme
 * * - say separator and cssVar:
 * > "-m-", "--apply"
 * - say themes:
 * > "li da".split(" ")
 * - say theme.colors:
 * > {li: {bg: white, bg$h: black}, da: {bg:black, bg$h: white}}
 * - then use them in your app like so:
 * examples (theme function):
 * > /<tag class="theme:(bg-m-bg)" />
 * > /<tag class="theme:(bg-bg)" /> <- or without explicit separator
 * - generates -> { '--apply': 'bg-li-bg __theme:da:(bg-da-bg) __theme:ri:(bg-ri-bg)' }
 * examples (_theme function):
 * > /<tag class="_theme:(bg$bg)" />
 * > /<tag class="_theme:(bg$bg)" />
 * - this will generate the following classes
 * > bg-li-bg theme:da:(bg-da-bg)
 * - to add hovering colors just add action to class, like so: class="_theme(bg$bg,hover)"
 * > bg-li-bg hover:(bg-li-bg$h) theme:da:(bg-da-bg hover:(bg-da-bg$h))
 * - change action separator, class="_theme(bg$bg,hover$___)"
 * > bg-li-bg hover:(bg-li-bg___h) theme:da:(bg-da-bg hover:(bg-da-bg___h))
 * - change action short, class="_theme(bg$bg,hover:hov)"
 * > bg-li-bg hover:(bg-li-bg$hov) theme:da:(bg-da-bg hover:(bg-da-bg$hov))
 * - add specific action rules, class="_theme(bg$bg,hover:bg$t)"
 * > bg-li-bg hover:(bg-li-t$h) theme:da:(bg-da-bg hover:(bg-da-t$h))
 * - chain patterns or actions, class="_theme(bg$bg_text$t,hover$-:ho:bg$t_active)"
 * @param config unocss configs to append data generated by this function to.
 * @param ruleVar css variable to apply classes, affected by transformerDirectives. (default=--apply)
 * @param themes theme names, usually the same as in theme.colors in config file,
 * first theme is default
 * @param globalVar the variable that's going to be used at the very top tag
 * `HTML` to change theme of app as well as creating the rules and variant,
 * like `theme` -> <html theme="li"> where li is passed in themes array.
 * (default=theme)
 * @param separator custom filler to be replaced by theme names later on,
 * make it short so you can create shorter templates like "M" -> class="theme:(bg-M-bg)"
 * @param splits splitters used to destructure function.
 * @param ruleExp expression to find the _theme function,
 * this one simply replaces the provided filler with theme names.
 * @param _ruleExp
 * @param variantExp expression through which unocss will find theme classes
 * @returns theme variant and rule-set to be added to unocss's config.
 */
export function makeTheme(
  config: UserConfig,
  ruleVar: string,
  globalVar?: string,
  separator?: string,
  // splits?: Splitters,
  ruleExp?: RegExp,
  _ruleExp?: RegExp,
  variantExp?: RegExp
): UserConfig {
  const themes = [];
  if (!(config.theme as Theme).colors) {
    console.warn("themes have not been added to your config");
    console.warn("make sure you setup themes.colors");
    return config;
  } else {
    const values = Object.values(!(config.theme as Theme).colors);
    console.log(values);
    return config;
  }

  if (!themes || themes.length <= 0) {
    throw "must pass at least one theme name";
  }
  // splits = { ...configDefaults.splits, ...splits };
  // const expr = `[(]?([^(].+[^)])[)]?`;
  // const conns = "[:-]";
  // if (!separator) separator = splits.rule;
  // if (!globalVar) globalVar = configDefaults.themeVar;
  // if (!ruleExp) ruleExp = new RegExp(`^${globalVar}${conns}${expr}$`);
  // if (!_ruleExp) _ruleExp = new RegExp(`^_${globalVar}${conns}${expr}$`);
  // if (!variantExp)
  //   variantExp = new RegExp(
  //     `^__${globalVar}${conns}\\b(${themes.join("|")})${conns}${expr}$`
  //   );

  // const idx = 1;
  // console.log("===============", ruleExp);
  // console.log(`// ${variantVar}:(bg$bg)`.match(ruleExp));
  // console.log(`${variantVar}:((bg$bg)`.match(ruleExp));
  // console.log(`${variantVar}:(bg$bg))`.match(ruleExp));
  // console.log(`${variantVar}:(bg$bg)`.match(ruleExp));
  // console.log(`${variantVar}:bg$bg`.match(ruleExp));
  // console.log(`${variantVar}:`.match(ruleExp));
  return config;
  // variant: (matcher) => {
  //   const matches = matcher.match(variantExp);
  //   if (!matches || !themes.includes(matches[1])) {
  //     return matcher;
  //   }
  //   // console.log("from theme variant ::", matches[1]);
  //   return {
  //     matcher: matches[2],
  //     selector: (s) => {
  //       return `.${matches[1]} ${s}`;
  //       // return `[${globalVar}="${matches[1]}"] ${s}`;
  //     },
  //   };
  // },
  // rules: [
  //   [
  //     ruleExp,
  //     ([, match]) => {
  //       const result = { [ruleVar]: ` "` };
  //       let style = match.split(separator);
  //       if (style.length <= 1) {
  //         console.warn(
  //           `theme function needs casual unocss classes where fillers are
  //           going to replaced by theme names, pass something like class="${globalVar}:rule${separator}color"`
  //         );
  //         console.warn("match is :: ", match);
  //         return result;
  //       }
  //       // ruleVar value doesn't have to be short and/or
  //       // readable because it's never seen or loaded.
  //       themes.forEach((t, i) => {
  //         t = `${splits.rule}${t}${splits.rule}`;
  //         if (i === 0) result[ruleVar] += `${style.join(t)}`;
  //         else result[ruleVar] += ` __theme:${t}:(${style.join(t)})`;
  //       });
  //       result[ruleVar] += `"`;
  //       // console.log(result);
  //       return result;
  //     },
  //     { layer: globalVar },
  //   ],
  //   [
  //     _ruleExp,
  //     ([, match]) => {
  //       const result = { [ruleVar]: ` "` };
  //       let style = makeWhole(match, defaults.filler, splits).split(
  //         defaults.filler
  //       );
  //       if (style.length <= 1) {
  //         console.warn(
  //           `theme rule function needs a pattern with a rule${splits.tag}color`
  //         );
  //         console.warn("match is :: ", match);
  //         return result;
  //       }
  //       // ruleVar value doesn't have to be short and/or
  //       // readable because it's never seen or loaded.
  //       themes.forEach((t, i) => {
  //         if (i === 0) result[ruleVar] += `${style.join(t)}`;
  //         else result[ruleVar] += ` __theme:${t}:(${style.join(t)})`;
  //       });
  //       result[ruleVar] += `"`;

  //       // console.log(result);
  //       return result;
  //     },
  //     { layer: globalVar },
  //   ],
  // ],
}

/**
 * Create unocss shortcuts and safelists.
 * @param id will be added before every style function name
 * @param replacers put between utility and tag like `light` to identify light theme for example
 * @param styles build styles according and let unocss handle the rest,
 * start by naming the function you want then add basic windicss class atributes.
 * examples (with light theme only "li"):
 * - light theme text color and background:
 *  >["app-", "bg$bg_text$t"] -> ` bg-li-bg text-li-t `
 * - text light theme with hover:
 *  >["select-", "text$t", "hover"] -> ` text-li-t hover:text-li-t$h ` <-
 * - tell it that you defined `hov` as the short for hover in your windi.config:
 *  >["code-", "text$t", "hover:hov"] -> ` text-li-t hover:text-li-t$hov `
 * - define multiple actions|variants:
 *  >["app-", "border$b", "hover:h_active:ac"] -> ` border-li-t hover:border-li-t$h active:border-li-b$ac `
 * - when tags are under certain groups
 *  >["app-", "bg$bg", undefined, "btn"] -> ` bg-li-btn-bg `
 * - specify other tags for actions
 *  >["app-", "bg$bg", "hover:text$t,border$bg", "btn"] ->
 * ` bg-li-btn-bg hover:(text-li-btn-t$h border-li-btn-bg)`
 * @returns
 */
//  export function makeShortcuts(
//   id: string,
//   replacers: string[],
//   styles: [
//     key: string,
//     pattern: string,
//     actions?: string | undefined,
//     group?: string | undefined
//   ][],
//   splits?: Splitters,
//   filler?: string
// ): { safelist: string[]; shortcuts: { [key: string]: string } } {
//   const result = {};
//   splits = { ...configDefaults.splits, ...splits };
//   if (!filler) filler = configDefaults.filler;
//   styles.forEach((s) => {
//     const key = s[0];
//     s.shift();
//     // adding spaces before and after to avoid clashing with other user defined styles
//     const style = ` ${makeWhole(s.join(splits.func), filler, splits)} `;
//     // making the shortcut
//     if (replacers) {
//       replacers.forEach((sep) => {
//         result[`${id}${s[0]}${sep}`] = style
//           .split(configDefaults.filler)
//           .join(sep);
//       });
//     } else {
//       result[`${id}${s[0]}`] = style.split(configDefaults.filler).join("");
//     }
//   });
//   return {
//     safelist: Object.keys(result),
//     shortcuts: result,
//   };
// }
