console.log("Headless browser module started")

export async function getPageCookies(){
    return new Promise<string>((resolve, reject) => {
        // создаём инстанс
        const view = new Bun.WebView({
            //dataStore: { directory: "./browser-profile" },
        });
        // ждём окончания загрузки
        view.addEventListener("Page.domContentEventFired", async () => {
            try {  
                const cookies = await view.evaluate("document.cookie") as string;
                console.log("Cookies are fetched");
                console.log(cookies);
                resolve(cookies);
            } catch (error) {
                console.error("An error acquired!", error);
                reject(error);
            } finally {
                console.log("Headless browser done with cookies");
                await view.close();
            }
        });

        view.navigate("https://wildberries.ru").catch((error) => {
            reject(error);
            view.close();
        })

    });
}







