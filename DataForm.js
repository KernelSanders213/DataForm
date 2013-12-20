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

$(function () {
    "use strict";
    var perform = {
        //The perform model
        model: {
            object: {},
            formids: [],
            events: [],
            actions: [],
            methods: [],
            types: [],
            targets: [],
            befores: [],
            afters: []
        },
        //The perform collection to hold all of the models for the current page
        collection: [],
        current: {},
        parse: function () {
            $('[data-perform-events]').each(function () {
                var model = perform.model;
                model.object = $(this);
                model.formids = perform.getForms(model.object);
                model.events = perform.getEvents(model.object);
                model.actions = perform.getActions(model.object);
                model.methods = perform.getMethods(model.object);
                model.types = perform.getTypes(model.object);
                model.targets = perform.getTargets(model.object);
                model.befores = perform.getBefores(model.object);
                model.afters = perform.getAfters(model.object);
                perform.collection.push(model);
            });
            perform.binder();
        },
        binder: function () {
            for (var i = 0; i < perform.collection.length; i++) {
                perform.current = perform.collection[i];
                for (var q = 0; q < perform.current.events.length; q++) {
                    perform.bind(perform.current, q);
                }
            }
        },
        bind: function (item, q) {

            $(item.object).off(item.events[q]).on(item.events[q], function () {
                var stuff = $.ajax({
                    url: item.actions[q],
                    type: item.methods[q],
                    data: $(item.formids[q]).serializeArray()
                });
                $(item.targets[q]).html(stuff);
            });

        },
        reset: function () {
            perform.collection = [];
        },
        getForms: function (form) {
            return form.attr('data-perform-forms').split(',');
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
            //return submit.attr('data-perform-before').split(',');
        },
        getAfters: function (submit) {
            //return submit.attr('data-performs-after').split(',');
        }
    };

    perform.parse();
});
