// Common helpers for routing and simple UI utilities
// eslint-disable-next-line no-undef
const Common = (() => {
	async function ensureUserProfile(uid, { email, role }) {
		// Read current profile
		const existing = await DbService.getUser(uid);
		let finalRole = role;
		if (!finalRole) {
			// Prefer existing role if present
			finalRole = existing && existing.role ? existing.role : 'user';
			// Elevate if configured as admin
			try {
				if (window.AppConfig && Array.isArray(window.AppConfig.adminUids) && window.AppConfig.adminUids.includes(uid)) {
					finalRole = 'admin';
				}
			} catch (e) { /* ignore */ }
		}
		await DbService.ensureUser(uid, { email, role: finalRole });
	}

	async function routeByRole(uid) {
		let role = 'user';
		try {
			role = await AuthService.getUserRole(uid);
		} catch (e) {
			// role already defaults to 'user' on failure
		}
		if (role === 'admin') window.location.href = 'admin.html';
		else if (role === 'member') window.location.href = 'member.html';
		else window.location.href = 'user.html';
	}

	function download(filename, text) {
		const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = filename; a.click();
		URL.revokeObjectURL(url);
	}

	return { ensureUserProfile, routeByRole, download };
})();


