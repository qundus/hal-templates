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
 * @author github.com\qundus
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