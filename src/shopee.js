const { default: axios } = require("axios");
const { formatDate, numberWithCommas } = require("./utils/helper");
const { generateChart } = require("./chart");
const dayjs = require("dayjs");
const crypto = require("crypto");

const getHistoryPrices = async (bot, chatId, message) => {
  const url = new URL(message);
  const pathname = url.pathname;

  let list = [];
  if (pathname.includes("product")) {
    list = pathname.split("/");
  } else {
    list = pathname.split(".");
  }

  if (!list?.length) {
    return;
  }

  const itemid = list[list.length - 1];
  const shopid = list[list.length - 2];

  const product = await axios
    .get("https://apiv3.beecost.vn/product/detail", {
      params: {
        product_base_id: `1__${itemid}__${shopid}`,
      },
      headers: {
        Host: "apiv3.beecost.vn",
        Origin: "https://beecost.vn",
        Pragma: "no-cache",
        Referer: "https://beecost.vn/",
        "sec-ch-ua": `"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"`,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Linux",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
    })
    .then((response) => {
      const { data } = response.data;
      return {
        name: data?.product_base?.name,
        price: data?.product_base?.price,
      };
    })
    .catch((error) => {
      console.error(error);
    });

  await axios
    .get("https://apiv3.beecost.vn/product/history_price", {
      params: {
        product_base_id: `1__${itemid}__${shopid}`,
        price_current: product?.price || 0,
      },
      headers: {
        Host: "apiv3.beecost.vn",
        Origin: "https://beecost.vn",
        Pragma: "no-cache",
        Referer: "https://beecost.vn/",
        "sec-ch-ua": `"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"`,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Linux",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
    })
    .then(async function (response) {
      const { data } = response.data;
      const prices = data?.product_history_data?.item_history?.price || [];
      const prices_ts =
        data?.product_history_data?.item_history?.price_ts || [];

      const avgPrice =
        data?.product_history_data?.price_classification?.avg_price;

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const indexMinPrice = prices.indexOf(minPrice);
      const indexMaxPrice = prices.indexOf(maxPrice);

      const minPriceTs = prices_ts[indexMinPrice];
      const maxPriceTs = prices_ts[indexMaxPrice];

      const chart = generateChart(
        prices_ts,
        prices,
        indexMinPrice,
        indexMaxPrice
      );

      if (typeof maxPrice === "undefined") {
        return bot.sendMessage(chatId, "Chưa có thông tin sản phẩm", {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          disable_notification: true,
          reply_to_message_id: null,
        });
      }

      // const affiliateLink = await generateLink(message);
      const affiliateLink = "";

      const messageContent = `
          🔔 ${product?.name || "Chi tiết giá:"}
          ✦ Giá hiện tại: ${numberWithCommas(product.price)}đ.
          ✦ Giá cao nhất: ${numberWithCommas(maxPrice)}đ. ${
        maxPriceTs ? `Vào lúc ${formatDate(maxPriceTs)}` : ""
      }
          ✦ Giá thấp nhất: ${numberWithCommas(minPrice)}đ. ${
        minPriceTs ? `Vào lúc ${formatDate(minPriceTs)}` : ""
      }
          ✦ Giá trung bình: ${numberWithCommas(avgPrice)}đ.
          ${
            affiliateLink
              ? `👉 <a href="${affiliateLink}">Quay lại Shopee</a>`
              : ""
          }`;

      bot.sendMessage(chatId, messageContent, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        disable_notification: true,
        reply_to_message_id: null,
      });
      bot.sendPhoto(chatId, chart);
    })
    .catch(function (error) {
      console.log(error);
    });

  // const data = `tp=history&history_action=list_chart&filter%5Bdays%5D=90&filter%5Bdomain%5D=shopee&filter%5Bsp_id%5D=${shopid}.${itemid}&filter%5Btitle%5D=&filter%5Bprice%5D=&filter%5Boriginal_price%5D=`;

  // axios
  //   .post("https://api.lichsugia.com/shopee/vn/price_history/", data, {
  //     headers: {
  //       Accept: "application/json, text/javascript, */*; q=0.01",
  //       "Accept-Language": "en-US,en;q=0.9",
  //       "Cache-Control": "no-cache",
  //       Connection: "keep-alive",
  //       "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  //       Origin: "https://lichsugia.com",
  //       Pragma: "no-cache",
  //       Referer: "https://lichsugia.com/",
  //       "Sec-Fetch-Dest": "empty",
  //       "Sec-Fetch-Mode": "cors",
  //       "Sec-Fetch-Site": "same-site",
  //       "sec-ch-ua":
  //         '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
  //       "sec-ch-ua-mobile": "?0",
  //     },
  //   })
  //   .then((response) => {
  //     const data = response.data;

  //     console.log(data.data.data.labels.slice(0, 44));

  //     const minPrice = data?.statis?.min || 0;
  //     const maxPrice = data?.statis?.max || 0;
  //     const minPriceTs = data?.statis?.min_time || 0;
  //     const maxPriceTs = data?.statis?.max_time || 0;

  //     const messageContent = `
  //             Chi tiết giá:
  //             ✦ Giá cao nhất: ${numberWithCommas(maxPrice)}đ. ${
  //       maxPriceTs ? `Vào lúc ${formatDate(maxPriceTs * 1000)}` : ""
  //     }
  //             ✦ Giá thấp nhất: ${numberWithCommas(minPrice)}đ. ${
  //       minPriceTs ? `Vào lúc ${formatDate(minPriceTs * 1000)}` : ""
  //     }
  //             👉 <a href="#">Quay lại Shopee</a>`;

  //     bot.sendMessage(chatId, messageContent, {
  //       parse_mode: "HTML",
  //       disable_web_page_preview: true,
  //       disable_notification: false,
  //       reply_to_message_id: null,
  //     });
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
};

const generateLink = async (url) => {
  const data = {
    query: `mutation {\n  generateShortLink(input: {originUrl: "${url}", subIds: ["s1"]}) {\n    shortLink\n  }\n}\n`,
    variables: null,
  };

  const current = dayjs(new Date()).unix();

  const payload = `${17350510006}${current}${JSON.stringify(
    data
  )}JW653BXPDZ3R7KVNV4LP4WZNSX6ZJGVC`;

  const signature = crypto.createHash("sha256").update(payload).digest("hex");

  const response = await axios
    .post("https://open-api.affiliate.shopee.vn/graphql", data, {
      headers: {
        Authorization: `SHA256 Credential=17350510006, Timestamp=${current}, Signature=${signature}`,
      },
    })
    .then((response) => response?.data)
    .catch((error) => {
      console.log(error);
    });

  return response?.data?.generateShortLink?.shortLink;
};

module.exports = {
  generateLink,
  getHistoryPrices,
};
