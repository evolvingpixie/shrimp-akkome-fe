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
    <div class="conversation-body panel-body">
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
      <div
        v-if="diveMode"
        class="conversation-undive-box"
      >
        <i18n
          path="status.return_to_last_showing"
          tag="button"
          class="button-unstyled -link"
          @click.prevent="diveBack"
        >
          <FAIcon icon="chevron-left" />
        </i18n>
      </div>
      <div
        v-if="isTreeView"
        class="thread-body"
      >
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
          :highlight="maybeHighlight"
          :set-highlight="setHighlight"
          :toggle-expanded="toggleExpanded"

          :simple="treeViewIsSimple"
          :toggle-thread-display="toggleThreadDisplay"
          :thread-display-status="threadDisplayStatus"
          :show-thread-recursively="showThreadRecursively"
          :total-reply-count="totalReplyCount"
          :total-reply-depth="totalReplyDepth"
          :status-content-properties="statusContentProperties"
          :set-status-content-property="setStatusContentProperty"
          :toggle-status-content-property="toggleStatusContentProperty"
          :dive="canDive ? diveIntoStatus : undefined"
        />
      </div>
      <div
        v-if="isLinearView"
        class="thread-body"
      >
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
    padding: $status-margin;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: var(--border, $fallback--border);
    border-radius: 0;
    /* Make the button stretch along the whole row */
    display: flex;
    align-items: stretch;
    flex-direction: column;
  }

  /* HACK: we want the border width to scale with the status *below it* */
  .conversation-status {
    border-top-width: 1px;
    border-top-style: solid;
    border-top-color: var(--border, $fallback--border);
    border-radius: 0;
  }

  &.-expanded .conversation-body .thread-tree:nth-child(1) > .conversation-status {
    border-top-left-radius: $fallback--panelRadius;
    border-top-left-radius: var(--panelRadius, $fallback--panelRadius);
  }

  /* first element in a reply tree, the border is supplied by reply tree instead
     for radius to display properly
   */
  &.-expanded .conversation-body {
    .conversation-undive-box:nth-child(1),
    & > .conversation-status:nth-child(1),
    & > .thread-body:nth-child(1) > .thread-tree:nth-child(1) > .conversation-status:nth-child(1),
    .thread-tree:nth-child(1) > .conversation-status:nth-child(1) {
      border-top: none;
    }
  }

  /* first unexpanded statuses in timeline */
  &:first-child:not(.-expanded) {
    .conversation-body {
      .conversation-status {
        border-top: none;
      }
    }
  }

  /* expanded conversation in timeline */
  &.status-fadein.-expanded .thread-body {
    border-left-width: 4px;
    border-left-style: solid;
    border-left-color: $fallback--cRed;
    border-left-color: var(--cRed, $fallback--cRed);
    border-radius: 0 0 $fallback--panelRadius $fallback--panelRadius;
    border-radius: 0 0 var(--panelRadius, $fallback--panelRadius) var(--panelRadius, $fallback--panelRadius);
    border-bottom: 1px solid var(--border, $fallback--border);
  }
  &.-expanded {
    .conversation-status:last-child {
      border-bottom: none;
    }
  }
}
</style>
