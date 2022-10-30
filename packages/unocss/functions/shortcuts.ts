import { UserConfig, UserShortcuts } from "unocss";
import { Config } from "../models/config";

/**
 * Create unocss opinionated shortcuts.
 * merged with original user config.
 * @return unocss helper shortcuts for sizing positioning and so on 
 */
export function Shortcuts(_unocssConfig: Config["unocssConfig"]): UserConfig {
    let shortcuts: UserShortcuts = [];
    // flex
    shortcuts.push({
        flex$: "flex flex-nowrap relative",
        flex$wrap: "flex$ flex-wrap",
        flex$rows: "flex$ flex-col",
        flex$rows$wrap: "flex$rows flex$wrap",
        flex$cols: "flex$ flex-row",
        flex$cols$wrap: "flex$cols flex$wrap",
    });

    // area
    shortcuts.push(
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
        }
    );

    // size
    shortcuts.push(
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
        }
    );

    // position
    shortcuts.push({
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
    });

    // append original user config shortcuts 
    if (Array.isArray(_unocssConfig.shortcuts)) {
        shortcuts.push(..._unocssConfig.shortcuts);
    } else {
        shortcuts.push(_unocssConfig.shortcuts);
    }
    _unocssConfig.shortcuts = shortcuts;
    return _unocssConfig;
}