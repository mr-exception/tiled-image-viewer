let drawingMarkups = false;
let isDrawing = false;
let drawingType;
let drawingMarkup;
let points = [];

function drawCircle() {
  drawingMarkups = true;
  drawingType = "circle";
  filesGroup.draggable(false);
}
function drawLine() {
  drawingMarkups = true;
  drawingType = "line";
  filesGroup.draggable(false);
}
function drawMultiLine() {
  drawingMarkups = true;
  drawingType = "multiline";
  filesGroup.draggable(false);
}

function convertPointObjToPointList(points) {
  const linePoints = [];
  points.forEach((p) => {
    linePoints.push(p.x);
    linePoints.push(p.y);
  });
  return linePoints;
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

filesGroup.on("click", function ({ evt }) {
  if (!drawingMarkups) return;
  if (drawingType !== "multiline") return;
  isDrawing = true;
  const pointer = getPointerPosition();
  points.push(pointer);
  if (points.length > 1) {
    if (distance(points[0], pointer) < 10) {
      // close the markup
      const finalPoints = points.slice(0, points.length - 2);
      finalPoints.push(points[0]);
      drawingMarkup.points(convertPointObjToPointList(finalPoints));

      drawingMarkups = false;
      isDrawing = false;
      points = [];
      drawingMarkup = null;
      filesGroup.draggable(true);
    }
  }
});

filesGroup.on("mousedown", function ({ evt }) {
  if (!drawingMarkups) return;
  if (drawingType === "multiline") return;
  isDrawing = true;
  const pointer = getPointerPosition();
  points = [pointer];
});
filesGroup.on("mousemove", function ({ evt }) {
  if (!drawingMarkups) return;
  if (!isDrawing) return;
  if (points.length > 1) points = points.slice(0, points.length - 1);
  const pointer = getPointerPosition();
  points.push(pointer);

  if (drawingType === "circle") {
    const radius = distance(points[0], points[1]);
    if (!drawingMarkup) {
      drawingMarkup = new Konva.Circle({
        x: points[0].x,
        y: points[0].y,
        radius,
        stroke: "black",
        strokeWidth: 2,
      });
      filesGroup.add(drawingMarkup);
    } else {
      drawingMarkup.radius(radius);
    }
  }
  if (drawingType === "line") {
    const linePoints = [];
    points.forEach((p) => {
      linePoints.push(p.x);
      linePoints.push(p.y);
    });
    if (!drawingMarkup) {
      drawingMarkup = new Konva.Line({
        points: linePoints,
        stroke: "black",
        strokeWidth: 2,
      });
      filesGroup.add(drawingMarkup);
    } else {
      drawingMarkup.points(linePoints);
    }
  }
  if (drawingType === "multiline") {
    const linePoints = [];
    points.forEach((p) => {
      linePoints.push(p.x);
      linePoints.push(p.y);
    });
    if (!drawingMarkup) {
      drawingMarkup = new Konva.Line({
        points: linePoints,
        stroke: "black",
        strokeWidth: 2,
      });
      filesGroup.add(drawingMarkup);
    } else {
      drawingMarkup.points(linePoints);
    }
  }
});
filesGroup.on("mouseup", function ({ evt }) {
  if (!drawingMarkups) return;
  if (!isDrawing) return;
  if (drawingType === "multiline") return;
  drawingMarkups = false;
  isDrawing = false;
  points = [];
  drawingMarkup = null;
  filesGroup.draggable(true);
});
