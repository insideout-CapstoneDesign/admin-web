import { z } from 'zod'

export const passwordSchema = z
    .string()
    .min(8, '비밀번호는 8~15자여야 합니다.')
    .max(15, '비밀번호는 8~15자여야 합니다.')
    .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])[!-~]{8,15}$/,
        '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
    )

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, '이메일을 입력해 주세요.')
        .email('올바른 이메일 형식을 입력해 주세요.'),
    password: passwordSchema,
})

export const signupSchema = z
    .object({
        displayName: z
            .string()
            .min(1, '이름을 입력해 주세요.')
            .max(10, '이름은 10자 이내로 입력해 주세요.'),
        email: z
            .string()
            .min(1, '이메일을 입력해 주세요.')
            .email('올바른 이메일 형식을 입력해 주세요.'),
        password: passwordSchema,
        passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해 주세요.'),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: '비밀번호가 일치하지 않습니다.',
    })
