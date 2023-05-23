const { expect } = require("chai");
const { ethers } = require("hardhat");
const d = require("./tdeploy.js");

describe("Merit tests", function () {

  beforeEach(async () => {
    await d.initDeploy(true);
  });

  describe.only("Buy Merit", function () {
    it.only("Buy fixed", async function () {    
      let stkAppBalance = await ethers.provider.getBalance(d.getStakeAppContract().address);
      console.log("StkApp Init Balance = ", d.convertToNumber(stkAppBalance), " ETH");

      let curAcc1TokenBalance = await d.getStakeAppContract().balanceOf(d.getAcc1().address);
      console.log("Acc1 Token Init Balance = ", curAcc1TokenBalance, " SEM");


      // No eth sending, cannot buy token
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(0)).to.be.revertedWith("Non-zero value needed to buy merit"); 
      // await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(-1)).to.be.revertedWith("Invalid merit");  cant set negative value cause uint8

      //  merit1 100 evmos => 1 * 100 * (10**18)
      let ethval = d.getBasePrice() * 100;

      // buy the first fixed price merit
      let meritid = d.getMerit1();

      let notcorrectpayment = "1";
      
      // merit id should be in range
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(d.getMerit3() + 1, { value: ethers.utils.parseEther(ethval.toString()) })).to.be.revertedWith("Invalid merit");
      
      // Buying merit but not correct amount of eth sent
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(notcorrectpayment) })).to.be.revertedWith("Merit payment not correct"); 

      // Buying merit and success, event is emitted
      let tokenid = 0;
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) }))
        .to.emit(d.getStakeAppContract(), "BuyMeritStake").withArgs(d.getAcc1().address, ethers.utils.parseEther(ethval.toString()), meritid, tokenid);

      // correct amount of merits
      expect(await d.getStakeAppContract().connect(d.getAcc1()).balanceOf(d.getAcc1().address)).to.equal(1);
      expect(await d.getStakeAppContract().tokenURI(tokenid)).to.equal(d.getMeritBaseUri() + "1.png");

      stkAppBalance = await ethers.provider.getBalance(d.getStakeAppContract().address);
      console.log("StkApp Balance after buying with 100 = ", d.convertToNumber(stkAppBalance), " ETH");

      // buy other fixed price merits
      ethval = d.getBasePrice() * 100 * 2;
      meritid = d.getMerit2();
      tokenid = 1;
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(notcorrectpayment) })).to.be.revertedWith("Merit payment not correct"); 
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) }))
      .to.emit(d.getStakeAppContract(), "BuyMeritStake").withArgs(d.getAcc1().address, ethers.utils.parseEther(ethval.toString()), meritid, tokenid);
      expect(await d.getStakeAppContract().connect(d.getAcc1()).balanceOf(d.getAcc1().address)).to.equal(2);
      expect(await d.getStakeAppContract().tokenURI(tokenid)).to.equal(d.getMeritBaseUri() + "2.png");

      stkAppBalance = await ethers.provider.getBalance(d.getStakeAppContract().address);
      console.log("StkApp Balance after buying with 200 = ", d.convertToNumber(stkAppBalance), " ETH");

      ethval = d.getBasePrice() * 100 * 3;
      meritid = d.getMerit3();
      tokenid = 2;
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(notcorrectpayment) })).to.be.revertedWith("Merit payment not correct"); 
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) }))
      .to.emit(d.getStakeAppContract(), "BuyMeritStake").withArgs(d.getAcc1().address, ethers.utils.parseEther(ethval.toString()), meritid, tokenid);
      expect(await d.getStakeAppContract().connect(d.getAcc1()).balanceOf(d.getAcc1().address)).to.equal(3);
      expect(await d.getStakeAppContract().tokenURI(tokenid)).to.equal(d.getMeritBaseUri() + "3.png");

      stkAppBalance = await ethers.provider.getBalance(d.getStakeAppContract().address);
      console.log("StkApp Balance after buying with 300 = ", d.convertToNumber(stkAppBalance), " ETH");

      let meritStat = await d.getStakeAppContract().connect(d.getAcc1()).getMeritStat(tokenid);  
      d.printMeritStat(meritStat);

      curAcc1TokenBalance = await d.getStakeAppContract().balanceOf(d.getAcc1().address);
      console.log("Acc1 Token Init Balance = ", curAcc1TokenBalance, " SEM");
      let semsOwnedBy = [];
      
      for (i = 0; i < curAcc1TokenBalance; i++) {
        sem = await d.getStakeAppContract().tokenOfOwnerByIndex(d.getAcc1().address, i);
        console.log("i=%d tokenId=%d", i, ethers.utils.formatUnits(sem, 0));
        //console.log(ethers.utils.formatUnits(sem, 0));
        semsOwnedBy.push(sem);
      }

      expect(await d.getStakeAppContract().connect(d.getOwner()).getRewardBalance()).to.equal(0);

    });

    it("Buy custom", async function () {    
      let curAcc1TokenBalance = await d.getStakeAppContract().balanceOf(d.getAcc1().address);
      console.log("Acc1 Token Init Balance = ", d.convertToNumber(curAcc1TokenBalance), " SEM");

      // No eth sending, cannot buy token
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(0)).to.be.revertedWith("Non-zero value needed to buy merit"); 
      // await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(-1)).to.be.revertedWith("Invalid merit");  cant set negative value cause uint8

      //  merit0 0.5 evmos => 0.5 * 1 * (10**18)
      let ethval = d.getBasePrice() * 0.5;

      // buy the first fixed price merit
      let meritid = d.getMeritCustom();
           
      // Buying merit and success, event is emitted
      let tokenid = 0;
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) }))
        .to.emit(d.getStakeAppContract(), "BuyMeritStake").withArgs(d.getAcc1().address, ethers.utils.parseEther(ethval.toString()), meritid, tokenid);

      // correct amount of merits
      expect(await d.getStakeAppContract().connect(d.getAcc1()).balanceOf(d.getAcc1().address)).to.equal(1);

      expect(await d.getStakeAppContract().tokenURI(tokenid)).to.equal(d.getMeritBaseUri() + "hithard.png");

      let meritStat = await d.getStakeAppContract().connect(d.getAcc1()).getMeritStat(tokenid);  
      d.printMeritStat(meritStat);
    
      // Already staked, try restake and then unstake
      await expect(d.getStakeAppContract().connect(d.getAcc1()).stakeMerit(tokenid)).to.be.revertedWith("Stake not possible: Not minted and not undelegated");
      await expect(d.getStakeAppContract().connect(d.getAcc1()).stakeMerit(5)).to.be.revertedWith("ERC721: invalid token ID");
      await d.getStakeAppContract().connect(d.getAcc1()).unstakeMerit(tokenid);
      meritStat = await d.getStakeAppContract().connect(d.getAcc1()).getMeritStat(tokenid);  
      d.printMeritStat(meritStat);
      expect(meritStat.state).to.equal(d.getMeritStateUndelegated());
    });

    it("User won with target 666 can mint its merit token and after claim cannot buy", async function () {
      expect(await d.getStakeAppContract().connect(d.getAcc1()).checkClaimOpMerit(d.getMeritL666())).to.equal(false);
      
      const crtNewGame = await d.getStakeAppContract().connect(d.getAcc1()).newGame();  
      const dbggame = await d.getStakeAppContract().setDebugGame(d.getAcc1().address, 666, 5, 4, 8, 9, 6, 3, 25, 50);
      // 9+4=13 13*50=650 8+5=13 13+3=16 650+16=666
      const v1 = await d.getStakeAppContract().connect(d.getAcc1()).verifyUserOperations
                  (1, 
                    [1,   3,   1,  1,   1], 
                    [9,   13,  8, 13, 650],  
                    [4,   50,  5,  3,  16], 
                    [13, 650, 13, 16, 666]);
      expect (await d.getStakeAppContract().getGameState(d.getAcc1().address)).to.equal(GameState.WON);  
      await expect(d.getStakeAppContract().connect(d.getAcc1()).claimOpMerit(d.getMeritL666()))
      .to.emit(d.getStakeAppContract(), "ClaimMerit").withArgs(d.getAcc1().address, 0, d.getMeritL666());

      expect(await d.getStakeAppContract().connect(d.getAcc1()).checkClaimOpMerit(d.getMeritL666())).to.equal(false);

      let ethval = d.getBasePrice() / 100 * 10;
      let meritid = d.getMeritL666();
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) })).to.be.revertedWith("Merit already claimed"); 

    });   

    it("Buy merit more", async function () {
      let game_bal = await ethers.provider.getBalance(d.getStakeAppContract().address);
      console.log("game has " + d.convertToNumber(game_bal) + " ETH");

      let ethval =d.getBasePrice() / 100 * 20;
      let meritid = d.getMeritL888();
      let toteth = ethval;
      expect(await d.getStakeAppContract().connect(d.getAcc1()).checkClaimOpMerit(meritid)).to.equal(false);
      
      // Buying first merit and success, event is emitted
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) }))
            .to.emit(d.getStakeAppContract(), "BuyMeritStake").withArgs(d.getAcc1().address, ethers.utils.parseEther(ethval.toString()), meritid, 0);

      expect(await d.getStakeAppContract().connect(d.getAcc1()).checkClaimOpMerit(meritid)).to.equal(false);

      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) })).to.be.revertedWith("Merit already claimed"); 

      ethval = d.getBasePrice() / 100 * 2;
      meritid = d.getMeritWo10();
      toteth = toteth + ethval;
     
      // Buying second merit and success, event is emitted
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) }))
            .to.emit(d.getStakeAppContract(), "BuyMeritStake").withArgs(d.getAcc1().address, ethers.utils.parseEther(ethval.toString()), meritid, 1);

      expect(await d.getStakeAppContract().connect(d.getAcc1()).checkClaimOpMerit(meritid)).to.equal(false);
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) })).to.be.revertedWith("Merit already claimed"); 
 
      game_bal = await ethers.provider.getBalance(d.getStakeAppContract().address);
      console.log("game has " + d.convertToNumber(game_bal) + " ETH");
      expect(await ethers.provider.getBalance(d.getStakeAppContract().address)).to.equal(ethers.utils.parseEther(toteth.toString()));  
      

    });   

    it("Set price buy merit", async function () {    
      let acc1_bal = await ethers.provider.getBalance(d.getAcc1().address);
      console.log("Account 1 has " + d.convertToNumber(acc1_bal) + " ETH");

      // No eth sending, cannot buy token
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(0)).to.be.revertedWith("Non-zero value needed to buy merit"); 
      // await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(-1)).to.be.revertedWith("Invalid merit");  cant set negative value cause uint8

      //  meritwon 0.05 eth      => 5 * 1 * (10**16)

      let newbaseprice = 1000;
      let ethval = newbaseprice;
      let meritid = d.getMeritWon();

      await d.getStakeAppContract().setBasePrice(newbaseprice);

      // merit id should be in range
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(d.getMeritL666() + 1, { value: ethers.utils.parseEther(ethval.toString()) })).to.be.revertedWith("Invalid merit");
      
      // Buying merit but not correct amount of eth sent
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther("0.06") })).to.be.revertedWith("Merit payment not correct"); 

      // Buying merit and success, event is emitted
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) }))
        .to.emit(d.getStakeAppContract(), "BuyMeritStake").withArgs(d.getAcc1().address, ethers.utils.parseEther(ethval.toString()), meritid, 0);

      // correct amount of merits
      expect(await d.getStakeAppContract().connect(d.getAcc1()).balanceOf(d.getAcc1().address)).to.equal(1);
      expect(await d.getStakeAppContract().connect(d.getAcc1()).checkClaimOpMerit(meritid)).to.equal(false);

      // Cant buy already bought or claimed merit, note: merits can be set to other accounts but still is claimed in storage
      await expect(d.getStakeAppContract().connect(d.getAcc1()).buyMeritStake(meritid, { value: ethers.utils.parseEther(ethval.toString()) })).to.be.revertedWith("Merit already claimed"); 

    });

  });
});