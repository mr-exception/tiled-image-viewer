const markups = [
  {
    id: "m1",
    type: "text",
    text: "some text markups",
    offset: {
      left: 100,
      top: 80,
      fontSize: 30,
    },
  },
  {
    id: "m2",
    type: "text",
    text: "this is important",
    offset: {
      left: 150,
      top: 200,
      fontSize: 10,
    },
  },
  {
    id: "m3",
    type: "text",
    text: "oops! this tile is blank",
    offset: {
      left: 250,
      top: 210,
      fontSize: 10,
    },
  },
  {
    id: "l1",
    type: "line",
    points: [100, 100, 200, 250],
    color: "red",
  },
  {
    id: "l2",
    type: "line",
    points: [400, 100, 400, 200, 600, 200, 600, 100, 400, 100],
    color: "blue",
  },
  {
    id: "l2",
    type: "line",
    points: [652, 601, 712, 698, 325, 461, 600, 609, 651, 601],
    color: "green",
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

// function getTileUrl(x, y, z, fileId) {
//   return "./sample.jpg";
// }

function getTilesDims(fileId, z) {
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
