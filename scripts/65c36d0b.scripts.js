var CryptoJS = CryptoJS || function (s, p) {
    var m = {}, l = m.lib = {}, n = function () {
      }, r = l.Base = {
        extend: function (b) {
          n.prototype = this;
          var h = new n();
          b && h.mixIn(b);
          h.hasOwnProperty('init') || (h.init = function () {
            h.$super.init.apply(this, arguments);
          });
          h.init.prototype = h;
          h.$super = this;
          return h;
        },
        create: function () {
          var b = this.extend();
          b.init.apply(b, arguments);
          return b;
        },
        init: function () {
        },
        mixIn: function (b) {
          for (var h in b)
            b.hasOwnProperty(h) && (this[h] = b[h]);
          b.hasOwnProperty('toString') && (this.toString = b.toString);
        },
        clone: function () {
          return this.init.prototype.extend(this);
        }
      }, q = l.WordArray = r.extend({
        init: function (b, h) {
          b = this.words = b || [];
          this.sigBytes = h != p ? h : 4 * b.length;
        },
        toString: function (b) {
          return (b || t).stringify(this);
        },
        concat: function (b) {
          var h = this.words, a = b.words, j = this.sigBytes;
          b = b.sigBytes;
          this.clamp();
          if (j % 4)
            for (var g = 0; g < b; g++)
              h[j + g >>> 2] |= (a[g >>> 2] >>> 24 - 8 * (g % 4) & 255) << 24 - 8 * ((j + g) % 4);
          else if (65535 < a.length)
            for (g = 0; g < b; g += 4)
              h[j + g >>> 2] = a[g >>> 2];
          else
            h.push.apply(h, a);
          this.sigBytes += b;
          return this;
        },
        clamp: function () {
          var b = this.words, h = this.sigBytes;
          b[h >>> 2] &= 4294967295 << 32 - 8 * (h % 4);
          b.length = s.ceil(h / 4);
        },
        clone: function () {
          var b = r.clone.call(this);
          b.words = this.words.slice(0);
          return b;
        },
        random: function (b) {
          for (var h = [], a = 0; a < b; a += 4)
            h.push(4294967296 * s.random() | 0);
          return new q.init(h, b);
        }
      }), v = m.enc = {}, t = v.Hex = {
        stringify: function (b) {
          var a = b.words;
          b = b.sigBytes;
          for (var g = [], j = 0; j < b; j++) {
            var k = a[j >>> 2] >>> 24 - 8 * (j % 4) & 255;
            g.push((k >>> 4).toString(16));
            g.push((k & 15).toString(16));
          }
          return g.join('');
        },
        parse: function (b) {
          for (var a = b.length, g = [], j = 0; j < a; j += 2)
            g[j >>> 3] |= parseInt(b.substr(j, 2), 16) << 24 - 4 * (j % 8);
          return new q.init(g, a / 2);
        }
      }, a = v.Latin1 = {
        stringify: function (b) {
          var a = b.words;
          b = b.sigBytes;
          for (var g = [], j = 0; j < b; j++)
            g.push(String.fromCharCode(a[j >>> 2] >>> 24 - 8 * (j % 4) & 255));
          return g.join('');
        },
        parse: function (b) {
          for (var a = b.length, g = [], j = 0; j < a; j++)
            g[j >>> 2] |= (b.charCodeAt(j) & 255) << 24 - 8 * (j % 4);
          return new q.init(g, a);
        }
      }, u = v.Utf8 = {
        stringify: function (b) {
          try {
            return decodeURIComponent(escape(a.stringify(b)));
          } catch (g) {
            throw Error('Malformed UTF-8 data');
          }
        },
        parse: function (b) {
          return a.parse(unescape(encodeURIComponent(b)));
        }
      }, g = l.BufferedBlockAlgorithm = r.extend({
        reset: function () {
          this._data = new q.init();
          this._nDataBytes = 0;
        },
        _append: function (b) {
          'string' == typeof b && (b = u.parse(b));
          this._data.concat(b);
          this._nDataBytes += b.sigBytes;
        },
        _process: function (b) {
          var a = this._data, g = a.words, j = a.sigBytes, k = this.blockSize, m = j / (4 * k), m = b ? s.ceil(m) : s.max((m | 0) - this._minBufferSize, 0);
          b = m * k;
          j = s.min(4 * b, j);
          if (b) {
            for (var l = 0; l < b; l += k)
              this._doProcessBlock(g, l);
            l = g.splice(0, b);
            a.sigBytes -= j;
          }
          return new q.init(l, j);
        },
        clone: function () {
          var b = r.clone.call(this);
          b._data = this._data.clone();
          return b;
        },
        _minBufferSize: 0
      });
    l.Hasher = g.extend({
      cfg: r.extend(),
      init: function (b) {
        this.cfg = this.cfg.extend(b);
        this.reset();
      },
      reset: function () {
        g.reset.call(this);
        this._doReset();
      },
      update: function (b) {
        this._append(b);
        this._process();
        return this;
      },
      finalize: function (b) {
        b && this._append(b);
        return this._doFinalize();
      },
      blockSize: 16,
      _createHelper: function (b) {
        return function (a, g) {
          return new b.init(g).finalize(a);
        };
      },
      _createHmacHelper: function (b) {
        return function (a, g) {
          return new k.HMAC.init(b, g).finalize(a);
        };
      }
    });
    var k = m.algo = {};
    return m;
  }(Math);
