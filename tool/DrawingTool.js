import Circle from 'ol/geom/Circle';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import {
    Circle as CircleStyle,
    Style,
    Stroke,
    Fill
} from 'ol/style';
import Polygon from 'ol/geom/Polygon';

import Point from 'ol/geom/Point'
import MultiPoint from 'ol/geom/MultiPoint';
import LineString from 'ol/geom/LineString'
import MultiLineString from 'ol/geom/MultiLineString';
import { View} from 'ol';
import {shiftKeyOnly,altKeyOnly} from 'ol/events/condition';
import Transform from 'ol-ext/interaction/Transform';
import Select from 'ol/interaction/Select';


Array.prototype.division = function (n) {
    var arr = this;
    var len = arr.length;
    var cnt = Math.floor(len / n);
    var tmp = [];

    for (var i = 0; i < cnt; i++) {
        tmp.push(arr.splice(0, n));
    }

    return tmp;
}

let scale;
let angle;
let delta = [0,0];
export default class {
    constructor(map,userClickedPointsView) {
        this.map = map;
        this.circleLayerArray = new Array();
        this.polygonsLayerArray = new Array();
        this.userClickedPointsView = userClickedPointsView;

        this.interaction = new Transform({
            enableRotatedTransform: false,
            /* Limit interaction inside bbox * /
            condition: function(e, features) {
              return ol.extent.containsXY([-465960, 5536486, 1001630, 6514880], e.coordinate[0], e.coordinate[1]);
            },
            /* */
            addCondition: shiftKeyOnly,
            // filter: function(f,l) { return f.getGeometry().getType()==='Polygon'; },
            // layers: [vector],
            hitTolerance: 2,
            translateFeature: false,
            scale: true,
            rotate: true,
            keepAspectRatio: undefined,
            translate: true,
            stretch: true
          });
        
        
        

        this.interaction.on (['select'], (e) =>{
            this.selectedFeature = e.feature;
            console.log(e);
            
        });

        this.interaction.on (['rotatestart','translatestart'], function(e){
            // Rotation
            angle = 0.0;
            // Translation
            delta=[0,0];
            scale =[0,0];
          });

        this.interaction.on('scaling', function (e){
            scale = e.scale;
        });

        this.interaction.on('scaleend',(e)=>{
            let featureTypeArray = ['cellspace','state','transition'];
            featureTypeArray.map((feature)=>{
                if (feature != e.feature.geometryName_) {
                    e.feature.values_[feature].scale(scale[0],scale[1]);
                }               
            })
        })

        this.interaction.on('rotating',(e) => {
            angle = e.angle;
        });

        this.interaction.on('rotateend',(e)=>{
            let featureTypeArray = ['cellspace','state','transition'];
            featureTypeArray.map((feature)=>{
                if (feature != e.feature.geometryName_) {
                    e.feature.values_[feature].rotate(angle,e.target.center_);
                }               
            })
        })

        this.interaction.on('translating', function (e){
            delta[0] += e.delta[0];
            delta[1] += e.delta[1];
            //console.log(delta);
            // let featureTypeArray = ['cellspace','state','transition'];
            // featureTypeArray.map((feature)=>{
            //     if (feature != e.feature.geometryName_) {
            //         e.feature.values_[feature].translate(e.delta[0],e.delta[1]);
            //     }
            // })
        });

        this.interaction.on('translateend', function (e){
            //console.log(delta+'sss');
            
            let featureTypeArray = ['cellspace','state','transition'];
            featureTypeArray.map((feature)=>{
                if (feature != e.feature.geometryName_) {
                    e.feature.values_[feature].translate(delta[0],delta[1]);
                }
            })
            console.log(delta);
            

            //delta = [0,0];
        });



        this.map.addInteraction(this.interaction);


        this.map.on('rendercomplete', ()=> {
            let pixel = this.map.getSize();
            this.centerPixel = [pixel[0]/2,pixel[1]/2];
            this.centerCoordinate = this.map.getCoordinateFromPixel(this.centerPixel);
        });

        this.select = new Select({
            condition: altKeyOnly,
            filter: (feature, layer) => {
                if (layer != null) layer.getSource().refresh();
            }
        })

        this.map.addInteraction(this.select);
    }

