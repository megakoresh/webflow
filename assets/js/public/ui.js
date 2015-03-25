function toForm(selector) {
     var el = $(selector);
     var span = $(selector+">span").first();
     var value = span.text();
   
     span.hide();
     var input = el.append("<input " +
     "type ='text' "+
     "class = 'change' "+     
     "value ='"+value+"'>");
   }
$(function(){  
/*  $('#username').on('click',function(){
    var username = $('#name').text();
    $('#name').remove();
    $(".pagecontent").first().prepend("<form class='form-inline' id = 'update'><input type='text' id = 'name' placeholder='"+username+"'></form>");
  });*/  
    
});