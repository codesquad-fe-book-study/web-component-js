import { observable } from './observer.js';

export class Store {
  #state;
  #mutations;
  #actions;
  state = {};

  constructor({ state, mutations, actions }) {
    this.#state = observable(state);
    this.#mutations = mutations;
    this.#actions = actions;

    Object.keys(state).forEach((key) => {
      Object.defineProperty(this.state, key, { get: () => this.#state[key] });
    });
  }

  commit(actionType, payload) {
    this.#mutations[actionType](this.#state, payload);
  }

  dispatch(actionType, payload) {
    return this.#actions[actionType](
      {
        state: this.#state,
        commit: this.commit.bind(this),
        dispatch: this.dispatch.bind(this),
      },
      payload
    );
  }
}

export const store = new Store({
  state: {
    a: 10,
    b: 20,
  },

  mutations: {
    SET_A(state, payload) {
      state.a = payload;
    },

    SET_B(state, payload) {
      state.b = payload;
    },
  },
});

// DOM 적용
const InputA = () => `<input id="stateA" value="${store.state.a}" size="5" />`;
const InputB = () => `<input id="stateB" value="${store.state.b}" size="5" />`;
const Calculator = () => `<p>a + b = ${store.state.a + store.state.b}</p>`;

export class App extends Component {
  template() {
    return `
      ${InputA()}
      ${InputB()}
      ${Calculator()}
    `;
  }

  setEvent() {
    const { $el } = this;

    $el.querySelector('#stateA').addEventListener('change', ({ target }) => {
      store.commit('SET_A', Number(target.value));
    });

    $el.querySelector('#stateB').addEventListener('change', ({ target }) => {
      store.commit('SET_B', Number(target.value));
    });
  }
}
