import routes from 'src/boot/routes'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createStore } from 'vuex'

const store = createStore({
  state: {
    instance: {}
  }
})

describe('routes', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes(store)
  })

  it('root path', async () => {
    await router.push('/main/all')

    const matchedComponents = router.currentRoute.value.matched

    expect(matchedComponents[0].components.default.components.hasOwnProperty('Timeline')).to.eql(true)
  })

  it('user\'s profile', async () => {
    await router.push('/fake-user-name')

    const matchedComponents = router.currentRoute.value.matched

    expect(matchedComponents[0].components.default.components.hasOwnProperty('UserCard')).to.eql(true)
  })

  it('user\'s profile at /users', async () => {
    await router.push('/users/fake-user-name')

    const matchedComponents = router.currentRoute.value.matched

    expect(matchedComponents[0].components.default.components.hasOwnProperty('UserCard')).to.eql(true)
  })
})
