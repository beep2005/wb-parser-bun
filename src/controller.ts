// controller.ts
import {
  getProductsToParse,
  updateProductDb,
  updatePriceHistory,
  saveCookiesDb,
} from './db/methods';
import { parse } from './worker';
import { getPageCookies } from './getCookies';

const PAUSE_EVERY = 20;          // отдыхаем после каждых 20 товаров
const PAUSE_MS = 25_000;         // 25 секунд паузы
const BETWEEN_ITEMS_MS = 1200;   // пауза между товарами

let isRunning = false;

async function tryParse(id: number): Promise<'success' | 'permanent' | 'temporary'> {
  try {
    const data = await parse(String(id));

    await updateProductDb(id, {
      name: data.name,
      currentPrice: data.price,
      inStock: data.inStock,
    });

    if(data.price != null){
        await updatePriceHistory(id, data.price, null);
    }
    
    console.log(`[OK] ${id} — ${data.name} — ${data.price}`);
    return 'success';
  } catch (err: any) {
    const msg = err?.message ?? String(err);

    // Несуществующий артикул
    if (msg.includes('No product with such article')) {
      await updateProductDb(id, {
        name: 'INVALID',
        currentPrice: null,
        inStock: false,
      });
      console.log(`[INVALID] ${id}`);
      return 'permanent';
    }

    // Нет в наличии
    if (msg.includes('out of stock')) {
      await updateProductDb(id, {
        inStock: false,
        currentPrice: null,
      });
      console.log(`[OUT OF STOCK] ${id}`);
      return 'success';
    }

    // Протухшие cookie
    if (msg === 'error 498') {
      console.log('[498] refreshing cookies...');
      try {
        const newCookies = await getPageCookies();
        await saveCookiesDb(newCookies);
        // TODO: обновить in-memory кэш, когда появится слой
      } catch (e) {
        console.error('Failed to refresh cookies', e);
      }
      return 'temporary';
    }

    // Всё остальное считаем временной ошибкой
    console.error(`[TEMP] ${id}:`, msg);
    return 'temporary';
  }
}

async function processAll() {
  if (isRunning) {
    console.log('[controller] already running, skip');
    return;
  }

  isRunning = true;
  console.log('[controller] start cycle');

  try {
    const allIds = await getProductsToParse(); // number[]
    if (allIds.length === 0) {
      console.log('[controller] no products');
      return;
    }

    const retryLater: number[] = [];
    let counter = 0;

    // === Первый проход ===
    for (const id of allIds) {
      const result = await tryParse(id);

      if (result === 'temporary') {
        retryLater.push(id);
      }

      counter++;
      if (counter % PAUSE_EVERY === 0) {
        console.log(`[controller] pause after ${counter} items`);
        await Bun.sleep(PAUSE_MS);
      } else {
        await Bun.sleep(BETWEEN_ITEMS_MS + Math.random() * 800);
      }
    }

    // === Второй проход — только то, что упало ===
    if (retryLater.length > 0) {
      console.log(`[controller] retry ${retryLater.length} failed items`);

      for (const id of retryLater) {
        await tryParse(id); // если опять temporary — просто останется на следующий цикл

        counter++;
        if (counter % PAUSE_EVERY === 0) {
          await Bun.sleep(PAUSE_MS);
        } else {
          await Bun.sleep(BETWEEN_ITEMS_MS + Math.random() * 800);
        }
      }
    }

    console.log('[controller] cycle finished');
  } catch (e) {
    console.error('[controller] cycle error', e);
  } finally {
    isRunning = false;
  }
}

export function startController() {
  console.log('[controller] registered');

  // первый запуск через 10 секунд после старта приложения
  setTimeout(() => {
    processAll();
  }, 10_000);

  // дальше — раз в 30 минут (можно вынести в env)
  setInterval(() => {
    processAll();
  }, 30 * 60 * 1000);
}