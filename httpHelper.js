function getUsers(callback) {
	var request = new XMLHttpRequest();
	request.open('GET', global.USERS_URL, true);

	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			if (callback && typeof (callback) === 'function') {
				callback(data);
			}
		} else {
			// We reached our target server, but it returned an error
		}
	};

	request.onerror = function () {
		// There was a connection error of some sort
	};

	request.send();
}