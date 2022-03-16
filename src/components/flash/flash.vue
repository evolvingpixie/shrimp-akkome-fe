<template>
  <div class="Flash">
    <div
      v-if="player === true || player === 'hidden'"
      ref="container"
      class="player"
      :class="{ hidden: player === 'hidden' }"
    />
    <button
      v-if="player !== true"
      class="button-unstyled placeholder"
      @click="openPlayer"
    >
      <span
        v-if="player === 'hidden'"
        class="label"
      >
        {{ $t('general.loading') }}
      </span>
      <span
        v-if="player === 'error'"
        class="label"
      >
        {{ $t('general.flash_fail') }}
      </span>
      <span
        v-else
        class="label"
      >
        <p>
          {{ $t('general.flash_content') }}
        </p>
        <p>
          <FAIcon icon="exclamation-triangle" />
          {{ $t('general.flash_security') }}
        </p>
      </span>
    </button>
  </div>
</template>

<script src="./flash.js"></script>

<style lang="scss">
@import '../../_variables.scss';
.Flash {
  display: inline-block;
  width: 100%;
  height: 100%;
  position: relative;

  .player {
    height: 100%;
    width: 100%;
  }

  .placeholder {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    color: var(--link);
  }

  .hider {
    top: 0;
  }

  .label {
    text-align: center;
    flex: 1 1 0;
    line-height: 1.2;
    white-space: normal;
    word-wrap: normal;
  }

  .hidden {
    display: none;
    visibility: 'hidden';
  }
}
</style>
