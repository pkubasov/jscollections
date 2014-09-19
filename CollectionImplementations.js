/**
    This file is part of JS Collections API.

    JS Collections API is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JS Collections API is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with JS Collections API.  If not, see <http://www.gnu.org/licenses/>.

    Author: Philip Kubasov
    Date: July 23, 2010

*/
function loadCollectionImplementations(namespace) {
  var ns = eval(namespace) || window; // default namespace

  // this is used for "protected" access to vars from superclasses
  var accessMatrix = loadCollectionAbstractClasses(ns);

  //shortcuts
  var f = ns['framework'];


  /**
   * TreeSet - an implementation of a sorted set
   *
   *
   */
  var TreeSet = function () {

    /**
        private static variables
    */
    var calledInit = false;

    var TreeSetIterator = function () {

      /**
       * TreeSetIterator constructor
       * @param {Object} params Parent object that this iterator will iterate over
       *
       */
      var myConstructor = function (params) {

        params = params || {};
        var _arr = params.parent.toArray();
        var _currPos = -1;
        var _flip = false;

        var indexes =[];
        for (var i in _arr) {
          if (!isNaN(i)) indexes.push(i);
        }

        /**
         * Returns true if the iteration has more elements.
         * (In other words, returns true if next would return an element rather than throwing an exception.)
         * @return true if the iteration has more elements, otherwise false
         *
         */
        this.hasNext = function () {
          return indexes[_currPos+1]!==undefined;
        };

        /**
         * Returns the next element in the iteration.
         * @return next element in the iteration
         * @throws NoSuchElementException iteration has no more elements
         */
        this.next = function () {
          var o = _arr[indexes[++_currPos]];
          _flip = true;
          if (o === undefined) {
            throw ns['NoSuchElementException'];
          }
          return o;
        };

        /**
         * Removes from the underlying collection the last element returned by the iterator.
         * @throws IllegalStateException if the next method has not yet been called,
         * or the remove method has already been called after the last call to the next method.
         */
        this.remove = function () {
           if (_currPos == -1 | !_flip) throw ns['IllegalStateException'];
           _flip = false;
           return params.parent.remove(_arr[indexes[_currPos]]);
        };
      };
      return myConstructor;
    }();

    // make a type of Iterator
    f.implement(TreeSetIterator, ns['Iterator']);


    /**
     * TreeSet constructor
     * The following overloaded constructors are available:
     *   1) null params - default -->  new TreeSet()
     *  2) comparator       -->  new TreeSet( comparator ) - sets comparator to passed in value
     *      and/or #3
     *  3) collection       -->  new TreeSet( collection )
     *    or #4 ( in which case the comparator argument is ignored, at it uses the comparator from the passed in sortedSet
     *  4) sortedSet       -->  new TreeSet( sortedSet  )
     *
     * @params params Parameter object containing optional comparator/collection objects used to initialize TreeSet
     */
    var myConstructor = function (params) {

      var that = this || {};
      params = params || {};

      // apply instance methods and import protected scope
      var _protected = ns['AbstractSet'].call(that, params);

      /**
          private variables
       */
      var _UID = Math.genUID();
      var _arrayCopy = [];
      var _comparator;
      var _hashCode = "|TreeSet:" + _UID + ":" + f.arrayHashCode(_protected.arr, true);
      var _ST = 100; // sort index threshold for merge sorts
      var _SLT = 0.5; // sort load threshold - lower
      var _SLTU = 0.90 // sort load threshold - upper
      var _lastSortedIndex = 0;  // used to partition sorted part of the array from non-sorted

      if(params.collection && params.sortedSet) throw ns['IllegalArgumentException'];
      if(params.collection) {
        _protected.arr = params.collection.toArray();
      }
      if (!params.sortedSet) {
        if (params.comparator && !params.comparator instanceof ct.Comparator) {
          throw ns['ClassCastException'];
        } else if (params.comparator) {
          _comparator = params.comparator;
        } else {
          _comparator = new ns['Comparator'];
          _comparator.compare =  f.defaultCompare;
        }
      } else {
        _protected.arr = params.sortedSet.toArray();
        _lastSortedIndex=_protected.arr.length-1;
        _comparator = params.sortedSet.comparator();
      }
      if  (_protected.arr.length) {
        updateSortAndHash();
        _arrayCopy = _protected.arr.concat([]);
        _protected.dirty = false;
        _protected.size = _protected.arr.length;
      }


      /**
           Public API that needs to directly access private variables
              (thus cannot be combined with use of prototype chain or "this",
           since either of the two can be publicly accessible
       */

      /**
       * Returns an array containing all of the elements in this collection.
       * This array is not connected to the underlying collection, so the caller is free
       * to modify it.
       * @return an array containing all of the elements in this collection
       *
       */
      this.toArray = function () {
        if (!_protected.dirty && _protected.arr.length == _arrayCopy.length) return _arrayCopy;
        updateSortAndHash();
        _arrayCopy = _protected.arr.concat([]);
        _protected.dirty = false;
        return _arrayCopy;
      };

      /**
       * Adds the specified element to this set if it is not already present.
       * @param {Object} o element to be added to this set
       * @returns true if this set did not already contain the specified element
       * @throws ClassCastException - if the specified object cannot be compared with the elements currently in this set
       * @throws NullPointerException  if the specified element is null and this set uses natural ordering, or its comparator does not permit null elements
       *
       */
      this.add = function (o) {
        if (_protected.objTypeChecker && !_protected.objTypeChecker(o)) {
          throw ns['ClassCastException'];
        }
        if (!that.contains(o)) {
          _protected.dirty = true;
          _protected.arr.push(o);
          _protected.hashMap[f.defaultHashCode(o)] = _protected.size++;

          if(_protected.size > _ST && _lastSortedIndex/_protected.size > _SLTU  ) {
            // time to sort
            updateSortAndHash();
          }
          return true;
        }
        return false;
      };

      /**
       *
       *
       */
      this.comparator = function () { return _comparator; };

      this.size = function () {
        //return  this.toArray().length;
        return _protected.size;
      };

      this.hashCode = function () {
        if (_protected.dirty) {
          _hashCode = "|TreeSet: " + _UID + ":" + f.arrayHashCode(this.toArray(), true);
        }
        return _hashCode;
      };

      this.first = function () {
        if (this.isEmpty()) {
          throw ns['NoSuchElementException'];
        } else {
          if (!_protected.dirty) {
            return _protected.arr[0];
          } else {
            return that.toArray()[0];
          }
        }
      };

      this.last = function () {
        if (this.isEmpty()) {
          throw ns['NoSuchElementException'];
        } else {
          if (!_protected.dirty) {
            return _protected.arr[this.size()-1];
          } else {
            return that.toArray()[this.size()-1];
          }
        }
      };


      this.tailSet = function (fromElement) {
        return f.genSubSet(that, fromElement, null);
      };

      this.headSet = function (toElement) {
        return f.genSubSet(that, null, toElement);
      };

      this.subSet = function (fromElement, toElement) {
        return f.genSubSet(that, fromElement, toElement);
      };

      this.indexOf = function (o) {
        if(!this.contains(o)) return -1;
        return _protected.hashMap[f.defaultHashCode(o)];
      };

      calledInit || init();


      // private inner constructor functions

      function updateSortAndHash() {
        // for faster access
        var fn = f.defaultHashCode;
        var arrayLength = _protected.arr.length;
        var arr = _protected.arr;
        var hashMap  = _protected.hashMap;

        if (_lastSortedIndex >  _protected.size) _lastSortedIndex =0;
        // resort the whole thing if the sorted portion is small
        if (_lastSortedIndex < _ST  ||  arrayLength==0 || _lastSortedIndex/arrayLength < _SLT ) {
          arr.sort( _comparator.compare );
          for ( var i=0; i< arrayLength; i++) {
            hashMap[fn(arr[i])] = i;
          }
        } else {
          f.sortAndMerge(arr, _lastSortedIndex, _comparator.compare, hashMap);
        }
        _lastSortedIndex = arrayLength-1;
      }

    };

    // public static descriptors, methods
    myConstructor.getType = function () { return  "TreeSet"; };


    function init() {

      TreeSet.prototype.toString = function() {
              var out = [];

              var i = this.iterator();
              while (i.hasNext()) {
                var o = i.next();
                out.push(Object.prototype.toString.call(o));
              }
              return "[" + out.join(",") + "]";

      };

      TreeSet.prototype.clone = function() {
        return new TreeSet({collection: this});
      }

      TreeSet.prototype.iterator = function () {
        var _iterator = new TreeSetIterator({parent: this});
        return _iterator;
      };

      TreeSet.prototype.ceiling = function (o) {
         var compareFn = this.comparator().compare;
         var result = f.binarySearchNearestNeighbor(this.toArray(), o, compareFn, true);
         if (result.exactMatch) return result.exactMatch;
         else if (compareFn(result.neighbor, this.last() == 0)) return null;
         else return result.neighbor;
      };

      TreeSet.prototype.descendingIterator =  function () {
        var DescendingIterator = function (params) {
          var _arr = [].concat(params.parent.toArray(), []).reverse();
          var _currPos = -1;
          var _flip = false;

          var indexes =[];
          for (var i in _arr) isNaN(i)? void(0) : indexes.push(i);

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
        };
        DescendingIterator.prototype = new TreeSetIterator({parent: this});

        return new DescendingIterator({parent:this});

      };

      TreeSet.prototype.descendingSet =  function () {
        var DescendingSet = function (params) {
          this.toArray = function () {
            return [].concat(params.parent.toArray(), []).reverse();
          };

          this.first = function () { return params.parent.last(); };

          this.last = function () { return params.parent.first(); };

        };
        DescendingSet.prototype = this.subSet(0, this.size()-1);
        return new DescendingSet({parent: this });

      };

      TreeSet.prototype.floor =  function (o) {
        var compareFn = this.comparator().compare;
        var result = f.binarySearchNearestNeighbor(this.toArray(), o, compareFn, false);
        if (result.exactMatch) return result.exactMatch;
        else if (compareFn(result.neighbor, this.first() == 0)) return null;
        else return result.neighbor;
      };

      TreeSet.prototype.higher =  function (o) {
        var compareFn = this.comparator().compare;
        var result = f.binarySearchNearestNeighbor(this.toArray(), o, compareFn, true);
        if (compareFn(result.neighbor, this.last() == 0)) return null;
        else return result.neighbor;
      };

      TreeSet.prototype.lower =  function (o) {
        var compareFn = this.comparator().compare;
        var result = f.binarySearchNearestNeighbor(this.toArray(), o, compareFn, false);
        if (compareFn(result.neighbor, this.first() == 0)) return null;
        else return result.neighbor;
      };

      TreeSet.prototype.pollFirst =  function () {
        if (this.isEmpty()) return null;
        var o = this.first();
        this.remove(o);
        return o;
      };

      TreeSet.prototype.pollLast =  function () {
        if (this.isEmpty()) return null;
        var o = this.last();
        this.remove(o);
        return o;
      };

      calledInit = true;
    }

    return myConstructor;

  }();

  // define interfaces we are implementing - this gets called before init()!
  f.extend(TreeSet, ns['AbstractSet']);
  f.implement(TreeSet, ns['NavigableSet']); // we should be a type of NavigableSet

  // to allow it access to protected scope of AbstractCollection
  accessMatrix['AbstractSet'][TreeSet.prototype.getUID()] = true;
  accessMatrix['AbstractCollection'][TreeSet.prototype.getUID()] = true;

  // register in the namespace
  ns['TreeSet'] = TreeSet;


  var ArrayList = function() {

    var calledInit = false;

    var myConstructor = function (params) {

      var that = this || {};
      params = params || {};

      // apply instance methods and import protected scope
      var _protected = ns['AbstractList'].call(that, params);

      f.validateParams(params, {
        collection: {
          required: false,
          type: "ns['Collection']"
        }
      });

      if(params.collection) {
        _protected.arr = params.collection.toArray();
        _protected.size = _protected.arr.length;
      }

      /**
       * @params o Object to add to list
       * @params index Integer optional position where to insert new object
       * @return Boolean indicator whether operation succeeded
       *
       */
      this.add = function (index, o) {

        if(arguments.length==1 || o === undefined ){
          o = index;
          index=undefined;
        }

        f.validateParams({element:o, index: index}, {
          element: {
            required: true,
            type: "any"
          },
          index: {
            required: false,
            type: "positiveInteger"
          }
        });

        if (index!==undefined && (index < 0 || index >= this.size() || this.isEmpty())) throw ns['IndexOutOfBoundsException'];

        if (_protected.objTypeChecker && !_protected.objTypeChecker(o)) {
          throw ns['IllegalArgumentException'];
        }

        if (index === undefined) {
          _protected.arr.push(o);
        } else {
          _protected.arr.splice(index, 0, o);
        }
        _protected.size++;

        if(index===undefined) {
          index = _protected.size-1;
        }
        //_protected.addToHashMap(o, index);
        //_protected.updateHashMap(index+1, 1);
        _protected.dirty = true;
        return true;

      };

      this.set = function(index, o) {
        if(arguments.length==1){
          o = index;
          index=undefined;
        }
        f.validateParams({element:o, index: index}, {
          element: {
            required: true,
            type: "any"
          },
          index: {
            required: true,
            type: "positiveInteger"
          }
        });
        if (index >= that.size()) throw ns['IndexOutOfBoundsException'];

        var originalElement = _protected.arr[index];
        //_protected.removeFromHashMap(originalElement, index);
        //_protected.addToHashMap(o, index);
        _protected.arr[index] = o;
        _protected.dirty = originalElement == o;
        return originalElement;
      };

      this.get = function (index) {
        f.validateParams({index:index}, {index: {required: true, type: "positiveInteger"} });
        if (index >= that.size()) throw ns['IndexOutOfBoundsException'];
        else return _protected.arr[index];
      };

      this.size = function () { return _protected.size; };

      /**
       * this represents both versions of remove method for Lists - remove(int index) and remove(Object o)
       * since JS is not strongly typed there is no way to tell if "o" represent and index or an object, so hence need for isIndex flag
       *
       * @param o Object to remove or integer index
       * @param isIndex Boolean flag to indicate whether preceding param "o" is an object to remove or is numeric index of the object to remove
       *
       */
      this.remove = function (o, isIndex) {

        if (!isIndex) f.validateParams({element: o}, {element: {required: true, type: "any"} });
        else f.validateParams({element: o}, {element: {required: true, type: "positiveInteger"} });


        if (isIndex) index = o;
        else {
          var hashCode = f.defaultHashCode(o);
          for (var i=0; i< _protected.arr.length; i++) {
            if (f.defaultHashCode(_protected.arr[i]) == hashCode) {
              index = i;
              break;
            }
          }
        }

        if (index === undefined) return index;

        var removed =  _protected.arr.splice(index,1);

        //_protected.updateHashMap(index, -1);
        _protected.size--;
        _protected.dirty = true;
        if (isIndex) return removed[0];
        else return true;
      };

      calledInit || init();

    };

    // public static descriptors, methods
    myConstructor.getType = function () { return  "ArrayList"; };

    function init() {

      ArrayList.prototype.toString = function() {
              var out = [];

              var i = this.iterator();
              while (i.hasNext()) {
                var o = i.next();
                out.push(Object.prototype.toString.call(o));
              }
              return "[" + out.join(",") + "]";

      };

      ArrayList.prototype.clone = function() {
        return new ArrayList({collection: this});
      }

      calledInit = true;
    }

    return myConstructor;
  }();

  f.extend(ArrayList, ns['AbstractList']);
  f.implement(ArrayList, ns['List']);

  accessMatrix['AbstractCollection'][ArrayList.prototype.getUID()] = true;
  accessMatrix['AbstractList'][ArrayList.prototype.getUID()] = true;

  ns['ArrayList'] = ArrayList;

}