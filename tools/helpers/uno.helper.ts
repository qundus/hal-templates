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
import { UserConfig, mergeDeep, DeepPartial } from "unocss";
import { transformerDirectives } from "unocss";
import type { Keys, KeysMaybe, KeysPick } from ".";

// -- types
/**
 * Config data structure used by functions
 */
type Config = {
  /**
   * to indicate that this config has been merged with
   * defaults.
   * @default false
   */
  mergedDefaults: boolean;
  /** to debug the created classes. */
  debug: Partial<{
    /**
     * used to debug individually created classes.
     * place it right before any rule likeso "*rule-tag".
     * this does not get affected by any of the splits.
     * @default "*"
     */
    id: string;
    /**
     * set the debug style you'd like
     * @default "class"
     */
    style: "on" | "off" | "class";
  }>;
  /** used to conditionalize runtime environment */
  ignore: Partial<{
    /**
     * a prefix string to exlude files, useful to omit dev styles.
     * @default '_'
     */
    devFilePrefix: string;
  }>;
  /** used to affect how rules are created */
  rule: Partial<{
    /**
     * used in front of expression to identify rule
     */
    mainVar: string | undefined;
    /**
     * used by trasnformDirective().
     * @default "@apply"
     */
    directiveVar: "@apply";
    /**
     * any rule created requires the following transformers
     * to be added to unocss config
     * @default ["css-directive","variant-group"]
     */
    transformerDeps: ["css-directive", "variant-group"];
    /**
     * used to create multiple sub groups/variants
     * @default [""]
     * */
    variants: string[];
    /**
     * style that 'variants' get grouped under.
     * @example
     * // assuming mainVar is 'theme' and variants ["li"]
     * // say you created a class theme:(bg-bg)
     * // "variable"
     * [theme="li"] .theme\:\(bg-bg\) {style}
     * // "class"
     * .theme .theme\:\(bg-bg\)-li {style}
     * // "class-attached"
     * .theme-li .theme\:\(bg-bg\) {style}
     * // "variant-prefix"
     * .li-theme\:\(bg-bg\) {style}
     * @default "variable"
     * */
    variantStyle: "variable" | "class" | "class-attached" | "variant-prefix";
    /**
     * used by rules and variants to identify patterns
     * @default "[(]?([^(].+[^)])[)]?"
     */
    expression: RegExp | string;
    /**
     * used to connect rules and variants to patterns
     * @default "[:-]"
     */
    connectors: RegExp | string;
  }>;
  /** used to create regex expressions  */
  regex:
    | ({
        /**
         * used to identify groups or pattern, setting this is highly important
         * to shrink the pool of matches.
         * @example
         * [{ids: "var1|var2"}]
         * [{ids: ["var1","var2"]}]
         * [{ids: ["var1[:-]","var2"]}] <- add regex to it
         */
        ids: string | string[];
      } & Partial<{
        /**
         * name the resulting group so it can be referenced easier
         * later on through string.match(expr).groups
         * @default
         * "group_<index>"
         */
        groupName: string;
        /**
         * a regex to match strings, set to an empty string with idStyle
         *
         */
        match: string;
        idStyle: "inside" | "insideEnd" | "outside" | "outsideEnd";
        optional: boolean;
        idPrefix: string;
        idPostfix: string;
      }>)[]
    | undefined;
  /** used to split patterns */
  splits: Partial<{
    /**
     * splits a pattern into multiple smaller patterns
     * @default ","
     */
    func: string; // splits function params
    /**
     * splits a pattern's input like bg-bg_text-t
     * @default "_"
     */
    param: string; // splits single parameter values
    /**
     * splits a single rule and color pattern
     * @default "-"
     */
    rule: string;
    /**
     * added after group in class, applied when `group` is set.
     * @default "|"
     */
    group: string;
    /**
     * splits actions to define per action pattern
     * @default ":"
     */
    action: string;
    /**
     * splits variants to define subgroups
     * @default ":"
     */
    variant: string;
    /**
     * splits actions to define per action short
     * @default "$"
     */
    actionShort: string;
  }>;
  /** default necessary unocss user configs */
  unocssConfig: UserConfig;
};

/**
 * Used to define default values across methods
 */
const configDefaults: Config = {
  mergedDefaults: true,
  debug: {
    style: "class",
    id: "*",
  },
  ignore: {
    devFilePrefix: "_",
  },
  rule: {
    mainVar: undefined,
    directiveVar: "@apply",
    transformerDeps: ["css-directive", "variant-group"],
    variants: [""],
    variantStyle: "variable",
    expression: "[(]?([^(].+[^)])[)]?",
    connectors: "[:-]",
  },
  regex: undefined,
  splits: {
    func: "[,]|FUNC",
    group: "[|]|GROUP",
    rule: "[-$]",
    param: "[_]",
    action: "[:]",
    actionShort: "[$]",
    variant: ":",
  },
  unocssConfig: {
    variants: [],
    rules: [],
    layers: {
      components: -1,
      default: 1,
      utilities: 2,
    },
  },
};

