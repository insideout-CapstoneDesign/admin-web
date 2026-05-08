import './ContainerBox.css'

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
        <article className={`container-box${selected ? ' is-selected' : ''}`}>
            <div className="container-box-content">
                <strong className="container-box-title">{title}</strong>
                {description && <span className="container-box-description">{description}</span>}
                {meta && <span className="container-box-meta">{meta}</span>}
            </div>

            <div className="container-box-actions">
                <button
                    className="container-box-icon-button is-edit"
                    type="button"
                    aria-label="수정"
                    onClick={onEdit}
                >
                    <PencilIcon />
                </button>
                <button
                    className="container-box-icon-button is-delete"
                    type="button"
                    aria-label="삭제"
                    onClick={onDelete}
                >
                    <TrashIcon />
                </button>
            </div>
        </article>
    )
}
