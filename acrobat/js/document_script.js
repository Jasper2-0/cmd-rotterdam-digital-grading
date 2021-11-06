/**
 * the config object sets a number of configuration options for the document script
 * 
 *  
 * 
 */
config = {};

config['fieldNames'] = "ovgu";
config['o-strict'] = true;
config['single-o-grade'] = 5;
config['multiple-o-grade'] = 4;
 
/**
 * 
 */
ovgu = {};

ovgu['o'] = {};
ovgu['o'].value = "Onvoldoende";
ovgu['o'].weight = 4;

ovgu['v'] = {};
ovgu['v'].value = "Voldoende";
ovgu['v'].weight = 6;

ovgu['g'] = {};
ovgu['g'].value = "Goed";
ovgu['g'].weight = 8;

ovgu['u'] = {};
ovgu['u'].value = "Uitstekend";
ovgu['u'].weight = 10;

/**
 * 
 * @param {valueType} v 
 * @returns total count for Radiobuttons with that exact value set.
 */
function countRadioValues(v) {

    var testValue = this.ovgu[v].value;
    var groups = this.getField(config['fieldNames']);
    var arr = groups.getArray();
    var cnt = 0;
    for (var i=0; i<arr.length; i++) {
        if (arr[i].value == testValue) {
            cnt++;
        }
    } 
    return cnt;
}
/**
 * 
 * @param {*} groupName 
 * @returns 
 */
function countGroups(groupName) {
    return this.getField(groupName).getArray().length;
}
/**
 * 
 * @param {*} v 
 * @returns 
 */
function countLevel(v) {
    count = countRadioValues(v);

    if(config['o-strict']) {
        if(countRadioValues('o') > 0) {
            count = '-';
        }
    }
    return count;
}
/**
 * 
 * @param {*} value 
 * @returns 
 */

function calcScore(value) {

    var count = countRadioValues(value);
    var weight = ovgu[value].weight;
    var score  = count*weight

    if(config['o-strict']) {
        if(countRadioValues('o') > 0) {
            score = '-';
        }
    }
    return score;
}
/**
 * 
 * @returns 
 */
function calcTotalScore() {
    
    var levels = Object.keys(ovgu);
    var score = 0;

    for (var i = 0; i<levels.length;i++) {
        score = score+calcScore(levels[i]);
    }
 
    if(config['o-strict']) {
        if(countRadioValues('o') == 1) {
            score = config['single-o-grade']*countGroups(config['fieldNames']);
        }
        if(countRadioValues('o') > 1) {
            score = config['multiple-o-grade']*countGroups(config['fieldNames']);
        }    
    }

    return score;
}
/**
 * 
 * @returns a final grade based on range of values set in the ovgu object
 */
function calcFinalGrade() {
    
    var score = calcTotalScore();
 
    if(config['o-strict']) {
        if(countRadioValues('o') == 1) {
            score = config['single-o-grade']*countGroups(config['fieldNames']);
        }
        if(countRadioValues('o') > 1) {
            score = config['multiple-o-grade']*countGroups(config['fieldNames']);
        }    
    }
 
    return score / countGroups(config['fieldNames']); 

}