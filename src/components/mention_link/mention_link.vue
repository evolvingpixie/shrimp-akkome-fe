<template>
  <span
    class="MentionLink"
  >
    <!-- eslint-disable vue/no-v-html -->
    <a
      v-if="!user"
      :href="url"
      class="original"
      target="_blank"
      v-html="content"
    /><!-- eslint-enable vue/no-v-html --><span
      v-if="user"
      class="new"
      :style="style"
      :class="classnames"
    >
      <a
        class="short button-unstyled"
        :class="{ '-with-tooltip': shouldShowTooltip }"
        :href="url"
        @click.prevent="onClick"
      >
        <!-- eslint-disable vue/no-v-html -->
        <UserAvatar
          v-if="shouldShowAvatar"
          class="mention-avatar"
          :user="user"
        />
        <span class="shortName">@<span
          class="userName"
          v-html="userName"
        /><span
          v-if="shouldShowFullUserName"
          class="serverName"
          :class="{ '-faded': shouldFadeDomain }"
          v-html="'@' + serverName"
        />
        </span>
        <span
          v-if="isYou && shouldShowYous"
          :class="{ '-you': shouldBoldenYou }"
        > {{ ' ' + $t('status.you') }}</span>
        <!-- eslint-enable vue/no-v-html -->
      </a><span
        v-if="shouldShowTooltip"
        class="full popover-default"
        :class="[highlightType]"
      >
        <span
          class="userNameFull"
        >
          <!-- eslint-disable vue/no-v-html -->
          @<span
            class="userName"
            v-html="userName"
          /><span
            class="serverName"
            :class="{ '-faded': shouldFadeDomain }"
            v-html="'@' + serverName"
          />
          <!-- eslint-enable vue/no-v-html -->
        </span>
      </span>
    </span>
  </span>
</template>

<script src="./mention_link.js"/>

<style lang="scss" src="./mention_link.scss"/>
