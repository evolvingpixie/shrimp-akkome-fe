<template>
  <label
    v-if="matchesExpertLevel"
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
      <ModifiedIndicator :changed="isChanged" /><ServerSideIndicator :server-side="isServerSide" /> </Checkbox>
  </label>
</template>

<script src="./boolean_setting.js"></script>
