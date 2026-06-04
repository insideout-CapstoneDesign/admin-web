export const POI_CATEGORY_OPTIONS = [
    { value: 'store.unknown', label: '매장 (미분류)' },
    { value: 'facility.elevator', label: '시설 - 엘리베이터' },
    { value: 'facility.escalator', label: '시설 - 에스컬레이터' },
    { value: 'facility.stair', label: '시설 - 계단' },
    { value: 'facility.infodesk', label: '시설 - 안내데스크' },
    { value: 'facility.aed', label: '시설 - AED' },
    { value: 'facility.restroom', label: '시설 - 화장실' },
]

export const POI_CATEGORY_ALIAS = {
    elevator: 'facility.elevator',
    escalator: 'facility.escalator',
    stair: 'facility.stair',
    infodesk: 'facility.infodesk',
    aed: 'facility.aed',
    restroom: 'facility.restroom',
    restroom_sign: 'facility.restroom',
}

export function normalizePoiCategoryCode(code) {
    const normalized = String(code || '').trim().toLowerCase()
    if (!normalized) return ''
    return POI_CATEGORY_ALIAS[normalized] || normalized
}

export function getPoiCategoryLabel(code) {
    const normalized = normalizePoiCategoryCode(code)
    const matched = POI_CATEGORY_OPTIONS.find((option) => option.value === normalized)
    return matched?.label || normalized || 'POI'
}

export function isMachinePoiName(name) {
    const normalized = String(name || '').trim().toLowerCase()
    return ['elevator', 'escalator', 'stair', 'infodesk', 'aed', 'restroom', 'poi 후보'].includes(normalized)
}

export function isMeaningfulPoiName(name) {
    const normalized = String(name || '').trim()
    if (!normalized) return false
    return normalized !== 'POI 후보'
}

export function getPoiDisplayName(poi) {
    const categoryCode = normalizePoiCategoryCode(poi.code || poi.attrs?.label)

    if (isMeaningfulPoiName(poi.name) && !isMachinePoiName(poi.name)) {
        return poi.name
    }

    if (categoryCode) {
        const categoryLabel = getPoiCategoryLabel(categoryCode)
        if (categoryLabel.startsWith('시설 - ')) {
            return categoryLabel.replace('시설 - ', '')
        }

        if (categoryLabel === '매장 (미분류)') {
            return '매장'
        }

        return categoryLabel
    }

    return poi.name || poi.attrs?.label || poi.code || '이름 없는 POI'
}

export function getPublishPoiReviewStatus(poi, draft = null) {
    if (draft?.excluded) {
        return 'excluded'
    }

    if (draft?.externalApiId) {
        return 'confirmed'
    }

    if (poi?.reviewStatus === 'excluded') {
        return 'excluded'
    }

    if (poi?.externalApiId) {
        return 'confirmed'
    }

    return 'pending'
}

export function getPublishPoiStatusLabel(status) {
    if (status === 'confirmed') return '확정됨'
    if (status === 'excluded') return '제외됨'
    return '검토 필요'
}

export function isFacilityDraftPoi(poi) {
    const categoryCode = normalizePoiCategoryCode(poi?.code)
    return categoryCode.startsWith('facility.')
}

export function buildBuildingSearchAliases(buildingName) {
    const raw = String(buildingName || '').trim()
    if (!raw) return []

    const withoutParens = raw.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
    const compact = withoutParens.replace(/\s+/g, '')
    const firstTwoTokens = withoutParens.split(/\s+/).slice(0, 2).join(' ').trim()
    const noDepartmentStore = withoutParens.replace(/백화점/g, '').replace(/\s+/g, ' ').trim()

    return [...new Set([raw, withoutParens, firstTwoTokens, compact, noDepartmentStore].filter(Boolean))]
}

export function buildPrimaryBuildingSearchAlias(buildingName) {
    const aliases = buildBuildingSearchAliases(buildingName)
    return aliases[2]
        || aliases[1]
        || aliases[0]
        || ''
}

