/**
 * unocss helpers by github.com/qundus
 * @author qundus
 * useful links:
 * https://regex101.com/r/YAEZTX/24
 * https://devhints.io/jsdoc
 * https://jsdoc.app/index.html#block-tags
 */
import { deepMerge } from "@-/abstract";
import { Config, configDefaults, ConfigPick } from "../models/config";

/**
 * Fill in the necessary defaults if user hasn't set those properties,
 * only if mergedDefaults is false to avoid duplicate merging
 */
export function _mergeDefaults(d: Config): Config {
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