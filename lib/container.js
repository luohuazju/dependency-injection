module.exports = function(params) {

    /**
     * Holds the list of parameters.
     *
     * @type {Object}
     */
    this.parameters = {};

    /**
     * Holds the list of services.
     *
     * @type {Object}
     */
    var services = {};

    /**
     * Holds the loaded services.
     *
     * @type {Object}
     */
    var loaded = {};

    /**
     * Merge parameters.
     *
     * @param {Object} values An object containing the parameters to merge.
     *
     * @return {Object} Returns the current object.
     */
    this.mergeParameters = function(values) {

        this.parameters = mergeObjects(this.parameters, values);

        return this;
    };

    /**
     * Get a parameter value.
     *
     * @param {String} id The id of the parameter.
     *
     * @return {Mixed} Returns the value of the parameter, or undefined if it does not exist.
     */
    this.getParameter = function(id) {

        var value = undefined;
        var data = this.parameters;
        var parts = id.split('.');
        var lastPartNum = parts.length - 1;

        parts.every(function(part, i) {

            if (i == lastPartNum) {
                value = data[part];
            } else if (typeof(data[part]) == 'object') {
                data = data[part];
            } else {
                return false;
            }

            return true;
        }, this);

        return value;
    };

    /**
     * Get a service.
     *
     * @param {String} id The service identifier.
     *
     * @return {Object} Returns the service object.
     */
    this.get = function(id) {

        // Check if the service exists and has not been loaded
        if (services[id] && !loaded[id]) {

            // Get the service options
            var options = this.resolveParameters(services[id]);
            var options = this.resolveServices(options);

            // Get the service object
            var service = require(options.path);
            var type = typeof(service);

            switch (type) {
                case 'object':
                    // No need to do anything
                    break;
                case 'function':

                    // Create a new instance of the module, passing in the arguments
                    service = service.apply(service, options.arguments);

                    break;
                default:
                    throw new Error('Invalid service type: '+ options.type);
            }

            // Check if there are any methods to call
            if (options.calls) {

                // Loop through the methods and call each one
                options.calls.forEach(function(obj) {
                    var keys = Object.keys(obj);
                    var name = keys[0];
                    var args = obj[name];

                    // Call the method
                    service[name].apply(service, args);
                });

            }

            // Check if there are any properties to set
            if (options.set) {

                // Set the properties
                for (var key in options.set) {
                    service[key] = options.set[key];
                }

            }

            // Set the module if specified as a singleton
            if (options.singleton) {
                loaded[id] = service;
            }

        } else {
            service = loaded[id];
        }

        return service;
    };

    /**
     * Sets a service definition.
     *
     * @param {String} id The service identifier.
     * @param {[type]} options [description]
     */
    this.set = function(id, options) {

        // Set the service options
        services[id] = mergeObjects({
            singleton: true
        }, options);

        return this;
    };

    /**
     * Resolve references to parameters.
     *
     * @param {Mixed} value A string, array, or object to resolve parameters in.
     *
     * @return {Mixed} Returns the value with parameters replaced.
     */
    this.resolveParameters = function(value) {

        // Get the data type
        var type = typeof(value);

        switch (type) {
            case 'array':
            case 'object':

                for (var i in value) {

                    var element = value[i];

                    // Replace the value at the specified index with the parameter value
                    value[i] = this.resolveParameters(element);
                }

                break;
            case 'string':

                var matches = value.match(/^%([^%]+)%$/);

                // Check if a match was found
                if (matches) {

                    // Replace the value with the parameter value
                    value = this.getParameter(matches[1]);

                }

                break;
        }

        return value;
    };

    /**
     * Resolve references to services.
     *
     * @param {Mixed} value A string, array, or object to resolve services in.
     *
     * @return {Mixed} Returns the value with services replaced.
     */
    this.resolveServices = function(value) {

        // Get the data type
        var type = typeof(value);

        switch (type) {
            case 'array':
            case 'object':

                for (var i in value) {

                    var element = value[i];

                    // Replace the value at the specified index with the service object
                    value[i] = this.resolveServices(element);
                }

                break;
            case 'string':

                var matches = value.match(/^@(.+)$/);

                // Check if a match was found
                if (matches) {

                    // Replace the value with the service object
                    value = this.get(id);

                }

                break;
        }

        return value;
    };

    /**
     * Merges two object together.
     *
     * @param {Object} obj The object to merge into.
     *
     * @return {Object} Returns the merged object.
     */
    function mergeObjects(obj) {

        if (obj && arguments.length) {

            // Get the objects to merge
            var objs = Array.prototype.slice.call(arguments, 1);

            for (var i in objs) {
                for (var key in objs[i]) {
                    if (
                        obj[key] &&
                        typeof(obj[key]) == 'object' &&
                        typeof(objs[i][key]) == 'object'
                    ) {
                        obj[key] = mergeObjects(obj[key], objs[i][key]);
                    } else {
                        obj[key] = objs[i][key];
                    }
                }
            }

        }

        return obj;
    }

    // Set initial parameters
    if (params) {
        this.mergeParameters(params);
    }

    // Set service-container service
    services['service-container'] = {};
    loaded['service-container'] = this;

    return this;
}