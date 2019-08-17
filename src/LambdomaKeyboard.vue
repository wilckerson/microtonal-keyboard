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

<p>
    {{resultList}}
</p>


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
            limit: 10,
            skipX:0,
            skipY:0,
            mainFreq: 200,
            currentRow: 0,
            resultList: []
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

            // var c = this.perc2color((normRatio-1)*100);
            // return "background:" + c + ";";
            var c = this.HSVtoRGB(normRatio-1,0.77,1);
            return "background:rgb("+c.r+","+c.g+","+c.b+");";
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
        HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
},
        
        ratio(row,col){

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
            //var scale = [1,1.125,1.25,4/3,1.5,5/3,15/8];
            //var scale = [1,1.125,1.25,4/3,16/9]
            //var idx = (j-1) % scale.length;
            //var oct = Math.pow(2, Math.ceil((j) / scale.length)-1);
            //var idx2 = (i-1) % scale.length;
            //var oct2 = Math.pow(2, Math.ceil((i) / scale.length)-1);
            
            //Default Lambdoma (UxO)
             var r = (col+this.skipX)/(10-row+this.skipY);
            //return r;

            //Default Lambdoma (OxU)
            //return (row+this.skipY)/(col+this.skipX);

            //Default Lambdoma (UxU)
            //return 1/(row+this.skipY)/(col+this.skipX);

             //Default Lambdoma (OxO)
            var r = (row+this.skipY)*(col+this.skipX);
            //return this.normalize(r)/2;


            //Scale
            //var scale = [8/8,9/8,10/8,11/8,12/8,13/8,14/8,15/8,16/8];
            //var scale = [ 1, 128/125, 5/4, 32/25, 25/16, 8/5, 125/64];
            //var scale = [1,9,5,11,3,7];
            //var scale = [1, 1.2, 1.25, 1.3333333333333333, 1.5, 1.6, 1.6666666666666667];
            //var scale = [9/9, 10/9, 11/9, 12/9, 13/9, 14/9, 15/9, 16/9, 17/9 , 18/9];
            //var scale = [1, 1.25, 4/3, 5/3]
            //var scale = [1,3,5,7,11,13,17]; //64/45
            
            //17EDO
            //var scale = [ 1 ,1.0416160106505838 ,1.084963913643637 ,1.1301157834293298 ,1.177146693908918 ,1.2261348432599308 ,1.2771616839560882 ,1.3303120581981223 ,1.3856743389806956 ,1.4433405770299568 ,1.5034066538560553 ,1.5659724411750875 ,1.631141966965551 ,1.6990235884354035 ,1.7697301721873244 ,1.8433792818817316 ,1.9200933737095873
            //Carlos Gamma
            var scale = [1,1.0413797439924106,1.0844717711976988,1.1293469354568555,1.1760790225246738,1.2247448713915892,1.2754245006257912,1.3282012399433345,1.383161867222592,1.4403967511883276,1.5000000000000004,1.5620696159886165,1.6267076567965486,1.694020403185284,1.7641185337870113,1.8371173070873845,1.9131367509386874,1.9923018599150024]; 
            
            //var scale = [1,16/15,9/8,6/5,5/4,4/3,45/32,3/2,8/5,5/3,7/4,15/8,2]; //64/45
            //var scale = [1, 1.044985, 1.118055, 1.168305, 1.25, 1.337468, 1.39757, 1.49537, 1.56250, 1.67191, 1.78882, 1.86929,2];
            //var scale = [1, 1.041665, 10/9, 5/4, 4/3, 1.3888888, 3/2, 1.5625, 5/3, 15/8,2];
            //var scale = [2,3,5,8,13,21,34]; //Fibonacci
            //var scale = [1,17,9,5,11,3,13,7,15];
            //var scale = [1,17,9,19,5,11,3,13,7,15];
            //var scale = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 1.41424142, 3/2, 8/5, 5/3, 16/9, 15/8, 2]
            //var scale = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2]
            //var scale = [1, 7/6, 6/5, 5/4, 4/3, 7/5, 3/2, 5/3, 7/4, 2]
            //var scale = [1,17,9,19,5,21,11,23,3,25,13,27,7,29,15,31,2]//             
            //var scale = [1, 1.0666666, 1.125, 1.171875, 1.25, 4/3, 1.40625, 1.5, 1.5625, 5/3, 1.757813, 15/8]
            //var scale = [12/12, 13/12, 14/12, 15/12, 16/12, 17/12, 18/12, 19/12, 20/12, 21/12, 22/12, 23/12, 24/12]            
             //var scale = [1, 1.2, 1.25, 1.5, 1.6]
             //var scale = [1, 1.25, 1.5, 1.777777]
             
             var s = scale[(col-1) % scale.length];            
             //var s = scale[Math.min(col-1,scale.length-1)];            
             //var r = s * (j+this.skipX)/8;

            //Scale 2
             //var scale2 = [8/8,9/8,10/8,11/8,12/8,13/8,14/8,15/8,16/8];
              //var scale2 = [ 1, 5/4, 32/25, 25/16, 8/5];
             //var scale2 = [1,16/15,9/8,6/5,5/4,4/3,45/32,3/2,8/5,5/3,16/9,15/8,2];
            //var scale2 = [1,1/3,1/5,1/7,1/11,1/13,1/17];
             //var scale2 = [1,9/8,8/7,7/6,6/5,5/4,9/7,4/3,7/5,3/2,8/5,5/3,7/4,9/5];
            // var scale2 = [1,16/15,8/7,6/5,5/4,4/3,Math.sqrt(2),3/2,8/5,5/3,7/4,15/8,2]
            //var scale2 = [1,1/17,1/9,1/19,1/5,1/11,1/3,1/13,1/7,1/15];
            //var scale2 = [1, 1/7,1/3,1/11,1/5, 1/9];
            //var scale2 = [1,17,9,5,11,3,13,7,15];
             //var scale2 = [2,3,5,8,13,21,34]; //Fibonacci
            //var scale2 = [1, 1.25, 1.3333333333333333, 1.6666666666666667];
            //var scale2 = [1,  1.25, 1.5, 1.875];
            //var scale2 = [1, 16/15, 9/8, 6/5, 5/4, 4/3, 1.41424142, 3/2, 8/5, 5/3, 16/9, 15/8, 2]
              //var scale2 = [1, 7/6, 6/5, 5/4, 4/3, 7/5, 3/2, 5/3, 7/4, 2]
              //var scale2 = [1, 1.6, 4/3, 5/3, 2]
              //var scale2 = [1, 1.2, 1.25, 1.5, 1.875, 9/4, 2.8125]
             //var scale2 = [1, 4/3, 1.5]
             //var scale2 = [12/12, 13/12, 14/12, 15/12, 16/12, 17/12, 18/12, 19/12, 20/12, 21/12, 22/12, 23/12, 24/12]
            //var scale2 = [1,1.2513882056240933,1.3303120581981225, 1.664736819428643,2, 2*1.2513882056240933]; 
            var scale2 = [1,1.249827834539069,1.3282012399433354, 1.6600228795504854, 1.9923018599150024, 1.9923018599150024*1.249827834539069]; //Carlos Gamma
            
            var s2 = scale2[(row-1) % scale2.length];

            //var s2 = scale[(row-1) % scale.length];
            var r = s * s2;

            //Tonality Diamond
            //var r = s / s2;

            //Lattice
            //var r = Math.pow(1.5, col-1) * Math.pow(1.25, row-1);
            //var r = Math.pow(4/3, col-1) * Math.pow(7/6, row-1); //JI
            //var r = Math.pow(1.33483985417, col-1) * Math.pow(1.18920711500272106, row-1); //12EDO
            //var r = Math.pow(1.32784882798910, col-1) * Math.pow(1.17061991471191, row-1); //22EDO

            //var r = Math.pow(1.5,i-1) * (j+this.skipX)/4;
            //r = this.normalize(r);
            
            if(this.resultList.indexOf(r) == -1){
                this.resultList.push(r);
                this.resultList.sort(function(a, b) { return a - b;});
            }

            return r;
            //return r;
        },
        // lambdoma(i,j,limit){
        //     return 1/(i+1+this.skipY)*(j+1+this.skipX);
        // },

        getKeyName(i,j){

 var keys =[
                ['Q','W','E','R','T','Y','U','I','O'],
                ['A','S','D','F','G','H','J','K','L'],
                ['Z','X','C','V','B','N','M','¼','¾']
            ];

            if(i-1 == this.currentRow){
                return keys[0][Math.min(j-1,8)];
            }
            else if(i-1 == this.currentRow+1){
                return keys[1][Math.min(j-1,8)];
            }
            else if(i-1 == this.currentRow+2){
                return keys[2][Math.min(j-1,8)];
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
            var ratio = this.ratio(i,j).toFixed(5);
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

table td{
    width:130px;
}
</style>
