// calculates tile sizes based on zoom level and content width/height
function calculateTiles() {
  rowsForZoom = rowCount * Math.pow(2, zoomLevel - 1);
  colsForZoom = colCount * Math.pow(2, zoomLevel - 1);
  tileHeight = cntHeight / rowsForZoom;
  tileWidth = cntWidth / colsForZoom;
}
/**
 * check if the tile exists in cached tiles list
 * @param {number} col
 * @param {number} row
 * @param {number} z
 * @returns boolean
 */
function hasTile(id, col, row, z) {
  return !!tiles.find(
    (tile) =>
      tile.id === id && tile.col === col && tile.row === row && tile.z === z
  );
}
/**
 * checks if can render the tile based on view port bound
 * @param {number} col
 * @param {number} row
 * @param {number} z
 * @param {string} fileId
 * @returns boolean
 */
function canRenderTile(col, row, z, fileId) {
  const filePosition = getPosition(fileId);
  const x = filePosition.x + tileWidth * col;
  const y = filePosition.y + tileWidth * row;
  if (leftBound > x) return false;
  if (topBound > y) return false;

  if (rightBound < x) return false;
  if (bottomBount < y) return false;

  if (x < 0) return false;
  if (y < 0) return false;

  const { cols, rows } = getTilesDims(fileId, z);
  if (col >= cols) return false;
  if (row >= rows) return false;
  return true;
}
function unsetAllDraggables(excenptions = []) {
  fileLayers = fileLayers.map((fileLayer) => {
    if (excenptions.includes(fileLayer.id)) return fileLayer;
    if (!fileLayer.draggable) return fileLayer;
    fileLayer.draggable = false;
    fileLayer.group.setAttrs({
      draggable: false,
    });
    fileLayer.dragBorder.destroy();
    fileLayer.dragBorder = null;
    return fileLayer;
  });
}
function toggleDraggable(fileId) {
  unsetAllDraggables([fileId]);

  const fileLayer = fileLayers.find((record) => record.id === fileId);
  fileLayer.draggable = !fileLayer.draggable;
  if (fileLayer.draggable) {
    const dragBorder = new Konva.Rect({
      x: 0,
      y: 0,
      width: fileLayer.group.attrs.width,
      height: fileLayer.group.attrs.height,
      stroke: "blue",
      strokeWidth: 3,
    });
    fileLayer.group.add(dragBorder);
    fileLayer.dragBorder = dragBorder;
  } else {
    fileLayer.dragBorder.destroy();
    fileLayer.dragBorder = null;
  }
  fileLayer.group.setAttrs({
    draggable: fileLayer.draggable,
  });
}

function getAllowedBounds() {
  const x = centerX - filesGroup.attrs.x;
  const y = centerY - filesGroup.attrs.y;

  const result = {
    from: {},
    to: {},
  };
  result.from.x = x - width;
  result.to.x = x + width;

  result.from.y = y - width;
  result.to.y = y + width;

  return result;
}
/**
 * returns current file position object by id
 * @param {string} fileId
 * @returns [x, y, realX, realY, id]
 */
function getPosition(fileId) {
  return filePostions.find((record) => record.id === fileId);
}
/**
 * updates all file positions with new zoom level. this function must be called after each zoom change
 */
function updateFilePositions() {
  filePostions = filePostions.map((pos) => {
    pos.x = pos.realX * Math.pow(2, zoomLevel - 1);
    pos.y = pos.realY * Math.pow(2, zoomLevel - 1);
    return pos;
  });
}
/**
 * updates a file position by file id
 * @param {string} fileId
 * @param {number} x
 * @param {number} y
 * @returns void
 */
function setFilePosition(fileId, x, y) {
  filePostions = filePostions.map((pos) => {
    if (pos.id !== fileId) return pos;
    pos.x = x;
    pos.y = y;
    pos.realX = x / Math.pow(2, zoomLevel - 1);
    pos.realY = y / Math.pow(2, zoomLevel - 1);
    return pos;
  });
}

const stage = new Konva.Stage({
  container: "viewer",
  width: width,
  height: height,
});

const layer = new Konva.Layer();

calculateTiles();

// center
let centerX = width / 2;
let centerY = height / 2;

// view bounds (nothing must be rendred out of this bound)
const viewVerticalDistance = width;
const viewHorizontalDistance = height;

let leftBound = centerX - viewVerticalDistance;
let rightBound = centerX + viewVerticalDistance;
let topBound = centerY - viewHorizontalDistance;
let bottomBount = centerY + viewHorizontalDistance;

// tiles cache
let tiles = [];

