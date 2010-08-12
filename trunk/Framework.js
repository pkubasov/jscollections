/**
    This file is part of JS Collections API.

    JS Collections API is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with JS Collections API.  If not, see <http://www.gnu.org/licenses/>.

    Author: Philip Kubasov
    Date: July 23, 2010

*/


/**
 *   This function overrides/extends built in JS objects,
 *   builds framework singleton object that contains utility functions
 *   used for object inheritance, equality, type checking, et. al.
 *
 *   @param namespace namespace to wrap framework object
 *
 */
function loadFramework(namespace) {

	var ns=namespace; //shortcut

	/**
	 * converts a string of characters into string of of ascii codes
	 * delimited by delim
	 *
	 * @param delim delimiter
	 * @return String
	 */
	String.prototype.toAscii = function (delim) {
		if (!delim) delim = '';
		var arr=[];
		for(var i=0; i< this.length; i++) {
			arr[i] = this.charCodeAt(i, 1);
		}
		return arr.join(delim);
	};

	/**
	 * used to generate pseudo-UUIDs for objects
	 *
	 * @return String
	 */
	Math.genUID =  function () {
		return ( String((new Date()).getTime() * Math.random() * f.myBits) +
				String((navigator.userAgent.toAscii().substr(1,64) * Math.random() * 1e-45)) +
				String(navigator.platform.toAscii() * (Math.random() * 1e+6))
		);
	};

	/**
	 *  default hash code function
	 *
	 *  @return String
	 */
	Object.prototype.hashCode = function () {
		var hashCode = f.objInitialHashCode;
		// check for null, undefined
		if (!this) {
			f.defaultHashCode(this, hashCode);
		}
		// check for array since they are also objects
		// theoretically this should not be necessary if we override Array prototype
		if(this instanceof Array) {
			return f.arrayHashCode(this);
		}
		_obj = this;
		(function (obj) {
			for (p in obj) {
				if (obj[p] === _obj) return;
				else if(!obj.hasOwnProperty(p)) continue;
				hashCode = (f.defaultHashCode(p, hashCode) * f.myPrimeN + f.defaultHashCode(obj[p], hashCode)) & f.myBits;
			}
		})(_obj);
		return hashCode;
	};

	Object.prototype.toString = function() {
		var out=[];
		out.push("{");
		switch (typeof this) {
		case "number":
			out.push(this);
			break;
		case "function":
			return this.toString();
		case "object":
			// when null is passed as scope, the scope is set to current window object
			if (this === window) return "{null}";

			if (this instanceof Boolean || this instanceof String) {
				return String(this.valueOf());
			} else if (this instanceof Number) {
				return String(this);
			} else if (this instanceof Array) {
				out[0]="[";
				for (var i=0; i< this.length; i++) {
					try {
						out.push(this[i] instanceof Array? ("[" + this[i].toString() + "]") : String(this[i]));
						out.push(",");
					} catch (e) {
						out.push("[Array object]"); // if nesting exceeds stack size
						out.push(",");
					}
				}
				out.pop(); // get rid of last comma
				out.push("]");
				return out.join("");
			} else {
				if (this instanceof ns['Collection']) {
					out.push(this.toString());
				}
				else {
					for (p in this) {
						try {
							if (!this.hasOwnProperty(p) || this[p] === this || this[p] === window ) continue;
							out.push(p + ":");
							out.push(this[p] instanceof Array? ("[" + this[p].toString() + "]") : String(this[p]));
							out.push(",");
						} catch (e) {
							out.push("[Object object]"); // if nesting exceeds stack size
							out.push(",");
						}
					}
					out.pop(",");
				}
			}
			break;
		default:
			out.push(String(this[p]));
			break;
		}
		out.push("}");
		return out.join("");

	};

	/**
	 * default equals method
	 *
	 */
	Object.prototype.equals = function(o) {
		return f.defaultCompare(o, this)==0;
	};

	/**
	 * overridden hash code for functions
	 *
	 * @return String
	 *
	 */
	Function.prototype.hashCode = function () {
		var hashCode = f.funcInitialHashCode;
		var chunk = this.toString().toAscii();
		return ((f.myPrimeN * hashCode  + chunk) & f.myBits);
	}

	/*	end of JS built-in objects' extensions */


	/**
	 *  singleton framework object put into namespace
	 */
	namespace['framework'] = {

		 // integers used for hashing functions
		 myPrimeN : 37,
		 myBits   : 0xFFFF,
		 objInitialHashCode  : 11,
		 arrInitialHashCode  : 13,
		 funcInitialHashCode : 17,
		 isIE 				 : ( function(ua) { return ua.test(navigator.userAgent.toLowerCase());} )(/msie/),

		 /**
		  *
		  * @param subInterface subInterface or subclass that will implement the superInterface
		  * @param superInterface the interface to be implemented
		  * @param override Boolean flag normally not passed in, so false
		  * @return
		  */
		 implement : function ( subInterface, superInterface, override) {
		 	try {
		 		var o = new superInterface();
		 		var temp = {};
				for (var i in subInterface.prototype) {
					// save method if it's already defined unless override flag is set
					if (override) break;
					// save all of the current methods, implemented or not
					temp[i] = subInterface.prototype[i];
				}
				subInterface.prototype = o;
				// restore previously defined methods unless override flag is set
				if (!override) {
					for (var i in temp) {
						subInterface.prototype[i] = temp[i];
					}
				}
			} catch (e) {
				// this is most likely fatal, so ...
				alert("Fatal error in implementation of " + superInterface.getType() + " by " + subInterface.getType() + "\n" + e.message);
			}
		 },

		 /**
		  *
		  * @param subclass
		  * @param superclass
		  *
		  */
		 extend: function (subclass, superclass) {
			 f.implement(subclass, superclass, true);
		 },

		 /**
		  * this is used to construct function that will validate objects to be
		  * of a specific type (used to implement generics )
		  *
		  * @param type String that represents allowable type
		  * @return Function
		  */
		 typeValidator : function (type) {
				if (!type) return false;
				if (typeof type !== "string") return false;
				switch (type.toLowerCase()){
				case "any":
					return function() { return true; };
				case "positivenumber":
					return function(obj) { return !isNaN(obj) && obj >=0; };
				case "positiveinteger":
					return function(obj) { return !isNaN(obj) && obj >=0 && ~~obj == obj; };
				case "number":
				case "string":
				case "function":
				case "boolean":
				case "object":
					return function (obj) { return typeof obj === type.toLowerCase(); };
				default:
					try {
						v = eval(type);
						return function (obj) { return obj instanceof v; };
					} catch (e) {
						throw ns['IllegalArgumentException'];
					}
				}
		},

		/**
		 * @params actual Object containing actual arguments that were passed in
		 * @expected actual Object containing expected parameters and their types
		 *
		 */
		validateParams: function (actual, expected) {
			if(!actual) throw ns['IllegalArgumentException'];
			for(var i in expected) {
				if (!expected.hasOwnProperty(i)) continue;
				if (actual[i]===undefined && expected[i].required) throw ns['IllegalArgumentException'];
				var validType = f.typeValidator(expected[i].type);
				if (actual[i]!==undefined && !validType(actual[i])) throw ns['IllegalArgumentException'];
			}
		},

		/**
		 * default hashcode function
		 *
		 * @param obj Object to be hashed
		 * @param hashCode String containing partial hashCode to be appended to
		 *
		 * @return String
		 */
		defaultHashCode : function (obj, hashCode) {
			if (!hashCode) hashCode = f.myPrimeN;
			var strID = '';
			switch (typeof obj) {
			case "number":
				var initial = f.myPrimeN * hashCode + obj;
				while(~~initial!== initial) initial*=10;
				return initial & f.myBits;
			case "string":
	    		strID =  obj;
	    		break;
			case "boolean":
				strID = obj? "true" : "false";
				break;
			case "undefined":
				strID = typeof obj;
				break;
			case "function":
			case "object":
				if (obj === null) strID = defaultHashCode("null", hashCode);
				else strID = obj instanceof Array? f.arrayHashCode(obj) :obj.hashCode();
				break;
			default:
				strID = "null";
			}
			return ((f.myPrimeN * hashCode + String(strID).toAscii()) & f.myBits);
		},


		/**
		 * hashcode function for arrays
		 *
		 * @param obj Array to be hashed
		 * @param preserveOrder Boolean flag indicating if order should be used as part of the hashing algorithm
		 *
		 * @return String
		 */
		arrayHashCode : function (obj, preserveOrder) {
			var hashCode = f.arrInitialHashCode;
			// check for null or empty
			if (!obj) return f.defaultHashCode(obj, hashCode);
			if (!obj.length) return hashCode;
			var _arr;
			for (var i=0; (_arr=obj) && i< _arr.length; i++) {
				if (!_arr[i] || !_arr[i].hashCode || typeof _arr[i] === "number" ) {

					if (preserveOrder) {
						hashCode = ((f.myPrimeN * hashCode) + (i+1)* f.defaultHashCode(_arr[i], hashCode)) & f.myBits;
					} else {
						hashCode += (f.myPrimeN * f.defaultHashCode(_arr[i])) & f.myBits;
					}
				} else {
					if (preserveOrder) {
						hashCode = ((f.myPrimeN * hashCode) + (i+1)* _arr[i].hashCode()) & f.myBits;
					} else {
						hashCode += (f.myPrimeN * _arr[i].hashCode())  & f.myBits;
					}
				}
			}
			return hashCode;
		},

		/**
		 * compare a to b
		 * if a > b returns positive number
		 * if a < b return  negative number
		 * if a == b returns 0
		 * return undefined if a and b are of different types
		 * return 0 if a and b are both null
		 *
		 * @param a item1 to be compared
		 * @param b item2 to be compared
		 *
		 * @return Number
		 */
		defaultCompare : function (a, b) {
			if (typeof a != typeof b) {
				// one way to handle this
				//throw new Error("Cannot compare objects of different types");
				// or
				return undefined;
			}
			if (a===null && b===null) return 0;

			switch (typeof a) {
			case "number":
				return a-b;
			case "string":
				return Number(a.toAscii()) - Number(b.toAscii());
			case "undefined":
				return 0;
			case "boolean":
				if(a && !b) return a;
				if(b && !a) return b;
				return 0;
			case "function":
			case "object":
				return f.defaultHashCode(a) - f.defaultHashCode(b);
			default:
				return null;
			}
		},

		genSubSet: function (c, fromElement, toElement) {

			var upperBound, lowerBound;
			updateBounds();

			function getElementIndex(element, upDownFlag) {
				var index = c.indexOf(element);
				if (index == -1) {
					var result = f.binarySearchNearestNeighbor(this.toArray(), element, this.comparator().compare, upDownFlag=="up"? true: false );
					index = c.indexOf(result.neighbor);
				}
				return index;
			}

			function updateBounds() {
				if(c instanceof ns.TreeSet) {
					upperBound =  toElement===null? c.size() : getElementIndex.call(c, toElement, "down")+1;
					lowerBound =  fromElement === null? 0 : getElementIndex.call(c, fromElement, "up");
				} else {
					// assume List, so we are just passing start and end indices
					upperBound = toElement < 0 ? 0 : toElement;
					lowerBound = fromElement > 0 ? fromElement : 0;
				}
			}

			function checkBounds(o) {
				if(c instanceof ns.List) {
					// o is an index
					if(o < 0 || index >= subSet.size()) throw ns['IndexOutOfBoundsException'];
					return;
				} else if( c instanceof ns.SortedSet ) {
					var compareFn = c.comparator().compare;
					if (compareFn(o, toElement) > 0) {
						throw ns['IllegalArgumentException'];
					}
					if (compareFn(o, fromElement) < 0) {
						throw ns['IllegalArgumentException'];
					}
				}
			}

			// create empty object and set its prototype to current object to make subSet backed by this set
			var func = function () {};
			func.prototype = c;
			var subSet = new func();

			// override functions
			subSet.toArray= function () {
				updateBounds();
				return c.toArray().slice(lowerBound, upperBound);
			}

			subSet.add = function (o) {
				//checkBounds(o);
				return c.add(o);
			}

			subSet.remove = function (o) {
				checkBounds(o);
				return c.remove(o);
			}

			subSet.size = function () {
				return subSet.toArray().length;
			}

			if(c instanceof ns.TreeSet) {
				subSet.first = function () {
					return subSet.toArray()[0];
				}

				subSet.last = function () {
					var arr= subSet.toArray();
					return arr[arr.length-1];
				}

				subSet.clear = function() {
					while(subSet.size() > 0) subSet.remove(subSet.first());
				}
			}
			if(c instanceof ns.List) {
				subSet.get = function (index) {
					//f.validateParams({index:index}, {index: {required: true, type: 'positiveInteger'} });
					//if(index < 0 || index >= subSet.size()) throw ns['IndexOutOfBoundsException'];
					checkBounds(index);
					return c.get(index+lowerBound);
				}

				subSet.remove = function (index) {
					checkBounds(index);
					c.remove(index+lowerBound);
				};

				subSet.add = function(index, o) {
					checkBounds(index);
					c.add(index+lowerBound, o);
				};

				subSet.addAll = function(index, o) {
					checkBounds(index);
					c.addAll(index+lowerBound, o);
				};

				subSet.set = function(index, o) {
					checkBounds(index);
					c.set(index+lowerBound, o);
				}

				subSet.removeRange = function(from, to) {
					if(from < lowerBound || to >= upperBound) throw ns['IndexOutOfBoundsException'];
					c.removeRange(from+lowerBound, to+lowerBound);
				};

			}

			subSet.contains = function (o) {
				index = c.indexOf(o);
				if (index===undefined) return false;
				updateBounds();
				if(index < lowerBound || index > upperBound) return false;
				return true;
			}

			return subSet;
		},

		/**
		 * search sorted array
		 * if no compareFunction is passed in, uses defaultCompare
		 *
		 * @param arr Array to be sorted
		 * @param searchItem Object to be found
		 * @param compareFn Function to be used for comparisons
		 *
		 * @return Boolean
		 */
		binarySearch : function (arr, searchItem, compareFn) {
			// validate
			if (!arr || arr.length ==0) return false;
			compareFn = compareFn || f.defaultCompare;

			var compareResult;

			// base case
			if (arr.length ==1) return compareFn(arr.shift(), searchItem)==0 ? true : false;

			// edge cases
			compareResult = compareFn(arr[arr.length-1], searchItem);
			if (compareResult < 0 ) return false;

			compareResult = compareFn(arr[0], searchItem);
			if (compareResult > 0 ) return false;

			// routine case
			var splitPoint = arr.length >> 1; // divide and round down

			compareResult = compareFn(arr[splitPoint], searchItem);
			if (compareResult == 0 ) {
				return true; // found it
			} else if (compareResult < 0 ) {
				return arguments.callee(arr.slice(splitPoint+1), searchItem, compareFn);
			} else {
				return arguments.callee(arr.slice(0, splitPoint), searchItem, compareFn);
			}

		},


		/**
		 * search sorted array for nearest lower or higher element
		 * if no compareFunction is passed in, uses defaultCompare
		 *
		 * @param arr Array to be sorted
		 * @param searchItem Object to be found
		 * @param compareFn Function to be used for comparisons
		 * @param greaterFlag Boolean flag to indicate if higher or lower element is searched for
		 *
		 * @return Object {'neighbor': index, 'exactMatch': index, if found }
		 */
		binarySearchNearestNeighbor : function (arr, searchItem, compareFn, greaterFlag) {
			// validate
			if (!arr || arr.length ==0) return false;
			compareFn = compareFn || f.defaultCompare;

			var compareResult;

			// base case
			if (arr.length ==1) {
				compareResult = compareFn(arr[0], searchItem);
				if (compareResult==0){
					return {'exactMatch':searchItem};
				} else if (compareResult < 0) {
					return {'neighbor': greaterFlag? undefined : arr[0] };
				} else {
					return {'neighbor': greaterFlag? arr[0] : undefined };
				}
			}
			// edge cases
			if (greaterFlag) {
				// check if first element is greater
				compareResult = compareFn(arr[0], searchItem);
				if(compareResult > 0 ) return {'neighbor':arr[0]};

			} else {
				// check if last element is smaller
				compareResult = compareFn(arr[arr.length-1], searchItem);
				if(compareResult < 0 ) return {'neighbor':arr[arr.length-1] };
			}

			// routine case
			var splitPoint = arr.length>>1; // divide and round

			compareResult = compareFn(arr[splitPoint], searchItem);
			var retVal;
			if (compareResult == 0 ) {
				retVal= {'exactMatch':arr[splitPoint], 'neighbor': greaterFlag? arr[splitPoint+1]: arr[splitPoint-1] }; // found it
			} else if (compareResult < 0 ) {
				retVal = arguments.callee( arr.slice(splitPoint), searchItem, compareFn, greaterFlag );
			} else {
				retVal = arguments.callee( arr.slice(0, splitPoint), searchItem, compareFn, greaterFlag );
			}
			// as we walk back up the chain see if one of the splitPoints is the closest match we "lost"
			if (retVal.neighbor === undefined) {
				if( (greaterFlag && compareResult > 0) || (!greaterFlag && compareResult < 0) ) retVal.neighbor = arr[splitPoint];
			}
			return retVal;
		},


		/**
		 * sort only the unsorted portion of the array and merge with the sorted portion
		 * if no compareFunction is passed in, uses defaultCompare
		 *
		 * @param arr Array to be sorted
		 * @param lastSortedIndex Number indicating subscript(index) where the sorted part of the array ends
		 * @param compareFn Function to be used for comparisons
		 * @param hashMap Array of hashCode of stored objects to their indices in the array to be sorted
		 *
		 * @return Object {'neighbor': index, 'exactMatch': index, if found }
		 */
		sortAndMerge : function (arr, lastSortedIndex, compareFn, hashMap) {
			if (lastSortedIndex >= arr.length-1) return arr;
			compareFn = compareFn || f.defaultCompare;

			var arrayToSort = arr.slice(lastSortedIndex+1).sort( compareFn );
			arr = arr.slice(0, lastSortedIndex);

			// find starting point for merge
			var resultObj = f.binarySearchNearestNeighbor(arr , arrayToSort[0], compareFn, false);
			// inner loop index
			var j = hashMap[f.defaultHashCode(resultObj.neighbor)];

			if (j== lastSortedIndex-1) {
				// lucky edge case - just need to concat one array to the other
				return [].concat(arr, arrayToSort);
			}
			for (var i = 0; i < arrayToSort.length; i++) {
				for( ; j< arr.length; j++) {
					compareResult = compareFn(arr[j], arrayToSort[i]);
					if (compareResult > 0) {
						arr.splice(j,0, arrayToSort[i]);
						hashMap[f.defaultHashCode(arr[j])] = j;
						hashMap[f.defaultHashCode(arr[j+1])] = j+1;
						break;
					}
				}
			}
			return arr;
		},

		/**
		 * checks if dataPoints growth is tightly bound by growthFunction
		 * it is assumed that dataPoints contains array that starts at n_0 such that O(g(n)) = f(n) for all n>=n_0
		 *
		 * @param dataPoints Array of [x,y] data points where x=n and y=f(n)
		 * @param growthFunction Function that we are asserting is serving as the upper boundary
		 *
		 */
		assertBigO : function (dataPoints, growthFunction) {
			f.validateParams({dataPoints:dataPoints, growthFunction: growthFunction}, {
				dataPoints: {
					required:true,
					type: "Array"
				},
				growthFunction: {
					required: true,
					type: "Function"
				}
			});
			var g = growthFunction;
			for (var i=1; i< dataPoints.length; i++) {
				var deltaY = dataPoints[i]['y'] - dataPoints[i-1]['y'];
				var deltaX = dataPoints[i]['x'] - dataPoints[i-1]['x'];
				var deltaYOfG = g(dataPoints[i]['x']) - g(dataPoints[i-1]['x'])
				var deltaXOfG = dataPoints[i]['x'] - dataPoints[i-1]['x'];

				if (deltaYOfG/deltaXOfG < deltaY/deltaX) return false;
			}
			return true;
		},

		assertBigONLogN : function(dataPoints) {
			return f.assertBigO (dataPoints, function(n) { return n*Math.log(n); });
		},

		assertBigOLogN : function(dataPoints) {
			return f.assertBigO (dataPoints, function(n) { return Math.log(n); });
		},

		assertBigOLinear : function(dataPoints) {
			return f.assertBigO (dataPoints, function(n) { return n; });
		},

		assertBigOQuadratic : function(dataPoints) {
			return f.assertBigO (dataPoints, function(n) { return Math.pow(n,2); });
		},

		assertBigOExponential : function(dataPoints) {
			return f.assertBigO (dataPoints, function(n) { return Math.exp(2, n); });
		}

	}; // end framework object

	//shortcut
	var f = namespace['framework'];
}