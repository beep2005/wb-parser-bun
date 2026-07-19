console.log("Headless browser module started")

export async function getPageCookies(){
    return new Promise<string>((resolve, reject) => {
        // создаём инстанс
        const view = new Bun.WebView({
            dataStore: { directory: "./browser-profile" },
            backend: { type: "chrome", argv: ["--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"]}     
        });
        // ждём окончания загрузки
        try {
           view.onNavigated = async (url, title) => {
                console.log('loaded', url);
                const cookies = await view.evaluate('document.cookie') as string;
                console.log(cookies);
                resolve(cookies);
           }
        } catch (error) {
            console.error("An error acquired!", error);
            reject(error);
        } finally {
            console.log("Headless browser done with cookies");
        }

        view.navigate("https://wildberries.ru").catch((error) => {
            reject(error);
            view.close();
        })

    });
}

getPageCookies();
