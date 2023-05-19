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
let currentStateKey = 0; // cursor를 전역으로 관리한다.

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

# 2. useState optimazation
