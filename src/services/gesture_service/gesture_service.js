
const DIRECTION_LEFT = [-1, 0]
const DIRECTION_RIGHT = [1, 0]
const DIRECTION_UP = [0, -1]
const DIRECTION_DOWN = [0, 1]

const DISTANCE_MIN = 1

const isSwipeEvent = e => (e.touches.length === 1)
const isSwipeEventEnd = e => (e.changedTouches.length === 1)

const isScaleEvent = e => (e.targetTouches.length === 2)
const isScaleEventEnd = e => (e.targetTouches.length === 1)

const deltaCoord = (oldCoord, newCoord) => [newCoord[0] - oldCoord[0], newCoord[1] - oldCoord[1]]

const vectorMinus = (a, b) => a.map((k, n) => k - b[n])
const vectorAdd = (a, b) => a.map((k, n) => k + b[n])

const avgCoord = (coords) => [...coords].reduce(vectorAdd, [0, 0]).map(d => d / coords.length)

const touchCoord = touch => [touch.screenX, touch.screenY]

const touchEventCoord = e => touchCoord(e.touches[0])

const vectorLength = v => Math.sqrt(v[0] * v[0] + v[1] * v[1])

const perpendicular = v => [v[1], -v[0]]

const dotProduct = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1]

// const numProduct = (num, v) => v.map(k => num * k)

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

class SwipeAndScaleGesture {
  // swipePreviewCallback(offsets: Array[Number])
  //   offsets: the offset vector which the underlying component should move, from the starting position
  // pinchPreviewCallback(offsets: Array[Number], scaling: Number)
  //   offsets: the offset vector which the underlying component should move, from the starting position
  //   scaling: the scaling factor we should apply to the underlying component, from the starting position
  // swipeEndcallback(sign: 0|-1|1)
  //   sign: if the swipe does not meet the threshold, 0
  //         if the swipe meets the threshold in the positive direction, 1
  //         if the swipe meets the threshold in the negative direction, -1
  constructor ({
    direction,
    // swipeStartCallback, pinchStartCallback,
    swipePreviewCallback, pinchPreviewCallback,
    swipeEndCallback, pinchEndCallback,
    threshold = 30, perpendicularTolerance = 1.0
  }) {
    const nop = () => { console.log('Warning: Not implemented') }
    this.direction = direction
    this.swipePreviewCallback = swipePreviewCallback || nop
    this.pinchPreviewCallback = pinchPreviewCallback || nop
    this.swipeEndCallback = swipeEndCallback || nop
    this.pinchEndCallback = pinchEndCallback || nop
    this.threshold = threshold
    this.perpendicularTolerance = perpendicularTolerance
    this._startPos = [0, 0]
    this._startDistance = DISTANCE_MIN
    this._swiping = false
  }

  start (event) {
    console.log('start() called', event)
    if (isSwipeEvent(event)) {
      this._startPos = touchEventCoord(event)
      console.log('start pos:', this._startPos)
      this._swiping = true
    } else if (isScaleEvent(event)) {
      const coords = [...event.targetTouches].map(touchCoord)
      this._startPos = avgCoord(coords)
      this._startDistance = vectorLength(deltaCoord(coords[0], coords[1]))
      if (this._startDistance < DISTANCE_MIN) {
        this._startDistance = DISTANCE_MIN
      }
      this._scalePoints = [...event.targetTouches]
      this._swiping = false
      console.log(
        'is scale event, start =', this._startPos,
        'dist =', this._startDistance)
    }
  }

  move (event) {
    // console.log('move called', event)
    if (isSwipeEvent(event)) {
      const touch = event.changedTouches[0]
      const delta = deltaCoord(this._startPos, touchCoord(touch))

      this.swipePreviewCallback(delta)
    } else if (isScaleEvent(event)) {
      console.log('is scale event')
      const coords = [...event.targetTouches].map(touchCoord)
      const curPos = avgCoord(coords)
      const curDistance = vectorLength(deltaCoord(coords[0], coords[1]))
      const scaling = curDistance / this._startDistance
      const posDiff = vectorMinus(curPos, this._startPos)
      // const delta = vectorAdd(numProduct((1 - scaling), this._startPos), posDiff)
      const delta = posDiff
      // console.log(
      //   'is scale event, cur =', curPos,
      //   'dist =', curDistance,
      //   'scale =', scaling,
      //   'delta =', delta)
      this.pinchPreviewCallback(delta, scaling)
    }
  }

  end (event) {
    console.log('end() called', event)
    if (isScaleEventEnd(event)) {
      this.pinchEndCallback()
    }

    if (!isSwipeEventEnd(event)) {
      console.log('not swipe event')
      return
    }
    if (!this._swiping) {
      console.log('not swiping')
      return
    }
    this.swiping = false

    console.log('is swipe event')

    // movement too small
    const touch = event.changedTouches[0]
    const delta = deltaCoord(this._startPos, touchCoord(touch))
    this.swipePreviewCallback(delta)

    const sign = (() => {
      if (vectorLength(delta) < this.threshold) {
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

    this.swipeEndCallback(sign)
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
  SwipeAndScaleGesture
}

export default GestureService
