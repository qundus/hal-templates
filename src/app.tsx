// FIRST
import "virtual:windi.css";
import "./styles/app.css";
import { render, Component, withStyles } from "nano-jsx";

// LAST
import { Logo } from "@src/components/logo";
import { Button } from "@src/components/functions/button";
import { ThemeSwitch } from "@src/components/functions/theme";
import { ThemeContext, Themes } from "@src/contexts/theme";

type State = {
  count: number;
};

class App extends Component<any, State> {
  theme: Themes;
  appStyle: string;
  constructor(props: any) {
    super(props);
    this.id = "App";
    this.initState = { count: 0 };
    this.theme = Themes.Light;
    this.appStyle = this.themeStyle(this.theme);
  }

  themeStyle(theme: Themes) {
    if (theme === Themes.Dark) return "bg-da-3";
    return "bg-li-3";
  }

  updateTheme = (theme: Themes) => {
    this.theme = theme;
    this.appStyle = this.themeStyle(theme);
    this.update();
  };

  increaseCount() {
    this.setState({ count: this.state.count + 1 }, true);
  }

  render() {
    // console.log("render App :: ", this.theme, this.appStyle);
    return (
      <ThemeContext.Provider value={this.theme}>
        <ThemeSwitch theme={this.theme} callback={this.updateTheme} />
        <main class={"flex$rows area$ fight$ extend$ " + this.appStyle}>
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
              src="/svgs/windicss.svg"
              alt="Windicss Logo"
            />
          </div>
          <h1 class="flex$ fight$items">Vite + NanoJSX + Windicss</h1>
          <div class="p-2em">
            <Button onClick={() => this.increaseCount()}>
              count is {this.state.count}
            </Button>
            <p class="mt-5">
              Edit <code class="text-[#888]">src/app.tsx</code> and save to test
              HMR
            </p>
          </div>
          <p class="text-[#888]">Click on any of the logos to learn more</p>
        </main>
      </ThemeContext.Provider>
    );
  }
}

render(<App />, document.body);
