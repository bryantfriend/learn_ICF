const width = 430;
const height = 270;
const centerX = 169;
const boardRadius = 48;

function project(u, v, level) {
  return [centerX + (u - v) * 1.13, level + (u + v) * .51];
}

function path(context, points, fill, stroke, weight = 1) {
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index][0], points[index][1]);
  }
  if (fill) {
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }
  if (stroke) {
    context.lineWidth = weight;
    context.strokeStyle = stroke;
    context.stroke();
  }
}

function onPlane(points, level) {
  return points.map(function projectVertex([u, v]) { return project(u, v, level); });
}

function outline(size, cut) {
  return [
    [-size + cut, -size], [size - cut, -size], [size, -size + cut], [size, size - cut],
    [size - cut, size], [-size + cut, size], [-size, size - cut], [-size, -size + cut]
  ];
}

function gradient(context, from, to, start, end) {
  const paint = context.createLinearGradient(from[0], from[1], to[0], to[1]);
  paint.addColorStop(0, start);
  paint.addColorStop(1, end);
  return paint;
}

function slab(context, level, radius, depth, colors) {
  const vertices = outline(radius, radius > 25 ? 4 : 2);
  const top = onPlane(vertices, level);
  const bottom = onPlane(vertices, level + depth);
  const surface = gradient(context, top[7], top[3], colors.light, colors.dark);
  path(context, bottom, colors.side);
  for (let edge = 1; edge <= 5; edge += 1) {
    const next = edge + 1;
    const face = [top[edge], top[next], bottom[next], bottom[edge]];
    path(context, face, edge < 4 ? colors.side : colors.front);
  }
  path(context, top, surface, colors.rim, .8);
  path(context, bottom.slice(2, 7), null, colors.rim, .65);
}

function contact(context, u, v, level, radius, fill, stroke) {
  const [x, y] = project(u, v, level);
  context.beginPath();
  context.ellipse(x, y, radius * 1.35, radius * .65, 0, 0, Math.PI * 2);
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = .75;
    context.stroke();
  }
}

function trace(context, points, level, ink, weight) {
  path(context, onPlane(points, level), null, ink, weight);
}

function boardMarks(context, level, ink, shadow) {
  const inset = outline(43, 3);
  path(context, onPlane(inset.concat([inset[0]]), level), null, ink, .55);
  for (const u of [-39, 39]) {
    for (const v of [-39, 39]) {
      contact(context, u, v, level, 2.25, shadow, ink);
      contact(context, u, v, level, .75, ink);
    }
  }
}

function flowBoard(context, level) {
  slab(context, level, boardRadius, 7, {
    light: "#159f9b", dark: "#147d83", side: "#10515d", front: "#166771", rim: "#72d1cb"
  });
  boardMarks(context, level, "#79d8ce", "#10565e");
  const channels = [
    [[-33, -26], [-15, -26], [-9, -20], [-9, 3], [-2, 10], [17, 10], [23, 16], [23, 33]],
    [[-34, -19], [-20, -19], [-15, -14], [-15, 7], [-7, 15], [13, 15], [17, 20], [17, 33]],
    [[-35, -12], [-25, -12], [-21, -8], [-21, 11], [-12, 20], [9, 20], [11, 23], [11, 33]],
    [[-32, 30], [-16, 30], [-10, 24], [1, 24], [5, 28], [5, 34]],
    [[-12, -33], [8, -33], [16, -25], [16, -13], [30, 1], [30, 13]],
    [[-13, -26], [4, -26], [10, -20], [10, -11], [26, 5], [26, 12]]
  ];
  channels.forEach(function drawChannel(points, index) {
    const color = index % 2 ? "#77ddd1" : "#b3f3d9";
    trace(context, points, level, color, 1.1);
    const end = points[points.length - 1];
    contact(context, end[0], end[1], level, 1.55, "#1a7274", color);
  });
  for (let slot = -31; slot < -5; slot += 5) {
    trace(context, [[slot, 42], [slot, 46]], level, "#d8ebbf", 1.7);
  }
}

function memory(context, u, v, level) {
  const corners = [[u, v], [u + 14, v], [u + 14, v + 19], [u, v + 19]];
  const top = onPlane(corners, level - 1.8);
  path(context, onPlane(corners, level + 1), "#204667");
  path(context, top, "#407caf", "#b1dbf1", .7);
  trace(context, [[u + 3, v + 4], [u + 11, v + 4]], level - 2, "#8ec5e7", 1);
  for (let pin = 3; pin < 19; pin += 4) {
    trace(context, [[u - 2, v + pin], [u, v + pin]], level, "#9ccccf", 1);
    trace(context, [[u + 14, v + pin], [u + 16, v + pin]], level, "#9ccccf", 1);
  }
}

