require("dotenv").config({ path: "data/.env" });
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const pages = await browser.pages();
  await pages[0].close();
  await page.setViewport({
    width: 1366,
    height: 768,
  });
  await page.goto(process.env.gamepassLink);
  await page.click(".PurchaseButton");
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.waitForSelector('input[name="password"]', { timeout: 10000 });
  await page.type('input[name="username"]', process.env.username);
  await page.type('input[name="password"]', process.env.password);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("#login-button"),
  ]);

  const loggedInUsername = await page.$eval(
    ".text-overflow.age-bracket-label-username.font-caption-header",
    (text) => text.textContent.trim()
  );

  if (loggedInUsername) {
    console.log(`Logged in as ${loggedInUsername}.`);
    const gamePassAmount = await page.$eval(
      ".text-robux-lg.wait-for-i18n-format-render",
      (amount) => amount.textContent.trim()
    );
    if (gamePassAmount != "100") {
      //TODO: Make an alert
      //For now we put failure lol
      console.log("failure lol");
      await browser.close();
    } else {
      await page.click(".PurchaseButton");
      // await page.click("#confirm-btn");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await page.screenshot({
        path: "pictures/purchasedGamepass.png",
        type: "png",
      });
    }
  } else {
    console.log("Login failed.");
  }
})();
