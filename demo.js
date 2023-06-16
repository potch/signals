import { signal, computed, effect, batch } from "./index.js";

const whenChanged = (source) => {
  let lastVal = source.value;
  let output = signal(lastVal);
  effect(() => {
    if (lastVal !== source.value) {
      lastVal = output.value = source.value;
    }
  });
  return output;
};

// small dom creation helper
const makeEl = (name, props = {}, fn) => {
  const [tag, ...classes] = name.split(".");
  const el = document.createElement(tag);
  el.classList.add(...classes);
  return Object.assign(el, props, (fn && fn(el)) || {});
};

// create signals
const r = signal(192);
const g = signal(192);
const b = signal(192);
const color = computed(() => `rgb(${r.value},${g.value},${b.value})`);
const isDark = whenChanged(
  computed(() => r.value * 0.299 + g.value * 0.587 + b.value * 0.114 < 128)
);

// build interface
const form = makeEl("form.form");
const label = makeEl("div.label");

const Slider = (name, signal) =>
  makeEl(
    "input",
    {
      type: "range",
      min: 0,
      max: 255,
      name,
      value: signal.value,
      oninput: (e) => (signal.value = parseFloat(e.target.value)),
    },
    (el) => {
      effect(() => (el.value = signal.value));
    }
  );

form.append(
  Slider("red", r),
  Slider("green", g),
  Slider("blue", b),
  makeEl("button", {
    innerText: "reset",
    onclick: (e) => {
      e.preventDefault();
      // only trigger one update vs 3 by using `batch`
      batch(() => {
        r.value = 192;
        g.value = 192;
        b.value = 192;
      });
    },
  }),
  label
);

document.body.append(form);

// update display and background color when derived color changes
effect(() => (document.body.style.backgroundColor = color.value));
effect(() => (label.innerText = color.value));

// change text color when bg is dark enough
effect(
  () =>
    console.log("isDark") ||
    document.body.classList.toggle("bg-dark", isDark.value)
);
