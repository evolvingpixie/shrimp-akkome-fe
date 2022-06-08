<template>
  <div class="thread-tree">
    <status
      :key="status.id"
      ref="statusComponent"
      :inline-expanded="collapsable && isExpanded"
      :statusoid="status"
      :expandable="!isExpanded"
      :show-pinned="pinnedStatusIdsObject && pinnedStatusIdsObject[status.id]"
      :focused="focused(status.id)"
      :in-conversation="isExpanded"
      :highlight="highlight"
      :replies="getReplies(status.id)"
      :in-profile="inProfile"
      :profile-user-id="profileUserId"
      class="conversation-status conversation-status-treeview status-fadein panel-body"

      :simple-tree="simple"
      :controlled-thread-display-status="threadDisplayStatus[status.id]"
      :controlled-toggle-thread-display="() => toggleThreadDisplay(status.id)"

      :controlled-showing-tall="currentProp.showingTall"
      :controlled-expanding-subject="currentProp.expandingSubject"
      :controlled-showing-long-subject="currentProp.showingLongSubject"
      :controlled-replying="currentProp.replying"
      :controlled-media-playing="currentProp.mediaPlaying"
      :controlled-toggle-showing-tall="() => toggleCurrentProp('showingTall')"
      :controlled-toggle-expanding-subject="() => toggleCurrentProp('expandingSubject')"
      :controlled-toggle-showing-long-subject="() => toggleCurrentProp('showingLongSubject')"
      :controlled-toggle-replying="() => toggleCurrentProp('replying')"
      :controlled-set-media-playing="(newVal) => setCurrentProp('mediaPlaying', newVal)"
      :dive="dive ? () => dive(status.id) : undefined"

      @goto="setHighlight"
      @toggleExpanded="toggleExpanded"
    />
    <div
      v-if="currentReplies.length && threadShowing"
      class="thread-tree-replies"
    >
      <thread-tree
        v-for="replyStatus in currentReplies"
        :key="replyStatus.id"
        ref="childComponent"
        :depth="depth + 1"
        :status="replyStatus"

        :in-profile="inProfile"
        :conversation="conversation"
        :collapsable="collapsable"
        :is-expanded="isExpanded"
        :pinned-status-ids-object="pinnedStatusIdsObject"
        :profile-user-id="profileUserId"

        :focused="focused"
        :get-replies="getReplies"
        :highlight="highlight"
        :set-highlight="setHighlight"
        :toggle-expanded="toggleExpanded"

        :simple="simple"
        :toggle-thread-display="toggleThreadDisplay"
        :thread-display-status="threadDisplayStatus"
        :show-thread-recursively="showThreadRecursively"
        :total-reply-count="totalReplyCount"
        :total-reply-depth="totalReplyDepth"
        :status-content-properties="statusContentProperties"
        :set-status-content-property="setStatusContentProperty"
        :toggle-status-content-property="toggleStatusContentProperty"
        :dive="dive"
      />
    </div>
    <div
      v-if="currentReplies.length && !threadShowing"
      class="thread-tree-replies thread-tree-replies-hidden"
    >
      <i18n-t
        v-if="simple"
        scope="global"
        tag="button"
        keypath="status.thread_follow_with_icon"
        class="button-unstyled -link thread-tree-show-replies-button"
        @click.prevent="dive(status.id)"
      >
        <template #icon>
          <FAIcon
            icon="angle-double-right"
          />
        </template>
        <template #text>
          <span>
            {{ $tc('status.thread_follow', totalReplyCount[status.id], { numStatus: totalReplyCount[status.id] }) }}
          </span>
        </template>
      </i18n-t>
      <i18n-t
        v-else
        scope="global"
        tag="button"
        keypath="status.thread_show_full_with_icon"
        class="button-unstyled -link thread-tree-show-replies-button"
        @click.prevent="showThreadRecursively(status.id)"
      >
        <template #icon>
          <FAIcon
            icon="angle-double-down"
          />
        </template>
        <template #text>
          <span>
            {{ $tc('status.thread_show_full', totalReplyCount[status.id], { numStatus: totalReplyCount[status.id], depth: totalReplyDepth[status.id] }) }}
          </span>
        </template>
      </i18n-t>
    </div>
  </div>
</template>

<script src="./thread_tree.js"></script>

<style lang="scss">
@import '../../_variables.scss';
.thread-tree-replies {
  margin-left: var(--status-margin, $status-margin);
  border-left: 2px solid var(--border, $fallback--border);
}

.thread-tree-replies-hidden {
  padding: var(--status-margin, $status-margin);
  /* Make the button stretch along the whole row */
  display: flex;
  align-items: stretch;
  flex-direction: column;
}
</style>
