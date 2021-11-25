class Duna {
  constructor(props) {
    this.events = props.events;
    this.view = props.view;
    this.state = props.state;
  }

  bindEvents(el) {
    /*if (this.events && this.events.onClick) {
     this.el.addEventListener('click', this.events.onClick);
   }*/

    if (el.attributes["@click"]) {
      if (this.events[el.attributes["@click"].value]) {
        el.addEventListener(
          "click",
          this.events[el.attributes["@click"].value].bind(this)
        );
      }
    }

    if (el.attributes["@change"]) {
      if (this.events[el.attributes["@change"].value]) {
        el.addEventListener(
          "change",
          this.events[el.attributes["@change"].value].bind(this)
        );
      }
    }

    for (let i = 0; i < el.children.length; i++) {
      this.bindEvents(el.children[i])
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
      if (this.el.attributes["@text"]) {
        this.el.innerHTML = this.state[this.el.attributes["@text"].value];
      } else {
        const regExp = /{([^}]*)}/g;

        const content = this.context;

        const matches = content.match(regExp);
        console.log(matches);

        let contentParsed = content.replace(/\{/g, "${");

        Object.keys(this.state).forEach((key) => {
          console.log(key);
          const varRegExp = new RegExp(`${key}`, "g");
          contentParsed = contentParsed.replace(varRegExp, `this.state.${key}`);
        });

        this.el.innerHTML = eval("`" + contentParsed + "`");
        this.bindEvents(this.el);
      }
    }
  }

  mount(id) {
    this.id = id;
    this.el = document.querySelector(this.id);

    if (!this.el) {
      throw new Error("Element doesn't exists in the DOM");
    }

    this.context = this.el.innerHTML;

    if (this.state) {
      const el = this.el;
      this.state = new Proxy(this.state, {
        set: function (obj, prop, value) {
          obj[prop] = value;
          const event = new CustomEvent("stateChanged", { state: this.data });
          el.dispatchEvent(event);
          return true;
        },
        get: function (obj, prop) {
          return obj[prop];
        },
      });

      // this.state.bindEl(this.el);

      if (this.el.attributes["@value"]) {
        // console.log(this.el.attributes["@value"].value);
        // console.log(this.state.get(this.el.attributes["@value"].value));

        this.el.value = this.state[this.el.attributes["@value"].value];
      }
    }

    this.bindEvents(this.el);

    this.render();
  }
}
