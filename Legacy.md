Update v 0.3
========
Finish the model for storing data. Now as the capability for on click submit and on change submit. Also allows for post and get methods. The reason that all of the attributes contain a "s" is because they allow for a comma, separted array to be passed. This allows for one html item to submit to multiple places.<br>

New attributes and renamed:
---------------------------
<br>
<strong>New:</strong><br>
*events - defines whether it is triggered onclick ("click") or onchange("change")<br>
*methods - defines whether it is a "get" or "post" method.<br>
<br>
<strong>Renamed:</strong><br>
*types - this is the type of the data attribute form, "ajax" or "form"<br>
*befores - functions that run before a submit<br>
*afters - functions that run after a submit<br>
*actions - location to post the data<br>
*forms- the Form's or Forms' name<br>
*targets - the target to update<br>

Things to do:
-------------
<br>
*Run before and after methods<br>
*Error handling

jsFiddle Here: http://jsfiddle.net/jpking5191/e3Z5K/5/


Update v 0.2
========
It is now completely dynamic. This introduces the new namespace perForm. Also finish encapsulating running a function before and after a submit.<br>
New attributes and renamed:<br>
*type - this is the type of the data attribute form, "AjaxUpdate" or "Form"<br>
*bFunction - functions that run before a submit<br>
*aFunction - functions that run after a submit<br>
*location - location to post the data<br>
*form - the Form's name<br>
*target - the target to update<br>