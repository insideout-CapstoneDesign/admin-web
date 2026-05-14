import {
    Article,
    Content,
    Title,
    SubText,
    Actions,
    IconButton,
} from './ContainerBox.styles'

const noop = () => {}

function PencilIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20h4.2L19.4 8.8a2 2 0 0 0 0-2.8L18 4.6a2 2 0 0 0-2.8 0L4 15.8V20Z" />
            <path d="m14 6 4 4" />
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M6 7l1 14h10l1-14" />
            <path d="M9 7V4h6v3" />
        </svg>
    )
}

export default function ContainerBox({
                                         title,
                                         description,
                                         meta,
                                         selected = false,
                                         onEdit = noop,
                                         onDelete = noop,
                                     }) {
    return (
        <Article $selected={selected}>
            <Content>
                <Title>{title}</Title>
                {description && <SubText>{description}</SubText>}
                {meta && <SubText>{meta}</SubText>}
            </Content>

            <Actions>
                <IconButton
                    $color="var(--blue-500)"
                    aria-label="수정"
                    onClick={onEdit}
                >
                    <PencilIcon />
                </IconButton>
                <IconButton
                    $color="var(--red-500)"
                    aria-label="삭제"
                    onClick={onDelete}
                >
                    <TrashIcon />
                </IconButton>
            </Actions>
        </Article>
    )
}
