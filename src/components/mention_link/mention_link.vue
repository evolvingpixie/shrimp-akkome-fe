<template>
  <span class="MentionLink">
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
      :class="{ '-you': isYou }"
    >
      <button
        class="button-unstyled short"
        @click.prevent="onClick"
      >
        <!-- eslint-disable vue/no-v-html -->
        <span class="shortName">@<span v-html="userName" /></span> <span v-if="isYou">{{ $t('status.you')}}</span>
        <!-- eslint-enable vue/no-v-html -->
      </button>
      <span
        v-if="userName !== userNameFull"
        class="full"
      >
        <!-- eslint-disable vue/no-v-html -->
        @<span v-html="userNameFull" />
        <!-- eslint-enable vue/no-v-html -->
      </span>
    </span>
  </span>
</template>

<script src="./mention_link.js"/>

<style lang="scss" src="./mention_link.scss"/>
