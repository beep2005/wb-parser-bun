import { cookiesDb } from "./index";
export async function getPageCookies(){
    return new Promise<string>((resolve, reject) => {
        // создаём инстанс
        const view = new Bun.WebView({
            dataStore: { directory: "./browser-profile" },
            backend: { type: "chrome", argv: ["--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"]}     
        });
        // ждём окончания загрузки
        view.addEventListener("Page.domContentEventFired", async () => {
            try {
                const cookies = await view.evaluate("document.cookie") as string;
                while(cookiesDb==null || cookies===cookiesDb){
                    const cookies = await view.evaluate("document.cookie") as string;
                    if(cookies.includes("x_wbaas_token")) {
                        resolve(cookies);
                        return;
                    }
                    await Bun.sleep(100);
                    console.log(cookies);
                    // console.log("Делаем скриншот текущего состояния...");
                    // const jpegBuffer = await view.screenshot({ format: "jpeg", quality: 85 });
                    // await Bun.write("debug_screen.jpg", jpegBuffer);
                    console.log("no cookies");
                }  

            } catch (error) {
                console.error("An error acquired!", error);
                console.log(error);
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
