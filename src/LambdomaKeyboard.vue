<template>
<div>
<!-- <h5>Lambdoma Keyboard</h5> -->
<!-- <input type="number" v-model="limit"/> -->


<table border="0">
    <tr>
        <td></td>
        <!-- <td v-for="j in limit"><small>{{j+skipX}}</small> </td> -->
        <td v-for="j in limit" v-bind:key="j"><small>{{j}}</small> </td>
    </tr>
    <tr v-for="i in limit" v-bind:key="i">
        <td v-if="i-1 >= currentRow && i-1 <= currentRow+2" style="background-color:#ff8080;"><small>{{i+skipY}}</small></td>
        <td v-else><small>{{i+skipY}}</small></td>
        <td v-for="j in Math.round(limit/1)" v-bind:key="j">
            <audio-key :keyName="getKeyName(i,j)" :text="getRatioText(i,j)"  :freq="mainFreq * ratio(i,j)" :style="color(i,j)"/>
            <!-- <div>{{getKeyName(i,j)}}</div> -->
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
            skipX:7,
            skipY:0,
            mainFreq: 432,
            currentRow: 0,
        }
    },
     mounted: function() {
        var _this = this;
        window.addEventListener("keydown", e => {
            var keyName = String.fromCharCode(e.keyCode);
            //console.log(e.keyCode);

            var r =  _this.currentRow;
            if(e.keyCode == 38 )
            {
               r--;
            }
            else if(e.keyCode == 40){
                r++;
            }

            if(r < 0){ r = 0;}
            if(r >= _this.limit){ r = _this.limit-1;}
            _this.currentRow = r;
        });
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

            //Scale vs Overtone
            // var scale = [1,1.125,1.25,4/3,1.5,5/3,15/8,2];
            // var idx = (j-1) % scale.length;
            // return (1/(i+this.skipY)) * scale[idx];

            //Scale vs Scale
            // var scale = [
            //     Math.pow(Math.pow(2,1/12),1),
            //     Math.pow(Math.pow(2,1/12),2),
            //     Math.pow(Math.pow(2,1/12),3),
            //     Math.pow(Math.pow(2,1/12),4),
            //     Math.pow(Math.pow(2,1/12),5),
            //     Math.pow(Math.pow(2,1/12),6),
            //     Math.pow(Math.pow(2,1/12),7),
            //     Math.pow(Math.pow(2,1/12),8),
            //     Math.pow(Math.pow(2,1/12),9),
            //     Math.pow(Math.pow(2,1/12),10),
            //     Math.pow(Math.pow(2,1/12),11),
            //     Math.pow(Math.pow(2,1/12),12),
            // ];
            //var scale = [1,1.25,1.5,1.875];
            var scale = [1,1.125,1.25,4/3,1.5,5/3,15/8];
            //var scale = [1,1.125,1.25,4/3,16/9]
            var idx = (j-1) % scale.length;
            var oct = Math.pow(2, Math.ceil((j) / scale.length)-1);

            var idx2 = (i-1) % scale.length;
            var oct2 = Math.pow(2, Math.ceil((i) / scale.length)-1);
            
            //Default Lambdoma
            //return (j+this.skipX)/(i+this.skipY);

            //Scale
            var scale = [1,9/8,5/4,4/3,3/2,5/3,15/8,2];
            var s = scale[Math.min(i-1,scale.length-1)];            
            //var r = s * (j+this.skipX)/8;

            //Scale 2
            var scale2 = [1,9/8,5/4,4/3,3/2,5/3,15/8,2];
            var s2 = scale2[Math.min(j-1,scale2.length-1)];
            var r = s * s2;

            //var r = Math.pow(1.5,i-1) * (j+this.skipX)/4;
            //return this.normalize(r/2);
            //return r/2;
            return r;
        },
        // lambdoma(i,j,limit){
        //     return 1/(i+1+this.skipY)*(j+1+this.skipX);
        // },

        getKeyName(i,j){

 var keys =[
                ['Q','W','E','R','T','Y','U','I'],
                ['A','S','D','F','G','H','J','K'],
                ['Z','X','C','V','B','N','M','¼']
            ];

            if(i-1 == this.currentRow){
                return keys[0][Math.min(j-1,7)];
            }
            else if(i-1 == this.currentRow+1){
                return keys[1][Math.min(j-1,7)];
            }
            else if(i-1 == this.currentRow+2){
                return keys[2][Math.min(j-1,7)];
            }
            else{
                return '-';
            }

           

           // var idx_i = Math.min(i,3);
            //var idx_j = Math.min(j,8);

            // if(i <= 3 && j <= 7){
            // return keys[i-1][j-1];
            // }
            // else{
            //     return '';
            // }

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
        },
        getRatioText(i,j){
            var ratio = this.ratio(i,j).toFixed(3);
            var normalized = this.normalize(ratio);
            var fraction = '';// (j+this.skipX) + "/" + (i+this.skipY);
            return fraction + " " + normalized;
        }
    }
}
</script>

<style>
table{
    width:100%;
    max-width:1200px;
}

table,tr,td{
    margin:0;
    padding:0;
}
</style>
