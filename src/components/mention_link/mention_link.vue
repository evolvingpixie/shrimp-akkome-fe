<template>
  <span class="MentionLink">
    <a v-if="!user" v-html="content" href="url" class="original"/>
    <span v-if="user" class="new" :style="style" :class="{ '-you': isYou }" >
      <button class="button-unstyled short" @click.prevent="onClick">
        <span class="shortName">@<span v-html="userName" /></span> <span v-if="isYou">(You)</span>
      </button>
      <span class="full" v-if="userName !== userNameFull">
        @<span v-html="userNameFull" />
      </span>
    </span>
  </span>
</template>

<script src="./mention_link.js"/>

<style lang="scss" src="./mention_link.scss"/>
