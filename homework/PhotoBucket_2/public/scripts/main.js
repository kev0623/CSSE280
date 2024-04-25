var rhit = rhit || {};

rhit.FB_COLLECTION_PHOTOBUCKET = "Photos";
rhit.FB_KEY_IMAGE = "imageURL";
rhit.FB_KEY_CAPTION = "caption";
rhit.FB_KEY_LAST_TOUCHED = "LastTouched";
rhit.fbPhotoBucketManager = null;
rhit.fbSinglePhotoManager = null;

// From stack overflow https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ListPageController = class {
	constructor() {
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
	constructor() {
		console.log("created photobucketmanager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_PHOTOBUCKET);
		this._unsubscribe = null;
	}
	add(imageURL, caption){
		this._ref.add({
			[rhit.FB_KEY_IMAGE]: imageURL,
			[rhit.FB_KEY_CAPTION]: caption,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		})
		.then(function (docRef) {
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function (error) {
			console.error("Error adding document: ", error);
		})
	}
	beginListening(changelistener){
		this.unsubscribe = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50).onSnapshot((querySnapshot) => {
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
				window.location.href = "/";
			}).catch((error) => {
				console.error("error removing: ", error);
			});;
		});

		rhit.fbSinglePhotoManager.beginListening(this.updateView.bind(this));
	}
	updateView() {  
		document.querySelector("#photo").src = rhit.fbSinglePhotoManager.imageURL;
		document.querySelector("#caption").innerHTML = rhit.fbSinglePhotoManager.caption;
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
}

rhit.main = function () {
	if(document.querySelector("#listPage")) {
		rhit.fbPhotoBucketManager = new rhit.FBPhotoBucketManager();
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
};

rhit.main();
