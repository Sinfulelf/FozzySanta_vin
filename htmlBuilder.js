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
							? `<a data-userid="${id}" class="waves-effect waves-light btn-small">${wish ? 'Змінити' : 'Залишити'} побажання 🎁</a>`
							: ''
						}			
					</div>
				</div>
			</div>              	
			`;
	}
	return html;
}