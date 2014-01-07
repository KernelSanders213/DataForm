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
 * Version:  0.5
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
            beforeparams: [],
            afters: [],
            afterparams: [],
        },
        //The perform collection to hold all of the models for the current page
        collection: [],
        current: {},
        verbose: true,
        split: {
            main: '|',
            secondary: ';',
            tertiary: ',',
        },        
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
                    beforeparams : perform.getBeforeParams($(this)),
                    afters : perform.getAfters($(this)),
                    afterparams : perform.getAfterParams($(this)),
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
                //Run the before ajax call
                if (item.befores !== undefined) {
                    var bFunctions = item.befores[q].split(perform.split.secondary);
                    var bParams = item.beforeparams[q].split(perform.split.secondary);
                    for(var i in bFunctions){
                        var fn = bFunctions[i];
                        if (fn !== ''){
                            var params = bParams[i].split(perform.split.tertiary);
                            if (params === undefined || params == '') window[fn]();
                            else window[fn].apply(this, params);
                        }
                    }
                }
                $.ajax({
                    url: event.data.model.actions[q],
                    type: event.data.model.methods[q],
                    data: $(event.data.model.formids[q]).serializeArray(),
                    success: function (data, textStatus, jqXHR) {
                        $(item.targets[q]).html(data);
                    },
                    complete: function(){
                        //Run the after ajax call
                        if (item.afters !== undefined) {
                            var aFunctions = item.afters[q].split(perform.split.secondary);
                            var aParams = item.afterparams[q].split(perform.split.secondary);
                            for(var i in aFunctions){
                                var fn = aFunctions[i];
                                if (fn !== ''){
                                    var params = aParams[i].split(perform.split.tertiary);
                                    if (params === undefined || params == '') window[fn]();
                                    else window[fn].apply(this, params);
                                }
                            }
                        }
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
            return attr ? attr.split(perform.split.tertiary) : [];
        },
        getEvents: function (submit) {
            var attr = submit.attr('data-perform-events');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-events attribute is present.");
            return attr ? attr.split(perform.split.tertiary) : [];
        },
        getActions: function (submit) {
            var attr = submit.attr('data-perform-actions');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-actions attribute is present.");
            return attr ? attr.split(perform.split.tertiary) : [];
        },
        getMethods: function (submit) {
            var attr = submit.attr('data-perform-methods');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-methods attribute is present.");
            return attr ? attr.split(perform.split.tertiary) : [];
        },
        getTargets: function (submit) {
            var attr = submit.attr('data-perform-targets');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-targets attribute is present.");
            return attr ? attr.split(perform.split.tertiary) : [];
        },
        getBefores: function (submit) {
            return submit.attr('data-perform-befores') ? submit.attr('data-perform-befores').split(perform.split.main) : undefined;
        },
        getBeforeParams: function (submit) {
            return submit.attr('data-perform-bparams') ? submit.attr('data-perform-bparams').split(perform.split.main) : undefined;
        },
        getAfters: function (submit) {
            return submit.attr('data-perform-afters') ? submit.attr('data-perform-afters').split(perform.split.main) : undefined;
        },
        getAfterParams: function (submit) {
            return submit.attr('data-perform-aparams') ? submit.attr('data-perform-aparams').split(perform.split.main) : undefined;
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
            if(model.beforeparams !== undefined) model.beforeparams.length >= maxCount ? maxCount = model.beforeparams.length: false;
            if(model.afters !== undefined) model.afters.length >= maxCount ? maxCount = model.afters.length: false;
            if(model.afterparams !== undefined) model.afterparams.length >= maxCount ? maxCount = model.afterparams.length: false;
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
            if (model.beforeparams !== undefined && model.beforeparams.length < maxCount) console.log("Invalid data-perform-bparams index count: " + model.beforeparams.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character ';'.");
            if (model.afters !== undefined && model.afters.length < maxCount) console.log("Invalid data-perform-afters index count: " + model.afters.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.afterparams !== undefined && model.afterparams.length < maxCount) console.log("Invalid data-perform-aparams index count: " + model.afterparams.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character ';'.");
        }
    };
    perform.parse();
});
