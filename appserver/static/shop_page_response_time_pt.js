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
    var tableManagerid = mvc.Components.get('post_Category').settings.get('managerid');

    // Finds all class with table
    var postprocess  = $(".table").map(function() {
        var postProcessid = this.id;

        // runs D3 charting if id contains "post_"
        if (postProcessid.indexOf('post_') === 0){

            // gets Post Process Search managerid and creates title
            var postProcessManagerid = mvc.Components.get(postProcessid).settings.get('managerid');
            var chartid =  'chart-'+ postProcessid.replace('post_', "");
            var chartname = postProcessid.replace('post_', "").replace('_', ' ');
            $('#head-'+ postProcessid.replace('post_', "")).html(chartname)

            // Create the D3 chart view
            var chart = new D3ChartView({
                "id": chartid,
                "managerid": postProcessManagerid,
                "type": "linePlusBarChart",
                "el": $('#'+ chartid)
            }).render();

            chart.settings.set("setup", function(chart) {
                // Configure chart formatting
                chart.color(d3.scale.category10().range());
                chart.margin({right: 100, left: 80, top: 70, bottom: 70 });

                // Set labels for Y axis on the left and on the right hand side
                chart.y1Axis.axisLabel("# Requests");
                chart.y2Axis.axisLabel("Response Time (ms)");


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

        };


    });
});
