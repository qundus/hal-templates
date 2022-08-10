// FIRST
import "uno.css";
// import 'virtual:unocss-devtools'
import { render, Component } from "nano-jsx";

// LAST
import { getThemeContext, ThemeContext } from "@src/contexts";
import { Button, Logo, ThemeSwitch } from "@src/components";

type State = {
  count: number;
};

class App extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.id = "App";
    this.initState = { count: 0 };
  }

  updateTheme = () => {
    this.update();
  };

  increaseCount() {
    this.setState({ count: this.state.count + 1 }, true);
  }

  render() {
    const theme = getThemeContext();
    console.log("reached theme reload :: ", theme);
    return (
      <ThemeContext.Provider value={theme}>
        <ThemeSwitch callback={this.updateTheme} />
        <main
          class={
            `flex$rows area$ fight$items extend$m theme$app-${theme}`
            // + Theme.app()
          }
        >
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
              Edit <code class={`theme$code-${theme}`}>src/app.tsx</code> and
              save to test HMR
            </p>
          </div>
          <p class={"fight$self theme$code-" + theme}>
            Click on any of the logos to learn more
          </p>
        </main>
      </ThemeContext.Provider>
    );
  }
}

render(<App />, document.body);
