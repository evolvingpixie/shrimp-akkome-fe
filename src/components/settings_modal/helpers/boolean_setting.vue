<template>
  <label
    class="BooleanSetting"
  >
    <Checkbox
      :checked="state"
      :disabled="disabled"
      @change="update"
    >
      <span
        v-if="!!$slots.default"
        class="label"
      >
        <slot />
      </span>
      <ModifiedIndicator :changed="isChanged" />
    </Checkbox>
  </label>
</template>

<script src="./boolean_setting.js"></script>
