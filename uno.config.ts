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
} from "unocss";
import { colors } from "@unocss/preset-mini/dist/colors.mjs";
import {
  makePreflights,
  makeShortcuts,
  makeThemeRules,
  _makeClass,
  _makeRegex,
  _mergeDefaults,
} from "./_/sweetfeather/helpers/uno.helper";

const mode = process.env.NODE_ENV;
let config: UserConfig = {
  // include: /^.*\.(html|css|js|ts|jsx|tsx)$/,
  // include: pathTo("src", "**", "*.{jsx,tsx}"),
  // include: "**/*.{jsx,tsx}",
  // exclude: "/",
  // include: join(process.cwd(), "**", "*.{tsx,jsx,html}"),
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
  shortcuts: [{
    logo$: "h-10rem p-1.5em",
  }],
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

config = makePreflights("styles", config); // collect and load .css style files
config = makeThemeRules({ mainVar: "theme", variants: "li|da|ri" }, config, { debug: { style: "class" } });
config = makeShortcuts(config);

export default defineConfig(config);
