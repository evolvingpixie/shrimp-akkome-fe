
<template>
  <label
    class="Select input"
    :class="{ disabled }"
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

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faChevronDown
)
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: [
    'value',
    'disabled'
  ]
}
</script>

<style lang="scss">
@import '../../_variables.scss';

.Select {
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
    font-size: 14px;
    width: 100%;
    z-index: 1;
    height: 28px;
    line-height: 16px;
  }
}
</style>
