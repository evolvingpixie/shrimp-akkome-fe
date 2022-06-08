<template>
  <div class="chat-view">
    <div class="chat-view-inner">
      <div
        ref="inner"
        class="panel-default panel chat-view-body"
      >
        <div
          ref="header"
          class="panel-heading -sticky chat-view-heading"
        >
          <button
            class="button-unstyled go-back-button"
            @click="goBack"
          >
            <FAIcon
              size="lg"
              icon="chevron-left"
            />
          </button>
          <div class="title text-center">
            <ChatTitle
              :user="recipient"
              :with-avatar="true"
            />
          </div>
        </div>
        <div
          class="message-list"
          :style="{ height: scrollableContainerHeight }"
        >
          <template v-if="!errorLoadingChat">
            <ChatMessage
              v-for="chatViewItem in chatViewItems"
              :key="chatViewItem.id"
              :author="recipient"
              :chat-view-item="chatViewItem"
              :hovered-message-chain="chatViewItem.messageChainId === hoveredMessageChainId"
              @hover="onMessageHover"
            />
          </template>
          <div
            v-else
            class="chat-loading-error"
          >
            <div class="alert error">
              {{ $t('chats.error_loading_chat') }}
            </div>
          </div>
        </div>
        <div
          ref="footer"
          class="panel-body footer"
        >
          <div
            class="jump-to-bottom-button"
            :class="{ 'visible': jumpToBottomButtonVisible }"
            @click="scrollDown({ behavior: 'smooth' })"
          >
            <span>
              <FAIcon icon="chevron-down" />
              <div
                v-if="newMessageCount"
                class="badge badge-notification unread-chat-count unread-message-count"
              >
                {{ newMessageCount }}
              </div>
            </span>
          </div>
          <PostStatusForm
            :disable-subject="true"
            :disable-scope-selector="true"
            :disable-notice="true"
            :disable-lock-warning="true"
            :disable-polls="true"
            :disable-sensitivity-checkbox="true"
            :disable-submit="errorLoadingChat || !currentChat"
            :disable-preview="true"
            :optimistic-posting="true"
            :post-handler="sendMessage"
            :submit-on-enter="!mobileLayout"
            :preserve-focus="!mobileLayout"
            :auto-focus="!mobileLayout"
            :placeholder="formPlaceholder"
            :file-limit="1"
            max-height="160"
            emoji-picker-placement="top"
            @resize="handleResize"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./chat.js"></script>
<style lang="scss">
@import '../../_variables.scss';
@import './chat.scss';
</style>
