let s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

class Duna {
  constructor(props) {
    this.events = props.events;
    this.view = props.view;
    this.state = props.state;
    this.eventsListeners = {};
    this.for = null;
    this.ctx = {};
  }

  bindEvents(el) {
    console.log(`Bind ${this.id}`, el);
    // console.log(el);

    if (this.el.id !== el.id || (this.el.id === el.id && !this.mounted)) {
      console.log("HERE");
      if (el.attributes["@click"]) {
        if (this.events[el.attributes["@click"].value]) {
          el.addEventListener("click", (e) => {
            const func = this.events[el.attributes["@click"].value].bind(this);
            const index = Array.prototype.indexOf.call(
              el.parentNode.children,
              el
            );

            func(index);
          });
        }
      }

      if (el.attributes["@changeValue"]) {
        if (this.events[el.attributes["@changeValue"].value]) {
          el.addEventListener("keyup", (e) => {
            const func =
              this.events[el.attributes["@changeValue"].value].bind(this);
            func(e.target.value);
          });
        }
      }

      if (el.attributes["@change"]) {
        if (this.events[el.attributes["@change"].value]) {
          el.addEventListener("change", (e) => {
            const func = this.events[el.attributes["@change"].value].bind(this);
            func(e.type === "checkbox" ? e.target.checked : e.target.value);
          });
        }
      }
    }

    if (el.attributes["@value"]) {
      const key = el.attributes["@value"].value;

      if (!this.ctx[key]) {
        this.ctx[key] = [];
      }

      let templateEl = this.ctx[key].find(
        (_el) => _el.virtualId === el.virtualId
      );

      console.log("EL INDEX", templateEl);

      if (!templateEl) {
        templateEl = {
          virtualId: el.virtualId,
          el,
          attribute: "@value",
          template: el.innerHTML,
        };
        this.ctx[key].push(templateEl);
      }

      el.value = this.state[key];

      console.log("INPUT TEMPLATE", templateEl);
    }

    if (el.attributes["@checked"]) {
      console.log(el.attributes["@checked"].value);
      if (
        el.attributes["@checked"].value === "true" ||
        el.attributes["@checked"].value === "false"
      ) {
        el.checked = JSON.parse(el.attributes["@checked"].value);
      }
    }

    for (let i = 0; i < el.children.length; i++) {
      this.bindEvents(el.children[i]);
    }

    if (!this.eventsListeners.stateChanged) {
      const stateChangedEventListener = function () {
        // this.virtualDOM(this.el);
      }.bind(this);

      this.eventsListeners.stateChanged = stateChangedEventListener;

      this.el.addEventListener("stateChanged", stateChangedEventListener);
    }
  }

