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
