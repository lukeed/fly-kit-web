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
	yield this.watch(paths.scripts.src, ['eslint', 'scripts']);
	yield this.watch(paths.styles.src, 'styles');
	yield this.watch(paths.images.src, 'images');
	yield this.watch(paths.fonts.src, 'fonts');
	yield this.watch(paths.html.src, 'html');
	yield this.start('serve');
}

/**
 * Build the production files
 */
export function * build() {
	isProd = true;
	isWatch = false;
	yield this.start('clean');
	yield this.start(['eslint', 'images', 'fonts', 'scripts', 'styles', 'html'], {parallel: true});
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
export function * eslint() {
	yield this.source(paths.scripts.src).eslint();
}

// Copy all images, compress them, then send to dest
export function * images() {
	yield this.source(paths.images.src).target(paths.images.dest);

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
		// yield this.source(paths.html.dest).htmlmin();
	}
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
	yield this.source(paths.scripts.dest).uglify().target(paths.scripts.dest);
}

// Compile and automatically prefix stylesheets
export function * styles() {
	yield this
		.source(paths.styles.src)
		.sass({outputStyle: 'compressed'})
		.autoprefixer({
			browsers: ['Firefox <= 20']
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
export function* serve() {
	isServer = true;

	browserSync({
		notify: false,
		logPrefix: 'Fly',
		server: {
			baseDir: 'dist'
		}
	});
}
