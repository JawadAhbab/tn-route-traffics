#!/usr/bin/env node
'use strict';

var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var axios = require('axios');
var fs = require('fs-extra');
var path = require('path');
var tnValidate = require('tn-validate');
function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function get() {
            return e[k];
          }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}
var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);
var templateInterfaces = "\nconst qtypes = ['string', 'number', 'boolean'] as const\nconst ptypes = ['string', 'number', 'boolean'] as const\nconst btypes = ['string', 'number', 'boolean', 'object', 'string[]', 'number[]', 'boolean[]', 'object[]', 'any[]'] as const // prettier-ignore\nconst rtypes = ['string', 'number', 'boolean', 'object', 'string[]', 'number[]', 'boolean[]', 'object[]', 'any[]'] as const // prettier-ignore\nconst filetypes = ['file', 'file[]'] as const\ntype RouteMethod = 'GET' | 'POST'\ntype FileType = (typeof filetypes)[number]\ntype QueryType = (typeof qtypes)[number]\ntype ParamType = (typeof ptypes)[number]\ntype RouteBodyType = (typeof btypes)[number]\ntype RouteResultType = (typeof rtypes)[number]\ntype RouteResultInfo = RouteResultJson[] | 'String' | 'Buffer'\ntype Selects = string[] | number[] | readonly number[] | readonly string[]\ntype RouteSecure = { name: string; timesafe: string | false; query: boolean }\n\ninterface RouteInfo {\n  $route: true\n  route: string\n  method: RouteMethod\n  name: string\n  routesecure: RouteSecure | false\n  cdnconfig: RouteCdnConfig\n  queries: RouteQueryInfo[]\n  params: RouteParamInfo[]\n  bodies: RouteBodyInfo[]\n  files: RouteFileInfo[]\n  results: RouteResultInfo\n}\n\ninterface RouteCdnConfig {\n  bunnycdn: boolean\n  bunnyperma: boolean\n  bunnysecure: false | string\n  secureroute?: {\n    tokenroute: string\n    params: RouteParamInfo[]\n  }\n}\n\ninterface RouteQueryInfo {\n  $query: true\n  name: string\n  type: QueryType\n  optional: boolean\n  selects: Selects | null\n  routesecure: boolean\n}\n\ninterface RouteParamInfo {\n  $param: true\n  index?: number\n  name: string\n  type: ParamType\n  bunnysecure: boolean\n  selects: Selects | null\n  optional: boolean\n}\n\ninterface RouteBodyInfo {\n  $body: true\n  name: string\n  type: RouteBodyType\n  optional: boolean\n  selects: Selects | null\n  object: RouteBodyInfo[]\n  routesecure: boolean\n}\n\ninterface RouteFileInfo {\n  $file: true\n  name: string\n  type: FileType\n  optional: boolean\n  selects: null\n  validators: RouteFileInfoValidators\n}\n\ninterface RouteFileInfoValidators {\n  maxsize: number\n  limit: number\n  mimetypes: null | string[]\n}\n\ninterface RouteResultJson {\n  $result: true\n  name: string\n  type: RouteResultType\n  optional: boolean\n  selects: Selects | null\n  object: RouteResultJson[]\n}\n";
var templateBasics = function templateBasics(_ref) {
  var site = _ref.site,
    cdn = _ref.cdn,
    cdnaccess = _ref.cdnaccess,
    loggerImport = _ref.loggerImport,
    loggerMethod = _ref.loggerMethod;
  var logger = loggerImport && loggerMethod;
  return "\nimport axios, { AxiosError, AxiosProgressEvent, AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios' // prettier-ignore\nimport { AnyObject } from 'tn-typescript'\nimport sha from 'crypto-js/sha256'\nimport ms from 'ms'\n".concat(logger ? "import { ".concat(loggerMethod, " } from '").concat(loggerImport, "'") : '', "\n\nexport type RouteAuth = (callback: (accessToken: string) => void) => void\ninterface AxiosRequestProps<V = AnyObject, R = any> {\n  auth?: RouteAuth\n  variables?: V\n  signal?: AbortSignal\n  headers?: AnyObject\n  onProgress?: (e: AxiosProgressEvent) => void\n  onSuccess?: (data: R, res: AxiosResponse<R>) => void\n  onError?: (err: AxiosError) => void\n  onFinally?: () => void\n}\n\nconst getNextReferenceTime = (exp: string) => {\n  const starting = new Date().getTime()\n  const validity = ms(exp)\n  return new Date(Math.ceil((starting + validity) / validity) * validity).getTime()\n}\n\nconst createBunnySignature = (info: RouteInfo, variables: AnyObject) => {\n  const tokenroute = info.cdnconfig.secureroute!.tokenroute\n  const exp = info.cdnconfig.bunnysecure || '30d'\n  const access = ").concat(cdnaccess, "\n  const expires = Math.ceil(getNextReferenceTime(exp) / 1000)\n  const path = tokenroute.replace(/\\:(\\w+)/g, (_, k) => encodeURIComponent(variables[k]))\n  const queries = 'token_path=' + path\n  const tokenbasics = access + path + expires + queries\n  const token = Buffer.from(sha(tokenbasics).toString(), 'hex').toString('base64url')\n  return { token, token_path: path, expires }\n}\n\nconst getRouteSecureToken = (rs: RouteSecure, variables: AnyObject, info: RouteInfo) => {\n  const { name, timesafe } = rs\n  const secret = variables[name]\n  const checks: string[] = []\n  info.params.forEach(({ name }) => {\n    const val = variables[name]\n    const isnull = val === null || val === undefined\n    checks.push(isnull ? '-' : val)\n  })\n  info.queries.forEach(({ name, routesecure }) => {\n    if (!routesecure) return\n    const val = variables[name]\n    const isnull = val === null || val === undefined\n    if (!isnull) checks.push(val)\n  })\n  info.bodies.forEach(({ name, routesecure }) => {\n    if (!routesecure) return\n    const val = variables[name]\n    const isnull = val === null || val === undefined\n    if (!isnull) checks.push(JSON.stringify(val))\n  })\n\n  const checkstr = checks.join('/')\n  if (!timesafe) return sha(checkstr + secret).toString()\n  const exp = new Date().getTime() + ms(timesafe)\n  return exp + '.' + sha(checkstr + exp + secret).toString()\n}\n\nconst createUrl = (info: RouteInfo, variables: AnyObject) => {\n  const paramobj: AnyObject = {}\n  const queryarr: string[] = []\n  info.params.forEach(({ name }) => {\n    const val = variables[name]\n    const isnull = val === null || val === undefined\n    paramobj[name] = isnull ? '-' : encodeURIComponent(val)\n  })\n  info.queries.forEach(({ name }) => {\n    const val = variables[name]\n    const isnull = val === null || val === undefined\n    if (!isnull) queryarr.push(name + '=' + String(variables[name]))\n  })\n\n  if (info.routesecure) {\n    const rs = info.routesecure\n    const token = getRouteSecureToken(rs, variables, info)\n    if (rs.query) queryarr.push(rs.name + '=' + token)\n    else paramobj[rs.name] = token\n  }\n\n  if (info.cdnconfig.secureroute) {\n    const { token, token_path, expires } = variables.bunnytoken\n    queryarr.push('token=' + token)\n    queryarr.push('token_path=' + token_path)\n    queryarr.push('expires=' + expires)\n  }\n\n  const site = ").concat(site, "\n  const cdn = ").concat(cdn ? cdn : 'site', "\n  const address = (info.cdnconfig.bunnycdn ? cdn : site).replace(/[\\\\\\/]$/, '') + '/'\n  const queries = queryarr.join('&')\n  const urlr = info.route.replace(/\\:(\\w+)/g, (_, k) => paramobj[k]).replace(/^[\\\\\\/]/, '')\n\n  return address + urlr + (queries ? '?' : '') + queries\n}\n\nconst createAxiosRequest = (info: RouteInfo, props: AxiosRequestProps) => {\n  const { onProgress, onSuccess, onError, onFinally, signal } = props\n  const { auth, variables = {}, headers = {} } = props\n  const url = createUrl(info, variables)\n  const multipart = !!info.files.length\n  if (multipart) headers['Content-Type'] = false\n\n  let responseType: ResponseType = 'json'\n  if (info.results === 'Buffer') responseType = 'arraybuffer'\n  else if (info.results === 'String') responseType = 'text'\n\n  let data: AnyObject | FormData\n  if (multipart) {\n    const formdata = new FormData()\n    const entries = [...info.files, ...info.bodies]\n    entries.forEach(({ name }) => {\n      const entry = variables[name]\n      if (entry) formdata.set(name, entry)\n    })\n    data = formdata\n  } else {\n    const simpledata: AnyObject = {}\n    info.bodies.forEach(({ name }) => (simpledata[name] = variables[name]))\n    data = simpledata\n  }\n\n  const sendRequest = (accessToken?: string) => {\n    if (accessToken) headers.authorization = `Bearer ${accessToken}`\n    const req: AxiosRequestConfig = { method: info.method, url, signal, responseType, data, headers, onUploadProgress: onProgress } // prettier-ignore\n    ").concat(logger ? "".concat(loggerMethod, "(req)") : '', "\n    axios\n      .request(req)\n      .then(res => onSuccess && onSuccess(res.data, res))\n      .catch(err => onError && onError(err))\n      .finally(() => onFinally && onFinally())\n  }\n\n  if (!auth) sendRequest()\n  else auth((accessToken) => sendRequest(accessToken)) \n}\n");
};
var selectUnion = function selectUnion(selects) {
  return selects.map(function (s) {
    return tnValidate.isString(s) ? "'".concat(s, "'") : s;
  }).join('|');
};
var templateRoute = function templateRoute(routeinfo) {
  var routesecure = routeinfo.routesecure,
    cdn = routeinfo.cdnconfig,
    params = routeinfo.params,
    queries = routeinfo.queries,
    files = routeinfo.files,
    bodies = routeinfo.bodies,
    r = routeinfo.results;
  var name = routeinfo.name.replace(/Route$/, '');
  var vartypes = loopableType(bodies);
  if (routesecure) vartypes += "".concat(routesecure.name, ":string;");
  if (cdn.bunnysecure) vartypes += "bunnytoken:{token:string;token_path:string;expires:number};";
  var pqfs = [].concat(_toConsumableArray(params), _toConsumableArray(queries), _toConsumableArray(files));
  pqfs.forEach(function (_ref2) {
    var type = _ref2.type,
      name = _ref2.name,
      optional = _ref2.optional,
      selects = _ref2.selects;
    var vtype = type === 'file' ? 'File' : type === 'file[]' ? 'File[]' : type;
    var ttype = selects ? selectUnion(selects) : "".concat(vtype).concat(optional ? ' | null' : '');
    vartypes += "".concat(name).concat(optional ? '?' : '', ":").concat(ttype, ";");
  });
  var istype = r === 'Buffer' || r === 'String';
  var res = r === 'Buffer' ? 'ArrayBuffer' : r === 'String' ? 'string' : loopableType(r);
  var template = "\nconst info".concat(name, ": RouteInfo = ").concat(JSON.stringify(routeinfo), "\nexport interface Route").concat(name, "Variables {").concat(vartypes, "}\nexport ").concat(istype ? 'type' : 'interface', " Route").concat(name, "Result ").concat(istype ? "= ".concat(res) : "{".concat(res, "}"), "\nexport const url").concat(name, " = (variables: Route").concat(name, "Variables) => createUrl(info").concat(name, ", variables)\nexport const axios").concat(name, " = (props: AxiosRequestProps<Route").concat(name, "Variables, Route").concat(name, "Result>) => createAxiosRequest(info").concat(name, ", props)\n");
  if (cdn.bunnysecure) {
    var _vartypes = '';
    cdn.secureroute.params.forEach(function (_ref3) {
      var name = _ref3.name,
        type = _ref3.type,
        selects = _ref3.selects;
      var ttype = selects ? selectUnion(selects) : type;
      _vartypes += "".concat(name, ":").concat(ttype, ";");
    });
    template += "\nexport interface BunnyToken".concat(name, "Variables {").concat(_vartypes, "}\nexport const bunnytoken").concat(name, " = (variables: BunnyToken").concat(name, "Variables) => createBunnySignature(info").concat(name, ", variables)\n");
  }
  return template;
};
var loopableType = function loopableType(infos) {
  var strtype = '';
  infos.forEach(function (_ref4) {
    var name = _ref4.name,
      type = _ref4.type,
      optional = _ref4.optional,
      selects = _ref4.selects,
      object = _ref4.object;
    var isobj = type === 'object' || type === 'object[]';
    if (!isobj) {
      var ttype = selects ? selectUnion(selects) : "".concat(type).concat(optional ? ' | null' : '');
      strtype += "".concat(name).concat(optional ? '?' : '', ":").concat(ttype, ";");
    } else {
      var isarr = type === 'object[]';
      var loopttype = "{".concat(loopableType(object), "}").concat(isarr ? '[]' : '').concat(optional ? ' | null' : '');
      var _ttype = selects ? selectUnion(selects) : loopttype;
      strtype += "".concat(name).concat(optional ? '?' : '', ":").concat(_ttype, ";");
    }
  });
  return strtype;
};
var configpath = path__namespace.join(process.cwd(), 'routes.json');
var configs = fs__namespace.readJsonSync(configpath);
configs.forEach(function (config) {
  return createRouteFile(config);
});
function createRouteFile(_x) {
  return _createRouteFile.apply(this, arguments);
}
function _createRouteFile() {
  _createRouteFile = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(config) {
    var site, cdn, cdnaccess, schema, outpath, loggerImport, loggerMethod, routesinfo, outdata;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          site = config.site, cdn = config.cdn, cdnaccess = config.cdnaccess, schema = config.schema, outpath = config.outpath, loggerImport = config.loggerImport, loggerMethod = config.loggerMethod;
          if (!(!site || !schema || !outpath)) {
            _context.next = 3;
            break;
          }
          throw new Error('Malformed config file\n');
        case 3:
          _context.next = 5;
          return axios.get(schema, {
            responseType: 'json'
          });
        case 5:
          routesinfo = _context.sent.data;
          outdata = templateInterfaces;
          outdata += templateBasics({
            site: site,
            cdn: cdn,
            cdnaccess: cdnaccess,
            loggerImport: loggerImport,
            loggerMethod: loggerMethod
          });
          routesinfo.forEach(function (routeinfo) {
            return outdata += templateRoute(routeinfo);
          });
          fs__namespace.outputFileSync(path__namespace.join(process.cwd(), outpath), outdata);
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _createRouteFile.apply(this, arguments);
}
