import helpers from './helpers.js';

window.addEventListener('load', () => {
	//When the chat icon is clicked
	document.querySelector('#toggle-chat-pane').addEventListener('click', (e) => {
		let chatElem = document.querySelector('#chat-pane');
		let mainSecElem = document.querySelector('#main-section');

		if (chatElem.classList.contains('chat-opened')) {
			chatElem.setAttribute('hidden', true);
			mainSecElem.classList.remove('col-md-9');
			mainSecElem.classList.add('col-md-12');
			chatElem.classList.remove('chat-opened');
		} else {
			chatElem.attributes.removeNamedItem('hidden');
			mainSecElem.classList.remove('col-md-12');
			mainSecElem.classList.add('col-md-9');
			chatElem.classList.add('chat-opened');
		}

		//remove the 'New' badge on chat icon (if any) once chat is opened.
		setTimeout(() => {
			if (document.querySelector('#chat-pane').classList.contains('chat-opened')) {
				helpers.toggleChatNotificationBadge();
			}
		}, 300);
	});

	//When the video frame is clicked. This will enable picture-in-picture
	document.getElementById('local').addEventListener('click', () => {
		if (!document.pictureInPictureElement) {
			document.getElementById('local').requestPictureInPicture().catch((error) => {
				// Video failed to enter Picture-in-Picture mode.
				console.error(error);
			});
		} else {
			document.exitPictureInPicture().catch((error) => {
				// Video failed to leave Picture-in-Picture mode.
				console.error(error);
			});
		}
	});

	// When the login text is clicked
	document.getElementById('login-btn').addEventListener('click', () => {
		document.querySelector('#user-signup').setAttribute('hidden', true);
		document.querySelector('#user-login').attributes.removeNamedItem('hidden');
	});

	// When the register text is clicked
	document.getElementById('register-btn').addEventListener('click', () => {
		document.querySelector('#user-signup').attributes.removeNamedItem('hidden');
		document.querySelector('#user-login').setAttribute('hidden', true);
	});

	// When the 'Sign Up' button is clicked
	document.getElementById('signup').addEventListener('click', () => {
		let form = document.forms['signUpForm'];
		let name = form['name'].value;
		let email = form['email'].value;
		let phone = form['phone'].value;
		let password = form['password'].value;
		let userType = form['userType'].value;
		if (name && email && phone && password) {
			let data = { name, email, phone, password, userType };
			fetch('/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
				.then((response) => response.json())
				.then((result) => {
					let user = result.user;
					console.log('Success:', user);
					localStorage.setItem('user', JSON.stringify(user));

					if (user && user.userType == 'faculty') {
						document.querySelector('#room-create').attributes.removeNamedItem('hidden');
					} else {
						document.querySelector('#enter-room-url').attributes.removeNamedItem('hidden');
					}

					document.querySelector('#user-signup').setAttribute('hidden', true);
					document.querySelector('#user-login').setAttribute('hidden', true);
				})
				.catch((error) => {
					console.error('Error:', error);
				});
		}
	});

	// When the 'Login' button is clicked
	document.getElementById('login').addEventListener('click', () => {
		let form = document.forms['loginForm'];
		let email = form['email'].value;
		let password = form['password'].value;
		if (email && password) {
			let data = { email, password };
			fetch('/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
				.then((response) => response.json())
				.then((result) => {
					if (result.status == 'success') {
						let user = result.user;
						console.log('Success:', user);

						localStorage.setItem('user', JSON.stringify(user));

						if (user && user.userType == 'faculty') {
							document.querySelector('#room-create').attributes.removeNamedItem('hidden');
						} else {
							document.querySelector('#enter-room-url').attributes.removeNamedItem('hidden');
						}

						document.querySelector('#user-signup').setAttribute('hidden', true);
						document.querySelector('#user-login').setAttribute('hidden', true);
					}
				})
				.catch((error) => {
					console.error('Error:', error);
				});
		}
	});

	//When the 'Create room" is button is clicked
	document.getElementById('create-room').addEventListener('click', (e) => {
		e.preventDefault();

		let user = localStorage.getItem('user');
		user = user ? JSON.parse(user) : {};

		let roomName = document.querySelector('#room-name').value;
		let yourName = user.name;

		if (roomName && yourName) {
			//remove error message, if any
			document.querySelector('#err-msg').innerText = '';

			//create room link
			let roomLink = `${location.origin}?room=${roomName
				.trim()
				.replace(' ', '_')}_${helpers.generateRandomString()}`;

			//show message with link to room
			document.querySelector(
				'#room-created'
			).innerHTML = `Room successfully created. Click <a href='${roomLink}'>here</a> to enter room. 
                Share the room link with your partners.`;

			//empty the values
			document.querySelector('#room-name').value = '';
			// document.querySelector('#your-name').value = '';
		} else {
			document.querySelector('#err-msg').innerText = 'All fields are required';
		}
	});

	//When the 'Enter room' button is clicked.
	document.getElementById('enter-room').addEventListener('click', (e) => {
		e.preventDefault();

		let roomId = document.querySelector('#roomId').value;

		if (roomId) {
			//remove error message, if any
			document.querySelector('#err-msg-username').innerText = '';

			//load room
			window.open(location.origin + '/?room=' + roomId, '_self');
		} else {
			document.querySelector('#err-msg-username').innerText = 'Please input room url';
		}
	});

	document.addEventListener('click', (e) => {
		if (e.target && e.target.classList.contains('expand-remote-video')) {
			helpers.maximiseStream(e);
		} else if (e.target && e.target.classList.contains('mute-remote-mic')) {
			helpers.singleStreamToggleMute(e);
		}
	});

	document.getElementById('closeModal').addEventListener('click', () => {
		helpers.toggleModal('recording-options-modal', false);
	});

	document.getElementById('logout').addEventListener('click', () => {
		localStorage.removeItem('user');
		location.reload();
	});
});
