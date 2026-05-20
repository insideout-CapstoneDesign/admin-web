import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema } from '../../schemas/auth.schema'
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
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    })

    const onSubmit = (data) => {
        // TODO: 로그인 API 연동
        console.log('로그인 시도:', data)
        navigate('/dashboard')
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

                <LoginButton variant="primary" size="lg" type="submit">
                    로그인
                </LoginButton>

                <SignupLink type="button" onClick={() => navigate('/signup')}>
                    회원가입
                </SignupLink>
            </Form>
        </Wrapper>
    )
}
