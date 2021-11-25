class DunaState {
  constructor(state) {
    this.data = state;
  }

  bindEl(element) {
    this.el = element;
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;

    const event = new CustomEvent("stateChanged", { state: this.data });
    this.el.dispatchEvent(event);
  }
}
