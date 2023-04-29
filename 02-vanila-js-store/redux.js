import { observable } from './observer.js';

const createStore = (reducer) => {
  const state = observable(reducer());
  const frozenState = {};

  Object.keys(state).forEach((key) => {
    Object.defineProperty(frozenState, key, {
      get: () => state[key],
    });
  });

  // 주요 API 정의
  const dispatch = (action) => {
    const newState = reducer(state, action);

    for (const [key, value] of Object.entries(newState)) {
      if (!state[key]) continue;
      state[key] = value;
    }
  };
  const getState = () => frozenState;
  const subscribe = (callback) => {
    currentObserver = callback;
    callback();
    currentObserver = null;
  };

  return { getState, dispatch, subscribe };
};

// 적용

const initState = {
  a: 10,
  b: 20,
};

export const SET_A = 'SET_A';
export const SET_B = 'SET_B';

export const store = createStore((state = initState, action = {}) => {
  // reducer 정의
  switch (action.type) {
    case 'SET_A':
      return { ...state, a: action.payload };
    case 'SET_B':
      return { ...state, b: action.payload };
    default:
      return state;
  }
});

// action 정의
export const setA = (payload) => ({ type: SET_A, payload });
export const setB = (payload) => ({ type: SET_B, payload });

// DOM 적용
const InputA = () =>
  `<input id="stateA" value="${store.getState().a}" size="5" />`;
const InputB = () =>
  `<input id="stateB" value="${store.getState().b}" size="5" />`;
const Calculator = () =>
  `<p>a + b = ${store.getState().a + store.getState().b}</p>`;

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
      // commit을 통해서 값을 변경시킨다.
      store.dispatch(setA(Number(target.value)));
    });

    $el.querySelector('#stateB').addEventListener('change', ({ target }) => {
      // commit을 통해서 값을 변경시킨다.
      store.dispatch(setB(Number(target.value)));
    });
  }
}
