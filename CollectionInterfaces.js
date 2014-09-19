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
function loadCollectionInterfaces(namespace) {

  // load common
  loadFramework(namespace);

  //shortcuts
  var ns = namespace;
  var f = ns['framework'];

  /**
   *
   *     Errors
   *
   */
  var UnimplementedMethodError = {
    message: "No implementation found for this method. Please override in the subclass.",
    name: "UnimplementedMethodError"
  };

  var UnsupportedOperationException = {
    message: "This operation is not supported in the objects of this type",
    name: "UnsupportedOperationException"
  }

  var NoSuchElementException = {
    message: "Element does not exist because this collection is empty.",
    name: "NoSuchElementException"
  };

  var ClassCastException = {
    message: "Invalid object type.",
    name: "ClassCastException"
  };

  var IllegalStateException = {
    message: "Illegal state exception. Method called at inappropriate time.",
    name: "IllegalStateException"
  };

  var IllegalArgumentException = {
    message: "Invalid argument.",
    name: "IllegalArgumentException"
  };

  var AbstractClassInstantiationException = {
    message: "Invalid constructor call - cannont directly instantiate an abstract class",
    name: "AbstractClassInstantiationException"
  };

  var IndexOutOfBoundsException = {
    message: "Index is out of bounds",
    name: "IndexOutOfBoundsException"
  };

  var functionStub = function () { throw UnimplementedMethodError; };

  //export
  ns['UnimplementedMethodError'] = UnimplementedMethodError;
  ns['UnsupportedOperationException'] = UnsupportedOperationException;
  ns['NoSuchElementException'] = NoSuchElementException;
  ns['ClassCastException'] = ClassCastException;
  ns['IllegalStateException'] = IllegalStateException;
  ns['IllegalArgumentException'] = IllegalArgumentException;
  ns['AbstractClassInstantiationException'] = AbstractClassInstantiationException;
  ns['IndexOutOfBoundsException'] = IndexOutOfBoundsException;

  ns['functionStub'] = functionStub;

  /*******************************************************************************************************************
  *
  *      Collections API Interfaces
  *
  *
  *******************************************************************************************************************/

  /**
   *
   *  Iterator interface
   *
   */
  var Iterator = function () {

    // private static variables
    var calledInit = false;

    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    };

    // public static descriptors, methods
    myConstructor.getType = function () { return  "Iterator"; };

    function init() {
      Iterator.prototype.hasNext = functionStub;
      Iterator.prototype.next = functionStub;
      Iterator.prototype.remove = functionStub;

      calledInit = true;
    }

    return myConstructor;

  }();

  // register in the namespace
  ns['Iterator'] = Iterator;

  /**
   *
   *  Comparator interface
   *
   */
  var Comparator = function () {

    // private static variables
    var calledInit = false;

    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    };

    // public static descriptors, methods
    myConstructor.getType = function () { return  "Comparator"; };

    function init() {
      Comparator.prototype.equals = function ( comparator ) {
        if (!comparator instanceof Comparator) return false;
        return f.defaultCompare(this, comparator)==0 ? true : false;
      };
      Comparator.prototype.compare = functionStub;

      calledInit = true;
    }

    return myConstructor;

  }();

  // register in the namespace
  ns['Comparator'] = Comparator;


  /**
   *  Iterable interface
   *
   */
   var Iterable = function () {

     // private static variables
    var calledInit = false;

     // constructor = gets called only when function is invoked with "new" keyword
    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    }; // end internal constructor function

    // public static descriptors, methods
    myConstructor.getType = function () { return  "Iterable"; };

    // define interface methods here using prototype-based inheritance
    function init() {
      Iterable.prototype.iterator = function () {
        return new Iterator(); // also an interface that must be implemented before usage
      };

      calledInit = true;
    }

    return myConstructor;

   }();
   ns['Iterable'] = Iterable;


  /**
   *    Collection interface
   */
  var Collection = function () {

    // private static variables
    var calledInit = false;

    // constructor = gets called only when function is invoked with "new" keyword
    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    }; // end internal constructor function

    // public static descriptors, methods
    myConstructor.getType = function () { return  "Collection"; };

    // define interface methods here using prototype-based inheritance
    function init() {
      Collection.prototype.addAll = functionStub;
      Collection.prototype.equals = functionStub;
      Collection.prototype.isEmpty = functionStub;
      Collection.prototype.contains = functionStub;
      Collection.prototype.containsAll = functionStub;
      Collection.prototype.removeAll = functionStub;
      Collection.prototype.retainAll = functionStub;
      Collection.prototype.toArray = functionStub;
      Collection.prototype.size = functionStub;
      Collection.prototype.add = functionStub;
      Collection.prototype.clear = functionStub;
      Collection.prototype.remove = functionStub;

      calledInit = true;
    }
    return myConstructor;
  }();

  // define interfaces we are implementing - this gets called before init()!
  f.implement(Collection, Iterable);

  // register in the namespace
  ns['Collection'] = Collection;



  /**
   *  Set interface - a collection with no duplicate elements
   */
  var Set = function () {

    // private static variables
    var calledInit = false;

    // constructor = gets called only when invoked with "new" keyword
    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    }; // end internal constructor function

    // public static descriptors, methods
    myConstructor.getType = function () { return  "Set"; };

    // define interface methods here using prototype-based inheritance
    function init() {

      calledInit = true;
    }
    return myConstructor;
  }();

  // define interfaces we are implementing - this gets called before init()!
  f.implement(Set, Collection);

  // register in the namespace
  ns['Set'] = Set;


  /**
   *  SortedSet interface - an ordered Set
   */
  var SortedSet = function () {

    // private static variables
    var calledInit = false;

    // constructor = gets called only when invoked with "new" keyword
    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    }; // end internal constructor function

    // public static descriptors, methods
    myConstructor.getType = function () { return  "SortedSet"; };

    // define interface methods here using prototype-based inheritance
    function init() {
      SortedSet.prototype.comparator = functionStub;
      SortedSet.prototype.first = functionStub;
      SortedSet.prototype.last = functionStub;
      SortedSet.prototype.headSet = functionStub;
      SortedSet.prototype.tailSet = functionStub;
      SortedSet.prototype.subSet = functionStub;

      calledInit = true;
    }
    return myConstructor;
  }();

  // define interfaces we are implementing - this gets called before init()!
  f.implement(SortedSet, Set);

  // register in the namespace
  ns['SortedSet'] = SortedSet;


  /**
   *  NavigableSet interface - an ordered navigable set
   */
  var NavigableSet = function () {

    // private static variables
    var calledInit = false;

    // constructor = gets called only when invoked with "new" keyword
    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    }; // end internal constructor function

    // public static descriptors, methods
    myConstructor.getType = function () { return  "NavigableSet"; };

    // define interface methods here using prototype-based inheritance
    function init() {
      NavigableSet.prototype.ceiling = functionStub;
      NavigableSet.prototype.descendingIterator = functionStub;
      NavigableSet.prototype.descendingSet = functionStub;
      NavigableSet.prototype.floor = functionStub;
      NavigableSet.prototype.higher = functionStub;
      NavigableSet.prototype.lower = functionStub;
      NavigableSet.prototype.pollFirst = functionStub;
      NavigableSet.prototype.pollLast = functionStub;

      calledInit = true;
    }
    return myConstructor;
  }();

  // define interfaces we are implementing - this gets called before init()!
  f.implement(NavigableSet, SortedSet);

  // register in the namespace
  ns['NavigableSet'] = NavigableSet;


  /**
   * List interface - a collection of sequentially ordered elements (aka sorted by insertion order)
   *
   *
   */
  var List = function () {
    // private static variables
    var calledInit = false;

    // constructor = gets called only when invoked with "new" keyword
    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    }; // end internal constructor function

    // public static descriptors, methods
    myConstructor.getType = function () { return  "List"; };

    // define interface methods here using prototype-based inheritance
    function init() {
      List.prototype.get = functionStub;
      List.prototype.indexOf = functionStub;
      List.prototype.lastIndexOf = functionStub;
      List.prototype.listIterator = functionStub;
      List.prototype.set = functionStub;
      List.prototype.subList = functionStub;

      calledInit = true;
    }
    return myConstructor;

  }();

  // define interfaces we are implementing - this gets called before init()!
  f.implement(List, Collection);

  // register in the namespace
  ns['List'] = List;

  /**
   *
   *  ListIterator interface
   *
   */
  var ListIterator = function () {

    // private static variables
    var calledInit = false;

    var myConstructor = function () {
      this.hashCode=Object.prototype.hashCode;
      calledInit || init();
    };

    // public static descriptors, methods
    myConstructor.getType = function () { return  "Iterator"; };

    function init() {
      ListIterator.prototype.hasPrevious = functionStub;
      ListIterator.prototype.previous = functionStub;
      ListIterator.prototype.set = functionStub;
      ListIterator.prototype.previousIndex = functionStub;
      ListIterator.prototype.nextIndex = functionStub;
      ListIterator.prototype.add = functionStub;

      calledInit = true;
    }

    return myConstructor;

  }();

  // define interfaces we are implementing - this gets called before init()!
  f.implement(ListIterator, List);

  // register in the namespace
  ns['ListIterator'] = ListIterator;

}