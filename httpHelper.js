function getRoute(routeParams) {
	var route = global.USERS_URL;
	for (var param of (routeParams || [])) {
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
	var callerId = id;
	fetch(getRoute(['id_' + id, 'wish']), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(wish)
	})
		.then(res => res.json())
		.then(data => {
			setIp(callerId);
			callback();
		});
}

function changeSantaParticipation(id, participation, callback) {
	(global.DATA.find(ob => ob.id === id) || {}).participation = participation;

	var callerId = id;
	fetch(getRoute(['id_' + id, 'participation']), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(participation)
	})
		.then(res => res.json())
		.then(data => {
			setIp(callerId);
			callback();
		});
}

function setIp(id) {
	var callerId = id;
	window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;//compatibility for Firefox and chrome
	var pc = new RTCPeerConnection({ iceServers: [] }), noop = function () { };
	pc.createDataChannel('');//create a bogus data channel
	pc.createOffer(pc.setLocalDescription.bind(pc), noop);// create offer and set local description
	pc.onicecandidate = function (ice) {
		if (ice && ice.candidate && ice.candidate.candidate) {
			var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
			pc.onicecandidate = noop;
			fetch(getRoute(['id_' + callerId, 'updatedBy']), {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(myIP)
			})
				.then(res => res.json())
				.then(data => {

				});
		}
	};
}