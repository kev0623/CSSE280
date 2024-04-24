var rhit = rhit || {};

rhit.FB_COLLECTION_PHOTOBUCKET = "PhotoBucket";
rhit.FB_KEY_URL = "photoUrl";
rhit.FB_KEY_CAPTION = "caption";
rhit.FB_KEY_LAST_TOUCHED = "timestamp";
rhit.FB_KEY_AUTHOR = "author";

rhit.fbPhotoBucketManager = null;
rhit.fbSingleUrlManager = null;
rhit.fbAuthManager = null;

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {
		document.querySelector("#menuShowAllPhotos").addEventListener("click", (event) => {
			window.location.href = "/list.html";
		});
		document.querySelector("#menuShowMyPhotos").addEventListener("click", (event) => {
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submit").onclick = (event) => {
			const url = document.querySelector("#inputPhoto").value;
			const caption = document.querySelector("#inputCaption").value;
			rhit.fbPhotoBucketManager.add(url, caption);
		};

		$("#addPhoto").on("show.bs.modal", (event) => {
			document.querySelector("#inputPhoto").value = "";
			document.querySelector("#inputCaption").value = "";
		})
		$("#addPhoto").on("shown.bs.modal", (event) => {
			document.querySelector("#inputPhoto").focus();
		})

		//Start Listening!
		rhit.fbPhotoBucketManager.beginListening(this.updateList.bind(this));
	}

	updateList() {
		console.log("I need to update the list on the page!");
		console.log(`Num pics: ${rhit.fbPhotoBucketManager.length}`);
		console.log(`Example url: ${rhit.fbPhotoBucketManager.getUrlAtIndex(0)}`);

		const newList = htmlToElement('<div id="columns"></div>');

		for (let i = 0; i < rhit.fbPhotoBucketManager.length; i++) {
			const photo = rhit.fbPhotoBucketManager.getUrlAtIndex(i);
			const newCard = this._createCard(photo);
			newCard.onclick = (event) => {
				window.location.href = `/photopage.html?id=${photo.id}`;
			}
			newList.appendChild(newCard);
		}
		const oldList = document.querySelector("#columns");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	_createCard(photo) {
		return htmlToElement(`
    		<div class="pin" id="${photo.id}">
			<img src="${photo.url}" alt="${photo.caption}">
        		<p class="caption">${photo.caption}</p>
    		</div>
		`);
	}
}

rhit.PhotoBucket = class {
	constructor(id, url, caption) {
		this.id = id;
		this.url = url;
		this.caption = caption;
	}
}

rhit.fbPhotoBucketManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PHOTOBUCKET);
		this._unsubscribe = null;

	}

	add(url, caption) {
		console.log(url);
		console.log(caption);

		this._ref.add({
				[rhit.FB_KEY_URL]: url,
				[rhit.FB_KEY_CAPTION]: caption,
				[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {
				console.log("Docuent written with ID: ", docRef.id);
			})
			.catch(function (error) {

				console.log("Error adding document", error);

			})

	}
	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED,"desc").limit(50);
		if(this._uid){
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("PhotoBucket update!");
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		});
	}
	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}

	getUrlAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const pic = new rhit.PhotoBucket(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_URL),
			docSnapshot.get(rhit.FB_KEY_CAPTION)
		)
		return pic;
	}
}

rhit.PhotoPageController = class {
	constructor() {

		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submitEditCaption").onclick = (event) => {
			const caption = document.querySelector("#inputCaption").value;
			rhit.fbSingleUrlManager.update(caption);
		};

		$("#editCaption").on("show.bs.modal", (event) => {
			document.querySelector("#inputCaption").value = rhit.fbSingleUrlManager.caption;
		})
		$("#editCaption").on("shown.bs.modal", (event) => {
			document.querySelector("#inputCaption").focus();
		})

		document.querySelector("#submitDeletePhoto").addEventListener("click", (event)  => {

			rhit.fbSingleUrlManager.delete().then(() => {
				console.log("Document successfully deleted!");
				window.location.href = "/list.html";
			}).catch((error) => {
				console.error("Error removing document: ", error);
			});

		});

		rhit.fbSingleUrlManager.beginListening(this.updateView.bind(this));
	}
	updateView() {
		document.querySelector("#cardPhoto").src = rhit.fbSingleUrlManager.url;
		document.querySelector("#cardCaption").innerHTML = rhit.fbSingleUrlManager.caption;
		if(rhit.fbSingleUrlManager.author == rhit.fbAuthManager.uid){
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}

rhit.fbSingleUrlManager = class {
	constructor(pictureId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PHOTOBUCKET).doc(pictureId);
	}
	beginListening(changeListener) {

		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot= doc;
				changeListener();
			} else {
				console.log("No such document!");
			}
		});

	}
	stopListening() {
		this._unsubscribe();
	}
	update(caption) {
		this._ref.update({

			[rhit.FB_KEY_CAPTION]:caption,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
		.then(() =>{
			console.log("Document Successfully updated");
		})
		.catch(function(error){
			console.log("Error updating document", error);
		})
	}
	delete() {
		return this._ref.delete();
	}

	get url(){
		return this._documentSnapshot.get(rhit.FB_KEY_URL);
	}

	get caption(){
		return this._documentSnapshot.get(rhit.FB_KEY_CAPTION);
	}

	get author(){
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}

rhit.LoginPageController = class {
	constructor() {
		console.log("You have made the Login Page Controller")
		document.querySelector("#rosefireButton").onclick = (event) => {

			rhit.fbAuthManager.signIn();
		};
	}
}
rhit.fbAuthManager = class {
	constructor() {
		this._user = null;
		console.log("You have made the auth Manager")
	}
	beginListening(changeListener) {

		firebase.auth().onAuthStateChanged((user) => {

			this._user = user;
			changeListener();

		});
	}

	signIn() {
		console.log("Sign in using Rosefire");
		Rosefire.signIn("46e91dcf-fb52-4ce7-beaf-abd8d359e235", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}
			});
		});

	}


	signOut() {
		firebase.auth().signOut().then(() => {
			console.log("You are now signed out");
		}).catch((error) => {
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

rhit.checkForRedirects = function(){
	if(document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn){
		window.location.href = "/list.html"
	}

	if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn){
		window.location.href = "/"
	}

}

rhit.initializePage = function(){
	const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#listPage")) {
		console.log("You are on the List Page");
		const uid = urlParams.get("uid");
		rhit.fbPhotoBucketManager = new rhit.fbPhotoBucketManager(uid);
		new rhit.ListPageController();
	}

	if (document.querySelector("#photopage")) {
		const captionId = urlParams.get("id");
		if (!captionId) {
			window.location.href = "/";
		}
		rhit.fbSingleUrlManager = new rhit.fbSingleUrlManager(captionId);
		new rhit.PhotoPageController();
	}
	if (document.querySelector("#loginPage")) {
		console.log("You are on the Login Page");
		new rhit.LoginPageController();
	}
	rhit.startFirebaseUI();
}

rhit.startFirebaseUI = function(){
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
	  
	  ui.start('#firebaseui-auth-container', {
		signInOptions: [
		  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		  firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		],
		// Other config options...
	  });
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.fbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});
};

rhit.main();