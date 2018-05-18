function menu(){
  var div = '#id-select';
  var div2 = '#starttime';
  var div3 = '#endtime';
  var div4 = '#update';

  var list = []
  var truck = [101,104,105,106,107];
  for (var i = 1; i < 36; i++) {
    list.push(i);
  }
  for (var i = 0; i < truck.length; i++) {
    list.push(truck[i]);
  }


  var select = d3.select(div).text("Car-ID:");
    //.append('select')
    //.attr('class','selectID')
      //.attr('id','selectID' );
      //.on('change',onchange);

      var options = select
        .selectAll('option')
      	.data(list)
        .enter()
      	//.append('option')
        .append('label')
        .text(function (d) { return d; })
        .append("input")
        .attr("type", "checkbox")
        .attr("id",function(d) { return d; })
        .on("click", onchange)
        ;

      var startTime = d3.select(div2).text("start: ")
      .append('input')
    .attr('type','text')
    .attr('name','textInput')
    .attr('id','startInput')
    .attr('value','01/06/2014 00:00:01');

    var startTime = d3.select(div3).text("End: ")
    .append('input')
  .attr('type','text')
  .attr('name','textInput')
  .attr('id','endInput')
  .attr('value','01/19/2014 23:59:59');


  var button = d3.select(div4)
  .append("input")
  .attr("type", "button")
  .attr('name', 'update')
  .attr('text', update)
  .attr('value','update')
  .on('click',onclick);


  function onclick(){/*
    var startD = document.getElementById("startInput").value;
    var endD = document.getElementById("endInput").value;
    var format = d3.utcParse('%m/%d/%Y %H:%M:%S');
    selected = document.getElementById("selectID").value;

      if (!isNaN(format(startD)) && !isNaN(format(endD)) && format(startD) < format(endD)) {
        map.show(selected, startD, endD);
    }*/


  }

      function onchange() {
        selected = this.id;
        console.log(selected);
        console.log(document.getElementById(selected).checked);
        //console.log(d3.selectby(select).property("checked"));
        if(document.getElementById(selected).checked){
          var format = d3.utcParse('%m/%d/%Y %H:%M:%S');
          var startD = document.getElementById("startInput").value;
          var endD = document.getElementById("endInput").value;
          if (!isNaN(format(startD)) && !isNaN(format(endD)) && format(startD) < format(endD)) {
            map.show(selected, startD, endD);
          }

        } else {
          map.remove(selected);
        }
      	/*selected = document.getElementById("selectID").value;
        //console.log(selected);
        var startD = document.getElementById("startInput").value;
        var endD = document.getElementById("endInput").value;
        var format = d3.utcParse('%m/%d/%Y %H:%M:%S');
        if (!isNaN(format(startD)) && !isNaN(format(endD)) && format(startD) < format(endD)) {
          map.show(selected, startD, endD);
        }*/

        //sp.selectDots(mlist.getValue());
      };




}
