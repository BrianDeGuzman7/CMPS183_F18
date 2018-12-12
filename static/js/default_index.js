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

    self.add_nums = function() {
        console.log(self.vue.post_total);
        var num1 = parseInt(self.vue.post_total);
        var num2 = parseInt(self.vue.form_amount);
        if (isNaN(num2)){
            return false;
        }
        self.vue.post_total = num1 + num2;
        console.log(self.vue.post_total);
        self.add_post();
    }

    self.sub_nums = function() {
        var num1 = parseInt(self.vue.post_total);
        var num2 = parseInt(self.vue.form_amount);
        if (isNaN(num2)){
            return false;
        }
        self.vue.post_total  = num1 - num2;
        console.log(self.vue.post_total);
        self.add_post();
    }

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy 
        var sent_category = self.vue.form_category; //
        var sent_amount = self.vue.post_total;
        var sent_expense = self.vue.form_amount;

        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_category: self.vue.form_category,
                post_total: self.vue.post_total,
                post_expense: self.vue.form_amount
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
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            // Did I like it? 
            // If I do e._smile = e.like, then Vue won't see the changes to e._smile . 
            Vue.set(e, '_smile', e.like); 

            Vue.set(e, '_debit', false);
        });
    };

    // Code for getting and displaying the list of likers. 
    self.show_likers = function(post_idx) {
        var p = self.vue.post_list[post_idx];
        p._show_likers = true;
        if (!p._likers_known) {
            $.getJSON(get_likers_url, {post_id: p.id}, function (data) {
                p._likers = data.likers
                p._likers_known = true;
            })
        }
    };

    self.hide_likers = function(post_idx) {
        var p = self.vue.post_list[post_idx];
        p._show_likers = false;
    };

    // Smile change code. 
    self.like_mouseover = function (post_idx) {
        // When we mouse over something, the face has to assume the opposite
        // of the current state, to indicate the effect.
        var p = self.vue.post_list[post_idx];
        p._smile = !p.like;
    };

    self.like_click = function (post_idx) {
        // The like status is toggled; the UI is not changed.
        var p = self.vue.post_list[post_idx];
        p.like = !p.like;
        // We need to post back the change to the server.
        $.post(set_like_url, {
            post_id: p.id,
            like: p.like
        }); // Nothing to do upon completion.
    };

    self.like_mouseout = function (post_idx) {
        // The like and smile status coincide again.
        var p = self.vue.post_list[post_idx];
        p._smile = p.like;
    };

    // Code for star ratings.
    self.stars_out = function (post_idx) {
        // Out of the star rating; set number of visible back to rating.
        var p = self.vue.post_list[post_idx];
        p._num_stars_display = p.rating;
    };

    self.stars_over = function(post_idx, star_idx) {
        // Hovering over a star; we show that as the number of active stars.
        var p = self.vue.post_list[post_idx];
        p._num_stars_display = star_idx;
    };

    self.set_stars = function(post_idx, star_idx) {
        // The user has set this as the number of stars for the post.
        var p = self.vue.post_list[post_idx];
        p.rating = star_idx;
        // Sends the rating to the server.
        $.post(set_stars_url, {
            post_id: p.id,
            rating: star_idx
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
            list_show: true,
            post_list: [],
            star_indices: [1, 2, 3, 4, 5],
            expense_list: [],
            is_logged_in: false,
        },
        methods: {
            add_post: self.add_post,
            // Likers. 
            like_mouseover: self.like_mouseover,
            like_mouseout: self.like_mouseout,
            like_click: self.like_click,
            // Show/hide who liked.
            show_likers: self.show_likers,
            hide_likers: self.hide_likers,
            // Star ratings.
            stars_out: self.stars_out,
            stars_over: self.stars_over,
            set_stars: self.set_stars,
            //numbs
            add_nums: self.add_nums,
            sub_nums: self.sub_nums
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
