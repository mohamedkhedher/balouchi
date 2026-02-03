import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/admin', '/cashier'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

    // Exclude login pages from protection
    if (path === '/admin/login' || path === '/cashier/login') {
        return NextResponse.next();
    }

    if (isProtectedRoute) {
        const cookie = request.cookies.get('session')?.value;
        const session = await decrypt(cookie || '');

        if (!session?.id) {
            if (path.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
            }
            if (path.startsWith('/cashier')) {
                return NextResponse.redirect(new URL('/cashier/login', request.nextUrl));
            }
        }

        // Role based checks
        if (path.startsWith('/admin') && session.role !== 'ADMIN' && session.role !== 'MERCHANT') {
            // unauthorized for admin
            // Ideally redirect to 403 or home
            return NextResponse.redirect(new URL('/', request.nextUrl));
        }

        if (path.startsWith('/cashier') && session.role !== 'CASHIER' && session.role !== 'ADMIN' && session.role !== 'MERCHANT') {
            // managed by admin implies admin can access cashier too usually, but safe to redirect
            // Strict requirement: Cashier routes for cashier
            return NextResponse.redirect(new URL('/cashier/login', request.nextUrl));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
