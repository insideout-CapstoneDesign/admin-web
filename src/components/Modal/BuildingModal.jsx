import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../Button/Button'
import AddressSearchModal from './AddressSearchModal'

const floorSchema = z.object({
    level: z.number().int().refine((value) => value !== 0, {
        message: '0층은 사용할 수 없습니다.',
    }),
    name: z.string().min(1),
})

const buildingSchema = z.object({
    name: z.string().min(1, '건물명을 입력해주세요.'),
    address: z.string().min(1, '주소를 검색해주세요.'),
    longitude: z.string().optional(),
    latitude: z.string().optional(),
    externalApiId: z.string().optional(),
    entranceCount: z.coerce.number().int().min(0, '출입구 개수는 0 이상이어야 합니다.'),
    basementFloorCount: z.coerce.number().int().min(0, '지하 층수는 0 이상이어야 합니다.'),
    groundFloorMax: z.coerce.number().int().min(1, '지상 끝 층은 1 이상이어야 합니다.'),
    floors: z.array(floorSchema).min(1, '층 목록을 1개 이상 등록해주세요.'),
})

const defaultValues = {
    name: '',
    address: '',
    longitude: '',
    latitude: '',
    externalApiId: '',
    entranceCount: 0,
    basementFloorCount: 0,
    groundFloorMax: 1,
    floors: [],
}

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`

const ModalContainer = styled.div`
    background-color: var(--white);
    width: 100%;
    max-width: 440px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: var(--radius-12);
    padding: 32px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`

const Title = styled.h2`
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 700;
    color: var(--black-900);
    margin: 0;
`

const CloseButton = styled.button`
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    transition: color 0.2s;

    &:hover {
        color: var(--gray-700);
    }
`

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const Label = styled.label`
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: var(--fw-semibold);
    color: var(--black-900);
`

const Description = styled.p`
    margin: 0;
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.5;
`

const InputWrapper = styled.div`
    display: flex;
    gap: 8px;
`

const RangeRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
`

const Input = styled.input`
    width: 100%;
    height: 48px;
    padding: 0 16px;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-8);
    font-family: var(--font-sans);
    font-size: var(--text-14);
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: var(--blue-500);
    }

    &::placeholder {
        color: var(--gray-400);
    }

    &:disabled,
    &:read-only {
        background-color: var(--gray-50);
        cursor: not-allowed;
        color: var(--gray-600);
    }
`

const ErrorMessage = styled.span`
    color: var(--red-500, #ef4444);
    font-size: 12px;
    font-family: var(--font-sans);
    margin-top: 4px;
`

const FloorActions = styled.div`
    display: flex;
    justify-content: flex-start;
`

const FloorTagList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`

const EmptyFloorState = styled.div`
    border: 1px dashed var(--gray-200);
    border-radius: var(--radius-8);
    padding: 14px 16px;
    color: var(--gray-500);
    font-size: 13px;
    background: var(--gray-50);
`

const FloorTag = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background-color: var(--blue-50);
    color: var(--blue-700);
    font-size: 13px;
    font-weight: 600;
`

const RemoveFloorButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.12);
    color: inherit;
    cursor: pointer;

    &:hover {
        background: rgba(37, 99, 235, 0.2);
    }
`

const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
`

function createFloorName(level) {
    return level < 0 ? `B${Math.abs(level)}` : `${level}F`
}

function createDisplayFloorName(level) {
    return level < 0 ? `B${Math.abs(level)}층` : `${level}층`
}

function buildFloorList(basementFloorCount, groundFloorMax) {
    const floors = []

    for (let level = -basementFloorCount; level <= -1; level += 1) {
        floors.push({ level, name: createFloorName(level) })
    }

    for (let level = 1; level <= groundFloorMax; level += 1) {
        floors.push({ level, name: createFloorName(level) })
    }

    return floors
}

