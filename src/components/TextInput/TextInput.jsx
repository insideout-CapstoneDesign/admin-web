import { StyledInput } from './TextInput.styles'

export default function TextInput({ value = '', onChange, placeholder, ...props }) {
    return (
        <StyledInput
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            {...props}
        />
    )
}
