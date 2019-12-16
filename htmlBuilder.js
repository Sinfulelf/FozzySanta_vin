function buildCards(data) {
	var html = `<div id="no-active-users-wrapper" class="hide container">
					<div class="s2"></div>
					<h3 id="no-active-users-text" class="s8 grey-text"></h3>
				</div>`;
	for (let user in data) {

		var id = data[user].id;
		var name = data[user].name;
		var participation = data[user].participation;
		var avatar = data[user].avatar;
		var wish = data[user].wish;

		html += `			
				<div
					class="user-card col s12 m10 offset-m1 l8 offset-l2 scale-transition ${!participation ? 'non-participation' : ''}"
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
							<div class="" id="wish-container-${id}" style="margin-top:2%;">
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
							? `<a data-userid="${id}" class="waves-effect waves-light btn-small modal-trigger" href="#remove-modal">Відмовитись від участі 😥</a>`
							: `<a data-userid="${id}" class="waves-effect waves-light btn-small">Я передумав, і хочу прийняти участь 👍</a>`
						}			
						${participation
							? `<a data-userid="${id}" class="waves-effect waves-light btn-small wish-btn">${wish ? 'Змінити' : 'Залишити'} побажання 🎁</a>`
							: ''
						}			
					</div>
				</div>
			</div>              	
			`;
	}
	return html;
}

function addWishTextArea(id, originalWish) {
	console.log(2);
	var container = document.getElementById('wish-container-'+id);
	
	var maxHeight = container.closest('.card-panel').offsetHeight;

	var textAreaId = `textarea-${id}`;

	container.innerHTML = `
		<form class="col s12">
			<div class="row">
				<div class="input-field col s12">
					<textarea id="${textAreaId}"
								class="materialize-textarea"
								style="text-overflow: ellipsis;
										word-wrap: break-word;
										overflow: auto;
										height: 3em;
										padding: 3px 0;
										max-height: 3.6em;
										line-height: 1.2em;
										background:#e6e4e4;
										margin-bottom: -20px;"
					></textarea>
					<label for="${textAreaId}" class="">Побажання</label>
				</div>
			</div>
		</form>
	`;

	setTimeout(() => {
		var ta = document.getElementById(textAreaId);
		ta.focus();
	})
}