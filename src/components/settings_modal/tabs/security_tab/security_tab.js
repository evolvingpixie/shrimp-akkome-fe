import ProgressButton from 'src/components/progress_button/progress_button.vue'
import Checkbox from 'src/components/checkbox/checkbox.vue'
import Mfa from './mfa.vue'
import localeService from 'src/services/locale/locale.service.js'

const SecurityTab = {
  data () {
    return {
      newEmail: '',
      changeEmailError: false,
      changeEmailPassword: '',
      changedEmail: false,
      deletingAccount: false,
      deleteAccountConfirmPasswordInput: '',
      deleteAccountError: false,
      changePasswordInputs: [ '', '', '' ],
      changedPassword: false,
      changePasswordError: false,
      moveAccountTarget: '',
      moveAccountPassword: '',
      movedAccount: false,
      moveAccountError: false,
      aliases: [],
      listAliasesError: false,
      addAliasTarget: '',
      addedAlias: false,
      addAliasError: false
    }
  },
  created () {
    this.$store.dispatch('fetchTokens')
    this.fetchAliases()
  },
  components: {
    ProgressButton,
    Mfa,
    Checkbox
  },
  computed: {
    user () {
      return this.$store.state.users.currentUser
    },
    pleromaBackend () {
      return this.$store.state.instance.pleromaBackend
    },
    oauthTokens () {
      return this.$store.state.oauthTokens.tokens.map(oauthToken => {
        return {
          id: oauthToken.id,
          appName: oauthToken.app_name,
          validUntil: new Date(oauthToken.valid_until).toLocaleDateString(localeService.internalToBrowserLocale(this.$i18n.locale))
        }
      })
    }
  },
  methods: {
    confirmDelete () {
      this.deletingAccount = true
    },
    deleteAccount () {
      this.$store.state.api.backendInteractor.deleteAccount({ password: this.deleteAccountConfirmPasswordInput })
        .then((res) => {
          if (res.status === 'success') {
            this.$store.dispatch('logout')
            this.$router.push({ name: 'root' })
          } else {
            this.deleteAccountError = res.error
          }
        })
    },
    changePassword () {
      const params = {
        password: this.changePasswordInputs[0],
        newPassword: this.changePasswordInputs[1],
        newPasswordConfirmation: this.changePasswordInputs[2]
      }
      this.$store.state.api.backendInteractor.changePassword(params)
        .then((res) => {
          if (res.status === 'success') {
            this.changedPassword = true
            this.changePasswordError = false
            this.logout()
          } else {
            this.changedPassword = false
            this.changePasswordError = res.error
          }
        })
    },
    changeEmail () {
      const params = {
        email: this.newEmail,
        password: this.changeEmailPassword
      }
      this.$store.state.api.backendInteractor.changeEmail(params)
        .then((res) => {
          if (res.status === 'success') {
            this.changedEmail = true
            this.changeEmailError = false
          } else {
            this.changedEmail = false
            this.changeEmailError = res.error
          }
        })
    },
    moveAccount () {
      const params = {
        targetAccount: this.moveAccountTarget,
        password: this.moveAccountPassword
      }
      this.$store.state.api.backendInteractor.moveAccount(params)
        .then((res) => {
          if (res.status === 'success') {
            this.movedAccount = true
            this.moveAccountError = false
          } else {
            this.movedAccount = false
            this.moveAccountError = res.error
          }
        })
    },
    removeAlias (alias) {
      this.$store.state.api.backendInteractor.deleteAlias({ alias })
        .then(() => this.fetchAliases())
    },
    addAlias () {
      this.$store.state.api.backendInteractor.addAlias({ alias: this.addAliasTarget })
        .then((res) => {
          this.addedAlias = true
          this.addAliasError = false
          this.addAliasTarget = ''
        })
        .catch((error) => {
          this.addedAlias = false
          this.addAliasError = error
        })
        .then(() => this.fetchAliases())
    },
    fetchAliases () {
      this.$store.state.api.backendInteractor.listAliases()
        .then((res) => {
          this.aliases = res.aliases
          this.listAliasesError = false
        })
        .catch((error) => {
          this.listAliasesError = error.error
        })
    },
    logout () {
      this.$store.dispatch('logout')
      this.$router.replace('/')
    },
    revokeToken (id) {
      if (window.confirm(`${this.$i18n.t('settings.revoke_token')}?`)) {
        this.$store.dispatch('revokeToken', id)
      }
    }
  }
}

export default SecurityTab
