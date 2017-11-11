const MODES = {
  FINE_SPIRAL_MODE: {
    rotationFactor: 0.1,
    scaleFactor: 0.98,
    color: '#ffffff',
    width: 8.8,
    stayOnCurve: 0.997,
    splitRatio: 0.993,
    centered: true,
    count: 1,
    flowers: false
  },
  SPIRAL_MODE: {
    rotationFactor: 0.05,
    scaleFactor: 0.99,
    color: '#ffffff',
    width: 2,
    stayOnCurve: 0.995,
    splitRatio: 0.987,
    centered: true,
    count: 1,
    flowers: false
  },
  MULTI_SPIRAL_MODE: {
    rotationFactor: 0.158,
    scaleFactor: 0.98,
    color: '#ffffff',
    width: 3.3,
    stayOnCurve: 0.995,
    splitRatio: 0.987,
    centered: false,
    count: 42,
    flowers: false
  },
  ROOT_MODE: {
    rotationFactor: 0.1,
    scaleFactor: 0.999,
    color: '#ffffff',
    width: 0.3,
    stayOnCurve: 0.3,
    splitRatio: 0.3,
    centered: false,
    count: 13,
    flowers: false
  },
  FEATHER_MODE: {
    rotationFactor: 0.02,
    scaleFactor: 0.986,
    color: '#ffffff',
    width: 4.5,
    stayOnCurve: 0.995,
    splitRatio: 0.987,
    centered: true,
    count: 1,
    flowers: true
  }
}