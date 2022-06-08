import { get, set } from 'lodash'
import Select from 'src/components/select/select.vue'
import ModifiedIndicator from './modified_indicator.vue'
import ServerSideIndicator from './server_side_indicator.vue'
export default {
  components: {
    Select,
    ModifiedIndicator,
    ServerSideIndicator
  },
  props: [
    'path',
    'disabled',
    'options',
    'expert'
  ],
  computed: {
    pathDefault () {
      const [firstSegment, ...rest] = this.path.split('.')
      return [firstSegment + 'DefaultValue', ...rest].join('.')
    },
    state () {
      const value = get(this.$parent, this.path)
      if (value === undefined) {
        return this.defaultState
      } else {
        return value
      }
    },
    defaultState () {
      return get(this.$parent, this.pathDefault)
    },
    isServerSide () {
      return this.path.startsWith('serverSide_')
    },
    isChanged () {
      return !this.path.startsWith('serverSide_') && this.state !== this.defaultState
    },
    matchesExpertLevel () {
      return (this.expert || 0) <= this.$parent.expertLevel
    }
  },
  methods: {
    update (e) {
      set(this.$parent, this.path, e)
    }
  }
}
