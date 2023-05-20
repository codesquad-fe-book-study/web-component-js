# Vanilla Javascript로 React useState Hook 만들기

## 1. React의 useState

### 1) 의문갖기

```jsx
import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(1);

  // 돔에서 직접 호출하기 위해 window(전역객체)에 할당
  window.increment = () => setCount(count + 1);

  return (
    <div>
      <strong>count: ${count} </strong>
      <button
        onClick={() => {
          setInterval(() => {
            setCount((prev) => prev + 1);
          }, 500);
        }}
      >
        증가
      </button>
    </div>
  );
}

// 원래 블로그 글의 코드 아래 설명에 맞게 코드를 수정
```

1. useState를 호출하여 state와 setState를 가져온다.
2. 500ms(0.5초)마다 setCount를 실행한다.
3. 값이 1씩 증가한다.
4. setCount가 실행되면 다시 렌더링이 실행된다.
5. 렌더링이 실행되면 Counter가 다시 실행될 것이다.
6. `Counter 컴포넌트가 다시 실행되어도 count의 값은 초기화되지 않고 유지된다.`

> 어떻게 Counter 함수가 다시 실행되는데, count의 값은 초기화되지 않고 유지될 수 있을까?

### 2) Bottom-up으로 분석해보기

가장 중요한 목적은 `Counter 함수가 실행되어도 어떻게 count의 값이 초기화되지 않고 유지되는가`이다.

```html
<div id="app"></div>
```

```js
function useState (initState) { }

function Counter () {
  const [count, setCount] = useState(1);

  window.increment = () => setCount(count + 1);

  return `
    <div>
      <strong>count: ${count} </strong>
      <button onclick="increment()">증가</button>
    </div>
  `;
}

function render () {
	const $app = document.querySelector('#app');
	$app.innerHTML = Counter();
}

render();
```

리액트를 이미 알고 있다면 위의 대략적인 감이 올 수 있다. useState는 state와 setState를 반환하고 setState를 실행하게 되면 render가 실행되는 그런 형태일 것이다.

이를 반영하면

```js
function useState(initState) {
  let state = initState; // state를 정의한다.
  const setState = (newState) => {
    state = newState; // 새로운 state를 할당한다
    render(); // render를 실행한다.
  }
  return [ state, setState ];
}

// 이해를 위해 내용 추가
function Counter () {
  const [count, setCount] = useState(1);

  window.increment = () => setCount(count + 1);

  return `
    <div>
      <strong>count: ${count} </strong>
      <button onclick="increment()">증가</button>
    </div>
  `;
}

function render () {
  const $app = document.querySelector('#app');
  $app.innerHTML = Counter();
}

render();
```

위와 같이 코드를 작성 후, `증가` 버튼을 클릭해도 render되는 count 값은 초기값인 1 그대로인 것을 확인할 수 있다.

그렇기 때문에 state를 유지하기 위해서는 `state를 전역으로 관리`해야 한다.

```js
let state = undefined; // state를 전역으로 관리한다.
function useState(initState) {
  // state에 값이 없을 때만 초기화를 진행한다.
  if (state === undefined) {
    state = initState;
  }
  const setState = (newState) => {
    state = newState; // 새로운 state를 할당한다
    render(); // render를 실행한다.
  };
  return [state, setState];
}

function Counter() {
  const [count, setCount] = useState(1);

  window.increment = () => setCount(count + 1);

  return `
    <div>
      <strong>count: ${count} </strong>
      <button onclick="increment()">증가</button>
    </div>
  `;
}

function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = Counter();
}

render();
```

위의 코드에서 state를 전역으로 빼줌으로써 setState를 통해 변화된 state가 화면에 반영되는 것을 확인할 수 있다.

그렇다면 이번엔 useState와 Component가 여러개라면 어떻게 될까??

