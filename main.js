import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';
import {MousePosition} from 'ol/control'
import {fromLonLat} from 'ol/proj';
import {createStringXY} from 'ol/coordinate'
import DrawingTool from './tool/DrawingTool'
import IndoorGMLTool from './tool/IndoorGMLTool'

var FileSaver = require('file-saver');
let indoorGMLTool = new IndoorGMLTool();


document.getElementById('file').addEventListener('change',(event)=>{
    indoorGMLTool.getIndoorGMLVectorArray(event.target.files[0]).then((vectorArray) => {
        drawingTool.drawIndoorGML(event.target.files[0],vectorArray);
        document.getElementById('file').value = null;
    })
})

document.getElementById('convet_indoorGML').addEventListener('click',()=>{
    //if(document.getElementById('file').files[0] == undefined )  return;
    let coordinateFromSelectedFeatures = drawingTool.getCoordinatesFromSelectedFeatures();
    if (coordinateFromSelectedFeatures == undefined) return;
    let indoorGMLFile = drawingTool.getSelectedFeatureFile();
    if (indoorGMLFile == undefined || indoorGMLFile == null)  return;
    
    indoorGMLTool.convertIndoorGMLVector(indoorGMLFile,coordinateFromSelectedFeatures).then((gml)=>{
        var blob = new Blob([gml], {type: "gml;charset=utf-8"});
        FileSaver.saveAs(blob, "converted_IndoorGML.gml");
        document.getElementById('file').value = null;
    });
})


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
        zoom: 16
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

