# dunajs

DunaJS is an open-source, zero configuration, tiny javascript library to build User Interfaces manipulating direclty the DOM, without the need of installing extra dependencies (WIP)

## Motivation

Using ReactJS, Vue or Angular just to add simple dinamycal behaviors to a website, like validate a form, call an API, show a Modal, manipulate the DOM or other examples is overcharging. But do it this using vanilla javascript could be annoying. 

For this reason **DunaJs** is an tiny and simple DOM manipulation library, that allows to add dinamycal behaviors to a website without installing large libraries or dependencies, and without extra configurations.

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
<scritp>
```

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

## Examples


