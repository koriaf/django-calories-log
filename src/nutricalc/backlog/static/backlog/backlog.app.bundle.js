/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function (window, document) {
	    'use strict';
	    // load dispatcher

	    var BacklogDispatcher = __webpack_require__(1);

	    // load all top-level components
	    var EatenFoodTable = __webpack_require__(7);
	    var FoundFoodTable = __webpack_require__(12);
	    var HistoricalDataGraph = __webpack_require__(13);

	    var appSymbols = __webpack_require__(6);

	    ReactDOM.render(React.createElement(EatenFoodTable, null), document.querySelector("#id_eaten_food_table_container"));

	    ReactDOM.render(React.createElement(FoundFoodTable, null), document.querySelector("#id_found_food_table_container"));

	    ReactDOM.render(React.createElement(HistoricalDataGraph, null), document.querySelector("#id_historical_data_graph"));

	    var Views = {
	        serialize: function serialize(obj) {
	            // found on stackoverflow, no license supplied
	            return '?' + Object.keys(obj).reduce(function (a, k) {
	                a.push(k + '=' + encodeURIComponent(obj[k]));
	                return a;
	            }, []).join('&');
	        },
	        doFoodSearch: function doFoodSearch() {
	            var q = document.querySelector("#id_food_search_input").value.trim();
	            // fetch list of goods by AJAX from server side using our API
	            var url = "/api/v1/products/" + Views.serialize({ title: q });
	            window.fetch(url).then(function (raw_resp) {
	                return raw_resp.json();
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
	            BacklogDispatcher.saveForYesterday();
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    var DispatcherClass = __webpack_require__(2).Dispatcher;

	    var BacklogDispatcher = new DispatcherClass();

	    BacklogDispatcher.appSymbols = __webpack_require__(6);

	    BacklogDispatcher.renderFoundFood = function (food_data) {
	        // receives list of food items (from ajax request)
	        // allows FoundFoodTable to be repainted
	        this.dispatch({
	            action: BacklogDispatcher.appSymbols.renderFoundFood,
	            found_food: food_data
	        });
	    };

	    BacklogDispatcher.updateFoodAmount = function (food_row) {
	        // received food_row with updated amount
	        // allow store to save data and re-send new action foodAmountUpdated,
	        // which will re-render all items
	        this.dispatch({
	            action: BacklogDispatcher.appSymbols.updateFoodAmount,
	            food_row: food_row
	        });
	    };

	    BacklogDispatcher.foodAmountUpdated = function (food_id) {
	        // trigger re-render all amount fields
	        this.dispatch({
	            action: BacklogDispatcher.appSymbols.foodAmountUpdated,
	            food_id: food_id
	        });
	    };

	    BacklogDispatcher.saveForYesterday = function () {
	        this.dispatch({
	            action: BacklogDispatcher.appSymbols.saveForYesterdayInitiated
	        });
	    };

	    BacklogDispatcher.historicalDataUpdated = function () {
	        this.dispatch({
	            action: BacklogDispatcher.appSymbols.historicalDataUpdated
	        });
	    };

	    BacklogDispatcher.handleError = function (errorResp) {
	        if (errorResp.status >= 400 && errorResp.status < 500) {
	            // user-defined error
	            alert("Error: " + errorResp.data.readable_message || errorResp.data || "Not specified");
	        } else {
	            // some server error...
	            // we don't care about IE.
	            console.log(errorResp);
	        }
	    };

	    module.exports = BacklogDispatcher;
	})();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	module.exports.Dispatcher = __webpack_require__(3);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Dispatcher
	 * 
	 * @preventMunge
	 */

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var invariant = __webpack_require__(5);

	var _prefix = 'ID_';

	/**
	 * Dispatcher is used to broadcast payloads to registered callbacks. This is
	 * different from generic pub-sub systems in two ways:
	 *
	 *   1) Callbacks are not subscribed to particular events. Every payload is
	 *      dispatched to every registered callback.
	 *   2) Callbacks can be deferred in whole or part until other callbacks have
	 *      been executed.
	 *
	 * For example, consider this hypothetical flight destination form, which
	 * selects a default city when a country is selected:
	 *
	 *   var flightDispatcher = new Dispatcher();
	 *
	 *   // Keeps track of which country is selected
	 *   var CountryStore = {country: null};
	 *
	 *   // Keeps track of which city is selected
	 *   var CityStore = {city: null};
	 *
	 *   // Keeps track of the base flight price of the selected city
	 *   var FlightPriceStore = {price: null}
	 *
	 * When a user changes the selected city, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'city-update',
	 *     selectedCity: 'paris'
	 *   });
	 *
	 * This payload is digested by `CityStore`:
	 *
	 *   flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'city-update') {
	 *       CityStore.city = payload.selectedCity;
	 *     }
	 *   });
	 *
	 * When the user selects a country, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'country-update',
	 *     selectedCountry: 'australia'
	 *   });
	 *
	 * This payload is digested by both stores:
	 *
	 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       CountryStore.country = payload.selectedCountry;
	 *     }
	 *   });
	 *
	 * When the callback to update `CountryStore` is registered, we save a reference
	 * to the returned token. Using this token with `waitFor()`, we can guarantee
	 * that `CountryStore` is updated before the callback that updates `CityStore`
	 * needs to query its data.
	 *
	 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       // `CountryStore.country` may not be updated.
	 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
	 *       // `CountryStore.country` is now guaranteed to be updated.
	 *
	 *       // Select the default city for the new country
	 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
	 *     }
	 *   });
	 *
	 * The usage of `waitFor()` can be chained, for example:
	 *
	 *   FlightPriceStore.dispatchToken =
	 *     flightDispatcher.register(function(payload) {
	 *       switch (payload.actionType) {
	 *         case 'country-update':
	 *         case 'city-update':
	 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
	 *           FlightPriceStore.price =
	 *             getFlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *     }
	 *   });
	 *
	 * The `country-update` payload will be guaranteed to invoke the stores'
	 * registered callbacks in order: `CountryStore`, `CityStore`, then
	 * `FlightPriceStore`.
	 */

	var Dispatcher = (function () {
	  function Dispatcher() {
	    _classCallCheck(this, Dispatcher);

	    this._callbacks = {};
	    this._isDispatching = false;
	    this._isHandled = {};
	    this._isPending = {};
	    this._lastID = 1;
	  }

	  /**
	   * Registers a callback to be invoked with every dispatched payload. Returns
	   * a token that can be used with `waitFor()`.
	   */

	  Dispatcher.prototype.register = function register(callback) {
	    var id = _prefix + this._lastID++;
	    this._callbacks[id] = callback;
	    return id;
	  };

	  /**
	   * Removes a callback based on its token.
	   */

	  Dispatcher.prototype.unregister = function unregister(id) {
	    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
	    delete this._callbacks[id];
	  };

	  /**
	   * Waits for the callbacks specified to be invoked before continuing execution
	   * of the current callback. This method should only be used by a callback in
	   * response to a dispatched payload.
	   */

	  Dispatcher.prototype.waitFor = function waitFor(ids) {
	    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
	    for (var ii = 0; ii < ids.length; ii++) {
	      var id = ids[ii];
	      if (this._isPending[id]) {
	        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
	        continue;
	      }
	      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
	      this._invokeCallback(id);
	    }
	  };

	  /**
	   * Dispatches a payload to all registered callbacks.
	   */

	  Dispatcher.prototype.dispatch = function dispatch(payload) {
	    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
	    this._startDispatching(payload);
	    try {
	      for (var id in this._callbacks) {
	        if (this._isPending[id]) {
	          continue;
	        }
	        this._invokeCallback(id);
	      }
	    } finally {
	      this._stopDispatching();
	    }
	  };

	  /**
	   * Is this Dispatcher currently dispatching.
	   */

	  Dispatcher.prototype.isDispatching = function isDispatching() {
	    return this._isDispatching;
	  };

	  /**
	   * Call the callback stored with the given id. Also do some internal
	   * bookkeeping.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
	    this._isPending[id] = true;
	    this._callbacks[id](this._pendingPayload);
	    this._isHandled[id] = true;
	  };

	  /**
	   * Set up bookkeeping needed when dispatching.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
	    for (var id in this._callbacks) {
	      this._isPending[id] = false;
	      this._isHandled[id] = false;
	    }
	    this._pendingPayload = payload;
	    this._isDispatching = true;
	  };

	  /**
	   * Clear bookkeeping used for dispatching.
	   *
	   * @internal
	   */

	  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
	    delete this._pendingPayload;
	    this._isDispatching = false;
	  };

	  return Dispatcher;
	})();

	module.exports = Dispatcher;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	"use strict";

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function (condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	(function () {
	    'use strict';

	    var appSymbols = {
	        updateFoodAmount: Symbol(),
	        foodAmountUpdated: Symbol(),
	        saveForYesterdayInitiated: Symbol(),
	        historicalDataUpdated: Symbol(),
	        renderFoundFood: Symbol()
	    };
	    module.exports = appSymbols;
	})();

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var TableComponents = __webpack_require__(8);
	    var FoodAmountField = __webpack_require__(9);
	    var StatRow = __webpack_require__(11);
	    var Storage = __webpack_require__(10);
	    var sortBy = 'title';
	    var sortFunc = function sortFunc(a, b) {
	        return a[sortBy] >= b[sortBy];
	    };

	    var EatenFoodTable = React.createClass({
	        displayName: 'EatenFoodTable',

	        // EatenFoodTable
	        getInitialState: function getInitialState() {
	            return {
	                all_stored_food: []
	            };
	        },
	        reFetchFood: function reFetchFood() {
	            // fetch all items from indexedb and update view representation
	            var self = this;
	            function loadData() {
	                var query_promise = Storage.getAllStoredFood();
	                if (query_promise !== null) {
	                    query_promise.then(function (all_stored_food) {
	                        // render it
	                        self.setState({ all_stored_food: all_stored_food });
	                    });
	                } else {
	                    // DB not initialized yet, wait some time
	                    setTimeout(loadData, 100);
	                }
	            }
	            loadData();
	        },
	        componentDidMount: function componentDidMount() {
	            this.reFetchFood();
	            var table = this;
	            BacklogDispatcher.register(function (payload) {
	                if (payload.action === BacklogDispatcher.appSymbols.foodAmountUpdated) {
	                    table.reFetchFood();
	                }
	            });
	        },

	        header: function header() {
	            return React.createElement(
	                TableComponents.TableHeader,
	                null,
	                React.createElement(
	                    TableComponents.TableRow,
	                    null,
	                    React.createElement(TableComponents.TableCell, { value: 'Title ↕', header: true, onClick: this.changeSortOrder, 'data-sort-by': 'title' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Unit', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Ccal ↕', header: true, className: 'righted', onClick: this.changeSortOrder, 'data-sort-by': 'ccal' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Prot', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Fat', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Carb', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Today ↕', header: true, className: 'righted', onClick: this.changeSortOrder, 'data-sort-by': 'amount' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Total ccal', header: true, className: 'righted' })
	                )
	            );
	        },

	        changeSortOrder: function changeSortOrder(dat) {
	            sortBy = dat.target.dataset.sortBy;
	            if (sortBy === 'ccal' || sortBy === 'amount') {
	                sortFunc = function sortFunc(a, b) {
	                    return parseInt(a[sortBy], 10) > parseInt(b[sortBy], 10);
	                };
	            } else {
	                sortFunc = function sortFunc(a, b) {
	                    return a[sortBy] >= b[sortBy];
	                };
	            }
	            this.setState(this.state);
	        },

	        body: function body(items) {
	            var sorted_items = items.sort(sortFunc);
	            return React.createElement(
	                TableComponents.TableBody,
	                null,
	                sorted_items.map(function (food_row) {
	                    if (!food_row.ccal) {
	                        food_row.ccal = 0;
	                    }
	                    food_row.ccal = parseFloat(food_row.ccal).toFixed(0) || '';
	                    food_row.nutr_prot = parseFloat(food_row.nutr_prot).toFixed(1);
	                    food_row.nutr_fat = parseFloat(food_row.nutr_fat).toFixed(1);
	                    food_row.nutr_carb = parseFloat(food_row.nutr_carb).toFixed(1);

	                    if (food_row.unit === '100gr') {
	                        food_row.today_ccal = food_row.ccal / 100.0 * food_row.amount;
	                        food_row.today_ccal = food_row.today_ccal.toFixed(1);
	                    } else {
	                        food_row.today_ccal = '?';
	                    }

	                    return React.createElement(
	                        TableComponents.TableRow,
	                        { key: food_row.id },
	                        React.createElement(TableComponents.TableCell, { value: food_row.title }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.unit, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.ccal, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.nutr_prot, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.nutr_fat, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.nutr_carb, className: 'righted' }),
	                        React.createElement(
	                            TableComponents.TableCell,
	                            { className: 'righted' },
	                            React.createElement(FoodAmountField, { food_data: food_row })
	                        ),
	                        React.createElement(TableComponents.TableCell, { value: food_row.today_ccal, className: 'righted' })
	                    );
	                }, this)
	            );
	        },

	        render: function render() {
	            return React.createElement(
	                TableComponents.Table,
	                null,
	                this.header(),
	                React.createElement(StatRow, null),
	                this.body(this.state.all_stored_food)
	            );
	        }
	    });

	    module.exports = EatenFoodTable;
	})();

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	(function () {
	    // just react table components without any application meaning
	    'use strict';

	    module.exports = {};
	    module.exports.Table = React.createClass({
	        displayName: "Table",

	        render: function render() {
	            return React.createElement(
	                "div",
	                { className: "table-responsive" },
	                React.createElement(
	                    "table",
	                    { className: "table table-striped table-condensed" },
	                    this.props.children
	                )
	            );
	        }
	    });

	    module.exports.TableHeader = React.createClass({
	        displayName: "TableHeader",

	        render: function render() {
	            return React.createElement(
	                "thead",
	                null,
	                this.props.children
	            );
	        }
	    });

	    module.exports.TableBody = React.createClass({
	        displayName: "TableBody",

	        render: function render() {
	            return React.createElement(
	                "tbody",
	                null,
	                this.props.children
	            );
	        }
	    });

	    module.exports.TableRow = React.createClass({
	        displayName: "TableRow",

	        render: function render() {
	            return React.createElement(
	                "tr",
	                null,
	                this.props.children
	            );
	        }
	    });

	    module.exports.TableCell = React.createClass({
	        displayName: "TableCell",

	        render: function render() {
	            if (this.props.header) {
	                return React.createElement(
	                    "th",
	                    this.props,
	                    this.props.value
	                );
	            }

	            return React.createElement(
	                "td",
	                this.props,
	                this.props.value,
	                this.props.children
	            );
	        }
	    });
	})();

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var Storage = __webpack_require__(10);

	    var FoodAmountField = React.createClass({
	        displayName: 'FoodAmountField',

	        // FoodAmountField
	        getInitialState: function getInitialState() {
	            var self = this; // for promises
	            this.state = { value: 0 };
	            this.food_data = this.props.food_data;
	            return { value: this.food_data.amount };
	        },
	        reFetchValue: function reFetchValue() {
	            // fetch current product eaten amount from storage
	            // TODO: get rid of storage here
	            var field = this;
	            function loadData() {
	                var query_promise = Storage.getFood(field.food_data.id);
	                if (query_promise !== null) {
	                    query_promise.then(function (food_data) {
	                        // render it
	                        if (food_data.length === 1) {
	                            var found_food_row = food_data[0];
	                            field.setState({ value: found_food_row.amount });
	                        }
	                    });
	                } else {
	                    // DB not initialized yet, wait some time
	                    setTimeout(loadData, 100);
	                }
	            }
	            loadData();
	        },
	        componentDidMount: function componentDidMount() {
	            var field = this;
	            field.reFetchValue();
	            this._token1 = BacklogDispatcher.register(function (payload) {
	                if (payload.action === BacklogDispatcher.appSymbols.foodAmountUpdated) {
	                    if (field.food_data && payload.food_id === field.food_data.id) {
	                        field.reFetchValue();
	                    }
	                }
	            });
	        },
	        componentWillUnmount: function componentWillUnmount() {
	            BacklogDispatcher.unregister(this._token1);
	        },
	        handleTextFieldChange: function handleTextFieldChange(event) {
	            var new_value = event.target.value.replace(/[^\d\.\,]+/g, '');
	            this.setState({ value: new_value });
	            this.food_data.amount = new_value;
	            this.state.value = new_value;
	            BacklogDispatcher.updateFoodAmount(this.food_data);
	        },
	        render: function render() {
	            var value = this.state.value;
	            return React.createElement('input', { type: 'text', className: 'form-control food-amount-field',
	                value: value,
	                onChange: this.handleTextFieldChange });
	        }
	    });

	    module.exports = FoodAmountField;
	})();

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var appSymbols = __webpack_require__(6);

	    var StorageClass = function () {
	        // class to work with local IndexedDB stored data.
	        // handles events of food addition, update or deletion.

	        function StorageClass() {
	            _classCallCheck(this, StorageClass);

	            this.server = null;
	            this.addFood.bind(this);
	            this.saveForYesterday.bind(this);
	            this.getHistoricalData.bind(this);

	            var storage = this;

	            BacklogDispatcher.register(function (payload) {
	                switch (payload.action) {
	                    case BacklogDispatcher.appSymbols.updateFoodAmount:
	                        // payload.food_row contains food_row with new updated amount
	                        storage.addFood(payload.food_row, payload.food_row.amount);
	                        break;
	                    case BacklogDispatcher.appSymbols.saveForYesterdayInitiated:
	                        storage.saveForYesterday();
	                        break;
	                }
	            });
	        }

	        _createClass(StorageClass, [{
	            key: 'getFood',
	            value: function getFood(food_id) {
	                // returns promise, which will fetch all food with given ID
	                var backlog_table = this.server.backlog;
	                return backlog_table.query().filter('id', food_id).execute();
	            }
	        }, {
	            key: 'getAllStoredFood',
	            value: function getAllStoredFood() {
	                if (this.server) {
	                    var backlog_table = this.server.backlog;
	                    return backlog_table.query().filter().execute();
	                } else {
	                    return null;
	                }
	            }
	        }, {
	            key: 'addFood',
	            value: function addFood(food_data, amount) {
	                // updates amount of today food in database or creates such record in db
	                // search, if food already added, and update amount
	                // console.log("Adding/updating food ", food_data);
	                var backlog_table = this.server.backlog;
	                backlog_table.query().filter('id', food_data.id).execute().then(function (results) {
	                    var added_food = null;
	                    var update_promise = null;
	                    if (results.length === 0) {
	                        // no food added yet
	                        added_food = food_data;
	                        added_food.amount = amount;
	                        update_promise = backlog_table.add(food_data);
	                    } else {
	                        added_food = results[0];
	                        added_food.amount = amount;
	                        if (amount > 0) {
	                            update_promise = backlog_table.update(added_food);
	                        } else {
	                            // remove food from db
	                            update_promise = backlog_table.remove(added_food.id);
	                        }
	                    }
	                    if (update_promise !== null) {
	                        update_promise.then(function () {
	                            BacklogDispatcher.foodAmountUpdated(food_data.id);
	                        });
	                    }
	                }).catch(console.log.bind(console));
	            }
	        }, {
	            key: 'saveForYesterday',
	            value: function saveForYesterday() {
	                var self = this;
	                self.getAllStoredFood().then(function (result) {
	                    var totals = {
	                        ccal: 0,
	                        prot: 0,
	                        carb: 0,
	                        fat: 0
	                    };
	                    // Calculate totals values
	                    result.forEach(function (product) {
	                        var amount = parseFloat(product.amount);
	                        var multiplier = product.unit == '100gr' ? 0.01 : 1;
	                        var mass = multiplier * amount;

	                        totals.ccal += product.ccal * mass;
	                        totals.prot += product.nutr_prot * mass;
	                        totals.carb += product.nutr_carb * mass;
	                        totals.fat += product.nutr_fat * mass;
	                    });
	                    totals.ccal = Math.round(totals.ccal);
	                    totals.prot = Math.round(totals.prot);
	                    totals.carb = Math.round(totals.carb);
	                    totals.fat = Math.round(totals.fat);
	                    // save totals values with yesterday key
	                    var yesterday = new Date();
	                    yesterday.setDate(yesterday.getDate() - 1);
	                    yesterday = yesterday.toISOString().slice(0, 10); // ugly

	                    var historyTable = self.server.historicalData;
	                    // show old data
	                    historyTable.query().filter('date', yesterday).execute().then(function (old_records) {
	                        var ret = null;
	                        var newHistoryRecord = {
	                            date: yesterday,
	                            totals: totals
	                        };
	                        if (old_records.length == 0) {
	                            ret = historyTable.add(newHistoryRecord);
	                        } else {
	                            newHistoryRecord = old_records[0];
	                            newHistoryRecord.totals = totals;
	                            ret = historyTable.update(newHistoryRecord);
	                        }
	                        return ret;
	                    }).then(function () {
	                        // data saved (or not), fire event about it;
	                        BacklogDispatcher.historicalDataUpdated();
	                        return;
	                    }).catch(console.log.bind(this));
	                }).catch(console.log.bind(console));
	            }
	        }, {
	            key: 'getHistoricalData',
	            value: function getHistoricalData() {
	                /* Return promise, which resolved provides all historical data for this user
	                */
	                var historyTable = this.server.historicalData;
	                return historyTable.query().filter().execute();
	            }
	        }]);

	        return StorageClass;
	    }();

	    var Storage = new StorageClass();

	    // db - global package
	    db.open({
	        server: 'nutricalc.backlog',
	        version: 2,
	        schema: {
	            backlog: {
	                key: { keyPath: 'id', autoIncrement: true }
	            },
	            historicalData: {
	                key: { keyPath: 'id', autoIncrement: true }
	            }
	        }
	    }).then(function (s) {
	        Storage.server = s;
	    });

	    module.exports = Storage;
	})();

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var TableComponents = __webpack_require__(8);
	    var Storage = __webpack_require__(10);

	    var StatRow = function (_React$Component) {
	        _inherits(StatRow, _React$Component);

	        function StatRow(props) {
	            _classCallCheck(this, StatRow);

	            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StatRow).call(this, props));

	            _this._resetState();
	            return _this;
	        }

	        _createClass(StatRow, [{
	            key: '_resetState',
	            value: function _resetState() {
	                this.state = {
	                    day: 'today',
	                    mass: 0,
	                    prot: 0,
	                    carb: 0,
	                    fat: 0,
	                    ccal: 0,
	                    products: []
	                };
	            }
	        }, {
	            key: '_processStat',
	            value: function _processStat(food_data) {
	                this._resetState();
	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;

	                try {
	                    for (var _iterator = food_data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var product = _step.value;

	                        var this_amount = parseFloat(product.amount);
	                        var multiplier = 1;
	                        if (product.unit == '100gr') {
	                            multiplier = 0.01;
	                        }
	                        var this_mass = multiplier * this_amount;

	                        var this_ccal = product.ccal * this_mass;
	                        var this_prot = product.nutr_prot * this_mass;
	                        var this_carb = product.nutr_carb * this_mass;
	                        var this_fat = product.nutr_fat * this_mass;

	                        this.state.prot += this_prot;
	                        this.state.fat += this_fat;
	                        this.state.carb += this_carb;
	                        this.state.ccal += this_ccal;
	                        this.state.mass += this_amount;
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator.return) {
	                            _iterator.return();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }

	                var total_nutr = this.state.prot + this.state.fat + this.state.carb;
	                this.state.prot_perc = Math.round(100 * this.state.prot / total_nutr);
	                this.state.fat_perc = Math.round(100 * this.state.fat / total_nutr);
	                this.state.carb_perc = Math.round(100 * this.state.carb / total_nutr);
	                return;
	            }
	        }, {
	            key: 'reFetchFood',
	            value: function reFetchFood() {
	                // fetch all items from indexedb and update view representation
	                var self = this;
	                // console.log('calculating food stat');
	                function loadData() {
	                    var query_promise = Storage.getAllStoredFood();
	                    if (query_promise !== null) {
	                        query_promise.then(function (all_stored_food) {
	                            // render it
	                            self._processStat(all_stored_food);
	                        });
	                    } else {
	                        // DB not initialized yet, wait some time
	                        setTimeout(loadData, 100);
	                    }
	                }
	                loadData();
	            }
	        }, {
	            key: 'componentDidMount',
	            value: function componentDidMount() {
	                this.reFetchFood();
	                var statrow = this;
	                BacklogDispatcher.register(function (payload) {
	                    if (payload.action === BacklogDispatcher.appSymbols.foodAmountUpdated) {
	                        statrow.reFetchFood();
	                    }
	                });
	            }
	        }, {
	            key: 'render',
	            value: function render() {
	                this.prot_perc_readable = this.state.prot_perc + '%';
	                this.fat_perc_readable = this.state.fat_perc + '%';
	                this.carb_perc_readable = this.state.carb_perc + '%';
	                return React.createElement(
	                    TableComponents.TableHeader,
	                    { className: 'stat-row' },
	                    React.createElement(
	                        TableComponents.TableRow,
	                        null,
	                        React.createElement(TableComponents.TableCell, { value: 'Total:', className: 'bold' }),
	                        React.createElement(TableComponents.TableCell, { value: '' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.prot) }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.fat) }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.carb) }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.ccal) }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold' })
	                    ),
	                    React.createElement(
	                        TableComponents.TableRow,
	                        null,
	                        React.createElement(TableComponents.TableCell, { value: '', className: 'righted bold' }),
	                        React.createElement(TableComponents.TableCell, { value: '' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: '' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: this.prot_perc_readable }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: this.fat_perc_readable }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: this.carb_perc_readable }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: '' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: '' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: '' })
	                    )
	                );
	            }
	        }]);

	        return StatRow;
	    }(React.Component);

	    module.exports = StatRow;
	})();

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var TableComponents = __webpack_require__(8);
	    var FoodAmountField = __webpack_require__(9);

	    var FoundFoodTable = React.createClass({
	        displayName: 'FoundFoodTable',

	        // FoundFoodTable
	        getInitialState: function getInitialState() {
	            return {
	                found_food: []
	            };
	        },

	        componentDidMount: function componentDidMount() {
	            var table = this;
	            BacklogDispatcher.register(function (payload) {
	                if (payload.action === BacklogDispatcher.appSymbols.renderFoundFood) {
	                    table.setState({ found_food: payload.found_food });
	                }
	            });
	        },

	        header: function header() {
	            return React.createElement(
	                TableComponents.TableHeader,
	                null,
	                React.createElement(
	                    TableComponents.TableRow,
	                    null,
	                    React.createElement(TableComponents.TableCell, { value: 'Title', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Unit', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Ccal', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Prot', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Fat', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Carb', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Today', header: true, className: 'righted' })
	                )
	            );
	        },

	        body: function body(items) {
	            // let sorted_items = items.sort((a, b) => a.title.split('').sort().join('') <= b.title.split('').sort().join(''));
	            return React.createElement(
	                TableComponents.TableBody,
	                null,
	                items.map(function (item) {
	                    if (item.ccal) {
	                        item.ccal = item.ccal.toFixed(0);
	                    }
	                    if (item.nutr_prot) {
	                        item.nutr_prot = item.nutr_prot.toFixed(1);
	                    }
	                    if (item.nutr_fat) {
	                        item.nutr_fat = item.nutr_fat.toFixed(1);
	                    }
	                    if (item.nutr_carb) {
	                        item.nutr_carb = item.nutr_carb.toFixed(1);
	                    }
	                    return React.createElement(
	                        TableComponents.TableRow,
	                        { key: item.id },
	                        React.createElement(TableComponents.TableCell, { value: item.title }),
	                        React.createElement(TableComponents.TableCell, { value: item.unit, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: item.ccal, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: item.nutr_prot, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: item.nutr_fat, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: item.nutr_carb, className: 'righted' }),
	                        React.createElement(
	                            TableComponents.TableCell,
	                            { className: 'righted' },
	                            React.createElement(FoodAmountField, { food_data: item })
	                        )
	                    );
	                }, this)
	            );
	        },

	        render: function render() {
	            return React.createElement(
	                TableComponents.Table,
	                null,
	                this.header(),
	                this.body(this.state.found_food)
	            );
	        }
	    });

	    module.exports = FoundFoodTable;
	})();

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	(function () {
	    /* Renders simple graph about last 10 days nutrition.
	    It's ugly prototype, I'll refactor it later, when I know what do I want here...
	    // chuckchanedizainer
	     */
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var Storage = __webpack_require__(10);

	    var HistoricalDataGraph = function (_React$Component) {
	        _inherits(HistoricalDataGraph, _React$Component);

	        function HistoricalDataGraph(props) {
	            _classCallCheck(this, HistoricalDataGraph);

	            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HistoricalDataGraph).call(this, props));

	            _this._resetState();
	            _this.reFetchData.bind(_this);
	            _this.render.bind(_this);
	            _this._renderContainer.bind(_this);
	            _this._renderRow.bind(_this);
	            // BacklogDispatcher.historicalDataUpdated();
	            // setTimeout('BacklogDispatcher.historicalDataUpdated();', 1000)
	            function loadData() {
	                if (Storage.server) {
	                    BacklogDispatcher.historicalDataUpdated();
	                } else {
	                    setTimeout(loadData, 100);
	                }
	            }
	            loadData();
	            return _this;
	        }

	        _createClass(HistoricalDataGraph, [{
	            key: '_resetState',
	            value: function _resetState() {
	                this.state = {
	                    rows: []
	                };
	            }
	        }, {
	            key: 'componentDidMount',
	            value: function componentDidMount() {
	                var self = this;
	                BacklogDispatcher.register(function (payload) {
	                    if (payload.action === BacklogDispatcher.appSymbols.historicalDataUpdated) {
	                        self.reFetchData();
	                    }
	                });
	            }
	        }, {
	            key: 'reFetchData',
	            value: function reFetchData() {
	                var _this2 = this;

	                Storage.getHistoricalData().then(function (historical_data) {
	                    _this2.setState({ rows: historical_data });
	                });
	            }
	        }, {
	            key: 'render',
	            value: function render() {
	                return this._renderContainer(this.state.rows);
	            }
	        }, {
	            key: '_renderContainer',
	            value: function _renderContainer(rows) {
	                rows.sort(function (a, b) {
	                    return a['date'] >= b['date'];
	                });
	                rows = rows.slice(-10);
	                return React.createElement(
	                    'div',
	                    { className: 'graph-container' },
	                    rows.map(this._renderRow)
	                );
	            }
	            ///

	        }, {
	            key: '_renderRow',
	            value: function _renderRow(row) {
	                var totalDayAmount = row.totals.prot + row.totals.carb + row.totals.fat;
	                var scaleRatio = 0.5;
	                var date = new Date(row.date);
	                var dispProt = row.totals.prot * scaleRatio;
	                var dispCarb = row.totals.carb * scaleRatio;
	                var dispFat = row.totals.fat * scaleRatio;
	                var protStyle = {
	                    height: dispProt + 'px',
	                    backgroundColor: '#99CC00'
	                };
	                var carbStyle = {
	                    height: dispCarb + 'px',
	                    backgroundColor: '#CCCC99'
	                };
	                var fatStyle = {
	                    height: dispFat + 'px',
	                    backgroundColor: '#FFFF00'
	                };
	                return React.createElement(
	                    'div',
	                    { className: 'graph-row' },
	                    React.createElement(
	                        'div',
	                        { className: 'graph-item', style: protStyle },
	                        'Prot ',
	                        row.totals.prot
	                    ),
	                    React.createElement(
	                        'div',
	                        { className: 'graph-item', style: carbStyle },
	                        'Carb ',
	                        row.totals.carb
	                    ),
	                    React.createElement(
	                        'div',
	                        { className: 'graph-item', style: fatStyle },
	                        'Fat ',
	                        row.totals.fat
	                    ),
	                    React.createElement(
	                        'div',
	                        { className: 'graph-label' },
	                        date.toGMTString().slice(5, 11),
	                        React.createElement('br', null),
	                        row.totals.ccal,
	                        ' ccal'
	                    )
	                );
	            }
	        }]);

	        return HistoricalDataGraph;
	    }(React.Component);

	    module.exports = HistoricalDataGraph;
	})();

/***/ }
/******/ ]);