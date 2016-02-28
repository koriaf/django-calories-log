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

	(function ($, window, document) {
	    'use strict';
	    // load dispatcher

	    var BacklogDispatcher = __webpack_require__(1);

	    // load all top-level components
	    var EatenFoodTable = __webpack_require__(6);
	    var FoundFoodTable = __webpack_require__(9);

	    ReactDOM.render(React.createElement(EatenFoodTable, null), document.querySelector("#id_eaten_food_table_container"));

	    ReactDOM.render(React.createElement(FoundFoodTable, null), document.querySelector("#id_found_food_table_container"));

	    var Views = {
	        doFoodSearch: function doFoodSearch() {
	            var q = $("#id_food_search_input").val().trim();
	            // fetch list of goods by AJAX from server side using our API
	            $.getJSON("/api/v1/products/", { title: q }).done(function success(resp) {
	                // got product list. Update it
	                BacklogDispatcher.renderFoundFood(resp);
	            }).error(BacklogDispatcher.handleError);
	            return false;
	        },
	        setHandlers: function setHandlers() {
	            $("#id_food_search_button").bind('click', Views.doFoodSearch);
	            $("id_search_product_form").bind('submit', Views.doFoodSearch);
	        }
	    };

	    $(document).ready(Views.setHandlers);
	})(window.jQuery, window, document);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    var DispatcherClass = __webpack_require__(2).Dispatcher;

	    var BacklogDispatcher = new DispatcherClass();

	    BacklogDispatcher.renderFoundFood = function (food_data) {
	        // receives list of food items (from ajax request)
	        // allows FoundFoodTable to be repainted
	        this.dispatch({
	            action: 'renderFoundFood',
	            found_food: food_data
	        });
	    };

	    BacklogDispatcher.updateFoodAmount = function (food_row) {
	        // received food_row with updated amount
	        // allow store to save data and re-send new action foodAmountUpdated,
	        // which will re-render all items
	        this.dispatch({
	            action: 'updateFoodAmount',
	            food_row: food_row
	        });
	    };

	    BacklogDispatcher.foodAmountUpdated = function (food_id) {
	        // trigger re-render all amount fields
	        this.dispatch({
	            action: 'foodAmountUpdated',
	            food_id: food_id
	        });
	    };

	    BacklogDispatcher.handleError = function (errorResp) {
	        if (errorResp.status >= 400 && errorResp.status < 500) {
	            // user-defined error
	            alert("Error: " + errorResp.data.readable_message || errorResp.data || "Not specified");
	        } else {
	            // some server error...
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var TableComponents = __webpack_require__(10);
	    var FoodAmountField = __webpack_require__(7);
	    var StatRow = __webpack_require__(11);
	    var Storage = __webpack_require__(8);

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
	                if (payload.action === 'foodAmountUpdated') {
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
	                    React.createElement(TableComponents.TableCell, { value: '', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: '', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Ccal', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Prot', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Fat', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Carb', header: true, className: 'righted' }),
	                    React.createElement(TableComponents.TableCell, { value: 'Today', header: true, className: 'righted' })
	                )
	            );
	        },

	        body: function body(items) {
	            return React.createElement(
	                TableComponents.TableBody,
	                null,
	                items.map(function (food_row) {
	                    return React.createElement(
	                        TableComponents.TableRow,
	                        { key: food_row.id },
	                        React.createElement(TableComponents.TableCell, { value: food_row.title, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.unit, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.ccal, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.nutr_prot, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.nutr_fat, className: 'righted' }),
	                        React.createElement(TableComponents.TableCell, { value: food_row.nutr_carb, className: 'righted' }),
	                        React.createElement(
	                            TableComponents.TableCell,
	                            { className: 'righted' },
	                            React.createElement(FoodAmountField, { food_data: food_row })
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
	                React.createElement(StatRow, null),
	                this.body(this.state.all_stored_food)
	            );
	        }
	    });

	    module.exports = EatenFoodTable;
	})();

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var Storage = __webpack_require__(8);

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
	                if (payload.action === 'foodAmountUpdated') {
	                    if (field.food_data && payload.food_id == field.food_data.id) {
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
	                value: value, onChange: this.handleTextFieldChange
	            });
	        }
	    });

	    module.exports = FoodAmountField;
	})();

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	(function () {
	    var BacklogDispatcher = __webpack_require__(1);

	    var StorageClass = function () {
	        // class to work with local IndexedDB stored data.
	        // handles events of food addition, update or deletion.
	        // allow

	        function StorageClass() {
	            _classCallCheck(this, StorageClass);

	            this.server = null;
	            this.addFood.bind(this);

	            var storage = this;

	            BacklogDispatcher.register(function (payload) {
	                if (payload.action === 'updateFoodAmount') {
	                    // payload.food_row contains food_row with new updated amount
	                    storage.addFood(payload.food_row, payload.food_row.amount);
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
	                    if (results.length == 0) {
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
	                    };
	                    if (update_promise !== null) {
	                        update_promise.then(function () {
	                            BacklogDispatcher.foodAmountUpdated(food_data.id);
	                        });
	                    }
	                });
	            }
	        }]);

	        return StorageClass;
	    }();

	    var Storage = new StorageClass();

	    db.open({
	        server: 'nutricalc.backlog',
	        version: 1,
	        schema: {
	            backlog: {
	                key: { keyPath: 'id', autoIncrement: true }
	            }
	        }
	    }).then(function (s) {
	        Storage.server = s;
	    });

	    module.exports = Storage;
	})();

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	(function () {
	    'use strict';

	    var BacklogDispatcher = __webpack_require__(1);
	    var TableComponents = __webpack_require__(10);
	    var FoodAmountField = __webpack_require__(7);

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
	                if (payload.action === 'renderFoundFood') {
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
	                    React.createElement(TableComponents.TableCell, { value: 'Title', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Unit', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Ccal', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Prot', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Fat', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Carb', header: true }),
	                    React.createElement(TableComponents.TableCell, { value: 'Today', header: true })
	                )
	            );
	        },

	        body: function body(items) {
	            return React.createElement(
	                TableComponents.TableBody,
	                null,
	                items.map(function (item) {
	                    return React.createElement(
	                        TableComponents.TableRow,
	                        { key: item.id },
	                        React.createElement(TableComponents.TableCell, { value: item.title, align: 'right' }),
	                        React.createElement(TableComponents.TableCell, { value: item.unit }),
	                        React.createElement(TableComponents.TableCell, { value: item.ccal }),
	                        React.createElement(TableComponents.TableCell, { value: item.nutr_prot }),
	                        React.createElement(TableComponents.TableCell, { value: item.nutr_fat }),
	                        React.createElement(TableComponents.TableCell, { value: item.nutr_carb }),
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
/* 10 */
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
	    var TableComponents = __webpack_require__(10);
	    var Storage = __webpack_require__(8);

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
	                // console.log("Processing stat for " + this + " from " + food_data);
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
	                    if (payload.action === 'foodAmountUpdated') {
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
	                        React.createElement(TableComponents.TableCell, { value: 'Total:', className: 'righted bold' }),
	                        React.createElement(TableComponents.TableCell, { value: '' }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.ccal) }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.prot) }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.fat) }),
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: Math.round(this.state.carb) }),
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
	                        React.createElement(TableComponents.TableCell, { className: 'righted bold', value: '' })
	                    )
	                );
	            }
	        }]);

	        return StatRow;
	    }(React.Component);

	    module.exports = StatRow;
	})();

/***/ }
/******/ ]);