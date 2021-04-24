const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const url = `https://www.dailypioneer.com/searchlist.php?section=columnists`;

const bulk = [];

const caaURLS = [
  "https://www.dailypioneer.com/2020/columnists/america---s-big-gamble.html",
  "https://www.dailypioneer.com/2020/columnists/caa-protest-is-muslims--pent-up-ire-against-modi.html",
  "https://www.dailypioneer.com/2020/columnists/disorientation-of-anti-caa-lobby-is-understandable.html",
  "https://www.dailypioneer.com/2020/columnists/caa-vs-ucc--duplicity-of-expedient-secularists.html",
  "https://www.dailypioneer.com/2020/columnists/govt-needs-to-nail-caa-lies--silence-won---t-work.html",
  "https://www.dailypioneer.com/2020/columnists/anti-caa-protests-aim-to-influence-sc-verdict.html",
  "https://www.dailypioneer.com/2019/columnists/caa-stir-unlikely-to--be-larger-satyagraha.html",
  "https://www.dailypioneer.com/2019/columnists/bottled-up-feeling-triggered-caa-stir.html",
  "https://www.dailypioneer.com/2019/columnists/govt-should-have-timed-caa-better.html",
];

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

const getRajyaSabhaData = (url) => {
  return new Promise(async (resolve, reject) => {
    fetch(url)
      .then((response) => response.text())
      .then((body) => {
        const $ = cheerio.load(body);
        const headline = $(".blog-entry-title a").text();
        const date = $(".entry-date").text();
        const article = $(".entry-summary").text().trim();
        resolve({
          headline,
          date,
          article,
        });
      });
  });
};

const searchNews = async (search, year, page) => {
  let response = await fetch(`${url}&adv=${search}&yr=${year}&page=${page}`);
  let body = await response.text();
  const $ = cheerio.load(body);
  $("h2 a").each(async (i, element) => {
    const $element = $(element);
    const $url = $element.attr("href");
    // let data = await getData(`https://www.dailypioneer.com${$url}`);
    // console.log($url);
    bulk.push(`https://www.dailypioneer.com${$url}`);
  });
  $(".highLightedNews h3 a").each(async (i, element) => {
    const $element = $(element);
    const $url = $element.attr("href");
    // let data = await getData(`https://www.dailypioneer.com${$url}`);
    // console.log($url);
    bulk.push(`https://www.dailypioneer.com${$url}`);
  });
  //   console.log(bulk);
  return bulk;
};

const searchRajyaSabha = async (url) => {
  let response = await fetch(url);
  let body = await response.text();
  const $ = cheerio.load(body);
  $(".entry-title a").each(async (i, element) => {
    const $element = $(element);
    const $url = $element.attr("href");
    let data = await getRajyaSabhaData($url);
    bulk.push(data);
  });
  return bulk;
};

const func = async () => {
  let data = [];
  for (var i = 1; i < caaURLS.length; i++) {
    let d = await getData(caaURLS[i]);
    console.log(`Page ${i} parsed`);
    data.push(d);
  }
  console.log(data);
  fs.writeFile("CAA-PIONEER.txt", JSON.stringify(data, null, 4), (err) => {
    if (err) throw err;
    console.log("Saved!");
  });
};

// const getUrls = async() => {
//     console.log(await searchNews("galwan+valley", ))
// }
// func();

const loop = async () => {
  let data = [];
  for (var i = 1; i <= 5; i++) {
    let url = `https://rstv.nic.in/page/${i}?s=balakot`;
    let d = await searchRajyaSabha(url);
    console.log(`Page ${i} parsed`);
    data.push(d);
  }
  console.log(data);
  fs.writeFile(
    "BALAKOT-RajyaSabha.txt",
    JSON.stringify(data, null, 4),
    (err) => {
      if (err) throw err;
      console.log("Saved!");
    }
  );
};

loop();
