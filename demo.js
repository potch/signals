import { signal, computed, effect, batch } from "./index.js";

// small dom creation helper
const makeEl = (tag, props = {}) =>
  Object.assign(document.createElement(tag), props);

// create signals
const r = signal(192);
const g = signal(192);
const b = signal(192);
const color = computed(() => `rgb(${r.value},${g.value},${b.value})`);
const isDark = computed(
  () => r.value * 0.299 + g.value * 0.587 + b.value * 0.114 < 128
);

// build interface
const form = makeEl("form", { className: "form" });
const label = makeEl("div", { className: "label" });

const rgbRange = {
  type: "range",
  min: 0,
  max: 255,
};

form.append(
  makeEl("input", {
    ...rgbRange,
    name: "red",
    value: r.value,
    oninput: (e) => (r.value = parseFloat(e.target.value)),
  }),
  makeEl("input", {
    ...rgbRange,
    name: "green",
    value: g.value,
    oninput: (e) => (g.value = parseFloat(e.target.value)),
  }),
  makeEl("input", {
    ...rgbRange,
    name: "blue",
    value: b.value,
    oninput: (e) => (b.value = parseFloat(e.target.value)),
  }),
  Object.assign(document.createElement("button"), {
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

// wire up two way binding between color channel signal and input
effect(() => (form.elements.red.value = r.value));
effect(() => (form.elements.green.value = g.value));
effect(() => (form.elements.blue.value = b.value));

// change text color when bg is dark enough
effect(() => document.body.classList.toggle("bg-dark", isDark.value));
