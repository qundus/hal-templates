/**
 * unocss helpers by github.com/neod3v
 * @author neod3v
 */
import fs from "node:fs";
import path from "node:path";
import type { Preflight, Variant, Rule } from "unocss";

/**
 * useful links:
 * https://regex101.com/r/YAEZTX/24
 */

/**
 * used to split a pattern
 */
type Splitters = {
  tag?: string; // splits a single tag
  func?: string; // splits function params
  param?: string; // splits single parameter values
  action?: string;
  actionShort: string;
  actionTags?: string;
};
const defaults = {
  splits: {
    func: ",",
    param: "_",
    tag: "$",
    action: ":",
    actionShort: "$",
    actionTags: "|",
  } as Splitters,
  filler: "FILLER",
};

// -- core
/**
 * Make a single unocss class string.
 * @param pattern style in the format `utility$tag`. example: bg$bg results in bg-bg
 * @param o options that format the class string.
 * - separator: to be added after utility like `red` -> bg-red-bg
 * - group: to be added after separator like btn -> bg-red-btn-bg
 * - action: the action short like h for hover and a for active
 * - actionSeparator: the action separator, defaults is `$`
 * - stringAfter: add whatever string or other classes afterwards
 * @returns single unocss class.
 */
export function makeSingle(
  pattern: string,
  filler: string,
  splits: Splitters,
  group?: string,
  stringAfter?: boolean | string,
  action?: string
): string {
  splits = { ...defaults.splits, ...splits };
  const ss = pattern.split(splits.tag);
  if (ss.length > 2)
    throw "style can only have 2 tags split by $ in the form `utility$tag`";
  filler = filler ? filler + "-" : "";
  group = group ? group + "-" : "";
  action = action ? `${splits.actionShort}${action}` : "";
  if (stringAfter) {
    if (typeof stringAfter === "boolean") stringAfter = " ";
  } else {
    stringAfter = "";
  }
  return `${ss[0]}-${filler}${group}${ss[1]}${action}${stringAfter}`;
}

export function makeWhole(pattern: string, filler: string, splits: Splitters) {
  splits = { ...defaults.splits, ...splits };
  const params = pattern.split(splits.func);
  if (!params || params.length <= 0 || !params[0].includes(splits.tag)) {
    console.warn(`cant make style because no tags were provided`);
    return "cant make style because no tags were provided";
  }
  const tags = params[0].split(splits.param);
  const actions = params[1] ? params[1].split(splits.param) : undefined;
  const group = params[2] ? params[2] : "";
  let style: string = ""; // space before classes
  tags.forEach((p, i) => {
    style += makeSingle(p, filler, splits, group, i !== tags.length - 1);
  });
  if (actions) {
    // console.log(actions);
    actions.forEach((a) => {
      const as = a.split(splits.action);
      // console.log(as);
      let short = as[0].charAt(0);
      // let actionSplit: string = splits.actionTags;
      // "$" must be harcoded for consistent usage of this function
      // if (as[0].includes(actionSplit)) {
      //   let [action, sep] = as[0].split(actionSplit);
      //   if (sep && sep.length >= 1) actionSplit = sep;
      //   as[0] = action;
      // }
      let actionStyle = "";
      // action has it's own tags
      if (as[as.length - 1].includes(splits.tag)) {
        if (as.length > 2) short = as[1];
        as[as.length - 1].split(splits.actionTags).forEach((t, i, arr) => {
          actionStyle += makeSingle(
            t,
            filler,
            splits,
            group,
            i !== arr.length - 1,
            short
          );
        });
      } else {
        // console.log(style);
        if (as.length === 2) short = as[1];
        style.split(" ").forEach((s, i, arr) => {
          actionStyle += `${s}${splits.actionShort}${short}${
            i !== arr.length - 1 ? " " : ""
          }`;
        });
      }
      style += ` ${as[0]}:(${actionStyle})`;
    });
  }
  return style;
}

// -- specific
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
export function makeShortcuts(
  id: string,
  replacers: string[],
  styles: [
    key: string,
    pattern: string,
    actions?: string | undefined,
    group?: string | undefined
  ][],
  splits?: Splitters,
  filler?: string
): { safelist: string[]; shortcuts: { [key: string]: string } } {
  const result = {};
  splits = { ...defaults.splits, ...splits };
  if (!filler) filler = defaults.filler;
  styles.forEach((s) => {
    const key = s[0];
    s.shift();
    // adding spaces before and after to avoid clashing with other user defined styles
    const style = ` ${makeWhole(s.join(splits.func), filler, splits)} `;
    // making the shortcut
    if (replacers) {
      replacers.forEach((sep) => {
        result[`${id}${s[0]}${sep}`] = style.split(defaults.filler).join(sep);
      });
    } else {
      result[`${id}${s[0]}`] = style.split(defaults.filler).join("");
    }
  });
  return {
    safelist: Object.keys(result),
    shortcuts: result,
  };
}

/**
 * Get a list of all css files loaded at build time.
 * @param dir directory where all .css files exist
 * @param layersStartIdx number from which layer count starts
 * @param ignore file names under directory to ignore,
 * useful to omit development .css files from production build
 * @returns preflights, configDeps and layers to be added to unocss's config.
 */
