import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getBuildingDraftPoisApi,
    publishBuildingDraftApi,
    saveBuildingPoiMappingsApi,
    searchPlacesApi,
} from '../../../api/buildingApi'
import {
    buildPublishPoiRecommendationQueries,
    buildPublishPoiSearchQuery,
    getPoiDisplayName,
    getPublishPoiMappedPlace,
    getPublishPoiReviewStatus,
    getPublishPoiStatusLabel,
    getPublishSearchAnchor,
    isFacilityDraftPoi,
    isStrongPublishPoiCandidate,
    scorePublishPoiCandidate,
} from '../utils/publishReview'

export default function usePublishReview({
    tenantId,
    buildingId,
    editorData,
    hasPendingEdits,
    publishEntranceReady,
    refreshEntranceMappings,
    mappedGateCount,
    campusGateCount,
    onMoveToConnectionTab,
    onSaveDraft,
}) {
    const navigate = useNavigate()
    const [isPublishing, setIsPublishing] = useState(false)
    const [isPublishReviewOpen, setIsPublishReviewOpen] = useState(false)
    const [draftPoisForPublish, setDraftPoisForPublish] = useState([])
    const [publishPoiEdits, setPublishPoiEdits] = useState({})
    const [publishPoiFilterKeyword, setPublishPoiFilterKeyword] = useState('')
    const [activePublishPoiId, setActivePublishPoiId] = useState(null)
    const [publishPoiSearchKeyword, setPublishPoiSearchKeyword] = useState('')
    const [publishPoiSearchResults, setPublishPoiSearchResults] = useState([])
    const [publishPoiRecommendations, setPublishPoiRecommendations] = useState([])
    const [publishPoiRecommendationMap, setPublishPoiRecommendationMap] = useState({})
    const [isPublishReviewLoading, setIsPublishReviewLoading] = useState(false)
    const [isPublishPoiSearchLoading, setIsPublishPoiSearchLoading] = useState(false)
    const [isPublishPoiRecommendLoading, setIsPublishPoiRecommendLoading] = useState(false)
    const [isSavingPublishPoiMappings, setIsSavingPublishPoiMappings] = useState(false)
    const [publishReviewError, setPublishReviewError] = useState('')

    async function fetchPublishPoiRecommendationCandidates(poi, { size = 6, queryLimit = 3 } = {}) {
        if (!poi) {
            return []
        }

        if (getPublishPoiReviewStatus(poi, poi.draft) === 'excluded' || isFacilityDraftPoi(poi)) {
            return []
        }

        const queries = buildPublishPoiRecommendationQueries(poi, editorData?.buildingName).slice(0, queryLimit)
        const anchor = getPublishSearchAnchor(editorData, poi)
        const responses = await Promise.all(
            queries.map((query) => searchPlacesApi(query, {
                lat: anchor.lat,
                lng: anchor.lng,
                radius: anchor.radius,
                size,
            }).catch(() => []))
        )

        const deduped = new Map()
        responses.flat().forEach((place) => {
            const key = place.externalApiId || `${place.name}-${place.address}`
            const recommendationScore = scorePublishPoiCandidate(place, poi, editorData?.buildingName)
            const nextPlace = {
                ...place,
                recommendationScore,
            }

            if (!deduped.has(key) || recommendationScore > (deduped.get(key)?.recommendationScore || 0)) {
                deduped.set(key, nextPlace)
            }
        })

        return [...deduped.values()]
            .filter((place) => place.recommendationScore >= 20)
            .filter((place) => place.distanceMeters == null || place.distanceMeters <= 2000)
            .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
            .slice(0, 5)
    }

    async function buildInitialPublishPoiReviewState(draftPois) {
        const initialPoiEdits = Object.fromEntries(
            (draftPois || [])
                .filter((poi) => isFacilityDraftPoi(poi) && !poi.externalApiId && poi.reviewStatus !== 'excluded')
                .map((poi) => [
                    poi.id,
                    {
                        excluded: true,
                        externalApiId: null,
                        latitude: null,
                        longitude: null,
                        placeName: '',
                        address: '',
                    },
                ])
        )

        const recommendationMap = {}
        const autoReviewTargets = (draftPois || []).filter((poi) => {
            if (initialPoiEdits[poi.id]) return false
            return getPublishPoiReviewStatus(poi) === 'pending'
        })

        let nextIndex = 0
        const workerCount = Math.min(4, autoReviewTargets.length)

        async function worker() {
            while (nextIndex < autoReviewTargets.length) {
                const poi = autoReviewTargets[nextIndex]
                nextIndex += 1

                const recommendations = await fetchPublishPoiRecommendationCandidates(poi, {
                    size: 5,
                    queryLimit: 2,
                })

                recommendationMap[poi.id] = recommendations

                const bestCandidate = recommendations[0]
                if (isStrongPublishPoiCandidate(bestCandidate)) {
                    initialPoiEdits[poi.id] = {
                        excluded: false,
                        externalApiId: bestCandidate.externalApiId,
                        latitude: bestCandidate.lat,
                        longitude: bestCandidate.lng,
                        placeName: bestCandidate.name,
                        address: bestCandidate.roadAddress || bestCandidate.address || '',
                    }
                }
            }
        }

        await Promise.all(Array.from({ length: workerCount }, () => worker()))

        return {
            initialPoiEdits,
            recommendationMap,
        }
    }

    const publishPoiRows = useMemo(() => {
        const reviewStatusOrder = {
            confirmed: 0,
            pending: 1,
            excluded: 2,
        }

        return (draftPoisForPublish || [])
            .map((poi) => {
                const draft = publishPoiEdits[poi.id]
                const reviewStatus = getPublishPoiReviewStatus(poi, draft)
                const mappedPlace = getPublishPoiMappedPlace({
                    ...poi,
                    draft,
                })
                return {
                    ...poi,
                    draft,
                    reviewStatus,
                    mappedPlace,
                }
            })
            .sort((a, b) => {
                const statusDiff = (reviewStatusOrder[a.reviewStatus] ?? 9) - (reviewStatusOrder[b.reviewStatus] ?? 9)
                if (statusDiff !== 0) return statusDiff

                const floorDiff = String(a.floorName || '').localeCompare(String(b.floorName || ''), 'ko')
                if (floorDiff !== 0) return floorDiff

                return getPoiDisplayName(a).localeCompare(getPoiDisplayName(b), 'ko')
            })
    }, [draftPoisForPublish, publishPoiEdits])

    const pendingPublishPoiCount = useMemo(
        () => publishPoiRows.filter((poi) => poi.reviewStatus === 'pending').length,
        [publishPoiRows]
    )

    const reviewedPublishPoiCount = useMemo(
        () => publishPoiRows.filter((poi) => poi.reviewStatus !== 'pending').length,
        [publishPoiRows]
    )

    const filteredPublishPoiRows = useMemo(() => {
        const keyword = publishPoiFilterKeyword.trim().toLowerCase()
        if (!keyword) {
            return publishPoiRows
        }

        return publishPoiRows.filter((poi) => {
            const fields = [
                poi.name,
                poi.floorName,
                poi.code,
                poi.mappedPlace?.name,
                poi.mappedPlace?.address,
            ]

            return fields.some((value) => String(value || '').toLowerCase().includes(keyword))
        })
    }, [publishPoiFilterKeyword, publishPoiRows])

    const activePublishPoi = useMemo(
        () => publishPoiRows.find((poi) => poi.id === activePublishPoiId) || publishPoiRows[0] || null,
        [activePublishPoiId, publishPoiRows]
    )

    async function loadPublishPoiRecommendations(poi) {
        if (!poi) {
            setPublishPoiRecommendations([])
            return
        }

        if (getPublishPoiReviewStatus(poi, poi.draft) === 'excluded' || isFacilityDraftPoi(poi)) {
            setPublishPoiRecommendations([])
            return
        }

        try {
            setIsPublishPoiRecommendLoading(true)
            const recommendations = await fetchPublishPoiRecommendationCandidates(poi)
            setPublishPoiRecommendationMap((current) => ({
                ...current,
                [poi.id]: recommendations,
            }))
            setPublishPoiRecommendations(recommendations)
        } finally {
            setIsPublishPoiRecommendLoading(false)
        }
    }

    useEffect(() => {
        if (!activePublishPoi) {
            setPublishPoiSearchKeyword('')
            setPublishPoiSearchResults([])
            setPublishPoiRecommendations([])
            return
        }

        setPublishPoiSearchKeyword(buildPublishPoiSearchQuery(activePublishPoi, editorData?.buildingName))
        setPublishPoiSearchResults([])
        const cachedRecommendations = publishPoiRecommendationMap[activePublishPoi.id]
        if (cachedRecommendations) {
            setPublishPoiRecommendations(cachedRecommendations)
            return
        }
        void loadPublishPoiRecommendations(activePublishPoi)
    }, [activePublishPoi, editorData?.buildingName, publishPoiRecommendationMap])

    async function loadPublishReviewData() {
        if (!tenantId || !buildingId) return

        setIsPublishReviewLoading(true)
        setPublishReviewError('')

        try {
            await refreshEntranceMappings({ silent: true })
            const draftPois = await getBuildingDraftPoisApi(tenantId, buildingId)
            const { initialPoiEdits, recommendationMap } = await buildInitialPublishPoiReviewState(draftPois || [])
            const firstPendingPoi = (draftPois || []).find((poi) => getPublishPoiReviewStatus(poi, initialPoiEdits[poi.id]) === 'pending')

            setDraftPoisForPublish(draftPois || [])
            setPublishPoiEdits(initialPoiEdits)
            setPublishPoiRecommendationMap(recommendationMap)
            setActivePublishPoiId(firstPendingPoi?.id || (draftPois || [])[0]?.id || null)
            setPublishPoiSearchResults([])
            setPublishPoiRecommendations(recommendationMap[firstPendingPoi?.id] || recommendationMap[(draftPois || [])[0]?.id] || [])
        } catch (err) {
            setPublishReviewError(err.message || '배포 전 검토 데이터를 불러오지 못했습니다.')
        } finally {
            setIsPublishReviewLoading(false)
        }
    }

    function closePublishReview() {
        setIsPublishReviewOpen(false)
        setPublishPoiFilterKeyword('')
        setPublishPoiSearchResults([])
        setPublishPoiRecommendations([])
        setPublishPoiRecommendationMap({})
        setPublishReviewError('')
    }

    function markPublishPoiExcluded(poiId) {
        setPublishPoiEdits((current) => ({
            ...current,
            [poiId]: {
                excluded: true,
                externalApiId: null,
                latitude: null,
                longitude: null,
                placeName: '',
                address: '',
            },
        }))
    }

    function clearPublishPoiReview(poiId) {
        setPublishPoiEdits((current) => {
            const next = { ...current }
            delete next[poiId]
            return next
        })
    }

    function confirmPublishPoiMapping(poiId, place) {
        setPublishPoiEdits((current) => ({
            ...current,
            [poiId]: {
                excluded: false,
                externalApiId: place.externalApiId,
                latitude: place.lat,
                longitude: place.lng,
                placeName: place.name,
                address: place.roadAddress || place.address || '',
            },
        }))
    }

    async function searchPublishPoiCandidates() {
        if (!activePublishPoi) return

        const keyword = publishPoiSearchKeyword.trim()
        if (!keyword) {
            window.alert('검색어를 입력해 주세요.')
            return
        }

        try {
            setIsPublishPoiSearchLoading(true)
            const anchor = getPublishSearchAnchor(editorData, activePublishPoi)
            const results = await searchPlacesApi(keyword, {
                lat: anchor.lat,
                lng: anchor.lng,
                radius: anchor.radius,
                size: 8,
            })
            const scoredResults = (results || [])
                .map((place) => ({
                    ...place,
                    recommendationScore: scorePublishPoiCandidate(place, activePublishPoi, editorData?.buildingName),
                }))
                .filter((place) => place.distanceMeters == null || place.distanceMeters <= 2500)
                .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
            setPublishPoiSearchResults(scoredResults)
        } catch (err) {
            window.alert(err.message || '장소 검색 중 오류가 발생했습니다.')
        } finally {
            setIsPublishPoiSearchLoading(false)
        }
    }

    async function openPublishReview() {
        if (hasPendingEdits) {
            if (onSaveDraft) {
                const saved = await onSaveDraft({ silent: true })
                if (!saved) {
                    window.alert('현재 층 편집 내용을 임시저장하지 못해 배포를 진행할 수 없습니다.')
                    return
                }
            } else {
                window.alert('최종 배포 전에는 현재 층 편집 내용을 먼저 임시저장해 주세요.')
                return
            }
        }

        setIsPublishReviewOpen(true)
        await loadPublishReviewData()
    }

    async function handleConfirmPublish() {
        if (!tenantId || !buildingId) return
        if (!publishEntranceReady) {
            window.alert('출입구 캘리브레이션이 완료되지 않아 최종 배포할 수 없습니다.')
            return
        }
        if (pendingPublishPoiCount > 0) {
            window.alert('외부 매핑 검토가 끝나지 않은 POI가 있어 최종 배포할 수 없습니다.')
            return
        }

        const mappingPayload = {
            mappings: publishPoiRows
                .filter((poi) => poi.reviewStatus !== 'pending')
                .map((poi) => ({
                    poiId: poi.id,
                    externalApiId: poi.reviewStatus === 'confirmed'
                        ? (poi.draft?.externalApiId || poi.externalApiId)
                        : null,
                    latitude: poi.reviewStatus === 'confirmed'
                        ? (poi.draft?.latitude ?? poi.latitude)
                        : null,
                    longitude: poi.reviewStatus === 'confirmed'
                        ? (poi.draft?.longitude ?? poi.longitude)
                        : null,
                    placeName: poi.reviewStatus === 'confirmed'
                        ? (poi.draft?.placeName || poi.mappedPlaceName || '')
                        : null,
                    address: poi.reviewStatus === 'confirmed'
                        ? (poi.draft?.address || poi.mappedAddress || '')
                        : null,
                    excluded: poi.reviewStatus === 'excluded',
                })),
        }

        try {
            setIsSavingPublishPoiMappings(true)
            setIsPublishing(true)
            await saveBuildingPoiMappingsApi(tenantId, buildingId, mappingPayload)
            await publishBuildingDraftApi(tenantId, buildingId)
            window.alert('성공적으로 정식 버전이 배포되었습니다!')
            closePublishReview()
            navigate(`/tenant/${tenantId}`)
        } catch (err) {
            window.alert(err.message || '배포 중 오류가 발생했습니다.')
        } finally {
            setIsSavingPublishPoiMappings(false)
            setIsPublishing(false)
        }
    }

    return {
        isPublishing,
        openPublishReview,
        closePublishReview,
        modalProps: {
            isOpen: isPublishReviewOpen,
            isPublishing,
            isSavingPublishPoiMappings,
            onClose: closePublishReview,
            reviewedPublishPoiCount,
            publishPoiRows,
            filteredPublishPoiRows,
            publishPoiFilterKeyword,
            onChangePublishPoiFilterKeyword: setPublishPoiFilterKeyword,
            mappedGateCount,
            campusGateCount,
            publishEntranceReady,
            pendingPublishPoiCount,
            activePublishPoi,
            onSelectPoi: setActivePublishPoiId,
            isPublishReviewLoading,
            publishReviewError,
            onExcludePoi: markPublishPoiExcluded,
            onClearPoiReview: clearPublishPoiReview,
            onMoveToConnectionTab: () => {
                closePublishReview()
                onMoveToConnectionTab?.()
            },
            isFacilityDraftPoi,
            getPublishPoiStatusLabel,
            isPublishPoiRecommendLoading,
            publishPoiRecommendations,
            onConfirmPoiMapping: confirmPublishPoiMapping,
            publishPoiSearchKeyword,
            onChangePublishPoiSearchKeyword: setPublishPoiSearchKeyword,
            onSearchPublishPoiCandidates: searchPublishPoiCandidates,
            isPublishPoiSearchLoading,
            publishPoiSearchResults,
            onConfirmPublish: handleConfirmPublish,
        },
    }
}
