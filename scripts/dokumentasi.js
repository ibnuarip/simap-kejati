/**
 * Dokumentasi Otomatis — Screenshot seluruh halaman SIMAP.
 *
 * Cara kerja:
 * 1. Login ke 3 akun berbeda (dari .env / .env.docker).
 * 2. Temukan semua halaman yang dapat diakses via sidebar/navbar.
 * 3. Ambil full-page desktop screenshot setiap halaman.
 * 4. Simpan ke screenshots/<account-N>/desktop/.
 *
 * Jalankan:
 *   npm run dokumentasi            → pakai .env
 *   npm run dokumentasi -- --docker → pakai .env.docker
 */

import dotenv from 'dotenv';
import { resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolvePath(__dirname, '..');

// Deteksi env file: --docker flag atau ENV_FILE env var
const useDocker = process.argv.includes('--docker');
const envFile = process.env.ENV_FILE || (useDocker ? '.env.docker' : '.env');
dotenv.config({ path: resolvePath(PROJECT_ROOT, envFile) });

import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';


// ─── CONFIG ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.APP_URL || 'http://localhost:8000';
const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 30_000; // 30 detik timeout navigasi
const SCREENSHOT_WAIT = 800; // Tambahan delay agar animasi selesai

const AUTH_DIR = resolve(PROJECT_ROOT, 'scripts', 'auth');
const SCREENSHOTS_DIR = resolve(PROJECT_ROOT, 'screenshots');

/** 3 akun dokumentasi — kredensial dari .env */
const ACCOUNTS = [
    {
        name: 'account-1',
        email: process.env.DOC_ACCOUNT_1_EMAIL,
        password: process.env.DOC_ACCOUNT_1_PASSWORD,
        authFile: join(AUTH_DIR, 'account-1.json'),
    },
    {
        name: 'account-2',
        email: process.env.DOC_ACCOUNT_2_EMAIL,
        password: process.env.DOC_ACCOUNT_2_PASSWORD,
        authFile: join(AUTH_DIR, 'account-2.json'),
    },
    {
        name: 'account-3',
        email: process.env.DOC_ACCOUNT_3_EMAIL,
        password: process.env.DOC_ACCOUNT_3_PASSWORD,
        authFile: join(AUTH_DIR, 'account-3.json'),
    },
];

// ─── URL YANG TIDAK BOLEH DIKUNJUNGI ───────────────────────────────────────────

/**
 * Pattern URL/path yang harus di-skip karena bukan read-only atau bukan
 * halaman yang ingin di-screenshot.
 */
const SKIP_PATH_PATTERNS = [
    /\/login$/,
    /\/logout$/,
    /\/register$/,
    /\/password\/reset/,
    /\/password\/confirm/,
    /\/password\/email/,
    /\/email\/verify/,
    /\/two-factor/,
    /\/session\/ping$/,
    /\/avatar\//,
    /\/push\//,
    /\/exports\/print/,
    /\/exports\/download/,
    /\.well-known\//,
];

/**
 * Keyword di href/text yang mengindikasikan action destruktif.
 * Link yang mengandung keyword ini di-skip.
 */
const DESTRUCTIVE_KEYWORDS = [
    'delete', 'hapus', 'destroy', 'remove',
    'logout', 'keluar', 'sign-out', 'signout',
    'submit', 'simpan', 'save', 'update', 'create',
    'tambah', 'approve', 'reject', 'cancel', 'batal',
    'unsubscribe',
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Normalisasi URL: hapus trailing slash, hash, query param agar unik.
 * Hanya simpan pathname untuk perbandingan.
 */
function normalizeUrl(urlStr) {
    try {
        const url = new URL(urlStr, BASE_URL);
        // Hanya domain yang sama
        const base = new URL(BASE_URL);
        if (url.hostname !== base.hostname) return null;
        // Hapus trailing slash kecuali root
        let pathname = url.pathname.replace(/\/+$/, '') || '/';
        return `${url.origin}${pathname}`;
    } catch {
        return null;
    }
}

/**
 * Cek apakah URL aman untuk dikunjungi (read-only, internal, bukan
 * action destruktif).
 */
function isSafeUrl(urlStr) {
    if (!urlStr) return false;

    const normalized = normalizeUrl(urlStr);
    if (!normalized) return false;

    try {
        const url = new URL(normalized);
        const base = new URL(BASE_URL);

        // Hanya domain yang sama
        if (url.hostname !== base.hostname) return false;

        const pathname = url.pathname.toLowerCase();

        // Cek skip patterns
        for (const pattern of SKIP_PATH_PATTERNS) {
            if (pattern.test(pathname)) return false;
        }

        // Cek destructive keywords di pathname
        for (const keyword of DESTRUCTIVE_KEYWORDS) {
            if (pathname.includes(keyword)) return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Buat nama file yang aman dari pathname.
 * /dashboard      → dashboard
 * /protokol/events → protokol-events
 * /master/leaders → master-leaders
 */
function pathToFilename(urlStr) {
    try {
        const url = new URL(urlStr, BASE_URL);
        let pathname = url.pathname.replace(/\/+$/, '') || '/';
        if (pathname === '/') return 'home';

        return pathname
            .replace(/^\//, '')     // Hapus leading slash
            .replace(/\//g, '-')    // Slash → dash
            .replace(/[^a-zA-Z0-9-_]/g, '_') // Karakter tidak aman → underscore
            .toLowerCase();
    } catch {
        return 'unknown';
    }
}

/**
 * Delay async.
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pastikan direktori ada. Jika sudah ada, tidak masalah.
 */
function ensureDir(dirPath) {
    mkdirSync(dirPath, { recursive: true });
}

/** Log dengan prefix akun dan timestamp */
function log(accountName, icon, message) {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    console.log(`  ${icon} ${message}`);
}

// ─── AUTHENTICATION ────────────────────────────────────────────────────────────

/**
 * Login ke akun via halaman login.
 *
 * Proses:
 *   Buka / (home/login page)
 *   → Isi email (input#email)
 *   → Isi password (input#password)
 *   → Klik tombol Masuk (button[data-test="login-button"])
 *   → Tunggu redirect berhasil (bukan di halaman login lagi)
 *   → Simpan auth state
 */
async function performLogin(context, account) {
    const page = await context.newPage();

    try {
        // Buka halaman login (home page = login page di SIMAP)
        await page.goto(BASE_URL, {
            waitUntil: 'networkidle',
            timeout: NAV_TIMEOUT,
        });

        // Isi form login — gunakan selector yang sesuai dengan home.tsx
        await page.locator('input#email').fill(account.email);
        await page.locator('input#password').fill(account.password);

        // Klik tombol Masuk
        await page.locator('button[data-test="login-button"]').click();

        // Tunggu navigasi selesai (redirect ke dashboard)
        await page.waitForURL((url) => {
            const pathname = url.pathname;
            return pathname !== '/' && pathname !== '/login';
        }, { timeout: NAV_TIMEOUT });

        // Tunggu halaman dashboard selesai dimuat
        await page.waitForLoadState('networkidle');

        // Simpan auth state
        const storageState = await context.storageState();
        ensureDir(AUTH_DIR);
        writeFileSync(account.authFile, JSON.stringify(storageState, null, 2));

        await page.close();
        return true;
    } catch (error) {
        await page.close();
        throw new Error(`Login gagal untuk ${account.email}: ${error.message}`);
    }
}

/**
 * Coba gunakan auth state yang tersimpan. Jika session masih valid,
 * kembalikan true. Jika tidak (redirect ke login), kembalikan false.
 */
async function tryExistingAuth(context) {
    const page = await context.newPage();

    try {
        // Coba buka halaman dashboard — jika redirect ke login, berarti expired
        await page.goto(`${BASE_URL}/dashboard`, {
            waitUntil: 'networkidle',
            timeout: NAV_TIMEOUT,
        });

        const currentUrl = page.url();
        const pathname = new URL(currentUrl).pathname;

        await page.close();

        // Jika masih di halaman dashboard atau halaman role-specific, session valid
        return pathname !== '/' && pathname !== '/login';
    } catch {
        await page.close();
        return false;
    }
}

/**
 * Siapkan authenticated browser context untuk satu akun.
 * Gunakan auth state jika ada dan masih valid.
 * Jika tidak, lakukan login ulang.
 */
async function getAuthenticatedContext(browser, account) {
    // Coba gunakan existing auth state
    if (existsSync(account.authFile)) {
        try {
            const storageState = JSON.parse(readFileSync(account.authFile, 'utf-8'));
            const context = await browser.newContext({
                viewport: VIEWPORT,
                storageState,
            });

            const isValid = await tryExistingAuth(context);
            if (isValid) {
                log(account.name, '🔄', 'Menggunakan session yang tersimpan');
                return context;
            }

            // Session expired, tutup dan login ulang
            await context.close();
        } catch {
            // File rusak atau tidak bisa dipakai, lanjut login ulang
        }
    }

    // Login baru
    const context = await browser.newContext({ viewport: VIEWPORT });
    await performLogin(context, account);
    log(account.name, '🔑', 'Login berhasil (session baru)');
    return context;
}

// ─── PAGE DISCOVERY (CRAWLING) ─────────────────────────────────────────────────

/**
 * Kumpulkan semua link internal dari halaman yang sedang terbuka.
 *
 * Sumber:
 *   1. Sidebar (nav[data-sidebar], [data-sidebar="content"])
 *   2. Semua <a href="..."> di halaman
 *   3. Menu collapsible yang mungkin tersembunyi
 *
 * Filter:
 *   - Hanya domain internal
 *   - Bukan action destruktif
 *   - Bukan external link
 */
async function discoverLinks(page) {
    // Buka semua collapsible sidebar menu agar sub-menu terlihat
    try {
        const collapsibleTriggers = page.locator(
            '[data-sidebar="content"] button[data-state="closed"]'
        );
        const count = await collapsibleTriggers.count();
        for (let i = 0; i < count; i++) {
            try {
                await collapsibleTriggers.nth(i).click({ timeout: 2000 });
                await sleep(300);
            } catch {
                // Skip jika trigger tidak bisa diklik
            }
        }
    } catch {
        // Sidebar mungkin tidak ada di halaman ini
    }

    // Kumpulkan semua href dari <a> tag
    const hrefs = await page.evaluate((baseUrl) => {
        const links = new Set();
        const anchors = document.querySelectorAll('a[href]');

        for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            if (!href) continue;
            if (href.startsWith('#')) continue;
            if (href.startsWith('javascript:')) continue;
            if (href.startsWith('mailto:')) continue;
            if (href.startsWith('tel:')) continue;

            // Skip external links (target="_blank" dengan domain luar)
            try {
                const url = new URL(href, baseUrl);
                const base = new URL(baseUrl);
                if (url.hostname !== base.hostname) continue;
                links.add(url.href);
            } catch {
                // URL tidak valid, skip
            }
        }

        return [...links];
    }, BASE_URL);

    return hrefs.filter(isSafeUrl);
}

/**
 * Crawl semua halaman yang dapat diakses oleh akun.
 *
 * Algoritma BFS:
 *   1. Mulai dari halaman dashboard (setelah login).
 *   2. Temukan semua link internal.
 *   3. Buka halaman baru yang belum dikunjungi.
 *   4. Ulangi sampai tidak ada halaman baru.
 *
 * @returns {string[]} Array URL yang berhasil ditemukan
 */
async function crawlPages(context) {
    const visited = new Set();
    const queue = [];
    const discoveredPages = [];

    // Halaman pertama — buka dashboard/home setelah login
    const startPage = await context.newPage();
    try {
        // Coba ke dashboard atau apapun yang valid setelah login
        await startPage.goto(`${BASE_URL}/dashboard`, {
            waitUntil: 'networkidle',
            timeout: NAV_TIMEOUT,
        });
    } catch {
        // Mungkin bukan superadmin, coba root
        await startPage.goto(BASE_URL, {
            waitUntil: 'networkidle',
            timeout: NAV_TIMEOUT,
        });
    }

    // Setelah navigasi, kita berada di halaman yang sesuai role
    const landingUrl = normalizeUrl(startPage.url());
    if (landingUrl && isSafeUrl(landingUrl)) {
        visited.add(landingUrl);
        discoveredPages.push(landingUrl);

        // Temukan link dari halaman pertama
        const links = await discoverLinks(startPage);
        for (const link of links) {
            const normalized = normalizeUrl(link);
            if (normalized && !visited.has(normalized)) {
                queue.push(normalized);
                visited.add(normalized);
            }
        }
    }
    await startPage.close();

    // BFS: buka semua halaman di queue
    while (queue.length > 0) {
        const url = queue.shift();
        const page = await context.newPage();

        try {
            const response = await page.goto(url, {
                waitUntil: 'networkidle',
                timeout: NAV_TIMEOUT,
            });

            // Cek apakah redirect ke login (session issue atau forbidden)
            const finalUrl = normalizeUrl(page.url());
            const finalPathname = new URL(page.url()).pathname;

            if (finalPathname === '/' || finalPathname === '/login') {
                // Halaman memerlukan auth yang tidak kita punya, skip
                await page.close();
                continue;
            }

            // Cek status HTTP
            if (response && response.status() >= 400) {
                await page.close();
                continue;
            }

            // Tambah ke discovered
            if (finalUrl && isSafeUrl(finalUrl) && !discoveredPages.includes(finalUrl)) {
                discoveredPages.push(finalUrl);
            }

            // Temukan link baru dari halaman ini
            const links = await discoverLinks(page);
            for (const link of links) {
                const normalized = normalizeUrl(link);
                if (normalized && !visited.has(normalized)) {
                    queue.push(normalized);
                    visited.add(normalized);
                }
            }
        } catch {
            // Gagal load halaman, skip
        }

        await page.close();
    }

    return discoveredPages;
}

// ─── SCREENSHOT ────────────────────────────────────────────────────────────────

/**
 * Ambil screenshot satu halaman.
 *
 * @param {import('@playwright/test').BrowserContext} context
 * @param {string} url
 * @param {string} outputPath
 * @returns {{ success: boolean, error?: string }}
 */
async function screenshotPage(context, url, outputPath) {
    const page = await context.newPage();

    try {
        await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: NAV_TIMEOUT,
        });

        // Cek redirect ke login
        const finalPathname = new URL(page.url()).pathname;
        if (finalPathname === '/' || finalPathname === '/login') {
            await page.close();
            return { success: false, error: 'Redirect ke login' };
        }

        // Buka collapsible sidebar agar screenshot menunjukkan semua menu
        try {
            const collapsibleTriggers = page.locator(
                '[data-sidebar="content"] button[data-state="closed"]'
            );
            const count = await collapsibleTriggers.count();
            for (let i = 0; i < count; i++) {
                try {
                    await collapsibleTriggers.nth(i).click({ timeout: 2000 });
                    await sleep(200);
                } catch {
                    // Skip
                }
            }
        } catch {
            // Sidebar mungkin tidak ada
        }

        // Tunggu konten selesai render + animasi
        await sleep(SCREENSHOT_WAIT);

        // Tunggu tidak ada loading spinner
        try {
            await page.waitForSelector('[data-loading]', {
                state: 'detached',
                timeout: 5000,
            });
        } catch {
            // Tidak ada loading indicator, lanjut
        }

        // Ambil screenshot
        await page.screenshot({
            path: outputPath,
            fullPage: true,
        });

        await page.close();
        return { success: true };
    } catch (error) {
        await page.close();
        return { success: false, error: error.message };
    }
}

// ─── PROSES UTAMA ──────────────────────────────────────────────────────────────

async function processAccount(browser, account) {
    const results = { success: 0, failed: 0, errors: [] };

    console.log(`\n[${account.name.toUpperCase()}]`);

    // Validasi kredensial
    if (!account.email || !account.password) {
        console.log(`  ✗ Kredensial tidak ditemukan di .env untuk ${account.name}`);
        console.log(`    Pastikan DOC_${account.name.toUpperCase().replace('-', '_')}_EMAIL dan PASSWORD terisi.`);
        results.failed = 1;
        results.errors.push('Kredensial tidak ditemukan');
        return results;
    }

    // Login
    let context;
    try {
        context = await getAuthenticatedContext(browser, account);
        log(account.name, '✓', 'Login berhasil');
    } catch (error) {
        log(account.name, '✗', `Login gagal — ${error.message}`);
        results.failed = 1;
        results.errors.push(`Login: ${error.message}`);
        return results;
    }

    // Temukan halaman
    log(account.name, '🔍', 'Mencari halaman yang dapat diakses...');
    let pages;
    try {
        pages = await crawlPages(context);
        log(account.name, '📋', `Ditemukan ${pages.length} halaman`);
    } catch (error) {
        log(account.name, '✗', `Gagal menemukan halaman — ${error.message}`);
        await context.close();
        results.failed = 1;
        results.errors.push(`Crawl: ${error.message}`);
        return results;
    }

    if (pages.length === 0) {
        log(account.name, '⚠', 'Tidak ada halaman yang ditemukan');
        await context.close();
        return results;
    }

    // Siapkan folder screenshot
    const desktopDir = join(SCREENSHOTS_DIR, account.name, 'desktop');

    // Hapus folder lama agar tidak ada sisa screenshot dari page yang sudah tidak ada
    if (existsSync(desktopDir)) {
        rmSync(desktopDir, { recursive: true, force: true });
    }
    ensureDir(desktopDir);

    // Screenshot setiap halaman
    for (let i = 0; i < pages.length; i++) {
        const url = pages[i];
        const index = String(i + 1).padStart(2, '0');
        const filename = `${index}-${pathToFilename(url)}.png`;
        const outputPath = join(desktopDir, filename);
        const displayName = pathToFilename(url);

        const result = await screenshotPage(context, url, outputPath);

        if (result.success) {
            log(account.name, '✓', displayName);
            results.success++;
        } else {
            log(account.name, '✗', `${displayName} — ${result.error}`);
            results.failed++;
            results.errors.push(`${displayName}: ${result.error}`);
        }
    }

    await context.close();
    return results;
}

async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   SIMAP — Dokumentasi Screenshot Otomatis   ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Target: ${BASE_URL.padEnd(36)}║`);
    console.log(`║  Viewport: ${VIEWPORT.width}x${VIEWPORT.height}${''.padEnd(24)}║`);
    console.log('╚══════════════════════════════════════════════╝');

    const browser = await chromium.launch({
        headless: true,
    });

    const summary = [];

    for (const account of ACCOUNTS) {
        try {
            const result = await processAccount(browser, account);
            summary.push({ name: account.name, ...result });
        } catch (error) {
            console.log(`\n  ✗ Error fatal untuk ${account.name}: ${error.message}`);
            summary.push({
                name: account.name,
                success: 0,
                failed: 1,
                errors: [error.message],
            });
        }
    }

    await browser.close();

    // Ringkasan akhir
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║            Dokumentasi Selesai               ║');
    console.log('╠══════════════════════════════════════════════╣');
    for (const s of summary) {
        console.log(`║  ${s.name}:`.padEnd(47) + '║');
        console.log(`║    Berhasil: ${String(s.success).padEnd(32)}║`);
        console.log(`║    Gagal:    ${String(s.failed).padEnd(32)}║`);
        if (s.errors && s.errors.length > 0) {
            for (const err of s.errors) {
                const truncated = err.length > 38 ? err.substring(0, 35) + '...' : err;
                console.log(`║    → ${truncated.padEnd(39)}║`);
            }
        }
    }
    console.log('╚══════════════════════════════════════════════╝');

    // Exit code non-zero jika ada error fatal (login gagal)
    const totalFatalErrors = summary.filter((s) => s.success === 0 && s.failed > 0).length;
    if (totalFatalErrors === ACCOUNTS.length) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('\n✗ Error fatal:', error.message);
    process.exit(1);
});
