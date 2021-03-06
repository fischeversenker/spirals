function getRandomColor() {
  let min_thresh = {
    r: 61,
    g: 100,
    b: 140
  };
  let max_thresh = {
    r: 90,
    g: 140,
    b: 170
  };
  let r = Math.round(Math.max(min_thresh.r, Math.min(max_thresh.r, Math.random() * 255))).toString(16),
    g = Math.round(Math.max(min_thresh.g, Math.min(max_thresh.g, Math.random() * 255))).toString(16),
    b = Math.round(Math.max(min_thresh.b, Math.min(max_thresh.b, Math.random() * 255))).toString(16);
  return "#" + r + g + b;
}

function getRandomVector(max) {
  max = max || 10;
  let x = Math.max(3, Math.round(Math.random() * max)) - max / 2;
  let y = Math.max(3, Math.round(Math.random() * max)) - max / 2;
  return new Vector(x, y);
}

function getRandomPoint(width, height, padding) {
  let max_x = width - padding;
  let max_y = height - padding;
  let min_x = padding;
  let min_y = padding;
  let x = Math.max(min_x, Math.round(Math.random() * max_x)) - max_x / 2;
  let y = Math.max(min_y, Math.round(Math.random() * max_y)) - max_y / 2;
  return new Vector(x, y);
}