/**
 * windicss config style by github.com/neod3v
 * @author neod3v
 */
import { defineConfig } from "windicss/helpers";
import colors from "windicss/colors";
const development = process.env.mode === "development";
export default defineConfig({
  // prefix: "app",

  darkMode: "class",
  attributify: {
    prefix: "_-",
    separator: ":",
  },
  separator: ":",
  shortcuts: {
    // === development === \\
    ...(development
      ? {
          // debug classes are used in root tag <html class="debug$all">
          debug$: "border-2px border-solid border-red-600",
          debug$all: {
            "& *": {
              "@apply": "debug$",
            },
            "& * > *": {
              "@apply": "debug$ border-blue-600",
            },
            "& * > * > *": {
              "@apply": "debug$ border-yellow-600",
            },
            // add more depth classes with "& * > * ..."
          },
          debug$1: "debug$ children:(debug$ border-yellow-600)",
          debug$2: "debug$1 children:(debug$1 border-blue-600)",
        }
      : {}),
    // === core === \\
    // $$ flex
    flex$: "flex flex-nowrap relative",
    flex$wrap: "flex$ flex-wrap",
    flex$rows: "flex$ flex-col",
    flex$rows$wrap: "flex$rows flex$wrap",
    flex$cols: "flex$ flex-row",
    flex$cols$wrap: "flex$cols flex$wrap",
    // $$ area
    area$: "flex-grow-[1] flex-shrink-[1] basis-[99%]",
    area$max: "flex-grow-[1] flex-shrink-[1] basis-[max]",
    area$sm: "flex-grow-[0.3] flex-shrink-[0.3] basis-[10%]",
    area$sm$1: "flex-grow-[0.6] flex-shrink-[0.4] basis-[20%]",
    area$sm$2: "flex-grow-[0.8] flex-shrink-[0.5] basis-[35%]",
    area$sm$3: "flex-grow-[0.9] flex-shrink-[0.6] basis-[50%]",
    area$lg: "flex-grow-[1.3] flex-shrink-[0.7] basis-[60%]",
    area$lg$1: "flex-grow-[1.6] flex-shrink-[0.9] basis-[70%]",
    area$lg$2: "flex-grow-[2] flex-shrink-[1] basis-[80%]",
    // $$ size
    fit$w: "!w-max !max-w-max",
    fit$h: "!h-max !max-h-max",
    fit$: "fit$w fit$h",
    extend$w: "!w-full !max-w-full",
    extend$w$s: "!w-screen !max-w-screen",
    extend$h: "!h-full !max-h-full",
    extend$h$s: "!h-screen !max-h-screen",
    extend$s: "extend$w$s extend$h$s",
    extend$: "extend$w extend$h",
    trim$: "!overflow-hidden",
    trim$w: "!overflow-x-hidden !overflow-y-visible",
    trim$h: "!overflow-y-hidden !overflow-x-visible",
    // $$ positioning
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
    // DO NOT ADD YOUR SHORTCUTS HERE | ADD IN `src/styles/shortcuts.css` \\
    // the above shortcuts are maticulessly configured for to work here,
    // because of vite and windicss combination, some class/shortcut names
    // do not work because windi places base classes and omits yours.
    // try it: uncomment the following shortcut and try to use it,
    // you won't find it when you check devTools in browser
    // img$: "h-6em p-1.5em",
  },
  safelist: ["bg-li-3", "bg-da-3"],
  theme: {
    screens: {
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
      // no primary and secondary, just numbers and actions|events
      // convention format: theme_code-[color_no|action-color_no|event-color_no]
      // example: light-0, light-h-0, dark-active-1
      li: {
        1: "#242424",
        2: "#646cff",
        3: colors.light[600],
        h: {
          2: "#535bf2",
        }, // hover
        a: {}, // active
      }, // light
      da: {
        1: "#242424",
        2: "#646cff",
        3: colors.dark[600],
        h: {
          2: "#535bf2",
        }, // hover
        a: {}, // active
      }, // light
    },
    extend: {
      cursor: {
        context: "context-menu",
      },
      dropShadow: {
        logo: "drop-shadow(0 0 2em #646cffaa)",
        // logo2: "drop-shadow(0 0 2em #673ab8aa)",
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
      textColor: {
        default: "rgba(255,255,255,0.87)",
      },
      // Borders
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
});
