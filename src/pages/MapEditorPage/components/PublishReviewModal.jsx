import Button from '../../../components/Button/Button'
import {
    PublishActionRow,
    PublishDetailCard,
    PublishDetailGrid,
    PublishDetailHeader,
    PublishDetailLabel,
    PublishDetailValue,
    PublishErrorCard,
    PublishFooterHint,
    PublishHelpText,
    PublishLoadingCard,
    PublishPoiItem,
    PublishPoiItemTop,
    PublishPoiList,
    PublishPoiMeta,
    PublishRequirementNotice,
    PublishReviewBody,
    PublishReviewContent,
    PublishReviewFooter,
    PublishReviewHeader,
    PublishReviewModalShell,
    PublishReviewOverlay,
    PublishReviewSidebar,
    PublishReviewSummaryCard,
    PublishReviewSummaryGrid,
    PublishSearchInput,
    PublishSearchResultCard,
    PublishSearchResultMeta,
    PublishSearchResults,
    PublishSearchRow,
    PublishSectionTitle,
    PublishStatusBadge,
} from './PublishReviewModal.styles'

function renderPlaceDistance(place) {
    if (typeof place?.distanceMeters !== 'number') {
        return null
    }
    return <span>건물 기준 거리: {Math.round(place.distanceMeters)}m</span>
}

