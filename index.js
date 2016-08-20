'use strict';
const flow = require('lodash.flow');
const path = require('path');
const values = require('object.values');
const hoist = require('hoist-non-react-statics');
const buildKit = module.exports = function (parts) {
    let wrappersList = ['redux', 'relay'];
    if (parts.index && parts.index.wrappers) {
        wrappersList = parts.index.wrappers
    }
    wrappersList = wrappersList.filter(moduleName => parts[moduleName]);
    const complete = wrappersList.reduce(
        (complete, moduleName) => hoist(parts[moduleName](complete), complete),
        parts.component
    );
    return Object.assign(complete, parts,
        {
            default: complete
        },
        wrappersList.reduce((obj, moduleName) => Object.assign({}, obj, {
            [`${moduleName}_wrapped`]: hoist(parts[moduleName](parts.component), parts.component)
        }), {})
    );
};
Object.assign(module.exports, {
    fromContext: function (context) {
        const uniquePaths = context.keys().reduce((obj, key) => {
            const existingKey = obj[context.resolve(key)];
            if (existingKey && existingKey.length <= key.length) {
                return obj;
            }
            return Object.assign({}, obj, {
                [context.resolve(key)]: key
            })
        }, {});
        const parts = values(uniquePaths).reduce((obj, key) => {
            let contextForKey = context(key);
            if (contextForKey.default) {
                contextForKey = contextForKey.default;
            }
            return Object.assign({}, obj, {
                [path.relative('.', key)]: contextForKey
            })
        }, {});
        return buildKit(parts);
    }
});
