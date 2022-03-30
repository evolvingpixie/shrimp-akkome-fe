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
    <div v-if="success">
      <button
        class="button-unstyled"
        @click="dismiss"
      >
        <FAIcon
          icon="times"
        />
      </button>
      {{ ' ' }}
      <span>{{ successMessage || $t('importer.success') }}</span>
    </div>
    <div v-else-if="error">
      <button
        class="button-unstyled"
        @click="dismiss"
      >
        <FAIcon
          icon="times"
        />
      </button>
      {{ ' ' }}
      <span>{{ errorMessage || $t('importer.error') }}</span>
    </div>
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
