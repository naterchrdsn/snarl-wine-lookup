var rest = require('restler');

module.exports = {
  vino: function(msg, cb) {
    var url = 'http://api.snooth.com/wines/?akey=wm7r1hx8cpg0t902nycy0jsnqsdpst1gi3vp1h24vvpdwmp4&mr=2';
    var q = [];
    var args = msg.text.split(' ').filter(function(x) {
      return x !== '!vino';
    });
    //lets help format a request
    if (args.length < 1) {
      cb(null, 'Did you mean to ask me about wine recommendations?\nYou can use some commands like so:\n```  -minprice: specify a minimum price\n  -maxprice: specify a maximum price\n  -num: specify a number of results to return (1-100)```\nMake sure to prefix commands with `-`\n\nFormat queries like this:\n`!vino napa valley cabernet sauvignon -maxprice 30`');
    }
    //strip out the query
    var query = args.join('+');
    query = query.slice(0, query.indexOf('-'));

    //are there extra flags used? if so, lets add them to the api query
    //hate old JS loops....
    for(var i = 0; i < args.length; i++) {
      var _this = args[i];
      //is it an arg?
      if (_this.toString().slice(0,1) == '-') {
        var arg = _this.toString().slice(_this.indexOf('-') + 1, _this.length);
        //what type of arg?
        switch (arg) {
          case 'minprice':
            url += '&mp='+args[i+1];
            break;
          case 'maxprice':
            url += '&xp='+args[i+1];
            break;
          case 'num':
            url += '&n='+args[i+1];
            break;
        }
      }
    }

    //if we have a query to search, lets make a call!
    if (query.length) {
      url += '&q=' + query;
      console.log(url);
      rest.get(url).on('complete', function(api) {
        var result = JSON.parse(api);
        console.log(result);
        if (typeof(result) !== 'undefined') {
          if (result.meta.status !== 0) {
            var winelist = 'Results:\n';
            //loop through results, and piece together a legible message
            for (var i=0;i<result.wines.length;i++) {
              winelist += i+': *Vintage Year & Name*: '+result.wines[i].vintage+' '+result.wines[i].name+'\n*Winery*: '+result.wines[i].winery+'\n*Price*: $'+result.wines[i].price+'  --  *SnoothRank*: '+result.wines[i].snoothrank+'\n*Link*: '+result.wines[i].link+'\n\n';
            }

            cb(null, winelist);
          } else {
            cb(null, 'There was an issue with your request, this is the error: ' + result.errmsg);
          }
        } else {
          cb(null, 'Damn, I\'ve never heard of that.  Where do I need to go to find it?');
        }
      });
    } else {
      return 'How about asking for something in specific?';
    }
  }
};
