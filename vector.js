class Vector {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  rotate(angle) {
    let rot_x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    let rot_y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
    return new Vector(rot_x, rot_y);
  }
  
  scale(fac) {
    return new Vector(this.x * fac, this.y * fac);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  sub(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  angle(vec) {
    let z = this.dot(vec);
    let n = this.length() * vec.length();
    let cos = z / n;
    return Math.acos(cos);
  }
}
