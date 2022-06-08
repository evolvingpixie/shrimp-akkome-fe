<template>
  <div class="exporter">
    <div v-if="processing">
      <FAIcon
        icon="circle-notch"
        size="lg"
        spin
      />

      <span>{{ processingMessage || $t('exporter.processing') }}</span>
    </div>
    <button
      v-else
      class="btn button-default"
      @click="process"
    >
      {{ exportButtonLabel || $t('exporter.export') }}
    </button>
  </div>
</template>

<script src="./exporter.js"></script>

<style lang="scss">
.exporter {
  &-processing {
    margin: 0.25em;
  }
}
</style>
