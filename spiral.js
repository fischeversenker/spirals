import { Vector } from './vector.js';

export const MIN_LENGTH = 0.2;
export const MIN_WIDTH = 0.4;
export const MAX_WIDTH = 10;
export const FLOWER_DURATION = 400;

export class Spiral {
  constructor(ctx, pos, dir, options) {
    options = options || {};
    this.ctx = ctx;
    this.position = pos;
    this.direction = dir;
    this.rotationFactor = options.rotationFactor;
    this.scaleFactor = options.scaleFactor;
    this.color = options.color;
    this.width = options.width;
    this.roundness = options.roundness;
    this.splitResistance = options.splitResistance;
    this.flowers = options.flowers;
    this.root = options.root;
    this.flowerIsFullSize = false;
    this.flowerRadius = Math.random() * 4;
    this.shouldFlower = Math.random() > 0.1;
    this.flowerStarted = 0;
    this.hasReplacement = false;
    this.children = [];
    this.ttl = Math.random() * 400 + 1000;
    this.steps = 0;
  }

  update() {
    if (this.isDead()) {
      if (this.flowerIsFullSize) {
        return;
      }

      if (this.flowers && this.shouldFlower) {
        if (this.flowerStarted === 0) {
          this.flowerStarted = Date.now();
        }
        if (!this.flowerIsFullSize) {
          this.updateFlower();
        }
      } else {
        this.flowerIsFullSize = true;
      }
      return;
    }

    if (this.splits()) {
      const options = {
        rotationFactor: this.rotationFactor,
        scaleFactor: this.scaleFactor,
        color: this.color,
        width: this.width,
        roundness: this.roundness,
        splitResistance: this.splitResistance,
        flowers: this.flowers,
        root: this.root ?? this,
      };
      const childSpiral = new Spiral(
        this.ctx,
        this.position,
        this.direction.scale(0.8),
        options
      );
      this.children.push(childSpiral);
    }

    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = Math.max(
      (this.width * this.direction.length()) / 8,
      MIN_WIDTH
    );
    let x = this.position.x + this.direction.x;
    let y = this.position.y + this.direction.y;
    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x, this.position.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.steps++;

    if (this.turns()) {
      this.rotationFactor = -this.rotationFactor;
    }

    this.position = new Vector(x, y);
    this.direction = this.direction
      .rotate(this.rotationFactor)
      .scale(this.scaleFactor);

    this.children.forEach((child) => child.update());
  }

  isDead() {
    return (
      this.stoppedGrowing() && this.children.every((child) => child.isDead())
    );
  }

  stoppedGrowing() {
    return (
      this.direction.length() < MIN_LENGTH ||
      (this.root?.getChildCount() > this.root?.ttl ?? false) ||
      this.steps > 100
    );
  }

  getChildCount() {
    return this.children.reduce(
      (acc, child) => acc + child.getChildCount(),
      this.children.length
    );
  }

  updateFlower() {
    const radius =
      ((Date.now() - this.flowerStarted) / FLOWER_DURATION) * this.flowerRadius;
    this.ctx.fillStyle = this.color; // 'rgba(150, 150, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(this.position.x, this.position.y, radius, 0, 360);
    this.ctx.fill();

    if (Date.now() > this.flowerStarted + FLOWER_DURATION) {
      this.flowerIsFullSize = true;
    }
  }

  addChild(spiral) {
    this.children.push(spiral);
  }

  splits() {
    return (
      Math.random() > this.splitResistance - this.direction.length() / 2 / 100
    );
  }

  turns() {
    return Math.random() > this.roundness - this.direction.length() / 100;
  }
}
