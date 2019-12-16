var global = {
	USERS_URL: 'https://api.myjson.com/bins/12z7p4',
	DATA: [],
	classes: {
		SCALE_OUT: 'scale-out',
		SCALE_IN: 'scale-in',
		HIDE: 'hide',
		ACTIVE_ONLY_HIDE: 'active-only-hide',
		NON_PARTICIPATION: 'non-participation'
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

	////getUsers -> f(callback)- From httpHelper.js
	getUsers(function (request) {
		var users = document.getElementById('users');

		var data = [];
		for (var [key, value] of Object.entries(request)) {
			value.id = key;
			data.push(value);
		}

		var SortedByActivity = data.sort((a, b) => b.participation - a.participation);

		global.DATA = SortedByActivity;
		//buildCards -> f(data)- From htmlBuilder.js 
		users.innerHTML = buildCards(SortedByActivity);

		filterAfterDataLoading(global.DATA);
	});

	//FILTERING
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
		setTimeout(() => {
			global.state.SHOW_ACTIVE_ONLY = !this.checked;
			var nonParticipations = document.getElementsByClassName(global.classes.NON_PARTICIPATION);
			
			var changeElementHideState = global.state.SHOW_ACTIVE_ONLY ? addHideClass : removeHideClass;

			for (var i = 0; i < nonParticipations.length; i++) {
				changeElementHideState(nonParticipations[i], global.classes.ACTIVE_ONLY_HIDE);				
			}
		});
	});
});

var addHideClass = (el, hideClass = global.classes.HIDE) => {
	if (!el.classList.contains(hideClass)) {
		el.classList.add(global.classes.SCALE_OUT)
		el.classList.remove(global.classes.SCALE_IN);
		setTimeout(() => {
			(function (elem) {
				elem.classList.add(hideClass);
			})(el)
		}, 300);
	}
}
var removeHideClass = (el, hideClass = global.classes.HIDE) => {
	if (el.classList.contains(hideClass)) {
		el.classList.remove(hideClass);
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
			removeHideClass(element);
		else
			addHideClass(element);
	});
};

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