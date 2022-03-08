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
        v-if="isTreeView"
        class="thread-body"
      >
        <div
          v-if="shouldShowAllConversationButton"
          class="conversation-dive-to-top-level-box"
        >
          <i18n
            path="status.show_all_conversation_with_icon"
            tag="button"
            class="button-unstyled -link"
            @click.prevent="diveToTopLevel"
          >
            <FAIcon
              place="icon"
              icon="angle-double-left"
            />
            <span place="text">
              {{ $tc('status.show_all_conversation', otherTopLevelCount, { numStatus: otherTopLevelCount }) }}
            </span>
          </i18n>
        </div>
        <div
          v-if="shouldShowAncestors"
          class="thread-ancestors"
        >
          <div
            v-for="status in ancestorsOf(diveRoot)"
            :key="status.id"
            class="thread-ancestor"
            :class="{'thread-ancestor-has-other-replies': getReplies(status.id).length > 1, '-faded': shouldFadeAncestors}"
          >
            <status
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

              :simple-tree="treeViewIsSimple"
              :toggle-thread-display="toggleThreadDisplay"
              :thread-display-status="threadDisplayStatus"
              :show-thread-recursively="showThreadRecursively"
              :total-reply-count="totalReplyCount"
              :total-reply-depth="totalReplyDepth"
              :show-other-replies-as-button="showOtherRepliesButtonInsideStatus"
              :dive="() => diveIntoStatus(status.id)"

              :controlled-showing-tall="statusContentProperties[status.id].showingTall"
              :controlled-expanding-subject="statusContentProperties[status.id].expandingSubject"
              :controlled-showing-long-subject="statusContentProperties[status.id].showingLongSubject"
              :controlled-replying="statusContentProperties[status.id].replying"
              :controlled-media-playing="statusContentProperties[status.id].mediaPlaying"
              :controlled-toggle-showing-tall="() => toggleStatusContentProperty(status.id, 'showingTall')"
              :controlled-toggle-expanding-subject="() => toggleStatusContentProperty(status.id, 'expandingSubject')"
              :controlled-toggle-showing-long-subject="() => toggleStatusContentProperty(status.id, 'showingLongSubject')"
              :controlled-toggle-replying="() => toggleStatusContentProperty(status.id, 'replying')"
              :controlled-set-media-playing="(newVal) => toggleStatusContentProperty(status.id, 'mediaPlaying', newVal)"

              @goto="setHighlight"
              @toggleExpanded="toggleExpanded"
            />
            <div
              v-if="showOtherRepliesButtonBelowStatus && getReplies(status.id).length > 1"
              class="thread-ancestor-dive-box"
            >
              <div
                class="thread-ancestor-dive-box-inner"
              >
                <i18n
                  tag="button"
                  path="status.ancestor_follow_with_icon"
                  class="button-unstyled -link thread-tree-show-replies-button"
                  @click.prevent="diveIntoStatus(status.id)"
                >
                  <FAIcon
                    place="icon"
                    icon="angle-double-right"
                  />
                  <span place="text">
                    {{ $tc('status.ancestor_follow', getReplies(status.id).length - 1, { numReplies: getReplies(status.id).length - 1 }) }}
                  </span>
                </i18n>
              </div>
            </div>
          </div>
        </div>
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
  .conversation-dive-to-top-level-box {
    padding: var(--status-margin, $status-margin);
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: var(--border, $fallback--border);
    border-radius: 0;
    /* Make the button stretch along the whole row */
    display: flex;
    align-items: stretch;
    flex-direction: column;
  }

  .thread-ancestors {
    margin-left: var(--status-margin, $status-margin);
    border-left: 2px solid var(--border, $fallback--border);
  }

  .thread-ancestor.-faded .StatusContent {
    --link: var(--faintLink);
    --text: var(--faint);
    color: var(--text);
  }
  .thread-ancestor-dive-box {
    padding-left: var(--status-margin, $status-margin);
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: var(--border, $fallback--border);
    border-radius: 0;
    /* Make the button stretch along the whole row */
    &, &-inner {
      display: flex;
      align-items: stretch;
      flex-direction: column;
    }
  }
  .thread-ancestor-dive-box-inner {
    padding: var(--status-margin, $status-margin);
  }

  .conversation-status {
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: var(--border, $fallback--border);
    border-radius: 0;
  }

  .thread-ancestor-has-other-replies .conversation-status,
  .thread-ancestor:last-child .conversation-status,
  .thread-ancestor:last-child .thread-ancestor-dive-box,
  &.-expanded .thread-tree .conversation-status {
    border-bottom: none;
  }

  .thread-ancestors + .thread-tree > .conversation-status {
    border-top-width: 1px;
    border-top-style: solid;
    border-top-color: var(--border, $fallback--border);
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
}
</style>
