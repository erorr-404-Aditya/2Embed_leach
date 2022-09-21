const app = require("express")();

let chrome = {};
let puppeteer;

puppeteer = require("puppeteer");
// if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
//   chrome = require("chrome-aws-lambda");
//   puppeteer = require("puppeteer-core");
// } else {
//   puppeteer = require("puppeteer");
// }

app.get("/api/getmovie", async (req, res) => {
  let options = {};

  //   if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  //     options = {
  //       args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
  //       defaultViewport: chrome.defaultViewport,
  //       executablePath: await chrome.executablePath,
  //       headless: true,
  //       ignoreHTTPSErrors: true,
  //     };
  //   }

  try {
    let id = req.query.tmdb;
    console.log(id);

    // Configures puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log("page", page);
    // await page.setUserAgent(
    //   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    // );
    await page.goto(`https://www.2embed.to/embed/tmdb/movie?id=${id}`, {
      timeout: 30000,
      waitUntil: "load",
    });

    await page.setRequestInterception(true);
    page.on("request", async (request) => {
      console.log("request", request);
      if (request.url().includes("https://www.2embed.to/ajax/embed/play")) {
        let reqUrl = request.url();
        let token = reqUrl.split("&_token=")[1].split("&")[0];
        console.log("token", token);

        // console.log(req.query.tmdb);
        // console.log(token);

        await request.abort();
        await browser.close();
        res.send({ token });
      } else {
        await request.continue();
      }
    });

    await page.waitForSelector("#play-now");
    const play = await page.$("#play-now");

    // console.log(play);
    await play.click();
    await page.waitForTimeout(1);
    await play.click();
  } catch (e) {
    console.error("error mine", e);
    res.send("Something Went Wrong");
  }
});

app.get("/api/test", async (req, res) => {
  let options = {};

  //   if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  //     options = {
  //       args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
  //       defaultViewport: chrome.defaultViewport,
  //       executablePath: await chrome.executablePath,
  //       headless: true,
  //       ignoreHTTPSErrors: true,
  //     };
  //   }

  try {
    let id = req.query.tmdb;
    console.log(id);

    // Configures puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // console.log("page", page);
    // await page.setUserAgent(
    //   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    // );
    await page.goto(`https://www.2embed.to/embed/tmdb/movie?id=${id}`, {
      timeout: 30000,
      waitUntil: "load",
    });

    res.send(page.title());
  } catch (e) {
    console.error("error mine", e);
    res.send("Something Went Wrong");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
