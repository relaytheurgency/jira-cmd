/*global requirejs,console,define,fs*/

/* The goal here is to define a method for showing the comments of a jira in a 
 * readable way 
 *
 * TFW you read through the source code of comment.js and realize this functionality existed undocumented the whole time...*/

define([
  'superagent',
  'cli-table',
  '../../lib/config'
], function (request, Table, config) {

  var showcomments = {
    query: null,
    table: null,
    
    getComments: function () {
      var that = this;
      
      request
        .get(config.auth.url + this.query)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Basic ' + config.auth.token)
        .end(function (res) {
          if (!res.ok) {
            return console.log((res.body.errorMessages || [res.error]).join('\n'));
          }
          
          that.comments = res.body.fields.comment.comments;
          that.table = new Table({
            head: ['Author', 'Time', 'Comment'],
          });

          for (i = 0; i < that.comments.length; i++) {
            var author = that.comments[i].updateAuthor.displayName,
              commenttime = that.comments[i].updated,
              commenttext = that.comments[i].body

            if (commenttext.length > 100) {
              commenttext = commenttext.substr(0, 97) + '...';
            }

            that.table.push([
                author,
                commenttime,
                commenttext
            ]);
          }

          if (that.comments.length > 0) {
            console.log(that.table.toString());            
          } else {
            console.log('No comments');
          }
        });
    },

    show: function (issue) {
      this.query = 'rest/api/latest/issue/' + issue;
      return this.getComments();
    }

  };

  return showcomments;

});
