$('[data-submitOnChange]').change(function () {
        if ($(this).attr('data-runFunction')) window[$(this).attr('data-runFunction')]();
        if ($(this))
        $("#validationStatus").load("@UrlPathManager.UrlPath" + "Home/ValidationStatusPartial", $("#"+$(this).attr('data-formName')).serializeArray());
    });
