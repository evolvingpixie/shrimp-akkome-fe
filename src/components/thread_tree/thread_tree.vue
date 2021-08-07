<template>
  <div class="thread-tree panel-body">
    <status
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
      @goto="setHighlight"
      @toggleExpanded="toggleExpanded"
    />
    <div
      v-if="currentReplies.length"
      class="thread-tree-replies"
    >
      <thread-tree
        v-for="replyStatus in currentReplies"
        :key="replyStatus.id"
        ref="childComponent"
        :status="replyStatus"

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

        class="conversation-status status-fadein panel-body"
      />
    </div>
  </div>
</template>

<script src="./thread_tree.js"></script>

<style lang="scss">
.thread-tree-replies {
  margin-left: 1em;
}
</style>
