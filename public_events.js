const files = [
  {
    id: "1",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/086f1ee6-20c6-11ec-b417-7697f26683c0/{z}/{x}/{y}.png",
    offset: { top: 512 * 0, left: 512 * 0 },
  },
  {
    id: "2",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/086f2f5f-20c6-11ec-b417-7697f26683c0/{z}/{x}/{y}.png",
    offset: { top: 512 * 0, left: 512 * 1 },
  },
  {
    id: "3",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/086f3351-20c6-11ec-b417-7697f26683c0/{z}/{x}/{y}.png",
    offset: { top: 512 * 0, left: 512 * 2 },
  },
  {
    id: "4",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/086f36bf-20c6-11ec-b417-7697f26683c0/{z}/{x}/{y}.png",
    offset: { top: 512 * 0, left: 512 * 3 },
  },
  {
    id: "5",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/086f3a1b-20c6-11ec-b417-7697f26683c0/{z}/{x}/{y}.png",
    offset: { top: 512 * 1, left: 512 * 0 },
  },
  {
    id: "6",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d2e4c6-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 1, left: 512 * 1 },
  },
  {
    id: "7",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d2f1a3-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 1, left: 512 * 2 },
  },
  {
    id: "8",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d2f534-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 1, left: 512 * 3 },
  },
  {
    id: "9",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d2f8a4-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 2, left: 512 * 0 },
  },
  {
    id: "10",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d2fcb9-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 2, left: 512 * 1 },
  },
  {
    id: "11",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d2ffc6-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 2, left: 512 * 2 },
  },
  {
    id: "12",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d30334-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 2, left: 512 * 3 },
  },
  {
    id: "13",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d30640-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 3, left: 512 * 0 },
  },
  {
    id: "14",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d309b3-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 3, left: 512 * 1 },
  },
  {
    id: "15",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/55d30e93-20c9-11ec-8a41-caec97f9405a/{z}/{x}/{y}.png",
    offset: { top: 512 * 3, left: 512 * 2 },
  },
  {
    id: "16",
    url: "940f31de-de3e-4fa9-84e9-e442d2c1c8f3/8e81ec74-20c9-11ec-aba6-1eaea95ccd12/{z}/{x}/{y}.png",
    offset: { top: 512 * 3, left: 512 * 3 },
  },
];

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
