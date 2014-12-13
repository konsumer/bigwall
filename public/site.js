$(function(){  
  var socket = io.connect();

  function addPost(post){
    var el = bigpicture.newText(post.x, post.y, post.size, emojione.toImage(post.text));
    $(el).attr('id', post.uuid);
  }

  socket.on('user:update', function(c){
    $('#user .count').html(c);
    $('#user').addClass('new');
    setTimeout(function(){ $('#user').removeClass('new'); }, 3000);
  });

  socket.on('post:create', function(post){
    addPost(post);
  });

  socket.on('post:update', function(post){
    bigpicture.updateTextPosition(
      $('#' + post.uuid)
        .data('x', post.x)
        .data('y', post.y)
        .data('size', post.size)
        .html(emojione.toImage(post.text))
        .get(0)
    );
  });

  socket.on('post:remove', function(id){
    $('#' + post.uuid).remove();
  });

  socket.emit('hi', function(posts){
    _.each(posts, function(post){
      addPost(post);
    });
  });

  $('#bigpicture').on('keyup', '.text', function(e){
    var $e = $(e.target);
    var text = $e.html();
    var id = $e.attr('id');
    if (id){
      if(text == ''){
        socket.emit('post:remove', id);
      }else{
        var post = {
          uuid: id,
          x: $e.data('x'),
          y: $e.data('y'),
          size: $e.data('size'),
          text: emojione.toShort(text)
        };
        $e.html(emojione.toImage(text));
        socket.emit('post:update', post);
      }
    }else{
      var post = {
        x: $e.data('x'),
        y: $e.data('y'),
        size: $e.data('size'),
        text: emojione.toShort(text)
      };
      socket.emit('post:create', post, function(id){
        $e.attr('id', id);
      });
    }
  })

});