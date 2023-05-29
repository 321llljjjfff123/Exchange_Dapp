import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Web3 from 'web3'
import tokenjson from '../build/LToken.json'
import exchangejson from '../build/Exchange.json'
import Balance from './Banlance'
import Order from './Order'
import { loadBalancedate } from '../redux/slices/balanceSlice'
import { loadCancelOrderData, loadAllOrderData, loadFillOrderData } from "../redux/slices/orderSlice"



export default function Contene () {
  const dispatch = useDispatch()
  useEffect(() => {
    async function start () {
      // 1. 获取连接合约后的合约
      const web = await initweb()
      console.log(web)
      window.web = web // 全局对象

      /* 
      共享web实例（跨级通信）

      redux不可以，因为redux对于非序列化对象（基于对象创建的实例，对象里是原型调用原型），及不可序列化对象，存在redux中间件时会报错，redux官方说可以关闭序列化检查，但可能会出现一些问题    
      // 1. useContext, useReducer
      // 2.订阅发布
      // 3.设置成全局  教程
      */

      // 2. 获取资产信息
      dispatch(loadBalancedate(web))

      // 3. 获取订单信息
      dispatch(loadCancelOrderData(web))
      dispatch(loadAllOrderData(web))
      dispatch(loadFillOrderData(web))


      // 监听（只要有新的事件发出来，回调中就会有通知）
      web.exchange.events.Order({}, (error, event) => {
        dispatch(loadFillOrderData(web))
      })
      web.exchange.events.Cancel({}, (error, event) => {
        dispatch(loadCancelOrderData(web))
      })
      web.exchange.events.Trade({}, (error, event) => {
        dispatch(loadFillOrderData(web))
        dispatch(loadBalancedate(web))
      })
    }
    start()
  }, [dispatch])

  async function initweb () {
    var web3 = new Web3(Web3.givenProvider || "http://localhost:8545")

    // 授权
    let accounts = await web3.eth.requestAccounts()
    console.log(accounts[0])


    // 获取networkId
    const networkId = await web3.eth.net.getId()


    // Ltoken
    // 获取abi
    const tokenabi = tokenjson.abi
    // console.log(networkId)
    // 获取合约地址
    const tokenaddress = tokenjson.networks[networkId].address
    // console.log(tokenaddress)
    // 连接智能合约
    const token = await new web3.eth.Contract(tokenabi, tokenaddress)
    // console.log(token)

    // Exchange
    // 获取abi
    const exchangeabi = exchangejson.abi
    const exchangeaddress = exchangejson.networks[networkId].address
    // console.log(tokenaddress)
    // 连接智能合约
    const exchange = await new web3.eth.Contract(exchangeabi, exchangeaddress)
    // console.log(exchange)
    return {
      web3,
      account: accounts[0],
      token,
      exchange
    }
  }

  return (
    <div style={{ padding: "10px" }}>

      <Balance></Balance>
      <Order></Order>
      未完成还有存款，取款，创建订单
    </div>

  )
}