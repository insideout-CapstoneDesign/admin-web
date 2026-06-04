import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import Button from '../../components/Button/Button'
import { getMapEditorFloorApi, getBuildingEntrancesApi, mapBuildingEntranceApi, saveMapEditorFloorDraftApi, getVerticalConnectorsApi, createVerticalConnectorApi, deleteVerticalConnectorApi, mapVerticalConnectorNodeApi, unmapVerticalConnectorNodeApi, publishBuildingDraftApi, getBuildingDraftPoisApi, saveBuildingPoiMappingsApi, searchPlacesApi } from '../../api/buildingApi'
import { getCampusByIdApi } from '../../api/campusApi'
import PublishReviewModal from './components/PublishReviewModal'
import {
    buildPublishPoiRecommendationQueries,
    buildPublishPoiSearchQuery,
    getPoiCategoryLabel,
    getPoiDisplayName,
    getPublishPoiMappedPlace,
    getPublishPoiReviewStatus,
    getPublishPoiStatusLabel,
    getPublishSearchAnchor,
    isFacilityDraftPoi,
    isStrongPublishPoiCandidate,
    normalizePoiCategoryCode,
    POI_CATEGORY_OPTIONS,
    scorePublishPoiCandidate,
} from './utils/publishReview'
import {
    buildPolygonGeometry,
    distanceBetweenPoints,
    geometryToShape,
    getAiTextAnchor,
    getFloorDraftCacheKey,
    getPointPosition,
    getPolygonCenter,
    getPolygonMidpoints,
    getPolygonVertices,
    getSnappedPoint,
    isSimplePolygon,
    translateGeometry,
    updateLineEndpointGeometry,
} from './utils/geometry'

const PageWrapper = styled.div`
    min-height: calc(100vh - 72px);
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    padding: 32px 24px 48px;
`

const Container = styled.div`
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
`

const HeaderCard = styled.div`
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 24px;
    padding: 24px 28px;
    box-shadow: 0 24px 60px -44px rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(8px);
`

const BackButton = styled.button`
    border: none;
    background: none;
    color: var(--gray-600);
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 0;
    margin-bottom: 16px;
`

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    flex-wrap: wrap;
`

const TitleGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;

    h1 {
        margin: 0;
        font-size: 34px;
        line-height: 1.1;
        color: var(--black-900);
    }

    p {
        margin: 0;
        color: var(--gray-600);
        font-size: 14px;
        line-height: 1.6;
        max-width: 820px;
    }
`

const StatusRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`

const FloorSwitcher = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
`

const HeaderUtilityRow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-top: 14px;
    width: 100%;
`

const QuickLayerPanel = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: nowrap;
    padding: 16px 18px;
    border-radius: 20px;
    background: rgba(248, 250, 252, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.18);
    width: 100%;
    overflow-x: auto;
`

const LayerScaleGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    flex: none;
`

const LayerScaleLabel = styled.span`
    font-size: 13px;
    font-weight: 700;
    color: #475569;
`

const LayerToggleGroup = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    margin-left: auto;
    justify-content: flex-end;
    flex: 1 1 auto;
    min-width: max-content;
`

const ScaleButtonGroup = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
`

const ScaleValueButton = styled(Button)`
    width: 120px;
    min-width: 120px;
`

const FloorChip = styled.button`
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.28)' : 'rgba(148, 163, 184, 0.24)')};
    background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.92)')};
    color: ${({ $active }) => ($active ? '#1d4ed8' : '#475569')};
    border-radius: 999px;
    padding: 9px 12px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
`

const StatusBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    border-radius: 999px;
    background: ${({ $tone }) => {
        if ($tone === 'draft') return 'rgba(37, 99, 235, 0.12)'
        if ($tone === 'published') return 'rgba(5, 150, 105, 0.12)'
        if ($tone === 'success') return 'rgba(16, 185, 129, 0.12)'
        return 'rgba(148, 163, 184, 0.12)'
    }};
    color: ${({ $tone }) => {
        if ($tone === 'draft') return '#1d4ed8'
        if ($tone === 'published') return '#047857'
        if ($tone === 'success') return '#047857'
        return '#475569'
    }};
    font-size: 12px;
    font-weight: 700;
`

const Toolbar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`

const ToggleChip = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.26)' : 'rgba(148, 163, 184, 0.24)')};
    background: ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.92)')};
    color: ${({ $active }) => ($active ? '#1d4ed8' : '#475569')};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
`

const CanvasCard = styled.div`
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 28px;
    padding: 14px;
    box-shadow: 0 24px 60px -44px rgba(15, 23, 42, 0.42);
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const WorkspaceLayout = styled.div`
    display: grid;
    grid-template-columns: ${({ $collapsed }) => ($collapsed ? '1fr' : 'minmax(0, 1.85fr) minmax(320px, 420px)')};
    gap: 20px;
    align-items: start;

    @media (max-width: 1180px) {
        grid-template-columns: 1fr;
    }
`

const EditorCard = styled(CanvasCard)`
    position: sticky;
    top: 24px;
    height: calc(min(82vh, 960px) + 28px);
    min-height: calc(680px + 28px);
    overflow: hidden;

    @media (max-width: 1180px) {
        height: auto;
        min-height: 0;
    }
`

const PanelToggleButton = styled.button`
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(255, 255, 255, 0.94);
    color: #334155;
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 14px 24px -20px rgba(15, 23, 42, 0.42);
`

const EditorHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;

    h2 {
        margin: 0;
        font-size: 24px;
        color: var(--black-900);
    }

    p {
        margin: 0;
        color: var(--gray-600);
        font-size: 13px;
        line-height: 1.6;
    }
`

const EditorTabs = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
`

const EditorTabButton = styled.button`
    border: 1px solid ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.28)' : 'rgba(148, 163, 184, 0.22)')};
    background: ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.08)' : '#f8fafc')};
    color: ${({ $active }) => ($active ? '#4338ca' : '#475569')};
    border-radius: 14px;
    padding: 12px 10px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
        font-size: 13px;
        font-weight: 800;
    }

    span {
        font-size: 11px;
        font-weight: 700;
        opacity: 0.82;
    }
`

const EditorBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-right: 2px;
`

const EditorTopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`

const UnsavedBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.12);
    color: #b45309;
    font-size: 11px;
    font-weight: 800;
`

const SectionCard = styled.div`
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: #f8fafc;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`

const SectionTitle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    h3 {
        margin: 0;
        font-size: 15px;
        color: var(--black-900);
    }

    span {
        font-size: 11px;
        font-weight: 700;
        color: var(--gray-500);
    }
`

const SectionTitleActions = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
`

const EntityList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
    min-height: 0;
`

const EntityItem = styled.button`
    width: 100%;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.24)' : 'rgba(148, 163, 184, 0.16)')};
    background: ${({ $active }) => ($active ? 'rgba(79, 70, 229, 0.12)' : 'rgba(255,255,255,0.95)')};
    border-radius: 14px;
    padding: 12px 14px;
    cursor: pointer;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: ${({ $active }) => ($active ? '0 18px 32px -24px rgba(91, 33, 182, 0.55)' : 'none')};
    transform: ${({ $active }) => ($active ? 'translateY(-1px)' : 'none')};
    transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
`

const EntityTitle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    strong {
        font-size: 14px;
        font-weight: 800;
        color: var(--black-900);
    }

    span {
        font-size: 10px;
        font-weight: 800;
        color: #6366f1;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
`

const EntityMeta = styled.div`
    color: var(--gray-600);
    font-size: 12px;
    line-height: 1.5;
`

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(76px, 92px) 1fr;
    gap: 10px 12px;
    align-items: start;
`

const DetailLabel = styled.div`
    color: var(--gray-500);
    font-size: 12px;
    font-weight: 700;
`

const DetailValue = styled.div`
    color: var(--black-900);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
    word-break: break-word;
`

const HelpText = styled.div`
    color: var(--gray-500);
    font-size: 12px;
    line-height: 1.6;
`

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
`

