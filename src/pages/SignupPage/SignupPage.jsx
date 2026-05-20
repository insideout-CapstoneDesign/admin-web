import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { signupSchema } from '../../schemas/auth.schema'
import { getAuthErrorMessage } from '../../errors/authError'
import { signupTenant } from '../../services/auth'
import {
    ErrorMessage,
    FieldGroup,
    Form,
    Input,
    Label,
    LoginLink,
    PageTitle,
    SubmitButton,
    Wrapper,
} from './SignupPage.styles'

export default function SignupPage() {
    const navigate = useNavigate()
    const [submitError, setSubmitError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
        mode: 'onChange',
    })

    const onSubmit = async (data) => {
        setSubmitError('')
        setIsSubmitting(true)

        try {
            await signupTenant({
                email: data.email,
                password: data.password,
                displayName: data.displayName,
            })

            reset()
            navigate('/login')
        } catch (error) {
            setSubmitError(getAuthErrorMessage(error, '회원가입 중 오류가 발생했습니다.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Wrapper>
            <PageTitle>회원가입</PageTitle>

            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Label htmlFor="display-name">이름</Label>
                    <Input
                        id="display-name"
                        type="text"
                        placeholder="이름"
                        {...register('displayName')}
                        maxLength={10}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.displayName)}
                        aria-describedby="signup-display-name-error"
                    />
                    <ErrorMessage
                        id="signup-display-name-error"
                        $visible={Boolean(errors.displayName)}
                        aria-live="polite"
                        aria-atomic="true"
                        aria-hidden={!errors.displayName}
                    >
                        {errors.displayName?.message || '\u00A0'}
                    </ErrorMessage>
                </FieldGroup>

                <FieldGroup>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="이메일"
                        {...register('email')}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby="signup-email-error"
                    />
                    <ErrorMessage
                        id="signup-email-error"
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
                        placeholder="8자 이상 입력"
                        {...register('password')}
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby="signup-password-error"
                    />
                    <ErrorMessage
                        id="signup-password-error"
                        $visible={Boolean(errors.password)}
                        aria-live="polite"
                        aria-atomic="true"
                        aria-hidden={!errors.password}
                    >
                        {errors.password?.message || '\u00A0'}
                    </ErrorMessage>
                </FieldGroup>

                <FieldGroup>
                    <Label htmlFor="password-confirm">비밀번호 확인</Label>
                    <Input
                        id="password-confirm"
                        type="password"
                        placeholder="비밀번호 확인"
                        {...register('passwordConfirm')}
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.passwordConfirm)}
                        aria-describedby="signup-password-confirm-error"
                    />
                    <ErrorMessage
                        id="signup-password-confirm-error"
                        $visible={Boolean(errors.passwordConfirm)}
                        aria-live="polite"
                        aria-atomic="true"
                        aria-hidden={!errors.passwordConfirm}
                    >
                        {errors.passwordConfirm?.message || '\u00A0'}
                    </ErrorMessage>
                </FieldGroup>

                <SubmitButton variant="primary" size="lg" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '가입 중...' : '회원가입'}
                </SubmitButton>
                {submitError && (
                    <ErrorMessage as="p" $visible aria-live="polite" style={{ marginTop: '0' }}>
                        {submitError}
                    </ErrorMessage>
                )}

                <LoginLink type="button" onClick={() => navigate('/login')}>
                    로그인
                </LoginLink>
            </Form>
        </Wrapper>
    )
}
