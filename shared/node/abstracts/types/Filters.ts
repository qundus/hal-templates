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

