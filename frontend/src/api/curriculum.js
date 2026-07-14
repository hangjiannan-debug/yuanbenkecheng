import api from './index'

export const createPlan = (planData) => {
  return api.post('/curriculum/plans', planData)
}

export const listPlans = () => {
  return api.get('/curriculum/plans')
}

export const getPlan = (planId) => {
  return api.get(`/curriculum/plans/${planId}`)
}

export const deletePlan = (planId) => {
  return api.delete(`/curriculum/plans/${planId}`)
}
