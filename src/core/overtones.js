export default {
    generateOvertoneScale(overtoneNumber) {
        var scale = [];
        for (let i = 0; i <= overtoneNumber; i++) {
            var note = (overtoneNumber + i) / overtoneNumber;
            scale.push(note);
        }
        return scale;
    }
}