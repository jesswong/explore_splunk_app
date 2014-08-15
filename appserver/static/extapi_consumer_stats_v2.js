/*
 * A custom chart example based on the d3chartview of the web framework.
 * The component is initialized in Javascript which provides more flexibility and formatting options.
 */
require([
    'underscore',
    'jquery',
    'splunkjs/mvc/utils',
    'splunkjs/mvc', //to get the instances of graphs and tables
    'splunkjs/mvc/d3chart/d3chartview', //for the d3 custom chart overlay
    'util/moment',
    'splunkjs/mvc/simplexml/ready!', //checks to see if the page is ready
    'splunkjs/mvc/dropdownview', //dropdown view for selections
    'splunkjs/mvc/searchmanager', //handles the search and results from splunk
    'splunkjs/mvc/postprocessmanager', //processes the results with a subsearch from the searchmanager
    'splunkjs/mvc/chartview', //consists of all generic charts (line, bar, pie)
    'splunkjs/mvc/tableview' //a table view of data

    //function to dynamically enhance the page. Takes in '_', jquery, utils, mvc, d3 chart, and moment.
    // It is not necessary to have all these arguments (jquery and mvc is a MUST). If you decide not to pass
     //the rest as arguments, they must be declared inside the function as a variable and be in the "require" array.
], function(_, $, utils, mvc, D3ChartView, moment) {
    var DropdownView = require("splunkjs/mvc/dropdownview"); //variable storing the DropDownView
    var SearchManager = require("splunkjs/mvc/searchmanager"); //variabe storing the SearchManager
    var PostProcessManager = require("splunkjs/mvc/postprocessmanager"); //variable storing the PostProcessManager
    var ChartView = require("splunkjs/mvc/chartview"); //variable storing the Charts
    var TableView = require("splunkjs/mvc/tableview"); //variable storing the Tables


    var classDrop = new DropdownView({ //using the variable DropdownView to create a selection of choices
        id: "classDrop",
        default: "!=",
        value: mvc.tokenSafe("$callAgent$"),
        el: $("#classDropDown")
    }).render();

    var choices = [{label: "Mashery", value: "!="}, {label: "MFILL", value: "="}]; //dropdown choices

    classDrop.settings.set("choices", choices);

    //SearchManager that handles one search string. Can be used multiple by different graphs/tables by the id.
    //This search handles the total calls, average time, and shows the amount of calls taking longer than 5 seconds.
    var callsAndAverage = new SearchManager({
       id: "callsAndAverage",
       earliest_time: "-2h@h",
       latest_time: "now",
       cache: true,
       search: 'index=\"iis\" (host=\"wssws138\" OR host=\"wssws141\" OR host=\"wssws139\" OR host=\"wssws140\") ' +
       'cs_uri_stem=\"*service/*\" sourcetype=\"dw:wssws:iis\" cs_User_Agent_' + classDrop.val() + '\"Jakarta+Commons-HttpClient/3.1\" ' +
       '| bucket _time span=10m ' +
       '| fields host time_taken ' +
       '| eval sec5=if(time_taken > 5000, 1, null)' +
       '| eval host=lower(host) ' +
       '| stats count(eval(like(host, \"wssws138\"))) as wssws138, count(eval(like(host, \"wssws139\"))) as wssws139, ' +
       'count(eval(like(host, \"wssws140\"))) as wssws140, count(sec5) as sec5, avg(time_taken) as avgTimeTaken by _time '
    });


    /* Post Process search manager. Originally showed a line graph of the greater than 5 seconds data.
    var over5Sec = new PostProcessManager({
        id: "over5Sec",
        managerid: "callsAndAverage",
        search: '| timechart values(sec5) by host'
    });

    Debug: Shows the table of data that is feeding into your graph.
    var lineBar = new TableView({
        id: "lineCall",
        managerid: "over5Sec",
        el: $("#debugTable")
    }); */


    /* Chart view of the data from the Post Process search manager.
    var over5SecGraph = new ChartView({
        id: "over5SecGraph",
        managerid: "over5Sec",
        type: "line",
        el: $("#5SecGraph")
    }).render();

    over5SecGraph.settings.set({
        "charting.axisTitleY.text": " Number of Calls"
    });*/

    //Every time you select another option from the dropdown, the search manager will start another search
    // with the newly selected value.
    classDrop.on("change", function() {
        callsAndAverage.startSearch();
    });

    // Create the D3 chart view (specifically, the line and bar chart graph).
    var chart = new D3ChartView({
        "id": "chart1",
        "managerid": "callsAndAverage",
        "type": "linePlusBarChart",
        "el": $('#callsAndAverage')
    }).render();

    chart.settings.set("setup", function(chart) {
        // Configure chart formatting
        chart.color(d3.scale.category10().range());
        chart.margin({right: 100, left: 80, top: 70, bottom: 70 });

        // Set labels for Y axis on the left and on the right hand side
        chart.y1Axis.axisLabel("Number of Calls");
        chart.y2Axis.axisLabel("Average Time Taken (ms)");


        // Format the X-Axis labels
        var start = moment().startOf('day').subtract(1, 'day').toDate(), end = moment().startOf('day').toDate();
        var xScale = d3.time.scale.utc().domain([start, end]);
        chart.xAxis.scale(xScale);
        chart.xAxis.tickValues(xScale.ticks(d3.time.hours.utc, 1));
        chart.xAxis.tickFormat(function(d) {
            var format = d3.time.format("%I %p");
            return format(new Date(d));
        });
        chart.xAxis.rotateLabels(45);
        chart.xAxis.axisLabel("Time of Day");
    });

});