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
            formids: [],
            events: [],
            actions: [],
            methods: [],
            targets: [],
            befores: [],
            beforeparams: [],
            afters: [],
            afterparams: [],
            successfns: [],
            successfnparams: [],
            errorfns: [],
            errorfnparams: []
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
                    successfns : perform.getSuccessFns($(this)),
                    successfnparams : perform.getSuccessFnParams($(this)),
                    errorfns : perform.getErrorFns($(this)),
                    errorfnparams : perform.getErrorFnParams($(this))
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
            if(perform.verbose) console.log("Binding " + item.formids[q] + " submission using " + item.object + " to " + item.actions[q] + " on " + item.events[q] + " via " + item.methods[q] + " using local binding."); 
            item.object.on(item.events[q], { model: item, q: q }, function (event) {  
                var array = $(event.data.model.formids[q]).serializeArray(), result = {}, i = 0;
                for(i = 0; i < array.length; i++) {
                    eval('result.' + array[i].name + ' = array[' + i + '].value;');
                }
                eval(event.data.model.actions[event.data.q]).call(this, result, event.data.model.targets[q]);
            });
        },
        bindRemote: function (item, q) {
            if(perform.verbose) console.log("Binding " + item.formids[q] + " submission " + item.object + " to " + item.actions[q] + " on " + item.events[q] + " via " + item.methods[q] + " using remote binding.");
            $(item.object).on(item.events[q], { model: item, q: q }, function (event) {
                var continueSubmit = true;
                //Run the before functions
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
                //bypass
                if (continueSubmit)
                {
                    $.ajax({
                        url: event.data.model.actions[q],
                        type: event.data.model.methods[q],
                        data: $(event.data.model.formids[q]).serializeArray(),
                        success: function (data, textStatus, jqXHR) {
                            var target = item.targets[q];
                            if(target !== undefined || target != "")$(target).html(data);
                            //Run the success functions
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
                            if (perform.verbose) console.log("Form submitted successfully.");
                        },
                        complete: function(){
                            //Run the after functions
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
                        },
                        error: function(jqXHR, textStatus, errorThrown){
                            //Run the error functions
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
                            if(perform.verbose) console.log(errorThrown);
                        }
                    });
                }
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
            return submit.attr('data-perform-bfns') ? submit.attr('data-perform-bfns').split(perform.split.main) : undefined;
        },
        getBeforeParams: function (submit) {
            return submit.attr('data-perform-bparams') ? submit.attr('data-perform-bparams').split(perform.split.main) : undefined;
        },
        getAfters: function (submit) {
            return submit.attr('data-perform-afns') ? submit.attr('data-perform-afns').split(perform.split.main) : undefined;
        },
        getAfterParams: function (submit) {
            return submit.attr('data-perform-aparams') ? submit.attr('data-perform-aparams').split(perform.split.main) : undefined;
        },
        getSuccessFns: function (submit) {
            return submit.attr('data-perform-sfns') ? submit.attr('data-perform-sfns').split(perform.split.main) : undefined;
        },
        getSuccessFnParams: function (submit) {
            return submit.attr('data-perform-sparams') ? submit.attr('data-perform-sparams').split(perform.split.main) : undefined;
        },
        getErrorFns: function (submit) {
            return submit.attr('data-perform-efns') ? submit.attr('data-perform-efns').split(perform.split.main) : undefined;
        },
        getErrorFnParams: function (submit) {
            return submit.attr('data-perform-eparams') ? submit.attr('data-perform-eparams').split(perform.split.main) : undefined;
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
            if(model.successfns !== undefined) model.successfns.length >= maxCount ? maxCount = model.successfns.length: false;
            if(model.successfnparams !== undefined) model.successfnparams.length >= maxCount ? maxCount = model.successfnparams.length: false;
            if(model.errorfns !== undefined) model.errorfns.length >= maxCount ? maxCount = model.errorfns.length: false;
            if(model.errorfnparams !== undefined) model.errorfnparams.length >= maxCount ? maxCount = model.errorfnparams.length: false;
            //Log the errors of the improper index count
            if (model.formids.length < maxCount) console.error("Invalid data-perform-forms index count: " + model.formids.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.events.length < maxCount) console.error("Invalid data-perform-events index count: " + model.events.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.actions.length < maxCount) console.error("Invalid data-perform-actions index count: " + model.actions.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.methods.length < maxCount) console.error("Invalid data-perform-methods index count: " + model.methods.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.targets.length < maxCount) console.error("Invalid data-perform-targets index count: " + model.targets.length + " of total: " + maxCount
            + ". Please  make sure it is split properly with the character '" + perform.splitchar + "'.");
            if (model.befores !== undefined && model.befores.length < maxCount) console.error("Invalid data-perform-bfns index count: " + model.befores.length + " of total: " + maxCount
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
            + ". Please  make sure it is split properly with the character ';'.");
        }
    };
    perform.parse();
});
