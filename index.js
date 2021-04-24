const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const url = `https://www.dailypioneer.com/searchlist.php?`;
const hindustanURL = `https://www.hindustantimes.com/editorials/`;

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

const getMoreData = (url) => {
  return new Promise(async (resolve, reject) => {
    fetch(url)
      .then((res) => res.text())
      .then((body) => {
        const $ = cheerio.load(body);
        const headline = $(".fullStory .hdg1").text();
        const date = $(".fullStory .dateTime").text();
        const article = $(".fullStory .detail p").text().toLowerCase();
        if (
          article.search("protest") > 0 ||
          article.search("26 jan") > 0 ||
          article.search("farmer") > 0 ||
          article.search("singhi border") > 0
        ) {
          console.log({
            headline,
          });
          resolve({
            headline,
            date,
            article,
          });
        } else {
          reject();
        }
      });
  });
};

const searchNews = (search, id) => {
  return new Promise(async (resolve, reject) => {
    fetch(`${hindustanURL}/page-${id}/`)
      .then((response) => response.text())
      .then((body) => {
        const $ = cheerio.load(body);
        $(".hdg3 a").each(async (i, element) => {
          const $element = $(element);
          const $url = $element.attr("href");
          try {
            let data = await getMoreData(
              `https://www.hindustantimes.com${$url}`
            );
            bulk.push(data);
          } catch (err) {
            console.log("Not Found");
          }
        });
        resolve(bulk);
      });
  });
};

const searchNewsPioneer = (search, year, page) => {
  return new Promise(async (resolve, reject) => {
    fetch(`${url}&adv=${search}&yr=${year}&page=${page}&section=columnists`)
      .then((response) => response.text())
      .then((body) => {
        const $ = cheerio.load(body);
        $("h2 a").each(async (i, element) => {
          const $element = $(element);
          const $url = $element.attr("href");
          let data = await getData(`https://www.dailypioneer.com${$url}`);
          console.log(data);
          bulk.push(data);
        });
        $(".highLightedNews h3 a").each(async (i, element) => {
          const $element = $(element);
          const $url = $element.attr("href");
          let data = await getData(`https://www.dailypioneer.com${$url}`);
          console.log(data);
          bulk.push(data);
          console.log(bulk);
        });
      })
      .then(() => {
        resolve(bulk);
      });
  });
};

let data = [];
const func = async () => {
  for (var i = 1; i <= 1; i++) {
    let data = await searchNewsPioneer("caa", "2020", "1");
    console.log(`Page parsed`);
  }
  console.log(data);
  fs.writeFile("CAA-Pioneer.txt", JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
    console.log("Saved!");
  });
};

func();
// getMoreData(
//   "https://www.hindustantimes.com/editorials/in-puducherry-a-political-crisis-hteditorial-101614006570699.html"
// );
