/**
 * Construct a type that makes non `void` types optional in objects and removes it
 * in non object types along with {@link TO} .
 * <pre/> it's also possible to :
 * - require keys by name
 * - ignore deep cyclying by types
 * - remove keys by type or name
 * - clean type of {@link TR} through {@link C}
 * note: deep KR and KO have some issues under strictNullChecks.
 * @param T main type, usually coming from an object with public keys.
 * @param TI [default=never&any[]] types ignored from going deep on.
 * @param TO [default=never] types omitted completely.
 * @param KR [default=never] keys required even if type {@link TR} isn't in their type.
 * @param KO [default=never] keys omitted completely.
 * @param TR [default=never&void] type to denote required keys/properties.
 * @param C [default=false] clean the resulting type from {@link TR}
 * @author github.com\neod3v
 * @todo sanitize and go deep on arrays if they're not mentioned in TI
 * @todo fix deep {@link KR} and {@link KO} issues under `strictNullChecks`
 */
export type DeepVoid<
    T,
    TI = null,
    TO = null,
    KR extends keyof T = never,
    KO extends keyof T = never,
    TR = never,
    C extends boolean = true
> = Extract<T, object> extends never
    ? C extends true
    ? Exclude<T, TO | TR | void>
    : Exclude<T, TO>
    : Omit<
        { [K in keyof T]-?: T[K] },
        keyof {
            [K in keyof T as Extract<TR | void, T[K]> extends never
            ? Exclude<K, KR>
            : never]: T[K];
        }
    > &
    Omit<
        { [K in keyof T]+?: T[K] },
        keyof {
            [K in keyof T as Extract<TR | void, T[K]> extends never
            ? Extract<K, KR>
            : K]?: T[K];
        }
    > extends infer G
    ? {
        [K in keyof Omit<G, KO>]:
        | DeepVoid<
            Exclude<G[K], TI | any[] | undefined | null>,
            TI,
            TO,
            Extract<keyof G[K], KR>,
            Extract<keyof G[K], KO>,
            TR,
            C
        >
        | Extract<G[K], TI | any[]>;
    }
    : never;


/**
 * Get required or optional keys of an object.
 * @param T main type to extract keys from.
 * @param O [default=true] whether to return optional or required keys.
 * @param S [default false] get the result as string keys.
 */
export type FilterKeysOf<
    T extends object,
    O extends "optional" | "required" = "optional",
    S extends "asArray" | "asObject" = "asObject"
> = Omit<
    T,
    keyof {
        [K in keyof T as T extends Record<K, T[K]> ? K : never]: T[K];
    }
> extends infer OptionalObject
    ? O extends "optional"
    ? S extends "asArray"
    ? keyof OptionalObject
    : OptionalObject
    : S extends "asArray"
    ? Exclude<keyof T, keyof OptionalObject>
    : Omit<T, keyof OptionalObject>
    : never;

/**
* pick optional keys/properties along with required ones from type {@link T}
* @param T type with keys.
* @param Q keys to be extracted form {@link T}
* @param G [default=true] include required keys by default
*/
export type Pick<
    T extends object,
    Q extends keyof T,
    G extends "include required" | "omit required" = "include required"
> = G extends "include required"
    ? Omit<
        T,
        keyof {
            [K in keyof T as T extends Record<K, T[K]>
            ? never
            : Exclude<K, Q>]: T[K];
        }
    >
    : Omit<
        T,
        keyof { [K in keyof T as Extract<Q, K> extends never ? K : never]: T[K] }
    >;

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
