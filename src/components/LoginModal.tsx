'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './LoginModal.module.css';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalView = 'PHONE_ENTRY' | 'OTP_VERIFY' | 'SIGNUP';

const BASE_URL = 'http://localhost:5000';

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { login } = useAuth();
    const [view, setView] = useState<ModalView>('PHONE_ENTRY');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [verifiedPhones, setVerifiedPhones] = useState<string[]>([]);
    const [email, setEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Male');
    const [referralCode, setReferralCode] = useState('');
    const [phoneOtpValue, setPhoneOtpValue] = useState(['', '', '', '']);
    const [phoneOtpSentInSignup, setPhoneOtpSentInSignup] = useState(false);

    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailOtpSent, setEmailOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Reset state when opening
            setView('PHONE_ENTRY');
            setError('');
            setLoading(false);
        } else {
            document.body.style.overflow = 'unset';
            // Clear inputs when closing
            setPhoneNumber('');
            setOtp(['', '', '', '']);
            setEmail('');
            setEmailOtp('');
            setName('');
            setDob('');
            setGender('Male');
            setReferralCode('');
            setIsPhoneVerified(false);
            setIsEmailVerified(false);
            setEmailOtpSent(false);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && view !== 'SIGNUP') {
            onClose();
        }
    };

    const handleSendPhoneOtp = async () => {
        if (phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.post(`${BASE_URL}/api/auth/send-otp`, { phone: phoneNumber });
            setView('OTP_VERIFY');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPhoneOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length < 4) {
            setError('Please enter the complete OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
                phone: phoneNumber,
                otp: otpValue
            });

            if (res.data.exists) {
                // User exists, login directly
                login(res.data.token, res.data.user);
                onClose();
            } else {
                // New user, go to signup
                setVerifiedPhones(prev => [...prev, phoneNumber]);
                setIsPhoneVerified(true);
                setView('SIGNUP');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailOtp = async () => {
        if (!email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.post(`${BASE_URL}/api/auth/send-email-otp`, { email });
            setEmailOtpSent(true);
            setError('Email OTP sent successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send Email OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (emailOtp.length === 0) {
            setError('Please enter the Email OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.post(`${BASE_URL}/api/auth/verify-email-otp`, {
                email,
                otp: emailOtp
            });
            setIsEmailVerified(true);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendPhoneOtpSignup = async () => {
        if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.post(`${BASE_URL}/api/auth/send-otp`, { phone: phoneNumber });
            setPhoneOtpSentInSignup(true);
            setError('success:OTP sent to your phone');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPhoneOtpSignup = async () => {
        const otpVal = phoneOtpValue.join('');
        if (otpVal.length < 4) {
            setError('Please enter complete OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
                phone: phoneNumber,
                otp: otpVal
            });
            setVerifiedPhones(prev => [...prev, phoneNumber]);
            setIsPhoneVerified(true);
            setPhoneOtpSentInSignup(false);
            setPhoneOtpValue(['', '', '', '']);
            setError('success:Phone number verified');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!isEmailVerified) {
            setError('Please verify your email first');
            return;
        }
        if (!isPhoneVerified) {
            setError('Please verify your phone number first');
            return;
        }
        if (!name || !dob || !gender) {
            setError('Please fill all required fields');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const signupData = {
                phone: phoneNumber,
                name,
                email,
                dob,
                gender,
                referralCode
            };
            const res = await axios.post(`${BASE_URL}/api/auth/register-full`, signupData);
            login(res.data.token, res.data.user);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const isSignupDisabled = !name || !email || !dob || !gender || !isPhoneVerified || !isEmailVerified || loading;

    return (
        <div className={styles.modalOverlay} onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <span>&times;</span>
                </button>

                <div className={styles.logoArea}>
                    <div className={styles.logoImageContainer}>
                        <Image
                            src="/madjock-logo.png"
                            alt="MadJock"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                </div>

                {view === 'PHONE_ENTRY' && (
                    <>
                        <div className={styles.titleArea}>
                            <h2 className={styles.welcomeText}>Welcome</h2>
                            <p className={styles.subtitle}>Login for a seamless experience</p>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputLabel}>Enter Mobile Number</span>
                                <div className={styles.phoneInputGroup}>
                                    <div className={styles.countryCode}>+91</div>
                                    <input
                                        type="tel"
                                        className={styles.input}
                                        placeholder=""
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                                            setError('');
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" id="terms" className={styles.checkbox} defaultChecked />
                                <div className={styles.checkboxText}>
                                    I Agree to <Link href="#" className={styles.termsLink}>Terms and Conditions</Link>
                                    <br />
                                    <Link href="#" className={styles.termsLink}>T&C&apos;s Privacy Policy</Link>
                                </div>
                            </div>

                            {error && <p className={styles.errorText}>{error}</p>}

                            <button
                                className={styles.otpBtn}
                                onClick={handleSendPhoneOtp}
                                disabled={loading || phoneNumber.length !== 10}
                            >
                                {loading ? 'Sending...' : 'Continue'}
                            </button>
                        </div>
                    </>
                )}

                {view === 'OTP_VERIFY' && (
                    <>
                        <div className={styles.titleArea}>
                            <h2 className={styles.welcomeText}>Verify OTP</h2>
                            <p className={styles.subtitle}>Enter the 4-digit code sent to +91 {phoneNumber}</p>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.otpBoxContainer}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="tel"
                                        maxLength={1}
                                        className={styles.otpInputBox}
                                        value={digit}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(-1);
                                            const newOtp = [...otp];
                                            newOtp[index] = value;
                                            setOtp(newOtp);

                                            // Focus next if a digit was entered
                                            if (value && index < 3) {
                                                document.getElementById(`otp-${index + 1}`)?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                document.getElementById(`otp-${index - 1}`)?.focus();
                                            }
                                        }}
                                        autoComplete="one-time-code"
                                    />
                                ))}
                            </div>

                            {error && <p className={styles.errorText}>{error}</p>}

                            <button
                                className={styles.otpBtn}
                                onClick={handleVerifyPhoneOtp}
                                disabled={loading || otp.join('').length < 4}
                            >
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                            </button>

                            <button
                                className={styles.resendBtn}
                                onClick={handleSendPhoneOtp}
                                disabled={loading}
                            >
                                Resend OTP
                            </button>
                        </div>
                    </>
                )}

                {view === 'SIGNUP' && (
                    <>
                        <div className={styles.titleArea}>
                            <h2 className={styles.welcomeText}>Create Your Profile</h2>
                            <p className={styles.subtitle}>Almost there! Just a few more details</p>
                        </div>

                        <div className={styles.signupForm}>
                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>Phone Number</label>
                                <div className={styles.inlineVerify}>
                                    <input
                                        type="tel"
                                        className={styles.inputField}
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setPhoneNumber(val);
                                            setIsPhoneVerified(verifiedPhones.includes(val));
                                            setPhoneOtpSentInSignup(false);
                                        }}
                                        placeholder="Mobile Number"
                                    />
                                    {!isPhoneVerified && (
                                        <button
                                            className={styles.inlineVerifyBtn}
                                            onClick={handleSendPhoneOtpSignup}
                                            disabled={loading || phoneNumber.length < 10}
                                        >
                                            {phoneOtpSentInSignup ? 'Resend' : 'Verify'}
                                        </button>
                                    )}
                                    {isPhoneVerified && <span className={styles.verifiedBadge}>✓ Verified</span>}
                                </div>
                            </div>

                            {phoneOtpSentInSignup && !isPhoneVerified && (
                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label className={styles.fieldLabel}>Enter Phone OTP</label>
                                    <div className={styles.otpBoxContainer} style={{ margin: '5px 0' }}>
                                        {phoneOtpValue.map((digit, index) => (
                                            <input
                                                key={`phone-otp-${index}`}
                                                id={`phone-otp-${index}`}
                                                type="tel"
                                                maxLength={1}
                                                className={styles.otpInputBox}
                                                style={{ width: '40px', height: '48px', fontSize: '1.2rem' }}
                                                value={digit}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(-1);
                                                    const newOtp = [...phoneOtpValue];
                                                    newOtp[index] = value;
                                                    setPhoneOtpValue(newOtp);
                                                    if (value && index < 3) {
                                                        document.getElementById(`phone-otp-${index + 1}`)?.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !phoneOtpValue[index] && index > 0) {
                                                        document.getElementById(`phone-otp-${index - 1}`)?.focus();
                                                    }
                                                }}
                                            />
                                        ))}
                                        <button
                                            className={styles.inlineVerifyBtn}
                                            onClick={handleVerifyPhoneOtpSignup}
                                            disabled={loading || phoneOtpValue.join('').length < 4}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>Full Name</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>Email Address</label>
                                <div className={styles.inlineVerify}>
                                    <input
                                        type="email"
                                        className={styles.inputField}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setIsEmailVerified(false);
                                            setEmailOtpSent(false);
                                        }}
                                        placeholder="email@example.com"
                                        disabled={isEmailVerified}
                                    />
                                    {!isEmailVerified && (
                                        <button
                                            className={styles.inlineVerifyBtn}
                                            onClick={handleSendEmailOtp}
                                            disabled={loading || !email.includes('@')}
                                        >
                                            {emailOtpSent ? 'Resend' : 'Verify'}
                                        </button>
                                    )}
                                    {isEmailVerified && <span className={styles.verifiedBadge}>✓ Verified</span>}
                                </div>
                            </div>

                            {emailOtpSent && !isEmailVerified && (
                                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                    <label className={styles.fieldLabel}>Enter Email OTP</label>
                                    <div className={styles.inlineVerify}>
                                        <input
                                            type="text"
                                            className={styles.inputField}
                                            value={emailOtp}
                                            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="6-digit code"
                                        />
                                        <button
                                            className={styles.inlineVerifyBtn}
                                            onClick={handleVerifyEmailOtp}
                                            disabled={loading || !emailOtp}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>Date of Birth</label>
                                <input
                                    type="date"
                                    className={styles.inputField}
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.fieldLabel}>Gender</label>
                                <select
                                    className={styles.inputField}
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label className={styles.fieldLabel}>Referral Code (Optional)</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value)}
                                    placeholder="Enter code if any"
                                />
                            </div>

                            <div className={styles.fullWidth}>
                                {error && <p className={error.includes('success') ? styles.successText : styles.errorText}>{error}</p>}

                                <button
                                    className={styles.otpBtn}
                                    style={{ width: '100%' }}
                                    onClick={handleSignup}
                                    disabled={isSignupDisabled}
                                >
                                    {loading ? 'Creating Account...' : 'Complete Signup'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {view === 'PHONE_ENTRY' && (
                    <>
                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>Or Login Using</span>
                            <div className={styles.dividerLine}></div>
                        </div>

                        <button className={styles.googleBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>

                        <button className={styles.skipBtn} onClick={onClose}>
                            Skip
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
