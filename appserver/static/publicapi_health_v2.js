/*
 * A custom chart example based on the d3chartview of the web framework.
 * The component is initialized in Javascript which provides more flexibility and formatting options.
 */
require([
    'underscore',
    'jquery',
    'splunkjs/mvc/utils',
    'splunkjs/mvc',
    'splunkjs/mvc/d3chart/d3chartview',
    'util/moment',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, utils, mvc, D3ChartView, moment) {

    // Re-use the search manager of the results table
    //var tableManagerid = mvc.Components.get('table1').settings.get('managerid');

    // Create the D3 chart view
    var chart = new D3ChartView({
        "id": "chart1",
        "managerid": tableManagerid,
        "type": "linePlusBarChart",
        "el": $('#chart1')
    }).render();

    chart.settings.set("setup", function(chart) {
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
        chart.xAxis.axisLabel("Time of Day");
    });

});