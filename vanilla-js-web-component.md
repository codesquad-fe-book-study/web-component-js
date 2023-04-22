# 1주차 바닐라js로 웹컴퍼넌트 만들기

> #메소드 오버라이드 #상속 

## mounted의 역할

이 글에서는 mounted의 역할을 "mounted에서 자식 컴포넌트를 마운트 해줘야 한다."로 정하고, mounted 내부 로직을 구현했습니다. 저 또한 이번 프로젝트를 진행하면서, mounted 메서드의 역할을 단순하게 해당 컴퍼넌트의 templete이 모두 렌더링이 완료되면, 이후 진행이 필요한 로직을 모두 넣어줬습니다. (황준일씨의 패턴을 나만의 패턴으로 체화시키지 않고, 너무 그대로 따라한 것이죠...) 그래서인지 아니나 다를까, 제 프로젝트의 리뷰어분이 mounted의 역할이 무엇인가요? 라는 질문이 나왔을 때 저는 제대로 답을 못 했습니다.  
  
"해당 컴퍼넌트가 rendering이 완료되면, 이후 필요한 로직들을 실행시켜주는 역할을 합니다. 예를 들어서 해당 컴퍼넌트의 하위에 렌더링이 필요한 자식 컴퍼넌트들을 실행해주는 역할을 합니다."  
  
"그럼 해당 컴퍼넌트가 mounted 된 이후 해당 메서드 내부에서, 자식 컴퍼넌트도 초기화 시켜주고, 만약 추가적인 비동기 로직이 필요하면 그 로직도 해당 메서드에 구현할 생각인가요? 그렇게 되면, 해당 메서드의 역할도 모호해지고, 메서드의 로직도 비대해질 것 같습니다. 자식 컴퍼넌트를 렌더링하는 역할이라면, renderChildNodes라는 메서드를 따로 만들어서 싸이클을 수정하거나, 자식 컴퍼넌트를 props로 받는 식의 방법은 어떨까요?  
방법은 많습니다. veu.js나 react.js에서의 mounted 역할을 찾아보고 진행해도 좋겠네요."

### 그럼 vue.js에서의 mounted의 역할은 뭘까?

간단하게 우선 vue.js의 라이프 사이클을 보면,
  
Vue 인스턴스는 생성(create) > 부착(mount) > 업데이트(update) > 해체(destroy) 4가지 과정을 거친다고 합니다.

mount는 beforeMount, mounted로 나뉜다.

- beforeMount
: beforeMount 메서드는 Vue 인스턴스가 마운트되기 전에 DOM 요소를 조작하거나 초기화해야 하는 경우에 사용된다. 예를 들어, Vue 인스턴스가 마운트되기 전에 외부 라이브러리를 초기화하거나, DOM 요소의 높이나 너비를 측정하여 컴포넌트의 레이아웃을 조정할 수 있다.  
  
또한, Vue 컴포넌트에서 beforeMount 메서드를 사용하여 초기화해야 하는 비동기 데이터 로딩 작업을 수행할 수도 있다. 이 경우 beforeMount 메서드는 컴포넌트가 DOM에 부착되기 직전에 비동기 데이터를 로딩하고, 데이터 로딩이 완료된 후에 컴포넌트를 업데이트할 수 있도록 하는 역할을 합니다.

- mounted  
:  Vue 인스턴스가 DOM 요소에 부착된 직후에 실행되기 때문에, 해당 인스턴스가 마운트된 후에 DOM 요소를 조작하거나 초기화할 필요가 있는 경우에 사용한다. 예를 들어, mounted 메서드는 Vue 인스턴스가 DOM 요소에 마운트된 후에 외부 API 호출을 수행하거나, 다른 자바스크립트 라이브러리와의 연동을 초기화하는 등의 작업을 수행할 수 있다. 

### 그럼 React에서의 mounted의 역할은 뭘까?

React에서는 mounted 역할을 componentDidMount 라이프사이클 메서드가 한다.

componentDidMount 메서드는 일반적으로 컴포넌트가 마운트된 직후에 필요한 초기화 작업을 수행한다. 예를 들어, 데이터를 로딩하거나, 외부 라이브러리를 초기화하거나, DOM 요소를 조작하는 등의 작업을 수행할 수 있다. 

그리고 componentDidMount 메서드는 컴포넌트가 마운트된 직후에 호출되므로, DOM 요소가 모두 렌더링된 이후에 실행되기 때문에 componentDidMount 메서드 안에서 자식 컴포넌트를 초기화하거나, 비동기 로직을 수행하여 데이터를 로딩하는 것도 가능합니다.

```js
import React from 'react';
import ChildComponent from './ChildComponent';

class MyComponent extends React.Component {
  componentDidMount() {
    // 자식 컴포넌트 초기화
    // 비동기 데이터 로딩 처리
    this.fetchData();
  }

  async fetchData() {
    const data = await api.getData();
    this.setState({ data });
  }

  render() {
    return (
      <div>
        <ChildComponent data={this.state.data} />
      </div>
    );
  }
}
```

구체적으로 찾아 보진 못 했지만, React와 vue에서의 mounted 메서드는 mounting된 이후 진행이 필요한 비동기 로직을 수행하는 것 같았습니다. 자식 컴퍼넌트를 초기화 하는 로직을 넣어 줄 수 도 있지만, 제가 줬던 mounted 메서드 역할인 자식 컴퍼넌트를 최초 실행하는 역할을 하진 않아서 이 부분에 대한 고민을 같이 하면 좋을 것 같습니다.
