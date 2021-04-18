import { mapState } from 'vuex'
import { FontAwesomeIcon as FAIcon } from '@fortawesome/vue-fontawesome'

import './tab_switcher.scss'

// TODO VUE3: change data to props
const findFirstUsable = (slots) => slots.findIndex(_ => _.data && _.data.attrs)

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
    }
  },
  data () {
    return {
      // TODO VUE3: add () after 'default'
      active: findFirstUsable(this.$slots.default)
    }
  },
  computed: {
    activeIndex () {
      // In case of controlled component
      if (this.activeTab) {
        return this.$slots.default.findIndex(slot => this.activeTab === slot.key)
      } else {
        return this.active
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
    // TODO VUE3: change data to props
    if (!currentSlot.data) {
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
      // TODO VUE3: add () at the end
      return this.$slots.default
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
  // TODO VUE3: remove 'h' here
  render (h) {
    const tabs = this.slots()
      .map((slot, index) => {
        // TODO VUE3 change to slot.props
        const props = slot.data && slot.data.attrs
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
      // TODO VUE3 change to slot.props
      const props = slot.data && slot.data.attrs
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
        <div ref="contents" class={'contents' + (this.scrollableTabs ? ' scrollable-tabs' : '')} v-body-scroll-lock={this.settingsModalVisible}>
          {contents}
        </div>
      </div>
    )
  }
}
