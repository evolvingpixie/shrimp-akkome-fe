import { extractCommit } from 'src/services/version/version.service.js'

describe('extractCommit', () => {
  it('return short commit hash following "-g" characters', () => {
    expect(extractCommit('1.0.0-45-g5e7aeebc')).to.eql('5e7aeebc')
  })

  it('return short commit hash without branch name', () => {
    expect(extractCommit('1.0.0-45-g5e7aeebc-branch')).to.eql('5e7aeebc')
  })

  it('return branch name', () => {
    expect(extractCommit('1.0.0-branch')).to.eql('branch')
  })

  it('return version tag', () => {
    expect(extractCommit('1.0.0')).to.eql('v1.0.0')
  })
})
