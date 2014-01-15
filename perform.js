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
/*jslint devel: true, ass: true, continue: true, evil: true, plusplus: true, white: true */
var perform = perform || {};

$(function () {
    "use strict";
    perform = {
        //The perform model
        model: function () {
            this.object = {};
            this.event = "";
            this.formids = [];
            this.actions = [];
            this.methods = [];
            this.targets = [];
            this.params = [];
            this.locals = [];
            this.extras = {
                befores: [],
                afters: [],
                successes: [],
                errors: []
            };
        },
        //The perform collection to hold all of the models for the current page
        collection: [],
        current: {},
        verbose: true,
        split: ',',       
        parse: function () {
            $('[data-perform-events]').each(function () {             
                //arrays to hold the values for parsing
                var i,j,evt, completed = [], events = [], formids = [], actions = [], methods = [], targets = [], params = [], item = {}, model = {};
                //Load the parsing arrays
                events = perform.getEvents($(this));
                formids = perform.getForms($(this));
                actions = perform.getActions($(this));
                methods = perform.getMethods($(this));
                targets = perform.getTargets($(this));
                params = perform.getParams($(this));
                //Transform the arrays to load the binding model
                for(i = 0; i < events.length; i++) {
                    model = new perform.model();
                    evt = perform.nextEvent(events, completed);
                    if(evt === undefined) {return;}
                    model.object = $(this);
                    model.event = evt;
                    for(j = 0; j < methods.length; j++) {
                        if(events[j] !== evt) {continue;}
                        item = {
                            formid: formids[j],
                            action: actions[j],
                            method: methods[j],
                            target: targets[j],
                            params : params[j]
                        };
                        if(item.method === "before") {model.extras.befores.push(item);}
                        else if(item.method === "after") {model.extras.afters.push(item);}
                        else if(item.method === "success") {model.extras.successes.push(item);}
                        else if(item.method === "error") {model.extras.errors.push(item);}
                        else if(item.method === "local") {model.locals.push(item);}
                        else {
                            model.formids.push(item.formid);
                            model.actions.push(item.action);
                            model.methods.push(item.method);
                            model.targets.push(item.target);
                            model.params.push(item.params);
                        }
                    }
                    //if(perform.verbose) {/*perform.errorCheck(model);*/}
                    perform.collection.push(model);
                    completed.push(evt);
                }
            });
            perform.binder();
        },
        nextEvent: function (events, completed) {
            var i,j,evt,index;   
            for(i = 0; i < events.length; i++) {
                evt = events[i];
                index = completed.indexOf(evt);
                if(index === -1) {return evt;}
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
        bindLocal: function (item, q) {
            if(perform.verbose) {console.log("Binding " + item.locals[q].formid + " submission using " + item.object + " to " + item.locals[q].action + " on " + item.event + " via " + item.locals[q].method + " using local binding.");}
            item.object.on(item.event, { model: item, q: q }, function (event) {  
                var j, model = event.data.model, q = event.data.q, array = $(model.locals[q].formid).serializeArray(), request = perform.buildRequestObject(array), success, bf = {}, ss = {}, er = {}, af = {};
                //Run the befores
                for(j = 0; j < model.extras.befores.length; j++) {
                    bf = model.extras.befores[j];
                    if(bf.target === model.locals[q].target && bf.formid === model.locals[q].formid) {
                        eval(bf.action).call(this, request, bf.target, eval(bf.params));
                    }
                }
                //Submit the form
                success = eval(model.locals[q].action).call(this, request, model.locals[q].target, eval(model.params[q]));
                //Run success and error functions
                if(success) {
                    for(j = 0; j < model.extras.successes.length; j++) {
                        ss = model.extras.successes[j];
                        if(ss.target === model.locals[q].target && ss.formid === model.locals[q].formid) {
                            eval(ss.action).call(this, request, ss.target, eval(ss.params));
                        }
                    }
                } else {
                    for(j = 0; j < model.extras.errors.length; j++) {
                        er = model.extras.errors[j];
                        if(er.target === model.locals[q].target && er.formid === model.locals[q].formid) {
                            eval(er.action).call(this, request, er.target, eval(er.params)); 
                        }
                    }
                }
                //Run the after functions
                for(j = 0; j < model.extras.afters.length; j++) {
                    af = model.extras.afters[j];
                    if(af.target === model.locals[q].target && af.formid === model.locals[q].formid) {
                        eval(af.action).call(this, request, af.target, eval(af.params));   
                    }
                }
            });
        },
        bindRemote: function (item, q) {
            if(perform.verbose) {console.log("Binding " + item.formids[q] + " submission " + item.object + " to " + item.actions[q] + " on " + item.event + " via " + item.methods[q] + " using remote binding.");}
            $(item.object).on(item.event, { model: item, q: q }, function (event) {
                //Run the before functions
                var i, model = event.data.model, q = event.data.q, array = $(model.formids[q]).serializeArray(), request = perform.buildRequestObject(array), bf = {}, ss = {}, er = {}, af = {};
                $.ajax({
                    url: model.actions[q],
                    type: model.methods[q],
                    data: $(model.formids[q]).serializeArray(),
                    beforeSend: function () {
                        for(i = 0; i < model.extras.befores.length; i++) {
                            bf = model.extras.befores[i];
                            if(bf.target === model.targets[q] && bf.formid === model.formids[q]) {
                                eval(bf.action).call(this, request, bf.target, eval(bf.params));
                            }
                        }
                    },
                    success: function (data, textStatus, jqXHR) {
                        var target = model.targets[q];
                        if(target !== undefined || target !== "") {$(target).html(data);}
                        //Run the success functions
                        for(i = 0; i < model.extras.successes.length; i++) {
                            ss = model.extras.successes[i];
                            if(ss.target === model.targets[q] && ss.formid === model.formids[q]) {
                                eval(ss.action).call(this, request, ss.target, eval(ss.params));
                            }
                        }
                        if (perform.verbose) {console.log("Form submitted successfully.");}
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        for(i = 0; i < model.extras.errors.length; i++) {
                            er = model.extras.errors[i];
                            if(er.target === model.targets[q] && er.formid === model.formids[q]) {
                                eval(er.action).call(this, request, er.target, eval(er.params));   
                            }
                        }
                        if(perform.verbose) {console.log(errorThrown);}
                    },
                    complete: function(){
                        for(i = 0; i < model.extras.afters.length; i++) {
                            af = model.extras.afters[i];
                            if(af.target === model.targets[q] && af.formid === model.formids[q]) {
                                eval(af.action).call(this, request, af.target, eval(af.params));
                            }
                        }
                    }
                });
            });
        },
        reset: function () {
            perform.collection = [];
        },
        buildRequestObject: function (array) {
            var i, request = {};
            for(i = 0; i < array.length; i++) {
                eval('request.' + array[i].name + ' = array[' + i + '].value;');
            }
            return request;
        },
        getEvents: function (submit) { //No error checking needed here as if the attribute doesn't exist, then parsing will not take place.
            var attr = submit.attr('data-perform-events');
            return attr.split(perform.split);
        },
        getForms: function (submit) {
            var attr = submit.attr('data-perform-forms');
            if (perform.verbose && (!attr || attr === undefined)) {console.error("No data-perform-forms attribute is present.");}
            return attr ? attr.split(perform.split) : [];
        },
        getActions: function (submit) {
            var attr = submit.attr('data-perform-actions');
            if (perform.verbose && (!attr || attr === undefined)) {console.error("No data-perform-actions attribute is present.");}
            return attr ? attr.split(perform.split) : [];
        },
        getMethods: function (submit) {
            var attr = submit.attr('data-perform-methods');
            if (perform.verbose && (!attr || attr === undefined)) {console.error("No data-perform-methods attribute is present.");}
            return attr ? attr.split(perform.split) : [];
        },
        getTargets: function (submit) {
            var attr = submit.attr('data-perform-targets');
            if (perform.verbose && (!attr || attr === undefined)) {console.error("No data-perform-targets attribute is present.");}
            else {return attr.split(perform.split);}
        },
        getParams: function (submit) {
            var attr = submit.attr('data-perform-params');
            if (perform.verbose && (!attr || attr === undefined)) {return [];}
            return attr.split(perform.split);
        },
        errorCheck: function(model) {
            var maxCount = 0;
            //Get the max amount of an array
            model.formids.length >= maxCount ? maxCount = model.formids.length: false;
            model.events.length >= maxCount ? maxCount = model.events.length: false;
            model.actions.length >= maxCount ? maxCount = model.actions.length: false;
            model.methods.length >= maxCount ? maxCount = model.methods.length: false;
            model.targets.length >= maxCount ? maxCount = model.targets.length: false;
            //Log the errors of the improper index count
            if (model.formids.length < maxCount) {console.error("Invalid data-perform-forms index count: " + model.formids.length + " of total: " + maxCount + ". Please  make sure it is split properly with the character '" + perform.split + "'.");}
            if (model.events.length < maxCount) {console.error("Invalid data-perform-events index count: " + model.events.length + " of total: " + maxCount + ". Please  make sure it is split properly with the character '" + perform.split + "'.");}
            if (model.actions.length < maxCount) {console.error("Invalid data-perform-actions index count: " + model.actions.length + " of total: " + maxCount + ". Please  make sure it is split properly with the character '" + perform.split + "'.");}
            if (model.methods.length < maxCount) {console.error("Invalid data-perform-methods index count: " + model.methods.length + " of total: " + maxCount + ". Please  make sure it is split properly with the character '" + perform.split + "'.");}
            if (model.targets.length < maxCount) {console.error("Invalid data-perform-targets index count: " + model.targets.length + " of total: " + maxCount + ". Please  make sure it is split properly with the character '" + perform.split + "'.");}
        }
    };
    perform.parse();
});
