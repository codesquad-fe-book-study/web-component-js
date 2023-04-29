# Vanilla Javascript로 상태관리 시스템 만들기

- 상태관리 프레임워크

## 1. 중앙 집중식 상태관리의 필요성

- 상태를 기반으로 DOM을 렌더링할 때, 가장 중요한 건 **상태관리**
- 컴포넌트의 depth가 깊어지고, 컴포넌트 간의 관계가 복잡하기 때문에 상태관리도 복잡하다.
- 따라서, 중앙 집중식 저장소를 사용하여 상태 관리를 한다. (상태 관리 라이브러리)
- 상태가 계속해서 바뀌는 데이터의 양이 많고, 최상위 컴포넌트가 모든 상태를 가지고 있기 어려워 단 하나의 스토어로 상태를 관리한다.
  - 질문: 기준? 1. props를 2번 이상 drilling 해서 넘겨줘야 하는 경우 (파악이 어렵기 때문에 차라리 전역으로 빼준다.) 2. 많은 컴포넌트에서 사용하는 상태라서 정말 전역으로 관리해야 하는 경우 (ex. 다크모드)

## 2. Observer Pattern

- 객체의 상태 변화를 관찰하는 옵저버 목록을 객체에 등록한다.
- 객체의 상태 변화가 있을 때마다 객체가 직접 목록의 각 옵저버에게 통지한다. (`notify` method)

### Store(저장소)와 Component(컴포넌트)의 관계

1. 하나의 Store는 여러 개의 컴포넌트에서 사용된다.
2. Store가 변경될 때 변경된 상태를 사용하는 Compoenent도 변경되어야 한다.
3. 예시 코드

- 질문: 인터페이스 설명이 너무 안나와있어서 리덕스 공식문서 먼저 보고왔는데도 안맞는다. 특히 component subscribe 생성할 때도 인자로 받고, subscribe라는 메서드는 또 따로 있다?
- 질문: 설명에 따르면 store에 옵저버가 등록해야 하는거 아닌가? `store.subscribe(?)`
  - 🔎 의미상 store는 subscriber를 추가하는 것이기 때문에, addSubscriber 혹은 register가 더 적합하다.
- 일단 Store의 state가 변경되면 Store를 subscribe하는 component에 notify해서 컴포넌트가 변경된 상태에 맞게 업데이트되게 하기 위한 구조를 만들고 싶었다고 이해하고 넘어감

```js
const store = new Store({
  a: 10,
  b: 20,
});

const component1 = new Component({ subscribe: [store] });
const component2 = new Component({ subscribe: [store] });
component1.subscribe(store); // a + b = ${store.state.a + store.state.b}
component2.subscribe(store); // a * b = ${store.state.a * store.state.b}

store.setState({
  a: 100,
  b: 200,
});
```

```js
const state = {
  a: 10,
  b: 20,
};

class Store {
  constructor(state) {
    this.state = state
  }

  notify() {}

  setState(newState) {
    this.state = {...this.state, ...newState}
  }
}

class Component {
  constructor({subscribe: []}) {}

  subscribe(store)
}
```

### Store(Publish)

```js
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
```

#### [Object.defineProperty()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

- params: `1. obj`, `2. prop`, `3. descriptor`
- return: 수정된 `obj`
- `1.obj`에 새로 정의하거나 수정하려는 속성(`2. prop`)을 `3. descriptor`에 따라 정의하거나 수정한다.

### Subscriber

```js
class Subscriber {
  callback;

  constructor(callback) {
    this.callback = callback;
  }

  subscribe(store) {
    store.subscribe(this.callback);
  }
}
```

### 적용하기

1. Store 생성

- state: { a: 10, b: 20 }
- observers: Set(0) {}

```js
const store = new Store({
  a: 10,
  b: 20,
});
```

2. store의 상태를 참조하는 덧셈계산기, 곱셈 계산기 생성

```js
const addCalculator = new Subscriber(() =>
  console.log(`a + b = ${store.a + store.b}`)
);

const multiplyCalculator = new Subscriber(() =>
  console.log(`a * b = ${store.a * store.b}`)
);
```

3. 각 계산기는 store를 구독한다.

- Store
  - state: { a: 10, b: 20 }
  - observers: Set(2) {addCalculator의 callback 함수, multiplyCalculator의 callback 함수}

