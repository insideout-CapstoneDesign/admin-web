const AUTH_API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.trim()
    || import.meta.env.VITE_AI_API_BASE_URL?.trim()
    || ''

export const LOGIN_FAILED_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.'

class AuthApiError extends Error {
    constructor(message, { status = 0, code = null } = {}) {
        super(message)
        this.name = 'AuthApiError'
        this.status = status
        this.code = code
    }
}

async function parseJsonSafe(response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

async function postAuth(path, body) {
    const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    const payload = await parseJsonSafe(response)
    const isSuccess = payload?.isSuccess !== false

    if (!response.ok || !isSuccess) {
        throw new AuthApiError(
            payload?.message || '요청 처리 중 오류가 발생했습니다.',
            {
                status: response.status,
                code: payload?.code || null,
            }
        )
    }

    return payload?.result || payload
}

export async function signupTenant({ email, password, displayName }) {
    return postAuth('/api/v1/auth/signup/tenant', {
        email,
        password,
        displayName,
    })
}

export async function login({ email, password, portalType }) {
    return postAuth('/api/v1/auth/login', {
        email,
        password,
        portalType,
    })
}

export function isLoginFailedError(error) {
    return error instanceof AuthApiError
        && (error.status === 401 || error.code === 'LOGIN_FAILED')
}

export function getAuthErrorMessage(error, fallbackMessage) {
    if (error instanceof AuthApiError) {
        return error.message || fallbackMessage
    }

    return fallbackMessage
}
