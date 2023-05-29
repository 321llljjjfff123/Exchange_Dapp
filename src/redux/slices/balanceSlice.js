import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // eth的地址：0x 后面 40 个 0


const balanceSlice = createSlice({
  name: "balance", // type: balance/get
  initialState: {
    TokenWallet: "0", // 钱包的钱 // wei转换， 需要字符串， 不是数字0
    TokenExchange: "0", // 交易所的token
    EtherWallet: "0", // 以太币钱包的钱
    EtherExchange: "0" // 以太币交易所的钱
  },

  reducers: {
    setTokenWallet (state, action) {
      state.TokenWallet = action.payload
    },
    setExchange (state, action) {
      state.TokenExchange = action.payload
    },
    setEtherWallett (state, action) {
      state.EtherWallet = action.payload
    },
    setEtherExchange (state, action) {
      state.EtherExchange = action.payload
    }

  }


})

export const { setTokenWallet, setExchange, setEtherWallett, setEtherExchange } = balanceSlice.actions

export default balanceSlice.reducer
// balanceSlice.action


export const loadBalancedate = createAsyncThunk(
  "balance/fetchBalanceData",
  async (date, { dispatch }) => {
    console.log(date)
    const { web3, account, token, exchange } = date

    // 获取钱包的token
    const TokenWallet = await token.methods.balanceOf(account).call()
    // call读取链上的数据，不消耗gas，send发送数据上链，消耗gas

    // console.log(TokenWallet)

    dispatch(setTokenWallet(TokenWallet))

    // 获取交易所的token

    const TokenExchange = await exchange.methods.balanceOf(token.options.address, account).call()

    // console.log(TokenExchange)

    dispatch(setExchange(TokenExchange))

    // 获取钱包的 ether

    const EtherWallet = await web3.eth.getBalance(account) // 此时不能调用call()

    console.log(EtherWallet)

    dispatch(setEtherWallett(EtherWallet)) // 现在这样调用的（以前是这样：// dispatch一个action到reducer中，reducer纯函数的设计，reducer不能直接修改，必须要进行一个深复制，返回一个全新的reducer，如此状态就更新了）

    // 获取交易所的 ether

    const EtherExchange = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()

    // console.log(EtherExchange)

    dispatch(setEtherExchange(EtherExchange))


  }
)
