const stage = new Konva.Stage({
  container: "viewer",
  width: width,
  height: height,
});

const layer = new Konva.Layer();
// zoom event
let zoomLevel = 1;
// center
let centerX = width / 2;
let centerY = height / 2;
let tiles = [];

function renderFile(fileId) {}

function drawTiles(fileId, group) {
  const { cols, rows, tileHeight, tileWidth } = getTileSize();
  const bounds = getAllowedBounds(width / 2, height / 2, group);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (!canRenderTile(i, j, zoomLevel, "1", bounds)) {
        continue;
      }
      const x = i * tileWidth;
      const y = j * tileHeight;
      Konva.Image.fromURL(getTileUrl(i, j, zoomLevel, "1"), function (tile) {
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

    const { tileHeight, tileWidth, rows, cols } = getTileSize();
    const bounds = getAllowedBounds(width / 2, height / 2, group);
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
    drawTiles("1", group);
  });

  const box = new Konva.Rect({
    x: 0,
    y: 0,
    width: cntWidth,
    height: cntHeight,
    fill: "#EEE",
  });
  group.add(box);
  drawTiles("1", group);
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
    centerX /= 2;
    centerY /= 2;
  } else {
    // zoom in
    if (zoomLevel === 5) return;
    zoomLevel += 1;
    group.destroy();
    cntWidth *= 2;
    cntHeight *= 2;
    group = renderGroup();
    layer.add(group);
    centerX *= 2;
    centerY *= 2;
  }
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
