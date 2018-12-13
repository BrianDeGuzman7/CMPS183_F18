// This is the js for the default/index.html view.
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.set_budget = function() {
        console.log(self.vue.budget);
        console.log(self.vue.form_title);
        var num2 = parseInt(self.vue.budget);
        var num1 = parseInt(self.vue.post_total);
        if (isNaN(num2)){
            return false;
        }
        if (self.vue.form_title == ""){
            alert("Enter Budget Title");
            return false;
        }
        self.vue.budget = num2;
        self.vue.post_total = num2;
        self.add_post();
        alert("Budget Added. Press Back to Return to Budget Page");

    };

    self.add_nums = function() {
        console.log(self.vue.post_total);
        var num1 = parseInt(self.vue.post_total);
        var num2 = parseInt(self.vue.budget);
        if (isNaN(num2)){
            return false;
        }
        self.vue.budget = self.vue.budget + num2;
        self.add_post();

    };

    self.clear_budget = function() {
        $.getJSON(delete_list_url,
            function (data){
                self.get_posts();
            }
        );
    };

    self.sub_nums = function() {
        var num1 = parseInt(self.vue.post_total);
        var num2 = parseInt(self.vue.form_amount);
        if (isNaN(num2)){
            return false;
        }
        if (self.vue.form_title == "" || self.vue.form_category==""){
            alert("Fill Missing Fields");
            return false;
        }
        self.vue.post_total  = num1 - num2;
        console.log(self.vue.post_total);
        self.add_post();
        alert("Transaction Added. Press Back to Return to Budget Page");
    };

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy 
        var sent_category = self.vue.form_category; //
        var sent_amount = self.vue.post_total;
        var sent_expense = self.vue.form_amount;
        var sent_budget = self.vue.budget;

        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_category: self.vue.form_category,
                post_total: self.vue.post_total,
                post_expense: self.vue.form_amount,
                post_budget: self.vue.budget
            },
            // What do we do when the post succeeds?
            function (data) {
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_amount = "";
                // Adds the post to the list of posts. 
                var new_post = {
                    id: data.post_id,
                    post_title: sent_title,
                    post_category: sent_category,
                    post_total: sent_amount,
                    post_expense: sent_expense,
                    post_budget: sent_budget,
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_posts = function() {
        $.getJSON(get_post_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                if(self.vue.post_list.length > 0){
                    self.vue.post_total = self.vue.post_list[0].post_total;
                    //console.log(self.vue.post_total);
                }
                console.log(self.vue.post_list.length);
                console.log("I got my list");
            }
        );
        console.log("I fired the get");
    };

    self.process_posts = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts. 
        // We add the _idx attribute to the posts. 
        enumerate(self.vue.post_list);
        // We initialize the smile status to match the like. 
        self.vue.post_list.map(function (e) {

        });
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_category: "",  //type of transaction
            form_amount: 0,     //Amount user entered
            post_total: 0,      //Variable to keep track of total budget
            budget: 0,
            list_show: false,
            post_list: [],
            expense_list: [],
            is_logged_in: false,
        },
        methods: {
            add_post: self.add_post,

            //Methods used for adding/subtracting budgets
            add_nums: self.add_nums,
            sub_nums: self.sub_nums,
            set_budget: self.set_budget,
            clear_budget: self.clear_budget
        }

    });

    // If we are logged in, shows the form to add posts.

    if (is_logged_in) {
        $("#Login").show();
        $("#add_post").show();
}

    // Gets the posts.
    self.get_posts();
    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
