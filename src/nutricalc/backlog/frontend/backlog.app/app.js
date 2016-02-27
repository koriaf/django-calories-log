(function ($, window, document){
    'use strict';
    // load dispatcher
    var BacklogDispatcher = require('./dispatcher/BacklogDispatcher');

    // load all top-level components
    var EatenFoodTable = require('./components/EatenFoodTable');
    var FoundFoodTable = require('./components/FoundFoodTable');

    ReactDOM.render(
        <EatenFoodTable />,
        document.querySelector("#id_eaten_food_table_container")
    );

    ReactDOM.render(
        <FoundFoodTable />,
        document.querySelector("#id_found_food_table_container")
    );

    var Views = {
        doFoodSearch: function doFoodSearch() {
            var q = $("#id_food_search_input").val().trim();
            // fetch list of goods by AJAX from server side
            // TODO: make better API provider here

            // TODO: error handling!
            $.getJSON(
                "/api/v1/products/",
                {title: q},
                function success(resp) {
                    // got product list. Update it
                    BacklogDispatcher.renderFoundFood(resp);
                }
            )
            return false;
        },
        setHandlers: function setHandlers() {
            $("#id_food_search_button").bind('click', Views.doFoodSearch);
            $("id_search_product_form").bind('submit', Views.doFoodSearch);
        }
    };

    $(document).ready(Views.setHandlers);

})(window.jQuery, window, document);
