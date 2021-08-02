import PinchZoom from '@kazvmoe-infra/pinch-zoom-element'

export default {
  methods: {
    setTransform ({ scale, x, y }) {
      this.$el.setTransform({ scale, x, y })
    }
  },
  created () {
    // Make lint happy
    (() => PinchZoom)()
  }
}
