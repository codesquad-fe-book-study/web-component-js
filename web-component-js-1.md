# Vanilla Javascript로 웹 컴포넌트 만들기 - 1

## 1. 컴포넌트와 상태관리

### 크로스 브라우징

- 웹 제작 시에 모든 브라우저에서 깨지지 않고 의도한 대로 올바르게 나오는 작업(호환성 해결)
- 표준 웹 기술을 채용하여 다른 기종 혹은 플랫폼에 따라 달리 구현되는 기술을 비슷하게 만듦과 동시에 어느 한쪽으로 최적화 되어 치우치지 않도록 공통 요소를 사용하여 웹페이지를 제작하는 기
- 단순하게 말하자면 컴퓨터, 스마트폰 등등 어떤 기기로 접속해도 사용자가 동일한 경험을 할 수 있게끔 해주는 것이다.

### GraphQL(Graph Query Language; gql)

- sql과 마찬가지로 쿼리 언어
- sql은 `데이터베이스`에 저장된 데이터를 효율적으로 가져오는 것이 목적. 주로 백엔드 시스템에서 작성
- gql은 `웹 클라이언트`가 데이터를 서버로부터 효율적으로 가져오는 것이 주된 목적. 주로 클라이언트 시스템에서 작성


### 클라이언트 렌더링의 흐름

브라우저와 JS가 발전하는 과정에서 아예 `브라우저(클라이언트)단에서 렌더링`을 하고, `서버에서는 REST API 또는 GraphQL 같이 브라우저 렌더링에 필요한 데이터를 제공하는 형태`로 변화하였다.
즉, 직접적으로 DOM을 조작하는 행위가 급격하게 감소했다. `상태(state)`를 기준으로 `DOM`을 렌더링하는 형태로 발전했다.
다르게 생각하면 DOM이 변하는 경우가 State에 종속되었고 이 말은 즉, State가 변하지 않을 경우 DOM이 변하면 안된다는 의미이다.

### SSR과 CSR

#### SSR(Server-Side-Rendering)

- 서버에서 HTML을 만들어서 클라이언트에 넘겨준다. 말 그대로 서버쪽에서 렌더링을 한다.
- 그렇기 때문에 클라이언트에서는 데이터를 깊은 단계까지 관리하고 다룰 필요가 없었다.

#### CSR(Client-Side-Rendering)

- JS의 발전에 따라 클라이언트 단에서 모든 렌더링을 처리하려는 시도가 생겼다.(React, Vue, Angular 등)
- 클라이언트 단에서 렌더링을 하기 위해, 렌더링에 필요한 데이터(상태)를 세밀하게 관리해야할 필요가 생겼다.
- 그래서 Redux와 같은 상태관리 라이브러리(프레임워크)가 생겨났다.

### 컴포넌트

- Angular가 CSR의 시작이었다면 React는 컴포넌트 기반 개발의 시작!
- 현 시점의 웹 어플리케이션은 대부분 컴포넌트 단위로 설계되고 개발된다.
- 또한 컴포넌트마다 컴포넌트를 렌더링할 때 필요한 상태를 관리한다.
  - `Proxy` 혹은 `Observer Pattern` 등을 이용하여 구현한다.

## 2. state - setState - render

### 2-1. 구현해보기

`setState`를 통해서 `state`를 기반으로 `render`를 해주는 코드를 만들어보기

```html
<div id="app"></div>
<script>
const $app = document.querySelector('#app');

let state = {
  items: ['item1', 'item2', 'item3', 'item4']
}

const render = () => {
  const { items } = state;
  $app.innerHTML = `
    <ul>
      ${items.map(item => `<li>${item}</li>`).join('')}
    </ul>
    <button id="append">추가</button>
  `;
  document.querySelector('#append').addEventListener('click', () => {
    setState({ items: [ ...items, `item${items.length + 1}` ] })
  })
}

const setState = (newState) => {
  state = { ...state, ...newState };
  render();
}

render();
</script>
```