// -- core
/**
 * Fill in the necessary defaults if user hasn't set those properties,
 * only if mergedDefaults is false to avoid duplicate merging
 */
export function _mergeDefaults(d: DeepPartial<Config>): Config {
  if (d.mergedDefaults) return d as Config;
  if (d && d.splits) {
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

const makeRegex = (
  variables: string[],
  connectors: string,
  variants?: string[],
  sanitizers?: Partial<{
    before: string | "[(]?[\\W]*";
    mid: string;
    after: string | "[\\W]*[)]?";
  }>
) => {
  if (!variables || variables.length <= 0) {
    throw Error(`makeRegex: must have at least one identifying variable`);
  }
  if (!connectors || connectors.length <= 0) {
    throw Error(`makeRegex: must have at least one separating connector`);
  }
  if (!sanitizers) sanitizers = {};
  if (!sanitizers.before) sanitizers.before = "(?<sanitizeBefore>[(]?)";
  if (!sanitizers.after) sanitizers.after = "(?<sanitizeAfter>[)]?)";
  if (!sanitizers.mid) sanitizers.mid = "[^\\W].+[^\\W]";
  connectors = `[${connectors}]`;
  if (!variants || variants[0].length <= 0) variants = [];
  // optimized loop instead of separate .map for each one
  for (let i = 0; i < variables.length || i < variants.length; i++) {
    if (i < variables.length) {
      variables[i] += connectors;
    }
    if (i < variants.length) {
      variants[i] += connectors;
    }
  }
  const expr = new RegExp(
    `^\\b(?<var>${variables.join("|")})` +
      `(?<variant>${variants.join("|")}|)` +
      `${sanitizers.before}(?<pattern>${sanitizers.mid})${sanitizers.after}$`
  );
  return expr;
};

export function _makeRegex(config: Keys<Config, "regex">) {
  const { regex } = _mergeDefaults(config);
  let temp = "";
  return new RegExp(
    regex
      .map((r, i) => {
        let { ids, groupName, idPrefix, idPostfix } = r;
        let { idStyle, optional, match } = r;
        // error checks first
        if (typeof ids !== "string") ids = ids.join("|");
        if (match === undefined) match = ".*?"; // note: the "?" is very important to separate next group
        if (ids.length <= 0 && match.length <= 0)
          throw Error(
            "makeRegex: cannot have an empty ids and match patterns, please provide atleast one."
          );
        // we're good
        idPrefix = idPrefix ? `(?:${idPrefix})` : ``;
        idPostfix = idPostfix ? `(?:${idPostfix})` : ``;
        groupName = groupName ? `(?<${groupName}>` : `(?<group_${i}>`;
        idStyle = idStyle ? idStyle : "outside";
        if (idPrefix.length <= 0 && ids.length <= 0 && idPostfix.length <= 0)
          ids = "";
        else ids = `(?:${idPrefix}(?:${ids})${idPostfix})`;
        // if (ids.match(/^\(\?\:[|]*\s*[|]*\)$/g)) ids = "";

        // start making regex according to style && resetting temp
        temp = optional ? ")?" : ")";
        switch (idStyle) {
          case "inside":
          case "insideEnd":
            temp =
              groupName +
              (idStyle === "inside" ? ids + match : match + ids) +
              temp;
            break;
          default:
          case "outside":
          case "outsideEnd":
            // no need for group if match is empty
            if (match) {
              temp =
                groupName +
                (idStyle === "outside"
                  ? `(?<=${ids})` + match
                  : match + `(?=${ids})`) +
                temp;
            } else {
              temp = "";
            }
            if (optional && ids.match(/\?\:/g)) ids += "?";
            temp = idStyle === "outside" ? ids + temp : temp + ids;
            break;
        }
        // 2 separate conditions in case array has only one element
        if (i === 0) temp = `^${temp}`;
        if (i === regex.length - 1) temp = `${temp}$`;
        return temp;
      })
      .join("")
  );
}

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
  config?: KeysMaybe<Config, "debug" | "splits">
) {
  const { splits, debug } = _mergeDefaults(config);
  let { classes, group, actions } = patterns.match(
    `^(?<classes>.*?)` +
      `((${splits.group})(?<group>.*?)|)` +
      `((${splits.func})(?<actions>.*?)|)$`
  ).groups;
  if (!classes || classes.length <= 0) {
    console.warn(`cant make style because no tags were provided`);
    return "cant make style because no tags were provided";
  }
  if (!group) group = "";
  if (debug.style === "class" && classes.startsWith(debug.id)) {
    debug.style = "on";
    classes = classes.replace(debug.id, "");
  }
  classes = classes.replace(new RegExp(splits.rule, "g"), "-" + group);
  classes = classes.replace(new RegExp(splits.param, "g"), " ");
  if (actions) {
    actions = actions
      .split(new RegExp(splits.func, "g"))
      .map((a) => {
        let { action, short, ownClasses } = a.match(
          new RegExp(
            `^(?<action>.*?)` +
              `((${splits.actionShort})(?<short>.*?)|)` +
              `((${splits.action})(?<ownClasses>.*?)|)$`
          )
        ).groups;
        if (!action || action.length <= 0)
          throw Error("makeClasses: action cannot be undefined.");
        else action += ":";
        if (!short) short = "$" + action.charAt(0);
        if (ownClasses) {
          ownClasses = ownClasses.replace(
            new RegExp(splits.rule, "g"),
            "-" + group
          );
          return ownClasses
            .split(new RegExp(splits.param, "g"))
            .map((o) => (o = action + o + short))
            .join(" ");
        }
        return classes
          .split(" ")
          .map((o) => (o = action + o + short))
          .join(" ");
      })
      .join(" ");
  }

  if (debug.style === "on") {
    console.log("==============");
    console.info("pattern :: ", patterns.replace(debug.id, ""));
    console.info("classes :: ", classes);
    console.info("actions :: ", actions);
    console.info("fullstr :: ", classes, actions);
  }
  return `${classes}${actions ? " " + actions : ""}`;
}

// -- api

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
export function makePreflights(
  dir: string,
  config: KeysPick<Config, "unocssConfig", "ignore">
) {
  const { ignore, unocssConfig } = _mergeDefaults(config);
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
      unocssConfig.envMode === "dev"
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
export function makeThemeRules(
  config: KeysPick<Config, "unocssConfig", "debug" | "rule" | "splits">
) {
  const { unocssConfig, debug, rule, splits } = _mergeDefaults(config);
  // check if needed transformers exist
  {
    const transformersNames = Object.values(unocssConfig.transformers).map(
      (t) => t.name
    );
    rule.transformerDeps.forEach((t) => {
      if (!transformersNames.includes(t)) {
        throw Error(
          "can't make rule without " +
            t +
            " transformer, please add it to your unocss config."
        );
      }
    });
  }
  if (
    !rule.mainVar ||
    rule.mainVar.length <= 0 ||
    rule.mainVar.match(/^[\W]*$/)
  ) {
    console.warn("rule mainVar has been changed to 'theme'");
    rule.mainVar = "theme";
  }
  const ruleExp = new RegExp(
    "^" + rule.mainVar + rule.connectors + rule.expression + "$"
  );
  const variantExp = new RegExp(
    "^_" +
      rule.mainVar +
      rule.connectors +
      `\\b(${rule.variants.join("|")})` +
      rule.connectors +
      rule.expression +
      "$"
  );
  // prepare variants
  rule.variants.forEach((v, i, arr) => {
    if (v.length <= 0) arr[i] = splits.rule;
    else arr[i] = splits.rule + v + splits.rule;
  });
  // add theme layer to main themes
  {
    const layers = Object.values(unocssConfig.layers);
    unocssConfig.layers[rule.mainVar] = layers[layers.length - 1] + 1;
  }
  // make variants
  unocssConfig.variants.push((matcher) => {
    const matches = matcher.match(variantExp);
    if (!matches || !rule.variants.includes(matches[1])) {
      return matcher;
    }
    return {
      matcher: matches[2],
      selector: (s) => {
        if (rule.variantStyle === "class")
          return `.${rule.mainVar} ${s}-${matches[1]}`;
        if (rule.variantStyle === "class-attached")
          return `.${rule.mainVar}-${matches[1]} ${s}`;
        if (rule.variantStyle === "variant-prefix")
          return `.${matches[1]}-${s}`;
        return `[${rule.mainVar}="${matches[1]}"] ${s}`;
      },
    };
  });

  // make rule
  unocssConfig.rules.push([
    ruleExp,
    ([, match]) => {
      const result = { [rule.directiveVar]: ` "` };
      let style = _makeClass(match, { splits, debug }).split(splits.rule);
      if (style.length <= 1) {
        console.warn(
          "theme rule function needs a pattern with a rule" +
            splits.rule +
            "color"
        );
        console.warn("match is :: ", match);
        return result + `"`;
      }
      // ruleVar value doesn't have to be short and/or
      // readable because it's never seen or loaded.
      rule.variants.forEach((t, i) => {
        if (i === 0) result[rule.directiveVar] += `${style.join(t)}`;
        else
          result[rule.directiveVar] +=
            " _" + rule.mainVar + t + "(" + style.join(t) + ")";
      });
      result[rule.directiveVar] += `"`;
      // console.log(result);
      return result;
    },
    { layer: rule.mainVar },
  ]);
  return unocssConfig;
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
