import { set } from 'lodash'
import Select from '../select/select.vue'

export default {
  components: {
    Select
  },
  props: [
    'name', 'label', 'modelValue', 'fallback', 'options', 'no-inherit'
  ],
  emits: ['update:modelValue'],
  data () {
    return {
      lValue: this.modelValue,
      availableOptions: [
        this.noInherit ? '' : 'inherit',
        'custom',
        ...(this.options || []),
        'serif',
        'monospace',
        'sans-serif'
      ].filter(_ => _)
    }
  },
  beforeUpdate () {
    this.lValue = this.modelValue
  },
  computed: {
    present () {
      return typeof this.lValue !== 'undefined'
    },
    dValue () {
      return this.lValue || this.fallback || {}
    },
    family: {
      get () {
        return this.dValue.family
      },
      set (v) {
        set(this.lValue, 'family', v)
        this.$emit('update:modelValue', this.lValue)
      }
    },
    isCustom () {
      return this.preset === 'custom'
    },
    preset: {
      get () {
        if (this.family === 'serif' ||
            this.family === 'sans-serif' ||
            this.family === 'monospace' ||
            this.family === 'inherit') {
          return this.family
        } else {
          return 'custom'
        }
      },
      set (v) {
        this.family = v === 'custom' ? '' : v
      }
    }
  }
}
