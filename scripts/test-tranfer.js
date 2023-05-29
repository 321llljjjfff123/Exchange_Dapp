/*
 * @作者: kerwin
 */
const LToken = artifacts.require("LToken.sol")

const fromWei = (bn) => {
  return web3.utils.fromWei(bn, "ether")
}

const toWei = (number) => {
  return web3.utils.toWei(number.toString(), "ether")
}

module.exports = async function (callback) {
  const lToken = await LToken.deployed()
  const accounts = await web3.eth.getAccounts() // 获取当前区块链上的所有账户（ganache上有十个）

  let res1 = await lToken.balanceOf(accounts[0])

  console.log("第一个账号", fromWei(res1))

  await lToken.transfer(accounts[1], toWei(10000), {
    from: accounts[0]
  })

  let res2 = await lToken.balanceOf(accounts[0])

  console.log("第一个账号", fromWei(res2))

  let res3 = await lToken.balanceOf(accounts[1])

  console.log("第二个账号", fromWei(res3))
  callback()
}