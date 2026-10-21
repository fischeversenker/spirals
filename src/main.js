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

const storedConfiguration = localStorage.getItem('configuration');
const configuration = storedConfiguration
  ? JSON.parse(storedConfiguration)
  : {
      rotationFactor: 0.05,
      scaleFactor: 0.99,
      color: '#ffffff',
      width: 2,
      roundness: 0.995,
      splitResistance: 0.987,
      centered: true,
      count: 1,
      revive: true,
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
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
}

function start() {
  running = true;
  render();
}

function clear() {
  ctx.fillStyle = 'black';
  ctx.fillRect(
    CANVAS_WIDTH / -2,
    CANVAS_HEIGHT / -2,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );
}

function reset() {
  if (!running) {
    return false;
  }
  clear();
  spirals = [];
  addStartSpirals();
}

function addStartSpirals(count = configuration.count) {
  let vec;
  let col;
  let width;
  let start;
  for (let i = 0; i < count; i++) {
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

function render() {
  if (!running) {
    return false;
  }

  clear();

  spirals.forEach((spiral, i) => {
    spiral.update();
    spiral.render();

    if (
      configuration.revive &&
      spiral.isDead() &&
      !spiral.hasReplacement &&
      spiral.root === null
    ) {
      addStartSpirals(1);
      spiral.hasReplacement = true;
    }

    if (spiral.isDead() && spiral.flowerIsFullSize) {
      spirals.splice(i, 1);
    }
  });
  window.requestAnimationFrame(render);
}

function addEventListeners() {
  document.addEventListener('keyup', (ev) => {
    if (ev.key === 'r') {
      reset();
    }
    if (ev.key === 'p') {
      toggle();
    }
    if (ev.key === 'c') {
      clear();
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
  roundness,
  splitResistance,
  flowers,
  root
) {
  let spiralOptions = {
    rotationFactor: rot || configuration.rotationFactor,
    scaleFactor: scale || configuration.scaleFactor,
    color: color || configuration.color,
    width: width || configuration.width,
    roundness: roundness || configuration.roundness,
    splitResistance: splitResistance || configuration.splitResistance,
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
    clear: clear,
    loadPreset: null,
  };

  let presets = ['FINE_SPIRAL', 'SPIRAL', 'MULTI_SPIRAL', 'ROOT', 'FEATHER'];

  gui
    .add(configuration, 'rotationFactor', 0, 0.3, 0.002)
    .listen()
    .onChange(storeConfiguration);
  gui
    .add(configuration, 'scaleFactor', 0.95, 1.05, 0.001)
    .listen()
    .onChange(storeConfiguration);
  gui
    .add(configuration, 'width', MIN_WIDTH * 2, MAX_WIDTH)
    .name('maxWidth')
    .listen()
    .onChange(storeConfiguration);
  gui
    .add(configuration, 'roundness', 0.8, 1, 0.001)
    .listen()
    .onChange(storeConfiguration);
  gui
    .add(configuration, 'splitResistance', 0.7, 1, 0.001)
    .listen()
    .onChange(storeConfiguration);
  const flowersController = gui
    .add(configuration, 'flowers')
    .listen()
    .onChange(storeConfiguration);
  const centeredController = gui
    .add(configuration, 'centered')
    .listen()
    .onChange(storeConfiguration);
  const reviveController = gui
    .add(configuration, 'revive')
    .listen()
    .onChange(storeConfiguration);
  gui
    .add(configuration, 'count', 1, 10, 1)
    .listen()
    .onChange(storeConfiguration);

  const presetController = gui.add(obj, 'loadPreset', presets);
  gui.add(obj, 'clear').name('[C] Clear');
  gui.add(obj, 'reset').name('[R] Reset');
  gui.add(obj, 'toggle').name('[P] Pause/Play');

  presetController.onChange((value) => {
    if (!value) {
      return;
    }
    const preset = PRESETS[value];
    configuration.scaleFactor = preset.scaleFactor;
    configuration.rotationFactor = preset.rotationFactor;
    configuration.color = preset.color;
    configuration.width = preset.width;
    configuration.roundness = preset.roundness;
    configuration.splitResistance = preset.splitResistance;
    configuration.centered = preset.centered;
    configuration.count = preset.count;
    configuration.revive = preset.revive;
    configuration.flowers = preset.flowers;

    storeConfiguration();

    flowersController.updateDisplay();
    centeredController.updateDisplay();
    reviveController.updateDisplay();
  });
}

function storeConfiguration() {
  localStorage.setItem('configuration', JSON.stringify(configuration));
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});
