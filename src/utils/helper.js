/* eslint-disable @typescript-eslint/no-var-requires */
const { default: axios } = require("axios");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return dayjs(date).format("DD/MM/YYYY");
};

const numberWithCommas = (number) => {
  if (!number) {
    return 0;
  }

  return number
    .toFixed(0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const getAllIndexes = (arr, val) => {
  let indexes = [],
    i = -1;
  while ((i = arr.indexOf(val, i + 1)) != -1) {
    indexes.push(i);
  }
  return indexes;
};

const getFinalUrl = async (link) => {
  try {
    return await axios({
      method: "get",
      url: link,
      maxRedirects: 0,
    });
  } catch (e) {
    if (Math.trunc(e.response.status / 100) === 3) {
      return getFinalUrl(e.response.headers.location);
    } else {
      throw e;
    }
  }
};

module.exports = { formatDate, numberWithCommas, getAllIndexes, getFinalUrl };
