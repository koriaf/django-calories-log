(function (window, document){
    'use strict';
    let { backlogStore } =  require('./backlog.store');
    let dbStorage = require('./db-storage');

    backlogStore.dbStorage = dbStorage;

    // load all top-level components
    let { EatenFoodTable } = require('./components/eaten-product.table');
    let { FoundFoodTable } = require('./components/found-product.table');
    let { HistoricalDataGraph } = require('./components/historical-data.graph');

    let symbols = require('./symbols');

    const render = (() => {
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
    })

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
                url,
                { credentials: 'same-origin' }
            ).then(function(raw_resp) {
                return raw_resp.json()
            }).then(function success(resp_json) {
                // got product list. Update it
                // TODO: check if output is sane
                if (Object.prototype.toString.call(resp_json) === '[object Array]') {
                    backlogStore.dispatch({
                        type: symbols.rProductSearchSuccess,
                        productsFound: resp_json
                    })
                    if (resp_json.length > 0) {
                        document.querySelector("#id_found_food_table_message").innerText = ""; 
                    } else {
                        document.querySelector("#id_found_food_table_message").innerText = (
                            `Sorry, nothing found for request "${q}"`
                        )   
                    }
                } else {
                    throw "Error: Data from food API incorrect - not an array returned";
                }
            }).catch(window.console.log.bind(window.console));
            return false;
        },
        setHandlers: function setHandlers() {
            document.querySelector("#id_search_product_form").onsubmit = Views.doFoodSearch;
            render();
        }
    };

    document.addEventListener("DOMContentLoaded", Views.setHandlers);
})(window, document);
