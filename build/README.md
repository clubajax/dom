# dom

A convenience library for common DOM methods.

dom uses UMD, so it will work with globals, AMD, or Node-style module exports.

## Getting Started

To install using bower:

	bower install @janiking/dom --save
	
Or npm:

    npm install @janiking/dom --save
    
You can clone the repository with your generic clone commands as a standalone 
repository or submodule.

	git clone git://github.com/janiking/dom.git

With AMD, it is recommended that you set the config.path of RequireJS to make `dom` accessible as an
absolute path.
	
`dom` has no dependencies.

## Description

The primary function is to make it more finger-friendly to create, modify, and delete DOM nodes, and to add and remove 
styles and attributes. There is some extended functionality as noted in the API docs below.

## Support

`dom` supports modern browsers, IE9 and up. Some modern DOM methods like `classList` are expected.

This library uses UMD, meaning it can be consumed with RequireJS, Browserify (CommonJS),
or a standard browser global.

## The `dom` function

`dom` is the main function, and has several more functions attached to that function. So you can
create a node with the main function like:

```jsx harmony
dom('div');
```
	
And you could access nodes with the `byId` attached function, like:

```jsx harmony
var node = dom.byId('my-node');
```

## API

**dom()**

Creates and returns a node.


if the first argument is a string and starts with '<', it is assumed to use be an HTML string, and
creates a node using innerHTML. Optional second arg is a parentNode.
```javascript
var node = dom('<div>my dome node</div>', parentNode);
```

The previous can be more explicitly done by using `dom.toDom()`

if the first argument is a string and does *not* start with '<', it is assumed to be a nodeName,
and a node is created via `document.createElement()`.
```jsx harmony
var node = dom('div');
```
Additional parameters (all optional):

The second parameter is `options` which is an object that can contain properties or other objects:

* `id`: sets the node ID
* `class` or `className`: Sets the node class
* `html` or `innerHTML`: Sets the content of the node, Possible values:
  * string: will be added as innerHTML
  * object (HtmlElement): Will be be added via appendChild
  * array: HtmlElements will be appended and strings will be converted into dom nodes and appended
* `style`: An object of CSS key-value styles. This object is passed to dom.style()
* All other keys are expected to be attributes.
  * (The `attr` object has been deprecated from 1.x)
	
The third parameter is an node or a node id, where the newly created node will be appended

The fourth parameter is a boolean. If true, the newly created node will be prepended, not appended.
	
The `html` can accept 

**dom.fromDom()**
Converts a dom node and its children into a JavaScript object. Example:
```html
<div id="option-div" class="foo" value="bar" selected="a" disabled="true" is-prop="">
    <option value="a">A</option>
    <option value="b" selected="">B</option>
    <option value="c">C</option>
</div>
```
```jsx harmony
result = {
    children:[{
        text: 'A',
           value: 'a'
    },{
        text: 'A',
        value: 'b'
    },{
        text: 'C',
        value: 'c'
    }],
    class:"foo",
    disabled:true,
    id:"option-div",
    'is-prop':true,
    selected:"a",
    text:"",
    value:"bar"
}
```
**dom.style()**
        
`dom.style` is a getter or a setter, depending on the parameters passed.

To use as a getter, the parameters should be a node, and a string property (only one property can be
accessed at a time). If the result is in the node.style object, that is returned. If not, the
property is acquired through the window global `getComputedStyle`.

To use as a setter, add a third parameter as a value:
```jsx harmony
dom.style(node, 'width', 100);
```
Note that like jQuery, the value did not need to be a string appended with 'px'. If the style is a
dimensional property, this is done automatically. The dimensional properties are:

	width
	height
	top
	left
	right
	bottom
	maxWidth
	max-width
	maxHeight
	max-height

A more common way to use as a setter is to make the second parameter an object:
```jsx harmony
dom.style(node, {
    width: 100,
    height: '10em',
    top: '50%',
    position: 'absolute',
    zIndex: 1
});
```
**dom.attr()**

Similar to `dom.style`, `dom.attr` is a getter/setter to get and set attributes on nodes.

As a getter:

```jsx harmony
var dataItem = dom.attr(node, 'data-item');
```

As a setter:

```jsx harmony
dom.attr(node, 'data-item', dataItem);
```

