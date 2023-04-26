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

### 1. Publisher

```js
class Publisher {
  #state;
  #observers = new Set(); // 여기에 구독자들(관찰자들)이 저장된다.
  
  constructor(state) {
    this.#state = state;
    // Object.defineProperty() 찾아보기
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

### 2. Subscriber