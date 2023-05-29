import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'




const orderSlice = createSlice({
  name: "order", // type: order/set
  initialState: {
    CancelOrders: [], // 取消的订单  
    FillOrders: [], // 完成的订单
    AllOrders: [] // 所有的订单
  },

  reducers: {
    setCancelOrders (state, action) {
      state.CancelOrders = action.payload
    },
    setFillOrders (state, action) {
      state.FillOrders = action.payload
    },
    setAllOrders (state, action) {
      state.AllOrders = action.payload
    }
  }


})

export const { setCancelOrders, setFillOrders, setAllOrders } = orderSlice.actions

export default orderSlice.reducer
// orderSlice.action


export const loadCancelOrderData = createAsyncThunk(
  "order/fetchCancelOrderData",
  async (data, { dispatch }) => {
    const { exchange } = data
    // console.log(await exchange.methods.orders(1).call())

    // 获取所有取消的事件,Exchange合约发出的取消交易事件
    const result = await exchange.getPastEvents("Cancel", {
      fromBlock: 0, // 从区块0开始查询
      toBlock: "latest" // 到最新的区块，只查询Cancel事件
    })

    const cancelOrder = result.map(item => item.returnValues)

    console.log("cancelOrder：", cancelOrder)

    dispatch(setCancelOrders(cancelOrder))
  }
)

export const loadAllOrderData = createAsyncThunk(
  "order/fetchAllOrderData",
  async (data, { dispatch }) => {
    const { exchange } = data
    // console.log(await exchange.methods.orders(1).call())

    // 获取所有取消的事件,Exchange合约发出的取消交易事件
    const result = await exchange.getPastEvents("Order", {
      fromBlock: 0, // 从区块0开始查询
      toBlock: "latest" // 到最新的区块，只查询Order事件
    })

    const allOrder = result.map(item => item.returnValues)

    console.log("allOrder：", allOrder)

    dispatch(setAllOrders(allOrder))
  }
)

export const loadFillOrderData = createAsyncThunk(
  "order/fetchFillOrderData",
  async (data, { dispatch }) => {
    const { exchange } = data
    // console.log(await exchange.methods.orders(1).call())

    // 获取所有取消的事件,Exchange合约发出的取消交易事件
    const result = await exchange.getPastEvents("Trade", {
      fromBlock: 0, // 从区块0开始查询
      toBlock: "latest" // 到最新的区块，只查询Order事件
    })

    const fillOrder = result.map(item => item.returnValues)

    console.log("fillOrder：", fillOrder)

    dispatch(setFillOrders(fillOrder))
  }
)