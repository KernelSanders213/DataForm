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
		ids:[],
		events: [],
		actions: [],
		methods: [],
		types: [],
		targets: []
		befores: [],
		afters: []
	}	
	//The perform collection to hold all of the models for the current page
	collection: [],
	current: {},
	parse: function () {	
		$('form[data-perform-form]').each(function () { 
			var model = new perform.model;
			var $this = $(this);
			model.name = getFormName($this);
			model.submits = getSubmits($this);
			perform.collection.push(model);
		});
		perform.binder();
	},
	binder: function () {
		for(var i = 0; i < perform.collection.length; i++) {
			perform.current = perform.collection[i];
			for(var j = 0; j < perform.current.submits.length; j++) {
				perform.bind(perform.current.submits[j]);
			}
		}
	},
	bind: function (item) {
		for(var q = 0; q < item.events.length; q++) {
			$(ids[q]).off(item.events[q]).on(item.events[q], function () {
				var stuff = $.ajax({
					url: item.actions[q],
					type: item.methods[q]
				});
				$(item.targets[q]).html(stuff);
			}
		}
	},
	reset: function () {
		perform.collection = [];
	},
	getFormName: function (form) {
		return form.attr('data-perform-form');
	},
	getSubmits: function (form) {
		var submits = [];
		$('[data-perform-events]').each(function () {
			if ($(this).attr('data-perform-form') == form.name){
				var submit = new perform.submit;
				submit.events = perform.getEvents($(this));
				submit.actions = perform.getActions($(this));
				submit.methods = perform.getMethods($(this));
				submit.types = perfom.getTypes($(this));
				submit.targets = perform.getTargets($(this));
				submit.befores = perform.getBefores($(this));
				submit.afters = perform.getAfters($(this));
				submits.push(submit);
			}
		});
		return submits;
	},
	getEvents: function (submit) {
		return submit.attr('data-perform-events').split(',');	
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

perform.parse();



$('[data-perForm-type]').on()(function () {
    if ($(this).attr('data-perForm-bFunction')) window[$(this).attr('data-perForm-bFunction')]();
    if ($(this).attr('data-perForm-type') == "AjaxUpdate") {
        $("#" + $(this).attr('data-perForm-target')).load($(this).attr('data-perForm-location'), $("#" + $(this).attr('data-perForm-form')).serializeArray());
    }
    if ($(this).attr('data-perForm-type') == "Form") {
        $("#" + $(this).attr('data-perForm-form')).submit();
	}
    if ($(this).attr('data-perForm-aFunction')) window[$(this).attr('data-perForm-aFunction')]();
});