- `state`가 변경되면 `render`를 실행한다.
- `state`는 `setState`로만 변경해야 한다.

> 위의 2가지가 정말 정말 핵심 내용이라고 생각한다.

### 2-2. 추상화

class 문법으로 좀더 추상화해보자

```html
<div id="app"></div>
<script>
class Component {
  $target;
  state;
  constructor ($target) { 
    this.$target = $target;
    this.setup();
    this.render();
  }
  setup () {};
  template () { return ''; }
  render () {
    this.$target.innerHTML = this.template();
    this.setEvent();
  }
  setEvent () {}
  setState (newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
}

class App extends Component {
  setup () {
    this.state = { items: ['item1', 'item2'] };
  }
  template () {
    const { items } = this.state;
    return `
        <ul>
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <button>추가</button>
    `
  }
  
  setEvent () {
    this.$target.querySelector('button').addEventListener('click', () => {
      const { items } = this.state;
      this.setState({ items: [ ...items, `item${items.length + 1}` ] });
    }); 
  }
}

new App(document.querySelector('#app'));
</script>
```

class를 사용하여 조금 더 유연하고 그럴듯한(?) 컴포넌트가 작성되었다.

### 2-3. 모듈화

위의 파일들을 아래와 같은 구조로 나눌 수 있다.

```shell
.
├── index.html
└── src
    ├── app.js              # ES Module의 entry file
    ├── components          # Component 역할을하는 것들
    │   └── Items.js
    └── core                # 구현에 필요한 코어들
        └── Component.js
```

src/core/Component.js

- 아래와 같이 Component 역할을 하는 class를 생성한다.

```js
export default class Component {
  $target;
  state;
  constructor ($target) {
    this.$target = $target;
    this.setup();
    this.render();
  }
  setup () {};
  template () { return ''; }
  render () {
    this.$target.innerHTML = this.template();
    this.setEvent();
  }
  setEvent () {}
  setState (newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
}
```

src/components/Items.js

- 위의 Component class를 상속하여 좀더 구체적인 class를 구현한다.

