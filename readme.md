# component-kit-builder

## usage

If you structure your components like this:
```txt
path/to/component
 +- component.js // basic react component
 +- redux.js // redux component wrapper
 +- relay.js // realy component wrapper
```

You can use `component-kit-builder` to build a _component kit_ around your component for easy export and usage of your component wrapper functions.

```js
// any file processed by webpack
import componentKitBuilder from 'component-kit-builder';
kit = componentKitBuilder(require.context('path/to/component/directory'));
```

`kit` now has the following properties:
* __component__  – component exported form `component.js`
* __relay__  – relay wrapper exported from relay.js
* __redux__  – reduc wrapper exported from redux.js
* __relay_wrapped__ – component wrapped by relay wrapper
* __redux_wrapped__ – component wrapped by redux wrapper
* __complete__ – component wrapped by redux and relay

By default, modules whose pre-extension filename are `relay` and `redux` are considered wrappers and included in `complete` and create `_wrapped` properties on the kit. A custom list of wrappers for `component` can be defined in the `wrappers` export in `index.js`.
