import { createContext, useContext } from "nano-jsx";
import { Themes } from "@src/models/theme.model";

export const ThemeContext = createContext(Themes.Light);
export const getThemeContext = () => useContext(ThemeContext);
