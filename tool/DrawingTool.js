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
import LineString from 'ol/geom/LineString'
import {Select,Translate,Modify} from 'ol/interaction'
import RotateFeatureInteraction from 'ol-rotate-feature'
import {Map, View} from 'ol';
import {click, pointerMove, shiftKeyOnly,always} from 'ol/events/condition';
import Transform from 'ol-ext/interaction/Transform';

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
            translateFeature: true,
            scale: true,
            rotate: true,
            keepAspectRatio: undefined,
            translate: true,
            stretch: true
          });
        
        this.interaction.on (['select'], (e) =>{
            this.selectedFeature = e.feature;
            //console.log(this.selectedFeature);
        });
          
        this.map.addInteraction(this.interaction);


        this.map.on('rendercomplete', ()=> {
            let pixel = this.map.getSize();
            this.centerPixel = [pixel[0]/2,pixel[1]/2];
            this.centerCoordinate = this.map.getCoordinateFromPixel(this.centerPixel);
        });
    }

    getCoordinatesFromSelectedFeatures(){
        if(this.selectedFeature == undefined) return undefined;
        
        let flatCoordinates = this.selectedFeature.values_.geometry.flatCoordinates;
        let ends_ = this.selectedFeature.values_.geometry.ends_;

        let converted_coordinate_array = new Array();
        for (let index = 0; index < ends_.length; index++) {
            const rare_element = index == 0 ? index : ends_[index-1];
            const element = ends_[index];
            let temp_array = flatCoordinates.slice(rare_element,element);
            converted_coordinate_array.push(temp_array.division(2));
        }
        return converted_coordinate_array;
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
        const point = new Feature({
            name: 'point',
            geometry: new Point([ 14367025.80544415, 4195356.01356387 ])
          })
          const line = new Feature({
            name: 'line',
            geometry: new LineString([ [ 14369739.31994827, 4196043.94681844 ], [ 14369225.75866448, 4195241.35802144 ] ])
          })
          const polygon = new Feature({
            name: 'polygon',
            geometry: new Polygon([[
                [14369394.279478746, 14369394.279478746],
                [14369393.42174834, 14369393.42174834],
                [14369401.386387812, 14369401.386387812],
                [14369402.162429607, 14369402.162429607],
                [14369394.279478746, 14369394.279478746]],
                [
                    [14367676.71451314, 4195137.45143612],
                    [14367628.94137046, 4194860.36720858],
                    [14368331.20656783, 4194688.38389494],
                    [14368536.63108135, 4195209.11115013]
                ]
            ])
          })
        
        //console.log(polygon.getGeometry().flatCoordinates);
          

        const testLayer = new VectorLayer({
            source: new VectorSource({
                projection: 'EPSG:33857',
                features: [ point, line, polygon ]
              })
        })

        this.map.addLayer(testLayer);
        
        
        var interaction = new Transform({
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
            translateFeature: true,
            scale: true,
            rotate: true,
            keepAspectRatio: undefined,
            translate: true,
            stretch: true
          });

          
        this.map.addInteraction(interaction);
        
        // this.map.on('rendercomplete', ()=> {
        //     let pixel = this.map.getSize();
        //     this.centerPixel = [pixel[0]/2,pixel[1]/2];
        //     this.centerCoordinate = this.map.getCoordinateFromPixel(centerPixel);
        //     console.log(this.centerCoordinate);
        // });
    }

    drawIndoorGML(indoorVectorArray){
        console.log(indoorVectorArray);
        
        const polygon = new Feature({
            name: 'polygon',
            geometry: new Polygon(indoorVectorArray)
        })

        const indoorLayer = new VectorLayer({
            source: new VectorSource({
                projection: 'EPSG:33857',
                features: [ polygon]
              })
        })
        //polygon.getGeometry().translate(this.centerCoordinate[0]-indoorVectorArray[0][0][0],this.centerCoordinate[1]-indoorVectorArray[0][0][1])
        this.map.setView(new View({
            center: [indoorVectorArray[0][0][0],indoorVectorArray[0][0][1]],
            zoom: 18
        }))
        this.map.addLayer(indoorLayer);
    }
    
}