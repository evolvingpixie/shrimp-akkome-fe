// eslint-disable-next-line no-unused
import { h, Fragment } from 'vue'
import { mapState } from 'vuex'
import { FontAwesomeIcon as FAIcon } from '@fortawesome/vue-fontawesome'

import './tab_switcher.scss'

const findFirstUsable = (slots) => slots.findIndex(_ => _.props)

export default {
  name: 'TabSwitcher',
  props: {
    renderOnlyFocused: {
      required: false,
      type: Boolean,
      default: false
    },
    onSwitch: {
      required: false,
      type: Function,
      default: undefined
    },
    activeTab: {
      required: false,
      type: String,
      default: undefined
    },
    scrollableTabs: {
      required: false,
      type: Boolean,
      default: false
    },
    sideTabBar: {
      required: false,
      type: Boolean,
      default: false
    },
    bodyScrollLock: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      active: findFirstUsable(this.slots())
    }
  },
  computed: {
    activeIndex () {
      // In case of controlled component
      if (this.activeTab) {
        return this.slots().findIndex(slot => slot && slot.props && this.activeTab === slot.props.key)
      } else {
        return this.active
      }
    },
    isActive () {
      return tabName => {
        const isWanted = slot => slot.props && slot.props['data-tab-name'] === tabName
        return this.$slots.default().findIndex(isWanted) === this.activeIndex
      }
    },
    settingsModalVisible () {
      return this.settingsModalState === 'visible'
    },
    ...mapState({
      settingsModalState: state => state.interface.settingsModalState
    })
  },
  beforeUpdate () {
    const currentSlot = this.slots()[this.active]
    if (!currentSlot.props) {
      this.active = findFirstUsable(this.slots())
    }
  },
  methods: {
    clickTab (index) {
      return (e) => {
        e.preventDefault()
        this.setTab(index)
      }
    },
    // DO NOT put it to computed, it doesn't work (caching?)
    slots () {
      if (this.$slots.default()[0].type === Fragment) {
        return this.$slots.default()[0].children
      }
      return this.$slots.default()
    },
    setTab (index) {
      if (typeof this.onSwitch === 'function') {
        this.onSwitch.call(null, this.slots()[index].key)
      }
      this.active = index
      if (this.scrollableTabs) {
        this.$refs.contents.scrollTop = 0
      }
    }
  },
  render () {
    const tabs = this.slots()
      .map((slot, index) => {
        const props = slot.props
        if (!props) return
        const classesTab = ['tab', 'button-default']
        const classesWrapper = ['tab-wrapper']
        if (this.activeIndex === index) {
          classesTab.push('active')
          classesWrapper.push('active')
        }
        if (props.image) {
          return (
            <div class={classesWrapper.join(' ')}>
              <button
                disabled={props.disabled}
                onClick={this.clickTab(index)}
                class={classesTab.join(' ')}
                type="button"
              >
                <img src={props.image} title={props['image-tooltip']}/>
                {props.label ? '' : props.label}
              </button>
            </div>
          )
        }
        return (
          <div class={classesWrapper.join(' ')}>
            <button
              disabled={props.disabled}
              onClick={this.clickTab(index)}
              class={classesTab.join(' ')}
              type="button"
            >
              {!props.icon ? '' : (<FAIcon class="tab-icon" size="2x" fixed-width icon={props.icon}/>)}
              <span class="text">
                {props.label}
              </span>
            </button>
          </div>
        )
      })

    const contents = this.slots().map((slot, index) => {
      const props = slot.props
      if (!props) return
      const active = this.activeIndex === index
      const classes = [ active ? 'active' : 'hidden' ]
      if (props.fullHeight) {
        classes.push('full-height')
      }
      const renderSlot = (!this.renderOnlyFocused || active)
        ? slot
        : ''

      return (
        <div class={classes}>
          {
            this.sideTabBar
              ? <h1 class="mobile-label">{props.label}</h1>
              : ''
          }
          {renderSlot}
        </div>
      )
    })

    return (
      <div class={'tab-switcher ' + (this.sideTabBar ? 'side-tabs' : 'top-tabs')}>
        <div class="tabs">
          {tabs}
        </div>
        <div
          ref="contents"
          class={'contents' + (this.scrollableTabs ? ' scrollable-tabs' : '')}
          v-body-scroll-lock={this.bodyScrollLock}
        >
          {contents}
        </div>
      </div>
    )
  }
}
