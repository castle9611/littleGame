// 拖动和触摸事件处理模块
// 依赖全局变量：container, finished, isFinish, showTip

// 拖拽相关变量
let dragElement = null;

// 触摸事件相关变量
let touchStartElement = null;
let touchStartTime = 0;
let touchStartPos = { x: 0, y: 0 };

// 鼠标拖拽事件处理
function onDragStart(e) {
    if (finished) {
        e.preventDefault();
        return false;
    }
    dragElement = e.currentTarget;
}

function onDragOver(e) {
    if (!finished) {
        e.preventDefault();
    } else {
        e.preventDefault();
        return false;
    }
}

function onDrop(e) {
    if (finished) {
        e.preventDefault();
        return false;
    }
    let dropElement = e.currentTarget;
    if (dragElement != null && dragElement != dropElement) {
        exchangeElement(dragElement, dropElement);
        if (isFinish()) {
            showTip();
        }
    }
    dragElement = null;
}

// 触摸事件处理
function onTouchStart(e) {
    if (finished) return;
    touchStartElement = e.currentTarget;
    touchStartTime = Date.now();
    const touch = e.touches[0];
    touchStartPos.x = touch.clientX;
    touchStartPos.y = touch.clientY;
    // 添加视觉反馈
    if (touchStartElement) {
        touchStartElement.style.opacity = '0.7';
        touchStartElement.style.transition = 'opacity 0.2s, transform 0.1s';
    }
    e.preventDefault();
}

function onTouchMove(e) {
    if (!touchStartElement) return;
    e.preventDefault();
    // 添加轻微的拖动效果
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    const moveDistance = Math.abs(deltaX) + Math.abs(deltaY);
    
    // 超过5px才开始移动视觉反馈
    if (moveDistance > 5 && touchStartElement) {
        touchStartElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
        touchStartElement.style.opacity = '0.8';
    }
}

function onTouchEnd(e) {
    if (!touchStartElement) return;
    
    // 获取触摸结束的位置
    const endTouch = e.changedTouches[0];
    const endX = endTouch.clientX;
    const endY = endTouch.clientY;
    
    // 恢复样式
    const currentElement = touchStartElement;
    currentElement.style.opacity = '1';
    currentElement.style.transform = '';
    
    // 计算移动距离
    const deltaX = endX - touchStartPos.x;
    const deltaY = endY - touchStartPos.y;
    const moveDistance = Math.abs(deltaX) + Math.abs(deltaY);
    
    // 如果是拖拽操作
    if (moveDistance >= 15) {
        const dropElement = document.elementFromPoint(endX, endY);
        const targetItem = findClosestItem(dropElement, endX, endY);
        
        if (targetItem && currentElement !== targetItem) {
            exchangeElement(currentElement, targetItem);
            if (isFinish()) {
                showTip();
            }
        }
    }
    
    // 重置触摸状态
    touchStartElement = null;
    touchStartTime = 0;
}

// 查找最近的拼图块元素
function findClosestItem(element, x, y) {
    if (!element) return null;
    
    // 向上查找，直到找到 .item 元素
    let current = element;
    while (current && current !== container) {
        if (current.classList && current.classList.contains('item')) {
            return current;
        }
        current = current.parentElement;
    }
    
    // 如果没找到，尝试查找距离最近的 item
    const items = container.querySelectorAll('.item');
    let closest = null;
    let minDist = Infinity;
    
    items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemX = rect.left + rect.width / 2;
        const itemY = rect.top + rect.height / 2;
        const dist = Math.sqrt((x - itemX) ** 2 + (y - itemY) ** 2);
        
        if (dist < minDist) {
            minDist = dist;
            closest = item;
        }
    });
    
    return closest;
}

// 交换两个元素的位置和数据
function exchangeElement(firstElement, secondElement) {
    if (finished) return; // 如果已完成，不允许交换
    
    // 交换数据
    let tempX = firstElement.dataset.x;
    let tempY = firstElement.dataset.y;
    
    firstElement.setAttribute('data-x', secondElement.dataset.x);
    firstElement.setAttribute('data-y', secondElement.dataset.y);
    
    secondElement.setAttribute('data-x', tempX);
    secondElement.setAttribute('data-y', tempY);
    
    // 交换位置
    let temp = document.createElement('div');
    container.replaceChild(temp, secondElement);
    container.replaceChild(secondElement, firstElement);
    container.replaceChild(firstElement, temp);
}

// 为元素添加拖动事件监听器
function attachDragListeners(item) {
    item.addEventListener('dragstart', onDragStart);
    item.addEventListener('dragover', onDragOver);
    item.addEventListener('drop', onDrop);
    // 添加触摸事件支持
    item.addEventListener('touchstart', onTouchStart);
    item.addEventListener('touchmove', onTouchMove);
    item.addEventListener('touchend', onTouchEnd);
}

