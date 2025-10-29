// Notifications: in-app entries + optional email/SMS hooks later
// eslint-disable-next-line no-undef
const NotificationService = (() => {
	async function notifyUser(uid, title, body, meta = {}) {
		await DbService.addNotification({ uid, title, body, meta, read: false });
		LoggingService.info('Notification queued', { uid, title });
	}

	function buildDueMessage(memberName, dueDate, amount) {
		return {
			title: 'Fee Due Reminder',
			body: `${memberName}, your bill of ₹${amount} is due on ${dueDate}.`,
		};
	}

	return { notifyUser, buildDueMessage };
})();


