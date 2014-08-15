require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {

    var CustomLinkRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            return cell.field === 'link';
        },
        render: function($td, cell) {
            var link = cell.value;

            var a = $('<a>').attr("href", cell.value).text("Link to Referer URL");

            $td.addClass('table-link').empty().append(a);
                              
            a.click(function(e) {
              e.preventDefault();
              window.location = $(e.currentTarget).attr('href');
              // or for popup:
              // window.open($(e.currentTarget).attr('href'));
            });

        }
    });
        
        // Get the table view by id
    mvc.Components.get('link').getVisualization(function(tableView){
        // Register custom cell renderer
        tableView.table.addCellRenderer(new CustomLinkRenderer());
        // Force the table to re-render
        tableView.table.render();
    });

});
