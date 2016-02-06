import browserSync from 'browser-sync';
const reload = browserSync.reload;

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

let isProd = false;
let isWatch = false;
let isServer = false;

/**
 * Default Task: watch
 */
export default function * () {
	yield this.start('watch');
}

/**
 * Run a dev server & Recompile when files change
 */
export function * watch() {
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
export function * build() {
	isProd = true;
	isWatch = false;
	yield this.start('clean');
	yield this.start(['lint', 'images', 'fonts', 'scripts', 'styles', 'html', 'extras'], {parallel: true});
	yield this.start('rev');
}

// ###
// # Tasks
// ###

// Delete the output directories
export function * clean() {
	yield this.clear('dist');
}

// Lint javascript
export function * lint() {
	yield this.source(paths.scripts.src).xo();
}

// Copy all images, compress them, then send to dest
export function * images() {
	yield this
		.source(paths.images.src)
		.target(paths.images.dest, {depth: 1});

	if (isWatch && isServer) {
		reload();
	}
}

// Copy all fonts, then send to dest
export function * fonts() {
	yield this.source(paths.fonts.src).target(paths.fonts.dest);

	if (isWatch && isServer) {
		reload();
	}
}

// Scan your HTML for assets & optimize them
export function * html() {
	yield this.source(paths.html.src).target(paths.html.dest);

	if (isWatch && isServer) {
		reload();
	} else if (isProd) {
		yield this.start('htmlmin');
	}
}

export function * htmlmin() {
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
export function * extras() {
	yield this.source(paths.extras.src).target(paths.extras.dest);
}

// Compile scripts
export function * scripts() {
	yield this
		.source(paths.scripts.src)
		.babel({
			presets: ['es2015'],
			sourceMaps: !isProd
		})
		.concat('main.min.js')
		.target(paths.scripts.dest);

	if (isWatch && isServer) {
		reload();
	} else if (isProd) {
		return yield this.start('uglify');
	}
}

export function * uglify() {
	yield this.source(`${paths.scripts.dest}/*.js`)
		.uglify({
			compress: {
	      conditionals:  true,
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
export function * styles() {
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

	if (isWatch && isServer) {
		reload();
	}
}

export function * rev() {
	const src = ['scripts', 'styles', 'images'].map(type => {
		return `${paths[type].dest}/**/*`;
	});

	return this.source(src).rev({
		base: paths.html.dest,
		replace: true
	});
}

// Launch loacl serve at develop directory
export function * serve() {
	isServer = true;

	browserSync({
		notify: false,
		logPrefix: 'Fly',
		server: {
			baseDir: 'dist'
		}
	});
}