(function (s) {
  function p(a, k, b, h, l, j, m) {
    a = a + (k & b | ~k & h) + l + m;
    return (a << j | a >>> 32 - j) + k;
  }
  function m(a, k, b, h, l, j, m) {
    a = a + (k & h | b & ~h) + l + m;
    return (a << j | a >>> 32 - j) + k;
  }
  function l(a, k, b, h, l, j, m) {
    a = a + (k ^ b ^ h) + l + m;
    return (a << j | a >>> 32 - j) + k;
  }
  function n(a, k, b, h, l, j, m) {
    a = a + (b ^ (k | ~h)) + l + m;
    return (a << j | a >>> 32 - j) + k;
  }
  for (var r = CryptoJS, q = r.lib, v = q.WordArray, t = q.Hasher, q = r.algo, a = [], u = 0; 64 > u; u++)
    a[u] = 4294967296 * s.abs(s.sin(u + 1)) | 0;
  q = q.MD5 = t.extend({
    _doReset: function () {
      this._hash = new v.init([
        1732584193,
        4023233417,
        2562383102,
        271733878
      ]);
    },
    _doProcessBlock: function (g, k) {
      for (var b = 0; 16 > b; b++) {
        var h = k + b, w = g[h];
        g[h] = (w << 8 | w >>> 24) & 16711935 | (w << 24 | w >>> 8) & 4278255360;
      }
      var b = this._hash.words, h = g[k + 0], w = g[k + 1], j = g[k + 2], q = g[k + 3], r = g[k + 4], s = g[k + 5], t = g[k + 6], u = g[k + 7], v = g[k + 8], x = g[k + 9], y = g[k + 10], z = g[k + 11], A = g[k + 12], B = g[k + 13], C = g[k + 14], D = g[k + 15], c = b[0], d = b[1], e = b[2], f = b[3], c = p(c, d, e, f, h, 7, a[0]), f = p(f, c, d, e, w, 12, a[1]), e = p(e, f, c, d, j, 17, a[2]), d = p(d, e, f, c, q, 22, a[3]), c = p(c, d, e, f, r, 7, a[4]), f = p(f, c, d, e, s, 12, a[5]), e = p(e, f, c, d, t, 17, a[6]), d = p(d, e, f, c, u, 22, a[7]), c = p(c, d, e, f, v, 7, a[8]), f = p(f, c, d, e, x, 12, a[9]), e = p(e, f, c, d, y, 17, a[10]), d = p(d, e, f, c, z, 22, a[11]), c = p(c, d, e, f, A, 7, a[12]), f = p(f, c, d, e, B, 12, a[13]), e = p(e, f, c, d, C, 17, a[14]), d = p(d, e, f, c, D, 22, a[15]), c = m(c, d, e, f, w, 5, a[16]), f = m(f, c, d, e, t, 9, a[17]), e = m(e, f, c, d, z, 14, a[18]), d = m(d, e, f, c, h, 20, a[19]), c = m(c, d, e, f, s, 5, a[20]), f = m(f, c, d, e, y, 9, a[21]), e = m(e, f, c, d, D, 14, a[22]), d = m(d, e, f, c, r, 20, a[23]), c = m(c, d, e, f, x, 5, a[24]), f = m(f, c, d, e, C, 9, a[25]), e = m(e, f, c, d, q, 14, a[26]), d = m(d, e, f, c, v, 20, a[27]), c = m(c, d, e, f, B, 5, a[28]), f = m(f, c, d, e, j, 9, a[29]), e = m(e, f, c, d, u, 14, a[30]), d = m(d, e, f, c, A, 20, a[31]), c = l(c, d, e, f, s, 4, a[32]), f = l(f, c, d, e, v, 11, a[33]), e = l(e, f, c, d, z, 16, a[34]), d = l(d, e, f, c, C, 23, a[35]), c = l(c, d, e, f, w, 4, a[36]), f = l(f, c, d, e, r, 11, a[37]), e = l(e, f, c, d, u, 16, a[38]), d = l(d, e, f, c, y, 23, a[39]), c = l(c, d, e, f, B, 4, a[40]), f = l(f, c, d, e, h, 11, a[41]), e = l(e, f, c, d, q, 16, a[42]), d = l(d, e, f, c, t, 23, a[43]), c = l(c, d, e, f, x, 4, a[44]), f = l(f, c, d, e, A, 11, a[45]), e = l(e, f, c, d, D, 16, a[46]), d = l(d, e, f, c, j, 23, a[47]), c = n(c, d, e, f, h, 6, a[48]), f = n(f, c, d, e, u, 10, a[49]), e = n(e, f, c, d, C, 15, a[50]), d = n(d, e, f, c, s, 21, a[51]), c = n(c, d, e, f, A, 6, a[52]), f = n(f, c, d, e, q, 10, a[53]), e = n(e, f, c, d, y, 15, a[54]), d = n(d, e, f, c, w, 21, a[55]), c = n(c, d, e, f, v, 6, a[56]), f = n(f, c, d, e, D, 10, a[57]), e = n(e, f, c, d, t, 15, a[58]), d = n(d, e, f, c, B, 21, a[59]), c = n(c, d, e, f, r, 6, a[60]), f = n(f, c, d, e, z, 10, a[61]), e = n(e, f, c, d, j, 15, a[62]), d = n(d, e, f, c, x, 21, a[63]);
      b[0] = b[0] + c | 0;
      b[1] = b[1] + d | 0;
      b[2] = b[2] + e | 0;
      b[3] = b[3] + f | 0;
    },
    _doFinalize: function () {
      var a = this._data, k = a.words, b = 8 * this._nDataBytes, h = 8 * a.sigBytes;
      k[h >>> 5] |= 128 << 24 - h % 32;
      var l = s.floor(b / 4294967296);
      k[(h + 64 >>> 9 << 4) + 15] = (l << 8 | l >>> 24) & 16711935 | (l << 24 | l >>> 8) & 4278255360;
      k[(h + 64 >>> 9 << 4) + 14] = (b << 8 | b >>> 24) & 16711935 | (b << 24 | b >>> 8) & 4278255360;
      a.sigBytes = 4 * (k.length + 1);
      this._process();
      a = this._hash;
      k = a.words;
      for (b = 0; 4 > b; b++)
        h = k[b], k[b] = (h << 8 | h >>> 24) & 16711935 | (h << 24 | h >>> 8) & 4278255360;
      return a;
    },
    clone: function () {
      var a = t.clone.call(this);
      a._hash = this._hash.clone();
      return a;
    }
  });
  r.MD5 = t._createHelper(q);
  r.HmacMD5 = t._createHmacHelper(q);
}(Math));
var CryptoJS = CryptoJS || function (q, k) {
    var e = {}, l = e.lib = {}, p = function () {
      }, c = l.Base = {
        extend: function (a) {
          p.prototype = this;
          var b = new p();
          a && b.mixIn(a);
          b.hasOwnProperty('init') || (b.init = function () {
            b.$super.init.apply(this, arguments);
          });
          b.init.prototype = b;
          b.$super = this;
          return b;
        },
        create: function () {
          var a = this.extend();
          a.init.apply(a, arguments);
          return a;
        },
        init: function () {
        },
        mixIn: function (a) {
          for (var b in a)
            a.hasOwnProperty(b) && (this[b] = a[b]);
          a.hasOwnProperty('toString') && (this.toString = a.toString);
        },
        clone: function () {
          return this.init.prototype.extend(this);
        }
      }, s = l.WordArray = c.extend({
        init: function (a, b) {
          a = this.words = a || [];
          this.sigBytes = b != k ? b : 4 * a.length;
        },
        toString: function (a) {
          return (a || d).stringify(this);
        },
        concat: function (a) {
          var b = this.words, m = a.words, n = this.sigBytes;
          a = a.sigBytes;
          this.clamp();
          if (n % 4)
            for (var r = 0; r < a; r++)
              b[n + r >>> 2] |= (m[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 24 - 8 * ((n + r) % 4);
          else if (65535 < m.length)
            for (r = 0; r < a; r += 4)
              b[n + r >>> 2] = m[r >>> 2];
          else
            b.push.apply(b, m);
          this.sigBytes += a;
          return this;
        },
        clamp: function () {
          var a = this.words, b = this.sigBytes;
          a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4);
          a.length = q.ceil(b / 4);
        },
        clone: function () {
          var a = c.clone.call(this);
          a.words = this.words.slice(0);
          return a;
        },
        random: function (a) {
          for (var b = [], m = 0; m < a; m += 4)
            b.push(4294967296 * q.random() | 0);
          return new s.init(b, a);
        }
      }), b = e.enc = {}, d = b.Hex = {
        stringify: function (a) {
          var b = a.words;
          a = a.sigBytes;
          for (var m = [], n = 0; n < a; n++) {
            var r = b[n >>> 2] >>> 24 - 8 * (n % 4) & 255;
            m.push((r >>> 4).toString(16));
            m.push((r & 15).toString(16));
          }
          return m.join('');
        },
        parse: function (a) {
          for (var b = a.length, m = [], n = 0; n < b; n += 2)
            m[n >>> 3] |= parseInt(a.substr(n, 2), 16) << 24 - 4 * (n % 8);
          return new s.init(m, b / 2);
        }
      }, a = b.Latin1 = {
        stringify: function (a) {
          var b = a.words;
          a = a.sigBytes;
          for (var m = [], n = 0; n < a; n++)
            m.push(String.fromCharCode(b[n >>> 2] >>> 24 - 8 * (n % 4) & 255));
          return m.join('');
        },
        parse: function (a) {
          for (var b = a.length, m = [], n = 0; n < b; n++)
            m[n >>> 2] |= (a.charCodeAt(n) & 255) << 24 - 8 * (n % 4);
          return new s.init(m, b);
        }
      }, u = b.Utf8 = {
        stringify: function (b) {
          try {
            return decodeURIComponent(escape(a.stringify(b)));
          } catch (c) {
            throw Error('Malformed UTF-8 data');
          }
        },
        parse: function (b) {
          return a.parse(unescape(encodeURIComponent(b)));
        }
      }, t = l.BufferedBlockAlgorithm = c.extend({
        reset: function () {
          this._data = new s.init();
          this._nDataBytes = 0;
        },
        _append: function (a) {
          'string' == typeof a && (a = u.parse(a));
          this._data.concat(a);
          this._nDataBytes += a.sigBytes;
        },
        _process: function (a) {
          var b = this._data, m = b.words, n = b.sigBytes, r = this.blockSize, c = n / (4 * r), c = a ? q.ceil(c) : q.max((c | 0) - this._minBufferSize, 0);
          a = c * r;
          n = q.min(4 * a, n);
          if (a) {
            for (var t = 0; t < a; t += r)
              this._doProcessBlock(m, t);
            t = m.splice(0, a);
            b.sigBytes -= n;
          }
          return new s.init(t, n);
        },
        clone: function () {
          var a = c.clone.call(this);
          a._data = this._data.clone();
          return a;
        },
        _minBufferSize: 0
      });
    l.Hasher = t.extend({
      cfg: c.extend(),
      init: function (a) {
        this.cfg = this.cfg.extend(a);
        this.reset();
      },
      reset: function () {
        t.reset.call(this);
        this._doReset();
      },
      update: function (a) {
        this._append(a);
        this._process();
        return this;
      },
      finalize: function (a) {
        a && this._append(a);
        return this._doFinalize();
      },
      blockSize: 16,
      _createHelper: function (a) {
        return function (b, m) {
          return new a.init(m).finalize(b);
        };
      },
      _createHmacHelper: function (a) {
        return function (b, m) {
          return new w.HMAC.init(a, m).finalize(b);
        };
      }
    });
    var w = e.algo = {};
    return e;
  }(Math);
(function () {
  var q = CryptoJS, k = q.lib.WordArray;
  q.enc.Base64 = {
    stringify: function (e) {
      var l = e.words, p = e.sigBytes, c = this._map;
      e.clamp();
      e = [];
      for (var k = 0; k < p; k += 3)
        for (var b = (l[k >>> 2] >>> 24 - 8 * (k % 4) & 255) << 16 | (l[k + 1 >>> 2] >>> 24 - 8 * ((k + 1) % 4) & 255) << 8 | l[k + 2 >>> 2] >>> 24 - 8 * ((k + 2) % 4) & 255, d = 0; 4 > d && k + 0.75 * d < p; d++)
          e.push(c.charAt(b >>> 6 * (3 - d) & 63));
      if (l = c.charAt(64))
        for (; e.length % 4;)
          e.push(l);
      return e.join('');
    },
    parse: function (e) {
      var l = e.length, p = this._map, c = p.charAt(64);
      c && (c = e.indexOf(c), -1 != c && (l = c));
      for (var c = [], s = 0, b = 0; b < l; b++)
        if (b % 4) {
          var d = p.indexOf(e.charAt(b - 1)) << 2 * (b % 4), a = p.indexOf(e.charAt(b)) >>> 6 - 2 * (b % 4);
          c[s >>> 2] |= (d | a) << 24 - 8 * (s % 4);
          s++;
        }
      return k.create(c, s);
    },
    _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  };
}());
(function (q) {
  function k(a, b, c, d, m, n, r) {
    a = a + (b & c | ~b & d) + m + r;
    return (a << n | a >>> 32 - n) + b;
  }
  function e(a, b, c, d, m, n, r) {
    a = a + (b & d | c & ~d) + m + r;
    return (a << n | a >>> 32 - n) + b;
  }
  function l(a, b, c, d, m, n, r) {
    a = a + (b ^ c ^ d) + m + r;
    return (a << n | a >>> 32 - n) + b;
  }
  function p(a, b, c, d, m, n, r) {
    a = a + (c ^ (b | ~d)) + m + r;
    return (a << n | a >>> 32 - n) + b;
  }
  for (var c = CryptoJS, s = c.lib, b = s.WordArray, d = s.Hasher, s = c.algo, a = [], u = 0; 64 > u; u++)
    a[u] = 4294967296 * q.abs(q.sin(u + 1)) | 0;
  s = s.MD5 = d.extend({
    _doReset: function () {
      this._hash = new b.init([
        1732584193,
        4023233417,
        2562383102,
        271733878
      ]);
    },
    _doProcessBlock: function (b, c) {
      for (var d = 0; 16 > d; d++) {
        var s = c + d, m = b[s];
        b[s] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360;
      }
      var d = this._hash.words, s = b[c + 0], m = b[c + 1], n = b[c + 2], r = b[c + 3], x = b[c + 4], u = b[c + 5], q = b[c + 6], y = b[c + 7], z = b[c + 8], A = b[c + 9], B = b[c + 10], C = b[c + 11], D = b[c + 12], E = b[c + 13], F = b[c + 14], G = b[c + 15], f = d[0], g = d[1], h = d[2], j = d[3], f = k(f, g, h, j, s, 7, a[0]), j = k(j, f, g, h, m, 12, a[1]), h = k(h, j, f, g, n, 17, a[2]), g = k(g, h, j, f, r, 22, a[3]), f = k(f, g, h, j, x, 7, a[4]), j = k(j, f, g, h, u, 12, a[5]), h = k(h, j, f, g, q, 17, a[6]), g = k(g, h, j, f, y, 22, a[7]), f = k(f, g, h, j, z, 7, a[8]), j = k(j, f, g, h, A, 12, a[9]), h = k(h, j, f, g, B, 17, a[10]), g = k(g, h, j, f, C, 22, a[11]), f = k(f, g, h, j, D, 7, a[12]), j = k(j, f, g, h, E, 12, a[13]), h = k(h, j, f, g, F, 17, a[14]), g = k(g, h, j, f, G, 22, a[15]), f = e(f, g, h, j, m, 5, a[16]), j = e(j, f, g, h, q, 9, a[17]), h = e(h, j, f, g, C, 14, a[18]), g = e(g, h, j, f, s, 20, a[19]), f = e(f, g, h, j, u, 5, a[20]), j = e(j, f, g, h, B, 9, a[21]), h = e(h, j, f, g, G, 14, a[22]), g = e(g, h, j, f, x, 20, a[23]), f = e(f, g, h, j, A, 5, a[24]), j = e(j, f, g, h, F, 9, a[25]), h = e(h, j, f, g, r, 14, a[26]), g = e(g, h, j, f, z, 20, a[27]), f = e(f, g, h, j, E, 5, a[28]), j = e(j, f, g, h, n, 9, a[29]), h = e(h, j, f, g, y, 14, a[30]), g = e(g, h, j, f, D, 20, a[31]), f = l(f, g, h, j, u, 4, a[32]), j = l(j, f, g, h, z, 11, a[33]), h = l(h, j, f, g, C, 16, a[34]), g = l(g, h, j, f, F, 23, a[35]), f = l(f, g, h, j, m, 4, a[36]), j = l(j, f, g, h, x, 11, a[37]), h = l(h, j, f, g, y, 16, a[38]), g = l(g, h, j, f, B, 23, a[39]), f = l(f, g, h, j, E, 4, a[40]), j = l(j, f, g, h, s, 11, a[41]), h = l(h, j, f, g, r, 16, a[42]), g = l(g, h, j, f, q, 23, a[43]), f = l(f, g, h, j, A, 4, a[44]), j = l(j, f, g, h, D, 11, a[45]), h = l(h, j, f, g, G, 16, a[46]), g = l(g, h, j, f, n, 23, a[47]), f = p(f, g, h, j, s, 6, a[48]), j = p(j, f, g, h, y, 10, a[49]), h = p(h, j, f, g, F, 15, a[50]), g = p(g, h, j, f, u, 21, a[51]), f = p(f, g, h, j, D, 6, a[52]), j = p(j, f, g, h, r, 10, a[53]), h = p(h, j, f, g, B, 15, a[54]), g = p(g, h, j, f, m, 21, a[55]), f = p(f, g, h, j, z, 6, a[56]), j = p(j, f, g, h, G, 10, a[57]), h = p(h, j, f, g, q, 15, a[58]), g = p(g, h, j, f, E, 21, a[59]), f = p(f, g, h, j, x, 6, a[60]), j = p(j, f, g, h, C, 10, a[61]), h = p(h, j, f, g, n, 15, a[62]), g = p(g, h, j, f, A, 21, a[63]);
      d[0] = d[0] + f | 0;
      d[1] = d[1] + g | 0;
      d[2] = d[2] + h | 0;
      d[3] = d[3] + j | 0;
    },
    _doFinalize: function () {
      var a = this._data, b = a.words, c = 8 * this._nDataBytes, d = 8 * a.sigBytes;
      b[d >>> 5] |= 128 << 24 - d % 32;
      var m = q.floor(c / 4294967296);
      b[(d + 64 >>> 9 << 4) + 15] = (m << 8 | m >>> 24) & 16711935 | (m << 24 | m >>> 8) & 4278255360;
      b[(d + 64 >>> 9 << 4) + 14] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360;
      a.sigBytes = 4 * (b.length + 1);
      this._process();
      a = this._hash;
      b = a.words;
      for (c = 0; 4 > c; c++)
        d = b[c], b[c] = (d << 8 | d >>> 24) & 16711935 | (d << 24 | d >>> 8) & 4278255360;
      return a;
    },
    clone: function () {
      var a = d.clone.call(this);
      a._hash = this._hash.clone();
      return a;
    }
  });
  c.MD5 = d._createHelper(s);
  c.HmacMD5 = d._createHmacHelper(s);
}(Math));
(function () {
  var q = CryptoJS, k = q.lib, e = k.Base, l = k.WordArray, k = q.algo, p = k.EvpKDF = e.extend({
      cfg: e.extend({
        keySize: 4,
        hasher: k.MD5,
        iterations: 1
      }),
      init: function (c) {
        this.cfg = this.cfg.extend(c);
      },
      compute: function (c, e) {
        for (var b = this.cfg, d = b.hasher.create(), a = l.create(), k = a.words, p = b.keySize, b = b.iterations; k.length < p;) {
          q && d.update(q);
          var q = d.update(c).finalize(e);
          d.reset();
          for (var v = 1; v < b; v++)
            q = d.finalize(q), d.reset();
          a.concat(q);
        }
        a.sigBytes = 4 * p;
        return a;
      }
    });
  q.EvpKDF = function (c, e, b) {
    return p.create(b).compute(c, e);
  };
}());
CryptoJS.lib.Cipher || function (q) {
  var k = CryptoJS, e = k.lib, l = e.Base, p = e.WordArray, c = e.BufferedBlockAlgorithm, s = k.enc.Base64, b = k.algo.EvpKDF, d = e.Cipher = c.extend({
      cfg: l.extend(),
      createEncryptor: function (a, b) {
        return this.create(this._ENC_XFORM_MODE, a, b);
      },
      createDecryptor: function (a, b) {
        return this.create(this._DEC_XFORM_MODE, a, b);
      },
      init: function (a, b, c) {
        this.cfg = this.cfg.extend(c);
        this._xformMode = a;
        this._key = b;
        this.reset();
      },
      reset: function () {
        c.reset.call(this);
        this._doReset();
      },
      process: function (a) {
        this._append(a);
        return this._process();
      },
      finalize: function (a) {
        a && this._append(a);
        return this._doFinalize();
      },
      keySize: 4,
      ivSize: 4,
      _ENC_XFORM_MODE: 1,
      _DEC_XFORM_MODE: 2,
      _createHelper: function (a) {
        return {
          encrypt: function (b, c, d) {
            return ('string' == typeof c ? H : v).encrypt(a, b, c, d);
          },
          decrypt: function (b, c, d) {
            return ('string' == typeof c ? H : v).decrypt(a, b, c, d);
          }
        };
      }
    });
  e.StreamCipher = d.extend({
    _doFinalize: function () {
      return this._process(!0);
    },
    blockSize: 1
  });
  var a = k.mode = {}, u = function (a, b, c) {
      var d = this._iv;
      d ? this._iv = q : d = this._prevBlock;
      for (var e = 0; e < c; e++)
        a[b + e] ^= d[e];
    }, t = (e.BlockCipherMode = l.extend({
      createEncryptor: function (a, b) {
        return this.Encryptor.create(a, b);
      },
      createDecryptor: function (a, b) {
        return this.Decryptor.create(a, b);
      },
      init: function (a, b) {
        this._cipher = a;
        this._iv = b;
      }
    })).extend();
  t.Encryptor = t.extend({
    processBlock: function (a, b) {
      var c = this._cipher, d = c.blockSize;
      u.call(this, a, b, d);
      c.encryptBlock(a, b);
      this._prevBlock = a.slice(b, b + d);
    }
  });
  t.Decryptor = t.extend({
    processBlock: function (a, b) {
      var c = this._cipher, d = c.blockSize, e = a.slice(b, b + d);
      c.decryptBlock(a, b);
      u.call(this, a, b, d);
      this._prevBlock = e;
    }
  });
  a = a.CBC = t;
  t = (k.pad = {}).Pkcs7 = {
    pad: function (a, b) {
      for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, e = [], k = 0; k < c; k += 4)
        e.push(d);
      c = p.create(e, c);
      a.concat(c);
    },
    unpad: function (a) {
      a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255;
    }
  };
  e.BlockCipher = d.extend({
    cfg: d.cfg.extend({
      mode: a,
      padding: t
    }),
    reset: function () {
      d.reset.call(this);
      var a = this.cfg, b = a.iv, a = a.mode;
      if (this._xformMode == this._ENC_XFORM_MODE)
        var c = a.createEncryptor;
      else
        c = a.createDecryptor, this._minBufferSize = 1;
      this._mode = c.call(a, this, b && b.words);
    },
    _doProcessBlock: function (a, b) {
      this._mode.processBlock(a, b);
    },
    _doFinalize: function () {
      var a = this.cfg.padding;
      if (this._xformMode == this._ENC_XFORM_MODE) {
        a.pad(this._data, this.blockSize);
        var b = this._process(!0);
      } else
        b = this._process(!0), a.unpad(b);
      return b;
    },
    blockSize: 4
  });
  var w = e.CipherParams = l.extend({
      init: function (a) {
        this.mixIn(a);
      },
      toString: function (a) {
        return (a || this.formatter).stringify(this);
      }
    }), a = (k.format = {}).OpenSSL = {
      stringify: function (a) {
        var b = a.ciphertext;
        a = a.salt;
        return (a ? p.create([
          1398893684,
          1701076831
        ]).concat(a).concat(b) : b).toString(s);
      },
      parse: function (a) {
        a = s.parse(a);
        var b = a.words;
        if (1398893684 == b[0] && 1701076831 == b[1]) {
          var c = p.create(b.slice(2, 4));
          b.splice(0, 4);
          a.sigBytes -= 16;
        }
        return w.create({
          ciphertext: a,
          salt: c
        });
      }
    }, v = e.SerializableCipher = l.extend({
      cfg: l.extend({ format: a }),
      encrypt: function (a, b, c, d) {
        d = this.cfg.extend(d);
        var e = a.createEncryptor(c, d);
        b = e.finalize(b);
        e = e.cfg;
        return w.create({
          ciphertext: b,
          key: c,
          iv: e.iv,
          algorithm: a,
          mode: e.mode,
          padding: e.padding,
          blockSize: a.blockSize,
          formatter: d.format
        });
      },
      decrypt: function (a, b, c, d) {
        d = this.cfg.extend(d);
        b = this._parse(b, d.format);
        return a.createDecryptor(c, d).finalize(b.ciphertext);
      },
      _parse: function (a, b) {
        return 'string' == typeof a ? b.parse(a, this) : a;
      }
    }), k = (k.kdf = {}).OpenSSL = {
      execute: function (a, c, d, e) {
        e || (e = p.random(8));
        a = b.create({ keySize: c + d }).compute(a, e);
        d = p.create(a.words.slice(c), 4 * d);
        a.sigBytes = 4 * c;
        return w.create({
          key: a,
          iv: d,
          salt: e
        });
      }
    }, H = e.PasswordBasedCipher = v.extend({
      cfg: v.cfg.extend({ kdf: k }),
      encrypt: function (a, b, c, d) {
        d = this.cfg.extend(d);
        c = d.kdf.execute(c, a.keySize, a.ivSize);
        d.iv = c.iv;
        a = v.encrypt.call(this, a, b, c.key, d);
        a.mixIn(c);
        return a;
      },
      decrypt: function (a, b, c, d) {
        d = this.cfg.extend(d);
        b = this._parse(b, d.format);
        c = d.kdf.execute(c, a.keySize, a.ivSize, b.salt);
        d.iv = c.iv;
        return v.decrypt.call(this, a, b, c.key, d);
      }
    });
}();
(function () {
  function q() {
    for (var b = this._X, d = this._C, a = 0; 8 > a; a++)
      p[a] = d[a];
    d[0] = d[0] + 1295307597 + this._b | 0;
    d[1] = d[1] + 3545052371 + (d[0] >>> 0 < p[0] >>> 0 ? 1 : 0) | 0;
    d[2] = d[2] + 886263092 + (d[1] >>> 0 < p[1] >>> 0 ? 1 : 0) | 0;
    d[3] = d[3] + 1295307597 + (d[2] >>> 0 < p[2] >>> 0 ? 1 : 0) | 0;
    d[4] = d[4] + 3545052371 + (d[3] >>> 0 < p[3] >>> 0 ? 1 : 0) | 0;
    d[5] = d[5] + 886263092 + (d[4] >>> 0 < p[4] >>> 0 ? 1 : 0) | 0;
    d[6] = d[6] + 1295307597 + (d[5] >>> 0 < p[5] >>> 0 ? 1 : 0) | 0;
    d[7] = d[7] + 3545052371 + (d[6] >>> 0 < p[6] >>> 0 ? 1 : 0) | 0;
    this._b = d[7] >>> 0 < p[7] >>> 0 ? 1 : 0;
    for (a = 0; 8 > a; a++) {
      var e = b[a] + d[a], k = e & 65535, l = e >>> 16;
      c[a] = ((k * k >>> 17) + k * l >>> 15) + l * l ^ ((e & 4294901760) * e | 0) + ((e & 65535) * e | 0);
    }
    b[0] = c[0] + (c[7] << 16 | c[7] >>> 16) + (c[6] << 16 | c[6] >>> 16) | 0;
    b[1] = c[1] + (c[0] << 8 | c[0] >>> 24) + c[7] | 0;
    b[2] = c[2] + (c[1] << 16 | c[1] >>> 16) + (c[0] << 16 | c[0] >>> 16) | 0;
    b[3] = c[3] + (c[2] << 8 | c[2] >>> 24) + c[1] | 0;
    b[4] = c[4] + (c[3] << 16 | c[3] >>> 16) + (c[2] << 16 | c[2] >>> 16) | 0;
    b[5] = c[5] + (c[4] << 8 | c[4] >>> 24) + c[3] | 0;
    b[6] = c[6] + (c[5] << 16 | c[5] >>> 16) + (c[4] << 16 | c[4] >>> 16) | 0;
    b[7] = c[7] + (c[6] << 8 | c[6] >>> 24) + c[5] | 0;
  }
  var k = CryptoJS, e = k.lib.StreamCipher, l = [], p = [], c = [], s = k.algo.Rabbit = e.extend({
      _doReset: function () {
        for (var b = this._key.words, c = this.cfg.iv, a = 0; 4 > a; a++)
          b[a] = (b[a] << 8 | b[a] >>> 24) & 16711935 | (b[a] << 24 | b[a] >>> 8) & 4278255360;
        for (var e = this._X = [
              b[0],
              b[3] << 16 | b[2] >>> 16,
              b[1],
              b[0] << 16 | b[3] >>> 16,
              b[2],
              b[1] << 16 | b[0] >>> 16,
              b[3],
              b[2] << 16 | b[1] >>> 16
            ], b = this._C = [
              b[2] << 16 | b[2] >>> 16,
              b[0] & 4294901760 | b[1] & 65535,
              b[3] << 16 | b[3] >>> 16,
              b[1] & 4294901760 | b[2] & 65535,
              b[0] << 16 | b[0] >>> 16,
              b[2] & 4294901760 | b[3] & 65535,
              b[1] << 16 | b[1] >>> 16,
              b[3] & 4294901760 | b[0] & 65535
            ], a = this._b = 0; 4 > a; a++)
          q.call(this);
        for (a = 0; 8 > a; a++)
          b[a] ^= e[a + 4 & 7];
        if (c) {
          var a = c.words, c = a[0], a = a[1], c = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360, a = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360, e = c >>> 16 | a & 4294901760, k = a << 16 | c & 65535;
          b[0] ^= c;
          b[1] ^= e;
          b[2] ^= a;
          b[3] ^= k;
          b[4] ^= c;
          b[5] ^= e;
          b[6] ^= a;
          b[7] ^= k;
          for (a = 0; 4 > a; a++)
            q.call(this);
        }
      },
      _doProcessBlock: function (b, c) {
        var a = this._X;
        q.call(this);
        l[0] = a[0] ^ a[5] >>> 16 ^ a[3] << 16;
        l[1] = a[2] ^ a[7] >>> 16 ^ a[5] << 16;
        l[2] = a[4] ^ a[1] >>> 16 ^ a[7] << 16;
        l[3] = a[6] ^ a[3] >>> 16 ^ a[1] << 16;
        for (a = 0; 4 > a; a++)
          l[a] = (l[a] << 8 | l[a] >>> 24) & 16711935 | (l[a] << 24 | l[a] >>> 8) & 4278255360, b[c + a] ^= l[a];
      },
      blockSize: 4,
      ivSize: 2
    });
  k.Rabbit = e._createHelper(s);
}());
(function () {
  var e = CryptoJS, f = e.lib.WordArray, e = e.enc;
  e.Utf16 = e.Utf16BE = {
    stringify: function (b) {
      var d = b.words;
      b = b.sigBytes;
      for (var c = [], a = 0; a < b; a += 2)
        c.push(String.fromCharCode(d[a >>> 2] >>> 16 - 8 * (a % 4) & 65535));
      return c.join('');
    },
    parse: function (b) {
      for (var d = b.length, c = [], a = 0; a < d; a++)
        c[a >>> 1] |= b.charCodeAt(a) << 16 - 16 * (a % 2);
      return f.create(c, 2 * d);
    }
  };
  e.Utf16LE = {
    stringify: function (b) {
      var d = b.words;
      b = b.sigBytes;
      for (var c = [], a = 0; a < b; a += 2)
        c.push(String.fromCharCode((d[a >>> 2] >>> 16 - 8 * (a % 4) & 65535) << 8 & 4278255360 | (d[a >>> 2] >>> 16 - 8 * (a % 4) & 65535) >>> 8 & 16711935));
      return c.join('');
    },
    parse: function (b) {
      for (var d = b.length, c = [], a = 0; a < d; a++) {
        var e = c, g = a >>> 1, j = e[g], h = b.charCodeAt(a) << 16 - 16 * (a % 2);
        e[g] = j | h << 8 & 4278255360 | h >>> 8 & 16711935;
      }
      return f.create(c, 2 * d);
    }
  };
}());
'use strict';
function Kanban(name, numberOfColumns) {
  return {
    name: name,
    numberOfColumns: numberOfColumns,
    columns: [],
    archived: [],
    settings: {}
  };
}
function KanbanColumn(name) {
  return {
    name: name,
    cards: [],
    settings: {}
  };
}
function KanbanColumn(name, settings) {
  return {
    name: name,
    cards: [],
    settings: settings
  };
}
function KanbanCard(name, details, color) {
  this.name = name;
  this.details = details;
  this.color = color;
  return this;
}
'use strict';
angular.module('mpk', [
  'ui.bootstrap',
  'ngSanitize',
  'ui.utils',
  'ngRoute',
  'angularSpectrumColorpicker'
]).config([
  '$routeProvider',
  '$locationProvider',
  function ($routeProvider, $locationProvider) {
    $routeProvider.when('/kanban', {
      templateUrl: 'kanban.html',
      controller: 'ApplicationController'
    }).when('/kanban/:kanbanName', {
      templateUrl: 'kanban.html',
      controller: 'ApplicationController'
    }).otherwise({ redirectTo: '/kanban' });
  }
]);
;
'use strict';
angular.module('mpk').factory('cloudService', [
  '$http',
  '$log',
  '$q',
  '$timeout',
  'cryptoService',
  function ($http, $log, $q, $timeout, cryptoService) {
    return {
      cloudAddress: 'https://my-personal-kanban.appspot.com',
      settings: {
        notLoaded: true,
        encryptionKey: 'my-random-key'
      },
      loadSettings: function () {
        var settings = localStorage.getItem('myPersonalKanban.cloudSettings');
        if (settings == undefined) {
          this.settings = {
            notSetup: true,
            encryptionKey: 'my-random-key'
          };
          return this.settings;
        }
        this.settings = angular.fromJson(settings);
        this.settings.notSetup = false;
        if (this.settings.encryptionKey == undefined) {
          this.settings.encryptionKey = 'my-random-key';
        }
        if (this.settings.useLocalCloud) {
          this.cloudAddress = this.settings.localCloudUrl;
        }
        return this.settings;
      },
      saveSettings: function (settings) {
        this.settings = settings;
        localStorage.setItem('myPersonalKanban.cloudSettings', angular.toJson(this.settings, false));
        this.loadSettings();
        return this.settings;
      },
      downloadKanban: function () {
        if (this.settings.notLoaded) {
          this.loadSettings();
        }
        var params = {
            kanbanKey: this.settings.kanbanKey,
            action: 'get'
          };
        return $http.jsonp(this.cloudAddress + '/service/kanban?callback=JSON_CALLBACK', { params: params });
      },
      uploadKanban: function (kanban) {
        if (this.settings.notLoaded) {
          this.loadSettings();
        }
        var self = this;
        function splitSlice(str, len) {
          var ret = [];
          for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
            ret.push(str.slice(offset, len + offset));
          }
          return ret;
        }
        ;
        function sendStart(numberOfFragments) {
          var params = {
              kanbanKey: self.settings.kanbanKey,
              action: 'put',
              fragments: numberOfFragments
            };
          return $http.jsonp(self.cloudAddress + '/service/kanban?callback=JSON_CALLBACK', { params: params });
        }
        ;
        function sendChunk(chunk, chunkNumber) {
          var params = {
              kanbanKey: self.settings.kanbanKey,
              action: 'put',
              chunk: chunk,
              chunkNumber: chunkNumber
            };
          return $http.jsonp(self.cloudAddress + '/service/kanban?callback=JSON_CALLBACK', { params: params });
        }
        ;
        function checkKanbanValidity(kanban) {
          var hash = cryptoService.md5Hash(kanban);
          var params = {
              kanbanKey: self.settings.kanbanKey,
              action: 'put',
              hash: hash
            };
          return $http.jsonp(self.cloudAddress + '/service/kanban?callback=JSON_CALLBACK', { params: params });
        }
        ;
        var encryptetKanban = cryptoService.encrypt(kanban, this.settings.encryptionKey);
        var kanbanInChunks = splitSlice(encryptetKanban, 1000);
        var promise = sendStart(kanbanInChunks.length);
        angular.forEach(kanbanInChunks, function (value, index) {
          promise = promise.then(function () {
            return sendChunk(value, index + 1);
          });
        });
        return promise.then(function () {
          return checkKanbanValidity(encryptetKanban);
        });
      },
      isConfigurationValid: function () {
        if (this.settings.notLoaded) {
          this.loadSettings();
        }
        return this.settings.kanbanKey != undefined && this.settings.kanbanKey != '';
      }
    };
  }
]);
'use strict';
angular.module('mpk').factory('kanbanRepository', [
  'cloudService',
  'cryptoService',
  function (cloudService, cryptoService) {
    return {
      kanbansByName: {},
      lastUsed: '',
      theme: 'default-bright',
      lastUpdated: 0,
      add: function (kanban) {
        this.kanbansByName[kanban.name] = kanban;
        this.save();
        return kanban;
      },
      all: function () {
        return this.kanbansByName;
      },
      get: function (kanbanName) {
        return this.kanbansByName[kanbanName];
      },
      remove: function (kanbanName) {
        if (this.kanbansByName[kanbanName]) {
          delete this.kanbansByName[kanbanName];
        }
        return this.kanbansByName;
      },
      prepareSerializedKanbans: function () {
        var toBeSerialized = {
            kanbans: this.kanbansByName,
            lastUsed: this.lastUsed,
            theme: this.theme,
            lastUpdated: this.lastUpdated
          };
        return angular.toJson(toBeSerialized, false);
      },
      save: function () {
        var prepared = this.prepareSerializedKanbans();
        localStorage.setItem('myPersonalKanban', prepared);
        return this.kanbansByName;
      },
      load: function () {
        var saved = angular.fromJson(localStorage.getItem('myPersonalKanban'));
        if (saved === null) {
          return null;
        }
        this.kanbansByName = saved.kanbans;
        this.lastUsed = saved.lastUsed;
        this.theme = saved.theme;
        this.lastUpdated = saved.lastUpdated;
        return this.kanbansByName;
      },
      getLastUsed: function () {
        if (!this.lastUsed) {
          return this.kanbansByName[Object.keys(this.kanbansByName)[0]];
        }
        return this.kanbansByName[this.lastUsed];
      },
      setLastUsed: function (kanbanName) {
        this.lastUsed = kanbanName;
        return this.lastUsed;
      },
      getTheme: function () {
        return this.theme;
      },
      setTheme: function (theme) {
        this.theme = theme;
        this.save();
        return this.theme;
      },
      upload: function () {
        return cloudService.uploadKanban(this.prepareSerializedKanbans());
      },
      setLastUpdated: function (updated) {
        this.lastUpdated = updated;
        return this;
      },
      getLastUpdated: function () {
        return this.lastUpdated;
      },
      download: function () {
        return cloudService.downloadKanban();
      },
      saveDownloadedKanban: function (kanban, lastUpdated) {
        if (typeof kanban == 'string') {
          try {
            kanban = cryptoService.decrypt(kanban, cloudService.settings.encryptionKey);
          } catch (ex) {
            console.debug(ex);
            return {
              success: false,
              message: 'Looks like Kanban saved in the cloud was persisted with different encryption key. You\'ll need to use old key to download your Kanban. Set it up in the Cloud Setup menu.'
            };
          }
        }
        var fromCloud = angular.fromJson(kanban);
        this.kanbansByName = fromCloud.kanbans;
        this.lastUsed = fromCloud.lastUsed;
        this.theme = fromCloud.theme;
        this.lastUpdated = lastUpdated;
        this.save();
        return { success: true };
      },
      renameLastUsedTo: function (newName) {
        var lastUsed = this.getLastUsed();
        delete this.kanbansByName[lastUsed.name];
        lastUsed.name = newName;
        this.kanbansByName[newName] = lastUsed;
        this.lastUsed = newName;
        return true;
      },
      import: function (kanbans) {
        var self = this;
        angular.forEach(Object.keys(kanbans), function (kanbanName) {
          self.kanbansByName[kanbanName] = kanbans[kanbanName];
        });
        var names = Object.keys(kanbans);
        this.setLastUsed(kanbans[names[0]]);
        this.save();
      }
    };
  }
]);
'use strict';
angular.module('mpk').factory('kanbanManipulator', function () {
  return {
    addColumn: function (kanban, columnName) {
      kanban.columns.push(new KanbanColumn(columnName));
    },
    addCardToColumn: function (kanban, column, cardTitle, details, color) {
      angular.forEach(kanban.columns, function (col) {
        if (col.name === column.name) {
          col.cards.push(new KanbanCard(cardTitle, details, color));
        }
      });
    },
    removeCardFromColumn: function (kanban, column, card) {
      angular.forEach(kanban.columns, function (col) {
        if (col.name === column.name) {
          col.cards.splice(col.cards.indexOf(card), 1);
        }
      });
    },
    archiveCard: function (kanban, column, card) {
      if (kanban.archived == undefined) {
        kanban.archived = [];
      }
      kanban.archived.push({
        card: card,
        archivedOn: new Date()
      });
      this.removeCardFromColumn(kanban, column, card);
    },
    unarchiveCard: function (kanban, archivedCard) {
      function lastColumn(kanban) {
        return kanban.columns[kanban.columns.length - 1];
      }
      this.removeFromArchive(kanban, archivedCard);
      lastColumn(kanban).cards.push(archivedCard.card);
    },
    removeFromArchive: function (kanban, archivedCard) {
      kanban.archived.splice(kanban.archived.indexOf(archivedCard), 1);
    },
    createNewFromTemplate: function (kanban, newName) {
      var newKanban = new Kanban(newName, kanban.columns.length);
      angular.forEach(kanban.columns, function (col) {
        newKanban.columns.push(new KanbanColumn(col.name, col.settings));
      });
      return newKanban;
    }
  };
});
'use strict';
angular.module('mpk').factory('themesProvider', [
  '$window',
  function ($window) {
    var themes = $window.themes;
    return {
      getThemes: function () {
        return themes;
      },
      setCurrentTheme: function (theme) {
        var themeStylesheet = document.getElementById('themeStylesheet');
        var pathPart = themeStylesheet.href.substr(0, themeStylesheet.href.lastIndexOf('/'));
        themeStylesheet.href = pathPart + '/' + theme + '.css';
        return themeStylesheet.href;
      },
      defaultTheme: 'default-bright'
    };
  }
]);
'use strict';
angular.module('mpk').factory('fileService', function () {
  return {
    saveBlob: function (blob, fileName) {
      return saveAs(blob, fileName);
    }
  };
});
'use strict';
var ApplicationController = function ($scope, $window, kanbanRepository, themesProvider, $routeParams, $location) {
  $scope.colorOptions = [
    'FFFFFF',
    'DBDBDB',
    'FFB5B5',
    'FF9E9E',
    'FCC7FC',
    'FC9AFB',
    'CCD0FC',
    '989FFA',
    'CFFAFC',
    '9EFAFF',
    '94D6FF',
    'C1F7C2',
    'A2FCA3',
    'FAFCD2',
    'FAFFA1',
    'FCE4D4',
    'FCC19D'
  ];
  $scope.$on('NewKanbanAdded', function () {
    $scope.kanban = kanbanRepository.getLastUsed();
    $scope.allKanbans = Object.keys(kanbanRepository.all());
    $scope.selectedToOpen = $scope.kanban.name;
    $location.path('/kanban/' + $scope.kanban.name);
    $scope.switchToList = $scope.allKanbans.slice(0);
    $scope.switchToList.splice(0, 0, 'Switch to ...');
  });
  $scope.$on('KanbanDeleted', function () {
    $scope.kanban = undefined;
    $scope.allKanbans = Object.keys(kanbanRepository.all());
    if ($scope.allKanbans.length > 0) {
      $scope.switchToKanban($scope.allKanbans[0]);
    }
    $scope.switchToList = $scope.allKanbans.slice(0);
    $scope.switchToList.splice(0, 0, 'Switch to ...');
  });
  $scope.$on('UploadStarted', function () {
    $scope.errorMessage = '';
    $scope.showError = false;
    $scope.infoMessage = 'Uploading Kanban ...';
    $scope.showInfo = true;
    $scope.showSpinner = true;
  });
  $scope.$on('UploadFinished', function () {
    $scope.infoMessage = '';
    $scope.showInfo = false;
    $scope.showSpinner = false;
  });
  function handleErrorUploadDownload(event, errorMessage) {
    $scope.infoMessage = '';
    $scope.showInfo = true;
    $scope.showError = true;
    $scope.showSpinner = false;
    $scope.errorMessage = errorMessage;
  }
  $scope.$on('UploadFinishedWithErrors', handleErrorUploadDownload);
  $scope.$on('UploadError', function () {
    $scope.infoMessage = '';
    $scope.showInfo = true;
    $scope.showSpinner = false;
    $scope.showError = true;
    $scope.errorMessage = 'There was a problem uploading your Kanban.';
  });
  $scope.$on('DownloadStarted', function () {
    $scope.infoMessage = 'Downloading your Kanban ...';
    $scope.showSpinner = true;
    $scope.showError = false;
    $scope.errorMessage = '';
  });
  $scope.$on('DownloadFinished', function () {
    $window.location.reload();
  });
  $scope.$on('DownloadFinishedWithError', handleErrorUploadDownload);
  $scope.$on('DownloadError', function () {
    $scope.infoMessage = '';
    $scope.showInfo = true;
    $scope.showError = true;
    $scope.showSpinner = false;
    $scope.errorMessage = 'Problem Downloading your Kanban. Check Internet connectivity and try again.';
  });
  $scope.editingKanbanName = function () {
    $scope.editingName = true;
  };
  $scope.editingName = false;
  $scope.rename = function () {
    kanbanRepository.renameLastUsedTo($scope.newName);
    kanbanRepository.save();
    $scope.allKanbans = Object.keys(kanbanRepository.all());
    $scope.editingName = false;
    $scope.switchToKanban($scope.newName);
  };
  $scope.openKanbanShortcut = function ($event) {
    $scope.$broadcast('TriggerOpen');
  };
  $scope.switchToKanban = function (kanbanName) {
    if (kanbanName == 'Switch to ...')
      return;
    $scope.kanban = kanbanRepository.get(kanbanName);
    kanbanRepository.setLastUsed(kanbanName);
    $scope.newName = kanbanName;
    $location.path('/kanban/' + kanbanName);
    kanbanRepository.save();
    $scope.switchTo = 'Switch to ...';
  };
  $scope.openHelpShortcut = function ($event) {
    $scope.$broadcast('TriggerHelp');
  };
  $scope.spinConfig = {
    lines: 10,
    length: 3,
    width: 2,
    radius: 5
  };
  var currentKanban = new Kanban('Kanban name', 0);
  var loadedRepo = kanbanRepository.load();
  if (loadedRepo) {
    if ($routeParams.kanbanName != undefined && kanbanRepository.get($routeParams.kanbanName)) {
      currentKanban = kanbanRepository.get($routeParams.kanbanName);
    } else if (kanbanRepository.getLastUsed() != undefined) {
      currentKanban = kanbanRepository.getLastUsed();
      $location.path('/kanban/' + currentKanban.name);
    }
  }
  $scope.kanban = currentKanban;
  $scope.allKanbans = Object.keys(kanbanRepository.all());
  $scope.selectedToOpen = $scope.newName = currentKanban.name;
  $scope.switchToList = $scope.allKanbans.slice(0);
  $scope.switchToList.splice(0, 0, 'Switch to ...');
  $scope.switchTo = 'Switch to ...';
  $scope.$watch('kanban', function () {
    kanbanRepository.save();
  }, true);
  $scope.columnHeight = angular.element($window).height() - 110;
  $scope.triggerOpen = function () {
    $scope.$broadcast('TriggerOpenKanban');
  };
  if (kanbanRepository.getTheme() != undefined && kanbanRepository.getTheme() != '') {
    themesProvider.setCurrentTheme(kanbanRepository.getTheme());
  }
};
'use strict';
var MenuController = function ($scope, kanbanRepository, $modal, $timeout, $rootScope) {
  function allKanbanNames(kanbanRepository) {
    return Object.keys(kanbanRepository.all());
  }
  $scope.newKanban = function () {
    var modalInstance = $modal.open({
        templateUrl: 'NewKanbanModal.html',
        controller: 'NewKanbanController',
        resolve: {
          kanbanNames: function () {
            return allKanbanNames(kanbanRepository);
          }
        }
      });
    modalInstance.result.then(function (created) {
      if (created) {
        $rootScope.$broadcast('NewKanbanAdded');
      }
    });
  };
  $scope.delete = function () {
    if (confirm('You sure you want to delete the entire Kanban?')) {
      kanbanRepository.remove($scope.kanban.name);
      var all = allKanbanNames(kanbanRepository);
      if (all.length > 0) {
        kanbanRepository.setLastUsed(all[0]);
      } else {
        kanbanRepository.setLastUsed(undefined);
      }
      $scope.$emit('KanbanDeleted');
    }
    return false;
  };
  $scope.selectTheme = function () {
    $modal.open({
      templateUrl: 'SelectTheme.html',
      controller: 'SwitchThemeController'
    });
  };
  $scope.help = function () {
    var modalInstance = $modal.open({
        templateUrl: 'HelpModal.html',
        controller: 'HelpController',
        windowClass: 'help'
      });
  };
  $scope.$on('TriggerHelp', function () {
    $scope.help();
  });
  $scope.export = function (allKanbans, currentKanban) {
    var modalInstance = $modal.open({
        templateUrl: 'ExportModal.html',
        controller: 'ExportController',
        resolve: {
          allKanbanNames: function () {
            return allKanbans;
          },
          currentKanban: function () {
            return currentKanban;
          }
        }
      });
  };
  $scope.import = function () {
    var modalInstance = $modal.open({
        templateUrl: 'ImportModal.html',
        controller: 'ImportController',
        resolve: {
          kanbanRepository: function () {
            return kanbanRepository;
          }
        }
      });
    modalInstance.result.then(function (imported) {
      if (imported) {
        $rootScope.$broadcast('DownloadFinished');
      }
    });
  };
  $scope.openArchive = function (currentKanban) {
    $modal.open({
      templateUrl: 'ArchiveModal.html',
      controller: 'ArchiveController',
      windowClass: 'archive',
      resolve: {
        kanban: function () {
          return currentKanban;
        }
      }
    });
  };
};
'use strict';
var NewKanbanController = function ($scope, $modalInstance, kanbanRepository, kanbanManipulator, kanbanNames) {
  $scope.numberOfColumns = 3;
  $scope.kanbanName = '';
  $scope.model = { useTemplate: '' };
  $scope.model.kanbanNames = kanbanNames;
  $scope.createNew = function () {
    if (!this.newKanbanForm.$valid) {
      return false;
    }
    var newKanban = new Kanban(this.kanbanName, this.numberOfColumns);
    if ($scope.model.useTemplate != '') {
      var templateKanban = kanbanRepository.all()[$scope.model.useTemplate];
      newKanban = kanbanManipulator.createNewFromTemplate(templateKanban, this.kanbanName);
    } else {
      for (var i = 1; i < parseInt(this.numberOfColumns) + 1; i++) {
        kanbanManipulator.addColumn(newKanban, 'Column ' + i);
      }
    }
    kanbanRepository.add(newKanban);
    this.kanbanName = '';
    this.numberOfColumns = 3;
    kanbanRepository.setLastUsed(newKanban.name);
    $modalInstance.close(true);
    return true;
  };
  $scope.closeNewKanban = function () {
    $scope.numberOfColumns = 3;
    $scope.kanbanName = '';
    $modalInstance.close();
  };
};
'use strict';
var CardController = function ($scope, $modalInstance, colorOptions, card) {
  function initScope(scope, card, colorOptions) {
    scope.name = card.name;
    scope.details = card.details;
    scope.card = card;
    scope.cardColor = card.color;
    scope.colorOptions = colorOptions;
    scope.editTitle = false;
    scope.editDetails = false;
  }
  $scope.close = function () {
    $modalInstance.close();
  };
  $scope.update = function () {
    if (!this.cardDetails.$valid) {
      return false;
    }
    this.card.name = this.name;
    this.card.details = this.details;
    this.card.color = this.cardColor;
    $modalInstance.close(this.card);
  };
  $scope.editTitle = function () {
    var scope = this;
    scope.editTitle = false;
  };
  initScope($scope, card, colorOptions);
};
'use strict';
var ColumnSettingsController = function ($scope, $modalInstance, kanban, column) {
  $scope.model = {
    column: column,
    kanban: kanban,
    columnName: column.name,
    color: ''
  };
  if (column.settings != undefined && column.settings.color != undefined) {
    $scope.model.color = column.settings.color;
  }
  $scope.close = function () {
    $modalInstance.close();
  };
  $scope.update = function () {
    var col = $scope.model.column;
    col.name = $scope.model.columnName;
    if (col.settings == undefined) {
      col.settings = {};
    }
    col.settings.color = $scope.model.color;
    $modalInstance.close();
  };
};
'use strict';
var NewKanbanCardController = function ($scope, $modalInstance, kanbanManipulator, colorOptions, column) {
  function initScope(scope, colorOptions) {
    scope.kanbanColumnName = column.name;
    scope.column = column;
    scope.title = '';
    scope.details = '';
    scope.cardColor = colorOptions[0];
    scope.colorOptions = colorOptions;
  }
  $scope.addNewCard = function () {
    if (!this.newCardForm.$valid) {
      return false;
    }
    $modalInstance.close({
      title: this.title,
      column: column,
      details: this.details,
      color: this.cardColor
    });
  };
  $scope.close = function () {
    $modalInstance.close();
  };
  initScope($scope, colorOptions);
};
'use strict';
var KanbanController = function ($scope, $modal, kanbanManipulator) {
  $scope.addNewCard = function (column) {
    var modalInstance = $modal.open({
        templateUrl: 'NewKanbanCard.html',
        controller: 'NewKanbanCardController',
        resolve: {
          colorOptions: function () {
            return $scope.colorOptions;
          },
          column: function () {
            return column;
          }
        }
      });
    modalInstance.result.then(function (cardDetails) {
      if (cardDetails) {
        kanbanManipulator.addCardToColumn($scope.kanban, cardDetails.column, cardDetails.title, cardDetails.details, cardDetails.color);
      }
    });
  };
  $scope.delete = function (card, column) {
    if (confirm('You sure?')) {
      kanbanManipulator.removeCardFromColumn($scope.kanban, column, card);
    }
  };
  $scope.openCardDetails = function (card) {
    $modal.open({
      templateUrl: 'OpenCard.html',
      controller: 'CardController',
      resolve: {
        colorOptions: function () {
          return $scope.colorOptions;
        },
        card: function () {
          return card;
        }
      }
    });
  };
  $scope.details = function (card) {
    if (card.details !== undefined && card.details !== '') {
      return card.details;
    }
    return card.name;
  };
  $scope.colorFor = function (card) {
    return card.color !== undefined && card.color !== '' ? card.color : $scope.colorOptions[0];
  };
  $scope.isLastColumn = function (column, kanban) {
    function last(coll) {
      return coll[coll.length - 1];
    }
    return last(kanban.columns).name == column;
  };
  $scope.archive = function (kanban, column, card) {
    return kanbanManipulator.archiveCard(kanban, column, card);
  };
  $scope.columnSettings = function (kanban, column) {
    $modal.open({
      templateUrl: 'ColumnSettings.html',
      controller: 'ColumnSettingsController',
      resolve: {
        kanban: function () {
          return kanban;
        },
        column: function () {
          return column;
        }
      }
    });
  };
};
'use strict';
var CloudMenuController = function ($scope, $modal, kanbanRepository, cloudService) {
  $scope.openCloudSetup = function (showConfigurationError) {
    var modalInstance = $modal.open({
        templateUrl: 'SetupCloudModal.html',
        controller: 'SetupCloudController',
        resolve: {
          showConfigurationError: function () {
            return showConfigurationError;
          }
        }
      });
    return false;
  };
  $scope.upload = function () {
    if (!cloudService.isConfigurationValid()) {
      return $scope.openCloudSetup(true);
    }
    var promise = kanbanRepository.upload();
    $scope.$emit('UploadStarted');
    promise.then(function (result) {
      if (result.data.success) {
        kanbanRepository.setLastUpdated(result.data.lastUpdated).save();
        $scope.$emit('UploadFinished');
      } else {
        $scope.$emit('UploadFinishedWithErrors', result.data.error);
        console.error(result);
      }
    }, function (errors) {
      $scope.$emit('UploadError');
    });
    return false;
  };
  $scope.download = function () {
    if (!cloudService.isConfigurationValid()) {
      return $scope.openCloudSetup(true);
    }
    $scope.$emit('DownloadStarted');
    var promise = kanbanRepository.download();
    promise.success(function (data) {
      if (data.success) {
        var saveResult = kanbanRepository.saveDownloadedKanban(data.kanban, data.lastUpdated);
        if (saveResult.success) {
          $scope.$emit('DownloadFinished');
        } else {
          $scope.$emit('DownloadFinishedWithError', saveResult.message);
        }
      } else {
        $scope.$emit('DownloadFinishedWithError', data.error);
      }
    }).error(function (data, status, headers, config) {
      $scope.$emit('DownloadError', data);
    });
    return false;
  };
};
'use strict';
var SwitchThemeController = function ($scope, $modalInstance, themesProvider, kanbanRepository) {
  $scope.model = {};
  $scope.model.themes = themesProvider.getThemes();
  var theme = kanbanRepository.getTheme();
  if (theme == undefined || theme == '') {
    theme = themesProvider.defaultTheme;
  }
  $scope.model.selectedTheme = theme;
  $scope.close = function () {
    $modalInstance.close();
  };
  $scope.switchTheme = function () {
    themesProvider.setCurrentTheme($scope.model.selectedTheme);
    kanbanRepository.setTheme($scope.model.selectedTheme);
    $modalInstance.close();
  };
};
'use strict';
var SetupCloudController = function ($scope, $modalInstance, cloudService, showConfigurationError) {
  $scope.model = {};
  $scope.model.showConfigurationError = showConfigurationError;
  $scope.close = function () {
    $modalInstance.close();
  };
  $scope.saveSettings = function () {
    if ($scope.model.kanbanKey != undefined && $scope.model.kanbanKey.length != 0) {
      var settings = {
          kanbanKey: $scope.model.kanbanKey,
          encryptionKey: $scope.model.encryptionKey,
          useLocalCloud: $scope.model.useLocalCloud,
          localCloudUrl: $scope.model.localCloudUrl
        };
      cloudService.saveSettings(settings);
      $scope.close();
    }
  };
  var settings = cloudService.loadSettings();
  if (!settings.notSetup) {
    $scope.model.kanbanKey = settings.kanbanKey;
    $scope.model.encryptionKey = settings.encryptionKey;
    $scope.model.useLocalCloud = settings.useLocalCloud;
    $scope.model.localCloudUrl = settings.localCloudUrl;
  }
};
'use strict';
var HelpController = function ($scope, $modalInstance) {
  $scope.close = function () {
    $modalInstance.close();
  };
};
'use strict';
var ExportController = function ($scope, $modalInstance, kanbanRepository, fileService, allKanbanNames, currentKanban) {
  $scope.model = { exportAll: false };
  $scope.model.allKanbanNames = allKanbanNames;
  $scope.model.selectedKanban = currentKanban;
  $scope.close = function () {
    $modalInstance.close();
  };
  $scope.doExport = function () {
    var toExport = null;
    var fileName = $scope.model.selectedKanban + '-export.json';
    if ($scope.model.exportAll) {
      var kanbans = kanbanRepository.all();
      toExport = new Blob([angular.toJson(kanbans, true)], { type: 'application/json;charset=utf-8' });
      fileName = 'all-kanbans-export.json';
    } else {
      var kanban = kanbanRepository.get($scope.model.selectedKanban);
      toExport = new Blob([angular.toJson(kanban, true)], { type: 'application/json;charset=utf-8' });
    }
    fileService.saveBlob(toExport, fileName);
    $modalInstance.close();
  };
};
'use strict';
var ImportController = function ($scope, $modalInstance, kanbanRepository) {
  $scope.model = {
    file: '',
    readError: false,
    fileSelected: false
  };
  $scope.close = function () {
    $modalInstance.close(false);
  };
  $scope.import = function () {
    function singleKanban(kanbanObject) {
      var keys = Object.keys(kanbanObject);
      return keys.lastIndexOf('columns') > -1;
    }
    if ($scope.model.file != '') {
      try {
        var kanbanOrKanbans = angular.fromJson($scope.model.file);
        if (singleKanban(kanbanOrKanbans)) {
          var toImport = {};
          toImport[kanbanOrKanbans.name] = kanbanOrKanbans;
          kanbanRepository.import(toImport);
        } else {
          kanbanRepository.import(kanbanOrKanbans);
        }
        $modalInstance.close(true);
      } catch (exception) {
        $scope.model.readError = true;
      }
    } else {
      $scope.model.readError = true;
    }
  };
};
'use strict';
var ArchiveController = function ($scope, $modalInstance, kanban, kanbanManipulator) {
  function prepareArchivedCardsForCheckboxes(archived) {
    var prepared = [];
    angular.forEach(archived, function (archivedCard, index) {
      prepared.push({
        card: archivedCard.card,
        archivedOn: archivedCard.archivedOn,
        selected: false,
        original: archivedCard
      });
    });
    return prepared;
  }
  $scope.model = {
    archived: prepareArchivedCardsForCheckboxes(kanban.archived),
    selectedCards: [],
    kanban: kanban
  };
  $scope.formatDate = function (date) {
    var date = new Date(Date.parse(date));
    return date.toUTCString();
  };
  $scope.unarchiveSelected = function () {
    angular.forEach($scope.model.archived, function (archivedWithSelection) {
      if (archivedWithSelection.selected) {
        $scope.model.archived.splice($scope.model.archived.indexOf(archivedWithSelection), 1);
        kanbanManipulator.unarchiveCard($scope.model.kanban, archivedWithSelection.original);
      }
    });
  };
  $scope.deleteSelected = function () {
    angular.forEach($scope.model.archived, function (archivedWithSelection) {
      if (archivedWithSelection.selected) {
        $scope.model.archived.splice($scope.model.archived.indexOf(archivedWithSelection), 1);
        kanbanManipulator.removeFromArchive($scope.model.kanban, archivedWithSelection.original);
      }
    });
  };
  $scope.close = function () {
    $modalInstance.close();
  };
};
'use strict';
angular.module('mpk').directive('colorSelector', function () {
  return {
    restrict: 'E',
    scope: {
      options: '=',
      model: '=ngModel',
      prefix: '@',
      showRadios: '=',
      showHexCode: '='
    },
    require: 'ngModel',
    template: '<span ng-show="showHexCode">&nbsp;#{{model}}</span><div class="pull-left" ng-repeat="option in options" ng-model="option">\n' + '\t<label class="colorBox" for="{{prefix}}{{option}}" ng-class="{selected: option == model}" style="background-color: #{{option}};" ng-click="selectColor(option)"></label>\n' + '\t<br ng-show="showRadios"/>\n' + '\t<input type="radio" id="{{prefix}}{{option}}" name="{{prefix}}" value="{{option}}" ng-show="showRadios" ng-model="model"/>\n' + '</div>\n',
    link: function (scope) {
      if (scope.model === undefined || scope.model === '') {
        scope.model = scope.options[0];
      }
      scope.selectColor = function (color) {
        scope.model = color;
      };
    }
  };
});
'use strict';
angular.module('mpk').directive('focusMe', [
  '$timeout',
  function ($timeout) {
    return {
      link: function (scope, element, attrs) {
        if (attrs.focusMe) {
          scope.$watch(attrs.focusMe, function (value) {
            if (value === true) {
              $timeout(function () {
                element[0].focus();
              });
            }
          });
        } else {
          $timeout(function () {
            element[0].focus();
          });
        }
      }
    };
  }
]);
'use strict';
angular.module('mpk').value('uiSortableConfig', {}).directive('uiSortable', [
  'uiSortableConfig',
  '$timeout',
  '$log',
  function (uiSortableConfig, $timeout, $log) {
    return {
      require: '?ngModel',
      link: function (scope, element, attrs, ngModel) {
        var savedNodes;
        function combineCallbacks(first, second) {
          if (second && typeof second === 'function') {
            return function (e, ui) {
              first(e, ui);
              second(e, ui);
            };
          }
          return first;
        }
        var opts = {};
        var callbacks = {
            receive: null,
            remove: null,
            start: null,
            stop: null,
            update: null
          };
        angular.extend(opts, uiSortableConfig);
        if (ngModel) {
          scope.$watch(attrs.ngModel + '.length', function () {
            $timeout(function () {
              element.sortable('refresh');
            });
          });
          callbacks.start = function (e, ui) {
            ui.item.sortable = {
              index: ui.item.index(),
              cancel: function () {
                ui.item.sortable._isCanceled = true;
              },
              isCanceled: function () {
                return ui.item.sortable._isCanceled;
              },
              _isCanceled: false
            };
          };
          callbacks.activate = function () {
            savedNodes = element.contents();
            var placeholder = element.sortable('option', 'placeholder');
            if (placeholder && placeholder.element && typeof placeholder.element === 'function') {
              var phElement = placeholder.element();
              if (!phElement.jquery) {
                phElement = angular.element(phElement);
              }
              var excludes = element.find('[class="' + phElement.attr('class') + '"]');
              savedNodes = savedNodes.not(excludes);
            }
          };
          callbacks.update = function (e, ui) {
            if (!ui.item.sortable.received) {
              ui.item.sortable.dropindex = ui.item.index();
              ui.item.sortable.droptarget = ui.item.parent();
              element.sortable('cancel');
            }
            savedNodes.detach();
            if (element.sortable('option', 'helper') === 'clone') {
              savedNodes = savedNodes.not(savedNodes.last());
            }
            savedNodes.appendTo(element);
            if (ui.item.sortable.received && !ui.item.sortable.isCanceled()) {
              scope.$apply(function () {
                ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0, ui.item.sortable.moved);
              });
            }
          };
          callbacks.stop = function (e, ui) {
            if (!ui.item.sortable.received && 'dropindex' in ui.item.sortable && !ui.item.sortable.isCanceled()) {
              scope.$apply(function () {
                ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0, ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0]);
              });
            } else {
              if ((!('dropindex' in ui.item.sortable) || ui.item.sortable.isCanceled()) && element.sortable('option', 'helper') !== 'clone') {
                savedNodes.detach().appendTo(element);
              }
            }
          };
          callbacks.receive = function (e, ui) {
            ui.item.sortable.received = true;
          };
          callbacks.remove = function (e, ui) {
            if (!ui.item.sortable.isCanceled()) {
              scope.$apply(function () {
                ui.item.sortable.moved = ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0];
              });
            }
          };
          scope.$watch(attrs.uiSortable, function (newVal) {
            angular.forEach(newVal, function (value, key) {
              if (callbacks[key]) {
                if (key === 'stop') {
                  value = combineCallbacks(value, function () {
                    scope.$apply();
                  });
                }
                value = combineCallbacks(callbacks[key], value);
              }
              element.sortable('option', key, value);
            });
          }, true);
          angular.forEach(callbacks, function (value, key) {
            opts[key] = combineCallbacks(value, opts[key]);
          });
        } else {
          $log.info('ui.sortable: ngModel not provided!', element);
        }
        element.sortable(opts);
      }
    };
  }
]);
'use strict';
angular.module('mpk').directive('readFile', function () {
  return {
    restrict: 'A',
    scope: { model: '=ngModel' },
    require: 'ngModel',
    link: function (scope, element) {
      element.bind('change', function (e) {
        scope.readError = false;
        var file = (e.srcElement || e.target).files[0];
        var reader = new FileReader();
        reader.onload = function (onLoadEvent) {
          scope.$apply(function () {
            scope.model = onLoadEvent.target.result;
          });
        };
        reader.readAsText(file);
      });
    }
  };
});
'use strict';
angular.module('mpk').filter('cardDetails', function () {
  return function (input) {
    if (input == undefined || input === '')
      return input;
    return input.replace(/&#10;/g, '<br />');
  };
});
'use strict';
angular.module('mpk').filter('archiveByCardName', function () {
  return function (archivedCards, filterValue) {
    var filtered = [];
    var filter = filterValue || '';
    angular.forEach(archivedCards, function (archivedCard) {
      if (archivedCard.card.name.toLowerCase().indexOf(filter.toLowerCase()) > -1) {
        filtered.push(archivedCard);
      }
    });
    return filtered.reverse();
  };
});
'use strict';
angular.module('mpk').factory('cryptoService', function () {
  return {
    md5Hash: function (stringToHash) {
      return CryptoJS.MD5(stringToHash).toString();
    },
    encrypt: function (stringToEncrypt, encryptionKey) {
      var utfEncoded = CryptoJS.enc.Utf8.parse(stringToEncrypt);
      return CryptoJS.Rabbit.encrypt(utfEncoded, encryptionKey).toString();
    },
    decrypt: function (stringToDecrypt, encryptionKey) {
      var notYetUtf8 = CryptoJS.Rabbit.decrypt(stringToDecrypt, encryptionKey);
      return CryptoJS.enc.Utf8.stringify(notYetUtf8);
    }
  };
});
'use strict';
angular.module('mpk').directive('spin', function () {
  var augmentOpts = function (color, opts) {
    if (!opts.color) {
      opts.color = color;
    }
  };
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    template: '<div ng-transclude></div>',
    scope: {
      config: '=spin',
      spinif: '=spinIf'
    },
    link: function (scope, element, attrs) {
      var cssColor = element.css('color'), stoped = false, hideElement = !!scope.config.hideElement, spinner;
      augmentOpts(cssColor, scope.config), spinner = new Spinner(scope.config), spinner.spin(element[0]);
      scope.$watch('config', function (newValue, oldValue) {
        if (newValue == oldValue)
          return;
        spinner.stop();
        hideElement = !!newValue.config.hideElement;
        spinner = new Spinner(newValue);
        if (!stoped)
          spinner.spin(element[0]);
      }, true);
      if (attrs.hasOwnProperty('spinIf')) {
        scope.$watch('spinif', function (newValue) {
          if (newValue) {
            spinner.spin(element[0]);
            if (hideElement) {
              element.css('display', '');
            }
            stoped = false;
          } else {
            spinner.stop();
            if (hideElement) {
              element.css('display', 'none');
            }
            stoped = true;
          }
        });
      }
      scope.$on('$destroy', function () {
        spinner.stop();
      });
    }
  };
});
'use strict';
angular.module('mpk').directive('validKey', [
  '$http',
  'cloudService',
  function ($http, cloudService) {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        function validate() {
          var key = element.val();
          var params = {
              kanbanKey: key,
              action: 'key'
            };
          $http.jsonp(cloudService.cloudAddress + '/service/kanban?callback=JSON_CALLBACK', { params: params }).success(function (data) {
            ctrl.$setValidity('validKey', data.success);
          }).error(function () {
            ctrl.$setValidity('validKeyUnableToVerify', false);
          });
        }
        ;
        scope.$watch(attrs.ngModel, validate);
      }
    };
  }
]);