import { TypeCheck } from "elysia/type-system";

console.log("Headless browser module started")

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
                await Bun.sleep(3000); 
                const cookies = await view.evaluate("document.cookie") as string;
                console.log("Cookies are fetched");
                //console.log(cookies);
                resolve(cookies);
                
                console.log("Делаем скриншот текущего состояния...");
                const jpegBuffer = await view.screenshot({ format: "jpeg", quality: 85 });
                await Bun.write("debug_screen.jpg", jpegBuffer);
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

getPageCookies();
