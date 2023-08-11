'use strict';

var _typeof = require("@babel/runtime/helpers/typeof");
var _objectSpread = require("@babel/runtime/helpers/objectSpread2");
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _createClass = require("@babel/runtime/helpers/createClass");
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var ms = require('pretty-ms');
var onHeaders = require('on-headers');
var tnValidate = require('tn-validate');
var common = require('@nestjs/common');
var core = require('@nestjs/core');
var platformExpress = require('@nestjs/platform-express');
var sha = require('crypto-js/sha256');
var ms$1 = require('ms');

// TODO remove all ms() when visual status page is ready
var Status = /*#__PURE__*/function () {
  function Status(route) {
    _classCallCheck(this, Status);
    _defineProperty(this, "route", void 0);
    _defineProperty(this, "count", 0);
    _defineProperty(this, "cputime", 0);
    _defineProperty(this, "maxtime", 0);
    _defineProperty(this, "mintime", Infinity);
    _defineProperty(this, "statusCodes", {});
    this.route = route;
  }
  _createClass(Status, [{
    key: "saveStatus",
    value: function saveStatus(time, statusCode) {
      this.count += 1;
      this.cputime += time;
      this.mintime = Math.min(this.mintime, time);
      this.maxtime = Math.max(this.maxtime, time);
      if (!this.statusCodes[statusCode]) this.statusCodes[statusCode] = 0;
      this.statusCodes[statusCode] += 1;
    }
  }, {
    key: "average",
    get: function get() {
      return Math.round(this.cputime / this.count);
    }
  }, {
    key: "summery",
    get: function get() {
      return {
        count: this.count,
        mintime: this.mintime + 'ms',
        average: this.average + 'ms',
        maxtime: this.maxtime + 'ms',
        cputime: ms(this.cputime, {
          verbose: true,
          secondsDecimalDigits: 0
        }),
        statusCodes: this.statusCodes
      };
    }
  }]);
  return Status;
}();
var RouteStatus = /*#__PURE__*/function () {
  function RouteStatus() {
    _classCallCheck(this, RouteStatus);
    _defineProperty(this, "routes", {});
  }
  _createClass(RouteStatus, [{
    key: "saveStatus",
    value: function saveStatus(routename, time, statusCode) {
      var route = this.routes[routename];
      if (!route) this.routes[routename] = new Status(routename);
      this.routes[routename].saveStatus(time, statusCode);
    }
  }, {
    key: "createSummery",
    value: function createSummery() {
      var rs = Object.entries(this.routes).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          _ = _ref2[0],
          route = _ref2[1];
        return route;
      });
      rs.sort(function (a, b) {
        return b.count - a.count;
      });
      var counts = rs.reduce(function (a, b) {
        return a + b.count;
      }, 0);
      var cputimes = rs.reduce(function (a, b) {
        return a + b.cputime;
      }, 0);
      var cputime = ms(cputimes, {
        verbose: true,
        secondsDecimalDigits: 0
      });
      var average = Math.round(cputimes / counts) + 'ms';
      var routes = {};
      rs.forEach(function (route) {
        return routes[route.route] = route.summery;
      });
      return {
        counts: counts,
        average: average,
        cputime: cputime,
        routes: routes
      };
    }
  }]);
  return RouteStatus;
}();
var routeStatus = new RouteStatus();
var routeStatusMiddleware = function routeStatusMiddleware() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _opts$excludes = opts.excludes,
    excludes = _opts$excludes === void 0 ? [] : _opts$excludes;
  return function (req, res, next) {
    var stime = new Date().getTime();
    onHeaders(res, function () {
      var etime = new Date().getTime();
      var time = etime - stime;
      var routename = getRouteName(req);
      var statusCode = res.statusCode;
      if (!excludes.includes(routename)) routeStatus.saveStatus(routename, time, statusCode);
    });
    next();
  };
};
var getRouteName = function getRouteName(req) {
  var _req$body, _req$route;
  var graphql = req.baseUrl.startsWith('/graphql');
  var routename = graphql ? (_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.operationName : (_req$route = req.route) === null || _req$route === void 0 ? void 0 : _req$route.path;
  return routename || 'unknown';
};
var Route = function Route(routebase, cdnopts) {
  return function (target) {
    var routecdnopts = {
      bunnycdn: (cdnopts === null || cdnopts === void 0 ? void 0 : cdnopts.bunnycdn) || (cdnopts === null || cdnopts === void 0 ? void 0 : cdnopts.bunnyperma) || !!(cdnopts !== null && cdnopts !== void 0 && cdnopts.bunnysecure) || false,
      bunnyperma: (cdnopts === null || cdnopts === void 0 ? void 0 : cdnopts.bunnyperma) || false,
      bunnysecure: (cdnopts === null || cdnopts === void 0 ? void 0 : cdnopts.bunnysecure) || false
    };
    target.prototype.$routebase = routebase;
    target.prototype.$routecdnopts = routecdnopts;
  };
};
var getAllProperties = function getAllProperties(cls) {
  var properties = [];
  if (cls.prototype) properties.push.apply(properties, _toConsumableArray(Object.getOwnPropertyNames(cls.prototype)));
  var extend = Object.getPrototypeOf(cls);
  if (extend) properties.push.apply(properties, _toConsumableArray(getAllProperties(extend)));
  return properties;
};
var btypes = ['string', 'number', 'boolean', 'object', 'string[]', 'number[]', 'boolean[]', 'object[]', 'any[]']; // prettier-ignore
var RouteBody = function RouteBody(opts, v) {
  return function (target, name) {
    var optional = (opts === null || opts === void 0 ? void 0 : opts.optional) || false;
    var typename = '';
    var object = [];
    var explicit = opts === null || opts === void 0 ? void 0 : opts.type;
    if (!explicit) typename = Reflect.getMetadata('design:type', target, name).name;else {
      var arr = tnValidate.isArray(explicit);
      var expname = (arr ? explicit[0].name : explicit.name).toLowerCase();
      if (expname === 'array') typename = 'any[]';else if (btypes.includes(expname)) typename = arr ? "".concat(expname, "[]") : expname;else {
        var expcls = arr ? explicit[0] : explicit;
        typename = arr ? 'object[]' : 'object';
        getAllProperties(expcls).forEach(function (p) {
          var value = expcls.prototype[p];
          if (value.$body) object.push(value);
        });
      }
    }
    var type = typename.toLowerCase();
    if (!btypes.includes(type)) throw new Error("@RouteBody(".concat(name, ") must be typeof ").concat(btypes, "\n"));
    var validator = v || function () {
      return true;
    };
    var getter = (opts === null || opts === void 0 ? void 0 : opts.getter) || function (v) {
      return v;
    };
    var get = function get() {
      return {
        $body: true,
        name: name,
        type: type,
        optional: optional,
        object: object,
        selects: (opts === null || opts === void 0 ? void 0 : opts.selects) || null,
        routesecure: (opts === null || opts === void 0 ? void 0 : opts.routesecure) || false,
        getter: getter,
        validator: validator
      };
    };
    Object.defineProperty(target, name, {
      get: get
    });
  };
};
var RouteFile = function RouteFile(opts) {
  return function (target, name) {
    var _opts$maxsize;
    var optional = (opts === null || opts === void 0 ? void 0 : opts.optional) || false;
    var typename = Reflect.getMetadata('design:type', target, name).name;
    var type = typename === 'Array' ? 'file[]' : 'file';
    var limit = type === 'file' ? 1 : (opts === null || opts === void 0 ? void 0 : opts.limit) || 20;
    var msstr = (opts === null || opts === void 0 ? void 0 : (_opts$maxsize = opts.maxsize) === null || _opts$maxsize === void 0 ? void 0 : _opts$maxsize.toString()) || '50M';
    var mscount = parseFloat(msstr);
    var maxsize = msstr.endsWith('G') ? mscount * 1000000000 : msstr.endsWith('M') ? mscount * 1000000 : msstr.endsWith('K') ? mscount * 1000 : mscount;
    var mimetype = (opts === null || opts === void 0 ? void 0 : opts.mimetype) || null;
    var mimetypes = !mimetype ? null : tnValidate.isArray(mimetype) ? mimetype : [mimetype];
    var validators = {
      maxsize: maxsize,
      limit: limit,
      mimetypes: mimetypes
    };
    var getter = function getter() {
      return {
        $file: true,
        name: name,
        type: type,
        optional: optional,
        validators: validators,
        selects: null
      };
    };
    Object.defineProperty(target, name, {
      get: getter
    });
  };
};
var ptypes = ['string', 'number', 'boolean'];
var RouteParam = function RouteParam(opts, v) {
  return function (target, name) {
    var _opts$type;
    var optional = (opts === null || opts === void 0 ? void 0 : opts.optional) || false;
    var typename = (opts === null || opts === void 0 ? void 0 : (_opts$type = opts.type) === null || _opts$type === void 0 ? void 0 : _opts$type.name) || Reflect.getMetadata('design:type', target, name).name;
    var type = typename.toLowerCase();
    if (!ptypes.includes(type)) throw new Error("@RouteParam(".concat(name, ") must be typeof ").concat(ptypes, "\n"));
    var validator = v || function () {
      return true;
    };
    var getter = (opts === null || opts === void 0 ? void 0 : opts.getter) || function (v) {
      return v;
    };
    var get = function get() {
      return {
        $param: true,
        name: name,
        type: type,
        optional: optional,
        selects: (opts === null || opts === void 0 ? void 0 : opts.selects) || null,
        bunnysecure: (opts === null || opts === void 0 ? void 0 : opts.bunnysecure) || false,
        validator: validator,
        getter: getter
      };
    };
    Object.defineProperty(target, name, {
      get: get
    });
  };
};
var RouteIndexParam = function RouteIndexParam(index, opts, v) {
  return function (target, name) {
    var _opts$type2;
    var optional = (opts === null || opts === void 0 ? void 0 : opts.optional) || false;
    var typename = (opts === null || opts === void 0 ? void 0 : (_opts$type2 = opts.type) === null || _opts$type2 === void 0 ? void 0 : _opts$type2.name) || Reflect.getMetadata('design:type', target, name).name;
    var type = typename.toLowerCase();
    if (!ptypes.includes(type)) throw new Error("@RouteIndexParam(".concat(name, ") must be typeof ").concat(ptypes, "\n")); // prettier-ignore
    var validator = v || function () {
      return true;
    };
    var getter = (opts === null || opts === void 0 ? void 0 : opts.getter) || function (v) {
      return v;
    };
    var get = function get() {
      return {
        $param: true,
        index: index,
        name: name,
        type: type,
        optional: optional,
        selects: (opts === null || opts === void 0 ? void 0 : opts.selects) || null,
        bunnysecure: (opts === null || opts === void 0 ? void 0 : opts.bunnysecure) || false,
        validator: validator,
        getter: getter
      };
    };
    Object.defineProperty(target, name, {
      get: get
    });
  };
};
var qtypes = ['string', 'number', 'boolean'];
var RouteQuery = function RouteQuery(opts, v) {
  return function (target, name) {
    var _opts$type3;
    var optional = (opts === null || opts === void 0 ? void 0 : opts.optional) || false;
    var typename = (opts === null || opts === void 0 ? void 0 : (_opts$type3 = opts.type) === null || _opts$type3 === void 0 ? void 0 : _opts$type3.name) || Reflect.getMetadata('design:type', target, name).name;
    var type = typename.toLowerCase();
    if (!qtypes.includes(type)) throw new Error("@RouteQuery(".concat(name, ") must be typeof ").concat(qtypes, "\n"));
    var validator = v || function () {
      return true;
    };
    var getter = (opts === null || opts === void 0 ? void 0 : opts.getter) || function (v) {
      return v;
    };
    var get = function get() {
      return {
        $query: true,
        name: name,
        type: type,
        optional: optional,
        selects: (opts === null || opts === void 0 ? void 0 : opts.selects) || null,
        routesecure: (opts === null || opts === void 0 ? void 0 : opts.routesecure) || false,
        validator: validator,
        getter: getter
      };
    };
    Object.defineProperty(target, name, {
      get: get
    });
  };
};
var rtypes = ['string', 'number', 'boolean', 'object', 'string[]', 'number[]', 'boolean[]', 'object[]', 'any[]']; // prettier-ignore
var RouteResult = function RouteResult(opts) {
  return function (target, name) {
    var optional = (opts === null || opts === void 0 ? void 0 : opts.optional) || false;
    var typename = '';
    var object = [];
    var explicit = opts === null || opts === void 0 ? void 0 : opts.type;
    if (!explicit) typename = Reflect.getMetadata('design:type', target, name).name;else {
      var arr = tnValidate.isArray(explicit);
      var expname = (arr ? explicit[0].name : explicit.name).toLowerCase();
      if (expname === 'array') typename = 'any[]';else if (rtypes.includes(expname)) typename = arr ? "".concat(expname, "[]") : expname;else {
        var expcls = arr ? explicit[0] : explicit;
        typename = arr ? 'object[]' : 'object';
        getAllProperties(expcls).forEach(function (p) {
          var value = expcls.prototype[p];
          if (value.$result) object.push(value);
        });
      }
    }
    var type = typename.toLowerCase();
    if (!rtypes.includes(type)) throw new Error("@RouteResult(".concat(name, ") must be typeof ").concat(rtypes, "\n"));
    var get = function get() {
      return {
        $result: true,
        name: name,
        type: type,
        optional: optional,
        object: object,
        selects: (opts === null || opts === void 0 ? void 0 : opts.selects) || null
      };
    };
    Object.defineProperty(target, name, {
      get: get
    });
  };
};
var RouteSecure = function RouteSecure(secret, opts) {
  return function (target, name) {
    var get = function get() {
      return {
        $secure: true,
        name: name,
        secret: secret,
        timesafe: (opts === null || opts === void 0 ? void 0 : opts.timesafe) || false,
        query: (opts === null || opts === void 0 ? void 0 : opts.query) || false
      };
    };
    Object.defineProperty(target, name, {
      get: get
    });
  };
};
var routeFieldsEssentials = function routeFieldsEssentials(ctx) {
  var req = ctx.switchToHttp().getRequest();
  var _req$params = req.params,
    params = _req$params === void 0 ? {} : _req$params,
    _req$body2 = req.body,
    body = _req$body2 === void 0 ? {} : _req$body2,
    _req$files = req.files,
    files = _req$files === void 0 ? {} : _req$files,
    _req$query = req.query,
    query = _req$query === void 0 ? {} : _req$query;
  var reflector = new core.Reflector();
  var handler = ctx.getHandler();
  var path = reflector.get('path', handler);
  var controller = ctx.getClass();
  var routes = controller.prototype.$routes;
  if (!tnValidate.isArray(routes)) throw new common.InternalServerErrorException('@Route() setup has faults');
  var route = routes.find(function (route) {
    return route.$route && route.route === path;
  });
  if (!route) throw new common.InternalServerErrorException('@Route() setup has faults');
  return {
    params: params,
    body: body,
    query: query,
    files: files,
    route: route
  };
};
var bodyerr = function bodyerr(name) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var prestr = prefix.map(function (p) {
    return "".concat(p, ".");
  }).join('');
  return new common.BadRequestException("Invalid body: ".concat(prestr).concat(name));
};
var routeFieldsBodies = function routeFieldsBodies(fields, body, route) {
  var typecorrection = !!route.files.length;
  route.bodies.forEach(function (bodyinfo) {
    var name = bodyinfo.name,
      type = bodyinfo.type;
    var prevalue = body[name];
    var voidvalue = prevalue === undefined || prevalue === null;
    var value = prevalue;
    if (typecorrection && !voidvalue) {
      if (type === 'boolean') {
        if (prevalue === 'true') value = true;else if (prevalue === 'false') value = false;else throw bodyerr(name);
      } else if (type === 'number') {
        value = +prevalue;
        if (isNaN(value)) throw bodyerr(name);
      }
    }
    fields[name] = getValue(bodyinfo, value);
  });
};
var getValue = function getValue(bodyinfo, value) {
  var prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var name = bodyinfo.name,
    optional = bodyinfo.optional,
    type = bodyinfo.type,
    object = bodyinfo.object,
    selects = bodyinfo.selects,
    validator = bodyinfo.validator,
    getter = bodyinfo.getter;
  var voidvalue = value === undefined || value === null;
  if (!optional && voidvalue) throw bodyerr(name, prefix);
  if (voidvalue) return;
  if (type === 'string' && !tnValidate.isString(value)) throw bodyerr(name, prefix);
  if (type === 'number' && !tnValidate.isNumber(value)) throw bodyerr(name, prefix);
  if (type === 'boolean' && !tnValidate.isBoolean(value)) throw bodyerr(name, prefix);
  if (type === 'string[]' && !tnValidate.isStrArr(value)) throw bodyerr(name, prefix);
  if (type === 'number[]' && !tnValidate.isNumArr(value)) throw bodyerr(name, prefix);
  if (type === 'boolean[]' && !tnValidate.isBoolArr(value)) throw bodyerr(name, prefix);
  if (type === 'any[]' && !tnValidate.isArray(value)) throw bodyerr(name, prefix);
  if (type === 'object[]' && !tnValidate.isArray(value)) throw bodyerr(name, prefix);
  if (type === 'object' && !tnValidate.isObject(value)) throw bodyerr(name, prefix);
  if (selects && !selects.includes(value)) throw bodyerr(name);
  if (!validator(value)) throw bodyerr(name, prefix);
  if (type !== 'object' && type !== 'object[]') return getter(value);
  var arr = type === 'object[]';
  var arrvalue = arr ? value : [value];
  var retvalue = arrvalue.map(function (values) {
    var value = {};
    object.forEach(function (nextbodyinfo) {
      var nextname = nextbodyinfo.name;
      var nextvalue = values[nextname];
      value[nextname] = getValue(nextbodyinfo, nextvalue, [].concat(_toConsumableArray(prefix), [name]));
    });
    return getter(value);
  });
  return getter(arr ? retvalue : retvalue[0]);
};
var fileerr = function fileerr(name) {
  return new common.BadRequestException("Invalid file: ".concat(name));
};
var validate = function validate(file, validators) {
  var maxsize = validators.maxsize,
    mimetypes = validators.mimetypes;
  if (file.size > maxsize) return false;
  if (!mimetypes) return true;
  return mimetypes.includes(file.mimetype);
};
var routeFieldsFiles = function routeFieldsFiles(fields, files, route) {
  route.files.forEach(function (_ref3) {
    var name = _ref3.name,
      optional = _ref3.optional,
      type = _ref3.type,
      validators = _ref3.validators;
    var multers = files[name];
    if (!optional && !multers) throw fileerr(name);
    if (!multers) return;
    if (type === 'file') {
      if (multers.length > 1) throw fileerr(name);
      var file = multers[0];
      if (!validate(file, validators)) throw fileerr(name);
      return fields[name] = file;
    }
    if (multers.length > validators.limit) throw fileerr(name);
    if (!multers.map(function (f) {
      return validate(f, validators);
    }).every(function (i) {
      return i;
    })) throw fileerr(name);
    fields[name] = multers;
  });
};
var paramerr = function paramerr(name) {
  return new common.BadRequestException("Invalid parameter: ".concat(name));
};
var routeFieldsParams = function routeFieldsParams(fields, params, route) {
  route.params.forEach(function (_ref4) {
    var name = _ref4.name,
      type = _ref4.type,
      optional = _ref4.optional,
      selects = _ref4.selects,
      validator = _ref4.validator,
      getter = _ref4.getter;
    var value;
    var strval = params[name];
    if (optional && strval === '-') return;else if (type === 'string') value = strval;else if (type === 'boolean') {
      if (strval === 'true') value = true;else if (strval === 'false') value = false;else throw paramerr(name);
    } else {
      value = +strval;
      if (isNaN(value)) throw paramerr(name);
    }
    if (selects && !selects.includes(value)) throw paramerr(name);
    if (!validator(value)) throw paramerr(name);
    fields[name] = getter(value);
  });
};
var queryerr = function queryerr(name) {
  return new common.BadRequestException("Invalid query: ".concat(name));
};
var routeFieldsQueries = function routeFieldsQueries(fields, query, route) {
  route.queries.forEach(function (_ref5) {
    var name = _ref5.name,
      type = _ref5.type,
      optional = _ref5.optional,
      selects = _ref5.selects,
      validator = _ref5.validator,
      getter = _ref5.getter;
    var value;
    var strval = query[name];
    if (optional && (strval === '-' || strval === null || strval === undefined)) return;else if (type === 'string') value = strval;else if (type === 'boolean') {
      if (strval === 'true') value = true;else if (strval === 'false') value = false;else throw queryerr(name);
    } else {
      value = +strval;
      if (isNaN(value)) throw queryerr(name);
    }
    if (selects && !selects.includes(value)) throw queryerr(name);
    if (!validator(value)) throw queryerr(name);
    fields[name] = getter(value);
  });
};
var RouteFields = common.createParamDecorator(function (_, ctx) {
  var _routeFieldsEssential = routeFieldsEssentials(ctx),
    params = _routeFieldsEssential.params,
    body = _routeFieldsEssential.body,
    query = _routeFieldsEssential.query,
    files = _routeFieldsEssential.files,
    route = _routeFieldsEssential.route;
  var fields = {};
  routeFieldsParams(fields, params, route);
  routeFieldsQueries(fields, query, route);
  routeFieldsBodies(fields, body, route);
  routeFieldsFiles(fields, files, route);
  return fields;
});
var routeInfoCdnConfig = function routeInfoCdnConfig(routecls, params) {
  var cdnopts = routecls.prototype.$routecdnopts;
  var routebase = routecls.prototype.$routebase;
  if (cdnopts.bunnysecure) routebase = '/-secure-/' + routebase;
  if (cdnopts.bunnyperma) routebase = '/-perma-/' + routebase;
  var secureroute;
  if (cdnopts.bunnysecure) {
    var lock = false;
    var tokenparams = [];
    params.forEach(function (param) {
      if (!param.bunnysecure) return lock = true;
      if (lock) throw new Error('@RouteParam() bunnysecure:true must be in proper sequence\n');
      if (param.optional) throw new Error('@RouteParam() bunnysecure:true can not be optional\n');
      tokenparams.push(param);
    });
    var routearr = [routebase].concat(_toConsumableArray(tokenparams.map(function (_ref6) {
      var name = _ref6.name;
      return ":".concat(name);
    }))).join('/');
    var tokenroute = "/".concat(routearr, "/").replace(/[\\\/]+/g, '/');
    secureroute = {
      tokenroute: tokenroute,
      params: tokenparams
    };
  }
  var cdnconfig = _objectSpread(_objectSpread({}, cdnopts), {}, {
    secureroute: secureroute
  });
  return {
    routebase: routebase,
    cdnconfig: cdnconfig
  };
};
var routeInfoFields = function routeInfoFields(routecls) {
  var paramsUnindexed = [];
  var paramsIndexed = [];
  var files = [];
  var queries = [];
  var bodies = [];
  var rsi;
  getAllProperties(routecls).forEach(function (p) {
    var body = routecls.prototype[p];
    if (body.$body) return bodies.push(body);
    var secure = body;
    if (secure.$secure) return rsi = secure;
    var query = body;
    if (query.$query) return queries.push(query);
    var file = body;
    if (file.$file) return files.push(file);
    var param = body;
    if (!param.$param) return;
    if (param.index) paramsIndexed.splice(param.index, 0, param);else paramsUnindexed.push(param);
  });
  var params = [].concat(paramsUnindexed, paramsIndexed);
  return {
    params: params,
    files: files,
    queries: queries,
    bodies: bodies,
    rsi: rsi
  };
};
var routeInfoResults = function routeInfoResults(resultcls) {
  var results = 'String';
  if ((resultcls === null || resultcls === void 0 ? void 0 : resultcls.name) === 'String') results = 'String';else if ((resultcls === null || resultcls === void 0 ? void 0 : resultcls.name) === 'Buffer') results = 'Buffer';else if (resultcls) {
    var resjson = [];
    getAllProperties(resultcls).forEach(function (p) {
      var result = resultcls.prototype[p];
      if (result.$result) return resjson.push(result);
    });
    results = resjson;
  }
  return results;
};
var routeInfoRoute = function routeInfoRoute(_ref7) {
  var routebase = _ref7.routebase,
    params = _ref7.params,
    rsi = _ref7.rsi;
  var routearr = [routebase].concat(_toConsumableArray(params.map(function (_ref8) {
    var name = _ref8.name;
    return ":".concat(name);
  })));
  if (rsi && !rsi.query) routearr.push(":".concat(rsi.name));
  return routearr.join('/').replace(/[\\\/]+/g, '/');
};
var routeInfoRouteSecure = function routeInfoRouteSecure(rsi) {
  if (!rsi) return false;
  return {
    name: rsi.name,
    timesafe: rsi.timesafe,
    query: rsi.query
  };
};
var createRouteInfo = function createRouteInfo(method, routecls, resultcls) {
  var _routeInfoFields = routeInfoFields(routecls),
    params = _routeInfoFields.params,
    queries = _routeInfoFields.queries,
    bodies = _routeInfoFields.bodies,
    files = _routeInfoFields.files,
    rsi = _routeInfoFields.rsi;
  var _routeInfoCdnConfig = routeInfoCdnConfig(routecls, params),
    routebase = _routeInfoCdnConfig.routebase,
    cdnconfig = _routeInfoCdnConfig.cdnconfig;
  var results = routeInfoResults(resultcls);
  var route = routeInfoRoute({
    routebase: routebase,
    params: params,
    rsi: rsi
  });
  var routesecure = routeInfoRouteSecure(rsi);
  var name = routecls.name;
  return {
    $route: true,
    route: route,
    method: method,
    name: name,
    routesecure: routesecure,
    cdnconfig: cdnconfig,
    queries: queries,
    params: params,
    bodies: bodies,
    files: files,
    results: results,
    getRouteSecureSecret: function getRouteSecureSecret() {
      return rsi === null || rsi === void 0 ? void 0 : rsi.secret;
    }
  };
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __metadata(metadataKey, metadataValue) {
  if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
var routekey = 'routesecure';
var RouteSecureGuard = function RouteSecureGuard(route) {
  return common.applyDecorators(common.SetMetadata(routekey, route), common.UseGuards(Activate));
};
var Activate = /*#__PURE__*/function () {
  function Activate(reflector) {
    _classCallCheck(this, Activate);
    _defineProperty(this, "reflector", void 0);
    this.reflector = reflector;
  }
  _createClass(Activate, [{
    key: "canActivate",
    value: function canActivate(context) {
      var handles = [context.getHandler(), context.getClass()];
      var route = this.reflector.getAllAndOverride(routekey, handles);
      var req = context.switchToHttp().getRequest();
      var _req$params2 = req.params,
        params = _req$params2 === void 0 ? {} : _req$params2,
        _req$query2 = req.query,
        query = _req$query2 === void 0 ? {} : _req$query2,
        _req$body3 = req.body,
        body = _req$body3 === void 0 ? {} : _req$body3;
      var rs = route.routesecure;
      if (!rs) return true;
      var token = rs.query ? query[rs.name] : params[rs.name];
      if (!token) throw new common.UnauthorizedException();
      var secret = route.getRouteSecureSecret();
      var checks = [];
      route.params.forEach(function (_ref9) {
        var name = _ref9.name;
        return checks.push(params[name]);
      });
      route.queries.forEach(function (_ref10) {
        var name = _ref10.name,
          routesecure = _ref10.routesecure;
        if (!routesecure) return;
        var val = query[name];
        var isnull = val === null || val === undefined;
        if (!isnull) checks.push(val);
      });
      route.bodies.forEach(function (_ref11) {
        var name = _ref11.name,
          routesecure = _ref11.routesecure;
        if (!routesecure) return;
        var val = body[name];
        var isnull = val === null || val === undefined;
        if (!isnull) checks.push(JSON.stringify(val));
      });
      var checkstr = checks.join('/');
      if (rs.timesafe) {
        var _token$split = token.split('.'),
          _token$split2 = _slicedToArray(_token$split, 2),
          expstr = _token$split2[0],
          hash = _token$split2[1];
        var remain = +expstr - new Date().getTime();
        if (remain <= 0 || remain >= ms$1(rs.timesafe)) throw new common.UnauthorizedException();
        var hashmatch = sha(checkstr + expstr + secret).toString();
        if (hash !== hashmatch) throw new common.UnauthorizedException();
      } else {
        var _hashmatch = sha(checkstr + secret).toString();
        if (token !== _hashmatch) throw new common.UnauthorizedException();
      }
      return true;
    }
  }]);
  return Activate;
}();
Activate = __decorate([common.Injectable(), __metadata("design:paramtypes", [core.Reflector])], Activate);
var RouteGet = function RouteGet(routecls, resultcls) {
  return createDecor('GET', routecls, resultcls);
}; // prettier-ignore
var RoutePost = function RoutePost(routecls, resultcls) {
  return createDecor('POST', routecls, resultcls);
}; // prettier-ignore
var createDecor = function createDecor(method, routecls, resultcls) {
  var routeinfo = createRouteInfo(method, routecls, resultcls);
  var decors = [];
  decors.push(function (target) {
    if (!tnValidate.isArray(target.$routes)) target.$routes = [];
    target.$routes.push(routeinfo);
  });
  var Method = method === 'GET' ? common.Get : common.Post;
  decors.push(Method(routeinfo.route));
  if (routeinfo.files.length) {
    var multer = routeinfo.files.map(function (file) {
      return {
        name: file.name
      };
    });
    decors.push(common.UseInterceptors(platformExpress.FileFieldsInterceptor(multer)));
    var acc = ['string', 'number', 'boolean'];
    routeinfo.bodies.forEach(function (_ref12) {
      var type = _ref12.type,
        name = _ref12.name;
      if (acc.includes(type)) return;
      throw new Error("You are using @RouteFile() so @RouteBody(".concat(name, ") must be typeof ").concat(acc, "\n"));
    });
  }
  if (routeinfo.routesecure) decors.push(RouteSecureGuard(routeinfo));
  if (routeinfo.cdnconfig.bunnysecure) {
    var rs = routeinfo.routesecure;
    if (rs && rs.query) throw new Error("@RouteSecure() query:true not allowed when bunnysecure\n");
    if (routeinfo.queries.length) throw new Error("@RouteQuery() not allowed when bunnysecure");
  }
  return common.applyDecorators.apply(common, decors);
};
var routeSchemaCreator = function routeSchemaCreator(controllers) {
  return controllers.map(function (controller) {
    var routes = controller.prototype.$routes;
    if (tnValidate.isArray(routes)) return routes.filter(function (r) {
      return r.$route;
    });
  }).filter(function (i) {
    return i;
  }).flat();
};
exports.Route = Route;
exports.RouteBody = RouteBody;
exports.RouteFields = RouteFields;
exports.RouteFile = RouteFile;
exports.RouteGet = RouteGet;
exports.RouteIndexParam = RouteIndexParam;
exports.RouteParam = RouteParam;
exports.RoutePost = RoutePost;
exports.RouteQuery = RouteQuery;
exports.RouteResult = RouteResult;
exports.RouteSecure = RouteSecure;
exports.RouteStatus = RouteStatus;
exports.createRouteInfo = createRouteInfo;
exports.routeSchemaCreator = routeSchemaCreator;
exports.routeStatus = routeStatus;
exports.routeStatusMiddleware = routeStatusMiddleware;
