# Visiable-IndoorGML
 
## Installation and Run

```js
npm install
```

```js
npm start
```

port : 3000

## 필요한 것

visiable-indoorgml-convert-server

IndoorGML(.gml) file

## 사용법

http://localhost:3000/ 접속

indoorGML 데이터의 지도 좌표를 찍는다.

[사진]

총 4개의 점이 필요합니다.

지도 좌표와 대응되는

가장 왼편에 있는 점,
가장 오른편에 있는 점,
가장 상단에 있는 점,
가장 하단에 있는 점

을 마우스로 찍고 Send 버튼을 눌러 visiable-indoorgml-convert-server 에 데이터를 보냅니다.

컨버팅 된 좌표값으로 지도에 indoorGML 구조를 표시합니다.

## 컨트롤

MouseLeft : 지도상에 점을 찍습니다.

MouseRight : 가장 최근에 찍은 점을 삭제 합니다.

Initialize button : 모든 상태를 초기화 합니다.

Send button : visiable-indoorgml-convert-server 에 데이터를 보냅니다.
