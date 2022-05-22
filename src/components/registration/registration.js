import useVuelidate from '@vuelidate/core'
import { required, requiredIf, sameAs } from '@vuelidate/validators'
import { mapActions, mapState } from 'vuex'
import InterfaceLanguageSwitcher from '../interface_language_switcher/interface_language_switcher.vue'
import localeService from '../../services/locale/locale.service.js'

const registration = {
  setup () { return { v$: useVuelidate() } },
  data: () => ({
    user: {
      email: '',
      fullname: '',
      username: '',
      password: '',
      confirm: '',
      reason: '',
      language: ''
    },
    captcha: {}
  }),
  components: {
    InterfaceLanguageSwitcher
  },
  validations () {
    return {
      user: {
        email: { required: requiredIf(() => this.accountActivationRequired) },
        username: { required },
        fullname: { required },
        password: { required },
        confirm: {
          required,
          sameAs: sameAs(this.user.password)
        },
        reason: { required: requiredIf(() => this.accountApprovalRequired) },
        language: {}
      }
    }
  },
  created () {
    if ((!this.registrationOpen && !this.token) || this.signedIn) {
      this.$router.push({ name: 'root' })
    }

    this.setCaptcha()
  },
  computed: {
    token () { return this.$route.params.token },
    bioPlaceholder () {
      return this.replaceNewlines(this.$t('registration.bio_placeholder'))
    },
    reasonPlaceholder () {
      return this.replaceNewlines(this.$t('registration.reason_placeholder'))
    },
    ...mapState({
      registrationOpen: (state) => state.instance.registrationOpen,
      signedIn: (state) => !!state.users.currentUser,
      isPending: (state) => state.users.signUpPending,
      serverValidationErrors: (state) => state.users.signUpErrors,
      termsOfService: (state) => state.instance.tos,
      accountActivationRequired: (state) => state.instance.accountActivationRequired,
      accountApprovalRequired: (state) => state.instance.accountApprovalRequired
    })
  },
  methods: {
    ...mapActions(['signUp', 'getCaptcha']),
    async submit () {
      this.user.nickname = this.user.username
      this.user.token = this.token

      this.user.captcha_solution = this.captcha.solution
      this.user.captcha_token = this.captcha.token
      this.user.captcha_answer_data = this.captcha.answer_data
      if (this.user.language) {
        this.user.language = localeService.internalToBackendLocale(this.user.language)
      }

      this.v$.$touch()

      if (!this.v$.$invalid) {
        try {
          await this.signUp(this.user)
          this.$router.push({ name: 'friends' })
        } catch (error) {
          console.warn('Registration failed: ', error)
          this.setCaptcha()
        }
      }
    },
    setCaptcha () {
      this.getCaptcha().then(cpt => { this.captcha = cpt })
    },
    replaceNewlines (str) {
      return str.replace(/\s*\n\s*/g, ' \n')
    }
  }
}

export default registration
