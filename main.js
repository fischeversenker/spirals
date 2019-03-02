'use strict';

let canvas = document.querySelector('#c');
let ctx = canvas.getContext('2d');
let padding = 100;
let spirals = [];
let currentMode = null;
let running = false;
let gui = new dat.gui.GUI();

let CANVAS_WIDTH = 500;
let CANVAS_HEIGHT = 500;
const MAX_WIDTH = 10;
const COLORS = []; //'#77C4D3', '#333745', '#DAEDE2', '#EA2E49', '#F6F792'];

function init(mode) {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  clear();

  // add "random" colors
  for (let i = 0; i < 7; i++) {
    COLORS.push(getRandomColor());
  }

  currentMode = mode || 'FEATHER_MODE';
  addStartSpirals();
  addEventListeners();
  setupDatGui();

  start();

  // window.setInterval(reset, 5000);
}

function adjustCanvasSize() {
  ctx.translate(CANVAS_WIDTH / -2, CANVAS_HEIGHT / -2);
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  reset();
}

function start() {
  running = true;
  update();
}

function clear() {
  ctx.translate(CANVAS_WIDTH / -2, CANVAS_HEIGHT / -2);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

function reset() {
  if (!running) {
    return false;
  }
  clear();
  spirals = [];
  addStartSpirals();
}

function addStartSpirals() {
  let vec;
  let col;
  let width;
  let start;
  for (let i = 0; i < MODES[currentMode].count; i++) {
    vec = getRandomVector(20);
    col = COLORS[Math.floor(Math.random() * COLORS.length)];
    width = Math.max(4, Math.ceil(Math.random() * MODES[currentMode].width));
    if (MODES[currentMode].centered) {
      start = new Vector(0, 0);
    } else {
      start = getRandomPoint(CANVAS_WIDTH, CANVAS_HEIGHT, padding);
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
      addPlacedSpiral(spiral.position, spiral.direction.scale(0.8), -spiral.rotationFactor, spiral.scaleFactor, spiral.color, spiral.width);
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

function addPlacedSpiral(pos, dir, rot, scale, color, width, stayOnCurve, splitRatio, flowers) {
  let mode = {
    rotationFactor: rot || MODES[currentMode].rotationFactor,
    scaleFactor: scale || MODES[currentMode].scaleFactor,
    color: color || MODES[currentMode].color,
    width: width || MODES[currentMode].width,
    stayOnCurve: stayOnCurve || MODES[currentMode].stayOnCurve,
    splitRatio: splitRatio || MODES[currentMode].splitRatio,
    flowers: flowers || MODES[currentMode].flowers
  };
  spirals.push(new Spiral(ctx, pos, dir, mode));
}

function addRandomSpiral(size) {
  let start = getRandomPoint(CANVAS_WIDTH, CANVAS_HEIGHT, padding);
  let vec = getRandomVector(size);
  let col = COLORS[Math.floor(Math.random() * COLORS.length)];
  let width = Math.max(1, Math.ceil(Math.random() * MAX_WIDTH));
  addPlacedSpiral(start, vec, null, null, col, width);
}

function setupDatGui() {

  let obj = {
    reset: reset,
    toggle: toggle,
    padding: padding,
    mode: currentMode
  };

  let modes = ['FINE_SPIRAL_MODE', 'SPIRAL_MODE', 'MULTI_SPIRAL_MODE', 'ROOT_MODE', 'FEATHER_MODE'];

  let modeController = gui.add(obj, 'mode', modes);
  let rotationFactorController = gui.add(MODES[currentMode], 'rotationFactor', 0, 0.3, 0.002).listen();
  let scaleFactorController = gui.add(MODES[currentMode], 'scaleFactor', 0.95, 1.05, 0.001).listen();
  let widthController = gui.add(MODES[currentMode], 'width', MIN_WIDTH * 2, MAX_WIDTH).name('maxWidth').listen();
  let stayOnCurveController = gui.add(MODES[currentMode], 'stayOnCurve', 0.8, 1, 0.001).name('prob of not turning').listen();
  let splitRatioController = gui.add(MODES[currentMode], 'splitRatio', 0.8, 1, 0.001).name('prob of not splitting').listen();
  let centeredController = gui.add(MODES[currentMode], 'centered').listen();
  let countController = gui.add(MODES[currentMode], 'count', 1, 10, 1).listen();
  let paddingController = gui.add(obj, 'padding', 0, 200).name('unused').listen();
  let resetController = gui.add(obj, 'reset').name('[R] Reset');
  let toggleController = gui.add(obj, 'toggle').name('[P] Pause/Play');
  modeController.onChange(() => {
    currentMode = obj.mode;
    reset();
  });
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
