var local = {
	process: function (request, target) {
        $(target).html(
            $('<p/>').append(
                $('<b/>').html(request.head + ": "),
                $('<em/>').html(request.text)
            )
        );
    },
	second: function (request, target) {
		alert(request.head + ": " + request.text);
	},
    blur: function (request) {
        $('#test-target').empty();   
    }
}