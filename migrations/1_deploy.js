/*
* @作者 飞
*/

const Contacts = artifacts.require('LToken.sol')
const Exchange = artifacts.require('Exchange.sol')

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts() // 获取当前区块链上的所有账户（ganache上有十个）

  await deployer.deploy(Contacts)
  await deployer.deploy(Exchange, accounts[0], 10) // (智能合约，收费账号的地址， 费率)
}