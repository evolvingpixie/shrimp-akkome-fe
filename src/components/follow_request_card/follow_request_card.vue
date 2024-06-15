<template>
  <basic-user-card
    v-if="show"
    :user="user"
  >
    <div class="follow-request-card-content-container">
      <button
        class="btn button-default"
        @click="approveUser"
      >
        {{ $t('user_card.approve') }}
      </button>
      <button
        class="btn button-default"
        @click="denyUser"
      >
        {{ $t('user_card.deny') }}
      </button>
    </div>
    <teleport to="#modal">
      <confirm-modal
        v-if="showingApproveConfirmDialog"
        :title="$t('user_card.approve_confirm_title')"
        :confirm-text="$t('user_card.approve_confirm_accept_button')"
        :cancel-text="$t('user_card.approve_confirm_cancel_button')"
        @accepted="doApprove"
        @cancelled="hideApproveConfirmDialog"
      >
        {{ $t('user_card.approve_confirm', { user: user.screen_name_ui }) }}
      </confirm-modal>
      <confirm-modal
        v-if="showingDenyConfirmDialog"
        :title="$t('user_card.deny_confirm_title')"
        :confirm-text="$t('user_card.deny_confirm_accept_button')"
        :cancel-text="$t('user_card.deny_confirm_cancel_button')"
        @accepted="doDeny"
        @cancelled="hideDenyConfirmDialog"
      >
        {{ $t('user_card.deny_confirm', { user: user.screen_name_ui }) }}
      </confirm-modal>
    </teleport>
  </basic-user-card>
</template>

<script src="./follow_request_card.js"></script>

<style lang="scss">
.follow-request-card-content-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  button {
    margin-top: 0.5em;
    margin-right: 0.5em;
    flex: 1 1;
    max-width: 12em;
    min-width: 8em;

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
