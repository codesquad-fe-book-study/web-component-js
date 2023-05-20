import { updateElement } from './updateElement.js';

export default class Component {
  element;
  state;
  props;

  constructor(element, props) {
    this.element = element;
    this.props = props;
    this.initState();
    this.render();
  }

  initState() {}
  getTemplate() {
    return '';
  }

  setEvent() {}

  render() {
    const { element } = this;

    const newNode = element.cloneNode(true);
    newNode.innerHTML = this.getTemplate();

    const oldChildNodes = [...element.childNodes];
    const newChildNodes = [...newNode.childNodes];
    const max = Math.max(oldChildNodes.length, newChildNodes.length);

    for (let i = 0; i < max; i++) {
      updateElement(element, newChildNodes[i], oldChildNodes[i]);
    }

    this.renderChildren();
    requestAnimationFrame(() => this.setEvent());
  }

  renderChildren() {}

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  handleEvent(eventType, selector, callback) {
    this.element.addEventListener(eventType, (event) => {
      if (!event.target.closest(selector)) {
        return false;
      }
      callback(event);
    });

    this.element.removeEventListener(eventType, (event) => {
      if (!event.target.closest(selector)) {
        return false;
      }
      callback(event);
    });
  }
}
