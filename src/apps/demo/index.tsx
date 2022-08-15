// FIRST
import "uno.css";
import "virtual:unocss-devtools";
import { render, Component } from "nano-jsx";

// LAST
import { Button, Logo, ThemeSwitch } from "@src/components";
import { Themes } from "@src/models/theme.model";
type State = {
  count: number;
  theme: Themes;
};

class App extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.id = "App";
    this.initState = { count: 0, theme: Themes.Light };
  }

  didMount() {
    // add main theme to html tag class
    // document.documentElement.setAttribute("__theme", "bg$bg");
    document.documentElement.setAttribute("theme", this.state.theme);
  }

  updateTheme = (theme: Themes) => {
    document.documentElement.setAttribute("theme", theme);
    this.setState({ ...this.state, theme }, false);
  };

  increaseCount() {
    this.setState({ ...this.state, count: this.state.count + 1 }, true);
  }

  render() {
    return (
      <>
        <ThemeSwitch
          currentTheme={this.state.theme}
          callback={this.updateTheme}
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
              <code class="theme:text-code">src/apps/demo/index.tsx</code>to
              test HMR
            </p>
          </div>
          <p class="fight$self">Click on any of the logos to learn more</p>
        </main>
      </>
    );
  }
}

render(<App />, document.body);