Or multiple attributes:
```jsx harmony
dom.attr(node, {
    'data-item': dataItem,
    scrollTop: 100,
    contentEditable: true
});
```

Complex objects can be passed while creating custom-element nodes, via `attr` as a convenience:
```jsx harmony
dom('my-custom', {
    myObject:{
        a:1,
        bool:tru
    }
});
```
You could also use dom.attr() to pass a node, but that wouldn't make much sense.

Events can be added to a node. Is is expected that the value will be a function and the key will be an event name, prepended with `on` and a capital, such as in the example:
```jsx harmony
dom('button', {
    onClick: function () {
    	console.log('The button has been clicked');
    }
});
```

A MutationObserver is used to disconnect the event when the node is destroyed or removed from the document.

If the key is not appended with `on`, it is treated as an object and assigned to the node (which can then be called as a method).

**dom.byId('nodeId')**

If the parameter is a string, it finds a node with document.getElementByid(). If not found, returns
null. If the parameter is an object, it is assumed to already be a node and is returned.

Bonus: if it is detected to be a jQuery $element, it "de-jQuery-ifies" it, and returns a node.

**dom.box(node)**

Returns the dimensions of the passed node. Mainly an alias for `getBoundingClientRect()`. If the
passed item in the window object, returns its width and height.

**dom.relBox(node, ?parent)**

Returns the dimensions of the passed node and it's position relative to its parent node. Returns simple `{x,y,w,h}`. Assumes to compare position to immediate parent unless second node is passed.

**dom.size(node, type)**

Returns the width and height of the passed node. If the position is not needed, this is faster than `dom.box`. The `type` parameter indicates:
 * `client`: returns the inner height/width of an element in pixels, including padding but not the scrollbar height, border, or margin.
 * `scroll`: is a measurement of the height/width of an element's content including content not visible on the screen due to overflow.
 * `offset` (default): is a measurement which includes the element borders, the element padding, the element scrollbar (if present, if rendered) and the element CSS height/width.

**dom.query([?node], 'div.myClass')**

An alias for `document.querySelector`, so the parameter should conform to that.

**dom.queryAll([?node]'div.myClass')**

An alias for `document.querySelectorAll`, so the parameter should conform to that. Returns an Array, not a
NodeList.

**dom.insertAfter(refNode, node)**

Inserts a node after the reference sibling.

**dom.place(parentNode, node, position)**

Inserts a node at the child position of the parentNode. Handles bad positions (null, > children.length, etc).

**dom.destroy(node)**

Destroys a node completely.

**dom.clean(node)**

Removes (but does not destroy) all child nodes.

**dom.classList**

`dom.classList` is essentially a passthrough for node.classList methods, `add`, `remove`, `toggle`, and
`contains`.

There is extended functionality in `add` and `remove`: standard functionality doesn't allow for Arrays or
strings with spaces (ergo, two classes at once). `dom.classList` allows for this.

`toggle` works around an IE bug.

Examples:
```jsx harmony
dom.classList.toggle(node, 'selected', !!this.isSelected);
dom.classList.add(node, 'foo bar baz');
dom.classList.remove(node, 'foo baz');
```

**dom.normalize()**

Returns a normalized value from the passed string. Conversions look like:

    'true' => true
    'false' => false
    'null' => null
    '1.5' => 1.5

**dom.frag()**

Pass in an array of nodes and it returns a document fragment:

    var frag = dom.frag([
        dom('header', { html: `Custom ${item.label}` }),
        dom('h1', { html: `Value: ${item.value}` })
    ]);
    node.appendChild(frag);
    
## Comes with Stub Included!

The benefit of using `dom` exclusively in your code, is it comes complete with a "dom stub",
which can be substituted in Node.js unit tests.

The stub is as described, a stub, meaning most of the functions are NOOPs. But there are a few
functions that work as mocks, meaning they are functional with dummy/partial data. Simple objects
are returned as dom nodes, which should result to truthy in tests. These simple objects have an
`innerHTML` getter/setter so text comparisons can also be done. They also keep track of their
children and parent nodes, so some DOM manipulation can be simulated.

It is recommended that the stub/dom.js should be looked over to learn of its full functionality.

## License

This uses the [MIT license](./LICENSE). Feel free to use, and redistribute at will.