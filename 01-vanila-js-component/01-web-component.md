# Vanilla Javascript로 웹 컴포넌트 만들기

- 질문: 컴포넌트 단위의 구현 경험이 어땠나요?
  - 관심사가 분리되어 만족스러운데 아직 서툴러서 번거로운 로직이 많았음

## 2. state - setState - render

#### 📌 핵심

1. state가 변경되면 `render`를 실행한다.
2. state는 `setState`로만 변경해야 한다.

### (1) 기능 구현: `setState` 함수

1. 인자로 받은 newState로 state를 바꿔준다.
2. state가 변경된 후 새롭게 설정된 state로 다시 렌더링한다.

- 의도: 데이터의 상태를 (엄격하게!) 관리하기 위해 이 함수에만 그 역할과 책임을 준다. (여기저기서 상태를 변경하면 관리가 어렵기 때문에)
- 상태(State)의 변화에 따라 DOM을 렌더링한다.

### 질문

- 인자로 받은 newState로 state를 재할당해줄 때 왜 `...state`도 해주는 이유?
- `...newState`만 해줘도 되는 상황
- 지금은 state에 items 프로퍼티밖에 없지만, 상태를 관리해주려는 또 다른 프로퍼티까지 포함해서 다 관리하기 위해서? (예시로 확인하기)
- 추가된 item5만 붙여주는게 아니라 item1 ~ item4까지 처음부터 다시 만들어진다.
- 이전 state와 비교해서 달라진 부분만 렌더링하려면? -> 다음 주에 계속.. [Vanilla Javascript로 상태관리 시스템 만들기](https://junilhwang.github.io/TIL/Javascript/Design/Vanilla-JS-Store/)

### (3) 모듈화

```js
import Items from './components/Items.js';

class App {
  constructor() {
    const $app = document.querySelector('#app');
    new Items($app);
  }
}

new App();
```

- 질문: parent element를 인자로 넘기는 방식 vs child elements를 parent element에 append하는 방식
- 현재 진행중인 아마존 프로젝트는 후자 방식: getter로 node를 parent에 append해준다.
- 이 경우에 node를 바꿀 수는 없지만 해당 컴포넌트 클래스 내부가 아닌 곳에서도 node의 하위 메서드를 사용할 수 있는 구조라 전자가 더 적합하다는 깨달음을 얻음
- 굳이 왜 자식이 부모를 받아야 하는지, 왜 부모 컴포넌트의 상태/메서드를 전달 받아야 하는지 의문이 있었음(각각 개별적으로 구현해서 붙여주면 되는거 아닌가 하는 생각)
- 아직 상태 관리에 어려움을 겪은 경험이 없어서 문제 의식에 공감하지 못한 듯하다.
- 🔍 뉴스 스탠드 미션 구현 중인 코스 분들의 경험담을 듣고 간접 공감~~~

## 3. 이벤트 처리하기

### Before

- state가 변하면 render 실행
- render 안에서 setEvent를 실행
- state가 변할 때마다 render & 이벤트가 새로 등록

### After

- event를 각각의 하위 요소가 아니라 component의 target 자체(parent)에 등록
- 이벤트 버블링 특성을 이용하여 타겟에 이벤트 위임하여 component가 생성되는 시점에 이벤트 등록을 한다.
- 일일이 이벤트를 등록할 필요없고, 이후에 하위 요소가 추가되더라도 별도로 이벤트 등록할 필요 없음

### 이를 추상화한 addEvent 함수

- 추상화는 잘하면 언제나 옳다

```js
addEvent (eventType, selector, callback) {
    const children = [ ...this.$target.querySelectorAll(selector) ];
    this.$target.addEventListener(eventType, event => {
      if (!event.target.closest(selector)) return false;
      callback(event);
    })
  }
```

- 질문: selector에 해당하는 모든 요소를 담은 children은 왜 있는지?
- 🔍 쓸모 없음을 보여주기 위함 즉, 각 자식 요소에 일일이 이벤트 리스너를 등록해줄 필요 없다!

```js
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
```

1. eventType: `click`, selector: `.addBtn`

- `addBtn` 클릭 시 items 상태 변경

2. eventType: `click`, selector: `.deleteBtn`

- `deleteBtn` 클릭 시 target element의 data-index에 해당하는 item을 삭제하고 상태 수정
- 직접 state를 수정하지 않고 객체를 복사하여 가공 후 **setState 함수**의 인자로 전달하여 상태를 변경해준다. (함수형 프로그래밍)
  - 🔍 **객체의 불변성을 유지하기 위해서**: 새로운 객체를 만들어서 이전 객체와의 비교하기 위해서! (이후에는 변화된 부분만 렌더링)

## 4. 컴포넌트 분할하기

```
├── index.html
└── src
    ├── App.js               # main에서 App 컴포넌트를 마운트한다.
    ├── main.js              # js의 entry 포인트
    ├── components
    │   ├── ItemAppender.js
    │   ├── ItemFilter.js
    │   └── Items.js
    └── core
        └── Component.js
```

### 컴포넌트를 기능 단위로 구성하기

- 목적: **하나의 컴포넌트가 최대한 작은 단위의 일을 하도록 한다.**
- 기준: 재활용할 수 있도록, **재사용성**을 높이기

1. entry point가 app.js에서 main.js가 되었다
2. App Component를 추가

   - 기존의 Items에 존재하던 로직 -> App.js

3. Items에서 ItemAppender, ItemFilter 등을 분리

   - Items, ItemAppender, ItemFilter 등은 App.js에서 넘겨주는 로직을 사용하도록 만든다.
   - 질문: 왜 자식 컴포넌트에서 메서드를 정의하는게 아니라 부모에서 로직을 짜고 자식한테 이 메서드를 넘길까?
   - **상태를 부모 컴포넌트(root)에서만 접근하고 변경하고 관리한다.**
   - Element의 이벤트 핸들러 등록은 각 하위 컴포넌트에서 하지만, 이벤트에 따른 변경되는 상태는 app에서 관리된다.

### props와 mounted의 역할

- props: 부모 컴포넌트가 자식 컴포넌트에게 상태 혹은 메소드를 넘겨준다.
- mounted: render 이후에 추가적인 기능을 수행하는 함수
- 질문: '마운트한다', '자식 컴포넌트를 마운트 한다'는 표현의 의미? 왜 이걸 mount라고 할까?
- 추측: 자식 컴포넌트 HTML element를 클래스 인자로 전달하는 것은 부모 컴포넌트 입장에서는 집어넣는다고 볼 수 있다.
- 🔍 vue, react 등 라이브러리마다 mount의 역할이 다양하다.
  - 데이터를 받아야 하는 경우 비동기 로직을 수행하는 등 복잡해지면 별도 메서드로 분리한다.
  - 단순히 자신을 렌더링한 이후에 자식 컴포넌트들을 렌더링하고 이벤트를 설정해주는 후속 작업만 하는 게 아니다!
  - [den branch 내용 참고](https://github.com/codesquad-fe-book-study/web-component-js/blob/den/vanilla-js-web-component.md)

```md
마운트 Mount

1. 운영체제에서 파일 시스템을 사용할 수 있도록 하는 과정
2. 사용자가 컴퓨터에 디스크를 집어넣는 것
3. 컴퓨터 과학에서 저장 장치에 접근할 수 있는 경로를 디렉터리 구조에 편입시키는 작업
```

- 각 컴포넌트 element를 만들고, 자식 컴포넌트 클래스에 첫번째 인자로 넘겨준다. 각 컴포넌트 내부에서 정의해둔 template이 해당 element에 추가된다.
- 두번째 인자로 자식 컴포넌트에서 수행할 동작을 전달한다. (부모 컴포넌트의 메서드를 전달한다.)

### 동작 원리 및 방식 이해하기

> 참고: https://github.com/JunilHwang/simple-component

#### 📌 core Component 구조

1. Component

- props: `$target`, `props`, `state`
- method: `initState`, `setEvent`, `render`, `getTemplate`
- 동작 방식
  - 컴포넌트는 생성 시 첫번째 인자로 `$target: htmlElement`, 두번째 인자로 `props: {}`를 받는다.
    - `$target`: 각 컴포넌트의 this.$target은 생성 시 첫번째 인자로 받은 자신의 태그를 의미
    - `$props`: 생성 시 두번째 인자로 받은 부모의 props 일부 (자신이 수행할 메서드나 필요한 상태를 부모로부터 전달 받은 것)
    - `getTemplate`: 직계(?) 자식 요소로만 이루어진 템플릿 리터럴
    - 자식 컴포넌트의 자세한 구성은 해당 컴포넌트 내부의 `getTemplate`에서 정의된다.
    - component data 속성으로 컴포넌트 타입 설정

1. 공통

- `getTemplate`, `setEvent`
- `getTemplate`: props로 전달받은 부모 상태에 따른(상태에 맞는) template을 만든다.
- `setEvent`: props로 전달받은 부모의 메서드를 이벤트 핸들러 함수에서 실행하게 된다.

1. App (상위 컴포넌트)

- `initState`: 전체 초기 상태 데이터 init
- `mounted`: 자식 컴포넌트에 각 컴포넌트의 기능에 따라 node와 props(method)를 전달한다.(마운트)
- `filteredItems`, `addItem`, `deleteItem`, `toggleItem`, `filterItem`

1. ItemAppender
1. Items
1. ItemFilter

```js
class Component {
  $target;
  $props;
  $state;

  constructor($target, $props) {
    this.$target = $target;
    this.$props = $props;
    this.setup();
    this.setEvent();
    this.render();
  }
  setup() {}
  mounted() {}
  template() {
    return '';
  }
  render() {
    this.$target.innerHTML = this.template();
    this.mounted();
  }
  setEvent() {}
  setState(newState) {
    this.$state = { ...this.$state, ...newState };
    this.render();
  }
  addEvent(eventType, selector, callback) {
    this.$target.addEventListener(eventType, (event) => {
      if (!event.target.closest(selector)) return false;
      callback(event);
    });
  }
}
```

-
- [x] ItemAppender Component: addItem
- [ ] Items Component: deleteItem, toggleItem
- [ ] ItemFilter Component: filterItem
