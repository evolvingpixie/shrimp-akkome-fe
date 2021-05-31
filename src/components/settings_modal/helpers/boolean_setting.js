import { get, set } from 'lodash'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import ModifiedIndicator from './modified_indicator.vue'
export default {
  components: {
    Checkbox,
    ModifiedIndicator
  },
  props: [
    'path',
    'disabled'
  ],
  computed: {
    pathDefault () {
      const [firstSegment, ...rest] = this.path.split('.')
      return [firstSegment + 'DefaultValue', ...rest].join('.')
    },
    state () {
      return get(this.$parent, this.path)
    },
    defaultState () {
      return get(this.$parent, this.pathDefault)
    },
    isChanged () {
      return this.state !== undefined && this.state !== this.defaultState
    }
  },
  methods: {
    update (e) {
      set(this.$parent, this.path, e)
    }
  }
}
