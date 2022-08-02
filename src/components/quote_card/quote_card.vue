<template>
  <div>
    <router-link
      class="quote-card"
      :to="{ name: 'conversation', params: { id: status.id } }"
    >
      <QuoteCardContent
        :status="status"
      />
    </router-link>
  </div>
</template>

<script src="./quote_card"></script>

<style lang="scss">
@import '../../_variables.scss';

.quote-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  overflow: hidden;
  margin-top: 0.5em;

  .card-image {
    flex-shrink: 0;
    width: 120px;
    max-width: 25%;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: $fallback--attachmentRadius;
      border-radius: var(--attachmentRadius, $fallback--attachmentRadius);
    }
  }

  .card-content {
    max-height: 100%;
    margin: 0.5em;
    display: flex;
    flex-direction: column;
  }

  .card-host {
    font-size: 0.85em;
  }

  .card-description {
    margin: 0.5em 0 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    line-height: 1.2em;
    // cap description at 3 lines, the 1px is to clean up some stray pixels
    // TODO: fancier fade-out at the bottom to show off that it's too long?
    max-height: calc(1.2em * 3 - 1px);
  }

  .nsfw-alert {
    margin: 2em 0;
  }

  color: $fallback--text;
  color: var(--text, $fallback--text);
  border-style: solid;
  border-width: 1px;
  border-radius: $fallback--attachmentRadius;
  border-radius: var(--attachmentRadius, $fallback--attachmentRadius);
  border-color: $fallback--border;
  border-color: var(--border, $fallback--border);
}
</style>
