function getUsers(callback, errorCallback) {
	fetch(global.USERS_URL, {
		method: 'GET'
	})
		.then(response => response.json())
		.then(data => { callback(data); })
		.catch(error => {
			callback([]);
			errorCallback();
		});
}

function updateUserWish(id, wish, callback) {
	global.DATA.find(obj => obj.id === id).wish = wish;

	fetch(global.USERS_URL, {
		method: 'PUT',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(global.DATA)
	})
		.then(res => res.json())
		.then(data => {
			callback();
		});
}
