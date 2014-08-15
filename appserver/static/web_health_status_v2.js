require([
    'underscore',
    'jquery',
    'splunkjs/mvc/utils',
    'splunkjs/mvc',
    'splunkjs/mvc/d3chart/d3chartview',
    'util/moment',
    'splunkjs/mvc/simplexml/ready!',
    'splunkjs/mvc/searchmanager',            //base searches
    'splunkjs/mvc/chartview',               // for line graphs
    'splunkjs/mvc/singleview',              // for single numbers
    'splunkjs/mvc/postprocessmanager',      // optimize searches
    'splunkjs/mvc/tableview'               // for tables of data
], function(_, $, utils, mvc, D3ChartView, moment) {
    var SearchManager = require("splunkjs/mvc/searchmanager");
    var SingleView = require("splunkjs/mvc/singleview");
    var ChartView = require("splunkjs/mvc/chartview");
    var PostProcessManager = require("splunkjs/mvc/postprocessmanager");
    var TableView = require("splunkjs/mvc/tableview");

    var CACHE_TIME_INTERVAL = false; //Final Constant for Cache Time Interval and auto refresh interval

    //overall Web health search command
    var serverRPS = new SearchManager({
        id: "serverOverall",
        earliest_time: "-15m@m",
        latest_time: "now",
        cache: CACHE_TIME_INTERVAL,
        search: 'index=perfmon host=wsshop* OR host=wssecure* OR host=wsdbmem01 OR host=wsdbmem02 OR host=wsdbtrans01 ' +
        'OR host=wsdbtrans02 OR host=wsdbpc0* OR host=wssearch* counter=\"Total Method Requests/sec\" OR ' +
        'counter=\"% Processor Time\" | eval host=UPPER(host) | ' +
        'eval AverageCPU=if(counter=\"% Processor Time\", Value, null()) | ' +
        'eval AverageRPS=if(counter=\"Total Method Requests/sec\", Value, null()) | ' +
        'rex field=host \"(?<server_group>(WSDBTRANS01|WSDBTRANS02|WSDBMEM01|WSDBMEM02|[^\\d]+))\" | ' +
        'eval server_group=case(server_group=\"WSDBMEM01\", \"MEM Database1\", server_group=\"WSDBMEM02\", \"MEM Database2\", ' +
        'server_group=\"WSDBPC\", \"PC\", server_group=\"WSDBTRANS01\", \"Trans 1\", server_group=\"WSDBTRANS02\", \"Trans 2\", ' +
        'server_group=\"WSSEARCH\", \"Search\", server_group=\"WSSECURE\", \"Secure\", server_group=\"WSSHOP\", \"Shop\") |' +
        'fields server_group AverageRPS AverageCPU _time'
    });

     //Base search for the FAST server
    var productServers = new SearchManager({
        id: "productServers",
        earliest_time: "-15m@m",
        latest_time: "now",
        cache: CACHE_TIME_INTERVAL,
        search: 'host=wssearch* \"SourceName=FAST_QPS\" index=winevents_app source=\"WinEventLog:Application\" ' +
        '| rex field=Message \"(?s)Current QPS \\((?<QPS>.+?)\\)\" | eval host=UPPER(host) ' +
        '| fields QPS _time'
    });

    // Gets the data for each server's CPU usage and RPS (null if either field doesn't exist) from the base search
    var webStatus = new PostProcessManager({
        id: "webOverall",
        managerid: "serverOverall",
        search: '| stats avg(AverageCPU) as AverageCPU, avg(AverageRPS) as AverageRPS by server_group | ' +
        'eval Status=case(server_group=\"Trans 1\" OR server_group=\"Trans 2\" OR server_group=\"MEM Database1\" OR ' +
        'server_group=\"MEM Database2\", if(AverageCPU<61, \"GREEN\", if(AverageCPU>=61 AND AverageCPU<80, \"YELLOW\", \"RED\")), ' +
        'AverageCPU<=40, if(server_group=\"Shop\" OR server_group=\"Secure\", if(AverageRPS<=60, \"GREEN\", ' +
        'if(AverageRPS>60 AND AverageRPS<80, \"YELLOW\", \"RED\")), \"GREEN\"), AverageCPU>40 AND AverageCPU<70, \"YELLOW\", ' +
        'AverageCPU>=70, \"RED\")'
    });

    //Gets the data from the base search to graph the server's RPS
    new PostProcessManager({
        id: "serverRPS",
        managerid: "serverOverall",
        search: "| timechart avg(AverageRPS) by server_group"
    });

    //Gets the data from the base search to graph the server's CPU
    new PostProcessManager({
        id: "serverCPU",
        managerid: "serverOverall",
        search: "| timechart avg(AverageCPU) by server_group"
    });

    //Gets the data from the FAST base search and finds the overall QPS
    new PostProcessManager({
        id: "productFAST",
        managerid: "productServers",
        search: "| stats avg(QPS) as FAST_QPS"
    });


    //Gets the data from the FAST base search to graph the time chart
    new PostProcessManager({
        id: "productFASTChart",
        managerid: "productServers",
        search: "| timechart avg(QPS) as FAST_QPS"
    });

    overallWebHealthTable();

    graphOverTime("serverCPUChart", "serverCPU", "#serverGroupChart", "Avg CPU Usage (%)");

    graphOverTime("serverRPSChart", "serverRPS", "#serverRPSChart", "Avg RPS");

    graphOverTime("productChart", "productFASTChart", "#productFASTChart", "Average QPS");

    //Get the raw results from the post process manager. Refreshes every time new data is received.
    var myResults = webStatus.data("results");
    myResults.on("data", function() {
        document.getElementById("data").innerHTML = myResults.data().rows;

    });

    //Displays the QPS from the productFAST post search
    new SingleView({
        id: "productFASTAvg",
        managerid: "productFAST",
        beforeLabel: "ProductFAST Server QPS:",
        el: $("#productFASTAvg")
    }).render();

    autoRefresh();


    //Graphs the table regarding the server health of the Website
    function overallWebHealthTable() {
        //Displays the previous results in a table
        var serverRPSNum = new TableView({
            id: "overallStats",
            managerid: "webOverall",
            data: "results",
            el: $("#webOverall")
        });

        //Icons to monitor the servers
        var ICONS = {
            GREEN: 'check-circle',
            YELLOW: 'alert',
            RED: 'alert-circle'
        };

        //Replaces the status with icons based on the status of the server.
        var CustomIconCellRenderer = TableView.BaseCellRenderer.extend({
            canRender: function(cell) {
                return cell.field === 'Status';
            },

            render: function($td, cell) {
                var icon = 'question';
                if(ICONS.hasOwnProperty(cell.value)) {
                    icon = ICONS[cell.value];
                }
                $td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%- Status %>" title="<%- Status %>"></i>', {
                    icon: icon,
                    Status: cell.value
                }));
            }
        });

        serverRPSNum.table.addCellRenderer(new CustomIconCellRenderer());
        serverRPSNum.table.render();
    }

    //Graphs a line graph based on time. Takes in
    // graphName: name you are assigning the graph
    // managerID: search manager or post process manager this graph is going to be pulling the data from
    // divToHang: DOM element you want this graph to be shown in (either identified by an id, class, or element)
    // yTitle: Title of the y axis
    function graphOverTime(graphName, managerID, divToHang, yTitle) {
        //Graphs the server's CPU as a time graph from the serverCPU post search
        var serverGroupLine = new ChartView({
            id: graphName,
            managerid: managerID,
            type: "line",
            el: $(divToHang)
        }).render();

        //Set the settings of the CPU time graph
        serverGroupLine.settings.set({
            "charting.axisTitleY.text": yTitle,
            "charting.chart.nullValueMode": "connect",
            "charting.axisTitleX.text": "Time Line"
        });
    }

    //Auto refresh of the searches without refreshing the entire page.
    //Based on the final constant. If the final constant is set to false,
    // default refresh time interval is 60 seconds.
    function autoRefresh() {
        if(typeof CACHE_TIME_INTERVAL === 'number') {
            var seconds = CACHE_TIME_INTERVAL * 1000;
        } else {
            var seconds = 60000;
        }
        window.setInterval(function() {
        serverRPS.startSearch();
        productServers.startSearch();
        }, seconds);
    }
});