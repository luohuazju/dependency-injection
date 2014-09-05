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
        assert.equal(container.getParameter('invalid'), undefined);
        assert.equal(container.getParameter('invalid.invalid'), undefined);

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
        assert.equal(container.getParameter('test1'), params.test1);
        assert.equal(container.getParameter('test2'), params.test2);
        assert.equal(container.getParameter('test2.value'), params.test2.value);
        assert.equal(container.getParameter('test2.deep'), params.test2.deep);
        assert.equal(container.getParameter('test2.deep.value'), params.test2.deep.value);
        assert.equal(container.getParameter('test2.deep.invalid'), undefined);

    });

    test('has parameter', function() {

        var params = {
            test1: 'value1',
            test2: {
                value: 'value2',
                deep: {
                    value: 'value3'
                }
            },
            test3: [
                'value4',
                'value5',
                {
                    value: 'value6',
                    deep: {
                        value: 'value7'
                    }
                }
            ]
        };

        // Instantiate the service container
        var container = new Container(params);

        // Do positive assertions
        assert.ok(container.hasParameter('test1'));
        assert.ok(container.hasParameter('test2'));
        assert.ok(container.hasParameter('test2.value'));
        assert.ok(container.hasParameter('test2.deep'));
        assert.ok(container.hasParameter('test2.deep.value'));
        assert.ok(container.hasParameter('test3'));
        assert.ok(container.hasParameter('test3.0'));
        assert.ok(container.hasParameter('test3.1'));
        assert.ok(container.hasParameter('test3.2'));
        assert.ok(container.hasParameter('test3.2.value'));
        assert.ok(container.hasParameter('test3.2.deep'));
        assert.ok(container.hasParameter('test3.2.deep.value'));
        assert.ok(container.hasParameter('test1.invalid') == false);
        assert.ok(container.hasParameter('test2.deep.invalid') == false);
        assert.ok(container.hasParameter('invalid') == false);
        assert.ok(container.hasParameter('invalid.invalid') == false);
        assert.ok(container.hasParameter('invalid.invalid.invalid') == false);

    });

    test('has service', function() {

        // Instantiate the service container
        var container = new Container();

        // Do assertions
        assert.ok(container.has('service-container'));
        assert.ok(container.has('invalid') == false);

    });

    test('set service', function() {

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
        container.set('test', {
            path: '%test_service.path%',
            arguments: [
                '%test_service.arg1%'
            ],
            calls: [
                { set: ['arg2', '%test_service.arg2%'] }
            ],
            set: {
                arg3: '%test_service.arg3%'
            },
            isFactory: true
        });

        assert.ok(container.has('test'));

        // Get the service
        var service = container.get('test');

        // Do assertions
        assert.ok(service instanceof Object);
        assert.ok(service.set instanceof Function);
        assert.equal(service.arg1, params.test_service.arg1);
        assert.equal(service.arg2, params.test_service.arg2);
        assert.equal(service.arg3, params.test_service.arg3);

    });

    test('get singleton service', function() {

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
        container.set('test', {
            path: '%test_service.path%',
            arguments: [
                '%test_service.arg1%'
            ]
        });

        assert.ok(container.has('test'));

        // Get the service
        var service = container.get('test');

        // Override an argument
        service.arg1 = 'new value1';

        // Get the service again
        var service = container.get('test');

        // Do assertions
        assert.equal(service.arg1, 'new value1');

    });

    test('get non-singleton service', function() {

        var params = {
            test_service: {
                path: __dirname +'/test-service'
            }
        };

        // Instantiate the service container
        var container = new Container(params);

        // Set the service
        container.set('test', {
            singleton: false,
            path: '%test_service.path%',
            arguments: [
                'value'
            ]
        });

        assert.ok(container.has('test'));

        // Get the service
        var service = container.get('test');

        // Override an argument
        service.arg1 = 'new value';

        // Get the service again
        var service = container.get('test');

        // Do assertions
        assert.equal(service.arg1, 'value');

    });

});
