<template>
  <button
    class="btn button-default follow-button"
    :class="{ toggled: inProgress }"
    :disabled="inProgress"
    :title="$t('user_card.remove_follower')"
    @click="onClick"
  >
    {{ label }}
  </button>
</template>

<script src="./remove_follower_button.js"></script>
