class Store {
  state;
  observers = new Set();

  constructor(state) {
    this.state = state;
    Object.keys(state).forEach((key) =>
      Object.defineProperty(this, key, { get: () => this.state[key] })
    );
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  register(subscriber) {
    this.observers.add(subscriber);
  }

  notify() {
    this.observers.forEach((observer) => observer());
  }
}

class Subscriber {
  callback;

  constructor(callback) {
    this.callback = callback;
  }

  subscribe(store) {
    store.subscribe(this.callback);
  }
}

const store = new Store({
  a: 10,
  b: 20,
});

const addCalculator = new Subscriber(() =>
  console.log(`a + b = ${store.a + store.b}`)
);

const multiplyCalculator = new Subscriber(() =>
  console.log(`a * b = ${store.a * store.b}`)
);

addCalculator.subscribe(store);
multiplyCalculator.subscribe(store);

store.notify();
store.setState({ a: 100, b: 200 });
