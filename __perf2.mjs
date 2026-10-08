import puppeteer from "puppeteer-core";

const BASE = "https://coralstonesproperties.co.ke";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});

async function measure(path, label) {
  const page = await browser.newPage();
  await page.emulate({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  });
  const client = await page.target().createCDPSession();
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (0.75 * 1024 * 1024) / 8,
    latency: 150,
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  let bytes = 0;
  page.on("response", async (res) => {
    try {
      bytes += (await res.buffer()).length;
    } catch {}
  });

  await page.goto(BASE + path, { waitUntil: "load", timeout: 90000 });
  await sleep(2500);
  const t = await page.evaluate(() => {
    const paints = performance.getEntriesByType("paint");
    const fcp = paints.find((p) => p.name === "first-contentful-paint");
    const n = performance.getEntriesByType("navigation")[0] || {};
    return {
      fcp: fcp ? Math.round(fcp.startTime) : null,
      ttfb: Math.round(n.responseStart || 0),
      dcl: Math.round(n.domContentLoadedEventEnd || 0),
    };
  });
  await page.close();
  return { label, fcp_ms: t.fcp, ttfb_ms: t.ttfb, dcl_ms: t.dcl, totalKB: Math.round(bytes / 1024) };
}

const runs = [];
for (let i = 1; i <= 3; i++) {
  runs.push(await measure("/", `home run ${i}`));
  await sleep(1000);
}
console.log(JSON.stringify(runs, null, 2));
await browser.close();
