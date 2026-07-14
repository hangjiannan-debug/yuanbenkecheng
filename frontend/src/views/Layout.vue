<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="logo">园本课程建设平台</div>
        <el-menu mode="horizontal" :default-active="activeMenu" router>
          <el-menu-item index="/curriculum">园本课程建设</el-menu-item>
          <el-menu-item index="/course">课程生成</el-menu-item>
          <el-menu-item index="/my-curriculum">我的园本课程</el-menu-item>
        </el-menu>
        <div class="user-info">
          <span>{{ userStore.userInfo.username }}</span>
          <el-button type="text" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-right: 40px;
}

.el-menu {
  border-bottom: none;
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  background: #f5f5f5;
  padding: 20px;
}
</style>
