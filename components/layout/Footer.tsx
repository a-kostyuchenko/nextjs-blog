import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="font-bold text-indigo-600">
              БлогСервис
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              &copy; {new Date().getFullYear()} БлогСервис. Все права защищены.
            </p>
          </div>

          <div className="flex space-x-6">
            <Link href="/about" className="text-gray-500 hover:text-indigo-600">
              О нас
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-indigo-600">
              Контакты
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-indigo-600">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-indigo-600">
              Условия
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
