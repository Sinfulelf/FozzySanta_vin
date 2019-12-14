var global = {
	USERS_URL: 'https://api.myjson.com/bins/usf1k',
	DATA: {}
};

document.addEventListener('DOMContentLoaded', function () {
	var tab = M.Tabs.init(document.getElementById('nav-tabs'), {
		//swipeable: true,
		duration: 300
	});

	var modal = M.Modal.init(document.querySelectorAll('.modal'), {
		opacity: 0.7
	});

	getUsers(function(data) {
		var users = document.getElementById('users');

		var SortedBtActivity = data.sort((a,b) => b.participation - a.participation);

		global.DATA = SortedBtActivity;

		users.innerHTML = buildCards(SortedBtActivity);
	});	
});

function getUsers(callback) {
	var request = new XMLHttpRequest();
	request.open('GET', global.USERS_URL, true);

	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			if (callback && typeof(callback) === 'function') {
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

function buildCards (data) {
		var html = ''
		for (let user in data) {

			var id = data[user].id;
			var name =data[user].name;
			var participation = data[user].participation;
			var avatarBase64 = avatars[data[user].avatar];
			var wish = data[user].wish;

			html += `			
				<div
					class="col s12 m8 offset-m2 l6 offset-l3"
					style="position:relative;"
					data-id="${id}">
					<div class="card-panel grey lighten-5 z-depth-1">
						${
							participation
								? ''
								: '<span class="mask-overlay" style=""></span>'
						}
						<div class="row valign-wrapper">
							<div class="col s2">
								<img src="data:image/png;base64,${avatarBase64}"
									alt=""
									class="circle responsive-img"
									style="padding-top:1.75em;" /> 
							</div>
							<div class="col s10">
								<div class="name">
									<p>${name}</p>
								</div>
							<div class="row1" style="margin-top:2%;">
								${
									participation
										? wish
											? `<span class="black-text">${wish}</span>`
											: `<span class="grey-text disabled">Участники іще не вибрав побажання</span>`
										: '<span class="grey-text disabled">Участники відмовився від участі</span>'
								}								
							</div>
						</div>
					</div>
					<div class="card-buttons">
						${
							participation
								? '<a class="waves-effect waves-light btn-small modal-trigger" href="#remove-modal">Відмовитись від участі 😥</a>'
								: '<a class="waves-effect waves-light btn-small">Я передумав, і хочу прийняти участь 👍</a>'
						}
						${
							participation
								? `<a class="waves-effect waves-light btn-small">${wish ? 'Змінити' : 'Залишити'} побажання 🎁</a>`
								: ''
						}
					</div>
				</div>
			</div>            	
			`;
		}
		return html;
}