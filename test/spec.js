const assert = require('assert');
const fs = require('fs');
const execSync = require('child_process').execSync;
const dedent = require('dedent');
const kitBuilder = require('..');
const path = require('path');
const rimraf = require('rimraf').sync;
const mkdirp = require('mkdirp').sync;
const testTmp = path.join(__dirname, 'test-tmp');
const myComponentDir = path.join(testTmp, 'my-component');
const bundlePath = path.join(testTmp, 'bundle.js');
const buildBundle = () => {
    const webpackPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'webpack');
    execSync(`${webpackPath} --output-library-target=commonjs2 ${path.join(testTmp, 'build-manager.js')} ${bundlePath}`);
    delete require.cache[require.resolve(bundlePath)];
};
describe('component kit builder', function () {
    beforeEach(function () {
        rimraf(testTmp);
        mkdirp(testTmp);
        mkdirp(myComponentDir);
        fs.writeFileSync(path.join(myComponentDir, 'component.js'), `module.exports = x => \`component \${x}\`;`);
        fs.writeFileSync(path.join(myComponentDir, 'redux.js'), `module.exports = x => y => y(\`redux \${x}\`);`);
        fs.writeFileSync(path.join(myComponentDir, 'relay.js'), `module.exports = x => y => y(\`relay \${x}\`);`);
        fs.writeFileSync(path.join(testTmp, 'build-manager.js'), dedent`
            const kitBuilder = require('${path.relative(testTmp, require.resolve('..'))}')
            module.exports = kitBuilder(require.context('./${path.relative(testTmp, myComponentDir)}/'));
        `);
    });
    afterEach(function () {
        rimraf(testTmp);
        rimraf(myComponentDir);
    });
    it('should cope with missing redux', function () {
        rimraf(path.join(myComponentDir, 'redux.js'));
        buildBundle();
        assert.deepEqual(
            [
                'relay',
                'relay_wrapped',
                'component',
                'complete'
            ].sort(),
            Object.keys(require(bundlePath)).sort()
        );
    });
    it('should cope with missing relay', function () {
        rimraf(path.join(myComponentDir, 'relay.js'));
        buildBundle();
        assert.deepEqual(
            [
                'redux',
                'redux_wrapped',
                'component',
                'complete'
            ].sort(),
            Object.keys(require(bundlePath)).sort()
        );
    });
    it('should export properties based on the files present in the component directory', function () {
        buildBundle();
        assert.deepEqual(
            [
                'relay',
                'redux',
                'relay_wrapped',
                'redux_wrapped',
                'component',
                'complete'
            ].sort(),
            Object.keys(require(bundlePath)).sort()
        );
    });
    it('should compose all the composable wrappers together', function () {
        buildBundle();
        assert(require(bundlePath).complete(), 'redux relay component');
    });
    it('should work with es6-style default exports', function () {
        fs.writeFileSync(path.join(myComponentDir, 'redux.js'), `module.exports = {default: x => y => y(\`redux \${x}\`)};`);
        buildBundle();
        require(bundlePath);
    });
});
