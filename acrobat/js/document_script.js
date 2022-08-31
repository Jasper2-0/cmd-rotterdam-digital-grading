/**
 * the config object sets a number of configuration options for the document script
 */
config = {
    'fieldName' : "ovgu",
    'o-strict' : true,
    'single-o-grade' : 5,
    'multiple-o-grade': 4,
};


 
/**
 * levels are the grading levels that are used in the evaluation.
 */
levels = {
    'o' : {
        'value' : 'Onvoldoende',
        'weight' : 4,
    },
    'v' : {
        'value' : 'Voldoende',
        'weight': 6,
    },
    'g' : {
        'value' : 'Goed',
        'weight' : 8,
    },
    'u' : {
        'value' : 'Uitstekend',
        'weight' : 10,
    }
};


/**
 * 
 * @param {*} levels 
 */
function setupGradeCalculator(levels) {

    var fields = [];
    /**
     * total_score field holds the total score based on how the student scored on the different evaluation criteria
     */
    fields.push({
        'name' : 'total_score',
        'action' : 'Calculate',
        'actionFunction' : 'event.value = calcTotalScore()'
    });
    /**
    *  final_grade field holds the final grade that is calculated based on the evaluation.
    */
    fields.push({
        'name' : 'final_grade',
        'action' : 'Calculate',
        'actionFunction' : 'event.value = calcFinalGrade()'
    });
    
    var calculatorFields = [
        {
            'name' : 'count',
            'action' : 'Calculate',
            'actionFunction' : 'countLevel',
        },{
            'name' : 'score',
            'action' : 'Calculate',
            'actionFunction' : 'calcScore'
        }
    ]

    var level_keys = Object.keys(levels);

    for (var i = 0; i < calculatorFields.length; i++) {
        var field = calculatorFields[i];
        for (var j = 0; j<level_keys.length;j++) {

            fields.push({
                'name': level_keys[j]+'_'+field.name,
                'action': 'Calculate',
                'actionFunction': "event.value = "+field.actionFunction+"('"+level_keys[j]+"')"
            });
        }
    }

    for (var i = 0; i < fields.length; i++) {
        var currentField = this.getField(fields[i].name);
        currentField.setAction(fields[i].action,fields[i].actionFunction);
    }
}

/**
 * 
 * @param {valueType} v 
 * @returns total count for Radiobuttons with that exact value set.
 */
function countRadioValues(v) {

    var testValue = this.levels[v].value;
    var groups = this.getField(config['fieldName']);
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
    var weight = levels[value].weight;
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
    
    var levelKeys = Object.keys(levels);
    var score = 0;

    for (var i = 0; i<levelKeys.length;i++) {
        score = score+calcScore(levelKeys[i]);
    }
 
    if(config['o-strict']) {
        if(countRadioValues('o') == 1) {
            score = config['single-o-grade']*countGroups(config['fieldName']);
        }
        if(countRadioValues('o') > 1) {
            score = config['multiple-o-grade']*countGroups(config['fieldName']);
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
            score = config['single-o-grade']*countGroups(config['fieldName']);
        }
        if(countRadioValues('o') > 1) {
            score = config['multiple-o-grade']*countGroups(config['fieldName']);
        }    
    }
 
    return score / countGroups(config['fieldName']); 

}

setupGradeCalculator(levels);