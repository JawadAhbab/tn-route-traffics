'use strict';

var _assertThisInitialized = require("@babel/runtime/helpers/assertThisInitialized");
var _inherits = require("@babel/runtime/helpers/inherits");
var _createSuper = require("@babel/runtime/helpers/createSuper");
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _objectSpread = require("@babel/runtime/helpers/objectSpread2");
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _createClass = require("@babel/runtime/helpers/createClass");
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var common = require('@nestjs/common');
var ms = require('ms');
var tnCapitalize = require('tn-capitalize');
var tnCase = require('tn-case');
var ung = require('unique-names-generator');
var tnValidate = require('tn-validate');
var UAParser = require('ua-parser-js');
var tnUniqid = require('tn-uniqid');
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
      }, this.rt.unlockTime));
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
      return this.opts.logDumpExtras || function () {};
    }
  }]);
  return TrafficOpts;
}();
var stime = new Date().getTime();
var dic = [];
var dicadd = function dicadd(a) {
  return a.map(function (e) {
    return dic.push.apply(dic, _toConsumableArray(e.split(/[ -]/g).filter(function (i) {
      return i.length > 2;
    })));
  });
};
dicadd([ung.countries, ung.animals, ung.adjectives, ung.colors, ung.languages].flat());
var uniqueName = function uniqueName(podname) {
  var name = ung.uniqueNamesGenerator({
    dictionaries: [dic, dic],
    seed: podname
  });
  return tnCapitalize.capitalize(tnCase.spaceCase(name));
};
var TStatusCommons = /*#__PURE__*/function () {
  function TStatusCommons() {
    _classCallCheck(this, TStatusCommons);
  }
  _createClass(TStatusCommons, [{
    key: "getStatus",
    value: function getStatus() {
      var podname = process.env.HOSTNAME || 'unknown';
      return {
        name: uniqueName(podname),
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
    _defineProperty(this, "data", []);
    this.rt = rt;
    var interval = tnValidate.isNumber(rt.logDumpInterval) ? rt.logDumpInterval : ms(rt.logDumpInterval);
    setInterval(function () {
      return _this3.dump();
    }, interval);
  }
  _createClass(TStatusLogs, [{
    key: "dump",
    value: function dump() {
      if (!this.data.length) return;
      var dump = JSON.stringify(this.data);
      this.data = [];
      this.rt.logDump(dump);
    }
  }, {
    key: "commons",
    value: function commons(req, res) {
      var extras = this.rt.logDumpExtras(req, res);
      var ua = new UAParser(req.headers['user-agent']);
      var route = this.rt.status.routes.getRoute(req);
      return _objectSpread(_objectSpread({
        reqid: uniqueID(),
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
    key: "graphql",
    value: function graphql(req) {
      return req.originalUrl.startsWith('/graphql');
    }
  }, {
    key: "pushReject",
    value: function pushReject(req, res) {
      var commons = this.commons(req, res);
      this.data.push(_objectSpread(_objectSpread({}, commons), {}, {
        status: 'REJECTED',
        delay: 0,
        took: 0
      }));
    }
  }, {
    key: "push",
    value: function push(req, res, queuems, startms, closems) {
      var commons = this.commons(req, res);
      var delay = startms - queuems;
      var took = closems - startms;
      this.data.push(_objectSpread(_objectSpread({}, commons), {}, {
        status: 'ACCEPTED',
        delay: delay,
        took: took
      }));
    }
  }]);
  return TStatusLogs;
}();
var TStatusQueue = /*#__PURE__*/function () {
  function TStatusQueue(rt) {
    _classCallCheck(this, TStatusQueue);
    _defineProperty(this, "rt", void 0);
    this.rt = rt;
  }
  _createClass(TStatusQueue, [{
    key: "getStatus",
    value: function getStatus() {
      var waitings = this.rt.traffics.filter(function (t) {
        return !t.started;
      });
      return {
        running: this.rt.traffics.length - waitings.length,
        waiting: waitings.length,
        waitTime: waitings.length ? new Date().getTime() - waitings[0].queuems : 0
      };
    }
  }]);
  return TStatusQueue;
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
    _defineProperty(this, "queue", void 0);
    _defineProperty(this, "commons", new TStatusCommons());
    _defineProperty(this, "routes", new TStatusRoutes());
    this.queue = new TStatusQueue(rt);
    this.logs = new TStatusLogs(rt);
  }
  _createClass(TrafficStatus, [{
    key: "onReject",
    value: function onReject(req, res) {
      this.traffic.reject();
      this.logs.pushReject(req, res);
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
      this.logs.push(req, res, queuems, startms, closems);
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return _objectSpread(_objectSpread({}, this.commons.getStatus()), {}, {
        queue: this.queue.getStatus(),
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
