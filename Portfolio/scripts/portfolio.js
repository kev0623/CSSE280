// Add your JavaScript code here

document.addEventListener("DOMContentLoaded", function() {
    const portfolioItems = document.querySelectorAll("#portfolioItems li");
  
    portfolioItems.forEach(function(item) {
      item.addEventListener("mouseover", function() {
        this.style.transform = "scale(1.02)";
        this.style.transition = "transform 0.2s ease";
      });
  
      item.addEventListener("mouseout", function() {
        this.style.transform = "scale(1)";
        this.style.transition = "transform 0.2s ease";
      });
    });
  });
  