```js
addCalculator.subscribe(store);
multiplyCalculator.subscribe(store);
```

4. 스토어의 상태가 변경되면 등록된 옵저버들이 실행된다.

```js
store.setState({ a: 100, b: 200 });
// a + b = 300
// a * b = 20000
```

## 3. 구독 로직 반복을 줄이기 위한 리팩터링

- state가 변경되거나 state를 참조할 경우 원하는 행위를 중간에 집어넣기 위해 `Object.defineProperty`를 사용한다.
- 상태가 변경되면 이 상태를 관찰하고 있던 observer 함수를 실행한다.

#### 1. state 1개 (a)

#### 2. state 2개 (a, b)

#### 3. state가 변경되면 observer 함수를 실행한다.

- 상태가 변경되면(set) 변경된 상태값으로 observer 함수가 실행된다.

```js
const state = {
  a: 10,
  b: 20,
};
const stateKeys = Object.keys(state);
const observer = () => console.log(`a + b = ${state.a + state.b}`);

for (const key of stateKeys) {
  let _value = state[key];
  Object.defineProperty(state, key, {
    get() {
      return _value;
    },
    set(value) {
      _value = value;
      observer();
    },
  });
}
```

```js
observer(); // a + b = 3
state.a = 100; // a + b = 120
state.b = 200; // a + b = 300
```

#### 4. Observer 여러개

```js
let currentObserver = null; // currentObserver 변수에 현재 observer를 저장해둔다.
```

```js
get() {
  if (currentObserver) observers.add(currentObserver); // currentObserver를 observers에 등록
  return _value;
},

set(value) {
  _value = value;
  observers.forEach((observer) => observer()); // observers에 등록된 모든 observer를 실행
},
```

#### 5. 추상화

0. 전역 변수

```js
let currentObserver = null;
```

1. `observe(callback)`

- currentObserver 전역변수에 현재 callback을 저장하고 이를 실행하고 currentObserver를 다시 null로

```js
const observe = (callback) => {
  currentObserver = callback;
  callback();
  currentObserver = null;
};
```

2. `observable(stateObj)`

- 인자로 받은 state object에 state를 참조하는 observer를 추가하거나 state 값이 변경됐을 때 observer callbacks 실행할 수 있는 객체로 바꿔주는 함수
- get 메서드 실행 시(해당 key의 상태값에 접근할 때): currentObserver를 observers에 등록한다.
- set 메서드 실행 시(해당 key의 상태값을 바꿀 때): 값을 변경하고 observers에 등록된 모든 observer를 실행한다.

```js
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
```

3. 예시

```js
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
```

- 실행 결과: 변경된 상태값을 관찰하는 observe 함수만 실행된다.

```
a = 10
b = 20
test = 30
a + b = 10 + 20
a * b = 10 + 20
a - b = 10 + 20
*********** a 상태값 변경 **************
a = 100
a + b = 100 + 20
a * b = 100 + 20
a - b = 100 + 20
*********** b 상태값 변경 **************
b = 200
a + b = 100 + 200
a * b = 100 + 200
a - b = 100 + 200
```

## 4. DOM에 적용하기

- `observe(render)`: state 객체를 render 함수가 observe 하고 있다. state property에 get/set 시에 render 함수가 실행된다.
- 결국 store에 view가 종속된다고 볼 수 있다.
- state가 변경되면 render가 실행되도록 로직을 구현해둔다.
- Event가 발생되면 store의 state를 변경하고, state가 변경되었기 때문에 render가 실행되는 구조

#### Store

```js
import { observable } from './core/observer.js';

export const store = {
  state: observable({
    a: 10,
    b: 20,
  }),

  setState(newState) {
    for (const [key, value] of Object.entries(newState)) {
      if (!this.state[key]) continue; // ?
      this.state[key] = value;
    }
  },
};
```

```js
import { Component } from './core/Component.js';
import { store } from './store.js';

const InputA = () => `
  <input id="stateA" value="${store.state.a}" size="5" />
`;

const InputB = () => `
  <input id="stateB" value="${store.state.b}" size="5" />
`;

const Calculator = () => `
  <p>a + b = ${store.state.a + store.state.b}</p>
