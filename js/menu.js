function menu(){
  var div = '#id-select';
  var div2 = '#starttime';
  var div3 = '#endtime';
  var div4 = '#update';

  var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

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
        .style('color', function(d){
          ind = list.findIndex(id => id == d) ;
          return colorArray[ind];
        })
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


  function onclick(){
    var startD = document.getElementById("startInput").value;
    var endD = document.getElementById("endInput").value;
    var format = d3.utcParse('%m/%d/%Y %H:%M:%S');
    var ids = [];
    var s = [101,104,105,106,107]
    for (var i = 1; i < 36; i++) {
      ids.push(i);
    }
    for (var i = 0; i < s.length; i++) {
      ids.push(s[i]);
    }
    for (var i = 0; i < ids.length; i++) {
      var selected = document.getElementById(ids[i]).checked;
      if (selected) {
        if (!isNaN(format(startD)) && !isNaN(format(endD)) && format(startD) < format(endD)) {
          map.remove(ids[i]);
          map.show(ids[i], startD, endD);
        }
      }


    }


    /*
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
