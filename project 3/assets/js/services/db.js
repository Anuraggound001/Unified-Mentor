// Centralized Firestore data access and helpers
// eslint-disable-next-line no-undef
const DbService = (() => {
	const db = firebase.firestore();

	// Collections: users, members, packages, receipts, notifications

	// Members
	async function addMember(member) {
		member.createdAt = firebase.firestore.FieldValue.serverTimestamp();
		const ref = await db.collection('members').add(member);
		LoggingService.info('Member added', { id: ref.id });
		return ref.id;
	}
	async function updateMember(id, updates) {
		updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
		await db.collection('members').doc(id).update(updates);
		LoggingService.info('Member updated', { id });
	}
	async function deleteMember(id) {
		await db.collection('members').doc(id).delete();
		LoggingService.warn('Member deleted', { id });
	}
	async function listMembers(limit = 100) {
		const snap = await db.collection('members').orderBy('createdAt', 'desc').limit(limit).get();
		return snap.docs.map(d => ({ id: d.id, ...d.data() }));
	}

	// Packages
	async function upsertPackage(id, data) {
		if (id) {
			await db.collection('packages').doc(id).set(data, { merge: true });
			return id;
		}
		const ref = await db.collection('packages').add(data);
		return ref.id;
	}
	async function listPackages() {
		const snap = await db.collection('packages').get();
		return snap.docs.map(d => ({ id: d.id, ...d.data() }));
	}

	// Receipts
	async function createReceipt(data) {
		data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
		const ref = await db.collection('receipts').add(data);
		LoggingService.info('Receipt created', { id: ref.id });
		return ref.id;
	}
	async function listReceiptsByMember(memberId) {
		const snap = await db.collection('receipts').where('memberId', '==', memberId).orderBy('createdAt', 'desc').get();
		return snap.docs.map(d => ({ id: d.id, ...d.data() }));
	}

	// Notifications
	async function addNotification(notification) {
		notification.createdAt = firebase.firestore.FieldValue.serverTimestamp();
		await db.collection('notifications').add(notification);
	}
	async function listNotifications(uid) {
		const snap = await db.collection('notifications').where('uid', '==', uid).orderBy('createdAt', 'desc').limit(50).get();
		return snap.docs.map(d => ({ id: d.id, ...d.data() }));
	}

	// Users
	async function ensureUser(uid, data) {
		await db.collection('users').doc(uid).set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
	}
	async function getUser(uid) {
		const doc = await db.collection('users').doc(uid).get();
		return doc.exists ? { id: uid, ...doc.data() } : null;
	}

	return {
		addMember, updateMember, deleteMember, listMembers,
		upsertPackage, listPackages,
		createReceipt, listReceiptsByMember,
		addNotification, listNotifications,
		ensureUser, getUser,
		_db: db,
	};
})();

/* Firestore Rules guidance (apply in Firebase Console):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'; }

    match /users/{uid} { allow read, write: if isSignedIn() && uid == request.auth.uid || isAdmin(); }
    match /members/{id} { allow read: if isSignedIn(); allow write: if isAdmin(); }
    match /packages/{id} { allow read: if true; allow write: if isAdmin(); }
    match /receipts/{id} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.memberUid == request.auth.uid);
      allow write: if isAdmin();
    }
    match /notifications/{id} {
      allow read, write: if isAdmin() || (isSignedIn() && request.resource.data.uid == request.auth.uid);
    }
  }
}
*/


