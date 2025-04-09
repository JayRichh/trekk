import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { supabase } from '../lib/supabase';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/trails',
    name: 'Trails',
    component: () => import('../views/Trails.vue'),
  },
  {
    path: '/trails/:id',
    name: 'TrailDetail',
    component: () => import('../views/TrailDetail.vue'),
    props: true,
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('../views/Map.vue'),
  },
  // Authentication routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/auth/Signup.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/auth/ForgotPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/auth/ResetPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/auth/Profile.vue'),
    meta: { requiresAuth: true }
  },
  // Sitemap route
  {
    path: '/sitemap.xml',
    name: 'SitemapXml',
    component: () => import('../views/SitemapXml.vue'),
    meta: { sitemap: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards for authentication
router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession();
  const isLoggedIn = !!data.session;

  // Routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } 
  // Routes that require guest (non-authenticated) access
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isLoggedIn) {
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
