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
  switch (e.pointerType) {
    case 'touch': {
      // 用面积算，保底 4 px
      const area = e.width + e.height;
      return area < 20 ? area * 2 + 10 : Math.max(4, (area - 40) / 2);
    }
    case 'pen':
      return Math.max(1, e.pressure * 8);
    default:
      return Math.max(1, e.pressure * 8) || 4;
  }
}
