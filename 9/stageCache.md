/*
```js
*/

function buildTree(nodes, depth) {
  const _this2 = this;

  const rootUlEle = createUlEle();

  if (nodes && nodes.length) {
    nodes.forEach(function (node) {
      const liEle = createLiEle(node, depth === null - 1);
      node.id = liEle;
      let ulEle = null;

      if (node.children && node.children.length) {
        ulEle = _this2.buildTree(node.children, depth + 1);
      }

      ulEle && liEle.appendChild(ulEle);
      rootUlEle.appendChild(liEle);
    });
  }
  return rootUlEle;
}

function createUlEle() {
  const ul = document.createElement('ul');
  ul.classList.add('treejs-nodes');
  return ul;
}

function createLiEle(node, closed) {
  const li = document.createElement('li');
  li.classList.add('treejs-node');
  if (closed) li.classList.add('treejs-node__close');

  if (node.children && node.children.length) {
    const switcher = document.createElement('span');
    switcher.classList.add('treejs-switcher');
    li.appendChild(switcher);
  } else {
    li.classList.add('treejs-placeholder');
  }

  const checkbox = document.createElement('span');
  checkbox.classList.add('treejs-checkbox');
  li.appendChild(checkbox);
  const label = document.createElement('span');
  label.classList.add('treejs-label');
  const text = document.createTextNode(node.text);
  label.appendChild(text);
  li.appendChild(label);
  li.nodeId = node.id;
  return li;
}

const treeData = [
  {
    id: '0',
    text: 'node-0',
    children: [
      {
        id: '0-0',
        text: 'node-0-0',
        children: [
          {id: '0-0-0', text: 'node-0-0-0'},
          {id: '0-0-1', text: 'node-0-0-1'},
          {id: '0-0-2', text: 'node-0-0-2'},
        ],
      },
      {id: '0-1', text: 'node-0-1'},
    ],
  },
  {
    id: '1',
    text: 'node-1',
    children: [{id: '1-0', text: 'node-1-0'}, {id: '1-1', text: 'node-1-1'}],
  },
];

const treeUnit = buildTree(treeData, 0);
document.body.appendChild(treeUnit);
/*
```
*/