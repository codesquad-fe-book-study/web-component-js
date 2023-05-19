# Vanilla Javascript로 가상돔(VirtualDOM) 만들기

## 1. 브라우저 로딩 과정

- `파싱` -> `스타일` -> `레이아웃` -> `페인트` -> `합성` -> `렌더링`
- 위 과정이 진행 후, CSS나 JS를 통해 변화가 생길 경우 re-플로우(re-레이아웃) 또는 re-페인트 과정이 진행된다.

### 1. 파싱

#### DOM Tree

- HTML을 토대로 DOM Tree를 생성한다.
  - Bytes: HTML을 바이트 단위로 읽는다. ex) `3C 62 6F 64 ... `
  - Characters: 바이트를 문자 단위로 읽는다. ex) `<html><head>...<body>...</html>`
  - Tokens: 문자를 토큰 단위로 읽는다. ex) `StartTag`: html, `startTag`: head, ... , `EndTag`: html
  - Nodes: 토큰을 노드 단위로 읽는다. ex) `Element`: html, `Element`: head, ... , `Element`: html
  - DOM: 노드를 통해 DOM Tree를 생성한다. ex) `Element`: html -> `Element`: head -> ... -> `Element`: html

#### CSSOM Tree

- CSS를 토대로 CSSOM Tree를 생성한다.
  - Bytes: CSS를 바이트 단위로 읽는다. ex) `62 6F 64 79 ... `
  - Characters: 바이트를 문자 단위로 읽는다. ex) `body { ... }`
  - Tokens: 문자를 토큰 단위로 읽는다. ex) `Selector`: body, `Property`: background-color, ... , `Value`: #fff
  - Nodes: 토큰을 노드 단위로 읽는다. ex) `Rule`: body { ... }, `Declaration`: background-color: #fff
  - CSSOM: 노드를 통해 CSSOM Tree를 생성한다. ex) `Rule`: body { ... } -> `Declaration`: background-color: #fff

### 2. 스타일

- DOM Tree와 CSSOM Tree를 통해 스타일을 계산하는 과정을 거쳐 Render Tree를 구성한다.
- Render Tree는 `화면에 표시되는 노드`(페이지를 렌더링하는 데 필요한 노드)로만 구성된다.

> `visibility: hidden`
> - 요소를 보이지 않게 한다.
> - 레이아웃에서 공간은 차지한다.
> - 렌더링 과정에서 제외되지 않는다.

> `display: none`
> - 요소를 보이지 않게 한다.
> - 레이아웃에서 공간도 차지하지 않는다.
> - 렌더링 과정에서 제외된다.

### 3. 레이아웃

- 기기의 뷰포트 내에서 각 요소의 위치와 크기를 계산한다.
- 레이아웃 과정이 다시 일어나는 것을 `리플로우`라고 한다.
- 노드의 정확한 위치와 크기를 계산한다.
- `%`로 지정된 값은 `px` 단위로 변환된다.

### 4. 페인트

- 레이아웃 과정을 통해 계산된 위치와 크기를 토대로 각 요소를 그린다.(px 단위)
- 레이아웃이 완료될 때, 브라우저가 `Paint Setup` 및 `Paint` 이벤트를 발생시킨다.
- 위치와 관계 `없는` 스타일(background-color, opacity, transform 등)은 `Paint Setup` 이벤트에서 처리된다.
- 위치와 관계 `있는` 스타일은 `Paint` 이벤트에서 처리된다.
- 위의 결과는 `레이어` 형태로 생성되어 개별 레이어로 관리된다.

### 5. 합성

- 화면에 표시하기 위해 레이어를 합성한다.(레이어를 합쳐서 하나의 화면으로 만드는 과정이다.)
- `transform`, `opacity`, `will-change` 등을 사용하면 합성 과정이 일어난다.

## 2. 성능 

### 1. 리플로우와 리페인트 과정이 일어나는 경우

- 리플로우가 일어나는 경우
  - DOM 추가/삭제
  - CSS 속성 변경을 통해 `레이아웃(너비, 높이, 넓이 등)이 변경되는 경우`
  - ex) margin, padding, width, height...
- 리페인트가 일어나는 경우
  - CSS 속성 변경이 `기하학적인 변화가 발생하지 않는 경우`
  - ex) color, background-color, visibility, box-shadow...

### 2. 브라우저에서 성능을 제일 많이 잡아 먹는 것

- `렌더링 과정`에서 성능을 제일 많이 잡아 먹는다.
- `re-플로우`가 순간적으로 많이 발생하는 경우 성능이 저하된다.