import { Themes } from "@src/models/theme.model";

type Props = {
  currentTheme: Themes;
  callback(theme: Themes): void;
};
export function ThemeSwitch(props: Props) {
  const updateTheme = (value: Themes) => props.callback(value);
  return (
    <select
      onChange={(e: any) => updateTheme(e.target.value)}
      class="absolute w-110px h-50px left-10 top-10 ring-0 outline-0 z-10 rounded px-5"
      __theme="bg$bg_text$t,hover,btn"
    >
      {Object.entries(Themes).map(([k, v]) => {
        return (
          <option
            selected={v === props.currentTheme ? "selected" : undefined}
            value={v}
          >
            {k}
          </option>
        );
      })}
    </select>
  );
}
