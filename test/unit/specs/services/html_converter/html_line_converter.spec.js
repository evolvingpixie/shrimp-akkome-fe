import { convertHtmlToLines } from 'src/services/html_converter/html_line_converter.service.js'

const greentextHandle = new Set(['p', 'div'])
const mapOnlyText = (processor) => (input) => {
  if (input.text && input.level.every(l => greentextHandle.has(l))) {
    return processor(input.text)
  } else if (input.text) {
    return input.text
  } else {
    return input
  }
}

describe('html_line_converter', () => {
  describe('with processor that keeps original line should not make any changes to HTML when', () => {
    const processorKeep = (line) => line
    it('fed with regular HTML with newlines', () => {
      const inputOutput = '1<br/>2<p class="lol">3 4</p> 5 \n 6 <p > 7 <br> 8 </p> <br>\n<br/>'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with possibly broken HTML with invalid tags/composition', () => {
      const inputOutput = '<feeee dwdwddddddw> <i>ayy<b>lm</i>ao</b> </section>'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with very broken HTML with broken composition', () => {
      const inputOutput = '</p> lmao what </div> whats going on <div> wha <p>'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with sorta valid HTML but tags aren\'t closed', () => {
      const inputOutput = 'just leaving a <div> hanging'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with not really HTML at this point... tags that aren\'t finished', () => {
      const inputOutput = 'do you expect me to finish this <div class='
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with dubiously valid HTML (p within p and also div inside p)', () => {
      const inputOutput = 'look ma <p> p \nwithin <p> p! </p> and a <br/><div>div!</div></p>'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with maybe valid HTML? self-closing divs and ps', () => {
      const inputOutput = 'a <div class="what"/> what now <p aria-label="wtf"/> ?'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with valid XHTML containing a CDATA', () => {
      const inputOutput = 'Yes, it is me, <![CDATA[DIO]]>'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })

    it('fed with some recognized but not handled elements', () => {
      const inputOutput = 'testing images\n\n<img src="benis.png">'
      const result = convertHtmlToLines(inputOutput)
      const comparableResult = result.map(mapOnlyText(processorKeep)).join('')
      expect(comparableResult).to.eql(inputOutput)
    })
  })
  describe('with processor that replaces lines with word "_" should match expected line when', () => {
    const processorReplace = (line) => '_'
    it('fed with regular HTML with newlines', () => {
      const input = '1<br/>2<p class="lol">3 4</p> 5 \n 6 <p > 7 <br> 8 </p> <br>\n<br/>'
      const output = '_<br/>_<p class="lol">_</p>_\n_<p >_<br>_</p> <br>\n<br/>'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('fed with possibly broken HTML with invalid tags/composition', () => {
      const input = '<feeee dwdwddddddw> <i>ayy<b>lm</i>ao</b> </section>'
      const output = '_'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('fed with very broken HTML with broken composition', () => {
      const input = '</p> lmao what </div> whats going on <div> wha <p>'
      const output = '_<div>_<p>'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('fed with sorta valid HTML but tags aren\'t closed', () => {
      const input = 'just leaving a <div> hanging'
      const output = '_<div>_'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('fed with not really HTML at this point... tags that aren\'t finished', () => {
      const input = 'do you expect me to finish this <div class='
      const output = '_'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('fed with dubiously valid HTML (p within p and also div inside p)', () => {
      const input = 'look ma <p> p \nwithin <p> p! </p> and a <br/><div>div!</div></p>'
      const output = '_<p>_\n_<p>_</p>_<br/><div>_</div></p>'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('fed with maybe valid HTML? (XHTML) self-closing divs and ps', () => {
      const input = 'a <div class="what"/> what now <p aria-label="wtf"/> ?'
      const output = '_<div class="what"/>_<p aria-label="wtf"/>_'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('fed with valid XHTML containing a CDATA', () => {
      const input = 'Yes, it is me, <![CDATA[DIO]]>'
      const output = '_'
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })

    it('Testing handling ignored blocks', () => {
      const input = `
      <pre><code>&gt; rei = &quot;0&quot;
      &#39;0&#39;
      &gt; rei == 0
      true
      &gt; rei == null
      false</code></pre><blockquote>That, christian-like JS diagram but it’s evangelion instead.</blockquote>
      `
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(input)
    })
    it('Testing handling ignored blocks 2', () => {
      const input = `
      <blockquote>An SSL error has happened.</blockquote><p>Shakespeare</p>
      `
      const output = `
      <blockquote>An SSL error has happened.</blockquote><p>_</p>
      `
      const result = convertHtmlToLines(input)
      const comparableResult = result.map(mapOnlyText(processorReplace)).join('')
      expect(comparableResult).to.eql(output)
    })
  })
})
