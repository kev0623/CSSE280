var rhit = rhit || {};

rhit.main = function () {
	console.log("Ready");

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			const displayName = user.displayName;
			const email = user.email;
			const photoURL = user.photoURL;
			const phoneNumber = user.phoneNumber;
			const isAnonymous = user.isAnonymous;
			const uid = user.uid;
			console.log("user is signed in ", uid);
			console.log('displayName :>> ', displayName);
			console.log('email :>> ', email);
			console.log('photoURL :>> ', photoURL);
			console.log('phoneNumber :>> ', phoneNumber);
			console.log('isAnonymous :>> ', isAnonymous);
			console.log('uid :>> ', uid);
		} else {
			console.log("there is no user signed in");
		}
	});

	const inputEmail = document.querySelector("#inputEmail")
	const inputPassword = document.querySelector("#inputPassword")

	document.querySelector("#signOutButton").onclick = () => {
		console.log("sign out");
		firebase.auth().signOut().then(function () {
			console.log("you are now signed out");
		}).catch(function(error) {
			console.log("sign out error");
		});
	};
	document.querySelector("#createAccountButton").onclick = () => {
		console.log(`Create accbount for email: ${inputEmail.value} password: ${inputPassword.value}`);
		firebase.auth().createUserWithEmailAndPassword(inputEmail.value, inputPassword.value).catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("create account error", errorCode, errorMessage);
		});
	};
	document.querySelector("#logInButton").onclick = () => {
		console.log(`Log in for email: ${inputEmail.value} password: ${inputPassword.value}`);
		firebase.auth().signInWithEmailAndPassword(inputEmail.value,inputPassword.value).catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("sign in error", errorCode, errorMessage);
		});
	};
	document.querySelector("#anonAuthButton").onclick = () => {
		firebase.auth().signInAnonymously().catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("anonymous sign in error", errorCode, errorMessage);
		});
	};
	rhit.startFirebaseUI();
};

rhit.startFirebaseUI = function () {
	var uiConfig = {
        signInSuccessUrl: '/',
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

rhit.main();