export default function BuildingModal({ isOpen, onClose, onSubmitSuccess }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [generatedFloors, setGeneratedFloors] = useState([])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        getValues,
        clearErrors,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(buildingSchema),
        mode: 'onChange',
        defaultValues,
    })

    useEffect(() => {
        if (isOpen) {
            reset(defaultValues)
        }
    }, [isOpen, reset])

    if (!isOpen) return null

    const handleClose = () => {
        setGeneratedFloors([])
        onClose()
    }

    const handleGenerateFloors = () => {
        const basementFloorCount = Number(getValues('basementFloorCount') ?? 0)
        const groundFloorMax = Number(getValues('groundFloorMax') ?? 1)
        const nextFloors = buildFloorList(basementFloorCount, groundFloorMax)

        setGeneratedFloors(nextFloors)
        setValue('floors', nextFloors, { shouldValidate: true, shouldDirty: true })
        clearErrors('floors')
    }

    const handleRemoveFloor = (level) => {
        const nextFloors = generatedFloors.filter((floor) => floor.level !== level)
        setGeneratedFloors(nextFloors)
        setValue('floors', nextFloors, { shouldValidate: true, shouldDirty: true })
    }

    const onSubmit = (data) => {
        const payload = {
            name: data.name,
            address: data.address,
            longitude: data.longitude,
            latitude: data.latitude,
            externalApiId: data.externalApiId,
            entranceCount: data.entranceCount,
            meta: {
                location: data.longitude && data.latitude
                    ? {
                        longitude: data.longitude,
                        latitude: data.latitude,
                    }
                    : null,
            },
            floors: data.floors,
        }

        console.log('건물 등록 payload:', payload)

        const newBuildingId = payload.externalApiId || `new-building-${payload.floors.map((floor) => floor.level).join('-')}`
        onSubmitSuccess({
            id: newBuildingId,
            name: payload.name,
            address: payload.address,
            entranceCount: payload.entranceCount,
            floors: payload.floors,
        })
        handleClose()
    }

    const handlePlaceSelect = (place) => {
        setValue('name', place.place_name || '', { shouldValidate: true })
        setValue('address', place.road_address_name || place.address_name || '', { shouldValidate: true })
        if (place.x) setValue('longitude', String(place.x))
        if (place.y) setValue('latitude', String(place.y))
        if (place.id) setValue('externalApiId', String(place.id))
    }

    const onError = (formErrors) => {
        console.error('폼 유효성 검사 실패:', formErrors)
        alert('필수 항목을 모두 입력해주세요.')
    }

    return (
        <>
            <Overlay onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
                <ModalContainer>
                    <Header>
                        <Title>건물 추가</Title>
                        <CloseButton type="button" onClick={handleClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </CloseButton>
                    </Header>

                    <Form onSubmit={handleSubmit(onSubmit, onError)}>
                        <FieldGroup>
                            <Label htmlFor="address">건물 주소</Label>
                            <InputWrapper>
                                <Input
                                    id="address"
                                    type="text"
                                    placeholder="[검색] 버튼을 눌러 주소를 입력하세요"
                                    readOnly
                                    {...register('address')}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsSearchOpen(true)}
                                    style={{ flexShrink: 0, padding: '0 16px' }}
                                >
                                    검색
                                </Button>
                            </InputWrapper>
                            {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
                        </FieldGroup>

                        <FieldGroup>
                            <Label htmlFor="name">건물명</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="예: 신공학관"
                                {...register('name')}
                            />
                            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
                        </FieldGroup>

                        <FieldGroup>
                            <Label htmlFor="entranceCount">출입구 개수</Label>
                            <Input
                                id="entranceCount"
                                type="number"
                                min="0"
                                placeholder="0"
                                {...register('entranceCount')}
                            />
                            <Description>건물 엔티티의 필수값입니다. 출입구가 아직 확정되지 않았다면 0으로 두면 됩니다.</Description>
                            {errors.entranceCount && <ErrorMessage>{errors.entranceCount.message}</ErrorMessage>}
                        </FieldGroup>

                        <FieldGroup>
                            <Label>층 구조 설정</Label>
                            <Description>지하 시작 층수와 지상 끝 층수를 입력한 뒤 자동 생성하고, 실제 없는 층은 태그에서 제거하세요.</Description>
                            <RangeRow>
                                <FieldGroup>
                                    <Label htmlFor="basementFloorCount">지하 층수</Label>
                                    <Input
                                        id="basementFloorCount"
                                        type="number"
                                        min="0"
                                        placeholder="예: 2"
                                        {...register('basementFloorCount')}
                                    />
                                    {errors.basementFloorCount && <ErrorMessage>{errors.basementFloorCount.message}</ErrorMessage>}
                                </FieldGroup>

                                <FieldGroup>
                                    <Label htmlFor="groundFloorMax">지상 끝 층</Label>
                                    <Input
                                        id="groundFloorMax"
                                        type="number"
                                        min="1"
                                        placeholder="예: 5"
                                        {...register('groundFloorMax')}
                                    />
                                    {errors.groundFloorMax && <ErrorMessage>{errors.groundFloorMax.message}</ErrorMessage>}
                                </FieldGroup>
                            </RangeRow>

                            <FloorActions>
                                <Button type="button" variant="secondary" onClick={handleGenerateFloors}>
                                    층 목록 자동 생성
                                </Button>
                            </FloorActions>

                            {generatedFloors.length > 0 ? (
                                <FloorTagList>
                                    {generatedFloors.map((floor) => (
                                        <FloorTag key={floor.level}>
                                            {createDisplayFloorName(floor.level)}
                                            <RemoveFloorButton
                                                type="button"
                                                aria-label={`${createDisplayFloorName(floor.level)} 제거`}
                                                onClick={() => handleRemoveFloor(floor.level)}
                                            >
                                                ×
                                            </RemoveFloorButton>
                                        </FloorTag>
                                    ))}
                                </FloorTagList>
                            ) : (
                                <EmptyFloorState>아직 생성된 층이 없습니다. 범위를 입력하고 목록을 생성해주세요.</EmptyFloorState>
                            )}

                            {errors.floors && <ErrorMessage>{errors.floors.message}</ErrorMessage>}
                        </FieldGroup>

                        <Footer>
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                취소
                            </Button>
                            <Button type="submit" variant="primary">
                                등록
                            </Button>
                        </Footer>
                    </Form>
                </ModalContainer>
            </Overlay>

            <AddressSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handlePlaceSelect}
            />
        </>
    )
}
