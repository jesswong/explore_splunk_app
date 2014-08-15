require(['jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/checkboxgroupview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'], 
    function($, _, mvc, CheckBoxGroupView,SearchManager){
        multiSelect = new CheckBoxGroupView({
            "id": "multi_value_input",
            "value": "$submitted:multiToken$",
            "el": $('#multi_value_input'),
            "labelField": "sourcetype",
            "valueField": "sourcetype",
            "managerid": "multiSearch"
        }, {tokens: true}).render();

        var multiSearch = new SearchManager({
            "id": "multiSearch",
            "earliest_time": "-15m",
            "status_buckets": 0,
            "search": "index=_internal | stats count by sourcetype",
            "cancelOnUnload": true,
            "latest_time": "now",
            "auto_cancel": 90,
            "preview": true
        }, {tokens: true});
    }
);
