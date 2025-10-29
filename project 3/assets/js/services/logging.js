/* Lightweight logging service: console + optional Firestore */
// eslint-disable-next-line no-undef
const LoggingService = (() => {
	const levels = ['debug', 'info', 'warn', 'error'];
	let firestore = null;

	function setFirestore(db) {
		firestore = db;
	}

	async function log(level, message, context = {}) {
		const entry = {
			level,
			message,
			context,
			timestamp: new Date().toISOString(),
		};
		// Console
		const fn = console[level] || console.log;
		fn(`[${level.toUpperCase()}] ${message}`, context);
		// Firestore (best-effort)
		try {
			if (firestore) {
				await firestore.collection('logs').add(entry);
			}
		} catch (_) { /* ignore logging failures */ }
	}

	return {
		setFirestore,
		debug: (msg, ctx) => log('debug', msg, ctx),
		info: (msg, ctx) => log('info', msg, ctx),
		warn: (msg, ctx) => log('warn', msg, ctx),
		error: (msg, ctx) => log('error', msg, ctx),
	};
})();


