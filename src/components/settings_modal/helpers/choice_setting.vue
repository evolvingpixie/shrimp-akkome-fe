<template>
  <label
    v-if="matchesExpertLevel"
    class="ChoiceSetting"
  >
    <slot />
    {{ ' ' }}
    <Select
      :model-value="state"
      :disabled="disabled"
      @update:model-value="update"
    >
      <option
        v-for="option in options"
        :key="option.key"
        :value="option.value"
      >
        {{ option.label }}
        <template
          v-if="hideDefaultLabel !== true"
        >
          {{ option.value === defaultState ? $t('settings.instance_default_simple') : '' }}
        </template>
      </option>
    </Select>
    <ModifiedIndicator :changed="isChanged" />
    <ServerSideIndicator :server-side="isServerSide" />
  </label>
</template>

<script src="./choice_setting.js"></script>

<style lang="scss">
.ChoiceSetting {
}
</style>
