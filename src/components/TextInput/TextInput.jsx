import './TextInput.css'

export default function TextInput({ value = '', onChange, placeholder, ...props }) {
    return (
        <input
            className="text-input"
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            {...props}
        />
    )
}
