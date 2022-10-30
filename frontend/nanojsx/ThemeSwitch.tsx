import { Component } from "nano-jsx";

type Theme = {
  class_name: string;
  human_name: string;
};

type Prop = {
  theme: string;
  themes: Theme[];
};

type State = {
  theme: string;
};

export class ThemeSwitch extends Component<Prop, State> {
  private themes: Theme[];
  constructor(props: Prop) {
    super(props);
    this.id = "ThemeSwitcher";
    this.themes = props.themes;
    this.initState = { theme: props.theme };
  }

  didMount() {
    // add main theme to html tag class
    // document.documentElement.setAttribute("__theme", "bg$bg");
    this.updateTheme(this.state.theme);
  }

  updateTheme = (theme: State["theme"]) => {
    document.documentElement.setAttribute("theme", theme);
    this.setState({ ...this.state, theme }, false);
  };

  render() {
    return (
      <select
        onChange={(e: any) => this.updateTheme(e.target.value)}
        class="absolute w-110px h-50px left-10 top-10 ring-0 outline-0 z-10 rounded px-5"
      >
        {Object.entries(this.themes).map(([k, v]) => {

          return (
            <option
              selected={v.class_name === this.state.theme ? "selected" : undefined}
              value={v.class_name}
            >
              {v.human_name}
            </option>
          );
        })}
      </select>
    );
  }
}
