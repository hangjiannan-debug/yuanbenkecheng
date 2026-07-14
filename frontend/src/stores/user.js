import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, register as apiRegister } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const login = async (username, password) => {
    const res = await apiLogin(username, password)
    setToken(res.access_token)
    setUserInfo({
      user_id: res.user_id,
      username: res.username,
      role: res.role,
      kinder_id: res.kinder_id,
    })
    return res
  }

  const register = async (username, password, role, kinderName) => {
    const res = await apiRegister(username, password, role, kinderName)
    setToken(res.access_token)
    setUserInfo({
      user_id: res.user_id,
      username: res.username,
      role: res.role,
      kinder_id: res.kinder_id,
    })
    return res
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    login,
    register,
    logout,
  }
})
