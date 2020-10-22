const rewire = require('rewire')
const defaults = rewire('react-scripts/scripts/build.js') // If you ejected, use this instead: const defaults = rewire('./build.js')
let config = defaults.__get__('config')

config.optimization.splitChunks = {
	cacheGroups: {
		default: false
	}
}

config.optimization.runtimeChunk = false

// Renames main.a96dfbf3.chunk.js.map to main.js
config.output.filename = 'static/js/[name].js'

// Renames main.a96dfbf3.css to main.css
config.plugins[5].options.filename = 'static/css/[name].css'
config.plugins[5].options.moduleFilename = () => 'static/css/main.css'