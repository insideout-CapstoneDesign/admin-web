export const LOGIN_FAILED_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.'

export class AuthApiError extends Error {
    constructor(message, { status = 0, code = null } = {}) {
        super(message)
        this.name = 'AuthApiError'
        this.status = status
        this.code = code
    }
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
