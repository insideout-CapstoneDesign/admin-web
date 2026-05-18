import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../Button/Button'

// --- Zod Schema ---
const tenantSchema = z.object({
    name: z.string().min(1, '단지명을 입력해주세요.'),
    slug: z
        .string()
        .min(1, '영문 식별자를 입력해주세요.')
        .regex(/^[a-z0-9-]+$/, '소문자 알파벳, 숫자, 하이픈(-)만 사용할 수 있습니다.'),
})

// --- Styled Components ---
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`

const ModalContainer = styled.div`
    background-color: var(--white);
    width: 100%;
    max-width: 400px;
    border-radius: var(--radius-12);
    padding: 32px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`

const Title = styled.h2`
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 700;
    color: var(--black-900);
    margin: 0;
`

const CloseButton = styled.button`
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: color 0.2s;

    &:hover {
        color: var(--gray-700);
    }
`

const Form = styled.form`
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
    color: var(--black-900);
`

const Input = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 16px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    font-family: var(--font-sans);
    font-size: var(--text-14);
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: var(--blue-500);
    }

    &::placeholder {
        color: var(--gray-400);
    }
`

const ErrorMessage = styled.span`
    color: var(--red-500, #ef4444);
    font-size: 12px;
    font-family: var(--font-sans);
    margin-top: 4px;
`

const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
`

export default function TenantModal({ isOpen, onClose }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(tenantSchema),
        mode: 'onChange',
    })

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            reset()
        }
    }, [isOpen, reset])

    if (!isOpen) return null

    const onSubmit = (data) => {
        // TODO: 백엔드 API 호출 (POST /api/v1/tenants)
        console.log('단지 등록 완료:', data)
        onClose() // 임시로 등록 후 모달 닫기
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <Overlay onClick={handleOverlayClick}>
            <ModalContainer>
                <Header>
                    <Title>단지 등록</Title>
                    <CloseButton onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </CloseButton>
                </Header>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Label htmlFor="name">단지명</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="예: 신세계백화점 본점"
                            {...register('name')}
                        />
                        {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                    </FieldGroup>

                    <FieldGroup>
                        <Label htmlFor="slug">영문 식별자 (Slug)</Label>
                        <Input
                            id="slug"
                            type="text"
                            placeholder="예: shinsegae-main"
                            {...register('slug')}
                        />
                        {errors.slug && <ErrorMessage>{errors.slug.message}</ErrorMessage>}
                    </FieldGroup>

                    <Footer>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            취소
                        </Button>
                        <Button type="submit" variant="primary">
                            등록
                        </Button>
                    </Footer>
                </Form>
            </ModalContainer>
        </Overlay>
    )
}
