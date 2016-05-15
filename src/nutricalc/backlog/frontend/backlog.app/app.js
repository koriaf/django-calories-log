(function (window, document){
    'use strict';
    // load dispatcher
    var BacklogDispatcher = require('./dispatcher/BacklogDispatcher');

    // load all top-level components
    var EatenFoodTable = require('./components/food.eaten-table');
    var FoundFoodTable = require('./components/food.found-table');
    var HistoricalDataGraph = require('./components/historical-data-graph');

    var appSymbols = require('./symbols');

    ReactDOM.render(
        <EatenFoodTable />,
        document.querySelector("#id_eaten_food_table_container")
    );

    ReactDOM.render(
        <FoundFoodTable />,
        document.querySelector("#id_found_food_table_container")
    );

    ReactDOM.render(
        <HistoricalDataGraph />,
        document.querySelector("#id_historical_data_graph")
    );

    var Views = {
        serialize: function serialize(obj) {
            // found on stackoverflow, no license supplied
            return '?' + Object.keys(obj).reduce(
                function(a,k){
                    a.push(k+'='+encodeURIComponent(obj[k]));
                    return a
                },[]
            ).join('&')
        },
        doFoodSearch: function doFoodSearch() {
            var q = document.querySelector("#id_food_search_input").value.trim();
            // fetch list of goods by AJAX from server side using our API
            let url = "/api/v1/products/" + Views.serialize({title: q});
            window.fetch(
                url
            ).then(function(raw_resp) {
                return raw_resp.json()
            }).then(function success(resp_json) {
                // got product list. Update it
                // TODO: check if output is sane
                if (Object.prototype.toString.call(resp_json) === '[object Array]') {
                    BacklogDispatcher.renderFoundFood(resp_json);
                } else {
                    throw "Error: Data from food API incorrect - not an array returned";
                }
            }).catch(BacklogDispatcher.handleError);
            return false;
        },
        doSaveForYesterday: function doSaveForYesterday() {
            /* Calculate current food totals (ccal, carb, prot, fat values)
            and save it to database for yesterday. Allow to draw table and graph
            of macronutrients in past and on weekly basis.
            */
            BacklogDispatcher.saveForYesterday()
            return false;
        },
        setHandlers: function setHandlers() {
            document.querySelector("#id_search_product_form").onsubmit = Views.doFoodSearch;
            // TODO: accessibility stuff and mobile check
            document.querySelector("#id_save_for_yesterday").onclick = Views.doSaveForYesterday;
        }
    };

    document.addEventListener("DOMContentLoaded", Views.setHandlers);
})(window, document);
