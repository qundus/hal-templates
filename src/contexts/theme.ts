import { createContext } from "nano-jsx";

export enum Themes {
  Light = "light",
  Dark = "dark",
}
export const ThemeContext = createContext(Themes.Light);