```js
let state = undefined; // state를 전역으로 관리한다.
function useState(initState) {
  // state에 값이 없을 때만 초기화를 진행한다.
  if (state === undefined) {
    state = initState;
  }
  const setState = (newState) => {
    state = newState; // 새로운 state를 할당한다
    render(); // render를 실행한다.
  };
  return [state, setState];
}

function Counter() {
  const [count, setCount] = useState(1);

  window.increment = () => setCount(count + 1);

  return `
    <div>
      <strong>count: ${count} </strong>
      <button onclick="increment()">증가</button>
    </div>
  `;
}

function Cat() {
  const [cat, setCat] = useState("고양이");

  window.meow = () => setCat(cat + " 야옹!");

  return `
    <div>
      <strong>${cat}</strong>
      <button onclick="meow()">고양이의 울음소리</button>
    </div>
  `;
}

function render() {
  document.querySelector("#app").innerHTML = `
    <div>
      ${Counter()}
      ${Cat()}
    </div>
  `;
}

render();
```

하나의 state 변수로 2개의 컴포넌트의 state를 관리하므로 둘다 같은 값으로 렌더링된다.(심지어 하나는 숫자, 하나는 문자열을 더하기 때문에 문자열을 한번이라도 더하게 되면
기존의 숫자를 더하는 로직 또한 문자열로 들어가서 옆에 숫자가 그냥 붙게 된다. ex 1 + 1 => 11)

이를 해결하기 위해 useState를 호출할 때마다 state의 갯수를 늘려주면 된다.

```js
const states = []; // state를 전역으로 관리한다.
let currentStateKey = 0; // currentStateKey를 전역으로 관리한다.

function useState(initState) {
  // initState로 초기값 설정
  const key = currentStateKey;
  if (states.length === key) {
    states.push(initState);
  }

  // state 할당
  const state = states[key];
  const setState = (newState) => {
    // state를 직접 수정하는 것이 아닌, states 내부의 값을 수정
    states[key] = newState;
    render();
  }
  currentStateKey += 1;
  return [ state, setState ];
}

function Counter () {
  const [count, setCount] = useState(1);

  window.increment = () => setCount(count + 1);

  return `
    <div>
      <strong>count: ${count} </strong>
      <button onclick="increment()">증가</button>
    </div>
  `;
}

function Cat () {
  const [cat, setCat] = useState('고양이');

  window.meow = () => setCat(cat + ' 야옹!');

  return `
    <div>
      <strong>${cat}</strong>
      <button onclick="meow()">고양이의 울음소리</button>
    </div>
  `;
}

const render = () => {
  const $app = document.querySelector('#app');
  $app.innerHTML = `
    <div>
      ${Counter()}
      ${Cat()}
    </div>
  `;
  currentStateKey = 0;
}

render();
```

이제 state를 따로 관리할 수 있다.

## 2. useState 최적화해보기

### 1) 동일한 값에 대해서 render 하지 않기

setState에 기존의 값과 같은 때도 render되는 게 사실 문제는 아니다. 그렇지만 동일한 값을 또 한 번 그리는 게 효율적이진 않으니 이에 대해서 최적화하는 게 좋다!

```js
function Counter () {
  const [count, setCount] = useState(1);
  window.nochange = () => setCount(1); // count에 똑같은 값을 삽입한다.
  return `
    <div>
      <strong>count: ${count} </strong>
      <button onclick="nochange()">변화없음</button>
    </div>
  `;
}

let renderCount = 0;
const render = () => {
  const $app = document.querySelector('#app');
  $app.innerHTML = `
    <div>
      renderCount: ${renderCount}
      ${Counter()}
    </div>
  `;
  currentStateKey = 0;
  renderCount += 1;
}
```

위의 코드에서 Counter는 그대로 1이지만 renderCount는 계속 증가하면서 render가 되는 것을 확인할 수 있다.

그럼 이제 useState를 최적화해보자

```js
function useState(initState) {
  // initState로 초기값 설정
  const key = currentStateKey;
  if (states.length === key) {
    states.push(initState);
  }

  // state 할당
  const state = states[key];
  const setState = (newState) => {
    // 값이 똑같은 경우
    if (newState === state) return;
    
    // 배열/객체일 때는 JSON.stringify를 통해 간단하게 비교할 수 있다.
    // 그런데 Set, Map, WeekMap, Symbol 같은 원시타입의 경우
    // JSON으로 파싱되지 않기 때문에 주의해야한다.
    // 객체는 모양은 같아도 다른 객체이기 때문에 아래처럼 stringfy로 딱 그 겉모습만을 비교한다.
    if (JSON.stringify(newState) === JSON.stringify(state)) return;

		// 기존 값과 다른 경우에만 값을 변경하고 render()를 실행한다.
    states[key] = newState;
    render();
  }
  currentStateKey += 1;
  return [ state, setState ];
}
```

