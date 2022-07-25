<template>
  <Status
    v-if="status"
    :is-preview="true"
    :statusoid="status"
    :compact="true"
  />
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  name: 'QuoteCardContent',
  components: {
    Status: defineAsyncComponent(() => import('../status/status.vue'))
  },
  props: [
    'status'
  ]
}
</script>
