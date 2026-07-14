import api from './index'

export const login = (username, password) => {
  return api.post('/auth/login', { username, password })
}

export const register = (username, password, role, kinderName) => {
  return api.post('/auth/register', {
    username,
    password,
    role,
    kinder_name: kinderName,
  })
}

export const getCurrentUser = () => {
  return api.get('/auth/me')
}
