<template>
  <span
    v-if="matchesExpertLevel"
    class="IntegerSetting"
  >
    <label :for="path">
      <slot />
    </label>
    <input
      :id="path"
      class="number-input"
      type="number"
      step="1"
      :disabled="disabled"
      :min="min || 0"
      :value="state"
      @change="update"
    >
    <ModifiedIndicator :changed="isChanged" />
  </span>
</template>

<script src="./integer_setting.js"></script>
