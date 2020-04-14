import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSMSource from 'ol/source/OSM';
import XYZSource from 'ol/source/XYZ';
import {MousePosition} from 'ol/control'
import {fromLonLat} from 'ol/proj';
import {createStringXY} from 'ol/coordinate'
import point from 'ol/geom/Point';
import DrawingTool from './tool/DrawingTool'
import IndoorGMLTool from './tool/IndoorGMLTool'
import Projection from 'ol/proj/Projection';
var FileSaver = require('file-saver');




let userClickedPointsView = document.getElementById('user-clicked-points');
let indoorGMLTool = new IndoorGMLTool();


document.getElementById('file').addEventListener('change',(event)=>{
    indoorGMLTool.getIndoorGMLVectorArray(event.target.files[0]).then((vectorArray) => drawingTool.drawIndoorGML(vectorArray))
})

document.getElementById('convet_indoorGML').addEventListener('click',()=>{
    if(document.getElementById('file').files[0] == undefined )  return;
    let coordinateFromSelectedFeatures = drawingTool.getCoordinatesFromSelectedFeatures();
    if (coordinateFromSelectedFeatures == undefined) return;
    indoorGMLTool.convertIndoorGMLVector(document.getElementById('file').files[0],coordinateFromSelectedFeatures).then((gml)=>{
        var blob = new Blob([gml], {type: "gml;charset=utf-8"});
        FileSaver.saveAs(blob, "converted_IndoorGML.gml");
        document.getElementById('file').value = null;
    });
})

// document.getElementById('send-button').addEventListener('click',()=>{    
//     let coordinates = {};
//     let left = null;
//     let right = null;
//     let top = null;
//     let bottom = null;

//     Array.from(userClickedPointsView.children).forEach((element) => {
//         let coordinate = element.innerText.split(',');
//         if (left == null || parseFloat(coordinate[0]) < left) {left = coordinate[0]; coordinates.left = element.innerText;}
//         if (right == null || parseFloat(coordinate[0]) > right) {right = coordinate[0]; coordinates.right = element.innerText;}
//         if (top == null || parseFloat(coordinate[1]) > top) {top = coordinate[1]; coordinates.top = element.innerText;}
//         if (bottom == null || parseFloat(coordinate[1]) < bottom) {bottom = coordinate[1]; coordinates.bottom = element.innerText;}
//     });

//     coordinates = JSON.stringify(coordinates);  
//     let data = new FormData();
//     data.append('indoorGML',document.getElementById('indoorGML-file').files[0]);
//     data.append('coordinates',coordinates);
    
//     fetch('http://localhost:9000/IndoorGML',{
//         method : 'POST',
//         body : data
//     }).then(res => res.json())
//     .then(polygonDatas => {
//         console.log(polygonDatas);
        
//         drawingTool.drawPolygons(polygonDatas);
//         drawingTool.initialize(false);
//         document.getElementById('indoorGML-file').value = null
//     }).then(()=>{
//         fetch('http://localhost:9000/IndoorGML')
//         .then(response => response.blob())
//         .then(blob => {
//             var url = window.URL.createObjectURL(blob);
//             var a = document.createElement('a');
//             a.href = url;
//             a.download = "converted_indoorGML.gml";
//             document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
//             a.click();    
//             a.remove();  //afterwards we remove the element again         
//         });
//     })
// })

// document.getElementById('initialize-button').addEventListener('click',()=>{
//     drawingTool.initialize(true);
//     document.getElementById('indoorGML-file').value = null
// })


const map = new Map({
    target: 'map-container',
    layers: [
        new TileLayer({
            source: new XYZSource({
                url: 'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}'
            })
        })
    ],
    view: new View({
        center: fromLonLat([129.0827, 35.2325]),
        zoom: 20
    })
    
});

let drawingTool = new DrawingTool(map,document.getElementById('user-clicked-points'));

let mousePositionCtrl = new MousePosition({
    coordinateFormat: createStringXY(8),
    projection: 'EPSG:3857',
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;'
});

map.addControl(mousePositionCtrl);

// map.addEventListener('click',(event)=>{
//     let coordinate = mousePositionCtrl.element.innerText.split(',');
//     let pnt = new point([parseFloat(coordinate[0]),parseFloat(coordinate[1])]).transform('EPSG:4326', 'EPSG:3857');    
//     let changePoints = pnt.getCoordinates();
    
//     console.log(changePoints);

//     drawingTool.drawCircle(changePoints);

//     let ul = document.createElement('ul');
//     ul.innerText = mousePositionCtrl.element.innerText;
//     userClickedPointsView.appendChild(ul);
// })

// map.addEventListener('contextmenu',(event)=>{
//     event.preventDefault();

//     if (userClickedPointsView.childElementCount < 1) return;
//     drawingTool.removeCircle();

//     userClickedPointsView.removeChild(userClickedPointsView.children[userClickedPointsView.childElementCount-1]);
// })

// map.on('pointerdrag',(e)=>{
//     console.log(e);
// })

//drawingTool.test();

  

