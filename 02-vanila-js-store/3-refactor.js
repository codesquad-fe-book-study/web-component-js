// 1. 속성 a
let a = 10;
const state = {};

Object.defineProperty(state, 'a', {
  get() {
    console.log(`현재 a의 값은 ${a} 입니다.`);
    return a;
  },
  set(value) {
    a = value;
    console.log(`변경된 a의 값은 ${a} 입니다.`);
  },
});

console.log(`state.a = ${state.a}`);
state.a = 100;

// 2. 속성 a, b
const state = {
  a: 10,
  b: 20,
};

const stateKeys = Object.keys(state); // [a, b]

for (const key of stateKeys) {
  let _value = state[key];
  Object.defineProperty(state, key, {
    get() {
      console.log(`현재 state.${key}의 값은 ${_value} 입니다.`);
      return _value;
    },
    set(value) {
      _value = value;
      console.log(`변경된 state.${key}의 값은 ${_value} 입니다.`);
    },
  });
}

console.log(`a + b = ${state.a + state.b}`);

state.a = 100;
state.b = 200;

// 3. observer 함수
const state = {
  a: 10,
  b: 20,
};

const stateKeys = Object.keys(state);
const observer = () => console.log(`a + b = ${state.a + state.b}`);

for (const key of stateKeys) {
  let _value = state[key];
  Object.defineProperty(state, key, {
    get() {
      return _value;
    },
    set(value) {
      _value = value;
      observer();
    },
  });
}

observer();
state.a = 100;
state.b = 200;

// 4. observers
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
    get() {
      if (currentObserver) observers.add(currentObserver); // currentObserver를 observers에 등록
      return _value;
    },
    set(value) {
      _value = value;
      observers.forEach((observer) => observer()); // observers에 등록된 모든 observer를 실행
    },
  });
}

const 덧셈_계산기 = () => {
  currentObserver = 덧셈_계산기;
  console.log(`a + b = ${state.a + state.b}`);
};

const 뺄셈_계산기 = () => {
  currentObserver = 뺄셈_계산기;
  console.log(`a - b = ${state.a - state.b}`);
};

덧셈_계산기();
state.a = 100;

뺄셈_계산기();
state.b = 200;

state.a = 1;
state.b = 2;
