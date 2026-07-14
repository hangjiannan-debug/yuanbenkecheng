import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/curriculum',
    children: [
      {
        path: 'curriculum',
        name: 'Curriculum',
        component: () => import('@/views/Curriculum.vue'),
        meta: { title: '园本课程建设' },
      },
      {
        path: 'course',
        name: 'Course',
        component: () => import('@/views/Course.vue'),
        meta: { title: '课程生成' },
      },
      {
        path: 'my-curriculum',
        name: 'MyCurriculum',
        component: () => import('@/views/MyCurriculum.vue'),
        meta: { title: '我的园本课程' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.path !== '/login' && to.path !== '/register' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
