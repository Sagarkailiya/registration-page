import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Github, Facebook, Mail, Lock, User } from 'lucide-react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    GoogleAuthProvider,
    GithubAuthProvider,
    FacebookAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, facebookProvider } from '../firebase';
import gsap from 'gsap';
import Lottie from 'lottie-react';

const AuthForm = () => {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const navigate = useNavigate();
    const formRef = useRef(null);
    const imageRef = useRef(null);

    // Abstract animation JSON URL
    // Note: If this URL fails, replace it with another valid Lottie JSON URL.
    const animationUrl = "https://assets2.lottiefiles.com/packages/lf20_w51pcehl.json";
    const [animationData, setAnimationData] = useState(null);

    useEffect(() => {
        // Fetch Lottie animation data
        fetch(animationUrl)
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Failed to load animation:", err));

        // Entry Animation
        gsap.fromTo(formRef.current,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
        );
        gsap.fromTo(imageRef.current,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 1, ease: "power3.out", delay: 0.2 }
        );
    }, [mode]);

    const validate = () => {
        const newErrors = {};
        if (mode === 'register') {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!validate()) return;

        setLoading(true);
        try {
            if (mode === 'register') {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                await updateProfile(userCredential.user, { displayName: formData.name });
                setSuccessMsg('Registration successful! Please log in.');
                setMode('login');
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Keep email
            } else {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                navigate('/home');
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, provider);
            navigate('/home');
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
        setSuccessMsg('');
        setFieldErrors({});
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex bg-gray-50 font-sans">
            {/* Form Section */}
            <div ref={formRef} className="w-full md:w-1/2 h-full flex flex-col justify-center p-6 md:p-12 overflow-hidden bg-white relative z-10">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-6 text-center md:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {mode === 'login'
                                ? 'Enter your details to access your account'
                                : 'Get started with your free account today'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-pulse">
                            <AlertCircle className="text-red-500 shrink-0" size={18} />
                            <p className="text-xs text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2">
                            <CheckCircle className="text-green-500 shrink-0" size={18} />
                            <p className="text-xs text-green-700 font-medium">{successMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div className="relative group">
                                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50'} focus:border-blue-600 focus:bg-white outline-none transition-all duration-300 font-medium text-sm`}
                                        placeholder="John Doe"
                                    />
                                </div>
                                {fieldErrors.name && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.name}</p>}
                            </div>
                        )}

                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50'} focus:border-blue-600 focus:bg-white outline-none transition-all duration-300 font-medium text-sm`}
                                    placeholder="name@company.com"
                                />
                            </div>
                            {fieldErrors.email && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.email}</p>}
                        </div>

                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border-2 ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50'} focus:border-blue-600 focus:bg-white outline-none transition-all duration-300 font-medium text-sm`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.password}</p>}
                        </div>

                        {mode === 'register' && (
                            <div className="relative group">
                                <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3 py-3 rounded-xl border-2 ${fieldErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50'} focus:border-blue-600 focus:bg-white outline-none transition-all duration-300 font-medium text-sm`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.confirmPassword}</p>}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-3 rounded-xl font-bold text-base hover:from-gray-800 hover:to-gray-900 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleSocialLogin(googleProvider)}
                                disabled={loading}
                                className="flex items-center justify-center py-3 px-3 border-2 border-gray-100 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 disabled:opacity-50 group"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleSocialLogin(githubProvider)}
                                disabled={loading}
                                className="flex items-center justify-center py-3 px-3 border-2 border-gray-100 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 disabled:opacity-50 group"
                            >
                                <Github size={20} className="text-gray-900 group-hover:scale-110 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleSocialLogin(facebookProvider)}
                                disabled={loading}
                                className="flex items-center justify-center py-3 px-3 border-2 border-gray-100 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 disabled:opacity-50 group"
                            >
                                <Facebook size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={toggleMode}
                            className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Visual Section */}
            <div ref={imageRef} className="hidden md:block w-1/2 h-full relative overflow-hidden bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black opacity-90"></div>

                {/* Lottie Animation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    {animationData && <Lottie animationData={animationData} loop={true} className="w-full h-full object-cover" />}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center z-10">
                    <div className="backdrop-blur-sm bg-white/10 p-8 rounded-3xl border border-white/10 shadow-2xl max-w-lg">
                        <h3 className="text-4xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                            {mode === 'login' ? 'Welcome Back!' : 'Join Us Today'}
                        </h3>
                        <p className="text-lg text-gray-200 leading-relaxed">
                            {mode === 'login'
                                ? 'We are so happy to see you again. Access your dashboard and pick up where you left off.'
                                : 'Start your journey with us. Create an account to unlock exclusive features and community access.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
