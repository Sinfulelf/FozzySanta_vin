function getRoute(routeParams) {
	var route = global.USERS_URL;
	for(var param of (routeParams || [])) {
		route += `/${param}`;
	}
	route += '/.json';
	return route;
}

function getUsers(callback, errorCallback) {
	fetch(getRoute(), {
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
	(global.DATA.find(ob => ob.id === id) || {}).wish = wish;

	fetch(getRoute(['id_'+id, 'wish']), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(wish)
	})
		.then(res => res.json())
		.then(data => {
			callback();
		});
}
