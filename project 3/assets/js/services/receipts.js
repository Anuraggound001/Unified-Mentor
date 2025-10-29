// Digital receipts handling: Firestore + optional Storage for PDF/image
// eslint-disable-next-line no-undef
const ReceiptsService = (() => {
	const storage = firebase.storage();

	async function createReceipt({ memberId, memberUid, month, amount, method, notes, file }) {
		const receipt = { memberId, memberUid, month, amount, method, notes: notes || '' };
		const id = await DbService.createReceipt(receipt);
		let fileUrl = null;
		if (file) {
			const ref = storage.ref().child(`receipts/${id}/${file.name}`);
			await ref.put(file);
			fileUrl = await ref.getDownloadURL();
			await DbService._db.collection('receipts').doc(id).update({ fileUrl });
		}
		return { id, fileUrl };
	}

	async function exportReceiptsCsv(receipts) {
		const header = ['id','memberId','month','amount','method','createdAt'];
		const rows = receipts.map(r => [r.id, r.memberId, r.month, r.amount, r.method, (r.createdAt && r.createdAt.toDate && r.createdAt.toDate().toISOString()) || '']);
		const csv = [header.join(','), ...rows.map(r => r.map(v => JSON.stringify(v ?? '')).join(','))].join('\n');
		return csv;
	}

	return { createReceipt, exportReceiptsCsv };
})();


