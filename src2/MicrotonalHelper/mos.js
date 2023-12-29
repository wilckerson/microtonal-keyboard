//import * as ArgumentValidator from "argument-validator";
import * as operations from "./operations.js";

export function generateMos(mosMode, period, stepRatio) {
    // ArgumentValidator.string(mosMode, "mosMode");
    // ArgumentValidator.number(period, "period");
    // ArgumentValidator.number(stepRatio, "stepRatio");

    var parts = mosMode.split('');
    var s_count = parts.filter(i => i === 's').length || 0;
    var L_count = parts.filter(i => i === 'L').length || 0;
    var periodInCents = operations.ratioToCents(period || 2);

    //Formula
    //(s_count * s_value) + (l_count * l_value) = periodInCents
    //where l_value = s_value * stepRatio
    var s_value = periodInCents / (s_count + (L_count * stepRatio));
    var l_value = s_value * stepRatio;

    var ratiosArr = [1];
    var currentValue = 0;
    for (let p = 0; p < parts.length - 1; p++) {
        const part = parts[p];
        if (part === 's') {
            currentValue += s_value;
            var r = operations.centsToRatio(currentValue);
            ratiosArr.push(r);
        }
        else if (part === 'L') {
            currentValue += l_value;
            var r = operations.centsToRatio(currentValue);
            ratiosArr.push(r);
        }
    }
    return ratiosArr;
}
