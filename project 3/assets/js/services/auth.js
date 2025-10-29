// AuthService wraps Firebase Auth and user profile role retrieval
// eslint-disable-next-line no-undef
const AuthService = (() => {
	const auth = firebase.auth();
	const db = firebase.firestore();
	LoggingService.setFirestore(db);

	async function signIn(email, password) {
		const res = await auth.signInWithEmailAndPassword(email, password);
		LoggingService.info('User signed in', { uid: res.user.uid });
		return res.user;
	}

	async function signUp(email, password) {
		const res = await auth.createUserWithEmailAndPassword(email, password);
		LoggingService.info('User signed up', { uid: res.user.uid });
		return res.user;
	}

	async function signOut() {
		await auth.signOut();
		LoggingService.info('User signed out');
	}

	async function currentUser() {
		return auth.currentUser;
	}

	async function getUserRole(uid) {
		try {
			const doc = await db.collection('users').doc(uid).get();
			return (doc.exists && doc.data().role) || 'user';
		} catch (error) {
			LoggingService.warn('Failed to read user role, defaulting to user', { uid, error: (error && (error.code || error.message)) || 'unknown' });
			return 'user';
		}
	}

	async function setUserRole(uid, role) {
		await db.collection('users').doc(uid).set({ role }, { merge: true });
		LoggingService.info('Role updated', { uid, role });
	}

	return { signIn, signUp, signOut, currentUser, getUserRole, setUserRole, auth, db };
})();


