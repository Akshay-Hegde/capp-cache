/**
 * This file has been modified from the original to export all classes on exporter.ECDH
 */
;var exporter = (typeof window!=='undefined' ? window : global);
if (exporter.ECDH === undefined) {

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ellipticjs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
  'use strict';

  exporter.ECDH = {};
  
  var elliptic = exports;

  elliptic.version = require('../package.json').version;
  elliptic.utils = require('./elliptic/utils');
  elliptic.rand = require('brorand');
  elliptic.hmacDRBG = require('./elliptic/hmac-drbg');
  elliptic.curve = require('./elliptic/curve');
  elliptic.curves = require('./elliptic/curves');

  // Protocols
  elliptic.ec = require('./elliptic/ec');

},{"../package.json":22,"./elliptic/curve":4,"./elliptic/curves":7,"./elliptic/ec":8,"./elliptic/hmac-drbg":11,"./elliptic/utils":12,"brorand":14}],2:[function(require,module,exports){
  'use strict';

  var bn = require('bn.js');
  var elliptic = require('../../elliptic');

  var getNAF = elliptic.utils.getNAF;
  var getJSF = elliptic.utils.getJSF;
  var assert = elliptic.utils.assert;

  function BaseCurve(type, conf) {
    this.type = type;
    this.p = new bn(conf.p, 16);

    // Use Montgomery, when there is no fast reduction for the prime
    this.red = conf.prime ? bn.red(conf.prime) : bn.mont(this.p);

    // Useful for many curves
    this.zero = new bn(0).toRed(this.red);
    this.one = new bn(1).toRed(this.red);
    this.two = new bn(2).toRed(this.red);

    // Curve configuration, optional
    this.n = conf.n && new bn(conf.n, 16);
    this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed);

    // Temporary arrays
    this._wnafT1 = new Array(4);
    this._wnafT2 = new Array(4);
    this._wnafT3 = new Array(4);
    this._wnafT4 = new Array(4);
  }
  module.exports = exporter.ECDH.BaseCurve = BaseCurve;

  BaseCurve.prototype.point = function point() {
    throw new Error('Not implemented');
  };

  BaseCurve.prototype.validate = function validate() {
    throw new Error('Not implemented');
  };

  BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
    var doubles = p._getDoubles();

    var naf = getNAF(k, 1);
    var I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1);
    I /= 3;

    // Translate into more windowed form
    var repr = [];
    for (var j = 0; j < naf.length; j += doubles.step) {
      var nafW = 0;
      for (var k = j + doubles.step - 1; k >= j; k--)
        nafW = (nafW << 1) + naf[k];
      repr.push(nafW);
    }

    var a = this.jpoint(null, null, null);
    var b = this.jpoint(null, null, null);
    for (var i = I; i > 0; i--) {
      for (var j = 0; j < repr.length; j++) {
        var nafW = repr[j];
        if (nafW === i)
          b = b.mixedAdd(doubles.points[j]);
        else if (nafW === -i)
          b = b.mixedAdd(doubles.points[j].neg());
      }
      a = a.add(b);
    }
    return a.toP();
  };

  BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
    var w = 4;

    // Precompute window
    var nafPoints = p._getNAFPoints(w);
    w = nafPoints.wnd;
    var wnd = nafPoints.points;

    // Get NAF form
    var naf = getNAF(k, w);

    // Add `this`*(N+1) for every w-NAF index
    var acc = this.jpoint(null, null, null);
    for (var i = naf.length - 1; i >= 0; i--) {
      // Count zeroes
      for (var k = 0; i >= 0 && naf[i] === 0; i--)
        k++;
      if (i >= 0)
        k++;
      acc = acc.dblp(k);

      if (i < 0)
        break;
      var z = naf[i];
      assert(z !== 0);
      if (p.type === 'affine') {
        // J +- P
        if (z > 0)
          acc = acc.mixedAdd(wnd[(z - 1) >> 1]);
        else
          acc = acc.mixedAdd(wnd[(-z - 1) >> 1].neg());
      } else {
        // J +- J
        if (z > 0)
          acc = acc.add(wnd[(z - 1) >> 1]);
        else
          acc = acc.add(wnd[(-z - 1) >> 1].neg());
      }
    }
    return p.type === 'affine' ? acc.toP() : acc;
  };

  BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW,
                                                         points,
                                                         coeffs,
                                                         len) {
    var wndWidth = this._wnafT1;
    var wnd = this._wnafT2;
    var naf = this._wnafT3;

    // Fill all arrays
    var max = 0;
    for (var i = 0; i < len; i++) {
      var p = points[i];
      var nafPoints = p._getNAFPoints(defW);
      wndWidth[i] = nafPoints.wnd;
      wnd[i] = nafPoints.points;
    }

    // Comb small window NAFs
    for (var i = len - 1; i >= 1; i -= 2) {
      var a = i - 1;
      var b = i;
      if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
        naf[a] = getNAF(coeffs[a], wndWidth[a]);
        naf[b] = getNAF(coeffs[b], wndWidth[b]);
        max = Math.max(naf[a].length, max);
        max = Math.max(naf[b].length, max);
        continue;
      }

      var comb = [
        points[a], /* 1 */
        null, /* 3 */
        null, /* 5 */
        points[b] /* 7 */
      ];

      // Try to avoid Projective points, if possible
      if (points[a].y.cmp(points[b].y) === 0) {
        comb[1] = points[a].add(points[b]);
        comb[2] = points[a].toJ().mixedAdd(points[b].neg());
      } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
        comb[1] = points[a].toJ().mixedAdd(points[b]);
        comb[2] = points[a].add(points[b].neg());
      } else {
        comb[1] = points[a].toJ().mixedAdd(points[b]);
        comb[2] = points[a].toJ().mixedAdd(points[b].neg());
      }

      var index = [
        -3, /* -1 -1 */
        -1, /* -1 0 */
        -5, /* -1 1 */
        -7, /* 0 -1 */
        0, /* 0 0 */
        7, /* 0 1 */
        5, /* 1 -1 */
        1, /* 1 0 */
        3  /* 1 1 */
      ];

      var jsf = getJSF(coeffs[a], coeffs[b]);
      max = Math.max(jsf[0].length, max);
      naf[a] = new Array(max);
      naf[b] = new Array(max);
      for (var j = 0; j < max; j++) {
        var ja = jsf[0][j] | 0;
        var jb = jsf[1][j] | 0;

        naf[a][j] = index[(ja + 1) * 3 + (jb + 1)];
        naf[b][j] = 0;
        wnd[a] = comb;
      }
    }

    var acc = this.jpoint(null, null, null);
    var tmp = this._wnafT4;
    for (var i = max; i >= 0; i--) {
      var k = 0;

      while (i >= 0) {
        var zero = true;
        for (var j = 0; j < len; j++) {
          tmp[j] = naf[j][i] | 0;
          if (tmp[j] !== 0)
            zero = false;
        }
        if (!zero)
          break;
        k++;
        i--;
      }
      if (i >= 0)
        k++;
      acc = acc.dblp(k);
      if (i < 0)
        break;

      for (var j = 0; j < len; j++) {
        var z = tmp[j];
        var p;
        if (z === 0)
          continue;
        else if (z > 0)
          p = wnd[j][(z - 1) >> 1];
        else if (z < 0)
          p = wnd[j][(-z - 1) >> 1].neg();

        if (p.type === 'affine')
          acc = acc.mixedAdd(p);
        else
          acc = acc.add(p);
      }
    }
    // Zeroify references
    for (var i = 0; i < len; i++)
      wnd[i] = null;
    return acc.toP();
  };

  function BasePoint(curve, type) {
    this.curve = curve;
    this.type = type;
    this.precomputed = null;
  }
  BaseCurve.BasePoint = exporter.ECDH.BasePoint = BasePoint;

  BasePoint.prototype.validate = function validate() {
    return this.curve.validate(this);
  };

  BasePoint.prototype.precompute = function precompute(power) {
    if (this.precomputed)
      return this;

    var precomputed = {
      doubles: null,
      naf: null,
      beta: null
    };
    precomputed.naf = this._getNAFPoints(8);
    precomputed.doubles = this._getDoubles(4, power);
    precomputed.beta = this._getBeta();
    this.precomputed = precomputed;

    return this;
  };

  BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
    if (this.precomputed && this.precomputed.doubles)
      return this.precomputed.doubles;

    var doubles = [ this ];
    var acc = this;
    for (var i = 0; i < power; i += step) {
      for (var j = 0; j < step; j++)
        acc = acc.dbl();
      doubles.push(acc);
    }
    return {
      step: step,
      points: doubles
    };
  };

  BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
    if (this.precomputed && this.precomputed.naf)
      return this.precomputed.naf;

    var res = [ this ];
    var max = (1 << wnd) - 1;
    var dbl = max === 1 ? null : this.dbl();
    for (var i = 1; i < max; i++)
      res[i] = res[i - 1].add(dbl);
    return {
      wnd: wnd,
      points: res
    };
  };

  BasePoint.prototype._getBeta = function _getBeta() {
    return null;
  };

  BasePoint.prototype.dblp = function dblp(k) {
    var r = this;
    for (var i = 0; i < k; i++)
      r = r.dbl();
    return r;
  };

},{"../../elliptic":1,"bn.js":13}],3:[function(require,module,exports){
  'use strict';

  var curve = require('../curve');
  var elliptic = require('../../elliptic');
  var bn = require('bn.js');
  var inherits = require('inherits');
  var Base = curve.base;

  var assert = elliptic.utils.assert;

  function EdwardsCurve(conf) {
    // NOTE: Important as we are creating point in Base.call()
    this.twisted = (conf.a | 0) !== 1;
    this.mOneA = this.twisted && (conf.a | 0) === -1;
    this.extended = this.mOneA;

    Base.call(this, 'edwards', conf);

    this.a = new bn(conf.a, 16).mod(this.red.m).toRed(this.red);
    this.c = new bn(conf.c, 16).toRed(this.red);
    this.c2 = this.c.redSqr();
    this.d = new bn(conf.d, 16).toRed(this.red);
    this.dd = this.d.redAdd(this.d);

    assert(!this.twisted || this.c.fromRed().cmpn(1) === 0);
    this.oneC = (conf.c | 0) === 1;
  }
  inherits(EdwardsCurve, Base);
  module.exports = exporter.ECDH.EdwardsCurve = EdwardsCurve;

  EdwardsCurve.prototype._mulA = function _mulA(num) {
    if (this.mOneA)
      return num.redNeg();
    else
      return this.a.redMul(num);
  };

  EdwardsCurve.prototype._mulC = function _mulC(num) {
    if (this.oneC)
      return num;
    else
      return this.c.redMul(num);
  };

  // Just for compatibility with Short curve
  EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
    return this.point(x, y, z, t);
  };

  EdwardsCurve.prototype.pointFromX = function pointFromX(odd, x) {
    x = new bn(x, 16);
    if (!x.red)
      x = x.toRed(this.red);

    var x2 = x.redSqr();
    var rhs = this.c2.redSub(this.a.redMul(x2));
    var lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2));

    var y = rhs.redMul(lhs.redInvm()).redSqrt();
    var isOdd = y.fromRed().isOdd();
    if (odd && !isOdd || !odd && isOdd)
      y = y.redNeg();

    return this.point(x, y, curve.one);
  };

  EdwardsCurve.prototype.validate = function validate(point) {
    if (point.isInfinity())
      return true;

    // Curve: A * X^2 + Y^2 = C^2 * (1 + D * X^2 * Y^2)
    point.normalize();

    var x2 = point.x.redSqr();
    var y2 = point.y.redSqr();
    var lhs = x2.redMul(this.a).redAdd(y2);
    var rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));

    return lhs.cmp(rhs) === 0;
  };

  function Point(curve, x, y, z, t) {
    Base.BasePoint.call(this, curve, 'projective');
    if (x === null && y === null && z === null) {
      this.x = this.curve.zero;
      this.y = this.curve.one;
      this.z = this.curve.one;
      this.t = this.curve.zero;
      this.zOne = true;
    } else {
      this.x = new bn(x, 16);
      this.y = new bn(y, 16);
      this.z = z ? new bn(z, 16) : this.curve.one;
      this.t = t && new bn(t, 16);
      if (!this.x.red)
        this.x = this.x.toRed(this.curve.red);
      if (!this.y.red)
        this.y = this.y.toRed(this.curve.red);
      if (!this.z.red)
        this.z = this.z.toRed(this.curve.red);
      if (this.t && !this.t.red)
        this.t = this.t.toRed(this.curve.red);
      this.zOne = this.z === this.curve.one;

      // Use extended coordinates
      if (this.curve.extended && !this.t) {
        this.t = this.x.redMul(this.y);
        if (!this.zOne)
          this.t = this.t.redMul(this.z.redInvm());
      }
    }
  }
  inherits(Point, Base.BasePoint);
  exporter.ECDH.Point = Point;

  EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
    return Point.fromJSON(this, obj);
  };

  EdwardsCurve.prototype.point = function point(x, y, z, t) {
    return new Point(this, x, y, z, t);
  };

  Point.fromJSON = function fromJSON(curve, obj) {
    return new Point(curve, obj[0], obj[1], obj[2]);
  };

  Point.prototype.inspect = function inspect() {
    if (this.isInfinity())
      return '<EC Point Infinity>';
    return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
        ' y: ' + this.y.fromRed().toString(16, 2) +
        ' z: ' + this.z.fromRed().toString(16, 2) + '>';
  };

  Point.prototype.isInfinity = function isInfinity() {
    // XXX This code assumes that zero is always zero in red
    return this.x.cmpn(0) === 0 &&
        this.y.cmp(this.z) === 0;
  };

  Point.prototype._extDbl = function _extDbl() {
    // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
    //     #doubling-dbl-2008-hwcd
    // 4M + 4S

    // A = X1^2
    var a = this.x.redSqr();
    // B = Y1^2
    var b = this.y.redSqr();
    // C = 2 * Z1^2
    var c = this.z.redSqr();
    c = c.redIAdd(c);
    // D = a * A
    var d = this.curve._mulA(a);
    // E = (X1 + Y1)^2 - A - B
    var e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);
    // G = D + B
    var g = d.redAdd(b);
    // F = G - C
    var f = g.redSub(c);
    // H = D - B
    var h = d.redSub(b);
    // X3 = E * F
    var nx = e.redMul(f);
    // Y3 = G * H
    var ny = g.redMul(h);
    // T3 = E * H
    var nt = e.redMul(h);
    // Z3 = F * G
    var nz = f.redMul(g);
    return this.curve.point(nx, ny, nz, nt);
  };

  Point.prototype._projDbl = function _projDbl() {
    // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
    //     #doubling-dbl-2008-bbjlp
    //     #doubling-dbl-2007-bl
    // and others
    // Generally 3M + 4S or 2M + 4S

    // B = (X1 + Y1)^2
    var b = this.x.redAdd(this.y).redSqr();
    // C = X1^2
    var c = this.x.redSqr();
    // D = Y1^2
    var d = this.y.redSqr();

    var nx;
    var ny;
    var nz;
    if (this.curve.twisted) {
      // E = a * C
      var e = this.curve._mulA(c);
      // F = E + D
      var f = e.redAdd(d);
      if (this.zOne) {
        // X3 = (B - C - D) * (F - 2)
        nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));
        // Y3 = F * (E - D)
        ny = f.redMul(e.redSub(d));
        // Z3 = F^2 - 2 * F
        nz = f.redSqr().redSub(f).redSub(f);
      } else {
        // H = Z1^2
        var h = this.z.redSqr();
        // J = F - 2 * H
        var j = f.redSub(h).redISub(h);
        // X3 = (B-C-D)*J
        nx = b.redSub(c).redISub(d).redMul(j);
        // Y3 = F * (E - D)
        ny = f.redMul(e.redSub(d));
        // Z3 = F * J
        nz = f.redMul(j);
      }
    } else {
      // E = C + D
      var e = c.redAdd(d);
      // H = (c * Z1)^2
      var h = this.curve._mulC(this.c.redMul(this.z)).redSqr();
      // J = E - 2 * H
      var j = e.redSub(h).redSub(h);
      // X3 = c * (B - E) * J
      nx = this.curve._mulC(b.redISub(e)).redMul(j);
      // Y3 = c * E * (C - D)
      ny = this.curve._mulC(e).redMul(c.redISub(d));
      // Z3 = E * J
      nz = e.redMul(j);
    }
    return this.curve.point(nx, ny, nz);
  };

  Point.prototype.dbl = function dbl() {
    if (this.isInfinity())
      return this;

    // Double in extended coordinates
    if (this.curve.extended)
      return this._extDbl();
    else
      return this._projDbl();
  };

  Point.prototype._extAdd = function _extAdd(p) {
    // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
    //     #addition-add-2008-hwcd-3
    // 8M

    // A = (Y1 - X1) * (Y2 - X2)
    var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x));
    // B = (Y1 + X1) * (Y2 + X2)
    var b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));
    // C = T1 * k * T2
    var c = this.t.redMul(this.curve.dd).redMul(p.t);
    // D = Z1 * 2 * Z2
    var d = this.z.redMul(p.z.redAdd(p.z));
    // E = B - A
    var e = b.redSub(a);
    // F = D - C
    var f = d.redSub(c);
    // G = D + C
    var g = d.redAdd(c);
    // H = B + A
    var h = b.redAdd(a);
    // X3 = E * F
    var nx = e.redMul(f);
    // Y3 = G * H
    var ny = g.redMul(h);
    // T3 = E * H
    var nt = e.redMul(h);
    // Z3 = F * G
    var nz = f.redMul(g);
    return this.curve.point(nx, ny, nz, nt);
  };

  Point.prototype._projAdd = function _projAdd(p) {
    // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
    //     #addition-add-2008-bbjlp
    //     #addition-add-2007-bl
    // 10M + 1S

    // A = Z1 * Z2
    var a = this.z.redMul(p.z);
    // B = A^2
    var b = a.redSqr();
    // C = X1 * X2
    var c = this.x.redMul(p.x);
    // D = Y1 * Y2
    var d = this.y.redMul(p.y);
    // E = d * C * D
    var e = this.curve.d.redMul(c).redMul(d);
    // F = B - E
    var f = b.redSub(e);
    // G = B + E
    var g = b.redAdd(e);
    // X3 = A * F * ((X1 + Y1) * (X2 + Y2) - C - D)
    var tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);
    var nx = a.redMul(f).redMul(tmp);
    var ny;
    var nz;
    if (this.curve.twisted) {
      // Y3 = A * G * (D - a * C)
      ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));
      // Z3 = F * G
      nz = f.redMul(g);
    } else {
      // Y3 = A * G * (D - C)
      ny = a.redMul(g).redMul(d.redSub(c));
      // Z3 = c * F * G
      nz = this.curve._mulC(f).redMul(g);
    }
    return this.curve.point(nx, ny, nz);
  };

  Point.prototype.add = function add(p) {
    if (this.isInfinity())
      return p;
    if (p.isInfinity())
      return this;

    if (this.curve.extended)
      return this._extAdd(p);
    else
      return this._projAdd(p);
  };

  Point.prototype.mul = function mul(k) {
    if (this.precomputed && this.precomputed.doubles)
      return this.curve._fixedNafMul(this, k);
    else
      return this.curve._wnafMul(this, k);
  };

  Point.prototype.mulAdd = function mulAdd(k1, p, k2) {
    return this.curve._wnafMulAdd(1, [ this, p ], [ k1, k2 ], 2);
  };

  Point.prototype.normalize = function normalize() {
    if (this.zOne)
      return this;

    // Normalize coordinates
    var zi = this.z.redInvm();
    this.x = this.x.redMul(zi);
    this.y = this.y.redMul(zi);
    if (this.t)
      this.t = this.t.redMul(zi);
    this.z = this.curve.one;
    this.zOne = true;
    return this;
  };

  Point.prototype.neg = function neg() {
    return this.curve.point(this.x.redNeg(),
        this.y,
        this.z,
        this.t && this.t.redNeg());
  };

  Point.prototype.getX = function getX() {
    this.normalize();
    return this.x.fromRed();
  };

  Point.prototype.getY = function getY() {
    this.normalize();
    return this.y.fromRed();
  };

  // Compatibility with BaseCurve
  Point.prototype.toP = Point.prototype.normalize;
  Point.prototype.mixedAdd = Point.prototype.add;

},{"../../elliptic":1,"../curve":4,"bn.js":13,"inherits":21}],4:[function(require,module,exports){
  'use strict';

  var curve = exports;

  curve.base = require('./base');
  curve.short = require('./short');
  curve.mont = require('./mont');
  curve.edwards = require('./edwards');

},{"./base":2,"./edwards":3,"./mont":5,"./short":6}],5:[function(require,module,exports){
  'use strict';

  var curve = require('../curve');
  var bn = require('bn.js');
  var inherits = require('inherits');
  var Base = curve.base;

  function MontCurve(conf) {
    Base.call(this, 'mont', conf);

    this.a = new bn(conf.a, 16).toRed(this.red);
    this.b = new bn(conf.b, 16).toRed(this.red);
    this.i4 = new bn(4).toRed(this.red).redInvm();
    this.two = new bn(2).toRed(this.red);
    this.a24 = this.i4.redMul(this.a.redAdd(this.two));
  }
  inherits(MontCurve, Base);
  module.exports = exporter.ECDH.MontCurve = MontCurve;

  MontCurve.prototype.validate = function validate(point) {
    var x = point.normalize().x;
    var x2 = x.redSqr();
    var rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);
    var y = rhs.redSqrt();

    return y.redSqr().cmp(rhs) === 0;
  };

  function Point(curve, x, z) {
    Base.BasePoint.call(this, curve, 'projective');
    if (x === null && z === null) {
      this.x = this.curve.one;
      this.z = this.curve.zero;
    } else {
      this.x = new bn(x, 16);
      this.z = new bn(z, 16);
      if (!this.x.red)
        this.x = this.x.toRed(this.curve.red);
      if (!this.z.red)
        this.z = this.z.toRed(this.curve.red);
    }
  }
  inherits(Point, Base.BasePoint);

  MontCurve.prototype.point = function point(x, z) {
    return new Point(this, x, z);
  };

  MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
    return Point.fromJSON(this, obj);
  };

  Point.prototype.precompute = function precompute() {
    // No-op
  };

  Point.fromJSON = function fromJSON(curve, obj) {
    return new Point(curve, obj[0], obj[1] || curve.one);
  };

  Point.prototype.inspect = function inspect() {
    if (this.isInfinity())
      return '<EC Point Infinity>';
    return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
        ' z: ' + this.z.fromRed().toString(16, 2) + '>';
  };

  Point.prototype.isInfinity = function isInfinity() {
    // XXX This code assumes that zero is always zero in red
    return this.z.cmpn(0) === 0;
  };

  Point.prototype.dbl = function dbl() {
    // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#doubling-dbl-1987-m-3
    // 2M + 2S + 4A

    // A = X1 + Z1
    var a = this.x.redAdd(this.z);
    // AA = A^2
    var aa = a.redSqr();
    // B = X1 - Z1
    var b = this.x.redSub(this.z);
    // BB = B^2
    var bb = b.redSqr();
    // C = AA - BB
    var c = aa.redSub(bb);
    // X3 = AA * BB
    var nx = aa.redMul(bb);
    // Z3 = C * (BB + A24 * C)
    var nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
    return this.curve.point(nx, nz);
  };

  Point.prototype.add = function add() {
    throw new Error('Not supported on Montgomery curve');
  };

  Point.prototype.diffAdd = function diffAdd(p, diff) {
    // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#diffadd-dadd-1987-m-3
    // 4M + 2S + 6A

    // A = X2 + Z2
    var a = this.x.redAdd(this.z);
    // B = X2 - Z2
    var b = this.x.redSub(this.z);
    // C = X3 + Z3
    var c = p.x.redAdd(p.z);
    // D = X3 - Z3
    var d = p.x.redSub(p.z);
    // DA = D * A
    var da = d.redMul(a);
    // CB = C * B
    var cb = c.redMul(b);
    // X5 = Z1 * (DA + CB)^2
    var nx = diff.z.redMul(da.redAdd(cb).redSqr());
    // Z5 = X1 * (DA - CB)^2
    var nz = diff.x.redMul(da.redISub(cb).redSqr());
    return this.curve.point(nx, nz);
  };

  Point.prototype.mul = function mul(k) {
    var t = k.clone();
    var a = this; // (N / 2) * Q + Q
    var b = this.curve.point(null, null); // (N / 2) * Q
    var c = this; // Q

    for (var bits = []; t.cmpn(0) !== 0; t.ishrn(1))
      bits.push(t.andln(1));

    for (var i = bits.length - 1; i >= 0; i--) {
      if (bits[i] === 0) {
        // N * Q + Q = ((N / 2) * Q + Q)) + (N / 2) * Q
        a = a.diffAdd(b, c);
        // N * Q = 2 * ((N / 2) * Q + Q))
        b = b.dbl();
      } else {
        // N * Q = ((N / 2) * Q + Q) + ((N / 2) * Q)
        b = a.diffAdd(b, c);
        // N * Q + Q = 2 * ((N / 2) * Q + Q)
        a = a.dbl();
      }
    }
    return b;
  };

  Point.prototype.mulAdd = function mulAdd() {
    throw new Error('Not supported on Montgomery curve');
  };

  Point.prototype.normalize = function normalize() {
    this.x = this.x.redMul(this.z.redInvm());
    this.z = this.curve.one;
    return this;
  };

  Point.prototype.getX = function getX() {
    // Normalize coordinates
    this.normalize();

    return this.x.fromRed();
  };

},{"../curve":4,"bn.js":13,"inherits":21}],6:[function(require,module,exports){
  'use strict';

  var curve = require('../curve');
  var elliptic = require('../../elliptic');
  var bn = require('bn.js');
  var inherits = require('inherits');
  var Base = curve.base;

  var assert = elliptic.utils.assert;

  function ShortCurve(conf) {
    Base.call(this, 'short', conf);

    this.a = new bn(conf.a, 16).toRed(this.red);
    this.b = new bn(conf.b, 16).toRed(this.red);
    this.tinv = this.two.redInvm();

    this.zeroA = this.a.fromRed().cmpn(0) === 0;
    this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;

    // If the curve is endomorphic, precalculate beta and lambda
    this.endo = this._getEndomorphism(conf);
    this._endoWnafT1 = new Array(4);
    this._endoWnafT2 = new Array(4);
  }
  inherits(ShortCurve, Base);
  module.exports = exporter.ECDH.ShortCurve = ShortCurve;

  ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
    // No efficient endomorphism
    if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)
      return;

    // Compute beta and lambda, that lambda * P = (beta * Px; Py)
    var beta;
    var lambda;
    if (conf.beta) {
      beta = new bn(conf.beta, 16).toRed(this.red);
    } else {
      var betas = this._getEndoRoots(this.p);
      // Choose the smallest beta
      beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
      beta = beta.toRed(this.red);
    }
    if (conf.lambda) {
      lambda = new bn(conf.lambda, 16);
    } else {
      // Choose the lambda that is matching selected beta
      var lambdas = this._getEndoRoots(this.n);
      if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
        lambda = lambdas[0];
      } else {
        lambda = lambdas[1];
        assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
      }
    }

    // Get basis vectors, used for balanced length-two representation
    var basis;
    if (conf.basis) {
      basis = conf.basis.map(function(vec) {
        return {
          a: new bn(vec.a, 16),
          b: new bn(vec.b, 16)
        };
      });
    } else {
      basis = this._getEndoBasis(lambda);
    }

    return {
      beta: beta,
      lambda: lambda,
      basis: basis
    };
  };

  ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
    // Find roots of for x^2 + x + 1 in F
    // Root = (-1 +- Sqrt(-3)) / 2
    //
    var red = num === this.p ? this.red : bn.mont(num);
    var tinv = new bn(2).toRed(red).redInvm();
    var ntinv = tinv.redNeg();

    var s = new bn(3).toRed(red).redNeg().redSqrt().redMul(tinv);

    var l1 = ntinv.redAdd(s).fromRed();
    var l2 = ntinv.redSub(s).fromRed();
    return [ l1, l2 ];
  };

  ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
    // aprxSqrt >= sqrt(this.n)
    var aprxSqrt = this.n.shrn(Math.floor(this.n.bitLength() / 2));

    // 3.74
    // Run EGCD, until r(L + 1) < aprxSqrt
    var u = lambda;
    var v = this.n.clone();
    var x1 = new bn(1);
    var y1 = new bn(0);
    var x2 = new bn(0);
    var y2 = new bn(1);

    // NOTE: all vectors are roots of: a + b * lambda = 0 (mod n)
    var a0;
    var b0;
    // First vector
    var a1;
    var b1;
    // Second vector
    var a2;
    var b2;

    var prevR;
    var i = 0;
    var r;
    var x;
    while (u.cmpn(0) !== 0) {
      var q = v.div(u);
      r = v.sub(q.mul(u));
      x = x2.sub(q.mul(x1));
      var y = y2.sub(q.mul(y1));

      if (!a1 && r.cmp(aprxSqrt) < 0) {
        a0 = prevR.neg();
        b0 = x1;
        a1 = r.neg();
        b1 = x;
      } else if (a1 && ++i === 2) {
        break;
      }
      prevR = r;

      v = u;
      u = r;
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = y;
    }
    a2 = r.neg();
    b2 = x;

    var len1 = a1.sqr().add(b1.sqr());
    var len2 = a2.sqr().add(b2.sqr());
    if (len2.cmp(len1) >= 0) {
      a2 = a0;
      b2 = b0;
    }

    // Normalize signs
    if (a1.sign) {
      a1 = a1.neg();
      b1 = b1.neg();
    }
    if (a2.sign) {
      a2 = a2.neg();
      b2 = b2.neg();
    }

    return [
      { a: a1, b: b1 },
      { a: a2, b: b2 }
    ];
  };

  ShortCurve.prototype._endoSplit = function _endoSplit(k) {
    var basis = this.endo.basis;
    var v1 = basis[0];
    var v2 = basis[1];

    var c1 = v2.b.mul(k).divRound(this.n);
    var c2 = v1.b.neg().mul(k).divRound(this.n);

    var p1 = c1.mul(v1.a);
    var p2 = c2.mul(v2.a);
    var q1 = c1.mul(v1.b);
    var q2 = c2.mul(v2.b);

    // Calculate answer
    var k1 = k.sub(p1).sub(p2);
    var k2 = q1.add(q2).neg();
    return { k1: k1, k2: k2 };
  };

  ShortCurve.prototype.pointFromX = function pointFromX(odd, x) {
    x = new bn(x, 16);
    if (!x.red)
      x = x.toRed(this.red);

    var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
    var y = y2.redSqrt();

    // XXX Is there any way to tell if the number is odd without converting it
    // to non-red form?
    var isOdd = y.fromRed().isOdd();
    if (odd && !isOdd || !odd && isOdd)
      y = y.redNeg();

    return this.point(x, y);
  };

  ShortCurve.prototype.validate = function validate(point) {
    if (point.inf)
      return true;

    var x = point.x;
    var y = point.y;

    var ax = this.a.redMul(x);
    var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
    return y.redSqr().redISub(rhs).cmpn(0) === 0;
  };

  ShortCurve.prototype._endoWnafMulAdd =
      function _endoWnafMulAdd(points, coeffs) {
        var npoints = this._endoWnafT1;
        var ncoeffs = this._endoWnafT2;
        for (var i = 0; i < points.length; i++) {
          var split = this._endoSplit(coeffs[i]);
          var p = points[i];
          var beta = p._getBeta();

          if (split.k1.sign) {
            split.k1.sign = !split.k1.sign;
            p = p.neg(true);
          }
          if (split.k2.sign) {
            split.k2.sign = !split.k2.sign;
            beta = beta.neg(true);
          }

          npoints[i * 2] = p;
          npoints[i * 2 + 1] = beta;
          ncoeffs[i * 2] = split.k1;
          ncoeffs[i * 2 + 1] = split.k2;
        }
        var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2);

        // Clean-up references to points and coefficients
        for (var j = 0; j < i * 2; j++) {
          npoints[j] = null;
          ncoeffs[j] = null;
        }
        return res;
      };

  function Point(curve, x, y, isRed) {
    Base.BasePoint.call(this, curve, 'affine');
    if (x === null && y === null) {
      this.x = null;
      this.y = null;
      this.inf = true;
    } else {
      this.x = new bn(x, 16);
      this.y = new bn(y, 16);
      // Force redgomery representation when loading from JSON
      if (isRed) {
        this.x.forceRed(this.curve.red);
        this.y.forceRed(this.curve.red);
      }
      if (!this.x.red)
        this.x = this.x.toRed(this.curve.red);
      if (!this.y.red)
        this.y = this.y.toRed(this.curve.red);
      this.inf = false;
    }
  }
  inherits(Point, Base.BasePoint);

  ShortCurve.prototype.point = function point(x, y, isRed) {
    return new Point(this, x, y, isRed);
  };

  ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
    return Point.fromJSON(this, obj, red);
  };

  Point.prototype._getBeta = function _getBeta() {
    if (!this.curve.endo)
      return;

    var pre = this.precomputed;
    if (pre && pre.beta)
      return pre.beta;

    var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
    if (pre) {
      var curve = this.curve;
      var endoMul = function(p) {
        return curve.point(p.x.redMul(curve.endo.beta), p.y);
      };
      pre.beta = beta;
      beta.precomputed = {
        beta: null,
        naf: pre.naf && {
          wnd: pre.naf.wnd,
          points: pre.naf.points.map(endoMul)
        },
        doubles: pre.doubles && {
          step: pre.doubles.step,
          points: pre.doubles.points.map(endoMul)
        }
      };
    }
    return beta;
  };

  // Point.prototype.toJSON = function toJSON() {
  //   if (!this.precomputed)
  //     return [ this.x, this.y ];

  //   return [ this.x, this.y, this.precomputed && {
  //     doubles: this.precomputed.doubles && {
  //       step: this.precomputed.doubles.step,
  //       points: this.precomputed.doubles.points.slice(1)
  //     },
  //     naf: this.precomputed.naf && {
  //       wnd: this.precomputed.naf.wnd,
  //       points: this.precomputed.naf.points.slice(1)
  //     }
  //   } ];
  // };

  Point.fromJSON = function fromJSON(curve, obj, red) {
    if (typeof obj === 'string')
      obj = JSON.parse(obj);
    var res = curve.point(obj[0], obj[1], red);
    if (!obj[2])
      return res;

    function obj2point(obj) {
      return curve.point(obj[0], obj[1], red);
    }

    var pre = obj[2];
    res.precomputed = {
      beta: null,
      doubles: pre.doubles && {
        step: pre.doubles.step,
        points: [ res ].concat(pre.doubles.points.map(obj2point))
      },
      naf: pre.naf && {
        wnd: pre.naf.wnd,
        points: [ res ].concat(pre.naf.points.map(obj2point))
      }
    };
    return res;
  };

  Point.prototype.inspect = function inspect() {
    if (this.isInfinity())
      return '<EC Point Infinity>';
    return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
        ' y: ' + this.y.fromRed().toString(16, 2) + '>';
  };

  Point.prototype.isInfinity = function isInfinity() {
    return this.inf;
  };

  Point.prototype.add = function add(p) {
    // O + P = P
    if (this.inf)
      return p;

    // P + O = P
    if (p.inf)
      return this;

    // P + P = 2P
    if (this.eq(p))
      return this.dbl();

    // P + (-P) = O
    if (this.neg().eq(p))
      return this.curve.point(null, null);

    // P + Q = O
    if (this.x.cmp(p.x) === 0)
      return this.curve.point(null, null);

    var c = this.y.redSub(p.y);
    if (c.cmpn(0) !== 0)
      c = c.redMul(this.x.redSub(p.x).redInvm());
    var nx = c.redSqr().redISub(this.x).redISub(p.x);
    var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
    return this.curve.point(nx, ny);
  };

  Point.prototype.dbl = function dbl() {
    if (this.inf)
      return this;

    // 2P = O
    var ys1 = this.y.redAdd(this.y);
    if (ys1.cmpn(0) === 0)
      return this.curve.point(null, null);

    var a = this.curve.a;

    var x2 = this.x.redSqr();
    var dyinv = ys1.redInvm();
    var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);

    var nx = c.redSqr().redISub(this.x.redAdd(this.x));
    var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
    return this.curve.point(nx, ny);
  };

  Point.prototype.getX = function getX() {
    return this.x.fromRed();
  };

  Point.prototype.getY = function getY() {
    return this.y.fromRed();
  };

  Point.prototype.mul = function mul(k) {
    k = new bn(k, 16);

    if (this.precomputed && this.precomputed.doubles)
      return this.curve._fixedNafMul(this, k);
    else if (this.curve.endo)
      return this.curve._endoWnafMulAdd([ this ], [ k ]);
    else
      return this.curve._wnafMul(this, k);
  };

  Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
    var points = [ this, p2 ];
    var coeffs = [ k1, k2 ];
    if (this.curve.endo)
      return this.curve._endoWnafMulAdd(points, coeffs);
    else
      return this.curve._wnafMulAdd(1, points, coeffs, 2);
  };

  Point.prototype.eq = function eq(p) {
    return this === p ||
        this.inf === p.inf &&
        (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
  };

  Point.prototype.neg = function neg(_precompute) {
    if (this.inf)
      return this;

    var res = this.curve.point(this.x, this.y.redNeg());
    if (_precompute && this.precomputed) {
      var pre = this.precomputed;
      var negate = function(p) {
        return p.neg();
      };
      res.precomputed = {
        naf: pre.naf && {
          wnd: pre.naf.wnd,
          points: pre.naf.points.map(negate)
        },
        doubles: pre.doubles && {
          step: pre.doubles.step,
          points: pre.doubles.points.map(negate)
        }
      };
    }
    return res;
  };

  Point.prototype.toJ = function toJ() {
    if (this.inf)
      return this.curve.jpoint(null, null, null);

    var res = this.curve.jpoint(this.x, this.y, this.curve.one);
    return res;
  };

  function JPoint(curve, x, y, z) {
    Base.BasePoint.call(this, curve, 'jacobian');
    if (x === null && y === null && z === null) {
      this.x = this.curve.one;
      this.y = this.curve.one;
      this.z = new bn(0);
    } else {
      this.x = new bn(x, 16);
      this.y = new bn(y, 16);
      this.z = new bn(z, 16);
    }
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.y.red)
      this.y = this.y.toRed(this.curve.red);
    if (!this.z.red)
      this.z = this.z.toRed(this.curve.red);

    this.zOne = this.z === this.curve.one;
  }
  inherits(JPoint, Base.BasePoint);

  ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
    return new JPoint(this, x, y, z);
  };

  JPoint.prototype.toP = function toP() {
    if (this.isInfinity())
      return this.curve.point(null, null);

    var zinv = this.z.redInvm();
    var zinv2 = zinv.redSqr();
    var ax = this.x.redMul(zinv2);
    var ay = this.y.redMul(zinv2).redMul(zinv);

    return this.curve.point(ax, ay);
  };

  JPoint.prototype.neg = function neg() {
    return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
  };

  JPoint.prototype.add = function add(p) {
    // O + P = P
    if (this.isInfinity())
      return p;

    // P + O = P
    if (p.isInfinity())
      return this;

    // 12M + 4S + 7A
    var pz2 = p.z.redSqr();
    var z2 = this.z.redSqr();
    var u1 = this.x.redMul(pz2);
    var u2 = p.x.redMul(z2);
    var s1 = this.y.redMul(pz2.redMul(p.z));
    var s2 = p.y.redMul(z2.redMul(this.z));

    var h = u1.redSub(u2);
    var r = s1.redSub(s2);
    if (h.cmpn(0) === 0) {
      if (r.cmpn(0) !== 0)
        return this.curve.jpoint(null, null, null);
      else
        return this.dbl();
    }

    var h2 = h.redSqr();
    var h3 = h2.redMul(h);
    var v = u1.redMul(h2);

    var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
    var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
    var nz = this.z.redMul(p.z).redMul(h);

    return this.curve.jpoint(nx, ny, nz);
  };

  JPoint.prototype.mixedAdd = function mixedAdd(p) {
    // O + P = P
    if (this.isInfinity())
      return p.toJ();

    // P + O = P
    if (p.isInfinity())
      return this;

    // 8M + 3S + 7A
    var z2 = this.z.redSqr();
    var u1 = this.x;
    var u2 = p.x.redMul(z2);
    var s1 = this.y;
    var s2 = p.y.redMul(z2).redMul(this.z);

    var h = u1.redSub(u2);
    var r = s1.redSub(s2);
    if (h.cmpn(0) === 0) {
      if (r.cmpn(0) !== 0)
        return this.curve.jpoint(null, null, null);
      else
        return this.dbl();
    }

    var h2 = h.redSqr();
    var h3 = h2.redMul(h);
    var v = u1.redMul(h2);

    var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
    var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
    var nz = this.z.redMul(h);

    return this.curve.jpoint(nx, ny, nz);
  };

  JPoint.prototype.dblp = function dblp(pow) {
    if (pow === 0)
      return this;
    if (this.isInfinity())
      return this;
    if (!pow)
      return this.dbl();

    if (this.curve.zeroA || this.curve.threeA) {
      var r = this;
      for (var i = 0; i < pow; i++)
        r = r.dbl();
      return r;
    }

    // 1M + 2S + 1A + N * (4S + 5M + 8A)
    // N = 1 => 6M + 6S + 9A
    var a = this.curve.a;
    var tinv = this.curve.tinv;

    var jx = this.x;
    var jy = this.y;
    var jz = this.z;
    var jz4 = jz.redSqr().redSqr();

    // Reuse results
    var jyd = jy.redAdd(jy);
    for (var i = 0; i < pow; i++) {
      var jx2 = jx.redSqr();
      var jyd2 = jyd.redSqr();
      var jyd4 = jyd2.redSqr();
      var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

      var t1 = jx.redMul(jyd2);
      var nx = c.redSqr().redISub(t1.redAdd(t1));
      var t2 = t1.redISub(nx);
      var dny = c.redMul(t2);
      dny = dny.redIAdd(dny).redISub(jyd4);
      var nz = jyd.redMul(jz);
      if (i + 1 < pow)
        jz4 = jz4.redMul(jyd4);

      jx = nx;
      jz = nz;
      jyd = dny;
    }

    return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
  };

  JPoint.prototype.dbl = function dbl() {
    if (this.isInfinity())
      return this;

    if (this.curve.zeroA)
      return this._zeroDbl();
    else if (this.curve.threeA)
      return this._threeDbl();
    else
      return this._dbl();
  };

  JPoint.prototype._zeroDbl = function _zeroDbl() {
    var nx;
    var ny;
    var nz;
    // Z = 1
    if (this.zOne) {
      // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
      //     #doubling-mdbl-2007-bl
      // 1M + 5S + 14A

      // XX = X1^2
      var xx = this.x.redSqr();
      // YY = Y1^2
      var yy = this.y.redSqr();
      // YYYY = YY^2
      var yyyy = yy.redSqr();
      // S = 2 * ((X1 + YY)^2 - XX - YYYY)
      var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
      s = s.redIAdd(s);
      // M = 3 * XX + a; a = 0
      var m = xx.redAdd(xx).redIAdd(xx);
      // T = M ^ 2 - 2*S
      var t = m.redSqr().redISub(s).redISub(s);

      // 8 * YYYY
      var yyyy8 = yyyy.redIAdd(yyyy);
      yyyy8 = yyyy8.redIAdd(yyyy8);
      yyyy8 = yyyy8.redIAdd(yyyy8);

      // X3 = T
      nx = t;
      // Y3 = M * (S - T) - 8 * YYYY
      ny = m.redMul(s.redISub(t)).redISub(yyyy8);
      // Z3 = 2*Y1
      nz = this.y.redAdd(this.y);
    } else {
      // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
      //     #doubling-dbl-2009-l
      // 2M + 5S + 13A

      // A = X1^2
      var a = this.x.redSqr();
      // B = Y1^2
      var b = this.y.redSqr();
      // C = B^2
      var c = b.redSqr();
      // D = 2 * ((X1 + B)^2 - A - C)
      var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
      d = d.redIAdd(d);
      // E = 3 * A
      var e = a.redAdd(a).redIAdd(a);
      // F = E^2
      var f = e.redSqr();

      // 8 * C
      var c8 = c.redIAdd(c);
      c8 = c8.redIAdd(c8);
      c8 = c8.redIAdd(c8);

      // X3 = F - 2 * D
      nx = f.redISub(d).redISub(d);
      // Y3 = E * (D - X3) - 8 * C
      ny = e.redMul(d.redISub(nx)).redISub(c8);
      // Z3 = 2 * Y1 * Z1
      nz = this.y.redMul(this.z);
      nz = nz.redIAdd(nz);
    }

    return this.curve.jpoint(nx, ny, nz);
  };

  JPoint.prototype._threeDbl = function _threeDbl() {
    var nx;
    var ny;
    var nz;
    // Z = 1
    if (this.zOne) {
      // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html
      //     #doubling-mdbl-2007-bl
      // 1M + 5S + 15A

      // XX = X1^2
      var xx = this.x.redSqr();
      // YY = Y1^2
      var yy = this.y.redSqr();
      // YYYY = YY^2
      var yyyy = yy.redSqr();
      // S = 2 * ((X1 + YY)^2 - XX - YYYY)
      var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
      s = s.redIAdd(s);
      // M = 3 * XX + a
      var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);
      // T = M^2 - 2 * S
      var t = m.redSqr().redISub(s).redISub(s);
      // X3 = T
      nx = t;
      // Y3 = M * (S - T) - 8 * YYYY
      var yyyy8 = yyyy.redIAdd(yyyy);
      yyyy8 = yyyy8.redIAdd(yyyy8);
      yyyy8 = yyyy8.redIAdd(yyyy8);
      ny = m.redMul(s.redISub(t)).redISub(yyyy8);
      // Z3 = 2 * Y1
      nz = this.y.redAdd(this.y);
    } else {
      // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-dbl-2001-b
      // 3M + 5S

      // delta = Z1^2
      var delta = this.z.redSqr();
      // gamma = Y1^2
      var gamma = this.y.redSqr();
      // beta = X1 * gamma
      var beta = this.x.redMul(gamma);
      // alpha = 3 * (X1 - delta) * (X1 + delta)
      var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
      alpha = alpha.redAdd(alpha).redIAdd(alpha);
      // X3 = alpha^2 - 8 * beta
      var beta4 = beta.redIAdd(beta);
      beta4 = beta4.redIAdd(beta4);
      var beta8 = beta4.redAdd(beta4);
      nx = alpha.redSqr().redISub(beta8);
      // Z3 = (Y1 + Z1)^2 - gamma - delta
      nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
      // Y3 = alpha * (4 * beta - X3) - 8 * gamma^2
      var ggamma8 = gamma.redSqr();
      ggamma8 = ggamma8.redIAdd(ggamma8);
      ggamma8 = ggamma8.redIAdd(ggamma8);
      ggamma8 = ggamma8.redIAdd(ggamma8);
      ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
    }

    return this.curve.jpoint(nx, ny, nz);
  };

  JPoint.prototype._dbl = function _dbl() {
    var a = this.curve.a;

    // 4M + 6S + 10A
    var jx = this.x;
    var jy = this.y;
    var jz = this.z;
    var jz4 = jz.redSqr().redSqr();

    var jx2 = jx.redSqr();
    var jy2 = jy.redSqr();

    var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

    var jxd4 = jx.redAdd(jx);
    jxd4 = jxd4.redIAdd(jxd4);
    var t1 = jxd4.redMul(jy2);
    var nx = c.redSqr().redISub(t1.redAdd(t1));
    var t2 = t1.redISub(nx);

    var jyd8 = jy2.redSqr();
    jyd8 = jyd8.redIAdd(jyd8);
    jyd8 = jyd8.redIAdd(jyd8);
    jyd8 = jyd8.redIAdd(jyd8);
    var ny = c.redMul(t2).redISub(jyd8);
    var nz = jy.redAdd(jy).redMul(jz);

    return this.curve.jpoint(nx, ny, nz);
  };

  JPoint.prototype.trpl = function trpl() {
    if (!this.curve.zeroA)
      return this.dbl().add(this);

    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#tripling-tpl-2007-bl
    // 5M + 10S + ...

    // XX = X1^2
    var xx = this.x.redSqr();
    // YY = Y1^2
    var yy = this.y.redSqr();
    // ZZ = Z1^2
    var zz = this.z.redSqr();
    // YYYY = YY^2
    var yyyy = yy.redSqr();
    // M = 3 * XX + a * ZZ2; a = 0
    var m = xx.redAdd(xx).redIAdd(xx);
    // MM = M^2
    var mm = m.redSqr();
    // E = 6 * ((X1 + YY)^2 - XX - YYYY) - MM
    var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
    e = e.redIAdd(e);
    e = e.redAdd(e).redIAdd(e);
    e = e.redISub(mm);
    // EE = E^2
    var ee = e.redSqr();
    // T = 16*YYYY
    var t = yyyy.redIAdd(yyyy);
    t = t.redIAdd(t);
    t = t.redIAdd(t);
    t = t.redIAdd(t);
    // U = (M + E)^2 - MM - EE - T
    var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);
    // X3 = 4 * (X1 * EE - 4 * YY * U)
    var yyu4 = yy.redMul(u);
    yyu4 = yyu4.redIAdd(yyu4);
    yyu4 = yyu4.redIAdd(yyu4);
    var nx = this.x.redMul(ee).redISub(yyu4);
    nx = nx.redIAdd(nx);
    nx = nx.redIAdd(nx);
    // Y3 = 8 * Y1 * (U * (T - U) - E * EE)
    var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
    ny = ny.redIAdd(ny);
    ny = ny.redIAdd(ny);
    ny = ny.redIAdd(ny);
    // Z3 = (Z1 + E)^2 - ZZ - EE
    var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);

    return this.curve.jpoint(nx, ny, nz);
  };

  JPoint.prototype.mul = function mul(k, kbase) {
    k = new bn(k, kbase);

    return this.curve._wnafMul(this, k);
  };

  JPoint.prototype.eq = function eq(p) {
    if (p.type === 'affine')
      return this.eq(p.toJ());

    if (this === p)
      return true;

    // x1 * z2^2 == x2 * z1^2
    var z2 = this.z.redSqr();
    var pz2 = p.z.redSqr();
    if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0)
      return false;

    // y1 * z2^3 == y2 * z1^3
    var z3 = z2.redMul(this.z);
    var pz3 = pz2.redMul(p.z);
    return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
  };

  JPoint.prototype.inspect = function inspect() {
    if (this.isInfinity())
      return '<EC JPoint Infinity>';
    return '<EC JPoint x: ' + this.x.toString(16, 2) +
        ' y: ' + this.y.toString(16, 2) +
        ' z: ' + this.z.toString(16, 2) + '>';
  };

  JPoint.prototype.isInfinity = function isInfinity() {
    // XXX This code assumes that zero is always zero in red
    return this.z.cmpn(0) === 0;
  };

},{"../../elliptic":1,"../curve":4,"bn.js":13,"inherits":21}],7:[function(require,module,exports){
  'use strict';

  var curves = exports;

  var hash = require('hash.js');
  var elliptic = require('../elliptic');

  var assert = elliptic.utils.assert;

  function PresetCurve(options) {
    if (options.type === 'short')
      this.curve = new elliptic.curve.short(options);
    else if (options.type === 'edwards')
      this.curve = new elliptic.curve.edwards(options);
    else
      this.curve = new elliptic.curve.mont(options);
    this.g = this.curve.g;
    this.n = this.curve.n;
    this.hash = options.hash;

    assert(this.g.validate(), 'Invalid curve');
    assert(this.g.mul(this.n).isInfinity(), 'Invalid curve, G*N != O');
  }
  curves.PresetCurve = exporter.ECDH.PresetCurve = PresetCurve;

  function defineCurve(name, options) {
    Object.defineProperty(curves, name, {
      configurable: true,
      enumerable: true,
      get: function() {
        var curve = new PresetCurve(options);
        Object.defineProperty(curves, name, {
          configurable: true,
          enumerable: true,
          value: curve
        });
        return curve;
      }
    });
  }

  defineCurve('p192', {
    type: 'short',
    prime: 'p192',
    p: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',
    a: 'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',
    b: '64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',
    n: 'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',
    hash: hash.sha256,
    gRed: false,
    g: [
      '188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012',
      '07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811'
    ]
  });

  defineCurve('p224', {
    type: 'short',
    prime: 'p224',
    p: 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001',
    a: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe',
    b: 'b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4',
    n: 'ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d',
    hash: hash.sha256,
    gRed: false,
    g: [
      'b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21',
      'bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34'
    ]
  });

  defineCurve('p256', {
    type: 'short',
    prime: null,
    p: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff',
    a: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc',
    b: '5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b',
    n: 'ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551',
    hash: hash.sha256,
    gRed: false,
    g: [
      '6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296',
      '4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5'
    ]
  });

  defineCurve('curve25519', {
    type: 'mont',
    prime: 'p25519',
    p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
    a: '76d06',
    b: '0',
    n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
    hash: hash.sha256,
    gRed: false,
    g: [
      '9'
    ]
  });

  defineCurve('ed25519', {
    type: 'edwards',
    prime: 'p25519',
    p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
    a: '-1',
    c: '1',
    // -121665 * (121666^(-1)) (mod P)
    d: '52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3',
    n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
    hash: hash.sha256,
    gRed: false,
    g: [
      '216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',

      // 4/5
      '6666666666666666666666666666666666666666666666666666666666666658'
    ]
  });

  var pre;
  try {
    pre = require('./precomputed/secp256k1');
  } catch (e) {
    pre = undefined;
  }

  defineCurve('secp256k1', {
    type: 'short',
    prime: 'k256',
    p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',
    a: '0',
    b: '7',
    n: 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141',
    h: '1',
    hash: hash.sha256,

    // Precomputed endomorphism
    beta: '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee',
    lambda: '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72',
    basis: [
      {
        a: '3086d221a7d46bcde86c90e49284eb15',
        b: '-e4437ed6010e88286f547fa90abfe4c3'
      },
      {
        a: '114ca50f7a8e2f3f657c1108d9d44cfd8',
        b: '3086d221a7d46bcde86c90e49284eb15'
      }
    ],

    gRed: false,
    g: [
      '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
      pre
    ]
  });

},{"../elliptic":1,"./precomputed/secp256k1":undefined,"hash.js":15}],8:[function(require,module,exports){
  'use strict';

  var bn = require('bn.js');
  var elliptic = require('../../elliptic');
  var utils = elliptic.utils;
  var assert = utils.assert;

  var KeyPair = require('./key');
  var Signature = require('./signature');

  function EC(options) {
    if (!(this instanceof EC))
      return new EC(options);

    // Shortcut `elliptic.ec(curve-name)`
    if (typeof options === 'string') {
      assert(elliptic.curves.hasOwnProperty(options), 'Unknown curve ' + options);

      options = elliptic.curves[options];
    }

    // Shortcut for `elliptic.ec(elliptic.curves.curveName)`
    if (options instanceof elliptic.curves.PresetCurve)
      options = { curve: options };

    this.curve = options.curve.curve;
    this.n = this.curve.n;
    this.nh = this.n.shrn(1);
    this.g = this.curve.g;

    // Point on curve
    this.g = options.curve.g;
    this.g.precompute(options.curve.n.bitLength() + 1);

    // Hash for function for DRBG
    this.hash = options.hash || options.curve.hash;
  }
  module.exports = exporter.ECDH.EC = EC;

  EC.prototype.keyPair = function keyPair(options) {
    return new KeyPair(this, options);
  };

  EC.prototype.keyFromPrivate = function keyFromPrivate(priv, enc) {
    return KeyPair.fromPrivate(this, priv, enc);
  };

  EC.prototype.keyFromPublic = function keyFromPublic(pub, enc) {
    return KeyPair.fromPublic(this, pub, enc);
  };

  EC.prototype.genKeyPair = function genKeyPair(options) {
    if (!options)
      options = {};

    // Instantiate Hmac_DRBG
    var drbg = new elliptic.hmacDRBG({
      hash: this.hash,
      pers: options.pers,
      entropy: options.entropy || elliptic.rand(this.hash.hmacStrength),
      nonce: this.n.toArray()
    });

    var bytes = this.n.byteLength();
    var ns2 = this.n.sub(new bn(2));
    do {
      var priv = new bn(drbg.generate(bytes));
      if (priv.cmp(ns2) > 0)
        continue;

      priv.iaddn(1);
      return this.keyFromPrivate(priv);
    } while (true);
  };

  EC.prototype._truncateToN = function truncateToN(msg, truncOnly) {
    var delta = msg.byteLength() * 8 - this.n.bitLength();
    if (delta > 0)
      msg = msg.shrn(delta);
    if (!truncOnly && msg.cmp(this.n) >= 0)
      return msg.sub(this.n);
    else
      return msg;
  };

  EC.prototype.sign = function sign(msg, key, enc, options) {
    if (typeof enc === 'object') {
      options = enc;
      enc = null;
    }
    if (!options)
      options = {};

    key = this.keyFromPrivate(key, enc);
    msg = this._truncateToN(new bn(msg, 16));

    // Zero-extend key to provide enough entropy
    var bytes = this.n.byteLength();
    var bkey = key.getPrivate().toArray();
    for (var i = bkey.length; i < 21; i++)
      bkey.unshift(0);

    // Zero-extend nonce to have the same byte size as N
    var nonce = msg.toArray();
    for (var i = nonce.length; i < bytes; i++)
      nonce.unshift(0);

    // Instantiate Hmac_DRBG
    var drbg = new elliptic.hmacDRBG({
      hash: this.hash,
      entropy: bkey,
      nonce: nonce
    });

    // Number of bytes to generate
    var ns1 = this.n.sub(new bn(1));
    do {
      var k = new bn(drbg.generate(this.n.byteLength()));
      k = this._truncateToN(k, true);
      if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0)
        continue;

      var kp = this.g.mul(k);
      if (kp.isInfinity())
        continue;

      var r = kp.getX().mod(this.n);
      if (r.cmpn(0) === 0)
        continue;

      var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg)).mod(this.n);
      if (s.cmpn(0) === 0)
        continue;

      // Use complement of `s`, if it is > `n / 2`
      if (options.canonical && s.cmp(this.nh) > 0)
        s = this.n.sub(s);

      return new Signature({ r: r, s: s });
    } while (true);
  };

  EC.prototype.verify = function verify(msg, signature, key, enc) {
    msg = this._truncateToN(new bn(msg, 16));
    key = this.keyFromPublic(key, enc);
    signature = new Signature(signature, 'hex');

    // Perform primitive values validation
    var r = signature.r;
    var s = signature.s;
    if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0)
      return false;
    if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0)
      return false;

    // Validate signature
    var sinv = s.invm(this.n);
    var u1 = sinv.mul(msg).mod(this.n);
    var u2 = sinv.mul(r).mod(this.n);

    var p = this.g.mulAdd(u1, key.getPublic(), u2);
    if (p.isInfinity())
      return false;

    return p.getX().mod(this.n).cmp(r) === 0;
  };

},{"../../elliptic":1,"./key":9,"./signature":10,"bn.js":13}],9:[function(require,module,exports){
  'use strict';

  var bn = require('bn.js');

  var elliptic = require('../../elliptic');
  var utils = elliptic.utils;

  function KeyPair(ec, options) {
    this.ec = ec;
    this.priv = null;
    this.pub = null;

    // KeyPair(ec, { priv: ..., pub: ... })
    if (options.priv)
      this._importPrivate(options.priv, options.privEnc);
    if (options.pub)
      this._importPublic(options.pub, options.pubEnc);
  }
  module.exports = exporter.ECDH.KeyPair = KeyPair;

  KeyPair.fromPublic = function fromPublic(ec, pub, enc) {
    if (pub instanceof KeyPair)
      return pub;

    return new KeyPair(ec, {
      pub: pub,
      pubEnc: enc
    });
  };

  KeyPair.fromPrivate = function fromPrivate(ec, priv, enc) {
    if (priv instanceof KeyPair)
      return priv;

    return new KeyPair(ec, {
      priv: priv,
      privEnc: enc
    });
  };

  KeyPair.prototype.validate = function validate() {
    var pub = this.getPublic();

    if (pub.isInfinity())
      return { result: false, reason: 'Invalid public key' };
    if (!pub.validate())
      return { result: false, reason: 'Public key is not a point' };
    if (!pub.mul(this.ec.curve.n).isInfinity())
      return { result: false, reason: 'Public key * N != O' };

    return { result: true, reason: null };
  };

  KeyPair.prototype.getPublic = function getPublic(compact, enc) {
    if (!this.pub)
      this.pub = this.ec.g.mul(this.priv);

    // compact is optional argument
    if (typeof compact === 'string') {
      enc = compact;
      compact = null;
    }

    if (!enc)
      return this.pub;

    var len = this.ec.curve.p.byteLength();
    var x = this.pub.getX().toArray();

    for (var i = x.length; i < len; i++)
      x.unshift(0);

    var res;
    if (this.ec.curve.type !== 'mont') {
      if (compact) {
        res = [ this.pub.getY().isEven() ? 0x02 : 0x03 ].concat(x);
      } else {
        var y = this.pub.getY().toArray();
        for (var i = y.length; i < len; i++)
          y.unshift(0);
        var res = [ 0x04 ].concat(x, y);
      }
    } else {
      res = x;
    }

    return utils.encode(res, enc);
  };

  KeyPair.prototype.getPrivate = function getPrivate(enc) {
    if (enc === 'hex')
      return this.priv.toString(16, 2);
    else
      return this.priv;
  };

  KeyPair.prototype._importPrivate = function _importPrivate(key, enc) {
    this.priv = new bn(key, enc || 16);

    // Ensure that the priv won't be bigger than n, otherwise we may fail
    // in fixed multiplication method
    this.priv = this.priv.mod(this.ec.curve.n);
  };

  KeyPair.prototype._importPublic = function _importPublic(key, enc) {
    if (key.x || key.y) {
      this.pub = this.ec.curve.point(key.x, key.y);
      return;
    }

    key = utils.toArray(key, enc);
    if (this.ec.curve.type !== 'mont')
      return this._importPublicShort(key);
    else
      return this._importPublicMont(key);
  };

  KeyPair.prototype._importPublicShort = function _importPublicShort(key) {
    var len = this.ec.curve.p.byteLength();
    if (key[0] === 0x04 && key.length - 1 === 2 * len) {
      this.pub = this.ec.curve.point(
          key.slice(1, 1 + len),
          key.slice(1 + len, 1 + 2 * len));
    } else if ((key[0] === 0x02 || key[0] === 0x03) && key.length - 1 === len) {
      this.pub = this.ec.curve.pointFromX(key[0] === 0x03, key.slice(1, 1 + len));
    }
  };

  KeyPair.prototype._importPublicMont = function _importPublicMont(key) {
    this.pub = this.ec.curve.point(key, 1);
  };

  // ECDH
  KeyPair.prototype.derive = function derive(pub) {
    return pub.mul(this.priv).getX();
  };

  // ECDSA
  KeyPair.prototype.sign = function sign(msg) {
    return this.ec.sign(msg, this);
  };

  KeyPair.prototype.verify = function verify(msg, signature) {
    return this.ec.verify(msg, signature, this);
  };

  KeyPair.prototype.inspect = function inspect() {
    return '<Key priv: ' + (this.priv && this.priv.toString(16, 2)) +
        ' pub: ' + (this.pub && this.pub.inspect()) + ' >';
  };

},{"../../elliptic":1,"bn.js":13}],10:[function(require,module,exports){
  'use strict';

  var bn = require('bn.js');

  var elliptic = require('../../elliptic');
  var utils = elliptic.utils;
  var assert = utils.assert;

  function Signature(options, enc) {
    if (options instanceof Signature)
      return options;

    if (this._importDER(options, enc))
      return;

    assert(options.r && options.s, 'Signature without r or s');
    this.r = new bn(options.r, 16);
    this.s = new bn(options.s, 16);
  }
  module.exports = exporter.ECDH.Signature = Signature;

  Signature.prototype._importDER = function _importDER(data, enc) {
    data = utils.toArray(data, enc);
    if (data.length < 6 || data[0] !== 0x30 || data[2] !== 0x02)
      return false;
    var total = data[1];
    if (1 + total > data.length)
      return false;
    var rlen = data[3];
    // Short length notation
    if (rlen >= 0x80)
      return false;
    if (4 + rlen + 2 >= data.length)
      return false;
    if (data[4 + rlen] !== 0x02)
      return false;
    var slen = data[5 + rlen];
    // Short length notation
    if (slen >= 0x80)
      return false;
    if (4 + rlen + 2 + slen > data.length)
      return false;

    this.r = new bn(data.slice(4, 4 + rlen));
    this.s = new bn(data.slice(4 + rlen + 2, 4 + rlen + 2 + slen));

    return true;
  };

  Signature.prototype.toDER = function toDER(enc) {
    var r = this.r.toArray();
    var s = this.s.toArray();

    // Pad values
    if (r[0] & 0x80)
      r = [ 0 ].concat(r);
    // Pad values
    if (s[0] & 0x80)
      s = [ 0 ].concat(s);

    var total = r.length + s.length + 4;
    var res = [ 0x30, total, 0x02, r.length ];
    res = res.concat(r, [ 0x02, s.length ], s);
    return utils.encode(res, enc);
  };

},{"../../elliptic":1,"bn.js":13}],11:[function(require,module,exports){
  'use strict';

  var hash = require('hash.js');
  var elliptic = require('../elliptic');
  var utils = elliptic.utils;
  var assert = utils.assert;

  function HmacDRBG(options) {
    if (!(this instanceof HmacDRBG))
      return new HmacDRBG(options);
    this.hash = options.hash;
    this.predResist = !!options.predResist;

    this.outLen = this.hash.outSize;
    this.minEntropy = options.minEntropy || this.hash.hmacStrength;

    this.reseed = null;
    this.reseedInterval = null;
    this.K = null;
    this.V = null;

    var entropy = utils.toArray(options.entropy, options.entropyEnc);
    var nonce = utils.toArray(options.nonce, options.nonceEnc);
    var pers = utils.toArray(options.pers, options.persEnc);
    assert(entropy.length >= (this.minEntropy / 8),
        'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
    this._init(entropy, nonce, pers);
  }
  module.exports = exporter.ECDH.HmacDRBG = HmacDRBG;

  HmacDRBG.prototype._init = function init(entropy, nonce, pers) {
    var seed = entropy.concat(nonce).concat(pers);

    this.K = new Array(this.outLen / 8);
    this.V = new Array(this.outLen / 8);
    for (var i = 0; i < this.V.length; i++) {
      this.K[i] = 0x00;
      this.V[i] = 0x01;
    }

    this._update(seed);
    this.reseed = 1;
    this.reseedInterval = 0x1000000000000;  // 2^48
  };

  HmacDRBG.prototype._hmac = function hmac() {
    return new hash.hmac(this.hash, this.K);
  };

  HmacDRBG.prototype._update = function update(seed) {
    var kmac = this._hmac()
        .update(this.V)
        .update([ 0x00 ]);
    if (seed)
      kmac = kmac.update(seed);
    this.K = kmac.digest();
    this.V = this._hmac().update(this.V).digest();
    if (!seed)
      return;

    this.K = this._hmac()
        .update(this.V)
        .update([ 0x01 ])
        .update(seed)
        .digest();
    this.V = this._hmac().update(this.V).digest();
  };

  HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
    // Optional entropy enc
    if (typeof entropyEnc !== 'string') {
      addEnc = add;
      add = entropyEnc;
      entropyEnc = null;
    }

    entropy = utils.toBuffer(entropy, entropyEnc);
    add = utils.toBuffer(add, addEnc);

    assert(entropy.length >= (this.minEntropy / 8),
        'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');

    this._update(entropy.concat(add || []));
    this.reseed = 1;
  };

  HmacDRBG.prototype.generate = function generate(len, enc, add, addEnc) {
    if (this.reseed > this.reseedInterval)
      throw new Error('Reseed is required');

    // Optional encoding
    if (typeof enc !== 'string') {
      addEnc = add;
      add = enc;
      enc = null;
    }

    // Optional additional data
    if (add) {
      add = utils.toArray(add, addEnc);
      this._update(add);
    }

    var temp = [];
    while (temp.length < len) {
      this.V = this._hmac().update(this.V).digest();
      temp = temp.concat(this.V);
    }

    var res = temp.slice(0, len);
    this._update(add);
    this.reseed++;
    return utils.encode(res, enc);
  };

},{"../elliptic":1,"hash.js":15}],12:[function(require,module,exports){
  'use strict';

  var utils = exports;

  utils.assert = function assert(val, msg) {
    if (!val)
      throw new Error(msg || 'Assertion failed');
  };

  function toArray(msg, enc) {
    if (Array.isArray(msg))
      return msg.slice();
    if (!msg)
      return [];
    var res = [];
    if (typeof msg !== 'string') {
      for (var i = 0; i < msg.length; i++)
        res[i] = msg[i] | 0;
      return res;
    }
    if (!enc) {
      for (var i = 0; i < msg.length; i++) {
        var c = msg.charCodeAt(i);
        var hi = c >> 8;
        var lo = c & 0xff;
        if (hi)
          res.push(hi, lo);
        else
          res.push(lo);
      }
    } else if (enc === 'hex') {
      msg = msg.replace(/[^a-z0-9]+/ig, '');
      if (msg.length % 2 !== 0)
        msg = '0' + msg;
      for (var i = 0; i < msg.length; i += 2)
        res.push(parseInt(msg[i] + msg[i + 1], 16));
    }
    return res;
  }
  utils.toArray = toArray;

  function zero2(word) {
    if (word.length === 1)
      return '0' + word;
    else
      return word;
  }
  utils.zero2 = zero2;

  function toHex(msg) {
    var res = '';
    for (var i = 0; i < msg.length; i++)
      res += zero2(msg[i].toString(16));
    return res;
  }
  utils.toHex = toHex;

  utils.encode = function encode(arr, enc) {
    if (enc === 'hex')
      return toHex(arr);
    else
      return arr;
  };

  // Represent num in a w-NAF form
  function getNAF(num, w) {
    var naf = [];
    var ws = 1 << (w + 1);
    var k = num.clone();
    while (k.cmpn(1) >= 0) {
      var z;
      if (k.isOdd()) {
        var mod = k.andln(ws - 1);
        if (mod > (ws >> 1) - 1)
          z = (ws >> 1) - mod;
        else
          z = mod;
        k.isubn(z);
      } else {
        z = 0;
      }
      naf.push(z);

      // Optimization, shift by word if possible
      var shift = (k.cmpn(0) !== 0 && k.andln(ws - 1) === 0) ? (w + 1) : 1;
      for (var i = 1; i < shift; i++)
        naf.push(0);
      k.ishrn(shift);
    }

    return naf;
  }
  utils.getNAF = getNAF;

  // Represent k1, k2 in a Joint Sparse Form
  function getJSF(k1, k2) {
    var jsf = [
      [],
      []
    ];

    k1 = k1.clone();
    k2 = k2.clone();
    var d1 = 0;
    var d2 = 0;
    while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {

      // First phase
      var m14 = (k1.andln(3) + d1) & 3;
      var m24 = (k2.andln(3) + d2) & 3;
      if (m14 === 3)
        m14 = -1;
      if (m24 === 3)
        m24 = -1;
      var u1;
      if ((m14 & 1) === 0) {
        u1 = 0;
      } else {
        var m8 = (k1.andln(7) + d1) & 7;
        if ((m8 === 3 || m8 === 5) && m24 === 2)
          u1 = -m14;
        else
          u1 = m14;
      }
      jsf[0].push(u1);

      var u2;
      if ((m24 & 1) === 0) {
        u2 = 0;
      } else {
        var m8 = (k2.andln(7) + d2) & 7;
        if ((m8 === 3 || m8 === 5) && m14 === 2)
          u2 = -m24;
        else
          u2 = m24;
      }
      jsf[1].push(u2);

      // Second phase
      if (2 * d1 === u1 + 1)
        d1 = 1 - d1;
      if (2 * d2 === u2 + 1)
        d2 = 1 - d2;
      k1.ishrn(1);
      k2.ishrn(1);
    }

    return jsf;
  }
  utils.getJSF = getJSF;

},{}],13:[function(require,module,exports){
  (function (module, exports) {

    'use strict';

    // Utils

    function assert(val, msg) {
      if (!val)
        throw new Error(msg || 'Assertion failed');
    }

    // Could use `inherits` module, but don't want to move from single file
    // architecture yet.
    function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }

    // BN

    function BN(number, base, endian) {
      // May be `new BN(bn)` ?
      if (number !== null &&
          typeof number === 'object' &&
          Array.isArray(number.words)) {
        return number;
      }

      this.sign = false;
      this.words = null;
      this.length = 0;

      // Reduction context
      this.red = null;

      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      if (number !== null)
        this._init(number || 0, base || 10, endian || 'be');
    }
    if (typeof module === 'object')
      module.exports = BN;
    else
      exports.BN = BN;
    exporter.ECDH.BN = BN;

    BN.BN = BN;
    BN.wordSize = 26;

    BN.prototype._init = function init(number, base, endian) {
      if (typeof number === 'number') {
        if (number < 0) {
          this.sign = true;
          number = -number;
        }
        if (number < 0x4000000) {
          this.words = [ number & 0x3ffffff ];
          this.length = 1;
        } else {
          this.words = [
            number & 0x3ffffff,
            (number / 0x4000000) & 0x3ffffff
          ];
          this.length = 2;
        }
        return;
      } else if (typeof number === 'object') {
        return this._initArray(number, base, endian);
      }
      if (base === 'hex')
        base = 16;
      assert(base === (base | 0) && base >= 2 && base <= 36);

      number = number.toString().replace(/\s+/g, '');
      var start = 0;
      if (number[0] === '-')
        start++;

      if (base === 16)
        this._parseHex(number, start);
      else
        this._parseBase(number, base, start);

      if (number[0] === '-')
        this.sign = true;

      this.strip();
    };

    BN.prototype._initArray = function _initArray(number, base, endian) {
      // Perhaps a Uint8Array
      assert(typeof number.length === 'number');
      this.length = Math.ceil(number.length / 3);
      this.words = new Array(this.length);
      for (var i = 0; i < this.length; i++)
        this.words[i] = 0;

      var off = 0;
      if (endian === 'be') {
        for (var i = number.length - 1, j = 0; i >= 0; i -= 3) {
          var w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      } else if (endian === 'le') {
        for (var i = 0, j = 0; i < number.length; i += 3) {
          var w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      }
      return this.strip();
    };

    function parseHex(str, start, end) {
      var r = 0;
      var len = Math.min(str.length, end);
      for (var i = start; i < len; i++) {
        var c = str.charCodeAt(i) - 48;

        r <<= 4;

        // 'a' - 'f'
        if (c >= 49 && c <= 54)
          r |= c - 49 + 0xa;

        // 'A' - 'F'
        else if (c >= 17 && c <= 22)
          r |= c - 17 + 0xa;

        // '0' - '9'
        else
          r |= c & 0xf;
      }
      return r;
    }

    BN.prototype._parseHex = function _parseHex(number, start) {
      // Create possibly bigger array to ensure that it fits the number
      this.length = Math.ceil((number.length - start) / 6);
      this.words = new Array(this.length);
      for (var i = 0; i < this.length; i++)
        this.words[i] = 0;

      // Scan 24-bit chunks and add them to the number
      var off = 0;
      for (var i = number.length - 6, j = 0; i >= start; i -= 6) {
        var w = parseHex(number, i, i + 6);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
      if (i + 6 !== start) {
        var w = parseHex(number, start, i + 6);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
      }
      this.strip();
    };

    function parseBase(str, start, end, mul) {
      var r = 0;
      var len = Math.min(str.length, end);
      for (var i = start; i < len; i++) {
        var c = str.charCodeAt(i) - 48;

        r *= mul;

        // 'a'
        if (c >= 49)
          r += c - 49 + 0xa;

        // 'A'
        else if (c >= 17)
          r += c - 17 + 0xa;

        // '0' - '9'
        else
          r += c;
      }
      return r;
    }

    BN.prototype._parseBase = function _parseBase(number, base, start) {
      // Initialize as zero
      this.words = [ 0 ];
      this.length = 1;

      // Find length of limb in base
      for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base)
        limbLen++;
      limbLen--;
      limbPow = (limbPow / base) | 0;

      var total = number.length - start;
      var mod = total % limbLen;
      var end = Math.min(total, total - mod) + start;

      var word = 0;
      for (var i = start; i < end; i += limbLen) {
        word = parseBase(number, i, i + limbLen, base);

        this.imuln(limbPow);
        if (this.words[0] + word < 0x4000000)
          this.words[0] += word;
        else
          this._iaddn(word);
      }

      if (mod !== 0) {
        var pow = 1;
        var word = parseBase(number, i, number.length, base);

        for (var i = 0; i < mod; i++)
          pow *= base;
        this.imuln(pow);
        if (this.words[0] + word < 0x4000000)
          this.words[0] += word;
        else
          this._iaddn(word);
      }
    };

    BN.prototype.copy = function copy(dest) {
      dest.words = new Array(this.length);
      for (var i = 0; i < this.length; i++)
        dest.words[i] = this.words[i];
      dest.length = this.length;
      dest.sign = this.sign;
      dest.red = this.red;
    };

    BN.prototype.clone = function clone() {
      var r = new BN(null);
      this.copy(r);
      return r;
    };

    // Remove leading `0` from `this`
    BN.prototype.strip = function strip() {
      while (this.length > 1 && this.words[this.length - 1] === 0)
        this.length--;
      return this._normSign();
    };

    BN.prototype._normSign = function _normSign() {
      // -0 = 0
      if (this.length === 1 && this.words[0] === 0)
        this.sign = false;
      return this;
    };

    BN.prototype.inspect = function inspect() {
      return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
    };

    /*

     var zeros = [];
     var groupSizes = [];
     var groupBases = [];

     var s = '';
     var i = -1;
     while (++i < BN.wordSize) {
     zeros[i] = s;
     s += '0';
     }
     groupSizes[0] = 0;
     groupSizes[1] = 0;
     groupBases[0] = 0;
     groupBases[1] = 0;
     var base = 2 - 1;
     while (++base < 36 + 1) {
     var groupSize = 0;
     var groupBase = 1;
     while (groupBase < (1 << BN.wordSize) / base) {
     groupBase *= base;
     groupSize += 1;
     }
     groupSizes[base] = groupSize;
     groupBases[base] = groupBase;
     }

     */

    var zeros = [
      '',
      '0',
      '00',
      '000',
      '0000',
      '00000',
      '000000',
      '0000000',
      '00000000',
      '000000000',
      '0000000000',
      '00000000000',
      '000000000000',
      '0000000000000',
      '00000000000000',
      '000000000000000',
      '0000000000000000',
      '00000000000000000',
      '000000000000000000',
      '0000000000000000000',
      '00000000000000000000',
      '000000000000000000000',
      '0000000000000000000000',
      '00000000000000000000000',
      '000000000000000000000000',
      '0000000000000000000000000'
    ];

    var groupSizes = [
      0, 0,
      25, 16, 12, 11, 10, 9, 8,
      8, 7, 7, 7, 7, 6, 6,
      6, 6, 6, 6, 6, 5, 5,
      5, 5, 5, 5, 5, 5, 5,
      5, 5, 5, 5, 5, 5, 5
    ];

    var groupBases = [
      0, 0,
      33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
      43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
      16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
      6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
      24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
    ];

    BN.prototype.toString = function toString(base, padding) {
      base = base || 10;
      if (base === 16 || base === 'hex') {
        var out = '';
        var off = 0;
        var padding = padding | 0 || 1;
        var carry = 0;
        for (var i = 0; i < this.length; i++) {
          var w = this.words[i];
          var word = (((w << off) | carry) & 0xffffff).toString(16);
          carry = (w >>> (24 - off)) & 0xffffff;
          if (carry !== 0 || i !== this.length - 1)
            out = zeros[6 - word.length] + word + out;
          else
            out = word + out;
          off += 2;
          if (off >= 26) {
            off -= 26;
            i--;
          }
        }
        if (carry !== 0)
          out = carry.toString(16) + out;
        while (out.length % padding !== 0)
          out = '0' + out;
        if (this.sign)
          out = '-' + out;
        return out;
      } else if (base === (base | 0) && base >= 2 && base <= 36) {
        // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
        var groupSize = groupSizes[base];
        // var groupBase = Math.pow(base, groupSize);
        var groupBase = groupBases[base];
        var out = '';
        var c = this.clone();
        c.sign = false;
        while (c.cmpn(0) !== 0) {
          var r = c.modn(groupBase).toString(base);
          c = c.idivn(groupBase);

          if (c.cmpn(0) !== 0)
            out = zeros[groupSize - r.length] + r + out;
          else
            out = r + out;
        }
        if (this.cmpn(0) === 0)
          out = '0' + out;
        if (this.sign)
          out = '-' + out;
        return out;
      } else {
        assert(false, 'Base should be between 2 and 36');
      }
    };

    // BN.prototype.toJSON = function toJSON() {
    //   return this.toString(16);
    // };

    BN.prototype.toArray = function toArray() {
      this.strip();
      var res = new Array(this.byteLength());
      res[0] = 0;

      var q = this.clone();
      for (var i = 0; q.cmpn(0) !== 0; i++) {
        var b = q.andln(0xff);
        q.ishrn(8);

        // Assume big-endian
        res[res.length - i - 1] = b;
      }

      return res;
    };

    if (Math.clz32) {
      BN.prototype._countBits = function _countBits(w) {
        return 32 - Math.clz32(w);
      };
    } else {
      BN.prototype._countBits = function _countBits(w) {
        var t = w;
        var r = 0;
        if (t >= 0x1000) {
          r += 13;
          t >>>= 13;
        }
        if (t >= 0x40) {
          r += 7;
          t >>>= 7;
        }
        if (t >= 0x8) {
          r += 4;
          t >>>= 4;
        }
        if (t >= 0x02) {
          r += 2;
          t >>>= 2;
        }
        return r + t;
      };
    }

    BN.prototype._zeroBits = function _zeroBits(w) {
      // Short-cut
      if (w === 0)
        return 26;

      var t = w;
      var r = 0;
      if ((t & 0x1fff) === 0) {
        r += 13;
        t >>>= 13;
      }
      if ((t & 0x7f) === 0) {
        r += 7;
        t >>>= 7;
      }
      if ((t & 0xf) === 0) {
        r += 4;
        t >>>= 4;
      }
      if ((t & 0x3) === 0) {
        r += 2;
        t >>>= 2;
      }
      if ((t & 0x1) === 0)
        r++;
      return r;
    };

    // Return number of used bits in a BN
    BN.prototype.bitLength = function bitLength() {
      var hi = 0;
      var w = this.words[this.length - 1];
      var hi = this._countBits(w);
      return (this.length - 1) * 26 + hi;
    };

    // Number of trailing zero bits
    BN.prototype.zeroBits = function zeroBits() {
      if (this.cmpn(0) === 0)
        return 0;

      var r = 0;
      for (var i = 0; i < this.length; i++) {
        var b = this._zeroBits(this.words[i]);
        r += b;
        if (b !== 26)
          break;
      }
      return r;
    };

    BN.prototype.byteLength = function byteLength() {
      return Math.ceil(this.bitLength() / 8);
    };

    // Return negative clone of `this`
    BN.prototype.neg = function neg() {
      if (this.cmpn(0) === 0)
        return this.clone();

      var r = this.clone();
      r.sign = !this.sign;
      return r;
    };


    // Or `num` with `this` in-place
    BN.prototype.ior = function ior(num) {
      this.sign = this.sign || num.sign;

      while (this.length < num.length)
        this.words[this.length++] = 0;

      for (var i = 0; i < num.length; i++)
        this.words[i] = this.words[i] | num.words[i];

      return this.strip();
    };


    // Or `num` with `this`
    BN.prototype.or = function or(num) {
      if (this.length > num.length)
        return this.clone().ior(num);
      else
        return num.clone().ior(this);
    };


    // And `num` with `this` in-place
    BN.prototype.iand = function iand(num) {
      this.sign = this.sign && num.sign;

      // b = min-length(num, this)
      var b;
      if (this.length > num.length)
        b = num;
      else
        b = this;

      for (var i = 0; i < b.length; i++)
        this.words[i] = this.words[i] & num.words[i];

      this.length = b.length;

      return this.strip();
    };


    // And `num` with `this`
    BN.prototype.and = function and(num) {
      if (this.length > num.length)
        return this.clone().iand(num);
      else
        return num.clone().iand(this);
    };


    // Xor `num` with `this` in-place
    BN.prototype.ixor = function ixor(num) {
      this.sign = this.sign || num.sign;

      // a.length > b.length
      var a;
      var b;
      if (this.length > num.length) {
        a = this;
        b = num;
      } else {
        a = num;
        b = this;
      }

      for (var i = 0; i < b.length; i++)
        this.words[i] = a.words[i] ^ b.words[i];

      if (this !== a)
        for (; i < a.length; i++)
          this.words[i] = a.words[i];

      this.length = a.length;

      return this.strip();
    };


    // Xor `num` with `this`
    BN.prototype.xor = function xor(num) {
      if (this.length > num.length)
        return this.clone().ixor(num);
      else
        return num.clone().ixor(this);
    };


    // Set `bit` of `this`
    BN.prototype.setn = function setn(bit, val) {
      assert(typeof bit === 'number' && bit >= 0);

      var off = (bit / 26) | 0;
      var wbit = bit % 26;

      while (this.length <= off)
        this.words[this.length++] = 0;

      if (val)
        this.words[off] = this.words[off] | (1 << wbit);
      else
        this.words[off] = this.words[off] & ~(1 << wbit);

      return this.strip();
    };


    // Add `num` to `this` in-place
    BN.prototype.iadd = function iadd(num) {
      // negative + positive
      if (this.sign && !num.sign) {
        this.sign = false;
        var r = this.isub(num);
        this.sign = !this.sign;
        return this._normSign();

        // positive + negative
      } else if (!this.sign && num.sign) {
        num.sign = false;
        var r = this.isub(num);
        num.sign = true;
        return r._normSign();
      }

      // a.length > b.length
      var a;
      var b;
      if (this.length > num.length) {
        a = this;
        b = num;
      } else {
        a = num;
        b = this;
      }

      var carry = 0;
      for (var i = 0; i < b.length; i++) {
        var r = a.words[i] + b.words[i] + carry;
        this.words[i] = r & 0x3ffffff;
        carry = r >>> 26;
      }
      for (; carry !== 0 && i < a.length; i++) {
        var r = a.words[i] + carry;
        this.words[i] = r & 0x3ffffff;
        carry = r >>> 26;
      }

      this.length = a.length;
      if (carry !== 0) {
        this.words[this.length] = carry;
        this.length++;
        // Copy the rest of the words
      } else if (a !== this) {
        for (; i < a.length; i++)
          this.words[i] = a.words[i];
      }

      return this;
    };

    // Add `num` to `this`
    BN.prototype.add = function add(num) {
      if (num.sign && !this.sign) {
        num.sign = false;
        var res = this.sub(num);
        num.sign = true;
        return res;
      } else if (!num.sign && this.sign) {
        this.sign = false;
        var res = num.sub(this);
        this.sign = true;
        return res;
      }

      if (this.length > num.length)
        return this.clone().iadd(num);
      else
        return num.clone().iadd(this);
    };

    // Subtract `num` from `this` in-place
    BN.prototype.isub = function isub(num) {
      // this - (-num) = this + num
      if (num.sign) {
        num.sign = false;
        var r = this.iadd(num);
        num.sign = true;
        return r._normSign();

        // -this - num = -(this + num)
      } else if (this.sign) {
        this.sign = false;
        this.iadd(num);
        this.sign = true;
        return this._normSign();
      }

      // At this point both numbers are positive
      var cmp = this.cmp(num);

      // Optimization - zeroify
      if (cmp === 0) {
        this.sign = false;
        this.length = 1;
        this.words[0] = 0;
        return this;
      }

      // a > b
      var a;
      var b;
      if (cmp > 0) {
        a = this;
        b = num;
      } else {
        a = num;
        b = this;
      }

      var carry = 0;
      for (var i = 0; i < b.length; i++) {
        var r = a.words[i] - b.words[i] + carry;
        carry = r >> 26;
        this.words[i] = r & 0x3ffffff;
      }
      for (; carry !== 0 && i < a.length; i++) {
        var r = a.words[i] + carry;
        carry = r >> 26;
        this.words[i] = r & 0x3ffffff;
      }

      // Copy rest of the words
      if (carry === 0 && i < a.length && a !== this)
        for (; i < a.length; i++)
          this.words[i] = a.words[i];
      this.length = Math.max(this.length, i);

      if (a !== this)
        this.sign = true;

      return this.strip();
    };

    // Subtract `num` from `this`
    BN.prototype.sub = function sub(num) {
      return this.clone().isub(num);
    };

    /*
     // NOTE: This could be potentionally used to generate loop-less multiplications
     function _genCombMulTo(alen, blen) {
     var len = alen + blen - 1;
     var src = [
     'var a = this.words, b = num.words, o = out.words, c = 0, w, ' +
     'mask = 0x3ffffff, shift = 0x4000000;',
     'out.length = ' + len + ';'
     ];
     for (var k = 0; k < len; k++) {
     var minJ = Math.max(0, k - alen + 1);
     var maxJ = Math.min(k, blen - 1);

     for (var j = minJ; j <= maxJ; j++) {
     var i = k - j;
     var mul = 'a[' + i + '] * b[' + j + ']';

     if (j === minJ) {
     src.push('w = ' + mul + ' + c;');
     src.push('c = (w / shift) | 0;');
     } else {
     src.push('w += ' + mul + ';');
     src.push('c += (w / shift) | 0;');
     }
     src.push('w &= mask;');
     }
     src.push('o[' + k + '] = w;');
     }
     src.push('if (c !== 0) {',
     '  o[' + k + '] = c;',
     '  out.length++;',
     '}',
     'return out;');

     return src.join('\n');
     }
     */

    BN.prototype._smallMulTo = function _smallMulTo(num, out) {
      out.sign = num.sign !== this.sign;
      out.length = this.length + num.length;

      var carry = 0;
      for (var k = 0; k < out.length - 1; k++) {
        // Sum all words with the same `i + j = k` and accumulate `ncarry`,
        // note that ncarry could be >= 0x3ffffff
        var ncarry = carry >>> 26;
        var rword = carry & 0x3ffffff;
        var maxJ = Math.min(k, num.length - 1);
        for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
          var i = k - j;
          var a = this.words[i] | 0;
          var b = num.words[j] | 0;
          var r = a * b;

          var lo = r & 0x3ffffff;
          ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
          lo = (lo + rword) | 0;
          rword = lo & 0x3ffffff;
          ncarry = (ncarry + (lo >>> 26)) | 0;
        }
        out.words[k] = rword;
        carry = ncarry;
      }
      if (carry !== 0) {
        out.words[k] = carry;
      } else {
        out.length--;
      }

      return out.strip();
    };

    BN.prototype._bigMulTo = function _bigMulTo(num, out) {
      out.sign = num.sign !== this.sign;
      out.length = this.length + num.length;

      var carry = 0;
      var hncarry = 0;
      for (var k = 0; k < out.length - 1; k++) {
        // Sum all words with the same `i + j = k` and accumulate `ncarry`,
        // note that ncarry could be >= 0x3ffffff
        var ncarry = hncarry;
        hncarry = 0;
        var rword = carry & 0x3ffffff;
        var maxJ = Math.min(k, num.length - 1);
        for (var j = Math.max(0, k - this.length + 1); j <= maxJ; j++) {
          var i = k - j;
          var a = this.words[i] | 0;
          var b = num.words[j] | 0;
          var r = a * b;

          var lo = r & 0x3ffffff;
          ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
          lo = (lo + rword) | 0;
          rword = lo & 0x3ffffff;
          ncarry = (ncarry + (lo >>> 26)) | 0;

          hncarry += ncarry >>> 26;
          ncarry &= 0x3ffffff;
        }
        out.words[k] = rword;
        carry = ncarry;
        ncarry = hncarry;
      }
      if (carry !== 0) {
        out.words[k] = carry;
      } else {
        out.length--;
      }

      return out.strip();
    };

    BN.prototype.mulTo = function mulTo(num, out) {
      var res;
      if (this.length + num.length < 63)
        res = this._smallMulTo(num, out);
      else
        res = this._bigMulTo(num, out);
      return res;
    };

    // Multiply `this` by `num`
    BN.prototype.mul = function mul(num) {
      var out = new BN(null);
      out.words = new Array(this.length + num.length);
      return this.mulTo(num, out);
    };

    // In-place Multiplication
    BN.prototype.imul = function imul(num) {
      if (this.cmpn(0) === 0 || num.cmpn(0) === 0) {
        this.words[0] = 0;
        this.length = 1;
        return this;
      }

      var tlen = this.length;
      var nlen = num.length;

      this.sign = num.sign !== this.sign;
      this.length = this.length + num.length;
      this.words[this.length - 1] = 0;

      for (var k = this.length - 2; k >= 0; k--) {
        // Sum all words with the same `i + j = k` and accumulate `carry`,
        // note that carry could be >= 0x3ffffff
        var carry = 0;
        var rword = 0;
        var maxJ = Math.min(k, nlen - 1);
        for (var j = Math.max(0, k - tlen + 1); j <= maxJ; j++) {
          var i = k - j;
          var a = this.words[i];
          var b = num.words[j];
          var r = a * b;

          var lo = r & 0x3ffffff;
          carry += (r / 0x4000000) | 0;
          lo += rword;
          rword = lo & 0x3ffffff;
          carry += lo >>> 26;
        }
        this.words[k] = rword;
        this.words[k + 1] += carry;
        carry = 0;
      }

      // Propagate overflows
      var carry = 0;
      for (var i = 1; i < this.length; i++) {
        var w = this.words[i] + carry;
        this.words[i] = w & 0x3ffffff;
        carry = w >>> 26;
      }

      return this.strip();
    };

    BN.prototype.imuln = function imuln(num) {
      assert(typeof num === 'number');

      // Carry
      var carry = 0;
      for (var i = 0; i < this.length; i++) {
        var w = this.words[i] * num;
        var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
        carry >>= 26;
        carry += (w / 0x4000000) | 0;
        // NOTE: lo is 27bit maximum
        carry += lo >>> 26;
        this.words[i] = lo & 0x3ffffff;
      }

      if (carry !== 0) {
        this.words[i] = carry;
        this.length++;
      }

      return this;
    };

    // `this` * `this`
    BN.prototype.sqr = function sqr() {
      return this.mul(this);
    };

    // `this` * `this` in-place
    BN.prototype.isqr = function isqr() {
      return this.mul(this);
    };

    // Shift-left in-place
    BN.prototype.ishln = function ishln(bits) {
      assert(typeof bits === 'number' && bits >= 0);
      var r = bits % 26;
      var s = (bits - r) / 26;
      var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);

      if (r !== 0) {
        var carry = 0;
        for (var i = 0; i < this.length; i++) {
          var newCarry = this.words[i] & carryMask;
          var c = (this.words[i] - newCarry) << r;
          this.words[i] = c | carry;
          carry = newCarry >>> (26 - r);
        }
        if (carry) {
          this.words[i] = carry;
          this.length++;
        }
      }

      if (s !== 0) {
        for (var i = this.length - 1; i >= 0; i--)
          this.words[i + s] = this.words[i];
        for (var i = 0; i < s; i++)
          this.words[i] = 0;
        this.length += s;
      }

      return this.strip();
    };

    // Shift-right in-place
    // NOTE: `hint` is a lowest bit before trailing zeroes
    // NOTE: if `extended` is present - it will be filled with destroyed bits
    BN.prototype.ishrn = function ishrn(bits, hint, extended) {
      assert(typeof bits === 'number' && bits >= 0);
      var h;
      if (hint)
        h = (hint - (hint % 26)) / 26;
      else
        h = 0;

      var r = bits % 26;
      var s = Math.min((bits - r) / 26, this.length);
      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
      var maskedWords = extended;

      h -= s;
      h = Math.max(0, h);

      // Extended mode, copy masked part
      if (maskedWords) {
        for (var i = 0; i < s; i++)
          maskedWords.words[i] = this.words[i];
        maskedWords.length = s;
      }

      if (s === 0) {
        // No-op, we should not move anything at all
      } else if (this.length > s) {
        this.length -= s;
        for (var i = 0; i < this.length; i++)
          this.words[i] = this.words[i + s];
      } else {
        this.words[0] = 0;
        this.length = 1;
      }

      var carry = 0;
      for (var i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
        var word = this.words[i];
        this.words[i] = (carry << (26 - r)) | (word >>> r);
        carry = word & mask;
      }

      // Push carried bits as a mask
      if (maskedWords && carry !== 0)
        maskedWords.words[maskedWords.length++] = carry;

      if (this.length === 0) {
        this.words[0] = 0;
        this.length = 1;
      }

      this.strip();

      return this;
    };

    // Shift-left
    BN.prototype.shln = function shln(bits) {
      return this.clone().ishln(bits);
    };

    // Shift-right
    BN.prototype.shrn = function shrn(bits) {
      return this.clone().ishrn(bits);
    };

    // Test if n bit is set
    BN.prototype.testn = function testn(bit) {
      assert(typeof bit === 'number' && bit >= 0);
      var r = bit % 26;
      var s = (bit - r) / 26;
      var q = 1 << r;

      // Fast case: bit is much higher than all existing words
      if (this.length <= s) {
        return false;
      }

      // Check bit and return
      var w = this.words[s];

      return !!(w & q);
    };

    // Return only lowers bits of number (in-place)
    BN.prototype.imaskn = function imaskn(bits) {
      assert(typeof bits === 'number' && bits >= 0);
      var r = bits % 26;
      var s = (bits - r) / 26;

      assert(!this.sign, 'imaskn works only with positive numbers');

      if (r !== 0)
        s++;
      this.length = Math.min(s, this.length);

      if (r !== 0) {
        var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
        this.words[this.length - 1] &= mask;
      }

      return this.strip();
    };

    // Return only lowers bits of number
    BN.prototype.maskn = function maskn(bits) {
      return this.clone().imaskn(bits);
    };

    // Add plain number `num` to `this`
    BN.prototype.iaddn = function iaddn(num) {
      assert(typeof num === 'number');
      if (num < 0)
        return this.isubn(-num);

      // Possible sign change
      if (this.sign) {
        if (this.length === 1 && this.words[0] < num) {
          this.words[0] = num - this.words[0];
          this.sign = false;
          return this;
        }

        this.sign = false;
        this.isubn(num);
        this.sign = true;
        return this;
      }

      // Add without checks
      return this._iaddn(num);
    };

    BN.prototype._iaddn = function _iaddn(num) {
      this.words[0] += num;

      // Carry
      for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
        this.words[i] -= 0x4000000;
        if (i === this.length - 1)
          this.words[i + 1] = 1;
        else
          this.words[i + 1]++;
      }
      this.length = Math.max(this.length, i + 1);

      return this;
    };

    // Subtract plain number `num` from `this`
    BN.prototype.isubn = function isubn(num) {
      assert(typeof num === 'number');
      if (num < 0)
        return this.iaddn(-num);

      if (this.sign) {
        this.sign = false;
        this.iaddn(num);
        this.sign = true;
        return this;
      }

      this.words[0] -= num;

      // Carry
      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }

      return this.strip();
    };

    BN.prototype.addn = function addn(num) {
      return this.clone().iaddn(num);
    };

    BN.prototype.subn = function subn(num) {
      return this.clone().isubn(num);
    };

    BN.prototype.iabs = function iabs() {
      this.sign = false;

      return this;
    };

    BN.prototype.abs = function abs() {
      return this.clone().iabs();
    };

    BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
      // Bigger storage is needed
      var len = num.length + shift;
      var i;
      if (this.words.length < len) {
        var t = new Array(len);
        for (var i = 0; i < this.length; i++)
          t[i] = this.words[i];
        this.words = t;
      } else {
        i = this.length;
      }

      // Zeroify rest
      this.length = Math.max(this.length, len);
      for (; i < this.length; i++)
        this.words[i] = 0;

      var carry = 0;
      for (var i = 0; i < num.length; i++) {
        var w = this.words[i + shift] + carry;
        var right = num.words[i] * mul;
        w -= right & 0x3ffffff;
        carry = (w >> 26) - ((right / 0x4000000) | 0);
        this.words[i + shift] = w & 0x3ffffff;
      }
      for (; i < this.length - shift; i++) {
        var w = this.words[i + shift] + carry;
        carry = w >> 26;
        this.words[i + shift] = w & 0x3ffffff;
      }

      if (carry === 0)
        return this.strip();

      // Subtraction overflow
      assert(carry === -1);
      carry = 0;
      for (var i = 0; i < this.length; i++) {
        var w = -this.words[i] + carry;
        carry = w >> 26;
        this.words[i] = w & 0x3ffffff;
      }
      this.sign = true;

      return this.strip();
    };

    BN.prototype._wordDiv = function _wordDiv(num, mode) {
      var shift = this.length - num.length;

      var a = this.clone();
      var b = num;

      // Normalize
      var bhi = b.words[b.length - 1];
      var bhiBits = this._countBits(bhi);
      shift = 26 - bhiBits;
      if (shift !== 0) {
        b = b.shln(shift);
        a.ishln(shift);
        bhi = b.words[b.length - 1];
      }

      // Initialize quotient
      var m = a.length - b.length;
      var q;

      if (mode !== 'mod') {
        q = new BN(null);
        q.length = m + 1;
        q.words = new Array(q.length);
        for (var i = 0; i < q.length; i++)
          q.words[i] = 0;
      }

      var diff = a.clone()._ishlnsubmul(b, 1, m);
      if (!diff.sign) {
        a = diff;
        if (q)
          q.words[m] = 1;
      }

      for (var j = m - 1; j >= 0; j--) {
        var qj = a.words[b.length + j] * 0x4000000 + a.words[b.length + j - 1];

        // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
        // (0x7ffffff)
        qj = Math.min((qj / bhi) | 0, 0x3ffffff);

        a._ishlnsubmul(b, qj, j);
        while (a.sign) {
          qj--;
          a.sign = false;
          a._ishlnsubmul(b, 1, j);
          a.sign = !a.sign;
        }
        if (q)
          q.words[j] = qj;
      }
      if (q)
        q.strip();
      a.strip();

      // Denormalize
      if (mode !== 'div' && shift !== 0)
        a.ishrn(shift);
      return { div: q ? q : null, mod: a };
    };

    BN.prototype.divmod = function divmod(num, mode) {
      assert(num.cmpn(0) !== 0);

      if (this.sign && !num.sign) {
        var res = this.neg().divmod(num, mode);
        var div;
        var mod;
        if (mode !== 'mod')
          div = res.div.neg();
        if (mode !== 'div')
          mod = res.mod.cmpn(0) === 0 ? res.mod : num.sub(res.mod);
        return {
          div: div,
          mod: mod
        };
      } else if (!this.sign && num.sign) {
        var res = this.divmod(num.neg(), mode);
        var div;
        if (mode !== 'mod')
          div = res.div.neg();
        return { div: div, mod: res.mod };
      } else if (this.sign && num.sign) {
        return this.neg().divmod(num.neg(), mode);
      }

      // Both numbers are positive at this point

      // Strip both numbers to approximate shift value
      if (num.length > this.length || this.cmp(num) < 0)
        return { div: new BN(0), mod: this };

      // Very short reduction
      if (num.length === 1) {
        if (mode === 'div')
          return { div: this.divn(num.words[0]), mod: null };
        else if (mode === 'mod')
          return { div: null, mod: new BN(this.modn(num.words[0])) };
        return {
          div: this.divn(num.words[0]),
          mod: new BN(this.modn(num.words[0]))
        };
      }

      return this._wordDiv(num, mode);
    };

    // Find `this` / `num`
    BN.prototype.div = function div(num) {
      return this.divmod(num, 'div').div;
    };

    // Find `this` % `num`
    BN.prototype.mod = function mod(num) {
      return this.divmod(num, 'mod').mod;
    };

    // Find Round(`this` / `num`)
    BN.prototype.divRound = function divRound(num) {
      var dm = this.divmod(num);

      // Fast case - exact division
      if (dm.mod.cmpn(0) === 0)
        return dm.div;

      var mod = dm.div.sign ? dm.mod.isub(num) : dm.mod;

      var half = num.shrn(1);
      var r2 = num.andln(1);
      var cmp = mod.cmp(half);

      // Round down
      if (cmp < 0 || r2 === 1 && cmp === 0)
        return dm.div;

      // Round up
      return dm.div.sign ? dm.div.isubn(1) : dm.div.iaddn(1);
    };

    BN.prototype.modn = function modn(num) {
      assert(num <= 0x3ffffff);
      var p = (1 << 26) % num;

      var acc = 0;
      for (var i = this.length - 1; i >= 0; i--)
        acc = (p * acc + this.words[i]) % num;

      return acc;
    };

    // In-place division by number
    BN.prototype.idivn = function idivn(num) {
      assert(num <= 0x3ffffff);

      var carry = 0;
      for (var i = this.length - 1; i >= 0; i--) {
        var w = this.words[i] + carry * 0x4000000;
        this.words[i] = (w / num) | 0;
        carry = w % num;
      }

      return this.strip();
    };

    BN.prototype.divn = function divn(num) {
      return this.clone().idivn(num);
    };

    BN.prototype.egcd = function egcd(p) {
      assert(!p.sign);
      assert(p.cmpn(0) !== 0);

      var x = this;
      var y = p.clone();

      if (x.sign)
        x = x.mod(p);
      else
        x = x.clone();

      // A * x + B * y = x
      var A = new BN(1);
      var B = new BN(0);

      // C * x + D * y = y
      var C = new BN(0);
      var D = new BN(1);

      var g = 0;

      while (x.isEven() && y.isEven()) {
        x.ishrn(1);
        y.ishrn(1);
        ++g;
      }

      var yp = y.clone();
      var xp = x.clone();

      while (x.cmpn(0) !== 0) {
        while (x.isEven()) {
          x.ishrn(1);
          if (A.isEven() && B.isEven()) {
            A.ishrn(1);
            B.ishrn(1);
          } else {
            A.iadd(yp).ishrn(1);
            B.isub(xp).ishrn(1);
          }
        }

        while (y.isEven()) {
          y.ishrn(1);
          if (C.isEven() && D.isEven()) {
            C.ishrn(1);
            D.ishrn(1);
          } else {
            C.iadd(yp).ishrn(1);
            D.isub(xp).ishrn(1);
          }
        }

        if (x.cmp(y) >= 0) {
          x.isub(y);
          A.isub(C);
          B.isub(D);
        } else {
          y.isub(x);
          C.isub(A);
          D.isub(B);
        }
      }

      return {
        a: C,
        b: D,
        gcd: y.ishln(g)
      };
    };

    // This is reduced incarnation of the binary EEA
    // above, designated to invert members of the
    // _prime_ fields F(p) at a maximal speed
    BN.prototype._invmp = function _invmp(p) {
      assert(!p.sign);
      assert(p.cmpn(0) !== 0);

      var a = this;
      var b = p.clone();

      if (a.sign)
        a = a.mod(p);
      else
        a = a.clone();

      var x1 = new BN(1);
      var x2 = new BN(0);

      var delta = b.clone();

      while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
        while (a.isEven()) {
          a.ishrn(1);
          if (x1.isEven())
            x1.ishrn(1);
          else
            x1.iadd(delta).ishrn(1);
        }
        while (b.isEven()) {
          b.ishrn(1);
          if (x2.isEven())
            x2.ishrn(1);
          else
            x2.iadd(delta).ishrn(1);
        }
        if (a.cmp(b) >= 0) {
          a.isub(b);
          x1.isub(x2);
        } else {
          b.isub(a);
          x2.isub(x1);
        }
      }
      if (a.cmpn(1) === 0)
        return x1;
      else
        return x2;
    };

    BN.prototype.gcd = function gcd(num) {
      if (this.cmpn(0) === 0)
        return num.clone();
      if (num.cmpn(0) === 0)
        return this.clone();

      var a = this.clone();
      var b = num.clone();
      a.sign = false;
      b.sign = false;

      // Remove common factor of two
      for (var shift = 0; a.isEven() && b.isEven(); shift++) {
        a.ishrn(1);
        b.ishrn(1);
      }

      do {
        while (a.isEven())
          a.ishrn(1);
        while (b.isEven())
          b.ishrn(1);

        var r = a.cmp(b);
        if (r < 0) {
          // Swap `a` and `b` to make `a` always bigger than `b`
          var t = a;
          a = b;
          b = t;
        } else if (r === 0 || b.cmpn(1) === 0) {
          break;
        }

        a.isub(b);
      } while (true);

      return b.ishln(shift);
    };

    // Invert number in the field F(num)
    BN.prototype.invm = function invm(num) {
      return this.egcd(num).a.mod(num);
    };

    BN.prototype.isEven = function isEven() {
      return (this.words[0] & 1) === 0;
    };

    BN.prototype.isOdd = function isOdd() {
      return (this.words[0] & 1) === 1;
    };

    // And first word and num
    BN.prototype.andln = function andln(num) {
      return this.words[0] & num;
    };

    // Increment at the bit position in-line
    BN.prototype.bincn = function bincn(bit) {
      assert(typeof bit === 'number');
      var r = bit % 26;
      var s = (bit - r) / 26;
      var q = 1 << r;

      // Fast case: bit is much higher than all existing words
      if (this.length <= s) {
        for (var i = this.length; i < s + 1; i++)
          this.words[i] = 0;
        this.words[s] |= q;
        this.length = s + 1;
        return this;
      }

      // Add bit and propagate, if needed
      var carry = q;
      for (var i = s; carry !== 0 && i < this.length; i++) {
        var w = this.words[i];
        w += carry;
        carry = w >>> 26;
        w &= 0x3ffffff;
        this.words[i] = w;
      }
      if (carry !== 0) {
        this.words[i] = carry;
        this.length++;
      }
      return this;
    };

    BN.prototype.cmpn = function cmpn(num) {
      var sign = num < 0;
      if (sign)
        num = -num;

      if (this.sign && !sign)
        return -1;
      else if (!this.sign && sign)
        return 1;

      num &= 0x3ffffff;
      this.strip();

      var res;
      if (this.length > 1) {
        res = 1;
      } else {
        var w = this.words[0];
        res = w === num ? 0 : w < num ? -1 : 1;
      }
      if (this.sign)
        res = -res;
      return res;
    };

    // Compare two numbers and return:
    // 1 - if `this` > `num`
    // 0 - if `this` == `num`
    // -1 - if `this` < `num`
    BN.prototype.cmp = function cmp(num) {
      if (this.sign && !num.sign)
        return -1;
      else if (!this.sign && num.sign)
        return 1;

      var res = this.ucmp(num);
      if (this.sign)
        return -res;
      else
        return res;
    };

    // Unsigned comparison
    BN.prototype.ucmp = function ucmp(num) {
      // At this point both numbers have the same sign
      if (this.length > num.length)
        return 1;
      else if (this.length < num.length)
        return -1;

      var res = 0;
      for (var i = this.length - 1; i >= 0; i--) {
        var a = this.words[i];
        var b = num.words[i];

        if (a === b)
          continue;
        if (a < b)
          res = -1;
        else if (a > b)
          res = 1;
        break;
      }
      return res;
    };

    //
    // A reduce context, could be using montgomery or something better, depending
    // on the `m` itself.
    //
    BN.red = function red(num) {
      return new Red(num);
    };

    BN.prototype.toRed = function toRed(ctx) {
      assert(!this.red, 'Already a number in reduction context');
      assert(!this.sign, 'red works only with positives');
      return ctx.convertTo(this)._forceRed(ctx);
    };

    BN.prototype.fromRed = function fromRed() {
      assert(this.red, 'fromRed works only with numbers in reduction context');
      return this.red.convertFrom(this);
    };

    BN.prototype._forceRed = function _forceRed(ctx) {
      this.red = ctx;
      return this;
    };

    BN.prototype.forceRed = function forceRed(ctx) {
      assert(!this.red, 'Already a number in reduction context');
      return this._forceRed(ctx);
    };

    BN.prototype.redAdd = function redAdd(num) {
      assert(this.red, 'redAdd works only with red numbers');
      return this.red.add(this, num);
    };

    BN.prototype.redIAdd = function redIAdd(num) {
      assert(this.red, 'redIAdd works only with red numbers');
      return this.red.iadd(this, num);
    };

    BN.prototype.redSub = function redSub(num) {
      assert(this.red, 'redSub works only with red numbers');
      return this.red.sub(this, num);
    };

    BN.prototype.redISub = function redISub(num) {
      assert(this.red, 'redISub works only with red numbers');
      return this.red.isub(this, num);
    };

    BN.prototype.redShl = function redShl(num) {
      assert(this.red, 'redShl works only with red numbers');
      return this.red.shl(this, num);
    };

    BN.prototype.redMul = function redMul(num) {
      assert(this.red, 'redMul works only with red numbers');
      this.red._verify2(this, num);
      return this.red.mul(this, num);
    };

    BN.prototype.redIMul = function redIMul(num) {
      assert(this.red, 'redMul works only with red numbers');
      this.red._verify2(this, num);
      return this.red.imul(this, num);
    };

    BN.prototype.redSqr = function redSqr() {
      assert(this.red, 'redSqr works only with red numbers');
      this.red._verify1(this);
      return this.red.sqr(this);
    };

    BN.prototype.redISqr = function redISqr() {
      assert(this.red, 'redISqr works only with red numbers');
      this.red._verify1(this);
      return this.red.isqr(this);
    };

    // Square root over p
    BN.prototype.redSqrt = function redSqrt() {
      assert(this.red, 'redSqrt works only with red numbers');
      this.red._verify1(this);
      return this.red.sqrt(this);
    };

    BN.prototype.redInvm = function redInvm() {
      assert(this.red, 'redInvm works only with red numbers');
      this.red._verify1(this);
      return this.red.invm(this);
    };

    // Return negative clone of `this` % `red modulo`
    BN.prototype.redNeg = function redNeg() {
      assert(this.red, 'redNeg works only with red numbers');
      this.red._verify1(this);
      return this.red.neg(this);
    };

    BN.prototype.redPow = function redPow(num) {
      assert(this.red && !num.red, 'redPow(normalNum)');
      this.red._verify1(this);
      return this.red.pow(this, num);
    };

    // Prime numbers with efficient reduction
    var primes = {
      k256: null,
      p224: null,
      p192: null,
      p25519: null
    };

    // Pseudo-Mersenne prime
    function MPrime(name, p) {
      // P = 2 ^ N - K
      this.name = name;
      this.p = new BN(p, 16);
      this.n = this.p.bitLength();
      this.k = new BN(1).ishln(this.n).isub(this.p);

      this.tmp = this._tmp();
    }
    exporter.ECDH.MPrime = MPrime;

    MPrime.prototype._tmp = function _tmp() {
      var tmp = new BN(null);
      tmp.words = new Array(Math.ceil(this.n / 13));
      return tmp;
    };

    MPrime.prototype.ireduce = function ireduce(num) {
      // Assumes that `num` is less than `P^2`
      // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
      var r = num;
      var rlen;

      do {
        this.split(r, this.tmp);
        r = this.imulK(r);
        r = r.iadd(this.tmp);
        rlen = r.bitLength();
      } while (rlen > this.n);

      var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
      if (cmp === 0) {
        r.words[0] = 0;
        r.length = 1;
      } else if (cmp > 0) {
        r.isub(this.p);
      } else {
        r.strip();
      }

      return r;
    };

    MPrime.prototype.split = function split(input, out) {
      input.ishrn(this.n, 0, out);
    };

    MPrime.prototype.imulK = function imulK(num) {
      return num.imul(this.k);
    };

    function K256() {
      MPrime.call(
          this,
          'k256',
          'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
    }
    inherits(K256, MPrime);

    K256.prototype.split = function split(input, output) {
      // 256 = 9 * 26 + 22
      var mask = 0x3fffff;

      var outLen = Math.min(input.length, 9);
      for (var i = 0; i < outLen; i++)
        output.words[i] = input.words[i];
      output.length = outLen;

      if (input.length <= 9) {
        input.words[0] = 0;
        input.length = 1;
        return;
      }

      // Shift by 9 limbs
      var prev = input.words[9];
      output.words[output.length++] = prev & mask;

      for (var i = 10; i < input.length; i++) {
        var next = input.words[i];
        input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
        prev = next;
      }
      input.words[i - 10] = prev >>> 22;
      input.length -= 9;
    };

    K256.prototype.imulK = function imulK(num) {
      // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
      num.words[num.length] = 0;
      num.words[num.length + 1] = 0;
      num.length += 2;

      // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
      var hi;
      var lo = 0;
      for (var i = 0; i < num.length; i++) {
        var w = num.words[i];
        hi = w * 0x40;
        lo += w * 0x3d1;
        hi += (lo / 0x4000000) | 0;
        lo &= 0x3ffffff;

        num.words[i] = lo;

        lo = hi;
      }

      // Fast length reduction
      if (num.words[num.length - 1] === 0) {
        num.length--;
        if (num.words[num.length - 1] === 0)
          num.length--;
      }
      return num;
    };

    function P224() {
      MPrime.call(
          this,
          'p224',
          'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
    }
    inherits(P224, MPrime);

    function P192() {
      MPrime.call(
          this,
          'p192',
          'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
    }
    inherits(P192, MPrime);

    function P25519() {
      // 2 ^ 255 - 19
      MPrime.call(
          this,
          '25519',
          '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
    }
    inherits(P25519, MPrime);
    exporter.ECDH.P25519 = P25519;

    P25519.prototype.imulK = function imulK(num) {
      // K = 0x13
      var carry = 0;
      for (var i = 0; i < num.length; i++) {
        var hi = num.words[i] * 0x13 + carry;
        var lo = hi & 0x3ffffff;
        hi >>>= 26;

        num.words[i] = lo;
        carry = hi;
      }
      if (carry !== 0)
        num.words[num.length++] = carry;
      return num;
    };

    // Exported mostly for testing purposes, use plain name instead
    BN._prime = function prime(name) {
      // Cached version of prime
      if (primes[name])
        return primes[name];

      var prime;
      if (name === 'k256')
        prime = new K256();
      else if (name === 'p224')
        prime = new P224();
      else if (name === 'p192')
        prime = new P192();
      else if (name === 'p25519')
        prime = new P25519();
      else
        throw new Error('Unknown prime ' + name);
      primes[name] = prime;

      return prime;
    };

    //
    // Base reduction engine
    //
    function Red(m) {
      if (typeof m === 'string') {
        var prime = BN._prime(m);
        this.m = prime.p;
        this.prime = prime;
      } else {
        this.m = m;
        this.prime = null;
      }
    }
    exporter.ECDH.Red = Red;

    Red.prototype._verify1 = function _verify1(a) {
      assert(!a.sign, 'red works only with positives');
      assert(a.red, 'red works only with red numbers');
    };

    Red.prototype._verify2 = function _verify2(a, b) {
      assert(!a.sign && !b.sign, 'red works only with positives');
      assert(a.red && a.red === b.red,
          'red works only with red numbers');
    };

    Red.prototype.imod = function imod(a) {
      if (this.prime)
        return this.prime.ireduce(a)._forceRed(this);
      return a.mod(this.m)._forceRed(this);
    };

    Red.prototype.neg = function neg(a) {
      var r = a.clone();
      r.sign = !r.sign;
      return r.iadd(this.m)._forceRed(this);
    };

    Red.prototype.add = function add(a, b) {
      this._verify2(a, b);

      var res = a.add(b);
      if (res.cmp(this.m) >= 0)
        res.isub(this.m);
      return res._forceRed(this);
    };

    Red.prototype.iadd = function iadd(a, b) {
      this._verify2(a, b);

      var res = a.iadd(b);
      if (res.cmp(this.m) >= 0)
        res.isub(this.m);
      return res;
    };

    Red.prototype.sub = function sub(a, b) {
      this._verify2(a, b);

      var res = a.sub(b);
      if (res.cmpn(0) < 0)
        res.iadd(this.m);
      return res._forceRed(this);
    };

    Red.prototype.isub = function isub(a, b) {
      this._verify2(a, b);

      var res = a.isub(b);
      if (res.cmpn(0) < 0)
        res.iadd(this.m);
      return res;
    };

    Red.prototype.shl = function shl(a, num) {
      this._verify1(a);
      return this.imod(a.shln(num));
    };

    Red.prototype.imul = function imul(a, b) {
      this._verify2(a, b);
      return this.imod(a.imul(b));
    };

    Red.prototype.mul = function mul(a, b) {
      this._verify2(a, b);
      return this.imod(a.mul(b));
    };

    Red.prototype.isqr = function isqr(a) {
      return this.imul(a, a);
    };

    Red.prototype.sqr = function sqr(a) {
      return this.mul(a, a);
    };

    Red.prototype.sqrt = function sqrt(a) {
      if (a.cmpn(0) === 0)
        return a.clone();

      var mod3 = this.m.andln(3);
      assert(mod3 % 2 === 1);

      // Fast case
      if (mod3 === 3) {
        var pow = this.m.add(new BN(1)).ishrn(2);
        var r = this.pow(a, pow);
        return r;
      }

      // Tonelli-Shanks algorithm (Totally unoptimized and slow)
      //
      // Find Q and S, that Q * 2 ^ S = (P - 1)
      var q = this.m.subn(1);
      var s = 0;
      while (q.cmpn(0) !== 0 && q.andln(1) === 0) {
        s++;
        q.ishrn(1);
      }
      assert(q.cmpn(0) !== 0);

      var one = new BN(1).toRed(this);
      var nOne = one.redNeg();

      // Find quadratic non-residue
      // NOTE: Max is such because of generalized Riemann hypothesis.
      var lpow = this.m.subn(1).ishrn(1);
      var z = this.m.bitLength();
      z = new BN(2 * z * z).toRed(this);
      while (this.pow(z, lpow).cmp(nOne) !== 0)
        z.redIAdd(nOne);

      var c = this.pow(z, q);
      var r = this.pow(a, q.addn(1).ishrn(1));
      var t = this.pow(a, q);
      var m = s;
      while (t.cmp(one) !== 0) {
        var tmp = t;
        for (var i = 0; tmp.cmp(one) !== 0; i++)
          tmp = tmp.redSqr();
        assert(i < m);
        var b = this.pow(c, new BN(1).ishln(m - i - 1));

        r = r.redMul(b);
        c = b.redSqr();
        t = t.redMul(c);
        m = i;
      }

      return r;
    };

    Red.prototype.invm = function invm(a) {
      var inv = a._invmp(this.m);
      if (inv.sign) {
        inv.sign = false;
        return this.imod(inv).redNeg();
      } else {
        return this.imod(inv);
      }
    };

    Red.prototype.pow = function pow(a, num) {
      var w = [];
      var q = num.clone();
      while (q.cmpn(0) !== 0) {
        w.push(q.andln(1));
        q.ishrn(1);
      }

      // Skip leading zeroes
      var res = a;
      for (var i = 0; i < w.length; i++, res = this.sqr(res))
        if (w[i] !== 0)
          break;

      if (++i < w.length) {
        for (var q = this.sqr(res); i < w.length; i++, q = this.sqr(q)) {
          if (w[i] === 0)
            continue;
          res = this.mul(res, q);
        }
      }

      return res;
    };

    Red.prototype.convertTo = function convertTo(num) {
      return num.clone();
    };

    Red.prototype.convertFrom = function convertFrom(num) {
      var res = num.clone();
      res.red = null;
      return res;
    };

    //
    // Montgomery method engine
    //

    BN.mont = function mont(num) {
      return new Mont(num);
    };

    function Mont(m) {
      Red.call(this, m);

      this.shift = this.m.bitLength();
      if (this.shift % 26 !== 0)
        this.shift += 26 - (this.shift % 26);
      this.r = new BN(1).ishln(this.shift);
      this.r2 = this.imod(this.r.sqr());
      this.rinv = this.r._invmp(this.m);

      this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
      this.minv.sign = true;
      this.minv = this.minv.mod(this.r);
    }
    inherits(Mont, Red);
    exporter.ECDH.Mont = Mont;

    Mont.prototype.convertTo = function convertTo(num) {
      return this.imod(num.shln(this.shift));
    };

    Mont.prototype.convertFrom = function convertFrom(num) {
      var r = this.imod(num.mul(this.rinv));
      r.red = null;
      return r;
    };

    Mont.prototype.imul = function imul(a, b) {
      if (a.cmpn(0) === 0 || b.cmpn(0) === 0) {
        a.words[0] = 0;
        a.length = 1;
        return a;
      }

      var t = a.imul(b);
      var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      var u = t.isub(c).ishrn(this.shift);
      var res = u;
      if (u.cmp(this.m) >= 0)
        res = u.isub(this.m);
      else if (u.cmpn(0) < 0)
        res = u.iadd(this.m);

      return res._forceRed(this);
    };

    Mont.prototype.mul = function mul(a, b) {
      if (a.cmpn(0) === 0 || b.cmpn(0) === 0)
        return new BN(0)._forceRed(this);

      var t = a.mul(b);
      var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      var u = t.isub(c).ishrn(this.shift);
      var res = u;
      if (u.cmp(this.m) >= 0)
        res = u.isub(this.m);
      else if (u.cmpn(0) < 0)
        res = u.iadd(this.m);

      return res._forceRed(this);
    };

    Mont.prototype.invm = function invm(a) {
      // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
      var res = this.imod(a._invmp(this.m).mul(this.r2));
      return res._forceRed(this);
    };

  })(typeof module === 'undefined' || module, this);

},{}],14:[function(require,module,exports){
  var r;

  module.exports = exporter.ECDH.rand = function rand(len) {
    if (!r)
      r = new Rand(null);

    return r.generate(len);
  };

  function Rand(rand) {
    this.rand = rand;
  }
  module.exports.Rand = exporter.ECDH.Rand = Rand;

  Rand.prototype.generate = function generate(len) {
    return this._rand(len);
  };

  if (typeof window === 'object') {
    if (window.crypto && window.crypto.getRandomValues) {
      // Modern browsers
      Rand.prototype._rand = function _rand(n) {
        var arr = new Uint8Array(n);
        window.crypto.getRandomValues(arr);
        return arr;
      };
    } else if (window.msCrypto && window.msCrypto.getRandomValues) {
      // IE
      Rand.prototype._rand = function _rand(n) {
        var arr = new Uint8Array(n);
        window.msCrypto.getRandomValues(arr);
        return arr;
      };
    } else {
      // Old junk
      Rand.prototype._rand = function() {
        throw new Error('Not implemented yet');
      };
    }
  } else {
    // Node.js or Web worker
    try {
      var crypto = require('cry' + 'pto');

      Rand.prototype._rand = function _rand(n) {
        return crypto.randomBytes(n);
      };
    } catch (e) {
      // Emulate crypto API using randy
      Rand.prototype._rand = function _rand(n) {
        var res = new Uint8Array(n);
        for (var i = 0; i < res.length; i++)
          res[i] = this.rand.getByte();
        return res;
      };
    }
  }

},{}],15:[function(require,module,exports){
  var hash = exports;

  hash.utils = require('./hash/utils');
  hash.common = require('./hash/common');
  hash.sha = require('./hash/sha');
  hash.ripemd = require('./hash/ripemd');
  hash.hmac = require('./hash/hmac');

  // Proxy hash functions to the main object
  hash.sha1 = hash.sha.sha1;
  hash.sha256 = hash.sha.sha256;
  hash.sha224 = hash.sha.sha224;
  hash.sha384 = hash.sha.sha384;
  hash.sha512 = hash.sha.sha512;
  hash.ripemd160 = hash.ripemd.ripemd160;

},{"./hash/common":16,"./hash/hmac":17,"./hash/ripemd":18,"./hash/sha":19,"./hash/utils":20}],16:[function(require,module,exports){
  var hash = require('../hash');
  var utils = hash.utils;
  var assert = utils.assert;

  function BlockHash() {
    this.pending = null;
    this.pendingTotal = 0;
    this.blockSize = this.constructor.blockSize;
    this.outSize = this.constructor.outSize;
    this.hmacStrength = this.constructor.hmacStrength;
    this.padLength = this.constructor.padLength / 8;
    this.endian = 'big';

    this._delta8 = this.blockSize / 8;
    this._delta32 = this.blockSize / 32;
  }
  exports.BlockHash = exporter.ECDH.BlockHash = BlockHash;

  BlockHash.prototype.update = function update(msg, enc) {
    // Convert message to array, pad it, and join into 32bit blocks
    msg = utils.toArray(msg, enc);
    if (!this.pending)
      this.pending = msg;
    else
      this.pending = this.pending.concat(msg);
    this.pendingTotal += msg.length;

    // Enough data, try updating
    if (this.pending.length >= this._delta8) {
      msg = this.pending;

      // Process pending data in blocks
      var r = msg.length % this._delta8;
      this.pending = msg.slice(msg.length - r, msg.length);
      if (this.pending.length === 0)
        this.pending = null;

      msg = utils.join32(msg, 0, msg.length - r, this.endian);
      for (var i = 0; i < msg.length; i += this._delta32)
        this._update(msg, i, i + this._delta32);
    }

    return this;
  };

  BlockHash.prototype.digest = function digest(enc) {
    this.update(this._pad());
    assert(this.pending === null);

    return this._digest(enc);
  };

  BlockHash.prototype._pad = function pad() {
    var len = this.pendingTotal;
    var bytes = this._delta8;
    var k = bytes - ((len + this.padLength) % bytes);
    var res = new Array(k + this.padLength);
    res[0] = 0x80;
    for (var i = 1; i < k; i++)
      res[i] = 0;

    // Append length
    len <<= 3;
    if (this.endian === 'big') {
      for (var t = 8; t < this.padLength; t++)
        res[i++] = 0;

      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = (len >>> 24) & 0xff;
      res[i++] = (len >>> 16) & 0xff;
      res[i++] = (len >>> 8) & 0xff;
      res[i++] = len & 0xff;
    } else {
      res[i++] = len & 0xff;
      res[i++] = (len >>> 8) & 0xff;
      res[i++] = (len >>> 16) & 0xff;
      res[i++] = (len >>> 24) & 0xff;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;

      for (var t = 8; t < this.padLength; t++)
        res[i++] = 0;
    }

    return res;
  };

},{"../hash":15}],17:[function(require,module,exports){
  var hmac = exports;

  var hash = require('../hash');
  var utils = hash.utils;
  var assert = utils.assert;

  function Hmac(hash, key, enc) {
    if (!(this instanceof Hmac))
      return new Hmac(hash, key, enc);
    this.Hash = hash;
    this.blockSize = hash.blockSize / 8;
    this.outSize = hash.outSize / 8;
    this.inner = null;
    this.outer = null;

    this._init(utils.toArray(key, enc));
  }
  module.exports = exporter.ECDH.Hmac = Hmac;

  Hmac.prototype._init = function init(key) {
    // Shorten key, if needed
    if (key.length > this.blockSize)
      key = new this.Hash().update(key).digest();
    assert(key.length <= this.blockSize);

    // Add padding to key
    for (var i = key.length; i < this.blockSize; i++)
      key.push(0);

    for (var i = 0; i < key.length; i++)
      key[i] ^= 0x36;
    this.inner = new this.Hash().update(key);

    // 0x36 ^ 0x5c = 0x6a
    for (var i = 0; i < key.length; i++)
      key[i] ^= 0x6a;
    this.outer = new this.Hash().update(key);
  };

  Hmac.prototype.update = function update(msg, enc) {
    this.inner.update(msg, enc);
    return this;
  };

  Hmac.prototype.digest = function digest(enc) {
    this.outer.update(this.inner.digest());
    return this.outer.digest(enc);
  };

},{"../hash":15}],18:[function(require,module,exports){
  var hash = require('../hash');
  var utils = hash.utils;

  var rotl32 = utils.rotl32;
  var sum32 = utils.sum32;
  var sum32_3 = utils.sum32_3;
  var sum32_4 = utils.sum32_4;
  var BlockHash = hash.common.BlockHash;

  function RIPEMD160() {
    if (!(this instanceof RIPEMD160))
      return new RIPEMD160();

    BlockHash.call(this);

    this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
    this.endian = 'little';
  }
  utils.inherits(RIPEMD160, BlockHash);
  exports.ripemd160 = RIPEMD160;

  RIPEMD160.blockSize = 512;
  RIPEMD160.outSize = 160;
  RIPEMD160.hmacStrength = 192;
  RIPEMD160.padLength = 64;

  RIPEMD160.prototype._update = function update(msg, start) {
    var A = this.h[0];
    var B = this.h[1];
    var C = this.h[2];
    var D = this.h[3];
    var E = this.h[4];
    var Ah = A;
    var Bh = B;
    var Ch = C;
    var Dh = D;
    var Eh = E;
    for (var j = 0; j < 80; j++) {
      var T = sum32(
          rotl32(
              sum32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)),
              s[j]),
          E);
      A = E;
      E = D;
      D = rotl32(C, 10);
      C = B;
      B = T;
      T = sum32(
          rotl32(
              sum32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)),
              sh[j]),
          Eh);
      Ah = Eh;
      Eh = Dh;
      Dh = rotl32(Ch, 10);
      Ch = Bh;
      Bh = T;
    }
    T = sum32_3(this.h[1], C, Dh);
    this.h[1] = sum32_3(this.h[2], D, Eh);
    this.h[2] = sum32_3(this.h[3], E, Ah);
    this.h[3] = sum32_3(this.h[4], A, Bh);
    this.h[4] = sum32_3(this.h[0], B, Ch);
    this.h[0] = T;
  };

  RIPEMD160.prototype._digest = function digest(enc) {
    if (enc === 'hex')
      return utils.toHex32(this.h, 'little');
    else
      return utils.split32(this.h, 'little');
  };

  function f(j, x, y, z) {
    if (j <= 15)
      return x ^ y ^ z;
    else if (j <= 31)
      return (x & y) | ((~x) & z);
    else if (j <= 47)
      return (x | (~y)) ^ z;
    else if (j <= 63)
      return (x & z) | (y & (~z));
    else
      return x ^ (y | (~z));
  }

  function K(j) {
    if (j <= 15)
      return 0x00000000;
    else if (j <= 31)
      return 0x5a827999;
    else if (j <= 47)
      return 0x6ed9eba1;
    else if (j <= 63)
      return 0x8f1bbcdc;
    else
      return 0xa953fd4e;
  }

  function Kh(j) {
    if (j <= 15)
      return 0x50a28be6;
    else if (j <= 31)
      return 0x5c4dd124;
    else if (j <= 47)
      return 0x6d703ef3;
    else if (j <= 63)
      return 0x7a6d76e9;
    else
      return 0x00000000;
  }

  var r = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
    3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
    1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
    4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
  ];

  var rh = [
    5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
    6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
    15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
    8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
    12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
  ];

  var s = [
    11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
    7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
    11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
    11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
    9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
  ];

  var sh = [
    8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
    9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
    9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
    15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
    8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
  ];

},{"../hash":15}],19:[function(require,module,exports){
  var hash = require('../hash');
  var utils = hash.utils;
  var assert = utils.assert;

  var rotr32 = utils.rotr32;
  var rotl32 = utils.rotl32;
  var sum32 = utils.sum32;
  var sum32_4 = utils.sum32_4;
  var sum32_5 = utils.sum32_5;
  var rotr64_hi = utils.rotr64_hi;
  var rotr64_lo = utils.rotr64_lo;
  var shr64_hi = utils.shr64_hi;
  var shr64_lo = utils.shr64_lo;
  var sum64 = utils.sum64;
  var sum64_hi = utils.sum64_hi;
  var sum64_lo = utils.sum64_lo;
  var sum64_4_hi = utils.sum64_4_hi;
  var sum64_4_lo = utils.sum64_4_lo;
  var sum64_5_hi = utils.sum64_5_hi;
  var sum64_5_lo = utils.sum64_5_lo;
  var BlockHash = hash.common.BlockHash;

  var sha256_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  var sha512_K = [
    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
  ];

  var sha1_K = [
    0x5A827999, 0x6ED9EBA1,
    0x8F1BBCDC, 0xCA62C1D6
  ];

  function SHA256() {
    if (!(this instanceof SHA256))
      return new SHA256();

    BlockHash.call(this);
    this.h = [ 0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];
    this.k = sha256_K;
    this.W = new Array(64);
  }
  utils.inherits(SHA256, BlockHash);
  exports.sha256 = exporter.ECDH.SHA256 = SHA256;

  SHA256.blockSize = 512;
  SHA256.outSize = 256;
  SHA256.hmacStrength = 192;
  SHA256.padLength = 64;

  SHA256.prototype._update = function _update(msg, start) {
    var W = this.W;

    for (var i = 0; i < 16; i++)
      W[i] = msg[start + i];
    for (; i < W.length; i++)
      W[i] = sum32_4(g1_256(W[i - 2]), W[i - 7], g0_256(W[i - 15]), W[i - 16]);

    var a = this.h[0];
    var b = this.h[1];
    var c = this.h[2];
    var d = this.h[3];
    var e = this.h[4];
    var f = this.h[5];
    var g = this.h[6];
    var h = this.h[7];

    assert(this.k.length === W.length);
    for (var i = 0; i < W.length; i++) {
      var T1 = sum32_5(h, s1_256(e), ch32(e, f, g), this.k[i], W[i]);
      var T2 = sum32(s0_256(a), maj32(a, b, c));
      h = g;
      g = f;
      f = e;
      e = sum32(d, T1);
      d = c;
      c = b;
      b = a;
      a = sum32(T1, T2);
    }

    this.h[0] = sum32(this.h[0], a);
    this.h[1] = sum32(this.h[1], b);
    this.h[2] = sum32(this.h[2], c);
    this.h[3] = sum32(this.h[3], d);
    this.h[4] = sum32(this.h[4], e);
    this.h[5] = sum32(this.h[5], f);
    this.h[6] = sum32(this.h[6], g);
    this.h[7] = sum32(this.h[7], h);
  };

  SHA256.prototype._digest = function digest(enc) {
    if (enc === 'hex')
      return utils.toHex32(this.h, 'big');
    else
      return utils.split32(this.h, 'big');
  };

  function SHA224() {
    if (!(this instanceof SHA224))
      return new SHA224();

    SHA256.call(this);
    this.h = [ 0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
      0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4 ];
  }
  utils.inherits(SHA224, SHA256);
  exports.sha224 = SHA224;

  SHA224.blockSize = 512;
  SHA224.outSize = 224;
  SHA224.hmacStrength = 192;
  SHA224.padLength = 64;

  SHA224.prototype._digest = function digest(enc) {
    // Just truncate output
    if (enc === 'hex')
      return utils.toHex32(this.h.slice(0, 7), 'big');
    else
      return utils.split32(this.h.slice(0, 7), 'big');
  };

  function SHA512() {
    if (!(this instanceof SHA512))
      return new SHA512();

    BlockHash.call(this);
    this.h = [ 0x6a09e667, 0xf3bcc908,
      0xbb67ae85, 0x84caa73b,
      0x3c6ef372, 0xfe94f82b,
      0xa54ff53a, 0x5f1d36f1,
      0x510e527f, 0xade682d1,
      0x9b05688c, 0x2b3e6c1f,
      0x1f83d9ab, 0xfb41bd6b,
      0x5be0cd19, 0x137e2179 ];
    this.k = sha512_K;
    this.W = new Array(160);
  }
  utils.inherits(SHA512, BlockHash);
  exports.sha512 = SHA512;

  SHA512.blockSize = 1024;
  SHA512.outSize = 512;
  SHA512.hmacStrength = 192;
  SHA512.padLength = 128;

  SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
    var W = this.W;

    // 32 x 32bit words
    for (var i = 0; i < 32; i++)
      W[i] = msg[start + i];
    for (; i < W.length; i += 2) {
      var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);  // i - 2
      var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
      var c1_hi = W[i - 14];  // i - 7
      var c1_lo = W[i - 13];
      var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);  // i - 15
      var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
      var c3_hi = W[i - 32];  // i - 16
      var c3_lo = W[i - 31];

      W[i] = sum64_4_hi(c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo);
      W[i + 1] = sum64_4_lo(c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo);
    }
  };

  SHA512.prototype._update = function _update(msg, start) {
    this._prepareBlock(msg, start);

    var W = this.W;

    var ah = this.h[0];
    var al = this.h[1];
    var bh = this.h[2];
    var bl = this.h[3];
    var ch = this.h[4];
    var cl = this.h[5];
    var dh = this.h[6];
    var dl = this.h[7];
    var eh = this.h[8];
    var el = this.h[9];
    var fh = this.h[10];
    var fl = this.h[11];
    var gh = this.h[12];
    var gl = this.h[13];
    var hh = this.h[14];
    var hl = this.h[15];

    assert(this.k.length === W.length);
    for (var i = 0; i < W.length; i += 2) {
      var c0_hi = hh;
      var c0_lo = hl;
      var c1_hi = s1_512_hi(eh, el);
      var c1_lo = s1_512_lo(eh, el);
      var c2_hi = ch64_hi(eh, el, fh, fl, gh, gl);
      var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
      var c3_hi = this.k[i];
      var c3_lo = this.k[i + 1];
      var c4_hi = W[i];
      var c4_lo = W[i + 1];

      var T1_hi = sum64_5_hi(c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo,
          c4_hi, c4_lo);
      var T1_lo = sum64_5_lo(c0_hi, c0_lo,
          c1_hi, c1_lo,
          c2_hi, c2_lo,
          c3_hi, c3_lo,
          c4_hi, c4_lo);

      var c0_hi = s0_512_hi(ah, al);
      var c0_lo = s0_512_lo(ah, al);
      var c1_hi = maj64_hi(ah, al, bh, bl, ch, cl);
      var c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);

      var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
      var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);

      hh = gh;
      hl = gl;

      gh = fh;
      gl = fl;

      fh = eh;
      fl = el;

      eh = sum64_hi(dh, dl, T1_hi, T1_lo);
      el = sum64_lo(dl, dl, T1_hi, T1_lo);

      dh = ch;
      dl = cl;

      ch = bh;
      cl = bl;

      bh = ah;
      bl = al;

      ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
      al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
    }

    sum64(this.h, 0, ah, al);
    sum64(this.h, 2, bh, bl);
    sum64(this.h, 4, ch, cl);
    sum64(this.h, 6, dh, dl);
    sum64(this.h, 8, eh, el);
    sum64(this.h, 10, fh, fl);
    sum64(this.h, 12, gh, gl);
    sum64(this.h, 14, hh, hl);
  };

  SHA512.prototype._digest = function digest(enc) {
    if (enc === 'hex')
      return utils.toHex32(this.h, 'big');
    else
      return utils.split32(this.h, 'big');
  };

  function SHA384() {
    if (!(this instanceof SHA384))
      return new SHA384();

    SHA512.call(this);
    this.h = [ 0xcbbb9d5d, 0xc1059ed8,
      0x629a292a, 0x367cd507,
      0x9159015a, 0x3070dd17,
      0x152fecd8, 0xf70e5939,
      0x67332667, 0xffc00b31,
      0x8eb44a87, 0x68581511,
      0xdb0c2e0d, 0x64f98fa7,
      0x47b5481d, 0xbefa4fa4 ];
  }
  utils.inherits(SHA384, SHA512);
  exports.sha384 = SHA384;

  SHA384.blockSize = 1024;
  SHA384.outSize = 384;
  SHA384.hmacStrength = 192;
  SHA384.padLength = 128;

  SHA384.prototype._digest = function digest(enc) {
    if (enc === 'hex')
      return utils.toHex32(this.h.slice(0, 12), 'big');
    else
      return utils.split32(this.h.slice(0, 12), 'big');
  };

  function SHA1() {
    if (!(this instanceof SHA1))
      return new SHA1();

    BlockHash.call(this);
    this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe,
      0x10325476, 0xc3d2e1f0 ];
    this.W = new Array(80);
  }

  utils.inherits(SHA1, BlockHash);
  exports.sha1 = SHA1;

  SHA1.blockSize = 512;
  SHA1.outSize = 160;
  SHA1.hmacStrength = 80;
  SHA1.padLength = 64;

  SHA1.prototype._update = function _update(msg, start) {
    var W = this.W;

    for (var i = 0; i < 16; i++)
      W[i] = msg[start + i];

    for(; i < W.length; i++)
      W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

    var a = this.h[0];
    var b = this.h[1];
    var c = this.h[2];
    var d = this.h[3];
    var e = this.h[4];

    for (var i = 0; i < W.length; i++) {
      var s = ~~(i / 20);
      var t = sum32_5(rotl32(a, 5), ft_1(s, b, c, d), e, W[i], sha1_K[s]);
      e = d;
      d = c;
      c = rotl32(b, 30);
      b = a;
      a = t;
    }

    this.h[0] = sum32(this.h[0], a);
    this.h[1] = sum32(this.h[1], b);
    this.h[2] = sum32(this.h[2], c);
    this.h[3] = sum32(this.h[3], d);
    this.h[4] = sum32(this.h[4], e);
  };

  SHA1.prototype._digest = function digest(enc) {
    if (enc === 'hex')
      return utils.toHex32(this.h, 'big');
    else
      return utils.split32(this.h, 'big');
  };

  function ch32(x, y, z) {
    return (x & y) ^ ((~x) & z);
  }

  function maj32(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
  }

  function p32(x, y, z) {
    return x ^ y ^ z;
  }

  function s0_256(x) {
    return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
  }

  function s1_256(x) {
    return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
  }

  function g0_256(x) {
    return rotr32(x, 7) ^ rotr32(x, 18) ^ (x >>> 3);
  }

  function g1_256(x) {
    return rotr32(x, 17) ^ rotr32(x, 19) ^ (x >>> 10);
  }

  function ft_1(s, x, y, z) {
    if (s === 0)
      return ch32(x, y, z);
    if (s === 1 || s === 3)
      return p32(x, y, z);
    if (s === 2)
      return maj32(x, y, z);
  }

  function ch64_hi(xh, xl, yh, yl, zh, zl) {
    var r = (xh & yh) ^ ((~xh) & zh);
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function ch64_lo(xh, xl, yh, yl, zh, zl) {
    var r = (xl & yl) ^ ((~xl) & zl);
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function maj64_hi(xh, xl, yh, yl, zh, zl) {
    var r = (xh & yh) ^ (xh & zh) ^ (yh & zh);
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function maj64_lo(xh, xl, yh, yl, zh, zl) {
    var r = (xl & yl) ^ (xl & zl) ^ (yl & zl);
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function s0_512_hi(xh, xl) {
    var c0_hi = rotr64_hi(xh, xl, 28);
    var c1_hi = rotr64_hi(xl, xh, 2);  // 34
    var c2_hi = rotr64_hi(xl, xh, 7);  // 39

    var r = c0_hi ^ c1_hi ^ c2_hi;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function s0_512_lo(xh, xl) {
    var c0_lo = rotr64_lo(xh, xl, 28);
    var c1_lo = rotr64_lo(xl, xh, 2);  // 34
    var c2_lo = rotr64_lo(xl, xh, 7);  // 39

    var r = c0_lo ^ c1_lo ^ c2_lo;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function s1_512_hi(xh, xl) {
    var c0_hi = rotr64_hi(xh, xl, 14);
    var c1_hi = rotr64_hi(xh, xl, 18);
    var c2_hi = rotr64_hi(xl, xh, 9);  // 41

    var r = c0_hi ^ c1_hi ^ c2_hi;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function s1_512_lo(xh, xl) {
    var c0_lo = rotr64_lo(xh, xl, 14);
    var c1_lo = rotr64_lo(xh, xl, 18);
    var c2_lo = rotr64_lo(xl, xh, 9);  // 41

    var r = c0_lo ^ c1_lo ^ c2_lo;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function g0_512_hi(xh, xl) {
    var c0_hi = rotr64_hi(xh, xl, 1);
    var c1_hi = rotr64_hi(xh, xl, 8);
    var c2_hi = shr64_hi(xh, xl, 7);

    var r = c0_hi ^ c1_hi ^ c2_hi;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function g0_512_lo(xh, xl) {
    var c0_lo = rotr64_lo(xh, xl, 1);
    var c1_lo = rotr64_lo(xh, xl, 8);
    var c2_lo = shr64_lo(xh, xl, 7);

    var r = c0_lo ^ c1_lo ^ c2_lo;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function g1_512_hi(xh, xl) {
    var c0_hi = rotr64_hi(xh, xl, 19);
    var c1_hi = rotr64_hi(xl, xh, 29);  // 61
    var c2_hi = shr64_hi(xh, xl, 6);

    var r = c0_hi ^ c1_hi ^ c2_hi;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

  function g1_512_lo(xh, xl) {
    var c0_lo = rotr64_lo(xh, xl, 19);
    var c1_lo = rotr64_lo(xl, xh, 29);  // 61
    var c2_lo = shr64_lo(xh, xl, 6);

    var r = c0_lo ^ c1_lo ^ c2_lo;
    if (r < 0)
      r += 0x100000000;
    return r;
  }

},{"../hash":15}],20:[function(require,module,exports){
  var utils = exports;
  var inherits = require('inherits');

  function toArray(msg, enc) {
    if (Array.isArray(msg))
      return msg.slice();
    if (!msg)
      return [];
    var res = [];
    if (typeof msg === 'string') {
      if (!enc) {
        for (var i = 0; i < msg.length; i++) {
          var c = msg.charCodeAt(i);
          var hi = c >> 8;
          var lo = c & 0xff;
          if (hi)
            res.push(hi, lo);
          else
            res.push(lo);
        }
      } else if (enc === 'hex') {
        msg = msg.replace(/[^a-z0-9]+/ig, '');
        if (msg.length % 2 !== 0)
          msg = '0' + msg;
        for (var i = 0; i < msg.length; i += 2)
          res.push(parseInt(msg[i] + msg[i + 1], 16));
      }
    } else {
      for (var i = 0; i < msg.length; i++)
        res[i] = msg[i] | 0;
    }
    return res;
  }
  utils.toArray = toArray;

  function toHex(msg) {
    var res = '';
    for (var i = 0; i < msg.length; i++)
      res += zero2(msg[i].toString(16));
    return res;
  }
  utils.toHex = toHex;

  function htonl(w) {
    var res = (w >>> 24) |
        ((w >>> 8) & 0xff00) |
        ((w << 8) & 0xff0000) |
        ((w & 0xff) << 24);
    return res >>> 0;
  }
  utils.htonl = htonl;

  function toHex32(msg, endian) {
    var res = '';
    for (var i = 0; i < msg.length; i++) {
      var w = msg[i];
      if (endian === 'little')
        w = htonl(w);
      res += zero8(w.toString(16));
    }
    return res;
  }
  utils.toHex32 = toHex32;

  function zero2(word) {
    if (word.length === 1)
      return '0' + word;
    else
      return word;
  }
  utils.zero2 = zero2;

  function zero8(word) {
    if (word.length === 7)
      return '0' + word;
    else if (word.length === 6)
      return '00' + word;
    else if (word.length === 5)
      return '000' + word;
    else if (word.length === 4)
      return '0000' + word;
    else if (word.length === 3)
      return '00000' + word;
    else if (word.length === 2)
      return '000000' + word;
    else if (word.length === 1)
      return '0000000' + word;
    else
      return word;
  }
  utils.zero8 = zero8;

  function join32(msg, start, end, endian) {
    var len = end - start;
    assert(len % 4 === 0);
    var res = new Array(len / 4);
    for (var i = 0, k = start; i < res.length; i++, k += 4) {
      var w;
      if (endian === 'big')
        w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
      else
        w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
      res[i] = w >>> 0;
    }
    return res;
  }
  utils.join32 = join32;

  function split32(msg, endian) {
    var res = new Array(msg.length * 4);
    for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
      var m = msg[i];
      if (endian === 'big') {
        res[k] = m >>> 24;
        res[k + 1] = (m >>> 16) & 0xff;
        res[k + 2] = (m >>> 8) & 0xff;
        res[k + 3] = m & 0xff;
      } else {
        res[k + 3] = m >>> 24;
        res[k + 2] = (m >>> 16) & 0xff;
        res[k + 1] = (m >>> 8) & 0xff;
        res[k] = m & 0xff;
      }
    }
    return res;
  }
  utils.split32 = split32;

  function rotr32(w, b) {
    return (w >>> b) | (w << (32 - b));
  }
  utils.rotr32 = rotr32;

  function rotl32(w, b) {
    return (w << b) | (w >>> (32 - b));
  }
  utils.rotl32 = rotl32;

  function sum32(a, b) {
    return (a + b) >>> 0;
  }
  utils.sum32 = sum32;

  function sum32_3(a, b, c) {
    return (a + b + c) >>> 0;
  }
  utils.sum32_3 = sum32_3;

  function sum32_4(a, b, c, d) {
    return (a + b + c + d) >>> 0;
  }
  utils.sum32_4 = sum32_4;

  function sum32_5(a, b, c, d, e) {
    return (a + b + c + d + e) >>> 0;
  }
  utils.sum32_5 = sum32_5;

  function assert(cond, msg) {
    if (!cond)
      throw new Error(msg || 'Assertion failed');
  }
  utils.assert = assert;

  utils.inherits = inherits;

  function sum64(buf, pos, ah, al) {
    var bh = buf[pos];
    var bl = buf[pos + 1];

    var lo = (al + bl) >>> 0;
    var hi = (lo < al ? 1 : 0) + ah + bh;
    buf[pos] = hi >>> 0;
    buf[pos + 1] = lo;
  }
  exports.sum64 = sum64;

  function sum64_hi(ah, al, bh, bl) {
    var lo = (al + bl) >>> 0;
    var hi = (lo < al ? 1 : 0) + ah + bh;
    return hi >>> 0;
  };
  exports.sum64_hi = sum64_hi;

  function sum64_lo(ah, al, bh, bl) {
    var lo = al + bl;
    return lo >>> 0;
  };
  exports.sum64_lo = sum64_lo;

  function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
    var carry = 0;
    var lo = al;
    lo = (lo + bl) >>> 0;
    carry += lo < al ? 1 : 0;
    lo = (lo + cl) >>> 0;
    carry += lo < cl ? 1 : 0;
    lo = (lo + dl) >>> 0;
    carry += lo < dl ? 1 : 0;

    var hi = ah + bh + ch + dh + carry;
    return hi >>> 0;
  };
  exports.sum64_4_hi = sum64_4_hi;

  function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
    var lo = al + bl + cl + dl;
    return lo >>> 0;
  };
  exports.sum64_4_lo = sum64_4_lo;

  function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
    var carry = 0;
    var lo = al;
    lo = (lo + bl) >>> 0;
    carry += lo < al ? 1 : 0;
    lo = (lo + cl) >>> 0;
    carry += lo < cl ? 1 : 0;
    lo = (lo + dl) >>> 0;
    carry += lo < dl ? 1 : 0;
    lo = (lo + el) >>> 0;
    carry += lo < el ? 1 : 0;

    var hi = ah + bh + ch + dh + eh + carry;
    return hi >>> 0;
  };
  exports.sum64_5_hi = sum64_5_hi;

  function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
    var lo = al + bl + cl + dl + el;

    return lo >>> 0;
  };
  exports.sum64_5_lo = sum64_5_lo;

  function rotr64_hi(ah, al, num) {
    var r = (al << (32 - num)) | (ah >>> num);
    return r >>> 0;
  };
  exports.rotr64_hi = rotr64_hi;

  function rotr64_lo(ah, al, num) {
    var r = (ah << (32 - num)) | (al >>> num);
    return r >>> 0;
  };
  exports.rotr64_lo = rotr64_lo;

  function shr64_hi(ah, al, num) {
    return ah >>> num;
  };
  exports.shr64_hi = shr64_hi;

  function shr64_lo(ah, al, num) {
    var r = (ah << (32 - num)) | (al >>> num);
    return r >>> 0;
  };
  exports.shr64_lo = shr64_lo;

},{"inherits":21}],21:[function(require,module,exports){
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = exporter.ECDH.inherits = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }

},{}],22:[function(require,module,exports){
  module.exports={
    "name": "elliptic",
    "version": "3.0.3",
    "description": "EC cryptography",
    "main": "lib/elliptic.js",
    "scripts": {
      "test": "make lint && mocha --reporter=spec test/*-test.js"
    },
    "repository": {
      "type": "git",
      "url": "git@github.com:indutny/elliptic"
    },
    "keywords": [
      "EC",
      "Elliptic",
      "curve",
      "Cryptography"
    ],
    "author": "Fedor Indutny <fedor@indutny.com>",
    "license": "MIT",
    "bugs": {
      "url": "https://github.com/indutny/elliptic/issues"
    },
    "homepage": "https://github.com/indutny/elliptic",
    "devDependencies": {
      "browserify": "^3.44.2",
      "jscs": "^1.11.3",
      "jshint": "^2.6.0",
      "mocha": "^2.1.0",
      "uglify-js": "^2.4.13"
    },
    "dependencies": {
      "bn.js": "^2.0.0",
      "brorand": "^1.0.1",
      "hash.js": "^1.0.0",
      "inherits": "^2.0.1"
    }
  }
},{}]},{},[1])(1)
});
}
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["forgeAes"] = factory();
	else
		root["forgeAes"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/**
 * Node.js module for Forge.
 *
 * @author Dave Longley
 *
 * Copyright 2011-2016 Digital Bazaar, Inc.
 */
module.exports = {
  // default options
  options: {
    usePureJavaScript: false
  }
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Utility functions for web applications.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2014 Digital Bazaar, Inc.
 */
var forge = __webpack_require__(0);

/* Utilities API */
var util = module.exports = forge.util = forge.util || {};

// define setImmediate and nextTick
(function() {
  // use native nextTick
  if(typeof process !== 'undefined' && process.nextTick) {
    util.nextTick = process.nextTick;
    if(typeof setImmediate === 'function') {
      util.setImmediate = setImmediate;
    } else {
      // polyfill setImmediate with nextTick, older versions of node
      // (those w/o setImmediate) won't totally starve IO
      util.setImmediate = util.nextTick;
    }
    return;
  }

  // polyfill nextTick with native setImmediate
  if(typeof setImmediate === 'function') {
    util.setImmediate = function() { return setImmediate.apply(undefined, arguments); };
    util.nextTick = function(callback) {
      return setImmediate(callback);
    };
    return;
  }

  /* Note: A polyfill upgrade pattern is used here to allow combining
  polyfills. For example, MutationObserver is fast, but blocks UI updates,
  so it needs to allow UI updates periodically, so it falls back on
  postMessage or setTimeout. */

  // polyfill with setTimeout
  util.setImmediate = function(callback) {
    setTimeout(callback, 0);
  };

  // upgrade polyfill to use postMessage
  if(typeof window !== 'undefined' &&
    typeof window.postMessage === 'function') {
    var msg = 'forge.setImmediate';
    var callbacks = [];
    util.setImmediate = function(callback) {
      callbacks.push(callback);
      // only send message when one hasn't been sent in
      // the current turn of the event loop
      if(callbacks.length === 1) {
        window.postMessage(msg, '*');
      }
    };
    function handler(event) {
      if(event.source === window && event.data === msg) {
        event.stopPropagation();
        var copy = callbacks.slice();
        callbacks.length = 0;
        copy.forEach(function(callback) {
          callback();
        });
      }
    }
    window.addEventListener('message', handler, true);
  }

  // upgrade polyfill to use MutationObserver
  if(typeof MutationObserver !== 'undefined') {
    // polyfill with MutationObserver
    var now = Date.now();
    var attr = true;
    var div = document.createElement('div');
    var callbacks = [];
    new MutationObserver(function() {
      var copy = callbacks.slice();
      callbacks.length = 0;
      copy.forEach(function(callback) {
        callback();
      });
    }).observe(div, {attributes: true});
    var oldSetImmediate = util.setImmediate;
    util.setImmediate = function(callback) {
      if(Date.now() - now > 15) {
        now = Date.now();
        oldSetImmediate(callback);
      } else {
        callbacks.push(callback);
        // only trigger observer when it hasn't been triggered in
        // the current turn of the event loop
        if(callbacks.length === 1) {
          div.setAttribute('a', attr = !attr);
        }
      }
    };
  }

  util.nextTick = util.setImmediate;
})();

// check if running under Node.js
util.isNodejs =
  typeof process !== 'undefined' && process.versions && process.versions.node;

// define isArray
util.isArray = Array.isArray || function(x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};

// define isArrayBuffer
util.isArrayBuffer = function(x) {
  return typeof ArrayBuffer !== 'undefined' && x instanceof ArrayBuffer;
};

// define isArrayBufferView
util.isArrayBufferView = function(x) {
  return x && util.isArrayBuffer(x.buffer) && x.byteLength !== undefined;
};

/**
 * Ensure a bits param is 8, 16, 24, or 32. Used to validate input for
 * algorithms where bit manipulation, JavaScript limitations, and/or algorithm
 * design only allow for byte operations of a limited size.
 *
 * @param n number of bits.
 *
 * Throw Error if n invalid.
 */
function _checkBitsParam(n) {
  if(!(n === 8 || n === 16 || n === 24 || n === 32)) {
    throw new Error('Only 8, 16, 24, or 32 bits supported: ' + n);
  }
}

// TODO: set ByteBuffer to best available backing
util.ByteBuffer = ByteStringBuffer;

/** Buffer w/BinaryString backing */

/**
 * Constructor for a binary string backed byte buffer.
 *
 * @param [b] the bytes to wrap (either encoded as string, one byte per
 *          character, or as an ArrayBuffer or Typed Array).
 */
function ByteStringBuffer(b) {
  // TODO: update to match DataBuffer API

  // the data in this buffer
  this.data = '';
  // the pointer for reading from this buffer
  this.read = 0;

  if(typeof b === 'string') {
    this.data = b;
  } else if(util.isArrayBuffer(b) || util.isArrayBufferView(b)) {
    // convert native buffer to forge buffer
    // FIXME: support native buffers internally instead
    var arr = new Uint8Array(b);
    try {
      this.data = String.fromCharCode.apply(null, arr);
    } catch(e) {
      for(var i = 0; i < arr.length; ++i) {
        this.putByte(arr[i]);
      }
    }
  } else if(b instanceof ByteStringBuffer ||
    (typeof b === 'object' && typeof b.data === 'string' &&
    typeof b.read === 'number')) {
    // copy existing buffer
    this.data = b.data;
    this.read = b.read;
  }

  // used for v8 optimization
  this._constructedStringLength = 0;
}
util.ByteStringBuffer = ByteStringBuffer;

/* Note: This is an optimization for V8-based browsers. When V8 concatenates
  a string, the strings are only joined logically using a "cons string" or
  "constructed/concatenated string". These containers keep references to one
  another and can result in very large memory usage. For example, if a 2MB
  string is constructed by concatenating 4 bytes together at a time, the
  memory usage will be ~44MB; so ~22x increase. The strings are only joined
  together when an operation requiring their joining takes place, such as
  substr(). This function is called when adding data to this buffer to ensure
  these types of strings are periodically joined to reduce the memory
  footprint. */
var _MAX_CONSTRUCTED_STRING_LENGTH = 4096;
util.ByteStringBuffer.prototype._optimizeConstructedString = function(x) {
  this._constructedStringLength += x;
  if(this._constructedStringLength > _MAX_CONSTRUCTED_STRING_LENGTH) {
    // this substr() should cause the constructed string to join
    this.data.substr(0, 1);
    this._constructedStringLength = 0;
  }
};

/**
 * Gets the number of bytes in this buffer.
 *
 * @return the number of bytes in this buffer.
 */
util.ByteStringBuffer.prototype.length = function() {
  return this.data.length - this.read;
};

/**
 * Gets whether or not this buffer is empty.
 *
 * @return true if this buffer is empty, false if not.
 */
util.ByteStringBuffer.prototype.isEmpty = function() {
  return this.length() <= 0;
};

/**
 * Puts a byte in this buffer.
 *
 * @param b the byte to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putByte = function(b) {
  return this.putBytes(String.fromCharCode(b));
};

/**
 * Puts a byte in this buffer N times.
 *
 * @param b the byte to put.
 * @param n the number of bytes of value b to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.fillWithByte = function(b, n) {
  b = String.fromCharCode(b);
  var d = this.data;
  while(n > 0) {
    if(n & 1) {
      d += b;
    }
    n >>>= 1;
    if(n > 0) {
      b += b;
    }
  }
  this.data = d;
  this._optimizeConstructedString(n);
  return this;
};

/**
 * Puts bytes in this buffer.
 *
 * @param bytes the bytes (as a UTF-8 encoded string) to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putBytes = function(bytes) {
  this.data += bytes;
  this._optimizeConstructedString(bytes.length);
  return this;
};

/**
 * Puts a UTF-16 encoded string into this buffer.
 *
 * @param str the string to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putString = function(str) {
  return this.putBytes(util.encodeUtf8(str));
};

/**
 * Puts a 16-bit integer in this buffer in big-endian order.
 *
 * @param i the 16-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt16 = function(i) {
  return this.putBytes(
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF));
};

/**
 * Puts a 24-bit integer in this buffer in big-endian order.
 *
 * @param i the 24-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt24 = function(i) {
  return this.putBytes(
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF));
};

/**
 * Puts a 32-bit integer in this buffer in big-endian order.
 *
 * @param i the 32-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt32 = function(i) {
  return this.putBytes(
    String.fromCharCode(i >> 24 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF));
};

/**
 * Puts a 16-bit integer in this buffer in little-endian order.
 *
 * @param i the 16-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt16Le = function(i) {
  return this.putBytes(
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF));
};

/**
 * Puts a 24-bit integer in this buffer in little-endian order.
 *
 * @param i the 24-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt24Le = function(i) {
  return this.putBytes(
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF));
};

/**
 * Puts a 32-bit integer in this buffer in little-endian order.
 *
 * @param i the 32-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt32Le = function(i) {
  return this.putBytes(
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 24 & 0xFF));
};

/**
 * Puts an n-bit integer in this buffer in big-endian order.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer (8, 16, 24, or 32).
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt = function(i, n) {
  _checkBitsParam(n);
  var bytes = '';
  do {
    n -= 8;
    bytes += String.fromCharCode((i >> n) & 0xFF);
  } while(n > 0);
  return this.putBytes(bytes);
};

/**
 * Puts a signed n-bit integer in this buffer in big-endian order. Two's
 * complement representation is used.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer (8, 16, 24, or 32).
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putSignedInt = function(i, n) {
  // putInt checks n
  if(i < 0) {
    i += 2 << (n - 1);
  }
  return this.putInt(i, n);
};

/**
 * Puts the given buffer into this buffer.
 *
 * @param buffer the buffer to put into this one.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putBuffer = function(buffer) {
  return this.putBytes(buffer.getBytes());
};

/**
 * Gets a byte from this buffer and advances the read pointer by 1.
 *
 * @return the byte.
 */
util.ByteStringBuffer.prototype.getByte = function() {
  return this.data.charCodeAt(this.read++);
};

/**
 * Gets a uint16 from this buffer in big-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.ByteStringBuffer.prototype.getInt16 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 8 ^
    this.data.charCodeAt(this.read + 1));
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in big-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.ByteStringBuffer.prototype.getInt24 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 16 ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2));
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in big-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.ByteStringBuffer.prototype.getInt32 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 24 ^
    this.data.charCodeAt(this.read + 1) << 16 ^
    this.data.charCodeAt(this.read + 2) << 8 ^
    this.data.charCodeAt(this.read + 3));
  this.read += 4;
  return rval;
};

/**
 * Gets a uint16 from this buffer in little-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.ByteStringBuffer.prototype.getInt16Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8);
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in little-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.ByteStringBuffer.prototype.getInt24Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2) << 16);
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in little-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.ByteStringBuffer.prototype.getInt32Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2) << 16 ^
    this.data.charCodeAt(this.read + 3) << 24);
  this.read += 4;
  return rval;
};

/**
 * Gets an n-bit integer from this buffer in big-endian order and advances the
 * read pointer by ceil(n/8).
 *
 * @param n the number of bits in the integer (8, 16, 24, or 32).
 *
 * @return the integer.
 */
util.ByteStringBuffer.prototype.getInt = function(n) {
  _checkBitsParam(n);
  var rval = 0;
  do {
    // TODO: Use (rval * 0x100) if adding support for 33 to 53 bits.
    rval = (rval << 8) + this.data.charCodeAt(this.read++);
    n -= 8;
  } while(n > 0);
  return rval;
};

/**
 * Gets a signed n-bit integer from this buffer in big-endian order, using
 * two's complement, and advances the read pointer by n/8.
 *
 * @param n the number of bits in the integer (8, 16, 24, or 32).
 *
 * @return the integer.
 */
util.ByteStringBuffer.prototype.getSignedInt = function(n) {
  // getInt checks n
  var x = this.getInt(n);
  var max = 2 << (n - 2);
  if(x >= max) {
    x -= max << 1;
  }
  return x;
};

/**
 * Reads bytes out into a UTF-8 string and clears them from the buffer.
 *
 * @param count the number of bytes to read, undefined or null for all.
 *
 * @return a UTF-8 string of bytes.
 */
util.ByteStringBuffer.prototype.getBytes = function(count) {
  var rval;
  if(count) {
    // read count bytes
    count = Math.min(this.length(), count);
    rval = this.data.slice(this.read, this.read + count);
    this.read += count;
  } else if(count === 0) {
    rval = '';
  } else {
    // read all bytes, optimize to only copy when needed
    rval = (this.read === 0) ? this.data : this.data.slice(this.read);
    this.clear();
  }
  return rval;
};

/**
 * Gets a UTF-8 encoded string of the bytes from this buffer without modifying
 * the read pointer.
 *
 * @param count the number of bytes to get, omit to get all.
 *
 * @return a string full of UTF-8 encoded characters.
 */
util.ByteStringBuffer.prototype.bytes = function(count) {
  return (typeof(count) === 'undefined' ?
    this.data.slice(this.read) :
    this.data.slice(this.read, this.read + count));
};

/**
 * Gets a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 *
 * @return the byte.
 */
util.ByteStringBuffer.prototype.at = function(i) {
  return this.data.charCodeAt(this.read + i);
};

/**
 * Puts a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 * @param b the byte to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.setAt = function(i, b) {
  this.data = this.data.substr(0, this.read + i) +
    String.fromCharCode(b) +
    this.data.substr(this.read + i + 1);
  return this;
};

/**
 * Gets the last byte without modifying the read pointer.
 *
 * @return the last byte.
 */
util.ByteStringBuffer.prototype.last = function() {
  return this.data.charCodeAt(this.data.length - 1);
};

/**
 * Creates a copy of this buffer.
 *
 * @return the copy.
 */
util.ByteStringBuffer.prototype.copy = function() {
  var c = util.createBuffer(this.data);
  c.read = this.read;
  return c;
};

/**
 * Compacts this buffer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.compact = function() {
  if(this.read > 0) {
    this.data = this.data.slice(this.read);
    this.read = 0;
  }
  return this;
};

/**
 * Clears this buffer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.clear = function() {
  this.data = '';
  this.read = 0;
  return this;
};

/**
 * Shortens this buffer by triming bytes off of the end of this buffer.
 *
 * @param count the number of bytes to trim off.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.truncate = function(count) {
  var len = Math.max(0, this.length() - count);
  this.data = this.data.substr(this.read, len);
  this.read = 0;
  return this;
};

/**
 * Converts this buffer to a hexadecimal string.
 *
 * @return a hexadecimal string.
 */
util.ByteStringBuffer.prototype.toHex = function() {
  var rval = '';
  for(var i = this.read; i < this.data.length; ++i) {
    var b = this.data.charCodeAt(i);
    if(b < 16) {
      rval += '0';
    }
    rval += b.toString(16);
  }
  return rval;
};

/**
 * Converts this buffer to a UTF-16 string (standard JavaScript string).
 *
 * @return a UTF-16 string.
 */
util.ByteStringBuffer.prototype.toString = function() {
  return util.decodeUtf8(this.bytes());
};

/** End Buffer w/BinaryString backing */

/** Buffer w/UInt8Array backing */

/**
 * FIXME: Experimental. Do not use yet.
 *
 * Constructor for an ArrayBuffer-backed byte buffer.
 *
 * The buffer may be constructed from a string, an ArrayBuffer, DataView, or a
 * TypedArray.
 *
 * If a string is given, its encoding should be provided as an option,
 * otherwise it will default to 'binary'. A 'binary' string is encoded such
 * that each character is one byte in length and size.
 *
 * If an ArrayBuffer, DataView, or TypedArray is given, it will be used
 * *directly* without any copying. Note that, if a write to the buffer requires
 * more space, the buffer will allocate a new backing ArrayBuffer to
 * accommodate. The starting read and write offsets for the buffer may be
 * given as options.
 *
 * @param [b] the initial bytes for this buffer.
 * @param options the options to use:
 *          [readOffset] the starting read offset to use (default: 0).
 *          [writeOffset] the starting write offset to use (default: the
 *            length of the first parameter).
 *          [growSize] the minimum amount, in bytes, to grow the buffer by to
 *            accommodate writes (default: 1024).
 *          [encoding] the encoding ('binary', 'utf8', 'utf16', 'hex') for the
 *            first parameter, if it is a string (default: 'binary').
 */
function DataBuffer(b, options) {
  // default options
  options = options || {};

  // pointers for read from/write to buffer
  this.read = options.readOffset || 0;
  this.growSize = options.growSize || 1024;

  var isArrayBuffer = util.isArrayBuffer(b);
  var isArrayBufferView = util.isArrayBufferView(b);
  if(isArrayBuffer || isArrayBufferView) {
    // use ArrayBuffer directly
    if(isArrayBuffer) {
      this.data = new DataView(b);
    } else {
      // TODO: adjust read/write offset based on the type of view
      // or specify that this must be done in the options ... that the
      // offsets are byte-based
      this.data = new DataView(b.buffer, b.byteOffset, b.byteLength);
    }
    this.write = ('writeOffset' in options ?
      options.writeOffset : this.data.byteLength);
    return;
  }

  // initialize to empty array buffer and add any given bytes using putBytes
  this.data = new DataView(new ArrayBuffer(0));
  this.write = 0;

  if(b !== null && b !== undefined) {
    this.putBytes(b);
  }

  if('writeOffset' in options) {
    this.write = options.writeOffset;
  }
}
util.DataBuffer = DataBuffer;

/**
 * Gets the number of bytes in this buffer.
 *
 * @return the number of bytes in this buffer.
 */
util.DataBuffer.prototype.length = function() {
  return this.write - this.read;
};

/**
 * Gets whether or not this buffer is empty.
 *
 * @return true if this buffer is empty, false if not.
 */
util.DataBuffer.prototype.isEmpty = function() {
  return this.length() <= 0;
};

/**
 * Ensures this buffer has enough empty space to accommodate the given number
 * of bytes. An optional parameter may be given that indicates a minimum
 * amount to grow the buffer if necessary. If the parameter is not given,
 * the buffer will be grown by some previously-specified default amount
 * or heuristic.
 *
 * @param amount the number of bytes to accommodate.
 * @param [growSize] the minimum amount, in bytes, to grow the buffer by if
 *          necessary.
 */
util.DataBuffer.prototype.accommodate = function(amount, growSize) {
  if(this.length() >= amount) {
    return this;
  }
  growSize = Math.max(growSize || this.growSize, amount);

  // grow buffer
  var src = new Uint8Array(
    this.data.buffer, this.data.byteOffset, this.data.byteLength);
  var dst = new Uint8Array(this.length() + growSize);
  dst.set(src);
  this.data = new DataView(dst.buffer);

  return this;
};

/**
 * Puts a byte in this buffer.
 *
 * @param b the byte to put.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putByte = function(b) {
  this.accommodate(1);
  this.data.setUint8(this.write++, b);
  return this;
};

/**
 * Puts a byte in this buffer N times.
 *
 * @param b the byte to put.
 * @param n the number of bytes of value b to put.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.fillWithByte = function(b, n) {
  this.accommodate(n);
  for(var i = 0; i < n; ++i) {
    this.data.setUint8(b);
  }
  return this;
};

/**
 * Puts bytes in this buffer. The bytes may be given as a string, an
 * ArrayBuffer, a DataView, or a TypedArray.
 *
 * @param bytes the bytes to put.
 * @param [encoding] the encoding for the first parameter ('binary', 'utf8',
 *          'utf16', 'hex'), if it is a string (default: 'binary').
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putBytes = function(bytes, encoding) {
  if(util.isArrayBufferView(bytes)) {
    var src = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var len = src.byteLength - src.byteOffset;
    this.accommodate(len);
    var dst = new Uint8Array(this.data.buffer, this.write);
    dst.set(src);
    this.write += len;
    return this;
  }

  if(util.isArrayBuffer(bytes)) {
    var src = new Uint8Array(bytes);
    this.accommodate(src.byteLength);
    var dst = new Uint8Array(this.data.buffer);
    dst.set(src, this.write);
    this.write += src.byteLength;
    return this;
  }

  // bytes is a util.DataBuffer or equivalent
  if(bytes instanceof util.DataBuffer ||
    (typeof bytes === 'object' &&
    typeof bytes.read === 'number' && typeof bytes.write === 'number' &&
    util.isArrayBufferView(bytes.data))) {
    var src = new Uint8Array(bytes.data.byteLength, bytes.read, bytes.length());
    this.accommodate(src.byteLength);
    var dst = new Uint8Array(bytes.data.byteLength, this.write);
    dst.set(src);
    this.write += src.byteLength;
    return this;
  }

  if(bytes instanceof util.ByteStringBuffer) {
    // copy binary string and process as the same as a string parameter below
    bytes = bytes.data;
    encoding = 'binary';
  }

  // string conversion
  encoding = encoding || 'binary';
  if(typeof bytes === 'string') {
    var view;

    // decode from string
    if(encoding === 'hex') {
      this.accommodate(Math.ceil(bytes.length / 2));
      view = new Uint8Array(this.data.buffer, this.write);
      this.write += util.binary.hex.decode(bytes, view, this.write);
      return this;
    }
    if(encoding === 'base64') {
      this.accommodate(Math.ceil(bytes.length / 4) * 3);
      view = new Uint8Array(this.data.buffer, this.write);
      this.write += util.binary.base64.decode(bytes, view, this.write);
      return this;
    }

    // encode text as UTF-8 bytes
    if(encoding === 'utf8') {
      // encode as UTF-8 then decode string as raw binary
      bytes = util.encodeUtf8(bytes);
      encoding = 'binary';
    }

    // decode string as raw binary
    if(encoding === 'binary' || encoding === 'raw') {
      // one byte per character
      this.accommodate(bytes.length);
      view = new Uint8Array(this.data.buffer, this.write);
      this.write += util.binary.raw.decode(view);
      return this;
    }

    // encode text as UTF-16 bytes
    if(encoding === 'utf16') {
      // two bytes per character
      this.accommodate(bytes.length * 2);
      view = new Uint16Array(this.data.buffer, this.write);
      this.write += util.text.utf16.encode(view);
      return this;
    }

    throw new Error('Invalid encoding: ' + encoding);
  }

  throw Error('Invalid parameter: ' + bytes);
};

/**
 * Puts the given buffer into this buffer.
 *
 * @param buffer the buffer to put into this one.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putBuffer = function(buffer) {
  this.putBytes(buffer);
  buffer.clear();
  return this;
};

/**
 * Puts a string into this buffer.
 *
 * @param str the string to put.
 * @param [encoding] the encoding for the string (default: 'utf16').
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putString = function(str) {
  return this.putBytes(str, 'utf16');
};

/**
 * Puts a 16-bit integer in this buffer in big-endian order.
 *
 * @param i the 16-bit integer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putInt16 = function(i) {
  this.accommodate(2);
  this.data.setInt16(this.write, i);
  this.write += 2;
  return this;
};

/**
 * Puts a 24-bit integer in this buffer in big-endian order.
 *
 * @param i the 24-bit integer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putInt24 = function(i) {
  this.accommodate(3);
  this.data.setInt16(this.write, i >> 8 & 0xFFFF);
  this.data.setInt8(this.write, i >> 16 & 0xFF);
  this.write += 3;
  return this;
};

/**
 * Puts a 32-bit integer in this buffer in big-endian order.
 *
 * @param i the 32-bit integer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putInt32 = function(i) {
  this.accommodate(4);
  this.data.setInt32(this.write, i);
  this.write += 4;
  return this;
};

/**
 * Puts a 16-bit integer in this buffer in little-endian order.
 *
 * @param i the 16-bit integer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putInt16Le = function(i) {
  this.accommodate(2);
  this.data.setInt16(this.write, i, true);
  this.write += 2;
  return this;
};

/**
 * Puts a 24-bit integer in this buffer in little-endian order.
 *
 * @param i the 24-bit integer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putInt24Le = function(i) {
  this.accommodate(3);
  this.data.setInt8(this.write, i >> 16 & 0xFF);
  this.data.setInt16(this.write, i >> 8 & 0xFFFF, true);
  this.write += 3;
  return this;
};

/**
 * Puts a 32-bit integer in this buffer in little-endian order.
 *
 * @param i the 32-bit integer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putInt32Le = function(i) {
  this.accommodate(4);
  this.data.setInt32(this.write, i, true);
  this.write += 4;
  return this;
};

/**
 * Puts an n-bit integer in this buffer in big-endian order.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer (8, 16, 24, or 32).
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putInt = function(i, n) {
  _checkBitsParam(n);
  this.accommodate(n / 8);
  do {
    n -= 8;
    this.data.setInt8(this.write++, (i >> n) & 0xFF);
  } while(n > 0);
  return this;
};

/**
 * Puts a signed n-bit integer in this buffer in big-endian order. Two's
 * complement representation is used.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.putSignedInt = function(i, n) {
  _checkBitsParam(n);
  this.accommodate(n / 8);
  if(i < 0) {
    i += 2 << (n - 1);
  }
  return this.putInt(i, n);
};

/**
 * Gets a byte from this buffer and advances the read pointer by 1.
 *
 * @return the byte.
 */
util.DataBuffer.prototype.getByte = function() {
  return this.data.getInt8(this.read++);
};

/**
 * Gets a uint16 from this buffer in big-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.DataBuffer.prototype.getInt16 = function() {
  var rval = this.data.getInt16(this.read);
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in big-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.DataBuffer.prototype.getInt24 = function() {
  var rval = (
    this.data.getInt16(this.read) << 8 ^
    this.data.getInt8(this.read + 2));
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in big-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.DataBuffer.prototype.getInt32 = function() {
  var rval = this.data.getInt32(this.read);
  this.read += 4;
  return rval;
};

/**
 * Gets a uint16 from this buffer in little-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.DataBuffer.prototype.getInt16Le = function() {
  var rval = this.data.getInt16(this.read, true);
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in little-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.DataBuffer.prototype.getInt24Le = function() {
  var rval = (
    this.data.getInt8(this.read) ^
    this.data.getInt16(this.read + 1, true) << 8);
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in little-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.DataBuffer.prototype.getInt32Le = function() {
  var rval = this.data.getInt32(this.read, true);
  this.read += 4;
  return rval;
};

/**
 * Gets an n-bit integer from this buffer in big-endian order and advances the
 * read pointer by n/8.
 *
 * @param n the number of bits in the integer (8, 16, 24, or 32).
 *
 * @return the integer.
 */
util.DataBuffer.prototype.getInt = function(n) {
  _checkBitsParam(n);
  var rval = 0;
  do {
    // TODO: Use (rval * 0x100) if adding support for 33 to 53 bits.
    rval = (rval << 8) + this.data.getInt8(this.read++);
    n -= 8;
  } while(n > 0);
  return rval;
};

/**
 * Gets a signed n-bit integer from this buffer in big-endian order, using
 * two's complement, and advances the read pointer by n/8.
 *
 * @param n the number of bits in the integer (8, 16, 24, or 32).
 *
 * @return the integer.
 */
util.DataBuffer.prototype.getSignedInt = function(n) {
  // getInt checks n
  var x = this.getInt(n);
  var max = 2 << (n - 2);
  if(x >= max) {
    x -= max << 1;
  }
  return x;
};

/**
 * Reads bytes out into a UTF-8 string and clears them from the buffer.
 *
 * @param count the number of bytes to read, undefined or null for all.
 *
 * @return a UTF-8 string of bytes.
 */
util.DataBuffer.prototype.getBytes = function(count) {
  // TODO: deprecate this method, it is poorly named and
  // this.toString('binary') replaces it
  // add a toTypedArray()/toArrayBuffer() function
  var rval;
  if(count) {
    // read count bytes
    count = Math.min(this.length(), count);
    rval = this.data.slice(this.read, this.read + count);
    this.read += count;
  } else if(count === 0) {
    rval = '';
  } else {
    // read all bytes, optimize to only copy when needed
    rval = (this.read === 0) ? this.data : this.data.slice(this.read);
    this.clear();
  }
  return rval;
};

/**
 * Gets a UTF-8 encoded string of the bytes from this buffer without modifying
 * the read pointer.
 *
 * @param count the number of bytes to get, omit to get all.
 *
 * @return a string full of UTF-8 encoded characters.
 */
util.DataBuffer.prototype.bytes = function(count) {
  // TODO: deprecate this method, it is poorly named, add "getString()"
  return (typeof(count) === 'undefined' ?
    this.data.slice(this.read) :
    this.data.slice(this.read, this.read + count));
};

/**
 * Gets a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 *
 * @return the byte.
 */
util.DataBuffer.prototype.at = function(i) {
  return this.data.getUint8(this.read + i);
};

/**
 * Puts a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 * @param b the byte to put.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.setAt = function(i, b) {
  this.data.setUint8(i, b);
  return this;
};

/**
 * Gets the last byte without modifying the read pointer.
 *
 * @return the last byte.
 */
util.DataBuffer.prototype.last = function() {
  return this.data.getUint8(this.write - 1);
};

/**
 * Creates a copy of this buffer.
 *
 * @return the copy.
 */
util.DataBuffer.prototype.copy = function() {
  return new util.DataBuffer(this);
};

/**
 * Compacts this buffer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.compact = function() {
  if(this.read > 0) {
    var src = new Uint8Array(this.data.buffer, this.read);
    var dst = new Uint8Array(src.byteLength);
    dst.set(src);
    this.data = new DataView(dst);
    this.write -= this.read;
    this.read = 0;
  }
  return this;
};

/**
 * Clears this buffer.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.clear = function() {
  this.data = new DataView(new ArrayBuffer(0));
  this.read = this.write = 0;
  return this;
};

/**
 * Shortens this buffer by triming bytes off of the end of this buffer.
 *
 * @param count the number of bytes to trim off.
 *
 * @return this buffer.
 */
util.DataBuffer.prototype.truncate = function(count) {
  this.write = Math.max(0, this.length() - count);
  this.read = Math.min(this.read, this.write);
  return this;
};

/**
 * Converts this buffer to a hexadecimal string.
 *
 * @return a hexadecimal string.
 */
util.DataBuffer.prototype.toHex = function() {
  var rval = '';
  for(var i = this.read; i < this.data.byteLength; ++i) {
    var b = this.data.getUint8(i);
    if(b < 16) {
      rval += '0';
    }
    rval += b.toString(16);
  }
  return rval;
};

/**
 * Converts this buffer to a string, using the given encoding. If no
 * encoding is given, 'utf8' (UTF-8) is used.
 *
 * @param [encoding] the encoding to use: 'binary', 'utf8', 'utf16', 'hex',
 *          'base64' (default: 'utf8').
 *
 * @return a string representation of the bytes in this buffer.
 */
util.DataBuffer.prototype.toString = function(encoding) {
  var view = new Uint8Array(this.data, this.read, this.length());
  encoding = encoding || 'utf8';

  // encode to string
  if(encoding === 'binary' || encoding === 'raw') {
    return util.binary.raw.encode(view);
  }
  if(encoding === 'hex') {
    return util.binary.hex.encode(view);
  }
  if(encoding === 'base64') {
    return util.binary.base64.encode(view);
  }

  // decode to text
  if(encoding === 'utf8') {
    return util.text.utf8.decode(view);
  }
  if(encoding === 'utf16') {
    return util.text.utf16.decode(view);
  }

  throw new Error('Invalid encoding: ' + encoding);
};

/** End Buffer w/UInt8Array backing */

/**
 * Creates a buffer that stores bytes. A value may be given to put into the
 * buffer that is either a string of bytes or a UTF-16 string that will
 * be encoded using UTF-8 (to do the latter, specify 'utf8' as the encoding).
 *
 * @param [input] the bytes to wrap (as a string) or a UTF-16 string to encode
 *          as UTF-8.
 * @param [encoding] (default: 'raw', other: 'utf8').
 */
util.createBuffer = function(input, encoding) {
  // TODO: deprecate, use new ByteBuffer() instead
  encoding = encoding || 'raw';
  if(input !== undefined && encoding === 'utf8') {
    input = util.encodeUtf8(input);
  }
  return new util.ByteBuffer(input);
};

/**
 * Fills a string with a particular value. If you want the string to be a byte
 * string, pass in String.fromCharCode(theByte).
 *
 * @param c the character to fill the string with, use String.fromCharCode
 *          to fill the string with a byte value.
 * @param n the number of characters of value c to fill with.
 *
 * @return the filled string.
 */
util.fillString = function(c, n) {
  var s = '';
  while(n > 0) {
    if(n & 1) {
      s += c;
    }
    n >>>= 1;
    if(n > 0) {
      c += c;
    }
  }
  return s;
};

/**
 * Performs a per byte XOR between two byte strings and returns the result as a
 * string of bytes.
 *
 * @param s1 first string of bytes.
 * @param s2 second string of bytes.
 * @param n the number of bytes to XOR.
 *
 * @return the XOR'd result.
 */
util.xorBytes = function(s1, s2, n) {
  var s3 = '';
  var b = '';
  var t = '';
  var i = 0;
  var c = 0;
  for(; n > 0; --n, ++i) {
    b = s1.charCodeAt(i) ^ s2.charCodeAt(i);
    if(c >= 10) {
      s3 += t;
      t = '';
      c = 0;
    }
    t += String.fromCharCode(b);
    ++c;
  }
  s3 += t;
  return s3;
};

/**
 * Converts a hex string into a 'binary' encoded string of bytes.
 *
 * @param hex the hexadecimal string to convert.
 *
 * @return the binary-encoded string of bytes.
 */
util.hexToBytes = function(hex) {
  // TODO: deprecate: "Deprecated. Use util.binary.hex.decode instead."
  var rval = '';
  var i = 0;
  if(hex.length & 1 == 1) {
    // odd number of characters, convert first character alone
    i = 1;
    rval += String.fromCharCode(parseInt(hex[0], 16));
  }
  // convert 2 characters (1 byte) at a time
  for(; i < hex.length; i += 2) {
    rval += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return rval;
};

/**
 * Converts a 'binary' encoded string of bytes to hex.
 *
 * @param bytes the byte string to convert.
 *
 * @return the string of hexadecimal characters.
 */
util.bytesToHex = function(bytes) {
  // TODO: deprecate: "Deprecated. Use util.binary.hex.encode instead."
  return util.createBuffer(bytes).toHex();
};

/**
 * Converts an 32-bit integer to 4-big-endian byte string.
 *
 * @param i the integer.
 *
 * @return the byte string.
 */
util.int32ToBytes = function(i) {
  return (
    String.fromCharCode(i >> 24 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF));
};

// base64 characters, reverse mapping
var _base64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var _base64Idx = [
/*43 -43 = 0*/
/*'+',  1,  2,  3,'/' */
   62, -1, -1, -1, 63,

/*'0','1','2','3','4','5','6','7','8','9' */
   52, 53, 54, 55, 56, 57, 58, 59, 60, 61,

/*15, 16, 17,'=', 19, 20, 21 */
  -1, -1, -1, 64, -1, -1, -1,

/*65 - 43 = 22*/
/*'A','B','C','D','E','F','G','H','I','J','K','L','M', */
   0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12,

/*'N','O','P','Q','R','S','T','U','V','W','X','Y','Z' */
   13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,

/*91 - 43 = 48 */
/*48, 49, 50, 51, 52, 53 */
  -1, -1, -1, -1, -1, -1,

/*97 - 43 = 54*/
/*'a','b','c','d','e','f','g','h','i','j','k','l','m' */
   26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,

/*'n','o','p','q','r','s','t','u','v','w','x','y','z' */
   39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
];

/**
 * Base64 encodes a 'binary' encoded string of bytes.
 *
 * @param input the binary encoded string of bytes to base64-encode.
 * @param maxline the maximum number of encoded characters per line to use,
 *          defaults to none.
 *
 * @return the base64-encoded output.
 */
util.encode64 = function(input, maxline) {
  // TODO: deprecate: "Deprecated. Use util.binary.base64.encode instead."
  var line = '';
  var output = '';
  var chr1, chr2, chr3;
  var i = 0;
  while(i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    // encode 4 character group
    line += _base64.charAt(chr1 >> 2);
    line += _base64.charAt(((chr1 & 3) << 4) | (chr2 >> 4));
    if(isNaN(chr2)) {
      line += '==';
    } else {
      line += _base64.charAt(((chr2 & 15) << 2) | (chr3 >> 6));
      line += isNaN(chr3) ? '=' : _base64.charAt(chr3 & 63);
    }

    if(maxline && line.length > maxline) {
      output += line.substr(0, maxline) + '\r\n';
      line = line.substr(maxline);
    }
  }
  output += line;
  return output;
};

/**
 * Base64 decodes a string into a 'binary' encoded string of bytes.
 *
 * @param input the base64-encoded input.
 *
 * @return the binary encoded string.
 */
util.decode64 = function(input) {
  // TODO: deprecate: "Deprecated. Use util.binary.base64.decode instead."

  // remove all non-base64 characters
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  var output = '';
  var enc1, enc2, enc3, enc4;
  var i = 0;

  while(i < input.length) {
    enc1 = _base64Idx[input.charCodeAt(i++) - 43];
    enc2 = _base64Idx[input.charCodeAt(i++) - 43];
    enc3 = _base64Idx[input.charCodeAt(i++) - 43];
    enc4 = _base64Idx[input.charCodeAt(i++) - 43];

    output += String.fromCharCode((enc1 << 2) | (enc2 >> 4));
    if(enc3 !== 64) {
      // decoded at least 2 bytes
      output += String.fromCharCode(((enc2 & 15) << 4) | (enc3 >> 2));
      if(enc4 !== 64) {
        // decoded 3 bytes
        output += String.fromCharCode(((enc3 & 3) << 6) | enc4);
      }
    }
  }

  return output;
};

/**
 * UTF-8 encodes the given UTF-16 encoded string (a standard JavaScript
 * string). Non-ASCII characters will be encoded as multiple bytes according
 * to UTF-8.
 *
 * @param str the string to encode.
 *
 * @return the UTF-8 encoded string.
 */
util.encodeUtf8 = function(str) {
  return unescape(encodeURIComponent(str));
};

/**
 * Decodes a UTF-8 encoded string into a UTF-16 string.
 *
 * @param str the string to decode.
 *
 * @return the UTF-16 encoded string (standard JavaScript string).
 */
util.decodeUtf8 = function(str) {
  return decodeURIComponent(escape(str));
};

// binary encoding/decoding tools
// FIXME: Experimental. Do not use yet.
util.binary = {
  raw: {},
  hex: {},
  base64: {}
};

/**
 * Encodes a Uint8Array as a binary-encoded string. This encoding uses
 * a value between 0 and 255 for each character.
 *
 * @param bytes the Uint8Array to encode.
 *
 * @return the binary-encoded string.
 */
util.binary.raw.encode = function(bytes) {
  return String.fromCharCode.apply(null, bytes);
};

/**
 * Decodes a binary-encoded string to a Uint8Array. This encoding uses
 * a value between 0 and 255 for each character.
 *
 * @param str the binary-encoded string to decode.
 * @param [output] an optional Uint8Array to write the output to; if it
 *          is too small, an exception will be thrown.
 * @param [offset] the start offset for writing to the output (default: 0).
 *
 * @return the Uint8Array or the number of bytes written if output was given.
 */
util.binary.raw.decode = function(str, output, offset) {
  var out = output;
  if(!out) {
    out = new Uint8Array(str.length);
  }
  offset = offset || 0;
  var j = offset;
  for(var i = 0; i < str.length; ++i) {
    out[j++] = str.charCodeAt(i);
  }
  return output ? (j - offset) : out;
};

/**
 * Encodes a 'binary' string, ArrayBuffer, DataView, TypedArray, or
 * ByteBuffer as a string of hexadecimal characters.
 *
 * @param bytes the bytes to convert.
 *
 * @return the string of hexadecimal characters.
 */
util.binary.hex.encode = util.bytesToHex;

/**
 * Decodes a hex-encoded string to a Uint8Array.
 *
 * @param hex the hexadecimal string to convert.
 * @param [output] an optional Uint8Array to write the output to; if it
 *          is too small, an exception will be thrown.
 * @param [offset] the start offset for writing to the output (default: 0).
 *
 * @return the Uint8Array or the number of bytes written if output was given.
 */
util.binary.hex.decode = function(hex, output, offset) {
  var out = output;
  if(!out) {
    out = new Uint8Array(Math.ceil(hex.length / 2));
  }
  offset = offset || 0;
  var i = 0, j = offset;
  if(hex.length & 1) {
    // odd number of characters, convert first character alone
    i = 1;
    out[j++] = parseInt(hex[0], 16);
  }
  // convert 2 characters (1 byte) at a time
  for(; i < hex.length; i += 2) {
    out[j++] = parseInt(hex.substr(i, 2), 16);
  }
  return output ? (j - offset) : out;
};

/**
 * Base64-encodes a Uint8Array.
 *
 * @param input the Uint8Array to encode.
 * @param maxline the maximum number of encoded characters per line to use,
 *          defaults to none.
 *
 * @return the base64-encoded output string.
 */
util.binary.base64.encode = function(input, maxline) {
  var line = '';
  var output = '';
  var chr1, chr2, chr3;
  var i = 0;
  while(i < input.byteLength) {
    chr1 = input[i++];
    chr2 = input[i++];
    chr3 = input[i++];

    // encode 4 character group
    line += _base64.charAt(chr1 >> 2);
    line += _base64.charAt(((chr1 & 3) << 4) | (chr2 >> 4));
    if(isNaN(chr2)) {
      line += '==';
    } else {
      line += _base64.charAt(((chr2 & 15) << 2) | (chr3 >> 6));
      line += isNaN(chr3) ? '=' : _base64.charAt(chr3 & 63);
    }

    if(maxline && line.length > maxline) {
      output += line.substr(0, maxline) + '\r\n';
      line = line.substr(maxline);
    }
  }
  output += line;
  return output;
};

/**
 * Decodes a base64-encoded string to a Uint8Array.
 *
 * @param input the base64-encoded input string.
 * @param [output] an optional Uint8Array to write the output to; if it
 *          is too small, an exception will be thrown.
 * @param [offset] the start offset for writing to the output (default: 0).
 *
 * @return the Uint8Array or the number of bytes written if output was given.
 */
util.binary.base64.decode = function(input, output, offset) {
  var out = output;
  if(!out) {
    out = new Uint8Array(Math.ceil(input.length / 4) * 3);
  }

  // remove all non-base64 characters
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  offset = offset || 0;
  var enc1, enc2, enc3, enc4;
  var i = 0, j = offset;

  while(i < input.length) {
    enc1 = _base64Idx[input.charCodeAt(i++) - 43];
    enc2 = _base64Idx[input.charCodeAt(i++) - 43];
    enc3 = _base64Idx[input.charCodeAt(i++) - 43];
    enc4 = _base64Idx[input.charCodeAt(i++) - 43];

    out[j++] = (enc1 << 2) | (enc2 >> 4);
    if(enc3 !== 64) {
      // decoded at least 2 bytes
      out[j++] = ((enc2 & 15) << 4) | (enc3 >> 2);
      if(enc4 !== 64) {
        // decoded 3 bytes
        out[j++] = ((enc3 & 3) << 6) | enc4;
      }
    }
  }

  // make sure result is the exact decoded length
  return output ?
         (j - offset) :
         out.subarray(0, j);
};

// text encoding/decoding tools
// FIXME: Experimental. Do not use yet.
util.text = {
  utf8: {},
  utf16: {}
};

/**
 * Encodes the given string as UTF-8 in a Uint8Array.
 *
 * @param str the string to encode.
 * @param [output] an optional Uint8Array to write the output to; if it
 *          is too small, an exception will be thrown.
 * @param [offset] the start offset for writing to the output (default: 0).
 *
 * @return the Uint8Array or the number of bytes written if output was given.
 */
util.text.utf8.encode = function(str, output, offset) {
  str = util.encodeUtf8(str);
  var out = output;
  if(!out) {
    out = new Uint8Array(str.length);
  }
  offset = offset || 0;
  var j = offset;
  for(var i = 0; i < str.length; ++i) {
    out[j++] = str.charCodeAt(i);
  }
  return output ? (j - offset) : out;
};

/**
 * Decodes the UTF-8 contents from a Uint8Array.
 *
 * @param bytes the Uint8Array to decode.
 *
 * @return the resulting string.
 */
util.text.utf8.decode = function(bytes) {
  return util.decodeUtf8(String.fromCharCode.apply(null, bytes));
};

/**
 * Encodes the given string as UTF-16 in a Uint8Array.
 *
 * @param str the string to encode.
 * @param [output] an optional Uint8Array to write the output to; if it
 *          is too small, an exception will be thrown.
 * @param [offset] the start offset for writing to the output (default: 0).
 *
 * @return the Uint8Array or the number of bytes written if output was given.
 */
util.text.utf16.encode = function(str, output, offset) {
  var out = output;
  if(!out) {
    out = new Uint8Array(str.length * 2);
  }
  var view = new Uint16Array(out.buffer);
  offset = offset || 0;
  var j = offset;
  var k = offset;
  for(var i = 0; i < str.length; ++i) {
    view[k++] = str.charCodeAt(i);
    j += 2;
  }
  return output ? (j - offset) : out;
};

/**
 * Decodes the UTF-16 contents from a Uint8Array.
 *
 * @param bytes the Uint8Array to decode.
 *
 * @return the resulting string.
 */
util.text.utf16.decode = function(bytes) {
  return String.fromCharCode.apply(null, new Uint16Array(bytes.buffer));
};

/**
 * Deflates the given data using a flash interface.
 *
 * @param api the flash interface.
 * @param bytes the data.
 * @param raw true to return only raw deflate data, false to include zlib
 *          header and trailer.
 *
 * @return the deflated data as a string.
 */
util.deflate = function(api, bytes, raw) {
  bytes = util.decode64(api.deflate(util.encode64(bytes)).rval);

  // strip zlib header and trailer if necessary
  if(raw) {
    // zlib header is 2 bytes (CMF,FLG) where FLG indicates that
    // there is a 4-byte DICT (alder-32) block before the data if
    // its 5th bit is set
    var start = 2;
    var flg = bytes.charCodeAt(1);
    if(flg & 0x20) {
      start = 6;
    }
    // zlib trailer is 4 bytes of adler-32
    bytes = bytes.substring(start, bytes.length - 4);
  }

  return bytes;
};

/**
 * Inflates the given data using a flash interface.
 *
 * @param api the flash interface.
 * @param bytes the data.
 * @param raw true if the incoming data has no zlib header or trailer and is
 *          raw DEFLATE data.
 *
 * @return the inflated data as a string, null on error.
 */
util.inflate = function(api, bytes, raw) {
  // TODO: add zlib header and trailer if necessary/possible
  var rval = api.inflate(util.encode64(bytes)).rval;
  return (rval === null) ? null : util.decode64(rval);
};

/**
 * Sets a storage object.
 *
 * @param api the storage interface.
 * @param id the storage ID to use.
 * @param obj the storage object, null to remove.
 */
var _setStorageObject = function(api, id, obj) {
  if(!api) {
    throw new Error('WebStorage not available.');
  }

  var rval;
  if(obj === null) {
    rval = api.removeItem(id);
  } else {
    // json-encode and base64-encode object
    obj = util.encode64(JSON.stringify(obj));
    rval = api.setItem(id, obj);
  }

  // handle potential flash error
  if(typeof(rval) !== 'undefined' && rval.rval !== true) {
    var error = new Error(rval.error.message);
    error.id = rval.error.id;
    error.name = rval.error.name;
    throw error;
  }
};

/**
 * Gets a storage object.
 *
 * @param api the storage interface.
 * @param id the storage ID to use.
 *
 * @return the storage object entry or null if none exists.
 */
var _getStorageObject = function(api, id) {
  if(!api) {
    throw new Error('WebStorage not available.');
  }

  // get the existing entry
  var rval = api.getItem(id);

  /* Note: We check api.init because we can't do (api == localStorage)
    on IE because of "Class doesn't support Automation" exception. Only
    the flash api has an init method so this works too, but we need a
    better solution in the future. */

  // flash returns item wrapped in an object, handle special case
  if(api.init) {
    if(rval.rval === null) {
      if(rval.error) {
        var error = new Error(rval.error.message);
        error.id = rval.error.id;
        error.name = rval.error.name;
        throw error;
      }
      // no error, but also no item
      rval = null;
    } else {
      rval = rval.rval;
    }
  }

  // handle decoding
  if(rval !== null) {
    // base64-decode and json-decode data
    rval = JSON.parse(util.decode64(rval));
  }

  return rval;
};

/**
 * Stores an item in local storage.
 *
 * @param api the storage interface.
 * @param id the storage ID to use.
 * @param key the key for the item.
 * @param data the data for the item (any javascript object/primitive).
 */
var _setItem = function(api, id, key, data) {
  // get storage object
  var obj = _getStorageObject(api, id);
  if(obj === null) {
    // create a new storage object
    obj = {};
  }
  // update key
  obj[key] = data;

  // set storage object
  _setStorageObject(api, id, obj);
};

/**
 * Gets an item from local storage.
 *
 * @param api the storage interface.
 * @param id the storage ID to use.
 * @param key the key for the item.
 *
 * @return the item.
 */
var _getItem = function(api, id, key) {
  // get storage object
  var rval = _getStorageObject(api, id);
  if(rval !== null) {
    // return data at key
    rval = (key in rval) ? rval[key] : null;
  }

  return rval;
};

/**
 * Removes an item from local storage.
 *
 * @param api the storage interface.
 * @param id the storage ID to use.
 * @param key the key for the item.
 */
var _removeItem = function(api, id, key) {
  // get storage object
  var obj = _getStorageObject(api, id);
  if(obj !== null && key in obj) {
    // remove key
    delete obj[key];

    // see if entry has no keys remaining
    var empty = true;
    for(var prop in obj) {
      empty = false;
      break;
    }
    if(empty) {
      // remove entry entirely if no keys are left
      obj = null;
    }

    // set storage object
    _setStorageObject(api, id, obj);
  }
};

/**
 * Clears the local disk storage identified by the given ID.
 *
 * @param api the storage interface.
 * @param id the storage ID to use.
 */
var _clearItems = function(api, id) {
  _setStorageObject(api, id, null);
};

/**
 * Calls a storage function.
 *
 * @param func the function to call.
 * @param args the arguments for the function.
 * @param location the location argument.
 *
 * @return the return value from the function.
 */
var _callStorageFunction = function(func, args, location) {
  var rval = null;

  // default storage types
  if(typeof(location) === 'undefined') {
    location = ['web', 'flash'];
  }

  // apply storage types in order of preference
  var type;
  var done = false;
  var exception = null;
  for(var idx in location) {
    type = location[idx];
    try {
      if(type === 'flash' || type === 'both') {
        if(args[0] === null) {
          throw new Error('Flash local storage not available.');
        }
        rval = func.apply(this, args);
        done = (type === 'flash');
      }
      if(type === 'web' || type === 'both') {
        args[0] = localStorage;
        rval = func.apply(this, args);
        done = true;
      }
    } catch(ex) {
      exception = ex;
    }
    if(done) {
      break;
    }
  }

  if(!done) {
    throw exception;
  }

  return rval;
};

/**
 * Stores an item on local disk.
 *
 * The available types of local storage include 'flash', 'web', and 'both'.
 *
 * The type 'flash' refers to flash local storage (SharedObject). In order
 * to use flash local storage, the 'api' parameter must be valid. The type
 * 'web' refers to WebStorage, if supported by the browser. The type 'both'
 * refers to storing using both 'flash' and 'web', not just one or the
 * other.
 *
 * The location array should list the storage types to use in order of
 * preference:
 *
 * ['flash']: flash only storage
 * ['web']: web only storage
 * ['both']: try to store in both
 * ['flash','web']: store in flash first, but if not available, 'web'
 * ['web','flash']: store in web first, but if not available, 'flash'
 *
 * The location array defaults to: ['web', 'flash']
 *
 * @param api the flash interface, null to use only WebStorage.
 * @param id the storage ID to use.
 * @param key the key for the item.
 * @param data the data for the item (any javascript object/primitive).
 * @param location an array with the preferred types of storage to use.
 */
util.setItem = function(api, id, key, data, location) {
  _callStorageFunction(_setItem, arguments, location);
};

/**
 * Gets an item on local disk.
 *
 * Set setItem() for details on storage types.
 *
 * @param api the flash interface, null to use only WebStorage.
 * @param id the storage ID to use.
 * @param key the key for the item.
 * @param location an array with the preferred types of storage to use.
 *
 * @return the item.
 */
util.getItem = function(api, id, key, location) {
  return _callStorageFunction(_getItem, arguments, location);
};

/**
 * Removes an item on local disk.
 *
 * Set setItem() for details on storage types.
 *
 * @param api the flash interface.
 * @param id the storage ID to use.
 * @param key the key for the item.
 * @param location an array with the preferred types of storage to use.
 */
util.removeItem = function(api, id, key, location) {
  _callStorageFunction(_removeItem, arguments, location);
};

/**
 * Clears the local disk storage identified by the given ID.
 *
 * Set setItem() for details on storage types.
 *
 * @param api the flash interface if flash is available.
 * @param id the storage ID to use.
 * @param location an array with the preferred types of storage to use.
 */
util.clearItems = function(api, id, location) {
  _callStorageFunction(_clearItems, arguments, location);
};

/**
 * Parses the scheme, host, and port from an http(s) url.
 *
 * @param str the url string.
 *
 * @return the parsed url object or null if the url is invalid.
 */
util.parseUrl = function(str) {
  // FIXME: this regex looks a bit broken
  var regex = /^(https?):\/\/([^:&^\/]*):?(\d*)(.*)$/g;
  regex.lastIndex = 0;
  var m = regex.exec(str);
  var url = (m === null) ? null : {
    full: str,
    scheme: m[1],
    host: m[2],
    port: m[3],
    path: m[4]
  };
  if(url) {
    url.fullHost = url.host;
    if(url.port) {
      if(url.port !== 80 && url.scheme === 'http') {
        url.fullHost += ':' + url.port;
      } else if(url.port !== 443 && url.scheme === 'https') {
        url.fullHost += ':' + url.port;
      }
    } else if(url.scheme === 'http') {
      url.port = 80;
    } else if(url.scheme === 'https') {
      url.port = 443;
    }
    url.full = url.scheme + '://' + url.fullHost;
  }
  return url;
};

/* Storage for query variables */
var _queryVariables = null;

/**
 * Returns the window location query variables. Query is parsed on the first
 * call and the same object is returned on subsequent calls. The mapping
 * is from keys to an array of values. Parameters without values will have
 * an object key set but no value added to the value array. Values are
 * unescaped.
 *
 * ...?k1=v1&k2=v2:
 * {
 *   "k1": ["v1"],
 *   "k2": ["v2"]
 * }
 *
 * ...?k1=v1&k1=v2:
 * {
 *   "k1": ["v1", "v2"]
 * }
 *
 * ...?k1=v1&k2:
 * {
 *   "k1": ["v1"],
 *   "k2": []
 * }
 *
 * ...?k1=v1&k1:
 * {
 *   "k1": ["v1"]
 * }
 *
 * ...?k1&k1:
 * {
 *   "k1": []
 * }
 *
 * @param query the query string to parse (optional, default to cached
 *          results from parsing window location search query).
 *
 * @return object mapping keys to variables.
 */
util.getQueryVariables = function(query) {
  var parse = function(q) {
    var rval = {};
    var kvpairs = q.split('&');
    for(var i = 0; i < kvpairs.length; i++) {
      var pos = kvpairs[i].indexOf('=');
      var key;
      var val;
      if(pos > 0) {
        key = kvpairs[i].substring(0, pos);
        val = kvpairs[i].substring(pos + 1);
      } else {
        key = kvpairs[i];
        val = null;
      }
      if(!(key in rval)) {
        rval[key] = [];
      }
      // disallow overriding object prototype keys
      if(!(key in Object.prototype) && val !== null) {
        rval[key].push(unescape(val));
      }
    }
    return rval;
  };

   var rval;
   if(typeof(query) === 'undefined') {
     // set cached variables if needed
     if(_queryVariables === null) {
       if(typeof(window) !== 'undefined' && window.location && window.location.search) {
          // parse window search query
          _queryVariables = parse(window.location.search.substring(1));
       } else {
          // no query variables available
          _queryVariables = {};
       }
     }
     rval = _queryVariables;
   } else {
     // parse given query
     rval = parse(query);
   }
   return rval;
};

/**
 * Parses a fragment into a path and query. This method will take a URI
 * fragment and break it up as if it were the main URI. For example:
 *    /bar/baz?a=1&b=2
 * results in:
 *    {
 *       path: ["bar", "baz"],
 *       query: {"k1": ["v1"], "k2": ["v2"]}
 *    }
 *
 * @return object with a path array and query object.
 */
util.parseFragment = function(fragment) {
  // default to whole fragment
  var fp = fragment;
  var fq = '';
  // split into path and query if possible at the first '?'
  var pos = fragment.indexOf('?');
  if(pos > 0) {
    fp = fragment.substring(0, pos);
    fq = fragment.substring(pos + 1);
  }
  // split path based on '/' and ignore first element if empty
  var path = fp.split('/');
  if(path.length > 0 && path[0] === '') {
    path.shift();
  }
  // convert query into object
  var query = (fq === '') ? {} : util.getQueryVariables(fq);

  return {
    pathString: fp,
    queryString: fq,
    path: path,
    query: query
  };
};

/**
 * Makes a request out of a URI-like request string. This is intended to
 * be used where a fragment id (after a URI '#') is parsed as a URI with
 * path and query parts. The string should have a path beginning and
 * delimited by '/' and optional query parameters following a '?'. The
 * query should be a standard URL set of key value pairs delimited by
 * '&'. For backwards compatibility the initial '/' on the path is not
 * required. The request object has the following API, (fully described
 * in the method code):
 *    {
 *       path: <the path string part>.
 *       query: <the query string part>,
 *       getPath(i): get part or all of the split path array,
 *       getQuery(k, i): get part or all of a query key array,
 *       getQueryLast(k, _default): get last element of a query key array.
 *    }
 *
 * @return object with request parameters.
 */
util.makeRequest = function(reqString) {
  var frag = util.parseFragment(reqString);
  var req = {
    // full path string
    path: frag.pathString,
    // full query string
    query: frag.queryString,
    /**
     * Get path or element in path.
     *
     * @param i optional path index.
     *
     * @return path or part of path if i provided.
     */
    getPath: function(i) {
      return (typeof(i) === 'undefined') ? frag.path : frag.path[i];
    },
    /**
     * Get query, values for a key, or value for a key index.
     *
     * @param k optional query key.
     * @param i optional query key index.
     *
     * @return query, values for a key, or value for a key index.
     */
    getQuery: function(k, i) {
      var rval;
      if(typeof(k) === 'undefined') {
        rval = frag.query;
      } else {
        rval = frag.query[k];
        if(rval && typeof(i) !== 'undefined') {
           rval = rval[i];
        }
      }
      return rval;
    },
    getQueryLast: function(k, _default) {
      var rval;
      var vals = req.getQuery(k);
      if(vals) {
        rval = vals[vals.length - 1];
      } else {
        rval = _default;
      }
      return rval;
    }
  };
  return req;
};

/**
 * Makes a URI out of a path, an object with query parameters, and a
 * fragment. Uses jQuery.param() internally for query string creation.
 * If the path is an array, it will be joined with '/'.
 *
 * @param path string path or array of strings.
 * @param query object with query parameters. (optional)
 * @param fragment fragment string. (optional)
 *
 * @return string object with request parameters.
 */
util.makeLink = function(path, query, fragment) {
  // join path parts if needed
  path = jQuery.isArray(path) ? path.join('/') : path;

  var qstr = jQuery.param(query || {});
  fragment = fragment || '';
  return path +
    ((qstr.length > 0) ? ('?' + qstr) : '') +
    ((fragment.length > 0) ? ('#' + fragment) : '');
};

/**
 * Follows a path of keys deep into an object hierarchy and set a value.
 * If a key does not exist or it's value is not an object, create an
 * object in it's place. This can be destructive to a object tree if
 * leaf nodes are given as non-final path keys.
 * Used to avoid exceptions from missing parts of the path.
 *
 * @param object the starting object.
 * @param keys an array of string keys.
 * @param value the value to set.
 */
util.setPath = function(object, keys, value) {
  // need to start at an object
  if(typeof(object) === 'object' && object !== null) {
    var i = 0;
    var len = keys.length;
    while(i < len) {
      var next = keys[i++];
      if(i == len) {
        // last
        object[next] = value;
      } else {
        // more
        var hasNext = (next in object);
        if(!hasNext ||
          (hasNext && typeof(object[next]) !== 'object') ||
          (hasNext && object[next] === null)) {
          object[next] = {};
        }
        object = object[next];
      }
    }
  }
};

/**
 * Follows a path of keys deep into an object hierarchy and return a value.
 * If a key does not exist, create an object in it's place.
 * Used to avoid exceptions from missing parts of the path.
 *
 * @param object the starting object.
 * @param keys an array of string keys.
 * @param _default value to return if path not found.
 *
 * @return the value at the path if found, else default if given, else
 *         undefined.
 */
util.getPath = function(object, keys, _default) {
  var i = 0;
  var len = keys.length;
  var hasNext = true;
  while(hasNext && i < len &&
    typeof(object) === 'object' && object !== null) {
    var next = keys[i++];
    hasNext = next in object;
    if(hasNext) {
      object = object[next];
    }
  }
  return (hasNext ? object : _default);
};

/**
 * Follow a path of keys deep into an object hierarchy and delete the
 * last one. If a key does not exist, do nothing.
 * Used to avoid exceptions from missing parts of the path.
 *
 * @param object the starting object.
 * @param keys an array of string keys.
 */
util.deletePath = function(object, keys) {
  // need to start at an object
  if(typeof(object) === 'object' && object !== null) {
    var i = 0;
    var len = keys.length;
    while(i < len) {
      var next = keys[i++];
      if(i == len) {
        // last
        delete object[next];
      } else {
        // more
        if(!(next in object) ||
          (typeof(object[next]) !== 'object') ||
          (object[next] === null)) {
           break;
        }
        object = object[next];
      }
    }
  }
};

/**
 * Check if an object is empty.
 *
 * Taken from:
 * http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object-from-json/679937#679937
 *
 * @param object the object to check.
 */
util.isEmpty = function(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};

/**
 * Format with simple printf-style interpolation.
 *
 * %%: literal '%'
 * %s,%o: convert next argument into a string.
 *
 * @param format the string to format.
 * @param ... arguments to interpolate into the format string.
 */
util.format = function(format) {
  var re = /%./g;
  // current match
  var match;
  // current part
  var part;
  // current arg index
  var argi = 0;
  // collected parts to recombine later
  var parts = [];
  // last index found
  var last = 0;
  // loop while matches remain
  while((match = re.exec(format))) {
    part = format.substring(last, re.lastIndex - 2);
    // don't add empty strings (ie, parts between %s%s)
    if(part.length > 0) {
      parts.push(part);
    }
    last = re.lastIndex;
    // switch on % code
    var code = match[0][1];
    switch(code) {
    case 's':
    case 'o':
      // check if enough arguments were given
      if(argi < arguments.length) {
        parts.push(arguments[argi++ + 1]);
      } else {
        parts.push('<?>');
      }
      break;
    // FIXME: do proper formating for numbers, etc
    //case 'f':
    //case 'd':
    case '%':
      parts.push('%');
      break;
    default:
      parts.push('<%' + code + '?>');
    }
  }
  // add trailing part of format string
  parts.push(format.substring(last));
  return parts.join('');
};

/**
 * Formats a number.
 *
 * http://snipplr.com/view/5945/javascript-numberformat--ported-from-php/
 */
util.formatNumber = function(number, decimals, dec_point, thousands_sep) {
  // http://kevin.vanzonneveld.net
  // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +     bugfix by: Michael White (http://crestidg.com)
  // +     bugfix by: Benjamin Lupton
  // +     bugfix by: Allan Jensen (http://www.winternet.no)
  // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // *     example 1: number_format(1234.5678, 2, '.', '');
  // *     returns 1: 1234.57

  var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
  var d = dec_point === undefined ? ',' : dec_point;
  var t = thousands_sep === undefined ?
   '.' : thousands_sep, s = n < 0 ? '-' : '';
  var i = parseInt((n = Math.abs(+n || 0).toFixed(c)), 10) + '';
  var j = (i.length > 3) ? i.length % 3 : 0;
  return s + (j ? i.substr(0, j) + t : '') +
    i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
    (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

/**
 * Formats a byte size.
 *
 * http://snipplr.com/view/5949/format-humanize-file-byte-size-presentation-in-javascript/
 */
util.formatSize = function(size) {
  if(size >= 1073741824) {
    size = util.formatNumber(size / 1073741824, 2, '.', '') + ' GiB';
  } else if(size >= 1048576) {
    size = util.formatNumber(size / 1048576, 2, '.', '') + ' MiB';
  } else if(size >= 1024) {
    size = util.formatNumber(size / 1024, 0) + ' KiB';
  } else {
    size = util.formatNumber(size, 0) + ' bytes';
  }
  return size;
};

/**
 * Converts an IPv4 or IPv6 string representation into bytes (in network order).
 *
 * @param ip the IPv4 or IPv6 address to convert.
 *
 * @return the 4-byte IPv6 or 16-byte IPv6 address or null if the address can't
 *         be parsed.
 */
util.bytesFromIP = function(ip) {
  if(ip.indexOf('.') !== -1) {
    return util.bytesFromIPv4(ip);
  }
  if(ip.indexOf(':') !== -1) {
    return util.bytesFromIPv6(ip);
  }
  return null;
};

/**
 * Converts an IPv4 string representation into bytes (in network order).
 *
 * @param ip the IPv4 address to convert.
 *
 * @return the 4-byte address or null if the address can't be parsed.
 */
util.bytesFromIPv4 = function(ip) {
  ip = ip.split('.');
  if(ip.length !== 4) {
    return null;
  }
  var b = util.createBuffer();
  for(var i = 0; i < ip.length; ++i) {
    var num = parseInt(ip[i], 10);
    if(isNaN(num)) {
      return null;
    }
    b.putByte(num);
  }
  return b.getBytes();
};

/**
 * Converts an IPv6 string representation into bytes (in network order).
 *
 * @param ip the IPv6 address to convert.
 *
 * @return the 16-byte address or null if the address can't be parsed.
 */
util.bytesFromIPv6 = function(ip) {
  var blanks = 0;
  ip = ip.split(':').filter(function(e) {
    if(e.length === 0) ++blanks;
    return true;
  });
  var zeros = (8 - ip.length + blanks) * 2;
  var b = util.createBuffer();
  for(var i = 0; i < 8; ++i) {
    if(!ip[i] || ip[i].length === 0) {
      b.fillWithByte(0, zeros);
      zeros = 0;
      continue;
    }
    var bytes = util.hexToBytes(ip[i]);
    if(bytes.length < 2) {
      b.putByte(0);
    }
    b.putBytes(bytes);
  }
  return b.getBytes();
};

/**
 * Converts 4-bytes into an IPv4 string representation or 16-bytes into
 * an IPv6 string representation. The bytes must be in network order.
 *
 * @param bytes the bytes to convert.
 *
 * @return the IPv4 or IPv6 string representation if 4 or 16 bytes,
 *         respectively, are given, otherwise null.
 */
util.bytesToIP = function(bytes) {
  if(bytes.length === 4) {
    return util.bytesToIPv4(bytes);
  }
  if(bytes.length === 16) {
    return util.bytesToIPv6(bytes);
  }
  return null;
};

/**
 * Converts 4-bytes into an IPv4 string representation. The bytes must be
 * in network order.
 *
 * @param bytes the bytes to convert.
 *
 * @return the IPv4 string representation or null for an invalid # of bytes.
 */
util.bytesToIPv4 = function(bytes) {
  if(bytes.length !== 4) {
    return null;
  }
  var ip = [];
  for(var i = 0; i < bytes.length; ++i) {
    ip.push(bytes.charCodeAt(i));
  }
  return ip.join('.');
};

/**
 * Converts 16-bytes into an IPv16 string representation. The bytes must be
 * in network order.
 *
 * @param bytes the bytes to convert.
 *
 * @return the IPv16 string representation or null for an invalid # of bytes.
 */
util.bytesToIPv6 = function(bytes) {
  if(bytes.length !== 16) {
    return null;
  }
  var ip = [];
  var zeroGroups = [];
  var zeroMaxGroup = 0;
  for(var i = 0; i < bytes.length; i += 2) {
    var hex = util.bytesToHex(bytes[i] + bytes[i + 1]);
    // canonicalize zero representation
    while(hex[0] === '0' && hex !== '0') {
      hex = hex.substr(1);
    }
    if(hex === '0') {
      var last = zeroGroups[zeroGroups.length - 1];
      var idx = ip.length;
      if(!last || idx !== last.end + 1) {
        zeroGroups.push({start: idx, end: idx});
      } else {
        last.end = idx;
        if((last.end - last.start) >
          (zeroGroups[zeroMaxGroup].end - zeroGroups[zeroMaxGroup].start)) {
          zeroMaxGroup = zeroGroups.length - 1;
        }
      }
    }
    ip.push(hex);
  }
  if(zeroGroups.length > 0) {
    var group = zeroGroups[zeroMaxGroup];
    // only shorten group of length > 0
    if(group.end - group.start > 0) {
      ip.splice(group.start, group.end - group.start + 1, '');
      if(group.start === 0) {
        ip.unshift('');
      }
      if(group.end === 7) {
        ip.push('');
      }
    }
  }
  return ip.join(':');
};

/**
 * Estimates the number of processes that can be run concurrently. If
 * creating Web Workers, keep in mind that the main JavaScript process needs
 * its own core.
 *
 * @param options the options to use:
 *          update true to force an update (not use the cached value).
 * @param callback(err, max) called once the operation completes.
 */
util.estimateCores = function(options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  if('cores' in util && !options.update) {
    return callback(null, util.cores);
  }
  if(typeof navigator !== 'undefined' &&
    'hardwareConcurrency' in navigator &&
    navigator.hardwareConcurrency > 0) {
    util.cores = navigator.hardwareConcurrency;
    return callback(null, util.cores);
  }
  if(typeof Worker === 'undefined') {
    // workers not available
    util.cores = 1;
    return callback(null, util.cores);
  }
  if(typeof Blob === 'undefined') {
    // can't estimate, default to 2
    util.cores = 2;
    return callback(null, util.cores);
  }

  // create worker concurrency estimation code as blob
  var blobUrl = URL.createObjectURL(new Blob(['(',
    function() {
      self.addEventListener('message', function(e) {
        // run worker for 4 ms
        var st = Date.now();
        var et = st + 4;
        while(Date.now() < et);
        self.postMessage({st: st, et: et});
      });
    }.toString(),
  ')()'], {type: 'application/javascript'}));

  // take 5 samples using 16 workers
  sample([], 5, 16);

  function sample(max, samples, numWorkers) {
    if(samples === 0) {
      // get overlap average
      var avg = Math.floor(max.reduce(function(avg, x) {
        return avg + x;
      }, 0) / max.length);
      util.cores = Math.max(1, avg);
      URL.revokeObjectURL(blobUrl);
      return callback(null, util.cores);
    }
    map(numWorkers, function(err, results) {
      max.push(reduce(numWorkers, results));
      sample(max, samples - 1, numWorkers);
    });
  }

  function map(numWorkers, callback) {
    var workers = [];
    var results = [];
    for(var i = 0; i < numWorkers; ++i) {
      var worker = new Worker(blobUrl);
      worker.addEventListener('message', function(e) {
        results.push(e.data);
        if(results.length === numWorkers) {
          for(var i = 0; i < numWorkers; ++i) {
            workers[i].terminate();
          }
          callback(null, results);
        }
      });
      workers.push(worker);
    }
    for(var i = 0; i < numWorkers; ++i) {
      workers[i].postMessage(i);
    }
  }

  function reduce(numWorkers, results) {
    // find overlapping time windows
    var overlaps = [];
    for(var n = 0; n < numWorkers; ++n) {
      var r1 = results[n];
      var overlap = overlaps[n] = [];
      for(var i = 0; i < numWorkers; ++i) {
        if(n === i) {
          continue;
        }
        var r2 = results[i];
        if((r1.st > r2.st && r1.st < r2.et) ||
          (r2.st > r1.st && r2.st < r1.et)) {
          overlap.push(i);
        }
      }
    }
    // get maximum overlaps ... don't include overlapping worker itself
    // as the main JS process was also being scheduled during the work and
    // would have to be subtracted from the estimate anyway
    return overlaps.reduce(function(max, overlap) {
      return Math.max(max, overlap.length);
    }, 0);
  }
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Advanced Encryption Standard (AES) implementation.
 *
 * This implementation is based on the public domain library 'jscrypto' which
 * was written by:
 *
 * Emily Stark (estark@stanford.edu)
 * Mike Hamburg (mhamburg@stanford.edu)
 * Dan Boneh (dabo@cs.stanford.edu)
 *
 * Parts of this code are based on the OpenSSL implementation of AES:
 * http://www.openssl.org
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2014 Digital Bazaar, Inc.
 */
var forge = __webpack_require__(0);
__webpack_require__(3);
__webpack_require__(4);
__webpack_require__(1);

/* AES API */
module.exports = forge.aes = forge.aes || {};

/**
 * Deprecated. Instead, use:
 *
 * var cipher = forge.cipher.createCipher('AES-<mode>', key);
 * cipher.start({iv: iv});
 *
 * Creates an AES cipher object to encrypt data using the given symmetric key.
 * The output will be stored in the 'output' member of the returned cipher.
 *
 * The key and iv may be given as a string of bytes, an array of bytes,
 * a byte buffer, or an array of 32-bit words.
 *
 * @param key the symmetric key to use.
 * @param iv the initialization vector to use.
 * @param output the buffer to write to, null to create one.
 * @param mode the cipher mode to use (default: 'CBC').
 *
 * @return the cipher.
 */
forge.aes.startEncrypting = function(key, iv, output, mode) {
  var cipher = _createCipher({
    key: key,
    output: output,
    decrypt: false,
    mode: mode
  });
  cipher.start(iv);
  return cipher;
};

/**
 * Deprecated. Instead, use:
 *
 * var cipher = forge.cipher.createCipher('AES-<mode>', key);
 *
 * Creates an AES cipher object to encrypt data using the given symmetric key.
 *
 * The key may be given as a string of bytes, an array of bytes, a
 * byte buffer, or an array of 32-bit words.
 *
 * @param key the symmetric key to use.
 * @param mode the cipher mode to use (default: 'CBC').
 *
 * @return the cipher.
 */
forge.aes.createEncryptionCipher = function(key, mode) {
  return _createCipher({
    key: key,
    output: null,
    decrypt: false,
    mode: mode
  });
};

/**
 * Deprecated. Instead, use:
 *
 * var decipher = forge.cipher.createDecipher('AES-<mode>', key);
 * decipher.start({iv: iv});
 *
 * Creates an AES cipher object to decrypt data using the given symmetric key.
 * The output will be stored in the 'output' member of the returned cipher.
 *
 * The key and iv may be given as a string of bytes, an array of bytes,
 * a byte buffer, or an array of 32-bit words.
 *
 * @param key the symmetric key to use.
 * @param iv the initialization vector to use.
 * @param output the buffer to write to, null to create one.
 * @param mode the cipher mode to use (default: 'CBC').
 *
 * @return the cipher.
 */
forge.aes.startDecrypting = function(key, iv, output, mode) {
  var cipher = _createCipher({
    key: key,
    output: output,
    decrypt: true,
    mode: mode
  });
  cipher.start(iv);
  return cipher;
};

/**
 * Deprecated. Instead, use:
 *
 * var decipher = forge.cipher.createDecipher('AES-<mode>', key);
 *
 * Creates an AES cipher object to decrypt data using the given symmetric key.
 *
 * The key may be given as a string of bytes, an array of bytes, a
 * byte buffer, or an array of 32-bit words.
 *
 * @param key the symmetric key to use.
 * @param mode the cipher mode to use (default: 'CBC').
 *
 * @return the cipher.
 */
forge.aes.createDecryptionCipher = function(key, mode) {
  return _createCipher({
    key: key,
    output: null,
    decrypt: true,
    mode: mode
  });
};

/**
 * Creates a new AES cipher algorithm object.
 *
 * @param name the name of the algorithm.
 * @param mode the mode factory function.
 *
 * @return the AES algorithm object.
 */
forge.aes.Algorithm = function(name, mode) {
  if(!init) {
    initialize();
  }
  var self = this;
  self.name = name;
  self.mode = new mode({
    blockSize: 16,
    cipher: {
      encrypt: function(inBlock, outBlock) {
        return _updateBlock(self._w, inBlock, outBlock, false);
      },
      decrypt: function(inBlock, outBlock) {
        return _updateBlock(self._w, inBlock, outBlock, true);
      }
    }
  });
  self._init = false;
};

/**
 * Initializes this AES algorithm by expanding its key.
 *
 * @param options the options to use.
 *          key the key to use with this algorithm.
 *          decrypt true if the algorithm should be initialized for decryption,
 *            false for encryption.
 */
forge.aes.Algorithm.prototype.initialize = function(options) {
  if(this._init) {
    return;
  }

  var key = options.key;
  var tmp;

  /* Note: The key may be a string of bytes, an array of bytes, a byte
    buffer, or an array of 32-bit integers. If the key is in bytes, then
    it must be 16, 24, or 32 bytes in length. If it is in 32-bit
    integers, it must be 4, 6, or 8 integers long. */

  if(typeof key === 'string' &&
    (key.length === 16 || key.length === 24 || key.length === 32)) {
    // convert key string into byte buffer
    key = forge.util.createBuffer(key);
  } else if(forge.util.isArray(key) &&
    (key.length === 16 || key.length === 24 || key.length === 32)) {
    // convert key integer array into byte buffer
    tmp = key;
    key = forge.util.createBuffer();
    for(var i = 0; i < tmp.length; ++i) {
      key.putByte(tmp[i]);
    }
  }

  // convert key byte buffer into 32-bit integer array
  if(!forge.util.isArray(key)) {
    tmp = key;
    key = [];

    // key lengths of 16, 24, 32 bytes allowed
    var len = tmp.length();
    if(len === 16 || len === 24 || len === 32) {
      len = len >>> 2;
      for(var i = 0; i < len; ++i) {
        key.push(tmp.getInt32());
      }
    }
  }

  // key must be an array of 32-bit integers by now
  if(!forge.util.isArray(key) ||
    !(key.length === 4 || key.length === 6 || key.length === 8)) {
    throw new Error('Invalid key parameter.');
  }

  // encryption operation is always used for these modes
  var mode = this.mode.name;
  var encryptOp = (['CFB', 'OFB', 'CTR', 'GCM'].indexOf(mode) !== -1);

  // do key expansion
  this._w = _expandKey(key, options.decrypt && !encryptOp);
  this._init = true;
};

/**
 * Expands a key. Typically only used for testing.
 *
 * @param key the symmetric key to expand, as an array of 32-bit words.
 * @param decrypt true to expand for decryption, false for encryption.
 *
 * @return the expanded key.
 */
forge.aes._expandKey = function(key, decrypt) {
  if(!init) {
    initialize();
  }
  return _expandKey(key, decrypt);
};

/**
 * Updates a single block. Typically only used for testing.
 *
 * @param w the expanded key to use.
 * @param input an array of block-size 32-bit words.
 * @param output an array of block-size 32-bit words.
 * @param decrypt true to decrypt, false to encrypt.
 */
forge.aes._updateBlock = _updateBlock;

/** Register AES algorithms **/

registerAlgorithm('AES-CBC', forge.cipher.modes.cbc);

function registerAlgorithm(name, mode) {
  var factory = function() {
    return new forge.aes.Algorithm(name, mode);
  };
  forge.cipher.registerAlgorithm(name, factory);
}

/** AES implementation **/

var init = false; // not yet initialized
var Nb = 4;       // number of words comprising the state (AES = 4)
var sbox;         // non-linear substitution table used in key expansion
var isbox;        // inversion of sbox
var rcon;         // round constant word array
var mix;          // mix-columns table
var imix;         // inverse mix-columns table

/**
 * Performs initialization, ie: precomputes tables to optimize for speed.
 *
 * One way to understand how AES works is to imagine that 'addition' and
 * 'multiplication' are interfaces that require certain mathematical
 * properties to hold true (ie: they are associative) but they might have
 * different implementations and produce different kinds of results ...
 * provided that their mathematical properties remain true. AES defines
 * its own methods of addition and multiplication but keeps some important
 * properties the same, ie: associativity and distributivity. The
 * explanation below tries to shed some light on how AES defines addition
 * and multiplication of bytes and 32-bit words in order to perform its
 * encryption and decryption algorithms.
 *
 * The basics:
 *
 * The AES algorithm views bytes as binary representations of polynomials
 * that have either 1 or 0 as the coefficients. It defines the addition
 * or subtraction of two bytes as the XOR operation. It also defines the
 * multiplication of two bytes as a finite field referred to as GF(2^8)
 * (Note: 'GF' means "Galois Field" which is a field that contains a finite
 * number of elements so GF(2^8) has 256 elements).
 *
 * This means that any two bytes can be represented as binary polynomials;
 * when they multiplied together and modularly reduced by an irreducible
 * polynomial of the 8th degree, the results are the field GF(2^8). The
 * specific irreducible polynomial that AES uses in hexadecimal is 0x11b.
 * This multiplication is associative with 0x01 as the identity:
 *
 * (b * 0x01 = GF(b, 0x01) = b).
 *
 * The operation GF(b, 0x02) can be performed at the byte level by left
 * shifting b once and then XOR'ing it (to perform the modular reduction)
 * with 0x11b if b is >= 128. Repeated application of the multiplication
 * of 0x02 can be used to implement the multiplication of any two bytes.
 *
 * For instance, multiplying 0x57 and 0x13, denoted as GF(0x57, 0x13), can
 * be performed by factoring 0x13 into 0x01, 0x02, and 0x10. Then these
 * factors can each be multiplied by 0x57 and then added together. To do
 * the multiplication, values for 0x57 multiplied by each of these 3 factors
 * can be precomputed and stored in a table. To add them, the values from
 * the table are XOR'd together.
 *
 * AES also defines addition and multiplication of words, that is 4-byte
 * numbers represented as polynomials of 3 degrees where the coefficients
 * are the values of the bytes.
 *
 * The word [a0, a1, a2, a3] is a polynomial a3x^3 + a2x^2 + a1x + a0.
 *
 * Addition is performed by XOR'ing like powers of x. Multiplication
 * is performed in two steps, the first is an algebriac expansion as
 * you would do normally (where addition is XOR). But the result is
 * a polynomial larger than 3 degrees and thus it cannot fit in a word. So
 * next the result is modularly reduced by an AES-specific polynomial of
 * degree 4 which will always produce a polynomial of less than 4 degrees
 * such that it will fit in a word. In AES, this polynomial is x^4 + 1.
 *
 * The modular product of two polynomials 'a' and 'b' is thus:
 *
 * d(x) = d3x^3 + d2x^2 + d1x + d0
 * with
 * d0 = GF(a0, b0) ^ GF(a3, b1) ^ GF(a2, b2) ^ GF(a1, b3)
 * d1 = GF(a1, b0) ^ GF(a0, b1) ^ GF(a3, b2) ^ GF(a2, b3)
 * d2 = GF(a2, b0) ^ GF(a1, b1) ^ GF(a0, b2) ^ GF(a3, b3)
 * d3 = GF(a3, b0) ^ GF(a2, b1) ^ GF(a1, b2) ^ GF(a0, b3)
 *
 * As a matrix:
 *
 * [d0] = [a0 a3 a2 a1][b0]
 * [d1]   [a1 a0 a3 a2][b1]
 * [d2]   [a2 a1 a0 a3][b2]
 * [d3]   [a3 a2 a1 a0][b3]
 *
 * Special polynomials defined by AES (0x02 == {02}):
 * a(x)    = {03}x^3 + {01}x^2 + {01}x + {02}
 * a^-1(x) = {0b}x^3 + {0d}x^2 + {09}x + {0e}.
 *
 * These polynomials are used in the MixColumns() and InverseMixColumns()
 * operations, respectively, to cause each element in the state to affect
 * the output (referred to as diffusing).
 *
 * RotWord() uses: a0 = a1 = a2 = {00} and a3 = {01}, which is the
 * polynomial x3.
 *
 * The ShiftRows() method modifies the last 3 rows in the state (where
 * the state is 4 words with 4 bytes per word) by shifting bytes cyclically.
 * The 1st byte in the second row is moved to the end of the row. The 1st
 * and 2nd bytes in the third row are moved to the end of the row. The 1st,
 * 2nd, and 3rd bytes are moved in the fourth row.
 *
 * More details on how AES arithmetic works:
 *
 * In the polynomial representation of binary numbers, XOR performs addition
 * and subtraction and multiplication in GF(2^8) denoted as GF(a, b)
 * corresponds with the multiplication of polynomials modulo an irreducible
 * polynomial of degree 8. In other words, for AES, GF(a, b) will multiply
 * polynomial 'a' with polynomial 'b' and then do a modular reduction by
 * an AES-specific irreducible polynomial of degree 8.
 *
 * A polynomial is irreducible if its only divisors are one and itself. For
 * the AES algorithm, this irreducible polynomial is:
 *
 * m(x) = x^8 + x^4 + x^3 + x + 1,
 *
 * or {01}{1b} in hexadecimal notation, where each coefficient is a bit:
 * 100011011 = 283 = 0x11b.
 *
 * For example, GF(0x57, 0x83) = 0xc1 because
 *
 * 0x57 = 87  = 01010111 = x^6 + x^4 + x^2 + x + 1
 * 0x85 = 131 = 10000101 = x^7 + x + 1
 *
 * (x^6 + x^4 + x^2 + x + 1) * (x^7 + x + 1)
 * =  x^13 + x^11 + x^9 + x^8 + x^7 +
 *    x^7 + x^5 + x^3 + x^2 + x +
 *    x^6 + x^4 + x^2 + x + 1
 * =  x^13 + x^11 + x^9 + x^8 + x^6 + x^5 + x^4 + x^3 + 1 = y
 *    y modulo (x^8 + x^4 + x^3 + x + 1)
 * =  x^7 + x^6 + 1.
 *
 * The modular reduction by m(x) guarantees the result will be a binary
 * polynomial of less than degree 8, so that it can fit in a byte.
 *
 * The operation to multiply a binary polynomial b with x (the polynomial
 * x in binary representation is 00000010) is:
 *
 * b_7x^8 + b_6x^7 + b_5x^6 + b_4x^5 + b_3x^4 + b_2x^3 + b_1x^2 + b_0x^1
 *
 * To get GF(b, x) we must reduce that by m(x). If b_7 is 0 (that is the
 * most significant bit is 0 in b) then the result is already reduced. If
 * it is 1, then we can reduce it by subtracting m(x) via an XOR.
 *
 * It follows that multiplication by x (00000010 or 0x02) can be implemented
 * by performing a left shift followed by a conditional bitwise XOR with
 * 0x1b. This operation on bytes is denoted by xtime(). Multiplication by
 * higher powers of x can be implemented by repeated application of xtime().
 *
 * By adding intermediate results, multiplication by any constant can be
 * implemented. For instance:
 *
 * GF(0x57, 0x13) = 0xfe because:
 *
 * xtime(b) = (b & 128) ? (b << 1 ^ 0x11b) : (b << 1)
 *
 * Note: We XOR with 0x11b instead of 0x1b because in javascript our
 * datatype for b can be larger than 1 byte, so a left shift will not
 * automatically eliminate bits that overflow a byte ... by XOR'ing the
 * overflow bit with 1 (the extra one from 0x11b) we zero it out.
 *
 * GF(0x57, 0x02) = xtime(0x57) = 0xae
 * GF(0x57, 0x04) = xtime(0xae) = 0x47
 * GF(0x57, 0x08) = xtime(0x47) = 0x8e
 * GF(0x57, 0x10) = xtime(0x8e) = 0x07
 *
 * GF(0x57, 0x13) = GF(0x57, (0x01 ^ 0x02 ^ 0x10))
 *
 * And by the distributive property (since XOR is addition and GF() is
 * multiplication):
 *
 * = GF(0x57, 0x01) ^ GF(0x57, 0x02) ^ GF(0x57, 0x10)
 * = 0x57 ^ 0xae ^ 0x07
 * = 0xfe.
 */
function initialize() {
  init = true;

  /* Populate the Rcon table. These are the values given by
    [x^(i-1),{00},{00},{00}] where x^(i-1) are powers of x (and x = 0x02)
    in the field of GF(2^8), where i starts at 1.

    rcon[0] = [0x00, 0x00, 0x00, 0x00]
    rcon[1] = [0x01, 0x00, 0x00, 0x00] 2^(1-1) = 2^0 = 1
    rcon[2] = [0x02, 0x00, 0x00, 0x00] 2^(2-1) = 2^1 = 2
    ...
    rcon[9]  = [0x1B, 0x00, 0x00, 0x00] 2^(9-1)  = 2^8 = 0x1B
    rcon[10] = [0x36, 0x00, 0x00, 0x00] 2^(10-1) = 2^9 = 0x36

    We only store the first byte because it is the only one used.
  */
  rcon = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36];

  // compute xtime table which maps i onto GF(i, 0x02)
  var xtime = new Array(256);
  for(var i = 0; i < 128; ++i) {
    xtime[i] = i << 1;
    xtime[i + 128] = (i + 128) << 1 ^ 0x11B;
  }

  // compute all other tables
  sbox = new Array(256);
  isbox = new Array(256);
  mix = new Array(4);
  imix = new Array(4);
  for(var i = 0; i < 4; ++i) {
    mix[i] = new Array(256);
    imix[i] = new Array(256);
  }
  var e = 0, ei = 0, e2, e4, e8, sx, sx2, me, ime;
  for(var i = 0; i < 256; ++i) {
    /* We need to generate the SubBytes() sbox and isbox tables so that
      we can perform byte substitutions. This requires us to traverse
      all of the elements in GF, find their multiplicative inverses,
      and apply to each the following affine transformation:

      bi' = bi ^ b(i + 4) mod 8 ^ b(i + 5) mod 8 ^ b(i + 6) mod 8 ^
            b(i + 7) mod 8 ^ ci
      for 0 <= i < 8, where bi is the ith bit of the byte, and ci is the
      ith bit of a byte c with the value {63} or {01100011}.

      It is possible to traverse every possible value in a Galois field
      using what is referred to as a 'generator'. There are many
      generators (128 out of 256): 3,5,6,9,11,82 to name a few. To fully
      traverse GF we iterate 255 times, multiplying by our generator
      each time.

      On each iteration we can determine the multiplicative inverse for
      the current element.

      Suppose there is an element in GF 'e'. For a given generator 'g',
      e = g^x. The multiplicative inverse of e is g^(255 - x). It turns
      out that if use the inverse of a generator as another generator
      it will produce all of the corresponding multiplicative inverses
      at the same time. For this reason, we choose 5 as our inverse
      generator because it only requires 2 multiplies and 1 add and its
      inverse, 82, requires relatively few operations as well.

      In order to apply the affine transformation, the multiplicative
      inverse 'ei' of 'e' can be repeatedly XOR'd (4 times) with a
      bit-cycling of 'ei'. To do this 'ei' is first stored in 's' and
      'x'. Then 's' is left shifted and the high bit of 's' is made the
      low bit. The resulting value is stored in 's'. Then 'x' is XOR'd
      with 's' and stored in 'x'. On each subsequent iteration the same
      operation is performed. When 4 iterations are complete, 'x' is
      XOR'd with 'c' (0x63) and the transformed value is stored in 'x'.
      For example:

      s = 01000001
      x = 01000001

      iteration 1: s = 10000010, x ^= s
      iteration 2: s = 00000101, x ^= s
      iteration 3: s = 00001010, x ^= s
      iteration 4: s = 00010100, x ^= s
      x ^= 0x63

      This can be done with a loop where s = (s << 1) | (s >> 7). However,
      it can also be done by using a single 16-bit (in this case 32-bit)
      number 'sx'. Since XOR is an associative operation, we can set 'sx'
      to 'ei' and then XOR it with 'sx' left-shifted 1,2,3, and 4 times.
      The most significant bits will flow into the high 8 bit positions
      and be correctly XOR'd with one another. All that remains will be
      to cycle the high 8 bits by XOR'ing them all with the lower 8 bits
      afterwards.

      At the same time we're populating sbox and isbox we can precompute
      the multiplication we'll need to do to do MixColumns() later.
    */

    // apply affine transformation
    sx = ei ^ (ei << 1) ^ (ei << 2) ^ (ei << 3) ^ (ei << 4);
    sx = (sx >> 8) ^ (sx & 255) ^ 0x63;

    // update tables
    sbox[e] = sx;
    isbox[sx] = e;

    /* Mixing columns is done using matrix multiplication. The columns
      that are to be mixed are each a single word in the current state.
      The state has Nb columns (4 columns). Therefore each column is a
      4 byte word. So to mix the columns in a single column 'c' where
      its rows are r0, r1, r2, and r3, we use the following matrix
      multiplication:

      [2 3 1 1]*[r0,c]=[r'0,c]
      [1 2 3 1] [r1,c] [r'1,c]
      [1 1 2 3] [r2,c] [r'2,c]
      [3 1 1 2] [r3,c] [r'3,c]

      r0, r1, r2, and r3 are each 1 byte of one of the words in the
      state (a column). To do matrix multiplication for each mixed
      column c' we multiply the corresponding row from the left matrix
      with the corresponding column from the right matrix. In total, we
      get 4 equations:

      r0,c' = 2*r0,c + 3*r1,c + 1*r2,c + 1*r3,c
      r1,c' = 1*r0,c + 2*r1,c + 3*r2,c + 1*r3,c
      r2,c' = 1*r0,c + 1*r1,c + 2*r2,c + 3*r3,c
      r3,c' = 3*r0,c + 1*r1,c + 1*r2,c + 2*r3,c

      As usual, the multiplication is as previously defined and the
      addition is XOR. In order to optimize mixing columns we can store
      the multiplication results in tables. If you think of the whole
      column as a word (it might help to visualize by mentally rotating
      the equations above by counterclockwise 90 degrees) then you can
      see that it would be useful to map the multiplications performed on
      each byte (r0, r1, r2, r3) onto a word as well. For instance, we
      could map 2*r0,1*r0,1*r0,3*r0 onto a word by storing 2*r0 in the
      highest 8 bits and 3*r0 in the lowest 8 bits (with the other two
      respectively in the middle). This means that a table can be
      constructed that uses r0 as an index to the word. We can do the
      same with r1, r2, and r3, creating a total of 4 tables.

      To construct a full c', we can just look up each byte of c in
      their respective tables and XOR the results together.

      Also, to build each table we only have to calculate the word
      for 2,1,1,3 for every byte ... which we can do on each iteration
      of this loop since we will iterate over every byte. After we have
      calculated 2,1,1,3 we can get the results for the other tables
      by cycling the byte at the end to the beginning. For instance
      we can take the result of table 2,1,1,3 and produce table 3,2,1,1
      by moving the right most byte to the left most position just like
      how you can imagine the 3 moved out of 2,1,1,3 and to the front
      to produce 3,2,1,1.

      There is another optimization in that the same multiples of
      the current element we need in order to advance our generator
      to the next iteration can be reused in performing the 2,1,1,3
      calculation. We also calculate the inverse mix column tables,
      with e,9,d,b being the inverse of 2,1,1,3.

      When we're done, and we need to actually mix columns, the first
      byte of each state word should be put through mix[0] (2,1,1,3),
      the second through mix[1] (3,2,1,1) and so forth. Then they should
      be XOR'd together to produce the fully mixed column.
    */

    // calculate mix and imix table values
    sx2 = xtime[sx];
    e2 = xtime[e];
    e4 = xtime[e2];
    e8 = xtime[e4];
    me =
      (sx2 << 24) ^  // 2
      (sx << 16) ^   // 1
      (sx << 8) ^    // 1
      (sx ^ sx2);    // 3
    ime =
      (e2 ^ e4 ^ e8) << 24 ^  // E (14)
      (e ^ e8) << 16 ^        // 9
      (e ^ e4 ^ e8) << 8 ^    // D (13)
      (e ^ e2 ^ e8);          // B (11)
    // produce each of the mix tables by rotating the 2,1,1,3 value
    for(var n = 0; n < 4; ++n) {
      mix[n][e] = me;
      imix[n][sx] = ime;
      // cycle the right most byte to the left most position
      // ie: 2,1,1,3 becomes 3,2,1,1
      me = me << 24 | me >>> 8;
      ime = ime << 24 | ime >>> 8;
    }

    // get next element and inverse
    if(e === 0) {
      // 1 is the inverse of 1
      e = ei = 1;
    } else {
      // e = 2e + 2*2*2*(10e)) = multiply e by 82 (chosen generator)
      // ei = ei + 2*2*ei = multiply ei by 5 (inverse generator)
      e = e2 ^ xtime[xtime[xtime[e2 ^ e8]]];
      ei ^= xtime[xtime[ei]];
    }
  }
}

/**
 * Generates a key schedule using the AES key expansion algorithm.
 *
 * The AES algorithm takes the Cipher Key, K, and performs a Key Expansion
 * routine to generate a key schedule. The Key Expansion generates a total
 * of Nb*(Nr + 1) words: the algorithm requires an initial set of Nb words,
 * and each of the Nr rounds requires Nb words of key data. The resulting
 * key schedule consists of a linear array of 4-byte words, denoted [wi ],
 * with i in the range 0 ≤ i < Nb(Nr + 1).
 *
 * KeyExpansion(byte key[4*Nk], word w[Nb*(Nr+1)], Nk)
 * AES-128 (Nb=4, Nk=4, Nr=10)
 * AES-192 (Nb=4, Nk=6, Nr=12)
 * AES-256 (Nb=4, Nk=8, Nr=14)
 * Note: Nr=Nk+6.
 *
 * Nb is the number of columns (32-bit words) comprising the State (or
 * number of bytes in a block). For AES, Nb=4.
 *
 * @param key the key to schedule (as an array of 32-bit words).
 * @param decrypt true to modify the key schedule to decrypt, false not to.
 *
 * @return the generated key schedule.
 */
function _expandKey(key, decrypt) {
  // copy the key's words to initialize the key schedule
  var w = key.slice(0);

  /* RotWord() will rotate a word, moving the first byte to the last
    byte's position (shifting the other bytes left).

    We will be getting the value of Rcon at i / Nk. 'i' will iterate
    from Nk to (Nb * Nr+1). Nk = 4 (4 byte key), Nb = 4 (4 words in
    a block), Nr = Nk + 6 (10). Therefore 'i' will iterate from
    4 to 44 (exclusive). Each time we iterate 4 times, i / Nk will
    increase by 1. We use a counter iNk to keep track of this.
   */

  // go through the rounds expanding the key
  var temp, iNk = 1;
  var Nk = w.length;
  var Nr1 = Nk + 6 + 1;
  var end = Nb * Nr1;
  for(var i = Nk; i < end; ++i) {
    temp = w[i - 1];
    if(i % Nk === 0) {
      // temp = SubWord(RotWord(temp)) ^ Rcon[i / Nk]
      temp =
        sbox[temp >>> 16 & 255] << 24 ^
        sbox[temp >>> 8 & 255] << 16 ^
        sbox[temp & 255] << 8 ^
        sbox[temp >>> 24] ^ (rcon[iNk] << 24);
      iNk++;
    } else if(Nk > 6 && (i % Nk === 4)) {
      // temp = SubWord(temp)
      temp =
        sbox[temp >>> 24] << 24 ^
        sbox[temp >>> 16 & 255] << 16 ^
        sbox[temp >>> 8 & 255] << 8 ^
        sbox[temp & 255];
    }
    w[i] = w[i - Nk] ^ temp;
  }

   /* When we are updating a cipher block we always use the code path for
     encryption whether we are decrypting or not (to shorten code and
     simplify the generation of look up tables). However, because there
     are differences in the decryption algorithm, other than just swapping
     in different look up tables, we must transform our key schedule to
     account for these changes:

     1. The decryption algorithm gets its key rounds in reverse order.
     2. The decryption algorithm adds the round key before mixing columns
       instead of afterwards.

     We don't need to modify our key schedule to handle the first case,
     we can just traverse the key schedule in reverse order when decrypting.

     The second case requires a little work.

     The tables we built for performing rounds will take an input and then
     perform SubBytes() and MixColumns() or, for the decrypt version,
     InvSubBytes() and InvMixColumns(). But the decrypt algorithm requires
     us to AddRoundKey() before InvMixColumns(). This means we'll need to
     apply some transformations to the round key to inverse-mix its columns
     so they'll be correct for moving AddRoundKey() to after the state has
     had its columns inverse-mixed.

     To inverse-mix the columns of the state when we're decrypting we use a
     lookup table that will apply InvSubBytes() and InvMixColumns() at the
     same time. However, the round key's bytes are not inverse-substituted
     in the decryption algorithm. To get around this problem, we can first
     substitute the bytes in the round key so that when we apply the
     transformation via the InvSubBytes()+InvMixColumns() table, it will
     undo our substitution leaving us with the original value that we
     want -- and then inverse-mix that value.

     This change will correctly alter our key schedule so that we can XOR
     each round key with our already transformed decryption state. This
     allows us to use the same code path as the encryption algorithm.

     We make one more change to the decryption key. Since the decryption
     algorithm runs in reverse from the encryption algorithm, we reverse
     the order of the round keys to avoid having to iterate over the key
     schedule backwards when running the encryption algorithm later in
     decryption mode. In addition to reversing the order of the round keys,
     we also swap each round key's 2nd and 4th rows. See the comments
     section where rounds are performed for more details about why this is
     done. These changes are done inline with the other substitution
     described above.
  */
  if(decrypt) {
    var tmp;
    var m0 = imix[0];
    var m1 = imix[1];
    var m2 = imix[2];
    var m3 = imix[3];
    var wnew = w.slice(0);
    end = w.length;
    for(var i = 0, wi = end - Nb; i < end; i += Nb, wi -= Nb) {
      // do not sub the first or last round key (round keys are Nb
      // words) as no column mixing is performed before they are added,
      // but do change the key order
      if(i === 0 || i === (end - Nb)) {
        wnew[i] = w[wi];
        wnew[i + 1] = w[wi + 3];
        wnew[i + 2] = w[wi + 2];
        wnew[i + 3] = w[wi + 1];
      } else {
        // substitute each round key byte because the inverse-mix
        // table will inverse-substitute it (effectively cancel the
        // substitution because round key bytes aren't sub'd in
        // decryption mode) and swap indexes 3 and 1
        for(var n = 0; n < Nb; ++n) {
          tmp = w[wi + n];
          wnew[i + (3&-n)] =
            m0[sbox[tmp >>> 24]] ^
            m1[sbox[tmp >>> 16 & 255]] ^
            m2[sbox[tmp >>> 8 & 255]] ^
            m3[sbox[tmp & 255]];
        }
      }
    }
    w = wnew;
  }

  return w;
}

/**
 * Updates a single block (16 bytes) using AES. The update will either
 * encrypt or decrypt the block.
 *
 * @param w the key schedule.
 * @param input the input block (an array of 32-bit words).
 * @param output the updated output block.
 * @param decrypt true to decrypt the block, false to encrypt it.
 */
function _updateBlock(w, input, output, decrypt) {
  /*
  Cipher(byte in[4*Nb], byte out[4*Nb], word w[Nb*(Nr+1)])
  begin
    byte state[4,Nb]
    state = in
    AddRoundKey(state, w[0, Nb-1])
    for round = 1 step 1 to Nr–1
      SubBytes(state)
      ShiftRows(state)
      MixColumns(state)
      AddRoundKey(state, w[round*Nb, (round+1)*Nb-1])
    end for
    SubBytes(state)
    ShiftRows(state)
    AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])
    out = state
  end

  InvCipher(byte in[4*Nb], byte out[4*Nb], word w[Nb*(Nr+1)])
  begin
    byte state[4,Nb]
    state = in
    AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])
    for round = Nr-1 step -1 downto 1
      InvShiftRows(state)
      InvSubBytes(state)
      AddRoundKey(state, w[round*Nb, (round+1)*Nb-1])
      InvMixColumns(state)
    end for
    InvShiftRows(state)
    InvSubBytes(state)
    AddRoundKey(state, w[0, Nb-1])
    out = state
  end
  */

  // Encrypt: AddRoundKey(state, w[0, Nb-1])
  // Decrypt: AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])
  var Nr = w.length / 4 - 1;
  var m0, m1, m2, m3, sub;
  if(decrypt) {
    m0 = imix[0];
    m1 = imix[1];
    m2 = imix[2];
    m3 = imix[3];
    sub = isbox;
  } else {
    m0 = mix[0];
    m1 = mix[1];
    m2 = mix[2];
    m3 = mix[3];
    sub = sbox;
  }
  var a, b, c, d, a2, b2, c2;
  a = input[0] ^ w[0];
  b = input[decrypt ? 3 : 1] ^ w[1];
  c = input[2] ^ w[2];
  d = input[decrypt ? 1 : 3] ^ w[3];
  var i = 3;

  /* In order to share code we follow the encryption algorithm when both
    encrypting and decrypting. To account for the changes required in the
    decryption algorithm, we use different lookup tables when decrypting
    and use a modified key schedule to account for the difference in the
    order of transformations applied when performing rounds. We also get
    key rounds in reverse order (relative to encryption). */
  for(var round = 1; round < Nr; ++round) {
    /* As described above, we'll be using table lookups to perform the
      column mixing. Each column is stored as a word in the state (the
      array 'input' has one column as a word at each index). In order to
      mix a column, we perform these transformations on each row in c,
      which is 1 byte in each word. The new column for c0 is c'0:

               m0      m1      m2      m3
      r0,c'0 = 2*r0,c0 + 3*r1,c0 + 1*r2,c0 + 1*r3,c0
      r1,c'0 = 1*r0,c0 + 2*r1,c0 + 3*r2,c0 + 1*r3,c0
      r2,c'0 = 1*r0,c0 + 1*r1,c0 + 2*r2,c0 + 3*r3,c0
      r3,c'0 = 3*r0,c0 + 1*r1,c0 + 1*r2,c0 + 2*r3,c0

      So using mix tables where c0 is a word with r0 being its upper
      8 bits and r3 being its lower 8 bits:

      m0[c0 >> 24] will yield this word: [2*r0,1*r0,1*r0,3*r0]
      ...
      m3[c0 & 255] will yield this word: [1*r3,1*r3,3*r3,2*r3]

      Therefore to mix the columns in each word in the state we
      do the following (& 255 omitted for brevity):
      c'0,r0 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]
      c'0,r1 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]
      c'0,r2 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]
      c'0,r3 = m0[c0 >> 24] ^ m1[c1 >> 16] ^ m2[c2 >> 8] ^ m3[c3]

      However, before mixing, the algorithm requires us to perform
      ShiftRows(). The ShiftRows() transformation cyclically shifts the
      last 3 rows of the state over different offsets. The first row
      (r = 0) is not shifted.

      s'_r,c = s_r,(c + shift(r, Nb) mod Nb
      for 0 < r < 4 and 0 <= c < Nb and
      shift(1, 4) = 1
      shift(2, 4) = 2
      shift(3, 4) = 3.

      This causes the first byte in r = 1 to be moved to the end of
      the row, the first 2 bytes in r = 2 to be moved to the end of
      the row, the first 3 bytes in r = 3 to be moved to the end of
      the row:

      r1: [c0 c1 c2 c3] => [c1 c2 c3 c0]
      r2: [c0 c1 c2 c3]    [c2 c3 c0 c1]
      r3: [c0 c1 c2 c3]    [c3 c0 c1 c2]

      We can make these substitutions inline with our column mixing to
      generate an updated set of equations to produce each word in the
      state (note the columns have changed positions):

      c0 c1 c2 c3 => c0 c1 c2 c3
      c0 c1 c2 c3    c1 c2 c3 c0  (cycled 1 byte)
      c0 c1 c2 c3    c2 c3 c0 c1  (cycled 2 bytes)
      c0 c1 c2 c3    c3 c0 c1 c2  (cycled 3 bytes)

      Therefore:

      c'0 = 2*r0,c0 + 3*r1,c1 + 1*r2,c2 + 1*r3,c3
      c'0 = 1*r0,c0 + 2*r1,c1 + 3*r2,c2 + 1*r3,c3
      c'0 = 1*r0,c0 + 1*r1,c1 + 2*r2,c2 + 3*r3,c3
      c'0 = 3*r0,c0 + 1*r1,c1 + 1*r2,c2 + 2*r3,c3

      c'1 = 2*r0,c1 + 3*r1,c2 + 1*r2,c3 + 1*r3,c0
      c'1 = 1*r0,c1 + 2*r1,c2 + 3*r2,c3 + 1*r3,c0
      c'1 = 1*r0,c1 + 1*r1,c2 + 2*r2,c3 + 3*r3,c0
      c'1 = 3*r0,c1 + 1*r1,c2 + 1*r2,c3 + 2*r3,c0

      ... and so forth for c'2 and c'3. The important distinction is
      that the columns are cycling, with c0 being used with the m0
      map when calculating c0, but c1 being used with the m0 map when
      calculating c1 ... and so forth.

      When performing the inverse we transform the mirror image and
      skip the bottom row, instead of the top one, and move upwards:

      c3 c2 c1 c0 => c0 c3 c2 c1  (cycled 3 bytes) *same as encryption
      c3 c2 c1 c0    c1 c0 c3 c2  (cycled 2 bytes)
      c3 c2 c1 c0    c2 c1 c0 c3  (cycled 1 byte)  *same as encryption
      c3 c2 c1 c0    c3 c2 c1 c0

      If you compare the resulting matrices for ShiftRows()+MixColumns()
      and for InvShiftRows()+InvMixColumns() the 2nd and 4th columns are
      different (in encrypt mode vs. decrypt mode). So in order to use
      the same code to handle both encryption and decryption, we will
      need to do some mapping.

      If in encryption mode we let a=c0, b=c1, c=c2, d=c3, and r<N> be
      a row number in the state, then the resulting matrix in encryption
      mode for applying the above transformations would be:

      r1: a b c d
      r2: b c d a
      r3: c d a b
      r4: d a b c

      If we did the same in decryption mode we would get:

      r1: a d c b
      r2: b a d c
      r3: c b a d
      r4: d c b a

      If instead we swap d and b (set b=c3 and d=c1), then we get:

      r1: a b c d
      r2: d a b c
      r3: c d a b
      r4: b c d a

      Now the 1st and 3rd rows are the same as the encryption matrix. All
      we need to do then to make the mapping exactly the same is to swap
      the 2nd and 4th rows when in decryption mode. To do this without
      having to do it on each iteration, we swapped the 2nd and 4th rows
      in the decryption key schedule. We also have to do the swap above
      when we first pull in the input and when we set the final output. */
    a2 =
      m0[a >>> 24] ^
      m1[b >>> 16 & 255] ^
      m2[c >>> 8 & 255] ^
      m3[d & 255] ^ w[++i];
    b2 =
      m0[b >>> 24] ^
      m1[c >>> 16 & 255] ^
      m2[d >>> 8 & 255] ^
      m3[a & 255] ^ w[++i];
    c2 =
      m0[c >>> 24] ^
      m1[d >>> 16 & 255] ^
      m2[a >>> 8 & 255] ^
      m3[b & 255] ^ w[++i];
    d =
      m0[d >>> 24] ^
      m1[a >>> 16 & 255] ^
      m2[b >>> 8 & 255] ^
      m3[c & 255] ^ w[++i];
    a = a2;
    b = b2;
    c = c2;
  }

  /*
    Encrypt:
    SubBytes(state)
    ShiftRows(state)
    AddRoundKey(state, w[Nr*Nb, (Nr+1)*Nb-1])

    Decrypt:
    InvShiftRows(state)
    InvSubBytes(state)
    AddRoundKey(state, w[0, Nb-1])
   */
   // Note: rows are shifted inline
  output[0] =
    (sub[a >>> 24] << 24) ^
    (sub[b >>> 16 & 255] << 16) ^
    (sub[c >>> 8 & 255] << 8) ^
    (sub[d & 255]) ^ w[++i];
  output[decrypt ? 3 : 1] =
    (sub[b >>> 24] << 24) ^
    (sub[c >>> 16 & 255] << 16) ^
    (sub[d >>> 8 & 255] << 8) ^
    (sub[a & 255]) ^ w[++i];
  output[2] =
    (sub[c >>> 24] << 24) ^
    (sub[d >>> 16 & 255] << 16) ^
    (sub[a >>> 8 & 255] << 8) ^
    (sub[b & 255]) ^ w[++i];
  output[decrypt ? 1 : 3] =
    (sub[d >>> 24] << 24) ^
    (sub[a >>> 16 & 255] << 16) ^
    (sub[b >>> 8 & 255] << 8) ^
    (sub[c & 255]) ^ w[++i];
}

/**
 * Deprecated. Instead, use:
 *
 * forge.cipher.createCipher('AES-<mode>', key);
 * forge.cipher.createDecipher('AES-<mode>', key);
 *
 * Creates a deprecated AES cipher object. This object's mode will default to
 * CBC (cipher-block-chaining).
 *
 * The key and iv may be given as a string of bytes, an array of bytes, a
 * byte buffer, or an array of 32-bit words.
 *
 * @param options the options to use.
 *          key the symmetric key to use.
 *          output the buffer to write to.
 *          decrypt true for decryption, false for encryption.
 *          mode the cipher mode to use (default: 'CBC').
 *
 * @return the cipher.
 */
function _createCipher(options) {
  options = options || {};
  var mode = (options.mode || 'CBC').toUpperCase();
  var algorithm = 'AES-' + mode;

  var cipher;
  if(options.decrypt) {
    cipher = forge.cipher.createDecipher(algorithm, options.key);
  } else {
    cipher = forge.cipher.createCipher(algorithm, options.key);
  }

  // backwards compatible start API
  var start = cipher.start;
  cipher.start = function(iv, options) {
    // backwards compatibility: support second arg as output buffer
    var output = null;
    if(options instanceof forge.util.ByteBuffer) {
      output = options;
      options = {};
    }
    options = options || {};
    options.output = output;
    options.iv = iv;
    start.call(cipher, options);
  };

  return cipher;
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Cipher base API.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2014 Digital Bazaar, Inc.
 */
var forge = __webpack_require__(0);
__webpack_require__(1);

module.exports = forge.cipher = forge.cipher || {};

// registered algorithms
forge.cipher.algorithms = forge.cipher.algorithms || {};

/**
 * Creates a cipher object that can be used to encrypt data using the given
 * algorithm and key. The algorithm may be provided as a string value for a
 * previously registered algorithm or it may be given as a cipher algorithm
 * API object.
 *
 * @param algorithm the algorithm to use, either a string or an algorithm API
 *          object.
 * @param key the key to use, as a binary-encoded string of bytes or a
 *          byte buffer.
 *
 * @return the cipher.
 */
forge.cipher.createCipher = function(algorithm, key) {
  var api = algorithm;
  if(typeof api === 'string') {
    api = forge.cipher.getAlgorithm(api);
    if(api) {
      api = api();
    }
  }
  if(!api) {
    throw new Error('Unsupported algorithm: ' + algorithm);
  }

  // assume block cipher
  return new forge.cipher.BlockCipher({
    algorithm: api,
    key: key,
    decrypt: false
  });
};

/**
 * Creates a decipher object that can be used to decrypt data using the given
 * algorithm and key. The algorithm may be provided as a string value for a
 * previously registered algorithm or it may be given as a cipher algorithm
 * API object.
 *
 * @param algorithm the algorithm to use, either a string or an algorithm API
 *          object.
 * @param key the key to use, as a binary-encoded string of bytes or a
 *          byte buffer.
 *
 * @return the cipher.
 */
forge.cipher.createDecipher = function(algorithm, key) {
  var api = algorithm;
  if(typeof api === 'string') {
    api = forge.cipher.getAlgorithm(api);
    if(api) {
      api = api();
    }
  }
  if(!api) {
    throw new Error('Unsupported algorithm: ' + algorithm);
  }

  // assume block cipher
  return new forge.cipher.BlockCipher({
    algorithm: api,
    key: key,
    decrypt: true
  });
};

/**
 * Registers an algorithm by name. If the name was already registered, the
 * algorithm API object will be overwritten.
 *
 * @param name the name of the algorithm.
 * @param algorithm the algorithm API object.
 */
forge.cipher.registerAlgorithm = function(name, algorithm) {
  name = name.toUpperCase();
  forge.cipher.algorithms[name] = algorithm;
};

/**
 * Gets a registered algorithm by name.
 *
 * @param name the name of the algorithm.
 *
 * @return the algorithm, if found, null if not.
 */
forge.cipher.getAlgorithm = function(name) {
  name = name.toUpperCase();
  if(name in forge.cipher.algorithms) {
    return forge.cipher.algorithms[name];
  }
  return null;
};

var BlockCipher = forge.cipher.BlockCipher = function(options) {
  this.algorithm = options.algorithm;
  this.mode = this.algorithm.mode;
  this.blockSize = this.mode.blockSize;
  this._finish = false;
  this._input = null;
  this.output = null;
  this._op = options.decrypt ? this.mode.decrypt : this.mode.encrypt;
  this._decrypt = options.decrypt;
  this.algorithm.initialize(options);
};

/**
 * Starts or restarts the encryption or decryption process, whichever
 * was previously configured.
 *
 * For non-GCM mode, the IV may be a binary-encoded string of bytes, an array
 * of bytes, a byte buffer, or an array of 32-bit integers. If the IV is in
 * bytes, then it must be Nb (16) bytes in length. If the IV is given in as
 * 32-bit integers, then it must be 4 integers long.
 *
 * Note: an IV is not required or used in ECB mode.
 *
 * For GCM-mode, the IV must be given as a binary-encoded string of bytes or
 * a byte buffer. The number of bytes should be 12 (96 bits) as recommended
 * by NIST SP-800-38D but another length may be given.
 *
 * @param options the options to use:
 *          iv the initialization vector to use as a binary-encoded string of
 *            bytes, null to reuse the last ciphered block from a previous
 *            update() (this "residue" method is for legacy support only).
 *          additionalData additional authentication data as a binary-encoded
 *            string of bytes, for 'GCM' mode, (default: none).
 *          tagLength desired length of authentication tag, in bits, for
 *            'GCM' mode (0-128, default: 128).
 *          tag the authentication tag to check if decrypting, as a
 *             binary-encoded string of bytes.
 *          output the output the buffer to write to, null to create one.
 */
BlockCipher.prototype.start = function(options) {
  options = options || {};
  var opts = {};
  for(var key in options) {
    opts[key] = options[key];
  }
  opts.decrypt = this._decrypt;
  this._finish = false;
  this._input = forge.util.createBuffer();
  this.output = options.output || forge.util.createBuffer();
  this.mode.start(opts);
};

/**
 * Updates the next block according to the cipher mode.
 *
 * @param input the buffer to read from.
 */
BlockCipher.prototype.update = function(input) {
  if(input) {
    // input given, so empty it into the input buffer
    this._input.putBuffer(input);
  }

  // do cipher operation until it needs more input and not finished
  while(!this._op.call(this.mode, this._input, this.output, this._finish) &&
    !this._finish) {}

  // free consumed memory from input buffer
  this._input.compact();
};

/**
 * Finishes encrypting or decrypting.
 *
 * @param pad a padding function to use in CBC mode, null for default,
 *          signature(blockSize, buffer, decrypt).
 *
 * @return true if successful, false on error.
 */
BlockCipher.prototype.finish = function(pad) {
  // backwards-compatibility w/deprecated padding API
  // Note: will overwrite padding functions even after another start() call
  if(pad && (this.mode.name === 'ECB' || this.mode.name === 'CBC')) {
    this.mode.pad = function(input) {
      return pad(this.blockSize, input, false);
    };
    this.mode.unpad = function(output) {
      return pad(this.blockSize, output, true);
    };
  }

  // build options for padding and afterFinish functions
  var options = {};
  options.decrypt = this._decrypt;

  // get # of bytes that won't fill a block
  options.overflow = this._input.length() % this.blockSize;

  if(!this._decrypt && this.mode.pad) {
    if(!this.mode.pad(this._input, options)) {
      return false;
    }
  }

  // do final update
  this._finish = true;
  this.update();

  if(this._decrypt && this.mode.unpad) {
    if(!this.mode.unpad(this.output, options)) {
      return false;
    }
  }

  if(this.mode.afterFinish) {
    if(!this.mode.afterFinish(this.output, options)) {
      return false;
    }
  }

  return true;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Supported cipher modes.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2014 Digital Bazaar, Inc.
 */
var forge = __webpack_require__(0);
__webpack_require__(1);

forge.cipher = forge.cipher || {};

// supported cipher modes
var modes = module.exports = forge.cipher.modes = forge.cipher.modes || {};


/** Cipher-block Chaining (CBC) **/

modes.cbc = function(options) {
  options = options || {};
  this.name = 'CBC';
  this.cipher = options.cipher;
  this.blockSize = options.blockSize || 16;
  this._ints = this.blockSize / 4;
  this._inBlock = new Array(this._ints);
  this._outBlock = new Array(this._ints);
};

modes.cbc.prototype.start = function(options) {
  // Note: legacy support for using IV residue (has security flaws)
  // if IV is null, reuse block from previous processing
  if(options.iv === null) {
    // must have a previous block
    if(!this._prev) {
      throw new Error('Invalid IV parameter.');
    }
    this._iv = this._prev.slice(0);
  } else if(!('iv' in options)) {
    throw new Error('Invalid IV parameter.');
  } else {
    // save IV as "previous" block
    this._iv = transformIV(options.iv);
    this._prev = this._iv.slice(0);
  }
};

modes.cbc.prototype.encrypt = function(input, output, finish) {
  // not enough input to encrypt
  if(input.length() < this.blockSize && !(finish && input.length() > 0)) {
    return true;
  }

  // get next block
  // CBC XOR's IV (or previous block) with plaintext
  for(var i = 0; i < this._ints; ++i) {
    this._inBlock[i] = this._prev[i] ^ input.getInt32();
  }

  // encrypt block
  this.cipher.encrypt(this._inBlock, this._outBlock);

  // write output, save previous block
  for(var i = 0; i < this._ints; ++i) {
    output.putInt32(this._outBlock[i]);
  }
  this._prev = this._outBlock;
};

modes.cbc.prototype.decrypt = function(input, output, finish) {
  // not enough input to decrypt
  if(input.length() < this.blockSize && !(finish && input.length() > 0)) {
    return true;
  }

  // get next block
  for(var i = 0; i < this._ints; ++i) {
    this._inBlock[i] = input.getInt32();
  }

  // decrypt block
  this.cipher.decrypt(this._inBlock, this._outBlock);

  // write output, save previous ciphered block
  // CBC XOR's IV (or previous block) with ciphertext
  for(var i = 0; i < this._ints; ++i) {
    output.putInt32(this._prev[i] ^ this._outBlock[i]);
  }
  this._prev = this._inBlock.slice(0);
};

modes.cbc.prototype.pad = function(input, options) {
  // add PKCS#7 padding to block (each pad byte is the
  // value of the number of pad bytes)
  var padding = (input.length() === this.blockSize ?
    this.blockSize : (this.blockSize - input.length()));
  input.fillWithByte(padding, padding);
  return true;
};

modes.cbc.prototype.unpad = function(output, options) {
  // check for error: input data not a multiple of blockSize
  if(options.overflow > 0) {
    return false;
  }

  // ensure padding byte count is valid
  var len = output.length();
  var count = output.at(len - 1);
  if(count > (this.blockSize << 2)) {
    return false;
  }

  // trim off padding bytes
  output.truncate(count);
  return true;
};

/** Utility functions */

function transformIV(iv) {
  if(typeof iv === 'string') {
    // convert iv string into byte buffer
    iv = forge.util.createBuffer(iv);
  }

  if(forge.util.isArray(iv) && iv.length > 4) {
    // convert iv byte array into byte buffer
    var tmp = iv;
    iv = forge.util.createBuffer();
    for(var i = 0; i < tmp.length; ++i) {
      iv.putByte(tmp[i]);
    }
  }
  if(!forge.util.isArray(iv)) {
    // convert iv byte buffer into 32-bit integer array
    iv = [iv.getInt32(), iv.getInt32(), iv.getInt32(), iv.getInt32()];
  }

  return iv;
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2);
module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
});
var exporter = (typeof window!=='undefined' ? window : global);
exporter.MBOOT = exporter.MBOOT || {};

if (MBOOT.Logger === undefined) {

  (function(modules) {

    function Logger(tag) {
      this._tag = tag;
      this.logger = console;
    }

    Logger.prototype._log = function(msg, level){
        var line = new Date().toISOString() + " " + level + ' [MBOOT:' + this._tag + '] ' + msg;
        console.log(line);
        try{
            var currentLog = JSON.parse(window.localStorage.getItem("mboot-log") || "[]");
            currentLog.push(line);
            while (currentLog.length > 20){
                currentLog.shift();
            }
            window.localStorage.setItem("mboot-log", JSON.stringify(currentLog));
        }
        catch(e){
            console.error(e);
        }
    };

    Logger.prototype.debug = function(msg) {
        this._log(msg, "DEBUG");
    };

    Logger.prototype.info = function(msg) {
        this._log(msg, "INFO");
    };

    Logger.prototype.warn = function(msg) {
        this._log(msg, "WARN");
    };

    Logger.prototype.trace = function(msg) {
    };

    Logger.prototype.tag = function(msg) {
      console.log && this.logger.tag(msg);
    };

    Logger.prototype.error = function(message, stack, type) {
        this._log(message, "ERROR");
      console.log('ERROR - ' + new Date().toISOString() + ': [MBOOT:' + this._tag + '] stack: ', stack);
      console.log('ERROR - ' + new Date().toISOString() + ': [MBOOT:' + this._tag + '] type: ' + type);
    };

    modules.Logger = Logger;

  })(MBOOT);
}

if (MBOOT.Measure === undefined) {
  (function(modules) {

    function Measure() {
      this.measurements = {};
    }

    Measure.prototype.take = function(event) {
      if (!this.measurements[event]) {
        this.measurements[event] = [];
      }
      this.measurements[event].unshift(Date.now());
    };

    Measure.prototype.duration = function(event1, event2) {
      if (!this.measurements[event1] || !this.measurements[event2]) {
        return 0;
      }
      return this.measurements[event2][0] - this.measurements[event1][0];
    };

    Measure.prototype.all = function() {
      var self = this;
      return Object.keys(this.measurements).map(function(event) {
        return {event: event, value: self.measurements[event][0]};
      });
    };

    modules.Measure = new Measure();

  })(MBOOT);
}
if (MBOOT.Query === undefined) {

  (function(modules) {
    var logger = new modules.Logger('Query');

    function decode(s) {
      return decodeURIComponent(s.replace(pl, " "));
    }

    function encode(key, value) {
      if (typeof value === 'object') {
        return Object.keys(value).map(function(vkey) {
          return encodeURIComponent(key + '[' + vkey + ']') + '=' + encodeURIComponent(value[vkey])
        }).join('&');
      }
      return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }

    var params = {};
    try {
      var pl = /\+/g;  // Regex for replacing addition symbol with a space
      var search = /([^&=]+)=?([^&]*)/g;
      var query = window.location.search.substring(1);
      var hash = window.location.hash.substring(1);
      query += hash ? ("&" + hash) : "";
      var match;
      while (match = search.exec(query)) {
        params[decode(match[1])] = decode(match[2]);
      }
    } catch (ex) {
      logger.error('exception parsing query params: ' + ex.message, ex.stack);
    }

    modules.Query = {
      params: params,
      format: function(data) {
        return Object.keys(data).map(function(key) {
          return encode(key, data[key]);
        }).join('&');
      }
    };

  })(MBOOT);
}
if (MBOOT.Config === undefined) {
  (function(modules) {

    var config = {};
    config.apiUrl = 'https://zapp.capriza.com';
    if (window.Capriza && Capriza.zappHost){
      config.apiUrl = Capriza.zappHost;
    } else {
      var match = location.hostname.match(/^zapp.*\.capriza\.com$/);
      if (match) {
        config.apiUrl = location.origin || location.protocol + "//" + location.host;
      }
    }

    config.appToken = (window.Capriza && window.Capriza.zappToken) || (location.pathname.indexOf("med_version") === -1 && location.pathname.replace("/", ""));

    var ua = navigator.userAgent;

    if (document.body) {
      config.largeScreen = (window.innerHeight > 600 && window.innerWidth > 600) || ua.match(/ipad/i);
      config.tablet = modules.Query.params.web !== '1' && ((config.largeScreen && modules.Query.params.tablet !== "0") || modules.Query.params.tablet === "1");
    }
    config.hotView = !!modules.Query.params.hotview && modules.Query.params.hotview === "true";
    config.runZapp = modules.Query.params.runzapp != undefined && modules.Query.params.runzapp !== "false";

    config.canRunZapp = function(){
      return config.appToken && (!config.hotView || config.runZapp);
    };
    modules.Config = config;

  })(MBOOT);
}


(function() {

var Logger = new MBOOT.Logger("infra");

window.MBus = {
	on : function(type, listener) {
		if (type instanceof Object) Object.keys(type).forEach(function(key) { MBus.on(key, type[key]); });
		else type.split(" ").forEach(function(type) { (listeners[type] = listeners[type] || []).push(listener); });
	},
	
	trigger : function(type, arg) {
		if (listeners[type]) listeners[type].forEach(function(listener) {
			try {
				listener(type, arg);
			} catch(ex) {
				Logger.error("Exception while triggering " + type + ": " + ex);
			}
		});
	}
};

window.Utils = window.Utils || {};

Utils.isIOS = /iP(ad|hone|od)/.test(navigator.userAgent);

Utils.getFiler = function() {
	function isiOSWrapper(){
		//isReloadFromZapp -  relevant from MED9 to MED16, and meant to prevent MVP to show (to be loaded from file when signing out)
		if (!Capriza.device || !Capriza.device.ios || !Capriza.isStore || !Capriza.cordova ||
				Capriza.cordova.split(".")[0] < 9 ||
			(!(Capriza.cordova.split(".")[0] >= 16 && Capriza.medLevel >= 4) && Capriza.isReloadFromZapp)) return false;

			return true;
		}
	
	try {
		//don't cache the filer, in ios the filer changes from ios filer to cordova's filer at some point.
		return (filer = (
			Capriza.rnFiler ||
			(Capriza.Capp && Capriza.Capp.filer2 && Capriza.Capp.filer2.persistent) ||
			(Capriza.Capp && Capriza.Capp.filer && Capriza.Capp.filer.persistent) ||
			(top.Capriza.Capp && top.Capriza.Capp.filer2 && top.Capriza.Capp.filer2.persistent) ||
			(top.Capriza.Capp && top.Capriza.Capp.filer && top.Capriza.Capp.filer.persistent) ||
			(isiOSWrapper() && Capriza.iOSFiler)));
	}
	catch(ex) {
		Logger.debug('cant getFiler. exception: '+ex);
		return false;
	}

};

Utils.getBGGlobalFilePath = function() { return 'userInfo/globalInfo.json'; }

var listeners = {}, filer;

})();

if (MBOOT.Cookies === undefined) {
    (function(modules) {

        function create(name, value, days, path) {
          path = path || '/';
          var expires = "";
          if (days) {
              var date = new Date();
              date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
              expires = "; expires=" + date.toGMTString();
          }
          document.cookie = name + "=" + value + expires + "; path=" + path + ";" + "domain=capriza.com";
        }
    
        function read(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(";").map(function(c) {return c.trim();});
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                if (c.indexOf(nameEQ) === 0) {
                  return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        }
        
        function erase(name) {
            create(name, "", -1);
        }

        modules.Cookies = {
          create: create,
          read: read,
          erase: erase
        };

    })(MBOOT);
}
if (MBOOT.ClientCache === undefined) {

  (function(modules, storage) {

    function ClientCache(storage) {
      this.storage = storage;
      this._cache = {};
      this.backup = {};
      this.logger = new modules.Logger('ClientCache');

      // clear previous user's data in case this is a new login. This should happen before any reads from storage are made, since they might fetch another user's data
      var firstTimeUser = modules.Cookies.read("firstTimeUser");
      this.logger.debug("firstTimeUser=" + firstTimeUser);
      if (firstTimeUser) {
        this.logger.debug("firstTimeUser - resetting cookie and clearing localStorage");
        modules.Cookies.erase("firstTimeUser");
        storage.clear();
      }
    }

    ClientCache.prototype.getItem = function(id) {
      return this._cache.hasOwnProperty(id) ? this.cache[id] : (this.storage.getItem(id) || this.backup[id]);
    };

    ClientCache.prototype.getBoolean = function(id) {
      var value = ClientCache.getItem(id);
      var retVal;
      try {
        retVal = value === "true";
      } catch (e) {
        retVal = value;
      }

      return retVal;
    };

    ClientCache.prototype.setItem = function(id, value) {
	  if (this._cache.hasOwnProperty(id)) this.cache[id] = value;
      try {
        this.storage.setItem(id, value);
      } catch (ex) {
        this.logger.error('Error writing to localStorage, key=[' + id + "], current localStorage size =[" + this._size() + "]: " + ex.message);
        this.clear();
        this.backup[id] = value;
      }
      MBus.trigger("clientCache/setItem/" + id);
    };

    ClientCache.prototype.removeItem = function(key) {
      this.storage.removeItem(key);
      delete this.backup[key];
	  delete this._cache[key];
    };

    ClientCache.prototype.clear = function() {
      var self = this;
      Object.keys(this.storage).forEach(function(key) {
        if (key.indexOf('identity') < 0 && key.indexOf('unique_token') < 0) {
          self.removeItem(key);
        }
      });
    };

    ClientCache.prototype.length = function() {
      return this.storage.length;
    };

    ClientCache.prototype.addToCache = function(id, value) {
      this._cache[id] = value;
    };

    ClientCache.prototype._size = function() {
      var size = 0;
      for (var i = 0, l = storage.length; i < l; i++) {
        var k = this.storage.key(i);
        size += this.storage[k].length + k.length;
      }
      return size;
    };

    modules.ClientCache = new ClientCache(storage);

  })(MBOOT, localStorage);
}

if (MBOOT.Save === undefined) {
  (function(modules) {
    var Save = Save || {};

    //Save.isArray = function(object) {
    //  return Array.isArray(object);
    //};
    //
    //Save.isString = function(object) {
    //  return typeof object === 'string';
    //};
    //
    //Save.isBoolean = function(object) {
    //  return typeof object === 'booelan';
    //};
    //
    //Save.isNumber = function(object) {
    //  return typeof object === 'number';
    //};
    //
    //Save.isFunction = function(object) {
    //  return typeof object === 'function';
    //};
    //
    //Save.translate = function(object, collected, space) {
    //  var index = collected.indexOf(object);
    //  if (index !== -1) {
    //    return '$' + index;
    //  }
    //
    //  if (object === null) {
    //    return null;
    //  } else if (object === undefined) {
    //    return undefined;
    //  } else if (this.isString(object)) {
    //    return String(object);
    //  } else if (this.isNumber(object)) {
    //    return Number(object);
    //  } else if (this.isBoolean(object)) {
    //    return Boolean(object);
    //  } else if (this.isArray(object)) {
    //    collected.push(object);
    //    for (var i = 0; i < object.length; i++) {
    //      object[i] = this.translate(object[i], collected, space);
    //    }
    //    return object;
    //  } else if (this.isFunction(object)) {
    //    return '@' + object.name;
    //  } else {
    //    if (!('#' in object)) {
    //      var constructor = object.constructor.name;
    //      if (constructor === '') {
    //        throw new Error("Can't serialize with anonymous constructors.");
    //      } else if (constructor !== 'Object') {
    //        if (!space[constructor] || space[constructor].prototype !== object.__proto__) {
    //          throw new Error('Constructor mismatch');
    //        } else {
    //          object['#'] = constructor;
    //        }
    //      }
    //    }
    //    collected.push(object);
    //    for (var k in object) {
    //      if (object.hasOwnProperty(k)) {
    //        object[k] = this.translate(object[k], collected, space);
    //      }
    //    }
    //    return object;
    //  }
    //};

    Save.stringify = function(object, space) {
      var objects = [];
      var space = space || global;
      return JSON.stringify(object, function(key, object) {
        if (object === null) {
          return null;
        }

        var index = objects.indexOf(object);
        if (index !== -1) {
          return '$' + index;
        }

        if (typeof object === 'function') {
          return '@' + object.name;
        }

        if (typeof object === 'object') {
          if (!Array.isArray(object)) {
            var constructor = object.constructor.name;
            if (constructor !== 'Object') {
              if (!space[constructor] || space[constructor].prototype !== object.__proto__) {
                throw new Error('constructor not found in space or is incorrect');
              }
              object['#'] = constructor;
            }
            object['~'] = objects.length;
            objects.push(object);
          }
        }

        return object;
      });
    };

    Save.reconstruct = function(object, collected, space) {
      if (object === null || object === undefined) {
        return object;
      }
      if (typeof object === 'string') {
        if (object.charCodeAt(0) === 36) { // refernce to another processed object
          return collected[parseInt(object.substring(1))];
        } else if (object.charCodeAt(0) === 64) { // function
          return space[object.substring(1)] || window[object['#']];
        }
        return object;
      }
      if (object.constructor === Object) {
        if (object['#']) {
          var constructor = space[object['#']] || window[object['#']];
          if (constructor) {
            object.__proto__ = constructor.prototype;
            delete object['#'];
          } else {
            throw new Error('Unknown constructor ' + object['#']);
          }
        }
        collected.push(object);
        var keys = Object.keys(object);
        for (var k = 0; k < keys.length; ++k) {
          object[keys[k]] = Save.reconstruct(object[keys[k]], collected, space);
        }
      } else if (object.constructor === Array) {
        collected.push(object);
        for (var i = 0; i < object.length; ++i) {
          object[i] = Save.reconstruct(object[i], collected, space);
        }
      }
      return object;
    };

    //Save.stringify = function(object, space) {
    //  return JSON.stringify(this.translate(object, [], space || window));
    //};

    Save.parse = function(string, space) {
      return this.reconstruct(JSON.parse(string), [], space || window);
    };

    modules.Save = Save;

  })(MBOOT);
}
if (MBOOT.Security === undefined) {
  (function(modules) {

    function Security() {
      this.logger = new modules.Logger('Security');
      this.init();
    }

    Security.prototype.init = function() {
      var start = Date.now();
      this.logger.info('generating ecdh key pair with curve ed25519');
      //this.ec = modules.ED25519;
      if (window.crypto === undefined && window.msCrypto !== undefined) {
        window.crypto = window.msCrypto;
      }
      if(this.pubKey) {this.logger.warn("pubKey is already defined :"+ this.pubKey);}
      this.ec = new ellipticjs.ec('ed25519');
      this.setPrivate(ellipticjs.utils.toHex(ellipticjs.rand(16)));
      this.logger.info('ecdh key pair generation done (' + (Date.now() - start) + ' milliseconds). public key: ' + this.pubKey);
    };

    Security.prototype.setPrivate = function (privateKey) {
        this.keyPair = this.ec.keyFromPrivate(privateKey, 'hex');
        this.pubKey = this.keyPair.getPublic(true, 'hex');
    };

    Security.prototype.engine = function() {
      return this.ec;
    };

    Security.prototype.pair = function() {
      return this.keyPair;
    };

    Security.prototype.public = function() {
      this.logger.info("returning publicKey : " + this.pubKey);
      return this.pubKey;
    };

    Security.prototype.private = function() {
      this.logger.info("returning privateKey");
      return this.keyPair.getPrivate("hex");
    };



    Security.prototype.secret = function(pub) {
      return this.keyPair.derive(this.ec.keyFromPublic(pub, 'hex').getPublic());
    };

    Security.prototype.secretKeyAndIV = function(pub) {
      try {
        var secret = this.secret(pub);
      } catch(e) {
        this.logger.error("Failed to derive secret key from " + pub + ": " + e.message, e.stack);
        throw e;
      }
      var data = {};
      // make sure the key is at most 32 bytes long
      data.key = secret.toArray().slice(0, 32);
      // but sometimes the derived secret key is less than 32 bytes, so pad it with 1's
      while (data.key.length < 32) {
        data.key.push(1);
      }
      data.iv = data.key.slice(16); // the last 16 bytes are the iv
      return data;
    };

    Security.prototype.random = function(size) {
      return ellipticjs.utils.toHex(ellipticjs.rand(size / 2));
    };

    Security.prototype.encrypt = function(key, iv, data) {
      var cipher = forgeAes.aes.startEncrypting(key, iv);
      cipher.update(forgeAes.util.createBuffer(JSON.stringify(data), 'utf8'));
      cipher.finish();
      return cipher.output.data;
    };

    Security.prototype.decrypt = function(key, iv, data) {
      var cipher = forgeAes.aes.startDecrypting(key, iv);
      cipher.update(forgeAes.util.createBuffer(data));
      cipher.finish();
      return forgeAes.util.decodeUtf8(cipher.output.data);
    };

    Security.prototype.getSsoCookies = function(secret, ssoCookiesStr) {
      var cookies = {};
      var ssoCookies, _that = this;
      if (ssoCookiesStr) {
        try {
          ssoCookies = JSON.parse(ssoCookiesStr);

          ssoCookies.forEach(function(cookie) {
            // if we have an encryption key, then encrypt the cookies
            if (secret) {
              cookie.value = window.btoa(modules.Security.encrypt(secret.key, secret.iv, cookie.value));
            }
            _that.logger.debug('[getSsoCookies] cookie.name: '+cookie.name);
            cookies[cookie.name] = {name: cookie.name, value: cookie.value};
          });
        } catch(e) {
          this.logger.error("failed to parse ssoCookies " + ssoCookiesStr , "login");
        }
      }
      return cookies;
    };

    modules.Security = new Security();

  })(MBOOT);
}
else {
    MBOOT.Security.logger.warn("Security module already loaded !!");
}

;(function (modules, clientCacheContainer) {
    var AuthorizationCookiesMgr = {

        getAuthCookies : function(secret, authCookies, cookieMap, isOffline, config) {
            if (!authCookies) {
                authCookies = clientCacheContainer.ClientCache.getItem("authCookies");
            } else {
                clientCacheContainer.ClientCache.addToCache("authCookies", authCookies);
            }

            if (!cookieMap) {
                cookieMap = clientCacheContainer.ClientCache.getItem("authCookiesZappMap");
            } else {
                clientCacheContainer.ClientCache.addToCache("authCookiesZappMap", cookieMap);
            }

            if (!authCookies || isOffline) {
                return;
            }

            var cookieStr, cookieList;
            if (!cookieMap) {
                cookieStr = authCookies;
            } else {
                cookieList = JSON.parse(cookieMap)[location.pathname];
                if (!cookieList && window.Capriza && Capriza.authCookies) {
                    cookieList = Capriza.authCookies.split(",");
                }
                if (!cookieList || cookieList.length == 0) {
                    return;
                }

                var cookieFilters = cookieList.map(function(s) {
                    return s.charAt(0) != "/" ? s : new RegExp(s.substr(1, s.length - 2));
                });
                var cookies = JSON.parse(authCookies).filter(function(cookie) {
                    for (var i = 0; i < cookieFilters.length; ++i) {
                        var cookieFilter = cookieFilters[i];
                        if (typeof cookieFilter == "string" ? cookieFilter == cookie.name : cookieFilter.test(cookie.name)) {
                            return true;
                        }
                    }
                });
                cookieStr = cookies.length ? JSON.stringify(cookies) : null;
                if (typeof modules !== 'undefined' && cookieStr && secret) {
                    cookieStr = window.btoa(modules.Security.encrypt(secret.key, secret.iv, cookieStr));
                }
                if (config) config.cookies = true;
            }

            return cookieStr;
        },
        //todo: clear only the zapp specific cookies and not all
        clearCookies: function(){
            clientCacheContainer.ClientCache.removeItem("authCookies");
            clientCacheContainer.ClientCache.removeItem("authCookiesZappMap");
        }
    };

    if (typeof modules !== 'undefined') {
        modules.AuthorizationCookiesMgr = AuthorizationCookiesMgr;
    }
    else {
        Capriza.AuthorizationCookiesMgr = AuthorizationCookiesMgr;
    }
// This file is used by mobile and designer - in the designer we don't have MBOOT.
})(typeof MBOOT !== 'undefined' ? MBOOT : undefined, typeof MBOOT !== 'undefined' ? MBOOT : window);
if (MBOOT.AppData === undefined) {

  (function(modules) {

    var Logger = new modules.Logger('Run');

    function AppData() {
      this.logger = Logger;
      this._callbacks = [];
    }

    AppData.prototype.fetch = function(cb) {

      var active = this.active;

      this.onReady(cb);

      if (active) {
        return;
      }

      if (!modules.Config.appToken) {
        this.logger.info('skipping boot: no app token');
        this.ready = true;
        return;
      }

      if (!modules.Config.canRunZapp()) {
        this.logger.info('skipping boot: cannot run zapp yet');
        this.ready = true;
        return;
      }

      this.active = true;

      var clientCache = modules.ClientCache.getItem('clientCache');
      var params = clientCache ? {clientCache: clientCache} : {};
      var body = {
        encrypted_params: [],
        encrypted_zapp_params: []
      };

      if (modules.ClientCache.getItem('unique_token')) {
        params.unique_token = JSON.parse(modules.ClientCache.getItem('unique_token'));
      }

      // passing user params to the api (so they get to the engine)
      Object.keys(modules.Query.params).forEach(function(key) {
        if (key.indexOf("zapp_") === 0) {
          params[key] = modules.Query.params[key] || "";
        }
      });

      if (modules.Config.tablet) {
        params.mini = 1;
        params.tablet = 1;
      }

      /////////////////////////// TODO: ORI

      var mvpId = modules.ClientCache.getItem('bgs-' + modules.Config.appToken + '-mvpId');
      var bgsCache = modules.ClientCache.getItem('bgs-' + modules.Config.appToken), mvppp = bgsCache && bgsCache.mvp && bgsCache.mvp[0] && bgsCache.mvp[0].mvppp;

      if (mvpId) {
        params.zapp_showingMvp = true;
        params.zapp_mvpId = mvppp ? mvpId : true;
      }

      if (modules.Query.params.device_uuid) {
          params.device_uuid = modules.Query.params.device_uuid;
      }

      if (modules.Query.params.bundle_id) {
          params.bundle_id = modules.Query.params.bundle_id;
      }

      if (modules.Query.params.push_token) {
          params.push_token = modules.Query.params.push_token;
      }

      /////////////////////////

      /////////////////////////// blueprint (< MED16)
      var defaultStructKey = modules.ClientCache.getItem("struct-" + modules.Config.appToken + "-default");
      if (params["zapp_blueprint"] || !!defaultStructKey) {
        // read the default struct id from localstorage and send to engine in zapp_params
        var defaultStructStr = modules.ClientCache.getItem(defaultStructKey),
            defaultStruct = defaultStructStr && JSON.parse(defaultStructStr);

        if (defaultStruct) {
          params.zapp_structId = defaultStruct.uniqueId;
        }

        var allStuctsKey = "struct-" + modules.Config.appToken + "-all",
            allStructs = modules.ClientCache.getItem(allStuctsKey) || "";

        if (Capriza.structManager && Capriza.structManager.getUniqueIds) {
          allStructs = allStructs.split(",");
          Capriza.structManager.getUniqueIds(modules.Config.tablet).forEach(function(id) {
            if (allStructs.indexOf(id) == -1) {
              allStructs.push(id);
            }
          });
          allStructs = allStructs.join(",");
          Logger.info("allStructs after initialize from resource: " + allStructs);
        }

        params.zapp_structs = allStructs;

        params.zapp_modelId = modules.ClientCache.getItem("modelId-" + modules.Config.appToken);
      }

      /////////////////////////

      params.source = 'mboot';
      params.ecdhkey = modules.Security.public();
      params._ = Date.now();

      // prepare encryption key if needed
      var secret;
      var rtTrustedKeys;
      if (window.Capriza && window.Capriza.rtPublicKey && window.forgeAes) {
        if (modules.Query.params.rtTrustedKeys) {
          rtTrustedKeys = decodeURIComponent(modules.Query.params.rtTrustedKeys).split(',').map(function(c) {return c.trim();});
        }
        // we might get a list of trusted keys from AppConfig
        if (rtTrustedKeys && rtTrustedKeys.indexOf(window.Capriza.rtPublicKey) === -1) {
          this.logger.error('runtime env public key ' + window.Capriza.rtPublicKey +
              ' is not in list of trusted runtime env public keys: ' + rtTrustedKeys.toString());
          this.error = 'Failed to prepare sso cookies';
          this.appData = {success:false, errors: "Secure channel pre-initialization failure", "error_codes":[56]};
          this.ready = true;
          return;
        }
        secret = modules.Security.secretKeyAndIV(window.Capriza.rtPublicKey);
        body.encrypted_params = ['sessionCookies'];
        body.encrypted_zapp_params = ['authCookies'];
      }

      try {
        body.sso_cookies = modules.Security.getSsoCookies(secret, modules.Query.params['ssoCookies']);
      } catch (e) {
        this.error = 'Failed to prepare sso cookies';
        this.appData = {success:false, errors: "Secure channel pre-initialization failure", "error_codes":[56]};
        this.ready = true;
        return;
      }

      var self = this;
      // Cookie cache
      if (!Utils.isIOS && Utils.getFiler()) {
        Utils.getFiler().readJSON(Utils.getBGGlobalFilePath()).then(function(data) {
          body.zapp_authCookies = self.getAuthCookies(secret, data.authCookies, data.authCookiesZappMap);
          self.sendXHR(params, body);
        }, function() {
          Logger.warn("Failed to read authCookies from file");
          body.zapp_authCookies = self.getAuthCookies(secret);
          self.sendXHR(params, body);
        });
      } else {
        body.zapp_authCookies = this.getAuthCookies(secret);
        this.sendXHR(params, body);
      }
    };

    AppData.prototype.sendXHR = function(params, body) {
      var self = this;
      var url = modules.Config.apiUrl + '/run/' + modules.Config.appToken + '.json';
      this.logger.info('sending api run request to ' + url);
      url = url + '?' + modules.Query.format(params);

      this.startTime = Date.now();
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.withCredentials = true;
      xhr.timeout = 30000;

      xhr.onreadystatechange = function() {
        if (XMLHttpRequest.DONE !== xhr.readyState || self.ready) {
          return;
        }

        self.ready = true;
        if (200 !== xhr.status) {
          self.error = xhr.statusText;
        } else {
          try {
            self.appData = JSON.parse(xhr.response);
          } catch (e) {
            self.error = 'error parsing api response: ' + e.message;
          }
        }
        self.fireReady();
      };
      xhr.ontimeout = function() {
        if (self.ready) {
          return;
        }

        self.ready = true;
        self.error = 'timeout';
        self.fireReady();
      };

      xhr.setRequestHeader("Content-type", "application/json");

      modules.Measure.take('apiCallStarted');
      xhr.send(body ? JSON.stringify(body) : undefined);
    };


    AppData.prototype.fireReady = function() {
      modules.Measure.take('apiCallDone');
      this.duration = modules.Measure.duration('apiCallStarted', 'apiCallDone');
      this.logger.info('api run request ' + (this.error ? 'finished with error' : 'done') + '. duration: ' + this.duration);
      if (this.appData) {
        if (this.appData.success) {
          this.logger.info('Received sessionId ' + (this.appData.app_data && this.appData.app_data.session_id));
        }
        else {
          this.logger.info("appData.success is not true")
        }
      }
      var self = this;

      var callbacks = this._callbacks;

      if (callbacks && callbacks.length) {
        this.reset();

        callbacks.forEach(function(cb) {
          cb && cb(self.error, self.appData);
        });
      }
    };

    AppData.prototype.onReady = function(cb) {
      if (!cb) {
        return;
      }
      //TODO: created on October 5 2016 if it's past March 2017 Remove this! we created this hack to fast debug
      // decryption error there is no real use for this
      if (GibberishAES && modules.Security) {
        var oldDec = GibberishAES.dec,
            self = this;
        GibberishAES.dec = function(identity, xkcd) {
          try {
            return oldDec(identity, xkcd);
          } catch (ex) {
            var hash_xkcd = modules.Security.ec.hash().update(xkcd).digest('hex');

            self.logger.error("failed to decrypt identity data for hash(xkcd): " + hash_xkcd, ex, "login");
            throw(ex);
          }
        }
      }
      // -- inject (and possibly override) all measurements into window.take
      // we do it here because at this point we are sure that all the mobile code is loaded
      // otherwise we would not have gotten here
      if (window.take) {
        modules.Measure.all().forEach(function(e) {
          window.take[e.event] = e.value;
        });
      }
      if (this.ready) {
        this.reset();
        cb && cb(this.error, this.appData);
        return;
      }
      this._callbacks.push(cb);
    };

    AppData.prototype.reset = function() {
      this.ready = false;
      this.active = false;
      this._callbacks = [];
    };

    AppData.prototype.getAuthCookies = function(secret, authCookies, cookieMap) {
      return modules.AuthorizationCookiesMgr.getAuthCookies(secret, authCookies, cookieMap, modules.Query.params['zapp_offline'] === "true", modules.Config);
    };

    modules.AppData = new AppData();

    if (modules.Query.params.fastrun !== 'false' && !window.testMode && window.location.hash.indexOf('testmode') < 0 && modules.Config.canRunZapp()) {
        modules.AppData.fetch();
    }

  })(MBOOT);

}
