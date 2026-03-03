// Toast notification
function showToast(message, type = 'success') {
	const container = document.getElementById('toast-container');
	const toast = document.createElement('div');
	const accents = {
		success: { border: '#10b981', bg: '#f0fdf4', text: '#166534', icon: '#10b981' },
		error:   { border: '#ef4444', bg: '#fef2f2', text: '#991b1b', icon: '#ef4444' },
		info:    { border: '#6366f1', bg: '#eef2ff', text: '#3730a3', icon: '#6366f1' },
	};
	const icons = {
		success: '<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
		error:   '<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>',
		info:    '<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>',
	};
	const a = accents[type] || accents.info;
	const icon = icons[type] || icons.info;

	toast.className = 'toast flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-md';
	toast.style.cssText = `
		background: ${a.bg};
		color: ${a.text};
		border: 1px solid ${a.border}33;
		border-left: 3px solid ${a.border};
		min-width: 200px;
		max-width: 320px;
	`;
	toast.innerHTML = `<span style="color:${a.icon}">${icon}</span><span>${message}</span>`;
	container.appendChild(toast);
	setTimeout(() => toast.remove(), 3000);
}

// Check-in all accounts
async function runCheckinAll() {
	const btn = document.getElementById('btn-checkin-all');
	if (btn) {
		btn.disabled = true;
		btn.innerHTML = '<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>签到中...';
		btn.classList.add('opacity-70', 'cursor-not-allowed');
	}
	try {
		const res = await fetch('/api/checkin/all', { method: 'POST' });
		const result = await res.json();
		if (result.success) {
			showToast(`签到完成: ${result.success_count}/${result.total_count} 成功`, 'success');
			setTimeout(() => location.reload(), 1500);
		} else {
			showToast(result.message || '签到失败', 'error');
		}
	} catch (e) {
		showToast('请求失败: ' + e.message, 'error');
	} finally {
		if (btn) {
			btn.disabled = false;
			btn.classList.remove('opacity-70', 'cursor-not-allowed');
			btn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>立即全部签到';
		}
	}
}

// Check-in single account
async function runCheckinSingle(accountId) {
	showToast('签到中...', 'info');
	try {
		const res = await fetch(`/api/checkin/${accountId}`, { method: 'POST' });
		const result = await res.json();
		if (result.status === 'already_checked_in') {
			showToast('今日已签到', 'info');
			setTimeout(() => location.reload(), 1200);
		} else if (result.status === 'success' || result.success) {
			showToast('签到成功', 'success');
			setTimeout(() => location.reload(), 1500);
		} else {
			showToast(result.message || '签到失败', 'error');
		}
	} catch (e) {
		showToast('请求失败: ' + e.message, 'error');
	}
}
