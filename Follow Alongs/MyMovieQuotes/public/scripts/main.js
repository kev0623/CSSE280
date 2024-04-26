
var rhit = rhit || {};

rhit.FB_COLLECTION_MOVIEQUOTE = "MovieQuotes";
rhit.FB_KEY_QUOTE = "quote";
rhit.FB_KEY_MOVIE = "movie";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author";
rhit.fbMovieQuotesManager = null;
rhit.fbSingleQuoteManager = null;
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
		document.querySelector("#menuShowAllQuotes").addEventListener("click", (event) => {
			window.location.href = "/list.html"
		});
		document.querySelector("#menuShowMyQuotes").addEventListener("click", (event) => {
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submitAddQuote").addEventListener("click", (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			rhit.fbMovieQuotesManager.add(quote, movie);
		});

		$("#addQuoteDialog").on("show.bs.modal", (event) => {
			// pre-animation
			document.querySelector("#inputQuote").value = "";
			document.querySelector("#inputMovie").value = "";
		});
		$("#addQuoteDialog").on("shown.bs.modal", (event) => {
			// post-animation
			document.querySelector("#inputQuote").focus();
		});
		// Start listening
		rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));
	}
	updateList() {
		console.log("I need to update the list on the page");
		console.log(`Num quotes = ${rhit.fbMovieQuotesManager.length}`);
		console.log(`Example quote = `, rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(0));

		// Make a new quoteListContainer
		const newList = htmlToElement('<div id="quoteListContainer"></div>');
		// Fill the quoteListContainer with quote cards using a loop
		for (let i=0;i<rhit.fbMovieQuotesManager.length;i++) {
			const mq = rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(i);
			const newCard = this._createCard(mq)

			newCard.onclick = (event) => {
				// rhit.storage.setMovieQuoteId(mq.id);
				window.location.href = `/moviequote.html?id=${mq.id}`;
			}

			newList.appendChild(newCard);
		}
		// Remove the old quoteListContainer
		const oldList = document.querySelector("#quoteListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// Put in the new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}
	_createCard(movieQuote) {
		return htmlToElement(`<div class="card">
        <div class="card-body">
          <h5 class="card-title">${movieQuote.quote}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
        </div>
      </div>`)
	}
}

rhit.MovieQuote = class {
	constructor(id, quote, movie) {
		this.id = id;
		this.quote = quote;
		this.movie = movie;
	}
}

rhit.FBMovieQuotesManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MOVIEQUOTE);
		this._unsubscribe = null;
	}
	add(quote, movie){
		this._ref.add({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
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
			console.log("MovieQuote update");
			this._documentSnapshots = querySnapshot.docs;
			// querySnapshot.forEach((doc) => {
			// 	console.log(doc.data());
			// });

			changelistener();
			
		})
	}
	stopListening(){
		this.unsubscribe();
	}
	// update(id, quote, movie){}
	// delete(id){}
	get length(){
		return this._documentSnapshots.length;
	}
	getMovieQuoteAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_QUOTE),
			docSnapshot.get(rhit.FB_KEY_MOVIE));
			return mq;
	}
}

rhit.DetailPageController = class {
	constructor() {
		document.querySelector("#submitEditQuote").addEventListener("click", (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			rhit.fbSingleQuoteManager.update(quote, movie);
		});

		$("#editQuoteDialog").on("show.bs.modal", (event) => {
			// pre-animation
			document.querySelector("#inputQuote").value = rhit.fbSingleQuoteManager.quote;
			document.querySelector("#inputMovie").value = rhit.fbSingleQuoteManager.movie;
		});
		$("#editQuoteDialog").on("shown.bs.modal", (event) => {
			// post-animation
			document.querySelector("#inputQuote").focus();
		});

		document.querySelector("#submitDeleteQuote").addEventListener("click", (event) => {
			rhit.fbSingleQuoteManager.delete().then(() => {
				console.log("successfully deleted");
				window.location.href = "/list.html";
			}).catch((error) => {
				console.error("error removing: ", error);
			});;
		});

		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		})

		rhit.fbSingleQuoteManager.beginListening(this.updateView.bind(this));
	}
	updateView() {  
		document.querySelector("#cardQuote").innerHTML = rhit.fbSingleQuoteManager.quote;
		document.querySelector("#cardMovie").innerHTML = rhit.fbSingleQuoteManager.movie;
		if (rhit.fbSingleQuoteManager.author == rhit.fbAuthManager.uid) {
			document.querySelector("#menuEdit").style.display = "flex";
			document.querySelector("#menuDelete").style.display = "flex";
		}
	}
}

