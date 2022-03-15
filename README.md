# dunajs

DunaJS is an open-source, zero configuration, tiny javascript library to build User Interfaces manipulating direclty the DOM, without the need of installing extra dependencies (WIP)

## Installation

#### Using npm

````
npm install @kirckz/duna 
````

#### Using yarn

````
yarn add @kirckz/duna
````

#### Using CDN

Just add this to your HTML

````html
<script src="https://cdn.jsdelivr.net/npm/@kirckz/duna@0.0.5"></script>
````

## Motivation

Using ReactJS, Vue or Angular just to add simple dinamycal behaviors to a website, like validate a form, call an API, show a Modal, manipulate the DOM or other examples is overcharging. But do it this using vanilla javascript could be annoying. 

For this reason **DunaJs** is an tiny and simple DOM manipulation library, that allows to add dinamycal behaviors to a website without installing large libraries or dependencies, and without extra configurations, and manipulating the **DOM directly, no Virtual DOM**.

With **DunaJs** you don't need to create templates or extra files, just add especial attributes to your html, and the magic will happen. For example, lets say you have a button in your site, and you want to perform an operation when a click event is triggered.

```html
<button id="button" @click="click">Button</button>

<script>
  const button = new Duna({
    events: {
      click: () {
         // Perform your logic here
         alert();
      }
    }
  });
  
  button.mount("#button);
<script>
```

#### State handling

In **DunaJS** is possible to handle internal state in an easy way. Each state change, will cause the component to re-render.

```html
<div id="input-container">
  <input @changeValue="changeInput" @value="value" />
  <div>Input value: { value }</div>
</div>

<script>
  const inputContainer = new Duna({
    state: {
      value: ""
    },
    events: {
      onChangeName(value) {
        this.state.name = value;
      },
    }
  });
  
  inputContainer.mount("#input-container);
<scritp>
```

### Flow control

With **DunaJS** you can control the flow of your site using **conditionals** and **loops**

#### Conditionals

```html
<div id="button">
  <button @click="toggle" @when="{ loggedIn === true }">Log out</button>

  <button @click="toggle" @when="{ loggedIn === false }">Log in</button>

  <div @when="{ loggedIn === true }">
    <span>Bienvenido <span>{ name } { count }</span></span>
  </div>
</div>

<script>
  const button = new Duna({
    state: {
      loggedIn: false,
      name: "Amilcar Jose",
      count: 0,
    },
    events: {
      toggle() {
        this.state.loggedIn = !this.state.loggedIn;
        this.state.count += 1;

        if (this.state.count > 3) {
          this.state.name = "Stan Lee";
          this.state.count = 0;
        } else {
          this.state.name = "Obi Wan Kenobi";
        }
      },
    },
  });

  button.mount("#button");
</script>
```

#### Loops

Also, is possible to iterate over a variable

```html
<ul id="for-each" @each="task in cats">
  <li>
    <a target="_blank" href="https://youtube.com"> { task.name } </a>
  </li>
</ul>

<script>
  const forEach = new Duna({
    state: {
      cats: [
        { id: "J---aiyznGQ", name: "Keyboard Cat" },
        { id: "z_AbfPXTKms", name: "Maru" },
        { id: "OUtn3pvWmpg", name: "Henri The Existential Cat" },
      ],
    },
  });

  forEach.mount("#for-each");
</script>
```

### Example (Form Validation)

```html
 <form id="form">
  <div>
    <label>Name</label>
    <input @value="name" @changeValue="onChangeName" />
    <span @when="{ name_error !== '' }">{ name_error }</span>
  </div>

  <div>
    <label>Last Name</label>
    <input @value="last_name" @changeValue="onChangeLastName" />
    <span @when="{ last_name_error !== '' }">{ last_name_error }</span>
  </div>

  <div>
    <label>Genre</label>
    <select @value="genre" @changeValue="onChangeGenre">
      <option value="masculino">Masculino</option>
      <option value="femenino">Femenino</option>
    </select>
  </div>

  <div>
    <span @when="{ name_error === '' && last_name_error === '' && genre === ''}"
      >No hay errores</span
    >

    <button @click="click">Validate</button>
  </div>
</form>

<script>
  const form = new Duna({
    state: {
      name: "",
      last_name: "",
      name_error: "",
      last_name_error: "",
      genre: "",
    },
    onMounted() {
      console.log("mounted");
    },
    methods: {
      alert() {
        console.log("THIS->", this);
        alert();
      },
    },
    events: {
      click(_, e) {
        e.preventDefault();
        this.methods.alert();

        let isValid = true;
        if (!this.state.name) {
          this.state.name_error = "The name is required";
          isValid = false;
        } else {
          this.state.name_error = "";
        }

        if (!this.state.last_name) {
          this.state.last_name_error = "The last name is required";
          isValid = false;
        } else {
          this.state.last_name_error = "";
        }

        if (!this.state.genre) {
          isValid = false;
        }

        if (isValid) {
          alert("The form is valid!!!");
        }
      },
      onChangeName(value) {
        this.state.name = value;
      },
      onChangeLastName(value) {
        this.state.last_name = value;
      },
      onChangeGenre(value) {
        this.state.genre = value;
      },
    },
  });

  form.mount("#form");
</script>
```

