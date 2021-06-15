import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import RichContent from 'src/components/rich_content/rich_content.jsx'

const localVue = createLocalVue()

const makeMention = (who) => `<span class="h-card"><a class="u-url mention" href="https://fake.tld/@${who}">@<span>${who}</span></a></span>`
const stubMention = (who) => `<span class="h-card"><mentionlink-stub url="https://fake.tld/@${who}" content="@<span>${who}</span>"></mentionlink-stub></span>`
const lastMentions = (...data) => `<span class="lastMentions">${data.join('')}</span>`
const p = (...data) => `<p>${data.join('')}</p>`
const compwrap = (...data) => `<span class="RichContent">${data.join('')}</span>`
const removedMentionSpan = '<span class="h-card"></span>'

describe('RichContent', () => {
  it('renders simple post without exploding', () => {
    const html = p('Hello world!')
    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(html))
  })

  it('removes mentions from the beginning of post', () => {
    const html = p(
      makeMention('John'),
      ' how are you doing thoday?'
    )
    const expected = p(
      removedMentionSpan,
      'how are you doing thoday?'
    )
    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('replaces first mention with mentionsline if hideMentions=false', () => {
    const html = p(
      makeMention('John'),
      ' how are you doing thoday?'
    )
    const expected = p(
      '<span class="h-card">',
      '<mentionsline-stub mentions="',
      '[object Object]',
      '"></mentionsline-stub>',
      '</span>',
      'how are you doing thoday?'
    )
    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: false,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('removes mentions from the end of the hellpost (<p>)', () => {
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
      p()
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('replaces mentions at the end of the hellpost if hideMentions=false (<p>)', () => {
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
        hideMentions: false,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('removes mentions from the end of the hellpost (<br>)', () => {
    const html = [
      'How are you doing today, fine gentlemen?',
      [
        makeMention('John'),
        makeMention('Josh'),
        makeMention('Jeremy')
      ].join('')
    ].join('<br>')
    const expected = [
      'How are you doing today, fine gentlemen?',
      // TODO fix this extra line somehow?
      '<br>'
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('removes mentions from the end of the hellpost (\\n)', () => {
    const html = [
      'How are you doing today, fine gentlemen?',
      [
        makeMention('John'),
        makeMention('Josh'),
        makeMention('Jeremy')
      ].join('')
    ].join('\n')
    const expected = [
      'How are you doing today, fine gentlemen?',
      // TODO fix this extra line somehow?
      ''
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('Does not remove mentions in the middle or at the end of text string', () => {
    const html = [
      [
        makeMention('Jack'),
        'let\'s meet up with ',
        makeMention('Janet')
      ].join(''),
      [
        'cc: ',
        makeMention('John'),
        makeMention('Josh'),
        makeMention('Jeremy')
      ].join('')
    ].join('\n')
    const expected = [
      [
        removedMentionSpan,
        'let\'s meet up with ',
        stubMention('Janet')
      ].join(''),
      [
        'cc: ',
        stubMention('John'),
        stubMention('Josh'),
        stubMention('Jeremy')
      ].join('')
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('removes mentions from the end if there\'s only one first mention', () => {
    const html = [
      p(
        makeMention('Todd'),
        'so anyway you are wrong'
      ),
      p(
        makeMention('Tom'),
        makeMention('Trace'),
        makeMention('Theodor')
      )
    ].join('')
    const expected = [
      p(
        removedMentionSpan,
        'so anyway you are wrong'
      ),
      // TODO fix this extra line somehow?
      p()
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('does not remove mentions from the end if there\'s more than one first mention', () => {
    const html = [
      p(
        makeMention('Zacharie'),
        makeMention('Zinaide'),
        'you guys have cool names, and so do these guys: '
      ),
      p(
        makeMention('Watson'),
        makeMention('Wallace'),
        makeMention('Wakamoto')
      )
    ].join('')
    const expected = [
      p(
        removedMentionSpan,
        removedMentionSpan,
        'you guys have cool names, and so do these guys: '
      ),
      p(
        lastMentions(
          stubMention('Watson'),
          stubMention('Wallace'),
          stubMention('Wakamoto')
        )
      )
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
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
        hideMentions: true,
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
        hideMentions: true,
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
        hideMentions: true,
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
        hideMentions: true,
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
        hideMentions: true,
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
      stubMention('lol'),
      '<span class="greentext">&gt;quote</span>',
      '<span class="greentext">&gt;quote</span>'
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
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
      [
        stubMention('foo'),
        stubMention('bar'),
        stubMention('baz')
      ].join(''),
      'Bruh'
    ].join('<br>')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('Don\'t remove last mention if it\'s the only one', () => {
    const html = [
      'Bruh',
      'Bruh',
      makeMention('foo'),
      makeMention('bar'),
      makeMention('baz')
    ].join('<br>')
    const expected = [
      'Bruh',
      'Bruh',
      stubMention('foo'),
      stubMention('bar'),
      stubMention('baz')
    ].join('<br>')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('Don\'t remove last mentions if there are more than one first mention - remove first instead', () => {
    const html = [
      [
        makeMention('foo'),
        makeMention('bar')
      ].join(' '),
      'Bruh',
      'Bruh',
      [
        makeMention('foo'),
        makeMention('bar'),
        makeMention('baz')
      ].join(' ')
    ].join('\n')

    const expected = [
      [
        removedMentionSpan,
        removedMentionSpan,
        'Bruh' // Due to trim we remove extra newline
      ].join(''),
      'Bruh',
      lastMentions([
        stubMention('foo'),
        stubMention('bar'),
        stubMention('baz')
      ].join(' '))
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('Remove last mentions if there\'s just one first mention - remove all', () => {
    const html = [
      [
        makeMention('foo')
      ].join(' '),
      'Bruh',
      'Bruh',
      [
        makeMention('foo'),
        makeMention('bar'),
        makeMention('baz')
      ].join(' ')
    ].join('\n')

    const expected = [
      [
        removedMentionSpan,
        'Bruh' // Due to trim we remove extra newline
      ].join(''),
      'Bruh\n' // Can't remove this one yet
    ].join('\n')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
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
      ' <a class="hashtag" data-tag="nou" href="https://shitposter.club/tag/nou" target="_blank">',
      '#nou</a>',
      ' <a class="hashtag" data-tag="screencap" href="https://shitposter.club/tag/screencap" target="_blank">',
      '#screencap</a>',
      ' </p>'
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: true,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('rich contents of a mention are handled properly', () => {
    const html = [
      p(
        'Testing'
      ),
      p(
        '<a href="lol" class="mention">',
        '<span>',
        'https://</span>',
        '<span>',
        'lol.tld/</span>',
        '<span>',
        '</span>',
        '</a>'
      )
    ].join('')
    const expected = [
      p(
        'Testing'
      ),
      p(
        '<mentionlink-stub url="lol" content="',
        '<span>',
        'https://</span>',
        '<span>',
        'lol.tld/</span>',
        '<span>',
        '</span>',
        '">',
        '</mentionlink-stub>'
      )
    ].join('')

    const wrapper = shallowMount(RichContent, {
      localVue,
      propsData: {
        hideMentions: false,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })

  it('rich contents of a mention in beginning are handled properly', () => {
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
        '<mentionlink-stub content="',
        '<span>',
        'https://</span>',
        '<span>',
        'lol.tld/</span>',
        '<span>',
        '</span>',
        '" url="lol" class="mention-link">',
        '</mentionlink-stub>',
        '<!---->', // v-if placeholder
        '</span>'
      ),
      p(
        'Testing'
      )
    ].join('')

    const wrapper = mount(RichContent, {
      localVue,
      stubs: {
        MentionLink: true
      },
      propsData: {
        hideMentions: false,
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
        hideMentions: false,
        handleLinks: true,
        greentext: true,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(expected))
  })
})
