class Component {
  $target;
  state;

  constructor($target) {
    this.$target = $target;
    this.initState();
    this.render();
  }
  initState() {}
  getTemplate() {
    return '';
  }
  render() {
    this.$target.innerHTML = this.getTemplate();
    this.setEvent();
  }
  setEvent() {}
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
}
class Items extends Component {
  initState() {
    this.state = { items: ['item1', 'item2'] };
  }
  getTemplate() {
    const { items } = this.state;
    return `
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
      <button>추가</button>
    `;
  }

  setEvent() {
    this.$target.querySelector('button').addEventListener('click', () => {
      const { items } = this.state;
      this.setState({ items: [...items, `item${items.length + 1}`] });
    });
  }
}

class App {
  constructor() {
    const $app = document.querySelector('#app');
    new Items($app);
  }
}

new App();
