(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.DAPjs = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var domain;

    // This constructor is used to store event handlers. Instantiating this is
    // faster than explicitly calling `Object.create(null)` to get a "clean" empty
    // object (tested with v8 v4.9).
    function EventHandlers() {}
    EventHandlers.prototype = Object.create(null);

    function EventEmitter() {
      EventEmitter.init.call(this);
    }

    // nodejs oddity
    // require('events') === require('events').EventEmitter
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.usingDomains = false;

    EventEmitter.prototype.domain = undefined;
    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.init = function() {
      this.domain = null;
      if (EventEmitter.usingDomains) {
        // if there is an active domain, then attach to it.
        if (domain.active ) ;
      }

      if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || isNaN(n))
        throw new TypeError('"n" argument must be a positive number');
      this._maxListeners = n;
      return this;
    };

    function $getMaxListeners(that) {
      if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return $getMaxListeners(this);
    };

    // These standalone emit* functions are used to optimize calling of event
    // handlers for fast cases because emit() itself often has a variable number of
    // arguments and can be deoptimized because of that. These functions always have
    // the same number of arguments and thus do not get deoptimized, so the code
    // inside them can execute faster.
    function emitNone(handler, isFn, self) {
      if (isFn)
        handler.call(self);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self);
      }
    }
    function emitOne(handler, isFn, self, arg1) {
      if (isFn)
        handler.call(self, arg1);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1);
      }
    }
    function emitTwo(handler, isFn, self, arg1, arg2) {
      if (isFn)
        handler.call(self, arg1, arg2);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2);
      }
    }
    function emitThree(handler, isFn, self, arg1, arg2, arg3) {
      if (isFn)
        handler.call(self, arg1, arg2, arg3);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2, arg3);
      }
    }

    function emitMany(handler, isFn, self, args) {
      if (isFn)
        handler.apply(self, args);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].apply(self, args);
      }
    }

    EventEmitter.prototype.emit = function emit(type) {
      var er, handler, len, args, i, events, domain;
      var doError = (type === 'error');

      events = this._events;
      if (events)
        doError = (doError && events.error == null);
      else if (!doError)
        return false;

      domain = this.domain;

      // If there is no 'error' event listener then throw.
      if (doError) {
        er = arguments[1];
        if (domain) {
          if (!er)
            er = new Error('Uncaught, unspecified "error" event');
          er.domainEmitter = this;
          er.domain = domain;
          er.domainThrown = false;
          domain.emit('error', er);
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
        return false;
      }

      handler = events[type];

      if (!handler)
        return false;

      var isFn = typeof handler === 'function';
      len = arguments.length;
      switch (len) {
        // fast cases
        case 1:
          emitNone(handler, isFn, this);
          break;
        case 2:
          emitOne(handler, isFn, this, arguments[1]);
          break;
        case 3:
          emitTwo(handler, isFn, this, arguments[1], arguments[2]);
          break;
        case 4:
          emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
          break;
        // slower
        default:
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          emitMany(handler, isFn, this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = target._events;
      if (!events) {
        events = target._events = new EventHandlers();
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener) {
          target.emit('newListener', type,
                      listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (!existing) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] = prepend ? [listener, existing] :
                                              [existing, listener];
        } else {
          // If we've already got an array, just append.
          if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
        }

        // Check for listener leak
        if (!existing.warned) {
          m = $getMaxListeners(target);
          if (m && m > 0 && existing.length > m) {
            existing.warned = true;
            var w = new Error('Possible EventEmitter memory leak detected. ' +
                                existing.length + ' ' + type + ' listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            emitWarning(w);
          }
        }
      }

      return target;
    }
    function emitWarning(e) {
      typeof console.warn === 'function' ? console.warn(e) : console.log(e);
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

    function _onceWrap(target, type, listener) {
      var fired = false;
      function g() {
        target.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(target, arguments);
        }
      }
      g.listener = listener;
      return g;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');

          events = this._events;
          if (!events)
            return this;

          list = events[type];
          if (!list)
            return this;

          if (list === listener || (list.listener && list.listener === listener)) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length; i-- > 0;) {
              if (list[i] === listener ||
                  (list[i].listener && list[i].listener === listener)) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (list.length === 1) {
              list[0] = undefined;
              if (--this._eventsCount === 0) {
                this._events = new EventHandlers();
                return this;
              } else {
                delete events[type];
              }
            } else {
              spliceOne(list, position);
            }

            if (events.removeListener)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };

    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events;

          events = this._events;
          if (!events)
            return this;

          // not listening for removeListener, no need to emit
          if (!events.removeListener) {
            if (arguments.length === 0) {
              this._events = new EventHandlers();
              this._eventsCount = 0;
            } else if (events[type]) {
              if (--this._eventsCount === 0)
                this._events = new EventHandlers();
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            for (var i = 0, key; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = new EventHandlers();
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners) {
            // LIFO order
            do {
              this.removeListener(type, listeners[listeners.length - 1]);
            } while (listeners[0]);
          }

          return this;
        };

    EventEmitter.prototype.listeners = function listeners(type) {
      var evlistener;
      var ret;
      var events = this._events;

      if (!events)
        ret = [];
      else {
        evlistener = events[type];
        if (!evlistener)
          ret = [];
        else if (typeof evlistener === 'function')
          ret = [evlistener.listener || evlistener];
        else
          ret = unwrapListeners(evlistener);
      }

      return ret;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
    };

    // About 1.5x faster than the two-arg version of Array#splice().
    function spliceOne(list, index) {
      for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
        list[i] = list[k];
      list.pop();
    }

    function arrayClone(arr, i) {
      var copy = new Array(i);
      while (i--)
        copy[i] = arr[i];
      return copy;
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    /**
     * @hidden
     */
    var DEFAULT_CLOCK_FREQUENCY = 10000000;
    /**
     * @hidden
     */
    var SWD_SEQUENCE = 0xE79E;
    /**
     * @hidden
     */
    var JTAG_SEQUENCE = 0xE73C;
    /**
     * @hidden
     */
    var BLOCK_HEADER_SIZE = 4;
    /**
     * @hidden
     */
    var TRANSFER_HEADER_SIZE = 2;
    /**
     * @hidden
     */
    var TRANSFER_OPERATION_SIZE = 5;
    /**
     * @hidden
     */
    var Mutex = /** @class */ (function () {
        function Mutex() {
            this.locked = false;
        }
        /**
         * Wait until the Mutex is available and claim it
         */
        Mutex.prototype.lock = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.locked) return [3 /*break*/, 2];
                            // Yield the current execution context, effectively moving it to the back of the promise queue
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1); })];
                        case 1:
                            // Yield the current execution context, effectively moving it to the back of the promise queue
                            _a.sent();
                            return [3 /*break*/, 0];
                        case 2:
                            this.locked = true;
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Unlock the Mutex
         */
        Mutex.prototype.unlock = function () {
            this.locked = false;
        };
        return Mutex;
    }());
    /**
     * CMSIS-DAP class
     * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__Commands__gr.html
     */
    var CmsisDAP = /** @class */ (function (_super) {
        __extends(CmsisDAP, _super);
        /**
         * CMSIS-DAP constructor
         * @param transport Debug transport to use
         * @param mode Debug mode to use
         * @param clockFrequency Communication clock frequency to use (default 10000000)
         */
        function CmsisDAP(transport, mode, clockFrequency) {
            if (mode === void 0) { mode = 0 /* DEFAULT */; }
            if (clockFrequency === void 0) { clockFrequency = DEFAULT_CLOCK_FREQUENCY; }
            var _this = _super.call(this) || this;
            _this.transport = transport;
            _this.mode = mode;
            _this.clockFrequency = clockFrequency;
            /**
             * Whether the device has been opened
             */
            _this.connected = false;
            _this.sendMutex = new Mutex();
            // Determine the block size
            _this.blockSize = _this.transport.packetSize - BLOCK_HEADER_SIZE - 1; // -1 for the DAP_TRANSFER_BLOCK command
            // Determine the operation count possible
            var operationSpace = _this.transport.packetSize - TRANSFER_HEADER_SIZE - 1; // -1 for the DAP_TRANSFER command
            _this.operationCount = Math.floor(operationSpace / TRANSFER_OPERATION_SIZE);
            return _this;
        }
        CmsisDAP.prototype.bufferSourceToUint8Array = function (prefix, data) {
            if (!data) {
                return new Uint8Array([prefix]);
            }
            var isView = function (source) {
                return source.buffer !== undefined;
            };
            var arrayBuffer = isView(data) ? data.buffer : data;
            var result = new Uint8Array(arrayBuffer.byteLength + 1);
            result.set([prefix]);
            result.set(new Uint8Array(arrayBuffer), 1);
            return result;
        };
        /**
         * Switches the CMSIS-DAP unit to use SWD
         * http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.ddi0316d/Chdhfbhc.html
         */
        CmsisDAP.prototype.selectProtocol = function (protocol) {
            return __awaiter(this, void 0, void 0, function () {
                var sequence;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            sequence = protocol === 2 /* JTAG */ ? JTAG_SEQUENCE : SWD_SEQUENCE;
                            return [4 /*yield*/, this.swjSequence(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]))];
                        case 1:
                            _a.sent(); // Sequence of 1's
                            return [4 /*yield*/, this.swjSequence(new Uint16Array([sequence]))];
                        case 2:
                            _a.sent(); // Send protocol sequence
                            return [4 /*yield*/, this.swjSequence(new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]))];
                        case 3:
                            _a.sent(); // Sequence of 1's
                            return [4 /*yield*/, this.swjSequence(new Uint8Array([0x00]))];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Send a command
         * @param command Command to send
         * @param data Data to use
         * @returns Promise of DataView
         */
        CmsisDAP.prototype.send = function (command, data) {
            return __awaiter(this, void 0, void 0, function () {
                var array, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            array = this.bufferSourceToUint8Array(command, data);
                            return [4 /*yield*/, this.sendMutex.lock()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, , 5, 6]);
                            return [4 /*yield*/, this.transport.write(array)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.transport.read()];
                        case 4:
                            response = _a.sent();
                            if (response.getUint8(0) !== command) {
                                throw new Error("Bad response for " + command + " -> " + response.getUint8(0));
                            }
                            switch (command) {
                                case 3 /* DAP_DISCONNECT */:
                                case 8 /* DAP_WRITE_ABORT */:
                                case 9 /* DAP_DELAY */:
                                case 10 /* DAP_RESET_TARGET */:
                                case 17 /* DAP_SWJ_CLOCK */:
                                case 18 /* DAP_SWJ_SEQUENCE */:
                                case 19 /* DAP_SWD_CONFIGURE */:
                                case 29 /* DAP_SWD_SEQUENCE */:
                                case 23 /* DAP_SWO_TRANSPORT */:
                                case 24 /* DAP_SWO_MODE */:
                                case 26 /* DAP_SWO_CONTROL */:
                                case 21 /* DAP_JTAG_CONFIGURE */:
                                case 22 /* DAP_JTAG_ID_CODE */:
                                case 4 /* DAP_TRANSFER_CONFIGURE */:
                                    if (response.getUint8(1) !== 0 /* DAP_OK */) {
                                        throw new Error("Bad status for " + command + " -> " + response.getUint8(1));
                                    }
                            }
                            return [2 /*return*/, response];
                        case 5:
                            this.sendMutex.unlock();
                            return [7 /*endfinally*/];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Clears the abort register of all error flags
         * @param abortMask Optional AbortMask to use, otherwise clears all flags
         */
        CmsisDAP.prototype.clearAbort = function (abortMask) {
            if (abortMask === void 0) { abortMask = 8 /* WDERRCLR */ | 4 /* STKERRCLR */ | 2 /* STKCMPCLR */ | 16 /* ORUNERRCLR */; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.send(8 /* DAP_WRITE_ABORT */, new Uint8Array([0, abortMask]))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get DAP information
         * @param request Type of information to get
         * @returns Promise of number or string
         */
        CmsisDAP.prototype.dapInfo = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var result, length_1, ascii, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, this.send(0 /* DAP_INFO */, new Uint8Array([request]))];
                        case 1:
                            result = _a.sent();
                            length_1 = result.getUint8(1);
                            if (length_1 === 0) {
                                throw new Error('DAP Info Failure');
                            }
                            switch (request) {
                                case 240 /* CAPABILITIES */:
                                case 254 /* PACKET_COUNT */:
                                case 255 /* PACKET_SIZE */:
                                case 253 /* SWO_TRACE_BUFFER_SIZE */:
                                    // Byte
                                    if (length_1 === 1)
                                        return [2 /*return*/, result.getUint8(2)];
                                    // Short
                                    if (length_1 === 2)
                                        return [2 /*return*/, result.getUint16(2)];
                                    // Word
                                    if (length_1 === 4)
                                        return [2 /*return*/, result.getUint32(2)];
                            }
                            ascii = Array.prototype.slice.call(new Uint8Array(result.buffer, 2, length_1));
                            return [2 /*return*/, String.fromCharCode.apply(null, ascii)];
                        case 2:
                            error_1 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 3:
                            _a.sent();
                            throw error_1;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Send an SWJ Sequence
         * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__SWJ__Sequence.html
         * @param sequence The sequence to send
         * @returns Promise
         */
        CmsisDAP.prototype.swjSequence = function (sequence) {
            return __awaiter(this, void 0, void 0, function () {
                var bitLength, data, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            bitLength = sequence.byteLength * 8;
                            data = this.bufferSourceToUint8Array(bitLength, sequence);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, this.send(18 /* DAP_SWJ_SEQUENCE */, data)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            error_2 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 4:
                            _a.sent();
                            throw error_2;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Configure Transfer
         * https://www.keil.com/pack/doc/CMSIS/DAP/html/group__DAP__TransferConfigure.html
         * @param idleCycles Number of extra idle cycles after each transfer
         * @param waitRetry Number of transfer retries after WAIT response
         * @param matchRetry Number of retries on reads with Value Match in DAP_Transfer
         * @returns Promise
         */
        CmsisDAP.prototype.configureTransfer = function (idleCycles, waitRetry, matchRetry) {
            return __awaiter(this, void 0, void 0, function () {
                var data, view, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            data = new Uint8Array(5);
                            view = new DataView(data.buffer);
                            view.setUint8(0, idleCycles);
                            view.setUint16(1, waitRetry, true);
                            view.setUint16(3, matchRetry, true);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, this.send(4 /* DAP_TRANSFER_CONFIGURE */, data)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            error_3 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 4:
                            _a.sent();
                            throw error_3;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Connect to target device
         * @returns Promise
         */
        CmsisDAP.prototype.connect = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_4, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.connected === true) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.transport.open()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 5, , 8]);
                            return [4 /*yield*/, this.send(17 /* DAP_SWJ_CLOCK */, new Uint32Array([this.clockFrequency]))];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.send(2 /* DAP_CONNECT */, new Uint8Array([this.mode]))];
                        case 4:
                            result = _a.sent();
                            if (result.getUint8(1) === 0 /* FAILED */ || this.mode !== 0 /* DEFAULT */ && result.getUint8(1) !== this.mode) {
                                throw new Error('Mode not enabled.');
                            }
                            return [3 /*break*/, 8];
                        case 5:
                            error_4 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, this.transport.close()];
                        case 7:
                            _a.sent();
                            throw error_4;
                        case 8:
                            _a.trys.push([8, 11, , 13]);
                            return [4 /*yield*/, this.configureTransfer(0, 100, 0)];
                        case 9:
                            _a.sent();
                            return [4 /*yield*/, this.selectProtocol(1 /* SWD */)];
                        case 10:
                            _a.sent();
                            return [3 /*break*/, 13];
                        case 11:
                            error_5 = _a.sent();
                            return [4 /*yield*/, this.transport.close()];
                        case 12:
                            _a.sent();
                            throw error_5;
                        case 13:
                            this.connected = true;
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Disconnect from target device
         * @returns Promise
         */
        CmsisDAP.prototype.disconnect = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.connected === false) {
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, this.send(3 /* DAP_DISCONNECT */)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            error_6 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 4:
                            _a.sent();
                            throw error_6;
                        case 5: return [4 /*yield*/, this.transport.close()];
                        case 6:
                            _a.sent();
                            this.connected = false;
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Reconnect to target device
         * @returns Promise
         */
        CmsisDAP.prototype.reconnect = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.disconnect()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.connect()];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Reset target device
         * @returns Promise of whether a device specific reset sequence is implemented
         */
        CmsisDAP.prototype.reset = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, this.send(10 /* DAP_RESET_TARGET */)];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.getUint8(2) === 1 /* RESET_SEQUENCE */];
                        case 2:
                            error_7 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 3:
                            _a.sent();
                            throw error_7;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        CmsisDAP.prototype.transfer = function (portOrOps, mode, register, value) {
            if (mode === void 0) { mode = 2 /* READ */; }
            if (register === void 0) { register = 0; }
            if (value === void 0) { value = 0; }
            return __awaiter(this, void 0, void 0, function () {
                var operations, data, view, result, response, length_2, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof portOrOps === 'number') {
                                operations = [{
                                        port: portOrOps,
                                        mode: mode,
                                        register: register,
                                        value: value
                                    }];
                            }
                            else {
                                operations = portOrOps;
                            }
                            data = new Uint8Array(TRANSFER_HEADER_SIZE + (operations.length * TRANSFER_OPERATION_SIZE));
                            view = new DataView(data.buffer);
                            // DAP Index, ignored for SWD
                            view.setUint8(0, 0);
                            // Transfer count
                            view.setUint8(1, operations.length);
                            operations.forEach(function (operation, index) {
                                var offset = TRANSFER_HEADER_SIZE + (index * TRANSFER_OPERATION_SIZE);
                                // Transfer request
                                view.setUint8(offset, operation.port | operation.mode | operation.register);
                                // Transfer data
                                view.setUint32(offset + 1, operation.value || 0, true);
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, this.send(5 /* DAP_TRANSFER */, data)];
                        case 2:
                            result = _a.sent();
                            // Transfer count
                            if (result.getUint8(1) !== operations.length) {
                                throw new Error('Transfer count mismatch');
                            }
                            response = result.getUint8(2);
                            if (response === 2 /* WAIT */) {
                                throw new Error('Transfer response WAIT');
                            }
                            if (response === 4 /* FAULT */) {
                                throw new Error('Transfer response FAULT');
                            }
                            if (response === 8 /* PROTOCOL_ERROR */) {
                                throw new Error('Transfer response PROTOCOL_ERROR');
                            }
                            if (response === 16 /* VALUE_MISMATCH */) {
                                throw new Error('Transfer response VALUE_MISMATCH');
                            }
                            if (response === 7 /* NO_ACK */) {
                                throw new Error('Transfer response NO_ACK');
                            }
                            if (typeof portOrOps === 'number') {
                                return [2 /*return*/, result.getUint32(3, true)];
                            }
                            length_2 = operations.length * 4;
                            return [2 /*return*/, new Uint32Array(result.buffer.slice(3, 3 + length_2))];
                        case 3:
                            error_8 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 4:
                            _a.sent();
                            throw error_8;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        CmsisDAP.prototype.transferBlock = function (port, register, countOrValues) {
            return __awaiter(this, void 0, void 0, function () {
                var operationCount, mode, dataSize, data, view, result, response, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            dataSize = BLOCK_HEADER_SIZE;
                            if (typeof countOrValues === 'number') {
                                operationCount = countOrValues;
                                mode = 2 /* READ */;
                            }
                            else {
                                operationCount = countOrValues.length;
                                mode = 0 /* WRITE */;
                                dataSize += countOrValues.byteLength;
                            }
                            data = new Uint8Array(dataSize);
                            view = new DataView(data.buffer);
                            // DAP Index, ignored for SWD
                            view.setUint8(0, 0);
                            // Transfer count
                            view.setUint16(1, operationCount, true);
                            // Transfer request
                            view.setUint8(3, port | mode | register);
                            if (typeof countOrValues !== 'number') {
                                // Transfer data
                                countOrValues.forEach(function (countOrValue, index) {
                                    var offset = BLOCK_HEADER_SIZE + (index * 4);
                                    // Transfer data
                                    view.setUint32(offset, countOrValue, true);
                                });
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, this.send(6 /* DAP_TRANSFER_BLOCK */, view)];
                        case 2:
                            result = _a.sent();
                            // Transfer count
                            if (result.getUint16(1, true) !== operationCount) {
                                throw new Error('Transfer count mismatch');
                            }
                            response = result.getUint8(3);
                            if (response === 2 /* WAIT */) {
                                throw new Error('Transfer response WAIT');
                            }
                            if (response === 4 /* FAULT */) {
                                throw new Error('Transfer response FAULT');
                            }
                            if (response === 8 /* PROTOCOL_ERROR */) {
                                throw new Error('Transfer response PROTOCOL_ERROR');
                            }
                            if (response === 7 /* NO_ACK */) {
                                throw new Error('Transfer response NO_ACK');
                            }
                            if (typeof countOrValues === 'number') {
                                return [2 /*return*/, new Uint32Array(result.buffer.slice(4, 4 + operationCount * 4))];
                            }
                            return [3 /*break*/, 5];
                        case 3:
                            error_9 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 4:
                            _a.sent();
                            throw error_9;
                        case 5: return [2 /*return*/, undefined];
                    }
                });
            });
        };
        return CmsisDAP;
    }(EventEmitter));

    /*
    * DAPjs
    * Copyright Arm Limited 2020
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    // https://github.com/anonyco/FastestSmallestTextEncoderDecoder
    var PARTIAL_CHAR_TEST = /[\xc0-\xff][\x80-\xbf]*$/g;
    var DOUBLE_BYTE_REPLACE = /[\xc0-\xff][\x80-\xbf]*/g;
    var TextDecoder = /** @class */ (function () {
        function TextDecoder() {
        }
        /**
         * Decode an ArrayBuffer to a string, handling double-byte characters
         * @param input The ArrayBuffer to decode
         */
        TextDecoder.prototype.decode = function (input) {
            var numberArray = Array.prototype.slice.call(new Uint8Array(input));
            var data = String.fromCodePoint.apply(undefined, numberArray);
            if (this.partialChar) {
                // Previous double-byte character was cut off
                data = "" + this.partialChar + data;
                this.partialChar = undefined;
            }
            var match = data.match(PARTIAL_CHAR_TEST);
            if (match) {
                // Partial double-byte character at end of string, save it and truncate data
                var length_1 = match[0].length;
                this.partialChar = data.slice(-length_1);
                data = data.slice(0, -length_1);
            }
            return data.replace(DOUBLE_BYTE_REPLACE, this.decoderReplacer);
        };
        TextDecoder.prototype.decoderReplacer = function (encoded) {
            var codePoint = encoded.codePointAt(0) << 24;
            var leadingOnes = Math.clz32(~codePoint);
            var endPos = 0;
            var stringLen = encoded.length;
            var result = '';
            if (leadingOnes < 5 && stringLen >= leadingOnes) {
                codePoint = (codePoint << leadingOnes) >>> (24 + leadingOnes);
                for (endPos = 1; endPos < leadingOnes; endPos = endPos + 1) {
                    codePoint = (codePoint << 6) | (encoded.codePointAt(endPos) & 0x3f);
                }
                if (codePoint <= 0xFFFF) { // BMP code point
                    result += String.fromCodePoint(codePoint);
                }
                else if (codePoint <= 0x10FFFF) {
                    // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                    codePoint = codePoint - 0x10000;
                    result += String.fromCodePoint((codePoint >> 10) + 0xD800, // highSurrogate
                    (codePoint & 0x3ff) + 0xDC00 // lowSurrogate
                    );
                }
                else
                    endPos = 0; // to fill it in with INVALIDs
            }
            for (; endPos < stringLen; endPos = endPos + 1) {
                result += '\ufffd'; // replacement character
            }
            return result;
        };
        return TextDecoder;
    }());

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    /**
     * @hidden
     */
    var DEFAULT_BAUDRATE = 9600;
    /**
     * @hidden
     */
    var DEFAULT_SERIAL_DELAY = 100;
    /**
     * @hidden
     */
    var DEFAULT_PAGE_SIZE = 62;
    /**
     * @hidden
     */
    var decoder = new TextDecoder();
    /**
     * DAPLink Class
     */
    var DAPLink = /** @class */ (function (_super) {
        __extends(DAPLink, _super);
        /**
         * DAPLink constructor
         * @param transport Debug transport to use
         * @param mode Debug mode to use
         * @param clockFrequency Communication clock frequency to use (default 10000000)
         */
        function DAPLink(transport, mode, clockFrequency) {
            if (mode === void 0) { mode = 0 /* DEFAULT */; }
            if (clockFrequency === void 0) { clockFrequency = DEFAULT_CLOCK_FREQUENCY; }
            var _this = _super.call(this, transport, mode, clockFrequency) || this;
            /**
             * @hidden
             */
            _this.serialPolling = false;
            /**
             * @hidden
             */
            _this.serialListeners = false;
            _this.on('newListener', function (event) { return __awaiter(_this, void 0, void 0, function () {
                var listenerCount;
                return __generator(this, function (_a) {
                    if (event === DAPLink.EVENT_SERIAL_DATA) {
                        listenerCount = this.listenerCount(event);
                        if (listenerCount === 0) {
                            this.serialListeners = true;
                        }
                    }
                    return [2 /*return*/];
                });
            }); });
            _this.on('removeListener', function (event) {
                if (event === DAPLink.EVENT_SERIAL_DATA) {
                    var listenerCount = _this.listenerCount(event);
                    if (listenerCount === 0) {
                        _this.serialListeners = false;
                    }
                }
            });
            return _this;
        }
        /**
         * Detect if buffer contains text or binary data
         */
        DAPLink.prototype.isBufferBinary = function (buffer) {
            var numberArray = Array.prototype.slice.call(new Uint16Array(buffer, 0, 50));
            var bufferString = String.fromCharCode.apply(null, numberArray);
            for (var i = 0; i < bufferString.length; i++) {
                var charCode = bufferString.charCodeAt(i);
                // 65533 is a code for unknown character
                // 0-8 are codes for control characters
                if (charCode === 65533 || charCode <= 8) {
                    return true;
                }
            }
            return false;
        };
        DAPLink.prototype.writeBuffer = function (buffer, pageSize, offset) {
            if (offset === void 0) { offset = 0; }
            return __awaiter(this, void 0, void 0, function () {
                var end, page, data, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            end = Math.min(buffer.byteLength, offset + pageSize);
                            page = buffer.slice(offset, end);
                            data = new Uint8Array(page.byteLength + 1);
                            data.set([page.byteLength]);
                            data.set(new Uint8Array(page), 1);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, this.send(140 /* WRITE */, data)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            error_1 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 4:
                            _a.sent();
                            throw error_1;
                        case 5:
                            this.emit(DAPLink.EVENT_PROGRESS, offset / buffer.byteLength);
                            if (end < buffer.byteLength) {
                                return [2 /*return*/, this.writeBuffer(buffer, pageSize, end)];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Flash the target
         * @param buffer The image to flash
         * @param pageSize The page size to use (defaults to 62)
         * @returns Promise
         */
        DAPLink.prototype.flash = function (buffer, pageSize) {
            if (pageSize === void 0) { pageSize = DEFAULT_PAGE_SIZE; }
            return __awaiter(this, void 0, void 0, function () {
                var isView, arrayBuffer, streamType, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isView = function (source) {
                                return source.buffer !== undefined;
                            };
                            arrayBuffer = isView(buffer) ? buffer.buffer : buffer;
                            streamType = this.isBufferBinary(arrayBuffer) ? 0 : 1;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, , 8]);
                            return [4 /*yield*/, this.send(138 /* OPEN */, new Uint32Array([streamType]))];
                        case 2:
                            result = _a.sent();
                            // An error occurred
                            if (result.getUint8(1) !== 0) {
                                throw new Error('Flash error');
                            }
                            return [4 /*yield*/, this.writeBuffer(arrayBuffer, pageSize)];
                        case 3:
                            _a.sent();
                            this.emit(DAPLink.EVENT_PROGRESS, 1.0);
                            return [4 /*yield*/, this.send(139 /* CLOSE */)];
                        case 4:
                            result = _a.sent();
                            // An error occurred
                            if (result.getUint8(1) !== 0) {
                                throw new Error('Flash error');
                            }
                            return [4 /*yield*/, this.send(137 /* RESET */)];
                        case 5:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 6:
                            error_2 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 7:
                            _a.sent();
                            throw error_2;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get the serial baud rate setting
         * @returns Promise of baud rate
         */
        DAPLink.prototype.getSerialBaudrate = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, this.send(129 /* READ_SETTINGS */)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.getUint32(1, true)];
                        case 2:
                            error_3 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 3:
                            _a.sent();
                            throw error_3;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Set the serial baud rate setting
         * @param baudrate The baudrate to use (defaults to 9600)
         * @returns Promise
         */
        DAPLink.prototype.setSerialBaudrate = function (baudrate) {
            if (baudrate === void 0) { baudrate = DEFAULT_BAUDRATE; }
            return __awaiter(this, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, this.send(130 /* WRITE_SETTINGS */, new Uint32Array([baudrate]))];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 2:
                            error_4 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 3:
                            _a.sent();
                            throw error_4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Write serial data
         * @param data The data to write
         * @returns Promise
         */
        DAPLink.prototype.serialWrite = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var arrayData, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            arrayData = data.split('').map(function (e) { return e.charCodeAt(0); });
                            arrayData.unshift(arrayData.length);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 5]);
                            return [4 /*yield*/, this.send(132 /* WRITE */, new Uint8Array(arrayData).buffer)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            error_5 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 4:
                            _a.sent();
                            throw error_5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Read serial data
         * @returns Promise of any arrayBuffer read
         */
        DAPLink.prototype.serialRead = function () {
            return __awaiter(this, void 0, void 0, function () {
                var serialData, dataLength, offset, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 4]);
                            return [4 /*yield*/, this.send(131 /* READ */)];
                        case 1:
                            serialData = _a.sent();
                            //console.log(serialData);
                            // Check if there is any data returned from the device
                            if (serialData.byteLength === 0) {
                                return [2 /*return*/, undefined];
                            }
                            // First byte contains the vendor code
                            if (serialData.getUint8(0) !== 131 /* READ */) {
                                return [2 /*return*/, undefined];
                            }
                            dataLength = serialData.getUint8(1);
                            if (dataLength === 0) {
                                return [2 /*return*/, undefined];
                            }
                            offset = 2;
                            console.log(serialData.buffer)
                            return [2 /*return*/, serialData.buffer.slice(offset, offset + dataLength)];
                        case 2:
                            error_6 = _a.sent();
                            return [4 /*yield*/, this.clearAbort()];
                        case 3:
                            _a.sent();
                            throw error_6;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Start listening for serial data
         * @param serialDelay The serial delay to use (default 100)
         * @param autoConnect whether to automatically connect to the target (default true)
         */
        DAPLink.prototype.startSerialRead = function (serialDelay, autoConnect) {
            if (serialDelay === void 0) { serialDelay = DEFAULT_SERIAL_DELAY; }
            if (autoConnect === void 0) { autoConnect = true; }
            return __awaiter(this, void 0, void 0, function () {
                var connectedState, serialData, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.serialPolling = true;
                            _a.label = 1;
                        case 1:
                            if (!this.serialPolling) return [3 /*break*/, 9];
                            if (!this.serialListeners) return [3 /*break*/, 7];
                            connectedState = this.connected;
                            if (!(this.connected === false && autoConnect === true)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.connect()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.serialRead()];
                        case 4:
                            serialData = _a.sent();
                            if (!(connectedState === false && autoConnect === true)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.disconnect()];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            if (serialData !== undefined) {
                                data = decoder.decode(serialData);
                                this.emit(DAPLink.EVENT_SERIAL_DATA, data);
                            }
                            _a.label = 7;
                        case 7: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, serialDelay); })];
                        case 8:
                            _a.sent();
                            return [3 /*break*/, 1];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Stop listening for serial data
         */
        DAPLink.prototype.stopSerialRead = function () {
            this.serialPolling = false;
        };
        /**
         * Progress event
         * @event
         */
        DAPLink.EVENT_PROGRESS = 'progress';
        /**
         * Serial read event
         * @event
         */
        DAPLink.EVENT_SERIAL_DATA = 'serial';
        return DAPLink;
    }(CmsisDAP));

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    /**
     * @hidden
     */
    var DEFAULT_WAIT_DELAY = 100;
    /**
     * Arm Debug Interface class
     */
    var ADI = /** @class */ (function () {
        function ADI(transportOrDap, mode, clockFrequency) {
            if (mode === void 0) { mode = 0 /* DEFAULT */; }
            if (clockFrequency === void 0) { clockFrequency = DEFAULT_CLOCK_FREQUENCY; }
            var isTransport = function (test) {
                return test.open !== undefined;
            };
            this.proxy = isTransport(transportOrDap) ? new CmsisDAP(transportOrDap, mode, clockFrequency) : transportOrDap;
        }
        /**
         * Continually run a function until it returns true
         * @param fn The function to run
         * @param timeout Optional timeout to wait before giving up and throwing
         * @param timer The milliseconds to wait between each run
         * @returns Promise
         */
        ADI.prototype.waitDelay = function (fn, timeout, timer) {
            if (timeout === void 0) { timeout = 0; }
            if (timer === void 0) { timer = DEFAULT_WAIT_DELAY; }
            return __awaiter(this, void 0, void 0, function () {
                var running, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            running = true;
                            if (timeout > 0) {
                                setTimeout(function () {
                                    if (running) {
                                        running = false;
                                        throw new Error('Wait timed out');
                                    }
                                }, timeout);
                            }
                            _a.label = 1;
                        case 1:
                            if (!running) return [3 /*break*/, 5];
                            return [4 /*yield*/, fn()];
                        case 2:
                            result = _a.sent();
                            if (result === true) {
                                running = false;
                                return [2 /*return*/];
                            }
                            if (!(timer > 0)) return [3 /*break*/, 4];
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, timeout); })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [3 /*break*/, 1];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        ADI.prototype.concatTypedArray = function (arrays) {
            // Only one array exists
            if (arrays.length === 1)
                return arrays[0];
            // Determine array length
            var length = 0;
            for (var _i = 0, arrays_1 = arrays; _i < arrays_1.length; _i++) {
                var array = arrays_1[_i];
                length += array.length;
            }
            // Concat the arrays
            var result = new Uint32Array(length);
            for (var i = 0, j = 0; i < arrays.length; i++) {
                result.set(arrays[i], j);
                j += arrays[i].length;
            }
            return result;
        };
        ADI.prototype.readDPCommand = function (register) {
            return [{
                    mode: 2 /* READ */,
                    port: 0 /* DEBUG */,
                    register: register
                }];
        };
        ADI.prototype.writeDPCommand = function (register, value) {
            if (register === 8 /* SELECT */) {
                if (value === this.selectedAddress) {
                    return [];
                }
                this.selectedAddress = value;
            }
            return [{
                    mode: 0 /* WRITE */,
                    port: 0 /* DEBUG */,
                    register: register,
                    value: value
                }];
        };
        ADI.prototype.readAPCommand = function (register) {
            var address = (register & 4278190080 /* APSEL */) | (register & 240 /* APBANKSEL */);
            return this.writeDPCommand(8 /* SELECT */, address).concat({
                mode: 2 /* READ */,
                port: 1 /* ACCESS */,
                register: register
            });
        };
        ADI.prototype.writeAPCommand = function (register, value) {
            if (register === 0 /* CSW */) {
                if (value === this.cswValue) {
                    return [];
                }
                this.cswValue = value;
            }
            var address = (register & 4278190080 /* APSEL */) | (register & 240 /* APBANKSEL */);
            return this.writeDPCommand(8 /* SELECT */, address).concat({
                mode: 0 /* WRITE */,
                port: 1 /* ACCESS */,
                register: register,
                value: value
            });
        };
        ADI.prototype.readMem16Command = function (register) {
            return this.writeAPCommand(0 /* CSW */, 587202640 /* VALUE */ | 1 /* SIZE_16 */)
                .concat(this.writeAPCommand(4 /* TAR */, register))
                .concat(this.readAPCommand(12 /* DRW */));
        };
        ADI.prototype.writeMem16Command = function (register, value) {
            return this.writeAPCommand(0 /* CSW */, 587202640 /* VALUE */ | 1 /* SIZE_16 */)
                .concat(this.writeAPCommand(4 /* TAR */, register))
                .concat(this.writeAPCommand(12 /* DRW */, value));
        };
        ADI.prototype.readMem32Command = function (register) {
            return this.writeAPCommand(0 /* CSW */, 587202640 /* VALUE */ | 2 /* SIZE_32 */)
                .concat(this.writeAPCommand(4 /* TAR */, register))
                .concat(this.readAPCommand(12 /* DRW */));
        };
        ADI.prototype.writeMem32Command = function (register, value) {
            return this.writeAPCommand(0 /* CSW */, 587202640 /* VALUE */ | 2 /* SIZE_32 */)
                .concat(this.writeAPCommand(4 /* TAR */, register))
                .concat(this.writeAPCommand(12 /* DRW */, value));
        };
        ADI.prototype.transferSequence = function (operations) {
            return __awaiter(this, void 0, void 0, function () {
                var merged, results, sequence, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            merged = [];
                            merged = merged.concat.apply(merged, operations);
                            results = [];
                            _a.label = 1;
                        case 1:
                            if (!merged.length) return [3 /*break*/, 3];
                            sequence = merged.splice(0, this.proxy.operationCount);
                            return [4 /*yield*/, this.proxy.transfer(sequence)];
                        case 2:
                            result = _a.sent();
                            results.push(result);
                            return [3 /*break*/, 1];
                        case 3: return [2 /*return*/, this.concatTypedArray(results)];
                    }
                });
            });
        };
        /**
         * Connect to target device
         * @returns Promise
         */
        ADI.prototype.connect = function () {
            return __awaiter(this, void 0, void 0, function () {
                var mask;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            mask = 536870912 /* CDBGPWRUPACK */ | -2147483648 /* CSYSPWRUPACK */;
                            return [4 /*yield*/, this.proxy.connect()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.readDP(0 /* DPIDR */)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.transferSequence([
                                    this.writeDPCommand(0 /* ABORT */, 4 /* STKERRCLR */),
                                    this.writeDPCommand(8 /* SELECT */, 0 /* CSW */),
                                    this.writeDPCommand(4 /* CTRL_STAT */, 1073741824 /* CSYSPWRUPREQ */ | 268435456 /* CDBGPWRUPREQ */)
                                ])];
                        case 3:
                            _a.sent();
                            // Wait until system and debug have powered up
                            return [4 /*yield*/, this.waitDelay(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var status;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.readDP(4 /* CTRL_STAT */)];
                                            case 1:
                                                status = _a.sent();
                                                return [2 /*return*/, (status & mask) === mask];
                                        }
                                    });
                                }); })];
                        case 4:
                            // Wait until system and debug have powered up
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Disconnect from target device
         * @returns Promise
         */
        ADI.prototype.disconnect = function () {
            return this.proxy.disconnect();
        };
        /**
         * Reconnect to target device
         * @returns Promise
         */
        ADI.prototype.reconnect = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.disconnect()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, DEFAULT_WAIT_DELAY); })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.connect()];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Reset target device
         * @returns Promise
         */
        ADI.prototype.reset = function () {
            return this.proxy.reset();
        };
        /**
         * Read from a debug port register
         * @param register DP register to read
         * @returns Promise of register value
         */
        ADI.prototype.readDP = function (register) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.proxy.transfer(this.readDPCommand(register))];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result[0]];
                    }
                });
            });
        };
        /**
         * Write to a debug port register
         * @param register DP register to write
         * @param value Value to write
         * @returns Promise
         */
        ADI.prototype.writeDP = function (register, value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.proxy.transfer(this.writeDPCommand(register, value))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Read from an access port register
         * @param register AP register to read
         * @returns Promise of register value
         */
        ADI.prototype.readAP = function (register) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.proxy.transfer(this.readAPCommand(register))];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result[0]];
                    }
                });
            });
        };
        /**
         * Write to an access port register
         * @param register AP register to write
         * @param value Value to write
         * @returns Promise
         */
        ADI.prototype.writeAP = function (register, value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.proxy.transfer(this.writeAPCommand(register, value))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Read a 16-bit word from a memory access port register
         * @param register ID of register to read
         * @returns Promise of register data
         */
        ADI.prototype.readMem16 = function (register) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.proxy.transfer(this.readMem16Command(register))];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result[0]];
                    }
                });
            });
        };
        /**
         * Write a 16-bit word to a memory access port register
         * @param register ID of register to write to
         * @param value The value to write
         * @returns Promise
         */
        ADI.prototype.writeMem16 = function (register, value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            value = value << ((register & 0x02) << 3);
                            return [4 /*yield*/, this.proxy.transfer(this.writeMem16Command(register, value))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Read a 32-bit word from a memory access port register
         * @param register ID of register to read
         * @returns Promise of register data
         */
        ADI.prototype.readMem32 = function (register) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.proxy.transfer(this.readMem32Command(register))];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result[0]];
                    }
                });
            });
        };
        /**
         * Write a 32-bit word to a memory access port register
         * @param register ID of register to write to
         * @param value The value to write
         * @returns Promise
         */
        ADI.prototype.writeMem32 = function (register, value) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.proxy.transfer(this.writeMem32Command(register, value))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Read a block of 32-bit words from a memory access port register
         * @param register ID of register to read from
         * @param count The count of values to read
         * @returns Promise of register data
         */
        ADI.prototype.readBlock = function (register, count) {
            return __awaiter(this, void 0, void 0, function () {
                var results, remainder, chunkSize, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.transferSequence([
                                this.writeAPCommand(0 /* CSW */, 587202640 /* VALUE */ | 2 /* SIZE_32 */),
                                this.writeAPCommand(4 /* TAR */, register),
                            ])];
                        case 1:
                            _a.sent();
                            results = [];
                            remainder = count;
                            _a.label = 2;
                        case 2:
                            if (!(remainder > 0)) return [3 /*break*/, 4];
                            chunkSize = Math.min(remainder, Math.floor(this.proxy.blockSize / 4));
                            return [4 /*yield*/, this.proxy.transferBlock(1 /* ACCESS */, 12 /* DRW */, chunkSize)];
                        case 3:
                            result = _a.sent();
                            results.push(result);
                            remainder -= chunkSize;
                            return [3 /*break*/, 2];
                        case 4: return [2 /*return*/, this.concatTypedArray(results)];
                    }
                });
            });
        };
        /**
         * Write a block of 32-bit words to a memory access port register
         * @param register ID of register to write to
         * @param values The values to write
         * @returns Promise
         */
        ADI.prototype.writeBlock = function (register, values) {
            return __awaiter(this, void 0, void 0, function () {
                var index, chunk;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.transferSequence([
                                this.writeAPCommand(0 /* CSW */, 587202640 /* VALUE */ | 2 /* SIZE_32 */),
                                this.writeAPCommand(4 /* TAR */, register),
                            ])];
                        case 1:
                            _a.sent();
                            index = 0;
                            _a.label = 2;
                        case 2:
                            if (!(index < values.length)) return [3 /*break*/, 4];
                            chunk = values.slice(index, index + Math.floor(this.proxy.blockSize / 4));
                            return [4 /*yield*/, this.proxy.transferBlock(1 /* ACCESS */, 12 /* DRW */, chunk)];
                        case 3:
                            _a.sent();
                            index += Math.floor(this.proxy.blockSize / 4);
                            return [3 /*break*/, 2];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return ADI;
    }());

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    /**
     * @hidden
     */
    var EXECUTE_TIMEOUT = 10000;
    /**
     * @hidden
     */
    var BKPT_INSTRUCTION = 0xBE2A;
    /**
     * @hidden
     */
    var GENERAL_REGISTER_COUNT = 12;
    /**
     * Cortex M class
     */
    var CortexM = /** @class */ (function (_super) {
        __extends(CortexM, _super);
        function CortexM() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CortexM.prototype.enableDebug = function () {
            return this.writeMem32(3758157296 /* DHCSR */, -1604386816 /* DBGKEY */ | 1 /* C_DEBUGEN */);
        };
        CortexM.prototype.readCoreRegisterCommand = function (register) {
            return this.writeMem32Command(3758157300 /* DCRSR */, register)
                .concat(this.readMem32Command(3758157296 /* DHCSR */))
                .concat(this.readMem32Command(3758157304 /* DCRDR */));
        };
        CortexM.prototype.writeCoreRegisterCommand = function (register, value) {
            return this.writeMem32Command(3758157304 /* DCRDR */, value)
                .concat(this.writeMem32Command(3758157300 /* DCRSR */, register | 65536 /* REGWnR */));
        };
        /**
         * Get the state of the processor core
         * @returns Promise of CoreState
         */
        CortexM.prototype.getState = function () {
            return __awaiter(this, void 0, void 0, function () {
                var dhcsr, state, newDhcsr;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.readMem32(3758157296 /* DHCSR */)];
                        case 1:
                            dhcsr = _a.sent();
                            if (dhcsr & 524288 /* S_LOCKUP */)
                                state = 1 /* LOCKUP */;
                            else if (dhcsr & 262144 /* S_SLEEP */)
                                state = 2 /* SLEEPING */;
                            else if (dhcsr & 131072 /* S_HALT */)
                                state = 3 /* DEBUG */;
                            else
                                state = 4 /* RUNNING */;
                            if (!(dhcsr & 33554432 /* S_RESET_ST */)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.readMem32(3758157296 /* DHCSR */)];
                        case 2:
                            newDhcsr = _a.sent();
                            if (newDhcsr & 33554432 /* S_RESET_ST */ && !(newDhcsr & 16777216 /* S_RETIRE_ST */)) {
                                return [2 /*return*/, 0 /* RESET */];
                            }
                            else {
                                return [2 /*return*/, state];
                            }
                        case 3: return [2 /*return*/, state];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Whether the target is halted
         * @returns Promise of halted state
         */
        CortexM.prototype.isHalted = function () {
            return __awaiter(this, void 0, void 0, function () {
                var dhcsr;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.readMem32(3758157296 /* DHCSR */)];
                        case 1:
                            dhcsr = _a.sent();
                            return [2 /*return*/, !!(dhcsr & 131072 /* S_HALT */)];
                    }
                });
            });
        };
        /**
         * Halt the target
         * @param wait Wait until halted before returning
         * @param timeout Milliseconds to wait before aborting wait
         * @returns Promise
         */
        CortexM.prototype.halt = function (wait, timeout) {
            if (wait === void 0) { wait = true; }
            if (timeout === void 0) { timeout = 0; }
            return __awaiter(this, void 0, void 0, function () {
                var halted;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isHalted()];
                        case 1:
                            halted = _a.sent();
                            if (halted) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.writeMem32(3758157296 /* DHCSR */, -1604386816 /* DBGKEY */ | 1 /* C_DEBUGEN */ | 2 /* C_HALT */)];
                        case 2:
                            _a.sent();
                            if (!wait) {
                                return [2 /*return*/];
                            }
                            return [2 /*return*/, this.waitDelay(function () { return _this.isHalted(); }, timeout)];
                    }
                });
            });
        };
        /**
         * Resume a target
         * @param wait Wait until resumed before returning
         * @param timeout Milliseconds to wait before aborting wait
         * @returns Promise
         */
        CortexM.prototype.resume = function (wait, timeout) {
            if (wait === void 0) { wait = true; }
            if (timeout === void 0) { timeout = 0; }
            return __awaiter(this, void 0, void 0, function () {
                var halted;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.isHalted()];
                        case 1:
                            halted = _a.sent();
                            if (!halted) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.writeMem32(3758157104 /* DFSR */, 4 /* DWTTRAP */ | 2 /* BKPT */ | 1 /* HALTED */)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.enableDebug()];
                        case 3:
                            _a.sent();
                            if (!wait) {
                                return [2 /*return*/];
                            }
                            return [2 /*return*/, this.waitDelay(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var result;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.isHalted()];
                                            case 1:
                                                result = _a.sent();
                                                return [2 /*return*/, !result];
                                        }
                                    });
                                }); }, timeout)];
                    }
                });
            });
        };
        /**
         * Read from a core register
         * @param register The register to read
         * @returns Promise of value
         */
        CortexM.prototype.readCoreRegister = function (register) {
            return __awaiter(this, void 0, void 0, function () {
                var results, dhcsr;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.transferSequence([
                                this.writeMem32Command(3758157300 /* DCRSR */, register),
                                this.readMem32Command(3758157296 /* DHCSR */)
                            ])];
                        case 1:
                            results = _a.sent();
                            dhcsr = results[0];
                            if (!(dhcsr & 65536 /* S_REGRDY */)) {
                                throw new Error('Register not ready');
                            }
                            return [2 /*return*/, this.readMem32(3758157304 /* DCRDR */)];
                    }
                });
            });
        };
        /**
         * Read an array of core registers
         * @param registers The registers to read
         * @returns Promise of register values in an array
         */
        CortexM.prototype.readCoreRegisters = function (registers) {
            return __awaiter(this, void 0, void 0, function () {
                var results, _i, registers_1, register, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            results = [];
                            _i = 0, registers_1 = registers;
                            _a.label = 1;
                        case 1:
                            if (!(_i < registers_1.length)) return [3 /*break*/, 4];
                            register = registers_1[_i];
                            return [4 /*yield*/, this.readCoreRegister(register)];
                        case 2:
                            result = _a.sent();
                            results.push(result);
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, results];
                    }
                });
            });
        };
        /**
         * Write to a core register
         * @param register The register to write to
         * @param value The value to write
         * @returns Promise
         */
        CortexM.prototype.writeCoreRegister = function (register, value) {
            return __awaiter(this, void 0, void 0, function () {
                var results, dhcsr;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.transferSequence([
                                this.writeMem32Command(3758157304 /* DCRDR */, value),
                                this.writeMem32Command(3758157300 /* DCRSR */, register | 65536 /* REGWnR */),
                                this.readMem32Command(3758157296 /* DHCSR */)
                            ])];
                        case 1:
                            results = _a.sent();
                            dhcsr = results[0];
                            if (!(dhcsr & 65536 /* S_REGRDY */)) {
                                throw new Error('Register not ready');
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Exucute code at a specified memory address
         * @param address The address to put the code
         * @param code The code to use
         * @param stackPointer The stack pointer to use
         * @param programCounter The program counter to use
         * @param linkRegister The link register to use (defaults to address + 1)
         * @param registers Values to add to the general purpose registers, R0, R1, R2, etc.
         */
        CortexM.prototype.execute = function (address, code, stackPointer, programCounter, linkRegister) {
            if (linkRegister === void 0) { linkRegister = address + 1; }
            var registers = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                registers[_i - 5] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var newCode, sequence, i;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Ensure a breakpoint exists at the end of the code
                            if (code[code.length - 1] !== BKPT_INSTRUCTION) {
                                newCode = new Uint32Array(code.length + 1);
                                newCode.set(code);
                                newCode.set([BKPT_INSTRUCTION], code.length - 1);
                                code = newCode;
                            }
                            sequence = [
                                this.writeCoreRegisterCommand(13 /* SP */, stackPointer),
                                this.writeCoreRegisterCommand(15 /* PC */, programCounter),
                                this.writeCoreRegisterCommand(14 /* LR */, linkRegister)
                            ];
                            // Add in register values R0, R1, R2, etc.
                            for (i = 0; i < Math.min(registers.length, GENERAL_REGISTER_COUNT); i++) {
                                sequence.push(this.writeCoreRegisterCommand(i, registers[i]));
                            }
                            // Add xPSR.
                            sequence.push(this.writeCoreRegisterCommand(16 /* PSR */, 0x01000000));
                            return [4 /*yield*/, this.halt()];
                        case 1:
                            _a.sent(); // Halt the target
                            return [4 /*yield*/, this.transferSequence(sequence)];
                        case 2:
                            _a.sent(); // Write the registers
                            return [4 /*yield*/, this.writeBlock(address, code)];
                        case 3:
                            _a.sent(); // Write the code to the address
                            return [4 /*yield*/, this.resume(false)];
                        case 4:
                            _a.sent(); // Resume the target, without waiting
                            return [4 /*yield*/, this.waitDelay(function () { return _this.isHalted(); }, EXECUTE_TIMEOUT)];
                        case 5:
                            _a.sent(); // Wait for the target to halt on the breakpoint
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * soft reset the target
         * @param None
         * @returns Promise
         */
        CortexM.prototype.softReset = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.writeMem32(3758157308 /* DEMCR */, 0)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.writeMem32(3758157068 /* AIRCR */, 100270080 /* VECTKEY */ | 4 /* SYSRESETREQ */)];
                    }
                });
            });
        };
        /**
         * set the target to reset state
         * @param hardwareReset use hardware reset pin or software reset
         * @returns Promise
         */
        CortexM.prototype.setTargetResetState = function (hardwareReset) {
            if (hardwareReset === void 0) { hardwareReset = true; }
            return __awaiter(this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.writeMem32(3758157308 /* DEMCR */, 1 /* CORERESET */)];
                        case 1:
                            _a.sent();
                            if (!(hardwareReset === true)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.reset()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 3: return [4 /*yield*/, this.readMem32(3758157068 /* AIRCR */)];
                        case 4:
                            value = _a.sent();
                            return [4 /*yield*/, this.writeMem32(3758157068 /* AIRCR */, 100270080 /* VECTKEY */ | value | 4 /* SYSRESETREQ */)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [4 /*yield*/, this.writeMem32(3758157308 /* DEMCR */, 0)];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return CortexM;
    }(ADI));

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    (function (FPBCtrlMask) {
        /**
         * Flash patch unit enable
         */
        FPBCtrlMask[FPBCtrlMask["ENABLE"] = 1] = "ENABLE";
        /**
         * Key field which enables writing to the Flash Patch Control Register
         */
        FPBCtrlMask[FPBCtrlMask["KEY"] = 2] = "KEY";
    })(exports.FPBCtrlMask || (exports.FPBCtrlMask = {}));

    /*
    The MIT License (MIT)

    Copyright (c) 2016 CoderPuppy

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

    */

    function platform() {
      return 'browser';
    }

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    /**
     * HID Transport class
     */
    var HID = /** @class */ (function () {
        /**
         * HID constructor
         * @param path Path to HID device to use
         */
        function HID(deviceOrPath) {
            this.os = platform();
            this.packetSize = 64;
            var isDevice = function (source) {
                return source.path !== undefined;
            };
            this.path = isDevice(deviceOrPath) ? deviceOrPath.path : deviceOrPath;
        }
        /**
         * Open device
         * @returns Promise
         */
        HID.prototype.open = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hid;
                return __generator(this, function (_a) {
                    if (!this.path.length) {
                        throw new Error('No path specified');
                    }
                    hid = require('node-hid');
                    this.device = new hid.HID(this.path);
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Close device
         * @returns Promise
         */
        HID.prototype.close = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (this.device) {
                        this.device.close();
                    }
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Read from device
         * @returns Promise of DataView
         */
        HID.prototype.read = function () {
            return __awaiter(this, void 0, void 0, function () {
                var array, buffer;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.device) {
                                throw new Error('No device opened');
                            }
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    _this.device.read(function (error, data) {
                                        if (error) {
                                            return reject(new Error(error));
                                        }
                                        else {
                                            resolve(data);
                                        }
                                    });
                                })];
                        case 1:
                            array = _a.sent();
                            buffer = new Uint8Array(array).buffer;
                            return [2 /*return*/, new DataView(buffer)];
                    }
                });
            });
        };
        /**
         * Write to device
         * @param data Data to write
         * @returns Promise
         */
        HID.prototype.write = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var isView, arrayBuffer, array, bytesWritten;
                return __generator(this, function (_a) {
                    if (!this.device) {
                        throw new Error('No device opened');
                    }
                    isView = function (source) {
                        return source.buffer !== undefined;
                    };
                    arrayBuffer = isView(data) ? data.buffer : data;
                    array = Array.prototype.slice.call(new Uint8Array(arrayBuffer));
                    // Pad to packet size
                    while (array.length < this.packetSize)
                        array.push(0);
                    // Windows requires the prepend of an extra byte
                    // https://github.com/node-hid/node-hid/blob/master/README.md#prepend-byte-to-hid_write
                    if (this.os === 'win32') {
                        array.unshift(0); // prepend throwaway byte
                    }
                    bytesWritten = this.device.write(array);
                    if (bytesWritten !== array.length) {
                        throw new Error('Incorrect bytecount written');
                    }
                    return [2 /*return*/];
                });
            });
        };
        return HID;
    }());

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    /**
     * @hidden
     */
    var LIBUSB_REQUEST_TYPE_CLASS = (0x01 << 5);
    /**
     * @hidden
     */
    var LIBUSB_RECIPIENT_INTERFACE = 0x01;
    /**
     * @hidden
     */
    var LIBUSB_ENDPOINT_OUT = 0x00;
    /**
     * @hidden
     */
    var LIBUSB_ENDPOINT_IN = 0x80;
    /**
     * @hidden
     */
    var DEFAULT_CONFIGURATION = 1;
    /**
     * @hidden
     */
    var DEFAULT_CLASS = 0xFF;
    /**
     * @hidden
     */
    var GET_REPORT = 0x01;
    /**
     * @hidden
     */
    var SET_REPORT = 0x09;
    /**
     * @hidden
     */
    var OUT_REPORT = 0x200;
    /**
     * @hidden
     */
    var IN_REPORT = 0x100;
    /**
     * USB Transport class
     */
    var USB = /** @class */ (function () {
        /**
         * USB constructor
         * @param device USB device to use
         * @param interfaceClass Optional interface class to use (default: 0xFF)
         * @param configuration Optional Configuration to use (default: 1)
         * @param alwaysControlTransfer Whether to always use control transfer instead of endpoints (default: false)
         */
        function USB(device, interfaceClass, configuration, alwaysControlTransfer) {
            if (interfaceClass === void 0) { interfaceClass = DEFAULT_CLASS; }
            if (configuration === void 0) { configuration = DEFAULT_CONFIGURATION; }
            if (alwaysControlTransfer === void 0) { alwaysControlTransfer = false; }
            this.device = device;
            this.interfaceClass = interfaceClass;
            this.configuration = configuration;
            this.alwaysControlTransfer = alwaysControlTransfer;
            this.packetSize = 64;
        }
        USB.prototype.bufferToDataView = function (buffer) {
            var arrayBuffer = new Uint8Array(buffer).buffer;
            return new DataView(arrayBuffer);
        };
        USB.prototype.isView = function (source) {
            return source.buffer !== undefined;
        };
        USB.prototype.bufferSourceToBuffer = function (bufferSource) {
            var arrayBuffer = this.isView(bufferSource) ? bufferSource.buffer : bufferSource;
            return Buffer.from(arrayBuffer);
        };
        USB.prototype.extendBuffer = function (data, packetSize) {
            var arrayBuffer = this.isView(data) ? data.buffer : data;
            var length = Math.min(arrayBuffer.byteLength, packetSize);
            var result = new Uint8Array(length);
            result.set(new Uint8Array(arrayBuffer));
            return result;
        };
        /**
         * Open device
         * @returns Promise
         */
        USB.prototype.open = function () {
            return __awaiter(this, void 0, void 0, function () {
                var interfaces, selectedInterface, endpoints, _i, endpoints_1, endpoint;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.device.open();
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    _this.device.setConfiguration(_this.configuration, function (error) {
                                        if (error) {
                                            reject(new Error(error));
                                        }
                                        else {
                                            resolve();
                                        }
                                    });
                                })];
                        case 1:
                            _a.sent();
                            interfaces = this.device.interfaces.filter(function (iface) {
                                return iface.descriptor.bInterfaceClass === _this.interfaceClass;
                            });
                            if (!interfaces.length) {
                                throw new Error('No valid interfaces found.');
                            }
                            selectedInterface = interfaces.find(function (iface) { return iface.endpoints.length > 0; });
                            // Otherwise use the first
                            if (!selectedInterface) {
                                selectedInterface = interfaces[0];
                            }
                            this.interfaceNumber = selectedInterface.interfaceNumber;
                            // If we always want to use control transfer, don't find/set endpoints and claim interface
                            if (!this.alwaysControlTransfer) {
                                endpoints = selectedInterface.endpoints;
                                this.endpointIn = undefined;
                                this.endpointOut = undefined;
                                for (_i = 0, endpoints_1 = endpoints; _i < endpoints_1.length; _i++) {
                                    endpoint = endpoints_1[_i];
                                    if (endpoint.direction === 'in')
                                        this.endpointIn = endpoint;
                                    else
                                        this.endpointOut = endpoint;
                                }
                                // If endpoints are found, claim the interface
                                if (this.endpointIn || this.endpointOut) {
                                    // If the interface can't be claimed, use control transfer
                                    try {
                                        selectedInterface.claim();
                                    }
                                    catch (_e) {
                                        this.endpointIn = undefined;
                                        this.endpointOut = undefined;
                                    }
                                }
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Close device
         * @returns Promise
         */
        USB.prototype.close = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.device.close();
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Read from device
         * @returns Promise of DataView
         */
        USB.prototype.read = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.interfaceNumber === undefined) {
                                throw new Error('No device opened');
                            }
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    // Use endpoint if it exists
                                    if (_this.endpointIn) {
                                        _this.endpointIn.transfer(_this.packetSize, function (exception, buffer) {
                                            if (exception) {
                                                reject(exception);
                                            }
                                            else {
                                                resolve(buffer);
                                            }
                                        });
                                        return;
                                    }
                                    // Fallback to using control transfer
                                    _this.device.controlTransfer(LIBUSB_ENDPOINT_IN | LIBUSB_REQUEST_TYPE_CLASS | LIBUSB_RECIPIENT_INTERFACE, GET_REPORT, IN_REPORT, _this.interfaceNumber, _this.packetSize, function (exception, buffer) {
                                        if (exception) {
                                            reject(exception);
                                        }
                                        else if (!buffer) {
                                            reject(new Error('No buffer read'));
                                        }
                                        else {
                                            resolve(buffer);
                                        }
                                    });
                                })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, this.bufferToDataView(result)];
                    }
                });
            });
        };
        /**
         * Write to device
         * @param data Data to write
         * @returns Promise
         */
        USB.prototype.write = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var extended, buffer;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.interfaceNumber === undefined) {
                                throw new Error('No device opened');
                            }
                            extended = this.extendBuffer(data, this.packetSize);
                            buffer = this.bufferSourceToBuffer(extended);
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    // Use endpoint if it exists
                                    if (_this.endpointOut) {
                                        _this.endpointOut.transfer(buffer, function (exception) {
                                            if (exception) {
                                                return reject(exception);
                                            }
                                            else {
                                                resolve();
                                            }
                                        });
                                        return;
                                    }
                                    // Fallback to using control transfer
                                    _this.device.controlTransfer(LIBUSB_ENDPOINT_OUT | LIBUSB_REQUEST_TYPE_CLASS | LIBUSB_RECIPIENT_INTERFACE, SET_REPORT, OUT_REPORT, _this.interfaceNumber, buffer, function (exception) {
                                        if (exception) {
                                            return reject(exception);
                                        }
                                        else {
                                            resolve();
                                        }
                                    });
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return USB;
    }());

    /*
    * DAPjs
    * Copyright Arm Limited 2018
    *
    * Permission is hereby granted, free of charge, to any person obtaining a copy
    * of this software and associated documentation files (the "Software"), to deal
    * in the Software without restriction, including without limitation the rights
    * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    * copies of the Software, and to permit persons to whom the Software is
    * furnished to do so, subject to the following conditions:
    *
    * The above copyright notice and this permission notice shall be included in all
    * copies or substantial portions of the Software.
    *
    * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    * SOFTWARE.
    */
    /**
     * @hidden
     */
    var DEFAULT_CONFIGURATION$1 = 1;
    /**
     * @hidden
     */
    var DEFAULT_CLASS$1 = 0xFF;
    /**
     * @hidden
     */
    var GET_REPORT$1 = 0x01;
    /**
     * @hidden
     */
    var SET_REPORT$1 = 0x09;
    /**
     * @hidden
     */
    var OUT_REPORT$1 = 0x200;
    /**
     * @hidden
     */
    var IN_REPORT$1 = 0x100;
    /**
     * WebUSB Transport class
     * https://wicg.github.io/webusb/
     */
    var WebUSB = /** @class */ (function () {
        /**
         * WebUSB constructor
         * @param device WebUSB device to use
         * @param interfaceClass Optional interface class to use (default: 0xFF)
         * @param configuration Optional Configuration to use (default: 1)
         * @param alwaysControlTransfer Whether to always use control transfer instead of endpoints (default: false)
         */
        function WebUSB(device, interfaceClass, configuration, alwaysControlTransfer) {
            if (interfaceClass === void 0) { interfaceClass = DEFAULT_CLASS$1; }
            if (configuration === void 0) { configuration = DEFAULT_CONFIGURATION$1; }
            if (alwaysControlTransfer === void 0) { alwaysControlTransfer = false; }
            this.device = device;
            this.interfaceClass = interfaceClass;
            this.configuration = configuration;
            this.alwaysControlTransfer = alwaysControlTransfer;
            this.packetSize = 64;
        }
        WebUSB.prototype.extendBuffer = function (data, packetSize) {
            function isView(source) {
                return source.buffer !== undefined;
            }
            var arrayBuffer = isView(data) ? data.buffer : data;
            var length = Math.min(arrayBuffer.byteLength, packetSize);
            var result = new Uint8Array(length);
            result.set(new Uint8Array(arrayBuffer));
            return result;
        };
        /**
         * Open device
         * @returns Promise
         */
        WebUSB.prototype.open = function () {
            return __awaiter(this, void 0, void 0, function () {
                var interfaces, selectedInterface, endpoints, _i, endpoints_1, endpoint;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.device.open()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.device.selectConfiguration(this.configuration)];
                        case 2:
                            _a.sent();
                            interfaces = this.device.configuration.interfaces.filter(function (iface) {
                                return iface.alternates[0].interfaceClass === _this.interfaceClass;
                            });
                            if (!interfaces.length) {
                                throw new Error('No valid interfaces found.');
                            }
                            selectedInterface = interfaces.find(function (iface) { return iface.alternates[0].endpoints.length > 0; });
                            // Otherwise use the first
                            if (!selectedInterface) {
                                selectedInterface = interfaces[0];
                            }
                            this.interfaceNumber = selectedInterface.interfaceNumber;
                            // If we always want to use control transfer, don't find/set endpoints and claim interface
                            if (!this.alwaysControlTransfer) {
                                endpoints = selectedInterface.alternates[0].endpoints;
                                this.endpointIn = undefined;
                                this.endpointOut = undefined;
                                for (_i = 0, endpoints_1 = endpoints; _i < endpoints_1.length; _i++) {
                                    endpoint = endpoints_1[_i];
                                    if (endpoint.direction === 'in')
                                        this.endpointIn = endpoint;
                                    else
                                        this.endpointOut = endpoint;
                                }
                            }
                            return [2 /*return*/, this.device.claimInterface(this.interfaceNumber)];
                    }
                });
            });
        };
        /**
         * Close device
         * @returns Promise
         */
        WebUSB.prototype.close = function () {
            return this.device.close();
        };
        /**
         * Read from device
         * @returns Promise of DataView
         */
        WebUSB.prototype.read = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.interfaceNumber === undefined) {
                                throw new Error('No device opened');
                            }
                            if (!this.endpointIn) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.device.transferIn(this.endpointIn.endpointNumber, this.packetSize)];
                        case 1:
                            // Use endpoint if it exists
                            result = _a.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.device.controlTransferIn({
                                requestType: 'class',
                                recipient: 'interface',
                                request: GET_REPORT$1,
                                value: IN_REPORT$1,
                                index: this.interfaceNumber
                            }, this.packetSize)];
                        case 3:
                            // Fallback to using control transfer
                            result = _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, result.data];
                    }
                });
            });
        };
        /**
         * Write to device
         * @param data Data to write
         * @returns Promise
         */
        WebUSB.prototype.write = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.interfaceNumber === undefined) {
                                throw new Error('No device opened');
                            }
                            buffer = this.extendBuffer(data, this.packetSize);
                            if (!this.endpointOut) return [3 /*break*/, 2];
                            // Use endpoint if it exists
                            return [4 /*yield*/, this.device.transferOut(this.endpointOut.endpointNumber, buffer)];
                        case 1:
                            // Use endpoint if it exists
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 2: 
                        // Fallback to using control transfer
                        return [4 /*yield*/, this.device.controlTransferOut({
                                requestType: 'class',
                                recipient: 'interface',
                                request: SET_REPORT$1,
                                value: OUT_REPORT$1,
                                index: this.interfaceNumber
                            }, buffer)];
                        case 3:
                            // Fallback to using control transfer
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return WebUSB;
    }());

    exports.ADI = ADI;
    exports.CmsisDAP = CmsisDAP;
    exports.CortexM = CortexM;
    exports.DAPLink = DAPLink;
    exports.DEFAULT_CLOCK_FREQUENCY = DEFAULT_CLOCK_FREQUENCY;
    exports.HID = HID;
    exports.USB = USB;
    exports.WebUSB = WebUSB;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=dap.umd.js.map
