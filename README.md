# signals

A tiny standalone implementation of reactive signals.

## Installation

```
npm install @potch/signals
```

## Demo

```
npm start
```

then visit `localhost:8080` in your browser.

## Usage

```js
// see example.js
import { signal, computed, effect, batch } from "@potch/signals";

// signals can be any value
const a = signal(2);
const b = signal(3);

// computed values are based on signals
const c = computed(() => Math.sqrt(a.value * a.value + b.value * b.value));

// computed values can also be based on a mix of signals and other computed values
const perimeter = computed(() => a.value + b.value + c.value);

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
