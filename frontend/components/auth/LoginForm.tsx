'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import Image from 'next/image';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
/* change login function to get doctor name
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'vtehr') {
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };
*/
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password); 
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <div className="relative h-full w-full max-w-[1440px] mx-auto">
        <nav className="absolute top-16 left-10 right-10 flex justify-between items-start">
          <Image
            src="/icons/tietoevry-logo-digital.png"
            alt="Tietoevry Logo"
            width={120}
            height={34}
            priority
          />
          <Image
            src="/icons/lifecare-digital-logo.png"
            alt="Lifecare Logo"
            width={100}
            height={28}
            priority
          />
        </nav>

        <div className="absolute left-1/2 top-[200px] -translate-x-1/2 flex flex-col items-center w-[512px]">
          <div className="text-center mb-[100px]">
            <h1 className="text-[#171717] text-[44px] font-bold leading-normal">Voice to EHR</h1>
            <p className="text-gray-600 text-sm mb-8">MVP version 1.0.0</p>
          </div>
          
          <form onSubmit={handleLogin} className="w-full space-y-8">
            <div className="space-y-10">
              <div className="flex flex-col gap-16">
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border-b border-gray-300 focus:border-[#171717] group-hover:border-[#171717] outline-none peer placeholder-transparent text-left text-[16px] hover:cursor-pointer"
                    placeholder="Doctor's entry-code"
                    id="username-input"
                  />
                  <label htmlFor="username-input"
                    className="absolute left-0 top-[calc(50%-16px)] -translate-y-1/2 text-gray-400 transition-all duration-200 ease-in-out pointer-events-none group-hover:-translate-y-[calc(50%+8px)] peer-focus:top-[-28px] peer-focus:-translate-y-0 peer-focus:text-[12px] peer-focus:text-gray-400 peer-[&:not(:placeholder-shown)]:top-[-28px] peer-[&:not(:placeholder-shown)]:-translate-y-0 peer-[&:not(:placeholder-shown)]:text-[12px] peer-[&:not(:placeholder-shown)]:text-gray-400 peer-focus:text-[#171717] peer-[&:not(:placeholder-shown)]:text-[#171717] group-hover:text-[#171717] bg-white px-1 text-[16px]"
                  >
                    Doctor's entry-code
                  </label>
                </div>
                <div className="relative group mb-9">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-gray-300 focus:border-[#171717] group-hover:border-[#171717] outline-none peer placeholder-transparent text-left text-[16px] hover:cursor-pointer"
                    placeholder="Doctor's password"
                    id="password-input"
                  />
                  <label htmlFor="password-input"
                    className="absolute left-0 top-[calc(50%-16px)] -translate-y-1/2 text-gray-400 transition-all duration-200 ease-in-out pointer-events-none group-hover:-translate-y-[calc(50%+8px)] peer-focus:top-[-28px] peer-focus:-translate-y-0 peer-focus:text-[12px] peer-focus:text-gray-400 peer-[&:not(:placeholder-shown)]:top-[-28px] peer-[&:not(:placeholder-shown)]:-translate-y-0 peer-[&:not(:placeholder-shown)]:text-[12px] peer-[&:not(:placeholder-shown)]:text-gray-400 peer-focus:text-[#171717] peer-[&:not(:placeholder-shown)]:text-[#171717] group-hover:text-[#171717] bg-white px-1 text-[16px]"
                  >
                    Doctor's password
                  </label>
                </div>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-black text-white py-4 px-4 hover:bg-[#262626] transition-colors duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <span>Login</span>
                <span className="relative flex items-center justify-center w-[18px] h-[18px]">
                  <span className="flex items-center gap-[1px] transition-all duration-300 ease-in-out group-hover:rotate-90 group-hover:items-end">
                    {/* Bar 1 */}
                    <div className="bg-white rounded-full transition-all duration-300 ease-in-out w-[2px] h-[8px] group-hover:h-[4px]" />
                    {/* Bar 2 */}
                    <div className="bg-white rounded-full transition-all duration-300 ease-in-out w-[2px] h-[4px] group-hover:h-[10px]" />
                    {/* Bar 3 */}
                    <div className="bg-white rounded-full transition-all duration-300 ease-in-out w-[2.4px] h-[12px] group-hover:w-[2px] group-hover:h-[10px]" />
                    {/* Bar 4 */}
                    <div className="bg-white rounded-full transition-all duration-300 ease-in-out w-[2px] h-[6px] group-hover:h-[10px]" />
                    {/* Bar 5 */}
                    <div className="bg-white rounded-full transition-all duration-300 ease-in-out w-[2px] h-[9px] group-hover:h-[10px]" />
                  </span>
                </span>
              </span>
            </button>
          </form>
        </div>

        <div className="absolute left-0 right-0 bottom-[40px] px-[69px] text-[#737373] font-['Open_Sans'] text-xs font-normal text-center">
          This MVP was developed by OAMK students for educational use only. Any use, distribution, or reproduction without explicit permission from OAMK and Tietoevry is prohibited.
        </div>
      </div>
    </div>
  );
} 