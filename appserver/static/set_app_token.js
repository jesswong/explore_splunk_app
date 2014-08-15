require(['splunkjs/mvc','splunkjs/mvc/utils','splunkjs/mvc/simplexml/ready!'], function(mvc, utils){

    var unsubmittedTokens = mvc.Components.getInstance('default');
    var submittedTokens = mvc.Components.getInstance('submitted');

    // Set the token $app$ to the name of the current app
    unsubmittedTokens.set('app', utils.getCurrentApp());
    // Set the token $view$ to the name of the current view
    unsubmittedTokens.set('view', utils.getPageInfo().page);
    
    // Submit the new tokens
    submittedTokens.set(unsubmittedTokens.toJSON());

});