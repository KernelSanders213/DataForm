DataForm
========

jQuery submitting of a form through just data attributes

Update
========
It is now completely dynamic. This introduces the new namespace perForm. Also finish encapsulating running a function before and after a submit.
New attributes and renamed:
*type - this is the type of the data attribute form, "AjaxUpdate" or "Form"
*bFunction - functions that run before a submit
*aFunction - functions that run after a submit
*location - location to post the data
*form - the Form's name
*target - the target to update
