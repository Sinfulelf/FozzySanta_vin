var global = {
	USERS_URL: 'https://temabitsanta.firebaseio.com',
	LAST_DATE: new Date(2019, 12, 19),
	DATA: [],
	SELECTED_USER_ID: null,
	NOTIFICATION_MODAL: null,
	classes: {
		USER_CARD: 'user-card',
		SCALE_OUT: 'scale-out',
		SCALE_IN: 'scale-in',
		HIDE: 'hide',
		ACTIVE_ONLY_HIDE: 'active-only-hide',
		NON_PARTICIPATION: 'non-participation',
		WISH_BTN: 'wish-btn',
		LEAVE_BTN: 'leave-btn',
		ENTER_BTN: 'enter-btn'
	},
	state: {
		SHOW_ACTIVE_ONLY: false,
		FILTER_TEXT: ''
	}
};

document.addEventListener('DOMContentLoaded', function () {
	var filterAfterDataLoading = (data) => false;

	var tab = M.Tabs.init(document.getElementById('nav-tabs'), {
		//swipeable: true,
		duration: 300
	});

	var removeModal = M.Modal.init(document.getElementById('remove-modal'), {
		opacity: 0.7
	});

	global.NOTIFICATION_MODAL = M.Modal.init(document.getElementById('notification-modal'), {
		opacity: 0.6
	});

	////getUsers -> f(callback)- From httpHelper.js
	getUsers(function (response) {
		var data = Object.values(response);


		var users = document.getElementById('users');

		var SortedByActivity = data.filter(el => el.id)
			.sort((a, b) => a.id - b.id)
			.sort((a, b) => b.participation - a.participation);

		global.DATA = SortedByActivity;
		//buildCards -> f(data)- From htmlBuilder.js 
		users.innerHTML = buildCards(SortedByActivity);

		SubsribeBtns();

		filterAfterDataLoading(global.DATA);
	}, toggleNoDisplayedUserCards);

	//FILTERING
	var input = document.getElementById('user_name');
	input.addEventListener('input', function () {
		global.state.FILTER_TEXT = this.value.toLowerCase();
		var throttledToggle = throttle(toggleCardsClass(global.state.FILTER_TEXT), 250);

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
		global.state.FILTER_TEXT = input.value.toLowerCase();
		filterAfterDataLoading = ((val) => (data) => {
			toggleCardsClass(val)(data);
			filterAfterDataLoading = (d) => false;
		})(global.state.FILTER_TEXT)
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
			toggleNoDisplayedUserCards();
		});
	});

	var leaveConfirmBtn = document.getElementById('remove-user');
	leaveConfirmBtn.addEventListener('click', function () {
		setTimeout(() => {
			changeSantaParticipation(global.SELECTED_USER_ID, false, getUpdateUserCardCallback(global.SELECTED_USER_ID, () => {global.NOTIFICATION_MODAL.open()}));
		}, 16);
	});

    var collapsible = M.Collapsible.init( document.querySelectorAll('.collapsible'), {});
});

var addHideClass = (el, hideClass = global.classes.HIDE, timeout = 300) => {
	if (!el.classList.contains(hideClass)) {
		el.classList.add(global.classes.SCALE_OUT)
		el.classList.remove(global.classes.SCALE_IN);

		toggleHiddenData(el, true);

		setTimeout(() => {
			(function (elem) {
				elem.classList.add(hideClass);
			})(el)
		}, timeout);
	}
}
var removeHideClass = (el, hideClass = global.classes.HIDE, timeout = 100) => {
	if (el.classList.contains(hideClass)) {
		el.classList.remove(hideClass);

		/*Check - the element is still hidden */
		var secondaryHideClass = hideClass === global.classes.HIDE
			? global.classes.ACTIVE_ONLY_HIDE
			: global.classes.HIDE;
		toggleHiddenData(el, el.classList.contains(secondaryHideClass));

		setTimeout(() => {
			(function (elem) {
				elem.classList.remove(global.classes.SCALE_OUT);
				elem.classList.add(global.classes.SCALE_IN);
			})(el)
		}, timeout);
	}
}

