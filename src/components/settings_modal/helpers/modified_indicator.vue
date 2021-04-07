<template>
  <span
    v-if="changed"
    class="ModifiedIndicator"
  >
    <Popover
      trigger="hover"
    >
      <template v-slot:trigger>
        &nbsp;
        <FAIcon
          icon="wrench"
          :aria-label="$t('settings.setting_changed')"
        />
      </template>
      <template v-slot:content>
        <div class="modified-tooltip">
          {{ $t('settings.setting_changed') }}
        </div>
      </template>
    </Popover>
  </span>
</template>

<script>
import Popover from 'src/components/popover/popover.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faWrench } from '@fortawesome/free-solid-svg-icons'

library.add(
  faWrench
)

export default {
  components: { Popover },
  props: ['changed']
}
</script>

<style lang="scss">
.ModifiedIndicator {
  display: inline-block;
  position: relative;

  .modified-tooltip {
    margin: 0.5em 1em;
    min-width: 10em;
    text-align: center;
  }
}
</style>
