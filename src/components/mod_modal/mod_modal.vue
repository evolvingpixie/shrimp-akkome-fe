<template>
  <Modal
    v-if="moderator"
    :is-open="modalActivated"
    class="mod-modal"
    :class="{ peek: modalPeeked }"
    :no-background="modalPeeked"
  >
    <div class="mod-modal-panel panel">
      <div class="panel-heading">
        <span class="title">
          {{ $t('moderation.moderation') }}
        </span>
        <button
          class="btn button-default"
          :title="$t('general.peek')"
          @click="peekModal"
        >
          <FAIcon
            :icon="['far', 'window-minimize']"
            fixed-width
          />
        </button>
        <button
          class="btn button-default"
          :title="$t('general.close')"
          @click="closeModal"
        >
          <FAIcon
            icon="times"
            fixed-width
          />
        </button>
      </div>
      <div class="panel-body">
        <ModModalContent v-if="modalOpenedOnce" />
      </div>
    </div>
  </Modal>
</template>

<script src="./mod_modal.js"></script>
<style src="./mod_modal.scss" lang="scss"></style>
