require(['jquery','underscore','splunkjs/mvc','util/console','splunkjs/mvc/simplexml/ready!'], function($, _, mvc, console){
    // Get a reference to the dashboard panels
    var masterView = mvc.Components.get('master');
    var detailView = mvc.Components.get('detail');

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');

    if(!submittedTokens.has('sourcetype')) {
        // if there's no value for the $sourcetype$ token yet, hide the dashboard panel of the detail view
        detailView.$el.parents('.panel-element-row').hide();
        masterView.$el.parents('.panel-element-row').show();
    }

    submittedTokens.on('change:sourcetype', function(){
        // When the token changes...
        if(!submittedTokens.get('sourcetype')) {
            // ... hide the panel if the token is not defined
            detailView.$el.parents('.panel-element-row').hide();
            masterView.$el.parents('.panel-element-row').show();
        } else {
            // ... show the panel if the token has a value
            detailView.$el.parents('.panel-element-row').show();
            masterView.$el.parents('.panel-element-row').hide();
        }
    });

    masterView.on('click', function(e) {
        e.preventDefault();
        var newValue = e.data['row.sourcetype'];

        // Set the value for the $sourcetype$ token
        unsubmittedTokens.set('sourcetype', newValue);
        submittedTokens.set('sourcetype', newValue);
    });
});