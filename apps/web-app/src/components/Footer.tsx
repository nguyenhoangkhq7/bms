// Server Component — không cần 'use client' vì không sử dụng hooks hay event handlers

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto flex w-full flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10">
        <div className="flex items-center gap-2 text-xl font-bold font-serif">
          <span className="text-black">BookHaven</span>
        </div>
        <p className="text-center text-sm text-gray-500 lg:text-left">
          © 2024 BookHaven. Nơi lưu giữ những cuốn sách hay.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium lg:justify-end">
          <a href="#" className="hover:text-black">
            Về chúng tôi
          </a>
          <a href="#" className="hover:text-black">
            Chính sách bảo mật
          </a>
          <a href="#" className="hover:text-black">
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  );
}
