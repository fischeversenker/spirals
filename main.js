import { getRandomColor, getRandomPoint, getRandomVector } from './helpers.js';
import { PRESETS } from './presets.js';
import { MAX_WIDTH, MIN_WIDTH, Spiral } from './spiral.js';
import { Vector } from './vector.js';

const canvas = document.querySelector('#c');
const ctx = canvas.getContext('2d');
const padding = 100;
let spirals = [];
let running = false;
const gui = new dat.gui.GUI();

let CANVAS_WIDTH = 500;
let CANVAS_HEIGHT = 500;
const COLORS = [];

const configuration = {
  rotationFactor: 0.05,
  scaleFactor: 0.99,
  color: '#ffffff',
  width: 2,
  stayOnCurve: 0.995,
  splitRatio: 0.987,
  centered: true,
  count: 1,
  flowers: false,
};

function init() {
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

  addStartSpirals();
  addEventListeners();
  setupDatGui();

  start();
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
  for (let i = 0; i < configuration.count; i++) {
    vec = getRandomVector(20);
    col = COLORS[Math.floor(Math.random() * COLORS.length)];
    width = Math.max(4, Math.ceil(Math.random() * configuration.width));
    if (configuration.centered) {
      start = new Vector(0, 0);
    } else {
      start = getRandomPoint(CANVAS_WIDTH, CANVAS_HEIGHT, padding);
    }
    const spiral = getPlacedSpiral(start, vec, null, null, col, width);
    spirals.push(spiral);
  }
}

function update() {
  if (!running) {
    return false;
  }
  spirals.forEach((spiral, i) => {
    spiral.previousDirection = spiral.direction;
    if (spiral.splits() && spirals.length < 300) {
      const childSpiral = getPlacedSpiral(
        spiral.position,
        spiral.direction.scale(0.8),
        -spiral.rotationFactor,
        spiral.scaleFactor,
        spiral.color,
        spiral.width,
        undefined,
        undefined,
        undefined,
        spiral.root ?? spiral
      );
      spirals.push(childSpiral);
      childSpiral.root.addChild(childSpiral);
    }

    spiral.update();

    if (spiral.dead && !spiral.hasReplacement && spiral.root === null) {
      addStartSpirals();
      spiral.hasReplacement = true;
    }
  });
  window.requestAnimationFrame(update);
}

function addEventListeners() {
  document.addEventListener('keyup', (ev) => {
    if (ev.key === 'r') {
      reset();
    }
    if (ev.key === 'p') {
      toggle();
    }
  });
  window.addEventListener('resize', adjustCanvasSize);
}

function toggle() {
  running = !running;
  if (running) {
    start();
  }
}

function getPlacedSpiral(
  pos,
  dir,
  rot,
  scale,
  color,
  width,
  stayOnCurve,
  splitRatio,
  flowers,
  root
) {
  let spiralOptions = {
    rotationFactor: rot || configuration.rotationFactor,
    scaleFactor: scale || configuration.scaleFactor,
    color: color || configuration.color,
    width: width || configuration.width,
    stayOnCurve: stayOnCurve || configuration.stayOnCurve,
    splitRatio: splitRatio || configuration.splitRatio,
    flowers: flowers || configuration.flowers,
    root: root || null,
  };
  const spiral = new Spiral(ctx, pos, dir, spiralOptions);
  return spiral;
}

function setupDatGui() {
  let obj = {
    reset: reset,
    toggle: toggle,
    preset: 'FINE_SPIRAL',
  };

  let presets = ['FINE_SPIRAL', 'SPIRAL', 'MULTI_SPIRAL', 'ROOT', 'FEATHER'];

  let presetController = gui.add(obj, 'preset', presets);
  let rotationFactorController = gui
    .add(configuration, 'rotationFactor', 0, 0.3, 0.002)
    .listen();
  let scaleFactorController = gui
    .add(configuration, 'scaleFactor', 0.95, 1.05, 0.001)
    .listen();
  let widthController = gui
    .add(configuration, 'width', MIN_WIDTH * 2, MAX_WIDTH)
    .name('maxWidth')
    .listen();
  let stayOnCurveController = gui
    .add(configuration, 'stayOnCurve', 0.8, 1, 0.001)
    .name('prob of not turning')
    .listen();
  let splitRatioController = gui
    .add(configuration, 'splitRatio', 0.7, 1, 0.001)
    .name('prob of not splitting')
    .listen();
  let centeredController = gui.add(configuration, 'centered').listen();
  let countController = gui.add(configuration, 'count', 1, 10, 1).listen();
  gui.add(obj, 'reset').name('[R] Reset');
  gui.add(obj, 'toggle').name('[P] Pause/Play');

  presetController.onChange((value) => {
    const preset = PRESETS[value];
    configuration.scaleFactor = preset.scaleFactor;
    configuration.rotationFactor = preset.rotationFactor;
    configuration.color = preset.color;
    configuration.width = preset.width;
    configuration.stayOnCurve = preset.stayOnCurve;
    configuration.splitRatio = preset.splitRatio;
    configuration.centered = preset.centered;
    configuration.count = preset.count;
    configuration.flowers = preset.flowers;

    reset();
  });
  rotationFactorController.onChange(reset);
  scaleFactorController.onChange(reset);
  widthController.onChange(reset);
  stayOnCurveController.onChange(reset);
  splitRatioController.onChange(reset);
  centeredController.onChange(reset);
  countController.onChange(reset);
}

init();