  parseFor(el) {
    console.log("PARSING FOR");
    const forEl = el.attributes["@each"]
      ? el
      : el.querySelector(["*[\\@each]"]);

    let newInnerContent = "";

    if (forEl) {
      const [innerVar, stateVar] =
        forEl.attributes["@each"].value.split(" in ");

      let templateEl = this.ctx[stateVar]
        ? this.ctx[stateVar].find((_el) => _el.virtualId === el.virtualId)
        : null;

      const innerContent = templateEl ? templateEl.template : forEl.innerHTML;

      let contentParsed = innerContent;

      if (!this.ctx[stateVar]) {
        this.ctx[stateVar] = [];
      }

      console.log("EL INDEX", templateEl);

      if (!templateEl) {
        templateEl = {
          virtualId: el.virtualId,
          el,
          template: el.innerHTML,
        };
        this.ctx[stateVar].push(templateEl);
      }

      for (let i = 0; i < this.state[stateVar].length; i++) {
        Object.keys(this.state).forEach((key) => {
          console.log("Key", key);

          const index = innerContent.indexOf(key);

          if (index !== -1) {
            const varRegExp = new RegExp(`${key}`, "g");
            console.log(innerContent);
            const changed = innerContent.replace(varRegExp, `state.${key}`);

            console.log(changed);

            contentParsed = changed;

            console.log("Partial Content Parsed", contentParsed);
          }
        });

        console.log("INNER CONTENT PARSED", contentParsed);

        console.log(
          "const " +
            innerVar +
            " = " +
            (typeof this.state[stateVar][i] === "string"
              ? '"' + this.state[stateVar][i] + '"'
              : Array.isArray(this.state[stateVar])
              ? typeof this.state[stateVar][i] === "object"
                ? JSON.stringify(this.state[stateVar][i])
                : this.state[stateVar][i]
              : this.state[stateVar][i]) +
            "; return `" +
            contentParsed.replace(/\{/g, "${") +
            "`"
        );

        const func = new Function(
          "state",
          "const " +
            innerVar +
            " = " +
            (typeof this.state[stateVar][i] === "string"
              ? '"' + this.state[stateVar][i] + '"'
              : Array.isArray(this.state[stateVar])
              ? typeof this.state[stateVar][i] === "object"
                ? JSON.stringify(this.state[stateVar][i])
                : this.state[stateVar][i]
              : this.state[stateVar][i]) +
            "; return `" +
            contentParsed.replace(/\{/g, "${") +
            "`"
        );

        newInnerContent += func(this.state);

        console.log("PartialNew", newInnerContent);
      }

      console.log("New Inner Content", newInnerContent);
      console.log("TEMPLATE", innerContent);

      return {
        oldContent: innerContent,
        newInnerContent,
      };
    }

    return {};
  }

  virtualDOM(el, ctx) {
    console.log("SUper el", el);

    if (!el.virtualId) {
      el.virtualId = s4();
    }
    console.log("El", el);
    console.log(el.virtualId);
    console.log(this.state);
    console.log("CTX", ctx);

    /*if (!this.ctx[el.virtualId]) {
      this.ctx[el.virtualId] = {}
    }

    console.log(this.ctx[el.virtualId]);*/

    /*console.log(el.innerHTML.trim());
    console.log(el.innerText.trim());
    console.log(el.innerHTML.trim() === el.innerText.trim());*/

    const isRoot = !!el.attributes["@each"];

    console.log("Root", el.html);

    console.log(
      "Child Nodes",
      Array.from(el.childNodes).filter((node) => node.nodeType === 3)
    );

    const textNodes = Array.from(el.childNodes).filter(
      (node) => node.nodeType === 3
    );

    const regExp = /{([^}]*)}/g;
    for (let j = 0; j < textNodes.length; j++) {
      console.log("NODE VALUES");
      console.log(textNodes[j].nodeValue);

      const matches = textNodes[j].nodeValue.match(regExp);

      console.log("TEXT Matches", matches);

      if (matches && matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
          console.log("Match", matches[i]);
          Object.keys(this.state).forEach((key) => {
            console.log("Key", key);

            const index = matches[i].indexOf(key);

            if (index !== -1) {
              console.log("SI MATCHES", key);

              console.log(textNodes[j].nodeValue);

              // textNodes[j].nodeValue = "MAMALO"
              if (!this.ctx[key]) {
                this.ctx[key] = [];
              }

              let templateEl = this.ctx[key].find(
                (_el) => _el.virtualId === el.virtualId
              );

              console.log("EL INDEX", templateEl);

              if (!templateEl) {
                templateEl = {
                  virtualId: el.virtualId,
                  el: textNodes[j],
                  // template: el.innerHTML,
                };
                this.ctx[key].push(templateEl);
              }

              console.log("CONTEXTKEY", this.ctx[key]);

              const varRegExp = new RegExp(`({${key}})`);

              console.log("Var", varRegExp);

              console.log(templateEl.el);

              console.log(templateEl.el.nodeValue);

              console.log(templateEl.el.nodeValue.split(varRegExp));

              console.log(templateEl.el.parentNode);

              const parentNode = templateEl.el.parentNode;

              textNodes[j].remove();

              const texts = templateEl.el.nodeValue.split(varRegExp);

              for (let k = 0; k < texts.length; k++) {
                const textNode = document.createTextNode(texts[k]);
                if (textNode.nodeValue !== "") {
                  parentNode.appendChild(textNode);

                  if (textNode.nodeValue.trim() === matches[i].trim()) {
                    alert();
                    textNode.nodeValue = this.state[key];
                  }
                }
              }

              // templateEl.el.nodeValue = this.state[key];

              /*const varRegExp = new RegExp(`${key}`, "g");
              const changed = matches[i].replace(
                varRegExp,
                `this.state.${key}`
              );

              console.log("State", this.state);
              console.log("ctx", ctx);
              console.log(ctx ? ctx.template : this.ctx[key].template);

              contentParsed = contentParsed
                ? contentParsed.replace(matches[i], changed)
                : templateEl.template.replace(matches[i], changed);

              console.log("Partial Content Parsed", contentParsed);*/
            }
          });
        }
      }
    }

    /*if (el.innerHTML.trim() === el.innerText.trim() || isRoot) {
      const regExp = /{([^}]*)}/g;

      console.log("ELLLLLL", el);

      let contentParsed = "";

      const { oldContent, newInnerContent } = this.parseFor(el);

      if (oldContent !== undefined && newInnerContent !== undefined) {
        console.log("SUPER TEMPLATE", ctx ? ctx.template : el.innerHTML);
        contentParsed = newInnerContent;
        console.log("NEW INNER CONTENT OUT", newInnerContent);
      }

      const matches = ctx
        ? ctx.template.match(regExp)
        : el.innerText.match(regExp);

      console.log("MATCHES", matches);

      if (matches) {
        if (!isRoot) {
          for (let i = 0; i < matches.length; i++) {
            console.log("Match", matches[i]);
            Object.keys(this.state).forEach((key) => {
              console.log("Key", key);

              const index = matches[i].indexOf(key);

              if (index !== -1) {
                if (!this.ctx[key]) {
                  this.ctx[key] = [];
                }

                let templateEl = this.ctx[key].find(
                  (_el) => _el.virtualId === el.virtualId
                );

                console.log("EL INDEX", templateEl);

                if (!templateEl) {
                  templateEl = {
                    virtualId: el.virtualId,
                    el,
                    template: el.innerHTML,
                  };
                  this.ctx[key].push(templateEl);
                }

                console.log(this.ctx[key]);

                const varRegExp = new RegExp(`${key}`, "g");
                const changed = matches[i].replace(
                  varRegExp,
                  `this.state.${key}`
                );

                console.log("Var", varRegExp);
                console.log("State", this.state);
                console.log("ctx", ctx);
                console.log(ctx ? ctx.template : this.ctx[key].template);

                contentParsed = contentParsed
                  ? contentParsed.replace(matches[i], changed)
                  : templateEl.template.replace(matches[i], changed);

                console.log("Partial Content Parsed", contentParsed);
              }
            });
          }
        }

        contentParsed = contentParsed.replace(/\{/g, "${");

        console.log("Content Parsed", contentParsed);

        el.innerHTML = eval("`" + contentParsed + "`");

        if (this.mounted && isRoot) {
          this.bindEvents(el);
        }
        // this.el.innerHTML = eval("`" + contentParsed + "`");
      }
      console.log("Bind to this", el);

      console.log(this.ctx);
    }*/

    if (!isRoot) {
      for (let i = 0; i < el.children.length; i++) {
        console.log(el.children[i]);
        this.virtualDOM(el.children[i], ctx);
      }
    }

    /*this.ctx["tasks"] = [document.querySelector("input")];

    this.ctx["tasks"][0].value = "Prro"*/
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

        const { oldContent, newInnerContent } = this.parseFor(this.el);

        if (oldContent !== undefined && newInnerContent !== undefined) {
          contentParsed = contentParsed.replace(oldContent, newInnerContent);
        }

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
      const that = this;
      this.state = new Proxy(this.state, {
        set: function (obj, prop, value) {
          console.log("PROP", prop);

          if (value !== obj[prop]) {
            obj[prop] = value;
            console.log(that.ctx[prop]);

            if (that.ctx[prop]) {
              for (let i = 0; i < that.ctx[prop].length; i++) {
                if (that.ctx[prop][i].attribute === "@value") {
                  that.ctx[prop][i].el.value = value;
                } else {
                  let templateEl = that.ctx[prop].find(
                    (_el) => _el.virtualId === that.ctx[prop][i].el.virtualId
                  );

                  that.virtualDOM(that.ctx[prop][i].el, templateEl);
                }
              }
            }

            const event = new CustomEvent("stateChanged", { state: this.data });
            el.dispatchEvent(event);
            return true;
          }
        },
        get: function (obj, prop) {
          return obj[prop];
        },
      });
    }

    // this.bindEvents(this.el);

    // this.render();

    this.virtualDOM(this.el);
    this.bindEvents(this.el);

    this.mounted = true;
  }
}
