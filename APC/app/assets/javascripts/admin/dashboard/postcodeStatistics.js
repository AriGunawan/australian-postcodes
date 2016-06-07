google.charts.load("current", {packages:["corechart"]});
google.charts.setOnLoadCallback(drawChart);

function buildSearchStatisticsData(postcodes) {
  var result = [];
  for (var i = 0; i < postcodes.length; i++) {
    result.push([postcodes[i].code.toString(), postcodes[i].search_count]);
  }

  return result;
}

function buildSelectStatisticsData(postcodes) {
  var result = [];
  for (var i = 0; i < postcodes.length; i++) {
    result.push([postcodes[i].code.toString(), postcodes[i].select_count]);
  }

  return result;
}

function drawChart() {
  $.get('http://localhost:3001/api/v1/postcodes/statistics',
    function(data) {      
      var searchData = google.visualization.arrayToDataTable(buildSearchStatisticsData(data.postcodes), true);
      var selectData = google.visualization.arrayToDataTable(buildSelectStatisticsData(data.postcodes), true);

      var options = {
        is3D: true,
        sliceVisibilityThreshold: .04
      };

      var searchChart = new google.visualization.PieChart(document.getElementById('search-postcode-chart'));
      searchChart.draw(searchData, options);

      var selectChart = new google.visualization.PieChart(document.getElementById('select-postcode-chart'));
      selectChart.draw(selectData, options);
  });  
}