### 2) 하나의 함수에서 여러번의 setState를 호출하는 경우 render를 한번만 실행하기

```js
function CounterAndMeow () {
  const [count, setCount] = useState(1);
  const [cat, setCat] = useState('야옹! ');

  function countMeow (newCount) {
    setCount(newCount);
    setCat('야옹! '.repeat(newCount));
  }

  window.increment = () => countMeow(count + 1);
  window.decrement = () => countMeow(count - 1);

  return `
    <div>
      <p>고양이가 ${count}번 울어서 ${cat} </p>
      <button onclick="increment()">증가</button>
      <button onclick="decrement()">감소</button>
    </div>
  `;
}

let renderCount = 0;
const render = () => {
  const $app = document.querySelector('#app');
  $app.innerHTML = `
    <div>
      ${renderCount}
      ${CounterAndMeow()}
    </div>
  `;
  renderCount += 1;
  currentStateKey = 0;
}
```

위 코드는 countMeow에서 setState를 두번 호출한다. 그렇기 때문에 당연히 render도 2번 호출된다. 이를 최적화해보자.

```js
let count = 0;
const debounce = (callback, timer = 0) => {
  let currentCallbackTimer = -1;

  // 클로저를 이용하기 위해 debounce를 실행하면 함수를 반환한다.
  return () => {
    count += 1;

    // 실행이 예약된 함수(callback)가 있을 경우 캔슬한다.
    clearTimeout(currentCallbackTimer);
    
    // 특정시간(timer) 후에 callback이 실행되도록 한다.
    currentCallbackTimer = setTimeout(callback, timer)
  }
};
const 야옹 = debounce(() => console.log('야옹' + count), 100);
야옹(); // 실행 취소
야옹(); // 실행 취소
야옹(); // 실행 취소
야옹(); // 실행
setTimeout(야옹, 100); // 실행
```

위 코드는 디바운스를 이용한 코드이다. debounce 함수는 특정 시간(timer)이 지나기 전에 함수가 실행되면 실행을 취소하고, 특정 시간(timer)이 지나면 함수를 실행한다.
일단 기본적으로 `야옹()`이라는 코드들이 실행되는 속도는 timer보다 빠르다. 이 timer보다 빠른 실행들은 실행이 취소된다. 그리고 timer보다 늦게 실행되는 코드들은 실행이 취소되지 않고 실행된다.

이 때, 우리는 명시적으로 `timer`라는 어떤 시간을 줄 필요가 있을까? 생각해보자.
일반적으로 모니터의 주사율은 60Hz이다. 즉, 우리가 눈으로 보는 화면을 띄우는 행위가 1초에 60번 => 1/60초에 1번 일어난다는 것이다. 그렇다면 1/60초에 1번 이상의 render가 일어나는 것은 의미가 없다.

그러면 위의 함수에 이 시간을 적용하면 아래와 같다.

```js
let count = 0;
const debounce = (callback, timer) => {
  let currentCallbackTimer = -1;

  // 클로저를 이용하기 위해 debounce를 실행하면 함수를 반환한다.
  return () => {
    count += 1;

    // 실행이 예약된 함수(callback)가 있을 경우 캔슬한다.
    clearTimeout(currentCallbackTimer);
    
    // 특정시간(timer) 후에 callback이 실행되도록 한다.
    currentCallbackTimer = setTimeout(callback, timer)
  }
};
const 야옹 = debounce(() => console.log('야옹' + count), 1000 / 60);
야옹(); // 실행 취소
야옹(); // 실행 취소
야옹(); // 실행 취소
야옹(); // 실행
setTimeout(야옹, 100); // 실행
```

즉, 어차피 화면을 그리는 건 1/60초에 1번 일어나기 때문에, 1/60초보다 빠르게 실행되는 코드들은 실행을 취소하겠다는 것이다.

그런데 여기서 또 조심해야하는 부분이 있다. 과연 setTimeout에 전달한 1000 / 60 === 16 ms 라는 값이 정말로 1/60초를 의미하는가? 라는 것이다. 이는 브라우저마다 다르다. 그래서 이를 정확하게 구하려면 `requestAnimationFrame`을 사용해야한다.

