import { getThemeContext } from "@src/contexts";

type Props = {
  [key: string]: any;
  children?: any | undefined;
};
export function Button(props: Props) {
  const children = props.children;
  props.children = undefined;

  return (
    <button
      _-border="1px rounded solid transparent"
      _-transition="color duration-[0.25s]"
      _-text="1.3rem"
      class={`p-0.6em text-1em font-medium cursor-pointer outline-3 theme$btn-${getThemeContext()}`}
      {...props}
    >
      {children}
    </button>
  );
}
