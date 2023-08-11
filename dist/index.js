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
var ms = require('ms');
var tnValidate = require('tn-validate');
var tnUniqname = require('tn-uniqname');
var UAParser = require('ua-parser-js');
var tnUniqid = require('tn-uniqid');
var getMs = function getMs(time) {
  return tnValidate.isNumber(time) ? time : ms(time);
};
var Traffic = /*#__PURE__*/function () {
  function Traffic(rt, _ref) {
    var _this = this;
    var req = _ref.req,
      res = _ref.res,
      next = _ref.next;
    _classCallCheck(this, Traffic);
    _defineProperty(this, "rt", void 0);
    _defineProperty(this, "queuems", new Date().getTime());
    _defineProperty(this, "startms", void 0);
    _defineProperty(this, "closems", void 0);
    _defineProperty(this, "req", void 0);
    _defineProperty(this, "res", void 0);
    _defineProperty(this, "next", void 0);
    _defineProperty(this, "started", false);
    _defineProperty(this, "closed", false);
    _defineProperty(this, "unlocked", false);
    _defineProperty(this, "timeouts", []);
    this.rt = rt;
    this.req = req;
    this.res = res;
    this.next = next;
    this.rt.status.onQueue();
    this.res.once('close', function () {
      return _this.close();
    });
  }
  _createClass(Traffic, [{
    key: "start",
    value: function start() {
      var _this2 = this;
      this.startms = new Date().getTime();
      this.started = true;
      this.next();
      this.rt.status.onStart(this.queuems, this.startms);
      this.timeouts.push(setTimeout(function () {
        return _this2.unlock();
      }, getMs(this.rt.unlockTime)));
      this.timeouts.push(setTimeout(function () {
        return _this2.close();
      }, ms('10m')));
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
      this.rt.status.onClose(this.req, this.res, this.queuems, this.startms, this.closems);
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
    key: "unlockTime",
    get: function get() {
      return this.opts.unlockTime || 600000;
    }
  }, {
    key: "excludes",
    get: function get() {
      return this.opts.excludes || [];
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
    value: function push(queuems, startms) {
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
    _defineProperty(this, "pressure", {
      count: 0,
      queueing: 0,
      waitTime: 0
    });
    this.rt = rt;
    setInterval(function () {
      return _this3.logPressure();
    }, ms('1s'));
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
    key: "logPressure",
    value: function logPressure() {
      var _this$rt$status$press = this.rt.status.pressure.getStatus(),
        queueing = _this$rt$status$press.queueing,
        waitTime = _this$rt$status$press.waitTime;
      this.pressure.count += 1;
      this.pressure.queueing += queueing;
      this.pressure.waitTime += waitTime;
    }
  }, {
    key: "pushPressure",
    value: function pushPressure() {
      if (!this.pressure.count) return;
      this.pressures.push(_objectSpread(_objectSpread({
        id: uniqueID(),
        timestamp: new Date().getTime()
      }, this.rt.logDumpExtras.pressure()), {}, {
        queuePerSec: this.pressure.queueing / this.pressure.count,
        aveWaitTime: this.pressure.waitTime / this.pressure.count
      }));
      this.pressure.count = 0;
      this.pressure.queueing = 0;
      this.pressure.waitTime = 0;
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
      var route = this.rt.status.routes.getRoute(req);
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
        delay: 0,
        took: 0
      }));
    }
  }, {
    key: "pushVisit",
    value: function pushVisit(req, res, queuems, startms, closems) {
      var commons = this.visitCommons(req, res);
      var delay = startms - queuems;
      var took = closems - startms;
      this.visits.push(_objectSpread(_objectSpread({}, commons), {}, {
        status: 'ACCEPTED',
        delay: delay,
        took: took
      }));
    }
  }]);
  return TStatusLogs;
}();
var TStatusPressure = /*#__PURE__*/function () {
  function TStatusPressure(rt) {
    _classCallCheck(this, TStatusPressure);
    _defineProperty(this, "rt", void 0);
    this.rt = rt;
  }
  _createClass(TStatusPressure, [{
    key: "getStatus",
    value: function getStatus() {
      var oldest = this.rt.traffics.find(function (t) {
        return !t.started;
      });
      return {
        queueing: this.rt.traffics.length,
        waitTime: oldest ? new Date().getTime() - oldest.queuems : 0
      };
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
var TStatusRoutes = /*#__PURE__*/function () {
  function TStatusRoutes() {
    _classCallCheck(this, TStatusRoutes);
    _defineProperty(this, "routes", {});
    _defineProperty(this, "unknowns", new Unknowns());
  }
  _createClass(TStatusRoutes, [{
    key: "push",
    value: function push(req, res, startms, closems) {
      var routename = this.getRoute(req);
      if (!routename) return this.unknowns.push(req.originalUrl);
      var route = this.routes[routename];
      if (!route) this.routes[routename] = new Route(routename);
      this.routes[routename].push(closems - startms, res.statusCode);
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
      var rs = Object.entries(this.routes).map(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
          _ = _ref3[0],
          route = _ref3[1];
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
        counts: counts,
        average: average,
        cputime: cputime,
        routes: routes,
        unknowns: unknowns
      };
    }
  }]);
  return TStatusRoutes;
}();
var TStausTraffics = /*#__PURE__*/function () {
  function TStausTraffics() {
    _classCallCheck(this, TStausTraffics);
    _defineProperty(this, "acceptCount", 0);
    _defineProperty(this, "rejectCount", 0);
  }
  _createClass(TStausTraffics, [{
    key: "accept",
    value: function accept() {
      this.acceptCount += 1;
    }
  }, {
    key: "reject",
    value: function reject() {
      this.rejectCount += 1;
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return {
        served: this.acceptCount,
        lost: this.rejectCount,
        percentage: this.rejectCount / (this.acceptCount + this.rejectCount) * 100
      };
    }
  }]);
  return TStausTraffics;
}();
var TrafficStatus = /*#__PURE__*/function () {
  function TrafficStatus(rt) {
    _classCallCheck(this, TrafficStatus);
    _defineProperty(this, "logs", void 0);
    _defineProperty(this, "delay", new TStatusDelay());
    _defineProperty(this, "traffic", new TStausTraffics());
    _defineProperty(this, "commons", new TStatusCommons());
    _defineProperty(this, "pressure", void 0);
    _defineProperty(this, "routes", new TStatusRoutes());
    this.pressure = new TStatusPressure(rt);
    this.logs = new TStatusLogs(rt);
  }
  _createClass(TrafficStatus, [{
    key: "onReject",
    value: function onReject(req, res) {
      this.traffic.reject();
      this.logs.pushRejectVisit(req, res);
    }
  }, {
    key: "onQueue",
    value: function onQueue() {
      this.traffic.accept();
    }
  }, {
    key: "onStart",
    value: function onStart(queuems, startms) {
      this.delay.push(queuems, startms);
    }
  }, {
    key: "onClose",
    value: function onClose(req, res, queuems, startms, closems) {
      this.routes.push(req, res, startms, closems);
      this.logs.pushVisit(req, res, queuems, startms, closems);
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return _objectSpread(_objectSpread({}, this.commons.getStatus()), {}, {
        pressure: this.pressure.getStatus(),
        traffics: this.traffic.getStatus(),
        delay: this.delay.getStatus(),
        routes: this.routes.getStatus()
      });
    }
  }]);
  return TrafficStatus;
}();
var RouteTraffics = /*#__PURE__*/function (_TrafficOpts) {
  _inherits(RouteTraffics, _TrafficOpts);
  var _super = _createSuper(RouteTraffics);
  function RouteTraffics() {
    var _this4;
    _classCallCheck(this, RouteTraffics);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this4 = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this4), "traffics", []);
    _defineProperty(_assertThisInitialized(_this4), "status", void 0);
    return _this4;
  }
  _createClass(RouteTraffics, [{
    key: "begin",
    value: function begin(opts) {
      this.opts = opts;
      this.status = new TrafficStatus(this);
    }
  }, {
    key: "checkAccept",
    value: function checkAccept(props) {
      if (this.traffics.length < this.maxQueue) return;
      this.status.onReject(props.req, props.res);
      throw new common.NotAcceptableException();
    }
  }, {
    key: "pushTraffic",
    value: function pushTraffic(props) {
      if (this.excludes.includes(props.req.path)) return props.next();
      this.checkAccept(props);
      this.traffics.push(new Traffic(this, props));
      this.check();
    }
  }, {
    key: "check",
    value: function check() {
      this.traffics = this.traffics.filter(function (t) {
        return !t.closed;
      });
      var busycount = this.traffics.filter(function (t) {
        return t.started && !t.unlocked;
      }).length;
      var allowed = Math.max(this.concurrency - busycount, 0);
      if (!allowed) return;
      this.traffics.filter(function (t) {
        return !t.started;
      }).splice(0, allowed).forEach(function (t) {
        return t.start();
      });
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
exports.$routeTraffics = $routeTraffics;
exports.routeTrafficsMiddleware = routeTrafficsMiddleware;
