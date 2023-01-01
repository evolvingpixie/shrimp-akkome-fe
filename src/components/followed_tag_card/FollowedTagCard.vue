<template>
  <div class="followed-tag-card">
    <span>
      <router-link :to="{ name: 'tag-timeline', params: {tag: tag.name}}">
        <span class="tag-link">#{{ tag.name }}</span>
      </router-link>
      <span class="unfollow-tag">
        <button
          v-if="isFollowing"
          class="button-default unfollow-tag-button"
          :title="$t('user_card.unfollow_tag')"
          @click="unfollowTag(tag.name)"
        >
          {{ $t('user_card.unfollow_tag') }}
        </button>
        <button
          v-else
          class="button-default follow-tag-button"
          :title="$t('user_card.follow_tag')"
          @click="followTag(tag.name)"
        >
          {{ $t('user_card.follow_tag') }}
        </button>
      </span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'FollowedTagCard',
  props: {
    tag: {
      type: Object,
      required: true
    },
  },
  // this is a hack to update the state of the button
  // for some reason, List does not update on changes to the tag object
  data: () => ({
    isFollowing: true
  }),
  mounted () {
    this.isFollowing = this.tag.following
  },
  methods: {
    unfollowTag (tag) {
      this.$store.dispatch('unfollowTag', tag)
      this.isFollowing = false
    },
    followTag (tag) {
      this.$store.dispatch('followTag', tag)
      this.isFollowing = true
    }
  }
}
</script>

<style scoped>
  .followed-tag-card {
    margin-left: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .unfollow-tag {
    position: absolute;
    right: 1rem;
  }

  .tag-link {
    font-size: large;
  }

  .unfollow-tag-button, .follow-tag-button {
    font-size: medium;
  }
</style>
