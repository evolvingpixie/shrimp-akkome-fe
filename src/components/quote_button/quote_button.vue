<template>
  <div
    v-if="(visibility === 'public' || visibility === 'unlisted') && loggedIn"
    class="QuoteButton"
  >
    <button
      class="button-unstyled interactive"
      :class="{'-active': quoting}"
      :title="$t('tool_tip.quote')"
      @click.prevent="$emit('toggle')"
    >
      <FAIcon
        class="fa-scale-110 fa-old-padding"
        icon="quote-left"
      />
    </button>
  </div>
</template>

<script src="./quote_button.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.QuoteButton {
  display: flex;

  > :first-child {
    padding: 10px;
    margin: -10px -8px -10px -10px;
  }

  .action-counter {
    pointer-events: none;
    user-select: none;
  }

  .interactive {
    &:hover .svg-inline--fa,
    &.-active .svg-inline--fa {
      color: $fallback--cBlue;
      color: var(--cBlue, $fallback--cBlue);
    }
  }

}
</style>
