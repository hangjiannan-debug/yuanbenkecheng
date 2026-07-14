import api from './index'

export const createCourse = (planId, theme) => {
  return api.post('/course/contents', { plan_id: planId, theme })
}

export const listCourses = (planId) => {
  return api.get(`/course/contents/plan/${planId}`)
}

export const createRecord = (courseId, recordData) => {
  return api.post('/course/records', { course_id: courseId, ...recordData })
}

export const listRecords = (courseId) => {
  return api.get(`/course/records/course/${courseId}`)
}

export const chatWithAI = (messages, maxTokens = 4000) => {
  return api.post('/chat', { messages, max_tokens: maxTokens })
}
