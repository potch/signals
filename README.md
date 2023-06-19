# signals

A tiny standalone implementation of reactive signals.

## Installation

```
npm install @potch/signals
```

## Demo

[view the demo live on Glitch!](https://signals-demo.glitch.me/)

or to run it locally:

```
npm start
```

then visit `localhost:8080` in your browser.

## Usage

```js
// `node example.js`
import { signal, computed, effect, batch, onchange } from "./index.js";

// signals can be any value
const a = signal(2);
const b = signal(3);

// computed values are based on signals
const c = computed(() => Math.sqrt(a.value * a.value + b.value * b.value));

// don't trigger dependent effects if the new value is the same
const perimeter = onchange(computed(() => a.value + b.value + c.value));

// effects are for having other code react to changes in signals or computed values
effect(() =>
  console.log(`the perimeter of the triangle is ${perimeter.value}`)
);

// effects and computed values are recomputed whenever their dependencies change
// in this case the new perimeter will be logged twice
console.log("updating sides without `batch`");
a.value = 4;
b.value = 5;

// use `batch` to update multiple signals and prevent multiple effect updates
// this time the new perimeter will only be logged once, after the batch is complete
console.log("updating sides with `batch`");
batch(() => {
  a.value = 5;
  b.value = 7;
});
```

## How it Works

I built this library to understand how basic reactive "signals" work. It's useful for small projects but there are more comprehensive first-party signals implementations available for frameworks and better reactive programming tools out there in general.

When a computed value or an effect is created, we mark it as the current context. When the initial value of the context is computed (by running the supplied function), the library detects every access to a signal or computed values `.value` property (via their `get value()` getters) and records a dependency. When the `.value` of signals is set, their dependencies are looked up in a `Map` and the `.update()` method is called. In the case of a computed value, this will update the computed value and propagate updates to _its_ dependencies. In the case of an effect, the effect function is triggered.

This may not be how other signals implementations work! I wanted to build this without reading anyone else's source first.
