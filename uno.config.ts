/**
 * unocss config style and theming by github.com/neod3v
 * @author neod3v
 */
import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
} from "unocss";
import fs from "node:fs";
import { ThemeModel, Themes } from "./src/models";
import { Theme } from "@unocss/preset-mini";
import { colors } from "@unocss/preset-mini/dist/colors.mjs";

const development = process.env.mode === "development";
// make theme specific safelist and shortcuts
const { safelist: themeSafelist, shortcuts: themeShortcuts } = makeShortcuts(
  "theme$",
  Object.values(Themes),
  ["app-", "bg$bg text$t", "hover"],
  ["code-", "text$code"],
  ["select-", "bg$bg text$t", undefined, "select"],
  ["btn-", "bg$bg text$t border$b", "hover:h:bg$bg,text$t", "btn"]
);
export default defineConfig({
  presets: [
    presetUno({
      dark: "class",
    }),
    presetAttributify({
      prefix: "_-",
      // separator: ":",
    }),
    presetIcons({
      //   scale: 1.2,
      //   cdn: "https://esm.sh/",
    }),
  ],
  transformers: [transformerDirectives({ varStyle: "--" })],
  preflights: [
    {
      layer: "app",
      getCSS: () => fs.readFileSync("src/styles/app.css", "utf-8"),
    },
    {
      layer: "development",
      getCSS: () =>
        development ? fs.readFileSync("src/styles/dev.css", "utf-8") : "",
    },
  ],
  layers: {
    components: -1,
    default: 1,
    utilities: 2,
    app: 3,
    development: 4,
  },
  include: "./**/*.{css,tsx}",
  configDeps: ["src/styles/app.css", "src/styles/dev.css"],
  safelist: [...themeSafelist],
  shortcuts: [
    {
      flex$: "flex flex-nowrap relative",
      flex$wrap: "flex$ flex-wrap",
      flex$rows: "flex$ flex-col",
      flex$rows$wrap: "flex$rows flex$wrap",
      flex$cols: "flex$ flex-row",
      flex$cols$wrap: "flex$cols flex$wrap",
    }, // flex
    {
      area$: "flex-grow-[1] flex-shrink-[1] basis-[99%]",
      area$max: "flex-grow-[1] flex-shrink-[1] basis-[max]",
      area$sm: "flex-grow-[0.3] flex-shrink-[0.3] basis-[10%]",
      area$sm$1: "flex-grow-[0.6] flex-shrink-[0.4] basis-[20%]",
      area$sm$2: "flex-grow-[0.8] flex-shrink-[0.5] basis-[35%]",
      area$sm$3: "flex-grow-[0.9] flex-shrink-[0.6] basis-[50%]",
      area$lg: "flex-grow-[1.3] flex-shrink-[0.7] basis-[60%]",
      area$lg$1: "flex-grow-[1.6] flex-shrink-[0.9] basis-[70%]",
      area$lg$2: "flex-grow-[2] flex-shrink-[1] basis-[80%]",
    }, // area
    [
      /^fit\$/,
      ([raw, value]) => {
        return "";
      },
    ],
    {
      fit$w: "!w-max !max-w-max",
      fit$w$m: "fit$w !min-w-max",
      fit$h: "!h-max !max-h-max",
      fit$h$m: "fit$h !min-h-max",
      fit$m: "fit$w$m fit$h$m",
      fit$: "fit$w fit$h",
      lock$w: "!min-w-full !w-full !max-w-full",
      lock$ws: "!min-w-screen !w-screen !max-w-screen",
      lock$h: "!min-h-full !h-full !max-h-full",
      lock$hs: "!min-h-screen !h-screen !max-h-screen",
      lock$: "lock$w lock$h",
      lock$s: "lock$ws lock$hs",

      extend$w: "!w-full !max-w-full",
      extend$w$m: "!w-full !min-w-full",
      extend$ws: "!w-screen !max-w-screen",
      extend$ws$m: "extend$ws !min-w-screen",
      extend$h: "!h-full !max-h-full",
      extend$h$m: "extend$h !min-h-full",
      extend$h$s: "!h-screen !max-h-screen",
      extend$h$s$m: "extend$h$s !min-h-screen",
      extend$s$m: "extend$w$s$m extend$h$s$m",
      extend$s: "extend$w$s extend$h$s",
      extend$m: "extend$w$m extend$h$m",
      extend$: "extend$w extend$h",
      trim$: "!overflow-hidden",
      trim$w: "!overflow-x-hidden !overflow-y-visible",
      trim$h: "!overflow-y-hidden !overflow-x-visible",
    }, // size
    {
      child$between: "justify-between content-between place-content-between",
      child$around: "justify-around content-around place-content-around",
      pull$self: "self-start place-self-start",
      pull$text: "text-left rtl:text-tight",
      pull$items:
        "items-start justify-start content-start place-content-start object-left rtl:object-right",
      pull$: "pull$self pull$text pull$items",
      push$self: "self-end place-self-end",
      push$text: "text-right rtl:text-left",
      push$items:
        "items-end justify-end content-end place-content-end object-right rtl:object-left",
      push$: "push$self push$text push$items",
      fight$self: "self-center place-self-center",
      fight$text: "text-center",
      fight$items:
        "items-center justify-center content-center object-center place-items-center",
      fight$: "fight$self fight$text fight$items",
    }, // positioning
    {
      ...themeShortcuts,
      logo$: "h-10rem p-1.5em",
    }, // specific,
  ],
  theme: {
    breapoints: {
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
    },
    // Keep all colors here and don't spread them over for easy configs
    colors: {
      // no primary and secondary, just tags and actions|events
      // convention format: theme_code-[tag|tag$action|tag$event]
      // example: li-select, li-select$h, da-t$a
      li: {
        bg: colors.light[400], // bg
        t: colors.dark[300], // text
        code: colors.fuchsia[300], // code tag
        select: {
          bg: colors.dark[600],
          t: colors.fuchsia[300],
        },
        btn: {
          bg: colors.dark[600],
          bg$h: colors.light[600],
          t: colors.fuchsia[300],
          t$h: colors.fuchsia[600],
          b: colors.blue[300], // border
        },
      }, // light
      da: {
        bg: colors.dark[500], // bg
        t: colors.sky[400], // text
        code: colors.gray[300], // code tag
        select: {
          bg: colors.light[600],
          t: colors.sky[300],
        },
        btn: {
          bg: colors.light[600],
          bg$h: colors.dark[600],
          t: colors.sky[300],
          t$h: colors.sky[600],
          b: colors.blue[300], // border
        },
      }, // dark
      ri: {
        bg: colors.slate[500],
        t: colors.dark[300],
      },
    } as ThemeModel,
    extend: {
      cursor: {
        context: "context-menu",
      },
      dropShadow: {
        logo: "drop-shadow(0 0 2em #646cffaa)",
      },
      // -- DEFAULTS ONLY -- \\
      // Fonts
      fontFamily: {
        default: "Inter, Avenir, Helvetica, Arial, sans-serif",
      },
      fontSize: {
        default: "16px",
      },
      fontWeight: {
        default: "400",
      },
      lineHeight: {
        default: "24px",
      },
      // Borders
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  } as Theme,
});

/**
 * Make a single unocss class string.
 * @param style style in the format `utility$tag`. example: bg$bg results in bg-bg
 * @param o options that format the class string.
 * - separator: to be added after utility like `red` -> bg-red-bg
 * - group: to be added after separator like btn -> bg-red-btn-bg
 * - action: the action short like h for hover and a for active
 * - actionSeparator: the action separator, defaults is `$`
 * - stringAfter: add whatever string or other classes afterwards
 * @returns single unocss class.
 */
function makeClasses(
  style: string,
  o: {
    separator?: string;
    group?: string;
    action?: string;
    actionSeparator?: string;
    stringAfter?: boolean | string;
  }
): string {
  const ss = style.split("$");
  if (ss.length > 2)
    throw "style can only have 2 tags split by $ in the form `utility$tag`";
  o.separator = o.separator ? o.separator + "-" : "";
  o.group = o.group ? o.group + "-" : "";
  o.actionSeparator = o.actionSeparator ? o.actionSeparator : "$";
  o.action = o.action ? `${o.actionSeparator}${o.action}` : "";
  if (o.stringAfter) {
    if (typeof o.stringAfter === "boolean") o.stringAfter = " ";
  } else {
    o.stringAfter = "";
  }
  return `${ss[0]}-${o.separator}${o.group}${ss[1]}${o.action}${o.stringAfter}`;
}

/**
 * Create unocss shortcuts and safelists.
 * @param id will be added before every style function name
 * @param separators put between utility and tag like `light` to identify light theme for example
 * @param styles build styles according and let unocss handle the rest,
 * start by naming the function you want then add basic windicss class atributes.
 * examples (with light theme only "li"):
 * - light theme text color and background:
 *  >["app-", "bg$bg text$t"] -> ` bg-li-bg text-li-t `
 * - text light theme with hover:
 *  >["select-", "text$t", "hover"] -> ` text-li-t hover:text-li-t$h ` <-
 * - tell it that you defined `hov` as the short for hover in your windi.config:
 *  >["code-", "text$t", "hover:hov"] -> ` text-li-t hover:text-li-t$hov `
 * - define multiple actions|variants:
 *  >["app-", "border$b", "hover:h active:ac"] -> ` border-li-t hover:border-li-t$h active:border-li-b$ac `
 * - when tags are under certain groups
 *  >["app-", "bg$bg", undefined, "btn"] -> ` bg-li-btn-bg `
 * - specify other tags for actions
 *  >["app-", "bg$bg", "hover:text$t,border$bg", "btn"] ->
 * ` bg-li-btn-bg hover:(text-li-btn-t$h border-li-btn-bg)`
 * @returns
 */
function makeShortcuts(
  id: string,
  separators?: string[],
  ...styles: [key: string, pattern: string, actions?: string, group?: string][]
): { safelist: string[]; shortcuts: { [key: string]: string } } {
  const result = {};
  const placeholder = "PLACEHOLDER";
  styles.forEach((s) => {
    const patterns = s[1].split(" ");
    const actions = s[2] ? s[2].split(" ") : undefined;
    let style: string = ""; // space before classes
    patterns.forEach((p, i) => {
      style += makeClasses(p, {
        separator: placeholder,
        group: s[3],
        stringAfter: i !== patterns.length - 1,
      });
    });
    if (actions) {
      const base = style.split(" ");
      actions.forEach((a, i) => {
        const as = a.split(":");
        const short = as.length === 3 ? as[1] : as[0].charAt(0);
        let separator = "$";
        if (as[0].includes(separator)) {
          let [action, sep] = as[0].split(separator);
          separator = sep;
          as[0] = action;
        }
        // action has it's own tags
        if (as[as.length - 1].includes("$")) {
          style += ` ${as[0]}:(`;
          as[as.length - 1].split(",").forEach((t, i, arr) => {
            style += makeClasses(t, {
              separator: placeholder,
              action: short,
              actionSeparator: separator,
              group: s[3],
              stringAfter: i !== arr.length - 1,
            });
          });
        } else {
          style += ` ${as[0]}:(`;
          for (let i = 0; i < base.length; i++) {
            style += `${base[i]}${separator}${short}${
              i !== base.length - 1 ? " " : ""
            }`;
          }
        }
        style += `)`;
      });
    }
    // adding spaces before and after to avoid clashing with other user defined styles
    style = ` ${style} `;
    // making the shortcut
    if (separators) {
      separators.forEach((sep) => {
        result[`${id}${s[0]}${sep}`] = style.split(placeholder).join(sep);
      });
    } else {
      result[`${id}${s[0]}`] = style.split(placeholder).join("");
    }
  });
  return {
    safelist: Object.keys(result),
    shortcuts: result,
  };
}
