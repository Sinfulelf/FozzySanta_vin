document.addEventListener('DOMContentLoaded', function() {
  var tab = M.Tabs.init(document.getElementById('nav-tabs'), {
    //swipeable: true,
    duration: 300
  });

  var instances = M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
    
  });
});