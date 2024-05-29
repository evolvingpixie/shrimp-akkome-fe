<template>
  <span class="MentionsLine">
    <MentionLink
      v-for="mention in mentionsComputed"
      :key="mention.index"
      class="mention-link"
      :content="mention.content"
      :url="mention.url"
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
          :key="mention.index"
          class="mention-link"
          :content="mention.content"
          :url="mention.url"
        />
      </span><button
        v-if="!expanded"
        class="button-unstyled showMoreLess"
        @click="toggleShowMore"
      >
        {{ $t('status.plus_more', { number: extraMentions.length }) }}
      </button><button
        v-if="expanded"
        class="button-unstyled showMoreLess"
        @click="toggleShowMore"
      >
        {{ $t('general.show_less') }}
      </button>
    </span>
  </span>
</template>
<script src="./mentions_line.js"></script>
<style lang="scss" src="./mentions_line.scss" />
