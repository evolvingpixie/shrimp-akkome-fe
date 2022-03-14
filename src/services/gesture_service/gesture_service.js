
const DIRECTION_LEFT = [-1, 0]
const DIRECTION_RIGHT = [1, 0]
const DIRECTION_UP = [0, -1]
const DIRECTION_DOWN = [0, 1]

const BUTTON_LEFT = 0

const deltaCoord = (oldCoord, newCoord) => [newCoord[0] - oldCoord[0], newCoord[1] - oldCoord[1]]

const touchCoord = touch => [touch.screenX, touch.screenY]

const touchEventCoord = e => touchCoord(e.touches[0])

const pointerEventCoord = e => [e.clientX, e.clientY]

const vectorLength = v => Math.sqrt(v[0] * v[0] + v[1] * v[1])

const perpendicular = v => [v[1], -v[0]]

const dotProduct = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1]

const project = (v1, v2) => {
  const scalar = (dotProduct(v1, v2) / dotProduct(v2, v2))
  return [scalar * v2[0], scalar * v2[1]]
}

// direction: either use the constants above or an arbitrary 2d vector.
// threshold: how many Px to move from touch origin before checking if the
//    callback should be called.
// divergentTolerance: a scalar for much of divergent direction we tolerate when
//    above threshold. for example, with 1.0 we only call the callback if
//    divergent component of delta is < 1.0 * direction component of delta.
const swipeGesture = (direction, onSwipe, threshold = 30, perpendicularTolerance = 1.0) => {
  return {
    direction,
    onSwipe,
    threshold,
    perpendicularTolerance,
    _startPos: [0, 0],
    _swiping: false
  }
}

const beginSwipe = (event, gesture) => {
  gesture._startPos = touchEventCoord(event)
  gesture._swiping = true
}

const updateSwipe = (event, gesture) => {
  if (!gesture._swiping) return
  // movement too small
  const delta = deltaCoord(gesture._startPos, touchEventCoord(event))
  if (vectorLength(delta) < gesture.threshold) return
  // movement is opposite from direction
  if (dotProduct(delta, gesture.direction) < 0) return
  // movement perpendicular to direction is too much
  const towardsDir = project(delta, gesture.direction)
  const perpendicularDir = perpendicular(gesture.direction)
  const towardsPerpendicular = project(delta, perpendicularDir)
  if (
    vectorLength(towardsDir) * gesture.perpendicularTolerance <
    vectorLength(towardsPerpendicular)
  ) return

  gesture.onSwipe()
  gesture._swiping = false
}

class SwipeAndClickGesture {
  // swipePreviewCallback(offsets: Array[Number])
  //   offsets: the offset vector which the underlying component should move, from the starting position
  // swipeEndCallback(sign: 0|-1|1)
  //   sign: if the swipe does not meet the threshold, 0
  //         if the swipe meets the threshold in the positive direction, 1
  //         if the swipe meets the threshold in the negative direction, -1
  constructor ({
    direction,
    // swipeStartCallback
    swipePreviewCallback,
    swipeEndCallback,
    swipeCancelCallback,
    swipelessClickCallback,
    threshold = 30,
    perpendicularTolerance = 1.0,
    disableClickThreshold = 1
  }) {
    const nop = () => {}
    this.direction = direction
    this.swipePreviewCallback = swipePreviewCallback || nop
    this.swipeEndCallback = swipeEndCallback || nop
    this.swipeCancelCallback = swipeCancelCallback || nop
    this.swipelessClickCallback = swipelessClickCallback || nop
    this.threshold = typeof threshold === 'function' ? threshold : () => threshold
    this.disableClickThreshold = typeof disableClickThreshold === 'function' ? disableClickThreshold : () => disableClickThreshold
    this.perpendicularTolerance = perpendicularTolerance
    this._reset()
  }

  _reset () {
    this._startPos = [0, 0]
    this._pointerId = -1
    this._swiping = false
    this._swiped = false
    this._preventNextClick = false
  }

  start (event) {
    // Only handle left click
    if (event.button !== BUTTON_LEFT) {
      return
    }

    this._startPos = pointerEventCoord(event)
    this._pointerId = event.pointerId
    this._swiping = true
    this._swiped = false
  }

  move (event) {
    if (this._swiping && this._pointerId === event.pointerId) {
      this._swiped = true

      const coord = pointerEventCoord(event)
      const delta = deltaCoord(this._startPos, coord)

      this.swipePreviewCallback(delta)
    }
  }

  cancel (event) {
    if (!this._swiping || this._pointerId !== event.pointerId) {
      return
    }

    this.swipeCancelCallback()
  }

  end (event) {
    if (!this._swiping) {
      return
    }

    if (this._pointerId !== event.pointerId) {
      return
    }

    this._swiping = false

    // movement too small
    const coord = pointerEventCoord(event)
    const delta = deltaCoord(this._startPos, coord)

    const sign = (() => {
      if (vectorLength(delta) < this.threshold()) {
        return 0
      }
      // movement is opposite from direction
      const isPositive = dotProduct(delta, this.direction) > 0

      // movement perpendicular to direction is too much
      const towardsDir = project(delta, this.direction)
      const perpendicularDir = perpendicular(this.direction)
      const towardsPerpendicular = project(delta, perpendicularDir)
      if (
        vectorLength(towardsDir) * this.perpendicularTolerance <
          vectorLength(towardsPerpendicular)
      ) {
        return 0
      }

      return isPositive ? 1 : -1
    })()

    if (this._swiped) {
      this.swipeEndCallback(sign)
    }
    this._reset()
    // Only a mouse will fire click event when
    // the end point is far from the starting point
    // so for other kinds of pointers do not check
    // whether we have swiped
    if (vectorLength(delta) >= this.disableClickThreshold() && event.pointerType === 'mouse') {
      this._preventNextClick = true
    }
  }

  click (event) {
    if (!this._preventNextClick) {
      this.swipelessClickCallback()
    }
    this._reset()
  }
}

const GestureService = {
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  DIRECTION_DOWN,
  swipeGesture,
  beginSwipe,
  updateSwipe,
  SwipeAndClickGesture
}

export default GestureService
