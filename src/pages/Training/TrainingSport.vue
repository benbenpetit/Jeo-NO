<template>
  <div>
    <component :is="dynamicSportComponent" />
  </div>
</template>

<script setup lang="ts">
import Skate from '@/pages/Training/Sports/Skate.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const dynamicSportComponent = computed(() => {
  switch (route?.params?.sportSlug) {
    case 'break':
      return Skate
    case 'climbing':
      return Skate
    case 'skate':
      return Skate
    case 'surf':
      return Skate
    default:
      return () => {
        router.replace('/training')
      }
  }
})
</script>
