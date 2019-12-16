var global = {
	USERS_URL: 'https://api.myjson.com/bins/12z7p4',
	DATA: [],
	classes: {
		SCALE_OUT: 'scale-out',
		SCALE_IN: 'scale-in',
		HIDE: 'hide',
		SHOW_ACTIVE_ONLY: 'active-only'
	},
	state: {
		SHOW_ACTIVE_ONLY: false
	}
};

document.addEventListener('DOMContentLoaded', function () {
	var filterAfterDataLoading = (data) => false;

	var tab = M.Tabs.init(document.getElementById('nav-tabs'), {
		//swipeable: true,
		duration: 300
	});

	var modal = M.Modal.init(document.querySelectorAll('.modal'), {
		opacity: 0.7
	});

	getUsers(function (request) {
		var users = document.getElementById('users');

		var data = [];
		for (var [key, value] of Object.entries(request)) {
			value.id = key;
			data.push(value);
		}

		var SortedBtActivity = data.sort((a, b) => b.participation - a.participation);

		global.DATA = SortedBtActivity;

		users.innerHTML = buildCards(SortedBtActivity);

		filterAfterDataLoading(global.DATA);
	});

	var input = document.getElementById('user_name');

	input.addEventListener('input', function () {
		var value = this.value.toLowerCase();
		var throttledToggle = throttle(toggleCardsClass(value), 250);

		if (global.DATA.length) {
			throttledToggle(global.DATA);
		} else {
			filterAfterDataLoading = (data) => {
				throttledToggle(data);
				filterAfterDataLoading = (d) => false;
			}
		}
	}, true);
	if (input.value) {
		filterAfterDataLoading = (data) => {
			toggleCardsClass(input.value)(data);
			filterAfterDataLoading = (d) => false;
		}
	}

	var switcher = document.getElementById('active_switch_checkbox');
	switcher.addEventListener('change', function (event) {
		if (!this.participants) {
			this.participants = document.getElementById('participants');
		}
		setTimeout(() => {
			global.state.SHOW_ACTIVE_ONLY = !this.checked;
			if (global.state.SHOW_ACTIVE_ONLY &&
				!this.participants.classList.contains(global.classes.SHOW_ACTIVE_ONLY)) {
				this.participants.classList.add(global.classes.SHOW_ACTIVE_ONLY);
			} else if (!global.state.SHOW_ACTIVE_ONLY &&
				this.participants.classList.contains(global.classes.SHOW_ACTIVE_ONLY)) {
					this.participants.classList.remove(global.classes.SHOW_ACTIVE_ONLY);
			}
		});
	})
});

var removeCardsClass = el => {
	if (!el.classList.contains(global.classes.HIDE)) {
		el.classList.add(global.classes.SCALE_OUT)
		el.classList.remove(global.classes.SCALE_IN);
		setTimeout(() => {
			(function (elem) {
				elem.classList.add(global.classes.HIDE);
			})(el)
		}, 300);
	}
}
var addCardsClass = el => {
	if (el.classList.contains(global.classes.HIDE)) {
		el.classList.remove(global.classes.HIDE);
		setTimeout(() => {
			(function (elem) {
				elem.classList.remove(global.classes.SCALE_OUT);
				elem.classList.add(global.classes.SCALE_IN);
			})(el)
		}, 100);
	}
}

var toggleCardsClass = (val) => (data) => {
	data.forEach(item => {
		var name = item.name.toLowerCase();
		var subName = (item.bonus_name || '').toLowerCase();

		var element = document.getElementById(`user-${item.id}`);

		if (name.indexOf(val) !== -1 || subName.indexOf(val) !== -1)
			addCardsClass(element);
		else
			removeCardsClass(element);
	});
};

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

function buildCards(data) {
	var html = ''
	for (let user in data) {

		var id = data[user].id;
		var name = data[user].name;
		var participation = data[user].participation;
		var avatar = data[user].avatar;
		var wish = data[user].wish;

		html += `			
				<div
					class="col s12 m10 offset-m1 l8 offset-l2 scale-transition ${!participation ? 'non-participation' : ''}"
					style="position:relative;"
					id="user-${id}">
					<div class="card-panel grey lighten-5 z-depth-1">
						${participation
							? ''
							: '<span class="mask-overlay" style=""></span>'
						}
						<div class="row valign-wrapper">
							<div class="col s2">
								<img src="avatars/${avatar}"
									alt=""
									class="circle responsive-img"
									style="padding-top:1.25em;" /> 
							</div>
							<div class="col s10">
								<div class="name">
									<p>${name}</p>
								</div>
							<div class="row1" style="margin-top:2%;">
								${participation
									? wish
										? `<span class="black-text">${wish}</span>`
										: `<span class="grey-text disabled">Участники іще не вибрав побажання</span>`
									: '<span class="grey-text disabled">Колега відмовився від участі</span>'
								}								
							</div>
						</div>
					</div>
					<div class="card-buttons">
						${participation
							? '<a class="waves-effect waves-light btn-small modal-trigger" href="#remove-modal">Відмовитись від участі 😥</a>'
							: '<a class="waves-effect waves-light btn-small">Я передумав, і хочу прийняти участь 👍</a>'
						}			
						${participation
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

function throttle(func, wait) {
	var args,
		result,
		thisArg,
		timeoutId,
		lastCalled = 0;

	function trailingCall() {
		lastCalled = new Date;
		timeoutId = null;
		result = func.apply(thisArg, args);
	}

	return function () {
		var now = new Date,
			lastCalled = lastCalled || new Date,
			remain = wait - (now - lastCalled);

		args = arguments;
		thisArg = this;

		if (remain <= 0) {
			lastCalled = now;
			result = func.apply(thisArg, args);
		}
		else if (!timeoutId) {
			timeoutId = setTimeout(trailingCall, remain);
		}
		return result;
	};
}