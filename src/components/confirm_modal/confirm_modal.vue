<template>
  <dialog-modal
    v-body-scroll-lock="true"
    class="confirm-modal"
    :on-cancel="onCancel"
  >
    <template #header>
      <span v-text="title" />
    </template>

    <slot />

    <template #footer>
      <button
        class="btn button-default"
        @click.prevent="onCancel"
        v-text="cancelText"
      />
      <button
        class="btn button-default button-positive"
        @click.prevent="onAccept"
        v-text="confirmText"
      />
    </template>
  </dialog-modal>
</template>

<script src="./confirm_modal.js"></script>

<style lang="scss" scoped>
@import '../../_variables';

.confirm-modal {
  .button-positive {
    border: 3px solid var(--accent, $fallback--link);
    border-radius: var(--btnRadius, $fallback--btnRadius);
  }
}
</style>
