import { createRouter, createWebHistory } from 'vue-router'
import formAntrian from '@/pages/FormAntrian.vue'
import hasilView from '@/pages/HasilAntrian.vue'

const routes = [
  {
    path: '/',
    component: formAntrian
  },
  {
    path: '/hasil',
    component: () => import('@/pages/HasilAntrian.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
