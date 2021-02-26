const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const url = `https://timesofindia.indiatimes.com/blogs/toi-editorials/`;

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
        const headline = $(".show-header h1").text();
        const date = $(".meta span").first().text();
        // $(".wp-image-132428").remove();
        $(`img[loading="lazy"]`).remove();
        const article = $(".main-content p").text();
        resolve({
          headline,
          date,
          article,
        });
      });
  });
};

const searchNews = (search, id) => {
  return new Promise(async (resolve, reject) => {
    fetch(`${url}/page/${id}/?s=${search}`)
      .then((response) => response.text())
      .then((body) => {
        const $ = cheerio.load(body);
        $("h2 a").each(async (i, element) => {
          const $element = $(element);
          const $url = $element.attr("href");
          let data = await getMoreData(`${$url}`);
          bulk.push(data);
        });
        resolve(bulk);
      });
  });
};

const func = async () => {
  let data = [];
  for (var i = 1; i <= 2; i++) {
    data = await searchNews("galwan-valley", i.toString());
    console.log(`Page ${i} parsed`);
  }
  console.log(data);
  fs.writeFile("GalwanValley.txt", JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
    console.log("Saved!");
  });
};

func();
