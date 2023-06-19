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
