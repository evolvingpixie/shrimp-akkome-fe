// eslint-disable-next-line no-unused
import { h } from 'vue'
import isEmpty from 'lodash/isEmpty'
import { getComponentProps } from '../../services/component_utils/component_utils'
import './with_load_more.scss'

import { FontAwesomeIcon as FAIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCircleNotch
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faCircleNotch
)

const withLoadMore = ({
  fetch, // function to fetch entries and return a promise
  select, // function to select data from store
  unmounted, // function called at "destroyed" lifecycle
  childPropName = 'entries', // name of the prop to be passed into the wrapped component
  additionalPropNames = [] // additional prop name list of the wrapper component
}) => (WrappedComponent) => {
  const originalProps = Object.keys(getComponentProps(WrappedComponent))
  const props = originalProps.filter(v => v !== childPropName).concat(additionalPropNames)

  return {
    props,
    data () {
      return {
        loading: false,
        bottomedOut: false,
        error: false,
        entries: []
      }
    },
    created () {
      window.addEventListener('scroll', this.scrollLoad)
      if (this.entries.length === 0) {
        this.fetchEntries()
      }
    },
    unmounted () {
      window.removeEventListener('scroll', this.scrollLoad)
      unmounted && unmounted(this.$props, this.$store)
    },
    methods: {
      // Entries is not a computed because computed can't track the dynamic
      // selector for changes and won't trigger after fetch.
      updateEntries () {
        this.entries = select(this.$props, this.$store) || []
      },
      fetchEntries () {
        if (!this.loading) {
          this.loading = true
          this.error = false
          fetch(this.$props, this.$store)
            .then((newEntries) => {
              this.loading = false
              this.bottomedOut = isEmpty(newEntries)
            })
            .catch(() => {
              this.loading = false
              this.error = true
            })
            .finally(() => {
              this.updateEntries()
            })
        }
      },
      scrollLoad (e) {
        const bodyBRect = document.body.getBoundingClientRect()
        const height = Math.max(bodyBRect.height, -(bodyBRect.y))
        if (this.loading === false &&
          this.bottomedOut === false &&
          this.$el.offsetHeight > 0 &&
          (window.innerHeight + window.pageYOffset) >= (height - 750)
        ) {
          this.fetchEntries()
        }
      }
    },
    render () {
      const props = {
        ...this.$props,
        [childPropName]: this.entries
      }
      const children = this.$slots
      return (
        <div class="with-load-more">
          <WrappedComponent {...props}>
            {children}
          </WrappedComponent>
          <div class="with-load-more-footer">
            {this.error &&
              <button onClick={this.fetchEntries} class="button-unstyled -link -fullwidth alert error">
                {this.$t('general.generic_error')}
              </button>
            }
            {!this.error && this.loading && <FAIcon spin icon="circle-notch"/>}
            {!this.error && !this.loading && !this.bottomedOut && <a onClick={this.fetchEntries}>{this.$t('general.more')}</a>}
          </div>
        </div>
      )
    }
  }
}

export default withLoadMore
