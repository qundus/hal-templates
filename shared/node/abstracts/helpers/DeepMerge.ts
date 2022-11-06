/**
* Check if {@link item} is an object with keys
* @param item item to be type checked.
* @returns wheather item is an object
*/
export function isObject<T>(item: T) {
    return item && typeof item === "object" && !Array.isArray(item);
}

/**
* Merge target with sources.
* @param target main object to be merged
* @param sources other objects to be merged with {@link target}
* @returns target merged with all sources
*/
export function deepMerge<T>(target: T, ...sources: T[]): T {
    if (!sources.length) return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, {
                        [key]: {},
                    });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, {
                    [key]: source[key],
                });
            }
        }
    }
    return deepMerge(target, ...sources);
}