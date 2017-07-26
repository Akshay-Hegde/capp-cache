/*! mobile - v1.0.0 - 2017-06-19
* Copyright (c) 2017 ; Licensed  */

//! Source: node_modules/jquery/dist/jquery.js

try{
	/*!
 * jQuery JavaScript Library v3.2.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2017-03-20T18:59Z
 */
	( function( global, factory ) {

		"use strict";

		if ( typeof module === "object" && typeof module.exports === "object" ) {

			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

// Pass this if window is not defined yet
	} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
		"use strict";

		var arr = [];

		var document = window.document;

		var getProto = Object.getPrototypeOf;

		var slice = arr.slice;

		var concat = arr.concat;

		var push = arr.push;

		var indexOf = arr.indexOf;

		var class2type = {};

		var toString = class2type.toString;

		var hasOwn = class2type.hasOwnProperty;

		var fnToString = hasOwn.toString;

		var ObjectFunctionString = fnToString.call( Object );

		var support = {};



		function DOMEval( code, doc ) {
			doc = doc || document;

			var script = doc.createElement( "script" );

			script.text = code;
			doc.head.appendChild( script ).parentNode.removeChild( script );
		}
		/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



		var
			version = "3.2.1",

			// Define a local copy of jQuery
			jQuery = function( selector, context ) {

				// The jQuery object is actually just the init constructor 'enhanced'
				// Need init if jQuery is called (just allow error to be thrown if not included)
				return new jQuery.fn.init( selector, context );
			},

			// Support: Android <=4.0 only
			// Make sure we trim BOM and NBSP
			rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

			// Matches dashed string for camelizing
			rmsPrefix = /^-ms-/,
			rdashAlpha = /-([a-z])/g,

			// Used by jQuery.camelCase as callback to replace()
			fcamelCase = function( all, letter ) {
				return letter.toUpperCase();
			};

		jQuery.fn = jQuery.prototype = {

			// The current version of jQuery being used
			jquery: version,

			constructor: jQuery,

			// The default length of a jQuery object is 0
			length: 0,

			toArray: function() {
				return slice.call( this );
			},

			// Get the Nth element in the matched element set OR
			// Get the whole matched element set as a clean array
			get: function( num ) {

				// Return all the elements in a clean array
				if ( num == null ) {
					return slice.call( this );
				}

				// Return just the one element from the set
				return num < 0 ? this[ num + this.length ] : this[ num ];
			},

			// Take an array of elements and push it onto the stack
			// (returning the new matched element set)
			pushStack: function( elems ) {

				// Build a new jQuery matched element set
				var ret = jQuery.merge( this.constructor(), elems );

				// Add the old object onto the stack (as a reference)
				ret.prevObject = this;

				// Return the newly-formed element set
				return ret;
			},

			// Execute a callback for every element in the matched set.
			each: function( callback ) {
				return jQuery.each( this, callback );
			},

			map: function( callback ) {
				return this.pushStack( jQuery.map( this, function( elem, i ) {
					return callback.call( elem, i, elem );
				} ) );
			},

			slice: function() {
				return this.pushStack( slice.apply( this, arguments ) );
			},

			first: function() {
				return this.eq( 0 );
			},

			last: function() {
				return this.eq( -1 );
			},

			eq: function( i ) {
				var len = this.length,
				    j = +i + ( i < 0 ? len : 0 );
				return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
			},

			end: function() {
				return this.prevObject || this.constructor();
			},

			// For internal use only.
			// Behaves like an Array's method, not like a jQuery method.
			push: push,
			sort: arr.sort,
			splice: arr.splice
		};

		jQuery.extend = jQuery.fn.extend = function() {
			var options, name, src, copy, copyIsArray, clone,
			    target = arguments[ 0 ] || {},
			    i = 1,
			    length = arguments.length,
			    deep = false;

			// Handle a deep copy situation
			if ( typeof target === "boolean" ) {
				deep = target;

				// Skip the boolean and the target
				target = arguments[ i ] || {};
				i++;
			}

			// Handle case when target is a string or something (possible in deep copy)
			if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
				target = {};
			}

			// Extend jQuery itself if only one argument is passed
			if ( i === length ) {
				target = this;
				i--;
			}

			for ( ; i < length; i++ ) {

				// Only deal with non-null/undefined values
				if ( ( options = arguments[ i ] ) != null ) {

					// Extend the base object
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];

						// Prevent never-ending loop
						if ( target === copy ) {
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
							( copyIsArray = Array.isArray( copy ) ) ) ) {

							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && Array.isArray( src ) ? src : [];

							} else {
								clone = src && jQuery.isPlainObject( src ) ? src : {};
							}

							// Never move original objects, clone them
							target[ name ] = jQuery.extend( deep, clone, copy );

							// Don't bring in undefined values
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		};

		jQuery.extend( {

			// Unique for each copy of jQuery on the page
			expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

			// Assume jQuery is ready without the ready module
			isReady: true,

			error: function( msg ) {
				throw new Error( msg );
			},

			noop: function() {},

			isFunction: function( obj ) {
				return jQuery.type( obj ) === "function";
			},

			isWindow: function( obj ) {
				return obj != null && obj === obj.window;
			},

			isNumeric: function( obj ) {

				// As of jQuery 3.0, isNumeric is limited to
				// strings and numbers (primitives or objects)
				// that can be coerced to finite numbers (gh-2662)
				var type = jQuery.type( obj );
				return ( type === "number" || type === "string" ) &&

					// parseFloat NaNs numeric-cast false positives ("")
					// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
					// subtraction forces infinities to NaN
					!isNaN( obj - parseFloat( obj ) );
			},

			isPlainObject: function( obj ) {
				var proto, Ctor;

				// Detect obvious negatives
				// Use toString instead of jQuery.type to catch host objects
				if ( !obj || toString.call( obj ) !== "[object Object]" ) {
					return false;
				}

				proto = getProto( obj );

				// Objects with no prototype (e.g., `Object.create( null )`) are plain
				if ( !proto ) {
					return true;
				}

				// Objects with prototype are plain iff they were constructed by a global Object function
				Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
				return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
			},

			isEmptyObject: function( obj ) {

				/* eslint-disable no-unused-vars */
				// See https://github.com/eslint/eslint/issues/6125
				var name;

				for ( name in obj ) {
					return false;
				}
				return true;
			},

			type: function( obj ) {
				if ( obj == null ) {
					return obj + "";
				}

				// Support: Android <=2.3 only (functionish RegExp)
				return typeof obj === "object" || typeof obj === "function" ?
					class2type[ toString.call( obj ) ] || "object" :
					typeof obj;
			},

			// Evaluates a script in a global context
			globalEval: function( code ) {
				DOMEval( code );
			},

			// Convert dashed to camelCase; used by the css and data modules
			// Support: IE <=9 - 11, Edge 12 - 13
			// Microsoft forgot to hump their vendor prefix (#9572)
			camelCase: function( string ) {
				return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
			},

			each: function( obj, callback ) {
				var length, i = 0;

				if ( isArrayLike( obj ) ) {
					length = obj.length;
					for ( ; i < length; i++ ) {
						if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
							break;
						}
					}
				} else {
					for ( i in obj ) {
						if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
							break;
						}
					}
				}

				return obj;
			},

			// Support: Android <=4.0 only
			trim: function( text ) {
				return text == null ?
					"" :
					( text + "" ).replace( rtrim, "" );
			},

			// results is for internal usage only
			makeArray: function( arr, results ) {
				var ret = results || [];

				if ( arr != null ) {
					if ( isArrayLike( Object( arr ) ) ) {
						jQuery.merge( ret,
							typeof arr === "string" ?
								[ arr ] : arr
						);
					} else {
						push.call( ret, arr );
					}
				}

				return ret;
			},

			inArray: function( elem, arr, i ) {
				return arr == null ? -1 : indexOf.call( arr, elem, i );
			},

			// Support: Android <=4.0 only, PhantomJS 1 only
			// push.apply(_, arraylike) throws on ancient WebKit
			merge: function( first, second ) {
				var len = +second.length,
				    j = 0,
				    i = first.length;

				for ( ; j < len; j++ ) {
					first[ i++ ] = second[ j ];
				}

				first.length = i;

				return first;
			},

			grep: function( elems, callback, invert ) {
				var callbackInverse,
				    matches = [],
				    i = 0,
				    length = elems.length,
				    callbackExpect = !invert;

				// Go through the array, only saving the items
				// that pass the validator function
				for ( ; i < length; i++ ) {
					callbackInverse = !callback( elems[ i ], i );
					if ( callbackInverse !== callbackExpect ) {
						matches.push( elems[ i ] );
					}
				}

				return matches;
			},

			// arg is for internal usage only
			map: function( elems, callback, arg ) {
				var length, value,
				    i = 0,
				    ret = [];

				// Go through the array, translating each of the items to their new values
				if ( isArrayLike( elems ) ) {
					length = elems.length;
					for ( ; i < length; i++ ) {
						value = callback( elems[ i ], i, arg );

						if ( value != null ) {
							ret.push( value );
						}
					}

					// Go through every key on the object,
				} else {
					for ( i in elems ) {
						value = callback( elems[ i ], i, arg );

						if ( value != null ) {
							ret.push( value );
						}
					}
				}

				// Flatten any nested arrays
				return concat.apply( [], ret );
			},

			// A global GUID counter for objects
			guid: 1,

			// Bind a function to a context, optionally partially applying any
			// arguments.
			proxy: function( fn, context ) {
				var tmp, args, proxy;

				if ( typeof context === "string" ) {
					tmp = fn[ context ];
					context = fn;
					fn = tmp;
				}

				// Quick check to determine if target is callable, in the spec
				// this throws a TypeError, but we will just return undefined.
				if ( !jQuery.isFunction( fn ) ) {
					return undefined;
				}

				// Simulated bind
				args = slice.call( arguments, 2 );
				proxy = function() {
					return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
				};

				// Set the guid of unique handler to the same of original handler, so it can be removed
				proxy.guid = fn.guid = fn.guid || jQuery.guid++;

				return proxy;
			},

			now: Date.now,

			// jQuery.support is not used in Core but other projects attach their
			// properties to it so it needs to exist.
			support: support
		} );

		if ( typeof Symbol === "function" ) {
			jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
		}

// Populate the class2type map
		jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
			function( i, name ) {
				class2type[ "[object " + name + "]" ] = name.toLowerCase();
			} );

		function isArrayLike( obj ) {

			// Support: real iOS 8.2 only (not reproducible in simulator)
			// `in` check used to prevent JIT error (gh-2145)
			// hasOwn isn't used here due to false negatives
			// regarding Nodelist length in IE
			var length = !!obj && "length" in obj && obj.length,
			    type = jQuery.type( obj );

			if ( type === "function" || jQuery.isWindow( obj ) ) {
				return false;
			}

			return type === "array" || length === 0 ||
				typeof length === "number" && length > 0 && ( length - 1 ) in obj;
		}
		var Sizzle =
			    /*!
 * Sizzle CSS Selector Engine v2.3.3
 * https://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-08-08
 */
			    (function( window ) {

				    var i,
				        support,
				        Expr,
				        getText,
				        isXML,
				        tokenize,
				        compile,
				        select,
				        outermostContext,
				        sortInput,
				        hasDuplicate,

				        // Local document vars
				        setDocument,
				        document,
				        docElem,
				        documentIsHTML,
				        rbuggyQSA,
				        rbuggyMatches,
				        matches,
				        contains,

				        // Instance-specific data
				        expando = "sizzle" + 1 * new Date(),
				        preferredDoc = window.document,
				        dirruns = 0,
				        done = 0,
				        classCache = createCache(),
				        tokenCache = createCache(),
				        compilerCache = createCache(),
				        sortOrder = function( a, b ) {
					        if ( a === b ) {
						        hasDuplicate = true;
					        }
					        return 0;
				        },

				        // Instance methods
				        hasOwn = ({}).hasOwnProperty,
				        arr = [],
				        pop = arr.pop,
				        push_native = arr.push,
				        push = arr.push,
				        slice = arr.slice,
				        // Use a stripped-down indexOf as it's faster than native
				        // https://jsperf.com/thor-indexof-vs-for/5
				        indexOf = function( list, elem ) {
					        var i = 0,
					            len = list.length;
					        for ( ; i < len; i++ ) {
						        if ( list[i] === elem ) {
							        return i;
						        }
					        }
					        return -1;
				        },

				        booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

				        // Regular expressions

				        // http://www.w3.org/TR/css3-selectors/#whitespace
				        whitespace = "[\\x20\\t\\r\\n\\f]",

				        // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
				        identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

				        // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
				        attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
					        // Operator (capture 2)
					        "*([*^$|!~]?=)" + whitespace +
					        // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
					        "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
					        "*\\]",

				        pseudos = ":(" + identifier + ")(?:\\((" +
					        // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
					        // 1. quoted (capture 3; capture 4 or capture 5)
					        "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
					        // 2. simple (capture 6)
					        "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
					        // 3. anything else (capture 2)
					        ".*" +
					        ")\\)|)",

				        // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
				        rwhitespace = new RegExp( whitespace + "+", "g" ),
				        rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

				        rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
				        rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

				        rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

				        rpseudo = new RegExp( pseudos ),
				        ridentifier = new RegExp( "^" + identifier + "$" ),

				        matchExpr = {
					        "ID": new RegExp( "^#(" + identifier + ")" ),
					        "CLASS": new RegExp( "^\\.(" + identifier + ")" ),
					        "TAG": new RegExp( "^(" + identifier + "|[*])" ),
					        "ATTR": new RegExp( "^" + attributes ),
					        "PSEUDO": new RegExp( "^" + pseudos ),
					        "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
						        "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
						        "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
					        "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
					        // For use in libraries implementing .is()
					        // We use this for POS matching in `select`
					        "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
						        whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
				        },

				        rinputs = /^(?:input|select|textarea|button)$/i,
				        rheader = /^h\d$/i,

				        rnative = /^[^{]+\{\s*\[native \w/,

				        // Easily-parseable/retrievable ID or TAG or CLASS selectors
				        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

				        rsibling = /[+~]/,

				        // CSS escapes
				        // http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
				        runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
				        funescape = function( _, escaped, escapedWhitespace ) {
					        var high = "0x" + escaped - 0x10000;
					        // NaN means non-codepoint
					        // Support: Firefox<24
					        // Workaround erroneous numeric interpretation of +"0x"
					        return high !== high || escapedWhitespace ?
						        escaped :
						        high < 0 ?
							        // BMP codepoint
							        String.fromCharCode( high + 0x10000 ) :
							        // Supplemental Plane codepoint (surrogate pair)
							        String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
				        },

				        // CSS string/identifier serialization
				        // https://drafts.csswg.org/cssom/#common-serializing-idioms
				        rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
				        fcssescape = function( ch, asCodePoint ) {
					        if ( asCodePoint ) {

						        // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
						        if ( ch === "\0" ) {
							        return "\uFFFD";
						        }

						        // Control characters and (dependent upon position) numbers get escaped as code points
						        return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
					        }

					        // Other potentially-special ASCII characters get backslash-escaped
					        return "\\" + ch;
				        },

				        // Used for iframes
				        // See setDocument()
				        // Removing the function wrapper causes a "Permission Denied"
				        // error in IE
				        unloadHandler = function() {
					        setDocument();
				        },

				        disabledAncestor = addCombinator(
					        function( elem ) {
						        return elem.disabled === true && ("form" in elem || "label" in elem);
					        },
					        { dir: "parentNode", next: "legend" }
				        );

// Optimize for push.apply( _, NodeList )
				    try {
					    push.apply(
						    (arr = slice.call( preferredDoc.childNodes )),
						    preferredDoc.childNodes
					    );
					    // Support: Android<4.0
					    // Detect silently failing push.apply
					    arr[ preferredDoc.childNodes.length ].nodeType;
				    } catch ( e ) {
					    push = { apply: arr.length ?

						    // Leverage slice if possible
						    function( target, els ) {
							    push_native.apply( target, slice.call(els) );
						    } :

						    // Support: IE<9
						    // Otherwise append directly
						    function( target, els ) {
							    var j = target.length,
							        i = 0;
							    // Can't trust NodeList.length
							    while ( (target[j++] = els[i++]) ) {}
							    target.length = j - 1;
						    }
					    };
				    }

				    function Sizzle( selector, context, results, seed ) {
					    var m, i, elem, nid, match, groups, newSelector,
					        newContext = context && context.ownerDocument,

					        // nodeType defaults to 9, since context defaults to document
					        nodeType = context ? context.nodeType : 9;

					    results = results || [];

					    // Return early from calls with invalid selector or context
					    if ( typeof selector !== "string" || !selector ||
						    nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

						    return results;
					    }

					    // Try to shortcut find operations (as opposed to filters) in HTML documents
					    if ( !seed ) {

						    if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
							    setDocument( context );
						    }
						    context = context || document;

						    if ( documentIsHTML ) {

							    // If the selector is sufficiently simple, try using a "get*By*" DOM method
							    // (excepting DocumentFragment context, where the methods don't exist)
							    if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

								    // ID selector
								    if ( (m = match[1]) ) {

									    // Document context
									    if ( nodeType === 9 ) {
										    if ( (elem = context.getElementById( m )) ) {

											    // Support: IE, Opera, Webkit
											    // TODO: identify versions
											    // getElementById can match elements by name instead of ID
											    if ( elem.id === m ) {
												    results.push( elem );
												    return results;
											    }
										    } else {
											    return results;
										    }

										    // Element context
									    } else {

										    // Support: IE, Opera, Webkit
										    // TODO: identify versions
										    // getElementById can match elements by name instead of ID
										    if ( newContext && (elem = newContext.getElementById( m )) &&
											    contains( context, elem ) &&
											    elem.id === m ) {

											    results.push( elem );
											    return results;
										    }
									    }

									    // Type selector
								    } else if ( match[2] ) {
									    push.apply( results, context.getElementsByTagName( selector ) );
									    return results;

									    // Class selector
								    } else if ( (m = match[3]) && support.getElementsByClassName &&
									    context.getElementsByClassName ) {

									    push.apply( results, context.getElementsByClassName( m ) );
									    return results;
								    }
							    }

							    // Take advantage of querySelectorAll
							    if ( support.qsa &&
								    !compilerCache[ selector + " " ] &&
								    (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

								    if ( nodeType !== 1 ) {
									    newContext = context;
									    newSelector = selector;

									    // qSA looks outside Element context, which is not what we want
									    // Thanks to Andrew Dupont for this workaround technique
									    // Support: IE <=8
									    // Exclude object elements
								    } else if ( context.nodeName.toLowerCase() !== "object" ) {

									    // Capture the context ID, setting it first if necessary
									    if ( (nid = context.getAttribute( "id" )) ) {
										    nid = nid.replace( rcssescape, fcssescape );
									    } else {
										    context.setAttribute( "id", (nid = expando) );
									    }

									    // Prefix every selector in the list
									    groups = tokenize( selector );
									    i = groups.length;
									    while ( i-- ) {
										    groups[i] = "#" + nid + " " + toSelector( groups[i] );
									    }
									    newSelector = groups.join( "," );

									    // Expand context for sibling selectors
									    newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
										    context;
								    }

								    if ( newSelector ) {
									    try {
										    push.apply( results,
											    newContext.querySelectorAll( newSelector )
										    );
										    return results;
									    } catch ( qsaError ) {
									    } finally {
										    if ( nid === expando ) {
											    context.removeAttribute( "id" );
										    }
									    }
								    }
							    }
						    }
					    }

					    // All others
					    return select( selector.replace( rtrim, "$1" ), context, results, seed );
				    }

				    /**
				     * Create key-value caches of limited size
				     * @returns {function(string, object)} Returns the Object data after storing it on itself with
				     *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
				     *	deleting the oldest entry
				     */
				    function createCache() {
					    var keys = [];

					    function cache( key, value ) {
						    // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
						    if ( keys.push( key + " " ) > Expr.cacheLength ) {
							    // Only keep the most recent entries
							    delete cache[ keys.shift() ];
						    }
						    return (cache[ key + " " ] = value);
					    }
					    return cache;
				    }

				    /**
				     * Mark a function for special use by Sizzle
				     * @param {Function} fn The function to mark
				     */
				    function markFunction( fn ) {
					    fn[ expando ] = true;
					    return fn;
				    }

				    /**
				     * Support testing using an element
				     * @param {Function} fn Passed the created element and returns a boolean result
				     */
				    function assert( fn ) {
					    var el = document.createElement("fieldset");

					    try {
						    return !!fn( el );
					    } catch (e) {
						    return false;
					    } finally {
						    // Remove from its parent by default
						    if ( el.parentNode ) {
							    el.parentNode.removeChild( el );
						    }
						    // release memory in IE
						    el = null;
					    }
				    }

				    /**
				     * Adds the same handler for all of the specified attrs
				     * @param {String} attrs Pipe-separated list of attributes
				     * @param {Function} handler The method that will be applied
				     */
				    function addHandle( attrs, handler ) {
					    var arr = attrs.split("|"),
					        i = arr.length;

					    while ( i-- ) {
						    Expr.attrHandle[ arr[i] ] = handler;
					    }
				    }

				    /**
				     * Checks document order of two siblings
				     * @param {Element} a
				     * @param {Element} b
				     * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
				     */
				    function siblingCheck( a, b ) {
					    var cur = b && a,
					        diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
						        a.sourceIndex - b.sourceIndex;

					    // Use IE sourceIndex if available on both nodes
					    if ( diff ) {
						    return diff;
					    }

					    // Check if b follows a
					    if ( cur ) {
						    while ( (cur = cur.nextSibling) ) {
							    if ( cur === b ) {
								    return -1;
							    }
						    }
					    }

					    return a ? 1 : -1;
				    }

				    /**
				     * Returns a function to use in pseudos for input types
				     * @param {String} type
				     */
				    function createInputPseudo( type ) {
					    return function( elem ) {
						    var name = elem.nodeName.toLowerCase();
						    return name === "input" && elem.type === type;
					    };
				    }

				    /**
				     * Returns a function to use in pseudos for buttons
				     * @param {String} type
				     */
				    function createButtonPseudo( type ) {
					    return function( elem ) {
						    var name = elem.nodeName.toLowerCase();
						    return (name === "input" || name === "button") && elem.type === type;
					    };
				    }

				    /**
				     * Returns a function to use in pseudos for :enabled/:disabled
				     * @param {Boolean} disabled true for :disabled; false for :enabled
				     */
				    function createDisabledPseudo( disabled ) {

					    // Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
					    return function( elem ) {

						    // Only certain elements can match :enabled or :disabled
						    // https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
						    // https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
						    if ( "form" in elem ) {

							    // Check for inherited disabledness on relevant non-disabled elements:
							    // * listed form-associated elements in a disabled fieldset
							    //   https://html.spec.whatwg.org/multipage/forms.html#category-listed
							    //   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
							    // * option elements in a disabled optgroup
							    //   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
							    // All such elements have a "form" property.
							    if ( elem.parentNode && elem.disabled === false ) {

								    // Option elements defer to a parent optgroup if present
								    if ( "label" in elem ) {
									    if ( "label" in elem.parentNode ) {
										    return elem.parentNode.disabled === disabled;
									    } else {
										    return elem.disabled === disabled;
									    }
								    }

								    // Support: IE 6 - 11
								    // Use the isDisabled shortcut property to check for disabled fieldset ancestors
								    return elem.isDisabled === disabled ||

									    // Where there is no isDisabled, check manually
									    /* jshint -W018 */
									    elem.isDisabled !== !disabled &&
									    disabledAncestor( elem ) === disabled;
							    }

							    return elem.disabled === disabled;

							    // Try to winnow out elements that can't be disabled before trusting the disabled property.
							    // Some victims get caught in our net (label, legend, menu, track), but it shouldn't
							    // even exist on them, let alone have a boolean value.
						    } else if ( "label" in elem ) {
							    return elem.disabled === disabled;
						    }

						    // Remaining elements are neither :enabled nor :disabled
						    return false;
					    };
				    }

				    /**
				     * Returns a function to use in pseudos for positionals
				     * @param {Function} fn
				     */
				    function createPositionalPseudo( fn ) {
					    return markFunction(function( argument ) {
						    argument = +argument;
						    return markFunction(function( seed, matches ) {
							    var j,
							        matchIndexes = fn( [], seed.length, argument ),
							        i = matchIndexes.length;

							    // Match elements found at the specified indexes
							    while ( i-- ) {
								    if ( seed[ (j = matchIndexes[i]) ] ) {
									    seed[j] = !(matches[j] = seed[j]);
								    }
							    }
						    });
					    });
				    }

				    /**
				     * Checks a node for validity as a Sizzle context
				     * @param {Element|Object=} context
				     * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
				     */
				    function testContext( context ) {
					    return context && typeof context.getElementsByTagName !== "undefined" && context;
				    }

// Expose support vars for convenience
				    support = Sizzle.support = {};

				    /**
				     * Detects XML nodes
				     * @param {Element|Object} elem An element or a document
				     * @returns {Boolean} True iff elem is a non-HTML XML node
				     */
				    isXML = Sizzle.isXML = function( elem ) {
					    // documentElement is verified for cases where it doesn't yet exist
					    // (such as loading iframes in IE - #4833)
					    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
					    return documentElement ? documentElement.nodeName !== "HTML" : false;
				    };

				    /**
				     * Sets document-related variables once based on the current document
				     * @param {Element|Object} [doc] An element or document object to use to set the document
				     * @returns {Object} Returns the current document
				     */
				    setDocument = Sizzle.setDocument = function( node ) {
					    var hasCompare, subWindow,
					        doc = node ? node.ownerDocument || node : preferredDoc;

					    // Return early if doc is invalid or already selected
					    if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
						    return document;
					    }

					    // Update global variables
					    document = doc;
					    docElem = document.documentElement;
					    documentIsHTML = !isXML( document );

					    // Support: IE 9-11, Edge
					    // Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
					    if ( preferredDoc !== document &&
						    (subWindow = document.defaultView) && subWindow.top !== subWindow ) {

						    // Support: IE 11, Edge
						    if ( subWindow.addEventListener ) {
							    subWindow.addEventListener( "unload", unloadHandler, false );

							    // Support: IE 9 - 10 only
						    } else if ( subWindow.attachEvent ) {
							    subWindow.attachEvent( "onunload", unloadHandler );
						    }
					    }

					    /* Attributes
	---------------------------------------------------------------------- */

					    // Support: IE<8
					    // Verify that getAttribute really returns attributes and not properties
					    // (excepting IE8 booleans)
					    support.attributes = assert(function( el ) {
						    el.className = "i";
						    return !el.getAttribute("className");
					    });

					    /* getElement(s)By*
	---------------------------------------------------------------------- */

					    // Check if getElementsByTagName("*") returns only elements
					    support.getElementsByTagName = assert(function( el ) {
						    el.appendChild( document.createComment("") );
						    return !el.getElementsByTagName("*").length;
					    });

					    // Support: IE<9
					    support.getElementsByClassName = rnative.test( document.getElementsByClassName );

					    // Support: IE<10
					    // Check if getElementById returns elements by name
					    // The broken getElementById methods don't pick up programmatically-set names,
					    // so use a roundabout getElementsByName test
					    support.getById = assert(function( el ) {
						    docElem.appendChild( el ).id = expando;
						    return !document.getElementsByName || !document.getElementsByName( expando ).length;
					    });

					    // ID filter and find
					    if ( support.getById ) {
						    Expr.filter["ID"] = function( id ) {
							    var attrId = id.replace( runescape, funescape );
							    return function( elem ) {
								    return elem.getAttribute("id") === attrId;
							    };
						    };
						    Expr.find["ID"] = function( id, context ) {
							    if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
								    var elem = context.getElementById( id );
								    return elem ? [ elem ] : [];
							    }
						    };
					    } else {
						    Expr.filter["ID"] =  function( id ) {
							    var attrId = id.replace( runescape, funescape );
							    return function( elem ) {
								    var node = typeof elem.getAttributeNode !== "undefined" &&
									    elem.getAttributeNode("id");
								    return node && node.value === attrId;
							    };
						    };

						    // Support: IE 6 - 7 only
						    // getElementById is not reliable as a find shortcut
						    Expr.find["ID"] = function( id, context ) {
							    if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
								    var node, i, elems,
								        elem = context.getElementById( id );

								    if ( elem ) {

									    // Verify the id attribute
									    node = elem.getAttributeNode("id");
									    if ( node && node.value === id ) {
										    return [ elem ];
									    }

									    // Fall back on getElementsByName
									    elems = context.getElementsByName( id );
									    i = 0;
									    while ( (elem = elems[i++]) ) {
										    node = elem.getAttributeNode("id");
										    if ( node && node.value === id ) {
											    return [ elem ];
										    }
									    }
								    }

								    return [];
							    }
						    };
					    }

					    // Tag
					    Expr.find["TAG"] = support.getElementsByTagName ?
						    function( tag, context ) {
							    if ( typeof context.getElementsByTagName !== "undefined" ) {
								    return context.getElementsByTagName( tag );

								    // DocumentFragment nodes don't have gEBTN
							    } else if ( support.qsa ) {
								    return context.querySelectorAll( tag );
							    }
						    } :

						    function( tag, context ) {
							    var elem,
							        tmp = [],
							        i = 0,
							        // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
							        results = context.getElementsByTagName( tag );

							    // Filter out possible comments
							    if ( tag === "*" ) {
								    while ( (elem = results[i++]) ) {
									    if ( elem.nodeType === 1 ) {
										    tmp.push( elem );
									    }
								    }

								    return tmp;
							    }
							    return results;
						    };

					    // Class
					    Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
							    if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
								    return context.getElementsByClassName( className );
							    }
						    };

					    /* QSA/matchesSelector
	---------------------------------------------------------------------- */

					    // QSA and matchesSelector support

					    // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
					    rbuggyMatches = [];

					    // qSa(:focus) reports false when true (Chrome 21)
					    // We allow this because of a bug in IE8/9 that throws an error
					    // whenever `document.activeElement` is accessed on an iframe
					    // So, we allow :focus to pass through QSA all the time to avoid the IE error
					    // See https://bugs.jquery.com/ticket/13378
					    rbuggyQSA = [];

					    if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
						    // Build QSA regex
						    // Regex strategy adopted from Diego Perini
						    assert(function( el ) {
							    // Select is set to empty string on purpose
							    // This is to test IE's treatment of not explicitly
							    // setting a boolean content attribute,
							    // since its presence should be enough
							    // https://bugs.jquery.com/ticket/12359
							    docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
								    "<select id='" + expando + "-\r\\' msallowcapture=''>" +
								    "<option selected=''></option></select>";

							    // Support: IE8, Opera 11-12.16
							    // Nothing should be selected when empty strings follow ^= or $= or *=
							    // The test attribute must be unknown in Opera but "safe" for WinRT
							    // https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
							    if ( el.querySelectorAll("[msallowcapture^='']").length ) {
								    rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
							    }

							    // Support: IE8
							    // Boolean attributes and "value" are not treated correctly
							    if ( !el.querySelectorAll("[selected]").length ) {
								    rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
							    }

							    // Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
							    if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
								    rbuggyQSA.push("~=");
							    }

							    // Webkit/Opera - :checked should return selected option elements
							    // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
							    // IE8 throws error here and will not see later tests
							    if ( !el.querySelectorAll(":checked").length ) {
								    rbuggyQSA.push(":checked");
							    }

							    // Support: Safari 8+, iOS 8+
							    // https://bugs.webkit.org/show_bug.cgi?id=136851
							    // In-page `selector#id sibling-combinator selector` fails
							    if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
								    rbuggyQSA.push(".#.+[+~]");
							    }
						    });

						    assert(function( el ) {
							    el.innerHTML = "<a href='' disabled='disabled'></a>" +
								    "<select disabled='disabled'><option/></select>";

							    // Support: Windows 8 Native Apps
							    // The type and name attributes are restricted during .innerHTML assignment
							    var input = document.createElement("input");
							    input.setAttribute( "type", "hidden" );
							    el.appendChild( input ).setAttribute( "name", "D" );

							    // Support: IE8
							    // Enforce case-sensitivity of name attribute
							    if ( el.querySelectorAll("[name=d]").length ) {
								    rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
							    }

							    // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
							    // IE8 throws error here and will not see later tests
							    if ( el.querySelectorAll(":enabled").length !== 2 ) {
								    rbuggyQSA.push( ":enabled", ":disabled" );
							    }

							    // Support: IE9-11+
							    // IE's :disabled selector does not pick up the children of disabled fieldsets
							    docElem.appendChild( el ).disabled = true;
							    if ( el.querySelectorAll(":disabled").length !== 2 ) {
								    rbuggyQSA.push( ":enabled", ":disabled" );
							    }

							    // Opera 10-11 does not throw on post-comma invalid pseudos
							    el.querySelectorAll("*,:x");
							    rbuggyQSA.push(",.*:");
						    });
					    }

					    if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
							    docElem.webkitMatchesSelector ||
							    docElem.mozMatchesSelector ||
							    docElem.oMatchesSelector ||
							    docElem.msMatchesSelector) )) ) {

						    assert(function( el ) {
							    // Check to see if it's possible to do matchesSelector
							    // on a disconnected node (IE 9)
							    support.disconnectedMatch = matches.call( el, "*" );

							    // This should fail with an exception
							    // Gecko does not error, returns false instead
							    matches.call( el, "[s!='']:x" );
							    rbuggyMatches.push( "!=", pseudos );
						    });
					    }

					    rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
					    rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

					    /* Contains
	---------------------------------------------------------------------- */
					    hasCompare = rnative.test( docElem.compareDocumentPosition );

					    // Element contains another
					    // Purposefully self-exclusive
					    // As in, an element does not contain itself
					    contains = hasCompare || rnative.test( docElem.contains ) ?
						    function( a, b ) {
							    var adown = a.nodeType === 9 ? a.documentElement : a,
							        bup = b && b.parentNode;
							    return a === bup || !!( bup && bup.nodeType === 1 && (
									    adown.contains ?
										    adown.contains( bup ) :
										    a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
								    ));
						    } :
						    function( a, b ) {
							    if ( b ) {
								    while ( (b = b.parentNode) ) {
									    if ( b === a ) {
										    return true;
									    }
								    }
							    }
							    return false;
						    };

					    /* Sorting
	---------------------------------------------------------------------- */

					    // Document order sorting
					    sortOrder = hasCompare ?
						    function( a, b ) {

							    // Flag for duplicate removal
							    if ( a === b ) {
								    hasDuplicate = true;
								    return 0;
							    }

							    // Sort on method existence if only one input has compareDocumentPosition
							    var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
							    if ( compare ) {
								    return compare;
							    }

							    // Calculate position if both inputs belong to the same document
							    compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
								    a.compareDocumentPosition( b ) :

								    // Otherwise we know they are disconnected
								    1;

							    // Disconnected nodes
							    if ( compare & 1 ||
								    (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

								    // Choose the first element that is related to our preferred document
								    if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
									    return -1;
								    }
								    if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
									    return 1;
								    }

								    // Maintain original order
								    return sortInput ?
									    ( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
									    0;
							    }

							    return compare & 4 ? -1 : 1;
						    } :
						    function( a, b ) {
							    // Exit early if the nodes are identical
							    if ( a === b ) {
								    hasDuplicate = true;
								    return 0;
							    }

							    var cur,
							        i = 0,
							        aup = a.parentNode,
							        bup = b.parentNode,
							        ap = [ a ],
							        bp = [ b ];

							    // Parentless nodes are either documents or disconnected
							    if ( !aup || !bup ) {
								    return a === document ? -1 :
									    b === document ? 1 :
										    aup ? -1 :
											    bup ? 1 :
												    sortInput ?
													    ( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
													    0;

								    // If the nodes are siblings, we can do a quick check
							    } else if ( aup === bup ) {
								    return siblingCheck( a, b );
							    }

							    // Otherwise we need full lists of their ancestors for comparison
							    cur = a;
							    while ( (cur = cur.parentNode) ) {
								    ap.unshift( cur );
							    }
							    cur = b;
							    while ( (cur = cur.parentNode) ) {
								    bp.unshift( cur );
							    }

							    // Walk down the tree looking for a discrepancy
							    while ( ap[i] === bp[i] ) {
								    i++;
							    }

							    return i ?
								    // Do a sibling check if the nodes have a common ancestor
								    siblingCheck( ap[i], bp[i] ) :

								    // Otherwise nodes in our document sort first
								    ap[i] === preferredDoc ? -1 :
									    bp[i] === preferredDoc ? 1 :
										    0;
						    };

					    return document;
				    };

				    Sizzle.matches = function( expr, elements ) {
					    return Sizzle( expr, null, null, elements );
				    };

				    Sizzle.matchesSelector = function( elem, expr ) {
					    // Set document vars if needed
					    if ( ( elem.ownerDocument || elem ) !== document ) {
						    setDocument( elem );
					    }

					    // Make sure that attribute selectors are quoted
					    expr = expr.replace( rattributeQuotes, "='$1']" );

					    if ( support.matchesSelector && documentIsHTML &&
						    !compilerCache[ expr + " " ] &&
						    ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
						    ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

						    try {
							    var ret = matches.call( elem, expr );

							    // IE 9's matchesSelector returns false on disconnected nodes
							    if ( ret || support.disconnectedMatch ||
								    // As well, disconnected nodes are said to be in a document
								    // fragment in IE 9
								    elem.document && elem.document.nodeType !== 11 ) {
								    return ret;
							    }
						    } catch (e) {}
					    }

					    return Sizzle( expr, document, null, [ elem ] ).length > 0;
				    };

				    Sizzle.contains = function( context, elem ) {
					    // Set document vars if needed
					    if ( ( context.ownerDocument || context ) !== document ) {
						    setDocument( context );
					    }
					    return contains( context, elem );
				    };

				    Sizzle.attr = function( elem, name ) {
					    // Set document vars if needed
					    if ( ( elem.ownerDocument || elem ) !== document ) {
						    setDocument( elem );
					    }

					    var fn = Expr.attrHandle[ name.toLowerCase() ],
					        // Don't get fooled by Object.prototype properties (jQuery #13807)
					        val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
						        fn( elem, name, !documentIsHTML ) :
						        undefined;

					    return val !== undefined ?
						    val :
						    support.attributes || !documentIsHTML ?
							    elem.getAttribute( name ) :
							    (val = elem.getAttributeNode(name)) && val.specified ?
								    val.value :
								    null;
				    };

				    Sizzle.escape = function( sel ) {
					    return (sel + "").replace( rcssescape, fcssescape );
				    };

				    Sizzle.error = function( msg ) {
					    throw new Error( "Syntax error, unrecognized expression: " + msg );
				    };

				    /**
				     * Document sorting and removing duplicates
				     * @param {ArrayLike} results
				     */
				    Sizzle.uniqueSort = function( results ) {
					    var elem,
					        duplicates = [],
					        j = 0,
					        i = 0;

					    // Unless we *know* we can detect duplicates, assume their presence
					    hasDuplicate = !support.detectDuplicates;
					    sortInput = !support.sortStable && results.slice( 0 );
					    results.sort( sortOrder );

					    if ( hasDuplicate ) {
						    while ( (elem = results[i++]) ) {
							    if ( elem === results[ i ] ) {
								    j = duplicates.push( i );
							    }
						    }
						    while ( j-- ) {
							    results.splice( duplicates[ j ], 1 );
						    }
					    }

					    // Clear input after sorting to release objects
					    // See https://github.com/jquery/sizzle/pull/225
					    sortInput = null;

					    return results;
				    };

				    /**
				     * Utility function for retrieving the text value of an array of DOM nodes
				     * @param {Array|Element} elem
				     */
				    getText = Sizzle.getText = function( elem ) {
					    var node,
					        ret = "",
					        i = 0,
					        nodeType = elem.nodeType;

					    if ( !nodeType ) {
						    // If no nodeType, this is expected to be an array
						    while ( (node = elem[i++]) ) {
							    // Do not traverse comment nodes
							    ret += getText( node );
						    }
					    } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
						    // Use textContent for elements
						    // innerText usage removed for consistency of new lines (jQuery #11153)
						    if ( typeof elem.textContent === "string" ) {
							    return elem.textContent;
						    } else {
							    // Traverse its children
							    for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
								    ret += getText( elem );
							    }
						    }
					    } else if ( nodeType === 3 || nodeType === 4 ) {
						    return elem.nodeValue;
					    }
					    // Do not include comment or processing instruction nodes

					    return ret;
				    };

				    Expr = Sizzle.selectors = {

					    // Can be adjusted by the user
					    cacheLength: 50,

					    createPseudo: markFunction,

					    match: matchExpr,

					    attrHandle: {},

					    find: {},

					    relative: {
						    ">": { dir: "parentNode", first: true },
						    " ": { dir: "parentNode" },
						    "+": { dir: "previousSibling", first: true },
						    "~": { dir: "previousSibling" }
					    },

					    preFilter: {
						    "ATTR": function( match ) {
							    match[1] = match[1].replace( runescape, funescape );

							    // Move the given value to match[3] whether quoted or unquoted
							    match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

							    if ( match[2] === "~=" ) {
								    match[3] = " " + match[3] + " ";
							    }

							    return match.slice( 0, 4 );
						    },

						    "CHILD": function( match ) {
							    /* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
							    match[1] = match[1].toLowerCase();

							    if ( match[1].slice( 0, 3 ) === "nth" ) {
								    // nth-* requires argument
								    if ( !match[3] ) {
									    Sizzle.error( match[0] );
								    }

								    // numeric x and y parameters for Expr.filter.CHILD
								    // remember that false/true cast respectively to 0/1
								    match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
								    match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

								    // other types prohibit arguments
							    } else if ( match[3] ) {
								    Sizzle.error( match[0] );
							    }

							    return match;
						    },

						    "PSEUDO": function( match ) {
							    var excess,
							        unquoted = !match[6] && match[2];

							    if ( matchExpr["CHILD"].test( match[0] ) ) {
								    return null;
							    }

							    // Accept quoted arguments as-is
							    if ( match[3] ) {
								    match[2] = match[4] || match[5] || "";

								    // Strip excess characters from unquoted arguments
							    } else if ( unquoted && rpseudo.test( unquoted ) &&
								    // Get excess from tokenize (recursively)
								    (excess = tokenize( unquoted, true )) &&
								    // advance to the next closing parenthesis
								    (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

								    // excess is a negative index
								    match[0] = match[0].slice( 0, excess );
								    match[2] = unquoted.slice( 0, excess );
							    }

							    // Return only captures needed by the pseudo filter method (type and argument)
							    return match.slice( 0, 3 );
						    }
					    },

					    filter: {

						    "TAG": function( nodeNameSelector ) {
							    var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
							    return nodeNameSelector === "*" ?
								    function() { return true; } :
								    function( elem ) {
									    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
								    };
						    },

						    "CLASS": function( className ) {
							    var pattern = classCache[ className + " " ];

							    return pattern ||
								    (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
								    classCache( className, function( elem ) {
									    return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
								    });
						    },

						    "ATTR": function( name, operator, check ) {
							    return function( elem ) {
								    var result = Sizzle.attr( elem, name );

								    if ( result == null ) {
									    return operator === "!=";
								    }
								    if ( !operator ) {
									    return true;
								    }

								    result += "";

								    return operator === "=" ? result === check :
									    operator === "!=" ? result !== check :
										    operator === "^=" ? check && result.indexOf( check ) === 0 :
											    operator === "*=" ? check && result.indexOf( check ) > -1 :
												    operator === "$=" ? check && result.slice( -check.length ) === check :
													    operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
														    operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
															    false;
							    };
						    },

						    "CHILD": function( type, what, argument, first, last ) {
							    var simple = type.slice( 0, 3 ) !== "nth",
							        forward = type.slice( -4 ) !== "last",
							        ofType = what === "of-type";

							    return first === 1 && last === 0 ?

								    // Shortcut for :nth-*(n)
								    function( elem ) {
									    return !!elem.parentNode;
								    } :

								    function( elem, context, xml ) {
									    var cache, uniqueCache, outerCache, node, nodeIndex, start,
									        dir = simple !== forward ? "nextSibling" : "previousSibling",
									        parent = elem.parentNode,
									        name = ofType && elem.nodeName.toLowerCase(),
									        useCache = !xml && !ofType,
									        diff = false;

									    if ( parent ) {

										    // :(first|last|only)-(child|of-type)
										    if ( simple ) {
											    while ( dir ) {
												    node = elem;
												    while ( (node = node[ dir ]) ) {
													    if ( ofType ?
															    node.nodeName.toLowerCase() === name :
															    node.nodeType === 1 ) {

														    return false;
													    }
												    }
												    // Reverse direction for :only-* (if we haven't yet done so)
												    start = dir = type === "only" && !start && "nextSibling";
											    }
											    return true;
										    }

										    start = [ forward ? parent.firstChild : parent.lastChild ];

										    // non-xml :nth-child(...) stores cache data on `parent`
										    if ( forward && useCache ) {

											    // Seek `elem` from a previously-cached index

											    // ...in a gzip-friendly way
											    node = parent;
											    outerCache = node[ expando ] || (node[ expando ] = {});

											    // Support: IE <9 only
											    // Defend against cloned attroperties (jQuery gh-1709)
											    uniqueCache = outerCache[ node.uniqueID ] ||
												    (outerCache[ node.uniqueID ] = {});

											    cache = uniqueCache[ type ] || [];
											    nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
											    diff = nodeIndex && cache[ 2 ];
											    node = nodeIndex && parent.childNodes[ nodeIndex ];

											    while ( (node = ++nodeIndex && node && node[ dir ] ||

												    // Fallback to seeking `elem` from the start
												    (diff = nodeIndex = 0) || start.pop()) ) {

												    // When found, cache indexes on `parent` and break
												    if ( node.nodeType === 1 && ++diff && node === elem ) {
													    uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
													    break;
												    }
											    }

										    } else {
											    // Use previously-cached element index if available
											    if ( useCache ) {
												    // ...in a gzip-friendly way
												    node = elem;
												    outerCache = node[ expando ] || (node[ expando ] = {});

												    // Support: IE <9 only
												    // Defend against cloned attroperties (jQuery gh-1709)
												    uniqueCache = outerCache[ node.uniqueID ] ||
													    (outerCache[ node.uniqueID ] = {});

												    cache = uniqueCache[ type ] || [];
												    nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
												    diff = nodeIndex;
											    }

											    // xml :nth-child(...)
											    // or :nth-last-child(...) or :nth(-last)?-of-type(...)
											    if ( diff === false ) {
												    // Use the same loop as above to seek `elem` from the start
												    while ( (node = ++nodeIndex && node && node[ dir ] ||
													    (diff = nodeIndex = 0) || start.pop()) ) {

													    if ( ( ofType ?
															    node.nodeName.toLowerCase() === name :
															    node.nodeType === 1 ) &&
														    ++diff ) {

														    // Cache the index of each encountered element
														    if ( useCache ) {
															    outerCache = node[ expando ] || (node[ expando ] = {});

															    // Support: IE <9 only
															    // Defend against cloned attroperties (jQuery gh-1709)
															    uniqueCache = outerCache[ node.uniqueID ] ||
																    (outerCache[ node.uniqueID ] = {});

															    uniqueCache[ type ] = [ dirruns, diff ];
														    }

														    if ( node === elem ) {
															    break;
														    }
													    }
												    }
											    }
										    }

										    // Incorporate the offset, then check against cycle size
										    diff -= last;
										    return diff === first || ( diff % first === 0 && diff / first >= 0 );
									    }
								    };
						    },

						    "PSEUDO": function( pseudo, argument ) {
							    // pseudo-class names are case-insensitive
							    // http://www.w3.org/TR/selectors/#pseudo-classes
							    // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
							    // Remember that setFilters inherits from pseudos
							    var args,
							        fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
								        Sizzle.error( "unsupported pseudo: " + pseudo );

							    // The user may use createPseudo to indicate that
							    // arguments are needed to create the filter function
							    // just as Sizzle does
							    if ( fn[ expando ] ) {
								    return fn( argument );
							    }

							    // But maintain support for old signatures
							    if ( fn.length > 1 ) {
								    args = [ pseudo, pseudo, "", argument ];
								    return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
									    markFunction(function( seed, matches ) {
										    var idx,
										        matched = fn( seed, argument ),
										        i = matched.length;
										    while ( i-- ) {
											    idx = indexOf( seed, matched[i] );
											    seed[ idx ] = !( matches[ idx ] = matched[i] );
										    }
									    }) :
									    function( elem ) {
										    return fn( elem, 0, args );
									    };
							    }

							    return fn;
						    }
					    },

					    pseudos: {
						    // Potentially complex pseudos
						    "not": markFunction(function( selector ) {
							    // Trim the selector passed to compile
							    // to avoid treating leading and trailing
							    // spaces as combinators
							    var input = [],
							        results = [],
							        matcher = compile( selector.replace( rtrim, "$1" ) );

							    return matcher[ expando ] ?
								    markFunction(function( seed, matches, context, xml ) {
									    var elem,
									        unmatched = matcher( seed, null, xml, [] ),
									        i = seed.length;

									    // Match elements unmatched by `matcher`
									    while ( i-- ) {
										    if ( (elem = unmatched[i]) ) {
											    seed[i] = !(matches[i] = elem);
										    }
									    }
								    }) :
								    function( elem, context, xml ) {
									    input[0] = elem;
									    matcher( input, null, xml, results );
									    // Don't keep the element (issue #299)
									    input[0] = null;
									    return !results.pop();
								    };
						    }),

						    "has": markFunction(function( selector ) {
							    return function( elem ) {
								    return Sizzle( selector, elem ).length > 0;
							    };
						    }),

						    "contains": markFunction(function( text ) {
							    text = text.replace( runescape, funescape );
							    return function( elem ) {
								    return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
							    };
						    }),

						    // "Whether an element is represented by a :lang() selector
						    // is based solely on the element's language value
						    // being equal to the identifier C,
						    // or beginning with the identifier C immediately followed by "-".
						    // The matching of C against the element's language value is performed case-insensitively.
						    // The identifier C does not have to be a valid language name."
						    // http://www.w3.org/TR/selectors/#lang-pseudo
						    "lang": markFunction( function( lang ) {
							    // lang value must be a valid identifier
							    if ( !ridentifier.test(lang || "") ) {
								    Sizzle.error( "unsupported lang: " + lang );
							    }
							    lang = lang.replace( runescape, funescape ).toLowerCase();
							    return function( elem ) {
								    var elemLang;
								    do {
									    if ( (elemLang = documentIsHTML ?
											    elem.lang :
											    elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

										    elemLang = elemLang.toLowerCase();
										    return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
									    }
								    } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
								    return false;
							    };
						    }),

						    // Miscellaneous
						    "target": function( elem ) {
							    var hash = window.location && window.location.hash;
							    return hash && hash.slice( 1 ) === elem.id;
						    },

						    "root": function( elem ) {
							    return elem === docElem;
						    },

						    "focus": function( elem ) {
							    return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
						    },

						    // Boolean properties
						    "enabled": createDisabledPseudo( false ),
						    "disabled": createDisabledPseudo( true ),

						    "checked": function( elem ) {
							    // In CSS3, :checked should return both checked and selected elements
							    // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
							    var nodeName = elem.nodeName.toLowerCase();
							    return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
						    },

						    "selected": function( elem ) {
							    // Accessing this property makes selected-by-default
							    // options in Safari work properly
							    if ( elem.parentNode ) {
								    elem.parentNode.selectedIndex;
							    }

							    return elem.selected === true;
						    },

						    // Contents
						    "empty": function( elem ) {
							    // http://www.w3.org/TR/selectors/#empty-pseudo
							    // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
							    //   but not by others (comment: 8; processing instruction: 7; etc.)
							    // nodeType < 6 works because attributes (2) do not appear as children
							    for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
								    if ( elem.nodeType < 6 ) {
									    return false;
								    }
							    }
							    return true;
						    },

						    "parent": function( elem ) {
							    return !Expr.pseudos["empty"]( elem );
						    },

						    // Element/input types
						    "header": function( elem ) {
							    return rheader.test( elem.nodeName );
						    },

						    "input": function( elem ) {
							    return rinputs.test( elem.nodeName );
						    },

						    "button": function( elem ) {
							    var name = elem.nodeName.toLowerCase();
							    return name === "input" && elem.type === "button" || name === "button";
						    },

						    "text": function( elem ) {
							    var attr;
							    return elem.nodeName.toLowerCase() === "input" &&
								    elem.type === "text" &&

								    // Support: IE<8
								    // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
								    ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
						    },

						    // Position-in-collection
						    "first": createPositionalPseudo(function() {
							    return [ 0 ];
						    }),

						    "last": createPositionalPseudo(function( matchIndexes, length ) {
							    return [ length - 1 ];
						    }),

						    "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
							    return [ argument < 0 ? argument + length : argument ];
						    }),

						    "even": createPositionalPseudo(function( matchIndexes, length ) {
							    var i = 0;
							    for ( ; i < length; i += 2 ) {
								    matchIndexes.push( i );
							    }
							    return matchIndexes;
						    }),

						    "odd": createPositionalPseudo(function( matchIndexes, length ) {
							    var i = 1;
							    for ( ; i < length; i += 2 ) {
								    matchIndexes.push( i );
							    }
							    return matchIndexes;
						    }),

						    "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
							    var i = argument < 0 ? argument + length : argument;
							    for ( ; --i >= 0; ) {
								    matchIndexes.push( i );
							    }
							    return matchIndexes;
						    }),

						    "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
							    var i = argument < 0 ? argument + length : argument;
							    for ( ; ++i < length; ) {
								    matchIndexes.push( i );
							    }
							    return matchIndexes;
						    })
					    }
				    };

				    Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
				    for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
					    Expr.pseudos[ i ] = createInputPseudo( i );
				    }
				    for ( i in { submit: true, reset: true } ) {
					    Expr.pseudos[ i ] = createButtonPseudo( i );
				    }

// Easy API for creating new setFilters
				    function setFilters() {}
				    setFilters.prototype = Expr.filters = Expr.pseudos;
				    Expr.setFilters = new setFilters();

				    tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
					    var matched, match, tokens, type,
					        soFar, groups, preFilters,
					        cached = tokenCache[ selector + " " ];

					    if ( cached ) {
						    return parseOnly ? 0 : cached.slice( 0 );
					    }

					    soFar = selector;
					    groups = [];
					    preFilters = Expr.preFilter;

					    while ( soFar ) {

						    // Comma and first run
						    if ( !matched || (match = rcomma.exec( soFar )) ) {
							    if ( match ) {
								    // Don't consume trailing commas as valid
								    soFar = soFar.slice( match[0].length ) || soFar;
							    }
							    groups.push( (tokens = []) );
						    }

						    matched = false;

						    // Combinators
						    if ( (match = rcombinators.exec( soFar )) ) {
							    matched = match.shift();
							    tokens.push({
								    value: matched,
								    // Cast descendant combinators to space
								    type: match[0].replace( rtrim, " " )
							    });
							    soFar = soFar.slice( matched.length );
						    }

						    // Filters
						    for ( type in Expr.filter ) {
							    if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
								    (match = preFilters[ type ]( match ))) ) {
								    matched = match.shift();
								    tokens.push({
									    value: matched,
									    type: type,
									    matches: match
								    });
								    soFar = soFar.slice( matched.length );
							    }
						    }

						    if ( !matched ) {
							    break;
						    }
					    }

					    // Return the length of the invalid excess
					    // if we're just parsing
					    // Otherwise, throw an error or return tokens
					    return parseOnly ?
						    soFar.length :
						    soFar ?
							    Sizzle.error( selector ) :
							    // Cache the tokens
							    tokenCache( selector, groups ).slice( 0 );
				    };

				    function toSelector( tokens ) {
					    var i = 0,
					        len = tokens.length,
					        selector = "";
					    for ( ; i < len; i++ ) {
						    selector += tokens[i].value;
					    }
					    return selector;
				    }

				    function addCombinator( matcher, combinator, base ) {
					    var dir = combinator.dir,
					        skip = combinator.next,
					        key = skip || dir,
					        checkNonElements = base && key === "parentNode",
					        doneName = done++;

					    return combinator.first ?
						    // Check against closest ancestor/preceding element
						    function( elem, context, xml ) {
							    while ( (elem = elem[ dir ]) ) {
								    if ( elem.nodeType === 1 || checkNonElements ) {
									    return matcher( elem, context, xml );
								    }
							    }
							    return false;
						    } :

						    // Check against all ancestor/preceding elements
						    function( elem, context, xml ) {
							    var oldCache, uniqueCache, outerCache,
							        newCache = [ dirruns, doneName ];

							    // We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
							    if ( xml ) {
								    while ( (elem = elem[ dir ]) ) {
									    if ( elem.nodeType === 1 || checkNonElements ) {
										    if ( matcher( elem, context, xml ) ) {
											    return true;
										    }
									    }
								    }
							    } else {
								    while ( (elem = elem[ dir ]) ) {
									    if ( elem.nodeType === 1 || checkNonElements ) {
										    outerCache = elem[ expando ] || (elem[ expando ] = {});

										    // Support: IE <9 only
										    // Defend against cloned attroperties (jQuery gh-1709)
										    uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

										    if ( skip && skip === elem.nodeName.toLowerCase() ) {
											    elem = elem[ dir ] || elem;
										    } else if ( (oldCache = uniqueCache[ key ]) &&
											    oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

											    // Assign to newCache so results back-propagate to previous elements
											    return (newCache[ 2 ] = oldCache[ 2 ]);
										    } else {
											    // Reuse newcache so results back-propagate to previous elements
											    uniqueCache[ key ] = newCache;

											    // A match means we're done; a fail means we have to keep checking
											    if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
												    return true;
											    }
										    }
									    }
								    }
							    }
							    return false;
						    };
				    }

				    function elementMatcher( matchers ) {
					    return matchers.length > 1 ?
						    function( elem, context, xml ) {
							    var i = matchers.length;
							    while ( i-- ) {
								    if ( !matchers[i]( elem, context, xml ) ) {
									    return false;
								    }
							    }
							    return true;
						    } :
						    matchers[0];
				    }

				    function multipleContexts( selector, contexts, results ) {
					    var i = 0,
					        len = contexts.length;
					    for ( ; i < len; i++ ) {
						    Sizzle( selector, contexts[i], results );
					    }
					    return results;
				    }

				    function condense( unmatched, map, filter, context, xml ) {
					    var elem,
					        newUnmatched = [],
					        i = 0,
					        len = unmatched.length,
					        mapped = map != null;

					    for ( ; i < len; i++ ) {
						    if ( (elem = unmatched[i]) ) {
							    if ( !filter || filter( elem, context, xml ) ) {
								    newUnmatched.push( elem );
								    if ( mapped ) {
									    map.push( i );
								    }
							    }
						    }
					    }

					    return newUnmatched;
				    }

				    function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
					    if ( postFilter && !postFilter[ expando ] ) {
						    postFilter = setMatcher( postFilter );
					    }
					    if ( postFinder && !postFinder[ expando ] ) {
						    postFinder = setMatcher( postFinder, postSelector );
					    }
					    return markFunction(function( seed, results, context, xml ) {
						    var temp, i, elem,
						        preMap = [],
						        postMap = [],
						        preexisting = results.length,

						        // Get initial elements from seed or context
						        elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

						        // Prefilter to get matcher input, preserving a map for seed-results synchronization
						        matcherIn = preFilter && ( seed || !selector ) ?
							        condense( elems, preMap, preFilter, context, xml ) :
							        elems,

						        matcherOut = matcher ?
							        // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
							        postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

								        // ...intermediate processing is necessary
								        [] :

								        // ...otherwise use results directly
								        results :
							        matcherIn;

						    // Find primary matches
						    if ( matcher ) {
							    matcher( matcherIn, matcherOut, context, xml );
						    }

						    // Apply postFilter
						    if ( postFilter ) {
							    temp = condense( matcherOut, postMap );
							    postFilter( temp, [], context, xml );

							    // Un-match failing elements by moving them back to matcherIn
							    i = temp.length;
							    while ( i-- ) {
								    if ( (elem = temp[i]) ) {
									    matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
								    }
							    }
						    }

						    if ( seed ) {
							    if ( postFinder || preFilter ) {
								    if ( postFinder ) {
									    // Get the final matcherOut by condensing this intermediate into postFinder contexts
									    temp = [];
									    i = matcherOut.length;
									    while ( i-- ) {
										    if ( (elem = matcherOut[i]) ) {
											    // Restore matcherIn since elem is not yet a final match
											    temp.push( (matcherIn[i] = elem) );
										    }
									    }
									    postFinder( null, (matcherOut = []), temp, xml );
								    }

								    // Move matched elements from seed to results to keep them synchronized
								    i = matcherOut.length;
								    while ( i-- ) {
									    if ( (elem = matcherOut[i]) &&
										    (temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

										    seed[temp] = !(results[temp] = elem);
									    }
								    }
							    }

							    // Add elements to results, through postFinder if defined
						    } else {
							    matcherOut = condense(
								    matcherOut === results ?
									    matcherOut.splice( preexisting, matcherOut.length ) :
									    matcherOut
							    );
							    if ( postFinder ) {
								    postFinder( null, results, matcherOut, xml );
							    } else {
								    push.apply( results, matcherOut );
							    }
						    }
					    });
				    }

				    function matcherFromTokens( tokens ) {
					    var checkContext, matcher, j,
					        len = tokens.length,
					        leadingRelative = Expr.relative[ tokens[0].type ],
					        implicitRelative = leadingRelative || Expr.relative[" "],
					        i = leadingRelative ? 1 : 0,

					        // The foundational matcher ensures that elements are reachable from top-level context(s)
					        matchContext = addCombinator( function( elem ) {
						        return elem === checkContext;
					        }, implicitRelative, true ),
					        matchAnyContext = addCombinator( function( elem ) {
						        return indexOf( checkContext, elem ) > -1;
					        }, implicitRelative, true ),
					        matchers = [ function( elem, context, xml ) {
						        var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
								        (checkContext = context).nodeType ?
									        matchContext( elem, context, xml ) :
									        matchAnyContext( elem, context, xml ) );
						        // Avoid hanging onto element (issue #299)
						        checkContext = null;
						        return ret;
					        } ];

					    for ( ; i < len; i++ ) {
						    if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
							    matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
						    } else {
							    matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

							    // Return special upon seeing a positional matcher
							    if ( matcher[ expando ] ) {
								    // Find the next relative operator (if any) for proper handling
								    j = ++i;
								    for ( ; j < len; j++ ) {
									    if ( Expr.relative[ tokens[j].type ] ) {
										    break;
									    }
								    }
								    return setMatcher(
									    i > 1 && elementMatcher( matchers ),
									    i > 1 && toSelector(
										    // If the preceding token was a descendant combinator, insert an implicit any-element `*`
										    tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
									    ).replace( rtrim, "$1" ),
									    matcher,
									    i < j && matcherFromTokens( tokens.slice( i, j ) ),
									    j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
									    j < len && toSelector( tokens )
								    );
							    }
							    matchers.push( matcher );
						    }
					    }

					    return elementMatcher( matchers );
				    }

				    function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
					    var bySet = setMatchers.length > 0,
					        byElement = elementMatchers.length > 0,
					        superMatcher = function( seed, context, xml, results, outermost ) {
						        var elem, j, matcher,
						            matchedCount = 0,
						            i = "0",
						            unmatched = seed && [],
						            setMatched = [],
						            contextBackup = outermostContext,
						            // We must always have either seed elements or outermost context
						            elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
						            // Use integer dirruns iff this is the outermost matcher
						            dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
						            len = elems.length;

						        if ( outermost ) {
							        outermostContext = context === document || context || outermost;
						        }

						        // Add elements passing elementMatchers directly to results
						        // Support: IE<9, Safari
						        // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
						        for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
							        if ( byElement && elem ) {
								        j = 0;
								        if ( !context && elem.ownerDocument !== document ) {
									        setDocument( elem );
									        xml = !documentIsHTML;
								        }
								        while ( (matcher = elementMatchers[j++]) ) {
									        if ( matcher( elem, context || document, xml) ) {
										        results.push( elem );
										        break;
									        }
								        }
								        if ( outermost ) {
									        dirruns = dirrunsUnique;
								        }
							        }

							        // Track unmatched elements for set filters
							        if ( bySet ) {
								        // They will have gone through all possible matchers
								        if ( (elem = !matcher && elem) ) {
									        matchedCount--;
								        }

								        // Lengthen the array for every element, matched or not
								        if ( seed ) {
									        unmatched.push( elem );
								        }
							        }
						        }

						        // `i` is now the count of elements visited above, and adding it to `matchedCount`
						        // makes the latter nonnegative.
						        matchedCount += i;

						        // Apply set filters to unmatched elements
						        // NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
						        // equals `i`), unless we didn't visit _any_ elements in the above loop because we have
						        // no element matchers and no seed.
						        // Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
						        // case, which will result in a "00" `matchedCount` that differs from `i` but is also
						        // numerically zero.
						        if ( bySet && i !== matchedCount ) {
							        j = 0;
							        while ( (matcher = setMatchers[j++]) ) {
								        matcher( unmatched, setMatched, context, xml );
							        }

							        if ( seed ) {
								        // Reintegrate element matches to eliminate the need for sorting
								        if ( matchedCount > 0 ) {
									        while ( i-- ) {
										        if ( !(unmatched[i] || setMatched[i]) ) {
											        setMatched[i] = pop.call( results );
										        }
									        }
								        }

								        // Discard index placeholder values to get only actual matches
								        setMatched = condense( setMatched );
							        }

							        // Add matches to results
							        push.apply( results, setMatched );

							        // Seedless set matches succeeding multiple successful matchers stipulate sorting
							        if ( outermost && !seed && setMatched.length > 0 &&
								        ( matchedCount + setMatchers.length ) > 1 ) {

								        Sizzle.uniqueSort( results );
							        }
						        }

						        // Override manipulation of globals by nested matchers
						        if ( outermost ) {
							        dirruns = dirrunsUnique;
							        outermostContext = contextBackup;
						        }

						        return unmatched;
					        };

					    return bySet ?
						    markFunction( superMatcher ) :
						    superMatcher;
				    }

				    compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
					    var i,
					        setMatchers = [],
					        elementMatchers = [],
					        cached = compilerCache[ selector + " " ];

					    if ( !cached ) {
						    // Generate a function of recursive functions that can be used to check each element
						    if ( !match ) {
							    match = tokenize( selector );
						    }
						    i = match.length;
						    while ( i-- ) {
							    cached = matcherFromTokens( match[i] );
							    if ( cached[ expando ] ) {
								    setMatchers.push( cached );
							    } else {
								    elementMatchers.push( cached );
							    }
						    }

						    // Cache the compiled function
						    cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

						    // Save selector and tokenization
						    cached.selector = selector;
					    }
					    return cached;
				    };

				    /**
				     * A low-level selection function that works with Sizzle's compiled
				     *  selector functions
				     * @param {String|Function} selector A selector or a pre-compiled
				     *  selector function built with Sizzle.compile
				     * @param {Element} context
				     * @param {Array} [results]
				     * @param {Array} [seed] A set of elements to match against
				     */
				    select = Sizzle.select = function( selector, context, results, seed ) {
					    var i, tokens, token, type, find,
					        compiled = typeof selector === "function" && selector,
					        match = !seed && tokenize( (selector = compiled.selector || selector) );

					    results = results || [];

					    // Try to minimize operations if there is only one selector in the list and no seed
					    // (the latter of which guarantees us context)
					    if ( match.length === 1 ) {

						    // Reduce context if the leading compound selector is an ID
						    tokens = match[0] = match[0].slice( 0 );
						    if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
							    context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

							    context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
							    if ( !context ) {
								    return results;

								    // Precompiled matchers will still verify ancestry, so step up a level
							    } else if ( compiled ) {
								    context = context.parentNode;
							    }

							    selector = selector.slice( tokens.shift().value.length );
						    }

						    // Fetch a seed set for right-to-left matching
						    i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
						    while ( i-- ) {
							    token = tokens[i];

							    // Abort if we hit a combinator
							    if ( Expr.relative[ (type = token.type) ] ) {
								    break;
							    }
							    if ( (find = Expr.find[ type ]) ) {
								    // Search, expanding context for leading sibling combinators
								    if ( (seed = find(
										    token.matches[0].replace( runescape, funescape ),
										    rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
									    )) ) {

									    // If seed is empty or no tokens remain, we can return early
									    tokens.splice( i, 1 );
									    selector = seed.length && toSelector( tokens );
									    if ( !selector ) {
										    push.apply( results, seed );
										    return results;
									    }

									    break;
								    }
							    }
						    }
					    }

					    // Compile and execute a filtering function if one is not provided
					    // Provide `match` to avoid retokenization if we modified the selector above
					    ( compiled || compile( selector, match ) )(
						    seed,
						    context,
						    !documentIsHTML,
						    results,
						    !context || rsibling.test( selector ) && testContext( context.parentNode ) || context
					    );
					    return results;
				    };

// One-time assignments

// Sort stability
				    support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
				    support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
				    setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
				    support.sortDetached = assert(function( el ) {
					    // Should return 1, but returns 4 (following)
					    return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
				    });

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
				    if ( !assert(function( el ) {
						    el.innerHTML = "<a href='#'></a>";
						    return el.firstChild.getAttribute("href") === "#" ;
					    }) ) {
					    addHandle( "type|href|height|width", function( elem, name, isXML ) {
						    if ( !isXML ) {
							    return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
						    }
					    });
				    }

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
				    if ( !support.attributes || !assert(function( el ) {
						    el.innerHTML = "<input/>";
						    el.firstChild.setAttribute( "value", "" );
						    return el.firstChild.getAttribute( "value" ) === "";
					    }) ) {
					    addHandle( "value", function( elem, name, isXML ) {
						    if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
							    return elem.defaultValue;
						    }
					    });
				    }

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
				    if ( !assert(function( el ) {
						    return el.getAttribute("disabled") == null;
					    }) ) {
					    addHandle( booleans, function( elem, name, isXML ) {
						    var val;
						    if ( !isXML ) {
							    return elem[ name ] === true ? name.toLowerCase() :
								    (val = elem.getAttributeNode( name )) && val.specified ?
									    val.value :
									    null;
						    }
					    });
				    }

				    return Sizzle;

			    })( window );



		jQuery.find = Sizzle;
		jQuery.expr = Sizzle.selectors;

// Deprecated
		jQuery.expr[ ":" ] = jQuery.expr.pseudos;
		jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
		jQuery.text = Sizzle.getText;
		jQuery.isXMLDoc = Sizzle.isXML;
		jQuery.contains = Sizzle.contains;
		jQuery.escapeSelector = Sizzle.escape;




		var dir = function( elem, dir, until ) {
			var matched = [],
			    truncate = until !== undefined;

			while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
				if ( elem.nodeType === 1 ) {
					if ( truncate && jQuery( elem ).is( until ) ) {
						break;
					}
					matched.push( elem );
				}
			}
			return matched;
		};


		var siblings = function( n, elem ) {
			var matched = [];

			for ( ; n; n = n.nextSibling ) {
				if ( n.nodeType === 1 && n !== elem ) {
					matched.push( n );
				}
			}

			return matched;
		};


		var rneedsContext = jQuery.expr.match.needsContext;



		function nodeName( elem, name ) {

			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

		};
		var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



		var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
		function winnow( elements, qualifier, not ) {
			if ( jQuery.isFunction( qualifier ) ) {
				return jQuery.grep( elements, function( elem, i ) {
					return !!qualifier.call( elem, i, elem ) !== not;
				} );
			}

			// Single element
			if ( qualifier.nodeType ) {
				return jQuery.grep( elements, function( elem ) {
					return ( elem === qualifier ) !== not;
				} );
			}

			// Arraylike of elements (jQuery, arguments, Array)
			if ( typeof qualifier !== "string" ) {
				return jQuery.grep( elements, function( elem ) {
					return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
				} );
			}

			// Simple selector that can be filtered directly, removing non-Elements
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}

			// Complex selector, compare the two sets, removing non-Elements
			qualifier = jQuery.filter( qualifier, elements );
			return jQuery.grep( elements, function( elem ) {
				return ( indexOf.call( qualifier, elem ) > -1 ) !== not && elem.nodeType === 1;
			} );
		}

		jQuery.filter = function( expr, elems, not ) {
			var elem = elems[ 0 ];

			if ( not ) {
				expr = ":not(" + expr + ")";
			}

			if ( elems.length === 1 && elem.nodeType === 1 ) {
				return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
			}

			return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
		};

		jQuery.fn.extend( {
			find: function( selector ) {
				var i, ret,
				    len = this.length,
				    self = this;

				if ( typeof selector !== "string" ) {
					return this.pushStack( jQuery( selector ).filter( function() {
						for ( i = 0; i < len; i++ ) {
							if ( jQuery.contains( self[ i ], this ) ) {
								return true;
							}
						}
					} ) );
				}

				ret = this.pushStack( [] );

				for ( i = 0; i < len; i++ ) {
					jQuery.find( selector, self[ i ], ret );
				}

				return len > 1 ? jQuery.uniqueSort( ret ) : ret;
			},
			filter: function( selector ) {
				return this.pushStack( winnow( this, selector || [], false ) );
			},
			not: function( selector ) {
				return this.pushStack( winnow( this, selector || [], true ) );
			},
			is: function( selector ) {
				return !!winnow(
					this,

					// If this is a positional/relative selector, check membership in the returned set
					// so $("p:first").is("p:last") won't return true for a doc with two "p".
					typeof selector === "string" && rneedsContext.test( selector ) ?
						jQuery( selector ) :
						selector || [],
					false
				).length;
			}
		} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
		var rootjQuery,

		    // A simple way to check for HTML strings
		    // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		    // Strict HTML recognition (#11290: must start with <)
		    // Shortcut simple #id case for speed
		    rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

		    init = jQuery.fn.init = function( selector, context, root ) {
			    var match, elem;

			    // HANDLE: $(""), $(null), $(undefined), $(false)
			    if ( !selector ) {
				    return this;
			    }

			    // Method init() accepts an alternate rootjQuery
			    // so migrate can support jQuery.sub (gh-2101)
			    root = root || rootjQuery;

			    // Handle HTML strings
			    if ( typeof selector === "string" ) {
				    if ( selector[ 0 ] === "<" &&
					    selector[ selector.length - 1 ] === ">" &&
					    selector.length >= 3 ) {

					    // Assume that strings that start and end with <> are HTML and skip the regex check
					    match = [ null, selector, null ];

				    } else {
					    match = rquickExpr.exec( selector );
				    }

				    // Match html or make sure no context is specified for #id
				    if ( match && ( match[ 1 ] || !context ) ) {

					    // HANDLE: $(html) -> $(array)
					    if ( match[ 1 ] ) {
						    context = context instanceof jQuery ? context[ 0 ] : context;

						    // Option to run scripts is true for back-compat
						    // Intentionally let the error be thrown if parseHTML is not present
						    jQuery.merge( this, jQuery.parseHTML(
							    match[ 1 ],
							    context && context.nodeType ? context.ownerDocument || context : document,
							    true
						    ) );

						    // HANDLE: $(html, props)
						    if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							    for ( match in context ) {

								    // Properties of context are called as methods if possible
								    if ( jQuery.isFunction( this[ match ] ) ) {
									    this[ match ]( context[ match ] );

									    // ...and otherwise set as attributes
								    } else {
									    this.attr( match, context[ match ] );
								    }
							    }
						    }

						    return this;

						    // HANDLE: $(#id)
					    } else {
						    elem = document.getElementById( match[ 2 ] );

						    if ( elem ) {

							    // Inject the element directly into the jQuery object
							    this[ 0 ] = elem;
							    this.length = 1;
						    }
						    return this;
					    }

					    // HANDLE: $(expr, $(...))
				    } else if ( !context || context.jquery ) {
					    return ( context || root ).find( selector );

					    // HANDLE: $(expr, context)
					    // (which is just equivalent to: $(context).find(expr)
				    } else {
					    return this.constructor( context ).find( selector );
				    }

				    // HANDLE: $(DOMElement)
			    } else if ( selector.nodeType ) {
				    this[ 0 ] = selector;
				    this.length = 1;
				    return this;

				    // HANDLE: $(function)
				    // Shortcut for document ready
			    } else if ( jQuery.isFunction( selector ) ) {
				    return root.ready !== undefined ?
					    root.ready( selector ) :

					    // Execute immediately if ready is not present
					    selector( jQuery );
			    }

			    return jQuery.makeArray( selector, this );
		    };

// Give the init function the jQuery prototype for later instantiation
		init.prototype = jQuery.fn;

// Initialize central reference
		rootjQuery = jQuery( document );


		var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		    // Methods guaranteed to produce a unique set when starting from a unique set
		    guaranteedUnique = {
			    children: true,
			    contents: true,
			    next: true,
			    prev: true
		    };

		jQuery.fn.extend( {
			has: function( target ) {
				var targets = jQuery( target, this ),
				    l = targets.length;

				return this.filter( function() {
					var i = 0;
					for ( ; i < l; i++ ) {
						if ( jQuery.contains( this, targets[ i ] ) ) {
							return true;
						}
					}
				} );
			},

			closest: function( selectors, context ) {
				var cur,
				    i = 0,
				    l = this.length,
				    matched = [],
				    targets = typeof selectors !== "string" && jQuery( selectors );

				// Positional selectors never match, since there's no _selection_ context
				if ( !rneedsContext.test( selectors ) ) {
					for ( ; i < l; i++ ) {
						for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

							// Always skip document fragments
							if ( cur.nodeType < 11 && ( targets ?
									targets.index( cur ) > -1 :

									// Don't pass non-elements to Sizzle
									cur.nodeType === 1 &&
									jQuery.find.matchesSelector( cur, selectors ) ) ) {

								matched.push( cur );
								break;
							}
						}
					}
				}

				return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
			},

			// Determine the position of an element within the set
			index: function( elem ) {

				// No argument, return index in parent
				if ( !elem ) {
					return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
				}

				// Index in selector
				if ( typeof elem === "string" ) {
					return indexOf.call( jQuery( elem ), this[ 0 ] );
				}

				// Locate the position of the desired element
				return indexOf.call( this,

					// If it receives a jQuery object, the first element is used
					elem.jquery ? elem[ 0 ] : elem
				);
			},

			add: function( selector, context ) {
				return this.pushStack(
					jQuery.uniqueSort(
						jQuery.merge( this.get(), jQuery( selector, context ) )
					)
				);
			},

			addBack: function( selector ) {
				return this.add( selector == null ?
					this.prevObject : this.prevObject.filter( selector )
				);
			}
		} );

		function sibling( cur, dir ) {
			while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
			return cur;
		}

		jQuery.each( {
			parent: function( elem ) {
				var parent = elem.parentNode;
				return parent && parent.nodeType !== 11 ? parent : null;
			},
			parents: function( elem ) {
				return dir( elem, "parentNode" );
			},
			parentsUntil: function( elem, i, until ) {
				return dir( elem, "parentNode", until );
			},
			next: function( elem ) {
				return sibling( elem, "nextSibling" );
			},
			prev: function( elem ) {
				return sibling( elem, "previousSibling" );
			},
			nextAll: function( elem ) {
				return dir( elem, "nextSibling" );
			},
			prevAll: function( elem ) {
				return dir( elem, "previousSibling" );
			},
			nextUntil: function( elem, i, until ) {
				return dir( elem, "nextSibling", until );
			},
			prevUntil: function( elem, i, until ) {
				return dir( elem, "previousSibling", until );
			},
			siblings: function( elem ) {
				return siblings( ( elem.parentNode || {} ).firstChild, elem );
			},
			children: function( elem ) {
				return siblings( elem.firstChild );
			},
			contents: function( elem ) {
				if ( nodeName( elem, "iframe" ) ) {
					return elem.contentDocument;
				}

				// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
				// Treat the template element as a regular one in browsers that
				// don't support it.
				if ( nodeName( elem, "template" ) ) {
					elem = elem.content || elem;
				}

				return jQuery.merge( [], elem.childNodes );
			}
		}, function( name, fn ) {
			jQuery.fn[ name ] = function( until, selector ) {
				var matched = jQuery.map( this, fn, until );

				if ( name.slice( -5 ) !== "Until" ) {
					selector = until;
				}

				if ( selector && typeof selector === "string" ) {
					matched = jQuery.filter( selector, matched );
				}

				if ( this.length > 1 ) {

					// Remove duplicates
					if ( !guaranteedUnique[ name ] ) {
						jQuery.uniqueSort( matched );
					}

					// Reverse order for parents* and prev-derivatives
					if ( rparentsprev.test( name ) ) {
						matched.reverse();
					}
				}

				return this.pushStack( matched );
			};
		} );
		var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
		function createOptions( options ) {
			var object = {};
			jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
				object[ flag ] = true;
			} );
			return object;
		}

		/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
		jQuery.Callbacks = function( options ) {

			// Convert options from String-formatted to Object-formatted if needed
			// (we check in cache first)
			options = typeof options === "string" ?
				createOptions( options ) :
				jQuery.extend( {}, options );

			var // Flag to know if list is currently firing
				firing,

				// Last fire value for non-forgettable lists
				memory,

				// Flag to know if list was already fired
				fired,

				// Flag to prevent firing
				locked,

				// Actual callback list
				list = [],

				// Queue of execution data for repeatable lists
				queue = [],

				// Index of currently firing callback (modified by add/remove as needed)
				firingIndex = -1,

				// Fire callbacks
				fire = function() {

					// Enforce single-firing
					locked = locked || options.once;

					// Execute callbacks for all pending executions,
					// respecting firingIndex overrides and runtime changes
					fired = firing = true;
					for ( ; queue.length; firingIndex = -1 ) {
						memory = queue.shift();
						while ( ++firingIndex < list.length ) {

							// Run callback and check for early termination
							if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
								options.stopOnFalse ) {

								// Jump to end and forget the data so .add doesn't re-fire
								firingIndex = list.length;
								memory = false;
							}
						}
					}

					// Forget the data if we're done with it
					if ( !options.memory ) {
						memory = false;
					}

					firing = false;

					// Clean up if we're done firing for good
					if ( locked ) {

						// Keep an empty list if we have data for future add calls
						if ( memory ) {
							list = [];

							// Otherwise, this object is spent
						} else {
							list = "";
						}
					}
				},

				// Actual Callbacks object
				self = {

					// Add a callback or a collection of callbacks to the list
					add: function() {
						if ( list ) {

							// If we have memory from a past run, we should fire after adding
							if ( memory && !firing ) {
								firingIndex = list.length - 1;
								queue.push( memory );
							}

							( function add( args ) {
								jQuery.each( args, function( _, arg ) {
									if ( jQuery.isFunction( arg ) ) {
										if ( !options.unique || !self.has( arg ) ) {
											list.push( arg );
										}
									} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

										// Inspect recursively
										add( arg );
									}
								} );
							} )( arguments );

							if ( memory && !firing ) {
								fire();
							}
						}
						return this;
					},

					// Remove a callback from the list
					remove: function() {
						jQuery.each( arguments, function( _, arg ) {
							var index;
							while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
								list.splice( index, 1 );

								// Handle firing indexes
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						} );
						return this;
					},

					// Check if a given callback is in the list.
					// If no argument is given, return whether or not list has callbacks attached.
					has: function( fn ) {
						return fn ?
							jQuery.inArray( fn, list ) > -1 :
							list.length > 0;
					},

					// Remove all callbacks from the list
					empty: function() {
						if ( list ) {
							list = [];
						}
						return this;
					},

					// Disable .fire and .add
					// Abort any current/pending executions
					// Clear all callbacks and values
					disable: function() {
						locked = queue = [];
						list = memory = "";
						return this;
					},
					disabled: function() {
						return !list;
					},

					// Disable .fire
					// Also disable .add unless we have memory (since it would have no effect)
					// Abort any pending executions
					lock: function() {
						locked = queue = [];
						if ( !memory && !firing ) {
							list = memory = "";
						}
						return this;
					},
					locked: function() {
						return !!locked;
					},

					// Call all callbacks with the given context and arguments
					fireWith: function( context, args ) {
						if ( !locked ) {
							args = args || [];
							args = [ context, args.slice ? args.slice() : args ];
							queue.push( args );
							if ( !firing ) {
								fire();
							}
						}
						return this;
					},

					// Call all the callbacks with the given arguments
					fire: function() {
						self.fireWith( this, arguments );
						return this;
					},

					// To know if the callbacks have already been called at least once
					fired: function() {
						return !!fired;
					}
				};

			return self;
		};


		function Identity( v ) {
			return v;
		}
		function Thrower( ex ) {
			throw ex;
		}

		function adoptValue( value, resolve, reject, noValue ) {
			var method;

			try {

				// Check for promise aspect first to privilege synchronous behavior
				if ( value && jQuery.isFunction( ( method = value.promise ) ) ) {
					method.call( value ).done( resolve ).fail( reject );

					// Other thenables
				} else if ( value && jQuery.isFunction( ( method = value.then ) ) ) {
					method.call( value, resolve, reject );

					// Other non-thenables
				} else {

					// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
					// * false: [ value ].slice( 0 ) => resolve( value )
					// * true: [ value ].slice( 1 ) => resolve()
					resolve.apply( undefined, [ value ].slice( noValue ) );
				}

				// For Promises/A+, convert exceptions into rejections
				// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
				// Deferred#then to conditionally suppress rejection.
			} catch ( value ) {

				// Support: Android 4.0 only
				// Strict mode functions invoked without .call/.apply get global-object context
				reject.apply( undefined, [ value ] );
			}
		}

		jQuery.extend( {

			Deferred: function( func ) {
				var tuples = [

					    // action, add listener, callbacks,
					    // ... .then handlers, argument index, [final state]
					    [ "notify", "progress", jQuery.Callbacks( "memory" ),
						    jQuery.Callbacks( "memory" ), 2 ],
					    [ "resolve", "done", jQuery.Callbacks( "once memory" ),
						    jQuery.Callbacks( "once memory" ), 0, "resolved" ],
					    [ "reject", "fail", jQuery.Callbacks( "once memory" ),
						    jQuery.Callbacks( "once memory" ), 1, "rejected" ]
				    ],
				    state = "pending",
				    promise = {
					    state: function() {
						    return state;
					    },
					    always: function() {
						    deferred.done( arguments ).fail( arguments );
						    return this;
					    },
					    "catch": function( fn ) {
						    return promise.then( null, fn );
					    },

					    // Keep pipe for back-compat
					    pipe: function( /* fnDone, fnFail, fnProgress */ ) {
						    var fns = arguments;

						    return jQuery.Deferred( function( newDefer ) {
							    jQuery.each( tuples, function( i, tuple ) {

								    // Map tuples (progress, done, fail) to arguments (done, fail, progress)
								    var fn = jQuery.isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

								    // deferred.progress(function() { bind to newDefer or newDefer.notify })
								    // deferred.done(function() { bind to newDefer or newDefer.resolve })
								    // deferred.fail(function() { bind to newDefer or newDefer.reject })
								    deferred[ tuple[ 1 ] ]( function() {
									    var returned = fn && fn.apply( this, arguments );
									    if ( returned && jQuery.isFunction( returned.promise ) ) {
										    returned.promise()
											    .progress( newDefer.notify )
											    .done( newDefer.resolve )
											    .fail( newDefer.reject );
									    } else {
										    newDefer[ tuple[ 0 ] + "With" ](
											    this,
											    fn ? [ returned ] : arguments
										    );
									    }
								    } );
							    } );
							    fns = null;
						    } ).promise();
					    },
					    then: function( onFulfilled, onRejected, onProgress ) {
						    var maxDepth = 0;
						    function resolve( depth, deferred, handler, special ) {
							    return function() {
								    var that = this,
								        args = arguments,
								        mightThrow = function() {
									        var returned, then;

									        // Support: Promises/A+ section 2.3.3.3.3
									        // https://promisesaplus.com/#point-59
									        // Ignore double-resolution attempts
									        if ( depth < maxDepth ) {
										        return;
									        }

									        returned = handler.apply( that, args );

									        // Support: Promises/A+ section 2.3.1
									        // https://promisesaplus.com/#point-48
									        if ( returned === deferred.promise() ) {
										        throw new TypeError( "Thenable self-resolution" );
									        }

									        // Support: Promises/A+ sections 2.3.3.1, 3.5
									        // https://promisesaplus.com/#point-54
									        // https://promisesaplus.com/#point-75
									        // Retrieve `then` only once
									        then = returned &&

										        // Support: Promises/A+ section 2.3.4
										        // https://promisesaplus.com/#point-64
										        // Only check objects and functions for thenability
										        ( typeof returned === "object" ||
										        typeof returned === "function" ) &&
										        returned.then;

									        // Handle a returned thenable
									        if ( jQuery.isFunction( then ) ) {

										        // Special processors (notify) just wait for resolution
										        if ( special ) {
											        then.call(
												        returned,
												        resolve( maxDepth, deferred, Identity, special ),
												        resolve( maxDepth, deferred, Thrower, special )
											        );

											        // Normal processors (resolve) also hook into progress
										        } else {

											        // ...and disregard older resolution values
											        maxDepth++;

											        then.call(
												        returned,
												        resolve( maxDepth, deferred, Identity, special ),
												        resolve( maxDepth, deferred, Thrower, special ),
												        resolve( maxDepth, deferred, Identity,
													        deferred.notifyWith )
											        );
										        }

										        // Handle all other returned values
									        } else {

										        // Only substitute handlers pass on context
										        // and multiple values (non-spec behavior)
										        if ( handler !== Identity ) {
											        that = undefined;
											        args = [ returned ];
										        }

										        // Process the value(s)
										        // Default process is resolve
										        ( special || deferred.resolveWith )( that, args );
									        }
								        },

								        // Only normal processors (resolve) catch and reject exceptions
								        process = special ?
									        mightThrow :
									        function() {
										        try {
											        mightThrow();
										        } catch ( e ) {

											        if ( jQuery.Deferred.exceptionHook ) {
												        jQuery.Deferred.exceptionHook( e,
													        process.stackTrace );
											        }

											        // Support: Promises/A+ section 2.3.3.3.4.1
											        // https://promisesaplus.com/#point-61
											        // Ignore post-resolution exceptions
											        if ( depth + 1 >= maxDepth ) {

												        // Only substitute handlers pass on context
												        // and multiple values (non-spec behavior)
												        if ( handler !== Thrower ) {
													        that = undefined;
													        args = [ e ];
												        }

												        deferred.rejectWith( that, args );
											        }
										        }
									        };

								    // Support: Promises/A+ section 2.3.3.3.1
								    // https://promisesaplus.com/#point-57
								    // Re-resolve promises immediately to dodge false rejection from
								    // subsequent errors
								    if ( depth ) {
									    process();
								    } else {

									    // Call an optional hook to record the stack, in case of exception
									    // since it's otherwise lost when execution goes async
									    if ( jQuery.Deferred.getStackHook ) {
										    process.stackTrace = jQuery.Deferred.getStackHook();
									    }
									    window.setTimeout( process );
								    }
							    };
						    }

						    return jQuery.Deferred( function( newDefer ) {

							    // progress_handlers.add( ... )
							    tuples[ 0 ][ 3 ].add(
								    resolve(
									    0,
									    newDefer,
									    jQuery.isFunction( onProgress ) ?
										    onProgress :
										    Identity,
									    newDefer.notifyWith
								    )
							    );

							    // fulfilled_handlers.add( ... )
							    tuples[ 1 ][ 3 ].add(
								    resolve(
									    0,
									    newDefer,
									    jQuery.isFunction( onFulfilled ) ?
										    onFulfilled :
										    Identity
								    )
							    );

							    // rejected_handlers.add( ... )
							    tuples[ 2 ][ 3 ].add(
								    resolve(
									    0,
									    newDefer,
									    jQuery.isFunction( onRejected ) ?
										    onRejected :
										    Thrower
								    )
							    );
						    } ).promise();
					    },

					    // Get a promise for this deferred
					    // If obj is provided, the promise aspect is added to the object
					    promise: function( obj ) {
						    return obj != null ? jQuery.extend( obj, promise ) : promise;
					    }
				    },
				    deferred = {};

				// Add list-specific methods
				jQuery.each( tuples, function( i, tuple ) {
					var list = tuple[ 2 ],
					    stateString = tuple[ 5 ];

					// promise.progress = list.add
					// promise.done = list.add
					// promise.fail = list.add
					promise[ tuple[ 1 ] ] = list.add;

					// Handle state
					if ( stateString ) {
						list.add(
							function() {

								// state = "resolved" (i.e., fulfilled)
								// state = "rejected"
								state = stateString;
							},

							// rejected_callbacks.disable
							// fulfilled_callbacks.disable
							tuples[ 3 - i ][ 2 ].disable,

							// progress_callbacks.lock
							tuples[ 0 ][ 2 ].lock
						);
					}

					// progress_handlers.fire
					// fulfilled_handlers.fire
					// rejected_handlers.fire
					list.add( tuple[ 3 ].fire );

					// deferred.notify = function() { deferred.notifyWith(...) }
					// deferred.resolve = function() { deferred.resolveWith(...) }
					// deferred.reject = function() { deferred.rejectWith(...) }
					deferred[ tuple[ 0 ] ] = function() {
						deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
						return this;
					};

					// deferred.notifyWith = list.fireWith
					// deferred.resolveWith = list.fireWith
					// deferred.rejectWith = list.fireWith
					deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
				} );

				// Make the deferred a promise
				promise.promise( deferred );

				// Call given func if any
				if ( func ) {
					func.call( deferred, deferred );
				}

				// All done!
				return deferred;
			},

			// Deferred helper
			when: function( singleValue ) {
				var

					// count of uncompleted subordinates
					remaining = arguments.length,

					// count of unprocessed arguments
					i = remaining,

					// subordinate fulfillment data
					resolveContexts = Array( i ),
					resolveValues = slice.call( arguments ),

					// the master Deferred
					master = jQuery.Deferred(),

					// subordinate callback factory
					updateFunc = function( i ) {
						return function( value ) {
							resolveContexts[ i ] = this;
							resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
							if ( !( --remaining ) ) {
								master.resolveWith( resolveContexts, resolveValues );
							}
						};
					};

				// Single- and empty arguments are adopted like Promise.resolve
				if ( remaining <= 1 ) {
					adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
						!remaining );

					// Use .then() to unwrap secondary thenables (cf. gh-3000)
					if ( master.state() === "pending" ||
						jQuery.isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

						return master.then();
					}
				}

				// Multiple arguments are aggregated like Promise.all array elements
				while ( i-- ) {
					adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
				}

				return master.promise();
			}
		} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
		var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

		jQuery.Deferred.exceptionHook = function( error, stack ) {

			// Support: IE 8 - 9 only
			// Console exists when dev tools are open, which can happen at any time
			if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
				window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
			}
		};




		jQuery.readyException = function( error ) {
			window.setTimeout( function() {
				throw error;
			} );
		};




// The deferred used on DOM ready
		var readyList = jQuery.Deferred();

		jQuery.fn.ready = function( fn ) {

			readyList
				.then( fn )

				// Wrap jQuery.readyException in a function so that the lookup
				// happens at the time of error handling instead of callback
				// registration.
				.catch( function( error ) {
					jQuery.readyException( error );
				} );

			return this;
		};

		jQuery.extend( {

			// Is the DOM ready to be used? Set to true once it occurs.
			isReady: false,

			// A counter to track how many items to wait for before
			// the ready event fires. See #6781
			readyWait: 1,

			// Handle when the DOM is ready
			ready: function( wait ) {

				// Abort if there are pending holds or we're already ready
				if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
					return;
				}

				// Remember that the DOM is ready
				jQuery.isReady = true;

				// If a normal DOM Ready event fired, decrement, and wait if need be
				if ( wait !== true && --jQuery.readyWait > 0 ) {
					return;
				}

				// If there are functions bound, to execute
				readyList.resolveWith( document, [ jQuery ] );
			}
		} );

		jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
		function completed() {
			document.removeEventListener( "DOMContentLoaded", completed );
			window.removeEventListener( "load", completed );
			jQuery.ready();
		}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );
		}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
		var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
			var i = 0,
			    len = elems.length,
			    bulk = key == null;

			// Sets many values
			if ( jQuery.type( key ) === "object" ) {
				chainable = true;
				for ( i in key ) {
					access( elems, fn, i, key[ i ], true, emptyGet, raw );
				}

				// Sets one value
			} else if ( value !== undefined ) {
				chainable = true;

				if ( !jQuery.isFunction( value ) ) {
					raw = true;
				}

				if ( bulk ) {

					// Bulk operations run against the entire set
					if ( raw ) {
						fn.call( elems, value );
						fn = null;

						// ...except when executing function values
					} else {
						bulk = fn;
						fn = function( elem, key, value ) {
							return bulk.call( jQuery( elem ), value );
						};
					}
				}

				if ( fn ) {
					for ( ; i < len; i++ ) {
						fn(
							elems[ i ], key, raw ?
								value :
								value.call( elems[ i ], i, fn( elems[ i ], key ) )
						);
					}
				}
			}

			if ( chainable ) {
				return elems;
			}

			// Gets
			if ( bulk ) {
				return fn.call( elems );
			}

			return len ? fn( elems[ 0 ], key ) : emptyGet;
		};
		var acceptData = function( owner ) {

			// Accepts only:
			//  - Node
			//    - Node.ELEMENT_NODE
			//    - Node.DOCUMENT_NODE
			//  - Object
			//    - Any
			return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
		};




		function Data() {
			this.expando = jQuery.expando + Data.uid++;
		}

		Data.uid = 1;

		Data.prototype = {

			cache: function( owner ) {

				// Check if the owner object already has a cache
				var value = owner[ this.expando ];

				// If not, create one
				if ( !value ) {
					value = {};

					// We can accept data for non-element nodes in modern browsers,
					// but we should not, see #8335.
					// Always return an empty object.
					if ( acceptData( owner ) ) {

						// If it is a node unlikely to be stringify-ed or looped over
						// use plain assignment
						if ( owner.nodeType ) {
							owner[ this.expando ] = value;

							// Otherwise secure it in a non-enumerable property
							// configurable must be true to allow the property to be
							// deleted when data is removed
						} else {
							Object.defineProperty( owner, this.expando, {
								value: value,
								configurable: true
							} );
						}
					}
				}

				return value;
			},
			set: function( owner, data, value ) {
				var prop,
				    cache = this.cache( owner );

				// Handle: [ owner, key, value ] args
				// Always use camelCase key (gh-2257)
				if ( typeof data === "string" ) {
					cache[ jQuery.camelCase( data ) ] = value;

					// Handle: [ owner, { properties } ] args
				} else {

					// Copy the properties one-by-one to the cache object
					for ( prop in data ) {
						cache[ jQuery.camelCase( prop ) ] = data[ prop ];
					}
				}
				return cache;
			},
			get: function( owner, key ) {
				return key === undefined ?
					this.cache( owner ) :

					// Always use camelCase key (gh-2257)
					owner[ this.expando ] && owner[ this.expando ][ jQuery.camelCase( key ) ];
			},
			access: function( owner, key, value ) {

				// In cases where either:
				//
				//   1. No key was specified
				//   2. A string key was specified, but no value provided
				//
				// Take the "read" path and allow the get method to determine
				// which value to return, respectively either:
				//
				//   1. The entire cache object
				//   2. The data stored at the key
				//
				if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

					return this.get( owner, key );
				}

				// When the key is not a string, or both a key and value
				// are specified, set or extend (existing objects) with either:
				//
				//   1. An object of properties
				//   2. A key and value
				//
				this.set( owner, key, value );

				// Since the "set" path can have two possible entry points
				// return the expected data based on which path was taken[*]
				return value !== undefined ? value : key;
			},
			remove: function( owner, key ) {
				var i,
				    cache = owner[ this.expando ];

				if ( cache === undefined ) {
					return;
				}

				if ( key !== undefined ) {

					// Support array or space separated string of keys
					if ( Array.isArray( key ) ) {

						// If key is an array of keys...
						// We always set camelCase keys, so remove that.
						key = key.map( jQuery.camelCase );
					} else {
						key = jQuery.camelCase( key );

						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						key = key in cache ?
							[ key ] :
							( key.match( rnothtmlwhite ) || [] );
					}

					i = key.length;

					while ( i-- ) {
						delete cache[ key[ i ] ];
					}
				}

				// Remove the expando if there's no more data
				if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

					// Support: Chrome <=35 - 45
					// Webkit & Blink performance suffers when deleting properties
					// from DOM nodes, so set to undefined instead
					// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
					if ( owner.nodeType ) {
						owner[ this.expando ] = undefined;
					} else {
						delete owner[ this.expando ];
					}
				}
			},
			hasData: function( owner ) {
				var cache = owner[ this.expando ];
				return cache !== undefined && !jQuery.isEmptyObject( cache );
			}
		};
		var dataPriv = new Data();

		var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

		var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		    rmultiDash = /[A-Z]/g;

		function getData( data ) {
			if ( data === "true" ) {
				return true;
			}

			if ( data === "false" ) {
				return false;
			}

			if ( data === "null" ) {
				return null;
			}

			// Only convert to a number if it doesn't change the string
			if ( data === +data + "" ) {
				return +data;
			}

			if ( rbrace.test( data ) ) {
				return JSON.parse( data );
			}

			return data;
		}

		function dataAttr( elem, key, data ) {
			var name;

			// If nothing was found internally, try to fetch any
			// data from the HTML5 data-* attribute
			if ( data === undefined && elem.nodeType === 1 ) {
				name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
				data = elem.getAttribute( name );

				if ( typeof data === "string" ) {
					try {
						data = getData( data );
					} catch ( e ) {}

					// Make sure we set the data so it isn't changed later
					dataUser.set( elem, key, data );
				} else {
					data = undefined;
				}
			}
			return data;
		}

		jQuery.extend( {
			hasData: function( elem ) {
				return dataUser.hasData( elem ) || dataPriv.hasData( elem );
			},

			data: function( elem, name, data ) {
				return dataUser.access( elem, name, data );
			},

			removeData: function( elem, name ) {
				dataUser.remove( elem, name );
			},

			// TODO: Now that all calls to _data and _removeData have been replaced
			// with direct calls to dataPriv methods, these can be deprecated.
			_data: function( elem, name, data ) {
				return dataPriv.access( elem, name, data );
			},

			_removeData: function( elem, name ) {
				dataPriv.remove( elem, name );
			}
		} );

		jQuery.fn.extend( {
			data: function( key, value ) {
				var i, name, data,
				    elem = this[ 0 ],
				    attrs = elem && elem.attributes;

				// Gets all values
				if ( key === undefined ) {
					if ( this.length ) {
						data = dataUser.get( elem );

						if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
							i = attrs.length;
							while ( i-- ) {

								// Support: IE 11 only
								// The attrs elements can be null (#14894)
								if ( attrs[ i ] ) {
									name = attrs[ i ].name;
									if ( name.indexOf( "data-" ) === 0 ) {
										name = jQuery.camelCase( name.slice( 5 ) );
										dataAttr( elem, name, data[ name ] );
									}
								}
							}
							dataPriv.set( elem, "hasDataAttrs", true );
						}
					}

					return data;
				}

				// Sets multiple values
				if ( typeof key === "object" ) {
					return this.each( function() {
						dataUser.set( this, key );
					} );
				}

				return access( this, function( value ) {
					var data;

					// The calling jQuery object (element matches) is not empty
					// (and therefore has an element appears at this[ 0 ]) and the
					// `value` parameter was not undefined. An empty jQuery object
					// will result in `undefined` for elem = this[ 0 ] which will
					// throw an exception if an attempt to read a data cache is made.
					if ( elem && value === undefined ) {

						// Attempt to get data from the cache
						// The key will always be camelCased in Data
						data = dataUser.get( elem, key );
						if ( data !== undefined ) {
							return data;
						}

						// Attempt to "discover" the data in
						// HTML5 custom data-* attrs
						data = dataAttr( elem, key );
						if ( data !== undefined ) {
							return data;
						}

						// We tried really hard, but the data doesn't exist.
						return;
					}

					// Set the data...
					this.each( function() {

						// We always store the camelCased key
						dataUser.set( this, key, value );
					} );
				}, null, value, arguments.length > 1, null, true );
			},

			removeData: function( key ) {
				return this.each( function() {
					dataUser.remove( this, key );
				} );
			}
		} );


		jQuery.extend( {
			queue: function( elem, type, data ) {
				var queue;

				if ( elem ) {
					type = ( type || "fx" ) + "queue";
					queue = dataPriv.get( elem, type );

					// Speed up dequeue by getting out quickly if this is just a lookup
					if ( data ) {
						if ( !queue || Array.isArray( data ) ) {
							queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
						} else {
							queue.push( data );
						}
					}
					return queue || [];
				}
			},

			dequeue: function( elem, type ) {
				type = type || "fx";

				var queue = jQuery.queue( elem, type ),
				    startLength = queue.length,
				    fn = queue.shift(),
				    hooks = jQuery._queueHooks( elem, type ),
				    next = function() {
					    jQuery.dequeue( elem, type );
				    };

				// If the fx queue is dequeued, always remove the progress sentinel
				if ( fn === "inprogress" ) {
					fn = queue.shift();
					startLength--;
				}

				if ( fn ) {

					// Add a progress sentinel to prevent the fx queue from being
					// automatically dequeued
					if ( type === "fx" ) {
						queue.unshift( "inprogress" );
					}

					// Clear up the last queue stop function
					delete hooks.stop;
					fn.call( elem, next, hooks );
				}

				if ( !startLength && hooks ) {
					hooks.empty.fire();
				}
			},

			// Not public - generate a queueHooks object, or return the current one
			_queueHooks: function( elem, type ) {
				var key = type + "queueHooks";
				return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
						empty: jQuery.Callbacks( "once memory" ).add( function() {
							dataPriv.remove( elem, [ type + "queue", key ] );
						} )
					} );
			}
		} );

		jQuery.fn.extend( {
			queue: function( type, data ) {
				var setter = 2;

				if ( typeof type !== "string" ) {
					data = type;
					type = "fx";
					setter--;
				}

				if ( arguments.length < setter ) {
					return jQuery.queue( this[ 0 ], type );
				}

				return data === undefined ?
					this :
					this.each( function() {
						var queue = jQuery.queue( this, type, data );

						// Ensure a hooks for this queue
						jQuery._queueHooks( this, type );

						if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
							jQuery.dequeue( this, type );
						}
					} );
			},
			dequeue: function( type ) {
				return this.each( function() {
					jQuery.dequeue( this, type );
				} );
			},
			clearQueue: function( type ) {
				return this.queue( type || "fx", [] );
			},

			// Get a promise resolved when queues of a certain type
			// are emptied (fx is the type by default)
			promise: function( type, obj ) {
				var tmp,
				    count = 1,
				    defer = jQuery.Deferred(),
				    elements = this,
				    i = this.length,
				    resolve = function() {
					    if ( !( --count ) ) {
						    defer.resolveWith( elements, [ elements ] );
					    }
				    };

				if ( typeof type !== "string" ) {
					obj = type;
					type = undefined;
				}
				type = type || "fx";

				while ( i-- ) {
					tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
					if ( tmp && tmp.empty ) {
						count++;
						tmp.empty.add( resolve );
					}
				}
				resolve();
				return defer.promise( obj );
			}
		} );
		var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

		var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


		var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

		var isHiddenWithinTree = function( elem, el ) {

			// isHiddenWithinTree might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;

			// Inline style trumps all
			return elem.style.display === "none" ||
				elem.style.display === "" &&

				// Otherwise, check computed style
				// Support: Firefox <=43 - 45
				// Disconnected elements can have computed display: none, so first confirm that elem is
				// in the document.
				jQuery.contains( elem.ownerDocument, elem ) &&

				jQuery.css( elem, "display" ) === "none";
		};

		var swap = function( elem, options, callback, args ) {
			var ret, name,
			    old = {};

			// Remember the old values, and insert the new ones
			for ( name in options ) {
				old[ name ] = elem.style[ name ];
				elem.style[ name ] = options[ name ];
			}

			ret = callback.apply( elem, args || [] );

			// Revert the old values
			for ( name in options ) {
				elem.style[ name ] = old[ name ];
			}

			return ret;
		};




		function adjustCSS( elem, prop, valueParts, tween ) {
			var adjusted,
			    scale = 1,
			    maxIterations = 20,
			    currentValue = tween ?
				    function() {
					    return tween.cur();
				    } :
				    function() {
					    return jQuery.css( elem, prop, "" );
				    },
			    initial = currentValue(),
			    unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			    // Starting value computation is required for potential unit mismatches
			    initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				    rcssNum.exec( jQuery.css( elem, prop ) );

			if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

				// Trust units reported by jQuery.css
				unit = unit || initialInUnit[ 3 ];

				// Make sure we update the tween properties later on
				valueParts = valueParts || [];

				// Iteratively approximate from a nonzero starting point
				initialInUnit = +initial || 1;

				do {

					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					initialInUnit = initialInUnit / scale;
					jQuery.style( elem, prop, initialInUnit + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// Break the loop if scale is unchanged or perfect, or if we've just had enough.
				} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
					);
			}

			if ( valueParts ) {
				initialInUnit = +initialInUnit || +initial || 0;

				// Apply relative offset (+=/-=) if specified
				adjusted = valueParts[ 1 ] ?
					initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
					+valueParts[ 2 ];
				if ( tween ) {
					tween.unit = unit;
					tween.start = initialInUnit;
					tween.end = adjusted;
				}
			}
			return adjusted;
		}


		var defaultDisplayMap = {};

		function getDefaultDisplay( elem ) {
			var temp,
			    doc = elem.ownerDocument,
			    nodeName = elem.nodeName,
			    display = defaultDisplayMap[ nodeName ];

			if ( display ) {
				return display;
			}

			temp = doc.body.appendChild( doc.createElement( nodeName ) );
			display = jQuery.css( temp, "display" );

			temp.parentNode.removeChild( temp );

			if ( display === "none" ) {
				display = "block";
			}
			defaultDisplayMap[ nodeName ] = display;

			return display;
		}

		function showHide( elements, show ) {
			var display, elem,
			    values = [],
			    index = 0,
			    length = elements.length;

			// Determine new display value for elements that need to change
			for ( ; index < length; index++ ) {
				elem = elements[ index ];
				if ( !elem.style ) {
					continue;
				}

				display = elem.style.display;
				if ( show ) {

					// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
					// check is required in this first loop unless we have a nonempty display value (either
					// inline or about-to-be-restored)
					if ( display === "none" ) {
						values[ index ] = dataPriv.get( elem, "display" ) || null;
						if ( !values[ index ] ) {
							elem.style.display = "";
						}
					}
					if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
						values[ index ] = getDefaultDisplay( elem );
					}
				} else {
					if ( display !== "none" ) {
						values[ index ] = "none";

						// Remember what we're overwriting
						dataPriv.set( elem, "display", display );
					}
				}
			}

			// Set the display of the elements in a second loop to avoid constant reflow
			for ( index = 0; index < length; index++ ) {
				if ( values[ index ] != null ) {
					elements[ index ].style.display = values[ index ];
				}
			}

			return elements;
		}

		jQuery.fn.extend( {
			show: function() {
				return showHide( this, true );
			},
			hide: function() {
				return showHide( this );
			},
			toggle: function( state ) {
				if ( typeof state === "boolean" ) {
					return state ? this.show() : this.hide();
				}

				return this.each( function() {
					if ( isHiddenWithinTree( this ) ) {
						jQuery( this ).show();
					} else {
						jQuery( this ).hide();
					}
				} );
			}
		} );
		var rcheckableType = ( /^(?:checkbox|radio)$/i );

		var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

		var rscriptType = ( /^$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
		var wrapMap = {

			// Support: IE <=9 only
			option: [ 1, "<select multiple='multiple'>", "</select>" ],

			// XHTML parsers do not magically insert elements in the
			// same way that tag soup parsers do. So we cannot shorten
			// this by omitting <tbody> or other required elements.
			thead: [ 1, "<table>", "</table>" ],
			col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
			tr: [ 2, "<table><tbody>", "</tbody></table>" ],
			td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

			_default: [ 0, "", "" ]
		};

// Support: IE <=9 only
		wrapMap.optgroup = wrapMap.option;

		wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
		wrapMap.th = wrapMap.td;


		function getAll( context, tag ) {

			// Support: IE <=9 - 11 only
			// Use typeof to avoid zero-argument method invocation on host objects (#15151)
			var ret;

			if ( typeof context.getElementsByTagName !== "undefined" ) {
				ret = context.getElementsByTagName( tag || "*" );

			} else if ( typeof context.querySelectorAll !== "undefined" ) {
				ret = context.querySelectorAll( tag || "*" );

			} else {
				ret = [];
			}

			if ( tag === undefined || tag && nodeName( context, tag ) ) {
				return jQuery.merge( [ context ], ret );
			}

			return ret;
		}


// Mark scripts as having already been evaluated
		function setGlobalEval( elems, refElements ) {
			var i = 0,
			    l = elems.length;

			for ( ; i < l; i++ ) {
				dataPriv.set(
					elems[ i ],
					"globalEval",
					!refElements || dataPriv.get( refElements[ i ], "globalEval" )
				);
			}
		}


		var rhtml = /<|&#?\w+;/;

		function buildFragment( elems, context, scripts, selection, ignored ) {
			var elem, tmp, tag, wrap, contains, j,
			    fragment = context.createDocumentFragment(),
			    nodes = [],
			    i = 0,
			    l = elems.length;

			for ( ; i < l; i++ ) {
				elem = elems[ i ];

				if ( elem || elem === 0 ) {

					// Add nodes directly
					if ( jQuery.type( elem ) === "object" ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

						// Convert non-html into a text node
					} else if ( !rhtml.test( elem ) ) {
						nodes.push( context.createTextNode( elem ) );

						// Convert html into DOM nodes
					} else {
						tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

						// Deserialize a standard representation
						tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
						wrap = wrapMap[ tag ] || wrapMap._default;
						tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

						// Descend through wrappers to the right content
						j = wrap[ 0 ];
						while ( j-- ) {
							tmp = tmp.lastChild;
						}

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( nodes, tmp.childNodes );

						// Remember the top-level container
						tmp = fragment.firstChild;

						// Ensure the created nodes are orphaned (#12392)
						tmp.textContent = "";
					}
				}
			}

			// Remove wrapper from fragment
			fragment.textContent = "";

			i = 0;
			while ( ( elem = nodes[ i++ ] ) ) {

				// Skip elements already in the context collection (trac-4087)
				if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
					if ( ignored ) {
						ignored.push( elem );
					}
					continue;
				}

				contains = jQuery.contains( elem.ownerDocument, elem );

				// Append to fragment
				tmp = getAll( fragment.appendChild( elem ), "script" );

				// Preserve script evaluation history
				if ( contains ) {
					setGlobalEval( tmp );
				}

				// Capture executables
				if ( scripts ) {
					j = 0;
					while ( ( elem = tmp[ j++ ] ) ) {
						if ( rscriptType.test( elem.type || "" ) ) {
							scripts.push( elem );
						}
					}
				}
			}

			return fragment;
		}


		( function() {
			var fragment = document.createDocumentFragment(),
			    div = fragment.appendChild( document.createElement( "div" ) ),
			    input = document.createElement( "input" );

			// Support: Android 4.0 - 4.3 only
			// Check state lost if the name is set (#11217)
			// Support: Windows Web Apps (WWA)
			// `name` and `type` must use .setAttribute for WWA (#14901)
			input.setAttribute( "type", "radio" );
			input.setAttribute( "checked", "checked" );
			input.setAttribute( "name", "t" );

			div.appendChild( input );

			// Support: Android <=4.1 only
			// Older WebKit doesn't clone checked state correctly in fragments
			support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

			// Support: IE <=11 only
			// Make sure textarea (and checkbox) defaultValue is properly cloned
			div.innerHTML = "<textarea>x</textarea>";
			support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
		} )();
		var documentElement = document.documentElement;



		var
			rkeyEvent = /^key/,
			rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
			rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

		function returnTrue() {
			return true;
		}

		function returnFalse() {
			return false;
		}

// Support: IE <=9 only
// See #13393 for more info
		function safeActiveElement() {
			try {
				return document.activeElement;
			} catch ( err ) { }
		}

		function on( elem, types, selector, data, fn, one ) {
			var origFn, type;

			// Types can be a map of types/handlers
			if ( typeof types === "object" ) {

				// ( types-Object, selector, data )
				if ( typeof selector !== "string" ) {

					// ( types-Object, data )
					data = data || selector;
					selector = undefined;
				}
				for ( type in types ) {
					on( elem, type, selector, data, types[ type ], one );
				}
				return elem;
			}

			if ( data == null && fn == null ) {

				// ( types, fn )
				fn = selector;
				data = selector = undefined;
			} else if ( fn == null ) {
				if ( typeof selector === "string" ) {

					// ( types, selector, fn )
					fn = data;
					data = undefined;
				} else {

					// ( types, data, fn )
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			if ( fn === false ) {
				fn = returnFalse;
			} else if ( !fn ) {
				return elem;
			}

			if ( one === 1 ) {
				origFn = fn;
				fn = function( event ) {

					// Can use an empty set, since event contains the info
					jQuery().off( event );
					return origFn.apply( this, arguments );
				};

				// Use same guid so caller can remove using origFn
				fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
			}
			return elem.each( function() {
				jQuery.event.add( this, types, fn, data, selector );
			} );
		}

		/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
		jQuery.event = {

			global: {},

			add: function( elem, types, handler, data, selector ) {

				var handleObjIn, eventHandle, tmp,
				    events, t, handleObj,
				    special, handlers, type, namespaces, origType,
				    elemData = dataPriv.get( elem );

				// Don't attach events to noData or text/comment nodes (but allow plain objects)
				if ( !elemData ) {
					return;
				}

				// Caller can pass in an object of custom data in lieu of the handler
				if ( handler.handler ) {
					handleObjIn = handler;
					handler = handleObjIn.handler;
					selector = handleObjIn.selector;
				}

				// Ensure that invalid selectors throw exceptions at attach time
				// Evaluate against documentElement in case elem is a non-element node (e.g., document)
				if ( selector ) {
					jQuery.find.matchesSelector( documentElement, selector );
				}

				// Make sure that the handler has a unique ID, used to find/remove it later
				if ( !handler.guid ) {
					handler.guid = jQuery.guid++;
				}

				// Init the element's event structure and main handler, if this is the first
				if ( !( events = elemData.events ) ) {
					events = elemData.events = {};
				}
				if ( !( eventHandle = elemData.handle ) ) {
					eventHandle = elemData.handle = function( e ) {

						// Discard the second event of a jQuery.event.trigger() and
						// when an event is called after a page has unloaded
						return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
							jQuery.event.dispatch.apply( elem, arguments ) : undefined;
					};
				}

				// Handle multiple events separated by a space
				types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
				t = types.length;
				while ( t-- ) {
					tmp = rtypenamespace.exec( types[ t ] ) || [];
					type = origType = tmp[ 1 ];
					namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

					// There *must* be a type, no attaching namespace-only handlers
					if ( !type ) {
						continue;
					}

					// If event changes its type, use the special event handlers for the changed type
					special = jQuery.event.special[ type ] || {};

					// If selector defined, determine special event api type, otherwise given type
					type = ( selector ? special.delegateType : special.bindType ) || type;

					// Update special based on newly reset type
					special = jQuery.event.special[ type ] || {};

					// handleObj is passed to all event handlers
					handleObj = jQuery.extend( {
						type: type,
						origType: origType,
						data: data,
						handler: handler,
						guid: handler.guid,
						selector: selector,
						needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
						namespace: namespaces.join( "." )
					}, handleObjIn );

					// Init the event handler queue if we're the first
					if ( !( handlers = events[ type ] ) ) {
						handlers = events[ type ] = [];
						handlers.delegateCount = 0;

						// Only use addEventListener if the special events handler returns false
						if ( !special.setup ||
							special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

							if ( elem.addEventListener ) {
								elem.addEventListener( type, eventHandle );
							}
						}
					}

					if ( special.add ) {
						special.add.call( elem, handleObj );

						if ( !handleObj.handler.guid ) {
							handleObj.handler.guid = handler.guid;
						}
					}

					// Add to the element's handler list, delegates in front
					if ( selector ) {
						handlers.splice( handlers.delegateCount++, 0, handleObj );
					} else {
						handlers.push( handleObj );
					}

					// Keep track of which events have ever been used, for event optimization
					jQuery.event.global[ type ] = true;
				}

			},

			// Detach an event or set of events from an element
			remove: function( elem, types, handler, selector, mappedTypes ) {

				var j, origCount, tmp,
				    events, t, handleObj,
				    special, handlers, type, namespaces, origType,
				    elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

				if ( !elemData || !( events = elemData.events ) ) {
					return;
				}

				// Once for each type.namespace in types; type may be omitted
				types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
				t = types.length;
				while ( t-- ) {
					tmp = rtypenamespace.exec( types[ t ] ) || [];
					type = origType = tmp[ 1 ];
					namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

					// Unbind all events (on this namespace, if provided) for the element
					if ( !type ) {
						for ( type in events ) {
							jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
						}
						continue;
					}

					special = jQuery.event.special[ type ] || {};
					type = ( selector ? special.delegateType : special.bindType ) || type;
					handlers = events[ type ] || [];
					tmp = tmp[ 2 ] &&
						new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

					// Remove matching events
					origCount = j = handlers.length;
					while ( j-- ) {
						handleObj = handlers[ j ];

						if ( ( mappedTypes || origType === handleObj.origType ) &&
							( !handler || handler.guid === handleObj.guid ) &&
							( !tmp || tmp.test( handleObj.namespace ) ) &&
							( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
							handlers.splice( j, 1 );

							if ( handleObj.selector ) {
								handlers.delegateCount--;
							}
							if ( special.remove ) {
								special.remove.call( elem, handleObj );
							}
						}
					}

					// Remove generic event handler if we removed something and no more handlers exist
					// (avoids potential for endless recursion during removal of special event handlers)
					if ( origCount && !handlers.length ) {
						if ( !special.teardown ||
							special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

							jQuery.removeEvent( elem, type, elemData.handle );
						}

						delete events[ type ];
					}
				}

				// Remove data and the expando if it's no longer used
				if ( jQuery.isEmptyObject( events ) ) {
					dataPriv.remove( elem, "handle events" );
				}
			},

			dispatch: function( nativeEvent ) {

				// Make a writable jQuery.Event from the native event object
				var event = jQuery.event.fix( nativeEvent );

				var i, j, ret, matched, handleObj, handlerQueue,
				    args = new Array( arguments.length ),
				    handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				    special = jQuery.event.special[ event.type ] || {};

				// Use the fix-ed jQuery.Event rather than the (read-only) native event
				args[ 0 ] = event;

				for ( i = 1; i < arguments.length; i++ ) {
					args[ i ] = arguments[ i ];
				}

				event.delegateTarget = this;

				// Call the preDispatch hook for the mapped type, and let it bail if desired
				if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
					return;
				}

				// Determine handlers
				handlerQueue = jQuery.event.handlers.call( this, event, handlers );

				// Run delegates first; they may want to stop propagation beneath us
				i = 0;
				while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
					event.currentTarget = matched.elem;

					j = 0;
					while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

						// Triggered event must either 1) have no namespace, or 2) have namespace(s)
						// a subset or equal to those in the bound event (both can have no namespace).
						if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

							event.handleObj = handleObj;
							event.data = handleObj.data;

							ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

							if ( ret !== undefined ) {
								if ( ( event.result = ret ) === false ) {
									event.preventDefault();
									event.stopPropagation();
								}
							}
						}
					}
				}

				// Call the postDispatch hook for the mapped type
				if ( special.postDispatch ) {
					special.postDispatch.call( this, event );
				}

				return event.result;
			},

			handlers: function( event, handlers ) {
				var i, handleObj, sel, matchedHandlers, matchedSelectors,
				    handlerQueue = [],
				    delegateCount = handlers.delegateCount,
				    cur = event.target;

				// Find delegate handlers
				if ( delegateCount &&

					// Support: IE <=9
					// Black-hole SVG <use> instance trees (trac-13180)
					cur.nodeType &&

					// Support: Firefox <=42
					// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
					// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
					// Support: IE 11 only
					// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
					!( event.type === "click" && event.button >= 1 ) ) {

					for ( ; cur !== this; cur = cur.parentNode || this ) {

						// Don't check non-elements (#13208)
						// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
						if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
							matchedHandlers = [];
							matchedSelectors = {};
							for ( i = 0; i < delegateCount; i++ ) {
								handleObj = handlers[ i ];

								// Don't conflict with Object.prototype properties (#13203)
								sel = handleObj.selector + " ";

								if ( matchedSelectors[ sel ] === undefined ) {
									matchedSelectors[ sel ] = handleObj.needsContext ?
										jQuery( sel, this ).index( cur ) > -1 :
										jQuery.find( sel, this, null, [ cur ] ).length;
								}
								if ( matchedSelectors[ sel ] ) {
									matchedHandlers.push( handleObj );
								}
							}
							if ( matchedHandlers.length ) {
								handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
							}
						}
					}
				}

				// Add the remaining (directly-bound) handlers
				cur = this;
				if ( delegateCount < handlers.length ) {
					handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
				}

				return handlerQueue;
			},

			addProp: function( name, hook ) {
				Object.defineProperty( jQuery.Event.prototype, name, {
					enumerable: true,
					configurable: true,

					get: jQuery.isFunction( hook ) ?
						function() {
							if ( this.originalEvent ) {
								return hook( this.originalEvent );
							}
						} :
						function() {
							if ( this.originalEvent ) {
								return this.originalEvent[ name ];
							}
						},

					set: function( value ) {
						Object.defineProperty( this, name, {
							enumerable: true,
							configurable: true,
							writable: true,
							value: value
						} );
					}
				} );
			},

			fix: function( originalEvent ) {
				return originalEvent[ jQuery.expando ] ?
					originalEvent :
					new jQuery.Event( originalEvent );
			},

			special: {
				load: {

					// Prevent triggered image.load events from bubbling to window.load
					noBubble: true
				},
				focus: {

					// Fire native event if possible so blur/focus sequence is correct
					trigger: function() {
						if ( this !== safeActiveElement() && this.focus ) {
							this.focus();
							return false;
						}
					},
					delegateType: "focusin"
				},
				blur: {
					trigger: function() {
						if ( this === safeActiveElement() && this.blur ) {
							this.blur();
							return false;
						}
					},
					delegateType: "focusout"
				},
				click: {

					// For checkbox, fire native event so checked state will be right
					trigger: function() {
						if ( this.type === "checkbox" && this.click && nodeName( this, "input" ) ) {
							this.click();
							return false;
						}
					},

					// For cross-browser consistency, don't fire native .click() on links
					_default: function( event ) {
						return nodeName( event.target, "a" );
					}
				},

				beforeunload: {
					postDispatch: function( event ) {

						// Support: Firefox 20+
						// Firefox doesn't alert if the returnValue field is not set.
						if ( event.result !== undefined && event.originalEvent ) {
							event.originalEvent.returnValue = event.result;
						}
					}
				}
			}
		};

		jQuery.removeEvent = function( elem, type, handle ) {

			// This "if" is needed for plain objects
			if ( elem.removeEventListener ) {
				elem.removeEventListener( type, handle );
			}
		};

		jQuery.Event = function( src, props ) {

			// Allow instantiation without the 'new' keyword
			if ( !( this instanceof jQuery.Event ) ) {
				return new jQuery.Event( src, props );
			}

			// Event object
			if ( src && src.type ) {
				this.originalEvent = src;
				this.type = src.type;

				// Events bubbling up the document may have been marked as prevented
				// by a handler lower down the tree; reflect the correct value.
				this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
					returnTrue :
					returnFalse;

				// Create target properties
				// Support: Safari <=6 - 7 only
				// Target should not be a text node (#504, #13143)
				this.target = ( src.target && src.target.nodeType === 3 ) ?
					src.target.parentNode :
					src.target;

				this.currentTarget = src.currentTarget;
				this.relatedTarget = src.relatedTarget;

				// Event type
			} else {
				this.type = src;
			}

			// Put explicitly provided properties onto the event object
			if ( props ) {
				jQuery.extend( this, props );
			}

			// Create a timestamp if incoming event doesn't have one
			this.timeStamp = src && src.timeStamp || jQuery.now();

			// Mark it as fixed
			this[ jQuery.expando ] = true;
		};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
		jQuery.Event.prototype = {
			constructor: jQuery.Event,
			isDefaultPrevented: returnFalse,
			isPropagationStopped: returnFalse,
			isImmediatePropagationStopped: returnFalse,
			isSimulated: false,

			preventDefault: function() {
				var e = this.originalEvent;

				this.isDefaultPrevented = returnTrue;

				if ( e && !this.isSimulated ) {
					e.preventDefault();
				}
			},
			stopPropagation: function() {
				var e = this.originalEvent;

				this.isPropagationStopped = returnTrue;

				if ( e && !this.isSimulated ) {
					e.stopPropagation();
				}
			},
			stopImmediatePropagation: function() {
				var e = this.originalEvent;

				this.isImmediatePropagationStopped = returnTrue;

				if ( e && !this.isSimulated ) {
					e.stopImmediatePropagation();
				}

				this.stopPropagation();
			}
		};

// Includes all common event props including KeyEvent and MouseEvent specific props
		jQuery.each( {
			altKey: true,
			bubbles: true,
			cancelable: true,
			changedTouches: true,
			ctrlKey: true,
			detail: true,
			eventPhase: true,
			metaKey: true,
			pageX: true,
			pageY: true,
			shiftKey: true,
			view: true,
			"char": true,
			charCode: true,
			key: true,
			keyCode: true,
			button: true,
			buttons: true,
			clientX: true,
			clientY: true,
			offsetX: true,
			offsetY: true,
			pointerId: true,
			pointerType: true,
			screenX: true,
			screenY: true,
			targetTouches: true,
			toElement: true,
			touches: true,

			which: function( event ) {
				var button = event.button;

				// Add which for key events
				if ( event.which == null && rkeyEvent.test( event.type ) ) {
					return event.charCode != null ? event.charCode : event.keyCode;
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
					if ( button & 1 ) {
						return 1;
					}

					if ( button & 2 ) {
						return 3;
					}

					if ( button & 4 ) {
						return 2;
					}

					return 0;
				}

				return event.which;
			}
		}, jQuery.event.addProp );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
		jQuery.each( {
			mouseenter: "mouseover",
			mouseleave: "mouseout",
			pointerenter: "pointerover",
			pointerleave: "pointerout"
		}, function( orig, fix ) {
			jQuery.event.special[ orig ] = {
				delegateType: fix,
				bindType: fix,

				handle: function( event ) {
					var ret,
					    target = this,
					    related = event.relatedTarget,
					    handleObj = event.handleObj;

					// For mouseenter/leave call the handler if related is outside the target.
					// NB: No relatedTarget if the mouse left/entered the browser window
					if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
						event.type = handleObj.origType;
						ret = handleObj.handler.apply( this, arguments );
						event.type = fix;
					}
					return ret;
				}
			};
		} );

		jQuery.fn.extend( {

			on: function( types, selector, data, fn ) {
				return on( this, types, selector, data, fn );
			},
			one: function( types, selector, data, fn ) {
				return on( this, types, selector, data, fn, 1 );
			},
			off: function( types, selector, fn ) {
				var handleObj, type;
				if ( types && types.preventDefault && types.handleObj ) {

					// ( event )  dispatched jQuery.Event
					handleObj = types.handleObj;
					jQuery( types.delegateTarget ).off(
						handleObj.namespace ?
							handleObj.origType + "." + handleObj.namespace :
							handleObj.origType,
						handleObj.selector,
						handleObj.handler
					);
					return this;
				}
				if ( typeof types === "object" ) {

					// ( types-object [, selector] )
					for ( type in types ) {
						this.off( type, selector, types[ type ] );
					}
					return this;
				}
				if ( selector === false || typeof selector === "function" ) {

					// ( types [, fn] )
					fn = selector;
					selector = undefined;
				}
				if ( fn === false ) {
					fn = returnFalse;
				}
				return this.each( function() {
					jQuery.event.remove( this, types, fn, selector );
				} );
			}
		} );


		var

			/* eslint-disable max-len */

			// See https://github.com/eslint/eslint/issues/3229
			rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

			/* eslint-enable */

			// Support: IE <=10 - 11, Edge 12 - 13
			// In IE/Edge using regex groups here causes severe slowdowns.
			// See https://connect.microsoft.com/IE/feedback/details/1736512/
			rnoInnerhtml = /<script|<style|<link/i,

			// checked="checked" or checked
			rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
			rscriptTypeMasked = /^true\/(.*)/,
			rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
		function manipulationTarget( elem, content ) {
			if ( nodeName( elem, "table" ) &&
				nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

				return jQuery( ">tbody", elem )[ 0 ] || elem;
			}

			return elem;
		}

// Replace/restore the type attribute of script elements for safe DOM manipulation
		function disableScript( elem ) {
			elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
			return elem;
		}
		function restoreScript( elem ) {
			var match = rscriptTypeMasked.exec( elem.type );

			if ( match ) {
				elem.type = match[ 1 ];
			} else {
				elem.removeAttribute( "type" );
			}

			return elem;
		}

		function cloneCopyEvent( src, dest ) {
			var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

			if ( dest.nodeType !== 1 ) {
				return;
			}

			// 1. Copy private data: events, handlers, etc.
			if ( dataPriv.hasData( src ) ) {
				pdataOld = dataPriv.access( src );
				pdataCur = dataPriv.set( dest, pdataOld );
				events = pdataOld.events;

				if ( events ) {
					delete pdataCur.handle;
					pdataCur.events = {};

					for ( type in events ) {
						for ( i = 0, l = events[ type ].length; i < l; i++ ) {
							jQuery.event.add( dest, type, events[ type ][ i ] );
						}
					}
				}
			}

			// 2. Copy user data
			if ( dataUser.hasData( src ) ) {
				udataOld = dataUser.access( src );
				udataCur = jQuery.extend( {}, udataOld );

				dataUser.set( dest, udataCur );
			}
		}

// Fix IE bugs, see support tests
		function fixInput( src, dest ) {
			var nodeName = dest.nodeName.toLowerCase();

			// Fails to persist the checked state of a cloned checkbox or radio button.
			if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
				dest.checked = src.checked;

				// Fails to return the selected option to the default selected state when cloning options
			} else if ( nodeName === "input" || nodeName === "textarea" ) {
				dest.defaultValue = src.defaultValue;
			}
		}

		function domManip( collection, args, callback, ignored ) {

			// Flatten any nested arrays
			args = concat.apply( [], args );

			var fragment, first, scripts, hasScripts, node, doc,
			    i = 0,
			    l = collection.length,
			    iNoClone = l - 1,
			    value = args[ 0 ],
			    isFunction = jQuery.isFunction( value );

			// We can't cloneNode fragments that contain checked, in WebKit
			if ( isFunction ||
				( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
				return collection.each( function( index ) {
					var self = collection.eq( index );
					if ( isFunction ) {
						args[ 0 ] = value.call( this, index, self.html() );
					}
					domManip( self, args, callback, ignored );
				} );
			}

			if ( l ) {
				fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
				first = fragment.firstChild;

				if ( fragment.childNodes.length === 1 ) {
					fragment = first;
				}

				// Require either new content or an interest in ignored elements to invoke the callback
				if ( first || ignored ) {
					scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
					hasScripts = scripts.length;

					// Use the original fragment for the last item
					// instead of the first because it can end up
					// being emptied incorrectly in certain situations (#8070).
					for ( ; i < l; i++ ) {
						node = fragment;

						if ( i !== iNoClone ) {
							node = jQuery.clone( node, true, true );

							// Keep references to cloned scripts for later restoration
							if ( hasScripts ) {

								// Support: Android <=4.0 only, PhantomJS 1 only
								// push.apply(_, arraylike) throws on ancient WebKit
								jQuery.merge( scripts, getAll( node, "script" ) );
							}
						}

						callback.call( collection[ i ], node, i );
					}

					if ( hasScripts ) {
						doc = scripts[ scripts.length - 1 ].ownerDocument;

						// Reenable scripts
						jQuery.map( scripts, restoreScript );

						// Evaluate executable scripts on first document insertion
						for ( i = 0; i < hasScripts; i++ ) {
							node = scripts[ i ];
							if ( rscriptType.test( node.type || "" ) &&
								!dataPriv.access( node, "globalEval" ) &&
								jQuery.contains( doc, node ) ) {

								if ( node.src ) {

									// Optional AJAX dependency, but won't run scripts if not present
									if ( jQuery._evalUrl ) {
										jQuery._evalUrl( node.src );
									}
								} else {
									DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
								}
							}
						}
					}
				}
			}

			return collection;
		}

		function remove( elem, selector, keepData ) {
			var node,
			    nodes = selector ? jQuery.filter( selector, elem ) : elem,
			    i = 0;

			for ( ; ( node = nodes[ i ] ) != null; i++ ) {
				if ( !keepData && node.nodeType === 1 ) {
					jQuery.cleanData( getAll( node ) );
				}

				if ( node.parentNode ) {
					if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
						setGlobalEval( getAll( node, "script" ) );
					}
					node.parentNode.removeChild( node );
				}
			}

			return elem;
		}

		jQuery.extend( {
			htmlPrefilter: function( html ) {
				return html.replace( rxhtmlTag, "<$1></$2>" );
			},

			clone: function( elem, dataAndEvents, deepDataAndEvents ) {
				var i, l, srcElements, destElements,
				    clone = elem.cloneNode( true ),
				    inPage = jQuery.contains( elem.ownerDocument, elem );

				// Fix IE cloning issues
				if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

					// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
					destElements = getAll( clone );
					srcElements = getAll( elem );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						fixInput( srcElements[ i ], destElements[ i ] );
					}
				}

				// Copy the events from the original to the clone
				if ( dataAndEvents ) {
					if ( deepDataAndEvents ) {
						srcElements = srcElements || getAll( elem );
						destElements = destElements || getAll( clone );

						for ( i = 0, l = srcElements.length; i < l; i++ ) {
							cloneCopyEvent( srcElements[ i ], destElements[ i ] );
						}
					} else {
						cloneCopyEvent( elem, clone );
					}
				}

				// Preserve script evaluation history
				destElements = getAll( clone, "script" );
				if ( destElements.length > 0 ) {
					setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
				}

				// Return the cloned set
				return clone;
			},

			cleanData: function( elems ) {
				var data, elem, type,
				    special = jQuery.event.special,
				    i = 0;

				for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
					if ( acceptData( elem ) ) {
						if ( ( data = elem[ dataPriv.expando ] ) ) {
							if ( data.events ) {
								for ( type in data.events ) {
									if ( special[ type ] ) {
										jQuery.event.remove( elem, type );

										// This is a shortcut to avoid jQuery.event.remove's overhead
									} else {
										jQuery.removeEvent( elem, type, data.handle );
									}
								}
							}

							// Support: Chrome <=35 - 45+
							// Assign undefined instead of using delete, see Data#remove
							elem[ dataPriv.expando ] = undefined;
						}
						if ( elem[ dataUser.expando ] ) {

							// Support: Chrome <=35 - 45+
							// Assign undefined instead of using delete, see Data#remove
							elem[ dataUser.expando ] = undefined;
						}
					}
				}
			}
		} );

		jQuery.fn.extend( {
			detach: function( selector ) {
				return remove( this, selector, true );
			},

			remove: function( selector ) {
				return remove( this, selector );
			},

			text: function( value ) {
				return access( this, function( value ) {
					return value === undefined ?
						jQuery.text( this ) :
						this.empty().each( function() {
							if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
								this.textContent = value;
							}
						} );
				}, null, value, arguments.length );
			},

			append: function() {
				return domManip( this, arguments, function( elem ) {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						var target = manipulationTarget( this, elem );
						target.appendChild( elem );
					}
				} );
			},

			prepend: function() {
				return domManip( this, arguments, function( elem ) {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						var target = manipulationTarget( this, elem );
						target.insertBefore( elem, target.firstChild );
					}
				} );
			},

			before: function() {
				return domManip( this, arguments, function( elem ) {
					if ( this.parentNode ) {
						this.parentNode.insertBefore( elem, this );
					}
				} );
			},

			after: function() {
				return domManip( this, arguments, function( elem ) {
					if ( this.parentNode ) {
						this.parentNode.insertBefore( elem, this.nextSibling );
					}
				} );
			},

			empty: function() {
				var elem,
				    i = 0;

				for ( ; ( elem = this[ i ] ) != null; i++ ) {
					if ( elem.nodeType === 1 ) {

						// Prevent memory leaks
						jQuery.cleanData( getAll( elem, false ) );

						// Remove any remaining nodes
						elem.textContent = "";
					}
				}

				return this;
			},

			clone: function( dataAndEvents, deepDataAndEvents ) {
				dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
				deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

				return this.map( function() {
					return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
				} );
			},

			html: function( value ) {
				return access( this, function( value ) {
					var elem = this[ 0 ] || {},
					    i = 0,
					    l = this.length;

					if ( value === undefined && elem.nodeType === 1 ) {
						return elem.innerHTML;
					}

					// See if we can take a shortcut and just use innerHTML
					if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
						!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

						value = jQuery.htmlPrefilter( value );

						try {
							for ( ; i < l; i++ ) {
								elem = this[ i ] || {};

								// Remove element nodes and prevent memory leaks
								if ( elem.nodeType === 1 ) {
									jQuery.cleanData( getAll( elem, false ) );
									elem.innerHTML = value;
								}
							}

							elem = 0;

							// If using innerHTML throws an exception, use the fallback method
						} catch ( e ) {}
					}

					if ( elem ) {
						this.empty().append( value );
					}
				}, null, value, arguments.length );
			},

			replaceWith: function() {
				var ignored = [];

				// Make the changes, replacing each non-ignored context element with the new content
				return domManip( this, arguments, function( elem ) {
					var parent = this.parentNode;

					if ( jQuery.inArray( this, ignored ) < 0 ) {
						jQuery.cleanData( getAll( this ) );
						if ( parent ) {
							parent.replaceChild( elem, this );
						}
					}

					// Force callback invocation
				}, ignored );
			}
		} );

		jQuery.each( {
			appendTo: "append",
			prependTo: "prepend",
			insertBefore: "before",
			insertAfter: "after",
			replaceAll: "replaceWith"
		}, function( name, original ) {
			jQuery.fn[ name ] = function( selector ) {
				var elems,
				    ret = [],
				    insert = jQuery( selector ),
				    last = insert.length - 1,
				    i = 0;

				for ( ; i <= last; i++ ) {
					elems = i === last ? this : this.clone( true );
					jQuery( insert[ i ] )[ original ]( elems );

					// Support: Android <=4.0 only, PhantomJS 1 only
					// .get() because push.apply(_, arraylike) throws on ancient WebKit
					push.apply( ret, elems.get() );
				}

				return this.pushStack( ret );
			};
		} );
		var rmargin = ( /^margin/ );

		var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

		var getStyles = function( elem ) {

			// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};



		( function() {

			// Executing both pixelPosition & boxSizingReliable tests require only one layout
			// so they're executed at the same time to save the second computation.
			function computeStyleTests() {

				// This is a singleton, we need to execute it only once
				if ( !div ) {
					return;
				}

				div.style.cssText =
					"box-sizing:border-box;" +
					"position:relative;display:block;" +
					"margin:auto;border:1px;padding:1px;" +
					"top:1%;width:50%";
				div.innerHTML = "";
				documentElement.appendChild( container );

				var divStyle = window.getComputedStyle( div );
				pixelPositionVal = divStyle.top !== "1%";

				// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
				reliableMarginLeftVal = divStyle.marginLeft === "2px";
				boxSizingReliableVal = divStyle.width === "4px";

				// Support: Android 4.0 - 4.3 only
				// Some styles come back with percentage values, even though they shouldn't
				div.style.marginRight = "50%";
				pixelMarginRightVal = divStyle.marginRight === "4px";

				documentElement.removeChild( container );

				// Nullify the div so it wouldn't be stored in the memory and
				// it will also be a sign that checks already performed
				div = null;
			}

			var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			    container = document.createElement( "div" ),
			    div = document.createElement( "div" );

			// Finish early in limited (non-browser) environments
			if ( !div.style ) {
				return;
			}

			// Support: IE <=9 - 11 only
			// Style of cloned element affects source element cloned (#8908)
			div.style.backgroundClip = "content-box";
			div.cloneNode( true ).style.backgroundClip = "";
			support.clearCloneStyle = div.style.backgroundClip === "content-box";

			container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
				"padding:0;margin-top:1px;position:absolute";
			container.appendChild( div );

			jQuery.extend( support, {
				pixelPosition: function() {
					computeStyleTests();
					return pixelPositionVal;
				},
				boxSizingReliable: function() {
					computeStyleTests();
					return boxSizingReliableVal;
				},
				pixelMarginRight: function() {
					computeStyleTests();
					return pixelMarginRightVal;
				},
				reliableMarginLeft: function() {
					computeStyleTests();
					return reliableMarginLeftVal;
				}
			} );
		} )();


		function curCSS( elem, name, computed ) {
			var width, minWidth, maxWidth, ret,

			    // Support: Firefox 51+
			    // Retrieving style before computed somehow
			    // fixes an issue with getting wrong values
			    // on detached elements
			    style = elem.style;

			computed = computed || getStyles( elem );

			// getPropertyValue is needed for:
			//   .css('filter') (IE 9 only, #12537)
			//   .css('--customProperty) (#3144)
			if ( computed ) {
				ret = computed.getPropertyValue( name ) || computed[ name ];

				if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
					ret = jQuery.style( elem, name );
				}

				// A tribute to the "awesome hack by Dean Edwards"
				// Android Browser returns percentage for some values,
				// but width seems to be reliably pixels.
				// This is against the CSSOM draft spec:
				// https://drafts.csswg.org/cssom/#resolved-values
				if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

					// Remember the original values
					width = style.width;
					minWidth = style.minWidth;
					maxWidth = style.maxWidth;

					// Put in the new values to get a computed value out
					style.minWidth = style.maxWidth = style.width = ret;
					ret = computed.width;

					// Revert the changed values
					style.width = width;
					style.minWidth = minWidth;
					style.maxWidth = maxWidth;
				}
			}

			return ret !== undefined ?

				// Support: IE <=9 - 11 only
				// IE returns zIndex value as an integer.
				ret + "" :
				ret;
		}


		function addGetHookIf( conditionFn, hookFn ) {

			// Define the hook, we'll check on the first run if it's really needed.
			return {
				get: function() {
					if ( conditionFn() ) {

						// Hook not needed (or it's not possible to use it due
						// to missing dependency), remove it.
						delete this.get;
						return;
					}

					// Hook needed; redefine it so that the support test is not executed again.
					return ( this.get = hookFn ).apply( this, arguments );
				}
			};
		}


		var

			// Swappable if display is none or starts with table
			// except "table", "table-cell", or "table-caption"
			// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
			rdisplayswap = /^(none|table(?!-c[ea]).+)/,
			rcustomProp = /^--/,
			cssShow = { position: "absolute", visibility: "hidden", display: "block" },
			cssNormalTransform = {
				letterSpacing: "0",
				fontWeight: "400"
			},

			cssPrefixes = [ "Webkit", "Moz", "ms" ],
			emptyStyle = document.createElement( "div" ).style;

// Return a css property mapped to a potentially vendor prefixed property
		function vendorPropName( name ) {

			// Shortcut for names that are not vendor prefixed
			if ( name in emptyStyle ) {
				return name;
			}

			// Check for vendor prefixed names
			var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			    i = cssPrefixes.length;

			while ( i-- ) {
				name = cssPrefixes[ i ] + capName;
				if ( name in emptyStyle ) {
					return name;
				}
			}
		}

// Return a property mapped along what jQuery.cssProps suggests or to
// a vendor prefixed property.
		function finalPropName( name ) {
			var ret = jQuery.cssProps[ name ];
			if ( !ret ) {
				ret = jQuery.cssProps[ name ] = vendorPropName( name ) || name;
			}
			return ret;
		}

		function setPositiveNumber( elem, value, subtract ) {

			// Any relative (+/-) values have already been
			// normalized at this point
			var matches = rcssNum.exec( value );
			return matches ?

				// Guard against undefined "subtract", e.g., when used as in cssHooks
				Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
				value;
		}

		function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
			var i,
			    val = 0;

			// If we already have the right measurement, avoid augmentation
			if ( extra === ( isBorderBox ? "border" : "content" ) ) {
				i = 4;

				// Otherwise initialize for horizontal or vertical properties
			} else {
				i = name === "width" ? 1 : 0;
			}

			for ( ; i < 4; i += 2 ) {

				// Both box models exclude margin, so add it if we want it
				if ( extra === "margin" ) {
					val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
				}

				if ( isBorderBox ) {

					// border-box includes padding, so remove it if we want content
					if ( extra === "content" ) {
						val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
					}

					// At this point, extra isn't border nor margin, so remove border
					if ( extra !== "margin" ) {
						val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
					}
				} else {

					// At this point, extra isn't content, so add padding
					val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

					// At this point, extra isn't content nor padding, so add border
					if ( extra !== "padding" ) {
						val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
					}
				}
			}

			return val;
		}

		function getWidthOrHeight( elem, name, extra ) {

			// Start with computed style
			var valueIsBorderBox,
			    styles = getStyles( elem ),
			    val = curCSS( elem, name, styles ),
			    isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );

			// Fall back to offsetWidth/Height when value is "auto"
			// This happens for inline elements with no explicit setting (gh-3571)
			if ( val === "auto" ) {
				val = elem[ "offset" + name[ 0 ].toUpperCase() + name.slice( 1 ) ];
			}

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;

			// Use the active box-sizing model to add/subtract irrelevant styles
			return ( val +
					augmentWidthOrHeight(
						elem,
						name,
						extra || ( isBorderBox ? "border" : "content" ),
						valueIsBorderBox,
						styles
					)
				) + "px";
		}

		jQuery.extend( {

			// Add in style property hooks for overriding the default
			// behavior of getting and setting a style property
			cssHooks: {
				opacity: {
					get: function( elem, computed ) {
						if ( computed ) {

							// We should always get a number back from opacity
							var ret = curCSS( elem, "opacity" );
							return ret === "" ? "1" : ret;
						}
					}
				}
			},

			// Don't automatically add "px" to these possibly-unitless properties
			cssNumber: {
				"animationIterationCount": true,
				"columnCount": true,
				"fillOpacity": true,
				"flexGrow": true,
				"flexShrink": true,
				"fontWeight": true,
				"lineHeight": true,
				"opacity": true,
				"order": true,
				"orphans": true,
				"widows": true,
				"zIndex": true,
				"zoom": true
			},

			// Add in properties whose names you wish to fix before
			// setting or getting the value
			cssProps: {
				"float": "cssFloat"
			},

			// Get and set the style property on a DOM Node
			style: function( elem, name, value, extra ) {

				// Don't set styles on text and comment nodes
				if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
					return;
				}

				// Make sure that we're working with the right name
				var ret, type, hooks,
				    origName = jQuery.camelCase( name ),
				    isCustomProp = rcustomProp.test( name ),
				    style = elem.style;

				// Make sure that we're working with the right name. We don't
				// want to query the value if it is a CSS custom property
				// since they are user-defined.
				if ( !isCustomProp ) {
					name = finalPropName( origName );
				}

				// Gets hook for the prefixed version, then unprefixed version
				hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

				// Check if we're setting a value
				if ( value !== undefined ) {
					type = typeof value;

					// Convert "+=" or "-=" to relative numbers (#7345)
					if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
						value = adjustCSS( elem, name, ret );

						// Fixes bug #9237
						type = "number";
					}

					// Make sure that null and NaN values aren't set (#7116)
					if ( value == null || value !== value ) {
						return;
					}

					// If a number was passed in, add the unit (except for certain CSS properties)
					if ( type === "number" ) {
						value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
					}

					// background-* props affect original clone's values
					if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
						style[ name ] = "inherit";
					}

					// If a hook was provided, use that value, otherwise just set the specified value
					if ( !hooks || !( "set" in hooks ) ||
						( value = hooks.set( elem, value, extra ) ) !== undefined ) {

						if ( isCustomProp ) {
							style.setProperty( name, value );
						} else {
							style[ name ] = value;
						}
					}

				} else {

					// If a hook was provided get the non-computed value from there
					if ( hooks && "get" in hooks &&
						( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

						return ret;
					}

					// Otherwise just get the value from the style object
					return style[ name ];
				}
			},

			css: function( elem, name, extra, styles ) {
				var val, num, hooks,
				    origName = jQuery.camelCase( name ),
				    isCustomProp = rcustomProp.test( name );

				// Make sure that we're working with the right name. We don't
				// want to modify the value if it is a CSS custom property
				// since they are user-defined.
				if ( !isCustomProp ) {
					name = finalPropName( origName );
				}

				// Try prefixed name followed by the unprefixed name
				hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

				// If a hook was provided get the computed value from there
				if ( hooks && "get" in hooks ) {
					val = hooks.get( elem, true, extra );
				}

				// Otherwise, if a way to get the computed value exists, use that
				if ( val === undefined ) {
					val = curCSS( elem, name, styles );
				}

				// Convert "normal" to computed value
				if ( val === "normal" && name in cssNormalTransform ) {
					val = cssNormalTransform[ name ];
				}

				// Make numeric if forced or a qualifier was provided and val looks numeric
				if ( extra === "" || extra ) {
					num = parseFloat( val );
					return extra === true || isFinite( num ) ? num || 0 : val;
				}

				return val;
			}
		} );

		jQuery.each( [ "height", "width" ], function( i, name ) {
			jQuery.cssHooks[ name ] = {
				get: function( elem, computed, extra ) {
					if ( computed ) {

						// Certain elements can have dimension info if we invisibly show them
						// but it must have a current display style that would benefit
						return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

						// Support: Safari 8+
						// Table columns in Safari have non-zero offsetWidth & zero
						// getBoundingClientRect().width unless display is changed.
						// Support: IE <=11 only
						// Running getBoundingClientRect on a disconnected node
						// in IE throws an error.
						( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
					}
				},

				set: function( elem, value, extra ) {
					var matches,
					    styles = extra && getStyles( elem ),
					    subtract = extra && augmentWidthOrHeight(
							    elem,
							    name,
							    extra,
							    jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
							    styles
						    );

					// Convert to pixels if value adjustment is needed
					if ( subtract && ( matches = rcssNum.exec( value ) ) &&
						( matches[ 3 ] || "px" ) !== "px" ) {

						elem.style[ name ] = value;
						value = jQuery.css( elem, name );
					}

					return setPositiveNumber( elem, value, subtract );
				}
			};
		} );

		jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
			function( elem, computed ) {
				if ( computed ) {
					return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
							elem.getBoundingClientRect().left -
							swap( elem, { marginLeft: 0 }, function() {
								return elem.getBoundingClientRect().left;
							} )
						) + "px";
				}
			}
		);

// These hooks are used by animate to expand properties
		jQuery.each( {
			margin: "",
			padding: "",
			border: "Width"
		}, function( prefix, suffix ) {
			jQuery.cssHooks[ prefix + suffix ] = {
				expand: function( value ) {
					var i = 0,
					    expanded = {},

					    // Assumes a single number if not a string
					    parts = typeof value === "string" ? value.split( " " ) : [ value ];

					for ( ; i < 4; i++ ) {
						expanded[ prefix + cssExpand[ i ] + suffix ] =
							parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
					}

					return expanded;
				}
			};

			if ( !rmargin.test( prefix ) ) {
				jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
			}
		} );

		jQuery.fn.extend( {
			css: function( name, value ) {
				return access( this, function( elem, name, value ) {
					var styles, len,
					    map = {},
					    i = 0;

					if ( Array.isArray( name ) ) {
						styles = getStyles( elem );
						len = name.length;

						for ( ; i < len; i++ ) {
							map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
						}

						return map;
					}

					return value !== undefined ?
						jQuery.style( elem, name, value ) :
						jQuery.css( elem, name );
				}, name, value, arguments.length > 1 );
			}
		} );


		function Tween( elem, options, prop, end, easing ) {
			return new Tween.prototype.init( elem, options, prop, end, easing );
		}
		jQuery.Tween = Tween;

		Tween.prototype = {
			constructor: Tween,
			init: function( elem, options, prop, end, easing, unit ) {
				this.elem = elem;
				this.prop = prop;
				this.easing = easing || jQuery.easing._default;
				this.options = options;
				this.start = this.now = this.cur();
				this.end = end;
				this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
			},
			cur: function() {
				var hooks = Tween.propHooks[ this.prop ];

				return hooks && hooks.get ?
					hooks.get( this ) :
					Tween.propHooks._default.get( this );
			},
			run: function( percent ) {
				var eased,
				    hooks = Tween.propHooks[ this.prop ];

				if ( this.options.duration ) {
					this.pos = eased = jQuery.easing[ this.easing ](
						percent, this.options.duration * percent, 0, 1, this.options.duration
					);
				} else {
					this.pos = eased = percent;
				}
				this.now = ( this.end - this.start ) * eased + this.start;

				if ( this.options.step ) {
					this.options.step.call( this.elem, this.now, this );
				}

				if ( hooks && hooks.set ) {
					hooks.set( this );
				} else {
					Tween.propHooks._default.set( this );
				}
				return this;
			}
		};

		Tween.prototype.init.prototype = Tween.prototype;

		Tween.propHooks = {
			_default: {
				get: function( tween ) {
					var result;

					// Use a property on the element directly when it is not a DOM element,
					// or when there is no matching style property that exists.
					if ( tween.elem.nodeType !== 1 ||
						tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
						return tween.elem[ tween.prop ];
					}

					// Passing an empty string as a 3rd parameter to .css will automatically
					// attempt a parseFloat and fallback to a string if the parse fails.
					// Simple values such as "10px" are parsed to Float;
					// complex values such as "rotate(1rad)" are returned as-is.
					result = jQuery.css( tween.elem, tween.prop, "" );

					// Empty strings, null, undefined and "auto" are converted to 0.
					return !result || result === "auto" ? 0 : result;
				},
				set: function( tween ) {

					// Use step hook for back compat.
					// Use cssHook if its there.
					// Use .style if available and use plain properties where available.
					if ( jQuery.fx.step[ tween.prop ] ) {
						jQuery.fx.step[ tween.prop ]( tween );
					} else if ( tween.elem.nodeType === 1 &&
						( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
						jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
					} else {
						tween.elem[ tween.prop ] = tween.now;
					}
				}
			}
		};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
		Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
			set: function( tween ) {
				if ( tween.elem.nodeType && tween.elem.parentNode ) {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		};

		jQuery.easing = {
			linear: function( p ) {
				return p;
			},
			swing: function( p ) {
				return 0.5 - Math.cos( p * Math.PI ) / 2;
			},
			_default: "swing"
		};

		jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
		jQuery.fx.step = {};




		var
			fxNow, inProgress,
			rfxtypes = /^(?:toggle|show|hide)$/,
			rrun = /queueHooks$/;

		function schedule() {
			if ( inProgress ) {
				if ( document.hidden === false && window.requestAnimationFrame ) {
					window.requestAnimationFrame( schedule );
				} else {
					window.setTimeout( schedule, jQuery.fx.interval );
				}

				jQuery.fx.tick();
			}
		}

// Animations created synchronously will run synchronously
		function createFxNow() {
			window.setTimeout( function() {
				fxNow = undefined;
			} );
			return ( fxNow = jQuery.now() );
		}

// Generate parameters to create a standard animation
		function genFx( type, includeWidth ) {
			var which,
			    i = 0,
			    attrs = { height: type };

			// If we include width, step value is 1 to do all cssExpand values,
			// otherwise step value is 2 to skip over Left and Right
			includeWidth = includeWidth ? 1 : 0;
			for ( ; i < 4; i += 2 - includeWidth ) {
				which = cssExpand[ i ];
				attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
			}

			if ( includeWidth ) {
				attrs.opacity = attrs.width = type;
			}

			return attrs;
		}

		function createTween( value, prop, animation ) {
			var tween,
			    collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			    index = 0,
			    length = collection.length;
			for ( ; index < length; index++ ) {
				if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

					// We're done with this property
					return tween;
				}
			}
		}

		function defaultPrefilter( elem, props, opts ) {
			var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
			    isBox = "width" in props || "height" in props,
			    anim = this,
			    orig = {},
			    style = elem.style,
			    hidden = elem.nodeType && isHiddenWithinTree( elem ),
			    dataShow = dataPriv.get( elem, "fxshow" );

			// Queue-skipping animations hijack the fx hooks
			if ( !opts.queue ) {
				hooks = jQuery._queueHooks( elem, "fx" );
				if ( hooks.unqueued == null ) {
					hooks.unqueued = 0;
					oldfire = hooks.empty.fire;
					hooks.empty.fire = function() {
						if ( !hooks.unqueued ) {
							oldfire();
						}
					};
				}
				hooks.unqueued++;

				anim.always( function() {

					// Ensure the complete handler is called before this completes
					anim.always( function() {
						hooks.unqueued--;
						if ( !jQuery.queue( elem, "fx" ).length ) {
							hooks.empty.fire();
						}
					} );
				} );
			}

			// Detect show/hide animations
			for ( prop in props ) {
				value = props[ prop ];
				if ( rfxtypes.test( value ) ) {
					delete props[ prop ];
					toggle = toggle || value === "toggle";
					if ( value === ( hidden ? "hide" : "show" ) ) {

						// Pretend to be hidden if this is a "show" and
						// there is still data from a stopped show/hide
						if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
							hidden = true;

							// Ignore all other no-op show/hide data
						} else {
							continue;
						}
					}
					orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
				}
			}

			// Bail out if this is a no-op like .hide().hide()
			propTween = !jQuery.isEmptyObject( props );
			if ( !propTween && jQuery.isEmptyObject( orig ) ) {
				return;
			}

			// Restrict "overflow" and "display" styles during box animations
			if ( isBox && elem.nodeType === 1 ) {

				// Support: IE <=9 - 11, Edge 12 - 13
				// Record all 3 overflow attributes because IE does not infer the shorthand
				// from identically-valued overflowX and overflowY
				opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

				// Identify a display type, preferring old show/hide data over the CSS cascade
				restoreDisplay = dataShow && dataShow.display;
				if ( restoreDisplay == null ) {
					restoreDisplay = dataPriv.get( elem, "display" );
				}
				display = jQuery.css( elem, "display" );
				if ( display === "none" ) {
					if ( restoreDisplay ) {
						display = restoreDisplay;
					} else {

						// Get nonempty value(s) by temporarily forcing visibility
						showHide( [ elem ], true );
						restoreDisplay = elem.style.display || restoreDisplay;
						display = jQuery.css( elem, "display" );
						showHide( [ elem ] );
					}
				}

				// Animate inline elements as inline-block
				if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
					if ( jQuery.css( elem, "float" ) === "none" ) {

						// Restore the original display value at the end of pure show/hide animations
						if ( !propTween ) {
							anim.done( function() {
								style.display = restoreDisplay;
							} );
							if ( restoreDisplay == null ) {
								display = style.display;
								restoreDisplay = display === "none" ? "" : display;
							}
						}
						style.display = "inline-block";
					}
				}
			}

			if ( opts.overflow ) {
				style.overflow = "hidden";
				anim.always( function() {
					style.overflow = opts.overflow[ 0 ];
					style.overflowX = opts.overflow[ 1 ];
					style.overflowY = opts.overflow[ 2 ];
				} );
			}

			// Implement show/hide animations
			propTween = false;
			for ( prop in orig ) {

				// General show/hide setup for this element animation
				if ( !propTween ) {
					if ( dataShow ) {
						if ( "hidden" in dataShow ) {
							hidden = dataShow.hidden;
						}
					} else {
						dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
					}

					// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
					if ( toggle ) {
						dataShow.hidden = !hidden;
					}

					// Show elements before animating them
					if ( hidden ) {
						showHide( [ elem ], true );
					}

					/* eslint-disable no-loop-func */

					anim.done( function() {

						/* eslint-enable no-loop-func */

						// The final step of a "hide" animation is actually hiding the element
						if ( !hidden ) {
							showHide( [ elem ] );
						}
						dataPriv.remove( elem, "fxshow" );
						for ( prop in orig ) {
							jQuery.style( elem, prop, orig[ prop ] );
						}
					} );
				}

				// Per-property setup
				propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = propTween.start;
					if ( hidden ) {
						propTween.end = propTween.start;
						propTween.start = 0;
					}
				}
			}
		}

		function propFilter( props, specialEasing ) {
			var index, name, easing, value, hooks;

			// camelCase, specialEasing and expand cssHook pass
			for ( index in props ) {
				name = jQuery.camelCase( index );
				easing = specialEasing[ name ];
				value = props[ index ];
				if ( Array.isArray( value ) ) {
					easing = value[ 1 ];
					value = props[ index ] = value[ 0 ];
				}

				if ( index !== name ) {
					props[ name ] = value;
					delete props[ index ];
				}

				hooks = jQuery.cssHooks[ name ];
				if ( hooks && "expand" in hooks ) {
					value = hooks.expand( value );
					delete props[ name ];

					// Not quite $.extend, this won't overwrite existing keys.
					// Reusing 'index' because we have the correct "name"
					for ( index in value ) {
						if ( !( index in props ) ) {
							props[ index ] = value[ index ];
							specialEasing[ index ] = easing;
						}
					}
				} else {
					specialEasing[ name ] = easing;
				}
			}
		}

		function Animation( elem, properties, options ) {
			var result,
			    stopped,
			    index = 0,
			    length = Animation.prefilters.length,
			    deferred = jQuery.Deferred().always( function() {

				    // Don't match elem in the :animated selector
				    delete tick.elem;
			    } ),
			    tick = function() {
				    if ( stopped ) {
					    return false;
				    }
				    var currentTime = fxNow || createFxNow(),
				        remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				        // Support: Android 2.3 only
				        // Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				        temp = remaining / animation.duration || 0,
				        percent = 1 - temp,
				        index = 0,
				        length = animation.tweens.length;

				    for ( ; index < length; index++ ) {
					    animation.tweens[ index ].run( percent );
				    }

				    deferred.notifyWith( elem, [ animation, percent, remaining ] );

				    // If there's more to do, yield
				    if ( percent < 1 && length ) {
					    return remaining;
				    }

				    // If this was an empty animation, synthesize a final progress notification
				    if ( !length ) {
					    deferred.notifyWith( elem, [ animation, 1, 0 ] );
				    }

				    // Resolve the animation and report its conclusion
				    deferred.resolveWith( elem, [ animation ] );
				    return false;
			    },
			    animation = deferred.promise( {
				    elem: elem,
				    props: jQuery.extend( {}, properties ),
				    opts: jQuery.extend( true, {
					    specialEasing: {},
					    easing: jQuery.easing._default
				    }, options ),
				    originalProperties: properties,
				    originalOptions: options,
				    startTime: fxNow || createFxNow(),
				    duration: options.duration,
				    tweens: [],
				    createTween: function( prop, end ) {
					    var tween = jQuery.Tween( elem, animation.opts, prop, end,
						    animation.opts.specialEasing[ prop ] || animation.opts.easing );
					    animation.tweens.push( tween );
					    return tween;
				    },
				    stop: function( gotoEnd ) {
					    var index = 0,

					        // If we are going to the end, we want to run all the tweens
					        // otherwise we skip this part
					        length = gotoEnd ? animation.tweens.length : 0;
					    if ( stopped ) {
						    return this;
					    }
					    stopped = true;
					    for ( ; index < length; index++ ) {
						    animation.tweens[ index ].run( 1 );
					    }

					    // Resolve when we played the last frame; otherwise, reject
					    if ( gotoEnd ) {
						    deferred.notifyWith( elem, [ animation, 1, 0 ] );
						    deferred.resolveWith( elem, [ animation, gotoEnd ] );
					    } else {
						    deferred.rejectWith( elem, [ animation, gotoEnd ] );
					    }
					    return this;
				    }
			    } ),
			    props = animation.props;

			propFilter( props, animation.opts.specialEasing );

			for ( ; index < length; index++ ) {
				result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
				if ( result ) {
					if ( jQuery.isFunction( result.stop ) ) {
						jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
							jQuery.proxy( result.stop, result );
					}
					return result;
				}
			}

			jQuery.map( props, createTween, animation );

			if ( jQuery.isFunction( animation.opts.start ) ) {
				animation.opts.start.call( elem, animation );
			}

			// Attach callbacks from options
			animation
				.progress( animation.opts.progress )
				.done( animation.opts.done, animation.opts.complete )
				.fail( animation.opts.fail )
				.always( animation.opts.always );

			jQuery.fx.timer(
				jQuery.extend( tick, {
					elem: elem,
					anim: animation,
					queue: animation.opts.queue
				} )
			);

			return animation;
		}

		jQuery.Animation = jQuery.extend( Animation, {

			tweeners: {
				"*": [ function( prop, value ) {
					var tween = this.createTween( prop, value );
					adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
					return tween;
				} ]
			},

			tweener: function( props, callback ) {
				if ( jQuery.isFunction( props ) ) {
					callback = props;
					props = [ "*" ];
				} else {
					props = props.match( rnothtmlwhite );
				}

				var prop,
				    index = 0,
				    length = props.length;

				for ( ; index < length; index++ ) {
					prop = props[ index ];
					Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
					Animation.tweeners[ prop ].unshift( callback );
				}
			},

			prefilters: [ defaultPrefilter ],

			prefilter: function( callback, prepend ) {
				if ( prepend ) {
					Animation.prefilters.unshift( callback );
				} else {
					Animation.prefilters.push( callback );
				}
			}
		} );

		jQuery.speed = function( speed, easing, fn ) {
			var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
				complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
				duration: speed,
				easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
			};

			// Go to the end state if fx are off
			if ( jQuery.fx.off ) {
				opt.duration = 0;

			} else {
				if ( typeof opt.duration !== "number" ) {
					if ( opt.duration in jQuery.fx.speeds ) {
						opt.duration = jQuery.fx.speeds[ opt.duration ];

					} else {
						opt.duration = jQuery.fx.speeds._default;
					}
				}
			}

			// Normalize opt.queue - true/undefined/null -> "fx"
			if ( opt.queue == null || opt.queue === true ) {
				opt.queue = "fx";
			}

			// Queueing
			opt.old = opt.complete;

			opt.complete = function() {
				if ( jQuery.isFunction( opt.old ) ) {
					opt.old.call( this );
				}

				if ( opt.queue ) {
					jQuery.dequeue( this, opt.queue );
				}
			};

			return opt;
		};

		jQuery.fn.extend( {
			fadeTo: function( speed, to, easing, callback ) {

				// Show any hidden elements after setting opacity to 0
				return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

				// Animate to the value specified
					.end().animate( { opacity: to }, speed, easing, callback );
			},
			animate: function( prop, speed, easing, callback ) {
				var empty = jQuery.isEmptyObject( prop ),
				    optall = jQuery.speed( speed, easing, callback ),
				    doAnimation = function() {

					    // Operate on a copy of prop so per-property easing won't be lost
					    var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					    // Empty animations, or finishing resolves immediately
					    if ( empty || dataPriv.get( this, "finish" ) ) {
						    anim.stop( true );
					    }
				    };
				doAnimation.finish = doAnimation;

				return empty || optall.queue === false ?
					this.each( doAnimation ) :
					this.queue( optall.queue, doAnimation );
			},
			stop: function( type, clearQueue, gotoEnd ) {
				var stopQueue = function( hooks ) {
					var stop = hooks.stop;
					delete hooks.stop;
					stop( gotoEnd );
				};

				if ( typeof type !== "string" ) {
					gotoEnd = clearQueue;
					clearQueue = type;
					type = undefined;
				}
				if ( clearQueue && type !== false ) {
					this.queue( type || "fx", [] );
				}

				return this.each( function() {
					var dequeue = true,
					    index = type != null && type + "queueHooks",
					    timers = jQuery.timers,
					    data = dataPriv.get( this );

					if ( index ) {
						if ( data[ index ] && data[ index ].stop ) {
							stopQueue( data[ index ] );
						}
					} else {
						for ( index in data ) {
							if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
								stopQueue( data[ index ] );
							}
						}
					}

					for ( index = timers.length; index--; ) {
						if ( timers[ index ].elem === this &&
							( type == null || timers[ index ].queue === type ) ) {

							timers[ index ].anim.stop( gotoEnd );
							dequeue = false;
							timers.splice( index, 1 );
						}
					}

					// Start the next in the queue if the last step wasn't forced.
					// Timers currently will call their complete callbacks, which
					// will dequeue but only if they were gotoEnd.
					if ( dequeue || !gotoEnd ) {
						jQuery.dequeue( this, type );
					}
				} );
			},
			finish: function( type ) {
				if ( type !== false ) {
					type = type || "fx";
				}
				return this.each( function() {
					var index,
					    data = dataPriv.get( this ),
					    queue = data[ type + "queue" ],
					    hooks = data[ type + "queueHooks" ],
					    timers = jQuery.timers,
					    length = queue ? queue.length : 0;

					// Enable finishing flag on private data
					data.finish = true;

					// Empty the queue first
					jQuery.queue( this, type, [] );

					if ( hooks && hooks.stop ) {
						hooks.stop.call( this, true );
					}

					// Look for any active animations, and finish them
					for ( index = timers.length; index--; ) {
						if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
							timers[ index ].anim.stop( true );
							timers.splice( index, 1 );
						}
					}

					// Look for any animations in the old queue and finish them
					for ( index = 0; index < length; index++ ) {
						if ( queue[ index ] && queue[ index ].finish ) {
							queue[ index ].finish.call( this );
						}
					}

					// Turn off finishing flag
					delete data.finish;
				} );
			}
		} );

		jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
			var cssFn = jQuery.fn[ name ];
			jQuery.fn[ name ] = function( speed, easing, callback ) {
				return speed == null || typeof speed === "boolean" ?
					cssFn.apply( this, arguments ) :
					this.animate( genFx( name, true ), speed, easing, callback );
			};
		} );

// Generate shortcuts for custom animations
		jQuery.each( {
			slideDown: genFx( "show" ),
			slideUp: genFx( "hide" ),
			slideToggle: genFx( "toggle" ),
			fadeIn: { opacity: "show" },
			fadeOut: { opacity: "hide" },
			fadeToggle: { opacity: "toggle" }
		}, function( name, props ) {
			jQuery.fn[ name ] = function( speed, easing, callback ) {
				return this.animate( props, speed, easing, callback );
			};
		} );

		jQuery.timers = [];
		jQuery.fx.tick = function() {
			var timer,
			    i = 0,
			    timers = jQuery.timers;

			fxNow = jQuery.now();

			for ( ; i < timers.length; i++ ) {
				timer = timers[ i ];

				// Run the timer and safely remove it when done (allowing for external removal)
				if ( !timer() && timers[ i ] === timer ) {
					timers.splice( i--, 1 );
				}
			}

			if ( !timers.length ) {
				jQuery.fx.stop();
			}
			fxNow = undefined;
		};

		jQuery.fx.timer = function( timer ) {
			jQuery.timers.push( timer );
			jQuery.fx.start();
		};

		jQuery.fx.interval = 13;
		jQuery.fx.start = function() {
			if ( inProgress ) {
				return;
			}

			inProgress = true;
			schedule();
		};

		jQuery.fx.stop = function() {
			inProgress = null;
		};

		jQuery.fx.speeds = {
			slow: 600,
			fast: 200,

			// Default speed
			_default: 400
		};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
		jQuery.fn.delay = function( time, type ) {
			time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
			type = type || "fx";

			return this.queue( type, function( next, hooks ) {
				var timeout = window.setTimeout( next, time );
				hooks.stop = function() {
					window.clearTimeout( timeout );
				};
			} );
		};


		( function() {
			var input = document.createElement( "input" ),
			    select = document.createElement( "select" ),
			    opt = select.appendChild( document.createElement( "option" ) );

			input.type = "checkbox";

			// Support: Android <=4.3 only
			// Default value for a checkbox should be "on"
			support.checkOn = input.value !== "";

			// Support: IE <=11 only
			// Must access selectedIndex to make default options select
			support.optSelected = opt.selected;

			// Support: IE <=11 only
			// An input loses its value after becoming a radio
			input = document.createElement( "input" );
			input.value = "t";
			input.type = "radio";
			support.radioValue = input.value === "t";
		} )();


		var boolHook,
		    attrHandle = jQuery.expr.attrHandle;

		jQuery.fn.extend( {
			attr: function( name, value ) {
				return access( this, jQuery.attr, name, value, arguments.length > 1 );
			},

			removeAttr: function( name ) {
				return this.each( function() {
					jQuery.removeAttr( this, name );
				} );
			}
		} );

		jQuery.extend( {
			attr: function( elem, name, value ) {
				var ret, hooks,
				    nType = elem.nodeType;

				// Don't get/set attributes on text, comment and attribute nodes
				if ( nType === 3 || nType === 8 || nType === 2 ) {
					return;
				}

				// Fallback to prop when attributes are not supported
				if ( typeof elem.getAttribute === "undefined" ) {
					return jQuery.prop( elem, name, value );
				}

				// Attribute hooks are determined by the lowercase version
				// Grab necessary hook if one is defined
				if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
					hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
						( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
				}

				if ( value !== undefined ) {
					if ( value === null ) {
						jQuery.removeAttr( elem, name );
						return;
					}

					if ( hooks && "set" in hooks &&
						( ret = hooks.set( elem, value, name ) ) !== undefined ) {
						return ret;
					}

					elem.setAttribute( name, value + "" );
					return value;
				}

				if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
					return ret;
				}

				ret = jQuery.find.attr( elem, name );

				// Non-existent attributes return null, we normalize to undefined
				return ret == null ? undefined : ret;
			},

			attrHooks: {
				type: {
					set: function( elem, value ) {
						if ( !support.radioValue && value === "radio" &&
							nodeName( elem, "input" ) ) {
							var val = elem.value;
							elem.setAttribute( "type", value );
							if ( val ) {
								elem.value = val;
							}
							return value;
						}
					}
				}
			},

			removeAttr: function( elem, value ) {
				var name,
				    i = 0,

				    // Attribute names can contain non-HTML whitespace characters
				    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
				    attrNames = value && value.match( rnothtmlwhite );

				if ( attrNames && elem.nodeType === 1 ) {
					while ( ( name = attrNames[ i++ ] ) ) {
						elem.removeAttribute( name );
					}
				}
			}
		} );

// Hooks for boolean attributes
		boolHook = {
			set: function( elem, value, name ) {
				if ( value === false ) {

					// Remove boolean attributes when set to false
					jQuery.removeAttr( elem, name );
				} else {
					elem.setAttribute( name, name );
				}
				return name;
			}
		};

		jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
			var getter = attrHandle[ name ] || jQuery.find.attr;

			attrHandle[ name ] = function( elem, name, isXML ) {
				var ret, handle,
				    lowercaseName = name.toLowerCase();

				if ( !isXML ) {

					// Avoid an infinite loop by temporarily removing this function from the getter
					handle = attrHandle[ lowercaseName ];
					attrHandle[ lowercaseName ] = ret;
					ret = getter( elem, name, isXML ) != null ?
						lowercaseName :
						null;
					attrHandle[ lowercaseName ] = handle;
				}
				return ret;
			};
		} );




		var rfocusable = /^(?:input|select|textarea|button)$/i,
		    rclickable = /^(?:a|area)$/i;

		jQuery.fn.extend( {
			prop: function( name, value ) {
				return access( this, jQuery.prop, name, value, arguments.length > 1 );
			},

			removeProp: function( name ) {
				return this.each( function() {
					delete this[ jQuery.propFix[ name ] || name ];
				} );
			}
		} );

		jQuery.extend( {
			prop: function( elem, name, value ) {
				var ret, hooks,
				    nType = elem.nodeType;

				// Don't get/set properties on text, comment and attribute nodes
				if ( nType === 3 || nType === 8 || nType === 2 ) {
					return;
				}

				if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

					// Fix name and attach hooks
					name = jQuery.propFix[ name ] || name;
					hooks = jQuery.propHooks[ name ];
				}

				if ( value !== undefined ) {
					if ( hooks && "set" in hooks &&
						( ret = hooks.set( elem, value, name ) ) !== undefined ) {
						return ret;
					}

					return ( elem[ name ] = value );
				}

				if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
					return ret;
				}

				return elem[ name ];
			},

			propHooks: {
				tabIndex: {
					get: function( elem ) {

						// Support: IE <=9 - 11 only
						// elem.tabIndex doesn't always return the
						// correct value when it hasn't been explicitly set
						// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
						// Use proper attribute retrieval(#12072)
						var tabindex = jQuery.find.attr( elem, "tabindex" );

						if ( tabindex ) {
							return parseInt( tabindex, 10 );
						}

						if (
							rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) &&
							elem.href
						) {
							return 0;
						}

						return -1;
					}
				}
			},

			propFix: {
				"for": "htmlFor",
				"class": "className"
			}
		} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
		if ( !support.optSelected ) {
			jQuery.propHooks.selected = {
				get: function( elem ) {

					/* eslint no-unused-expressions: "off" */

					var parent = elem.parentNode;
					if ( parent && parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
					return null;
				},
				set: function( elem ) {

					/* eslint no-unused-expressions: "off" */

					var parent = elem.parentNode;
					if ( parent ) {
						parent.selectedIndex;

						if ( parent.parentNode ) {
							parent.parentNode.selectedIndex;
						}
					}
				}
			};
		}

		jQuery.each( [
			"tabIndex",
			"readOnly",
			"maxLength",
			"cellSpacing",
			"cellPadding",
			"rowSpan",
			"colSpan",
			"useMap",
			"frameBorder",
			"contentEditable"
		], function() {
			jQuery.propFix[ this.toLowerCase() ] = this;
		} );




		// Strip and collapse whitespace according to HTML spec
		// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
		function stripAndCollapse( value ) {
			var tokens = value.match( rnothtmlwhite ) || [];
			return tokens.join( " " );
		}


		function getClass( elem ) {
			return elem.getAttribute && elem.getAttribute( "class" ) || "";
		}

		jQuery.fn.extend( {
			addClass: function( value ) {
				var classes, elem, cur, curValue, clazz, j, finalValue,
				    i = 0;

				if ( jQuery.isFunction( value ) ) {
					return this.each( function( j ) {
						jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
					} );
				}

				if ( typeof value === "string" && value ) {
					classes = value.match( rnothtmlwhite ) || [];

					while ( ( elem = this[ i++ ] ) ) {
						curValue = getClass( elem );
						cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

						if ( cur ) {
							j = 0;
							while ( ( clazz = classes[ j++ ] ) ) {
								if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
									cur += clazz + " ";
								}
							}

							// Only assign if different to avoid unneeded rendering.
							finalValue = stripAndCollapse( cur );
							if ( curValue !== finalValue ) {
								elem.setAttribute( "class", finalValue );
							}
						}
					}
				}

				return this;
			},

			removeClass: function( value ) {
				var classes, elem, cur, curValue, clazz, j, finalValue,
				    i = 0;

				if ( jQuery.isFunction( value ) ) {
					return this.each( function( j ) {
						jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
					} );
				}

				if ( !arguments.length ) {
					return this.attr( "class", "" );
				}

				if ( typeof value === "string" && value ) {
					classes = value.match( rnothtmlwhite ) || [];

					while ( ( elem = this[ i++ ] ) ) {
						curValue = getClass( elem );

						// This expression is here for better compressibility (see addClass)
						cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

						if ( cur ) {
							j = 0;
							while ( ( clazz = classes[ j++ ] ) ) {

								// Remove *all* instances
								while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
									cur = cur.replace( " " + clazz + " ", " " );
								}
							}

							// Only assign if different to avoid unneeded rendering.
							finalValue = stripAndCollapse( cur );
							if ( curValue !== finalValue ) {
								elem.setAttribute( "class", finalValue );
							}
						}
					}
				}

				return this;
			},

			toggleClass: function( value, stateVal ) {
				var type = typeof value;

				if ( typeof stateVal === "boolean" && type === "string" ) {
					return stateVal ? this.addClass( value ) : this.removeClass( value );
				}

				if ( jQuery.isFunction( value ) ) {
					return this.each( function( i ) {
						jQuery( this ).toggleClass(
							value.call( this, i, getClass( this ), stateVal ),
							stateVal
						);
					} );
				}

				return this.each( function() {
					var className, i, self, classNames;

					if ( type === "string" ) {

						// Toggle individual class names
						i = 0;
						self = jQuery( this );
						classNames = value.match( rnothtmlwhite ) || [];

						while ( ( className = classNames[ i++ ] ) ) {

							// Check each className given, space separated list
							if ( self.hasClass( className ) ) {
								self.removeClass( className );
							} else {
								self.addClass( className );
							}
						}

						// Toggle whole class name
					} else if ( value === undefined || type === "boolean" ) {
						className = getClass( this );
						if ( className ) {

							// Store className if set
							dataPriv.set( this, "__className__", className );
						}

						// If the element has a class name or if we're passed `false`,
						// then remove the whole classname (if there was one, the above saved it).
						// Otherwise bring back whatever was previously saved (if anything),
						// falling back to the empty string if nothing was stored.
						if ( this.setAttribute ) {
							this.setAttribute( "class",
								className || value === false ?
									"" :
									dataPriv.get( this, "__className__" ) || ""
							);
						}
					}
				} );
			},

			hasClass: function( selector ) {
				var className, elem,
				    i = 0;

				className = " " + selector + " ";
				while ( ( elem = this[ i++ ] ) ) {
					if ( elem.nodeType === 1 &&
						( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
						return true;
					}
				}

				return false;
			}
		} );




		var rreturn = /\r/g;

		jQuery.fn.extend( {
			val: function( value ) {
				var hooks, ret, isFunction,
				    elem = this[ 0 ];

				if ( !arguments.length ) {
					if ( elem ) {
						hooks = jQuery.valHooks[ elem.type ] ||
							jQuery.valHooks[ elem.nodeName.toLowerCase() ];

						if ( hooks &&
							"get" in hooks &&
							( ret = hooks.get( elem, "value" ) ) !== undefined
						) {
							return ret;
						}

						ret = elem.value;

						// Handle most common string cases
						if ( typeof ret === "string" ) {
							return ret.replace( rreturn, "" );
						}

						// Handle cases where value is null/undef or number
						return ret == null ? "" : ret;
					}

					return;
				}

				isFunction = jQuery.isFunction( value );

				return this.each( function( i ) {
					var val;

					if ( this.nodeType !== 1 ) {
						return;
					}

					if ( isFunction ) {
						val = value.call( this, i, jQuery( this ).val() );
					} else {
						val = value;
					}

					// Treat null/undefined as ""; convert numbers to string
					if ( val == null ) {
						val = "";

					} else if ( typeof val === "number" ) {
						val += "";

					} else if ( Array.isArray( val ) ) {
						val = jQuery.map( val, function( value ) {
							return value == null ? "" : value + "";
						} );
					}

					hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

					// If set returns undefined, fall back to normal setting
					if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
						this.value = val;
					}
				} );
			}
		} );

		jQuery.extend( {
			valHooks: {
				option: {
					get: function( elem ) {

						var val = jQuery.find.attr( elem, "value" );
						return val != null ?
							val :

							// Support: IE <=10 - 11 only
							// option.text throws exceptions (#14686, #14858)
							// Strip and collapse whitespace
							// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
							stripAndCollapse( jQuery.text( elem ) );
					}
				},
				select: {
					get: function( elem ) {
						var value, option, i,
						    options = elem.options,
						    index = elem.selectedIndex,
						    one = elem.type === "select-one",
						    values = one ? null : [],
						    max = one ? index + 1 : options.length;

						if ( index < 0 ) {
							i = max;

						} else {
							i = one ? index : 0;
						}

						// Loop through all the selected options
						for ( ; i < max; i++ ) {
							option = options[ i ];

							// Support: IE <=9 only
							// IE8-9 doesn't update selected after form reset (#2551)
							if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								!option.disabled &&
								( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

								// Get the specific value for the option
								value = jQuery( option ).val();

								// We don't need an array for one selects
								if ( one ) {
									return value;
								}

								// Multi-Selects return an array
								values.push( value );
							}
						}

						return values;
					},

					set: function( elem, value ) {
						var optionSet, option,
						    options = elem.options,
						    values = jQuery.makeArray( value ),
						    i = options.length;

						while ( i-- ) {
							option = options[ i ];

							/* eslint-disable no-cond-assign */

							if ( option.selected =
									jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
							) {
								optionSet = true;
							}

							/* eslint-enable no-cond-assign */
						}

						// Force browsers to behave consistently when non-matching value is set
						if ( !optionSet ) {
							elem.selectedIndex = -1;
						}
						return values;
					}
				}
			}
		} );

// Radios and checkboxes getter/setter
		jQuery.each( [ "radio", "checkbox" ], function() {
			jQuery.valHooks[ this ] = {
				set: function( elem, value ) {
					if ( Array.isArray( value ) ) {
						return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
					}
				}
			};
			if ( !support.checkOn ) {
				jQuery.valHooks[ this ].get = function( elem ) {
					return elem.getAttribute( "value" ) === null ? "on" : elem.value;
				};
			}
		} );




// Return jQuery for attributes-only inclusion


		var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

		jQuery.extend( jQuery.event, {

			trigger: function( event, data, elem, onlyHandlers ) {

				var i, cur, tmp, bubbleType, ontype, handle, special,
				    eventPath = [ elem || document ],
				    type = hasOwn.call( event, "type" ) ? event.type : event,
				    namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

				cur = tmp = elem = elem || document;

				// Don't do events on text and comment nodes
				if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
					return;
				}

				// focus/blur morphs to focusin/out; ensure we're not firing them right now
				if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
					return;
				}

				if ( type.indexOf( "." ) > -1 ) {

					// Namespaced trigger; create a regexp to match event type in handle()
					namespaces = type.split( "." );
					type = namespaces.shift();
					namespaces.sort();
				}
				ontype = type.indexOf( ":" ) < 0 && "on" + type;

				// Caller can pass in a jQuery.Event object, Object, or just an event type string
				event = event[ jQuery.expando ] ?
					event :
					new jQuery.Event( type, typeof event === "object" && event );

				// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
				event.isTrigger = onlyHandlers ? 2 : 3;
				event.namespace = namespaces.join( "." );
				event.rnamespace = event.namespace ?
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
					null;

				// Clean up the event in case it is being reused
				event.result = undefined;
				if ( !event.target ) {
					event.target = elem;
				}

				// Clone any incoming data and prepend the event, creating the handler arg list
				data = data == null ?
					[ event ] :
					jQuery.makeArray( data, [ event ] );

				// Allow special events to draw outside the lines
				special = jQuery.event.special[ type ] || {};
				if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
					return;
				}

				// Determine event propagation path in advance, per W3C events spec (#9951)
				// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
				if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

					bubbleType = special.delegateType || type;
					if ( !rfocusMorph.test( bubbleType + type ) ) {
						cur = cur.parentNode;
					}
					for ( ; cur; cur = cur.parentNode ) {
						eventPath.push( cur );
						tmp = cur;
					}

					// Only add window if we got to document (e.g., not plain obj or detached DOM)
					if ( tmp === ( elem.ownerDocument || document ) ) {
						eventPath.push( tmp.defaultView || tmp.parentWindow || window );
					}
				}

				// Fire handlers on the event path
				i = 0;
				while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

					event.type = i > 1 ?
						bubbleType :
						special.bindType || type;

					// jQuery handler
					handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
						dataPriv.get( cur, "handle" );
					if ( handle ) {
						handle.apply( cur, data );
					}

					// Native handler
					handle = ontype && cur[ ontype ];
					if ( handle && handle.apply && acceptData( cur ) ) {
						event.result = handle.apply( cur, data );
						if ( event.result === false ) {
							event.preventDefault();
						}
					}
				}
				event.type = type;

				// If nobody prevented the default action, do it now
				if ( !onlyHandlers && !event.isDefaultPrevented() ) {

					if ( ( !special._default ||
						special._default.apply( eventPath.pop(), data ) === false ) &&
						acceptData( elem ) ) {

						// Call a native DOM method on the target with the same name as the event.
						// Don't do default actions on window, that's where global variables be (#6170)
						if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

							// Don't re-trigger an onFOO event when we call its FOO() method
							tmp = elem[ ontype ];

							if ( tmp ) {
								elem[ ontype ] = null;
							}

							// Prevent re-triggering of the same event, since we already bubbled it above
							jQuery.event.triggered = type;
							elem[ type ]();
							jQuery.event.triggered = undefined;

							if ( tmp ) {
								elem[ ontype ] = tmp;
							}
						}
					}
				}

				return event.result;
			},

			// Piggyback on a donor event to simulate a different one
			// Used only for `focus(in | out)` events
			simulate: function( type, elem, event ) {
				var e = jQuery.extend(
					new jQuery.Event(),
					event,
					{
						type: type,
						isSimulated: true
					}
				);

				jQuery.event.trigger( e, null, elem );
			}

		} );

		jQuery.fn.extend( {

			trigger: function( type, data ) {
				return this.each( function() {
					jQuery.event.trigger( type, data, this );
				} );
			},
			triggerHandler: function( type, data ) {
				var elem = this[ 0 ];
				if ( elem ) {
					return jQuery.event.trigger( type, data, elem, true );
				}
			}
		} );


		jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
			"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
			"change select submit keydown keypress keyup contextmenu" ).split( " " ),
			function( i, name ) {

				// Handle event binding
				jQuery.fn[ name ] = function( data, fn ) {
					return arguments.length > 0 ?
						this.on( name, null, data, fn ) :
						this.trigger( name );
				};
			} );

		jQuery.fn.extend( {
			hover: function( fnOver, fnOut ) {
				return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
			}
		} );




		support.focusin = "onfocusin" in window;


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
		if ( !support.focusin ) {
			jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

				// Attach a single capturing handler on the document while someone wants focusin/focusout
				var handler = function( event ) {
					jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
				};

				jQuery.event.special[ fix ] = {
					setup: function() {
						var doc = this.ownerDocument || this,
						    attaches = dataPriv.access( doc, fix );

						if ( !attaches ) {
							doc.addEventListener( orig, handler, true );
						}
						dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
					},
					teardown: function() {
						var doc = this.ownerDocument || this,
						    attaches = dataPriv.access( doc, fix ) - 1;

						if ( !attaches ) {
							doc.removeEventListener( orig, handler, true );
							dataPriv.remove( doc, fix );

						} else {
							dataPriv.access( doc, fix, attaches );
						}
					}
				};
			} );
		}
		var location = window.location;

		var nonce = jQuery.now();

		var rquery = ( /\?/ );



// Cross-browser xml parsing
		jQuery.parseXML = function( data ) {
			var xml;
			if ( !data || typeof data !== "string" ) {
				return null;
			}

			// Support: IE 9 - 11 only
			// IE throws on parseFromString with invalid input.
			try {
				xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
			} catch ( e ) {
				xml = undefined;
			}

			if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
				jQuery.error( "Invalid XML: " + data );
			}
			return xml;
		};


		var
			rbracket = /\[\]$/,
			rCRLF = /\r?\n/g,
			rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
			rsubmittable = /^(?:input|select|textarea|keygen)/i;

		function buildParams( prefix, obj, traditional, add ) {
			var name;

			if ( Array.isArray( obj ) ) {

				// Serialize array item.
				jQuery.each( obj, function( i, v ) {
					if ( traditional || rbracket.test( prefix ) ) {

						// Treat each array item as a scalar.
						add( prefix, v );

					} else {

						// Item is non-scalar (array or object), encode its numeric index.
						buildParams(
							prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
							v,
							traditional,
							add
						);
					}
				} );

			} else if ( !traditional && jQuery.type( obj ) === "object" ) {

				// Serialize object item.
				for ( name in obj ) {
					buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
				}

			} else {

				// Serialize scalar item.
				add( prefix, obj );
			}
		}

// Serialize an array of form elements or a set of
// key/values into a query string
		jQuery.param = function( a, traditional ) {
			var prefix,
			    s = [],
			    add = function( key, valueOrFunction ) {

				    // If value is a function, invoke it and use its return value
				    var value = jQuery.isFunction( valueOrFunction ) ?
					    valueOrFunction() :
					    valueOrFunction;

				    s[ s.length ] = encodeURIComponent( key ) + "=" +
					    encodeURIComponent( value == null ? "" : value );
			    };

			// If an array was passed in, assume that it is an array of form elements.
			if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

				// Serialize the form elements
				jQuery.each( a, function() {
					add( this.name, this.value );
				} );

			} else {

				// If traditional, encode the "old" way (the way 1.3.2 or older
				// did it), otherwise encode params recursively.
				for ( prefix in a ) {
					buildParams( prefix, a[ prefix ], traditional, add );
				}
			}

			// Return the resulting serialization
			return s.join( "&" );
		};

		jQuery.fn.extend( {
			serialize: function() {
				return jQuery.param( this.serializeArray() );
			},
			serializeArray: function() {
				return this.map( function() {

					// Can add propHook for "elements" to filter or add form elements
					var elements = jQuery.prop( this, "elements" );
					return elements ? jQuery.makeArray( elements ) : this;
				} )
					.filter( function() {
						var type = this.type;

						// Use .is( ":disabled" ) so that fieldset[disabled] works
						return this.name && !jQuery( this ).is( ":disabled" ) &&
							rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
							( this.checked || !rcheckableType.test( type ) );
					} )
					.map( function( i, elem ) {
						var val = jQuery( this ).val();

						if ( val == null ) {
							return null;
						}

						if ( Array.isArray( val ) ) {
							return jQuery.map( val, function( val ) {
								return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
							} );
						}

						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ).get();
			}
		} );


		var
			r20 = /%20/g,
			rhash = /#.*$/,
			rantiCache = /([?&])_=[^&]*/,
			rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

			// #7653, #8125, #8152: local protocol detection
			rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
			rnoContent = /^(?:GET|HEAD)$/,
			rprotocol = /^\/\//,

			/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
			prefilters = {},

			/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
			transports = {},

			// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
			allTypes = "*/".concat( "*" ),

			// Anchor tag for parsing the document origin
			originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
		function addToPrefiltersOrTransports( structure ) {

			// dataTypeExpression is optional and defaults to "*"
			return function( dataTypeExpression, func ) {

				if ( typeof dataTypeExpression !== "string" ) {
					func = dataTypeExpression;
					dataTypeExpression = "*";
				}

				var dataType,
				    i = 0,
				    dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

				if ( jQuery.isFunction( func ) ) {

					// For each dataType in the dataTypeExpression
					while ( ( dataType = dataTypes[ i++ ] ) ) {

						// Prepend if requested
						if ( dataType[ 0 ] === "+" ) {
							dataType = dataType.slice( 1 ) || "*";
							( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

							// Otherwise append
						} else {
							( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
						}
					}
				}
			};
		}

// Base inspection function for prefilters and transports
		function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

			var inspected = {},
			    seekingTransport = ( structure === transports );

			function inspect( dataType ) {
				var selected;
				inspected[ dataType ] = true;
				jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
					var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
					if ( typeof dataTypeOrTransport === "string" &&
						!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

						options.dataTypes.unshift( dataTypeOrTransport );
						inspect( dataTypeOrTransport );
						return false;
					} else if ( seekingTransport ) {
						return !( selected = dataTypeOrTransport );
					}
				} );
				return selected;
			}

			return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
		}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
		function ajaxExtend( target, src ) {
			var key, deep,
			    flatOptions = jQuery.ajaxSettings.flatOptions || {};

			for ( key in src ) {
				if ( src[ key ] !== undefined ) {
					( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
				}
			}
			if ( deep ) {
				jQuery.extend( true, target, deep );
			}

			return target;
		}

		/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
		function ajaxHandleResponses( s, jqXHR, responses ) {

			var ct, type, finalDataType, firstDataType,
			    contents = s.contents,
			    dataTypes = s.dataTypes;

			// Remove auto dataType and get content-type in the process
			while ( dataTypes[ 0 ] === "*" ) {
				dataTypes.shift();
				if ( ct === undefined ) {
					ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
				}
			}

			// Check if we're dealing with a known content-type
			if ( ct ) {
				for ( type in contents ) {
					if ( contents[ type ] && contents[ type ].test( ct ) ) {
						dataTypes.unshift( type );
						break;
					}
				}
			}

			// Check to see if we have a response for the expected dataType
			if ( dataTypes[ 0 ] in responses ) {
				finalDataType = dataTypes[ 0 ];
			} else {

				// Try convertible dataTypes
				for ( type in responses ) {
					if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
						finalDataType = type;
						break;
					}
					if ( !firstDataType ) {
						firstDataType = type;
					}
				}

				// Or just use first one
				finalDataType = finalDataType || firstDataType;
			}

			// If we found a dataType
			// We add the dataType to the list if needed
			// and return the corresponding response
			if ( finalDataType ) {
				if ( finalDataType !== dataTypes[ 0 ] ) {
					dataTypes.unshift( finalDataType );
				}
				return responses[ finalDataType ];
			}
		}

		/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
		function ajaxConvert( s, response, jqXHR, isSuccess ) {
			var conv2, current, conv, tmp, prev,
			    converters = {},

			    // Work with a copy of dataTypes in case we need to modify it for conversion
			    dataTypes = s.dataTypes.slice();

			// Create converters map with lowercased keys
			if ( dataTypes[ 1 ] ) {
				for ( conv in s.converters ) {
					converters[ conv.toLowerCase() ] = s.converters[ conv ];
				}
			}

			current = dataTypes.shift();

			// Convert to each sequential dataType
			while ( current ) {

				if ( s.responseFields[ current ] ) {
					jqXHR[ s.responseFields[ current ] ] = response;
				}

				// Apply the dataFilter if provided
				if ( !prev && isSuccess && s.dataFilter ) {
					response = s.dataFilter( response, s.dataType );
				}

				prev = current;
				current = dataTypes.shift();

				if ( current ) {

					// There's only work to do if current dataType is non-auto
					if ( current === "*" ) {

						current = prev;

						// Convert response if prev dataType is non-auto and differs from current
					} else if ( prev !== "*" && prev !== current ) {

						// Seek a direct converter
						conv = converters[ prev + " " + current ] || converters[ "* " + current ];

						// If none found, seek a pair
						if ( !conv ) {
							for ( conv2 in converters ) {

								// If conv2 outputs current
								tmp = conv2.split( " " );
								if ( tmp[ 1 ] === current ) {

									// If prev can be converted to accepted input
									conv = converters[ prev + " " + tmp[ 0 ] ] ||
										converters[ "* " + tmp[ 0 ] ];
									if ( conv ) {

										// Condense equivalence converters
										if ( conv === true ) {
											conv = converters[ conv2 ];

											// Otherwise, insert the intermediate dataType
										} else if ( converters[ conv2 ] !== true ) {
											current = tmp[ 0 ];
											dataTypes.unshift( tmp[ 1 ] );
										}
										break;
									}
								}
							}
						}

						// Apply converter (if not an equivalence)
						if ( conv !== true ) {

							// Unless errors are allowed to bubble, catch and return them
							if ( conv && s.throws ) {
								response = conv( response );
							} else {
								try {
									response = conv( response );
								} catch ( e ) {
									return {
										state: "parsererror",
										error: conv ? e : "No conversion from " + prev + " to " + current
									};
								}
							}
						}
					}
				}
			}

			return { state: "success", data: response };
		}

		jQuery.extend( {

			// Counter for holding the number of active queries
			active: 0,

			// Last-Modified header cache for next request
			lastModified: {},
			etag: {},

			ajaxSettings: {
				url: location.href,
				type: "GET",
				isLocal: rlocalProtocol.test( location.protocol ),
				global: true,
				processData: true,
				async: true,
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",

				/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

				accepts: {
					"*": allTypes,
					text: "text/plain",
					html: "text/html",
					xml: "application/xml, text/xml",
					json: "application/json, text/javascript"
				},

				contents: {
					xml: /\bxml\b/,
					html: /\bhtml/,
					json: /\bjson\b/
				},

				responseFields: {
					xml: "responseXML",
					text: "responseText",
					json: "responseJSON"
				},

				// Data converters
				// Keys separate source (or catchall "*") and destination types with a single space
				converters: {

					// Convert anything to text
					"* text": String,

					// Text to html (true = no transformation)
					"text html": true,

					// Evaluate text as a json expression
					"text json": JSON.parse,

					// Parse text as xml
					"text xml": jQuery.parseXML
				},

				// For options that shouldn't be deep extended:
				// you can add your own custom options here if
				// and when you create one that shouldn't be
				// deep extended (see ajaxExtend)
				flatOptions: {
					url: true,
					context: true
				}
			},

			// Creates a full fledged settings object into target
			// with both ajaxSettings and settings fields.
			// If target is omitted, writes into ajaxSettings.
			ajaxSetup: function( target, settings ) {
				return settings ?

					// Building a settings object
					ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

					// Extending ajaxSettings
					ajaxExtend( jQuery.ajaxSettings, target );
			},

			ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
			ajaxTransport: addToPrefiltersOrTransports( transports ),

			// Main method
			ajax: function( url, options ) {

				// If url is an object, simulate pre-1.5 signature
				if ( typeof url === "object" ) {
					options = url;
					url = undefined;
				}

				// Force options to be an object
				options = options || {};

				var transport,

				    // URL without anti-cache param
				    cacheURL,

				    // Response headers
				    responseHeadersString,
				    responseHeaders,

				    // timeout handle
				    timeoutTimer,

				    // Url cleanup var
				    urlAnchor,

				    // Request state (becomes false upon send and true upon completion)
				    completed,

				    // To know if global events are to be dispatched
				    fireGlobals,

				    // Loop variable
				    i,

				    // uncached part of the url
				    uncached,

				    // Create the final options object
				    s = jQuery.ajaxSetup( {}, options ),

				    // Callbacks context
				    callbackContext = s.context || s,

				    // Context for global events is callbackContext if it is a DOM node or jQuery collection
				    globalEventContext = s.context &&
				    ( callbackContext.nodeType || callbackContext.jquery ) ?
					    jQuery( callbackContext ) :
					    jQuery.event,

				    // Deferreds
				    deferred = jQuery.Deferred(),
				    completeDeferred = jQuery.Callbacks( "once memory" ),

				    // Status-dependent callbacks
				    statusCode = s.statusCode || {},

				    // Headers (they are sent all at once)
				    requestHeaders = {},
				    requestHeadersNames = {},

				    // Default abort message
				    strAbort = "canceled",

				    // Fake xhr
				    jqXHR = {
					    readyState: 0,

					    // Builds headers hashtable if needed
					    getResponseHeader: function( key ) {
						    var match;
						    if ( completed ) {
							    if ( !responseHeaders ) {
								    responseHeaders = {};
								    while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									    responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								    }
							    }
							    match = responseHeaders[ key.toLowerCase() ];
						    }
						    return match == null ? null : match;
					    },

					    // Raw string
					    getAllResponseHeaders: function() {
						    return completed ? responseHeadersString : null;
					    },

					    // Caches the header
					    setRequestHeader: function( name, value ) {
						    if ( completed == null ) {
							    name = requestHeadersNames[ name.toLowerCase() ] =
								    requestHeadersNames[ name.toLowerCase() ] || name;
							    requestHeaders[ name ] = value;
						    }
						    return this;
					    },

					    // Overrides response content-type header
					    overrideMimeType: function( type ) {
						    if ( completed == null ) {
							    s.mimeType = type;
						    }
						    return this;
					    },

					    // Status-dependent callbacks
					    statusCode: function( map ) {
						    var code;
						    if ( map ) {
							    if ( completed ) {

								    // Execute the appropriate callbacks
								    jqXHR.always( map[ jqXHR.status ] );
							    } else {

								    // Lazy-add the new callbacks in a way that preserves old ones
								    for ( code in map ) {
									    statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								    }
							    }
						    }
						    return this;
					    },

					    // Cancel the request
					    abort: function( statusText ) {
						    var finalText = statusText || strAbort;
						    if ( transport ) {
							    transport.abort( finalText );
						    }
						    done( 0, finalText );
						    return this;
					    }
				    };

				// Attach deferreds
				deferred.promise( jqXHR );

				// Add protocol if not provided (prefilters might expect it)
				// Handle falsy url in the settings object (#10093: consistency with old signature)
				// We also use the url parameter if available
				s.url = ( ( url || s.url || location.href ) + "" )
					.replace( rprotocol, location.protocol + "//" );

				// Alias method option to type as per ticket #12004
				s.type = options.method || options.type || s.method || s.type;

				// Extract dataTypes list
				s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

				// A cross-domain request is in order when the origin doesn't match the current origin.
				if ( s.crossDomain == null ) {
					urlAnchor = document.createElement( "a" );

					// Support: IE <=8 - 11, Edge 12 - 13
					// IE throws exception on accessing the href property if url is malformed,
					// e.g. http://example.com:80x/
					try {
						urlAnchor.href = s.url;

						// Support: IE <=8 - 11 only
						// Anchor's host property isn't correctly set when s.url is relative
						urlAnchor.href = urlAnchor.href;
						s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
							urlAnchor.protocol + "//" + urlAnchor.host;
					} catch ( e ) {

						// If there is an error parsing the URL, assume it is crossDomain,
						// it can be rejected by the transport if it is invalid
						s.crossDomain = true;
					}
				}

				// Convert data if not already a string
				if ( s.data && s.processData && typeof s.data !== "string" ) {
					s.data = jQuery.param( s.data, s.traditional );
				}

				// Apply prefilters
				inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

				// If request was aborted inside a prefilter, stop there
				if ( completed ) {
					return jqXHR;
				}

				// We can fire global events as of now if asked to
				// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
				fireGlobals = jQuery.event && s.global;

				// Watch for a new set of requests
				if ( fireGlobals && jQuery.active++ === 0 ) {
					jQuery.event.trigger( "ajaxStart" );
				}

				// Uppercase the type
				s.type = s.type.toUpperCase();

				// Determine if request has content
				s.hasContent = !rnoContent.test( s.type );

				// Save the URL in case we're toying with the If-Modified-Since
				// and/or If-None-Match header later on
				// Remove hash to simplify url manipulation
				cacheURL = s.url.replace( rhash, "" );

				// More options handling for requests with no content
				if ( !s.hasContent ) {

					// Remember the hash so we can put it back
					uncached = s.url.slice( cacheURL.length );

					// If data is available, append data to url
					if ( s.data ) {
						cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

						// #9682: remove data so that it's not used in an eventual retry
						delete s.data;
					}

					// Add or update anti-cache param if needed
					if ( s.cache === false ) {
						cacheURL = cacheURL.replace( rantiCache, "$1" );
						uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
					}

					// Put hash and anti-cache on the URL that will be requested (gh-1732)
					s.url = cacheURL + uncached;

					// Change '%20' to '+' if this is encoded form body content (gh-2658)
				} else if ( s.data && s.processData &&
					( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
					s.data = s.data.replace( r20, "+" );
				}

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					if ( jQuery.lastModified[ cacheURL ] ) {
						jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
					}
					if ( jQuery.etag[ cacheURL ] ) {
						jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
					}
				}

				// Set the correct header, if data is being sent
				if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
					jqXHR.setRequestHeader( "Content-Type", s.contentType );
				}

				// Set the Accepts header for the server, depending on the dataType
				jqXHR.setRequestHeader(
					"Accept",
					s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
						s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
						s.accepts[ "*" ]
				);

				// Check for headers option
				for ( i in s.headers ) {
					jqXHR.setRequestHeader( i, s.headers[ i ] );
				}

				// Allow custom headers/mimetypes and early abort
				if ( s.beforeSend &&
					( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

					// Abort if not done already and return
					return jqXHR.abort();
				}

				// Aborting is no longer a cancellation
				strAbort = "abort";

				// Install callbacks on deferreds
				completeDeferred.add( s.complete );
				jqXHR.done( s.success );
				jqXHR.fail( s.error );

				// Get transport
				transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

				// If no transport, we auto-abort
				if ( !transport ) {
					done( -1, "No Transport" );
				} else {
					jqXHR.readyState = 1;

					// Send global event
					if ( fireGlobals ) {
						globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
					}

					// If request was aborted inside ajaxSend, stop there
					if ( completed ) {
						return jqXHR;
					}

					// Timeout
					if ( s.async && s.timeout > 0 ) {
						timeoutTimer = window.setTimeout( function() {
							jqXHR.abort( "timeout" );
						}, s.timeout );
					}

					try {
						completed = false;
						transport.send( requestHeaders, done );
					} catch ( e ) {

						// Rethrow post-completion exceptions
						if ( completed ) {
							throw e;
						}

						// Propagate others as results
						done( -1, e );
					}
				}

				// Callback for when everything is done
				function done( status, nativeStatusText, responses, headers ) {
					var isSuccess, success, error, response, modified,
					    statusText = nativeStatusText;

					// Ignore repeat invocations
					if ( completed ) {
						return;
					}

					completed = true;

					// Clear timeout if it exists
					if ( timeoutTimer ) {
						window.clearTimeout( timeoutTimer );
					}

					// Dereference transport for early garbage collection
					// (no matter how long the jqXHR object will be used)
					transport = undefined;

					// Cache response headers
					responseHeadersString = headers || "";

					// Set readyState
					jqXHR.readyState = status > 0 ? 4 : 0;

					// Determine if successful
					isSuccess = status >= 200 && status < 300 || status === 304;

					// Get response data
					if ( responses ) {
						response = ajaxHandleResponses( s, jqXHR, responses );
					}

					// Convert no matter what (that way responseXXX fields are always set)
					response = ajaxConvert( s, response, jqXHR, isSuccess );

					// If successful, handle type chaining
					if ( isSuccess ) {

						// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
						if ( s.ifModified ) {
							modified = jqXHR.getResponseHeader( "Last-Modified" );
							if ( modified ) {
								jQuery.lastModified[ cacheURL ] = modified;
							}
							modified = jqXHR.getResponseHeader( "etag" );
							if ( modified ) {
								jQuery.etag[ cacheURL ] = modified;
							}
						}

						// if no content
						if ( status === 204 || s.type === "HEAD" ) {
							statusText = "nocontent";

							// if not modified
						} else if ( status === 304 ) {
							statusText = "notmodified";

							// If we have data, let's convert it
						} else {
							statusText = response.state;
							success = response.data;
							error = response.error;
							isSuccess = !error;
						}
					} else {

						// Extract error from statusText and normalize for non-aborts
						error = statusText;
						if ( status || !statusText ) {
							statusText = "error";
							if ( status < 0 ) {
								status = 0;
							}
						}
					}

					// Set data for the fake xhr object
					jqXHR.status = status;
					jqXHR.statusText = ( nativeStatusText || statusText ) + "";

					// Success/Error
					if ( isSuccess ) {
						deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
					} else {
						deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
					}

					// Status-dependent callbacks
					jqXHR.statusCode( statusCode );
					statusCode = undefined;

					if ( fireGlobals ) {
						globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
							[ jqXHR, s, isSuccess ? success : error ] );
					}

					// Complete
					completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

					if ( fireGlobals ) {
						globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

						// Handle the global AJAX counter
						if ( !( --jQuery.active ) ) {
							jQuery.event.trigger( "ajaxStop" );
						}
					}
				}

				return jqXHR;
			},

			getJSON: function( url, data, callback ) {
				return jQuery.get( url, data, callback, "json" );
			},

			getScript: function( url, callback ) {
				return jQuery.get( url, undefined, callback, "script" );
			}
		} );

		jQuery.each( [ "get", "post" ], function( i, method ) {
			jQuery[ method ] = function( url, data, callback, type ) {

				// Shift arguments if data argument was omitted
				if ( jQuery.isFunction( data ) ) {
					type = type || callback;
					callback = data;
					data = undefined;
				}

				// The url can be an options object (which then must have .url)
				return jQuery.ajax( jQuery.extend( {
					url: url,
					type: method,
					dataType: type,
					data: data,
					success: callback
				}, jQuery.isPlainObject( url ) && url ) );
			};
		} );


		jQuery._evalUrl = function( url ) {
			return jQuery.ajax( {
				url: url,

				// Make this explicit, since user can override this through ajaxSetup (#11264)
				type: "GET",
				dataType: "script",
				cache: true,
				async: false,
				global: false,
				"throws": true
			} );
		};


		jQuery.fn.extend( {
			wrapAll: function( html ) {
				var wrap;

				if ( this[ 0 ] ) {
					if ( jQuery.isFunction( html ) ) {
						html = html.call( this[ 0 ] );
					}

					// The elements to wrap the target around
					wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

					if ( this[ 0 ].parentNode ) {
						wrap.insertBefore( this[ 0 ] );
					}

					wrap.map( function() {
						var elem = this;

						while ( elem.firstElementChild ) {
							elem = elem.firstElementChild;
						}

						return elem;
					} ).append( this );
				}

				return this;
			},

			wrapInner: function( html ) {
				if ( jQuery.isFunction( html ) ) {
					return this.each( function( i ) {
						jQuery( this ).wrapInner( html.call( this, i ) );
					} );
				}

				return this.each( function() {
					var self = jQuery( this ),
					    contents = self.contents();

					if ( contents.length ) {
						contents.wrapAll( html );

					} else {
						self.append( html );
					}
				} );
			},

			wrap: function( html ) {
				var isFunction = jQuery.isFunction( html );

				return this.each( function( i ) {
					jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
				} );
			},

			unwrap: function( selector ) {
				this.parent( selector ).not( "body" ).each( function() {
					jQuery( this ).replaceWith( this.childNodes );
				} );
				return this;
			}
		} );


		jQuery.expr.pseudos.hidden = function( elem ) {
			return !jQuery.expr.pseudos.visible( elem );
		};
		jQuery.expr.pseudos.visible = function( elem ) {
			return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
		};




		jQuery.ajaxSettings.xhr = function() {
			try {
				return new window.XMLHttpRequest();
			} catch ( e ) {}
		};

		var xhrSuccessStatus = {

			    // File protocol always yields status code 0, assume 200
			    0: 200,

			    // Support: IE <=9 only
			    // #1450: sometimes IE returns 1223 when it should be 204
			    1223: 204
		    },
		    xhrSupported = jQuery.ajaxSettings.xhr();

		support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
		support.ajax = xhrSupported = !!xhrSupported;

		jQuery.ajaxTransport( function( options ) {
			var callback, errorCallback;

			// Cross domain only allowed if supported through XMLHttpRequest
			if ( support.cors || xhrSupported && !options.crossDomain ) {
				return {
					send: function( headers, complete ) {
						var i,
						    xhr = options.xhr();

						xhr.open(
							options.type,
							options.url,
							options.async,
							options.username,
							options.password
						);

						// Apply custom fields if provided
						if ( options.xhrFields ) {
							for ( i in options.xhrFields ) {
								xhr[ i ] = options.xhrFields[ i ];
							}
						}

						// Override mime type if needed
						if ( options.mimeType && xhr.overrideMimeType ) {
							xhr.overrideMimeType( options.mimeType );
						}

						// X-Requested-With header
						// For cross-domain requests, seeing as conditions for a preflight are
						// akin to a jigsaw puzzle, we simply never set it to be sure.
						// (it can always be set on a per-request basis or even using ajaxSetup)
						// For same-domain requests, won't change header if already provided.
						if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
							headers[ "X-Requested-With" ] = "XMLHttpRequest";
						}

						// Set headers
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}

						// Callback
						callback = function( type ) {
							return function() {
								if ( callback ) {
									callback = errorCallback = xhr.onload =
										xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

									if ( type === "abort" ) {
										xhr.abort();
									} else if ( type === "error" ) {

										// Support: IE <=9 only
										// On a manual native abort, IE9 throws
										// errors on any property access that is not readyState
										if ( typeof xhr.status !== "number" ) {
											complete( 0, "error" );
										} else {
											complete(

												// File: protocol always yields status 0; see #8605, #14207
												xhr.status,
												xhr.statusText
											);
										}
									} else {
										complete(
											xhrSuccessStatus[ xhr.status ] || xhr.status,
											xhr.statusText,

											// Support: IE <=9 only
											// IE9 has no XHR2 but throws on binary (trac-11426)
											// For XHR2 non-text, let the caller handle it (gh-2498)
											( xhr.responseType || "text" ) !== "text"  ||
											typeof xhr.responseText !== "string" ?
												{ binary: xhr.response } :
												{ text: xhr.responseText },
											xhr.getAllResponseHeaders()
										);
									}
								}
							};
						};

						// Listen to events
						xhr.onload = callback();
						errorCallback = xhr.onerror = callback( "error" );

						// Support: IE 9 only
						// Use onreadystatechange to replace onabort
						// to handle uncaught aborts
						if ( xhr.onabort !== undefined ) {
							xhr.onabort = errorCallback;
						} else {
							xhr.onreadystatechange = function() {

								// Check readyState before timeout as it changes
								if ( xhr.readyState === 4 ) {

									// Allow onerror to be called first,
									// but that will not handle a native abort
									// Also, save errorCallback to a variable
									// as xhr.onerror cannot be accessed
									window.setTimeout( function() {
										if ( callback ) {
											errorCallback();
										}
									} );
								}
							};
						}

						// Create the abort callback
						callback = callback( "abort" );

						try {

							// Do send the request (this may raise an exception)
							xhr.send( options.hasContent && options.data || null );
						} catch ( e ) {

							// #14683: Only rethrow if this hasn't been notified as an error yet
							if ( callback ) {
								throw e;
							}
						}
					},

					abort: function() {
						if ( callback ) {
							callback();
						}
					}
				};
			}
		} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
		jQuery.ajaxPrefilter( function( s ) {
			if ( s.crossDomain ) {
				s.contents.script = false;
			}
		} );

// Install script dataType
		jQuery.ajaxSetup( {
			accepts: {
				script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
			},
			contents: {
				script: /\b(?:java|ecma)script\b/
			},
			converters: {
				"text script": function( text ) {
					jQuery.globalEval( text );
					return text;
				}
			}
		} );

// Handle cache's special case and crossDomain
		jQuery.ajaxPrefilter( "script", function( s ) {
			if ( s.cache === undefined ) {
				s.cache = false;
			}
			if ( s.crossDomain ) {
				s.type = "GET";
			}
		} );

// Bind script tag hack transport
		jQuery.ajaxTransport( "script", function( s ) {

			// This transport only deals with cross domain requests
			if ( s.crossDomain ) {
				var script, callback;
				return {
					send: function( _, complete ) {
						script = jQuery( "<script>" ).prop( {
							charset: s.scriptCharset,
							src: s.url
						} ).on(
							"load error",
							callback = function( evt ) {
								script.remove();
								callback = null;
								if ( evt ) {
									complete( evt.type === "error" ? 404 : 200, evt.type );
								}
							}
						);

						// Use native DOM manipulation to avoid our domManip AJAX trickery
						document.head.appendChild( script[ 0 ] );
					},
					abort: function() {
						if ( callback ) {
							callback();
						}
					}
				};
			}
		} );




		var oldCallbacks = [],
		    rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
		jQuery.ajaxSetup( {
			jsonp: "callback",
			jsonpCallback: function() {
				var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
				this[ callback ] = true;
				return callback;
			}
		} );

// Detect, normalize options and install callbacks for jsonp requests
		jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

			var callbackName, overwritten, responseContainer,
			    jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
						    "url" :
						    typeof s.data === "string" &&
						    ( s.contentType || "" )
							    .indexOf( "application/x-www-form-urlencoded" ) === 0 &&
						    rjsonp.test( s.data ) && "data"
				    );

			// Handle iff the expected data type is "jsonp" or we have a parameter to set
			if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

				// Get callback name, remembering preexisting value associated with it
				callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
					s.jsonpCallback() :
					s.jsonpCallback;

				// Insert callback into url or form data
				if ( jsonProp ) {
					s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
				} else if ( s.jsonp !== false ) {
					s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
				}

				// Use data converter to retrieve json after script execution
				s.converters[ "script json" ] = function() {
					if ( !responseContainer ) {
						jQuery.error( callbackName + " was not called" );
					}
					return responseContainer[ 0 ];
				};

				// Force json dataType
				s.dataTypes[ 0 ] = "json";

				// Install callback
				overwritten = window[ callbackName ];
				window[ callbackName ] = function() {
					responseContainer = arguments;
				};

				// Clean-up function (fires after converters)
				jqXHR.always( function() {

					// If previous value didn't exist - remove it
					if ( overwritten === undefined ) {
						jQuery( window ).removeProp( callbackName );

						// Otherwise restore preexisting value
					} else {
						window[ callbackName ] = overwritten;
					}

					// Save back as free
					if ( s[ callbackName ] ) {

						// Make sure that re-using the options doesn't screw things around
						s.jsonpCallback = originalSettings.jsonpCallback;

						// Save the callback name for future use
						oldCallbacks.push( callbackName );
					}

					// Call if it was a function and we have a response
					if ( responseContainer && jQuery.isFunction( overwritten ) ) {
						overwritten( responseContainer[ 0 ] );
					}

					responseContainer = overwritten = undefined;
				} );

				// Delegate to script
				return "script";
			}
		} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
		support.createHTMLDocument = ( function() {
			var body = document.implementation.createHTMLDocument( "" ).body;
			body.innerHTML = "<form></form><form></form>";
			return body.childNodes.length === 2;
		} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
		jQuery.parseHTML = function( data, context, keepScripts ) {
			if ( typeof data !== "string" ) {
				return [];
			}
			if ( typeof context === "boolean" ) {
				keepScripts = context;
				context = false;
			}

			var base, parsed, scripts;

			if ( !context ) {

				// Stop scripts or inline event handlers from being executed immediately
				// by using document.implementation
				if ( support.createHTMLDocument ) {
					context = document.implementation.createHTMLDocument( "" );

					// Set the base href for the created document
					// so any parsed elements with URLs
					// are based on the document's URL (gh-2965)
					base = context.createElement( "base" );
					base.href = document.location.href;
					context.head.appendChild( base );
				} else {
					context = document;
				}
			}

			parsed = rsingleTag.exec( data );
			scripts = !keepScripts && [];

			// Single tag
			if ( parsed ) {
				return [ context.createElement( parsed[ 1 ] ) ];
			}

			parsed = buildFragment( [ data ], context, scripts );

			if ( scripts && scripts.length ) {
				jQuery( scripts ).remove();
			}

			return jQuery.merge( [], parsed.childNodes );
		};


		/**
		 * Load a url into a page
		 */
		jQuery.fn.load = function( url, params, callback ) {
			var selector, type, response,
			    self = this,
			    off = url.indexOf( " " );

			if ( off > -1 ) {
				selector = stripAndCollapse( url.slice( off ) );
				url = url.slice( 0, off );
			}

			// If it's a function
			if ( jQuery.isFunction( params ) ) {

				// We assume that it's the callback
				callback = params;
				params = undefined;

				// Otherwise, build a param string
			} else if ( params && typeof params === "object" ) {
				type = "POST";
			}

			// If we have elements to modify, make the request
			if ( self.length > 0 ) {
				jQuery.ajax( {
					url: url,

					// If "type" variable is undefined, then "GET" method will be used.
					// Make value of this field explicit since
					// user can override it through ajaxSetup method
					type: type || "GET",
					dataType: "html",
					data: params
				} ).done( function( responseText ) {

					// Save response for use in complete callback
					response = arguments;

					self.html( selector ?

						// If a selector was specified, locate the right elements in a dummy div
						// Exclude scripts to avoid IE 'Permission Denied' errors
						jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

						// Otherwise use the full result
						responseText );

					// If the request succeeds, this function gets "data", "status", "jqXHR"
					// but they are ignored because response was set above.
					// If it fails, this function gets "jqXHR", "status", "error"
				} ).always( callback && function( jqXHR, status ) {
						self.each( function() {
							callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
						} );
					} );
			}

			return this;
		};




// Attach a bunch of functions for handling common AJAX events
		jQuery.each( [
			"ajaxStart",
			"ajaxStop",
			"ajaxComplete",
			"ajaxError",
			"ajaxSuccess",
			"ajaxSend"
		], function( i, type ) {
			jQuery.fn[ type ] = function( fn ) {
				return this.on( type, fn );
			};
		} );




		jQuery.expr.pseudos.animated = function( elem ) {
			return jQuery.grep( jQuery.timers, function( fn ) {
				return elem === fn.elem;
			} ).length;
		};




		jQuery.offset = {
			setOffset: function( elem, options, i ) {
				var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				    position = jQuery.css( elem, "position" ),
				    curElem = jQuery( elem ),
				    props = {};

				// Set position first, in-case top/left are set even on static elem
				if ( position === "static" ) {
					elem.style.position = "relative";
				}

				curOffset = curElem.offset();
				curCSSTop = jQuery.css( elem, "top" );
				curCSSLeft = jQuery.css( elem, "left" );
				calculatePosition = ( position === "absolute" || position === "fixed" ) &&
					( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

				// Need to be able to calculate position if either
				// top or left is auto and position is either absolute or fixed
				if ( calculatePosition ) {
					curPosition = curElem.position();
					curTop = curPosition.top;
					curLeft = curPosition.left;

				} else {
					curTop = parseFloat( curCSSTop ) || 0;
					curLeft = parseFloat( curCSSLeft ) || 0;
				}

				if ( jQuery.isFunction( options ) ) {

					// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
					options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
				}

				if ( options.top != null ) {
					props.top = ( options.top - curOffset.top ) + curTop;
				}
				if ( options.left != null ) {
					props.left = ( options.left - curOffset.left ) + curLeft;
				}

				if ( "using" in options ) {
					options.using.call( elem, props );

				} else {
					curElem.css( props );
				}
			}
		};

		jQuery.fn.extend( {
			offset: function( options ) {

				// Preserve chaining for setter
				if ( arguments.length ) {
					return options === undefined ?
						this :
						this.each( function( i ) {
							jQuery.offset.setOffset( this, options, i );
						} );
				}

				var doc, docElem, rect, win,
				    elem = this[ 0 ];

				if ( !elem ) {
					return;
				}

				// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
				// Support: IE <=11 only
				// Running getBoundingClientRect on a
				// disconnected node in IE throws an error
				if ( !elem.getClientRects().length ) {
					return { top: 0, left: 0 };
				}

				rect = elem.getBoundingClientRect();

				doc = elem.ownerDocument;
				docElem = doc.documentElement;
				win = doc.defaultView;

				return {
					top: rect.top + win.pageYOffset - docElem.clientTop,
					left: rect.left + win.pageXOffset - docElem.clientLeft
				};
			},

			position: function() {
				if ( !this[ 0 ] ) {
					return;
				}

				var offsetParent, offset,
				    elem = this[ 0 ],
				    parentOffset = { top: 0, left: 0 };

				// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
				// because it is its only offset parent
				if ( jQuery.css( elem, "position" ) === "fixed" ) {

					// Assume getBoundingClientRect is there when computed position is fixed
					offset = elem.getBoundingClientRect();

				} else {

					// Get *real* offsetParent
					offsetParent = this.offsetParent();

					// Get correct offsets
					offset = this.offset();
					if ( !nodeName( offsetParent[ 0 ], "html" ) ) {
						parentOffset = offsetParent.offset();
					}

					// Add offsetParent borders
					parentOffset = {
						top: parentOffset.top + jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ),
						left: parentOffset.left + jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true )
					};
				}

				// Subtract parent offsets and element margins
				return {
					top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
					left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
				};
			},

			// This method will return documentElement in the following cases:
			// 1) For the element inside the iframe without offsetParent, this method will return
			//    documentElement of the parent window
			// 2) For the hidden or detached element
			// 3) For body or html element, i.e. in case of the html node - it will return itself
			//
			// but those exceptions were never presented as a real life use-cases
			// and might be considered as more preferable results.
			//
			// This logic, however, is not guaranteed and can change at any point in the future
			offsetParent: function() {
				return this.map( function() {
					var offsetParent = this.offsetParent;

					while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
						offsetParent = offsetParent.offsetParent;
					}

					return offsetParent || documentElement;
				} );
			}
		} );

// Create scrollLeft and scrollTop methods
		jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
			var top = "pageYOffset" === prop;

			jQuery.fn[ method ] = function( val ) {
				return access( this, function( elem, method, val ) {

					// Coalesce documents and windows
					var win;
					if ( jQuery.isWindow( elem ) ) {
						win = elem;
					} else if ( elem.nodeType === 9 ) {
						win = elem.defaultView;
					}

					if ( val === undefined ) {
						return win ? win[ prop ] : elem[ method ];
					}

					if ( win ) {
						win.scrollTo(
							!top ? val : win.pageXOffset,
							top ? val : win.pageYOffset
						);

					} else {
						elem[ method ] = val;
					}
				}, method, val, arguments.length );
			};
		} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
				function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );

						// If curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			);
		} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
		jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
			jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
				function( defaultExtra, funcName ) {

					// Margin is only for outerHeight, outerWidth
					jQuery.fn[ funcName ] = function( margin, value ) {
						var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
						    extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

						return access( this, function( elem, type, value ) {
							var doc;

							if ( jQuery.isWindow( elem ) ) {

								// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
								return funcName.indexOf( "outer" ) === 0 ?
									elem[ "inner" + name ] :
									elem.document.documentElement[ "client" + name ];
							}

							// Get document width or height
							if ( elem.nodeType === 9 ) {
								doc = elem.documentElement;

								// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
								// whichever is greatest
								return Math.max(
									elem.body[ "scroll" + name ], doc[ "scroll" + name ],
									elem.body[ "offset" + name ], doc[ "offset" + name ],
									doc[ "client" + name ]
								);
							}

							return value === undefined ?

								// Get width or height on the element, requesting but not forcing parseFloat
								jQuery.css( elem, type, extra ) :

								// Set width or height on the element
								jQuery.style( elem, type, value, extra );
						}, type, chainable ? margin : undefined, chainable );
					};
				} );
		} );


		jQuery.fn.extend( {

			bind: function( types, data, fn ) {
				return this.on( types, null, data, fn );
			},
			unbind: function( types, fn ) {
				return this.off( types, null, fn );
			},

			delegate: function( selector, types, data, fn ) {
				return this.on( types, selector, data, fn );
			},
			undelegate: function( selector, types, fn ) {

				// ( namespace ) or ( selector, types [, fn] )
				return arguments.length === 1 ?
					this.off( selector, "**" ) :
					this.off( types, selector || "**", fn );
			}
		} );

		jQuery.holdReady = function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		};
		jQuery.isArray = Array.isArray;
		jQuery.parseJSON = JSON.parse;
		jQuery.nodeName = nodeName;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

		if ( typeof define === "function" && define.amd ) {
			define( "jquery", [], function() {
				return jQuery;
			} );
		}




		var

			// Map over jQuery in case of overwrite
			_jQuery = window.jQuery,

			// Map over the $ in case of overwrite
			_$ = window.$;

		jQuery.noConflict = function( deep ) {
			if ( window.$ === jQuery ) {
				window.$ = _$;
			}

			if ( deep && window.jQuery === jQuery ) {
				window.jQuery = _jQuery;
			}

			return jQuery;
		};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
		if ( !noGlobal ) {
			window.jQuery = window.$ = jQuery;
		}




		return jQuery;
	} );

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/underscore/underscore-min.js

try{
	console.log('starting parsing underscore-min.js');
	(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,v=e.reduce,h=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,j=i.bind,w=function(n){return n instanceof w?n:this instanceof w?(this._wrapped=n,void 0):new w(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=w),exports._=w):n._=w,w.VERSION="1.4.3";var A=w.each=w.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(w.has(n,a)&&t.call(e,n[a],a,n)===r)return};w.map=w.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e[e.length]=t.call(r,n,u,i)}),e)};var O="Reduce of empty array with no initial value";w.reduce=w.foldl=w.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduce===v)return e&&(t=w.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},w.reduceRight=w.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduceRight===h)return e&&(t=w.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=w.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},w.find=w.detect=function(n,t,r){var e;return E(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},w.filter=w.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&(e[e.length]=n)}),e)},w.reject=function(n,t,r){return w.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},w.every=w.all=function(n,t,e){t||(t=w.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var E=w.some=w.any=function(n,t,e){t||(t=w.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};w.contains=w.include=function(n,t){return null==n?!1:y&&n.indexOf===y?-1!=n.indexOf(t):E(n,function(n){return n===t})},w.invoke=function(n,t){var r=o.call(arguments,2);return w.map(n,function(n){return(w.isFunction(t)?t:n[t]).apply(n,r)})},w.pluck=function(n,t){return w.map(n,function(n){return n[t]})},w.where=function(n,t){return w.isEmpty(t)?[]:w.filter(n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},w.max=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.max.apply(Math,n);if(!t&&w.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>=e.computed&&(e={value:n,computed:a})}),e.value},w.min=function(n,t,r){if(!t&&w.isArray(n)&&n[0]===+n[0]&&65535>n.length)return Math.min.apply(Math,n);if(!t&&w.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;e.computed>a&&(e={value:n,computed:a})}),e.value},w.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=w.random(r++),e[r-1]=e[t],e[t]=n}),e};var F=function(n){return w.isFunction(n)?n:function(t){return t[n]}};w.sortBy=function(n,t,r){var e=F(t);return w.pluck(w.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||void 0===r)return 1;if(e>r||void 0===e)return-1}return n.index<t.index?-1:1}),"value")};var k=function(n,t,r,e){var u={},i=F(t||w.identity);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};w.groupBy=function(n,t,r){return k(n,t,r,function(n,t,r){(w.has(n,t)?n[t]:n[t]=[]).push(r)})},w.countBy=function(n,t,r){return k(n,t,r,function(n,t){w.has(n,t)||(n[t]=0),n[t]++})},w.sortedIndex=function(n,t,r,e){r=null==r?w.identity:F(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;u>r.call(e,n[o])?i=o+1:a=o}return i},w.toArray=function(n){return n?w.isArray(n)?o.call(n):n.length===+n.length?w.map(n,w.identity):w.values(n):[]},w.size=function(n){return null==n?0:n.length===+n.length?n.length:w.keys(n).length},w.first=w.head=w.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},w.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},w.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},w.rest=w.tail=w.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},w.compact=function(n){return w.filter(n,w.identity)};var R=function(n,t,r){return A(n,function(n){w.isArray(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r};w.flatten=function(n,t){return R(n,t,[])},w.without=function(n){return w.difference(n,o.call(arguments,1))},w.uniq=w.unique=function(n,t,r,e){w.isFunction(t)&&(e=r,r=t,t=!1);var u=r?w.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:w.contains(a,r))||(a.push(r),i.push(n[e]))}),i},w.union=function(){return w.uniq(c.apply(e,arguments))},w.intersection=function(n){var t=o.call(arguments,1);return w.filter(w.uniq(n),function(n){return w.every(t,function(t){return w.indexOf(t,n)>=0})})},w.difference=function(n){var t=c.apply(e,o.call(arguments,1));return w.filter(n,function(n){return!w.contains(t,n)})},w.zip=function(){for(var n=o.call(arguments),t=w.max(w.pluck(n,"length")),r=Array(t),e=0;t>e;e++)r[e]=w.pluck(n,""+e);return r},w.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},w.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=w.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},w.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},w.range=function(n,t,r){1>=arguments.length&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=Array(e);e>u;)i[u++]=n,n+=r;return i};var I=function(){};w.bind=function(n,t){var r,e;if(n.bind===j&&j)return j.apply(n,o.call(arguments,1));if(!w.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));I.prototype=n.prototype;var u=new I;I.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},w.bindAll=function(n){var t=o.call(arguments,1);return 0==t.length&&(t=w.functions(n)),A(t,function(t){n[t]=w.bind(n[t],n)}),n},w.memoize=function(n,t){var r={};return t||(t=w.identity),function(){var e=t.apply(this,arguments);return w.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},w.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},w.defer=function(n){return w.delay.apply(w,[n,1].concat(o.call(arguments,1)))},w.throttle=function(n,t){var r,e,u,i,a=0,o=function(){a=new Date,u=null,i=n.apply(r,e)};return function(){var c=new Date,l=t-(c-a);return r=this,e=arguments,0>=l?(clearTimeout(u),u=null,a=c,i=n.apply(r,e)):u||(u=setTimeout(o,l)),i}},w.debounce=function(n,t,r){var e,u;return function(){var i=this,a=arguments,o=function(){e=null,r||(u=n.apply(i,a))},c=r&&!e;return clearTimeout(e),e=setTimeout(o,t),c&&(u=n.apply(i,a)),u}},w.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},w.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},w.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},w.after=function(n,t){return 0>=n?t():function(){return 1>--n?t.apply(this,arguments):void 0}},w.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)w.has(n,r)&&(t[t.length]=r);return t},w.values=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push(n[r]);return t},w.pairs=function(n){var t=[];for(var r in n)w.has(n,r)&&t.push([r,n[r]]);return t},w.invert=function(n){var t={};for(var r in n)w.has(n,r)&&(t[n[r]]=r);return t},w.functions=w.methods=function(n){var t=[];for(var r in n)w.isFunction(n[r])&&t.push(r);return t.sort()},w.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},w.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},w.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)w.contains(r,u)||(t[u]=n[u]);return t},w.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)null==n[r]&&(n[r]=t[r])}),n},w.clone=function(n){return w.isObject(n)?w.isArray(n)?n.slice():w.extend({},n):n},w.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof w&&(n=n._wrapped),t instanceof w&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==t+"";case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;r.push(n),e.push(t);var a=0,o=!0;if("[object Array]"==u){if(a=n.length,o=a==t.length)for(;a--&&(o=S(n[a],t[a],r,e)););}else{var c=n.constructor,f=t.constructor;if(c!==f&&!(w.isFunction(c)&&c instanceof c&&w.isFunction(f)&&f instanceof f))return!1;for(var s in n)if(w.has(n,s)&&(a++,!(o=w.has(t,s)&&S(n[s],t[s],r,e))))break;if(o){for(s in t)if(w.has(t,s)&&!a--)break;o=!a}}return r.pop(),e.pop(),o};w.isEqual=function(n,t){return S(n,t,[],[])},w.isEmpty=function(n){if(null==n)return!0;if(w.isArray(n)||w.isString(n))return 0===n.length;for(var t in n)if(w.has(n,t))return!1;return!0},w.isElement=function(n){return!(!n||1!==n.nodeType)},w.isArray=x||function(n){return"[object Array]"==l.call(n)},w.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){w["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),w.isArguments(arguments)||(w.isArguments=function(n){return!(!n||!w.has(n,"callee"))}),w.isFunction=function(n){return"function"==typeof n},w.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},w.isNaN=function(n){return w.isNumber(n)&&n!=+n},w.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},w.isNull=function(n){return null===n},w.isUndefined=function(n){return void 0===n},w.has=function(n,t){return f.call(n,t)},w.noConflict=function(){return n._=t,this},w.identity=function(n){return n},w.times=function(n,t,r){for(var e=Array(n),u=0;n>u;u++)e[u]=t.call(r,u);return e},w.random=function(n,t){return null==t&&(t=n,n=0),n+(0|Math.random()*(t-n+1))};var T={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};T.unescape=w.invert(T.escape);var M={escape:RegExp("["+w.keys(T.escape).join("")+"]","g"),unescape:RegExp("("+w.keys(T.unescape).join("|")+")","g")};w.each(["escape","unescape"],function(n){w[n]=function(t){return null==t?"":(""+t).replace(M[n],function(t){return T[n][t]})}}),w.result=function(n,t){if(null==n)return null;var r=n[t];return w.isFunction(r)?r.call(n):r},w.mixin=function(n){A(w.functions(n),function(t){var r=w[t]=n[t];w.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(w,n))}})};var N=0;w.uniqueId=function(n){var t=""+ ++N;return n?n+t:t},w.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;w.template=function(n,t,r){r=w.defaults({},r,w.templateSettings);var e=RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,a,o){return i+=n.slice(u,o).replace(D,function(n){return"\\"+B[n]}),r&&(i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(i+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),a&&(i+="';\n"+a+"\n__p+='"),u=o+t.length,t}),i+="';\n",r.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var a=Function(r.variable||"obj","_",i)}catch(o){throw o.source=i,o}if(t)return a(t,w);var c=function(n){return a.call(this,n,w)};return c.source="function("+(r.variable||"obj")+"){\n"+i+"}",c},w.chain=function(n){return w(n).chain()};var z=function(n){return this._chain?w(n).chain():n};w.mixin(w),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];w.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];w.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),w.extend(w.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
	console.log('ending parsing underscore-min.js');
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/backbone/backbone-min.js

try{
	console.log('starting parsing backbone-min.js');
// Backbone.js 0.9.9

// (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org
	(function(){var k=this,y=k.Backbone,h=[],z=h.push,r=h.slice,A=h.splice,g;g="undefined"!==typeof exports?exports:k.Backbone={};g.VERSION="0.9.9";var e=k._;!e&&"undefined"!==typeof require&&(e=require("underscore"));g.$=k.jQuery||k.Zepto||k.ender;g.noConflict=function(){k.Backbone=y;return this};g.emulateHTTP=!1;g.emulateJSON=!1;var s=/\s+/,n=function(a,b,c,d){if(!c)return!0;if("object"===typeof c)for(var f in c)a[b].apply(a,[f,c[f]].concat(d));else if(s.test(c)){c=c.split(s);f=0;for(var e=c.length;f<
	e;f++)a[b].apply(a,[c[f]].concat(d))}else return!0},t=function(a,b,c){var d,a=-1,f=b.length;switch(c.length){case 0:for(;++a<f;)(d=b[a]).callback.call(d.ctx);break;case 1:for(;++a<f;)(d=b[a]).callback.call(d.ctx,c[0]);break;case 2:for(;++a<f;)(d=b[a]).callback.call(d.ctx,c[0],c[1]);break;case 3:for(;++a<f;)(d=b[a]).callback.call(d.ctx,c[0],c[1],c[2]);break;default:for(;++a<f;)(d=b[a]).callback.apply(d.ctx,c)}},h=g.Events={on:function(a,b,c){if(!n(this,"on",a,[b,c])||!b)return this;this._events||(this._events=
		{});(this._events[a]||(this._events[a]=[])).push({callback:b,context:c,ctx:c||this});return this},once:function(a,b,c){if(!n(this,"once",a,[b,c])||!b)return this;var d=this,f=e.once(function(){d.off(a,f);b.apply(this,arguments)});f._callback=b;this.on(a,f,c);return this},off:function(a,b,c){var d,f,l,g,i,m,h,j;if(!this._events||!n(this,"off",a,[b,c]))return this;if(!a&&!b&&!c)return this._events={},this;g=a?[a]:e.keys(this._events);i=0;for(m=g.length;i<m;i++)if(a=g[i],d=this._events[a]){l=[];if(b||
		c){h=0;for(j=d.length;h<j;h++)f=d[h],(b&&b!==(f.callback._callback||f.callback)||c&&c!==f.context)&&l.push(f)}this._events[a]=l}return this},trigger:function(a){if(!this._events)return this;var b=r.call(arguments,1);if(!n(this,"trigger",a,b))return this;var c=this._events[a],d=this._events.all;c&&t(this,c,b);d&&t(this,d,arguments);return this},listenTo:function(a,b,c){var d=this._listeners||(this._listeners={}),f=a._listenerId||(a._listenerId=e.uniqueId("l"));d[f]=a;a.on(b,c||this,this);return this},
		stopListening:function(a,b,c){var d=this._listeners;if(d){if(a)a.off(b,c,this),!b&&!c&&delete d[a._listenerId];else{for(var f in d)d[f].off(null,null,this);this._listeners={}}return this}}};h.bind=h.on;h.unbind=h.off;e.extend(g,h);var o=g.Model=function(a,b){var c,d=a||{};this.cid=e.uniqueId("c");this.changed={};this.attributes={};this._changes=[];b&&b.collection&&(this.collection=b.collection);b&&b.parse&&(d=this.parse(d));(c=e.result(this,"defaults"))&&e.defaults(d,c);this.set(d,{silent:!0});this._currentAttributes=
		e.clone(this.attributes);this._previousAttributes=e.clone(this.attributes);this.initialize.apply(this,arguments)};e.extend(o.prototype,h,{changed:null,idAttribute:"id",initialize:function(){},toJSON:function(){return e.clone(this.attributes)},sync:function(){return g.sync.apply(this,arguments)},get:function(a){return this.attributes[a]},escape:function(a){return e.escape(this.get(a))},has:function(a){return null!=this.get(a)},set:function(a,b,c){var d,f;if(null==a)return this;e.isObject(a)?(f=a,c=
		b):(f={})[a]=b;var a=c&&c.silent,l=c&&c.unset;if(!this._validate(f,c))return!1;this.idAttribute in f&&(this.id=f[this.idAttribute]);var g=this.attributes;for(d in f)b=f[d],l?delete g[d]:g[d]=b,this._changes.push(d,b);this._hasComputed=!1;a||this.change(c);return this},unset:function(a,b){return this.set(a,void 0,e.extend({},b,{unset:!0}))},clear:function(a){var b={},c;for(c in this.attributes)b[c]=void 0;return this.set(b,e.extend({},a,{unset:!0}))},fetch:function(a){a=a?e.clone(a):{};void 0===a.parse&&
	(a.parse=!0);var b=this,c=a.success;a.success=function(d){if(!b.set(b.parse(d),a))return false;c&&c(b,d,a)};return this.sync("read",this,a)},save:function(a,b,c){var d,f,g;null==a||e.isObject(a)?(d=a,c=b):null!=a&&((d={})[a]=b);c=c?e.clone(c):{};if(c.wait){if(d&&!this._validate(d,c))return!1;f=e.clone(this.attributes)}a=e.extend({},c,{silent:!0});if(d&&!this.set(d,c.wait?a:c)||!d&&!this._validate(null,c))return!1;var q=this,i=c.success;c.success=function(a){g=true;var b=q.parse(a);c.wait&&(b=e.extend(d||
		{},b));if(!q.set(b,c))return false;i&&i(q,a,c)};b=this.isNew()?"create":c.patch?"patch":"update";"patch"==b&&(c.attrs=d);b=this.sync(b,this,c);!g&&c.wait&&(this.clear(a),this.set(f,a));return b},destroy:function(a){var a=a?e.clone(a):{},b=this,c=a.success,d=function(){b.trigger("destroy",b,b.collection,a)};a.success=function(f){(a.wait||b.isNew())&&d();c&&c(b,f,a)};if(this.isNew())return a.success(),!1;var f=this.sync("delete",this,a);a.wait||d();return f},url:function(){var a=e.result(this,"urlRoot")||
		e.result(this.collection,"url")||u();return this.isNew()?a:a+("/"===a.charAt(a.length-1)?"":"/")+encodeURIComponent(this.id)},parse:function(a){return a},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return null==this.id},change:function(a){var b=this._changing;this._changing=!0;var c=this._computeChanges(!0);this._pending=!!c.length;for(var d=c.length-2;0<=d;d-=2)this.trigger("change:"+c[d],this,c[d+1],a);if(b)return this;for(;this._pending;)this._pending=!1,this.trigger("change",
		this,a),this._previousAttributes=e.clone(this.attributes);this._changing=!1;return this},hasChanged:function(a){this._hasComputed||this._computeChanges();return null==a?!e.isEmpty(this.changed):e.has(this.changed,a)},changedAttributes:function(a){if(!a)return this.hasChanged()?e.clone(this.changed):!1;var b,c=!1,d=this._previousAttributes,f;for(f in a)if(!e.isEqual(d[f],b=a[f]))(c||(c={}))[f]=b;return c},_computeChanges:function(a){this.changed={};for(var b={},c=[],d=this._currentAttributes,f=this._changes,
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                              e=f.length-2;0<=e;e-=2){var g=f[e],i=f[e+1];b[g]||(b[g]=!0,d[g]!==i&&(this.changed[g]=i,a&&(c.push(g,i),d[g]=i)))}a&&(this._changes=[]);this._hasComputed=!0;return c},previous:function(a){return null==a||!this._previousAttributes?null:this._previousAttributes[a]},previousAttributes:function(){return e.clone(this._previousAttributes)},_validate:function(a,b){if(!this.validate)return!0;var a=e.extend({},this.attributes,a),c=this.validate(a,b);if(!c)return!0;b&&b.error&&b.error(this,c,b);this.trigger("error",
		this,c,b);return!1}});var p=g.Collection=function(a,b){b||(b={});b.model&&(this.model=b.model);void 0!==b.comparator&&(this.comparator=b.comparator);this._reset();this.initialize.apply(this,arguments);a&&this.reset(a,e.extend({silent:!0},b))};e.extend(p.prototype,h,{model:o,initialize:function(){},toJSON:function(a){return this.map(function(b){return b.toJSON(a)})},sync:function(){return g.sync.apply(this,arguments)},add:function(a,b){var c,d,f,g,h=b&&b.at,i=null==(b&&b.sort)?!0:b.sort,a=e.isArray(a)?
		a.slice():[a];for(c=a.length-1;0<=c;c--)(d=this._prepareModel(a[c],b))?(a[c]=d,(f=null!=d.id&&this._byId[d.id])||this._byCid[d.cid]?(b&&(b.merge&&f)&&(f.set(d.attributes,b),g=i),a.splice(c,1)):(d.on("all",this._onModelEvent,this),this._byCid[d.cid]=d,null!=d.id&&(this._byId[d.id]=d))):(this.trigger("error",this,a[c],b),a.splice(c,1));a.length&&(g=i);this.length+=a.length;c=[null!=h?h:this.models.length,0];z.apply(c,a);A.apply(this.models,c);g&&(this.comparator&&null==h)&&this.sort({silent:!0});if(b&&
		b.silent)return this;for(;d=a.shift();)d.trigger("add",d,this,b);return this},remove:function(a,b){var c,d,f,g;b||(b={});a=e.isArray(a)?a.slice():[a];c=0;for(d=a.length;c<d;c++)if(g=this.get(a[c]))delete this._byId[g.id],delete this._byCid[g.cid],f=this.indexOf(g),this.models.splice(f,1),this.length--,b.silent||(b.index=f,g.trigger("remove",g,this,b)),this._removeReference(g);return this},push:function(a,b){a=this._prepareModel(a,b);this.add(a,e.extend({at:this.length},b));return a},pop:function(a){var b=
			                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            this.at(this.length-1);this.remove(b,a);return b},unshift:function(a,b){a=this._prepareModel(a,b);this.add(a,e.extend({at:0},b));return a},shift:function(a){var b=this.at(0);this.remove(b,a);return b},slice:function(a,b){return this.models.slice(a,b)},get:function(a){return null==a?void 0:this._byId[null!=a.id?a.id:a]||this._byCid[a.cid||a]},at:function(a){return this.models[a]},where:function(a){return e.isEmpty(a)?[]:this.filter(function(b){for(var c in a)if(a[c]!==b.get(c))return!1;return!0})},
		sort:function(a){if(!this.comparator)throw Error("Cannot sort a set without a comparator");e.isString(this.comparator)||1===this.comparator.length?this.models=this.sortBy(this.comparator,this):this.models.sort(e.bind(this.comparator,this));(!a||!a.silent)&&this.trigger("sort",this,a);return this},pluck:function(a){return e.invoke(this.models,"get",a)},update:function(a,b){var c,d,f,g,h=[],i=[],m={},j=this.model.prototype.idAttribute,b=e.extend({add:!0,merge:!0,remove:!0},b);b.parse&&(a=this.parse(a));
			e.isArray(a)||(a=a?[a]:[]);if(b.add&&!b.remove)return this.add(a,b);d=0;for(f=a.length;d<f;d++)c=a[d],g=this.get(c.id||c.cid||c[j]),b.remove&&g&&(m[g.cid]=!0),(b.add&&!g||b.merge&&g)&&h.push(c);if(b.remove){d=0;for(f=this.models.length;d<f;d++)c=this.models[d],m[c.cid]||i.push(c)}i.length&&this.remove(i,b);h.length&&this.add(h,b);return this},reset:function(a,b){b||(b={});b.parse&&(a=this.parse(a));for(var c=0,d=this.models.length;c<d;c++)this._removeReference(this.models[c]);b.previousModels=this.models;
			this._reset();a&&this.add(a,e.extend({silent:!0},b));b.silent||this.trigger("reset",this,b);return this},fetch:function(a){a=a?e.clone(a):{};void 0===a.parse&&(a.parse=!0);var b=this,c=a.success;a.success=function(d){b[a.update?"update":"reset"](d,a);c&&c(b,d,a)};return this.sync("read",this,a)},create:function(a,b){var c=this,b=b?e.clone(b):{},a=this._prepareModel(a,b);if(!a)return!1;b.wait||c.add(a,b);var d=b.success;b.success=function(a,b,e){e.wait&&c.add(a,e);d&&d(a,b,e)};a.save(null,b);return a},
		parse:function(a){return a},clone:function(){return new this.constructor(this.models)},chain:function(){return e(this.models).chain()},_reset:function(){this.length=0;this.models=[];this._byId={};this._byCid={}},_prepareModel:function(a,b){if(a instanceof o)return a.collection||(a.collection=this),a;b||(b={});b.collection=this;var c=new this.model(a,b);return!c._validate(a,b)?!1:c},_removeReference:function(a){this===a.collection&&delete a.collection;a.off("all",this._onModelEvent,this)},_onModelEvent:function(a,
		                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    b,c,d){("add"===a||"remove"===a)&&c!==this||("destroy"===a&&this.remove(b,d),b&&a==="change:"+b.idAttribute&&(delete this._byId[b.previous(b.idAttribute)],null!=b.id&&(this._byId[b.id]=b)),this.trigger.apply(this,arguments))}});e.each("forEach each map collect reduce foldl inject reduceRight foldr find detect filter select reject every all some any include contains invoke max min sortedIndex toArray size first head take initial rest tail last without indexOf shuffle lastIndexOf isEmpty".split(" "),
		function(a){p.prototype[a]=function(){var b=r.call(arguments);b.unshift(this.models);return e[a].apply(e,b)}});e.each(["groupBy","countBy","sortBy"],function(a){p.prototype[a]=function(b,c){var d=e.isFunction(b)?b:function(a){return a.get(b)};return e[a](this.models,d,c)}});var v=g.Router=function(a){a||(a={});a.routes&&(this.routes=a.routes);this._bindRoutes();this.initialize.apply(this,arguments)},B=/\((.*?)\)/g,C=/:\w+/g,D=/\*\w+/g,E=/[\-{}\[\]+?.,\\\^$|#\s]/g;e.extend(v.prototype,h,{initialize:function(){},
		route:function(a,b,c){e.isRegExp(a)||(a=this._routeToRegExp(a));c||(c=this[b]);g.history.route(a,e.bind(function(d){d=this._extractParameters(a,d);c&&c.apply(this,d);this.trigger.apply(this,["route:"+b].concat(d));g.history.trigger("route",this,b,d)},this));return this},navigate:function(a,b){g.history.navigate(a,b);return this},_bindRoutes:function(){if(this.routes)for(var a,b=e.keys(this.routes);null!=(a=b.pop());)this.route(a,this.routes[a])},_routeToRegExp:function(a){a=a.replace(E,"\\$&").replace(B,
			"(?:$1)?").replace(C,"([^/]+)").replace(D,"(.*?)");return RegExp("^"+a+"$")},_extractParameters:function(a,b){return a.exec(b).slice(1)}});var j=g.History=function(){this.handlers=[];e.bindAll(this,"checkUrl");"undefined"!==typeof window&&(this.location=window.location,this.history=window.history)},w=/^[#\/]|\s+$/g,F=/^\/+|\/+$/g,G=/msie [\w.]+/,H=/\/$/;j.started=!1;e.extend(j.prototype,h,{interval:50,getHash:function(a){return(a=(a||this).location.href.match(/#(.*)$/))?a[1]:""},getFragment:function(a,
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             b){if(null==a)if(this._hasPushState||!this._wantsHashChange||b){var a=this.location.pathname,c=this.root.replace(H,"");a.indexOf(c)||(a=a.substr(c.length))}else a=this.getHash();return a.replace(w,"")},start:function(a){if(j.started)throw Error("Backbone.history has already been started");j.started=!0;this.options=e.extend({},{root:"/"},this.options,a);this.root=this.options.root;this._wantsHashChange=!1!==this.options.hashChange;this._wantsPushState=!!this.options.pushState;this._hasPushState=!(!this.options.pushState||
	!this.history||!this.history.pushState);var a=this.getFragment(),b=document.documentMode,b=G.exec(navigator.userAgent.toLowerCase())&&(!b||7>=b);this.root=("/"+this.root+"/").replace(F,"/");b&&this._wantsHashChange&&(this.iframe=g.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,this.navigate(a));this._hasPushState?g.$(window).bind("popstate",this.checkUrl):this._wantsHashChange&&"onhashchange"in window&&!b?g.$(window).bind("hashchange",this.checkUrl):this._wantsHashChange&&
		(this._checkUrlInterval=setInterval(this.checkUrl,this.interval));this.fragment=a;a=this.location;b=a.pathname.replace(/[^\/]$/,"$&/")===this.root;if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!b)return this.fragment=this.getFragment(null,!0),this.location.replace(this.root+this.location.search+"#"+this.fragment),!0;this._wantsPushState&&(this._hasPushState&&b&&a.hash)&&(this.fragment=this.getHash().replace(w,""),this.history.replaceState({},document.title,this.root+this.fragment+
		a.search));if(!this.options.silent)return this.loadUrl()},stop:function(){g.$(window).unbind("popstate",this.checkUrl).unbind("hashchange",this.checkUrl);clearInterval(this._checkUrlInterval);j.started=!1},route:function(a,b){this.handlers.unshift({route:a,callback:b})},checkUrl:function(){var a=this.getFragment();a===this.fragment&&this.iframe&&(a=this.getFragment(this.getHash(this.iframe)));if(a===this.fragment)return!1;this.iframe&&this.navigate(a);this.loadUrl()||this.loadUrl(this.getHash())},
		loadUrl:function(a){var b=this.fragment=this.getFragment(a);return e.any(this.handlers,function(a){if(a.route.test(b))return a.callback(b),!0})},navigate:function(a,b){if(!j.started)return!1;if(!b||!0===b)b={trigger:b};a=this.getFragment(a||"");if(this.fragment!==a){this.fragment=a;var c=this.root+a;if(this._hasPushState)this.history[b.replace?"replaceState":"pushState"]({},document.title,c);else if(this._wantsHashChange)this._updateHash(this.location,a,b.replace),this.iframe&&a!==this.getFragment(this.getHash(this.iframe))&&
		(b.replace||this.iframe.document.open().close(),this._updateHash(this.iframe.location,a,b.replace));else return this.location.assign(c);b.trigger&&this.loadUrl(a)}},_updateHash:function(a,b,c){c?(c=a.href.replace(/(javascript:|#).*$/,""),a.replace(c+"#"+b)):a.hash="#"+b}});g.history=new j;var x=g.View=function(a){this.cid=e.uniqueId("view");this._configure(a||{});this._ensureElement();this.initialize.apply(this,arguments);this.delegateEvents()},I=/^(\S+)\s*(.*)$/,J="model collection el id attributes className tagName events".split(" ");
		e.extend(x.prototype,h,{tagName:"div",$:function(a){return this.$el.find(a)},initialize:function(){},render:function(){return this},remove:function(){this.$el.remove();this.stopListening();return this},make:function(a,b,c){a=document.createElement(a);b&&g.$(a).attr(b);null!=c&&g.$(a).html(c);return a},setElement:function(a,b){this.$el&&this.undelegateEvents();this.$el=a instanceof g.$?a:g.$(a);this.el=this.$el[0];!1!==b&&this.delegateEvents();return this},delegateEvents:function(a){if(a||(a=e.result(this,
				"events"))){this.undelegateEvents();for(var b in a){var c=a[b];e.isFunction(c)||(c=this[a[b]]);if(!c)throw Error('Method "'+a[b]+'" does not exist');var d=b.match(I),f=d[1],d=d[2],c=e.bind(c,this),f=f+(".delegateEvents"+this.cid);""===d?this.$el.bind(f,c):this.$el.delegate(d,f,c)}}},undelegateEvents:function(){this.$el.unbind(".delegateEvents"+this.cid)},_configure:function(a){this.options&&(a=e.extend({},e.result(this,"options"),a));e.extend(this,e.pick(a,J));this.options=a},_ensureElement:function(){if(this.el)this.setElement(e.result(this,
			"el"),!1);else{var a=e.extend({},e.result(this,"attributes"));this.id&&(a.id=e.result(this,"id"));this.className&&(a["class"]=e.result(this,"className"));this.setElement(this.make(e.result(this,"tagName"),a),!1)}}});var K={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};g.sync=function(a,b,c){var d=K[a];e.defaults(c||(c={}),{emulateHTTP:g.emulateHTTP,emulateJSON:g.emulateJSON});var f={type:d,dataType:"json"};c.url||(f.url=e.result(b,"url")||u());if(null==c.data&&b&&("create"===
			a||"update"===a||"patch"===a))f.contentType="application/json",f.data=JSON.stringify(c.attrs||b.toJSON(c));c.emulateJSON&&(f.contentType="application/x-www-form-urlencoded",f.data=f.data?{model:f.data}:{});if(c.emulateHTTP&&("PUT"===d||"DELETE"===d||"PATCH"===d)){f.type="POST";c.emulateJSON&&(f.data._method=d);var h=c.beforeSend;c.beforeSend=function(a){a.setRequestHeader("X-HTTP-Method-Override",d);if(h)return h.apply(this,arguments)}}"GET"!==f.type&&!c.emulateJSON&&(f.processData=!1);var j=c.success;
			c.success=function(a,d,e){j&&j(a,d,e);b.trigger("sync",b,a,c)};var i=c.error;c.error=function(a){i&&i(b,a,c);b.trigger("error",b,a,c)};a=g.ajax(e.extend(f,c));b.trigger("request",b,a,c);return a};g.ajax=function(){return g.$.ajax.apply(g.$,arguments)};o.extend=p.extend=v.extend=x.extend=j.extend=function(a,b){var c=this,d;d=a&&e.has(a,"constructor")?a.constructor:function(){c.apply(this,arguments)};e.extend(d,c,b);var f=function(){this.constructor=d};f.prototype=c.prototype;d.prototype=new f;a&&e.extend(d.prototype,
			a);d.__super__=c.prototype;return d};var u=function(){throw Error('A "url" property or function must be specified');}}).call(this);
	console.log('ending parsing backbone-min.js');
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/handlebars/2.0.0/handlebars.runtime.min.js

/*!

 handlebars v2.0.0

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
!function(a,b){"function"==typeof define&&define.amd?define([],b):"object"==typeof exports?module.exports=b():a.Handlebars=a.Handlebars||b()}(this,function(){var a=function(){"use strict";function a(a){this.string=a}var b;return a.prototype.toString=function(){return""+this.string},b=a}(),b=function(a){"use strict";function b(a){return i[a]}function c(a){for(var b=1;b<arguments.length;b++)for(var c in arguments[b])Object.prototype.hasOwnProperty.call(arguments[b],c)&&(a[c]=arguments[b][c]);return a}function d(a){return a instanceof h?a.toString():null==a?"":a?(a=""+a,k.test(a)?a.replace(j,b):a):a+""}function e(a){return a||0===a?n(a)&&0===a.length?!0:!1:!0}function f(a,b){return(a?a+".":"")+b}var g={},h=a,i={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},j=/[&<>"'`]/g,k=/[&<>"'`]/;g.extend=c;var l=Object.prototype.toString;g.toString=l;var m=function(a){return"function"==typeof a};m(/x/)&&(m=function(a){return"function"==typeof a&&"[object Function]"===l.call(a)});var m;g.isFunction=m;var n=Array.isArray||function(a){return a&&"object"==typeof a?"[object Array]"===l.call(a):!1};return g.isArray=n,g.escapeExpression=d,g.isEmpty=e,g.appendContextPath=f,g}(a),c=function(){"use strict";function a(a,b){var d;b&&b.firstLine&&(d=b.firstLine,a+=" - "+d+":"+b.firstColumn);for(var e=Error.prototype.constructor.call(this,a),f=0;f<c.length;f++)this[c[f]]=e[c[f]];d&&(this.lineNumber=d,this.column=b.firstColumn)}var b,c=["description","fileName","lineNumber","message","name","number","stack"];return a.prototype=new Error,b=a}(),d=function(a,b){"use strict";function c(a,b){this.helpers=a||{},this.partials=b||{},d(this)}function d(a){a.registerHelper("helperMissing",function(){if(1===arguments.length)return void 0;throw new g("Missing helper: '"+arguments[arguments.length-1].name+"'")}),a.registerHelper("blockHelperMissing",function(b,c){var d=c.inverse,e=c.fn;if(b===!0)return e(this);if(b===!1||null==b)return d(this);if(k(b))return b.length>0?(c.ids&&(c.ids=[c.name]),a.helpers.each(b,c)):d(this);if(c.data&&c.ids){var g=q(c.data);g.contextPath=f.appendContextPath(c.data.contextPath,c.name),c={data:g}}return e(b,c)}),a.registerHelper("each",function(a,b){if(!b)throw new g("Must pass iterator to #each");var c,d,e=b.fn,h=b.inverse,i=0,j="";if(b.data&&b.ids&&(d=f.appendContextPath(b.data.contextPath,b.ids[0])+"."),l(a)&&(a=a.call(this)),b.data&&(c=q(b.data)),a&&"object"==typeof a)if(k(a))for(var m=a.length;m>i;i++)c&&(c.index=i,c.first=0===i,c.last=i===a.length-1,d&&(c.contextPath=d+i)),j+=e(a[i],{data:c});else for(var n in a)a.hasOwnProperty(n)&&(c&&(c.key=n,c.index=i,c.first=0===i,d&&(c.contextPath=d+n)),j+=e(a[n],{data:c}),i++);return 0===i&&(j=h(this)),j}),a.registerHelper("if",function(a,b){return l(a)&&(a=a.call(this)),!b.hash.includeZero&&!a||f.isEmpty(a)?b.inverse(this):b.fn(this)}),a.registerHelper("unless",function(b,c){return a.helpers["if"].call(this,b,{fn:c.inverse,inverse:c.fn,hash:c.hash})}),a.registerHelper("with",function(a,b){l(a)&&(a=a.call(this));var c=b.fn;if(f.isEmpty(a))return b.inverse(this);if(b.data&&b.ids){var d=q(b.data);d.contextPath=f.appendContextPath(b.data.contextPath,b.ids[0]),b={data:d}}return c(a,b)}),a.registerHelper("log",function(b,c){var d=c.data&&null!=c.data.level?parseInt(c.data.level,10):1;a.log(d,b)}),a.registerHelper("lookup",function(a,b){return a&&a[b]})}var e={},f=a,g=b,h="2.0.0";e.VERSION=h;var i=6;e.COMPILER_REVISION=i;var j={1:"<= 1.0.rc.2",2:"== 1.0.0-rc.3",3:"== 1.0.0-rc.4",4:"== 1.x.x",5:"== 2.0.0-alpha.x",6:">= 2.0.0-beta.1"};e.REVISION_CHANGES=j;var k=f.isArray,l=f.isFunction,m=f.toString,n="[object Object]";e.HandlebarsEnvironment=c,c.prototype={constructor:c,logger:o,log:p,registerHelper:function(a,b){if(m.call(a)===n){if(b)throw new g("Arg not supported with multiple helpers");f.extend(this.helpers,a)}else this.helpers[a]=b},unregisterHelper:function(a){delete this.helpers[a]},registerPartial:function(a,b){m.call(a)===n?f.extend(this.partials,a):this.partials[a]=b},unregisterPartial:function(a){delete this.partials[a]}};var o={methodMap:{0:"debug",1:"info",2:"warn",3:"error"},DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,log:function(a,b){if(o.level<=a){var c=o.methodMap[a];"undefined"!=typeof console&&console[c]&&console[c].call(console,b)}}};e.logger=o;var p=o.log;e.log=p;var q=function(a){var b=f.extend({},a);return b._parent=a,b};return e.createFrame=q,e}(b,c),e=function(a,b,c){"use strict";function d(a){var b=a&&a[0]||1,c=m;if(b!==c){if(c>b){var d=n[c],e=n[b];throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+d+") or downgrade your runtime to an older version ("+e+").")}throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+a[1]+").")}}function e(a,b){if(!b)throw new l("No environment passed to template");if(!a||!a.main)throw new l("Unknown template object: "+typeof a);b.VM.checkRevision(a.compiler);var c=function(c,d,e,f,g,h,i,j,m){g&&(f=k.extend({},f,g));var n=b.VM.invokePartial.call(this,c,e,f,h,i,j,m);if(null==n&&b.compile){var o={helpers:h,partials:i,data:j,depths:m};i[e]=b.compile(c,{data:void 0!==j,compat:a.compat},b),n=i[e](f,o)}if(null!=n){if(d){for(var p=n.split("\n"),q=0,r=p.length;r>q&&(p[q]||q+1!==r);q++)p[q]=d+p[q];n=p.join("\n")}return n}throw new l("The partial "+e+" could not be compiled when running in runtime-only mode")},d={lookup:function(a,b){for(var c=a.length,d=0;c>d;d++)if(a[d]&&null!=a[d][b])return a[d][b]},lambda:function(a,b){return"function"==typeof a?a.call(b):a},escapeExpression:k.escapeExpression,invokePartial:c,fn:function(b){return a[b]},programs:[],program:function(a,b,c){var d=this.programs[a],e=this.fn(a);return b||c?d=f(this,a,e,b,c):d||(d=this.programs[a]=f(this,a,e)),d},data:function(a,b){for(;a&&b--;)a=a._parent;return a},merge:function(a,b){var c=a||b;return a&&b&&a!==b&&(c=k.extend({},b,a)),c},noop:b.VM.noop,compilerInfo:a.compiler},e=function(b,c){c=c||{};var f=c.data;e._setup(c),!c.partial&&a.useData&&(f=i(b,f));var g;return a.useDepths&&(g=c.depths?[b].concat(c.depths):[b]),a.main.call(d,b,d.helpers,d.partials,f,g)};return e.isTop=!0,e._setup=function(c){c.partial?(d.helpers=c.helpers,d.partials=c.partials):(d.helpers=d.merge(c.helpers,b.helpers),a.usePartial&&(d.partials=d.merge(c.partials,b.partials)))},e._child=function(b,c,e){if(a.useDepths&&!e)throw new l("must pass parent depths");return f(d,b,a[b],c,e)},e}function f(a,b,c,d,e){var f=function(b,f){return f=f||{},c.call(a,b,a.helpers,a.partials,f.data||d,e&&[b].concat(e))};return f.program=b,f.depth=e?e.length:0,f}function g(a,b,c,d,e,f,g){var h={partial:!0,helpers:d,partials:e,data:f,depths:g};if(void 0===a)throw new l("The partial "+b+" could not be found");return a instanceof Function?a(c,h):void 0}function h(){return""}function i(a,b){return b&&"root"in b||(b=b?o(b):{},b.root=a),b}var j={},k=a,l=b,m=c.COMPILER_REVISION,n=c.REVISION_CHANGES,o=c.createFrame;return j.checkRevision=d,j.template=e,j.program=f,j.invokePartial=g,j.noop=h,j}(b,c,d),f=function(a,b,c,d,e){"use strict";var f,g=a,h=b,i=c,j=d,k=e,l=function(){var a=new g.HandlebarsEnvironment;return j.extend(a,g),a.SafeString=h,a.Exception=i,a.Utils=j,a.escapeExpression=j.escapeExpression,a.VM=k,a.template=function(b){return k.template(b,a)},a},m=l();return m.create=l,m["default"]=m,f=m}(d,a,c,b,e);return f});

//! Source: vendor/jquery-ui/jquery-ui.js

try{
	/*! jQuery UI - v1.12.1 - 2017-05-17
* http://jqueryui.com
* Includes: widget.js, position.js, data.js, disable-selection.js, focusable.js, form-reset-mixin.js, keycode.js, labels.js, scroll-parent.js, tabbable.js, unique-id.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

	(function( factory ) {
		if ( typeof define === "function" && define.amd ) {

			// AMD. Register as an anonymous module.
			define([ "jquery" ], factory );
		} else {

			// Browser globals
			factory( jQuery );
		}
	}(function( $ ) {

		$.ui = $.ui || {};

		var version = $.ui.version = "1.12.1";


		/*!
 * jQuery UI Widget 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/



		var widgetUuid = 0;
		var widgetSlice = Array.prototype.slice;

		$.cleanData = ( function( orig ) {
			return function( elems ) {
				var events, elem, i;
				for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
					try {

						// Only trigger remove when necessary to save time
						events = $._data( elem, "events" );
						if ( events && events.remove ) {
							$( elem ).triggerHandler( "remove" );
						}

						// Http://bugs.jquery.com/ticket/8235
					} catch ( e ) {}
				}
				orig( elems );
			};
		} )( $.cleanData );

		$.widget = function( name, base, prototype ) {
			var existingConstructor, constructor, basePrototype;

			// ProxiedPrototype allows the provided prototype to remain unmodified
			// so that it can be used as a mixin for multiple widgets (#8876)
			var proxiedPrototype = {};

			var namespace = name.split( "." )[ 0 ];
			name = name.split( "." )[ 1 ];
			var fullName = namespace + "-" + name;

			if ( !prototype ) {
				prototype = base;
				base = $.Widget;
			}

			if ( $.isArray( prototype ) ) {
				prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
			}

			// Create selector for plugin
			$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
				return !!$.data( elem, fullName );
			};

			$[ namespace ] = $[ namespace ] || {};
			existingConstructor = $[ namespace ][ name ];
			constructor = $[ namespace ][ name ] = function( options, element ) {

				// Allow instantiation without "new" keyword
				if ( !this._createWidget ) {
					return new constructor( options, element );
				}

				// Allow instantiation without initializing for simple inheritance
				// must use "new" keyword (the code above always passes args)
				if ( arguments.length ) {
					this._createWidget( options, element );
				}
			};

			// Extend with the existing constructor to carry over any static properties
			$.extend( constructor, existingConstructor, {
				version: prototype.version,

				// Copy the object used to create the prototype in case we need to
				// redefine the widget later
				_proto: $.extend( {}, prototype ),

				// Track widgets that inherit from this widget in case this widget is
				// redefined after a widget inherits from it
				_childConstructors: []
			} );

			basePrototype = new base();

			// We need to make the options hash a property directly on the new instance
			// otherwise we'll modify the options hash on the prototype that we're
			// inheriting from
			basePrototype.options = $.widget.extend( {}, basePrototype.options );
			$.each( prototype, function( prop, value ) {
				if ( !$.isFunction( value ) ) {
					proxiedPrototype[ prop ] = value;
					return;
				}
				proxiedPrototype[ prop ] = ( function() {
					function _super() {
						return base.prototype[ prop ].apply( this, arguments );
					}

					function _superApply( args ) {
						return base.prototype[ prop ].apply( this, args );
					}

					return function() {
						var __super = this._super;
						var __superApply = this._superApply;
						var returnValue;

						this._super = _super;
						this._superApply = _superApply;

						returnValue = value.apply( this, arguments );

						this._super = __super;
						this._superApply = __superApply;

						return returnValue;
					};
				} )();
			} );
			constructor.prototype = $.widget.extend( basePrototype, {

				// TODO: remove support for widgetEventPrefix
				// always use the name + a colon as the prefix, e.g., draggable:start
				// don't prefix for widgets that aren't DOM-based
				widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
			}, proxiedPrototype, {
				constructor: constructor,
				namespace: namespace,
				widgetName: name,
				widgetFullName: fullName
			} );

			// If this widget is being redefined then we need to find all widgets that
			// are inheriting from it and redefine all of them so that they inherit from
			// the new version of this widget. We're essentially trying to replace one
			// level in the prototype chain.
			if ( existingConstructor ) {
				$.each( existingConstructor._childConstructors, function( i, child ) {
					var childPrototype = child.prototype;

					// Redefine the child widget using the same prototype that was
					// originally used, but inherit from the new version of the base
					$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
						child._proto );
				} );

				// Remove the list of existing child constructors from the old constructor
				// so the old child constructors can be garbage collected
				delete existingConstructor._childConstructors;
			} else {
				base._childConstructors.push( constructor );
			}

			$.widget.bridge( name, constructor );

			return constructor;
		};

		$.widget.extend = function( target ) {
			var input = widgetSlice.call( arguments, 1 );
			var inputIndex = 0;
			var inputLength = input.length;
			var key;
			var value;

			for ( ; inputIndex < inputLength; inputIndex++ ) {
				for ( key in input[ inputIndex ] ) {
					value = input[ inputIndex ][ key ];
					if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

						// Clone objects
						if ( $.isPlainObject( value ) ) {
							target[ key ] = $.isPlainObject( target[ key ] ) ?
								$.widget.extend( {}, target[ key ], value ) :

								// Don't extend strings, arrays, etc. with objects
								$.widget.extend( {}, value );

							// Copy everything else by reference
						} else {
							target[ key ] = value;
						}
					}
				}
			}
			return target;
		};

		$.widget.bridge = function( name, object ) {
			var fullName = object.prototype.widgetFullName || name;
			$.fn[ name ] = function( options ) {
				var isMethodCall = typeof options === "string";
				var args = widgetSlice.call( arguments, 1 );
				var returnValue = this;

				if ( isMethodCall ) {

					// If this is an empty collection, we need to have the instance method
					// return undefined instead of the jQuery instance
					if ( !this.length && options === "instance" ) {
						returnValue = undefined;
					} else {
						this.each( function() {
							var methodValue;
							var instance = $.data( this, fullName );

							if ( options === "instance" ) {
								returnValue = instance;
								return false;
							}

							if ( !instance ) {
								return $.error( "cannot call methods on " + name +
									" prior to initialization; " +
									"attempted to call method '" + options + "'" );
							}

							if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
								return $.error( "no such method '" + options + "' for " + name +
									" widget instance" );
							}

							methodValue = instance[ options ].apply( instance, args );

							if ( methodValue !== instance && methodValue !== undefined ) {
								returnValue = methodValue && methodValue.jquery ?
									returnValue.pushStack( methodValue.get() ) :
									methodValue;
								return false;
							}
						} );
					}
				} else {

					// Allow multiple hashes to be passed on init
					if ( args.length ) {
						options = $.widget.extend.apply( null, [ options ].concat( args ) );
					}

					this.each( function() {
						var instance = $.data( this, fullName );
						if ( instance ) {
							instance.option( options || {} );
							if ( instance._init ) {
								instance._init();
							}
						} else {
							$.data( this, fullName, new object( options, this ) );
						}
					} );
				}

				return returnValue;
			};
		};

		$.Widget = function( /* options, element */ ) {};
		$.Widget._childConstructors = [];

		$.Widget.prototype = {
			widgetName: "widget",
			widgetEventPrefix: "",
			defaultElement: "<div>",

			options: {
				classes: {},
				disabled: false,

				// Callbacks
				create: null
			},

			_createWidget: function( options, element ) {
				element = $( element || this.defaultElement || this )[ 0 ];
				this.element = $( element );
				this.uuid = widgetUuid++;
				this.eventNamespace = "." + this.widgetName + this.uuid;

				this.bindings = $();
				this.hoverable = $();
				this.focusable = $();
				this.classesElementLookup = {};

				if ( element !== this ) {
					$.data( element, this.widgetFullName, this );
					this._on( true, this.element, {
						remove: function( event ) {
							if ( event.target === element ) {
								this.destroy();
							}
						}
					} );
					this.document = $( element.style ?

						// Element within the document
						element.ownerDocument :

						// Element is window or document
						element.document || element );
					this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
				}

				this.options = $.widget.extend( {},
					this.options,
					this._getCreateOptions(),
					options );

				this._create();

				if ( this.options.disabled ) {
					this._setOptionDisabled( this.options.disabled );
				}

				this._trigger( "create", null, this._getCreateEventData() );
				this._init();
			},

			_getCreateOptions: function() {
				return {};
			},

			_getCreateEventData: $.noop,

			_create: $.noop,

			_init: $.noop,

			destroy: function() {
				var that = this;

				this._destroy();
				$.each( this.classesElementLookup, function( key, value ) {
					that._removeClass( value, key );
				} );

				// We can probably remove the unbind calls in 2.0
				// all event bindings should go through this._on()
				this.element
					.off( this.eventNamespace )
					.removeData( this.widgetFullName );
				this.widget()
					.off( this.eventNamespace )
					.removeAttr( "aria-disabled" );

				// Clean up events and states
				this.bindings.off( this.eventNamespace );
			},

			_destroy: $.noop,

			widget: function() {
				return this.element;
			},

			option: function( key, value ) {
				var options = key;
				var parts;
				var curOption;
				var i;

				if ( arguments.length === 0 ) {

					// Don't return a reference to the internal hash
					return $.widget.extend( {}, this.options );
				}

				if ( typeof key === "string" ) {

					// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
					options = {};
					parts = key.split( "." );
					key = parts.shift();
					if ( parts.length ) {
						curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
						for ( i = 0; i < parts.length - 1; i++ ) {
							curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
							curOption = curOption[ parts[ i ] ];
						}
						key = parts.pop();
						if ( arguments.length === 1 ) {
							return curOption[ key ] === undefined ? null : curOption[ key ];
						}
						curOption[ key ] = value;
					} else {
						if ( arguments.length === 1 ) {
							return this.options[ key ] === undefined ? null : this.options[ key ];
						}
						options[ key ] = value;
					}
				}

				this._setOptions( options );

				return this;
			},

			_setOptions: function( options ) {
				var key;

				for ( key in options ) {
					this._setOption( key, options[ key ] );
				}

				return this;
			},

			_setOption: function( key, value ) {
				if ( key === "classes" ) {
					this._setOptionClasses( value );
				}

				this.options[ key ] = value;

				if ( key === "disabled" ) {
					this._setOptionDisabled( value );
				}

				return this;
			},

			_setOptionClasses: function( value ) {
				var classKey, elements, currentElements;

				for ( classKey in value ) {
					currentElements = this.classesElementLookup[ classKey ];
					if ( value[ classKey ] === this.options.classes[ classKey ] ||
						!currentElements ||
						!currentElements.length ) {
						continue;
					}

					// We are doing this to create a new jQuery object because the _removeClass() call
					// on the next line is going to destroy the reference to the current elements being
					// tracked. We need to save a copy of this collection so that we can add the new classes
					// below.
					elements = $( currentElements.get() );
					this._removeClass( currentElements, classKey );

					// We don't use _addClass() here, because that uses this.options.classes
					// for generating the string of classes. We want to use the value passed in from
					// _setOption(), this is the new value of the classes option which was passed to
					// _setOption(). We pass this value directly to _classes().
					elements.addClass( this._classes( {
						element: elements,
						keys: classKey,
						classes: value,
						add: true
					} ) );
				}
			},

			_setOptionDisabled: function( value ) {
				this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

				// If the widget is becoming disabled, then nothing is interactive
				if ( value ) {
					this._removeClass( this.hoverable, null, "ui-state-hover" );
					this._removeClass( this.focusable, null, "ui-state-focus" );
				}
			},

			enable: function() {
				return this._setOptions( { disabled: false } );
			},

			disable: function() {
				return this._setOptions( { disabled: true } );
			},

			_classes: function( options ) {
				var full = [];
				var that = this;

				options = $.extend( {
					element: this.element,
					classes: this.options.classes || {}
				}, options );

				function processClassString( classes, checkOption ) {
					var current, i;
					for ( i = 0; i < classes.length; i++ ) {
						current = that.classesElementLookup[ classes[ i ] ] || $();
						if ( options.add ) {
							current = $( $.unique( current.get().concat( options.element.get() ) ) );
						} else {
							current = $( current.not( options.element ).get() );
						}
						that.classesElementLookup[ classes[ i ] ] = current;
						full.push( classes[ i ] );
						if ( checkOption && options.classes[ classes[ i ] ] ) {
							full.push( options.classes[ classes[ i ] ] );
						}
					}
				}

				this._on( options.element, {
					"remove": "_untrackClassesElement"
				} );

				if ( options.keys ) {
					processClassString( options.keys.match( /\S+/g ) || [], true );
				}
				if ( options.extra ) {
					processClassString( options.extra.match( /\S+/g ) || [] );
				}

				return full.join( " " );
			},

			_untrackClassesElement: function( event ) {
				var that = this;
				$.each( that.classesElementLookup, function( key, value ) {
					if ( $.inArray( event.target, value ) !== -1 ) {
						that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
					}
				} );
			},

			_removeClass: function( element, keys, extra ) {
				return this._toggleClass( element, keys, extra, false );
			},

			_addClass: function( element, keys, extra ) {
				return this._toggleClass( element, keys, extra, true );
			},

			_toggleClass: function( element, keys, extra, add ) {
				add = ( typeof add === "boolean" ) ? add : extra;
				var shift = ( typeof element === "string" || element === null ),
				    options = {
					    extra: shift ? keys : extra,
					    keys: shift ? element : keys,
					    element: shift ? this.element : element,
					    add: add
				    };
				options.element.toggleClass( this._classes( options ), add );
				return this;
			},

			_on: function( suppressDisabledCheck, element, handlers ) {
				var delegateElement;
				var instance = this;

				// No suppressDisabledCheck flag, shuffle arguments
				if ( typeof suppressDisabledCheck !== "boolean" ) {
					handlers = element;
					element = suppressDisabledCheck;
					suppressDisabledCheck = false;
				}

				// No element argument, shuffle and use this.element
				if ( !handlers ) {
					handlers = element;
					element = this.element;
					delegateElement = this.widget();
				} else {
					element = delegateElement = $( element );
					this.bindings = this.bindings.add( element );
				}

				$.each( handlers, function( event, handler ) {
					function handlerProxy() {

						// Allow widgets to customize the disabled handling
						// - disabled as an array instead of boolean
						// - disabled class as method for disabling individual parts
						if ( !suppressDisabledCheck &&
							( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
							return;
						}
						return ( typeof handler === "string" ? instance[ handler ] : handler )
							.apply( instance, arguments );
					}

					// Copy the guid so direct unbinding works
					if ( typeof handler !== "string" ) {
						handlerProxy.guid = handler.guid =
							handler.guid || handlerProxy.guid || $.guid++;
					}

					var match = event.match( /^([\w:-]*)\s*(.*)$/ );
					var eventName = match[ 1 ] + instance.eventNamespace;
					var selector = match[ 2 ];

					if ( selector ) {
						delegateElement.on( eventName, selector, handlerProxy );
					} else {
						element.on( eventName, handlerProxy );
					}
				} );
			},

			_off: function( element, eventName ) {
				eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
					this.eventNamespace;
				element.off( eventName ).off( eventName );

				// Clear the stack to avoid memory leaks (#10056)
				this.bindings = $( this.bindings.not( element ).get() );
				this.focusable = $( this.focusable.not( element ).get() );
				this.hoverable = $( this.hoverable.not( element ).get() );
			},

			_delay: function( handler, delay ) {
				function handlerProxy() {
					return ( typeof handler === "string" ? instance[ handler ] : handler )
						.apply( instance, arguments );
				}
				var instance = this;
				return setTimeout( handlerProxy, delay || 0 );
			},

			_hoverable: function( element ) {
				this.hoverable = this.hoverable.add( element );
				this._on( element, {
					mouseenter: function( event ) {
						this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
					},
					mouseleave: function( event ) {
						this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
					}
				} );
			},

			_focusable: function( element ) {
				this.focusable = this.focusable.add( element );
				this._on( element, {
					focusin: function( event ) {
						this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
					},
					focusout: function( event ) {
						this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
					}
				} );
			},

			_trigger: function( type, event, data ) {
				var prop, orig;
				var callback = this.options[ type ];

				data = data || {};
				event = $.Event( event );
				event.type = ( type === this.widgetEventPrefix ?
					type :
					this.widgetEventPrefix + type ).toLowerCase();

				// The original event may come from any element
				// so we need to reset the target on the new event
				event.target = this.element[ 0 ];

				// Copy original event properties over to the new event
				orig = event.originalEvent;
				if ( orig ) {
					for ( prop in orig ) {
						if ( !( prop in event ) ) {
							event[ prop ] = orig[ prop ];
						}
					}
				}

				this.element.trigger( event, data );
				return !( $.isFunction( callback ) &&
				callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
				event.isDefaultPrevented() );
			}
		};

		$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
			$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
				if ( typeof options === "string" ) {
					options = { effect: options };
				}

				var hasOptions;
				var effectName = !options ?
					method :
					options === true || typeof options === "number" ?
						defaultEffect :
						options.effect || defaultEffect;

				options = options || {};
				if ( typeof options === "number" ) {
					options = { duration: options };
				}

				hasOptions = !$.isEmptyObject( options );
				options.complete = callback;

				if ( options.delay ) {
					element.delay( options.delay );
				}

				if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
					element[ method ]( options );
				} else if ( effectName !== method && element[ effectName ] ) {
					element[ effectName ]( options.duration, options.easing, callback );
				} else {
					element.queue( function( next ) {
						$( this )[ method ]();
						if ( callback ) {
							callback.call( element[ 0 ] );
						}
						next();
					} );
				}
			};
		} );

		var widget = $.widget;


		/*!
 * jQuery UI Position 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/


		( function() {
			var cachedScrollbarWidth,
			    max = Math.max,
			    abs = Math.abs,
			    rhorizontal = /left|center|right/,
			    rvertical = /top|center|bottom/,
			    roffset = /[\+\-]\d+(\.[\d]+)?%?/,
			    rposition = /^\w+/,
			    rpercent = /%$/,
			    _position = $.fn.position;

			function getOffsets( offsets, width, height ) {
				return [
					parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
					parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
				];
			}

			function parseCss( element, property ) {
				return parseInt( $.css( element, property ), 10 ) || 0;
			}

			function getDimensions( elem ) {
				var raw = elem[ 0 ];
				if ( raw.nodeType === 9 ) {
					return {
						width: elem.width(),
						height: elem.height(),
						offset: { top: 0, left: 0 }
					};
				}
				if ( $.isWindow( raw ) ) {
					return {
						width: elem.width(),
						height: elem.height(),
						offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
					};
				}
				if ( raw.preventDefault ) {
					return {
						width: 0,
						height: 0,
						offset: { top: raw.pageY, left: raw.pageX }
					};
				}
				return {
					width: elem.outerWidth(),
					height: elem.outerHeight(),
					offset: elem.offset()
				};
			}

			$.position = {
				scrollbarWidth: function() {
					if ( cachedScrollbarWidth !== undefined ) {
						return cachedScrollbarWidth;
					}
					var w1, w2,
					    div = $( "<div " +
						    "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
						    "<div style='height:100px;width:auto;'></div></div>" ),
					    innerDiv = div.children()[ 0 ];

					$( "body" ).append( div );
					w1 = innerDiv.offsetWidth;
					div.css( "overflow", "scroll" );

					w2 = innerDiv.offsetWidth;

					if ( w1 === w2 ) {
						w2 = div[ 0 ].clientWidth;
					}

					div.remove();

					return ( cachedScrollbarWidth = w1 - w2 );
				},
				getScrollInfo: function( within ) {
					var overflowX = within.isWindow || within.isDocument ? "" :
						    within.element.css( "overflow-x" ),
					    overflowY = within.isWindow || within.isDocument ? "" :
						    within.element.css( "overflow-y" ),
					    hasOverflowX = overflowX === "scroll" ||
						    ( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
					    hasOverflowY = overflowY === "scroll" ||
						    ( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
					return {
						width: hasOverflowY ? $.position.scrollbarWidth() : 0,
						height: hasOverflowX ? $.position.scrollbarWidth() : 0
					};
				},
				getWithinInfo: function( element ) {
					var withinElement = $( element || window ),
					    isWindow = $.isWindow( withinElement[ 0 ] ),
					    isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
					    hasOffset = !isWindow && !isDocument;
					return {
						element: withinElement,
						isWindow: isWindow,
						isDocument: isDocument,
						offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
						scrollLeft: withinElement.scrollLeft(),
						scrollTop: withinElement.scrollTop(),
						width: withinElement.outerWidth(),
						height: withinElement.outerHeight()
					};
				}
			};

			$.fn.position = function( options ) {
				if ( !options || !options.of ) {
					return _position.apply( this, arguments );
				}

				// Make a copy, we don't want to modify arguments
				options = $.extend( {}, options );

				var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
				    target = $( options.of ),
				    within = $.position.getWithinInfo( options.within ),
				    scrollInfo = $.position.getScrollInfo( within ),
				    collision = ( options.collision || "flip" ).split( " " ),
				    offsets = {};

				dimensions = getDimensions( target );
				if ( target[ 0 ].preventDefault ) {

					// Force left top to allow flipping
					options.at = "left top";
				}
				targetWidth = dimensions.width;
				targetHeight = dimensions.height;
				targetOffset = dimensions.offset;

				// Clone to reuse original targetOffset later
				basePosition = $.extend( {}, targetOffset );

				// Force my and at to have valid horizontal and vertical positions
				// if a value is missing or invalid, it will be converted to center
				$.each( [ "my", "at" ], function() {
					var pos = ( options[ this ] || "" ).split( " " ),
					    horizontalOffset,
					    verticalOffset;

					if ( pos.length === 1 ) {
						pos = rhorizontal.test( pos[ 0 ] ) ?
							pos.concat( [ "center" ] ) :
							rvertical.test( pos[ 0 ] ) ?
								[ "center" ].concat( pos ) :
								[ "center", "center" ];
					}
					pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
					pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

					// Calculate offsets
					horizontalOffset = roffset.exec( pos[ 0 ] );
					verticalOffset = roffset.exec( pos[ 1 ] );
					offsets[ this ] = [
						horizontalOffset ? horizontalOffset[ 0 ] : 0,
						verticalOffset ? verticalOffset[ 0 ] : 0
					];

					// Reduce to just the positions without the offsets
					options[ this ] = [
						rposition.exec( pos[ 0 ] )[ 0 ],
						rposition.exec( pos[ 1 ] )[ 0 ]
					];
				} );

				// Normalize collision option
				if ( collision.length === 1 ) {
					collision[ 1 ] = collision[ 0 ];
				}

				if ( options.at[ 0 ] === "right" ) {
					basePosition.left += targetWidth;
				} else if ( options.at[ 0 ] === "center" ) {
					basePosition.left += targetWidth / 2;
				}

				if ( options.at[ 1 ] === "bottom" ) {
					basePosition.top += targetHeight;
				} else if ( options.at[ 1 ] === "center" ) {
					basePosition.top += targetHeight / 2;
				}

				atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
				basePosition.left += atOffset[ 0 ];
				basePosition.top += atOffset[ 1 ];

				return this.each( function() {
					var collisionPosition, using,
					    elem = $( this ),
					    elemWidth = elem.outerWidth(),
					    elemHeight = elem.outerHeight(),
					    marginLeft = parseCss( this, "marginLeft" ),
					    marginTop = parseCss( this, "marginTop" ),
					    collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
						    scrollInfo.width,
					    collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
						    scrollInfo.height,
					    position = $.extend( {}, basePosition ),
					    myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

					if ( options.my[ 0 ] === "right" ) {
						position.left -= elemWidth;
					} else if ( options.my[ 0 ] === "center" ) {
						position.left -= elemWidth / 2;
					}

					if ( options.my[ 1 ] === "bottom" ) {
						position.top -= elemHeight;
					} else if ( options.my[ 1 ] === "center" ) {
						position.top -= elemHeight / 2;
					}

					position.left += myOffset[ 0 ];
					position.top += myOffset[ 1 ];

					collisionPosition = {
						marginLeft: marginLeft,
						marginTop: marginTop
					};

					$.each( [ "left", "top" ], function( i, dir ) {
						if ( $.ui.position[ collision[ i ] ] ) {
							$.ui.position[ collision[ i ] ][ dir ]( position, {
								targetWidth: targetWidth,
								targetHeight: targetHeight,
								elemWidth: elemWidth,
								elemHeight: elemHeight,
								collisionPosition: collisionPosition,
								collisionWidth: collisionWidth,
								collisionHeight: collisionHeight,
								offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
								my: options.my,
								at: options.at,
								within: within,
								elem: elem
							} );
						}
					} );

					if ( options.using ) {

						// Adds feedback as second argument to using callback, if present
						using = function( props ) {
							var left = targetOffset.left - position.left,
							    right = left + targetWidth - elemWidth,
							    top = targetOffset.top - position.top,
							    bottom = top + targetHeight - elemHeight,
							    feedback = {
								    target: {
									    element: target,
									    left: targetOffset.left,
									    top: targetOffset.top,
									    width: targetWidth,
									    height: targetHeight
								    },
								    element: {
									    element: elem,
									    left: position.left,
									    top: position.top,
									    width: elemWidth,
									    height: elemHeight
								    },
								    horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
								    vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
							    };
							if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
								feedback.horizontal = "center";
							}
							if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
								feedback.vertical = "middle";
							}
							if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
								feedback.important = "horizontal";
							} else {
								feedback.important = "vertical";
							}
							options.using.call( this, props, feedback );
						};
					}

					elem.offset( $.extend( position, { using: using } ) );
				} );
			};

			$.ui.position = {
				fit: {
					left: function( position, data ) {
						var within = data.within,
						    withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
						    outerWidth = within.width,
						    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
						    overLeft = withinOffset - collisionPosLeft,
						    overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
						    newOverRight;

						// Element is wider than within
						if ( data.collisionWidth > outerWidth ) {

							// Element is initially over the left side of within
							if ( overLeft > 0 && overRight <= 0 ) {
								newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
									withinOffset;
								position.left += overLeft - newOverRight;

								// Element is initially over right side of within
							} else if ( overRight > 0 && overLeft <= 0 ) {
								position.left = withinOffset;

								// Element is initially over both left and right sides of within
							} else {
								if ( overLeft > overRight ) {
									position.left = withinOffset + outerWidth - data.collisionWidth;
								} else {
									position.left = withinOffset;
								}
							}

							// Too far left -> align with left edge
						} else if ( overLeft > 0 ) {
							position.left += overLeft;

							// Too far right -> align with right edge
						} else if ( overRight > 0 ) {
							position.left -= overRight;

							// Adjust based on position and margin
						} else {
							position.left = max( position.left - collisionPosLeft, position.left );
						}
					},
					top: function( position, data ) {
						var within = data.within,
						    withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
						    outerHeight = data.within.height,
						    collisionPosTop = position.top - data.collisionPosition.marginTop,
						    overTop = withinOffset - collisionPosTop,
						    overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
						    newOverBottom;

						// Element is taller than within
						if ( data.collisionHeight > outerHeight ) {

							// Element is initially over the top of within
							if ( overTop > 0 && overBottom <= 0 ) {
								newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
									withinOffset;
								position.top += overTop - newOverBottom;

								// Element is initially over bottom of within
							} else if ( overBottom > 0 && overTop <= 0 ) {
								position.top = withinOffset;

								// Element is initially over both top and bottom of within
							} else {
								if ( overTop > overBottom ) {
									position.top = withinOffset + outerHeight - data.collisionHeight;
								} else {
									position.top = withinOffset;
								}
							}

							// Too far up -> align with top
						} else if ( overTop > 0 ) {
							position.top += overTop;

							// Too far down -> align with bottom edge
						} else if ( overBottom > 0 ) {
							position.top -= overBottom;

							// Adjust based on position and margin
						} else {
							position.top = max( position.top - collisionPosTop, position.top );
						}
					}
				},
				flip: {
					left: function( position, data ) {
						var within = data.within,
						    withinOffset = within.offset.left + within.scrollLeft,
						    outerWidth = within.width,
						    offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
						    collisionPosLeft = position.left - data.collisionPosition.marginLeft,
						    overLeft = collisionPosLeft - offsetLeft,
						    overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
						    myOffset = data.my[ 0 ] === "left" ?
							    -data.elemWidth :
							    data.my[ 0 ] === "right" ?
								    data.elemWidth :
								    0,
						    atOffset = data.at[ 0 ] === "left" ?
							    data.targetWidth :
							    data.at[ 0 ] === "right" ?
								    -data.targetWidth :
								    0,
						    offset = -2 * data.offset[ 0 ],
						    newOverRight,
						    newOverLeft;

						if ( overLeft < 0 ) {
							newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
								outerWidth - withinOffset;
							if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
								position.left += myOffset + atOffset + offset;
							}
						} else if ( overRight > 0 ) {
							newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
								atOffset + offset - offsetLeft;
							if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
								position.left += myOffset + atOffset + offset;
							}
						}
					},
					top: function( position, data ) {
						var within = data.within,
						    withinOffset = within.offset.top + within.scrollTop,
						    outerHeight = within.height,
						    offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
						    collisionPosTop = position.top - data.collisionPosition.marginTop,
						    overTop = collisionPosTop - offsetTop,
						    overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
						    top = data.my[ 1 ] === "top",
						    myOffset = top ?
							    -data.elemHeight :
							    data.my[ 1 ] === "bottom" ?
								    data.elemHeight :
								    0,
						    atOffset = data.at[ 1 ] === "top" ?
							    data.targetHeight :
							    data.at[ 1 ] === "bottom" ?
								    -data.targetHeight :
								    0,
						    offset = -2 * data.offset[ 1 ],
						    newOverTop,
						    newOverBottom;
						if ( overTop < 0 ) {
							newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
								outerHeight - withinOffset;
							if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
								position.top += myOffset + atOffset + offset;
							}
						} else if ( overBottom > 0 ) {
							newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
								offset - offsetTop;
							if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
								position.top += myOffset + atOffset + offset;
							}
						}
					}
				},
				flipfit: {
					left: function() {
						$.ui.position.flip.left.apply( this, arguments );
						$.ui.position.fit.left.apply( this, arguments );
					},
					top: function() {
						$.ui.position.flip.top.apply( this, arguments );
						$.ui.position.fit.top.apply( this, arguments );
					}
				}
			};

		} )();

		var position = $.ui.position;


		/*!
 * jQuery UI :data 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :data Selector
//>>group: Core
//>>description: Selects elements which have data stored under the specified key.
//>>docs: http://api.jqueryui.com/data-selector/


		var data = $.extend( $.expr[ ":" ], {
			data: $.expr.createPseudo ?
				$.expr.createPseudo( function( dataName ) {
					return function( elem ) {
						return !!$.data( elem, dataName );
					};
				} ) :

				// Support: jQuery <1.8
				function( elem, i, match ) {
					return !!$.data( elem, match[ 3 ] );
				}
		} );

		/*!
 * jQuery UI Disable Selection 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: disableSelection
//>>group: Core
//>>description: Disable selection of text content within the set of matched elements.
//>>docs: http://api.jqueryui.com/disableSelection/

// This file is deprecated


		var disableSelection = $.fn.extend( {
			disableSelection: ( function() {
				var eventType = "onselectstart" in document.createElement( "div" ) ?
					"selectstart" :
					"mousedown";

				return function() {
					return this.on( eventType + ".ui-disableSelection", function( event ) {
						event.preventDefault();
					} );
				};
			} )(),

			enableSelection: function() {
				return this.off( ".ui-disableSelection" );
			}
		} );


		/*!
 * jQuery UI Focusable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :focusable Selector
//>>group: Core
//>>description: Selects elements which can be focused.
//>>docs: http://api.jqueryui.com/focusable-selector/



// Selectors
		$.ui.focusable = function( element, hasTabindex ) {
			var map, mapName, img, focusableIfVisible, fieldset,
			    nodeName = element.nodeName.toLowerCase();

			if ( "area" === nodeName ) {
				map = element.parentNode;
				mapName = map.name;
				if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
					return false;
				}
				img = $( "img[usemap='#" + mapName + "']" );
				return img.length > 0 && img.is( ":visible" );
			}

			if ( /^(input|select|textarea|button|object)$/.test( nodeName ) ) {
				focusableIfVisible = !element.disabled;

				if ( focusableIfVisible ) {

					// Form controls within a disabled fieldset are disabled.
					// However, controls within the fieldset's legend do not get disabled.
					// Since controls generally aren't placed inside legends, we skip
					// this portion of the check.
					fieldset = $( element ).closest( "fieldset" )[ 0 ];
					if ( fieldset ) {
						focusableIfVisible = !fieldset.disabled;
					}
				}
			} else if ( "a" === nodeName ) {
				focusableIfVisible = element.href || hasTabindex;
			} else {
				focusableIfVisible = hasTabindex;
			}

			return focusableIfVisible && $( element ).is( ":visible" ) && visible( $( element ) );
		};

// Support: IE 8 only
// IE 8 doesn't resolve inherit to visible/hidden for computed values
		function visible( element ) {
			var visibility = element.css( "visibility" );
			while ( visibility === "inherit" ) {
				element = element.parent();
				visibility = element.css( "visibility" );
			}
			return visibility !== "hidden";
		}

		$.extend( $.expr[ ":" ], {
			focusable: function( element ) {
				return $.ui.focusable( element, $.attr( element, "tabindex" ) != null );
			}
		} );

		var focusable = $.ui.focusable;




// Support: IE8 Only
// IE8 does not support the form attribute and when it is supplied. It overwrites the form prop
// with a string, so we need to find the proper form.
		var form = $.fn.form = function() {
			return typeof this[ 0 ].form === "string" ? this.closest( "form" ) : $( this[ 0 ].form );
		};


		/*!
 * jQuery UI Form Reset Mixin 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Form Reset Mixin
//>>group: Core
//>>description: Refresh input widgets when their form is reset
//>>docs: http://api.jqueryui.com/form-reset-mixin/



		var formResetMixin = $.ui.formResetMixin = {
			_formResetHandler: function() {
				var form = $( this );

				// Wait for the form reset to actually happen before refreshing
				setTimeout( function() {
					var instances = form.data( "ui-form-reset-instances" );
					$.each( instances, function() {
						this.refresh();
					} );
				} );
			},

			_bindFormResetHandler: function() {
				this.form = this.element.form();
				if ( !this.form.length ) {
					return;
				}

				var instances = this.form.data( "ui-form-reset-instances" ) || [];
				if ( !instances.length ) {

					// We don't use _on() here because we use a single event handler per form
					this.form.on( "reset.ui-form-reset", this._formResetHandler );
				}
				instances.push( this );
				this.form.data( "ui-form-reset-instances", instances );
			},

			_unbindFormResetHandler: function() {
				if ( !this.form.length ) {
					return;
				}

				var instances = this.form.data( "ui-form-reset-instances" );
				instances.splice( $.inArray( this, instances ), 1 );
				if ( instances.length ) {
					this.form.data( "ui-form-reset-instances", instances );
				} else {
					this.form
						.removeData( "ui-form-reset-instances" )
						.off( "reset.ui-form-reset" );
				}
			}
		};


		/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/


		var keycode = $.ui.keyCode = {
			BACKSPACE: 8,
			COMMA: 188,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			LEFT: 37,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SPACE: 32,
			TAB: 9,
			UP: 38
		};




// Internal use only
		var escapeSelector = $.ui.escapeSelector = ( function() {
			var selectorEscape = /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;
			return function( selector ) {
				return selector.replace( selectorEscape, "\\$1" );
			};
		} )();


		/*!
 * jQuery UI Labels 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: labels
//>>group: Core
//>>description: Find all the labels associated with a given input
//>>docs: http://api.jqueryui.com/labels/



		var labels = $.fn.labels = function() {
			var ancestor, selector, id, labels, ancestors;

			// Check control.labels first
			if ( this[ 0 ].labels && this[ 0 ].labels.length ) {
				return this.pushStack( this[ 0 ].labels );
			}

			// Support: IE <= 11, FF <= 37, Android <= 2.3 only
			// Above browsers do not support control.labels. Everything below is to support them
			// as well as document fragments. control.labels does not work on document fragments
			labels = this.eq( 0 ).parents( "label" );

			// Look for the label based on the id
			id = this.attr( "id" );
			if ( id ) {

				// We don't search against the document in case the element
				// is disconnected from the DOM
				ancestor = this.eq( 0 ).parents().last();

				// Get a full set of top level ancestors
				ancestors = ancestor.add( ancestor.length ? ancestor.siblings() : this.siblings() );

				// Create a selector for the label based on the id
				selector = "label[for='" + $.ui.escapeSelector( id ) + "']";

				labels = labels.add( ancestors.find( selector ).addBack( selector ) );

			}

			// Return whatever we have found for labels
			return this.pushStack( labels );
		};


		/*!
 * jQuery UI Scroll Parent 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: scrollParent
//>>group: Core
//>>description: Get the closest ancestor element that is scrollable.
//>>docs: http://api.jqueryui.com/scrollParent/



		var scrollParent = $.fn.scrollParent = function( includeHidden ) {
			var position = this.css( "position" ),
			    excludeStaticParent = position === "absolute",
			    overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			    scrollParent = this.parents().filter( function() {
				    var parent = $( this );
				    if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					    return false;
				    }
				    return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
					    parent.css( "overflow-x" ) );
			    } ).eq( 0 );

			return position === "fixed" || !scrollParent.length ?
				$( this[ 0 ].ownerDocument || document ) :
				scrollParent;
		};


		/*!
 * jQuery UI Tabbable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :tabbable Selector
//>>group: Core
//>>description: Selects elements which can be tabbed to.
//>>docs: http://api.jqueryui.com/tabbable-selector/



		var tabbable = $.extend( $.expr[ ":" ], {
			tabbable: function( element ) {
				var tabIndex = $.attr( element, "tabindex" ),
				    hasTabindex = tabIndex != null;
				return ( !hasTabindex || tabIndex >= 0 ) && $.ui.focusable( element, hasTabindex );
			}
		} );


		/*!
 * jQuery UI Unique ID 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: uniqueId
//>>group: Core
//>>description: Functions to generate and remove uniqueId's
//>>docs: http://api.jqueryui.com/uniqueId/



		var uniqueId = $.fn.extend( {
			uniqueId: ( function() {
				var uuid = 0;

				return function() {
					return this.each( function() {
						if ( !this.id ) {
							this.id = "ui-id-" + ( ++uuid );
						}
					} );
				};
			} )(),

			removeUniqueId: function() {
				return this.each( function() {
					if ( /^ui-id-\d+$/.test( this.id ) ) {
						$( this ).removeAttr( "id" );
					}
				} );
			}
		} );




	}));
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/plugins/output/plugins.js

try{
	/*! mobile - v1.0.0 - 2017-05-15
* Copyright (c) 2017 ; Licensed  */

//! Source: vendor/plugins/h5bp-console-shim.js

	try{
// Avoid `console` errors in browsers that lack a console.
		(function() {
			var method;
			var noop = function noop() {};
			var methods = [
				'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
				'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
				'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
				'timeStamp', 'trace', 'warn'
			];
			var length = methods.length;
			var console = (window.console = window.console || {});

			while (length--) {
				method = methods[length];

				// Only stub undefined methods.
				if (!console[method]) {
					console[method] = noop;
				}
			}
		}());


	}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
	};

//! Source: vendor/plugins/humane.js

	try{
		/*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 *
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 *
 * Licensed under the MIT license.
 */

		window.humaneDate=function humaneDate(date, compareTo){

			if(!date) {
				return;
			}

			var lang = {
				    ago: 'Ago',
				    from: '',
				    now: 'Just Now',
				    minute: 'Minute',
				    minutes: 'Minutes',
				    hour: 'Hour',
				    hours: 'Hours',
				    day: 'Day',
				    days: 'Days',
				    week: 'Week',
				    weeks: 'Weeks',
				    month: 'Month',
				    months: 'Months',
				    year: 'Year',
				    years: 'Years'
			    },
			    formats = [
				    [60, lang.now],
				    [3600, lang.minute, lang.minutes, 60], // 60 minutes, 1 minute
				    [86400, lang.hour, lang.hours, 3600], // 24 hours, 1 hour
				    [604800, lang.day, lang.days, 86400], // 7 days, 1 day
				    [2628000, lang.week, lang.weeks, 604800], // ~1 month, 1 week
				    [31536000, lang.month, lang.months, 2628000], // 1 year, ~1 month
				    [Infinity, lang.year, lang.years, 31536000] // Infinity, 1 year
			    ],
			    isString = typeof date == 'string',
			    date = isString ?
				    new Date(('' + date).replace(/-/g,"/").replace(/[TZ]/g," ")) :
				    date,
			    compareTo = compareTo || new Date,
			    seconds = (compareTo - date +
					    (compareTo.getTimezoneOffset() -
						    // if we received a GMT time from a string, doesn't include time zone bias
						    // if we got a date object, the time zone is built in, we need to remove it.
						    (isString ? 0 : date.getTimezoneOffset())
					    ) * 60000
				    ) / 1000,
			    token;

			if(seconds < 0) {
				seconds = Math.abs(seconds);
				token = lang.from ? ' ' + lang.from : '';
			} else {
				token = lang.ago ? ' ' + lang.ago : '';
			}

			/*
     * 0 seconds && < 60 seconds        Now
     * 60 seconds                       1 Minute
     * > 60 seconds && < 60 minutes     X Minutes
     * 60 minutes                       1 Hour
     * > 60 minutes && < 24 hours       X Hours
     * 24 hours                         1 Day
     * > 24 hours && < 7 days           X Days
     * 7 days                           1 Week
     * > 7 days && < ~ 1 Month          X Weeks
     * ~ 1 Month                        1 Month
     * > ~ 1 Month && < 1 Year          X Months
     * 1 Year                           1 Year
     * > 1 Year                         X Years
     *
     * Single units are +10%. 1 Year shows first at 1 Year + 10%
     */

			function normalize(val, single)
			{
				var margin = 0.1;
				if(val >= single && val <= single * (1+margin)) {
					return single;
				}
				return val;
			}

			for(var i = 0, format = formats[0]; formats[i]; format = formats[++i]) {
				if(seconds < format[0]) {
					if(i === 0) {
						// Now
						return format[1];
					}

					var val = Math.ceil(normalize(seconds, format[3]) / (format[3]));
					return val +
						' ' +
						(val != 1 ? format[2] : format[1]) +
						(i > 0 ? token : '');
				}
			}
		};

		if(typeof jQuery != 'undefined') {
			jQuery.fn.humaneDates = function(options)
			{
				var settings = jQuery.extend({
					'lowercase': false
				}, options);

				return this.each(function()
				{
					var $t = jQuery(this),
					    date = $t.attr('datetime') || $t.attr('title');

					date = humaneDate(date);

					if(date && settings['lowercase']) {
						date = date.toLowerCase();
					}

					if(date && $t.html() != date) {
						// don't modify the dom if we don't have to
						$t.html(date);
					}
				});
			};
		}

	}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
	};

//! Source: vendor/plugins/jquery.autosize.js

	try{
		/*
	jQuery Autosize v1.16.4
	(c) 2013 Jack Moore - jacklmoore.com
	updated: 2013-01-29
	license: http://www.opensource.org/licenses/mit-license.php
*/

		(function ($) {
			var
				defaults = {
					className: 'autosizejs',
					append: '',
					callback: false
				},
				hidden = 'hidden',
				borderBox = 'border-box',
				lineHeight = 'lineHeight',

				// border:0 is unnecessary, but avoids a bug in FireFox on OSX (http://www.jacklmoore.com/autosize#comment-851)
				copy = '<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden;"/>',

				// line-height is conditionally included because IE7/IE8/old Opera do not return the correct value.
				copyStyle = [
					'fontFamily',
					'fontSize',
					'fontWeight',
					'fontStyle',
					'letterSpacing',
					'textTransform',
					'wordSpacing',
					'textIndent'
				],
				oninput = 'oninput',
				onpropertychange = 'onpropertychange',

				// to keep track which textarea is being mirrored when adjust() is called.
				mirrored,

				// the mirror element, which is used to calculate what size the mirrored element should be.
				mirror = $(copy).data('autosize', true)[0];

			// test that line-height can be accurately copied.
			mirror.style.lineHeight = '99px';
			if ($(mirror).css(lineHeight) === '99px') {
				copyStyle.push(lineHeight);
			}
			mirror.style.lineHeight = '';

			$.fn.autosize = function (options) {
				options = $.extend({}, defaults, options || {});

				if (mirror.parentNode !== document.body) {
					$(document.body).append(mirror);
				}

				return this.each(function () {
					var
						ta = this,
						$ta = $(ta),
						minHeight,
						active,
						resize,
						boxOffset = 0,
						callback = $.isFunction(options.callback);

					if ($ta.data('autosize')) {
						// exit if autosize has already been applied, or if the textarea is the mirror element.
						return;
					}

					if ($ta.css('box-sizing') === borderBox || $ta.css('-moz-box-sizing') === borderBox || $ta.css('-webkit-box-sizing') === borderBox){
						boxOffset = $ta.outerHeight() - $ta.height();
					}

					minHeight = Math.max(parseInt($ta.css('minHeight'), 10) - boxOffset, $ta.height());

					resize = ($ta.css('resize') === 'none' || $ta.css('resize') === 'vertical') ? 'none' : 'horizontal';

					$ta.css({
						overflow: hidden,
						overflowY: hidden,
						wordWrap: 'break-word',
						resize: resize
					}).data('autosize', true);

					function initMirror() {
						mirrored = ta;
						mirror.className = options.className;

						// mirror is a duplicate textarea located off-screen that
						// is automatically updated to contain the same text as the
						// original textarea.  mirror always has a height of 0.
						// This gives a cross-browser supported way getting the actual
						// height of the text, through the scrollTop property.
						$.each(copyStyle, function(i, val){
							mirror.style[val] = $ta.css(val);
						});
					}

					// Using mainly bare JS in this function because it is going
					// to fire very often while typing, and needs to very efficient.
					function adjust() {
						var height, overflow, original;

						if (mirrored !== ta) {
							initMirror();
						}

						// the active flag keeps IE from tripping all over itself.  Otherwise
						// actions in the adjust function will cause IE to call adjust again.
						if (!active) {
							active = true;
							mirror.value = ta.value + options.append;
							mirror.style.overflowY = ta.style.overflowY;
							original = parseInt(ta.style.height,10);

							// Update the width in case the original textarea width has changed
							// A floor of 0 is needed because IE8 returns a negative value for hidden textareas, raising an error.
							mirror.style.width = Math.max($ta.width(), 0) + 'px';

							// The following three lines can be replaced with `height = mirror.scrollHeight` when dropping IE7 support.

							height = mirror.scrollHeight;

							var maxHeight = parseInt($ta.css('maxHeight'), 10);
							// Opera returns '-1px' when max-height is set to 'none'.
							maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;
							if (height > maxHeight) {
								height = maxHeight;
								overflow = 'scroll';
							} else if (height < minHeight) {
								height = minHeight;
							}
							height += boxOffset;
							ta.style.overflowY = overflow || hidden;

							if (original !== height) {
								ta.style.height = height + 'px';
								if (callback) {
									options.callback.call(ta);
								}
							}

							// This small timeout gives IE a chance to draw it's scrollbar
							// before adjust can be run again (prevents an infinite loop).
							setTimeout(function () {
								active = false;
							}, 1);
						}
					}

					if (onpropertychange in ta) {
						if (oninput in ta) {
							// Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
							// so binding to onkeyup to catch most of those occassions.  There is no way that I
							// know of to detect something like 'cut' in IE9.
							ta[oninput] = ta.onkeyup = adjust;
						} else {
							// IE7 / IE8
							ta[onpropertychange] = adjust;
						}
					} else {
						// Modern Browsers
						ta[oninput] = adjust;
					}

					$(window).on("resize", adjust);

					$ta.on("remove", function(){
						$(window).off("resize", adjust);
						var $allTextArea = $(".textarea textarea");
						if (!$allTextArea.length || ($allTextArea.length == 1 && $allTextArea[0] == ta)) {
							mirror && mirror.remove();
						}
					});
					// Allow for manual triggering if needed.
					$ta.bind('autosize', adjust);

					// Call adjust in case the textarea already contains text.
					adjust();
				});
			};
		}(window.jQuery || window.Zepto));

	}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
	};

//! Source: vendor/plugins/jquery.swipebox.js

	try{
		/*---------------------------------------------------------------------------------------------

@author       Constantin Saguin - @brutaldesign
@link            http://csag.co
@github        http://github.com/brutaldesign/swipebox
@version     1.2.1
@license      MIT License

----------------------------------------------------------------------------------------------*/

		;(function (window, document, $, undefined) {

			$.swipebox = function(elem, options) {

				var defaults = {
					    useCSS : true,
					    initialIndexOnArray : 0,
					    hideBarsDelay : 3000,
					    videoMaxWidth : 1140,
					    vimeoColor : 'CCCCCC',
					    beforeOpen: null,
					    afterClose: null
				    },

				    plugin = this,
				    elements = [], // slides array [{href:'...', title:'...'}, ...],
				    elem = elem,
				    selector = elem.selector,
				    $selector = $(selector),
				    isTouch = document.createTouch !== undefined || ('ontouchstart' in window) || ('onmsgesturechange' in window) || navigator.msMaxTouchPoints,
				    supportSVG = !!(window.SVGSVGElement),
				    winWidth = window.innerWidth ? window.innerWidth : $(window).width(),
				    winHeight = window.innerHeight ? window.innerHeight : $(window).height(),
				    html = '<div id="swipebox-overlay">\
				<div id="swipebox-slider"></div>\
				<div id="swipebox-caption"></div>\
				<div id="swipebox-action">\
					<a id="swipebox-close"></a>\
					<a id="swipebox-prev"></a>\
					<a id="swipebox-next"></a>\
				</div>\
		</div>';

				plugin.settings = {}

				plugin.init = function(){

					plugin.settings = $.extend({}, defaults, options);

					if ($.isArray(elem)) {

						elements = elem;
						ui.target = $(window);
						ui.init(plugin.settings.initialIndexOnArray);

					}else{

						$selector.click(function(e){
							elements = [];
							var index , relType, relVal;

							if (!relVal) {
								relType = 'rel';
								relVal  = $(this).attr(relType);
							}

							if (relVal && relVal !== '' && relVal !== 'nofollow') {
								$elem = $selector.filter('[' + relType + '="' + relVal + '"]');
							}else{
								$elem = $(selector);
							}

							$elem.each(function(){

								var title = null, href = null;

								if( $(this).attr('title') )
									title = $(this).attr('title');

								if( $(this).attr('href') )
									href = $(this).attr('href');

								elements.push({
									href: href,
									title: title
								});
							});

							index = $elem.index($(this));
							e.preventDefault();
							e.stopPropagation();
							ui.target = $(e.target);
							ui.init(index);
						});
					}
				}

				plugin.refresh = function() {
					if (!$.isArray(elem)) {
						ui.destroy();
						$elem = $(selector);
						ui.actions();
					}
				}

				var ui = {

					init : function(index){
						if (plugin.settings.beforeOpen)
							plugin.settings.beforeOpen();
						this.target.trigger('swipebox-start');
						$.swipebox.isOpen = true;
						this.build();
						this.openSlide(index);
						this.openMedia(index);
						this.preloadMedia(index+1);
						this.preloadMedia(index-1);
					},

					build : function(){
						var $this = this;

						$('body').append(html);

						if($this.doCssTrans()){
							$('#swipebox-slider').css({
								'-webkit-transition' : 'left 0.4s ease',
								'-moz-transition' : 'left 0.4s ease',
								'-o-transition' : 'left 0.4s ease',
								'-khtml-transition' : 'left 0.4s ease',
								'transition' : 'left 0.4s ease'
							});
							$('#swipebox-overlay').css({
								'-webkit-transition' : 'opacity 1s ease',
								'-moz-transition' : 'opacity 1s ease',
								'-o-transition' : 'opacity 1s ease',
								'-khtml-transition' : 'opacity 1s ease',
								'transition' : 'opacity 1s ease'
							});
							$('#swipebox-action, #swipebox-caption').css({
								'-webkit-transition' : '0.5s',
								'-moz-transition' : '0.5s',
								'-o-transition' : '0.5s',
								'-khtml-transition' : '0.5s',
								'transition' : '0.5s'
							});
						}


						if(supportSVG){
							var bg = $('#swipebox-action #swipebox-close').css('background-image');
							bg = bg.replace('png', 'svg');
							$('#swipebox-action #swipebox-prev,#swipebox-action #swipebox-next,#swipebox-action #swipebox-close').css({
								'background-image' : bg
							});
						}

						$.each( elements,  function(){
							$('#swipebox-slider').append('<div class="slide"></div>');
						});

						$this.setDim();
						$this.actions();
						$this.keyboard();
						$this.gesture();
						$this.animBars();
						$this.resize();

					},

					setDim : function(){

						var width, height, sliderCss = {};

						if( "onorientationchange" in window ){

							window.addEventListener("orientationchange", function() {
								if( window.orientation == 0 ){
									width = winWidth;
									height = winHeight;
								}else if( window.orientation == 90 || window.orientation == -90 ){
									width = winHeight;
									height = winWidth;
								}
							}, false);


						}else{

							width = window.innerWidth ? window.innerWidth : $(window).width();
							height = window.innerHeight ? window.innerHeight : $(window).height();
						}

						sliderCss = {
							width : width,
							height : height
						}


						$('#swipebox-overlay').css(sliderCss);

					},

					resize : function (){
						var $this = this;

						$(window).resize(function() {
							$this.setDim();
						}).resize();
					},

					supportTransition : function() {
						var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split(' ');
						for(var i = 0; i < prefixes.length; i++) {
							if(document.createElement('div').style[prefixes[i]] !== undefined) {
								return prefixes[i];
							}
						}
						return false;
					},

					doCssTrans : function(){
						if(plugin.settings.useCSS && this.supportTransition() ){
							return true;
						}
					},

					gesture : function(){
//				if ( isTouch ){
//					var $this = this,
//					distance = null,
//					swipMinDistance = 10,
//					startCoords = {},
//					endCoords = {};
//					var bars = $('#swipebox-caption, #swipebox-action');
//
//					bars.addClass('visible-bars');
//					$this.setTimeout();
//
//					$('body').bind('touchstart', function(e){
//
//						$(this).addClass('touching');
//
//		  				endCoords = e.originalEvent.targetTouches[0];
//		    				startCoords.pageX = e.originalEvent.targetTouches[0].pageX;
//
//						$('.touching').bind('touchmove',function(e){
//							e.preventDefault();
//							e.stopPropagation();
//		    					endCoords = e.originalEvent.targetTouches[0];
//
//						});
//
//			           			return false;
//
//	           			}).bind('touchend',function(e){
//	           				e.preventDefault();
//					e.stopPropagation();
//
//   					distance = endCoords.pageX - startCoords.pageX;
//
//	       				if( distance >= swipMinDistance ){
//
//	       					// swipeLeft
//	       					$this.getPrev();
//
//	       				}else if( distance <= - swipMinDistance ){
//
//	       					// swipeRight
//	       					$this.getNext();
//
//	       				}else{
//	       					// tap
//	       					if(!bars.hasClass('visible-bars')){
//							$this.showBars();
//							$this.setTimeout();
//						}else{
//							$this.clearTimeout();
//							$this.hideBars();
//						}
//
//	       				}
//
//	       				$('.touching').off('touchmove').removeClass('touching');
//
//					});
//
//           				}
					},

					setTimeout: function(){
						if(plugin.settings.hideBarsDelay > 0){
							var $this = this;
							$this.clearTimeout();
							$this.timeout = window.setTimeout( function(){
									$this.hideBars() },
								plugin.settings.hideBarsDelay
							);
						}
					},

					clearTimeout: function(){
						window.clearTimeout(this.timeout);
						this.timeout = null;
					},

					showBars : function(){
						var bars = $('#swipebox-caption, #swipebox-action');
						if(this.doCssTrans()){
							bars.addClass('visible-bars');
						}else{
							$('#swipebox-caption').animate({ top : 0 }, 500);
							$('#swipebox-action').animate({ bottom : 0 }, 500);
							setTimeout(function(){
								bars.addClass('visible-bars');
							}, 1000);
						}
					},

					hideBars : function(){
						var bars = $('#swipebox-caption, #swipebox-action');
						if(this.doCssTrans()){
							bars.removeClass('visible-bars');
						}else{
							$('#swipebox-caption').animate({ top : '-50px' }, 500);
							$('#swipebox-action').animate({ bottom : '-50px' }, 500);
							setTimeout(function(){
								bars.removeClass('visible-bars');
							}, 1000);
						}
					},

					animBars : function(){
						var $this = this;
						var bars = $('#swipebox-caption, #swipebox-action');

						bars.addClass('visible-bars');
						$this.setTimeout();

						$('#swipebox-slider').click(function(e){
							if(!bars.hasClass('visible-bars')){
								$this.showBars();
								$this.setTimeout();
							}
						});

						$('#swipebox-action').hover(function() {
							$this.showBars();
							bars.addClass('force-visible-bars');
							$this.clearTimeout();

						},function() {
							bars.removeClass('force-visible-bars');
							$this.setTimeout();

						});
					},

					keyboard : function(){
						var $this = this;
						$(window).bind('keyup', function(e){
							e.preventDefault();
							e.stopPropagation();
							if (e.keyCode == 37){
								$this.getPrev();
							}
							else if (e.keyCode==39){
								$this.getNext();
							}
							else if (e.keyCode == 27) {
								$this.closeSlide();
							}
						});
					},

					actions : function(){
						var $this = this;

						if( elements.length < 2 ){
							$('#swipebox-prev, #swipebox-next').hide();
						}else{
							$('#swipebox-prev').bind('click touchend', function(e){
								e.preventDefault();
								e.stopPropagation();
								$this.getPrev();
								$this.setTimeout();
							});

							$('#swipebox-next').bind('click touchend', function(e){
								e.preventDefault();
								e.stopPropagation();
								$this.getNext();
								$this.setTimeout();
							});
						}

						$('#swipebox-close').bind('click touchend', function(e){
							$this.closeSlide();
						});
					},

					setSlide : function (index, isFirst){
						isFirst = isFirst || false;

						var slider = $('#swipebox-slider');

						if(this.doCssTrans()){
							slider.css({ left : (-index*100)+'%' });
						}else{
							slider.animate({ left : (-index*100)+'%' });
						}

						$('#swipebox-slider .slide').removeClass('current');
						$('#swipebox-slider .slide').eq(index).addClass('current');
						this.setTitle(index);

						if( isFirst ){
							slider.fadeIn();
						}

						$('#swipebox-prev, #swipebox-next').removeClass('disabled');
						if(index == 0){
							$('#swipebox-prev').addClass('disabled');
						}else if( index == elements.length - 1 ){
							$('#swipebox-next').addClass('disabled');
						}
					},

					openSlide : function (index){
						$('html').addClass('swipebox');
						$(window).trigger('resize'); // fix scroll bar visibility on desktop
						this.setSlide(index, true);
					},

					preloadMedia : function (index){
						var $this = this, src = null;

						if( elements[index] !== undefined )
							src = elements[index].href;

						if( !$this.isVideo(src) ){
							setTimeout(function(){
								$this.openMedia(index);
							}, 1000);
						}else{
							$this.openMedia(index);
						}
					},

					openMedia : function (index){
						var $this = this, src = null;

						if( elements[index] !== undefined )
							src = elements[index].href;

						if(index < 0 || index >= elements.length){
							return false;
						}

						if( !$this.isVideo(src) ){
							$this.loadMedia(src, function(){
								$('#swipebox-slider .slide').eq(index).html(this);
							});
						}else{
							$('#swipebox-slider .slide').eq(index).html($this.getVideo(src));
						}

					},

					setTitle : function (index, isFirst){
						var title = null;

						$('#swipebox-caption').empty();

						if( elements[index] !== undefined )
							title = elements[index].title;

						if(title){
							$('#swipebox-caption').append(title);
						}
					},

					isVideo : function (src){

						if( src ){
							if(
								src.match(/youtube\.com\/watch\?v=([a-zA-Z0-9\-_]+)/)
								|| src.match(/vimeo\.com\/([0-9]*)/)
							){
								return true;
							}
						}

					},

					getVideo : function(url){
						var iframe = '';
						var output = '';
						var youtubeUrl = url.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
						var vimeoUrl = url.match(/vimeo\.com\/([0-9]*)/);
						if( youtubeUrl ){

							iframe = '<iframe width="560" height="315" src="//www.youtube.com/embed/'+youtubeUrl[1]+'" frameborder="0" allowfullscreen></iframe>';

						}else if(vimeoUrl){

							iframe = '<iframe width="560" height="315"  src="http://player.vimeo.com/video/'+vimeoUrl[1]+'?byline=0&amp;portrait=0&amp;color='+plugin.settings.vimeoColor+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';

						}

						return '<div class="swipebox-video-container" style="max-width:'+plugin.settings.videomaxWidth+'px"><div class="swipebox-video">'+iframe+'</div></div>';
					},

					loadMedia : function (src, callback){
						if( !this.isVideo(src) ){
							var img = $('<img>').on('load', function(){
								callback.call(img);
							});

							img.attr('src',src);
						}
					},

					getNext : function (){
						var $this = this;
						index = $('#swipebox-slider .slide').index($('#swipebox-slider .slide.current'));
						if(index+1 < elements.length){
							index++;
							$this.setSlide(index);
							$this.preloadMedia(index+1);
						}
						else{

							$('#swipebox-slider').addClass('rightSpring');
							setTimeout(function(){
								$('#swipebox-slider').removeClass('rightSpring');
							},500);
						}
					},

					getPrev : function (){
						index = $('#swipebox-slider .slide').index($('#swipebox-slider .slide.current'));
						if(index > 0){
							index--;
							this.setSlide(index);
							this.preloadMedia(index-1);
						}
						else{

							$('#swipebox-slider').addClass('leftSpring');
							setTimeout(function(){
								$('#swipebox-slider').removeClass('leftSpring');
							},500);
						}
					},


					closeSlide : function (){
						$('html').removeClass('swipebox');
						$(window).trigger('resize');
						this.destroy();
					},

					destroy : function(){
						$(window).unbind('keyup');
						$('body').unbind('touchstart');
						$('body').unbind('touchmove');
						$('body').unbind('touchend');
						$('#swipebox-slider').unbind();
						$('#swipebox-overlay').remove();
						if (!$.isArray(elem))
							elem.removeData('_swipebox');
						if ( this.target )
							this.target.trigger('swipebox-destroy');
						$.swipebox.isOpen = false;
						if (plugin.settings.afterClose)
							plugin.settings.afterClose();
					}

				};

				plugin.init();

			};

			$.fn.swipebox = function(options){
				if (!$.data(this, "_swipebox")) {
					var swipebox = new $.swipebox(this, options);
					this.data('_swipebox', swipebox);
				}
				return this.data('_swipebox');
			}

		}(window, document, jQuery));
	}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
	};

//! Source: vendor/plugins/jquery.transit-tweaked.js

	try{
		/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */

		(function($) {
			$.transit = {
				version: "0.9.9",

				// Map of $.css() keys to values for 'transitionProperty'.
				// See https://developer.mozilla.org/en/CSS/CSS_transitions#Properties_that_can_be_animated
				propertyMap: {
					marginLeft    : 'margin',
					marginRight   : 'margin',
					marginBottom  : 'margin',
					marginTop     : 'margin',
					paddingLeft   : 'padding',
					paddingRight  : 'padding',
					paddingBottom : 'padding',
					paddingTop    : 'padding'
				},

				// Will simply transition "instantly" if false
				enabled: true,

				// Set this to false if you don't want to use the transition end property.
				useTransitionEnd: false
			};

			var div = document.createElement('div');
			var support = {};

			// Helper function to get the proper vendor property name.
			// (`transition` => `WebkitTransition`)
			function getVendorPropertyName(prop) {
				// Handle unprefixed versions (FF16+, for example)
				if (prop in div.style) return prop;

				var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
				var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

				if (prop in div.style) { return prop; }

				for (var i=0; i<prefixes.length; ++i) {
					var vendorProp = prefixes[i] + prop_;
					if (vendorProp in div.style) { return vendorProp; }
				}
			}

			// Helper function to check if transform3D is supported.
			// Should return true for Webkits and Firefox 10+.
			function checkTransform3dSupport() {
				div.style[support.transform] = '';
				div.style[support.transform] = 'rotateY(90deg)';
				return div.style[support.transform] !== '';
			}

			var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

			// Check for the browser's transitions support.
			support.transition      = getVendorPropertyName('transition');
			support.transitionDelay = getVendorPropertyName('transitionDelay');
			support.transform       = getVendorPropertyName('transform');
			support.transformOrigin = getVendorPropertyName('transformOrigin');
			support.transform3d     = checkTransform3dSupport();

			var eventNames = {
				'transition':       'transitionEnd',
				'MozTransition':    'transitionend',
				'OTransition':      'oTransitionEnd',
				'WebkitTransition': 'webkitTransitionEnd',
				'msTransition':     'MSTransitionEnd'
			};

			// Detect the 'transitionend' event needed.
			var transitionEnd = support.transitionEnd = eventNames[support.transition] || null;

			// Populate jQuery's `$.support` with the vendor prefixes we know.
			// As per [jQuery's cssHooks documentation](http://api.jquery.com/jQuery.cssHooks/),
			// we set $.support.transition to a string of the actual property name used.
			for (var key in support) {
				if (support.hasOwnProperty(key) && typeof $.support[key] === 'undefined') {
					$.support[key] = support[key];
				}
			}

			// Avoid memory leak in IE.
			div = null;

			// ## $.cssEase
			// List of easing aliases that you can use with `$.fn.transition`.
			$.cssEase = {
				'_default':       'ease',
				'in':             'ease-in',
				'out':            'ease-out',
				'in-out':         'ease-in-out',
				'snap':           'cubic-bezier(0,1,.5,1)',
				// Penner equations
				'easeOutCubic':   'cubic-bezier(.215,.61,.355,1)',
				'easeInOutCubic': 'cubic-bezier(.645,.045,.355,1)',
				'easeInCirc':     'cubic-bezier(.6,.04,.98,.335)',
				'easeOutCirc':    'cubic-bezier(.075,.82,.165,1)',
				'easeInOutCirc':  'cubic-bezier(.785,.135,.15,.86)',
				'easeInExpo':     'cubic-bezier(.95,.05,.795,.035)',
				'easeOutExpo':    'cubic-bezier(.19,1,.22,1)',
				'easeInOutExpo':  'cubic-bezier(1,0,0,1)',
				'easeInQuad':     'cubic-bezier(.55,.085,.68,.53)',
				'easeOutQuad':    'cubic-bezier(.25,.46,.45,.94)',
				'easeInOutQuad':  'cubic-bezier(.455,.03,.515,.955)',
				'easeInQuart':    'cubic-bezier(.895,.03,.685,.22)',
				'easeOutQuart':   'cubic-bezier(.165,.84,.44,1)',
				'easeInOutQuart': 'cubic-bezier(.77,0,.175,1)',
				'easeInQuint':    'cubic-bezier(.755,.05,.855,.06)',
				'easeOutQuint':   'cubic-bezier(.23,1,.32,1)',
				'easeInOutQuint': 'cubic-bezier(.86,0,.07,1)',
				'easeInSine':     'cubic-bezier(.47,0,.745,.715)',
				'easeOutSine':    'cubic-bezier(.39,.575,.565,1)',
				'easeInOutSine':  'cubic-bezier(.445,.05,.55,.95)',
				'easeInBack':     'cubic-bezier(.6,-.28,.735,.045)',
				'easeOutBack':    'cubic-bezier(.175, .885,.32,1.275)',
				'easeInOutBack':  'cubic-bezier(.68,-.55,.265,1.55)'
			};

			// ## 'transform' CSS hook
			// Allows you to use the `transform` property in CSS.
			//
			//     $("#hello").css({ transform: "rotate(90deg)" });
			//
			//     $("#hello").css('transform');
			//     //=> { rotate: '90deg' }
			//
			$.cssHooks['transit:transform'] = {
				// The getter returns a `Transform` object.
				get: function(elem) {
					return $(elem).data('transform') || new Transform();
				},

				// The setter accepts a `Transform` object or a string.
				set: function(elem, v) {
					var value = v;

					if (!(value instanceof Transform)) {
						value = new Transform(value);
					}

					if (support.transform === 'WebkitTransform') {
						elem.style[support.transform] = value.toString(true);
					} else {
						elem.style[support.transform] = value.toString();
					}

					$(elem).data('transform', value);
				}
			};

			// Add a CSS hook for `.css({ transform: '...' })`.
			// In jQuery 1.8+, this will intentionally override the default `transform`
			// CSS hook so it'll play well with Transit. (see issue #62)
			$.cssHooks.transform = {
				set: $.cssHooks['transit:transform'].set
			};

			// jQuery 1.8+ supports prefix-free transitions, so these polyfills will not
			// be necessary.
			if ($.fn.jquery < "1.8") {
				// ## 'transformOrigin' CSS hook
				// Allows the use for `transformOrigin` to define where scaling and rotation
				// is pivoted.
				//
				//     $("#hello").css({ transformOrigin: '0 0' });
				//
				$.cssHooks.transformOrigin = {
					get: function(elem) {
						return elem.style[support.transformOrigin];
					},
					set: function(elem, value) {
						elem.style[support.transformOrigin] = value;
					}
				};

				// ## 'transition' CSS hook
				// Allows you to use the `transition` property in CSS.
				//
				//     $("#hello").css({ transition: 'all 0 ease 0' });
				//
				$.cssHooks.transition = {
					get: function(elem) {
						return elem.style[support.transition];
					},
					set: function(elem, value) {
						elem.style[support.transition] = value;
					}
				};
			}

			// ## Other CSS hooks
			// Allows you to rotate, scale and translate.
			registerCssHook('scale');
			registerCssHook('translate');
			registerCssHook('rotate');
			registerCssHook('rotateX');
			registerCssHook('rotateY');
			registerCssHook('rotate3d');
			registerCssHook('perspective');
			registerCssHook('skewX');
			registerCssHook('skewY');
			registerCssHook('x', true);
			registerCssHook('y', true);

			// ## Transform class
			// This is the main class of a transformation property that powers
			// `$.fn.css({ transform: '...' })`.
			//
			// This is, in essence, a dictionary object with key/values as `-transform`
			// properties.
			//
			//     var t = new Transform("rotate(90) scale(4)");
			//
			//     t.rotate             //=> "90deg"
			//     t.scale              //=> "4,4"
			//
			// Setters are accounted for.
			//
			//     t.set('rotate', 4)
			//     t.rotate             //=> "4deg"
			//
			// Convert it to a CSS string using the `toString()` and `toString(true)` (for WebKit)
			// functions.
			//
			//     t.toString()         //=> "rotate(90deg) scale(4,4)"
			//     t.toString(true)     //=> "rotate(90deg) scale3d(4,4,0)" (WebKit version)
			//
			function Transform(str) {
				if (typeof str === 'string') { this.parse(str); }
				return this;
			}

			Transform.prototype = {
				// ### setFromString()
				// Sets a property from a string.
				//
				//     t.setFromString('scale', '2,4');
				//     // Same as set('scale', '2', '4');
				//
				setFromString: function(prop, val) {
					var args =
						    (typeof val === 'string')  ? val.split(',') :
							    (val.constructor === Array) ? val :
								    [ val ];

					args.unshift(prop);

					Transform.prototype.set.apply(this, args);
				},

				// ### set()
				// Sets a property.
				//
				//     t.set('scale', 2, 4);
				//
				set: function(prop) {
					var args = Array.prototype.slice.apply(arguments, [1]);
					if (this.setter[prop]) {
						this.setter[prop].apply(this, args);
					} else {
						this[prop] = args.join(',');
					}
				},

				get: function(prop) {
					if (this.getter[prop]) {
						return this.getter[prop].apply(this);
					} else {
						return this[prop] || 0;
					}
				},

				setter: {
					// ### rotate
					//
					//     .css({ rotate: 30 })
					//     .css({ rotate: "30" })
					//     .css({ rotate: "30deg" })
					//     .css({ rotate: "30deg" })
					//
					rotate: function(theta) {
						this.rotate = unit(theta, 'deg');
					},

					rotateX: function(theta) {
						this.rotateX = unit(theta, 'deg');
					},

					rotateY: function(theta) {
						this.rotateY = unit(theta, 'deg');
					},

					// ### scale
					//
					//     .css({ scale: 9 })      //=> "scale(9,9)"
					//     .css({ scale: '3,2' })  //=> "scale(3,2)"
					//
					scale: function(x, y) {
						if (y === undefined) { y = x; }
						this.scale = x + "," + y;
					},

					// ### skewX + skewY
					skewX: function(x) {
						this.skewX = unit(x, 'deg');
					},

					skewY: function(y) {
						this.skewY = unit(y, 'deg');
					},

					// ### perspectvie
					perspective: function(dist) {
						this.perspective = unit(dist, 'px');
					},

					// ### x / y
					// Translations. Notice how this keeps the other value.
					//
					//     .css({ x: 4 })       //=> "translate(4px, 0)"
					//     .css({ y: 10 })      //=> "translate(4px, 10px)"
					//
					x: function(x) {
						this.set('translate', x, null);
					},

					y: function(y) {
						this.set('translate', null, y);
					},

					// ### translate
					// Notice how this keeps the other value.
					//
					//     .css({ translate: '2, 5' })    //=> "translate(2px, 5px)"
					//
					translate: function(x, y) {
						if (this._translateX === undefined) { this._translateX = 0; }
						if (this._translateY === undefined) { this._translateY = 0; }

						if (x !== null && x !== undefined) { this._translateX = unit(x, 'px'); }
						if (y !== null && y !== undefined) { this._translateY = unit(y, 'px'); }

						this.translate = this._translateX + "," + this._translateY;
					}
				},

				getter: {
					x: function() {
						return this._translateX || 0;
					},

					y: function() {
						return this._translateY || 0;
					},

					scale: function() {
						var s = (this.scale || "1,1").split(',');
						if (s[0]) { s[0] = parseFloat(s[0]); }
						if (s[1]) { s[1] = parseFloat(s[1]); }

						// "2.5,2.5" => 2.5
						// "2.5,1" => [2.5,1]
						return (s[0] === s[1]) ? s[0] : s;
					},

					rotate3d: function() {
						var s = (this.rotate3d || "0,0,0,0deg").split(',');
						for (var i=0; i<=3; ++i) {
							if (s[i]) { s[i] = parseFloat(s[i]); }
						}
						if (s[3]) { s[3] = unit(s[3], 'deg'); }

						return s;
					}
				},

				// ### parse()
				// Parses from a string. Called on constructor.
				parse: function(str) {
					var self = this;
					str.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(x, prop, val) {
						self.setFromString(prop, val);
					});
				},

				// ### toString()
				// Converts to a `transition` CSS property string. If `use3d` is given,
				// it converts to a `-webkit-transition` CSS property string instead.
				toString: function(use3d) {
					var re = [];

					for (var i in this) {
						if (this.hasOwnProperty(i)) {
							// Don't use 3D transformations if the browser can't support it.
							if ((!support.transform3d) && (
								(i === 'rotateX') ||
								(i === 'rotateY') ||
								(i === 'perspective') ||
								(i === 'transformOrigin'))) { continue; }

							if (i[0] !== '_') {
								if (use3d && (i === 'scale')) {
									re.push(i + "3d(" + this[i] + ",1)");
								} else if (use3d && (i === 'translate')) {
									re.push(i + "3d(" + this[i] + ",0)");
								} else {
									re.push(i + "(" + this[i] + ")");
								}
							}
						}
					}

					return re.join(" ");
				}
			};

			function callOrQueue(self, queue, fn) {
				if (queue === true) {
					self.queue(fn);
				} else if (queue) {
					self.queue(queue, fn);
				} else {
					fn();
				}
			}

			// ### getProperties(dict)
			// Returns properties (for `transition-property`) for dictionary `props`. The
			// value of `props` is what you would expect in `$.css(...)`.
			function getProperties(props) {
				var re = [];

				$.each(props, function(key) {
					key = $.camelCase(key); // Convert "text-align" => "textAlign"
					key = $.transit.propertyMap[key] || $.cssProps[key] || key;
					key = uncamel(key); // Convert back to dasherized

					if ($.inArray(key, re) === -1) { re.push(key); }
				});

				return re;
			}

			// ### getTransition()
			// Returns the transition string to be used for the `transition` CSS property.
			//
			// Example:
			//
			//     getTransition({ opacity: 1, rotate: 30 }, 500, 'ease');
			//     //=> 'opacity 500ms ease, -webkit-transform 500ms ease'
			//
			function getTransition(properties, duration, easing, delay) {
				// Get the CSS properties needed.
				var props = getProperties(properties);

				// Account for aliases (`in` => `ease-in`).
				if ($.cssEase[easing]) { easing = $.cssEase[easing]; }

				// Build the duration/easing/delay attributes for it.
				var attribs = '' + toMS(duration) + ' ' + easing;
				if (parseInt(delay, 10) > 0) { attribs += ' ' + toMS(delay); }

				// For more properties, add them this way:
				// "margin 200ms ease, padding 200ms ease, ..."
				var transitions = [];
				$.each(props, function(i, name) {
					transitions.push(name + ' ' + attribs);
				});

				return transitions.join(', ');
			}

			// ## $.fn.transition
			// Works like $.fn.animate(), but uses CSS transitions.
			//
			//     $("...").transition({ opacity: 0.1, scale: 0.3 });
			//
			//     // Specific duration
			//     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500);
			//
			//     // With duration and easing
			//     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in');
			//
			//     // With callback
			//     $("...").transition({ opacity: 0.1, scale: 0.3 }, function() { ... });
			//
			//     // With everything
			//     $("...").transition({ opacity: 0.1, scale: 0.3 }, 500, 'in', function() { ... });
			//
			//     // Alternate syntax
			//     $("...").transition({
			//       opacity: 0.1,
			//       duration: 200,
			//       delay: 40,
			//       easing: 'in',
			//       complete: function() { /* ... */ }
			//      });
			//
			$.fn.transition = $.fn.transit = function(properties, duration, easing, callback) {
				var self  = this;
				var delay = 0;
				var queue = true;

				// Account for `.transition(properties, callback)`.
				if (typeof duration === 'function') {
					callback = duration;
					duration = undefined;
				}

				// Account for `.transition(properties, duration, callback)`.
				if (typeof easing === 'function') {
					callback = easing;
					easing = undefined;
				}

				// Alternate syntax.
				if (typeof properties.easing !== 'undefined') {
					easing = properties.easing;
					delete properties.easing;
				}

				if (typeof properties.duration !== 'undefined') {
					duration = properties.duration;
					delete properties.duration;
				}

				if (typeof properties.complete !== 'undefined') {
					callback = properties.complete;
					delete properties.complete;
				}

				if (typeof properties.queue !== 'undefined') {
					queue = properties.queue;
					delete properties.queue;
				}

				if (typeof properties.delay !== 'undefined') {
					delay = properties.delay;
					delete properties.delay;
				}

				// Set defaults. (`400` duration, `ease` easing)
				if (typeof duration === 'undefined') { duration = $.fx.speeds._default; }
				if (typeof easing === 'undefined')   { easing = $.cssEase._default; }

				duration = toMS(duration);

				// Build the `transition` property.
				var transitionValue = getTransition(properties, duration, easing, delay);

				// Compute delay until callback.
				// If this becomes 0, don't bother setting the transition property.
				var work = $.transit.enabled && support.transition;
				var i = work ? (parseInt(duration, 10) + parseInt(delay, 10)) : 0;

				// If there's nothing to do...
				if (i === 0) {
					var fn = function(next) {
						self.css(properties);
						if (callback) { callback.apply(self); }
						if (next) { next(); }
					};

					callOrQueue(self, queue, fn);
					return self;
				}

				// Save the old transitions of each element so we can restore it later.
				var oldTransitions = {};

				var run = function(nextCall) {
					var bound = false;

					// Prepare the callback.
					var cb = function() {
						if (bound) { self.unbind(transitionEnd, cb); }

						if (i > 0) {
							self.each(function() {
								this.style[support.transition] = (oldTransitions[this] || null);
							});
						}

						if (typeof callback === 'function') { callback.apply(self); }
						if (typeof nextCall === 'function') { nextCall(); }
					};

					if ((i > 0) && (transitionEnd) && ($.transit.useTransitionEnd)) {
						// Use the 'transitionend' event if it's available.
						bound = true;
						self.bind(transitionEnd, cb);
					} else {
						// Fallback to timers if the 'transitionend' event isn't supported.
						window.setTimeout(cb, i);
					}

					// Apply transitions.
					self.each(function() {
						if (i > 0) {
							this.style[support.transition] = transitionValue;
						}
						$(this).css(properties);
					});
				};

				// Defer running. This allows the browser to paint any pending CSS it hasn't
				// painted yet before doing the transitions.
				var deferredRun = function(next) {
					this.offsetWidth; // force a repaint
					run(next);
				};

				// Use jQuery's fx queue.
				callOrQueue(self, queue, deferredRun);

				// Chainability.
				return this;
			};

			function registerCssHook(prop, isPixels) {
				// For certain properties, the 'px' should not be implied.
				if (!isPixels) { $.cssNumber[prop] = true; }

				$.transit.propertyMap[prop] = support.transform;

				$.cssHooks[prop] = {
					get: function(elem) {
						var t = $(elem).css('transit:transform');
						return t.get(prop);
					},

					set: function(elem, value) {
						var t = $(elem).css('transit:transform');
						t.setFromString(prop, value);

						$(elem).css({ 'transit:transform': t });
					}
				};

			}

			// ### uncamel(str)
			// Converts a camelcase string to a dasherized string.
			// (`marginLeft` => `margin-left`)
			function uncamel(str) {
				return str.replace(/([A-Z])/g, function(letter) { return '-' + letter.toLowerCase(); });
			}

			// ### unit(number, unit)
			// Ensures that number `number` has a unit. If no unit is found, assume the
			// default is `unit`.
			//
			//     unit(2, 'px')          //=> "2px"
			//     unit("30deg", 'rad')   //=> "30deg"
			//
			function unit(i, units) {
				if ((typeof i === "string") && (!i.match(/^[\-0-9\.]+$/))) {
					return i;
				} else {
					return "" + i + units;
				}
			}

			// ### toMS(duration)
			// Converts given `duration` to a millisecond string.
			//
			//     toMS('fast')   //=> '400ms'
			//     toMS(10)       //=> '10ms'
			//
			function toMS(duration) {
				var i = duration;

				// Allow for string durations like 'fast'.
				if ($.fx.speeds[i]) { i = $.fx.speeds[i]; }

				return unit(i, 'ms');
			}

			// Export some functions for testable-ness.
			$.transit.getTransitionValue = getTransition;
		})(jQuery);

	}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
	};

//! Source: vendor/plugins/moment.min.js

	try{
//! moment.js
//! version : 2.9.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
		(function(a){function b(a,b,c){switch(arguments.length){case 2:return null!=a?a:b;case 3:return null!=a?a:null!=b?b:c;default:throw new Error("Implement me")}}function c(a,b){return Bb.call(a,b)}function d(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function e(a){vb.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+a)}function f(a,b){var c=!0;return o(function(){return c&&(e(a),c=!1),b.apply(this,arguments)},b)}function g(a,b){sc[a]||(e(b),sc[a]=!0)}function h(a,b){return function(c){return r(a.call(this,c),b)}}function i(a,b){return function(c){return this.localeData().ordinal(a.call(this,c),b)}}function j(a,b){var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),f=a.clone().add(e,"months");return 0>b-f?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)}function k(a,b,c){var d;return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&12>b&&(b+=12),d||12!==b||(b=0),b):b}function l(){}function m(a,b){b!==!1&&H(a),p(this,a),this._d=new Date(+a._d),uc===!1&&(uc=!0,vb.updateOffset(this),uc=!1)}function n(a){var b=A(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=vb.localeData(),this._bubble()}function o(a,b){for(var d in b)c(b,d)&&(a[d]=b[d]);return c(b,"toString")&&(a.toString=b.toString),c(b,"valueOf")&&(a.valueOf=b.valueOf),a}function p(a,b){var c,d,e;if("undefined"!=typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject),"undefined"!=typeof b._i&&(a._i=b._i),"undefined"!=typeof b._f&&(a._f=b._f),"undefined"!=typeof b._l&&(a._l=b._l),"undefined"!=typeof b._strict&&(a._strict=b._strict),"undefined"!=typeof b._tzm&&(a._tzm=b._tzm),"undefined"!=typeof b._isUTC&&(a._isUTC=b._isUTC),"undefined"!=typeof b._offset&&(a._offset=b._offset),"undefined"!=typeof b._pf&&(a._pf=b._pf),"undefined"!=typeof b._locale&&(a._locale=b._locale),Kb.length>0)for(c in Kb)d=Kb[c],e=b[d],"undefined"!=typeof e&&(a[d]=e);return a}function q(a){return 0>a?Math.ceil(a):Math.floor(a)}function r(a,b,c){for(var d=""+Math.abs(a),e=a>=0;d.length<b;)d="0"+d;return(e?c?"+":"":"-")+d}function s(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function t(a,b){var c;return b=M(b,a),a.isBefore(b)?c=s(a,b):(c=s(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c}function u(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(g(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=vb.duration(c,d),v(this,e,a),this}}function v(a,b,c,d){var e=b._milliseconds,f=b._days,g=b._months;d=null==d?!0:d,e&&a._d.setTime(+a._d+e*c),f&&pb(a,"Date",ob(a,"Date")+f*c),g&&nb(a,ob(a,"Month")+g*c),d&&vb.updateOffset(a,f||g)}function w(a){return"[object Array]"===Object.prototype.toString.call(a)}function x(a){return"[object Date]"===Object.prototype.toString.call(a)||a instanceof Date}function y(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&C(a[d])!==C(b[d]))&&g++;return g+f}function z(a){if(a){var b=a.toLowerCase().replace(/(.)s$/,"$1");a=lc[a]||mc[b]||b}return a}function A(a){var b,d,e={};for(d in a)c(a,d)&&(b=z(d),b&&(e[b]=a[d]));return e}function B(b){var c,d;if(0===b.indexOf("week"))c=7,d="day";else{if(0!==b.indexOf("month"))return;c=12,d="month"}vb[b]=function(e,f){var g,h,i=vb._locale[b],j=[];if("number"==typeof e&&(f=e,e=a),h=function(a){var b=vb().utc().set(d,a);return i.call(vb._locale,b,e||"")},null!=f)return h(f);for(g=0;c>g;g++)j.push(h(g));return j}}function C(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=b>=0?Math.floor(b):Math.ceil(b)),c}function D(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function E(a,b,c){return jb(vb([a,11,31+b-c]),b,c).week}function F(a){return G(a)?366:365}function G(a){return a%4===0&&a%100!==0||a%400===0}function H(a){var b;a._a&&-2===a._pf.overflow&&(b=a._a[Db]<0||a._a[Db]>11?Db:a._a[Eb]<1||a._a[Eb]>D(a._a[Cb],a._a[Db])?Eb:a._a[Fb]<0||a._a[Fb]>24||24===a._a[Fb]&&(0!==a._a[Gb]||0!==a._a[Hb]||0!==a._a[Ib])?Fb:a._a[Gb]<0||a._a[Gb]>59?Gb:a._a[Hb]<0||a._a[Hb]>59?Hb:a._a[Ib]<0||a._a[Ib]>999?Ib:-1,a._pf._overflowDayOfYear&&(Cb>b||b>Eb)&&(b=Eb),a._pf.overflow=b)}function I(b){return null==b._isValid&&(b._isValid=!isNaN(b._d.getTime())&&b._pf.overflow<0&&!b._pf.empty&&!b._pf.invalidMonth&&!b._pf.nullInput&&!b._pf.invalidFormat&&!b._pf.userInvalidated,b._strict&&(b._isValid=b._isValid&&0===b._pf.charsLeftOver&&0===b._pf.unusedTokens.length&&b._pf.bigHour===a)),b._isValid}function J(a){return a?a.toLowerCase().replace("_","-"):a}function K(a){for(var b,c,d,e,f=0;f<a.length;){for(e=J(a[f]).split("-"),b=e.length,c=J(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=L(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&y(e,c,!0)>=b-1)break;b--}f++}return null}function L(a){var b=null;if(!Jb[a]&&Lb)try{b=vb.locale(),require("./locale/"+a),vb.locale(b)}catch(c){}return Jb[a]}function M(a,b){var c,d;return b._isUTC?(c=b.clone(),d=(vb.isMoment(a)||x(a)?+a:+vb(a))-+c,c._d.setTime(+c._d+d),vb.updateOffset(c,!1),c):vb(a).local()}function N(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function O(a){var b,c,d=a.match(Pb);for(b=0,c=d.length;c>b;b++)d[b]=rc[d[b]]?rc[d[b]]:N(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function P(a,b){return a.isValid()?(b=Q(b,a.localeData()),nc[b]||(nc[b]=O(b)),nc[b](a)):a.localeData().invalidDate()}function Q(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Qb.lastIndex=0;d>=0&&Qb.test(a);)a=a.replace(Qb,c),Qb.lastIndex=0,d-=1;return a}function R(a,b){var c,d=b._strict;switch(a){case"Q":return _b;case"DDDD":return bc;case"YYYY":case"GGGG":case"gggg":return d?cc:Tb;case"Y":case"G":case"g":return ec;case"YYYYYY":case"YYYYY":case"GGGGG":case"ggggg":return d?dc:Ub;case"S":if(d)return _b;case"SS":if(d)return ac;case"SSS":if(d)return bc;case"DDD":return Sb;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return Wb;case"a":case"A":return b._locale._meridiemParse;case"x":return Zb;case"X":return $b;case"Z":case"ZZ":return Xb;case"T":return Yb;case"SSSS":return Vb;case"MM":case"DD":case"YY":case"GG":case"gg":case"HH":case"hh":case"mm":case"ss":case"ww":case"WW":return d?ac:Rb;case"M":case"D":case"d":case"H":case"h":case"m":case"s":case"w":case"W":case"e":case"E":return Rb;case"Do":return d?b._locale._ordinalParse:b._locale._ordinalParseLenient;default:return c=new RegExp($(Z(a.replace("\\","")),"i"))}}function S(a){a=a||"";var b=a.match(Xb)||[],c=b[b.length-1]||[],d=(c+"").match(jc)||["-",0,0],e=+(60*d[1])+C(d[2]);return"+"===d[0]?e:-e}function T(a,b,c){var d,e=c._a;switch(a){case"Q":null!=b&&(e[Db]=3*(C(b)-1));break;case"M":case"MM":null!=b&&(e[Db]=C(b)-1);break;case"MMM":case"MMMM":d=c._locale.monthsParse(b,a,c._strict),null!=d?e[Db]=d:c._pf.invalidMonth=b;break;case"D":case"DD":null!=b&&(e[Eb]=C(b));break;case"Do":null!=b&&(e[Eb]=C(parseInt(b.match(/\d{1,2}/)[0],10)));break;case"DDD":case"DDDD":null!=b&&(c._dayOfYear=C(b));break;case"YY":e[Cb]=vb.parseTwoDigitYear(b);break;case"YYYY":case"YYYYY":case"YYYYYY":e[Cb]=C(b);break;case"a":case"A":c._meridiem=b;break;case"h":case"hh":c._pf.bigHour=!0;case"H":case"HH":e[Fb]=C(b);break;case"m":case"mm":e[Gb]=C(b);break;case"s":case"ss":e[Hb]=C(b);break;case"S":case"SS":case"SSS":case"SSSS":e[Ib]=C(1e3*("0."+b));break;case"x":c._d=new Date(C(b));break;case"X":c._d=new Date(1e3*parseFloat(b));break;case"Z":case"ZZ":c._useUTC=!0,c._tzm=S(b);break;case"dd":case"ddd":case"dddd":d=c._locale.weekdaysParse(b),null!=d?(c._w=c._w||{},c._w.d=d):c._pf.invalidWeekday=b;break;case"w":case"ww":case"W":case"WW":case"d":case"e":case"E":a=a.substr(0,1);case"gggg":case"GGGG":case"GGGGG":a=a.substr(0,2),b&&(c._w=c._w||{},c._w[a]=C(b));break;case"gg":case"GG":c._w=c._w||{},c._w[a]=vb.parseTwoDigitYear(b)}}function U(a){var c,d,e,f,g,h,i;c=a._w,null!=c.GG||null!=c.W||null!=c.E?(g=1,h=4,d=b(c.GG,a._a[Cb],jb(vb(),1,4).year),e=b(c.W,1),f=b(c.E,1)):(g=a._locale._week.dow,h=a._locale._week.doy,d=b(c.gg,a._a[Cb],jb(vb(),g,h).year),e=b(c.w,1),null!=c.d?(f=c.d,g>f&&++e):f=null!=c.e?c.e+g:g),i=kb(d,e,f,h,g),a._a[Cb]=i.year,a._dayOfYear=i.dayOfYear}function V(a){var c,d,e,f,g=[];if(!a._d){for(e=X(a),a._w&&null==a._a[Eb]&&null==a._a[Db]&&U(a),a._dayOfYear&&(f=b(a._a[Cb],e[Cb]),a._dayOfYear>F(f)&&(a._pf._overflowDayOfYear=!0),d=fb(f,0,a._dayOfYear),a._a[Db]=d.getUTCMonth(),a._a[Eb]=d.getUTCDate()),c=0;3>c&&null==a._a[c];++c)a._a[c]=g[c]=e[c];for(;7>c;c++)a._a[c]=g[c]=null==a._a[c]?2===c?1:0:a._a[c];24===a._a[Fb]&&0===a._a[Gb]&&0===a._a[Hb]&&0===a._a[Ib]&&(a._nextDay=!0,a._a[Fb]=0),a._d=(a._useUTC?fb:eb).apply(null,g),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[Fb]=24)}}function W(a){var b;a._d||(b=A(a._i),a._a=[b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],V(a))}function X(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function Y(b){if(b._f===vb.ISO_8601)return void ab(b);b._a=[],b._pf.empty=!0;var c,d,e,f,g,h=""+b._i,i=h.length,j=0;for(e=Q(b._f,b._locale).match(Pb)||[],c=0;c<e.length;c++)f=e[c],d=(h.match(R(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&b._pf.unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),j+=d.length),rc[f]?(d?b._pf.empty=!1:b._pf.unusedTokens.push(f),T(f,d,b)):b._strict&&!d&&b._pf.unusedTokens.push(f);b._pf.charsLeftOver=i-j,h.length>0&&b._pf.unusedInput.push(h),b._pf.bigHour===!0&&b._a[Fb]<=12&&(b._pf.bigHour=a),b._a[Fb]=k(b._locale,b._a[Fb],b._meridiem),V(b),H(b)}function Z(a){return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e})}function $(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function _(a){var b,c,e,f,g;if(0===a._f.length)return a._pf.invalidFormat=!0,void(a._d=new Date(0/0));for(f=0;f<a._f.length;f++)g=0,b=p({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._pf=d(),b._f=a._f[f],Y(b),I(b)&&(g+=b._pf.charsLeftOver,g+=10*b._pf.unusedTokens.length,b._pf.score=g,(null==e||e>g)&&(e=g,c=b));o(a,c||b)}function ab(a){var b,c,d=a._i,e=fc.exec(d);if(e){for(a._pf.iso=!0,b=0,c=hc.length;c>b;b++)if(hc[b][1].exec(d)){a._f=hc[b][0]+(e[6]||" ");break}for(b=0,c=ic.length;c>b;b++)if(ic[b][1].exec(d)){a._f+=ic[b][0];break}d.match(Xb)&&(a._f+="Z"),Y(a)}else a._isValid=!1}function bb(a){ab(a),a._isValid===!1&&(delete a._isValid,vb.createFromInputFallback(a))}function cb(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function db(b){var c,d=b._i;d===a?b._d=new Date:x(d)?b._d=new Date(+d):null!==(c=Mb.exec(d))?b._d=new Date(+c[1]):"string"==typeof d?bb(b):w(d)?(b._a=cb(d.slice(0),function(a){return parseInt(a,10)}),V(b)):"object"==typeof d?W(b):"number"==typeof d?b._d=new Date(d):vb.createFromInputFallback(b)}function eb(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function fb(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function gb(a,b){if("string"==typeof a)if(isNaN(a)){if(a=b.weekdaysParse(a),"number"!=typeof a)return null}else a=parseInt(a,10);return a}function hb(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function ib(a,b,c){var d=vb.duration(a).abs(),e=Ab(d.as("s")),f=Ab(d.as("m")),g=Ab(d.as("h")),h=Ab(d.as("d")),i=Ab(d.as("M")),j=Ab(d.as("y")),k=e<oc.s&&["s",e]||1===f&&["m"]||f<oc.m&&["mm",f]||1===g&&["h"]||g<oc.h&&["hh",g]||1===h&&["d"]||h<oc.d&&["dd",h]||1===i&&["M"]||i<oc.M&&["MM",i]||1===j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,hb.apply({},k)}function jb(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=vb(a).add(f,"d"),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function kb(a,b,c,d,e){var f,g,h=fb(a,0,1).getUTCDay();return h=0===h?7:h,c=null!=c?c:e,f=e-h+(h>d?7:0)-(e>h?7:0),g=7*(b-1)+(c-e)+f+1,{year:g>0?a:a-1,dayOfYear:g>0?g:F(a-1)+g}}function lb(b){var c,d=b._i,e=b._f;return b._locale=b._locale||vb.localeData(b._l),null===d||e===a&&""===d?vb.invalid({nullInput:!0}):("string"==typeof d&&(b._i=d=b._locale.preparse(d)),vb.isMoment(d)?new m(d,!0):(e?w(e)?_(b):Y(b):db(b),c=new m(b),c._nextDay&&(c.add(1,"d"),c._nextDay=a),c))}function mb(a,b){var c,d;if(1===b.length&&w(b[0])&&(b=b[0]),!b.length)return vb();for(c=b[0],d=1;d<b.length;++d)b[d][a](c)&&(c=b[d]);return c}function nb(a,b){var c;return"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),D(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function ob(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function pb(a,b,c){return"Month"===b?nb(a,c):a._d["set"+(a._isUTC?"UTC":"")+b](c)}function qb(a,b){return function(c){return null!=c?(pb(this,a,c),vb.updateOffset(this,b),this):ob(this,a)}}function rb(a){return 400*a/146097}function sb(a){return 146097*a/400}function tb(a){vb.duration.fn[a]=function(){return this._data[a]}}function ub(a){"undefined"==typeof ender&&(wb=zb.moment,zb.moment=a?f("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.",vb):vb)}for(var vb,wb,xb,yb="2.9.0",zb="undefined"==typeof global||"undefined"!=typeof window&&window!==global.window?this:global,Ab=Math.round,Bb=Object.prototype.hasOwnProperty,Cb=0,Db=1,Eb=2,Fb=3,Gb=4,Hb=5,Ib=6,Jb={},Kb=[],Lb="undefined"!=typeof module&&module&&module.exports,Mb=/^\/?Date\((\-?\d+)/i,Nb=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Ob=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,Pb=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,Qb=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Rb=/\d\d?/,Sb=/\d{1,3}/,Tb=/\d{1,4}/,Ub=/[+\-]?\d{1,6}/,Vb=/\d+/,Wb=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Xb=/Z|[\+\-]\d\d:?\d\d/gi,Yb=/T/i,Zb=/[\+\-]?\d+/,$b=/[\+\-]?\d+(\.\d{1,3})?/,_b=/\d/,ac=/\d\d/,bc=/\d{3}/,cc=/\d{4}/,dc=/[+-]?\d{6}/,ec=/[+-]?\d+/,fc=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,gc="YYYY-MM-DDTHH:mm:ssZ",hc=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],ic=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],jc=/([\+\-]|\d\d)/gi,kc=("Date|Hours|Minutes|Seconds|Milliseconds".split("|"),{Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6}),lc={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",D:"date",w:"week",W:"isoWeek",M:"month",Q:"quarter",y:"year",DDD:"dayOfYear",e:"weekday",E:"isoWeekday",gg:"weekYear",GG:"isoWeekYear"},mc={dayofyear:"dayOfYear",isoweekday:"isoWeekday",isoweek:"isoWeek",weekyear:"weekYear",isoweekyear:"isoWeekYear"},nc={},oc={s:45,m:45,h:22,d:26,M:11},pc="DDD w W M D d".split(" "),qc="M D H h m s w W".split(" "),rc={M:function(){return this.month()+1},MMM:function(a){return this.localeData().monthsShort(this,a)},MMMM:function(a){return this.localeData().months(this,a)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(a){return this.localeData().weekdaysMin(this,a)},ddd:function(a){return this.localeData().weekdaysShort(this,a)},dddd:function(a){return this.localeData().weekdays(this,a)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return r(this.year()%100,2)},YYYY:function(){return r(this.year(),4)},YYYYY:function(){return r(this.year(),5)},YYYYYY:function(){var a=this.year(),b=a>=0?"+":"-";return b+r(Math.abs(a),6)},gg:function(){return r(this.weekYear()%100,2)},gggg:function(){return r(this.weekYear(),4)},ggggg:function(){return r(this.weekYear(),5)},GG:function(){return r(this.isoWeekYear()%100,2)},GGGG:function(){return r(this.isoWeekYear(),4)},GGGGG:function(){return r(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.localeData().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return C(this.milliseconds()/100)},SS:function(){return r(C(this.milliseconds()/10),2)},SSS:function(){return r(this.milliseconds(),3)},SSSS:function(){return r(this.milliseconds(),3)},Z:function(){var a=this.utcOffset(),b="+";return 0>a&&(a=-a,b="-"),b+r(C(a/60),2)+":"+r(C(a)%60,2)},ZZ:function(){var a=this.utcOffset(),b="+";return 0>a&&(a=-a,b="-"),b+r(C(a/60),2)+r(C(a)%60,2)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},x:function(){return this.valueOf()},X:function(){return this.unix()},Q:function(){return this.quarter()}},sc={},tc=["months","monthsShort","weekdays","weekdaysShort","weekdaysMin"],uc=!1;pc.length;)xb=pc.pop(),rc[xb+"o"]=i(rc[xb],xb);for(;qc.length;)xb=qc.pop(),rc[xb+xb]=h(rc[xb],2);rc.DDDD=h(rc.DDD,3),o(l.prototype,{set:function(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(a){return this._months[a.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(a){return this._monthsShort[a.month()]},monthsParse:function(a,b,c){var d,e,f;for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;12>d;d++){if(e=vb.utc([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(a){return this._weekdays[a.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(a){return this._weekdaysShort[a.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(a){return this._weekdaysMin[a.day()]},weekdaysParse:function(a){var b,c,d;for(this._weekdaysParse||(this._weekdaysParse=[]),b=0;7>b;b++)if(this._weekdaysParse[b]||(c=vb([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b},_longDateFormat:{LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY LT",LLLL:"dddd, MMMM D, YYYY LT"},longDateFormat:function(a){var b=this._longDateFormat[a];return!b&&this._longDateFormat[a.toUpperCase()]&&(b=this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a]=b),b},isPM:function(a){return"p"===(a+"").toLowerCase().charAt(0)},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(a,b,c){var d=this._calendar[a];return"function"==typeof d?d.apply(b,[c]):d},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)},pastFuture:function(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)},ordinal:function(a){return this._ordinal.replace("%d",a)},_ordinal:"%d",_ordinalParse:/\d{1,2}/,preparse:function(a){return a},postformat:function(a){return a},week:function(a){return jb(a,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6},firstDayOfWeek:function(){return this._week.dow},firstDayOfYear:function(){return this._week.doy},_invalidDate:"Invalid date",invalidDate:function(){return this._invalidDate}}),vb=function(b,c,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._i=b,g._f=c,g._l=e,g._strict=f,g._isUTC=!1,g._pf=d(),lb(g)},vb.suppressDeprecationWarnings=!1,vb.createFromInputFallback=f("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),vb.min=function(){var a=[].slice.call(arguments,0);return mb("isBefore",a)},vb.max=function(){var a=[].slice.call(arguments,0);return mb("isAfter",a)},vb.utc=function(b,c,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._useUTC=!0,g._isUTC=!0,g._l=e,g._i=b,g._f=c,g._strict=f,g._pf=d(),lb(g).utc()},vb.unix=function(a){return vb(1e3*a)},vb.duration=function(a,b){var d,e,f,g,h=a,i=null;return vb.isDuration(a)?h={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(h={},b?h[b]=a:h.milliseconds=a):(i=Nb.exec(a))?(d="-"===i[1]?-1:1,h={y:0,d:C(i[Eb])*d,h:C(i[Fb])*d,m:C(i[Gb])*d,s:C(i[Hb])*d,ms:C(i[Ib])*d}):(i=Ob.exec(a))?(d="-"===i[1]?-1:1,f=function(a){var b=a&&parseFloat(a.replace(",","."));return(isNaN(b)?0:b)*d},h={y:f(i[2]),M:f(i[3]),d:f(i[4]),h:f(i[5]),m:f(i[6]),s:f(i[7]),w:f(i[8])}):null==h?h={}:"object"==typeof h&&("from"in h||"to"in h)&&(g=t(vb(h.from),vb(h.to)),h={},h.ms=g.milliseconds,h.M=g.months),e=new n(h),vb.isDuration(a)&&c(a,"_locale")&&(e._locale=a._locale),e},vb.version=yb,vb.defaultFormat=gc,vb.ISO_8601=function(){},vb.momentProperties=Kb,vb.updateOffset=function(){},vb.relativeTimeThreshold=function(b,c){return oc[b]===a?!1:c===a?oc[b]:(oc[b]=c,!0)},vb.lang=f("moment.lang is deprecated. Use moment.locale instead.",function(a,b){return vb.locale(a,b)}),vb.locale=function(a,b){var c;return a&&(c="undefined"!=typeof b?vb.defineLocale(a,b):vb.localeData(a),c&&(vb.duration._locale=vb._locale=c)),vb._locale._abbr},vb.defineLocale=function(a,b){return null!==b?(b.abbr=a,Jb[a]||(Jb[a]=new l),Jb[a].set(b),vb.locale(a),Jb[a]):(delete Jb[a],null)},vb.langData=f("moment.langData is deprecated. Use moment.localeData instead.",function(a){return vb.localeData(a)}),vb.localeData=function(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return vb._locale;if(!w(a)){if(b=L(a))return b;a=[a]}return K(a)},vb.isMoment=function(a){return a instanceof m||null!=a&&c(a,"_isAMomentObject")},vb.isDuration=function(a){return a instanceof n};for(xb=tc.length-1;xb>=0;--xb)B(tc[xb]);vb.normalizeUnits=function(a){return z(a)},vb.invalid=function(a){var b=vb.utc(0/0);return null!=a?o(b._pf,a):b._pf.userInvalidated=!0,b},vb.parseZone=function(){return vb.apply(null,arguments).parseZone()},vb.parseTwoDigitYear=function(a){return C(a)+(C(a)>68?1900:2e3)},vb.isDate=x,o(vb.fn=m.prototype,{clone:function(){return vb(this)},valueOf:function(){return+this._d-6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){var a=vb(this).utc();return 0<a.year()&&a.year()<=9999?"function"==typeof Date.prototype.toISOString?this.toDate().toISOString():P(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):P(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds()]},isValid:function(){return I(this)},isDSTShifted:function(){return this._a?this.isValid()&&y(this._a,(this._isUTC?vb.utc(this._a):vb(this._a)).toArray())>0:!1},parsingFlags:function(){return o({},this._pf)},invalidAt:function(){return this._pf.overflow},utc:function(a){return this.utcOffset(0,a)},local:function(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(this._dateUtcOffset(),"m")),this},format:function(a){var b=P(this,a||vb.defaultFormat);return this.localeData().postformat(b)},add:u(1,"add"),subtract:u(-1,"subtract"),diff:function(a,b,c){var d,e,f=M(a,this),g=6e4*(f.utcOffset()-this.utcOffset());return b=z(b),"year"===b||"month"===b||"quarter"===b?(e=j(this,f),"quarter"===b?e/=3:"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:q(e)},from:function(a,b){return vb.duration({to:this,from:a}).locale(this.locale()).humanize(!b)},fromNow:function(a){return this.from(vb(),a)},calendar:function(a){var b=a||vb(),c=M(b,this).startOf("day"),d=this.diff(c,"days",!0),e=-6>d?"sameElse":-1>d?"lastWeek":0>d?"lastDay":1>d?"sameDay":2>d?"nextDay":7>d?"nextWeek":"sameElse";return this.format(this.localeData().calendar(e,this,vb(b)))},isLeapYear:function(){return G(this.year())},isDST:function(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=gb(a,this.localeData()),this.add(a-b,"d")):b},month:qb("Month",!0),startOf:function(a){switch(a=z(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a?this.weekday(0):"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this},endOf:function(b){return b=z(b),b===a||"millisecond"===b?this:this.startOf(b).add(1,"isoWeek"===b?"week":b).subtract(1,"ms")},isAfter:function(a,b){var c;return b=z("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=vb.isMoment(a)?a:vb(a),+this>+a):(c=vb.isMoment(a)?+a:+vb(a),c<+this.clone().startOf(b))},isBefore:function(a,b){var c;return b=z("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=vb.isMoment(a)?a:vb(a),+a>+this):(c=vb.isMoment(a)?+a:+vb(a),+this.clone().endOf(b)<c)},isBetween:function(a,b,c){return this.isAfter(a,c)&&this.isBefore(b,c)},isSame:function(a,b){var c;return b=z(b||"millisecond"),"millisecond"===b?(a=vb.isMoment(a)?a:vb(a),+this===+a):(c=+vb(a),+this.clone().startOf(b)<=c&&c<=+this.clone().endOf(b))},min:f("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(a){return a=vb.apply(null,arguments),this>a?this:a}),max:f("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(a){return a=vb.apply(null,arguments),a>this?this:a}),zone:f("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",function(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}),utcOffset:function(a,b){var c,d=this._offset||0;return null!=a?("string"==typeof a&&(a=S(a)),Math.abs(a)<16&&(a=60*a),!this._isUTC&&b&&(c=this._dateUtcOffset()),this._offset=a,this._isUTC=!0,null!=c&&this.add(c,"m"),d!==a&&(!b||this._changeInProgress?v(this,vb.duration(a-d,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,vb.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?d:this._dateUtcOffset()},isLocal:function(){return!this._isUTC},isUtcOffset:function(){return this._isUTC},isUtc:function(){return this._isUTC&&0===this._offset},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},parseZone:function(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(S(this._i)),this},hasAlignedHourOffset:function(a){return a=a?vb(a).utcOffset():0,(this.utcOffset()-a)%60===0},daysInMonth:function(){return D(this.year(),this.month())},dayOfYear:function(a){var b=Ab((vb(this).startOf("day")-vb(this).startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")},quarter:function(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)},weekYear:function(a){var b=jb(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")},isoWeekYear:function(a){var b=jb(this,1,4).year;return null==a?b:this.add(a-b,"y")},week:function(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")},isoWeek:function(a){var b=jb(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")},weekday:function(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")},isoWeekday:function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)},isoWeeksInYear:function(){return E(this.year(),1,4)},weeksInYear:function(){var a=this.localeData()._week;return E(this.year(),a.dow,a.doy)},get:function(a){return a=z(a),this[a]()},set:function(a,b){var c;if("object"==typeof a)for(c in a)this.set(c,a[c]);else a=z(a),"function"==typeof this[a]&&this[a](b);return this},locale:function(b){var c;return b===a?this._locale._abbr:(c=vb.localeData(b),null!=c&&(this._locale=c),this)},lang:f("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(b){return b===a?this.localeData():this.locale(b)}),localeData:function(){return this._locale},_dateUtcOffset:function(){return 15*-Math.round(this._d.getTimezoneOffset()/15)}}),vb.fn.millisecond=vb.fn.milliseconds=qb("Milliseconds",!1),vb.fn.second=vb.fn.seconds=qb("Seconds",!1),vb.fn.minute=vb.fn.minutes=qb("Minutes",!1),vb.fn.hour=vb.fn.hours=qb("Hours",!0),vb.fn.date=qb("Date",!0),vb.fn.dates=f("dates accessor is deprecated. Use date instead.",qb("Date",!0)),vb.fn.year=qb("FullYear",!0),vb.fn.years=f("years accessor is deprecated. Use year instead.",qb("FullYear",!0)),vb.fn.days=vb.fn.day,vb.fn.months=vb.fn.month,vb.fn.weeks=vb.fn.week,vb.fn.isoWeeks=vb.fn.isoWeek,vb.fn.quarters=vb.fn.quarter,vb.fn.toJSON=vb.fn.toISOString,vb.fn.isUTC=vb.fn.isUtc,o(vb.duration.fn=n.prototype,{_bubble:function(){var a,b,c,d=this._milliseconds,e=this._days,f=this._months,g=this._data,h=0;g.milliseconds=d%1e3,a=q(d/1e3),g.seconds=a%60,b=q(a/60),g.minutes=b%60,c=q(b/60),g.hours=c%24,e+=q(c/24),h=q(rb(e)),e-=q(sb(h)),f+=q(e/30),e%=30,h+=q(f/12),f%=12,g.days=e,g.months=f,g.years=h},abs:function(){return this._milliseconds=Math.abs(this._milliseconds),this._days=Math.abs(this._days),this._months=Math.abs(this._months),this._data.milliseconds=Math.abs(this._data.milliseconds),this._data.seconds=Math.abs(this._data.seconds),this._data.minutes=Math.abs(this._data.minutes),this._data.hours=Math.abs(this._data.hours),this._data.months=Math.abs(this._data.months),this._data.years=Math.abs(this._data.years),this},weeks:function(){return q(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*C(this._months/12)
		},humanize:function(a){var b=ib(this,!a,this.localeData());return a&&(b=this.localeData().pastFuture(+this,b)),this.localeData().postformat(b)},add:function(a,b){var c=vb.duration(a,b);return this._milliseconds+=c._milliseconds,this._days+=c._days,this._months+=c._months,this._bubble(),this},subtract:function(a,b){var c=vb.duration(a,b);return this._milliseconds-=c._milliseconds,this._days-=c._days,this._months-=c._months,this._bubble(),this},get:function(a){return a=z(a),this[a.toLowerCase()+"s"]()},as:function(a){var b,c;if(a=z(a),"month"===a||"year"===a)return b=this._days+this._milliseconds/864e5,c=this._months+12*rb(b),"month"===a?c:c/12;switch(b=this._days+Math.round(sb(this._months/12)),a){case"week":return b/7+this._milliseconds/6048e5;case"day":return b+this._milliseconds/864e5;case"hour":return 24*b+this._milliseconds/36e5;case"minute":return 24*b*60+this._milliseconds/6e4;case"second":return 24*b*60*60+this._milliseconds/1e3;case"millisecond":return Math.floor(24*b*60*60*1e3)+this._milliseconds;default:throw new Error("Unknown unit "+a)}},lang:vb.fn.lang,locale:vb.fn.locale,toIsoString:f("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",function(){return this.toISOString()}),toISOString:function(){var a=Math.abs(this.years()),b=Math.abs(this.months()),c=Math.abs(this.days()),d=Math.abs(this.hours()),e=Math.abs(this.minutes()),f=Math.abs(this.seconds()+this.milliseconds()/1e3);return this.asSeconds()?(this.asSeconds()<0?"-":"")+"P"+(a?a+"Y":"")+(b?b+"M":"")+(c?c+"D":"")+(d||e||f?"T":"")+(d?d+"H":"")+(e?e+"M":"")+(f?f+"S":""):"P0D"},localeData:function(){return this._locale},toJSON:function(){return this.toISOString()}}),vb.duration.fn.toString=vb.duration.fn.toISOString;for(xb in kc)c(kc,xb)&&tb(xb.toLowerCase());vb.duration.fn.asMilliseconds=function(){return this.as("ms")},vb.duration.fn.asSeconds=function(){return this.as("s")},vb.duration.fn.asMinutes=function(){return this.as("m")},vb.duration.fn.asHours=function(){return this.as("h")},vb.duration.fn.asDays=function(){return this.as("d")},vb.duration.fn.asWeeks=function(){return this.as("weeks")},vb.duration.fn.asMonths=function(){return this.as("M")},vb.duration.fn.asYears=function(){return this.as("y")},vb.locale("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===C(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),Lb?module.exports=vb:"function"==typeof define&&define.amd?(define(function(a,b,c){return c.config&&c.config()&&c.config().noGlobal===!0&&(zb.moment=wb),vb}),ub(!0)):ub()}).call(this);
	}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
	};
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/modernizr/modernizr.flexbox.min.js

try{
	/* Modernizr 2.7.0 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-flexbox-shiv-cssclasses-testprop-testallprops-domprefixes-load
 */
	console.log('starting parsing modernizr.flexbox.min.js');
	;window.Modernizr=function(a,b,c){function x(a){j.cssText=a}function y(a,b){return x(prefixes.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b){for(var d in a){var e=a[d];if(!A(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}function D(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+n.join(d+" ")+d).split(" ");return z(b,"string")||z(b,"undefined")?B(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),C(e,b,c))}var d="2.7.0",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e}),p.flexbox=function(){return D("flexWrap")};for(var E in p)w(p,E)&&(u=E.toLowerCase(),e[u]=p[E](),s.push((e[u]?"":"no-")+u));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._domPrefixes=o,e._cssomPrefixes=n,e.testProp=function(a){return B([a])},e.testAllProps=D,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+s.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
	console.log('ending parsing modernizr.flexbox.min.js');
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/modernizr/modernizr.inputTypes.min.js

try{
	/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-input-inputtypes-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes
 */
	console.log('starting parsing modernizrInputType.js');
	;window.Modernizr=function(a,b,c){function A(a){i.cssText=a}function B(a,b){return A(m.join(a+";")+(b||""))}function C(a,b){return typeof a===b}function D(a,b){return!!~(""+a).indexOf(b)}function E(a,b){for(var d in a){var e=a[d];if(!D(e,"-")&&i[e]!==c)return b=="pfx"?e:!0}return!1}function F(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:C(f,"function")?f.bind(d||b):f}return!1}function G(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return C(b,"string")||C(b,"undefined")?E(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),F(e,b,c))}function H(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)s[c[d]]=c[d]in j;return s.list&&(s.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),s}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,g,h,i=a.length;d<i;d++)j.setAttribute("type",g=a[d]),e=j.type!=="text",e&&(j.value=k,j.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(g)&&j.style.WebkitAppearance!==c?(f.appendChild(j),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(j,null).WebkitAppearance!=="textfield"&&j.offsetHeight!==0,f.removeChild(j)):/^(search|tel)$/.test(g)||(/^(url|email)$/.test(g)?e=j.checkValidity&&j.checkValidity()===!1:e=j.value!=k)),r[a[d]]=!!e;return r}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.6.2",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j=b.createElement("input"),k=":)",l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},x=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=C(e[d],"function"),C(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),y={}.hasOwnProperty,z;!C(y,"undefined")&&!C(y.call,"undefined")?z=function(a,b){return y.call(a,b)}:z=function(a,b){return b in a&&C(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e});for(var I in q)z(q,I)&&(v=I.toLowerCase(),e[v]=q[I](),t.push((e[v]?"":"no-")+v));return e.input||H(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)z(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},A(""),h=j=null,e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.hasEvent=x,e.testProp=function(a){return E([a])},e.testAllProps=G,e.testStyles=w,e}(this,this.document);
	console.log('ending parsing modernizrInputType.js');

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/fastclick/build/fastclick.min.js

try{
	/*
 FastClick: polyfill to remove click delays on browsers with touch UIs.

 @version 0.6.3
 @codingstandard ftlabs-jsv2
 @copyright The Financial Times Limited [All Rights Reserved]
 @license MIT License (see LICENSE.txt)
*/
	console.log('starting parsing fastclick.js');
	function FastClick(a,c){var d,b=this,f;this.trackingClick=!1;this.trackingClickStart=0;this.targetElement=null;this.lastTouchIdentifier=this.touchStartY=this.touchStartX=0;this.layer=a;if(!a||!a.nodeType)throw new TypeError("Layer must be a document node");this.options={onTouchStart:null,onClickCancelled:null,onTouchEnd:null,onBeforeClick:null};for(f in c)this.options[f]=c[f];this.onClick=function(){return FastClick.prototype.onClick.apply(b,arguments)};this.onMouse=function(){return FastClick.prototype.onMouse.apply(b,
		arguments)};this.onTouchMove=function(){return FastClick.prototype.onTouchMove.apply(b,arguments)};this.onTouchStart=function(){b.options.onClickCancelled&&window.addEventListener("touchmove",b.onTouchMove,!0);var a=FastClick.prototype.onTouchStart.apply(b,arguments);b.options.onTouchStart&&b.options.onTouchStart.call(b);return a};this.onTouchEnd=function(){b.options.onClickCancelled&&window.removeEventListener("touchmove",b.onTouchMove,!0);var a=FastClick.prototype.onTouchEnd.apply(b,arguments);
		b.options.onTouchEnd&&b.options.onTouchEnd.call(b,{target:null,origEvent:event});return a};this.onTouchCancel=function(){return FastClick.prototype.onTouchCancel.apply(b,arguments)};FastClick.notNeeded()||(this.deviceIsAndroid&&(a.addEventListener("mouseover",this.onMouse,!0),a.addEventListener("mousedown",this.onMouse,!0),a.addEventListener("mouseup",this.onMouse,!0)),a.addEventListener("click",this.onClick,!0),a.addEventListener("touchstart",this.onTouchStart,!1),a.addEventListener("touchend",this.onTouchEnd,
		!1),a.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(a.removeEventListener=function(b,c,d){var e=Node.prototype.removeEventListener;"click"===b?e.call(a,b,c.hijacked||c,d):e.call(a,b,c,d)},a.addEventListener=function(b,c,d){var e=Node.prototype.addEventListener;"click"===b?e.call(a,b,c.hijacked||(c.hijacked=function(a){a.propagationStopped||c(a)}),d):e.call(a,b,c,d)}),"function"===typeof a.onclick&&(d=a.onclick,a.addEventListener("click",function(a){d(a)},
		!1),a.onclick=null))}FastClick.prototype.deviceIsAndroid=0<navigator.userAgent.indexOf("Android");FastClick.prototype.deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent);FastClick.prototype.deviceIsIOS4=FastClick.prototype.deviceIsIOS&&/OS 4_\d(_\d)?/.test(navigator.userAgent);FastClick.prototype.deviceIsIOSWithBadTarget=FastClick.prototype.deviceIsIOS&&/OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);
	FastClick.prototype.needsClick=function(a){switch(a.nodeName.toLowerCase()){case "button":case "input":return this.deviceIsIOS&&"file"===a.type?!0:a.disabled;case "label":case "video":return!0;default:return/\bneedsclick\b/.test(a.className)}};
	FastClick.prototype.needsFocus=function(a){switch(a.nodeName.toLowerCase()){case "textarea":case "select":return!0;case "input":switch(a.type){case "button":case "checkbox":case "file":case "image":case "radio":case "submit":return!1}return!a.disabled&&!a.readOnly;default:return/\bneedsfocus\b/.test(a.className)}};
	FastClick.prototype.sendClick=function(a,c){var d,b;document.activeElement&&document.activeElement!==a&&document.activeElement.blur();b=c.changedTouches[0];d=document.createEvent("MouseEvents");d.initMouseEvent("click",!0,!0,window,1,b.screenX,b.screenY,b.clientX,b.clientY,!1,!1,!1,!1,0,null);d.forwardedTouchEvent=!0;this.options.onBeforeClick&&this.options.onBeforeClick.call(this);a.dispatchEvent(d)};
	FastClick.prototype.focus=function(a){var c;this.deviceIsIOS&&a.setSelectionRange?(c=a.value.length,a.setSelectionRange(c,c)):a.focus()};FastClick.prototype.updateScrollParent=function(a){var c,d;c=a.fastClickScrollParent;if(!c||!c.contains(a)){d=a;do{if(d.scrollHeight>d.offsetHeight){c=d;a.fastClickScrollParent=d;break}d=d.parentElement}while(d)}c&&(c.fastClickLastScrollTop=c.scrollTop)};
	FastClick.prototype.getTargetElementFromEventTarget=function(a){return a.nodeType===Node.TEXT_NODE?a.parentNode:a};
	FastClick.prototype.onTouchStart=function(a){var c,d,b;c=this.getTargetElementFromEventTarget(a.target);d=a.targetTouches[0];if(this.deviceIsIOS){b=window.getSelection();if(b.rangeCount&&!b.isCollapsed)return!0;if(!this.deviceIsIOS4){if(d.identifier===this.lastTouchIdentifier)return a.preventDefault(),!1;this.lastTouchIdentifier=d.identifier;this.updateScrollParent(c)}}this.trackingClick=!0;this.trackingClickStart=a.timeStamp;this.targetElement=c;this.touchStartX=d.pageX;this.touchStartY=d.pageY;
		200>a.timeStamp-this.lastClickTime&&a.preventDefault();return!0};FastClick.prototype.touchHasMoved=function(a){a=a.changedTouches[0];return 10<Math.abs(a.pageX-this.touchStartX)||10<Math.abs(a.pageY-this.touchStartY)?!0:!1};FastClick.prototype.onTouchMove=function(a){this.touchHasMoved(a)&&(this.options.onClickCancelled.call(this),window.removeEventListener("touchmove",this.onTouchMove,!0));return!0};
	FastClick.prototype.findControl=function(a){return void 0!==a.control?a.control:a.htmlFor?document.getElementById(a.htmlFor):a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")};
	FastClick.prototype.onTouchEnd=function(a){var c,d,b;b=this.targetElement;this.touchHasMoved(a)&&(this.trackingClick=!1,this.targetElement=null);if(!this.trackingClick)return!0;if(200>a.timeStamp-this.lastClickTime)return this.cancelNextClick=!0;this.lastClickTime=a.timeStamp;c=this.trackingClickStart;this.trackingClick=!1;this.trackingClickStart=0;this.deviceIsIOSWithBadTarget&&(b=a.changedTouches[0],b=document.elementFromPoint(b.pageX-window.pageXOffset,b.pageY-window.pageYOffset));d=b.tagName.toLowerCase();
		if("label"===d){if(c=this.findControl(b)){this.focus(b);if(this.deviceIsAndroid)return!1;b=c}}else if(this.needsFocus(b)){if(100<a.timeStamp-c||this.deviceIsIOS&&window.top!==window&&"input"===d)return this.targetElement=null,!1;this.focus(b);if(!this.deviceIsIOS4||"select"!==d)this.targetElement=null,a.preventDefault();return!1}if(this.deviceIsIOS&&!this.deviceIsIOS4&&(c=b.fastClickScrollParent)&&c.fastClickLastScrollTop!==c.scrollTop)return!0;this.needsClick(b)||(a.preventDefault(),this.sendClick(b,
			a));return!1};FastClick.prototype.onTouchCancel=function(){this.trackingClick=!1;this.targetElement=null};FastClick.prototype.onMouse=function(a){return!this.targetElement||a.forwardedTouchEvent||!a.cancelable?!0:!this.needsClick(this.targetElement)||this.cancelNextClick?(a.stopImmediatePropagation?a.stopImmediatePropagation():a.propagationStopped=!0,a.stopPropagation(),a.preventDefault(),!1):!0};
	FastClick.prototype.onClick=function(a){if(this.trackingClick)return this.targetElement=null,this.trackingClick=!1,!0;if("submit"===a.target.type&&0===a.detail)return!0;a=this.onMouse(a);a||(this.targetElement=null);return a};
	FastClick.prototype.destroy=function(){var a=this.layer;this.deviceIsAndroid&&(a.removeEventListener("mouseover",this.onMouse,!0),a.removeEventListener("mousedown",this.onMouse,!0),a.removeEventListener("mouseup",this.onMouse,!0));a.removeEventListener("click",this.onClick,!0);a.removeEventListener("touchstart",this.onTouchStart,!1);a.removeEventListener("touchend",this.onTouchEnd,!1);a.removeEventListener("touchcancel",this.onTouchCancel,!1)};
	FastClick.notNeeded=function(){return"undefined"===typeof window.ontouchstart?!0:!1};FastClick.attach=function(a){return new FastClick(a)};"undefined"!==typeof define&&define.amd&&define(function(){return FastClick});"undefined"!==typeof module&&module.exports&&(module.exports=FastClick.attach,module.exports.FastClick=FastClick);
	console.log('ending parsing fastclick.js');

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/mobiscroll/2.11.1.patch/mobiscroll.js

try{
	/*! mobile - v1.0.0 - 2014-07-21
 * Copyright (c) 2014 ; Licensed  */
	/*!
 * Mobiscroll v2.11.1
 * http://mobiscroll.com
 *
 * Copyright 2010-2014, Acid Media
 * Licensed under the MIT license.
 *
 */
	console.log('starting parsing mobiscroll.js');
	(function ($) {

		function testProps(props) {
			var i;
			for (i in props) {
				if (mod[props[i]] !== undefined) {
					return true;
				}
			}
			return false;
		}

		function testPrefix() {
			var prefixes = ['Webkit', 'Moz', 'O', 'ms'],
			    p;

			for (p in prefixes) {
				if (testProps([prefixes[p] + 'Transform'])) {
					return '-' + prefixes[p].toLowerCase() + '-';
				}
			}
			return '';
		}

		function getCoord(e, c) {
			var ev = e.originalEvent || e;
			return ev.changedTouches ? ev.changedTouches[0]['page' + c] : e['page' + c];
		}

		function init(that, options, args) {
			var ret = that;

			// Init
			if (typeof options === 'object') {
				return that.each(function () {
					if (!this.id) {
						this.id = 'mobiscroll' + (++id);
					}
					if (instances[this.id]) {
						instances[this.id].destroy();
					}
					new $.mobiscroll.classes[options.component || 'Scroller'](this, options);
				});
			}

			// Method call
			if (typeof options === 'string') {
				that.each(function () {
					var r,
					    inst = instances[this.id];

					if (inst && inst[options]) {
						r = inst[options].apply(this, Array.prototype.slice.call(args, 1));
						if (r !== undefined) {
							ret = r;
							return false;
						}
					}
				});
			}

			return ret;
		}

		function testTouch(e) {
			if (e.type == 'touchstart') {
				touches[e.target] = true;
			} else if (touches[e.target]) {
				delete touches[e.target];
				return false;
			}
			return true;
		}

		var id = +new Date(),
		    touches = {},
		    instances = {},
		    extend = $.extend,
		    mod = document.createElement('modernizr').style,
		    has3d = testProps(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']),
		    hasFlex = testProps(['flex', 'msFlex', 'WebkitBoxDirection']),
		    prefix = testPrefix(),
		    pr = prefix.replace(/^\-/, '').replace(/\-$/, '').replace('moz', 'Moz');

		$.fn.mobiscroll = function (method) {
			extend(this, $.mobiscroll.components);
			return init(this, method, arguments);
		};

		$.mobiscroll = $.mobiscroll || {
				util: {
					prefix: prefix,
					jsPrefix: pr,
					has3d: has3d,
					hasFlex: hasFlex,
					getCoord: getCoord,
					testTouch: testTouch
				},
				presets: {},
				themes: {
					listview: {}
				},
				i18n: {},
				instances: instances,
				classes: {},
				components: {},
				defaults: {},
				userdef: {},
				setDefaults: function (o) {
					extend(this.userdef, o);
				},
				presetShort: function (name, c) {
					this.components[name] = function (s) {
						return init(this, extend(s, { component: c, preset: name }), arguments);
					};
				}
			};

		$.scroller = $.scroller || $.mobiscroll;
		$.fn.scroller = $.fn.scroller || $.fn.mobiscroll;

	})(jQuery);

	(function ($) {

		var ms = $.mobiscroll,
		    util = ms.util,
		    has3d = util.has3d,
		    pr = util.jsPrefix,
		    get = util.getCoord,
		    testTouch = util.testTouch,
		    transEnd = 'webkitTransitionEnd transitionend',
		    defaults = {
			    controls: ['calendar'],
			    firstDay: 0,
			    maxMonthWidth: 170,
			    months: 1,
			    preMonths: 1,
			    highlight: true,
			    swipe: true,
			    liveSwipe: true,
			    divergentDayChange: true,
			    navigation: 'yearMonth',
			    // Localization
			    dateText: 'Date',
			    timeText: 'Time',
			    calendarText: 'Calendar',
			    prevMonthText: 'Previous Month',
			    nextMonthText: 'Next Month',
			    prevYearText: 'Previous Year',
			    nextYearText: 'Next Year',
			    btnCalPrevClass: 'mbsc-ic mbsc-ic-arrow-left6',
			    btnCalNextClass: 'mbsc-ic mbsc-ic-arrow-right6'
		    };

		ms.presets.calbase = function (inst) {

			function isValid(d) {
				if (d < new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate())) {
					return false;
				}

				if (d > maxDateTime) {
					return false;
				}

				return invalidObj[d] === undefined || validObj[d] !== undefined;
			}

			function prepareObj(list, y, m) {
				var d, v, t, startTime,
				    obj = {},
				    n = preMonth + monthDiff;

				if (list) {
					// Convert deprecated object to list, will be removed in 3.0
					list = inst.convert(list);

					$.each(list, function (i, ev) {
						d = ev.d || ev.start || ev;
						v = d + '';

						if (ev.start && ev.end) {
							startTime = new Date(ev.start);
							while (startTime <= ev.end) {
								t = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
								obj[t] = obj[t] || [];
								obj[t].push(ev);
								startTime.setDate(startTime.getDate() + 1);
							}
						} else if (d.getTime) { // Exact date
							t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
							obj[t] = obj[t] || [];
							obj[t].push(ev);
						} else if (!v.match(/w/i)) { // Day of month
							v = v.split('/');
							if (v[1]) {
								if (m + n >= 11) {
									t = s.getDate(y + 1, v[0] - 1, v[1]);
									obj[t] = obj[t] || [];
									obj[t].push(ev);
								}
								if (m - n <= 1) {
									t = s.getDate(y - 1, v[0] - 1, v[1]);
									obj[t] = obj[t] || [];
									obj[t].push(ev);
								}

								t = s.getDate(y, v[0] - 1, v[1]);
								obj[t] = obj[t] || [];
								obj[t].push(ev);

							} else {
								for (j = 0; j < totalMonth; j++) {
									t = s.getDate(y, m - preMonth - moveMonth + j, v[0]);
									obj[t] = obj[t] || [];
									obj[t].push(ev);
								}

							}
						} else { // Day of week
							var x = +v.replace('w', ''),
							    offset = 0,
							    w = s.getDate(y, m - preMonth - moveMonth, 1).getDay();

							if (s.firstDay - w + 1 > 1) {
								offset = 7;
							}

							for (j = 0; j < totalMonth * 5; j++) {
								t = s.getDate(y, m - preMonth - moveMonth, j * 7 - offset - w + 1 + x);
								obj[t] = obj[t] || [];
								obj[t].push(ev);
							}
						}
					});
				}
				return obj;
			}

			function onGenMonth(y, m) {
				invalidObj = prepareObj(s.invalid, y, m);
				validObj = prepareObj(s.valid, y, m);
				inst.onGenMonth(y, m);
			}

			function genMonth(yr, mo) {
				var curr,
				    cssClass,
				    y,
				    m,
				    d,
				    jm,
				    jd,
				    full,
				    props,
				    valid,
				    selected,
				    other,
				    i,
				    j,
				    k = 1,
				    offset = 0,
				    real = s.getDate(yr, mo, 1),  // Get real year and month (if month < 0 or > 11)
				    year = s.getYear(real),
				    month = s.getMonth(real),
				    sel = inst.getDate(true),
				    w = s.getDate(year, month, 1).getDay(), // Get the weekday of the month
				    html = '<div class="dw-cal-table">',
				    weeknrs = '<div class="dw-week-nr-c">';

				if (s.firstDay - w + 1 > 1) {
					offset = 7;
				}

				for (j = 0; j < 42; j++) {
					i = j + s.firstDay - offset;
					curr = s.getDate(year, month, i - w + 1);
					y = curr.getFullYear();
					m = curr.getMonth();
					d = curr.getDate();
					jm = s.getMonth(curr);
					jd = s.getDay(curr);
					full = y + '-' + m + '-' + d;
					props = $.extend({
						valid: isValid(curr),
						selected: sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d
					}, inst.getDayProps(curr, sel));
					valid = props.valid;
					selected = props.selected;
					cssClass = props.cssClass;
					other = jm !== month; // Day is from another month

					dayProps[full] = props;

					if (j % 7 === 0) {
						html += (j ? '</div>' : '') + '<div class="dw-cal-row' + (s.highlight && sel - curr >= 0 && sel - curr < 1000 * 60 * 60 * 24 * 7 ? ' dw-cal-week-hl' : '') + '">';
						if (weeks) {
							// If displaying days from next month, reset month counter
							if (weeks == 'month' && other && j) {
								k = d == 1 ? 1 : 2;
							} else if (weeks == 'year') {
								k = s.getWeekNumber(curr);
							}
							weeknrs += '<div class="dw-week-nr"><div class="dw-week-nr-i">' + k + '</div></div>';
							k++;
						}
					}

					html += '<div role="button" tabindex="-1" class="dw-cal-day ' +
						(s.dayClass || '') +
						(selected ? ' dw-sel' : '') +
						(cssClass ? ' ' + cssClass : '') +
						(other ? ' dw-cal-day-diff' : '') +
						(valid ? ' dw-cal-day-v dwb-e dwb-nhl' : ' dw-cal-day-inv') + '" data-day="' + (i % 7) + '" data-full="' + full + '"' + (selected ? ' aria-selected="true"' : '') + (valid ? '' : ' aria-disabled="true"') + '><div class="dw-i ' +
						(selected ? activeClass : '') + ' ' +
						(valid ? (s.validDayClass || '') : '') + '">' +
						'<div class="dw-cal-day-fg">' + jd + '</div>' +
						(props.markup || '') +
						'<div class="dw-cal-day-frame"></div></div></div>';
				}

				html += '</div>' + weeknrs + '</div></div>';

				return html;
			}

			function setTitle(year, month) {
				for (i = 0; i < monthNr; ++i) {
					$(monthTitle[i]).text(months[s.getMonth(s.getDate(year, month - moveMonth + i, 1))]);
					if (yearTitle.length > 1) {
						$(yearTitle[i]).text(s.getYear(s.getDate(year, month - moveMonth + i, 1)));
					}
				}
				if (yearTitle.length == 1) {
					yearTitle.text(s.getYear(s.getDate(year, month, 1)));
				}

				// Disable/enable prev/next buttons
				if (s.getDate(year, month - moveMonth - 1, 1) < minDate) {
					$('.dw-cal-prev-m', ctx).addClass(disabled).attr('aria-disabled', 'true');
				} else {
					$('.dw-cal-prev-m', ctx).removeClass(disabled).removeAttr('aria-disabled');
				}
				if (s.getDate(year, month + monthNr - moveMonth, 1) > maxDate) {
					$('.dw-cal-next-m', ctx).addClass(disabled).attr('aria-disabled', 'true');
				} else {
					$('.dw-cal-next-m', ctx).removeClass(disabled).removeAttr('aria-disabled');
				}
				if (s.getDate(year, month, 1).getFullYear() <= minDate.getFullYear()) {
					$('.dw-cal-prev-y', ctx).addClass(disabled).attr('aria-disabled', 'true');
				} else {
					$('.dw-cal-prev-y', ctx).removeClass(disabled).removeAttr('aria-disabled');
				}
				if (s.getDate(year, month, 1).getFullYear() >= maxDate.getFullYear()) {
					$('.dw-cal-next-y', ctx).addClass(disabled).attr('aria-disabled', 'true');
				} else {
					$('.dw-cal-next-y', ctx).removeClass(disabled).removeAttr('aria-disabled');
				}
			}

			function highlightDate(d) {
				inst.trigger('onDayHighlight', [d]);
				if (s.highlight) {
					$('.dw-cal .dw-sel .dw-i', ctx).removeClass(activeClass);
					$('.dw-cal .dw-sel', ctx).removeClass('dw-sel').removeAttr('aria-selected');
					$('.dw-cal-week-hl', ctx).removeClass('dw-cal-week-hl');

					$('.dw-cal .dw-cal-day[data-full="' + d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + '"]', ctx)
						.addClass('dw-sel').attr('aria-selected', 'true')
						.parent().addClass('dw-cal-week-hl');

					$('.dw-cal .dw-sel .dw-i', ctx).addClass(activeClass);
				}
			}

			function setDate(d, nav) {
				if (controls.calendar && (visibleTab === 'calendar' || nav)) {
					var dir,
					    load,
					    curr = s.getDate(currYear, currMonth, 1),
					    diff = Math.abs((s.getYear(d) - s.getYear(curr)) * 12 + s.getMonth(d) - s.getMonth(curr));


					if (inst.needsSlide && diff) {
						currYear = s.getYear(d);
						currMonth = s.getMonth(d);
						if (d > curr) {
							load = diff > preMonth - moveMonth + monthNr - 1;
							currMonth -= load ? 0 : diff - preMonth;
							dir = 'next';
						} else if (d < curr) {
							load = diff > preMonth + moveMonth;
							currMonth += load ? 0 : diff - preMonth;
							dir = 'prev';
						}
						changeMonth.call(this, currYear, currMonth, dir, Math.min(diff, preMonth), load, true);
					}
					if (!nav) {
						highlightDate(d);
					}
					inst.needsSlide = true;
				}
			}

			function preload(y, m) {
				onGenMonth(y, m);

				for (i = 0; i < totalMonth; i++) {
					slidesArray[i].html(genMonth(y, m - moveMonth - preMonth + i));
				}

				inst.needsRefresh = false;
			}

			function changeMonth(y, m, dir, slideNr, load, active, callback) {
				// If called with any parameter, push into queue
				if (y) {
					queue.push({ y: y, m: m, dir: dir, slideNr: slideNr, load: load, active: active, callback: callback });
				}

				// Delay change if currently in transition
				if (trans) {
					return;
				}

				// Load params from queue
				var params = queue.shift(),
				    d;

				y = params.y;
				m = params.m;
				dir = params.dir === 'next';
				slideNr = params.slideNr;
				load = params.load;
				active = params.active;
				callback = params.callback || empty;
				d = s.getDate(y, m, 1);
				y = s.getYear(d);
				m = s.getMonth(d);
				trans = true;

				inst.changing = true;
				inst.trigger('onMonthChange', [y, m]);

				onGenMonth(y, m);

				if (load) {
					for (i = 0; i < monthNr; i++) {
						slidesArray[dir ? totalMonth - monthNr + i : i].html(genMonth(y, m - moveMonth + i));
					}
				}

				// Remove opacity from month during transition (if changed by button)
				if (active) {
					slides.addClass('dw-cal-slide-a');
				}

				setTimeout(function () {
					slide(dir ? startPos - animw * slideNr * rtl : startPos + animw * slideNr * rtl, 200, function () {
						var tempArray;

						slides.removeClass('dw-cal-slide-a');

						// Reorder the slides array
						if (dir) {
							tempArray = slidesArray.splice(0, slideNr);
							for (i = 0; i < slideNr; i++) {
								slidesArray.push(tempArray[i]);
								change(slidesArray[slidesArray.length - 1], +slidesArray[slidesArray.length - 2].data('curr') + 100 * rtl);
							}
						} else {
							tempArray = slidesArray.splice(totalMonth - slideNr, slideNr);
							for (i = slideNr - 1; i >= 0; i--) {
								slidesArray.unshift(tempArray[i]);
								change(slidesArray[0], +slidesArray[1].data('curr') - 100 * rtl);
							}
						}

						// Generate new months
						for (i = 0; i < slideNr; i++) {
							slidesArray[dir ? totalMonth - slideNr + i : i].html(genMonth(y, m - moveMonth - preMonth + i + (dir ? totalMonth - slideNr : 0)));
							if (load) {
								slidesArray[dir ? i : totalMonth - slideNr + i].html(genMonth(y, m - moveMonth - preMonth + i + (dir ? 0 : totalMonth - slideNr)));
							}
						}

						for (i = 0; i < monthNr; i++) {
							slidesArray[preMonth + i].addClass('dw-cal-slide-a');
						}

						trans = false;

						setTitle(y, m);

						if (queue.length) {
							setTimeout(function () {
								changeMonth();
							}, 10);
						} else {
							currYear = y;
							currMonth = m;

							inst.changing = false;

							if (weeks) {
								weeknr.html($('.dw-week-nr-c', slidesArray[preMonth]).html());
							}

							$('.dw-cal-day', ctx).attr('tabindex', -1);
							$('.dw-cal-slide-a .dw-cal-day', ctx).attr('tabindex', 0);

							if (inst.needsRefresh) {
								refresh();
							}

							inst.trigger('onMonthLoaded', [y, m]);

							callback();
						}
					});
				}, 10);
			}

			function selectDay() {
				var cell = $(this),
				    fill = inst.live,
				    curr = inst.getDate(true),
				    full = cell.attr('data-full'),
				    parts = full.split('-'),
				    d = new Date(parts[0], parts[1], parts[2]),
				    dtime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), curr.getHours(), curr.getMinutes(), curr.getSeconds()),
				    selected = cell.hasClass('dw-sel');

				if (!showdiff && cell.hasClass('dw-cal-day-diff')) {
					return;
				}

				// Call onDayChange event
				if (inst.trigger('onDayChange', [$.extend(dayProps[full], { date: dtime, cell: this, selected: selected })]) !== false) {
					// Prevents month slide in setDate
					inst.needsSlide = false;

					// Set date on scroller
					inst.setDate(dtime, fill, 0.2, !fill, true);

					// Slide one month left or right
					if (s.divergentDayChange) {
						running = true;
						if (d < s.getDate(currYear, currMonth - moveMonth, 1)) { // Prev month
							prevMonth();
						} else if (d > s.getDate(currYear, currMonth - moveMonth + monthNr, 0)) { // Next month
							nextMonth();
						}
						running = false;
					}
				}
			}

			function slide(pos, time, callback) {
				pos = Math.max(startPos - animw * preMonth, Math.min(pos, startPos + animw * preMonth));
				animc[0].style[pr + 'Transition'] = 'all ' + (time || 0) + 'ms';

				if (has3d) {
					if (callback) {
						if (animPos == pos) {
							callback();
						} else {
							animc.on(transEnd, function () {
								animc.off(transEnd);
								callback();
							});
						}
					}
					animc[0].style[pr + 'Transform'] = 'translate3d(' + pos + 'px,0,0)';
				} else {
					if (callback) {
						setTimeout(callback, time);
					}
					animc[0].style.left = pos + 'px';
				}

				if (time) {
					startPos = pos;
				}

				animPos = pos;
			}

			function change(el, curr) {
				el.data('curr', curr);
				if (has3d) {
					el[0].style[pr + 'Transform'] = 'translate3d(' + curr + '%,0,0)';
				} else {
					el[0].style.left = curr + '%';
				}
			}

			function refresh() {
				if (inst.isVisible() && controls.calendar) {
					preload(currYear, currMonth);
				}
			}

			function nextMonth() {
				if (running && s.getDate(currYear, currMonth + monthNr - moveMonth, 1) <= maxDate) {
					changeMonth(currYear, ++currMonth, 'next', 1, false, true, nextMonth);
				}
			}

			function prevMonth() {
				if (running && s.getDate(currYear, currMonth - moveMonth - 1, 1) >= minDate) {
					changeMonth(currYear, --currMonth, 'prev', 1, false, true, prevMonth);
				}
			}

			function nextYear(btn) {
				if (running && s.getDate(currYear, currMonth, 1) <= s.getDate(s.getYear(maxDate) - 1, s.getMonth(maxDate) - monthDiff, 1)) {
					changeMonth(++currYear, currMonth, 'next', preMonth, true, true, function () { nextYear(btn); });
				} else if (running && !btn.hasClass('dwb-d')) {
					changeMonth(s.getYear(maxDate), s.getMonth(maxDate) - monthDiff, 'next', preMonth, true, true);
				}
			}

			function prevYear(btn) {
				if (running && s.getDate(currYear, currMonth, 1) >= s.getDate(s.getYear(minDate) + 1, s.getMonth(minDate) + moveMonth, 1)) {
					changeMonth(--currYear, currMonth, 'prev', preMonth, true, true, function () { prevYear(btn); });
				} else if (running && !btn.hasClass('dwb-d')) {
					changeMonth(s.getYear(minDate), s.getMonth(minDate) + moveMonth, 'prev', preMonth, true, true);
				}
			}

			var d,
			    i,
			    j,
			    ret,
			    cont,
			    ctx,
			    context,
			    anim,
			    animc,
			    animw,
			    animPos,
			    startPos,
			    html,
			    initTabs,
			    weeknr,
			    months,
			    monthTitle,
			    yearTitle,
			    minDate,
			    maxDate,
			    minDateTime,
			    maxDateTime,
			    prevDate,
			    currYear,
			    currMonth,
			    startX,
			    startY,
			    endX,
			    endY,
			    validate,
			    scrolled,
			    validObj,
			    invalidObj,
			    panels,
			    visibleTab,
			    touch,
			    trans,
			    running,
			    monthNr,
			    totalMonth,
			    monthDiff,
			    moveMonth,
			    showdiff,
			    that = this,
			    slides = [],
			    slidesArray = [],
			    queue = [],
			    controls = {},
			    dayProps = {},
			    empty = function () {},
			    orig = $.extend({}, inst.settings),
			    s = $.extend(inst.settings, defaults, orig),
			    weeks = s.weekCounter,
			    layout = s.layout || (/top|bottom/.test(s.display) ? 'liquid' : ''),
			    isLiquid = layout == 'liquid' && s.display !== 'bubble',
			    isModal = s.display == 'modal',
			    isRTL = s.rtl,
			    rtl = isRTL ? -1 : 1, // Change month slide direction if RTL
			    calWidth = isLiquid ? null : s.calendarWidth,
			    preMonth = s.preMonths,
			    yearBtn = s.navigation == 'yearMonth',
			    ctrls = s.controls.join(','),
			    showTabs = (s.tabs === true || (s.tabs !== false && isLiquid)) && s.controls.length > 1,
			    checkTabs = (!showTabs && s.tabs === undefined && !isLiquid && s.controls.length > 1),
			    activeClass = s.activeClass || '',
			    activeTabClass = 'dw-sel ' + (s.activeTabClass || ''),
			    activeTabInnerClass = s.activeTabInnerClass || '',
			    disabled = 'dwb-d ' + (s.disabledClass || '');

			if (ctrls.match(/calendar/)) {
				controls.calendar = 1;
			}

			if (ctrls.match(/date/)) {
				controls.date = 1;
			}

			if (ctrls.match(/time/)) {
				controls.time = 1;
			}

			if (controls.calendar && controls.date) {
				showTabs = true;
				checkTabs = false;
			}

			s.layout = layout; // Pass back to core if set to liquid
			s.preset = (controls.date || controls.calendar ? 'date' : '') + (controls.time ? 'time' : '');

			// Call position on pageshow
			if (s.display == 'inline') {
				$(this).closest('[data-role="page"]').on('pageshow', function () {
					inst.position();
				});
			}

			// Extended methods
			// ---

			inst.changing = false;

			inst.needsRefresh = false;

			inst.needsSlide = true;

			inst.getDayProps = empty;

			inst.onGenMonth = empty;

			inst.prepareObj = prepareObj;

			inst.refresh = function () {
				// Postpone refresh if currently changing month
				if (!inst.changing) {
					refresh();
				} else {
					inst.needsRefresh = true;
				}
			};

			inst.navigate = function (d, anim) {
				var visible = inst.isVisible();
				if (anim && visible) {
					setDate(d, true);
				} else {
					currYear = d.getFullYear();
					currMonth = d.getMonth();
					if (visible) {
						setTitle(currYear, currMonth);
						preload(currYear, currMonth);
					}
				}
			};

			// ---

			ret = ms.presets.datetime.call(this, inst);

			validate = ret.validate;

			$.extend(ret, {
				onMarkupReady: function (dw) {
					var tabs,
					    monthBtns,
					    yearBtns = '',
					    monthIndex = s.dateOrder.search(/m/i),
					    yearIndex = s.dateOrder.search(/y/i);

					ctx = dw;

					context = s.display == 'inline' ? ($(this).is('div') ? $(this) : $(this).parent()) : inst.context;

					prevDate = inst.getDate(true);
					if (!currYear) {
						currYear = s.getYear(prevDate);
						currMonth = s.getMonth(prevDate);
					}

					startPos = 0;
					animPos = 0;

					initTabs = true;

					// Reset transition if previously closed during transition
					trans = false;

					months = s.monthNames;

					visibleTab = 'calendar';

					if (s.minDate) {
						minDate = new Date(s.minDate.getFullYear(), s.minDate.getMonth(), 1);
						minDateTime = s.minDate;
					} else {
						minDate = new Date(s.startYear, 0, 1);
						minDateTime = minDate;
					}

					if (s.maxDate) {
						maxDate = new Date(s.maxDate.getFullYear(), s.maxDate.getMonth(), 1);
						maxDateTime = s.maxDate;
					} else {
						maxDate = new Date(s.endYear, 11, 31, 23, 59, 59);
						maxDateTime = maxDate;
					}

					dw.addClass('dw-calendar' + (has3d ? '' : ' dw-cal-no3d'));

					cont = $('.dw', dw);
					panels = $('.dwcc', dw);

					if (controls.date) {
						controls.date = $('.dwc', ctx).eq(0);
					} else if (controls.calendar) {
						$('.dwc', ctx).eq(0).addClass('dwc-hh');
					}

					if (controls.time) {
						controls.time = $('.dwc', ctx).eq(1);
					}

					// Generate calendar markup
					if (controls.calendar) {
						// Calculate monthNr
						monthNr = s.months == 'auto' ? // Exact month number from setting
							Math.max(1, // Min 1 month
								Math.min(3, // Max 3 months
									Math.floor((calWidth || context.width()) / 280))) : s.months;

						totalMonth = monthNr + 2 * preMonth;
						monthDiff = Math.floor(monthNr / 2);
						moveMonth = Math.round(monthNr / 2) - 1;
						showdiff = s.showDivergentDays === undefined ? monthNr < 2 : s.showDivergentDays;

						// Generate month buttons
						monthBtns = '<div class="dw-cal-btnw"><div class="' + (isRTL ? 'dw-cal-next-m' : 'dw-cal-prev-m') + ' dw-cal-prev dw-cal-btn dwb dwb-e"><a href="#" role="button" class="dw-cal-btn-txt ' + (s.btnCalPrevClass || '' ) + '"' + '>' + s.prevMonthText + '</a></div>';
						for (i = 0; i < monthNr; ++i) {
							monthBtns += '<div class="dw-cal-btnw-m" style="width: ' + 100 / monthNr + '%">' +
								(!yearBtn && yearIndex < monthIndex ? '<span aria-live="assertive" class="dw-cal-year"></span>&nbsp;' : '') +
								'<span aria-live="assertive" class="dw-cal-month"></span>' +
								(!yearBtn && yearIndex > monthIndex ? '&nbsp;<span aria-live="assertive" class="dw-cal-year"></span>' : '') + '</div>';
						}
						monthBtns += '<div class="' + (isRTL ? 'dw-cal-prev-m' : 'dw-cal-next-m') + ' dw-cal-next dw-cal-btn dwb dwb-e"><a href="#" role="button" class="dw-cal-btn-txt ' + (s.btnCalNextClass || '' ) + '"' + '>' + s.nextMonthText + '</a></div></div>';

						// Generate year buttons
						if (yearBtn) {
							yearBtns = '<div class="dw-cal-btnw"><div class="' + (isRTL ? 'dw-cal-next-y' : 'dw-cal-prev-y') + ' dw-cal-prev dw-cal-btn dwb dwb-e"><a href="#" role="button" class="dw-cal-btn-txt ' + (s.btnCalPrevClass || '' ) + '"' + '>' + s.prevYearText + '</a></div>' +
								'<span aria-live="assertive" class="dw-cal-year"></span>' +
								'<div class="' + (isRTL ? 'dw-cal-prev-y' : 'dw-cal-next-y') + ' dw-cal-next dw-cal-btn dwb dwb-e"><div role="button" class="dw-cal-btn-txt ' + (s.btnCalNextClass || '' ) + '"' + ' title="' + s.nextYearText + '"></div></div></div>';
						}

						// Generate calendar header
						html = '<div class="dwc dw-cal-c"><div class="dw-cal ' +
							(monthNr > 1 ? ' dw-cal-multi ' : '') +
							(weeks ? ' dw-weeks ' : '') +
							(showdiff ? '' : ' dw-hide-diff ') +
							(s.calendarClass || '') + '">' +
							'<div class="dw-cal-header"><div class="dw-cal-btnc ' + (yearBtn ? 'dw-cal-btnc-ym' : 'dw-cal-btnc-m') + '">' +
							((yearIndex < monthIndex || monthNr > 1) ? yearBtns + monthBtns : monthBtns + yearBtns) +
							'</div><div class="dw-cal-days-c">';

						for (j = 0; j < monthNr; ++j) {
							// Generate week days
							html += '<div class="dw-cal-days" style="width: ' + 100 / monthNr + '%"><table cellpadding="0" cellspacing="0"><tr>';
							for (i = 0; i < 7; i++) {
								html += '<th>' + s.dayNamesShort[(i + s.firstDay) % 7] + '</th>';
							}
							html += '</tr></table></div>';
						}

						html += '</div></div>' +
							'<div class="dw-cal-anim-c ' + (s.calendarClass || '') + '">' +
							'<div class="dw-week-nrs-c ' + (s.weekNrClass || '') + '">' +
							'<div class="dw-week-nrs"></div>' +
							'</div>' +
							'<div class="dw-cal-anim">';

						for (i = 0; i < monthNr + 2 * preMonth; i++) {
							html += '<div class="dw-cal-slide"></div>';
						}

						html += '</div></div></div></div>';

						controls.calendar = $(html);
					}

					// Insert controls in the required order
					$.each(s.controls, function (i, v) {
						controls[v] = $('<div class="dw-cal-pnl" id="' + (that.id + '_dw_pnl_' + i) + '"></div>')
							.append($('<div class="dw-cal-pnl-i"></div>').append(controls[v]))
							.appendTo(panels);
					});

					// Generate tabs
					tabs = '<div class="dw-cal-tabs"><ul role="tablist">';

					$.each(s.controls, function (i, v) {
						if (controls[v]) {
							tabs += '<li role="tab" aria-controls="' + (that.id + '_dw_pnl_' + i) + '" class="dw-cal-tab ' + (i ? '' : activeTabClass) + '" data-control="' + v + '"><a href="#" class="dwb-e dwb-nhl dw-i ' + (!i ? activeTabInnerClass : '') + '">' + s[v + 'Text'] + '</a></li>';
						}
					});
					tabs += '</ul></div>';

					panels.before(tabs);

					// Init slide animation containers
					anim = $('.dw-cal-anim-c', ctx);
					animc = $('.dw-cal-anim', ctx);

					if (controls.calendar) {
						slides = $('.dw-cal-slide', ctx).each(function (i, v) { slidesArray.push($(v)); });
						slides.slice(preMonth, preMonth + monthNr).addClass('dw-cal-slide-a');

						for (i = 0; i < totalMonth; i++) {
							change(slidesArray[i], 100 * (i - preMonth) * rtl);
						}

						preload(currYear, currMonth);

						$('.dw-cal-slide-a .dw-cal-day', ctx).attr('tabindex', 0);

						weeknr = $('.dw-week-nrs', ctx).html($('.dw-week-nr-c', slidesArray[preMonth]).html());
					}

					monthTitle = $('.dw-cal-month', ctx);
					yearTitle = $('.dw-cal-year', ctx);

					setTimeout(function () {
						// Init day tap/click
						inst.tap(anim, function (e) {
							var day = $(e.target);
							if (!trans && !scrolled) {
								day = day.closest('.dw-cal-day', this);
								if (day.hasClass('dw-cal-day-v')) {
									selectDay.call(day[0]);
								}
							}
						});

						// Init prev/next month and year tap/click
						$('.dw-cal-btn', ctx).on('touchstart mousedown keydown', function (e) {
							var proceed,
							    btn = $(this);

							if (e.type !== 'keydown') {
								e.preventDefault();
								proceed = testTouch(e);
							} else {
								proceed = e.keyCode === 32;
							}

							if (!running && proceed && !btn.hasClass('dwb-d')) {
								running = true;
								if (btn.hasClass('dw-cal-prev-m')) {
									prevMonth();
								} else if (btn.hasClass('dw-cal-next-m')) {
									nextMonth();
								} else if (btn.hasClass('dw-cal-prev-y')) {
									prevYear(btn);
								} else if (btn.hasClass('dw-cal-next-y')) {
									nextYear(btn);
								}

								$(document).on('mouseup.dwbtn', function () {
									$(document).off('.dwbtn');
									running = false;
								});
							}
						}).on('touchend touchcancel keyup', function () {
							running = false;
						});

						// Init Tabs
						$('.dw-cal-tab', ctx).on('touchstart click', function (e) {
							var tab = $(this);

							if (testTouch(e)) {
								if (tab.hasClass('dw-sel')) {
									return;
								}

								visibleTab = tab.attr('data-control');
								$('.dw-cal-pnl', ctx).addClass('dw-cal-pnl-h');
								$('.dw-cal-tab', ctx).removeClass(activeTabClass).removeAttr('aria-selected').find('.dw-i').removeClass(activeTabInnerClass);
								tab.addClass(activeTabClass).attr('aria-selected', 'true').find('.dw-i').addClass(activeTabInnerClass);

								controls[visibleTab].removeClass('dw-cal-pnl-h');

								if (visibleTab === 'calendar') {
									d = inst.getDate(true);
									// Set the date of the calendar if date changed from the scroller
									if (d.getFullYear() !== prevDate.getFullYear() || d.getMonth() !== prevDate.getMonth() || d.getDate() !== prevDate.getDate()) {
										setDate(d);
									}
								} else {
									prevDate = inst.getDate(true);
									inst.setDate(prevDate, false, 0, true);
								}

								inst.trigger('onTabChange', [visibleTab]);
							}
						});
					}, 300);

					// Init calendar width
					if (isLiquid) {
						dw.addClass('dw-cal-liq');
					} else {
						$('.dw-cal', ctx).width(calWidth || 280 * monthNr);
					}

					// Init calendar height
					if (s.calendarHeight) {
						$('.dw-cal-anim-c', ctx).height(s.calendarHeight);
					}

					// Change month on swipe
					if (s.swipe) {
						var rafID,
						    rafRunning,
						    startTime,
						    timeDiff,
						    scroll,
						    slideNr,
						    swipe,
						    swiping,
						    swipeLive = s.liveSwipe,
						    raf = window.requestAnimationFrame || function (x) { x(); },
						    rafc = window.cancelAnimationFrame || empty,
						    slideStart = function (e) {
							    if (!swiping && !trans) {
								    touch = true;
								    scrolled = false;
								    swiping = true;
								    startTime = new Date();
								    startPos = animPos;
								    startX = get(e, 'X');
								    startY = get(e, 'Y');
							    }
						    },
						    slideEnd = function () {
							    swiping = false;
							    scroll = false;
							    if (swipe) {
								    swipe = false;

								    rafc(rafID);
								    rafRunning = false;

								    timeDiff = new Date() - startTime;

								    slideNr = (timeDiff < 300 && Math.abs(endX - startX) > 50 ? (endX - startX < 0 ? -preMonth : preMonth) : Math.round((animPos - startPos) / animw)) * rtl;

								    if (slideNr > 0 && s.getDate(currYear, currMonth - slideNr - moveMonth, 1) >= minDate) { // Prev
									    changeMonth(currYear, currMonth - slideNr, 'prev', slideNr);
								    } else if (slideNr < 0 && s.getDate(currYear, currMonth - slideNr + monthNr - moveMonth - 1, 1) <= maxDate) { // Next
									    changeMonth(currYear, currMonth - slideNr, 'next', -slideNr);
								    } else if (swipeLive) { // Back to initial position
									    slide(startPos, 200);
								    }
							    }
						    },
						    slideMoving = function (e) {
							    // Prevent native scroll if in transition
							    if (trans) {
								    e.preventDefault();
							    }

							    if (swiping) {
								    endX = get(e, 'X');
								    endY = get(e, 'Y');
								    if (!swipe && !scroll) {
									    if (Math.abs(endX - startX) > 7) { // It's a swipe
										    swipe = true;
										    scrolled = true;
									    } else if (!inst.scrollLock && Math.abs(endY - startY) > 10) { // It's a scroll
										    scroll = true;
										    scrolled = true;
										    if (e.type === 'touchmove') {
											    anim.trigger('touchend');
										    }
									    }
								    }

								    // Prevent native scroll if it is a swipe
								    if (swipe) {
									    e.preventDefault();
								    }

								    if (swipe && swipeLive && !rafRunning) {
									    rafRunning = true;
									    rafID = raf(slideMove);
								    }
							    }
						    },
						    slideMove = function () {
							    slide(startPos + endX - startX);
							    rafRunning = false;
						    };

						anim.on('touchstart', slideStart)
							.on('touchmove', slideMoving)
							.on('touchend touchcancel', slideEnd)
							.on('mousedown', function (e) {
								if (!touch) {
									slideStart(e);
									// Mouse events are attached to the document
									$(document)
										.on('mousemove.dwsw', slideMoving)
										.on('mouseup.dwsw', function () {
											slideEnd();
											$(document).off('dwsw');
										});
								}
								touch = false;
							});
					}
				},
				onShow: function () {
					setTitle(currYear, currMonth);
					inst.trigger('onMonthLoaded', [currYear, currMonth]);
				},
				onPosition: function (dw, ww, wh) {
					var w,
					    hasTabs,
					    nr,
					    mh,
					    oldw,
					    maxw = 0,
					    maxh = 0,
					    totalw = 0;

					// If liquid mode, reset heigths
					if (isLiquid && isModal) {
						anim.height('');
						panels.height('');
					}

					// Check if tabs needed, and search for max width and height
					if ((showTabs && initTabs) || checkTabs || isLiquid) {
						$('.dw-cal-pnl', ctx).removeClass('dw-cal-pnl-h');

						if (isLiquid) {
							animc.width('');
						}

						$.each(controls, function (i, v) {
							w = v.width();
							maxw = Math.max(maxw, w);
							maxh = Math.max(maxh, v.height());
							totalw += w;
						});

						if (showTabs || (checkTabs && totalw > context.width())) {
							hasTabs = true;
							visibleTab = $('.dw-cal-tabs .dw-sel', ctx).attr('data-control');
							cont.addClass('dw-cal-tabbed');
						} else {
							visibleTab = 'calendar';
							maxw = '';
							maxh = '';
							cont.removeClass('dw-cal-tabbed');
							panels.css({ width: '', height: '' });
						}
					}

					// Full height calendar
					if (isLiquid && isModal) {

						if (hasTabs) {
							panels.height(controls.calendar.height());
						}

						mh = cont.outerHeight();

						// Don't set fixed height if calendar height is bigger than viewport height
						if (wh >= mh) {
							anim.height(wh - mh + anim.height());
						}

						maxh = Math.max(maxh, controls.calendar.height());
					}

					// Set tab panel container width and height
					if (hasTabs) {
						panels.css({ width: isLiquid ? '' : maxw, height: maxh });
					}

					if (animw) {
						oldw = animw;
					}

					animw = Math.round(Math.round(anim.width()) / monthNr);


					// Do things only if calendar is visible (we have a width)
					if (animw) {
						animc.width(animw);

						// Recalcultae slide position
						if (isLiquid && !initTabs && oldw) {
							nr = startPos / oldw;
							startPos = nr * animw;
							slide(startPos, 0);
						}

						// Short or long month names
						if (yearBtn) {
							months = s.maxMonthWidth > $('.dw-cal-btnw-m', ctx).width() ? s.monthNamesShort : s.monthNames;
							for (i = 0; i < monthNr; ++i) {
								$(monthTitle[i]).text(months[s.getMonth(s.getDate(currYear, currMonth - moveMonth + i, 1))]);
							}
						}
					}

					// Show only current tab
					if (hasTabs) {
						$('.dw-cal-pnl', ctx).addClass('dw-cal-pnl-h');
						controls[visibleTab].removeClass('dw-cal-pnl-h');
					}

					inst.trigger('onCalResize', []);

					initTabs = false;
				},
				onClose: function () {
					slidesArray = [];
					visibleTab = null;
					currYear = null;
					currMonth = null;
					trans = true;
				},
				validate: function (dw, i) {
					var d;
					// Call original validation
					validate.call(this, dw, i);

					d = inst.getDate(true);

					inst.trigger('onSetDate', [{ date: d }]);

					// Set date on calendar
					setDate(d);
				}
			});

			return ret;
		};

	})(jQuery);

	(function ($) {

		var ms = $.mobiscroll,
		    util = ms.util,
		    get = util.getCoord,
		    has3d = util.has3d,
		    pr = util.jsPrefix,
		    defaults = {
			    firstSelectDay: 0,
			    // Localization
			    eventText: 'event',
			    eventsText: 'events'
		    };

		ms.presetShort('calendar');

		ms.presets.calendar = function (inst) {

			// Private functions
			// ---

			function getTextColor(color) {
				if (color) {
					// Cache calculated text colors, because it is slow
					if (textColors[color]) {
						return textColors[color];
					}
					var div = $('<div style="background-color:' + color + ';"></div>').appendTo('body'),
					    style = window.getComputedStyle ? getComputedStyle(div[0]) : div[0].style,
					    rgb = style.backgroundColor.replace(/rgb|rgba|\(|\)|\s/g, '').split(','),
					    delta = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114,
					    txt = delta > 130 ? '#000' : '#fff';

					div.remove();

					textColors[color] = txt;

					return txt;
				}
			}

			function showEvents(d, cell) {
				var events = eventObj[d];

				if (events) {
					var bg, maxHeight, txt,
					    calHeight = $('.dw-cal-c', ctx).height(),
					    cellHeight = cell.height(),
					    cellWidth = cell.width(),
					    top = cell.offset().top - $('.dw-cal-c', ctx).offset().top,
					    bottom = cell.closest('.dw-cal-row').index() < 2,
					    html = '<ul class="dw-cal-event-list">';

					pos = 0;
					scrolled = false;
					evd = cell;

					cell.addClass(selClass).find('.dw-i').addClass(activeClass);

					$.each(events, function (i, e) {
						bg = e.color;
						txt = getTextColor(bg);
						html += '<li class="dw-cal-event"><div class="dw-cal-event-color" style="' + (bg ? 'background:' + bg + ';' : '') + '"></div>' + e.text + '</li>';
					});

					html += '</ul>';

					evsc.html(html);

					inst.trigger('onEventBubbleShow', [evd, evc]);

					maxHeight = evc.addClass('dw-cal-events-t').css({ top: bottom ? top + cellHeight : '0', bottom: bottom ? '0' : calHeight - top }).addClass('dw-cal-events-v').height();

					maxPos = maxHeight - evsc.height();

					evc.css(bottom ? 'bottom' : 'top', 'auto').removeClass('dw-cal-events-t');
					evci.css('max-height', maxHeight);

					scroll(0);

					// Calculate bubble position
					if (bottom) {
						evc.addClass('dw-cal-events-b');
					} else {
						evc.removeClass('dw-cal-events-b');
					}

					$('.dw-cal-events-arr', evc).css('left', cell.offset().left - evc.offset().left + cellWidth / 2);

					// Assign event click
					inst.tap($('.dw-cal-event', evsc), function (e) {
						if (!scrolled) {
							inst.trigger('onEventSelect', [e, events[$(this).index()], d]);
						}
					});

					evVisible = true;
				}
			}

			function hideEvents() {
				if (evc) {
					evc.removeClass('dw-cal-events-v');
				}
				if (evd) {
					evd.removeClass(selClass).find('.dw-i').removeClass(activeClass);
				}
				evVisible = false;
			}

			function refresh() {
				if (eventMode) {
					hideEvents();
				}
				inst.refresh();
			}

			function scroll(pos) {
				if (has3d) {
					evsc[0].style[pr + 'Transform'] = 'translateY(' + pos + 'px)';
				} else {
					evsc.css('top', pos);
				}
			}

			// ---

			var base,
			    ctx,
			    endY,
			    evc,
			    evd,
			    eventObj,
			    evci,
			    evsc,
			    evVisible,
			    i,
			    d,
			    markedObj,
			    maxPos,
			    pos,
			    ret,
			    scrolled,
			    startPos,
			    startY,
			    touch,
			    showEvent,
			    textColors = {},
			    orig = $.extend({}, inst.settings),
			    s = $.extend(inst.settings, defaults, orig),
			    selClass = 'dw-sel dw-cal-day-ev',
			    activeClass = s.activeClass || '',
			    multi = s.multiSelect || s.selectType == 'week',
			    markedStyle = s.markedDisplay,
			    markedText = s.events === true || s.markedText === true,
			    eventID = 0,
			    origValues = [],
			    eventMode = $.isArray(s.events),
			    eventList = eventMode ? $.extend(true, [], s.events) : [];

			ret = $.mobiscroll.presets.calbase.call(this, inst);
			base = $.extend({}, ret);

			if (s.selectedValues) {
				for (i = 0; i < s.selectedValues.length; i++) {
					d = s.selectedValues[i];
					inst._selectedValues[d] = d;
				}
			}

			if (eventMode) {
				$.each(eventList, function (i, e) {
					e._id = eventID++;
				});
			}

			// Extended methods
			// ---

			inst.onGenMonth = function (y, m) {
				eventObj = inst.prepareObj(eventList, y, m);
				markedObj = inst.prepareObj(s.marked, y, m);
			};

			inst.getDayProps = function (d) {
				var i,
				    selected = multi ? inst._selectedValues[d] !== undefined : (eventMode ? d.getTime() === new Date().setHours(0, 0, 0, 0) : undefined),
				    isMarked = markedObj[d] ? markedObj[d][0] : false,
				    hasEvents = eventObj[d] ? eventObj[d][0] : false,
				    marked = isMarked || hasEvents,
				    txt = isMarked.text || (markedText && hasEvents ? eventObj[d].length + ' ' + (eventObj[d].length > 1 ? s.eventsText : s.eventText) : 0),
				    allMarked = markedObj[d] || eventObj[d] || [],
				    iconMarkup = '',
				    markedMarkup = '<div class="dw-cal-day-m"' + (bgColor ? ' style="background-color:' + bgColor + ';border-color:' + bgColor + ' ' + bgColor + ' transparent transparent"' : '') + '></div>',
				    bgColor = marked.color,
				    txtColor = markedText && txt ? getTextColor(bgColor) : '';

				for (i = 0; i < allMarked.length; i++) {
					if (allMarked[i].icon) {
						iconMarkup += '<span class="mbsc-ic mbsc-ic-' + allMarked[i].icon + '"' + (allMarked[i].color ? ' style="color:' + allMarked[i].color + ';"' : '') + '></span>\n';
					}
				}

				// Multicolor
				if (markedStyle == 'bottom') {
					markedMarkup = '<div class="dw-cal-day-m"><div class="dw-cal-day-m-t">';
					for (i = 0; i < allMarked.length; i++) {
						markedMarkup += '<div class="dw-cal-day-m-c"' + (allMarked[i].color ? ' style="background:' + allMarked[i].color + ';"' : '') + '></div>';
					}
					markedMarkup += '</div></div>';
				}

				return {
					marked: marked,
					selected: eventMode ? false : selected,
					cssClass: eventMode && selected ? 'dw-cal-day-hl' : '',
					markup: markedText && txt ?
						'<div class="dw-cal-day-txt-c"><div class="dw-cal-day-txt ' + (s.eventTextClass || '') + '" title="' + $('<div>' + txt + '</div>').text() + '"' + (bgColor ? ' style="background:' + bgColor + ';color:' + txtColor + ';text-shadow:none;"' : '') + '>' + iconMarkup + txt + '</div></div>' :
						markedText && iconMarkup ?
							'<div class="dw-cal-day-ic-c">' + iconMarkup + '</div>' :
							marked ?
								markedMarkup : ''
				};
			};

			inst.addValue = function (v) {
				inst._selectedValues[v] = v;
				refresh();
			};

			inst.removeValue = function (v) {
				delete inst._selectedValues[v];
				refresh();
			};

			inst.setValues = function (v, fill) {
				var i = 0;

				inst._selectedValues = {};
				if (v.length) {
					inst.setDate(v[0], fill);
				}

				for (i; i < v.length; i++) {
					inst._selectedValues[v[i]] = v[i];
				}
				refresh();
			};
			if (!inst._getValues) {
				inst._getValues = inst.getValues;

				inst.getValues = function () {
					return multi ? inst._getValues() : [inst.getDate()];
				};
			}

			if (eventMode) {

				inst.addEvent = function (events) {
					var ret = [];
					events = $.extend(true, [], $.isArray(events) ? events : [events]);
					$.each(events, function (i, e) {
						e._id = eventID++;
						eventList.push(e);
						ret.push(e._id);
					});
					refresh();
					return ret;
				};

				inst.removeEvent = function (eids) {
					eids = $.isArray(eids) ? eids : [eids];
					$.each(eids, function (i, eid) {
						$.each(eventList, function (j, e) {
							if (e._id === eid) {
								eventList.splice(j, 1);
								return false;
							}
						});
					});
					refresh();
				};

				inst.getEvents = function () {
					return eventList;
				};

				inst.setEvents = function (events) {
					var ret = [];
					eventList = $.extend(true, [], events);
					$.each(eventList, function (i, e) {
						e._id = eventID++;
						ret.push(e._id);
					});
					refresh();
					return ret;
				};

			}

			// ---

			$.extend(ret, {
				highlight: !multi && !eventMode,
				divergentDayChange: !multi && !eventMode,
				buttons: eventMode ? ['cancel'] : s.buttons,
				onClear: function () {
					if (multi) {
						inst._selectedValues = {};
						inst.refresh();
					}
				},
				onBeforeShow: function () {
					if (eventMode) {
						s.headerText = false;
					}
					if (s.closeOnSelect) {
						s.divergentDayChange = false;
					}
					if (s.counter && multi) {
						s.headerText = function () {
							var length = 0,
							    w = (s.selectType == 'week') ? 7 : 1;
							$.each(inst._selectedValues, function () {
								length++;
							});
							return (length / w)  + " " + s.selectedText;
						};
					}
				},
				onMarkupReady: function (dw) {
					base.onMarkupReady.call(this, dw);

					ctx = dw;

					if (multi) {
						$('.dwv', dw).attr('aria-live', 'off');
						origValues = $.extend({}, inst._selectedValues);
					}

					if (markedText) {
						$('.dw-cal', dw).addClass('dw-cal-ev');
					}

					if (markedStyle) {
						$('.dw-cal', dw).addClass('dw-cal-m-' + markedStyle);
					}

					if (eventMode) {
						dw.addClass('dw-cal-em');
						evc = $('<div class="dw-cal-events ' + (s.eventBubbleClass || '') + '"><div class="dw-cal-events-arr"></div><div class="dw-cal-events-i"><div class="dw-cal-events-sc"></div></div></div>').appendTo($('.dw-cal-c', dw));

						evci = $('.dw-cal-events-i', evc);
						evsc = $('.dw-cal-events-sc', evc);

						evc.on('touchstart mousedown', function (e) {
							if (maxPos < 0) {
								touch = e.type === 'touchstart';
								scrolled = false;
								startPos = pos;
								startY = get(e, 'Y');
								endY = get(e, 'Y');

								$(document).on(touch ? 'touchmove.dwsc' : 'mousemove.dwsc', function (e) {
									e.preventDefault();
									endY = get(e, 'Y');
									pos = Math.min(0, Math.max(startPos + endY - startY, maxPos));
									scroll(pos);

									if (Math.abs(endY - startY) > 5) {
										scrolled = true;
									}
								}).on(touch ? 'touchend.dwsc' : 'mouseup.dwsc', function () {
									$(document).off('.dwsc');
								});
							}
						});

						inst.tap(evc, function () {
							if (!scrolled) {
								hideEvents();
							}
						});
					}
				},
				onMonthChange: function () {
					if (eventMode) {
						hideEvents();
					}
				},
				onMonthLoaded: function () {
					if (showEvent) {
						showEvents(showEvent.d, $('.dw-cal-day-v[data-full="' + showEvent.full + '"]:not(.dw-cal-day-diff)', ctx));
						showEvent = false;
					}
				},
				onDayChange: function (day) {
					var d = day.date,
					    cell = $(day.cell),
					    selected = day.selected;

					if (eventMode) {
						hideEvents();
						if (!cell.hasClass('dw-cal-day-ev')) {
							//if (s.divergentDayChange && cell.hasClass('dw-cal-day-diff')) {
							//    showEvent = { d: d, full: cell.attr('data-full') };
							//} else {
							//    showEvents(d, cell);
							//}
							setTimeout(function () {
								if (inst.changing) {
									showEvent = { d: d, full: cell.attr('data-full') };
								} else {
									showEvents(d, cell);
								}
							}, 10);
						}
					} else if (multi) {
						if (s.selectType == 'week') { // Select whole week
							var i,
							    sel,
							    diff = d.getDay() - s.firstSelectDay;

							diff = diff < 0 ? 7 + diff : diff;

							if (!s.multiSelect) { // Only one week can be selected
								inst._selectedValues = {};
							}
							for (i = 0; i < 7; i++) {
								sel = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff + i);
								if (selected) {
									delete inst._selectedValues[sel];
								} else {
									inst._selectedValues[sel] = sel;
								}
							}
							refresh();
						} else { // Select day only
							var days = $('.dw-cal .dw-cal-day[data-full="' + cell.attr('data-full') + '"]', ctx);

							if (selected) {
								days.removeClass('dw-sel').removeAttr('aria-selected').find('.dw-i').removeClass(activeClass);
								delete inst._selectedValues[d];
							} else {
								days.addClass('dw-sel').attr('aria-selected', 'true').find('.dw-i').addClass(activeClass);
								inst._selectedValues[d] = d;
							}
						}
					}

					if (!eventMode && !s.multiSelect && s.closeOnSelect && s.display !== 'inline') {
						inst.needsSlide = false;
						inst.setDate(d);
						inst.select();
						return false;
					}
				},
				onCalResize: function () {
					if (evVisible) {
						$('.dw-cal-events-arr', evc).css('left', evd.offset().left - evc.offset().left + evd.width() / 2);
					}
				},
				onCancel: function () {
					if (!inst.live && multi) {
						inst._selectedValues = $.extend({}, origValues);
					}
				}
			});

			return ret;
		};

	})(jQuery);

	(function ($) {

		var ms = $.mobiscroll,
		    date = new Date(),
		    defaults = {
			    startYear: date.getFullYear() - 100,
			    endYear: date.getFullYear() + 1,
			    shortYearCutoff: '+10',
			    showNow: false,
			    stepHour: 1,
			    stepMinute: 1,
			    stepSecond: 1,
			    separator: ' ',
			    // Localization
			    dateFormat: 'mm/dd/yy',
			    dateOrder: 'mmddy',
			    timeWheels: 'hhiiA',
			    timeFormat: 'hh:ii A',
			    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			    monthText: 'Month',
			    dayText: 'Day',
			    yearText: 'Year',
			    hourText: 'Hours',
			    minuteText: 'Minutes',
			    ampmText: '&nbsp;',
			    secText: 'Seconds',
			    amText: 'am',
			    pmText: 'pm',
			    nowText: 'Now',
			    getYear: function (d) { return d.getFullYear(); },
			    getMonth: function (d) { return d.getMonth(); },
			    getDay: function (d) { return d.getDate(); },
			    getDate: function (y, m, d, h, i, s) { return new Date(y, m, d, h || 0, i || 0, s || 0); },
			    getMaxDayOfMonth: function (y, m) { return 32 - new Date(y, m, 32).getDate(); },
			    getWeekNumber: function (d) {
				    // Copy date so don't modify original
				    d = new Date(d);
				    d.setHours(0, 0, 0);
				    // Set to nearest Thursday: current date + 4 - current day number
				    // Make Sunday's day number 7
				    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
				    // Get first day of year
				    var yearStart = new Date(d.getFullYear(), 0, 1);
				    // Calculate full weeks to nearest Thursday
				    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
			    }
		    },
		    /**
		     * @class Mobiscroll.datetime
		     * @extends Mobiscroll
		     * Mobiscroll Datetime component
		     */
		    preset = function (inst) {
			    var that = $(this),
			        html5def = {},
			        format;
			    // Force format for html5 date inputs (experimental)
			    if (that.is('input')) {
				    switch (that.attr('type')) {
					    case 'date':
						    format = 'yy-mm-dd';
						    break;
					    case 'datetime':
						    format = 'yy-mm-ddTHH:ii:ssZ';
						    break;
					    case 'datetime-local':
						    format = 'yy-mm-ddTHH:ii:ss';
						    break;
					    case 'month':
						    format = 'yy-mm';
						    html5def.dateOrder = 'mmyy';
						    break;
					    case 'time':
						    format = 'HH:ii:ss';
						    break;
				    }
				    // Check for min/max attributes
				    var min = that.attr('min'),
				        max = that.attr('max');
				    if (min) {
					    html5def.minDate = ms.parseDate(format, min);
				    }
				    if (max) {
					    html5def.maxDate = ms.parseDate(format, max);
				    }
			    }

			    // Set year-month-day order
			    var i,
			        k,
			        keys,
			        values,
			        wg,
			        start,
			        end,
			        hasTime,
			        orig = $.extend({}, inst.settings),
			        s = $.extend(inst.settings, defaults, html5def, orig),
			        offset = 0,
			        wheels = [],
			        ord = [],
			        o = {},
			        f = { y: getYear, m: getMonth, d: getDay, h: getHour, i: getMinute, s: getSecond, a: getAmPm },
			        invalid = s.invalid,
			        valid = s.valid,
			        p = s.preset,
			        dord = s.dateOrder,
			        tord = s.timeWheels,
			        regen = dord.match(/D/),
			        ampm = tord.match(/a/i),
			        hampm = tord.match(/h/),
			        hformat = p == 'datetime' ? s.dateFormat + s.separator + s.timeFormat : p == 'time' ? s.timeFormat : s.dateFormat,
			        defd = new Date(),
			        stepH = s.stepHour,
			        stepM = s.stepMinute,
			        stepS = s.stepSecond,
			        mind = s.minDate || new Date(s.startYear, 0, 1),
			        maxd = s.maxDate || new Date(s.endYear, 11, 31, 23, 59, 59),
			        minH = mind.getHours() % stepH,
			        minM = mind.getMinutes() % stepM,
			        minS = mind.getSeconds() % stepS,
			        maxH = getMax(stepH, minH, (hampm ? 11 : 23)),
			        maxM = getMax(stepM, minM, 59),
			        maxS = getMax(stepM, minM, 59);

			    format = format || hformat;

			    if (p.match(/date/i)) {

				    // Determine the order of year, month, day wheels
				    $.each(['y', 'm', 'd'], function (j, v) {
					    i = dord.search(new RegExp(v, 'i'));
					    if (i > -1) {
						    ord.push({ o: i, v: v });
					    }
				    });
				    ord.sort(function (a, b) { return a.o > b.o ? 1 : -1; });
				    $.each(ord, function (i, v) {
					    o[v.v] = i;
				    });

				    wg = [];
				    for (k = 0; k < 3; k++) {
					    if (k == o.y) {
						    offset++;
						    values = [];
						    keys = [];
						    start = s.getYear(mind);
						    end = s.getYear(maxd);
						    for (i = start; i <= end; i++) {
							    keys.push(i);
							    values.push((dord.match(/yy/i) ? i : (i + '').substr(2, 2)) + (s.yearSuffix || ''));
						    }
						    addWheel(wg, keys, values, s.yearText);
					    } else if (k == o.m) {
						    offset++;
						    values = [];
						    keys = [];
						    for (i = 0; i < 12; i++) {
							    var str = dord.replace(/[dy]/gi, '').replace(/mm/, (i < 9 ? '0' + (i + 1) : i + 1) + (s.monthSuffix || '')).replace(/m/, i + 1 + (s.monthSuffix || ''));
							    keys.push(i);
							    values.push(str.match(/MM/) ? str.replace(/MM/, '<span class="dw-mon">' + s.monthNames[i] + '</span>') : str.replace(/M/, '<span class="dw-mon">' + s.monthNamesShort[i] + '</span>'));
						    }
						    addWheel(wg, keys, values, s.monthText);
					    } else if (k == o.d) {
						    offset++;
						    values = [];
						    keys = [];
						    for (i = 1; i < 32; i++) {
							    keys.push(i);
							    values.push((dord.match(/dd/i) && i < 10 ? '0' + i : i) + (s.daySuffix || ''));
						    }
						    addWheel(wg, keys, values, s.dayText);
					    }
				    }
				    wheels.push(wg);
			    }

			    if (p.match(/time/i)) {
				    hasTime = true;

				    // Determine the order of hours, minutes, seconds wheels
				    ord = [];
				    $.each(['h', 'i', 's', 'a'], function (i, v) {
					    i = tord.search(new RegExp(v, 'i'));
					    if (i > -1) {
						    ord.push({ o: i, v: v });
					    }
				    });
				    ord.sort(function (a, b) {
					    return a.o > b.o ? 1 : -1;
				    });
				    $.each(ord, function (i, v) {
					    o[v.v] = offset + i;
				    });

				    wg = [];
				    for (k = offset; k < offset + 4; k++) {
					    if (k == o.h) {
						    offset++;
						    values = [];
						    keys = [];
						    for (i = minH; i < (hampm ? 12 : 24); i += stepH) {
							    keys.push(i);
							    values.push(hampm && i === 0 ? 12 : tord.match(/hh/i) && i < 10 ? '0' + i : i);
						    }
						    addWheel(wg, keys, values, s.hourText);
					    } else if (k == o.i) {
						    offset++;
						    values = [];
						    keys = [];
						    for (i = minM; i < 60; i += stepM) {
							    keys.push(i);
							    values.push(tord.match(/ii/) && i < 10 ? '0' + i : i);
						    }
						    addWheel(wg, keys, values, s.minuteText);
					    } else if (k == o.s) {
						    offset++;
						    values = [];
						    keys = [];
						    for (i = minS; i < 60; i += stepS) {
							    keys.push(i);
							    values.push(tord.match(/ss/) && i < 10 ? '0' + i : i);
						    }
						    addWheel(wg, keys, values, s.secText);
					    } else if (k == o.a) {
						    offset++;
						    var upper = tord.match(/A/);
						    addWheel(wg, [0, 1], upper ? [s.amText.toUpperCase(), s.pmText.toUpperCase()] : [s.amText, s.pmText], s.ampmText);
					    }
				    }

				    wheels.push(wg);
			    }

			    function get(d, i, def) {
				    if (o[i] !== undefined) {
					    return +d[o[i]];
				    }
				    if (def !== undefined) {
					    return def;
				    }
				    return f[i](defd);
			    }

			    function addWheel(wg, k, v, lbl) {
				    wg.push({
					    values: v,
					    keys: k,
					    label: lbl
				    });
			    }

			    function step(v, st, min, max) {
				    return Math.min(max, Math.floor(v / st) * st + min);
			    }

			    function getYear(d) {
				    return s.getYear(d);
			    }

			    function getMonth(d) {
				    return s.getMonth(d);
			    }

			    function getDay(d) {
				    return s.getDay(d);
			    }

			    function getHour(d) {
				    var hour = d.getHours();
				    hour = hampm && hour >= 12 ? hour - 12 : hour;
				    return step(hour, stepH, minH, maxH);
			    }

			    function getMinute(d) {
				    return step(d.getMinutes(), stepM, minM, maxM);
			    }

			    function getSecond(d) {
				    return step(d.getSeconds(), stepS, minS, maxS);
			    }

			    function getAmPm(d) {
				    return ampm && d.getHours() > 11 ? 1 : 0;
			    }

			    function getDate(d) {
				    var hour = get(d, 'h', 0);
				    return s.getDate(get(d, 'y'), get(d, 'm'), get(d, 'd'), get(d, 'a', 0) ? hour + 12 : hour, get(d, 'i', 0), get(d, 's', 0));
			    }

			    function getMax(step, min, max) {
				    return Math.floor((max - min) / step) * step + min;
			    }

			    function getClosestValidDate(d, dir) {
				    var next,
				        prev,
				        nextValid = false,
				        prevValid = false,
				        up = 0,
				        down = 0;

				    if (isValid(d)) {
					    return d;
				    }

				    if (d < mind) {
					    d = mind;
				    }

				    if (d > maxd) {
					    d = maxd;
				    }

				    next = d;
				    prev = d;

				    if (dir !== 2) {
					    nextValid = isValid(next);

					    while (!nextValid && next < maxd) {
						    next = new Date(next.getTime() + 1000 * 60 * 60 * 24);
						    nextValid = isValid(next);
						    up++;
					    }
				    }

				    if (dir !== 1) {
					    prevValid = isValid(prev);

					    while (!prevValid && prev > mind) {
						    prev = new Date(prev.getTime() - 1000 * 60 * 60 * 24);
						    prevValid = isValid(prev);
						    down++;
					    }
				    }

				    if (dir === 1 && nextValid) {
					    return next;
				    }

				    if (dir === 2 && prevValid) {
					    return prev;
				    }

				    return down < up && prevValid ? prev : next;
			    }

			    function isValid(d) {
				    if (d < mind) {
					    return false;
				    }

				    if (d > maxd) {
					    return false;
				    }

				    if (isInObj(d, valid)) {
					    return true;
				    }

				    if (isInObj(d, invalid)) {
					    return false;
				    }

				    return true;
			    }

			    function isInObj(d, obj) {
				    var curr,
				        j,
				        v;

				    if (obj) {
					    for (j = 0; j < obj.length; j++) {
						    curr = obj[j];
						    v = curr + '';
						    if (!curr.start) {
							    if (curr.getTime) { // Exact date
								    if (d.getFullYear() == curr.getFullYear() && d.getMonth() == curr.getMonth() && d.getDate() == curr.getDate()) {
									    return true;
								    }
							    } else if (!v.match(/w/i)) { // Day of month
								    v = v.split('/');
								    if (v[1]) {
									    if ((v[0] - 1) == d.getMonth() && v[1] == d.getDate()) {
										    return true;
									    }
								    } else if (v[0] == d.getDate()) {
									    return true;
								    }
							    } else { // Day of week
								    v = +v.replace('w', '');
								    if (v == d.getDay()) {
									    return true;
								    }
							    }
						    }
					    }
				    }
				    return false;
			    }

			    function validateDates(obj, y, m, first, maxdays, idx, val) {
				    var j, d, v;

				    if (obj) {
					    for (j = 0; j < obj.length; j++) {
						    d = obj[j];
						    v = d + '';
						    if (!d.start) {
							    if (d.getTime) { // Exact date
								    if (s.getYear(d) == y && s.getMonth(d) == m) {
									    idx[s.getDay(d) - 1] = val;
								    }
							    } else if (!v.match(/w/i)) { // Day of month
								    v = v.split('/');
								    if (v[1]) {
									    if (v[0] - 1 == m) {
										    idx[v[1] - 1] = val;
									    }
								    } else {
									    idx[v[0] - 1] = val;
								    }
							    } else { // Day of week
								    v = +v.replace('w', '');
								    for (k = v - first; k < maxdays; k += 7) {
									    if (k >= 0) {
										    idx[k] = val;
									    }
								    }
							    }
						    }
					    }
				    }
			    }

			    function validateTimes(vobj, temp, y, m, mins, maxs, dir, dw, valid) {
				    var dd, v, val, str, parts1, parts2, j, v1, v2, i1, i2, prop1, prop2, target, add, remove,
				        spec = {},
				        steps = { h: stepH, i: stepM, s: stepS, a: 1 },
				        d = get(temp, 'd'),
				        day = s.getDate(y, m, d),
				        w = ['a', 'h', 'i', 's'];

				    if (vobj) {
					    $.each(vobj, function (i, obj) {
						    if (obj.start) {
							    obj.apply = false;
							    dd = obj.d;
							    v = dd + '';
							    str = v.split('/');
							    if (dd && ((dd.getTime && y == s.getYear(dd) && m == s.getMonth(dd) && d == s.getDay(dd)) || // Exact date
									    (!v.match(/w/i) && ((str[1] && d == str[1] && m == str[0] - 1) || (!str[1] && d == str[0]))) || // Day of month
									    (v.match(/w/i) && day.getDay() == +v.replace('w', '')) // Day of week
								    )) {
								    obj.apply = true;
								    spec[day] = true; // Prevent applying generic rule on day, if specific exists
							    }
						    }
					    });

					    $.each(vobj, function (i, obj) {
						    if (obj.start && (obj.apply || (!obj.d && !spec[day]))) {

							    parts1 = obj.start.split(':');
							    parts2 = obj.end.split(':');

							    for (j = 0; j < 3; j++) {
								    if (parts1[j] === undefined) {
									    parts1[j] = 0;
								    }
								    if (parts2[j] === undefined) {
									    parts2[j] = 59;
								    }
								    parts1[j] = +parts1[j];
								    parts2[j] = +parts2[j];
							    }

							    parts1.unshift(parts1[0] > 11 ? 1 : 0);
							    parts2.unshift(parts2[0] > 11 ? 1 : 0);

							    if (hampm) {
								    if (parts1[1] >= 12) {
									    parts1[1] = parts1[1] - 12;
								    }

								    if (parts2[1] >= 12) {
									    parts2[1] = parts2[1] - 12;
								    }
							    }

							    prop1 = true;
							    prop2 = true;
							    $.each(w, function (i, v) {
								    if (o[v] !== undefined) {
									    val = get(temp, v);
									    add = 0;
									    remove = 0;
									    i1 = 0;
									    i2 = undefined;
									    target = $('.dw-ul', dw).eq(o[v]);

									    // Look ahead if next wheels should be disabled completely
									    for (j = i + 1; j < 4; j++) {
										    if (parts1[j] > 0) {
											    add = steps[v];
										    }
										    if (parts2[j] < maxs[w[j]]) {
											    remove = steps[v];
										    }
									    }

									    // Calculate min and max values
									    v1 = step(parts1[i], steps[v], mins[v], maxs[v]) + add;
									    v2 = step(parts2[i], steps[v], mins[v], maxs[v]) - remove;

									    if (prop1) {
										    i1 = getValidIndex(target, v1, maxs[v], 0);
									    }

									    if (prop2) {
										    i2 = getValidIndex(target, v2, maxs[v], 1);
									    }

									    // Disable values
									    if (prop1 || prop2) {
										    if (valid) {
											    $('.dw-li', target).slice(i1, i2).addClass('dw-v');
										    } else {
											    $('.dw-li', target).slice(i1, i2).removeClass('dw-v');
										    }
									    }

									    // Get valid value
									    val = inst.getValidCell(val, target, dir).val;

									    prop1 = prop1 && val == step(parts1[i], steps[v], mins[v], maxs[v]);
									    prop2 = prop2 && val == step(parts2[i], steps[v], mins[v], maxs[v]);
								    }
							    });
						    }
					    });
				    }
			    }

			    function getIndex(t, v) {
				    return $('.dw-li', t).index($('.dw-li[data-val="' + v + '"]', t));
			    }

			    function getValidIndex(t, v, max, add) {
				    if (v < 0) {
					    return 0;
				    }
				    if (v > max) {
					    return $('.dw-li', t).length;
				    }
				    return getIndex(t, v) + add;
			    }

			    function getArray(d) {
				    var i,
				        ret = [];

				    for (i in o) {
					    ret[o[i]] = f[i](d);
				    }

				    return ret;
			    }

			    function convertRanges(arr) {
				    var i, v, start,
				        ret = [];

				    if (arr) {
					    for (i = 0; i < arr.length; i++) {
						    v = arr[i];
						    if (v.start && v.start.getTime) {
							    start = new Date(v.start);
							    while (start <= v.end) {
								    ret.push(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
								    start.setDate(start.getDate() + 1);
							    }
						    } else {
							    ret.push(v);
						    }
					    }
					    return ret;
				    }
				    return arr;
			    }

			    // Extended methods
			    // ---

			    /**
			     * Sets the selected date
			     *
			     * @param {Date} d Date to select.
			     * @param {Boolean} [fill=false] Also set the value of the associated input element. Default is true.
			     * @param {Number} [time=0] Animation time to scroll to the selected date.
			     * @param {Boolean} [temp=false] Set temporary value only.
			     * @param {Boolean} [change=fill] Trigger change on input element.
			     */
			    inst.setDate = function (d, fill, time, temp, change) {
				    inst.temp = getArray(d);
				    inst.setValue(inst.temp, fill, time, temp, change);
			    };

			    /**
			     * Returns the currently selected date.
			     *
			     * @param {Boolean} [temp=false] If true, return the currently shown date on the picker, otherwise the last selected one.
			     * @return {Date}
			     */
			    inst.getDate = function (temp) {
				    return getDate(temp ? inst.temp : inst.values);
			    };

			    /**
			     * @deprecated since 2.7.0, backward compatibility code
			     */
			    inst.convert = function (obj) {
				    var x = obj;

				    if (!$.isArray(obj)) { // Convert from old format
					    x = [];
					    $.each(obj, function (i, o) {
						    $.each(o, function (j, o) {
							    if (i === 'daysOfWeek') {
								    if (o.d) {
									    o.d = 'w' + o.d;
								    } else {
									    o = 'w' + o;
								    }
							    }
							    x.push(o);
						    });
					    });
				    }

				    return x;
			    };

			    // ---


			    // Initializations
			    // ---

			    inst.format = hformat;
			    inst.buttons.now = { text: s.nowText, css: 'dwb-n', handler: function () { inst.setDate(new Date(), false, 0.3, true, true); } };

			    // @deprecated since 2.8.0, backward compatibility code
			    // ---
			    if (s.showNow) {
				    s.buttons.splice($.inArray('set', s.buttons) + 1, 0, 'now');
			    }
			    invalid = invalid ? inst.convert(invalid) : false;
			    // ---

			    invalid = convertRanges(invalid);
			    valid = convertRanges(valid);

			    // Normalize min and max dates for comparing later (set default values where there are no values from wheels)
			    mind = getDate(getArray(mind));
			    maxd = getDate(getArray(maxd));

			    // ---

			    return {
				    wheels: wheels,
				    headerText: s.headerText ? function () {
					    return ms.formatDate(hformat, getDate(inst.temp), s);
				    } : false,
				    formatResult: function (d) {
					    return ms.formatDate(format, getDate(d), s);
				    },
				    parseValue: function (val) {
					    return getArray(ms.parseDate(format, val, s));
				    },
				    validate: function (dw, i, time, dir) {
					    var validated = getClosestValidDate(getDate(inst.temp), dir),
					        temp = getArray(validated),//inst.temp,//.slice(0),
					        mins = { y: mind.getFullYear(), m: 0, d: 1, h: minH, i: minM, s: minS, a: 0 },
					        maxs = { y: maxd.getFullYear(), m: 11, d: 31, h: maxH, i: maxM, s: maxS, a: 1 },
					        y = get(temp, 'y'),
					        m = get(temp, 'm'),
					        minprop = true,
					        maxprop = true;

					    $.each(['y', 'm', 'd', 'a', 'h', 'i', 's'], function (x, i) {
						    if (o[i] !== undefined) {
							    var min = mins[i],
							        max = maxs[i],
							        maxdays = 31,
							        val = get(temp, i),
							        t = $('.dw-ul', dw).eq(o[i]);

							    if (i == 'd') {
								    maxdays = s.getMaxDayOfMonth(y, m);
								    max = maxdays;
								    if (regen) {
									    $('.dw-li', t).each(function () {
										    var that = $(this),
										        d = that.data('val'),
										        w = s.getDate(y, m, d).getDay(),
										        str = dord.replace(/[my]/gi, '').replace(/dd/, (d < 10 ? '0' + d : d) + (s.daySuffix || '')).replace(/d/, d + (s.daySuffix || ''));
										    $('.dw-i', that).html(str.match(/DD/) ? str.replace(/DD/, '<span class="dw-day">' + s.dayNames[w] + '</span>') : str.replace(/D/, '<span class="dw-day">' + s.dayNamesShort[w] + '</span>'));
									    });
								    }
							    }
							    if (minprop && mind) {
								    min = f[i](mind);
							    }
							    if (maxprop && maxd) {
								    max = f[i](maxd);
							    }
							    if (i != 'y') {
								    var i1 = getIndex(t, min),
								        i2 = getIndex(t, max);
								    $('.dw-li', t).removeClass('dw-v').slice(i1, i2 + 1).addClass('dw-v');
								    if (i == 'd') { // Hide days not in month
									    $('.dw-li', t).removeClass('dw-h').slice(maxdays).addClass('dw-h');
								    }
							    }
							    if (val < min) {
								    val = min;
							    }
							    if (val > max) {
								    val = max;
							    }
							    if (minprop) {
								    minprop = val == min;
							    }
							    if (maxprop) {
								    maxprop = val == max;
							    }
							    // Disable some days
							    if (i == 'd') {
								    var first = s.getDate(y, m, 1).getDay(),
								        idx = {};

								    // Set invalid indexes
								    validateDates(invalid, y, m, first, maxdays, idx, 1);
								    // Delete indexes which are valid
								    validateDates(valid, y, m, first, maxdays, idx, 0);

								    $.each(idx, function (i, v) {
									    if (v) {
										    $('.dw-li', t).eq(i).removeClass('dw-v');
									    }
								    });
							    }
						    }
					    });

					    // Invalid times
					    if (hasTime) {
						    validateTimes(invalid, temp, y, m, mins, maxs, dir, dw, 0);
						    validateTimes(valid, temp, y, m, mins, maxs, dir, dw, 1);
					    }

					    inst.temp = temp;
				    }
			    };
		    };

		$.each(['date', 'time', 'datetime'], function (i, v) {
			ms.presets[v] = preset;
			ms.presetShort(v);
		});

		// Utility functions
		ms.datetime = {};

		/**
		 * Format a date into a string value with a specified format.
		 * @param {String} format Output format.
		 * @param {Date} date Date to format.
		 * @param {Object} [settings={}] Settings.
		 * @return {String} Returns the formatted date string.
		 */
		ms.formatDate = ms.datetime.formatDate = function (format, date, settings) {
			if (!date) {
				return null;
			}
			var s = $.extend({}, defaults, settings),
			    look = function (m) { // Check whether a format character is doubled
				    var n = 0;
				    while (i + 1 < format.length && format.charAt(i + 1) == m) {
					    n++;
					    i++;
				    }
				    return n;
			    },
			    f1 = function (m, val, len) { // Format a number, with leading zero if necessary
				    var n = '' + val;
				    if (look(m)) {
					    while (n.length < len) {
						    n = '0' + n;
					    }
				    }
				    return n;
			    },
			    f2 = function (m, val, s, l) { // Format a name, short or long as requested
				    return (look(m) ? l[val] : s[val]);
			    },
			    i,
			    year,
			    output = '',
			    literal = false;

			for (i = 0; i < format.length; i++) {
				if (literal) {
					if (format.charAt(i) == "'" && !look("'")) {
						literal = false;
					} else {
						output += format.charAt(i);
					}
				} else {
					switch (format.charAt(i)) {
						case 'd':
							output += f1('d', s.getDay(date), 2);
							break;
						case 'D':
							output += f2('D', date.getDay(), s.dayNamesShort, s.dayNames);
							break;
						case 'o':
							output += f1('o', (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000, 3);
							break;
						case 'm':
							output += f1('m', s.getMonth(date) + 1, 2);
							break;
						case 'M':
							output += f2('M', s.getMonth(date), s.monthNamesShort, s.monthNames);
							break;
						case 'y':
							year = s.getYear(date);
							output += (look('y') ? year : (year % 100 < 10 ? '0' : '') + year % 100);
							//output += (look('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
							break;
						case 'h':
							var h = date.getHours();
							output += f1('h', (h > 12 ? (h - 12) : (h === 0 ? 12 : h)), 2);
							break;
						case 'H':
							output += f1('H', date.getHours(), 2);
							break;
						case 'i':
							output += f1('i', date.getMinutes(), 2);
							break;
						case 's':
							output += f1('s', date.getSeconds(), 2);
							break;
						case 'a':
							output += date.getHours() > 11 ? s.pmText : s.amText;
							break;
						case 'A':
							output += date.getHours() > 11 ? s.pmText.toUpperCase() : s.amText.toUpperCase();
							break;
						case "'":
							if (look("'")) {
								output += "'";
							} else {
								literal = true;
							}
							break;
						default:
							output += format.charAt(i);
					}
				}
			}
			return output;
		};

		/**
		 * Extract a date from a string value with a specified format.
		 * @param {String} format Input format.
		 * @param {String} value String to parse.
		 * @param {Object} [settings={}] Settings.
		 * @return {Date} Returns the extracted date.
		 */
		ms.parseDate = ms.datetime.parseDate = function (format, value, settings) {
			var s = $.extend({}, defaults, settings),
			    def = s.defaultValue || new Date();

			if (!format || !value) {
				return def;
			}

			value = (typeof value == 'object' ? value.toString() : value + '');

			var shortYearCutoff = s.shortYearCutoff,
			    year = s.getYear(def),
			    month = s.getMonth(def) + 1,
			    day = s.getDay(def),
			    doy = -1,
			    hours = def.getHours(),
			    minutes = def.getMinutes(),
			    seconds = 0, //def.getSeconds(),
			    ampm = -1,
			    literal = false, // Check whether a format character is doubled
			    lookAhead = function (match) {
				    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
				    if (matches) {
					    iFormat++;
				    }
				    return matches;
			    },
			    getNumber = function (match) { // Extract a number from the string value
				    lookAhead(match);
				    var size = (match == '@' ? 14 : (match == '!' ? 20 : (match == 'y' ? 4 : (match == 'o' ? 3 : 2)))),
				        digits = new RegExp('^\\d{1,' + size + '}'),
				        num = value.substr(iValue).match(digits);

				    if (!num) {
					    return 0;
				    }
				    iValue += num[0].length;
				    return parseInt(num[0], 10);
			    },
			    getName = function (match, s, l) { // Extract a name from the string value and convert to an index
				    var names = (lookAhead(match) ? l : s),
				        i;

				    for (i = 0; i < names.length; i++) {
					    if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
						    iValue += names[i].length;
						    return i + 1;
					    }
				    }
				    return 0;
			    },
			    checkLiteral = function () {
				    iValue++;
			    },
			    iValue = 0,
			    iFormat;

			for (iFormat = 0; iFormat < format.length; iFormat++) {
				if (literal) {
					if (format.charAt(iFormat) == "'" && !lookAhead("'")) {
						literal = false;
					} else {
						checkLiteral();
					}
				} else {
					switch (format.charAt(iFormat)) {
						case 'd':
							day = getNumber('d');
							break;
						case 'D':
							getName('D', s.dayNamesShort, s.dayNames);
							break;
						case 'o':
							doy = getNumber('o');
							break;
						case 'm':
							month = getNumber('m');
							break;
						case 'M':
							month = getName('M', s.monthNamesShort, s.monthNames);
							break;
						case 'y':
							year = getNumber('y');
							break;
						case 'H':
							hours = getNumber('H');
							break;
						case 'h':
							hours = getNumber('h');
							break;
						case 'i':
							minutes = getNumber('i');
							break;
						case 's':
							seconds = getNumber('s');
							break;
						case 'a':
							ampm = getName('a', [s.amText, s.pmText], [s.amText, s.pmText]) - 1;
							break;
						case 'A':
							ampm = getName('A', [s.amText, s.pmText], [s.amText, s.pmText]) - 1;
							break;
						case "'":
							if (lookAhead("'")) {
								checkLiteral();
							} else {
								literal = true;
							}
							break;
						default:
							checkLiteral();
					}
				}
			}
			if (year < 100) {
				year += new Date().getFullYear() - new Date().getFullYear() % 100 +
					(year <= (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10)) ? 0 : -100);
			}
			if (doy > -1) {
				month = 1;
				day = doy;
				do {
					var dim = 32 - new Date(year, month - 1, 32).getDate();
					if (day <= dim) {
						break;
					}
					month++;
					day -= dim;
				} while (true);
			}
			hours = (ampm == -1) ? hours : ((ampm && hours < 12) ? (hours + 12) : (!ampm && hours == 12 ? 0 : hours));

			var date = s.getDate(year, month - 1, day, hours, minutes, seconds);

			if (s.getYear(date) != year || s.getMonth(date) + 1 != month || s.getDay(date) != day) {
				return def; // Invalid date
			}

			return date;
		};

	})(jQuery);

	(function ($) {
		var ms = $.mobiscroll,
		    defaults = {
			    invalid: [],
			    showInput: true,
			    inputClass: ''
		    },
		    preset = function (inst) {
			    var orig = $.extend({}, inst.settings),
			        s = $.extend(inst.settings, defaults, orig),
			        layout = s.layout || (/top|bottom/.test(s.display) ? 'liquid' : ''),
			        isLiquid = layout == 'liquid',
			        origReadOnly = s.readonly,
			        elm = $(this),
			        input,
			        prevent,
			        id = this.id + '_dummy',
			        lvl = 0,
			        ilvl = 0,
			        timer = {},
			        wa = s.wheelArray || createWheelArray(elm),
			        labels = generateLabels(lvl),
			        currLevel = 0,
			        currWheelVector = [],
			        fwv = firstWheelVector(wa),
			        w = generateWheelsFromVector(fwv, lvl);

			    /**
			     * Disables the invalid items on the wheels
			     * @param {Object} dw - the jQuery mobiscroll object
			     * @param {Number} nrWheels - the number of the current wheels
			     * @param {Array} whArray - The wheel array objects containing the wheel tree
			     * @param {Array} whVector - the wheel vector containing the current keys
			     */
			    function setDisabled(dw, nrWheels, whArray, whVector) {
				    var j,
				        i = 0;

				    while (i < nrWheels) {
					    var currWh = $('.dwwl' + i, dw),
					        inv = getInvalidKeys(whVector, i, whArray);

					    for (j = 0; j < inv.length; j++) {
						    $('.dw-li[data-val="' + inv[j] + '"]', currWh).removeClass('dw-v');
					    }
					    i++;
				    }
			    }

			    /**
			     * Returns the invalid keys of one wheel as an array
			     * @param {Array} whVector - the wheel vector used to search for the wheel in the wheel array
			     * @param {Number} index - index of the wheel in the wheel vector, that we are interested in
			     * @param {Array} whArray - the wheel array we are searching in
			     * @return {Array} - list of invalid keys
			     */
			    function getInvalidKeys(whVector, index, whArray) {
				    var i = 0,
				        n,
				        whObjA = whArray,
				        invalids = [];

				    while (i < index) {
					    var ii = whVector[i];
					    //whObjA = whObjA[ii].children;
					    for (n in whObjA) {
						    if (whObjA[n].key == ii) {
							    whObjA = whObjA[n].children;
							    break;
						    }
					    }
					    i++;
				    }
				    i = 0;
				    while (i < whObjA.length) {
					    if (whObjA[i].invalid) {
						    invalids.push(whObjA[i].key);
					    }
					    i++;
				    }
				    return invalids;
			    }

			    /**
			     * Creates a Boolean vector with true values (except one) that can be used as the readonly vector
			     * n - the length of the vector
			     * i - the index of the value that's going to be false
			     */
			    function createROVector(n, i) {
				    var a = [];
				    while (n) {
					    a[--n] = true;
				    }
				    a[i] = false;
				    return a;
			    }

			    /**
			     * Creates a labels vector, from values if they are defined, otherwise from numbers
			     * l - the length of the vector
			     */
			    function generateLabels(l) {
				    var a = [],
				        i;
				    for (i = 0; i < l; i++) {
					    a[i] = s.labels && s.labels[i] ? s.labels[i] : i;
				    }
				    return a;
			    }

			    /**
			     * Creates the wheel array from the vector provided
			     * wv - wheel vector containing the values that should be selected on the wheels
			     * l - the length of the wheel array
			     */
			    function generateWheelsFromVector(wv, l, index) {
				    var i = 0, j, obj, chInd,
				        w = [[]],
				        wtObjA = wa;

				    if (l) { // if length is defined we need to generate that many wheels (even if they are empty)
					    for (j = 0; j < l; j++) {
						    if (isLiquid) {
							    w[0][j] = {};
						    } else {
							    w[j] = [{}];
						    }
					    }
				    }
				    while (i < wv.length) { // we generate the wheels until the length of the wheel vector
					    if (isLiquid) {
						    w[0][i] = getWheelFromObjA(wtObjA, labels[i]);
					    } else {
						    w[i] = [getWheelFromObjA(wtObjA, labels[i])];
					    }

					    j = 0;
					    chInd = undefined;

					    while (j < wtObjA.length && chInd === undefined) {
						    if (wtObjA[j].key == wv[i] && ((index !== undefined && i <= index) || index === undefined)) {
							    chInd = j;
						    }
						    j++;
					    }

					    if (chInd !== undefined && wtObjA[chInd].children) {
						    i++;
						    wtObjA = wtObjA[chInd].children;
					    } else if ((obj = getFirstValidItemObjOrInd(wtObjA)) && obj.children) {
						    i++;
						    wtObjA = obj.children;
					    } else {
						    return w;
					    }
				    }
				    return w;
			    }

			    /**
			     * Returns the first valid Wheel Node Object or its index from a Wheel Node Object Array
			     * getInd - if it is true then the return value is going to be the index, otherwise the object itself
			     */
			    function getFirstValidItemObjOrInd(wtObjA, getInd) {
				    if (!wtObjA) {
					    return false;
				    }

				    var i = 0,
				        obj;

				    while (i < wtObjA.length) {
					    if (!(obj = wtObjA[i++]).invalid) {
						    return getInd ? i - 1 : obj;
					    }
				    }
				    return false;
			    }

			    function getWheelFromObjA(objA, lbl) {
				    var wheel = {
					        keys: [],
					        values: [],
					        label: lbl
				        },
				        j = 0;

				    while (j < objA.length) {
					    wheel.values.push(objA[j].value);
					    wheel.keys.push(objA[j].key);
					    j++;
				    }
				    return wheel;
			    }

			    /**
			     * Hides the last i number of wheels
			     * i - the last number of wheels that has to be hidden
			     */
			    function hideWheels(dw, i) {
				    $('.dwfl', dw).css('display', '').slice(i).hide();
			    }

			    /**
			     * Generates the first wheel vector from the wheeltree
			     * wt - the wheel tree object
			     * uses the lvl global variable to determine the length of the vector
			     */
			    function firstWheelVector(wa) {
				    var t = [],
				        ndObjA = wa,
				        obj,
				        ok = true,
				        i = 0;

				    while (ok) {
					    obj = getFirstValidItemObjOrInd(ndObjA);
					    t[i++] = obj.key;
					    ok = obj.children;
					    if (ok) {
						    ndObjA = ok;
					    }
				    }
				    return t;
			    }

			    /**
			     * Calculates the level of a wheel vector and the new wheel vector, depending on current wheel vector and the index of the changed wheel
			     * wv - current wheel vector
			     * index - index of the changed wheel
			     */
			    function calcLevelOfVector2(wv, index) {
				    var t = [],
				        ndObjA = wa,
				        lvl = 0,
				        next = false,
				        i,
				        childName,
				        chInd;

				    if (wv[lvl] !== undefined && lvl <= index) {
					    i = 0;

					    childName = wv[lvl];
					    chInd = undefined;

					    while (i < ndObjA.length && chInd === undefined) {
						    if (ndObjA[i].key == wv[lvl] && !ndObjA[i].invalid) {
							    chInd = i;
						    }
						    i++;
					    }
				    } else {
					    chInd = getFirstValidItemObjOrInd(ndObjA, true);
					    childName = ndObjA[chInd].key;
				    }

				    next = chInd !== undefined ? ndObjA[chInd].children : false;

				    t[lvl] = childName;

				    while (next) {
					    ndObjA = ndObjA[chInd].children;
					    lvl++;
					    next = false;
					    chInd = undefined;

					    if (wv[lvl] !== undefined && lvl <= index) {
						    i = 0;

						    childName = wv[lvl];
						    chInd = undefined;

						    while (i < ndObjA.length && chInd === undefined) {
							    if (ndObjA[i].key == wv[lvl] && !ndObjA[i].invalid) {
								    chInd = i;
							    }
							    i++;
						    }
					    } else {
						    chInd = getFirstValidItemObjOrInd(ndObjA, true);
						    chInd = chInd === false ? undefined : chInd;
						    childName = ndObjA[chInd].key;
					    }
					    next = chInd !== undefined && getFirstValidItemObjOrInd(ndObjA[chInd].children) ? ndObjA[chInd].children : false;
					    t[lvl] = childName;
				    }
				    return {
					    lvl: lvl + 1,
					    nVector: t
				    }; // return the calculated level and the wheel vector as an object
			    }

			    function createWheelArray(ul) {
				    var wheelArray = [];

				    lvl = lvl > ilvl++ ? lvl : ilvl;

				    ul.children('li').each(function (index) {
					    var that = $(this),
					        c = that.clone();

					    c.children('ul,ol').remove();

					    var v = c.html().replace(/^\s\s*/, '').replace(/\s\s*$/, ''),
					        inv = that.data('invalid') ? true : false,
					        wheelObj = {
						        key: that.attr('data-val') === undefined ? index : that.attr('data-val'),
						        value: v,
						        invalid: inv,
						        children: null
					        },
					        nest = that.children('ul,ol');

					    if (nest.length) {
						    wheelObj.children = createWheelArray(nest);
					    }

					    wheelArray.push(wheelObj);
				    });

				    ilvl--;
				    return wheelArray;
			    }

			    $('#' + id).remove(); // Remove input if exists

			    if (s.showInput) {
				    var typeStr = 'type="text"';
				    if (Capriza && Capriza.device && Capriza.device.ios8) typeStr = '';
//                input = $('<input type="text" id="' + id + '" value="" class="' + s.inputClass + '" placeholder="' + (s.placeholder || '') + '" readonly />').insertBefore(elm);
				    input = $('<input '+typeStr+' id="' + id + '" value="" class="' + s.inputClass + '" placeholder="' + (s.placeholder || '') + '" readonly />').insertBefore(elm);
				    s.anchor = input; // give the core the input element for the bubble positioning
				    inst.attachShow(input);
			    }

			    if (!s.wheelArray) {
				    elm.hide().closest('.ui-field-contain').trigger('create');
			    }

			    return {
				    width: 50,
				    wheels: w,
				    layout: layout,
				    headerText: false,
				    formatResult: function (d) {
					    return d.slice(0, currLevel).join(' ');
				    },
				    parseValue: function (value) {
					    return value ? value.split(" ") : (s.defaultValue || fwv);
				    },
				    onBeforeShow: function () {
					    var t = inst.temp;
					    currWheelVector = t.slice(0);
					    s.wheels = generateWheelsFromVector(t, lvl, lvl);
					    prevent = true;
				    },
				    onValueFill: function (v, change) {
					    if (input) {
						    input.val(v);
					    }
					    if (change) {
						    elm.change();
					    }

				    },
				    onShow: function (dw) {
					    $('.dwwl', dw).on('mousedown touchstart', function () {
						    clearTimeout(timer[$('.dwwl', dw).index(this)]);
					    });
				    },
				    onDestroy: function () {
					    if (input) {
						    input.remove();
					    }
					    elm.show();
				    },
				    validate: function (dw, index, time) {
					    var args = [],
					        t = inst.temp,
					        i = (index || 0) + 1,
					        j,
					        o;

					    if ((index !== undefined && currWheelVector[index] != t[index]) || (index === undefined && !prevent)) {
						    s.wheels = generateWheelsFromVector(t, null, index);
						    o = calcLevelOfVector2(t, index === undefined ? t.length : index);
						    currLevel = o.lvl;

						    for (j = 0; j < t.length; j++) {
							    inst.temp[j] = o.nVector[j] || 0;
						    }

						    while (i < o.lvl) {
							    args.push(i++);
						    }

						    if (args.length) {
							    s.readonly = createROVector(lvl, index);
							    clearTimeout(timer[index]);
							    timer[index] = setTimeout(function () {
								    prevent = true;
								    hideWheels(dw, o.lvl);
								    currWheelVector = inst.temp.slice(0);
								    inst.changeWheel(args, index === undefined ? time : 0, index !== undefined);
								    s.readonly = origReadOnly;
							    }, index === undefined ? 0 : time * 1000);
							    return false;
						    }
					    } else {
						    o = calcLevelOfVector2(t, t.length);
						    currLevel = o.lvl;
					    }

					    currWheelVector = t.slice(0);
					    setDisabled(dw, o.lvl, wa, t);
					    hideWheels(dw, o.lvl);

					    prevent = false;
				    }
			    };
		    };

		$.each(['list', 'image', 'treelist'], function (i, v) {
			ms.presets[v] = preset;
			ms.presetShort(v);
		});

	})(jQuery);

	(function ($) {
		var theme = {
			dateOrder: 'Mddyy',
			//mode: 'mixed',
			rows: 5,
			minWidth: 76,
			height: 36,
			showLabel: false,
			selectedLineHeight: true,
			selectedLineBorder: 2,
			useShortLabels: true,
			icon: { filled: 'star3', empty: 'star' },
			btnPlusClass: 'mbsc-ic mbsc-ic-arrow-down6',
			btnMinusClass: 'mbsc-ic mbsc-ic-arrow-up6',
			onThemeLoad: function (lang, s) {
				if (s.theme) {
					s.theme = s.theme.replace('android-ics', 'android-holo');
				}
			}
		};

		$.mobiscroll.themes['android-ics'] = theme;
		$.mobiscroll.themes['android-ics light'] = theme;
		$.mobiscroll.themes['android-holo'] = theme;
		$.mobiscroll.themes['android-holo light'] = theme;

	})(jQuery);


	(function ($) {

		$.mobiscroll.themes.android = {
			dateOrder: 'Mddyy',
			mode: 'clickpick',
			height: 50,
			showLabel: false,
			btnStartClass: 'mbsc-ic mbsc-ic-play3',
			btnStopClass: 'mbsc-ic mbsc-ic-pause2',
			btnResetClass: 'mbsc-ic mbsc-ic-stop2',
			btnLapClass: 'mbsc-ic mbsc-ic-loop2'
		};

	})(jQuery);


	(function ($) {

		$.mobiscroll.themes.ios = {
			display: 'bottom',
			dateOrder: 'MMdyy',
			rows: 5,
			height: 30,
			minWidth: 60,
			headerText: false,
			showLabel: false,
			btnWidth: false,
			selectedLineHeight: true,
			selectedLineBorder: 2,
			useShortLabels: true
		};

	})(jQuery);

	(function ($) {

		$.mobiscroll.themes.ios7 = {
			display: 'bottom',
			dateOrder: 'MMdyy',
			rows: 5,
			height: 34,
			minWidth: 55,
			headerText: false,
			showLabel: false,
			btnWidth: false,
			selectedLineHeight: true,
			selectedLineBorder: 1,
			useShortLabels: true,
			btnCalPrevClass: 'mbsc-ic mbsc-ic-arrow-left5',
			btnCalNextClass: 'mbsc-ic mbsc-ic-arrow-right5',
			btnPlusClass: 'mbsc-ic mbsc-ic-arrow-down5',
			btnMinusClass: 'mbsc-ic mbsc-ic-arrow-up5'
		};

	})(jQuery);

	(function ($) {

		$.mobiscroll.classes.Scroller = function (el, settings) {
			var $doc,
			    $header,
			    $markup,
			    $overlay,
			    $persp,
			    $popup,
			    $wnd,
			    hasButtons,
			    isLiquid,
			    isModal,
			    isScrollable,
			    isVisible,
			    itemHeight,
			    posEvents,
			    posDebounce,
			    preset,
			    preventChange,
			    preventPos,
			    scrollLock,
			    theme,
			    valueText,
			    wasReadOnly,
			    wndWidth,
			    wndHeight,

			    m,
			    mw, // Modal width
			    mh, // Modal height
			    anim,
			    lang,
			    click,
			    moved,
			    start,
			    startTime,
			    stop,
			    p,
			    min,
			    max,
			    target,
			    index,
			    lines,
			    timer,
			    buttons,
			    btn,
			    that = this,
			    $elm = $(el),
			    s,
			    iv = {},
			    pos = {},
			    pixels = {},
			    wheels = [],
			    elmList = [],
			    isInput = $elm.is('input');

			// Event handlers

			function onStart(ev) {
				// Scroll start
				if (testTouch(ev) && !move && !click && !btn && !isReadOnly(this)) {
					// Prevent touch highlight
					ev.preventDefault();

					move = true;
					isScrollable = s.mode != 'clickpick';
					target = $('.dw-ul', this);
					setGlobals(target);
					moved = iv[index] !== undefined; // Don't allow tap, if still moving
					p = moved ? getCurrentPosition(target) : pos[index];
					start = getCoord(ev, 'Y');
					startTime = new Date();
					stop = start;
					scroll(target, index, p, 0.001);

					if (isScrollable) {
						target.closest('.dwwl').addClass('dwa');
					}

					if (ev.type === 'mousedown') {
						$(document).on('mousemove', onMove).on('mouseup', onEnd);
					}
				}
			}

			function onMove(ev) {
				if (move) {
					if (isScrollable) {
						// Prevent scroll
						ev.preventDefault();
						ev.stopPropagation();
						stop = getCoord(ev, 'Y');
						if (Math.abs(stop - start) > 3) {
							scroll(target, index, constrain(p + (start - stop) / itemHeight, min - 1, max + 1));
							moved = true;
						}
					}
				}
			}

			function onEnd(ev) {
				if (move) {
					var time = new Date() - startTime,
					    val = constrain(p + (start - stop) / itemHeight, min - 1, max + 1),
					    speed,
					    dist,
					    tindex,
					    ttop = target.offset().top;

					if (has3d && time < 300) {
						speed = (stop - start) / time;
						dist = (speed * speed) / s.speedUnit;
						if (stop - start < 0) {
							dist = -dist;
						}
					} else {
						dist = stop - start;
					}

					tindex = Math.round(p - dist / itemHeight);

					if (!moved) { // this is a "tap"
						var idx = Math.floor((stop - ttop) / itemHeight),
						    li = $($('.dw-li', target)[idx]),
						    hl = isScrollable;
						if (event('onValueTap', [li]) !== false) {
							tindex = idx;
						} else {
							hl = true;
						}

						if (hl) {
							li.addClass('dw-hl'); // Highlight
							setTimeout(function () {
								li.removeClass('dw-hl');
							}, 200);
						}
					}

					if (isScrollable) {
						calc(target, tindex, 0, true, Math.round(val));
					}

					if (ev.type === 'mouseup') {
						$(document).off('mousemove', onMove).off('mouseup', onEnd);
					}

					move = false;
				}
			}

			function onBtnStart(ev) {
				// Can't call preventDefault here, it kills page scroll
				if (btn) {
					btn.removeClass('dwb-a');
				}
				btn = $(this);
				// Active button
				if (!btn.hasClass('dwb-d') && !btn.hasClass('dwb-nhl')) {
					btn.addClass('dwb-a');
				}
				// +/- buttons
				if (btn.hasClass('dwwb')) {
					if (testTouch(ev)) {
						step(ev, btn.closest('.dwwl'), btn.hasClass('dwwbp') ? plus : minus);
					}
				}
				if (ev.type === 'mousedown') {
					$(document).on('mouseup', onBtnEnd);
				}
			}

			function onBtnEnd(ev) {
				if (click) {
					clearInterval(timer);
					click = false;
				}
				if (btn) {
					btn.removeClass('dwb-a');
					btn = null;
				}
				if (ev.type === 'mouseup') {
					$(document).off('mousedown', onBtnEnd);
				}
			}

			function onKeyDown(ev) {
				if (ev.keyCode == 38) { // up
					step(ev, $(this), minus);
				} else if (ev.keyCode == 40) { // down
					step(ev, $(this), plus);
				}
			}

			function onKeyUp() {
				if (click) {
					clearInterval(timer);
					click = false;
				}
			}

			function onScroll(ev) {
				if (!isReadOnly(this)) {
					ev.preventDefault();
					ev = ev.originalEvent || ev;
					var delta = ev.wheelDelta ? (ev.wheelDelta / 120) : (ev.detail ? (-ev.detail / 3) : 0),
					    t = $('.dw-ul', this);

					setGlobals(t);
					calc(t, Math.round(pos[index] - delta), delta < 0 ? 1 : 2);
				}
			}

			function onPosition(ev) {
				clearTimeout(posDebounce);
				posDebounce = setTimeout(function () {
					var isScroll = ev.type == 'scroll';
					if (isScroll && !scrollLock) {
						return;
					}
					that.position(!isScroll);
				}, 200);
			}

			function onHide(prevAnim) {
				var activeEl,
				    value,
				    type;

				$markup.remove();
				if ($activeElm && !prevAnim) {
					setTimeout(function () {
						preventShow = true;
						activeEl = $activeElm[0];
						type = activeEl.type;
						value = activeEl.value;
						$activeElm.focus();
						if (!(Capriza && Capriza.device && Capriza.device.ios8)) {
							activeEl.type = 'button';
							activeEl.type = type;
						}
						activeEl.value = value;
					}, 200);
				}
				isVisible = false;
			}

			// Private functions

			function step(ev, w, func) {
				ev.stopPropagation();
				ev.preventDefault();
				if (!click && !isReadOnly(w) && !w.hasClass('dwa')) {
					click = true;
					// + Button
					var t = w.find('.dw-ul');

					setGlobals(t);
					clearInterval(timer);
					timer = setInterval(function () { func(t); }, s.delay);
					func(t);
				}
			}

			function isReadOnly(wh) {
				if ($.isArray(s.readonly)) {
					var i = $('.dwwl', $markup).index(wh);
					return s.readonly[i];
				}
				return s.readonly;
			}

			function generateWheelItems(i) {
				var html = '<div class="dw-bf">',
				    ww = wheels[i],
				    // @deprecated since 2.6.0, backward compatibility code
				    // ---
				    w = ww.values ? ww : convert(ww),
				    // ---
				    l = 1,
				    labels = w.labels || [],
				    values = w.values,
				    keys = w.keys || values;

				$.each(values, function (j, v) {
					if (l % 20 === 0) {
						html += '</div><div class="dw-bf">';
					}
					html += '<div role="option" aria-selected="false" class="dw-li dw-v" data-val="' + keys[j] + '"' + (labels[j] ? ' aria-label="' + labels[j] + '"' : '') + ' style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;">' +
						'<div class="dw-i"' + (lines > 1 ? ' style="line-height:' + Math.round(itemHeight / lines) + 'px;font-size:' + Math.round(itemHeight / lines * 0.8) + 'px;"' : '') + '>' + v + '</div></div>';
					l++;
				});

				html += '</div>';
				return html;
			}

			function setGlobals(t) {
				min = $('.dw-li', t).index($('.dw-v', t).eq(0));
				max = $('.dw-li', t).index($('.dw-v', t).eq(-1));
				index = $('.dw-ul', $markup).index(t);
			}

			function formatHeader(v) {
				var t = s.headerText;
				return t ? (typeof t === 'function' ? t.call(el, v) : t.replace(/\{value\}/i, v)) : '';
			}

			function readValue() {
				that.temp = that.values ? that.values.slice(0) : s.parseValue($elm.val() || '', that);
				setValue();
			}

			function getCurrentPosition(t) {
				var style = window.getComputedStyle ? getComputedStyle(t[0]) : t[0].style,
				    matrix,
				    px;

				if (has3d) {
					$.each(['t', 'webkitT', 'MozT', 'OT', 'msT'], function (i, v) {
						if (style[v + 'ransform'] !== undefined) {
							matrix = style[v + 'ransform'];
							return false;
						}
					});
					matrix = matrix.split(')')[0].split(', ');
					px = matrix[13] || matrix[5];
				} else {
					px = style.top.replace('px', '');
				}

				return Math.round(m - (px / itemHeight));
			}

			function ready(t, i) {
				clearTimeout(iv[i]);
				delete iv[i];
				t.closest('.dwwl').removeClass('dwa');
			}

			function scroll(t, index, val, time, active) {
				var px = (m - val) * itemHeight,
				    style = t[0].style;

				if (px == pixels[index] && iv[index]) {
					return;
				}

				if (time && px != pixels[index]) {
					// Trigger animation start event
					event('onAnimStart', [$markup, index, time]);
				}

				pixels[index] = px;

				style[pr + 'Transition'] = 'all ' + (time ? time.toFixed(3) : 0) + 's ease-out';

				if (has3d) {
					style[pr + 'Transform'] = 'translate3d(0,' + px + 'px,0)';
				} else {
					style.top = px + 'px';
				}

				if (iv[index]) {
					ready(t, index);
				}

				if (time && active) {
					t.closest('.dwwl').addClass('dwa');
					iv[index] = setTimeout(function () {
						ready(t, index);
					}, time * 1000);
				}

				pos[index] = val;
			}

			function getValid(val, t, dir) {
				var cell = $('.dw-li[data-val="' + val + '"]', t),
				    cells = $('.dw-li', t),
				    v = cells.index(cell),
				    l = cells.length;

				// Scroll to a valid cell
				if (!cell.hasClass('dw-v')) {
					var cell1 = cell,
					    cell2 = cell,
					    dist1 = 0,
					    dist2 = 0;

					while (v - dist1 >= 0 && !cell1.hasClass('dw-v')) {
						dist1++;
						cell1 = cells.eq(v - dist1);
					}

					while (v + dist2 < l && !cell2.hasClass('dw-v')) {
						dist2++;
						cell2 = cells.eq(v + dist2);
					}

					// If we have direction (+/- or mouse wheel), the distance does not count
					if (((dist2 < dist1 && dist2 && dir !== 2) || !dist1 || (v - dist1 < 0) || dir == 1) && cell2.hasClass('dw-v')) {
						cell = cell2;
						v = v + dist2;
					} else {
						cell = cell1;
						v = v - dist1;
					}
				}

				return {
					cell: cell,
					v: v,
					val: cell.hasClass('dw-v') ? cell.attr('data-val') : null
				};
			}

			function scrollToPos(time, index, manual, dir, active) {
				// Call validation event
				if (event('validate', [$markup, index, time, dir]) !== false) {
					// Set scrollers to position
					$('.dw-ul', $markup).each(function (i) {
						var t = $(this),
						    sc = i == index || index === undefined,
						    res = getValid(that.temp[i], t, dir),
						    cell = res.cell;

						if (!(cell.hasClass('dw-sel')) || sc) {
							// Set valid value
							that.temp[i] = res.val;

							if (!s.multiple) {
								$('.dw-sel', t).removeAttr('aria-selected');
								cell.attr('aria-selected', 'true');
							}

							// Add selected class to cell
							$('.dw-sel', t).removeClass('dw-sel');
							cell.addClass('dw-sel');

							// Scroll to position
							scroll(t, i, res.v, sc ? time : 0.1, sc ? active : false);
						}
					});

					// Reformat value if validation changed something
					valueText = s.formatResult(that.temp);
					if (that.live) {
						setValue(manual, manual, 0, true);
					}

					$header.html(formatHeader(valueText));

					if (manual) {
						event('onChange', [valueText]);
					}
				}

			}

			function event(name, args) {
				var ret;
				args.push(that);
				$.each([userdef, theme, preset, settings], function (i, v) {
					if (v && v[name]) { // Call preset event
						ret = v[name].apply(el, args);
					}
				});
				return ret;
			}

			function calc(t, val, dir, anim, orig) {
				val = constrain(val, min, max);

				var cell = $('.dw-li', t).eq(val),
				    o = orig === undefined ? val : orig,
				    active = orig !== undefined,
				    idx = index,
				    time = anim ? (val == o ? 0.1 : Math.abs((val - o) * s.timeUnit)) : 0;

				// Set selected scroller value
				that.temp[idx] = cell.attr('data-val');

				scroll(t, idx, val, time, active);

				setTimeout(function () {
					// Validate
					scrollToPos(time, idx, true, dir, active);
				}, 10);
			}

			function plus(t) {
				var val = pos[index] + 1;
				calc(t, val > max ? min : val, 1, true);
			}

			function minus(t) {
				var val = pos[index] - 1;
				calc(t, val < min ? max : val, 2, true);
			}

			function setValue(fill, change, time, noscroll, temp) {
				if (isVisible && !noscroll) {
					scrollToPos(time);
				}

				valueText = s.formatResult(that.temp);

				if (!temp) {
					that.values = that.temp.slice(0);
					that.val = valueText;
				}

				if (fill) {

					event('onValueFill', [valueText, change]);

					if (isInput) {
						$elm.val(valueText);
						if (change) {
							preventChange = true;
							$elm.change();
						}
					}
				}
			}


			// Public functions

			/**
			 * Positions the scroller on the screen.
			 */
			that.position = function (check) {

				var nw = $persp.width(), // To get the width without scrollbar
				    nh = $wnd[0].innerHeight || $wnd.innerHeight();

				if (!(wndWidth === nw && wndHeight === nh && check) && !preventPos && (event('onPosition', [$markup, nw, nh]) !== false) && isModal) {
					var w,
					    l,
					    t,
					    aw, // anchor width
					    ah, // anchor height
					    ap, // anchor position
					    at, // anchor top
					    al, // anchor left
					    arr, // arrow
					    arrw, // arrow width
					    arrl, // arrow left
					    dh,
					    scroll,
					    totalw = 0,
					    minw = 0,
					    sl = $wnd.scrollLeft(),
					    st = $wnd.scrollTop(),
					    wr = $('.dwwr', $markup),
					    d = $('.dw', $markup),
					    css = {},
					    anchor = s.anchor === undefined ? $elm : s.anchor;

					// Set / unset liquid layout based on screen width, but only if not set explicitly by the user
					if (isLiquid && s.layout !== 'liquid') {
						if (nw < 400) {
							$markup.addClass('dw-liq');
						} else {
							$markup.removeClass('dw-liq');
						}
					}

					if (/modal|bubble/.test(s.display)) {
						wr.width('');
						$('.dwc', $markup).each(function () {
							w = $(this).outerWidth(true);
							totalw += w;
							minw = (w > minw) ? w : minw;
						});
						w = totalw > nw ? minw : totalw;
						wr.width(w).css('white-space', totalw > nw ? '' : 'nowrap');
					}

					mw = d.outerWidth();
					mh = d.outerHeight(true);
					scrollLock = mh <= nh && mw <= nw;

					that.scrollLock = scrollLock;

					if (s.display == 'modal') {
						l = Math.max(0, (nw - mw) / 2);
						t = st + (nh - mh) / 2;
					} else if (s.display == 'bubble') {
						scroll = true;
						arr = $('.dw-arrw-i', $markup);
						ap = anchor.offset();
						at = Math.abs($(s.context).offset().top - ap.top);
						al = Math.abs($(s.context).offset().left - ap.left);

						// horizontal positioning
						aw = anchor.outerWidth();
						ah = anchor.outerHeight();
						l = constrain(al - (d.outerWidth(true) - aw) / 2 - sl, 3, nw - mw - 3);

						// vertical positioning
						t = at - mh; // above the input
						if ((t < st) || (at > st + nh)) { // if doesn't fit above or the input is out of the screen
							d.removeClass('dw-bubble-top').addClass('dw-bubble-bottom');
							t = at + ah; // below the input
						} else {
							d.removeClass('dw-bubble-bottom').addClass('dw-bubble-top');
						}

						// Calculate Arrow position
						arrw = arr.outerWidth();
						arrl = constrain(al + aw / 2 - (l + (mw - arrw) / 2) - sl, 0, arrw);

						// Limit Arrow position
						$('.dw-arr', $markup).css({ left: arrl });
					} else {
						if (s.display == 'top') {
							t = st;
						} else if (s.display == 'bottom') {
							t = st + nh - mh;
						}
					}

					css.top = t < 0 ? 0 : t;
					css.left = l;
					d.css(css);

					// If top + modal height > doc height, increase doc height
					$persp.height(0);
					dh = Math.max(t + mh, s.context == 'body' ? $(document).height() : $doc.scrollHeight);
					$persp.css({ height: dh, left: sl });

					// Scroll needed
					if (scroll && ((t + mh > st + nh) || (at > st + nh))) {
						preventPos = true;
						setTimeout(function () { preventPos = false; }, 300);
						$wnd.scrollTop(Math.min(t + mh - nh, dh - nh));
					}
				}

				wndWidth = nw;
				wndHeight = nh;
			};

			/**
			 * Enables the scroller and the associated input.
			 */
			that.enable = function () {
				s.disabled = false;
				if (isInput) {
					$elm.prop('disabled', false);
				}
			};

			/**
			 * Disables the scroller and the associated input.
			 */
			that.disable = function () {
				s.disabled = true;
				if (isInput) {
					$elm.prop('disabled', true);
				}
			};

			/**
			 * Gets the selected wheel values, formats it, and set the value of the scroller instance.
			 * If input parameter is true, populates the associated input element.
			 * @param {Array} values Wheel values.
			 * @param {Boolean} [fill=false] Also set the value of the associated input element.
			 * @param {Number} [time=0] Animation time
			 * @param {Boolean} [temp=false] If true, then only set the temporary value.(only scroll there but not set the value)
			 */
			that.setValue = function (values, fill, time, temp, change) {
				that.temp = $.isArray(values) ? values.slice(0) : s.parseValue.call(el, values + '', that);
				setValue(fill, change === undefined ? fill : change, time, false, temp);
			};

			/**
			 * Return the selected wheel values.
			 */
			that.getValue = function () {
				return that.values;
			};

			/**
			 * Return selected values, if in multiselect mode.
			 */
			that.getValues = function () {
				var ret = [],
				    i;

				for (i in that._selectedValues) {
					ret.push(that._selectedValues[i]);
				}
				return ret;
			};

			/**
			 * Changes the values of a wheel, and scrolls to the correct position
			 * @param {Array} idx Indexes of the wheels to change.
			 * @param {Number} [time=0] Animation time when scrolling to the selected value on the new wheel.
			 * @param {Boolean} [manual=false] Indicates that the change was triggered by the user or from code.
			 */
			that.changeWheel = function (idx, time, manual) {
				if ($markup) {
					var i = 0,
					    nr = idx.length;

					$.each(s.wheels, function (j, wg) {
						$.each(wg, function (k, w) {
							if ($.inArray(i, idx) > -1) {
								wheels[i] = w;
								$('.dw-ul', $markup).eq(i).html(generateWheelItems(i));
								nr--;
								if (!nr) {
									that.position();
									scrollToPos(time, undefined, manual);
									return false;
								}
							}
							i++;
						});
						if (!nr) {
							return false;
						}
					});
				}
			};

			/**
			 * Return true if the scroller is currently visible.
			 */
			that.isVisible = function () {
				return isVisible;
			};

			/**
			 * Attach tap event to the given element.
			 */
			that.tap = function (el, handler, prevent) {
				var startX,
				    startY;

				if (s.tap) {
					el.on('touchstart.dw', function (ev) {
						// Can't always call preventDefault here, it kills page scroll
						if (prevent) {
							ev.preventDefault();
						}
						startX = getCoord(ev, 'X');
						startY = getCoord(ev, 'Y');
					}).on('touchend.dw', function (ev) {
						var that = this;
						// If movement is less than 20px, fire the click event handler
						if (Math.abs(getCoord(ev, 'X') - startX) < 20 && Math.abs(getCoord(ev, 'Y') - startY) < 20) {
							// preventDefault and setTimeout are needed by iOS
							ev.preventDefault();
							setTimeout(function () {
								handler.call(that, ev);
							}, isOldAndroid ? 400 : 10);
						}
						setTap();
					});
				}

				el.on('click.dw', function (ev) {
					if (!tap) {
						// If handler was not called on touchend, call it on click;
						handler.call(this, ev);
					}
					ev.preventDefault();
				});

			};

			/**
			 * Shows the scroller instance.
			 * @param {Boolean} prevAnim - Prevent animation if true
			 * @param {Boolean} prevFocus - Prevent focusing if true
			 */
			that.show = function (prevAnim, prevFocus) {
				// Create wheels
				var lbl,
				    html,
				    l = 0,
				    mAnim = '';

				if (s.disabled || isVisible) {
					return;
				}

				if (anim !== false) {
					if (s.display == 'top') {
						anim = 'slidedown';
					}
					if (s.display == 'bottom') {
						anim = 'slideup';
					}
				}

				// Parse value from input
				readValue();

				event('onBeforeShow', []);

				if (isModal && anim && !prevAnim) {
					mAnim = 'dw-' + anim + ' dw-in';
				}

				// Create wheels containers
				html = '<div class="' + s.theme + ' dw-' + s.display +
					(isLiquid ? ' dw-liq' : '') +
					(lines > 1 ? ' dw-ml' : '') +
					(hasButtons ? '' : ' dw-nobtn') + '">' +
					'<div class="dw-persp">' +
					(isModal ? '<div class="dwo"></div>' : '') + // Overlay
					'<div' + (isModal ? ' role="dialog" tabindex="-1"' : '') + ' class="dw dwbg ' + mAnim + (s.rtl ? ' dw-rtl' : ' dw-ltr') + '">' + // Popup
					(s.display === 'bubble' ? '<div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div>' : '') + // Bubble arrow
					'<div class="dwwr">' + // Popup content
					'<div aria-live="assertive" class="dwv' + (s.headerText ? '' : ' dw-hidden') + '"></div>' + // Header
					'<div class="dwcc">'; // Wheel group container

				$.each(s.wheels, function (i, wg) { // Wheel groups
					html += '<div class="dwc' + (s.mode != 'scroller' ? ' dwpm' : ' dwsc') + (s.showLabel ? '' : ' dwhl') + '">' +
						'<div class="dwwc"' + (s.maxWidth ? '' : ' style="max-width:600px;"') + '>' +
						(hasFlex ? '' : '<table class="dw-tbl" cellpadding="0" cellspacing="0"><tr>');

					$.each(wg, function (j, w) { // Wheels
						wheels[l] = w;
						lbl = w.label !== undefined ? w.label : j;
						html += '<' + (hasFlex ? 'div' : 'td') + ' class="dwfl"' + ' style="' +
							(s.fixedWidth ? ('width:' + (s.fixedWidth[l] || s.fixedWidth) + 'px;') :
								(s.minWidth ? ('min-width:' + (s.minWidth[l] || s.minWidth) + 'px;') : 'min-width:' + s.width + 'px;') +
								(s.maxWidth ? ('max-width:' + (s.maxWidth[l] || s.maxWidth) + 'px;') : '')) + '">' +
							'<div class="dwwl dwwl' + l + '">' +
							(s.mode != 'scroller' ?
								'<a href="#" tabindex="-1" class="dwb-e dwwb dwwbp ' + (s.btnPlusClass || '') + '" style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;"><span>+</span></a>' + // + button
								'<a href="#" tabindex="-1" class="dwb-e dwwb dwwbm ' + (s.btnMinusClass  || '') + '" style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;"><span>&ndash;</span></a>' : '') + // - button
							'<div class="dwl">' + lbl + '</div>' + // Wheel label
							'<div tabindex="0" aria-live="off" aria-label="' + lbl + '" role="listbox" class="dwww">' +
							'<div class="dww" style="height:' + (s.rows * itemHeight) + 'px;">' +
							'<div class="dw-ul">';

						// Create wheel values
						html += generateWheelItems(l) +
							'</div></div><div class="dwwo"></div></div><div class="dwwol"' +
							(s.selectedLineHeight ? ' style="height:' + itemHeight + 'px;margin-top:-' + (itemHeight / 2 + (s.selectedLineBorder || 0)) + 'px;"' : '') + '></div></div>' +
							(hasFlex ? '</div>' : '</td>');

						l++;
					});

					html += (hasFlex ? '' : '</tr></table>') + '</div></div>';
				});

				html += '</div>';

				if (isModal && hasButtons) {
					html += '<div class="dwbc">';
					$.each(buttons, function (i, b) {
						b = (typeof b === 'string') ? that.buttons[b] : b;
						html += '<span' + (s.btnWidth ? ' style="width:' + (100 / buttons.length) + '%"' : '') + ' class="dwbw ' + b.css + '"><a href="#" class="dwb dwb' + i + ' dwb-e" role="button">' + b.text + '</a></span>';
					});
					html += '</div>';
				}
				html += '</div></div></div></div>';

				$markup = $(html);
				$persp = $('.dw-persp', $markup);
				$overlay = $('.dwo', $markup);
				$header = $('.dwv', $markup);
				$popup = $('.dw', $markup);

				pixels = {};

				isVisible = true;

				posEvents = 'orientationchange resize';

				scrollToPos();

				event('onMarkupReady', [$markup]);

				// Show
				if (isModal) {
					ms.activeInstance = that;
					$markup.appendTo(s.context);
					if (has3d && anim && !prevAnim) {
						$markup.addClass('dw-trans').on(animEnd, function () {
							$markup.removeClass('dw-trans').find('.dw').removeClass(mAnim);
							if (!prevFocus) {
								$popup.focus();
							}
						});
					}
				} else if ($elm.is('div')) {
					$elm.html($markup);
				} else {
					$markup.insertAfter($elm);
				}

				event('onMarkupInserted', [$markup]);

				if (isModal) {
					// Enter / ESC
					$(window).on('keydown.dw', function (ev) {
						if (ev.keyCode == 13) {
							that.select();
						} else if (ev.keyCode == 27) {
							that.cancel();
						}
					});

					// Prevent scroll if not specified otherwise
					if (s.scrollLock) {
						$markup.on('touchmove', function (ev) {
							if (scrollLock) {
								ev.preventDefault();
							}
						});
					}

					// Disable inputs to prevent bleed through (Android bug)
					//if (isOldAndroid) {
					if (pr !== 'Moz') {
						$('input,select,button', $doc).each(function () {
							if (!this.disabled) {
								$(this).addClass('dwtd').prop('disabled', true);
							}
						});
					}

					posEvents += ' scroll';
				}

				// Set position
				that.position();
				$wnd.on(posEvents, onPosition);

				// Events
				$markup.on('DOMMouseScroll mousewheel', '.dwwl', onScroll)
					.on('keydown', '.dwwl', onKeyDown)
					.on('keyup', '.dwwl', onKeyUp)
					.on('selectstart mousedown', prevdef) // Prevents blue highlight on Android and text selection in IE
					.on('click', '.dwb-e', prevdef)
					.on('keydown', '.dwb-e', function (ev) {
						if (ev.keyCode == 32) { // Space
							ev.preventDefault();
							ev.stopPropagation();
							$(this).click();
						}
					});

				setTimeout(function () {
					// Init buttons
					$.each(buttons, function (i, b) {
						that.tap($('.dwb' + i, $markup), function (ev) {
							b = (typeof b === 'string') ? that.buttons[b] : b;
							b.handler.call(this, ev, that);
						}, true);
					});

					if (s.closeOnOverlay) {
						that.tap($overlay, function () {
							that.cancel();
						});
					}

					if (isModal && !anim && !prevFocus) {
						$popup.focus();
					}

					$markup
						.on('touchstart mousedown', '.dwwl', onStart)
						.on('touchmove', '.dwwl', onMove)
						.on('touchend', '.dwwl', onEnd)
						.on('touchstart mousedown', '.dwb-e', onBtnStart)
						.on('touchend', '.dwb-e', onBtnEnd);

				}, 300);

				event('onShow', [$markup, valueText]);
			};

			/**
			 * Hides the scroller instance.
			 */
			that.hide = function (prevAnim, btn, force) {

				// If onClose handler returns false, prevent hide
				if (!isVisible || (!force && event('onClose', [valueText, btn]) === false)) {
					return false;
				}

				// Re-enable temporary disabled fields
				//if (isOldAndroid) {
				if (pr !== 'Moz') {
					$('.dwtd', $doc).each(function () {
						$(this).prop('disabled', false).removeClass('dwtd');
					});
				}

				// Hide wheels and overlay
				if ($markup) {
					if (has3d && isModal && anim && !prevAnim && !$markup.hasClass('dw-trans')) { // If dw-trans class was not removed, means that there was no animation
						$markup.addClass('dw-trans').find('.dw').addClass('dw-' + anim + ' dw-out').on(animEnd, function () {
							onHide(prevAnim);
						});
					} else {
						onHide(prevAnim);
					}

					// Stop positioning on window resize
					$wnd.off(posEvents, onPosition);
				}

				delete ms.activeInstance;
			};

			/**
			 * Set button handler.
			 */
			that.select = function () {
				if (that.hide(false, 'set') !== false) {
					setValue(true, true, 0, true);
					event('onSelect', [that.val]);
				}
			};

			/**
			 * Cancel and hide the scroller instance.
			 */
			that.cancel = function () {
				if (that.hide(false, 'cancel') !== false) {
					event('onCancel', [that.val]);
				}
			};

			/**
			 * Show mobiscroll on focus and click event of the parameter.
			 * @param {jQuery} $elm - Events will be attached to this element.
			 * @param {Function} [beforeShow=undefined] - Optional function to execute before showing mobiscroll.
			 */
			that.attachShow = function ($elm, beforeShow) {
				elmList.push($elm);
				if (s.display !== 'inline') {
					$elm
						.on('mousedown.dw', prevdef) // Prevent input to get focus on tap (virtual keyboard pops up on some devices)
						.on((s.showOnFocus ? 'focus.dw' : '') + (s.showOnTap ? ' click.dw' : ''), function (ev) {
							if ((ev.type !== 'focus' || (ev.type === 'focus' && !preventShow)) && !tap) {
								if (beforeShow) {
									beforeShow();
								}
								// Hide virtual keyboard
								if ($(document.activeElement).is('input,textarea')) {
									$(document.activeElement).blur();
								}
								$activeElm = $elm;
								that.show();
							}
							setTimeout(function () {
								preventShow = false;
							}, 300); // With jQuery < 1.9 focus is fired twice in IE
						});
				}
			};

			/**
			 * Scroller initialization.
			 */
			that.init = function (ss) {
				var pres;

				// Update original user settings
				extend(settings, ss);

				s = extend({}, defaults, userdef, settings);

				// Get theme defaults
				theme = ms.themes[s.theme];

				// Get language defaults
				lang = ms.i18n[s.lang];

				event('onThemeLoad', [lang, settings]);

				extend(s, theme, lang, userdef, settings);

				// Add default buttons
				s.buttons = s.buttons || ['set', 'cancel'];

				// Hide header text in inline mode by default
				s.headerText = s.headerText === undefined ? (s.display !== 'inline' ? '{value}' : false) : s.headerText;

				that.settings = s;

				// Unbind all events (if re-init)
				$elm.off('.dw');

				pres = ms.presets[s.preset];

				if (pres) {
					preset = pres.call(el, that);
					extend(s, preset, settings); // Load preset settings
				}

				// Set private members
				m = Math.floor(s.rows / 2);
				itemHeight = s.height;
				anim = isOldAndroid ? false : s.animate;
				lines = s.multiline;
				isLiquid = (s.layout || (/top|bottom/.test(s.display) && s.wheels.length == 1 ? 'liquid' : '')) === 'liquid';
				isModal = s.display !== 'inline';
				buttons = s.buttons;
				$wnd = $(s.context == 'body' ? window : s.context);
				$doc = $(s.context)[0];

				// @deprecated since 2.8.0, backward compatibility code
				// ---
				if (!s.setText) {
					buttons.splice($.inArray('set', buttons), 1);
				}
				if (!s.cancelText) {
					buttons.splice($.inArray('cancel', buttons), 1);
				}
				if (s.button3) {
					buttons.splice($.inArray('set', buttons) + 1, 0, { text: s.button3Text, handler: s.button3 });
				}
				// ---

				that.context = $wnd;
				that.live = !isModal || ($.inArray('set', buttons) == -1);
				that.buttons.set = { text: s.setText, css: 'dwb-s', handler: that.select };
				that.buttons.cancel = { text: (that.live) ? s.closeText : s.cancelText, css: 'dwb-c', handler: that.cancel };
				that.buttons.clear = {
					text: s.clearText,
					css: 'dwb-cl',
					handler: function () {
						that.trigger('onClear', [$markup]);
						$elm.val('');
						if (!that.live) {
							that.hide(false, 'clear');
						}
					}
				};

				hasButtons = buttons.length > 0;

				if (isVisible) {
					that.hide(true, false, true);
				}

				if (isModal) {
					readValue();
					if (isInput) {
						// Set element readonly, save original state
						if (wasReadOnly === undefined) {
							wasReadOnly = el.readOnly;
						}
						el.readOnly = true;
					}
					that.attachShow($elm);
				} else {
					that.show();
				}

				if (isInput) {
					$elm.on('change.dw', function () {
						if (!preventChange) {
							that.setValue($elm.val(), false, 0.2);
						}
						preventChange = false;
					});
				}
			};

			/**
			 * Sets one ore more options.
			 */
			that.option = function (opt, value) {
				var obj = {};
				if (typeof opt === 'object') {
					obj = opt;
				} else {
					obj[opt] = value;
				}
				that.init(obj);
			};

			/**
			 * Destroys the mobiscroll instance.
			 */
			that.destroy = function () {
				// Force hide without animation
				that.hide(true, false, true);

				// Remove all events from elements
				$.each(elmList, function (i, v) {
					v.off('.dw');
				});

				// Reset original readonly state
				if (isInput) {
					el.readOnly = wasReadOnly;
				}

				// Delete scroller instance
				delete instances[el.id];

				event('onDestroy', []);
			};

			/**
			 * Returns the mobiscroll instance.
			 */
			that.getInst = function () {
				return that;
			};

			/**
			 * Returns the closest valid cell.
			 */
			that.getValidCell = getValid;

			/**
			 * Triggers a mobiscroll event.
			 */
			that.trigger = event;

			instances[el.id] = that;

			that.values = null;
			that.val = null;
			that.temp = null;
			that.buttons = {};
			that._selectedValues = {};

			that.init(settings);
		};

		function setTap() {
			tap = true;
			setTimeout(function () {
				tap = false;
			}, 500);
		}

		function constrain(val, min, max) {
			return Math.max(min, Math.min(val, max));
		}

		/**
		 * @deprecated since 2.6.0, backward compatibility code
		 */
		function convert(w) {
			var ret = {
				values: [],
				keys: []
			};
			$.each(w, function (k, v) {
				ret.keys.push(k);
				ret.values.push(v);
			});
			return ret;
		}

		var $activeElm,
		    move,
		    tap,
		    preventShow,
		    ms = $.mobiscroll,
		    instances = ms.instances,
		    util = ms.util,
		    pr = util.jsPrefix,
		    has3d = util.has3d,
		    hasFlex = util.hasFlex,
		    getCoord = util.getCoord,
		    testTouch = util.testTouch,
		    prevdef = function (ev) { ev.preventDefault(); },
		    extend = $.extend,
		    animEnd = 'webkitAnimationEnd animationend',
		    userdef = ms.userdef,
		    isOldAndroid = /android [1-3]/i.test(navigator.userAgent),
		    defaults = extend(ms.defaults, {
			    // Localization
			    setText: 'Set',
			    selectedText: 'Selected',
			    closeText: 'Close',
			    cancelText: 'Cancel',
			    clearText: 'Clear',
			    // Options
			    minWidth: 80,
			    height: 40,
			    rows: 3,
			    multiline: 1,
			    delay: 300,
			    disabled: false,
			    readonly: false,
			    closeOnOverlay: true,
			    showOnFocus: true,
			    showOnTap: true,
			    showLabel: true,
			    wheels: [],
			    theme: '',
			    display: 'modal',
			    mode: 'scroller',
			    preset: '',
			    //lang: 'en-US',
			    context: 'body',
			    scrollLock: true,
			    tap: true,
			    btnWidth: true,
			    speedUnit: 0.0012,
			    timeUnit: 0.1,
			    formatResult: function (d) {
				    return d.join(' ');
			    },
			    parseValue: function (value, inst) {
				    var val = value.split(' '),
				        ret = [],
				        i = 0,
				        keys;

				    $.each(inst.settings.wheels, function (j, wg) {
					    $.each(wg, function (k, w) {
						    // @deprecated since 2.6.0, backward compatibility code
						    // ---
						    w = w.values ? w : convert(w);
						    // ---
						    keys = w.keys || w.values;
						    if ($.inArray(val[i], keys) !== -1) {
							    ret.push(val[i]);
						    } else {
							    ret.push(keys[0]);
						    }
						    i++;
					    });
				    });
				    return ret;
			    }
		    });

		// Prevent re-show on window focus
		$(window).on('focus', function () {
			if ($activeElm) {
				preventShow = true;
			}
		});

		$(document).on('mouseover mouseup mousedown click', function (ev) { // Prevent standard behaviour on body click
			if (tap) {
				ev.stopPropagation();
				ev.preventDefault();
				return false;
			}
		});

	})(jQuery);

	(function ($) {

		$.mobiscroll.themes['sense-ui'] = {
			btnStartClass: 'mbsc-ic mbsc-ic-play3',
			btnStopClass: 'mbsc-ic mbsc-ic-pause2',
			btnResetClass: 'mbsc-ic mbsc-ic-stop2',
			btnLapClass: 'mbsc-ic mbsc-ic-loop2'
		};

	})(jQuery);
	(function ($) {

		$.mobiscroll.themes.wp = {
			minWidth: 76,
			height: 76,
			accent: 'none',
			dateOrder: 'mmMMddDDyy',
			headerText: false,
			showLabel: false,
			icon: { filled: 'star3', empty: 'star' },
			btnWidth: false,
			btnStartClass: 'mbsc-ic mbsc-ic-play3',
			btnStopClass: 'mbsc-ic mbsc-ic-pause2',
			btnResetClass: 'mbsc-ic mbsc-ic-stop2',
			btnLapClass: 'mbsc-ic mbsc-ic-loop2',
			btnHideClass: 'mbsc-ic mbsc-ic-close',
			btnCalPrevClass: 'mbsc-ic mbsc-ic-arrow-left2',
			btnCalNextClass: 'mbsc-ic mbsc-ic-arrow-right2',
			btnPlusClass: 'mbsc-ic mbsc-ic-plus',
			btnMinusClass: 'mbsc-ic mbsc-ic-minus',
			onMarkupInserted: function (elm, inst) {
				var click,
				    touch,
				    active;

				$('.dw', elm).addClass('wp-' + inst.settings.accent);

				$('.dwb-s .dwb', elm).addClass('mbsc-ic mbsc-ic-checkmark');
				$('.dwb-c .dwb', elm).addClass('mbsc-ic mbsc-ic-close');
				$('.dwb-cl .dwb', elm).addClass('mbsc-ic mbsc-ic-close');
				$('.dwb-n .dwb', elm).addClass('mbsc-ic mbsc-ic-loop2');

				$('.dwwl', elm).on('touchstart mousedown DOMMouseScroll mousewheel', function (e) {
					if (e.type === 'mousedown' && touch) {
						return;
					}
					touch = e.type === 'touchstart';
					click = true;
					active = $(this).hasClass('wpa');
					$('.dwwl', elm).removeClass('wpa');
					$(this).addClass('wpa');
				}).on('touchmove mousemove', function () {
					click = false;
				}).on('touchend mouseup', function (e) {
					if (click && active && $(e.target).closest('.dw-li').hasClass('dw-sel')) {
						$(this).removeClass('wpa');
					}
					if (e.type === 'mouseup') {
						touch = false;
					}
					click = false;
				});
			},
			onThemeLoad: function (lang, s) {
				if (lang && lang.dateOrder && !s.dateOrder) {
					var ord = lang.dateOrder;
					ord = ord.match(/mm/i) ? ord.replace(/mmMM|mm|MM/,  'mmMM') : ord.replace(/mM|m|M/,  'mM');
					ord = ord.match(/dd/i) ? ord.replace(/ddDD|dd|DD/,  'ddDD') : ord.replace(/dD|d|D/,  'dD');
					s.dateOrder = ord;
				}
			}
		};

		$.mobiscroll.themes['wp light'] = $.mobiscroll.themes.wp;

	})(jQuery);



	(function ($) {

		var defaults = {
			inputClass: '',
			invalid: [],
			rtl: false,
			showInput: true,
			group: false,
			groupLabel: 'Groups'
		};

		$.mobiscroll.presetShort('select');

		$.mobiscroll.presets.select = function (inst) {
			var change,
			    grIdx,
			    gr,
			    group,
			    input,
			    optIdx,
			    option,
			    prev,
			    prevent,
			    timer,
			    w,
			    orig = $.extend({}, inst.settings),
			    s = $.extend(inst.settings, defaults, orig),
			    layout = s.layout || (/top|bottom/.test(s.display) ? 'liquid' : ''),
			    isLiquid = layout == 'liquid',
			    elm = $(this),
			    multiple = elm.prop('multiple'),
			    id = this.id + '_dummy',
			    lbl = $('label[for="' + this.id + '"]').attr('for', id),
			    label = s.label !== undefined ? s.label : (lbl.length ? lbl.text() : elm.attr('name')),
			    selectedClass = 'dw-msel mbsc-ic mbsc-ic-checkmark',
			    invalid = [],
			    origValues = [],
			    main = {},
			    roPre = s.readonly;

			function genWheels() {
				var cont,
				    wheel,
				    wg = 0,
				    values = [],
				    keys = [],
				    w = [[]];

				if (s.group) {

					$('optgroup', elm).each(function (i) {
						values.push($(this).attr('label'));
						keys.push(i);
					});

					wheel = {
						values: values,
						keys: keys,
						label: s.groupLabel
					};

					if (isLiquid) {
						w[0][wg] = wheel;
					} else {
						w[wg] = [wheel];
					}

					cont = group;
					wg++;

				} else {
					cont = elm;
				}

				values = [];
				keys = [];

				$('option', cont).each(function () {
					var v = $(this).attr('value');
					values.push($(this).text());
					keys.push(v);
					if ($(this).prop('disabled')) {
						invalid.push(v);
					}
				});

				wheel = {
					values: values,
					keys: keys,
					label: label
				};

				if (isLiquid) {
					w[0][wg] = wheel;
				} else {
					w[wg] = [wheel];
				}

				return w;
			}

			function getOption() {
				option = multiple ? (elm.val() ? elm.val()[0] : $('option', elm).attr('value')) : elm.val();

				if (s.group) {
					group = elm.find('option[value="' + option + '"]').parent();
					gr = group.index();
					prev = gr;
				}
			}

			function setVal(v, fill, change) {
				var value = [];

				if (multiple) {
					var sel = [],
					    i = 0;

					for (i in inst._selectedValues) {
						sel.push(main[i]);
						value.push(i);
					}

					input.val(sel.join(', '));
				} else {
					input.val(v);
					value = fill ? inst.values[optIdx] : null;
				}

				if (fill) {
					elm.val(value);
					if (change) {
						prevent = true;
						elm.change();
					}
				}
			}

			function onTap(li) {
				if (multiple && li.hasClass('dw-v') && li.closest('.dw').find('.dw-ul').index(li.closest('.dw-ul')) == optIdx) {
					var val = li.attr('data-val'),
					    selected = li.hasClass('dw-msel');

					if (selected) {
						li.removeClass(selectedClass).removeAttr('aria-selected');
						delete inst._selectedValues[val];
					} else {
						li.addClass(selectedClass).attr('aria-selected', 'true');
						inst._selectedValues[val] = val;
					}

					if (inst.live) {
						setVal(val, true, true);
					}

					return false;
				}
			}

			// If groups is true and there are no groups fall back to no grouping
			if (s.group && !$('optgroup', elm).length) {
				s.group = false;
			}

			if (!s.invalid.length) {
				s.invalid = invalid;
			}

			if (s.group) {
				grIdx = 0;
				optIdx = 1;
			} else {
				grIdx = -1;
				optIdx = 0;
			}

			$('option', elm).each(function () {
				if (!$(this).attr('value')) {
					$(this).attr('value', $(this).text());
				}
				main[$(this).attr('value')] = $(this).text();
			});

			getOption();

			$('#' + id).remove();

			var typeStr = 'type="text"';
			if (Capriza && Capriza.device && Capriza.device.ios8) typeStr = '';

			input = $('<input '+typeStr+' id="' + id + '" class="' + s.inputClass + '" placeholder="' + (s.placeholder || '') + '" readonly />');

			if (s.showInput) {
				input.insertBefore(elm);
			}

			inst.attachShow(input);

			var v = elm.val() || [],
			    i = 0;

			for (i; i < v.length; i++) {
				inst._selectedValues[v[i]] = v[i];
			}

			setVal(main[option]);

			elm.off('.dwsel').on('change.dwsel', function () {
				if (!prevent) {
					inst.setValue(multiple ? elm.val() || [] : [elm.val()], true);
				}
				prevent = false;
			}).addClass('dw-hsel').attr('tabindex', -1).closest('.ui-field-contain').trigger('create');

			// Extended methods
			// ---

			if (!inst._setValue) {
				inst._setValue = inst.setValue;
			}

			inst.setValue = function (d, fill, time, temp, change) {
				var i,
				    value,
				    v = $.isArray(d) ? d[0] : d;

				option = v !== undefined ? v : $('option', elm).attr('value');

				if (multiple) {
					inst._selectedValues = {};
					for (i = 0; i < d.length; i++) {
						inst._selectedValues[d[i]] = d[i];
					}
				}

				if (s.group) {
					group = elm.find('option[value="' + option + '"]').parent();
					gr = group.index();
					value = [gr, option];
				} else {
					value = [option];
				}

				inst._setValue(value, fill, time, temp, change);

				// Set input/select values
				if (fill) {
					var changed = multiple ? true : option !== elm.val();
					setVal(main[option], changed, change === undefined ? fill : change);
				}
			};

			inst.getValue = function (temp, group) {
				var val = temp ? inst.temp : inst.values;
				return s.group && group ? val : val[optIdx];
			};

			// ---

			return {
				width: 50,
				wheels: w,
				layout: layout,
				headerText: false,
				multiple: multiple,
				anchor: input,
				formatResult: function (d) {
					return main[d[optIdx]];
				},
				parseValue: function () {
					var v = elm.val() || [],
					    i = 0;

					if (multiple) {
						inst._selectedValues = {};
						for (i; i < v.length; i++) {
							inst._selectedValues[v[i]] = v[i];
						}
					}

					getOption();

					return s.group ? [gr, option] : [option];
				},
				onBeforeShow: function () {
					if (multiple && s.counter) {
						s.headerText = function () {
							var length = 0;
							$.each(inst._selectedValues, function () {
								length++;
							});
							return length + ' ' + s.selectedText;
						};
					}

					if (option === undefined) {
						getOption();
					}

					if (s.group) {
						prev = gr;
						inst.temp = [gr, option];
					}

					s.wheels = genWheels();
				},
				onMarkupReady: function (dw) {
					dw.addClass('dw-select');

					$('.dwwl' + grIdx, dw).on('mousedown touchstart', function () {
						clearTimeout(timer);
					});

					if (multiple) {
						dw.addClass('dwms');

						$('.dwwl', dw).on('keydown', function (e) {
							if (e.keyCode == 32) { // Space
								e.preventDefault();
								e.stopPropagation();
								onTap($('.dw-sel', this));
							}
						}).eq(optIdx).addClass('dwwms').attr('aria-multiselectable', 'true');

						origValues = $.extend({}, inst._selectedValues);
					}
				},
				validate: function (dw, i, time) {
					var j,
					    v,
					    t = $('.dw-ul', dw).eq(optIdx);

					if (i === undefined && multiple) {
						v = inst._selectedValues;
						j = 0;

						$('.dwwl' + optIdx + ' .dw-li', dw).removeClass(selectedClass).removeAttr('aria-selected');

						for (j in v) {
							$('.dwwl' + optIdx + ' .dw-li[data-val="' + v[j] + '"]', dw).addClass(selectedClass).attr('aria-selected', 'true');
						}
					}

					if (i === undefined || i === grIdx) {
						gr = +inst.temp[grIdx];
						if (gr !== prev) {
							group = elm.find('optgroup').eq(gr);
							option = group.find('option').eq(0).val();
							option = option || elm.val();
							s.wheels = genWheels();
							if (s.group && !change) {
								inst.temp = [gr, option];
								s.readonly = [false, true];
								clearTimeout(timer);
								timer = setTimeout(function () {
									change = true;
									prev = gr;
									inst.changeWheel([optIdx], undefined, true);
									s.readonly = roPre;
								}, time * 1000);
								return false;
							}
						} else {
							s.readonly = roPre;
						}
					} else {
						option = inst.temp[optIdx];
					}

					$.each(s.invalid, function (i, v) {
						$('.dw-li[data-val="' + v + '"]', t).removeClass('dw-v');
					});

					change = false;
				},
				onClear: function (dw) {
					inst._selectedValues = {};
					input.val('');
					$('.dwwl' + optIdx + ' .dw-li', dw).removeClass(selectedClass).removeAttr('aria-selected');
				},
				onValueTap: onTap,
				onSelect: function (v) {
					setVal(v, true, true);
				},
				onCancel: function () {
					if (!inst.live && multiple) {
						inst._selectedValues = $.extend({}, origValues);
					}
				},
				onChange: function (v) {
					if (inst.live && !multiple) {
						input.val(v);
						prevent = true;
						elm.val(inst.temp[optIdx]).change();
					}
				},
				onDestroy: function () {
					input.remove();
					elm.removeClass('dw-hsel').removeAttr('tabindex');
				}
			};
		};

	})(jQuery);
	console.log('ending parsing mobiscroll.js');
}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/html2canvas/html2canvas-tweaked.min.js

try{
	/*
  html2canvas 0.4.1 <http://html2canvas.hertzen.com>
  Copyright (c) 2013 Niklas von Hertzen

  Released under MIT License
*/
	console.log('starting parsing html2canvas.js');
	(function(t,e,n){"use strict";function r(t,e,n){var r,a=t.runtimeStyle&&t.runtimeStyle[e],o=t.style;return!/^-?[0-9]+\.?[0-9]*(?:px)?$/i.test(n)&&/^-?\d/.test(n)&&(r=o.left,a&&(t.runtimeStyle.left=t.currentStyle.left),o.left="fontSize"===e?"1em":n||0,n=o.pixelLeft+"px",o.left=r,a&&(t.runtimeStyle.left=a)),/^(thin|medium|thick)$/i.test(n)?n:Math.round(parseFloat(n))+"px"}function a(t){return parseInt(t,10)}function o(t){return-1!==(""+t).indexOf("%")}function i(t,e,a,o){if(t=(t||"").split(","),t=t[o||0]||t[0]||"auto",t=d.Util.trimText(t).split(" "),"backgroundSize"===a&&t[0]&&t[0].match(/^(cover|contain|auto)$/))return t;if(t[0]=-1===t[0].indexOf("%")?r(e,a+"X",t[0]):t[0],t[1]===n){if("backgroundSize"===a)return t[1]="auto",t;t[1]=t[0]}return t[1]=-1===t[1].indexOf("%")?r(e,a+"Y",t[1]):t[1],t}function l(t,e){var n=[];return{storage:n,width:t,height:e,clip:function(){n.push({type:"function",name:"clip",arguments:arguments})},translate:function(){n.push({type:"function",name:"translate",arguments:arguments})},fill:function(){n.push({type:"function",name:"fill",arguments:arguments})},save:function(){n.push({type:"function",name:"save",arguments:arguments})},restore:function(){n.push({type:"function",name:"restore",arguments:arguments})},fillRect:function(){n.push({type:"function",name:"fillRect",arguments:arguments})},createPattern:function(){n.push({type:"function",name:"createPattern",arguments:arguments})},drawShape:function(){var t=[];return n.push({type:"function",name:"drawShape",arguments:t}),{moveTo:function(){t.push({name:"moveTo",arguments:arguments})},lineTo:function(){t.push({name:"lineTo",arguments:arguments})},arcTo:function(){t.push({name:"arcTo",arguments:arguments})},bezierCurveTo:function(){t.push({name:"bezierCurveTo",arguments:arguments})},quadraticCurveTo:function(){t.push({name:"quadraticCurveTo",arguments:arguments})}}},drawImage:function(){n.push({type:"function",name:"drawImage",arguments:arguments})},fillText:function(){n.push({type:"function",name:"fillText",arguments:arguments})},setVariable:function(t,e){return n.push({type:"variable",name:t,arguments:e}),e}}}var s,c,d={};d.Util={},d.Util.log=function(e){d.logging&&t.console&&t.console.log&&t.console.log(e)},d.Util.trimText=function(t){return function(e){return t?t.apply(e):((e||"")+"").replace(/^\s+|\s+$/g,"")}}(String.prototype.trim),d.Util.asFloat=function(t){return parseFloat(t)},function(){var t=/((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g,e=/(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g;d.Util.parseTextShadows=function(n){if(!n||"none"===n)return[];for(var r=n.match(t),a=[],o=0;r&&r.length>o;o++){var i=r[o].match(e);a.push({color:i[0],offsetX:i[1]?i[1].replace("px",""):0,offsetY:i[2]?i[2].replace("px",""):0,blur:i[3]?i[3].replace("px",""):0})}return a}}(),d.Util.parseBackgroundImage=function(t){var e,n,r,a,o,i,l,s,c=" \r\n	",d=[],h=0,u=0,f=function(){e&&('"'===n.substr(0,1)&&(n=n.substr(1,n.length-2)),n&&s.push(n),"-"===e.substr(0,1)&&(a=e.indexOf("-",1)+1)>0&&(r=e.substr(0,a),e=e.substr(a)),d.push({prefix:r,method:e.toLowerCase(),value:o,args:s})),s=[],e=r=n=o=""};f();for(var p=0,g=t.length;g>p;p++)if(i=t[p],!(0===h&&c.indexOf(i)>-1)){switch(i){case'"':l?l===i&&(l=null):l=i;break;case"(":if(l)break;if(0===h){h=1,o+=i;continue}u++;break;case")":if(l)break;if(1===h){if(0===u){h=0,o+=i,f();continue}u--}break;case",":if(l)break;if(0===h){f();continue}if(1===h&&0===u&&!e.match(/^url$/i)){s.push(n),n="",o+=i;continue}}o+=i,0===h?e+=i:n+=i}return f(),d},d.Util.Bounds=function(t){var e,n={};return t.getBoundingClientRect&&(e=t.getBoundingClientRect(),n.top=e.top,n.bottom=e.bottom||e.top+e.height,n.left=e.left,n.width=t.offsetWidth,n.height=t.offsetHeight),n},d.Util.OffsetBounds=function(t){var e=t.offsetParent?d.Util.OffsetBounds(t.offsetParent):{top:0,left:0};return{top:t.offsetTop+e.top,bottom:t.offsetTop+t.offsetHeight+e.top,left:t.offsetLeft+e.left,width:t.offsetWidth,height:t.offsetHeight}},d.Util.getCSS=function(t,n,r){s!==t&&(c=e.defaultView.getComputedStyle(t,null));var o=c[n];if(/^background(Size|Position)$/.test(n))return i(o,t,n,r);if(/border(Top|Bottom)(Left|Right)Radius/.test(n)){var l=o.split(" ");return 1>=l.length&&(l[1]=l[0]),l.map(a)}return o},d.Util.resizeBounds=function(t,e,n,r,a){var o,i,l=n/r,s=t/e;return a&&"auto"!==a?s>l^"contain"===a?(i=r,o=r*s):(o=n,i=n/s):(o=n,i=r),{width:o,height:i}},d.Util.BackgroundPosition=function(t,e,n,r,a){var i,l,s=d.Util.getCSS(t,"backgroundPosition",r);return 1===s.length&&(s=[s[0],s[0]]),i=o(s[0])?(e.width-(a||n).width)*(parseFloat(s[0])/100):parseInt(s[0],10),l="auto"===s[1]?i/n.width*n.height:o(s[1])?(e.height-(a||n).height)*parseFloat(s[1])/100:parseInt(s[1],10),"auto"===s[0]&&(i=l/n.height*n.width),{left:i,top:l}},d.Util.BackgroundSize=function(t,e,n,r){var a,i,l=d.Util.getCSS(t,"backgroundSize",r);if(1===l.length&&(l=[l[0],l[0]]),o(l[0]))a=e.width*parseFloat(l[0])/100;else{if(/contain|cover/.test(l[0]))return d.Util.resizeBounds(n.width,n.height,e.width,e.height,l[0]);a=parseInt(l[0],10)}return i="auto"===l[0]&&"auto"===l[1]?n.height:"auto"===l[1]?a/n.width*n.height:o(l[1])?e.height*parseFloat(l[1])/100:parseInt(l[1],10),"auto"===l[0]&&(a=i/n.height*n.width),{width:a,height:i}},d.Util.BackgroundRepeat=function(t,e){var n=d.Util.getCSS(t,"backgroundRepeat").split(",").map(d.Util.trimText);return n[e]||n[0]},d.Util.Extend=function(t,e){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e},d.Util.Children=function(t){var e;try{e=t.nodeName&&"IFRAME"===t.nodeName.toUpperCase()?t.contentDocument||t.contentWindow.document:function(t){var e=[];return null!==t&&function(t,e){var r=t.length,a=0;if("number"==typeof e.length)for(var o=e.length;o>a;a++)t[r++]=e[a];else for(;e[a]!==n;)t[r++]=e[a++];return t.length=r,t}(e,t),e}(t.childNodes)}catch(r){d.Util.log("html2canvas.Util.Children failed with exception: "+r.message),e=[]}return e},d.Util.isTransparent=function(t){return!t||"transparent"===t||"rgba(0, 0, 0, 0)"===t},d.Util.Font=function(){var t={};return function(e,r,a){if(t[e+"-"+r]!==n)return t[e+"-"+r];var o,i,l,s=a.createElement("div"),c=a.createElement("img"),d=a.createElement("span"),h="Hidden Text";return s.style.visibility="hidden",s.style.fontFamily=e,s.style.fontSize=r,s.style.margin=0,s.style.padding=0,a.body.appendChild(s),c.src="data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",c.width=1,c.height=1,c.style.margin=0,c.style.padding=0,c.style.verticalAlign="baseline",d.style.fontFamily=e,d.style.fontSize=r,d.style.margin=0,d.style.padding=0,d.appendChild(a.createTextNode(h)),s.appendChild(d),s.appendChild(c),o=c.offsetTop-d.offsetTop+1,s.removeChild(d),s.appendChild(a.createTextNode(h)),s.style.lineHeight="normal",c.style.verticalAlign="super",i=c.offsetTop-s.offsetTop+1,l={baseline:o,lineWidth:1,middle:i},t[e+"-"+r]=l,a.body.removeChild(s),l}}(),function(){function t(t){return function(e){try{t.addColorStop(e.stop,e.color)}catch(r){n.log(["failed to add color stop: ",r,"; tried to add: ",e])}}}var n=d.Util,r={};d.Generate=r;var a=[/^(-webkit-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,/^(-o-linear-gradient)\(([a-z\s]+)([\w\d\.\s,%\(\)]+)\)$/,/^(-webkit-gradient)\((linear|radial),\s((?:\d{1,3}%?)\s(?:\d{1,3}%?),\s(?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)\-]+)\)$/,/^(-moz-linear-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?))([\w\d\.\s,%\(\)]+)\)$/,/^(-webkit-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/,/^(-moz-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s?([a-z\-]*)([\w\d\.\s,%\(\)]+)\)$/,/^(-o-radial-gradient)\(((?:\d{1,3}%?)\s(?:\d{1,3}%?)),\s(\w+)\s([a-z\-]+)([\w\d\.\s,%\(\)]+)\)$/];r.parseGradient=function(t,e){var n,r,o,i,l,s,c,d,h,u,f,p,g=a.length;for(r=0;g>r&&!(o=t.match(a[r]));r+=1);if(o)switch(o[1]){case"-webkit-linear-gradient":case"-o-linear-gradient":if(n={type:"linear",x0:null,y0:null,x1:null,y1:null,colorStops:[]},l=o[2].match(/\w+/g))for(s=l.length,r=0;s>r;r+=1)switch(l[r]){case"top":n.y0=0,n.y1=e.height;break;case"right":n.x0=e.width,n.x1=0;break;case"bottom":n.y0=e.height,n.y1=0;break;case"left":n.x0=0,n.x1=e.width}if(null===n.x0&&null===n.x1&&(n.x0=n.x1=e.width/2),null===n.y0&&null===n.y1&&(n.y0=n.y1=e.height/2),l=o[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g))for(s=l.length,c=1/Math.max(s-1,1),r=0;s>r;r+=1)d=l[r].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/),d[2]?(i=parseFloat(d[2]),i/="%"===d[3]?100:e.width):i=r*c,n.colorStops.push({color:d[1],stop:i});break;case"-webkit-gradient":if(n={type:"radial"===o[2]?"circle":o[2],x0:0,y0:0,x1:0,y1:0,colorStops:[]},l=o[3].match(/(\d{1,3})%?\s(\d{1,3})%?,\s(\d{1,3})%?\s(\d{1,3})%?/),l&&(n.x0=l[1]*e.width/100,n.y0=l[2]*e.height/100,n.x1=l[3]*e.width/100,n.y1=l[4]*e.height/100),l=o[4].match(/((?:from|to|color-stop)\((?:[0-9\.]+,\s)?(?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)\))+/g))for(s=l.length,r=0;s>r;r+=1)d=l[r].match(/(from|to|color-stop)\(([0-9\.]+)?(?:,\s)?((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\)/),i=parseFloat(d[2]),"from"===d[1]&&(i=0),"to"===d[1]&&(i=1),n.colorStops.push({color:d[3],stop:i});break;case"-moz-linear-gradient":if(n={type:"linear",x0:0,y0:0,x1:0,y1:0,colorStops:[]},l=o[2].match(/(\d{1,3})%?\s(\d{1,3})%?/),l&&(n.x0=l[1]*e.width/100,n.y0=l[2]*e.height/100,n.x1=e.width-n.x0,n.y1=e.height-n.y0),l=o[3].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}%)?)+/g))for(s=l.length,c=1/Math.max(s-1,1),r=0;s>r;r+=1)d=l[r].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%)?/),d[2]?(i=parseFloat(d[2]),d[3]&&(i/=100)):i=r*c,n.colorStops.push({color:d[1],stop:i});break;case"-webkit-radial-gradient":case"-moz-radial-gradient":case"-o-radial-gradient":if(n={type:"circle",x0:0,y0:0,x1:e.width,y1:e.height,cx:0,cy:0,rx:0,ry:0,colorStops:[]},l=o[2].match(/(\d{1,3})%?\s(\d{1,3})%?/),l&&(n.cx=l[1]*e.width/100,n.cy=l[2]*e.height/100),l=o[3].match(/\w+/),d=o[4].match(/[a-z\-]*/),l&&d)switch(d[0]){case"farthest-corner":case"cover":case"":h=Math.sqrt(Math.pow(n.cx,2)+Math.pow(n.cy,2)),u=Math.sqrt(Math.pow(n.cx,2)+Math.pow(n.y1-n.cy,2)),f=Math.sqrt(Math.pow(n.x1-n.cx,2)+Math.pow(n.y1-n.cy,2)),p=Math.sqrt(Math.pow(n.x1-n.cx,2)+Math.pow(n.cy,2)),n.rx=n.ry=Math.max(h,u,f,p);break;case"closest-corner":h=Math.sqrt(Math.pow(n.cx,2)+Math.pow(n.cy,2)),u=Math.sqrt(Math.pow(n.cx,2)+Math.pow(n.y1-n.cy,2)),f=Math.sqrt(Math.pow(n.x1-n.cx,2)+Math.pow(n.y1-n.cy,2)),p=Math.sqrt(Math.pow(n.x1-n.cx,2)+Math.pow(n.cy,2)),n.rx=n.ry=Math.min(h,u,f,p);break;case"farthest-side":"circle"===l[0]?n.rx=n.ry=Math.max(n.cx,n.cy,n.x1-n.cx,n.y1-n.cy):(n.type=l[0],n.rx=Math.max(n.cx,n.x1-n.cx),n.ry=Math.max(n.cy,n.y1-n.cy));break;case"closest-side":case"contain":"circle"===l[0]?n.rx=n.ry=Math.min(n.cx,n.cy,n.x1-n.cx,n.y1-n.cy):(n.type=l[0],n.rx=Math.min(n.cx,n.x1-n.cx),n.ry=Math.min(n.cy,n.y1-n.cy))}if(l=o[5].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\)(?:\s\d{1,3}(?:%|px))?)+/g))for(s=l.length,c=1/Math.max(s-1,1),r=0;s>r;r+=1)d=l[r].match(/((?:rgb|rgba)\(\d{1,3},\s\d{1,3},\s\d{1,3}(?:,\s[0-9\.]+)?\))\s*(\d{1,3})?(%|px)?/),d[2]?(i=parseFloat(d[2]),i/="%"===d[3]?100:e.width):i=r*c,n.colorStops.push({color:d[1],stop:i})}return n},r.Gradient=function(n,r){if(0!==r.width&&0!==r.height){var a,o,i=e.createElement("canvas"),l=i.getContext("2d");if(i.width=r.width,i.height=r.height,a=d.Generate.parseGradient(n,r))switch(a.type){case"linear":o=l.createLinearGradient(a.x0,a.y0,a.x1,a.y1),a.colorStops.forEach(t(o)),l.fillStyle=o,l.fillRect(0,0,r.width,r.height);break;case"circle":o=l.createRadialGradient(a.cx,a.cy,0,a.cx,a.cy,a.rx),a.colorStops.forEach(t(o)),l.fillStyle=o,l.fillRect(0,0,r.width,r.height);break;case"ellipse":var s=e.createElement("canvas"),c=s.getContext("2d"),h=Math.max(a.rx,a.ry),u=2*h;s.width=s.height=u,o=c.createRadialGradient(a.rx,a.ry,0,a.rx,a.ry,h),a.colorStops.forEach(t(o)),c.fillStyle=o,c.fillRect(0,0,u,u),l.fillStyle=a.colorStops[a.colorStops.length-1].color,l.fillRect(0,0,i.width,i.height),l.drawImage(s,a.cx-a.rx,a.cy-a.ry,2*a.rx,2*a.ry)}return i}},r.ListAlpha=function(t){var e,n="";do e=t%26,n=String.fromCharCode(e+64)+n,t/=26;while(26*t>26);return n},r.ListRoman=function(t){var e,n=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"],r=[1e3,900,500,400,100,90,50,40,10,9,5,4,1],a="",o=n.length;if(0>=t||t>=4e3)return t;for(e=0;o>e;e+=1)for(;t>=r[e];)t-=r[e],a+=n[e];return a}}(),d.Parse=function(r,a,o){function i(){var t=be(e.documentElement,"backgroundColor"),n=me.isTransparent(t)&&fe===e.body,r=ce(fe,null,!1,n);s(fe),ue(fe,r,function(){n&&(t=r.backgroundColor),c(),me.log("Done parsing, moving to Render."),o({backgroundColor:t,stack:r})})}function s(t){function n(){for(var t=/:before|:after/,n=e.styleSheets,r=0,a=n.length;a>r;r++)try{for(var o=n[r].cssRules,i=0,s=o.length;s>i;i++)if(t.test(o[i].selectorText)){var kd=o[i].selectorText.match(/(^[^:]+)/);kd&&kd.length>1&&kd[1]&&l.push(kd[1])}}catch(c){}for(r=0,a=l.length;a>r;r++)l[r]=l[r].match(/(^[^:]*)/)[1]}function r(){for(var t=e.querySelectorAll(l.join(",")),n=0,r=t.length;r>n;n++)a(t[n])}function a(t){var e=Y(t,":before"),n=Y(t,":after");e&&i.push({type:"before",pseudo:e,el:t}),n&&i.push({type:"after",pseudo:n,el:t})}function o(){i.forEach(function(t){h(t.el,ve+"-parent")}),i.forEach(function(t){"before"===t.type?t.el.insertBefore(t.pseudo,t.el.firstChild):t.el.appendChild(t.pseudo)})}var i=[],l=[];n(),r(t),o()}function c(){xe.removeChild(Ce);for(var t=e.getElementsByClassName(ve+"-element");t.length;)t[0].parentNode.removeChild(t[0]);for(var n=e.getElementsByClassName(ve+"-parent");n.length;)u(n[0],ve+"-parent")}function h(t,e){t.classList?t.classList.add(e):t.className=t.className+" "+e}function u(t,e){t.classList?t.classList.remove(e):t.className=t.className.replace(e,"").trim()}function f(){return Math.max(Math.max(ge.body.scrollWidth,ge.documentElement.scrollWidth),Math.max(ge.body.offsetWidth,ge.documentElement.offsetWidth),Math.max(ge.body.clientWidth,ge.documentElement.clientWidth))}function p(){return Math.max(Math.max(ge.body.scrollHeight,ge.documentElement.scrollHeight),Math.max(ge.body.offsetHeight,ge.documentElement.offsetHeight),Math.max(ge.body.clientHeight,ge.documentElement.clientHeight))}function g(t,e){var n=parseInt(be(t,e),10);return isNaN(n)?0:n}function m(t,e,n,r,a,o){"transparent"!==o&&(t.setVariable("fillStyle",o),t.fillRect(e,n,r,a),pe+=1)}function y(t,e,r){return t.length>0?e+r.toUpperCase():n}function w(t,e){switch(e){case"lowercase":return t.toLowerCase();case"capitalize":return t.replace(/(^|\s|:|-|\(|\))([a-z])/g,y);case"uppercase":return t.toUpperCase();default:return t}}function x(t){return/^(normal|none|0px)$/.test(t)}function b(t,e,n,r){null!==t&&me.trimText(t).length>0&&(r.fillText(t,e,n),pe+=1)}function v(t,e,r,a){var o=!1,i=be(e,"fontWeight"),l=be(e,"fontFamily"),s=be(e,"fontSize"),c=me.parseTextShadows(be(e,"textShadow"));switch(parseInt(i,10)){case 401:i="bold";break;case 400:i="normal"}return t.setVariable("fillStyle",a),t.setVariable("font",[be(e,"fontStyle"),be(e,"fontVariant"),i,s,l].join(" ")),t.setVariable("textAlign",o?"right":"left"),c.length&&(t.setVariable("shadowColor",c[0].color),t.setVariable("shadowOffsetX",c[0].offsetX),t.setVariable("shadowOffsetY",c[0].offsetY),t.setVariable("shadowBlur",c[0].blur)),"none"!==r?me.Font(l,s,ge):n}function C(t,e,n,r,a){switch(e){case"underline":m(t,n.left,Math.round(n.top+r.baseline+r.lineWidth),n.width,1,a);break;case"overline":m(t,n.left,Math.round(n.top),n.width,1,a);break;case"line-through":m(t,n.left,Math.ceil(n.top+r.middle+r.lineWidth),n.width,1,a)}}function k(t,e,n,r,a){var o;if(ye.rangeBounds&&!a)("none"!==n||0!==me.trimText(e).length)&&(o=T(e,t.node,t.textOffset)),t.textOffset+=e.length;else if(t.node&&"string"==typeof t.node.nodeValue){var i=r?t.node.splitText(e.length):null;o=S(t.node,a),t.node=i}return o}function T(t,e,n){var r=ge.createRange();return r.setStart(e,n),r.setEnd(e,n+t.length),r.getBoundingClientRect()}function S(t,e){var n=t.parentNode,r=ge.createElement("wrapper"),a=t.cloneNode(!0);r.appendChild(t.cloneNode(!0)),n.replaceChild(r,t);var o=e?me.OffsetBounds(r):me.Bounds(r);return n.replaceChild(a,r),o}function E(t,e,n){var r,o,i=n.ctx,l=be(t,"color"),s=be(t,"textDecoration"),c=be(t,"textAlign"),d={node:e,textOffset:0};me.trimText(e.nodeValue).length>0&&(e.nodeValue=w(e.nodeValue,be(t,"textTransform")),c=c.replace(["-webkit-auto"],["auto"]),o=!a.letterRendering&&/^(left|right|justify|auto)$/.test(c)&&x(be(t,"letterSpacing"))?e.nodeValue.split(/(\b| )/):e.nodeValue.split(""),r=v(i,t,s,l),a.chinese&&o.forEach(function(t,e){/.*[\u4E00-\u9FA5].*$/.test(t)&&(t=t.split(""),t.unshift(e,1),o.splice.apply(o,t))}),o.forEach(function(t,e){var a=k(d,t,s,o.length-1>e,n.transform.matrix);a&&(b(t,a.left,a.bottom,i),C(i,s,a,r,l))}))}function R(t,e){var n,r,a=ge.createElement("boundelement");return a.style.display="inline",n=t.style.listStyleType,t.style.listStyleType="none",a.appendChild(ge.createTextNode(e)),t.insertBefore(a,t.firstChild),r=me.Bounds(a),t.removeChild(a),t.style.listStyleType=n,r}function M(t){var e=-1,n=1,r=t.parentNode.childNodes;if(t.parentNode){for(;r[++e]!==t;)1===r[e].nodeType&&n++;return n}return-1}function I(t,e){var n,r=M(t);switch(e){case"decimal":n=r;break;case"decimal-leading-zero":n=1===(""+r).length?r="0"+(""+r):""+r;break;case"upper-roman":n=d.Generate.ListRoman(r);break;case"lower-roman":n=d.Generate.ListRoman(r).toLowerCase();break;case"lower-alpha":n=d.Generate.ListAlpha(r).toLowerCase();break;case"upper-alpha":n=d.Generate.ListAlpha(r)}return n+". "}function L(t,e,n){var r,a,o,i=e.ctx,l=be(t,"listStyleType");if(/^(decimal|decimal-leading-zero|upper-alpha|upper-latin|upper-roman|lower-alpha|lower-greek|lower-latin|lower-roman)$/i.test(l)){if(a=I(t,l),o=R(t,a),v(i,t,"none",be(t,"color")),"inside"!==be(t,"listStylePosition"))return;i.setVariable("textAlign","left"),r=n.left,b(a,r,o.bottom,i)}}function O(t){var e=r[t];return e&&e.succeeded===!0?e.img:!1}function z(t,e){var n=Math.max(t.left,e.left),r=Math.max(t.top,e.top),a=Math.min(t.left+t.width,e.left+e.width),o=Math.min(t.top+t.height,e.top+e.height);return{left:n,top:r,width:a-n,height:o-r}}function B(t,e,n){var r,a="static"!==e.cssPosition,o=a?be(t,"zIndex"):"auto",i=be(t,"opacity"),l="none"!==be(t,"cssFloat");e.zIndex=r=U(o),r.isPositioned=a,r.isFloated=l,r.opacity=i,r.ownStacking="auto"!==o||1>i,r.depth=n?n.zIndex.depth+1:0,n&&n.zIndex.children.push(e)}function U(t){return{depth:0,zindex:t,children:[]}}function A(t,e,n,r,a){var o=g(e,"paddingLeft"),i=g(e,"paddingTop"),l=g(e,"paddingRight"),s=g(e,"paddingBottom");_(t,n,0,0,n.width,n.height,r.left+o+a[3].width,r.top+i+a[0].width,r.width-(a[1].width+a[3].width+o+l),r.height-(a[0].width+a[2].width+i+s))}function N(t){return["Top","Right","Bottom","Left"].map(function(e){return{width:g(t,"border"+e+"Width"),color:be(t,"border"+e+"Color")}})}function P(t){return["TopLeft","TopRight","BottomRight","BottomLeft"].map(function(e){return be(t,"border"+e+"Radius")})}function F(t,e,n,r){var a=4*((Math.sqrt(2)-1)/3),o=n*a,i=r*a,l=t+n,s=e+r;return{topLeft:V({x:t,y:s},{x:t,y:s-i},{x:l-o,y:e},{x:l,y:e}),topRight:V({x:t,y:e},{x:t+o,y:e},{x:l,y:s-i},{x:l,y:s}),bottomRight:V({x:l,y:e},{x:l,y:e+i},{x:t+o,y:s},{x:t,y:s}),bottomLeft:V({x:l,y:s},{x:l-o,y:s},{x:t,y:e+i},{x:t,y:e})}}function V(t,e,n,r){var a=function(t,e,n){return{x:t.x+(e.x-t.x)*n,y:t.y+(e.y-t.y)*n}};return{start:t,startControl:e,endControl:n,end:r,subdivide:function(o){var i=a(t,e,o),l=a(e,n,o),s=a(n,r,o),c=a(i,l,o),d=a(l,s,o),h=a(c,d,o);return[V(t,i,c,h),V(h,d,s,r)]},curveTo:function(t){t.push(["bezierCurve",e.x,e.y,n.x,n.y,r.x,r.y])},curveToReversed:function(r){r.push(["bezierCurve",n.x,n.y,e.x,e.y,t.x,t.y])}}}function D(t,e,n,r,a,o,i){e[0]>0||e[1]>0?(t.push(["line",r[0].start.x,r[0].start.y]),r[0].curveTo(t),r[1].curveTo(t)):t.push(["line",o,i]),(n[0]>0||n[1]>0)&&t.push(["line",a[0].start.x,a[0].start.y])}function $(t,e,n,r,a,o,i){var l=[];return e[0]>0||e[1]>0?(l.push(["line",r[1].start.x,r[1].start.y]),r[1].curveTo(l)):l.push(["line",t.c1[0],t.c1[1]]),n[0]>0||n[1]>0?(l.push(["line",o[0].start.x,o[0].start.y]),o[0].curveTo(l),l.push(["line",i[0].end.x,i[0].end.y]),i[0].curveToReversed(l)):(l.push(["line",t.c2[0],t.c2[1]]),l.push(["line",t.c3[0],t.c3[1]])),e[0]>0||e[1]>0?(l.push(["line",a[1].end.x,a[1].end.y]),a[1].curveToReversed(l)):l.push(["line",t.c4[0],t.c4[1]]),l}function G(t,e,n){var r=t.left,a=t.top,o=t.width,i=t.height,l=e[0][0],s=e[0][1],c=e[1][0],d=e[1][1],h=e[2][0],u=e[2][1],f=e[3][0],p=e[3][1],g=o-c,m=i-u,y=o-h,w=i-p;return{topLeftOuter:F(r,a,l,s).topLeft.subdivide(.5),topLeftInner:F(r+n[3].width,a+n[0].width,Math.max(0,l-n[3].width),Math.max(0,s-n[0].width)).topLeft.subdivide(.5),topRightOuter:F(r+g,a,c,d).topRight.subdivide(.5),topRightInner:F(r+Math.min(g,o+n[3].width),a+n[0].width,g>o+n[3].width?0:c-n[3].width,d-n[0].width).topRight.subdivide(.5),bottomRightOuter:F(r+y,a+m,h,u).bottomRight.subdivide(.5),bottomRightInner:F(r+Math.min(y,o+n[3].width),a+Math.min(m,i+n[0].width),Math.max(0,h-n[1].width),Math.max(0,u-n[2].width)).bottomRight.subdivide(.5),bottomLeftOuter:F(r,a+w,f,p).bottomLeft.subdivide(.5),bottomLeftInner:F(r+n[3].width,a+w,Math.max(0,f-n[3].width),Math.max(0,p-n[2].width)).bottomLeft.subdivide(.5)}}function W(t,e,n,r,a){var o=be(t,"backgroundClip"),i=[];switch(o){case"content-box":case"padding-box":D(i,r[0],r[1],e.topLeftInner,e.topRightInner,a.left+n[3].width,a.top+n[0].width),D(i,r[1],r[2],e.topRightInner,e.bottomRightInner,a.left+a.width-n[1].width,a.top+n[0].width),D(i,r[2],r[3],e.bottomRightInner,e.bottomLeftInner,a.left+a.width-n[1].width,a.top+a.height-n[2].width),D(i,r[3],r[0],e.bottomLeftInner,e.topLeftInner,a.left+n[3].width,a.top+a.height-n[2].width);break;default:D(i,r[0],r[1],e.topLeftOuter,e.topRightOuter,a.left,a.top),D(i,r[1],r[2],e.topRightOuter,e.bottomRightOuter,a.left+a.width,a.top),D(i,r[2],r[3],e.bottomRightOuter,e.bottomLeftOuter,a.left+a.width,a.top+a.height),D(i,r[3],r[0],e.bottomLeftOuter,e.topLeftOuter,a.left,a.top+a.height)}return i}function H(t,e,n){var r,a,o,i,l,s,c=e.left,d=e.top,h=e.width,u=e.height,f=P(t),p=G(e,f,n),g={clip:W(t,p,n,f,e),borders:[]};for(r=0;4>r;r++)if(n[r].width>0){switch(a=c,o=d,i=h,l=u-n[2].width,r){case 0:l=n[0].width,s=$({c1:[a,o],c2:[a+i,o],c3:[a+i-n[1].width,o+l],c4:[a+n[3].width,o+l]},f[0],f[1],p.topLeftOuter,p.topLeftInner,p.topRightOuter,p.topRightInner);break;case 1:a=c+h-n[1].width,i=n[1].width,s=$({c1:[a+i,o],c2:[a+i,o+l+n[2].width],c3:[a,o+l],c4:[a,o+n[0].width]},f[1],f[2],p.topRightOuter,p.topRightInner,p.bottomRightOuter,p.bottomRightInner);break;case 2:o=o+u-n[2].width,l=n[2].width,s=$({c1:[a+i,o+l],c2:[a,o+l],c3:[a+n[3].width,o],c4:[a+i-n[3].width,o]},f[2],f[3],p.bottomRightOuter,p.bottomRightInner,p.bottomLeftOuter,p.bottomLeftInner);break;case 3:i=n[3].width,s=$({c1:[a,o+l+n[2].width],c2:[a,o],c3:[a+i,o+n[0].width],c4:[a+i,o+l]},f[3],f[0],p.bottomLeftOuter,p.bottomLeftInner,p.topLeftOuter,p.topLeftInner)}g.borders.push({args:s,color:n[r].color})}return g}function j(t,e){var n=t.drawShape();return e.forEach(function(t,e){n[0===e?"moveTo":t[0]+"To"].apply(null,t.slice(1))}),n}function q(t,e,n){"transparent"!==n&&(t.setVariable("fillStyle",n),j(t,e),t.fill(),pe+=1)}function X(t,e,n){var r,a,o=ge.createElement("valuewrap"),i=["lineHeight","textAlign","fontFamily","color","fontSize","paddingLeft","paddingTop","width","height","border","borderLeftWidth","borderTopWidth"];i.forEach(function(e){try{o.style[e]=be(t,e)}catch(n){me.log("html2canvas: Parse: Exception caught in renderFormValue: "+n.message)}}),o.style.borderColor="black",o.style.borderStyle="solid",o.style.display="block",o.style.position="absolute",(/^(submit|reset|button|text|password)$/.test(t.type)||"SELECT"===t.nodeName)&&(o.style.lineHeight=be(t,"height")),o.style.top=e.top+"px",o.style.left=e.left+"px",r="SELECT"===t.nodeName?(t.options[t.selectedIndex]||0).text:t.value,r||(r=t.placeholder),a=ge.createTextNode(r),o.appendChild(a),xe.appendChild(o),E(t,a,n),xe.removeChild(o)}function _(t){t.drawImage.apply(t,Array.prototype.slice.call(arguments,1)),pe+=1}function Y(n,r){var a=t.getComputedStyle(n,r),o=t.getComputedStyle(n);if(a&&a.content&&"none"!==a.content&&"-moz-alt-content"!==a.content&&"none"!==a.display&&o.content!==a.content){var i=a.content+"";("'"===i[0]||'"'===i[0])&&(i=i.replace(/(^['"])|(['"]$)/g,""));var l="url"===i.substr(0,3),s=e.createElement(l?"img":"span");return s.className=ve+"-element ",Object.keys(a).filter(Q).forEach(function(t){try{s.style[t]=a[t]}catch(e){me.log(["Tried to assign readonly property ",t,"Error:",e])}}),l?s.src=me.parseBackgroundImage(i)[0].args[0]:s.innerHTML=i,s}}function Q(e){return isNaN(t.parseInt(e,10))}function J(t,e,n,r){var a=Math.round(r.left+n.left),o=Math.round(r.top+n.top);t.createPattern(e),t.translate(a,o),t.fill(),t.translate(-a,-o)}function K(t,e,n,r,a,o,i,l){var s=[];s.push(["line",Math.round(a),Math.round(o)]),s.push(["line",Math.round(a+i),Math.round(o)]),s.push(["line",Math.round(a+i),Math.round(l+o)]),s.push(["line",Math.round(a),Math.round(l+o)]),j(t,s),t.save(),t.clip(),J(t,e,n,r),t.restore()}function Z(t,e,n){m(t,e.left,e.top,e.width,e.height,n)}function te(t,e,n,r,a){var o=me.BackgroundSize(t,e,r,a),i=me.BackgroundPosition(t,e,r,a,o),l=me.BackgroundRepeat(t,a);switch(r=ne(r,o),l){case"repeat-x":case"repeat no-repeat":K(n,r,i,e,e.left,e.top+i.top,99999,r.height);break;case"repeat-y":case"no-repeat repeat":K(n,r,i,e,e.left+i.left,e.top,r.width,99999);break;case"no-repeat":K(n,r,i,e,e.left+i.left,e.top+i.top,r.width,r.height);break;default:J(n,r,i,{top:e.top,left:e.left,width:r.width,height:r.height})}}function ee(t,e,n){for(var r,a=be(t,"backgroundImage"),o=me.parseBackgroundImage(a),i=o.length;i--;)if(a=o[i],a.args&&0!==a.args.length){var l="url"===a.method?a.args[0]:a.value;r=O(l),r?te(t,e,n,r,i):me.log("html2canvas: Error loading background:",a)}}function ne(t,e){if(t.width===e.width&&t.height===e.height)return t;var n,r=ge.createElement("canvas");return r.width=e.width,r.height=e.height,n=r.getContext("2d"),_(n,t,0,0,t.width,t.height,0,0,e.width,e.height),r}function re(t,e,n){return t.setVariable("globalAlpha",be(e,"opacity")*(n?n.opacity:1))}function ae(t){return t.replace("px","")}function oe(t){var e=/(matrix)\((.+)\)/,n=be(t,"transform")||be(t,"-webkit-transform")||be(t,"-moz-transform")||be(t,"-ms-transform")||be(t,"-o-transform"),r=be(t,"transform-origin")||be(t,"-webkit-transform-origin")||be(t,"-moz-transform-origin")||be(t,"-ms-transform-origin")||be(t,"-o-transform-origin")||"0px 0px";r=r.split(" ").map(ae).map(me.asFloat);var a;if(n&&"none"!==n){var o=n.match(e);if(o)switch(o[1]){case"matrix":a=o[2].split(",").map(me.trimText).map(me.asFloat)}}return{origin:r,matrix:a}}function ie(t,e,n,r){var o=l(e?n.width:f(),e?n.height:p()),i={ctx:o,opacity:re(o,t,e),cssPosition:be(t,"position"),borders:N(t),transform:r,clip:e&&e.clip?me.Extend({},e.clip):null};return B(t,i,e),a.useOverflow===!0&&/(hidden|scroll|auto)/.test(be(t,"overflow"))===!0&&/(BODY)/i.test(t.nodeName)===!1&&(i.clip=i.clip?z(i.clip,n):n),i}function le(t,e,n){var r={left:e.left+t[3].width,top:e.top+t[0].width,width:e.width-(t[1].width+t[3].width),height:e.height-(t[0].width+t[2].width)};return n&&(r=z(r,n)),r}function se(t,e){var n=e.matrix?me.OffsetBounds(t):me.Bounds(t);return e.origin[0]+=n.left,e.origin[1]+=n.top,n}function ce(t,e,n){var r,a=oe(t,e),o=se(t,a),i=ie(t,e,o,a),l=i.borders,s=i.ctx,c=le(l,o,i.clip),d=H(t,o,l),h=we.test(t.nodeName)?"#efefef":be(t,"backgroundColor");switch(j(s,d.clip),s.save(),s.clip(),c.height>0&&c.width>0&&!n?(Z(s,o,h),ee(t,c,s)):n&&(i.backgroundColor=h),s.restore(),d.borders.forEach(function(t){q(s,t.args,t.color)}),t.nodeName){case"IMG":(r=O(t.getAttribute("src")))?A(s,t,r,o,l):me.log("html2canvas: Error loading <img>:"+t.getAttribute("src"));break;case"INPUT":/^(text|url|email|submit|button|reset)$/.test(t.type)&&(t.value||t.placeholder||"").length>0&&X(t,o,i);break;case"TEXTAREA":(t.value||t.placeholder||"").length>0&&X(t,o,i);break;case"SELECT":(t.options||t.placeholder||"").length>0&&X(t,o,i);break;case"LI":L(t,i,c);break;case"CANVAS":A(s,t,t,o,l)}return i}function de(t){return"none"!==be(t,"display")&&"hidden"!==be(t,"visibility")&&!t.hasAttribute("data-html2canvas-ignore")}function he(t,e,r){return r||(r=function(){}),de(t)&&(e=ce(t,e,!1)||e,!we.test(t.nodeName))?ue(t,e,r):(r(),n)}function ue(t,e,n){function r(n){n.nodeType===n.ELEMENT_NODE?he(n,e,o):n.nodeType===n.TEXT_NODE?(E(t,n,e),o()):o()}function o(){0>=--l&&(me.log("finished rendering "+i.length+" children."),n())}var i=me.Children(t),l=i.length+1;o(),a.async?i.forEach(function(t){setTimeout(function(){r(t)},0)}):i.forEach(r)}t.scroll(0,0);var fe=a.elements===n?e.body:a.elements[0],pe=0,ge=fe.ownerDocument,me=d.Util,ye=me.Support(a,ge),we=RegExp("("+a.ignoreElements+")"),xe=ge.body,be=me.getCSS,ve="___html2canvas___pseudoelement",Ce=ge.createElement("style");Ce.innerHTML="."+ve+'-parent:before { content: "" !important; display: none !important; }'+"."+ve+'-parent:after { content: "" !important; display: none !important; }',xe.appendChild(Ce),r=r||{},i()},d.Preload=function(r){function a(t){E.href=t,E.href=E.href;var e=E.protocol+E.host;return e===g}function o(){b.log("html2canvas: start: images: "+x.numLoaded+" / "+x.numTotal+" (failed: "+x.numFailed+")"),!x.firstRun&&x.numLoaded>=x.numTotal&&(b.log("Finished loading images: # "+x.numTotal+" (failed: "+x.numFailed+")"),"function"==typeof r.complete&&r.complete(x))}function i(e,a,i){var l,s,c=r.proxy;E.href=e,e=E.href,l="html2canvas_"+v++,i.callbackname=l,c+=c.indexOf("?")>-1?"&":"?",c+="url="+encodeURIComponent(e)+"&callback="+l,s=k.createElement("script"),t[l]=function(e){"error:"===e.substring(0,6)?(i.succeeded=!1,x.numLoaded++,x.numFailed++,o()):(p(a,i),a.src=e),t[l]=n;try{delete t[l]}catch(r){}s.parentNode.removeChild(s),s=null,delete i.script,delete i.callbackname},s.setAttribute("type","text/javascript"),s.setAttribute("src",c),i.script=s,t.document.body.appendChild(s)}function l(e,n){var r=t.getComputedStyle(e,n),a=r.content;"url"===a.substr(0,3)&&m.loadImage(d.Util.parseBackgroundImage(a)[0].args[0]),u(r.backgroundImage,e)}function s(t){l(t,":before"),l(t,":after")}function c(t,e){var r=d.Generate.Gradient(t,e);r!==n&&(x[t]={img:r,succeeded:!0},x.numTotal++,x.numLoaded++,o())}function h(t){return t&&t.method&&t.args&&t.args.length>0}function u(t,e){var r;d.Util.parseBackgroundImage(t).filter(h).forEach(function(t){"url"===t.method?m.loadImage(t.args[0]):t.method.match(/\-?gradient$/)&&(r===n&&(r=d.Util.Bounds(e)),c(t.value,r))})}function f(t){var e=!1;try{b.Children(t).forEach(f)}catch(r){}try{e=t.nodeType}catch(a){e=!1,b.log("html2canvas: failed to access some element's nodeType - Exception: "+a.message)}if(1===e||e===n){s(t);try{u(b.getCSS(t,"backgroundImage"),t)}catch(r){b.log("html2canvas: failed to get background-image - Exception: "+r.message)}u(t)}}function p(e,a){e.onload=function(){a.timer!==n&&t.clearTimeout(a.timer),x.numLoaded++,a.succeeded=!0,e.onerror=e.onload=null,o()},e.onerror=function(){if("anonymous"===e.crossOrigin&&(t.clearTimeout(a.timer),r.proxy)){var l=e.src;return e=new Image,a.img=e,e.src=l,i(e.src,e,a),n}x.numLoaded++,x.numFailed++,a.succeeded=!1,e.onerror=e.onload=null,o()}}var g,m,y,w,x={numLoaded:0,numFailed:0,numTotal:0,cleanupDone:!1},b=d.Util,v=0,C=r.elements[0]||e.body,k=C.ownerDocument,T=C.getElementsByTagName("img"),S=T.length,E=k.createElement("a"),R=function(t){return t.crossOrigin!==n}(new Image);for(E.href=t.location.href,g=E.protocol+E.host,m={loadImage:function(t){var e,o;t&&x[t]===n&&(e=new Image,t.match(/data:image\/.*;base64,/i)?(e.src=t.replace(/url\(['"]{0,}|['"]{0,}\)$/gi,""),o=x[t]={img:e},x.numTotal++,p(e,o)):a(t)||r.allowTaint===!0?(o=x[t]={img:e},x.numTotal++,p(e,o),e.src=t):R&&!r.allowTaint&&r.useCORS?(e.crossOrigin="anonymous",o=x[t]={img:e},x.numTotal++,p(e,o),e.src=t):r.proxy&&(o=x[t]={img:e},x.numTotal++,i(t,e,o)))},cleanupDOM:function(a){var i,l;
		if(!x.cleanupDone){a&&"string"==typeof a?b.log("html2canvas: Cleanup because: "+a):b.log("html2canvas: Cleanup after timeout: "+r.timeout+" ms.");for(l in x)if(x.hasOwnProperty(l)&&(i=x[l],"object"==typeof i&&i.callbackname&&i.succeeded===n)){t[i.callbackname]=n;try{delete t[i.callbackname]}catch(s){}i.script&&i.script.parentNode&&(i.script.setAttribute("src","about:blank"),i.script.parentNode.removeChild(i.script)),x.numLoaded++,x.numFailed++,b.log("html2canvas: Cleaned up failed img: '"+l+"' Steps: "+x.numLoaded+" / "+x.numTotal)}t.stop!==n?t.stop():e.execCommand!==n&&e.execCommand("Stop",!1),e.close!==n&&e.close(),x.cleanupDone=!0,a&&"string"==typeof a||o()}},renderingDone:function(){w&&t.clearTimeout(w)}},r.timeout>0&&(w=t.setTimeout(m.cleanupDOM,r.timeout)),b.log("html2canvas: Preload starts: finding background-images"),x.firstRun=!0,f(C),b.log("html2canvas: Preload: Finding images"),y=0;S>y;y+=1)m.loadImage(T[y].getAttribute("src"));return x.firstRun=!1,b.log("html2canvas: Preload: Done."),x.numTotal===x.numLoaded&&o(),m},d.Renderer=function(t,r){function a(t,e){return"children"===t?-1:"children"===e?1:t-e}function o(t){function e(t){Object.keys(t).sort(a).forEach(function(n){var r=[],a=[],i=[],l=[];t[n].forEach(function(t){t.node.zIndex.isPositioned||1>t.node.zIndex.opacity?i.push(t):t.node.zIndex.isFloated?a.push(t):r.push(t)}),function s(t){t.forEach(function(t){l.push(t),t.children&&s(t.children)})}(r.concat(a,i)),l.forEach(function(t){t.context?e(t.context):o.push(t.node)})})}var r,o=[];return r=function(t){function e(t,r,a){var o="auto"===r.zIndex.zindex?0:Number(r.zIndex.zindex),i=t,l=r.zIndex.isPositioned,s=r.zIndex.isFloated,c={node:r},d=a;r.zIndex.ownStacking?(i=c.context={children:[{node:r,children:[]}]},d=n):(l||s)&&(d=c.children=[]),0===o&&a?a.push(c):(t[o]||(t[o]=[]),t[o].push(c)),r.zIndex.children.forEach(function(t){e(i,t,d)})}var r={};return e(r,t),r}(t),e(r),o}function i(t){var e;if("string"==typeof r.renderer&&d.Renderer[t]!==n)e=d.Renderer[t](r);else{if("function"!=typeof t)throw Error("Unknown renderer");e=t(r)}if("function"!=typeof e)throw Error("Invalid renderer defined");return e}return i(r.renderer)(t,r,e,o(t.stack),d)},d.Util.Support=function(t,e){function r(){var t=new Image,r=e.createElement("canvas"),a=r.getContext===n?!1:r.getContext("2d");if(a===!1)return!1;r.width=r.height=10,t.src=["data:image/svg+xml,","<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'>","<foreignObject width='10' height='10'>","<div xmlns='http://www.w3.org/1999/xhtml' style='width:10;height:10;'>","sup","</div>","</foreignObject>","</svg>"].join("");try{a.drawImage(t,0,0),r.toDataURL()}catch(o){return!1}return d.Util.log("html2canvas: Parse: SVG powered rendering available"),!0}function a(){var t,n,r,a,o=!1;return e.createRange&&(t=e.createRange(),t.getBoundingClientRect&&(n=e.createElement("boundtest"),n.style.height="123px",n.style.display="block",e.body.appendChild(n),t.selectNode(n),r=t.getBoundingClientRect(),a=r.height,123===a&&(o=!0),e.body.removeChild(n))),o}return{rangeBounds:a(),svgRendering:t.svgRendering&&r()}},t.html2canvas=function(e,n){e=e.length?e:[e];var r,a={logging:!1,elements:e,background:"#fff",proxy:null,timeout:0,useCORS:!1,allowTaint:!1,svgRendering:!1,ignoreElements:"IFRAME|OBJECT|PARAM",useOverflow:!0,letterRendering:!1,chinese:!1,async:!1,width:null,height:null,taintTest:!0,renderer:"Canvas"};return a=d.Util.Extend(n,a),d.logging=a.logging,a.complete=function(t){("function"!=typeof a.onpreloaded||a.onpreloaded(t)!==!1)&&d.Parse(t,a,function(t){("function"!=typeof a.onparsed||a.onparsed(t)!==!1)&&(r=d.Renderer(t,a),"function"==typeof a.onrendered&&a.onrendered(r))})},t.setTimeout(function(){d.Preload(a)},0),{render:function(t,e){return d.Renderer(t,d.Util.Extend(e,a))},parse:function(t,e){return d.Parse(t,d.Util.Extend(e,a))},preload:function(t){return d.Preload(d.Util.Extend(t,a))},log:d.Util.log}},t.html2canvas.log=d.Util.log,t.html2canvas.Renderer={Canvas:n},d.Renderer.Canvas=function(t){function r(t,e){t.beginPath(),e.forEach(function(e){t[e.name].apply(t,e.arguments)}),t.closePath()}function a(t){if(-1===l.indexOf(t.arguments[0].src)){c.drawImage(t.arguments[0],0,0);try{c.getImageData(0,0,1,1)}catch(e){return s=i.createElement("canvas"),c=s.getContext("2d"),!1}l.push(t.arguments[0].src)}return!0}function o(e,n){switch(n.type){case"variable":e[n.name]=n.arguments;break;case"function":switch(n.name){case"createPattern":if(n.arguments[0].width>0&&n.arguments[0].height>0)try{e.fillStyle=e.createPattern(n.arguments[0],"repeat")}catch(o){h.log("html2canvas: Renderer: Error creating pattern",o.message)}break;case"drawShape":r(e,n.arguments);break;case"drawImage":n.arguments[8]>0&&n.arguments[7]>0&&(!t.taintTest||t.taintTest&&a(n))&&e.drawImage.apply(e,n.arguments);break;default:e[n.name].apply(e,n.arguments)}}}t=t||{};var i=e,l=[],s=e.createElement("canvas"),c=s.getContext("2d"),h=d.Util,u=t.canvas||i.createElement("canvas");return function(t,e,r,a,i){var l,s,c,d=u.getContext("2d"),f=t.stack;return u.width=u.style.width=e.width||f.ctx.width,u.height=u.style.height=e.height||f.ctx.height,c=d.fillStyle,d.fillStyle=h.isTransparent(t.backgroundColor)&&e.background!==n?e.background:t.backgroundColor,d.fillRect(0,0,u.width,u.height),d.fillStyle=c,a.forEach(function(t){d.textBaseline="bottom",d.save(),t.transform.matrix&&(d.translate(t.transform.origin[0],t.transform.origin[1]),d.transform.apply(d,t.transform.matrix),d.translate(-t.transform.origin[0],-t.transform.origin[1])),t.clip&&(d.beginPath(),d.rect(t.clip.left,t.clip.top,t.clip.width,t.clip.height),d.clip()),t.ctx.storage&&t.ctx.storage.forEach(function(t){o(d,t)}),d.restore()}),h.log("html2canvas: Renderer: Canvas renderer done - returning canvas obj"),1===e.elements.length&&"object"==typeof e.elements[0]&&"BODY"!==e.elements[0].nodeName?(s=i.Util.Bounds(e.elements[0]),l=r.createElement("canvas"),l.width=Math.ceil(s.width),l.height=Math.ceil(s.height),d=l.getContext("2d"),d.drawImage(u,s.left,s.top,s.width,s.height,0,0,s.width,s.height),u=null,l):u}}})(window,document);
	console.log('ending parsing html2canvas.js');

}catch(e){window && window.logger ? logger.error('#error #uncaught message: '+ (e.message || e)+' Stack: '+e.stack) : console.error(e+' Stack: '+e.stack);
};

//! Source: vendor/velocity/velocity.min.js

try{
	/*! VelocityJS.org (1.2.1). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
	/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */
	console.log('starting parsing velocity.js');
	!function(e){function t(e){var t=e.length,r=$.type(e);return"function"===r||$.isWindow(e)?!1:1===e.nodeType&&t?!0:"array"===r||0===t||"number"==typeof t&&t>0&&t-1 in e}if(!e.jQuery){var $=function(e,t){return new $.fn.init(e,t)};$.isWindow=function(e){return null!=e&&e==e.window},$.type=function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?a[o.call(e)]||"object":typeof e},$.isArray=Array.isArray||function(e){return"array"===$.type(e)},$.isPlainObject=function(e){var t;if(!e||"object"!==$.type(e)||e.nodeType||$.isWindow(e))return!1;try{if(e.constructor&&!n.call(e,"constructor")&&!n.call(e.constructor.prototype,"isPrototypeOf"))return!1}catch(r){return!1}for(t in e);return void 0===t||n.call(e,t)},$.each=function(e,r,a){var n,o=0,i=e.length,s=t(e);if(a){if(s)for(;i>o&&(n=r.apply(e[o],a),n!==!1);o++);else for(o in e)if(n=r.apply(e[o],a),n===!1)break}else if(s)for(;i>o&&(n=r.call(e[o],o,e[o]),n!==!1);o++);else for(o in e)if(n=r.call(e[o],o,e[o]),n===!1)break;return e},$.data=function(e,t,a){if(void 0===a){var n=e[$.expando],o=n&&r[n];if(void 0===t)return o;if(o&&t in o)return o[t]}else if(void 0!==t){var n=e[$.expando]||(e[$.expando]=++$.uuid);return r[n]=r[n]||{},r[n][t]=a,a}},$.removeData=function(e,t){var a=e[$.expando],n=a&&r[a];n&&$.each(t,function(e,t){delete n[t]})},$.extend=function(){var e,t,r,a,n,o,i=arguments[0]||{},s=1,l=arguments.length,u=!1;for("boolean"==typeof i&&(u=i,i=arguments[s]||{},s++),"object"!=typeof i&&"function"!==$.type(i)&&(i={}),s===l&&(i=this,s--);l>s;s++)if(null!=(n=arguments[s]))for(a in n)e=i[a],r=n[a],i!==r&&(u&&r&&($.isPlainObject(r)||(t=$.isArray(r)))?(t?(t=!1,o=e&&$.isArray(e)?e:[]):o=e&&$.isPlainObject(e)?e:{},i[a]=$.extend(u,o,r)):void 0!==r&&(i[a]=r));return i},$.queue=function(e,r,a){function n(e,r){var a=r||[];return null!=e&&(t(Object(e))?!function(e,t){for(var r=+t.length,a=0,n=e.length;r>a;)e[n++]=t[a++];if(r!==r)for(;void 0!==t[a];)e[n++]=t[a++];return e.length=n,e}(a,"string"==typeof e?[e]:e):[].push.call(a,e)),a}if(e){r=(r||"fx")+"queue";var o=$.data(e,r);return a?(!o||$.isArray(a)?o=$.data(e,r,n(a)):o.push(a),o):o||[]}},$.dequeue=function(e,t){$.each(e.nodeType?[e]:e,function(e,r){t=t||"fx";var a=$.queue(r,t),n=a.shift();"inprogress"===n&&(n=a.shift()),n&&("fx"===t&&a.unshift("inprogress"),n.call(r,function(){$.dequeue(r,t)}))})},$.fn=$.prototype={init:function(e){if(e.nodeType)return this[0]=e,this;throw new Error("Not a DOM node.")},offset:function(){var t=this[0].getBoundingClientRect?this[0].getBoundingClientRect():{top:0,left:0};return{top:t.top+(e.pageYOffset||document.scrollTop||0)-(document.clientTop||0),left:t.left+(e.pageXOffset||document.scrollLeft||0)-(document.clientLeft||0)}},position:function(){function e(){for(var e=this.offsetParent||document;e&&"html"===!e.nodeType.toLowerCase&&"static"===e.style.position;)e=e.offsetParent;return e||document}var t=this[0],e=e.apply(t),r=this.offset(),a=/^(?:body|html)$/i.test(e.nodeName)?{top:0,left:0}:$(e).offset();return r.top-=parseFloat(t.style.marginTop)||0,r.left-=parseFloat(t.style.marginLeft)||0,e.style&&(a.top+=parseFloat(e.style.borderTopWidth)||0,a.left+=parseFloat(e.style.borderLeftWidth)||0),{top:r.top-a.top,left:r.left-a.left}}};var r={};$.expando="velocity"+(new Date).getTime(),$.uuid=0;for(var a={},n=a.hasOwnProperty,o=a.toString,i="Boolean Number String Function Array Date RegExp Object Error".split(" "),s=0;s<i.length;s++)a["[object "+i[s]+"]"]=i[s].toLowerCase();$.fn.init.prototype=$.fn,e.Velocity={Utilities:$}}}(window),function(e){"object"==typeof module&&"object"==typeof module.exports?module.exports=e():"function"==typeof define&&define.amd?define(e):e()}(function(){return function(e,t,r,a){function n(e){for(var t=-1,r=e?e.length:0,a=[];++t<r;){var n=e[t];n&&a.push(n)}return a}function o(e){return g.isWrapped(e)?e=[].slice.call(e):g.isNode(e)&&(e=[e]),e}function i(e){var t=$.data(e,"velocity");return null===t?a:t}function s(e){return function(t){return Math.round(t*e)*(1/e)}}function l(e,r,a,n){function o(e,t){return 1-3*t+3*e}function i(e,t){return 3*t-6*e}function s(e){return 3*e}function l(e,t,r){return((o(t,r)*e+i(t,r))*e+s(t))*e}function u(e,t,r){return 3*o(t,r)*e*e+2*i(t,r)*e+s(t)}function c(t,r){for(var n=0;m>n;++n){var o=u(r,e,a);if(0===o)return r;var i=l(r,e,a)-t;r-=i/o}return r}function p(){for(var t=0;b>t;++t)w[t]=l(t*x,e,a)}function f(t,r,n){var o,i,s=0;do i=r+(n-r)/2,o=l(i,e,a)-t,o>0?n=i:r=i;while(Math.abs(o)>h&&++s<v);return i}function d(t){for(var r=0,n=1,o=b-1;n!=o&&w[n]<=t;++n)r+=x;--n;var i=(t-w[n])/(w[n+1]-w[n]),s=r+i*x,l=u(s,e,a);return l>=y?c(t,s):0==l?s:f(t,r,r+x)}function g(){V=!0,(e!=r||a!=n)&&p()}var m=4,y=.001,h=1e-7,v=10,b=11,x=1/(b-1),S="Float32Array"in t;if(4!==arguments.length)return!1;for(var P=0;4>P;++P)if("number"!=typeof arguments[P]||isNaN(arguments[P])||!isFinite(arguments[P]))return!1;e=Math.min(e,1),a=Math.min(a,1),e=Math.max(e,0),a=Math.max(a,0);var w=S?new Float32Array(b):new Array(b),V=!1,C=function(t){return V||g(),e===r&&a===n?t:0===t?0:1===t?1:l(d(t),r,n)};C.getControlPoints=function(){return[{x:e,y:r},{x:a,y:n}]};var T="generateBezier("+[e,r,a,n]+")";return C.toString=function(){return T},C}function u(e,t){var r=e;return g.isString(e)?v.Easings[e]||(r=!1):r=g.isArray(e)&&1===e.length?s.apply(null,e):g.isArray(e)&&2===e.length?b.apply(null,e.concat([t])):g.isArray(e)&&4===e.length?l.apply(null,e):!1,r===!1&&(r=v.Easings[v.defaults.easing]?v.defaults.easing:h),r}function c(e){if(e){var t=(new Date).getTime(),r=v.State.calls.length;r>1e4&&(v.State.calls=n(v.State.calls));for(var o=0;r>o;o++)if(v.State.calls[o]){var s=v.State.calls[o],l=s[0],u=s[2],f=s[3],d=!!f,m=null;f||(f=v.State.calls[o][3]=t-16);for(var y=Math.min((t-f)/u.duration,1),h=0,b=l.length;b>h;h++){var S=l[h],w=S.element;if(i(w)){var V=!1;if(u.display!==a&&null!==u.display&&"none"!==u.display){if("flex"===u.display){var C=["-webkit-box","-moz-box","-ms-flexbox","-webkit-flex"];$.each(C,function(e,t){x.setPropertyValue(w,"display",t)})}x.setPropertyValue(w,"display",u.display)}u.visibility!==a&&"hidden"!==u.visibility&&x.setPropertyValue(w,"visibility",u.visibility);for(var T in S)if("element"!==T){var k=S[T],A,F=g.isString(k.easing)?v.Easings[k.easing]:k.easing;if(1===y)A=k.endValue;else{var E=k.endValue-k.startValue;if(A=k.startValue+E*F(y,u,E),!d&&A===k.currentValue)continue}if(k.currentValue=A,"tween"===T)m=A;else{if(x.Hooks.registered[T]){var j=x.Hooks.getRoot(T),H=i(w).rootPropertyValueCache[j];H&&(k.rootPropertyValue=H)}var N=x.setPropertyValue(w,T,k.currentValue+(0===parseFloat(A)?"":k.unitType),k.rootPropertyValue,k.scrollData);x.Hooks.registered[T]&&(i(w).rootPropertyValueCache[j]=x.Normalizations.registered[j]?x.Normalizations.registered[j]("extract",null,N[1]):N[1]),"transform"===N[0]&&(V=!0)}}u.mobileHA&&i(w).transformCache.translate3d===a&&(i(w).transformCache.translate3d="(0px, 0px, 0px)",V=!0),V&&x.flushTransformCache(w)}}u.display!==a&&"none"!==u.display&&(v.State.calls[o][2].display=!1),u.visibility!==a&&"hidden"!==u.visibility&&(v.State.calls[o][2].visibility=!1),u.progress&&u.progress.call(s[1],s[1],y,Math.max(0,f+u.duration-t),f,m),1===y&&p(o)}}v.State.isTicking&&P(c)}function p(e,t){if(!v.State.calls[e])return!1;for(var r=v.State.calls[e][0],n=v.State.calls[e][1],o=v.State.calls[e][2],s=v.State.calls[e][4],l=!1,u=0,c=r.length;c>u;u++){var p=r[u].element;if(t||o.loop||("none"===o.display&&x.setPropertyValue(p,"display",o.display),"hidden"===o.visibility&&x.setPropertyValue(p,"visibility",o.visibility)),o.loop!==!0&&($.queue(p)[1]===a||!/\.velocityQueueEntryFlag/i.test($.queue(p)[1]))&&i(p)){i(p).isAnimating=!1,i(p).rootPropertyValueCache={};var f=!1;$.each(x.Lists.transforms3D,function(e,t){var r=/^scale/.test(t)?1:0,n=i(p).transformCache[t];i(p).transformCache[t]!==a&&new RegExp("^\\("+r+"[^.]").test(n)&&(f=!0,delete i(p).transformCache[t])}),o.mobileHA&&(f=!0,delete i(p).transformCache.translate3d),f&&x.flushTransformCache(p),x.Values.removeClass(p,"velocity-animating")}if(!t&&o.complete&&!o.loop&&u===c-1)try{o.complete.call(n,n)}catch(d){setTimeout(function(){throw d},1)}s&&o.loop!==!0&&s(n),o.loop!==!0||t||($.each(i(p).tweensContainer,function(e,t){/^rotate/.test(e)&&360===parseFloat(t.endValue)&&(t.endValue=0,t.startValue=360),/^backgroundPosition/.test(e)&&100===parseFloat(t.endValue)&&"%"===t.unitType&&(t.endValue=0,t.startValue=100)}),v(p,"reverse",{loop:!0,delay:o.delay})),o.queue!==!1&&$.dequeue(p,o.queue)}v.State.calls[e]=!1;for(var g=0,m=v.State.calls.length;m>g;g++)if(v.State.calls[g]!==!1){l=!0;break}l===!1&&(v.State.isTicking=!1,delete v.State.calls,v.State.calls=[])}var f=function(){if(r.documentMode)return r.documentMode;for(var e=7;e>4;e--){var t=r.createElement("div");if(t.innerHTML="<!--[if IE "+e+"]><span></span><![endif]-->",t.getElementsByTagName("span").length)return t=null,e}return a}(),d=function(){var e=0;return t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||function(t){var r=(new Date).getTime(),a;return a=Math.max(0,16-(r-e)),e=r+a,setTimeout(function(){t(r+a)},a)}}(),g={isString:function(e){return"string"==typeof e},isArray:Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},isFunction:function(e){return"[object Function]"===Object.prototype.toString.call(e)},isNode:function(e){return e&&e.nodeType},isNodeList:function(e){return"object"==typeof e&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e))&&e.length!==a&&(0===e.length||"object"==typeof e[0]&&e[0].nodeType>0)},isWrapped:function(e){return e&&(e.jquery||t.Zepto&&t.Zepto.zepto.isZ(e))},isSVG:function(e){return t.SVGElement&&e instanceof t.SVGElement},isEmptyObject:function(e){for(var t in e)return!1;return!0}},$,m=!1;if(e.fn&&e.fn.jquery?($=e,m=!0):$=t.Velocity.Utilities,8>=f&&!m)throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");if(7>=f)return void(jQuery.fn.velocity=jQuery.fn.animate);var y=400,h="swing",v={State:{isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),isAndroid:/Android/i.test(navigator.userAgent),isGingerbread:/Android 2\.3\.[3-7]/i.test(navigator.userAgent),isChrome:t.chrome,isFirefox:/Firefox/i.test(navigator.userAgent),prefixElement:r.createElement("div"),prefixMatches:{},scrollAnchor:null,scrollPropertyLeft:null,scrollPropertyTop:null,isTicking:!1,calls:[]},CSS:{},Utilities:$,Redirects:{},Easings:{},Promise:t.Promise,defaults:{queue:"",duration:y,easing:h,begin:a,complete:a,progress:a,display:a,visibility:a,loop:!1,delay:!1,mobileHA:!0,_cacheValues:!0},init:function(e){$.data(e,"velocity",{isSVG:g.isSVG(e),isAnimating:!1,computedStyle:null,tweensContainer:null,rootPropertyValueCache:{},transformCache:{}})},hook:null,mock:!1,version:{major:1,minor:2,patch:1},debug:!1};t.pageYOffset!==a?(v.State.scrollAnchor=t,v.State.scrollPropertyLeft="pageXOffset",v.State.scrollPropertyTop="pageYOffset"):(v.State.scrollAnchor=r.documentElement||r.body.parentNode||r.body,v.State.scrollPropertyLeft="scrollLeft",v.State.scrollPropertyTop="scrollTop");var b=function(){function e(e){return-e.tension*e.x-e.friction*e.v}function t(t,r,a){var n={x:t.x+a.dx*r,v:t.v+a.dv*r,tension:t.tension,friction:t.friction};return{dx:n.v,dv:e(n)}}function r(r,a){var n={dx:r.v,dv:e(r)},o=t(r,.5*a,n),i=t(r,.5*a,o),s=t(r,a,i),l=1/6*(n.dx+2*(o.dx+i.dx)+s.dx),u=1/6*(n.dv+2*(o.dv+i.dv)+s.dv);return r.x=r.x+l*a,r.v=r.v+u*a,r}return function a(e,t,n){var o={x:-1,v:0,tension:null,friction:null},i=[0],s=0,l=1e-4,u=.016,c,p,f;for(e=parseFloat(e)||500,t=parseFloat(t)||20,n=n||null,o.tension=e,o.friction=t,c=null!==n,c?(s=a(e,t),p=s/n*u):p=u;;)if(f=r(f||o,p),i.push(1+f.x),s+=16,!(Math.abs(f.x)>l&&Math.abs(f.v)>l))break;return c?function(e){return i[e*(i.length-1)|0]}:s}}();v.Easings={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},spring:function(e){return 1-Math.cos(4.5*e*Math.PI)*Math.exp(6*-e)}},$.each([["ease",[.25,.1,.25,1]],["ease-in",[.42,0,1,1]],["ease-out",[0,0,.58,1]],["ease-in-out",[.42,0,.58,1]],["easeInSine",[.47,0,.745,.715]],["easeOutSine",[.39,.575,.565,1]],["easeInOutSine",[.445,.05,.55,.95]],["easeInQuad",[.55,.085,.68,.53]],["easeOutQuad",[.25,.46,.45,.94]],["easeInOutQuad",[.455,.03,.515,.955]],["easeInCubic",[.55,.055,.675,.19]],["easeOutCubic",[.215,.61,.355,1]],["easeInOutCubic",[.645,.045,.355,1]],["easeInQuart",[.895,.03,.685,.22]],["easeOutQuart",[.165,.84,.44,1]],["easeInOutQuart",[.77,0,.175,1]],["easeInQuint",[.755,.05,.855,.06]],["easeOutQuint",[.23,1,.32,1]],["easeInOutQuint",[.86,0,.07,1]],["easeInExpo",[.95,.05,.795,.035]],["easeOutExpo",[.19,1,.22,1]],["easeInOutExpo",[1,0,0,1]],["easeInCirc",[.6,.04,.98,.335]],["easeOutCirc",[.075,.82,.165,1]],["easeInOutCirc",[.785,.135,.15,.86]]],function(e,t){v.Easings[t[0]]=l.apply(null,t[1])});var x=v.CSS={RegEx:{isHex:/^#([A-f\d]{3}){1,2}$/i,valueUnwrap:/^[A-z]+\((.*)\)$/i,wrappedValueAlreadyExtracted:/[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,valueSplit:/([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi},Lists:{colors:["fill","stroke","stopColor","color","backgroundColor","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","outlineColor"],transformsBase:["translateX","translateY","scale","scaleX","scaleY","skewX","skewY","rotateZ"],transforms3D:["transformPerspective","translateZ","scaleZ","rotateX","rotateY"]},Hooks:{templates:{textShadow:["Color X Y Blur","black 0px 0px 0px"],boxShadow:["Color X Y Blur Spread","black 0px 0px 0px 0px"],clip:["Top Right Bottom Left","0px 0px 0px 0px"],backgroundPosition:["X Y","0% 0%"],transformOrigin:["X Y Z","50% 50% 0px"],perspectiveOrigin:["X Y","50% 50%"]},registered:{},register:function(){for(var e=0;e<x.Lists.colors.length;e++){var t="color"===x.Lists.colors[e]?"0 0 0 1":"255 255 255 1";x.Hooks.templates[x.Lists.colors[e]]=["Red Green Blue Alpha",t]}var r,a,n;if(f)for(r in x.Hooks.templates){a=x.Hooks.templates[r],n=a[0].split(" ");var o=a[1].match(x.RegEx.valueSplit);"Color"===n[0]&&(n.push(n.shift()),o.push(o.shift()),x.Hooks.templates[r]=[n.join(" "),o.join(" ")])}for(r in x.Hooks.templates){a=x.Hooks.templates[r],n=a[0].split(" ");for(var e in n){var i=r+n[e],s=e;x.Hooks.registered[i]=[r,s]}}},getRoot:function(e){var t=x.Hooks.registered[e];return t?t[0]:e},cleanRootPropertyValue:function(e,t){return x.RegEx.valueUnwrap.test(t)&&(t=t.match(x.RegEx.valueUnwrap)[1]),x.Values.isCSSNullValue(t)&&(t=x.Hooks.templates[e][1]),t},extractValue:function(e,t){var r=x.Hooks.registered[e];if(r){var a=r[0],n=r[1];return t=x.Hooks.cleanRootPropertyValue(a,t),t.toString().match(x.RegEx.valueSplit)[n]}return t},injectValue:function(e,t,r){var a=x.Hooks.registered[e];if(a){var n=a[0],o=a[1],i,s;return r=x.Hooks.cleanRootPropertyValue(n,r),i=r.toString().match(x.RegEx.valueSplit),i[o]=t,s=i.join(" ")}return r}},Normalizations:{registered:{clip:function(e,t,r){switch(e){case"name":return"clip";case"extract":var a;return x.RegEx.wrappedValueAlreadyExtracted.test(r)?a=r:(a=r.toString().match(x.RegEx.valueUnwrap),a=a?a[1].replace(/,(\s+)?/g," "):r),a;case"inject":return"rect("+r+")"}},blur:function(e,t,r){switch(e){case"name":return v.State.isFirefox?"filter":"-webkit-filter";case"extract":var a=parseFloat(r);if(!a&&0!==a){var n=r.toString().match(/blur\(([0-9]+[A-z]+)\)/i);a=n?n[1]:0}return a;case"inject":return parseFloat(r)?"blur("+r+")":"none"}},opacity:function(e,t,r){if(8>=f)switch(e){case"name":return"filter";case"extract":var a=r.toString().match(/alpha\(opacity=(.*)\)/i);return r=a?a[1]/100:1;case"inject":return t.style.zoom=1,parseFloat(r)>=1?"":"alpha(opacity="+parseInt(100*parseFloat(r),10)+")"}else switch(e){case"name":return"opacity";case"extract":return r;case"inject":return r}}},register:function(){9>=f||v.State.isGingerbread||(x.Lists.transformsBase=x.Lists.transformsBase.concat(x.Lists.transforms3D));for(var e=0;e<x.Lists.transformsBase.length;e++)!function(){var t=x.Lists.transformsBase[e];x.Normalizations.registered[t]=function(e,r,n){switch(e){case"name":return"transform";case"extract":return i(r)===a||i(r).transformCache[t]===a?/^scale/i.test(t)?1:0:i(r).transformCache[t].replace(/[()]/g,"");case"inject":var o=!1;switch(t.substr(0,t.length-1)){case"translate":o=!/(%|px|em|rem|vw|vh|\d)$/i.test(n);break;case"scal":case"scale":v.State.isAndroid&&i(r).transformCache[t]===a&&1>n&&(n=1),o=!/(\d)$/i.test(n);break;case"skew":o=!/(deg|\d)$/i.test(n);break;case"rotate":o=!/(deg|\d)$/i.test(n)}return o||(i(r).transformCache[t]="("+n+")"),i(r).transformCache[t]}}}();for(var e=0;e<x.Lists.colors.length;e++)!function(){var t=x.Lists.colors[e];x.Normalizations.registered[t]=function(e,r,n){switch(e){case"name":return t;case"extract":var o;if(x.RegEx.wrappedValueAlreadyExtracted.test(n))o=n;else{var i,s={black:"rgb(0, 0, 0)",blue:"rgb(0, 0, 255)",gray:"rgb(128, 128, 128)",green:"rgb(0, 128, 0)",red:"rgb(255, 0, 0)",white:"rgb(255, 255, 255)"};/^[A-z]+$/i.test(n)?i=s[n]!==a?s[n]:s.black:x.RegEx.isHex.test(n)?i="rgb("+x.Values.hexToRgb(n).join(" ")+")":/^rgba?\(/i.test(n)||(i=s.black),o=(i||n).toString().match(x.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g," ")}return 8>=f||3!==o.split(" ").length||(o+=" 1"),o;case"inject":return 8>=f?4===n.split(" ").length&&(n=n.split(/\s+/).slice(0,3).join(" ")):3===n.split(" ").length&&(n+=" 1"),(8>=f?"rgb":"rgba")+"("+n.replace(/\s+/g,",").replace(/\.(\d)+(?=,)/g,"")+")"}}}()}},Names:{camelCase:function(e){return e.replace(/-(\w)/g,function(e,t){return t.toUpperCase()})},SVGAttribute:function(e){var t="width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";return(f||v.State.isAndroid&&!v.State.isChrome)&&(t+="|transform"),new RegExp("^("+t+")$","i").test(e)},prefixCheck:function(e){if(v.State.prefixMatches[e])return[v.State.prefixMatches[e],!0];for(var t=["","Webkit","Moz","ms","O"],r=0,a=t.length;a>r;r++){var n;if(n=0===r?e:t[r]+e.replace(/^\w/,function(e){return e.toUpperCase()}),g.isString(v.State.prefixElement.style[n]))return v.State.prefixMatches[e]=n,[n,!0]}return[e,!1]}},Values:{hexToRgb:function(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,a;return e=e.replace(t,function(e,t,r,a){return t+t+r+r+a+a}),a=r.exec(e),a?[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16)]:[0,0,0]},isCSSNullValue:function(e){return 0==e||/^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e)},getUnitType:function(e){return/^(rotate|skew)/i.test(e)?"deg":/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e)?"":"px"},getDisplayType:function(e){var t=e&&e.tagName.toString().toLowerCase();return/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t)?"inline":/^(li)$/i.test(t)?"list-item":/^(tr)$/i.test(t)?"table-row":/^(table)$/i.test(t)?"table":/^(tbody)$/i.test(t)?"table-row-group":"block"},addClass:function(e,t){e.classList?e.classList.add(t):e.className+=(e.className.length?" ":"")+t},removeClass:function(e,t){e.classList?e.classList.remove(t):e.className=e.className.toString().replace(new RegExp("(^|\\s)"+t.split(" ").join("|")+"(\\s|$)","gi")," ")}},getPropertyValue:function(e,r,n,o){function s(e,r){function n(){u&&x.setPropertyValue(e,"display","none")}var l=0;if(8>=f)l=$.css(e,r);else{var u=!1;if(/^(width|height)$/.test(r)&&0===x.getPropertyValue(e,"display")&&(u=!0,x.setPropertyValue(e,"display",x.Values.getDisplayType(e))),!o){if("height"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var c=e.offsetHeight-(parseFloat(x.getPropertyValue(e,"borderTopWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderBottomWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingTop"))||0)-(parseFloat(x.getPropertyValue(e,"paddingBottom"))||0);return n(),c}if("width"===r&&"border-box"!==x.getPropertyValue(e,"boxSizing").toString().toLowerCase()){var p=e.offsetWidth-(parseFloat(x.getPropertyValue(e,"borderLeftWidth"))||0)-(parseFloat(x.getPropertyValue(e,"borderRightWidth"))||0)-(parseFloat(x.getPropertyValue(e,"paddingLeft"))||0)-(parseFloat(x.getPropertyValue(e,"paddingRight"))||0);return n(),p}}var d;d=i(e)===a?t.getComputedStyle(e,null):i(e).computedStyle?i(e).computedStyle:i(e).computedStyle=t.getComputedStyle(e,null),"borderColor"===r&&(r="borderTopColor"),l=9===f&&"filter"===r?d.getPropertyValue(r):d[r],(""===l||null===l)&&(l=e.style[r]),n()}if("auto"===l&&/^(top|right|bottom|left)$/i.test(r)){var g=s(e,"position");("fixed"===g||"absolute"===g&&/top|left/i.test(r))&&(l=$(e).position()[r]+"px")}return l}var l;if(x.Hooks.registered[r]){var u=r,c=x.Hooks.getRoot(u);n===a&&(n=x.getPropertyValue(e,x.Names.prefixCheck(c)[0])),x.Normalizations.registered[c]&&(n=x.Normalizations.registered[c]("extract",e,n)),l=x.Hooks.extractValue(u,n)}else if(x.Normalizations.registered[r]){var p,d;p=x.Normalizations.registered[r]("name",e),"transform"!==p&&(d=s(e,x.Names.prefixCheck(p)[0]),x.Values.isCSSNullValue(d)&&x.Hooks.templates[r]&&(d=x.Hooks.templates[r][1])),l=x.Normalizations.registered[r]("extract",e,d)}if(!/^[\d-]/.test(l))if(i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r))if(/^(height|width)$/i.test(r))try{l=e.getBBox()[r]}catch(g){l=0}else l=e.getAttribute(r);else l=s(e,x.Names.prefixCheck(r)[0]);return x.Values.isCSSNullValue(l)&&(l=0),v.debug>=2&&console.log("Get "+r+": "+l),l},setPropertyValue:function(e,r,a,n,o){var s=r;if("scroll"===r)o.container?o.container["scroll"+o.direction]=a:"Left"===o.direction?t.scrollTo(a,o.alternateValue):t.scrollTo(o.alternateValue,a);else if(x.Normalizations.registered[r]&&"transform"===x.Normalizations.registered[r]("name",e))x.Normalizations.registered[r]("inject",e,a),s="transform",a=i(e).transformCache[r];else{if(x.Hooks.registered[r]){var l=r,u=x.Hooks.getRoot(r);n=n||x.getPropertyValue(e,u),a=x.Hooks.injectValue(l,a,n),r=u}if(x.Normalizations.registered[r]&&(a=x.Normalizations.registered[r]("inject",e,a),r=x.Normalizations.registered[r]("name",e)),s=x.Names.prefixCheck(r)[0],8>=f)try{e.style[s]=a}catch(c){v.debug&&console.log("Browser does not support ["+a+"] for ["+s+"]")}else i(e)&&i(e).isSVG&&x.Names.SVGAttribute(r)?e.setAttribute(r,a):e.style[s]=a;v.debug>=2&&console.log("Set "+r+" ("+s+"): "+a)}return[s,a]},flushTransformCache:function(e){function t(t){return parseFloat(x.getPropertyValue(e,t))}var r="";if((f||v.State.isAndroid&&!v.State.isChrome)&&i(e).isSVG){var a={translate:[t("translateX"),t("translateY")],skewX:[t("skewX")],skewY:[t("skewY")],scale:1!==t("scale")?[t("scale"),t("scale")]:[t("scaleX"),t("scaleY")],rotate:[t("rotateZ"),0,0]};$.each(i(e).transformCache,function(e){/^translate/i.test(e)?e="translate":/^scale/i.test(e)?e="scale":/^rotate/i.test(e)&&(e="rotate"),a[e]&&(r+=e+"("+a[e].join(" ")+") ",delete a[e])})}else{var n,o;$.each(i(e).transformCache,function(t){return n=i(e).transformCache[t],"transformPerspective"===t?(o=n,!0):(9===f&&"rotateZ"===t&&(t="rotate"),void(r+=t+n+" "))}),o&&(r="perspective"+o+" "+r)}x.setPropertyValue(e,"transform",r)}};x.Hooks.register(),x.Normalizations.register(),v.hook=function(e,t,r){var n=a;return e=o(e),$.each(e,function(e,o){if(i(o)===a&&v.init(o),r===a)n===a&&(n=v.CSS.getPropertyValue(o,t));else{var s=v.CSS.setPropertyValue(o,t,r);"transform"===s[0]&&v.CSS.flushTransformCache(o),n=s}}),n};var S=function(){function e(){return l?T.promise||null:f}function n(){function e(e){function p(e,t){var r=a,i=a,s=a;return g.isArray(e)?(r=e[0],!g.isArray(e[1])&&/^[\d-]/.test(e[1])||g.isFunction(e[1])||x.RegEx.isHex.test(e[1])?s=e[1]:(g.isString(e[1])&&!x.RegEx.isHex.test(e[1])||g.isArray(e[1]))&&(i=t?e[1]:u(e[1],o.duration),e[2]!==a&&(s=e[2]))):r=e,t||(i=i||o.easing),g.isFunction(r)&&(r=r.call(n,w,P)),g.isFunction(s)&&(s=s.call(n,w,P)),[r||0,i,s]}function f(e,t){var r,a;return a=(t||"0").toString().toLowerCase().replace(/[%A-z]+$/,function(e){return r=e,""}),r||(r=x.Values.getUnitType(e)),[a,r]}function d(){var e={myParent:n.parentNode||r.body,position:x.getPropertyValue(n,"position"),fontSize:x.getPropertyValue(n,"fontSize")},a=e.position===N.lastPosition&&e.myParent===N.lastParent,o=e.fontSize===N.lastFontSize;N.lastParent=e.myParent,N.lastPosition=e.position,N.lastFontSize=e.fontSize;var s=100,l={};if(o&&a)l.emToPx=N.lastEmToPx,l.percentToPxWidth=N.lastPercentToPxWidth,l.percentToPxHeight=N.lastPercentToPxHeight;else{var u=i(n).isSVG?r.createElementNS("http://www.w3.org/2000/svg","rect"):r.createElement("div");v.init(u),e.myParent.appendChild(u),$.each(["overflow","overflowX","overflowY"],function(e,t){v.CSS.setPropertyValue(u,t,"hidden")}),v.CSS.setPropertyValue(u,"position",e.position),v.CSS.setPropertyValue(u,"fontSize",e.fontSize),v.CSS.setPropertyValue(u,"boxSizing","content-box"),$.each(["minWidth","maxWidth","width","minHeight","maxHeight","height"],function(e,t){v.CSS.setPropertyValue(u,t,s+"%")}),v.CSS.setPropertyValue(u,"paddingLeft",s+"em"),l.percentToPxWidth=N.lastPercentToPxWidth=(parseFloat(x.getPropertyValue(u,"width",null,!0))||1)/s,l.percentToPxHeight=N.lastPercentToPxHeight=(parseFloat(x.getPropertyValue(u,"height",null,!0))||1)/s,l.emToPx=N.lastEmToPx=(parseFloat(x.getPropertyValue(u,"paddingLeft"))||1)/s,e.myParent.removeChild(u)}return null===N.remToPx&&(N.remToPx=parseFloat(x.getPropertyValue(r.body,"fontSize"))||16),null===N.vwToPx&&(N.vwToPx=parseFloat(t.innerWidth)/100,N.vhToPx=parseFloat(t.innerHeight)/100),l.remToPx=N.remToPx,l.vwToPx=N.vwToPx,l.vhToPx=N.vhToPx,v.debug>=1&&console.log("Unit ratios: "+JSON.stringify(l),n),l}if(o.begin&&0===w)try{o.begin.call(m,m)}catch(y){setTimeout(function(){throw y},1)}if("scroll"===k){var S=/^x$/i.test(o.axis)?"Left":"Top",V=parseFloat(o.offset)||0,C,A,F;o.container?g.isWrapped(o.container)||g.isNode(o.container)?(o.container=o.container[0]||o.container,C=o.container["scroll"+S],F=C+$(n).position()[S.toLowerCase()]+V):o.container=null:(C=v.State.scrollAnchor[v.State["scrollProperty"+S]],A=v.State.scrollAnchor[v.State["scrollProperty"+("Left"===S?"Top":"Left")]],F=$(n).offset()[S.toLowerCase()]+V),s={scroll:{rootPropertyValue:!1,startValue:C,currentValue:C,endValue:F,unitType:"",easing:o.easing,scrollData:{container:o.container,direction:S,alternateValue:A}},element:n},v.debug&&console.log("tweensContainer (scroll): ",s.scroll,n)}else if("reverse"===k){if(!i(n).tweensContainer)return void $.dequeue(n,o.queue);"none"===i(n).opts.display&&(i(n).opts.display="auto"),"hidden"===i(n).opts.visibility&&(i(n).opts.visibility="visible"),i(n).opts.loop=!1,i(n).opts.begin=null,i(n).opts.complete=null,b.easing||delete o.easing,b.duration||delete o.duration,o=$.extend({},i(n).opts,o);var E=$.extend(!0,{},i(n).tweensContainer);for(var j in E)if("element"!==j){var H=E[j].startValue;E[j].startValue=E[j].currentValue=E[j].endValue,E[j].endValue=H,g.isEmptyObject(b)||(E[j].easing=o.easing),v.debug&&console.log("reverse tweensContainer ("+j+"): "+JSON.stringify(E[j]),n)}s=E}else if("start"===k){var E;i(n).tweensContainer&&i(n).isAnimating===!0&&(E=i(n).tweensContainer),$.each(h,function(e,t){if(RegExp("^"+x.Lists.colors.join("$|^")+"$").test(e)){var r=p(t,!0),n=r[0],o=r[1],i=r[2];if(x.RegEx.isHex.test(n)){for(var s=["Red","Green","Blue"],l=x.Values.hexToRgb(n),u=i?x.Values.hexToRgb(i):a,c=0;c<s.length;c++){var f=[l[c]];o&&f.push(o),u!==a&&f.push(u[c]),h[e+s[c]]=f}delete h[e]}}});for(var R in h){var O=p(h[R]),z=O[0],q=O[1],M=O[2];R=x.Names.camelCase(R);var I=x.Hooks.getRoot(R),B=!1;if(i(n).isSVG||"tween"===I||x.Names.prefixCheck(I)[1]!==!1||x.Normalizations.registered[I]!==a){(o.display!==a&&null!==o.display&&"none"!==o.display||o.visibility!==a&&"hidden"!==o.visibility)&&/opacity|filter/.test(R)&&!M&&0!==z&&(M=0),o._cacheValues&&E&&E[R]?(M===a&&(M=E[R].endValue+E[R].unitType),B=i(n).rootPropertyValueCache[I]):x.Hooks.registered[R]?M===a?(B=x.getPropertyValue(n,I),M=x.getPropertyValue(n,R,B)):B=x.Hooks.templates[I][1]:M===a&&(M=x.getPropertyValue(n,R));var W,G,D,X=!1;if(W=f(R,M),M=W[0],D=W[1],W=f(R,z),z=W[0].replace(/^([+-\/*])=/,function(e,t){return X=t,""}),G=W[1],M=parseFloat(M)||0,z=parseFloat(z)||0,"%"===G&&(/^(fontSize|lineHeight)$/.test(R)?(z/=100,G="em"):/^scale/.test(R)?(z/=100,G=""):/(Red|Green|Blue)$/i.test(R)&&(z=z/100*255,G="")),/[\/*]/.test(X))G=D;else if(D!==G&&0!==M)if(0===z)G=D;else{l=l||d();var Y=/margin|padding|left|right|width|text|word|letter/i.test(R)||/X$/.test(R)||"x"===R?"x":"y";switch(D){case"%":M*="x"===Y?l.percentToPxWidth:l.percentToPxHeight;break;case"px":break;default:M*=l[D+"ToPx"]}switch(G){case"%":M*=1/("x"===Y?l.percentToPxWidth:l.percentToPxHeight);break;case"px":break;default:M*=1/l[G+"ToPx"]}}switch(X){case"+":z=M+z;break;case"-":z=M-z;break;case"*":z=M*z;break;case"/":z=M/z}s[R]={rootPropertyValue:B,startValue:M,currentValue:M,endValue:z,unitType:G,easing:q},v.debug&&console.log("tweensContainer ("+R+"): "+JSON.stringify(s[R]),n)}else v.debug&&console.log("Skipping ["+I+"] due to a lack of browser support.")}s.element=n}s.element&&(x.Values.addClass(n,"velocity-animating"),L.push(s),""===o.queue&&(i(n).tweensContainer=s,i(n).opts=o),i(n).isAnimating=!0,w===P-1?(v.State.calls.push([L,m,o,null,T.resolver]),v.State.isTicking===!1&&(v.State.isTicking=!0,c())):w++)}var n=this,o=$.extend({},v.defaults,b),s={},l;switch(i(n)===a&&v.init(n),parseFloat(o.delay)&&o.queue!==!1&&$.queue(n,o.queue,function(e){v.velocityQueueEntryFlag=!0,i(n).delayTimer={setTimeout:setTimeout(e,parseFloat(o.delay)),next:e}}),o.duration.toString().toLowerCase()){case"fast":o.duration=200;break;case"normal":o.duration=y;break;case"slow":o.duration=600;break;default:o.duration=parseFloat(o.duration)||1}v.mock!==!1&&(v.mock===!0?o.duration=o.delay=1:(o.duration*=parseFloat(v.mock)||1,o.delay*=parseFloat(v.mock)||1)),o.easing=u(o.easing,o.duration),o.begin&&!g.isFunction(o.begin)&&(o.begin=null),o.progress&&!g.isFunction(o.progress)&&(o.progress=null),o.complete&&!g.isFunction(o.complete)&&(o.complete=null),o.display!==a&&null!==o.display&&(o.display=o.display.toString().toLowerCase(),"auto"===o.display&&(o.display=v.CSS.Values.getDisplayType(n))),o.visibility!==a&&null!==o.visibility&&(o.visibility=o.visibility.toString().toLowerCase()),o.mobileHA=o.mobileHA&&v.State.isMobile&&!v.State.isGingerbread,o.queue===!1?o.delay?setTimeout(e,o.delay):e():$.queue(n,o.queue,function(t,r){return r===!0?(T.promise&&T.resolver(m),!0):(v.velocityQueueEntryFlag=!0,void e(t))}),""!==o.queue&&"fx"!==o.queue||"inprogress"===$.queue(n)[0]||$.dequeue(n)}var s=arguments[0]&&(arguments[0].p||$.isPlainObject(arguments[0].properties)&&!arguments[0].properties.names||g.isString(arguments[0].properties)),l,f,d,m,h,b;if(g.isWrapped(this)?(l=!1,d=0,m=this,f=this):(l=!0,d=1,m=s?arguments[0].elements||arguments[0].e:arguments[0]),m=o(m)){s?(h=arguments[0].properties||arguments[0].p,b=arguments[0].options||arguments[0].o):(h=arguments[d],b=arguments[d+1]);var P=m.length,w=0;if(!/^(stop|finish)$/i.test(h)&&!$.isPlainObject(b)){var V=d+1;b={};for(var C=V;C<arguments.length;C++)g.isArray(arguments[C])||!/^(fast|normal|slow)$/i.test(arguments[C])&&!/^\d/.test(arguments[C])?g.isString(arguments[C])||g.isArray(arguments[C])?b.easing=arguments[C]:g.isFunction(arguments[C])&&(b.complete=arguments[C]):b.duration=arguments[C]}var T={promise:null,resolver:null,rejecter:null};l&&v.Promise&&(T.promise=new v.Promise(function(e,t){T.resolver=e,T.rejecter=t}));var k;switch(h){case"scroll":k="scroll";break;case"reverse":k="reverse";break;case"finish":case"stop":$.each(m,function(e,t){i(t)&&i(t).delayTimer&&(clearTimeout(i(t).delayTimer.setTimeout),i(t).delayTimer.next&&i(t).delayTimer.next(),delete i(t).delayTimer)});var A=[];return $.each(v.State.calls,function(e,t){t&&$.each(t[1],function(r,n){var o=b===a?"":b;return o===!0||t[2].queue===o||b===a&&t[2].queue===!1?void $.each(m,function(r,a){a===n&&((b===!0||g.isString(b))&&($.each($.queue(a,g.isString(b)?b:""),function(e,t){g.isFunction(t)&&t(null,!0)}),$.queue(a,g.isString(b)?b:"",[])),"stop"===h?(i(a)&&i(a).tweensContainer&&o!==!1&&$.each(i(a).tweensContainer,function(e,t){t.endValue=t.currentValue
	}),A.push(e)):"finish"===h&&(t[2].duration=1))}):!0})}),"stop"===h&&($.each(A,function(e,t){p(t,!0)}),T.promise&&T.resolver(m)),e();default:if(!$.isPlainObject(h)||g.isEmptyObject(h)){if(g.isString(h)&&v.Redirects[h]){var F=$.extend({},b),E=F.duration,j=F.delay||0;return F.backwards===!0&&(m=$.extend(!0,[],m).reverse()),$.each(m,function(e,t){parseFloat(F.stagger)?F.delay=j+parseFloat(F.stagger)*e:g.isFunction(F.stagger)&&(F.delay=j+F.stagger.call(t,e,P)),F.drag&&(F.duration=parseFloat(E)||(/^(callout|transition)/.test(h)?1e3:y),F.duration=Math.max(F.duration*(F.backwards?1-e/P:(e+1)/P),.75*F.duration,200)),v.Redirects[h].call(t,t,F||{},e,P,m,T.promise?T:a)}),e()}var H="Velocity: First argument ("+h+") was not a property map, a known action, or a registered redirect. Aborting.";return T.promise?T.rejecter(new Error(H)):console.log(H),e()}k="start"}var N={lastParent:null,lastPosition:null,lastFontSize:null,lastPercentToPxWidth:null,lastPercentToPxHeight:null,lastEmToPx:null,remToPx:null,vwToPx:null,vhToPx:null},L=[];$.each(m,function(e,t){g.isNode(t)&&n.call(t)});var F=$.extend({},v.defaults,b),R;if(F.loop=parseInt(F.loop),R=2*F.loop-1,F.loop)for(var O=0;R>O;O++){var z={delay:F.delay,progress:F.progress};O===R-1&&(z.display=F.display,z.visibility=F.visibility,z.complete=F.complete),S(m,"reverse",z)}return e()}};v=$.extend(S,v),v.animate=S;var P=t.requestAnimationFrame||d;return v.State.isMobile||r.hidden===a||r.addEventListener("visibilitychange",function(){r.hidden?(P=function(e){return setTimeout(function(){e(!0)},16)},c()):P=t.requestAnimationFrame||d}),e.Velocity=v,e!==t&&(e.fn.velocity=S,e.fn.velocity.defaults=v.defaults),$.each(["Down","Up"],function(e,t){v.Redirects["slide"+t]=function(e,r,n,o,i,s){var l=$.extend({},r),u=l.begin,c=l.complete,p={height:"",marginTop:"",marginBottom:"",paddingTop:"",paddingBottom:""},f={};l.display===a&&(l.display="Down"===t?"inline"===v.CSS.Values.getDisplayType(e)?"inline-block":"block":"none"),l.begin=function(){u&&u.call(i,i);for(var r in p){f[r]=e.style[r];var a=v.CSS.getPropertyValue(e,r);p[r]="Down"===t?[a,0]:[0,a]}f.overflow=e.style.overflow,e.style.overflow="hidden"},l.complete=function(){for(var t in f)e.style[t]=f[t];c&&c.call(i,i),s&&s.resolver(i)},v(e,p,l)}}),$.each(["In","Out"],function(e,t){v.Redirects["fade"+t]=function(e,r,n,o,i,s){var l=$.extend({},r),u={opacity:"In"===t?1:0},c=l.complete;l.complete=n!==o-1?l.begin=null:function(){c&&c.call(i,i),s&&s.resolver(i)},l.display===a&&(l.display="In"===t?"auto":"none"),v(this,u,l)}}),v}(window.jQuery||window.Zepto||window,window,document)});
	console.log('ending parsing velocity.js');
}catch(e) {
	window && window.logger ? logger.error('#error #uncaught message: ' + (e.message || e) + ' Stack: ' + e.stack) : console.error(e + ' Stack: ' + e.stack);
};