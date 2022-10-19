/**
 * unocss config style and theming by github.com/qundus
 * @author qundus
 */
import {
  defineConfig,
  UserConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
  transformerAttributifyJsx,
} from "unocss";
import { colors } from "@unocss/preset-mini/dist/colors.mjs";
// import { pathTo } from "./tools/helpers";
import {
  makePreflights,
  makeThemeRules,
  _makeClass,
  _makeRegex,
  _mergeDefaults,
} from "./_/sweetjsx/helpers/uno.helper";

const mode = process.env.NODE_ENV;
let config: UserConfig = {
  // include: /^.*\.(html|css|js|ts|jsx|tsx)$/,
  // include: pathTo("src", "**", "*.{jsx,tsx}"),
  include: "src/**/*.{jsx,tsx}",
  envMode: mode === "development" ? "dev" : "build",
  presets: [
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
  ],
  transformers: [
    transformerDirectives({ varStyle: "--" }),
    transformerVariantGroup({ separators: [":", "-"] }),
  ],
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
    // creating a type for colors helps with consistent theming
    colors: {
      li: {
        bg: colors.light[400], // bg
        bg$h: colors.dark[400], // bg
        t: colors.dark[300], // text
        code: colors.fuchsia[300], // code tag
        select: {
          bg: colors.dark[600],
          t: colors.fuchsia[300],
        },
        btn: {
          bg: colors.dark[600],
          t: colors.fuchsia[300],
          b: colors.blue[300],
          bg$h: colors.light[600],
          t$h: colors.fuchsia[600],
        },
      }, // light
      da: {
        bg: colors.black, // bg
        t: colors.yellow[400], // text
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
        bg: colors.sky[400], // bg
        bg$h: colors.light[400], // bg
        t: colors.light[300], // text
        code: colors.dark[300], // code tag
        select: {
          bg: colors.dark[600],
          t: colors.fuchsia[300],
        },
        btn: {
          bg: colors.dark[600],
          t: colors.sky[300],
          b: colors.blue[300],
          bg$h: colors.light[600],
          t$h: colors.fuchsia[600],
        },
      }, // river
    },
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
  },
};

// collect and load .css style files
config = makePreflights("src/styles", config);
config = makeThemeRules({ mainVar: "theme", variants: "li|da|ri" }, config, { debug: { style: "class" } });

export default defineConfig(config);
