import styled, { css } from 'styled-components'

const variantStyles = {
    primary: css`
    background: var(--blue-500);
    color: var(--white);
    border: 1px solid var(--blue-500);
  `,

    outlineBlue: css`
    background: var(--white);
    color: var(--blue-500);
    border: 2px solid var(--blue-500);
  `,

    outlineGray: css`
    background: var(--white);
    color: var(--black-900);
    border: 1px solid var(--gray-200);
  `,

    success: css`
    background: var(--green-500);
    color: var(--white);
    border: 1px solid var(--green-500);
  `,

    danger: css`
    background: var(--red-500);
    color: var(--white);
    border: 1px solid var(--red-500);
  `,

    dangerOutline: css`
    background: var(--white);
    color: var(--red-500);
    border: 1px solid var(--red-500);
  `,
}
const sizeStyles = {
    sm: css`
    height: 34px;
    padding: 0 20px;
    font-size: var(--text-14);
  `,

    md: css`
    height: 42px;
    padding: 0 24px;
    font-size: var(--text-14);
  `,

    lg: css`
    height: 48px;
    padding: 0 28px;
    font-size: var(--text-16);
  `,
}

export const StyledButton = styled.button.attrs({ type: 'button' })`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: ${({ $full }) => ($full ? '100%' : 'auto')};

  border-radius: var(--radius-8);
  font-family: var(--font-sans);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $variant }) => variantStyles[$variant] || variantStyles.primary}
  ${({ $size }) => sizeStyles[$size] || sizeStyles.md}

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: var(--gray-400);
    color: var(--white);
    border: 1px solid var(--gray-400);
    cursor: not-allowed;
    transform: none;
    opacity: 1;
  }
`