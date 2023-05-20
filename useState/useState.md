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

![image](https://github.com/codesquad-fe-book-study/web-component-js/assets/114852081/3fc9fb6e-15f2-4016-92b3-f38ed0738560)

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

<img width="482" alt="스크린샷 2023-05-20 오전 10 15 20 복사본" src="https://user-images.githubusercontent.com/114852081/239660786-4ca1db93-c4c2-4c27-9cb5-4a6edf4c85db.png">

