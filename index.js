'use strict'
const qs = require('qs')
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();
var uri = 'https://www.bet365.com/'
var head = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    //'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/85.0.4183.83 Mobile/15E148 Safari/604.1'
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
    //Host : '',
    Cookie: `aps03=cf=N&cg=1&cst=0&ct=28&hd=N&lng=33&oty=2&tzi=16`
}

const api = axios.create({
    url: uri,
    headers: head,
    withCredentials: true,
    jar: cookieJar
})

function formatData(data) {
    const rawMessage = data;
    var split, glit = [];
    var splitArr = rawMessage.split('|')
    splitArr = splitArr.sort();
    for (split of splitArr) {
        //console.log(split)
        var PA = split.indexOf('PA');
        var MA = split.indexOf('MA');
        var CL = split.indexOf('CL');
        var MG = split.indexOf('MG');
        var EV = split.indexOf('EV');

        if (EV == 0) {
            try {
                var obj = split.replace(/EV;/gi, '{ "type":"getEvent","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                glit.push(JSON.parse(obj))
            } catch (e) {
                var obj = { error: 'Erro' }
            }
        }

        if (PA == 0) {
            try {
                var obj = split.replace(/PA;/gi, '{ "type":"eventPlay","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                glit.push(JSON.parse(obj))
            } catch (e) {
                var obj = { error: 'Erro' }
            }
        }

        if (MA == 0) {
            try {
                var obj = split.replace(/MA;/gi, '{ "type":"eventMatch","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                glit.push(JSON.parse(obj))
            } catch (e) {
                var obj = { error: 'Erro' }
            }
        }

        if (CL == 0) {
            try {
                var obj = split.replace(/CL;/gi, '{ "type":"clain","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                glit.push(JSON.parse(obj))
            } catch (e) {
                var obj = { error: 'Erro' }
            }
        }

        if (MG == 0) {
            try {
                var obj = split.replace(/MG;/gi, '{ "type":"magic","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                glit.push(JSON.parse(obj))
            } catch (e) {
                var obj = { error: 'Erro' }
            }
        }
    }

    return glit;
}

class inplay {
    requestDefaultData(endPoint, query, method) {
        return new Promise((resolve, reject) => {
            api.get(`${uri}defaultapi/sports-configuration`).then((defaults) => {
                //console.log(defaults)
                let app = axios.create({
                    url: uri,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cache-Control': 'max-age=0',
                        'Connection': 'keep-alive',
                        'Cookie': `aps03=ao=2&cf=E&cg=${defaults.data.flashvars.CUSTOMER_TYPE}&cst=0&ct=${defaults.data.flashvars.REGISTERED_COUNTRY_CODE}&hd=Y&lng=${defaults.data.flashvars.LANGUAGE_ID}&oty=2&tt=2&tzi=16; pstk=${defaults.data.flashvars.SESSION_ID}${defaults.data.flashvars.COOKIE_SECURITY_LEVEL}`,
                        'Host': `${defaults.data.flashvars.DOMAIN_URL}`,
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'none',
                        'Sec-Fetch-User': '?1',
                        'Upgrade-Insecure-Requests': 1,
                        'User-Agent': `${defaults.data.ns_weblib_util.WebsiteConfig.DEFAULT_USERAGENT}`

                    },
                    jar: cookieJar,
                    withCredentials: true
                })
                
                app.get(uri + endPoint + '?' + query).then((rest) => {
                    if(method == 'json'){
                        return resolve(formatData(rest.data))
                    }else{
                        return resolve(rest.data)
                    }
                }).catch((e) => {
                    return reject(e)
                });

            }).catch((e) => {
                return reject(e)
            })
        })
    }

    allDefaults() {
        return new Promise((resolve, reject) => {
            api.get(`${uri}defaultapi/sports-configuration`).then((defaults) => {
                return resolve(defaults.data)
            }).catch((e) => {
                return reject(e)
            })
        })
    }

    getAllGames(lid, zid, cid, ctid) {
        return new Promise((resolve, reject) => {
            api.get(`${uri}SportsBook.API/web?lid=${lid}&zid=${zid}&pd=%23AC%23B1%23C1%23D13%23F2%23Q1%23F%5E12%23&cid=${cid}&ctid=${ctid}`).then((all) => {
                //return resolve(all.data);
                const rawMessage = all.data;
                var split, glit = [];
                var splitArr = rawMessage.split('|')
                splitArr = splitArr.sort();
                for (split of splitArr) {
                    //console.log(split)
                    var PA = split.indexOf('PA');
                    var MA = split.indexOf('MA');
                    var CL = split.indexOf('CL');
                    var MG = split.indexOf('MG');
                    var EV = split.indexOf('EV');

                    if (EV == 0) {
                        try {
                            var obj = split.replace(/EV;/gi, '{ "type":"getEvent","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                            glit.push(JSON.parse(obj))
                        } catch (e) {
                            var obj = { error: 'Erro' }
                        }
                    }

                    if (PA == 0) {
                        try {
                            var obj = split.replace(/PA;/gi, '{ "type":"eventPlay","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                            glit.push(JSON.parse(obj))
                        } catch (e) {
                            var obj = { error: 'Erro' }
                        }
                    }

                    if (MA == 0) {
                        try {
                            var obj = split.replace(/MA;/gi, '{ "type":"eventMatch","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                            glit.push(JSON.parse(obj))
                        } catch (e) {
                            var obj = { error: 'Erro' }
                        }
                    }

                    if (CL == 0) {
                        try {
                            var obj = split.replace(/CL;/gi, '{ "type":"clain","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                            glit.push(JSON.parse(obj))
                        } catch (e) {
                            var obj = { error: 'Erro' }
                        }
                    }

                    if (MG == 0) {
                        try {
                            var obj = split.replace(/MG;/gi, '{ "type":"magic","data":{"').replace(/=/gi, `":"`).replace(/;/gi, `","`).slice(0, -2) + '} }'
                            glit.push(JSON.parse(obj))
                        } catch (e) {
                            var obj = { error: 'Erro' }
                        }
                    }
                }

                return resolve(glit);
            }).catch((e) => {
                return reject(e);
            })
        })
    }

    getInplay(lid, zid, cid, ctid) {
        return new Promise((resolve, reject) => {
            api.get(`${uri}SportsBook.API/web?lid=${lid}&zid=${zid}&pd=%23AC%23B1%23C1%23D13%23F2%23Q1%23F%5E12%23&cid=${cid}&ctid=${ctid}`).then((game) => {
                game = game.data
                var arr = game.split('|'), restData = [], pullData = [], val
                for (val of arr) {
                    var go = val.indexOf('PA')
                    if (go == 0) {
                        //console.log(val)
                        let xna = val.indexOf('NA')
                        let xn2 = val.indexOf('N2')
                        let xpd = val.indexOf('PD')
                        let xBC = val.indexOf('BC')
                        let xPT = val.indexOf('PT')
                        let zID = val.indexOf('ID')
                        let zFI = val.indexOf('FI')
                        let zFD = val.indexOf('FD')
                        let zLI = val.indexOf('LI')
                        let zEX = val.indexOf('EX')
                        let zSU = val.indexOf('SU')
                        let xML = val.indexOf('ML')
                        let xEM = val.indexOf('EM')
                        // let xFF = val.indexOf('FF')
                        // let xMT = val.indexOf('MT')
                        // let zOR = val.indexOf('OR')
                        // let xFS = val.indexOf('FS')
                        // let xCL = val.indexOf('CL')
                        // let xCC = val.indexOf('CC')
                        // let xTR = val.indexOf('TR')
                        // let xCB = val.indexOf('CB')
                        // let zNA = val.indexOf('NA')
                        // let xKI = val.indexOf('KI')
                        // let xKC = val.indexOf('KC')
                        //let xPD = val.indexOf('PD')
                        // console.log(xn2)
                        if (zID == 3 && xna == 18 && xn2 !== -1 && xpd !== -1 && zFD !== -1 && xML !== -1 && zLI !== -1 && zEX !== -1 && zSU !== -1 && zFD !== -1 && zFI !== -1) {

                            let info = val.substring(xna + 3, xn2 - 1)
                            let pdata = val.substring(xpd + 3, xML - 1)
                            let xn2Data = val.substring(xn2 + 3, zFD - 1)
                            let fdData = val.substring(zFD + 3, zFI - 1)
                            let bcData = val.substring(xBC + 3, zLI - 1)
                            let liData = val.substring(zLI + 3, zEX - 1)
                            let ptData = val.substring(xPT + 3, xEM - 1)
                            let suData = val.substring(zSU + 3, xpd - 1)
                            let mlData = val.substring(xML + 3, xPT - 1)
                            let ID = val.substring(zID + 3, xna - 1)
                            let FI = val.substring(zFI + 3, xBC - 1)

                            // let exData = val.substring(zEX + 3,  zSU - 1)
                            // let fsData = val.substring(xFS + 3, xPT - 1) 
                            // let cbDAta = val.substring(xCB + 3, zNA - 1)
                            // let naData = val.substring(zNA + 3, xKI - 1)
                            // let kiData = val.substring(xKI + 3, xKC - 1)
                            // let pdData = val.substring(xpd + 3, xML - 1)
                            // let ccData = val.substring(xCC + 3, xTR - 1)
                            // let clData = val.substring(xCL + 3, xCC - 1)

                            let setObj = {
                                info: info,
                                pdata: pdata,
                                bcData: bcData,
                                ptData: ptData,
                                fdData: fdData,
                                //naData: naData,
                                //kiData: kiData,
                                //exData: exData,
                                suData: suData,
                                mlData: mlData,
                                n2: xn2Data,
                                li: liData,
                                id: ID,
                                fi: FI
                            }

                            restData.push(setObj)

                        }
                        // let info = val.substring(xna + 3, xn2 - 1)
                        // let pdata = val.substring(xpd + 3, xFF - 1)
                        // let bcData = val.substring(xBC + 3, xFS - 1)
                        // let fsData = val.substring(xFS + 3, xPT - 1)
                        // let ptData = val.substring(xPT + 3, xMT - 1)
                        // let clData = val.substring(xCL + 3, xCC - 1)
                        // let ccData = val.substring(xCC + 3, xTR - 1)
                        // let cbDAta = val.substring(xCB + 3, zNA - 1)
                        // let naData = val.substring(zNA + 3, xKI - 1)
                        // let kiData = val.substring(xKI + 3, xKC - 1)
                        // let ID = val.substring(zID + 3, zOR - 1)
                        // let FI = val.substring(zFI + 3, zNA - 1)
                    }
                }
                return resolve(restData)
            }).catch((err) => {
                return reject(err)
            })
            //})
        })
    }

    getMatchs(lid, zid, cid, ctid) {
        return new Promise((resolve, reject) => {
            api.get(`${uri}SportsBook.API/web?lid=${lid}&zid=${zid}&pd=%23AS%23B1%23&cid=${cid}&ctid=${ctid}`).then((game) => {
                game = game.data;
                var arr = game.split('|'), restData = [], pullData = [], val
                for (val of arr) {
                    var go = val.indexOf('PA')
                    if (go == 0) {

                        var BC = val.indexOf('BC')
                        var FS = val.indexOf('FS')
                        var PT = val.indexOf('PT')
                        var MT = val.indexOf('MT')
                        var CL = val.indexOf('CL')
                        var CC = val.indexOf('CC')
                        var TR = val.indexOf('TR')
                        var IA = val.indexOf('IA')
                        var PD = val.indexOf('PD')
                        var CB = val.indexOf('CB')
                        var VI = val.indexOf('VI')
                        var NA = val.indexOf('NA')
                        var KI = val.indexOf('KI')
                        var KC = val.indexOf('KC')

                        var TID = val.indexOf('ID')
                        var TOR = val.indexOf('OR')
                        var TCL = val.indexOf('CL')
                        var TFI = val.indexOf('FI')
                        var TNA = val.indexOf('NA')
                        var TN2 = val.indexOf('N2')
                        var TOD = val.indexOf('OD')
                        var THA = val.indexOf('HA')
                        var THD = val.indexOf('HD')
                        var TSU = val.indexOf('SU')
                        var TBS = val.indexOf('BS')
                        var TPH = val.indexOf('PH')
                        var TLA = val.indexOf('LA')

                        if (BC == 3) {
                            var NBC = val.substring(BC + 3, FS - 1)
                            var NFS = val.substring(FS + 3, PT - 1)
                            var NPT = val.substring(PT + 3, MT - 1)
                            var NMT = val.substring(MT + 3, CL - 1)
                            var NCL = val.substring(CL + 3, CC - 1)
                            var NCC = val.substring(CC + 3, TR - 1)
                            var NTR = val.substring(TR + 3, IA - 1)
                            var NIA = val.substring(IA + 3, PD - 1)
                            var NPD = val.substring(PD + 3, CB - 1)
                            var NCB = val.substring(CB + 3, VI - 1)
                            var NVI = val.substring(VI + 3, NA - 1)
                            var NNA = val.substring(NA + 3, KI - 1)
                            var NKI = val.substring(KI + 3, KC - 1)
                            var NKC = val.substring(KC + 3)

                            var logObj = {
                                NBC: NBC,
                                NFS: NFS,
                                NPT: NPT,
                                NMT: NMT,
                                NCL: NCL,
                                NCC: NCC,
                                NTR: NTR,
                                NIA: NIA,
                                NPD: NPD,
                                NCB: NCB,
                                NVI: NVI,
                                NNA: NNA,
                                NKI: NKI,
                                NKC: NKC
                            }
                        }

                        if (TID == 3) {

                            var CTID = val.substring(TID + 3, TOR - 1)
                            var CTOR = val.substring(TOR + 3, TCL - 1)
                            var CTCL = val.substring(TCL + 3, TFI - 1)
                            var CTFI = val.substring(TFI + 3, TNA - 1)
                            var CTNA = val.substring(TNA + 3, TN2 - 1)
                            var CTN2 = val.substring(TN2 + 3, TOD - 1)
                            var CTOD = val.substring(TOD + 3, THA - 1)
                            var CTHA = val.substring(THA + 3, THD - 1)
                            var CTHD = val.substring(THD + 3, TSU - 1)
                            var CTSU = val.substring(TSU + 3, TBS - 1)
                            var CTBS = val.substring(TBS + 3, TPH - 1)
                            var CTPH = val.substring(TPH + 3, TLA - 1)
                            var CTLA = val.substring(TLA + 3)

                            var legObj = {
                                CTID: CTID,
                                CTOR: CTOR,
                                CTCL: CTCL,
                                CTFI: CTFI,
                                CTNA: CTNA,
                                CTN2: CTN2,
                                CTOD: CTOD,
                                CTHA: CTHA,
                                CTHD: CTHD,
                                CTSU: CTSU,
                                CTBS: CTBS,
                                CTPH: CTPH,
                                CTLA: CTLA
                            }
                        }


                        var gameObj = {
                            first: logObj,
                            data: legObj
                        }
                        restData.push(gameObj)
                    }

                }

                return resolve(restData)
            }).catch((err) => {
                return reject(err)
            })
        })
    }

    getNexts(lid, zid, cid, ctid) {
        return new Promise((resolve, reject) => {

            //console.lo)
            //console.log(`SportsBook.API/web?lid=${lid}&zid=${zid}&pd=${pd}&cid=${cid}&ctid=${ctid}`)
            // let query = qs.stringify({
            //     lid: lid,
            //     zid: zid,
            //     cid: cid,
            //     ctid: ctid
            // })

            // api.get('defaultapi/sports-configuration/').then((config) => {
            //    config = config.data
            //    console.log(config)
            api.get(`${uri}SportsBook.API/web?lid=${lid}&zid=${zid}&pd=%23AC%23B1%23C1%23D13%23F2%23Q1%23F%5E12%23&cid=${cid}&ctid=${ctid}`).then((game) => {
                game = game.data
                var arr = game.split('|'), restData = [], pullData = [], val
                for (val of arr) {
                    var go = val.indexOf('PA')
                    if (go == 0) {
                        //console.log(val)
                        let xna = val.indexOf('NA')
                        let xn2 = val.indexOf('N2')
                        let xpd = val.indexOf('PD')
                        let xBC = val.indexOf('BC')
                        let xPT = val.indexOf('PT')
                        let zID = val.indexOf('ID')
                        let zFI = val.indexOf('FI')
                        let zFD = val.indexOf('FD')
                        let zLI = val.indexOf('LI')
                        let zEX = val.indexOf('EX')
                        let zSU = val.indexOf('SU')
                        let xML = val.indexOf('ML')
                        let xEM = val.indexOf('EM')
                        // let xFF = val.indexOf('FF')
                        // let xMT = val.indexOf('MT')
                        // let zOR = val.indexOf('OR')
                        // let xFS = val.indexOf('FS')
                        // let xCL = val.indexOf('CL')
                        // let xCC = val.indexOf('CC')
                        // let xTR = val.indexOf('TR')
                        // let xCB = val.indexOf('CB')
                        // let zNA = val.indexOf('NA')
                        // let xKI = val.indexOf('KI')
                        // let xKC = val.indexOf('KC')
                        //let xPD = val.indexOf('PD')
                        //console.log(xML)
                        if (zID !== -1 && xna !== -1 && xn2 !== -1 && xpd !== -1 && zFD !== -1 && zLI !== -1 && zFD !== -1 && zFI !== -1) {

                            let info = val.substring(xna + 3, xn2 - 1)
                            let pdata = val.substring(xpd + 3, xML - 1)
                            let xn2Data = val.substring(xn2 + 3, zFD - 1)
                            let fdData = val.substring(zFD + 3, zFI - 1)
                            let bcData = val.substring(xBC + 3, zLI - 1)
                            let liData = val.substring(zLI + 3, zEX - 1)
                            let ptData = val.substring(xPT + 3, xEM - 1)
                            let suData = val.substring(zSU + 3, xpd - 1)
                            let mlData = val.substring(xML + 3, xPT - 1)
                            let ID = val.substring(zID + 3, xna - 1)
                            let FI = val.substring(zFI + 3, xBC - 1)

                            // let exData = val.substring(zEX + 3,  zSU - 1)
                            // let fsData = val.substring(xFS + 3, xPT - 1) 
                            // let cbDAta = val.substring(xCB + 3, zNA - 1)
                            // let naData = val.substring(zNA + 3, xKI - 1)
                            // let kiData = val.substring(xKI + 3, xKC - 1)
                            // let pdData = val.substring(xpd + 3, xML - 1)
                            // let ccData = val.substring(xCC + 3, xTR - 1)
                            // let clData = val.substring(xCL + 3, xCC - 1)

                            let setObj = {
                                info: info,
                                //pdata: pdata,
                                bcData: bcData,
                                ptData: ptData,
                                fdData: fdData,
                                //naData: naData,
                                //kiData: kiData,
                                //exData: exData,
                                // suData: suData,
                                mlData: mlData,
                                n2: xn2Data,
                                // li: liData,
                                id: ID,
                                fi: FI
                            }

                            restData.push(setObj)

                        }
                        // let info = val.substring(xna + 3, xn2 - 1)
                        // let pdata = val.substring(xpd + 3, xFF - 1)
                        // let bcData = val.substring(xBC + 3, xFS - 1)
                        // let fsData = val.substring(xFS + 3, xPT - 1)
                        // let ptData = val.substring(xPT + 3, xMT - 1)
                        // let clData = val.substring(xCL + 3, xCC - 1)
                        // let ccData = val.substring(xCC + 3, xTR - 1)
                        // let cbDAta = val.substring(xCB + 3, zNA - 1)
                        // let naData = val.substring(zNA + 3, xKI - 1)
                        // let kiData = val.substring(xKI + 3, xKC - 1)
                        // let ID = val.substring(zID + 3, zOR - 1)
                        // let FI = val.substring(zFI + 3, zNA - 1)
                    }
                }
                return resolve(restData)
            }).catch((err) => {
                return reject(err)
            })
            //})
        })
    }
}

module.exports = inplay;
