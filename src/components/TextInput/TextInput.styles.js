import styled from 'styled-components'

export const StyledInput = styled.input`
    width: 100%;
    height: 54px;
    padding: 0 16px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    background-color: var(--white);
    color: var(--black-900);
    font-family: var(--font-sans);
    font-size: var(--text-16);
    font-weight: var(--fw-medium);
    outline: none;

    &::placeholder {
        color: var(--gray-400);
    }

    &:focus {
        border-color: var(--blue-500);
    }
`
