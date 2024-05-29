<template>
  <span
    class="HashtagLink"
  >
    <!-- eslint-disable vue/no-v-html -->
    <a
      :href="url"
      class="original"
      target="_blank"
      @click.prevent="onClick"
      v-html="content"
    />
    <!-- eslint-enable vue/no-v-html -->
  </span>
</template>

<script src="./hashtag_link.js" />

<style lang="scss" src="./hashtag_link.scss" />
