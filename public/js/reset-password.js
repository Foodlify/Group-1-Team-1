const resetForm = document.getElementById('resetForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const spinner = document.getElementById('spinner');
const statusMsg = document.getElementById('statusMsg');

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    showStatus('Invalid or missing reset token. Please request a new link.', 'error');
    submitBtn.disabled = true;
}

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        showStatus('Passwords do not match!', 'error');
        return;
    }

    setLoading(true);
    statusMsg.className = 'message'; // reset

    try {
        const response = await fetch('/api/v1/customers/reset-password-from-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                newPassword,
                confirmNewPassword
            })
        });

        const result = await response.json();

        if (response.ok) {
            showStatus('Password updated successfully! You can now login.', 'success');
            resetForm.style.display = 'none';
        } else {
            showStatus(result.message || 'Failed to update password.', 'error');
        }
    } catch (error) {
        showStatus('An error occurred. Please try again later.', 'error');
    } finally {
        setLoading(false);
    }
});

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `message ${type}`;
    statusMsg.style.display = 'block';
}

function setLoading(isLoading) {
    if (isLoading) {
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        spinner.style.display = 'none';
        submitBtn.disabled = false;
    }
}
