<template>
  <span
    v-if="serverSide"
    class="ServerSideIndicator"
  >
    <Popover
      trigger="hover"
    >
      <template v-slot:trigger>
        &nbsp;
        <FAIcon
          icon="server"
          :aria-label="$t('settings.setting_server_side')"
        />
      </template>
      <template v-slot:content>
        <div class="serverside-tooltip">
          {{ $t('settings.setting_server_side') }}
        </div>
      </template>
    </Popover>
  </span>
</template>

<script>
import Popover from 'src/components/popover/popover.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faServer } from '@fortawesome/free-solid-svg-icons'

library.add(
  faServer
)

export default {
  components: { Popover },
  props: ['serverSide']
}
</script>

<style lang="scss">
.ServerSideIndicator {
  display: inline-block;
  position: relative;

  .serverside-tooltip {
    margin: 0.5em 1em;
    min-width: 10em;
    text-align: center;
  }
}
</style>
