/** @module  gl-util/context */
'use strict'

var pick = require('pick-by-alias')

module.exports = function setContext (o) {
	if (!o) o = {}
	else if (typeof o === 'string') o = {container: o}

	// HTMLCanvasElement
	if (isCanvas(o)) {
		o = {container: o}
	}
	// HTMLElement
	else if (isElement(o)) {
		o = {container: o}
	}
	// WebGLContext
	else if (isContext(o)) {
		o = {gl: o}
	}
	// options object
	else {
		o = pick(o, {
			container: 'container target element el canvas holder parent parentNode wrapper use ref root node',
			gl: 'gl context webgl glContext',
			attrs: 'attributes attrs contextAttributes',
			pixelRatio: 'pixelRatio pxRatio px ratio pxratio pixelratio',
			width: 'w width',
			height: 'h height'
		}, true)
	}

	if (!o.pixelRatio) o.pixelRatio = global.pixelRatio || 1

	// make sure there is container and canvas
	if (o.gl) {
		return o.gl
	}
	if (o.canvas) {
		o.container = o.canvas.parentNode
	}
	if (o.container) {
		if (typeof o.container === 'string') {
			var c = document.querySelector(o.container)
			if (!c) throw Error('Element ' + o.container + ' is not found')
			o.container = c
		}
		if (isCanvas(o.container)) {
			o.canvas = o.container
			o.container = o.canvas.parentNode
		}
		else if (!o.canvas) {
			o.canvas = createCanvas()
			o.container.appendChild(o.canvas)
			resize(o)
		}
	}
	// blank new canvas
	else if (!o.canvas) {
		if (typeof document !== 'undefined') {
			o.container = document.body || document.documentElement
			o.canvas = createCanvas()
			o.container.appendChild(o.canvas)
			resize(o)
		}
		else {
			throw Error('Not DOM environment. Use headless-gl.')
		}
	}

	// make sure there is context
	if (!o.gl) {
		try {
			o.gl = o.canvas.getContext('webgl', o.attrs)
		} catch (e) {
			try {
				o.gl = o.canvas.getContext('experimental-webgl', o.attrs)
			}
			catch (e) {
				o.gl = o.canvas.getContext('webgl-experimental', o.attrs)
			}
		}
	}

	return o.gl
}


function resize (o) {
	if (o.container) {
		if (o.container == document.body) {
			if (!document.body.style.width) o.canvas.width = o.width || (o.pixelRatio * global.innerWidth)
			if (!document.body.style.height) o.canvas.height = o.height || (o.pixelRatio * global.innerHeight)
		}
		else {
			var bounds = o.container.getBoundingClientRect()
			o.canvas.width = o.width || (bounds.right - bounds.left)
			o.canvas.height = o.height || (bounds.bottom - bounds.top)
		}
	}
}

function isCanvas (e) {
	return typeof e.getContext === 'function'
		&& 'width' in e
		&& 'height' in e
}

function isElement (e) {
	return typeof e.nodeName === 'string' &&
		typeof e.appendChild === 'function' &&
		typeof e.getBoundingClientRect === 'function'
}

function isContext (e) {
	return typeof e.drawArrays === 'function' ||
		typeof e.drawElements === 'function'
}

function createCanvas () {
	var canvas = document.createElement('canvas')
	canvas.style.position = 'absolute'
	canvas.style.top = 0
	canvas.style.left = 0

	return canvas
}
