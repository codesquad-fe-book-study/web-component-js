# Vanilla Javascript로 상태관리 시스템 만들기

## 1. 중앙 집중식 상태관리

- 현대 프론트엔드 개발에서 제일 중요한 것은 `상태관리`
- `상태를 기반으로 DOM을 렌더링하기 때문이다.`
- 어플리케이션의 규모가 커질수록 컴포넌트의 depth가 깊어지며 더불어 상태관리도 굉장히 어려워진다.

> 이 때, 상태를 위에서 아래로 하나하나 전달하지 않고 `중앙 집중소 역할`을 하면서 동시에 `예측 가능한 방식`으로 다룰 수 있다면 어떨까?

- [참고: Redux 공식문서](https://ko.redux.js.org/introduction/getting-started/)

## 2. Observer Pattern에 대해 이해하기

- `중앙 집중식 저장소`를 `Store`라고 해보자.
- `Store`와 `Component`의 관계
  - 하나의 Store가 여러 개의 Component에서 사용될 수 있다.
  - Store가 변경될 때, Store가 사용되고 있는 Component도 변경되어야 한다.

```js
// store에 초기 state를 전달하면서 생성
const store = new Store({
  a: 11,
  b: 16,
});

// 컴포넌트 2개 생성
// Q. 여기서 Component의 parameter로 객체가 전달되는 게 맞나..? 어차피 아래에서 따로 구독하는데?
const component1 = new Component({ subscribe: [store]});
const component2 = new Component({ subscribe: [store]});

// 컴포넌트가 store를 구독
component1.subscribe(store); // a + b = ${store.state.a + store.state.b}
component2.subscribe(store); // a * b = ${store.state.a * store.state.b}

// store의 state를 변경한다.
store.setState({
  a: 7,
  b: 19,
});

// store가 변경되었음을 알린다.
store.notify();
```

위와 같은 형태로 코드를 작성하는 것을 `Observer Pattern`이라고 한다.

- `Observer Pattern`은 객체의 상태 변화를 관찰하는 관찰자들, 즉 옵저버들의 목록을 객체에 등록한다.
- `상태 변화가 있을 때마다 메서드 등을 통해 객체가 직접 목록의 각 옵저버에게 통지하도록 한다.`
- 디자인 패턴의 하나이다.
- `발행/구독 모델`이라고도 부른다.

### 1. Publisher(발행)

```js
class Publisher {
  #state;
  #observers = new Set(); // 여기에 구독자들(관찰자들)이 저장된다.
  
  constructor(state) {
    this.#state = state;
    // Object.defineProperty()
    // state 객체의 key값을 순회하면서 this에 해당 key값으로 `() => this.#state[key]` value를 갖게 한다.
    // Q. 그런데 이걸 왜하는건지 모르겠다. 
    // - 생성된 인스턴스에서 state가 갖는 값들에 바로 접근할 수 있어서..?
    Object.keys(state).forEach(key => Object.defineProperty(this, key, {
      get: () => this.#state[key]
        }
      )
    );
  }
  
  setState(newState) {
    this.#state = {...this.#state, ...newState};
    this.notify();
  }
  
  register(observer) {
    this.#observers.add(observer);
  }
  // Q. notify에 파라미터가 전달되지 않는 부분이 잘 이해가 안된다.
  notify() {
    this.#observers.forEach(observer => observer());
  }
}
```

- Publisher: 발행자
- setState(): 발행자의 상태를 변경하고 구독자를 실행함으로써 상태변화를 알린다.
- register(): 구독자(관찰자)를 등록한다.
- notify(): 구독자(관찰자; 함수)를 실행한다.

> 여기서 핵심은 setState()를 통해 상태 변경 시, notify()가 실행되며 구독자들이 실행된다는 점이다. 즉, `내부 상태가 변할 때 구독자에게 알리는 것`

### 2. Subscriber(구독)

```js
class Subscriber {
  #fn;
  constructor(fn) {
    this.#fn = fn;
  }

