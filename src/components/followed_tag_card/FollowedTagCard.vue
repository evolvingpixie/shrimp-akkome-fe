<template>
  <div class="followed-tag-card">
    <h3>
      <router-link :to="{ name: 'tag-timeline', params: {tag: tag.name}}">
        #{{ tag.name }}
      </router-link>
    </h3>
  </div>
</template>

<script>
export default {
  name: 'FollowedTagCard',
  props: {
    tag: {
      type: Object,
      required: true
    }
  },
}
</script>

<style scoped>
.followed-tag-card {
  margin-left: 1rem;
}
</style>
