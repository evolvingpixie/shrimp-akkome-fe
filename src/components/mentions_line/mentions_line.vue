<template>
  <span class="MentionsLine">
    <MentionLink
      v-for="mention in mentions"
      :key="mention.statusnet_profile_url"
      class="mention-link"
      :content="mention.statusnet_profile_url"
      :url="mention.statusnet_profile_url"
      :first-mention="false"
    /><span
      v-if="manyMentions"
      class="extraMentions"
    >
      <span
        v-if="expanded"
        class="fullExtraMentions"
      >
        <MentionLink
          v-for="mention in extraMentions"
          :key="mention.statusnet_profile_url"
          class="mention-link"
          :content="mention.statusnet_profile_url"
          :url="mention.statusnet_profile_url"
          :first-mention="false"
        />
      </span><button
        v-if="!expanded"
        class="showMoreLess"
        :class="buttonClasses"
        @click="toggleShowMore"
      >
        {{ $t('status.plus_more', { number: extraMentions.length }) }}
      </button><button
        v-if="expanded"
        class="showMoreLess"
        :class="buttonClasses"
        @click="toggleShowMore"
      >
        {{ $t('general.show_less') }}
      </button>
    </span>
  </span>
</template>
<script src="./mentions_line.js" ></script>
<style lang="scss" src="./mentions_line.scss" />
