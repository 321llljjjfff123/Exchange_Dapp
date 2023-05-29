/*
 * @作者: kerwin
 */
const LToken = artifacts.require("LToken.sol")
const Exchange = artifacts.require("Exchange.sol")
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // 0x 后面 40 个 0


const fromWei = (bn) => {
  return web3.utils.fromWei(bn, "ether")
}

const toWei = (number) => {
  return web3.utils.toWei(number.toString(), "ether")
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}


module.exports = async function (callback) {
  try {
    const lToken = await LToken.deployed()
    const exchange = await Exchange.deployed()
    const accounts = await web3.eth.getAccounts()

    //第一步account0---->account1 10w
    await lToken.transfer(accounts[1], toWei(100000), {
      from: accounts[0]
    })

    //第二步account0 ---》交易所存入  100以太币
    await exchange.depositEther({
      from: accounts[0],
      value: toWei(100)
    })
    let res1 = await exchange.tokens(ETHER_ADDRESS, accounts[0])
    console.log("account[0]-在交易所的以太币", fromWei(res1))

    //第二步account0 ---》交易所存入  100000L
    await lToken.approve(exchange.address, toWei(100000), {
      from: accounts[0]
    })
    await exchange.depositToken(lToken.address, toWei(100000), {
      from: accounts[0]
    })

    let res2 = await exchange.tokens(lToken.address, accounts[0])
    console.log("account[0]-在交易所的L", fromWei(res2))


    //第三步account1 ---》交易所存入  50以太币
    await exchange.depositEther({
      from: accounts[1],
      value: toWei(50)
    })
    let res3 = await exchange.tokens(ETHER_ADDRESS, accounts[1])
    console.log("account[1]-在交易所的以太币", fromWei(res3))

    //第三步account1 ---》交易所存入  50000L
    await lToken.approve(exchange.address, toWei(50000), {
      from: accounts[1]
    })
    await exchange.depositToken(lToken.address, toWei(50000), {
      from: accounts[1]
    })

    let res4 = await exchange.tokens(lToken.address, accounts[1])
    console.log("account[1]-在交易所的L", fromWei(res4))

    let orderId = 0
    let res

    //创建订单
    res = await exchange.makeOrder(lToken.address, toWei(1000), ETHER_ADDRESS, toWei(0.1), { from: accounts[0] })

    orderId = res.logs[0].args.id
    console.log("创建一个订单")
    await wait(1)
    //取消订单
    res = await exchange.makeOrder(lToken.address, toWei(2000), ETHER_ADDRESS, toWei(0.2), { from: accounts[0] })

    orderId = res.logs[0].args.id

    await exchange.cancelOrder(orderId, { from: accounts[0] })
    console.log("取消一个订单")
    await wait(1)
    //完成订单
    res = await exchange.makeOrder(lToken.address, toWei(3000), ETHER_ADDRESS, toWei(0.3), { from: accounts[0] })

    orderId = res.logs[0].args.id

    await exchange.fillOrder(orderId, { from: accounts[1] })
    console.log("完成一个订单")



    console.log("account[0]-在交易所的L", fromWei(await exchange.tokens(lToken.address, accounts[0])))
    console.log("account[0]-在交易所的以太币", fromWei(await exchange.tokens(ETHER_ADDRESS, accounts[0])))

    console.log("account[1]-在交易所的L", fromWei(await exchange.tokens(lToken.address, accounts[1])))
    console.log("account[1]-在交易所的以太币", fromWei(await exchange.tokens(ETHER_ADDRESS, accounts[1])))
    console.log("account[2]-在交易所的L", fromWei(await exchange.tokens(lToken.address, accounts[2])))
  } catch (error) {
    console.log(error)
  }

  callback()
}