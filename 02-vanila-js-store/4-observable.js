let currentObserver = null;

export const observe = (callback) => {
  currentObserver = callback;
  callback();
  currentObserver = null;
};

export const observable = (stateObj) => {
  Object.keys(stateObj).forEach((key) => {
    let _value = stateObj[key];
    const observers = new Set();

    Object.defineProperty(stateObj, key, {
      get() {
        if (currentObserver) observers.add(currentObserver);
        return _value;
      },

      set(value) {
        _value = value;
        observers.forEach((callback) => callback());
      },
    });
  });
  return stateObj;
};
