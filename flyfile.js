import browserSync from 'browser-sync';

let isProd = false;
let isWatch = false;
let isServer = false;

const paths = {
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

export default async function () {
	/** @desc Default Task: `watch` */
	await this.start('watch');
};

export async function watch() {
	/** @desc Main Task: Starts a server & Recompiles files on change */
	isWatch = true;
	isProd = false;

	await this.start('clean');
	await this.watch(paths.scripts.src, ['lint', 'scripts']);
	await this.watch(paths.styles.src, 'styles');
	await this.watch(paths.images.src, 'images');
	await this.watch(paths.fonts.src, 'fonts');
	await this.watch(paths.html.src, 'html');
	await this.start('extras');
	await this.start('serve');
};

export async function build() {
	/** @desc Main Task: Build the production files */
	isProd = true;
	isWatch = false;

	await this.start('clean');
	await this.start(['lint', 'fonts', 'html', 'extras']);
	await this.start(['images', 'styles', 'scripts']);
	await this.start('rev');
	await this.start('cache');
};

// ###
// # Tasks
// ###

export async function clean() {
	/** @desc Delete all files in the `dist` directory */
	await this.clear('dist');
};

export async function lint() {
	/** @desc Lint javascript files */
	await this.source(paths.scripts.src).xo({
		globals: ['navigator', 'window']
	});
};

export async function images() {
	/** @desc Compress and copy all images to `dist` */
	await this
		.source(paths.images.src)
		.target(paths.images.dest, {depth: 1});

	reload();
};

export async function fonts() {
	/** @desc Copy all fonts to `dist` */
	await this.source(paths.fonts.src).target(paths.fonts.dest);
	reload();
};

export async function html() {
	/** @desc Copy all HTML files to `dist`. Will run `htmlmin` during `build` task. */
	await this.source(paths.html.src).target(paths.html.dest);
	return isProd ? await this.start('htmlmin') : reload();
};

export async function htmlmin() {
	/** @desc Minify all HTML files already within `dist`. Production only */
	await this.source(paths.html.dest + '/*.html')
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

export async function extras() {
	/** @desc Copy other root-level files to `dist` */
	await this.source(paths.extras.src).target(paths.extras.dest);
};

export async function scripts() {
	/** @desc Compile javascript files with Browserify. Will run `uglify` during `build` task.  */
	await this
		.source('app/scripts/app.js')
		.browserify({
			transform: require('babelify').configure({presets: 'es2015'})
		})
		.concat('main.min.js')
		.target(paths.scripts.dest);

	return isProd ? await this.start('uglify') : reload();
};

export async function uglify() {
	/** @desc Minify all javascript files already within `dist` */
	await this.source(paths.scripts.dest + '/*.js')
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

export async function styles() {
	/** @desc Compile and prefix stylesheets with vendor properties */
	await this
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

export async function rev() {
	/** @desc Version/Hashify production assets. (Cache-Busting) */
	var src = ['scripts', 'styles'].map(type => {
		return paths[type].dest + '/**/*.*';
	});

	return this.source(src).rev({
		base: paths.html.dest,
		replace: true
	});
};

export async function cache() {
	/** @desc Cache assets so they are available offline! */
	var dir = paths.html.dest;

	await this
		.source(dir + '/**/*.{js,html,css,png,jpg,gif}')
		.precache({
			root: dir,
			cacheId: 'fly-starter-kit',
			stripPrefix: dir
		});
};

export async function serve() {
	/** @desc Launch a local server from the `dist` directory. */
	isServer = true;

	browserSync({
		notify: false,
		logPrefix: 'Fly',
		server: {
			baseDir: 'dist'
		}
	});
};

// helper, reload browsersync
function reload() {
	if (isWatch && isServer) {
		browserSync.reload();
	}
}
