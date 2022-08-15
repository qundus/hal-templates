import { join } from "node:path";

/**
 * function to help with paths
 */
export const pathTo = (...paths: string[]) => {
  return join(process.cwd(), ...paths);
};

/** Only keys in K from T are included, keys are mandatory. */
export type Keys<T, K extends keyof T> = Pick<T, Extract<keyof T, K>>;
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
