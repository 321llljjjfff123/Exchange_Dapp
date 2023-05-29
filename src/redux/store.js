import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import orderSlice from './slices/orderSlice'
import balanceSlice from './slices/balanceSlice'

const store = configureStore({
  reducer: {
    // 余额的reducer
    balance: balanceSlice,
    // 订单reducer
    order: orderSlice
  },

  // middleware: ...
  // 取消检查序列化（因为rudux存储非序列化，会报错）
  middleware: getDefaultMiddleware => getDefaultMiddleware({ // 对中间件传入一个对象，重新进行配置，将序列化检查配置为false
    serializableCheck: false
  })

})

export default store