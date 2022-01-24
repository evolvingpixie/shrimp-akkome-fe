import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import RichContent from 'src/components/rich_content/rich_content.jsx'

const localVue = createLocalVue()
const attentions = []

const makeMention = (who) => {
  attentions.push({ statusnet_profile_url: `https://fake.tld/@${who}` })
  return `<span class="h-card"><a class="u-url mention" href="https://fake.tld/@${who}">@<span>${who}</span></a></span>`
}
const p = (...data) => `<p>${data.join('')}</p>`
const compwrap = (...data) => `<span class="RichContent">${data.join('')}</span>`
const mentionsLine = (times) => [
  '<mentionsline-stub mentions="',
  new Array(times).fill('[object Object]').join(','),
  '"></mentionsline-stub>'
].join('')

describe('RichContent', () => {
  it('renders simple post without exploding', () => {
    const html = p('Hello world!')
    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(html))
  })

  it('unescapes everything as needed', () => {
    const html = [
      p('Testing &#39;em all'),
      'Testing &#39;em all'
    ].join('')
    const expected = [
      p('Testing \'em all'),
      'Testing \'em all'
    ].join('')
    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('replaces mention with mentionsline', () => {
    const html = p(
      makeMention('John'),
      ' how are you doing today?'
    )
    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(p(
      mentionsLine(1),
      ' how are you doing today?'
    )))
  })

  it('replaces mentions at the end of the hellpost', () => {
    const html = [
      p('How are you doing today, fine gentlemen?'),
      p(
        makeMention('John'),
        makeMention('Josh'),
        makeMention('Jeremy')
      )
    ].join('')
    const expected = [
      p(
        'How are you doing today, fine gentlemen?'
      ),
      // TODO fix this extra line somehow?
      p(
        '<mentionsline-stub mentions="',
        '[object Object],',
        '[object Object],',
        '[object Object]',
        '"></mentionsline-stub>'
      )
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('Does not touch links if link handling is disabled', () => {
    const html = [
      [
        makeMention('Jack'),
        'let\'s meet up with ',
        makeMention('Janet')
      ].join(''),
      [
        makeMention('John'),
        makeMention('Josh'),
        makeMention('Jeremy')
      ].join('')
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: false,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(html))
  })

  it('Adds greentext and cyantext to the post', () => {
    const html = [
      '&gt;preordering videogames',
      '&gt;any year'
    ].join('\n')
    const expected = [
      '<span class="greentext">&gt;preordering videogames</span>',
      '<span class="greentext">&gt;any year</span>'
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: false,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('Does not add greentext and cyantext if setting is set to false', () => {
    const html = [
      '&gt;preordering videogames',
      '&gt;any year'
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: false,
        greentext: false,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(html))
  })

  it('Adds emoji to post', () => {
    const html = p('Ebin :DDDD :spurdo:')
    const expected = p(
      'Ebin :DDDD ',
      '<anonymous-stub alt=":spurdo:" src="about:blank" title=":spurdo:" class="emoji img"></anonymous-stub>'
    )

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: false,
        greentext: false,
        emoji: [{ url: 'about:blank', shortcode: 'spurdo' }],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('Doesn\'t add nonexistent emoji to post', () => {
    const html = p('Lol :lol:')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: false,
        greentext: false,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(html))
  })

  it('Greentext + last mentions', () => {
    const html = [
      '&gt;quote',
      makeMention('lol'),
      '&gt;quote',
      '&gt;quote'
    ].join('\n')
    const expected = [
      '<span class="greentext">&gt;quote</span>',
      mentionsLine(1),
      '<span class="greentext">&gt;quote</span>',
      '<span class="greentext">&gt;quote</span>'
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('One buggy example', () => {
    const html = [
      'Bruh',
      'Bruh',
      [
        makeMention('foo'),
        makeMention('bar'),
        makeMention('baz')
      ].join(''),
      'Bruh'
    ].join('<br>')
    const expected = [
      'Bruh',
      'Bruh',
      mentionsLine(3),
      'Bruh'
    ].join('<br>')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('buggy example/hashtags', () => {
    const html = [
      '<p>',
      '<a href="http://macrochan.org/images/N/H/NHCMDUXJPPZ6M3Z2CQ6D2EBRSWGE7MZY.jpg">',
      'NHCMDUXJPPZ6M3Z2CQ6D2EBRSWGE7MZY.jpg</a>',
      ' <a class="hashtag" data-tag="nou" href="https://shitposter.club/tag/nou">',
      '#nou</a>',
      ' <a class="hashtag" data-tag="screencap" href="https://shitposter.club/tag/screencap">',
      '#screencap</a>',
      ' </p>'
    ].join('')
    const expected = [
      '<p>',
      '<a href="http://macrochan.org/images/N/H/NHCMDUXJPPZ6M3Z2CQ6D2EBRSWGE7MZY.jpg" target="_blank">',
      'NHCMDUXJPPZ6M3Z2CQ6D2EBRSWGE7MZY.jpg</a>',
      ' <hashtaglink-stub url="https://shitposter.club/tag/nou" content="#nou" tag="nou">',
      '</hashtaglink-stub>',
      ' <hashtaglink-stub url="https://shitposter.club/tag/screencap" content="#screencap" tag="screencap">',
      '</hashtaglink-stub>',
      ' </p>'
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('rich contents of a mention are handled properly', () => {
    attentions.push({ statusnet_profile_url: 'lol' })
    const html = [
      p(
        '<a href="lol" class="mention">',
        '<span>',
        'https://</span>',
        '<span>',
        'lol.tld/</span>',
        '<span>',
        '</span>',
        '</a>'
      ),
      p(
        'Testing'
      )
    ].join('')
    const expected = [
      p(
        '<span class="MentionsLine">',
        '<span class="MentionLink mention-link">',
        '<a href="lol" target="_blank" class="original">',
        '<span>',
        'https://</span>',
        '<span>',
        'lol.tld/</span>',
        '<span>',
        '</span>',
        '</a>',
        ' ',
        '<!---->', // v-if placeholder, mentionlink's "new" (i.e. rich) display
        '</span>',
        '<!---->', // v-if placeholder, mentionsline's extra mentions and stuff
        '</span>'
      ),
      p(
        'Testing'
      )
    ].join('')

    const wrapper = mount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('rich contents of a link are handled properly', () => {
    const html = [
      '<p>',
      'Freenode is dead.</p>',
      '<p>',
      '<a href="https://isfreenodedeadyet.com/">',
      '<span>',
      'https://</span>',
      '<span>',
      'isfreenodedeadyet.com/</span>',
      '<span>',
      '</span>',
      '</a>',
      '</p>'
    ].join('')
    const expected = [
      '<p>',
      'Freenode is dead.</p>',
      '<p>',
      '<a href="https://isfreenodedeadyet.com/" target="_blank">',
      '<span>',
      'https://</span>',
      '<span>',
      'isfreenodedeadyet.com/</span>',
      '<span>',
      '</span>',
      '</a>',
      '</p>'
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        attentions,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it.skip('[INFORMATIVE] Performance testing, 10 000 simple posts', () => {
    const amount = 20

    const onePost = p(
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      makeMention('Lain'),
      ' i just landed in l a where are you'
    )

    const TestComponent = {
      template: `
      <div v-if="!vhtml">
        ${new Array(amount).fill(`<RichContent html="${onePost}" :greentext="true" :handleLinks="handeLinks" :emoji="[]" :attentions="attentions"/>`)}
      </div>
      <div v-else="vhtml">
        ${new Array(amount).fill(`<div v-html="${onePost}"/>`)}
      </div>
      `,
      props: ['handleLinks', 'attentions', 'vhtml']
    }
    console.log(1)

    const ptest = (handleLinks, vhtml) => {
      const t0 = performance.now()

      const wrapper = mount(TestComponent, {
        localVue,
        propsData: {
          attentions,
          handleLinks,
          vhtml
        }
      })

      const t1 = performance.now()

      wrapper.destroy()

      const t2 = performance.now()

      return `Mount: ${t1 - t0}ms, destroy: ${t2 - t1}ms, avg ${(t1 - t0) / amount}ms - ${(t2 - t1) / amount}ms per item`
    }

    console.log(`${amount} items with links handling:`)
    console.log(ptest(true))
    console.log(`${amount} items without links handling:`)
    console.log(ptest(false))
    console.log(`${amount} items plain v-html:`)
    console.log(ptest(false, true))
  })
})
