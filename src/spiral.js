import { Vector } from "./vector.js";

export const MIN_LENGTH = 0.2;
export const MIN_WIDTH = 0.4;
export const MAX_WIDTH = 10;
export const FLOWER_DURATION = 400;

export class Spiral {
  constructor(ctx, pos, dir, options) {
    options = options || {};
    this.ctx = ctx;
    this.origin = pos;
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
    this.initialFlowerRadius = Math.random() * 4;
    this.flowerRadius = Math.random() * 4;
    this.shouldFlower = this.flowers && Math.random() > 0.1;
    this.flowerStarted = 0;
    this.hasReplacement = false;
    this.children = [];
    this.ttl = Math.random() * 10 + 400;
    this.steps = [this.origin];
  }

  update() {
    if (this.isDead()) {
      if (this.flowerIsFullSize) {
        return;
      }

      if (this.shouldFlower) {
        const now = Date.now();
        if (this.flowerStarted === 0) {
          this.flowerStarted = now;
        } else {
          this.flowerRadius =
            ((now - this.flowerStarted) / FLOWER_DURATION) *
            this.initialFlowerRadius;

          if (now > this.flowerStarted + FLOWER_DURATION) {
            this.flowerIsFullSize = true;
          }
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
        this.steps.at(-1) ?? this.origin,
        this.direction.scale(0.8),
        options,
      );
      this.children.push(childSpiral);
    }

    let x = this.steps.at(-1).x + this.direction.x;
    let y = this.steps.at(-1).y + this.direction.y;
    this.steps.push(new Vector(x, y));

    if (this.turns()) {
      this.rotationFactor = -this.rotationFactor;
    }

    this.direction = this.direction
      .rotate(this.rotationFactor)
      .scale(this.scaleFactor);

    this.children.forEach((child) => child.update());
  }

  render() {
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color;

    for (let index = 1; index < this.steps.length; index++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.steps.at(index - 1).x, this.steps.at(index - 1).y);
      const step = this.steps[index];
      const stepLength = this.steps
        .at(index - 1)
        .sub(step)
        .length();
      const lineWidth = Math.max((this.width * stepLength) / 6, MIN_WIDTH);
      this.ctx.lineWidth = lineWidth;
      this.ctx.lineTo(step.x, step.y);
      this.ctx.stroke();
    }

    // draw flower
    if (this.shouldFlower && this.flowerStarted && !this.flowerIsFullSize) {
      console.log(
        "drawing flower at x with radius x",
        this.steps.at(-1),
        this.flowerRadius,
      );

      this.ctx.beginPath();
      this.ctx.arc(
        this.steps.at(-1).x,
        this.steps.at(-1).y,
        this.flowerRadius,
        0,
        360,
      );
      this.ctx.fill();
    }

    this.children.forEach((child) => child.render());
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
      this.steps.length > 100
    );
  }

  getChildCount() {
    return this.children.reduce(
      (acc, child) => acc + child.getChildCount(),
      this.children.length,
    );
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