const FieldGroup = styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;

    span {
        font-size: 11px;
        font-weight: 800;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
`

const FieldInput = styled.input`
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(255, 255, 255, 0.96);
    color: #0f172a;
    border-radius: 12px;
    padding: 11px 12px;
    font-size: 14px;
    font-weight: 600;

    &:focus {
        outline: none;
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
    }
`

const SearchInput = styled(FieldInput)`
    font-size: 13px;
`

const CalibrationCard = styled.div`
    margin-top: 12px;
    padding: 12px;
    background: var(--gray-50);
    border-radius: var(--radius-8, 8px);
`

const CalibrationTitle = styled.strong`
    display: block;
    font-size: 13px;
    margin-bottom: 8px;
    color: var(--blue-600);
    text-align: left;
`


const FieldSelect = styled.select`
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(255, 255, 255, 0.96);
    color: #0f172a;
    border-radius: 12px;
    padding: 11px 12px;
    font-size: 14px;
    font-weight: 600;

    &:focus {
        outline: none;
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
    }
`

const FieldHint = styled.div`
    color: #64748b;
    font-size: 11px;
    line-height: 1.5;
`

const ErrorHint = styled(FieldHint)`
    color: var(--red-500);
    margin-top: 4px;
    text-align: left;
`

const LeftHint = styled(FieldHint)`
    margin-top: 6px;
    text-align: left;
`

const InlineFieldRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
`

const MappingGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
`

const MappingRow = styled.div`
    border: 1px solid ${({ $active }) => ($active ? 'rgba(59, 130, 246, 0.32)' : 'rgba(148, 163, 184, 0.18)')};
    background: ${({ $active }) => ($active ? 'rgba(239, 246, 255, 0.92)' : 'rgba(255, 255, 255, 0.96)')};
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: ${({ $active }) => ($active ? '0 18px 32px -24px rgba(37, 99, 235, 0.45)' : 'none')};
`

const MappingRowHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    strong {
        font-size: 14px;
        color: #0f172a;
    }
`

const MappingStatus = styled.span`
    font-size: 11px;
    font-weight: 800;
    color: ${({ $mapped }) => ($mapped ? '#047857' : '#b45309')};
    background: ${({ $mapped }) => ($mapped ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)')};
    border-radius: 999px;
    padding: 6px 8px;
`

const MappingMeta = styled.div`
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
`

const ConnectionOverviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
`

const ConnectionStatCard = styled.div`
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
`

const ConnectionStatValue = styled.strong`
    font-size: 24px;
    line-height: 1;
    color: #0f172a;
`

const ConnectionStatLabel = styled.span`
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
`

const ConnectionEmptyState = styled.div`
    border: 1px dashed rgba(148, 163, 184, 0.28);
    background: rgba(248, 250, 252, 0.72);
    border-radius: 16px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    strong {
        font-size: 14px;
        color: #0f172a;
    }
`

const ConnectionPickBanner = styled.div`
    border: 1px solid rgba(59, 130, 246, 0.22);
    background: linear-gradient(180deg, rgba(239, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
`

const VerticalPickBanner = styled(ConnectionPickBanner)`
    border-left: 4px solid #3b82f6;
    background: #eff6ff;
`

const VerticalFloorRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    background: #f8fafc;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
`

const VerticalFloorName = styled.span`
    font-weight: 700;
    color: #475569;
    min-width: 48px;
`

const VerticalNodeStatus = styled.span`
    margin-left: 12px;
    color: ${({ $mapped }) => ($mapped ? '#0f172a' : '#94a3b8')};
    flex-grow: 1;
    font-weight: ${({ $mapped }) => ($mapped ? '600' : 'normal')};
`

const VerticalFloorRowActions = styled.div`
    display: flex;
    gap: 6px;
`

const DeleteTextButton = styled.button`
    border: none;
    background: none;
    color: #ef4444;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 4px 8px;
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    
    &:hover {
        background: rgba(239, 68, 68, 0.08);
    }
`

const VerticalConnectorList = styled.div`
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const VerticalFloorRowsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
`

const ConnectionPickText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
        font-size: 14px;
        color: #0f172a;
    }
`

const DetailActions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`

const CanvasStage = styled.div`
    position: relative;
    width: 100%;
    height: min(82vh, 960px);
    min-height: 680px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 12px;
    border-radius: 22px;
    background:
        radial-gradient(circle at top left, rgba(59, 130, 246, 0.06), transparent 34%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    overflow: hidden;
`

const MapViewport = styled.div`
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 16px;
    overscroll-behavior: contain;
`

const ZoomCanvasSizer = styled.div`
    position: relative;
    flex: none;
`

const ZoomCanvasInner = styled.div`
    transform-origin: top left;
`

const ZoomToolbar = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    display: inline-flex;
    gap: 8px;
    padding: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.4);
`

const ToolToolbar = styled(ZoomToolbar)`
    left: 12px;
    right: auto;
`

const ZoomButton = styled.button`
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: ${({ $primary }) => ($primary ? 'rgba(59, 130, 246, 0.1)' : '#fff')};
    color: ${({ $primary }) => ($primary ? '#1d4ed8' : '#475569')};
    min-width: 38px;
    height: 38px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
`

const ImageCanvas = styled.div`
    position: relative;
    display: inline-block;
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    line-height: 0;
    box-shadow: 0 32px 80px -56px rgba(15, 23, 42, 0.7);
`

const PreviewImage = styled.img`
    display: block;
    width: auto;
    max-width: min(100%, 1120px);
    height: auto;
    max-height: 74vh;
`

const OverlaySvg = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`

const EmptyState = styled.div`
    min-height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    border: 1px dashed rgba(148, 163, 184, 0.3);
    color: var(--gray-500);
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
`

const ErrorCard = styled.div`
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(239, 68, 68, 0.18);
    border-radius: 24px;
    padding: 20px 24px;
    color: #b91c1c;
    font-size: 14px;
    line-height: 1.6;
`

const LoadingCard = styled(EmptyState)`
    min-height: 320px;
`

const AI_TYPE_META = {
    wall: { label: '벽', color: '#111827', bg: 'rgba(17, 24, 39, 0)' },
    corridor: { label: '통행', color: '#15803d', bg: 'rgba(34, 197, 94, 0.06)' },
    room: { label: '공간', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
    text: { label: '텍스트', color: '#7c3aed', bg: 'rgba(255,255,255,0.96)' },
    poi_candidate: { label: 'POI 후보', color: '#059669', bg: 'rgba(5, 150, 105, 0.16)' },
    node: { label: '노드', color: '#166534', bg: 'rgba(22, 101, 52, 0.16)' },
    node_candidate: { label: '노드 후보', color: '#4d7c0f', bg: 'rgba(77, 124, 15, 0.16)' },
    edge: { label: '엣지', color: '#6d28d9', bg: 'rgba(109, 40, 217, 0.12)' },
    edge_candidate: { label: '엣지 후보', color: '#6d28d9', bg: 'rgba(109, 40, 217, 0.12)' },
    door: { label: '문', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.16)' },
    elevator: { label: '엘리베이터', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.16)' },
    stair: { label: '계단', color: '#65a30d', bg: 'rgba(101, 163, 13, 0.16)' },
    escalator: { label: '에스컬레이터', color: '#b45309', bg: 'rgba(180, 83, 9, 0.16)' },
    entrance: { label: '출입구', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.16)' },
    restroom_sign: { label: '화장실', color: '#db2777', bg: 'rgba(219, 39, 119, 0.16)' },
    unknown: { label: 'AI 결과', color: '#475569', bg: 'rgba(71, 85, 105, 0.12)' },
}

const LAYER_META = {
    floorplan: { label: '도면', color: '#475569', bg: 'rgba(71, 85, 105, 0.12)' },
    rooms: { label: '공간', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.10)' },
    corridors: { label: '통행', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.10)' },
    floorplanObjects: { label: '벽/문', color: '#111827', bg: 'rgba(17, 24, 39, 0.04)' },
    edges: { label: '엣지', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)' },
    nodes: { label: '노드', color: '#0f766e', bg: 'rgba(15, 118, 110, 0.14)' },
    pois: { label: 'POI', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
}

function getAiTypeMeta(type) {
    return AI_TYPE_META[type] || AI_TYPE_META.unknown
}

function normalizeLabelScale(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return 1
    return Math.max(0.8, Math.min(1.8, Number(numeric.toFixed(2))))
}

export default function MapEditorPage() {
    const { buildingId, floorId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editorData, setEditorData] = useState(null)
    const [imageDimensions, setImageDimensions] = useState(null)
    const [zoom, setZoom] = useState(1)
    const [poiLabelScale, setPoiLabelScale] = useState(1.15)
    const [toolMode, setToolMode] = useState('select')
    const [activeEditorTab, setActiveEditorTab] = useState('poi')
    const [originalSelectedEntity, setSelectedEntity] = useState(null)
    const [selectedZoneVertexIndex, setSelectedZoneVertexIndex] = useState(null)
    const [entitySearch, setEntitySearch] = useState('')
    const [zoneKindFilter, setZoneKindFilter] = useState('all')
    const [isEntityListCollapsed, setIsEntityListCollapsed] = useState(false)
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false)
    const [isAddingPoi, setIsAddingPoi] = useState(false)
    const [isAddingZone, setIsAddingZone] = useState(false)
    const [draftZoneVertices, setDraftZoneVertices] = useState([])
    const [zoneDraftError, setZoneDraftError] = useState('')
    const [createdPois, setCreatedPois] = useState([])
    const [createdZones, setCreatedZones] = useState([])
    const [createdNodes, setCreatedNodes] = useState([])
    const [createdEdges, setCreatedEdges] = useState([])
    const [activeDraftCacheKey, setActiveDraftCacheKey] = useState(null)
    const [isAddingNode, setIsAddingNode] = useState(false)
    const [isAddingEdge, setIsAddingEdge] = useState(false)
    const [edgeStartNodeId, setEdgeStartNodeId] = useState(null)
    const [campusGates, setCampusGates] = useState([])
    const [entranceMappings, setEntranceMappings] = useState([])
    const [isMappingLoading, setIsMappingLoading] = useState(false)
    const [verticalConnectors, setVerticalConnectors] = useState([])
    const [isVerticalLoading, setIsVerticalLoading] = useState(false)
    const [activeConnectorForMapping, setActiveConnectorForMapping] = useState(null)
    const [isSavingDraft, setIsSavingDraft] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [isPublishReviewOpen, setIsPublishReviewOpen] = useState(false)
    const [draftPoisForPublish, setDraftPoisForPublish] = useState([])
    const [publishPoiEdits, setPublishPoiEdits] = useState({})
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
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const selectedEntity = isPreviewMode ? null : originalSelectedEntity;
    const [pendingGatePick, setPendingGatePick] = useState(null)
    const [deletedEntityIds, setDeletedEntityIds] = useState({
        node: [],
        edge: [],
        poi: [],
        zone: [],
    })
    const [localEdits, setLocalEdits] = useState({
        node: {},
        edge: {},
        poi: {},
        zone: {},
    })
    const mapViewportRef = useRef(null)
    const imageCanvasRef = useRef(null)
    const selectedListItemRef = useRef(null)
    const dragStateRef = useRef(null)
    const entityDragRef = useRef(null)
    const [visibleLayers, setVisibleLayers] = useState({
        floorplan: false,
        rooms: true,
        corridors: true,
        floorplanObjects: true,
        edges: true,
        nodes: true,
        pois: true,
    })

    const tenantId = location.state?.building?.tenantId || searchParams.get('tenantId')
    const pageTitle = editorData?.buildingName || location.state?.building?.name || '맵 에디터'
    const floorTitle = editorData?.floorName || location.state?.floor?.name || '층'
    const floorOptions = useMemo(() => {
        const floors = location.state?.building?.floors || []

        return [...floors]
            .map((floor) => ({
                id: floor.floorId || floor.id,
                level: floor.level,
                name: floor.name || (floor.level < 0 ? `B${Math.abs(floor.level)}층` : `${floor.level}층`),
            }))
            .filter((floor) => Boolean(floor.id))
            .sort((a, b) => b.level - a.level)
    }, [location.state])

    async function refreshEntranceMappings(options = {}) {
        const { silent = false } = options
        if (!tenantId || !buildingId) {
            setEntranceMappings([])
            return []
        }

        try {
            const mappings = await getBuildingEntrancesApi(tenantId, buildingId)
            setEntranceMappings(mappings || [])
            return mappings || []
        } catch (err) {
            if (!silent) {
                throw err
            }
            console.error('출입구 매핑 정보를 불러오지 못했습니다:', err)
            return []
        }
    }

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
            window.alert('최종 배포 전에는 현재 층 편집 내용을 먼저 임시저장해 주세요.')
            return
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
            window.location.reload()
        } catch (err) {
            window.alert(err.message || '배포 중 오류가 발생했습니다.')
        } finally {
            setIsSavingPublishPoiMappings(false)
            setIsPublishing(false)
        }
    }

    useEffect(() => {
        if (!buildingId || !floorId || !tenantId) {
            setError('맵 에디터를 불러오려면 buildingId, floorId, tenantId가 모두 필요합니다.')
            setActiveDraftCacheKey(null)
            setLoading(false)
            return
        }

        let cancelled = false
        const currentDraftCacheKey = getFloorDraftCacheKey(buildingId, floorId)

        async function loadEditor() {
            setLoading(true)
            setError('')
            setActiveDraftCacheKey(null)

            try {
                const result = await getMapEditorFloorApi(tenantId, buildingId, floorId)
                if (cancelled) return

                let cachedFloorDraft = null
                try {
                    const raw = window.sessionStorage.getItem(currentDraftCacheKey)
                    const parsed = raw ? JSON.parse(raw) : null
                    cachedFloorDraft = parsed?.cacheKey === currentDraftCacheKey ? parsed : null
                } catch {
                    cachedFloorDraft = null
                }

                setEditorData(result)
                setImageDimensions({
                    width: result.floorplanWidthPx || 1600,
                    height: result.floorplanHeightPx || 900,
                })
                setSelectedEntity(cachedFloorDraft?.selectedEntity || null)
                setLocalEdits(cachedFloorDraft?.localEdits || {
                    node: {},
                    edge: {},
                    poi: {},
                    zone: {},
                })
                setDeletedEntityIds(cachedFloorDraft?.deletedEntityIds || {
                    node: [],
                    edge: [],
                    poi: [],
                    zone: [],
                })
                setCreatedPois(cachedFloorDraft?.createdPois || [])
                setCreatedZones(cachedFloorDraft?.createdZones || [])
                setCreatedNodes(cachedFloorDraft?.createdNodes || [])
                setCreatedEdges(cachedFloorDraft?.createdEdges || [])
                setActiveDraftCacheKey(currentDraftCacheKey)
                setIsAddingPoi(false)
                setIsAddingZone(false)
                setIsAddingNode(false)
                setIsAddingEdge(false)
                setEdgeStartNodeId(null)
                setSelectedZoneVertexIndex(null)
                setDraftZoneVertices([])
                setZoneDraftError('')

                // 캠퍼스 게이트 정보 조회
                const campusId = location.state?.building?.campusId || result.campusId
                if (campusId) {
                    try {
                        const campusData = await getCampusByIdApi(tenantId, campusId)
                        if (!cancelled) {
                            setCampusGates(campusData.gates || [])
                        }
                    } catch (err) {
                        console.error('캠퍼스 게이트 목록을 불러오지 못했습니다:', err)
                    }
                }

                // 출입구 매핑 정보 조회
                try {
                    const mappings = await getBuildingEntrancesApi(tenantId, buildingId)
                    if (!cancelled) {
                        setEntranceMappings(mappings || [])
                    }
                } catch (err) {
                    console.error('출입구 매핑 정보를 불러오지 못했습니다:', err)
                }

                // 수직 이동수단 목록 조회
                try {
                    const connectors = await getVerticalConnectorsApi(tenantId, buildingId)
                    if (!cancelled) {
                        setVerticalConnectors(connectors || [])
                    }
                } catch (err) {
                    console.error('수직 이동수단 목록을 불러오지 못했습니다:', err)
                }
            } catch (err) {
                if (cancelled) return
                setError(err.message || '맵 에디터 초기 데이터를 불러오지 못했습니다.')
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadEditor()

        return () => {
            cancelled = true
        }
    }, [buildingId, floorId, tenantId])

    const handleMapCampusGate = async (nodeId, campusGateId) => {
        if (!tenantId || !buildingId) return

        try {
            setIsMappingLoading(true)
            if (!campusGateId || !nodeId) {
                return
            }

            const response = await mapBuildingEntranceApi(tenantId, buildingId, {
                entranceNodeId: nodeId,
                campusGateId: campusGateId
            })

            await refreshEntranceMappings({ silent: true })

            // 매핑 성공 시, 해당 노드의 유형(kind)도 로컬에서 즉시 entrance로 맞춥니다.
            setLocalEdits((current) => ({
                ...current,
                node: {
                    ...current.node,
                    [nodeId]: {
                        ...(current.node?.[nodeId] || {}),
                        kind: 'entrance',
                    },
                },
            }))
            setPendingGatePick((current) => (current?.gateId === campusGateId ? null : current))

            window.alert(`성공적으로 게이트와 매핑(캘리브레이션)되었습니다: ${response.campusGateName}`)
        } catch (err) {
            window.alert(err.message || '매핑 저장 중 오류가 발생했습니다.')
        } finally {
            setIsMappingLoading(false)
        }
    }

    const startGatePick = (gate) => {
        if (!gate?.id) return
        setActiveEditorTab('connection')
        setToolMode('select')
        setPendingGatePick({
            gateId: gate.id,
            gateName: gate.name,
        })
    }

    const handleCreateVerticalConnector = async () => {
        if (!tenantId || !buildingId) return

        const name = window.prompt('수직 이동수단 이름을 입력하세요 (예: 엘리베이터 1호기, 중앙 계단):')
        if (!name) return

        const type = window.prompt('수직 이동수단 종류를 입력하세요 (elevator, stair, escalator, ramp):', 'elevator')
        if (!type) return

        if (!['elevator', 'stair', 'escalator', 'ramp'].includes(type)) {
            window.alert('올바른 종류를 입력하세요: elevator, stair, escalator, ramp 중 하나여야 합니다.')
            return
        }

        try {
            setIsVerticalLoading(true)
            await createVerticalConnectorApi(tenantId, buildingId, { name, kind: type })
            const connectors = await getVerticalConnectorsApi(tenantId, buildingId)
            setVerticalConnectors(connectors || [])
            window.alert('수직 이동수단이 추가되었습니다.')
        } catch (err) {
            window.alert(err.message || '추가 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }

    const handleDeleteVerticalConnector = async (connectorId) => {
        if (!tenantId || !buildingId) return
        if (!window.confirm('정말로 이 수직 이동수단을 삭제하시겠습니까? 연결된 모든 층의 매핑도 함께 삭제됩니다.')) return

        try {
            setIsVerticalLoading(true)
            await deleteVerticalConnectorApi(tenantId, buildingId, connectorId)
            const connectors = await getVerticalConnectorsApi(tenantId, buildingId)
            setVerticalConnectors(connectors || [])
            window.alert('수직 이동수단이 삭제되었습니다.')
        } catch (err) {
            window.alert(err.message || '삭제 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }

    const startVerticalNodePick = (connectorId, connectorName, targetFloorId) => {
        setActiveEditorTab('connection')
        setToolMode('select')

        if (targetFloorId !== floorId) {
            const pendingData = {
                connectorId,
                connectorName,
                floorId: targetFloorId
            }
            try {
                window.sessionStorage.setItem('pending_connector_mapping', JSON.stringify(pendingData))
            } catch (e) {
                console.error(e)
            }
            const targetFloor = floorOptions.find(f => f.id === targetFloorId)
            if (targetFloor) {
                handleFloorChange(targetFloor)
            } else {
                window.alert('해당 층을 찾을 수 없습니다.')
            }
        } else {
            setActiveConnectorForMapping({
                connectorId,
                connectorName,
                floorId: targetFloorId
            })
        }
    }

    const handleMapVerticalNode = async (connectorId, targetFloorId, nodeId) => {
        if (!tenantId || !buildingId) return

        try {
            setIsVerticalLoading(true)
            await mapVerticalConnectorNodeApi(tenantId, buildingId, connectorId, {
                nodeId,
                floorId: targetFloorId
            })

            const connector = verticalConnectors.find(c => c.id === connectorId)
            const connectorType = connector?.kind || 'elevator'

            setLocalEdits((current) => ({
                ...current,
                node: {
                    ...current.node,
                    [nodeId]: {
                        ...(current.node?.[nodeId] || {}),
                        kind: connectorType,
                    },
                },
            }))

            setActiveConnectorForMapping(null)

            const connectors = await getVerticalConnectorsApi(tenantId, buildingId)
            setVerticalConnectors(connectors || [])

            window.alert('성공적으로 노드가 수직 이동수단에 매핑되었습니다.')
        } catch (err) {
            window.alert(err.message || '노드 매핑 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }

    const handleUnmapVerticalNode = async (connectorId, targetFloorId) => {
        if (!tenantId || !buildingId) return
        if (!window.confirm('이 층의 노드 연결을 해제하시겠습니까?')) return

        try {
            setIsVerticalLoading(true)
            await unmapVerticalConnectorNodeApi(tenantId, buildingId, connectorId, targetFloorId)
            const connectors = await getVerticalConnectorsApi(tenantId, buildingId)
            setVerticalConnectors(connectors || [])
            window.alert('노드 연결이 해제되었습니다.')
        } catch (err) {
            window.alert(err.message || '연결 해제 중 오류가 발생했습니다.')
        } finally {
            setIsVerticalLoading(false)
        }
    }

    const handleViewVerticalNode = (targetFloorId, nodeId) => {
        if (targetFloorId !== floorId) {
            const targetFloor = floorOptions.find(f => f.id === targetFloorId)
            if (targetFloor) {
                try {
                    window.sessionStorage.setItem('pending_selected_entity', JSON.stringify({ type: 'node', id: nodeId }))
                } catch (e) {
                    console.error(e)
                }
                handleFloorChange(targetFloor)
            } else {
                window.alert('해당 층을 찾을 수 없습니다.')
            }
        } else {
            setSelectedEntity({ type: 'node', id: nodeId })
        }
    }

    useEffect(() => {
        setSelectedEntity(null)
    }, [activeEditorTab])

    useEffect(() => {
        if (activeEditorTab !== 'connection') {
            setPendingGatePick(null)
        }
    }, [activeEditorTab])

    useEffect(() => {
        setEntitySearch('')
    }, [activeEditorTab])

    useEffect(() => {
        const currentDraftCacheKey = buildingId && floorId
            ? getFloorDraftCacheKey(buildingId, floorId)
            : null

        if (!currentDraftCacheKey || loading || !editorData || activeDraftCacheKey !== currentDraftCacheKey) return

        try {
            window.sessionStorage.setItem(
                currentDraftCacheKey,
                JSON.stringify({
                    cacheKey: currentDraftCacheKey,
                    localEdits,
                    deletedEntityIds,
                    createdPois,
                    createdZones,
                    createdNodes,
                    createdEdges,
                    selectedEntity,
                }),
            )
        } catch {
            // sessionStorage 저장 실패 시에도 에디터 사용은 계속 가능합니다.
        }
    }, [
        buildingId,
        floorId,
        loading,
        editorData,
        activeDraftCacheKey,
        localEdits,
        deletedEntityIds,
        createdPois,
        createdZones,
        createdNodes,
        createdEdges,
        selectedEntity,
    ])

    useEffect(() => {
        setIsAddingPoi(false)
        setIsAddingZone(false)
        setIsAddingNode(false)
        setIsAddingEdge(false)
        setEdgeStartNodeId(null)
        setDraftZoneVertices([])
        setZoneDraftError('')
        setActiveConnectorForMapping(null)
    }, [activeEditorTab])

    useEffect(() => {
        try {
            const raw = window.sessionStorage.getItem('pending_connector_mapping')
            if (raw) {
                const parsed = JSON.parse(raw)
                if (parsed && parsed.floorId === floorId) {
                    setActiveConnectorForMapping(parsed)
                    window.sessionStorage.removeItem('pending_connector_mapping')
                }
            }

            const rawEntity = window.sessionStorage.getItem('pending_selected_entity')
            if (rawEntity) {
                const parsedEntity = JSON.parse(rawEntity)
                if (parsedEntity) {
                    setSelectedEntity(parsedEntity)
                    window.sessionStorage.removeItem('pending_selected_entity')
                }
            }
        } catch (e) {
            console.error(e)
        }
    }, [floorId])

    const editedData = useMemo(() => {
        const applyEntityEdits = (type, items, extraItems = []) =>
            [...(items || []), ...extraItems]
                .filter((item) => !(deletedEntityIds[type] || []).includes(item.id))
                .map((item) => ({
                    ...item,
                    ...(localEdits[type]?.[item.id] || {}),
                }))

        return {
            nodes: applyEntityEdits('node', editorData?.nodes, createdNodes),
            edges: applyEntityEdits('edge', editorData?.edges, createdEdges),
            pois: applyEntityEdits('poi', editorData?.pois, createdPois),
            zones: applyEntityEdits('zone', editorData?.zones, createdZones),
            floorplanObjects: editorData?.floorplanObjects || [],
        }
    }, [createdPois, createdZones, createdNodes, createdEdges, deletedEntityIds, editorData, localEdits])

    const counts = useMemo(() => ({
        zones: editedData.zones.length || 0,
        floorplanObjects: editedData.floorplanObjects.length || 0,
        edges: editedData.edges.length || 0,
        nodes: editedData.nodes.length || 0,
        pois: editedData.pois.length || 0,
    }), [editedData])

    const nodeNameById = useMemo(() => {
        return new Map((editedData.nodes || []).map((node) => [node.id, node.name || node.kind || '노드']))
    }, [editedData])

    const entranceNodes = useMemo(
        () => (editedData.nodes || []).filter((node) => node.kind === 'entrance'),
        [editedData.nodes]
    )

    const buildingEntranceRecords = useMemo(
        () => (entranceMappings || []).filter((record) => record?.nodeId),
        [entranceMappings]
    )

    const floorNameById = useMemo(
        () => new Map((floorOptions || []).map((floor) => [floor.id, floor.name])),
        [floorOptions]
    )

    const entranceMappingByGateId = useMemo(() => {
        return new Map(
            buildingEntranceRecords
                .filter((mapping) => Boolean(mapping.campusGateId))
                .map((mapping) => [mapping.campusGateId, mapping])
        )
    }, [buildingEntranceRecords])

    const entranceMappingByNodeId = useMemo(() => {
        return new Map(buildingEntranceRecords.map((mapping) => [mapping.nodeId, mapping]))
    }, [buildingEntranceRecords])

    const mappedGateCount = useMemo(
        () => (campusGates || []).filter((gate) => entranceMappingByGateId.has(gate.id)).length,
        [campusGates, entranceMappingByGateId]
    )

    const buildingEntranceNodeCount = useMemo(
        () => buildingEntranceRecords.length,
        [buildingEntranceRecords]
    )

    const unmappedEntranceNodeCount = useMemo(
        () => entranceNodes.filter((node) => !entranceMappingByNodeId.has(node.id)).length,
        [entranceNodes, entranceMappingByNodeId]
    )

    const verticalConnectionNodes = useMemo(
        () => (editedData.nodes || []).filter((node) => ['stair', 'elevator', 'escalator'].includes(node.kind)),
        [editedData.nodes]
    )

    const verticalNodeCounts = useMemo(() => ({
        stair: verticalConnectionNodes.filter((node) => node.kind === 'stair').length,
        elevator: verticalConnectionNodes.filter((node) => node.kind === 'elevator').length,
        escalator: verticalConnectionNodes.filter((node) => node.kind === 'escalator').length,
    }), [verticalConnectionNodes])

    const publishEntranceReady = useMemo(
        () => campusGates.length === 0 || mappedGateCount === campusGates.length,
        [campusGates.length, mappedGateCount]
    )

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

    const activePublishPoi = useMemo(
        () => publishPoiRows.find((poi) => poi.id === activePublishPoiId) || publishPoiRows[0] || null,
        [activePublishPoiId, publishPoiRows]
    )

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

    const editorTabMeta = useMemo(() => ([
        { key: 'node', label: 'Node', count: counts.nodes, description: '교차점, 출입구, 수직 연결점' },
        { key: 'edge', label: 'Edge', count: counts.edges, description: '보행 연결선과 방향성' },
        { key: 'poi', label: 'POI', count: counts.pois, description: '시설물과 목적지 이름' },
        { key: 'zone', label: 'Zone', count: counts.zones, description: '공간과 통행 구역' },
        { key: 'connection', label: '연결', count: mappedGateCount, description: '출입구 및 층간 연결 설정' },
    ]), [counts, mappedGateCount])

    const editorItems = useMemo(() => ({
        node: editedData.nodes.map((node) => ({
            id: node.id,
            title: node.name || node.kind || '이름 없는 노드',
            badge: node.kind || 'node',
            subtitle: node.source === 'ai' ? 'AI에서 생성된 노드' : '수정된 draft 노드',
            detailRows: [
                ['유형', node.kind || '-'],
                ['이름', node.name || '-'],
                ['원본', node.source || '-'],
                ['AI 연결', node.aiDetectionId || '-'],
            ],
        })),
        edge: editedData.edges.map((edge) => ({
            id: edge.id,
            title: edge.kind || '연결선',
            badge: edge.isDirected ? 'one-way' : 'two-way',
            subtitle: `${nodeNameById.get(edge.fromNodeId) || edge.fromNodeId} -> ${nodeNameById.get(edge.toNodeId) || edge.toNodeId}`,
            detailRows: [
                ['유형', edge.kind || '-'],
                ['방향', edge.isDirected ? '단방향' : '양방향'],
                ['시작', nodeNameById.get(edge.fromNodeId) || edge.fromNodeId],
                ['도착', nodeNameById.get(edge.toNodeId) || edge.toNodeId],
                ['가중치', edge.baseWeight ?? '-'],
            ],
        })),
        poi: editedData.pois.map((poi) => ({
            id: poi.id,
            title: getPoiDisplayName(poi),
            badge: getPoiCategoryLabel(poi.code || poi.attrs?.label),
            subtitle: poi.source === 'ai' ? 'AI에서 가져온 POI' : '저장된 draft POI',
            detailRows: [
                ['이름', getPoiDisplayName(poi)],
                ['라벨', normalizePoiCategoryCode(poi.attrs?.label) || '-'],
                ['코드', normalizePoiCategoryCode(poi.code || poi.attrs?.label) || '-'],
                ['연결 노드', nodeNameById.get(poi.anchorNodeId) || poi.anchorNodeId || '-'],
                ['외부 ID', poi.externalApiId || '-'],
            ],
        })),
        zone: editedData.zones.map((zone) => ({
            id: zone.id,
            title: zone.name || '이름 없는 공간',
            badge: zone.kind || 'zone',
            subtitle: zone.kind === 'corridor' ? '통행 경로 영역' : zone.kind === 'room' ? '개별 공간 영역' : '제한/기타 영역',
            detailRows: [
                ['이름', zone.name || '-'],
                ['유형', zone.kind || '-'],
                ['속성', zone.properties ? JSON.stringify(zone.properties) : '-'],
            ],
        })),
    }), [editedData, nodeNameById])

    const activeEditorItems = editorItems[activeEditorTab] || []
    const filteredActiveEditorItems = useMemo(() => {
        if (!['poi', 'zone'].includes(activeEditorTab)) {
            return activeEditorItems
        }

        const keyword = entitySearch.trim().toLowerCase()
        const filtered = activeEditorItems.filter((item) => {
            const haystack = `${item.title} ${item.badge} ${item.subtitle}`.toLowerCase()
            const matchesKeyword = !keyword || haystack.includes(keyword)
            const matchesZoneKind = activeEditorTab !== 'zone' || zoneKindFilter === 'all' || item.badge === zoneKindFilter
            return matchesKeyword && matchesZoneKind
        })

        const selectedItem = activeEditorItems.find((item) => item.id === selectedEntity?.id)
        if (activeEditorTab === 'poi' && selectedEntity?.type === 'poi' && selectedItem && !filtered.some((item) => item.id === selectedItem.id)) {
            return [selectedItem, ...filtered]
        }

        return filtered
    }, [activeEditorItems, activeEditorTab, entitySearch, selectedEntity, zoneKindFilter])

    const selectedEditorItem = activeEditorItems.find((item) => item.id === selectedEntity?.id) || activeEditorItems[0] || null

    useEffect(() => {
        if (selectedEntity?.type !== 'zone') {
            setSelectedZoneVertexIndex(null)
        }
    }, [selectedEntity])

    useEffect(() => {
        if (activeEditorTab === 'connection') {
            return
        }

        if (!activeEditorItems.length) {
            setSelectedEntity(null)
            return
        }

        if (!selectedEntity || selectedEntity.type !== activeEditorTab || !activeEditorItems.some((item) => item.id === selectedEntity.id)) {
            setSelectedEntity({ type: activeEditorTab, id: activeEditorItems[0].id })
        }
    }, [activeEditorItems, activeEditorTab, selectedEntity])

    const displayDimensions = useMemo(() => {
        if (!imageDimensions) return null
        const viewportScale = Math.min(1, 1120 / imageDimensions.width)
        return {
            width: imageDimensions.width * viewportScale,
            height: imageDimensions.height * viewportScale,
            viewBoxWidth: imageDimensions.width,
            viewBoxHeight: imageDimensions.height,
        }
    }, [imageDimensions])

    const zoneShapes = useMemo(() => {
        if (!visibleLayers.rooms && !visibleLayers.corridors) return []

        return editedData.zones
            .map((zone) => {
                if (zone.kind === 'corridor' && !visibleLayers.corridors) {
                    return null
                }

                if (zone.kind !== 'corridor' && !visibleLayers.rooms) {
                    return null
                }

                const shape = geometryToShape(zone.geomPx)
                const vertices = getPolygonVertices(zone.geomPx)
                const midpoints = getPolygonMidpoints(vertices)
                return shape ? { ...shape, id: zone.id, zoneKind: zone.kind, vertices, midpoints } : null
            })
            .filter(Boolean)
    }, [editedData.zones, visibleLayers.corridors, visibleLayers.rooms])

    const objectShapes = useMemo(() => {
        if (!visibleLayers.floorplanObjects) return []

        return editedData.floorplanObjects
            .map((object) => {
                const shape = geometryToShape(object.geomPx)
                return shape ? { ...shape, id: object.id, objectKind: object.kind, geometryKind: shape.kind } : null
            })
            .filter(Boolean)
    }, [editedData.floorplanObjects, visibleLayers.floorplanObjects])

    const edgeShapes = useMemo(() => {
        if (!visibleLayers.edges) return []

        return editedData.edges
            .map((edge) => {
                const shape = geometryToShape(edge.geomPx)
                return shape ? { ...shape, id: edge.id, edgeKind: edge.kind, geometryKind: shape.kind } : null
            })
            .filter(Boolean)
    }, [editedData.edges, visibleLayers.edges])

    const nodeShapes = useMemo(() => {
        if (!visibleLayers.nodes) return []

        return editedData.nodes
            .map((node) => {
                const position = getPointPosition(node.geomPx)
                return position ? { id: node.id, name: node.name, kind: node.kind, ...position } : null
            })
            .filter(Boolean)
    }, [editedData.nodes, visibleLayers.nodes])

    const poiShapes = useMemo(() => {
        if (!visibleLayers.pois) return []

        return editedData.pois
            .map((poi) => {
                const footprint = geometryToShape(poi.footprintPx)
                const point = getPointPosition(poi.geomPx)
                const labelPosition = point || getPolygonCenter(poi.footprintPx)
                const categoryCode = normalizePoiCategoryCode(poi.code || poi.attrs?.label)
                const isFacilityCategory = categoryCode.startsWith('facility.')
                const labelScale = normalizeLabelScale(poi.attrs?.labelScale ?? 1)

                return {
                    id: poi.id,
                    name: poi.name,
                    point,
                    footprint,
                    labelPosition,
                    isFacility: isFacilityCategory,
                    label: categoryCode,
                    displayName: getPoiDisplayName(poi),
                    labelScale,
                    anchorNodeId: poi.anchorNodeId,
                    rawGeomPx: poi.geomPx,
                    rawFootprintPx: poi.footprintPx,
                }
            })
            .filter((poi) => poi.point || poi.footprint)
    }, [editedData.pois, visibleLayers.pois])

    const zoneSnapPoints = useMemo(() => (
        editedData.zones.flatMap((zone) =>
            getPolygonVertices(zone.geomPx).map((vertex, index) => ({
                x: vertex.x,
                y: vertex.y,
                zoneId: zone.id,
                vertexIndex: index,
            }))
        )
    ), [editedData.zones])

    const hasPendingEdits = useMemo(() => (
        Object.values(localEdits).some((group) => Object.keys(group).length > 0)
        || createdPois.length > 0
        || createdZones.length > 0
        || createdNodes.length > 0
        || createdEdges.length > 0
        || Object.values(deletedEntityIds).some((ids) => ids.length > 0)
    ), [createdEdges.length, createdNodes.length, createdPois.length, createdZones.length, deletedEntityIds, localEdits])

    const selectedRawEntity = useMemo(() => {
        if (!selectedEntity) return null

        if (selectedEntity.type === 'node') {
            return editedData.nodes.find((item) => item.id === selectedEntity.id) || null
        }

        if (selectedEntity.type === 'edge') {
            return editedData.edges.find((item) => item.id === selectedEntity.id) || null
        }

        if (selectedEntity.type === 'poi') {
            return editedData.pois.find((item) => item.id === selectedEntity.id) || null
        }

        if (selectedEntity.type === 'zone') {
            return editedData.zones.find((item) => item.id === selectedEntity.id) || null
        }

        return null
    }, [editedData, selectedEntity])

    const toggleLayer = (key) => {
        setVisibleLayers((current) => ({
            ...current,
            [key]: !current[key],
        }))
    }

    const updatePoiLabelScale = (delta) => {
        setPoiLabelScale((current) => Math.max(0.5, Math.min(1.5, Number((current + delta).toFixed(2)))))
    }

    const updateSelectedEntityPatch = (type, id, patch) => {
        setLocalEdits((current) => ({
            ...current,
            [type]: {
                ...current[type],
                [id]: {
                    ...(current[type]?.[id] || {}),
                    ...patch,
                },
            },
        }))
    }

    const updateSelectedEntityField = (field, value) => {
        if (!selectedEntity) return

        updateSelectedEntityPatch(selectedEntity.type, selectedEntity.id, {
            [field]: value,
        })
    }

    const updateSelectedPoiCategory = (categoryCode) => {
        if (!selectedEntity || selectedEntity.type !== 'poi') return

        const normalizedCode = normalizePoiCategoryCode(categoryCode)

        updateSelectedEntityPatch('poi', selectedEntity.id, {
            code: normalizedCode || null,
            attrs: {
                ...(selectedRawEntity?.attrs || {}),
                label: normalizedCode || null,
            },
        })
    }

    const updateSelectedPoiAttrsPatch = (attrsPatch) => {
        if (!selectedEntity || selectedEntity.type !== 'poi') return

        updateSelectedEntityPatch('poi', selectedEntity.id, {
            attrs: {
                ...(selectedRawEntity?.attrs || {}),
                ...attrsPatch,
            },
        })
    }

    const updateNodePosition = (nodeId, point, connectedEdges = null, nodeOriginalPosition = null) => {
        updateSelectedEntityPatch('node', nodeId, {
            geomPx: {
                type: 'Point',
                coordinates: [point.x, point.y],
            },
        })

        const edgesToUpdate = connectedEdges
            || editedData.edges.flatMap((edge) => ([
                edge.fromNodeId === nodeId ? { edge, role: 'from' } : null,
                edge.toNodeId === nodeId ? { edge, role: 'to' } : null,
            ].filter(Boolean)))

        edgesToUpdate.forEach(({ edge, role, originalGeomPx }) => {
            const baseGeometry = originalGeomPx || edge.geomPx
            updateSelectedEntityPatch('edge', edge.id, {
                geomPx: updateLineEndpointGeometry(baseGeometry, role, point, nodeOriginalPosition),
            })
        })
    }

    const updateZoneVertices = (zoneId, updater) => {
        const zone = editedData.zones.find((item) => item.id === zoneId)
        if (!zone) return

        const vertices = getPolygonVertices(zone.geomPx)
        const nextVertices = updater(vertices)
        const nextGeometry = buildPolygonGeometry(nextVertices)
        if (!nextGeometry || !isSimplePolygon(nextVertices)) return

        updateSelectedEntityPatch('zone', zoneId, {
            geomPx: nextGeometry,
        })
    }

    const resetSelectedEntityEdits = () => {
        if (!selectedEntity) return

        setLocalEdits((current) => {
            const nextGroup = { ...(current[selectedEntity.type] || {}) }
            delete nextGroup[selectedEntity.id]
            return {
                ...current,
                [selectedEntity.type]: nextGroup,
            }
        })
    }

    const updateZoom = (nextZoom, clientX = null, clientY = null) => {
        const viewport = mapViewportRef.current
        const normalizedNext = Math.min(2.4, Math.max(0.6, Number(nextZoom.toFixed(2))))

        if (!viewport || clientX == null || clientY == null) {
            setZoom(normalizedNext)
            return
        }

        const rect = viewport.getBoundingClientRect()
        const offsetX = clientX - rect.left + viewport.scrollLeft
        const offsetY = clientY - rect.top + viewport.scrollTop
        const scaleRatio = normalizedNext / zoom

        setZoom(normalizedNext)

        requestAnimationFrame(() => {
            viewport.scrollLeft = (offsetX * scaleRatio) - (clientX - rect.left)
            viewport.scrollTop = (offsetY * scaleRatio) - (clientY - rect.top)
        })
    }

    const handleViewportWheel = (event) => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            const delta = event.deltaY > 0 ? -0.12 : 0.12
            updateZoom(zoom + delta, event.clientX, event.clientY)
        }
    }

    const handleViewportPointerDown = (event) => {
        if (toolMode !== 'pan' || event.button !== 0 || !mapViewportRef.current) return

        dragStateRef.current = {
            x: event.clientX,
            y: event.clientY,
            scrollLeft: mapViewportRef.current.scrollLeft,
            scrollTop: mapViewportRef.current.scrollTop,
        }
        mapViewportRef.current.setPointerCapture?.(event.pointerId)
    }

    const handleViewportPointerMove = (event) => {
        if (entityDragRef.current) {
            const nextPoint = toCanvasPoint(event.clientX, event.clientY)
            if (!nextPoint) return

            const dragState = entityDragRef.current
            if (dragState.type === 'zone-vertex') {
                const snappedPoint = getSnappedPoint(
                    nextPoint,
                    zoneSnapPoints.filter((target) => !(target.zoneId === dragState.id && target.vertexIndex === dragState.vertexIndex)),
                )
                updateZoneVertices(dragState.id, (vertices) =>
                    vertices.map((vertex, index) => (
                        index === dragState.vertexIndex
                            ? { x: snappedPoint.x, y: snappedPoint.y }
                            : vertex
                    ))
                )
                return
            }

            if (dragState.type === 'node') {
                const snappedPoint = getSnappedPoint(
                    nextPoint,
                    nodeShapes
                        .filter((node) => node.id !== dragState.id)
                        .map((node) => ({ x: node.x, y: node.y })),
                    12,
                )
                updateNodePosition(dragState.id, snappedPoint, dragState.connectedEdges, dragState.nodeOriginalPosition)
                return
            }

            const dx = nextPoint.x - dragState.startPoint.x
            const dy = nextPoint.y - dragState.startPoint.y

            updateSelectedEntityPatch(dragState.type, dragState.id, {
                geomPx: translateGeometry(dragState.originalGeomPx, dx, dy),
                footprintPx: translateGeometry(dragState.originalFootprintPx, dx, dy),
            })
            return
        }

        if (toolMode !== 'pan' || !mapViewportRef.current || !dragStateRef.current) return

        const dx = event.clientX - dragStateRef.current.x
        const dy = event.clientY - dragStateRef.current.y
        mapViewportRef.current.scrollLeft = dragStateRef.current.scrollLeft - dx
        mapViewportRef.current.scrollTop = dragStateRef.current.scrollTop - dy
    }

    const handleViewportPointerUp = (event) => {
        entityDragRef.current = null
        if (toolMode !== 'pan' || !mapViewportRef.current) return
        dragStateRef.current = null
        mapViewportRef.current.releasePointerCapture?.(event.pointerId)
    }

    const handleEntitySelect = (type, id) => {
        if (toolMode !== 'select') return

        if (pendingGatePick) {
            if (type !== 'node') {
                window.alert(`${pendingGatePick.gateName}에 연결할 노드를 지도에서 클릭해 주세요.`)
                return
            }

            setSelectedEntity({ type: 'node', id })
            void handleMapCampusGate(id, pendingGatePick.gateId)
            return
        }

        if (activeConnectorForMapping) {
            if (type !== 'node') {
                window.alert('수직 이동 노드 매핑 모드입니다. 노드를 클릭해 주세요.')
                return
            }

            void handleMapVerticalNode(activeConnectorForMapping.connectorId, activeConnectorForMapping.floorId, id)
            return
        }

        if (isAddingEdge) {
            if (type === 'node') {
                if (!edgeStartNodeId) {
                    setEdgeStartNodeId(id)
                    window.alert('도착 노드를 클릭하면 엣지가 생성됩니다.')
                } else {
                    if (edgeStartNodeId === id) {
                        window.alert('시작 노드와 도착 노드가 동일할 수 없습니다. 다른 노드를 선택하세요.')
                        return
                    }
                    createEdgeBetweenNodes(edgeStartNodeId, id)
                }
            } else {
                window.alert('엣지 생성 모드입니다. 노드를 클릭해 주세요.')
            }
            return
        }

        setActiveEditorTab(type)
        if (type !== 'zone' || selectedEntity?.id !== id) {
            setSelectedZoneVertexIndex(null)
        }
        setSelectedEntity({ type, id })
    }

    const viewportCursor = toolMode === 'pan'
        ? (dragStateRef.current ? 'grabbing' : 'grab')
        : ((pendingGatePick || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) ? 'crosshair' : 'default')

    function createNodeAtPoint(point) {
        const nextNodeId = globalThis.crypto?.randomUUID?.() || `local-node-${Date.now()}`
        const nextNode = {
            id: nextNodeId,
            name: '',
            kind: 'corridor',
            properties: {},
            geomPx: {
                type: 'Point',
                coordinates: [point.x, point.y]
            },
            source: 'manual',
        }

        setCreatedNodes((current) => [...current, nextNode])
        setActiveEditorTab('node')
        setSelectedEntity({ type: 'node', id: nextNodeId })
        setIsAddingNode(false)
    }

    function createEdgeBetweenNodes(fromId, toId) {
        const fromNode = editedData.nodes.find(n => n.id === fromId)
        const toNode = editedData.nodes.find(n => n.id === toId)
        if (!fromNode || !toNode) {
            window.alert('선택한 노드를 찾을 수 없습니다.')
            resetAddingEdge()
            return
        }

        const nextEdgeId = globalThis.crypto?.randomUUID?.() || `local-edge-${Date.now()}`
        const fromCoords = fromNode.geomPx?.coordinates || [0, 0]
        const toCoords = toNode.geomPx?.coordinates || [0, 0]

        const nextEdge = {
            id: nextEdgeId,
            fromNodeId: fromId,
            toNodeId: toId,
            kind: 'walkway',
            properties: {},
            geomPx: {
                type: 'LineString',
                coordinates: [fromCoords, toCoords]
            },
            source: 'manual',
        }

        setCreatedEdges((current) => [...current, nextEdge])
        setActiveEditorTab('edge')
        setSelectedEntity({ type: 'edge', id: nextEdgeId })
        resetAddingEdge()
        window.alert('성공적으로 엣지가 추가되었습니다.')
    }

    function resetAddingEdge() {
        setIsAddingEdge(false)
        setEdgeStartNodeId(null)
    }

    const poiNodeOptions = useMemo(() => (
        editedData.nodes.map((node) => ({
            id: node.id,
            label: node.name || node.kind || node.id,
        }))
    ), [editedData.nodes])

    function toCanvasPoint(clientX, clientY) {
        const canvas = imageCanvasRef.current
        const dimensions = displayDimensions
        if (!canvas || !dimensions) return null

        const rect = canvas.getBoundingClientRect()
        if (!rect.width || !rect.height) return null

        return {
            x: ((clientX - rect.left) / rect.width) * dimensions.viewBoxWidth,
            y: ((clientY - rect.top) / rect.height) * dimensions.viewBoxHeight,
        }
    }

    function startPoiDrag(event, poi) {
        if (toolMode !== 'select' || event.button !== 0 || !poi.point || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) return

        const startPoint = toCanvasPoint(event.clientX, event.clientY)
        if (!startPoint) return

        event.stopPropagation()
        setActiveEditorTab('poi')
        setSelectedEntity({ type: 'poi', id: poi.id })
        entityDragRef.current = {
            type: 'poi',
            id: poi.id,
            startPoint,
            originalGeomPx: poi.rawGeomPx,
            originalFootprintPx: poi.rawFootprintPx,
        }
    }

    function startNodeDrag(event, node) {
        if (toolMode !== 'select' || event.button !== 0 || pendingGatePick || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) return

        const startPoint = toCanvasPoint(event.clientX, event.clientY)
        if (!startPoint) return

        event.stopPropagation()
        setActiveEditorTab('node')
        setSelectedEntity({ type: 'node', id: node.id })
        entityDragRef.current = {
            type: 'node',
            id: node.id,
            startPoint,
            nodeOriginalPosition: { x: node.x, y: node.y },
            connectedEdges: editedData.edges.flatMap((edge) => ([
                edge.fromNodeId === node.id ? { edge, role: 'from', originalGeomPx: edge.geomPx } : null,
                edge.toNodeId === node.id ? { edge, role: 'to', originalGeomPx: edge.geomPx } : null,
            ].filter(Boolean))),
        }
    }

    function startZoneVertexDrag(event, zoneId, vertexIndex) {
        if (toolMode !== 'select' || event.button !== 0 || isAddingPoi || isAddingZone || isAddingNode || isAddingEdge || activeConnectorForMapping) return

        const startPoint = toCanvasPoint(event.clientX, event.clientY)
        if (!startPoint) return

        event.stopPropagation()
        setActiveEditorTab('zone')
        setSelectedEntity({ type: 'zone', id: zoneId })
        setSelectedZoneVertexIndex(vertexIndex)
        entityDragRef.current = {
            type: 'zone-vertex',
            id: zoneId,
            vertexIndex,
            startPoint,
        }
    }

    function insertZoneVertex(zoneId, insertIndex, point) {
        updateZoneVertices(zoneId, (vertices) => {
            const nextVertices = [...vertices]
            nextVertices.splice(insertIndex, 0, point)
            return nextVertices
        })
        setActiveEditorTab('zone')
        setSelectedEntity({ type: 'zone', id: zoneId })
        setSelectedZoneVertexIndex(insertIndex)
    }

    function createPoiAtPoint(point) {
        const nextPoiId = globalThis.crypto?.randomUUID?.() || `local-poi-${Date.now()}`
        const nextPoi = {
            id: nextPoiId,
            name: '새 POI',
            kind: 'poi',
            code: 'store.unknown',
            source: 'manual',
            externalApiId: null,
            anchorNodeId: null,
            geomPx: {
                type: 'Point',
                coordinates: [point.x, point.y],
            },
            footprintPx: null,
            attrs: {
                label: 'store.unknown',
            },
        }

        setCreatedPois((current) => [...current, nextPoi])
        setActiveEditorTab('poi')
        setSelectedEntity({ type: 'poi', id: nextPoiId })
        setIsAddingPoi(false)
    }

    function createZoneFromVertices(vertices) {
        if (!isSimplePolygon(vertices)) {
            setZoneDraftError('영역 모양이 겹치거나 너무 작아 저장할 수 없습니다.')
            return
        }

        const nextZoneId = globalThis.crypto?.randomUUID?.() || `local-zone-${Date.now()}`
        const nextZone = {
            id: nextZoneId,
            name: '새 공간',
            kind: 'room',
            properties: {},
            geomPx: buildPolygonGeometry(vertices),
            source: 'manual',
        }

        setCreatedZones((current) => [...current, nextZone])
        setActiveEditorTab('zone')
        setSelectedEntity({ type: 'zone', id: nextZoneId })
        setSelectedZoneVertexIndex(null)
        setDraftZoneVertices([])
        setIsAddingZone(false)
        setZoneDraftError('')
    }

    const handleViewportPointerDownCapture = (event) => {
        if (toolMode !== 'select' || event.button !== 0) return

        const point = toCanvasPoint(event.clientX, event.clientY)
        if (!point) return

        if (isAddingNode && activeEditorTab === 'node') {
            event.preventDefault()
            event.stopPropagation()
            createNodeAtPoint(point)
            return
        }

        if (isAddingPoi && activeEditorTab === 'poi') {
            event.preventDefault()
            event.stopPropagation()
            createPoiAtPoint(point)
            return
        }

        if (isAddingZone && activeEditorTab === 'zone') {
            event.preventDefault()
            event.stopPropagation()
            const snappedPoint = getSnappedPoint(point, zoneSnapPoints)
            const shouldCloseDraft = draftZoneVertices.length >= 3 && distanceBetweenPoints(snappedPoint, draftZoneVertices[0]) <= 16

            if (shouldCloseDraft) {
                createZoneFromVertices(draftZoneVertices)
                return
            }

            setZoneDraftError('')
            setDraftZoneVertices((current) => [...current, snappedPoint])
        }
    }

    function deleteSelectedEntity() {
        if (!selectedEntity) return

        const targetId = selectedEntity.id
        const type = selectedEntity.type

        if (type === 'poi') {
            const isCreatedPoi = createdPois.some((poi) => poi.id === targetId)
            setCreatedPois((current) => current.filter((poi) => poi.id !== targetId))
            if (!isCreatedPoi) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    poi: current.poi.includes(targetId) ? current.poi : [...current.poi, targetId],
                }))
            }
        } else if (type === 'zone') {
            const isCreatedZone = createdZones.some((zone) => zone.id === targetId)
            setCreatedZones((current) => current.filter((zone) => zone.id !== targetId))
            if (!isCreatedZone) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    zone: current.zone.includes(targetId) ? current.zone : [...current.zone, targetId],
                }))
            }
        } else if (type === 'node') {
            const isCreatedNode = createdNodes.some((node) => node.id === targetId)
            setCreatedNodes((current) => current.filter((node) => node.id !== targetId))
            if (!isCreatedNode) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    node: current.node.includes(targetId) ? current.node : [...current.node, targetId],
                }))
            }

            // 노드가 삭제되면 연결된 엣지들도 함께 삭제
            const connectedEdges = editedData.edges.filter(
                (edge) => edge.fromNodeId === targetId || edge.toNodeId === targetId
            )
            connectedEdges.forEach((edge) => {
                const isCreatedEdge = createdEdges.some((ce) => ce.id === edge.id)
                setCreatedEdges((current) => current.filter((ce) => ce.id !== edge.id))
                if (!isCreatedEdge) {
                    setDeletedEntityIds((current) => ({
                        ...current,
                        edge: current.edge.includes(edge.id) ? current.edge : [...current.edge, edge.id],
                    }))
                }
            })
        } else if (type === 'edge') {
            const isCreatedEdge = createdEdges.some((edge) => edge.id === targetId)
            setCreatedEdges((current) => current.filter((edge) => edge.id !== targetId))
            if (!isCreatedEdge) {
                setDeletedEntityIds((current) => ({
                    ...current,
                    edge: current.edge.includes(targetId) ? current.edge : [...current.edge, targetId],
                }))
            }
        }

        setLocalEdits((current) => {
            const nextGroup = { ...(current[type] || {}) }
            delete nextGroup[targetId]

            return {
                ...current,
                [type]: nextGroup,
            }
        })
        setSelectedEntity(null)
        setSelectedZoneVertexIndex(null)
    }

    function deleteSelectedZoneVertex() {
        if (!selectedEntity || selectedEntity.type !== 'zone' || selectedZoneVertexIndex == null) return

        updateZoneVertices(selectedEntity.id, (vertices) => {
            if (vertices.length <= 3) return vertices
            return vertices.filter((_, index) => index !== selectedZoneVertexIndex)
        })
        setSelectedZoneVertexIndex(null)
    }

    function buildDraftSavePayload() {
        return {
            nodes: editedData.nodes.map((node) => ({
                id: node.id,
                kind: node.kind || 'corridor',
                name: node.name || '',
                geomPx: node.geomPx,
                properties: node.properties || {},
            })),
            edges: editedData.edges.map((edge) => ({
                id: edge.id,
                fromNodeId: edge.fromNodeId,
                toNodeId: edge.toNodeId,
                kind: edge.kind || 'walkway',
                geomPx: edge.geomPx,
                isDirected: Boolean(edge.isDirected),
                baseWeight: edge.baseWeight == null || edge.baseWeight === '' ? 1 : Number(edge.baseWeight),
                properties: edge.properties || {},
            })),
            pois: editedData.pois.map((poi) => ({
                id: poi.id,
                name: poi.name || '',
                code: poi.code || poi.attrs?.label || null,
                geomPx: poi.geomPx,
                footprintPx: poi.footprintPx || null,
                anchorNodeId: poi.anchorNodeId || null,
                attrs: poi.attrs || {},
                externalApiId: poi.externalApiId || null,
            })),
            zones: editedData.zones.map((zone) => ({
                id: zone.id,
                kind: zone.kind || 'room',
                name: zone.name || '',
                geomPx: zone.geomPx,
                properties: zone.properties || {},
            })),
        }
    }

    async function handleSaveDraft() {
        if (!tenantId || !buildingId || !floorId || isSavingDraft) return

        try {
            setIsSavingDraft(true)
            const result = await saveMapEditorFloorDraftApi(tenantId, buildingId, floorId, buildDraftSavePayload())

            setEditorData(result)
            setImageDimensions({
                width: result.floorplanWidthPx || 1600,
                height: result.floorplanHeightPx || 900,
            })
            setSelectedEntity(null)
            setSelectedZoneVertexIndex(null)
            setLocalEdits({
                node: {},
                edge: {},
                poi: {},
                zone: {},
            })
            setDeletedEntityIds({
                node: [],
                edge: [],
                poi: [],
                zone: [],
            })
            setCreatedPois([])
            setCreatedZones([])
            setCreatedNodes([])
            setCreatedEdges([])
            setIsAddingPoi(false)
            setIsAddingZone(false)
            setIsAddingNode(false)
            setIsAddingEdge(false)
            setEdgeStartNodeId(null)
            setDraftZoneVertices([])
            setZoneDraftError('')
            try {
                window.sessionStorage.removeItem(getFloorDraftCacheKey(buildingId, floorId))
            } catch {
                // 저장 후 캐시 삭제 실패는 무시합니다.
            }
            await refreshEntranceMappings({ silent: true })
            window.alert('임시저장이 완료되었습니다.')
        } catch (err) {
            window.alert(err.message || '임시저장 중 오류가 발생했습니다.')
        } finally {
            setIsSavingDraft(false)
        }
    }

    function handleFloorChange(targetFloor) {
        if (!targetFloor?.id) return
        if (targetFloor.id === floorId) return

        if (hasPendingEdits) {
            const shouldMove = window.confirm('저장되지 않은 수정사항이 있습니다. 이 상태로 층을 이동할까요? 현재 브라우저에서는 임시로 유지되지만 서버에는 저장되지 않습니다.')
            if (!shouldMove) {
                return
            }
        }

        navigate(`/building/${buildingId}/floors/${targetFloor.id}/editor?tenantId=${tenantId}`, {
            state: {
                building: location.state?.building || null,
                floor: targetFloor,
            },
        })
    }

    const handlePublish = async () => {
        await openPublishReview()
    }

    return (
        <PageWrapper>
            <Container>
                <HeaderCard>
                    <BackButton onClick={() => navigate(-1)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        도면 관리로 돌아가기
                    </BackButton>
                    <TitleRow>
                        <TitleGroup>
                            <h1>{pageTitle} 맵 에디터</h1>
                            <p>{floorTitle} 기준 draft 맵 데이터를 불러왔습니다. 기본적으로는 저장된 정식 레이어만 표시하며, 필요할 때만 도면 배경을 켜서 비교할 수 있습니다.</p>
                            <HeaderUtilityRow>
                                {floorOptions.length > 1 && (
                                    <FloorSwitcher>
                                        {floorOptions.map((floor) => (
                                            <FloorChip
                                                key={floor.id}
                                                type="button"
                                                $active={floor.id === floorId}
                                                onClick={() => handleFloorChange(floor)}
                                            >
                                                {floor.name}
                                            </FloorChip>
                                        ))}
                                    </FloorSwitcher>
                                )}
                                <QuickLayerPanel>
                                    <LayerScaleGroup>
                                        <LayerScaleLabel>글씨 크기</LayerScaleLabel>
                                        <ScaleButtonGroup>
                                            <Button
                                                variant="outlineGray"
                                                size="sm"
                                                onClick={() => updatePoiLabelScale(-0.05)}
                                                disabled={poiLabelScale <= 0.5}
                                            >
                                                -
                                            </Button>
                                            <ScaleValueButton variant="ghost" size="sm" onClick={() => setPoiLabelScale(1.15)}>
                                                {Math.round(poiLabelScale * 100)}%
                                            </ScaleValueButton>
                                            <Button
                                                variant="outlineGray"
                                                size="sm"
                                                onClick={() => updatePoiLabelScale(0.05)}
                                                disabled={poiLabelScale >= 1.5}
                                            >
                                                +
                                            </Button>
                                        </ScaleButtonGroup>
                                    </LayerScaleGroup>
                                    <LayerToggleGroup>
                                        {Object.entries(LAYER_META).map(([key, meta]) => (
                                            <ToggleChip key={key} type="button" $active={visibleLayers[key]} onClick={() => toggleLayer(key)}>
                                                {meta.label}
                                            </ToggleChip>
                                        ))}
                                        <Button variant="outlineGray" size="sm" onClick={() => window.location.reload()}>
                                            새로고침
                                        </Button>
                                    </LayerToggleGroup>
                                </QuickLayerPanel>
                            </HeaderUtilityRow>
                        </TitleGroup>
                        <StatusRow>
                            <StatusBadge $tone={editorData?.mapVersionStatus === 'published' ? 'published' : 'draft'}>
                                {editorData?.mapVersionStatus === 'published' ? 'published 버전' : 'draft 버전'}
                            </StatusBadge>
                            {editorData?.draftCreated && <StatusBadge $tone="draft">새 draft 생성</StatusBadge>}
                            {editorData?.initializedFromAi && <StatusBadge $tone="success">AI 결과로 초기화</StatusBadge>}
                        </StatusRow>
                    </TitleRow>
                </HeaderCard>

                {loading ? (
                    <LoadingCard>맵 에디터 초기 데이터를 불러오는 중입니다.</LoadingCard>
                ) : error ? (
                    <ErrorCard>{error}</ErrorCard>
                ) : (
                    <WorkspaceLayout $collapsed={isEditorCollapsed}>
                        <CanvasCard>
                            <CanvasStage>
                                {activeConnectorForMapping && (
                                    <VerticalPickBanner>
                                        <ConnectionPickText>
                                            <strong>[{activeConnectorForMapping.connectorName}] {floorNameById.get(activeConnectorForMapping.floorId)} 노드를 지도에서 클릭하세요.</strong>
                                            <HelpText>클릭한 node가 해당 층의 수직 연결 node로 매핑됩니다.</HelpText>
                                        </ConnectionPickText>
                                        <Button variant="outlineGray" size="sm" onClick={() => setActiveConnectorForMapping(null)}>
                                            선택 취소
                                        </Button>
                                    </VerticalPickBanner>
                                )}
                                <ToolToolbar>
                                    <ZoomButton
                                        type="button"
                                        $primary={toolMode === 'select'}
                                        onClick={() => setToolMode('select')}
                                        title="선택 모드"
                                    >
                                        ↖
                                    </ZoomButton>
                                    <ZoomButton
                                        type="button"
                                        $primary={toolMode === 'pan'}
                                        onClick={() => setToolMode('pan')}
                                        title="이동 모드"
                                    >
                                        ✋
                                    </ZoomButton>
                                    <ZoomButton
                                        type="button"
                                        $primary={isPreviewMode}
                                        onClick={() => setIsPreviewMode((prev) => !prev)}
                                        title="앱 미리보기 모드 토글"
                                    >
                                        👁️ {isPreviewMode ? '편집 보기' : '앱 미리보기'}
                                    </ZoomButton>
                                    <PanelToggleButton
                                        type="button"
                                        onClick={() => setIsEditorCollapsed((current) => !current)}
                                    >
                                        {isEditorCollapsed ? '편집기 열기' : '편집기 접기'}
                                    </PanelToggleButton>
                                </ToolToolbar>

                                <ZoomToolbar>
                                    <ZoomButton type="button" onClick={() => setZoom((current) => Math.max(0.6, Number((current - 0.2).toFixed(1))))}>-</ZoomButton>
                                    <ZoomButton type="button" $primary onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</ZoomButton>
                                    <ZoomButton type="button" onClick={() => setZoom((current) => Math.min(2.4, Number((current + 0.2).toFixed(1))))}>+</ZoomButton>
                                </ZoomToolbar>

                                {editorData?.floorplanImageUrl && displayDimensions ? (
                                    <MapViewport
                                        ref={mapViewportRef}
                                        onPointerDownCapture={handleViewportPointerDownCapture}
                                        onWheel={handleViewportWheel}
                                        onPointerDown={handleViewportPointerDown}
                                        onPointerMove={handleViewportPointerMove}
                                        onPointerUp={handleViewportPointerUp}
                                        onPointerLeave={handleViewportPointerUp}
                                        style={{ cursor: viewportCursor }}
                                    >
                                        <ZoomCanvasSizer
                                            style={{
                                                width: `${displayDimensions.width * zoom}px`,
                                                height: `${displayDimensions.height * zoom}px`,
                                                margin: '0 auto',
                                            }}
                                        >
                                            <ZoomCanvasInner
                                                style={{
                                                    width: `${displayDimensions.width}px`,
                                                    height: `${displayDimensions.height}px`,
                                                    transform: `scale(${zoom})`,
                                                }}
                                            >
                                                <ImageCanvas ref={imageCanvasRef} style={{ width: `${displayDimensions.width}px`, height: `${displayDimensions.height}px` }}>
                                                    {!isPreviewMode && visibleLayers.floorplan && (
                                                        <PreviewImage
                                                            src={editorData.floorplanImageUrl}
                                                            alt={`${floorTitle} 도면`}
                                                            style={{ width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', objectFit: 'contain' }}
                                                            onLoad={(event) => {
                                                                const width = event.currentTarget.naturalWidth
                                                                const height = event.currentTarget.naturalHeight
                                                                if (width && height) {
                                                                    setImageDimensions({ width, height })
                                                                }
                                                            }}
                                                        />
                                                    )}

                                                    <OverlaySvg
                                                        viewBox={`0 0 ${displayDimensions.viewBoxWidth} ${displayDimensions.viewBoxHeight}`}
                                                        preserveAspectRatio="xMidYMid meet"
                                                    >
                                            {zoneShapes.map((shape) => (
                                                (() => {
                                                    const zoneMeta = shape.zoneKind === 'corridor'
                                                        ? LAYER_META.corridors
                                                        : LAYER_META.rooms

                                                    return (
                                                <path
                                                    key={`zone-${shape.id}`}
                                                    d={shape.path}
                                                    fill={selectedEntity?.type === 'zone' && selectedEntity.id === shape.id ? 'rgba(220, 38, 38, 0.12)' : zoneMeta.bg}
                                                    stroke={selectedEntity?.type === 'zone' && selectedEntity.id === shape.id ? '#dc2626' : zoneMeta.color}
                                                    strokeWidth={selectedEntity?.type === 'zone' && selectedEntity.id === shape.id ? '3.5' : '2'}
                                                    strokeLinejoin="round"
                                                    style={{ pointerEvents: 'auto', cursor: toolMode === 'select' ? 'pointer' : 'default' }}
                                                    onClick={() => handleEntitySelect('zone', shape.id)}
                                                />
                                                    )
                                                })()
                                            ))}

                                            {zoneShapes.map((shape) => {
                                                const isSelectedZone = !isPreviewMode && selectedEntity?.type === 'zone' && selectedEntity.id === shape.id
                                                if (!isSelectedZone || !Array.isArray(shape.vertices) || shape.vertices.length < 3) {
                                                    return null
                                                }

                                                return (
                                                    <g key={`zone-edit-${shape.id}`}>
                                                        {shape.midpoints?.map((midpoint) => (
                                                            <circle
                                                                key={`zone-mid-${shape.id}-${midpoint.insertIndex}`}
                                                                cx={midpoint.x}
                                                                cy={midpoint.y}
                                                                r="5.5"
                                                                fill="#ffffff"
                                                                stroke="#f97316"
                                                                strokeWidth="2"
                                                                style={{ pointerEvents: 'auto', cursor: toolMode === 'select' ? 'copy' : 'default' }}
                                                                onClick={(event) => {
                                                                    if (toolMode !== 'select') return
                                                                    event.stopPropagation()
                                                                    insertZoneVertex(shape.id, midpoint.insertIndex, { x: midpoint.x, y: midpoint.y })
                                                                }}
                                                            />
                                                        ))}
                                                        {shape.vertices.map((vertex, index) => {
                                                            const isActiveVertex = selectedZoneVertexIndex === index
                                                            return (
                                                                <circle
                                                                    key={`zone-vertex-${shape.id}-${index}`}
                                                                    cx={vertex.x}
                                                                    cy={vertex.y}
                                                                    r={isActiveVertex ? '8' : '6.5'}
                                                                    fill={isActiveVertex ? '#dc2626' : '#ffffff'}
                                                                    stroke="#dc2626"
                                                                    strokeWidth="2.5"
                                                                    style={{ pointerEvents: 'auto', cursor: toolMode === 'select' ? 'grab' : 'default' }}
                                                                    onClick={(event) => {
                                                                        if (toolMode !== 'select') return
                                                                        event.stopPropagation()
                                                                        setActiveEditorTab('zone')
                                                                        setSelectedEntity({ type: 'zone', id: shape.id })
                                                                        setSelectedZoneVertexIndex(index)
                                                                    }}
                                                                    onPointerDown={(event) => startZoneVertexDrag(event, shape.id, index)}
                                                                />
                                                            )
                                                        })}
                                                    </g>
                                                )
                                            })}

                                            {isAddingZone && draftZoneVertices.length > 0 && (
                                                <g>
                                                    {draftZoneVertices.length >= 3 && (
                                                        <path
                                                            d={`M ${draftZoneVertices[0].x} ${draftZoneVertices[0].y} ${draftZoneVertices.slice(1).map((vertex) => `L ${vertex.x} ${vertex.y}`).join(' ')} Z`}
                                                            fill="rgba(249, 115, 22, 0.10)"
                                                            stroke="none"
                                                        />
                                                    )}
                                                    {draftZoneVertices.length >= 2 && (
                                                        <path
                                                            d={`M ${draftZoneVertices[0].x} ${draftZoneVertices[0].y} ${draftZoneVertices.slice(1).map((vertex) => `L ${vertex.x} ${vertex.y}`).join(' ')}`}
                                                            fill="none"
                                                            stroke="#f97316"
                                                            strokeWidth="2.5"
                                                            strokeDasharray="8 6"
                                                        />
                                                    )}
                                                    {draftZoneVertices.map((vertex, index) => (
                                                        <circle
                                                            key={`draft-zone-${index}`}
                                                            cx={vertex.x}
                                                            cy={vertex.y}
                                                            r={index === 0 ? '7' : '6'}
                                                            fill="#ffffff"
                                                            stroke="#f97316"
                                                            strokeWidth="2.5"
                                                        />
                                                    ))}
                                                </g>
                                            )}

                                            {objectShapes.map((shape) => {
                                                if (shape.geometryKind === 'polygon') {
                                                    return (
                                                        <path
                                                            key={`object-${shape.id}`}
                                                            d={shape.path}
                                                            fill="rgba(17, 24, 39, 0.02)"
                                                            stroke="#111827"
                                                            strokeWidth={shape.objectKind === 'door' ? 2.5 : 2}
                                                        />
                                                    )
                                                }

                                                if (shape.geometryKind === 'line') {
                                                    return (
                                                        <polyline
                                                            key={`object-${shape.id}`}
                                                            points={shape.points}
                                                            fill="none"
                                                            stroke={shape.objectKind === 'door' ? '#ea580c' : '#111827'}
                                                            strokeWidth={shape.objectKind === 'door' ? 3 : 2.5}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    )
                                                }

                                                if (shape.geometryKind === 'bbox') {
                                                    return (
                                                        <rect
                                                            key={`object-${shape.id}`}
                                                            x={shape.x}
                                                            y={shape.y}
                                                            width={shape.width}
                                                            height={shape.height}
                                                            fill="rgba(17, 24, 39, 0.02)"
                                                            stroke="#111827"
                                                            strokeWidth="2"
                                                        />
                                                    )
                                                }

                                                return null
                                            })}

                                            {!isPreviewMode && edgeShapes.map((shape) => (
                                                shape.geometryKind === 'line' ? (
                                                    (() => {
                                                        const linkedEdge = editedData.edges.find((edge) => edge.id === shape.id)
                                                        const isLinkedToSelectedNode = selectedEntity?.type === 'node'
                                                            && linkedEdge
                                                            && (linkedEdge.fromNodeId === selectedEntity.id || linkedEdge.toNodeId === selectedEntity.id)

                                                        return (
                                                        <polyline
                                                            key={`edge-${shape.id}`}
                                                            points={shape.points}
                                                            fill="none"
                                                            stroke={selectedEntity?.type === 'edge' && selectedEntity.id === shape.id ? '#7c3aed' : isLinkedToSelectedNode ? '#2563eb' : LAYER_META.edges.color}
                                                            strokeWidth={selectedEntity?.type === 'edge' && selectedEntity.id === shape.id ? '6' : isLinkedToSelectedNode ? '5' : '4'}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            style={{ pointerEvents: 'auto', cursor: toolMode === 'select' ? 'pointer' : 'default' }}
                                                            onClick={() => handleEntitySelect('edge', shape.id)}
                                                        />
                                                        )
                                                    })()
                                                ) : null
                                            ))}

                                            {poiShapes.map((poi) => (
                                                poi.footprint?.kind === 'polygon' ? (
                                                    <path
                                                        key={`poi-footprint-${poi.id}`}
                                                        d={poi.footprint.path}
                                                        fill={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? 'rgba(124, 58, 237, 0.14)' : 'rgba(124, 58, 237, 0.06)'}
                                                        stroke={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '#5b21b6' : LAYER_META.pois.color}
                                                        strokeWidth={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '4' : '2'}
                                                        style={{ pointerEvents: 'auto', cursor: toolMode === 'select' ? 'pointer' : 'default' }}
                                                        onClick={() => handleEntitySelect('poi', poi.id)}
                                                    />
                                                ) : null
                                            ))}

                                            {poiShapes.map((poi) => (
                                                poi.point ? (
                                                    <g key={`poi-point-${poi.id}`}>
                                                        {!isPreviewMode && selectedEntity?.type === 'poi' && selectedEntity.id === poi.id && (
                                                            <circle
                                                                cx={poi.point.x}
                                                                cy={poi.point.y}
                                                                r="18"
                                                                fill="rgba(124, 58, 237, 0.12)"
                                                                stroke="#5b21b6"
                                                                strokeWidth="2"
                                                            />
                                                        )}
                                                        <circle
                                                            cx={poi.point.x}
                                                            cy={poi.point.y}
                                                            r={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '12' : '10'}
                                                            fill="rgba(124, 58, 237, 0.14)"
                                                            stroke={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '#5b21b6' : LAYER_META.pois.color}
                                                            strokeWidth="2.5"
                                                            style={{ pointerEvents: 'auto', cursor: toolMode === 'select' ? 'grab' : 'default' }}
                                                            onClick={() => handleEntitySelect('poi', poi.id)}
                                                            onPointerDown={(event) => startPoiDrag(event, poi)}
                                                        />
                                                        <circle cx={poi.point.x} cy={poi.point.y} r="3.5" fill={selectedEntity?.type === 'poi' && selectedEntity.id === poi.id ? '#5b21b6' : LAYER_META.pois.color} />
                                                    </g>
                                                ) : null
                                            ))}

                                            {!isPreviewMode && nodeShapes.map((node) => {
                                                const isSelectedNode = selectedEntity?.type === 'node' && selectedEntity.id === node.id
                                                const isAnchoredFromPoi = selectedEntity?.type === 'poi' && selectedRawEntity?.anchorNodeId === node.id
                                                const mappedGate = entranceMappingByNodeId.get(node.id)
                                                const isPendingGateNode = pendingGatePick && mappedGate?.campusGateId === pendingGatePick.gateId
                                                const isHighlighted = isSelectedNode || isAnchoredFromPoi || Boolean(mappedGate)
                                                const strokeColor = isPendingGateNode
                                                    ? '#2563eb'
                                                    : isHighlighted
                                                        ? '#5b21b6'
                                                        : LAYER_META.nodes.color

                                                return (
                                                    <g key={`node-${node.id}`}>
                                                        <circle
                                                            cx={node.x}
                                                            cy={node.y}
                                                            r={isPendingGateNode ? '11' : isHighlighted ? '10' : '7.5'}
                                                            fill={isPendingGateNode ? 'rgba(37, 99, 235, 0.16)' : isHighlighted ? 'rgba(91, 33, 182, 0.14)' : LAYER_META.nodes.bg}
                                                            stroke={strokeColor}
                                                            strokeWidth="3"
                                                            style={{ pointerEvents: 'auto', cursor: toolMode === 'select' ? (pendingGatePick ? 'crosshair' : 'grab') : 'default' }}
                                                            onClick={() => handleEntitySelect('node', node.id)}
                                                            onPointerDown={(event) => startNodeDrag(event, node)}
                                                        />
                                                        <circle cx={node.x} cy={node.y} r="3" fill={strokeColor} />
                                                    </g>
                                                )
                                            })}

                                                    </OverlaySvg>

                                                    <OverlaySvg
                                                        viewBox={`0 0 ${displayDimensions.viewBoxWidth} ${displayDimensions.viewBoxHeight}`}
                                                        preserveAspectRatio="xMidYMid meet"
                                                    >
                                                        {visibleLayers.pois && poiShapes.map((poi) => {
                                                            if (!poi.displayName || !poi.labelPosition) return null

                                                            const isSelected = selectedEntity?.type === 'poi' && selectedEntity.id === poi.id
                                                            const fontSize = Math.round((poi.isFacility ? 14 : 20) * poiLabelScale * poi.labelScale)
                                                            const y = poi.labelPosition.y + (poi.isFacility ? -18 : 2)

                                                            return (
                                                                <g key={`poi-label-${poi.id}`}>
                                                                    <text
                                                                        x={poi.labelPosition.x}
                                                                        y={y}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        fill={isSelected ? '#5b21b6' : '#111827'}
                                                                        stroke="rgba(255,255,255,0.96)"
                                                                        strokeWidth="3.2"
                                                                        paintOrder="stroke"
                                                                        style={{ fontSize: `${fontSize}px`, fontWeight: 700, letterSpacing: '-0.02em', pointerEvents: 'auto', cursor: toolMode === 'select' ? 'grab' : 'default' }}
                                                                        onClick={() => handleEntitySelect('poi', poi.id)}
                                                                        onPointerDown={(event) => startPoiDrag(event, poi)}
                                                                    >
                                                                        {poi.displayName}
                                                                    </text>
                                                                </g>
                                                            )
                                                        })}
                                                    </OverlaySvg>
                                                </ImageCanvas>
                                            </ZoomCanvasInner>
                                        </ZoomCanvasSizer>
                                    </MapViewport>
                                ) : (
                                    <EmptyState>이 층에는 아직 도면 이미지가 없어 맵 에디터 캔버스를 그릴 수 없습니다.</EmptyState>
                                )}
                            </CanvasStage>
                        </CanvasCard>

                        {!isEditorCollapsed && (
                            <EditorCard>
                                <EditorHeader>
                                    <EditorTopBar>
                                        <h2>편집 패널</h2>
                                        <DetailActions>
                                            {hasPendingEdits && <UnsavedBadge>로컬 편집 중</UnsavedBadge>}
                                            <Button
                                                size="sm"
                                                onClick={handleSaveDraft}
                                                disabled={isSavingDraft || !hasPendingEdits}
                                            >
                                                {isSavingDraft ? '임시저장 중...' : '임시저장'}
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={handlePublish}
                                                disabled={isPublishing}
                                            >
                                                {isPublishing ? '배포 중...' : '최종 배포'}
                                            </Button>
                                        </DetailActions>
                                    </EditorTopBar>
                                    <p>지도를 왼쪽에서 확인하고, 오른쪽 패널에서 `node`, `edge`, `poi`, `zone` 목록과 기본 속성을 다듬습니다. 임시저장을 누르면 현재 층 draft가 서버에 반영됩니다.</p>
                                </EditorHeader>

                                <EditorTabs>
                                    {editorTabMeta.map((tab) => (
                                        <EditorTabButton
                                            key={tab.key}
                                            type="button"
                                            $active={activeEditorTab === tab.key}
                                            onClick={() => setActiveEditorTab(tab.key)}
                                        >
                                            <strong>{tab.label}</strong>
                                            <span>{tab.count}개</span>
                                        </EditorTabButton>
                                    ))}
                                </EditorTabs>

                                <EditorBody>
                                    {activeEditorTab === 'connection' ? (
                                        <>
                                            <SectionCard>
                                                <SectionTitle>
                                                    <h3>연결 현황</h3>
                                                    <span>{mappedGateCount}/{campusGates.length} gate 연결</span>
                                                </SectionTitle>
                                                <ConnectionOverviewGrid>
                                                    <ConnectionStatCard>
                                                        <ConnectionStatValue>{campusGates.length}</ConnectionStatValue>
                                                        <ConnectionStatLabel>캠퍼스 gate</ConnectionStatLabel>
                                                    </ConnectionStatCard>
                                                    <ConnectionStatCard>
                                                        <ConnectionStatValue>{mappedGateCount}</ConnectionStatValue>
                                                        <ConnectionStatLabel>연결 완료 gate</ConnectionStatLabel>
                                                    </ConnectionStatCard>
                                                    <ConnectionStatCard>
                                                        <ConnectionStatValue>{buildingEntranceNodeCount}</ConnectionStatValue>
                                                        <ConnectionStatLabel>건물 전체 entrance node</ConnectionStatLabel>
                                                    </ConnectionStatCard>
                                                    <ConnectionStatCard>
                                                        <ConnectionStatValue>{verticalConnectionNodes.length}</ConnectionStatValue>
                                                        <ConnectionStatLabel>수직 이동 후보</ConnectionStatLabel>
                                                    </ConnectionStatCard>
                                                </ConnectionOverviewGrid>
                                                <HelpText>
                                                    gate 매핑은 건물 단위로 한 번만 관리합니다. 현재 층에 entrance node가 없어도, 다른 층에서 이미 연결된 gate는 여기서 그대로 연결 완료로 보여야 합니다.
                                                </HelpText>
                                            </SectionCard>

                                            <SectionCard>
                                                <SectionTitle>
                                                    <h3>출입구 캘리브레이션</h3>
                                                    <span>{campusGates.length}개 gate</span>
                                                </SectionTitle>
                                                <HelpText>
                                                    Gate를 하나 고른 뒤 지도에서 노드를 직접 클릭해 연결합니다. 이미 연결된 gate도 언제든 다시 지정할 수 있습니다.
                                                </HelpText>
                                                {pendingGatePick && (
                                                    <ConnectionPickBanner>
                                                        <ConnectionPickText>
                                                            <strong>{pendingGatePick.gateName}에 연결할 노드를 지도에서 클릭하세요.</strong>
                                                            <HelpText>아무 node나 지정할 수 있고, 연결되면 해당 node는 자동으로 entrance로 처리됩니다.</HelpText>
                                                        </ConnectionPickText>
                                                        <Button variant="outlineGray" size="sm" onClick={() => setPendingGatePick(null)}>
                                                            선택 취소
                                                        </Button>
                                                    </ConnectionPickBanner>
                                                )}
                                                {campusGates.length > 0 ? (
                                                    <MappingGrid>
                                                        {campusGates.map((gate) => {
                                                            const mapped = entranceMappingByGateId.get(gate.id)
                                                            return (
                                                                <MappingRow key={gate.id} $active={pendingGatePick?.gateId === gate.id}>
                                                                    <MappingRowHeader>
                                                                        <strong>{gate.name}</strong>
                                                                        <MappingStatus $mapped={!!mapped}>
                                                                            {pendingGatePick?.gateId === gate.id ? '노드 선택 중' : mapped ? '연결 완료' : '미연결'}
                                                                        </MappingStatus>
                                                                    </MappingRowHeader>
                                                                    <MappingMeta>
                                                                        {mapped?.nodeId
                                                                            ? `${gate.name}이 ${floorNameById.get(mapped.floorId) || '다른 층'}의 실내 node와 연결되어 있습니다.`
                                                                            : '아직 연결된 실내 node가 없습니다. 지도에서 바로 지정해 주세요.'}
                                                                    </MappingMeta>
                                                                    <DetailActions>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => startGatePick(gate)}
                                                                            disabled={isMappingLoading}
                                                                        >
                                                                            {mapped?.nodeId ? '다시 지정' : '지도에서 지정'}
                                                                        </Button>
                                                                        {mapped?.nodeId && (
                                                                            <Button
                                                                                variant="outlineGray"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setSelectedEntity({ type: 'node', id: mapped.nodeId })
                                                                                }}
                                                                            >
                                                                                지도에서 보기
                                                                            </Button>
                                                                        )}
                                                                        {pendingGatePick?.gateId === gate.id && (
                                                                            <Button
                                                                                variant="outlineGray"
                                                                                size="sm"
                                                                                onClick={() => setPendingGatePick(null)}
                                                                            >
                                                                                취소
                                                                            </Button>
                                                                        )}
                                                                    </DetailActions>
                                                                </MappingRow>
                                                            )
                                                        })}
                                                    </MappingGrid>
                                                ) : (
                                                    <ErrorHint>캠퍼스에 등록된 gate가 없습니다. 캠퍼스 관리에서 gate를 먼저 등록해 주세요.</ErrorHint>
                                                )}
                                            </SectionCard>

                                            <SectionCard>
                                                <SectionTitle>
                                                    <h3>실내 출입구 노드</h3>
                                                    <span>{entranceNodes.length}개</span>
                                                </SectionTitle>
                                                <HelpText>
                                                    현재 층의 entrance node 목록입니다. 건물 전체 연결 여부와는 별개로, 이 층에서 바로 조정할 수 있는 node만 보여줍니다.
                                                </HelpText>
                                                {entranceNodes.length > 0 ? (
                                                    <EntityList>
                                                        {entranceNodes.map((node) => {
                                                            const mapping = entranceMappingByNodeId.get(node.id)
                                                            const active = selectedEntity?.type === 'node' && selectedEntity.id === node.id
                                                            return (
                                                                <EntityItem
                                                                    key={node.id}
                                                                    type="button"
                                                                    $active={active}
                                                                    onClick={() => handleEntitySelect('node', node.id)}
                                                                >
                                                                    <EntityTitle>
                                                                        <strong>{node.name || '이름 없는 출입구'}</strong>
                                                                        <span>{mapping?.campusGateName || 'UNMAPPED'}</span>
                                                                    </EntityTitle>
                                                                    <EntityMeta>
                                                                        {mapping?.campusGateName
                                                                            ? `${mapping.campusGateName}와 연결됨`
                                                                            : '아직 gate와 연결되지 않았습니다.'}
                                                                    </EntityMeta>
                                                                </EntityItem>
                                                            )
                                                        })}
                                                    </EntityList>
                                                ) : (
                                                    <ConnectionEmptyState>
                                                        <strong>현재 층에 entrance node가 없습니다.</strong>
                                                        <HelpText>
                                                            다른 층에서 이미 gate 매핑이 끝났을 수도 있습니다. 이 영역은 현재 층에서 직접 수정할 entrance node가 있을 때만 표시됩니다.
                                                        </HelpText>
                                                        <DetailActions>
                                                            <Button size="sm" onClick={() => setActiveEditorTab('node')}>
                                                                노드 탭 열기
                                                            </Button>
                                                        </DetailActions>
                                                    </ConnectionEmptyState>
                                                )}
                                            </SectionCard>

                                            <SectionCard>
                                                <SectionTitle>
                                                    <h3>수직 이동 연결 (캘리브레이션)</h3>
                                                    <Button size="sm" onClick={handleCreateVerticalConnector} disabled={isVerticalLoading}>
                                                        + 추가
                                                    </Button>
                                                </SectionTitle>
                                                <HelpText>
                                                    엘리베이터, 계단, 에스컬레이터 등 수직 통로를 만들고 각 층의 노드를 연결합니다. 동일한 통로에 연결된 노드들 간에 자동으로 수직 이동 가중치가 생성됩니다.
                                                </HelpText>

                                                {verticalConnectors.length > 0 ? (
                                                    <VerticalConnectorList>
                                                        {verticalConnectors.map((connector) => {
                                                            const icon = connector.kind === 'elevator' ? '🛗' : connector.kind === 'stair' ? '🪜' : connector.kind === 'escalator' ? '🛗' : '🪜';
                                                            const isActive = activeConnectorForMapping?.connectorId === connector.id;
                                                            return (
                                                                <MappingRow key={connector.id} $active={isActive}>
                                                                    <MappingRowHeader>
                                                                        <strong>{icon} {connector.name}</strong>
                                                                        <DeleteTextButton 
                                                                            type="button" 
                                                                            onClick={() => handleDeleteVerticalConnector(connector.id)}
                                                                            disabled={isVerticalLoading}
                                                                        >
                                                                            삭제
                                                                        </DeleteTextButton>
                                                                    </MappingRowHeader>
                                                                    <MappingMeta>
                                                                        종류: {connector.kind} ({connector.nodes?.length || 0}개 층 연결됨)
                                                                    </MappingMeta>
                                                                    <VerticalFloorRowsContainer>
                                                                        {floorOptions.map((floor) => {
                                                                            const mappedNode = connector.nodes?.find(n => n.floorId === floor.id);
                                                                            const isCurrentPicking = activeConnectorForMapping?.connectorId === connector.id && activeConnectorForMapping?.floorId === floor.id;
                                                                            
                                                                            return (
                                                                                <VerticalFloorRow key={floor.id}>
                                                                                    <VerticalFloorName>{floor.name}</VerticalFloorName>
                                                                                    <VerticalNodeStatus $mapped={!!mappedNode}>
                                                                                        {isCurrentPicking 
                                                                                            ? '지도에서 노드 선택 중...' 
                                                                                            : mappedNode 
                                                                                                ? `${mappedNode.nodeName || '연결됨'} (${mappedNode.nodeId?.substring(0, 8)})` 
                                                                                                : '미연결'}
                                                                                    </VerticalNodeStatus>
                                                                                    <VerticalFloorRowActions>
                                                                                        {mappedNode ? (
                                                                                            <>
                                                                                                <Button 
                                                                                                    variant="outlineGray" 
                                                                                                    size="sm" 
                                                                                                    onClick={() => handleViewVerticalNode(floor.id, mappedNode.nodeId)}
                                                                                                >
                                                                                                    보기
                                                                                                </Button>
                                                                                                <Button 
                                                                                                    variant="dangerOutline" 
                                                                                                    size="sm" 
                                                                                                    onClick={() => handleUnmapVerticalNode(connector.id, floor.id)}
                                                                                                    disabled={isVerticalLoading}
                                                                                                >
                                                                                                    해제
                                                                                                </Button>
                                                                                            </>
                                                                                        ) : (
                                                                                            <Button 
                                                                                                size="sm" 
                                                                                                onClick={() => startVerticalNodePick(connector.id, connector.name, floor.id)}
                                                                                                disabled={isVerticalLoading || isCurrentPicking}
                                                                                            >
                                                                                                {isCurrentPicking ? '선택 중' : '지정'}
                                                                                            </Button>
                                                                                        )}
                                                                                    </VerticalFloorRowActions>
                                                                                </VerticalFloorRow>
                                                                            );
                                                                        })}
                                                                    </VerticalFloorRowsContainer>
                                                                </MappingRow>
                                                            );
                                                        })}
                                                    </VerticalConnectorList>
                                                ) : (
                                                    <ConnectionEmptyState>
                                                        <strong>등록된 수직 이동수단이 없습니다.</strong>
                                                        <HelpText>우측 상단의 "+ 추가" 버튼을 눌러 엘리베이터나 계단을 먼저 만들어보세요.</HelpText>
                                                    </ConnectionEmptyState>
                                                )}
                                            </SectionCard>
                                        </>
                                    ) : (
                                        <>
                                    <SectionCard>
                                        <SectionTitle>
                                            <h3>선택한 항목</h3>
                                            <span>{selectedEditorItem ? '속성 편집' : '선택 없음'}</span>
                                        </SectionTitle>
                                        {selectedRawEntity && selectedEditorItem ? (
                                            <>
                                                <FormGrid>
                                                    {(selectedEntity?.type === 'poi' || selectedEntity?.type === 'zone' || selectedEntity?.type === 'node') && (
                                                        <FieldGroup>
                                                            <span>이름</span>
                                                            <FieldInput
                                                                value={selectedRawEntity.name || ''}
                                                                onChange={(event) => updateSelectedEntityField('name', event.target.value)}
                                                                placeholder="이름을 입력하세요"
                                                            />
                                                        </FieldGroup>
                                                    )}

                                                     {selectedEntity?.type === 'node' && (
                                                         <FieldGroup>
                                                             <span>노드 유형</span>
                                                             <FieldSelect
                                                                 value={selectedRawEntity?.kind || 'corridor'}
                                                                 onChange={(event) => updateSelectedEntityField('kind', event.target.value)}
                                                             >
                                                                 <option value="corridor">일반 노드 (corridor)</option>
                                                                 <option value="entrance">출입구 (entrance)</option>
                                                                 <option value="stair">계단 (stair)</option>
                                                                 <option value="elevator">엘리베이터 (elevator)</option>
                                                                 <option value="escalator">에스컬레이터 (escalator)</option>
                                                             </FieldSelect>
                                                         </FieldGroup>
                                                     )}

                                                    {selectedEntity?.type === 'edge' && (
                                                        <InlineFieldRow>
                                                            <FieldGroup>
                                                                <span>방향</span>
                                                                <FieldSelect
                                                                    value={selectedRawEntity.isDirected ? 'directed' : 'bidirectional'}
                                                                    onChange={(event) => updateSelectedEntityField('isDirected', event.target.value === 'directed')}
                                                                >
                                                                    <option value="bidirectional">양방향</option>
                                                                    <option value="directed">단방향</option>
                                                                </FieldSelect>
                                                            </FieldGroup>
                                                            <FieldGroup>
                                                                <span>기본 가중치</span>
                                                                <FieldInput
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.1"
                                                                    value={selectedRawEntity.baseWeight ?? 1}
                                                                    onChange={(event) => updateSelectedEntityField('baseWeight', event.target.value === '' ? '' : Number(event.target.value))}
                                                                />
                                                            </FieldGroup>
                                                        </InlineFieldRow>
                                                    )}

                                                    {selectedEntity?.type === 'poi' && (
                                                        <>
                                                            <FieldGroup>
                                                                <span>카테고리</span>
                                                                <FieldSelect
                                                                    value={selectedRawEntity.code || ''}
                                                                    onChange={(event) => updateSelectedPoiCategory(event.target.value)}
                                                                >
                                                                    <option value="">선택 안 함</option>
                                                                    {POI_CATEGORY_OPTIONS.map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </FieldSelect>
                                                            </FieldGroup>
                                                            <FieldGroup>
                                                                <span>외부 장소 ID</span>
                                                                <FieldInput
                                                                    value={selectedRawEntity.externalApiId || ''}
                                                                    onChange={(event) => updateSelectedEntityField('externalApiId', event.target.value)}
                                                                    placeholder="카카오 장소 ID 등"
                                                                />
                                                                <FieldHint>수동 매핑 전까지는 비워둘 수 있습니다.</FieldHint>
                                                            </FieldGroup>
                                                            <FieldGroup>
                                                                <span>POI 글씨 크기</span>
                                                                <Toolbar>
                                                                    <Button
                                                                        variant="outlineGray"
                                                                        size="sm"
                                                                        onClick={() => updateSelectedPoiAttrsPatch({
                                                                            labelScale: normalizeLabelScale((selectedRawEntity?.attrs?.labelScale ?? 1) - 0.1),
                                                                        })}
                                                                    >
                                                                        -
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => updateSelectedPoiAttrsPatch({ labelScale: 1 })}
                                                                    >
                                                                        {Math.round(normalizeLabelScale(selectedRawEntity?.attrs?.labelScale ?? 1) * 100)}%
                                                                    </Button>
                                                                    <Button
                                                                        variant="outlineGray"
                                                                        size="sm"
                                                                        onClick={() => updateSelectedPoiAttrsPatch({
                                                                            labelScale: normalizeLabelScale((selectedRawEntity?.attrs?.labelScale ?? 1) + 0.1),
                                                                        })}
                                                                    >
                                                                        +
                                                                    </Button>
                                                                </Toolbar>
                                                                <FieldHint>위의 전체 POI 글씨 크기 설정과 함께 곱해서 적용됩니다.</FieldHint>
                                                            </FieldGroup>
                                                            <FieldGroup>
                                                                <span>연결 노드</span>
                                                                <FieldSelect
                                                                    value={selectedRawEntity.anchorNodeId || ''}
                                                                    onChange={(event) => updateSelectedEntityField('anchorNodeId', event.target.value || null)}
                                                                >
                                                                    <option value="">연결 안 함</option>
                                                                    {poiNodeOptions.map((node) => (
                                                                        <option key={node.id} value={node.id}>
                                                                            {node.label}
                                                                        </option>
                                                                    ))}
                                                                </FieldSelect>
                                                                <FieldHint>선택한 POI에 연결된 node는 지도에서 함께 강조됩니다.</FieldHint>
                                                            </FieldGroup>
                                                        </>
                                                    )}

                                                    {selectedEntity?.type === 'zone' && (
                                                        <>
                                                            <FieldGroup>
                                                                <span>영역 유형</span>
                                                                <FieldSelect
                                                                    value={selectedRawEntity.kind || 'room'}
                                                                    onChange={(event) => updateSelectedEntityField('kind', event.target.value)}
                                                                >
                                                                    <option value="room">room</option>
                                                                    <option value="corridor">corridor</option>
                                                                    <option value="restricted">restricted</option>
                                                                </FieldSelect>
                                                            </FieldGroup>
                                                            <FieldHint>선택된 zone은 지도에서 꼭짓점을 드래그해 모양을 바꿀 수 있고, 주황 점을 누르면 새 꼭짓점을 추가할 수 있습니다.</FieldHint>
                                                        </>
                                                    )}
                                                </FormGrid>

                                                <DetailActions>
                                                    {selectedEntity?.type === 'poi' && (
                                                        <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                                            POI 삭제
                                                        </Button>
                                                    )}
                                                    {selectedEntity?.type === 'zone' && selectedZoneVertexIndex != null && (
                                                        <Button
                                                            variant="outlineGray"
                                                            size="sm"
                                                            onClick={deleteSelectedZoneVertex}
                                                            disabled={getPolygonVertices(selectedRawEntity?.geomPx).length <= 3}
                                                        >
                                                            선택 점 삭제
                                                        </Button>
                                                    )}
                                                                                                        {selectedEntity?.type === 'node' && (
                                                                        <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                                                            노드 삭제
                                                                        </Button>
                                                                    )}
                                                                    {selectedEntity?.type === 'edge' && (
                                                                        <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                                                            엣지 삭제
                                                                        </Button>
                                                                    )}
                                                    {selectedEntity?.type === 'zone' && (
                                                        <Button variant="outlineGray" size="sm" onClick={deleteSelectedEntity}>
                                                            Zone 삭제
                                                        </Button>
                                                    )}
                                                    <Button variant="outlineGray" size="sm" onClick={resetSelectedEntityEdits}>
                                                        변경 초기화
                                                    </Button>
                                                </DetailActions>

                                                <DetailGrid>
                                                    {selectedEditorItem.detailRows.map(([label, value]) => (
                                                        <div key={`${selectedEditorItem.id}-${label}`} style={{ display: 'contents' }}>
                                                            <DetailLabel>{label}</DetailLabel>
                                                            <DetailValue>{value}</DetailValue>
                                                        </div>
                                                    ))}
                                                </DetailGrid>
                                            </>
                                        ) : (
                                            <HelpText>목록 또는 지도에서 항목을 선택하면 오른쪽에서 이름, 방향성, 외부 ID 같은 기본 속성을 먼저 다듬을 수 있습니다.</HelpText>
                                        )}
                                    </SectionCard>

                                    <SectionCard>
                                        <SectionTitle>
                                            <h3>{editorTabMeta.find((tab) => tab.key === activeEditorTab)?.label} 목록</h3>
                                            <SectionTitleActions>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEntityListCollapsed((current) => !current)}
                                                >
                                                    {isEntityListCollapsed ? '목록 펼치기' : '목록 접기'}
                                                </Button>
                                                <span>{filteredActiveEditorItems.length}개</span>
                                            </SectionTitleActions>
                                        </SectionTitle>
                                        {activeEditorTab === 'poi' && (
                                            <DetailActions>
                                                <Button
                                                    variant={isAddingPoi ? 'primary' : 'outlineGray'}
                                                    size="sm"
                                                    onClick={() => {
                                                        setToolMode('select')
                                                        setIsAddingZone(false)
                                                        setDraftZoneVertices([])
                                                        setZoneDraftError('')
                                                        setIsAddingNode(false)
                                                        setIsAddingEdge(false)
                                                        setEdgeStartNodeId(null)
                                                        setIsAddingPoi((current) => !current)
                                                    }}
                                                >
                                                    {isAddingPoi ? 'POI 추가 취소' : 'POI 추가'}
                                                </Button>
                                                {isAddingPoi && <FieldHint>지도에서 원하는 위치를 클릭하면 새 POI가 생성됩니다.</FieldHint>}
                                            </DetailActions>
                                        )}
                                        {activeEditorTab === 'zone' && (
                                            <DetailActions>
                                                <Button
                                                    variant={isAddingZone ? 'primary' : 'outlineGray'}
                                                    size="sm"
                                                    onClick={() => {
                                                        setToolMode('select')
                                                        setIsAddingPoi(false)
                                                        setIsAddingNode(false)
                                                        setIsAddingEdge(false)
                                                        setEdgeStartNodeId(null)
                                                        setIsAddingZone((current) => {
                                                            const next = !current
                                                            if (!next) {
                                                                setDraftZoneVertices([])
                                                                setZoneDraftError('')
                                                            }
                                                            return next
                                                        })
                                                    }}
                                                >
                                                    {isAddingZone ? '영역 추가 취소' : '영역 추가'}
                                                </Button>
                                                {isAddingZone && (
                                                    <>
                                                        <Button
                                                            variant="outlineGray"
                                                            size="sm"
                                                            onClick={() => setDraftZoneVertices((current) => current.slice(0, -1))}
                                                            disabled={draftZoneVertices.length === 0}
                                                        >
                                                            마지막 점 삭제
                                                        </Button>
                                                        <Button
                                                            variant="outlineGray"
                                                            size="sm"
                                                            onClick={() => createZoneFromVertices(draftZoneVertices)}
                                                            disabled={draftZoneVertices.length < 3}
                                                        >
                                                            영역 완성
                                                        </Button>
                                                    </>
                                                )}
                                            </DetailActions>
                                        )}
                                        {activeEditorTab === 'node' && (
                                            <DetailActions>
                                                <Button
                                                    variant={isAddingNode ? 'primary' : 'outlineGray'}
                                                    size="sm"
                                                    onClick={() => {
                                                        setToolMode('select')
                                                        setIsAddingPoi(false)
                                                        setIsAddingZone(false)
                                                        setDraftZoneVertices([])
                                                        setZoneDraftError('')
                                                        setIsAddingEdge(false)
                                                        setEdgeStartNodeId(null)
                                                        setIsAddingNode((current) => !current)
                                                    }}
                                                >
                                                    {isAddingNode ? '노드 추가 취소' : '노드 추가'}
                                                </Button>
                                                {isAddingNode && <FieldHint>지도에서 원하는 위치를 클릭하면 새 노드가 생성됩니다.</FieldHint>}
                                            </DetailActions>
                                        )}
                                        {activeEditorTab === 'edge' && (
                                            <DetailActions>
                                                <Button
                                                    variant={isAddingEdge ? 'primary' : 'outlineGray'}
                                                    size="sm"
                                                    onClick={() => {
                                                        setToolMode('select')
                                                        setIsAddingPoi(false)
                                                        setIsAddingZone(false)
                                                        setDraftZoneVertices([])
                                                        setZoneDraftError('')
                                                        setIsAddingNode(false)
                                                        setIsAddingEdge((current) => {
                                                            const next = !current
                                                            if (!next) {
                                                                setEdgeStartNodeId(null)
                                                            }
                                                            return next
                                                        })
                                                    }}
                                                >
                                                    {isAddingEdge ? '엣지 추가 취소' : '엣지 추가'}
                                                </Button>
                                                {isAddingEdge && (
                                                    <FieldHint>
                                                        {!edgeStartNodeId 
                                                            ? '지도의 시작 노드를 선택(클릭)하세요.' 
                                                            : '지도의 도착 노드를 선택(클릭)하면 엣지가 생성됩니다.'}
                                                    </FieldHint>
                                                )}
                                            </DetailActions>
                                        )}
                                        <HelpText>
                                            {activeEditorTab === 'poi'
                                                ? 'POI 이름은 지도 위에 검은 라벨로 먼저 보이고, 패널에서 검색과 목록 정리를 진행합니다.'
                                                : activeEditorTab === 'edge'
                                                    ? '엣지는 시작/도착 노드 기준으로 확인하고, 선택 시 지도에서 더 진하게 표시됩니다.'
                                                    : activeEditorTab === 'node'
                                                        ? '출입구, 교차점, 수직 연결점 등 길찾기 핵심 노드를 먼저 점검합니다.'
                                                        : '공간과 통행 구역은 이름과 polygon 범위를 먼저 확인합니다.'}
                                        </HelpText>
                                        {(activeEditorTab === 'poi' || activeEditorTab === 'zone') && (
                                            <InlineFieldRow>
                                                <FieldGroup>
                                                    <span>{activeEditorTab === 'poi' ? 'POI 검색' : 'Zone 검색'}</span>
                                                    <SearchInput
                                                        value={entitySearch}
                                                        onChange={(event) => setEntitySearch(event.target.value)}
                                                        placeholder={activeEditorTab === 'poi' ? '이름, 카테고리, 설명 검색' : '이름, 유형, 설명 검색'}
                                                    />
                                                </FieldGroup>
                                            </InlineFieldRow>
                                        )}
                                        {activeEditorTab === 'zone' && (
                                            <Toolbar>
                                                {[
                                                    ['all', '전체'],
                                                    ['room', 'room'],
                                                    ['corridor', 'corridor'],
                                                    ['restricted', 'restricted'],
                                                ].map(([value, label]) => (
                                                    <Button
                                                        key={value}
                                                        variant={zoneKindFilter === value ? 'primary' : 'outlineGray'}
                                                        size="sm"
                                                        onClick={() => setZoneKindFilter(value)}
                                                    >
                                                        {label}
                                                    </Button>
                                                ))}
                                            </Toolbar>
                                        )}
                                        {activeEditorTab === 'zone' && (
                                            <>
                                                {isAddingZone && (
                                                    <FieldHint>
                                                        지도를 클릭해 꼭짓점을 추가하세요. 첫 점 근처를 다시 클릭하거나 `영역 완성`을 누르면 polygon이 닫힙니다.
                                                    </FieldHint>
                                                )}
                                                {zoneDraftError && <HelpText style={{ color: '#b91c1c' }}>{zoneDraftError}</HelpText>}
                                            </>
                                        )}
                                        {!isEntityListCollapsed && (
                                            <EntityList>
                                                {filteredActiveEditorItems.length > 0 ? (
                                                    filteredActiveEditorItems.map((item) => {
                                                        const isItemSelected = selectedEntity?.type === activeEditorTab && selectedEntity.id === item.id

                                                        return (
                                                        <EntityItem
                                                            key={item.id}
                                                            ref={isItemSelected ? selectedListItemRef : null}
                                                            type="button"
                                                            $active={isItemSelected}
                                                            onClick={() => handleEntitySelect(activeEditorTab, item.id)}
                                                        >
                                                            <EntityTitle>
                                                                <strong>{item.title}</strong>
                                                                <span>{item.badge}</span>
                                                            </EntityTitle>
                                                            <EntityMeta>{item.subtitle}</EntityMeta>
                                                        </EntityItem>
                                                        )
                                                    })
                                                ) : (
                                                    <HelpText>검색 조건에 맞는 {activeEditorTab === 'poi' ? 'POI' : '항목'}가 없습니다.</HelpText>
                                                )}
                                            </EntityList>
                                        )}
                                    </SectionCard>

                                        </>
                                    )}
                                </EditorBody>
                            </EditorCard>
                        )}
                    </WorkspaceLayout>
                )}
            </Container>
            <PublishReviewModal
                isOpen={isPublishReviewOpen}
                isPublishing={isPublishing}
                isSavingPublishPoiMappings={isSavingPublishPoiMappings}
                onClose={closePublishReview}
                reviewedPublishPoiCount={reviewedPublishPoiCount}
                publishPoiRows={publishPoiRows}
                mappedGateCount={mappedGateCount}
                campusGateCount={campusGates.length}
                publishEntranceReady={publishEntranceReady}
                pendingPublishPoiCount={pendingPublishPoiCount}
                activePublishPoi={activePublishPoi}
                onSelectPoi={setActivePublishPoiId}
                isPublishReviewLoading={isPublishReviewLoading}
                publishReviewError={publishReviewError}
                onExcludePoi={markPublishPoiExcluded}
                onClearPoiReview={clearPublishPoiReview}
                onMoveToConnectionTab={() => {
                    closePublishReview()
                    setActiveEditorTab('connection')
                }}
                isFacilityDraftPoi={isFacilityDraftPoi}
                getPublishPoiStatusLabel={getPublishPoiStatusLabel}
                isPublishPoiRecommendLoading={isPublishPoiRecommendLoading}
                publishPoiRecommendations={publishPoiRecommendations}
                onConfirmPoiMapping={confirmPublishPoiMapping}
                publishPoiSearchKeyword={publishPoiSearchKeyword}
                onChangePublishPoiSearchKeyword={setPublishPoiSearchKeyword}
                onSearchPublishPoiCandidates={searchPublishPoiCandidates}
                isPublishPoiSearchLoading={isPublishPoiSearchLoading}
                publishPoiSearchResults={publishPoiSearchResults}
                onConfirmPublish={handleConfirmPublish}
            />
        </PageWrapper>
    )
}
