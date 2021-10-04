const files = [
  {
    id: "1",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d2ffc6-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
  },
];

function getFile(id) {
  return files.find((file) => file.id === id);
}

function getTileUrl(x, y, z, fileId) {
  const url = getFile(fileId).url;
  const tileUrl = url.replace("{z}", z).replace("{x}", x).replace("{y}", y);
  const completeTileUrl = `https://sp-projects-files-v1-dev.s3-ap-southeast-2.amazonaws.com/${md5(
    tileUrl
  )}/${tileUrl}`;
  return completeTileUrl;
}

// function getTileUrl(x, y, z) {
//   return "./sample.jpg";
// }

function getTilesDims(z) {
  const zoomProps = [
    { unitPerPixel: 256, order: 1 },
    { unitPerPixel: 128, order: 2 },
    { unitPerPixel: 64, order: 3 },
    { unitPerPixel: 32, order: 4 },
    { unitPerPixel: 16, order: 5 },
    { unitPerPixel: 8, order: 6 },
    { unitPerPixel: 4, order: 7 },
    { unitPerPixel: 2, order: 8 },
    { unitPerPixel: 1, order: 9 },
  ];
  const fileBounds = {
    maxX: 76160,
    maxY: 0,
    minX: 0,
    minY: -107776,
  };
  const zoomProp = zoomProps.find((value) => value.order === z);
  const maxX = Math.abs(fileBounds.maxX - fileBounds.minX);
  const maxY = Math.abs(fileBounds.maxY - fileBounds.minY);
  const unitPerPixel = zoomProp.unitPerPixel;
  const cols = Math.ceil(maxX / 256 / unitPerPixel);
  const rows = Math.ceil(maxY / 256 / unitPerPixel);
  return {
    cols,
    rows,
  };
}
function validTile(x, y, z, fileId) {
  const { cols, rows } = getTilesDims(z);
  return x >= 0 && y >= 0 && x < cols && y < rows;
}
