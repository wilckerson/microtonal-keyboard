<template>
  <div>
    <h1>Calc3</h1>
  </div>
</template>

<script>
import overtones from "./core/overtones";

export default {
  data() {
    return {};
  },
  created() {
    //this.calc();
    this.calcV2();
  },
  methods: {
    getDivisorsCnt(n) {
      var numDivisors = 1;
      var factor = 2; // Candidate for prime factor of `n`

      // If `n` is not a prime number then it must have one factor
      // which is <= `sqrt(n)`, so we try these first:
      while (factor * factor <= n) {
        if (n % factor === 0) {
          // `factor` is a prime factor of `n`, determine the exponent:
          var exponent = 0;
          do {
            n /= factor;
            exponent++;
          } while (n % factor === 0);
          // `factor^exponent` is one term in the prime factorization of n,
          // this contributes as factor `exponent + 1`:
          numDivisors *= exponent + 1;
        }
        // Next possible prime factor:
        factor = factor == 2 ? 3 : factor + 2;
      }

      // Now `n` is either 1 or a prime number. In the latter case,
      // it contributes a factor 2:
      if (n > 1) {
        numDivisors *= 2;
      }

      return numDivisors;
    },
    calcV2(){
      console.clear();
      console.log("calc3 v2");

      
    },
    calc() {
      console.clear();
      console.log("calc3");

      //var targetIntervals = [1.25, 1.5, 4/3, 5/3, 1.2, 1.6];
      //var targetIntervals = [4/3, 1.25, 1.2];
      var targetIntervals = [1.2, 1.25, 1.5];
      //var targetIntervals = [1.25, 1.5, 4 / 3, 1.6];
      var harmonicStart = 2;
      var harmonicLimit = 64;
      var minRelations = 2;
      var divisorsBased = false;

      var result = [];

      //Para cada harmônico
      for (let h = harmonicStart; h <= harmonicLimit; h++) {
        var rScale = [];
        //Monta a escala
        var hScale = [];
        var scaleSize = h; //Uma oitava
        //var scaleSize = h + h * 2; //Duas oitavas
        for (let scaleIdx = 0; scaleIdx <= scaleSize; scaleIdx++) {
          var note = (h + scaleIdx) / h;
          //var note = (h + scaleIdx);
          hScale.push(note);
        }

        var count = 0;
        var notesCount = {};
        //Verifica o intervalo entre cada uma das notas da escala
        for (let idxNoteA = 0; idxNoteA < hScale.length; idxNoteA++) {
          const noteA = hScale[idxNoteA];

          //Calculo baseado nos divisores
          if (divisorsBased) {
            var divisorsCount = this.getDivisorsCnt(noteA * h);
            var keyA = noteA.toFixed(4);
            notesCount[keyA] = divisorsCount;
          } else {
            var tempScale = [noteA];

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

                tempScale.push(noteB);

                //var keyB = noteB.toFixed(4);
                //notesCount[keyB] = (notesCount[keyB] || 0) + 1;
              }
            }
          }

          if(tempScale.length -1 >= minRelations){
            rScale = rScale.concat(tempScale);
          }
        }

        var notesCountValues =
          Object.keys(notesCount)
            .map(key => ({ key: key, value: notesCount[key] }))
            .filter(item =>
              minRelations > 0 ? item.value >= minRelations : true
            ) || [];

        var filteredTotalCount = 0;
        var notesCountFiltered = {};
        notesCountValues.forEach(item => {
          notesCountFiltered[item.key] = item.value;
          filteredTotalCount += item.value;
        });


        var rScaleUnique = rScale.filter((value, index, self) => self.indexOf(value) === index);

        //var notesCountValues = notesCountValuesPrep.sort((a,b) => a.value - b.value);

        // var notesCountValues = Object.values(notesCount)
        //     .filter(item => minRelations > 0 ? (item >= minRelations) : true )
        //     .sort()
        //     .reverse();

        var notesCountSize = notesCountValues.length || 1;
        //var filteredTotalCount = notesCountValues.reduce((a, b) => a.value + b.value, 0) || 1;

        result.push({
          harmonic: h,
          //rank: (count / notesCountSize) / notesCountSize, //h + count,
          //rank: filteredTotalCount / notesCountSize, //h + count,
          rank: 1/((rScaleUnique.length / h) || 1), //h + count,
          count: filteredTotalCount, //count,
          rScaleUnique : rScaleUnique.sort(),
          notesCountSize: notesCountSize,
          scale: hScale,
          //notesCount: notesCount,
          notesCountList: notesCountValues
            .map(item => parseFloat(item.key))
            .sort(),
          notesCountValues: notesCountFiltered,
        });
      }

      var sortedResult = result.sort(function(item1, item2) {
        // Sort by Rank
        if (item1.rank > item2.rank) return -1;
        if (item1.rank < item2.rank) return 1;

        // Sort by count
        // if (item1.count > item2.count) return -1;
        // if (item1.count < item2.count) return 1;

        // // Sort by harmonic
        // if (item1.harmonic > item2.harmonic) return 1;
        // if (item1.harmonic < item2.harmonic) return -1;
      });

      console.log(sortedResult);
    }
  }
};
</script>