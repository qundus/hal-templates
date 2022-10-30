import BaseConfig from "@-/configs.unocss";
import { colors } from "@-/configs.unocss/helpers/colors";
import { UserConfig } from "unocss";

const conf: UserConfig = {
    envMode: process.env["NODE_ENV"] === "development" ? "dev" : "build",
    shortcuts: [{
        logo$: "h-10rem p-1.5em",
    }],
    theme: {

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

export default BaseConfig(conf)
    .Preflights({}, "styles")
    .Presets()
    .Shortcuts()
    .Theme()
    .Transformers()
    .ThemeRule({ mainVar: "theme", variants: "li|da|ri" }, { debug: { style: "class" } })
    .finalize();