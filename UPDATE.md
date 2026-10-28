# 2026-10-28 — 생물 환생 8개 언어 확장

## 적용 범위

- 언어: `ko`, `en`, `es`, `zh`, `ja`, `de`, `fr`, `pt`. 한국어 루트와 `/ko/`, 기존 언어 및 공유 결과 경로를 유지했다.
- `scripts/extra-translations.json`과 `scripts/prepare-extra-locales.mjs`가 추가 4개 언어의 UI, 런타임 상태·오류, 72개 결과명, 그룹명, 결과 설명, 공유문구, OG, 방법론, 이미지 크레딧 설명과 변경 고지를 생성한다. 원래 데이터에 별도 결과 설명 필드는 없으며 기존 결과 설명 함수와 분류·주소 설명을 번역했다.
- 전체 675개 HTML에 같은 결과·보조페이지 경로를 가리키는 8개 언어 reciprocal hreflang, x-default, canonical을 넣었다. 사이트맵에 675개 경로를 포함했다. 결과 페이지는 648개, OG JPG는 기본 카드까지 657개다. 이 수치는 한국어 루트와 `/ko/` 호환 복사본을 각각 포함한다.
- 언어 선택과 추천도 8개 언어를 지원한다. 언어 변경 시 같은 결과 경로를 유지한다. 로컬 미리보기에서는 GeoJS를 호출하지 않는다.
- 기존 탄소 생물량 모델과 72개 결과의 ID·확률·학명, 데이터, 원본 이미지 및 출처·저작자·라이선스 정보를 유지했다. 17개 기존 fingerprinted JS/CSS URL과 robots.txt도 보존했다.
- 기존 캐시 키, 최초 무료 추첨 및 재시도 1회, 카드당 공유 준비 보너스 +2, 현재 결과 제외 재추첨, 공유 취소·복사 실패·팝업 차단 시 무보상을 유지했다. 새 언어는 독립적인 캐시 키를 쓴다. More Apps 링크도 유지했다.

## 게시자 태그

- `GTM-NV2WWQXB`, `G-2ZYSF0173P`, `ca-pub-9767176956440077`, Cloudflare `9f3423bb0d034d91bbe1a12afeff2429`를 단일 guarded bootstrap으로 설치했다.
- 실행 호스트는 HTTPS `nanalab.kr`, 하위 도메인 및 `nanacompany.github.io`로 한정했다. HTTP, localhost, 127.0.0.1, ::1에서는 네 태그를 외부 로드하거나 초기화하지 않는다. 정적 noscript iframe은 제거하고 비활성 정책 표식을 남겼다.
- GA 자동 페이지뷰는 비활성화하고 query를 제외한 `origin + pathname`, 빈 referrer로 페이지뷰를 1회 보낸다. 추첨·재추첨·성공한 공유 준비 후에는 허용된 게임·행동·결과 ID만 보낸다. 공유 발송 확인으로 표현하지 않는다.

## 검증

- Node v24.19.0, Windows. 빌드·테스트 명령은 workspace RTK 실행 파일을 명시적으로 사용했다.
- `node scripts/build.mjs`: 성공. `node scripts/verify-reproducible.mjs`: 2,117개 출력 파일 전체 바이트 동일. 트리 SHA-256: `146aa052dc69b50048aa7d72ae16a914a205127ba6ba2929bb515c329a86f19c`.
- `node --test tests/*.test.js`: 24/24 통과. 가중치·현재 결과 제외·상태 복구, 실제 8개 언어 controller의 재시도·공유 취소·복사 실패·팝업 차단·중복 보상·캐시·추적 payload, 태그 guard, metadata·사이트맵·모든 로컬 링크·원본 에셋·번역 placeholder·언어 추천을 검증한다.
- `node scripts/verify-assets.mjs`: 72개 이미지, 300×300 JPEG, 원본 SHA-256·라이선스·출처 검증. 확률 합계 1.
- 원본 보존 fixture는 Git baseline `a05bbb04503aac02435acc35b5c67d6f6afd5547`에서 추출했다. JSON·license TXT 22개는 CRLF를 LF로 정규화한 SHA-256, JPEG 73개는 raw SHA-256이다. 최초 Windows 작업바이트 95개 해시는 별도 릴리스 audit에 보존한다.
- `node scripts/verify-portable.mjs`: 텍스트를 LF로 정규화한 독립 복사본(9,056개 파일)에서 24/24 통과. Linux 운영체제에서 실행한 검증과는 구분한다.

## 확인 범위

Git commit·push·Pages 배포와 공개 브라우저 QA는 상위 릴리스 작업에서 처리한다. 여기서는 브라우저를 실행하지 않았다. Node VM과 정적 출력 검증은 실제 네트워크 수신, 태그 서비스 통계 반영, 광고 채움, 물리 기기 공유창 및 사람이 수행한 이미지·화면 검수를 보장하지 않는다.

## 2026-10-28 — 초기 데이터 준비 상태 재검증

생물 환생은 기존 8개 언어 HTML의 추첨 버튼이 처음부터 disabled이다. controller는 onclick을 동기 등록한 뒤 categories.json과 image-sources.json 응답·데이터 검증·샘플 준비가 모두 완료된 시점에만 버튼을 활성화한다. 실패하면 버튼을 비활성화한 채 해당 언어의 오류와 재시도 안내를 표시한다. 국가 환생에서 관찰된 초기 활성 버튼 클릭 유실과 같은 런타임 수정은 필요하지 않았다.

실제 controller에 두 fetch 응답을 지연시키는 테스트를 추가했다. 8개 언어 모두 첫 HTML의 disabled, 준비 중 무소모, 응답 하나만 준비된 동안 비활성, 두 응답 완료 후 첫 클릭의 추첨 성공을 확인했다. 별도 지연 실패 테스트에서도 8개 언어 모두 비활성·현지화 오류·무소모를 확인했다. 최종 전체 테스트 26/26 통과. 런타임·템플릿·공개 docs는 변경하지 않았다.
