import { join } from "node:path";

/**
 * function to help with paths
 */
export const pathTo = (...paths: string[]) => {
  return join(process.cwd(), ...paths);
};

/** Only keys in K from T are included, keys are mandatory. */
export type Keys<T, K extends keyof T> = Pick<T, Extract<keyof T, K>>;
// export type KeysArray<T, K  extends keyof T> = Array<keyof typeof K>;

/** Only keys in K from T are excluded, keys are mandatory. */
export type KeysNot<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** Only keys in K from T are included, keys are optional. */
export type KeysMaybe<T, K extends keyof T> = Partial<Keys<T, K>>;
/** Only keys in K from T are excluded, keys are optional. */
export type KeysMaybeNot<T, K extends keyof T> = Partial<KeysNot<T, K>>;

/** All keys in T are excluded
 * <pre/> keys in k are mandatory,
 * <pre/> keys in Q are optional.
 */
export type KeysPick<T, K extends keyof T, Q extends keyof T> = Keys<T, K> &
  KeysMaybe<T, Q>;

/**
 * @author github.com\/neod3v
 * Turn all keys in a type into optional except keys of type `void` or name chosen.
 * it's also possible to :
 * - require keys by name
 * - ignore deep cyclying by types
 * - remove keys by type or name
 * @example
 * const myObj = {
 *  // keep docs, types and default values in one place
 *  hello: undefined as string | void,
 *  world: 2 as number,
 *  other: {
 *      obj: undefined as boolean | void
 *    }
 * }
 * // optional: make top level key required
 * type MyObjType = DeepVoid<typeof myObj, "other">
 * /**
 * MyObjType = {
 *  hello: string,
 *  world?: number
 *  other: {
 *    obj: boolean
 *  }
 * }
 * *\/
 */
export type DeepVoid<
  T,
  RequiredKeys extends keyof T = null,
  RemoveKeys extends keyof T = null,
  IgnoreTypes = null,
  RemoveTypes = null
> = T extends Extract<T, object>
  ? {
      [K in keyof T as Extract<void, T[K]> extends never
        ? Extract<RequiredKeys, K>
        : K]: T[K];
    } & {
      [K in keyof Omit<T, RequiredKeys> as Extract<void, T[K]> extends never
        ? K
        : never]?: T[K];
    } extends infer A
    ? {
        [K in keyof A as Extract<A[K], RemoveTypes> extends never
          ? K extends RemoveKeys
            ? never
            : K
          : never]: A[K] extends IgnoreTypes | DefaultIgnoredTypes
          ? Exclude<A[K], void>
          : DeepVoid<Exclude<A[K], void>, null, null, IgnoreTypes, RemoveTypes>;
      }
    : never
  : Exclude<T, void>;
type DefaultIgnoredTypes = object[] | string[] | any[] | RegExp | RegExp[];