    getCoordinatesFromSelectedFeatures(){
        if(this.selectedFeature == undefined) return undefined;
        let featureTypeArray = ['cellspace','transition'];
        let converted_features = {};
        featureTypeArray.map((feature)=>{
            let flatCoordinates = this.selectedFeature.values_[feature].flatCoordinates;
            let ends_ = this.selectedFeature.values_[feature].ends_;
            let converted_coordinate_array = new Array();

            for (let index = 0; index < ends_.length; index++) {
                const rare_element = index == 0 ? index : ends_[index-1];
                const element = ends_[index];
                let temp_array = flatCoordinates.slice(rare_element,element);
                converted_coordinate_array.push(temp_array.division(2));
            }
            converted_features[feature] = converted_coordinate_array;
        })
        let converted_coordinate_array = new Array();
        //converted_coordinate_array.push(this.selectedFeature.values_.state.flatCoordinates.division(2));
        converted_features['state'] = this.selectedFeature.values_.state.flatCoordinates.division(2);

        return converted_features;

        // let flatCoordinates = this.selectedFeature.values_.cellspace.flatCoordinates;
        // let ends_ = this.selectedFeature.values_.cellspace.ends_;

        // let converted_coordinate_array = new Array();
        // for (let index = 0; index < ends_.length; index++) {
        //     const rare_element = index == 0 ? index : ends_[index-1];
        //     const element = ends_[index];
        //     let temp_array = flatCoordinates.slice(rare_element,element);
        //     converted_coordinate_array.push(temp_array.division(2));
        // }
        //return converted_coordinate_array;
    }

    drawPolygons(coordinateJSON) {
        coordinateJSON.polygons.forEach(element => {
            let polygon = new Feature({
                geometry: new Polygon(element.polygon)
            });

            let vectorSource = new VectorSource({
                features: [polygon]
            });

            let styles = [
                new Style({
                    stroke: new Stroke({
                        color: 'blue',
                        width: 3
                    }),
                    fill: new Fill({
                        color: 'rgba(0, 0, 255, 0.1)'
                    })
                })
            ];

            let layer = new VectorLayer({
                source: vectorSource,
                style: styles
            });
            this.polygonsLayerArray.push(layer);
            this.map.addLayer(layer);
        });
    }

    drawCircle(coordinate) {
        this.integrityCircleData();
        let circle = new Circle(coordinate, 0.2);
        let CircleFeature = new Feature(circle);

        let vectorSource = new VectorSource({
            projection: 'EPSG:4326',
            features: [CircleFeature]
        });

        let styles = [
            new Style({
                stroke: new Stroke({ //두께
                    color: 'rgba( 240, 79, 79 ,0.9)',
                    width: 2
                }),
                fill: new Fill({ //채우기
                    color: 'rgba( 255, 133, 133 ,0.5)'
                })
            })
        ];

        let vectorLayer = new VectorLayer({ //추가할 벡터레이어
            source: vectorSource,
            style: styles
        });

        this.circleLayerArray.push(vectorLayer);

        this.map.addLayer(vectorLayer);
    }

    removeCircle() {
        this.map.removeLayer(this.circleLayerArray.pop());
    }

    removePolygons(){
        this.polygonsLayerArray.forEach(element => {
            this.map.removeLayer(element);
        });
    }

    initialize(containPolygonsFlag){
        this.circleLayerArray.forEach(element => {
            this.map.removeLayer(element);
        });
        this.circleLayerArray = new Array();
        this.userClickedPointsView.innerHTML = '';

        if(containPolygonsFlag) this.removePolygons();
    }

    integrityCircleData() {
        if (this.circleLayerArray.length > 3 || this.userClickedPointsView.children.length > 3) {
            for (let index = 0; index < this.circleLayerArray.length - 3; index++) {
                this.map.removeLayer(this.circleLayerArray[0]);
            }
            this.circleLayerArray = this.circleLayerArray.slice(0, 4).slice(1);
            while (this.userClickedPointsView.children.length > 3) {
                this.userClickedPointsView.removeChild(this.userClickedPointsView.children[0]);
            }
        }
    }

