//Function creates a temporary password
function generateTemporaryPassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let tempPassword = '';
    for (let i = 0; i < length; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return tempPassword;
  }