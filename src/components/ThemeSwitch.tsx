import { getThemeContext, ThemeContext } from "@src/contexts";
import { Themes } from "@src/models";

type Props = {
  callback(): void;
};
export function ThemeSwitch(props: Props) {
  const theme = getThemeContext();
  const updateTheme = (value: Themes) => {
    ThemeContext.set(value);
    props.callback();
  };
  return (
    <select
      onChange={(e: any) => updateTheme(e.target.value)}
      class={`absolute w-110px h-50px left-10 top-10 ring-0 outline-0 z-10 rounded px-5 theme$select-${theme}`}
    >
      {Object.entries(Themes).map(([k, v]) => {
        return (
          <option selected={v === theme ? "selected" : undefined} value={v}>
            {k}
          </option>
        );
      })}
    </select>
  );
}
