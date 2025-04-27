const { resetPasswordToTemporary } = require('./temporary-password');

async function forgotPasswordFlow(email) {
  const result = await resetPasswordToTemporary(email);
  if (result.success) {
    console.log('Temporary password sent successfully!');
  } else {
    console.error('Failed to reset password:', result.message || result.error);
  }
}

forgotPasswordFlow('example@example.com');
