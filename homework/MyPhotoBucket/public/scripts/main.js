var rhit = rhit || {};

rhit.FB_COLLECTION_PHOTOBUCKET = "Photos";
rhit.FB_KEY_IMAGE = "imageURL";
rhit.FB_KEY_CAPTION = "caption";
rhit.FB_KEY_LAST_TOUCHED = "LastTouched";
rhit.FB_KEY_AUTHOR = "author";
rhit.fbPhotoBucketManager = null;
rhit.fbSinglePhotoManager = null;
rhit.fbAuthManager = null;

// From stack overflow https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {
		document.querySelector("#menuShowAllPhotos").addEventListener("click", (event) => {
			window.location.href = "/bucket.html";
		});
		document.querySelector("#menuShowMyPhotos").addEventListener("click", (event) => {
			window.location.href = `/bucket.html?uid=${rhit.fbAuthManager.uid}`
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submitAddPhoto").addEventListener("click", (event) => {
			const imageURL = document.querySelector("#inputImageURL").value;
			const caption = document.querySelector("#inputCaption").value;
			rhit.fbPhotoBucketManager.add(imageURL, caption);
		});

		$("#addPhotoDialog").on("show.bs.modal", (event) => {
			// pre-animation
			document.querySelector("#inputImageURL").value = "";
			document.querySelector("#inputCaption").value = "";
		});
		$("#addPhotoDialog").on("shown.bs.modal", (event) => {
			// post-animation
			document.querySelector("#inputImageURL").focus();
		});
		// Start listening
		rhit.fbPhotoBucketManager.beginListening(this.updateList.bind(this));
	}
	updateList() {
		console.log("I need to update the list on the page");
		console.log(`Num photos = ${rhit.fbPhotoBucketManager.length}`);
		console.log(`Example photo = `, rhit.fbPhotoBucketManager.getPhotoAtIndex(0));

		// Make a new quoteListContainer
		const newList = htmlToElement('<div id="columns"></div>');
		// Fill the quoteListContainer with quote cards using a loop
		for (let i=0;i<rhit.fbPhotoBucketManager.length;i++) {
			const img = rhit.fbPhotoBucketManager.getPhotoAtIndex(i);
			const newCard = this._createCard(img)

			newCard.onclick = (event) => {
				// rhit.storage.setMovieQuoteId(mq.id);
				window.location.href = `/photo.html?id=${img.id}`;
			}

			newList.appendChild(newCard);
		}
		// Remove the old quoteListContainer
		const oldList = document.querySelector("#columns");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// Put in the new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}
	_createCard(photo) {
		return htmlToElement(`<div class="pin" id="${photo.id}">
        <img
          src="${photo.imageURL}"
          alt="${photo.caption}">
        <p class="caption">${photo.caption}</p>
      </div>`)
	}
}

rhit.Photo = class {
	constructor(id, imageURL, caption) {
		this.id = id;
		this.imageURL = imageURL;
		this.caption = caption;
	}
}

rhit.FBPhotoBucketManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PHOTOBUCKET);
		this._unsubscribe = null;
	}
	add(imageURL, caption){
		this._ref.add({
			[rhit.FB_KEY_IMAGE]: imageURL,
			[rhit.FB_KEY_CAPTION]: caption,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
		})
		.then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.error("Error adding document: ", error);
		})
	}
	beginListening(changelistener){
		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this.unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("PhotoBucket update");
			this._documentSnapshots = querySnapshot.docs;
			changelistener();
		})
	}
	stopListening(){
		this.unsubscribe();
	}
	get length(){
		return this._documentSnapshots.length;
	}
	getPhotoAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		const img = new rhit.Photo(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_IMAGE),
			docSnapshot.get(rhit.FB_KEY_CAPTION));
			return img;
	}
}

rhit.PhotoPageController = class {
	constructor() {
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submitEditCaption").addEventListener("click", (event) => {
			const caption = document.querySelector("#inputCaption").value;
			rhit.fbSinglePhotoManager.update(caption);
		});

		$("#editPhotoDialog").on("show.bs.modal", (event) => {
			// pre-animation
			document.querySelector("#inputCaption").value = rhit.fbSinglePhotoManager.caption;
		});
		$("#editPhotoDialog").on("shown.bs.modal", (event) => {
			// post-animation
			document.querySelector("#inputCaption").focus();
		});

		document.querySelector("#submitDeletePhoto").addEventListener("click", (event) => {
			rhit.fbSinglePhotoManager.delete().then(() => {
				console.log("successfully deleted");
				window.location.href = "/bucket.html";
			}).catch((error) => {
				console.error("error removing: ", error);
			});;
		});

		rhit.fbSinglePhotoManager.beginListening(this.updateView.bind(this));
	}
	updateView() {  
		document.querySelector("#photo").src = rhit.fbSinglePhotoManager.imageURL;
		document.querySelector("#caption").innerHTML = rhit.fbSinglePhotoManager.caption;
		if (rhit.fbSinglePhotoManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}

rhit.FbSinglePhotoManager = class {
	constructor(photoId) {
	  this._documentSnapshot = {};
	  this._unsubscribe = null;
	  this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PHOTOBUCKET).doc(photoId);
	}
	beginListening(changeListener) {
		console.log("hi");
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log(doc.data());
				this._documentSnapshot = doc;
				console.log(doc);
				changeListener();
			} else {
				console.log("no such document!");
			}
		});
	}
	stopListening() {
	  this._unsubscribe();
	}
	update(caption) {
		this._ref.update({
			[rhit.FB_KEY_CAPTION]: caption,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
		.then(function () {
			console.log("Document successfully updated");
		})
		.catch(function (error) {
			console.error("Error adding document: ", error);
		})
	}
	delete() {
		return this._ref.delete();
	}
	get imageURL() {
		console.log(this._documentSnapshot);
		return this._documentSnapshot.get(rhit.FB_KEY_IMAGE);
	}
	get caption() {
		return this._documentSnapshot.get(rhit.FB_KEY_CAPTION);
	}
	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = () => {
			rhit.fbAuthManager.signInWithRosefire();
		};
	};
}

rhit.fbAuthManager = class {
	constructor() {
		this._user = null;
		console.log("made auth manager");
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signInWithRosefire() {
		Rosefire.signIn("77b82ca4-c269-459e-92a2-d348f0c0b34b", (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is invalid.');
				} else {
					console.error(error);
				}
			});
		  });
	}
	signOut() {
		firebase.auth().signOut().catch(function (error) {
			console.log("sign out error");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/bucket.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
};

rhit.initializePage = function () {
	if(document.querySelector("#listPage")) {
		const urlParams = new URLSearchParams(window.location.search);
		const uid = urlParams.get("uid");
		rhit.fbPhotoBucketManager = new rhit.FBPhotoBucketManager(uid);
		new rhit.ListPageController();
	}
	if(document.querySelector("#detailPage")) {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const photoId = urlParams.get("id");
		if (!photoId) {
			window.location.href = "/"
		}
		rhit.fbSinglePhotoManager = new rhit.FbSinglePhotoManager(photoId);
		new rhit.PhotoPageController();
	}
	if(document.querySelector("#loginPage")) {
		rhit.startFirebaseUI();
		new rhit.LoginPageController();
	}
};

rhit.startFirebaseUI = function () {
	var uiConfig = {
        signInSuccessUrl: '/bucket.html',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
      };
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start('#firebaseui-auth-container', uiConfig);
}

rhit.main = function () {
	rhit.fbAuthManager = new rhit.fbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		rhit.checkForRedirects();
		rhit.initializePage();
	});
};

rhit.main();
