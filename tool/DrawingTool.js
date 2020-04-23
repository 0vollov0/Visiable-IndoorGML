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
        
        document.getElementById('change_mode').addEventListener('click',()=>{
            if(this.selectedFeature == undefined) return;
            if (this.selectedFeature.getGeometryName() == 'cellspace') {
                this.selectedFeature.setGeometryName('state');
                //this.popExtentCoordinates(indoorGML.values_.state);
            }else if (this.selectedFeature.getGeometryName() == 'state') {
                this.selectedFeature.setGeometryName('transition');
                //this.popExtentCoordinates(indoorGML.values_.transition);
            }else if (this.selectedFeature.getGeometryName() == 'transition') {
                this.selectedFeature.setGeometryName('cellspace');
                //this.pushExtentCoordinates(indoorGML);
            }
        })
        

        this.interaction.on (['select'], (e) =>{
            this.selectedFeature = e.feature;
            console.log(e);
            console.log(this.selectedFeature);
            
        });

        this.interaction.on (['rotatestart','translatestart'], function(e){
            pushExtentCoordinates(e.feature);
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
            let targetFeaure = typeof e.feature.geometryName_ == 'string' ? e.feature.geometryName_ : e.feature.geometryName_[0];
            let featureTypeArray = ['cellspace','state','transition'];
            let idx = featureTypeArray.indexOf(targetFeaure);
            
            featureTypeArray.splice(idx,1);
            featureTypeArray.map((feature)=>{
                e.feature.values_[feature].scale(scale[0],scale[1]);
            })
        })


        this.interaction.on('rotating',(e) => {
            angle = e.angle;
        });

        this.interaction.on('rotateend',(e)=>{
            let targetFeaure = typeof e.feature.geometryName_ == 'string' ? e.feature.geometryName_ : e.feature.geometryName_[0];
            let featureTypeArray = ['cellspace','state','transition'];
            let idx = featureTypeArray.indexOf(targetFeaure);
            
            featureTypeArray.splice(idx,1);
            featureTypeArray.map((feature)=>{
                e.feature.values_[feature].rotate(angle,e.target.center_);             
            })
        })

        this.interaction.on('translating', function (e){
            delta[0] += e.delta[0];
            delta[1] += e.delta[1];
        });

        this.interaction.on('translateend', function (e){
            let targetFeaure = typeof e.feature.geometryName_ == 'string' ? e.feature.geometryName_ : e.feature.geometryName_[0];
            let featureTypeArray = ['cellspace','state','transition'];
            let idx = featureTypeArray.indexOf(targetFeaure);
            
            featureTypeArray.splice(idx,1);
            featureTypeArray.map((feature)=>{
                e.feature.values_[feature].translate(delta[0],delta[1]);
            })
            

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
    
    promiseScale(feature,scale){
        return new Promise((resolve, reject) => {
            feature.scale(scale[0], scale[1]);
            resolve(true);
        });
    }

    getCoordinatesFromSelectedFeatures(){
        if(this.selectedFeature == undefined) return undefined;

        for (let index = 0; index < 4; index++) {
            this.selectedFeature.values_['state'].flatCoordinates.pop();
            this.selectedFeature.values_['transition'].flatCoordinates.pop();   
        }

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
        converted_features['state'] = this.selectedFeature.values_.state.flatCoordinates.division(2);

        return converted_features;
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

    drawIndoorGML(indoorVectors){
        const indoorGML = new Feature({
            name: 'indoorGML',
            cellspace: new Polygon(indoorVectors.polygons_array),
            state: new MultiPoint(indoorVectors.state_array),
            transition: new MultiLineString(indoorVectors.transitions_array),            
        })

        const indoorLayer = new VectorLayer({
            source: new VectorSource({
                projection: 'EPSG:33857',
                features: [indoorGML]
              })
        })

        this.map.setView(new View({
            center: [indoorVectors.polygons_array[0][0][0],indoorVectors.polygons_array[0][0][1]],
            zoom: 18
        }))

        this.map.addLayer(indoorLayer);
        
        indoorGML.setGeometryName('cellspace');
        
        const cellspace_extent = indoorGML.values_.cellspace.extent_;
        
        indoorGML.values_.state.appendPoint(new Point([cellspace_extent[0],cellspace_extent[1]]));
        indoorGML.values_.state.appendPoint(new Point([cellspace_extent[2],cellspace_extent[3]]));
        indoorGML.values_.transition.appendLineString(new LineString([[cellspace_extent[0],cellspace_extent[1]],[cellspace_extent[2],cellspace_extent[3]]]));
    }

    popExtentCoordinates(geometry){
        for (let index = 0; index < 4; index++) {
            geometry.flatCoordinates.pop();
        }
    }

    pushExtentCoordinates(feature){
        const cellspace_extent = feature.values_.cellspace.extent_;
        feature.values_.state.appendPoint(new Point([cellspace_extent[0],cellspace_extent[1]]));
        feature.values_.state.appendPoint(new Point([cellspace_extent[2],cellspace_extent[3]]));
        feature.values_.transition.appendLineString(new LineString([[cellspace_extent[0],cellspace_extent[1]],[cellspace_extent[2],cellspace_extent[3]]]));
    }
}




