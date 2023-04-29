let currentObserver = null;

const observe = (callback) => {
  currentObserver = callback;
  callback();
  currentObserver = null;
};

const observable = (stateObj) => {
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

const store = observable({ a: 10, b: 20 });

observe(() => console.log(`a = ${store.a}`));
observe(() => console.log(`b = ${store.b}`));
observe(() => console.log(`test = ${10 + 20}`));
observe(() => console.log(`a + b = ${store.a} + ${store.b}`));
observe(() => console.log(`a * b = ${store.a} + ${store.b}`));
observe(() => console.log(`a - b = ${store.a} + ${store.b}`));

console.log('*********** a 상태값 변경 **************');

store.a = 100;

console.log('*********** b 상태값 변경 **************');

store.b = 200;
