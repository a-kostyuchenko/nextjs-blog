import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Search, Plus, LogOut, User, Bell } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl text-indigo-600">
              БлогСервис
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${
                router.pathname === '/' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
              }`}>
                Главная
              </Link>
              <Link href="/explore" className={`px-3 py-2 rounded-md text-sm font-medium ${
                router.pathname === '/explore' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
              }`}>
                Обзор
              </Link>
              {session && (
                <Link href="/feed" className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === '/feed' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
                }`}>
                  Моя лента
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block flex-1 mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="Поиск постов или пользователей..."
              />
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {session ? (
                <>
                  <button onClick={() => router.push('/notifications')} className="text-gray-500 hover:text-indigo-600">
                    <Bell className="h-6 w-6" />
                  </button>

                  <button onClick={() => router.push('/post/new')} className="text-gray-500 hover:text-indigo-600">
                    <Plus className="h-6 w-6" />
                  </button>

                  <div className="relative group">
                    <button className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`}
                        alt={session.user.name || 'Пользователь'}
                      />
                    </button>

                    <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <Link href={`/profile/${session.user.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>Мой профиль</span>
                        </div>
                      </Link>

                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          <span>Выйти</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Войти
                  </Link>
                  <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${
            router.pathname === '/' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
          }`}>
            Главная
          </Link>
          <Link href="/explore" className={`block px-3 py-2 rounded-md text-base font-medium ${
            router.pathname === '/explore' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
          }`}>
            Обзор
          </Link>
          {session && (
            <Link href="/feed" className={`block px-3 py-2 rounded-md text-base font-medium ${
              router.pathname === '/feed' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
            }`}>
              Моя лента
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {session ? (
            <div className="px-2 space-y-1">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`}
                    alt={session.user.name || 'Пользователь'}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                </div>
              </div>
              <Link href={`/profile/${session.user.id}`} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">
                Профиль
              </Link>
              <Link href="/post/new" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">
                Новый пост
              </Link>
              <Link href="/notifications" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">
                Уведомления
              </Link>
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              <Link href="/auth/signin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">
                Войти
              </Link>
              <Link href="/auth/signup" className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
