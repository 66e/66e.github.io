
/*
```js
*/

/**
 * 终极复刻版：实现紧贴的 1px 边界滑动
 * 策略：取消内部面板 clip-path，改用整体容器 overflow + 物理位移
 */
// inspired by alvarotrigo https://codepen.io/alvarotrigo/pen/mdXPawB

export const implantContainer = () => {
  console.info(document.readyState);
};

export function renderMenu ( text, containerId ) {
    const ROOT_ID = 'menu-panel-root';
    const lines = text.split('\n').filter(l => l.trim());
    const tree = { id: ROOT_ID, name: 'Root', children: [], indent: -1, parentId: null };
    const stack = [tree];

    lines.forEach((line, index) => {
        const indent = line.search(/\S/);
        const name = line.trim().replace(/^[-*]\s*/, '');
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
        const parentNode = stack[stack.length - 1];
        const node = { id: `menu-panel-${index}`, name, indent, children: [], parentId: parentNode.id };
        parentNode.children.push(node);
        stack.push(node);
    });

    const flexDiv = document.createElement('div');
    flexDiv.className = 'flexDiv';
    const btn = document.createElement('div');
    btn.className = 'trigger-btn sec_btn';
    btn.textContent = '☰';
    const wrapper = document.createElement('div');
    wrapper.className = 'selectWrapper';

    btn.onclick = (e) => { e.stopPropagation(); wrapper.classList.toggle('isOpen'); };

    function renderNode(node, isRoot = false) {
        if (node.children.length === 0) return;
        const panel = document.createElement('div');
        panel.className = 'multiSelect' + (isRoot ? ' active' : '');
        panel.id = node.id;

        const header = document.createElement('div');
        header.className = 'bottomBorder titleDiv';
        header.textContent = node.name === 'Root' ? 'New feature vector' : node.name;
        panel.appendChild(header);

        // 优化后的子项生成逻辑
        node.children.forEach(child => {
            const hasChild = child.children.length > 0;
            const item = document.createElement('div');
            
            // 1. 共有属性：所有项都是 iconDiv 且带底边框
            item.className = 'iconDiv bottomBorder';
            
            if (hasChild) {
                // 2. 分支项特有逻辑
                item.classList.add('justHover');
                item.innerHTML = `<span>${child.name}</span><span class="nav-icon">»</span>`;
                item.onclick = (e) => {
                    e.stopPropagation();
                    const target = document.getElementById(child.id);
                    if (target) {
                        panel.className = 'multiSelect leftOut';
                        target.className = 'multiSelect active';
                    }
                };
            } else {
                // 3. 功能项特有逻辑
                item.textContent = child.name;
                item.onclick = (e) => {
                    e.stopPropagation();
                    // 统一调用底座 Actions 模块
                    if (typeof menuActions !== 'undefined' && menuActions[child.name]) {
                        menuActions[child.name]();
                    } else {
                        console.log("执行默认功能:", child.name);
                    }
                    wrapper.classList.remove('isOpen');
                };
            }
            panel.appendChild(item);
        });

        if (!isRoot) {
            const back = document.createElement('div');
            back.className = 'topBorder iconDiv noSpace';
            back.innerHTML = `<span class="nav-icon">«</span><span>Back</span>`;
            back.onclick = (e) => {
                e.stopPropagation();
                const parentPanel = document.getElementById(node.parentId);
                if (parentPanel) {
                    panel.className = 'multiSelect'; // 物理右移归位
                    parentPanel.className = 'multiSelect active'; // 物理中心归位
                }
            };
            panel.appendChild(back);
        }
        wrapper.appendChild(panel);
        node.children.forEach(child => renderNode(child, false));
    }

    renderNode(tree, true);
    flexDiv.appendChild(btn);
    flexDiv.appendChild(wrapper);
    const container = document.createElement("div");
    container.appendChild(flexDiv);
    document.body.appendChild(container);
    // 注入调整后的样式
}

/*
```
*/
