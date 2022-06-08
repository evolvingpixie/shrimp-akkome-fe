<template>
  <button
    class="btn button-default follow-button"
    :class="{ toggled: isPressed }"
    :disabled="disabled"
    :title="title"
    @click="onClick"
  >
    {{ label }}
  </button>
</template>

<script src="./follow_button.js"></script>
