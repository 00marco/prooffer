// utility functions

function pad(number, length) {
	var str = '' + number;
	while(str.length < length) {
		str = '0' + str;
	}
	return str;
}

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}