import { shallowMount, createLocalVue } from '@vue/test-utils'
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
        handleLinks: false,
        greentext: false,
        emoji: [],
        html
      }
    })

    expect(wrapper.html()).to.eql(compwrap(html))
  })
})
