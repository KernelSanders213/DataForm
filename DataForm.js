/*****************************************
 * perForm - A multi-destination form
 *           submission jQuery library
 *           that allows the same form to
 *           be submitted to one or more
 *           targets at the same time,
 *           or select which target to
 *           submit to based which submit
 *           button was pressed
 *
 * Version:  0.2
 * By: Justin King and Scott Robinson
 *****************************************/

$(function {
	var perform = {
	//The perform model
	form: {
		name: "",
		submits: []
	},
	submit: {
		actions: [],
		methods: [],
		types: [],
		targets: []
		befores: [],
		afters: []
	}	
	//The perform collection to hold all of the models for the current page
	collection: [],
	parse: function () {	
		$('form[data-perform-form]').each(function () { 
			var model = new perform.model;
			var $this = $(this);
			model.name = getFormName($this);
			model.submits = getSubmits($this);
			perform.collection.push(model);
		});
	},
	reset: function () {
		perform.collection = [];
	},
	getFormName: function (form) {
		return form.attr('data-perform-form');
	},
	getSubmits: function (form) {
		var submits = [];
		form.find('[data-perform-action]').each(function () {
			var submit = new perform.submit;
			submit.actions = perform.getActions($(this));
			submit.methods = perform.getMethods($(this));
			submit.types = perfom.getTypes($(this));
			submit.targets = perform.getTargets($(this));
			submit.befores = perform.getBefores($(this));
			submit.afters = perform.getAfters($(this));
			submits.push(submit);
		});
		return submits;
	},
	getActions: function (submit) {
		return submit.attr('data-perform-actions').split(',');
	},
	getMethods: function (submit) {
		return submit.attr('data-perform-methods').split(',');
	},
	getTypes: function (submit) {
		return submit.attr('data-perform-types').split(',');
	},
	getTargets: function (submit) {
		return submit.attr('data-perform-targets').split(',');
	},
	getBefores: function (submit) {
		return submit.attr('data-perform-before').split(',');
	},
	getAfters: function (submit) {
		return submit.attr('data-performs-after').split(',');
	}
});	

$('[data-perForm-type]').change(function () {
    if ($(this).attr('data-perForm-bFunction')) window[$(this).attr('data-perForm-bFunction')]();
    if ($(this).attr('data-perForm-type') == "AjaxUpdate") {
        $("#" + $(this).attr('data-perForm-target')).load($(this).attr('data-perForm-location'), $("#" + $(this).attr('data-perForm-form')).serializeArray());
    }
    if ($(this).attr('data-perForm-type') == "Form") {
        $("#" + $(this).attr('data-perForm-form')).submit();
	}
    if ($(this).attr('data-perForm-aFunction')) window[$(this).attr('data-perForm-aFunction')]();
});
