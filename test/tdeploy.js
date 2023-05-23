let owner;
let acc1;
let acc2;
let accs;

let stkappContract;

const unlocktimestamp = 1717236000; // npx epoch-cli "2024/06/01 13:00"
const basePrice = 1;
const meritBaseUri = "https://bafybeidomraxkoj2l6htwrbgiybltifmw3f4ukuwdkugpmymgorqhh3vf4.ipfs.dweb.link/";
const defaultValidator = "evmosvaloper10t6kyy4jncvnevmgq6q2ntcy90gse3yxa7x2p4";

const MeritState = {
    MINTED: 0, DELEGATED: 1, UNDELEGATED: 2
}
const Merit = {
    CUSTOM: 0, M1: 1, M2: 2, M3: 3
}
 
module.exports = {
    convertToNumber: function (hex) {
        if (!hex) return 0
        let decimals = 18
        //console.log(`Converting to number ${hex} with ${decimals} decimals`)
        return ethers.utils.formatUnits(hex, decimals)
    },
    isEqualEth: function (hex1, hex2) {
        if (!hex1) return 0
        if (!hex2) return 0
        console.log("isEqualEth ${hex1} with ${hex2}");
        return (hex1 == hex2)
    },
    hello: function () {console.log("Hello this is tdeploy.js");},
    getOwner: function () {return owner},
    getAcc1: function () {return acc1},
    getAcc2: function () {return acc2},
    getAccounts: function () {return accs},
    getStakeAppContract: function () {return stkappContract},
    getBasePrice: function () {return basePrice},
    getUnlockTime: function () {return unlocktimestamp;},
    getMeritStateMinted: function () {return MeritState.MINTED;},
    getMeritStateDelegated: function () {return MeritState.DELEGATED;},
    getMeritStateUndelegated: function () {return MeritState.UNDELEGATED;},
    getMeritCustom: function () {return Merit.CUSTOM;},
    getMerit1: function () {return Merit.M1;},
    getMerit2: function () {return Merit.M2;},
    getMerit3: function () {return Merit.M3;},
    getMeritBaseUri: function () {return meritBaseUri;},
    printMeritState: function(st) {if (st==0) return "MINTED"; if (st==1) return "DELEGATED"; if (st==2) return "UNDELEGATED"; if (st==undefined) return "dasa"; return st;},
    printMeritStat: function (meritStat) {
        let st = "MINTED"; if (meritStat.state == 1) st = "DELEGATED"; if (meritStat.state == 2) st = "UNDELEGATED";
        let val = ethers.utils.formatUnits(meritStat.amount);
        console.log("state=%s-%d meritId=%d amount=%dETH actionTime=%d", st, meritStat.state, meritStat.meritId, val, meritStat.actionTime);},
    initDeploy: async function(isdebugactive) {
        [owner, acc1, acc2, ...accs] = await ethers.getSigners();
        console.log("Owner = ", owner.address);
        console.log("Account 1 = ", acc1.address);
        console.log("Account 2 = ", acc2.address);

        StkAppFactory = await ethers.getContractFactory('StkApp');
        stkappContract = await StkAppFactory.deploy(isdebugactive, defaultValidator, basePrice, meritBaseUri);
        console.log("StkAppContract deployed to:", stkappContract.address);

    }
}


