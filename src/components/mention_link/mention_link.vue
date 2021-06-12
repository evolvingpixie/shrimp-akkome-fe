<template>
  <span
    class="MentionLink"
  >
    <!-- eslint-disable vue/no-v-html -->
    <a
      v-if="!user"
      href="url"
      class="original"
      v-html="content"
    />
    <!-- eslint-enable vue/no-v-html -->
    <span
      v-if="user"
      class="new"
      :style="style"
      :class="classnames"
    >
      <button
        class="short"
        :class="[{ '-sublime': !highlight }, oldStyle ? 'button-unstyled' : 'button-default']"
        @click.prevent="onClick"
      >
        <!-- eslint-disable vue/no-v-html -->
        <FAIcon
          size="sm"
          icon="at"
          class="at"
        /><span class="shortName"><span
          class="userName"
          v-html="userName"
        /></span>
        <span
          v-if="isYou"
          class="you"
        >{{ $t('status.you') }}</span>
        <!-- eslint-enable vue/no-v-html -->
      </button>
      <span
        v-if="userName !== userNameFull"
        class="full popover-default"
        :class="[highlightType]"
      >
        <span
          class="userNameFull"
          v-text="'@' + userNameFull"
        />
      </span>
    </span>
  </span>
</template>

<script src="./mention_link.js"/>

<style lang="scss" src="./mention_link.scss"/>
