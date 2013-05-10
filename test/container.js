var assert = require('assert');
var Container = require('../lib/index.js').Container;

suite('Dependency Injection', function() {

    test('instantiate service container', function() {

        // Instantiate the service container
        var container = new Container();

        // Do assertions
        assert.equal(typeof(container), 'object');
        assert.equal(typeof(container.getParameter), 'function');
        assert.equal(typeof(container.mergeParameters), 'function');
        assert.equal(typeof(container.get), 'function');
        assert.equal(typeof(container.set), 'function');
        assert.equal(typeof(container.resolveParameters), 'function');
        assert.equal(typeof(container.resolveServices), 'function');

    });

    test('get parameter', function() {

        var params = {
            test: {
                value: 'ok'
            }
        };

        // Instantiate the service container
        var container = new Container(params);

        // Do assertions
        assert.equal(container.getParameter('test.value'), 'ok');

    });

    test('merge parameter', function() {

        var params = {
            test1: 'value1',
            test2: {
                value: 'value2',
                deep: {
                    value: 'value3'
                }
            }
        };

        // Instantiate the service container
        var container = new Container(params);

        // Set the new value
        container.mergeParameters({ test2: { deep: { value: 'new value3' } } });

        // Do assertions
        assert.equal(container.parameters.test1, 'value1');
        assert.equal(container.parameters.test2.value, 'value2');
        assert.equal(container.parameters.test2.deep.value, 'new value3');

    });

    test('set single service', function() {

        var params = {
            test_service: {
                path: __dirname +'/test-service',
                arg1: 'value1',
                arg2: 'value2',
                arg3: 'value3'
            }
        };

        // Instantiate the service container
        var container = new Container(params);

        // Set the service
        container.set('test_service', {
            path: '%test_service.path%',
            arguments: [
                '%test_service.arg1%'
            ],
            calls: [
                { set: ['arg2', '%test_service.arg2%'] }
            ],
            set: {
                arg3: '%test_service.arg3%'
            }
        });

        // Get the service
        var service = container.get('test_service');

        // Do assertions
        assert.equal(typeof(service), 'function');
        assert.equal(service.arg1, params.test_service.arg1);
        assert.equal(service.arg2, params.test_service.arg2);
        assert.equal(service.arg3, params.test_service.arg3);

    });

    test('singleton service', function() {

        var params = {
            test_service: {
                path: __dirname +'/test-service',
                arg1: 'value1',
                arg2: 'value2',
                arg3: 'value3'
            }
        };

        // Instantiate the service container
        var container = new Container(params);

        // Set the service
        container.set('test_service', {
            path: '%test_service.path%',
            arguments: [
                '%test_service.arg1%'
            ]
        });

        // Get the service
        var service = container.get('test_service');

        // Override an argument
        service.arg1 = 'new value1';

        // Get the service again
        var service = container.get('test_service');

        // Do assertions
        assert.equal(service.arg1, 'new value1');

    });

    test('non-singleton service', function() {

        var params = {
            test_service: {
                path: __dirname +'/test-service'
            }
        };

        // Instantiate the service container
        var container = new Container(params);

        // Set the service
        container.set('test_service', {
            singleton: false,
            path: '%test_service.path%',
            arguments: [
                'value'
            ]
        });

        // Get the service
        var service = container.get('test_service');

        // Override an argument
        service.arg1 = 'new value';

        // Get the service again
        var service = container.get('test_service');

        // Do assertions
        assert.equal(service.arg1, 'value');

    });

});