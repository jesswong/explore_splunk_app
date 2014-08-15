require.config({
    paths: {
        "app": "../app"
    }
});

require([
    'jquery',
    'app/simple_xml_examples/components/tagcloud/tagcloud',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, TagCloud, SearchManager, utils){

    new SearchManager({
        "id": 'customsearch1',
        "search": 'index=_internal source=*metrics.log group=pipeline | stats max(cpu_seconds) as cpu_seconds by processor',
        "earliest_time": "-24h",
        "latest_time": "now",
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "status_buckets": 0,
        "preview": true,
        "timeFormat": "%s.%Q",
        "wait": 0,
        "runOnSubmit": true
    });

    new TagCloud({
        id: 'custom1',
        managerid: 'customsearch1',
        labelField: 'processor',
        valueField: 'cpu_seconds',
        el: $('#custom')
    }).render();

});