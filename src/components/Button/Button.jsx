import { StyledButton } from './Button.styles'

export default function Button({
                                   variant = 'primary',
                                   size = 'md',
                                   full = false,
                                   children,
                                   ...props
                               }) {
    return (
        <StyledButton
            $variant={variant}
            $size={size}
            $full={full}
            {...props}
        >
            {children}
        </StyledButton>
    )
}