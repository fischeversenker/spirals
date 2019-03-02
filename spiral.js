const MIN_LENGTH = 0.1;
const MIN_WIDTH = 0.4;
const FLOWER_DURATION = 400;

class Spiral {

  constructor(ctx, pos, dir, options) {
    options = options || {};
    this.ctx = ctx;
    this.position = pos;
    this.direction = dir;
    this.previousDirection = null;
    this.rotationFactor = options.rotationFactor;
    this.scaleFactor = options.scaleFactor;
    this.color = options.color;
    this.width = options.width;
    this.stayOnCurve = options.stayOnCurve;
    this.splitRatio = options.splitRatio;
    this.flowers = options.flowers;
    this.flowerIsFullSize = false;
    this.flowerRadius = Math.random() * 4;
    this.shouldFlower = Math.random() > 0.1;
    this.flowerStarted = 0;
    this.dead = false;
  }

  update() {
    if (this.dead && this.flowerIsFullSize) {
      return false;
    }
    if (this.direction.length() < MIN_LENGTH) {
      if (this.shouldFlower) {
        if (this.flowerStarted === 0) {
          this.flowerStarted = Date.now();
        }
        if (!this.flowerIsFullSize) {
          this.updateFlower();
        }
      } else {
        this.flowerIsFullSize = true;
      }
      this.dead = true;
    } else {
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = Math.max(this.width * this.direction.length() / 8, MIN_WIDTH);
      let x = this.position.x + this.direction.x;
      let y = this.position.y + this.direction.y;
      this.ctx.beginPath();
      this.ctx.moveTo(this.position.x, this.position.y);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      // turn randomly
      if (this.turns()) {
        this.rotationFactor = -this.rotationFactor;
      }

      this.position = new Vector(x, y);
      this.direction = this.direction.rotate(this.rotationFactor).scale(this.scaleFactor);
    }
    return true;
  }

  updateFlower() {
    const radius = (Date.now() - this.flowerStarted) / FLOWER_DURATION * this.flowerRadius;
    this.ctx.fillStyle = this.color; // 'rgba(150, 150, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(this.position.x, this.position.y, radius, 0, 360);
    this.ctx.fill();

    if (Date.now() > this.flowerStarted + FLOWER_DURATION) {
      this.flowerIsFullSize = true;
    }
  }

  splits() {
    return Math.random() > this.splitRatio - this.direction.length() / 100;
  }

  turns() {
    return Math.random() > this.stayOnCurve - this.direction.length() / 100;
  }
}
