var global = {
	USERS_URL: 'https://api.myjson.com/bins/mgl28',
	DATA: []
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

	document.getElementById('user_name').addEventListener('input', function () {
		var value = this.value.toLowerCase();

		var scaleOutClass  = 'scale-out';
		var scaleInClass = 'scale-in';
		var hideClass = 'hide';

		var removeClass = el => {
			if (!el.classList.contains(hideClass)) {
				el.classList.add(scaleOutClass )
				el.classList.remove(scaleInClass);
				setTimeout(() => {
					(function (elem) {
						el.classList.add(hideClass);
					})(el)
				}, 300);
			}
		}
		var addClass = el => {
			if (el.classList.contains(hideClass)) {
				el.classList.remove(hideClass);
				setTimeout(() => {
					(function (elem) {						
						el.classList.remove(scaleOutClass);
						el.classList.add(scaleInClass);
					})(el)
				}, 100);
				
			}
		}

		var toggleCardsClass = ((val) => (data) => {
			data.forEach(item => {
				var name = item.name.toLowerCase();
				var subName = (item.bonus_name || '').toLowerCase();

				var element = document.getElementById(`user-${item.id}`);

				if (name.indexOf(value) !== -1 || subName.indexOf(value) !== -1)
					addClass(element);
				else
					removeClass(element);
			});
		})(value)

		var throttledToggle =  throttle(toggleCardsClass, 250);

		if (global.DATA.length) {
			throttledToggle(global.DATA);
		} else {
			filterAfterDataLoading = (data) => {
				throttledToggle(data);
				filterAfterDataLoading = (d) => false;
			}
		}
	}, true);


});

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
		var avatarBase64 = avatars[data[user].avatar];
		var wish = data[user].wish;

		html += `			
				<div
					class="col s12 m10 offset-m1 l8 offset-l2 scale-transition"
					style="position:relative;"
					id="user-${id}">
					<div class="card-panel grey lighten-5 z-depth-1">
						${participation
							? ''
							: '<span class="mask-overlay" style=""></span>'
						}
						<div class="row valign-wrapper">
							<div class="col s2">
								<img src="data:image/jpeg;base64,${avatarBase64}"
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

    return function() {
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