function toggleHiddenData(el, fromSwitch, fromFilter) {
	el.dataset.hidden = (fromSwitch || fromFilter) ? '1' : '';
}

var toggleCardsClass = (val) => (data) => {
	data.forEach(item => {
		var names = item.name.toLowerCase().split(' ');

		var subName = (item.bonus_name || '').toLowerCase();

		var element = document.getElementById(`user-${item.id}`);

		if (names[0].startsWith(val) || (names[1] || '').startsWith(val) || subName.startsWith(val))
			removeHideClass(element);
		else
			addHideClass(element);
	});

	toggleNoDisplayedUserCards();
};

function toggleNoDisplayedUserCards() {
	setTimeout(() => {
		if (!this.usersCards) {
			this.usersCards = document.getElementsByClassName(global.classes.USER_CARD);
		}
		if (!this.noActiveUsersWrapper) {
			this.noActiveUsersWrapper = document.getElementById('no-active-users-wrapper');
		}
		if (!this.noActiveUsersText) {
			this.noActiveUsersText = document.getElementById('no-active-users-text');
		}

		var hiddenCardsCount = 0;
		for (let i = 0; i < (this.usersCards || []).length; i++) {
			if (this.usersCards[i].dataset.hidden) {
				hiddenCardsCount++;
			}
		}
		if (hiddenCardsCount === global.DATA.length) {
			var fromActiveText = global.state.SHOW_ACTIVE_ONLY ? ', серед активних учасників' : '';
			var fromFilterText = global.state.FILTER_TEXT ? `, чиє ім'я починалось би з <b>${global.state.FILTER_TEXT}</b>` : '';
			this.noActiveUsersText.innerHTML = `Нажаль, не вдалося знайти нікого${fromActiveText}${fromFilterText}`;

			removeHideClass(this.noActiveUsersWrapper, global.classes.HIDE, 50);
		} else {
			this.noActiveUsersWrapper.classList.add(global.classes.HIDE);
		}
	}, 300)
}

function SubsribeBtns() {
	subscribeWishBtn();
	subscribeLeaveBtn();
	subscribeEnterBtn();
	addTooltips();
}

function subscribeLeaveBtn() {
	var leaveBtns = document.getElementsByClassName(global.classes.LEAVE_BTN);

	for (var i = 0; i < leaveBtns.length; i++) {
		if (!leaveBtns[i].dataset.subscribed) {
			leaveBtns[i].dataset.subscribed = '1';
			leaveBtns[i].addEventListener('click', function () {
				global.SELECTED_USER_ID = this.dataset.userid;
			});
		}
	}
}

function subscribeEnterBtn() {
	var enterBtns = document.getElementsByClassName(global.classes.ENTER_BTN);

	for (var i = 0; i < enterBtns.length; i++) {
		if (!enterBtns[i].dataset.subscribed) {
			enterBtns[i].dataset.subscribed = '1';
			enterBtns[i].addEventListener('click', function () {
				setTimeout(() => {
					changeSantaParticipation(this.dataset.userid, true, getUpdateUserCardCallback(this.dataset.userid, () => {global.NOTIFICATION_MODAL.open()}));
				}, 16);
			});
		}
	}
}

function subscribeWishBtn() {
	var wishBtn = document.getElementsByClassName(global.classes.WISH_BTN);
	for (var i = 0; i < wishBtn.length; i++) {
		if (!wishBtn[i].dataset.subscribed) {
			wishBtn[i].dataset.subscribed = '1';
			wishBtn[i].addEventListener('click', function () {
				var id = this.dataset.userid;
				addWishTextArea(id, global.DATA.find(obj => obj.id === id).wish);
			});
		}
	}
}

function addTooltips() {
	var tooltip = M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
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