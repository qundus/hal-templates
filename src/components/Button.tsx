
type Props = {
  [key: string]: any;
  children?: any | undefined;
};
export function Button(props: Props) {
  const children = props.children;
  props.children = undefined;

  return (
    <button
      _border="1px rounded solid transparent"
      _transition="color duration-[0.25s]"
      _text="1.3rem"
      class="p-0.6em text-1em font-medium cursor-pointer outline-3"
      __theme="bg$bg_text$t,hover,btn"
      {...props}
    >
      {children}
    </button>
  );
}
