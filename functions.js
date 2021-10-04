// calculates tile sizes based on zoom level and content width/height
function getTileSize() {
  const rows = rowCount * Math.pow(2, zoomLevel - 1);
  const cols = colCount * Math.pow(2, zoomLevel - 1);
  const tileHeight = cntHeight / rows;
  const tileWidth = cntWidth / cols;
  return { tileHeight, tileWidth, cols, rows };
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
  return !hasTile && validTile(x, y, z, fileId);
}
// draws tiles on on the given group object
function drawTiles(filesId, bounds, group) {
  const { tileWidth, tileHeight, cols, rows } = getTileSize();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (!canRenderTile(i, j, zoomLevel, filesId, bounds)) {
        continue;
      }
      const x = i * tileWidth;
      const y = j * tileHeight;
      Konva.Image.fromURL(
        getTileUrl(i, j, zoomLevel, filesId),
        function (tile) {
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
        }
      );
    }
  }
}
// returns allowed tile bounds based on view position and group
function getAllowedBounds(viewX, viewY, group) {
  const { tileHeight, tileWidth, rows, cols } = getTileSize();
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
