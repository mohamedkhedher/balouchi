import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.AUTH_SECRET || 'super-secret-key-change-me-in-production';
const key = new TextEncoder().encode(SECRET_KEY);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function login(payload: any) {
    // Expire in 24 hours
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ ...payload, expires });
    const cookieStore = await cookies();

    cookieStore.set('session', session, { expires, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.set('session', '', { expires: new Date(0) });
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    // Refresh session if needed, for MVP we just let it slide or extend
    const parsed = await decrypt(session);

    if (!parsed) return;

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: await encrypt({ ...parsed, expires }),
        httpOnly: true,
        expires: expires,
    });
    return res;
}
