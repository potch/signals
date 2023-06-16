export const group = () => {
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

  const signal = (_value, label) => {
    return {
      label,
      set value(v) {
        _value = v;
        if (dependencies.has(this)) {
          if (inBatch) {
            dependencies.get(this).forEach((fn) => batchSet.add(fn));
          } else {
            dependencies.get(this).forEach((fn) => fn());
          }
        }
      },
      get value() {
        const currentContext = contextStack.at(-1);
        if (currentContext && currentContext != this) {
          addDependency(currentContext, this);
        }
        return _value;
      },
    };
  };

  const effect = (fn) => {
    contextStack.push(fn);
    fn();
    contextStack.pop();
  };

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
