const ChartJSImage = require('chart.js-image');
const { formatDate } = require('./utils/helper');

const generateChart = (timePrices, prices, indexMinPrice, indexMaxPrice) => {
  if (!timePrices || !prices || !timePrices?.length || !prices?.length) {
    return;
  }

  let newTimePrices = timePrices;
  let newPrices = prices;

  if (prices?.length > 100) {
    newTimePrices = timePrices.filter(
      (item, index) =>
        index > prices.length / 2 || (item < prices.length / 2 && ![indexMinPrice, indexMaxPrice].includes(item))
    );

    newPrices = prices.filter(
      (item, index) =>
        index > prices.length / 2 || (item < prices.length / 2 && ![indexMinPrice, indexMaxPrice].includes(item))
    );
  }

  const line_chart = ChartJSImage()
    .chart({
      type: 'line',
      data: {
        labels: newTimePrices?.map(formatDate),
        datasets: [
          {
            label: 'Giá',
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'transparent',
            data: newPrices,
          },
        ],
      },
      options: {
        title: {
          display: false,
        },
        elements: {
          line: {
            borderWidth: 1,
          },
          point: {
            borderWidth: 1,
            radius: 1,
          },
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Thời gian',
              },
            },
          ],
          yAxes: [
            {
              stacked: true,
              scaleLabel: {
                display: false,
              },
              ticks: {
                beginAtZero: true,
                // min: prices[indexMinPrice],
                // max: prices[indexMaxPrice],
              },
            },
          ],
        },
      },
    }) // Line chart
    .backgroundColor('white')
    .width(500) // 500px
    .height(300); // 300px

  return line_chart.toURL();
};

module.exports = {
  generateChart,
};
