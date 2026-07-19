const view = new Bun.WebView({
    dataStore: { directory: "./browser-profile" },
    url: "https://wildberries.com"
});

console.log("Headless browser started")


console.log("Headless browser done with cookies")



