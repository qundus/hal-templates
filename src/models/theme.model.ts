export type ThemeModel = {
  [code in Themes]: {
    //   [code in ["li","da"]]: {
    [tag: string]:
      | string
      | {
          [subtag: string]: string;
          bg: string;
          t: string;
        };
    bg: string;
    t: string;
  };
};

export enum Themes {
  Light = "li", // values are the codes used in uno.config->"li", "da"..
  River = "ri",
  Dark = "da",
}
