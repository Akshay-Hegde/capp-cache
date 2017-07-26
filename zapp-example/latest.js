/**
 * Utility functions for web applications.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

/* Utilities API */
var util = forge.util = forge.util || {};

// define setImmediate and nextTick
if(typeof process === 'undefined' || !process.nextTick) {
  if(typeof setImmediate === 'function') {
    util.setImmediate = setImmediate;
    util.nextTick = function(callback) {
      return setImmediate(callback);
    };
  }
  else {
    util.setImmediate = function(callback) {
      setTimeout(callback, 0);
    };
    util.nextTick = util.setImmediate;
  }
}
else {
  util.nextTick = process.nextTick;
  if(typeof setImmediate === 'function') {
    util.setImmediate = setImmediate;
  }
  else {
    util.setImmediate = util.nextTick;
  }
}

// define isArray
util.isArray = Array.isArray || function(x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};

/**
 * Constructor for a byte buffer.
 *
 * @param b the bytes to wrap (as a UTF-8 string) (optional).
 */
util.ByteBuffer = function(b) {
  // the data in this buffer
  this.data = b || '';
  // the pointer for reading from this buffer
  this.read = 0;
};

/**
 * Gets the number of bytes in this buffer.
 *
 * @return the number of bytes in this buffer.
 */
util.ByteBuffer.prototype.length = function() {
  return this.data.length - this.read;
};

/**
 * Gets whether or not this buffer is empty.
 *
 * @return true if this buffer is empty, false if not.
 */
util.ByteBuffer.prototype.isEmpty = function() {
  return (this.data.length - this.read) === 0;
};

/**
 * Puts a byte in this buffer.
 *
 * @param b the byte to put.
 */
util.ByteBuffer.prototype.putByte = function(b) {
  this.data += String.fromCharCode(b);
};

/**
 * Puts a byte in this buffer N times.
 *
 * @param b the byte to put.
 * @param n the number of bytes of value b to put.
 */
util.ByteBuffer.prototype.fillWithByte = function(b, n) {
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
};

/**
 * Puts bytes in this buffer.
 *
 * @param bytes the bytes (as a UTF-8 encoded string) to put.
 */
util.ByteBuffer.prototype.putBytes = function(bytes) {
  this.data += bytes;
};

/**
 * Puts a UTF-16 encoded string into this buffer.
 *
 * @param str the string to put.
 */
util.ByteBuffer.prototype.putString = function(str) {
  this.data += util.encodeUtf8(str);
};

/**
 * Puts a 16-bit integer in this buffer in big-endian order.
 *
 * @param i the 16-bit integer.
 */
util.ByteBuffer.prototype.putInt16 = function(i) {
  this.data +=
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
};

/**
 * Puts a 24-bit integer in this buffer in big-endian order.
 *
 * @param i the 24-bit integer.
 */
util.ByteBuffer.prototype.putInt24 = function(i) {
  this.data +=
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
};

/**
 * Puts a 32-bit integer in this buffer in big-endian order.
 *
 * @param i the 32-bit integer.
 */
util.ByteBuffer.prototype.putInt32 = function(i) {
  this.data +=
    String.fromCharCode(i >> 24 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
};

/**
 * Puts a 16-bit integer in this buffer in little-endian order.
 *
 * @param i the 16-bit integer.
 */
util.ByteBuffer.prototype.putInt16Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF);
};

/**
 * Puts a 24-bit integer in this buffer in little-endian order.
 *
 * @param i the 24-bit integer.
 */
util.ByteBuffer.prototype.putInt24Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF);
};

/**
 * Puts a 32-bit integer in this buffer in little-endian order.
 *
 * @param i the 32-bit integer.
 */
util.ByteBuffer.prototype.putInt32Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 24 & 0xFF);
};

/**
 * Puts an n-bit integer in this buffer in big-endian order.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer.
 */
util.ByteBuffer.prototype.putInt = function(i, n) {
  do {
    n -= 8;
    this.data += String.fromCharCode((i >> n) & 0xFF);
  }
  while(n > 0);
};

/**
 * Puts the given buffer into this buffer.
 *
 * @param buffer the buffer to put into this one.
 */
util.ByteBuffer.prototype.putBuffer = function(buffer) {
  this.data += buffer.getBytes();
};

/**
 * Gets a byte from this buffer and advances the read pointer by 1.
 *
 * @return the byte.
 */
util.ByteBuffer.prototype.getByte = function() {
  return this.data.charCodeAt(this.read++);
};

/**
 * Gets a uint16 from this buffer in big-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.ByteBuffer.prototype.getInt16 = function() {
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
util.ByteBuffer.prototype.getInt24 = function() {
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
util.ByteBuffer.prototype.getInt32 = function() {
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
util.ByteBuffer.prototype.getInt16Le = function() {
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
util.ByteBuffer.prototype.getInt24Le = function() {
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
util.ByteBuffer.prototype.getInt32Le = function() {
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
 * read pointer by n/8.
 *
 * @param n the number of bits in the integer.
 *
 * @return the integer.
 */
util.ByteBuffer.prototype.getInt = function(n) {
  var rval = 0;
  do {
    rval = (rval << 8) + this.data.charCodeAt(this.read++);
    n -= 8;
  }
  while(n > 0);
  return rval;
};

/**
 * Reads bytes out into a UTF-8 string and clears them from the buffer.
 *
 * @param count the number of bytes to read, undefined or null for all.
 *
 * @return a UTF-8 string of bytes.
 */
util.ByteBuffer.prototype.getBytes = function(count) {
  var rval;
  if(count) {
    // read count bytes
    count = Math.min(this.length(), count);
    rval = this.data.slice(this.read, this.read + count);
    this.read += count;
  }
  else if(count === 0) {
    rval = '';
  }
  else {
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
util.ByteBuffer.prototype.bytes = function(count) {
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
util.ByteBuffer.prototype.at = function(i) {
  return this.data.charCodeAt(this.read + i);
};

/**
 * Puts a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 * @param b the byte to put.
 */
util.ByteBuffer.prototype.setAt = function(i, b) {
  this.data = this.data.substr(0, this.read + i) +
    String.fromCharCode(b) +
    this.data.substr(this.read + i + 1);
};

/**
 * Gets the last byte without modifying the read pointer.
 *
 * @return the last byte.
 */
util.ByteBuffer.prototype.last = function() {
  return this.data.charCodeAt(this.data.length - 1);
};

/**
 * Creates a copy of this buffer.
 *
 * @return the copy.
 */
util.ByteBuffer.prototype.copy = function() {
  var c = util.createBuffer(this.data);
  c.read = this.read;
  return c;
};

/**
 * Compacts this buffer.
 */
util.ByteBuffer.prototype.compact = function() {
  if(this.read > 0) {
    this.data = this.data.slice(this.read);
    this.read = 0;
  }
};

/**
 * Clears this buffer.
 */
util.ByteBuffer.prototype.clear = function() {
  this.data = '';
  this.read = 0;
};

/**
 * Shortens this buffer by triming bytes off of the end of this buffer.
 *
 * @param count the number of bytes to trim off.
 */
util.ByteBuffer.prototype.truncate = function(count) {
  var len = Math.max(0, this.length() - count);
  this.data = this.data.substr(this.read, len);
  this.read = 0;
};

/**
 * Converts this buffer to a hexadecimal string.
 *
 * @return a hexadecimal string.
 */
util.ByteBuffer.prototype.toHex = function() {
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
util.ByteBuffer.prototype.toString = function() {
  return util.decodeUtf8(this.bytes());
};

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
 * Converts a hex string into a UTF-8 string of bytes.
 *
 * @param hex the hexadecimal string to convert.
 *
 * @return the string of bytes.
 */
util.hexToBytes = function(hex) {
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
 * Converts a UTF-8 byte string into a string of hexadecimal characters.
 *
 * @param bytes the byte string to convert.
 *
 * @return the string of hexadecimal characters.
 */
util.bytesToHex = function(bytes) {
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
 * Base64 encodes a UTF-8 string of bytes.
 *
 * @param input the UTF-8 string of bytes to encode.
 * @param maxline the maximum number of encoded bytes per line to use,
 *          defaults to none.
 *
 * @return the base64-encoded output.
 */
util.encode64 = function(input, maxline) {
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
    }
    else {
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
 * Base64 decodes a string into a UTF-8 string of bytes.
 *
 * @param input the base64-encoded input.
 *
 * @return the raw bytes.
 */
util.decode64 = function(input) {
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
 * @param str the string to encode.
 *
 * @return the UTF-16 encoded string (standard JavaScript string).
 */
util.decodeUtf8 = function(str) {
  return decodeURIComponent(escape(str));
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
    throw {
      message: 'WebStorage not available.'
    };
  }

  var rval;
  if(obj === null) {
    rval = api.removeItem(id);
  }
  else {
    // json-encode and base64-encode object
    obj = util.encode64(JSON.stringify(obj));
    rval = api.setItem(id, obj);
  }

  // handle potential flash error
  if(typeof(rval) !== 'undefined' && rval.rval !== true) {
    throw rval.error;
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
    throw {
      message: 'WebStorage not available.'
    };
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
        throw rval.error;
      }
      // no error, but also no item
      rval = null;
    }
    else {
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
          throw {
            message: 'Flash local storage not available.'
          };
        }
        else {
          rval = func.apply(this, args);
          done = (type === 'flash');
        }
      }
      if(type === 'web' || type === 'both') {
        args[0] = localStorage;
        rval = func.apply(this, args);
        done = true;
      }
    }
    catch(ex) {
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
      }
      else if(url.port !== 443 && url.scheme === 'https') {
        url.fullHost += ':' + url.port;
      }
    }
    else if(url.scheme === 'http') {
      url.port = 80;
    }
    else if(url.scheme === 'https') {
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
        key = kvpairs[i].substring(0,pos);
        val = kvpairs[i].substring(pos+1);
      }
      else {
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
       if(typeof(window) === 'undefined') {
          // no query variables available
          _queryVariables = {};
       }
       else {
          // parse window search query
          _queryVariables = parse(window.location.search.substring(1));
       }
     }
     rval = _queryVariables;
   }
   else {
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
    fp = fragment.substring(0,pos);
    fq = fragment.substring(pos+1);
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
      }
      else {
        rval = frag.query[k];
        if(rval && typeof(i) !== 'undefined')
        {
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
      }
      else {
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
      }
      else {
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
      }
      else {
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
      }
      else {
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
  }
  else if(size >= 1048576) {
    size = util.formatNumber(size / 1048576, 2, '.', '') + ' MiB';
  }
  else if(size >= 1024) {
    size = util.formatNumber(size / 1024, 0) + ' KiB';
  }
  else {
    size = util.formatNumber(size, 0) + ' bytes';
  }
  return size;
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'util';
var deps = [];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Message Digest Algorithm 5 with 128-bit digest (MD5) implementation.
 *
 * This implementation is currently limited to message lengths (in bytes) that
 * are up to 32-bits in size.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

var md5 = forge.md5 = forge.md5 || {};
forge.md = forge.md || {};
forge.md.algorithms = forge.md.algorithms || {};
forge.md.md5 = forge.md.algorithms['md5'] = md5;

// padding, constant tables for calculating md5
var _padding = null;
var _g = null;
var _r = null;
var _k = null;
var _initialized = false;

/**
 * Initializes the constant tables.
 */
var _init = function() {
  // create padding
  _padding = String.fromCharCode(128);
  _padding += forge.util.fillString(String.fromCharCode(0x00), 64);

  // g values
  _g = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12,
    5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2,
    0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9];

  // rounds table
  _r = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21];

  // get the result of abs(sin(i + 1)) as a 32-bit integer
  _k = new Array(64);
  for(var i = 0; i < 64; ++i) {
    _k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
  }

  // now initialized
  _initialized = true;
};

/**
 * Updates an MD5 state with the given byte buffer.
 *
 * @param s the MD5 state to update.
 * @param w the array to use to store words.
 * @param bytes the byte buffer to update with.
 */
var _update = function(s, w, bytes) {
  // consume 512 bit (64 byte) chunks
  var t, a, b, c, d, f, r, i;
  var len = bytes.length();
  while(len >= 64) {
    // initialize hash value for this chunk
    a = s.h0;
    b = s.h1;
    c = s.h2;
    d = s.h3;

    // round 1
    for(i = 0; i < 16; ++i) {
      w[i] = bytes.getInt32Le();
      f = d ^ (b & (c ^ d));
      t = (a + f + _k[i] + w[i]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }
    // round 2
    for(; i < 32; ++i) {
      f = c ^ (d & (b ^ c));
      t = (a + f + _k[i] + w[_g[i]]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }
    // round 3
    for(; i < 48; ++i) {
      f = b ^ c ^ d;
      t = (a + f + _k[i] + w[_g[i]]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }
    // round 4
    for(; i < 64; ++i) {
      f = c ^ (b | ~d);
      t = (a + f + _k[i] + w[_g[i]]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }

    // update hash state
    s.h0 = (s.h0 + a) & 0xFFFFFFFF;
    s.h1 = (s.h1 + b) & 0xFFFFFFFF;
    s.h2 = (s.h2 + c) & 0xFFFFFFFF;
    s.h3 = (s.h3 + d) & 0xFFFFFFFF;

    len -= 64;
  }
};

/**
 * Creates an MD5 message digest object.
 *
 * @return a message digest object.
 */
md5.create = function() {
  // do initialization as necessary
  if(!_initialized) {
    _init();
  }

  // MD5 state contains four 32-bit integers
  var _state = null;

  // input buffer
  var _input = forge.util.createBuffer();

  // used for word storage
  var _w = new Array(16);

  // message digest object
  var md = {
    algorithm: 'md5',
    blockLength: 64,
    digestLength: 16,
    // length of message so far (does not including padding)
    messageLength: 0
  };

  /**
   * Starts the digest.
   *
   * @return this digest object.
   */
  md.start = function() {
    md.messageLength = 0;
    _input = forge.util.createBuffer();
    _state = {
      h0: 0x67452301,
      h1: 0xEFCDAB89,
      h2: 0x98BADCFE,
      h3: 0x10325476
    };
    return md;
  };
  // start digest automatically for first time
  md.start();

  /**
   * Updates the digest with the given message input. The given input can
   * treated as raw input (no encoding will be applied) or an encoding of
   * 'utf8' maybe given to encode the input using UTF-8.
   *
   * @param msg the message input to update with.
   * @param encoding the encoding to use (default: 'raw', other: 'utf8').
   *
   * @return this digest object.
   */
  md.update = function(msg, encoding) {
    if(encoding === 'utf8') {
      msg = forge.util.encodeUtf8(msg);
    }

    // update message length
    md.messageLength += msg.length;

    // add bytes to input buffer
    _input.putBytes(msg);

    // process bytes
    _update(_state, _w, _input);

    // compact input buffer every 2K or if empty
    if(_input.read > 2048 || _input.length() === 0) {
      _input.compact();
    }

    return md;
  };

  /**
   * Produces the digest.
   *
   * @return a byte buffer containing the digest value.
   */
  md.digest = function() {
    /* Note: Here we copy the remaining bytes in the input buffer and
      add the appropriate MD5 padding. Then we do the final update
      on a copy of the state so that if the user wants to get
      intermediate digests they can do so. */

    /* Determine the number of bytes that must be added to the message
      to ensure its length is congruent to 448 mod 512. In other words,
      a 64-bit integer that gives the length of the message will be
      appended to the message and whatever the length of the message is
      plus 64 bits must be a multiple of 512. So the length of the
      message must be congruent to 448 mod 512 because 512 - 64 = 448.

      In order to fill up the message length it must be filled with
      padding that begins with 1 bit followed by all 0 bits. Padding
      must *always* be present, so if the message length is already
      congruent to 448 mod 512, then 512 padding bits must be added. */

    // 512 bits == 64 bytes, 448 bits == 56 bytes, 64 bits = 8 bytes
    // _padding starts with 1 byte with first bit is set in it which
    // is byte value 128, then there may be up to 63 other pad bytes
    var len = md.messageLength;
    var padBytes = forge.util.createBuffer();
    padBytes.putBytes(_input.bytes());
    padBytes.putBytes(_padding.substr(0, 64 - ((len + 8) % 64)));

    /* Now append length of the message. The length is appended in bits
      as a 64-bit number in little-endian format. Since we store the
      length in bytes, we must multiply it by 8 (or left shift by 3). So
      here store the high 3 bits in the high end of the second 32-bits of
      the 64-bit number and the lower 5 bits in the low end of the
      second 32-bits. */
    padBytes.putInt32Le((len << 3) & 0xFFFFFFFF);
    padBytes.putInt32Le((len >>> 29) & 0xFF);
    var s2 = {
      h0: _state.h0,
      h1: _state.h1,
      h2: _state.h2,
      h3: _state.h3
    };
    _update(s2, _w, padBytes);
    var rval = forge.util.createBuffer();
    rval.putInt32Le(s2.h0);
    rval.putInt32Le(s2.h1);
    rval.putInt32Le(s2.h2);
    rval.putInt32Le(s2.h3);
    return rval;
  };

  return md;
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'md5';
var deps = ['./util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Secure Hash Algorithm with 160-bit digest (SHA-1) implementation.
 *
 * This implementation is currently limited to message lengths (in bytes) that
 * are up to 32-bits in size.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

var sha1 = forge.sha1 = forge.sha1 || {};
forge.md = forge.md || {};
forge.md.algorithms = forge.md.algorithms || {};
forge.md.sha1 = forge.md.algorithms['sha1'] = sha1;

// sha-1 padding bytes not initialized yet
var _padding = null;
var _initialized = false;

/**
 * Initializes the constant tables.
 */
var _init = function() {
  // create padding
  _padding = String.fromCharCode(128);
  _padding += forge.util.fillString(String.fromCharCode(0x00), 64);

  // now initialized
  _initialized = true;
};

/**
 * Updates a SHA-1 state with the given byte buffer.
 *
 * @param s the SHA-1 state to update.
 * @param w the array to use to store words.
 * @param bytes the byte buffer to update with.
 */
var _update = function(s, w, bytes) {
  // consume 512 bit (64 byte) chunks
  var t, a, b, c, d, e, f, i;
  var len = bytes.length();
  while(len >= 64) {
    // the w array will be populated with sixteen 32-bit big-endian words
    // and then extended into 80 32-bit words according to SHA-1 algorithm
    // and for 32-79 using Max Locktyukhin's optimization

    // initialize hash value for this chunk
    a = s.h0;
    b = s.h1;
    c = s.h2;
    d = s.h3;
    e = s.h4;

    // round 1
    for(i = 0; i < 16; ++i) {
      t = bytes.getInt32();
      w[i] = t;
      f = d ^ (b & (c ^ d));
      t = ((a << 5) | (a >>> 27)) + f + e + 0x5A827999 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    for(; i < 20; ++i) {
      t = (w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]);
      t = (t << 1) | (t >>> 31);
      w[i] = t;
      f = d ^ (b & (c ^ d));
      t = ((a << 5) | (a >>> 27)) + f + e + 0x5A827999 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    // round 2
    for(; i < 32; ++i) {
      t = (w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]);
      t = (t << 1) | (t >>> 31);
      w[i] = t;
      f = b ^ c ^ d;
      t = ((a << 5) | (a >>> 27)) + f + e + 0x6ED9EBA1 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    for(; i < 40; ++i) {
      t = (w[i - 6] ^ w[i - 16] ^ w[i - 28] ^ w[i - 32]);
      t = (t << 2) | (t >>> 30);
      w[i] = t;
      f = b ^ c ^ d;
      t = ((a << 5) | (a >>> 27)) + f + e + 0x6ED9EBA1 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    // round 3
    for(; i < 60; ++i) {
      t = (w[i - 6] ^ w[i - 16] ^ w[i - 28] ^ w[i - 32]);
      t = (t << 2) | (t >>> 30);
      w[i] = t;
      f = (b & c) | (d & (b ^ c));
      t = ((a << 5) | (a >>> 27)) + f + e + 0x8F1BBCDC + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }
    // round 4
    for(; i < 80; ++i) {
      t = (w[i - 6] ^ w[i - 16] ^ w[i - 28] ^ w[i - 32]);
      t = (t << 2) | (t >>> 30);
      w[i] = t;
      f = b ^ c ^ d;
      t = ((a << 5) | (a >>> 27)) + f + e + 0xCA62C1D6 + t;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = t;
    }

    // update hash state
    s.h0 += a;
    s.h1 += b;
    s.h2 += c;
    s.h3 += d;
    s.h4 += e;

    len -= 64;
  }
};

/**
 * Creates a SHA-1 message digest object.
 *
 * @return a message digest object.
 */
sha1.create = function() {
  // do initialization as necessary
  if(!_initialized) {
    _init();
  }

  // SHA-1 state contains five 32-bit integers
  var _state = null;

  // input buffer
  var _input = forge.util.createBuffer();

  // used for word storage
  var _w = new Array(80);

  // message digest object
  var md = {
    algorithm: 'sha1',
    blockLength: 64,
    digestLength: 20,
    // length of message so far (does not including padding)
    messageLength: 0
  };

  /**
   * Starts the digest.
   *
   * @return this digest object.
   */
  md.start = function() {
    md.messageLength = 0;
    _input = forge.util.createBuffer();
    _state = {
      h0: 0x67452301,
      h1: 0xEFCDAB89,
      h2: 0x98BADCFE,
      h3: 0x10325476,
      h4: 0xC3D2E1F0
    };
    return md;
  };
  // start digest automatically for first time
  md.start();

  /**
   * Updates the digest with the given message input. The given input can
   * treated as raw input (no encoding will be applied) or an encoding of
   * 'utf8' maybe given to encode the input using UTF-8.
   *
   * @param msg the message input to update with.
   * @param encoding the encoding to use (default: 'raw', other: 'utf8').
   *
   * @return this digest object.
   */
  md.update = function(msg, encoding) {
    if(encoding === 'utf8') {
      msg = forge.util.encodeUtf8(msg);
    }

    // update message length
    md.messageLength += msg.length;

    // add bytes to input buffer
    _input.putBytes(msg);

    // process bytes
    _update(_state, _w, _input);

    // compact input buffer every 2K or if empty
    if(_input.read > 2048 || _input.length() === 0) {
      _input.compact();
    }

    return md;
  };

   /**
    * Produces the digest.
    *
    * @return a byte buffer containing the digest value.
    */
   md.digest = function() {
    /* Note: Here we copy the remaining bytes in the input buffer and
      add the appropriate SHA-1 padding. Then we do the final update
      on a copy of the state so that if the user wants to get
      intermediate digests they can do so. */

    /* Determine the number of bytes that must be added to the message
      to ensure its length is congruent to 448 mod 512. In other words,
      a 64-bit integer that gives the length of the message will be
      appended to the message and whatever the length of the message is
      plus 64 bits must be a multiple of 512. So the length of the
      message must be congruent to 448 mod 512 because 512 - 64 = 448.

      In order to fill up the message length it must be filled with
      padding that begins with 1 bit followed by all 0 bits. Padding
      must *always* be present, so if the message length is already
      congruent to 448 mod 512, then 512 padding bits must be added. */

    // 512 bits == 64 bytes, 448 bits == 56 bytes, 64 bits = 8 bytes
    // _padding starts with 1 byte with first bit is set in it which
    // is byte value 128, then there may be up to 63 other pad bytes
    var len = md.messageLength;
    var padBytes = forge.util.createBuffer();
    padBytes.putBytes(_input.bytes());
    padBytes.putBytes(_padding.substr(0, 64 - ((len + 8) % 64)));

    /* Now append length of the message. The length is appended in bits
      as a 64-bit number in big-endian order. Since we store the length
      in bytes, we must multiply it by 8 (or left shift by 3). So here
      store the high 3 bits in the low end of the first 32-bits of the
      64-bit number and the lower 5 bits in the high end of the second
      32-bits. */
    padBytes.putInt32((len >>> 29) & 0xFF);
    padBytes.putInt32((len << 3) & 0xFFFFFFFF);
    var s2 = {
      h0: _state.h0,
      h1: _state.h1,
      h2: _state.h2,
      h3: _state.h3,
      h4: _state.h4
    };
    _update(s2, _w, padBytes);
    var rval = forge.util.createBuffer();
    rval.putInt32(s2.h0);
    rval.putInt32(s2.h1);
    rval.putInt32(s2.h2);
    rval.putInt32(s2.h3);
    rval.putInt32(s2.h4);
    return rval;
  };

  return md;
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'sha1';
var deps = ['./util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Secure Hash Algorithm with 256-bit digest (SHA-256) implementation.
 *
 * See FIPS 180-2 for details.
 *
 * This implementation is currently limited to message lengths (in bytes) that
 * are up to 32-bits in size.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2012 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

var sha256 = forge.sha256 = forge.sha256 || {};
forge.md = forge.md || {};
forge.md.algorithms = forge.md.algorithms || {};
forge.md.sha256 = forge.md.algorithms['sha256'] = sha256;

// sha-256 padding bytes not initialized yet
var _padding = null;
var _initialized = false;

// table of constants
var _k = null;

/**
 * Initializes the constant tables.
 */
var _init = function() {
  // create padding
  _padding = String.fromCharCode(128);
  _padding += forge.util.fillString(String.fromCharCode(0x00), 64);

  // create K table for SHA-256
  _k = [
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
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  // now initialized
  _initialized = true;
};

/**
 * Updates a SHA-256 state with the given byte buffer.
 *
 * @param s the SHA-256 state to update.
 * @param w the array to use to store words.
 * @param bytes the byte buffer to update with.
 */
var _update = function(s, w, bytes) {
  // consume 512 bit (64 byte) chunks
  var t1, t2, s0, s1, ch, maj, i, a, b, c, d, e, f, g, h;
  var len = bytes.length();
  while(len >= 64) {
    // the w array will be populated with sixteen 32-bit big-endian words
    // and then extended into 64 32-bit words according to SHA-256
    for(i = 0; i < 16; ++i) {
      w[i] = bytes.getInt32();
    }
    for(; i < 64; ++i) {
      // XOR word 2 words ago rot right 17, rot right 19, shft right 10
      t1 = w[i - 2];
      t1 =
        ((t1 >>> 17) | (t1 << 15)) ^
        ((t1 >>> 19) | (t1 << 13)) ^
        (t1 >>> 10);
      // XOR word 15 words ago rot right 7, rot right 18, shft right 3
      t2 = w[i - 15];
      t2 =
        ((t2 >>> 7) | (t2 << 25)) ^
        ((t2 >>> 18) | (t2 << 14)) ^
        (t2 >>> 3);
      // sum(t1, word 7 ago, t2, word 16 ago) modulo 2^32
      w[i] = (t1 + w[i - 7] + t2 + w[i - 16]) & 0xFFFFFFFF;
    }

    // initialize hash value for this chunk
    a = s.h0;
    b = s.h1;
    c = s.h2;
    d = s.h3;
    e = s.h4;
    f = s.h5;
    g = s.h6;
    h = s.h7;

    // round function
    for(i = 0; i < 64; ++i) {
      // Sum1(e)
      s1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      // Ch(e, f, g) (optimized the same way as SHA-1)
      ch = g ^ (e & (f ^ g));
      // Sum0(a)
      s0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      // Maj(a, b, c) (optimized the same way as SHA-1)
      maj = (a & b) | (c & (a ^ b));

      // main algorithm
      t1 = h + s1 + ch + _k[i] + w[i];
      t2 = s0 + maj;
      h = g;
      g = f;
      f = e;
      e = (d + t1) & 0xFFFFFFFF;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) & 0xFFFFFFFF;
    }

    // update hash state
    s.h0 = (s.h0 + a) & 0xFFFFFFFF;
    s.h1 = (s.h1 + b) & 0xFFFFFFFF;
    s.h2 = (s.h2 + c) & 0xFFFFFFFF;
    s.h3 = (s.h3 + d) & 0xFFFFFFFF;
    s.h4 = (s.h4 + e) & 0xFFFFFFFF;
    s.h5 = (s.h5 + f) & 0xFFFFFFFF;
    s.h6 = (s.h6 + g) & 0xFFFFFFFF;
    s.h7 = (s.h7 + h) & 0xFFFFFFFF;
    len -= 64;
  }
};

/**
 * Creates a SHA-256 message digest object.
 *
 * @return a message digest object.
 */
sha256.create = function() {
  // do initialization as necessary
  if(!_initialized) {
    _init();
  }

  // SHA-256 state contains eight 32-bit integers
  var _state = null;

  // input buffer
  var _input = forge.util.createBuffer();

  // used for word storage
  var _w = new Array(64);

  // message digest object
  var md = {
    algorithm: 'sha256',
    blockLength: 64,
    digestLength: 32,
    // length of message so far (does not including padding)
    messageLength: 0
  };

  /**
   * Starts the digest.
   *
   * @return this digest object.
   */
  md.start = function() {
    md.messageLength = 0;
    _input = forge.util.createBuffer();
    _state = {
      h0: 0x6A09E667,
      h1: 0xBB67AE85,
      h2: 0x3C6EF372,
      h3: 0xA54FF53A,
      h4: 0x510E527F,
      h5: 0x9B05688C,
      h6: 0x1F83D9AB,
      h7: 0x5BE0CD19
    };
    return md;
  };
  // start digest automatically for first time
  md.start();

  /**
   * Updates the digest with the given message input. The given input can
   * treated as raw input (no encoding will be applied) or an encoding of
   * 'utf8' maybe given to encode the input using UTF-8.
   *
   * @param msg the message input to update with.
   * @param encoding the encoding to use (default: 'raw', other: 'utf8').
   *
   * @return this digest object.
   */
  md.update = function(msg, encoding) {
    if(encoding === 'utf8') {
      msg = forge.util.encodeUtf8(msg);
    }

    // update message length
    md.messageLength += msg.length;

    // add bytes to input buffer
    _input.putBytes(msg);

    // process bytes
    _update(_state, _w, _input);

    // compact input buffer every 2K or if empty
    if(_input.read > 2048 || _input.length() === 0) {
      _input.compact();
    }

    return md;
  };

  /**
   * Produces the digest.
   *
   * @return a byte buffer containing the digest value.
   */
  md.digest = function() {
    /* Note: Here we copy the remaining bytes in the input buffer and
      add the appropriate SHA-256 padding. Then we do the final update
      on a copy of the state so that if the user wants to get
      intermediate digests they can do so. */

    /* Determine the number of bytes that must be added to the message
      to ensure its length is congruent to 448 mod 512. In other words,
      a 64-bit integer that gives the length of the message will be
      appended to the message and whatever the length of the message is
      plus 64 bits must be a multiple of 512. So the length of the
      message must be congruent to 448 mod 512 because 512 - 64 = 448.

      In order to fill up the message length it must be filled with
      padding that begins with 1 bit followed by all 0 bits. Padding
      must *always* be present, so if the message length is already
      congruent to 448 mod 512, then 512 padding bits must be added. */

    // 512 bits == 64 bytes, 448 bits == 56 bytes, 64 bits = 8 bytes
    // _padding starts with 1 byte with first bit is set in it which
    // is byte value 128, then there may be up to 63 other pad bytes
    var len = md.messageLength;
    var padBytes = forge.util.createBuffer();
    padBytes.putBytes(_input.bytes());
    padBytes.putBytes(_padding.substr(0, 64 - ((len + 8) % 64)));

    /* Now append length of the message. The length is appended in bits
      as a 64-bit number in big-endian order. Since we store the length
      in bytes, we must multiply it by 8 (or left shift by 3). So here
      store the high 3 bits in the low end of the first 32-bits of the
      64-bit number and the lower 5 bits in the high end of the second
      32-bits. */
    padBytes.putInt32((len >>> 29) & 0xFF);
    padBytes.putInt32((len << 3) & 0xFFFFFFFF);
    var s2 = {
      h0: _state.h0,
      h1: _state.h1,
      h2: _state.h2,
      h3: _state.h3,
      h4: _state.h4,
      h5: _state.h5,
      h6: _state.h6,
      h7: _state.h7
    };
    _update(s2, _w, padBytes);
    var rval = forge.util.createBuffer();
    rval.putInt32(s2.h0);
    rval.putInt32(s2.h1);
    rval.putInt32(s2.h2);
    rval.putInt32(s2.h3);
    rval.putInt32(s2.h4);
    rval.putInt32(s2.h5);
    rval.putInt32(s2.h6);
    rval.putInt32(s2.h7);
    return rval;
  };

  return md;
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'sha256';
var deps = ['./util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Advanced Encryption Standard (AES) Cipher-Block Chaining implementation.
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
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

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
var initialize = function() {
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
    }
    else {
      // e = 2e + 2*2*2*(10e)) = multiply e by 82 (chosen generator)
      // ei = ei + 2*2*ei = multiply ei by 5 (inverse generator)
      e = e2 ^ xtime[xtime[xtime[e2 ^ e8]]];
      ei ^= xtime[xtime[ei]];
    }
  }
};

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
var expandKey = function(key, decrypt) {
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
    }
    else if(Nk > 6 && (i % Nk === 4)) {
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
    var end = w.length;
    for(var i = 0, wi = end - Nb; i < end; i += Nb, wi -= Nb) {
      // do not sub the first or last round key (round keys are Nb
      // words) as no column mixing is performed before they are added,
      // but do change the key order
      if(i === 0 || i === (end - Nb)) {
        wnew[i] = w[wi];
        wnew[i + 1] = w[wi + 3];
        wnew[i + 2] = w[wi + 2];
        wnew[i + 3] = w[wi + 1];
      }
      else {
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
};

/**
 * Updates a single block (16 bytes) using AES. The update will either
 * encrypt or decrypt the block.
 *
 * @param w the key schedule.
 * @param input the input block (an array of 32-bit words).
 * @param output the updated output block.
 * @param decrypt true to decrypt the block, false to encrypt it.
 */
var _updateBlock = function(w, input, output, decrypt) {
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
  }
  else {
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
};

/**
 * Creates an AES cipher object. CBC (cipher-block-chaining) mode will be
 * used.
 *
 * The key and iv may be given as a string of bytes, an array of bytes, a
 * byte buffer, or an array of 32-bit words. If an iv is provided, then
 * encryption/decryption will be started, otherwise start() must be called
 * with an iv.
 *
 * @param key the symmetric key to use.
 * @param iv the initialization vector to start with, null not to start.
 * @param output the buffer to write to.
 * @param decrypt true for decryption, false for encryption.
 *
 * @return the cipher.
 */
var _createCipher = function(key, iv, output, decrypt) {
  var cipher = null;

  if(!init) {
    initialize();
  }

  /* Note: The key may be a string of bytes, an array of bytes, a byte
    buffer, or an array of 32-bit integers. If the key is in bytes, then
    it must be 16, 24, or 32 bytes in length. If it is in 32-bit
    integers, it must be 4, 6, or 8 integers long. */

  // convert key string into byte buffer
  if(typeof key === 'string' &&
    (key.length === 16 || key.length === 24 || key.length === 32)) {
    key = forge.util.createBuffer(key);
  }
  // convert key integer array into byte buffer
  else if(forge.util.isArray(key) &&
    (key.length === 16 || key.length === 24 || key.length === 32)) {
    var tmp = key;
    var key = forge.util.createBuffer();
    for(var i = 0; i < tmp.length; ++i) {
      key.putByte(tmp[i]);
    }
  }

  // convert key byte buffer into 32-bit integer array
  if(!forge.util.isArray(key)) {
    var tmp = key;
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
  if(forge.util.isArray(key) &&
    (key.length === 4 || key.length === 6 || key.length === 8)) {
    // private vars for state
    var _w = expandKey(key, decrypt);
    var _blockSize = Nb << 2;
    var _input;
    var _output;
    var _inBlock;
    var _outBlock;
    var _prev;
    var _finish;
    cipher = {
      // output from AES (either encrypted or decrypted bytes)
      output: null
    };

    /**
     * Updates the next block using CBC mode.
     *
     * @param input the buffer to read from.
     */
    cipher.update = function(input) {
      if(!_finish) {
        // not finishing, so fill the input buffer with more input
        _input.putBuffer(input);
      }

      /* In encrypt mode, the threshold for updating a block is the
        block size. As soon as enough input is available to update
        a block, encryption may occur. In decrypt mode, we wait for
        2 blocks to be available or for the finish flag to be set
        with only 1 block available. This is done so that the output
        buffer will not be populated with padding bytes at the end
        of the decryption -- they can be truncated before returning
        from finish(). */
      var threshold = decrypt && !_finish ? _blockSize << 1 : _blockSize;
      while(_input.length() >= threshold) {
        // get next block
        if(decrypt) {
          for(var i = 0; i < Nb; ++i) {
            _inBlock[i] = _input.getInt32();
          }
        }
        else {
          // CBC mode XOR's IV (or previous block) with plaintext
          for(var i = 0; i < Nb; ++i) {
            _inBlock[i] = _prev[i] ^ _input.getInt32();
          }
        }

        // update block
        _updateBlock(_w, _inBlock, _outBlock, decrypt);

        // write output, save previous ciphered block
        if(decrypt) {
          // CBC mode XOR's IV (or previous block) with plaintext
          for(var i = 0; i < Nb; ++i) {
            _output.putInt32(_prev[i] ^ _outBlock[i]);
          }
          _prev = _inBlock.slice(0);
        }
        else {
          for(var i = 0; i < Nb; ++i) {
            _output.putInt32(_outBlock[i]);
          }
          _prev = _outBlock;
        }
      }
    };

    /**
     * Finishes encrypting or decrypting.
     *
     * @param pad a padding function to use, null for default,
     *          signature(blockSize, buffer, decrypt).
     *
     * @return true if successful, false on error.
     */
    cipher.finish = function(pad) {
      var rval = true;

      if(!decrypt) {
        if(pad) {
          rval = pad(_blockSize, _input, decrypt);
        }
        else {
          // add PKCS#7 padding to block (each pad byte is the
          // value of the number of pad bytes)
          var padding = (_input.length() === _blockSize) ?
            _blockSize : (_blockSize - _input.length());
          _input.fillWithByte(padding, padding);
        }
      }

      if(rval) {
        // do final update
        _finish = true;
        cipher.update();
      }

      if(decrypt) {
        // check for error: input data not a multiple of blockSize
        rval = (_input.length() === 0);
        if(rval) {
          if(pad) {
            rval = pad(_blockSize, _output, decrypt);
          }
          else {
            // ensure padding byte count is valid
            var len = _output.length();
            var count = _output.at(len - 1);
            if(count > (Nb << 2)) {
              rval = false;
            }
            else {
              // trim off padding bytes
              _output.truncate(count);
            }
          }
        }
      }

      return rval;
    };

    /**
     * Starts or restarts the encryption or decryption process, whichever
     * was previously configured.
     *
     * The iv may be given as a string of bytes, an array of bytes, a
     * byte buffer, or an array of 32-bit words.
     *
     * @param iv the initialization vector to use, null to reuse the
     *          last ciphered block from a previous update().
     * @param output the output the buffer to write to, null to create one.
     */
    cipher.start = function(iv, output) {
      // if IV is null, reuse block from previous encryption/decryption
      iv = iv || _prev.slice(0);

      /* Note: The IV may be a string of bytes, an array of bytes, a
        byte buffer, or an array of 32-bit integers. If the IV is in
        bytes, then it must be Nb (16) bytes in length. If it is in
        32-bit integers, then it must be 4 integers long. */

      // convert iv string into byte buffer
      if(typeof iv === 'string' && iv.length === 16) {
        iv = forge.util.createBuffer(iv);
      }
      // convert iv byte array into byte buffer
      else if(forge.util.isArray(iv) && iv.length === 16) {
        var tmp = iv;
        var iv = forge.util.createBuffer();
        for(var i = 0; i < 16; ++i) {
          iv.putByte(tmp[i]);
        }
      }

      // convert iv byte buffer into 32-bit integer array
      if(!forge.util.isArray(iv)) {
        var tmp = iv;
        iv = new Array(4);
        iv[0] = tmp.getInt32();
        iv[1] = tmp.getInt32();
        iv[2] = tmp.getInt32();
        iv[3] = tmp.getInt32();
      }

      // set private vars
      _input = forge.util.createBuffer();
      _output = output || forge.util.createBuffer();
      _prev = iv.slice(0);
      _inBlock = new Array(Nb);
      _outBlock = new Array(Nb);
      _finish = false;
      cipher.output = _output;
    };
    if(iv !== null) {
      cipher.start(iv, output);
    }
  }
  return cipher;
};

/* AES API */
forge.aes = forge.aes || {};

/**
 * Creates an AES cipher object to encrypt data in CBC mode using the
 * given symmetric key. The output will be stored in the 'output' member
 * of the returned cipher.
 *
 * The key and iv may be given as a string of bytes, an array of bytes,
 * a byte buffer, or an array of 32-bit words.
 *
 * @param key the symmetric key to use.
 * @param iv the initialization vector to use.
 * @param output the buffer to write to, null to create one.
 *
 * @return the cipher.
 */
forge.aes.startEncrypting = function(key, iv, output) {
  return _createCipher(key, iv, output, false);
};

/**
 * Creates an AES cipher object to encrypt data in CBC mode using the
 * given symmetric key.
 *
 * The key may be given as a string of bytes, an array of bytes, a
 * byte buffer, or an array of 32-bit words.
 *
 * To start encrypting call start() on the cipher with an iv and optional
 * output buffer.
 *
 * @param key the symmetric key to use.
 *
 * @return the cipher.
 */
forge.aes.createEncryptionCipher = function(key) {
  return _createCipher(key, null, null, false);
};

/**
 * Creates an AES cipher object to decrypt data in CBC mode using the
 * given symmetric key. The output will be stored in the 'output' member
 * of the returned cipher.
 *
 * The key and iv may be given as a string of bytes, an array of bytes,
 * a byte buffer, or an array of 32-bit words.
 *
 * @param key the symmetric key to use.
 * @param iv the initialization vector to use.
 * @param output the buffer to write to, null to create one.
 *
 * @return the cipher.
 */
forge.aes.startDecrypting = function(key, iv, output) {
  return _createCipher(key, iv, output, true);
};

/**
 * Creates an AES cipher object to decrypt data in CBC mode using the
 * given symmetric key.
 *
 * The key may be given as a string of bytes, an array of bytes, a
 * byte buffer, or an array of 32-bit words.
 *
 * To start decrypting call start() on the cipher with an iv and
 * optional output buffer.
 *
 * @param key the symmetric key to use.
 *
 * @return the cipher.
 */
forge.aes.createDecryptionCipher = function(key) {
  return _createCipher(key, null, null, true);
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
  return expandKey(key, decrypt);
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

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'aes';
var deps = ['./util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * A javascript implementation of a cryptographically-secure
 * Pseudo Random Number Generator (PRNG). The Fortuna algorithm is mostly
 * followed here. SHA-1 is used instead of SHA-256.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

var _nodejs = (
  typeof process !== 'undefined' && process.versions && process.versions.node);
var crypto = null;
if(_nodejs) {
  crypto = require('crypto');
}

/* PRNG API */
var prng = forge.prng = forge.prng || {};

/**
 * Creates a new PRNG context.
 *
 * A PRNG plugin must be passed in that will provide:
 *
 * 1. A function that initializes the key and seed of a PRNG context. It
 *   will be given a 16 byte key and a 16 byte seed. Any key expansion
 *   or transformation of the seed from a byte string into an array of
 *   integers (or similar) should be performed.
 * 2. The cryptographic function used by the generator. It takes a key and
 *   a seed.
 * 3. A seed increment function. It takes the seed and return seed + 1.
 * 4. An api to create a message digest.
 *
 * For an example, see random.js.
 *
 * @param plugin the PRNG plugin to use.
 */
prng.create = function(plugin) {
  var ctx = {
    plugin: plugin,
    key: null,
    seed: null,
    time: null,
    // number of reseeds so far
    reseeds: 0,
    // amount of data generated so far
    generated: 0
  };

  // create 32 entropy pools (each is a message digest)
  var md = plugin.md;
  var pools = new Array(32);
  for(var i = 0; i < 32; ++i) {
    pools[i] = md.create();
  }
  ctx.pools = pools;

  // entropy pools are written to cyclically, starting at index 0
  ctx.pool = 0;

  /**
   * Generates random bytes. The bytes may be generated synchronously or
   * asynchronously. Web workers must use the asynchronous interface or
   * else the behavior is undefined.
   *
   * @param count the number of random bytes to generate.
   * @param [callback(err, bytes)] called once the operation completes.
   *
   * @return count random bytes as a string.
   */
  ctx.generate = function(count, callback) {
    // do synchronously
    if(!callback) {
      return ctx.generateSync(count);
    }

    // simple generator using counter-based CBC
    var cipher = ctx.plugin.cipher;
    var increment = ctx.plugin.increment;
    var formatKey = ctx.plugin.formatKey;
    var formatSeed = ctx.plugin.formatSeed;
    var b = forge.util.createBuffer();

    generate();

    function generate(err) {
      if(err) {
        return callback(err);
      }

      // sufficient bytes generated
      if(b.length() >= count) {
        return callback(null, b.getBytes(count));
      }

      // if amount of data generated is greater than 1 MiB, trigger reseed
      if(ctx.generated >= 1048576) {
        // only do reseed at most every 100 ms
        var now = +new Date();
        if(ctx.time === null || (now - ctx.time > 100)) {
          ctx.key = null;
        }
      }

      if(ctx.key === null) {
        return _reseed(generate);
      }

      // generate the random bytes
      var bytes = cipher(ctx.key, ctx.seed);
      ctx.generated += bytes.length;
      b.putBytes(bytes);

      // generate bytes for a new key and seed
      ctx.key = formatKey(cipher(ctx.key, increment(ctx.seed)));
      ctx.seed = formatSeed(cipher(ctx.key, ctx.seed));

      forge.util.setImmediate(generate);
    }
  };

  /**
   * Generates random bytes synchronously.
   *
   * @param count the number of random bytes to generate.
   *
   * @return count random bytes as a string.
   */
  ctx.generateSync = function(count) {
    // simple generator using counter-based CBC
    var cipher = ctx.plugin.cipher;
    var increment = ctx.plugin.increment;
    var formatKey = ctx.plugin.formatKey;
    var formatSeed = ctx.plugin.formatSeed;
    var b = forge.util.createBuffer();
    while(b.length() < count) {
      // if amount of data generated is greater than 1 MiB, trigger reseed
      if(ctx.generated >= 1048576) {
        // only do reseed at most every 100 ms
        var now = +new Date();
        if(ctx.time === null || (now - ctx.time > 100)) {
          ctx.key = null;
        }
      }

      if(ctx.key === null) {
        _reseedSync();
      }

      // generate the random bytes
      var bytes = cipher(ctx.key, ctx.seed);
      ctx.generated += bytes.length;
      b.putBytes(bytes);

      // generate bytes for a new key and seed
      ctx.key = formatKey(cipher(ctx.key, increment(ctx.seed)));
      ctx.seed = formatSeed(cipher(ctx.key, ctx.seed));
    }

    return b.getBytes(count);
  };

  /**
   * Private function that asynchronously reseeds a generator.
   *
   * @param callback(err) called once the operation completes.
   */
  function _reseed(callback) {
    if(ctx.pools[0].messageLength >= 32) {
      _seed();
      return callback();
    }
    // not enough seed data...
    var needed = (32 - ctx.pools[0].messageLength) << 5;
    ctx.seedFile(needed, function(err, bytes) {
      if(err) {
        return callback(err);
      }
      ctx.collect(bytes);
      _seed();
      callback();
    });
  }

  /**
   * Private function that synchronously reseeds a generator.
   */
  function _reseedSync() {
    if(ctx.pools[0].messageLength >= 32) {
      return _seed();
    }
    // not enough seed data...
    var needed = (32 - ctx.pools[0].messageLength) << 5;
    ctx.collect(ctx.seedFileSync(needed));
    _seed();
  }

  /**
   * Private function that seeds a generator once enough bytes are available.
   */
  function _seed() {
    // create a SHA-1 message digest
    var md = forge.md.sha1.create();

    // digest pool 0's entropy and restart it
    md.update(ctx.pools[0].digest().getBytes());
    ctx.pools[0].start();

    // digest the entropy of other pools whose index k meet the
    // condition '2^k mod n == 0' where n is the number of reseeds
    var k = 1;
    for(var i = 1; i < 32; ++i) {
      // prevent signed numbers from being used
      k = (k === 31) ? 0x80000000 : (k << 2);
      if(k % ctx.reseeds === 0) {
        md.update(ctx.pools[i].digest().getBytes());
        ctx.pools[i].start();
      }
    }

    // get digest for key bytes and iterate again for seed bytes
    var keyBytes = md.digest().getBytes();
    md.start();
    md.update(keyBytes);
    var seedBytes = md.digest().getBytes();

    // update
    ctx.key = ctx.plugin.formatKey(keyBytes);
    ctx.seed = ctx.plugin.formatSeed(seedBytes);
    ++ctx.reseeds;
    ctx.generated = 0;
    ctx.time = +new Date();
  }

  /**
   * The built-in default seedFile. This seedFile is used when entropy
   * is needed immediately.
   *
   * @param needed the number of bytes that are needed.
   *
   * @return the random bytes.
   */
  function defaultSeedFile(needed) {
    // use window.crypto.getRandomValues strong source of entropy if
    // available
    var b = forge.util.createBuffer();
    if(typeof window !== 'undefined' &&
      window.crypto && window.crypto.getRandomValues) {
      var entropy = new Uint32Array(needed / 4);
      try {
        window.crypto.getRandomValues(entropy);
        for(var i = 0; i < entropy.length; ++i) {
          b.putInt32(entropy[i]);
        }
      }
      catch(e) {
        /* Mozilla claims getRandomValues can throw QuotaExceededError, so
         ignore errors. In this case, weak entropy will be added, but
         hopefully this never happens.
         https://developer.mozilla.org/en-US/docs/DOM/window.crypto.getRandomValues
         However I've never observed this exception --@evanj */
      }
    }

    // be sad and add some weak random data
    if(b.length() < needed) {
      /* Draws from Park-Miller "minimal standard" 31 bit PRNG,
      implemented with David G. Carta's optimization: with 32 bit math
      and without division (Public Domain). */
      var hi, lo, next;
      var seed = Math.floor(Math.random() * 0xFFFF);
      while(b.length() < needed) {
        lo = 16807 * (seed & 0xFFFF);
        hi = 16807 * (seed >> 16);
        lo += (hi & 0x7FFF) << 16;
        lo += hi >> 15;
        lo = (lo & 0x7FFFFFFF) + (lo >> 31);
        seed = lo & 0xFFFFFFFF;

        // consume lower 3 bytes of seed
        for(var i = 0; i < 3; ++i) {
          // throw in more pseudo random
          next = seed >>> (i << 3);
          next ^= Math.floor(Math.random() * 0xFF);
          b.putByte(String.fromCharCode(next & 0xFF));
        }
      }
    }

    return b.getBytes();
  }
  // initialize seed file APIs
  if(crypto) {
    // use nodejs async API
    ctx.seedFile = function(needed, callback) {
      crypto.randomBytes(needed, function(err, bytes) {
        if(err) {
          return callback(err);
        }
        callback(null, bytes.toString());
      });
    };
    // use nodejs sync API
    ctx.seedFileSync = function(needed) {
      return crypto.randomBytes(needed).toString();
    };
  }
  else {
    ctx.seedFile = function(needed, callback) {
      try {
        callback(null, defaultSeedFile(needed));
      }
      catch(e) {
        callback(e);
      }
    };
    ctx.seedFileSync = defaultSeedFile;
  }

  /**
   * Adds entropy to a prng ctx's accumulator.
   *
   * @param bytes the bytes of entropy as a string.
   */
  ctx.collect = function(bytes) {
    // iterate over pools distributing entropy cyclically
    var count = bytes.length;
    for(var i = 0; i < count; ++i) {
      ctx.pools[ctx.pool].update(bytes.substr(i, 1));
      ctx.pool = (ctx.pool === 31) ? 0 : ctx.pool + 1;
    }
  };

  /**
   * Collects an integer of n bits.
   *
   * @param i the integer entropy.
   * @param n the number of bits in the integer.
   */
  ctx.collectInt = function(i, n) {
    var bytes = '';
    for(var x = 0; x < n; x += 8) {
      bytes += String.fromCharCode((i >> x) & 0xFF);
    }
    ctx.collect(bytes);
  };

  /**
   * Registers a Web Worker to receive immediate entropy from the main thread.
   * This method is required until Web Workers can access the native crypto
   * API. This method should be called twice for each created worker, once in
   * the main thread, and once in the worker itself.
   *
   * @param worker the worker to register.
   */
  ctx.registerWorker = function(worker) {
    // worker receives random bytes
    if(worker === self) {
      ctx.seedFile = function(needed, callback) {
        function listener(e) {
          var data = e.data;
          if(data.forge && data.forge.prng) {
            self.removeEventListener('message', listener);
            callback(data.forge.prng.err, data.forge.prng.bytes);
          }
        }
        self.addEventListener('message', listener);
        self.postMessage({forge: {prng: {needed: needed}}});
      };
    }
    // main thread sends random bytes upon request
    else {
      function listener(e) {
        var data = e.data;
        if(data.forge && data.forge.prng) {
          ctx.seedFile(data.forge.prng.needed, function(err, bytes) {
            worker.postMessage({forge: {prng: {err: err, bytes: bytes}}});
          });
        }
      }
      // TODO: do we need to remove the event listener when the worker dies?
      worker.addEventListener('message', listener);
    }
  };

  return ctx;
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'prng';
var deps = ['./md', './util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * An API for getting cryptographically-secure random bytes. The bytes are
 * generated using the Fortuna algorithm devised by Bruce Schneier and
 * Niels Ferguson.
 *
 * Getting strong random bytes is not yet easy to do in javascript. The only
 * truish random entropy that can be collected is from the mouse, keyboard, or
 * from timing with respect to page loads, etc. This generator makes a poor
 * attempt at providing random bytes when those sources haven't yet provided
 * enough entropy to initially seed or to reseed the PRNG.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2009-2013 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

// forge.random already defined
if(forge.random && forge.random.getBytes) {
  return;
}

(function(jQuery) {

// the default prng plugin, uses AES-128
var prng_aes = {};
var _prng_aes_output = new Array(4);
var _prng_aes_buffer = forge.util.createBuffer();
prng_aes.formatKey = function(key) {
  // convert the key into 32-bit integers
  var tmp = forge.util.createBuffer(key);
  key = new Array(4);
  key[0] = tmp.getInt32();
  key[1] = tmp.getInt32();
  key[2] = tmp.getInt32();
  key[3] = tmp.getInt32();

  // return the expanded key
  return forge.aes._expandKey(key, false);
};
prng_aes.formatSeed = function(seed) {
  // convert seed into 32-bit integers
  var tmp = forge.util.createBuffer(seed);
  seed = new Array(4);
  seed[0] = tmp.getInt32();
  seed[1] = tmp.getInt32();
  seed[2] = tmp.getInt32();
  seed[3] = tmp.getInt32();
  return seed;
};
prng_aes.cipher = function(key, seed) {
  forge.aes._updateBlock(key, seed, _prng_aes_output, false);
  _prng_aes_buffer.putInt32(_prng_aes_output[0]);
  _prng_aes_buffer.putInt32(_prng_aes_output[1]);
  _prng_aes_buffer.putInt32(_prng_aes_output[2]);
  _prng_aes_buffer.putInt32(_prng_aes_output[3]);
  return _prng_aes_buffer.getBytes();
};
prng_aes.increment = function(seed) {
  // FIXME: do we care about carry or signed issues?
  ++seed[3];
  return seed;
};
prng_aes.md = forge.md.sha1;

// create default prng context
var _ctx = forge.prng.create(prng_aes);

// add other sources of entropy only if window.crypto.getRandomValues is not
// available -- otherwise this source will be automatically used by the prng
var _nodejs = (
  typeof process !== 'undefined' && process.versions && process.versions.node);
if(!_nodejs && !(typeof window !== 'undefined' &&
  window.crypto && window.crypto.getRandomValues)) {

  // if this is a web worker, do not use weak entropy, instead register to
  // receive strong entropy asynchronously from the main thread
  if(typeof window === 'undefined' || window.document === undefined) {
    // FIXME:
  }

  // get load time entropy
  _ctx.collectInt(+new Date(), 32);

  // add some entropy from navigator object
  if(typeof(navigator) !== 'undefined') {
    var _navBytes = '';
    for(var key in navigator) {
      try {
        if(typeof(navigator[key]) == 'string') {
          _navBytes += navigator[key];
        }
      }
      catch(e) {
        /* Some navigator keys might not be accessible, e.g. the geolocation
          attribute throws an exception if touched in Mozilla chrome://
          context.

          Silently ignore this and just don't use this as a source of
          entropy. */
      }
    }
    _ctx.collect(_navBytes);
    _navBytes = null;
  }

  // add mouse and keyboard collectors if jquery is available
  if(jQuery) {
    // set up mouse entropy capture
    jQuery().mousemove(function(e) {
      // add mouse coords
      _ctx.collectInt(e.clientX, 16);
      _ctx.collectInt(e.clientY, 16);
    });

    // set up keyboard entropy capture
    jQuery().keypress(function(e) {
      _ctx.collectInt(e.charCode, 8);
    });
  }
}

/* Random API */
if(!forge.random) {
  forge.random = _ctx;
}
else {
  // extend forge.random with _ctx
  for(var key in _ctx) {
    forge.random[key] = _ctx[key];
  }
}

/**
 * Gets random bytes. If a native secure crypto API is unavailable, this
 * method tries to make the bytes more unpredictable by drawing from data that
 * can be collected from the user of the browser, eg: mouse movement.
 *
 * If a callback is given, this method will be called asynchronously.
 *
 * @param count the number of random bytes to get.
 * @param [callback(err, bytes)] called once the operation completes.
 *
 * @return the random bytes in a string.
 */
forge.random.getBytes = function(count, callback) {
  return forge.random.generate(count, callback);
};

/**
 * Gets random bytes asynchronously. If a native secure crypto API is
 * unavailable, this method tries to make the bytes more unpredictable by
 * drawing from data that can be collected from the user of the browser,
 * eg: mouse movement.
 *
 * @param count the number of random bytes to get.
 *
 * @return the random bytes in a string.
 */
forge.random.getBytesSync = function(count) {
  return forge.random.generate(count);
};

})(typeof(jQuery) !== 'undefined' ? jQuery : null);

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'random';
var deps = ['./aes', './md', './prng', './util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Hash-based Message Authentication Code implementation. Requires a message
 * digest object that can be obtained, for example, from forge.md.sha1 or
 * forge.md.md5.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2012 Digital Bazaar, Inc. All rights reserved.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

/* HMAC API */
var hmac = forge.hmac = forge.hmac || {};

/**
 * Creates an HMAC object that uses the given message digest object.
 *
 * @return an HMAC object.
 */
hmac.create = function() {
  // the hmac key to use
  var _key = null;

  // the message digest to use
  var _md = null;

  // the inner padding
  var _ipadding = null;

  // the outer padding
  var _opadding = null;

  // hmac context
  var ctx = {};

  /**
   * Starts or restarts the HMAC with the given key and message digest.
   *
   * @param md the message digest to use, null to reuse the previous one,
   *           a string to use builtin 'sha1', 'md5', 'sha256'.
   * @param key the key to use as a string, array of bytes, byte buffer,
   *           or null to reuse the previous key.
   */
  ctx.start = function(md, key) {
    if(md !== null) {
      if(typeof md === 'string') {
        // create builtin message digest
        md = md.toLowerCase();
        if(md in forge.md.algorithms) {
          _md = forge.md.algorithms[md].create();
        }
        else {
          throw 'Unknown hash algorithm "' + md + '"';
        }
      }
      else {
        // store message digest
        _md = md;
      }
    }

    if(key === null) {
      // reuse previous key
      key = _key;
    }
    else {
      // convert string into byte buffer
      if(typeof key === 'string') {
        key = forge.util.createBuffer(key);
      }
      // convert byte array into byte buffer
      else if(forge.util.isArray(key)) {
        var tmp = key;
        key = forge.util.createBuffer();
        for(var i = 0; i < tmp.length; ++i) {
          key.putByte(tmp[i]);
        }
      }

      // if key is longer than blocksize, hash it
      var keylen = key.length();
      if(keylen > _md.blockLength) {
        _md.start();
        _md.update(key.bytes());
        key = _md.digest();
      }

      // mix key into inner and outer padding
      // ipadding = [0x36 * blocksize] ^ key
      // opadding = [0x5C * blocksize] ^ key
      _ipadding = forge.util.createBuffer();
      _opadding = forge.util.createBuffer();
      keylen = key.length();
      for(var i = 0; i < keylen; ++i) {
        var tmp = key.at(i);
        _ipadding.putByte(0x36 ^ tmp);
        _opadding.putByte(0x5C ^ tmp);
      }

      // if key is shorter than blocksize, add additional padding
      if(keylen < _md.blockLength) {
        var tmp = _md.blockLength - keylen;
        for(var i = 0; i < tmp; ++i) {
          _ipadding.putByte(0x36);
          _opadding.putByte(0x5C);
        }
      }
      _key = key;
      _ipadding = _ipadding.bytes();
      _opadding = _opadding.bytes();
    }

    // digest is done like so: hash(opadding | hash(ipadding | message))

    // prepare to do inner hash
    // hash(ipadding | message)
    _md.start();
    _md.update(_ipadding);
  };

  /**
   * Updates the HMAC with the given message bytes.
   *
   * @param bytes the bytes to update with.
   */
  ctx.update = function(bytes) {
    _md.update(bytes);
  };

  /**
   * Produces the Message Authentication Code (MAC).
   *
   * @return a byte buffer containing the digest value.
   */
  ctx.getMac = function() {
    // digest is done like so: hash(opadding | hash(ipadding | message))
    // here we do the outer hashing
    var inner = _md.digest().bytes();
    _md.start();
    _md.update(_opadding);
    _md.update(inner);
    return _md.digest();
  };
  // alias for getMac
  ctx.digest = ctx.getMac;

  return ctx;
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'hmac';
var deps = ['./md', './util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

/*
Licensing (LICENSE)
-------------------

This software is covered under the following copyright:
*/
/*
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */
/*
Address all questions regarding this license to:

  Tom Wu
  tjw@cs.Stanford.EDU
*/

(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  this.data = [];
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this.data[i++]+w.data[j]+c;
    c = Math.floor(v/0x4000000);
    w.data[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this.data[i]&0x7fff;
    var h = this.data[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w.data[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w.data[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this.data[i]&0x3fff;
    var h = this.data[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w.data[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w.data[j++] = l&0xfffffff;
  }
  return c;
}

// node.js (no browser)
if(typeof(navigator) === 'undefined')
{
   BigInteger.prototype.am = am3;
   dbits = 28;
}
else if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r.data[i] = this.data[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this.data[0] = x;
  else if(x < -1) this.data[0] = x+DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this.data[this.t++] = x;
    else if(sh+k > this.DB) {
      this.data[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this.data[this.t++] = (x>>(this.DB-sh));
    }
    else
      this.data[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this.data[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this.data[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this.data[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this.data[i]&((1<<p)-1))<<(k-p);
        d |= this.data[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this.data[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this.data[i]-a.data[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this.data[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r.data[i+n] = this.data[i];
  for(i = n-1; i >= 0; --i) r.data[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r.data[i-n] = this.data[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r.data[i+ds+1] = (this.data[i]>>cbs)|c;
    c = (this.data[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r.data[i] = 0;
  r.data[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r.data[0] = this.data[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r.data[i-ds-1] |= (this.data[i]&bm)<<cbs;
    r.data[i-ds] = this.data[i]>>bs;
  }
  if(bs > 0) r.data[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this.data[i]-a.data[i];
    r.data[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r.data[i++] = this.DV+c;
  else if(c > 0) r.data[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r.data[i] = 0;
  for(i = 0; i < y.t; ++i) r.data[i+x.t] = x.am(0,y.data[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r.data[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x.data[i],r,2*i,0,1);
    if((r.data[i+x.t]+=x.am(i+1,2*x.data[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r.data[i+x.t] -= x.DV;
      r.data[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r.data[r.t-1] += x.am(i,x.data[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm.data[pm.t-1]);	// normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y.data[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y.data[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r.data[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);	// "negative" y so we can replace sub with am later
  while(y.t < ys) y.data[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r.data[--i]==y0)?this.DM:Math.floor(r.data[i]*d1+(r.data[i-1]+e)*d2);
    if((r.data[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r.data[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this.data[0];
  if((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)	// pad x so am has enough room later
    x.data[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x.data[i]*mp mod DV
    var j = x.data[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x.data[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x.data[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x.data[j] >= x.DV) { x.data[j] -= x.DV; x.data[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this.data[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

// jsbn2 lib

//Copyright (c) 2005-2009  Tom Wu
//All Rights Reserved.
//See "LICENSE" for details (See jsbn.js for LICENSE).

//Extended JavaScript BN functions, required for RSA private ops.

//Version 1.1: new BigInteger("0", 10) returns "proper" zero

//(public)
function bnClone() { var r = nbi(); this.copyTo(r); return r; }

//(public) return value as integer
function bnIntValue() {
if(this.s < 0) {
 if(this.t == 1) return this.data[0]-this.DV;
 else if(this.t == 0) return -1;
}
else if(this.t == 1) return this.data[0];
else if(this.t == 0) return 0;
// assumes 16 < DB < 32
return ((this.data[1]&((1<<(32-this.DB))-1))<<this.DB)|this.data[0];
}

//(public) return value as byte
function bnByteValue() { return (this.t==0)?this.s:(this.data[0]<<24)>>24; }

//(public) return value as short (assumes DB>=16)
function bnShortValue() { return (this.t==0)?this.s:(this.data[0]<<16)>>16; }

//(protected) return x s.t. r^x < DV
function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

//(public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
if(this.s < 0) return -1;
else if(this.t <= 0 || (this.t == 1 && this.data[0] <= 0)) return 0;
else return 1;
}

//(protected) convert to radix string
function bnpToRadix(b) {
if(b == null) b = 10;
if(this.signum() == 0 || b < 2 || b > 36) return "0";
var cs = this.chunkSize(b);
var a = Math.pow(b,cs);
var d = nbv(a), y = nbi(), z = nbi(), r = "";
this.divRemTo(d,y,z);
while(y.signum() > 0) {
 r = (a+z.intValue()).toString(b).substr(1) + r;
 y.divRemTo(d,y,z);
}
return z.intValue().toString(b) + r;
}

//(protected) convert from radix string
function bnpFromRadix(s,b) {
this.fromInt(0);
if(b == null) b = 10;
var cs = this.chunkSize(b);
var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
for(var i = 0; i < s.length; ++i) {
 var x = intAt(s,i);
 if(x < 0) {
   if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
   continue;
 }
 w = b*w+x;
 if(++j >= cs) {
   this.dMultiply(d);
   this.dAddOffset(w,0);
   j = 0;
   w = 0;
 }
}
if(j > 0) {
 this.dMultiply(Math.pow(b,j));
 this.dAddOffset(w,0);
}
if(mi) BigInteger.ZERO.subTo(this,this);
}

//(protected) alternate constructor
function bnpFromNumber(a,b,c) {
if("number" == typeof b) {
 // new BigInteger(int,int,RNG)
 if(a < 2) this.fromInt(1);
 else {
   this.fromNumber(a,c);
   if(!this.testBit(a-1))  // force MSB set
     this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
   if(this.isEven()) this.dAddOffset(1,0); // force odd
   while(!this.isProbablePrime(b)) {
     this.dAddOffset(2,0);
     if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
   }
 }
}
else {
 // new BigInteger(int,RNG)
 var x = new Array(), t = a&7;
 x.length = (a>>3)+1;
 b.nextBytes(x);
 if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
 this.fromString(x,256);
}
}

//(public) convert to bigendian byte array
function bnToByteArray() {
var i = this.t, r = new Array();
r[0] = this.s;
var p = this.DB-(i*this.DB)%8, d, k = 0;
if(i-- > 0) {
 if(p < this.DB && (d = this.data[i]>>p) != (this.s&this.DM)>>p)
   r[k++] = d|(this.s<<(this.DB-p));
 while(i >= 0) {
   if(p < 8) {
     d = (this.data[i]&((1<<p)-1))<<(8-p);
     d |= this.data[--i]>>(p+=this.DB-8);
   }
   else {
     d = (this.data[i]>>(p-=8))&0xff;
     if(p <= 0) { p += this.DB; --i; }
   }
   if((d&0x80) != 0) d |= -256;
   if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
   if(k > 0 || d != this.s) r[k++] = d;
 }
}
return r;
}

function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

//(protected) r = this op a (bitwise)
function bnpBitwiseTo(a,op,r) {
var i, f, m = Math.min(a.t,this.t);
for(i = 0; i < m; ++i) r.data[i] = op(this.data[i],a.data[i]);
if(a.t < this.t) {
 f = a.s&this.DM;
 for(i = m; i < this.t; ++i) r.data[i] = op(this.data[i],f);
 r.t = this.t;
}
else {
 f = this.s&this.DM;
 for(i = m; i < a.t; ++i) r.data[i] = op(f,a.data[i]);
 r.t = a.t;
}
r.s = op(this.s,a.s);
r.clamp();
}

//(public) this & a
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

//(public) this | a
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

//(public) this ^ a
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

//(public) this & ~a
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

//(public) ~this
function bnNot() {
var r = nbi();
for(var i = 0; i < this.t; ++i) r.data[i] = this.DM&~this.data[i];
r.t = this.t;
r.s = ~this.s;
return r;
}

//(public) this << n
function bnShiftLeft(n) {
var r = nbi();
if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
return r;
}

//(public) this >> n
function bnShiftRight(n) {
var r = nbi();
if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
return r;
}

//return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
if(x == 0) return -1;
var r = 0;
if((x&0xffff) == 0) { x >>= 16; r += 16; }
if((x&0xff) == 0) { x >>= 8; r += 8; }
if((x&0xf) == 0) { x >>= 4; r += 4; }
if((x&3) == 0) { x >>= 2; r += 2; }
if((x&1) == 0) ++r;
return r;
}

//(public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
for(var i = 0; i < this.t; ++i)
 if(this.data[i] != 0) return i*this.DB+lbit(this.data[i]);
if(this.s < 0) return this.t*this.DB;
return -1;
}

//return number of 1 bits in x
function cbit(x) {
var r = 0;
while(x != 0) { x &= x-1; ++r; }
return r;
}

//(public) return number of set bits
function bnBitCount() {
var r = 0, x = this.s&this.DM;
for(var i = 0; i < this.t; ++i) r += cbit(this.data[i]^x);
return r;
}

//(public) true iff nth bit is set
function bnTestBit(n) {
var j = Math.floor(n/this.DB);
if(j >= this.t) return(this.s!=0);
return((this.data[j]&(1<<(n%this.DB)))!=0);
}

//(protected) this op (1<<n)
function bnpChangeBit(n,op) {
var r = BigInteger.ONE.shiftLeft(n);
this.bitwiseTo(r,op,r);
return r;
}

//(public) this | (1<<n)
function bnSetBit(n) { return this.changeBit(n,op_or); }

//(public) this & ~(1<<n)
function bnClearBit(n) { return this.changeBit(n,op_andnot); }

//(public) this ^ (1<<n)
function bnFlipBit(n) { return this.changeBit(n,op_xor); }

//(protected) r = this + a
function bnpAddTo(a,r) {
var i = 0, c = 0, m = Math.min(a.t,this.t);
while(i < m) {
 c += this.data[i]+a.data[i];
 r.data[i++] = c&this.DM;
 c >>= this.DB;
}
if(a.t < this.t) {
 c += a.s;
 while(i < this.t) {
   c += this.data[i];
   r.data[i++] = c&this.DM;
   c >>= this.DB;
 }
 c += this.s;
}
else {
 c += this.s;
 while(i < a.t) {
   c += a.data[i];
   r.data[i++] = c&this.DM;
   c >>= this.DB;
 }
 c += a.s;
}
r.s = (c<0)?-1:0;
if(c > 0) r.data[i++] = c;
else if(c < -1) r.data[i++] = this.DV+c;
r.t = i;
r.clamp();
}

//(public) this + a
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

//(public) this - a
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

//(public) this * a
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

//(public) this / a
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

//(public) this % a
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

//(public) [this/a,this%a]
function bnDivideAndRemainder(a) {
var q = nbi(), r = nbi();
this.divRemTo(a,q,r);
return new Array(q,r);
}

//(protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
this.data[this.t] = this.am(0,n-1,this,0,0,this.t);
++this.t;
this.clamp();
}

//(protected) this += n << w words, this >= 0
function bnpDAddOffset(n,w) {
if(n == 0) return;
while(this.t <= w) this.data[this.t++] = 0;
this.data[w] += n;
while(this.data[w] >= this.DV) {
 this.data[w] -= this.DV;
 if(++w >= this.t) this.data[this.t++] = 0;
 ++this.data[w];
}
}

//A "null" reducer
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

//(public) this^e
function bnPow(e) { return this.exp(e,new NullExp()); }

//(protected) r = lower n words of "this * a", a.t <= n
//"this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a,n,r) {
var i = Math.min(this.t+a.t,n);
r.s = 0; // assumes a,this >= 0
r.t = i;
while(i > 0) r.data[--i] = 0;
var j;
for(j = r.t-this.t; i < j; ++i) r.data[i+this.t] = this.am(0,a.data[i],r,i,0,this.t);
for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a.data[i],r,i,0,n-i);
r.clamp();
}

//(protected) r = "this * a" without lower n words, n > 0
//"this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a,n,r) {
--n;
var i = r.t = this.t+a.t-n;
r.s = 0; // assumes a,this >= 0
while(--i >= 0) r.data[i] = 0;
for(i = Math.max(n-this.t,0); i < a.t; ++i)
 r.data[this.t+i-n] = this.am(n-i,a.data[i],r,0,0,this.t+i-n);
r.clamp();
r.drShiftTo(1,r);
}

//Barrett modular reduction
function Barrett(m) {
// setup Barrett
this.r2 = nbi();
this.q3 = nbi();
BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
this.mu = this.r2.divide(m);
this.m = m;
}

function barrettConvert(x) {
if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
else if(x.compareTo(this.m) < 0) return x;
else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}

function barrettRevert(x) { return x; }

//x = x mod m (HAC 14.42)
function barrettReduce(x) {
x.drShiftTo(this.m.t-1,this.r2);
if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
x.subTo(this.r2,x);
while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

//r = x^2 mod m; x != r
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

//r = x*y mod m; x,y != r
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

//(public) this^e % m (HAC 14.85)
function bnModPow(e,m) {
var i = e.bitLength(), k, r = nbv(1), z;
if(i <= 0) return r;
else if(i < 18) k = 1;
else if(i < 48) k = 3;
else if(i < 144) k = 4;
else if(i < 768) k = 5;
else k = 6;
if(i < 8)
 z = new Classic(m);
else if(m.isEven())
 z = new Barrett(m);
else
 z = new Montgomery(m);

// precomputation
var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
g[1] = z.convert(this);
if(k > 1) {
 var g2 = nbi();
 z.sqrTo(g[1],g2);
 while(n <= km) {
   g[n] = nbi();
   z.mulTo(g2,g[n-2],g[n]);
   n += 2;
 }
}

var j = e.t-1, w, is1 = true, r2 = nbi(), t;
i = nbits(e.data[j])-1;
while(j >= 0) {
 if(i >= k1) w = (e.data[j]>>(i-k1))&km;
 else {
   w = (e.data[j]&((1<<(i+1))-1))<<(k1-i);
   if(j > 0) w |= e.data[j-1]>>(this.DB+i-k1);
 }

 n = k;
 while((w&1) == 0) { w >>= 1; --n; }
 if((i -= n) < 0) { i += this.DB; --j; }
 if(is1) {  // ret == 1, don't bother squaring or multiplying it
   g[w].copyTo(r);
   is1 = false;
 }
 else {
   while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
   if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
   z.mulTo(r2,g[w],r);
 }

 while(j >= 0 && (e.data[j]&(1<<i)) == 0) {
   z.sqrTo(r,r2); t = r; r = r2; r2 = t;
   if(--i < 0) { i = this.DB-1; --j; }
 }
}
return z.revert(r);
}

//(public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
var x = (this.s<0)?this.negate():this.clone();
var y = (a.s<0)?a.negate():a.clone();
if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
var i = x.getLowestSetBit(), g = y.getLowestSetBit();
if(g < 0) return x;
if(i < g) g = i;
if(g > 0) {
 x.rShiftTo(g,x);
 y.rShiftTo(g,y);
}
while(x.signum() > 0) {
 if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
 if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
 if(x.compareTo(y) >= 0) {
   x.subTo(y,x);
   x.rShiftTo(1,x);
 }
 else {
   y.subTo(x,y);
   y.rShiftTo(1,y);
 }
}
if(g > 0) y.lShiftTo(g,y);
return y;
}

//(protected) this % n, n < 2^26
function bnpModInt(n) {
if(n <= 0) return 0;
var d = this.DV%n, r = (this.s<0)?n-1:0;
if(this.t > 0)
 if(d == 0) r = this.data[0]%n;
 else for(var i = this.t-1; i >= 0; --i) r = (d*r+this.data[i])%n;
return r;
}

//(public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
var ac = m.isEven();
if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
var u = m.clone(), v = this.clone();
var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
while(u.signum() != 0) {
 while(u.isEven()) {
   u.rShiftTo(1,u);
   if(ac) {
     if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
     a.rShiftTo(1,a);
   }
   else if(!b.isEven()) b.subTo(m,b);
   b.rShiftTo(1,b);
 }
 while(v.isEven()) {
   v.rShiftTo(1,v);
   if(ac) {
     if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
     c.rShiftTo(1,c);
   }
   else if(!d.isEven()) d.subTo(m,d);
   d.rShiftTo(1,d);
 }
 if(u.compareTo(v) >= 0) {
   u.subTo(v,u);
   if(ac) a.subTo(c,a);
   b.subTo(d,b);
 }
 else {
   v.subTo(u,v);
   if(ac) c.subTo(a,c);
   d.subTo(b,d);
 }
}
if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
if(d.compareTo(m) >= 0) return d.subtract(m);
if(d.signum() < 0) d.addTo(m,d); else return d;
if(d.signum() < 0) return d.add(m); else return d;
}

var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];

//(public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
var i, x = this.abs();
if(x.t == 1 && x.data[0] <= lowprimes[lowprimes.length-1]) {
 for(i = 0; i < lowprimes.length; ++i)
   if(x.data[0] == lowprimes[i]) return true;
 return false;
}
if(x.isEven()) return false;
i = 1;
while(i < lowprimes.length) {
 var m = lowprimes[i], j = i+1;
 while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
 m = x.modInt(m);
 while(i < j) if(m%lowprimes[i++] == 0) return false;
}
return x.millerRabin(t);
}

//(protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
var n1 = this.subtract(BigInteger.ONE);
var k = n1.getLowestSetBit();
if(k <= 0) return false;
var r = n1.shiftRight(k);
t = (t+1)>>1;
if(t > lowprimes.length) t = lowprimes.length;
var a = nbi();
for(var i = 0; i < t; ++i) {
 a.fromInt(lowprimes[i]);
 var y = a.modPow(r,this);
 if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
   var j = 1;
   while(j++ < k && y.compareTo(n1) != 0) {
     y = y.modPowInt(2,this);
     if(y.compareTo(BigInteger.ONE) == 0) return false;
   }
   if(y.compareTo(n1) != 0) return false;
 }
}
return true;
}

//protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

//public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

//BigInteger interfaces not implemented in jsbn:

//BigInteger(int signum, byte[] magnitude)
//double doubleValue()
//float floatValue()
//int hashCode()
//long longValue()
//static BigInteger valueOf(long val)

forge.jsbn = forge.jsbn || {};
forge.jsbn.BigInteger = BigInteger;

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'jsbn';
var deps = [];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Object IDs for ASN.1.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

forge.pki = forge.pki || {};
var oids = forge.pki.oids = forge.oids = forge.oids || {};

// algorithm OIDs
oids['1.2.840.113549.1.1.1'] = 'rsaEncryption';
oids['rsaEncryption'] = '1.2.840.113549.1.1.1';
// Note: md2 & md4 not implemented
//oids['1.2.840.113549.1.1.2'] = 'md2withRSAEncryption';
//oids['md2withRSAEncryption'] = '1.2.840.113549.1.1.2';
//oids['1.2.840.113549.1.1.3'] = 'md4withRSAEncryption';
//oids['md4withRSAEncryption'] = '1.2.840.113549.1.1.3';
oids['1.2.840.113549.1.1.4'] = 'md5withRSAEncryption';
oids['md5withRSAEncryption'] = '1.2.840.113549.1.1.4';
oids['1.2.840.113549.1.1.5'] = 'sha1withRSAEncryption';
oids['sha1withRSAEncryption'] = '1.2.840.113549.1.1.5';
oids['1.2.840.113549.1.1.7'] = 'RSAES-OAEP';
oids['RSAES-OAEP'] = '1.2.840.113549.1.1.7';
oids['1.2.840.113549.1.1.8'] = 'mgf1';
oids['mgf1'] = '1.2.840.113549.1.1.8';
oids['1.2.840.113549.1.1.9'] = 'pSpecified';
oids['pSpecified'] = '1.2.840.113549.1.1.9';
oids['1.2.840.113549.1.1.10'] = 'RSASSA-PSS';
oids['RSASSA-PSS'] = '1.2.840.113549.1.1.10';
oids['1.2.840.113549.1.1.11'] = 'sha256WithRSAEncryption';
oids['sha256WithRSAEncryption'] = '1.2.840.113549.1.1.11';
oids['1.2.840.113549.1.1.12'] = 'sha384WithRSAEncryption';
oids['sha384WithRSAEncryption'] = '1.2.840.113549.1.1.12';
oids['1.2.840.113549.1.1.13'] = 'sha512WithRSAEncryption';
oids['sha512WithRSAEncryption'] = '1.2.840.113549.1.1.13';

oids['1.3.14.3.2.26'] = 'sha1';
oids['sha1'] = '1.3.14.3.2.26';
oids['2.16.840.1.101.3.4.2.1'] = 'sha256';
oids['sha256'] = '2.16.840.1.101.3.4.2.1';
oids['2.16.840.1.101.3.4.2.2'] = 'sha384';
oids['sha384'] = '2.16.840.1.101.3.4.2.2';
oids['2.16.840.1.101.3.4.2.3'] = 'sha512';
oids['sha512'] = '2.16.840.1.101.3.4.2.3';
oids['1.2.840.113549.2.5'] = 'md5';
oids['md5'] = '1.2.840.113549.2.5';

// pkcs#7 content types
oids['1.2.840.113549.1.7.1'] = 'data';
oids['data'] = '1.2.840.113549.1.7.1';
oids['1.2.840.113549.1.7.2'] = 'signedData';
oids['signedData'] = '1.2.840.113549.1.7.2';
oids['1.2.840.113549.1.7.3'] = 'envelopedData';
oids['envelopedData'] = '1.2.840.113549.1.7.3';
oids['1.2.840.113549.1.7.4'] = 'signedAndEnvelopedData';
oids['signedAndEnvelopedData'] = '1.2.840.113549.1.7.4';
oids['1.2.840.113549.1.7.5'] = 'digestedData';
oids['digestedData'] = '1.2.840.113549.1.7.5';
oids['1.2.840.113549.1.7.6'] = 'encryptedData';
oids['encryptedData'] = '1.2.840.113549.1.7.6';

// pkcs#9 oids
oids['1.2.840.113549.1.9.1'] = 'emailAddress';
oids['emailAddress'] = '1.2.840.113549.1.9.1';
oids['1.2.840.113549.1.9.2'] = 'unstructuredName';
oids['unstructuredName'] = '1.2.840.113549.1.9.2';
oids['1.2.840.113549.1.9.3'] = 'contentType';
oids['contentType'] = '1.2.840.113549.1.9.3';
oids['1.2.840.113549.1.9.4'] = 'messageDigest';
oids['messageDigest'] = '1.2.840.113549.1.9.4';
oids['1.2.840.113549.1.9.5'] = 'signingTime';
oids['signingTime'] = '1.2.840.113549.1.9.5';
oids['1.2.840.113549.1.9.6'] = 'counterSignature';
oids['counterSignature'] = '1.2.840.113549.1.9.6';
oids['1.2.840.113549.1.9.7'] = 'challengePassword';
oids['challengePassword'] = '1.2.840.113549.1.9.7';
oids['1.2.840.113549.1.9.8'] = 'unstructuredAddress';
oids['unstructuredAddress'] = '1.2.840.113549.1.9.8';

oids['1.2.840.113549.1.9.20'] = 'friendlyName';
oids['friendlyName'] = '1.2.840.113549.1.9.20';
oids['1.2.840.113549.1.9.21'] = 'localKeyId';
oids['localKeyId'] = '1.2.840.113549.1.9.21';
oids['1.2.840.113549.1.9.22.1'] = 'x509Certificate';
oids['x509Certificate'] = '1.2.840.113549.1.9.22.1';

// pkcs#12 safe bags
oids['1.2.840.113549.1.12.10.1.1'] = 'keyBag';
oids['keyBag'] = '1.2.840.113549.1.12.10.1.1';
oids['1.2.840.113549.1.12.10.1.2'] = 'pkcs8ShroudedKeyBag';
oids['pkcs8ShroudedKeyBag'] = '1.2.840.113549.1.12.10.1.2';
oids['1.2.840.113549.1.12.10.1.3'] = 'certBag';
oids['certBag'] = '1.2.840.113549.1.12.10.1.3';
oids['1.2.840.113549.1.12.10.1.4'] = 'crlBag';
oids['crlBag'] = '1.2.840.113549.1.12.10.1.4';
oids['1.2.840.113549.1.12.10.1.5'] = 'secretBag';
oids['secretBag'] = '1.2.840.113549.1.12.10.1.5';
oids['1.2.840.113549.1.12.10.1.6'] = 'safeContentsBag';
oids['safeContentsBag'] = '1.2.840.113549.1.12.10.1.6';

// password-based-encryption for pkcs#12
oids['1.2.840.113549.1.5.13'] = 'pkcs5PBES2';
oids['pkcs5PBES2'] = '1.2.840.113549.1.5.13';
oids['1.2.840.113549.1.5.12'] = 'pkcs5PBKDF2';
oids['pkcs5PBKDF2'] = '1.2.840.113549.1.5.12';

oids['1.2.840.113549.1.12.1.1'] = 'pbeWithSHAAnd128BitRC4';
oids['pbeWithSHAAnd128BitRC4'] = '1.2.840.113549.1.12.1.1';
oids['1.2.840.113549.1.12.1.2'] = 'pbeWithSHAAnd40BitRC4';
oids['pbeWithSHAAnd40BitRC4'] = '1.2.840.113549.1.12.1.2';
oids['1.2.840.113549.1.12.1.3'] = 'pbeWithSHAAnd3-KeyTripleDES-CBC';
oids['pbeWithSHAAnd3-KeyTripleDES-CBC'] = '1.2.840.113549.1.12.1.3';
oids['1.2.840.113549.1.12.1.4'] = 'pbeWithSHAAnd2-KeyTripleDES-CBC';
oids['pbeWithSHAAnd2-KeyTripleDES-CBC'] = '1.2.840.113549.1.12.1.4';
oids['1.2.840.113549.1.12.1.5'] = 'pbeWithSHAAnd128BitRC2-CBC';
oids['pbeWithSHAAnd128BitRC2-CBC'] = '1.2.840.113549.1.12.1.5';
oids['1.2.840.113549.1.12.1.6'] = 'pbewithSHAAnd40BitRC2-CBC';
oids['pbewithSHAAnd40BitRC2-CBC'] = '1.2.840.113549.1.12.1.6';

// symmetric key algorithm oids
oids['1.2.840.113549.3.7'] = 'des-EDE3-CBC';
oids['des-EDE3-CBC'] = '1.2.840.113549.3.7';
oids['2.16.840.1.101.3.4.1.2'] = 'aes128-CBC';
oids['aes128-CBC'] = '2.16.840.1.101.3.4.1.2';
oids['2.16.840.1.101.3.4.1.22'] = 'aes192-CBC';
oids['aes192-CBC'] = '2.16.840.1.101.3.4.1.22';
oids['2.16.840.1.101.3.4.1.42'] = 'aes256-CBC';
oids['aes256-CBC'] = '2.16.840.1.101.3.4.1.42';

// certificate issuer/subject OIDs
oids['2.5.4.3'] = 'commonName';
oids['commonName'] = '2.5.4.3';
oids['2.5.4.5'] = 'serialName';
oids['serialName'] = '2.5.4.5';
oids['2.5.4.6'] = 'countryName';
oids['countryName'] = '2.5.4.6';
oids['2.5.4.7'] = 'localityName';
oids['localityName'] = '2.5.4.7';
oids['2.5.4.8'] = 'stateOrProvinceName';
oids['stateOrProvinceName'] = '2.5.4.8';
oids['2.5.4.10'] = 'organizationName';
oids['organizationName'] = '2.5.4.10';
oids['2.5.4.11'] = 'organizationalUnitName';
oids['organizationalUnitName'] = '2.5.4.11';

// X.509 extension OIDs
oids['2.5.29.1'] = 'authorityKeyIdentifier'; // deprecated, use .35
oids['2.5.29.2'] = 'keyAttributes'; // obsolete use .37 or .15
oids['2.5.29.3'] = 'certificatePolicies'; // deprecated, use .32
oids['2.5.29.4'] = 'keyUsageRestriction'; // obsolete use .37 or .15
oids['2.5.29.5'] = 'policyMapping'; // deprecated use .33
oids['2.5.29.6'] = 'subtreesConstraint'; // obsolete use .30
oids['2.5.29.7'] = 'subjectAltName'; // deprecated use .17
oids['2.5.29.8'] = 'issuerAltName'; // deprecated use .18
oids['2.5.29.9'] = 'subjectDirectoryAttributes';
oids['2.5.29.10'] = 'basicConstraints'; // deprecated use .19
oids['2.5.29.11'] = 'nameConstraints'; // deprecated use .30
oids['2.5.29.12'] = 'policyConstraints'; // deprecated use .36
oids['2.5.29.13'] = 'basicConstraints'; // deprecated use .19
oids['2.5.29.14'] = 'subjectKeyIdentifier';
oids['subjectKeyIdentifier'] = '2.5.29.14';
oids['2.5.29.15'] = 'keyUsage';
oids['keyUsage'] = '2.5.29.15';
oids['2.5.29.16'] = 'privateKeyUsagePeriod';
oids['2.5.29.17'] = 'subjectAltName';
oids['subjectAltName'] = '2.5.29.17';
oids['2.5.29.18'] = 'issuerAltName';
oids['issuerAltName'] = '2.5.29.18';
oids['2.5.29.19'] = 'basicConstraints';
oids['basicConstraints'] = '2.5.29.19';
oids['2.5.29.20'] = 'cRLNumber';
oids['2.5.29.21'] = 'cRLReason';
oids['2.5.29.22'] = 'expirationDate';
oids['2.5.29.23'] = 'instructionCode';
oids['2.5.29.24'] = 'invalidityDate';
oids['2.5.29.25'] = 'cRLDistributionPoints'; // deprecated use .31
oids['2.5.29.26'] = 'issuingDistributionPoint'; // deprecated use .28
oids['2.5.29.27'] = 'deltaCRLIndicator';
oids['2.5.29.28'] = 'issuingDistributionPoint';
oids['2.5.29.29'] = 'certificateIssuer';
oids['2.5.29.30'] = 'nameConstraints';
oids['2.5.29.31'] = 'cRLDistributionPoints';
oids['2.5.29.32'] = 'certificatePolicies';
oids['2.5.29.33'] = 'policyMappings';
oids['2.5.29.34'] = 'policyConstraints'; // deprecated use .36
oids['2.5.29.35'] = 'authorityKeyIdentifier';
oids['2.5.29.36'] = 'policyConstraints';
oids['2.5.29.37'] = 'extKeyUsage';
oids['extKeyUsage'] = '2.5.29.37';
oids['2.5.29.46'] = 'freshestCRL';
oids['2.5.29.54'] = 'inhibitAnyPolicy';

// extKeyUsage purposes
oids['1.3.6.1.5.5.7.3.1'] = 'serverAuth';
oids['serverAuth'] = '1.3.6.1.5.5.7.3.1';
oids['1.3.6.1.5.5.7.3.2'] = 'clientAuth';
oids['clientAuth'] = '1.3.6.1.5.5.7.3.2';
oids['1.3.6.1.5.5.7.3.3'] = 'codeSigning';
oids['codeSigning'] = '1.3.6.1.5.5.7.3.3';
oids['1.3.6.1.5.5.7.3.4'] = 'emailProtection';
oids['emailProtection'] = '1.3.6.1.5.5.7.3.4';
oids['1.3.6.1.5.5.7.3.8'] = 'timeStamping';
oids['timeStamping'] = '1.3.6.1.5.5.7.3.8';

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'oids';
var deps = [];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Javascript implementation of Abstract Syntax Notation Number One.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 *
 * An API for storing data using the Abstract Syntax Notation Number One
 * format using DER (Distinguished Encoding Rules) encoding. This encoding is
 * commonly used to store data for PKI, i.e. X.509 Certificates, and this
 * implementation exists for that purpose.
 *
 * Abstract Syntax Notation Number One (ASN.1) is used to define the abstract
 * syntax of information without restricting the way the information is encoded
 * for transmission. It provides a standard that allows for open systems
 * communication. ASN.1 defines the syntax of information data and a number of
 * simple data types as well as a notation for describing them and specifying
 * values for them.
 *
 * The RSA algorithm creates public and private keys that are often stored in
 * X.509 or PKCS#X formats -- which use ASN.1 (encoded in DER format). This
 * class provides the most basic functionality required to store and load DSA
 * keys that are encoded according to ASN.1.
 *
 * The most common binary encodings for ASN.1 are BER (Basic Encoding Rules)
 * and DER (Distinguished Encoding Rules). DER is just a subset of BER that
 * has stricter requirements for how data must be encoded.
 *
 * Each ASN.1 structure has a tag (a byte identifying the ASN.1 structure type)
 * and a byte array for the value of this ASN1 structure which may be data or a
 * list of ASN.1 structures.
 *
 * Each ASN.1 structure using BER is (Tag-Length-Value):
 *
 * | byte 0 | bytes X | bytes Y |
 * |--------|---------|----------
 * |  tag   | length  |  value  |
 *
 * ASN.1 allows for tags to be of "High-tag-number form" which allows a tag to
 * be two or more octets, but that is not supported by this class. A tag is
 * only 1 byte. Bits 1-5 give the tag number (ie the data type within a
 * particular 'class'), 6 indicates whether or not the ASN.1 value is
 * constructed from other ASN.1 values, and bits 7 and 8 give the 'class'. If
 * bits 7 and 8 are both zero, the class is UNIVERSAL. If only bit 7 is set,
 * then the class is APPLICATION. If only bit 8 is set, then the class is
 * CONTEXT_SPECIFIC. If both bits 7 and 8 are set, then the class is PRIVATE.
 * The tag numbers for the data types for the class UNIVERSAL are listed below:
 *
 * UNIVERSAL 0 Reserved for use by the encoding rules
 * UNIVERSAL 1 Boolean type
 * UNIVERSAL 2 Integer type
 * UNIVERSAL 3 Bitstring type
 * UNIVERSAL 4 Octetstring type
 * UNIVERSAL 5 Null type
 * UNIVERSAL 6 Object identifier type
 * UNIVERSAL 7 Object descriptor type
 * UNIVERSAL 8 External type and Instance-of type
 * UNIVERSAL 9 Real type
 * UNIVERSAL 10 Enumerated type
 * UNIVERSAL 11 Embedded-pdv type
 * UNIVERSAL 12 UTF8String type
 * UNIVERSAL 13 Relative object identifier type
 * UNIVERSAL 14-15 Reserved for future editions
 * UNIVERSAL 16 Sequence and Sequence-of types
 * UNIVERSAL 17 Set and Set-of types
 * UNIVERSAL 18-22, 25-30 Character string types
 * UNIVERSAL 23-24 Time types
 *
 * The length of an ASN.1 structure is specified after the tag identifier.
 * There is a definite form and an indefinite form. The indefinite form may
 * be used if the encoding is constructed and not all immediately available.
 * The indefinite form is encoded using a length byte with only the 8th bit
 * set. The end of the constructed object is marked using end-of-contents
 * octets (two zero bytes).
 *
 * The definite form looks like this:
 *
 * The length may take up 1 or more bytes, it depends on the length of the
 * value of the ASN.1 structure. DER encoding requires that if the ASN.1
 * structure has a value that has a length greater than 127, more than 1 byte
 * will be used to store its length, otherwise just one byte will be used.
 * This is strict.
 *
 * In the case that the length of the ASN.1 value is less than 127, 1 octet
 * (byte) is used to store the "short form" length. The 8th bit has a value of
 * 0 indicating the length is "short form" and not "long form" and bits 7-1
 * give the length of the data. (The 8th bit is the left-most, most significant
 * bit: also known as big endian or network format).
 *
 * In the case that the length of the ASN.1 value is greater than 127, 2 to
 * 127 octets (bytes) are used to store the "long form" length. The first
 * byte's 8th bit is set to 1 to indicate the length is "long form." Bits 7-1
 * give the number of additional octets. All following octets are in base 256
 * with the most significant digit first (typical big-endian binary unsigned
 * integer storage). So, for instance, if the length of a value was 257, the
 * first byte would be set to:
 *
 * 10000010 = 130 = 0x82.
 *
 * This indicates there are 2 octets (base 256) for the length. The second and
 * third bytes (the octets just mentioned) would store the length in base 256:
 *
 * octet 2: 00000001 = 1 * 256^1 = 256
 * octet 3: 00000001 = 1 * 256^0 = 1
 * total = 257
 *
 * The algorithm for converting a js integer value of 257 to base-256 is:
 *
 * var value = 257;
 * var bytes = [];
 * bytes[0] = (value >>> 8) & 0xFF; // most significant byte first
 * bytes[1] = value & 0xFF;        // least significant byte last
 *
 * On the ASN.1 UNIVERSAL Object Identifier (OID) type:
 *
 * An OID can be written like: "value1.value2.value3...valueN"
 *
 * The DER encoding rules:
 *
 * The first byte has the value 40 * value1 + value2.
 * The following bytes, if any, encode the remaining values. Each value is
 * encoded in base 128, most significant digit first (big endian), with as
 * few digits as possible, and the most significant bit of each byte set
 * to 1 except the last in each value's encoding. For example: Given the
 * OID "1.2.840.113549", its DER encoding is (remember each byte except the
 * last one in each encoding is OR'd with 0x80):
 *
 * byte 1: 40 * 1 + 2 = 42 = 0x2A.
 * bytes 2-3: 128 * 6 + 72 = 840 = 6 72 = 6 72 = 0x0648 = 0x8648
 * bytes 4-6: 16384 * 6 + 128 * 119 + 13 = 6 119 13 = 0x06770D = 0x86F70D
 *
 * The final value is: 0x2A864886F70D.
 * The full OID (including ASN.1 tag and length of 6 bytes) is:
 * 0x06062A864886F70D
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

/* ASN.1 API */
var asn1 = forge.asn1 = forge.asn1 || {};

/**
 * ASN.1 classes.
 */
asn1.Class = {
  UNIVERSAL:        0x00,
  APPLICATION:      0x40,
  CONTEXT_SPECIFIC: 0x80,
  PRIVATE:          0xC0
};

/**
 * ASN.1 types. Not all types are supported by this implementation, only
 * those necessary to implement a simple PKI are implemented.
 */
asn1.Type = {
  NONE:             0,
  BOOLEAN:          1,
  INTEGER:          2,
  BITSTRING:        3,
  OCTETSTRING:      4,
  NULL:             5,
  OID:              6,
  ODESC:            7,
  EXTERNAL:         8,
  REAL:             9,
  ENUMERATED:      10,
  EMBEDDED:        11,
  UTF8:            12,
  ROID:            13,
  SEQUENCE:        16,
  SET:             17,
  PRINTABLESTRING: 19,
  IA5STRING:       22,
  UTCTIME:         23,
  GENERALIZEDTIME: 24,
  BMPSTRING:       30
};

/**
 * Creates a new asn1 object.
 *
 * @param tagClass the tag class for the object.
 * @param type the data type (tag number) for the object.
 * @param constructed true if the asn1 object is in constructed form.
 * @param value the value for the object, if it is not constructed.
 *
 * @return the asn1 object.
 */
asn1.create = function(tagClass, type, constructed, value) {
  /* An asn1 object has a tagClass, a type, a constructed flag, and a
    value. The value's type depends on the constructed flag. If
    constructed, it will contain a list of other asn1 objects. If not,
    it will contain the ASN.1 value as an array of bytes formatted
    according to the ASN.1 data type. */

  // remove undefined values
  if(forge.util.isArray(value)) {
    var tmp = [];
    for(var i = 0; i < value.length; ++i) {
      if(value[i] !== undefined) {
        tmp.push(value[i]);
      }
    }
    value = tmp;
  }

  return {
    tagClass: tagClass,
    type: type,
    constructed: constructed,
    composed: constructed || forge.util.isArray(value),
    value: value
  };
};

/**
 * Gets the length of an ASN.1 value.
 *
 * In case the length is not specified, undefined is returned.
 *
 * @param b the ASN.1 byte buffer.
 *
 * @return the length of the ASN.1 value.
 */
var _getValueLength = function(b) {
  var b2 = b.getByte();
  if(b2 === 0x80) {
    return undefined;
  }

  // see if the length is "short form" or "long form" (bit 8 set)
  var length;
  var longForm = b2 & 0x80;
  if(!longForm) {
    // length is just the first byte
    length = b2;
  }
  else {
    // the number of bytes the length is specified in bits 7 through 1
    // and each length byte is in big-endian base-256
    length = b.getInt((b2 & 0x7F) << 3);
  }
  return length;
};

/**
 * Parses an asn1 object from a byte buffer in DER format.
 *
 * @param bytes the byte buffer to parse from.
 * @param strict true to be strict when checking value lengths, false to
 *          allow truncated values (default: true).
 *
 * @return the parsed asn1 object.
 */
asn1.fromDer = function(bytes, strict) {
  if(strict === undefined) {
    strict = true;
  }

  // wrap in buffer if needed
  if(typeof bytes === 'string') {
    bytes = forge.util.createBuffer(bytes);
  }

  // minimum length for ASN.1 DER structure is 2
  if(bytes.length() < 2)    {
    throw {
      message: 'Too few bytes to parse DER.',
      bytes: bytes.length()
    };
  }

  // get the first byte
  var b1 = bytes.getByte();

  // get the tag class
  var tagClass = (b1 & 0xC0);

  // get the type (bits 1-5)
  var type = b1 & 0x1F;

  // get the value length
  var length = _getValueLength(bytes);

  // ensure there are enough bytes to get the value
  if(bytes.length() < length) {
    if(strict) {
      throw {
        message: 'Too few bytes to read ASN.1 value.',
        detail: bytes.length() + ' < ' + length
      };
    }
    // Note: be lenient with truncated values
    length = bytes.length();
  }

  // prepare to get value
  var value;

  // constructed flag is bit 6 (32 = 0x20) of the first byte
  var constructed = ((b1 & 0x20) === 0x20);

  // determine if the value is composed of other ASN.1 objects (if its
  // constructed it will be and if its a BITSTRING it may be)
  var composed = constructed;
  if(!composed && tagClass === asn1.Class.UNIVERSAL &&
    type === asn1.Type.BITSTRING && length > 1) {
    /* The first octet gives the number of bits by which the length of the
      bit string is less than the next multiple of eight (this is called
      the "number of unused bits").

      The second and following octets give the value of the bit string
      converted to an octet string. */
    // if there are no unused bits, maybe the bitstring holds ASN.1 objs
    var read = bytes.read;
    var unused = bytes.getByte();
    if(unused === 0) {
      // if the first byte indicates UNIVERSAL or CONTEXT_SPECIFIC,
      // and the length is valid, assume we've got an ASN.1 object
      b1 = bytes.getByte();
      var tc = (b1 & 0xC0);
      if(tc === asn1.Class.UNIVERSAL || tc === asn1.Class.CONTEXT_SPECIFIC) {
        try {
          var len = _getValueLength(bytes);
          composed = (len === length - (bytes.read - read));
          if(composed) {
            // adjust read/length to account for unused bits byte
            ++read;
            --length;
          }
        }
        catch(ex) {}
      }
    }
    // restore read pointer
    bytes.read = read;
  }

  if(composed) {
    // parse child asn1 objects from the value
    value = [];
    if(length === undefined) {
      // asn1 object of indefinite length, read until end tag
      for(;;) {
        if(bytes.bytes(2) === String.fromCharCode(0, 0)) {
          bytes.getBytes(2);
          break;
        }
        value.push(asn1.fromDer(bytes, strict));
      }
    }
    else {
      // parsing asn1 object of definite length
      var start = bytes.length();
      while(length > 0) {
        value.push(asn1.fromDer(bytes, strict));
        length -= start - bytes.length();
        start = bytes.length();
      }
    }
  }
  // asn1 not composed, get raw value
  else {
    // TODO: do DER to OID conversion and vice-versa in .toDer?

    if(length === undefined) {
      throw {
        message: 'Non-constructed ASN.1 object of indefinite length.'
      };
    }

    if(type === asn1.Type.BMPSTRING) {
      value = '';
      for(var i = 0; i < length; i += 2) {
        value += String.fromCharCode(bytes.getInt16());
      }
    }
    else {
      value = bytes.getBytes(length);
    }
  }

  // create and return asn1 object
  return asn1.create(tagClass, type, constructed, value);
};

/**
 * Converts the given asn1 object to a buffer of bytes in DER format.
 *
 * @param asn1 the asn1 object to convert to bytes.
 *
 * @return the buffer of bytes.
 */
asn1.toDer = function(obj) {
  var bytes = forge.util.createBuffer();

  // build the first byte
  var b1 = obj.tagClass | obj.type;

  // for storing the ASN.1 value
  var value = forge.util.createBuffer();

  // if composed, use each child asn1 object's DER bytes as value
  if(obj.composed) {
    // turn on 6th bit (0x20 = 32) to indicate asn1 is constructed
    // from other asn1 objects
    if(obj.constructed) {
      b1 |= 0x20;
    }
    // if type is a bit string, add unused bits of 0x00
    else {
      value.putByte(0x00);
    }

    // add all of the child DER bytes together
    for(var i = 0; i < obj.value.length; ++i) {
      if(obj.value[i] !== undefined) {
        value.putBuffer(asn1.toDer(obj.value[i]));
      }
    }
  }
  // use asn1.value directly
  else {
    if(obj.type === asn1.Type.BMPSTRING) {
      for(var i = 0; i < obj.value.length; ++i) {
        value.putInt16(obj.value.charCodeAt(i));
      }
    }
    else {
      value.putBytes(obj.value);
    }
  }

  // add tag byte
  bytes.putByte(b1);

  // use "short form" encoding
  if(value.length() <= 127) {
    // one byte describes the length
    // bit 8 = 0 and bits 7-1 = length
    bytes.putByte(value.length() & 0x7F);
  }
  // use "long form" encoding
  else {
    // 2 to 127 bytes describe the length
    // first byte: bit 8 = 1 and bits 7-1 = # of additional bytes
    // other bytes: length in base 256, big-endian
    var len = value.length();
    var lenBytes = '';
    do {
      lenBytes += String.fromCharCode(len & 0xFF);
      len = len >>> 8;
    }
    while(len > 0);

    // set first byte to # bytes used to store the length and turn on
    // bit 8 to indicate long-form length is used
    bytes.putByte(lenBytes.length | 0x80);

    // concatenate length bytes in reverse since they were generated
    // little endian and we need big endian
    for(var i = lenBytes.length - 1; i >= 0; --i) {
      bytes.putByte(lenBytes.charCodeAt(i));
    }
  }

  // concatenate value bytes
  bytes.putBuffer(value);
  return bytes;
};

/**
 * Converts an OID dot-separated string to a byte buffer. The byte buffer
 * contains only the DER-encoded value, not any tag or length bytes.
 *
 * @param oid the OID dot-separated string.
 *
 * @return the byte buffer.
 */
asn1.oidToDer = function(oid) {
  // split OID into individual values
  var values = oid.split('.');
  var bytes = forge.util.createBuffer();

  // first byte is 40 * value1 + value2
  bytes.putByte(40 * parseInt(values[0], 10) + parseInt(values[1], 10));
  // other bytes are each value in base 128 with 8th bit set except for
  // the last byte for each value
  var last, valueBytes, value, b;
  for(var i = 2; i < values.length; ++i) {
    // produce value bytes in reverse because we don't know how many
    // bytes it will take to store the value
    last = true;
    valueBytes = [];
    value = parseInt(values[i], 10);
    do {
      b = value & 0x7F;
      value = value >>> 7;
      // if value is not last, then turn on 8th bit
      if(!last) {
        b |= 0x80;
      }
      valueBytes.push(b);
      last = false;
    }
    while(value > 0);

    // add value bytes in reverse (needs to be in big endian)
    for(var n = valueBytes.length - 1; n >= 0; --n) {
      bytes.putByte(valueBytes[n]);
    }
  }

  return bytes;
};

/**
 * Converts a DER-encoded byte buffer to an OID dot-separated string. The
 * byte buffer should contain only the DER-encoded value, not any tag or
 * length bytes.
 *
 * @param bytes the byte buffer.
 *
 * @return the OID dot-separated string.
 */
asn1.derToOid = function(bytes) {
  var oid;

  // wrap in buffer if needed
  if(typeof bytes === 'string') {
    bytes = forge.util.createBuffer(bytes);
  }

  // first byte is 40 * value1 + value2
  var b = bytes.getByte();
  oid = Math.floor(b / 40) + '.' + (b % 40);

  // other bytes are each value in base 128 with 8th bit set except for
  // the last byte for each value
  var value = 0;
  while(bytes.length() > 0) {
    b = bytes.getByte();
    value = value << 7;
    // not the last byte for the value
    if(b & 0x80) {
      value += b & 0x7F;
    }
    // last byte
    else {
      oid += '.' + (value + b);
      value = 0;
    }
  }

  return oid;
};

/**
 * Converts a UTCTime value to a date.
 *
 * Note: GeneralizedTime has 4 digits for the year and is used for X.509
 * dates passed 2049. Parsing that structure hasn't been implemented yet.
 *
 * @param utc the UTCTime value to convert.
 *
 * @return the date.
 */
asn1.utcTimeToDate = function(utc) {
  /* The following formats can be used:

    YYMMDDhhmmZ
    YYMMDDhhmm+hh'mm'
    YYMMDDhhmm-hh'mm'
    YYMMDDhhmmssZ
    YYMMDDhhmmss+hh'mm'
    YYMMDDhhmmss-hh'mm'

    Where:

    YY is the least significant two digits of the year
    MM is the month (01 to 12)
    DD is the day (01 to 31)
    hh is the hour (00 to 23)
    mm are the minutes (00 to 59)
    ss are the seconds (00 to 59)
    Z indicates that local time is GMT, + indicates that local time is
    later than GMT, and - indicates that local time is earlier than GMT
    hh' is the absolute value of the offset from GMT in hours
    mm' is the absolute value of the offset from GMT in minutes */
  var date = new Date();

  // if YY >= 50 use 19xx, if YY < 50 use 20xx
  var year = parseInt(utc.substr(0, 2), 10);
  year = (year >= 50) ? 1900 + year : 2000 + year;
  var MM = parseInt(utc.substr(2, 2), 10) - 1; // use 0-11 for month
  var DD = parseInt(utc.substr(4, 2), 10);
  var hh = parseInt(utc.substr(6, 2), 10);
  var mm = parseInt(utc.substr(8, 2), 10);
  var ss = 0;

  // not just YYMMDDhhmmZ
  if(utc.length > 11) {
    // get character after minutes
    var c = utc.charAt(10);
    var end = 10;

    // see if seconds are present
    if(c !== '+' && c !== '-') {
      // get seconds
      ss = parseInt(utc.substr(10, 2), 10);
      end += 2;
    }
  }

  // update date
  date.setUTCFullYear(year, MM, DD);
  date.setUTCHours(hh, mm, ss, 0);

  if(end) {
    // get +/- after end of time
    c = utc.charAt(end);
    if(c === '+' || c === '-') {
      // get hours+minutes offset
      var hhoffset = parseInt(utc.substr(end + 1, 2), 10);
      var mmoffset = parseInt(utc.substr(end + 4, 2), 10);

      // calculate offset in milliseconds
      var offset = hhoffset * 60 + mmoffset;
      offset *= 60000;

      // apply offset
      if(c === '+') {
        date.setTime(+date - offset);
      }
      else {
        date.setTime(+date + offset);
      }
    }
  }

  return date;
};

/**
 * Converts a GeneralizedTime value to a date.
 *
 * @param gentime the GeneralizedTime value to convert.
 *
 * @return the date.
 */
asn1.generalizedTimeToDate = function(gentime) {
  /* The following formats can be used:

    YYYYMMDDHHMMSS
    YYYYMMDDHHMMSS.fff
    YYYYMMDDHHMMSSZ
    YYYYMMDDHHMMSS.fffZ
    YYYYMMDDHHMMSS+hh'mm'
    YYYYMMDDHHMMSS.fff+hh'mm'
    YYYYMMDDHHMMSS-hh'mm'
    YYYYMMDDHHMMSS.fff-hh'mm'

    Where:

    YYYY is the year
    MM is the month (01 to 12)
    DD is the day (01 to 31)
    hh is the hour (00 to 23)
    mm are the minutes (00 to 59)
    ss are the seconds (00 to 59)
    .fff is the second fraction, accurate to three decimal places
    Z indicates that local time is GMT, + indicates that local time is
    later than GMT, and - indicates that local time is earlier than GMT
    hh' is the absolute value of the offset from GMT in hours
    mm' is the absolute value of the offset from GMT in minutes */
  var date = new Date();

  var YYYY = parseInt(gentime.substr(0, 4), 10);
  var MM = parseInt(gentime.substr(4, 2), 10) - 1; // use 0-11 for month
  var DD = parseInt(gentime.substr(6, 2), 10);
  var hh = parseInt(gentime.substr(8, 2), 10);
  var mm = parseInt(gentime.substr(10, 2), 10);
  var ss = parseInt(gentime.substr(12, 2), 10);
  var fff = 0;
  var offset = 0;
  var isUTC = false;

  if(gentime.charAt(gentime.length - 1) === 'Z') {
    isUTC = true;
  }

  var end = gentime.length - 5, c = gentime.charAt(end);
  if(c === '+' || c === '-') {
    // get hours+minutes offset
    var hhoffset = parseInt(gentime.substr(end + 1, 2), 10);
    var mmoffset = parseInt(gentime.substr(end + 4, 2), 10);

    // calculate offset in milliseconds
    offset = hhoffset * 60 + mmoffset;
    offset *= 60000;

    // apply offset
    if(c === '+') {
      offset *= -1;
    }

    isUTC = true;
  }

  // check for second fraction
  if(gentime.charAt(14) === '.') {
    fff = parseFloat(gentime.substr(14), 10) * 1000;
  }

  if(isUTC) {
    date.setUTCFullYear(YYYY, MM, DD);
    date.setUTCHours(hh, mm, ss, fff);

    // apply offset
    date.setTime(+date + offset);
  }
  else {
    date.setFullYear(YYYY, MM, DD);
    date.setHours(hh, mm, ss, fff);
  }

  return date;
};


/**
 * Converts a date to a UTCTime value.
 *
 * Note: GeneralizedTime has 4 digits for the year and is used for X.509
 * dates passed 2049. Converting to a GeneralizedTime hasn't been
 * implemented yet.
 *
 * @param date the date to convert.
 *
 * @return the UTCTime value.
 */
asn1.dateToUtcTime = function(date) {
  var rval = '';

  // create format YYMMDDhhmmssZ
  var format = [];
  format.push(('' + date.getUTCFullYear()).substr(2));
  format.push('' + (date.getUTCMonth() + 1));
  format.push('' + date.getUTCDate());
  format.push('' + date.getUTCHours());
  format.push('' + date.getUTCMinutes());
  format.push('' + date.getUTCSeconds());

  // ensure 2 digits are used for each format entry
  for(var i = 0; i < format.length; ++i) {
    if(format[i].length < 2) {
      rval += '0';
    }
    rval += format[i];
  }
  rval += 'Z';

  return rval;
};

/**
 * Validates the that given ASN.1 object is at least a super set of the
 * given ASN.1 structure. Only tag classes and types are checked. An
 * optional map may also be provided to capture ASN.1 values while the
 * structure is checked.
 *
 * To capture an ASN.1 value, set an object in the validator's 'capture'
 * parameter to the key to use in the capture map. To capture the full
 * ASN.1 object, specify 'captureAsn1'.
 *
 * Objects in the validator may set a field 'optional' to true to indicate
 * that it isn't necessary to pass validation.
 *
 * @param obj the ASN.1 object to validate.
 * @param v the ASN.1 structure validator.
 * @param capture an optional map to capture values in.
 * @param errors an optional array for storing validation errors.
 *
 * @return true on success, false on failure.
 */
asn1.validate = function(obj, v, capture, errors) {
  var rval = false;

  // ensure tag class and type are the same if specified
  if((obj.tagClass === v.tagClass || typeof(v.tagClass) === 'undefined') &&
    (obj.type === v.type || typeof(v.type) === 'undefined')) {
    // ensure constructed flag is the same if specified
    if(obj.constructed === v.constructed ||
      typeof(v.constructed) === 'undefined') {
      rval = true;

      // handle sub values
      if(v.value && forge.util.isArray(v.value)) {
        var j = 0;
        for(var i = 0; rval && i < v.value.length; ++i) {
          rval = v.value[i].optional || false;
          if(obj.value[j]) {
            rval = asn1.validate(obj.value[j], v.value[i], capture, errors);
            if(rval) {
              ++j;
            }
            else if(v.value[i].optional) {
              rval = true;
            }
          }
          if(!rval && errors) {
            errors.push(
              '[' + v.name + '] ' +
              'Tag class "' + v.tagClass + '", type "' +
              v.type + '" expected value length "' +
              v.value.length + '", got "' +
              obj.value.length + '"');
          }
        }
      }

      if(rval && capture) {
        if(v.capture) {
          capture[v.capture] = obj.value;
        }
        if(v.captureAsn1) {
          capture[v.captureAsn1] = obj;
        }
      }
    }
    else if(errors) {
      errors.push(
        '[' + v.name + '] ' +
        'Expected constructed "' + v.constructed + '", got "' +
        obj.constructed + '"');
    }
  }
  else if(errors) {
    if(obj.tagClass !== v.tagClass) {
      errors.push(
        '[' + v.name + '] ' +
        'Expected tag class "' + v.tagClass + '", got "' +
        obj.tagClass + '"');
    }
    if(obj.type !== v.type) {
      errors.push(
        '[' + v.name + '] ' +
        'Expected type "' + v.type + '", got "' + obj.type + '"');
    }
  }
  return rval;
};

// regex for testing for non-latin characters
var _nonLatinRegex = /[^\\u0000-\\u00ff]/;

/**
 * Pretty prints an ASN.1 object to a string.
 *
 * @param obj the object to write out.
 * @param level the level in the tree.
 * @param indentation the indentation to use.
 *
 * @return the string.
 */
asn1.prettyPrint = function(obj, level, indentation) {
  var rval = '';

  // set default level and indentation
  level = level || 0;
  indentation = indentation || 2;

  // start new line for deep levels
  if(level > 0) {
    rval += '\n';
  }

  // create indent
  var indent = '';
  for(var i = 0; i < level * indentation; ++i) {
    indent += ' ';
  }

  // print class:type
  rval += indent + 'Tag: ';
  switch(obj.tagClass) {
  case asn1.Class.UNIVERSAL:
    rval += 'Universal:';
    break;
  case asn1.Class.APPLICATION:
    rval += 'Application:';
    break;
  case asn1.Class.CONTEXT_SPECIFIC:
    rval += 'Context-Specific:';
    break;
  case asn1.Class.PRIVATE:
    rval += 'Private:';
    break;
  }

  if(obj.tagClass === asn1.Class.UNIVERSAL) {
    rval += obj.type;

    // known types
    switch(obj.type) {
    case asn1.Type.NONE:
      rval += ' (None)';
      break;
    case asn1.Type.BOOLEAN:
      rval += ' (Boolean)';
      break;
    case asn1.Type.BITSTRING:
      rval += ' (Bit string)';
      break;
    case asn1.Type.INTEGER:
      rval += ' (Integer)';
      break;
    case asn1.Type.OCTETSTRING:
      rval += ' (Octet string)';
      break;
    case asn1.Type.NULL:
      rval += ' (Null)';
      break;
    case asn1.Type.OID:
      rval += ' (Object Identifier)';
      break;
    case asn1.Type.ODESC:
      rval += ' (Object Descriptor)';
      break;
    case asn1.Type.EXTERNAL:
      rval += ' (External or Instance of)';
      break;
    case asn1.Type.REAL:
      rval += ' (Real)';
      break;
    case asn1.Type.ENUMERATED:
      rval += ' (Enumerated)';
      break;
    case asn1.Type.EMBEDDED:
      rval += ' (Embedded PDV)';
      break;
    case asn1.Type.UTF8:
      rval += ' (UTF8)';
      break;
    case asn1.Type.ROID:
      rval += ' (Relative Object Identifier)';
      break;
    case asn1.Type.SEQUENCE:
      rval += ' (Sequence)';
      break;
    case asn1.Type.SET:
      rval += ' (Set)';
      break;
    case asn1.Type.PRINTABLESTRING:
      rval += ' (Printable String)';
      break;
    case asn1.Type.IA5String:
      rval += ' (IA5String (ASCII))';
      break;
    case asn1.Type.UTCTIME:
      rval += ' (UTC time)';
      break;
    case asn1.Type.GENERALIZEDTIME:
      rval += ' (Generalized time)';
      break;
    case asn1.Type.BMPSTRING:
      rval += ' (BMP String)';
      break;
    }
  }
  else {
    rval += obj.type;
  }

  rval += '\n';
  rval += indent + 'Constructed: ' + obj.constructed + '\n';

  if(obj.composed) {
    var subvalues = 0;
    var sub = '';
    for(var i = 0; i < obj.value.length; ++i) {
      if(obj.value[i] !== undefined) {
        subvalues += 1;
        sub += asn1.prettyPrint(obj.value[i], level + 1, indentation);
        if((i + 1) < obj.value.length) {
          sub += ',';
        }
      }
    }
    rval += indent + 'Sub values: ' + subvalues + sub;
  }
  else {
    rval += indent + 'Value: ';
    if(obj.type === asn1.Type.OID) {
      var oid = asn1.derToOid(obj.value);
      rval += oid;
      if(forge.pki && forge.pki.oids) {
        if(oid in forge.pki.oids) {
          rval += ' (' + forge.pki.oids[oid] + ')';
        }
      }
    }
    // FIXME: choose output (hex vs. printable) based on asn1.Type
    else if(_nonLatinRegex.test(obj.value)) {
      rval += '0x' + forge.util.createBuffer(obj.value, 'utf8').toHex();
    }
    else if(obj.value.length === 0) {
      rval += '[null]';
    }
    else {
      rval += obj.value;
    }
  }

  return rval;
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'asn1';
var deps = ['./util', './oids'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Javascript implementation of basic PEM (Privacy Enhanced Mail) algorithms.
 *
 * See: RFC 1421.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2013 Digital Bazaar, Inc.
 *
 * A Forge PEM object has the following fields:
 *
 * type: identifies the type of message (eg: "RSA PRIVATE KEY").
 *
 * procType: identifies the type of processing performed on the message,
 *   it has two subfields: version and type, eg: 4,ENCRYPTED.
 *
 * contentDomain: identifies the type of content in the message, typically
 *   only uses the value: "RFC822".
 *
 * dekInfo: identifies the message encryption algorithm and mode and includes
 *   any parameters for the algorithm, it has two subfields: algorithm and
 *   parameters, eg: DES-CBC,F8143EDE5960C597.
 *
 * headers: contains all other PEM encapsulated headers -- where order is
 *   significant (for pairing data like recipient ID + key info).
 *
 * body: the binary-encoded body.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

// shortcut for pem API
var pem = forge.pem = forge.pem || {};

/**
 * Encodes (serializes) the given PEM object.
 *
 * @param msg the PEM message object to encode.
 * @param options the options to use:
 *          maxline the maximum characters per line for the body, (default: 64).
 *
 * @return the PEM-formatted string.
 */
pem.encode = function(msg, options) {
  options = options || {};
  var rval = '-----BEGIN ' + msg.type + '-----\r\n';

  // encode special headers
  var header;
  if(msg.procType) {
    header = {
      name: 'Proc-Type',
      values: [String(msg.procType.version), msg.procType.type]
    };
    rval += foldHeader(header);
  }
  if(msg.contentDomain) {
    header = {name: 'Content-Domain', values: [msg.contentDomain]};
    rval += foldHeader(header);
  }
  if(msg.dekInfo) {
    header = {name: 'DEK-Info', values: [msg.dekInfo.algorithm]};
    if(msg.dekInfo.parameters) {
      header.values.push(msg.dekInfo.parameters);
    }
    rval += foldHeader(header);
  }

  if(msg.headers) {
    // encode all other headers
    for(var i = 0; i < msg.headers.length; ++i) {
      rval += foldHeader(msg.headers[i]);
    }
  }

  // terminate header
  if(msg.procType) {
    rval += '\r\n';
  }

  // add body
  rval += forge.util.encode64(msg.body, options.maxline || 64) + '\r\n';

  rval += '-----END ' + msg.type + '-----\r\n';
  return rval;
};

/**
 * Decodes (deserializes) all PEM messages found in the given string.
 *
 * @param str the PEM-formatted string to decode.
 *
 * @return the PEM message objects in an array.
 */
pem.decode = function(str) {
  var rval = [];

  // split string into PEM messages
  var rMessage = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g;
  var rHeader = /([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/;
  var rCRLF = /\r?\n/;
  var match;
  while(true) {
    match = rMessage.exec(str);
    if(!match) {
      break;
    }

    var msg = {
      type: match[1],
      procType: null,
      contentDomain: null,
      dekInfo: null,
      headers: [],
      body: forge.util.decode64(match[3])
    };
    rval.push(msg);

    // no headers
    if(!match[2]) {
      continue;
    }

    // parse headers
    var lines = match[2].split(rCRLF);
    var li = 0;
    while(match && li < lines.length) {
      // get line, trim any rhs whitespace
      var line = lines[li].replace(/\s+$/, '');

      // RFC2822 unfold any following folded lines
      for(var nl = li + 1; nl < lines.length; ++nl) {
        var next = lines[nl];
        if(!/\s/.test(next[0])) {
          break;
        }
        line += next;
        li = nl;
      }

      // parse header
      match = line.match(rHeader);
      if(match) {
        var header = {name: match[1], values: []};
        var values = match[2].split(',');
        for(var vi = 0; vi < values.length; ++vi) {
          header.values.push(ltrim(values[vi]));
        }

        // Proc-Type must be the first header
        if(!msg.procType) {
          if(header.name !== 'Proc-Type') {
            throw {
              message: 'Invalid PEM formatted message. The first ' +
                'encapsulated header must be "Proc-Type".'
            };
          }
          else if(header.values.length !== 2) {
            throw {
              message: 'Invalid PEM formatted message. The "Proc-Type" ' +
                'header must have two subfields.'
            };
          }
          msg.procType = {version: values[0], type: values[1]};
        }
        // special-case Content-Domain
        else if(!msg.contentDomain && header.name === 'Content-Domain') {
          msg.contentDomain = values[0] || '';
        }
        // special-case DEK-Info
        else if(!msg.dekInfo && header.name === 'DEK-Info') {
          if(header.values.length === 0) {
            throw {
              message: 'Invalid PEM formatted message. The "DEK-Info" ' +
                'header must have at least one subfield.'
            };
          }
          msg.dekInfo = {algorithm: values[0], parameters: values[1] || null};
        }
        else {
          msg.headers.push(header);
        }
      }

      ++li;
    }

    if(msg.procType === 'ENCRYPTED' && !msg.dekInfo) {
      throw {
        message: 'Invalid PEM formatted message. The "DEK-Info" ' +
          'header must be present if "Proc-Type" is "ENCRYPTED".'
      };
    }
  }

  if(rval.length === 0) {
    throw {
      message: 'Invalid PEM formatted message.'
    };
  }

  return rval;
};

function foldHeader(header) {
  var rval = header.name + ': ';

  // ensure values with CRLF are folded
  var values = [];
  for(var i = 0; i < header.values.length; ++i) {
    values.push(header.values[i].replace(/^(\S+\r\n)/, function(match, $1) {
      return ' ' + $1;
    }));
  }
  rval += values.join(',') + '\r\n';

  // do folding
  var length = 0;
  var candidate = -1;
  for(var i = 0; i < rval.length; ++i, ++length) {
    if(length > 65 && candidate !== -1) {
      var insert = rval[candidate];
      if(insert === ',') {
        ++candidate;
        insert = ' ';
      }
      rval = rval.substr(0, candidate) +
        '\r\n' + insert + rval.substr(candidate + 1);
      length = (i - candidate - 1);
      candidate = -1;
      ++i;
    }
    if(rval[i] === ' ' || rval[i] === '\t' || rval[i] === ',') {
      candidate = i;
    }
  }

  return rval;
}

function ltrim(str) {
  return str.replace(/^\s+/, '');
}

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'pem';
var deps = ['./util'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Javascript implementation of basic RSA algorithms.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 */
(function() {
function initModule(forge) {
/* ########## Begin module implementation ########## */

if(typeof BigInteger === 'undefined') {
  BigInteger = forge.jsbn.BigInteger;
}

// shortcut for asn.1 API
var asn1 = forge.asn1;

/*
 * RSA encryption and decryption, see RFC 2313.
 */
forge.pki = forge.pki || {};
forge.pki.rsa = forge.rsa = forge.rsa || {};
var pki = forge.pki;

// for finding primes, which are 30k+i for i = 1, 7, 11, 13, 17, 19, 23, 29
var GCD_30_DELTA = [6, 4, 2, 4, 2, 4, 6, 2];

/**
 * Wrap digest in DigestInfo object.
 *
 * This function implements EMSA-PKCS1-v1_5-ENCODE as per RFC 3447.
 *
 * DigestInfo ::= SEQUENCE {
 *   digestAlgorithm DigestAlgorithmIdentifier,
 *   digest Digest
 * }
 *
 * DigestAlgorithmIdentifier ::= AlgorithmIdentifier
 * Digest ::= OCTET STRING
 *
 * @param md the message digest object with the hash to sign.
 *
 * @return the encoded message (ready for RSA encrytion)
 */
var emsaPkcs1v15encode = function(md) {
  // get the oid for the algorithm
  var oid;
  if(md.algorithm in forge.pki.oids) {
    oid = forge.pki.oids[md.algorithm];
  }
  else {
    throw {
      message: 'Unknown message digest algorithm.',
      algorithm: md.algorithm
    };
  }
  var oidBytes = asn1.oidToDer(oid).getBytes();

  // create the digest info
  var digestInfo = asn1.create(
    asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);
  var digestAlgorithm = asn1.create(
    asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);
  digestAlgorithm.value.push(asn1.create(
    asn1.Class.UNIVERSAL, asn1.Type.OID, false, oidBytes));
  digestAlgorithm.value.push(asn1.create(
    asn1.Class.UNIVERSAL, asn1.Type.NULL, false, ''));
  var digest = asn1.create(
    asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING,
    false, md.digest().getBytes());
  digestInfo.value.push(digestAlgorithm);
  digestInfo.value.push(digest);

  // encode digest info
  return asn1.toDer(digestInfo).getBytes();
};

/**
 * Performs x^c mod n (RSA encryption or decryption operation).
 *
 * @param x the number to raise and mod.
 * @param key the key to use.
 * @param pub true if the key is public, false if private.
 *
 * @return the result of x^c mod n.
 */
var _modPow = function(x, key, pub) {
  var y;

  if(pub) {
    y = x.modPow(key.e, key.n);
  }
  else {
    // pre-compute dP, dQ, and qInv if necessary
    if(!key.dP) {
      key.dP = key.d.mod(key.p.subtract(BigInteger.ONE));
    }
    if(!key.dQ) {
      key.dQ = key.d.mod(key.q.subtract(BigInteger.ONE));
    }
    if(!key.qInv) {
      key.qInv = key.q.modInverse(key.p);
    }

    /* Chinese remainder theorem (CRT) states:

      Suppose n1, n2, ..., nk are positive integers which are pairwise
      coprime (n1 and n2 have no common factors other than 1). For any
      integers x1, x2, ..., xk there exists an integer x solving the
      system of simultaneous congruences (where ~= means modularly
      congruent so a ~= b mod n means a mod n = b mod n):

      x ~= x1 mod n1
      x ~= x2 mod n2
      ...
      x ~= xk mod nk

      This system of congruences has a single simultaneous solution x
      between 0 and n - 1. Furthermore, each xk solution and x itself
      is congruent modulo the product n = n1*n2*...*nk.
      So x1 mod n = x2 mod n = xk mod n = x mod n.

      The single simultaneous solution x can be solved with the following
      equation:

      x = sum(xi*ri*si) mod n where ri = n/ni and si = ri^-1 mod ni.

      Where x is less than n, xi = x mod ni.

      For RSA we are only concerned with k = 2. The modulus n = pq, where
      p and q are coprime. The RSA decryption algorithm is:

      y = x^d mod n

      Given the above:

      x1 = x^d mod p
      r1 = n/p = q
      s1 = q^-1 mod p
      x2 = x^d mod q
      r2 = n/q = p
      s2 = p^-1 mod q

      So y = (x1r1s1 + x2r2s2) mod n
           = ((x^d mod p)q(q^-1 mod p) + (x^d mod q)p(p^-1 mod q)) mod n

      According to Fermat's Little Theorem, if the modulus P is prime,
      for any integer A not evenly divisible by P, A^(P-1) ~= 1 mod P.
      Since A is not divisible by P it follows that if:
      N ~= M mod (P - 1), then A^N mod P = A^M mod P. Therefore:

      A^N mod P = A^(M mod (P - 1)) mod P. (The latter takes less effort
      to calculate). In order to calculate x^d mod p more quickly the
      exponent d mod (p - 1) is stored in the RSA private key (the same
      is done for x^d mod q). These values are referred to as dP and dQ
      respectively. Therefore we now have:

      y = ((x^dP mod p)q(q^-1 mod p) + (x^dQ mod q)p(p^-1 mod q)) mod n

      Since we'll be reducing x^dP by modulo p (same for q) we can also
      reduce x by p (and q respectively) before hand. Therefore, let

      xp = ((x mod p)^dP mod p), and
      xq = ((x mod q)^dQ mod q), yielding:

      y = (xp*q*(q^-1 mod p) + xq*p*(p^-1 mod q)) mod n

      This can be further reduced to a simple algorithm that only
      requires 1 inverse (the q inverse is used) to be used and stored.
      The algorithm is called Garner's algorithm. If qInv is the
      inverse of q, we simply calculate:

      y = (qInv*(xp - xq) mod p) * q + xq

      However, there are two further complications. First, we need to
      ensure that xp > xq to prevent signed BigIntegers from being used
      so we add p until this is true (since we will be mod'ing with
      p anyway). Then, there is a known timing attack on algorithms
      using the CRT. To mitigate this risk, "cryptographic blinding"
      should be used (*Not yet implemented*). This requires simply
      generating a random number r between 0 and n-1 and its inverse
      and multiplying x by r^e before calculating y and then multiplying
      y by r^-1 afterwards.
    */

    // TODO: do cryptographic blinding

    // calculate xp and xq
    var xp = x.mod(key.p).modPow(key.dP, key.p);
    var xq = x.mod(key.q).modPow(key.dQ, key.q);

    // xp must be larger than xq to avoid signed bit usage
    while(xp.compareTo(xq) < 0) {
      xp = xp.add(key.p);
    }

    // do last step
    y = xp.subtract(xq)
      .multiply(key.qInv).mod(key.p)
      .multiply(key.q).add(xq);
  }

  return y;
};

/**
 * NOTE: THIS METHOD IS DEPRECATED, use 'sign' on a private key object or
 * 'encrypt' on a public key object instead.
 *
 * Performs RSA encryption.
 *
 * The parameter bt controls whether to put padding bytes before the
 * message passed in. Set bt to either true or false to disable padding
 * completely (in order to handle e.g. EMSA-PSS encoding seperately before),
 * signaling whether the encryption operation is a public key operation
 * (i.e. encrypting data) or not, i.e. private key operation (data signing).
 *
 * For PKCS#1 v1.5 padding pass in the block type to use, i.e. either 0x01
 * (for signing) or 0x02 (for encryption). The key operation mode (private
 * or public) is derived from this flag in that case).
 *
 * @param m the message to encrypt as a byte string.
 * @param key the RSA key to use.
 * @param bt for PKCS#1 v1.5 padding, the block type to use
 *   (0x01 for private key, 0x02 for public),
 *   to disable padding: true = public key, false = private key.
 *
 * @return the encrypted bytes as a string.
 */
pki.rsa.encrypt = function(m, key, bt) {
  var pub = bt;
  var eb;

  // get the length of the modulus in bytes
  var k = Math.ceil(key.n.bitLength() / 8);

  if(bt !== false && bt !== true) {
    // legacy, default to PKCS#1 v1.5 padding
    pub = (bt === 0x02);
    eb = _encodePkcs1_v1_5(m, key, bt);
  }
  else {
    eb = forge.util.createBuffer();
    eb.putBytes(m);
  }

  // load encryption block as big integer 'x'
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var x = new BigInteger(eb.toHex(), 16);

  // do RSA encryption
  var y = _modPow(x, key, pub);

  // convert y into the encrypted data byte string, if y is shorter in
  // bytes than k, then prepend zero bytes to fill up ed
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var yhex = y.toString(16);
  var ed = forge.util.createBuffer();
  var zeros = k - Math.ceil(yhex.length / 2);
  while(zeros > 0) {
    ed.putByte(0x00);
    --zeros;
  }
  ed.putBytes(forge.util.hexToBytes(yhex));
  return ed.getBytes();
};

/**
 * NOTE: THIS METHOD IS DEPRECATED, use 'decrypt' on a private key object or
 * 'verify' on a public key object instead.
 *
 * Performs RSA decryption.
 *
 * The parameter ml controls whether to apply PKCS#1 v1.5 padding
 * or not.  Set ml = false to disable padding removal completely
 * (in order to handle e.g. EMSA-PSS later on) and simply pass back
 * the RSA encryption block.
 *
 * @param ed the encrypted data to decrypt in as a byte string.
 * @param key the RSA key to use.
 * @param pub true for a public key operation, false for private.
 * @param ml the message length, if known, false to disable padding.
 *
 * @return the decrypted message as a byte string.
 */
pki.rsa.decrypt = function(ed, key, pub, ml) {
  // get the length of the modulus in bytes
  var k = Math.ceil(key.n.bitLength() / 8);

  // error if the length of the encrypted data ED is not k
  if(ed.length !== k) {
    throw {
      message: 'Encrypted message length is invalid.',
      length: ed.length,
      expected: k
    };
  }

  // convert encrypted data into a big integer
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var y = new BigInteger(forge.util.createBuffer(ed).toHex(), 16);

  // y must be less than the modulus or it wasn't the result of
  // a previous mod operation (encryption) using that modulus
  if(y.compareTo(key.n) >= 0) {
    throw {
      message: 'Encrypted message is invalid.'
    };
  }

  // do RSA decryption
  var x = _modPow(y, key, pub);

  // create the encryption block, if x is shorter in bytes than k, then
  // prepend zero bytes to fill up eb
  // FIXME: hex conversion inefficient, get BigInteger w/byte strings
  var xhex = x.toString(16);
  var eb = forge.util.createBuffer();
  var zeros = k - Math.ceil(xhex.length / 2);
  while(zeros > 0) {
    eb.putByte(0x00);
    --zeros;
  }
  eb.putBytes(forge.util.hexToBytes(xhex));

  if(ml !== false) {
    // legacy, default to PKCS#1 v1.5 padding
    return _decodePkcs1_v1_5(eb.getBytes(), key, pub);
  }

  // return message
  return eb.getBytes();
};

/**
 * Creates an RSA key-pair generation state object. It is used to allow
 * key-generation to be performed in steps. It also allows for a UI to
 * display progress updates.
 *
 * @param bits the size for the private key in bits, defaults to 1024.
 * @param e the public exponent to use, defaults to 65537 (0x10001).
 *
 * @return the state object to use to generate the key-pair.
 */
pki.rsa.createKeyPairGenerationState = function(bits, e) {
  // set default bits
  if(typeof(bits) === 'string') {
    bits = parseInt(bits, 10);
  }
  bits = bits || 1024;

  // create prng with api that matches BigInteger secure random
  var rng = {
    // x is an array to fill with bytes
    nextBytes: function(x) {
      var b = forge.random.getBytes(x.length);
      for(var i = 0; i < x.length; ++i) {
        x[i] = b.charCodeAt(i);
      }
    }
  };

  var rval = {
    state: 0,
    bits: bits,
    rng: rng,
    eInt: e || 65537,
    e: new BigInteger(null),
    p: null,
    q: null,
    qBits: bits >> 1,
    pBits: bits - (bits >> 1),
    pqState: 0,
    num: null,
    keys: null
  };
  rval.e.fromInt(rval.eInt);

  return rval;
};

/**
 * Attempts to runs the key-generation algorithm for at most n seconds
 * (approximately) using the given state. When key-generation has completed,
 * the keys will be stored in state.keys.
 *
 * To use this function to update a UI while generating a key or to prevent
 * causing browser lockups/warnings, set "n" to a value other than 0. A
 * simple pattern for generating a key and showing a progress indicator is:
 *
 * var state = pki.rsa.createKeyPairGenerationState(2048);
 * var step = function() {
 *   // step key-generation, run algorithm for 100 ms, repeat
 *   if(!forge.pki.rsa.stepKeyPairGenerationState(state, 100)) {
 *     setTimeout(step, 1);
 *   }
 *   // key-generation complete
 *   else {
 *     // TODO: turn off progress indicator here
 *     // TODO: use the generated key-pair in "state.keys"
 *   }
 * };
 * // TODO: turn on progress indicator here
 * setTimeout(step, 0);
 *
 * @param state the state to use.
 * @param n the maximum number of milliseconds to run the algorithm for, 0
 *          to run the algorithm to completion.
 *
 * @return true if the key-generation completed, false if not.
 */
pki.rsa.stepKeyPairGenerationState = function(state, n) {
  // do key generation (based on Tom Wu's rsa.js, see jsbn.js license)
  // with some minor optimizations and designed to run in steps

  // local state vars
  var THIRTY = new BigInteger(null);
  THIRTY.fromInt(30);
  var deltaIdx = 0;
  var op_or = function(x,y) { return x|y; };

  // keep stepping until time limit is reached or done
  var t1 = +new Date();
  var t2;
  var total = 0;
  while(state.keys === null && (n <= 0 || total < n)) {
    // generate p or q
    if(state.state === 0) {
      /* Note: All primes are of the form:

        30k+i, for i < 30 and gcd(30, i)=1, where there are 8 values for i

        When we generate a random number, we always align it at 30k + 1. Each
        time the number is determined not to be prime we add to get to the
        next 'i', eg: if the number was at 30k + 1 we add 6. */
      var bits = (state.p === null) ? state.pBits : state.qBits;
      var bits1 = bits - 1;

      // get a random number
      if(state.pqState === 0) {
        state.num = new BigInteger(bits, state.rng);
        // force MSB set
        if(!state.num.testBit(bits1)) {
          state.num.bitwiseTo(
            BigInteger.ONE.shiftLeft(bits1), op_or, state.num);
        }
        // align number on 30k+1 boundary
        state.num.dAddOffset(31 - state.num.mod(THIRTY).byteValue(), 0);
        deltaIdx = 0;

        ++state.pqState;
      }
      // try to make the number a prime
      else if(state.pqState === 1) {
        // overflow, try again
        if(state.num.bitLength() > bits) {
          state.pqState = 0;
        }
        // do primality test
        else if(state.num.isProbablePrime(1)) {
          ++state.pqState;
        }
        else {
          // get next potential prime
          state.num.dAddOffset(GCD_30_DELTA[deltaIdx++ % 8], 0);
        }
      }
      // ensure number is coprime with e
      else if(state.pqState === 2) {
        state.pqState =
          (state.num.subtract(BigInteger.ONE).gcd(state.e)
          .compareTo(BigInteger.ONE) === 0) ? 3 : 0;
      }
      // ensure number is a probable prime
      else if(state.pqState === 3) {
        state.pqState = 0;
        if(state.num.isProbablePrime(10)) {
          if(state.p === null) {
            state.p = state.num;
          }
          else {
            state.q = state.num;
          }

          // advance state if both p and q are ready
          if(state.p !== null && state.q !== null) {
            ++state.state;
          }
        }
        state.num = null;
      }
    }
    // ensure p is larger than q (swap them if not)
    else if(state.state === 1) {
      if(state.p.compareTo(state.q) < 0) {
        state.num = state.p;
        state.p = state.q;
        state.q = state.num;
      }
      ++state.state;
    }
    // compute phi: (p - 1)(q - 1) (Euler's totient function)
    else if(state.state === 2) {
      state.p1 = state.p.subtract(BigInteger.ONE);
      state.q1 = state.q.subtract(BigInteger.ONE);
      state.phi = state.p1.multiply(state.q1);
      ++state.state;
    }
    // ensure e and phi are coprime
    else if(state.state === 3) {
      if(state.phi.gcd(state.e).compareTo(BigInteger.ONE) === 0) {
        // phi and e are coprime, advance
        ++state.state;
      }
      else {
        // phi and e aren't coprime, so generate a new p and q
        state.p = null;
        state.q = null;
        state.state = 0;
      }
    }
    // create n, ensure n is has the right number of bits
    else if(state.state === 4) {
      state.n = state.p.multiply(state.q);

      // ensure n is right number of bits
      if(state.n.bitLength() === state.bits) {
        // success, advance
        ++state.state;
      }
      else {
        // failed, get new q
        state.q = null;
        state.state = 0;
      }
    }
    // set keys
    else if(state.state === 5) {
      var d = state.e.modInverse(state.phi);
      state.keys = {
        privateKey: forge.pki.rsa.setPrivateKey(
          state.n, state.e, d, state.p, state.q,
          d.mod(state.p1), d.mod(state.q1),
          state.q.modInverse(state.p)),
        publicKey: forge.pki.rsa.setPublicKey(state.n, state.e)
      };
    }

    // update timing
    t2 = +new Date();
    total += t2 - t1;
    t1 = t2;
  }

  return state.keys !== null;
};

/**
 * Generates an RSA public-private key pair in a single call.
 *
 * To generate a key-pair in steps (to allow for progress updates and to
 * prevent blocking or warnings in slow browsers) then use the key-pair
 * generation state functions.
 *
 * To generate a key-pair asynchronously (either through web-workers, if
 * available, or by breaking up the work on the main thread), pass a
 * callback function.
 *
 * @param [bits] the size for the private key in bits, defaults to 1024.
 * @param [e] the public exponent to use, defaults to 65537.
 * @param [options] options for key-pair generation, if given then 'bits'
 *          and 'e' must *not* be given:
 *          bits the size for the private key in bits, (default: 1024).
 *          e the public exponent to use, (default: 65537 (0x10001)).
 *          workerScript the worker script URL.
 *          workers the number of web workers (if supported) to use,
 *            (default: 2).
 *          workLoad the size of the work load, ie: number of possible prime
 *            numbers for each web worker to check per work assignment,
 *            (default: 100).
 *          e the public exponent to use, defaults to 65537.
 * @param [callback(err, keypair)] called once the operation completes.
 *
 * @return an object with privateKey and publicKey properties.
 */
pki.rsa.generateKeyPair = function(bits, e, options, callback) {
  // (bits), (options), (callback)
  if(arguments.length === 1) {
    if(typeof bits === 'object') {
      options = bits;
      bits = undefined;
    }
    else if(typeof bits === 'function') {
      callback = bits;
      bits = undefined;
    }
  }
  // (bits, options), (bits, callback), (options, callback)
  else if(arguments.length === 2) {
    if(typeof bits === 'number') {
      if(typeof e === 'function') {
        callback = e;
      }
      else {
        options = e;
      }
    }
    else {
      options = bits;
      callback = e;
      bits = undefined;
    }
    e = undefined;
  }
  // (bits, e, options), (bits, e, callback), (bits, options, callback)
  else if(arguments.length === 3) {
    if(typeof e === 'number') {
      if(typeof options === 'function') {
        callback = options;
        options = undefined;
      }
    }
    else {
      callback = options;
      options = e;
      e = undefined;
    }
  }
  options = options || {};
  if(bits === undefined) {
    bits = options.bits || 1024;
  }
  if(e === undefined) {
    e = options.e || 0x10001;
  }
  var state = pki.rsa.createKeyPairGenerationState(bits, e);
  if(!callback) {
    pki.rsa.stepKeyPairGenerationState(state, 0);
    return state.keys;
  }
  _generateKeyPair(state, options, callback);
};

/**
 * Sets an RSA public key from BigIntegers modulus and exponent.
 *
 * @param n the modulus.
 * @param e the exponent.
 *
 * @return the public key.
 */
pki.rsa.setPublicKey = function(n, e) {
  var key = {
    n: n,
    e: e
  };

  /**
   * Encrypts the given data with this public key. Newer applications
   * should use the 'RSA-OAEP' decryption scheme, 'RSAES-PKCS1-V1_5' is for
   * legacy applications.
   *
   * @param data the byte string to encrypt.
   * @param scheme the encryption scheme to use:
   *          'RSAES-PKCS1-V1_5' (default),
   *          'RSA-OAEP',
   *          'RAW', 'NONE', or null to perform raw RSA encryption.
   * @param schemeOptions any scheme-specific options.
   *
   * @return the encrypted byte string.
   */
  key.encrypt = function(data, scheme, schemeOptions) {
    if(typeof scheme === 'string') {
      scheme = scheme.toUpperCase();
    }
    else if(scheme === undefined) {
      scheme = 'RSAES-PKCS1-V1_5';
    }

    if(scheme === 'RSAES-PKCS1-V1_5') {
      scheme = {
        encode: function(m, key, pub) {
          return _encodePkcs1_v1_5(m, key, 0x02).getBytes();
        }
      };
    }
    else if(scheme === 'RSA-OAEP' || scheme === 'RSAES-OAEP') {
      scheme = {
        encode: function(m, key) {
          return forge.pkcs1.encode_rsa_oaep(key, m, schemeOptions);
        }
      };
    }
    else if(['RAW', 'NONE', 'NULL', null].indexOf(scheme) !== -1) {
      scheme = { encode: function(e) { return e; } };
    }
    else {
      throw {
        message: 'Unsupported encryption scheme: "' + scheme + '".'
      };
    }

    // do scheme-based encoding then rsa encryption
    var e = scheme.encode(data, key, true);
    return pki.rsa.encrypt(e, key, true);
  };

  /**
   * Verifies the given signature against the given digest.
   *
   * PKCS#1 supports multiple (currently two) signature schemes:
   * RSASSA-PKCS1-V1_5 and RSASSA-PSS.
   *
   * By default this implementation uses the "old scheme", i.e.
   * RSASSA-PKCS1-V1_5, in which case once RSA-decrypted, the
   * signature is an OCTET STRING that holds a DigestInfo.
   *
   * DigestInfo ::= SEQUENCE {
   *   digestAlgorithm DigestAlgorithmIdentifier,
   *   digest Digest
   * }
   * DigestAlgorithmIdentifier ::= AlgorithmIdentifier
   * Digest ::= OCTET STRING
   *
   * To perform PSS signature verification, provide an instance
   * of Forge PSS object as the scheme parameter.
   *
   * @param digest the message digest hash to compare against the signature.
   * @param signature the signature to verify.
   * @param scheme signature verification scheme to use:
   *          'RSASSA-PKCS1-V1_5' or undefined for RSASSA PKCS#1 v1.5,
   *          a Forge PSS object for RSASSA-PSS,
   *          'NONE' or null for none, DigestInfo will not be expected, but
   *            PKCS#1 v1.5 padding will still be used.
   *
   * @return true if the signature was verified, false if not.
   */
   key.verify = function(digest, signature, scheme) {
     if(typeof scheme === 'string') {
       scheme = scheme.toUpperCase();
     }
     else if(scheme === undefined) {
       scheme = 'RSASSA-PKCS1-V1_5';
     }

     if(scheme === 'RSASSA-PKCS1-V1_5') {
       scheme = {
         verify: function(digest, d) {
           // remove padding
           d = _decodePkcs1_v1_5(d, key, true);
           // d is ASN.1 BER-encoded DigestInfo
           var obj = asn1.fromDer(d);
           // compare the given digest to the decrypted one
           return digest === obj.value[1].value;
         }
       };
     }
     else if(scheme === 'NONE' || scheme === 'NULL' || scheme === null) {
       scheme = {
         verify: function(digest, d) {
           // remove padding
           d = _decodePkcs1_v1_5(d, key, true);
           return digest === d;
         }
       };
     }

     // do rsa decryption w/o any decoding, then verify -- which does decoding
     var d = pki.rsa.decrypt(signature, key, true, false);
     return scheme.verify(digest, d, key.n.bitLength());
  };

  return key;
};

/**
 * Sets an RSA private key from BigIntegers modulus, exponent, primes,
 * prime exponents, and modular multiplicative inverse.
 *
 * @param n the modulus.
 * @param e the public exponent.
 * @param d the private exponent ((inverse of e) mod n).
 * @param p the first prime.
 * @param q the second prime.
 * @param dP exponent1 (d mod (p-1)).
 * @param dQ exponent2 (d mod (q-1)).
 * @param qInv ((inverse of q) mod p)
 *
 * @return the private key.
 */
pki.rsa.setPrivateKey = function(n, e, d, p, q, dP, dQ, qInv) {
  var key = {
    n: n,
    e: e,
    d: d,
    p: p,
    q: q,
    dP: dP,
    dQ: dQ,
    qInv: qInv
  };

  /**
   * Decrypts the given data with this private key. The decryption scheme
   * must match the one used to encrypt the data.
   *
   * @param data the byte string to decrypt.
   * @param scheme the decryption scheme to use:
   *          'RSAES-PKCS1-V1_5' (default),
   *          'RSA-OAEP',
   *          'RAW', 'NONE', or null to perform raw RSA decryption.
   * @param schemeOptions any scheme-specific options.
   *
   * @return the decrypted byte string.
   */
  key.decrypt = function(data, scheme, schemeOptions) {
    if(typeof scheme === 'string') {
      scheme = scheme.toUpperCase();
    }
    else if(scheme === undefined) {
      scheme = 'RSAES-PKCS1-V1_5';
    }

    // do rsa decryption w/o any decoding
    var d = pki.rsa.decrypt(data, key, false, false);

    if(scheme === 'RSAES-PKCS1-V1_5') {
      scheme = { decode: _decodePkcs1_v1_5 };
    }
    else if(scheme === 'RSA-OAEP' || scheme === 'RSAES-OAEP') {
      scheme = {
        decode: function(d, key) {
          return forge.pkcs1.decode_rsa_oaep(key, d, schemeOptions);
        }
      };
    }
    else if(['RAW', 'NONE', 'NULL', null].indexOf(scheme) !== -1) {
      scheme = { decode: function(d) { return d; } };
    }
    else {
      throw {
        message: 'Unsupported encryption scheme: "' + scheme + '".'
      };
    }

    // decode according to scheme
    return scheme.decode(d, key, false);
  };

  /**
   * Signs the given digest, producing a signature.
   *
   * PKCS#1 supports multiple (currently two) signature schemes:
   * RSASSA-PKCS1-V1_5 and RSASSA-PSS.
   *
   * By default this implementation uses the "old scheme", i.e.
   * RSASSA-PKCS1-V1_5. In order to generate a PSS signature, provide
   * an instance of Forge PSS object as the scheme parameter.
   *
   * @param md the message digest object with the hash to sign.
   * @param scheme the signature scheme to use:
   *          'RSASSA-PKCS1-V1_5' or undefined for RSASSA PKCS#1 v1.5,
   *          a Forge PSS object for RSASSA-PSS,
   *          'NONE' or null for none, DigestInfo will not be used but
   *            PKCS#1 v1.5 padding will still be used.
   *
   * @return the signature as a byte string.
   */
  key.sign = function(md, scheme) {
    /* Note: The internal implementation of RSA operations is being
      transitioned away from a PKCS#1 v1.5 hard-coded scheme. Some legacy
      code like the use of an encoding block identifier 'bt' will eventually
      be removed. */

    // private key operation
    var bt = false;

    if(typeof scheme === 'string') {
      scheme = scheme.toUpperCase();
    }

    if(scheme === undefined || scheme === 'RSASSA-PKCS1-V1_5') {
      scheme = { encode: emsaPkcs1v15encode };
      bt = 0x01;
    }
    else if(scheme === 'NONE' || scheme === 'NULL' || scheme === null) {
      scheme = { encode: function() { return md; } };
      bt = 0x01;
    }

    // encode and then encrypt
    var d = scheme.encode(md, key.n.bitLength());
    return pki.rsa.encrypt(d, key, bt);
  };

  return key;
};

/**
 * Encodes a message using PKCS#1 v1.5 padding.
 *
 * @param m the message to encode.
 * @param key the RSA key to use.
 * @param bt the block type to use, i.e. either 0x01 (for signing) or 0x02
 *          (for encryption).
 *
 * @return the padded byte buffer.
 */
function _encodePkcs1_v1_5(m, key, bt) {
  var eb = forge.util.createBuffer();

  // get the length of the modulus in bytes
  var k = Math.ceil(key.n.bitLength() / 8);

  /* use PKCS#1 v1.5 padding */
  if(m.length > (k - 11)) {
    throw {
      message: 'Message is too long for PKCS#1 v1.5 padding.',
      length: m.length,
      max: (k - 11)
    };
  }

  /* A block type BT, a padding string PS, and the data D shall be
    formatted into an octet string EB, the encryption block:

    EB = 00 || BT || PS || 00 || D

    The block type BT shall be a single octet indicating the structure of
    the encryption block. For this version of the document it shall have
    value 00, 01, or 02. For a private-key operation, the block type
    shall be 00 or 01. For a public-key operation, it shall be 02.

    The padding string PS shall consist of k-3-||D|| octets. For block
    type 00, the octets shall have value 00; for block type 01, they
    shall have value FF; and for block type 02, they shall be
    pseudorandomly generated and nonzero. This makes the length of the
    encryption block EB equal to k. */

  // build the encryption block
  eb.putByte(0x00);
  eb.putByte(bt);

  // create the padding
  var padNum = k - 3 - m.length;
  var padByte;
  // private key op
  if(bt === 0x00 || bt === 0x01) {
    padByte = (bt === 0x00) ? 0x00 : 0xFF;
    for(var i = 0; i < padNum; ++i) {
      eb.putByte(padByte);
    }
  }
  // public key op
  else {
    for(var i = 0; i < padNum; ++i) {
      padByte = Math.floor(Math.random() * 255) + 1;
      eb.putByte(padByte);
    }
  }

  // zero followed by message
  eb.putByte(0x00);
  eb.putBytes(m);

  return eb;
}

/**
 * Decodes a message using PKCS#1 v1.5 padding.
 *
 * @param em the message to decode.
 * @param key the RSA key to use.
 * @param pub true if the key is a public key, false if it is private.
 * @param ml the message length, if specified.
 *
 * @return the decoded bytes.
 */
function _decodePkcs1_v1_5(em, key, pub, ml) {
  // get the length of the modulus in bytes
  var k = Math.ceil(key.n.bitLength() / 8);

  /* It is an error if any of the following conditions occurs:

    1. The encryption block EB cannot be parsed unambiguously.
    2. The padding string PS consists of fewer than eight octets
      or is inconsisent with the block type BT.
    3. The decryption process is a public-key operation and the block
      type BT is not 00 or 01, or the decryption process is a
      private-key operation and the block type is not 02.
   */

  // parse the encryption block
  var eb = forge.util.createBuffer(em);
  var first = eb.getByte();
  var bt = eb.getByte();
  if(first !== 0x00 ||
    (pub && bt !== 0x00 && bt !== 0x01) ||
    (!pub && bt != 0x02) ||
    (pub && bt === 0x00 && typeof(ml) === 'undefined')) {
    throw {
      message: 'Encryption block is invalid.'
    };
  }

  var padNum = 0;
  if(bt === 0x00) {
    // check all padding bytes for 0x00
    padNum = k - 3 - ml;
    for(var i = 0; i < padNum; ++i) {
      if(eb.getByte() !== 0x00) {
        throw {
          message: 'Encryption block is invalid.'
        };
      }
    }
  }
  else if(bt === 0x01) {
    // find the first byte that isn't 0xFF, should be after all padding
    padNum = 0;
    while(eb.length() > 1) {
      if(eb.getByte() !== 0xFF) {
        --eb.read;
        break;
      }
      ++padNum;
    }
  }
  else if(bt === 0x02) {
    // look for 0x00 byte
    padNum = 0;
    while(eb.length() > 1) {
      if(eb.getByte() === 0x00) {
        --eb.read;
        break;
      }
      ++padNum;
    }
  }

  // zero must be 0x00 and padNum must be (k - 3 - message length)
  var zero = eb.getByte();
  if(zero !== 0x00 || padNum !== (k - 3 - eb.length())) {
    throw {
      message: 'Encryption block is invalid.'
    };
  }

  return eb.getBytes();
}

/**
 * Runs the key-generation algorithm asynchronously, either in the background
 * via Web Workers, or using the main thread and setImmediate.
 *
 * @param state the key-pair generation state.
 * @param [options] options for key-pair generation:
 *          workerScript the worker script URL.
 *          workers the number of web workers (if supported) to use,
 *            (default: 2).
 *          workLoad the size of the work load, ie: number of possible prime
 *            numbers for each web worker to check per work assignment,
 *            (default: 100).
 * @param callback(err, keypair) called once the operation completes.
 */
function _generateKeyPair(state, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }

  // web workers unavailable, use setImmediate
  if(typeof(Worker) === 'undefined') {
    function step() {
      // 10 ms gives 5ms of leeway for other calculations before dropping
      // below 60fps (1000/60 == 16.67), but in reality, the number will
      // likely be higher due to an 'atomic' big int modPow
      if(forge.pki.rsa.stepKeyPairGenerationState(state, 10)) {
        return callback(null, state.keys);
      }
      forge.util.setImmediate(step);
    }
    return step();
  }

  // use web workers to generate keys
  var numWorkers = options.workers || 2;
  var workLoad = options.workLoad || 100;
  var range = workLoad * 30/8;
  var workerScript = options.workerScript || 'forge/prime.worker.js';
  var THIRTY = new BigInteger(null);
  THIRTY.fromInt(30);
  var op_or = function(x,y) { return x|y; };
  generate();

  function generate() {
    // find p and then q (done in series to simplify setting worker number)
    getPrime(state.pBits, function(err, num) {
      if(err) {
        return callback(err);
      }
      state.p = num;
      getPrime(state.qBits, finish);
    });
  }

  // implement prime number generation using web workers
  function getPrime(bits, callback) {
    // TODO: consider optimizing by starting workers outside getPrime() ...
    // note that in order to clean up they will have to be made internally
    // asynchronous which may actually be slower

    // start workers immediately
    var workers = [];
    for(var i = 0; i < numWorkers; ++i) {
      // FIXME: fix path or use blob URLs
      workers[i] = new Worker(workerScript);
    }
    var running = numWorkers;

    // initialize random number
    var num = generateRandom();

    // listen for requests from workers and assign ranges to find prime
    for(var i = 0; i < numWorkers; ++i) {
      workers[i].addEventListener('message', workerMessage);
    }

    /* Note: The distribution of random numbers is unknown. Therefore, each
    web worker is continuously allocated a range of numbers to check for a
    random number until one is found.

    Every 30 numbers will be checked just 8 times, because prime numbers
    have the form:

    30k+i, for i < 30 and gcd(30, i)=1 (there are 8 values of i for this)

    Therefore, if we want a web worker to run N checks before asking for
    a new range of numbers, each range must contain N*30/8 numbers.

    For 100 checks (workLoad), this is a range of 375. */

    function generateRandom() {
      var bits1 = bits - 1;
      var num = new BigInteger(bits, state.rng);
      // force MSB set
      if(!num.testBit(bits1)) {
        num.bitwiseTo(BigInteger.ONE.shiftLeft(bits1), op_or, num);
      }
      // align number on 30k+1 boundary
      num.dAddOffset(31 - num.mod(THIRTY).byteValue(), 0);
      return num;
    }

    var found = false;
    function workerMessage(e) {
      // ignore message, prime already found
      if(found) {
        return;
      }

      --running;
      var data = e.data;
      if(data.found) {
        // terminate all workers
        for(var i = 0; i < workers.length; ++i) {
          workers[i].terminate();
        }
        found = true;
        return callback(null, new BigInteger(data.prime, 16));
      }

      // overflow, regenerate prime
      if(num.bitLength() > bits) {
        num = generateRandom();
      }

      // assign new range to check
      var hex = num.toString(16);

      // start prime search
      e.target.postMessage({
        e: state.eInt,
        hex: hex,
        workLoad: workLoad
      });

      num.dAddOffset(range, 0);
    }
  }

  function finish(err, num) {
    // set q
    state.q = num;

    // ensure p is larger than q (swap them if not)
    if(state.p.compareTo(state.q) < 0) {
      var tmp = state.p;
      state.p = state.q;
      state.q = tmp;
    }

    // compute phi: (p - 1)(q - 1) (Euler's totient function)
    state.p1 = state.p.subtract(BigInteger.ONE);
    state.q1 = state.q.subtract(BigInteger.ONE);
    state.phi = state.p1.multiply(state.q1);

    // ensure e and phi are coprime
    if(state.phi.gcd(state.e).compareTo(BigInteger.ONE) !== 0) {
      // phi and e aren't coprime, so generate a new p and q
      state.p = state.q = null;
      generate();
      return;
    }

    // create n, ensure n is has the right number of bits
    state.n = state.p.multiply(state.q);
    if(state.n.bitLength() !== state.bits) {
      // failed, get new q
      state.q = null;
      getPrime(state.qBits, finish);
      return;
    }

    // set keys
    var d = state.e.modInverse(state.phi);
    state.keys = {
      privateKey: forge.pki.rsa.setPrivateKey(
        state.n, state.e, d, state.p, state.q,
        d.mod(state.p1), d.mod(state.q1),
        state.q.modInverse(state.p)),
      publicKey: forge.pki.rsa.setPublicKey(state.n, state.e)
    };

    callback(null, state.keys);
  }
}

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'rsa';
var deps = ['./asn1', './oids', './random', './util', './jsbn', './pkcs1'];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();
/**
 * Javascript implementation of a basic Public Key Infrastructure, including
 * support for RSA public and private keys.
 *
 * @author Dave Longley
 * @author Stefan Siegl <stesie@brokenpipe.de>
 *
 * Copyright (c) 2010-2013 Digital Bazaar, Inc.
 * Copyright (c) 2012 Stefan Siegl <stesie@brokenpipe.de>
 *
 * The ASN.1 representation of an X.509v3 certificate is as follows
 * (see RFC 2459):
 *
 * Certificate ::= SEQUENCE {
 *   tbsCertificate       TBSCertificate,
 *   signatureAlgorithm   AlgorithmIdentifier,
 *   signatureValue       BIT STRING
 * }
 *
 * TBSCertificate ::= SEQUENCE {
 *   version         [0]  EXPLICIT Version DEFAULT v1,
 *   serialNumber         CertificateSerialNumber,
 *   signature            AlgorithmIdentifier,
 *   issuer               Name,
 *   validity             Validity,
 *   subject              Name,
 *   subjectPublicKeyInfo SubjectPublicKeyInfo,
 *   issuerUniqueID  [1]  IMPLICIT UniqueIdentifier OPTIONAL,
 *                        -- If present, version shall be v2 or v3
 *   subjectUniqueID [2]  IMPLICIT UniqueIdentifier OPTIONAL,
 *                        -- If present, version shall be v2 or v3
 *   extensions      [3]  EXPLICIT Extensions OPTIONAL
 *                        -- If present, version shall be v3
 * }
 *
 * Version ::= INTEGER  { v1(0), v2(1), v3(2) }
 *
 * CertificateSerialNumber ::= INTEGER
 *
 * Name ::= CHOICE {
 *   // only one possible choice for now
 *   RDNSequence
 * }
 *
 * RDNSequence ::= SEQUENCE OF RelativeDistinguishedName
 *
 * RelativeDistinguishedName ::= SET OF AttributeTypeAndValue
 *
 * AttributeTypeAndValue ::= SEQUENCE {
 *   type     AttributeType,
 *   value    AttributeValue
 * }
 * AttributeType ::= OBJECT IDENTIFIER
 * AttributeValue ::= ANY DEFINED BY AttributeType
 *
 * Validity ::= SEQUENCE {
 *   notBefore      Time,
 *   notAfter       Time
 * }
 *
 * Time ::= CHOICE {
 *   utcTime        UTCTime,
 *   generalTime    GeneralizedTime
 * }
 *
 * UniqueIdentifier ::= BIT STRING
 *
 * SubjectPublicKeyInfo ::= SEQUENCE {
 *   algorithm            AlgorithmIdentifier,
 *   subjectPublicKey     BIT STRING
 * }
 *
 * Extensions ::= SEQUENCE SIZE (1..MAX) OF Extension
 *
 * Extension ::= SEQUENCE {
 *   extnID      OBJECT IDENTIFIER,
 *   critical    BOOLEAN DEFAULT FALSE,
 *   extnValue   OCTET STRING
 * }
 *
 * The only algorithm currently supported for PKI is RSA.
 *
 * An RSA key is often stored in ASN.1 DER format. The SubjectPublicKeyInfo
 * ASN.1 structure is composed of an algorithm of type AlgorithmIdentifier
 * and a subjectPublicKey of type bit string.
 *
 * The AlgorithmIdentifier contains an Object Identifier (OID) and parameters
 * for the algorithm, if any. In the case of RSA, there aren't any.
 *
 * SubjectPublicKeyInfo ::= SEQUENCE {
 *   algorithm AlgorithmIdentifier,
 *   subjectPublicKey BIT STRING
 * }
 *
 * AlgorithmIdentifer ::= SEQUENCE {
 *   algorithm OBJECT IDENTIFIER,
 *   parameters ANY DEFINED BY algorithm OPTIONAL
 * }
 *
 * For an RSA public key, the subjectPublicKey is:
 *
 * RSAPublicKey ::= SEQUENCE {
 *   modulus            INTEGER,    -- n
 *   publicExponent     INTEGER     -- e
 * }
 *
 * PrivateKeyInfo ::= SEQUENCE {
 *   version                   Version,
 *   privateKeyAlgorithm       PrivateKeyAlgorithmIdentifier,
 *   privateKey                PrivateKey,
 *   attributes           [0]  IMPLICIT Attributes OPTIONAL
 * }
 *
 * Version ::= INTEGER
 * PrivateKeyAlgorithmIdentifier ::= AlgorithmIdentifier
 * PrivateKey ::= OCTET STRING
 * Attributes ::= SET OF Attribute
 *
 * EncryptedPrivateKeyInfo ::= SEQUENCE {
 *   encryptionAlgorithm  EncryptionAlgorithmIdentifier,
 *   encryptedData        EncryptedData
 * }
 *
 * EncryptionAlgorithmIdentifier ::= AlgorithmIdentifier
 * EncryptedData ::= OCTET STRING
 *
 * An RSA private key as the following structure:
 *
 * RSAPrivateKey ::= SEQUENCE {
 *   version Version,
 *   modulus INTEGER, -- n
 *   publicExponent INTEGER, -- e
 *   privateExponent INTEGER, -- d
 *   prime1 INTEGER, -- p
 *   prime2 INTEGER, -- q
 *   exponent1 INTEGER, -- d mod (p-1)
 *   exponent2 INTEGER, -- d mod (q-1)
 *   coefficient INTEGER -- (inverse of q) mod p
 * }
 *
 * Version ::= INTEGER
 *
 * The OID for the RSA key algorithm is: 1.2.840.113549.1.1.1
 *
 * An EncryptedPrivateKeyInfo:
 *
 * EncryptedPrivateKeyInfo ::= SEQUENCE {
 *   encryptionAlgorithm  EncryptionAlgorithmIdentifier,
 *   encryptedData        EncryptedData }
 *
 * EncryptionAlgorithmIdentifier ::= AlgorithmIdentifier
 *
 * EncryptedData ::= OCTET STRING
 *
 * RSASSA-PSS signatures are described in RFC 3447 and RFC 4055.
 *
 * PKCS#10 v1.7 describes certificate signing requests:
 *
 * CertificationRequestInfo:
 *
 * CertificationRequestInfo ::= SEQUENCE {
 *   version       INTEGER { v1(0) } (v1,...),
 *   subject       Name,
 *   subjectPKInfo SubjectPublicKeyInfo{{ PKInfoAlgorithms }},
 *   attributes    [0] Attributes{{ CRIAttributes }}
 * }
 *
 * Attributes { ATTRIBUTE:IOSet } ::= SET OF Attribute{{ IOSet }}
 *
 * CRIAttributes  ATTRIBUTE  ::= {
 *   ... -- add any locally defined attributes here -- }
 *
 * Attribute { ATTRIBUTE:IOSet } ::= SEQUENCE {
 *   type   ATTRIBUTE.&id({IOSet}),
 *   values SET SIZE(1..MAX) OF ATTRIBUTE.&Type({IOSet}{@type})
 * }
 *
 * CertificationRequest ::= SEQUENCE {
 *   certificationRequestInfo CertificationRequestInfo,
 *   signatureAlgorithm AlgorithmIdentifier{{ SignatureAlgorithms }},
 *   signature          BIT STRING
 * }
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

if(typeof BigInteger === 'undefined') {
  BigInteger = forge.jsbn.BigInteger;
}

// shortcut for asn.1 API
var asn1 = forge.asn1;

/* Public Key Infrastructure (PKI) implementation. */
var pki = forge.pki = forge.pki || {};
var oids = pki.oids;

pki.pbe = {};

// short name OID mappings
var _shortNames = {};
_shortNames['CN'] = oids['commonName'];
_shortNames['commonName'] = 'CN';
_shortNames['C'] = oids['countryName'];
_shortNames['countryName'] = 'C';
_shortNames['L'] = oids['localityName'];
_shortNames['localityName'] = 'L';
_shortNames['ST'] = oids['stateOrProvinceName'];
_shortNames['stateOrProvinceName'] = 'ST';
_shortNames['O'] = oids['organizationName'];
_shortNames['organizationName'] = 'O';
_shortNames['OU'] = oids['organizationalUnitName'];
_shortNames['organizationalUnitName'] = 'OU';
_shortNames['E'] = oids['emailAddress'];
_shortNames['emailAddress'] = 'E';

// validator for an SubjectPublicKeyInfo structure
// Note: Currently only works with an RSA public key
var publicKeyValidator = {
  name: 'SubjectPublicKeyInfo',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  captureAsn1: 'subjectPublicKeyInfo',
  value: [{
    name: 'SubjectPublicKeyInfo.AlgorithmIdentifier',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    value: [{
      name: 'AlgorithmIdentifier.algorithm',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OID,
      constructed: false,
      capture: 'publicKeyOid'
    }]
  }, {
    // subjectPublicKey
    name: 'SubjectPublicKeyInfo.subjectPublicKey',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.BITSTRING,
    constructed: false,
    value: [{
      // RSAPublicKey
      name: 'SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      optional: true,
      captureAsn1: 'rsaPublicKey'
    }]
  }]
};

// validator for an RSA public key
var rsaPublicKeyValidator = {
  // RSAPublicKey
  name: 'RSAPublicKey',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    // modulus (n)
    name: 'RSAPublicKey.modulus',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'publicKeyModulus'
  }, {
    // publicExponent (e)
    name: 'RSAPublicKey.exponent',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'publicKeyExponent'
  }]
};

// validator for an X.509v3 certificate
var x509CertificateValidator = {
  name: 'Certificate',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'Certificate.TBSCertificate',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    captureAsn1: 'tbsCertificate',
    value: [{
      name: 'Certificate.TBSCertificate.version',
      tagClass: asn1.Class.CONTEXT_SPECIFIC,
      type: 0,
      constructed: true,
      optional: true,
      value: [{
        name: 'Certificate.TBSCertificate.version.integer',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.INTEGER,
        constructed: false,
        capture: 'certVersion'
      }]
    }, {
      name: 'Certificate.TBSCertificate.serialNumber',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.INTEGER,
      constructed: false,
      capture: 'certSerialNumber'
    }, {
      name: 'Certificate.TBSCertificate.signature',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: 'Certificate.TBSCertificate.signature.algorithm',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.OID,
        constructed: false,
        capture: 'certinfoSignatureOid'
      }, {
        name: 'Certificate.TBSCertificate.signature.parameters',
        tagClass: asn1.Class.UNIVERSAL,
        optional: true,
        captureAsn1: 'certinfoSignatureParams'
      }]
    }, {
      name: 'Certificate.TBSCertificate.issuer',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      captureAsn1: 'certIssuer'
    }, {
      name: 'Certificate.TBSCertificate.validity',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      // Note: UTC and generalized times may both appear so the capture
      // names are based on their detected order, the names used below
      // are only for the common case, which validity time really means
      // "notBefore" and which means "notAfter" will be determined by order
      value: [{
        // notBefore (Time) (UTC time case)
        name: 'Certificate.TBSCertificate.validity.notBefore (utc)',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.UTCTIME,
        constructed: false,
        optional: true,
        capture: 'certValidity1UTCTime'
      }, {
        // notBefore (Time) (generalized time case)
        name: 'Certificate.TBSCertificate.validity.notBefore (generalized)',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.GENERALIZEDTIME,
        constructed: false,
        optional: true,
        capture: 'certValidity2GeneralizedTime'
      }, {
        // notAfter (Time) (only UTC time is supported)
        name: 'Certificate.TBSCertificate.validity.notAfter (utc)',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.UTCTIME,
        constructed: false,
        optional: true,
        capture: 'certValidity3UTCTime'
      }, {
        // notAfter (Time) (only UTC time is supported)
        name: 'Certificate.TBSCertificate.validity.notAfter (generalized)',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.GENERALIZEDTIME,
        constructed: false,
        optional: true,
        capture: 'certValidity4GeneralizedTime'
      }]
    }, {
      // Name (subject) (RDNSequence)
      name: 'Certificate.TBSCertificate.subject',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      captureAsn1: 'certSubject'
    },
      // SubjectPublicKeyInfo
      publicKeyValidator,
    {
      // issuerUniqueID (optional)
      name: 'Certificate.TBSCertificate.issuerUniqueID',
      tagClass: asn1.Class.CONTEXT_SPECIFIC,
      type: 1,
      constructed: true,
      optional: true,
      value: [{
        name: 'Certificate.TBSCertificate.issuerUniqueID.id',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.BITSTRING,
        constructed: false,
        capture: 'certIssuerUniqueId'
      }]
    }, {
      // subjectUniqueID (optional)
      name: 'Certificate.TBSCertificate.subjectUniqueID',
      tagClass: asn1.Class.CONTEXT_SPECIFIC,
      type: 2,
      constructed: true,
      optional: true,
      value: [{
        name: 'Certificate.TBSCertificate.subjectUniqueID.id',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.BITSTRING,
        constructed: false,
        capture: 'certSubjectUniqueId'
      }]
    }, {
      // Extensions (optional)
      name: 'Certificate.TBSCertificate.extensions',
      tagClass: asn1.Class.CONTEXT_SPECIFIC,
      type: 3,
      constructed: true,
      captureAsn1: 'certExtensions',
      optional: true
    }]
  }, {
    // AlgorithmIdentifier (signature algorithm)
    name: 'Certificate.signatureAlgorithm',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    value: [{
      // algorithm
      name: 'Certificate.signatureAlgorithm.algorithm',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OID,
      constructed: false,
      capture: 'certSignatureOid'
    }, {
      name: 'Certificate.TBSCertificate.signature.parameters',
      tagClass: asn1.Class.UNIVERSAL,
      optional: true,
      captureAsn1: 'certSignatureParams'
    }]
  }, {
    // SignatureValue
    name: 'Certificate.signatureValue',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.BITSTRING,
    constructed: false,
    capture: 'certSignature'
  }]
};

// validator for a PrivateKeyInfo structure
var privateKeyValidator = {
  // PrivateKeyInfo
  name: 'PrivateKeyInfo',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    // Version (INTEGER)
    name: 'PrivateKeyInfo.version',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyVersion'
  }, {
    // privateKeyAlgorithm
    name: 'PrivateKeyInfo.privateKeyAlgorithm',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    value: [{
      name: 'AlgorithmIdentifier.algorithm',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OID,
      constructed: false,
      capture: 'privateKeyOid'
    }]
  }, {
    // PrivateKey
    name: 'PrivateKeyInfo',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.OCTETSTRING,
    constructed: false,
    capture: 'privateKey'
  }]
};

// validator for an RSA private key
var rsaPrivateKeyValidator = {
  // RSAPrivateKey
  name: 'RSAPrivateKey',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    // Version (INTEGER)
    name: 'RSAPrivateKey.version',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyVersion'
  }, {
    // modulus (n)
    name: 'RSAPrivateKey.modulus',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyModulus'
  }, {
    // publicExponent (e)
    name: 'RSAPrivateKey.publicExponent',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyPublicExponent'
  }, {
    // privateExponent (d)
    name: 'RSAPrivateKey.privateExponent',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyPrivateExponent'
  }, {
    // prime1 (p)
    name: 'RSAPrivateKey.prime1',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyPrime1'
  }, {
    // prime2 (q)
    name: 'RSAPrivateKey.prime2',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyPrime2'
  }, {
    // exponent1 (d mod (p-1))
    name: 'RSAPrivateKey.exponent1',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyExponent1'
  }, {
    // exponent2 (d mod (q-1))
    name: 'RSAPrivateKey.exponent2',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyExponent2'
  }, {
    // coefficient ((inverse of q) mod p)
    name: 'RSAPrivateKey.coefficient',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'privateKeyCoefficient'
  }]
};

// validator for an EncryptedPrivateKeyInfo structure
// Note: Currently only works w/algorithm params
var encryptedPrivateKeyValidator = {
  name: 'EncryptedPrivateKeyInfo',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'EncryptedPrivateKeyInfo.encryptionAlgorithm',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    value: [{
      name: 'AlgorithmIdentifier.algorithm',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OID,
      constructed: false,
      capture: 'encryptionOid'
    }, {
      name: 'AlgorithmIdentifier.parameters',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      captureAsn1: 'encryptionParams'
    }]
  }, {
    // encryptedData
    name: 'EncryptedPrivateKeyInfo.encryptedData',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.OCTETSTRING,
    constructed: false,
    capture: 'encryptedData'
  }]
};

// validator for a PBES2Algorithms structure
// Note: Currently only works w/PBKDF2 + AES encryption schemes
var PBES2AlgorithmsValidator = {
  name: 'PBES2Algorithms',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'PBES2Algorithms.keyDerivationFunc',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    value: [{
      name: 'PBES2Algorithms.keyDerivationFunc.oid',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OID,
      constructed: false,
      capture: 'kdfOid'
    }, {
      name: 'PBES2Algorithms.params',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: 'PBES2Algorithms.params.salt',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.OCTETSTRING,
        constructed: false,
        capture: 'kdfSalt'
      }, {
        name: 'PBES2Algorithms.params.iterationCount',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.INTEGER,
        onstructed: true,
        capture: 'kdfIterationCount'
      }]
    }]
  }, {
    name: 'PBES2Algorithms.encryptionScheme',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    value: [{
      name: 'PBES2Algorithms.encryptionScheme.oid',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OID,
      constructed: false,
      capture: 'encOid'
    }, {
      name: 'PBES2Algorithms.encryptionScheme.iv',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OCTETSTRING,
      constructed: false,
      capture: 'encIv'
    }]
  }]
};

var pkcs12PbeParamsValidator = {
  name: 'pkcs-12PbeParams',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'pkcs-12PbeParams.salt',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.OCTETSTRING,
    constructed: false,
    capture: 'salt'
  }, {
    name: 'pkcs-12PbeParams.iterations',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'iterations'
  }]
};

var rsassaPssParameterValidator = {
  name: 'rsapss',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  value: [{
    name: 'rsapss.hashAlgorithm',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    type: 0,
    constructed: true,
    value: [{
      name: 'rsapss.hashAlgorithm.AlgorithmIdentifier',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Class.SEQUENCE,
      constructed: true,
      optional: true,
      value: [{
        name: 'rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.OID,
        constructed: false,
        capture: 'hashOid'
        /* parameter block omitted, for SHA1 NULL anyhow. */
      }]
    }]
  }, {
    name: 'rsapss.maskGenAlgorithm',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    type: 1,
    constructed: true,
    value: [{
      name: 'rsapss.maskGenAlgorithm.AlgorithmIdentifier',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Class.SEQUENCE,
      constructed: true,
      optional: true,
      value: [{
        name: 'rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.OID,
        constructed: false,
        capture: 'maskGenOid'
      }, {
        name: 'rsapss.maskGenAlgorithm.AlgorithmIdentifier.params',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.SEQUENCE,
        constructed: true,
        value: [{
          name: 'rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm',
          tagClass: asn1.Class.UNIVERSAL,
          type: asn1.Type.OID,
          constructed: false,
          capture: 'maskGenHashOid'
          /* parameter block omitted, for SHA1 NULL anyhow. */
        }]
      }]
    }]
  }, {
    name: 'rsapss.saltLength',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    type: 2,
    optional: true,
    value: [{
      name: 'rsapss.saltLength.saltLength',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Class.INTEGER,
      constructed: false,
      capture: 'saltLength'
    }]
  }, {
    name: 'rsapss.trailerField',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    type: 3,
    optional: true,
    value: [{
      name: 'rsapss.trailer.trailer',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Class.INTEGER,
      constructed: false,
      capture: 'trailer'
    }]
  }]
};

// validator for a CertificationRequestInfo structure
var certificationRequestInfoValidator = {
  name: 'CertificationRequestInfo',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  captureAsn1: 'certificationRequestInfo',
  value: [{
    name: 'CertificationRequestInfo.integer',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.INTEGER,
    constructed: false,
    capture: 'certificationRequestInfoVersion'
  }, {
    // Name (subject) (RDNSequence)
    name: 'CertificationRequestInfo.subject',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    captureAsn1: 'certificationRequestInfoSubject'
  },
  // SubjectPublicKeyInfo
  publicKeyValidator,
  {
    name: 'CertificationRequestInfo.attributes',
    tagClass: asn1.Class.CONTEXT_SPECIFIC,
    type: 0,
    constructed: true,
    optional: true,
    capture: 'certificationRequestInfoAttributes',
    value: [{
      name: 'CertificationRequestInfo.attributes',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.SEQUENCE,
      constructed: true,
      value: [{
        name: 'CertificationRequestInfo.attributes.type',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.OID,
        constructed: false
      }, {
        name: 'CertificationRequestInfo.attributes.value',
        tagClass: asn1.Class.UNIVERSAL,
        type: asn1.Type.SET,
        constructed: true
      }]
    }]
  }]
};

// validator for a CertificationRequest structure
var certificationRequestValidator = {
  name: 'CertificationRequest',
  tagClass: asn1.Class.UNIVERSAL,
  type: asn1.Type.SEQUENCE,
  constructed: true,
  captureAsn1: 'csr',
  value: [
    certificationRequestInfoValidator, {
    // AlgorithmIdentifier (signature algorithm)
    name: 'CertificationRequest.signatureAlgorithm',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.SEQUENCE,
    constructed: true,
    value: [{
      // algorithm
      name: 'CertificationRequest.signatureAlgorithm.algorithm',
      tagClass: asn1.Class.UNIVERSAL,
      type: asn1.Type.OID,
      constructed: false,
      capture: 'csrSignatureOid'
    }, {
      name: 'CertificationRequest.signatureAlgorithm.parameters',
      tagClass: asn1.Class.UNIVERSAL,
      optional: true,
      captureAsn1: 'csrSignatureParams'
    }]
  }, {
    // signature
    name: 'CertificationRequest.signature',
    tagClass: asn1.Class.UNIVERSAL,
    type: asn1.Type.BITSTRING,
    constructed: false,
    capture: 'csrSignature'
  }]
};

/**
 * Converts an RDNSequence of ASN.1 DER-encoded RelativeDistinguishedName
 * sets into an array with objects that have type and value properties.
 *
 * @param rdn the RDNSequence to convert.
 * @param md a message digest to append type and value to if provided.
 */
pki.RDNAttributesAsArray = function(rdn, md) {
  var rval = [];

  // each value in 'rdn' in is a SET of RelativeDistinguishedName
  var set, attr, obj;
  for(var si = 0; si < rdn.value.length; ++si) {
    // get the RelativeDistinguishedName set
    set = rdn.value[si];

    // each value in the SET is an AttributeTypeAndValue sequence
    // containing first a type (an OID) and second a value (defined by
    // the OID)
    for(var i = 0; i < set.value.length; ++i) {
      obj = {};
      attr = set.value[i];
      obj.type = asn1.derToOid(attr.value[0].value);
      obj.value = attr.value[1].value;
      obj.valueTagClass = attr.value[1].type;
      // if the OID is known, get its name and short name
      if(obj.type in oids) {
        obj.name = oids[obj.type];
        if(obj.name in _shortNames) {
          obj.shortName = _shortNames[obj.name];
        }
      }
      if(md) {
        md.update(obj.type);
        md.update(obj.value);
      }
      rval.push(obj);
    }
  }

  return rval;
};

/**
 * Converts ASN.1 CRIAttributes into an array with objects that have type and
 * value properties.
 *
 * @param attributes the CRIAttributes to convert.
 */
pki.CRIAttributesAsArray = function(attributes) {
  var rval = [];

  // each value in 'attributes' in is a SEQUENCE with an OID and a SET
  for(var si = 0; si < attributes.length; ++si) {
    // get the attribute sequence
    var seq = attributes[si];

    // each value in the SEQUENCE containing first a type (an OID) and
    // second a set of values (defined by the OID)
    var type = asn1.derToOid(seq.value[0].value);
    var values = seq.value[1].value;
    for(var vi = 0; vi < values.length; ++vi) {
      var obj = {};
      obj.type = type;
      obj.value = values[vi].value;
      obj.valueTagClass = values[vi].type;
      // if the OID is known, get its name and short name
      if(obj.type in oids) {
        obj.name = oids[obj.type];
        if(obj.name in _shortNames) {
          obj.shortName = _shortNames[obj.name];
        }
      }
      rval.push(obj);
    }
  }

  return rval;
};

/**
 * Gets an issuer or subject attribute from its name, type, or short name.
 *
 * @param obj the issuer or subject object.
 * @param options a short name string or an object with:
 *          shortName the short name for the attribute.
 *          name the name for the attribute.
 *          type the type for the attribute.
 *
 * @return the attribute.
 */
var _getAttribute = function(obj, options) {
  if(typeof options === 'string') {
    options = {shortName: options};
  }

  var rval = null;
  var attr;
  for(var i = 0; rval === null && i < obj.attributes.length; ++i) {
    attr = obj.attributes[i];
    if(options.type && options.type === attr.type) {
      rval = attr;
    }
    else if(options.name && options.name === attr.name) {
      rval = attr;
    }
    else if(options.shortName && options.shortName === attr.shortName) {
      rval = attr;
    }
  }
  return rval;
};

/**
 * Converts an ASN.1 extensions object (with extension sequences as its
 * values) into an array of extension objects with types and values.
 *
 * Supported extensions:
 *
 * id-ce-keyUsage OBJECT IDENTIFIER ::=  { id-ce 15 }
 * KeyUsage ::= BIT STRING {
 *   digitalSignature        (0),
 *   nonRepudiation          (1),
 *   keyEncipherment         (2),
 *   dataEncipherment        (3),
 *   keyAgreement            (4),
 *   keyCertSign             (5),
 *   cRLSign                 (6),
 *   encipherOnly            (7),
 *   decipherOnly            (8)
 * }
 *
 * id-ce-basicConstraints OBJECT IDENTIFIER ::=  { id-ce 19 }
 * BasicConstraints ::= SEQUENCE {
 *   cA                      BOOLEAN DEFAULT FALSE,
 *   pathLenConstraint       INTEGER (0..MAX) OPTIONAL
 * }
 *
 * subjectAltName EXTENSION ::= {
 *   SYNTAX GeneralNames
 *   IDENTIFIED BY id-ce-subjectAltName
 * }
 *
 * GeneralNames ::= SEQUENCE SIZE (1..MAX) OF GeneralName
 *
 * GeneralName ::= CHOICE {
 *   otherName      [0] INSTANCE OF OTHER-NAME,
 *   rfc822Name     [1] IA5String,
 *   dNSName        [2] IA5String,
 *   x400Address    [3] ORAddress,
 *   directoryName  [4] Name,
 *   ediPartyName   [5] EDIPartyName,
 *   uniformResourceIdentifier [6] IA5String,
 *   IPAddress      [7] OCTET STRING,
 *   registeredID   [8] OBJECT IDENTIFIER
 * }
 *
 * OTHER-NAME ::= TYPE-IDENTIFIER
 *
 * EDIPartyName ::= SEQUENCE {
 *   nameAssigner [0] DirectoryString {ub-name} OPTIONAL,
 *   partyName    [1] DirectoryString {ub-name}
 * }
 *
 * @param exts the extensions ASN.1 with extension sequences to parse.
 *
 * @return the array.
 */
var _parseExtensions = function(exts) {
  var rval = [];

  var e, ext, extseq;
  for(var i = 0; i < exts.value.length; ++i) {
    // get extension sequence
    extseq = exts.value[i];
    for(var ei = 0; ei < extseq.value.length; ++ei) {
      // an extension has:
      // [0] extnID      OBJECT IDENTIFIER
      // [1] critical    BOOLEAN DEFAULT FALSE
      // [2] extnValue   OCTET STRING
      ext = extseq.value[ei];
      e = {};
      e.id = asn1.derToOid(ext.value[0].value);
      e.critical = false;
      if(ext.value[1].type === asn1.Type.BOOLEAN) {
        e.critical = (ext.value[1].value.charCodeAt(0) !== 0x00);
        e.value = ext.value[2].value;
      }
      else {
        e.value = ext.value[1].value;
      }
      // if the oid is known, get its name
      if(e.id in oids) {
        e.name = oids[e.id];

        // handle key usage
        if(e.name === 'keyUsage') {
          // get value as BIT STRING
          var ev = asn1.fromDer(e.value);
          var b2 = 0x00;
          var b3 = 0x00;
          if(ev.value.length > 1) {
            // skip first byte, just indicates unused bits which
            // will be padded with 0s anyway
            // get bytes with flag bits
            b2 = ev.value.charCodeAt(1);
            b3 = ev.value.length > 2 ? ev.value.charCodeAt(2) : 0;
          }
          // set flags
          e.digitalSignature = (b2 & 0x80) === 0x80;
          e.nonRepudiation = (b2 & 0x40) === 0x40;
          e.keyEncipherment = (b2 & 0x20) === 0x20;
          e.dataEncipherment = (b2 & 0x10) === 0x10;
          e.keyAgreement = (b2 & 0x08) === 0x08;
          e.keyCertSign = (b2 & 0x04) === 0x04;
          e.cRLSign = (b2 & 0x02) === 0x02;
          e.encipherOnly = (b2 & 0x01) === 0x01;
          e.decipherOnly = (b3 & 0x80) === 0x80;
        }
        // handle basic constraints
        else if(e.name === 'basicConstraints') {
          // get value as SEQUENCE
          var ev = asn1.fromDer(e.value);
          // get cA BOOLEAN flag (defaults to false)
          if(ev.value.length > 0) {
            e.cA = (ev.value[0].value.charCodeAt(0) !== 0x00);
          }
          else {
            e.cA = false;
          }
          // get path length constraint
          if(ev.value.length > 1) {
            var tmp = forge.util.createBuffer(ev.value[1].value);
            e.pathLenConstraint = tmp.getInt(tmp.length() << 3);
          }
        }
        // handle extKeyUsage
        else if(e.name === 'extKeyUsage') {
          // value is a SEQUENCE of OIDs
          var ev = asn1.fromDer(e.value);
          for(var vi = 0; vi < ev.value.length; ++vi) {
            var oid = asn1.derToOid(ev.value[vi].value);
            if(oid in oids) {
              e[oids[oid]] = true;
            }
            else {
              e[oid] = true;
            }
          }
        }
        // handle subjectAltName/issuerAltName
        else if(
          e.name === 'subjectAltName' ||
          e.name === 'issuerAltName') {
          e.altNames = [];

          // ev is a SYNTAX SEQUENCE
          var gn;
          var ev = asn1.fromDer(e.value);
          for(var n = 0; n < ev.value.length; ++n) {
            // get GeneralName
            gn = ev.value[n];

            var altName = {
              type: gn.type,
              value: gn.value
            };
            e.altNames.push(altName);

            // Note: Support for types 1,2,6,7,8
            switch(gn.type) {
            // rfc822Name
            case 1:
            // dNSName
            case 2:
            // uniformResourceIdentifier (URI)
            case 6:
              break;
            // IPAddress
            case 7:
              // FIXME: convert to IPv4 dotted string/IPv6
              break;
            // registeredID
            case 8:
              altName.oid = asn1.derToOid(gn.value);
              break;
            default:
              // unsupported
            }
          }
        }
      }
      rval.push(e);
    }
  }

  return rval;
};

/**
 * NOTE: THIS METHOD IS DEPRECATED. Use pem.decode() instead.
 *
 * Converts PEM-formatted data to DER.
 *
 * @param pem the PEM-formatted data.
 *
 * @return the DER-formatted data.
 */
pki.pemToDer = function(pem) {
  var msg = forge.pem.decode(pem)[0];
  if(msg.procType && msg.procType.type === 'ENCRYPTED') {
    throw {
      message: 'Could not convert PEM to DER; PEM is encrypted.'
    };
  }
  return forge.util.createBuffer(msg.body);
};

/**
 * Converts a positive BigInteger into 2's-complement big-endian bytes.
 *
 * @param b the big integer to convert.
 *
 * @return the bytes.
 */
var _bnToBytes = function(b) {
  // prepend 0x00 if first byte >= 0x80
  var hex = b.toString(16);
  if(hex[0] >= '8') {
    hex = '00' + hex;
  }
  return forge.util.hexToBytes(hex);
};

/**
 * Converts signature parameters from ASN.1 structure.
 *
 * Currently only RSASSA-PSS supported.  The PKCS#1 v1.5 signature scheme had
 * no parameters.
 *
 * RSASSA-PSS-params  ::=  SEQUENCE  {
 *   hashAlgorithm      [0] HashAlgorithm DEFAULT
 *                             sha1Identifier,
 *   maskGenAlgorithm   [1] MaskGenAlgorithm DEFAULT
 *                             mgf1SHA1Identifier,
 *   saltLength         [2] INTEGER DEFAULT 20,
 *   trailerField       [3] INTEGER DEFAULT 1
 * }
 *
 * HashAlgorithm  ::=  AlgorithmIdentifier
 *
 * MaskGenAlgorithm  ::=  AlgorithmIdentifier
 *
 * AlgorithmIdentifer ::= SEQUENCE {
 *   algorithm OBJECT IDENTIFIER,
 *   parameters ANY DEFINED BY algorithm OPTIONAL
 * }
 *
 * @param oid The OID specifying the signature algorithm
 * @param obj The ASN.1 structure holding the parameters
 * @param fillDefaults Whether to use return default values where omitted
 * @return signature parameter object
 */
var _readSignatureParameters = function(oid, obj, fillDefaults) {
  var params = {};

  if(oid !== oids['RSASSA-PSS']) {
    return params;
  }

  if(fillDefaults) {
    params = {
      hash: {
        algorithmOid: oids['sha1']
      },
      mgf: {
        algorithmOid: oids['mgf1'],
        hash: {
          algorithmOid: oids['sha1']
        }
      },
      saltLength: 20
    };
  }

  var capture = {};
  var errors = [];
  if(!asn1.validate(obj, rsassaPssParameterValidator, capture, errors)) {
    throw {
      message: 'Cannot read RSASSA-PSS parameter block.',
      errors: errors
    };
  }

  if(capture.hashOid !== undefined) {
    params.hash = params.hash || {};
    params.hash.algorithmOid = asn1.derToOid(capture.hashOid);
  }

  if(capture.maskGenOid !== undefined) {
    params.mgf = params.mgf || {};
    params.mgf.algorithmOid = asn1.derToOid(capture.maskGenOid);
    params.mgf.hash = params.mgf.hash || {};
    params.mgf.hash.algorithmOid = asn1.derToOid(capture.maskGenHashOid);
  }

  if(capture.saltLength !== undefined) {
    params.saltLength = capture.saltLength.charCodeAt(0);
  }

  return params;
};

/**
 * Converts an X.509 certificate from PEM format.
 *
 * Note: If the certificate is to be verified then compute hash should
 * be set to true. This will scan the TBSCertificate part of the ASN.1
 * object while it is converted so it doesn't need to be converted back
 * to ASN.1-DER-encoding later.
 *
 * @param pem the PEM-formatted certificate.
 * @param computeHash true to compute the hash for verification.
 * @param strict true to be strict when checking ASN.1 value lengths, false to
 *          allow truncated values (default: true).
 *
 * @return the certificate.
 */
pki.certificateFromPem = function(pem, computeHash, strict) {
  var msg = forge.pem.decode(pem)[0];

  if(msg.type !== 'CERTIFICATE' &&
    msg.type !== 'X509 CERTIFICATE' &&
    msg.type !== 'TRUSTED CERTIFICATE') {
    throw {
      message: 'Could not convert certificate from PEM; PEM header type is ' +
        'not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".',
      headerType: msg.type
    };
  }
  if(msg.procType && msg.procType.type === 'ENCRYPTED') {
    throw {
      message: 'Could not convert certificate from PEM; PEM is encrypted.'
    };
  }

  // convert DER to ASN.1 object
  var obj = asn1.fromDer(msg.body, strict);

  return pki.certificateFromAsn1(obj, computeHash);
};

/**
 * Converts an X.509 certificate to PEM format.
 *
 * @param cert the certificate.
 * @param maxline the maximum characters per line, defaults to 64.
 *
 * @return the PEM-formatted certificate.
 */
pki.certificateToPem = function(cert, maxline) {
  // convert to ASN.1, then DER, then PEM-encode
  var msg = {
    type: 'CERTIFICATE',
    body: asn1.toDer(pki.certificateToAsn1(cert)).getBytes()
  };
  return forge.pem.encode(msg, {maxline: maxline});
};

/**
 * Converts an RSA public key from PEM format.
 *
 * @param pem the PEM-formatted public key.
 *
 * @return the public key.
 */
pki.publicKeyFromPem = function(pem) {
  var msg = forge.pem.decode(pem)[0];

  if(msg.type !== 'PUBLIC KEY' && msg.type !== 'RSA PUBLIC KEY') {
    throw {
      message: 'Could not convert public key from PEM; PEM header type is ' +
        'not "PUBLIC KEY" or "RSA PUBLIC KEY".',
      headerType: msg.type
    };
  }
  if(msg.procType && msg.procType.type === 'ENCRYPTED') {
    throw {
      message: 'Could not convert public key from PEM; PEM is encrypted.'
    };
  }

  // convert DER to ASN.1 object
  var obj = asn1.fromDer(msg.body);

  return pki.publicKeyFromAsn1(obj);
};

/**
 * Converts an RSA public key to PEM format (using a SubjectPublicKeyInfo).
 *
 * @param key the public key.
 * @param maxline the maximum characters per line, defaults to 64.
 *
 * @return the PEM-formatted public key.
 */
pki.publicKeyToPem = function(key, maxline) {
  // convert to ASN.1, then DER, then PEM-encode
  var msg = {
    type: 'PUBLIC KEY',
    body: asn1.toDer(pki.publicKeyToAsn1(key)).getBytes()
  };
  return forge.pem.encode(msg, {maxline: maxline});
};

/**
 * Converts an RSA public key to PEM format (using an RSAPublicKey).
 *
 * @param key the public key.
 * @param maxline the maximum characters per line, defaults to 64.
 *
 * @return the PEM-formatted public key.
 */
pki.publicKeyToRSAPublicKeyPem = function(key, maxline) {
  // convert to ASN.1, then DER, then PEM-encode
  var msg = {
    type: 'RSA PUBLIC KEY',
    body: asn1.toDer(pki.publicKeyToRSAPublicKey(key)).getBytes()
  };
  return forge.pem.encode(msg, {maxline: maxline});
};

/**
 * Converts an RSA private key from PEM format.
 *
 * @param pem the PEM-formatted private key.
 *
 * @return the private key.
 */
pki.privateKeyFromPem = function(pem) {
  var msg = forge.pem.decode(pem)[0];

  if(msg.type !== 'PRIVATE KEY' && msg.type !== 'RSA PRIVATE KEY') {
    throw {
      message: 'Could not convert private key from PEM; PEM header type is ' +
        'not "PRIVATE KEY" or "RSA PRIVATE KEY".',
      headerType: msg.type
    };
  }
  if(msg.procType && msg.procType.type === 'ENCRYPTED') {
    throw {
      message: 'Could not convert private key from PEM; PEM is encrypted.'
    };
  }

  // convert DER to ASN.1 object
  var obj = asn1.fromDer(msg.body);

  return pki.privateKeyFromAsn1(obj);
};

/**
 * Converts an RSA private key to PEM format.
 *
 * @param key the private key.
 * @param maxline the maximum characters per line, defaults to 64.
 *
 * @return the PEM-formatted private key.
 */
pki.privateKeyToPem = function(key, maxline) {
  // convert to ASN.1, then DER, then PEM-encode
  var msg = {
    type: 'RSA PRIVATE KEY',
    body: asn1.toDer(pki.privateKeyToAsn1(key)).getBytes()
  };
  return forge.pem.encode(msg, {maxline: maxline});
};

/**
 * Converts a PKCS#10 certification request (CSR) from PEM format.
 *
 * Note: If the certification request is to be verified then compute hash
 * should be set to true. This will scan the CertificationRequestInfo part of
 * the ASN.1 object while it is converted so it doesn't need to be converted
 * back to ASN.1-DER-encoding later.
 *
 * @param pem the PEM-formatted certificate.
 * @param computeHash true to compute the hash for verification.
 * @param strict true to be strict when checking ASN.1 value lengths, false to
 *          allow truncated values (default: true).
 *
 * @return the certification request (CSR).
 */
pki.certificationRequestFromPem = function(pem, computeHash, strict) {
  var msg = forge.pem.decode(pem)[0];

  if(msg.type !== 'CERTIFICATE REQUEST') {
    throw {
      message: 'Could not convert certification request from PEM; PEM header ' +
        'type is not "CERTIFICATE REQUEST".',
      headerType: msg.type
    };
  }
  if(msg.procType && msg.procType.type === 'ENCRYPTED') {
    throw {
      message: 'Could not convert certification request from PEM; ' +
        'PEM is encrypted.'
    };
  }

  // convert DER to ASN.1 object
  var obj = asn1.fromDer(msg.body, strict);

  return pki.certificationRequestFromAsn1(obj, computeHash);
};

/**
 * Converts a PKCS#10 certification request (CSR) to PEM format.
 *
 * @param csr the certification request.
 * @param maxline the maximum characters per line, defaults to 64.
 *
 * @return the PEM-formatted certification request.
 */
pki.certificationRequestToPem = function(csr, maxline) {
  // convert to ASN.1, then DER, then PEM-encode
  var msg = {
    type: 'CERTIFICATE REQUEST',
    body: asn1.toDer(pki.certificationRequestToAsn1(csr)).getBytes()
  };
  return forge.pem.encode(msg, {maxline: maxline});
};

/**
 * Creates an empty X.509v3 RSA certificate.
 *
 * @return the certificate.
 */
pki.createCertificate = function() {
  var cert = {};
  cert.version = 0x02;
  cert.serialNumber = '00';
  cert.signatureOid = null;
  cert.signature = null;
  cert.siginfo = {};
  cert.siginfo.algorithmOid = null;
  cert.validity = {};
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();

  cert.issuer = {};
  cert.issuer.getField = function(sn) {
    return _getAttribute(cert.issuer, sn);
  };
  cert.issuer.addField = function(attr) {
    _fillMissingFields([attr]);
    cert.issuer.attributes.push(attr);
  };
  cert.issuer.attributes = [];
  cert.issuer.hash = null;

  cert.subject = {};
  cert.subject.getField = function(sn) {
    return _getAttribute(cert.subject, sn);
  };
  cert.subject.addField = function(attr) {
    _fillMissingFields([attr]);
    cert.subject.attributes.push(attr);
  };
  cert.subject.attributes = [];
  cert.subject.hash = null;

  cert.extensions = [];
  cert.publicKey = null;
  cert.md = null;

  /**
   * Fills in missing fields in attributes.
   *
   * @param attrs the attributes to fill missing fields in.
   */
  var _fillMissingFields = function(attrs) {
    var attr;
    for(var i = 0; i < attrs.length; ++i) {
      attr = attrs[i];

      // populate missing name
      if(typeof(attr.name) === 'undefined') {
        if(attr.type && attr.type in pki.oids) {
          attr.name = pki.oids[attr.type];
        }
        else if(attr.shortName && attr.shortName in _shortNames) {
          attr.name = pki.oids[_shortNames[attr.shortName]];
        }
      }

      // populate missing type (OID)
      if(typeof(attr.type) === 'undefined') {
        if(attr.name && attr.name in pki.oids) {
          attr.type = pki.oids[attr.name];
        }
        else {
          throw {
            message: 'Attribute type not specified.',
            attribute: attr
          };
        }
      }

      // populate missing shortname
      if(typeof(attr.shortName) === 'undefined') {
        if(attr.name && attr.name in _shortNames) {
          attr.shortName = _shortNames[attr.name];
        }
      }

      if(typeof(attr.value) === 'undefined') {
        throw {
          message: 'Attribute value not specified.',
          attribute: attr
        };
      }
    }
  };

  /**
   * Sets the subject of this certificate.
   *
   * @param attrs the array of subject attributes to use.
   * @param uniqueId an optional a unique ID to use.
   */
  cert.setSubject = function(attrs, uniqueId) {
    // set new attributes, clear hash
    _fillMissingFields(attrs);
    cert.subject.attributes = attrs;
    delete cert.subject.uniqueId;
    if(uniqueId) {
      cert.subject.uniqueId = uniqueId;
    }
    cert.subject.hash = null;
  };

  /**
   * Sets the issuer of this certificate.
   *
   * @param attrs the array of issuer attributes to use.
   * @param uniqueId an optional a unique ID to use.
   */
  cert.setIssuer = function(attrs, uniqueId) {
    // set new attributes, clear hash
    _fillMissingFields(attrs);
    cert.issuer.attributes = attrs;
    delete cert.issuer.uniqueId;
    if(uniqueId) {
      cert.issuer.uniqueId = uniqueId;
    }
    cert.issuer.hash = null;
  };

  /**
   * Sets the extensions of this certificate.
   *
   * @param exts the array of extensions to use.
   */
  cert.setExtensions = function(exts) {
    var e;
    for(var i = 0; i < exts.length; ++i) {
      e = exts[i];

      // populate missing name
      if(typeof(e.name) === 'undefined') {
        if(e.id && e.id in pki.oids) {
          e.name = pki.oids[e.id];
        }
      }

      // populate missing id
      if(typeof(e.id) === 'undefined') {
        if(e.name && e.name in pki.oids) {
          e.id = pki.oids[e.name];
        }
        else {
          throw {
            message: 'Extension ID not specified.',
            extension: e
          };
        }
      }

      // handle missing value
      if(typeof(e.value) === 'undefined') {
        // value is a BIT STRING
        if(e.name === 'keyUsage') {
          // build flags
          var unused = 0;
          var b2 = 0x00;
          var b3 = 0x00;
          if(e.digitalSignature) {
            b2 |= 0x80;
            unused = 7;
          }
          if(e.nonRepudiation) {
            b2 |= 0x40;
            unused = 6;
          }
          if(e.keyEncipherment) {
            b2 |= 0x20;
            unused = 5;
          }
          if(e.dataEncipherment) {
            b2 |= 0x10;
            unused = 4;
          }
          if(e.keyAgreement) {
            b2 |= 0x08;
            unused = 3;
          }
          if(e.keyCertSign) {
            b2 |= 0x04;
            unused = 2;
          }
          if(e.cRLSign) {
            b2 |= 0x02;
            unused = 1;
          }
          if(e.encipherOnly) {
            b2 |= 0x01;
            unused = 0;
          }
          if(e.decipherOnly) {
            b3 |= 0x80;
            unused = 7;
          }

          // create bit string
          var value = String.fromCharCode(unused);
          if(b3 !== 0) {
            value += String.fromCharCode(b2) + String.fromCharCode(b3);
          }
          else if(b2 !== 0) {
            value += String.fromCharCode(b2);
          }
          e.value = asn1.create(
            asn1.Class.UNIVERSAL, asn1.Type.BITSTRING, false, value);
        }
        // basicConstraints is a SEQUENCE
        else if(e.name === 'basicConstraints') {
          e.value = asn1.create(
            asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);
          // cA BOOLEAN flag defaults to false
          if(e.cA) {
            e.value.value.push(asn1.create(
              asn1.Class.UNIVERSAL, asn1.Type.BOOLEAN, false,
              String.fromCharCode(0xFF)));
          }
          if(e.pathLenConstraint) {
            var num = e.pathLenConstraint;
            var tmp = forge.util.createBuffer();
            tmp.putInt(num, num.toString(2).length);
            e.value.value.push(asn1.create(
              asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
              tmp.getBytes()));
          }
        }
        // extKeyUsage is a SEQUENCE of OIDs
        else if(e.name === 'extKeyUsage') {
          e.value = asn1.create(
            asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);
          var seq = e.value.value;
          for(var key in e) {
            if(e[key] !== true) {
              continue;
            }
            // key is name in OID map
            if(key in oids) {
              seq.push(asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID,
                false, asn1.oidToDer(oids[key]).getBytes()));
            }
            // assume key is an OID
            else if(key.indexOf('.') !== -1) {
              seq.push(asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID,
                false, asn1.oidToDer(key).getBytes()));
            }
          }
        }
        else if(e.name === 'subjectAltName' || e.name === 'issuerAltName') {
          // SYNTAX SEQUENCE
          e.value = asn1.create(
            asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);

          var altName;
          for(var n = 0; n < e.altNames.length; ++n) {
            altName = e.altNames[n];
            var value = altName.value;
            // handle OID
            if(altName.type === 8) {
              value = asn1.oidToDer(value);
            }
            e.value.value.push(asn1.create(
              asn1.Class.CONTEXT_SPECIFIC, altName.type, false,
              value));
          }
        }

        // ensure value has been defined by now
        if(typeof(e.value) === 'undefined') {
          throw {
            message: 'Extension value not specified.',
            extension: e
          };
        }
      }
    }

    // set new extensions
    cert.extensions = exts;
  };

  /**
   * Gets an extension by its name or id.
   *
   * @param options the name to use or an object with:
   *          name the name to use.
   *          id the id to use.
   *
   * @return the extension or null if not found.
   */
  cert.getExtension = function(options) {
    if(typeof options === 'string') {
      options = {name: options};
    }

    var rval = null;
    var ext;
    for(var i = 0; rval === null && i < cert.extensions.length; ++i) {
      ext = cert.extensions[i];
      if(options.id && ext.id === options.id) {
        rval = ext;
      }
      else if(options.name && ext.name === options.name) {
        rval = ext;
      }
    }
    return rval;
  };

  /**
   * Signs this certificate using the given private key.
   *
   * @param key the private key to sign with.
   */
  cert.sign = function(key) {
    // TODO: get signature OID from private key
    cert.signatureOid = oids['sha1withRSAEncryption'];
    cert.siginfo.algorithmOid = oids['sha1withRSAEncryption'];
    cert.md = forge.md.sha1.create();

    // get TBSCertificate, convert to DER
    cert.tbsCertificate = pki.getTBSCertificate(cert);
    var bytes = asn1.toDer(cert.tbsCertificate);

    // digest and sign
    cert.md.update(bytes.getBytes());
    cert.signature = key.sign(cert.md);
  };

  /**
   * Attempts verify the signature on the passed certificate using this
   * certificate's public key.
   *
   * @param child the certificate to verify.
   *
   * @return true if verified, false if not.
   */
  cert.verify = function(child) {
    var rval = false;

    var md = child.md;
    if(md === null) {
      // check signature OID for supported signature types
      if(child.signatureOid in oids) {
        var oid = oids[child.signatureOid];
        switch(oid) {
        case 'sha1withRSAEncryption':
          md = forge.md.sha1.create();
          break;
        case 'md5withRSAEncryption':
          md = forge.md.md5.create();
          break;
        case 'sha256WithRSAEncryption':
          md = forge.md.sha256.create();
          break;
        case 'RSASSA-PSS':
          md = forge.md.sha256.create();
          break;
        }
      }
      if(md === null) {
        throw {
          message: 'Could not compute certificate digest. ' +
            'Unknown signature OID.',
          signatureOid: child.signatureOid
        };
      }

      // produce DER formatted TBSCertificate and digest it
      var tbsCertificate = child.tbsCertificate || pki.getTBSCertificate(child);
      var bytes = asn1.toDer(tbsCertificate);
      md.update(bytes.getBytes());
    }

    if(md !== null) {
      var scheme = undefined;

      switch(child.signatureOid) {
      case oids['sha1withRSAEncryption']:
        scheme = undefined;  /* use PKCS#1 v1.5 padding scheme */
        break;
      case oids['RSASSA-PSS']:
        var hash, mgf;

        /* initialize mgf */
        hash = oids[child.signatureParameters.mgf.hash.algorithmOid];
        if(hash === undefined || forge.md[hash] === undefined) {
          throw {
            message: 'Unsupported MGF hash function.',
            oid: child.signatureParameters.mgf.hash.algorithmOid,
            name: hash
          };
        }

        mgf = oids[child.signatureParameters.mgf.algorithmOid];
        if(mgf === undefined || forge.mgf[mgf] === undefined) {
          throw {
            message: 'Unsupported MGF function.',
            oid: child.signatureParameters.mgf.algorithmOid,
            name: mgf
          };
        }

        mgf = forge.mgf[mgf].create(forge.md[hash].create());

        /* initialize hash function */
        hash = oids[child.signatureParameters.hash.algorithmOid];
        if(hash === undefined || forge.md[hash] === undefined) {
          throw {
            message: 'Unsupported RSASSA-PSS hash function.',
            oid: child.signatureParameters.hash.algorithmOid,
            name: hash
          };
        }

        scheme = forge.pss.create(forge.md[hash].create(), mgf,
          child.signatureParameters.saltLength);
        break;
      }

      // verify signature on cert using public key
      rval = cert.publicKey.verify(
        md.digest().getBytes(), child.signature, scheme);
    }

    return rval;
  };

  /**
   * Returns true if the passed certificate's subject is the issuer of
   * this certificate.
   *
   * @param parent the certificate to check.
   *
   * @return true if the passed certificate's subject is the issuer of
   *         this certificate.
   */
  cert.isIssuer = function(parent) {
    var rval = false;

    var i = cert.issuer;
    var s = parent.subject;

    // compare hashes if present
    if(i.hash && s.hash) {
      rval = (i.hash === s.hash);
    }
    // if all attributes are the same then issuer matches subject
    else if(i.attributes.length === s.attributes.length) {
      rval = true;
      var iattr, sattr;
      for(var n = 0; rval && n < i.attributes.length; ++n) {
        iattr = i.attributes[n];
        sattr = s.attributes[n];
        if(iattr.type !== sattr.type || iattr.value !== sattr.value) {
          // attribute mismatch
          rval = false;
        }
      }
    }

    return rval;
  };

  return cert;
};

/**
 * Converts an X.509v3 RSA certificate from an ASN.1 object.
 *
 * Note: If the certificate is to be verified then compute hash should
 * be set to true. There is currently no implementation for converting
 * a certificate back to ASN.1 so the TBSCertificate part of the ASN.1
 * object needs to be scanned before the cert object is created.
 *
 * @param obj the asn1 representation of an X.509v3 RSA certificate.
 * @param computeHash true to compute the hash for verification.
 *
 * @return the certificate.
 */
pki.certificateFromAsn1 = function(obj, computeHash) {
  // validate certificate and capture data
  var capture = {};
  var errors = [];
  if(!asn1.validate(obj, x509CertificateValidator, capture, errors)) {
    throw {
      message: 'Cannot read X.509 certificate. ' +
        'ASN.1 object is not an X509v3 Certificate.',
      errors: errors
    };
  }

  // ensure signature is not interpreted as an embedded ASN.1 object
  if(typeof capture.certSignature !== 'string') {
    var certSignature = '\x00';
    for(var i = 0; i < capture.certSignature.length; ++i) {
      certSignature += asn1.toDer(capture.certSignature[i]).getBytes();
    }
    capture.certSignature = certSignature;
  }

  // get oid
  var oid = asn1.derToOid(capture.publicKeyOid);
  if(oid !== pki.oids['rsaEncryption']) {
    throw {
      message: 'Cannot read public key. OID is not RSA.'
    };
  }

  // create certificate
  var cert = pki.createCertificate();
  cert.version = capture.certVersion ?
    capture.certVersion.charCodeAt(0) : 0;
  var serial = forge.util.createBuffer(capture.certSerialNumber);
  cert.serialNumber = serial.toHex();
  cert.signatureOid = forge.asn1.derToOid(capture.certSignatureOid);
  cert.signatureParameters = _readSignatureParameters(
    cert.signatureOid, capture.certSignatureParams, true);
  cert.siginfo.algorithmOid = forge.asn1.derToOid(capture.certinfoSignatureOid);
  cert.siginfo.parameters = _readSignatureParameters(cert.siginfo.algorithmOid,
    capture.certinfoSignatureParams, false);
  // skip "unused bits" in signature value BITSTRING
  var signature = forge.util.createBuffer(capture.certSignature);
  ++signature.read;
  cert.signature = signature.getBytes();

  var validity = [];
  if(capture.certValidity1UTCTime !== undefined) {
    validity.push(asn1.utcTimeToDate(capture.certValidity1UTCTime));
  }
  if(capture.certValidity2GeneralizedTime !== undefined) {
    validity.push(asn1.generalizedTimeToDate(
      capture.certValidity2GeneralizedTime));
  }
  if(capture.certValidity3UTCTime !== undefined) {
    validity.push(asn1.utcTimeToDate(capture.certValidity3UTCTime));
  }
  if(capture.certValidity4GeneralizedTime !== undefined) {
    validity.push(asn1.generalizedTimeToDate(
      capture.certValidity4GeneralizedTime));
  }
  if(validity.length > 2) {
    throw {
      message: 'Cannot read notBefore/notAfter validity times; more than ' +
        'two times were provided in the certificate.'
    };
  }
  if(validity.length < 2) {
    throw {
      message: 'Cannot read notBefore/notAfter validity times; they were not ' +
        'provided as either UTCTime or GeneralizedTime.'
    };
  }
  cert.validity.notBefore = validity[0];
  cert.validity.notAfter = validity[1];

  // keep TBSCertificate to preserve signature when exporting
  cert.tbsCertificate = capture.tbsCertificate;

  if(computeHash) {
    // check signature OID for supported signature types
    cert.md = null;
    if(cert.signatureOid in oids) {
      var oid = oids[cert.signatureOid];
      switch(oid) {
      case 'sha1withRSAEncryption':
        cert.md = forge.md.sha1.create();
        break;
      case 'md5withRSAEncryption':
        cert.md = forge.md.md5.create();
        break;
      case 'sha256WithRSAEncryption':
        cert.md = forge.md.sha256.create();
        break;
      case 'RSASSA-PSS':
        cert.md = forge.md.sha256.create();
        break;
      }
    }
    if(cert.md === null) {
      throw {
        message: 'Could not compute certificate digest. ' +
          'Unknown signature OID.',
        signatureOid: cert.signatureOid
      };
    }

    // produce DER formatted TBSCertificate and digest it
    var bytes = asn1.toDer(cert.tbsCertificate);
    cert.md.update(bytes.getBytes());
  }

  // handle issuer, build issuer message digest
  var imd = forge.md.sha1.create();
  cert.issuer.getField = function(sn) {
    return _getAttribute(cert.issuer, sn);
  };
  cert.issuer.addField = function(attr) {
    _fillMissingFields([attr]);
    cert.issuer.attributes.push(attr);
  };
  cert.issuer.attributes = pki.RDNAttributesAsArray(capture.certIssuer, imd);
  if(capture.certIssuerUniqueId) {
    cert.issuer.uniqueId = capture.certIssuerUniqueId;
  }
  cert.issuer.hash = imd.digest().toHex();

  // handle subject, build subject message digest
  var smd = forge.md.sha1.create();
  cert.subject.getField = function(sn) {
    return _getAttribute(cert.subject, sn);
  };
  cert.subject.addField = function(attr) {
    _fillMissingFields([attr]);
    cert.subject.attributes.push(attr);
  };
  cert.subject.attributes = pki.RDNAttributesAsArray(capture.certSubject, smd);
  if(capture.certSubjectUniqueId) {
    cert.subject.uniqueId = capture.certSubjectUniqueId;
  }
  cert.subject.hash = smd.digest().toHex();

  // handle extensions
  if(capture.certExtensions) {
    cert.extensions = _parseExtensions(capture.certExtensions);
  }
  else {
    cert.extensions = [];
  }

  // convert RSA public key from ASN.1
  cert.publicKey = pki.publicKeyFromAsn1(capture.subjectPublicKeyInfo);

  return cert;
};

/**
 * Converts a PKCS#10 certification request (CSR) from an ASN.1 object.
 *
 * Note: If the certification request is to be verified then compute hash
 * should be set to true. There is currently no implementation for converting
 * a certificate back to ASN.1 so the CertificationRequestInfo part of the
 * ASN.1 object needs to be scanned before the csr object is created.
 *
 * @param obj the asn1 representation of a PKCS#10 certification request (CSR).
 * @param computeHash true to compute the hash for verification.
 *
 * @return the certification request (CSR).
 */
pki.certificationRequestFromAsn1 = function(obj, computeHash) {
  // validate certification request and capture data
  var capture = {};
  var errors = [];
  if(!asn1.validate(obj, certificationRequestValidator, capture, errors)) {
    throw {
      message: 'Cannot read PKCS#10 certificate request. ' +
        'ASN.1 object is not a PKCS#10 CertificationRequest.',
      errors: errors
    };
  }

  // ensure signature is not interpreted as an embedded ASN.1 object
  if(typeof capture.csrSignature !== 'string') {
    var csrSignature = '\x00';
    for(var i = 0; i < capture.csrSignature.length; ++i) {
      csrSignature += asn1.toDer(capture.csrSignature[i]).getBytes();
    }
    capture.csrSignature = csrSignature;
  }

  // get oid
  var oid = asn1.derToOid(capture.publicKeyOid);
  if(oid !== pki.oids['rsaEncryption']) {
    throw {
      message: 'Cannot read public key. OID is not RSA.'
    };
  }

  // create certification request
  var csr = pki.createCertificationRequest();
  csr.version = capture.csrVersion ? capture.csrVersion.charCodeAt(0) : 0;
  csr.signatureOid = forge.asn1.derToOid(capture.csrSignatureOid);
  csr.signatureParameters = _readSignatureParameters(
    csr.signatureOid, capture.csrSignatureParams, true);
  csr.siginfo.algorithmOid = forge.asn1.derToOid(capture.csrSignatureOid);
  csr.siginfo.parameters = _readSignatureParameters(
    csr.siginfo.algorithmOid, capture.csrSignatureParams, false);
  // skip "unused bits" in signature value BITSTRING
  var signature = forge.util.createBuffer(capture.csrSignature);
  ++signature.read;
  csr.signature = signature.getBytes();

  // keep CertificationRequestInfo to preserve signature when exporting
  csr.certificationRequestInfo = capture.certificationRequestInfo;

  if(computeHash) {
    // check signature OID for supported signature types
    csr.md = null;
    if(csr.signatureOid in oids) {
      var oid = oids[csr.signatureOid];
      switch(oid) {
      case 'sha1withRSAEncryption':
        csr.md = forge.md.sha1.create();
        break;
      case 'md5withRSAEncryption':
        csr.md = forge.md.md5.create();
        break;
      case 'sha256WithRSAEncryption':
        csr.md = forge.md.sha256.create();
        break;
      case 'RSASSA-PSS':
        csr.md = forge.md.sha256.create();
        break;
      }
    }
    if(csr.md === null) {
      throw {
        message: 'Could not compute certification request digest. ' +
          'Unknown signature OID.',
        signatureOid: csr.signatureOid
      };
    }

    // produce DER formatted CertificationRequestInfo and digest it
    var bytes = asn1.toDer(csr.certificationRequestInfo);
    csr.md.update(bytes.getBytes());
  }

  // handle subject, build subject message digest
  var smd = forge.md.sha1.create();
  csr.subject.getField = function(sn) {
    return _getAttribute(csr.subject, sn);
  };
  csr.subject.addField = function(attr) {
    _fillMissingFields([attr]);
    csr.subject.attributes.push(attr);
  };
  csr.subject.attributes = pki.RDNAttributesAsArray(
    capture.certificationRequestInfoSubject, smd);
  csr.subject.hash = smd.digest().toHex();

  // convert RSA public key from ASN.1
  csr.publicKey = pki.publicKeyFromAsn1(capture.subjectPublicKeyInfo);

  // convert attributes from ASN.1
  csr.getAttribute = function(sn) {
    return _getAttribute(csr.attributes, sn);
  };
  csr.addAttribute = function(attr) {
    _fillMissingFields([attr]);
    csr.attributes.push(attr);
  };
  csr.attributes = pki.CRIAttributesAsArray(
    capture.certificationRequestInfoAttributes);

  return csr;
};

/**
 * Creates an empty certification request (a CSR or certificate signing
 * request). Once created, its public key and attributes can be set and then
 * it can be signed.
 *
 * @return the empty certification request.
 */
pki.createCertificationRequest = function() {
  var csr = {};
  csr.version = 0x00;
  csr.signatureOid = null;
  csr.signature = null;
  csr.siginfo = {};
  csr.siginfo.algorithmOid = null;

  csr.subject = {};
  csr.subject.getField = function(sn) {
    return _getAttribute(csr.subject, sn);
  };
  csr.subject.addField = function(attr) {
    _fillMissingFields([attr]);
    csr.subject.attributes.push(attr);
  };
  csr.subject.attributes = [];
  csr.subject.hash = null;

  csr.publicKey = null;
  csr.attributes = [];
  csr.getAttribute = function(sn) {
    return _getAttribute(csr.attributes, sn);
  };
  csr.addAttribute = function(attr) {
    _fillMissingFields([attr]);
    csr.attributes.push(attr);
  };
  csr.md = null;

  /**
   * Fills in missing fields in attributes.
   *
   * @param attrs the attributes to fill missing fields in.
   */
  var _fillMissingFields = function(attrs) {
    var attr;
    for(var i = 0; i < attrs.length; ++i) {
      attr = attrs[i];

      // populate missing name
      if(typeof(attr.name) === 'undefined') {
        if(attr.type && attr.type in pki.oids) {
          attr.name = pki.oids[attr.type];
        }
        else if(attr.shortName && attr.shortName in _shortNames) {
          attr.name = pki.oids[_shortNames[attr.shortName]];
        }
      }

      // populate missing type (OID)
      if(typeof(attr.type) === 'undefined') {
        if(attr.name && attr.name in pki.oids) {
          attr.type = pki.oids[attr.name];
        }
        else {
          throw {
            message: 'Attribute type not specified.',
            attribute: attr
          };
        }
      }

      // populate missing shortname
      if(typeof(attr.shortName) === 'undefined') {
        if(attr.name && attr.name in _shortNames) {
          attr.shortName = _shortNames[attr.name];
        }
      }

      if(typeof(attr.value) === 'undefined') {
        throw {
          message: 'Attribute value not specified.',
          attribute: attr
        };
      }
    }
  };

  /**
   * Sets the subject of this certification request.
   *
   * @param attrs the array of subject attributes to use.
   */
  csr.setSubject = function(attrs) {
    // set new attributes
    _fillMissingFields(attrs);
    csr.subject.attributes = attrs;
    csr.subject.hash = null;
  };

  /**
   * Sets the attributes of this certification request.
   *
   * @param attrs the array of attributes to use.
   */
  csr.setAttributes = function(attrs) {
    // set new attributes
    _fillMissingFields(attrs);
    csr.attributes = attrs;
  };

  /**
   * Signs this certification request using the given private key.
   *
   * @param key the private key to sign with.
   */
  csr.sign = function(key) {
    // TODO: get signature OID from private key
    csr.signatureOid = oids['sha1withRSAEncryption'];
    csr.siginfo.algorithmOid = oids['sha1withRSAEncryption'];
    csr.md = forge.md.sha1.create();

    // get CertificationRequestInfo, convert to DER
    csr.certificationRequestInfo = pki.getCertificationRequestInfo(csr);
    var bytes = asn1.toDer(csr.certificationRequestInfo);

    // digest and sign
    csr.md.update(bytes.getBytes());
    csr.signature = key.sign(csr.md);
  };

  /**
   * Attempts verify the signature on the passed certification request using
   * its public key.
   *
   * A CSR that has been exported to a file in PEM format can be verified using
   * OpenSSL using this command:
   *
   * openssl req -in <the-csr-pem-file> -verify -noout -text
   *
   * @return true if verified, false if not.
   */
  csr.verify = function() {
    var rval = false;

    var md = csr.md;
    if(md === null) {
      // check signature OID for supported signature types
      if(csr.signatureOid in oids) {
        var oid = oids[csr.signatureOid];
        switch(oid) {
        case 'sha1withRSAEncryption':
          md = forge.md.sha1.create();
          break;
        case 'md5withRSAEncryption':
          md = forge.md.md5.create();
          break;
        case 'sha256WithRSAEncryption':
          md = forge.md.sha256.create();
          break;
        case 'RSASSA-PSS':
          md = forge.md.sha256.create();
          break;
        }
      }
      if(md === null) {
        throw {
          message: 'Could not compute certification request digest. ' +
            'Unknown signature OID.',
          signatureOid: csr.signatureOid
        };
      }

      // produce DER formatted CertificationRequestInfo and digest it
      var cri = csr.certificationRequestInfo ||
        pki.getCertificationRequestInfo(csr);
      var bytes = asn1.toDer(cri);
      md.update(bytes.getBytes());
    }

    if(md !== null) {
      var scheme = undefined;

      switch(csr.signatureOid) {
      case oids['sha1withRSAEncryption']:
        scheme = undefined;  /* use PKCS#1 v1.5 padding scheme */
        break;
      case oids['RSASSA-PSS']:
        var hash, mgf;

        /* initialize mgf */
        hash = oids[csr.signatureParameters.mgf.hash.algorithmOid];
        if(hash === undefined || forge.md[hash] === undefined) {
          throw {
            message: 'Unsupported MGF hash function.',
            oid: csr.signatureParameters.mgf.hash.algorithmOid,
            name: hash
          };
        }

        mgf = oids[csr.signatureParameters.mgf.algorithmOid];
        if(mgf === undefined || forge.mgf[mgf] === undefined) {
          throw {
            message: 'Unsupported MGF function.',
            oid: csr.signatureParameters.mgf.algorithmOid,
            name: mgf
          };
        }

        mgf = forge.mgf[mgf].create(forge.md[hash].create());

        /* initialize hash function */
        hash = oids[csr.signatureParameters.hash.algorithmOid];
        if(hash === undefined || forge.md[hash] === undefined) {
          throw {
            message: 'Unsupported RSASSA-PSS hash function.',
            oid: csr.signatureParameters.hash.algorithmOid,
            name: hash
          };
        }

        scheme = forge.pss.create(forge.md[hash].create(), mgf,
          csr.signatureParameters.saltLength);
        break;
      }

      // verify signature on csr using its public key
      rval = csr.publicKey.verify(
        md.digest().getBytes(), csr.signature, scheme);
    }

    return rval;
  };

  return csr;
};

/**
 * Converts an X.509 subject or issuer to an ASN.1 RDNSequence.
 *
 * @param obj the subject or issuer (distinguished name).
 *
 * @return the ASN.1 RDNSequence.
 */
function _dnToAsn1(obj) {
  // create an empty RDNSequence
  var rval = asn1.create(
    asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);

  // iterate over attributes
  var attr, set;
  var attrs = obj.attributes;
  for(var i = 0; i < attrs.length; ++i) {
    attr = attrs[i];
    var value = attr.value;

    // reuse tag class for attribute value if available
    var valueTagClass = asn1.Type.PRINTABLESTRING;
    if('valueTagClass' in attr) {
      valueTagClass = attr.valueTagClass;

      if(valueTagClass === asn1.Type.UTF8) {
        value = forge.util.encodeUtf8(value);
      }
      // FIXME: handle more encodings
    }

    // create a RelativeDistinguishedName set
    // each value in the set is an AttributeTypeAndValue first
    // containing the type (an OID) and second the value
    set = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SET, true, [
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        // AttributeType
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
          asn1.oidToDer(attr.type).getBytes()),
        // AttributeValue
        asn1.create(asn1.Class.UNIVERSAL, valueTagClass, false, value)
      ])
    ]);
    rval.value.push(set);
  }

  return rval;
}

/**
 * Converts X.509v3 certificate extensions to ASN.1.
 *
 * @param exts the extensions to convert.
 *
 * @return the extensions in ASN.1 format.
 */
function _extensionsToAsn1(exts) {
  // create top-level extension container
  var rval = asn1.create(asn1.Class.CONTEXT_SPECIFIC, 3, true, []);

  // create extension sequence (stores a sequence for each extension)
  var seq = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);
  rval.value.push(seq);

  var ext, extseq;
  for(var i = 0; i < exts.length; ++i) {
    ext = exts[i];

    // create a sequence for each extension
    extseq = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, []);
    seq.value.push(extseq);

    // extnID (OID)
    extseq.value.push(asn1.create(
      asn1.Class.UNIVERSAL, asn1.Type.OID, false,
      asn1.oidToDer(ext.id).getBytes()));

    // critical defaults to false
    if(ext.critical) {
      // critical BOOLEAN DEFAULT FALSE
      extseq.value.push(asn1.create(
        asn1.Class.UNIVERSAL, asn1.Type.BOOLEAN, false,
        String.fromCharCode(0xFF)));
    }

    var value = ext.value;
    if(typeof ext.value !== 'string') {
      // value is asn.1
      value = asn1.toDer(value).getBytes();
    }

    // extnValue (OCTET STRING)
    extseq.value.push(asn1.create(
      asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, value));
  }

  return rval;
}

/**
 * Convert signature parameters object to ASN.1
 *
 * @param {String} oid Signature algorithm OID
 * @param params The signature parametrs object
 * @return ASN.1 object representing signature parameters
 */
function _signatureParametersToAsn1(oid, params) {
  switch(oid) {
  case oids['RSASSA-PSS']:
    var parts = [];

    if(params.hash.algorithmOid !== undefined) {
      parts.push(asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
            asn1.oidToDer(params.hash.algorithmOid).getBytes()),
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, '')
        ])
      ]));
    }

    if(params.mgf.algorithmOid !== undefined) {
      parts.push(asn1.create(asn1.Class.CONTEXT_SPECIFIC, 1, true, [
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
            asn1.oidToDer(params.mgf.algorithmOid).getBytes()),
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
            asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
              asn1.oidToDer(params.mgf.hash.algorithmOid).getBytes()),
            asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, '')
          ])
        ])
      ]));
    }

    if(params.saltLength !== undefined) {
      parts.push(asn1.create(asn1.Class.CONTEXT_SPECIFIC, 2, true, [
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
          String.fromCharCode(params.saltLength))
      ]));
    }

    return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, parts);

  default:
    return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, '');
  }
}

/**
 * Converts a certification request's attributes to an ASN.1 set of
 * CRIAttributes.
 *
 * @param csr certification request.
 *
 * @return the ASN.1 set of CRIAttributes.
 */
function _CRIAttributesToAsn1(csr) {
  // create an empty context-specific container
  var rval = asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, []);

  // no attributes, return empty container
  if(csr.attributes.length === 0) {
    return rval;
  }

  // each attribute has a sequence with a type and a set of values
  var attrs = csr.attributes;
  for(var i = 0; i < attrs.length; ++i) {
    var attr = attrs[i];
    var value = attr.value;

    // reuse tag class for attribute value if available
    var valueTagClass = asn1.Type.UTF8;
    if('valueTagClass' in attr) {
      valueTagClass = attr.valueTagClass;
    }
    if(valueTagClass === asn1.Type.UTF8) {
      value = forge.util.encodeUtf8(value);
    }
    // FIXME: handle more encodings

    // create a RelativeDistinguishedName set
    // each value in the set is an AttributeTypeAndValue first
    // containing the type (an OID) and second the value
    var seq = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // AttributeType
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(attr.type).getBytes()),
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SET, true, [
        // AttributeValue
        asn1.create(asn1.Class.UNIVERSAL, valueTagClass, false, value)
      ])
    ]);
    rval.value.push(seq);
  }

  return rval;
}

/**
 * Gets the ASN.1 TBSCertificate part of an X.509v3 certificate.
 *
 * @param cert the certificate.
 *
 * @return the asn1 TBSCertificate.
 */
pki.getTBSCertificate = function(cert) {
  // TBSCertificate
  var tbs = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // version
    asn1.create(asn1.Class.CONTEXT_SPECIFIC, 0, true, [
      // integer
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
        String.fromCharCode(cert.version))
    ]),
    // serialNumber
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      forge.util.hexToBytes(cert.serialNumber)),
    // signature
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // algorithm
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(cert.siginfo.algorithmOid).getBytes()),
      // parameters
      _signatureParametersToAsn1(
        cert.siginfo.algorithmOid, cert.siginfo.parameters)
    ]),
    // issuer
    _dnToAsn1(cert.issuer),
    // validity
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // notBefore
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.UTCTIME, false,
        asn1.dateToUtcTime(cert.validity.notBefore)),
      // notAfter
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.UTCTIME, false,
        asn1.dateToUtcTime(cert.validity.notAfter))
    ]),
    // subject
    _dnToAsn1(cert.subject),
    // SubjectPublicKeyInfo
    pki.publicKeyToAsn1(cert.publicKey)
  ]);

  if(cert.issuer.uniqueId) {
    // issuerUniqueID (optional)
    tbs.value.push(
      asn1.create(asn1.Class.CONTEXT_SPECIFIC, 1, true, [
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.BITSTRING, false,
          String.fromCharCode(0x00) +
          cert.issuer.uniqueId
        )
      ])
    );
  }
  if(cert.subject.uniqueId) {
    // subjectUniqueID (optional)
    tbs.value.push(
      asn1.create(asn1.Class.CONTEXT_SPECIFIC, 2, true, [
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.BITSTRING, false,
          String.fromCharCode(0x00) +
          cert.subject.uniqueId
        )
      ])
    );
  }

  if(cert.extensions.length > 0) {
    // extensions (optional)
    tbs.value.push(_extensionsToAsn1(cert.extensions));
  }

  return tbs;
};

/**
 * Gets the ASN.1 CertificationRequestInfo part of a
 * PKCS#10 CertificationRequest.
 *
 * @param csr the certification request.
 *
 * @return the asn1 CertificationRequestInfo.
 */
pki.getCertificationRequestInfo = function(csr) {
  // CertificationRequestInfo
  var cri = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // version
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      String.fromCharCode(csr.version)),
    // subject
    _dnToAsn1(csr.subject),
    // SubjectPublicKeyInfo
    pki.publicKeyToAsn1(csr.publicKey),
    // attributes
    _CRIAttributesToAsn1(csr)
  ]);

  return cri;
};

/**
 * Converts a DistinguishedName (subject or issuer) to an ASN.1 object.
 *
 * @param dn the DistinguishedName.
 *
 * @return the asn1 representation of a DistinguishedName.
 */
pki.distinguishedNameToAsn1 = function(dn) {
  return _dnToAsn1(dn);
};

/**
 * Converts an X.509v3 RSA certificate to an ASN.1 object.
 *
 * @param cert the certificate.
 *
 * @return the asn1 representation of an X.509v3 RSA certificate.
 */
pki.certificateToAsn1 = function(cert) {
  // prefer cached TBSCertificate over generating one
  var tbsCertificate = cert.tbsCertificate || pki.getTBSCertificate(cert);

  // Certificate
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // TBSCertificate
    tbsCertificate,
    // AlgorithmIdentifier (signature algorithm)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // algorithm
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(cert.signatureOid).getBytes()),
      // parameters
      _signatureParametersToAsn1(cert.signatureOid, cert.signatureParameters)
    ]),
    // SignatureValue
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.BITSTRING, false,
      String.fromCharCode(0x00) + cert.signature)
  ]);
};

/**
 * Converts a PKCS#10 certification request to an ASN.1 object.
 *
 * @param csr the certification request.
 *
 * @return the asn1 representation of a certification request.
 */
pki.certificationRequestToAsn1 = function(csr) {
  // prefer cached CertificationRequestInfo over generating one
  var cri = csr.certificationRequestInfo ||
    pki.getCertificationRequestInfo(csr);

  // Certificate
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // CertificationRequestInfo
    cri,
    // AlgorithmIdentifier (signature algorithm)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // algorithm
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(csr.signatureOid).getBytes()),
      // parameters
      _signatureParametersToAsn1(csr.signatureOid, csr.signatureParameters)
    ]),
    // signature
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.BITSTRING, false,
      String.fromCharCode(0x00) + csr.signature)
  ]);
};

/**
 * Creates a CA store.
 *
 * @param certs an optional array of certificate objects or PEM-formatted
 *          certificate strings to add to the CA store.
 *
 * @return the CA store.
 */
pki.createCaStore = function(certs) {
  // create CA store
  var caStore = {
    // stored certificates
    certs: {}
  };

  /**
   * Gets the certificate that issued the passed certificate or its
   * 'parent'.
   *
   * @param cert the certificate to get the parent for.
   *
   * @return the parent certificate or null if none was found.
   */
  caStore.getIssuer = function(cert) {
    var rval = null;

    // produce issuer hash if it doesn't exist
    if(!cert.issuer.hash) {
      var md = forge.md.sha1.create();
      cert.issuer.attributes =  pki.RDNAttributesAsArray(
        _dnToAsn1(cert.issuer), md);
      cert.issuer.hash = md.digest().toHex();
    }

    // get the entry using the cert's issuer hash
    if(cert.issuer.hash in caStore.certs) {
      rval = caStore.certs[cert.issuer.hash];

      // see if there are multiple matches
      if(forge.util.isArray(rval)) {
        // TODO: resolve multiple matches by checking
        // authorityKey/subjectKey/issuerUniqueID/other identifiers, etc.
        // FIXME: or alternatively do authority key mapping
        // if possible (X.509v1 certs can't work?)
        throw {
          message: 'Resolving multiple issuer matches not implemented yet.'
        };
      }
    }

    return rval;
  };

  /**
   * Adds a trusted certificate to the store.
   *
   * @param cert the certificate to add as a trusted certificate (either a
   *          pki.certificate object or a PEM-formatted certificate).
   */
  caStore.addCertificate = function(cert) {
    // convert from pem if necessary
    if(typeof cert === 'string') {
      cert = forge.pki.certificateFromPem(cert);
    }

    // produce subject hash if it doesn't exist
    if(!cert.subject.hash) {
      var md = forge.md.sha1.create();
      cert.subject.attributes =  pki.RDNAttributesAsArray(
        _dnToAsn1(cert.subject), md);
      cert.subject.hash = md.digest().toHex();
    }

    if(cert.subject.hash in caStore.certs) {
      // subject hash already exists, append to array
      var tmp = caStore.certs[cert.subject.hash];
      if(!forge.util.isArray(tmp)) {
        tmp = [tmp];
      }
      tmp.push(cert);
    }
    else {
      caStore.certs[cert.subject.hash] = cert;
    }
  };

  // auto-add passed in certs
  if(certs) {
    // parse PEM-formatted certificates as necessary
    for(var i = 0; i < certs.length; ++i) {
      var cert = certs[i];
      caStore.addCertificate(cert);
    }
  }

  return caStore;
};

/**
 * Certificate verification errors, based on TLS.
 */
pki.certificateError = {
  bad_certificate: 'forge.pki.BadCertificate',
  unsupported_certificate: 'forge.pki.UnsupportedCertificate',
  certificate_revoked: 'forge.pki.CertificateRevoked',
  certificate_expired: 'forge.pki.CertificateExpired',
  certificate_unknown: 'forge.pki.CertificateUnknown',
  unknown_ca: 'forge.pki.UnknownCertificateAuthority'
};

/**
 * Verifies a certificate chain against the given Certificate Authority store
 * with an optional custom verify callback.
 *
 * @param caStore a certificate store to verify against.
 * @param chain the certificate chain to verify, with the root or highest
 *          authority at the end (an array of certificates).
 * @param verify called for every certificate in the chain.
 *
 * The verify callback has the following signature:
 *
 * verified - Set to true if certificate was verified, otherwise the
 *   pki.certificateError for why the certificate failed.
 * depth - The current index in the chain, where 0 is the end point's cert.
 * certs - The certificate chain, *NOTE* an empty chain indicates an anonymous
 *   end point.
 *
 * The function returns true on success and on failure either the appropriate
 * pki.certificateError or an object with 'error' set to the appropriate
 * pki.certificateError and 'message' set to a custom error message.
 *
 * @return true if successful, error thrown if not.
 */
pki.verifyCertificateChain = function(caStore, chain, verify) {
  /* From: RFC3280 - Internet X.509 Public Key Infrastructure Certificate
    Section 6: Certification Path Validation
    See inline parentheticals related to this particular implementation.

    The primary goal of path validation is to verify the binding between
    a subject distinguished name or a subject alternative name and subject
    public key, as represented in the end entity certificate, based on the
    public key of the trust anchor. This requires obtaining a sequence of
    certificates that support that binding. That sequence should be provided
    in the passed 'chain'. The trust anchor should be in the given CA
    store. The 'end entity' certificate is the certificate provided by the
    end point (typically a server) and is the first in the chain.

    To meet this goal, the path validation process verifies, among other
    things, that a prospective certification path (a sequence of n
    certificates or a 'chain') satisfies the following conditions:

    (a) for all x in {1, ..., n-1}, the subject of certificate x is
          the issuer of certificate x+1;

    (b) certificate 1 is issued by the trust anchor;

    (c) certificate n is the certificate to be validated; and

    (d) for all x in {1, ..., n}, the certificate was valid at the
          time in question.

    Note that here 'n' is index 0 in the chain and 1 is the last certificate
    in the chain and it must be signed by a certificate in the connection's
    CA store.

    The path validation process also determines the set of certificate
    policies that are valid for this path, based on the certificate policies
    extension, policy mapping extension, policy constraints extension, and
    inhibit any-policy extension.

    Note: Policy mapping extension not supported (Not Required).

    Note: If the certificate has an unsupported critical extension, then it
    must be rejected.

    Note: A certificate is self-issued if the DNs that appear in the subject
    and issuer fields are identical and are not empty.

    The path validation algorithm assumes the following seven inputs are
    provided to the path processing logic. What this specific implementation
    will use is provided parenthetically:

    (a) a prospective certification path of length n (the 'chain')
    (b) the current date/time: ('now').
    (c) user-initial-policy-set: A set of certificate policy identifiers
          naming the policies that are acceptable to the certificate user.
          The user-initial-policy-set contains the special value any-policy
          if the user is not concerned about certificate policy
          (Not implemented. Any policy is accepted).
    (d) trust anchor information, describing a CA that serves as a trust
          anchor for the certification path. The trust anchor information
          includes:

      (1)  the trusted issuer name,
      (2)  the trusted public key algorithm,
      (3)  the trusted public key, and
      (4)  optionally, the trusted public key parameters associated
             with the public key.

      (Trust anchors are provided via certificates in the CA store).

      The trust anchor information may be provided to the path processing
      procedure in the form of a self-signed certificate. The trusted anchor
      information is trusted because it was delivered to the path processing
      procedure by some trustworthy out-of-band procedure. If the trusted
      public key algorithm requires parameters, then the parameters are
      provided along with the trusted public key (No parameters used in this
      implementation).

    (e) initial-policy-mapping-inhibit, which indicates if policy mapping is
          allowed in the certification path.
          (Not implemented, no policy checking)

    (f) initial-explicit-policy, which indicates if the path must be valid
          for at least one of the certificate policies in the user-initial-
          policy-set.
          (Not implemented, no policy checking)

    (g) initial-any-policy-inhibit, which indicates whether the
          anyPolicy OID should be processed if it is included in a
          certificate.
          (Not implemented, so any policy is valid provided that it is
          not marked as critical) */

  /* Basic Path Processing:

    For each certificate in the 'chain', the following is checked:

    1. The certificate validity period includes the current time.
    2. The certificate was signed by its parent (where the parent is
       either the next in the chain or from the CA store).
    3. TODO: The certificate has not been revoked.
    4. The certificate issuer name matches the parent's subject name.
    5. TODO: If the certificate is self-issued and not the final certificate
       in the chain, skip this step, otherwise verify that the subject name
       is within one of the permitted subtrees of X.500 distinguished names
       and that each of the alternative names in the subjectAltName extension
       (critical or non-critical) is within one of the permitted subtrees for
       that name type.
    6. TODO: If the certificate is self-issued and not the final certificate
       in the chain, skip this step, otherwise verify that the subject name
       is not within one of the excluded subtrees for X.500 distinguished
       names and none of the subjectAltName extension names are excluded for
       that name type.
    7. The other steps in the algorithm for basic path processing involve
       handling the policy extension which is not presently supported in this
       implementation. Instead, if a critical policy extension is found, the
       certificate is rejected as not supported.
    8. If the certificate is not the first or the only certificate in the
       chain and it has a critical key usage extension, verify that the
       keyCertSign bit is set. If the key usage extension exists, verify that
       the basic constraints extension exists. If the basic constraints
       extension exists, verify that the cA flag is set.
       TODO: handle pathLenConstraint by setting max path length to a lower
       number if the parent certificate's pathLenConstraint is lower. Also
       ensure that the path isn't already too long. */

  // copy cert chain references to another array to protect against changes
  // in verify callback
  chain = chain.slice(0);
  var certs = chain.slice(0);

  // get current date
  var now = new Date();

  // verify each cert in the chain using its parent, where the parent
  // is either the next in the chain or from the CA store
  var first = true;
  var error = null;
  var depth = 0;
  var parent = null;
  do {
    var cert = chain.shift();

    // 1. check valid time
    if(now < cert.validity.notBefore || now > cert.validity.notAfter) {
      error = {
        message: 'Certificate is not valid yet or has expired.',
        error: pki.certificateError.certificate_expired,
        notBefore: cert.validity.notBefore,
        notAfter: cert.validity.notAfter,
        now: now
      };
    }
    // 2. verify with parent
    else {
      // get parent from chain
      var verified = false;
      if(chain.length > 0) {
        // verify using parent
        parent = chain[0];
        try {
          verified = parent.verify(cert);
        }
        catch(ex) {
          // failure to verify, don't care why, just fail
        }
      }
      // get parent(s) from CA store
      else {
        var parents = caStore.getIssuer(cert);
        if(parents === null) {
          // no parent issuer, so certificate not trusted
          error = {
            message: 'Certificate is not trusted.',
            error: pki.certificateError.unknown_ca
          };
        }
        else {
          // CA store might have multiple certificates where the issuer
          // can't be determined from the certificate (unlikely case for
          // old certificates) so normalize by always putting parents into
          // an array
          if(!forge.util.isArray(parents)) {
            parents = [parents];
          }

          // multiple parents to try verifying with
          while(!verified && parents.length > 0) {
            parent = parents.shift();
            try {
              verified = parent.verify(cert);
            }
            catch(ex) {
              // failure to verify, try next one
            }
          }
        }
      }
      if(error === null && !verified) {
        error = {
          message: 'Certificate signature is invalid.',
          error: pki.certificateError.bad_certificate
        };
      }
    }

    // TODO: 3. check revoked

    // 4. check for matching issuer/subject
    if(error === null && !cert.isIssuer(parent)) {
      // parent is not issuer
      error = {
        message: 'Certificate issuer is invalid.',
        error: pki.certificateError.bad_certificate
      };
    }

    // 5. TODO: check names with permitted names tree

    // 6. TODO: check names against excluded names tree

    // 7. check for unsupported critical extensions
    if(error === null) {
      // supported extensions
      var se = {
        keyUsage: true,
        basicConstraints: true
      };
      for(var i = 0; error === null && i < cert.extensions.length; ++i) {
        var ext = cert.extensions[i];
        if(ext.critical && !(ext.name in se)) {
          error = {
            message:
              'Certificate has an unsupported critical extension.',
            error: pki.certificateError.unsupported_certificate
          };
        }
      }
    }

    // 8. check for CA if cert is not first or is the only certificate
    // in chain with no parent, first check keyUsage extension and then basic
    // constraints
    if(!first || (chain.length === 0 && !parent)) {
      var bcExt = cert.getExtension('basicConstraints');
      var keyUsageExt = cert.getExtension('keyUsage');
      if(keyUsageExt !== null) {
        // keyCertSign must be true and there must be a basic
        // constraints extension
        if(!keyUsageExt.keyCertSign || bcExt === null) {
          // bad certificate
          error = {
            message:
              'Certificate keyUsage or basicConstraints conflict ' +
              'or indicate that the certificate is not a CA. ' +
              'If the certificate is the only one in the chain or ' +
              'isn\'t the first then the certificate must be a ' +
              'valid CA.',
            error: pki.certificateError.bad_certificate
          };
        }
      }
      // basic constraints cA flag must be set
      if(error === null && bcExt !== null && !bcExt.cA) {
        // bad certificate
        error = {
          message:
            'Certificate basicConstraints indicates the certificate ' +
            'is not a CA.',
          error: pki.certificateError.bad_certificate
        };
      }
    }

    // call application callback
    var vfd = (error === null) ? true : error.error;
    var ret = verify ? verify(vfd, depth, certs) : vfd;
    if(ret === true) {
      // clear any set error
      error = null;
    }
    else {
      // if passed basic tests, set default message and alert
      if(vfd === true) {
        error = {
          message: 'The application rejected the certificate.',
          error: pki.certificateError.bad_certificate
        };
      }

      // check for custom error info
      if(ret || ret === 0) {
        // set custom message and error
        if(typeof ret === 'object' && !forge.util.isArray(ret)) {
          if(ret.message) {
             error.message = ret.message;
          }
          if(ret.error) {
            error.error = ret.error;
          }
        }
        else if(typeof ret === 'string') {
          // set custom error
          error.error = ret;
        }
      }

      // throw error
      throw error;
    }

    // no longer first cert in chain
    first = false;
    ++depth;
  }
  while(chain.length > 0);

  return true;
};

/**
 * Converts a public key from an ASN.1 SubjectPublicKeyInfo or RSAPublicKey.
 *
 * @param obj the asn1 representation of a SubjectPublicKeyInfo or RSAPublicKey.
 *
 * @return the public key.
 */
pki.publicKeyFromAsn1 = function(obj) {
  // get SubjectPublicKeyInfo
  var capture = {};
  var errors = [];
  if(asn1.validate(obj, publicKeyValidator, capture, errors)) {
    // get oid
    var oid = asn1.derToOid(capture.publicKeyOid);
    if(oid !== pki.oids['rsaEncryption']) {
      throw {
        message: 'Cannot read public key. Unknown OID.',
        oid: oid
      };
    }
    obj = capture.rsaPublicKey;
  }

  // get RSA params
  errors = [];
  if(!asn1.validate(
    capture.rsaPublicKey, rsaPublicKeyValidator, capture, errors)) {
    throw {
      message: 'Cannot read public key. ' +
        'ASN.1 object does not contain an RSAPublicKey.',
      errors: errors
    };
  }

  // FIXME: inefficient, get a BigInteger that uses byte strings
  var n = forge.util.createBuffer(capture.publicKeyModulus).toHex();
  var e = forge.util.createBuffer(capture.publicKeyExponent).toHex();

  // set public key
  return pki.setRsaPublicKey(
    new BigInteger(n, 16),
    new BigInteger(e, 16));
};

/**
 * Converts a public key to an ASN.1 SubjectPublicKeyInfo.
 *
 * @param key the public key.
 *
 * @return the asn1 representation of a SubjectPublicKeyInfo.
 */
pki.publicKeyToAsn1 = pki.publicKeyToSubjectPublicKeyInfo = function(key) {
  // SubjectPublicKeyInfo
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // AlgorithmIdentifier
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      // algorithm
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(pki.oids['rsaEncryption']).getBytes()),
      // parameters (null)
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, '')
    ]),
    // subjectPublicKey
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.BITSTRING, false, [
      pki.publicKeyToRSAPublicKey(key)
    ])
  ]);
};

/**
 * Converts a public key to an ASN.1 RSAPublicKey.
 *
 * @param key the public key.
 *
 * @return the asn1 representation of a RSAPublicKey.
 */
pki.publicKeyToRSAPublicKey = function(key) {
  // RSAPublicKey
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // modulus (n)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.n)),
    // publicExponent (e)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.e))
  ]);
};

/**
 * Converts a private key from an ASN.1 object.
 *
 * @param obj the ASN.1 representation of a PrivateKeyInfo containing an
 *          RSAPrivateKey or an RSAPrivateKey.
 *
 * @return the private key.
 */
pki.privateKeyFromAsn1 = function(obj) {
  // get PrivateKeyInfo
  var capture = {};
  var errors = [];
  if(asn1.validate(obj, privateKeyValidator, capture, errors)) {
    obj = asn1.fromDer(forge.util.createBuffer(capture.privateKey));
  }

  // get RSAPrivateKey
  capture = {};
  errors = [];
  if(!asn1.validate(obj, rsaPrivateKeyValidator, capture, errors)) {
    throw {
      message: 'Cannot read private key. ' +
        'ASN.1 object does not contain an RSAPrivateKey.',
      errors: errors
    };
  }

  // Note: Version is currently ignored.
  // capture.privateKeyVersion
  // FIXME: inefficient, get a BigInteger that uses byte strings
  var n, e, d, p, q, dP, dQ, qInv;
  n = forge.util.createBuffer(capture.privateKeyModulus).toHex();
  e = forge.util.createBuffer(capture.privateKeyPublicExponent).toHex();
  d = forge.util.createBuffer(capture.privateKeyPrivateExponent).toHex();
  p = forge.util.createBuffer(capture.privateKeyPrime1).toHex();
  q = forge.util.createBuffer(capture.privateKeyPrime2).toHex();
  dP = forge.util.createBuffer(capture.privateKeyExponent1).toHex();
  dQ = forge.util.createBuffer(capture.privateKeyExponent2).toHex();
  qInv = forge.util.createBuffer(capture.privateKeyCoefficient).toHex();

  // set private key
  return pki.setRsaPrivateKey(
    new BigInteger(n, 16),
    new BigInteger(e, 16),
    new BigInteger(d, 16),
    new BigInteger(p, 16),
    new BigInteger(q, 16),
    new BigInteger(dP, 16),
    new BigInteger(dQ, 16),
    new BigInteger(qInv, 16));
};

/**
 * Converts a private key to an ASN.1 RSAPrivateKey.
 *
 * @param key the private key.
 *
 * @return the ASN.1 representation of an RSAPrivateKey.
 */
pki.privateKeyToAsn1 = pki.privateKeyToRSAPrivateKey = function(key) {
  // RSAPrivateKey
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // version (0 = only 2 primes, 1 multiple primes)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      String.fromCharCode(0x00)),
    // modulus (n)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.n)),
    // publicExponent (e)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.e)),
    // privateExponent (d)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.d)),
    // privateKeyPrime1 (p)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.p)),
    // privateKeyPrime2 (q)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.q)),
    // privateKeyExponent1 (dP)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.dP)),
    // privateKeyExponent2 (dQ)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.dQ)),
    // coefficient (qInv)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
      _bnToBytes(key.qInv))
  ]);
};

/**
 * Wraps an RSAPrivateKey ASN.1 object in an ASN.1 PrivateKeyInfo object.
 *
 * @param rsaKey the ASN.1 RSAPrivateKey.
 *
 * @return the ASN.1 PrivateKeyInfo.
 */
pki.wrapRsaPrivateKey = function(rsaKey) {
  // PrivateKeyInfo
  return asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // version (0)
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false, '\x00'),
    // privateKeyAlgorithm
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      asn1.create(
        asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(oids['rsaEncryption']).getBytes()),
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, '')
    ]),
    // PrivateKey
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false,
      asn1.toDer(rsaKey).getBytes())
    ]);
};

/**
 * Encrypts a ASN.1 PrivateKeyInfo object, producing an EncryptedPrivateKeyInfo.
 *
 * PBES2Algorithms ALGORITHM-IDENTIFIER ::=
 *   { {PBES2-params IDENTIFIED BY id-PBES2}, ...}
 *
 * id-PBES2 OBJECT IDENTIFIER ::= {pkcs-5 13}
 *
 * PBES2-params ::= SEQUENCE {
 *   keyDerivationFunc AlgorithmIdentifier {{PBES2-KDFs}},
 *   encryptionScheme AlgorithmIdentifier {{PBES2-Encs}}
 * }
 *
 * PBES2-KDFs ALGORITHM-IDENTIFIER ::=
 *   { {PBKDF2-params IDENTIFIED BY id-PBKDF2}, ... }
 *
 * PBES2-Encs ALGORITHM-IDENTIFIER ::= { ... }
 *
 * PBKDF2-params ::= SEQUENCE {
 *   salt CHOICE {
 *     specified OCTET STRING,
 *     otherSource AlgorithmIdentifier {{PBKDF2-SaltSources}}
 *   },
 *   iterationCount INTEGER (1..MAX),
 *   keyLength INTEGER (1..MAX) OPTIONAL,
 *   prf AlgorithmIdentifier {{PBKDF2-PRFs}} DEFAULT algid-hmacWithSHA1
 * }
 *
 * @param obj the ASN.1 PrivateKeyInfo object.
 * @param password the password to encrypt with.
 * @param options:
 *          algorithm the encryption algorithm to use
 *            ('aes128', 'aes192', 'aes256', '3des'), defaults to 'aes128'.
 *          count the iteration count to use.
 *          saltSize the salt size to use.
 *
 * @return the ASN.1 EncryptedPrivateKeyInfo.
 */
pki.encryptPrivateKeyInfo = function(obj, password, options) {
  // set default options
  options = options || {};
  options.saltSize = options.saltSize || 8;
  options.count = options.count || 2048;
  options.algorithm = options.algorithm || 'aes128';

  // generate PBE params
  var salt = forge.random.getBytes(options.saltSize);
  var count = options.count;
  var countBytes = forge.util.createBuffer();
  countBytes.putInt16(count);
  var dkLen;
  var encryptionAlgorithm;
  var encryptedData;
  if(options.algorithm.indexOf('aes') === 0) {
    // Do PBES2
    var encOid;
    if(options.algorithm === 'aes128') {
      dkLen = 16;
      encOid = oids['aes128-CBC'];
    }
    else if(options.algorithm === 'aes192') {
      dkLen = 24;
      encOid = oids['aes192-CBC'];
    }
    else if(options.algorithm === 'aes256') {
      dkLen = 32;
      encOid = oids['aes256-CBC'];
    }
    else {
      throw {
        message: 'Cannot encrypt private key. Unknown encryption algorithm.',
        algorithm: options.algorithm
      };
    }

    // encrypt private key using pbe SHA-1 and AES
    var dk = forge.pkcs5.pbkdf2(password, salt, count, dkLen);
    var iv = forge.random.getBytes(16);
    var cipher = forge.aes.createEncryptionCipher(dk);
    cipher.start(iv);
    cipher.update(asn1.toDer(obj));
    cipher.finish();
    encryptedData = cipher.output.getBytes();

    encryptionAlgorithm = asn1.create(
      asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(oids['pkcs5PBES2']).getBytes()),
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        // keyDerivationFunc
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
            asn1.oidToDer(oids['pkcs5PBKDF2']).getBytes()),
          // PBKDF2-params
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
            // salt
            asn1.create(
              asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, salt),
            // iteration count
            asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
              countBytes.getBytes())
          ])
        ]),
        // encryptionScheme
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
          asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
            asn1.oidToDer(encOid).getBytes()),
          // iv
          asn1.create(
            asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, iv)
        ])
      ])
    ]);
  }
  else if(options.algorithm === '3des') {
    // Do PKCS12 PBE
    dkLen = 24;

    var saltBytes = new forge.util.ByteBuffer(salt);
    var dk = forge.pkcs12.generateKey(password, saltBytes, 1, count, dkLen);
    var iv = forge.pkcs12.generateKey(password, saltBytes, 2, count, dkLen);
    var cipher = forge.des.createEncryptionCipher(dk);
    cipher.start(iv);
    cipher.update(asn1.toDer(obj));
    cipher.finish();
    encryptedData = cipher.output.getBytes();

    encryptionAlgorithm = asn1.create(
      asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false,
        asn1.oidToDer(oids['pbeWithSHAAnd3-KeyTripleDES-CBC']).getBytes()),
      // pkcs-12PbeParams
      asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
        // salt
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, salt),
        // iteration count
        asn1.create(asn1.Class.UNIVERSAL, asn1.Type.INTEGER, false,
          countBytes.getBytes())
      ])
    ]);
  }
  else {
    throw {
      message: 'Cannot encrypt private key. Unknown encryption algorithm.',
      algorithm: options.algorithm
    };
  }

  // EncryptedPrivateKeyInfo
  var rval = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    // encryptionAlgorithm
    encryptionAlgorithm,
    // encryptedData
    asn1.create(
      asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, encryptedData)
  ]);
  return rval;
};

/**
 * Get new Forge cipher object instance according to PBES2 params block.
 *
 * The returned cipher instance is already started using the IV
 * from PBES2 parameter block.
 *
 * @param oid The PKCS#12 PBE OID (in string notation).
 * @param params The ASN.1 PBES2-params object.
 * @param password The password to decrypt with.
 * @return New cipher object instance.
 */
pki.pbe.getCipherForPBES2 = function(oid, params, password) {
  // get PBE params
  var capture = {};
  var errors = [];
  if(!asn1.validate(params, PBES2AlgorithmsValidator, capture, errors)) {
    throw {
      message: 'Cannot read password-based-encryption algorithm ' +
        'parameters. ASN.1 object is not a supported ' +
        'EncryptedPrivateKeyInfo.',
      errors: errors
    };
  }

  // check oids
  oid = asn1.derToOid(capture.kdfOid);
  if(oid !== pki.oids['pkcs5PBKDF2']) {
    throw {
      message: 'Cannot read encrypted private key. ' +
        'Unsupported key derivation function OID.',
      oid: oid,
      supportedOids: ['pkcs5PBKDF2']
    };
  }
  oid = asn1.derToOid(capture.encOid);
  if(oid !== pki.oids['aes128-CBC'] &&
    oid !== pki.oids['aes192-CBC'] &&
    oid !== pki.oids['aes256-CBC']) {
    throw {
      message: 'Cannot read encrypted private key. ' +
        'Unsupported encryption scheme OID.',
      oid: oid,
      supportedOids: ['aes128-CBC', 'aes192-CBC', 'aes256-CBC']
    };
  }

  // set PBE params
  var salt = capture.kdfSalt;
  var count = forge.util.createBuffer(capture.kdfIterationCount);
  count = count.getInt(count.length() << 3);
  var dkLen;
  if(oid === pki.oids['aes128-CBC']) {
    dkLen = 16;
  }
  else if(oid === pki.oids['aes192-CBC']) {
    dkLen = 24;
  }
  else if(oid === pki.oids['aes256-CBC']) {
    dkLen = 32;
  }

  // decrypt private key using pbe SHA-1 and AES
  var dk = forge.pkcs5.pbkdf2(password, salt, count, dkLen);
  var iv = capture.encIv;
  var cipher = forge.aes.createDecryptionCipher(dk);
  cipher.start(iv);

  return cipher;
};

/**
 * Get new Forge cipher object instance for PKCS#12 PBE.
 *
 * The returned cipher instance is already started using the key & IV
 * derived from the provided password and PKCS#12 PBE salt.
 *
 * @param oid The PKCS#12 PBE OID (in string notation).
 * @param params The ASN.1 PKCS#12 PBE-params object.
 * @param password The password to decrypt with.
 * @return New cipher object instance.
 */
pki.pbe.getCipherForPKCS12PBE = function(oid, params, password) {
  // get PBE params
  var capture = {};
  var errors = [];
  if(!asn1.validate(params, pkcs12PbeParamsValidator, capture, errors)) {
    throw {
      message: 'Cannot read password-based-encryption algorithm ' +
        'parameters. ASN.1 object is not a supported ' +
        'EncryptedPrivateKeyInfo.',
      errors: errors
    };
  }

  var salt = forge.util.createBuffer(capture.salt);
  var count = forge.util.createBuffer(capture.iterations);
  count = count.getInt(count.length() << 3);

  var dkLen, dIvLen, cipherFn;
  switch(oid) {
    case pki.oids['pbeWithSHAAnd3-KeyTripleDES-CBC']:
      dkLen = 24;
      dIvLen = 8;
      cipherFn = forge.des.startDecrypting;
      break;

    case pki.oids['pbewithSHAAnd40BitRC2-CBC']:
      dkLen = 5;
      dIvLen = 8;
      cipherFn = function(key, iv) {
        var cipher = forge.rc2.createDecryptionCipher(key, 40);
        cipher.start(iv, null);
        return cipher;
      };
      break;

    default:
      throw {
        message: 'Cannot read PKCS #12 PBE data block. Unsupported OID.',
        oid: oid
      };
  }

  var key = forge.pkcs12.generateKey(password, salt, 1, count, dkLen);
  var iv = forge.pkcs12.generateKey(password, salt, 2, count, dIvLen);

  return cipherFn(key, iv);
};

pki.pbe.getCipher = function(oid, params, password) {
  switch(oid) {
  case pki.oids['pkcs5PBES2']:
    return pki.pbe.getCipherForPBES2(oid, params, password);
    break;

  case pki.oids['pbeWithSHAAnd3-KeyTripleDES-CBC']:
  case pki.oids['pbewithSHAAnd40BitRC2-CBC']:
    return pki.pbe.getCipherForPKCS12PBE(oid, params, password);
    break;

  default:
    throw {
      message: 'Cannot read encrypted PBE data block. Unsupported OID.',
      oid: oid,
      supportedOids: [
        'pkcs5PBES2',
        'pbeWithSHAAnd3-KeyTripleDES-CBC',
        'pbewithSHAAnd40BitRC2-CBC'
      ]
    };
  }
};

/**
 * Decrypts a ASN.1 PrivateKeyInfo object.
 *
 * @param obj the ASN.1 EncryptedPrivateKeyInfo object.
 * @param password the password to decrypt with.
 *
 * @return the ASN.1 PrivateKeyInfo on success, null on failure.
 */
pki.decryptPrivateKeyInfo = function(obj, password) {
  var rval = null;

  // get PBE params
  var capture = {};
  var errors = [];
  if(!asn1.validate(obj, encryptedPrivateKeyValidator, capture, errors)) {
    throw {
      message: 'Cannot read encrypted private key. ' +
        'ASN.1 object is not a supported EncryptedPrivateKeyInfo.',
      errors: errors
    };
  }

  // get cipher
  var oid = asn1.derToOid(capture.encryptionOid);
  var cipher = pki.pbe.getCipher(oid, capture.encryptionParams, password);

  // get encrypted data
  var encrypted = forge.util.createBuffer(capture.encryptedData);

  cipher.update(encrypted);
  if(cipher.finish()) {
    rval = asn1.fromDer(cipher.output);
  }

  return rval;
};

/**
 * Converts a EncryptedPrivateKeyInfo to PEM format.
 *
 * @param epki the EncryptedPrivateKeyInfo.
 * @param maxline the maximum characters per line, defaults to 64.
 *
 * @return the PEM-formatted encrypted private key.
 */
pki.encryptedPrivateKeyToPem = function(epki, maxline) {
  // convert to DER, then PEM-encode
  var msg = {
    type: 'ENCRYPTED PRIVATE KEY',
    body: asn1.toDer(epki).getBytes()
  };
  return forge.pem.encode(msg, {maxline: maxline});
};

/**
 * Converts a PEM-encoded EncryptedPrivateKeyInfo to ASN.1 format. Decryption
 * is not performed.
 *
 * @param pem the EncryptedPrivateKeyInfo in PEM-format.
 *
 * @return the ASN.1 EncryptedPrivateKeyInfo.
 */
pki.encryptedPrivateKeyFromPem = function(pem) {
  var msg = forge.pem.decode(pem)[0];

  if(msg.type !== 'ENCRYPTED PRIVATE KEY') {
    throw {
      message: 'Could not convert encrypted private key from PEM; PEM header ' +
        'type is "ENCRYPTED PRIVATE KEY".',
      headerType: msg.type
    };
  }
  if(msg.procType && msg.procType.type === 'ENCRYPTED') {
    throw {
      message: 'Could not convert encrypted private key from PEM; ' +
        'PEM is encrypted.'
    };
  }

  // convert DER to ASN.1 object
  return asn1.fromDer(msg.body);
};

/**
 * Encrypts an RSA private key. By default, the key will be wrapped in
 * a PrivateKeyInfo and encrypted to produce a PKCS#8 EncryptedPrivateKeyInfo.
 * This is the standard, preferred way to encrypt a private key.
 *
 * To produce a non-standard PEM-encrypted private key that uses encapsulated
 * headers to indicate the encryption algorithm (old-style non-PKCS#8 OpenSSL
 * private key encryption), set the 'legacy' option to true. Note: Using this
 * option will cause the iteration count to be forced to 1.
 *
 * @param rsaKey the RSA key to encrypt.
 * @param password the password to use.
 * @param options:
 *          algorithm: the encryption algorithm to use
 *            ('aes128', 'aes192', 'aes256', '3des').
 *          count: the iteration count to use.
 *          saltSize: the salt size to use.
 *          legacy: output an old non-PKCS#8 PEM-encrypted+encapsulated
 *            headers (DEK-Info) private key.
 *
 * @return the PEM-encoded ASN.1 EncryptedPrivateKeyInfo.
 */
pki.encryptRsaPrivateKey = function(rsaKey, password, options) {
  // standard PKCS#8
  options = options || {};
  if(!options.legacy) {
    // encrypt PrivateKeyInfo
    var rval = pki.wrapRsaPrivateKey(pki.privateKeyToAsn1(rsaKey));
    rval = pki.encryptPrivateKeyInfo(rval, password, options);
    return pki.encryptedPrivateKeyToPem(rval);
  }

  // legacy non-PKCS#8
  var algorithm;
  var iv;
  var dkLen;
  var cipherFn;
  switch(options.algorithm) {
  case 'aes128':
    algorithm = 'AES-128-CBC';
    dkLen = 16;
    iv = forge.random.getBytes(16);
    cipherFn = forge.aes.createEncryptionCipher;
    break;
  case 'aes192':
    algorithm = 'AES-192-CBC';
    dkLen = 24;
    iv = forge.random.getBytes(16);
    cipherFn = forge.aes.createEncryptionCipher;
    break;
  case 'aes256':
    algorithm = 'AES-256-CBC';
    dkLen = 32;
    iv = forge.random.getBytes(16);
    cipherFn = forge.aes.createEncryptionCipher;
    break;
  case '3des':
    algorithm = 'DES-EDE3-CBC';
    dkLen = 24;
    iv = forge.random.getBytes(8);
    cipherFn = forge.des.createEncryptionCipher;
    break;
  default:
    throw {
      message: 'Could not encrypt RSA private key; unsupported encryption ' +
        'algorithm "' + options.algorithm + '".',
      algorithm: options.algorithm
    };
  }

  // encrypt private key using OpenSSL legacy key derivation
  var dk = evpBytesToKey(password, iv.substr(0, 8), dkLen);
  var cipher = cipherFn(dk);
  cipher.start(iv);
  cipher.update(asn1.toDer(pki.privateKeyToAsn1(rsaKey)));
  cipher.finish();

  var msg = {
    type: 'RSA PRIVATE KEY',
    procType: {
      version: '4',
      type: 'ENCRYPTED'
    },
    dekInfo: {
      algorithm: algorithm,
      parameters: forge.util.bytesToHex(iv).toUpperCase()
    },
    body: cipher.output.getBytes()
  };
  return forge.pem.encode(msg);
};

/**
 * Decrypts an RSA private key.
 *
 * @param pem the PEM-formatted EncryptedPrivateKeyInfo to decrypt.
 * @param password the password to use.
 *
 * @return the RSA key on success, null on failure.
 */
pki.decryptRsaPrivateKey = function(pem, password) {
  var rval = null;

  var msg = forge.pem.decode(pem)[0];

  if(msg.type !== 'ENCRYPTED PRIVATE KEY' &&
    msg.type !== 'PRIVATE KEY' &&
    msg.type !== 'RSA PRIVATE KEY') {
    throw {
      message: 'Could not convert private key from PEM; PEM header type is ' +
        'not "ENCRYPTED PRIVATE KEY", "PRIVATE KEY", or "RSA PRIVATE KEY".',
      headerType: msg.type
    };
  }

  if(msg.procType && msg.procType.type === 'ENCRYPTED') {
    var dkLen;
    var cipherFn;
    switch(msg.dekInfo.algorithm) {
    case 'DES-EDE3-CBC':
      dkLen = 24;
      cipherFn = forge.des.createDecryptionCipher;
      break;
    case 'AES-128-CBC':
      dkLen = 16;
      cipherFn = forge.aes.createDecryptionCipher;
      break;
    case 'AES-192-CBC':
      dkLen = 24;
      cipherFn = forge.aes.createDecryptionCipher;
      break;
    case 'AES-256-CBC':
      dkLen = 32;
      cipherFn = forge.aes.createDecryptionCipher;
      break;
    case 'RC2-40-CBC':
      dkLen = 5;
      cipherFn = function(key) {
        return forge.rc2.createDecryptionCipher(key, 40);
      };
      break;
    case 'RC2-64-CBC':
      dkLen = 8;
      cipherFn = function(key) {
        return forge.rc2.createDecryptionCipher(key, 64);
      };
      break;
    case 'RC2-128-CBC':
      dkLen = 16;
      cipherFn = function(key) {
        return forge.rc2.createDecryptionCipher(key, 128);
      };
      break;
    default:
      throw {
        message: 'Could not decrypt private key; unsupported encryption ' +
          'algorithm "' + msg.dekInfo.algorithm + '".',
        algorithm: msg.dekInfo.algorithm
      };
    }

    // use OpenSSL legacy key derivation
    var iv = forge.util.hexToBytes(msg.dekInfo.parameters);
    var dk = evpBytesToKey(password, iv.substr(0, 8), dkLen);
    var cipher = cipherFn(dk);
    cipher.start(iv);
    cipher.update(forge.util.createBuffer(msg.body));
    if(cipher.finish()) {
      rval = cipher.output.getBytes();
    }
    else {
      return rval;
    }
  }
  else {
    rval = msg.body;
  }

  if(msg.type === 'ENCRYPTED PRIVATE KEY') {
    rval = pki.decryptPrivateKeyInfo(asn1.fromDer(rval), password);
  }
  else {
    // decryption already performed above
    rval = asn1.fromDer(rval);
  }

  if(rval !== null) {
    rval = pki.privateKeyFromAsn1(rval);
  }

  return rval;
};

/**
 * OpenSSL's legacy key derivation function.
 *
 * See: http://www.openssl.org/docs/crypto/EVP_BytesToKey.html
 *
 * @param password the password to derive the key from.
 * @param salt the salt to use.
 * @param dkLen the number of bytes needed for the derived key.
 */
function evpBytesToKey(password, salt, dkLen) {
  var digests = [md5(password + salt)];
  for(var length = 16, i = 1; length < dkLen; ++i, length += 16) {
    digests.push(md5(digests[i - 1] + password + salt));
  }
  return digests.join('').substr(0, dkLen);
}

function md5(bytes) {
  return forge.md.md5.create().update(bytes).digest().getBytes();
}

/**
 * Sets an RSA public key from BigIntegers modulus and exponent.
 *
 * @param n the modulus.
 * @param e the exponent.
 *
 * @return the public key.
 */
pki.setRsaPublicKey = pki.rsa.setPublicKey;

/**
 * Sets an RSA private key from BigIntegers modulus, exponent, primes,
 * prime exponents, and modular multiplicative inverse.
 *
 * @param n the modulus.
 * @param e the public exponent.
 * @param d the private exponent ((inverse of e) mod n).
 * @param p the first prime.
 * @param q the second prime.
 * @param dP exponent1 (d mod (p-1)).
 * @param dQ exponent2 (d mod (q-1)).
 * @param qInv ((inverse of q) mod p)
 *
 * @return the private key.
 */
pki.setRsaPrivateKey = pki.rsa.setPrivateKey;

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'pki';
var deps = [
  './aes',
  './asn1',
  './des',
  './jsbn',
  './md',
  './mgf',
  './oids',
  './pem',
  './pbkdf2',
  './pkcs12',
  './pss',
  './random',
  './rc2',
  './rsa',
  './util'
];
var nodeDefine = null;
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    nodeDefine = function(ids, factory) {
      factory(require, module);
    };
  }
  // <script>
  else {
    if(typeof forge === 'undefined') {
      forge = {};
    }
    initModule(forge);
  }
}
// AMD
var defineDeps = ['require', 'module'].concat(deps);
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
if(nodeDefine) {
  nodeDefine(defineDeps, defineFunc);
}
else if(typeof define === 'function') {
  define([].concat(defineDeps), function() {
    defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
  });
}
})();

/**
* @license Gibberish-AES 
* A lightweight Javascript Libray for OpenSSL compatible AES CBC encryption.
*
* Author: Mark Percival
* Email: mark@mpercival.com
* Copyright: Mark Percival - http://mpercival.com 2008
*
* With thanks to:
* Josh Davis - http://www.josh-davis.org/ecmaScrypt
* Chris Veness - http://www.movable-type.co.uk/scripts/aes.html
* Michel I. Gallant - http://www.jensign.com/
* Jean-Luc Cooke <jlcooke@certainkey.com> 2012-07-12: added strhex + invertArr to compress G2X/G3X/G9X/GBX/GEX/SBox/SBoxInv/Rcon saving over 7KB, and added encString, decString, also made the MD5 routine more easlier compressible using yuicompressor.
*
* License: MIT
*
* Usage: GibberishAES.enc("secret", "password")
* Outputs: AES Encrypted text encoded in Base64
*/


var GibberishAES = (function(){
    var Nr = 14,
    /* Default to 256 Bit Encryption */
    Nk = 8,
    Decrypt = false,

    enc_utf8 = function(s)
    {
        try {
            return unescape(encodeURIComponent(s));
        }
        catch(e) {
            throw 'Error on UTF-8 encode';
        }
    },

    dec_utf8 = function(s)
    {
        try {
            return decodeURIComponent(escape(s));
        }
        catch(e) {
            throw ('Bad Key');
        }
    },

    padBlock = function(byteArr)
    {
        var array = [], cpad, i;
        if (byteArr.length < 16) {
            cpad = 16 - byteArr.length;
            array = [cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad, cpad];
        }
        for (i = 0; i < byteArr.length; i++)
        {
            array[i] = byteArr[i];
        }
        return array;
    },

    block2s = function(block, lastBlock)
    {
        var string = '', padding, i;
        if (lastBlock) {
            padding = block[15];
            if (padding > 16) {
                throw ('Decryption error: Maybe bad key');
            }
            if (padding == 16) {
                return '';
            }
            for (i = 0; i < 16 - padding; i++) {
                string += String.fromCharCode(block[i]);
            }
        } else {
            for (i = 0; i < 16; i++) {
                string += String.fromCharCode(block[i]);
            }
        }
        return string;
    },

    a2h = function(numArr)
    {
        var string = '', i;
        for (i = 0; i < numArr.length; i++) {
            string += (numArr[i] < 16 ? '0': '') + numArr[i].toString(16);
        }
        return string;
    },

    h2a = function(s)
    {
        var ret = [];
        s.replace(/(..)/g,
        function(s) {
            ret.push(parseInt(s, 16));
        });
        return ret;
    },

    s2a = function(string, binary) {
        var array = [], i;

        if (! binary) {
            string = enc_utf8(string);
        }

        for (i = 0; i < string.length; i++)
        {
            array[i] = string.charCodeAt(i);
        }

        return array;
    },

    size = function(newsize)
    {
        switch (newsize)
        {
        case 128:
            Nr = 10;
            Nk = 4;
            break;
        case 192:
            Nr = 12;
            Nk = 6;
            break;
        case 256:
            Nr = 14;
            Nk = 8;
            break;
        default:
            throw ('Invalid Key Size Specified:' + newsize);
        }
    },

    randArr = function(num) {
        var result = [], i;
        for (i = 0; i < num; i++) {
            result = result.concat(Math.floor(Math.random() * 256));
        }
        return result;
    },

    openSSLKey = function(passwordArr, saltArr) {
        // Number of rounds depends on the size of the AES in use
        // 3 rounds for 256
        //        2 rounds for the key, 1 for the IV
        // 2 rounds for 128
        //        1 round for the key, 1 round for the IV
        // 3 rounds for 192 since it's not evenly divided by 128 bits
        var rounds = Nr >= 12 ? 3: 2,
        key = [],
        iv = [],
        md5_hash = [],
        result = [],
        data00 = passwordArr.concat(saltArr),
        i;
        md5_hash[0] = GibberishAES.Hash.MD5(data00);
        result = md5_hash[0];
        for (i = 1; i < rounds; i++) {
            md5_hash[i] = GibberishAES.Hash.MD5(md5_hash[i - 1].concat(data00));
            result = result.concat(md5_hash[i]);
        }
        key = result.slice(0, 4 * Nk);
        iv = result.slice(4 * Nk, 4 * Nk + 16);
        return {
            key: key,
            iv: iv
        };
    },

    rawEncrypt = function(plaintext, key, iv) {
        // plaintext, key and iv as byte arrays
        key = expandKey(key);
        var numBlocks = Math.ceil(plaintext.length / 16),
        blocks = [],
        i,
        cipherBlocks = [];
        for (i = 0; i < numBlocks; i++) {
            blocks[i] = padBlock(plaintext.slice(i * 16, i * 16 + 16));
        }
        if (plaintext.length % 16 === 0) {
            blocks.push([16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]);
            // CBC OpenSSL padding scheme
            numBlocks++;
        }
        for (i = 0; i < blocks.length; i++) {
            blocks[i] = (i === 0) ? xorBlocks(blocks[i], iv) : xorBlocks(blocks[i], cipherBlocks[i - 1]);
            cipherBlocks[i] = encryptBlock(blocks[i], key);
        }
        return cipherBlocks;
    },

    rawDecrypt = function(cryptArr, key, iv, binary) {
        //  cryptArr, key and iv as byte arrays
        key = expandKey(key);
        var numBlocks = cryptArr.length / 16,
        cipherBlocks = [],
        i,
        plainBlocks = [],
        string = '';
        for (i = 0; i < numBlocks; i++) {
            cipherBlocks.push(cryptArr.slice(i * 16, (i + 1) * 16));
        }
        for (i = cipherBlocks.length - 1; i >= 0; i--) {
            plainBlocks[i] = decryptBlock(cipherBlocks[i], key);
            plainBlocks[i] = (i === 0) ? xorBlocks(plainBlocks[i], iv) : xorBlocks(plainBlocks[i], cipherBlocks[i - 1]);
        }
        for (i = 0; i < numBlocks - 1; i++) {
            string += block2s(plainBlocks[i]);
        }
        string += block2s(plainBlocks[i], true);
        return binary ? string : dec_utf8(string); 
    },

    encryptBlock = function(block, words) {
        Decrypt = false;
        var state = addRoundKey(block, words, 0),
        round;
        for (round = 1; round < (Nr + 1); round++) {
            state = subBytes(state);
            state = shiftRows(state);
            if (round < Nr) {
                state = mixColumns(state);
            }
            //last round? don't mixColumns
            state = addRoundKey(state, words, round);
        }

        return state;
    },

    decryptBlock = function(block, words) {
        Decrypt = true;
        var state = addRoundKey(block, words, Nr),
        round;
        for (round = Nr - 1; round > -1; round--) {
            state = shiftRows(state);
            state = subBytes(state);
            state = addRoundKey(state, words, round);
            if (round > 0) {
                state = mixColumns(state);
            }
            //last round? don't mixColumns
        }

        return state;
    },

    subBytes = function(state) {
        var S = Decrypt ? SBoxInv: SBox,
        temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = S[state[i]];
        }
        return temp;
    },

    shiftRows = function(state) {
        var temp = [],
        shiftBy = Decrypt ? [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3] : [0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = state[shiftBy[i]];
        }
        return temp;
    },

    mixColumns = function(state) {
        var t = [],
        c;
        if (!Decrypt) {
            for (c = 0; c < 4; c++) {
                t[c * 4] = G2X[state[c * 4]] ^ G3X[state[1 + c * 4]] ^ state[2 + c * 4] ^ state[3 + c * 4];
                t[1 + c * 4] = state[c * 4] ^ G2X[state[1 + c * 4]] ^ G3X[state[2 + c * 4]] ^ state[3 + c * 4];
                t[2 + c * 4] = state[c * 4] ^ state[1 + c * 4] ^ G2X[state[2 + c * 4]] ^ G3X[state[3 + c * 4]];
                t[3 + c * 4] = G3X[state[c * 4]] ^ state[1 + c * 4] ^ state[2 + c * 4] ^ G2X[state[3 + c * 4]];
            }
        }else {
            for (c = 0; c < 4; c++) {
                t[c*4] = GEX[state[c*4]] ^ GBX[state[1+c*4]] ^ GDX[state[2+c*4]] ^ G9X[state[3+c*4]];
                t[1+c*4] = G9X[state[c*4]] ^ GEX[state[1+c*4]] ^ GBX[state[2+c*4]] ^ GDX[state[3+c*4]];
                t[2+c*4] = GDX[state[c*4]] ^ G9X[state[1+c*4]] ^ GEX[state[2+c*4]] ^ GBX[state[3+c*4]];
                t[3+c*4] = GBX[state[c*4]] ^ GDX[state[1+c*4]] ^ G9X[state[2+c*4]] ^ GEX[state[3+c*4]];
            }
        }
        
        return t;
    },

    addRoundKey = function(state, words, round) {
        var temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = state[i] ^ words[round][i];
        }
        return temp;
    },

    xorBlocks = function(block1, block2) {
        var temp = [],
        i;
        for (i = 0; i < 16; i++) {
            temp[i] = block1[i] ^ block2[i];
        }
        return temp;
    },

    expandKey = function(key) {
        // Expects a 1d number array
        var w = [],
        temp = [],
        i,
        r,
        t,
        flat = [],
        j;

        for (i = 0; i < Nk; i++) {
            r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
            w[i] = r;
        }

        for (i = Nk; i < (4 * (Nr + 1)); i++) {
            w[i] = [];
            for (t = 0; t < 4; t++) {
                temp[t] = w[i - 1][t];
            }
            if (i % Nk === 0) {
                temp = subWord(rotWord(temp));
                temp[0] ^= Rcon[i / Nk - 1];
            } else if (Nk > 6 && i % Nk == 4) {
                temp = subWord(temp);
            }
            for (t = 0; t < 4; t++) {
                w[i][t] = w[i - Nk][t] ^ temp[t];
            }
        }
        for (i = 0; i < (Nr + 1); i++) {
            flat[i] = [];
            for (j = 0; j < 4; j++) {
                flat[i].push(w[i * 4 + j][0], w[i * 4 + j][1], w[i * 4 + j][2], w[i * 4 + j][3]);
            }
        }
        return flat;
    },

    subWord = function(w) {
        // apply SBox to 4-byte word w
        for (var i = 0; i < 4; i++) {
            w[i] = SBox[w[i]];
        }
        return w;
    },

    rotWord = function(w) {
        // rotate 4-byte word w left by one byte
        var tmp = w[0],
        i;
        for (i = 0; i < 4; i++) {
            w[i] = w[i + 1];
        }
        w[3] = tmp;
        return w;
    },

// jlcooke: 2012-07-12: added strhex + invertArr to compress G2X/G3X/G9X/GBX/GEX/SBox/SBoxInv/Rcon saving over 7KB, and added encString, decString
    strhex = function(str,size) {
        var ret = [];
        for (var i=0; i<str.length; i+=size)
            ret[i/size] = parseInt(str.substr(i,size), 16);
        return ret;
    },
    invertArr = function(arr) {
        var ret = [];
        for (var i=0; i<arr.length; i++)
            ret[arr[i]] = i;
        return ret;
    },
    Gxx = function(a, b) {
        var i, ret;

        ret = 0;
        for (i=0; i<8; i++) {
            ret = ((b&1)==1) ? ret^a : ret;
            /* xmult */
            a = (a>0x7f) ? 0x11b^(a<<1) : (a<<1);
            b >>>= 1;
        }

        return ret;
    },
    Gx = function(x) {
        var r = [];
        for (var i=0; i<256; i++)
            r[i] = Gxx(x, i);
        return r;
    },

    // S-box
/*
    SBox = [
    99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171,
    118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164,
    114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113,
    216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226,
    235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214,
    179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203,
    190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69,
    249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245,
    188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68,
    23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42,
    144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73,
    6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109,
    141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37,
    46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62,
    181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225,
    248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223,
    140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187,
    22], //*/ SBox = strhex('637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16',2),

    // Precomputed lookup table for the inverse SBox
/*    SBoxInv = [
    82, 9, 106, 213, 48, 54, 165, 56, 191, 64, 163, 158, 129, 243, 215,
    251, 124, 227, 57, 130, 155, 47, 255, 135, 52, 142, 67, 68, 196, 222,
    233, 203, 84, 123, 148, 50, 166, 194, 35, 61, 238, 76, 149, 11, 66,
    250, 195, 78, 8, 46, 161, 102, 40, 217, 36, 178, 118, 91, 162, 73,
    109, 139, 209, 37, 114, 248, 246, 100, 134, 104, 152, 22, 212, 164, 92,
    204, 93, 101, 182, 146, 108, 112, 72, 80, 253, 237, 185, 218, 94, 21,
    70, 87, 167, 141, 157, 132, 144, 216, 171, 0, 140, 188, 211, 10, 247,
    228, 88, 5, 184, 179, 69, 6, 208, 44, 30, 143, 202, 63, 15, 2,
    193, 175, 189, 3, 1, 19, 138, 107, 58, 145, 17, 65, 79, 103, 220,
    234, 151, 242, 207, 206, 240, 180, 230, 115, 150, 172, 116, 34, 231, 173,
    53, 133, 226, 249, 55, 232, 28, 117, 223, 110, 71, 241, 26, 113, 29,
    41, 197, 137, 111, 183, 98, 14, 170, 24, 190, 27, 252, 86, 62, 75,
    198, 210, 121, 32, 154, 219, 192, 254, 120, 205, 90, 244, 31, 221, 168,
    51, 136, 7, 199, 49, 177, 18, 16, 89, 39, 128, 236, 95, 96, 81,
    127, 169, 25, 181, 74, 13, 45, 229, 122, 159, 147, 201, 156, 239, 160,
    224, 59, 77, 174, 42, 245, 176, 200, 235, 187, 60, 131, 83, 153, 97,
    23, 43, 4, 126, 186, 119, 214, 38, 225, 105, 20, 99, 85, 33, 12,
    125], //*/ SBoxInv = invertArr(SBox),

    // Rijndael Rcon
/*
    Rcon = [1, 2, 4, 8, 16, 32, 64, 128, 27, 54, 108, 216, 171, 77, 154, 47, 94,
    188, 99, 198, 151, 53, 106, 212, 179, 125, 250, 239, 197, 145],
//*/ Rcon = strhex('01020408102040801b366cd8ab4d9a2f5ebc63c697356ad4b37dfaefc591',2),

/*
    G2X = [
    0x00, 0x02, 0x04, 0x06, 0x08, 0x0a, 0x0c, 0x0e, 0x10, 0x12, 0x14, 0x16,
    0x18, 0x1a, 0x1c, 0x1e, 0x20, 0x22, 0x24, 0x26, 0x28, 0x2a, 0x2c, 0x2e,
    0x30, 0x32, 0x34, 0x36, 0x38, 0x3a, 0x3c, 0x3e, 0x40, 0x42, 0x44, 0x46,
    0x48, 0x4a, 0x4c, 0x4e, 0x50, 0x52, 0x54, 0x56, 0x58, 0x5a, 0x5c, 0x5e,
    0x60, 0x62, 0x64, 0x66, 0x68, 0x6a, 0x6c, 0x6e, 0x70, 0x72, 0x74, 0x76,
    0x78, 0x7a, 0x7c, 0x7e, 0x80, 0x82, 0x84, 0x86, 0x88, 0x8a, 0x8c, 0x8e,
    0x90, 0x92, 0x94, 0x96, 0x98, 0x9a, 0x9c, 0x9e, 0xa0, 0xa2, 0xa4, 0xa6,
    0xa8, 0xaa, 0xac, 0xae, 0xb0, 0xb2, 0xb4, 0xb6, 0xb8, 0xba, 0xbc, 0xbe,
    0xc0, 0xc2, 0xc4, 0xc6, 0xc8, 0xca, 0xcc, 0xce, 0xd0, 0xd2, 0xd4, 0xd6,
    0xd8, 0xda, 0xdc, 0xde, 0xe0, 0xe2, 0xe4, 0xe6, 0xe8, 0xea, 0xec, 0xee,
    0xf0, 0xf2, 0xf4, 0xf6, 0xf8, 0xfa, 0xfc, 0xfe, 0x1b, 0x19, 0x1f, 0x1d,
    0x13, 0x11, 0x17, 0x15, 0x0b, 0x09, 0x0f, 0x0d, 0x03, 0x01, 0x07, 0x05,
    0x3b, 0x39, 0x3f, 0x3d, 0x33, 0x31, 0x37, 0x35, 0x2b, 0x29, 0x2f, 0x2d,
    0x23, 0x21, 0x27, 0x25, 0x5b, 0x59, 0x5f, 0x5d, 0x53, 0x51, 0x57, 0x55,
    0x4b, 0x49, 0x4f, 0x4d, 0x43, 0x41, 0x47, 0x45, 0x7b, 0x79, 0x7f, 0x7d,
    0x73, 0x71, 0x77, 0x75, 0x6b, 0x69, 0x6f, 0x6d, 0x63, 0x61, 0x67, 0x65,
    0x9b, 0x99, 0x9f, 0x9d, 0x93, 0x91, 0x97, 0x95, 0x8b, 0x89, 0x8f, 0x8d,
    0x83, 0x81, 0x87, 0x85, 0xbb, 0xb9, 0xbf, 0xbd, 0xb3, 0xb1, 0xb7, 0xb5,
    0xab, 0xa9, 0xaf, 0xad, 0xa3, 0xa1, 0xa7, 0xa5, 0xdb, 0xd9, 0xdf, 0xdd,
    0xd3, 0xd1, 0xd7, 0xd5, 0xcb, 0xc9, 0xcf, 0xcd, 0xc3, 0xc1, 0xc7, 0xc5,
    0xfb, 0xf9, 0xff, 0xfd, 0xf3, 0xf1, 0xf7, 0xf5, 0xeb, 0xe9, 0xef, 0xed,
    0xe3, 0xe1, 0xe7, 0xe5
    ], //*/ G2X = Gx(2),

/*    G3X = [
    0x00, 0x03, 0x06, 0x05, 0x0c, 0x0f, 0x0a, 0x09, 0x18, 0x1b, 0x1e, 0x1d,
    0x14, 0x17, 0x12, 0x11, 0x30, 0x33, 0x36, 0x35, 0x3c, 0x3f, 0x3a, 0x39,
    0x28, 0x2b, 0x2e, 0x2d, 0x24, 0x27, 0x22, 0x21, 0x60, 0x63, 0x66, 0x65,
    0x6c, 0x6f, 0x6a, 0x69, 0x78, 0x7b, 0x7e, 0x7d, 0x74, 0x77, 0x72, 0x71,
    0x50, 0x53, 0x56, 0x55, 0x5c, 0x5f, 0x5a, 0x59, 0x48, 0x4b, 0x4e, 0x4d,
    0x44, 0x47, 0x42, 0x41, 0xc0, 0xc3, 0xc6, 0xc5, 0xcc, 0xcf, 0xca, 0xc9,
    0xd8, 0xdb, 0xde, 0xdd, 0xd4, 0xd7, 0xd2, 0xd1, 0xf0, 0xf3, 0xf6, 0xf5,
    0xfc, 0xff, 0xfa, 0xf9, 0xe8, 0xeb, 0xee, 0xed, 0xe4, 0xe7, 0xe2, 0xe1,
    0xa0, 0xa3, 0xa6, 0xa5, 0xac, 0xaf, 0xaa, 0xa9, 0xb8, 0xbb, 0xbe, 0xbd,
    0xb4, 0xb7, 0xb2, 0xb1, 0x90, 0x93, 0x96, 0x95, 0x9c, 0x9f, 0x9a, 0x99,
    0x88, 0x8b, 0x8e, 0x8d, 0x84, 0x87, 0x82, 0x81, 0x9b, 0x98, 0x9d, 0x9e,
    0x97, 0x94, 0x91, 0x92, 0x83, 0x80, 0x85, 0x86, 0x8f, 0x8c, 0x89, 0x8a,
    0xab, 0xa8, 0xad, 0xae, 0xa7, 0xa4, 0xa1, 0xa2, 0xb3, 0xb0, 0xb5, 0xb6,
    0xbf, 0xbc, 0xb9, 0xba, 0xfb, 0xf8, 0xfd, 0xfe, 0xf7, 0xf4, 0xf1, 0xf2,
    0xe3, 0xe0, 0xe5, 0xe6, 0xef, 0xec, 0xe9, 0xea, 0xcb, 0xc8, 0xcd, 0xce,
    0xc7, 0xc4, 0xc1, 0xc2, 0xd3, 0xd0, 0xd5, 0xd6, 0xdf, 0xdc, 0xd9, 0xda,
    0x5b, 0x58, 0x5d, 0x5e, 0x57, 0x54, 0x51, 0x52, 0x43, 0x40, 0x45, 0x46,
    0x4f, 0x4c, 0x49, 0x4a, 0x6b, 0x68, 0x6d, 0x6e, 0x67, 0x64, 0x61, 0x62,
    0x73, 0x70, 0x75, 0x76, 0x7f, 0x7c, 0x79, 0x7a, 0x3b, 0x38, 0x3d, 0x3e,
    0x37, 0x34, 0x31, 0x32, 0x23, 0x20, 0x25, 0x26, 0x2f, 0x2c, 0x29, 0x2a,
    0x0b, 0x08, 0x0d, 0x0e, 0x07, 0x04, 0x01, 0x02, 0x13, 0x10, 0x15, 0x16,
    0x1f, 0x1c, 0x19, 0x1a
    ], //*/ G3X = Gx(3),

/*
    G9X = [
    0x00, 0x09, 0x12, 0x1b, 0x24, 0x2d, 0x36, 0x3f, 0x48, 0x41, 0x5a, 0x53,
    0x6c, 0x65, 0x7e, 0x77, 0x90, 0x99, 0x82, 0x8b, 0xb4, 0xbd, 0xa6, 0xaf,
    0xd8, 0xd1, 0xca, 0xc3, 0xfc, 0xf5, 0xee, 0xe7, 0x3b, 0x32, 0x29, 0x20,
    0x1f, 0x16, 0x0d, 0x04, 0x73, 0x7a, 0x61, 0x68, 0x57, 0x5e, 0x45, 0x4c,
    0xab, 0xa2, 0xb9, 0xb0, 0x8f, 0x86, 0x9d, 0x94, 0xe3, 0xea, 0xf1, 0xf8,
    0xc7, 0xce, 0xd5, 0xdc, 0x76, 0x7f, 0x64, 0x6d, 0x52, 0x5b, 0x40, 0x49,
    0x3e, 0x37, 0x2c, 0x25, 0x1a, 0x13, 0x08, 0x01, 0xe6, 0xef, 0xf4, 0xfd,
    0xc2, 0xcb, 0xd0, 0xd9, 0xae, 0xa7, 0xbc, 0xb5, 0x8a, 0x83, 0x98, 0x91,
    0x4d, 0x44, 0x5f, 0x56, 0x69, 0x60, 0x7b, 0x72, 0x05, 0x0c, 0x17, 0x1e,
    0x21, 0x28, 0x33, 0x3a, 0xdd, 0xd4, 0xcf, 0xc6, 0xf9, 0xf0, 0xeb, 0xe2,
    0x95, 0x9c, 0x87, 0x8e, 0xb1, 0xb8, 0xa3, 0xaa, 0xec, 0xe5, 0xfe, 0xf7,
    0xc8, 0xc1, 0xda, 0xd3, 0xa4, 0xad, 0xb6, 0xbf, 0x80, 0x89, 0x92, 0x9b,
    0x7c, 0x75, 0x6e, 0x67, 0x58, 0x51, 0x4a, 0x43, 0x34, 0x3d, 0x26, 0x2f,
    0x10, 0x19, 0x02, 0x0b, 0xd7, 0xde, 0xc5, 0xcc, 0xf3, 0xfa, 0xe1, 0xe8,
    0x9f, 0x96, 0x8d, 0x84, 0xbb, 0xb2, 0xa9, 0xa0, 0x47, 0x4e, 0x55, 0x5c,
    0x63, 0x6a, 0x71, 0x78, 0x0f, 0x06, 0x1d, 0x14, 0x2b, 0x22, 0x39, 0x30,
    0x9a, 0x93, 0x88, 0x81, 0xbe, 0xb7, 0xac, 0xa5, 0xd2, 0xdb, 0xc0, 0xc9,
    0xf6, 0xff, 0xe4, 0xed, 0x0a, 0x03, 0x18, 0x11, 0x2e, 0x27, 0x3c, 0x35,
    0x42, 0x4b, 0x50, 0x59, 0x66, 0x6f, 0x74, 0x7d, 0xa1, 0xa8, 0xb3, 0xba,
    0x85, 0x8c, 0x97, 0x9e, 0xe9, 0xe0, 0xfb, 0xf2, 0xcd, 0xc4, 0xdf, 0xd6,
    0x31, 0x38, 0x23, 0x2a, 0x15, 0x1c, 0x07, 0x0e, 0x79, 0x70, 0x6b, 0x62,
    0x5d, 0x54, 0x4f, 0x46
    ], //*/ G9X = Gx(9),

/*    GBX = [
    0x00, 0x0b, 0x16, 0x1d, 0x2c, 0x27, 0x3a, 0x31, 0x58, 0x53, 0x4e, 0x45,
    0x74, 0x7f, 0x62, 0x69, 0xb0, 0xbb, 0xa6, 0xad, 0x9c, 0x97, 0x8a, 0x81,
    0xe8, 0xe3, 0xfe, 0xf5, 0xc4, 0xcf, 0xd2, 0xd9, 0x7b, 0x70, 0x6d, 0x66,
    0x57, 0x5c, 0x41, 0x4a, 0x23, 0x28, 0x35, 0x3e, 0x0f, 0x04, 0x19, 0x12,
    0xcb, 0xc0, 0xdd, 0xd6, 0xe7, 0xec, 0xf1, 0xfa, 0x93, 0x98, 0x85, 0x8e,
    0xbf, 0xb4, 0xa9, 0xa2, 0xf6, 0xfd, 0xe0, 0xeb, 0xda, 0xd1, 0xcc, 0xc7,
    0xae, 0xa5, 0xb8, 0xb3, 0x82, 0x89, 0x94, 0x9f, 0x46, 0x4d, 0x50, 0x5b,
    0x6a, 0x61, 0x7c, 0x77, 0x1e, 0x15, 0x08, 0x03, 0x32, 0x39, 0x24, 0x2f,
    0x8d, 0x86, 0x9b, 0x90, 0xa1, 0xaa, 0xb7, 0xbc, 0xd5, 0xde, 0xc3, 0xc8,
    0xf9, 0xf2, 0xef, 0xe4, 0x3d, 0x36, 0x2b, 0x20, 0x11, 0x1a, 0x07, 0x0c,
    0x65, 0x6e, 0x73, 0x78, 0x49, 0x42, 0x5f, 0x54, 0xf7, 0xfc, 0xe1, 0xea,
    0xdb, 0xd0, 0xcd, 0xc6, 0xaf, 0xa4, 0xb9, 0xb2, 0x83, 0x88, 0x95, 0x9e,
    0x47, 0x4c, 0x51, 0x5a, 0x6b, 0x60, 0x7d, 0x76, 0x1f, 0x14, 0x09, 0x02,
    0x33, 0x38, 0x25, 0x2e, 0x8c, 0x87, 0x9a, 0x91, 0xa0, 0xab, 0xb6, 0xbd,
    0xd4, 0xdf, 0xc2, 0xc9, 0xf8, 0xf3, 0xee, 0xe5, 0x3c, 0x37, 0x2a, 0x21,
    0x10, 0x1b, 0x06, 0x0d, 0x64, 0x6f, 0x72, 0x79, 0x48, 0x43, 0x5e, 0x55,
    0x01, 0x0a, 0x17, 0x1c, 0x2d, 0x26, 0x3b, 0x30, 0x59, 0x52, 0x4f, 0x44,
    0x75, 0x7e, 0x63, 0x68, 0xb1, 0xba, 0xa7, 0xac, 0x9d, 0x96, 0x8b, 0x80,
    0xe9, 0xe2, 0xff, 0xf4, 0xc5, 0xce, 0xd3, 0xd8, 0x7a, 0x71, 0x6c, 0x67,
    0x56, 0x5d, 0x40, 0x4b, 0x22, 0x29, 0x34, 0x3f, 0x0e, 0x05, 0x18, 0x13,
    0xca, 0xc1, 0xdc, 0xd7, 0xe6, 0xed, 0xf0, 0xfb, 0x92, 0x99, 0x84, 0x8f,
    0xbe, 0xb5, 0xa8, 0xa3
    ], //*/ GBX = Gx(0xb),

/*
    GDX = [
    0x00, 0x0d, 0x1a, 0x17, 0x34, 0x39, 0x2e, 0x23, 0x68, 0x65, 0x72, 0x7f,
    0x5c, 0x51, 0x46, 0x4b, 0xd0, 0xdd, 0xca, 0xc7, 0xe4, 0xe9, 0xfe, 0xf3,
    0xb8, 0xb5, 0xa2, 0xaf, 0x8c, 0x81, 0x96, 0x9b, 0xbb, 0xb6, 0xa1, 0xac,
    0x8f, 0x82, 0x95, 0x98, 0xd3, 0xde, 0xc9, 0xc4, 0xe7, 0xea, 0xfd, 0xf0,
    0x6b, 0x66, 0x71, 0x7c, 0x5f, 0x52, 0x45, 0x48, 0x03, 0x0e, 0x19, 0x14,
    0x37, 0x3a, 0x2d, 0x20, 0x6d, 0x60, 0x77, 0x7a, 0x59, 0x54, 0x43, 0x4e,
    0x05, 0x08, 0x1f, 0x12, 0x31, 0x3c, 0x2b, 0x26, 0xbd, 0xb0, 0xa7, 0xaa,
    0x89, 0x84, 0x93, 0x9e, 0xd5, 0xd8, 0xcf, 0xc2, 0xe1, 0xec, 0xfb, 0xf6,
    0xd6, 0xdb, 0xcc, 0xc1, 0xe2, 0xef, 0xf8, 0xf5, 0xbe, 0xb3, 0xa4, 0xa9,
    0x8a, 0x87, 0x90, 0x9d, 0x06, 0x0b, 0x1c, 0x11, 0x32, 0x3f, 0x28, 0x25,
    0x6e, 0x63, 0x74, 0x79, 0x5a, 0x57, 0x40, 0x4d, 0xda, 0xd7, 0xc0, 0xcd,
    0xee, 0xe3, 0xf4, 0xf9, 0xb2, 0xbf, 0xa8, 0xa5, 0x86, 0x8b, 0x9c, 0x91,
    0x0a, 0x07, 0x10, 0x1d, 0x3e, 0x33, 0x24, 0x29, 0x62, 0x6f, 0x78, 0x75,
    0x56, 0x5b, 0x4c, 0x41, 0x61, 0x6c, 0x7b, 0x76, 0x55, 0x58, 0x4f, 0x42,
    0x09, 0x04, 0x13, 0x1e, 0x3d, 0x30, 0x27, 0x2a, 0xb1, 0xbc, 0xab, 0xa6,
    0x85, 0x88, 0x9f, 0x92, 0xd9, 0xd4, 0xc3, 0xce, 0xed, 0xe0, 0xf7, 0xfa,
    0xb7, 0xba, 0xad, 0xa0, 0x83, 0x8e, 0x99, 0x94, 0xdf, 0xd2, 0xc5, 0xc8,
    0xeb, 0xe6, 0xf1, 0xfc, 0x67, 0x6a, 0x7d, 0x70, 0x53, 0x5e, 0x49, 0x44,
    0x0f, 0x02, 0x15, 0x18, 0x3b, 0x36, 0x21, 0x2c, 0x0c, 0x01, 0x16, 0x1b,
    0x38, 0x35, 0x22, 0x2f, 0x64, 0x69, 0x7e, 0x73, 0x50, 0x5d, 0x4a, 0x47,
    0xdc, 0xd1, 0xc6, 0xcb, 0xe8, 0xe5, 0xf2, 0xff, 0xb4, 0xb9, 0xae, 0xa3,
    0x80, 0x8d, 0x9a, 0x97
    ], //*/ GDX = Gx(0xd),

/*
    GEX = [
    0x00, 0x0e, 0x1c, 0x12, 0x38, 0x36, 0x24, 0x2a, 0x70, 0x7e, 0x6c, 0x62,
    0x48, 0x46, 0x54, 0x5a, 0xe0, 0xee, 0xfc, 0xf2, 0xd8, 0xd6, 0xc4, 0xca,
    0x90, 0x9e, 0x8c, 0x82, 0xa8, 0xa6, 0xb4, 0xba, 0xdb, 0xd5, 0xc7, 0xc9,
    0xe3, 0xed, 0xff, 0xf1, 0xab, 0xa5, 0xb7, 0xb9, 0x93, 0x9d, 0x8f, 0x81,
    0x3b, 0x35, 0x27, 0x29, 0x03, 0x0d, 0x1f, 0x11, 0x4b, 0x45, 0x57, 0x59,
    0x73, 0x7d, 0x6f, 0x61, 0xad, 0xa3, 0xb1, 0xbf, 0x95, 0x9b, 0x89, 0x87,
    0xdd, 0xd3, 0xc1, 0xcf, 0xe5, 0xeb, 0xf9, 0xf7, 0x4d, 0x43, 0x51, 0x5f,
    0x75, 0x7b, 0x69, 0x67, 0x3d, 0x33, 0x21, 0x2f, 0x05, 0x0b, 0x19, 0x17,
    0x76, 0x78, 0x6a, 0x64, 0x4e, 0x40, 0x52, 0x5c, 0x06, 0x08, 0x1a, 0x14,
    0x3e, 0x30, 0x22, 0x2c, 0x96, 0x98, 0x8a, 0x84, 0xae, 0xa0, 0xb2, 0xbc,
    0xe6, 0xe8, 0xfa, 0xf4, 0xde, 0xd0, 0xc2, 0xcc, 0x41, 0x4f, 0x5d, 0x53,
    0x79, 0x77, 0x65, 0x6b, 0x31, 0x3f, 0x2d, 0x23, 0x09, 0x07, 0x15, 0x1b,
    0xa1, 0xaf, 0xbd, 0xb3, 0x99, 0x97, 0x85, 0x8b, 0xd1, 0xdf, 0xcd, 0xc3,
    0xe9, 0xe7, 0xf5, 0xfb, 0x9a, 0x94, 0x86, 0x88, 0xa2, 0xac, 0xbe, 0xb0,
    0xea, 0xe4, 0xf6, 0xf8, 0xd2, 0xdc, 0xce, 0xc0, 0x7a, 0x74, 0x66, 0x68,
    0x42, 0x4c, 0x5e, 0x50, 0x0a, 0x04, 0x16, 0x18, 0x32, 0x3c, 0x2e, 0x20,
    0xec, 0xe2, 0xf0, 0xfe, 0xd4, 0xda, 0xc8, 0xc6, 0x9c, 0x92, 0x80, 0x8e,
    0xa4, 0xaa, 0xb8, 0xb6, 0x0c, 0x02, 0x10, 0x1e, 0x34, 0x3a, 0x28, 0x26,
    0x7c, 0x72, 0x60, 0x6e, 0x44, 0x4a, 0x58, 0x56, 0x37, 0x39, 0x2b, 0x25,
    0x0f, 0x01, 0x13, 0x1d, 0x47, 0x49, 0x5b, 0x55, 0x7f, 0x71, 0x63, 0x6d,
    0xd7, 0xd9, 0xcb, 0xc5, 0xef, 0xe1, 0xf3, 0xfd, 0xa7, 0xa9, 0xbb, 0xb5,
    0x9f, 0x91, 0x83, 0x8d
    ], //*/ GEX = Gx(0xe),

    enc = function(string, pass, binary) {
        // string, password in plaintext
        var salt = randArr(8),
        pbe = openSSLKey(s2a(pass, binary), salt),
        key = pbe.key,
        iv = pbe.iv,
        cipherBlocks,
        saltBlock = [[83, 97, 108, 116, 101, 100, 95, 95].concat(salt)];
        string = s2a(string, binary);
        cipherBlocks = rawEncrypt(string, key, iv);
        // Spells out 'Salted__'
        cipherBlocks = saltBlock.concat(cipherBlocks);
        return Base64.encode(cipherBlocks);
    },

    dec = function(string, pass, binary) {
        // string, password in plaintext
        var cryptArr = Base64.decode(string),
        salt = cryptArr.slice(8, 16),
        pbe = openSSLKey(s2a(pass, binary), salt),
        key = pbe.key,
        iv = pbe.iv;
        cryptArr = cryptArr.slice(16, cryptArr.length);
        // Take off the Salted__ffeeddcc
        string = rawDecrypt(cryptArr, key, iv, binary);
        return string;
    },
    
    MD5 = function(numArr) {

        function rotateLeft(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }

        function addUnsigned(lX, lY) {
            var lX4,
            lY4,
            lX8,
            lY8,
            lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }

        function f(x, y, z) {
            return (x & y) | ((~x) & z);
        }
        function g(x, y, z) {
            return (x & z) | (y & (~z));
        }
        function h(x, y, z) {
            return (x ^ y ^ z);
        }
        function funcI(x, y, z) {
            return (y ^ (x | (~z)));
        }

        function ff(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function gg(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function hh(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function ii(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(funcI(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function convertToWordArray(numArr) {
            var lWordCount,
            lMessageLength = numArr.length,
            lNumberOfWords_temp1 = lMessageLength + 8,
            lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
            lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16,
            lWordArray = [],
            lBytePosition = 0,
            lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (numArr[lByteCount] << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }

        function wordToHex(lValue) {
            var lByte,
            lCount,
            wordToHexArr = [];
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                wordToHexArr = wordToHexArr.concat(lByte);
             }
            return wordToHexArr;
        }

        /*function utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "",
            n,
            c;

            for (n = 0; n < string.length; n++) {

                c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        }*/

        var x = [],
        k,
        AA,
        BB,
        CC,
        DD,
        a,
        b,
        c,
        d,
        rnd = strhex('67452301efcdab8998badcfe10325476d76aa478e8c7b756242070dbc1bdceeef57c0faf4787c62aa8304613fd469501698098d88b44f7afffff5bb1895cd7be6b901122fd987193a679438e49b40821f61e2562c040b340265e5a51e9b6c7aad62f105d02441453d8a1e681e7d3fbc821e1cde6c33707d6f4d50d87455a14eda9e3e905fcefa3f8676f02d98d2a4c8afffa39428771f6816d9d6122fde5380ca4beea444bdecfa9f6bb4b60bebfbc70289b7ec6eaa127fad4ef308504881d05d9d4d039e6db99e51fa27cf8c4ac5665f4292244432aff97ab9423a7fc93a039655b59c38f0ccc92ffeff47d85845dd16fa87e4ffe2ce6e0a30143144e0811a1f7537e82bd3af2352ad7d2bbeb86d391',8);

        x = convertToWordArray(numArr);

        a = rnd[0];
        b = rnd[1];
        c = rnd[2];
        d = rnd[3]

        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = ff(a, b, c, d, x[k + 0], 7, rnd[4]);
            d = ff(d, a, b, c, x[k + 1], 12, rnd[5]);
            c = ff(c, d, a, b, x[k + 2], 17, rnd[6]);
            b = ff(b, c, d, a, x[k + 3], 22, rnd[7]);
            a = ff(a, b, c, d, x[k + 4], 7, rnd[8]);
            d = ff(d, a, b, c, x[k + 5], 12, rnd[9]);
            c = ff(c, d, a, b, x[k + 6], 17, rnd[10]);
            b = ff(b, c, d, a, x[k + 7], 22, rnd[11]);
            a = ff(a, b, c, d, x[k + 8], 7, rnd[12]);
            d = ff(d, a, b, c, x[k + 9], 12, rnd[13]);
            c = ff(c, d, a, b, x[k + 10], 17, rnd[14]);
            b = ff(b, c, d, a, x[k + 11], 22, rnd[15]);
            a = ff(a, b, c, d, x[k + 12], 7, rnd[16]);
            d = ff(d, a, b, c, x[k + 13], 12, rnd[17]);
            c = ff(c, d, a, b, x[k + 14], 17, rnd[18]);
            b = ff(b, c, d, a, x[k + 15], 22, rnd[19]);
            a = gg(a, b, c, d, x[k + 1], 5, rnd[20]);
            d = gg(d, a, b, c, x[k + 6], 9, rnd[21]);
            c = gg(c, d, a, b, x[k + 11], 14, rnd[22]);
            b = gg(b, c, d, a, x[k + 0], 20, rnd[23]);
            a = gg(a, b, c, d, x[k + 5], 5, rnd[24]);
            d = gg(d, a, b, c, x[k + 10], 9, rnd[25]);
            c = gg(c, d, a, b, x[k + 15], 14, rnd[26]);
            b = gg(b, c, d, a, x[k + 4], 20, rnd[27]);
            a = gg(a, b, c, d, x[k + 9], 5, rnd[28]);
            d = gg(d, a, b, c, x[k + 14], 9, rnd[29]);
            c = gg(c, d, a, b, x[k + 3], 14, rnd[30]);
            b = gg(b, c, d, a, x[k + 8], 20, rnd[31]);
            a = gg(a, b, c, d, x[k + 13], 5, rnd[32]);
            d = gg(d, a, b, c, x[k + 2], 9, rnd[33]);
            c = gg(c, d, a, b, x[k + 7], 14, rnd[34]);
            b = gg(b, c, d, a, x[k + 12], 20, rnd[35]);
            a = hh(a, b, c, d, x[k + 5], 4, rnd[36]);
            d = hh(d, a, b, c, x[k + 8], 11, rnd[37]);
            c = hh(c, d, a, b, x[k + 11], 16, rnd[38]);
            b = hh(b, c, d, a, x[k + 14], 23, rnd[39]);
            a = hh(a, b, c, d, x[k + 1], 4, rnd[40]);
            d = hh(d, a, b, c, x[k + 4], 11, rnd[41]);
            c = hh(c, d, a, b, x[k + 7], 16, rnd[42]);
            b = hh(b, c, d, a, x[k + 10], 23, rnd[43]);
            a = hh(a, b, c, d, x[k + 13], 4, rnd[44]);
            d = hh(d, a, b, c, x[k + 0], 11, rnd[45]);
            c = hh(c, d, a, b, x[k + 3], 16, rnd[46]);
            b = hh(b, c, d, a, x[k + 6], 23, rnd[47]);
            a = hh(a, b, c, d, x[k + 9], 4, rnd[48]);
            d = hh(d, a, b, c, x[k + 12], 11, rnd[49]);
            c = hh(c, d, a, b, x[k + 15], 16, rnd[50]);
            b = hh(b, c, d, a, x[k + 2], 23, rnd[51]);
            a = ii(a, b, c, d, x[k + 0], 6, rnd[52]);
            d = ii(d, a, b, c, x[k + 7], 10, rnd[53]);
            c = ii(c, d, a, b, x[k + 14], 15, rnd[54]);
            b = ii(b, c, d, a, x[k + 5], 21, rnd[55]);
            a = ii(a, b, c, d, x[k + 12], 6, rnd[56]);
            d = ii(d, a, b, c, x[k + 3], 10, rnd[57]);
            c = ii(c, d, a, b, x[k + 10], 15, rnd[58]);
            b = ii(b, c, d, a, x[k + 1], 21, rnd[59]);
            a = ii(a, b, c, d, x[k + 8], 6, rnd[60]);
            d = ii(d, a, b, c, x[k + 15], 10, rnd[61]);
            c = ii(c, d, a, b, x[k + 6], 15, rnd[62]);
            b = ii(b, c, d, a, x[k + 13], 21, rnd[63]);
            a = ii(a, b, c, d, x[k + 4], 6, rnd[64]);
            d = ii(d, a, b, c, x[k + 11], 10, rnd[65]);
            c = ii(c, d, a, b, x[k + 2], 15, rnd[66]);
            b = ii(b, c, d, a, x[k + 9], 21, rnd[67]);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }

        return wordToHex(a).concat(wordToHex(b), wordToHex(c), wordToHex(d));
    },

    encString = function(plaintext, key, iv) {
        plaintext = s2a(plaintext);

        key = s2a(key);
        for (var i=key.length; i<32; i++)
            key[i] = 0;

        if (iv == null) {
            iv = genIV();
        } else {
            iv = s2a(iv);
            for (var i=iv.length; i<16; i++)
                iv[i] = 0;
        }

        var ct = rawEncrypt(plaintext, key, iv);
        var ret = [iv];
        for (var i=0; i<ct.length; i++)
            ret[ret.length] = ct[i];
        return Base64.encode(ret);
    },

    decString = function(ciphertext, key) {
        var tmp = Base64.decode(ciphertext);
        var iv = tmp.slice(0, 16);
        var ct = tmp.slice(16, tmp.length);

        key = s2a(key);
        for (var i=key.length; i<32; i++)
            key[i] = 0;

        var pt = rawDecrypt(ct, key, iv, false);
        return pt;
    },

    Base64 = (function(){
        // Takes a Nx16x1 byte array and converts it to Base64
        var _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        chars = _chars.split(''),
        
        encode = function(b, withBreaks) {
            var flatArr = [],
            b64 = '',
            i,
            broken_b64;
            totalChunks = Math.floor(b.length * 16 / 3);
            for (i = 0; i < b.length * 16; i++) {
                flatArr.push(b[Math.floor(i / 16)][i % 16]);
            }
            for (i = 0; i < flatArr.length; i = i + 3) {
                b64 += chars[flatArr[i] >> 2];
                b64 += chars[((flatArr[i] & 3) << 4) | (flatArr[i + 1] >> 4)];
                if (! (flatArr[i + 1] === undefined)) {
                    b64 += chars[((flatArr[i + 1] & 15) << 2) | (flatArr[i + 2] >> 6)];
                } else {
                    b64 += '=';
                }
                if (! (flatArr[i + 2] === undefined)) {
                    b64 += chars[flatArr[i + 2] & 63];
                } else {
                    b64 += '=';
                }
            }
            // OpenSSL is super particular about line breaks
            broken_b64 = b64.slice(0, 64) + '\n';
            for (i = 1; i < (Math.ceil(b64.length / 64)); i++) {
                broken_b64 += b64.slice(i * 64, i * 64 + 64) + (Math.ceil(b64.length / 64) == i + 1 ? '': '\n');
            }
            return broken_b64;
        },
        
        decode = function(string) {
            string = string.replace(/\n/g, '');
            var flatArr = [],
            c = [],
            b = [],
            i;
            for (i = 0; i < string.length; i = i + 4) {
                c[0] = _chars.indexOf(string.charAt(i));
                c[1] = _chars.indexOf(string.charAt(i + 1));
                c[2] = _chars.indexOf(string.charAt(i + 2));
                c[3] = _chars.indexOf(string.charAt(i + 3));

                b[0] = (c[0] << 2) | (c[1] >> 4);
                b[1] = ((c[1] & 15) << 4) | (c[2] >> 2);
                b[2] = ((c[2] & 3) << 6) | c[3];
                flatArr.push(b[0], b[1], b[2]);
            }
            flatArr = flatArr.slice(0, flatArr.length - (flatArr.length % 16));
            return flatArr;
        };
        
        //internet explorer
        if(typeof Array.indexOf === "function") {
            _chars = chars;
        }
        
        /*
        //other way to solve internet explorer problem
        if(!Array.indexOf){
            Array.prototype.indexOf = function(obj){
                for(var i=0; i<this.length; i++){
                    if(this[i]===obj){
                        return i;
                    }
                }
                return -1;
            }
        }
        */
        
        
        return {
            "encode": encode,
            "decode": decode
        };
    })();

    return {
        "size": size,
        "h2a":h2a,
        "expandKey":expandKey,
        "encryptBlock":encryptBlock,
        "decryptBlock":decryptBlock,
        "Decrypt":Decrypt,
        "s2a":s2a,
        "rawEncrypt":rawEncrypt,
        "dec":dec,
        "openSSLKey":openSSLKey,
        "a2h":a2h,
        "enc":enc,
        "Hash":{"MD5":MD5},
        "Base64":Base64
    };

})();

if ( typeof define === "function" ) {
    define(function () { return GibberishAES; });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GibberishAES;
}
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.io=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

  module.exports = _dereq_('./lib/');

},{"./lib/":2}],2:[function(_dereq_,module,exports){

  /**
   * Module dependencies.
   */

  var url = _dereq_('./url');
  var parser = _dereq_('socket.io-parser');
  var Manager = _dereq_('./manager');
  var debug = _dereq_('debug')('socket.io-client');

  /**
   * Module exports.
   */

  module.exports = exports = lookup;

  /**
   * Managers cache.
   */

  var cache = exports.managers = {};

  /**
   * Looks up an existing `Manager` for multiplexing.
   * If the user summons:
   *
   *   `io('http://localhost/a');`
   *   `io('http://localhost/b');`
   *
   * We reuse the existing instance based on same scheme/port/host,
   * and we initialize sockets for each namespace.
   *
   * @api public
   */

  function lookup(uri, opts) {
    if (typeof uri == 'object') {
      opts = uri;
      uri = undefined;
    }

    opts = opts || {};

    var parsed = url(uri);
    var source = parsed.source;
    var id = parsed.id;
    var path = parsed.path;
    var sameNamespace = (cache[id] && cache[id].nsps[path] &&
      path == cache[id].nsps[path].nsp);
    var newConnection = opts.forceNew || opts['force new connection'] ||
      false === opts.multiplex || sameNamespace;

    var io;

    if (newConnection) {
      debug('ignoring socket cache for %s', source);
      io = Manager(source, opts);
    } else {
      if (!cache[id]) {
        debug('new io instance for %s', source);
        cache[id] = Manager(source, opts);
      }
      io = cache[id];
    }

    return io.socket(parsed.path);
  }

  /**
   * Protocol version.
   *
   * @api public
   */

  exports.protocol = parser.protocol;

  /**
   * `connect`.
   *
   * @param {String} uri
   * @api public
   */

  exports.connect = lookup;

  /**
   * Expose constructors for standalone build.
   *
   * @api public
   */

  exports.Manager = _dereq_('./manager');
  exports.Socket = _dereq_('./socket');

},{"./manager":3,"./socket":5,"./url":6,"debug":10,"socket.io-parser":44}],3:[function(_dereq_,module,exports){

  /**
   * Module dependencies.
   */

  var url = _dereq_('./url');
  var eio = _dereq_('engine.io-client');
  var Socket = _dereq_('./socket');
  var Emitter = _dereq_('component-emitter');
  var parser = _dereq_('socket.io-parser');
  var on = _dereq_('./on');
  var bind = _dereq_('component-bind');
  var object = _dereq_('object-component');
  var debug = _dereq_('debug')('socket.io-client:manager');
  var indexOf = _dereq_('indexof');
  var Backoff = _dereq_('backo2');

  /**
   * Module exports
   */

  module.exports = Manager;

  /**
   * `Manager` constructor.
   *
   * @param {String} engine instance or engine uri/opts
   * @param {Object} options
   * @api public
   */

  function Manager(uri, opts){
    if (!(this instanceof Manager)) return new Manager(uri, opts);
    if (uri && ('object' == typeof uri)) {
      opts = uri;
      uri = undefined;
    }
    opts = opts || {};

    opts.path = opts.path || '/socket.io';
    this.nsps = {};
    this.subs = [];
    this.opts = opts;
    this.reconnection(opts.reconnection !== false);
    this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
    this.reconnectionDelay(opts.reconnectionDelay || 1000);
    this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
    this.randomizationFactor(opts.randomizationFactor || 0.5);
    this.backoff = new Backoff({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    });
    this.timeout(null == opts.timeout ? 20000 : opts.timeout);
    this.readyState = 'closed';
    this.uri = uri;
    this.connected = [];
    this.encoding = false;
    this.packetBuffer = [];
    this.encoder = new parser.Encoder();
    this.decoder = new parser.Decoder();
    this.autoConnect = opts.autoConnect !== false;
    if (this.autoConnect) this.open();
  }

  /**
   * Propagate given event to sockets and emit on `this`
   *
   * @api private
   */

  Manager.prototype.emitAll = function() {
    this.emit.apply(this, arguments);
    for (var nsp in this.nsps) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  };

  /**
   * Update `socket.id` of all sockets
   *
   * @api private
   */

  Manager.prototype.updateSocketIds = function(){
    for (var nsp in this.nsps) {
      this.nsps[nsp].id = this.engine.id;
    }
  };

  /**
   * Mix in `Emitter`.
   */

  Emitter(Manager.prototype);

  /**
   * Sets the `reconnection` config.
   *
   * @param {Boolean} true/false if it should automatically reconnect
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnection = function(v){
    if (!arguments.length) return this._reconnection;
    this._reconnection = !!v;
    return this;
  };

  /**
   * Sets the reconnection attempts config.
   *
   * @param {Number} max reconnection attempts before giving up
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnectionAttempts = function(v){
    if (!arguments.length) return this._reconnectionAttempts;
    this._reconnectionAttempts = v;
    return this;
  };

  /**
   * Sets the delay between reconnections.
   *
   * @param {Number} delay
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnectionDelay = function(v){
    if (!arguments.length) return this._reconnectionDelay;
    this._reconnectionDelay = v;
    this.backoff && this.backoff.setMin(v);
    return this;
  };

  Manager.prototype.randomizationFactor = function(v){
    if (!arguments.length) return this._randomizationFactor;
    this._randomizationFactor = v;
    this.backoff && this.backoff.setJitter(v);
    return this;
  };

  /**
   * Sets the maximum delay between reconnections.
   *
   * @param {Number} delay
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.reconnectionDelayMax = function(v){
    if (!arguments.length) return this._reconnectionDelayMax;
    this._reconnectionDelayMax = v;
    this.backoff && this.backoff.setMax(v);
    return this;
  };

  /**
   * Sets the connection timeout. `false` to disable
   *
   * @return {Manager} self or value
   * @api public
   */

  Manager.prototype.timeout = function(v){
    if (!arguments.length) return this._timeout;
    this._timeout = v;
    return this;
  };

  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @api private
   */

  Manager.prototype.maybeReconnectOnOpen = function() {
    // Only try to reconnect if it's the first time we're connecting
    if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
      // keeps reconnection from firing twice for the same reconnection loop
      this.reconnect();
    }
  };


  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} optional, callback
   * @return {Manager} self
   * @api public
   */

  Manager.prototype.open =
    Manager.prototype.connect = function(fn){
      debug('readyState %s', this.readyState);
      if (~this.readyState.indexOf('open')) return this;

      debug('opening %s', this.uri);
      this.engine = eio(this.uri, this.opts);
      var socket = this.engine;
      var self = this;
      this.readyState = 'opening';
      this.skipReconnect = false;

      // emit `open`
      var openSub = on(socket, 'open', function() {
        self.onopen();
        fn && fn();
      });

      // emit `connect_error`
      var errorSub = on(socket, 'error', function(data){
        debug('connect_error');
        self.cleanup();
        self.readyState = 'closed';
        self.emitAll('connect_error', data);
        if (fn) {
          var err = new Error('Connection error');
          err.data = data;
          fn(err);
        } else {
          // Only do this if there is no fn to handle the error
          self.maybeReconnectOnOpen();
        }
      });

      // emit `connect_timeout`
      if (false !== this._timeout) {
        var timeout = this._timeout;
        debug('connect attempt will timeout after %d', timeout);

        // set timer
        var timer = setTimeout(function(){
          debug('connect attempt timed out after %d', timeout);
          openSub.destroy();
          socket.close();
          socket.emit('error', 'timeout');
          self.emitAll('connect_timeout', timeout);
        }, timeout);

        this.subs.push({
          destroy: function(){
            clearTimeout(timer);
          }
        });
      }

      this.subs.push(openSub);
      this.subs.push(errorSub);

      return this;
    };

  /**
   * Called upon transport open.
   *
   * @api private
   */

  Manager.prototype.onopen = function(){
    debug('open');

    // clear old subs
    this.cleanup();

    // mark as open
    this.readyState = 'open';
    this.emit('open');

    // add new subs
    var socket = this.engine;
    this.subs.push(on(socket, 'data', bind(this, 'ondata')));
    this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
    this.subs.push(on(socket, 'error', bind(this, 'onerror')));
    this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  };

  /**
   * Called with data.
   *
   * @api private
   */

  Manager.prototype.ondata = function(data){
    this.decoder.add(data);
  };

  /**
   * Called when parser fully decodes a packet.
   *
   * @api private
   */

  Manager.prototype.ondecoded = function(packet) {
    this.emit('packet', packet);
  };

  /**
   * Called upon socket error.
   *
   * @api private
   */

  Manager.prototype.onerror = function(err){
    debug('error', err);
    this.emitAll('error', err);
  };

  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @api public
   */

  Manager.prototype.socket = function(nsp){
    var socket = this.nsps[nsp];
    if (!socket) {
      socket = new Socket(this, nsp);
      this.nsps[nsp] = socket;
      var self = this;
      socket.on('connect', function(){
        socket.id = self.engine.id;
        if (!~indexOf(self.connected, socket)) {
          self.connected.push(socket);
        }
      });
    }
    return socket;
  };

  /**
   * Called upon a socket close.
   *
   * @param {Socket} socket
   */

  Manager.prototype.destroy = function(socket){
    var index = indexOf(this.connected, socket);
    if (~index) this.connected.splice(index, 1);
    if (this.connected.length) return;

    this.close();
  };

  /**
   * Writes a packet.
   *
   * @param {Object} packet
   * @api private
   */

  Manager.prototype.packet = function(packet){
    debug('writing packet %j', packet);
    var self = this;

    if (!self.encoding) {
      // encode, then write to engine with result
      self.encoding = true;
      this.encoder.encode(packet, function(encodedPackets) {
        for (var i = 0; i < encodedPackets.length; i++) {
          self.engine.write(encodedPackets[i]);
        }
        self.encoding = false;
        self.processPacketQueue();
      });
    } else { // add packet to the queue
      self.packetBuffer.push(packet);
    }
  };

  /**
   * If packet buffer is non-empty, begins encoding the
   * next packet in line.
   *
   * @api private
   */

  Manager.prototype.processPacketQueue = function() {
    if (this.packetBuffer.length > 0 && !this.encoding) {
      var pack = this.packetBuffer.shift();
      this.packet(pack);
    }
  };

  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @api private
   */

  Manager.prototype.cleanup = function(){
    var sub;
    while (sub = this.subs.shift()) sub.destroy();

    this.packetBuffer = [];
    this.encoding = false;

    this.decoder.destroy();
  };

  /**
   * Close the current socket.
   *
   * @api private
   */

  Manager.prototype.close =
    Manager.prototype.disconnect = function(){
      this.skipReconnect = true;
      this.backoff.reset();
      this.readyState = 'closed';
      this.engine && this.engine.close();
    };

  /**
   * Called upon engine close.
   *
   * @api private
   */

  Manager.prototype.onclose = function(reason){
    debug('close');
    this.cleanup();
    this.backoff.reset();
    this.readyState = 'closed';
    this.emit('close', reason);
    if (this._reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  };

  /**
   * Attempt a reconnection.
   *
   * @api private
   */

  Manager.prototype.reconnect = function(){
    if (this.reconnecting || this.skipReconnect) return this;

    var self = this;

    if (this.backoff.attempts >= this._reconnectionAttempts) {
      debug('reconnect failed');
      this.backoff.reset();
      this.emitAll('reconnect_failed');
      this.reconnecting = false;
    } else {
      var delay = this.backoff.duration();
      debug('will wait %dms before reconnect attempt', delay);

      this.reconnecting = true;
      var timer = setTimeout(function(){
        if (self.skipReconnect) return;

        debug('attempting reconnect');
        self.emitAll('reconnect_attempt', self.backoff.attempts);
        self.emitAll('reconnecting', self.backoff.attempts);

        // check again for the case socket closed in above events
        if (self.skipReconnect) return;

        self.open(function(err){
          if (err) {
            debug('reconnect attempt error');
            self.reconnecting = false;
            self.reconnect();
            self.emitAll('reconnect_error', err.data);
          } else {
            debug('reconnect success');
            self.onreconnect();
          }
        });
      }, delay);

      this.subs.push({
        destroy: function(){
          clearTimeout(timer);
        }
      });
    }
  };

  /**
   * Called upon successful reconnect.
   *
   * @api private
   */

  Manager.prototype.onreconnect = function(){
    var attempt = this.backoff.attempts;
    this.reconnecting = false;
    this.backoff.reset();
    this.updateSocketIds();
    this.emitAll('reconnect', attempt);
  };

},{"./on":4,"./socket":5,"./url":6,"backo2":7,"component-bind":8,"component-emitter":9,"debug":10,"engine.io-client":11,"indexof":40,"object-component":41,"socket.io-parser":44}],4:[function(_dereq_,module,exports){

  /**
   * Module exports.
   */

  module.exports = on;

  /**
   * Helper for subscriptions.
   *
   * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
   * @param {String} event name
   * @param {Function} callback
   * @api public
   */

  function on(obj, ev, fn) {
    obj.on(ev, fn);
    return {
      destroy: function(){
        obj.removeListener(ev, fn);
      }
    };
  }

},{}],5:[function(_dereq_,module,exports){

  /**
   * Module dependencies.
   */

  var parser = _dereq_('socket.io-parser');
  var Emitter = _dereq_('component-emitter');
  var toArray = _dereq_('to-array');
  var on = _dereq_('./on');
  var bind = _dereq_('component-bind');
  var debug = _dereq_('debug')('socket.io-client:socket');
  var hasBin = _dereq_('has-binary');

  /**
   * Module exports.
   */

  module.exports = exports = Socket;

  /**
   * Internal events (blacklisted).
   * These events can't be emitted by the user.
   *
   * @api private
   */

  var events = {
    connect: 1,
    connect_error: 1,
    connect_timeout: 1,
    disconnect: 1,
    error: 1,
    reconnect: 1,
    reconnect_attempt: 1,
    reconnect_failed: 1,
    reconnect_error: 1,
    reconnecting: 1
  };

  /**
   * Shortcut to `Emitter#emit`.
   */

  var emit = Emitter.prototype.emit;

  /**
   * `Socket` constructor.
   *
   * @api public
   */

  function Socket(io, nsp){
    this.io = io;
    this.nsp = nsp;
    this.json = this; // compat
    this.ids = 0;
    this.acks = {};
    if (this.io.autoConnect) this.open();
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this.connected = false;
    this.disconnected = true;
  }

  /**
   * Mix in `Emitter`.
   */

  Emitter(Socket.prototype);

  /**
   * Subscribe to open, close and packet events
   *
   * @api private
   */

  Socket.prototype.subEvents = function() {
    if (this.subs) return;

    var io = this.io;
    this.subs = [
      on(io, 'open', bind(this, 'onopen')),
      on(io, 'packet', bind(this, 'onpacket')),
      on(io, 'close', bind(this, 'onclose'))
    ];
  };

  /**
   * "Opens" the socket.
   *
   * @api public
   */

  Socket.prototype.open =
    Socket.prototype.connect = function(){
      if (this.connected) return this;

      this.subEvents();
      this.io.open(); // ensure open
      if ('open' == this.io.readyState) this.onopen();
      return this;
    };

  /**
   * Sends a `message` event.
   *
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.send = function(){
    var args = toArray(arguments);
    args.unshift('message');
    this.emit.apply(this, args);
    return this;
  };

  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @param {String} event name
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.emit = function(ev){
    if (events.hasOwnProperty(ev)) {
      emit.apply(this, arguments);
      return this;
    }

    var args = toArray(arguments);
    var parserType = parser.EVENT; // default
    if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
    var packet = { type: parserType, data: args };

    // event ack callback
    if ('function' == typeof args[args.length - 1]) {
      debug('emitting packet with ack id %d', this.ids);
      this.acks[this.ids] = args.pop();
      packet.id = this.ids++;
    }

    if (this.connected) {
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }

    return this;
  };

  /**
   * Sends a packet.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.packet = function(packet){
    packet.nsp = this.nsp;
    this.io.packet(packet);
  };

  /**
   * Called upon engine `open`.
   *
   * @api private
   */

  Socket.prototype.onopen = function(){
    debug('transport is open - connecting');

    // write connect packet if necessary
    if ('/' != this.nsp) {
      this.packet({ type: parser.CONNECT });
    }
  };

  /**
   * Called upon engine `close`.
   *
   * @param {String} reason
   * @api private
   */

  Socket.prototype.onclose = function(reason){
    debug('close (%s)', reason);
    this.connected = false;
    this.disconnected = true;
    delete this.id;
    this.emit('disconnect', reason);
  };

  /**
   * Called with socket packet.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.onpacket = function(packet){
    if (packet.nsp != this.nsp) return;

    switch (packet.type) {
      case parser.CONNECT:
        this.onconnect();
        break;

      case parser.EVENT:
        this.onevent(packet);
        break;

      case parser.BINARY_EVENT:
        this.onevent(packet);
        break;

      case parser.ACK:
        this.onack(packet);
        break;

      case parser.BINARY_ACK:
        this.onack(packet);
        break;

      case parser.DISCONNECT:
        this.ondisconnect();
        break;

      case parser.ERROR:
        this.emit('error', packet.data);
        break;
    }
  };

  /**
   * Called upon a server event.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.onevent = function(packet){
    var args = packet.data || [];
    debug('emitting event %j', args);

    if (null != packet.id) {
      debug('attaching ack callback to event');
      args.push(this.ack(packet.id));
    }

    if (this.connected) {
      emit.apply(this, args);
    } else {
      this.receiveBuffer.push(args);
    }
  };

  /**
   * Produces an ack callback to emit with an event.
   *
   * @api private
   */

  Socket.prototype.ack = function(id){
    var self = this;
    var sent = false;
    return function(){
      // prevent double callbacks
      if (sent) return;
      sent = true;
      var args = toArray(arguments);
      debug('sending ack %j', args);

      var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
      self.packet({
        type: type,
        id: id,
        data: args
      });
    };
  };

  /**
   * Called upon a server acknowlegement.
   *
   * @param {Object} packet
   * @api private
   */

  Socket.prototype.onack = function(packet){
    debug('calling ack %s with %j', packet.id, packet.data);
    var fn = this.acks[packet.id];
    fn.apply(this, packet.data);
    delete this.acks[packet.id];
  };

  /**
   * Called upon server connect.
   *
   * @api private
   */

  Socket.prototype.onconnect = function(){
    this.connected = true;
    this.disconnected = false;
    this.emit('connect');
    this.emitBuffered();
  };

  /**
   * Emit buffered events (received and emitted).
   *
   * @api private
   */

  Socket.prototype.emitBuffered = function(){
    var i;
    for (i = 0; i < this.receiveBuffer.length; i++) {
      emit.apply(this, this.receiveBuffer[i]);
    }
    this.receiveBuffer = [];

    for (i = 0; i < this.sendBuffer.length; i++) {
      this.packet(this.sendBuffer[i]);
    }
    this.sendBuffer = [];
  };

  /**
   * Called upon server disconnect.
   *
   * @api private
   */

  Socket.prototype.ondisconnect = function(){
    debug('server disconnect (%s)', this.nsp);
    this.destroy();
    this.onclose('io server disconnect');
  };

  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @api private.
   */

  Socket.prototype.destroy = function(){
    if (this.subs) {
      // clean subscriptions to avoid reconnections
      for (var i = 0; i < this.subs.length; i++) {
        this.subs[i].destroy();
      }
      this.subs = null;
    }

    this.io.destroy(this);
  };

  /**
   * Disconnects the socket manually.
   *
   * @return {Socket} self
   * @api public
   */

  Socket.prototype.close =
    Socket.prototype.disconnect = function(){
      if (this.connected) {
        debug('performing disconnect (%s)', this.nsp);
        this.packet({ type: parser.DISCONNECT });
      }

      // remove socket from pool
      this.destroy();

      if (this.connected) {
        // fire events
        this.onclose('io client disconnect');
      }
      return this;
    };

},{"./on":4,"component-bind":8,"component-emitter":9,"debug":10,"has-binary":36,"socket.io-parser":44,"to-array":48}],6:[function(_dereq_,module,exports){
  (function (global){

    /**
     * Module dependencies.
     */

    var parseuri = _dereq_('parseuri');
    var debug = _dereq_('debug')('socket.io-client:url');

    /**
     * Module exports.
     */

    module.exports = url;

    /**
     * URL parser.
     *
     * @param {String} url
     * @param {Object} An object meant to mimic window.location.
     *                 Defaults to window.location.
     * @api public
     */

    function url(uri, loc){
      var obj = uri;

      // default to window.location
      var loc = loc || global.location;
      if (null == uri) uri = loc.protocol + '//' + loc.host;

      // relative path support
      if ('string' == typeof uri) {
        if ('/' == uri.charAt(0)) {
          if ('/' == uri.charAt(1)) {
            uri = loc.protocol + uri;
          } else {
            uri = loc.hostname + uri;
          }
        }

        if (!/^(https?|wss?):\/\//.test(uri)) {
          debug('protocol-less url %s', uri);
          if ('undefined' != typeof loc) {
            uri = loc.protocol + '//' + uri;
          } else {
            uri = 'https://' + uri;
          }
        }

        // parse
        debug('parse %s', uri);
        obj = parseuri(uri);
      }

      // make sure we treat `localhost:80` and `localhost` equally
      if (!obj.port) {
        if (/^(http|ws)$/.test(obj.protocol)) {
          obj.port = '80';
        }
        else if (/^(http|ws)s$/.test(obj.protocol)) {
          obj.port = '443';
        }
      }

      obj.path = obj.path || '/';

      // define unique id
      obj.id = obj.protocol + '://' + obj.host + ':' + obj.port;
      // define href
      obj.href = obj.protocol + '://' + obj.host + (loc && loc.port == obj.port ? '' : (':' + obj.port));

      return obj;
    }

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":10,"parseuri":42}],7:[function(_dereq_,module,exports){

  /**
   * Expose `Backoff`.
   */

  module.exports = Backoff;

  /**
   * Initialize backoff timer with `opts`.
   *
   * - `min` initial timeout in milliseconds [100]
   * - `max` max timeout [10000]
   * - `jitter` [0]
   * - `factor` [2]
   *
   * @param {Object} opts
   * @api public
   */

  function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 10000;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
  }

  /**
   * Return the backoff duration.
   *
   * @return {Number}
   * @api public
   */

  Backoff.prototype.duration = function(){
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
      var rand =  Math.random();
      var deviation = Math.floor(rand * this.jitter * ms);
      ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
  };

  /**
   * Reset the number of attempts.
   *
   * @api public
   */

  Backoff.prototype.reset = function(){
    this.attempts = 0;
  };

  /**
   * Set the minimum duration
   *
   * @api public
   */

  Backoff.prototype.setMin = function(min){
    this.ms = min;
  };

  /**
   * Set the maximum duration
   *
   * @api public
   */

  Backoff.prototype.setMax = function(max){
    this.max = max;
  };

  /**
   * Set the jitter
   *
   * @api public
   */

  Backoff.prototype.setJitter = function(jitter){
    this.jitter = jitter;
  };


},{}],8:[function(_dereq_,module,exports){
  /**
   * Slice reference.
   */

  var slice = [].slice;

  /**
   * Bind `obj` to `fn`.
   *
   * @param {Object} obj
   * @param {Function|String} fn or string
   * @return {Function}
   * @api public
   */

  module.exports = function(obj, fn){
    if ('string' == typeof fn) fn = obj[fn];
    if ('function' != typeof fn) throw new Error('bind() requires a function');
    var args = slice.call(arguments, 2);
    return function(){
      return fn.apply(obj, args.concat(slice.call(arguments)));
    }
  };

},{}],9:[function(_dereq_,module,exports){

  /**
   * Expose `Emitter`.
   */

  module.exports = Emitter;

  /**
   * Initialize a new `Emitter`.
   *
   * @api public
   */

  function Emitter(obj) {
    if (obj) return mixin(obj);
  };

  /**
   * Mixin the emitter properties.
   *
   * @param {Object} obj
   * @return {Object}
   * @api private
   */

  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }
    return obj;
  }

  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */

  Emitter.prototype.on =
    Emitter.prototype.addEventListener = function(event, fn){
      this._callbacks = this._callbacks || {};
      (this._callbacks[event] = this._callbacks[event] || [])
        .push(fn);
      return this;
    };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */

  Emitter.prototype.once = function(event, fn){
    var self = this;
    this._callbacks = this._callbacks || {};

    function on() {
      self.off(event, on);
      fn.apply(this, arguments);
    }

    on.fn = fn;
    this.on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   * @return {Emitter}
   * @api public
   */

  Emitter.prototype.off =
    Emitter.prototype.removeListener =
      Emitter.prototype.removeAllListeners =
        Emitter.prototype.removeEventListener = function(event, fn){
          this._callbacks = this._callbacks || {};

          // all
          if (0 == arguments.length) {
            this._callbacks = {};
            return this;
          }

          // specific event
          var callbacks = this._callbacks[event];
          if (!callbacks) return this;

          // remove all handlers
          if (1 == arguments.length) {
            delete this._callbacks[event];
            return this;
          }

          // remove specific handler
          var cb;
          for (var i = 0; i < callbacks.length; i++) {
            cb = callbacks[i];
            if (cb === fn || cb.fn === fn) {
              callbacks.splice(i, 1);
              break;
            }
          }
          return this;
        };

  /**
   * Emit `event` with the given args.
   *
   * @param {String} event
   * @param {Mixed} ...
   * @return {Emitter}
   */

  Emitter.prototype.emit = function(event){
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1)
      , callbacks = this._callbacks[event];

    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }

    return this;
  };

  /**
   * Return array of callbacks for `event`.
   *
   * @param {String} event
   * @return {Array}
   * @api public
   */

  Emitter.prototype.listeners = function(event){
    this._callbacks = this._callbacks || {};
    return this._callbacks[event] || [];
  };

  /**
   * Check if this emitter has `event` handlers.
   *
   * @param {String} event
   * @return {Boolean}
   * @api public
   */

  Emitter.prototype.hasListeners = function(event){
    return !! this.listeners(event).length;
  };

},{}],10:[function(_dereq_,module,exports){

  /**
   * Expose `debug()` as the module.
   */

  module.exports = debug;

  /**
   * Create a debugger with the given `name`.
   *
   * @param {String} name
   * @return {Type}
   * @api public
   */

  function debug(name) {
    if (!debug.enabled(name)) return function(){};

    return function(fmt){
      fmt = coerce(fmt);

      var curr = new Date;
      var ms = curr - (debug[name] || curr);
      debug[name] = curr;

      fmt = name
        + ' '
        + fmt
        + ' +' + debug.humanize(ms);

      // This hackery is required for IE8
      // where `console.log` doesn't have 'apply'
      window.console
        && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
    }
  }

  /**
   * The currently active debug mode names.
   */

  debug.names = [];
  debug.skips = [];

  /**
   * Enables a debug mode by name. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} name
   * @api public
   */

  debug.enable = function(name) {
    try {
      localStorage.debug = name;
    } catch(e){}

    var split = (name || '').split(/[\s,]+/)
      , len = split.length;

    for (var i = 0; i < len; i++) {
      name = split[i].replace('*', '.*?');
      if (name[0] === '-') {
        debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
      }
      else {
        debug.names.push(new RegExp('^' + name + '$'));
      }
    }
  };

  /**
   * Disable debug output.
   *
   * @api public
   */

  debug.disable = function(){
    debug.enable('');
  };

  /**
   * Humanize the given `ms`.
   *
   * @param {Number} m
   * @return {String}
   * @api private
   */

  debug.humanize = function(ms) {
    var sec = 1000
      , min = 60 * 1000
      , hour = 60 * min;

    if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
    if (ms >= min) return (ms / min).toFixed(1) + 'm';
    if (ms >= sec) return (ms / sec | 0) + 's';
    return ms + 'ms';
  };

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  debug.enabled = function(name) {
    for (var i = 0, len = debug.skips.length; i < len; i++) {
      if (debug.skips[i].test(name)) {
        return false;
      }
    }
    for (var i = 0, len = debug.names.length; i < len; i++) {
      if (debug.names[i].test(name)) {
        return true;
      }
    }
    return false;
  };

  /**
   * Coerce `val`.
   */

  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }

// persist

  try {
    if (window.localStorage) debug.enable(localStorage.debug);
  } catch(e){}

},{}],11:[function(_dereq_,module,exports){

  module.exports =  _dereq_('./lib/');

},{"./lib/":12}],12:[function(_dereq_,module,exports){

  module.exports = _dereq_('./socket');

  /**
   * Exports parser
   *
   * @api public
   *
   */
  module.exports.parser = _dereq_('engine.io-parser');

},{"./socket":13,"engine.io-parser":25}],13:[function(_dereq_,module,exports){
  (function (global){
    /**
     * Module dependencies.
     */

    var transports = _dereq_('./transports');
    var Emitter = _dereq_('component-emitter');
    var debug = _dereq_('debug')('engine.io-client:socket');
    var index = _dereq_('indexof');
    var parser = _dereq_('engine.io-parser');
    var parseuri = _dereq_('parseuri');
    var parsejson = _dereq_('parsejson');
    var parseqs = _dereq_('parseqs');

    /**
     * Module exports.
     */

    module.exports = Socket;

    /**
     * Noop function.
     *
     * @api private
     */

    function noop(){}

    /**
     * Socket constructor.
     *
     * @param {String|Object} uri or options
     * @param {Object} options
     * @api public
     */

    function Socket(uri, opts){
      if (!(this instanceof Socket)) return new Socket(uri, opts);

      opts = opts || {};

      if (uri && 'object' == typeof uri) {
        opts = uri;
        uri = null;
      }

      if (uri) {
        uri = parseuri(uri);
        opts.host = uri.host;
        opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
        opts.port = uri.port;
        if (uri.query) opts.query = uri.query;
      }

      this.secure = null != opts.secure ? opts.secure :
        (global.location && 'https:' == location.protocol);

      if (opts.host) {
        var pieces = opts.host.split(':');
        opts.hostname = pieces.shift();
        if (pieces.length) {
          opts.port = pieces.pop();
        } else if (!opts.port) {
          // if no port is specified manually, use the protocol default
          opts.port = this.secure ? '443' : '80';
        }
      }

      this.agent = opts.agent || false;
      this.hostname = opts.hostname ||
        (global.location ? location.hostname : 'localhost');
      this.port = opts.port || (global.location && location.port ?
        location.port :
        (this.secure ? 443 : 80));
      this.query = opts.query || {};
      if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
      this.upgrade = false !== opts.upgrade;
      this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
      this.forceJSONP = !!opts.forceJSONP;
      this.jsonp = false !== opts.jsonp;
      this.forceBase64 = !!opts.forceBase64;
      this.enablesXDR = !!opts.enablesXDR;
      this.timestampParam = opts.timestampParam || 't';
      this.timestampRequests = opts.timestampRequests;
      this.transports = opts.transports || ['polling', 'websocket'];
      this.readyState = '';
      this.writeBuffer = [];
      this.callbackBuffer = [];
      this.policyPort = opts.policyPort || 843;
      this.rememberUpgrade = opts.rememberUpgrade || false;
      this.binaryType = null;
      this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;

      // SSL options for Node.js client
      this.pfx = opts.pfx || null;
      this.key = opts.key || null;
      this.passphrase = opts.passphrase || null;
      this.cert = opts.cert || null;
      this.ca = opts.ca || null;
      this.ciphers = opts.ciphers || null;
      this.rejectUnauthorized = opts.rejectUnauthorized || null;

      this.open();
    }

    Socket.priorWebsocketSuccess = false;

    /**
     * Mix in `Emitter`.
     */

    Emitter(Socket.prototype);

    /**
     * Protocol version.
     *
     * @api public
     */

    Socket.protocol = parser.protocol; // this is an int

    /**
     * Expose deps for legacy compatibility
     * and standalone browser access.
     */

    Socket.Socket = Socket;
    Socket.Transport = _dereq_('./transport');
    Socket.transports = _dereq_('./transports');
    Socket.parser = _dereq_('engine.io-parser');

    /**
     * Creates transport of the given type.
     *
     * @param {String} transport name
     * @return {Transport}
     * @api private
     */

    Socket.prototype.createTransport = function (name) {
      debug('creating transport "%s"', name);
      var query = clone(this.query);

      // append engine.io protocol identifier
      query.EIO = parser.protocol;

      // transport name
      query.transport = name;

      // session id if we already have one
      if (this.id) query.sid = this.id;

      var transport = new transports[name]({
        agent: this.agent,
        hostname: this.hostname,
        port: this.port,
        secure: this.secure,
        path: this.path,
        query: query,
        forceJSONP: this.forceJSONP,
        jsonp: this.jsonp,
        forceBase64: this.forceBase64,
        enablesXDR: this.enablesXDR,
        timestampRequests: this.timestampRequests,
        timestampParam: this.timestampParam,
        policyPort: this.policyPort,
        socket: this,
        pfx: this.pfx,
        key: this.key,
        passphrase: this.passphrase,
        cert: this.cert,
        ca: this.ca,
        ciphers: this.ciphers,
        rejectUnauthorized: this.rejectUnauthorized
      });

      return transport;
    };

    function clone (obj) {
      var o = {};
      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          o[i] = obj[i];
        }
      }
      return o;
    }

    /**
     * Initializes transport to use and starts probe.
     *
     * @api private
     */
    Socket.prototype.open = function () {
      var transport;
      if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
        transport = 'websocket';
      } else if (0 == this.transports.length) {
        // Emit error on next tick so it can be listened to
        var self = this;
        setTimeout(function() {
          self.emit('error', 'No transports available');
        }, 0);
        return;
      } else {
        transport = this.transports[0];
      }
      this.readyState = 'opening';

      // Retry with the next transport if the transport is disabled (jsonp: false)
      var transport;
      try {
        transport = this.createTransport(transport);
      } catch (e) {
        this.transports.shift();
        this.open();
        return;
      }

      transport.open();
      this.setTransport(transport);
    };

    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @api private
     */

    Socket.prototype.setTransport = function(transport){
      debug('setting transport %s', transport.name);
      var self = this;

      if (this.transport) {
        debug('clearing existing transport %s', this.transport.name);
        this.transport.removeAllListeners();
      }

      // set up transport
      this.transport = transport;

      // set up transport listeners
      transport
        .on('drain', function(){
          self.onDrain();
        })
        .on('packet', function(packet){
          self.onPacket(packet);
        })
        .on('error', function(e){
          self.onError(e);
        })
        .on('close', function(){
          self.onClose('transport close');
        });
    };

    /**
     * Probes a transport.
     *
     * @param {String} transport name
     * @api private
     */

    Socket.prototype.probe = function (name) {
      debug('probing transport "%s"', name);
      var transport = this.createTransport(name, { probe: 1 })
        , failed = false
        , self = this;

      Socket.priorWebsocketSuccess = false;

      function onTransportOpen(){
        if (self.onlyBinaryUpgrades) {
          var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
          failed = failed || upgradeLosesBinary;
        }
        if (failed) return;

        debug('probe transport "%s" opened', name);
        transport.send([{ type: 'ping', data: 'probe' }]);
        transport.once('packet', function (msg) {
          if (failed) return;
          if ('pong' == msg.type && 'probe' == msg.data) {
            debug('probe transport "%s" pong', name);
            self.upgrading = true;
            self.emit('upgrading', transport);
            if (!transport) return;
            Socket.priorWebsocketSuccess = 'websocket' == transport.name;

            debug('pausing current transport "%s"', self.transport.name);
            self.transport.pause(function () {
              if (failed) return;
              if ('closed' == self.readyState) return;
              debug('changing transport and sending upgrade packet');

              cleanup();

              self.setTransport(transport);
              transport.send([{ type: 'upgrade' }]);
              self.emit('upgrade', transport);
              transport = null;
              self.upgrading = false;
              self.flush();
            });
          } else {
            debug('probe transport "%s" failed', name);
            var err = new Error('probe error');
            err.transport = transport.name;
            self.emit('upgradeError', err);
          }
        });
      }

      function freezeTransport() {
        if (failed) return;

        // Any callback called by transport should be ignored since now
        failed = true;

        cleanup();

        transport.close();
        transport = null;
      }

      //Handle any error that happens while probing
      function onerror(err) {
        var error = new Error('probe error: ' + err);
        error.transport = transport.name;

        freezeTransport();

        debug('probe transport "%s" failed because of error: %s', name, err);

        self.emit('upgradeError', error);
      }

      function onTransportClose(){
        onerror("transport closed");
      }

      //When the socket is closed while we're probing
      function onclose(){
        onerror("socket closed");
      }

      //When the socket is upgraded while we're probing
      function onupgrade(to){
        if (transport && to.name != transport.name) {
          debug('"%s" works - aborting "%s"', to.name, transport.name);
          freezeTransport();
        }
      }

      //Remove all listeners on the transport and on self
      function cleanup(){
        transport.removeListener('open', onTransportOpen);
        transport.removeListener('error', onerror);
        transport.removeListener('close', onTransportClose);
        self.removeListener('close', onclose);
        self.removeListener('upgrading', onupgrade);
      }

      transport.once('open', onTransportOpen);
      transport.once('error', onerror);
      transport.once('close', onTransportClose);

      this.once('close', onclose);
      this.once('upgrading', onupgrade);

      transport.open();

    };

    /**
     * Called when connection is deemed open.
     *
     * @api public
     */

    Socket.prototype.onOpen = function () {
      debug('socket open');
      this.readyState = 'open';
      Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
      this.emit('open');
      this.flush();

      // we check for `readyState` in case an `open`
      // listener already closed the socket
      if ('open' == this.readyState && this.upgrade && this.transport.pause) {
        debug('starting upgrade probes');
        for (var i = 0, l = this.upgrades.length; i < l; i++) {
          this.probe(this.upgrades[i]);
        }
      }
    };

    /**
     * Handles a packet.
     *
     * @api private
     */

    Socket.prototype.onPacket = function (packet) {
      if ('opening' == this.readyState || 'open' == this.readyState) {
        debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

        this.emit('packet', packet);

        // Socket is live - any packet counts
        this.emit('heartbeat');

        switch (packet.type) {
          case 'open':
            this.onHandshake(parsejson(packet.data));
            break;

          case 'pong':
            this.setPing();
            break;

          case 'error':
            var err = new Error('server error');
            err.code = packet.data;
            this.emit('error', err);
            break;

          case 'message':
            this.emit('data', packet.data);
            this.emit('message', packet.data);
            break;
        }
      } else {
        debug('packet received with socket readyState "%s"', this.readyState);
      }
    };

    /**
     * Called upon handshake completion.
     *
     * @param {Object} handshake obj
     * @api private
     */

    Socket.prototype.onHandshake = function (data) {
      this.emit('handshake', data);
      this.id = data.sid;
      this.transport.query.sid = data.sid;
      this.upgrades = this.filterUpgrades(data.upgrades);
      this.pingInterval = data.pingInterval;
      this.pingTimeout = data.pingTimeout;
      this.onOpen();
      // In case open handler closes socket
      if  ('closed' == this.readyState) return;
      this.setPing();

      // Prolong liveness of socket on heartbeat
      this.removeListener('heartbeat', this.onHeartbeat);
      this.on('heartbeat', this.onHeartbeat);
    };

    /**
     * Resets ping timeout.
     *
     * @api private
     */

    Socket.prototype.onHeartbeat = function (timeout) {
      clearTimeout(this.pingTimeoutTimer);
      var self = this;
      self.pingTimeoutTimer = setTimeout(function () {
        if ('closed' == self.readyState) return;
        self.onClose('ping timeout');
      }, timeout || (self.pingInterval + self.pingTimeout));
    };

    /**
     * Pings server every `this.pingInterval` and expects response
     * within `this.pingTimeout` or closes connection.
     *
     * @api private
     */

    Socket.prototype.setPing = function () {
      var self = this;
      clearTimeout(self.pingIntervalTimer);
      self.pingIntervalTimer = setTimeout(function () {
        debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
        self.ping();
        self.onHeartbeat(self.pingTimeout);
      }, self.pingInterval);
    };

    /**
     * Sends a ping packet.
     *
     * @api public
     */

    Socket.prototype.ping = function () {
      this.sendPacket('ping');
    };

    /**
     * Called on `drain` event
     *
     * @api private
     */

    Socket.prototype.onDrain = function() {
      for (var i = 0; i < this.prevBufferLen; i++) {
        if (this.callbackBuffer[i]) {
          this.callbackBuffer[i]();
        }
      }

      this.writeBuffer.splice(0, this.prevBufferLen);
      this.callbackBuffer.splice(0, this.prevBufferLen);

      // setting prevBufferLen = 0 is very important
      // for example, when upgrading, upgrade packet is sent over,
      // and a nonzero prevBufferLen could cause problems on `drain`
      this.prevBufferLen = 0;

      if (this.writeBuffer.length == 0) {
        this.emit('drain');
      } else {
        this.flush();
      }
    };

    /**
     * Flush write buffers.
     *
     * @api private
     */

    Socket.prototype.flush = function () {
      if ('closed' != this.readyState && this.transport.writable &&
        !this.upgrading && this.writeBuffer.length) {
        debug('flushing %d packets in socket', this.writeBuffer.length);
        this.transport.send(this.writeBuffer);
        // keep track of current length of writeBuffer
        // splice writeBuffer and callbackBuffer on `drain`
        this.prevBufferLen = this.writeBuffer.length;
        this.emit('flush');
      }
    };

    /**
     * Sends a message.
     *
     * @param {String} message.
     * @param {Function} callback function.
     * @return {Socket} for chaining.
     * @api public
     */

    Socket.prototype.write =
      Socket.prototype.send = function (msg, fn) {
        this.sendPacket('message', msg, fn);
        return this;
      };

    /**
     * Sends a packet.
     *
     * @param {String} packet type.
     * @param {String} data.
     * @param {Function} callback function.
     * @api private
     */

    Socket.prototype.sendPacket = function (type, data, fn) {
      if ('closing' == this.readyState || 'closed' == this.readyState) {
        return;
      }

      var packet = { type: type, data: data };
      this.emit('packetCreate', packet);
      this.writeBuffer.push(packet);
      this.callbackBuffer.push(fn);
      this.flush();
    };

    /**
     * Closes the connection.
     *
     * @api private
     */

    Socket.prototype.close = function () {
      if ('opening' == this.readyState || 'open' == this.readyState) {
        this.readyState = 'closing';

        var self = this;

        function close() {
          self.onClose('forced close');
          debug('socket closing - telling transport to close');
          self.transport.close();
        }

        function cleanupAndClose() {
          self.removeListener('upgrade', cleanupAndClose);
          self.removeListener('upgradeError', cleanupAndClose);
          close();
        }

        function waitForUpgrade() {
          // wait for upgrade to finish since we can't send packets while pausing a transport
          self.once('upgrade', cleanupAndClose);
          self.once('upgradeError', cleanupAndClose);
        }

        if (this.writeBuffer.length) {
          this.once('drain', function() {
            if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          });
        } else if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      }

      return this;
    };

    /**
     * Called upon transport error
     *
     * @api private
     */

    Socket.prototype.onError = function (err) {
      debug('socket error %j', err);
      Socket.priorWebsocketSuccess = false;
      this.emit('error', err);
      this.onClose('transport error', err);
    };

    /**
     * Called upon transport close.
     *
     * @api private
     */

    Socket.prototype.onClose = function (reason, desc) {
      if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
        debug('socket close with reason: "%s"', reason);
        var self = this;

        // clear timers
        clearTimeout(this.pingIntervalTimer);
        clearTimeout(this.pingTimeoutTimer);

        // clean buffers in next tick, so developers can still
        // grab the buffers on `close` event
        setTimeout(function() {
          self.writeBuffer = [];
          self.callbackBuffer = [];
          self.prevBufferLen = 0;
        }, 0);

        // stop event from firing again for transport
        this.transport.removeAllListeners('close');

        // ensure transport won't stay open
        this.transport.close();

        // ignore further transport communication
        this.transport.removeAllListeners();

        // set ready state
        this.readyState = 'closed';

        // clear session id
        this.id = null;

        // emit close event
        this.emit('close', reason, desc);
      }
    };

    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} server upgrades
     * @api private
     *
     */

    Socket.prototype.filterUpgrades = function (upgrades) {
      var filteredUpgrades = [];
      for (var i = 0, j = upgrades.length; i<j; i++) {
        if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
      }
      return filteredUpgrades;
    };

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":14,"./transports":15,"component-emitter":9,"debug":22,"engine.io-parser":25,"indexof":40,"parsejson":32,"parseqs":33,"parseuri":34}],14:[function(_dereq_,module,exports){
  /**
   * Module dependencies.
   */

  var parser = _dereq_('engine.io-parser');
  var Emitter = _dereq_('component-emitter');

  /**
   * Module exports.
   */

  module.exports = Transport;

  /**
   * Transport abstract constructor.
   *
   * @param {Object} options.
   * @api private
   */

  function Transport (opts) {
    this.path = opts.path;
    this.hostname = opts.hostname;
    this.port = opts.port;
    this.secure = opts.secure;
    this.query = opts.query;
    this.timestampParam = opts.timestampParam;
    this.timestampRequests = opts.timestampRequests;
    this.readyState = '';
    this.agent = opts.agent || false;
    this.socket = opts.socket;
    this.enablesXDR = opts.enablesXDR;

    // SSL options for Node.js client
    this.pfx = opts.pfx;
    this.key = opts.key;
    this.passphrase = opts.passphrase;
    this.cert = opts.cert;
    this.ca = opts.ca;
    this.ciphers = opts.ciphers;
    this.rejectUnauthorized = opts.rejectUnauthorized;
  }

  /**
   * Mix in `Emitter`.
   */

  Emitter(Transport.prototype);

  /**
   * A counter used to prevent collisions in the timestamps used
   * for cache busting.
   */

  Transport.timestamps = 0;

  /**
   * Emits an error.
   *
   * @param {String} str
   * @return {Transport} for chaining
   * @api public
   */

  Transport.prototype.onError = function (msg, desc) {
    var err = new Error(msg);
    err.type = 'TransportError';
    err.description = desc;
    this.emit('error', err);
    return this;
  };

  /**
   * Opens the transport.
   *
   * @api public
   */

  Transport.prototype.open = function () {
    if ('closed' == this.readyState || '' == this.readyState) {
      this.readyState = 'opening';
      this.doOpen();
    }

    return this;
  };

  /**
   * Closes the transport.
   *
   * @api private
   */

  Transport.prototype.close = function () {
    if ('opening' == this.readyState || 'open' == this.readyState) {
      this.doClose();
      this.onClose();
    }

    return this;
  };

  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   * @api private
   */

  Transport.prototype.send = function(packets){
    if ('open' == this.readyState) {
      this.write(packets);
    } else {
      throw new Error('Transport not open');
    }
  };

  /**
   * Called upon open
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.readyState = 'open';
    this.writable = true;
    this.emit('open');
  };

  /**
   * Called with data.
   *
   * @param {String} data
   * @api private
   */

  Transport.prototype.onData = function(data){
    var packet = parser.decodePacket(data, this.socket.binaryType);
    this.onPacket(packet);
  };

  /**
   * Called with a decoded packet.
   */

  Transport.prototype.onPacket = function (packet) {
    this.emit('packet', packet);
  };

  /**
   * Called upon close.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    this.readyState = 'closed';
    this.emit('close');
  };

},{"component-emitter":9,"engine.io-parser":25}],15:[function(_dereq_,module,exports){
  (function (global){
    /**
     * Module dependencies
     */

    var XMLHttpRequest = _dereq_('xmlhttprequest');
    var XHR = _dereq_('./polling-xhr');
    var JSONP = _dereq_('./polling-jsonp');
    var websocket = _dereq_('./websocket');

    /**
     * Export transports.
     */

    exports.polling = polling;
    exports.websocket = websocket;

    /**
     * Polling transport polymorphic constructor.
     * Decides on xhr vs jsonp based on feature detection.
     *
     * @api private
     */

    function polling(opts){
      var xhr;
      var xd = false;
      var xs = false;
      var jsonp = false !== opts.jsonp;

      if (global.location) {
        var isSSL = 'https:' == location.protocol;
        var port = location.port;

        // some user agents have empty `location.port`
        if (!port) {
          port = isSSL ? 443 : 80;
        }

        xd = opts.hostname != location.hostname || port != opts.port;
        xs = opts.secure != isSSL;
      }

      opts.xdomain = xd;
      opts.xscheme = xs;
      xhr = new XMLHttpRequest(opts);

      if ('open' in xhr && !opts.forceJSONP) {
        return new XHR(opts);
      } else {
        if (!jsonp) throw new Error('JSONP disabled');
        return new JSONP(opts);
      }
    }

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling-jsonp":16,"./polling-xhr":17,"./websocket":19,"xmlhttprequest":20}],16:[function(_dereq_,module,exports){
  (function (global){

    /**
     * Module requirements.
     */

    var Polling = _dereq_('./polling');
    var inherit = _dereq_('component-inherit');

    /**
     * Module exports.
     */

    module.exports = JSONPPolling;

    /**
     * Cached regular expressions.
     */

    var rNewline = /\n/g;
    var rEscapedNewline = /\\n/g;

    /**
     * Global JSONP callbacks.
     */

    var callbacks;

    /**
     * Callbacks count.
     */

    var index = 0;

    /**
     * Noop.
     */

    function empty () { }

    /**
     * JSONP Polling constructor.
     *
     * @param {Object} opts.
     * @api public
     */

    function JSONPPolling (opts) {
      Polling.call(this, opts);

      this.query = this.query || {};

      // define global callbacks array if not present
      // we do this here (lazily) to avoid unneeded global pollution
      if (!callbacks) {
        // we need to consider multiple engines in the same page
        if (!global.___eio) global.___eio = [];
        callbacks = global.___eio;
      }

      // callback identifier
      this.index = callbacks.length;

      // add callback to jsonp global
      var self = this;
      callbacks.push(function (msg) {
        self.onData(msg);
      });

      // append to query string
      this.query.j = this.index;

      // prevent spurious errors from being emitted when the window is unloaded
      if (global.document && global.addEventListener) {
        global.addEventListener('beforeunload', function () {
          if (self.script) self.script.onerror = empty;
        }, false);
      }
    }

    /**
     * Inherits from Polling.
     */

    inherit(JSONPPolling, Polling);

    /*
     * JSONP only supports binary as base64 encoded strings
     */

    JSONPPolling.prototype.supportsBinary = false;

    /**
     * Closes the socket.
     *
     * @api private
     */

    JSONPPolling.prototype.doClose = function () {
      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      if (this.form) {
        this.form.parentNode.removeChild(this.form);
        this.form = null;
        this.iframe = null;
      }

      Polling.prototype.doClose.call(this);
    };

    /**
     * Starts a poll cycle.
     *
     * @api private
     */

    JSONPPolling.prototype.doPoll = function () {
      var self = this;
      var script = document.createElement('script');

      if (this.script) {
        this.script.parentNode.removeChild(this.script);
        this.script = null;
      }

      script.async = true;
      script.src = this.uri();
      script.onerror = function(e){
        self.onError('jsonp poll error',e);
      };

      var insertAt = document.getElementsByTagName('script')[0];
      insertAt.parentNode.insertBefore(script, insertAt);
      this.script = script;

      var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);

      if (isUAgecko) {
        setTimeout(function () {
          var iframe = document.createElement('iframe');
          document.body.appendChild(iframe);
          document.body.removeChild(iframe);
        }, 100);
      }
    };

    /**
     * Writes with a hidden iframe.
     *
     * @param {String} data to send
     * @param {Function} called upon flush.
     * @api private
     */

    JSONPPolling.prototype.doWrite = function (data, fn) {
      var self = this;

      if (!this.form) {
        var form = document.createElement('form');
        var area = document.createElement('textarea');
        var id = this.iframeId = 'eio_iframe_' + this.index;
        var iframe;

        form.className = 'socketio';
        form.style.position = 'absolute';
        form.style.top = '-1000px';
        form.style.left = '-1000px';
        form.target = id;
        form.method = 'POST';
        form.setAttribute('accept-charset', 'utf-8');
        area.name = 'd';
        form.appendChild(area);
        document.body.appendChild(form);

        this.form = form;
        this.area = area;
      }

      this.form.action = this.uri();

      function complete () {
        initIframe();
        fn();
      }

      function initIframe () {
        if (self.iframe) {
          try {
            self.form.removeChild(self.iframe);
          } catch (e) {
            self.onError('jsonp polling iframe removal error', e);
          }
        }

        try {
          // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
          var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
          iframe = document.createElement(html);
        } catch (e) {
          iframe = document.createElement('iframe');
          iframe.name = self.iframeId;
          iframe.src = 'javascript:0';
        }

        iframe.id = self.iframeId;

        self.form.appendChild(iframe);
        self.iframe = iframe;
      }

      initIframe();

      // escape \n to prevent it from being converted into \r\n by some UAs
      // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
      data = data.replace(rEscapedNewline, '\\\n');
      this.area.value = data.replace(rNewline, '\\n');

      try {
        this.form.submit();
      } catch(e) {}

      if (this.iframe.attachEvent) {
        this.iframe.onreadystatechange = function(){
          if (self.iframe.readyState == 'complete') {
            complete();
          }
        };
      } else {
        this.iframe.onload = complete;
      }
    };

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":18,"component-inherit":21}],17:[function(_dereq_,module,exports){
  (function (global){
    /**
     * Module requirements.
     */

    var XMLHttpRequest = _dereq_('xmlhttprequest');
    var Polling = _dereq_('./polling');
    var Emitter = _dereq_('component-emitter');
    var inherit = _dereq_('component-inherit');
    var debug = _dereq_('debug')('engine.io-client:polling-xhr');

    /**
     * Module exports.
     */

    module.exports = XHR;
    module.exports.Request = Request;

    /**
     * Empty function
     */

    function empty(){}

    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @api public
     */

    function XHR(opts){
      Polling.call(this, opts);

      if (global.location) {
        var isSSL = 'https:' == location.protocol;
        var port = location.port;

        // some user agents have empty `location.port`
        if (!port) {
          port = isSSL ? 443 : 80;
        }

        this.xd = opts.hostname != global.location.hostname ||
          port != opts.port;
        this.xs = opts.secure != isSSL;
      }
    }

    /**
     * Inherits from Polling.
     */

    inherit(XHR, Polling);

    /**
     * XHR supports binary
     */

    XHR.prototype.supportsBinary = true;

    /**
     * Creates a request.
     *
     * @param {String} method
     * @api private
     */

    XHR.prototype.request = function(opts){
      opts = opts || {};
      opts.uri = this.uri();
      opts.xd = this.xd;
      opts.xs = this.xs;
      opts.agent = this.agent || false;
      opts.supportsBinary = this.supportsBinary;
      opts.enablesXDR = this.enablesXDR;

      // SSL options for Node.js client
      opts.pfx = this.pfx;
      opts.key = this.key;
      opts.passphrase = this.passphrase;
      opts.cert = this.cert;
      opts.ca = this.ca;
      opts.ciphers = this.ciphers;
      opts.rejectUnauthorized = this.rejectUnauthorized;

      return new Request(opts);
    };

    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @api private
     */

    XHR.prototype.doWrite = function(data, fn){
      var isBinary = typeof data !== 'string' && data !== undefined;
      var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
      var self = this;
      req.on('success', fn);
      req.on('error', function(err){
        self.onError('xhr post error', err);
      });
      this.sendXhr = req;
    };

    /**
     * Starts a poll cycle.
     *
     * @api private
     */

    XHR.prototype.doPoll = function(){
      debug('xhr poll');
      var req = this.request();
      var self = this;
      req.on('data', function(data){
        self.onData(data);
      });
      req.on('error', function(err){
        self.onError('xhr poll error', err);
      });
      this.pollXhr = req;
    };

    /**
     * Request constructor
     *
     * @param {Object} options
     * @api public
     */

    function Request(opts){
      this.method = opts.method || 'GET';
      this.uri = opts.uri;
      this.xd = !!opts.xd;
      this.xs = !!opts.xs;
      this.async = false !== opts.async;
      this.data = undefined != opts.data ? opts.data : null;
      this.agent = opts.agent;
      this.isBinary = opts.isBinary;
      this.supportsBinary = opts.supportsBinary;
      this.enablesXDR = opts.enablesXDR;

      // SSL options for Node.js client
      this.pfx = opts.pfx;
      this.key = opts.key;
      this.passphrase = opts.passphrase;
      this.cert = opts.cert;
      this.ca = opts.ca;
      this.ciphers = opts.ciphers;
      this.rejectUnauthorized = opts.rejectUnauthorized;

      this.create();
    }

    /**
     * Mix in `Emitter`.
     */

    Emitter(Request.prototype);

    /**
     * Creates the XHR object and sends the request.
     *
     * @api private
     */

    Request.prototype.create = function(){
      var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

      // SSL options for Node.js client
      opts.pfx = this.pfx;
      opts.key = this.key;
      opts.passphrase = this.passphrase;
      opts.cert = this.cert;
      opts.ca = this.ca;
      opts.ciphers = this.ciphers;
      opts.rejectUnauthorized = this.rejectUnauthorized;

      var xhr = this.xhr = new XMLHttpRequest(opts);
      var self = this;

      try {
        debug('xhr open %s: %s', this.method, this.uri);
        xhr.open(this.method, this.uri, this.async);
        if (this.supportsBinary) {
          // This has to be done after open because Firefox is stupid
          // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
          xhr.responseType = 'arraybuffer';
        }

        if ('POST' == this.method) {
          try {
            if (this.isBinary) {
              xhr.setRequestHeader('Content-type', 'application/octet-stream');
            } else {
              xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
            }
          } catch (e) {}
        }

        // ie6 check
        if ('withCredentials' in xhr) {
          xhr.withCredentials = true;
        }

        if (this.hasXDR()) {
          xhr.onload = function(){
            self.onLoad();
          };
          xhr.onerror = function(){
            self.onError(xhr.responseText);
          };
        } else {
          xhr.onreadystatechange = function(){
            if (4 != xhr.readyState) return;
            if (200 == xhr.status || 1223 == xhr.status) {
              self.onLoad();
            } else {
              // make sure the `error` event handler that's user-set
              // does not throw in the same tick and gets caught here
              setTimeout(function(){
                self.onError(xhr.status);
              }, 0);
            }
          };
        }

        debug('xhr data %s', this.data);
        xhr.send(this.data);
      } catch (e) {
        // Need to defer since .create() is called directly fhrom the constructor
        // and thus the 'error' event can only be only bound *after* this exception
        // occurs.  Therefore, also, we cannot throw here at all.
        setTimeout(function() {
          self.onError(e);
        }, 0);
        return;
      }

      if (global.document) {
        this.index = Request.requestsCount++;
        Request.requests[this.index] = this;
      }
    };

    /**
     * Called upon successful response.
     *
     * @api private
     */

    Request.prototype.onSuccess = function(){
      this.emit('success');
      this.cleanup();
    };

    /**
     * Called if we have data.
     *
     * @api private
     */

    Request.prototype.onData = function(data){
      this.emit('data', data);
      this.onSuccess();
    };

    /**
     * Called upon error.
     *
     * @api private
     */

    Request.prototype.onError = function(err){
      this.emit('error', err);
      this.cleanup(true);
    };

    /**
     * Cleans up house.
     *
     * @api private
     */

    Request.prototype.cleanup = function(fromError){
      if ('undefined' == typeof this.xhr || null === this.xhr) {
        return;
      }
      // xmlhttprequest
      if (this.hasXDR()) {
        this.xhr.onload = this.xhr.onerror = empty;
      } else {
        this.xhr.onreadystatechange = empty;
      }

      if (fromError) {
        try {
          this.xhr.abort();
        } catch(e) {}
      }

      if (global.document) {
        delete Request.requests[this.index];
      }

      this.xhr = null;
    };

    /**
     * Called upon load.
     *
     * @api private
     */

    Request.prototype.onLoad = function(){
      var data;
      try {
        var contentType;
        try {
          contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
        } catch (e) {}
        if (contentType === 'application/octet-stream') {
          data = this.xhr.response;
        } else {
          if (!this.supportsBinary) {
            data = this.xhr.responseText;
          } else {
            data = 'ok';
          }
        }
      } catch (e) {
        this.onError(e);
      }
      if (null != data) {
        this.onData(data);
      }
    };

    /**
     * Check if it has XDomainRequest.
     *
     * @api private
     */

    Request.prototype.hasXDR = function(){
      return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
    };

    /**
     * Aborts the request.
     *
     * @api public
     */

    Request.prototype.abort = function(){
      this.cleanup();
    };

    /**
     * Aborts pending requests when unloading the window. This is needed to prevent
     * memory leaks (e.g. when using IE) and to ensure that no spurious error is
     * emitted.
     */

    if (global.document) {
      Request.requestsCount = 0;
      Request.requests = {};
      if (global.attachEvent) {
        global.attachEvent('onunload', unloadHandler);
      } else if (global.addEventListener) {
        global.addEventListener('beforeunload', unloadHandler, false);
      }
    }

    function unloadHandler() {
      for (var i in Request.requests) {
        if (Request.requests.hasOwnProperty(i)) {
          Request.requests[i].abort();
        }
      }
    }

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":18,"component-emitter":9,"component-inherit":21,"debug":22,"xmlhttprequest":20}],18:[function(_dereq_,module,exports){
  /**
   * Module dependencies.
   */

  var Transport = _dereq_('../transport');
  var parseqs = _dereq_('parseqs');
  var parser = _dereq_('engine.io-parser');
  var inherit = _dereq_('component-inherit');
  var debug = _dereq_('debug')('engine.io-client:polling');

  /**
   * Module exports.
   */

  module.exports = Polling;

  /**
   * Is XHR2 supported?
   */

  var hasXHR2 = (function() {
    var XMLHttpRequest = _dereq_('xmlhttprequest');
    var xhr = new XMLHttpRequest({ xdomain: false });
    return null != xhr.responseType;
  })();

  /**
   * Polling interface.
   *
   * @param {Object} opts
   * @api private
   */

  function Polling(opts){
    var forceBase64 = (opts && opts.forceBase64);
    if (!hasXHR2 || forceBase64) {
      this.supportsBinary = false;
    }
    Transport.call(this, opts);
  }

  /**
   * Inherits from Transport.
   */

  inherit(Polling, Transport);

  /**
   * Transport name.
   */

  Polling.prototype.name = 'polling';

  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @api private
   */

  Polling.prototype.doOpen = function(){
    this.poll();
  };

  /**
   * Pauses polling.
   *
   * @param {Function} callback upon buffers are flushed and transport is paused
   * @api private
   */

  Polling.prototype.pause = function(onPause){
    var pending = 0;
    var self = this;

    this.readyState = 'pausing';

    function pause(){
      debug('paused');
      self.readyState = 'paused';
      onPause();
    }

    if (this.polling || !this.writable) {
      var total = 0;

      if (this.polling) {
        debug('we are currently polling - waiting to pause');
        total++;
        this.once('pollComplete', function(){
          debug('pre-pause polling complete');
          --total || pause();
        });
      }

      if (!this.writable) {
        debug('we are currently writing - waiting to pause');
        total++;
        this.once('drain', function(){
          debug('pre-pause writing complete');
          --total || pause();
        });
      }
    } else {
      pause();
    }
  };

  /**
   * Starts polling cycle.
   *
   * @api public
   */

  Polling.prototype.poll = function(){
    debug('polling');
    this.polling = true;
    this.doPoll();
    this.emit('poll');
  };

  /**
   * Overloads onData to detect payloads.
   *
   * @api private
   */

  Polling.prototype.onData = function(data){
    var self = this;
    debug('polling got data %s', data);
    var callback = function(packet, index, total) {
      // if its the first message we consider the transport open
      if ('opening' == self.readyState) {
        self.onOpen();
      }

      // if its a close packet, we close the ongoing requests
      if ('close' == packet.type) {
        self.onClose();
        return false;
      }

      // otherwise bypass onData and handle the message
      self.onPacket(packet);
    };

    // decode payload
    parser.decodePayload(data, this.socket.binaryType, callback);

    // if an event did not trigger closing
    if ('closed' != this.readyState) {
      // if we got data we're not polling
      this.polling = false;
      this.emit('pollComplete');

      if ('open' == this.readyState) {
        this.poll();
      } else {
        debug('ignoring poll - transport state "%s"', this.readyState);
      }
    }
  };

  /**
   * For polling, send a close packet.
   *
   * @api private
   */

  Polling.prototype.doClose = function(){
    var self = this;

    function close(){
      debug('writing close packet');
      self.write([{ type: 'close' }]);
    }

    if ('open' == this.readyState) {
      debug('transport open - closing');
      close();
    } else {
      // in case we're trying to close while
      // handshaking is in progress (GH-164)
      debug('transport not open - deferring close');
      this.once('open', close);
    }
  };

  /**
   * Writes a packets payload.
   *
   * @param {Array} data packets
   * @param {Function} drain callback
   * @api private
   */

  Polling.prototype.write = function(packets){
    var self = this;
    this.writable = false;
    var callbackfn = function() {
      self.writable = true;
      self.emit('drain');
    };

    var self = this;
    parser.encodePayload(packets, this.supportsBinary, function(data) {
      self.doWrite(data, callbackfn);
    });
  };

  /**
   * Generates uri for connection.
   *
   * @api private
   */

  Polling.prototype.uri = function(){
    var query = this.query || {};
    var schema = this.secure ? 'https' : 'http';
    var port = '';

    // cache busting is forced
    if (false !== this.timestampRequests) {
      query[this.timestampParam] = +new Date + '-' + Transport.timestamps++;
    }

    if (!this.supportsBinary && !query.sid) {
      query.b64 = 1;
    }

    query = parseqs.encode(query);

    // avoid port if default for schema
    if (this.port && (('https' == schema && this.port != 443) ||
      ('http' == schema && this.port != 80))) {
      port = ':' + this.port;
    }

    // prepend ? to query
    if (query.length) {
      query = '?' + query;
    }

    return schema + '://' + this.hostname + port + this.path + query;
  };

},{"../transport":14,"component-inherit":21,"debug":22,"engine.io-parser":25,"parseqs":33,"xmlhttprequest":20}],19:[function(_dereq_,module,exports){
  /**
   * Module dependencies.
   */

  var Transport = _dereq_('../transport');
  var parser = _dereq_('engine.io-parser');
  var parseqs = _dereq_('parseqs');
  var inherit = _dereq_('component-inherit');
  var debug = _dereq_('debug')('engine.io-client:websocket');

  /**
   * `ws` exposes a WebSocket-compatible interface in
   * Node, or the `WebSocket` or `MozWebSocket` globals
   * in the browser.
   */

  var WebSocket = _dereq_('ws');

  /**
   * Module exports.
   */

  module.exports = WS;

  /**
   * WebSocket transport constructor.
   *
   * @api {Object} connection options
   * @api public
   */

  function WS(opts){
    var forceBase64 = (opts && opts.forceBase64);
    if (forceBase64) {
      this.supportsBinary = false;
    }
    Transport.call(this, opts);
  }

  /**
   * Inherits from Transport.
   */

  inherit(WS, Transport);

  /**
   * Transport name.
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /*
   * WebSockets support binary
   */

  WS.prototype.supportsBinary = true;

  /**
   * Opens socket.
   *
   * @api private
   */

  WS.prototype.doOpen = function(){
    if (!this.check()) {
      // let probe timeout
      return;
    }

    var self = this;
    var uri = this.uri();
    var protocols = void(0);
    var opts = { agent: this.agent };

    // SSL options for Node.js client
    opts.pfx = this.pfx;
    opts.key = this.key;
    opts.passphrase = this.passphrase;
    opts.cert = this.cert;
    opts.ca = this.ca;
    opts.ciphers = this.ciphers;
    opts.rejectUnauthorized = this.rejectUnauthorized;

    this.ws = new WebSocket(uri, protocols, opts);

    if (this.ws.binaryType === undefined) {
      this.supportsBinary = false;
    }

    this.ws.binaryType = 'arraybuffer';
    this.addEventListeners();
  };

  /**
   * Adds event listeners to the socket
   *
   * @api private
   */

  WS.prototype.addEventListeners = function(){
    var self = this;

    this.ws.onopen = function(){
      self.onOpen();
    };
    this.ws.onclose = function(){
      self.onClose();
    };
    this.ws.onmessage = function(ev){
      self.onData(ev.data);
    };
    this.ws.onerror = function(e){
      self.onError('websocket error', e);
    };
  };

  /**
   * Override `onData` to use a timer on iOS.
   * See: https://gist.github.com/mloughran/2052006
   *
   * @api private
   */

  if ('undefined' != typeof navigator
    && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
    WS.prototype.onData = function(data){
      var self = this;
      setTimeout(function(){
        Transport.prototype.onData.call(self, data);
      }, 0);
    };
  }

  /**
   * Writes data to socket.
   *
   * @param {Array} array of packets.
   * @api private
   */

  WS.prototype.write = function(packets){
    var self = this;
    this.writable = false;
    // encodePacket efficient as it uses WS framing
    // no need for encodePayload
    for (var i = 0, l = packets.length; i < l; i++) {
      parser.encodePacket(packets[i], this.supportsBinary, function(data) {
        //Sometimes the websocket has already been closed but the browser didn't
        //have a chance of informing us about it yet, in that case send will
        //throw an error
        try {
          self.ws.send(data);
        } catch (e){
          debug('websocket closed before onclose event');
        }
      });
    }

    function ondrain() {
      self.writable = true;
      self.emit('drain');
    }
    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(ondrain, 0);
  };

  /**
   * Called upon close
   *
   * @api private
   */

  WS.prototype.onClose = function(){
    Transport.prototype.onClose.call(this);
  };

  /**
   * Closes socket.
   *
   * @api private
   */

  WS.prototype.doClose = function(){
    if (typeof this.ws !== 'undefined') {
      this.ws.close();
    }
  };

  /**
   * Generates uri for connection.
   *
   * @api private
   */

  WS.prototype.uri = function(){
    var query = this.query || {};
    var schema = this.secure ? 'wss' : 'ws';
    var port = '';

    // avoid port if default for schema
    if (this.port && (('wss' == schema && this.port != 443)
      || ('ws' == schema && this.port != 80))) {
      port = ':' + this.port;
    }

    // append timestamp to URI
    if (this.timestampRequests) {
      query[this.timestampParam] = +new Date;
    }

    // communicate binary support capabilities
    if (!this.supportsBinary) {
      query.b64 = 1;
    }

    query = parseqs.encode(query);

    // prepend ? to query
    if (query.length) {
      query = '?' + query;
    }

    return schema + '://' + this.hostname + port + this.path + query;
  };

  /**
   * Feature detection for WebSocket.
   *
   * @return {Boolean} whether this transport is available.
   * @api public
   */

  WS.prototype.check = function(){
    return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
  };

},{"../transport":14,"component-inherit":21,"debug":22,"engine.io-parser":25,"parseqs":33,"ws":35}],20:[function(_dereq_,module,exports){
// browser shim for xmlhttprequest module
  var hasCORS = _dereq_('has-cors');

  module.exports = function(opts) {
    var xdomain = opts.xdomain;

    // scheme must be same when usign XDomainRequest
    // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
    var xscheme = opts.xscheme;

    // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
    // https://github.com/Automattic/engine.io-client/pull/217
    var enablesXDR = opts.enablesXDR;

    // XMLHttpRequest can be disabled on IE
    try {
      if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
        return new XMLHttpRequest();
      }
    } catch (e) { }

    // Use XDomainRequest for IE8 if enablesXDR is true
    // because loading bar keeps flashing when using jsonp-polling
    // https://github.com/yujiosaka/socke.io-ie8-loading-example
    try {
      if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
        return new XDomainRequest();
      }
    } catch (e) { }

    if (!xdomain) {
      try {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } catch(e) { }
    }
  }

},{"has-cors":38}],21:[function(_dereq_,module,exports){

  module.exports = function(a, b){
    var fn = function(){};
    fn.prototype = b.prototype;
    a.prototype = new fn;
    a.prototype.constructor = a;
  };
},{}],22:[function(_dereq_,module,exports){

  /**
   * This is the web browser implementation of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = _dereq_('./debug');
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;

  /**
   * Colors.
   */

  exports.colors = [
    'lightseagreen',
    'forestgreen',
    'goldenrod',
    'dodgerblue',
    'darkorchid',
    'crimson'
  ];

  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  function useColors() {
    // is webkit? http://stackoverflow.com/a/16459606/376773
    return ('WebkitAppearance' in document.documentElement.style) ||
      // is firebug? http://stackoverflow.com/a/398120/376773
      (window.console && (console.firebug || (console.exception && console.table))) ||
      // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
  }

  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  exports.formatters.j = function(v) {
    return JSON.stringify(v);
  };


  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  function formatArgs() {
    var args = arguments;
    var useColors = this.useColors;

    args[0] = (useColors ? '%c' : '')
      + this.namespace
      + (useColors ? ' %c' : ' ')
      + args[0]
      + (useColors ? '%c ' : ' ')
      + '+' + exports.humanize(this.diff);

    if (!useColors) return args;

    var c = 'color: ' + this.color;
    args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

    // the final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    var index = 0;
    var lastC = 0;
    args[0].replace(/%[a-z%]/g, function(match) {
      if ('%' === match) return;
      index++;
      if ('%c' === match) {
        // we only are interested in the *last* %c
        // (the user may have provided their own)
        lastC = index;
      }
    });

    args.splice(lastC, 0, c);
    return args;
  }

  /**
   * Invokes `console.log()` when available.
   * No-op when `console.log` is not a "function".
   *
   * @api public
   */

  function log() {
    // This hackery is required for IE8,
    // where the `console.log` function doesn't have 'apply'
    return 'object' == typeof console
      && 'function' == typeof console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */

  function save(namespaces) {
    try {
      if (null == namespaces) {
        localStorage.removeItem('debug');
      } else {
        localStorage.debug = namespaces;
      }
    } catch(e) {}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */

  function load() {
    var r;
    try {
      r = localStorage.debug;
    } catch(e) {}
    return r;
  }

  /**
   * Enable namespaces listed in `localStorage.debug` initially.
   */

  exports.enable(load());

},{"./debug":23}],23:[function(_dereq_,module,exports){

  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   *
   * Expose `debug()` as the module.
   */

  exports = module.exports = debug;
  exports.coerce = coerce;
  exports.disable = disable;
  exports.enable = enable;
  exports.enabled = enabled;
  exports.humanize = _dereq_('ms');

  /**
   * The currently active debug mode names, and names to skip.
   */

  exports.names = [];
  exports.skips = [];

  /**
   * Map of special "%n" handling functions, for the debug "format" argument.
   *
   * Valid key names are a single, lowercased letter, i.e. "n".
   */

  exports.formatters = {};

  /**
   * Previously assigned color.
   */

  var prevColor = 0;

  /**
   * Previous log timestamp.
   */

  var prevTime;

  /**
   * Select a color.
   *
   * @return {Number}
   * @api private
   */

  function selectColor() {
    return exports.colors[prevColor++ % exports.colors.length];
  }

  /**
   * Create a debugger with the given `namespace`.
   *
   * @param {String} namespace
   * @return {Function}
   * @api public
   */

  function debug(namespace) {

    // define the `disabled` version
    function disabled() {
    }
    disabled.enabled = false;

    // define the `enabled` version
    function enabled() {

      var self = enabled;

      // set `diff` timestamp
      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;

      // add the `color` if not set
      if (null == self.useColors) self.useColors = exports.useColors();
      if (null == self.color && self.useColors) self.color = selectColor();

      var args = Array.prototype.slice.call(arguments);

      args[0] = exports.coerce(args[0]);

      if ('string' !== typeof args[0]) {
        // anything else let's inspect with %o
        args = ['%o'].concat(args);
      }

      // apply any `formatters` transformations
      var index = 0;
      args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
        // if we encounter an escaped % then don't increase the array index
        if (match === '%') return match;
        index++;
        var formatter = exports.formatters[format];
        if ('function' === typeof formatter) {
          var val = args[index];
          match = formatter.call(self, val);

          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      if ('function' === typeof exports.formatArgs) {
        args = exports.formatArgs.apply(self, args);
      }
      var logFn = enabled.log || exports.log || console.log.bind(console);
      logFn.apply(self, args);
    }
    enabled.enabled = true;

    var fn = exports.enabled(namespace) ? enabled : disabled;

    fn.namespace = namespace;

    return fn;
  }

  /**
   * Enables a debug mode by namespaces. This can include modes
   * separated by a colon and wildcards.
   *
   * @param {String} namespaces
   * @api public
   */

  function enable(namespaces) {
    exports.save(namespaces);

    var split = (namespaces || '').split(/[\s,]+/);
    var len = split.length;

    for (var i = 0; i < len; i++) {
      if (!split[i]) continue; // ignore empty strings
      namespaces = split[i].replace(/\*/g, '.*?');
      if (namespaces[0] === '-') {
        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        exports.names.push(new RegExp('^' + namespaces + '$'));
      }
    }
  }

  /**
   * Disable debug output.
   *
   * @api public
   */

  function disable() {
    exports.enable('');
  }

  /**
   * Returns true if the given mode name is enabled, false otherwise.
   *
   * @param {String} name
   * @return {Boolean}
   * @api public
   */

  function enabled(name) {
    var i, len;
    for (i = 0, len = exports.skips.length; i < len; i++) {
      if (exports.skips[i].test(name)) {
        return false;
      }
    }
    for (i = 0, len = exports.names.length; i < len; i++) {
      if (exports.names[i].test(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Coerce `val`.
   *
   * @param {Mixed} val
   * @return {Mixed}
   * @api private
   */

  function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
  }

},{"ms":24}],24:[function(_dereq_,module,exports){
  /**
   * Helpers.
   */

  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;

  /**
   * Parse or format the given `val`.
   *
   * Options:
   *
   *  - `long` verbose formatting [false]
   *
   * @param {String|Number} val
   * @param {Object} options
   * @return {String|Number}
   * @api public
   */

  module.exports = function(val, options){
    options = options || {};
    if ('string' == typeof val) return parse(val);
    return options.long
      ? long(val)
      : short(val);
  };

  /**
   * Parse the given `str` and return milliseconds.
   *
   * @param {String} str
   * @return {Number}
   * @api private
   */

  function parse(str) {
    var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
    if (!match) return;
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
      case 'years':
      case 'year':
      case 'y':
        return n * y;
      case 'days':
      case 'day':
      case 'd':
        return n * d;
      case 'hours':
      case 'hour':
      case 'h':
        return n * h;
      case 'minutes':
      case 'minute':
      case 'm':
        return n * m;
      case 'seconds':
      case 'second':
      case 's':
        return n * s;
      case 'ms':
        return n;
    }
  }

  /**
   * Short format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function short(ms) {
    if (ms >= d) return Math.round(ms / d) + 'd';
    if (ms >= h) return Math.round(ms / h) + 'h';
    if (ms >= m) return Math.round(ms / m) + 'm';
    if (ms >= s) return Math.round(ms / s) + 's';
    return ms + 'ms';
  }

  /**
   * Long format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function long(ms) {
    return plural(ms, d, 'day')
      || plural(ms, h, 'hour')
      || plural(ms, m, 'minute')
      || plural(ms, s, 'second')
      || ms + ' ms';
  }

  /**
   * Pluralization helper.
   */

  function plural(ms, n, name) {
    if (ms < n) return;
    if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
    return Math.ceil(ms / n) + ' ' + name + 's';
  }

},{}],25:[function(_dereq_,module,exports){
  (function (global){
    /**
     * Module dependencies.
     */

    var keys = _dereq_('./keys');
    var hasBinary = _dereq_('has-binary');
    var sliceBuffer = _dereq_('arraybuffer.slice');
    var base64encoder = _dereq_('base64-arraybuffer');
    var after = _dereq_('after');
    var utf8 = _dereq_('utf8');

    /**
     * Check if we are running an android browser. That requires us to use
     * ArrayBuffer with polling transports...
     *
     * http://ghinda.net/jpeg-blob-ajax-android/
     */

    var isAndroid = navigator.userAgent.match(/Android/i);

    /**
     * Check if we are running in PhantomJS.
     * Uploading a Blob with PhantomJS does not work correctly, as reported here:
     * https://github.com/ariya/phantomjs/issues/11395
     * @type boolean
     */
    var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);

    /**
     * When true, avoids using Blobs to encode payloads.
     * @type boolean
     */
    var dontSendBlobs = isAndroid || isPhantomJS;

    /**
     * Current protocol version.
     */

    exports.protocol = 3;

    /**
     * Packet types.
     */

    var packets = exports.packets = {
      open:     0    // non-ws
      , close:    1    // non-ws
      , ping:     2
      , pong:     3
      , message:  4
      , upgrade:  5
      , noop:     6
    };

    var packetslist = keys(packets);

    /**
     * Premade error packet.
     */

    var err = { type: 'error', data: 'parser error' };

    /**
     * Create a blob api even for blob builder when vendor prefixes exist
     */

    var Blob = _dereq_('blob');

    /**
     * Encodes a packet.
     *
     *     <packet type id> [ <data> ]
     *
     * Example:
     *
     *     5hello world
     *     3
     *     4
     *
     * Binary is encoded in an identical principle
     *
     * @api private
     */

    exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
      if ('function' == typeof supportsBinary) {
        callback = supportsBinary;
        supportsBinary = false;
      }

      if ('function' == typeof utf8encode) {
        callback = utf8encode;
        utf8encode = null;
      }

      var data = (packet.data === undefined)
        ? undefined
        : packet.data.buffer || packet.data;

      if (global.ArrayBuffer && data instanceof ArrayBuffer) {
        return encodeArrayBuffer(packet, supportsBinary, callback);
      } else if (Blob && data instanceof global.Blob) {
        return encodeBlob(packet, supportsBinary, callback);
      }

      // might be an object with { base64: true, data: dataAsBase64String }
      if (data && data.base64) {
        return encodeBase64Object(packet, callback);
      }

      // Sending data as a utf-8 string
      var encoded = packets[packet.type];

      // data fragment is optional
      if (undefined !== packet.data) {
        encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
      }

      return callback('' + encoded);

    };

    function encodeBase64Object(packet, callback) {
      // packet data is an object { base64: true, data: dataAsBase64String }
      var message = 'b' + exports.packets[packet.type] + packet.data.data;
      return callback(message);
    }

    /**
     * Encode packet helpers for binary types
     */

    function encodeArrayBuffer(packet, supportsBinary, callback) {
      if (!supportsBinary) {
        return exports.encodeBase64Packet(packet, callback);
      }

      var data = packet.data;
      var contentArray = new Uint8Array(data);
      var resultBuffer = new Uint8Array(1 + data.byteLength);

      resultBuffer[0] = packets[packet.type];
      for (var i = 0; i < contentArray.length; i++) {
        resultBuffer[i+1] = contentArray[i];
      }

      return callback(resultBuffer.buffer);
    }

    function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
      if (!supportsBinary) {
        return exports.encodeBase64Packet(packet, callback);
      }

      var fr = new FileReader();
      fr.onload = function() {
        packet.data = fr.result;
        exports.encodePacket(packet, supportsBinary, true, callback);
      };
      return fr.readAsArrayBuffer(packet.data);
    }

    function encodeBlob(packet, supportsBinary, callback) {
      if (!supportsBinary) {
        return exports.encodeBase64Packet(packet, callback);
      }

      if (dontSendBlobs) {
        return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
      }

      var length = new Uint8Array(1);
      length[0] = packets[packet.type];
      var blob = new Blob([length.buffer, packet.data]);

      return callback(blob);
    }

    /**
     * Encodes a packet with binary data in a base64 string
     *
     * @param {Object} packet, has `type` and `data`
     * @return {String} base64 encoded message
     */

    exports.encodeBase64Packet = function(packet, callback) {
      var message = 'b' + exports.packets[packet.type];
      if (Blob && packet.data instanceof Blob) {
        var fr = new FileReader();
        fr.onload = function() {
          var b64 = fr.result.split(',')[1];
          callback(message + b64);
        };
        return fr.readAsDataURL(packet.data);
      }

      var b64data;
      try {
        b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
      } catch (e) {
        // iPhone Safari doesn't let you apply with typed arrays
        var typed = new Uint8Array(packet.data);
        var basic = new Array(typed.length);
        for (var i = 0; i < typed.length; i++) {
          basic[i] = typed[i];
        }
        b64data = String.fromCharCode.apply(null, basic);
      }
      message += global.btoa(b64data);
      return callback(message);
    };

    /**
     * Decodes a packet. Changes format to Blob if requested.
     *
     * @return {Object} with `type` and `data` (if any)
     * @api private
     */

    exports.decodePacket = function (data, binaryType, utf8decode) {
      // String data
      if (typeof data == 'string' || data === undefined) {
        if (data.charAt(0) == 'b') {
          return exports.decodeBase64Packet(data.substr(1), binaryType);
        }

        if (utf8decode) {
          try {
            data = utf8.decode(data);
          } catch (e) {
            return err;
          }
        }
        var type = data.charAt(0);

        if (Number(type) != type || !packetslist[type]) {
          return err;
        }

        if (data.length > 1) {
          return { type: packetslist[type], data: data.substring(1) };
        } else {
          return { type: packetslist[type] };
        }
      }

      var asArray = new Uint8Array(data);
      var type = asArray[0];
      var rest = sliceBuffer(data, 1);
      if (Blob && binaryType === 'blob') {
        rest = new Blob([rest]);
      }
      return { type: packetslist[type], data: rest };
    };

    /**
     * Decodes a packet encoded in a base64 string
     *
     * @param {String} base64 encoded message
     * @return {Object} with `type` and `data` (if any)
     */

    exports.decodeBase64Packet = function(msg, binaryType) {
      var type = packetslist[msg.charAt(0)];
      if (!global.ArrayBuffer) {
        return { type: type, data: { base64: true, data: msg.substr(1) } };
      }

      var data = base64encoder.decode(msg.substr(1));

      if (binaryType === 'blob' && Blob) {
        data = new Blob([data]);
      }

      return { type: type, data: data };
    };

    /**
     * Encodes multiple messages (payload).
     *
     *     <length>:data
     *
     * Example:
     *
     *     11:hello world2:hi
     *
     * If any contents are binary, they will be encoded as base64 strings. Base64
     * encoded strings are marked with a b before the length specifier
     *
     * @param {Array} packets
     * @api private
     */

    exports.encodePayload = function (packets, supportsBinary, callback) {
      if (typeof supportsBinary == 'function') {
        callback = supportsBinary;
        supportsBinary = null;
      }

      var isBinary = hasBinary(packets);

      if (supportsBinary && isBinary) {
        if (Blob && !dontSendBlobs) {
          return exports.encodePayloadAsBlob(packets, callback);
        }

        return exports.encodePayloadAsArrayBuffer(packets, callback);
      }

      if (!packets.length) {
        return callback('0:');
      }

      function setLengthHeader(message) {
        return message.length + ':' + message;
      }

      function encodeOne(packet, doneCallback) {
        exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
          doneCallback(null, setLengthHeader(message));
        });
      }

      map(packets, encodeOne, function(err, results) {
        return callback(results.join(''));
      });
    };

    /**
     * Async array map using after
     */

    function map(ary, each, done) {
      var result = new Array(ary.length);
      var next = after(ary.length, done);

      var eachWithIndex = function(i, el, cb) {
        each(el, function(error, msg) {
          result[i] = msg;
          cb(error, result);
        });
      };

      for (var i = 0; i < ary.length; i++) {
        eachWithIndex(i, ary[i], next);
      }
    }

    /*
     * Decodes data when a payload is maybe expected. Possible binary contents are
     * decoded from their base64 representation
     *
     * @param {String} data, callback method
     * @api public
     */

    exports.decodePayload = function (data, binaryType, callback) {
      if (typeof data != 'string') {
        return exports.decodePayloadAsBinary(data, binaryType, callback);
      }

      if (typeof binaryType === 'function') {
        callback = binaryType;
        binaryType = null;
      }

      var packet;
      if (data == '') {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      var length = ''
        , n, msg;

      for (var i = 0, l = data.length; i < l; i++) {
        var chr = data.charAt(i);

        if (':' != chr) {
          length += chr;
        } else {
          if ('' == length || (length != (n = Number(length)))) {
            // parser error - ignoring payload
            return callback(err, 0, 1);
          }

          msg = data.substr(i + 1, n);

          if (length != msg.length) {
            // parser error - ignoring payload
            return callback(err, 0, 1);
          }

          if (msg.length) {
            packet = exports.decodePacket(msg, binaryType, true);

            if (err.type == packet.type && err.data == packet.data) {
              // parser error in individual packet - ignoring payload
              return callback(err, 0, 1);
            }

            var ret = callback(packet, i + n, l);
            if (false === ret) return;
          }

          // advance cursor
          i += n;
          length = '';
        }
      }

      if (length != '') {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

    };

    /**
     * Encodes multiple messages (payload) as binary.
     *
     * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
     * 255><data>
     *
     * Example:
     * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
     *
     * @param {Array} packets
     * @return {ArrayBuffer} encoded payload
     * @api private
     */

    exports.encodePayloadAsArrayBuffer = function(packets, callback) {
      if (!packets.length) {
        return callback(new ArrayBuffer(0));
      }

      function encodeOne(packet, doneCallback) {
        exports.encodePacket(packet, true, true, function(data) {
          return doneCallback(null, data);
        });
      }

      map(packets, encodeOne, function(err, encodedPackets) {
        var totalLength = encodedPackets.reduce(function(acc, p) {
          var len;
          if (typeof p === 'string'){
            len = p.length;
          } else {
            len = p.byteLength;
          }
          return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
        }, 0);

        var resultArray = new Uint8Array(totalLength);

        var bufferIndex = 0;
        encodedPackets.forEach(function(p) {
          var isString = typeof p === 'string';
          var ab = p;
          if (isString) {
            var view = new Uint8Array(p.length);
            for (var i = 0; i < p.length; i++) {
              view[i] = p.charCodeAt(i);
            }
            ab = view.buffer;
          }

          if (isString) { // not true binary
            resultArray[bufferIndex++] = 0;
          } else { // true binary
            resultArray[bufferIndex++] = 1;
          }

          var lenStr = ab.byteLength.toString();
          for (var i = 0; i < lenStr.length; i++) {
            resultArray[bufferIndex++] = parseInt(lenStr[i]);
          }
          resultArray[bufferIndex++] = 255;

          var view = new Uint8Array(ab);
          for (var i = 0; i < view.length; i++) {
            resultArray[bufferIndex++] = view[i];
          }
        });

        return callback(resultArray.buffer);
      });
    };

    /**
     * Encode as Blob
     */

    exports.encodePayloadAsBlob = function(packets, callback) {
      function encodeOne(packet, doneCallback) {
        exports.encodePacket(packet, true, true, function(encoded) {
          var binaryIdentifier = new Uint8Array(1);
          binaryIdentifier[0] = 1;
          if (typeof encoded === 'string') {
            var view = new Uint8Array(encoded.length);
            for (var i = 0; i < encoded.length; i++) {
              view[i] = encoded.charCodeAt(i);
            }
            encoded = view.buffer;
            binaryIdentifier[0] = 0;
          }

          var len = (encoded instanceof ArrayBuffer)
            ? encoded.byteLength
            : encoded.size;

          var lenStr = len.toString();
          var lengthAry = new Uint8Array(lenStr.length + 1);
          for (var i = 0; i < lenStr.length; i++) {
            lengthAry[i] = parseInt(lenStr[i]);
          }
          lengthAry[lenStr.length] = 255;

          if (Blob) {
            var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
            doneCallback(null, blob);
          }
        });
      }

      map(packets, encodeOne, function(err, results) {
        return callback(new Blob(results));
      });
    };

    /*
     * Decodes data when a payload is maybe expected. Strings are decoded by
     * interpreting each byte as a key code for entries marked to start with 0. See
     * description of encodePayloadAsBinary
     *
     * @param {ArrayBuffer} data, callback method
     * @api public
     */

    exports.decodePayloadAsBinary = function (data, binaryType, callback) {
      if (typeof binaryType === 'function') {
        callback = binaryType;
        binaryType = null;
      }

      var bufferTail = data;
      var buffers = [];

      var numberTooLong = false;
      while (bufferTail.byteLength > 0) {
        var tailArray = new Uint8Array(bufferTail);
        var isString = tailArray[0] === 0;
        var msgLength = '';

        for (var i = 1; ; i++) {
          if (tailArray[i] == 255) break;

          if (msgLength.length > 310) {
            numberTooLong = true;
            break;
          }

          msgLength += tailArray[i];
        }

        if(numberTooLong) return callback(err, 0, 1);

        bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
        msgLength = parseInt(msgLength);

        var msg = sliceBuffer(bufferTail, 0, msgLength);
        if (isString) {
          try {
            msg = String.fromCharCode.apply(null, new Uint8Array(msg));
          } catch (e) {
            // iPhone Safari doesn't let you apply to typed arrays
            var typed = new Uint8Array(msg);
            msg = '';
            for (var i = 0; i < typed.length; i++) {
              msg += String.fromCharCode(typed[i]);
            }
          }
        }

        buffers.push(msg);
        bufferTail = sliceBuffer(bufferTail, msgLength);
      }

      var total = buffers.length;
      buffers.forEach(function(buffer, i) {
        callback(exports.decodePacket(buffer, binaryType, true), i, total);
      });
    };

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":26,"after":27,"arraybuffer.slice":28,"base64-arraybuffer":29,"blob":30,"has-binary":36,"utf8":31}],26:[function(_dereq_,module,exports){

  /**
   * Gets the keys for an object.
   *
   * @return {Array} keys
   * @api private
   */

  module.exports = Object.keys || function keys (obj){
    var arr = [];
    var has = Object.prototype.hasOwnProperty;

    for (var i in obj) {
      if (has.call(obj, i)) {
        arr.push(i);
      }
    }
    return arr;
  };

},{}],27:[function(_dereq_,module,exports){
  module.exports = after

  function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
      if (proxy.count <= 0) {
        throw new Error('after called too many times')
      }
      --proxy.count

      // after first error, rest are passed to err_cb
      if (err) {
        bail = true
        callback(err)
        // future error callbacks will go to error handler
        callback = err_cb
      } else if (proxy.count === 0 && !bail) {
        callback(null, result)
      }
    }
  }

  function noop() {}

},{}],28:[function(_dereq_,module,exports){
  /**
   * An abstraction for slicing an arraybuffer even when
   * ArrayBuffer.prototype.slice is not supported
   *
   * @api public
   */

  module.exports = function(arraybuffer, start, end) {
    var bytes = arraybuffer.byteLength;
    start = start || 0;
    end = end || bytes;

    if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

    if (start < 0) { start += bytes; }
    if (end < 0) { end += bytes; }
    if (end > bytes) { end = bytes; }

    if (start >= bytes || start >= end || bytes === 0) {
      return new ArrayBuffer(0);
    }

    var abv = new Uint8Array(arraybuffer);
    var result = new Uint8Array(end - start);
    for (var i = start, ii = 0; i < end; i++, ii++) {
      result[ii] = abv[i];
    }
    return result.buffer;
  };

},{}],29:[function(_dereq_,module,exports){
  /*
   * base64-arraybuffer
   * https://github.com/niklasvh/base64-arraybuffer
   *
   * Copyright (c) 2012 Niklas von Hertzen
   * Licensed under the MIT license.
   */
  (function(chars){
    "use strict";

    exports.encode = function(arraybuffer) {
      var bytes = new Uint8Array(arraybuffer),
        i, len = bytes.length, base64 = "";

      for (i = 0; i < len; i+=3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
      }

      if ((len % 3) === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
      } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
      }

      return base64;
    };

    exports.decode =  function(base64) {
      var bufferLength = base64.length * 0.75,
        len = base64.length, i, p = 0,
        encoded1, encoded2, encoded3, encoded4;

      if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
          bufferLength--;
        }
      }

      var arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

      for (i = 0; i < len; i+=4) {
        encoded1 = chars.indexOf(base64[i]);
        encoded2 = chars.indexOf(base64[i+1]);
        encoded3 = chars.indexOf(base64[i+2]);
        encoded4 = chars.indexOf(base64[i+3]);

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
      }

      return arraybuffer;
    };
  })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");

},{}],30:[function(_dereq_,module,exports){
  (function (global){
    /**
     * Create a blob builder even when vendor prefixes exist
     */

    var BlobBuilder = global.BlobBuilder
      || global.WebKitBlobBuilder
      || global.MSBlobBuilder
      || global.MozBlobBuilder;

    /**
     * Check if Blob constructor is supported
     */

    var blobSupported = (function() {
      try {
        var b = new Blob(['hi']);
        return b.size == 2;
      } catch(e) {
        return false;
      }
    })();

    /**
     * Check if BlobBuilder is supported
     */

    var blobBuilderSupported = BlobBuilder
      && BlobBuilder.prototype.append
      && BlobBuilder.prototype.getBlob;

    function BlobBuilderConstructor(ary, options) {
      options = options || {};

      var bb = new BlobBuilder();
      for (var i = 0; i < ary.length; i++) {
        bb.append(ary[i]);
      }
      return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
    };

    module.exports = (function() {
      if (blobSupported) {
        return global.Blob;
      } else if (blobBuilderSupported) {
        return BlobBuilderConstructor;
      } else {
        return undefined;
      }
    })();

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],31:[function(_dereq_,module,exports){
  (function (global){
    /*! http://mths.be/utf8js v2.0.0 by @mathias */
    ;(function(root) {

      // Detect free variables `exports`
      var freeExports = typeof exports == 'object' && exports;

      // Detect free variable `module`
      var freeModule = typeof module == 'object' && module &&
        module.exports == freeExports && module;

      // Detect free variable `global`, from Node.js or Browserified code,
      // and use it as `root`
      var freeGlobal = typeof global == 'object' && global;
      if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        root = freeGlobal;
      }

      /*--------------------------------------------------------------------------*/

      var stringFromCharCode = String.fromCharCode;

      // Taken from http://mths.be/punycode
      function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;
        var value;
        var extra;
        while (counter < length) {
          value = string.charCodeAt(counter++);
          if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            // high surrogate, and there is a next character
            extra = string.charCodeAt(counter++);
            if ((extra & 0xFC00) == 0xDC00) { // low surrogate
              output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
            } else {
              // unmatched surrogate; only append this code unit, in case the next
              // code unit is the high surrogate of a surrogate pair
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }
        return output;
      }

      // Taken from http://mths.be/punycode
      function ucs2encode(array) {
        var length = array.length;
        var index = -1;
        var value;
        var output = '';
        while (++index < length) {
          value = array[index];
          if (value > 0xFFFF) {
            value -= 0x10000;
            output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
            value = 0xDC00 | value & 0x3FF;
          }
          output += stringFromCharCode(value);
        }
        return output;
      }

      /*--------------------------------------------------------------------------*/

      function createByte(codePoint, shift) {
        return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
      }

      function encodeCodePoint(codePoint) {
        if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
          return stringFromCharCode(codePoint);
        }
        var symbol = '';
        if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
          symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
        }
        else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
          symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
          symbol += createByte(codePoint, 6);
        }
        else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
          symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
          symbol += createByte(codePoint, 12);
          symbol += createByte(codePoint, 6);
        }
        symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
        return symbol;
      }

      function utf8encode(string) {
        var codePoints = ucs2decode(string);

        // console.log(JSON.stringify(codePoints.map(function(x) {
        // 	return 'U+' + x.toString(16).toUpperCase();
        // })));

        var length = codePoints.length;
        var index = -1;
        var codePoint;
        var byteString = '';
        while (++index < length) {
          codePoint = codePoints[index];
          byteString += encodeCodePoint(codePoint);
        }
        return byteString;
      }

      /*--------------------------------------------------------------------------*/

      function readContinuationByte() {
        if (byteIndex >= byteCount) {
          throw Error('Invalid byte index');
        }

        var continuationByte = byteArray[byteIndex] & 0xFF;
        byteIndex++;

        if ((continuationByte & 0xC0) == 0x80) {
          return continuationByte & 0x3F;
        }

        // If we end up here, it’s not a continuation byte
        throw Error('Invalid continuation byte');
      }

      function decodeSymbol() {
        var byte1;
        var byte2;
        var byte3;
        var byte4;
        var codePoint;

        if (byteIndex > byteCount) {
          throw Error('Invalid byte index');
        }

        if (byteIndex == byteCount) {
          return false;
        }

        // Read first byte
        byte1 = byteArray[byteIndex] & 0xFF;
        byteIndex++;

        // 1-byte sequence (no continuation bytes)
        if ((byte1 & 0x80) == 0) {
          return byte1;
        }

        // 2-byte sequence
        if ((byte1 & 0xE0) == 0xC0) {
          var byte2 = readContinuationByte();
          codePoint = ((byte1 & 0x1F) << 6) | byte2;
          if (codePoint >= 0x80) {
            return codePoint;
          } else {
            throw Error('Invalid continuation byte');
          }
        }

        // 3-byte sequence (may include unpaired surrogates)
        if ((byte1 & 0xF0) == 0xE0) {
          byte2 = readContinuationByte();
          byte3 = readContinuationByte();
          codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
          if (codePoint >= 0x0800) {
            return codePoint;
          } else {
            throw Error('Invalid continuation byte');
          }
        }

        // 4-byte sequence
        if ((byte1 & 0xF8) == 0xF0) {
          byte2 = readContinuationByte();
          byte3 = readContinuationByte();
          byte4 = readContinuationByte();
          codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
            (byte3 << 0x06) | byte4;
          if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
            return codePoint;
          }
        }

        throw Error('Invalid UTF-8 detected');
      }

      var byteArray;
      var byteCount;
      var byteIndex;
      function utf8decode(byteString) {
        byteArray = ucs2decode(byteString);
        byteCount = byteArray.length;
        byteIndex = 0;
        var codePoints = [];
        var tmp;
        while ((tmp = decodeSymbol()) !== false) {
          codePoints.push(tmp);
        }
        return ucs2encode(codePoints);
      }

      /*--------------------------------------------------------------------------*/

      var utf8 = {
        'version': '2.0.0',
        'encode': utf8encode,
        'decode': utf8decode
      };

      // Some AMD build optimizers, like r.js, check for specific condition patterns
      // like the following:
      if (
        typeof define == 'function' &&
          typeof define.amd == 'object' &&
          define.amd
        ) {
        define(function() {
          return utf8;
        });
      }	else if (freeExports && !freeExports.nodeType) {
        if (freeModule) { // in Node.js or RingoJS v0.8.0+
          freeModule.exports = utf8;
        } else { // in Narwhal or RingoJS v0.7.0-
          var object = {};
          var hasOwnProperty = object.hasOwnProperty;
          for (var key in utf8) {
            hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
          }
        }
      } else { // in Rhino or a web browser
        root.utf8 = utf8;
      }

    }(this));

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(_dereq_,module,exports){
  (function (global){
    /**
     * JSON parse.
     *
     * @see Based on jQuery#parseJSON (MIT) and JSON2
     * @api private
     */

    var rvalidchars = /^[\],:{}\s]*$/;
    var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
    var rtrimLeft = /^\s+/;
    var rtrimRight = /\s+$/;

    module.exports = function parsejson(data) {
      if ('string' != typeof data || !data) {
        return null;
      }

      data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

      // Attempt to parse using the native JSON parser first
      if (global.JSON && JSON.parse) {
        return JSON.parse(data);
      }

      if (rvalidchars.test(data.replace(rvalidescape, '@')
        .replace(rvalidtokens, ']')
        .replace(rvalidbraces, ''))) {
        return (new Function('return ' + data))();
      }
    };
  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(_dereq_,module,exports){
  /**
   * Compiles a querystring
   * Returns string representation of the object
   *
   * @param {Object}
   * @api private
   */

  exports.encode = function (obj) {
    var str = '';

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (str.length) str += '&';
        str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
      }
    }

    return str;
  };

  /**
   * Parses a simple querystring into an object
   *
   * @param {String} qs
   * @api private
   */

  exports.decode = function(qs){
    var qry = {};
    var pairs = qs.split('&');
    for (var i = 0, l = pairs.length; i < l; i++) {
      var pair = pairs[i].split('=');
      qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
  };

},{}],34:[function(_dereq_,module,exports){
  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api private
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
  ];

  module.exports = function parseuri(str) {
    var src = str,
      b = str.indexOf('['),
      e = str.indexOf(']');

    if (b != -1 && e != -1) {
      str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
      uri = {},
      i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
      uri.source = src;
      uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
      uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
      uri.ipv6uri = true;
    }

    return uri;
  };

},{}],35:[function(_dereq_,module,exports){

  /**
   * Module dependencies.
   */

  var global = (function() { return this; })();

  /**
   * WebSocket constructor.
   */

  var WebSocket = global.WebSocket || global.MozWebSocket;

  /**
   * Module exports.
   */

  module.exports = WebSocket ? ws : null;

  /**
   * WebSocket constructor.
   *
   * The third `opts` options object gets ignored in web browsers, since it's
   * non-standard, and throws a TypeError if passed to the constructor.
   * See: https://github.com/einaros/ws/issues/227
   *
   * @param {String} uri
   * @param {Array} protocols (optional)
   * @param {Object) opts (optional)
 * @api public
   */

  function ws(uri, protocols, opts) {
    var instance;
    if (protocols) {
      instance = new WebSocket(uri, protocols);
    } else {
      instance = new WebSocket(uri);
    }
    return instance;
  }

  if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],36:[function(_dereq_,module,exports){
  (function (global){

    /*
     * Module requirements.
     */

    var isArray = _dereq_('isarray');

    /**
     * Module exports.
     */

    module.exports = hasBinary;

    /**
     * Checks for binary data.
     *
     * Right now only Buffer and ArrayBuffer are supported..
     *
     * @param {Object} anything
     * @api public
     */

    function hasBinary(data) {

      function _hasBinary(obj) {
        if (!obj) return false;

        if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
          (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
          (global.Blob && obj instanceof Blob) ||
          (global.File && obj instanceof File)
          ) {
          return true;
        }

        if (isArray(obj)) {
          for (var i = 0; i < obj.length; i++) {
            if (_hasBinary(obj[i])) {
              return true;
            }
          }
        } else if (obj && 'object' == typeof obj) {
          if (obj.toJSON) {
            obj = obj.toJSON();
          }

          for (var key in obj) {
            if (obj.hasOwnProperty(key) && _hasBinary(obj[key])) {
              return true;
            }
          }
        }

        return false;
      }

      return _hasBinary(data);
    }

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":37}],37:[function(_dereq_,module,exports){
  module.exports = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };

},{}],38:[function(_dereq_,module,exports){

  /**
   * Module dependencies.
   */

  var global = _dereq_('global');

  /**
   * Module exports.
   *
   * Logic borrowed from Modernizr:
   *
   *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
   */

  try {
    module.exports = 'XMLHttpRequest' in global &&
      'withCredentials' in new global.XMLHttpRequest();
  } catch (err) {
    // if XMLHttp support is disabled in IE then it will throw
    // when trying to create
    module.exports = false;
  }

},{"global":39}],39:[function(_dereq_,module,exports){

  /**
   * Returns `this`. Execute this without a "context" (i.e. without it being
   * attached to an object of the left-hand side), and `this` points to the
   * "global" scope of the current JS execution.
   */

  module.exports = (function () { return this; })();

},{}],40:[function(_dereq_,module,exports){

  var indexOf = [].indexOf;

  module.exports = function(arr, obj){
    if (indexOf) return arr.indexOf(obj);
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === obj) return i;
    }
    return -1;
  };
},{}],41:[function(_dereq_,module,exports){

  /**
   * HOP ref.
   */

  var has = Object.prototype.hasOwnProperty;

  /**
   * Return own keys in `obj`.
   *
   * @param {Object} obj
   * @return {Array}
   * @api public
   */

  exports.keys = Object.keys || function(obj){
    var keys = [];
    for (var key in obj) {
      if (has.call(obj, key)) {
        keys.push(key);
      }
    }
    return keys;
  };

  /**
   * Return own values in `obj`.
   *
   * @param {Object} obj
   * @return {Array}
   * @api public
   */

  exports.values = function(obj){
    var vals = [];
    for (var key in obj) {
      if (has.call(obj, key)) {
        vals.push(obj[key]);
      }
    }
    return vals;
  };

  /**
   * Merge `b` into `a`.
   *
   * @param {Object} a
   * @param {Object} b
   * @return {Object} a
   * @api public
   */

  exports.merge = function(a, b){
    for (var key in b) {
      if (has.call(b, key)) {
        a[key] = b[key];
      }
    }
    return a;
  };

  /**
   * Return length of `obj`.
   *
   * @param {Object} obj
   * @return {Number}
   * @api public
   */

  exports.length = function(obj){
    return exports.keys(obj).length;
  };

  /**
   * Check if `obj` is empty.
   *
   * @param {Object} obj
   * @return {Boolean}
   * @api public
   */

  exports.isEmpty = function(obj){
    return 0 == exports.length(obj);
  };
},{}],42:[function(_dereq_,module,exports){
  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api private
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host'
    , 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
  ];

  module.exports = function parseuri(str) {
    var m = re.exec(str || '')
      , uri = {}
      , i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    return uri;
  };

},{}],43:[function(_dereq_,module,exports){
  (function (global){
    /*global Blob,File*/

    /**
     * Module requirements
     */

    var isArray = _dereq_('isarray');
    var isBuf = _dereq_('./is-buffer');

    /**
     * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
     * Anything with blobs or files should be fed through removeBlobs before coming
     * here.
     *
     * @param {Object} packet - socket.io event packet
     * @return {Object} with deconstructed packet and list of buffers
     * @api public
     */

    exports.deconstructPacket = function(packet){
      var buffers = [];
      var packetData = packet.data;

      function _deconstructPacket(data) {
        if (!data) return data;

        if (isBuf(data)) {
          var placeholder = { _placeholder: true, num: buffers.length };
          buffers.push(data);
          return placeholder;
        } else if (isArray(data)) {
          var newData = new Array(data.length);
          for (var i = 0; i < data.length; i++) {
            newData[i] = _deconstructPacket(data[i]);
          }
          return newData;
        } else if ('object' == typeof data && !(data instanceof Date)) {
          var newData = {};
          for (var key in data) {
            newData[key] = _deconstructPacket(data[key]);
          }
          return newData;
        }
        return data;
      }

      var pack = packet;
      pack.data = _deconstructPacket(packetData);
      pack.attachments = buffers.length; // number of binary 'attachments'
      return {packet: pack, buffers: buffers};
    };

    /**
     * Reconstructs a binary packet from its placeholder packet and buffers
     *
     * @param {Object} packet - event packet with placeholders
     * @param {Array} buffers - binary buffers to put in placeholder positions
     * @return {Object} reconstructed packet
     * @api public
     */

    exports.reconstructPacket = function(packet, buffers) {
      var curPlaceHolder = 0;

      function _reconstructPacket(data) {
        if (data && data._placeholder) {
          var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
          return buf;
        } else if (isArray(data)) {
          for (var i = 0; i < data.length; i++) {
            data[i] = _reconstructPacket(data[i]);
          }
          return data;
        } else if (data && 'object' == typeof data) {
          for (var key in data) {
            data[key] = _reconstructPacket(data[key]);
          }
          return data;
        }
        return data;
      }

      packet.data = _reconstructPacket(packet.data);
      packet.attachments = undefined; // no longer useful
      return packet;
    };

    /**
     * Asynchronously removes Blobs or Files from data via
     * FileReader's readAsArrayBuffer method. Used before encoding
     * data as msgpack. Calls callback with the blobless data.
     *
     * @param {Object} data
     * @param {Function} callback
     * @api private
     */

    exports.removeBlobs = function(data, callback) {
      function _removeBlobs(obj, curKey, containingObject) {
        if (!obj) return obj;

        // convert any blob
        if ((global.Blob && obj instanceof Blob) ||
          (global.File && obj instanceof File)) {
          pendingBlobs++;

          // async filereader
          var fileReader = new FileReader();
          fileReader.onload = function() { // this.result == arraybuffer
            if (containingObject) {
              containingObject[curKey] = this.result;
            }
            else {
              bloblessData = this.result;
            }

            // if nothing pending its callback time
            if(! --pendingBlobs) {
              callback(bloblessData);
            }
          };

          fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
        } else if (isArray(obj)) { // handle array
          for (var i = 0; i < obj.length; i++) {
            _removeBlobs(obj[i], i, obj);
          }
        } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
          for (var key in obj) {
            _removeBlobs(obj[key], key, obj);
          }
        }
      }

      var pendingBlobs = 0;
      var bloblessData = data;
      _removeBlobs(bloblessData);
      if (!pendingBlobs) {
        callback(bloblessData);
      }
    };

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-buffer":45,"isarray":46}],44:[function(_dereq_,module,exports){

  /**
   * Module dependencies.
   */

  var debug = _dereq_('debug')('socket.io-parser');
  var json = _dereq_('json3');
  var isArray = _dereq_('isarray');
  var Emitter = _dereq_('component-emitter');
  var binary = _dereq_('./binary');
  var isBuf = _dereq_('./is-buffer');

  /**
   * Protocol version.
   *
   * @api public
   */

  exports.protocol = 4;

  /**
   * Packet types.
   *
   * @api public
   */

  exports.types = [
    'CONNECT',
    'DISCONNECT',
    'EVENT',
    'BINARY_EVENT',
    'ACK',
    'BINARY_ACK',
    'ERROR'
  ];

  /**
   * Packet type `connect`.
   *
   * @api public
   */

  exports.CONNECT = 0;

  /**
   * Packet type `disconnect`.
   *
   * @api public
   */

  exports.DISCONNECT = 1;

  /**
   * Packet type `event`.
   *
   * @api public
   */

  exports.EVENT = 2;

  /**
   * Packet type `ack`.
   *
   * @api public
   */

  exports.ACK = 3;

  /**
   * Packet type `error`.
   *
   * @api public
   */

  exports.ERROR = 4;

  /**
   * Packet type 'binary event'
   *
   * @api public
   */

  exports.BINARY_EVENT = 5;

  /**
   * Packet type `binary ack`. For acks with binary arguments.
   *
   * @api public
   */

  exports.BINARY_ACK = 6;

  /**
   * Encoder constructor.
   *
   * @api public
   */

  exports.Encoder = Encoder;

  /**
   * Decoder constructor.
   *
   * @api public
   */

  exports.Decoder = Decoder;

  /**
   * A socket.io Encoder instance
   *
   * @api public
   */

  function Encoder() {}

  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   * @param {Function} callback - function to handle encodings (likely engine.write)
   * @return Calls callback with Array of encodings
   * @api public
   */

  Encoder.prototype.encode = function(obj, callback){
    debug('encoding packet %j', obj);

    if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
      encodeAsBinary(obj, callback);
    }
    else {
      var encoding = encodeAsString(obj);
      callback([encoding]);
    }
  };

  /**
   * Encode packet as string.
   *
   * @param {Object} packet
   * @return {String} encoded
   * @api private
   */

  function encodeAsString(obj) {
    var str = '';
    var nsp = false;

    // first is type
    str += obj.type;

    // attachments if we have them
    if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
      str += obj.attachments;
      str += '-';
    }

    // if we have a namespace other than `/`
    // we append it followed by a comma `,`
    if (obj.nsp && '/' != obj.nsp) {
      nsp = true;
      str += obj.nsp;
    }

    // immediately followed by the id
    if (null != obj.id) {
      if (nsp) {
        str += ',';
        nsp = false;
      }
      str += obj.id;
    }

    // json data
    if (null != obj.data) {
      if (nsp) str += ',';
      str += json.stringify(obj.data);
    }

    debug('encoded %j as %s', obj, str);
    return str;
  }

  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   *
   * @param {Object} packet
   * @return {Buffer} encoded
   * @api private
   */

  function encodeAsBinary(obj, callback) {

    function writeEncoding(bloblessData) {
      var deconstruction = binary.deconstructPacket(bloblessData);
      var pack = encodeAsString(deconstruction.packet);
      var buffers = deconstruction.buffers;

      buffers.unshift(pack); // add packet info to beginning of data list
      callback(buffers); // write all the buffers
    }

    binary.removeBlobs(obj, writeEncoding);
  }

  /**
   * A socket.io Decoder instance
   *
   * @return {Object} decoder
   * @api public
   */

  function Decoder() {
    this.reconstructor = null;
  }

  /**
   * Mix in `Emitter` with Decoder.
   */

  Emitter(Decoder.prototype);

  /**
   * Decodes an ecoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   * @return {Object} packet
   * @api public
   */

  Decoder.prototype.add = function(obj) {
    var packet;
    if ('string' == typeof obj) {
      packet = decodeString(obj);
      if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
        this.reconstructor = new BinaryReconstructor(packet);

        // no attachments, labeled binary but no binary data to follow
        if (this.reconstructor.reconPack.attachments == 0) {
          this.emit('decoded', packet);
        }
      } else { // non-binary full packet
        this.emit('decoded', packet);
      }
    }
    else if (isBuf(obj) || obj.base64) { // raw binary data
      if (!this.reconstructor) {
        throw new Error('got binary data when not reconstructing a packet');
      } else {
        packet = this.reconstructor.takeBinaryData(obj);
        if (packet) { // received final buffer
          this.reconstructor = null;
          this.emit('decoded', packet);
        }
      }
    }
    else {
      throw new Error('Unknown type: ' + obj);
    }
  };

  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   * @api private
   */

  function decodeString(str) {
    var p = {};
    var i = 0;

    // look up type
    p.type = Number(str.charAt(0));
    if (null == exports.types[p.type]) return error();

    // look up attachments if type binary
    if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
      p.attachments = '';
      while (str.charAt(++i) != '-') {
        p.attachments += str.charAt(i);
      }
      p.attachments = Number(p.attachments);
    }

    // look up namespace (if any)
    if ('/' == str.charAt(i + 1)) {
      p.nsp = '';
      while (++i) {
        var c = str.charAt(i);
        if (',' == c) break;
        p.nsp += c;
        if (i + 1 == str.length) break;
      }
    } else {
      p.nsp = '/';
    }

    // look up id
    var next = str.charAt(i + 1);
    if ('' != next && Number(next) == next) {
      p.id = '';
      while (++i) {
        var c = str.charAt(i);
        if (null == c || Number(c) != c) {
          --i;
          break;
        }
        p.id += str.charAt(i);
        if (i + 1 == str.length) break;
      }
      p.id = Number(p.id);
    }

    // look up json data
    if (str.charAt(++i)) {
      try {
        p.data = json.parse(str.substr(i));
      } catch(e){
        return error();
      }
    }

    debug('decoded %s as %j', str, p);
    return p;
  }

  /**
   * Deallocates a parser's resources
   *
   * @api public
   */

  Decoder.prototype.destroy = function() {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
    }
  };

  /**
   * A manager of a binary event's 'buffer sequence'. Should
   * be constructed whenever a packet of type BINARY_EVENT is
   * decoded.
   *
   * @param {Object} packet
   * @return {BinaryReconstructor} initialized reconstructor
   * @api private
   */

  function BinaryReconstructor(packet) {
    this.reconPack = packet;
    this.buffers = [];
  }

  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   * @api private
   */

  BinaryReconstructor.prototype.takeBinaryData = function(binData) {
    this.buffers.push(binData);
    if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
      var packet = binary.reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }
    return null;
  };

  /**
   * Cleans up binary packet reconstruction variables.
   *
   * @api private
   */

  BinaryReconstructor.prototype.finishedReconstruction = function() {
    this.reconPack = null;
    this.buffers = [];
  };

  function error(data){
    return {
      type: exports.ERROR,
      data: 'parser error'
    };
  }

},{"./binary":43,"./is-buffer":45,"component-emitter":9,"debug":10,"isarray":46,"json3":47}],45:[function(_dereq_,module,exports){
  (function (global){

    module.exports = isBuf;

    /**
     * Returns true if obj is a buffer or an arraybuffer.
     *
     * @api private
     */

    function isBuf(obj) {
      return (global.Buffer && global.Buffer.isBuffer(obj)) ||
        (global.ArrayBuffer && obj instanceof ArrayBuffer);
    }

  }).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],46:[function(_dereq_,module,exports){
  module.exports=_dereq_(37)
},{}],47:[function(_dereq_,module,exports){
  /*! JSON v3.2.6 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
  ;(function (window) {
    // Convenience aliases.
    var getClass = {}.toString, isProperty, forEach, undef;

    // Detect the `define` function exposed by asynchronous module loaders. The
    // strict `define` check is necessary for compatibility with `r.js`.
    var isLoader = typeof define === "function" && define.amd;

    // Detect native implementations.
    var nativeJSON = typeof JSON == "object" && JSON;

    // Set up the JSON 3 namespace, preferring the CommonJS `exports` object if
    // available.
    var JSON3 = typeof exports == "object" && exports && !exports.nodeType && exports;

    if (JSON3 && nativeJSON) {
      // Explicitly delegate to the native `stringify` and `parse`
      // implementations in CommonJS environments.
      JSON3.stringify = nativeJSON.stringify;
      JSON3.parse = nativeJSON.parse;
    } else {
      // Export for web browsers, JavaScript engines, and asynchronous module
      // loaders, using the global `JSON` object if available.
      JSON3 = window.JSON = nativeJSON || {};
    }

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }

      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                  // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                  // literals.
                  stringify(new Number()) === "0" &&
                  stringify(new String()) == '""' &&
                  // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                  // does not define a canonical JSON representation (this applies to
                  // objects with `toJSON` properties as well, *unless* they are nested
                  // within an object or array).
                  stringify(getClass) === undef &&
                  // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                  // FF 3.1b3 pass this test.
                  stringify(undef) === undef &&
                  // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                  // respectively, if the value is omitted entirely.
                  stringify() === undef &&
                  // FF 3.1b1, 2 throw an error if the given value is not a number,
                  // string, array, object, Boolean, or `null` literal. This applies to
                  // objects with custom `toJSON` methods as well, unless they are nested
                  // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                  // methods entirely.
                  stringify(value) === "1" &&
                  stringify([value]) == "[1]" &&
                  // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                  // `"[null]"`.
                  stringify([undef]) == "[null]" &&
                  // YUI 3.0.0b1 fails to serialize `null` literals.
                  stringify(null) == "null" &&
                  // FF 3.1b1, 2 halts serialization if an array contains a function:
                  // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                  // elides non-JSON values from objects and arrays, unless they
                  // define custom `toJSON` methods.
                  stringify([undef, getClass, null]) == "[null,null,null]" &&
                  // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                  // where character escape codes are expected (e.g., `\b` => `\u0008`).
                  stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                  // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                  stringify(null, value) === "1" &&
                  stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                  // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                  // serialize extended years.
                  stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                  // The milliseconds are optional in ES 5, but required in 5.1.
                  stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                  // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                  // four-digit years instead of six-digit years. Credits: @Yaffle.
                  stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                  // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                  // values less than 1000. Credits: @Yaffle.
                  stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = JSON3.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]";
      var dateClass = "[object Date]";
      var numberClass = "[object Number]";
      var stringClass = "[object String]";
      var arrayClass = "[object Array]";
      var booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = {}.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: A set of primitive types used by `isHostType`.
      var PrimitiveTypes = {
        'boolean': 1,
        'number': 1,
        'string': 1,
        'undefined': 1
      };

      // Internal: Determines if the given object `property` value is a
      // non-primitive.
      var isHostType = function (object, property) {
        var type = typeof object[property];
        return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
      };

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, isLarge = length > 10 && charIndexBuggy, symbols;
          if (isLarge) {
            symbols = value.split("");
          }
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
              result += Escapes[charCode];
              break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += isLarge ? symbols[index] : charIndexBuggy ? value.charAt(index) : value[index];
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        JSON3.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (typeof filter == "function" || typeof filter == "object" && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function() {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
              // Skip whitespace tokens, including tabs, carriage returns, line
              // feeds, and space characters.
              Index++;
              break;
              case 123: case 125: case 91: case 93: case 58: case 44:
              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
              // the current position.
              value = charIndexBuggy ? source.charAt(Index) : source[Index];
              Index++;
              return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                      // Revive escaped control characters.
                      value += Unescapes[charCode];
                      Index++;
                      break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function(source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        JSON3.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    // Export for asynchronous module loaders.
    if (isLoader) {
      define(function () {
        return JSON3;
      });
    }
  }(this));

},{}],48:[function(_dereq_,module,exports){
  module.exports = toArray

  function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
      array[i - index] = list[i]
    }

    return array
  }

},{}]},{},[1])
  (1)
});

(function(exporter) {

  /**
   * socket.io guaranteed delivery socket wrapper.
   * if the socket gets disconnected at any point, it's up to the application to set a new socket to continue
   * handling messages.
   * calling 'setSocket' causes all messages that have not received an ack to be sent again.
   * @constructor
   */
  function SocketGD(socket, lastAcked) {
    this._pending = [];
    this._events = {};
    this._id = 0;
    this._enabled = true;
    this._onAckCB = SocketGD.prototype._onAck.bind(this);
    this._onReconnectCB = SocketGD.prototype._onReconnect.bind(this);
    this.setLastAcked(lastAcked);
    this.setSocket(socket);
  }

  /**
   * set the last message id that an ack was sent for
   * @param lastAcked
   */
  SocketGD.prototype.setLastAcked = function(lastAcked) {
    this._lastAcked = lastAcked || -1;
  };

  /**
   * get the last acked message id
   */
  SocketGD.prototype.lastAcked = function() {
    return this._lastAcked;
  };

  /**
   * replace the underlying socket.io socket with a new socket. useful in case of a socket getting
   * disconnected and a new socket is used to continue with the communications
   * @param socket
   */
  SocketGD.prototype.setSocket = function(socket) {

    this._cleanup();
    this._socket = socket;

    if (this._socket) {
      this._socket.on('reconnect', this._onReconnectCB);
      this._socket.on('socketgd_ack', this._onAckCB);

      this.sendPending();
    }
  };

  /**
   * send all pending messages that have not received an ack
   */
  SocketGD.prototype.sendPending = function() {
    var _this = this;
    // send all pending messages that haven't been acked yet
    this._pending.forEach(function(message) {
      _this._sendOnSocket(message);
    });
  };

  /**
   * clear out any pending messages
   */
  SocketGD.prototype.clearPending = function() {
    this._pending = [];
  };

  /**
   * enable or disable sending message with gd. if disabled, then messages will be sent without guaranteeing delivery
   * in case of socket disconnection/reconnection.
   */
  SocketGD.prototype.enable = function(enabled) {
    this._enabled = enabled;
  };

  /**
   * get the underlying socket
   */
  SocketGD.prototype.socket = function() {
    return this._socket;
  };

  /**
   * cleanup socket stuff
   * @private
   */
  SocketGD.prototype._cleanup = function() {
    if (!this._socket) {
      return;
    }

    this._socket.removeListener('reconnect', this._onReconnectCB);
    this._socket.removeListener('socketgd_ack', this._onAckCB);
  };

  /**
   * invoked when an ack arrives
   * @param ack
   * @private
   */
  SocketGD.prototype._onAck = function(ack) {
    // got an ack for a message, remove all messages pending an ack up to (and including) the acked message.
    while (this._pending.length > 0 && this._pending[0].id <= ack.id) {
      if (this._pending[0].id === ack.id && this._pending[0].ack) {
        this._pending[0].ack.call(null, ack.data);
      }
      this._pending.shift();
    }
  };

  /**
   * invoked when an a reconnect event occurs on the underlying socket
   * @private
   */
  SocketGD.prototype._onReconnect = function() {
    this.sendPending();
  };

  /**
   * send an ack for a message
   * @private
   */
  SocketGD.prototype._sendAck = function(id, data) {
    if (!this._socket) {
      return;
    }

    this._lastAcked = id;
    this._socket.emit('socketgd_ack', {id: id, data: data});
    return this._lastAcked;
  };

  /**
   * send a message on the underlying socket.io socket
   * @param message
   * @private
   */
  SocketGD.prototype._sendOnSocket = function(message) {
    if (this._enabled && message.id === undefined) {
      message.id = this._id++;
      message.gd = true;
      this._pending.push(message);
    }

    if (!this._socket) {
      return;
    }

    if (this._enabled) {
      switch (message.type) {
        case 'send':
          this._socket.send('socketgd:' + message.id + ':' + message.msg);
          break;
        case 'emit':
          this._socket.emit(message.event, {socketgd: message.id, msg: message.msg});
          break;
      }
    } else {
      switch (message.type) {
        case 'send':
          this._socket.send(message.msg, message.ack);
          break;
        case 'emit':
          this._socket.emit(message.event, message.msg, message.ack);
          break;
      }
    }
  };

  /**
   * send a message with gd. this means that if an ack is not received and a new connection is established (by
   * calling setSocket), the message will be sent again.
   * @param message
   * @param ack
   */
  SocketGD.prototype.send = function(message, ack) {
    this._sendOnSocket({type: 'send', msg: message, ack: ack});
  };

  /**
   * emit an event with gd. this means that if an ack is not received and a new connection is established (by
   * calling setSocket), the event will be emitted again.
   * @param event
   * @param message
   * @param ack
   */
  SocketGD.prototype.emit = function(event, message, ack) {
    this._sendOnSocket({type: 'emit', event: event, msg: message, ack: ack});
  };

  /**
   * disconnect the socket
   */
  SocketGD.prototype.disconnect = function() {
    this._socket && this._socket.disconnect();
    this._cleanup();
    this._socket = null;
  };

  /**
   * disconnectSync the socket
   */
  SocketGD.prototype.disconnectSync = function() {
    this._socket && this._socket.disconnectSync();
    this._cleanup();
    this._socket = null;
  };

  /**
   * close the socket
   */
  SocketGD.prototype.close = function() {
    this._socket && this._socket.close();
    this._cleanup();
    this._socket = null;
  };

  /**
   * listen for events on the socket. this replaces calling the 'on' method directly on the socket.io socket.
   * here we take care of acking messages.
   * @param event
   * @param cb
   */
  SocketGD.prototype.on = function(event, cb) {
    this._events[event] = this._events[event] || [];

    var _this = this;
    var cbData = {
      cb: cb,
      wrapped: function(data, ack) {
        if (data && event === 'message') {
          // parse the message
          if (data.indexOf('socketgd:') !== 0) {
            cb(data, ack);
            return;
          }
          // get the id (skipping the socketgd prefix)
          var index = data.indexOf(':', 9);
          if (index === -1) {
            cb(data, ack);
            return;
          }

          var id = parseInt(data.substring(9, index));
          if (id <= _this._lastAcked) {
            // discard the message since it was already handled and acked
            return;
          }

          var message = data.substring(index + 1);
          // the callback must call the 'ack' function so we can send an ack for the message
          cb && cb(message, function(ackData) {
            return _this._sendAck(id, ackData);
          }, id);
        } else if (data && typeof data === 'object' && data.socketgd !== undefined) {
          if (data.socketgd <= _this._lastAcked) {
            // discard the message since it was already handled and acked
            return;
          }
          cb && cb(data.msg, function(ackData) {
            return _this._sendAck(data.socketgd, ackData);
          }, data.socketgd);
        } else {
          cb(data, ack);
        }
      }
    };

    this._events[event].push(cbData);

    this._socket.on(event, cbData.wrapped);
  };

  /**
   * remove a previously set callback for the specified event
   */
  SocketGD.prototype.off =
      SocketGD.prototype.removeListener = function(event, cb) {
        if (!this._events[event]) {
          return;
        }

        // find the callback to remove
        for (var i = 0; i < this._events[event].length; ++i) {
          if (this._events[event][i].cb === cb) {
            this._socket && this._socket.removeListener(event, this._events[event][i].wrapped);
            this._events[event].splice(i, 1);
          }
        }
      };

  exporter.SocketGD = SocketGD;

})(typeof module !== 'undefined' && typeof module.exports === 'object' ? module.exports : window);

(function (global, factory) {
    if (typeof define === "function" && define.amd) define(factory);
    else if (typeof module === "object") module.exports = factory();
    else global.augment = factory();
}(this, function () {
    "use strict";

    var Factory = function () {};
    var slice = Array.prototype.slice;

    var augment = function (base, body) {
        var uber = Factory.prototype = typeof base === "function" ? base.prototype : base;
        var prototype = new Factory, properties = body.apply(prototype, slice.call(arguments, 2).concat(uber));
        if (typeof properties === "object") for (var key in properties) prototype[key] = properties[key];
        if (!prototype.hasOwnProperty("constructor")) return prototype;
        var constructor = prototype.constructor;
        constructor.prototype = prototype;
        return constructor;
    };

    augment.defclass = function (prototype) {
        var constructor = prototype.constructor;
        constructor.prototype = prototype;
        return constructor;
    };

    augment.extend = function (base, body) {
        return augment(base, function (uber) {
            this.uber = uber;
            return body;
        });
    };

    return augment;
}));
;(function(exports) {

// export the class if we are in a Node-like system.
if (typeof module === 'object' && module.exports === exports)
  exports = module.exports = SemVer;

// The debug function is excluded entirely from the minified version.

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:(' + src[PRERELEASE] + ')' +
                   ')?)?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:(' + src[PRERELEASELOOSE] + ')' +
                        ')?)?)?';

// >=2.x, for example, means >=2.0.0-0
// <1.x would be the same as "<1.0.0-0", though.
var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';


// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  ;
  if (!re[i])
    re[i] = new RegExp(src[i]);
}

exports.parse = parse;
function parse(version, loose) {
  var r = loose ? re[LOOSE] : re[FULL];
  return (r.test(version)) ? new SemVer(version, loose) : null;
}

exports.valid = valid;
function valid(version, loose) {
  var v = parse(version, loose);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, loose) {
  var s = parse(version, loose);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, loose) {
  if (version instanceof SemVer) {
    if (version.loose === loose)
      return version;
    else
      version = version.version;
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (!(this instanceof SemVer))
    return new SemVer(version, loose);

  ;
  this.loose = loose;
  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

  if (!m)
    throw new TypeError('Invalid Version: ' + version);

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  // numberify any prerelease numeric ids
  if (!m[4])
    this.prerelease = [];
  else
    this.prerelease = m[4].split('.').map(function(id) {
      return (/^[0-9]+$/.test(id)) ? +id : id;
    });

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function() {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length)
    this.version += '-' + this.prerelease.join('.');
  return this.version;
};

SemVer.prototype.inspect = function() {
  return '<SemVer "' + this + '">';
};

SemVer.prototype.toString = function() {
  return this.version;
};

SemVer.prototype.compare = function(other) {
  ;
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length)
    return -1;
  else if (!this.prerelease.length && other.prerelease.length)
    return 1;
  else if (!this.prerelease.length && !other.prerelease.length)
    return 0;

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    ;
    if (a === undefined && b === undefined)
      return 0;
    else if (b === undefined)
      return 1;
    else if (a === undefined)
      return -1;
    else if (a === b)
      continue;
    else
      return compareIdentifiers(a, b);
  } while (++i);
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function(release) {
  switch (release) {
    case 'premajor':
      this.inc('major');
      this.inc('pre');
      break;
    case 'preminor':
      this.inc('minor');
      this.inc('pre');
      break;
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0
      this.inc('patch');
      this.inc('pre');
      break;
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0)
        this.inc('patch');
      this.inc('pre');
      break;
    case 'major':
      this.major++;
      this.minor = -1;
    case 'minor':
      this.minor++;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0)
        this.patch++;
      this.prerelease = [];
      break;
    // This probably shouldn't be used publically.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0)
        this.prerelease = [0];
      else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) // didn't increment anything
          this.prerelease.push(0);
      }
      break;

    default:
      throw new Error('invalid increment argument: ' + release);
  }
  this.format();
  return this;
};

exports.inc = inc;
function inc(version, release, loose) {
  try {
    return new SemVer(version, loose).inc(release).version;
  } catch (er) {
    return null;
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return (anum && !bnum) ? -1 :
         (bnum && !anum) ? 1 :
         a < b ? -1 :
         a > b ? 1 :
         0;
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers(a, b) {
  return compareIdentifiers(b, a);
}

exports.compare = compare;
function compare(a, b, loose) {
  return new SemVer(a, loose).compare(b);
}

exports.compareLoose = compareLoose;
function compareLoose(a, b) {
  return compare(a, b, true);
}

exports.rcompare = rcompare;
function rcompare(a, b, loose) {
  return compare(b, a, loose);
}

exports.sort = sort;
function sort(list, loose) {
  return list.sort(function(a, b) {
    return exports.compare(a, b, loose);
  });
}

exports.rsort = rsort;
function rsort(list, loose) {
  return list.sort(function(a, b) {
    return exports.rcompare(a, b, loose);
  });
}

exports.gt = gt;
function gt(a, b, loose) {
  return compare(a, b, loose) > 0;
}

exports.lt = lt;
function lt(a, b, loose) {
  return compare(a, b, loose) < 0;
}

exports.eq = eq;
function eq(a, b, loose) {
  return compare(a, b, loose) === 0;
}

exports.neq = neq;
function neq(a, b, loose) {
  return compare(a, b, loose) !== 0;
}

exports.gte = gte;
function gte(a, b, loose) {
  return compare(a, b, loose) >= 0;
}

exports.lte = lte;
function lte(a, b, loose) {
  return compare(a, b, loose) <= 0;
}

exports.cmp = cmp;
function cmp(a, op, b, loose) {
  var ret;
  switch (op) {
    case '===': ret = a === b; break;
    case '!==': ret = a !== b; break;
    case '': case '=': case '==': ret = eq(a, b, loose); break;
    case '!=': ret = neq(a, b, loose); break;
    case '>': ret = gt(a, b, loose); break;
    case '>=': ret = gte(a, b, loose); break;
    case '<': ret = lt(a, b, loose); break;
    case '<=': ret = lte(a, b, loose); break;
    default: throw new TypeError('Invalid operator: ' + op);
  }
  return ret;
}

exports.Comparator = Comparator;
function Comparator(comp, loose) {
  if (comp instanceof Comparator) {
    if (comp.loose === loose)
      return comp;
    else
      comp = comp.value;
  }

  if (!(this instanceof Comparator))
    return new Comparator(comp, loose);

  ;
  this.loose = loose;
  this.parse(comp);

  if (this.semver === ANY)
    this.value = '';
  else
    this.value = this.operator + this.semver.version;
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m)
    throw new TypeError('Invalid comparator: ' + comp);

  this.operator = m[1];
  // if it literally is just '>' or '' then allow anything.
  if (!m[2])
    this.semver = ANY;
  else {
    this.semver = new SemVer(m[2], this.loose);

    // <1.2.3-rc DOES allow 1.2.3-beta (has prerelease)
    // >=1.2.3 DOES NOT allow 1.2.3-beta
    // <=1.2.3 DOES allow 1.2.3-beta
    // However, <1.2.3 does NOT allow 1.2.3-beta,
    // even though `1.2.3-beta < 1.2.3`
    // The assumption is that the 1.2.3 version has something you
    // *don't* want, so we push the prerelease down to the minimum.
    if (this.operator === '<' && !this.semver.prerelease.length) {
      this.semver.prerelease = ['0'];
      this.semver.format();
    }
  }
};

Comparator.prototype.inspect = function() {
  return '<SemVer Comparator "' + this + '">';
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  ;
  return (this.semver === ANY) ? true :
         cmp(version, this.operator, this.semver, this.loose);
};


exports.Range = Range;
function Range(range, loose) {
  if ((range instanceof Range) && range.loose === loose)
    return range;

  if (!(this instanceof Range))
    return new Range(range, loose);

  this.loose = loose;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
    return this.parseRange(range.trim());
  }, this).filter(function(c) {
    // throw out any that are not relevant for whatever reason
    return c.length;
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range);
  }

  this.format();
}

Range.prototype.inspect = function() {
  return '<SemVer Range "' + this.range + '">';
};

Range.prototype.format = function() {
  this.range = this.set.map(function(comps) {
    return comps.join(' ').trim();
  }).join('||').trim();
  return this.range;
};

Range.prototype.toString = function() {
  return this.range;
};

Range.prototype.parseRange = function(range) {
  var loose = this.loose;
  range = range.trim();
  ;
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  ;
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  ;

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function(comp) {
    return parseComparator(comp, loose);
  }).join(' ').split(/\s+/);
  if (this.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, loose);
  });

  return set;
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, loose) {
  return new Range(range, loose).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, loose) {
  ;
  comp = replaceCarets(comp, loose);
  ;
  comp = replaceTildes(comp, loose);
  ;
  comp = replaceXRanges(comp, loose);
  ;
  comp = replaceStars(comp, loose);
  ;
  return comp;
}

function isX(id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, loose);
  }).join(' ');
}

function replaceTilde(comp, loose) {
  var r = loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function(_, M, m, p, pr) {
    ;
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0-0 <' + (+M + 1) + '.0.0-0';
    else if (isX(p))
      // ~1.2 == >=1.2.0- <1.3.0-
      ret = '>=' + M + '.' + m + '.0-0 <' + M + '.' + (+m + 1) + '.0-0';
    else if (pr) {
      ;
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      ret = '>=' + M + '.' + m + '.' + p + pr +
            ' <' + M + '.' + (+m + 1) + '.0-0';
    } else
      // ~1.2.3 == >=1.2.3-0 <1.3.0-0
      ret = '>=' + M + '.' + m + '.' + p + '-0' +
            ' <' + M + '.' + (+m + 1) + '.0-0';

    ;
    return ret;
  });
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, loose);
  }).join(' ');
}

function replaceCaret(comp, loose) {
  var r = loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function(_, M, m, p, pr) {
    ;
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0-0 <' + (+M + 1) + '.0.0-0';
    else if (isX(p)) {
      if (M === '0')
        ret = '>=' + M + '.' + m + '.0-0 <' + M + '.' + (+m + 1) + '.0-0';
      else
        ret = '>=' + M + '.' + m + '.0-0 <' + (+M + 1) + '.0.0-0';
    } else if (pr) {
      ;
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      if (M === '0') {
        if (m === '0')
          ret = '=' + M + '.' + m + '.' + p + pr;
        else
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0-0';
      } else
        ret = '>=' + M + '.' + m + '.' + p + pr +
              ' <' + (+M + 1) + '.0.0-0';
    } else {
      if (M === '0') {
        if (m === '0')
          ret = '=' + M + '.' + m + '.' + p;
        else
          ret = '>=' + M + '.' + m + '.' + p + '-0' +
                ' <' + M + '.' + (+m + 1) + '.0-0';
      } else
        ret = '>=' + M + '.' + m + '.' + p + '-0' +
              ' <' + (+M + 1) + '.0.0-0';
    }

    ;
    return ret;
  });
}

function replaceXRanges(comp, loose) {
  ;
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, loose);
  }).join(' ');
}

function replaceXRange(comp, loose) {
  comp = comp.trim();
  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
    ;
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX)
      gtlt = '';

    if (gtlt && anyX) {
      // replace X with 0, and then append the -0 min-prerelease
      if (xM)
        M = 0;
      if (xm)
        m = 0;
      if (xp)
        p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0-0
        // >1.2 => >=1.3.0-0
        // >1.2.3 => >= 1.2.4-0
        gtlt = '>=';
        if (xM) {
          // no change
        } else if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else if (xp) {
          m = +m + 1;
          p = 0;
        }
      }


      ret = gtlt + M + '.' + m + '.' + p + '-0';
    } else if (xM) {
      // allow any
      ret = '*';
    } else if (xm) {
      // append '-0' onto the version, otherwise
      // '1.x.x' matches '2.0.0-beta', since the tag
      // *lowers* the version value
      ret = '>=' + M + '.0.0-0 <' + (+M + 1) + '.0.0-0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0-0 <' + M + '.' + (+m + 1) + '.0-0';
    }

    ;

    return ret;
  });
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp, loose) {
  ;
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '');
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0-0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0-0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0-0 <3.5.0-0
function hyphenReplace($0,
                       from, fM, fm, fp, fpr, fb,
                       to, tM, tm, tp, tpr, tb) {

  if (isX(fM))
    from = '';
  else if (isX(fm))
    from = '>=' + fM + '.0.0-0';
  else if (isX(fp))
    from = '>=' + fM + '.' + fm + '.0-0';
  else
    from = '>=' + from;

  if (isX(tM))
    to = '';
  else if (isX(tm))
    to = '<' + (+tM + 1) + '.0.0-0';
  else if (isX(tp))
    to = '<' + tM + '.' + (+tm + 1) + '.0-0';
  else if (tpr)
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  else
    to = '<=' + to;

  return (from + ' ' + to).trim();
}


// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function(version) {
  if (!version)
    return false;
  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version))
      return true;
  }
  return false;
};

function testSet(set, version) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      return false;
  }
  return true;
}

exports.satisfies = satisfies;
function satisfies(version, range, loose) {
  try {
    range = new Range(range, loose);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, loose) {
  return versions.filter(function(version) {
    return satisfies(version, range, loose);
  }).sort(function(a, b) {
    return rcompare(a, b, loose);
  })[0] || null;
}

exports.validRange = validRange;
function validRange(range, loose) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, loose).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, loose) {
  return outside(version, range, '<', loose);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, loose) {
  return outside(version, range, '>', loose);
}

exports.outside = outside;
function outside(version, range, hilo, loose) {
  version = new SemVer(version, loose);
  range = new Range(range, loose);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break;
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, loose)) {
    return false;
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function(comparator) {
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, loose)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, loose)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
}

// Use the define() function if we're in AMD land
if (typeof define === 'function' && define.amd)
  define(exports);

})(
  typeof exports === 'object' ? exports :
  typeof define === 'function' && define.amd ? {} :
  semver = {}
);

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.3.0
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
        return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
        return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
        return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
        lib$es6$promise$utils$$_isArray = function (x) {
            return Object.prototype.toString.call(x) === '[object Array]';
        };
    } else {
        lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
        lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
        lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
        lib$es6$promise$asap$$len += 2;
        if (lib$es6$promise$asap$$len === 2) {
            // If len is 2, that means that we need to schedule an async flush.
            // If additional callbacks are queued before the queue is flushed, they
            // will be processed by this flush that we are scheduling.
            if (lib$es6$promise$asap$$customSchedulerFn) {
                lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
            } else {
                lib$es6$promise$asap$$scheduleFlush();
            }
        }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
        lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
        lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
        typeof importScripts !== 'undefined' &&
        typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
        var nextTick = process.nextTick;
        // node version 0.10.x displays a deprecation warning when nextTick is used recursively
        // setImmediate should be used instead instead
        var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
        if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
            nextTick = setImmediate;
        }
        return function() {
            nextTick(lib$es6$promise$asap$$flush);
        };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
        return function() {
            lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
        };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
        var iterations = 0;
        var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
        var node = document.createTextNode('');
        observer.observe(node, { characterData: true });

        return function() {
            node.data = (iterations = ++iterations % 2);
        };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
        var channel = new MessageChannel();
        channel.port1.onmessage = lib$es6$promise$asap$$flush;
        return function () {
            channel.port2.postMessage(0);
        };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
        return function() {
            setTimeout(lib$es6$promise$asap$$flush, 1);
        };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
        for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
            var callback = lib$es6$promise$asap$$queue[i];
            var arg = lib$es6$promise$asap$$queue[i+1];

            callback(arg);

            lib$es6$promise$asap$$queue[i] = undefined;
            lib$es6$promise$asap$$queue[i+1] = undefined;
        }

        lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertex() {
        try {
            var r = require;
            var vertx = r('vertx');
            lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
            return lib$es6$promise$asap$$useVertxTimer();
        } catch(e) {
            return lib$es6$promise$asap$$useSetTimeout();
        }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
    } else {
        lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFullfillment() {
        return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
        return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
        try {
            return promise.then;
        } catch(error) {
            lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
            return lib$es6$promise$$internal$$GET_THEN_ERROR;
        }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
        try {
            then.call(value, fulfillmentHandler, rejectionHandler);
        } catch(e) {
            return e;
        }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
        lib$es6$promise$asap$$asap(function(promise) {
            var sealed = false;
            var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
                if (sealed) { return; }
                sealed = true;
                if (thenable !== value) {
                    lib$es6$promise$$internal$$resolve(promise, value);
                } else {
                    lib$es6$promise$$internal$$fulfill(promise, value);
                }
            }, function(reason) {
                if (sealed) { return; }
                sealed = true;

                lib$es6$promise$$internal$$reject(promise, reason);
            }, 'Settle: ' + (promise._label || ' unknown promise'));

            if (!sealed && error) {
                sealed = true;
                lib$es6$promise$$internal$$reject(promise, error);
            }
        }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
        if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
            lib$es6$promise$$internal$$fulfill(promise, thenable._result);
        } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
            lib$es6$promise$$internal$$reject(promise, thenable._result);
        } else {
            lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
                lib$es6$promise$$internal$$resolve(promise, value);
            }, function(reason) {
                lib$es6$promise$$internal$$reject(promise, reason);
            });
        }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
        if (maybeThenable.constructor === promise.constructor) {
            lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
        } else {
            var then = lib$es6$promise$$internal$$getThen(maybeThenable);

            if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
                lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
            } else if (then === undefined) {
                lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
            } else if (lib$es6$promise$utils$$isFunction(then)) {
                lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
            } else {
                lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
            }
        }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
        if (promise === value) {
            lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
        } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
            lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
        } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
        }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
        if (promise._onerror) {
            promise._onerror(promise._result);
        }

        lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
        if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

        promise._result = value;
        promise._state = lib$es6$promise$$internal$$FULFILLED;

        if (promise._subscribers.length !== 0) {
            lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
        }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
        if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
        promise._state = lib$es6$promise$$internal$$REJECTED;
        promise._result = reason;

        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
        var subscribers = parent._subscribers;
        var length = subscribers.length;

        parent._onerror = null;

        subscribers[length] = child;
        subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
        subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

        if (length === 0 && parent._state) {
            lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
        }
    }

    function lib$es6$promise$$internal$$publish(promise) {
        var subscribers = promise._subscribers;
        var settled = promise._state;

        if (subscribers.length === 0) { return; }

        var child, callback, detail = promise._result;

        for (var i = 0; i < subscribers.length; i += 3) {
            child = subscribers[i];
            callback = subscribers[i + settled];

            if (child) {
                lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
            } else {
                callback(detail);
            }
        }

        promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
        this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
        try {
            return callback(detail);
        } catch(e) {
            lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
            return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
        }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
        var hasCallback = lib$es6$promise$utils$$isFunction(callback),
            value, error, succeeded, failed;

        if (hasCallback) {
            value = lib$es6$promise$$internal$$tryCatch(callback, detail);

            if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
                failed = true;
                error = value.error;
                value = null;
            } else {
                succeeded = true;
            }

            if (promise === value) {
                lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
                return;
            }

        } else {
            value = detail;
            succeeded = true;
        }

        if (promise._state !== lib$es6$promise$$internal$$PENDING) {
            // noop
        } else if (hasCallback && succeeded) {
            lib$es6$promise$$internal$$resolve(promise, value);
        } else if (failed) {
            lib$es6$promise$$internal$$reject(promise, error);
        } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
            lib$es6$promise$$internal$$fulfill(promise, value);
        } else if (settled === lib$es6$promise$$internal$$REJECTED) {
            lib$es6$promise$$internal$$reject(promise, value);
        }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
        try {
            resolver(function resolvePromise(value){
                lib$es6$promise$$internal$$resolve(promise, value);
            }, function rejectPromise(reason) {
                lib$es6$promise$$internal$$reject(promise, reason);
            });
        } catch(e) {
            lib$es6$promise$$internal$$reject(promise, e);
        }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
        var enumerator = this;

        enumerator._instanceConstructor = Constructor;
        enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

        if (enumerator._validateInput(input)) {
            enumerator._input     = input;
            enumerator.length     = input.length;
            enumerator._remaining = input.length;

            enumerator._init();

            if (enumerator.length === 0) {
                lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
            } else {
                enumerator.length = enumerator.length || 0;
                enumerator._enumerate();
                if (enumerator._remaining === 0) {
                    lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
                }
            }
        } else {
            lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
        }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
        return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
        return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
        this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
        var enumerator = this;

        var length  = enumerator.length;
        var promise = enumerator.promise;
        var input   = enumerator._input;

        for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
            enumerator._eachEntry(input[i], i);
        }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
        var enumerator = this;
        var c = enumerator._instanceConstructor;

        if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
            if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
                entry._onerror = null;
                enumerator._settledAt(entry._state, i, entry._result);
            } else {
                enumerator._willSettleAt(c.resolve(entry), i);
            }
        } else {
            enumerator._remaining--;
            enumerator._result[i] = entry;
        }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
        var enumerator = this;
        var promise = enumerator.promise;

        if (promise._state === lib$es6$promise$$internal$$PENDING) {
            enumerator._remaining--;

            if (state === lib$es6$promise$$internal$$REJECTED) {
                lib$es6$promise$$internal$$reject(promise, value);
            } else {
                enumerator._result[i] = value;
            }
        }

        if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
        }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
        var enumerator = this;

        lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
            enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
        }, function(reason) {
            enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
        });
    };
    function lib$es6$promise$promise$all$$all(entries) {
        return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
        /*jshint validthis:true */
        var Constructor = this;

        var promise = new Constructor(lib$es6$promise$$internal$$noop);

        if (!lib$es6$promise$utils$$isArray(entries)) {
            lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
            return promise;
        }

        var length = entries.length;

        function onFulfillment(value) {
            lib$es6$promise$$internal$$resolve(promise, value);
        }

        function onRejection(reason) {
            lib$es6$promise$$internal$$reject(promise, reason);
        }

        for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
            lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
        }

        return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
        /*jshint validthis:true */
        var Constructor = this;

        if (object && typeof object === 'object' && object.constructor === Constructor) {
            return object;
        }

        var promise = new Constructor(lib$es6$promise$$internal$$noop);
        lib$es6$promise$$internal$$resolve(promise, object);
        return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
        /*jshint validthis:true */
        var Constructor = this;
        var promise = new Constructor(lib$es6$promise$$internal$$noop);
        lib$es6$promise$$internal$$reject(promise, reason);
        return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
     Promise objects represent the eventual result of an asynchronous operation. The
     primary way of interacting with a promise is through its `then` method, which
     registers callbacks to receive either a promise's eventual value or the reason
     why the promise cannot be fulfilled.

     Terminology
     -----------

     - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
     - `thenable` is an object or function that defines a `then` method.
     - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
     - `exception` is a value that is thrown using the throw statement.
     - `reason` is a value that indicates why a promise was rejected.
     - `settled` the final resting state of a promise, fulfilled or rejected.

     A promise can be in one of three states: pending, fulfilled, or rejected.

     Promises that are fulfilled have a fulfillment value and are in the fulfilled
     state.  Promises that are rejected have a rejection reason and are in the
     rejected state.  A fulfillment value is never a thenable.

     Promises can also be said to *resolve* a value.  If this value is also a
     promise, then the original promise's settled state will match the value's
     settled state.  So a promise that *resolves* a promise that rejects will
     itself reject, and a promise that *resolves* a promise that fulfills will
     itself fulfill.


     Basic Usage:
     ------------

     ```js
     var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

     promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
     ```

     Advanced Usage:
     ---------------

     Promises shine when abstracting away asynchronous interactions such as
     `XMLHttpRequest`s.

     ```js
     function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

     getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
     ```

     Unlike callbacks, promises are great composable primitives.

     ```js
     Promise.all([
     getJSON('/posts'),
     getJSON('/comments')
     ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
     ```

     @class Promise
     @param {function} resolver
     Useful for tooling.
     @constructor
     */
    function lib$es6$promise$promise$$Promise(resolver) {
        this._id = lib$es6$promise$promise$$counter++;
        this._state = undefined;
        this._result = undefined;
        this._subscribers = [];

        if (lib$es6$promise$$internal$$noop !== resolver) {
            if (!lib$es6$promise$utils$$isFunction(resolver)) {
                lib$es6$promise$promise$$needsResolver();
            }

            if (!(this instanceof lib$es6$promise$promise$$Promise)) {
                lib$es6$promise$promise$$needsNew();
            }

            lib$es6$promise$$internal$$initializePromise(this, resolver);
        }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
        constructor: lib$es6$promise$promise$$Promise,

        /**
         The primary way of interacting with a promise is through its `then` method,
         which registers callbacks to receive either a promise's eventual value or the
         reason why the promise cannot be fulfilled.

         ```js
         findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
         ```

         Chaining
         --------

         The return value of `then` is itself a promise.  This second, 'downstream'
         promise is resolved with the return value of the first promise's fulfillment
         or rejection handler, or rejected if the handler throws an exception.

         ```js
         findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

         findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
         ```
         If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

         ```js
         findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
         ```

         Assimilation
         ------------

         Sometimes the value you want to propagate to a downstream promise can only be
         retrieved asynchronously. This can be achieved by returning a promise in the
         fulfillment or rejection handler. The downstream promise will then be pending
         until the returned promise is settled. This is called *assimilation*.

         ```js
         findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
         ```

         If the assimliated promise rejects, then the downstream promise will also reject.

         ```js
         findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
         ```

         Simple Example
         --------------

         Synchronous Example

         ```javascript
         var result;

         try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
         ```

         Errback Example

         ```js
         findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
         ```

         Promise Example;

         ```javascript
         findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
         ```

         Advanced Example
         --------------

         Synchronous Example

         ```javascript
         var author, books;

         try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
         ```

         Errback Example

         ```js

         function foundBooks(books) {

      }

         function failure(reason) {

      }

         findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
         ```

         Promise Example;

         ```javascript
         findAuthor().
         then(findBooksByAuthor).
         then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
         ```

         @method then
         @param {Function} onFulfilled
         @param {Function} onRejected
         Useful for tooling.
         @return {Promise}
         */
        then: function(onFulfillment, onRejection) {
            var parent = this;
            var state = parent._state;

            if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
                return this;
            }

            var child = new this.constructor(lib$es6$promise$$internal$$noop);
            var result = parent._result;

            if (state) {
                var callback = arguments[state - 1];
                lib$es6$promise$asap$$asap(function(){
                    lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
                });
            } else {
                lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
            }

            return child;
        },

        /**
         `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
         as the catch block of a try/catch statement.

         ```js
         function findAuthor(){
        throw new Error('couldn't find that author');
      }

         // synchronous
         try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

         // async with promises
         findAuthor().catch(function(reason){
        // something went wrong
      });
         ```

         @method catch
         @param {Function} onRejection
         Useful for tooling.
         @return {Promise}
         */
        'catch': function(onRejection) {
            return this.then(null, onRejection);
        }
    };
    function lib$es6$promise$polyfill$$polyfill() {
        var local;

        if (typeof global !== 'undefined') {
            local = global;
        } else if (typeof self !== 'undefined') {
            local = self;
        } else {
            try {
                local = Function('return this')();
            } catch (e) {
                throw new Error('polyfill failed because global object is unavailable in this environment');
            }
        }

        var P = local.Promise;

        if (P && (Object.prototype.toString.call(P.resolve()) === '[object Promise]' || '[object Object]') && !P.cast) {
            return;
        }

        local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
        'Promise': lib$es6$promise$promise$$default,
        'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
        define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
        module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
        this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);

/**
 * Static Private functions
 */

/* createDir, recursively */
function __createDir(rootDirEntry, folders, success,error) {
    rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
        // Recursively add the new subfolder (if we still have another to create).
        if (folders.length > 1) {
            __createDir(dirEntry, folders.slice(1),success,error);
        } else {
            success(dirEntry);
        }
    }, error);
}

function dirname(str) {
    str = str.substr(0,str.lastIndexOf('/')+1);
    if(str[0] === '/') str = str.substr(1);
    return str;
}

function filename(str) {
    return str.substr(str.lastIndexOf('/')+1);
}

function normalize(str){
    str = str || '';
    if(str[0] === '/') str = str.substr(1);
    if(!!str && str.indexOf('.') < 0 && str[str.length-1] !== '/') str += '/';
    if(str === './') str = '';
    return str;
}

var transferQueue = [], // queued fileTransfers
    inprogress = 0;     // currently active filetransfers

/**
 * Factory function: Create a single instance (based on single FileSystem)
 */
window.CordovaPromiseFS = function(options){
    /* Promise implementation */
    var Promise = options.Promise || window.Promise;
    if(!Promise) { throw new Error("No Promise library given in options.Promise"); }

    /* default options */
    this.options = options = options || {};
    options.persistent = options.persistent !== undefined? options.persistent: true;
    options.storageSize = options.storageSize || 20*1024*1024;
    options.concurrency = options.concurrency || 3;
    options.retry = options.retry || [];

    /* Cordova deviceready promise */
    var deviceready, isCordova = typeof cordova !== 'undefined';
    if(isCordova){
        deviceready = new Promise(function(resolve,reject){
            document.addEventListener("deviceready", resolve, false);
            setTimeout(function(){ reject(new Error('deviceready has not fired after 5 seconds.')); },5100);
        });
    } else {
        /* FileTransfer implementation for Chrome */
        deviceready = ResolvedPromise(true);
        if(typeof webkitRequestFileSystem !== 'undefined'){
            window.requestFileSystem = webkitRequestFileSystem;
            window.FileTransfer = function FileTransfer(){};
            FileTransfer.prototype.download = function download(url,file,win,fail) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.responseType = "blob";
                xhr.onreadystatechange = function(onSuccess, onError, cb) {
                    if (xhr.readyState == 4) {
                        if(xhr.status === 200){
                            write(file,xhr.response).then(win,fail);
                        } else {
                            fail(xhr.status);
                        }
                    }
                };
                xhr.send();
                return xhr;
            };
            window.ProgressEvent = function ProgressEvent(){};
            window.FileEntry = function FileEntry(){};
        } else {
            window.requestFileSystem = function(x,y,z,fail){
                fail(new Error('requestFileSystem not supported!'));
            };
        }
    }

    /* Promise resolve helper */
    function ResolvedPromise(value){
        return new Promise(function(resolve){
            return resolve(value);
        });
    }

    /* the filesystem! */
    var fs = new Promise(function(resolve,reject){
        deviceready.then(function(){
            var type = options.persistent? 1: 0;
            if(options.fileSystem){
                type = options.fileSystem;
            }
            // Chrome only supports persistent and temp storage, not the exotic onces from Cordova
            if(!isCordova && type > 1) {
                console.warn('Chrome does not support fileSystem "'+type+'". Falling back on "0" (temporary).');
                type = 0;
            }
            if(isNaN(type)) {
                window.resolveLocalFileSystemURL(type,function(directory){
                    resolve(directory.filesystem);
                },reject);
            }else{
                window.requestFileSystem(type, options.storageSize, resolve, reject);
            }

            setTimeout(function(){ reject(new Error('Could not retrieve FileSystem after 5 seconds.')); },5100);
        },reject);
    });


    /* debug */
    fs.then(function(fs){
        window.__fs = fs;
    },function(err){
        console.error('Could not get Cordova FileSystem:',err);
    });

    /* ensure directory exists */
    function ensure(folders) {
        return new Promise(function(resolve,reject){
            return fs.then(function(fs){
                if(!folders) {
                    resolve(fs.root);
                } else {
                    folders = folders.split('/').filter(function(folder) {
                        return folder && folder.length > 0 && folder !== '.' && folder !== '..';
                    });
                    __createDir(fs.root,folders,resolve,reject);
                }
            },reject);
        });
    }

    /* get file file */
    function file(path,options){
        return new Promise(function(resolve,reject){
            if(typeof path === 'object') {
                return resolve(path);
            }
            path = normalize(path);
            options = options || {};
            return fs.then(function(fs){
                fs.root.getFile(path,options,resolve,reject);
            },reject);
        });
    }

    /* get directory entry */
    function dir(path,options){
        path = normalize(path);
        options = options || {};
        return new Promise(function(resolve,reject){
            return fs.then(function(fs){
                if(!path || path === '/') {
                    resolve(fs.root);
                } else {
                    fs.root.getDirectory(path,options,resolve,reject);
                }
            },reject);
        });
    }

    /* list contents of a directory */
    function list(path,mode) {
        mode = mode || '';
        var recursive = mode.indexOf('r') > -1;
        var getAsEntries = mode.indexOf('e') > -1;
        var onlyFiles = mode.indexOf('f') > -1;
        var onlyDirs = mode.indexOf('d') > -1;
        if(onlyFiles && onlyDirs) {
            onlyFiles = false;
            onlyDirs = false;
        }

        return new Promise(function(resolve,reject){
            return dir(path).then(function(dirEntry){
                var dirReader = dirEntry.createReader();
                dirReader.readEntries(function(entries) {
                    var promises = [ResolvedPromise(entries)];
                    if(recursive) {
                        entries
                            .filter(function(entry){return entry.isDirectory; })
                            .forEach(function(entry){
                                promises.push(list(entry.fullPath,'re'));
                            });
                    }
                    Promise.all(promises).then(function(values){
                        var entries = [];
                        entries = entries.concat.apply(entries,values);
                        if(onlyFiles) entries = entries.filter(function(entry) { return entry.isFile; });
                        if(onlyDirs) entries = entries.filter(function(entry) { return entry.isDirectory; });
                        if(!getAsEntries) entries = entries.map(function(entry) { return entry.fullPath; });
                        resolve(entries);
                    },reject);
                }, reject);
            },reject);
        });
    }

    /* does file exist? If so, resolve with fileEntry, if not, resolve with false. */
    function exists(path){
        return new Promise(function(resolve,reject){
            file(path).then(
                function(fileEntry){
                    resolve(fileEntry);
                },
                function(err){
                    if(err.code === 1) {
                        resolve(false);
                    } else {
                        reject(err);
                    }
                }
            );
        });
    }

    function create(path){
        return ensure(dirname(path)).then(function(){
            return file(path,{create:true});
        });
    }

    /* convert path to URL to be used in JS/CSS/HTML */
    function toURL(path) {
        return file(path).then(function(fileEntry) {
            return fileEntry.toURL();
        });
    }

    /* convert path to URL to be used in JS/CSS/HTML */
    var toInternalURL,toInternalURLSync;
    if(isCordova) {
        /* synchronous helper to get internal URL. */
        toInternalURLSync = function(path){
            path = normalize(path);
            return path.indexOf('://') < 0? 'cdvfile://localhost/'+(options.persistent? 'persistent/':'temporary/') + path: path;
        };

        toInternalURL = function(path) {
            return file(path).then(function(fileEntry) {
                return fileEntry.toInternalURL();
            });
        };
    } else {
        /* synchronous helper to get internal URL. */
        toInternalURLSync = function(path){
            path = normalize(path);
            return 'filesystem:'+location.origin+(options.persistent? '/persistent/':'/temporary/') + path;
        };

        toInternalURL = function(path) {
            return file(path).then(function(fileEntry) {
                return fileEntry.toURL();
            });
        };
    }

    /* return contents of a file */
    function read(path,method) {
        method = method || 'readAsText';
        return file(path).then(function(fileEntry) {
            return new Promise(function(resolve,reject){
                fileEntry.file(function(file){
                    var reader = new FileReader();
                    reader.onloadend = function(){
                        resolve(this.result);
                    };
                    reader[method](file);
                },reject);
            });
        });
    }

    /* convert path to base64 date URI */
    function toDataURL(path) {
        return read(path,'readAsDataURL');
    }


    function readJSON(path){
        return read(path).then(JSON.parse);
    }

    /* write contents to a file */
    function write(path,blob,mimeType) {
        return ensure(dirname(path))
            .then(function() { return file(path,{create:true}); })
            .then(function(fileEntry) {
                return new Promise(function(resolve,reject){
                    fileEntry.createWriter(function(writer){
                        writer.onwriteend = resolve;
                        writer.onerror = reject;
                        if(typeof blob === 'string') {
                            blob = new Blob([blob],{type: mimeType || 'text/plain'});
                        } else if(blob instanceof Blob !== true){
                            blob = new Blob([JSON.stringify(blob,null,4)],{type: mimeType || 'application/json'});
                        }
                        writer.write(blob);
                    },reject);
                });
            });
    }

    /* move a file */
    function move(src,dest) {
        return ensure(dirname(dest))
            .then(function(dir) {
                return file(src).then(function(fileEntry){
                    return new Promise(function(resolve,reject){
                        fileEntry.moveTo(dir,filename(dest),resolve,reject);
                    });
                });
            });
    }

    /* copy a file */
    function copy(src,dest) {
        return ensure(dirname(dest))
            .then(function(dir) {
                return file(src).then(function(fileEntry){
                    return new Promise(function(resolve,reject){
                        fileEntry.copyTo(dir,filename(dest),resolve,reject);
                    });
                });
            });
    }

    /* delete a file */
    function remove(path,mustExist) {
        var method = mustExist? file:exists;
        return new Promise(function(resolve,reject){
            method(path).then(function(fileEntry){
                if(fileEntry !== false) {
                    fileEntry.remove(resolve,reject);
                } else {
                    resolve(1);
                }
            },reject);
        }).then(function(val){
                return val === 1? false: true;
            });
    }

    /* delete a directory */
    function removeDir(path) {
        return dir(path).then(function(dirEntry){
            return new Promise(function(resolve,reject) {
                dirEntry.removeRecursively(resolve,reject);
            });
        });
    }

    // Whenever we want to start a transfer, we call popTransferQueue
    function popTransferQueue(){
        // while we are not at max concurrency
        while(transferQueue.length > 0 && inprogress < options.concurrency){
            // increment activity counter
            inprogress++;

            // fetch filetranfer, method-type (isDownload) and arguments
            var args = transferQueue.pop();
            var ft = args.shift();
            var isDownload = args.shift();
            var serverUrl = args.shift();
            var localPath = args.shift();
            var win = args.shift();
            var fail = args.shift();
            var trustAllHosts = args.shift();
            var transferOptions = args.shift();

            if(ft._aborted) {
                inprogress--;
            } else if(isDownload){
                ft.download.call(ft,serverUrl,localPath,win,fail,trustAllHosts,transferOptions);
                if(ft.onprogress) ft.onprogress(new ProgressEvent());
            } else {
                ft.upload.call(ft,localPath,serverUrl,win,fail,transferOptions,trustAllHosts);
            }
        }
        // if we are at max concurrency, popTransferQueue() will be called whenever
        // the transfer is ready and there is space avaialable.
    }

    // Promise callback to check if there are any more queued transfers
    function nextTransfer(result){
        inprogress--; // decrement counter to free up one space to start transfers again!
        popTransferQueue(); // check if there are any queued transfers
        return result;
    }

    function filetransfer(isDownload,serverUrl,localPath,transferOptions,onprogress){
        if(typeof transferOptions === 'function') {
            onprogress = transferOptions;
            transferOptions = {};
        }
        if(isCordova && localPath.indexOf('://') < 0) localPath = toInternalURLSync(localPath);

        transferOptions = transferOptions || {};
        if(!transferOptions.retry || !transferOptions.retry.length) {
            transferOptions.retry = options.retry;
        }
        transferOptions.retry = transferOptions.retry.concat();
        if(!transferOptions.file && !isDownload){
            transferOptions.fileName = filename(localPath);
        }

        var ft = new FileTransfer();
        onprogress = onprogress || transferOptions.onprogress;
        if(typeof onprogress === 'function') ft.onprogress = onprogress;
        var promise = new Promise(function(resolve,reject){
            var attempt = function(err){
                if(transferOptions.retry.length === 0) {
                    reject(err);
                } else {
                    transferQueue.unshift([ft,isDownload,serverUrl,localPath,resolve,attempt,transferOptions.trustAllHosts || false,transferOptions]);
                    var timeout = transferOptions.retry.shift();
                    if(timeout > 0) {
                        setTimeout(nextTransfer,timeout);
                    } else {
                        nextTransfer();
                    }
                }
            };
            transferOptions.retry.unshift(0);
            inprogress++;
            attempt();
        });
        promise.then(nextTransfer,nextTransfer);
        promise.progress = function(onprogress){
            ft.onprogress = onprogress;
            return promise;
        };
        promise.abort = function(){
            ft._aborted = true;
            ft.abort();
            return promise;
        };
        return promise;
    }

    function download(url,dest,options,onprogress){
        return filetransfer(true,url,dest,options,onprogress);
    }

    function upload(source,dest,options,onprogress){
        return filetransfer(false,dest,source,options,onprogress);
    }

    return {
        fs: fs,
        normalize: normalize,
        file: file,
        filename: filename,
        dir: dir,
        dirname: dirname,
        create:create,
        read: read,
        readJSON: readJSON,
        write: write,
        move: move,
        copy: copy,
        remove: remove,
        removeDir: removeDir,
        list: list,
        ensure: ensure,
        exists: exists,
        download: download,
        upload: upload,
        toURL:toURL,
        isCordova:isCordova,
        toInternalURLSync: toInternalURLSync,
        toInternalURL:toInternalURL,
        toDataURL:toDataURL,
        deviceready: deviceready,
        options: options,
        Promise: Promise
    };
};
(function() {
    window.ntp = {
        roundtrips: new Array(),
        math: {
            average: function(list){
                var average = 0;
                var i=0;
                for (i=0; i < list.length;i++){
                    average += list[i];
                }
                average = Math.round(average / i);
                return average
            },
            min: function(list){
                var min=Infinity;
                var i=0;
                for (i=0; i < list.length;i++){
                    if (list[i]<min){
                        min=list[i];
                    }
                }
                return min;
            }
        },

        init: function(socket){
            this.socket = socket;
            var _this=this;
            this.socket.on('NTP', function(times){
                _this.roundtrips.push({
                    clientSend: parseInt(times.split(":")[1]),
                    server: parseInt(times.split(":")[0]),
                    clientReceive: new Date().getTime()
                });

                _this.tripsSoFar++;
                if (_this.tripsSoFar < _this.trips){
                    _this.socket.emit('NTP', new Date().getTime());
                } else {
                    _this.callback();
                }
            });
        },

        sync: function(callback, trips){
            if (typeof(callback)==='undefined'){
                throw 'No callback to be run after syncing is defined.';
            }
            this.tripsSoFar = 0;
            this.roundtrips = [];
            this.callback = callback;

            //Defaults
            if (typeof(trips)==='undefined'){
                trips = 100;
            }
            this.trips = trips;

            this.socket.emit('NTP', new Date().getTime());
        },

        _date: function(adjust){
            return function(dateIn){
                /*
                 Get the date of the server that
                 corresponds to a client date.
                 */
                tmp=new Date();
                if (typeof(dateIn)==='undefined'){
                    //Use now if no date is specified
                } else if (typeof(dateIn)==='number'){
                    tmp.setTime(dateIn);
                } else if (typeof(dateIn)==='object'){
                    tmp.setTime(dateIn.getTime());
                }
                tmp.setTime(tmp.getTime()+adjust);
                return tmp;
            }
        },

        clientDate: function(serverDate){
            if (typeof(serverDate)==='undefined'){
                return new Date();
            } else {
                return this._date(this.offset())(serverDate);
            }
        },

        serverDate :function(clientDate){
            return this._date(-1*this.offset())(clientDate);
        },

        best: function(){
            var delays=this.roundtrips.map(this.stats.delay)
            var lowDelay=this.math.min(delays);
//    console.log(delays);
//    console.log(lowDelay);
            var i=0;
            var bestTrips=[]; //Trips with low delay
            for (i=0;i<delays.length;i++){
                if (delays[i]===lowDelay){
                    bestTrips.push(this.roundtrips[i]);
//        console.log(ntp.stats.delay(bestTrips[bestTrips.length-1])+' should be '+lowDelay);
                }
            }
//    console.log('Best delay: '+lowDelay);
            return bestTrips;
        },
        offset: function(){
            return this.math.average(this.best().map(this.stats.offset));
        },
        stats: {
            //Round-trip length
            delay: function(trip) {
                return (trip.clientReceive - trip.clientSend);
            },
            offset: function(trip){
                return (trip.clientReceive + trip.clientSend) / 2 - trip.server;
            }
        }

    };


})();


;

function isInNode() {
  return typeof module !== 'undefined' && module.exports
}

function isInTest() {
  return typeof global !== 'undefined' && global.window.test
}

var window = window || {addEventListener: function(){}, $: {}, Capriza: {}};

var Capriza = window.Capriza;

window._urlParams = window._urlParams || {};

window.crypto = window.crypto ||
    (isInNode() && typeof top !== 'undefined' && top.window.crypto) ||
    (isInTest() && require('crypto'));

if (window.crypto && !window.crypto.getRandomValues) {
  window.crypto.getRandomValues = window.crypto.randomBytes;
}

var _ = window._ || (isInNode() && require('underscore'));
var io = window.io || (isInNode() && require('socket.io-client'));
//var ellipticjs = window.ellipticjs || (isInNode() && require('elliptic-ex-3.0.3'));
var ellipticjs;
var SocketGD = window.SocketGD || (isInNode() && require('socketgd').SocketGD);
var forge;

/////////////////////////////
function EventEmitter() {
  this.callbacks = {};
}

/**
 * listen for event
 * @param event the event to listen for
 * @param hits (optional) positive number means the callback will be invoked hits number of times
 * before being unregistered. negative number means that hits number of triggers must occur for the callback to be
 * invoked, and it will be invoked exactly once.
 * @param cb
 */
EventEmitter.prototype.on = function(event, hits, cb) {
  if (this.callbacks[event] === undefined) {
    this.callbacks[event] = [];
  }
  if (typeof hits === 'function') {
    cb = hits;
  }
  if (typeof hits !== 'number') {
    hits = undefined;
  }
  this.callbacks[event].push({cb: cb, hits: hits});
};

EventEmitter.prototype.once = function(event, cb) {
  this.on(event, 1, cb);
};

EventEmitter.prototype.toArray = function(args, offset) {
  var array = [];
  for (var j = offset; j < args.length; ++j) {
    array.push(args[j]);
  }
  return array;
};

EventEmitter.prototype.emit = function(event) {
  if (!this.callbacks[event]) {
    return
  }
  var args = this.toArray(arguments, 1);
  var cbs = this.callbacks[event];
  for (var i = 0; i < cbs.length; ++i) {

    if (cbs[i].hits) {
      if (cbs[i].hits < 0 && ++cbs[i].hits === 0) {
        // fire the event only once after all the hits have been reached
        cbs[i].cb.apply(null, args);
      } else if (cbs[i].hits > 0) {
        // fire the event on every hit until we reach 0
        --cbs[i].hits;
        cbs[i].cb.apply(null, args);
      }
    } else {
      cbs[i].cb.apply(null, args);
    }

    if (cbs[i].hits === 0) {
      cbs.splice(i);
      --i;
    }
  }
};

EventEmitter.prototype.off = function(event, cb) {
  if (!this.callbacks[event]) {
    return
  }
  var cbs = this.callbacks[event];
  for (var i = 1; i < cbs.length; ++i) {
    if (cbs[i].cb === cb) {
      cbs.splice(i);
      return;
    }
  }
};

/////////////////////////////
function Log(tag) {
  this._tag = tag;
  this.logger = window.Logger || console;
}

Log.prototype.debug = function(msg) {
  this.logger.debug('['+this._tag+'] ' + msg);
};

Log.prototype.info = function(msg) {
  this.logger.info('['+this._tag+'] ' + msg);
};

Log.prototype.warn = function(msg) {
  this.logger.warn('['+this._tag+'] ' + msg);
};

Log.prototype.trace = function(msg) {
  //console.trace('logger '+msg);
};

Log.prototype.tag = function(msg) {
  this.logger.tag && this.logger.tag(msg);
};

Log.prototype.error = function(message, stack, type) {
  this.logger.error('['+this._tag+'] ' + message);
  this.logger.error('['+this._tag+'] stack: ', stack);
  this.logger.error('['+this._tag+'] type: '+type);
};


if (!window.Logger) {
  var BGLooger = require('../../bgs/BGLogger');
  window.Logger = new BGLooger();
}

if (typeof pageManager === 'undefined') {
  var pageManager = {
    generateErrorPage : function() {
      window.Logger.debug('mock impl of generateErrorPage');
    }
  }
}

/////////////////////////////
function SecureChannel(manager) {
  this.logger = new Log('SecureChannel');
  this.manager = manager;
  this.useEnvelope = false;
  this.enabled = false;
  this.ec = null;
  this.ecdhKeyPair = null;
  this.secretKey = null;
  this.secretIV = null;
  this.engine = null;
}

SecureChannel.prototype.generateRandomBytes = function(length) {
  return forge.random.getBytesSync(length);
};

SecureChannel.prototype.digest = function(input) {
  var md = forge.md.sha1.create();
  md.update(input);
  return md.digest().toHex();
};

SecureChannel.prototype.fingerprints = function() {
  var keyDigest = this.digest(this.secretKey || '');
  var ivDigest = this.digest(this.secretIV || '');
  return keyDigest + '/' + ivDigest;
};

SecureChannel.prototype.initECDH = function(MBOOT) {
  // can ellipticjs generate public/private pair?
  if (window.crypto && window.crypto.getRandomValues) {
    if (MBOOT !== undefined) {
      this.ec = MBOOT.Security.engine();
      this.ecdhKeyPair = MBOOT.Security.pair();
      this.mobilePublicKey = MBOOT.Security.public();
    } else if (isInNode()) {
      this.logger.info('init ecdh');
      var start = Date.now();
      //var privKey = this.mobilePrivateKey = window._urlParams['privKey'];
      //var pubKey = this.mobilePublicKey = window._urlParams['pubKey'];
      //if (privKey && pubKey) {
      //  this.logger.debug('ecdh keypair passed from store. postponing ecdh module initialization');
      //} else {
      this.ec = new ellipticjs.ec('ed25519');
      this.ecdhKeyPair = this.ec.genKeyPair();
      var pubKey = this.mobilePublicKey = this.ecdhKeyPair.getPublic(true, 'hex');
      //}
      var date = new Date();
      date.setTime(date.getTime() + (10 * 60 * 1000));
      var ecdhCookie = "ecdhkey=" + pubKey + "; expires=" + date.toUTCString() + "; path=/run" + window.runToken + ".json; domain=capriza.com";
      this.logger.info('init ecdh took ' + (Date.now() - start) + 'ms. public key: ' + pubKey);
      return ecdhCookie;
    }
  } else {
    this.logger.warn('ecdh is not supported on this browser');
  }
};

SecureChannel.prototype.pemToPublicKey = function(msg, appData) {
  // get the public key from the PEM formatted string
  if (!msg.key) {
    throw {type: 'security', message: 'Received empty public key'};
  }
  var pubkey = msg.key;
  if (pubkey.indexOf("-----BEGIN CERTIFICATE-----") == 0) {
    var cert = forge.pki.certificateFromPem(pubkey, true, false);
    // verify that it is one of the certificates we trust via the fingerprints
    var trusted = false;
    var fingerprints = this.manager.appData(appData).certs_fingerprints;
    // the trusted fingerprints might be coming from outside - i.e. AppConfig setting
    if (window.MBOOT && window.MBOOT.Query.params.rtTrustedCerts) {
      fingerprints = decodeURIComponent(window.MBOOT.Query.params.rtTrustedCerts).split(',').map(function(c) {return c.trim();});
    }
    if (fingerprints) {
      var asn1 = forge.pki.certificateToAsn1(cert);
      var certBytes = forge.asn1.toDer(asn1);
      var md = forge.md.sha256.create();
      var calculated = md.update(certBytes.getBytes()).digest().toHex().toLowerCase();
      // traverse the fingerprints to find a match
      trusted = fingerprints.some(function(fingerprint) {
        return fingerprint.toLowerCase() == calculated;
      });
    }
    if (!trusted) {
      throw {type: 'security', message: 'Received unrecognized runtime certificate'};
    }
    return cert.publicKey;
  }
  return forge.pki.publicKeyFromPem(pubkey);
};

SecureChannel.prototype.init = function(msg, appData) {
  var info = null;
  this.enabled = true;
  this.engine = msg.engine || 'gibberish'; // gibberish is for backward compatibility (just until all FF's update to use forge)

  if ((this.manager.appData(appData).config.ecdh || this.manager.appData(appData).remote_access_runtime) && msg.ecdh) {
    // ECDH key exchange
    this.logger.debug('deriving secret key from ECDH');

    if (!this.manager.appData(appData).remote_access_runtime) {
      // verify ecdh public key signature
      var sigVerificationKey = this.pemToPublicKey(msg, appData);
      var md = forge.md.sha1.create();
      md.update(msg.ecdh, 'utf8');
      this.logger.debug('verifying runtime ECDH key signature');
      if (!sigVerificationKey.verify(md.digest().bytes(), msg.ecdhSig)) {
        throw {type: 'security', message: 'Runtime key verification failed'};
      }
    } else {
      this.logger.debug('skipping runtime ecdh key signature verification, using remote access');
    }
    this.runtimePublicKey = msg.ecdh;
    this.logger.debug('runtime ECDH key signature verified. runtime public key: ' + this.runtimePublicKey);
    if (window.MBOOT !== undefined) {
      var keys = window.MBOOT.Security.secretKeyAndIV(this.runtimePublicKey);
      this.secretKey = keys.key;
      this.secretIV = keys.iv;
    } else {
      // ------ BACKWARD COMPATIBILITY (until App 17)
      var runtimeKey = this.ec.keyFromPublic(this.runtimePublicKey, 'hex').getPublic();
      // derive the secret key
      var sh = this.ecdhKeyPair.derive(runtimeKey);
      // make sure the key is at most 32 bytes long
      this.secretKey = sh.toArray().slice(0, 32);
      // but sometimes the derived secret key is less than 32 bytes, so pad it with 1's
      while (this.secretKey.length < 32) {
        this.secretKey.push(1);
      }
      this.secretIV = this.secretKey.slice(16); // the last 16 bytes are the iv
      // ------ BACKWARD COMPATIBILITY (until App 17)
    }
    this.logger.debug('secret key derived successfully. fingerprints (key/iv): ' + this.fingerprints());
  }
  return info;
};

SecureChannel.prototype.encrypt = function(message) {
  var result = null;
  var start = Date.now();
  if (window.MBOOT !== undefined) {
    result = window.MBOOT.Security.encrypt(this.secretKey, this.secretIV, message);
  } else {
    // ------ BACKWARD COMPATIBILITY (until App 17)
    if (this.engine === 'forge') {
      var cipher = forge.aes.startEncrypting(this.secretKey, this.secretIV);
      cipher.update(forge.util.createBuffer(JSON.stringify(message), 'utf8'));
      cipher.finish();
      result = cipher.output.data;
    } else {
      result = window.GibberishAES.enc(JSON.stringify(message), this.secretKey);
    }
    // ------ BACKWARD COMPATIBILITY (until App 17)
  }

  this.logger.debug('Encryption took '+(Date.now()-start)+'ms');
  return result;
};

SecureChannel.prototype.decrypt = function(message, MBOOT) {
  var result = null;
  var start = Date.now();
  if (MBOOT !== undefined) {
    result = MBOOT.Security.decrypt(this.secretKey, this.secretIV, message);
  } else {
    // ------ BACKWARD COMPATIBILITY (until App 17)
    if (this.engine === 'forge') {
      var cipher = forge.aes.startDecrypting(this.secretKey, this.secretIV);
      cipher.update(forge.util.createBuffer(message));
      cipher.finish();
      result = forge.util.decodeUtf8(cipher.output.data);
    } else {
      result = window.GibberishAES.dec(message, this.secretKey);
    }
  }
  this.logger.debug('Decryption took '+(Date.now()-start)+'ms');
  return JSON.parse(result);
};

////////////////////////////
/**
 * Send and receive messages to the store window for communicating with the relay
 */
function StoreMessenger() {
  this.callbacks = {};

  var self = this;
  window.addEventListener('message', function(evt) {
    if (!evt || !evt.data || !self.callbacks[evt.data.event]) {
      return;
    }
    self.callbacks[evt.data.event].apply(null, evt.data.data);
  });

  // TODO: for ios
  //Capriza.device.ios ? Capriza.Capp.messenger
}

/**
 * send a message to the store window
 */
StoreMessenger.prototype.emit = function(event, data) {
  window.top.postMessage({event: event, data: data}, '*');
  // TODO: for ios
  //Capriza.device.ios ? Capriza.Capp.messenger
};

/**
 * register a listener for the event
 */
StoreMessenger.prototype.on = function(event, cb) {
  this.callbacks[event] = cb;
};

/**
 * unregister a listener for the event
 */
StoreMessenger.prototype.off = function(event, cb) {
  delete this.callbacks[event];
};

////////////////////////////
/**
 * used for communicating with the relay through a connection that the store has already opened
 * for us. We use Capriza.Capp.messenger if running from cordova or native window message passing
 * implemented in StoreMessenger if running from the browser.
 */
function StoreRelayConnector() {
  this._callbacks = {};

  // select how to communicate with the store
  this.messenger = new StoreMessenger();

  var self = this;
  // for compatibility with socket.io 1.0 and engine.io
  this.io = {
    connect: function() {
      self.messenger.emit('relayConnector/io/connect');
    },
    disconnect: function() {
      self.messenger.emit('relayConnector/io/disconnect');
    }
  };
}

/**
 * generate a random hex string for use as an id
 */
StoreRelayConnector.prototype.genid = function() {
  return forge.util.bytesToHex(forge.random.getBytesSync(8));
};

/**
 * register for receiving events originating from the relay connection
 */
StoreRelayConnector.prototype.on = function(event, callback) {
  if (this._callbacks[event] === undefined) {
    this._callbacks[event] = [];
  }
  // every callback gets a unique id to identify it
  // and invoke it when the store tries to call it
  var cbs = this._callbacks[event];
  var cbid = this.genid();
  cbs.push({callback: callback, cbid: cbid});
  // let the store know we want to get notified of the event.
  // the store will emit an event for this callback using the provided cbid
  this.messenger.emit('relayConnector/on', {event: event, cbid: cbid});
  // get notified when the callback needs to be invoked
  this.messenger.on('relayConnector/callback/' + cbid, function() {
    callback.apply(null, arguments);
  });
};

/**
 * unregister from receiving events originating from the relay connection
 */
StoreRelayConnector.prototype.removeListener = function(event, callback) {
  var cbs = this._callbacks[event];
  if (!cbs || cbs.length === 0) {
    return;
  }

  // find the callback id to unregister it
  for (var i = 0; i < cbs.length; ++i) {
    if (cbs[i].callback === callback) {
      var cbid = cbs[i].cbid;
      cbs.splice(i, 1);
      // let the store know we no longer want to get notified on this event
      this.messenger.emit('relayConnector/removeListener', {event: event, cbid: cbid});
      this.messenger.off('relayConnector/callback/' + cbid, callback);
      break;
    }
  }
};

/**
 * send an event to the store to emit an event to the relay
 */
StoreRelayConnector.prototype.emit = function(event, message, ack) {
  var ackid = null;
  if (ack) {
    ackid = this.genid();
  }

  this.messenger.emit('relayConnector/emit', {event: event, message: message, ackid: ackid});

  if (ack) {
    var self = this;
    this.messenger.on('relayConnector/ack/' + ackid, function() {
      self.messenger.off('relayConnector/ack/' + ackid, arguments.callee);
      ack.apply(null, arguments);
    });
  }
};

/**
 * send an event to the store to send a message to the relay
 */
StoreRelayConnector.prototype.send = function(message, ack) {
  var ackid = null;
  if (ack) {
    ackid = this.genid();
  }

  this.messenger.emit('relayConnector/send', {message: message, ackid: ackid});

  if (ack) {
    var self = this;
    this.messenger.on('relayConnector/ack/' + ackid, function() {
      self.messenger.off('relayConnector/ack/' + ackid, arguments.callee);
      ack.apply(null, arguments);
    });
  }
};

StoreRelayConnector.prototype.disconnect = function() {
  this.messenger.emit('relayConnector/disconnect');
};

StoreRelayConnector.prototype.disconnectSync = function() {
  this.messenger.emit('relayConnector/disconnectSync');
};

StoreRelayConnector.prototype.close = function() {
  this.messenger.emit('relayConnector/close');
};

/////////////////////////////

/**
 * open and prepare the connection to the relay
 */
function RelayCom(manager) {
  this.logger = new Log('RelayCom');
  this.manager = manager;
  this.events = new EventEmitter();
  this._readyToRun = false;
  this._connected = false;
  this.socketgd = null;
  this.metadata = null;
  this.capabilities = {supportsSendMessage : false};
  this.relaybusUrl = window.Capriza.relaybusUrl;
  this.relayConnector = Capriza.relayConnector || window._urlParams["relay"];
  if (this.relayConnector === 'false') {
    this.relayConnector = false;
  }
}

RelayCom.prototype.reset = function(readyToRun) {
  this.logger.debug('reset relay connection');
  if (this.socketgd) {
    this.socketgd._shutdown('reset');
  }
  this.socketgd = null;
  this.metadata = null;
  this.cid = forge.util.bytesToHex(forge.random.getBytesSync(10));
  this.readyToRun(readyToRun || false);
  this.connected(false);
};

RelayCom.prototype.connectToBus = function() {
  this.reset();
  if (this.relaybusUrl && this.relaybusUrl.length > 0) {
    this.logger.debug('opening bus connection to ' + this.relaybusUrl);
    this.manager.initWebSockets(this.relaybusUrl);
  } else {
    this.logger.debug('skipping bus connection (relaybusUrl is undefined)');
    this.readyToRun(true);
  }
};

RelayCom.prototype.isReady = function() {
  return this.readyToRun() && this.connected();
};
//
//RelayCom.prototype.whenConnected = function(cb) {
//  if (this.connected()) {
//    cb && cb();
//  } else {
//    this.events.once('connected', cb);
//  }
//};

RelayCom.prototype.readyToRun = function() {
  if (arguments.length === 0) {
    return this._readyToRun;
  }
  this._readyToRun = arguments[0];
};

RelayCom.prototype.connected = function() {
  if (arguments.length === 0) {
    return this._connected;
  }
  this._connected = arguments[0];
  this._connected && this.events.emit('connected');
};

RelayCom.prototype.connect = function(url) {
  // add the path of the relay to the socket.io resource path.
  var socketIoPrefix = '';
  var relayRegex = /\/(relay\.[^/]+)$/;
  var relayPath = relayRegex.exec(url);
  if (relayPath) {
    url = url.replace(relayPath[0], '');
    socketIoPrefix = relayPath[1] + '/';
  }
  var baseUrl = url;
  url = url + '/mobile?cid=' + this.cid;

  var options = {};
  var transports = this.manager.appData() && this.manager.appData().config ? this.manager.appData().config.transports : undefined;
  if (transports) {
    options.transports = transports;
  } else if (window.Capriza.device.android && !window.Capriza.device.chrome) {
    options.transports = ["xhr-polling"];
  }

  var conEngine;
  if (socketIoPrefix === 'relay.bus/') {
    // if we want to connect to the same relay that the store is already connected to
    //if (this.relayConnector && this.relayConnector.indexOf(baseUrl) === 0) {
    //  conEngine = 'store-relay-connector';
    //} else {
    conEngine = 'socket.io-1.1.0';
    //}
  } else {
    conEngine = 'socket.io-0.9.16';
  }

  this.logger.debug('using connection engine ' + conEngine + ' to connect to ' + url);
  if (conEngine === 'store-relay-connector') {
    var sock = new StoreRelayConnector();
    this.io = sock.io;
    this.socketgd = new SocketGD(sock);
    this.socketgd.socket().socket = sock.io; // for backward compatibility with 0.9.16
  } else if (conEngine === 'socket.io-1.1.0') {
    options.path = '/' + socketIoPrefix + 'socket.io';
    options.forceNew = true;
    if (options.transports) {
      options.transports = options.transports.reverse().map(function(e) {
        switch (e) {
          case 'xhr-polling':
            return 'polling';
          default:
            return e;
        }
      });
    }
    this.socketgd = new SocketGD(io(url, options));
    this.socketgd.socket().socket = this.io; // hack for backward compatibility with 0.9.16
  } else {
    options.resource = socketIoPrefix + 'socket.io';
    this.socketgd = new SocketGD(io0916.connect(url, options));
  }

  // start with disabled gd until we get the metadata
  this.socketgd.enable(false);
  return this.socketgd;
};

RelayCom.prototype.disconnect = function() {
  if (this.socketgd) {
    this.logger.debug('disconnecting from relay');
    if (this.socketgd.socket().io) {
      // socket.io 1.1.0
      this.socketgd.socket().io.disconnect();
    } else {
      // socket.io 0.9.16
      this.socketgd.socket().socket.disconnect();
    }
  } else {
    this.logger.warn("Not disconnecting as socketgd is: " + this.socketgd);
  }
};

RelayCom.prototype.reconnect = function() {
  if (this.socketgd) {
    this.logger.debug('reconnecting to relay');
    if (this.socketgd.socket().io) {
      // socket.io 1.1.0
      this.socketgd.socket().io.connect();
    } else {
      // socket.io 0.9.16
      this.socketgd.socket().socket.reconnect();
    }
  } else {
    this.logger.warn("Not reconnect as socketgd is: " + this.socketgd);
  }
};

RelayCom.prototype.on = function(event, callback) {
  this.socketgd.on(event, callback);
};

RelayCom.prototype.removeListener = function(event, callback) {
  this.socketgd.on(event, callback);
};

/////////////////////////////

function ComManager() {
  this.logger = new Log('ComManager');
  this.events = new EventEmitter();
  this.ntpOffset = undefined;
  this.security = new SecureChannel(this);
  this.relay = new RelayCom(this);
  this.reportErrorData = {};
  this.redirecting = false;

  var self = this;
  Object.defineProperty(this, 'scope', {
    set: function scope(windowEx) {
      //self.logger.info('setting scope with '+JSON.stringify(scope));
      window = _.extend(window, windowEx);
    }
  });

  var defaultNotifier = {};
  ["connect", "disconnect", "message", "error", "reconnected", "reconnecting"].forEach(function(type) {
    defaultNotifier[type] = function() {
      self.logger.info("notification: " + type);
    };
  });
  this.registerNotifier(defaultNotifier);
}

ComManager.prototype.registerNotifier = function(notifier) {
  var loggedNotifier = {};
  Object.keys(notifier).forEach(function(key) {
    loggedNotifier[key] = function() {
      var msg = "[WebSocket::in " + key + "] ";
      for (var i = 0, ii = arguments.length; i < ii; i++) {
        msg += "arg" + i + "=" + arguments[i] + "; ";
      }
      notifier[key].apply(this, arguments);
    };
  });
  this.eventsNotifier = loggedNotifier;
};

ComManager.prototype.notify = function(message) {
  this.eventsNotifier.message(message);
};

ComManager.prototype.reset = function(readyToRun) {
  this.logger.debug('reset');
  delete this.transport;
  this.relay.reset(readyToRun);
};

ComManager.prototype.appData = function() {
  if (arguments.length === 0) {
    return window.appData;
  }
  if (!arguments[0]) {
      return window.appData;
  }
  var appData = arguments[0];
  if (appData.success && appData.app_data) {
    this.events.emit('appdata', appData);
  } else {
    this.events.emit('appdata_error', appData.errors);
  }

  return appData;
};

ComManager.prototype.startSession = function(data, cb) {
  this.logger.info('requesting session start for ' + data.appToken);
  window.MBOOT.AppData.fetch(cb);
};

ComManager.prototype.fireConnectToSession = function() {
  if (!this.relay.isReady()) {
    return;
  }

  if (!this.connectMessageSent){
    this.logger.debug('sending CONNECT message');
    var takePostSocketConnect = window.take("postSocketConnect");
    this.syncClocks();
    this.connectionInit();
    takePostSocketConnect("socketConnected");
  } else {
    this.logger.debug('sending CONNECT message with reconnect=true');
    this.sendReConnectMessage();
  }
};

ComManager.prototype.initWebSockets = function(url) {
  var self = this;
  this.relay.url = url || this.relay.url;
  this.logger.debug('initWebSockets started to ' + this.relay.url);
  try {
    url = url || this.runtimeBaseUrl();
    if (this.relay.socketgd) {
      // this is the second time initWebSockets is called.
      // it means that we received the appData and now want to issue the CONNECT message
      this.relay.readyToRun(true);
      if (url.match(/.*[/]relay.bus/)) {
        // we're using the relay bus connection that is already open/opening
        this.logger.debug('using bus connection');
        this.fireConnectToSession();
        return;
      } else {
        // we need to open a new connection to a different relay
        this.logger.debug('not using bus connection - requested url is ' + url + '. closing the bus connection.');
        this.relay.connected(false);
        this.relay.socketgd.disconnect();
        this.relay.socketgd = null;
      }
    }

    var takeSocketInit = window.take("socketInit");
    var socketInitTime = Date.now(), socketConnectingTime, socketConnectedTime;
    var timeOutId = setTimeout(function() {
      self.logger.debug('slow network detected from socket (connecting).');
      window.Dispatcher.trigger('message/slowNetworkMsg');
    }, 4000);
    this.sendHealthCheckForVPN();

    var socketgd = this.relay.connect(url);

    if (window.ntp) {
      window.ntp.init(socketgd);
    }

    // if using socket.io-1.1.0 we do not receive the 'connecting' event
    var takeConnectSocket = window.take("socketConnectingEvent");

    // the 'connecting' event is only in socket.io-0.9.16
    function _onConnecting(name) {
      takeSocketInit && takeSocketInit();
      takeSocketInit = null;
      socketConnectingTime = Date.now();
      var connectingTime = socketConnectingTime - socketInitTime;
      self.logger.debug('socket connecting '+name+' '+connectingTime+' milliseconds from initialization');
      clearTimeout(timeOutId);
      window.Dispatcher.trigger('splash/setTimeout');
      timeOutId = setTimeout(function() {
        self.logger.debug('slow network detected from socket (connect).');
        window.Dispatcher.trigger('message/slowNetworkMsg');
      }, 4000);
      // re-take the connecting event
      takeConnectSocket = window.take("socketConnectingEvent");
      self.eventsNotifier.connecting && self.eventsNotifier.connecting(name);
    }

    function _onConnect() {
      takeSocketInit && takeSocketInit();
      window.take('socketConnectedRuntime');
      takeConnectSocket('socketConnectEvent');
      socketConnectedTime = Date.now();
      var connectedTime = socketConnectedTime - socketInitTime;
      clearTimeout(timeOutId);
      window.Dispatcher.trigger('splash/setTimeout');

      if (window && window.location && window.location.search && window.location.search.indexOf("run_anyway") > -1) {
        self.logger.tag("run_anyway");
      }
      if (Capriza && Capriza.deviceInfo && !Capriza.deviceInfo.browser_supported){
        self.logger.tag("browserNotSupported");
      }
      self.logger.debug('socket connect '+connectedTime+' milliseconds from initialization');
      if (self.relay.socketgd === socketgd) {
        self.relay.connected(true);
        self.fireConnectToSession();
      } else {
        try {
          self.logger('sockets are different. relay.socket: '+JSON.stringify(self.relay.socketgd.socket())+' socket: '+JSON.stringify(socketgd.socket()));
        } catch(ex) {
          console.log('cant print to log the sockets: '+ex);
        }
      }
    }

    function _onMetadata(metadata) {
      self.logger.debug('received relay metadata: ' + JSON.stringify(metadata));
      if (metadata.version == 1) {
        self.relay.metadata = metadata.metadata;
        self.relay.capabilities = metadata.capabilities;
        socketgd.enable(metadata.capabilities.socketgd);
        self.transport = self.relay.metadata && self.relay.metadata.serverName; // emitted as part of the events sent from mobile
      }
    }

    function _onAppData(appData) {
      self.logger.debug('received appData from relay');
      self.appData(JSON.parse(appData));
    }

    function _onSecurity(msg) {
      self.security.useEnvelope = true; // the runtime firefox supports envelopes
      var takeSocketSecurity = window.take("socketSecurity");
      if (msg.status == 'off') {
        self.logger.debug('Secure Channel: off');
        self.logger.tag("secureChannelOff");
        self.security.enabled = false;
      } else if (msg.status == 'error') {
        self.logger.error('Secure Channel: error', undefined, "ComManager");
        pageManager.generateErrorPage({nonFatal: true, reason: 'Secure channel handshake failed. Please run the app again.'});
        self.security.enabled = false;
      } else if (msg.op == 'PUBLICKEY') {
        self.logger.debug('received public key from runtime');
        try {
          // setup secret key
          var securityData = self.security.init(msg);
          if (securityData) {
            // RSA key exchange - need to send the secret key to the runtime
            securityData.op = 'SECRETKEY';
            self.logger.debug('sending secret key');
            self.emitMessage('SECURITY', securityData);
          }
        } catch (err) {
          console.trace();
          self.logger.error('Secure Channel: error - ' + err.message, err, "ComManager");
          if (err.type && err.type == 'security') {
            pageManager.generateErrorPage({nonFatal: true, reason: err.message + ' Secure channel handshake failed.'});
          }
        }
      }
      takeSocketSecurity();
      self.eventsNotifier.security && self.eventsNotifier.security();
      window.Dispatcher.trigger('security/ready');
    }

    function _onMessage(msg) {
      try {
        var message = JSON.parse(msg);
        if (message.name === 'ROUTE') {
          self.handleRouteMessage(message.args);
        } else {
          self.logger.error('cannot handle message type ' + message.name + ': ' + msg, undefined, "ComManager");
        }
      } catch (e) {
        self.logger.error('exception handling message: ' + msg + '. Exception: ' + (e.message || e), e.stack, "ComManager");
        self.eventsNotifier.error(msg);
      }
    }

    function _onRoute(msg) {
      self.handleRouteMessage(msg);
    }

    function _onRejected() {
      window.take("socketRejected");
      self.logger.tag("relayRejected");
      self.logger.debug('socket REJECTED');
      self.eventsNotifier.disconnect("connection rejected");
      socketgd.disconnect();
    }

    function _onReconnect(transport, attempts) {
      window.take("socketReconnect");
      self.logger.tag("relayReconnected");
      self.logger.debug('socket reconnect transport: '+transport+' attempts: '+attempts);
      self.eventsNotifier.reconnect && self.eventsNotifier.reconnect({ transport: transport, attempts: attempts });
    }

    function _onReconnecting(delay, attempts) {
      window.take("socketReconnecting");
      self.logger.tag("relayReconnecting");
      self.logger.debug('reconnecting delay: '+delay+' attempts: '+attempts);
      self.eventsNotifier.reconnecting && self.eventsNotifier.reconnecting({ delay: delay, attempts: attempts });
    }

    function _onReconnectFailed() {
      window.take("socketReconnectFailed");
      self.logger.tag("relayReconnectFailed");
      self.logger.debug('socket reconnect_failed');
      self.eventsNotifier.disconnect("unable to reconnect");
      socketgd.disconnect();
    }

    function _onReconnectError(data) {
      window.take("socketReconnectFailed");
      self.logger.tag("relayReconnectError");
      self.logger.debug('socket reconnect_error: ' + (data && data.message ? data.message : data));
    }

    function _onError(data) {
      window.take("socketError");
      if (!self.connectMessageSent) {
        self.logger.warn('got error before connection established');
      } else {
        self.logger.warn('got error after connection established: ' + (data && data.message ? data.message : data));
      }
      self.logger.tag("socketError");
    }

    function _onDisconnect() {
      self.logger.tag("relayDisconnected");
      self.logger.debug('socket disconnected');
    }

    function _onClose() {
      self.logger.tag("relayClosed");
      self.logger.debug('socket closed');
    }

    socketgd._shutdown = function(reason) {
      self.logger.debug('socket shutdown: ' + reason);
      socketgd.removeListener('connecting', _onConnecting);
      socketgd.removeListener('connect', _onConnect);
      socketgd.removeListener('disconnect', _onDisconnect);
      socketgd.removeListener('close', _onClose);
      socketgd.removeListener('reconnect', _onReconnect);
      socketgd.removeListener('reconnecting', _onReconnecting);
      socketgd.removeListener('reconnect_failed', _onReconnectFailed);
      socketgd.removeListener('reconnect_error', _onReconnectError);
      socketgd.removeListener('error', _onError);
      socketgd.removeListener('message', _onMessage);
      socketgd.removeListener('METADATA', _onMetadata);
      socketgd.removeListener('SECURITY', _onSecurity);
      socketgd.removeListener('APPDATA', _onAppData);
      socketgd.removeListener('ROUTE', _onRoute);
      socketgd.removeListener('REJECTED', _onRejected);
      socketgd.disconnect();
    };

    socketgd.on('connecting', _onConnecting);
    socketgd.on('connect', _onConnect);
    socketgd.on('disconnect', _onDisconnect);
    socketgd.on('close', _onClose);
    socketgd.on('reconnect', _onReconnect);
    socketgd.on('reconnecting', _onReconnecting);
    socketgd.on('reconnect_failed', _onReconnectFailed);
    socketgd.on('reconnect_error', _onReconnectError);
    socketgd.on('error', _onError);
    socketgd.on('message', _onMessage);
    socketgd.on('METADATA', _onMetadata);
    socketgd.on('SECURITY', _onSecurity);
    socketgd.on('APPDATA', _onAppData);
    socketgd.on('ROUTE', _onRoute);
    socketgd.on('REJECTED', _onRejected);
  } catch(e) {
    this.logger.error('exception in initWebSockets: '+ e.message+'. stack: '+e.stack);
    this.eventsNotifier.error(e);
  }

  return socketgd;
};

ComManager.prototype.markOutEncryptedObj = function(obj){
  if (!obj) {
    return;
  }

  obj = JSON.parse(JSON.stringify(obj));
  if (typeof obj === "string" && obj.indexOf("\"encrypt\":true") > -1) {
    obj = "***** encrypted1 *****";
  }

  if (typeof obj === "object") {
    if (obj && obj.encrypt) {
      return "***** encrypted2 *****";
    }

    var keys = Object.keys(obj);

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      obj[k] = this.markOutEncryptedObj(obj[k]);
    }
  }
  return obj;
};

ComManager.prototype.handleRouteMessage = function(msg, MBOOT, eventNotifier) {
  window.take("socketRoute");
  //printing to log only if debug enabled as it is heavy to clean encrypt:true values.
  if (window._urlParams && window._urlParams.debug) {
    //this.logger.debug('socket ROUTE '+JSON.stringify(this.markOutEncryptedObj(msg)));
  }
  var payload = msg.payload ? msg.payload : msg;
  var deliver = false;
  if (this.security.enabled && msg.secure) {
    try {
      payload = this.security.decrypt(payload, MBOOT || window.MBOOT);
      if (!this.security.async) {
        deliver = true;
      }
    } catch (e) {
      console.trace();
      this.logger.tag && this.logger.tag("secureChannelDecryptError");
      this.logger.error('Secure Channel: decryption error - ' + e.message +
          '. mobile public key: ' + this.security.mobilePublicKey +
          ', runtime public key: ' + this.security.runtimePublicKey +
          ', secret key fingerprints (key/iv): ' + this.security.fingerprints(), undefined, "ComManager");
    }
  } else {
    deliver = true;
  }

  try {
    if (deliver){
        eventNotifier ? eventNotifier.message(payload) : this.eventsNotifier.message(payload);
        return payload;
    }
  } catch (e) {
    this.logger.warn('exception handling route message: ' + (e.message || e), e.stack);
    this.eventsNotifier.error(e.message, e);
  }
};

ComManager.prototype.sendHealthCheckForVPN = function() {
  var self = this;
  if (typeof this.appData() !== 'undefined' && this.appData().vpn_access) {
    this.logger.debug('initiating health check');

    setTimeout(function(){

      if (!(Runner.mobileActive || self.appData().identityShow || self.appData().skipVpnError)) {
        window.Dispatcher.trigger('dialog/show', {vpnAlert: true});
      }

    }, 5000);


    $.ajax({
      url: this.runtimeBaseUrl()  + '/health-check/status',
      //                    url: 'http://vm-iwedev-04c.cisco.com/healthCheck',
      type: "get",
      success: function(data, textStatus, XMLHttpRequest) {

        self.appData().skipVpnError = true;
        if (data.toUpperCase() === 'OK') {
          self.logger.debug('its a vpn app and its ok');
        }
        else {
          self.logger.error('got error from healthcheck', undefined, "ComManager");
          self.eventsNotifier.error({vpnAccess: self.appData().vpn_access, reason: 'Healthcheck Fail', data: XMLHttpRequest});
        }

      },
      error: function(xhr, textStatus, errorThrown) {
        self.appData().skipVpnError = true;
        self.logger.error('got error from healthcheck with '+textStatus, undefined, "ComManager");
        self.eventsNotifier.error({vpnAccess: self.appData().vpn_access, reason: 'Healthcheck Fail', data: textStatus});
      },
      timeout: 10000
    });
  }
  else {
    //                this.logger.debug('skipping health check');
  }
};

ComManager.prototype.onEndMessageReceived = function() {
  this.relay.disconnect();
};

ComManager.prototype.send = function(operation, event, options) {
  event.sessionId = this.sessionId();
  this.log("[WebSocket::out " + operation + "] " + JSON.stringify(event));

  if (operation == 'ROUTE') {
    var envelope = event; // for backward compatibility
    if (this.security.useEnvelope) {
      envelope = {
        op: operation,
        sessionId: event.sessionId,
        secure: this.security.enabled,
        payload: event};

      if (this.security.enabled) {
        envelope.payload = this.security.encrypt(event);
      }
    }
    this.sendMessage(operation, envelope, options);
  } else {
    this.emitMessage(operation, event, options);
  }
};

ComManager.prototype.emitMessage = function(op, message, options) {
  var ackCallback = options && options.ackCallback;
  this.relay.socketgd && this.relay.socketgd.emit(op, message, ackCallback);
};

ComManager.prototype.sendMessage = function(op, message, options) {

  if (this.relay.capabilities.supportsSendMessage) {
    var ackCallback = options && options.ackCallback;
    this.relay.socketgd && this.relay.socketgd.send(JSON.stringify({name: op, args: message}), ackCallback);
  } else {
    this.logger.debug('sendMessage emitMessage');
    this.emitMessage(op, message);
  }
};

ComManager.prototype.connectionInit = function(sendMethod) {
  if (sendMethod) this.send = sendMethod; // this should be removed when the mobile implements previewModeSetup differently. Estimated time of deprecation
  var self = this;
  try {
    window.Capriza.getUserSession(function(userSession) {
      self.sendConnectMessage(userSession);
    });
  } catch(e) {
    this.logger.error('exception in connectionInit: '+e+' Stack: '+ e.stack);
    this.eventsNotifier.error(e);
  }
};

ComManager.prototype.sendConnectMessage = function(userSession){
  this.reportErrorData.userSession = userSession;
  this.send(
      'CONNECT',
      { op: 'CONNECT',
        userSession: userSession,
        first: true,
        securable: true,
        serverName: this.runtimeBaseUrl(),
        tablet: window._urlParams["tablet"] || undefined ,
        useSocketgd: true}
  );
  this.eventsNotifier.connect && this.eventsNotifier.connect();
  this.connectMessageSent = true;

  window.Dispatcher.trigger('mobile/connection/established');
};

ComManager.prototype.sendReConnectMessage = function() {
  this.send('CONNECT', {op: 'CONNECT', reconnect: true, securable: true, serverName: this.runtimeBaseUrl(), useSocketgd: true});
  this.eventsNotifier.reconnected && this.eventsNotifier.reconnected();
};

ComManager.prototype.redirect = function(appId) {
  if (this.redirecting || !appId) {
    return;
  }

  var newLocation = this.appData().run_url.toString().replace(/\/ru?n?\/.*/g, appId);
  if (window.location == newLocation) {
    return;
  }

  this.redirecting = true;
  window.location = newLocation;
};

ComManager.prototype.getReportErrorData = function() {
  this.reportErrorData.sessionId = this.sessionId();
  return this.reportErrorData;
};

ComManager.prototype.runtimeBaseUrl = function() {
  return this.appData() ? this.appData().runtime_base_url : null;
};

ComManager.prototype.sessionId = function() {
  return this.appData() ? this.appData().session_id : '';
};

ComManager.prototype.log = function(msg) {
  this.logger.trace(msg);
};

ComManager.prototype.stopSession = function() {
  if (window.devMode) {
    return;
  }

  if (this.sessionId() && this.sessionId() != '') {
    var xhr = new XMLHttpRequest();
    var uri = this.runtimeBaseUrl() + '/stopped/' + this.sessionId();
    xhr.open('GET', uri, false);
    xhr.send(null);
  }
};

ComManager.prototype.syncClocks = function() {
  if (!window.ntp) {
    return;
  }

  var self = this;
  this.logger.info("calling relay NTP sync");
  window.ntp.sync(function() {
    self.ntpOffset = window.ntp.offset();
    self.logger.info("relay NTP sync complete. offset: " + self.ntpOffset);
  }, 10);
};

ComManager.prototype.ntpNow = function() {
  return new Date().getTime() - this.ntpOffset;
};

function initComManager(forgeLib, ellipticLib){
  forge = window.forge || forgeLib || (isInNode() && require('node-forge'));
  ellipticjs = window.ellipticjs || ellipticLib || (isInNode() && require('../../mboot/elliptic-ex-3.0.3'));
  var manager = window.ComManager = new ComManager();

  window.addEventListener('unload', function() {
    manager.stopSession();
  });

  window._sendConnectMessage = function(userSession){
    manager.sendConnectMessage(userSession);
  };

  // connect to the relay bus
  manager.relay.connectToBus();
  return manager;
}

/////////////////////////////

if (isInNode()) {
  window.Logger.debug('Running in background');
  module.exports.init = initComManager;
}
else {
  var manager = initComManager();
  //initRedirect();
  manager.security.initECDH(window.MBOOT);
  window.Logger.debug('Running in foreground');
}

/**
 * Created by guyblank on 5/22/17.
 */
(function(){
    if (_urlParams.rn) {
        window.Capriza = window.Capriza || {};
        var rnFiler = window.Capriza.rnFiler = {};

        rnFiler.readJSON = function (path) {
            Logger.debug('[rnFiler] readJSON ' + path);
            return new Promise(function(resolve, reject){
                Capriza.rnBridge.send('Filer', 'read', path, function(result){
                    Logger.debug('[rnFiler] read result ' + result);
                    resolve(JSON.parse(result));
                }, reject);
            });
        };

        rnFiler.exists = function (path) {
            Logger.debug('[rnFiler] exists ' + path);
            return new Promise(function(resolve, reject){
                Capriza.rnBridge.send('Filer', 'exists', path, resolve, reject);
            });
        };

        rnFiler.write = function (path, blob, mimeType) {
            Logger.debug('[rnFiler] write ' + path);
            return new Promise(function(resolve, reject){
                Capriza.rnBridge.send('Filer', 'write', [path, blob, mimeType], resolve, reject);
            });
        };

        rnFiler.remove = function (path) {
            Logger.debug('[rnFiler] remove ' + path);
            return new Promise(function(resolve, reject){
                Capriza.rnBridge.send('Filer', 'remove', path, resolve, reject);
            });
        };

        rnFiler.read = function (path) {
            Logger.debug('[rnFiler] read ' + path);
            return new Promise(function(resolve, reject){
                Capriza.rnBridge.send('Filer', 'read', path, resolve, reject);
            });
        };

        rnFiler.download = function (url, filePath, onSuccess, onError) {
            Logger.debug('[rnFiler] download ' + url);
            Capriza.rnBridge.send('Filer', 'download', [url, filePath], onSuccess, onError);
        };

        var detectGoogleMaps = /(google.com\/maps|maps.google.com)/;
        document.addEventListener("rnBridgeReady", onReady, false);

        function onReady() {

            var extractFilename = function(path){
                var lastSlash = path.lastIndexOf('/');
                if(lastSlash === -1){
                    return path;
                }
                return path.substring(lastSlash + 1);
            };

            var extractExtension = function (filename) {
                filename = extractFilename(filename);
                var extension = filename.split(".");
                if (extension.length === 1 || ( extension[0] === "" && extension.length === 2 )) {
                    return "";
                }
                return extension.pop();
            };

            Utils.Links.openExternal = function (url, filename) {
                var isFile;
                if (filename) {
                    isFile = true;
                } else if (filename === undefined){
                    var extension = extractExtension(url).toLowerCase();
                    isFile = extension && extension.indexOf("htm") == -1 && extension.indexOf("html") == -1 && !detectGoogleMaps.test(url);
                }

                if (isFile) {
                    fileOpener(url, filename)
                } else {
                    webViewOpener(url)
                }
            };

            function normalizeGoogleMaps(url) {
                url = url.replace('embed/v1/place', 'preview/');
                url = url.replace('output=embed', "output=preview");

                return url;
            }

            function fileOpener(url, filename) {
                Utils.showLoading("Download in Progress...");

                if (!filename) {
                    filename = extractFilename(url);
                }

                filename = filename.replace(/\s/g, "_");

                var extension=filename.slice(filename.indexOf("."));
                var extensionLower = extension.toLowerCase();
                filename = filename.replace(extension, extensionLower);

                rnFiler.download(url, filename, function (result) {
                    Logger.debug('[rnFiler] on download success ' + result);
                    Capriza.rnBridge.send('Filer', 'open', result, debugCallback, debugCallback);
                    setTimeout(function(){
                        Utils.hideLoading();
                    }, 100);

                }, _.bind(Utils.showMessage, this, "Download Failed"));

            }

            function webViewOpener(url) {
                if (detectGoogleMaps.test(url)) {
                    url = normalizeGoogleMaps(url);
                }

                if (Capriza.device.ios) {
                    Capriza.rnBridge.send("CaprizaExtensions", "webviewOpener", url);
                } else {
                    if (Capriza.rnBridge) {
                        Capriza.rnBridge.send("CaprizaExtensions", "webviewOpener", url);
                    } else {
                        window.open(url, '_blank', 'location=yes');
                    }
                }

            }

        }
    }

})();
/**
 * Created by guyblank on 3/9/17.
 */
(function(){
    var resolveOnReady;
    var promiseChain = new Promise(function(resolve){
            resolveOnReady = resolve;
    });

    var webviewReadyCounter = 0;

    var promises = {};
    var callbacks = {};

    var currentWindow = window;

    var availableServices = {
        "messenger._handleEvent": function(sender, event, data) {
            currentWindow.Capriza.Capp.messenger._handleEvent(sender, event, data);
        }
    };

   var init = function() {
       if (!Capriza.device.ios) {
           currentWindow = top;
           resolveOnReady();
           document.dispatchEvent(new Event("rnBridgeReady"));
       }
       else {
           document.addEventListener('webviewReady', function(){
               logger.debug('rnBridge webviewReady triggered ' + webviewReadyCounter);
               if (webviewReadyCounter === 0) {
                   webviewReadyCounter++;
                   resolveOnReady();
                   document.dispatchEvent(new Event("rnBridgeReady"));
               }
           });
       }


       Capriza.rnBridge = {
           send: function(targetHandler, targetFunc, data, success, error) {
               logger.debug("rnBridge send message " + targetFunc);
               success = success || function(){};
               error = error || function () {};

               var msgObj = {
                   targetHandler: targetHandler,
                   targetFunc: targetFunc,
                   data: data || {},
                   timestamp: Date.now()
               };
               var msg = JSON.stringify(msgObj);

               promiseChain = promiseChain.then(function () {
                   return new Promise(function (resolve, reject) {
                       logger.debug("rnBridge sending message " + msgObj.targetFunc);
                       currentWindow.postMessage(msg);
                       promises[msgObj.timestamp] = resolve;
                       callbacks[msgObj.timestamp] = {
                           onsuccess: success,
                           onerror: error
                       };
                   })
               }).catch(function (e) {
                   logger.debug('rnBridge send failed ' + e.message);
               });
           }
       };

       currentWindow.document.addEventListener('message', function(e) {
           logger.debug("rnBridge message received in zapp");

           var message;
           try {
               message = JSON.parse(e.data)
           }
           catch(err) {
               logger.error("failed to parse message from react-native " + err);
               return;
           }

           //resolve promises
           if (promises[message.timestamp]) {
               promises[message.timestamp]();
               delete promises[message.timestamp];
           }

           //resolve promises
           if (message.args && callbacks[message.timestamp]) {
               if (message.success) {
                   callbacks[message.timestamp].onsuccess.apply(null, message.args);
               }
               else {
                   callbacks[message.timestamp].onerror.apply(null, message.args);
               }
               delete callbacks[message.timestamp];
           }

           // responding to requst from native
           if (availableServices[message.request]) {
               availableServices[message.request].apply(null, message.args);
           }

       });
   };

    if (_urlParams.rn) {
        init();
    }

}());







/*
 * Capriza JavaScript API for uApp execution on mobile devices
 */

(function(){
    
/**
 * This object represents the Capriza API itself, it provides a global namespace for accessing
 * information about the state of the API.
 */
window.Capriza = window.Capriza || {};
window.Utils = window.Utils || {};
window.Utils.caprizaMode = (navigator.userAgent.toLowerCase().match(/capriza/)) ? "ShellMode" : "browser";




/** 
 * Execute a Capriza command by sending it to the native side as an AJAX call.
 * Arguments may be in one of two formats:
 *
 * FORMAT ONE (preferable)
 * The native side will call success callback or failure callback, depending upon the 
 * result of the action.
 *
 * @param {Function} success    The success callback
 * @param {Function} fail       The fail callback
 * @param {String} action       The name of the action to use
 * @param {String[]} [args]     Zero or more arguments to pass to the method
 *      
 * FORMAT TWO
 * @param {String} command    Command to be run in Capriza, e.g.
 *                            "Capriza.getUserSession()"
 * @param {String[]} [args]   Zero or more arguments to pass to the method
 *                            object parameters are passed as an array object
 *                            [object1, object2] each object will be passed as
 *                            JSON strings 
 */
function apiExec() {
    
    var successCallback, failCallback, action, json, successCallbackName;
    var callbackId = null;
    if (arguments[2] || arguments[3]){ //} typeof arguments[0] !== "string") {
        // FORMAT ONE
        successCallback = arguments[0];
        failCallback = arguments[1];
        action = arguments[2];
        json = arguments[3];
    } else {
        // FORMAT TWO
        action = arguments[0];
        json=arguments[1];
    }

    var command = {
        successCB: typeof successCallback == "string" ? successCallback : getFunctionName(successCallback),
        failCB: typeof failCallback == "string" ? failCallback : getFunctionName(failCallback),
        methodName: action,
        json: json
    };

    // send the call to the native side
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open('POST', location.protocol + '//' + location.host + '/__caprizaIOSNativeCall__', true);
    xmlHttpReq.send(JSON.stringify(command));
}

Capriza.webApi = (function() {
    var emptyFunc = function() {};
    var implFunc = function(action, args) {
        window.parent.postMessage({ type: "webApi", action: action, args: args }, "*");
    };
    if (window != window.parent) {
        window.addEventListener("message", function(e) {
            if (e.data && e.data.type === "webApi") {
                Capriza[e.data.action](e.data.args);
            }
        }, false);
        return implFunc;
    } else {
        return emptyFunc;
    }
})();


function getFunctionName(func) {
    if (typeof func == "function" || typeof func == "object") {
        var fName = (""+func).match(/function\s*([\w\$]*)\s*\(/);
        if (fName !== null) {
            return fName[1];
        }
    }
}

/*
 * Capriza uApp API decleration
 */

if(window.Utils.caprizaMode == 'ShellMode'){
    Capriza.getUserSession = function(scb, fcb) {
        apiExec(scb, fcb, 'getUserSession', null);
    };

    Capriza.getIdentity = function(scb, event) {
        apiExec(scb, undefined,'getIdentity', event);
    };

    Capriza.showBackButton = function() {
        apiExec('showBackButton', null);
    };

    Capriza.hideBackButton = function() {
        apiExec('hideBackButton', null);
    };

    Capriza.onbackclick = function() {
        pageManager.onBackClick();
    };

    Capriza.getReportErrorData = function() {
        return JSON.stringify(ComManager.getReportErrorData());
    };

    Capriza.contactDetails = function(details) {
        apiExec('contactDetails', details);
    };
    Capriza.fileUpload = function(scb, details) {
        apiExec(scb, undefined, 'fileUpload', details);
    };
    Capriza.onMobileActive = function() {
        apiExec('onMobileActive', null);
        Dispatcher.trigger("mobile/active");
    };
    Capriza.startListen = function() {
        Capriza.listen = true;
    };
    Capriza.showLoadingMsg = function(isClient) {
        if (!isClient) {
            apiExec("showLoadingMsg", null);
        }
    };
    Capriza.hideLoadingMsg = function() {
        apiExec("hideLoadingMsg", null);
    };

    Capriza.newPage = function(page) {
        if (Capriza.listen) {
            apiExec("newPage", page);
        }
    };
    Capriza.triggerEvent = function(event) {
        pageManager.triggerEvent(event);
    };
    Capriza.updateControls = function(data) {
        if (Capriza.listen) {
            apiExec("updateControls", data);
        }
    };
    Capriza.moreItems = function(data) {
        if (Capriza.listen) {
            apiExec("moreItems", data);
        }
    };
    Capriza.contextNotFound = function(data) {
        if (Capriza.listen) {
            apiExec("contextNotFound", data);
        }
    };
    Capriza.pageUpdate = function(data) {
        if (Capriza.listen) {
            apiExec("pageUpdate", data);
        }
    };
}else {
    Capriza.getUserSession = function(scb, fcb) {
        scb({userAgent: navigator.userAgent});
    };

    Capriza.getIdentity = function(scb, event) {
        scb({});
    };

    Capriza.showBackButton = function() {
        Capriza.webApi("showBackButton");
        Dispatcher.trigger("backButton/show");
    };

    Capriza.hideBackButton = function() {
        Capriza.webApi("hideBackButton");
        Dispatcher.trigger("backButton/hide");
    };

    Capriza.onbackclick = function() {
        pageManager.onBackClick();
    };

    Capriza.contactDetails = function(details) {
        alert("The following details will be added to the Contact:\n" + Object.keys(details).map(function (key) { return details[key] ? details[key] + "\n" : ""; }).join(""));
    };
    Capriza.fileUpload = function(scb, details) {
        var cb = (typeof scb == "string" ? window[scb] : scb);
        cb({url: ""});
    };
    Capriza.onMobileActive = function() {
        Capriza.webApi('onMobileActive');
        Dispatcher.trigger("mobile/active");
    };
    Capriza.showLoadingMsg = function(isClient) {
        Capriza.webApi("showLoadingMsg", isClient);
    };
    Capriza.hideLoadingMsg = function() {
        Capriza.webApi("hideLoadingMsg");
    };
    Capriza.newPage = function() {};
    Capriza.updateControls = function() {};
    Capriza.moreItems = function() {};
    Capriza.contextNotFound = function() {};
    Capriza.pageUpdate = function() {};

    Capriza.webApi("mobileLoaded");
}

}());

(function () {
    if (_urlParams.cordova) {
        window.Capriza = $.extend(window.Capriza, {cordova: _urlParams.cordova})
    }

    if (!(Capriza.cordovaPhase > 0 && Capriza.cordova)) return;


    init();


    function init() {
        document.addEventListener("deviceready", onDeviceReady, false);
        window.Capriza.Capp = window.Capriza.Capp || {};

        windowHooks();


    }

    function onDeviceReady() {

        navigator.splashscreen.hide();


        document.addEventListener("resume", onResume, false);
        document.addEventListener("pause", onPause, false);


        //Cordova 2.7 old wrapper support
        if (!Capriza.cordova) {
            legacySupport();
        }


//        supported by both 2.7 & 3.x
        initBarcodeScanner();
        externalUrlHandler();
        handleNexus5();

        Dispatcher && Dispatcher.trigger("capp/pluginready");
    }

	var timeout;
    function onPause() {

        if (!window._urlParams.offline && Capriza.device.ios) {
            ComManager.relay.disconnect();
        }

	    var userId = window.appData && window.appData.user_id;
	    var pcTimeout = SharedUtils.loadPasscodeTimeout(userId);

	    if (semver.gte(Capriza.cordova, '12.0.0') && SharedUtils.isNumeric(pcTimeout)){
		    timeout = setTimeout(passcodeHandler, pcTimeout);
	    } else {
		    passcodeHandler()
	    }
    }

    function onResume() {
        if (!window._urlParams.offline && Capriza.device.ios) {
            ComManager.relay.reconnect();
        }

	    clearTimeout(timeout);
    }


    function normalizeGoogleMaps(url) {
        url = url.replace('embed/v1/place', 'preview/');
        url = url.replace('output=embed', "output=preview");

        return url;
    }

    function externalUrlHandler() {
        function webViewOpener(url) {
            if (!url) return;
            if (Capriza.device.ios) {
                window.open(url, '_blank', 'location=no,EnableViewportScale=yes,allowInlineMediaPlayback=yes,transitionstyle=fliphorizontal,toolbar=yes');
            } else {
                if (Capriza.Capp.inAppBrowser) {
                    Capriza.Capp.inAppBrowser.open(url)
                } else {
                    window.open(url, '_blank', 'location=yes');
                }
            }

        }

        var detectGoogleMaps = /(google.com\/maps|maps.google.com)/;

        if (Capriza.device.ios) {
            Utils.Links.openExternal = function (url) {

                if (detectGoogleMaps.test(url)) {
                    url = normalizeGoogleMaps(url);
                }

                webViewOpener(url)
            }
        }
        else if (Capriza.device.android) {
            Utils.Links.openExternal = function (url) {
                if (detectGoogleMaps.test(url)) {
                    url = normalizeGoogleMaps(url);
                    webViewOpener(url);
                } else {
                    window.open(url, '_system', 'location=yes');
                }


            }

        }

    }

    function windowHooks() {
        window.shouldRotateToOrientation = function (orientation) {
            return orientation != 180;
        };

        window.handleOpenURL = function (url) {
            console.log("handle open url: " + url);

            function handleQuickLogin(url) {
                // Remove the app url scheme
                url = url.replace('cprzstore://', '');

                // Fix the url if it's malformed
                // This seems to happen only on iOS
                url = url.replace('https//', 'https://');
                window.location.href = url;
            }

            function handleDeepLink(url) {

                var deepLinkRegex = /url=(.*$)/i;
                var deepLinkMatch = deepLinkRegex.exec(url);
                if (deepLinkMatch) {

                    var deepLink = deepLinkMatch[1];

//                security check
                    var link = document.createElement("a");
                    link.href = deepLink;
                    var caprizaHost = /capriza.com$/;
                    var isSecureRedirect = caprizaHost.test(link.hostname);

                    if (isSecureRedirect) {
                        deepLink += location.search;
                        window.location = deepLink;
                    }
                }

            }

            if (url.indexOf("zapp?") > -1) {
                handleDeepLink(url);
            } else {
                handleQuickLogin(url)
            }
        };
    }

    function legacySupport() {
        function initPhonegapPlugins() {

            var pluginsScript = document.createElement('script');
            var pluginsBaseUrl = Capriza.baseUrl;

            if (window.devMode) {
                pluginsBaseUrl = 'vendor/phonegap/plugins/';
                if (Capriza.device.ios) {
                    pluginsBaseUrl += 'ios/output/';
                }
                else if (Capriza.device.android) {
                    pluginsBaseUrl += 'android/output/';
                }
            } else {
                pluginsBaseUrl = Capriza.baseUrl + "/javascripts/";
            }


            if (Capriza.device.ios) {
                pluginsScript.src = pluginsBaseUrl + "cordova.plugins.ios.js";

            } else if (Capriza.device.android) {

                pluginsScript.src = pluginsBaseUrl + "cordova.plugins.android.js";
            }

            Logger.debug('appending phonegap plugins');
            document.head.appendChild(pluginsScript);
            window.pluginsScript = pluginsScript;
            window.pluginsBaseUrl = pluginsBaseUrl;

            $(function () {
                document.head.appendChild(pluginsScript);
            });

        }

        // Adjust status bar for iOS7
        function adjustStatusBar() {
            if (/ip(hone|od|ad).*(7_[\d]_[\d])/i.test(navigator.userAgent) || navigator.userAgent.match(/(iPad|iPhone|iPod);.*CPU.*OS 7_\d/i)) {
                $(function () {

                    // Adjust views for status bar overlap via css
                    var statusBarHeight = 20;
                    $('html').css('margin-top', statusBarHeight + 'px');

                    // Explicitly set the viewport height to allow UIWebView
                    // to scroll automatically when the keyboard is up
                    // and adjust it on orientation change
                    var setBodyHeight = function () {

                        // Fetch the existing body height tag or create a new one
                        $("meta[id=body-height]").remove();
                        var $viewport = $("<meta>", {name: "viewport", id: "body-height"});

                        // Set the viewport's content to the correct device orientation
                        switch (window.orientation) {
                            case 0: //portrait
                                $viewport.attr('content', 'height=device-height');
                                break;
                            case 90:
                            case -90: //landscape
                                $viewport.attr('content', 'height=device-width');
                                break;
                            default:
                                $viewport.attr('content', 'height=device-height');
                                break;
                        }

                        // Add the new meta tag to the head
                        $('head').append($viewport);

                        // Reflow the content so it scrolls normally
                        Capriza.reflow();
                    };

                    $(window).on('orientationchange', setBodyHeight); // Call it on resize
                    setBodyHeight(); // Call it now

                    // Older Solution
//                $('header').css('top', '20px');
//                $('#identity-page').css('padding-top', '64px');
//                $('#tools-page').css('top', '20px');

//                // Old Solution
//                var $body = $("body");
//                $body.css('margin-top', '20px');
//                $body.css('height', $body.height() - 20);

                });
            }
        }

        function initLegacyBarcodeScanner() {
            Logger.debug('Legacy barcode scanner called');
            var scannerPlugin;

            if (Capriza.device.ios) {
                scannerPlugin = 'ZbarcodeScanner';
            } else {
                scannerPlugin = 'barcodeScanner';
            }

            $(document).on('click', '.context-page.active [data-barcode-scan]', function (e) {
                var resultSelector = $(e.currentTarget).attr('data-barcode-scan');


                if ($(e.currentTarget).attr('disabled') || $(e.currentTarget).prop('disabled')) {
                    return false;
                }

                var $resultEl = $('#' + resultSelector).find('input,textarea');


                window.plugins[scannerPlugin].scan(function (result) {

                        if (!result.cancelled) {
                            $resultEl.val(result.text);
                        }
                    }, function (error) {
                        alert("Scanning failed: " + error);
                    }
                );

                return false;
            });


            $(document).on('click', '.context-page.active .barcode-wrap', function (e) {
                $(e.currentTarget).find('[data-barcode-scan]').click.apply(this, arguments);
            });


        }

        initBarcodeScanner = initLegacyBarcodeScanner;

        initPhonegapPlugins();
        adjustStatusBar();


    }


    function initBarcodeScanner() {
        Logger.debug('initBarcodeScanner called');
        var scannerPlugin;

        if (Capriza.device.ios) {
            scannerPlugin = 'zbarScanner';
        } else {
            scannerPlugin = 'barcodeScanner';
        }

        $(document).on('click', '.context-page.active [data-barcode-scan]', function (e) {
            var resultSelector = $(e.currentTarget).attr('data-barcode-scan');


            if ($(e.currentTarget).attr('disabled') || $(e.currentTarget).prop('disabled')) {
                return false;
            }

            var $resultEl = $('#' + resultSelector).find('input,textarea');


            cordova.plugins[scannerPlugin].scan(function (result) {

                    if (!result.cancelled) {
                        $resultEl.val(result.text);
                    }
                }, function (error) {
                    alert("Scanning failed: " + error);
                }
            );

            return false;
        });


        $(document).on('click', '.context-page.active .barcode-wrap', function (e) {
            $(e.currentTarget).find('[data-barcode-scan]').click.apply(this, arguments);
        });


    }

    function passcodeHandler() {
        var userId = SharedUtils.readCookie('userId');

        if (userId) {
            var passcode = SharedUtils.readCookie(userId + "_passcode");

            if (passcode) {
                Dispatcher.trigger("passcode/show");
            }
        }
    }

    function handleNexus5() {
        if (window.device.model === "Nexus 5") {
            logger.debug('handling nexus 5 font issues');

            $('.viewport').addClass('nexus-5');
        }
    }

})();
(function () {

    if (!(Capriza.cordovaPhase > 0 && window.Capriza.Capp)) return;

    if (semver.lt(Capriza.cordova, "3.4.6")) return;

    var localFilesystem = "cdvfile://localhost/persistent/Capriza";
    window.Capriza.Capp.filer = {
        localFilesystem: localFilesystem,
        extractExtension: function (filename) {
            filename = GapFile.extractFilename(filename);
            var extension = filename.split(".");
            if (extension.length === 1 || ( extension[0] === "" && extension.length === 2 )) {
                return "";
            }
            return extension.pop();
        }
    };
    var filer = window.Capriza.Capp.filer;
    var detectGoogleMaps = /(google.com\/maps|maps.google.com)/;
    document.addEventListener("deviceready", onReady, false);

    function onReady() {

        Utils.Links.openExternal = function (url, filename) {
            var isFile;
            if (filename) {
                isFile = true;
            } else if (filename == undefined){
                var extension = filer.extractExtension(url).toLowerCase();
                isFile = extension && extension.indexOf("htm") == -1 && extension.indexOf("html") == -1 && !detectGoogleMaps.test(url);
            }

            if (isFile) {
                fileOpener(url, filename)
            } else {
                webViewOpener(url)
            }
        };

        function normalizeGoogleMaps(url) {
            url = url.replace('embed/v1/place', 'preview/');
            url = url.replace('output=embed', "output=preview");

            return url;
        }

        function fileOpener(url, filename) {
            Utils.showLoading("Download in Progress...");

            if (!filename) {
                filename = GapFile.extractFilename(url);
            }

            filename = filename.replace(/\s/g, "_");

            var extension=filename.slice(filename.indexOf("."));
            var extensionLower = extension.toLowerCase();
            filename = filename.replace(extension, extensionLower);


            var filePath = localFilesystem + "/" + filename;
            var fileTransfer = new FileTransfer();

            fileTransfer.download(url, filePath, function (fileEntry) {
                FileViewerPlugin.view({
                    url: fileEntry.nativeURL,
                    action: FileViewerPlugin.ACTION_VIEW
                }, debugCallback, debugCallback);
                setTimeout(function () {
                    Utils.hideLoading();
                }, 100);


            }, _.bind(Utils.showMessage, this, "Download Failed"));

        }

        function webViewOpener(url) {


            if (detectGoogleMaps.test(url)) {
                url = normalizeGoogleMaps(url);
            }

            if (Capriza.device.ios) {

                window.open(url, '_blank', 'location=no,EnableViewportScale=yes,allowInlineMediaPlayback=yes,transitionstyle=fliphorizontal,toolbar=yes');
            } else {
                if (Capriza.Capp.inAppBrowser) {
                    Capriza.Capp.inAppBrowser.open(url)
                } else {
                    window.open(url, '_blank', 'location=yes');
                }
            }


        }

        Dispatcher && Dispatcher.trigger("capp/pluginready");
    }


})();

(function () {

    if (!(Capriza.cordovaPhase > 0 && Capriza.cordova)) return;

    function onReady() {
        if (Capriza.cordova && semver.gte(Capriza.cordova, "3.7.0") || typeof Capriza.Capp.barcodeScanner !== "undefined") return;

        if (Capriza.device.ios) {
            Capriza.Capp.barcodeScanner = cordova.plugins.zbarScanner;
        } else {
            Capriza.Capp.barcodeScanner = cordova.plugins.barcodeScanner;
        }

        Dispatcher && Dispatcher.trigger("capp/pluginready");
    }

    document.addEventListener("deviceready", onReady, false);
})();
;
(function () {
    if (!Capriza.isPhonegap) return;

    function intervalListener(conditionalFunction) {
        var interval = setInterval(function () {
            var shouldClear = conditionalFunction.apply(this, arguments);


            if (shouldClear) {
                clearInterval(interval);
            }
        }, 500);
    }

    function onDeviceReady() {
        if (_urlParams.cordova) {
            legacyAdapter();
        }

    }

    var isIos7 = /ip(hone|od|ad).* 7/i.test(navigator.userAgent);

//            Support for legacy 2.7.0 phonegap wrapper
    function legacyAdapter() {
//              map barcode legacy barcode scanner to new one
        function functionMapper() {
            var interval = setInterval(function () {
                var shouldClear = false;

                if (cordova.plugins) {
                    window.plugins = $.extend(window.plugins, {});

                    if (Capriza.device.android) {
                        if (cordova.plugins.barcodeScanner && window.plugins.barcodeScanner) {
                            window.plugins.barcodeScanner = cordova.plugins.barcodeScanner;
                            shouldClear = true;
                        }

                    } else if (Capriza.device.ios) {
                        if (typeof window.cloudSky !== "undefined") {
                            window.plugins.ZbarcodeScanner =cloudSky.zBar.scan.bind(this,{});
                            shouldClear = true;
                        }
                        else if (cordova.plugins.zbarScanner && window.plugins.ZbarcodeScanner) {
                            window.plugins.ZbarcodeScanner = cordova.plugins.zbarScanner;

                            shouldClear = true;
                        }

                    }

                    Dispatcher && Dispatcher.trigger("capp/pluginready");
                }


                if (shouldClear) {
                    clearInterval(interval);
                }
            }, 500);

        }

        if (isIos7) {
            intervalListener(function () {
                if ($('.viewport').hasClass("status-bar-overlap")) {
                    $('.viewport').removeClass("status-bar-overlap");
                    console.log("status bar listener hit");
                    normalizeViewport();
                    $(window).on('orientationchange', normalizeViewport); // Call it on resize
                    return true;
                }

                return false;
            })
        }


        functionMapper();
    }


    function normalizeViewport() {
        $("head").append('<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0,maximum-scale=1.0">');
    }

    document.addEventListener("deviceready", onDeviceReady, false);


})();
;
(function () {
    "use strict";
    if (Capriza.cordova || Capriza.isPhonegap) {
        window.Capriza.Capp = window.Capriza.Capp || {};

    }
    try {
        window.CappModule = augment.defclass({
            constructor: function (name, minVersion, options) {
                var _this = this;
                this._name = name;
                this._minVersion = minVersion;

                options = augment.extend({
                    pluginName: "",
                    deviceReady: noop,
                    fallback: noop,
                    customInit: noop
                }, options);

                this._pluginName = options.pluginName;
                this._deviceReady = options.deviceReady;
                this._fallback = options.fallback;
                this._customInit = options.customInit;

                var cappVersion = Capriza.cordova;
                if (!cappVersion) {
                    cappVersion = "2.7.0";
                }
                if (Capriza.Capp && semver.gte(cappVersion, this._minVersion)) {
                    document.addEventListener("deviceready", function () {
                        var module = {_cappModule: _this};
                        if (_this._pluginName) {
                            var parentPlugin = new Function("return " + _this._pluginName)();
                            if (parentPlugin) {
                                module = augment.extend(parentPlugin, module);
                            } else {
                                _this._fallback();
                            }
                        }
                        Capriza.Capp[_this._name] = module;
                        _this._deviceReady.apply(this, Array.prototype.concat.call(arguments, module));
                        _this._customInit.apply(this, Array.prototype.concat.call(arguments, module));

                        Dispatcher && Dispatcher.trigger("capp/pluginready");
                    }, false);
                }
                else {
                    _this._fallback();
                }

                function noop() {

                }
            }

        });
    }
    catch (e) {
        logger.error("CappModule Error", e, "CappModule");
    }


})
();
(function () {
    logger.log('messenger start');
    new CappModule("messenger", "3.6.0", {deviceReady: onReady, customInit: customInit});

    function customInit(event, messenger) {
        messenger.registerView("zapp");
        messenger.emit("zapp/show");

//        notify views of zapp unload
        window.addEventListener("unload", function () {
            messenger.emit("unload");
        }, false)

    }

    var _viewName;

    var events = {};

    function checkRegistration() {
        if (!_viewName) {
            throw new Error("Must register view first");
        }
    }


    function onReady(event, messenger) {
        var exec;
        if (window.cordova) {
            var CaprizaExtensions = cordova.require("com.capriza.extensions.CaprizaExtensions");
            exec = cordova.require("cordova/exec");
        }
        else {
            exec = function(success, error, targetHandler, targetFunc, data) {
                Capriza.rnBridge.send(targetHandler, targetFunc, data, success, error);
            }
        }

        messenger.registerView = function (name) {
            _viewName = name;
        };
        messenger.emit = function (event, data, success, error) {
            checkRegistration();
            data = data || {};
            data = JSON.stringify(data);
            exec(success, error, "CaprizaExtensions", "messengerEmit", [_viewName, event, data]);
        };

        messenger.on = function (event, callback) {
            checkRegistration();
            events[event] = callback;
        };
        messenger.off = function (event) {
            checkRegistration();
            delete events[event];
        };

        messenger.ignoreSelf = true;

        messenger._handleEvent = function _handleEvent(sender, event, data) {
            logger.info("handling webview event - " + event + " from " + sender);

            if ((!events[event]) || (messenger.ignoreSelf && sender == _viewName)) {
                return;
            }
            data = data || "{}";
            data = JSON.parse(data);
            events[event](data, sender)

        };

    }

    if (_urlParams.rn) {
        logger.log('messenger Capp ' + Capriza.Capp);

        (Capriza.Capp || (Capriza.Capp = {}) && (Capriza.Capp.messenger = {}));

        onReady(null, Capriza.Capp.messenger);

        customInit(null, Capriza.Capp.messenger);
    }



})();
(function () {

    new CappModule("zappView", "3.6.0", {customInit: customInit});

    function customInit(event, zappView) {
        if (Capriza.device.ios && Capriza.cordova && semver.lt(Capriza.cordova, '3.7.0')) {
            var iframe = document.createElement("IFRAME");
            document.documentElement.appendChild(iframe);
            window.requestAnimationFrame(function(){
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            });
        }

	    if (Capriza.splashing) {
		    Dispatcher.on("mobile/active identity/show login/show confirmation/show mobile/error mobile/splash/hidden", function() {
			    Dispatcher.trigger("splash/hide");
		    });
	    }
	    else {
		    Dispatcher.trigger("splash/hide");
	    }

        function closeApp(opts){
            Logger.debug('closing app view with opts = ' + JSON.stringify(opts || {}));
            Capriza.Capp.messenger.emit('zapp/close', {isTimeout: closeDueToTimeout});
            if(!opts || !opts.background) {
                window.ComManager.stopSession(); // disconnect the session
            }
        }


        function onDeviceOrBridgeReady() {
            Capriza.Capp.messenger.off('zapp/restart');
            Capriza.Capp.messenger.on('zapp/restart', function () {
                Utils.reload()
            });

            Capriza.Capp.messenger.on('store/showUnimessage', function (opts) {
                window.Utils && window.Utils.showUnimessage && Utils.showUnimessage(opts, opts.isBlocking, opts.isAllowedInMvp);
            });
        };

        document.addEventListener('deviceready', onDeviceOrBridgeReady);

        document.addEventListener('rnBridgeReady', onDeviceOrBridgeReady);

        var closeDueToTimeout = false;
        function closeIfPossible(opts){
            closeDueToTimeout = closeDueToTimeout || opts && opts.Timeout || false;
            if(opts && opts.background) {
                closeApp(opts);
            }
            else {
                isPasscodeUp ? Dispatcher.on('passcode/hide', closeApp) : closeApp(opts);
            }
        }

        Dispatcher.off('app/close');
        Dispatcher.on('app/close', closeIfPossible);
        //Seems zappView.hide is not used
        zappView && (zappView.hide = closeIfPossible);

        var isPasscodeUp = false;
        Dispatcher.on('passcode/show', function(){isPasscodeUp = true});
        Dispatcher.on('passcode/hide', function(){isPasscodeUp = false});

        document.addEventListener('pause', function() {
            Capriza.Capp.messenger.emit('zapp/pause');
        }, false);

        document.addEventListener('resume', function() {
            Capriza.Capp.messenger.emit('zapp/resume');
        }, false);

        Dispatcher.on('saveXkcd', function(xkcd){
            Capriza.Capp.messenger.emit('saveXkcd', xkcd);
        });
    }

    if (_urlParams.rn) {
        customInit();
    }

})();

(function(){
	new CappModule("Connectivity", "3.6.0", {deviceReady: onReady});

	function onReady(){
		if (semver.gte(_urlParams.cordova, "9.0.0")) return;

		if (Capriza.Connection.updateOnlineStatus){
			Capriza.Connection.updateOnlineStatus = function(){};
		}

		var ref;
		Capriza.Capp.messenger.on('sharedComponent/show', function(data){
			ref = window.open(data.url, '_blank', data.inAppBrowserArgs);
			ref.addEventListener('loadstop', function() {
				Logger.debug('Shared Component - showing ' + data.name + ' component');
				ref.show();
			});
		});

		Capriza.Capp.messenger.on('sharedComponent/hide', function(data){
			Logger.debug('Shared Component - hiding ' + data.name + ' component');
			ref && ref.close();
		});
	}
}());
(function () {

    if (!Capriza.device.ios) return;


    var cappModule = new CappModule("touchId", "3.7.0", {
        deviceReady: onReady,
        pluginName: "window.plugins.touchid"
    });


    function onReady(event, touchId) {


    }
})();
(function () {
    new CappModule("filer2", "3.7.0", {deviceReady: onDeviceReady, pluginName: "window.plugins.touchid"});
    //Original Filer is too old and risky to touch, so filer2...
    function onDeviceReady(event, filer) {
        filer.READER_TYPES = {
            DATA_URL: "DataURL",
            BINARY_STRING: "BinaryString",
            TEXT: "Text",
            ARRAY_BUFFER: "ArrayBuffer"
        };
        if (Capriza.isIOS) {
            var fileDirectory = "cdvfile://localhost/persistent/";
        } else {
            fileDirectory = cordova.file.dataDirectory;
        }


        filer.getDataDirectory = function (success, error) {
            if (filer.dataDirectoryEntry) {
                success && success(filer.dataDirectoryEntry);
            } else {
                window.resolveLocalFileSystemURL(fileDirectory, function (dataDirectoryEntry) {
                    filer.dataDirectoryEntry = dataDirectoryEntry;
                    success && success(filer.dataDirectoryEntry)
                }, error);
            }
        };

        filer.getDataDirectory(logger.log.bind(logger), logger.log.bind(logger));

        filer.createDirectory = function (name, success, error) {
            filer.getDataDirectory(function (dataDirectory) {
                dataDirectory.getDirectory(name, {create: true}, success, error)
            })
        };


        filer.getFile = function (fileName, format, success, error) {
            logger.log("trying to read file: " + fileName + ", as " + format);
            var fullPath = fileDirectory + filer.getFileName(fileName);
            window.resolveLocalFileSystemURL(fullPath, function (fileEntry) {
                logger.log(fileEntry);
                var readerKey = "readAs" + format;

                var fileReader = new FileReader();
                fileReader.onload = function (fileLoadEvent) {

                    success && success(fileLoadEvent.target.result);
                };
                fileReader.onerror = onError;

                fileEntry.file(function (file) {
                    fileReader[readerKey](file);
                }, onError);
            }, onError);

            function onError(err) {
                logger.error(err);
                logger.error(fileName, err);
                error && error(err);
            }
        };

        filer.removeFile = function (fileName, success, failure) {
            logger.log('trying to remove file: ' + fileName);
            var fullPath = fileDirectory + filer.getFileName(fileName);
            window.resolveLocalFileSystemURL(fullPath, function (fileEntry) {
                fileEntry.remove();
                success();
            }, function () {
                logger.error('error - failed to remove file: ' + fileName);
                failure();
            })
        };


        filer.writeFile = function (name, data, success, error) {
            logger.log("trying to write file: " + name);
            filer.dataDirectoryEntry.getFile(name, {create: true}, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function () {
                        success && success(fileEntry.toURL());

                    };
                    fileWriter.onerror = onError;

                    fileWriter.write(data);
                }, onError);
            }, onError);


            function onError(err) {
                logger.error(err);
                logger.error(fullPath, err);
                error && error(err);
            }
        };

        filer.getFileName = function (fullPath) {
            var lastSlash = fullPath.lastIndexOf('/');
            if (lastSlash == -1) {
                return fullPath;
            }
            return fullPath.substring(lastSlash + 1);
        };

        filer.persistent = CordovaPromiseFS({
            persistent: true, // or false
            storageSize: 20 * 1024 * 1024, // storage size in bytes, default 20MB,
            fileSystem: cordova.file.dataDirectory
        });
    }


})();


(function () {
    new CappModule("composer", "3.7.0", {deviceReady: onReady, pluginName: "cordova.plugins.email"});

    function onReady(e,composer) {

    }
})();


(function () {
    new CappModule("barcodeScanner", "3.7.0", {deviceReady: onReady});
    var scanditSettings = null;
    function onReady(event, barcodeScanner) {
        function getSymbols() {
            return [
                Scandit.Barcode.Symbology.EAN13,
                Scandit.Barcode.Symbology.EAN8,
                Scandit.Barcode.Symbology.UPC12,
                Scandit.Barcode.Symbology.UPCE,
                Scandit.Barcode.Symbology.CODE11,
                Scandit.Barcode.Symbology.CODE128,
                Scandit.Barcode.Symbology.CODE39,
                Scandit.Barcode.Symbology.CODE93,
                Scandit.Barcode.Symbology.CODE25,
                Scandit.Barcode.Symbology.ITF,
                Scandit.Barcode.Symbology.DATA_MATRIX,
                Scandit.Barcode.Symbology.PDF417,
                Scandit.Barcode.Symbology.MSI_PLESSEY,
                Scandit.Barcode.Symbology.GS1_DATABAR,
                Scandit.Barcode.Symbology.GS1_DATABAR_LIMITED,
                Scandit.Barcode.Symbology.GS1_DATABAR_EXPANDED,
                Scandit.Barcode.Symbology.CODABAR,
                Scandit.Barcode.Symbology.AZTEC,
                Scandit.Barcode.Symbology.MAXICODE,
                Scandit.Barcode.Symbology.FIVE_DIGIT_ADD_ON,
                Scandit.Barcode.Symbology.TWO_DIGIT_ADD_ON
            ];
        }

        function zBarScan(success, error) {


            if (cordova.plugins.barcodeScanner) {
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        // alert("We got a barcode\n" +
                        //     "Result: " + result.text + "\n" +
                        //     "Format: " + result.format + "\n" +
                        //     "Cancelled: " + result.cancelled);
                        success({ text: result.text, format:  result.format});
                    },
                    function (errorTxt) {
                        error("Scanning failed: " + errorTxt);
                    },
                    {
                        preferFrontCamera : false, // iOS and Android
                        showFlipCameraButton : true, // iOS and Android
                        showTorchButton : true, // iOS and Android
                        torchOn: true, // Android, launch with the torch switched on (if available)
                        prompt : "Place a barcode inside the scan area", // Android
                        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                        orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                        disableAnimations : true, // iOS
                        disableSuccessBeep: false // iOS
                    }
                );
            }
            else {

                window.cloudSky.zBar.scan({text_title: "Scan Barcode", text_instructions: ""}, function (barcode) {
                    success({text: barcode});
                }, error)

            }


        }
        function getScanditSettings() {
            if(!scanditSettings) {
                Scandit.License.setAppKey(_urlParams.scanditKey);
                var settings = new Scandit.ScanSettings();
                getSymbols().forEach(function (symbol) {
                    settings.setSymbologyEnabled(symbol, true)
                });
                scanditSettings = settings;
            }
            return scanditSettings;
        }
        function scanditScan(success, error) {
            var settings = getScanditSettings();
            var picker = new Scandit.BarcodePicker(settings);
            picker.show(function (session) {
                picker.stopScanning();
                success({text: session.newlyRecognizedCodes[0].data})
            }, null,function(){
                picker.stopScanning();
                error.apply(this, arguments);
            });
            picker.startScanning();
        }
        barcodeScanner.scan = function (success, error) {
            if (window.Scandit && _urlParams.scanditKey) {
                scanditScan(success, error);
            } else {
                zBarScan(success, error);
            }
        }
    }
})();
(function () {
    new CappModule("mdm", "3.7.5", {deviceReady: onDeviceReady});

    function onDeviceReady(e, mdm) {
        console.log('mdm onDeviceReady called _urlParams.mdm: '+_urlParams.mdm);
        if (!_urlParams.mdm) {
            delete Capriza.Capp.mdm;
            return;
        }
        if (_urlParams.mdm == "airwatch") {
            mdm.getSsoCredentials=function(success,error) {
                cordova.exec(success, error, "CaprizaExtensions", "getSsoCredentials", []);
            };
        }
    }
}());
(function () {
    new CappModule("inAppBrowser", "4.0.0", {deviceReady: onReady});
    function onReady(e, iab) {
        iab.open = function (url, args) {
            if (Capriza.device.android) {
                args = args || "";
                cordova.exec(debugCallback, debugCallback, "CaprizaExtensions", "inAppBrowser", [url, args]);
            }
            else {
                return window.open(url, "_blank", args);
            }
        }
    }
})();



(function() {
	document.addEventListener("deviceready", function(){
		if (Capriza.device.ios && semver.eq(Capriza.cordova, '10.0.0')){
			Capriza.Capp.messenger.on("sendStatusBarProperties", function(opts){
				StatusBar.backgroundColorByHexString(opts.color);
				opts.isBlackText ? StatusBar.styleDefault() : StatusBar.styleLightContent();
			});

			if (Capriza.splashing ) {
				Dispatcher.on("splash/hide", function (){
					Capriza.Capp.messenger.emit("zappsplash/hide");
				})
			}
			else{
				Capriza.Capp.messenger.emit("zappsplash/hide");
			}
		}

		if (Capriza.device.ios && semver.gte(Capriza.cordova, '11.0.0')){
			var isRemoved = false;

			function removeOverlay(){
				if (isRemoved) return;
				isRemoved = true;
				var exec = cordova.require("cordova/exec");
				exec(function(){}, function(){}, "CaprizaExtensions", "hideOverlay", []);
				Capriza.Capp.messenger.emit("splash/hide");
			}

			logger.debug("statbar.js - before deciding to remove overlay");
			!Capriza.splashing ? removeOverlay() : Dispatcher.on("mobile/active identity/show login/show confirmation/show mobile/error mobile/splash/hidden", removeOverlay);
		}
	});
    document.addEventListener("rnBridgeReady", function(){

        if (Capriza.device.ios){
            var isRemoved = false;

            function removeOverlay(){
                if (isRemoved) return;
                isRemoved = true;
                Capriza.rnBridge.send("CaprizaExtensions", "hideOverlay", []);
                Capriza.Capp.messenger.emit("splash/hide");
            }

            logger.debug("statbar.js - before deciding to remove overlay");
            !Capriza.splashing ? removeOverlay() : Dispatcher.on("mobile/active identity/show login/show confirmation/show mobile/error mobile/splash/hidden", removeOverlay);
        }
    });
}());
(function () {
    setTimeout(function () {
        /* Avoid putting any logic here, because when working on two webviews within iOS, setTimeout takes a long time to be called. about 500ms more than usual.
        * For example, this function will be called 500ms after it was registered
        * The delay happens only in the background view, for this matter the ZappView, when it comes to background it works fine.*/
    }, 0);

    try {
        //        override logger._send
        // current localStorage size
        var suppressionRegex = /(.*closed unexpectedly,connection rejected.*|.*is temporarily unavailable.*|.*non fatal.*|.*terminated due to a long period.*|.*Cache failed to update.*|.*current localStorage size.*|.*undefined)/i;

        logger._send = function (msg, severity) {
            if (severity == "ERROR") {
                if (suppressionRegex.test(msg)) {
                    logger.log("Suppressed inactivity log message");
                    return;
                }
            }
            if (ComManager.serverMessageEndSent) {
                logger.log("Suppressed spam inactivity log message");
                return;
            }

            try {
                var path = '/logger/mobile/' + severity,
                    sessionId = window.appData ? window.appData.session_id : '',
                    appDataClone = null;
                if (window.appData) {
                    appDataClone = JSON.parse(JSON.stringify(window.appData));
                    appDataClone.xkcd = undefined;
                }
                if (!window.testMode) {
                    Capriza.Napi.send(path, {
                        msg: msg,
                        data: {
                            appData: appDataClone,
                            userAgent: navigator ? navigator.userAgent : "Unknown"
                        },
                        sessionId: sessionId
                    });
                }
            } catch (e) {
                console.error("logger error...")
            }
            try {
                if (Capriza.isMonitored) {
                    Capriza.Feedback.send("#error #auto " + msg);
                }
            }
            catch (e) {
                console.error("Feedback error, not sent");
            }
        };
        logger._suppressionRegex = suppressionRegex;

        //Override logger._print to fix passwords printed to logs even when encrypt flag was specified
        logger._print = function (level, message, e) {

            if(("" + message).indexOf("\"encrypt\":true")>-1){
                message = "***** encrypted *****";
            }
            var logMessage = level.toUpperCase() + " - " + new Date() + ": " + message;

            if (typeof e == 'undefined') {
                console[level](message);
                this._logs.push(logMessage);
            } else {
                console[level](e, message);
                this._logs.push(logMessage + ". EXCEPTION: " + e);
            }
        };


        Utils.isMobileUpdated = function () {
            function getMobileJSPath() {
                var result = "";
                $('script').each(function() {
                    var src = this.getAttribute('src');
                    if (src && src.indexOf('mobile.js') > -1) {
                        result = src
                    }
                });
                return result;
            }

            var appData = window.appData;
            if (!appData) return false;
            var oldFullPath = getMobileJSPath();
            var newVersionNumber = appData.current_mobile_version;
            var result = oldFullPath && oldFullPath.indexOf(newVersionNumber) < 0;

            Logger.debug('script url is: ' + oldFullPath);
            Logger.debug('new version number is: ' + newVersionNumber);
            if (result) {
                Logger.debug('the mobile version has been updated')
            }
            else {
                Logger.debug('the mobile verion has NOT been updated');
            }

            return result;
        }

        var _markOutEncryptedInOverride = function(arr){
            if(!Array.isArray(arr)) return [];
            return arr.map(function(row){
                if (("" + JSON.stringify(row)).indexOf("\"encrypt\":true") > -1)
                    return "***** encrypted0 *****";
                return row;
            });
        };

        if (Capriza && Capriza.Feedback && Capriza.Feedback._createDebugSnapshot) {
            Capriza.Feedback._createDebugSnapshot = function () {
                var debugData = {
                    "logs.json": _markOutEncryptedInOverride(logger.logs),
                    "engineResponses.json": _markOutEncryptedInOverride(debug.responses),
                    "mobileActions.json": _markOutEncryptedInOverride(debug.actions)
                };
                if (window.appData) {
                    debugData['appData.json'] = window.appData;
                }

                return debugData;

            };
        }

        // relevant for versions < MED-7
        if (Capriza.device.android && _urlParams.isIframe){
            var telephoneLinks = Capriza.Views.Utils.addTelephoneLinks;
            Capriza.Views.Utils.addTelephoneLinks = function(){
                var el = telephoneLinks.apply(this, arguments);
                if (typeof el == "string" && el.indexOf('<a') == 0 && el.indexOf("target='_top'") == -1 && (el.indexOf('tel:') > -1 || el.indexOf('mailto:') > -1)) {
                    el = el.replace("<a " , "<a target='_top'");
                }

                return el;
            }
        }

        //fix a chrome bug (?) regarding flex
        $("<style>.undocked-area > .grouping { min-height: 0 !important; }</style>").appendTo("head");


        //as of App 11 - we use seamless transition between app and zapp
        if (Capriza.cordova && semver.gte(Capriza.cordova, '11.0.0') && !Capriza.isReloadFromZapp) {
            if (Capriza.Splash && Capriza.Splash.setVisibility) Capriza.Splash.setVisibility("hidden");
            else {
                var splashDev = document.getElementById("new-splash");
                splashDev.style.visibility = 'hidden';
            }
        }

    }

//        end override
    catch (e) {
        console.error(e);
        logger.error("override error", e);
    }

})();

window.Capriza.avatarAPI = {
	getUserImage: function(callback) {
		if (_urlParams.isIframe) {
			top.Capriza.zappAPI.getAvatarImage(callback);
		} else {
			document.addEventListener("deviceready", function() {
				Capriza.Capp.messenger.off('send/avatarImg');
				Capriza.Capp.messenger.on('send/avatarImg', function(props){callback(props && props.src)});
				Capriza.Capp.messenger.emit('request/avatarImg');
			});
		}
	},

	getUserEmail: function(callback){
		if (_urlParams.isIframe) {
			callback(top.Capriza.zappAPI.getUserEmail());
		} else {
			document.addEventListener("deviceready", function(){
				Capriza.Capp.messenger.off('send/email');
				Capriza.Capp.messenger.on('send/email', function(props) {
					if (props) {
						if (semver.gte(_urlParams.cordova, "12.0.0")) {
							props.email = unescape(props.email);
						}
					}
					callback(props && props.email)
				});
				Capriza.Capp.messenger.emit('request/email');
			})
		}
	},

	getLoginExpirationTime: function(callback) {
		if (_urlParams.isIframe && top.Capriza.zappAPI.getLoginExpirationTime) {
			callback(top.Capriza.zappAPI.getLoginExpirationTime());
		} else {
			document.addEventListener("deviceready", function(){
				Capriza.Capp.messenger.off('send/loginExpirationTime');
				Capriza.Capp.messenger.on('send/loginExpirationTime', function(props) {
					callback(props && props.loginExpirationTime)
				});
				Capriza.Capp.messenger.emit('request/loginExpirationTime');
			})
		}
	}
};

window.Capriza.avatarAPI.getUserEmail(function(email){
	ClientCache.setItem("userEmail", email);
});

window.Capriza.avatarAPI.getLoginExpirationTime(function(loginExpirationTime){
	ClientCache.setItem("loginExpirationTime", loginExpirationTime);
});
(function(){
	var cordovaRelax = (function(){
		function setCordovaElements(){
			window.device = top.device;
			navigator.notification = top.navigator.notification;
			Capriza.Capp.filer.migrateOldFiler(Utils);
			window.open = top.open;
			Capriza.Capp.inAppBrowser = top.Capriza.Capp.inAppBrowser;
			Capriza.Capp.statusBar = top.window.StatusBar;
			Capriza.Capp.cordovaExec = top.window.cordova.exec;
		}

		function dispatchCordovaEvents(event){
			var e = new Event(event.type);
			logger.debug('zapp view - received event: ' + event.type);
			document.dispatchEvent(e);
		}

		function listenToCordovaEvents(){
			['backbutton', 'online', 'offline', 'resume', 'pause'].forEach(function(eventName){
				top.document.addEventListener(eventName, dispatchCordovaEvents);

				window.addEventListener("unload", function(){
					top.document.removeEventListener(eventName, dispatchCordovaEvents);
				});
			});
		}

		function initCappModules(){
			Capriza.Capp = top.Capriza.Capp;

            Dispatcher && Dispatcher.trigger("capp/pluginready");
        }

		return function(){
			initCappModules();
			setCordovaElements();
			listenToCordovaEvents();
		}
	}());

	function onDOMContentLoaded(){
		Dispatcher.off('app/close');
		Dispatcher.on('app/close', function(opts){
			document.activeElement.blur();
			top.Capriza.zappAPI["zapp/close"](opts && opts.Timeout);
		});

		Dispatcher.off('passcode/show');
		Dispatcher.off('passcode/hide');
		Dispatcher.on('mobile/error', function(){
			setTimeout(function(){
				$('button').on("click", function(){top.Capriza.zappAPI["zapp/close"]()})
			}, 200);
		});

		Dispatcher.trigger("cordova/ready");
		top.Capriza.zappAPI["domContentLoaded"]();
		document.addEventListener('store/showUnimessage', function(customEvent) {
			var opts = customEvent.detail;
			window.Utils && window.Utils.showUnimessage && Utils.showUnimessage(opts, opts.isBlocking, opts.isAllowedInMvp);
		});

        Dispatcher.on('saveXkcd', function(xkcd){
        	if (top.Capriza.zappAPI.saveXkcd) {
                top.Capriza.zappAPI.saveXkcd(xkcd);
			}
			else {
                logger.debug('saveXkcd is not implemented yet');
			}

        });
	}

	function initWithStore(){
		document.domain = "capriza.com";
		//document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
		onDOMContentLoaded();
		if (Capriza.splashing) {
			Dispatcher.on("mobile/active identity/show login/show confirmation/show mobile/error mobile/splash/hidden", function() {
				top.Capriza.zappAPI["splash/hide"]();
			});
		}
		else {
			top.Capriza.zappAPI["splash/hide"]();
		}
	}

	function init(){
		if (_urlParams.isIframe) {
			initWithStore();
			Capriza.cordova && cordovaRelax();
		}
	}

	init();
}());

(function() {
    window.QrCode = {
        create: function(text, typeNumber, errorCorrectLevel, table) {
            var qr = qrcode(typeNumber || 5, errorCorrectLevel || 'M');
            qr.addData(text);
            qr.make();
            if (table) {
                return qr.createTableTag(2, 0);
            } else {
                return qr.createImgTag(2, 0); // (cellSize, margin)
            }
        }
    };
})();
window.Api={

    get url(){
        return Config.apiUrl.replace("api", "apirun");
    },

    login:function(opts) {
        opts || (opts = {});

        opts.type = "post";
        opts.url = this.url + "/auth/login.json";
        opts.contentType = "application/json";
        var success = opts.success, complete = opts.complete, failure = opts.failure;

        opts.complete = function () {
            complete && complete();
        };

        opts.success = function (data) {
            var resp = typeof data == "string" ? JSON.parse(data) : data;
            if (resp.success) {
                success && success(resp);
            } else {
                failure && failure(resp);
            }
        };

        opts.error = function (req, textStatus, errorThrown) {
            Logger.error("failure: " + textStatus , errorThrown, "apiLogin");
            failure && failure({ errors: textStatus });
        };

        opts.data = JSON.stringify({ user:{ email:opts.email, password:opts.password }});

        $.ajax(opts);
    },

    signup:    function (opts) {
        opts || (opts = {});

        opts.type = "post";
        opts.url = this.url + "/auth/register.json";
        opts.contentType = "application/json";
        var success = opts.success, complete = opts.complete, failure = opts.failure;

        opts.complete = function () {
            complete && complete();
        };

        opts.success = function (data) {
            var resp = typeof data == "string" ? JSON.parse(data) : data;
            if (resp.success) {
                success && success(resp);
            } else {
                failure && failure(resp);
            }
        };

        opts.error = function (req, textStatus, errorThrown) {
            Logger.error("failure: " + textStatus, errorThrown, "apiSignup");
        };

        opts.data = JSON.stringify({ user:{ email:opts.email, password:opts.password },capanswer:opts.captcha,capid:opts.capid});

        $.ajax(opts);
    },

    confirmEmail:function(options){
        this.post("/auth/verification.json",options)
    },

    post:function(resourcePath,options){
        options || (options = {});

        options.type = "post";
        options.url = this.url + resourcePath;
        options.contentType = "application/json";
        var success = options.success, complete = options.complete, failure = options.failure;

        options.complete = function () {
            complete && complete();
        };

        options.success = function (data) {
            var resp = typeof data == "string" ? JSON.parse(data) : data;
            if (resp.success) {
                success && success(resp);
            } else {
                failure && failure(resp);
            }
        };

        options.error = function (req, textStatus, errorThrown) {
            Logger.error("failure: " + textStatus , errorThrown, "apiPost");
        };

        options.data=options.data || {};

        options.data = JSON.stringify(options.data);
        $.ajax(options);
    }

};
(function () {
    console.log('starting parsing FeedbackBuilder.js');
    window.Capriza = $.extend({}, window.Capriza);

    window.Capriza.FeedbackBuilder = {
        // this is string Version of maintest.prod.html from the mobile package
        buildMobilePlayerHtml: function(mobilePath, mbootPath, customCss, records, appData){

            if (records){
                records = records.replace(/<script>/g, "\\<scrip ").replace(/<\/script>/g, "<\\\/scrip ").replace(/<link>/g, "\\<link>").replace(/<\/link>/g, "<\\\/link>");
            }

            var html = '<!DOCTYPE html>\n'+
            '<html>\n'+
            '<head>\n'+
                '<title>Capriza</title>\n'+

                '<!--https://gist.github.com/3840737 f-->\n'+
                '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, minimum-scale=1.0,maximum-scale=1.0">\n'+
                '<meta name="viewport" content="initial-scale=1, user-scalable=no, minimum-scale=1.0,maximum-scale=1.0" media="(device-height: 568px)">\n'+
                '<!--<meta name="viewport" content="height=device-height">-->\n'+

                '<meta name="author" content="Capriza Inc."/>\n'+
                '<meta name="apple-mobile-web-app-capable" content="yes"/>\n'+
                '<meta name="apple-mobile-web-app-status-bar-style" content="black">\n'+

                '<!-- iPhone -->\n'+
                '<!-- iPhone (Retina) -->\n'+
                '<!--iPhone 5-->\n'+

                '<META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE">\n'+

                '<script>\n'+
                    'Capriza= { baseUrl: "'+mobilePath +'", feedbackRecords : '+ records +' };\n'+
                    'if (window.location.hash.indexOf("devmode") == -1){window.location.hash += "#devmode;loadFromFeedback"}\n'+
                    (appData ? ' window.appData = ' + appData + '\n' : '')+
                '</script>\n'+
                '<script src="' + mbootPath + '/zapp/javascripts/mobileDevMode.js"></script>\n'+
                '<script src="' + mobilePath + '/vendor/vendor.js"></script>\n'+
                '<script src="' + mobilePath + '/javascripts/cached.js"></script>\n'+
                '<script src="' + mobilePath + '/javascripts/mobile-cache-new.js"></script>\n'+
                '<script src="' + mbootPath + '/zapp/javascripts/mvp.js"></script>\n'+
                '<script src="' + mbootPath + '/zapp/javascripts/latest.js"></script>\n'+
                '<script src="' + mobilePath + '/javascripts/justControls.js"></script>\n'+
                '<script src="' + mobilePath + '/javascripts/devmode.js"></script>\n'+
                '<script src="' + mobilePath + '/javascripts/wrapper.js"></script>\n'+

                '<!--\n'+
                '****************************\n'+
                '***** (2) Stylesheets ******\n'+
                '****************************\n'+
                '-->\n'+

                '<link rel="stylesheet" href="' + mobilePath + '/stylesheets/mobile.css">\n'+
                    //'<link rel="stylesheet" href="' + mobilePath + '/spec/helpers/style-sets.css"/>\n'+
                '<link href="'+customCss+'" rel="stylesheet" type="text/css">' +
                '<!--\n'+
                '*****************************\n'+
                '***** (4) JSON Manooal ******\n'+
                '*****************************\n'+
                '-->\n'+
                '<link href="' + mobilePath + '/stylesheets/manooal.css" rel="stylesheet" type="text/css">\n'+
                '<link href="https://fonts.googleapis.com/css?family=Finger+Paint" rel="stylesheet" type="text/css">\n'+
                //<script>
                //    document.write('<link href="' + window.location.protocol + '//fonts.googleapis.com/css?family=Finger+Paint" rel="stylesheet" type="text/css">');
                //</script>
                //<!--<link href='https://fonts.googleapis.com/css?family=Finger+Paint' rel='stylesheet' type='text/css'>-->

            '</head>\n'+

            '<body>\n'+
            '<div id="manualJson">\n'+
                '<input type="checkbox" id="manooal-id-cb"/><label for="manooal-id-cb">Show IDs</label>\n'+
                '<div class="title"><span>Puttin Json</span><form id="fixture-form" href="#"><button id="fixture-button">Load Fixture</button><input id="fixture-input"></form></div>\n'+
                '<div>\n'+
                    '<textarea id="jsonArea"></textarea>\n'+
                    '<button id="submitJson">Submit Json manooal</button>\n'+
                '</div>\n'+
            '</div>\n'+


            '<!--\n'+
            '*****************************\n'+
            '***** (5) Fixes  ************\n'+
            '*****************************\n'+
            '-->\n'+
            '<script>\n'+
                '$(function() { $(".viewport").addClass("themed"); });\n'+
                'setTimeout(function() { $("#start-page").remove(); }, 0);\n'+
            '</script>\n'+

            //<script>
            //    if(_urlParams.ext){
            //    document.write('<script src="extensions/' + _urlParams.ext  + '.js"><\/script>');
            //}
            //</script>
            '</body>\n'+
            '</html>';
            return html;
        }
    }

})();

(function () {
    console.log('starting parsing feedback.js');
    window.Capriza = $.extend({}, window.Capriza);

    var Feedback = Capriza.Feedback = {
        feedbacksCount: 0 ,
        sendDefer : $.Deferred(),
        screenshot: undefined,
        screenshotTaken: false,
        screenshotDefer: $.Deferred(),
        messages: [],
        singular: undefined,
        send: function (message, options) {
            var deferred = $.Deferred();
            var self = this;
            var defaults = {
                screenshot: true
            };
            options = $.extend({}, defaults, options);

            Capriza.Feedback.feedbacksCount++;

            Capriza.Feedback.messages.push(message);
            if(options.screenshot && !Capriza.Feedback.screenshotTaken){
                Capriza.Feedback.screenshotTaken = true;
                this.takeScreenshot().then(function (canvas) {
                    if (canvas) {
                        Capriza.Feedback.screenshot = canvas.toDataURL("image/jpeg", 0.8);
                    }
                    Capriza.Feedback.screenshotDefer.resolve();
                });
            }

            Capriza.Feedback.singular && clearTimeout(Capriza.Feedback.singular);

            var allMessagesClones = Capriza.Feedback.messages.slice();
            Capriza.Feedback.singular = setTimeout(function() {
                // instead of clearing the whole messages array, just filter out messages that were added since last time.
                Capriza.Feedback.messages = Capriza.Feedback.messages.filter(function(message) { return allMessagesClones.indexOf(message) < 0;});
                self.sendAgregated(options, allMessagesClones)
                    .fail(deferred.reject)
                    .done(deferred.resolve)
                    .always(function(data){
                        Capriza.Feedback.singular = undefined;
                        Dispatcher.trigger('Feedback/send/finish', data);
                    });
            }, 50);

            return deferred.promise();

        },

        sendAgregated: function (options, messages) {
            var message = "";
            var defer = $.Deferred();
            var _this = this;

            if(messages.length > 1){
                message = "Aggregated " + messages.length + " Feedbacks :" + messages.join("; ");
            }
            else if(messages.length == 1){
                message = messages[0];
            }

//                                    Backwards compatibility
            message = message || $("#tools-menu").data("feedback-message") || "Empty feedback";

            var extraData = {
                timestamp: Date.now(),
                deviceSource : ((Capriza.isPhonegap || Capriza.cordova) ? "native" : (Capriza.device.isMobile ? "mobile-html" : "web-html"))
            };
            options = $.extend({collectLogs: true}, options);
            this._shouldCollectLogs = options.collectLogs;
            this._mobileOnly = options.mobileOnly;

            options.extraData = $.extend(extraData, options.extraData);

            if (this._shouldCollectLogs && !this._mobileOnly) {
                try {
                    this._sendRuntime(message, options);
                } catch (e) {
                    console.error("sending runtime feedback failed");
                    console.error(e);
                }
            }
            this._createFeedbackData(message, options).then(function (feedbackData) {


                feedbackData.metadata = _this._getMetadata();

                feedbackData = $.extend(feedbackData, {
                    feedback_via: "mobile",
                    feedback_app_id: feedbackData.metadata.app_id,
                    feedback_tags: Capriza.Logger._tags,
                    feedback_feedbackCount: Capriza.Feedback.feedbacksCount,
                    feedback_aggregatedCount: messages.length,
                    feedback_userAgent: navigator ? navigator.userAgent : "NA"
                });
                if(options.additionalMessage){
                    feedbackData.feedback_additionalMessage = options.additionalMessage;
                }
                if(options.errorType){
                    feedbackData.feedback_errorType = options.errorType;
                }

                //Removed because the Wrapper is listening to the console logging, and this is just too much for it.
                //logger.log(feedbackData);

                if (!window.testMode) {
                    Capriza.Napi.send("/feedback/", feedbackData)
                        .always(function (response) {
                            logger.log(response);
                            logger.info("mobile feedback sent");
                        })
                        .fail(defer.reject)
                        .done(defer.resolve);
                }

            });

            return defer.promise();
        },

        _getMetadata: function () {
            var metadata = {};

            if (window.appData) {
                metadata = {
                    app_id: appData.app_id,
                    app_name: appData.app_name,
                    session_id: appData.session_id,
                    has_feedback_files: this._shouldCollectLogs,
                    mobile_only: this._mobileOnly
                };
                if (appData.unique_token && appData.unique_token.value) {
                    metadata.unique_token = appData.unique_token.value;
                }
            }

            return metadata;

        },
        _createFeedbackData: function (message, options) {
            var defer = $.Deferred();
            var feedbackData = {
                feedback_text: message
            };
            if(!this._shouldCollectLogs){
                feedbackData = $.extend(feedbackData, options.extraData); // TODO need review by Dor (timestamp used to be undefined if no logs)
                return defer.resolve(feedbackData);
            }

            var debugData = this._createDebugSnapshot2();
            /*
             var feedbackData = {
             feedback_text: message
             };
             */
            feedbackData = $.extend(feedbackData, options.extraData, debugData);


            if (Capriza.Feedback.screenshotTaken) {
                Capriza.Feedback.screenshotDefer.then(function(){
                    feedbackData["screenshot.jpeg"] = Capriza.Feedback.screenshot;
                    Capriza.Feedback.screenshot = undefined;
                    Capriza.Feedback.screenshotTaken = false;
                    Capriza.Feedback.screenshotDefer = $.Deferred();
                    defer.resolve(feedbackData);
                })
            }
            else {
                defer.resolve(feedbackData);
            }

            return defer.promise();
        },
        _sendRuntime: function (message, options) {

            if (window.isDesignerPreview) return;

            var metadata = this._getMetadata();

            var feedbackRuntimeData = {
                type: "snapshot",
                value: {
                    feedback_via: "runtime",
                    feedback_text: message,
                    feedback_app_id: metadata.app_id,
                    metadata: metadata
                }


            };

            feedbackRuntimeData.value = $.extend(feedbackRuntimeData.value, options.extraData);


            var pageView = $.capriza.activePage.data('pageView');
            var context;
            if (pageView && pageView.model) {
                context = pageView.model.get("contextId");
            } else {
                context = null;
            }

            Capriza.EngineApi.sendEvent(context, null, null, feedbackRuntimeData);
        },

        takeScreenshot: function (elements, options) {

            var defer = $.Deferred();

            try {
                if (!elements) {
                    elements = $('.viewport').toArray();
                }


                elements = $(elements).toArray();
                options = $.extend({}, options, {onrendered: function (canvas) {
                    defer.resolve(canvas);
                }});
                html2canvas(elements, options);
            } catch (e) {
                logger.warn("Failed to create canvas screenshot\n" + e.message);
                defer.resolve();
            }

            return defer.promise();
        },

        _createDebugSnapshot2: function () {
            var mbootLog;
            try {
                mbootLog = window.localStorage.getItem("mboot-log");
                if (mbootLog) {
                    mbootLog = JSON.parse(mbootLog);
                }
            }
            catch(e){
                Logger.warn("mboot-log parsing failure :" + e.message);
                mbootLog = undefined;
            }

            var debugData= {
                "logs.json": this._markOutEncryptedObj(logger.logs),
                "engineResponses.json": this._markOutEncryptedObj(debug.responses),
                "mobileActions.json": this._markOutEncryptedObj(debug.actions),
                "blueprintInitialCache.json": this._markOutEncryptedObj(debug.blueprintInitialCache),
                "mobileDOM.html": this._markOutEncryptedObj($('body.zapp').parent()[0].outerHTML)
            };
            if (debug.interactions){
                debugData["userInteractions.json"] = this._markOutEncryptedObj(debug.interactions);
            }

            if(mbootLog){
                debugData['mboot.json'] = mbootLog;
            }

            if(window.appData){
                var appDataClone = JSON.parse(JSON.stringify(window.appData));
                appDataClone.xkcd = undefined;
                if (Capriza.zappInfo){
                    var extraInfo = {
                        "zappInfo": Capriza.zappInfo,
                        "baseUrl" :Capriza.baseUrl,
                        "lang" :Capriza.lang_header,
                        "device": {
                            "isStore": Capriza.isStore
                        }
                    };
                    if (Capriza.device && typeof Capriza.device ==="object") {
                            var keys = Object.keys(Capriza.device);
                            for (var i = 0; i < keys.length; i++) {
                                var k = keys[i];
                                if (Capriza.device[k]) {
                                    extraInfo.device[k] = Capriza.device[k];
                                }
                            }
                    }

                    var caprizaInfo = {
                        "appData": appDataClone,
                        "caprizaInfo" : extraInfo
                    };
                    debugData['appData.json'] = this._markOutEncryptedObj(caprizaInfo);
                } else {
                    debugData['appData.json'] = this._markOutEncryptedObj(appDataClone);
                }
            }

            if (debug.records && Capriza.FeedbackBuilder && Capriza.FeedbackBuilder.buildMobilePlayerHtml){
                try{
                    var mobilePath =  Capriza.baseUrl.indexOf("zappdev") > -1 ? Capriza.baseUrl : Capriza.baseUrl.substring(0, Capriza.baseUrl.lastIndexOf("/")+1) + Capriza.baseUrl.substring(Capriza.baseUrl.lastIndexOf("/")+1),
                        mbootPath = Capriza.zappInfo.mboot_base_url +"/"+ Capriza.zappInfo.mboot_version,
                        customCss = Capriza.zappInfo.mboot_base_url.replace("mboot","mobile") + "/zapps/" +appData.app.id + "/" + (appData && appData.asset_versions.custom_css_version) + "/style.css";

                    var records = {
                        "responses" : this._markOutEncryptedObj(debug.records),
                        "blueprint": this._markOutEncryptedObj(debug.blueprintInitialCache)
                    };
                    debugData["mobilePlayer.html"] = Capriza.FeedbackBuilder.buildMobilePlayerHtml(mobilePath, mbootPath, customCss, JSON.stringify(records), JSON.stringify(debugData['appData.json']));

                } catch (ex){
                    // just don't add the files and Path for Mobile Player
                }
            }
            return debugData;
        },

        _markOutEncryptedObj:function(obj){
            if(!obj) return;
            if(typeof obj ==="string" && obj.indexOf("\"encrypt\":true") > -1) obj = "***** encrypted1 *****";
            if(typeof obj ==="object") {
                if (obj && obj.encrypt) return "***** encrypted2 *****";

                var keys = Object.keys(obj);

                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    obj[k] = this._markOutEncryptedObj(obj[k]);
                }
            }
            return obj;
        },

        _createDebugSnapshot: function () {
            //DON'T IMPLEMENT THIS EVER...
            //This function is overridden in override.js to solve unencrypted passwords in engineResponses in sent feedback.
        }



    };


    Dispatcher.on("application/contextNotFound", function (response) {
        if (Capriza.splashing) {
            Dispatcher.trigger('splash/clearTimeout');
        }
        if(!Capriza.CNFTesting){
            var cnfMsg = "#CNF";
            var errorType = "CNF";
            if(response && response.networkError){
                cnfMsg = "#CNF_NETWORK";
                errorType = "CNFNETWORK";
            }
            logger.error(cnfMsg, undefined, errorType);
        }
    });

    (function splashMonitor() {
        var splashTimeout;

        function clearSplashTimeout(){
            clearTimeout(splashTimeout);
        }

        function setSplashTimeOut(timeout) {
            if (typeof MBOOT !== 'undefined' && !MBOOT.Config.canRunZapp()){
                Dispatcher.off('runZapp/start', setSplashTimeOut).on('runZapp/start', setSplashTimeOut);
                return;
            }
            Logger.debug('clearing and setting splash timeout again');
            clearTimeout(splashTimeout);
            if (!timeout || !(typeof timeout == "number")){
                if (window.appData && appData.config && appData.config.splashTimeout)
                    timeout = appData.config.splashTimeout;
                else
                    timeout = 30000;
            }
            Logger.debug("[Splash] setting splash timeout to: " + timeout);
            splashTimeout = setTimeout(function () {
                if(Capriza.splashing && !window.isDesignerPreview){
                    logger.error("#timeout #splash didn't clear after " + (timeout/1000) + " seconds", undefined, 'splashClearTimeout');
                    Dispatcher.trigger('splashDidntClear');
                    if (Capriza.isMonitored) {
                        var alertTxt;
                        if (Capriza.translator) {
                            alertTxt = Capriza.translator.getText(Capriza.translator.ids.alertSplash);
                        }
                        else {
                            alertTxt = "We seem to have encountered a technical problem.\nTech support has been notified.";
                        }
                        alert(alertTxt);
                    }
                }
            }, timeout);
        }

        setSplashTimeOut();

        Dispatcher.on('splash/hide', clearSplashTimeout);
        Dispatcher.on('splash/setTimeout', setSplashTimeOut);
        Dispatcher.on('splash/clearTimeout', clearSplashTimeout);
        Dispatcher.on('app/onPause', clearSplashTimeout);
        Dispatcher.on('app/onResume', setSplashTimeOut);
    })();

})();

(function(){
    window.errorCodes = {
        GENERAL_ERROR: {
            id: 20
        },
        GENERAL_NO_SUCH_METHOD: {id:21},
        AUTH_LOGIN_NEEDED: {id:10},
        AUTH_LOGGEDOUT: {id:11},
        AUTH_FAILURE: {id:12},
        AUTH_UNAUTHORIZED: {id:13},
        AUTH_NOT_CONFIRMED: {id:14},
        AUTH_MDM_UNAUTHORIZED: {id:15},

        noLanOrNoSessionMsg: {
            header1: "No Sessions Available",
            header2: "There are no sessions available at this time.",
            p2: "Please check your runtime configuration or contact IT for assistance.",
            buttonText:'Retry22',
            buttonAction: function () {
                Utils.reload();
            }
        },

        RUNTIME_NO_PRIVATE_LAN: {
            id:50,
            message: {
                header1: "No Sessions Available",
                header2: "There are no sessions available at this time.",
                p2: "Please check your runtime configuration or contact IT for assistance.",
                buttonText:'Retry',
                buttonAction: function () {
                    Utils.reload();
                }
            }
        },

        RUNTIME_NO_SESSION: {
            id: 51,
            message: {
                header1: "No Sessions Available",
                header2: "There are no sessions available at this time.",
                p2: "Please check your runtime configuration or contact IT for assistance.",
                buttonText: 'Retry22',
                buttonAction: function () {
                    Utils.reload();
                }
            }
        },

        RUNTIME_UNEXPECTED: {id:52},
        RUNTIME_NO_USER: {id:53},
        RUNTIME_NOT_EXISTS: {id:54},
        RUNTIME_NOT_AUTHORIZED: {
            id:55,
            message: {
                header1: "Not Authorized",
                p1: "Your current credentials do not allow you to access this app.",
                p2: "Please sign out and use your business account to access this app.",
                buttonAction: function () {
                    Dispatcher.trigger("identity/capriza/logout");
                },
                buttonText:'Signout'
            }
        },

        RUNTIME_ORG_DISABLED: {
            id:56,
            message: {
                header1: "Account Disabled",
                header2: "This zapp is unavailable",
                p2: "Please contact Capriza to enable running this zapp",
                buttonAction: function () {
                    Utils.reload();
                }
            }
        },

        AUTH_IP_UNAUTHORIZED: {
            id:15,
            message: {
                header1: "IP Not Authorized",
                header2: "This zapp is ip restricted",
                p2: "Make sure you are connected to the correct network or contact IT for assistance.",
                buttonAction: function () {
                    Utils.reload();
                }
            }
        },

        getErrorObjForId: function(id) {
            var keys = Object.keys(window.errorCodes);

            for (var i = 0; i < keys.length; i++) {
                var val = window.errorCodes[keys[i]];
                if (val.id === id) return val;
            }
        }

    };

})();


/**
 * Created with JetBrains WebStorm.
 * User: oriharel
 * Date: 5/8/13
 * Time: 2:17 PM
 * To change this template use File | Settings | File Templates.
 */
;
(function () {

    Dispatcher.on('mobile/error', function (data) {
        var view = new ErrorView();
        $('.page.active').removeClass('active');
        $('header, #settings-menu-container').remove();
        view.render(data);
    });

    var ErrorView = Backbone.View.extend({
        id: 'error-page',
        className: "page ignores-header",
        render: function (data) {
            var errorData = {};

            if (data.error_codes && data.error_codes[0] == errorCodes.RUNTIME_NOT_EXISTS.id) {
                errorData.header1 = "Sorry.";
                errorData.header2 = "This zapp is unavailable.";
                errorData.p1 = "We are looking into it.";
                errorData.p2 = "Interim please try again later or use the desktop version of the application.";

            }
            else if (data.error_codes && data.error_codes[0] == errorCodes.RUNTIME_NO_PRIVATE_LAN.id) {
                errorData.header1 = "Remote Access Offline.";

                errorData.header2 = "This zapp is unavailable.";

                errorData.p1 = "Please start Capriza Remote Access from your personal computer to run this zapp.";


            }
            else if (data.error_codes && data.error_codes[0] == errorCodes.AUTH_MDM_UNAUTHORIZED.id) {
                errorData.header1 = "MDM Required";
                errorData.p1 = "This zapp must be run through a secure MDM application";
                errorData.p2 = "Please contact your administrator for further support";

            }
            else if (data.error_codes && data.error_codes[0] == errorCodes.RUNTIME_NO_SESSION.id) {
                errorData.header1 = "Sorry.";
                errorData.header2 = "An error occurred.";
                errorData.p1 = "We are looking into it.";
                errorData.p2 = "Interim please relaunch the zapp or use the desktop version of the application.";
                if (!Capriza.isStore) {
                    errorData.buttonText = 'Relaunch Zapp';
                }

            }
            else if (data.error_codes && data.error_codes[0] == errorCodes.RUNTIME_NO_USER.id) {
                errorData.header1 = "Sorry.";
                errorData.header2 = "An error occurred.";
                errorData.p1 = "We are looking into it.";
                errorData.p2 = "Interim please try relaunching the zapp or use the desktop version of the application.";

            } else if (data.header1) {
                errorData = data;
            } else {
                errorData.header1 = "Sorry.";
                errorData.header2 = "An error occurred.";
                errorData.p1 = "We are looking into it.";
                errorData.p2 = "Interim please try relaunching the zapp or use the desktop version of the application.";
            }

            if (Capriza.isStore) {
                errorData.buttonText = 'Go Back';
                errorData.buttonAction = function () {
                    Dispatcher.trigger('app/close');
                };
            } else {
                errorData.buttonText = 'Retry';
                errorData.buttonAction = function (e) {
                    Utils.reload();
                }
            }

            $('header').removeClass('active');
            $('#start-page').removeClass('active');

            this.$el.html(Handlebars.templates['errorPage'](errorData));
            this.$el.addClass('active');

            this.$('button').click(errorData.buttonAction);
            $('#error-page').remove();
            this.$el.appendTo(".viewport");
            errorData.renderAction && errorData.renderAction();
        }
    });

    Handlebars.registerHelper('addErrorCogs', generateCogs);

    /**
     * Generates the cogs.
     * Once the stock browser supports the vw attribute, this code can be written in css...
     */
    function generateCogs(){

        // the cogs vary whenever the page's orientation changes
        window.addEventListener("resize", onOrientationChanged);
        window.addEventListener("orientationchange", onOrientationChanged);

        var view = Capriza.device.stock ? $('body') : $('.viewport'),//stock browser < 4.3 has issues with the viewport item when changing orientation
            vHeight = view.height(),
            vWidth = view.width(),
            isVertical = vWidth < vHeight,
            refSize = isVertical ? vWidth : vHeight,
            leftFontSize = 0.75 * refSize,
            rightFontSize = 0.66 * leftFontSize;

        // some samsung tablet cuts font-awesome cog, if the font size bigger than 502px and smaller than 717px. #9528
        if (Capriza.device.isTablet && !Capriza.device.ipad) {
            if (leftFontSize > 502 && leftFontSize < 717) {
                leftFontSize = 502;
                rightFontSize = 502 * 0.66;
            }
        }

        var styleLeft = 'font-size:' + leftFontSize + 'px; top:' + (-leftFontSize / 6) + 'px;',
            styleRight = 'font-size:' + rightFontSize + 'px; top:' + (-rightFontSize / 2) + 'px;';

        if (isVertical){
            styleLeft+= ' left:' + (-leftFontSize / 12) + 'px;';
            styleRight+= ' right:' + 0 + 'px;';
        } else {
            styleLeft += ' right:' + (vWidth/2) + 'px;';
            styleRight +=  ' left:' + (vWidth/2) + 'px;';
        }

        return '<i id="left-cog" class="fa fa-cog light-rotate" style="' + styleLeft + '"></i>' +
            '<i id="right-cog" class="fa fa-cog light-rotate reverse" style="' + styleRight +'"></i>';
    }

    function onOrientationChanged(){
        var pageId = $.capriza.activePage && $.capriza.activePage.attr('id');
        if (pageId && (pageId.indexOf('error') != -1 || pageId.indexOf('context-not-found') != -1)){
            var $leftCog =$('.active  #left-cog'),
                $rightCog = $('.active  #right-cog'),
                cogs = generateCogs();

            $leftCog.remove();
            $rightCog.replaceWith(cogs);
        } else {
            window.removeEventListener("resize", onOrientationChanged);
            window.removeEventListener("orientationchange", onOrientationChanged);
        }
    }
})();
