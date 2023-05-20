# Vanilla Javascript로 React UseState Hook 만들기

> [링크](https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Make-useSate-hook/#_1-%E1%84%8B%E1%85%B4%E1%84%86%E1%85%AE%E1%86%AB%E1%84%8B%E1%85%B3%E1%86%AF-%E1%84%80%E1%85%A1%E1%86%BD%E1%84%80%E1%85%B5)

## React의 useState hook 동작 원리

- hook 실행 시에 초기화되지 않도록 상태값을 hook 함수 외부에서 관리한다.
- 여러 개의 상태값을 관리하기 위해 배열에 상태값들을 저장하고, state의 개수(마지막 index)를 별도의 변수에 저장해둔다.
- 자바스크립트의 Lexical Environment 특성을 활용하여 구현

## 최적화

### 1. 상태 변경이 없는 경우 리렌더링하지 않는다.

### 2. 여러번 상태가 변경되는 경우 렌더링을 한번에 한다.

- debounce, requestAnimationFrame 활용

```js
// debounce & rAF를 활용하여 여러 번의 상태 변화를 한번에 처리한다.

function debounceFrame(callback) {
  let nextFrameCallbackId = -1;

  // 이전에 설정해둔 nextFrameCallback을 취소하고 다음 프레임에 실행할 콜백을 다시 등록하는 함수를 반환한다.
  return () => {
    cancelAnimationFrame(nextFrameCallbackId);
    nextFrameCallbackId = requestAnimationFrame(callback);
  };
}
```

#### 🔎 참고: RequestAnimationFrame

> [mdn](https://developer.mozilla.org/ko/docs/Web/API/window/requestAnimationFrame)

```js
requestAnimationFrame(callback);
```

- 다음 리페인트가 진행되기 전에 브라우저에게 실행하고자 하는 애니메이션을 알리는 window 객체의 내장 method

#### Param

- `callback` : 리페인트 이전에 실행할 콜백함수 (해당 애니메이션을 업데이트 하는 함수)

#### Return

- 콜백 요청 id를 의미하는 정수값 (0이 **아닌** 값으로 long 타입)
- cancelAnimationFrame method는 인자로 이 값을 받아 이에 해당하는 콜백 요청을 취소한다.

# 구현체

## React

```js
import { debounceFrame } from './debounceFrame.js';

function MyReact() {
  const options = {
    renderCount: 0, // 렌더링 횟수 확인용
    currentStateIndex: 0, // 관리하는 상태 개수
    states: [], // 관리하는 상태들
    root: null, // real dom node
    rootComponent: null, // 실제 root node에 추가해줄 컴포넌트
  };

  // rootNode와 rootComponent를 인자로 받아 React 함수 내부 변수에 할당하고, 이를 기반으로 _render를 실행한다.
  const render = (root, rootComponent) => {
    options.root = root;
    options.rootComponent = rootComponent;
    _render();
  };

  // 새로운 상태가 설정되면 추가한다.
  // Return: 현재 state와, 상태값을 변경하는 setState 함수를 반환한다.
  const useState = (initState) => {
    const { currentStateIndex, states } = options;

    // 새로운 상태 추가
    if (states.length === currentStateIndex) {
      states.push(initState);
    }

    const state = states[currentStateIndex];
    const setState = (newState) => {
      states[currentStateIndex] = newState;
      _render();
    };

    options.currentStateIndex += 1;

    return [state, setState];
  };

  // rootNode 내부 요소들을 실제 DOM에 렌더링한다.
  // 렌더링 최적화를 위해 debounceFrame 함수 활용(렌더링 시 실행할 callback)
  const _render = debounceFrame(() => {
    const { root, rootComponent } = options;
    if (root && rootComponent) {
      root.innerHTML = rootComponent();
      // _render 실행할 때마다 0으로 왜 초기화해줘야하지?
      options.currentStateIndex = 0;
      options.renderCount += 1;
    }
  });

  return { useState, render };
}

export const { useState, render } = MyReact();
```

## 적용

```js
import { render, useState } from './src/MyReact.js';

function App() {
  return `<div>${Counter()}</div>`;
}

function Counter() {
  const meowType = '미야옹! ';
  const [count, setCount] = useState(1);
  const [meow, setMeow] = useState(meowType);

  const countMeow = (newCount) => {
    setCount(newCount);
    setMeow(meowType.repeat(newCount));
  };

  window.increaseMeow = () => countMeow(count + 1);
  window.decreaseMeow = () => countMeow(count - 1);

  return `
  <div>
      <p>고양이가 ${count}번 울어서 ${meow} </p>
      <button onClick="increaseMeow()">+</button>
      <button onClick="decreaseMeow()">-</button>
    </div>
  `;
}

const root = document.getElementById('root');
render(root, App);
```

## 질문

- https://github.com/jigglypop/woowa-react
