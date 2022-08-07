import { useContext } from "nano-jsx";
import { AppContext, AppContextType } from "@src/contexts/app";

type Props = {
  [key: string]: any;
  children?: any | undefined;
};
export function Button(props: Props) {
  const children = props.children;
  props.children = undefined;

  // const appContext = useContext(AppContext) as AppContextType;
  return (
    <button
      _-border="1px rounded solid transparent"
      _-transition="color duration-[0.25s]"
      _-text="1.3rem"
      class="p-0.6em text-1em font-medium cursor-pointer"
      _-hover="border-c-3"
      {...props}
    >
      {/* context is {appContext.theme} */}
      {children}
    </button>
  );
}
