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
