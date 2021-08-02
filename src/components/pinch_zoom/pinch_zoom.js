import PinchZoom from '@kazvmoe-infra/pinch-zoom-element'

export default {
  props: {
  },
  methods: {
    setTransform ({ scale, x, y }) {
      this.$el.setTransform({ scale, x, y })
    }
  }
}
