'use strict';

let canvas = document.querySelector('#c');
let ctx = canvas.getContext('2d');
let width = 500;
let height = 500;
let padding = 20;
let spirals = [];
let currentMode = null;
let running = false;
let gui = new dat.gui.GUI();

const MIN_LENGTH = 0.1;
const MAX_WIDTH = 10;
const MIN_WIDTH = 0.1;
const COLORS = [];// 77'#77C4D3', '#333745', '#DAEDE2', '#EA2E49', '#F6F792'];

function init(mode) {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  ctx.translate(width / 2, height / 2);
  clear();

  // add "random" colors
  for (let i = 0; i < 7; i++) {
    COLORS.push(getRandomColor());
  }

  currentMode = mode || Object.assign({}, SPIRAL_MODE);
  addStartSpirals();
  addEventListeners();
  setupDatGui();

  start();
}

function adjustCanvasSize() {
  ctx.translate(width / -2, height / -2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  ctx.translate(width / 2, height / 2);
  reset();
}

function start() {
  running = true;
  update();
}

function clear() {
  ctx.translate(width / -2, height / -2);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);
}

function reset() {
  clear();
  spirals = [];
  addStartSpirals();
}

function addStartSpirals() {
  let vec;
  let col;
  let width;
  let start;
  for (let i = 0; i < currentMode.count; i++) {
    vec = getRandomVector(20);
    col = COLORS[Math.floor(Math.random() * COLORS.length)];
    width = Math.max(1, Math.ceil(Math.random() * currentMode.width));
    if (currentMode.centered) {
      start = new Vector(0, 0);
    } else {
      start = getRandomPoint(width, height, padding);
    }
    addPlacedSpiral(start, vec, null, null, col, width);
  }
}

function update() {
  if (!running) {
    return false;
  }
  spirals.forEach((spiral, i) => {
    spiral.previousDirection = spiral.direction;
    if (spiral.splits() && spirals.length < 300) {
      addPlacedSpiral(spiral.position, spiral.direction.scale(0.5), -spiral.rotationFactor, spiral.scaleFactor, spiral.color, spiral.width);
    }
    spiral.update();
  });
  window.requestAnimationFrame(update);
}

function addEventListeners() {
  document.addEventListener('keyup', ev => {
    if (ev.keyCode === 82) {
      reset();
    }
    if (ev.keyCode === 80) {
      toggle();
    }
  });
  window.addEventListener('resize', adjustCanvasSize);
}

function toggle() {
  running = !running;
  if ( running) {
    start();
  }
}

function addPlacedSpiral(pos, dir, rot, scale, color, width, stayOnCurve, splitRatio) {
  let mode = {
    rotationFactor: rot || currentMode.rotationFactor,
    scaleFactor: scale || currentMode.scaleFactor,
    color: color || currentMode.color,
    width: width || currentMode.width,
    stayOnCurve: stayOnCurve || currentMode.stayOnCurve,
    splitRatio: splitRatio || currentMode.splitRatio
  };
  spirals.push(new Spiral(ctx, pos, dir, mode));
}

function addRandomSpiral(size) {
  let start = getRandomPoint(width, height, padding);
  let vec = getRandomVector(size);
  let col = COLORS[Math.floor(Math.random() * COLORS.length)];
  let width = Math.max(1, Math.ceil(Math.random() * MAX_WIDTH));
  addPlacedSpiral(start, vec, null, null, col, width);
}

function setupDatGui() {

  let obj = {
    reset: reset,
    toggle: toggle,
    padding: padding
  };

  let rotationFactorController = gui.add(currentMode, 'rotationFactor', 0, 0.3, 0.002);
  let scaleFactorController = gui.add(currentMode, 'scaleFactor', 0.95, 1.05, 0.001);
  let widthController = gui.add(currentMode, 'width', MIN_WIDTH * 2, MAX_WIDTH);
  let stayOnCurveController = gui.add(currentMode, 'stayOnCurve', 0.8, 1, 0.001).name('prob of not turning');
  let splitRatioController = gui.add(currentMode, 'splitRatio', 0.8, 1, 0.001).name('prob of not splitting');
  let centeredController = gui.add(currentMode, 'centered');
  let countController = gui.add(currentMode, 'count', 1, 10, 1);
  let paddingController = gui.add(obj, 'padding', 0, 200).name('unused');
  let resetController = gui.add(obj, 'reset').name('[R] Reset');
  let toggleController = gui.add(obj, 'toggle').name('[P] Pause/Play');
  rotationFactorController.onChange(reset);
  scaleFactorController.onChange(reset);
  widthController.onChange(reset);
  stayOnCurveController.onChange(reset);
  splitRatioController.onChange(reset);
  centeredController.onChange(reset);
  countController.onChange(reset);
  paddingController.onChange(reset);
}

init();