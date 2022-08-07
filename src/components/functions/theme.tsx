import { Themes } from "@src/contexts/theme";

type Props = {
  theme: Themes;
  callback: (theme: Themes) => void;
};
export function ThemeSwitch(props: Props) {
  return (
    <select
      onChange={(e: any) => props.callback(e.target.value)}
      class="absolute w-100px h-50px left-10 top-10 ring-0 outline-0"
    >
      {Object.values(Themes).map((k) => {
        return (
          <option
            selected={k === props.theme.toString() ? "selected" : undefined}
            value={k}
          >
            {() => k.charAt(0).toUpperCase() + k.substring(1, k.length)}
          </option>
        );
      })}
    </select>
  );
}
