// MODULES 
 
//////////////////////////////////////? BUDGET CONTROLLER
var budgetController = (function (){
    
    //* DATA STRUCTURE
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }  
    };

    Expense.prototype.getPercentages = function(){
        return this.percentage;
    };

    var Income =  function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });
        data.totals[type] = sum;
    };

    //* public methods
    return {
        addItem: function(type, description, value){

            var newItem, ID;
            // Create  new ID
            if(data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // Create new item based on type (inc/exp)  
            if(type === 'exp'){
                newItem = new Expense(ID, description, value);
            } else if (type === 'inc'){
                newItem = new Income(ID, description, value);
            };
            //push it into data sartructure
            data.allItems[type].push(newItem);
            // return new element
            return newItem;
        },

        deleteItem(type, id){
            // map the array to get id to delete
            var ids = data.allItems[type].map(function(curr) {
                return curr.id
            });
            // we assign the id selected to a idx var to pass it to the splice method as 1st arg
            idx = ids.indexOf(id);

            //we may have an unsorted array, we'll use splice to start deleting from the id selected
            if(idx !== -1){
                data.allItems[type].splice(idx, 1);
            }
        },

        calculateBudget: function(){
            // total income & expenses calculation
            calculateTotal('inc');
            calculateTotal('exp');
            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentage of theincome we spent
            if(data.totals.inc > 0){
                //exp = 100, inc = 300, spent 33.333% = 100/300 = 0.3333 * 100
                data.percentage = Math.round((data.totals.exp / data.totals.inc * 100));
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentage: function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function(){
           var allPercentages =  data.allItems.exp.map(function(curr){
            return curr.getPercentages();
           });
           return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    }

})();

//////////////////////////////////////? UI CONTROLLER
var uiController = (function (){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, 3);
        }

        dec = numSplit[1];

        return ( type === 'exp' ? '-' : '+' ) + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return { //* making methods publics and accessibles
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };            
        },

        addListItem: function(obj, type){
            var html, newHtml, element;
            
            // create html string
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert html into the dom, in the list element
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem(slctrID){
            var el = document.getElementById(slctrID) 
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (curr, idx, arr){
                curr.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj){

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            // DOM manipulation
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expPercentage);

            nodeListForEach(fields, function(curr, idx){
                if(percentages[idx] > 0){
                    curr.textContent = percentages[idx] + '%';
                } else {
                    curr.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var now, year, month, months;        
            now = new Date();
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeColorType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

                nodeListForEach(fields, function(curr){
                    curr.classList.toggle('red-focus');
                })

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        }

    };
})();

//////////////////////////////////////////////////////?  <= GLOBAL APP CONTROLLER =>
var controller = (function(budgetCtlr, uiCtrl ){

    var setupEventListener = function(){
        var DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e){
            if(e.keyCode === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeColorType);
    };

    var updateBudget = function(){
        var budget;
        // calculate the budget
        budgetCtlr.calculateBudget();
        // retutn budget
        budget = budgetCtlr.getBudget();
        // display the budget on UI
        uiCtrl.displayBudget(budget);
        
    };

    var updatePercentage = function(){
        // calculate percentages
        budgetCtlr.calculatePercentage();
        // read percentages from budget controller
        var percentages = budgetCtlr.getPercentages();
        // update UI 
        uiCtrl.displayPercentages(percentages);
        
    };

    var ctrlAddItem = function(){
        var input, newItem;
        // get input data
        input = uiCtrl.getInput();
        // input validation
        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){
        // add the item to budgetController
        newItem = budgetCtlr.addItem(input.type, input.description, input.value);
        // add new item to UI
        uiCtrl.addListItem(newItem, input.type);
        // clear fields
        uiCtrl.clearFields();
        // Update budget
        updateBudget();
        // update percentages
        updatePercentage();
        }
    };
    // Event delegation
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // delete item from data
            budgetCtlr.deleteItem(type, ID);
            // delete item from UI
            uiCtrl.deleteListItem(itemID)
            //update budget
            updateBudget();
        }
    };

    return {
        init: function(){
            console.log('Application has started!');
            uiCtrl.displayMonth();
            setupEventListener();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };
    
})(budgetController, uiController);

controller.init();