```js
import Component from "../core/Component.js";

export default class Items extends Component {
  setup () {
    this.state = { items: ['item1', 'item2'] };
  }
  template () {
    const { items } = this.state;
    return `
      <ul>
        ${items.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <button>추가</button>
    `
  }

  setEvent () {
    this.$target.querySelector('button').addEventListener('click', () => {
      const { items } = this.state;
      this.setState({ items: [ ...items, `item${items.length + 1}` ] });
    });
  }
}
```

index.html

- html에는 아래와 같이 entry 역할(app 혹은 root)을 하는 태그 하나만이 존재한다.

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Simple Component 2</title>
</head>
<body>
<div id="app"></div>
<script src="./src/app.js" type="module"></script>
</body>
</html>
```

src/app.js

- app 태그를 target으로 하여 구현된 Items를 붙인다.

```js
import Items from "./components/Items.js";

class App {
  constructor() {
    const $app = document.querySelector('#app');
    new Items($app);
  }
}

new App();
```

## 3. 이벤트 처리

### 3-1. 불편함 감지

앞의 코드를 보면 render 시마다 새로운 html을 할당함으로 다시 event를 등록해주어야 한다. 또한 반복적인 요소에 대해서 이벤트를 등록해주어야할 때는 더 불편하다.
예를 들어 각각의 아이템을 삭제하는 기능을 추가한다고 하면 아래와 같다.

```js
import Component from "../core/Component.js";

export default class Items extends Component {
  setup () {
    this.state = { items: ['item1', 'item2'] };
  }
  template () {
    const { items } = this.state;
    return `
      <ul>
        ${items.map((item, key) => `
          <li>
            ${item}
            <button class="deleteBtn" data-index="${key}">삭제</button>
          </li>
        `).join('')}
      </ul>
      <button class="addBtn">추가</button>
    `
  }

  setEvent () {
    this.$target.querySelector('.addBtn').addEventListener('click', () => {
      const { items } = this.state;
      this.setState({ items: [ ...items, `item${items.length + 1}` ] });
    });
    // 아래와 같이 모든 deleteBtn에 대해서 다소 복잡한 핸들러를 전달해야한다.
    this.$target.querySelectorAll('.deleteBtn').forEach(deleteBtn =>
      deleteBtn.addEventListener('click', ({ target }) => {
        const items = [ ...this.state.items ];
        items.splice(target.dataset.index, 1);
        this.setState({ items });
      }))
  }
}
```

### 3-2. 이벤트 버블링

```js
export default class Items extends Component {
  setup () {/* 생략 */}
  template () { /* 생략 */}
  setEvent () {
    // 모든 이벤트를 this.$target에 등록하여 사용하면 된다.
    // 여기서 { target } 에서 target은 e.target이 된다.
    this.$target.addEventListener('click', ({ target }) => {
      const items = [ ...this.state.items ];

      if (target.classList.contains('addBtn')) {
        this.setState({ items: [ ...items, `item${items.length + 1}` ] });
      }

      if (target.classList.contains('deleteBtn')) {
        items.splice(target.dataset.index, 1);
        this.setState({ items });
      }

    });
  }
}
```

위와 같이 이벤트 버블링을 이용하기 위해 $target(컴포넌트가 붙게 되는 element)에 이벤트를 등록했기 때문에 이제 render마다 굳이 setEvent를 호출할 필요가 없어진다.

```js
export default class Component {
   $target;
   state;
   constructor ($target) {
     this.$target = $target;
     this.setup();
+    this.setEvent(); // constructor에서 한 번만 실행한다.
     this.render();
   }
   setup () {};
   template () { return ''; }
   render () {
     this.$target.innerHTML = this.template();
-    this.setEvent(); // render 때마다 이벤트를 붙일 필요가 없어졌다.
   }
   setEvent () {}
   setState (newState) {
     this.state = { ...this.state, ...newState };
     this.render();
   }
 }
```

### 3-3. 이벤트 버블링 추상화

```js
export default class Component {
  $target;
  state;
  constructor ($target) { /* 생략 */ }
  setup () { /* 생략 */ }
  template () { /* 생략 */ }
  render () { /* 생략 */ }
  setEvent () { /* 생략 */ }
  setState (newState) { /* 생략 */ }

  addEvent (eventType, selector, callback) {
    const children = [...this.$target.querySelectorAll(selector)];
    this.$target.addEventListener(eventType, event => {
      if (!event.target.closest(selector)) return false;
      callback(event);
    })
  }
}

export default class Items extends Component {
  setup () { /* 생략 */ }
  template () {/* 생략 */ }
  setEvent () {
    this.addEvent('click', '.addBtn', ({ target }) => {
      const { items } = this.state;
      this.setState({ items: [ ...items, `item${items.length + 1}` ] });
    });
    this.addEvent('click', '.deleteBtn', ({ target }) => {
      const items = [ ...this.state.items ];
      items.splice(target.dataset.index, 1);
      this.setState({ items });
    });
  }
}
```

# 참고

- [개발자 황준일 - Vanilla Javascript로 웹 컴포넌트 만들기 1편](https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Component/#_1-%E1%84%8F%E1%85%A5%E1%86%B7%E1%84%91%E1%85%A9%E1%84%82%E1%85%A5%E1%86%AB%E1%84%90%E1%85%B3%E1%84%8B%E1%85%AA-%E1%84%89%E1%85%A1%E1%86%BC%E1%84%90%E1%85%A2%E1%84%80%E1%85%AA%E1%86%AB%E1%84%85%E1%85%B5)
- [크로스 브라우징](https://pxd-fed-blog.web.app/cross-browsing/)
- [카카오테크 - GraphQL 개념잡기](https://tech.kakao.com/2019/08/01/graphql-basic/)

