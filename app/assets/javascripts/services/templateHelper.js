// // Some helpers related to working with Angular templates.
// app.factory('templateHelper', function() {
//   // Often, you'll need to pull out a set of parts from a template.
//   // Almost as often, you'll need to create D3 selections from these
//   // templates. So, this function does both for you.
//   // Input:
//   //  element: root search element.
//   //  selections: an array of [name, selector] pairs. If strings are included, they are assumed to be both a name and a class selector. The name is always normalized to camelCase (so foo-bar would become fooBar).
//   // Output: An object of the form:
//   // {
//   //    templated: A hash of $name -> jquery-wrapped selection.
//   //    d3Selected: A hash of name -> d3-select()-wrapped selection. If the selectors for a particular
//   //                entry matched more than one node, the first one is used.
//   // }
//   var findTemplateParts = function(element, selections) {
//     var jqSelections = _.transform(selections, function(result, sel, key) {
//       var name, selector;
//       if (_.isArray(sel)) {
//         name = sel[0];
//         selector = sel[1];
//       } else {
//         name = sel;
//         selector = '.' + sel;
//       }
//       name = name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
//       result["$"+name] = element.find(selector);
//       }, {});
//       // Make d3 selections out of the templated objects, we'll need (most of) them.
//       var d3SelectFirst = function($jqObject) {
//         return d3.select($jqObject[0]);
//       };
//       var d3Selection = _.transform(jqSelections, function(result, $jqObject, key) {
//         result[key.substr(1)] = d3SelectFirst($jqObject);
//       });

//       return {templated: jqSelections, d3Selected: d3Selection };
//   };

//   return { findTemplateParts: findTemplateParts };
// });

