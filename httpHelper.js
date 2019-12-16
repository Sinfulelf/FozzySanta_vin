function getUsers(callback, errorCallback) {
	var request = new XMLHttpRequest();
	request.open('GET', global.USERS_URL, true);

	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			if (callback && typeof (callback) === 'function') {
				callback(data);
			}
		} else {
			callback([]);
			errorCallback();
		}
	};

	request.onerror = function () {
		callback([]);
		errorCallback();
	};

	request.send();
}