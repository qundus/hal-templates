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
import unocss, { UserConfig, mergeDeep, DeepPartial } from "unocss";
import { transformerDirectives } from "unocss";
import type { DeepVoid, FilterKeysOf, Pick } from ".";
import { deepMerge } from ".";

// -- types
/**
 * Used to define config type as well as default values
 * across methods.
 */
const configDefaults = {
  /**
   * to indicate that this config has been merged with
   * defaults.
   * @default true
   */
  mergedDefaults: true as boolean,
  /** to debug the created classes. */
  debug: {
    /**
     * used to debug individually created classes.
     * place it right before any rule likeso "*rule-tag".
     * this does not get affected by any of the splits.
     * @default "*"
     */
    id: "*",
    /**
     * set the debug style you'd like
     * @default "class"
     */
    style: "class" as "on" | "off" | "class",
  },
  /** used to conditionalize runtime environment */
  ignore: {
    /**
     * a prefix string to exlude files, useful to omit dev styles.
     * @default '_'
     */
    devFilePrefix: "_",
  },
  /** used to affect how rules are created */
  rule: {
    /**
     * used in front of expression to identify rule
     */
    mainVar: undefined as string | void,
    /**
     * used by trasnformDirective().
     * @default "--apply"
     */
    directiveVar: "--apply",
    /**
     * any rule created requires the following transformers
     * to be added to unocss config
     * @default ["css-directive","variant-group"]
     */
    transformerDeps: ["css-directive", "variant-group"] as [
      "css-directive",
      "variant-group"
    ],
    /**
     * used to create multiple sub groups/variants
     * @default ""
     * */
    variants: "" as string | string[],
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
    variantStyle: "variable" as
      | "variable"
      | "class"
      | "class-attached"
      | "variant-prefix",
    /**
     * used to connect rules and variants to patterns,
     * could be a RegExp.
     * @default "[:-]"
     */
    connectors: "[:-]" as string,
  },
  /** used to create regex expressions  */
  regex: {
    /**
     * @type {?string | ?string[]}
     * used to identify groups or pattern, setting this is highly important
     * to shrink the pool of matches and they are omitted from match array
     * unless `idStyle=inside|insideEnd`.
     * @example
     * [{ids: "var1|var2"}]
     * [{ids: ["var1","var2"]}]
     * [{ids: ["var1[:-]","var2"]}] <- add regex to it
     */
    ids: undefined as string | string[] | void,
    /**
     * name the resulting group so it can be referenced easier
     * later on through string.match(expr).groups
     * @default
     * "group_<index>"
     */
    groupName: undefined as string | "numberGroup",
    /**
     * the main group matching string, set to an empty string with
     * idStyle 'outside' to completely remove the group
     * @default
     * ".*?" // match everything except next group ids if any
     */
    match: ".*?" as string | ".*?" | ".+?",
    /**
     * make this group optional, if set, regex match would allow
     * for it to be skipped and matched only if ids and are there.
     * @default
     * false
     */
    optional: false as boolean,
    /**
     * ids are the identefying parts of the group, these styles let you
     * choose whether to include them in group or not.
     * - "inside" match ids inside of group before 'match'
     * <pre/> (?<group>(ids)match)
     * - "insideEnd" match ids inside of group after 'match'
     * <pre/> (?<group>match(ids))
     * - "outside" match ids outside before group
     * <pre/> (ids)(?<group>(?<=(ids))match)
     * - "outsideEnd" match ids outside after group
     * <pre/> (?<group>match(?=(ids)))(ids)
     * @default
     * "outside"
     */
    idStyle: "outside" as "inside" | "insideEnd" | "outside" | "outsideEnd",
    /**
     * prefix all ids with certain regex pattern.
     */
    idPrefix: "",
    /**
     * postfix all ids with certain regex pattern.
     */
    idPostfix: "",
    /**
     * regex line beginning character
     * @default "^"
     */
    lineStart: "^",
    /**
     * regex line ending character
     * @default "$"
     */
    lineEnd: "$",
  },
  /** used to split patterns */
  splits: {
    /**
     * splits a pattern into multiple smaller patterns
     * @default "[,]|FUNC"
     */
    func: "[,]|FUNC" as string,
    /**
     * added after group in class, applied when `group` is set.
     * @default "[|]|GROUP"
     */
    group: "[|]|GROUP" as string,
    /**
     * splits a single rule and color pattern
     * @default "[-$]"
     */
    rule: "[-$]" as string,
    /**
     * splits a pattern's input like bg-bg_text-t
     * @default "[_]"
     */
    param: "[_]" as string,
    /**
     * splits actions to define per action pattern
     * @default "[:]"
     */
    action: "[:]" as string,
    /**
     * splits actions to define per action short
     * @default "[$]"
     */
    actionShort: "[$]" as string,
    /**
     * splits variants to define subgroups
     * @default ":"
     */
    variant: ":" as string,
  },
  /** default necessary unocss user configs */
  unocssConfig: {
    variants: [],
    rules: [],
    preflights: [],
    configDeps: [],
    layers: {
      components: -1,
      default: 1,
      utilities: 2,
    },
  } as UserConfig,
};
type Config = DeepVoid<
  typeof configDefaults,
  UserConfig,
  never
  // "unocssConfig"
