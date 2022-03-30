<template>
  <div class="importer">
    <form>
      <input
        ref="input"
        type="file"
        @change="change"
      >
    </form>
    <FAIcon
      v-if="submitting"
      class="importer-uploading"
      spin
      icon="circle-notch"
    />
    <button
      v-else
      class="btn button-default"
      @click="submit"
    >
      {{ submitButtonLabel || $t('importer.submit') }}
    </button>
    <button
      v-if="success"
      class="button-unstyled"
      @click="dismiss"
    >
      <FAIcon
        icon="times"
      />
      <p>{{ successMessage || $t('importer.success') }}</p>
    </button>
    <button
      v-else-if="error"
      class="button-unstyled"
      @click="dismiss"
    >
      <FAIcon
        icon="times"
      />
      <p>{{ errorMessage || $t('importer.error') }}</p>
    </button>
  </div>
</template>

<script src="./importer.js"></script>

<style lang="scss">
.importer {
  &-uploading {
    font-size: 1.5em;
    margin: 0.25em;
  }
}
</style>
