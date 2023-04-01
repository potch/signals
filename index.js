const dependencies = new Map();

const addDependency = (from, to) => {
  if (!dependencies.has(to)) {
    dependencies.set(to, new Set());
  }
  dependencies.get(to).add(from);
};

// contexts are used to track dependencies.
// Effects and Computeds are pushed onto the context stack during construction.
let context = [];
const getContext = () => context.at(-1);

// batches are used to consolidate Effect updates
let inBatch = false;
let batchSet = new Set();

// source values
class Signal {
  constructor(value) {
    this._value = value;
  }
  set value(v) {
    if (v !== this._value) {
      this._value = v;
      if (dependencies.has(this)) {
        dependencies.get(this).forEach((c) => c.update());
      }
    }
  }
  get value() {
    if (getContext()) {
      addDependency(getContext(), this);
    }
    return this._value;
  }
}

// derived values from Signals or other Computeds
class Computed {
  constructor(fn) {
    this._update = fn;
    context.push(this);
    this.update();
    context.pop();
  }
  update() {
    const newValue = this._update();
    if (newValue !== this._value) {
      this._value = this._update();
      if (dependencies.has(this)) {
        dependencies.get(this).forEach((c) => c.update());
      }
    }
  }
  get value() {
    if (getContext()) {
      addDependency(getContext(), this);
    }
    return this._value;
  }
}

// effects are external "reactions" to value changes
// they can be combined using `batch`
class Effect {
  constructor(fn) {
    this._update = fn;
    context.push(this);
    this.update();
    context.pop();
  }
  update() {
    if (inBatch) {
      batchSet.add(this);
    } else {
      this._update();
    }
  }
}

// interface
export const signal = (v) => new Signal(v);
export const computed = (fn) => new Computed(fn);
export const effect = (fn) => new Effect(fn);
export const batch = async (fn) => {
  if (!inBatch) {
    inBatch = true;
    batchSet = new Set();
  }
  await fn();
  inBatch = false;
  batchSet.forEach((e) => e.update());
  batchSet = null;
};
