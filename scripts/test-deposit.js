/*
* @作者：飞
*/
const LToken = artifacts.require("LToken.sol")
const Exchange = artifacts.require("Exchange.sol")
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // 0x 后面 40 个 0

const fromWei = (bn) => web3.utils.fromWei(bn, "ether")

const toWei = (number) => web3.utils.toWei(number.toString(), "ether")


module.exports = async function (callback) {
  const lToken = await LToken.deployed()
  const exchange = await Exchange.deployed()
  const accounts = await web3.eth.getAccounts() // 获取当前区块链上的所有账户（ganache上有十个）
  // 存以太币
  await exchange.depositEther({
    from: accounts[0],
    value: toWei(10)
  })

  let res_e = await exchange.tokens(ETHER_ADDRESS, accounts[0])
  console.log("ETH：", fromWei(res_e))



  // 存其他货币
  // 授权
  await lToken.approve(exchange.address, toWei(100000), {
    from: accounts[0]
  }) // 授权10万LToken币

  await exchange.depositToken(lToken.address, toWei(100000), {
    from: accounts[0]
  })

  let res = await exchange.tokens(lToken.address, accounts[0])
  console.log("L:", fromWei(res))

  callback()
}