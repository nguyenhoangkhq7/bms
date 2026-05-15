'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/src/auth/context';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      const query = searchParams.toString();
      const returnTo = query ? `${pathname}?${query}` : pathname;
      router.replace(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
    }
  }, [isLoading, isSignedIn, pathname, router, searchParams]);

  if (isLoading || !isSignedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F5F0E8]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#1F4788]" />
          <p className="text-sm font-medium text-gray-500">Đang chuyển tới trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}