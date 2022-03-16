import GestureService from '../../services/gesture_service/gesture_service'

/**
 * props:
 *   direction: a vector that indicates the direction of the intended swipe
 *   threshold: the minimum distance in pixels the swipe has moved on `direction'
 *              for swipe-finished() to have a non-zero sign
 *   perpendicularTolerance: see gesture_service
 *
 * Events:
 *   preview-requested(offsets)
 *     Emitted when the pointer has moved.
 *     offsets: the offsets from the start of the swipe to the current cursor position
 *
 *   swipe-canceled()
 *     Emitted when the swipe has been canceled due to a pointercancel event.
 *
 *   swipe-finished(sign: 0|-1|1)
 *     Emitted when the swipe has finished.
 *     sign: if the swipe does not meet the threshold, 0
 *           if the swipe meets the threshold in the positive direction, 1
 *           if the swipe meets the threshold in the negative direction, -1
 *
 *   swipeless-clicked()
 *     Emitted when there is a click without swipe.
 *     This and swipe-finished() cannot be emitted for the same pointerup event.
 */
const SwipeClick = {
  props: {
    direction: {
      type: Array
    },
    threshold: {
      type: Function,
      default: () => 30
    },
    perpendicularTolerance: {
      type: Number,
      default: 1.0
    }
  },
  methods: {
    handlePointerDown (event) {
      this.$gesture.start(event)
    },
    handlePointerMove (event) {
      this.$gesture.move(event)
    },
    handlePointerUp (event) {
      this.$gesture.end(event)
    },
    handlePointerCancel (event) {
      this.$gesture.cancel(event)
    },
    handleNativeClick (event) {
      this.$gesture.click(event)
    },
    preview (offsets) {
      this.$emit('preview-requested', offsets)
    },
    end (sign) {
      this.$emit('swipe-finished', sign)
    },
    click () {
      this.$emit('swipeless-clicked')
    },
    cancel () {
      this.$emit('swipe-canceled')
    }
  },
  created () {
    this.$gesture = new GestureService.SwipeAndClickGesture({
      direction: this.direction,
      threshold: this.threshold,
      perpendicularTolerance: this.perpendicularTolerance,
      swipePreviewCallback: this.preview,
      swipeEndCallback: this.end,
      swipeCancelCallback: this.cancel,
      swipelessClickCallback: this.click
    })
  }
}

export default SwipeClick
