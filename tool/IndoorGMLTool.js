import xml2js from 'xml2js';

export default class {
    constructor(){
        this.readed_indoorGML = null;
        this.primalSpaceFeatures = null;
        this.cellSpaceMember_array = [];
        this.linearRing_array = [];
        this.polygons_array = [];
    }

    // readFile = (file) => {
    //     var reader = new FileReader();
    //     reader.onload = () => {
    //         readed_indoorGML = reader.result;
    //         console.log(readed_indoorGML);
            
    //     }
    //     reader.readAsText(file,"euc-kr");
    // }
    convertIndoorGMLVector(file,coordinateFromSelectedFeatures){
        return new Promise((resolve,reject)=>{
            var reader = new FileReader();
            reader.readAsText(file,"euc-kr");

            reader.onload = () => {
                this.readed_indoorGML = reader.result;

                var parser = new xml2js.Parser();
                parser.parseStringPromise(this.readed_indoorGML).then(function (result) {
                    //console.log(JSON.stringify(result));

                    //console.log(result['core:IndoorFeatures']['core:primalSpaceFeatures'][0]['core:PrimalSpaceFeatures'][0]);
                    let PrimalSpaceFeatures = result['core:IndoorFeatures']['core:primalSpaceFeatures'][0]['core:PrimalSpaceFeatures'][0];
                    let cellSpaceMemberList = PrimalSpaceFeatures['core:cellSpaceMember'];
                    
                    cellSpaceMemberList.map((cellSpaceMember, index)=>{
                        
                        //console.log(element[0]['core:cellSpaceGeometry'][0]['core:Geometry3D'][0]['core:Geometry3D'][0]['gml:Solid'][0]['gml:exterior'][0]['gml:Shell'][0]['gml:surfaceMember'][0]['gml:Polygon'][0]['gml:exterior'][0]['gml:LinearRing']);
                        //console.log(element['core:CellSpace'][0]['core:cellSpaceGeometry'][0]['core:Geometry3D'][0]['gml:Solid'][0]['gml:exterior'][0]['gml:Shell'][0]['gml:surfaceMember'][0]['gml:Polygon'][0]['gml:exterior'][0]['gml:LinearRing'][0]['gml:pos']);
                        let surfaceMemberList = cellSpaceMember['core:CellSpace'][0]['core:cellSpaceGeometry'][0]['core:Geometry3D'][0]['gml:Solid'][0]['gml:exterior'][0]['gml:Shell'][0]['gml:surfaceMember'];                        
                        let matchingPos = {};
                        surfaceMemberList.map((surfaceMember,surfaceMemberIndex)=>{
                            let posList = surfaceMember['gml:Polygon'][0]['gml:exterior'][0]['gml:LinearRing'][0]['gml:pos'];
                            posList.map((pos,posIndex)=>{
                                let splitedVector = pos['_'].split(' ');
                                splitedVector = splitedVector[0] + ' ' + splitedVector[1];
                                console.log(splitedVector);
                                
                                if (surfaceMemberIndex == 0){
                                    matchingPos[splitedVector] = posIndex;
                                    pos['_'] = coordinateFromSelectedFeatures[index][matchingPos[splitedVector]][0] + ' '+coordinateFromSelectedFeatures[index][matchingPos[splitedVector]][1]+' ' + pos['_'].split(' ')[2];
                                }else {
                                    if (matchingPos[splitedVector] != undefined){
                                        pos['_'] = coordinateFromSelectedFeatures[index][matchingPos[splitedVector]][0] + ' '+coordinateFromSelectedFeatures[index][matchingPos[splitedVector]][1]+' ' + pos['_'].split(' ')[2];
                                    } 
                                }
                            })
                        })
                    })
                    // console.log(coordinateFromSelectedFeatures[0][0]);
                    // console.log(result);
                    
                    var builder = new xml2js.Builder();
                    var xml = builder.buildObject(result);
                    
                    resolve(xml);
                })
                .catch(function (err) {
                    reject(err);
                });
            }
        })
    }

