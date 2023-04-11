import GameVue from '@/pages/Game.vue'
import HomeVue from '@/pages/Home.vue'
import RegisterVue from '@/pages/Register.vue'
import SignInVue from '@/pages/SignIn.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: HomeVue },
  { path: '/register', component: RegisterVue },
  { path: '/sign-in', component: SignInVue },
  { path: '/game/', component: GameVue, meta: { requiresAuth: true } },
  { path: '/game/:id', component: GameVue, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener()
        resolve(user)
      },
      reject,
    )
  })
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router