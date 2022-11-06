// FIRST
import "uno.css";
import "virtual:unocss-devtools";
import { render, Component } from "nano-jsx";

// LAST
import { Button, Logo, ThemeSwitch } from "@-/fe.components.nanojsx";
// import { Themes } from ":models/theme.model";
type State = {
  count: number;
};

class App extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.id = "App";
    this.initState = { count: 0 };
  }

  didMount() {
    // add main theme to html tag class
    // document.documentElement.setAttribute("__theme", "bg$bg");
    // document.documentElement.setAttribute("theme", this.state.theme);
  }

  increaseCount() {
    this.setState({ ...this.state, count: this.state.count + 1 }, true);
  }

  render() {
    return (
      <>
        <ThemeSwitch
          theme="light"
          themes={[{ class_name: "light", human_name: "Light" }, { class_name: "dark", human_name: "Dark" }]}
        />
        <main class="flex$rows area$ fight$items extend$m ">
          <div class="flex$cols area$ fight$items">
            <Logo
              link="https://vitejs.dev"
              src="/svgs/vite.svg"
              alt="Vite Logo"
            />
            <Logo
              link="https://nanojsx.io"
              src="/svgs/nano-jsx.svg"
              alt="NanoJSX Logo"
            />
            <Logo
              link="https://windicss.org"
              src="/svgs/unocss.svg"
              alt="Windicss Logo"
            />
          </div>
          <div class="flex$rows fight$items fit$w mt-5">
            <Button onClick={() => this.increaseCount()}>
              count is {this.state.count}
            </Button>
            <p class="mt-5">
              modify
              <code class="text-li-code dark:text-da-code">src/apps/demo/index.tsx</code>to
              test HMR
            </p>
          </div>
          <p class="fight$self bg-li-code dark:bg-da-code">Click on any of the logos to learn more</p>
        </main>
      </>
    );
  }
}

render(<App />, document.body);
