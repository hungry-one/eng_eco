var gaul = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
var state = gaul.filter(ee.Filter.eq('ADM2_NAME', 'Bangalore Urban'))
print(state)
Map.addLayer(state)

var attribute = "Aerosol_Optical_Depth_Land_Ocean_Mean_Mean";
var dataset = "MODIS/061/MOD08_M3";
var collection = ee.ImageCollection(dataset)
                  .select(attribute)
                  .filterDate('2019-01-01', '2019-12-31');
                  
print(collection.size())

function getRegions(Icol, features) {
  return Icol.map(function(image){
    var means = image.reduceRegions({
      reducer: ee.Reducer.mean(),
      collection: features.select(["ADM1_NAME","ADM2_NAME","ADM0_NAME"]),
      scale: 10
    }).filter(ee.Filter.notNull(["mean"]))
    .map(function(f) {
      return f.set('date', image.date().format())
    })
    return means
  }).flatten()
}

var ts_table = getRegions(collection.select([attribute]), state);
print(ts_table)
Export.table.toDrive({
  collection: ts_table,
  description: attribute,
  fileFormat: 'CSV'
});
