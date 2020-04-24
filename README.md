# Visiable-IndoorGML
 
## 설치 및 실행

```
npm install
```

```
npm start
```

```
Port : 3000
```

## 필요한 것

IndoorGML(.gml) file

## 사용법

IndoorGML file 입력

![1](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/1.PNG)

#### 기능

![2](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/2.PNG)

* Translate

* Scale

* Rotate

![3](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/3.PNG)

indoorGML Data Feature 에 매칭 되는 건물에 맞게 크기 및 위치를 수정해주세요.

Convert 버튼으로 조정된 위치 및 크기에 맞는 좌표 데이터를 새로운 파일로 다운 받을 수 있습니다.


## 모드

![4](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/4.PNG)

![5](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/5.PNG)

![6](https://github.com/0vollov0/Visiable-IndoorGML/blob/master/readme_image/6.PNG)

총 3가지 모드가 존재 합니다.

cellspace | state | transition

## 주의

* state | transition 모드 시에 오른쪽 상단 과 왼쪽 하단으로 이어지는 데이터는 좌표 변환시(Convert Button) 포함 되어 저장 되지 않습니다.

* 해당 프로그램은 2D 입니다. 높이 값은 0 으로 표현되고 저장시에는 원본의 높이 값을 그대로 가지고 저장 됩니다.

## 테스트

부산대학교 자연대 연구실험동 건물

IndoorGML 파일 https://github.com/0vollov0/Visiable-IndoorGML/tree/master/IndoorGML 

부산대학교 과확기술연구동

IndoorGML 파일 https://github.com/0vollov0/Visiable-IndoorGML/tree/master/IndoorGML 


