'use strict';
const flow = require('lodash.flow');
const path = require('path');
const values = require('object.values');
const hoist = require('hoist-non-react-statics');
module.exports = function (context) {
    const uniquePaths = context.keys().reduce((obj, key) => {
        const existingKey = obj[context.resolve(key)];
        if (existingKey && existingKey.length <= key.length) {
            return obj;
        }
        return Object.assign({}, obj, {
            [context.resolve(key)]: key
        })
    }, {});
    const moduleMap = values(uniquePaths).reduce((obj, key) => {
        let contextForKey = context(key);
        if (contextForKey.default) {
            contextForKey = contextForKey.default;
        }
        return Object.assign({}, obj, {
            [path.relative('.', key)]: contextForKey
        })
    }, {});
    let wrappersList = ['redux', 'relay'];
    if (moduleMap.index && moduleMap.index.wrappers) {
        wrappersList = moduleMap.index.wrappers
    }
    wrappersList = wrappersList.filter(moduleName => moduleMap[moduleName]);
    return Object.assign({}, moduleMap,
        {
            complete: wrappersList.reduce(
                (complete, moduleName) => hoist(moduleMap[moduleName](complete), complete),
                moduleMap.component
            )
        },
        wrappersList.reduce((obj, moduleName) => Object.assign({}, obj, {
            [`${moduleName}_wrapped`]: hoist(moduleMap[moduleName](moduleMap.component), moduleMap.component)
        }), {})
    );
};