`;

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
      store.setState({ a: Number(target.value) });
    });

    $el.querySelector('#stateB').addEventListener('change', ({ target }) => {
      store.setState({ b: Number(target.value) });
    });
  }
}
```

## 6. Vuex Store Interface

### property

- `state`
- `mutations`: action method들을 모아둔 객체

### method

- `commit(actionType, payload)`: store의 상태값을 변경할 때 사용하는 method
- `dispatch(actionType, payload)`: (참고) actionType: 첫번째 인자로 context를 받는다.

- 질문: payload(data)는 무슨 의미?

  - GPT: the data that is passed to a Vuex mutation when it is called. (ex. user)
  - mutations로 스토어 상태를 업데이트할 때 필요한 data를 2번째 인자로 받는데, 이를 `payload`라고 한다.

### 적용하기

- commit method로 사전에 mutations에 정의해놓은 Action을 실행하여 상태값을 변경한다.

## 7. Redux

- 어플리케이션의 **상태 전부**를 **하나의 저장소(store)**에 **객체 트리 형태**로 저장한다.
- 오직 **action**을 통해 상태를 변경한다.
  - **리듀서Reducers**: action이 어떻게 state tree를 변경할지에 대해 작성한다.
- 장점: 액션에 따른 모든 변경을 추적하여 액션을 하나씩 다시 실행할 수 있다, 어플리케이션이 복잡해지고 커지는 경우 확장성이 좋다.
- 액션 객체에 따라 변경할 상태를 미리 명시해두고 이를 사용하여 상태를 변경하여 관리한다.

### Store 주요 API

- 주요 API: `subscribe`, `dispatch`, `getState`
- `subscribe`: 상태 변화에 따라 UI를 변경한다.
- `dispatch`: 액션의 타입에 따라 내부 상태를 변경한다.

```js
import { createStore } from 'redux';

let store = createStore(counter);

store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: 'INCREMENT' });
// 1
store.dispatch({ type: 'INCREMENT' });
// 2
store.dispatch({ type: 'DECREMENT' });
// 1
```

### [공식 문서 Core Concepts](https://ko.redux.js.org/introduction/core-concepts)

#### 1. State

- 상태: 원시형, 배열, 객체형, 직접 작성한 자료구조도 가능

```js
{
  todos: [{
    text: 'Eat food',
    completed: true
  }, {
    text: 'Exercise',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}
```

#### 2. Action

```js
{ type: 'ADD_TODO', text: 'Go to swimming pool' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

#### 3. Reducer

- 액션의 타입과 애션에 따라 상태를 어떻게 변경하는지 명시해둔 함수
- params: state, action
- return: 변경된 상태
  - 상태 객체를 직접 변경하지 않고, 변경된 상태의 새로운 객체를 반환한다.
- 전체 Reducer functions를 호출하기 위한 factory 함수를 둔다. (ex. `todoApp`)

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter;
  } else {
    return state;
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: todo.text, completed: false }]); // 오타 수정
    case 'TOGGLE_TODO':
      return state.map((todo, index) =>
        action.index === index
          ? { text: todo.text, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
}

function todoApp(state = {}, action) {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
  };
}
```

### 구현해보기

- reducer가 실행될 때 반환하는 객체(state)를 observable로 만든다.
- getState가 실제 state를 반환하는 것이 아니라 `frozenState`를 반환하도록 만든다.
- `dispatch`로만 state의 값을 변경한다.
- 질문: state의 key가 아닐 경우 왜 그냥 continue? 새롭게 정의라도 해줘야 하는거 아닌가?
  - 🔎 state에서 관리하는 속성이 아닌 경우 넘긴다. (예를 들어, 현재 state는 counter인데 address 같은 다른 상태 key가 들어오는 경우)
- dispatch에서 사용될 type들을 정의해준다.

### 적용해보기

- dispatch method로 사전에 정의해놓은 Action을 실행하여 상태값을 변경한다.

### 질문

- vuex, redux는 인터페이스만 살짝 다르고 똑같은데 굳이 왜 둘다 구현했을까? 차이점은?

## 8. 심화학습

### 최적화

1. 이전 상태와 변경 상태가 동일한 경우 재렌더링되지 않도록 한다.

### Proxy로 observable 구현하기
