import { join } from "node:path";

/**
 * function to help with paths
 */
export const pathTo = (...paths: string[]) => {
  return join(process.cwd(), ...paths);
};

/**
 * allows to choose optional keys of the passed type.
 */
export type OptionalK<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
  Partial<Pick<T, K>>;
/**
 * allows to choose specific keys of the passed type.
 */
export type PartialK<T, K extends keyof T> = Pick<T, K>; //& Partial<T>;
