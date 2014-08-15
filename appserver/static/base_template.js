/*This is the basic javascript file for more complex dashboards that will enable cacheing and post process searching.
Keep in mind that you can have more than one graph or post process manager use the same search manager. However,
be careful with how you format the data from the search manager. If the data is not formatted correctly from the
search manager, the results from the post process managers and graphs will not do what you want it to do. */

require([
    'underscore',
    'jquery',
    'splunkjs/mvc/utils',
    'splunkjs/mvc',
    'splunkjs/mvc/d3chart/d3chartview', //more complex visualizations
    'util/moment',
    'splunkjs/mvc/simplexml/ready!',
    'splunkjs/mvc/searchmanager',            //base searches
    'splunkjs/mvc/chartview',               // for line graphs, pie charts, bar graphs
    'splunkjs/mvc/postprocessmanager',      // optimize searches
    'splunkjs/mvc/tableview',               // for tables of data
    'splunkjs/mvc/dropdownview'             // drop down selection menu
], function(_, $, utils, mvc, D3ChartView, moment) {
    var SearchManager = require("splunkjs/mvc/searchmanager");
    var ChartView = require("splunkjs/mvc/chartview");
    var PostProcessManager = require("splunkjs/mvc/postprocessmanager");
    var TableView = require("splunkjs/mvc/tableview");
    var DropdownView = require("splunkjs/mvc/dropdownview");

    //basic template for a drop down menu
    var dropdownMenu = new DropdownView({
        id: "uniqueDropdownName", //id to identify this dropdown menu
        default: "defaultValueOfThisMenu",
        value: mvc.tokenSafe("$choice$") //assign the selected value to a token for use later
        el: $("#graph1") //this is where the drop down menu will show up. This will show up in the div with an id of
        //graph1.
    }).render();

    // choices the user can select from in the drop down menu
    var choices = [{label: "Name of Selection", value: "valueOfSelection"}, {label: "Second Selection", value: "2ndValue"}];

    dropdownMenu.settings.set("choices", choices); //set the drop down selections

    //basic template of a search manager
    var searchManagerName = new SearchManager({
        id: "uniqueSearchManagerName", //id to identify this search manager by
        earliest_time: "-15m@m", //earliest time interval of this search
        latest_time: "now", //latest time to search until (put 'now' for most current)
        cache: false, //cache default is false; true for cacheing based on earliest_time and latest_time; or an
        //integer representing the seconds of how often it caches.
        search: 'index=_* selection=' + dropdownMenu.val() + 'fields host' //enter base search string in single quotes
        //sample search string on how you would get the value of the dropdown menu that the user selected.
    });

    //Once the user selects another option, rerun the search on the search manager with the selected value.
    dropdownMenu.on("change", function() {
        searchManagerName.startSearch();
    });

    //basic template of a Post Process Manager
    var postProcessManagerName = new PostProcessManager({
        id: "uniquePostProcessName", //id to identify this post process by
        managerid: "uniqueSearchManagerName", //search manager id to get data and run a search on top of it
        search: //enter post process search string in single quotes
    });


/*___________________________________________IMPORTANT______________________________________________
Below are the graph views you can use to display your data. In order for the graphs to show up correctly,
the results from your Search and Post Process Managers must be formatted correctly. To see the format
of what each view wants the results in, see the Splunk 6.x Dashboard Examples in splunk-ga. */

    //base template of a table view
    var tableName = new TableView({
        id: "uniqueTableName", //id to identify this table by
        managerid: "uniquePostProcessName", //search or post process manager id for this table to get the data from
        el: $("#graph1") //id of the DOM you want this graph to show up in. This graph will show up in the div with
        //an id of graph1.
    }).render();


    //base template of a line graph, pie chart, bar graph
    var chartName = new ChartView({
        id: "uniqueGraphName", //id to identify this chart by
        managerid: "uniquePostProcessName",
        type: "line", //type of graph you want this view in; "pie" for pie and "bar" for bar.
        el: $("#graph2") //shows up in the div with an id of graph2
    }).render();

    /* Additional settings for the line graph chart. You do not need this part if you find the graph is sufficient
    without it.
    chartName.settings.set({
        "charting.axisTitleY.text": "Y Axis Title",
        "charting.chart.nullValueMode": "connect", //what to do if the values at a certain point is null
        "charting.axisTitleX.text": "X Axis Title"
    }); */

    //A basic template for a more complex visualization. More specifically, a line + bar overlay chart.
    //Check the results formatting for this graph under Custom Chart Overlay in SPlunk 6.x Dashboard Examples
    //to make sure it will render correctly.
    var d3ChartName = new D3ChartView({
        "id": "uniqued3ChartName",
        "managerid": "uniqueSearchManagerName",
        "type": "linePlusBarChart",
        "el": $("#graph3")
    }).render();

    //Additional settings for the d3 chart
    d3ChartName.settings.set("setup", function(d3ChartName) {
        // Configure chart formatting
        chart.color(d3.scale.category10().range());
        chart.margin({right: 100, left: 80, top: 70, bottom: 70 });

        // Set labels for Y axis on the left and on the right hand side
        chart.y1Axis.axisLabel("Access Events");
        chart.y2Axis.axisLabel("Total Events");

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
        chart.xAxis.axisLabel("X Axis Label");
    });
});