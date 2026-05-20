import styled from 'styled-components'
import Button from '../../components/Button/Button'

export const Wrapper = styled.div`
    width: 100%;
    min-height: calc(100vh - 65px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--white);
    padding: 32px;
`

export const PageTitle = styled.h1`
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 700;
    color: var(--blue-500);
    margin: 0 0 32px;
`

export const Form = styled.form`
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`

export const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

export const Label = styled.label`
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: var(--fw-semibold);
    color: var(--black-950);
`

export const Input = styled.input`
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

export const LoginButton = styled(Button)`
    width: 100%;
    height: 48px;
    margin-top: 4px;
    font-size: var(--text-16);
    font-weight: var(--fw-bold);
    border-radius: var(--radius-8);
`

export const SignupLink = styled.button`
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
