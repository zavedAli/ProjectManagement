import { useState, useEffect } from 'react';
import { useVerifyOTP, useResendOTP } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

export const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [otp, setOTP] = useState('');
  const verifyOTP = useVerifyOTP();
  const resendOTP = useResendOTP();

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP.mutate({ email, otp });
  };

  const handleResend = () => {
    resendOTP.mutate(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Verify your email</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={6}
            />
          </div>

          {verifyOTP.error && (
            <p className="text-red-600 text-sm text-center">{(verifyOTP.error as Error).message}</p>
          )}

          {resendOTP.isSuccess && (
            <p className="text-green-600 text-sm text-center">Code resent successfully!</p>
          )}

          <button
            type="submit"
            disabled={verifyOTP.isPending || otp.length !== 6}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {verifyOTP.isPending ? 'Verifying...' : 'Verify Email'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendOTP.isPending}
            className="w-full text-sm text-blue-600 hover:text-blue-500"
          >
            {resendOTP.isPending ? 'Sending...' : "Didn't receive code? Resend"}
          </button>
        </form>
      </div>
    </div>
  );
};
