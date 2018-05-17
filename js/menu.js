function menu(){
  var div = '#id-select';
  var list = []
  for (var i = 1; i < 36; i++) {
    list.push(i);
  }

  var select = d3.select(div).text("Car-ID:")
    .append('select')
    	.attr('class','selectID')
      .attr('id','selectID' )
      .on('change',onchange);

      var options = select
        .selectAll('option')
      	.data(list)
        .enter()
      	.append('option')
      		.text(function (d) { return d; });

      function onchange() {
      	selected = document.getElementById("selectID").value;
        //console.log(selected);
        map.show(selected);
        //sp.selectDots(mlist.getValue());
      };




}
