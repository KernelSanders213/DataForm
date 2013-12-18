    $('[data-perForm-type]').change(function () {
        if ($(this).attr('data-perForm-bFunction')) window[$(this).attr('data-perForm-bFunction')]();
        if ($(this).attr('[data-perForm-type]') == "AjaxUpdate"){
            $("#"+$(this).attr('data_perForm_target')).load($(this).attr('data_perForm_location'), $("#" + $(this).attr('data-perForm-form')).serializeArray());
        }
        if ($(this).attr('[data-perForm-type]') == "Form") {
            $("#" + $(this).attr('data-perForm-form')).submit();
        }
        if ($(this).attr('data-perForm-aFunction')) window[$(this).attr('data-perForm-aFunction')]();
    });
