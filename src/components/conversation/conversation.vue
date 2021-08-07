<template>
  <div
    v-if="!hideStatus"
    :style="hiddenStyle"
    class="Conversation"
    :class="{ '-expanded' : isExpanded, 'panel' : isExpanded }"
  >
    <div
      v-if="isExpanded"
      class="panel-heading conversation-heading"
    >
      <span class="title"> {{ $t('timeline.conversation') }} </span>
      <button
        v-if="collapsable"
        class="button-unstyled -link"
        @click.prevent="toggleExpanded"
      >
        {{ $t('timeline.collapse') }}
      </button>
    </div>
    <div
      v-if="diveMode"
      class="conversation-undive-box"
    >
      <i18n
        path="status.show_all_conversation"
        tag="button"
        class="button-unstyled -link"
        @click.prevent="undive"
      >
        <FAIcon icon="angle-double-left" />
      </i18n>
    </div>
    <div v-if="isTreeView">
      <thread-tree
        v-for="status in showingTopLevel"
        :key="status.id"
        ref="statusComponent"
        :depth="0"

        :status="status"
        :in-profile="inProfile"
        :conversation="conversation"
        :collapsable="collapsable"
        :is-expanded="isExpanded"
        :pinned-status-ids-object="pinnedStatusIdsObject"
        :profile-user-id="profileUserId"

        :focused="focused"
        :get-replies="getReplies"
        :get-highlight="getHighlight"
        :set-highlight="setHighlight"
        :toggle-expanded="toggleExpanded"

        :toggle-thread-display="toggleThreadDisplay"
        :thread-display-status="threadDisplayStatus"
        :show-thread-recursively="showThreadRecursively"
        :total-reply-count="totalReplyCount"
        :total-reply-depth="totalReplyDepth"
        :status-content-properties="statusContentProperties"
        :set-status-content-property="setStatusContentProperty"
        :toggle-status-content-property="toggleStatusContentProperty"
        :dive="diveIntoStatus"
      />
    </div>
    <div v-if="isLinearView">
      <status
        v-for="status in conversation"
        :key="status.id"
        ref="statusComponent"
        :inline-expanded="collapsable && isExpanded"
        :statusoid="status"
        :expandable="!isExpanded"
        :show-pinned="pinnedStatusIdsObject && pinnedStatusIdsObject[status.id]"
        :focused="focused(status.id)"
        :in-conversation="isExpanded"
        :highlight="getHighlight()"
        :replies="getReplies(status.id)"
        :in-profile="inProfile"
        :profile-user-id="profileUserId"
        class="conversation-status status-fadein panel-body"

        :toggle-thread-display="toggleThreadDisplay"
        :thread-display-status="threadDisplayStatus"
        :show-thread-recursively="showThreadRecursively"
        :total-reply-count="totalReplyCount"
        :total-reply-depth="totalReplyDepth"
        :status-content-properties="statusContentProperties"
        :set-status-content-property="setStatusContentProperty"
        :toggle-status-content-property="toggleStatusContentProperty"

        @goto="setHighlight"
        @toggleExpanded="toggleExpanded"
      />
    </div>
  </div>
  <div
    v-else
    :style="hiddenStyle"
  />
</template>

<script src="./conversation.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.Conversation {
  .conversation-undive-box {
    padding: 1em;
  }
  .conversation-undive-box,
  .conversation-status {
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: var(--border, $fallback--border);
    border-radius: 0;
  }

  &.-expanded {
    .conversation-status:last-child {
      border-bottom: none;
      border-radius: 0 0 $fallback--panelRadius $fallback--panelRadius;
      border-radius: 0 0 var(--panelRadius, $fallback--panelRadius) var(--panelRadius, $fallback--panelRadius);
    }
  }
}
</style>
