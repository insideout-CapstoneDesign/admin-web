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

export default function SignupPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: 회원가입 API 연동
        console.log('회원가입 시도:', { email, password, passwordConfirm })
    }

    return (
        <Wrapper>
            <PageTitle>회원가입</PageTitle>

            <Form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="이메일"
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
                        placeholder="8자 이상 입력"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </FieldGroup>

                <FieldGroup>
                    <Label htmlFor="password-confirm">비밀번호 확인</Label>
                    <Input
                        id="password-confirm"
                        type="password"
                        placeholder="비밀번호 확인"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        autoComplete="new-password"
                    />
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
