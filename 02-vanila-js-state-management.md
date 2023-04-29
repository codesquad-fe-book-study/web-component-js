# 2주차 Vanilla Js로 상태관리 시스템 만들기

### 상태란?

프론트엔드에서 상태란 주로 유저 정보나 UI에 영향을 미치는 동적으로 표현되는 데이터다. 특정 컴퍼넌트 안에서 관리되는 로컬 상태와 여러 컴포넌트에서 관리되는 전역 상태로 구분지을 수 있다.

프론트엔드는 사용자와 상호작용시 필요한 데이터를 상태로 갖고 있다면, 백엔드에 데이터를 요청할 필요 없이, 상태를 필터링해서 유저에게 보여주기만 하면 된다. 이로 인해 네트워크 통신 횟수를 획기적으로 줄일 수 있다.

### 과거의 상태관리

ES6 이전 제이쿼리가 유행하던 시기에도 Ajax가 구현되어 비동기적으로 동적화면을 구성하던 시기였다. 이 시기에는 상태를 HTML의 data 속성에 넣어서 관리했다. 그래서 필요한 상태를 가지고 있는 DOM 요소가 있다면 그 요소에만 접근해서 상태를 관리할 수 있었다.

#### 문제점

- 상태를 관리하기 위해서는 DOM에 직접 접근해야 된다. 
- 상태변화 추적이 어렵다.
- api 호출해서 업데이트가 진행 되는 와중에 상태가 변경되면, 올바르게 변경됐는지 예측하기가 힘들다.

### 현대의 상태관리

위에서 나열한 문제들을 해결하기 위해 AngularJs, React, Vue, Svelte 등의 프레임워크가 등장한다.

- 상태 관리 패러다임의 변화를 연도 기준으로 보면, 
  - ~2010년 이전: jQuery
  - 2012~ : AngularJs
  - 2015~ : redux
- DOM이 아닌 JS에서 상태를 관리할 수 있게 됐다.
- 상태 데이터 값이 바뀌면 작업이 수행되도록 해서 어디서 발생했는지 알 수 있게 됐다. (하지만 디버깅은 또 다른 문제.)

### 상태관리 라이브러리 등장

Redux 등과 같은 라이브버리 등장으로 상태가 언제 어떻게 변화 됐는지 쉽게 파악할 수 있게 됐다. 리덕스는 flux 패턴을 도입해서 단방향 데이터 흐름으로 상태를 제어한다. 이로 인해 디버깅이 쉬워졌다.

리덕스는 전역 상태 저장소를 제공하고, Props drilling 문제도 해결한다. 특히 react-redux 나 최근 나온 Recoil 등은 리액트에서 리렌더를 방지해주는 최적화까지 들어있어 성능이슈까지 해결하고 있다. 전역상태를 필요한 곳에서 관리하기 매우 수월해진 것이다.

### Observer pattern

redux, recoil 등 많은 상태관리 라이브러리들은 내부적으로 상태 변화를 추적하기 위해 observer 패턴을 사용한다. 

observer pattern은 하나의 객체가 변경 됐을 때 해당 객체에 의존하는 다른 객체들이 자동으로 업데이트 되도록 해주는 것이 특징이다. 
이를 황준일 블로그에서 들어준 예시를 빌려서 좀 쉽게 풀어보자.
10명의 구독자들이 유튜버 A를 구독하고 있다. 만약 A가 새로운 영상을 업로드하거나, 공지 글을 올렸을 때, 구독자들은 A가 새롭게 업로드한 컨텐츠를 보기 위해서 A의 유튜브 페이지에 직접 들어가야 될까? 아니다. A가 올린 콘텐츠들은 업로드 즉시 유튜브가 해당 컨텐츠들을 구독자들의 유튜브 메인 화면에 뛰워줄 것이다. 유튜브가 A의 상태가 변화되면 바로 구독자들에게 알려준 다는 것을 알 수 있다.
다시 돌아와서, 위 에시를 observer pattern에 대입해보면,

- A 유튜버: 하나의 객체
- 10명의 구독자들: 하나의 객체를 구독(의존)하는 다른 10개의 객체들
- A의 영상 List: A의 상태
- 유튜브: 상태가 변화되면 변화됐다고 다른 객체들에게 notify 해주는 observer

그럼 이제, 코드로 풀어보자. observer pattern을 바닐라js로 구현하기 위해서는 핵심이 되는 개념이 몇 가지 있다.

- Object.defineProperty

> MDN 정의: Object.defineProperty() 정적 메서드는 객체에 새로운 속성을 직접 정의하거나 이미 존재하는 속성을 수정한 후, 해당 객체를 반환합니다

코드 예시로 알아보자.

```js
// Object.defineProperty(obj, prop, descriptor)
const object1 = {};

Object.defineProperty(object1, 'a', {
  value: 10,
  writable: false
});

console.log(object1) // {a: 10}
```

defineProperty api로 object1 객체 안에 'a' 라는 속성을 정의하고, 'a' 의 value로 10이 할당된 것을 확인할 수 있다.
writable 속성은 새롭게 정의된 객체의 속성을 할당 연산자로 재할당 가능 여부를 정할 수 있는 속성이다. 위 예제에서는 false로 설정해서, object1 객체의 'a'의 값을 이후에 재할당할 수 없게 된다.

```js
object1.a = 20; // 20
console.log(object1.a) // 10 -> 값이 변경되지 않음
```

writable 속성을 true로 하면 재할당이 가능해진다. writeble 속성 외에도 defineProperty의 매개변수 중 하나인 descriptor 객체 안에는 getter, setter 등 다양한 속성을 줄 수 있다.(MDN 참고)

- closure 

정리 필요

- getter, setter 

정리 필요  

이제 위 개념들을 활용해서 observer pattern을 구현해보자.

```js
let currentObserver = null;

const state = {
  a: 10,
  b: 20,
};

const stateKeys = Object.keys(state);

for (const key of stateKeys) {
  let _value = state[key];
  const observers = new Set();
  Object.defineProperty(state, key, {
    get () {
      if (currentObserver) observers.add(currentObserver);
      return _value;
    },
    set (value) {
      _value = value;
      observers.forEach(observer => observer());
    }
  })
}

const 덧셈_계산기 = () => {
  currentObserver = 덧셈_계산기;
  console.log(`a + b = ${state.a + state.b}`);
  // 질문! state.a로 a를 get 할 때 closure로 인해서 'currentObserver = 덧셈_계산기'가 observers에 등록되는 걸까요?
}

const 뺄셈_계산기 = () => {
  currentObserver = 뺄셈_계산기;
  console.log(`a - b = ${state.a - state.b}`);
}

덧셈_계산기();
state.a = 100;

뺄셈_계산기();
state.b = 200;

state.a = 1;
state.b = 2;
```


