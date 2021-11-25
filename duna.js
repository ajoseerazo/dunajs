class Duna {
  constructor(props) {
    this.events = props.events;
    this.view = props.view;
    this.state = props.state;
    this.eventsListeners = {};
  }

  bindEvents(el) {
    // console.log(`Bind ${this.id}`, el);
    
    if (this.el.id !== el.id || (this.el.id === el.id && !this.mounted)) {
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
    }

    for (let i = 0; i < el.children.length; i++) {
      this.bindEvents(el.children[i]);
    }

    if (!this.eventsListeners.stateChanged) {
      const stateChangedEventListener = function () {
        this.render();
      }.bind(this);

      this.eventsListeners.stateChanged = stateChangedEventListener;

      this.el.addEventListener("stateChanged", stateChangedEventListener);
    }
  }

  render() {
    // console.log("render()", this.id);
    // console.log("state", this.state);

    if (this.view) {
      this.el.innerHTML = this.view();
    } else {
      if (this.el.attributes["@text"]) {
        this.el.innerHTML = this.state[this.el.attributes["@text"].value];
      } else {
        const regExp = /{([^}]*)}/g;

        const content = this.context;

        const matches = content.match(regExp);

        let contentParsed = content;

        if (matches) {
          for (let i = 0; i < matches.length; i++) {
            Object.keys(this.state).forEach((key) => {
              const varRegExp = new RegExp(`${key}`, "g");
              const changed = matches[i].replace(
                varRegExp,
                `this.state.${key}`
              );

              contentParsed = contentParsed.replace(matches[i], changed);
            });
          }

          contentParsed = contentParsed.replace(/\{/g, "${");

          this.el.innerHTML = eval("`" + contentParsed + "`");
        }

        // console.log("Before ->");
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

    // this.bindEvents(this.el);

    this.render();
    this.mounted = true;
  }
}
