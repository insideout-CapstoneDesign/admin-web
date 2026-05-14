import Button from '../Button/Button'
import { Wrapper, Text } from './DeletableTextBox.styles'

const noop = () => {}

export default function DeletableTextBox({ text, onDelete = noop }) {
    return (
        <Wrapper>
            <Text>{text}</Text>
            <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                삭제
            </Button>
        </Wrapper>
    )
}
