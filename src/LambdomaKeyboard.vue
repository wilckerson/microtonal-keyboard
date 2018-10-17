<template>
<div>
<!-- <h5>Lambdoma Keyboard</h5> -->
<!-- <input type="number" v-model="limit"/> -->

<table border="0">
    <tr>
        <td></td>
        <td v-for="j in limit"><small>{{j+skipX}}</small> </td>
    </tr>
    <tr v-for="i in limit">
        <td><small>{{i+skipY}}</small></td>
        <td v-for="j in Math.round(limit/1)">
            <audio-key :keyName="keyName(i,j)"  :freq="mainFreq * ratio(i,j)" :style="color(i,j)"/>
            
        </td>
    </tr>
</table>



</div>
</template>

<script>
import AudioKey from "./AudioKey.vue";

export default {
    components: {
        AudioKey
    },
    data(){
        return {
            model: 1,
            limit: 8,
            skipX:3,
            skipY:3,
            mainFreq: 432
        }
    },
    methods:{
        color(i,j){
            var ratio = this.ratio(i,j);
            var normRatio = this.normalize(ratio);
            // var r = normRatio * 255 / 2;
            // var g = normRatio * (255/3) / 2;
            // var b = normRatio * (255/2) / 2;
            // return "background:rgb("+r+","+g+","+b+");";
            var c = this.perc2color((normRatio-1)*100);
            return "background:" + c + ";";
        },
        perc2color(perc) {
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
    }
    b = 64;
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
},
        
        ratio(i,j){
            
            return (j+this.skipX)/(i+this.skipY);
        },
        // lambdoma(i,j,limit){
        //     return 1/(i+1+this.skipY)*(j+1+this.skipX);
        // },
        normalize(v){
            if(v >= 2){
                while(v >= 2){
                    v = v / 2;
                }
            }
            else if(v < 1){
                while(v < 1){
                    v = v * 2;
                }
            }
            return v;
        },
        keyName(i,j){
            var ratio = this.ratio(i,j).toFixed(3);
            var normalized = this.normalize(ratio);
            var fraction = (j+this.skipX) + "/" + (i+this.skipY);
            return fraction + " " + normalized;
        }
    }
}
</script>

<style>
table{
    width:100%;
    max-width:980px;
}

table,tr,td{
    margin:0;
    padding:0;
}
</style>
