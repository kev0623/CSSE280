/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

//from internet
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.FB_COLLECTION_MOVIEQUOTE = "MovieQuotes";
rhit.FB_KEY_QUOTE = "quote";
rhit.FB_KEY_MOVIE = "movie";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author";
rhit.fbMovieQuotesManager = null;
rhit.fbSingleQuoteManager = null;
rhit.fbAuthManager = null;

rhit.ListPageController = class {
	constructor() {
		console.log("created ListPageController");


		document.querySelector("#menuShowAllQuotes").addEventListener("click", (event)  => {
			console.log("Show all Quotes")
			window.location.href = "/list.html"
		});
		document.querySelector("#menuShowMyQuotes").addEventListener("click", (event)  => {
			console.log("Show My Quotes")
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event)  => {
			console.log("Sign out")
			rhit.fbAuthManager.signOut();
		});
		// document.querySelector("#submitAddQuote").onclick = (event) => {
		// };

		document.querySelector("#submitAddQuote").addEventListener("click", (event)  => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			rhit.fbMovieQuotesManager.add(quote, movie);
		});

		$("#AddQuoteDialog").on("show.bs.modal", (event) => {
			//Pre animation
			const quote = document.querySelector("#inputQuote").value = "";
			const movie = document.querySelector("#inputMovie").value = "";
		});

		$("#AddQuoteDialog").on("shown.bs.modal", (event) => {
			//Post animation
			console.log("dialog is now visible")
			document.querySelector("#inputQuote").focus();
		});

		//Start Listening!
		rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));
	}

	updateList() {
		console.log("I need to update the list one the page!");
		console.log(`Num quotes = ${rhit.fbMovieQuotesManager.length}`);
		console.log("Example quote = ", rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(0));

		//Make a new quoteListContainer
		const newList = htmlToElement('<div id="quoteListContainer"></div>');
		//Fill the quoteListContainer with quote cards using a loop
		for(let i = 0; i < rhit.fbMovieQuotesManager.length; i++) {
			const mq = rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(i);
			const newCard = this._createCard(mq);
			newCard.onclick = (event) => {
				//console.log(`You clicked on ${mq.id}`);
				// rhit.storage.setMovieQuoteId(mq.id);
				window.location.href = `/moviequote.html?id=${mq.id}`;
			};
			newList.appendChild(newCard);
		}

		//Remove the old quoteListContainer
		const oldList = document.querySelector("#quoteListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		//Put in the new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}

	_createCard(MovieQuote) {
		return htmlToElement(`<div class="card">
		<div class="card-body">
		  <h5 class="card-title">${MovieQuote.quote}</h5>
		  <h6 class="card-subtitle mb-2 text-muted">${MovieQuote.movie}</h6>
		</div>
	   </div>`);
	}

}

rhit.MovieQuote = class {
	constructor(id, quote, movie) {
		this.id = id;
		this.quote = quote;
		this.movie = movie;
	}
}

rhit.FbMovieQuotesManager = class {
	constructor(uid) {
		console.log("created FbMovieQuotesManager");
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MOVIEQUOTE);
		this._unsubscribe = null;
	}
	add(quote, movie) {
		//Add a new document with a generated id.
		this._ref.add({
			[rhit.FB_KEY_QUOTE]: quote,
			[rhit.FB_KEY_MOVIE]: movie,
			[rhit.FB_KEY_AUTHOR] : rhit.fbAuthManager.uid,
			[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),

		})
		.then(function (docRef) {
			console.log("Dobument written with ID:", docRef.id);
		})
		.catch(function (error) {
			console.error("Error adding documnet: ", error);
		});
	}

	beginListening(changeListener){
		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if(this._uid) {
			query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("MovieQuote update!");
			this._documentSnapshots = querySnapshot.docs;

			// querySnapshot.forEach((doc) => {
			// 	console.log(doc.data());
			// });
			changeListener();
		});
	}
	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getMovieQuoteAtIndex(index) {
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
		document.querySelector("#menuSignOut").addEventListener("click", (event)  => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submitEditQuote").addEventListener("click", (event)  => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			rhit.fbSingleQuoteManager.update(quote, movie);
		});

		$("#editQuoteDialog").on("show.bs.modal", (event) => {
			//Pre animation
			const quote = document.querySelector("#inputQuote").value = rhit.fbSingleQuoteManager.quote;
			const movie = document.querySelector("#inputMovie").value = rhit.fbSingleQuoteManager.movie;
		});

		$("#editQuoteDialog").on("shown.bs.modal", (event) => {
			//Post animation
			document.querySelector("#inputQuote").focus();
		});

		document.querySelector("#submitDeleteQuote").addEventListener("click", (event)  => {
			rhit.fbSingleQuoteManager.delete().then(() => {
				console.log("Document successfully deleted!");
				window.location.href = "/list.html";
			}).catch(() => {
				console.error("Error removing document", error);
			});
		});
		rhit.fbSingleQuoteManager.beginListening(this.updateView.bind(this));
	}

	updateView() {
		document.querySelector("#cardQuote").innerHTML = rhit.fbSingleQuoteManager.quote;
		document.querySelector("#cardMovie").innerHTML = rhit.fbSingleQuoteManager.movie;
		if(rhit.fbSingleQuoteManager.author == rhit.fbAuthManager.uid) {
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
		console.log(`Listening to ${this._ref.path}`);
	}
	beginListening(changeListener) {
	this._unsubscribe = this._ref.onSnapshot((doc) => {
			if(doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				console.log("No such document!");
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
		.then(() => {
			console.log("Document successfully updated");
		})
		.catch(function (error) {
			console.error("Error adding documnet: ", error);
		});
	};
	delete() {
		return this._ref.delete();
	};
	get quote() {
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
// rhit.storage.MOVIEQUOTE_ID_KEY = "movieQuoteId"
// rhit.storage.getMovieQuoteId = function() {
// 	const mqId = sessionStorage.getItem(rhit.storage.MOVIEQUOTE_ID_KEY);
// 	if(!mqId) {
// 		console.log("No movie quote id in sessionStorage!")
// 	}
// 	return mqId;
// };

// rhit.storage.setMovieQuoteId = function(movieQuoteId) {
// 	sessionStorage.setItem(rhit.storage.MOVIEQUOTE_ID_KEY, movieQuoteId);
// };

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.singIn();
		};
	}
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	singIn() {
		console.log("TODO: Sign in using Rosefire");
		Rosefire.signIn("77b82ca4-c269-459e-92a2-d348f0c0b34b", (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);
			// TODO: Use the rfUser.token with your server.
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = code.error;
				const errorMessage = error.message;
				if(errorCode === 'auth/invalid-custom-token') {
					alert('The token you provieded is not valid.');
				} else {
					console.log("Custom auth error", errorCode, errorMessage);
				}
			});
		  });
		  
	}
	signOut() {
		firebase.auth().signOut().catch(function (error) {
			console.log("Sign out error");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
};

rhit.checkForRedirects = function() {
	if(document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/list.html";
	}

	if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
};

rhit.initializePage = function() {
	const urlParams = new URLSearchParams(window.location.search);
	if(document.querySelector("#listPage")) {
		console.log("You are on the list page.");
		const uid = urlParams.get("uid");
		rhit.fbMovieQuotesManager = new rhit.FbMovieQuotesManager(uid);
		new rhit.ListPageController();
	}

	if(document.querySelector("#detailPage")) {
		console.log("You are on the detail page.");
		const movieQuoteId = urlParams.get("id");
		if(!movieQuoteId) {
			window.location.href = "/";
		}
		rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(movieQuoteId);
		new rhit.DetailPageController();
	}

	if(document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
};


/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("auth change callback fired.");
		console.log("isSignedIn =", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
		rhit.initializePage();
	});

	// //Temp Code for Read and Add
	// const ref = firebase.firestore().collection("MovieQuotes");
	// ref.onSnapshot((querySnapshot)  => {

	// 	querySnapshot.forEach((doc) =>  {
	// 		console.log(doc.data());
	//   });
	// });

	// ref.add({
	// 	quote: "My first test",
	// 	movie: "My first movie",
	// 	lastTouched: firebase.firestore.Timestamp.now(),
	// }); 
};

rhit.main();
