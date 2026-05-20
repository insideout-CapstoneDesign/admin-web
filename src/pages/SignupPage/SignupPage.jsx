import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { signupSchema } from '../../schemas/auth.schema'
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
                    />
                    {errors.displayName && <ErrorMessage>{errors.displayName.message}</ErrorMessage>}
                </FieldGroup>

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
