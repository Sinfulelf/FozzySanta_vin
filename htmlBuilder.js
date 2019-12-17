function buildCards(data) {
	var html = `<div id="no-active-users-wrapper" class="hide container">
					<div class="s2"></div>
					<h3 id="no-active-users-text" class="s8 grey-text" style="text-align:center;"></h3>
				</div>`;
	for (var { id, name, participation, avatar, wish } of data) {
		html += buildCard(participation, id, wish, name, avatar);
	}
	return html;
}

function buildCard(participation, id, wish, name, avatar) {
	return `			
	<div
		class="user-card col s12 m10 offset-m1 l8 offset-l2 scale-transition ${!participation ? 'non-participation' : ''}"
		style="position:relative;"
		id="user-${id}">
			${buildCardData(participation, id, wish, name, avatar)}
	</div>`;
}

function buildCardWrapper(id, data) {
	return `			
	<div
		class="user-card col s12 m10 offset-m1 l8 offset-l2 scale-transition ${!participation ? 'non-participation' : ''}"
		style="position:relative;"
		id="user-${id}">
			${data}
	</div>`;
}

function buildCardData(participation, id, wish, name, avatar) {
	return `
	<div class="card-panel grey lighten-5 z-depth-1">
		${buildCardsMask(participation)}
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
				<div class="" id="wish-container-${id}" style="margin-top:2%;max-height:10em;text-overflow:ellipsis;">
					${buildCardsWish(participation, wish)}
				</div>
			</div>
		</div>
		<div class="card-buttons">
			${buildCardsButtons(participation, id, wish)}
		</div>
	</div>`;
}

function buildCardsMask(participation, id) {
	return participation
		? ''
		: `<span class="mask-overlay" id="mask-${id}"></span>`;
}

function buildCardsWish(participation, wish) {
	return participation
		? wish
			? `<span class="black-text" style="font-size: 20px;">${wish}</span>`
			: `<span class="grey-text disabled">Участники іще не зазначив інтереси, і не дав натяк, на те що він бажає</span>`
		: '<span class="grey-text disabled">Колега відмовився від участі</span>';
}

function buildCardsButtons(participation, id, wish) {
	var result = '';
	result += participation
		? (global.LAST_DATE - Date.now()) > 0
			? `<a data-userid="${id}" class="waves-effect waves-light btn-small modal-trigger leave-btn" href="#remove-modal">Відмовитись від участі 😥</a> `
			: `<a class="waves-effect waves-light btn-small modal-trigger btn tooltipped grey lighten-1"
					data-position="bottom" data-tooltip="Крайній термін був 19-го числа">
						Відмовитись від участі
				</a> `
		: (global.LAST_DATE - Date.now()) > 0
			? `<a data-userid="${id}" class="waves-effect waves-light btn-small enter-btn">Я передумав, і хочу прийняти участь 👌</a> `
			: `<a class="waves-effect waves-light btn-small tooltipped grey lighten-1"
					data-position="bottom" data-tooltip="Крайній термін був 19-го числа">
						Я передумав, і хочу прийняти участь
				</a> `;
	result += participation
		? `<a data-userid="${id}" class="waves-effect waves-light btn-small wish-btn">${wish ? 'Змінити інтереси 🐱‍👓' : 'Поділитися інтересами 🐱‍🐉'}</a> `
		: '';
	return result;
}

function buildCardWaiter(id) {
	return `<div class="preloader-wrapper big active"
				style="position:absolute;top:30%;left:45%;"
				id="waiter-${id}">
				<div class="spinner-layer spinner-green-only">
				<div class="circle-clipper left">
					<div class="circle"></div>
				</div><div class="gap-patch">
					<div class="circle"></div>
				</div><div class="circle-clipper right">
					<div class="circle"></div>
				</div>
				</div>
			</div>`;
}

function addWishTextArea(id, originalWish) {
	var container = document.getElementById('wish-container-' + id);
	var textAreaId = `textarea-${id}`;

	container.innerHTML = `
		<form class="col s12">
			<div class="row">
				<div class="input-field col s12">
					<textarea id="${textAreaId}"
								class="materialize-textarea"
								maxlength="255"
								style="text-overflow: ellipsis;
										word-wrap: break-word;
										overflow: auto;
										height: 3em;
										padding: 3px 0;
										max-height: 4.3em;
										line-height: 1.25em;
										background:#e6e4e4;
										margin-bottom: -20px;"
					></textarea>
					<label for="${textAreaId}" class="">Інтереси</label>
				</div>
			</div>
		</form>
	`;
	(function (id, container, originalWish) {
		setTimeout(() => {
			var ta = document.getElementById(textAreaId);
			ta.value = originalWish;
			ta.addEventListener('focusout', function () {
				container.innerHTML = buildCardsMask(false, id)
					+ buildCardWaiter(id)
					+ buildCardsWish(true, this.value);

				var callback = getUpdateUserCardCallback(id);

				updateUserWish(id, this.value, callback);
			});
			ta.focus();
		});
	})(id, container, originalWish)
}

function getUpdateUserCardCallback(id, callback) {
	var userId = id;
	return function () {
		var { participation, id, wish, name, avatar } = global.DATA.find(user => user.id == userId);
		document.getElementById(`user-${id}`).innerHTML = buildCardData(participation, id, wish, name, avatar);

		SubsribeBtns();

		if (callback) {
			callback()
		}
	}
}