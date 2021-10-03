const viewer = document.getElementById("viewer");
const width = viewer.clientWidth;
const height = viewer.clientHeight;

const stage = new Konva.Stage({
  container: "viewer",
  width: width,
  height: height,
});

const layer = new Konva.Layer();

let cntWidth = 2048;
let cntHeight = 2048;
const rowCount = 8;
const colCount = 8;
// zoom event
let zoomLevel = 1;
// center
let centerX = width / 2;
let centerY = height / 2;

let tiles = [];

function getTileSize(cntWidth, cntHeight, zoom) {
  const rows = rowCount * Math.pow(2, zoomLevel - 1);
  const cols = colCount * Math.pow(2, zoomLevel - 1);
  const tileHeight = cntHeight / rows;
  const tileWidth = cntWidth / cols;
  return { tileHeight, tileWidth, cols, rows };
}

function canRenderTile(bounds, x, y) {
  if (bounds.left > x) return false;
  if (bounds.right < x) return false;
  if (bounds.top > y) return false;
  if (bounds.bottom < y) return false;
  const hasTile = tiles.find(
    (tile) => tile.x === x && tile.y === y && tile.z === zoomLevel
  );
  return !hasTile && validTile(x, y, zoomLevel);
}

function drawTiles(bounds, group, tileWidth, tileHeight, cols, rows) {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (!canRenderTile(bounds, i, j)) {
        continue;
      }
      const x = i * tileWidth;
      const y = j * tileHeight;
      // const tile = new Konva.Rect({
      //   x,
      //   y,
      //   width: tileWidth,
      //   height: tileHeight,
      //   stroke: "#999",
      // });
      Konva.Image.fromURL(getTileUrl(i, j, zoomLevel), function (tile) {
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
          x: i,
          y: j,
          z: zoomLevel,
          tile,
        });
      });
    }
  }
}

function drawGrids(group) {
  tiles = tiles.filter((t) => t.z === zoomLevel);
  const { tileHeight, tileWidth, cols, rows } = getTileSize(
    cntWidth,
    cntHeight,
    zoomLevel
  );
  const bounds = getAllowedBounds(width / 2, height / 2, zoomLevel, group);
  drawTiles(bounds, group, tileWidth, tileHeight, cols, rows);

  // write cell positions
  // for (let i = 0; i < cols; i++) {
  //   for (let j = 0; j < rows; j++) {
  //     if (!canShowTile(bounds, i, j)) {
  //       continue;
  //     }
  //     const x = (i + 0.3) * tileWidth;
  //     const y = (j + 0.45) * tileHeight;
  //     const text = new Konva.Text({
  //       x,
  //       y,
  //       text: `x:${i}, y:${j}, z:${zoomLevel}`,
  //       fontSize: 22,
  //       fill: "black",
  //     });
  //     group.add(text);
  //   }
  // }
}

function getAllowedBounds(viewX, viewY, z, group) {
  const { tileHeight, tileWidth, rows, cols } = getTileSize(
    cntWidth,
    cntHeight,
    z
  );
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
    right: Math.min(right, cols),
    bottom: Math.min(bottom, rows),
  };
}

function renderGroup() {
  let group = new Konva.Group({
    x: 0,
    y: 0,
    width: cntWidth,
    height: cntHeight,
    draggable: true,
  });

  let lastX = 0;
  let lastY = 0;
  group.on("dragmove", function () {
    if (group.attrs.x >= 0) {
      group.x(lastX);
    }
    if (cntWidth - width + group.attrs.x <= 0) {
      group.x(lastX);
    }
    lastX = group.attrs.x;

    if (group.attrs.y >= 0) {
      group.y(lastY);
    }
    if (cntHeight - height + group.attrs.y <= 0) {
      group.y(lastY);
    }
    lastY = group.attrs.y;
    centerY = -1 * group.attrs.y + height * 0.5;
    centerX = -1 * group.attrs.x + width * 0.5;

    const { tileHeight, tileWidth, rows, cols } = getTileSize(
      cntWidth,
      cntHeight,
      zoomLevel
    );
    const bounds = getAllowedBounds(width / 2, height / 2, zoomLevel, group);
    tiles = tiles.filter((record) => {
      if (
        record.x < bounds.left ||
        record.x > bounds.right ||
        record.y < bounds.top ||
        record.y > bounds.bottom
      ) {
        record.tile.destroy();
        return false;
      }
      return true;
    });
    drawTiles(bounds, group, tileWidth, tileHeight, cols, rows);
    // console.log(tiles);
  });

  const box = new Konva.Rect({
    x: 0,
    y: 0,
    width: cntWidth,
    height: cntHeight,
    fill: "#EEE",
  });
  group.add(box);
  drawGrids(group);
  return group;
}

let group = renderGroup();
layer.add(group);

stage.on("wheel", function (event) {
  const delta = event.evt.deltaY;
  if (delta > 0) {
    // zoom out
    if (zoomLevel === 1) return;
    zoomLevel -= 1;
    group.destroy();
    cntWidth /= 2;
    cntHeight /= 2;
    group = renderGroup();
    layer.add(group);
  } else {
    // zoom in
    if (zoomLevel === 5) return;
    zoomLevel += 1;
    group.destroy();
    cntWidth *= 2;
    cntHeight *= 2;
    group = renderGroup();
    layer.add(group);
  }
});
stage.add(layer);
