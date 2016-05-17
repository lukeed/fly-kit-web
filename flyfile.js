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

exports.default = function * () {
	/** @desc Default Task: `watch` */
	yield this.start('watch');
};

exports.watch = function * () {
	/** @desc Main Task: Starts a server & Recompiles files on change */
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
};

exports.build = function * () {
	/** @desc Main Task: Build the production files */
	isProd = true;
	isWatch = false;

	yield this.start('clean');
	yield this.start(['lint', 'fonts', 'html', 'extras']);
	yield this.start(['images', 'styles', 'scripts', 'rev'], {parallel: false});
	yield this.start('cache');
};

// ###
// # Tasks
// ###

exports.clean = function * () {
	/** @desc Delete all files in the `dist` directory */
	yield this.clear('dist');
};

exports.lint = function * () {
	/** @desc Lint javascript files */
	yield this.source(paths.scripts.src).xo({
		globals: ['navigator', 'window']
	});
};

exports.images = function * () {
	/** @desc Compress and copy all images to `dist` */
	yield this
		.source(paths.images.src)
		.target(paths.images.dest, {depth: 1});

	reload();
};

exports.fonts = function * () {
	/** @desc Copy all fonts to `dist` */
	yield this.source(paths.fonts.src).target(paths.fonts.dest);
	reload();
};

exports.html = function * () {
	/** @desc Copy all HTML files to `dist`. Will run `htmlmin` during `build` task. */
	yield this.source(paths.html.src).target(paths.html.dest);
	return isProd ? yield this.start('htmlmin') : reload();
};

exports.htmlmin = function * () {
	/** @desc Minify all HTML files already within `dist`. Production only */
	yield this.source(paths.html.dest + '/*.html')
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
};

exports.extras = function * () {
	/** @desc Copy other root-level files to `dist` */
	yield this.source(paths.extras.src).target(paths.extras.dest);
};

exports.scripts = function * () {
	/** @desc Compile javascript files with Browserify. Will run `uglify` during `build` task.  */
	yield this
		.source('app/scripts/app.js')
		.browserify({
			transform: require('babelify').configure({presets: 'es2015'})
		})
		.concat('main.min.js')
		.target(paths.scripts.dest);

	return isProd ? yield this.start('uglify') : reload();
};

exports.uglify = function * () {
	/** @desc Minify all javascript files already within `dist` */
	yield this.source(paths.scripts.dest + '/*.js')
		.uglify({
			compress: {
				conditionals: true,
				comparisons: true,
				booleans: true,
				loops: true,
				/* eslint camelcase: 0 */
				join_vars: true,
				drop_console: true
			}
		})
		.target(paths.scripts.dest);
};

exports.styles = function * () {
	/** @desc Compile and prefix stylesheets with vendor properties */
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
};

exports.rev = function * () {
	/** @desc Version production assets. (Cache-Busting) */
	yield this.source('dist/{js,css}/**/*')
		.rev({
			strip: 'dist',
			replace: true
		})
		.revManifest({dirname: 'dist'})
    .revReplace({dirname: 'dist'})
    .target('dist');
};

exports.cache = function * () {
	/** @desc Cache assets so they are available offline! */
	var dir = paths.html.dest;

	yield this
		.source(dir + '/**/*.{js,html,css,png,jpg,gif}')
		.precache({
			root: dir,
			cacheId: 'fly-starter-kit',
			stripPrefix: dir
		});
};

exports.serve = function * () {
	/** @desc Launch a local server from the `dist` directory. */
	isServer = true;

	browserSync({
		notify: false,
		logPrefix: 'Fly',
		server: {
			baseDir: 'dist'
		}
	});

	yield []; // must yield something
};

// helper, reload browsersync
function reload() {
	if (isWatch && isServer) {
		browserSync.reload();
	}
}
