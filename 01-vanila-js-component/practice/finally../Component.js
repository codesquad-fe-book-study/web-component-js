export default class Component {
  $target;
  props;
  state;

  constructor($target, props) {
    this.$target = $target;
    this.props = props;
    this.initState();
    this.setEvent();
    this.render();
  }
  initState() {}
  mounted() {}
  getTemplate() {
    return '';
  }
  render() {
    this.$target.innerHTML = this.getTemplate();
    this.mounted();
  }
  setEvent() {}
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
  addEvent(eventType, selector, callback) {
    const children = [...this.$target.querySelectorAll(selector)];
    this.$target.addEventListener(eventType, (event) => {
      if (!event.target.closest(selector)) return false;
      callback(event);
    });
  }
}
