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

export default class {
    constructor(map,userClickedPointsView) {
        this.map = map;
        this.circleLayerArray = new Array();
        this.polygonsLayerArray = new Array();
        this.userClickedPointsView = userClickedPointsView;
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

}