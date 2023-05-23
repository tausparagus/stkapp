# STAKE-n-MORE


Leverage your EVMOS by staking, employs programmable EVMOS extensions

Get unique NFT token (SEM) for each of your stake bundle

Use SEM for various applications (DeFi, Ticket, and more)

Experience the app in EVMOS test network: https://piefun.github.io/stkapp/

Get EVMOS test tokens: https://faucet.evmos.dev/

Watch demo: https://youtu.be/WWFl_VY5v2E

# What are EVMOS EVM Extensions?
See https://github.com/evmos/extensions

Evmos’ unique implementation of stateful precompiles are called EVM Extensions.
For the first time, this will allow not only blockchains
but also individual applications to leverage and customize
the functionality of IBC and other Cosmos SDK modules.
Thus, these extensions push the EVM’s capabilities
past its original specification without breaking equivalence with Ethereum’s execution layer.
With the use of EVM Extensions, developers will be able to create their own business logic
for connecting with other smart contracts and app chains in the Cosmos ecosystem.
Applications will be freed from the confines of a single blockchain
and able to make smart contract calls to IBC modules to communicate with other chains,
send and receive assets between chains trustlessly, stake EVMOS tokens,
and even manage accounts on other blockchains to access any functionality built elsewhere.

# How to build:
Clone repository
"npm install" to install dependencies

# How to compile contracts:
npx hardhat compile

Some warnings may appear from included openzeppelin contracts. 

# How to test contract under ./test:
Each test script deploys contracts to local hardhat node by using tdeploy.js.
Note that EVMOS extension cannot be tested in local hardhat ETH node

tdeploy.js: Deploys stkapp contract.

npx hardhat test ./test/tmerit3.js

# Run local Hardhat test chain:
"npx hardhat node" to run your test chain

# How to test in your local hardhat test node:
1- open terminal, start node: "npx hardhat node"

2- new terminal, deploy your contracts locally: npx hardhat run --network localhost scripts/deploy.js

See your contract address in the node terminal 

3- Start your webserver to run your frontend webpage

cd frontend; node ..\node_modules\http-server\bin\http-server

./frontend/app.js has contract address needed for the web to run, make sure those address is the same from step 2.

in browser open: http://127.0.0.1:8080  => index.html from ./frontend is loaded with javascript files

in browser metamask: add hardhat test network: 127.0.0.1:8545

in browser metamask add your hardhat test accounts so that you can connect to the app: npx hardhat accounts

in browser app page: connect to app, and start staking

In local accounts make sure to reset account in advanced settings of metamaks the first time you interact

# App is deployed to EVMOS Test chain:
stkapp contract: 0x3F3b706407bB2d51312475D1d24e801fF70405BE 

To use EVMOS test contract addresses, make sure to set isEvmosTest = true; in ./frontend/app.js

# Development notes:
./ StkApp.sol: main entry, inherits ERC721-NFT (SEM) token and AppLogic

./logic/AppLogic.sol: handles  ERC721 along with staking-distribution

./extension/manager/ExtensionManager.sol: abstraction to precompiled fncs

./precompiles: Contains contracts to interact with EVMOS precompile extensions

# How to deploy to EVMOS test chain:
Go to remix page

https://remix.ethereum.org/#lang=en&optimize=true&runs=200

In Solidity compiler menu on the left enable optimization with 200 runs on the advanced configuration setting

Create a blank workspace and copy soliditiy files from this repository to Remix and compile

In Solidity deploy menu on the left select environment Injected provider-Metamask

Make sure in Metamask EVMOS test chain is selected

The account connected to Remix is your owner account for the contracts

Make sure the account has enough EVMOS to create transactions

Deploy your contract from this menu by providing constructor inputs for eact contract

In another account, stake evmos as a user

