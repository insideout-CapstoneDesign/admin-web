import Button from '../Button/Button'
import './DeletableTextBox.css'

const noop = () => {}

export default function DeletableTextBox({ text, onDelete = noop }) {
    return (
        <div className="deletable-text-box">
            <span className="deletable-text-box-text">{text}</span>
            <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                삭제
            </Button>
        </div>
    )
}
