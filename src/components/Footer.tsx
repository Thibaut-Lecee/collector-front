import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Powered by</span>
            <Image
              src="/zitadel-logo.svg"
              alt="Zitadel"
              width={295}
              height={81}
              className="h-12 w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
