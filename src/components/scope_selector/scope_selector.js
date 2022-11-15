import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEnvelope,
  faLock,
  faLockOpen,
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEnvelope,
  faGlobe,
  faLock,
  faLockOpen
)

const SCOPE_LEVELS = {
  'direct': 0,
  'private': 1,
  'local': 2,
  'unlisted': 2,
  'public': 3
}

const ScopeSelector = {
  props: [
    'showAll',
    'userDefault',
    'originalScope',
    'initialScope',
    'onScopeChange'
  ],
  data () {
    return {
      currentScope: this.initialScope
    }
  },
  computed: {
    showNothing () {
      return !this.showPublic && !this.showUnlisted && !this.showPrivate && !this.showDirect
    },
    showPublic () {
      return this.originalScope !== 'direct' && this.shouldShow('public')
    },
    showLocal () {
      return this.originalScope !== 'direct' && this.shouldShow('local')
    },
    showUnlisted () {
      return this.originalScope !== 'direct' && this.shouldShow('unlisted')
    },
    showPrivate () {
      return this.originalScope !== 'direct' && this.shouldShow('private')
    },
    showDirect () {
      return this.shouldShow('direct')
    },
    css () {
      return {
        public: { selected: this.currentScope === 'public' },
        unlisted: { selected: this.currentScope === 'unlisted' },
        private: { selected: this.currentScope === 'private' },
        direct: { selected: this.currentScope === 'direct' },
        local: { selected: this.currentScope === 'local' }
      }
    }
  },
  methods: {
    shouldShow (scope) {
      if (!this.originalScope) {
        return true
      }

      if (this.originalScope === 'local') {
        return scope === 'direct' || scope === 'local'
      }

      return SCOPE_LEVELS[scope] <= SCOPE_LEVELS[this.originalScope]
    },
    changeVis (scope) {
      this.currentScope = scope
      this.onScopeChange && this.onScopeChange(scope)
    }
  }
}

export default ScopeSelector
