<template>
  <div class="Flash">
    <div
      v-if="player"
      ref="cunt"
      class="player"
      :class="{ hidden: player === 'hidden' }"
    />
    <button
      v-if="player === false || player === 'hidden'"
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
        v-else
        class="label"
      >
        {{ $t('general.flash_content') }}
      </span>
    </button>
    <button
      v-if="player"
      class="button-unstyled hider"
      @click="closePlayer"
    >
      <FAIcon icon="stop" />
    </button>
  </div>
</template>

<script src="./flash.js"></script>

<style lang="scss">
@import '../../_variables.scss';
.Flash {
  width: 100%;
  height: 260px;
  position: relative;

  .player {
    height: 100%;
    width: 100%;
  }

  .hider {
    top: 0;
  }

  .hidden {
    display: none;
    visibility: 'hidden';
  }

  .placeholder {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
