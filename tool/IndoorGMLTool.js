import xml2js from 'xml2js';

export default class {
    constructor(){
        this.readed_indoorGML = null;
        this.primalSpaceFeatures = null;
        this.cellSpaceMember_array = [];
        this.linearRing_array = [];
    }

    convertIndoorGMLVector(file,coordinateFromSelectedFeatures){
        return new Promise((resolve,reject)=>{
            var reader = new FileReader();
            reader.readAsText(file,"euc-kr");

            reader.onload = () => {
                this.readed_indoorGML = reader.result;

                var parser = new xml2js.Parser();
                parser.parseStringPromise(this.readed_indoorGML).then(function (result) {
                    let cellSpaceCoordinateArray = coordinateFromSelectedFeatures.cellspace;
                    let PrimalSpaceFeatures = result['core:IndoorFeatures']['core:primalSpaceFeatures'][0]['core:PrimalSpaceFeatures'][0];
                    let cellSpaceMemberList = PrimalSpaceFeatures['core:cellSpaceMember'];
                    
                    cellSpaceMemberList.map((cellSpaceMember, index)=>{
                        let surfaceMemberList = cellSpaceMember['core:CellSpace'][0]['core:cellSpaceGeometry'][0]['core:Geometry3D'][0]['gml:Solid'][0]['gml:exterior'][0]['gml:Shell'][0]['gml:surfaceMember'];                        
                        let matchingPos = {};
                        surfaceMemberList.map((surfaceMember,surfaceMemberIndex)=>{
                            let posList = surfaceMember['gml:Polygon'][0]['gml:exterior'][0]['gml:LinearRing'][0]['gml:pos'];
                            posList.map((pos,posIndex)=>{
                                let splitedVector = pos['_'].split(' ');
                                splitedVector = splitedVector[0] + ' ' + splitedVector[1];
                                
                                if (surfaceMemberIndex == 0){
                                    matchingPos[splitedVector] = posIndex;
                                    pos['_'] = cellSpaceCoordinateArray[index][matchingPos[splitedVector]][0] + ' '+cellSpaceCoordinateArray[index][matchingPos[splitedVector]][1]+' ' + pos['_'].split(' ')[2];
                                }else {
                                    if (matchingPos[splitedVector] != undefined){
                                        pos['_'] = cellSpaceCoordinateArray[index][matchingPos[splitedVector]][0] + ' '+cellSpaceCoordinateArray[index][matchingPos[splitedVector]][1]+' ' + pos['_'].split(' ')[2];
                                    } 
                                }
                            })
                        })
                    })
                    
                    let stateCoordinateArray = coordinateFromSelectedFeatures.state;
                    let transitionCoordinateArray = coordinateFromSelectedFeatures.transition;

                    let multiLayeredGraph = result['core:IndoorFeatures']['core:multiLayeredGraph'][0]['core:MultiLayeredGraph'][0];
                    let spaceLayers = multiLayeredGraph['core:spaceLayers'];
                    let spaceLayerMemberList = spaceLayers[0]['core:spaceLayerMember'];
                    
                    let stateIndex = 0;
                    let transitionIndex = 0;
                    //console.log(transitionCoordinateArray);
                    
                    spaceLayerMemberList.map((spaceLayerMember)=>{
                        let nodes = spaceLayerMember['core:SpaceLayer'][0]['core:nodes'];
                        let stateMemberList = nodes[0]['core:stateMember'];
                        
                        stateMemberList.map((stateMember)=>{
                            //let state = stateMember['core:State'][0]['core:geometry'][0]['gml:Point'][0]['gml:pos'][0]['_'];              
                            let statePos = stateMember['core:State'][0]['core:geometry'][0]['gml:Point'][0]['gml:pos'];
                            statePos.map((pos)=>{
                                pos['_'] = stateCoordinateArray[stateIndex][0] + ' ' + stateCoordinateArray[stateIndex][1] + ' ' + pos['_'].split(' ')[2];
                            })
                            //state = stateCoordinateArray[stateIndex][0] + ' ' + stateCoordinateArray[stateIndex][1] + ' ' + state.split(' ')[2];
                            stateIndex++;
                        })

                        let edges = spaceLayerMember['core:SpaceLayer'][0]['core:edges'];
                        let transitionMemberList = edges[0]['core:transitionMember'];

                        if (transitionMemberList != undefined) {
                            transitionMemberList.map((transitionMember)=>{
                                let LineStringPosList = transitionMember['core:Transition'][0]['core:geometry'][0]['gml:LineString'][0]['gml:pos']
                                //console.log(LineStringPosList);
                                
                                // let transition_array = [];
                                LineStringPosList.map((pos,posIndex)=>{
                                    // let lineStringPos = pos['_'].split(' ');
                                    // lineStringPos.pop();
                                    pos['_'] = transitionCoordinateArray[transitionIndex][posIndex][0] + ' ' + transitionCoordinateArray[transitionIndex][posIndex][1] + ' ' + pos['_'].split(' ')[2];
    
                                    // lineStringPos[0] = parseFloat(lineStringPos[0]);
                                    // lineStringPos[1] = parseFloat(lineStringPos[1]);
    
                                    // transition_array.push(lineStringPos);
                                })
                                transitionIndex++;
                            })   
                        }
                    })
                    
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

    getIndoorGMLVectorArray(file){
        return new Promise((resolve,reject)=>{
            var reader = new FileReader();
            reader.readAsText(file,"euc-kr");
            let polygons_array = [];
            let state_array = [];
            let transitions_array = [];
            reader.onload = () => {
                this.readed_indoorGML = reader.result;

                var parser = new xml2js.Parser();

                parser.parseStringPromise(this.readed_indoorGML).then((result)=>{
                    let PrimalSpaceFeatures = result['core:IndoorFeatures']['core:primalSpaceFeatures'][0]['core:PrimalSpaceFeatures'][0];
                    let cellSpaceMemberList = PrimalSpaceFeatures['core:cellSpaceMember'];
                    
                    cellSpaceMemberList.map((cellSpaceMember, index)=>{
                        let surfaceMemberList = cellSpaceMember['core:CellSpace'][0]['core:cellSpaceGeometry'][0]['core:Geometry3D'][0]['gml:Solid'][0]['gml:exterior'][0]['gml:Shell'][0]['gml:surfaceMember'];                        
                        let polygon_array = [];
                        surfaceMemberList.map((surfaceMember,surfaceMemberIndex)=>{
                            if (surfaceMemberIndex == 0){
                                let posList = surfaceMember['gml:Polygon'][0]['gml:exterior'][0]['gml:LinearRing'][0]['gml:pos'];
                                posList.map(pos=>{
                                    let polygon = pos['_'].split(' ');
                                    polygon.pop();
    
                                    polygon[0] = parseFloat(polygon[0]);
                                    polygon[1] = parseFloat(polygon[1]);
                                    
                                    polygon_array.push(polygon);
                                })
                            }
                        })
                        polygons_array.push(polygon_array);
                    })

                    let multiLayeredGraph = result['core:IndoorFeatures']['core:multiLayeredGraph'][0]['core:MultiLayeredGraph'][0];
                    let spaceLayers = multiLayeredGraph['core:spaceLayers'];
                    let spaceLayerMemberList = spaceLayers[0]['core:spaceLayerMember'];
                    
                    spaceLayerMemberList.map((spaceLayerMember)=>{
                        let nodes = spaceLayerMember['core:SpaceLayer'][0]['core:nodes'];
                        let stateMemberList = nodes[0]['core:stateMember'];

                        stateMemberList.map((stateMember)=>{
                            let state = stateMember['core:State'][0]['core:geometry'][0]['gml:Point'][0]['gml:pos'][0]['_'].split(' ');
                            state.pop();
                            
                            state[0] = parseFloat(state[0]);
                            state[1] = parseFloat(state[1]);

                            state_array.push(state);
                        })
                        
                        let edges = spaceLayerMember['core:SpaceLayer'][0]['core:edges'];
                        let transitionMemberList = edges[0]['core:transitionMember'];

                        if (transitionMemberList != undefined) {
                            transitionMemberList.map((transitionMember)=>{
                                let LineStringPosList = transitionMember['core:Transition'][0]['core:geometry'][0]['gml:LineString'][0]['gml:pos']
                                let transition_array = [];
                                LineStringPosList.map((pos)=>{
                                    let lineStringPos = pos['_'].split(' ');
                                    lineStringPos.pop();

                                    lineStringPos[0] = parseFloat(lineStringPos[0]);
                                    lineStringPos[1] = parseFloat(lineStringPos[1]);

                                    transition_array.push(lineStringPos);
                                })
                                transitions_array.push(transition_array);
                            })   
                        }

                    })
                    
                    let interEdges = result['core:interEdges'];                    
                })
                
                let returnData = {};
                returnData.polygons_array = polygons_array;
                returnData.state_array = state_array;
                returnData.transitions_array = transitions_array;

                resolve(returnData);
            }
        })
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
