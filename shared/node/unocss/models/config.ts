import { UserConfig } from "unocss";
import type { DeepVoid, Pick } from "@-/shared.abstracts";

/**
 * Used to define config type as well as default values across methods.
 */
export const configDefaults = {
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
         * @default "off"
         */
        style: "off" as "on" | "off" | "class",
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

/**
 * user config types determined by any methods' parameters.
 */
export type Config = DeepVoid<
    typeof configDefaults,
    UserConfig,
    never
// "unocssConfig"
>;

/**
 * optional user parameters.
 */
export type ConfigPick<
    T extends keyof Config,
    Q extends "include required" | "omit required" = "include required"
> = Pick<Config, T, "omit required">;