    test(){
        let aaa = [];
        
        aaa.push(new Point([14367025.80544415, 4195356.01356387]));
        aaa.push(new Point([14369739.31994827, 4196043.94681844]));

        let bbb = new Point([14367025.80544415, 4195356.01356387]);
        let ccc = new Point([14369739.31994827, 4196043.94681844]);
        //console.log(bbb);
        

        const point = new Feature({
            name: 'point',
            geometry: new MultiPoint([[14367025.80544415, 4195356.01356387],[14369739.31994827, 4196043.94681844]])
          })
          
        
        //point.values_.geometry.rotate(-1.4854454989904224,[14368378.53899116, 4195695.77489704]);
        point.values_.geometry.rotate(-1.4854454989904224,[14368383.07198703, 4195692.124328678]);
        

        const testLayer = new VectorLayer({
            source: new VectorSource({
                projection: 'EPSG:33857',
                features: [ point]
              })
        })

        this.map.addLayer(testLayer);
    
    }

    drawIndoorGML(indoorVectors){
        // console.log(indoorVectors.polygons_array);
        
        // indoorVectors.polygons_array.map(array=>{
        //     array.map(element=>{
                
        //     })
        // })

        const polygon = new Feature({
            name: 'indoorGML',
            cellspace: new Polygon(indoorVectors.polygons_array),
            state: new MultiPoint(indoorVectors.state_array),
            transition: new MultiLineString(indoorVectors.transitions_array),            
        })
        // polygon.setGeometryName('state');
        // polygon.setGeometryName('transition');
        // polygon.setGeometryName('cellspace');


        document.getElementById('change_mode').addEventListener('click',()=>{
            if (polygon.getGeometryName() == 'cellspace') {
                polygon.setGeometryName('state');
            }else if (polygon.getGeometryName() == 'state') {
                polygon.setGeometryName('transition');
            }else if (polygon.getGeometryName() == 'transition') {
                polygon.setGeometryName('cellspace');
            }
        })

        const indoorLayer = new VectorLayer({
            source: new VectorSource({
                projection: 'EPSG:33857',
                features: [ polygon]
              })
        })
        //polygon.getGeometry().translate(this.centerCoordinate[0]-indoorVectorArray[0][0][0],this.centerCoordinate[1]-indoorVectorArray[0][0][1])
        this.map.setView(new View({
            center: [indoorVectors.polygons_array[0][0][0],indoorVectors.polygons_array[0][0][1]],
            zoom: 18
        }))

        this.map.addLayer(indoorLayer);

        polygon.setGeometryName('state');
        polygon.setGeometryName('transition');
        polygon.setGeometryName('cellspace');

        const labelCoords = new Feature({
            name: 'point',
            geometry: new Point([ 14367025.80544415, 4195356.01356387 ])
          })
          const line = new Feature({
            name: 'line',
            geometry: new LineString([ [ 14369739.31994827, 4196043.94681844 ], [ 14369225.75866448, 4195241.35802144 ] ])
          })
          const polyCoords = new Feature({
            name: 'polygon',
            geometry: new Polygon([
                [
                    [14367676.71451314, 4195137.45143612],
                    [14367628.94137046, 4194860.36720858],
                    [14368331.20656783, 4194688.38389494],
                    [14368536.63108135, 4195209.11115013]
                ]
            ])
          })

        // var feature = new Feature({
        //     geometry: new Polygon( [
        //         [14367676.71451314, 4195137.45143612],
        //         [14367628.94137046, 4194860.36720858],
        //         [14368331.20656783, 4194688.38389494],
        //         [14368536.63108135, 4195209.11115013]
        //     ]),
        //     labelPoint: new Point([ 14367025.80544415, 4195356.01356387 ]),
        //     name: 'My Polygon'
        //   });
          
        //   // get the polygon geometry
        //   var poly = feature.getGeometry();
        //   console.log(poly);
          
        //   // Render the feature as a point using the coordinates from labelPoint
        //   feature.setGeometryName('labelPoint');
          
        //   // get the point geometry
        //   var point = feature.getGeometry();
        //   console.log(point);
    }

    

}
