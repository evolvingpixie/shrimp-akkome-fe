<template>
  <label
    class="BooleanSetting"
    v-if="matchesExpertLevel"
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
      <ServerSideIndicator :serverSide="isServerSide" />
    </Checkbox>
  </label>
</template>

<script src="./boolean_setting.js"></script>
