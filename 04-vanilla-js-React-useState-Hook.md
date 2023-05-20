# vailla js로 React useState Hook 만들기

### React의 useState

```js
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
<div id="app"></div>
<script>
  function useState(initState) {
    let state = initState; // state를 정의한다.
    const setState = (newState) => {
      state = newState; // 새로운 state를 할당한다
      render(); // render를 실행한다.
    }
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

  let renderCount = 0;
  const render = () => {
    app.innerHTML = `
      <div>renderCount: ${renderCount}</div>
      ${Counter()}
    `;
    renderCount += 1;
  }

  render();
</script>
</body>
</html>
```

궁금증) 위 코드에서 `useState` 함수 사용자가 `setState`를 호출 하면 자동으로 `render()` 함수를 호출해 상태가 변경된 컴포넌트를 리렌더링 시키고 있습니다. 그렇다면 실제 리엑트에서는 상태가 변경 됐을 때 useState 함수가 어떤 컴포넌트에서 상태가 변경됐는지 알 고 리렌더링을 시켜주는 걸까요?  
직관적으로 봤을 땐, `setState`를 호출 할 때 `const [state, setState] = setState(초기상태, 타겟컴포넌트)` 이런 식으로 호출해야지 setState 내부 로직에서 리렌더할 타겟 컴포넌트를 알 수 있을 것 같은데.. 잘 모르겠습니다.

### useState 최적화

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

debounce의 핵심은 "이벤트를 여러번 호출을 해도 요청 기능이 일정 시간 이후에 `한번`만 실행 된다는 것"인데, 이는 성능과 사용자 경험 측면을 고려할 때 정말 중요한 개념 같습니다.(저도 아직 제대로 사용 안해봤지만) debounce 외에도 아래 개념들도 함께 알면 좋을 것 같습니다.

- 디바운싱 - 일정 시간내에 연이어 호출되는 함수들을 하나로 취급해 가장 마지막것만 실행시키는 것.  
- 스로틀링 - 함수를 실행한 순간부터 일정 시간동안 다시 호출되지 않도록 하는 것.
- 비동기 작업 취소하기 - AbortController


### 자바스크립트와 이벤트 루프

- requestAnimationFrame, setInterval 등 공부 할 때 아래 글 주제 같이 읽으면 좋을 것 같아요!
- https://meetup.nhncloud.com/posts/89 (황준일 블로그 참조)