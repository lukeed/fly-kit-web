var x = module.exports;
var browserSync = require('browser-sync');

var isProd = false;
var isWatch = false;
var isServer = false;

var paths = {
	scripts: {
		src: ['app/scripts/**/*.js'],
		dest: 'dist/js'
	},
	styles: {
		src: 'app/styles/**/*.{sass,scss}',
		dest: 'dist/css'
	},
	images: {
		src: 'app/images/**/*.{jpg,png}',
		dest: 'dist/img'
	},
	fonts: {
		src: 'app/fonts/**/*.*',
		dest: 'dist/fonts'
	},
	html: {
		src: 'app/*.html',
		dest: 'dist'
	},
	extras: {
		src: 'app/*.{txt,json,webapp,ico}',
		dest: 'dist'
	}
};

/**
 * Default Task: watch
 */
x.default = function * () {
	yield this.start('watch');
};

/**
 * Run a dev server & Recompile when files change
 */
x.watch = function * () {
	isWatch = true;
	isProd = false;
	yield this.start('clean');
	yield this.watch(paths.scripts.src, ['lint', 'scripts']);
	yield this.watch(paths.styles.src, 'styles');
	yield this.watch(paths.images.src, 'images');
	yield this.watch(paths.fonts.src, 'fonts');
	yield this.watch(paths.html.src, 'html');
	yield this.start('extras');
	yield this.start('serve');
}

/**
 * Build the production files
 */
x.build = function * () {
	isProd = true;
	isWatch = false;
	yield this.start('clean');
	yield this.start(['lint', 'images', 'fonts', 'styles', 'html', 'extras'], {parallel: true});
	yield this.start('scripts', 'rev');
	yield this.start('cache');
}

// ###
// # Tasks
// ###

// Delete the output directories
x.clean = function * () {
	yield this.clear('dist');
}

// Lint javascript
x.lint = function * () {
	yield this.source(paths.scripts.src).xo({
		globals: ['navigator', 'window']
	});
}

// Copy all images, compress them, then send to dest
x.images = function * () {
	yield this
		.source(paths.images.src)
		.target(paths.images.dest, {depth: 1});

	reload();
}

// Copy all fonts, then send to dest
x.fonts = function * () {
	yield this.source(paths.fonts.src).target(paths.fonts.dest);
	reload();
}

// Scan your HTML for assets & optimize them
x.html = function * () {
	yield this.source(paths.html.src).target(paths.html.dest);
	isProd ? yield this.start('htmlmin') : reload();
}

x.htmlmin = function * () {
	yield this.source(`${paths.html.dest}/*.html`)
		.htmlmin({
			removeComments: true,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes: true,
			removeRedundantAttributes: true,
			removeEmptyAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			removeOptionalTags: true
		})
		.target(paths.html.dest);
}

// Copy other root-level files
x.extras = function * () {
	yield this.source(paths.extras.src).target(paths.extras.dest);
}

// Compile scripts
x.scripts = function * () {
	yield this
		.source('app/scripts/app.js')
		.browserify({
			transform: require('babelify').configure({presets: 'es2015'})
		})
		.concat('main.min.js')
		.target(paths.scripts.dest);

	isProd ? yield this.start('uglify') : reload();
}

x.uglify = function * () {
	yield this.source(`${paths.scripts.dest}/*.js`)
		.uglify({
			compress: {
				conditionals: true,
				comparisons: true,
				booleans: true,
				loops: true,
				join_vars: true,
				drop_console: true
			}
		})
		.target(paths.scripts.dest);
}

// Compile and automatically prefix stylesheets
x.styles = function * () {
	yield this
		.source(paths.styles.src)
		.sass({outputStyle: 'compressed'})
		.autoprefixer({
			browsers: [
				'ie >= 10',
				'ie_mob >= 10',
				'ff >= 30',
				'chrome >= 34',
				'safari >= 7',
				'opera >= 23',
				'ios >= 7',
				'android >= 4.4',
				'bb >= 10'
			]
		})
		.concat('main.min.css')
		.target(paths.styles.dest);

	reload();
}

// Version these assets (Cache-busting)
x.rev = function * () {
	const src = ['scripts', 'styles', 'images'].map(type => {
		return `${paths[type].dest}/**/*`;
	});

	return this.source(src).rev({
		base: paths.html.dest,
		replace: true
	});
}

// Cache assets so they are available offline!
x.cache = function * () {
	const dir = paths.html.dest;
	const ext = '{js,html,css,png,jpg,gif}';

	yield this
		.source(`${dir}/**/*.${ext}`)
		.precache({
			root: dir,
			cacheId: 'fly-starter-kit',
			stripPrefix: dir
		})
}

// Launch loacl serve at develop directory
x.serve = function * () {
	isServer = true;

	browserSync({
		notify: false,
		logPrefix: 'Fly',
		server: {
			baseDir: 'dist'
		}
	});
}

// helper, reload browsersync
function reload() {
	if (isWatch && isServer) {
		browserSync.reload();
	}
}