  subscribe(publisher) {
    publisher.register(this.#fn);
  }
}
```

- Subscriber: 구독자
- #fn: Publisher 입장에서 observer 된다.
- subscribe(): publisher를 받아서 observer를 등록한다.

> 발행기관을 구독한다.<br/>
> `발행기관에서 변화가 생겼을 때 하는 일`을 정의해야 한다. 이게 사실 publisher에게는 observer가 된다.

### 3. 적용하기

```js
const initailState = {a: 10, b: 20};

// Q. 왜 publisher라고 안하고 상태라고 했을까..?
const publisher = new Publisher(initailState);

// Q-a. publisher는 외부 객체인데, 이걸 참조하고 있는 게 맞나..?
const addCalculator = new Subscriber(() => console.log(`a + b = ${publisher.a + publisher.b}`));

// Q-b. publisher를 구독하는 건 여기서 하면서..? 
addCalculator.subscribe(publisher);
```

## 3. 리팩토링

앞의 코드를 단순하게 `observable`과 `observe`의 관계에만 집중해서 다뤄보자.

- observable은 observe에서 사용된다.
- observable에 변화가 생기면, observe에 등록된 함수가 실행된다.

### 1. [Object.defineProperty](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 이해하기

MDN 문서의 설명은 아래와 같다.

> 객체에 직접 새로운 속성을 정의하거나 이미 존재하는 속성을 수정한 후, 그 객체를 반환합니다.

```js
// 여기서 부터 아래까지의 코드를 class 하나라고 생각하면 이해하기 편하다.
let a = 10;

const state = {};

Object.defineProperty(state, 'a', {
  get() {
    console.log(`현재 a의 값은 ${a} 입니다.`);
    return a;
  },
  set(value) {
    a = value;
    console.log(`변경된 a의 값은 ${a} 입니다.`)
  }
})
```

- `Object.defineProperty(targetObject, property, descriptor)`
  - `object`: 속성을 정의할 객체
  - `property`: 새로 정의하거나 수정하려는 속성의 이름 또는 Symbol
  - `descriptor`: 새로 정의하거나 수정하려는 속성을 기술하는 객체

> `Object.defineProperty(targetObject, property, descriptor)`는 객체를 참조하거나 객체에 어떤 변화가 생길 때,
> 중간에 우리가 원하는 행위를 집어넣을 수 있게 해준다.

### 2. 여러 개의 속성 관리하기

```js
const state = {
  a: 10,
  b: 20,
};

const stateKeys = Object.keys(state);

for (const key of stateKeys) {
  let _value = state[key];
  Object.defineProperty(state, key, {
    get () {
      console.log(`현재 state.${key}의 값은 ${_value} 입니다.`);
      return _value;
    },
    set (value) {
      _value = value;
      console.log(`변경된 state.${key}의 값은 ${_value} 입니다.`);
    }
  })
}

console.log(`a + b = ${state.a + state.b}`);

state.a = 100;
state.b = 200;
```

위의 코드에서 `console.log`만 `observer`라는 함수로 변경해보자.

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
    get () {
      return _value;
    },
    set (value) {
      _value = value;
      observer(); // set할 때 어떤 함수를 실행하게 하는 것이다.
    }
  })
}

observer();

state.a = 100;
state.b = 200;
```

> 지금까지의 과정을 조금 쉽게 설명하면 다음과 같은 흐름이다.
> - obj.a로 어떤 값에 접근할 때(get), 중간에 뭔가 어떤 코드를 실행하고 싶은 것. 옵저버 패턴에서는 이 중간에 구독하는 메서드(subscribe)가 들어간다.
> - obj.a에 어떤 값을 할당할 때(set), 중간에 뭔가 어떤 코드를 실행하고 싶은 것. 옵저버 패턴에서는 이 중간에 알림하는 메서드(notify)가 들어간다.
> - 마치 중간에 과정을 가로채서 무언가를 실행하는 것. Proxy 패턴과 유사하다.

### 3. 여러 개의 Observer 관리하기

```js
let currentObserver = null;

const state = {
  a: 10,
  b: 20,
};

const stateKeys = Object.keys(state);

for (const key of stateKeys) {
  let _value = state[key];
  // Q. 아래 observers는 for 문 밖에서 선언해도 되는데, 굳이 여기에 한 이유가 있을까?
  // A. for문 안에서 각각의 key에 대한 closer로 갖고 있어야 각 key가 get 됐을 때, 본인에게 해당하는 함수에만 접근한다.
  // 만약 밖에 빼두면 모든 key값들에 대한 observers가 공유되므로 그 안에 모든 함수가 실행되어버린다.
  const observers = new Set();
  Object.defineProperty(state, key, {
    get () {
      if (currentObserver) observers.add(currentObserver);
      return _value;
    },
    set (value) {
      _value = value;
      observers.forEach(observer => observer());
    }
  })
}

const 덧셈_계산기 = () => {
  currentObserver = 덧셈_계산기;
  // 아래에서 state.a를 get하는 순간 defineProperty의 get 메서드가 실행된다.
  console.log(`a + b = ${state.a + state.b}`);
}

const 뺄셈_계산기 = () => {
  currentObserver = 뺄셈_계산기;
  console.log(`a - b = ${state.a - state.b}`);
}

덧셈_계산기();
// 아래에서 state.a에 어떤 값을 할당하는 순간 defineProperty의 set 메서드가 실행된다.
state.a = 100;

뺄셈_계산기();
state.b = 200;

state.a = 1;
state.b = 2;
```

> 함수가 실행될 때 `currentObserver가 실행중인 함수를 참조하도록 만든다.`<br/>
> `state`의 프로퍼티가 사용될 때(get을 호출할 때), 

### 4. 함수화

위의 코드를 재사용하기 위해 `onserve`와 `observable` 함수로 구현해보자.

```js
let currentObserver = null;

const observe = fn => {
  currentObserver = fn;
  fn();
  currentObserver = null;
}

const observable = obj => {
  Object.keys(obj).forEach(key => {
    let _value = obj[key];
    const observers = new Set();

    Object.defineProperty(obj, key, {
      get () {
        if (currentObserver) observers.add(currentObserver);
        return _value;
      },

      set (value) {
        _value = value;
        observers.forEach(fn => fn());
      }
    })
  })
  return obj;
}
```

아래와 같이 사용한다.

```js
// Q. 아래 코드 다시 한번 생각해보기
const 상태 = observable({ a: 10, b: 20 });
observe(() => console.log(`a = ${상태.a}`));
observe(() => console.log(`b = ${상태.b}`));
observe(() => console.log(`a + b = ${상태.a} + ${상태.b}`));
observe(() => console.log(`a * b = ${상태.a} + ${상태.b}`));
observe(() => console.log(`a - b = ${상태.a} + ${상태.b}`));

상태.a = 100;
상태.b = 200;
```