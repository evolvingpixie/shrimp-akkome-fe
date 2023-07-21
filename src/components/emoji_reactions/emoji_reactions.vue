<template>
  <div class="emoji-reactions">
    <UserListPopover
      v-for="(reaction) in emojiReactions"
      :key="reaction.url || reaction.name"
      :users="accountsForEmoji[reaction.url || reaction.name]"
    >
      <button
        class="emoji-reaction btn button-default"
        :class="{ 'picked-reaction': reactedWith(reaction.name), 'not-clickable': !loggedIn }"
        @click="emojiOnClick(reaction.name, $event)"
        @mouseenter="fetchEmojiReactionsByIfMissing()"
      >
        <span
          v-if="reaction.url !== null"
        >
          <StillImage
            :src="reaction.url"
            :title="reaction.name"
            :alt="reaction.name"
            class="reaction-emoji"
            height="2.55em"
          />
          {{ reaction.count }}
        </span>
        <span v-else>
          <span class="reaction-emoji unicode-emoji">
            {{ reaction.name }}
          </span>
          <span>{{ reaction.count }}</span>
        </span>
      </button>
    </UserListPopover>
    <a
      v-if="tooManyReactions"
      class="emoji-reaction-expand faint"
      href="javascript:void(0)"
      @click="toggleShowAll"
    >
      {{ showAll ? $t('general.show_less') : showMoreString }}
    </a>
  </div>
</template>

<script src="./emoji_reactions.js" ></script>
<style lang="scss">
@import '../../_variables.scss';

.emoji-reactions {
  display: flex;
  margin-top: 0.25em;
  flex-wrap: wrap;
  container-type: inline-size;
}

.unicode-emoji {
  font-size: 210%;
}

.emoji-reaction {
  padding: 0 0.5em;
  margin-right: 0.5em;
  margin-top: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  .reaction-emoji {
    width: auto;
    max-width: 96cqw;
    height: 2.55em !important;
    margin-right: 0.25em;
  }
  &:focus {
    outline: none;
  }

  &.not-clickable {
    cursor: default;
    &:hover {
      box-shadow: $fallback--buttonShadow;
      box-shadow: var(--buttonShadow);
    }
  }
}

.emoji-reaction-expand {
  padding: 0 0.5em;
  margin-right: 0.5em;
  margin-top: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    text-decoration: underline;
  }
}

.button-default.picked-reaction {
  border: 1px solid var(--accent, $fallback--link);
  margin-left: -1px; // offset the border, can't use inset shadows either
  margin-right: calc(0.5em - 1px);
}

</style>
