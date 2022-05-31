<template>
  <label
    class="Select input"
    :class="{ disabled, unstyled }"
  >
    <select
      :disabled="disabled"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
    {{ ' ' }}
    <FAIcon
      class="select-down-icon"
      icon="chevron-down"
    />
  </label>
</template>

<script src="./select.js"> </script>

<style lang="scss">
@import '../../_variables.scss';

/* TODO fix order of styles */
label.Select {
  padding: 0;

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
    font-size: 1em;
    width: 100%;
    z-index: 1;
    height: 2em;
    line-height: 16px;
  }

  .select-down-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 5px;
    height: 100%;
    width: 0.875em;
    color: $fallback--text;
    color: var(--inputText, $fallback--text);
    line-height: 2;
    z-index: 0;
    pointer-events: none;
  }

}
</style>
