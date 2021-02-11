const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const url = `https://www.dailypioneer.com/searchlist.php?section=`;

const bulk = [];

const getData = (url) => {
  return new Promise(async (resolve, reject) => {
    fetch(url)
      .then((response) => response.text())
      .then((body) => {
        const $ = cheerio.load(body);
        const headline = $('h2[itemProp="headline"]').text();
        const date = $('span[itemProp="datePublished"]').text();
        const article = $('div[itemProp="articleBody"] p').text().trim();
        resolve({
          headline,
          date,
          article,
        });
      });
  });
};

const searchNews = (search, year, page) => {
  return new Promise(async (resolve, reject) => {
    fetch(`${url}&adv=${search}&yr=${year}&page=${page}`)
      .then((response) => response.text())
      .then((body) => {
        const $ = cheerio.load(body);
        $("h2 a").each(async (i, element) => {
          const $element = $(element);
          const $url = $element.attr("href");
          let data = await getData(`https://www.dailypioneer.com${$url}`);
          bulk.push(data);
        });
        $(".highLightedNews h3 a").each(async (i, element) => {
          const $element = $(element);
          const $url = $element.attr("href");
          let data = await getData(`https://www.dailypioneer.com${$url}`);
          bulk.push(data);
        });
        resolve(bulk);
      });
  });
};

const func = async () => {
  let data = [];
  for (var i = 1; i <= 3; i++) {
    data = await searchNews("farmers+protest", "2021", i.toString());
    console.log(`Page ${i} parsed`);
  }
  console.log(data);
  fs.writeFile(
    "FARMERSPROTEST2021.txt",
    JSON.stringify(data, null, 4),
    (err) => {
      if (err) throw err;
      console.log("Saved!");
    }
  );
};

func();
