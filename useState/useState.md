# useState

```jsx
function Counter() {
  const [count, setCount] = useState(1);

  // 돔에서 직접 호출하기 위해 window(전역객체)에 할당
  window.increment = () => setCount(count + 1);

  return `
    <div>
      <strong>count: ${count} </strong>
      <button onclick="increment()">증가</button>
    </div>
  `;
}
```

1. useState로 state와 setState를 만들 수 있다.
2. 500ms(0.5초)마다 setCount를 실행한다.
3. 값이 1씩 증가한다.
4. setCount가 실행되면 다시 렌더링이 실행된다.
5. 렌더링이 실행되면 Counter가 다시 실행될 것이다.
6. **Counter 컴포넌트가 다시 실행되어도 count의 값은 초기화되지 않고 유지된다.**

그럼 state는 실제로 어떻게 관리되는지 궁금해서 GPT에게 물어봄

![스크린샷 2023-05-19 오후 10.29.25.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/32d43ed2-1b4c-4178-8178-4ca50c2575de/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2023-05-19_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_10.29.25.png)

그렇다고한다.

## 3. **render 함수 추상화**

useState는 render가 항상 실행되기때문에 함수로 **캡슐화**해주기

```jsx
function MyReact() {
  function useState() {}
  function render() {}

  return { useState, render };
}

const { useState, render } = MyReact();
```

```jsx
function MyReact() {
  let currentStateKey = 0;
  const states = [];
  function useState() {}

  let renderCount = 0;
  function render() {}

  return { useState, render };
}

const { useState, render } = MyReact();
```

class의 private과 비슷해보여서 물었더니 맞다고함
![스크린샷 2023-05-19 오후 11.02.58.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/826e20c0-42c9-4dcd-8102-ef34a5f5c5d2/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2023-05-19_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_11.02.58.png)
