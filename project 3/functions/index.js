// Optional Cloud Functions (Node 18) for scheduled reminders
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Runs daily at 09:00 Asia/Kolkata to remind members of dues
exports.dailyFeeDueReminder = functions.pubsub
	.schedule('0 9 * * *')
	.timeZone('Asia/Kolkata')
	.onRun(async () => {
		const today = new Date();
		const yyyyMm = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
		const membersSnap = await db.collection('members').get();
		for (const doc of membersSnap.docs) {
			const m = doc.data();
			// Heuristic: if no receipt for this month, send reminder
			const receipts = await db.collection('receipts').where('memberId','==',doc.id).where('month','==',yyyyMm).limit(1).get();
			if (receipts.empty) {
				await db.collection('notifications').add({
					uid: m.uid || '',
					title: 'Fee Due Reminder',
					body: `${m.name||'Member'}: Your fee for ${yyyyMm} is due.`,
					createdAt: admin.firestore.FieldValue.serverTimestamp(),
				});
			}
		}
		return null;
	});

// Trigger: when a receipt is created, notify owner (admin inbox)
exports.notifyOwnerOnReceipt = functions.firestore
	.document('receipts/{id}')
	.onCreate(async (snap) => {
		const r = snap.data();
		await db.collection('notifications').add({
			uid: 'OWNER_ADMIN_UID', // replace or route to admin dashboard inbox
			title: 'New Payment Receipt',
			body: `Member ${r.memberId} paid ₹${r.amount} for ${r.month}.`,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
		});
		return null;
	});


