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
            item.object.on(item.events[q], { model: item, q: q }, function (event) {
                var array = $(event.data.model.formids[q]).serializeArray(), result = {}, i = 0;
                for(i = 0; i < array.length; i++) {
                    eval('result.' + array[i].name + ' = array[' + i + '].value;');
                }
                eval(event.data.model.actions[event.data.q]).call(this, result);
            });
        },
        bindRemote: function (item, q) {
            $(item.object).on(item.events[q], { model: item, q: q }, function (event) {
                var stuff = $.ajax({
                    url: event.data.model.actions[q],
                    type: event.data.model.methods[q],
                    data: $(event.data.model.formids[q]).serializeArray()
                });
                $(item.targets[q]).html(stuff);
            });

        },
        reset: function () {
            perform.collection = [];
        },
        getForms: function (submit) {
            return submit.attr('data-perform-forms').split(',');
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
        getTargets: function (submit) {
            return submit.attr('data-perform-targets').split(',');
        },
        getBefores: function (submit) {
            //return submit.attr('data-perform-before').split(',');
        },
        getAfters: function (submit) {
            //return submit.attr('data-performs-after').split(',');
        }
    };

    perform.parse();
});
