const canvas = document.getElementById("canvas");
const clearBtn = document.querySelector("#clearBtn");
const colorList = document.querySelector("#colorList");
const colorArray = [
  "#f52443",
  "#ffa502",
  "#f9e459",
  "#98bc67",
  "#79d2d2",
  "#91a7ff",
  "#9fa0d7",
  "#ff9393",
  "#f5eeeb",
  "#bdc3c7",
  "#95a5a6",
  "#7f8c8d",
  "#34495e",
];
canvas.height = document.documentElement.clientHeight;
canvas.width = document.documentElement.clientWidth;
for (let i = 0; i < colorArray.length; i++) {
  const li = document.createElement("li");
  if (i === 0) li.classList.add("selected");
  li.style.background = colorArray[i];
  colorList.appendChild(li);
}

let ctx = canvas.getContext("2d");
ctx.lineWidth = 4;
ctx.lineCap = "round";
ctx.strokeStyle = "#f52443";
let isDrawing = false;
let last;

// 1. 删掉原来只给桌面用的 PointerEvent 判断
// 2. 直接把 canvas 换成 PointerEvent，所有环境都能用
canvas.onpointerdown = (e) => {
  isDrawing = true;
  last = [e.clientX, e.clientY];
  ctx.lineWidth = getLineWidth(e);   // 初始粗细也按压力算
};

canvas.onpointermove = (e) => {
  if (!isDrawing) return;
  ctx.lineWidth = getLineWidth(e);   // 实时粗细
  drawLine(last[0], last[1], e.clientX, e.clientY);
  last = [e.clientX, e.clientY];
};

canvas.onpointerup = () => {
  isDrawing = false;
};
// 3. 让移动端也能用 preventDefault 防滚动
canvas.addEventListener('pointerdown', e => e.preventDefault(), { passive: false });
// 清空画布
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
// 改变画笔颜色
colorList.addEventListener("click", (e) => {
  if (e.target instanceof HTMLLIElement) {
    const prev = document.querySelector("#colorList>li.selected");
    prev.classList.remove("selected");
    const selected = e.target;
    selected.classList.add("selected");
    ctx.strokeStyle = selected.style.background;
  }
});

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function getLineWidth(e) {
  let raw, width;

  switch (e.pointerType) {
    case 'touch': {
      raw = e.width + e.height;                // 原始面积
      width = Math.max(0.5, raw * 0.25);       // 计算后线宽
      break;
    }
    case 'pen': {
      raw = e.pressure;                        // 原始压感
      width = raw * 6;                         // 计算后线宽
      break;
    }
    default: {
      raw = e.pressure ?? 0;                   // 原始压感（无压感为 0）
      width = raw ? raw * 6 : 1;               // 计算后线宽
      break;
    }
  }

  log(`raw=${raw.toFixed(2)}  width=${width.toFixed(2)}`);
  return width;
}
function log(...args) {
  const pre = document.getElementById('__log') || (() => {
    const dom = document.createElement('pre');
    dom.id = '__log';
    Object.assign(dom.style, {
      position: 'fixed',
      top: '4px',
      right: '4px',
      margin: 0,
      padding: '4px 6px',
      background: 'rgba(0,0,0,0.65)',
      color: '#fff',
      fontSize: '12px',
      lineHeight: 1.2,
      maxHeight: '90vh',
      overflow: 'auto',
      pointerEvents: 'none',
      zIndex: 9999
    });
    document.body.appendChild(dom);
    return dom;
  })();
  // 追加一行，保留最近 100 条
  pre.append(`${args.join(' ')}\n`);
  pre.scrollTop = pre.scrollHeight;
  [...pre.childNodes].slice(0, -100).forEach(n => n.remove());
}