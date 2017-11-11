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
  }

  update() {
    if (this.direction.length() < MIN_LENGTH) {
      return false;
    }
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = Math.max(this.width * this.direction.length() / 8, MIN_WIDTH);
    let x = this.position.x + this.direction.x;
    let y = this.position.y + this.direction.y;
    this.ctx.beginPath();
    this.ctx.moveTo(this.position.x, this.position.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    // turn randomly
    if (Math.random() > this.stayOnCurve) {
      this.rotationFactor = -this.rotationFactor;
    }

    this.position = new Vector(x, y);
    this.direction = this.direction.rotate(this.rotationFactor).scale(this.scaleFactor);
    return true;
  }

  splits() {
    return Math.random() > this.splitRatio;
  }
}
