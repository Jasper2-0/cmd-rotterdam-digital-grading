/**
 * the config object sets a number of configuration options for the document script
 */
config = {
    'fieldName' : "ovgu",
    'o-strict' : false,
    'single-o-grade' : 5,
    'multiple-o-grade': 4,
};
/**
 * radioState is a global object for storing the state of the radiogroups when they're enabled / disabled.
 */

radioState = {};
 
/**
 * levels are the grading levels that are used in the evaluation.
 */
levels = {
    'o' : {
        'value' : 'onvoldoende',
        'weight' : 4,
    },
    'v' : {
        'value' : 'voldoende',
        'weight': 6,
    },
    'g' : {
        'value' : 'goed',
        'weight' : 8,
    },
    'u' : {
        'value' : 'uitstekend',
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
/**
 * 
 * @returns an array of all the fields that are of the type checkbox.
 */
function getCheckboxFields() {
   
    var checkboxFields = [];
   
    // iterate over all fields and if the type of the field is a checkbox, push in in the checkboxfields array.
    for (var i = 0; i< this.numFields; i++) {

        var currentFieldName =  this.getNthFieldName(i);
        var currentField = this.getField(currentFieldName);

        if(currentField.type == "checkbox") {
            checkboxFields.push(currentField);
        }
    }

    return checkboxFields;
}

function countCheckboxBooleans() {

    var checkboxFields = getCheckboxFields();
    var checkboxBooleans = []

    for (var i = 0; i<checkboxFields.length;i++) {
        var currentField = checkboxFields[i];
        switch (currentField.value) {
            case "Yes":
                checkboxBooleans.push(true);
                break;
            default:
                checkboxBooleans.push(false);
                break;
        }
    }

    return allTrue(checkboxBooleans);
}

function allTrue(arr) {
    for (var i = 0; i<arr.length;i++) {
        if (arr[i] === false) {
            return false
        } 

    }
    return true;
}

function enableRadioGroups() {
    // iterate over all radiogroups and enable them
    var radioGroups = this.getField("ovgu").getArray()

    for(var i = 0; i<radioGroups.length;i++) {
        var currentField = radioGroups[i];
        currentField.value = radioState[currentField.name];
        currentField.readonly = false;
    }

}

function disableRadioGroups() {
    // iterate over all radiogroups and disable them
    var radioGroups = this.getField("ovgu").getArray()

    for(var i = 0; i<radioGroups.length;i++) {
        var currentField = radioGroups[i];
        radioState[currentField.name] = currentField.value;
        currentField.readonly = true;
    }
}

function setupCheckBoxes() {
    var checkboxFields = getCheckboxFields()

    // add action to checkboxes
    for (var i = 0; i<checkboxFields.length;i++) {
        checkboxFields[i].setAction("MouseUp","checkboxAction();")
    }
}

function checkboxAction() {

    var checkboxState = countCheckboxBooleans(getCheckboxFields()); 

    if(checkboxState) {
        enableRadioGroups();

    } else {
        disableRadioGroups();

        // set all radiogroups to insufficient
        var radioGroups = this.getField("ovgu").getArray();

        for(var i = 0; i<radioGroups.length;i++) {
            var currentField = radioGroups[i];
            currentField.value = this.levels['o'].value;
        }
    }
}

function setupDocument() {
    setupGradeCalculator(levels);

    // if the document has checkboxes for 
    if(getCheckboxFields() != []) {
        setupCheckBoxes();
    }

}
setupDocument();