export default function PublishReviewModal({
    isOpen,
    isPublishing,
    isSavingPublishPoiMappings,
    onClose,
    reviewedPublishPoiCount,
    publishPoiRows,
    mappedGateCount,
    campusGateCount,
    publishEntranceReady,
    pendingPublishPoiCount,
    activePublishPoi,
    onSelectPoi,
    isPublishReviewLoading,
    publishReviewError,
    onExcludePoi,
    onClearPoiReview,
    onMoveToConnectionTab,
    isFacilityDraftPoi,
    getPublishPoiStatusLabel,
    isPublishPoiRecommendLoading,
    publishPoiRecommendations,
    onConfirmPoiMapping,
    publishPoiSearchKeyword,
    onChangePublishPoiSearchKeyword,
    onSearchPublishPoiCandidates,
    isPublishPoiSearchLoading,
    publishPoiSearchResults,
    onConfirmPublish,
}) {
    if (!isOpen) {
        return null
    }

    return (
        <PublishReviewOverlay
            onClick={(event) => {
                if (event.target === event.currentTarget && !isPublishing && !isSavingPublishPoiMappings) {
                    onClose()
                }
            }}
        >
            <PublishReviewModalShell>
                <PublishReviewHeader>
                    <div>
                        <h3>최종 배포 전 검토</h3>
                        <p>출입구 캘리브레이션과 POI 외부 매핑이 모두 끝나야 publish할 수 있습니다. 이 단계에서 확정 또는 제외 처리한 결과만 최종 배포에 반영됩니다.</p>
                    </div>
                    <Button variant="outlineGray" size="sm" onClick={onClose} disabled={isPublishing || isSavingPublishPoiMappings}>
                        닫기
                    </Button>
                </PublishReviewHeader>

                <PublishReviewBody>
                    <PublishReviewSidebar>
                        <PublishSectionTitle>
                            <h3>배포 체크</h3>
                            <span>{reviewedPublishPoiCount}/{publishPoiRows.length}개 처리</span>
                        </PublishSectionTitle>

                        <PublishReviewSummaryGrid>
                            <PublishReviewSummaryCard $tone={publishEntranceReady ? 'success' : 'danger'}>
                                <strong>{mappedGateCount}/{campusGateCount}</strong>
                                <span>출입구 캘리브레이션</span>
                            </PublishReviewSummaryCard>
                            <PublishReviewSummaryCard $tone={pendingPublishPoiCount === 0 ? 'success' : 'danger'}>
                                <strong>{reviewedPublishPoiCount}/{publishPoiRows.length}</strong>
                                <span>POI 외부 매핑 검토</span>
                            </PublishReviewSummaryCard>
                        </PublishReviewSummaryGrid>

                        <PublishRequirementNotice $tone={publishEntranceReady ? 'success' : 'danger'}>
                            {publishEntranceReady
                                ? '출입구 캘리브레이션은 완료되었습니다.'
                                : '아직 gate 매핑이 끝나지 않았습니다. 연결 탭에서 모든 campus gate를 실내 node와 연결해야 합니다.'}
                        </PublishRequirementNotice>

                        <PublishRequirementNotice $tone={pendingPublishPoiCount === 0 ? 'success' : 'danger'}>
                            {pendingPublishPoiCount === 0
                                ? '모든 draft POI의 외부 매핑 검토가 완료되었습니다.'
                                : `아직 검토가 필요한 draft POI가 ${pendingPublishPoiCount}개 남아 있습니다.`}
                        </PublishRequirementNotice>

                        <PublishPoiList>
                            {publishPoiRows.map((poi) => (
                                <PublishPoiItem
                                    key={poi.id}
                                    type="button"
                                    $active={activePublishPoi?.id === poi.id}
                                    onClick={() => onSelectPoi(poi.id)}
                                >
                                    <PublishPoiItemTop>
                                        <strong>{poi.name || '이름 없는 POI'}</strong>
                                        <PublishStatusBadge $status={poi.reviewStatus}>
                                            {getPublishPoiStatusLabel(poi.reviewStatus)}
                                        </PublishStatusBadge>
                                    </PublishPoiItemTop>
                                    <PublishPoiMeta>
                                        <span>{poi.floorName || '-'} · {poi.code || '코드 없음'}</span>
                                        <br />
                                        {poi.reviewStatus === 'confirmed' ? (
                                            <>
                                                <span>{poi.mappedPlace.name || '매핑 장소명 없음'}</span>
                                                <br />
                                                <span>{poi.mappedPlace.address || `외부 ID: ${poi.mappedPlace.externalApiId || '-'}`}</span>
                                            </>
                                        ) : poi.reviewStatus === 'excluded' ? (
                                            <span>외부 매핑 제외 처리됨</span>
                                        ) : (
                                            <span>추천 후보를 확인해 주세요</span>
                                        )}
                                    </PublishPoiMeta>
                                </PublishPoiItem>
                            ))}
                        </PublishPoiList>
                    </PublishReviewSidebar>

                    <PublishReviewContent>
                        {isPublishReviewLoading ? (
                            <PublishLoadingCard>배포 전 검토 데이터를 불러오는 중입니다.</PublishLoadingCard>
                        ) : publishReviewError ? (
                            <PublishErrorCard>{publishReviewError}</PublishErrorCard>
                        ) : activePublishPoi ? (
                            <>
                                <PublishDetailCard>
                                    <PublishDetailHeader>
                                        <div>
                                            <h4>{activePublishPoi.name || '이름 없는 POI'}</h4>
                                            <p>{activePublishPoi.floorName || '-'} · {activePublishPoi.code || '코드 없음'}</p>
                                        </div>
                                        <PublishStatusBadge $status={activePublishPoi.reviewStatus}>
                                            {getPublishPoiStatusLabel(activePublishPoi.reviewStatus)}
                                        </PublishStatusBadge>
                                    </PublishDetailHeader>

                                    <PublishActionRow>
                                        <Button
                                            variant="outlineGray"
                                            size="sm"
                                            onClick={() => onExcludePoi(activePublishPoi.id)}
                                        >
                                            제외 처리
                                        </Button>
                                        <Button
                                            variant="outlineGray"
                                            size="sm"
                                            onClick={() => onClearPoiReview(activePublishPoi.id)}
                                        >
                                            검토 초기화
                                        </Button>
                                        {!publishEntranceReady && (
                                            <Button size="sm" onClick={onMoveToConnectionTab}>
                                                출입구 연결 탭으로
                                            </Button>
                                        )}
                                    </PublishActionRow>

                                    {isFacilityDraftPoi(activePublishPoi) && (
                                        <PublishRequirementNotice $tone="success">
                                            시설성 POI는 기본적으로 외부 매핑 대상에서 제외해 두었습니다. 필요할 때만 아래 추천 또는 수동 검색으로 다시 확정하면 됩니다.
                                        </PublishRequirementNotice>
                                    )}

                                    <PublishDetailGrid>
                                        <PublishDetailLabel>현재 상태</PublishDetailLabel>
                                        <PublishDetailValue>{getPublishPoiStatusLabel(activePublishPoi.reviewStatus)}</PublishDetailValue>
                                        <PublishDetailLabel>매핑 장소</PublishDetailLabel>
                                        <PublishDetailValue>{activePublishPoi.mappedPlace.name || '-'}</PublishDetailValue>
                                        <PublishDetailLabel>매핑 주소</PublishDetailLabel>
                                        <PublishDetailValue>{activePublishPoi.mappedPlace.address || '-'}</PublishDetailValue>
                                        <PublishDetailLabel>저장된 외부 ID</PublishDetailLabel>
                                        <PublishDetailValue>{activePublishPoi.mappedPlace.externalApiId || '-'}</PublishDetailValue>
                                        <PublishDetailLabel>위경도</PublishDetailLabel>
                                        <PublishDetailValue>
                                            {typeof activePublishPoi.mappedPlace.latitude === 'number' &&
                                            Number.isFinite(activePublishPoi.mappedPlace.latitude) &&
                                            typeof activePublishPoi.mappedPlace.longitude === 'number' &&
                                            Number.isFinite(activePublishPoi.mappedPlace.longitude)
                                                ? `${activePublishPoi.mappedPlace.latitude.toFixed(6)}, ${activePublishPoi.mappedPlace.longitude.toFixed(6)}`
                                                : '-'}
                                        </PublishDetailValue>
                                    </PublishDetailGrid>
                                </PublishDetailCard>

                                <PublishDetailCard>
                                    <PublishSectionTitle>
                                        <h3>자동 추천 후보</h3>
                                        <span>이름 + 건물 별칭 기반</span>
                                    </PublishSectionTitle>
                                    <PublishHelpText>
                                        전체 건물명을 그대로 붙이면 검색이 오히려 좁아질 수 있어서, POI 이름 중심 쿼리와 건물명 변형 쿼리를 함께 돌려 후보를 먼저 모았습니다.
                                    </PublishHelpText>
                                    <PublishSearchResults>
                                        {isPublishPoiRecommendLoading ? (
                                            <PublishHelpText>추천 후보를 찾는 중입니다.</PublishHelpText>
                                        ) : publishPoiRecommendations.length > 0 ? (
                                            publishPoiRecommendations.map((place, index) => (
                                                <PublishSearchResultCard key={place.externalApiId || `recommend-${place.name}-${index}`}>
                                                    <PublishSearchResultMeta>
                                                        <strong>{place.name}</strong>
                                                        <span>{place.roadAddress || place.address || '주소 정보 없음'}</span>
                                                        <span>외부 ID: {place.externalApiId || '-'}</span>
                                                        {renderPlaceDistance(place)}
                                                    </PublishSearchResultMeta>
                                                    <PublishActionRow>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => onConfirmPoiMapping(activePublishPoi.id, place)}
                                                            disabled={!place.externalApiId || place.lat == null || place.lng == null}
                                                        >
                                                            추천 후보로 확정
                                                        </Button>
                                                    </PublishActionRow>
                                                </PublishSearchResultCard>
                                            ))
                                        ) : (
                                            <PublishHelpText>추천 후보를 찾지 못했습니다. 아래 수동 검색으로 직접 선택해 주세요.</PublishHelpText>
                                        )}
                                    </PublishSearchResults>
                                </PublishDetailCard>

                                <PublishDetailCard>
                                    <PublishSectionTitle>
                                        <h3>수동 검색 매핑</h3>
                                        <span>카카오 장소 검색</span>
                                    </PublishSectionTitle>
                                    <PublishHelpText>
                                        기본 검색어는 POI 이름 위주로 채워집니다. 건물명을 짧게 바꾸거나 붙여서 다시 검색해도 되고, 검색 결과가 맞지 않으면 이 POI는 제외 처리할 수 있습니다.
                                    </PublishHelpText>
                                    <PublishSearchRow>
                                        <PublishSearchInput
                                            value={publishPoiSearchKeyword}
                                            onChange={(event) => onChangePublishPoiSearchKeyword(event.target.value)}
                                            placeholder="예: 샤넬, 롤렉스 신세계본점"
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault()
                                                    void onSearchPublishPoiCandidates()
                                                }
                                            }}
                                        />
                                        <Button size="sm" onClick={() => void onSearchPublishPoiCandidates()} disabled={isPublishPoiSearchLoading}>
                                            {isPublishPoiSearchLoading ? '검색 중...' : '검색'}
                                        </Button>
                                    </PublishSearchRow>

                                    <PublishSearchResults>
                                        {publishPoiSearchResults.map((place, index) => (
                                            <PublishSearchResultCard key={place.externalApiId || `recommend-${place.name}-${index}`}>
                                                <PublishSearchResultMeta>
                                                    <strong>{place.name}</strong>
                                                    <span>{place.roadAddress || place.address || '주소 정보 없음'}</span>
                                                    <span>외부 ID: {place.externalApiId || '-'}</span>
                                                    {renderPlaceDistance(place)}
                                                </PublishSearchResultMeta>
                                                <PublishActionRow>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => onConfirmPoiMapping(activePublishPoi.id, place)}
                                                        disabled={!place.externalApiId || place.lat == null || place.lng == null}
                                                    >
                                                        이 장소로 확정
                                                    </Button>
                                                </PublishActionRow>
                                            </PublishSearchResultCard>
                                        ))}
                                        {!isPublishPoiSearchLoading && publishPoiSearchResults.length === 0 && (
                                            <PublishHelpText>검색 결과가 아직 없습니다. 위에서 키워드를 검색해 주세요.</PublishHelpText>
                                        )}
                                    </PublishSearchResults>
                                </PublishDetailCard>
                            </>
                        ) : (
                            <PublishHelpText>검토할 draft POI가 없습니다.</PublishHelpText>
                        )}
                    </PublishReviewContent>
                </PublishReviewBody>

                <PublishReviewFooter>
                    <PublishFooterHint>
                        {publishEntranceReady && pendingPublishPoiCount === 0
                            ? '모든 필수 검토가 끝났습니다. 이제 외부 매핑을 저장하고 정식 버전으로 배포할 수 있습니다.'
                            : '미완료 항목이 남아 있으면 최종 배포는 차단됩니다.'}
                    </PublishFooterHint>
                    <PublishActionRow>
                        <Button variant="outlineGray" size="sm" onClick={onClose} disabled={isPublishing || isSavingPublishPoiMappings}>
                            나중에 하기
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => void onConfirmPublish()}
                            disabled={isPublishReviewLoading || isPublishing || isSavingPublishPoiMappings || !publishEntranceReady || pendingPublishPoiCount > 0}
                        >
                            {isPublishing || isSavingPublishPoiMappings ? '배포 중...' : '외부 매핑 저장 후 최종 배포'}
                        </Button>
                    </PublishActionRow>
                </PublishReviewFooter>
            </PublishReviewModalShell>
        </PublishReviewOverlay>
    )
}
