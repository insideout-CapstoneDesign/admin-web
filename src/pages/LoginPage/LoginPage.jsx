import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: 로그인 API 연동
        console.log('로그인 시도')
        navigate('/dashboard')
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
