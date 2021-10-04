// calculates tile sizes based on zoom level and content width/height
function calculateTiles() {
  rowsForZoom = rowCount * Math.pow(2, zoomLevel - 1);
  colsForZoom = colCount * Math.pow(2, zoomLevel - 1);
  tileHeight = cntHeight / rowsForZoom;
  tileWidth = cntWidth / colsForZoom;
}
// returns a boolean which tells that a tile with given coordinates can be rendered or not
function canRenderTile(x, y, z, fileId, bounds) {
  if (bounds.left > x) return false;
  if (bounds.right < x) return false;
  if (bounds.top > y) return false;
  if (bounds.bottom < y) return false;
  const hasTile = tiles.find(
    (tile) => tile.x === x && tile.y === y && tile.z === z
  );
  if (hasTile) return false;

  if (x < 0) return false;
  if (y < 0) return false;

  const { cols, rows } = getTilesDims(fileId, z);
  if (x >= cols) return false;
  if (y >= rows) return false;
  return true;
}
// returns allowed tile bounds based on view position and group
function getAllowedBounds(viewX, viewY, group) {
  const x = viewX - group.attrs.x;
  const y = viewY - group.attrs.y;

  const xFrom = x - width;
  const xTo = x + width;

  const yFrom = y - width;
  const yTo = y + width;

  const left = Math.ceil((xFrom + 1) / tileWidth) - 1;
  const top = Math.ceil((yFrom + 1) / tileHeight) - 1;
  const right = Math.ceil((xTo + 1) / tileWidth) - 1;
  const bottom = Math.ceil((yTo + 1) / tileHeight) - 1;

  return {
    left: Math.max(left, 0),
    top: Math.max(top, 0),
    right: Math.min(right, colsForZoom),
    bottom: Math.min(bottom, rowsForZoom),
  };
}
// get offsets by file id
function getPosition(fileId) {
  return filePostions.find((record) => record.id === fileId);
}
function updateFilePositions() {
  filePostions = filePostions.map((pos) => {
    pos.x = pos.realX * Math.pow(2, zoomLevel - 1);
    pos.y = pos.realY * Math.pow(2, zoomLevel - 1);
    return pos;
  });
}
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
let tiles = [];

function drawTiles(fileId, group) {
  const bounds = getAllowedBounds(width / 2, height / 2, group);
  for (let i = 0; i < colsForZoom; i++) {
    for (let j = 0; j < rowsForZoom; j++) {
      if (!canRenderTile(i, j, zoomLevel, fileId, bounds)) {
        continue;
      }
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
        // tiles.push({
        //   x,
        //   y,
        //   z: zoomLevel,
        //   id: fileId,
        //   tile,
        // });
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
    draggable: true,
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

    centerY = -1 * group.attrs.y + height * 0.5;
    centerX = -1 * group.attrs.x + width * 0.5;

    // const bounds = getAllowedBounds(width / 2, height / 2, group);
    // tiles = tiles.filter((record) => {
    //   if (
    //     record.x < bounds.left ||
    //     record.x > bounds.right ||
    //     record.y < bounds.top ||
    //     record.y > bounds.bottom
    //   ) {
    //     record.tile.destroy();
    //     return false;
    //   }
    //   return true;
    // });
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
  filesGroup.add(box);
  files.forEach((record) => {
    let group = renderGroup(record);
    filesGroup.add(group);
    fileLayers.push({
      ...record,
      group,
    });
  });
}
renderFileLayers();
