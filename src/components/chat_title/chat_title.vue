<template>
  <div
    class="chat-title"
    :title="title"
  >
    <router-link
      v-if="withAvatar && user"
      :to="getUserProfileLink(user)"
    >
      <UserAvatar
        :user="user"
        width="23px"
        height="23px"
      />
    </router-link>
    <RichContent
      class="username"
      :title="'@'+user.screen_name_ui"
      :html="htmlTitle"
      :emoji="user.emoji"
    />
  </div>
</template>

<script src="./chat_title.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.chat-title {
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-items: center;

  --emoji-size: 14px;

  .username {
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline;
    word-wrap: break-word;
    overflow: hidden;
  }

  .Avatar {
    width: 23px;
    height: 23px;
    margin-right: 0.5em;

    border-radius: $fallback--avatarAltRadius;
    border-radius: var(--avatarAltRadius, $fallback--avatarAltRadius);

    &.animated::before {
      display: none;
    }
  }
}
</style>
