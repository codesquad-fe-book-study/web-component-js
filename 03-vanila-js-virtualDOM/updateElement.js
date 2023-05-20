export function updateElement(parent, newNode, oldNode) {
  if (!newNode && oldNode) {
    return oldNode.remove();
  }

  if (newNode && !oldNode) {
    return parent.appendChild(newNode);
  }

  if (newNode instanceof Text && oldNode instanceof Text) {
    if (oldNode.nodeValue === newNode.nodeValue) return;

    oldNode.nodeValue = newNode.nodeValue;
    return;
  }

  if (newNode.nodeName !== oldNode.nodeName) {
    const index = [...parent.childNodes].indexOf(oldNode);
    return oldNode.remove(), parent.appendChild(newNode, index);
  }

  updateAttributes(oldNode, newNode);

  const newChildren = [...newNode.childNodes];
  const oldChildren = [...oldNode.childNodes];
  const maxLength = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < maxLength; i++) {
    updateElement(oldNode, newChildren[i], oldChildren[i]);
  }
}

function updateAttributes(oldNode, newNode) {
  const oldProps = [...oldNode.attributes];
  const newProps = [...newNode.attributes];

  for (const { name, value } of newProps) {
    if (value === oldNode.getAttribute(name)) continue;
    oldNode.setAttribute(name, value);
  }

  for (const { name } of oldProps) {
    if (newNode.getAttribute(name) !== undefined) continue;
    oldNode.removeAttribute(name);
  }
}
