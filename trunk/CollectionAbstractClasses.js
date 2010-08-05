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
function loadCollectionAbstractClasses (ns) {

	loadCollectionInterfaces(ns);

	//shortcuts
	var f = ns['framework'];

	// access matrix - used to implement "protected" scope
	// keys are names of objects and GUIDs of subclasses that are allowed access
	var accessMatrix = {'AbstractCollection':[], 'AbstractSet':[], 'AbstractList':[]};

	/**
	 *  AbstractCollection - This class provides a skeletal implementation of the Collection interface,
	 *  to minimize the effort required to implement this interface.
	 *
	 *  Methods to be implemented: size() and iterator(); iterator() must return object that implements next() and hasNext() methods;
	 *
	 */
	var AbstractCollection = function () {

		// private static variables
		var calledInit = false;

		// constructor = gets called only when invoked with "new" keyword
		/**
		 * @param objType String specifying type of objects to store, eg.: "String", "Number" or some user-defined object
		 *
		 * @return Object of type AbstractCollection
		 */
		var myConstructor = function (params) {

			var that = this || {};
			params = params || {};

			// private instance variables
			var _arrayCopy = [];
			var _UID = Math.genUID();
			var _hashCode;
			var _allowProtectedAccess;


			// private functions
			var generateHashCode = function () {
				_hashCode = _protected.arr.hashCode();
				_protected.dirty = false;
				return _hashCode;
			};

			function updateHashMap (start) {
				// for faster access
				var arr = _protected.arr;
				var arrayLength = _protected.arr.length;
				var hashMap = _protected.hashMap;
				var fn = f.defaultHashCode;

				var limit;

				if (start!== undefined) limit = start+3;
				else {
					start=0;
					limit = arrayLength;
				}

				for (var i=start; i< arrayLength && i< limit; i++) {
					var hashCode = fn (arr[i]);
					hashMap[hashCode] =i;
				}
			}


			// protected variables encapsulated in an obj
			var _protected = {
				 objTypeChecker:null,
				 arr : [],
				 dirty: false,
			 	 hashMap: [],
			 	 size: 0
			};

			//  INIT BLOCK
			_hashCode = generateHashCode();
			if (params.objType) {
				_protected.objTypeChecker = f.typeValidator(params.objType);
				if (!_protected.objTypeChecker) throw new Error("Invalid object type: " + params.objType);
			}

			//here is how this works: before we override this.getUID, it actually refers to the
			//same instance that serves as the prototype object for a given subclass
			// i.e. Set.prototype = new ct.Collection()
			if (this.getUID) {
				_allowProtectedAccess = accessMatrix['AbstractCollection'][this.getUID()];
			}

			/*
			 *		public API that needs to directly access private variables
			 *      (thus cannot be combined with use of prototype chain or "this", since either of the two
			 *		can be publicly accessible
			 *
			 */

			this.hashCode = function () { return _protected.dirty? generateHashCode(): _hashCode ; };

			this.toArray = function () {
				if (!_protected.dirty && _protected.arr.length == _arrayCopy.length) return _arrayCopy;
				_arrayCopy = _protected.arr.concat([]);
				_protected.dirty = false;
				return _arrayCopy;
			};

			this.add = function (o) {
				if (_protected.objTypeChecker && !_protected.objTypeChecker(o)) {
					throw ns['IllegalArgumentException'];
				}
				_protected.arr.push(o);
				_protected.hashMap[f.defaultHashCode(o)] = _protected.arr.length;
				_protected.dirty = true;
				_protected.size++;
				return true;
			};

			this.clear = function () {
				_protected.arr = [];
				_protected.dirty = true;
				_protected.hashMap = [];
				_protected.size = 0;
			};

			this.remove = function (o) {

				var objHashCode = f.defaultHashCode(o);
				var success = false;
				var i=0;

				// check if called with index of element to remove
				if (arguments.length == 2) {
					i = arguments[1];
					if (_protected.arr[i] === o) {
						success = _protected.arr.splice(i, 1).length;
					}
				}
				if (!success) {
					i = _protected.hashMap[objHashCode];
					if (i === undefined) return false;
					success = _protected.arr.splice(i, 1).length;

				}
				if (success) {
					_protected.dirty = true;
					_protected.size--;
					delete _protected.hashMap[objHashCode];
					updateHashMap(i);
				}
				return success ? true : false;
			};

			this.contains = function (o) { return  _protected.hashMap[f.defaultHashCode(o)] === undefined? false: true; };

			this.getUID = function () { return _UID; };

			calledInit || init();

			// propagate protected vars
			if (_allowProtectedAccess) return _protected;

		}; // end internal constructor function

		// public static descriptors, methods
		myConstructor.getType = function () { return  "AbstractCollection"; };

		// define more methods here using prototype-based inheritance
		function init() {

			AbstractCollection.prototype.addAll = function (c) {
				 if (!c || !c.size || !c.toArray) throw ns['IllegalArgumentException'];

				 var i=c.iterator();
				 var success = false;
				 while(i.hasNext()) {
					 this.add(i.next());
					 success = true;
				 }
				 return success;
			};

			AbstractCollection.prototype.equals = function (c) {
				return (this.hashCode() == c.hashCode());
			};

			AbstractCollection.prototype.isEmpty = function () {
				return this.size() == 0 ;
			};

			AbstractCollection.prototype.retainAll = function (c) {
				if (!c || !c.iterator) throw ns['IllegalArgumentException'];
				if (c.isEmpty()) {
					this.clear();
					return true;
				}

				var iterator = this.iterator();
				var success = false;
				while (iterator.hasNext()) {
					if (!c.contains(iterator.next())) {
						success = iterator.remove();
					}
				}
				return success;
			};

			AbstractCollection.prototype.containsAll = function (c) {
				if (!c) return false;
				if (c.size() > this.size()) return false;

				// check empty
				if (c.size()==0 && c.size()== this.size()) return true;

				iterator = c.iterator();
				while (iterator.hasNext()) {
					if (!this.contains(iterator.next())) return false;
				}
				return true;
			};

			AbstractCollection.prototype.removeAll = function (c) {
				try {
					var success = false;
					var iterator = c.iterator();

					while (iterator.hasNext()) {
						var o = iterator.next();
						success = this.remove(o);
					}
					//if (success) updateHashMap();
					return success;
				} catch (e) {
					if (!c instanceof ns['Collection']) throw ns['IllegalArgumentException'];
					else throw e;
				}
			};

			calledInit = true;
		}
		return myConstructor;
	}();

	// define interfaces we are implementing - this gets called before init()!
	f.implement(AbstractCollection, ns['Collection']);

	// register in the namespace
	ns['AbstractCollection'] = AbstractCollection;


	/**
	 *   AbstractSet - extends AbstractCollection
	 */
	var AbstractSet = function () {

		// private static variables
		var calledInit = false;

		var myConstructor = function (params) {

			var that = this || {};
			params = params || {};

			// this needs to be called before calling superclass constructor
			var _allowProtectedAccess = accessMatrix['AbstractSet'][this.getUID()];

			// apply instance methods and import protected scope if authorized
			var _protected = AbstractCollection.call(that, params);

			// private variables
			var _UID = Math.genUID();

			calledInit || init();

			if (_allowProtectedAccess) return _protected;
		};

		// public static descriptors, methods
		myConstructor.getType = function () { return  "AbstractSet"; };

		function init() {

			calledInit = true;
		}

		return myConstructor;

	}();

	// define interfaces we are implementing - this gets called before init()!
	f.extend(AbstractSet, AbstractCollection);
	f.implement(AbstractSet, ns['Set']); // we should be a type of Set

	// to allow it access to protected scope of AbstractCollection
	accessMatrix['AbstractCollection'][AbstractSet.prototype.getUID()] = true;

	// register in the namespace
	ns['AbstractSet'] = AbstractSet;


	var AbstractList = function () {

		// private static variables
		var calledInit = false;

		// private static

		/**
		 *  List Iterator implementation
		 *
		 */

		var ListIterator = function () {

			var myConstructor = function (params) {
				params = params || {};
				var _arr = params.parent.toArray();
				var _currPos = params.index? params.index-1 : -1;
				var _flip = false;

				var indexes =[];
				for (var i in _arr) {
					if (!isNaN(i)) indexes.push(i);
				}

				this.hasNext = function () {
					return indexes[_currPos+1]!==undefined;
				};

				this.next = function () {
					var o = _arr[indexes[++_currPos]];
					_flip = true;
					if (o === undefined) {
						throw ns['NoSuchElementException'];
					}
					return o;
				};

				this.remove = function () {
					if (_currPos == -1 || !_flip) throw ns['IllegalStateException'];
					_flip = false;
					return params.parent.remove(_arr[indexes[_currPos]]);
				};

				this.previous = function () {
					if (_currPos<=0) throw ns['NoSuchElementException'];
					_flip = true;
					var o = _arr[indexes[--_currPos]];
					if (o === undefined) {
						throw ns['NoSuchElementException'];
					}
					return o;
				};


				this.add = function (o) {
					params.parent.add({element: o, index: _currPos<=0 ? 0: _currPos-1});
					_flip = false;
				};

				this.hasPrevious = function () {
					return _arr[indexes[_currPos-1]]!==undefined;
				};

				this.nextIndex = function () {
					if (_currPos+1 >= _arr.length) return _arr.length;
					else return _currPos+1;
				};

				this.previousIndex = function () {
					if (_currPos<=0) return -1;
					else return _currPos-1;
				};

				this.set = function(o) {
					if (!_flip) throw ns['IllegalStateException'];
					var index = _currPos<=0 ? 0 : _currPos;
					params.parent.add({element:o, index: index});
				};

			};

			return myConstructor;
		}();

		f.implement(ListIterator, ns['ListIterator']);


		var myConstructor = function (params) {

			var that = this || {};
			params = params || {};

			// this needs to be called before calling superclass constructor
			var _allowProtectedAccess = accessMatrix['AbstractList'][this.getUID()];

			// apply instance methods and import protected scope if authorized
			var _protected = AbstractCollection.call(that, params);

			// private variables
			var _UID = Math.genUID();

			//private functions
			function addToHashMap (o, index) {
				var hashCode = f.defaultHashCode(o);
				var j = _protected.hashMap[hashCode];
				if(!j) {
					_protected.hashMap[hashCode] = index;
				} else if (j instanceof Array) {
					// insert so that the array stays sorted
					var found = false;
					for (var i=0; i< j.length; i++) {
						if (j[i] < index) {
							j.splice(i,0, index);
							found=true;
							break;
						}
					}
					if (!found) j.push(index);
				} else {
					_protected.hashMap[hashCode] = [j, index];
				}
			}

			function removeFromHashMap (o, index) {
				f.validateParams({index:index, element: o}, {
					index: {
						required: false,
						type: "positiveInteger"
					},
					element: {
						required: true,
						type: "any"
					}
				});
				var hashCode = f.defaultHashCode(o);

				var j = _protected.hashMap[hashCode];
				if (!j) return;
				else if (j instanceof Array && index) {
					for (var i=0; i< j.length; i++) {
						if (j[i] == index) {
							j.splice(i,1);
							break;
						}
					}
				} else {
					delete _protected.hashMap[hashCode];
				}
			}

			function updateHashMap (index, offset) {
				var hashMap = _protected.hashMap;

				for (var i in hashMap) {
					if(isNaN(i)) continue;
					var j = hashMap[i];
					if (j instanceof Array) {
						for (var z=0; z < j.length; z++) {
							if (j[z] > index) j[z] += offset;
						}
					} else {
						if (j > index) hashMap[i] = j + offset;
					}
				}
			}

			// export private function to protected object
			_protected.updateHashMap = updateHashMap;
			_protected.removeFromHashMap = removeFromHashMap;
			_protected.addToHashMap = addToHashMap;

			this.toArray = function () {
				return [].concat([], _protected.arr);
			};

			this.indexOf = function (o) {
				f.validateParams({object:o}, {object: { required: true, type: "any"} });
				var index = _protected.hashMap[f.defaultHashCode(o)];
				if (!index) return -1;
				else if(index instanceof Array) return index[0];
				else return index;
			};

			this.lastIndexOf = function (o) {
				f.validateParams({object:o}, {object: { required: true, type: "any"} });
				var index = _protected.hashMap[f.defaultHashCode(o)];
				if (!index) return -1;
				else if(index instanceof Array) return index[index.length-1];
				else return index;
			};

			this.set = function () {
				throw ns['UnsupportedOperationException'];
			};

			this.remove = function () {
				throw ns['UnsupportedOperationException'];
			};

			this.add = function () {
				throw ns['UnsupportedOperationException'];
			};


			calledInit || init();

			if (_allowProtectedAccess) return _protected;
		};

		// public static descriptors, methods
		myConstructor.getType = function () { return  "AbstractList"; };

		function init() {

			AbstractList.prototype.listIterator = function(index) {
				f.validateParams({index: index}, { index: { required: false, type: "positiveInteger"} });
				if (index!==undefined && (index < 0 || index >= this.size() || this.isEmpty())) throw ns['IndexOutOfBoundsException'];
				return new ListIterator({parent:this, index: index});
			};

			AbstractList.prototype.addAll = function (index, c) {
				if(arguments.length==1 || c === undefined ){
					c = index;
					index = undefined;
				}
				f.validateParams({collection: c, index: index}, {
					collection: {
						required: true,
						type: "ns.Collection"
					},
					index: {
						required: false,
						type: "positiveInteger"
					}
				});

				var i=c.iterator();
				var success = false;

				while (i.hasNext()) {
					success = this.add(index, i.next());
					if (index!==undefined) index++;
				}
				return success;
			};

			AbstractList.prototype.removeRange = function (from, to) {
				f.validateParams({fromElement: from, toElement: to}, {
					fromElement: {
						required: true,
						type: "positiveInteger"
					},
					toElement: {
						required: true,
						type: "positiveInteger"
					}
				});

				if(from == to) return;

				var i = this.listIterator(from);
				while (i.hasNext() && i.nextIndex() < to) {
					i.next() && i.remove();
				}

			};

			AbstractList.prototype.iterator = function () {
				var i = this.listIterator();

				//mask methods that are not part of iterator interface
				for (prop in i) {
					if(prop!=="next" && prop!=="hasNext" && prop!=="remove") delete i[prop];
				}
				return i;
			}

			AbstractList.prototype.subList = function(from, to) {
				f.validateParams({fromElement: from, toElement: to}, {
					fromElement: {
						required: true,
						type: "positiveInteger"
					},
					toElement: {
						required: true,
						type: "positiveInteger"
					}
				});

				return f.genSubSet(this, from, to);
			}

			calledInit = true;
		}

		return myConstructor;
	}();

	// define interfaces we are implementing - this gets called before init()!
	f.extend(AbstractList, AbstractCollection);
	f.implement(AbstractList, ns['List']); // we should be a type of List

	// to allow it access to protected scope of AbstractCollection
	accessMatrix['AbstractCollection'][AbstractList.prototype.getUID()] = true;

	// register in the namespace
	ns['AbstractList'] = AbstractList;



	return accessMatrix;
}