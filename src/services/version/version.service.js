
export const extractCommit = versionString => {
  // X.Y.Z-1337-gdeadbeef => deadbeef
  const commit = versionString.match(/-g(\w+)/i)
  if (commit) {
    return commit[1]
  }

  // X.Y.Z-develop => develop
  const branch = versionString.match(/-([\w-/]+)$/i)
  if (branch) {
    return branch[1]
  }

  // X.Y.Z => vX.Y.Z
  return 'v' + versionString
}
