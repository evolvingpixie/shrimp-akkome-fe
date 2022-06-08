import { get, set } from 'lodash'
import ModifiedIndicator from './modified_indicator.vue'
export default {
  components: {
    ModifiedIndicator
  },
  props: {
    path: String,
    disabled: Boolean,
    min: Number,
    expert: [Number, String]
  },
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
    isChanged () {
      return this.state !== this.defaultState
    },
    matchesExpertLevel () {
      return (this.expert || 0) <= this.$parent.expertLevel
    }
  },
  methods: {
    update (e) {
      set(this.$parent, this.path, parseInt(e.target.value))
    }
  }
}
