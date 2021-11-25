class Duna {
  constructor(props) {
    this.events = props.events;
    this.view = props.view;
    this.state = props.state;
  }

  bindEvents() {
    /*if (this.events && this.events.onClick) {
     this.el.addEventListener('click', this.events.onClick);
   }*/

    if (this.el.attributes["@click"]) {
      if (this.events[this.el.attributes["@click"].value]) {
        this.el.addEventListener(
          "click",
          this.events[this.el.attributes["@click"].value]
        );
      }
    }

    if (this.el.attributes["@change"]) {
      if (this.events[this.el.attributes["@change"].value]) {
        this.el.addEventListener(
          "change",
          this.events[this.el.attributes["@change"].value]
        );
      }
    }

    this.el.addEventListener(
      "stateChanged",
      function () {
        this.render();
      }.bind(this)
    );
  }

  render() {
    if (this.view) {
      this.el.innerHTML = this.view();
    } else {
      const regExp = /\{\s*.*\s*\}/g;

      const content = this.context;

      const matches = content.match(regExp);

      const variables = [];
      if (matches) {
        for (let i = 0; i < matches.length; i++) {
          const variable = matches[i]
            .replace(/\{\s/g, "")
            .replace(/\s*\}/g, "");

          const value = this.state.get(variable);

          // console.log("New Value", value);

          const regExp = new RegExp(`${matches[i]}`, "g");

          const newContent = content.replace(regExp, value);

          this.el.innerHTML = newContent;

          variables.push(variable);
        }
      }

      // console.log("Variables", variables);
    }
  }

  mount(id) {
    this.id = id;
    this.el = document.querySelector(this.id);
    this.context = this.el.innerHTML;

    if (this.state) {
      this.state = new DunaState(this.state);
      this.state.bindEl(this.el);

      if (this.el.attributes["@value"]) {
        // console.log(this.el.attributes["@value"].value);
        // console.log(this.state.get(this.el.attributes["@value"].value));

        this.el.value = this.state.get(this.el.attributes["@value"].value);
      }
    }

    this.bindEvents();

    this.render();
  }
}
