import {
    loginApi,
    signupTenantApi,
} from '../api/authApi'

export async function signupTenant({ email, password, displayName }) {
    return signupTenantApi({
        email,
        password,
        displayName,
    })
}

export async function login({ email, password, portalType }) {
    return loginApi({
        email,
        password,
        portalType,
    })
}