function contextBoard(context, level) {
  slab(context, level, boardRadius, 6.5, {
    light: "#57a8d2", dark: "#397eac", side: "#285579", front: "#316585", rim: "#a1d7ed"
  });
  boardMarks(context, level, "#addbeb", "#326687");
  for (const u of [-26, 0, 23]) {
    for (const v of [-24, 8]) memory(context, u - 4, v, level);
  }
  for (let bus = 0; bus < 4; bus += 1) {
    const v = 32 + bus * 1.8;
    trace(context, [[-29, v], [13, v], [17 + bus, v - 5], [32, v - 5]], level, "#b1dded", .65);
  }
}

function intentBoard(context, level) {
  slab(context, level, boardRadius, 7, {
    light: "#c2e8f6", dark: "#84b9da", side: "#54809e", front: "#709eb8", rim: "#d8f5ff"
  });
  boardMarks(context, level, "#e4f7ff", "#608da6");
  const routes = [
    [[-14, -12], [-25, -12], [-30, -17], [-39, -17]],
    [[-16, -7], [-26, -7], [-33, -14], [-39, -14]],
    [[-14, 0], [-24, 0], [-30, 6], [-39, 6]],
    [[-14, 8], [-21, 8], [-27, 14], [-27, 33]],
    [[-8, 14], [-8, 21], [-16, 29], [-16, 37]],
    [[0, 14], [0, 24], [-6, 30], [-6, 36]],
    [[8, 14], [8, 24], [17, 33], [30, 33]],
    [[14, 9], [22, 9], [33, 20], [38, 20]],
    [[14, 3], [25, 3], [35, 13], [38, 13]],
    [[14, -6], [28, -6], [32, -10], [38, -10]],
    [[13, -13], [20, -13], [26, -19], [26, -35]],
    [[5, -14], [5, -23], [15, -33], [15, -37]],
    [[-5, -14], [-5, -26], [-12, -33], [-12, -37]]
  ];
  routes.forEach(function drawRoute(points) {
    trace(context, points, level, "#6599b7", .8);
    const end = points[points.length - 1];
    contact(context, end[0], end[1], level, 1.25, "#c1e3f4", "#6594ad");
  });
  for (const position of [-10, -6, -2, 2, 6, 10]) {
    for (const sign of [-1, 1]) {
      trace(context, [[position, sign * 13], [position, sign * 18]], level, "#edf7ea", 1.9);
      trace(context, [[sign * 13, position], [sign * 18, position]], level, "#edf7ea", 1.9);
    }
  }
  slab(context, level - 4, 14.5, 3, {
    light: "#28506d", dark: "#1a364f", side: "#183448", front: "#234354", rim: "#a1c9da"
  });
  const chipRim = outline(11.2, 1.6);
  trace(context, chipRim.concat([chipRim[0]]), level - 4.2, "#739bb4", .65);
  const top = level - 4.3;
  path(context, onPlane([[-6, -5], [0, -5], [0, 5], [-6, 5]], top), "#b8eeeb");
  path(context, onPlane([[2, -5], [6, -5], [6, 1], [2, 1]], top), "#8fccea");
  contact(context, 5, 4.1, top, 1, "#d3ecfa");
}

function callout(context, level, name, color) {
  const [x, y] = project(42, -25, level);
  path(context, [[x, y], [x + 12, y], [x + 31, y - 11], [294, y - 11]], null, color, .9);
  context.beginPath();
  context.arc(x, y, 2, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.fillStyle = color;
  context.font = '600 12px "IBM Plex Mono", Consolas, monospace';
  context.textBaseline = "middle";
  let left = 303;
  for (const letter of name) {
    context.fillText(letter, left, y - 10);
    left += context.measureText(letter).width + 1.3;
  }
}

export function drawDiagram(canvas) {
  const ratio = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.aspectRatio = width + " / " + height;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "An exploded stack of circuit boards labeled Intent, Context and Flow.");
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.lineJoin = "round";
  context.lineCap = "round";

  const levels = { intent: 67, context: 125, flow: 182, floor: 211 };
  const floor = outline(boardRadius, 4);
  context.setLineDash([2.2, 4.2]);
  trace(context, floor.concat([floor[0]]), levels.floor, "rgba(132, 198, 215, .43)", .8);
  for (const corner of [[-39, -39], [39, -39], [39, 39], [-39, 39]]) {
    const upper = project(corner[0], corner[1], levels.intent - 9);
    const lower = project(corner[0], corner[1], levels.floor);
    path(context, [upper, lower], null, "rgba(154, 213, 220, .6)", .8);
  }
  context.setLineDash([]);
  flowBoard(context, levels.flow);
  contextBoard(context, levels.context);
  intentBoard(context, levels.intent);
  callout(context, levels.intent, "INTENT", "#d3edf9");
  callout(context, levels.context, "CONTEXT", "#a1d3f0");
  callout(context, levels.flow, "FLOW", "#87e0d2");
}
