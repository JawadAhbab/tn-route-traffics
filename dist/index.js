'use strict';

var _assertThisInitialized = require("@babel/runtime/helpers/assertThisInitialized");
var _inherits = require("@babel/runtime/helpers/inherits");
var _createSuper = require("@babel/runtime/helpers/createSuper");
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _objectSpread = require("@babel/runtime/helpers/objectSpread2");
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _createClass = require("@babel/runtime/helpers/createClass");
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var common = require('@nestjs/common');
var sha = require('crypto-js/sha256');
var ms = require('ms');
var tnValidate = require('tn-validate');
var tnUniqname = require('tn-uniqname');
var UAParser = require('ua-parser-js');
var tnUniqid = require('tn-uniqid');
var getMs = function getMs(time) {
  return tnValidate.isNumber(time) ? time : ms(time);
};
var Traffic = /*#__PURE__*/function () {
  function Traffic(rt, tprops, opts) {
    var _this = this;
    _classCallCheck(this, Traffic);
    _defineProperty(this, "rt", void 0);
    _defineProperty(this, "queuems", new Date().getTime());
    _defineProperty(this, "startms", void 0);
    _defineProperty(this, "closems", void 0);
    _defineProperty(this, "req", void 0);
    _defineProperty(this, "res", void 0);
    _defineProperty(this, "bypass", void 0);
    _defineProperty(this, "next", void 0);
    _defineProperty(this, "started", false);
    _defineProperty(this, "closed", false);
    _defineProperty(this, "unlocked", false);
    _defineProperty(this, "timeouts", []);
    this.rt = rt;
    this.bypass = opts.bypass;
    this.req = tprops.req;
    this.res = tprops.res;
    this.next = tprops.next;
    this.rt.status.onQueue();
    this.res.once('close', function () {
      return _this.close();
    });
  }
  _createClass(Traffic, [{
    key: "start",
    value: function start() {
      var _this2 = this;
      if (this.started) return;
      this.startms = new Date().getTime();
      this.started = true;
      this.next();
      this.rt.status.onStart(this);
      var unlockTimeout = this.bypass ? this.rt.bypassUnlockTimeout : this.rt.unlockTimeout;
      this.timeouts.push(setTimeout(function () {
        return _this2.unlock();
      }, getMs(unlockTimeout)));
      this.timeouts.push(setTimeout(function () {
        return _this2.close();
      }, getMs(this.rt.forceCloseTimeout)));
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.unlocked = true;
      this.rt.check();
    }
  }, {
    key: "close",
    value: function close() {
      if (this.closed) return;
      this.closems = new Date().getTime();
      this.closed = true;
      this.rt.status.onClose(this);
      this.rt.check();
      this.timeouts.forEach(function (timeout) {
        return clearTimeout(timeout);
      });
    }
  }]);
  return Traffic;
}();
var TrafficOpts = /*#__PURE__*/function () {
  function TrafficOpts() {
    _classCallCheck(this, TrafficOpts);
    _defineProperty(this, "opts", {});
  }
  _createClass(TrafficOpts, [{
    key: "concurrency",
    get: function get() {
      return this.opts.concurrency || 6;
    }
  }, {
    key: "maxQueue",
    get: function get() {
      return this.opts.maxQueue || 10000;
    }
  }, {
    key: "unlockTimeout",
    get: function get() {
      return this.opts.unlockTimeout || '1m';
    }
  }, {
    key: "bypassUnlockTimeout",
    get: function get() {
      return this.opts.bypassUnlockTimeout || '5s';
    }
  }, {
    key: "forceCloseTimeout",
    get: function get() {
      return this.opts.forceCloseTimeout || '10m';
    }
  }, {
    key: "excludes",
    get: function get() {
      return this.opts.excludes || [];
    }
  }, {
    key: "bypass",
    get: function get() {
      return this.opts.bypass || [];
    }
  }, {
    key: "bypassSecret",
    get: function get() {
      return this.opts.bypassSecret || '';
    }
  }, {
    key: "logDump",
    get: function get() {
      return this.opts.logDump || function () {
        return null;
      };
    }
  }, {
    key: "logDumpInterval",
    get: function get() {
      return this.opts.logDumpInterval || '1m';
    }
  }, {
    key: "logDumpExtras",
    get: function get() {
      var _this$opts$logDumpExt, _this$opts$logDumpExt2, _this$opts$logDumpExt3;
      return {
        base: ((_this$opts$logDumpExt = this.opts.logDumpExtras) === null || _this$opts$logDumpExt === void 0 ? void 0 : _this$opts$logDumpExt.base) || function () {
          return null;
        },
        pressure: ((_this$opts$logDumpExt2 = this.opts.logDumpExtras) === null || _this$opts$logDumpExt2 === void 0 ? void 0 : _this$opts$logDumpExt2.pressure) || function () {
          return null;
        },
        visit: ((_this$opts$logDumpExt3 = this.opts.logDumpExtras) === null || _this$opts$logDumpExt3 === void 0 ? void 0 : _this$opts$logDumpExt3.visit) || function () {
          return null;
        }
      };
    }
  }]);
  return TrafficOpts;
}();
var stime = new Date().getTime();
var TStatusCommons = /*#__PURE__*/function () {
  function TStatusCommons() {
    _classCallCheck(this, TStatusCommons);
  }
  _createClass(TStatusCommons, [{
    key: "getStatus",
    value: function getStatus() {
      var podname = process.env.HOSTNAME || 'unknown';
      return {
        name: tnUniqname.uniqname(2, podname),
        podname: podname,
        age: new Date().getTime() - stime
      };
    }
  }]);
  return TStatusCommons;
}();
var TStatusDelay = /*#__PURE__*/function () {
  function TStatusDelay() {
    _classCallCheck(this, TStatusDelay);
    _defineProperty(this, "startCount", 0);
    _defineProperty(this, "delayCount", 0);
    _defineProperty(this, "delayMax", 0);
    _defineProperty(this, "delayTotal", 0);
  }
  _createClass(TStatusDelay, [{
    key: "push",
    value: function push(_ref) {
      var queuems = _ref.queuems,
        startms = _ref.startms;
      this.startCount += 1;
      var delay = startms - queuems;
      if (delay > 100) {
        this.delayCount += 1;
        this.delayTotal += delay;
        this.delayMax = Math.max(this.delayMax, delay);
      }
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return {
        count: this.delayCount,
        percentage: this.delayCount / this.startCount * 100,
        max: this.delayMax,
        ave: this.delayTotal / this.delayCount,
        total: this.delayTotal
      };
    }
  }]);
  return TStatusDelay;
}();
var uniqueID = tnUniqid.uniqueGetter({
  chars: ['A-Z', '0-9'],
  length: 15
});
var TStatusLogs = /*#__PURE__*/function () {
  function TStatusLogs(rt) {
    var _this3 = this;
    _classCallCheck(this, TStatusLogs);
    _defineProperty(this, "rt", void 0);
    _defineProperty(this, "visits", []);
    _defineProperty(this, "pressures", []);
    this.rt = rt;
    setInterval(function () {
      return _this3.pushPressure();
    }, ms('1m'));
    setInterval(function () {
      return _this3.dump();
    }, getMs(rt.logDumpInterval));
  }
  _createClass(TStatusLogs, [{
    key: "dump",
    value: function dump() {
      if (!this.visits.length && !this.pressures.length) return;
      var extras = this.rt.logDumpExtras.base();
      var dump = JSON.stringify(_objectSpread(_objectSpread({}, extras), {}, {
        pressures: this.pressures,
        visits: this.visits
      }));
      this.visits = [];
      this.pressures = [];
      this.rt.logDump(dump);
    }
  }, {
    key: "pushPressure",
    value: function pushPressure() {
      var records = this.rt.status.pressure.getStatus().slice(0, 60);
      if (records.every(function (record) {
        return !record.queueing.total;
      })) return;
      this.pressures.push(_objectSpread(_objectSpread({
        id: uniqueID(),
        timestamp: new Date().getTime()
      }, this.rt.logDumpExtras.pressure()), {}, {
        queuePerSec: records.reduce(function (a, b) {
          return a + b.queueing.total;
        }, 0) / records.length,
        aveWaitTime: records.reduce(function (a, b) {
          return a + b.waitTime;
        }, 0) / records.length
      }));
    }
  }, {
    key: "graphql",
    value: function graphql(req) {
      return req.originalUrl.startsWith('/graphql');
    }
  }, {
    key: "visitCommons",
    value: function visitCommons(req, res) {
      var extras = this.rt.logDumpExtras.visit(req, res);
      var ua = new UAParser(req.headers['user-agent']);
      var route = this.rt.status.traffics.getRoute(req);
      return _objectSpread(_objectSpread({
        id: uniqueID(),
        timestamp: new Date().getTime(),
        graphql: this.graphql(req),
        url: req.originalUrl,
        route: route,
        userip: req.ip,
        statuscode: res.statusCode
      }, extras), {}, {
        agent: {
          browser: ua.getBrowser(),
          engine: ua.getEngine(),
          os: ua.getOS(),
          device: ua.getDevice(),
          cpu: ua.getCPU()
        }
      });
    }
  }, {
    key: "pushRejectVisit",
    value: function pushRejectVisit(req, res) {
      var commons = this.visitCommons(req, res);
      this.visits.push(_objectSpread(_objectSpread({}, commons), {}, {
        status: 'REJECTED',
        bypass: null,
        delay: 0,
        took: 0
      }));
    }
  }, {
    key: "pushVisit",
    value: function pushVisit(_ref2) {
      var req = _ref2.req,
        res = _ref2.res,
        queuems = _ref2.queuems,
        startms = _ref2.startms,
        closems = _ref2.closems,
        bypass = _ref2.bypass;
      var commons = this.visitCommons(req, res);
      var delay = startms - queuems;
      var took = closems - startms;
      this.visits.push(_objectSpread(_objectSpread({}, commons), {}, {
        status: 'ACCEPTED',
        bypass: bypass,
        delay: delay,
        took: took
      }));
    }
  }]);
  return TStatusLogs;
}();
var TStatusPressure = /*#__PURE__*/function () {
  function TStatusPressure(rt) {
    var _this4 = this;
    _classCallCheck(this, TStatusPressure);
    _defineProperty(this, "rt", void 0);
    _defineProperty(this, "records", []);
    this.rt = rt;
    setInterval(function () {
      return _this4.record();
    }, ms('1s'));
  }
  _createClass(TStatusPressure, [{
    key: "record",
    value: function record() {
      var oldest = this.rt.traffics.find(function (t) {
        return !t.started;
      });
      var timestamp = new Date().getTime();
      var waitTime = oldest ? timestamp - oldest.queuems : 0;
      var regular = this.rt.traffics.length;
      var bypass = this.rt.bypassTraffics.length;
      var total = regular + bypass;
      this.records.unshift({
        timestamp: timestamp,
        waitTime: waitTime,
        queueing: {
          regular: regular,
          bypass: bypass,
          total: total
        }
      });
      this.records.splice(300);
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return this.records;
    }
  }]);
  return TStatusPressure;
}();
var Route = /*#__PURE__*/function () {
  function Route(route) {
    _classCallCheck(this, Route);
    _defineProperty(this, "route", void 0);
    _defineProperty(this, "count", 0);
    _defineProperty(this, "cputime", 0);
    _defineProperty(this, "maxtime", 0);
    _defineProperty(this, "statuscodes", {});
    this.route = route;
  }
  _createClass(Route, [{
    key: "push",
    value: function push(took, statuscode) {
      this.count += 1;
      this.cputime += took;
      this.maxtime = Math.max(this.maxtime, took);
      if (!this.statuscodes[statuscode]) this.statuscodes[statuscode] = 0;
      this.statuscodes[statuscode] += 1;
    }
  }, {
    key: "average",
    get: function get() {
      return Math.round(this.cputime / this.count);
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return {
        count: this.count,
        average: this.average,
        maxtime: this.maxtime,
        cputime: this.cputime,
        statuscodes: this.statuscodes
      };
    }
  }]);
  return Route;
}();
var Unknowns = /*#__PURE__*/function () {
  function Unknowns() {
    _classCallCheck(this, Unknowns);
    _defineProperty(this, "maxurls", 100);
    _defineProperty(this, "urls", {});
    _defineProperty(this, "unlisted", 0);
  }
  _createClass(Unknowns, [{
    key: "push",
    value: function push(url) {
      if (Object.keys(this.urls).length > this.maxurls) return ++this.unlisted;
      if (!this.urls[url]) this.urls[url] = 0;
      ++this.urls[url];
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      var status = _objectSpread({}, this.urls);
      if (this.unlisted) status.unlisted = this.unlisted;
      return status;
    }
  }]);
  return Unknowns;
}();
var TStatusTraffics = /*#__PURE__*/function () {
  function TStatusTraffics() {
    _classCallCheck(this, TStatusTraffics);
    _defineProperty(this, "served", 0);
    _defineProperty(this, "lost", 0);
    _defineProperty(this, "bypassed", 0);
    _defineProperty(this, "routes", {});
    _defineProperty(this, "unknowns", new Unknowns());
  }
  _createClass(TStatusTraffics, [{
    key: "pushServed",
    value: function pushServed(_ref3) {
      var req = _ref3.req,
        res = _ref3.res,
        startms = _ref3.startms,
        closems = _ref3.closems;
      ++this.served;
      var routename = this.getRoute(req);
      if (!routename) return this.unknowns.push(req.originalUrl);
      var route = this.routes[routename];
      if (!route) this.routes[routename] = new Route(routename);
      this.routes[routename].push(closems - startms, res.statusCode);
    }
  }, {
    key: "pushLoss",
    value: function pushLoss() {
      ++this.lost;
    }
  }, {
    key: "pushBypass",
    value: function pushBypass() {
      ++this.bypassed;
    }
  }, {
    key: "getRoute",
    value: function getRoute(req) {
      var _req$body, _req$route;
      var graphql = req.baseUrl.startsWith('/graphql');
      return (graphql ? (_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.operationName : (_req$route = req.route) === null || _req$route === void 0 ? void 0 : _req$route.path) || null;
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      var served = this.served,
        lost = this.lost,
        bypassed = this.bypassed;
      var rs = Object.entries(this.routes).map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
          _ = _ref5[0],
          route = _ref5[1];
        return route;
      });
      var counts = rs.reduce(function (a, b) {
        return a + b.count;
      }, 0);
      var cputime = rs.reduce(function (a, b) {
        return a + b.cputime;
      }, 0);
      var average = cputime / counts;
      var unknowns = this.unknowns.getStatus();
      var routes = {};
      rs.forEach(function (route) {
        return routes[route.route] = route.getStatus();
      });
      return {
        served: served,
        lost: lost,
        bypassed: bypassed,
        average: average,
        cputime: cputime,
        routes: routes,
        unknowns: unknowns
      };
    }
  }]);
  return TStatusTraffics;
}();
var TrafficStatus = /*#__PURE__*/function () {
  function TrafficStatus(rt) {
    _classCallCheck(this, TrafficStatus);
    _defineProperty(this, "logs", void 0);
    _defineProperty(this, "delay", new TStatusDelay());
    _defineProperty(this, "commons", new TStatusCommons());
    _defineProperty(this, "pressure", void 0);
    _defineProperty(this, "traffics", new TStatusTraffics());
    this.pressure = new TStatusPressure(rt);
    this.logs = new TStatusLogs(rt);
  }
  _createClass(TrafficStatus, [{
    key: "onReject",
    value: function onReject(req, res) {
      this.traffics.pushLoss();
      this.logs.pushRejectVisit(req, res);
    }
  }, {
    key: "onBypass",
    value: function onBypass() {
      this.traffics.pushBypass();
    }
  }, {
    key: "onQueue",
    value: function onQueue() {}
  }, {
    key: "onStart",
    value: function onStart(traffic) {
      this.delay.push(traffic);
    }
  }, {
    key: "onClose",
    value: function onClose(traffic) {
      this.traffics.pushServed(traffic);
      this.logs.pushVisit(traffic);
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return _objectSpread(_objectSpread({}, this.commons.getStatus()), {}, {
        delay: this.delay.getStatus(),
        traffics: this.traffics.getStatus(),
        pressure: this.pressure.getStatus()
      });
    }
  }]);
  return TrafficStatus;
}();
var RouteTraffics = /*#__PURE__*/function (_TrafficOpts) {
  _inherits(RouteTraffics, _TrafficOpts);
  var _super = _createSuper(RouteTraffics);
  function RouteTraffics() {
    var _this5;
    _classCallCheck(this, RouteTraffics);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this5 = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this5), "traffics", []);
    _defineProperty(_assertThisInitialized(_this5), "bypassTraffics", []);
    _defineProperty(_assertThisInitialized(_this5), "status", void 0);
    return _this5;
  }
  _createClass(RouteTraffics, [{
    key: "begin",
    value: function begin(opts) {
      this.opts = opts;
      this.status = new TrafficStatus(this);
    }
  }, {
    key: "checkExcludes",
    value: function checkExcludes(props) {
      return this.excludes.includes(props.req.path);
    }
  }, {
    key: "checkAccept",
    value: function checkAccept(props) {
      var totaltraffics = this.traffics.length + this.bypassTraffics.length;
      if (totaltraffics < this.maxQueue) return;
      this.status.onReject(props.req, props.res);
      throw new common.NotAcceptableException();
    }
  }, {
    key: "checkBypass",
    value: function checkBypass(props) {
      if (this.bypass.includes(props.req.path)) return true;
      var bypasstraffic = props.req.headers['bypasstraffic'];
      if (!bypasstraffic) return false;
      var _bypasstraffic$toStri = bypasstraffic.toString().split('.'),
        _bypasstraffic$toStri2 = _slicedToArray(_bypasstraffic$toStri, 2),
        expstr = _bypasstraffic$toStri2[0],
        hash = _bypasstraffic$toStri2[1];
      if (+expstr < new Date().getTime()) return false;
      var bypass = hash === sha(expstr + this.bypassSecret).toString();
      if (bypass) this.status.onBypass();
      return bypass;
    }
  }, {
    key: "pushTraffic",
    value: function pushTraffic(props) {
      if (this.checkExcludes(props)) return props.next();
      this.checkAccept(props);
      var bypass = this.checkBypass(props);
      var traffic = new Traffic(this, props, {
        bypass: bypass
      });
      if (bypass) this.bypassTraffics.push(traffic);else this.traffics.push(traffic);
      this.check();
    }
  }, {
    key: "check",
    value: function check() {
      var _this6 = this;
      this.traffics = this.traffics.filter(function (t) {
        return !t.closed;
      });
      this.bypassTraffics = this.bypassTraffics.filter(function (t) {
        return !t.closed;
      });
      var exec = function exec(traffics) {
        var busycount = traffics.filter(function (t) {
          return t.started && !t.unlocked;
        }).length;
        var allowed = Math.max(_this6.concurrency - busycount, 0);
        if (!allowed) return;
        traffics.filter(function (t) {
          return !t.started;
        }).splice(0, allowed).forEach(function (t) {
          return t.start();
        });
      };
      exec(this.traffics);
      exec(this.bypassTraffics);
    }
  }]);
  return RouteTraffics;
}(TrafficOpts);
var $routeTraffics = new RouteTraffics();
var routeTrafficsMiddleware = function routeTrafficsMiddleware() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  $routeTraffics.begin(opts);
  return function (req, res, next) {
    $routeTraffics.pushTraffic({
      req: req,
      res: res,
      next: next
    });
  };
};
var routeTrafficsBypassHeaders = function routeTrafficsBypassHeaders(secret) {
  var exp = new Date().getTime() + ms('10m');
  var hash = sha(exp + secret).toString();
  return {
    bypasstraffic: "".concat(exp, ".").concat(hash)
  };
};
exports.$routeTraffics = $routeTraffics;
exports.routeTrafficsBypassHeaders = routeTrafficsBypassHeaders;
exports.routeTrafficsMiddleware = routeTrafficsMiddleware;
