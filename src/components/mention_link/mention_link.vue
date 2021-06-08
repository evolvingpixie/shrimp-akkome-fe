<template>
<span
  class="MentionLink"
  :class="{ '-oldPlace': oldPlace }"
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
        <span class="shortName"><span class="userName" v-html="userName" /></span><span class="you" v-if="isYou">{{ $t('status.you')}}</span>
        <!-- eslint-enable vue/no-v-html -->
      </button>
      <span
        v-if="userName !== userNameFull"
        class="full popover-default"
        :class="[highlightType]"
      >
        <!-- eslint-disable vue/no-v-html -->
        <span class="userNameFull" v-html="userNameFull" />
        <!-- eslint-enable vue/no-v-html -->
      </span>
    </span>
  </span>
</template>

<script src="./mention_link.js"/>

<style lang="scss" src="./mention_link.scss"/>