>;
type ConfigPick<
  T extends keyof Config,
  Q extends "include required" | "omit required" = "include required"
> = Pick<Config, T, "omit required">;

/**
 * Fill in the necessary defaults if user hasn't set those properties,
 * only if mergedDefaults is false to avoid duplicate merging
 */
export function _mergeDefaults(d: Config) {
  if (d) {
    if (d.mergedDefaults) return d;
    if (d.splits) {
      Object.keys(d.splits).forEach((k) => {
        if (d.splits[k] === undefined || d.splits[k].length <= 0) {
          console.warn(`${k} splitter cannot be of zero length,
          this may lead to memory leaks and/or maximization.`);
          d.splits[k] = configDefaults.splits[k];
        }
      });
    }
  }
  return deepMerge(configDefaults as Config, d);
}

/**
 * Format a regex string with simple options.
 * @param regex an ordered array of options that make up the final RegExp
 * @returns a formatted regex string
 */
export function _makeRegex(regex: Config["regex"][]) {
  let temp = "";
  return new RegExp(
    regex
      .map((r, i) => {
        let { ids, groupName, idPrefix, idPostfix } = r;
        let { idStyle, optional, match } = r;
        let { lineStart, lineEnd } = r;
        // error checks first
        if (typeof ids !== "string") ids = ids.join("|");
        if (match === undefined) match = ".*?"; // note: the "?" is very important to separate next group
        if (ids.length <= 0 && match.length <= 0)
          throw Error(
            "makeRegex: cannot have an empty ids and match patterns, please provide atleast one."
          );
        // we're good
        if (lineStart === undefined) lineStart = "^";
        if (lineEnd === undefined) lineEnd = "$";
        idPrefix = idPrefix ? `(?:${idPrefix})` : ``;
        idPostfix = idPostfix ? `(?:${idPostfix})` : ``;
        groupName = groupName ? `(?<${groupName}>` : `(?<group_${i}>`;
        idStyle = idStyle ? idStyle : "outside";
        if (idPrefix.length <= 0 && ids.length <= 0 && idPostfix.length <= 0)
          ids = "";
        else ids = `${idPrefix}${ids ? `(?:${ids})` : ""}${idPostfix}`;
        // if (ids.match(/\?\:/g)) ids = `(?:${ids})`;
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
                  ? (ids ? `(?<=${ids})` : "") + match
                  : match + (ids ? `(?=${ids})` : "")) +
                temp;
            } else {
              temp = "";
            }
            if (optional && ids.match(/\?\:/g)) ids += "?";
            temp = idStyle === "outside" ? ids + temp : temp + ids;
            break;
        }
        // 2 separate conditions in case array has only one element
        if (i === 0) temp = `${lineStart}${temp}`;
        if (i === regex.length - 1) temp = `${temp}${lineEnd}`;
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
 * makeClass("bg_bg", {splits: {rule: "[_]"}})
 */
export function _makeClass(
  patterns: string,
  config?: ConfigPick<"debug" | "splits">
) {
  const { splits, debug } = _mergeDefaults(config);
  let { classes, group, actions } = patterns.match(
    _makeRegex([
      {
        ids: "",
        groupName: "classes",
      },
      {
        ids: "",
        idPrefix: splits.group,
        groupName: "group",
        optional: true,
      },
      {
        ids: "",
        idPrefix: splits.func,
        groupName: "actions",
        optional: true,
      },
    ])
  )?.groups;
  if (!classes || classes.length <= 0) {
    console.warn(`cant make style because no tags were provided`);
    return "cant make style because no tags were provided";
  }
  if (!group) group = "";
  if (debug.style !== "off" && classes.startsWith(debug.id)) {
    debug.style = "on";
    classes = classes.replace(debug.id, "");
  }
  // make base classes
  classes = classes.replace(new RegExp(splits.rule, "g"), "-" + group);
  classes = classes.replace(new RegExp(splits.param, "g"), " ");
  // loop actions if any
  if (actions) {
    actions = actions
      .split(new RegExp(splits.func, "g"))
      .map((a) => {
        let { action, short, ownClasses } = a.match(
          _makeRegex([
            {
              ids: "",
              groupName: "action",
            },
            {
              ids: "",
              idPrefix: splits.actionShort,
              groupName: "short",
              optional: true,
            },
            {
              ids: "",
              idPrefix: splits.action,
              groupName: "ownClasses",
              optional: true,
            },
          ])
        )?.groups;
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
  _unocssConfig: Config["unocssConfig"],
  config?: ConfigPick<"ignore">
) {
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
  _rule: Config["rule"],
  _unocssConfig: Config["unocssConfig"],
  config?: ConfigPick<"debug" | "splits">
) {
  const { unocssConfig, debug, rule, splits } = _mergeDefaults({
    ...config,
    rule: _rule,
    unocssConfig: _unocssConfig,
  });
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
  // create needed regex string
  const ruleExp = _makeRegex([
    {
      ids: rule.mainVar,
      idPostfix: rule.connectors, // + "?", // omit function paramteres
      groupName: "pattern",
      match: "[^\\s].+?",
    },
  ]);
  if (typeof rule.variants === "string")
    rule.variants = rule.variants.split("|");
  const variantExp = _makeRegex([
    {
      ids: "_" + rule.mainVar,
      idPostfix: rule.connectors,
      groupName: "mainVar",
      idStyle: "inside",
      // match: "",
    },
    {
      ids: rule.variants.join("|"),
      idStyle: "inside",
      idPostfix: rule.connectors,
      groupName: "variant",
      optional: true,
      // match: "",
    },
    {
      ids: "",
      groupName: "pattern",
    },
  ]);

  // add theme layer to main themes
  {
    const layers = Object.values(unocssConfig.layers);
    unocssConfig.layers[rule.mainVar] = layers[layers.length - 1] + 1;
  }

  // make variants
  unocssConfig.variants.push((matcher) => {
    // if (!matcher.startsWith("_" + rule.mainVar)) {
    // return matcher;
    // }
    const groups = matcher.match(variantExp)?.groups;
    if (!groups) {
      return matcher;
    }
    let { mainVar, variant, pattern } = groups;
    variant = variant.replace(":", "");
    // console.log(mainVar, " :: ", variant, " :: ", pattern);
    return {
      matcher: pattern,
      selector: (s) => {
        if (rule.variantStyle === "class")
          return `.${rule.mainVar} ${s}-${variant}`;
        if (rule.variantStyle === "class-attached")
          return `.${rule.mainVar}-${variant} ${s}`;
        if (rule.variantStyle === "variant-prefix") return `.${variant}-${s}`;
        return `[${rule.mainVar}="${variant}"] ${s}`;
      },
    };
  });

  // make rule
  unocssConfig.rules.push([
    ruleExp,
    ({ groups: { pattern } }) => {
      const result = { [rule.directiveVar]: ` "` };
      let style = _makeClass(pattern, { splits, debug }).split(
        // new RegExp(splits.rule, "g")
        "-"
      );
      if (style.length <= 1) {
        console.warn(
          "theme rule function needs a pattern with a rule" +
            splits.rule +
            "tag"
        );
        return { [rule.directiveVar]: `""` };
      }
      // ruleVar value doesn't have to be short and/or
      // readable because it's never seen or loaded.
      (rule.variants as string[]).forEach((t, i) => {
        let n = style.join("-" + t + "-");
        if (i === 0) result[rule.directiveVar] += n;
        else
          result[rule.directiveVar] +=
            " _" + rule.mainVar + ":" + t + ":" + "(" + n + ")";
      });
      result[rule.directiveVar] += `"`;
      if (debug.style !== "off" && pattern.startsWith(debug.id)) {
        console.info(result);
      }
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
