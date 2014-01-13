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
 * Version:  0.6
 * By: Justin King and Scott Robinson
 *****************************************/
var perform = perform || {};

$(function () {
    "use strict";
    perform = {
        //The perform model
        model: {
            object: {},
            event: "",
            formids: [],
            actions: [],
            methods: [],
            targets: [],
            params: [],
            locals: [],
            extras: {
                befores: [],
                afters: [],
                successes: [],
                errors: []
            }
        },
        //The perform collection to hold all of the models for the current page
        collection: [],
        current: {},
        verbose: true,
        split: ',',       
        parse: function () {
            $('[data-perform-events]').each(function () {             
                //arrays to hold the values for parsing
                var i,j, evt, gtg, events = [], formids = [], actions = [], methods = [], targets = [], params = [], completed = [], item = {}, model = {};
                //Load the parsing arrays
                events = perform.getEvents;
                formids = perform.getForms;
                actions = perform.getActions;
                methods = perform.getMethods;
                targets = perform.getTargets;
                params = perform.getParams;
                //Transform the arrays to load the binding model
                for(i = 0; i < events.length; i++) {
                    evt = perform.nextEvent(events, completed);
                    if(evt === undefined) return;
                    model.object = $(this);
                    model.event = evt,
                    for(j = 0; j < methods.length; j++) {
                        if(events[j] !== evt) continue;
                        item = {
                            formid: formids[j],
                            action: actions[j],
                            method: methods[j],
                            target: targets[j],
                            params : params[j]
                        };
                        if(item.method === "before") model.extras.befores.push(item);
                        else if(item.method === "after") model.extras.afters.push(item);
                        else if(item.method === "success") model.extras.successes.push(item);
                        else if(item.method === "error") model.extras.errors.push(item);
                        else if(item.method === "local") model.locals.push(item);
                        else {
                            model.formids.push(item.formid);
                            model.actions.push(item.action);
                            model.methods.push(item.method);
                            model.targets.push(item.target);
                            model.params.push(item.params);
                        }
                    }
                }
                if(perform.verbose) perform.errorCheck(model);
                perform.collection.push(model);
            });
            perform.binder();
        },
        nextEvent = function (events, completed) {
            var i,j,evt,gtg = true;    
            for(i = 0; i < events.length; i++) {
                evt = events[i];
                for(j = 0; j < completed.length; j++) {
                    if(evt === completed[j]) gtg = false;
                }
                if(gtg) return evt;
            }
            return undefined;
        },
        binder: function () {
            var i,j;
            for (i = 0; i < perform.collection.length; i++) {
                perform.current = perform.collection[i];
                for(j = 0; j < perform.current.locals.length; j++) {
                    perform.bindLocal(perform.current, j);   
                }
                for(j = 0; j < perform.current.methods.length; j++) {
                    perform.bindRemote(perform.current, j);
                }
            }
        },
        bindLocal: function (item, q, extras) {
            if(perform.verbose) console.log("Binding " + item.formids[q] + " submission using " + item.object + " to " + item.actions[q] + " on " + item.events[q] + " via " + item.methods[q] + " using local binding."); 
            item.object.on(item.events[q], { model: item, q: q }, function (event) {  
                var model = event.data.model, q = event.data.q, array = $(model.formids[j]).serializeArray(), result = {}, i = 0, success;
                for(i = 0; i < array.length; i++) {
                    eval('result.' + array[i].name + ' = array[' + i + '].value;');
                }
                //Run the befores
                for(j = 0; j < model.extras.befores.length; j++) {
                    if(model.extras.befores[j].target === model.locals[q].target && model.extras.befores[j].formid === model.locals[q].formid) {
                        eval(model.extras.befores[j].action).call(this, result, model.extras.befores[j].target, eval(model.extras.befores[j].params));
                    }
                }
                //Submit the form
                success = eval(model.locals[q].action).call(this, result, model.targets[q], eval(model.params[q]));
                //Run success and error functions
                if(success) {
                    for(j = 0; j < model.extras.successes.length; j++) {
                        if(model.extras.successes[j].target === model.locals[q].target && model.extras.successes[j].formid === model.locals[q].formid) {
                            eval(model.extras.successes[j].action).call(this, result, model.extras.successes[j].target, eval(model.extras.successes[j].params));
                        }
                    }
                } else {
                    for(j = 0; j < model.extras.errors.length; j++) {
                        if(model.extras.errors[j].target === model.locals[q].target && model.extras.errors[j].formid === model.locals[q].formid) {
                            eval(model.extras.errors[j].action).call(this, result, model.extras.errors[j].target, eval(model.extras.errors[j].params)); 
                        }
                    }
                }
                //Run the after functions
                for(j = 0; j < model.extras.afters.length; j++) {
                    if(model.extras.afters[j].target === model.locals[q].target && model.extras.afters[j].formid === model.locals[q].formid) {
                        eval(model.extras.afters[j].action).call(this, result, model.extras.afters[j].target, eval(model.extras.afters[j].params));   
                    }
                }
            });
        },
        bindRemote: function (item, q) {
            if(perform.verbose) console.log("Binding " + item.formids[q] + " submission " + item.object + " to " + item.actions[q] + " on " + item.events[q] + " via " + item.methods[q] + " using remote binding.");
            $(item.object).on(item.events[q], { model: item, q: q }, function (event) {
                //Run the before functions
                var i, model = event.data.model, q = event.data.q;
                $.ajax({
                    url: model.actions[q],
                    type: model.methods[q],
                    data: $(model.formids[q]).serializeArray(),
                    beforeSend: function () {
                        for(i = 0; i < model.extras.befores.length; i++) {
                            var bf = model.extras.befores[i];
                            if(bf.target === model.targets[q] && bf.formid === model.formids[q]) {
                                   
                            }
                        }
                    },
                    success: function (data, textStatus, jqXHR) {
                        var target = model.targets[q];
                        if(target !== undefined || target != "")$(target).html(data);
                        //Run the success functions
                        perform.runSuccessFns(item, q);
                        if (perform.verbose) console.log("Form submitted successfully.");
                    },
                    complete: function(){
                        //Run the after functions
                        perform.runAfterFns(item, q);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        //Run the error functions
                        perform.runErrorFns(item, q);
                        if(perform.verbose) console.log(errorThrown);
                    }
                });
            });

        },
        /*runBeforeFns: function(item, q){
            var continueSubmit = true;
            if (item.befores !== undefined) {
                var bFunctions = item.befores[q].split(perform.split.secondary);
                var bParams = item.beforeparams[q].split(perform.split.secondary);
                for(var i in bFunctions){
                    var fn = bFunctions[i];
                    var returnVal;
                    if (fn !== ''){
                        var params = bParams[i].split(perform.split.tertiary);
                        if (params === undefined || params == '') returnVal = window[fn]();
                        else returnVal = window[fn].apply(this, params);
                    }
                    if(returnVal === false) continueSubmit = false;
                }
            }
            return continueSubmit;
        },*/
        /*runAfterFns: function(item, q){
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
        },*/
        /*runSuccessFns: function(item, q){
            if (item.successfns !== undefined) {
                var sFunctions = item.successfns[q].split(perform.split.secondary);
                var sParams = item.successfnparams[q].split(perform.split.secondary);
                for(var i in sFunctions){
                    var fn = sFunctions[i];
                    if (fn !== ''){
                        var params = sParams[i].split(perform.split.tertiary);
                        if (params === undefined || params == '') window[fn]();
                        else window[fn].apply(this, params);
                    }
                }
            }
        },*/
        /*runErrorFns: function(item, q){
            if (item.errorfns !== undefined) {
                var eFunctions = item.errorfns[q].split(perform.split.secondary);
                var eParams = item.errorfnparams[q].split(perform.split.secondary);
                for(var i in eFunctions){
                    var fn = eFunctions[i];
                    if (fn !== ''){
                        var params = eParams[i].split(perform.split.tertiary);
                        if (params === undefined || params == '') window[fn]();
                        else window[fn].apply(this, params);
                    }
                }
            }
        },*/
        reset: function () {
            perform.collection = [];
        },
        getEvents: function (submit) { //No error checking needed here as if the attribute doesn't exist, then parsing will not take place.
            var attr = submit.attr('data-perform-events');
            return attr.split(perform.split);
        },
        getForms: function (submit, event) {
            var attr = submit.attr('data-perform-forms');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-forms attribute is present.");
            return attr ? attr.split(perform.split) : [];
        },
        getActions: function (submit, event) {
            var attr = submit.attr('data-perform-actions');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-actions attribute is present.");
            return attr ? attr.split(perform.split) : [];
        },
        getMethods: function (submit, event) {
            var attr = submit.attr('data-perform-methods');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-methods attribute is present.");
            return attr ? attr.split(perform.split) : [];
        },
        getTargets: function (submit, event) {
            var attr = submit.attr('data-perform-targets');
            if (perform.verbose && (!attr || attr === undefined)) console.error("No data-perform-targets attribute is present.");
            return attr ? attr.split(perform.split) : [];
        },
        getParams: function (submit, event) {
            var attr = submit.attr('data-perform-params');
            if (perform.verbose && (!attr || attr === undefined)) return;
            return attr ? attr.split(perform.split) : [];
        },
        /*getBefores: function (submit, event) {
            return submit.attr('data-perform-bfns') ? submit.attr('data-perform-bfns').split(perform.split.main) : undefined;
        },*/
        /*getAfters: function (submit, event) {
            return submit.attr('data-perform-afns') ? submit.attr('data-perform-afns').split(perform.split.main) : undefined;
        },*/
        /*getAfterParams: function (submit, event) {
            return submit.attr('data-perform-aparams') ? submit.attr('data-perform-aparams').split(perform.split.main) : undefined;
        },*/
        /*getSuccessFns: function (submit) {
            return submit.attr('data-perform-sfns') ? submit.attr('data-perform-sfns').split(perform.split.main) : undefined;
        },*/
        /*getSuccessFnParams: function (submit) {
            return submit.attr('data-perform-sparams') ? submit.attr('data-perform-sparams').split(perform.split.main) : undefined;
        },*/
        /*getErrorFns: function (submit) {
            return submit.attr('data-perform-efns') ? submit.attr('data-perform-efns').split(perform.split.main) : undefined;
        },*/
        /*getErrorFnParams: function (submit) {
            return submit.attr('data-perform-eparams') ? submit.attr('data-perform-eparams').split(perform.split.main) : undefined;
        },*/
        errorCheck: function(model) {
            var maxCount = 0;
            //Get the max amount of an array
            model.formids.length >= maxCount ? maxCount = model.formids.length: false;
            model.events.length >= maxCount ? maxCount = model.events.length: false;
            model.actions.length >= maxCount ? maxCount = model.actions.length: false;
            model.methods.length >= maxCount ? maxCount = model.methods.length: false;
            model.targets.length >= maxCount ? maxCount = model.targets.length: false;
            /*if(model.befores !== undefined) model.befores.length >= maxCount ? maxCount = model.befores.length: false;
            if(model.beforeparams !== undefined) model.beforeparams.length >= maxCount ? maxCount = model.beforeparams.length: false;
            if(model.afters !== undefined) model.afters.length >= maxCount ? maxCount = model.afters.length: false;
            if(model.afterparams !== undefined) model.afterparams.length >= maxCount ? maxCount = model.afterparams.length: false;
            if(model.successfns !== undefined) model.successfns.length >= maxCount ? maxCount = model.successfns.length: false;
            if(model.successfnparams !== undefined) model.successfnparams.length >= maxCount ? maxCount = model.successfnparams.length: false;
            if(model.errorfns !== undefined) model.errorfns.length >= maxCount ? maxCount = model.errorfns.length: false;
            if(model.errorfnparams !== undefined) model.errorfnparams.length >= maxCount ? maxCount = model.errorfnparams.length: false;
*/            //Log the errors of the improper index count
            if (model.formids.length < maxCount) console.error("Invalid data-perform-forms index count: " + model.formids.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.split + "'.");
            if (model.events.length < maxCount) console.error("Invalid data-perform-events index count: " + model.events.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.split + "'.");
            if (model.actions.length < maxCount) console.error("Invalid data-perform-actions index count: " + model.actions.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.split + "'.");
            if (model.methods.length < maxCount) console.error("Invalid data-perform-methods index count: " + model.methods.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.split + "'.");
            if (model.targets.length < maxCount) console.error("Invalid data-perform-targets index count: " + model.targets.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.split + "'.");
            /*if (model.befores !== undefined && model.befores.length < maxCount) console.error("Invalid data-perform-bfns index count: " + model.befores.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.beforeparams !== undefined && model.beforeparams.length < maxCount) console.error("Invalid data-perform-bparams index count: " + model.beforeparams.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character ';'.");
            if (model.afters !== undefined && model.afters.length < maxCount) console.error("Invalid data-perform-afns index count: " + model.afters.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.afterparams !== undefined && model.afterparams.length < maxCount) console.error("Invalid data-perform-aparams index count: " + model.afterparams.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character ';'.");
            if (model.successfns !== undefined && model.successfns.length < maxCount) console.error("Invalid data-perform-sfns index count: " + model.successfns.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.successfnparams !== undefined && model.successfnparams.length < maxCount) console.error("Invalid data-perform-sparams index count: " + model.successfnparams.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character ';'.");
            if (model.errorfns !== undefined && model.errorfns.length < maxCount) console.error("Invalid data-perform-efns index count: " + model.errorfns.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.errorfnparams !== undefined && model.errorfnparams.length < maxCount) console.error("Invalid data-perform-eparams index count: " + model.errorfnparams.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character ';'.");*/
        }
    };
    perform.parse();
});