function drawTiles(fileId, group) {
  const bounds = getAllowedBounds(group);
  for (let i = 0; i < colsForZoom; i++) {
    for (let j = 0; j < rowsForZoom; j++) {
      if (!canRenderTile(i, j, zoomLevel, fileId, bounds)) {
        continue;
      }
      if (hasTile(fileId, i, j, zoomLevel)) continue;
      const x = i * tileWidth;
      const y = j * tileHeight;
      Konva.Image.fromURL(getTileUrl(i, j, zoomLevel, fileId), function (tile) {
        tile.setAttrs({
          x,
          y,
          width: tileWidth,
          height: tileHeight,
          stroke: "#999",
          strokeWidth: 2,
        });
        group.add(tile);
        tiles.push({
          col: i,
          row: j,
          x,
          y,
          z: zoomLevel,
          id: fileId,
          tile,
        });
        console.log("render");
      });
    }
  }
}
function renderGroup(file) {
  const dims = getTilesDims(file.id, zoomLevel);
  const { x, y } = getPosition(file.id);
  let group = new Konva.Group({
    x,
    y,
    width: dims.cols * tileWidth,
    height: dims.rows * tileHeight,
    draggable: false,
  });

  const dragBorder = 0;
  group.on("dragmove", function () {
    setFilePosition(file.id, group.attrs.x, group.attrs.y);
    if (group.attrs.x <= dragBorder) {
      setFilePosition(file.id, dragBorder, group.attrs.y);
      group.x(dragBorder);
    }
    if (group.attrs.x + group.attrs.width >= cntWidth - dragBorder) {
      setFilePosition(
        file.id,
        cntWidth - dragBorder - group.attrs.width,
        group.attrs.y
      );
      group.x(cntWidth - dragBorder - group.attrs.width);
    }

    if (group.attrs.y <= dragBorder) {
      setFilePosition(file.id, group.attrs.x, dragBorder);
      group.y(dragBorder);
    }
    if (group.attrs.y + group.attrs.height >= cntHeight - dragBorder) {
      setFilePosition(
        file.id,
        cntHeight - dragBorder - group.attrs.height,
        dragBorder
      );
      group.y(cntHeight - dragBorder - group.attrs.height);
    }

    if (group.attrs.x < 0) {
      lastX = 0;
    } else if (group.attrs.x > cntWidth - dragBorder) {
      lastX = cntWidth - dragBorder;
    } else {
      lastX = group.attrs.x;
    }
    if (group.attrs.y < 0) {
      lastY = 0;
    } else if (group.attrs.y > cntHeight - dragBorder) {
      lastY = cntHeight - dragBorder;
    } else {
      lastY = group.attrs.y;
    }
    drawTiles(file.id, group);
  });

  // const box = new Konva.Rect({
  //   x: 0,
  //   y: 0,
  //   width: cntWidth,
  //   height: cntHeight,
  //   fill: "#EEE",
  // });
  // group.add(box);
  drawTiles(file.id, group);
  return group;
}
stage.on("wheel", function (event) {
  const delta = event.evt.deltaY;
  if (delta > 0) {
    // zoom out
    if (zoomLevel === 1) return;
    zoomLevel -= 1;
    cntWidth /= 2;
    cntHeight /= 2;
    centerX /= 2;
    centerY /= 2;
  } else {
    // zoom in
    if (zoomLevel === 5) return;
    zoomLevel += 1;
    cntWidth *= 2;
    cntHeight *= 2;
    centerX *= 2;
    centerY *= 2;
  }
  calculateTiles();
  updateFilePositions();
  destroyFileLayers();
  renderFileLayers();
  // group.move({
  //   x: group.attrs.x - cntWidth / 4,
  //   y: group.attrs.y - cntHeight / 4,
  // });
});

// let lastX = 0;
// let lastY = 0;
// group.on("mousemove", function ({ evt }) {
//   lastX = (evt.x + group.attrs.x) * -1;
//   lastY = (evt.y + group.attrs.y) * -1;
// });
stage.add(layer);

// render all file layers
let fileLayers = [];

let filesGroup = new Konva.Group({
  x: 0,
  y: 0,
  width: cntWidth,
  height: cntHeight,
  draggable: true,
});
let box = new Konva.Rect({
  x: 0,
  y: 0,
  width: cntWidth,
  height: cntHeight,
  fill: "#EEE",
  stroke: "#999",
  strokeWidth: 2,
});
filesGroup.add(box);
// file group is user view. when files group is draged means the view ports is changed
// we have to check for new view bounds to render new tiles and destroy old unshown tiles
filesGroup.on("dragmove", function () {
  // updating center position on file group
  centerY = -1 * filesGroup.attrs.y + height * 0.5;
  centerX = -1 * filesGroup.attrs.x + width * 0.5;
  // updating render bounds by view port center

  leftBound = centerX - viewVerticalDistance;
  rightBound = centerX + viewVerticalDistance;
  topBound = centerY - viewHorizontalDistance;
  bottomBount = centerY + viewHorizontalDistance;

  tiles = tiles.filter((record) => {
    if (!canRenderTile(record.col, record.row, record.z, record.id)) {
      record.tile.destroy();
      console.log("destroy");
      return false;
    }
    return record;
  });
  fileLayers.forEach((file) => {
    drawTiles(file.id, file.group);
  });
});

layer.add(filesGroup);

let filePostions = files.map((file) => ({
  id: file.id,
  realX: file.offset.left,
  realY: file.offset.top,
  x: file.offset.left * Math.pow(2, zoomLevel - 1),
  y: file.offset.top * Math.pow(2, zoomLevel - 1),
}));

function destroyFileLayers() {
  fileLayers.forEach((record) => {
    record.group.destroy();
  });
  fileLayers = [];
  tiles.forEach((tile) => {
    tile.tile.destroy();
  });
  tiles = [];
}
function renderFileLayers() {
  box.destroy();
  box = new Konva.Rect({
    x: 0,
    y: 0,
    width: cntWidth,
    height: cntHeight,
    fill: "#EEE",
    stroke: "#999",
    strokeWidth: 2,
  });
  box.on("click", function () {
    unsetAllDraggables();
  });
  filesGroup.add(box);
  files.forEach((record) => {
    let group = renderGroup(record);
    group.on("click", function () {
      toggleDraggable(record.id);
    });
    filesGroup.add(group);
    fileLayers.push({
      ...record,
      draggable: false,
      dragBorder: null,
      group,
    });
  });
}
renderFileLayers();
