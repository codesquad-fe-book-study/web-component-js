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
