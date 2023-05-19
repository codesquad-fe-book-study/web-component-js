// debounce & rAF를 활용하여 여러 번의 상태 변화를 한번에 처리한다.

function debounceFrame(callback) {
  let nextFrameCallbackId = -1;

  // 이전에 설정해둔 nextFrameCallback을 취소하고 다음 프레임에 실행할 콜백을 다시 등록하는 함수를 반환한다.
  return () => {
    cancelAnimationFrame(nextFrameCallbackId);
    nextFrameCallbackId = requestAnimationFrame(callback);
  };
}
