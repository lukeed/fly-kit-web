import browserSync from 'browser-sync';
const reload = browserSync.reload;

const paths = {
	scripts: {
		src: ['app/scripts/**/*.js'],
		dest: 'dist/js'
	},
	styles: {
		src: ['app/styles/**/*.{sass,scss}'],
		dest: 'dist/css'
	},
	images: {
		src: ['app/images/**/*'],
		dest: 'dist/img'
	},
	fonts: {
		src: ['app/fonts/**/*'],
		dest: 'dist/fonts'
	},
	html: {
		src: ['app/*.html'],
		dest: 'dist'
	}
};

const PREFIXER = [
	'ie >= 10',
	'ie_mob >= 10',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 7',
	'android >= 4.4',
	'bb >= 10'
];

let isProd = false;
let isWatch = false;
let isServer = false;

/**
 * Default Task
 */
export default function* () {
	isWatch = true;
	isProd = false;
	yield this.start('clean');
	yield this.watch(paths.scripts.src, ['eslint', 'scripts']);
	yield this.watch(paths.styles.src, 'styles');
	yield this.watch(paths.images.src, 'images');
	yield this.watch(paths.fonts.src, 'fonts');
	yield this.watch(paths.html.src, 'html');
}

/**
 * Run a dev server & Recompile when files change
 */
export function* watch() {
	yield this.start(['_serve', 'default']);
}

/**
 * Build & Serve the production files
 */
export function* serve() {
	yield this.start(['build', '_serve'])
}

export function* build() {
	isProd = true; isWatch = false;
	yield this.start('clean');
	yield this.start(['eslint', 'images', 'fonts', 'scripts', 'styles', 'html'], {parallel: true});
}

// ###
// # Tasks
// ###

// Delete the output directories
export function* clean() {
	yield this.clear('dist');
}

// Lint javascript
export function* eslint() {
	yield this.source(paths.scripts.src).eslint();
}

// Copy all images, compress them, then send to dest
export function* images() {
  // yield this.clear(paths.scripts.dest);
	yield this.source(paths.images.src).target(paths.images.dest);

	if (isWatch && isServer) {
		reload();
	}
}

// Copy all fonts, then send to dest
export function* fonts() {
  // yield this.clear(paths.fonts.dest);
	yield this.source(paths.fonts.src).target(paths.fonts.dest);

	if (isWatch && isServer) {
		reload();
	}
}

// Scan your HTML for assets & optimize them
export function* html() {
  // yield this.clear(paths.html.dest);
	yield this.source(paths.html.src).target(paths.html.dest);

	if (isWatch && isServer) {
		reload();
	} else if (isProd) {
		yield this.source(paths.html.dest).htmlmin();
	}
}

//
export function* scripts() {
  // yield this.clear(paths.scripts.dest);
	yield this
		.source(paths.scripts.src)
		.babel({
      presets: ['es2015'],
      sourceMaps: true
		})
		.concat('main.min.js')
		.target(paths.scripts.dest);

	if (isWatch && isServer) {
		reload();
	} else if (isProd) {
		yield this.source(paths.scripts.dest).uglify();
	}
}

// Compile and automatically prefix stylesheets
export function* styles() {
  // yield this.clear(paths.styles.dest);
	yield this
		.source(paths.styles.src)
		.sass({outputStyle: 'compressed'})
		.concat('main.min.css')
		.target(paths.styles.dest);

	if (isWatch && isServer) {
		reload();
	}
}

// Launch loacl serve at develop directory
export function* _serve() {
	isServer = true;

	browserSync({
		notify: false,
		logPrefix: ' ✈ ',
		server: {
			baseDir: 'dist'
		}
	});
}
