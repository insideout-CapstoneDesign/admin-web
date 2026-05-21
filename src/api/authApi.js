import { AuthApiError } from '../errors/authError'

const AUTH_API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.trim()
    || ''

async function parseJsonSafe(response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

async function postAuth(path, body) {
    if (!AUTH_API_BASE_URL) {
        throw new AuthApiError('VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다.')
    }

    const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    const payload = await parseJsonSafe(response)
    const isSuccess = payload?.isSuccess

    if (!response.ok) {
        throw new AuthApiError(
            payload?.message || '요청 처리 중 오류가 발생했습니다.',
            {
                status: response.status,
                code: payload?.code || null,
            }
        )
    }

    if (payload == null) {
        throw new AuthApiError('서버 응답을 해석할 수 없습니다.', {
            status: response.status,
        })
    }

    if (isSuccess === false) {
        throw new AuthApiError(
            payload?.message || '요청 처리 중 오류가 발생했습니다.',
            {
                status: response.status,
                code: payload?.code || null,
            }
        )
    }

    return payload.result ?? payload
}

export async function signupTenantApi({ email, password, displayName }) {
    return postAuth('/api/v1/auth/signup/tenant', {
        email,
        password,
        displayName,
    })
}

export async function loginApi({ email, password, portalType }) {
    return postAuth('/api/v1/auth/login', {
        email,
        password,
        portalType,
    })
}
