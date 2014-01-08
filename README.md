PerForm
========

jQuery submitting of a form, to any number of locations, remote and local, from any html element, any event, even from outside of the form.

Current Version 0.6 Beta
========
####Changes from 0.5:
Added ability to have on success functions and on error functions. Added ability to bypass form submit. If any before function returns false then it will not submit the form. Change the data attribute names of before and after functions to bfns and afns.

####Changes from 0.4:
Added the error logging. This provides more help when setting up the perform. Before and after functions are now working. There can be multiple functions for before and after each form submit, and each function can have multiple parameters.

####Changes from 0.3:
Added functionality to submit the form locally, as in passing the values of the form to a JavaScript function. Library is now fully functional except for the before and after method calls, which should be completed soon in a small update. The structure of the library has changed drastically, and many of the attributes have been completely repurposed. Please seen the new instructions below.

### What do I need?

The entire library is included in the perform.js file. Simply include the file in your `<head>`. jQuery is required! Tested with jQuery 1.8 and 1.10.1

### How to use

Mark each form that you would like to submit using the library with the following data-attribute:
```
data-perform-form="<form name>"
```

Use the following data-attrubutes on the items that you would like to submit forms with like a button, a dropdown list, a picture, or any other html element.

```
data-perform-events="<event1>[,<event2>, etc...]"
```
The jQuery events to bind the form submission to. This can be any event: click, hover, blur, change, or even custom events.

```
data-perform-actions="<action1>[,<action2>, etc...]"
```
The destination URLs or local JavaScript methods to submit the form values to.

```
data-perform-methods="<method1>[,<method2>, etc...]"
```
get, set, or local

```
data-perform-targets="<target1>[,<target2>, etc...]"
```
jQuery selector of targets to update with the return of remote submissions

```
data-perform-bfns="<function1>[;<function 2>; etc...](|<function1>[;<function 2>; etc...]| ect...)"
```
Names of JavaScript functions, these will be called before the form is submitted. Before functions also have the ability to stop a form from submitting if they return false.

```
data-perform-bparams="<param1(,param2, ect...)>[<param1(,param2, ect...)>](| ect...)"
```
Parameters for the functions that run before a submit.

```
data-perform-afns="<function1>[;<function 2>; etc...](|<function1>[;<function 2>; etc...]| ect...)"
```
Names of JavaScript functions, these will be called after the form is submitted.

```
data-perform-aparams="<param1(,param2, ect...)>[<param1(,param2, ect...)>](| ect...)"
```
Parameters for the functions that run after submit.

```
data-perform-sfns="<function1>[;<function 2>; etc...](|<function1>[;<function 2>; etc...]| ect...)"
```
Names of JavaScript functions, these will be called if the form submits successfully.

```
data-perform-sparams="<param1(,param2, ect...)>[<param1(,param2, ect...)>](| ect...)"
```
Parameters for the on successful submit functions.

```
data-perform-efns="<function1>[;<function 2>; etc...](|<function1>[;<function 2>; etc...]| ect...)"
```
Names of JavaScript functions, these will be called if there is an error when submitting the form.

```
data-perform-eparams="<param1(,param2, ect...)>[<param1(,param2, ect...)>](| ect...)"
```
Parameters for the functions that run when there is an error when submitting the form.

###Why is everything plural?

The library is made to be flexible, any number of forms can be submitted to any number or locations, on any number of events. The library assumes that ALL of the attributes will be present for each combination, and that they will ALL be in the same order. So the first form listed will be submitted on the first event listed to the first action listed, using the first method, and will update the first target. *(Local submissions do not update targets, but a value is required to keep everything in line.)*

###Example

```
<button type="button" 
    data-perform-formids="form1,form2" 
    data-perform-events="click,click" 
    data-perform-actions="http://example.com,example.process" 
    data-perform-methods="get,local"
    data-perform-targets="#update-div,none">Click Me</button>
```
When this button is clicked perform will submit `form1` to `http://example.com` via `get` and will replace the contents of `#update-div` with the returned data.

At the same time perform will submit the values of `form2` to the JavaScript method `example.process()` and will pass the values in as the first argument *(see below)* and also sets the context of `this` to the element that triggered the event. The target is set to `none` which effectively could be any value, as it is ignored, but still required as a placeholder. Imagine if these two combinations were reversed in order, then if the local combination did not have a placeholder, the remote combination would not have a target to update...

###Local

Consider the following form
```
<form data-perform-form="form2">
    <input type="text" name="name">
    <input type="number" name="age">
    <input type="tel" name="phone">
</form>
```
Now lets assume that this is submitted to the local method `example.process` from the above example. The values of the form are passed as an argument to the method.
```
var example = {
    process: function (request, target) {
        request.name //Contains the value of the textbox
        request.age  //Contains the value of the number box
        request.phone//Contains the value of the tel box
        target       //Contains the value that was entered into data-perform-targets for this combination
        this         //The <button> element
    }
};
```

###Issues or problems?
Please create a github issue on this repository, we'll be more than happy to help!!
