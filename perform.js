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
 * Version:  0.4
 * By: Justin King and Scott Robinson
 *****************************************/
var perform = perform || {};

$(function () {
    "use strict";
    perform = {
        //The perform model
        model: {
            object: {},
            formids: [],
            events: [],
            actions: [],
            methods: [],
            targets: [],
            befores: [],
            afters: []
        },
        //The perform collection to hold all of the models for the current page
        collection: [],
        current: {},
        verbose: true,
        splitchar: ',',
        
        parse: function () {
            $('[data-perform-events]').each(function () {             
                var model = {
                    object : $(this),
                    formids : perform.getForms($(this)),
                    events : perform.getEvents($(this)),
                    actions : perform.getActions($(this)),
                    methods : perform.getMethods($(this)),
                    targets : perform.getTargets($(this)),
                    befores : perform.getBefores($(this)),
                    afters : perform.getAfters($(this))
                };
                if(perform.verbose) perform.errorCheck(model);
                perform.collection.push(model);
            });
            perform.binder();
        },
        binder: function () {
            for (var i = 0; i < perform.collection.length; i++) {
                perform.current = perform.collection[i];
                for (var q = 0; q < perform.current.events.length; q++) {
                    if(perform.current.methods[q] === "local") {
                        perform.bindLocal(perform.current, q, i);
                    } else {
                        perform.bindRemote(perform.current, q, i);
                    }
                }
            }
        },
        bindLocal: function (item, q, i) {
            //console.log("Binding " + item.formids[q] + " submission using " + item.object + " to " + item.actions[q] + " on " + item.events[q] + " via " + item.methods[q] + " using local binding."); 
            item.object.on(item.events[q], { model: item, q: q }, function (event) {  
                var array = $(event.data.model.formids[q]).serializeArray(), result = {}, i = 0;
                for(i = 0; i < array.length; i++) {
                    eval('result.' + array[i].name + ' = array[' + i + '].value;');
                }
                eval(event.data.model.actions[event.data.q]).call(this, result, event.data.model.targets[q]);
            });
        },
        bindRemote: function (item, q) {
            //console.log("Binding " + item.formids[q] + " submission " + item.object + " to " + item.actions[q] + " on " + item.events[q] + " via " + item.methods[q] + " using remote binding.");
            $(item.object).on(item.events[q], { model: item, q: q }, function (event) {
                $.ajax({
                    url: event.data.model.actions[q],
                    type: event.data.model.methods[q],
                    data: $(event.data.model.formids[q]).serializeArray(),
                    success: function (data, textStatus, jqXHR) {
                        $(item.targets[q]).html(data);
                    }
                });
            });

        },
        reset: function () {
            perform.collection = [];
        },
        getForms: function (submit) {
            var attr = submit.attr('data-perform-forms');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-forms attribute is present.");
            return attr ? attr.split(perform.splitchar) : [];
        },
        getEvents: function (submit) {
            var attr = submit.attr('data-perform-events');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-events attribute is present.");
            return attr ? attr.split(perform.splitchar) : [];
        },
        getActions: function (submit) {
            var attr = submit.attr('data-perform-actions');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-actions attribute is present.");
            return attr ? attr.split(perform.splitchar) : [];
        },
        getMethods: function (submit) {
            var attr = submit.attr('data-perform-methods');
           if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-methods attribute is present.");
            return attr ? attr.split(perform.splitchar) : [];
        },
        getTargets: function (submit) {
            var attr = submit.attr('data-perform-targets');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-targets attribute is present.");
            return attr ? attr.split(perform.splitchar) : [];
        },
        getBefores: function (submit) {
            return submit.attr('data-perform-befores') ? submit.attr('data-perform-befores').split(perform.splitchar) : undefined;
        },
        getAfters: function (submit) {
            return submit.attr('data-perform-afters') ? submit.attr('data-perform-afters').split(perform.splitchar) : undefined;
        },
        errorCheck: function(model) {
            var maxCount = 0;
            
            //Get the max amount of an array
            model.formids.length >= maxCount ? maxCount = model.formids.length: false;
            model.events.length >= maxCount ? maxCount = model.events.length: false;
            model.actions.length >= maxCount ? maxCount = model.actions.length: false;
            model.methods.length >= maxCount ? maxCount = model.methods.length: false;
            model.targets.length >= maxCount ? maxCount = model.targets.length: false;
            if(model.befores !== undefined) model.befores.length >= maxCount ? maxCount = model.befores.length: false;
            if(model.afters !== undefined) model.afters.length >= maxCount ? maxCount = model.afters.length: false;
            
            //Log the errors of the improper index count
            if (model.formids.length < maxCount) console.log("Invalid data-perform-forms index count: " + model.formids.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.events.length < maxCount) console.log("Invalid data-perform-events index count: " + model.events.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.actions.length < maxCount) console.log("Invalid data-perform-actions index count: " + model.actions.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.methods.length < maxCount) console.log("Invalid data-perform-methods index count: " + model.methods.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.targets.length < maxCount) console.log("Invalid data-perform-targets index count: " + model.targets.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.befores !== undefined && model.befores.length < maxCount) console.log("Invalid data-perform-befores index count: " + model.befores.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.afters !== undefined && model.afters.length < maxCount) console.log("Invalid data-perform-afters index count: " + model.afters.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
        }
    };

    perform.parse();
});
