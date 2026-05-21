import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema } from '../../schemas/auth.schema'
import {
    getAuthErrorMessage,
    isLoginFailedError,
    LOGIN_FAILED_MESSAGE,
} from '../../errors/authError'
import { login } from '../../services/auth'
import {
    ErrorMessage,
    FieldGroup,
    Form,
    Input,
    Label,
    LoginButton,
    PageTitle,
    SignupLink,
    Wrapper,
} from './LoginPage.styles'

export default function LoginPage() {
    const navigate = useNavigate()
    const [submitError, setSubmitError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    })

    const onSubmit = async (data) => {
        setSubmitError('')
        setIsSubmitting(true)

        try {
            const result = await login({
                email: data.email,
                password: data.password,
                portalType: 'TENANT',
            })

            if (!result?.accessToken) {
                setSubmitError('로그인 응답이 올바르지 않습니다. 다시 시도해 주세요.')
                return
            }

            localStorage.setItem('accessToken', result.accessToken)
            if (result?.refreshToken) {
                localStorage.setItem('refreshToken', result.refreshToken)
            }

            navigate('/dashboard')
        } catch (error) {
            if (isLoginFailedError(error)) {
                setSubmitError(LOGIN_FAILED_MESSAGE)
                return
            }

            setSubmitError(getAuthErrorMessage(error, '로그인 중 오류가 발생했습니다.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Wrapper>
            <PageTitle>로그인</PageTitle>

            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        {...register('email')}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby="login-email-error"
                    />
                    <ErrorMessage
                        id="login-email-error"
                        $visible={Boolean(errors.email)}
                        aria-live="polite"
                        aria-atomic="true"
                        aria-hidden={!errors.email}
                    >
                        {errors.email?.message || '\u00A0'}
                    </ErrorMessage>
                </FieldGroup>

                <FieldGroup>
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        {...register('password')}
                        autoComplete="current-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby="login-password-error"
                    />
                    <ErrorMessage
                        id="login-password-error"
                        $visible={Boolean(errors.password)}
                        aria-live="polite"
                        aria-atomic="true"
                        aria-hidden={!errors.password}
                    >
                        {errors.password?.message || '\u00A0'}
                    </ErrorMessage>
                </FieldGroup>

                <LoginButton variant="primary" size="lg" type="submit" disabled={isSubmitting}>
                    로그인
                </LoginButton>
                <ErrorMessage
                    as="p"
                    $visible={Boolean(submitError)}
                    aria-live="polite"
                    aria-atomic="true"
                    aria-hidden={!submitError}
                    style={{ marginTop: '0' }}
                >
                    {submitError}
                </ErrorMessage>

                <SignupLink type="button" onClick={() => navigate('/signup')}>
                    회원가입
                </SignupLink>
            </Form>
        </Wrapper>
    )
}