export function buildPublishPoiSearchQuery(poi, buildingName) {
    const poiName = String(poi?.name || '').trim() || getPoiDisplayName(poi)
    const primaryAlias = buildPrimaryBuildingSearchAlias(buildingName)
    return [poiName, primaryAlias].filter(Boolean).join(' ').trim()
}

export function getPublishPoiMappedPlace(poi) {
    const draft = poi?.draft
    return {
        name: draft?.placeName || poi?.mappedPlaceName || '',
        address: draft?.address || poi?.mappedAddress || '',
        externalApiId: draft?.externalApiId || poi?.externalApiId || '',
        latitude: draft?.latitude ?? poi?.latitude ?? null,
        longitude: draft?.longitude ?? poi?.longitude ?? null,
    }
}

export function normalizeSearchToken(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\([^)]*\)/g, ' ')
        .replace(/[^a-z0-9가-힣]/g, '')
        .trim()
}

export function buildPublishPoiRecommendationQueries(poi, buildingName) {
    const poiName = String(poi?.name || '').trim() || getPoiDisplayName(poi)
    const primaryAlias = buildPrimaryBuildingSearchAlias(buildingName)
    const compactAlias = primaryAlias.replace(/\s+/g, '')

    return [...new Set([
        poiName,
        primaryAlias ? `${poiName} ${primaryAlias}`.trim() : '',
        compactAlias && compactAlias !== primaryAlias ? `${poiName} ${compactAlias}`.trim() : '',
    ].filter(Boolean))]
}

export function scorePublishPoiCandidate(place, poi, buildingName) {
    const poiToken = normalizeSearchToken(poi?.name || getPoiDisplayName(poi))
    const resultNameToken = normalizeSearchToken(place?.name)
    const resultAddressToken = normalizeSearchToken(`${place?.roadAddress || ''} ${place?.address || ''}`)
    const buildingTokens = buildBuildingSearchAliases(buildingName).map(normalizeSearchToken).filter(Boolean)

    let score = 0

    if (poiToken && resultNameToken === poiToken) score += 90
    else if (poiToken && resultNameToken.includes(poiToken)) score += 72
    else if (poiToken && poiToken.includes(resultNameToken)) score += 24

    if (buildingTokens.some((token) => resultNameToken.includes(token))) score += 30
    if (buildingTokens.some((token) => resultAddressToken.includes(token))) score += 28

    if (typeof place?.distanceMeters === 'number') {
        if (place.distanceMeters <= 120) score += 42
        else if (place.distanceMeters <= 250) score += 34
        else if (place.distanceMeters <= 500) score += 24
        else if (place.distanceMeters <= 900) score += 10
        else if (place.distanceMeters <= 1500) score -= 8
        else score -= 30
    }

    if (
        typeof place?.distanceMeters === 'number'
        && place.distanceMeters > 600
        && !buildingTokens.some((token) => resultNameToken.includes(token) || resultAddressToken.includes(token))
    ) {
        score -= 18
    }

    return score
}

export function isStrongPublishPoiCandidate(place) {
    if (!place?.externalApiId || place?.lat == null || place?.lng == null) {
        return false
    }

    const distance = typeof place.distanceMeters === 'number' ? place.distanceMeters : null
    const score = place.recommendationScore || 0

    if (distance != null && distance <= 250 && score >= 82) return true
    if (distance != null && distance <= 500 && score >= 96) return true
    if (distance === null && score >= 108) return true
    return false
}

export function getPublishSearchAnchor(editorData, poi) {
    if (editorData?.buildingLatitude != null && editorData?.buildingLongitude != null) {
        return {
            lat: editorData.buildingLatitude,
            lng: editorData.buildingLongitude,
            radius: 1200,
        }
    }

    if (poi?.latitude != null && poi?.longitude != null) {
        return {
            lat: poi.latitude,
            lng: poi.longitude,
            radius: 800,
        }
    }

    return {
        lat: null,
        lng: null,
        radius: null,
    }
}
