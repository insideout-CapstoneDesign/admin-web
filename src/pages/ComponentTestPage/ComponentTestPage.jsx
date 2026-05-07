import { useState } from 'react'
import ContainerBox from '../../components/ContainerBox/ContainerBox'
import DeletableTextBox from '../../components/DeletableTextBox/DeletableTextBox'
import TextInput from '../../components/TextInput/TextInput'
import {
    containerMocks,
    deletableTextBoxMocks,
    textInputMock,
} from '../../mocks/componentTest.mock'
import './ComponentTestPage.css'

export default function ComponentTestPage() {
    const [placeName, setPlaceName] = useState('')

    return (
        <main className="component-test-page">
            {containerMocks.map((container) => (
                <section className="component-test-section" key={container.id}>
                    <ContainerBox
                        title={container.title}
                        description={container.description}
                        meta={container.meta}
                        selected={container.selected}
                    />
                </section>
            ))}

            <section className="component-test-section">
                <TextInput
                    value={placeName}
                    onChange={setPlaceName}
                    placeholder={textInputMock.placeholder}
                    aria-label={textInputMock.ariaLabel}
                />
            </section>

            {deletableTextBoxMocks.map((textBox) => (
                <section className="component-test-section" key={textBox.id}>
                    <DeletableTextBox text={textBox.text} />
                </section>
            ))}
        </main>
    )
}
