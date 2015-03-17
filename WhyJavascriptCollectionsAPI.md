# Introduction #

The days of the "Wild West" of web programming seem to have faded into the past, and those of us who are in the business of maintaining and refactoring code, will surely say, "Good riddance!". Those were truly the best of times and the worst of times...

These days very few professional JS developers develop application in a vacuum. Most of us live by the the tried and true adage - "good programmers write great code and great programmers steal good programmers' code", tongue in cheek, of course.

So we use frameworks - ExtJS, jQuery, Prototype, dojo, name your own poison. Most of these frameworks focus on Javascript interacting with DOM, providing APIs for cross-browser DOM manipulation, event handling, etc. A few focus on developing core JS language features and toolkits.

The purpose of this site and distributed code is to focus on the core JS features and toolkits, and more specifically on developing a Collections API, similar (in fact, mostly parallel) to the Java Collections API.


# Details #

As a bit of background into how this rather obvious idea (why hasn't anyone implemented this yet?) took hold of my prefrontal cortex, I was perusing various JS inheritance models and really could not "feel" any of them. I originally was a big practitioner of Doug Crockford "module" pattern. However, after being involved in an enterprise project that utilized ExtJS (a framework that almost exclusively relies on this pattern), and seeing some huge memory issues with it, I started looking for something a bit more performant, and at the same time elegant, consistent and (is it too much to ask???) reminding one of classical OO usage.

As I could not find any one method that suited all of these criteria, I merged what I considered the best of the ideas I'd seen into my own JS OO pattern. To test out the robustness of the code, I decided to undertake something small... like Collections API :). And this is how this project was born.

Project Goals Summary

  * Provide fully featured OO patterns that support standard features of polymorphism, encapsulation and inheritance
  * Give developers abstractions they can use to quickly develop OO patterns
  * Provide usage alternatives for low level "tweaking" if needed
  * Develop Collections API that parallels standard implementations of Java Collections API - down to identical object hierarchies, exceptions and performance metrics
  * Develop classes that are both highly usable, extensible and easily infused into other applications
  * Provide guarantee of baseline functionality in the form of unit tests using standard testing framework (jsUnit)

Supported OO features

  * Interfaces - objects with stub methods but no implementation
  * TODO: ability to implement multiple interfaces so that typeof operator return true when compared to any of the implemented interfaces
  * Abstract classes that implement some interface and/or extend another abstract class
  * Public static methods, variables
  * Private static methods, variables
  * Private instance methods and variables
  * Protected instance methods and variables

More info here - http://sites.google.com/site/extremejavascript/documentation