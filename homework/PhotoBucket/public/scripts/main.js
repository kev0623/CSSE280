var pb = pb || {};

pb.COLLECTION_PHOTOS = "Photos";
pb.KEY_IMAGE_URL = "imageURL";
pb.KEY_CAPTION = "caption";
pb.KEY_LAST_MODIFIED = "LastTouched";
pb.photoManager = null;
pb.singlePhotoController = null;

// Function to convert HTML string into DOM element
function convertHTML(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

pb.PhotoGridController = class {
	constructor() {
		document.querySelector("#submitAddPhoto").addEventListener("click", () => {
			const imageURL = document.querySelector("#inputImageURL").value;
			const caption = document.querySelector("#inputCaption").value;
			pb.photoManager.addPhoto(imageURL, caption);
		});

		$("#addPhotoDialog").on("show.bs.modal", () => {
			document.querySelector("#inputImageURL").value = "";
			document.querySelector("#inputCaption").value = "";
		});
		$("#addPhotoDialog").on("shown.bs.modal", () => {
			document.querySelector("#inputImageURL").focus();
		});
		pb.photoManager.startObserving(this.updateGrid.bind(this));
	}
	updateGrid() {
		const newGrid = convertHTML('<div id="columns"></div>');
		for (let i = 0; i < pb.photoManager.numPhotos; i++) {
			const photo = pb.photoManager.getPhoto(i);
			const newCard = this.createPhotoCard(photo);
			newCard.onclick = () => {
				window.location.href = `/photo.html?id=${photo.id}`;
			};
			newGrid.appendChild(newCard);
		}
		const oldGrid = document.querySelector("#columns");
		oldGrid.parentNode.replaceChild(newGrid, oldGrid);
	}
	createPhotoCard(photo) {
		return convertHTML(`<div class="pin" id="${photo.id}">
        <img src="${photo.imageURL}" alt="${photo.caption}">
        <p class="caption">${photo.caption}</p>
      </div>`);
	}
}

pb.Photo = class {
	constructor(id, imageURL, caption) {
		this.id = id;
		this.imageURL = imageURL;
		this.caption = caption;
	}
}

pb.PhotoManager = class {
	constructor() {
		this._documents = [];
		this._reference = firebase.firestore().collection(pb.COLLECTION_PHOTOS);
		this._unsubscriber = null;
	}
	addPhoto(imageURL, caption) {
		this._reference.add({
			[pb.KEY_IMAGE_URL]: imageURL,
			[pb.KEY_CAPTION]: caption,
			[pb.KEY_LAST_MODIFIED]: firebase.firestore.Timestamp.now(),
		})
		.then(docRef => console.log("Document added with ID: ", docRef.id))
		.catch(error => console.error("Error adding document: ", error));
	}
	startObserving(changeListener) {
		this._unsubscriber = this._reference.orderBy(pb.KEY_LAST_MODIFIED, "desc").limit(50).onSnapshot(querySnapshot => {
			this._documents = querySnapshot.docs;
			changeListener();
		});
	}
	stopObserving() {
		if (this._unsubscriber) {
			this._unsubscriber();
		}
	}
	get numPhotos() {
		return this._documents.length;
	}
	getPhoto(i) {
		const doc = this._documents[i];
		return new pb.Photo(doc.id, doc.get(pb.KEY_IMAGE_URL), doc.get(pb.KEY_CAPTION));
	}
}

pb.PhotoDetailController = class {
	constructor() {
		document.querySelector("#submitEditCaption").addEventListener("click", () => {
			const caption = document.querySelector("#inputCaption").value;
			pb.singlePhotoController.updateCaption(caption);
		});

		$("#editPhotoDialog").on("show.bs.modal", () => {
			document.querySelector("#inputCaption").value = pb.singlePhotoController.caption;
		});
		$("#editPhotoDialog").on("shown.bs.modal", () => {
			document.querySelector("#inputCaption").focus();
		});

		document.querySelector("#submitDeletePhoto").addEventListener("click", () => {
			pb.singlePhotoController.deletePhoto().then(() => {
				window.location.href = "/";
			}).catch(error => console.error("Error removing: ", error));
		});

		pb.singlePhotoController.startObserving(this.refreshView.bind(this));
	}
	refreshView() {
		document.querySelector("#photo").src = pb.singlePhotoController.imageURL;
		document.querySelector("#caption").textContent = pb.singlePhotoController.caption;
	}
}

pb.SinglePhotoController = class {
	constructor(photoId) {
		this._docSnapshot = {};
		this._unsub = null;
		this._ref = firebase.firestore().collection(pb.COLLECTION_PHOTOS).doc(photoId);
	}
	startObserving(changeListener) {
		this._unsub = this._ref.onSnapshot(doc => {
			if (doc.exists) {
				this._docSnapshot = doc;
				changeListener();
			} else {
				console.log("No such document!");
			}
		});
	}
	stopObserving() {
		if (this._unsub) {
			this._unsub();
		}
	}
	updateCaption(caption) {
		this._ref.update({
			[pb.KEY_CAPTION]: caption,
			[pb.KEY_LAST_MODIFIED]: firebase.firestore.Timestamp.now(),
		})
		.then(() => console.log("Document successfully updated"))
		.catch(error => console.error("Error updating document: ", error));
	}
	deletePhoto() {
		return this._ref.delete();
	}
	get imageURL() {
		return this._docSnapshot.get(pb.KEY_IMAGE_URL);
	}
	get caption() {
		return this._docSnapshot.get(pb.KEY_CAPTION);
	}
}

pb.main = function () {
	if (document.querySelector("#listPage")) {
		pb.photoManager = new pb.PhotoManager();
		new pb.PhotoGridController();
	}
	if (document.querySelector("#detailPage")) {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const photoId = urlParams.get("id");
		if (!photoId) {
			window.location.href = "/";
		}
		pb.singlePhotoController = new pb.SinglePhotoController(photoId);
		new pb.PhotoDetailController();
	}
};

pb.main();
