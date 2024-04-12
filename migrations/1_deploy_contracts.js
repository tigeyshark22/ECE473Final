const LUSD = artifacts.require("LUSD"); 
const TIGER = artifacts.require("TIGER"); 
const ARB = artifacts.require("Arbitrage");
module.exports = function (deployer) { 
  deployer.deploy(LUSD);
  deployer.deploy(TIGER);
  deployer.deploy(ARB);
}; 