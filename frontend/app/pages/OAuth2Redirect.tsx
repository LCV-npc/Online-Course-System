import React, { useEffect, useState } from 'react';

export default function OAuth2Redirect() {
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('token');
    if (!token) {
      setError('OAuth2 did not return an access token.');
      return;
    }
    try {
      localStorage.setItem('edupro_token', token);
      window.history.replaceState(null, '', '/oauth2/redirect');
      window.location.replace('/dashboard');
    } catch {
      setError('The browser could not store the login session.');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
        {error ? <p className="text-red-600">{error}</p> : <p className="text-gray-600">Đang hoàn tất đăng nhập...</p>}
      </div>
    </div>
  );
}
