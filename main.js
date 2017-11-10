let canvas = document.querySelector('#c');
let ctx = canvas.getContext('2d');
let width = 500;
let height = 500;

const MIN_LENGTH = 0.1;
const MAX_WIDTH = 4;
const PADDING = 100;
const COLORS = ['#77C4D3', '#333745', '#DAEDE2', '#EA2E49', '#F6F792'];
//console.log(Math.random());
let spirals = [];

function tick() {
  spirals.forEach((spiral, i) => {
    spiral.previousDirection = spiral.direction;
    if (spiral.splits() && spirals.length < 300) {
      addPlacedSpiral(spiral.position, spiral.direction.scale(0.5), -spiral.rotationFactor, null, spiral.color, spiral.width, 1);
    }
    spiral.update();
  });
  window.requestAnimationFrame(tick);
}

function addPlacedSpiral(pos, dir, rot, scale, color, width, stayOnCurve) {
  let options = {
    rotationFactor: rot || 0.08,
    scaleFactor: scale || 0.985,
    color: color || 'white',
    width: width || 1,
    stayOnCurve: stayOnCurve || 1
  };
  spirals.push(new Spiral(pos, dir, options));
}

function addRandomSpiral() {
  let start = randomPoint();
  let vec = randomVector(25);
  let col = COLORS[Math.floor(Math.random() * COLORS.length)];
  let width = Math.max(1, Math.ceil(Math.random() * MAX_WIDTH));
  addPlacedSpiral(start, vec, null, null, col, width);
}

function randomPoint() {
  let max_x = width - PADDING;
  let max_y = height - PADDING;
  let min_x = PADDING;
  let min_y = PADDING; 
  let x = Math.max(min_x, Math.round(Math.random() * max_x)) - max_x / 2;
  let y = Math.max(min_y, Math.round(Math.random() * max_y)) - max_y / 2;
  return new Vector(x, y);
}

function randomVector(max) {
  max = max || 10;
  let x = Math.round(Math.random() * max) - max / 2;
  let y = Math.round(Math.random() * max) - max / 2;
  return new Vector(x, y);
}

function clear() {
  ctx.translate(width / -2, height / -2);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);
}

function init() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  ctx.translate(width / 2, height / 2);
  clear();
  
  addStartSpirals();
  
  tick();
  
  window.setInterval(() => {
    clear();
    spirals = [];
    addStartSpirals();
  }, 7000);
}

function addStartSpirals(num = 7) {
  for (let i = 0; i < num; i++) {
    addRandomSpiral();
  }
}

function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.rotate = function(angle) {
  let rot_x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
  let rot_y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
  return new Vector(rot_x, rot_y);
};
Vector.prototype.scale = function(fac) {
  return new Vector(this.x * fac, this.y * fac);
};
Vector.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
Vector.prototype.sub = function(vec) {
  return new Vector(this.x - vec.x, this.y - vec.y);
};
Vector.prototype.dot = function(vec) {
  return this.x * vec.x + this.y * vec.y;
};
Vector.prototype.angle = function(vec) {
  let z = this.dot(vec);
  let n = this.length() * vec.length();
  let cos = z / n;
  return Math.acos(cos);
};

function Spiral(pos, dir, options){
  options = options || {};
  this.position = pos;
  this.direction = dir;
  this.previousDirection = null;
  this.rotationFactor = options.rotationFactor;
  this.scaleFactor = options.scaleFactor;
  this.color = options.color;
  this.width = options.width;
  this.stayOnCurve = options.stayOnCurve;
}
Spiral.prototype.update = function() {
  if ( this.direction.length() < MIN_LENGTH ) {
    return false;
  }
  ctx.strokeStyle = this.color;
  ctx.lineWidth = this.width; //; * this.direction.length() / 8;
  let x = this.position.x + this.direction.x;
  let y = this.position.y + this.direction.y;
  ctx.beginPath();
  ctx.moveTo(this.position.x, this.position.y);
  ctx.lineTo(x, y);
  ctx.stroke();

  // turn randomly
  if (Math.random() > this.stayOnCurve) {
    this.rotationFactor = -this.rotationFactor;
  }

  this.position = new Vector(x, y);
  this.direction = this.direction.rotate(this.rotationFactor).scale(this.scaleFactor);
  return true;
};
Spiral.prototype.splits = function() {
  return Math.random() > 0.98;
}

init();
