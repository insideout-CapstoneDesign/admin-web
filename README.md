# 📍 Insideout - AI 기반 실내외 통합 내비게이션 (Admin Web)

 **"실내 지도를 그리는 일이 더 이상 수작업에만 의존하지 않도록."**
> Insideout 관리자 웹은 건물 관리자가 AI로 추출된 실내 지도 데이터를 검토·수정·배포할 수 있도록 설계된 웹 애플리케이션입니다.
건물 등록, 도면 업로드, AI 분석, 맵 에디팅, 출입구 및 수직 이동 매핑, 최종 배포까지의 과정을 하나의 흐름으로 통합하여, 실내외 내비게이션 운영에 필요한 데이터를 효율적으로 구축·관리할 수 있도록 지원합니다.

---

## 👥 팀원 소개 (Contributors)

> **Insideout 프로젝트를 이끈 양양양말을 소개합니다.**


| **차승은** | **이민지** | **김민준** | **김세현** |
| :---: | :---: | :---: | :---: |
| [<img src="https://github.com/user-attachments/assets/35081664-ee95-49bf-9bbf-0340df69f54b" height="180" width="130" style="border-radius: 8px;"><br/>](https://github.com/cktmddms) | [<img src="https://github.com/user-attachments/assets/8d75a543-b6ef-4a57-86c2-e06d93e9376d" height="180" width="130" style="border-radius: 8px;"><br/>](https://github.com/thisminji) | [<img src="https://github.com/user-attachments/assets/d6335e5f-31a8-4ab6-9432-1269227ae012" height="180" width="130" style="border-radius: 8px;"><br/>](https://github.com/minjune0) | [<img src="https://github.com/user-attachments/assets/40120ba5-e3c7-4048-9d54-cdfa837f7a6d" height="180" width="130" style="border-radius: 8px;"><br/>](https://github.com/sekong11) |
| 🔹 **Hybrid Navigation** <br> <sub>사용자 웹 - BE, FE</sub> | 🔹 **Auth, Search, Infra** <br> <sub>사용자 웹 - BE, FE</sub> | 🔹 **AI Map Builder** <br> <sub>관리자 웹 - AI, FE</sub> | 🔹 **Map Editor** <br> <sub>관리자 웹 - BE, FE</sub> |

---


## 🔗 프로덕션 배포 주소 (Live Demo)

본 서비스는 클라우드 환경에 자동 배포되어 운영 중이며, 아래 링크를 통해 별도의 설치 없이 즉시 체험하실 수 있습니다.

* **🌐 Insideout 관리자 웹 바로가기:** [https://insideout-admin-web.vercel.app](https://insideout-admin-web.vercel.app)



---

## 🛠️ 기술 스택 (Tech Stack)
### Frontend Core
<div> <img src="https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/React%20Router%20DOM-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> </div>

### UI & UX
<div> <img src="https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styled-components&logoColor=white"> <img src="https://img.shields.io/badge/Framer%20Motion-000000?style=for-the-badge&logo=framer&logoColor=white"> <img src="https://img.shields.io/badge/react--modal--sheet-111111?style=for-the-badge"> </div>

### Form / Validation
<div> <img src="https://img.shields.io/badge/react--hook--form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white"> <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white"> </div>

### Map / Search / Network
<div> <img src="https://img.shields.io/badge/Kakao%20Maps-FFCD00?style=for-the-badge&logo=kakao&logoColor=000000"> <img src="https://img.shields.io/badge/Fetch%20API-005CFF?style=for-the-badge"> </div>

### Deployment
<div> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"> </div>


---

## 📱 서비스 핵심 기능 및 UI 시연 (Key Features & UI)

### 🏢 1. 테넌트 및 건물 관리
관리자는 자신의 테넌트에 등록된 건물 목록을 확인하고, 건물 등록 상태와 운영 상태를 관리할 수 있습니다.
건물별 승인 여부, 활성화 상태, 등록된 도면 수 등 운영 정보를 한눈에 확인할 수 있도록 구성했습니다.

| 관리자 대시보드	테넌트 등록 화면 |

<img width="3014" height="1702" alt="테넌트 생성" src="https://github.com/user-attachments/assets/259c5ac6-a821-4e20-928e-6850d2c90562" /> 

<br><br>

| 관리자 대시보드	건물 목록 화면 |

<img width="3014" height="1702" alt="건물 등록" src="https://github.com/user-attachments/assets/b23f2cb0-4ddd-42cf-914d-1b2ea5c556a4" />

<br><br>

| 단지 지리 정보 등록 화면 |

<img width="900" height="853" alt="스크린샷 2026-06-18 오후 5 23 16" src="https://github.com/user-attachments/assets/5d776f61-99e5-4ba8-b5c9-1af89f0ab61f" />

---

### 🧭 2. AI 도면 분석 및 맵 구축
관리자는 건물 또는 단지 도면 이미지를 업로드한 뒤, AI 분석 결과를 바탕으로 텍스트, 오브젝트, POI, 노드, 엣지, Zone 등을 검토할 수 있습니다.
AI가 생성한 초안 데이터를 그대로 사용하지 않고, 관리자가 직접 수정하는 구조를 통해 실사용 가능한 지도 데이터 품질을 확보했습니다.

| 도면 업로드 및 AI 분석 결과 화면 |

<img width="3014" height="1714" alt="도면 AI 요청" src="https://github.com/user-attachments/assets/e795f1d3-9488-42e5-8b20-dae8e5147ae9" />
<br><br>

---

### ✏️ 3. 맵 에디터
맵 에디터에서는 관리자가 AI 분석 결과를 기반으로 노드, 엣지, POI, Zone을 수정·추가·삭제할 수 있습니다.
드래그 앤 드롭 방식의 편집, 속성 패널 기반 수정, 층 전환, 자동 임시 저장 기능을 통해 복잡한 실내 데이터를 안정적으로 편집할 수 있도록 설계했습니다.

<img width="3020" height="1722" alt="화면 기록 2026-06-13 오후 12 43 11" src="https://github.com/user-attachments/assets/c6958703-4a61-4db1-a588-967358fd83a5" />
<br><br>

---

### 🔗 4. 출입구 및 수직 이동 매핑
실내 길찾기의 핵심인 출입구 캘리브레이션과 수직 이동 연결을 관리할 수 있습니다.
관리자는 건물 출입구와 실내 노드를 연결하고, 엘리베이터·계단 등 층간 이동 요소를 층별로 매핑하여 사용자 앱의 경로 탐색이 올바르게 동작하도록 구성합니다.

<img width="960" height="546" alt="화면 기록 2026-06-12 오전 1 19 42" src="https://github.com/user-attachments/assets/de621351-23ad-49d4-9ef8-a3734f3e7c6b" />
<br><br>

---

### 🚀 5. 최종 배포 전 검토 및 배포
최종 배포 전 검토 단계에서는 출입구 매핑 상태와 POI 외부 매핑 상태를 확인하고, 검토 완료된 항목만 실제 운영 데이터로 반영합니다.
이를 통해 draft와 published 버전을 분리하여, 수정 중인 데이터가 사용자 앱에 노출되는 문제를 방지했습니다.

| 검토 과정 화면 |

<img width="3014" height="1714" alt="화면 기록 2026-06-12 오전 1 26 40" src="https://github.com/user-attachments/assets/7795cbfe-9f2e-49fd-be62-47df4c7b347f" />
<br><br>
| 최종 배포 화면 |

<img width="3014" height="1714" alt="화면 기록 2026-06-12 오전 1 32 53" src="https://github.com/user-attachments/assets/6cd64853-844d-49dd-88da-e1607935174e" />


---

## 🔥 기술적 도전 및 해결 과제 (Technical Challenges)
> 💡 핵심 요약: 관리자 웹은 단순한 CRUD 화면이 아니라, AI 초안 데이터를 운영 가능한 지도 데이터로 바꾸는 편집·검수·배포 시스템이라는 점에서 구조적 복잡성이 컸습니다.

### 1. AI 분석 결과를 운영 데이터로 바로 쓰기 어려운 문제
* **문제**: 도면 이미지 품질과 표기 방식 차이로 인해 AI가 추출한 텍스트, POI, 노드, 엣지 결과가 항상 정확하지 않았습니다.
* **해결**: AI 분석 결과를 곧바로 published 데이터로 반영하지 않고, 관리자가 검토·수정할 수 있는 draft 기반 편집 흐름을 도입했습니다. 이를 통해 AI의 불확실성을 운영 단계에서 보완했습니다.
---
### 2. 맵 에디터가 커질수록 복잡해지는 상태 관리 문제
* **문제**: 맵 에디터는 도면 렌더링, 요소 선택, 속성 편집, 출입구 매핑, 수직 이동 연결 등 서로 다른 역할이 한 화면에 섞여 있어 유지보수가 어려웠습니다.
* **해결**: 지도 영역, 편집 패널, 연결 패널, 최종 배포 모달을 컴포넌트와 훅 단위로 분리하여 기능별 책임을 나눴습니다. 이 구조 덕분에 기능 추가와 수정이 비교적 안전해졌습니다.
---
### 3. draft와 published 버전 분리
* **문제**: 관리자가 편집 중인 데이터가 사용자 앱에 바로 노출되면 길찾기 오류가 발생할 수 있었습니다.
* **해결**: 관리자 편집용 데이터와 사용자 노출용 데이터를 분리했습니다. 편집 결과는 draft에 저장하고, 최종 검토가 끝난 후에만 published로 전환되도록 설계하여 운영 안정성을 높였습니다.
---
### 4. 최종 배포 전 데이터 정합성 검증
* **문제**: 출입구 캘리브레이션, POI 외부 매핑, 수직 이동 연결이 모두 맞아야 실내 길찾기가 정상 동작합니다.
* **해결**: 최종 배포 직전에 필수 연결 상태를 검증하는 검토 단계를 두었습니다. 검증이 완료되지 않은 경우 배포가 되지 않도록 하여, 불완전한 그래프가 사용자에게 전달되는 것을 방지했습니다.
---
### 5. 관리자 웹의 복잡한 편집 작업을 모바일 앱처럼 단순화하기 어려운 문제
* **문제**: 실내 지도 편집은 세밀한 조작이 필요해 화면이 복잡해지기 쉬웠습니다.
* **해결**: 자주 쓰는 기능을 상단 툴바와 우측 편집 패널 중심으로 배치하고, 선택한 요소에 따라 패널 내용을 바꾸는 방식으로 작업 흐름을 정리했습니다. 이를 통해 편집 효율과 가독성을 동시에 확보했습니다.
---
### 6. 운영 환경에서의 배포 및 동기화 안정성
* **문제**: 로컬에서는 잘 동작하지만 배포 환경에서는 데이터나 설정 차이로 오류가 발생할 수 있었습니다.
* **해결**: 공통 응답 구조, 에러 처리, 버전별 데이터 동기화 흐름을 정리하고, 배포 후에는 최종 검토 단계에서 실제 운영 반영 여부를 확인하도록 하여 배포 안정성을 보완했습니다.
