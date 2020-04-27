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
import {shiftKeyOnly,altKeyOnly, always} from 'ol/events/condition';
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
// Handle rotate on first point
let firstPoint = false;
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
                //this.popExtentCoordinates(this.selectedFeature.values_.state);
                this.selectedFeature.setGeometryName('state');
            }else if (this.selectedFeature.getGeometryName() == 'state') {
                //this.popExtentCoordinates(this.selectedFeature.values_.transition);
                this.selectedFeature.setGeometryName('transition');
            }else if (this.selectedFeature.getGeometryName() == 'transition') {
                //this.pushExtentCoordinates(this.selectedFeature);
                this.selectedFeature.setGeometryName('cellspace');
            }
        })
        

        this.interaction.on (['select'], (e) =>{
            this.selectedFeature = e.feature;
        });

        this.interaction.on (['rotatestart','translatestart'], function(e){
            // Translation
            delta=[0,0];
            scale =[0,0];
        });

        this.interaction.on (['rotatestart'], function(e){
            // Rotation
            angle = 0.0;
            for (let index = 0; index < 4; index++) {
                e.feature.values_.state.flatCoordinates.pop();
                e.feature.values_.transition.flatCoordinates.pop();
            }
            let targetFeaure = typeof e.feature.geometryName_ == 'string' ? e.feature.geometryName_ : e.feature.geometryName_[0];
            e.feature.setGeometryName('state');
            e.feature.setGeometryName('transition');
            e.feature.setGeometryName('cellspace');
            e.feature.setGeometryName(targetFeaure);
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
            console.log(this.interaction.getCenter());
            
        });

        this.interaction.on('rotateend',(e)=>{
            let targetFeaure = typeof e.feature.geometryName_ == 'string' ? e.feature.geometryName_ : e.feature.geometryName_[0];
            let featureTypeArray = ['cellspace','state','transition'];
            let idx = featureTypeArray.indexOf(targetFeaure);
            
            featureTypeArray.splice(idx,1);
            console.log([(e.feature.values_[targetFeaure].extent_[0]+e.feature.values_[targetFeaure].extent_[2])/2,(e.feature.values_[targetFeaure].extent_[1]+e.feature.values_[targetFeaure].extent_[2])/2]);
            featureTypeArray.map((feature)=>{
                //console.log(e.target.center_);
                //console.log([(e.feature.values_[feature].extent_[0]+e.feature.values_[feature].extent_[2])/2,(e.feature.values_[feature].extent_[1]+e.feature.values_[feature].extent_[2])/2]);
                
                e.feature.values_[feature].rotate(angle,e.target.center_);             
                
            })

            e.feature.setGeometryName('state');
            e.feature.setGeometryName('transition');
            e.feature.setGeometryName('cellspace');

            const cellspace_extent = e.feature.values_.cellspace.extent_;

            if (targetFeaure != 'cellspace') {
                for (let index = 0; index < 4; index++) {
                    e.feature.values_[targetFeaure].flatCoordinates.pop();
                }
            }
            
            e.feature.values_.state.appendPoint(new Point([cellspace_extent[0],cellspace_extent[1]]));
            e.feature.values_.state.appendPoint(new Point([cellspace_extent[2],cellspace_extent[3]]));
            e.feature.values_.transition.appendLineString(new LineString([[cellspace_extent[0],cellspace_extent[1]],[cellspace_extent[2],cellspace_extent[3]]]));

            e.feature.setGeometryName('state');
            e.feature.setGeometryName('transition');
            e.feature.setGeometryName('cellspace');

            e.feature.setGeometryName(targetFeaure);
        })

        this.interaction.on('translating', function (e){
            delta[0] += e.delta[0];
            delta[1] += e.delta[1];
        });

        this.interaction.on('translateend', function (e){
            //pushExtentCoordinates(e.feature);
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
            //this.centerPixel = [pixel[0]/2,pixel[1]/2];
            //this.centerCoordinate = this.map.getCoordinateFromPixel(this.centerPixel);
            console.log(this.map.previousExtent_[0]);
            
            //console.log(this.map.getCoordinateFromPixel(pixel));
            
            //console.log(this.map.getView());
            //console.log(this.centerCoordinate);
        });

        // this.select = new Select({
        //     condition: altKeyOnly
        //     // filter: (feature, layer) => {
        //     //     if (layer != null) layer.getSource().refresh();
        //     // }
        // })

        // this.map.addInteraction(this.select);
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

    drawIndoorGML(indoorGMLFile,indoorVectors){
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
        
        // this.map.setView(new View({
        //     center: [indoorVectors.polygons_array[0][0][0],indoorVectors.polygons_array[0][0][1]],
        //     zoom: 18
        // }))
        
        this.map.addLayer(indoorLayer);
        
        indoorGML.setGeometryName('state');
        indoorGML.setGeometryName('transition');
        indoorGML.setGeometryName('cellspace');
        indoorGML.set('indoorGMLFile',indoorGMLFile);
        
        const cellspace_extent = indoorGML.values_.cellspace.extent_;
        
        const map_center = this.map.getView().getCenter();
        const indoorGML_center = [(cellspace_extent[0]+cellspace_extent[2])/2,(cellspace_extent[1]+cellspace_extent[3])/2];

        indoorGML.values_.cellspace.translate(map_center[0]-indoorGML_center[0],map_center[1]-indoorGML_center[1]);
        indoorGML.values_.state.translate(map_center[0]-indoorGML_center[0],map_center[1]-indoorGML_center[1]);
        indoorGML.values_.transition.translate(map_center[0]-indoorGML_center[0],map_center[1]-indoorGML_center[1]);

        const indoorGML_width = cellspace_extent[2] - cellspace_extent[0];
        const indoorGML_heigth = cellspace_extent[3] - cellspace_extent[1];
        
        const map_width = this.map.previousExtent_[2] - this.map.previousExtent_[0];
        const map_heigth = this.map.previousExtent_[3] - this.map.previousExtent_[1];
        
        indoorGML.values_.cellspace.scale((map_width/indoorGML_width)/2,(map_heigth/indoorGML_heigth)/2);
        indoorGML.values_.state.scale((map_width/indoorGML_width)/2,(map_heigth/indoorGML_heigth)/2);
        indoorGML.values_.transition.scale((map_width/indoorGML_width)/2,(map_heigth/indoorGML_heigth)/2);
        
        indoorGML.values_.state.appendPoint(new Point([cellspace_extent[0],cellspace_extent[1]]));
        indoorGML.values_.state.appendPoint(new Point([cellspace_extent[2],cellspace_extent[3]]));
        indoorGML.values_.transition.appendLineString(new LineString([[cellspace_extent[0],cellspace_extent[1]],[cellspace_extent[2],cellspace_extent[3]]]));
        indoorGML.values_.state.extent_ = cellspace_extent;
        indoorGML.values_.transition.extent_ = cellspace_extent;
    }

    getSelectedFeatureFile(){
        if(this.selectedFeature == undefined) return null;
        return this.selectedFeature.values_.indoorGMLFile;
    }

    popExtentCoordinates(geometry){
        for (let index = 0; index < 4; index++) {
            //console.log(geometry.flatCoordinates.pop());
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




