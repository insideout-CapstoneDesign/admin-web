const SESSION_EXPIRED_FLAG = 'session-expired-alert-open'

function clearSession() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
}

export function handleSessionExpired(message = '로그인 세션이 만료되었습니다. 다시 로그인해주세요.') {
    clearSession()

    if (sessionStorage.getItem(SESSION_EXPIRED_FLAG) === 'true') {
        window.location.replace('/login')
        return
    }

    sessionStorage.setItem(SESSION_EXPIRED_FLAG, 'true')
    window.alert(message)
    sessionStorage.removeItem(SESSION_EXPIRED_FLAG)
    window.location.replace('/login')
}

export function isUnauthorizedResponse(response, payload) {
    if (response?.status !== 401) {
        return false
    }
    if(payload == null){
        return true
    }

    const code = payload?.code || payload?.errorCode || ''
    const message = payload?.message || ''

    return (
        code === 'COMMON401_1' ||
        code === 'AUTH401_1' ||
        message.includes('인증') ||
        message.includes('토큰') ||
        message.includes('세션')
    )
}
