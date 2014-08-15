/*
 * This script loads a configuration option from a custom config file via REST
 */
require([
    'underscore',
    'jquery',
    'models/SplunkDBase',
    'splunkjs/mvc/sharedmodels',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, SplunkDModel, sharedModels, mvc) {

    // Create a new model class for the custom configuration endpoint
    // This endpoint provides access to the options defined in myconf.conf (see default/myconf.conf)
    var CustomConfModel = SplunkDModel.extend({
        urlRoot: 'configs/conf-myconf'
    });

    // New instance of our model class
    var settings = new CustomConfModel();
    // Set the entity id (ie. the stanza name)
    settings.id = 'settings';

    // Use the shared app model for loading the entity using the current namespace
    var app = sharedModels.get('app');

    // Load the model content from splunkd
    settings.fetch({
        data: {
            app: app.get('app'),
            owner: app.get('owner')
        }
    }).done(function(){
        // When the model has been successfully loaded
        var value = settings.entry.content.get('example_sourcetype');

        // Set the token in both the default and submitted namespace
        mvc.Components.get('default').set('sourcetype', value);
        mvc.Components.get('submitted').set('sourcetype', value);
    });

});