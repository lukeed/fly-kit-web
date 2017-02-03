'use strict';

const bs = require('browser-sync');
const reload = () => isWatch && isServer && bs.reload();

let isWatch = 0;
let isServer = 0;

const tar = 'dist';
const rel = 'release';
const node = 'node_modules';
const bower = 'bower_components';

const src = {
	css: 'src/styles/**/*.sass',
	js: 'src/scripts/**/*.js',
	img: 'src/images/**/*.*',
	copy: [
		'src/*.html',
		'src/extras/**.*'
	],
	vendor: [
		// javascript vendors to be merged
	]
};

export default async function (fly) {
	isWatch = 1;
	await fly.clear([tar, rel]).start('build');
	await fly.watch(src.js, 'scripts');
	await fly.watch(src.vendor, 'vendor');
	await fly.watch(src.copy, 'copies');
	await fly.watch(src.img, 'images');
	await fly.watch(src.css, 'styles');
	await fly.start('serve');
}

export async function build(fly) {
	await fly.clear([tar, rel]);
	await fly.parallel(['copies', 'images', 'vendor', 'scripts', 'styles']);
	await fly.start('uglify');
}

export async function release(fly) {
	await fly.start('build');
	await fly.source(`${tar}/**/*`)
		.rev({ignores: ['.html', '.png', 'jpg', '.jpeg', '.svg', '.ico', '.gif', '.json', '.webapp', '.txt']})
		.revManifest({dest: rel, trim: tar}).revReplace().target(rel);
	await fly.source(`${rel}/*.html`).htmlmin().target(rel);
}

export async function scripts(fly, o) {
	await fly.source(o.src || src.js).xo().browserify({
		entries: 'src/scripts/app.js'
	}).target(`${tar}/js`);
	reload();
}

export async function vendor(fly) {
	await fly.source(src.vendor).concat('vendor.js').target(`${tar}/js`);
	reload();
}

export async function copies(fly, o) {
	await fly.source(o.src || src.copy).target(tar);
	reload();
}

export async function images(fly, o) {
	await fly.source(o.src || src.img).target(`${tar}/img`);
	reload();
}

export async function styles(fly) {
	await fly.source('src/styles/app.sass').sass({
		outputStyle: 'compressed',
		includePaths: [bower]
	}).autoprefixer().target(`${tar}/css`);
	reload();
}

export async function uglify(fly) {
	await fly.source(`${tar}/js/*.js`).uglify({
		compress: {
			conditionals: 1,
			drop_console: 1,
			comparisons: 1,
			join_vars: 1,
			booleans: 1,
			loops: 1
		}
	}).target(`${tar}/js`);
}

export async function serve(fly) {
	isServer = 1;
	bs({server: tar});
}
