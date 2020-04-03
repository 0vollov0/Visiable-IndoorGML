# Visiable-IndoorGML
 
## 설치 및 실행

```
npm install
```

```
npm start
```

## 필요한 것

visiable-indoorgml-convert-server

IndoorGML(.gml) file

## 사용법

http://localhost:3000/ 접속

indoorGML 데이터의 지도 좌표를 찍는다.

![1](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/1.PNG)

지도 좌표와 대응되는 총 4개의 좌표가 필요합니다.


* 가장 왼편에 있는 좌표

* 가장 오른편에 있는 좌표

* 가장 상단에 있는 좌표

* 가장 하단에 있는 좌표 

4개의 좌표 데이터를 찍었다면 Send 버튼을 누릅니다.

visiable-indoorgml-convert-server에서 변환된 좌표값으로 지도에 indoorGML 구조를 표시합니다.

![2](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/2.PNG)

좌표 변환된 indoorGML 파일이 다운로드 됩니다.

## 컨트롤

MouseLeft : 지도상에 점을 찍습니다.

MouseRight : 가장 최근에 찍은 점을 삭제합니다.

Initialize button : 모든 상태를 초기화합니다.

Send button : 유저가 표시한 점 좌표들과 IndoorGML 파일을 visiable-indoorgml-convert-server에 데이터를 보냅니다.

## 테스트

부산대학교 자연대 연구실험동 건물

IndoorGML 파일 https://github.com/0vollov0/Visiable-IndoorGML/tree/master/IndoorGML 


