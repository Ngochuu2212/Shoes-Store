import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    favoriteIds: []
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.userInfo = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
    },
    logoutSuccess: (state) => {
      state.userInfo = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.favoriteIds = []
    },
    setFavorites: (state, action) => {
      state.favoriteIds = action.payload
    },
    addToFavorites: (state, action) => {
      if (!state.favoriteIds.includes(action.payload)) {
        state.favoriteIds.push(action.payload)
      }
    },
    removeFromFavorites: (state, action) => {
      state.favoriteIds = state.favoriteIds.filter(id => id !== action.payload)
    },
    updateUserFields: (state, action) => {
      state.userInfo = {
        ...state.userInfo,
        ...action.payload
      }
    }
  }
})

export const { loginSuccess, logoutSuccess, setFavorites,
  addToFavorites, removeFromFavorites, updateUserFields } = userSlice.actions
export default userSlice.reducer