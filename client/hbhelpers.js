// Pagination
// modified from https://github.com/olalonde/handlebars-paginate

Handlebars.registerHelper('paginate', function(pagination, options) {
  var type = options.hash.type || 'middle';
  var ret = '';
  var pageCount = Number(pagination.pageCount);
  var page = Number(pagination.page);
  var limit;
  if (options.hash.limit) limit = +options.hash.limit;

  //page pageCount
  var newContext = {};
  switch (type) {
    case 'middle':
      if (typeof limit === 'number') {
        var i = 0;
        var leftCount = Math.ceil(limit / 2) - 1;
        var rightCount = limit - leftCount - 1;
        if (page + rightCount > pageCount)
          leftCount = limit - (pageCount - page) - 1;
        if (page - leftCount < 1)
          leftCount = page - 1;
        var start = page - leftCount;

        while (i < limit && i < pageCount) {
          newContext = {
            n: start
          };
          if (start === page) newContext.active = true;
          ret = ret + options.fn(newContext);
          start++;
          i++;
        }
      } else {
        for (var index = 1; index <= pageCount; index++) {
          newContext = {
            n: index
          };
          if (index === page) newContext.active = true;
          ret = ret + options.fn(newContext);
        }
      }
      break;
    case 'previous':
      if (page === 1) {
        newContext = {
          disabled: true,
          n: 1
        };
      } else {
        newContext = {
          n: page - 1
        };
      }
      ret = ret + options.fn(newContext);
      break;
    case 'next':
      newContext = {};
      if (page === pageCount) {
        newContext = {
          disabled: true,
          n: pageCount
        };
      } else {
        newContext = {
          n: page + 1
        };
      }
      ret = ret + options.fn(newContext);
      break;
  }

  return ret;
});


// from https://gist.github.com/elidupuis/1468937
// iterate over a specific portion of a list.
Handlebars.registerHelper('slice', function(context, block) {
  var ret = "",
      offset = parseInt(block.hash.offset) || 0,
      limit = parseInt(block.hash.limit) || 5,
      i = (offset < context.length) ? offset : 0,
      j = ((limit + offset) < context.length) ? (limit + offset) : context.length;

  for(i,j; i<j; i++) {
    // ret += block(context[i]); // error handlebars > Handlebars 1.0.rc.1
    ret += block.fn(context[i]); // fixes > Handlebars 1.0.rc.1
  }

  return ret;
});