export function makePreflights(
  dir: string,
  layersStartIdx: number,
  ...ignore: string[]
) {
  const configDeps = [];
  const layers = {};
  const preflights: Preflight[] = [];
  fs.readdirSync(path.join(process.cwd(), dir)).forEach((dirent) => {
    const ds = dirent.split(".");
    // make sure the file we're loading is of `.css` type
    if (ds[ds.length - 1] != "css") {
      console.log("the following is not loaded in preflights", dirent);
    }
    if (ignore.includes(ds[0])) return;
    layers[ds[0]] = layersStartIdx;
    configDeps.push(path.join(dir, dirent));
    preflights.push({
      layer: ds[0],
      getCSS: () => fs.readFileSync(configDeps[configDeps.length - 1], "utf-8"),
    });
    layersStartIdx++;
  });
  return {
    preflights,
    configDeps,
    layers,
  };
}

/**
 * Create a theme function that could be scanned by unocss through variants and rules.
 * - PS: don't forget to `\<html theme="li">` to dynamically change theme
 * * - say filler:
 * > "M"
 * - say themes:
 * > "li da".split(" ")
 * - say theme.colors:
 * > {li: {bg: white, bg$h: black}, da: {bg:black, bg$h: white}}
 * - then use them in your app like so:
 * examples (theme function):
 * > /<tag class="theme:(bg)" />
 * - theme
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
 * @param ruleVar css variable to apply classes, affected by transformerDirectives. (default=--apply)
 * @param variantVar the variable that's going to be used at the very top tag
 * `HTML` to change theme of app, like `theme` -> <html theme="li"> where li is passed
 * in themes array. (default=theme)
 * @param themes theme names, usually the same as in theme.colors in config file,
 * first theme is default
 * @param filler custom filler to be replaced by theme names later on,
 * make it short so you can create shorter templates like "M" -> class="theme:(bg-M-bg)"
 * @param splits splitters used to destructure function.
 * @param ruleExp expression to find the _theme function,
 * this one simply replaces the provided filler with theme names.
 * @param _ruleExp expression to find the theme function,
 * this one works as mentioned in examples above
 * @param variantExp expression through which unocss will find theme classes
 * @returns theme variant and rule-set to be added to unocss's config.
 */
export function makeTheme(
  ruleVar: string,
  variantVar: string,
  themes: string[],
  filler?: string,
  splits?: Splitters,
  ruleExp?: RegExp,
  _ruleExp?: RegExp,
  variantExp?: RegExp
): { variant: Variant; rules: Rule<{}>[]; layer: string } {
  if (!themes || themes.length <= 0) {
    throw "must pass at least one theme name";
  }
  const str = "(.*)([^\\W]*?)";
  if (!ruleExp) ruleExp = new RegExp(`^${variantVar}[:-]${str}$`);
  if (!_ruleExp) _ruleExp = new RegExp(`^_${variantVar}[:-]${str}$`);
  if (!variantExp) variantExp = new RegExp(`^__${variantVar}[:-]${str}$`);
  if (!filler) filler = defaults.filler;
  splits = { ...defaults.splits, ...splits };
  return {
    layer: variantVar,
    variant: (matcher) => {
      const matches = matcher.match(variantExp);
      // console.log("from theme variant ::", matches);

      if (!matches || !themes.includes(matches[2])) {
        return matcher;
      }
      console.log("from theme variant ::", matches[2]);
      return {
        matcher: matches[3],
        selector: (s) => {
          return `[${variantVar}=${matches[2]}] ${s}`;
        },
      };
    },
    rules: [
      [
        ruleExp,
        (match) => {
          console.log("from rule :: ", match);
          return "";
          const result = { [ruleVar]: "" };
          let style = match[2].split(filler);
          if (style.length <= 1) {
            console.warn(
              `theme function needs casual unocss classes where fillers are
              going to replaced by theme names, pass something like "bg-${filler}-bg"`
            );
            console.warn("match is :: ", match);
            return result;
          }
          // ruleVar value doesn't have to be short and/or
          // readable because it's never seen or loaded.
          themes.forEach((t, i) => {
            if (i === 0) result[ruleVar] += `${style.join(t)}`;
            else result[ruleVar] += ` __theme:${t}:(${style.join(t)})`;
          });
          // console.log(result);
          return result;
        },
        { layer: variantVar },
      ],
      [
        _ruleExp,
        (match) => {
          console.log("from _ :: ", match);

          return "";
          const result = { [ruleVar]: "" };
          let style: string[];
          style = makeWhole(match[2], defaults.filler, splits).split(
            defaults.filler
          );
          if (style.length <= 1) {
            console.warn(
              `theme rule function needs a pattern with a rule${splits.tag}color`
            );
            console.warn("match is :: ", match);
            return result;
          }
          // ruleVar value doesn't have to be short and/or
          // readable because it's never seen or loaded.
          themes.forEach((t, i) => {
            if (i === 0) result[ruleVar] += `${style.join(t)}`;
            else result[ruleVar] += ` __theme:${t}:(${style.join(t)})`;
          });
          console.log(result);
          return result;
        },
        { layer: variantVar },
      ],
    ],
  };
}
