var contract = artifacts.require("./Project.sol");

module.exports = function(deployer) {
  deployer.deploy(contract, "0xaaffaaffaaaaffaaffaaaaffaaffaaaaffaaffaa", 1000, 20, 3);
};