    getIndoorGMLVectorArray (file){
        return new Promise((resolve,reject)=>{
            var reader = new FileReader();
            reader.readAsText(file,"euc-kr");

            reader.onload = () => {
                this.readed_indoorGML = reader.result;
                this.primalSpaceFeatures = this.extractToTag(this.readed_indoorGML,'<core:PrimalSpaceFeatures');
                this.cellSpaceMember_array = this.primalSpaceFeatures.split('<core:cellSpaceMember>');
                this.cellSpaceMember_array.map(cellspaceMember => {
                    this.linearRing_array = this.linearRing_array.concat(this.extractToTag(cellspaceMember.split('<gml:Polygon>')[1],'<gml:LinearRing>'));
                })

                this.linearRing_array.map((linearRing,index)=>{
                    if (index > 0) {
                        let polygon_array = [];
                        let pos_array = linearRing.split('<gml:pos');
                        
                        pos_array.map((pos,index) =>{
                            if(index > 0) {
                                pos = this.extractContent(pos);
                                let polygon = pos.split(' ');
                                polygon.pop();
    
                                polygon[0] = parseFloat(polygon[0]);
                                polygon[1] = parseFloat(polygon[1]);
                                
                                polygon_array.push(polygon);
                            }
                        })
    
                        this.polygons_array.push(polygon_array);
                    }
                })
                resolve(this.polygons_array);
            }
        });
        

        reader.onload = () => {
            this.readed_indoorGML = reader.result;
            //console.log(this.readed_indoorGML);
            this.primalSpaceFeatures = this.extractToTag(this.readed_indoorGML,'<core:PrimalSpaceFeatures');
            // this.primalSpaceFeatures.split('<core:cellSpaceMember>').forEach((element,index) => {
            //     if (index == 0) continue;
            //     console.log(element);
            // });
            // this.cellSpaceMember_array = this.primalSpaceFeatures.split('<core:cellSpaceMember>');
            // this.cellSpaceMember_array.map

            // this.primalSpaceFeatures.split('<core:cellSpaceMember>').map((cellSpaceMember,index)=>{
            //     if (index != 0) this.cellSpaceMember_array = this.cellSpaceMember_array.concat(cellSpaceMember);
            // })

            this.cellSpaceMember_array = this.primalSpaceFeatures.split('<core:cellSpaceMember>');

            this.cellSpaceMember_array.map(cellspaceMember => {
                //console.log(cellspaceMember.split('<gml:LinearRing>')[1]);
                this.linearRing_array = this.linearRing_array.concat(this.extractToTag(cellspaceMember.split('<gml:Polygon>')[1],'<gml:LinearRing>'));
                //console.log(this.extractToTag(cellspaceMember.split('<gml:Polygon>')[1],'<gml:LinearRing>'));
            })

            //console.log(this.linearRing_array[15]);

            //console.log(this.extractContent(this.extractToTag(this.linearRing_array[15],'<gml:pos')));

            //console.log(this.extractToTag(this.linearRing_array[15],'<gml:pos'));

            //console.log(this.linearRing_array[15].split('<gml:pos srsDimension="3">')[0]);
            //console.log(this.linearRing_array[15].split('<gml:pos srsDimension="3">')[8]);
            

            this.linearRing_array.map((linearRing,index)=>{
                if (index > 0) {
                    let polygon_array = [];
                    let pos_array = linearRing.split('<gml:pos');
                    
                    pos_array.map((pos,index) =>{
                        if(index > 0) {
                            pos = this.extractContent(pos);
                            let polygon = pos.split(' ');
                            polygon.pop();

                            polygon[0] = parseFloat(polygon[0]);
                            polygon[1] = parseFloat(polygon[1]);

                            polygon_array.push(polygon);
                        }
                    })

                    this.polygons_array.push(polygon_array);
                }
            })
        }
    }

    extractToTag (indoorGML_data,tagName) {
        if (indoorGML_data) {
            let start = indoorGML_data.indexOf(tagName);
            let end = indoorGML_data.indexOf(tagName.replace('<','</'));
            return indoorGML_data.substring(start, end + tagName.replace('<','</').length+1);
        }
        return null;
    }

    extractContent(indoorGML_data){
        if (indoorGML_data) {
            let start = indoorGML_data.indexOf('>');
            let end = indoorGML_data.indexOf('</');
            return indoorGML_data.substring(start+1, end);
        }
    }

}
