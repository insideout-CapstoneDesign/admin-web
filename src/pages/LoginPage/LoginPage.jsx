import { useState } from 'react'
import styled from 'styled-components'
import Button from '../../components/Button/Button'
import { useNavigate } from 'react-router-dom'

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

const LoginButton = styled(Button)`
    width: 100%;
    height: 48px;
    margin-top: 4px;
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    border-radius: var(--radius-8);
`

const SignupLink = styled.button`
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

export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: 로그인 API 연동
        console.log('로그인 시도:', { email, password })
    }

    return (
        <Wrapper>
            <PageTitle>로그인</PageTitle>

            <Form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </FieldGroup>

                <FieldGroup>
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
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
