import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import styled from 'styled-components'
import Button from '../../components/Button/Button'
import { useNavigate } from 'react-router-dom'

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/

const signupSchema = z.object({
    email: z.string().email('유효한 이메일 형식이 아닙니다.'),
    password: z.string().regex(
        passwordRegex,
        '영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.'
    ),
    passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
})

const Wrapper = styled.div`
    width: 100%;
    min-height: calc(100vh - 65px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--white);
    padding: 32px;
`

const LogoArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
`

const LogoImage = styled.img`
    width: 56px;
    height: auto;
    margin-bottom: 8px;
`

const LogoText = styled.span`
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 800;
    color: var(--blue-500);
    letter-spacing: 1px;
`

const PageTitle = styled.h1`
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 700;
    color: var(--blue-500);
    margin: 0 0 32px;
`

const Form = styled.form`
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const Label = styled.label`
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: var(--fw-semibold);
    color: var(--black-950);
`

const Input = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 16px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    background-color: var(--white);
    color: var(--black-900);
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-medium);
    outline: none;
    transition: border-color 0.2s;

    &::placeholder {
        color: var(--gray-400);
    }

    &:focus {
        border-color: var(--blue-500);
    }
`

const SubmitButton = styled(Button)`
    width: 100%;
    height: 48px;
    margin-top: 4px;
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    border-radius: var(--radius-8);
`

const LoginLink = styled.button`
    margin-top: 8px;
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-sans);
    font-size: var(--text-14);
    font-weight: var(--fw-medium);
    color: var(--gray-500);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    align-self: center;

    &:hover {
        color: var(--blue-500);
    }
`

const ErrorMessage = styled.span`
    color: var(--red-500, #ef4444);
    font-size: 12px;
    font-family: var(--font-sans);
    margin-top: 4px;
`

export default function SignupPage() {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
        mode: 'onChange',
    })

    const onSubmit = (data) => {
        // TODO: 회원가입 API 연동
        console.log('회원가입 시도:', data)
    }

    return (
        <Wrapper>
            <PageTitle>회원가입</PageTitle>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="이메일"
                        {...register('email')}
                        autoComplete="email"
                    />
                    {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                </FieldGroup>

                <FieldGroup>
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="8자 이상 입력"
                        {...register('password')}
                        autoComplete="new-password"
                    />
                    {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                </FieldGroup>

                <FieldGroup>
                    <Label htmlFor="password-confirm">비밀번호 확인</Label>
                    <Input
                        id="password-confirm"
                        type="password"
                        placeholder="비밀번호 확인"
                        {...register('passwordConfirm')}
                        autoComplete="new-password"
                    />
                    {errors.passwordConfirm && <ErrorMessage>{errors.passwordConfirm.message}</ErrorMessage>}
                </FieldGroup>

                <SubmitButton variant="primary" size="lg" type="submit">
                    회원가입
                </SubmitButton>

                <LoginLink type="button" onClick={() => navigate('/login')}>
                    로그인
                </LoginLink>
            </Form>
        </Wrapper>
    )
}
