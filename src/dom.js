/* UMD.define */
(function (root, factory) {
	if (typeof customLoader === 'function') {
		customLoader(factory, 'dom');
	} else if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.returnExports = factory();
		window.dom = factory();
	}
}(this, function () {
	'use strict';
	var
		uids = {},
		destroyer = document.createElement('div');

	function isDimension (prop) {
		return !/opacity|index|flex|weight|^sdcsdcorder|tab|miter|group|zoom/i.test(prop)
	}

	function isNumber (value) {
		if (/\s/.test(value)) {
			return false;
		}
		return !isNaN(parseFloat(value));
	}

	function uid (type) {
		type = type || 'uid';
		if (uids[type] === undefined) {
			uids[type] = 0;
		}
		var id = type + '-' + (uids[type] + 1);
		uids[type]++;
		return id;
	}

	function isNode (item) {
		// safer test for custom elements in FF (with wc shim)
		// fragment is a special case
		return !!item && typeof item === 'object' && (typeof item.innerHTML === 'string' || item.nodeName === '#document-fragment');
	}

	function byId (item) {
		if (typeof item === 'string') {
			return document.getElementById(item);
		}
		return item;
	}

	function style (node, prop, value) {
		var key, computed, result;
		if (typeof prop === 'object') {
			// object setter
			Object.keys(prop).forEach(function (key) {
				style(node, key, prop[key]);
			});
			return null;
		} else if (value !== undefined) {
			// property setter
			if (typeof value === 'number' && isDimension(prop)) {
				value += 'px';
			}
			node.style[prop] = value;
		}

		// getter, if a simple style
		if (node.style[prop]) {
			result = node.style[prop];
			if (/px/.test(result)) {
				return parseFloat(result);
			}
			if (/%/.test(result)) {
				return parseFloat(result) * 0.01;
			}
			if (isNumber(result)) {
				return parseFloat(result);
			}
			return result;
		}

		// getter, computed
		computed = window.getComputedStyle(node);
		if (computed[prop]) {
			result = computed[prop];
			if (isNumber(result)) {
				return parseFloat(result);
			}
			return computed[prop];
		}
		return '';
	}

	function attr (node, prop, value) {
		var key;

		if (typeof prop === 'object') {

			var bools = {};
			var strings = {};
			var objects = {};
			Object.keys(prop).forEach(function (key) {
				if (typeof prop[key] === 'boolean') {
					bools[key] = prop[key];
				} else if (typeof prop[key] === 'object') {
					objects[key] = prop[key];
				} else {
					strings[key] = prop[key];
				}
			});

			// assigning properties in specific order of type, namely objects last
			Object.keys(bools).forEach(function (key) { attr(node, key, prop[key]); });
			Object.keys(strings).forEach(function (key) { attr(node, key, prop[key]); });
			Object.keys(objects).forEach(function (key) { attr(node, key, prop[key]); });

			return null;
		}
		else if (value !== undefined) {
			if (prop === 'text' || prop === 'html' || prop === 'innerHTML') {
				// ignore, handled during creation
				return;
			}
			else if (prop === 'className' || prop === 'class') {
				dom.classList.add(node, value);
			}
			else if (prop === 'style') {
				style(node, value);
			}
			else if (prop === 'attr') {
				// back compat
				attr(node, value);
			}
			else if (typeof value === 'object') {
				// object, like 'data'
				node[prop] = value;
			}
			else {
				node.setAttribute(prop, value);
			}
		}

		return node.getAttribute(prop);
	}

	function box (node) {
		if (node === window) {
			node = document.documentElement;
		}
		// node dimensions
		// returned object is immutable
		// add scroll positioning and convenience abbreviations
		var
			dimensions = byId(node).getBoundingClientRect();
		return {
			top: dimensions.top,
			right: dimensions.right,
			bottom: dimensions.bottom,
			left: dimensions.left,
			height: dimensions.height,
			h: dimensions.height,
			width: dimensions.width,
			w: dimensions.width,
			scrollY: window.scrollY,
			scrollX: window.scrollX,
			x: dimensions.left + window.pageXOffset,
			y: dimensions.top + window.pageYOffset
		};
	}

	function relBox (node) {
		const parent = node.parentNode;
		const pBox = box(parent);
		const box = box(node);

		return {
			w: box.w,
			h: box.h,
			x: box.left - pBox.left,
			y: box.top - pBox.top
		};
	}

	function size (node, type) {
		if (node === window) {
			node = document.documentElement;
		}
		if (type === 'scroll') {
			return {
				w: node.scrollWidth,
				h: node.scrollHeight
			};
		}
		if (type === 'client') {
			return {
				w: node.clientWidth,
				h: node.clientHeight
			};
		}
		return {
			w: node.offsetWidth,
			h: node.offsetHeight
		};
	}

	function query (node, selector) {
		if (!selector) {
			selector = node;
			node = document;
		}
		return node.querySelector(selector);
	}

	function queryAll (node, selector) {
		if (!selector) {
			selector = node;
			node = document;
		}
		var nodes = node.querySelectorAll(selector);

		if (!nodes.length) {
			return [];
		}

		// convert to Array and return it
		return Array.prototype.slice.call(nodes);
	}

	function toDom (html, options, parent) {
		var node = dom('div', { html: html });
		parent = byId(parent || options);
		if (parent) {
			while (node.firstChild) {
				parent.appendChild(node.firstChild);
			}
			return node.firstChild;
		}
		if (html.indexOf('<') !== 0) {
			return node;
		}
		return node.firstChild;
	}

	function fromDom (node) {
		function getAttrs (node) {
			var att, i, attrs = {};
			for (i = 0; i < node.attributes.length; i++) {
				att = node.attributes[i];
				attrs[att.localName] = normalize(att.value === '' ? true : att.value);
			}
			return attrs;
		}

		function getText (node) {
			var i, t, text = '';
			for (i = 0; i < node.childNodes.length; i++) {
				t = node.childNodes[i];
				if (t.nodeType === 3 && t.textContent.trim()) {
					text += t.textContent.trim();
				}
			}
			return text;
		}

		var i, object = getAttrs(node);
		object.text = getText(node);
		object.children = [];
		if (node.children.length) {
			for (i = 0; i < node.children.length; i++) {
				object.children.push(fromDom(node.children[i]));
			}
		}
		return object;
	}

	function addChildren (node, children) {
		if (Array.isArray(children)) {
			for (var i = 0; i < children.length; i++) {
				if (children[i]) {
					if (typeof children[i] === 'string') {
						node.appendChild(toDom(children[i]));
					} else {
						node.appendChild(children[i]);
					}
				}
			}
		}
		else if (children) {
			node.appendChild(children);
		}
	}

	function addContent (node, options) {
		var html;
		if (options.html !== undefined || options.innerHTML !== undefined) {
			html = options.html || options.innerHTML || '';
			if (typeof html === 'object') {
				addChildren(node, html);
			} else {
				// careful assuming textContent -
				// misses some HTML, such as entities (&npsp;)
				node.innerHTML = html;
			}
		}
		if (options.text) {
			node.appendChild(document.createTextNode(options.text));
		}
		if (options.children) {
			addChildren(node, options.children);
		}
	}

	function dom (nodeType, options, parent, prepend) {
		options = options || {};

		// if first argument is a string and starts with <, pass to toDom()
		if (nodeType.indexOf('<') === 0) {
			return toDom(nodeType, options, parent);
		}

		var node = document.createElement(nodeType);

		parent = byId(parent);

		addContent(node, options);

		attr(node, options);

		if (parent && isNode(parent)) {
			if (prepend && parent.hasChildNodes()) {
				parent.insertBefore(node, parent.children[0]);
			} else {
				parent.appendChild(node);
			}
		}

		return node;
	}

	function insertAfter (refNode, node) {
		var sibling = refNode.nextElementSibling;
		if (!sibling) {
			refNode.parentNode.appendChild(node);
		} else {
			refNode.parentNode.insertBefore(node, sibling);
		}
		return sibling;
	}

	function destroy (node) {
		// destroys a node completely
		//
		if (node) {
			destroyer.appendChild(node);
			destroyer.innerHTML = '';
		}
	}

	function clean (node, dispose) {
		//	Removes all child nodes
		//		dispose: destroy child nodes
		if (dispose) {
			while (node.children.length) {
				destroy(node.children[0]);
			}
			return;
		}
		while (node.children.length) {
			node.removeChild(node.children[0]);
		}
	}

	dom.frag = function (nodes) {
		var frag = document.createDocumentFragment();
		if (arguments.length > 1) {
			for (var i = 0; i < arguments.length; i++) {
				frag.appendChild(arguments[i]);
			}
		} else {
			if (Array.isArray(nodes)) {
				nodes.forEach(function (n) {
					frag.appendChild(n);
				});
			} else {
				frag.appendChild(nodes);
			}
		}
		return frag;
	};

	dom.classList = {
		// in addition to fixing IE11-toggle,
		// these methods also handle arrays
		remove: function (node, names) {
			toArray(names).forEach(function (name) {
				node.classList.remove(name);
			});
		},
		add: function (node, names) {
			toArray(names).forEach(function (name) {
				node.classList.add(name);
			});
		},
		contains: function (node, names) {
			return toArray(names).every(function (name) {
				return node.classList.contains(name);
			});
		},
		toggle: function (node, names, value) {
			names = toArray(names);
			if (typeof value === 'undefined') {
				// use standard functionality, supported by IE
				names.forEach(function (name) {
					node.classList.toggle(name, value);
				});
			}
			// IE11 does not support the second parameter
			else if (value) {
				names.forEach(function (name) {
					node.classList.add(name);
				});
			}
			else {
				names.forEach(function (name) {
					node.classList.remove(name);
				});
			}
		}
	};

	function toArray (names) {
		if (!names) {
			return [];
		}
		return names.split(' ').map(function (name) {
			return name.trim();
		}).filter(function (name) {
			return !!name;
		});
	}

	function normalize (val) {
		if (typeof val === 'string') {
			val = val.trim();
			if (val === 'false') {
				return false;
			} else if (val === 'null') {
				return null;
			} else if (val === 'true') {
				return true;
			}
			// finds strings that start with numbers, but are not numbers:
			// '2team' '123 Street', '1-2-3', etc
			if (('' + val).replace(/-?\d*\.?\d*/, '').length) {
				return val;
			}
		}
		if (!isNaN(parseFloat(val))) {
			return parseFloat(val);
		}
		return val;
	}

	dom.normalize = normalize;
	dom.clean = clean;
	dom.query = query;
	dom.queryAll = queryAll;
	dom.byId = byId;
	dom.attr = attr;
	dom.box = box;
	dom.style = style;
	dom.destroy = destroy;
	dom.uid = uid;
	dom.isNode = isNode;
	dom.toDom = toDom;
	dom.fromDom = fromDom;
	dom.insertAfter = insertAfter;
	dom.size = size;
	dom.relBox = relBox;

	return dom;
}));
