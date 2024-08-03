<template>
  <Modal
    v-if="modalActivated"
    class="status-history-modal-view"
    @backdrop-clicked="closeModal"
  >
    <div class="status-history-modal-panel panel">
      <div class="panel-heading">
        {{ $tc('status.edit_history_modal_title', historyCount - 1, { historyCount: historyCount - 1 }) }}
      </div>
      <div class="panel-body">
        <div
          v-if="historyCount > 0"
          class="history-body"
        >
          <status
            v-for="status in history"
            :key="status.id"
            :statusoid="status"
            :is-preview="true"
            class="conversation-status status-fadein panel-body"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script src="./status_history_modal.js"></script>

<style lang="scss">
.modal-view.status-history-modal-view {
  align-items: flex-start;
}
.status-history-modal-panel {
  flex-shrink: 0;
  margin-top: 25%;
  margin-bottom: 2em;
  width: 100%;
  max-width: 700px;

  @media (orientation: landscape) {
    margin-top: 8%;
  }
}
</style>
