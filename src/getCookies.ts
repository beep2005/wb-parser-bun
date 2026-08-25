export async function getPageCookies(timeoutMs = 30000): Promise<string> {
  const view = new Bun.WebView({
    backend: {
      type: "chrome",
      argv: [
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-infobars",
        "--window-size=1920,1080",
        "--lang=ru-RU",
      ],
    },
    dataStore: { directory: "./browser-profile" },
    width: 1920,
    height: 1080,
  });

  try {
    // Патчим webdriver до любой навигации (через CDP)
    await view.navigate("about:blank");
    await view.cdp("Page.addScriptToEvaluateOnNewDocument", {
      source: `
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.chrome = { runtime: {} };
        Object.defineProperty(navigator, 'languages', { get: () => ['ru-RU', 'ru', 'en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      `,
    });

    await view.navigate("https://www.wildberries.ru");

    await view.cdp("Network.enable");
    await view.cdp("Page.enable");

    // Небольшая имитация человека
    await Bun.sleep(1500 + Math.random() * 1500);
    try {
      await view.evaluate(`window.scrollBy(0, ${300 + Math.random() * 400})`);
    } catch {}

    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const { cookies } = await view.cdp<{
        cookies: Array<{ name: string; value: string; domain: string }>;
      }>("Network.getAllCookies");

      const wbCookies = cookies.filter((c) => c.domain.includes("wildberries"));
      const token = wbCookies.find((c) => c.name === "x_wbaas_token");

      if (token?.value) {
        const cookieHeader = wbCookies
          .map((c) => `${c.name}=${c.value}`)
          .join("; ");
        console.log("x_wbaas_token получен");
        return cookieHeader;
      }

      // Проверяем, не показали ли страницу challenge
      const title = await view.evaluate("document.title").catch(() => "");
      const bodyText = await view.evaluate("document.body?.innerText?.slice(0, 300) || ''").catch(() => "");
      
      if (
        String(bodyText).includes("подозрительная активность") ||
        String(bodyText).includes("очистите куки")
      ) {
        console.log("Обнаружен challenge WB, ждём...");
        // Можно попробовать подождать дольше или сделать ещё скролл
      }

      await Bun.sleep(600);
    }

    // Таймаут — сохраняем скриншот
    const jpeg = await view.screenshot({ format: "jpeg", quality: 85 });
    await Bun.write("debug_challenge.jpg", jpeg);
    throw new Error("Timeout waiting for x_wbaas_token (probably antibot challenge)");
  } finally {
    await view.close();
  }
}