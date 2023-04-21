import Component from './Component.js';

class App extends Component {
  initState() {
    this.state = {
      isFilter: 0,
      items: [
        {
          id: 1,
          contents: 'item1',
          active: false,
        },
        {
          id: 2,
          contents: 'item2',
          active: true,
        },
      ],
    };
  }

  getTemplate() {
    return `
      <header data-component="item-appender"></header>
      <main data-component="items"></main>
      <footer data-component="item-filter"></footer>
    `;
  }

  mounted() {
    const { filteredItems, addItem, deleteItem, toggleItem, filterItem } = this;
    const $itemAppender = this.$target.querySelector(
      '[data-component="item-appender"]'
    );
    const $items = this.$target.querySelector('[data-component="items"]');
    const $itemFilter = this.$target.querySelector(
      '[data-component="item-filter"]'
    );

    new ItemAppender($itemAppender, {
      addItem: addItem.bind(this),
    });
    new Items($items, {
      filteredItems,
      deleteItem: deleteItem.bind(this),
      toggleItem: toggleItem.bind(this),
    });
    new ItemFilter($itemFilter, {
      filterItem: filterItem.bind(this),
    });
  }

  get filteredItems() {
    const { isFilter, items } = this.state;
    return items.filter(
      ({ active }) =>
        (isFilter === 1 && active) ||
        (isFilter === 2 && !active) ||
        isFilter === 0
    );
  }

  addItem(contents) {
    const { items } = this.state;
    const id = Math.max(0, ...items.map((v) => v.id)) + 1;
    const active = false;
    this.setState({
      items: [...items, { id, contents, active }],
    });
  }

  deleteItem(id) {
    const items = [...this.state.items];
    items.splice(
      items.findIndex((v) => v.id === id),
      1
    );
    this.setState({ items });
  }

  toggleItem(id) {
    const items = [...this.state.items];
    const index = items.findIndex((v) => v.id === id);
    items[index].active = !items[index].active;
    this.setState({ items });
  }

  filterItem(isFilter) {
    this.setState({ isFilter });
  }
}

class ItemAppender extends Component {
  getTemplate() {
    return `<input type="text" class="appender" placeholder="아이템 내용 입력" />`;
  }

  setEvent() {
    const { addItem } = this.props; // ItemAppender 생성 시 2번째 인자 props {addItem: addItem.bind(this)} addItem 메서드의 this는 App
    this.addEvent('keyup', '.appender', ({ key, target }) => {
      if (key !== 'Enter') return;
      addItem(target.value); // Enter 시 App addItem 메서드를 실행한다. 인자로 ItemAppender keyup 이벤트 target의 value를 전달한다.
    });
  }
}

class Items extends Component {
  getTemplate() {
    const { filteredItems } = this.props;
    return `
      <ul>
        ${filteredItems
          .map(
            ({ contents, active, id }) => `
          <li data-id="${id}">
            ${contents}
            <button class="toggleBtn" style="color: ${
              active ? '#09F' : '#F09'
            }">
              ${active ? '활성' : '비활성'}
            </button>
            <button class="deleteBtn">삭제</button>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  }

  setEvent() {
    const { deleteItem, toggleItem } = this.props;

    this.addEvent('click', '.deleteBtn', ({ target }) => {
      deleteItem(Number(target.closest('[data-id]').dataset.id));
    });

    this.addEvent('click', '.toggleBtn', ({ target }) => {
      toggleItem(Number(target.closest('[data-id]').dataset.id));
    });
  }
}

class ItemFilter extends Component {
  getTemplate() {
    return `
      <button class="filterBtn" data-is-filter="0">전체 보기</button>
      <button class="filterBtn" data-is-filter="1">활성 보기</button>
      <button class="filterBtn" data-is-filter="2">비활성 보기</button>
    `;
  }

  setEvent() {
    const { filterItem } = this.props;
    this.addEvent('click', '.filterBtn', ({ target }) => {
      filterItem(Number(target.dataset.isFilter));
    });
  }
}
