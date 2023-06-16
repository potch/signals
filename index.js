export const group = () => {
  // dependencies track relationships between signals and which effects use them
  const dependencies = new Map();

  const addDependency = (from, to) => {
    if (!dependencies.has(to)) {
      dependencies.set(to, new Set());
    }
    dependencies.get(to).add(from);
  };

  // contexts are used to track dependencies.
  // effects are pushed onto the context stack during construction.
  const contextStack = [];

  const batchSet = new Set();
  let inBatch = false;

  // pure value sources
  const signal = (_value) => {
    return {
      set value(v) {
        _value = v;
        if (dependencies.has(this)) {
          dependencies
            .get(this)
            .forEach(inBatch ? (fn) => batchSet.add(fn) : (fn) => fn());
        }
      },
      get value() {
        // are we currently in the context of an effect? set up a dependency
        const currentContext = contextStack.at(-1);
        if (currentContext && currentContext != this) {
          addDependency(currentContext, this);
        }
        return _value;
      },
    };
  };

  // pure effect
  const effect = (fn) => {
    contextStack.push(fn);
    fn();
    contextStack.pop();
  };

  // computed signals are just a signal and an effect stapled together
  const computed = (fn) => {
    const s = signal();
    effect(() => {
      s.value = fn();
    });
    return {
      get value() {
        return s.value;
      },
    };
  };

  // allow for multiple signals to be updated at once (or one many times) without propagating effects
  const batch = (fn) => {
    inBatch = true;
    fn();
    inBatch = false;
    batchSet.forEach((fn) => fn());
    batchSet.clear();
  };

  return { signal, effect, computed, batch };
};

export const { signal, effect, computed, batch } = group();
