const createRuffleService = () => {
  let ruffleInstance = null

  const getRuffle = () => new Promise((resolve, reject) => {
    if (ruffleInstance) {
      resolve(ruffleInstance)
      return
    }
    // Ruffle needs these to be set before it's loaded
    // https://github.com/ruffle-rs/ruffle/issues/3952
    window.RufflePlayer = {}
    window.RufflePlayer.config = {
      polyfills: false,
      publicPath: '/static/ruffle'
    }

    // Currently it's seems like a better way of loading ruffle
    // because it needs the wasm publically accessible, but it needs path to it
    // and filename of wasm seems to be pseudo-randomly generated (is it a hash?)
    const script = document.createElement('script')
    // see webpack config, using CopyPlugin to copy it from node_modules
    // provided via ruffle-mirror
    script.src = '/static/ruffle/ruffle.js'
    script.type = 'text/javascript'
    script.onerror = (e) => { reject(e) }
    script.onabort = (e) => { reject(e) }
    script.oncancel = (e) => { reject(e) }
    script.onload = () => {
      ruffleInstance = window.RufflePlayer
      resolve(ruffleInstance)
    }
    document.body.appendChild(script)
  })

  return { getRuffle }
}

const RuffleService = createRuffleService()

export default RuffleService
