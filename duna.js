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

    if (el.attributes && el.attributes["@each"]) {
      return;
    }

    if (el.nodeType === 3 || el.nodeType === 8) {
      return;
    }

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

            func(index, e);
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
            const index = Array.prototype.indexOf.call(
              el.parentNode.children,
              el
            );
            func(
              e.target.type === "checkbox" ? e.target.checked : e.target.value
            );
          });
        }
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

  bindAttrs(el, ctx, template, parentNode, index) {
    if (!el.attributes) {
      return;
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
      console.log("CHECKED VALUE", el.attributes["@checked"].value);

      if (ctx) {
        console.log(
          "return `" +
            el.attributes["@checked"].value
              .replace(/this\.state/g, "state")
              .replace(/\{/g, "${") +
            "`"
        );

        const func = new Function(
          "state",
          "task",
          "return `" +
            el.attributes["@checked"].value
              .replace(/this\.state/g, "state")
              .replace(/\{/g, "${") +
            "`"
        );

        console.log(ctx);

        console.log(this.state.tasks);

        console.log(func(this.state, ctx["task"]));

        el.checked = JSON.parse(func(this.state, ctx["task"]));
      } else {
        let contentParsed = "";

        Object.keys(this.state).forEach((key) => {
          console.log("Key", key);

          const innerTemplate = template || el.attributes["@checked"].value;

          const index = innerTemplate.indexOf(key);

          if (index !== -1) {
            const varRegExp = new RegExp(`${key}`, "g");
            contentParsed = innerTemplate.replace(varRegExp, `state.${key}`);
          }
        });

        const func = new Function(
          "state",
          "return `" +
            contentParsed
              .replace(/this\.state/g, "state")
              .replace(/\{/g, "${") +
            "`"
        );

        console.log(ctx);

        console.log(this.state.tasks);

        console.log(func(this.state));

        el.checked = JSON.parse(func(this.state));

        if (!template) {
          this.addToContext("checked", el, el.attributes["@checked"].value);
        }
      }
    }

    if (el.attributes["@when"]) {
      console.log("EL->", el);

      console.log(el.attributes["@when"].value);

      const innerTemplate = template || el.attributes["@when"].value;

      let contentParsed = innerTemplate;

      Object.keys(this.state).forEach((key) => {
        console.log("Key", key);

        const index = innerTemplate.indexOf(key);

        if (index !== -1) {
          if (!template) {
            console.log("-->el", el.parentNode);

            const index = Array.prototype.indexOf.call(
              el.parentNode.children,
              el
            );

            console.log(index);

            this.addToContext(
              key,
              el,
              el.attributes["@when"].value,
              el.parentNode,
              index
            );
          }

          const varRegExp = new RegExp(`\\b${key}\\b`, "g");
          contentParsed = contentParsed.replace(varRegExp, `state.${key}`);

          console.log(contentParsed);
        }
      });
      console.log(
        "return `" +
          contentParsed.replace(/this\.state/g, "state").replace(/\{/g, "${") +
          "`"
      );

      const func = new Function(
        "state",
        "return `" +
          contentParsed.replace(/this\.state/g, "state").replace(/\{/g, "${") +
          "`"
      );

      const value = JSON.parse(func(this.state));

      if (!value) {
        el.remove();
        // el.style.display = "none";
      } else {
        // el.remove();
        // el.style.display = "flex";
        console.log(el);

        if (parentNode) {
          parentNode.insertBefore(el, parentNode.children[index]);
        } else {
          if (el.parentNode) {
            el.parentNode.insertBefore(el, el.parentNode.children[index]);
          }
        }
      }
    }

    const length = el.children.length;
    for (let i = 0; i < length; i++) {
      console.log("INSPECTED", el.children[i]);

      // this.bindAttrs(el.children[i], ctx);

      this.bindAttrs(
        el.children[i] ? el.children[i] : el.children[i - 1 > 0 ? i - 1 : 0],
        ctx,
        null,
        el.parentNode,
        i
      );
    }
  }

  /**
   * Convert a template string into HTML DOM nodes
   * @param  {String} str The template string
   * @return {Node}       The template HTML
   */
  stringToHTML(str) {
    var dom = document.createElement("div");
    dom.innerHTML = str;
    return dom.children[0];
  }

  parseFor2(el, templateEl) {
    console.log("FOR", el);

    const forEl = el.attributes["@each"]
      ? el
      : el.querySelector(["*[\\@each]"]);

    if (forEl) {
      const [innerVar, stateVar] =
        forEl.attributes["@each"].value.split(" in ");

      console.log(this.ctx[stateVar]);
      console.log(el);

      console.log("templateEl", templateEl);

      const innerContent = templateEl || forEl.innerHTML;

      if (!templateEl) {
        this.addToContext(stateVar, el, el.innerHTML);
      }

      forEl.innerHTML = "";

      let forContent = "";
      for (let i = 0; i < this.state[stateVar].length; i++) {
        console.log("Inner CONTENT", innerContent);
        forContent += innerContent;

        const htmlEl = this.stringToHTML(innerContent);

        console.log("HTMLEL", htmlEl);
        console.log(htmlEl.children);

        forEl.appendChild(htmlEl);

        this.virtualDOM(htmlEl, {
          [innerVar]: this.state[stateVar][i],
        });

        this.bindEvents(htmlEl);
        this.bindAttrs(htmlEl, {
          [innerVar]: this.state[stateVar][i],
        });
      }

      console.log("FOR CONTENT", forContent);
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

      this.addToContext(stateVar, el, el.innerHTML);

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

  insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
  }

  addToContext(key, node, template, parentNode, index) {
    if (!this.ctx[key]) {
      this.ctx[key] = [];
    }

    this.ctx[key].push({
      el: node,
      template: template,
      parentNode,
      index,
    });
  }

  bindNode(node, ctx, parent) {
    console.log("NODE VALUES");
    console.log(node.nodeValue);

    const regExp = /{([^}]*)}/g;

    const matches = node.nodeValue.match(regExp);

    console.log("TEXT Matches", matches);

    if (matches && matches.length > 0) {
      node.nodeValue = node.nodeValue.replace(/\{/g, "${");

      for (let i = 0; i < matches.length; i++) {
        let matchContent = matches[i];
        Object.keys(this.state).forEach((key) => {
          console.log("Key", key);
          console.log("matches[i]", matchContent);
          const varRegExp = new RegExp(`\\b(${key})\\b`, "g");
          console.log("varr", varRegExp);
          const changed = matchContent.replace(varRegExp, `this.state.${key}`);

          console.log("changed", changed);

          node.nodeValue = node.nodeValue.replace(matchContent, changed);

          matchContent = changed;
        });
      }

      console.log("LOCO", node.nodeValue);

      const varRegexp2 = new RegExp(/(\${.*?})/, "g");

      console.log("lll", node.nodeValue.split(varRegexp2));

      const texts = node.nodeValue.split(varRegexp2);

      console.log("TEXTS-->----", texts);

      const parentNode = node.parentNode;

      const insertBefore = !!node.nextSibling;

      let currentNode = node;

      console.log("PARENT", node.nodeValue);

      if (parent) {
        parent.appendChild(currentNode);
      }

      let count = 0;
      for (let k = 0; k < texts.length; k++) {
        const textNode = document.createTextNode(texts[k]);
        console.log("text value", textNode.nodeValue);

        if (textNode.nodeValue !== "") {
          Object.keys(this.state).forEach((key) => {
            console.log("Key", key);

            const index = textNode.nodeValue.indexOf(`this.state.${key}`);

            console.log("SUPER TEXT NODE", textNode);
            if (index !== -1) {
              this.addToContext(
                key,
                count === 0 ? currentNode : textNode,
                textNode.nodeValue
              );
            }
          });

          console.log("CTX----->", ctx);

          const innerVar = "task";

          console.log("CC", currentNode);

          if (ctx) {
            if (count === 0) {
              console.log(typeof ctx[innerVar]);
              console.log(
                "return `" +
                  textNode.nodeValue.replace(/this\.state/g, "state") +
                  "`"
              );

              const func = new Function(
                "state",
                innerVar,
                "return `" +
                  textNode.nodeValue.replace(/this\.state/g, "state") +
                  "`"
              );

              console.log("VALE", func(this.state, ctx[innerVar]));

              currentNode.nodeValue = func(this.state, ctx[innerVar]);
            } else {
              const func = new Function(
                "state",
                "task",
                "return `" +
                  textNode.nodeValue.replace(/this\.state/g, "state") +
                  "`"
              );

              textNode.nodeValue = func(this.state, ctx[innerVar]);
              this.insertAfter(textNode, currentNode);
              currentNode = textNode;
            }
          } else {
            if (count === 0) {
              currentNode.nodeValue = eval("`" + textNode.nodeValue + "`");
            } else {
              textNode.nodeValue = eval("`" + textNode.nodeValue + "`");
              this.insertAfter(textNode, currentNode);
              currentNode = textNode;
            }
          }
          count += 1;
        }
      }
    }
  }

  virtualDOM(el, ctx, parent) {
    console.log("SUper el", el);
    console.log("PP", parent);

    if (!el.virtualId) {
      el.virtualId = s4();
    }
    console.log("El", el);
    console.log(el.virtualId);
    console.log(this.state);
    console.log("CTX", ctx);

    if (el.nodeType !== 3 && el.nodeType !== 8 && el.attributes["@each"]) {
      this.parseFor2(el);

      return;
    }

    /*if (!this.ctx[el.virtualId]) {
      this.ctx[el.virtualId] = {}
    }

    console.log(this.ctx[el.virtualId]);*/

    /*console.log(el.innerHTML.trim());
    console.log(el.innerText.trim());
    console.log(el.innerHTML.trim() === el.innerText.trim());*/

    // const isRoot = !!el.attributes["@each"];

    // console.log("Root", el.html);

    if (el.nodeType === 3) {
      this.bindNode(el, ctx, parent);
    }

    console.log(
      "Child Nodes",
      Array.from(el.childNodes).filter((node) => node.nodeType === 3)
    );

    const textNodes = Array.from(el.childNodes).filter(
      (node) => node.nodeType === 3
    );

    console.log("TEXT NODES", textNodes);

    // const regExp = /{([^}]*)}/g;

    for (let j = 0; j < textNodes.length; j++) {
      this.bindNode(textNodes[j], ctx, parent);

      /*if (matches && matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
          console.log("Match", matches[i]);
          const regexString = Object.keys(this.state).reduce((ac, key) => {
            return `${ac ? `${ac}|` : ""}{${key}}`;
          }, "");

          console.log("REGEXSTRING", regexString);

          const varRegExp = new RegExp(`(${regexString})`);

          console.log(varRegExp);

          const texts = textNodes[j].nodeValue.split(varRegExp);

          console.log("TEXTS-->", texts);

          console.log(textNodes[j]);

          const parentNode = textNodes[j].parentNode;

          console.log("PARENT NODE", parentNode);

          console.log(textNodes[j].nextSibling);

          // textNodes[j].remove();

          for (let k = 0; k < texts.length; k++) {
            const textNode = document.createTextNode(texts[k]);
            if (textNode.nodeValue !== "") {
              textNodes[j].nextSibling;
              if (textNodes[j].nextSibling) {
                parentNode.insertBefore(textNode, textNodes[j].nextSibling);
              } else {
                parentNode.appendChild(textNode);
              }

              if (textNode.nodeValue.trim() === matches[i].trim()) {
                let contentParsed = textNode.nodeValue;
                Object.keys(this.state).forEach((key) => {
                  console.log("Key", key);

                  const index = textNode.nodeValue.indexOf(key);

                  if (index !== -1) {
                    if (!this.ctx[key]) {
                      this.ctx[key] = [];
                    }

                    let templateEl = this.ctx[key].find(
                      (_el) => _el.virtualId === el.virtualId
                    );

                    if (!templateEl) {
                      templateEl = {
                        virtualId: el.virtualId,
                        el: textNode,
                        // template: el.innerHTML,
                      };
                      this.ctx[key].push(templateEl);
                    }

                    const varRegExp = new RegExp(`${key}`, "g");
                    const changed = matches[i].replace(
                      varRegExp,
                      `this.state.${key}`
                    );

                    contentParsed = contentParsed.replace(
                      textNode.nodeValue,
                      changed
                    );

                    console.log("Partial Content Parsed", contentParsed);
                  }
                });

                contentParsed = contentParsed.replace(/\{/g, "${");

                textNode.nodeValue = eval("`" + contentParsed + "`");
              }
            }
          }*/

      /*Object.keys(this.state).forEach((key) => {
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

              console.log("CONTEXTKEY", this.ctx[key]);

              const varRegExp = new RegExp(`({${key}}|{doubled})`);

              console.log("Var", varRegExp);

              /*console.log(templateEl.el);

              console.log(templateEl.el.nodeValue);

              console.log(templateEl.el.nodeValue.split(varRegExp));

              console.log(templateEl.el.parentNode);*

              const parentNode = textNodes[j].parentNode;

              textNodes[j].remove();

              const texts = textNodes[j].nodeValue.split(varRegExp);

              console.log("Texts", texts);

              for (let k = 0; k < texts.length; k++) {
                const textNode = document.createTextNode(texts[k]);
                if (textNode.nodeValue !== "") {
                  parentNode.appendChild(textNode);

                  if (textNode.nodeValue.trim() === matches[i].trim()) {
                    textNode.nodeValue = this.state[key];

                    if (!templateEl) {
                      templateEl = {
                        virtualId: el.virtualId,
                        el: textNode,
                        // template: el.innerHTML,
                      };
                      this.ctx[key].push(templateEl);
                    }
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

              console.log("Partial Content Parsed", contentParsed);
            }
          });*
        }
      }*/
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

    // if (!isRoot) {
    for (let i = 0; i < Array.from(el.childNodes).length; i++) {
      console.log(Array.from(el.childNodes)[i]);
      this.virtualDOM(Array.from(el.childNodes)[i], ctx, parent);
    }
    // }

    /*this.ctx["tasks"] = [document.querySelector("input")];

    this.ctx["tasks"][0].value = "Prro"*/
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
            console.log("CTX-PROP", that.ctx[prop]);

            if (that.ctx[prop]) {
              for (let i = 0; i < that.ctx[prop].length; i++) {
                if (that.ctx[prop][i].attribute === "@value") {
                  that.ctx[prop][i].el.value = value;
                } else {
                  console.log(that.ctx[prop][i].el.attributes);
                  if (
                    that.ctx[prop][i].el.attributes &&
                    that.ctx[prop][i].el.attributes["@each"]
                  ) {
                    console.log("VirtualId", that.ctx[prop][i].el.virtualId);
                    that.parseFor2(
                      that.ctx[prop][i].el,
                      that.ctx[prop][i].template
                    );

                    console.log(that.ctx[prop][i].el);

                    for (
                      let k = 0;
                      k < Array.from(that.ctx[prop][i].el.childNodes).length;
                      k++
                    ) {
                      // console.log(Array.from(el.childNodes)[i]);
                      that.virtualDOM(
                        Array.from(that.ctx[prop][i].el.childNodes)[k]
                      );
                    }
                  } else {
                    if (
                      that.ctx[prop][i].el.attributes &&
                      that.ctx[prop][i].el.attributes["@checked"]
                    ) {
                      that.bindAttrs(
                        that.ctx[prop][i].el,
                        null,
                        that.ctx[prop][i].template
                      );
                    } else {
                      if (
                        that.ctx[prop][i].el.attributes &&
                        that.ctx[prop][i].el.attributes["@when"]
                      ) {
                        that.bindAttrs(
                          that.ctx[prop][i].el,
                          null,
                          that.ctx[prop][i].template,
                          that.ctx[prop][i].parentNode,
                          that.ctx[prop][i].index
                        );
                      } else {
                        console.log(that.ctx[prop][i].template);
                        that.ctx[prop][i].el.nodeValue = eval(
                          "`" +
                            that.ctx[prop][i].template.replace(
                              /this/g,
                              "that"
                            ) +
                            "`"
                        );
                      }
                    }
                  }
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
    this.bindAttrs(this.el);

    this.mounted = true;
  }
}
