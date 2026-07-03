import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import cartReducer from './user/cartSlice'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'

// 1. Cấu hình các thiết lập cho Redux Persist
const persistConfig = {
  key: 'root',
  storage: {
    getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key))
  },
  whitelist: ['user', 'cart']
}

// 2. Gom tất cả các reducers lại
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer
})

// 3. Tạo một reducer đã được bọc tính năng Persist
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 4. Khởi tạo Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

// 5. Khởi tạo đối tượng persistor
export const persistor = persistStore(store)