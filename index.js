//********************************************************************************************//
//* Web Scraping with Puppeteer & Node.js: Chrome Automation
//* https://www.youtube.com/watch?v=lgyszZhAZOI
//********************************************************************************************//
// -----------------------------------截屏-----------------------------------
// const puppeteer = require('puppeteer');
// async function start() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("https://zhihu.com");
//   await page.screenshot({path: "example.png",fullPage: true})
//   await browser.close();
// };
// start();

// ----------------------------------文字爬取----------------------------------
// const puppeteer = require('puppeteer');
// const fs = require("fs/promises");

// async function start() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("https://baidu.com/");
//   const names = await page.evaluate(() =>{
//     return Array.from(document.querySelectorAll("#s-top-left > a")).map(x=>x.textContent)
//   })
//   await fs.writeFile("names.txt",names.join("\r\n"));
//   await browser.close();
// };
// start();

// -----------------------------------图片爬取1-----------------------------------
// const puppeteer = require('puppeteer');
// const fs = require("fs/promises");

// async function start() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("https://www.tupianzj.com/meinv/mm/meinvxinshang/");
//   const photos = await page.$$eval("img", (imgs) => {
//     return imgs.map(x=>x.src)
//   })
//   console.log(photos)
//   let i = 1;
//   for (const photo of photos) {
//     const imagepage = await page.goto(photo);
//     await fs.writeFile(`./data/${i++}-${photo.split("/").pop()}`, await imagepage.buffer())
//   }

//   await browser.close();
// };

// start();

// -----------------------------------图片爬取2-----------------------------------
// const puppeteer = require('puppeteer');
// const fs = require("fs/promises");

// async function start() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("https://www.tupianzj.com/meinv/mm/meinvxinshang/");
//   const photos = await page.evaluate(() =>{
//     return Array.from(document.querySelectorAll("#container > div > div > div:nth-child(3) > div.list_con_box > div.zt_con_img > dl > dd > ul > li > a > img")).map(x=>x.currentSrc)
//   })
//   console.log(photos)
//   let i = 1;
//   for (const photo of photos) {
//     const imagepage = await page.goto(photo);
//     await fs.writeFile(`./data/${i++}-${photo.split("/").pop()}`, await imagepage.buffer())
//   }
//   await browser.close();
// };
// start();

// -----------------------------------------点击按钮，获取信息------------------------------------------
// const puppeteer = require('puppeteer');
//
// async function start() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("https://learnwebcode.github.io/practice-requests/");
//   await page.click("#clickme");
//   const clickedData = await page.$eval("#data",el => el.textContent)
//   console.log(clickedData)
//   await browser.close();
// };
// start();

// ----------------------------------------------Submit----------------------------------------------
// const puppeteer = require('puppeteer');

// async function start() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("https://learnwebcode.github.io/practice-requests/");
//   await page.type("#ourfield", "blue");
//   await Promise.all([
//     page.waitForNavigation(),
//     page.click("#ourform > button")
//   ]);
//   const info = await page.$eval("#message", el => el.textContent);
//   console.log(info)
//   await browser.close();
// };
// /**
//  * 定时器
//  */
// setInterval(start,5000)

// -------------------------------------------Submit2-------------------------------------------
// const puppeteer = require('puppeteer');
// const cron = require('node-cron');

// async function start() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("https://learnwebcode.github.io/practice-requests/");
//   await page.type("#ourfield", "blue");
//   await Promise.all([
//     page.waitForNavigation(),
//     page.click("#ourform > button")
//   ]);
//   const info = await page.$eval("#message", el => el.textContent);
//   console.log(info)
//   await browser.close();
// };

// cron.schedule("*/5 * * * * *",start)


//********************************************************************************************//
//*                            Download Images or Files
//*                     https://www.youtube.com/watch?v=xblYMJN44ZI
//********************************************************************************************//


//********************************************************************************************//
//*                      https://www.bilibili.com/video/BV13Z4y137Kt
//*                              10分钟快速上手爬虫之Puppeteer
//********************************************************************************************//
// ------------------------------------爬取b站的titles,保存在本地------------------------------------

const puppeteer = require('puppeteer');
const fs = require('fs')
const json2xls = require('json2xls');

async function start() {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./data"
  })
  const page = await browser.newPage()
  await page.goto("https://www.bilibili.com/v/dance/?spm_id_from=333.851.b_7072696d6172794368616e6e656c4d656e75.34");
  await Promise.all([
    page.waitForSelector("#dance_otaku > div.clearfix > div.video-floor-m.l-con > div.storey-box.clearfix > div > a > p.t"),
    autoScroll(page)
  ]);
  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#dance_otaku > div.clearfix > div.video-floor-m.l-con > div.storey-box.clearfix > div > a > p.t")).map(x => x.innerText)
  })
  // 写到txt文件里
  console.log(titles)
  await fs.promises.writeFile("titles.txt", titles.join("\r\n"));

  // 写道excel文件里
  let res = [];
  for (const key in titles) {
    if (titles.hasOwnProperty.call(titles, key)) {
      const element = titles[key];
      res[key] = { "titls": element }
    }
  }
  console.log(res)
  let xls = json2xls(res);
  await fs.writeFileSync('titles.xlsx', xls, 'binary');

};
start();

// 自动滚动。为什么要自动滚动？因为要加载下面未加载的内容，只有滚动了再能加载显示。
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var currentHeight = 0;
      var distance = 10;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollTo(0, currentHeight += distance);
        if (currentHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1);
    });
  });
}