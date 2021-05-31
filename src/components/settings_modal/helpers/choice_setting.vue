<template>
  <label
    class="ChoiceSetting"
  >
    <slot />
    <Select
      :value="state"
      :disabled="disabled"
      @change="update"
    >
      <option
        v-for="option in options"
        :key="option.key"
        :value="option.value"
      >
        {{ option.label }}
        {{ option.value === defaultState ? $t('settings.instance_default_simple') : '' }}
      </option>
    </Select>
    <ModifiedIndicator :changed="isChanged" />
  </label>
</template>

<script src="./choice_setting.js"></script>

<style lang="scss">
.ChoiceSetting {
}
</style>
