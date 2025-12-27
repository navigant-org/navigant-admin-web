import React, { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isLogin) {
      if (email === 'admin@gmail.com' && password === 'admin') {
        onLogin();
      } else {
        setError('Invalid credentials');
        setIsLoading(false);
      }
    } else {
      // Simulate signup
      onLogin();
    }
  };

  return (
    <div className="flex w-screen h-screen bg-[#F8FAFC] font-sans relative overflow-hidden text-slate-800">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Soft Gradient Blob 1 */}
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px] mix-blend-multiply opacity-70 animate-blob"></div>
          {/* Soft Gradient Blob 2 */}
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
          {/* Soft Gradient Blob 3 - Bottom */}
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-sky-50/80 blur-[130px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
          
          {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBMMTQwIDBoNDB2NDBIMHoiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==')] opacity-40"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
        
        {/* Logo Mark - Centered Top */}
        <div className="mb-8 flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg shadow-blue-500/10 ring-1 ring-slate-900/5 mb-4">
                <img src="/logomark.svg" alt="Navigant" className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2 text-sm">Enter your credentials to access the admin panel.</p>
        </div>

        {/* Glass Card */}
        <div className="w-full max-w-[400px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-3xl p-8 relative overflow-hidden">
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-shake">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                             <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3.5 transition-all outline-none shadow-sm group-hover:border-slate-300 placeholder:text-slate-300"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>
                    <div className="group">
                         <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3.5 transition-all outline-none shadow-sm group-hover:border-slate-300 placeholder:text-slate-300"
                                placeholder="••••••••"
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.414-1.414A9 9 0 0010 18c4.478 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-1.87 0-3.605.513-5.097 1.41L3.707 2.293zM6.9 8.314A3.99 3.99 0 009.686 11.1L6.9 8.314zM11.686 13.1l-2-2a4 4 0 01-1.371-1.372l-2-2a6 6 0 005.371 5.372z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                    </div>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-3.5 text-center mt-2 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        isLogin ? 'Sign In' : 'Create Account'
                    )}
                </button>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-semibold text-blue-600 hover:text-blue-500 ml-1 hover:underline"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </button>
                    </p>
                </div>
            </form>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
                &copy; 2024 Navigant Inc. All rights reserved.
            </p>
        </div>

      </div>
    </div>
  );
}