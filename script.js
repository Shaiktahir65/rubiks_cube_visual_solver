
function getCubeSvg(state) {
  const colors = {
    r: "#ff0000",
    g: "#00ff00",
    b: "#0000ff",
    o: "#ff8000",
    y: "#ffff00",
    w: "#ffffff"
  };

  const faceOffset = [
    { x: 3, y: 0 }, // U
    { x: 0, y: 3 }, // L
    { x: 3, y: 3 }, // F
    { x: 6, y: 3 }, // R
    { x: 9, y: 3 }, // B
    { x: 3, y: 6 }  // D
  ];

  const svgSize = 360;
  const tileSize = 30;
  let svg = `<svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">`;

  for (let face = 0; face < 6; face++) {
    const offsetX = faceOffset[face].x * tileSize;
    const offsetY = faceOffset[face].y * tileSize;
    for (let i = 0; i < 9; i++) {
      const color = colors[state[face * 9 + i]];
      const x = offsetX + (i % 3) * tileSize;
      const y = offsetY + Math.floor(i / 3) * tileSize;
      svg += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${color}" stroke="#000"/>`;
    }
  }

  svg += `</svg>`;
  document.getElementById("cubeSvg").innerHTML = svg;
}

class RubiksCube {
  constructor() {
    this.faces = {
      U: Array(9).fill('w'),
      D: Array(9).fill('y'),
      L: Array(9).fill('o'),
      R: Array(9).fill('r'),
      F: Array(9).fill('g'),
      B: Array(9).fill('b')
    };
    this.scrambleMoves = [];
    this.output = document.getElementById('output');
  }

  log(message) {
    console.log(message);
    if (this.output) this.output.textContent += message + '\n';
  }

  rotateFace(faceArr, clockwise = true) {
    return clockwise
      ? [faceArr[6], faceArr[3], faceArr[0], faceArr[7], faceArr[4], faceArr[1], faceArr[8], faceArr[5], faceArr[2]]
      : [faceArr[2], faceArr[5], faceArr[8], faceArr[1], faceArr[4], faceArr[7], faceArr[0], faceArr[3], faceArr[6]];
  }

  rotate(face, dir, record = true) {
    const clockwise = dir === 'clockwise';
    if (record) {
      this.scrambleMoves.push({ face, dir: clockwise ? 'counter' : 'clockwise' });
    }
    this.log(`Rotating ${face} ${dir}`);
    this.faces[face] = this.rotateFace(this.faces[face], clockwise);

    const adjacentMap = {
      F: [['U', [6,7,8]], ['R', [0,3,6]], ['D', [2,1,0]], ['L', [8,5,2]]],
      B: [['U', [2,1,0]], ['L', [0,3,6]], ['D', [6,7,8]], ['R', [8,5,2]]],
      U: [['B', [2,1,0]], ['R', [2,1,0]], ['F', [2,1,0]], ['L', [2,1,0]]],
      D: [['F', [6,7,8]], ['R', [6,7,8]], ['B', [6,7,8]], ['L', [6,7,8]]],
      L: [['U', [0,3,6]], ['F', [0,3,6]], ['D', [0,3,6]], ['B', [8,5,2]]],
      R: [['U', [8,5,2]], ['B', [0,3,6]], ['D', [8,5,2]], ['F', [8,5,2]]]
    };

    const faces = adjacentMap[face];
    const temp = faces.map(([f, idxs]) => idxs.map(i => this.faces[f][i]));

    const order = clockwise ? [3,0,1,2] : [1,2,3,0];

    for (let i = 0; i < 4; i++) {
      const [f, idxs] = faces[i];
      idxs.forEach((idx, j) => {
        this.faces[f][idx] = temp[order[i]][j];
      });
    }
  }

  getCubeStateString() {
    const order = ['U', 'L', 'F', 'R', 'B', 'D'];
    return order.map(face => this.faces[face].join('')).join('');
  }

  displayCube() {
    this.log("Current Cube State:");
    this.log("U: " + this.faces.U.join(''));
    this.log("L: " + this.faces.L.join(''));
    this.log("F: " + this.faces.F.join(''));
    this.log("R: " + this.faces.R.join(''));
    this.log("B: " + this.faces.B.join(''));
    this.log("D: " + this.faces.D.join(''));
    this.log("-----------------------------");
    getCubeSvg(this.getCubeStateString());
  }

  scramble(n = 5) {
    const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
    const dirs = ['clockwise', 'counter'];
    this.scrambleMoves = [];
    for (let i = 0; i < n; i++) {
      const face = faces[Math.floor(Math.random() * 6)];
      const dir = dirs[Math.floor(Math.random() * 2)];
      this.rotate(face, dir, true);
    }
  }

  async solveStepByStep(delay = 1000) {
    this.log("🧠 Solving the cube step-by-step...\n");
    let i = this.scrambleMoves.length - 1;
    const step = () => {
      if (i < 0) {
        this.log("✅ Cube Solved!");
        this.displayCube();
        return;
      }
      const move = this.scrambleMoves[i];
      this.rotate(move.face, move.dir, false);
      this.displayCube();
      i--;
      setTimeout(step, delay);
    };
    step();
  }
}

window.onload = () => {
  const cube = new RubiksCube();
  cube.log("🔄 Scrambling the cube...\n");
  cube.scramble(6);
  cube.displayCube();
  setTimeout(() => cube.solveStepByStep(1000), 1000);
};