rhit.FbSingleQuoteManager = class {
	constructor(movieQuoteId) {
	  this._documentSnapshot = {};
	  this._unsubscribe = null;
	  this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MOVIEQUOTE).doc(movieQuoteId);
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
	update(quote, movie) {
		this._ref.update({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
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
	get quote() {
		console.log(this._documentSnapshot);
		return this._documentSnapshot.get(rhit.FB_KEY_QUOTE);
	}
	get movie() {
		return this._documentSnapshot.get(rhit.FB_KEY_MOVIE);
	}
	get author() {
		return this._documentSnapshot.get(rhit.FB_KEY_AUTHOR);
	}
}

// rhit.storage = rhit.storage || {};
// rhit.storage.MOVIEQUOTE_ID_KEY = "movieQuoteId";
// rhit.storage.getMovieQuoteId = function() {
// 	const mqId = sessionStorage.getItem(rhit.storage.MOVIEQUOTE_ID_KEY);
// 	if (!mqId) {
// 		console.log("No movie quote id in session storage");
// 	}
// 	return mqId;
// };
// rhit.storage.setMovieQuoteId = function(id) {
// 	sessionStorage.setItem(rhit.storage.MOVIEQUOTE_ID_KEY, id);
// };

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#roseFireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		}
	}
}

rhit.FbAuthManager = class {
	constructor() {this._user = null; console.log("you have made the auth manager");}
	beginListening(changeListener) {
	  firebase.auth().onAuthStateChanged((user) => {
		this._user = user;
		changeListener();
	  });
	}
	signIn() {
		console.log("Sign in using Rosefire");
		// Please note this needs to be the result of a user interaction
		// (like a button click) otherwise it will get blocked as a popup
		Rosefire.signIn("5757b144-c538-4a78-a066-a2cde9f7d30b", (err, rfUser) => {
			if (err) {
	  			console.log("Rosefire error!", err);
	  		return;
			}
		console.log("Rosefire success!", rfUser);

		firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			if (errorCode === 'auth/invalid-custom-token') {
				alert('the token you provided is invalid')
			} else {
				console.log("custom auth error: ", errorCode, errorMessage);
			}
		});
	
		// TODO: Use the rfUser.token with your server.
  		});
	}
	signOut() {firebase.auth().signOut();}
	get uid() {return this._user.uid;}
	get isSignedIn() {return !!this._user;}
}

rhit.checkForRedirects = function() {
	if(document.querySelector("#loginPage") && this.fbAuthManager.isSignedIn) {
		window.location.href = "/list.html";
	}
	if(!document.querySelector("#loginPage") && !this.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
}

rhit.initializePage = function() {
	const urlParams = new URLSearchParams(window.location.search);
	if(document.querySelector("#loginPage")) {
		new rhit.LoginPageController();
	}
	if(document.querySelector("#listPage")) {
		const uid = urlParams.get("uid");
		rhit.fbMovieQuotesManager = new rhit.FBMovieQuotesManager(uid);
		new rhit.ListPageController();
	}
	if(document.querySelector("#detailPage")) {
		// const movieQuoteId = rhit.storage.getMovieQuoteId();
		const movieQuoteId = urlParams.get("id");
		if (!movieQuoteId) {
			window.location.href = "/"
		}
		rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(movieQuoteId);
		new rhit.DetailPageController();
	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", this.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});
	

	// Temp code for Read and Add
	// const ref = firebase.firestore().collection("MovieQuotes");
	// ref.onSnapshot((querySnapshot) => {
		
	// 	querySnapshot.forEach((doc) => {
	// 		console.log(doc.data());
	// 	});
		
	// });

	// ref.add({
	// 	quote: "My first test",
	// 	movie: "My first movie",
	//  lastTouched: firebase.firestore.Timestamp.now(),
	// })
};

rhit.main();
