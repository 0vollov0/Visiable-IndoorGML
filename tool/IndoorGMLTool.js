export default class {
    constructor(){
        this.readed_indoorGML = null;
        this.primalSpaceFeatures = null;
        this.cellSpaceMember_array = [];
        this.linearRing_array = [];
    }

    // readFile = (file) => {
    //     var reader = new FileReader();
    //     reader.onload = () => {
    //         readed_indoorGML = reader.result;
    //         console.log(readed_indoorGML);
            
    //     }
    //     reader.readAsText(file,"euc-kr");
    // }

    readFile (file){
        var reader = new FileReader();
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

            console.log(this.linearRing_array[15]);
            
        }
        reader.readAsText(file,"euc-kr");
    }

    extractToTag (indoorGML_data,tagName) {
        if (indoorGML_data) {
            let start = indoorGML_data.indexOf(tagName);
            let end = indoorGML_data.indexOf(tagName.replace('<','</'));
            return indoorGML_data.substring(start, end + tagName.replace('<','</').length+1);
        }
        return null;
    }

}