```js
let count = 0;
const debounceFrame = callback => {
  let nextFrameCallback = -1;

  // 클로저를 이용하기 위해 debounce를 실행하면 함수를 반환한다.
  return () => {
    count += 1;

    // 실행이 예약된 함수(callback)가 있을 경우 캔슬한다.
    cancelAnimationFrame(nextFrameCallback);
    
    // 특정시간(timer) 후에 callback이 실행되도록 한다.
    nextFrameCallback = requestAnimationFrame(callback)
  }
};
const 야옹 = debounceFrame(() => console.log('야옹' + count));
야옹(); // 실행 취소
야옹(); // 실행 취소
야옹(); // 실행 취소
야옹(); // 실행
setTimeout(야옹, 100); // 실행
```

- requestAnimationFrame(callback)은 브라우저에게 수행하기를 원하는 애니메이션을 알리고, 다음 리페인트가 진행되기 전에 인자로 넘겨진 callback함수를 호출한다.
- 일반적으로 requestAnimationFrame이 1초동안 실행되는 횟수는 대부분의 브라우저에서는 W3C 권장사항에 따라 디스플레이 주사율과 일치하게 된다.

```js
function debounceFrame (callback) {
  let nextFrameCallback = -1;
  return () => {
    cancelAnimationFrame(nextFrameCallback);
    nextFrameCallback = requestAnimationFrame(callback)
  }
};

let renderCount = 0;
const render = debounceFrame(() => {
  const $app = document.querySelector('#app');
  $app.innerHTML = `
    <div>
      renderCount: ${renderCount}
      ${CounterAndMeow()}
    </div>
  `;
  renderCount += 1;
  currentStateKey = 0;
});
```

requestAnimationFrame을 적용한 debounce을 render에 사용해보자. 이제는 1/60초에 1번씩만 render가 실행된다.

## 3. render 함수 추상화하기

이 부분은 전체 코드만 올리고 자세한 설명은 생략하겠습니다.

```js
function MyReact () {
  const options = {
    currentStateKey: 0,
    renderCount: 0,
    states: [],
    root: null,
    rootComponent: null,
  }

  function useState (initState) {
    const { currentStateKey: key, states } = options;
    if (states.length === key) states.push(initState);

    const state = states[key];
    const setState = (newState) => {
      states[key] = newState;
      _render();
    }
    options.currentStateKey += 1;
    return [ state, setState ];
  }

  const _render = debounceFrame(() => {
    const { root, rootComponent } = options;
    if (!root || !rootComponent) return;
    root.innerHTML = rootComponent();
    options.currentStateKey = 0;
    options.renderCount += 1;
  });

  function render (rootComponent, root) {
    options.root = root;
    options.rootComponent = rootComponent;
    _render();
  }

  return { useState, render };

}

const { useState, render } = MyReact();

function CounterAndMeow () {
  const [count, setCount] = useState(1);
  const [cat, setCat] = useState('야옹! ');

  function countMeow (newCount) {
    setCount(newCount);
    setCat('야옹! '.repeat(newCount));
  }

  window.increment = () => countMeow(count + 1);
  window.decrement = () => countMeow(count - 1);

  return `
    <div>
      <p>고양이가 ${count}번 울어서 ${cat} </p>
      <button onclick="increment()">증가</button>
      <button onclick="decrement()">감소</button>
    </div>
  `;
}

function debounceFrame (callback) {
  let nextFrameCallback = -1;
  return () => {
    cancelAnimationFrame(nextFrameCallback);
    nextFrameCallback = requestAnimationFrame(callback)
  }
};

const App = () => `
  <div>
    ${CounterAndMeow()}
  </div>
`;

render(App, document.querySelector('#app'));
```

## 4. 모듈화하기

모듈화 내용도 생략하겠습니다.

```
.
├─ src
│   ├─ components
│   │  └─ CounterAndMeow.js
│   ├─ core
│   │  └─ MyReact.js
│   ├─ utils
│   │  └─ debounceFrame.js
│   ├─ App.js
│   └─ main.js
└─ index.html
```
