var local = {
	process: function (request, target, params) {
        $(target).html(
            $('<p/>').append(
                $('<b/>').html(request.head + ": "),
                $('<em/>').html(request.text)
            )
        );
    },
	second: function (request, target, params) {
		alert(request.head + ": " + request.text);
        return false;
	},
    blur: function (request, target, params) {
        $('#test-target').empty();   
    },
    before: function (request, target, params) {
        alert("Error!");   
    }
}