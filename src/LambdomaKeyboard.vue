<template>
<div>
<!-- <h5>Lambdoma Keyboard</h5> -->
<!-- <input type="number" v-model="limit"/> -->

<table border="0">
    <tr v-for="i in limit">
        <td v-for="j in Math.round(limit/2)">
            <!-- <span>{{(normalize(freq(i,j))-1)*100}}</span> -->
            <audio-key keyName=""  :freq="mainFreq * freq(i,j)" :style="color(freq(i,j))"/>
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
            limit: 9,
            skipX:2,
            skipY:0,
            mainFreq: 432
        }
    },
    methods:{
        color(ratio){
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
        freq(i,j){
            var ratio = this.lambdoma(i,j,this.limit);
            //ratio = this.normalize(ratio);
            return ratio;
        },
        lambdoma(i,j,limit){
            return 1/(limit-i+2+this.skipY)*(j+1+this.skipX);
        },
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
