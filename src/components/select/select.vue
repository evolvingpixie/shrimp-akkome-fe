
<template>
  <label
    class="Select input"
    :class="[ kindClass, { disabled } ]"
  >
    <select
      :disabled="disabled"
      :value="value"
      @change="$emit('change', $event.target.value)"
    >
      <slot />
    </select>
    <FAIcon
      class="select-down-icon"
      icon="chevron-down"
    />
  </label>
</template>

<script src="./select.js"> </script>

<style lang="scss">
@import '../../_variables.scss';

.Select {
  padding: 0;

  /* Overriding input styles, probably should make proper Input component? */
  &.-kind_ghost {
    border: none;
    box-shadow: none;
    background-color: transparent;
    padding-right: 0.75em;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: transparent;
    border: none;
    color: $fallback--text;
    color: var(--inputText, --text, $fallback--text);
    margin: 0;
    padding: 0 2em 0 .2em;
    font-family: sans-serif;
    font-family: var(--inputFont, sans-serif);
    font-size: 14px;
    width: 100%;
    z-index: 1;
    height: 28px;
    line-height: 16px;
  }
}
</style>
