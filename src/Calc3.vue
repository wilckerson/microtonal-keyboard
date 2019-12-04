<template>
  <div>
    <h1>Calc3</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {
    this.calc();
  },
  methods: {
    calc() {
        console.clear();
      console.log("calc3");

      //var targetIntervals = [1.25, 1.5, 4/3, 5/3, 1.2, 1.6];
      //var targetIntervals = [4/3, 1.25, 1.2];
       var targetIntervals = [1.25, 1.5, 4/3, 1.6];
      var harmonicStart = 2;
      var harmonicLimit = 256;
      var minRelations = 2;

      var result = [];

      //Para cada harmônico
      for (let h = harmonicStart; h <= harmonicLimit; h++) {
        //Monta a escala
        var hScale = [];
        var scaleSize = h; //Uma oita
        //var scaleSize = h + h * 2; //Duas oitavas
        for (let scaleIdx = 0; scaleIdx <= scaleSize; scaleIdx++) {
          var note = (h + scaleIdx) / h;
          hScale.push(note);
        }

        var count = 0;
        var notesCount = {};
        //Verifica o intervalo entre cada uma das notas da escala
        for (let idxNoteA = 0; idxNoteA < hScale.length; idxNoteA++) {
          const noteA = hScale[idxNoteA];

          for (
            let idxNoteB = idxNoteA + 1;
            idxNoteB < hScale.length;
            idxNoteB++
          ) {
            const noteB = hScale[idxNoteB];

            var interval = noteB / noteA;
            //Contabiliza quantos destes intervalos está na lista de intervalos desejados
            if (
              targetIntervals.find(
                targetInterval => Math.abs(targetInterval - interval) < 0.001
              )
            ) {
              count++;

              var keyA = noteA.toFixed(4);
              notesCount[keyA] = (notesCount[keyA] || 0) + 1;

              var keyB = noteB.toFixed(4);
              notesCount[keyB] = (notesCount[keyB] || 0) + 1;
            }
          }
        }

var notesCountValues = Object.keys(notesCount)
.map(key => ({ key: key, value: notesCount[key]}))
.filter(item => minRelations > 0 ? (item.value >= minRelations) : true ) || [];

var filteredTotalCount = 0;
var notesCountFiltered = {};
notesCountValues.forEach(item => {
    notesCountFiltered[item.key] = item.value;
    filteredTotalCount +=  item.value
    });

//var notesCountValues = notesCountValuesPrep.sort((a,b) => a.value - b.value);

        // var notesCountValues = Object.values(notesCount)
        //     .filter(item => minRelations > 0 ? (item >= minRelations) : true )
        //     .sort()
        //     .reverse();

        var notesCountSize = (notesCountValues.length || 1);
        //var filteredTotalCount = notesCountValues.reduce((a, b) => a.value + b.value, 0) || 1;

        result.push({
          harmonic: h,
          //rank: (count / notesCountSize) / notesCountSize, //h + count,
          rank: (filteredTotalCount / notesCountSize), //h + count,
          count: filteredTotalCount,//count,
          notesCountSize: notesCountSize,
          scale: hScale,
          notesCount: notesCount,          
          notesCountList:notesCountValues.map(item => parseFloat(item.key)),
          notesCountValues:notesCountFiltered
        });
      }

      var sortedResult = result.sort(function(item1, item2) {
        // Sort by Rank
        if (item1.rank > item2.rank) return -1;
        if (item1.rank < item2.rank) return 1;

         // Sort by count
        // if (item1.count > item2.count) return -1;
        // if (item1.count < item2.count) return 1;

        // Sort by harmonic
        if (item1.harmonic > item2.harmonic) return 1;
        if (item1.harmonic < item2.harmonic) return -1;
      });

      console.log(sortedResult);
    }
  }
};
</script>